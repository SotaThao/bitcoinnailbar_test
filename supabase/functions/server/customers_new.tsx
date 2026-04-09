/**
 * CUSTOMERS API - New Implementation
 * Uses kv_store_customers table
 * Supports US & VN regions
 */

import { Hono } from 'npm:hono@4';
import { 
  requireAuth,
  requirePermission,
  type User
} from './helpers.tsx';
import { customerKV } from './kv_store_customers.tsx';

const app = new Hono();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CustomerUS {
  id: string;                    // customer_us:5551234567
  phone: string;                 // Raw: 5551234567
  phone_display: string;         // Formatted: (555) 123-4567
  full_name: string;
  region: 'US';
  
  // Optional
  email?: string;
  date_of_birth?: string;        // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  
  // Statistics
  total_visits: number;
  total_spent: number;           // USD
  last_visit?: string;
  appointment_ids: string[];     // ← Array of appointment IDs
  
  // Membership
  membership?: {
    id: string;
    tier: string;
    amount: number;              // ← Amount for comparison (not shown in FE)
    activated_at: string;
    expires_at: string;
    status: 'active' | 'expired';
    benefits: string[];
    redeem_code?: string;
  };
  
  // Metadata
  created_at: string;
  created_by: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export interface CustomerVN {
  id: string;                    // customer_vn:uuid
  phone: string;                 // Raw: 0901234567
  phone_display: string;         // Formatted: 0901.234.567
  full_name: string;
  region: 'VN';
  
  // Same structure as US
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  total_visits: number;
  total_spent: number;           // VND
  last_visit?: string;
  appointment_ids: string[];     // ← Array of appointment IDs
  membership?: {
    id: string;
    tier: string;
    amount: number;              // ← Amount for comparison (not shown in FE)
    activated_at: string;
    expires_at: string;
    status: 'active' | 'expired';
    benefits: string[];
    redeem_code?: string;
  };
  created_at: string;
  created_by: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export type Customer = CustomerUS | CustomerVN;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHONE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Normalize phone: Remove all non-digits
 */
const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Validate US phone: 10 digits
 */
const isValidPhoneUS = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  return /^\d{10}$/.test(normalized);
};

/**
 * Validate VN phone: 10 digits, starts with 0
 */
const isValidPhoneVN = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  return /^0\d{9}$/.test(normalized);
};

/**
 * Format US phone: 5551234567 → (555) 123-4567
 */
const formatPhoneUS = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return phone;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
};

/**
 * Format VN phone: 0901234567 → 0901.234.567
 */
const formatPhoneVN = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return phone;
  return `${normalized.slice(0, 4)}.${normalized.slice(4, 7)}.${normalized.slice(7)}`;
};

/**
 * Detect region from phone
 */
const detectRegion = (phone: string): 'US' | 'VN' | null => {
  const normalized = normalizePhone(phone);
  // HARDCODED: Always return US for now (US market only)
  if (/^\d{10}$/.test(normalized)) return 'US';
  return null;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * List customers with pagination
 */
app.get('/make-server-84f9c112/customers', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get customers (US market only - no region filter)
    const customers = await customerKV.getAll(limit, offset);
    const totalCount = await customerKV.countAll();
    const totalPages = Math.ceil(totalCount / limit);

    return c.json({
      success: true,
      data: {
        customers,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount
        }
      }
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch customers'
    }, 500);
  }
});

/**
 * POST /customers
 * Create new customer
 */
app.post('/make-server-84f9c112/customers', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const currentUser = c.get('user') as User;
    const body = await c.req.json();
    const { phone, full_name, email, date_of_birth, gender, address, notes, region } = body;
    
    // Validate required fields
    if (!phone || !full_name) {
      return c.json({
        success: false,
        error: 'Phone and full name are required'
      }, 400);
    }
    
    // Normalize phone
    const normalizedPhone = normalizePhone(phone);
    
    // Determine region
    const customerRegion = region || detectRegion(normalizedPhone);
    if (!customerRegion) {
      return c.json({
        success: false,
        error: 'Invalid phone number format'
      }, 400);
    }
    
    // Validate phone based on region
    if (customerRegion === 'US' && !isValidPhoneUS(normalizedPhone)) {
      return c.json({
        success: false,
        error: 'Invalid US phone number. Must be 10 digits.'
      }, 400);
    }
    
    if (customerRegion === 'VN' && !isValidPhoneVN(normalizedPhone)) {
      return c.json({
        success: false,
        error: 'Invalid VN phone number. Must be 10 digits starting with 0.'
      }, 400);
    }
    
    // Check if phone already exists
    const existing = await customerKV.searchByPhone(normalizedPhone);
    if (existing && !existing.is_deleted) {
      return c.json({
        success: false,
        error: 'Phone number already exists'
      }, 400);
    }
    
    // Generate key
    const key = customerRegion === 'US' 
      ? `customer_us:${normalizedPhone}`
      : `customer_vn:${crypto.randomUUID()}`;
    
    // Format phone for display
    const phoneDisplay = customerRegion === 'US'
      ? formatPhoneUS(normalizedPhone)
      : formatPhoneVN(normalizedPhone);
    
    // Create customer object
    const customer: Customer = {
      id: key,
      phone: normalizedPhone,
      phone_display: phoneDisplay,
      full_name,
      region: customerRegion,
      email: email || undefined,
      date_of_birth: date_of_birth || undefined,
      gender: gender || undefined,
      address: address || undefined,
      notes: notes || undefined,
      total_visits: 0,
      total_spent: 0,
      appointment_ids: [], // Initialize empty array
      created_at: new Date().toISOString(),
      created_by: currentUser.id,
      is_deleted: false
    };
    
    // Save to DB
    await customerKV.set(key, customer);

    return c.json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to create customer'
    }, 500);
  }
});

/**
 * GET /customers/:id
 * Get customer details
 */
app.get('/make-server-84f9c112/customers/:id', requireAuth, async (c) => {
  try {
    const customerId = c.req.param('id');
    
    const customer = await customerKV.get(customerId);
    
    if (!customer || customer.is_deleted) {
      return c.json({
        success: false,
        error: 'Customer not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: customer
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch customer'
    }, 500);
  }
});

/**
 * PUT /customers/:id
 * Update customer
 */
app.put('/make-server-84f9c112/customers/:id', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const currentUser = c.get('user') as User;
    const customerId = c.req.param('id');
    const updates = await c.req.json();
    
    // Get existing customer
    const customer = await customerKV.get(customerId);
    
    if (!customer || customer.is_deleted) {
      return c.json({
        success: false,
        error: 'Customer not found'
      }, 404);
    }
    
    // Update allowed fields
    const updatedCustomer = {
      ...customer,
      full_name: updates.full_name !== undefined ? updates.full_name : customer.full_name,
      email: updates.email !== undefined ? updates.email : customer.email,
      date_of_birth: updates.date_of_birth !== undefined ? updates.date_of_birth : customer.date_of_birth,
      gender: updates.gender !== undefined ? updates.gender : customer.gender,
      address: updates.address !== undefined ? updates.address : customer.address,
      notes: updates.notes !== undefined ? updates.notes : customer.notes,
      membership: updates.membership !== undefined ? updates.membership : customer.membership,
      updated_at: new Date().toISOString()
    };
    
    // Save
    await customerKV.set(customerId, updatedCustomer);

    return c.json({
      success: true,
      data: updatedCustomer
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to update customer'
    }, 500);
  }
});

/**
 * DELETE /customers/:id
 * Soft delete customer (Owner only)
 */
app.delete('/make-server-84f9c112/customers/:id', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user') as User;
    const customerId = c.req.param('id');
    
    // Only owner can delete
    if (currentUser.role !== 'owner') {
      return c.json({
        success: false,
        error: 'Only owner can delete customers'
      }, 403);
    }
    
    // Get customer
    const customer = await customerKV.get(customerId);
    
    if (!customer) {
      return c.json({
        success: false,
        error: 'Customer not found'
      }, 404);
    }
    
    // Soft delete
    customer.is_deleted = true;
    customer.updated_at = new Date().toISOString();
    
    await customerKV.set(customerId, customer);

    return c.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to delete customer'
    }, 500);
  }
});

/**
 * POST /customers/search
 * Search customers
 */
app.post('/make-server-84f9c112/customers/search', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const { query, region, limit } = await c.req.json();
    
    if (!query) {
      return c.json({
        success: false,
        error: 'Search query is required'
      }, 400);
    }
    
    const results = await customerKV.search(query, region, limit || 20);

    return c.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to search customers'
    }, 500);
  }
});

export { app as customersApp };