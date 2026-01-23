/**
 * DEBUG CUSTOMERS ENDPOINT
 * Test and verify customer data in kv_store_customers
 */

import { Hono } from 'npm:hono@4';
import { customerKV } from './kv_store_customers.tsx';

const app = new Hono();

/**
 * GET /debug-customers/all
 * List all customers in database
 */
app.get('/make-server-84f9c112/debug-customers/all', async (c) => {
  try {
    console.log('🔍 [DEBUG CUSTOMERS] Fetching all customers...');
    
    const customers = await customerKV.getAll(100, 0);
    const count = await customerKV.countAll();
    
    console.log(`✅ [DEBUG CUSTOMERS] Found ${count} total customers`);
    console.log(`✅ [DEBUG CUSTOMERS] Returning ${customers.length} customers`);
    
    return c.json({
      success: true,
      total_count: count,
      returned_count: customers.length,
      customers: customers.map(c => ({
        id: c.id,
        phone: c.phone,
        full_name: c.full_name,
        email: c.email,
        has_membership: !!c.membership,
        membership: c.membership ? {
          tier: c.membership.tier,
          status: c.membership.status,
          expires_at: c.membership.expires_at
        } : null
      }))
    });
  } catch (error: any) {
    console.error('❌ [DEBUG CUSTOMERS] Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /debug-customers/search/:identifier
 * Search customer by phone or email
 */
app.get('/make-server-84f9c112/debug-customers/search/:identifier', async (c) => {
  try {
    const identifier = c.req.param('identifier');
    console.log('🔍 [DEBUG CUSTOMERS] Searching for:', identifier);
    
    const isEmail = identifier.includes('@');
    let customer;
    
    if (isEmail) {
      customer = await customerKV.searchByEmail(identifier.trim());
    } else {
      const normalized = identifier.replace(/\D/g, '');
      customer = await customerKV.searchByPhone(normalized);
    }
    
    if (!customer) {
      return c.json({
        success: true,
        found: false,
        message: 'Customer not found'
      });
    }
    
    console.log('✅ [DEBUG CUSTOMERS] Found customer:', customer.id);
    
    return c.json({
      success: true,
      found: true,
      customer: {
        ...customer,
        // Full details
      }
    });
  } catch (error: any) {
    console.error('❌ [DEBUG CUSTOMERS] Error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export { app as debugCustomersApp };
