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
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎁 [REDEEM] STARTING MEMBERSHIP ACTIVATION PROCESS');
    console.log('═══════════════════════════════════════════════════════');
    
    const body = await c.req.json();
    const { code, userId } = body;
    
    console.log('📦 [REDEEM] Request body received:', JSON.stringify(body, null, 2));
    
    if (!code || !userId) {
      console.error('❌ [REDEEM] Missing required fields');
      console.error('   - code:', code ? '✓' : '✗');
      console.error('   - userId:', userId ? '✓' : '✗');
      return c.json({ 
        success: false, 
        error: 'Code and userId (phone or email) are required' 
      }, 400);
    }
    
    const normalizedCode = code.toUpperCase().trim();
    console.log(`🔍 [REDEEM] Validating code: ${normalizedCode} for user: ${userId}`);
    
    // 1. Get redeem code from KV
    console.log(`📋 [REDEEM] Querying database for key: redeem_code:${normalizedCode}`);
    const redemption = await kv.get(`redeem_code:${normalizedCode}`);
    
    // 2. Validate code exists
    if (!redemption) {
      console.log('❌ [REDEEM] Code not found in database:', normalizedCode);
      console.log('🔍 [REDEEM] This usually means:');
      console.log('   1. Payment was not completed via /payment/complete-order');
      console.log('   2. VLinkPay redirect did not happen');
      console.log('   3. User clicked "Activate" before complete-order finished');
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
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🌐 VLINKPAY EXTERNAL API VALIDATION - REQUIRED FOR REVENUE TRACKING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 
    // IMPORTANT: This API call is REQUIRED to record revenue in UDSV wallet
    // Step 3: Merchant confirms order by calling VLinkPay redeem API
    // 
    // Spec:
    // POST: {SANDBOX_ENDPOINT}/gifthubs/public/merchant/redeem
    // Header: Api-key: {API_KEY}
    // Body: { "redeemCode": "", "merchantOrderCode": "" }
    // 
    // Success: 200 → Revenue recorded in UDSV wallet
    // Failure: 400 → Revenue NOT recorded
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    console.log('🌐 [REDEEM] Calling VLINKPAY API to confirm order and record revenue...');
    
    let vlinkpayConfirmed = false;
    
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
      
      if (!vlinkpaySettings.secretKey) {
        console.error('❌ [REDEEM] VLINKPAY Secret key not configured');
        return c.json({ 
          success: false, 
          error: 'Secret key chưa được cấu hình. Vui lòng liên hệ quản trị viên.' 
        }, 500);
      }
      
      // Decrypt Secret key
      console.log('🔐 [REDEEM] Decrypting VLINKPAY Secret key...');
      const decryptedSecretKey = await decryptApiKey(vlinkpaySettings.secretKey);
      console.log('✅ [REDEEM] Secret key decrypted successfully');
      
      if (!redemption.merchantOrderCode) {
        console.error('❌ [REDEEM] merchantOrderCode not found in redemption data');
        return c.json({ 
          success: false, 
          error: 'Mã đơn hàng không tìm thấy. Vui lòng liên hệ hỗ trợ.' 
        }, 400);
      }
      
      const baseEndpoint = vlinkpaySettings.sandboxEndpoint.replace(/\/+$/, '');
      const apiUrl = `${baseEndpoint}/gifthubs/public/merchant/redeem`;
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Try both original case and uppercase (VLinkPay might be case-sensitive)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      const codeVariations = [
        normalizedCode,           // Uppercase version
        code.trim()               // Original case from user input
      ];
      
      let lastError = null;
      
      // Retry up to 3 times with delay (VLinkPay might need time to sync)
      for (let retryCount = 0; retryCount < 3; retryCount++) {
        if (retryCount > 0) {
          const delayMs = retryCount * 2000; // 2s, 4s
          console.log(`⏳ [REDEEM] Waiting ${delayMs}ms before retry ${retryCount + 1}/3...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        for (const codeVariant of codeVariations) {
          // Exact format per VLinkPay spec
          const requestBody = {
            redeemCode: codeVariant,
            merchantOrderCode: redemption.merchantOrderCode
          };
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`🧪 [REDEEM] Attempt: retry=${retryCount + 1}, code=${codeVariant === normalizedCode ? 'UPPERCASE' : 'ORIGINAL'}`);
          console.log('   URL:', apiUrl);
          console.log('   Headers:', {
            'Content-Type': 'application/json',
            'Api-key': decryptedSecretKey ? `${decryptedSecretKey.substring(0, 4)}...${decryptedSecretKey.substring(decryptedSecretKey.length - 4)}` : 'MISSING'
          });
          console.log('   Body:', JSON.stringify(requestBody, null, 2));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Api-key': decryptedSecretKey
              },
              body: JSON.stringify(requestBody)
            });
            
            const responseText = await response.text();
            console.log('📥 [REDEEM] VLinkPay Raw Response:', responseText);
            console.log('📥 [REDEEM] Status:', response.status, response.statusText);
            
            let responseData;
            try {
              responseData = JSON.parse(responseText);
            } catch (e) {
              console.error('❌ [REDEEM] Invalid JSON response from VLinkPay');
              lastError = { message: 'Invalid JSON response', body: responseText };
              continue;
            }
            
            console.log('📥 [REDEEM] Parsed Response:', responseData);
            
            // Check success
            if (response.ok && response.status === 200) {
              console.log('✅ [REDEEM] SUCCESS! VLinkPay confirmed order');
              console.log('💰 [REDEEM] Revenue will be recorded in UDSV wallet');
              console.log('   Response data:', responseData);
              vlinkpayConfirmed = true;
              break;
            } else {
              const errorMsg = responseData?.message || responseData?.error || responseData?.code || 'Unknown error';
              console.error(`❌ [REDEEM] VLinkPay returned error (${response.status}):`, errorMsg);
              console.error('   Full response:', responseData);
              lastError = {
                status: response.status,
                code: responseData?.code,
                message: errorMsg,
                response: responseData
              };
            }
            
          } catch (fetchError: any) {
            console.error('❌ [REDEEM] Fetch error:', fetchError.message);
            lastError = { message: fetchError.message, stack: fetchError.stack };
          }
        }
        
        if (vlinkpayConfirmed) break;
      }
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Handle VLinkPay confirmation result
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      
      if (!vlinkpayConfirmed) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('🚨 [REDEEM] VLINKPAY CONFIRMATION FAILED');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('⚠️  CRITICAL: Revenue will NOT be recorded in UDSV wallet');
        console.error('   Last error:', lastError);
        console.error('');
        console.error('   Possible causes:');
        console.error('   1. VLinkPay has not synced the code yet (timing issue)');
        console.error('   2. Code format mismatch');
        console.error('   3. merchantOrderCode not found in VLinkPay system');
        console.error('   4. API endpoint or credentials incorrect');
        console.error('');
        console.error('   NEXT STEPS:');
        console.error('   1. Check VLinkPay dashboard for this order');
        console.error('   2. Contact VLinkPay support with:');
        console.error(`      - redeemCode: ${normalizedCode}`);
        console.error(`      - merchantOrderCode: ${redemption.merchantOrderCode}`);
        console.error('   3. Manually confirm order in VLinkPay if needed');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // STOP ACTIVATION if VLinkPay fails
        let errorMessage = 'Lỗi xác thực thanh toán từ VLinkPay.';
        
        if (lastError?.code === 'InvalidApiKey' || lastError?.message === 'Api key is invalid') {
          errorMessage = 'Cấu hình hệ thống lỗi (API Key không hợp lệ). Vui lòng liên hệ quản trị viên.';
        } else if (lastError?.status === 400) {
          errorMessage = lastError.message || 'Mã redeem không hợp lệ hoặc đã được sử dụng.';
        } else if (lastError?.message) {
          errorMessage = lastError.message;
        }
        
        return c.json({ 
          success: false, 
          error: errorMessage,
          details: lastError
        }, 400);
      } else {
        console.log('✅ [REDEEM] VLinkPay confirmation successful - revenue recorded!');
      }
      
    } catch (externalError: any) {
      console.error('❌ [REDEEM] Critical error in VLinkPay confirmation process:', externalError);
      console.error('   Stack:', externalError.stack);
      
      return c.json({ 
        success: false, 
        error: `Lỗi hệ thống khi xác thực thanh toán: ${externalError.message}` 
      }, 500);
    }
    
    console.log('✅ [REDEEM] Code validated successfully, proceeding with membership creation...');
    
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