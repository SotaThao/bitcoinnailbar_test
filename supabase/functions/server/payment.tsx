import { Hono } from 'npm:hono@4.6.14';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);

const KV_TABLE = "kv_store_89edbd69"; // ← REVERT: Use admin data table

// Helper to retry failed requests
const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 200): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (String(error).includes("connection error") || String(error).includes("connection reset"))) {
      console.warn(`⚠️ Request failed, retrying... (${retries} left). Error: ${error.message || error}`);
      await new Promise(r => setTimeout(r, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    console.error(`❌ [RETRY] All retries exhausted. Final error:`, error);
    throw error;
  }
};

// Local KV implementation
const kv = {
  async get(key: string) {
    return retry(async () => {
      const { data, error } = await supabase.from(KV_TABLE).select("value").eq("key", key).maybeSingle();
      if (error) throw new Error(`[KV GET] ${error.message || JSON.stringify(error)}`);
      return data?.value;
    });
  },
  async set(key: string, value: any) {
    return retry(async () => {
      const { error } = await supabase.from(KV_TABLE).upsert({ key, value });
      if (error) throw new Error(`[KV SET] ${error.message || JSON.stringify(error)}`);
    });
  }
};

// ========== AES-256-GCM DECRYPTION HELPER ==========

/**
 * Get encryption key from environment variable and normalize to 32 bytes
 * Uses SHA-256 to hash any string into exactly 32 bytes (256 bits) for AES-256
 * This allows users to set any string as VLINKPAY_ENCRYPTION_KEY
 */
const getEncryptionKey = async (): Promise<CryptoKey> => {
  const keyString = Deno.env.get('VLINKPAY_ENCRYPTION_KEY');
  
  if (!keyString) {
    throw new Error('VLINKPAY_ENCRYPTION_KEY environment variable not set. Please configure in Supabase Edge Functions secrets.');
  }
  
  // Hash the key string with SHA-256 to get exactly 32 bytes
  // This allows any string to be used as the encryption key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  const hashedKey = new Uint8Array(hashBuffer);
  
  console.log('🔑 [ENCRYPTION] Key normalized to', hashedKey.length, 'bytes via SHA-256');
  
  // Import the hashed key for AES-GCM encryption
  return await crypto.subtle.importKey(
    'raw',
    hashedKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Decrypt API key using AES-256-GCM
 * Input: base64(iv + encrypted_data + auth_tag)
 */
const decryptApiKey = async (encryptedText: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    
    // Decode base64
    const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      encryptedData
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('❌ [DECRYPTION] Failed to decrypt API key:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// Generate unique merchant order code
const generateMerchantOrderCode = (): string => {
  return `ORDER-${Date.now()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
};

// Generate MD5 checksum for VLINKPAY
const generateChecksum = (params: {
  amount: number;
  merchantOrderCode: string;
  email: string;
  merchantRefCode: string;
  timestamp: number;
  secretKey: string;
}): string => {
  // ⚠️ IMPORTANT: Amount format MUST match the format used in URL params
  // Currently using INTEGER format (no decimals) to match URL
  const formattedAmount = Math.floor(params.amount).toString();
  
  // Concatenate parameters for MD5 hash
  const dataString = `${formattedAmount}${params.merchantOrderCode}${params.email}${params.merchantRefCode}${params.timestamp}${params.secretKey}`;
  
  // Generate MD5 hash
  const hash = createHash('md5').update(dataString).digest('hex');
  
  console.log('🔐 [CHECKSUM] Generated MD5 checksum for payment URL');
  console.log('🔐 [CHECKSUM] Amount format: INTEGER (no decimals)');
  console.log('🔐 [CHECKSUM] Amount value:', formattedAmount);
  
  return hash;
};

// Build VLINKPAY payment URL (without email, will be appended by frontend)
const buildVLinkPayURL = (params: {
  sandboxEndpoint: string;
  amount: number;
  merchantOrderCode: string;
  customerEmail: string;
  merchantRefCode: string;
  orderRedirectUrl: string;
  secretKey: string;
}): string => {
  const url = new URL(`${params.sandboxEndpoint}/embedded/payment-init`);
  
  // TODO: TIMESTAMP CONVERSION NEEDED
  // Current: Using Date.now() (Unix milliseconds)
  // Waiting for VLINKPAY specification:
  // - Format: Unix seconds? Unix ms? ISO 8601? Custom?\
  // - Timezone: UTC? GMT+7? Other?
  // - Conversion rule: timestamp_vlinkpay = Date.now() + offset?
  const timestamp = Date.now();
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧪 AMOUNT FORMAT TESTING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Testing different amount formats to find what VLINKPAY expects:
  //
  // Format 1 (DECIMAL): 479.00
  //   const formattedAmount = params.amount.toFixed(2);  // "479.00"
  //   Result: ❌ "Your amount is invalid"
  //
  // Format 2 (INTEGER): 479
  //   const formattedAmount = Math.floor(params.amount).toString();  // "479"
  //   Result: 🧪 Testing NOW - User requested
  //
  // Format 3 (CENTS): 47900
  //   const formattedAmount = Math.floor(params.amount * 100).toString();  // "47900"
  //   Result: ❌ VLINKPAY interprets as $47,900.00 (wrong!)
  //
  // Format 4 (VND - if applicable): 11975000
  //   const formattedAmount = Math.floor(params.amount * 25000).toString();
  //   Result: ❓ (Not tested yet)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // 🧪 ACTIVE TEST: Format 2 - INTEGER (no decimals)
  const formattedAmount = Math.floor(params.amount).toString();
  console.log('🧪 [TEST] Amount format: INTEGER');
  console.log('🧪 [TEST] Original amount:', params.amount);
  console.log('🧪 [TEST] Formatted amount:', formattedAmount);
  console.log('🧪 [TEST] Example: 479.00 → "479"');
  
  // Generate MD5 checksum with SAME amount format as URL
  const checksum = generateChecksum({
    amount: params.amount,  // Will be converted to INTEGER "479" (same as URL)
    merchantOrderCode: params.merchantOrderCode,
    email: params.customerEmail,
    merchantRefCode: params.merchantRefCode,
    timestamp,
    secretKey: params.secretKey
  });
  
  console.log('✅ [CHECKSUM] Using same INTEGER format for both checksum and URL');
  
  url.searchParams.append('amount', formattedAmount);  // ← Using INTEGER format
  url.searchParams.append('merchantOrderCode', params.merchantOrderCode);
  url.searchParams.append('email', params.customerEmail);
  url.searchParams.append('merchantRefCode', params.merchantRefCode);
  url.searchParams.append('checksum', checksum);
  url.searchParams.append('timestamp', timestamp.toString());
  url.searchParams.append('orderRedirectUrl', params.orderRedirectUrl);
  
  return url.toString();
};

// ========== PAYMENT ROUTES ==========

// POST /make-server-84f9c112/payment/create-link
app.post('/make-server-84f9c112/payment/create-link', async (c) => {
  try {
    console.log('💳 [PAYMENT] Creating payment link...');
    
    const body = await c.req.json();
    const { planId, tierName, duration, amount, email } = body;
    
    if (!tierName || !duration || !amount) {
      return c.json({ 
        success: false, 
        error: 'tierName, duration, and amount are required' 
      }, 400);
    }
    
    // 1. Get VLINKPAY credentials
    const settings = await kv.get('vlinkpay_settings');
    if (!settings || !settings.isActive) {
      return c.json({ 
        success: false, 
        error: 'VLINKPAY not configured. Please contact administrator.' 
      }, 500);
    }
    
    // 1.5 Decrypt secret key
    if (!settings.secretKey) {
      return c.json({
        success: false,
        error: 'Secret key not configured. Please update VLINKPAY settings.'
      }, 500);
    }
    
    console.log('🔐 [PAYMENT] Decrypting secret key...');
    const decryptedSecretKey = await decryptApiKey(settings.secretKey);
    console.log('✅ [PAYMENT] Secret key decrypted successfully');
    
    // 2. Generate unique merchant order code (NO REDEEM CODE YET - VLinkPay will generate it)
    const merchantOrderCode = generateMerchantOrderCode();
    console.log(`✅ [PAYMENT] Generated merchant order code: ${merchantOrderCode}`);
    
    // 3. Save order to KV (status: pending_payment, NO redeemCode yet)
    const orderData = {
      merchantOrderCode,
      planId: planId || null,
      membershipTier: tierName.toLowerCase(),
      duration,
      amount,
      customerEmail: email || null,
      redeemCode: null, // ← VLinkPay will provide this after payment
      status: 'pending_payment', // ← Waiting for payment completion
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      paymentCompletedAt: null,
      redeemedAt: null,
      redeemedBy: null
    };
    
    await kv.set(`order:${merchantOrderCode}`, orderData);
    console.log('💾 [PAYMENT] Saved order to database (awaiting payment)');
    
    // 4. Build VLINKPAY payment URL (without email, will be appended by frontend)
    const paymentUrl = buildVLinkPayURL({
      sandboxEndpoint: settings.sandboxEndpoint,
      amount,
      merchantOrderCode,
      customerEmail: '{email}', // Placeholder, frontend will replace
      merchantRefCode: settings.merchantRefCode,
      orderRedirectUrl: settings.redirectUrl,
      secretKey: decryptedSecretKey
    });
    
    // Replace placeholder with actual template for frontend
    const finalPaymentUrl = paymentUrl.replace(encodeURIComponent('{email}'), '{email}');
    
    console.log(`✅ [PAYMENT] Payment link created successfully`);
    
    return c.json({ 
      success: true, 
      data: {
        paymentUrl: finalPaymentUrl,
        merchantOrderCode,
        expiresAt: orderData.expiresAt
      },
      message: 'Payment link created successfully'
    });
  } catch (error) {
    console.error('❌ [PAYMENT] Error creating payment link:', error);
    return c.json({ 
      success: false, 
      error: `Failed to create payment link: ${error.message}` 
    }, 500);
  }
});

// POST /make-server-84f9c112/payment/complete-order
// Called by frontend after VLinkPay redirect with redeemCode
app.post('/make-server-84f9c112/payment/complete-order', async (c) => {
  try {
    console.log('🎉 [PAYMENT] Completing order with VLinkPay redeemCode...');
    
    const body = await c.req.json();
    const { merchantOrderCode, redeemCode, planId, membershipTier, duration, amount, customerEmail } = body;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 FIX: Support finding order by redeemCode only (sessionStorage fallback)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    if (!redeemCode) {
      return c.json({ 
        success: false, 
        error: 'redeemCode is required' 
      }, 400);
    }
    
    console.log(`🎫 [PAYMENT] VLinkPay Code: ${redeemCode}`);
    
    let orderData = null;
    let foundMerchantOrderCode = merchantOrderCode;
    
    // If merchantOrderCode provided, use it directly
    if (merchantOrderCode) {
      console.log(`📦 [PAYMENT] Using provided merchantOrderCode: ${merchantOrderCode}`);
      orderData = await kv.get(`order:${merchantOrderCode}`);
    } else {
      // Otherwise, search for pending order (sessionStorage lost scenario)
      console.log('🔍 [PAYMENT] merchantOrderCode not provided, searching for pending order...');
      
      // Query all orders with prefix "order:"
      const { data: allOrders, error } = await supabase
        .from(KV_TABLE)
        .select('key, value')
        .like('key', 'order:%')
        .eq('value->>status', 'pending_payment')
        .order('key', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('❌ [PAYMENT] Error querying orders:', error);
        // Don't throw, continue to check params
      } else {
        console.log(`📋 [PAYMENT] Found ${allOrders?.length || 0} pending orders`);
        
        // Find the most recent pending order (assuming it's the user's order)
        if (allOrders && allOrders.length > 0) {
          const latestOrder = allOrders[0];
          orderData = typeof latestOrder.value === 'string' 
            ? JSON.parse(latestOrder.value) 
            : latestOrder.value;
          foundMerchantOrderCode = orderData.merchantOrderCode;
          console.log(`✅ [PAYMENT] Found pending order: ${foundMerchantOrderCode}`);
        }
      }
    }

    // 3. Fallback: Use provided params from localStorage (since we don't save pending orders anymore)
    if (!orderData && membershipTier && amount) {
        console.log('⚠️ [PAYMENT] Order not found in DB (LocalStorage Flow), using provided details');
        orderData = {
          merchantOrderCode: merchantOrderCode || `ORDER-${Date.now()}`,
          planId,
          membershipTier,
          duration,
          amount,
          customerEmail,
          status: 'pending_payment',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        foundMerchantOrderCode = orderData.merchantOrderCode;
    }
    
    if (!orderData) {
      console.error('❌ [PAYMENT] Order not found');
      console.log('💡 [PAYMENT] This usually means:');
      console.log('   1. User took too long to complete payment');
      console.log('   2. Order was already completed');
      console.log('   3. Invalid merchantOrderCode');
      return c.json({ 
        success: false, 
        error: 'Order not found. Please contact support with code: ' + redeemCode
      }, 404);
    }
    
    if (orderData.status !== 'pending_payment') {
      console.error('❌ [PAYMENT] Order already completed or invalid status:', orderData.status);
      return c.json({ 
        success: false, 
        error: 'Order already completed or invalid' 
      }, 400);
    }
    
    // 2. Check if redeemCode already exists (prevent duplicates)
    const existingCode = await kv.get(`redeem_code:${redeemCode}`);
    if (existingCode) {
      console.error('❌ [PAYMENT] Redeem code already exists:', redeemCode);
      return c.json({ 
        success: false, 
        error: 'This redeem code has already been registered' 
      }, 400);
    }
    
    // 3. Create redeem code entry with VLinkPay code
    const redemptionData = {
      code: redeemCode, // ← VLinkPay generated code
      planId: orderData.planId,
      membershipTier: orderData.membershipTier,
      duration: orderData.duration,
      amount: orderData.amount,
      customerEmail: orderData.customerEmail,
      merchantOrderCode: foundMerchantOrderCode, // ← FIX: Use found order code, not input
      status: 'pending', // ← Ready to be redeemed
      createdAt: orderData.createdAt,
      expiresAt: orderData.expiresAt,
      paymentCompletedAt: new Date().toISOString(),
      redeemedAt: null,
      redeemedBy: null
    };
    
    console.log('💾 [PAYMENT] Saving redeem code to database...');
    console.log('📝 [PAYMENT] Redemption data:', JSON.stringify(redemptionData, null, 2));
    
    await kv.set(`redeem_code:${redeemCode}`, redemptionData);
    console.log('✅ [PAYMENT] Saved VLinkPay redeem code to database');
    
    // Verify the save worked
    const verifyCode = await kv.get(`redeem_code:${redeemCode}`);
    if (!verifyCode) {
      console.error('❌ [PAYMENT] CRITICAL: Code was not saved properly!');
      throw new Error('Failed to save redeem code to database');
    }
    console.log('✅ [PAYMENT] Verified code exists in database');
    
    // 4. Update order status
    orderData.redeemCode = redeemCode;
    orderData.status = 'pending'; // ← Payment completed, code ready to redeem (will become 'used' after redemption)
    orderData.paymentCompletedAt = new Date().toISOString();
    
    await kv.set(`order:${foundMerchantOrderCode}`, orderData);
    console.log('✅ [PAYMENT] Order completed successfully');
    
    // TODO: Send email with redeem code to customer
    
    return c.json({ 
      success: true, 
      data: {
        redeemCode,
        membershipTier: redemptionData.membershipTier,
        duration: redemptionData.duration,
        expiresAt: redemptionData.expiresAt
      },
      message: 'Payment completed successfully'
    });
  } catch (error) {
    console.error('❌ [PAYMENT] Error completing order:', error);
    return c.json({ 
      success: false, 
      error: `Failed to complete order: ${error.message}` 
    }, 500);
  }
});

// GET /make-server-84f9c112/payment/status/:code
app.get('/make-server-84f9c112/payment/status/:code', async (c) => {
  try {
    const code = c.req.param('code');
    console.log(`🔍 [PAYMENT] Checking status for code: ${code}`);
    
    const redemption = await kv.get(`redeem_code:${code}`);
    
    if (!redemption) {
      return c.json({ 
        success: false, 
        error: 'Redeem code not found' 
      }, 404);
    }
    
    return c.json({ 
      success: true, 
      data: {
        code: redemption.code,
        status: redemption.status,
        membershipTier: redemption.membershipTier,
        duration: redemption.duration,
        amount: redemption.amount,
        createdAt: redemption.createdAt,
        expiresAt: redemption.expiresAt,
        redeemedAt: redemption.redeemedAt
      }
    });
  } catch (error) {
    console.error('❌ [PAYMENT] Error checking status:', error);
    return c.json({ 
      success: false, 
      error: `Failed to check payment status: ${error.message}` 
    }, 500);
  }
});

// DELETE /make-server-84f9c112/payment/cleanup-expired
// Clean up expired pending payment orders (Owner only)
app.delete('/make-server-84f9c112/payment/cleanup-expired', async (c) => {
  try {
    console.log('🧹 [PAYMENT CLEANUP] Starting cleanup of expired pending orders...');
    
    // Get all orders with prefix "order:"
    const { data: allOrders, error } = await supabase
      .from(KV_TABLE)
      .select('key, value')
      .like('key', 'order:%')
      .eq('value->>status', 'pending_payment');
    
    if (error) {
      console.error('❌ [PAYMENT CLEANUP] Error querying orders:', error);
      throw new Error('Failed to query orders');
    }
    
    console.log(`📋 [PAYMENT CLEANUP] Found ${allOrders?.length || 0} pending payment orders`);
    
    if (!allOrders || allOrders.length === 0) {
      return c.json({
        success: true,
        message: 'No pending orders to clean up',
        deleted: 0
      });
    }
    
    // Filter expired orders (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const expiredOrders = allOrders.filter(order => {
      const orderData = typeof order.value === 'string' 
        ? JSON.parse(order.value) 
        : order.value;
      const createdAt = new Date(orderData.createdAt);
      return createdAt < oneHourAgo;
    });
    
    console.log(`⏰ [PAYMENT CLEANUP] Found ${expiredOrders.length} expired orders (> 1 hour old)`);
    
    if (expiredOrders.length === 0) {
      return c.json({
        success: true,
        message: 'No expired orders to clean up',
        deleted: 0
      });
    }
    
    // Delete expired orders
    let deletedCount = 0;
    const errors = [];
    
    for (const order of expiredOrders) {
      try {
        const { error: deleteError } = await supabase
          .from(KV_TABLE)
          .delete()
          .eq('key', order.key);
        
        if (deleteError) {
          console.error(`❌ [PAYMENT CLEANUP] Failed to delete ${order.key}:`, deleteError);
          errors.push({ key: order.key, error: deleteError.message });
        } else {
          deletedCount++;
          console.log(`✅ [PAYMENT CLEANUP] Deleted expired order: ${order.key}`);
        }
      } catch (err) {
        console.error(`❌ [PAYMENT CLEANUP] Exception deleting ${order.key}:`, err);
        errors.push({ key: order.key, error: err.message });
      }
    }
    
    console.log(`✅ [PAYMENT CLEANUP] Cleanup complete. Deleted ${deletedCount}/${expiredOrders.length} expired orders`);
    
    return c.json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} expired pending orders`,
      deleted: deletedCount,
      total: expiredOrders.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('❌ [PAYMENT CLEANUP] Error during cleanup:', error);
    return c.json({ 
      success: false, 
      error: `Failed to cleanup expired orders: ${error.message}` 
    }, 500);
  }
});

export { app as paymentApp };