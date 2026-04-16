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

const KV_TABLE = "kv_store_89edbd69"; // ← Admin data table for redeem codes

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER HELPERS - Direct Postgres Queries
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const customerHelpers = {
  async searchByPhone(phone: string) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('phone', phone)
      .neq('status', 'suspended')
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (not an error)
      log.error('❌ [CUSTOMER] Search by phone error:', error);
      throw error;
    }
    
    return data;
  },

  async searchByEmail(email: string) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('email', email)
      .neq('status', 'suspended')
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      log.error('❌ [CUSTOMER] Search by email error:', error);
      throw error;
    }
    
    return data;
  },

  // ✅ NEW: Get customer by phone OR email
  async getCustomer(identifier: string) {
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      return await this.searchByEmail(identifier);
    } else {
      const normalizedPhone = identifier.replace(/\D/g, '');
      return await this.searchByPhone(normalizedPhone);
    }
  },

  // ✅ NEW: Update membership_history JSONB array
  async updateMembershipHistory(customerId: string, membershipHistory: any[]) {
    const { error } = await supabase
      .from('customer_profiles')
      .update({
        membership_history: membershipHistory,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId);

    if (error) {
      log.error('❌ [CUSTOMER] Update membership_history error:', error);
      throw error;
    }

    log.info('✅ [CUSTOMER] Updated membership_history successfully');
  },

  // ✅ NEW: Update active membership fields + membership_history
  async updateActiveMembership(customerId: string, activeMembership: any, membershipHistory: any[]) {
    const { error } = await supabase
      .from('customer_profiles')
      .update({
        tier: activeMembership.tier,
        membership_start_date: activeMembership.startDate,
        membership_end_date: activeMembership.endDate,
        membership_amount: activeMembership.amount,
        membership_history: membershipHistory,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId);

    if (error) {
      log.error('❌ [CUSTOMER] Update active membership error:', error);
      throw error;
    }

    log.info('✅ [CUSTOMER] Updated active membership successfully');
  },

  // ✅ NEW: Create customer with membership
  async createWithMembership(identifier: string, membership: any, redemption: any) {
    const isEmail = identifier.includes('@');
    const normalizedIdentifier = isEmail ? identifier : identifier.replace(/\D/g, '');
    
    const customerData: any = {
      phone: isEmail ? null : normalizedIdentifier,
      email: isEmail ? normalizedIdentifier : null,
      full_name: redemption.customerName || `Customer ${normalizedIdentifier}`,
      tier: membership.tier,
      membership_start_date: membership.startDate,
      membership_end_date: membership.endDate,
      membership_amount: membership.amount,
      membership_history: [membership],
      status: 'active',
      total_visits: 0,
      lifetime_spend: 0,
      loyalty_points: 0,
      marketing_opt_in: true,
      preferred_language: 'en',
      created_by: 'system_redeem'
    };

    const { data, error } = await supabase
      .from('customer_profiles')
      .insert(customerData)
      .select()
      .single();

    if (error) {
      log.error('❌ [CUSTOMER] Create error:', error);
      throw error;
    }

    log.info('✅ [CUSTOMER] Created with membership:', data.id);
    return data;
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGGING HELPER - Disabled (no-op)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const log = {
  debug: (..._args: any[]) => {},
  info: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {}
};

// Helper to retry failed requests
const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 200): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (String(error).includes("connection error") || String(error).includes("connection reset"))) {
      log.warn(`⚠️ Request failed, retrying... (${retries} left). Error: ${error.message || error}`);
      await new Promise(r => setTimeout(r, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    log.error(`❌ [RETRY] All retries exhausted. Final error:`, error);
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
  'silver': 1,
  'gold': 2,
  'platinum': 3,
  'vip-crypto': 4,
  'diamond': 5
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
  log.info('🔥 [REDEEM] POST /redeem/validate endpoint HIT!');
  log.info('🔥 [REDEEM] Request headers:', c.req.header());
  log.info('🔥 [REDEEM] Request method:', c.req.method);
  log.info('🔥 [REDEEM] Request path:', c.req.path);
  
  try {
    log.info('═══════════════════════════════════════════════════════');
    log.info('🎁 [REDEEM] STARTING MEMBERSHIP ACTIVATION PROCESS');
    log.info('═══════════════════════════════════════════════════════');
    
    const body = await c.req.json();
    const { code, userId } = body;
    
    log.info('📦 [REDEEM] Request body received:', JSON.stringify(body, null, 2));
    
    if (!code || !userId) {
      log.error('❌ [REDEEM] Missing required fields');
      log.error('   - code:', code ? '✓' : '✗');
      log.error('   - userId:', userId ? '✓' : '✗');
      return c.json({ 
        success: false, 
        error: 'Code and userId (phone or email) are required' 
      }, 400);
    }
    
    const normalizedCode = code.toUpperCase().trim();
    log.info(`🔍 [REDEEM] Validating code: ${normalizedCode} for user: ${userId}`);
    
    // 1. Get redeem code from KV
    log.info(`📋 [REDEEM] Querying database for key: redeem_code:${normalizedCode}`);
    const redemption = await kv.get(`redeem_code:${normalizedCode}`);
    
    // 2. Validate code exists
    if (!redemption) {
      log.info('❌ [REDEEM] Code not found in database:', normalizedCode);
      log.info('🔍 [REDEEM] This usually means:');
      log.info('   1. Payment was not completed via /payment/complete-order');
      log.info('   2. VLinkPay redirect did not happen');
      log.info('   3. User clicked "Activate" before complete-order finished');
      return c.json({ 
        success: false, 
        error: 'Mã không hợp lệ. Vui lòng kiểm tra lại.' 
      }, 400);
    }
    
    // 3. Check if already redeemed
    if (redemption.status === 'used') {
      log.info('❌ [REDEEM] Code already used');
      return c.json({ 
        success: false, 
        error: 'Mã này đã được sử dụng.' 
      }, 400);
    }
    
    // 4. Check expiry
    if (new Date() > new Date(redemption.expiresAt)) {
      log.info('❌ [REDEEM] Code expired');
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
    // ⚠️ CRITICAL LOGIC:
    // HTTP Status 200 = SUCCESS → Allow redeem (ignore response body)
    // HTTP Status 400/other = FAILURE → Block activation
    // 
    // Revenue tracking is handled by VLinkPay backend when status = 200.
    // Response body (error/success messages) should be IGNORED per VLinkPay spec.
    // 
    // 🧪 EXCEPTION: Manual/Test codes (isManualCode: true) skip VLinkPay validation
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    log.info('🌐 [REDEEM] Checking if VLinkPay validation is needed...');
    
    let vlinkpayConfirmed = false;
    
    // Check if this is a manual/test code (skip VLinkPay)
    if (redemption.isManualCode === true) {
      log.info('🧪 [REDEEM] Manual/Test code detected - SKIPPING VLinkPay validation');
      log.info('   This code was created manually and does not require payment confirmation');
      vlinkpayConfirmed = true;
    } else {
      // Regular payment code - MUST validate with VLinkPay
      log.info('💳 [REDEEM] Payment code - VLinkPay validation REQUIRED');
      
      try {
        // Get VLINKPAY settings
        const vlinkpaySettings = await kv.get('vlinkpay_settings');
        
        if (!vlinkpaySettings || !vlinkpaySettings.isActive) {
          log.error('❌ [REDEEM] VLINKPAY not configured');
          return c.json({ 
            success: false, 
            error: 'Hệ thống thanh toán chưa được cấu hình. Vui lòng liên hệ quản trị viên.' 
          }, 500);
        }
        
        if (!vlinkpaySettings.secretKey) {
          log.error('❌ [REDEEM] VLINKPAY Secret key not configured');
          return c.json({ 
            success: false, 
            error: 'Secret key chưa được cấu hình. Vui lòng liên hệ quản trị viên.' 
          }, 500);
        }
        
        // Decrypt Secret key
        log.info('🔐 [REDEEM] Decrypting VLINKPAY Secret key...');
        const decryptedSecretKey = await decryptApiKey(vlinkpaySettings.secretKey);
        log.info('✅ [REDEEM] Secret key decrypted successfully');
        
        if (!redemption.merchantOrderCode) {
          log.error('❌ [REDEEM] merchantOrderCode not found in redemption data');
          return c.json({ 
            success: false, 
            error: 'Mã đơn hàng không tìm thấy. Vui lòng liên hệ hỗ trợ.' 
          }, 400);
        }
        
        const baseEndpoint = vlinkpaySettings.sandboxEndpoint.replace(/\/+$/, '');
        const apiUrl = `${baseEndpoint}/gifthubs/public/merchant/redeem`;
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Call VLinkPay API - ONLY check HTTP status code
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        const requestBody = {
          redeemCode: normalizedCode,
          merchantOrderCode: redemption.merchantOrderCode
        };
        
        log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log.info('🧪 [REDEEM] Calling VLinkPay API');
        log.info('   URL:', apiUrl);
        log.info('   Headers:', {
          'Content-Type': 'application/json',
          'Api-key': decryptedSecretKey ? `${decryptedSecretKey.substring(0, 4)}...${decryptedSecretKey.substring(decryptedSecretKey.length - 4)}` : 'MISSING'
        });
        log.info('   Body:', JSON.stringify(requestBody, null, 2));
        log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        let lastError = null;
        
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
          log.info('📥 [REDEEM] VLinkPay Response Status:', response.status, response.statusText);
          log.info('📥 [REDEEM] VLinkPay Raw Response Body:', responseText);
          
          // ⚠️ CRITICAL: ONLY check HTTP status code, IGNORE response body per VLinkPay spec
          if (response.status === 200) {
            log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            log.info('✅ [REDEEM] SUCCESS! VLinkPay confirmed order (HTTP 200)');
            log.info('💰 [REDEEM] Revenue will be recorded in UDSV wallet');
            log.info('⚠️  [REDEEM] Response body ignored per VLinkPay spec');
            log.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            vlinkpayConfirmed = true;
          } else if (response.status === 400) {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // HTTP 400: VLinkPay Redeem Failed (per spec)
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            log.error('❌ [REDEEM] VLinkPay returned HTTP 400 - Redeem Failed');
            log.error('   Spec: HTTP 400 = Invalid or already used redeem code');
            log.error('   Response body:', responseText);
            log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            lastError = {
              status: 400,
              category: 'INVALID_REDEEM_CODE',
              message: 'VLinkPay validation failed - Invalid or used code',
              body: responseText,
              userMessage: 'Mã redeem không hợp lệ hoặc đã được sử dụng trên VLinkPay.'
            };
          } else if (response.status === 401 || response.status === 403) {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // HTTP 401/403: Authentication/Authorization Error
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            log.error(`❌ [REDEEM] VLinkPay returned HTTP ${response.status} - Auth Error`);
            log.error('   Possible causes:');
            log.error('   - Invalid API Secret Key');
            log.error('   - API Key expired or revoked');
            log.error('   - Merchant account suspended');
            log.error('   Response body:', responseText);
            log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            lastError = {
              status: response.status,
              category: 'AUTH_ERROR',
              message: `VLinkPay authentication failed (${response.status})`,
              body: responseText,
              userMessage: 'Lỗi xác thực với VLinkPay. Vui lòng liên hệ quản trị viên kiểm tra API Key.'
            };
          } else if (response.status >= 500) {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // HTTP 500+: VLinkPay Server Error
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            log.error(`❌ [REDEEM] VLinkPay returned HTTP ${response.status} - Server Error`);
            log.error('   VLinkPay is experiencing technical issues');
            log.error('   Response body:', responseText);
            log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            lastError = {
              status: response.status,
              category: 'VLINKPAY_SERVER_ERROR',
              message: `VLinkPay server error (${response.status})`,
              body: responseText,
              userMessage: 'Hệ thống VLinkPay đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.'
            };
          } else {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Other HTTP Status: Unexpected Response
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            log.error(`⚠️  [REDEEM] VLinkPay returned unexpected HTTP ${response.status}`);
            log.error('   This status code is not documented in VLinkPay spec');
            log.error('   Response body:', responseText);
            log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            lastError = {
              status: response.status,
              category: 'UNEXPECTED_STATUS',
              message: `VLinkPay returned unexpected status ${response.status}`,
              body: responseText,
              userMessage: 'Phản hồi không mong đợi từ VLinkPay. Vui lòng liên hệ hỗ trợ.'
            };
          }
          
        } catch (fetchError: any) {
          log.error('❌ [REDEEM] Fetch error:', fetchError.message);
          lastError = { message: fetchError.message, stack: fetchError.stack };
        }
        
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Handle VLinkPay confirmation result
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        if (!vlinkpayConfirmed) {
          log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          log.error('🚨 [REDEEM] VLINKPAY CONFIRMATION FAILED');
          log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          log.error('⚠️  CRITICAL: Revenue will NOT be recorded in UDSV wallet');
          log.error('   Last error:', lastError);
          log.error('');
          log.error('   Possible causes:');
          log.error('   1. VLinkPay API returned non-200 status');
          log.error('   2. Network error or timeout');
          log.error('   3. API endpoint or credentials incorrect');
          log.error('');
          log.error('   NEXT STEPS:');
          log.error('   1. Check VLinkPay dashboard for this order');
          log.error('   2. Contact VLinkPay support with:');
          log.error(`      - redeemCode: ${normalizedCode}`);
          log.error(`      - merchantOrderCode: ${redemption.merchantOrderCode}`);
          log.error('   3. Verify API credentials in VLINKPAY Settings');
          log.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          // STOP ACTIVATION if VLinkPay fails - use specific error message from error object
          const errorMessage = lastError?.userMessage || 'Lỗi xác thực thanh toán từ VLinkPay. Vui lòng liên hệ hỗ trợ.';
          
          return c.json({ 
            success: false, 
            error: errorMessage,
            details: lastError
          }, 400);
        } else {
          log.info('✅ [REDEEM] VLinkPay confirmation successful - proceeding with activation!');
        }
        
      } catch (externalError: any) {
        log.error('❌ [REDEEM] Critical error in VLinkPay confirmation process:', externalError);
        log.error('   Stack:', externalError.stack);
        
        return c.json({ 
          success: false, 
          error: `Lỗi hệ thống khi xác thực thanh toán: ${externalError.message}` 
        }, 500);
      }
    }
    
    log.info('✅ [REDEEM] Code validated successfully, proceeding with membership creation...');
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5. GET CUSTOMER & MEMBERSHIP HISTORY FROM POSTGRES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    log.info('👤 [REDEEM] Fetching customer from Postgres...');
    const normalizedUserId = userId.replace(/[^\d@.]/g, '');
    let customer = await customerHelpers.getCustomer(normalizedUserId);
    
    let membershipHistory: any[] = [];
    
    if (customer) {
      log.info('✅ [REDEEM] Found existing customer:', customer.id);
      // Parse membership_history JSONB (may be null or [])
      membershipHistory = customer.membership_history || [];
      log.info(`📚 [REDEEM] Existing membership history: ${membershipHistory.length} records`);
    } else {
      log.info('🆕 [REDEEM] No existing customer - will create new');
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6. CHECK SAME TIER FOR TIME ACCUMULATION
    // Per MEMBERSHIP_LOGIC.md: Same tier → extend end date
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const sameTierMembership = membershipHistory.find(m => 
      m.tier === redemption.membershipTier && 
      m.status !== 'expired' &&
      new Date(m.endDate) > new Date()
    );
    
    if (sameTierMembership) {
      // ✅ SAME TIER → EXTEND TIME (Cộng dồn)
      log.info(`🔄 [REDEEM] Found existing ${redemption.membershipTier} membership, extending time...`);
      log.info(`   Current end date: ${sameTierMembership.endDate}`);
      
      // Extend from current end date
      const currentEndDate = new Date(sameTierMembership.endDate);
      currentEndDate.setMonth(currentEndDate.getMonth() + redemption.duration);
      sameTierMembership.endDate = currentEndDate.toISOString();
      
      log.info(`   New end date: ${sameTierMembership.endDate} (added ${redemption.duration} months)`);
      
      // Mark code as used
      await kv.set(`redeem_code:${normalizedCode}`, {
        ...redemption,
        status: 'used',
        redeemedAt: new Date().toISOString(),
        redeemedBy: userId
      });
      
      // Update statuses
      membershipHistory = updateActiveMembership(membershipHistory);
      const activeMembership = membershipHistory.find(m => m.status === 'active');
      
      // ✅ UPDATE POSTGRES
      if (customer) {
        await customerHelpers.updateActiveMembership(
          customer.id,
          activeMembership,
          membershipHistory
        );
      } else {
        // Create new customer with extended membership
        customer = await customerHelpers.createWithMembership(
          normalizedUserId,
          sameTierMembership,
          redemption
        );
      }
      
      log.info('✅ [REDEEM] Membership extended successfully');
      
      return c.json({ 
        success: true, 
        data: {
          membership: sameTierMembership,
          activeMembership: activeMembership,
          totalMemberships: membershipHistory.length,
          extended: true
        },
        message: `Kích hoạt thành công! ${redemption.membershipTier.toUpperCase()} membership đã được gia hạn thêm ${redemption.duration} tháng.`
      });
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 7. DIFFERENT TIER → VALIDATE TIER HIERARCHY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    log.info('🔍 [REDEEM] Different tier detected, checking tier hierarchy...');
    
    // Get highest tier from all memberships (active + pending)
    const validMemberships = membershipHistory.filter(m => 
      m.status !== 'expired' && 
      m.status !== 'replaced' &&
      new Date(m.endDate) > new Date()
    );
    
    if (validMemberships.length > 0) {
      // Sort by tier priority to find highest
      validMemberships.sort((a, b) => {
        const priorityA = TIER_PRIORITY[a.tier] || 0;
        const priorityB = TIER_PRIORITY[b.tier] || 0;
        return priorityB - priorityA;
      });
      
      const highestTier = validMemberships[0];
      const highestPriority = TIER_PRIORITY[highestTier.tier] || 0;
      const newTierPriority = TIER_PRIORITY[redemption.membershipTier] || 0;
      
      log.info('⚖️  [REDEEM] Tier comparison:', {
        highestTier: highestTier.tier,
        highestPriority,
        newTier: redemption.membershipTier,
        newTierPriority
      });
      
      // NEW LOGIC: Only allow upgrade (higher tier)
      if (newTierPriority <= highestPriority) {
        log.error('❌ [REDEEM] Cannot redeem: New tier is not higher than current highest tier');
        return c.json({
          success: false,
          error: `Không thể kích hoạt gói ${redemption.membershipTier.toUpperCase()}. Bạn đang có gói ${highestTier.tier.toUpperCase()} (cao hơn hoặc bằng). Chỉ có thể nâng cấp lên gói cao hơn.`,
          currentTier: highestTier.tier,
          newTier: redemption.membershipTier,
          canUpgrade: false
        }, 400);
      }
      
      // NEW LOGIC: Mark replaced memberships
      log.info('✅ [REDEEM] Upgrade allowed, marking lower tiers as replaced...');
      validMemberships.forEach(m => {
        if (m.status === 'active' || m.status === 'pending') {
          m.status = 'replaced';
          log.info(`   → ${m.tier} (${m.id}) marked as 'replaced'`);
        }
      });
    }
    
    const newMembership = {
      id: crypto.randomUUID(),
      tier: redemption.membershipTier,
      startDate: new Date().toISOString(),
      endDate: calculateEndDate(redemption.duration),
      status: 'active', // ← NEW: Immediately active since it's higher tier
      redeemCode: normalizedCode,
      duration: redemption.duration,
      amount: redemption.amount
    };
    
    log.info(`📝 [REDEEM] Created new membership:`, {
      id: newMembership.id,
      tier: newMembership.tier,
      duration: newMembership.duration
    });
    
    // 8. Add to stack
    membershipHistory.push(newMembership);
    
    // 9. Update active membership based on priority
    membershipHistory = updateActiveMembership(membershipHistory);
    
    // 10. Set active membership ID
    const activeMembership = membershipHistory.find(m => m.status === 'active');
    
    // 11. Save to Postgres (not KV!)
    if (customer) {
      // Update existing customer
      await customerHelpers.updateActiveMembership(
        customer.id,
        activeMembership,
        membershipHistory
      );
      log.info('💾 [REDEEM] Updated customer in Postgres');
    } else {
      // Create new customer
      customer = await customerHelpers.createWithMembership(
        normalizedUserId,
        newMembership,
        redemption
      );
      log.info('💾 [REDEEM] Created new customer in Postgres');
    }
    
    // 12. Mark code as used
    await kv.set(`redeem_code:${normalizedCode}`, {
      ...redemption,
      status: 'used',
      redeemedAt: new Date().toISOString(),
      redeemedBy: userId
    });
    log.info('✅ [REDEEM] Marked code as used');
    
    return c.json({ 
      success: true, 
      data: {
        membership: newMembership,
        activeMembership: activeMembership,
        totalMemberships: membershipHistory.length
      },
      message: 'Kích hoạt thành công! Membership ã được áp dụng.'
    });
  } catch (error) {
    log.error('❌ [REDEEM] Error validating code:', error);
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
    log.info(`🔍 [REDEEM] Checking code: ${code}`);
    
    const redemption = await kv.get(`redeem_code:${code}`);
    
    if (!redemption) {
      return c.json({ 
        success: false, 
        valid: false,
        error: 'Code not found' 
      });
    }
    
    const isExpired = new Date() > new Date(redemption.expiresAt);
    const isRedeemed = redemption.status === 'used';
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
    log.error('❌ [REDEEM] Error checking code:', error);
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
    log.info(`📊 [MEMBERSHIP] Fetching active membership for user: ${userId}`);
    
    // ✅ NEW: Read from Postgres customer_profiles table
    const normalizedUserId = userId.replace(/[^\d@.]/g, '');
    const customer = await customerHelpers.getCustomer(normalizedUserId);
    
    if (!customer || !customer.membership_history || customer.membership_history.length === 0) {
      return c.json({ 
        success: true, 
        data: null,
        message: 'No memberships found'
      });
    }
    
    // Update membership statuses based on expiry
    let membershipHistory = updateActiveMembership(customer.membership_history);
    const activeMembership = membershipHistory.find(m => m.status === 'active');
    
    // Save updated statuses back to Postgres
    if (activeMembership) {
      await customerHelpers.updateActiveMembership(
        customer.id,
        activeMembership,
        membershipHistory
      );
    }
    
    return c.json({ 
      success: true, 
      data: {
        activeMembership,
        allMemberships: membershipHistory,
        totalActive: membershipHistory.filter(m => m.status !== 'expired').length
      }
    });
  } catch (error) {
    log.error('❌ [MEMBERSHIP] Error fetching active membership:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch membership: ${error.message}` 
    }, 500);
  }
});

export { app as redeemApp };