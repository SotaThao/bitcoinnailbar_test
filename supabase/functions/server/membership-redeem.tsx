import { Hono } from 'npm:hono@4.6.14';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Safe parse helper
const safeParse = (value: any) => {
  if (typeof value === 'object' && value !== null) return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return null;
  }
};

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

// Helper function to fetch VLinkPay settings
async function getVLinkPaySettings() {
  const { data, error } = await supabase
    .from('kv_store_89edbd69')
    .select('value')
    .eq('key', 'vlinkpay_settings')
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch VLinkPay settings:', error);
    return null;
  }
  
  if (!data) {
    console.log('⚠️ VLinkPay settings not configured yet');
    return null;
  }

  // Safe parse helper for JSONB or string values
  const safeParse = (value: any) => {
    if (typeof value === 'object' && value !== null) return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return null;
    }
  };

  try {
    return safeParse(data.value);
  } catch (e) {
    console.error('Failed to parse VLinkPay settings:', e);
    return null;
  }
}

// ========== AES-256-GCM DECRYPTION HELPER ==========

/**
 * Get encryption key from environment variable and normalize to 32 bytes
 */
const getEncryptionKey = async (): Promise<CryptoKey> => {
  const keyString = Deno.env.get('VLINKPAY_ENCRYPTION_KEY');
  
  if (!keyString) {
    throw new Error('VLINKPAY_ENCRYPTION_KEY environment variable not set.');
  }
  
  // Hash the key string with SHA-256 to get exactly 32 bytes
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
  } catch (error: any) {
    console.error('❌ [DECRYPTION] Failed to decrypt secret key:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// POST /membership/redeem - Redeem membership code via VLinkPay
app.post('/membership/redeem', async (c) => {
  try {
    const { phone, redeemCode } = await c.req.json();

    // Validation
    if (!phone || !redeemCode) {
      return c.json({
        success: false,
        message: 'Phone number and redeem code are required',
      }, 400);
    }

    // Validate phone format (10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return c.json({
        success: false,
        message: 'Invalid phone number format. Must be 10 digits.',
      }, 400);
    }

    // ========== STEP 1: LOOKUP REDEEM CODE IN DATABASE ==========
    console.log('🔍 [REDEEM] Looking up redeem code:', redeemCode);
    
    const { data: redeemData, error: redeemLookupError } = await supabase
      .from('kv_store_89edbd69')
      .select('value')
      .eq('key', `redeem_code:${redeemCode.toUpperCase().trim()}`)
      .maybeSingle();

    if (redeemLookupError || !redeemData) {
      console.error('❌ [REDEEM] Code not found in database:', redeemCode);
      return c.json({
        success: false,
        message: 'Invalid redeem code. Please check your code and try again.',
      }, 400);
    }

    const redemptionInfo = safeParse(redeemData.value);
    
    // Check if code is already used
    if (redemptionInfo.status === 'used' || redemptionInfo.redeemedAt) {
      console.error('❌ [REDEEM] Code already used:', redeemCode);
      return c.json({
        success: false,
        message: 'This redeem code has already been used.',
      }, 400);
    }

    // Check if code is expired
    if (new Date(redemptionInfo.expiresAt) < new Date()) {
      console.error('❌ [REDEEM] Code expired:', redeemCode);
      return c.json({
        success: false,
        message: 'This redeem code has expired.',
      }, 400);
    }

    const merchantOrderCode = redemptionInfo.merchantOrderCode;
    const tierName = redemptionInfo.membershipTier;
    
    console.log('✅ [REDEEM] Code found:', {
      code: redeemCode,
      merchantOrderCode,
      tier: tierName,
      status: redemptionInfo.status
    });

    // ========== STEP 2: FETCH VLINKPAY SETTINGS ==========
    const vlinkpaySettings = await getVLinkPaySettings();
    if (!vlinkpaySettings || !vlinkpaySettings.secretKey) {
      return c.json({
        success: false,
        message: 'VLinkPay is not configured. Please contact administrator.',
      }, 500);
    }

    // Decrypt secret key
    console.log('🔐 [REDEEM] Decrypting secret key...');
    const VLINKPAY_SECRET_KEY = await decryptApiKey(vlinkpaySettings.secretKey);
    console.log('✅ [REDEEM] Secret key decrypted successfully');

    const VLINKPAY_ENDPOINT = vlinkpaySettings.sandboxMode 
      ? 'https://sandbox.vlinkpay.com' 
      : 'https://api.vlinkpay.com';

    // ========== STEP 3: CALL VLINKPAY REDEEM API ==========
    console.log('📞 [REDEEM] Calling VLinkPay redeem API:', {
      endpoint: VLINKPAY_ENDPOINT,
      redeemCode,
      merchantOrderCode,
    });
    
    // Log headers (masked)
    console.log('🛡️ [REDEEM] Headers:', {
      'Content-Type': 'application/json',
      'Api-key': VLINKPAY_SECRET_KEY ? `${VLINKPAY_SECRET_KEY.substring(0, 4)}...${VLINKPAY_SECRET_KEY.substring(VLINKPAY_SECRET_KEY.length - 4)}` : 'MISSING'
    });

    const vlinkpayResponse = await fetch(
      `${VLINKPAY_ENDPOINT}/gifthubs/public/merchant/redeem`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-key': VLINKPAY_SECRET_KEY,
        },
        body: JSON.stringify({
          redeemCode,
          merchantOrderCode,
        }),
      }
    );

    const vlinkpayData = await vlinkpayResponse.json();

    console.log('📊 [REDEEM] VLinkPay Response:', {
      status: vlinkpayResponse.status,
      statusText: vlinkpayResponse.statusText,
      data: vlinkpayData
    });

    // Check VLinkPay response
    if (vlinkpayResponse.status !== 200 || !vlinkpayData.success) {
      console.error('❌ [REDEEM] VLinkPay redeem failed:', {
        status: vlinkpayResponse.status,
        response: vlinkpayData
      });
      
      // Provide user-friendly error messages based on VLinkPay error
      let errorMessage = 'Redeem không thành công. ';
      
      if (vlinkpayData.code === 'InvalidApiKey' || vlinkpayData.message === 'Api key is invalid') {
        errorMessage += 'Cấu hình hệ thống lỗi (API Key không hợp lệ). Vui lòng liên hệ quản trị viên.';
      } else if (vlinkpayResponse.status === 400) {
        errorMessage += vlinkpayData.message || 'Mã redeem không hợp lệ hoặc đã được sử dụng.';
      } else if (vlinkpayResponse.status === 401) {
        errorMessage += 'Lỗi xác thực hệ thống. Vui lòng liên hệ quản trị viên.';
      } else if (vlinkpayResponse.status === 404) {
        errorMessage += 'Không tìm thấy mã redeem trong hệ thống VLinkPay.';
      } else if (vlinkpayResponse.status >= 500) {
        errorMessage += 'Lỗi hệ thống VLinkPay. Vui lòng thử lại sau.';
      } else {
        errorMessage += vlinkpayData.message || 'Vui lòng kiểm tra lại mã redeem.';
      }
      
      return c.json({
        success: false,
        message: errorMessage,
        error: {
          vlinkpayStatus: vlinkpayResponse.status,
          vlinkpayMessage: vlinkpayData.message,
          details: vlinkpayData
        }
      }, 400);
    }

    console.log('✅ [REDEEM] VLinkPay redeem successful:', vlinkpayData);

    // ========== STEP 4: FETCH MEMBERSHIP TIER DETAILS ==========
    const { data: tierData, error: tierError } = await supabase
      .from('kv_store_89edbd69')
      .select('value')
      .eq('key', 'membership_tiers')
      .single();

    if (tierError || !tierData) {
      console.error('Failed to fetch membership tiers:', tierError);
      return c.json({
        success: false,
        message: 'Failed to retrieve membership details',
      }, 500);
    }

    const tiers = safeParse(tierData.value);
    const tier = tiers.find((t: any) => 
      t.name.toLowerCase() === tierName.toLowerCase()
    );

    if (!tier) {
      console.error('Tier not found:', tierName);
      return c.json({
        success: false,
        message: 'Invalid membership tier',
      }, 400);
    }

    // ========== STEP 5: CALCULATE EXPIRY DATE ==========
    const activatedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // ========== STEP 6: CREATE MEMBERSHIP RECORD ==========
    const membershipData = {
      phone: phoneDigits,
      tier: tier.name,
      tierData: tier,
      redeemCode,
      merchantOrderCode,
      activatedAt: activatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      vlinkpayData: vlinkpayData,
    };

    // Check if membership already exists for this phone
    const { data: existingMembership, error: checkError } = await supabase
      .from('kv_store_89edbd69')
      .select('value')
      .eq('key', `membership:${phoneDigits}`)
      .single();

    if (existingMembership && !checkError) {
      const existing = safeParse(existingMembership.value);
      if (existing.status === 'active' && new Date(existing.expiresAt) > new Date()) {
        return c.json({
          success: false,
          message: 'This phone number already has an active membership',
        }, 400);
      }
    }

    // Store membership
    const { error: insertError } = await supabase
      .from('kv_store_89edbd69')
      .upsert({
        key: `membership:${phoneDigits}`,
        value: JSON.stringify(membershipData),
      });

    if (insertError) {
      console.error('Failed to store membership:', insertError);
      return c.json({
        success: false,
        message: 'Failed to activate membership',
      }, 500);
    }

    // ========== STEP 7: MARK REDEEM CODE AS USED ==========
    console.log('🔒 [REDEEM] Marking code as used...');
    
    const { error: updateCodeError } = await supabase
      .from('kv_store_89edbd69')
      .update({
        value: JSON.stringify({
          ...redemptionInfo,
          status: 'used',
          redeemedAt: activatedAt.toISOString(),
          redeemedBy: phoneDigits,
        })
      })
      .eq('key', `redeem_code:${redeemCode.toUpperCase().trim()}`);

    if (updateCodeError) {
      console.warn('⚠️ [REDEEM] Failed to mark code as used:', updateCodeError);
      // Don't fail the whole operation, membership is already created
    } else {
      console.log('✅ [REDEEM] Code marked as used');
    }

    // ========== STEP 8: LOG REDEMPTION HISTORY ==========
    const { error: historyError } = await supabase
      .from('kv_store_89edbd69')
      .insert({
        key: `redeem_history:${Date.now()}:${phoneDigits}`,
        value: JSON.stringify({
          phone: phoneDigits,
          redeemCode,
          merchantOrderCode,
          tier: tier.name,
          timestamp: activatedAt.toISOString(),
        }),
      });

    if (historyError) {
      console.warn('Failed to log redemption history:', historyError);
    }

    // Success response
    console.log('🎉 [REDEEM] Membership activated successfully!');
    return c.json({
      success: true,
      message: `${tier.name} membership activated successfully!`,
      membership: {
        tier: tier.name,
        expiresAt: expiresAt.toISOString(),
        benefits: tier.benefits || [],
      },
    });

  } catch (error) {
    console.error('❌ [REDEEM] Error:', error);
    return c.json({
      success: false,
      message: 'An error occurred while processing your request',
    }, 500);
  }
});

// GET /membership/check/:phone - Check membership status by phone
app.get('/membership/check/:phone', async (c) => {
  try {
    const phone = c.req.param('phone');
    const phoneDigits = phone.replace(/\D/g, '');

    if (phoneDigits.length !== 10) {
      return c.json({
        success: false,
        message: 'Invalid phone number',
      }, 400);
    }

    const { data, error } = await supabase
      .from('kv_store_89edbd69')
      .select('value')
      .eq('key', `membership:${phoneDigits}`)
      .single();

    if (error || !data) {
      return c.json({
        success: false,
        hasMembership: false,
        message: 'No membership found',
      });
    }

    const membership = safeParse(data.value);
    const isActive = membership.status === 'active' && new Date(membership.expiresAt) > new Date();

    if (!isActive) {
      return c.json({
        success: false,
        hasMembership: false,
        message: 'Membership expired',
      });
    }

    return c.json({
      success: true,
      hasMembership: true,
      membership: {
        tier: membership.tier,
        tierData: membership.tierData,
        expiresAt: membership.expiresAt,
        benefits: membership.tierData?.benefits || [],
      },
    });

  } catch (error) {
    console.error('Check membership error:', error);
    return c.json({
      success: false,
      message: 'Error checking membership status',
    }, 500);
  }
});

export { app as membershipRedeemApp };