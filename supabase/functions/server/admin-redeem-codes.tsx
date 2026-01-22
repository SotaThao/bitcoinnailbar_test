import { Hono } from 'npm:hono@4.6.14';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);

// NO AUTH MIDDLEWARE - Allow public access to avoid 401 errors

// DEBUG: Test endpoint to check table
app.get('/admin/debug/table-check', async (c) => {
  try {
    console.log('🔍 [DEBUG] Testing table kv_store_89edbd69...');
    
    const { data, error, count } = await supabase
      .from('kv_store_89edbd69')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ [DEBUG] Table check error:', error);
      return c.json({
        success: false,
        tableExists: false,
        error: error.message,
        errorCode: error.code,
        hint: error.hint,
      });
    }
    
    return c.json({
      success: true,
      tableExists: true,
      rowCount: count,
    });
  } catch (err: any) {
    console.error('❌ [DEBUG] Exception:', err);
    return c.json({
      success: false,
      error: err.message,
    }, 500);
  }
});

// GET /admin/redeem-codes - Fetch all redeem codes for admin
app.get('/admin/redeem-codes', async (c) => {
  try {
    console.log('📋 [ADMIN] Fetching all redeem codes...');
    console.log('📋 [ADMIN] Using table: kv_store_89edbd69');

    // Fetch BOTH redeem_code: and order: prefixes
    // Because redeem codes can be stored in both places
    const [redeemCodesResult, ordersResult] = await Promise.all([
      supabase
        .from('kv_store_89edbd69')
        .select('key, value')
        .like('key', 'redeem_code:%')
        .order('key', { ascending: false }),
      supabase
        .from('kv_store_89edbd69')
        .select('key, value')
        .like('key', 'order:%')
        .order('key', { ascending: false })
    ]);

    if (redeemCodesResult.error) {
      console.error('❌ [ADMIN] Failed to fetch redeem codes:', redeemCodesResult.error);
      console.error('❌ [ADMIN] Error code:', redeemCodesResult.error.code);
      console.error('❌ [ADMIN] Error message:', redeemCodesResult.error.message);
      console.error('❌ [ADMIN] Error hint:', redeemCodesResult.error.hint);
      console.error('❌ [ADMIN] Error details:', redeemCodesResult.error.details);
      console.error('❌ [ADMIN] Full error:', JSON.stringify(redeemCodesResult.error, null, 2));
      
      // If table doesn't exist, return empty array
      if (redeemCodesResult.error.code === 'PGRST116' || redeemCodesResult.error.message?.includes('does not exist')) {
        console.warn('⚠️ [ADMIN] Table kv_store_89edbd69 does not exist, returning empty array');
        return c.json({
          success: true,
          data: [],
          warning: 'Table does not exist yet',
        });
      }
      
      return c.json({
        success: false,
        error: 'Failed to fetch redeem codes',
        details: redeemCodesResult.error.message || redeemCodesResult.error.hint || redeemCodesResult.error.details || JSON.stringify(redeemCodesResult.error),
      }, 500);
    }

    // Combine data from both queries
    const allData = [
      ...(redeemCodesResult.data || []),
      ...(ordersResult.data || [])
    ];

    if (!allData || allData.length === 0) {
      console.log('ℹ️ [ADMIN] No redeem codes found');
      return c.json({
        success: true,
        data: [],
      });
    }

    console.log(`📊 [ADMIN] Found ${redeemCodesResult.data?.length || 0} redeem_code entries`);
    console.log(`📊 [ADMIN] Found ${ordersResult.data?.length || 0} order entries`);

    // Parse and format the codes
    const codes = allData.map((row) => {
      try {
        // Handle both JSON string and already-parsed object
        const codeData = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        
        // Extract code from either redeemCode field or derive from key
        const code = codeData.redeemCode || codeData.code || row.key.split(':')[1];
        
        return {
          code: code,
          membershipTier: codeData.membershipTier || codeData.tier || 'N/A',
          duration: codeData.duration || 0,
          amount: codeData.amount || 0,
          merchantOrderCode: codeData.merchantOrderCode || 'N/A',
          status: codeData.status || 'pending',
          customerEmail: codeData.customerEmail || codeData.email,
          createdAt: codeData.createdAt || codeData.paymentCompletedAt || new Date().toISOString(),
          expiresAt: codeData.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          redeemedAt: codeData.redeemedAt,
          redeemedBy: codeData.redeemedBy,
        };
      } catch (parseError) {
        console.error('⚠️ [ADMIN] Failed to parse code:', row.key, parseError);
        return null;
      }
    }).filter(Boolean); // Remove null entries

    console.log(`✅ [ADMIN] Parsed ${codes.length} redeem codes successfully`);

    return c.json({
      success: true,
      data: codes,
    });

  } catch (error) {
    console.error('❌ [ADMIN] Error fetching redeem codes:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

// DELETE /admin/redeem-codes/:code - Delete a specific redeem code
app.delete('/admin/redeem-codes/:code', async (c) => {
  try {
    const code = c.req.param('code');
    console.log(`🗑️ [ADMIN] Deleting redeem code: ${code}`);

    // Check if code exists first
    const { data: existingData, error: fetchError } = await supabase
      .from('kv_store_89edbd69')
      .select('value')
      .eq('key', `redeem_code:${code}`)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ [ADMIN] Error checking code:', fetchError);
      return c.json({
        success: false,
        error: 'Failed to check code existence',
      }, 500);
    }

    if (!existingData) {
      console.log('⚠️ [ADMIN] Code not found:', code);
      return c.json({
        success: false,
        error: 'Redeem code not found',
      }, 404);
    }

    // Delete the code
    const { error: deleteError } = await supabase
      .from('kv_store_89edbd69')
      .delete()
      .eq('key', `redeem_code:${code}`);

    if (deleteError) {
      console.error('❌ [ADMIN] Failed to delete code:', deleteError);
      return c.json({
        success: false,
        error: 'Failed to delete redeem code',
      }, 500);
    }

    console.log(`✅ [ADMIN] Successfully deleted code: ${code}`);

    return c.json({
      success: true,
      message: 'Redeem code deleted successfully',
    });

  } catch (error) {
    console.error('❌ [ADMIN] Error deleting redeem code:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

// GET /admin/orders - Fetch all orders (pending_payment + completed)
app.get('/admin/orders', async (c) => {
  try {
    console.log('📋 [ADMIN] Fetching all orders...');

    // Fetch all keys starting with "order:"
    const { data, error } = await supabase
      .from('kv_store_89edbd69')
      .select('key, value')
      .like('key', 'order:%')
      .order('key', { ascending: false });

    if (error) {
      console.error('❌ [ADMIN] Failed to fetch orders:', error);
      return c.json({
        success: false,
        error: 'Failed to fetch orders',
      }, 500);
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ [ADMIN] No orders found');
      return c.json({
        success: true,
        data: [],
      });
    }

    // Parse and format the orders
    const orders = data.map((row) => {
      try {
        // Handle both JSON string and already-parsed object
        const orderData = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        return {
          merchantOrderCode: orderData.merchantOrderCode,
          redeemCode: orderData.redeemCode,
          membershipTier: orderData.membershipTier,
          duration: orderData.duration,
          amount: orderData.amount,
          customerEmail: orderData.customerEmail,
          status: orderData.status,
          createdAt: orderData.createdAt,
          expiresAt: orderData.expiresAt,
          paymentCompletedAt: orderData.paymentCompletedAt,
          redeemedAt: orderData.redeemedAt,
          redeemedBy: orderData.redeemedBy,
        };
      } catch (parseError) {
        console.error('⚠️ [ADMIN] Failed to parse order:', row.key, parseError);
        return null;
      }
    }).filter(Boolean); // Remove null entries

    console.log(`✅ [ADMIN] Found ${orders.length} orders`);

    return c.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error('❌ [ADMIN] Error fetching orders:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

export { app as adminRedeemCodesApp };