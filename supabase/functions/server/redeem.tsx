import { Hono } from 'npm:hono@4.6.14';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { decryptApiKey } from './vlinkpay-settings.tsx';

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

// Tier priority (higher index = higher priority)
const TIER_PRIORITY = {
  'gold': 1,
  'platinum': 2,
  'diamond': 3
};

// Calculate membership end date
const calculateEndDate = (duration: number): string => {
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + duration);
  return endDate.toISOString();
};

// Update active membership based on priority
const updateActiveMembership = (memberships: any[]): any[] => {
  const now = new Date();
  
  // Filter out expired memberships
  const activeMemberships = memberships.filter(m => new Date(m.endDate) > now);
  
  // Sort by tier priority (highest first)
  activeMemberships.sort((a, b) => {
    const priorityA = TIER_PRIORITY[a.tier] || 0;
    const priorityB = TIER_PRIORITY[b.tier] || 0;
    return priorityB - priorityA;
  });
  
  // Set status for all memberships
  activeMemberships.forEach((m, index) => {
    m.status = index === 0 ? 'active' : 'pending';
  });
  
  // Mark expired memberships
  const expiredMemberships = memberships
    .filter(m => new Date(m.endDate) <= now)
    .map(m => ({ ...m, status: 'expired' }));
  
  return [...activeMemberships, ...expiredMemberships];
};

// ========== REDEEM ROUTES ==========

// POST /make-server-84f9c112/redeem/validate
app.post('/make-server-84f9c112/redeem/validate', async (c) => {
  try {
    console.log('🎁 [REDEEM] Starting validation...');
    
    const body = await c.req.json();
    const { code, userId } = body;
    
    if (!code || !userId) {
      return c.json({ 
        success: false, 
        error: 'Code and userId (phone or email) are required' 
      }, 400);
    }
    
    const normalizedCode = code.toUpperCase().trim();
    console.log(`🔍 [REDEEM] Validating code: ${normalizedCode} for user: ${userId}`);
    
    // 1. Get redeem code from KV
    const redemption = await kv.get(`redeem_code:${normalizedCode}`);
    
    // 2. Validate code exists
    if (!redemption) {
      console.log('❌ [REDEEM] Code not found');
      return c.json({ 
        success: false, 
        error: 'Mã không hợp lệ. Vui lòng kiểm tra lại.' 
      }, 400);
    }
    
    // 3. Check if already redeemed
    if (redemption.status === 'redeemed') {
      console.log('❌ [REDEEM] Code already used');
      return c.json({ 
        success: false, 
        error: 'Mã này đã được sử dụng.' 
      }, 400);
    }
    
    // 4. Check expiry
    if (new Date() > new Date(redemption.expiresAt)) {
      console.log('❌ [REDEEM] Code expired');
      return c.json({ 
        success: false, 
        error: 'Mã đã hết hạn. Vui lòng liên hệ hỗ trợ.' 
      }, 400);
    }
    
    // 4.5. Call VLINKPAY External API to validate redeem code
    console.log('🌐 [REDEEM] Calling VLINKPAY external API...');
    
    try {
      // Get VLINKPAY settings
      const vlinkpaySettings = await kv.get('vlinkpay_settings');
      
      if (!vlinkpaySettings || !vlinkpaySettings.isActive) {
        console.error('❌ [REDEEM] VLINKPAY not configured');
        return c.json({ 
          success: false, 
          error: 'Hệ thống thanh toán chưa được cấu hình. Vui lòng liên hệ quản trị viên.' 
        }, 500);
      }
      
      // Check if API key exists
      if (!vlinkpaySettings.apiKey) {
        console.error('❌ [REDEEM] VLINKPAY API key not configured');
        return c.json({ 
          success: false, 
          error: 'API key chưa được cấu hình. Vui lòng liên hệ quản trị viên.' 
        }, 500);
      }
      
      // Decrypt API key
      console.log('🔐 [REDEEM] Decrypting VLINKPAY API key...');
      const decryptedApiKey = await decryptApiKey(vlinkpaySettings.apiKey);
      console.log('✅ [REDEEM] API key decrypted successfully');
      
      // Check if merchantOrderCode exists in redemption data
      if (!redemption.merchantOrderCode) {
        console.error('❌ [REDEEM] merchantOrderCode not found in redemption data');
        return c.json({ 
          success: false, 
          error: 'Mã đơn hàng không tìm thấy. Vui lòng liên hệ hỗ trợ.' 
        }, 400);
      }
      
      // Prepare external API request
      const externalApiUrl = `${vlinkpaySettings.sandboxEndpoint}/gifthubs/public/merchant/redeem`;
      const externalPayload = {
        redeemCode: normalizedCode,
        merchantOrderCode: redemption.merchantOrderCode
      };
      
      console.log('📤 [REDEEM] Sending request to VLINKPAY:', {
        url: externalApiUrl,
        redeemCode: normalizedCode,
        merchantOrderCode: redemption.merchantOrderCode
      });
      
      // Call external API
      const externalResponse = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-key': decryptedApiKey
        },
        body: JSON.stringify(externalPayload)
      });
      
      const externalData = await externalResponse.json();
      
      console.log('📥 [REDEEM] VLINKPAY API response:', {
        status: externalResponse.status,
        ok: externalResponse.ok,
        data: externalData
      });
      
      // Check if external API failed
      if (!externalResponse.ok) {
        const errorMessage = externalData?.message || externalData?.error || 'VLINKPAY validation failed';
        console.error('❌ [REDEEM] VLINKPAY API returned error:', errorMessage);
        return c.json({ 
          success: false, 
          error: `Xác thực mã thất bại: ${errorMessage}` 
        }, externalResponse.status);
      }
      
      console.log('✅ [REDEEM] VLINKPAY API validation successful');
      
    } catch (externalError: any) {
      console.error('❌ [REDEEM] Error calling VLINKPAY external API:', externalError);
      return c.json({ 
        success: false, 
        error: `Lỗi kết nối với hệ thống thanh toán: ${externalError.message}` 
      }, 500);
    }
    
    console.log('✅ [REDEEM] Code is valid, proceeding with membership creation...');
    
    // 5. Get user's existing memberships
    let userMemberships = await kv.get(`user_memberships:${userId}`);
    
    if (!userMemberships) {
      userMemberships = {
        userId,
        memberships: [],
        activeMembership: null
      };
    }
    
    // 6. Create new membership
    const newMembership = {
      id: crypto.randomUUID(),
      tier: redemption.membershipTier,
      startDate: new Date().toISOString(),
      endDate: calculateEndDate(redemption.duration),
      status: 'pending',
      redeemCode: normalizedCode,
      duration: redemption.duration,
      amount: redemption.amount
    };
    
    console.log(`📝 [REDEEM] Created new membership:`, {
      id: newMembership.id,
      tier: newMembership.tier,
      duration: newMembership.duration
    });
    
    // 7. Add to stack
    userMemberships.memberships.push(newMembership);
    
    // 8. Update active membership based on priority
    userMemberships.memberships = updateActiveMembership(userMemberships.memberships);
    
    // 9. Set active membership ID
    const activeMembership = userMemberships.memberships.find(m => m.status === 'active');
    userMemberships.activeMembership = activeMembership?.id || null;
    
    // 10. Save to KV
    await kv.set(`user_memberships:${userId}`, userMemberships);
    console.log('💾 [REDEEM] Saved user memberships');
    
    // 11. Mark code as redeemed
    await kv.set(`redeem_code:${normalizedCode}`, {
      ...redemption,
      status: 'redeemed',
      redeemedAt: new Date().toISOString(),
      redeemedBy: userId
    });
    console.log('✅ [REDEEM] Marked code as redeemed');
    
    // TODO: Send email confirmation
    
    return c.json({ 
      success: true, 
      data: {
        membership: newMembership,
        activeMembership: activeMembership,
        totalMemberships: userMemberships.memberships.length
      },
      message: 'Kích hoạt thành công! Membership đã được áp dụng.'
    });
  } catch (error) {
    console.error('❌ [REDEEM] Error validating code:', error);
    return c.json({ 
      success: false, 
      error: `Đã xảy ra lỗi khi kích hoạt: ${error.message}` 
    }, 500);
  }
});

// GET /make-server-84f9c112/redeem/check/:code
app.get('/make-server-84f9c112/redeem/check/:code', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase().trim();
    console.log(`🔍 [REDEEM] Checking code: ${code}`);
    
    const redemption = await kv.get(`redeem_code:${code}`);
    
    if (!redemption) {
      return c.json({ 
        success: false, 
        valid: false,
        error: 'Code not found' 
      });
    }
    
    const isExpired = new Date() > new Date(redemption.expiresAt);
    const isRedeemed = redemption.status === 'redeemed';
    const isValid = !isExpired && !isRedeemed;
    
    return c.json({ 
      success: true, 
      valid: isValid,
      data: {
        code: redemption.code,
        tier: redemption.membershipTier,
        duration: redemption.duration,
        status: redemption.status,
        isExpired,
        isRedeemed,
        expiresAt: redemption.expiresAt
      }
    });
  } catch (error) {
    console.error('❌ [REDEEM] Error checking code:', error);
    return c.json({ 
      success: false, 
      valid: false,
      error: `Failed to check code: ${error.message}` 
    }, 500);
  }
});

// GET /make-server-84f9c112/membership/active/:userId
app.get('/make-server-84f9c112/membership/active/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log(`📊 [MEMBERSHIP] Fetching active membership for user: ${userId}`);
    
    const userMemberships = await kv.get(`user_memberships:${userId}`);
    
    if (!userMemberships || userMemberships.memberships.length === 0) {
      return c.json({ 
        success: true, 
        data: null,
        message: 'No memberships found'
      });
    }
    
    // Update membership statuses
    userMemberships.memberships = updateActiveMembership(userMemberships.memberships);
    const activeMembership = userMemberships.memberships.find(m => m.status === 'active');
    
    // Save updated statuses
    await kv.set(`user_memberships:${userId}`, userMemberships);
    
    return c.json({ 
      success: true, 
      data: {
        activeMembership,
        allMemberships: userMemberships.memberships,
        totalActive: userMemberships.memberships.filter(m => m.status !== 'expired').length
      }
    });
  } catch (error) {
    console.error('❌ [MEMBERSHIP] Error fetching active membership:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch membership: ${error.message}` 
    }, 500);
  }
});

export { app as redeemApp };