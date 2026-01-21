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

const KV_TABLE = "kv_store_89edbd69";

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

// Generate unique redeem code
const generateRedeemCode = (): string => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, I, 1)
  const segment1 = Array.from({ length: 5 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
  const segment2 = Array.from({ length: 5 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
  return `BTCNAIL-${segment1}-${segment2}`;
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
  // Format amount to 2 decimal places for checksum calculation
  const formattedAmount = params.amount.toFixed(2);
  
  // Concatenate parameters for MD5 hash
  const dataString = `${formattedAmount}${params.merchantOrderCode}${params.email}${params.merchantRefCode}${params.timestamp}${params.secretKey}`;
  
  // Generate MD5 hash
  const hash = createHash('md5').update(dataString).digest('hex');
  
  console.log('🔐 [CHECKSUM] Generated MD5 checksum for payment URL');
  console.log('🔐 [CHECKSUM] Amount format:', formattedAmount);
  
  return hash;
};

// Build VLINKPAY payment URL (IFRAME)
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
  console.log('⚠️ [TEST] Previous cents test (47900) interpreted as $47,900 by VLINKPAY');
  
  // Generate MD5 checksum (still using decimal format for now)
  const checksum = generateChecksum({
    amount: params.amount,  // Will be converted to "479.00" in generateChecksum
    merchantOrderCode: params.merchantOrderCode,
    email: params.customerEmail,
    merchantRefCode: params.merchantRefCode,
    timestamp,
    secretKey: params.secretKey
  });
  
  console.log('⚠️ [TEST] Checksum uses DECIMAL format (479.00) while URL uses INTEGER (479)');
  
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
    
    // 2. Generate unique redeem code
    let redeemCode = generateRedeemCode();
    let codeExists = await kv.get(`redeem_code:${redeemCode}`);
    
    // Ensure uniqueness
    while (codeExists) {
      redeemCode = generateRedeemCode();
      codeExists = await kv.get(`redeem_code:${redeemCode}`);
    }
    
    console.log(`✅ [PAYMENT] Generated redeem code: ${redeemCode}`);
    
    // 3. Save redeem code to KV (status: pending)
    const merchantOrderCode = generateMerchantOrderCode();
    const redemptionData = {
      code: redeemCode,
      planId: planId || null,
      membershipTier: tierName.toLowerCase(),
      duration,
      amount,
      customerEmail: email || null,
      merchantOrderCode, // Add merchantOrderCode for external API validation
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      redeemedAt: null,
      redeemedBy: null
    };
    
    await kv.set(`redeem_code:${redeemCode}`, redemptionData);
    console.log('💾 [PAYMENT] Saved redeem code to database');
    
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
        redeemCode,
        expiresAt: redemptionData.expiresAt
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

export { app as paymentApp };