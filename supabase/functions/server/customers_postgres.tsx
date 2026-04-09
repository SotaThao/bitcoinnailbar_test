/**
 * CUSTOMERS API - Postgres Implementation
 * Uses customer_profiles table (Postgres)
 * Migrated from KV Store to relational DB
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { 
  requireAuth,
  requirePermission,
  type User
} from './helpers.tsx';

const app = new Hono();

// Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

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
 * Format US phone: 5551234567 → (555) 123-4567
 */
const formatPhoneUS = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) return phone;
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESPONSE TRANSFORMER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Transform Postgres customer to KV Store format for frontend compatibility
 */
const transformCustomerResponse = (customer: any) => {
  // Check if customer has active membership (tier is not 'guest' and has valid dates)
  const hasMembership = customer.tier && customer.tier !== 'guest' && customer.membership_end_date;
  
  // Determine membership status
  let membershipStatus = 'expired';
  if (hasMembership && customer.membership_end_date) {
    const now = new Date();
    const endDate = new Date(customer.membership_end_date);
    membershipStatus = endDate > now ? 'active' : 'expired';
  }

  return {
    id: customer.id, // UUID
    phone: customer.phone,
    phone_display: formatPhoneUS(customer.phone),
    full_name: customer.full_name,
    email: customer.email,
    date_of_birth: customer.date_of_birth,
    gender: customer.gender,
    address: customer.address,
    notes: customer.notes,
    
    // Statistics (renamed fields)
    total_visits: customer.total_visits || 0,
    total_spent: customer.lifetime_spend || 0, // Renamed from lifetime_spend
    last_visit: customer.last_visit_date, // Renamed from last_visit_date
    
    // Membership (flattened from separate fields)
    // ✅ FIX: Check tier instead of membership_id (which doesn't exist in Postgres)
    membership: hasMembership ? {
      id: `mem_${customer.id}`, // Generate pseudo membership ID
      tier: customer.tier,
      amount: customer.membership_amount || 0,
      status: membershipStatus,
      activated_at: customer.membership_start_date,
      expires_at: customer.membership_end_date,
      benefits: [], // TODO: Load from tier config
    } : undefined,
    
    created_at: customer.created_at,
    updated_at: customer.updated_at,
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /customers
 * List customers with pagination
 */
app.get('/make-server-84f9c112/customers', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    // Count total (for pagination)
    const { count, error: countError } = await supabase
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'suspended'); // Exclude suspended (soft delete)
    
    if (countError) {
      throw countError;
    }
    
    // Fetch customers
    const { data: customers, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .neq('status', 'suspended') // Exclude suspended
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw error;
    }
    
    // Transform for frontend
    const transformedCustomers = customers.map(transformCustomerResponse);

    return c.json({
      success: true,
      data: {
        customers: transformedCustomers,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
          totalCount: count || 0
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
 * Create new customer (manual admin action)
 */
app.post('/make-server-84f9c112/customers', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const currentUser = c.get('user') as User;
    const body = await c.req.json();
    const { phone, full_name, email, date_of_birth, gender, address, notes } = body;
    
    // Validate required fields
    if (!phone || !full_name) {
      return c.json({
        success: false,
        error: 'Phone and full name are required'
      }, 400);
    }
    
    // Normalize phone
    const normalizedPhone = normalizePhone(phone);
    
    // Validate phone
    if (!isValidPhoneUS(normalizedPhone)) {
      return c.json({
        success: false,
        error: 'Invalid US phone number. Must be 10 digits.'
      }, 400);
    }
    
    // Check if phone already exists
    const { data: existing, error: checkError } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('phone', normalizedPhone)
      .neq('status', 'suspended')
      .maybeSingle();
    
    if (checkError) {
      throw checkError;
    }
    
    if (existing) {
      return c.json({
        success: false,
        error: 'Phone number already exists'
      }, 400);
    }
    
    // Create customer (Postgres will auto-generate UUID via DEFAULT gen_random_uuid())
    const { data: customer, error } = await supabase
      .from('customer_profiles')
      .insert({
        phone: normalizedPhone,
        email,
        full_name,
        date_of_birth,
        gender,
        address,
        notes,
        tier: 'guest',
        status: 'active',
        total_visits: 0,
        lifetime_spend: 0,
        loyalty_points: 0,
        marketing_opt_in: true,
        sms_opt_in: false,
        preferred_language: 'en',
        created_by: currentUser.id,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      data: transformCustomerResponse(customer)
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
    
    const { data: customer, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', customerId)
      .neq('status', 'suspended')
      .single();
    
    if (error || !customer) {
      return c.json({
        success: false,
        error: 'Customer not found'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: transformCustomerResponse(customer)
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
    const customerId = c.req.param('id');
    const updates = await c.req.json();
    
    // Get existing customer
    const { data: existing, error: fetchError } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', customerId)
      .neq('status', 'suspended')
      .single();
    
    if (fetchError || !existing) {
      return c.json({
        success: false,
        error: 'Customer not found'
      }, 404);
    }
    
    // Update customer
    const { data: customer, error } = await supabase
      .from('customer_profiles')
      .update({
        full_name: updates.full_name !== undefined ? updates.full_name : existing.full_name,
        email: updates.email !== undefined ? updates.email : existing.email,
        date_of_birth: updates.date_of_birth !== undefined ? updates.date_of_birth : existing.date_of_birth,
        gender: updates.gender !== undefined ? updates.gender : existing.gender,
        address: updates.address !== undefined ? updates.address : existing.address,
        notes: updates.notes !== undefined ? updates.notes : existing.notes,
        // updated_at handled by trigger
      })
      .eq('id', customerId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      data: transformCustomerResponse(customer)
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
 * Soft delete customer (set status = 'suspended')
 * Owner only
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
    
    // Soft delete (set status = suspended)
    const { error } = await supabase
      .from('customer_profiles')
      .update({ status: 'suspended' })
      .eq('id', customerId);
    
    if (error) {
      throw error;
    }

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
 * Search customers by phone/name/email
 */
app.post('/make-server-84f9c112/customers/search', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const { query, limit } = await c.req.json();
    
    if (!query) {
      return c.json({
        success: false,
        error: 'Search query is required'
      }, 400);
    }
    
    const searchLimit = limit || 20;
    
    // Search by phone, name, or email
    const { data: customers, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .neq('status', 'suspended')
      .or(`phone.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(searchLimit);
    
    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      data: customers.map(transformCustomerResponse)
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to search customers'
    }, 500);
  }
});

export { app as customersApp };