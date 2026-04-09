import { Hono } from 'npm:hono@4';
import { 
  kv, 
  requireAuth,
  requirePermission,
  type User
} from './helpers.tsx';

const app = new Hono();

// ========== TYPE DEFINITIONS ==========

export interface Customer {
  id: string;
  phone: string;              // Primary identifier (required, unique)
  full_name: string;
  email?: string;
  date_of_birth?: string;     // ISO format YYYY-MM-DD
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;             // Staff notes
  total_visits: number;       // Counter
  total_spent: number;        // VND
  membership_id?: string;     // Link to membership
  created_at: string;
  created_by: string;         // Staff/Admin ID
  updated_at?: string;
  last_visit?: string;        // ISO timestamp
  is_deleted?: boolean;       // Soft delete flag
}

// ========== HELPER FUNCTIONS ==========

/**
 * Normalize phone number: remove spaces, dashes, parentheses
 * Example: "(090) 123-4567" -> "0901234567"
 */
const normalizePhone = (phone: string): string => {
  return phone.replace(/[\s\-\(\)]/g, '');
};

/**
 * Validate Vietnamese phone number
 * Format: 10 digits, starts with 0
 */
const isValidPhone = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  return /^0\d{9}$/.test(normalized);
};

/**
 * Generate unique customer ID
 */
const generateCustomerId = (): string => {
  return `customer_${crypto.randomUUID()}`;
};

/**
 * Search customers by phone or name (fuzzy)
 */
const searchCustomers = async (query: string, limit: number = 20): Promise<Customer[]> => {
  const allCustomers = await kv.getByPrefix('customer:');
  
  // Filter out deleted customers
  let activeCustomers = allCustomers.filter((c: Customer) => !c.is_deleted);
  
  if (!query || query.trim() === '') {
    // Return first N customers if no query
    return activeCustomers.slice(0, limit);
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Search by phone (exact or partial) or name (fuzzy)
  const results = activeCustomers.filter((c: Customer) => {
    const phoneMatch = c.phone.includes(lowerQuery);
    const nameMatch = c.full_name.toLowerCase().includes(lowerQuery);
    const emailMatch = c.email?.toLowerCase().includes(lowerQuery);
    return phoneMatch || nameMatch || emailMatch;
  });
  
  return results.slice(0, limit);
};

// ========== CUSTOMER CRUD ROUTES ==========

/**
 * GET /customers
 * List all customers (with pagination and filtering)
 * Auth: Admin/Staff with can_manage_appointments permission
 */
app.get('/make-server-84f9c112/customers', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const membershipFilter = c.req.query('membership_id'); // Optional filter by membership

    const allCustomers = await kv.getByPrefix('customer:');
    
    // Filter out deleted customers
    let activeCustomers = allCustomers.filter((c: Customer) => !c.is_deleted);
    
    // Apply membership filter if provided
    if (membershipFilter) {
      activeCustomers = activeCustomers.filter((c: Customer) => c.membership_id === membershipFilter);
    }
    
    // Sort by creation date (newest first)
    activeCustomers.sort((a: Customer, b: Customer) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = activeCustomers.slice(startIndex, endIndex);

    return c.json({
      success: true,
      data: {
        customers: paginatedCustomers,
        pagination: {
          page,
          limit,
          total: activeCustomers.length,
          totalPages: Math.ceil(activeCustomers.length / limit),
        }
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /customers
 * Create new customer
 * Auth: Admin/Staff with can_manage_appointments permission
 */
app.post('/make-server-84f9c112/customers', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const currentUser = c.get('user');
    const { phone, full_name, email, date_of_birth, gender, address, notes } = await c.req.json();

    // Validate required fields
    if (!phone || !full_name) {
      return c.json({ success: false, error: 'Missing required fields: phone, full_name' }, 400);
    }
    
    // Normalize and validate phone
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return c.json({ success: false, error: 'Invalid phone number format (must be 10 digits, start with 0)' }, 400);
    }
    
    // Check if phone already exists
    const existingCustomerKey = await kv.get(`customer_phone:${normalizedPhone}`);
    if (existingCustomerKey) {
      const existingCustomer = await kv.get(existingCustomerKey);
      if (existingCustomer && !existingCustomer.is_deleted) {
        return c.json({ 
          success: false, 
          error: 'Phone number already registered',
          existing_customer_id: existingCustomer.id
        }, 400);
      }
    }
    
    // Generate customer ID
    const customerId = generateCustomerId();
    
    // Create customer record
    const newCustomer: Customer = {
      id: customerId,
      phone: normalizedPhone,
      full_name,
      email: email || undefined,
      date_of_birth: date_of_birth || undefined,
      gender: gender || undefined,
      address: address || undefined,
      notes: notes || undefined,
      total_visits: 0,
      total_spent: 0,
      created_at: new Date().toISOString(),
      created_by: currentUser.sub, // From JWT
      is_deleted: false,
    };
    
    // Save to KV
    await kv.set(`customer:${customerId}`, newCustomer);
    
    // Create phone lookup index
    await kv.set(`customer_phone:${normalizedPhone}`, `customer:${customerId}`);
    
    // Create email lookup index (if provided)
    if (email) {
      await kv.set(`customer_email:${email.toLowerCase()}`, `customer:${customerId}`);
    }

    return c.json({
      success: true,
      data: newCustomer,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /customers/:id
 * Get customer details
 * Auth: Required (any authenticated user)
 */
app.get('/make-server-84f9c112/customers/:id', requireAuth, async (c) => {
  try {
    const customerId = c.req.param('id');

    const customer = await kv.get(`customer:${customerId}`);

    if (!customer || customer.is_deleted) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }

    return c.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * PUT /customers/:id
 * Update customer information
 * Auth: Admin/Staff with can_manage_appointments permission
 */
app.put('/make-server-84f9c112/customers/:id', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const currentUser = c.get('user');
    const customerId = c.req.param('id');
    const updates = await c.req.json();

    // Get existing customer
    const customer = await kv.get(`customer:${customerId}`);
    
    if (!customer || customer.is_deleted) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }
    
    // If updating phone, validate and check for duplicates
    if (updates.phone && updates.phone !== customer.phone) {
      const normalizedPhone = normalizePhone(updates.phone);
      
      if (!isValidPhone(normalizedPhone)) {
        return c.json({ success: false, error: 'Invalid phone number format' }, 400);
      }
      
      // Check if new phone already exists
      const existingCustomerKey = await kv.get(`customer_phone:${normalizedPhone}`);
      if (existingCustomerKey) {
        const existingCustomer = await kv.get(existingCustomerKey);
        if (existingCustomer && existingCustomer.id !== customerId && !existingCustomer.is_deleted) {
          return c.json({ success: false, error: 'Phone number already registered to another customer' }, 400);
        }
      }
      
      // Delete old phone index
      await kv.mdel([`customer_phone:${customer.phone}`]);
      
      // Create new phone index
      await kv.set(`customer_phone:${normalizedPhone}`, `customer:${customerId}`);
      
      updates.phone = normalizedPhone;
    }
    
    // If updating email, update email index
    if (updates.email && updates.email !== customer.email) {
      // Delete old email index if exists
      if (customer.email) {
        await kv.mdel([`customer_email:${customer.email.toLowerCase()}`]);
      }
      
      // Create new email index
      if (updates.email) {
        await kv.set(`customer_email:${updates.email.toLowerCase()}`, `customer:${customerId}`);
      }
    }
    
    // Update customer
    const updatedCustomer: Customer = {
      ...customer,
      full_name: updates.full_name ?? customer.full_name,
      phone: updates.phone ?? customer.phone,
      email: updates.email !== undefined ? updates.email : customer.email,
      date_of_birth: updates.date_of_birth !== undefined ? updates.date_of_birth : customer.date_of_birth,
      gender: updates.gender ?? customer.gender,
      address: updates.address !== undefined ? updates.address : customer.address,
      notes: updates.notes !== undefined ? updates.notes : customer.notes,
      membership_id: updates.membership_id !== undefined ? updates.membership_id : customer.membership_id,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`customer:${customerId}`, updatedCustomer);

    return c.json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * DELETE /customers/:id
 * Soft delete customer (Owner only)
 * Auth: Owner only
 */
app.delete('/make-server-84f9c112/customers/:id', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    const customerId = c.req.param('id');

    // Only owner can delete customers
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can delete customers' }, 403);
    }
    
    // Get existing customer
    const customer = await kv.get(`customer:${customerId}`);
    
    if (!customer) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }
    
    // Soft delete (set flag instead of removing from KV)
    const deletedCustomer: Customer = {
      ...customer,
      is_deleted: true,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(`customer:${customerId}`, deletedCustomer);

    return c.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * POST /customers/search
 * Search customers by phone/name/email
 * Auth: Admin/Staff with can_manage_appointments permission
 */
app.post('/make-server-84f9c112/customers/search', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const { query, limit } = await c.req.json();

    const results = await searchCustomers(query, limit || 20);

    return c.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /customers/:id/history
 * Get customer history (visits, transactions)
 * Auth: Admin/Staff with can_manage_appointments permission
 * 
 * NOTE: This is a placeholder for future implementation.
 * Currently returns basic metrics from customer record.
 */
app.get('/make-server-84f9c112/customers/:id/history', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const customerId = c.req.param('id');

    const customer = await kv.get(`customer:${customerId}`);

    if (!customer || customer.is_deleted) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }
    
    // TODO: In the future, fetch actual appointment/transaction history
    // For now, return aggregated metrics from customer record
    
    const history = {
      customer_id: customer.id,
      full_name: customer.full_name,
      phone: customer.phone,
      metrics: {
        total_visits: customer.total_visits,
        total_spent: customer.total_spent,
        last_visit: customer.last_visit,
        member_since: customer.created_at,
        membership_status: customer.membership_id ? 'Active' : 'None',
      },
      // Placeholder for future appointment/transaction data
      appointments: [],
      transactions: [],
    };

    return c.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== PUBLIC ROUTES (NO AUTH) ==========

/**
 * POST /customers/check-in
 * Customer check-in at store (increment visit counter)
 * Auth: None (public endpoint with phone verification)
 * 
 * This endpoint is for physical check-in at the store.
 * Staff can verify customer by phone number.
 */
app.post('/make-server-84f9c112/customers/check-in', async (c) => {
  try {
    const { phone } = await c.req.json();

    if (!phone) {
      return c.json({ success: false, error: 'Phone number required' }, 400);
    }
    
    const normalizedPhone = normalizePhone(phone);
    
    // Find customer by phone
    const customerKey = await kv.get(`customer_phone:${normalizedPhone}`);
    
    if (!customerKey) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }

    const customer = await kv.get(customerKey);

    if (!customer || customer.is_deleted) {
      return c.json({ success: false, error: 'Customer not found' }, 404);
    }
    
    // Increment visit counter and update last visit
    const updatedCustomer: Customer = {
      ...customer,
      total_visits: customer.total_visits + 1,
      last_visit: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(customerKey, updatedCustomer);

    return c.json({
      success: true,
      data: {
        customer_name: customer.full_name,
        total_visits: updatedCustomer.total_visits,
        membership_status: customer.membership_id ? 'Active' : 'None',
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * GET /customers/profile
 * Get customer's own profile (for customer app)
 * Auth: Required (customer must be authenticated)
 * 
 * NOTE: This is a placeholder for future customer authentication system.
 * Currently requires staff authentication.
 */
app.get('/make-server-84f9c112/customers/profile', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // TODO: Implement customer authentication
    // For now, this endpoint requires staff auth

    return c.json({
      success: false,
      error: 'Customer authentication not yet implemented',
    }, 501);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app };
