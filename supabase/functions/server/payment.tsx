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
      await new Promise(r => setTimeout(r, delay));
      return retry(fn, retries - 1, delay * 2);
    }
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
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// Generate unique merchant order code
const generateMerchantOrderCode = (): string => {
  return `BNB-${Date.now()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
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
  membershipTier?: string; // NEW: Pass membership tier
  duration?: number; // NEW: Pass duration
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

  // Generate MD5 checksum with SAME amount format as URL
  const checksum = generateChecksum({
    amount: params.amount,  // Will be converted to INTEGER "479" (same as URL)
    merchantOrderCode: params.merchantOrderCode,
    email: params.customerEmail,
    merchantRefCode: params.merchantRefCode,
    timestamp,
    secretKey: params.secretKey
  });

  url.searchParams.append('amount', formattedAmount);  // ← Using INTEGER format
  url.searchParams.append('merchantOrderCode', params.merchantOrderCode);
  url.searchParams.append('email', params.customerEmail);
  url.searchParams.append('merchantRefCode', params.merchantRefCode);
  url.searchParams.append('checksum', checksum);
  url.searchParams.append('timestamp', timestamp.toString());
  url.searchParams.append('orderRedirectUrl', params.orderRedirectUrl);

  // The tier info is already saved in orderData, will be used during redeem

  return url.toString();
};

// ========== PAYMENT ROUTES ==========

// POST /make-server-84f9c112/payment/create-link
app.post('/make-server-84f9c112/payment/create-link', async (c) => {
  try {

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

    const decryptedSecretKey = await decryptApiKey(settings.secretKey);

    // 2. Generate unique merchant order code (NO REDEEM CODE YET - VLinkPay will generate it)
    const merchantOrderCode = generateMerchantOrderCode();

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

    // 4. Build VLINKPAY payment URL (without email, will be appended by frontend)
    const paymentUrl = buildVLinkPayURL({
      sandboxEndpoint: settings.sandboxEndpoint,
      amount,
      merchantOrderCode,
      customerEmail: '{email}', // Placeholder, frontend will replace
      merchantRefCode: settings.merchantRefCode,
      orderRedirectUrl: settings.redirectUrl,
      secretKey: decryptedSecretKey,
      membershipTier: tierName.toLowerCase(),
      duration
    });
    
    // Replace placeholder with actual template for frontend
    const finalPaymentUrl = paymentUrl.replace(encodeURIComponent('{email}'), '{email}');

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

    let orderData = null;
    let foundMerchantOrderCode = merchantOrderCode;
    
    // If merchantOrderCode provided, use it directly
    if (merchantOrderCode) {
      orderData = await kv.get(`order:${merchantOrderCode}`);
    } else {
      // Otherwise, search for pending order (sessionStorage lost scenario)

      // Query all orders with prefix "order:"
      const { data: allOrders, error } = await supabase
        .from(KV_TABLE)
        .select('key, value')
        .like('key', 'order:%')
        .eq('value->>status', 'pending_payment')
        .order('key', { ascending: false })
        .limit(50);
      
      if (error) {
        // Don't throw, continue to check params
      } else {

        // Find the most recent pending order (assuming it's the user's order)
        if (allOrders && allOrders.length > 0) {
          const latestOrder = allOrders[0];
          orderData = typeof latestOrder.value === 'string'
            ? JSON.parse(latestOrder.value)
            : latestOrder.value;
          foundMerchantOrderCode = orderData.merchantOrderCode;
        }
      }
    }

    // 3. Fallback: Use provided params from localStorage (since we don't save pending orders anymore)
    if (!orderData && membershipTier && amount) {
        orderData = {
          merchantOrderCode: merchantOrderCode || generateMerchantOrderCode(), // ✅ FIX: Use BNB- prefix instead of ORDER-
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
      return c.json({ 
        success: false, 
        error: 'Order not found. Please contact support with code: ' + redeemCode
      }, 404);
    }
    
    if (orderData.status !== 'pending_payment') {
      return c.json({ 
        success: false, 
        error: 'Order already completed or invalid' 
      }, 400);
    }
    
    // 2. Check if redeemCode already exists (prevent duplicates)
    const existingCode = await kv.get(`redeem_code:${redeemCode}`);
    if (existingCode) {
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

    await kv.set(`redeem_code:${redeemCode}`, redemptionData);

    // Verify the save worked
    const verifyCode = await kv.get(`redeem_code:${redeemCode}`);
    if (!verifyCode) {
      throw new Error('Failed to save redeem code to database');
    }

    // 4. Update order status
    orderData.redeemCode = redeemCode;
    orderData.status = 'pending'; // ← Payment completed, code ready to redeem (will become 'used' after redemption)
    orderData.paymentCompletedAt = new Date().toISOString();
    
    await kv.set(`order:${foundMerchantOrderCode}`, orderData);

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

    // Get all orders with prefix "order:"
    const { data: allOrders, error } = await supabase
      .from(KV_TABLE)
      .select('key, value')
      .like('key', 'order:%')
      .eq('value->>status', 'pending_payment');
    
    if (error) {
      throw new Error('Failed to query orders');
    }

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
          errors.push({ key: order.key, error: deleteError.message });
        } else {
          deletedCount++;
        }
      } catch (err) {
        errors.push({ key: order.key, error: err.message });
      }
    }

    return c.json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} expired pending orders`,
      deleted: deletedCount,
      total: expiredOrders.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to cleanup expired orders: ${error.message}`
    }, 500);
  }
});

export { app as paymentApp };