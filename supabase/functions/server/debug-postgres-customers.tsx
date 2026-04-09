/**
 * DEBUG POSTGRES CUSTOMERS
 * Direct query to customer_profiles table to verify schema and data
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

/**
 * GET /debug-postgres/customers/schema
 * Check table schema
 */
app.get('/make-server-84f9c112/debug-postgres/customers/schema', async (c) => {
  try {
    // Query table with limit 1 to see structure
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      return c.json({
        success: false,
        error: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      }, 500);
    }
    
    if (!data || data.length === 0) {
      return c.json({
        success: true,
        message: 'Table exists but contains no data',
        sample: null
      });
    }

    return c.json({
      success: true,
      columns: Object.keys(data[0]),
      sample_record: data[0]
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /debug-postgres/customers/count
 * Count total customers
 */
app.get('/make-server-84f9c112/debug-postgres/customers/count', async (c) => {
  try {
    const { count, error } = await supabase
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }

    return c.json({
      success: true,
      total: count
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /debug-postgres/customers/list
 * List first 10 customers
 */
app.get('/make-server-84f9c112/debug-postgres/customers/list', async (c) => {
  try {
    const { data: customers, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .limit(10);
    
    if (error) {
      return c.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      }, 500);
    }

    return c.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export { app as debugPostgresCustomersApp };
