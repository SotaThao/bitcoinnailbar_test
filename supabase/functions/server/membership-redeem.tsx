import { Hono } from 'npm:hono@4.6.14';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  getTierPriority,
  isDowngrade,
  isSameTier,
  getUpgradeType,
  getTierDisplayName,
  calculateNewExpiry,
} from './membership-tier-config.tsx';

const app = new Hono();

// Safe parse helper
const safeParse = (value: any) => {
  if (typeof value === 'object' && value !== null) return value;
  try {
    return JSON.parse(value);
  } catch (e) {
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
    return null;
  }

  if (!data) {
    return null;
  }

  // Safe parse helper for JSONB or string values
  const safeParse = (value: any) => {
    if (typeof value === 'object' && value !== null) return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  };

  try {
    return safeParse(data.value);
  } catch (e) {
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

    const { data: redeemData, error: redeemLookupError } = await supabase
      .from('kv_store_89edbd69')
      .select('value')
      .eq('key', `redeem_code:${redeemCode.toUpperCase().trim()}`)
      .maybeSingle();

    if (redeemLookupError || !redeemData) {
      return c.json({
        success: false,
        message: 'Invalid redeem code. Please check your code and try again.',
      }, 400);
    }

    const redemptionInfo = safeParse(redeemData.value);
    
    // Check if code is already used
    if (redemptionInfo.status === 'used' || redemptionInfo.redeemedAt) {
      return c.json({
        success: false,
        message: 'This redeem code has already been used.',
      }, 400);
    }

    // Check if code is expired
    if (new Date(redemptionInfo.expiresAt) < new Date()) {
      return c.json({
        success: false,
        message: 'This redeem code has expired.',
      }, 400);
    }

    const merchantOrderCode = redemptionInfo.merchantOrderCode;
    const tierName = redemptionInfo.membershipTier;

    // ========== STEP 2: FETCH VLINKPAY SETTINGS ==========
    const vlinkpaySettings = await getVLinkPaySettings();
    if (!vlinkpaySettings || !vlinkpaySettings.secretKey) {
      return c.json({
        success: false,
        message: 'VLinkPay is not configured. Please contact administrator.',
      }, 500);
    }

    // Decrypt secret key
    const VLINKPAY_SECRET_KEY = await decryptApiKey(vlinkpaySettings.secretKey);

    const VLINKPAY_ENDPOINT = vlinkpaySettings.sandboxMode 
      ? 'https://sandbox.vlinkpay.com' 
      : 'https://api.vlinkpay.com';

    // ========== STEP 3: CALL VLINKPAY REDEEM API ==========

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

    // Check VLinkPay response
    if (vlinkpayResponse.status !== 200 || !vlinkpayData.success) {
      
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

    // ========== STEP 4: FETCH MEMBERSHIP TIER DETAILS ==========
    const { data: tierData, error: tierError } = await supabase
      .from('kv_store_89edbd69')
      .select('value')
      .eq('key', 'membership_tiers')
      .single();

    if (tierError || !tierData) {
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
      return c.json({
        success: false,
        message: 'Invalid membership tier',
      }, 400);
    }

    // ========== STEP 5: CHECK EXISTING MEMBERSHIP & TIER HIERARCHY ==========
    const { data: existingMembership, error: checkError } = await supabase
      .from('kv_store_89edbd69')
      .select('value')
      .eq('key', `membership:${phoneDigits}`)
      .maybeSingle();

    let isUpgrade = false;
    let isExtension = false;
    let activatedAt = new Date();
    let expiresAt = new Date();

    if (existingMembership && !checkError) {
      const existing = safeParse(existingMembership.value);
      
      // Check if existing membership is still active
      if (existing.status === 'active' && new Date(existing.expiresAt) > new Date()) {
        const currentTier = existing.tier;
        const newTier = tier.name;
        
        const upgradeType = getUpgradeType(currentTier, newTier);

        // ❌ PREVENT DOWNGRADE
        if (upgradeType === 'downgrade') {
          return c.json({
            success: false,
            message: `Cannot downgrade from ${getTierDisplayName(currentTier)} to ${getTierDisplayName(newTier)}. You can only redeem the same tier or upgrade to a higher tier.`,
          }, 400);
        }

        // ✅ SAME TIER → EXTEND DURATION
        if (upgradeType === 'extension') {
          isExtension = true;
          expiresAt = calculateNewExpiry(existing.expiresAt, 'extension', 365);
        }

        // ⬆️ HIGHER TIER → UPGRADE & REPLACE
        if (upgradeType === 'upgrade') {
          isUpgrade = true;
          expiresAt = calculateNewExpiry(existing.expiresAt, 'upgrade', 365);
        }
      } else {
        // Existing membership is expired or inactive - treat as new
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
    } else {
      // No existing membership - create new
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // ========== STEP 6: CREATE/UPDATE MEMBERSHIP RECORD ==========
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

    // Store membership
    const { error: insertError } = await supabase
      .from('kv_store_89edbd69')
      .upsert({
        key: `membership:${phoneDigits}`,
        value: JSON.stringify(membershipData),
      });

    if (insertError) {
      return c.json({
        success: false,
        message: 'Failed to activate membership',
      }, 500);
    }

    // ========== STEP 7: MARK REDEEM CODE AS USED ==========

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
      // Don't fail the whole operation, membership is already created
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
      // Silently ignore history logging errors
    }

    // Success response
    // Generate appropriate success message based on action type
    let successMessage = '';
    if (isExtension) {
      successMessage = `${tier.name.toUpperCase()} membership extended successfully! Your membership has been extended by 1 year.`;
    } else if (isUpgrade) {
      successMessage = `Congratulations! You've been upgraded to ${tier.name.toUpperCase()} membership!`;
    } else {
      successMessage = `${tier.name.toUpperCase()} membership activated successfully!`;
    }
    return c.json({
      success: true,
      message: successMessage,
      action: isExtension ? 'extension' : isUpgrade ? 'upgrade' : 'new',
      membership: {
        tier: tier.name,
        expiresAt: expiresAt.toISOString(),
        benefits: tier.benefits || [],
      },
    });

  } catch (error) {
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
    return c.json({
      success: false,
      message: 'Error checking membership status',
    }, 500);
  }
});

export { app as membershipRedeemApp };