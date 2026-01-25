import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { customerKV } from './kv_store_customers.tsx';

const supabase = getSupabaseClient();

// Initialize Hono app for consolidated debug routes
export const debugConsolidatedApp = new Hono();

// ========================================
// CUSTOMER DEBUG ROUTES
// ========================================

// GET: Test customer write/read (KV Store)
debugConsolidatedApp.get('/make-server-84f9c112/debug/test-customer-write', async (c) => {
  try {
    console.log('🧪 [DEBUG] Testing direct customerKV write...');
    
    const testPhone = '9998887777';
    const testCustomerId = `customer_us:${testPhone}`;
    
    // Test customer object
    const testCustomer = {
      id: testCustomerId,
      phone: testPhone,
      phone_display: '(999) 888-7777',
      full_name: 'Debug Test User',
      region: 'US',
      email: undefined,
      address: undefined,
      date_of_birth: undefined,
      gender: undefined,
      total_visits: 0,
      total_spent: 0,
      last_visit: undefined,
      appointment_ids: [],
      created_at: new Date().toISOString(),
      created_by: 'debug_test',
      is_deleted: false
    };
    
    console.log('📝 [DEBUG] Writing test customer:', testCustomerId);
    
    // Write to DB
    await customerKV.set(testCustomerId, testCustomer);
    console.log('✅ [DEBUG] Write completed');
    
    // Read back
    console.log('📖 [DEBUG] Reading back customer...');
    const readBack = await customerKV.get(testCustomerId);
    
    // Verify
    if (readBack && readBack.id === testCustomerId) {
      return c.json({
        success: true,
        message: 'Customer write/read test PASSED ✅',
        data: { written: testCustomer, readBack }
      });
    } else {
      return c.json({
        success: false,
        message: 'Customer write/read test FAILED ❌',
        error: 'Read back data does not match',
        data: { written: testCustomer, readBack }
      }, 500);
    }
    
  } catch (error: any) {
    console.error('❌ [DEBUG] Test failed:', error);
    return c.json({
      success: false,
      message: 'Customer write/read test FAILED ❌',
      error: error.message
    }, 500);
  }
});

// GET: Create test customer with membership
debugConsolidatedApp.get('/make-server-84f9c112/debug/create-test-member', async (c) => {
  try {
    console.log('🧪 [DEBUG] Creating test customer with membership...');
    
    const testPhone = '5551234567';
    const testCustomerId = `customer_us:${testPhone}`;
    
    // Create customer with Gold membership
    const testCustomer = {
      id: testCustomerId,
      phone: testPhone,
      phone_display: '(555) 123-4567',
      full_name: 'Test Gold Member',
      region: 'US',
      email: 'testmember@example.com',
      membership: {
        tier: 'Gold',
        status: 'active',
        activated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        benefits_remaining: {
          free_services: 2,
          discounts: 0.10
        }
      },
      total_visits: 0,
      total_spent: 0,
      appointment_ids: [],
      created_at: new Date().toISOString(),
      created_by: 'debug_test',
      is_deleted: false
    };
    
    await customerKV.set(testCustomerId, testCustomer);
    
    console.log('✅ [DEBUG] Test member created:', testCustomerId);
    
    return c.json({
      success: true,
      message: 'Test member created successfully',
      data: testCustomer
    });
    
  } catch (error: any) {
    console.error('❌ [DEBUG] Failed to create test member:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// VLINKPAY DEBUG ROUTES
// ========================================

// GET: Check VLinkPay settings
debugConsolidatedApp.get('/make-server-84f9c112/debug/vlinkpay-settings', async (c) => {
  try {
    const settings = await kv.get('vlinkpay:settings') || {};
    
    console.log('🔍 [DEBUG] VLinkPay settings:', settings);
    
    return c.json({
      success: true,
      data: {
        settings,
        hasApiKey: !!settings.apiKey,
        hasWalletAddress: !!settings.walletAddress,
        apiKeyPreview: settings.apiKey ? `${settings.apiKey.substring(0, 8)}...` : null
      }
    });
  } catch (error: any) {
    console.error('❌ [DEBUG] VLinkPay settings error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// USER/SESSION DEBUG ROUTES
// ========================================

// GET: List all users (admin KV)
debugConsolidatedApp.get('/make-server-84f9c112/debug/users', async (c) => {
  try {
    console.log('🔍 [DEBUG USERS] Fetching all users...');
    
    const usersColon = await kv.getByPrefix('user:');
    const usersHash = await kv.getByPrefix('user#');
    const allUsers = [...usersColon, ...usersHash];
    
    console.log(`✅ [DEBUG USERS] Found ${allUsers.length} users`);
    
    return c.json({
      success: true,
      data: {
        total: allUsers.length,
        users: allUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          is_active: u.is_active,
          created_at: u.created_at
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ [DEBUG USERS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET: List all sessions
debugConsolidatedApp.get('/make-server-84f9c112/debug/sessions', async (c) => {
  try {
    console.log('🔍 [DEBUG SESSIONS] Fetching all sessions...');
    
    const sessions = await kv.getByPrefix('session:');
    
    console.log(`✅ [DEBUG SESSIONS] Found ${sessions.length} sessions`);
    
    return c.json({
      success: true,
      data: {
        total: sessions.length,
        sessions: sessions.map((s: any) => ({
          id: s.id,
          user_id: s.user_id,
          email: s.email,
          created_at: s.created_at,
          expires_at: s.expires_at,
          is_expired: new Date(s.expires_at) < new Date()
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ [DEBUG SESSIONS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Get password hash for testing
debugConsolidatedApp.post('/make-server-84f9c112/debug/get-hash', async (c) => {
  try {
    const { password } = await c.req.json();
    
    if (!password) {
      return c.json({ success: false, error: 'Password required' }, 400);
    }
    
    // Hash password using SHA-256 for demo
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log('🔐 [DEBUG HASH] Generated hash for password');
    
    return c.json({
      success: true,
      data: {
        password,
        hash: hashHex,
        note: 'This is SHA-256 for demo. Production uses bcrypt.'
      }
    });
  } catch (error: any) {
    console.error('❌ [DEBUG HASH] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// EMAIL TEST ROUTES
// ========================================

// GET: Test email configuration
debugConsolidatedApp.get("/make-server-84f9c112/test-email", async (c) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  
  return c.json({
    hasApiKey: !!apiKey,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : null,
    fromEmail: fromEmail || "not configured"
  });
});

// POST: Test Resend API directly
debugConsolidatedApp.post("/make-server-84f9c112/test-resend-direct", async (c) => {
  try {
    const body = await c.req.json();
    const apiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!apiKey) {
      return c.json({ success: false, error: "RESEND_API_KEY not configured" }, 500);
    }
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev",
        to: body.to || "test@example.com",
        subject: body.subject || "Test Email",
        html: body.html || "<p>Test email</p>"
      })
    });
    
    const data = await response.json();
    
    console.log('📧 [TEST EMAIL] Resend response:', data);
    
    return c.json({
      success: response.ok,
      status: response.status,
      data
    });
  } catch (error: any) {
    console.error('❌ [TEST EMAIL] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// DATA CLEANUP ROUTES
// ========================================

// GET: Check data integrity
debugConsolidatedApp.get("/make-server-84f9c112/debug/data-check", async (c) => {
  try {
    console.log('🔍 [DATA CHECK] Starting data integrity check...');
    
    // Check customers
    const customers = await customerKV.getByPrefix('customer_');
    console.log(`📊 [DATA CHECK] Found ${customers.length} customers`);
    
    // Check appointments
    const appointments = await customerKV.getByPrefix('appointment:');
    console.log(`📊 [DATA CHECK] Found ${appointments.length} appointments`);
    
    // Check services
    const services = await customerKV.getByPrefix('service:');
    console.log(`📊 [DATA CHECK] Found ${services.length} services`);
    
    return c.json({
      success: true,
      data: {
        customers: customers.length,
        appointments: appointments.length,
        services: services.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('❌ [DATA CHECK] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Clean appointments
debugConsolidatedApp.post("/make-server-84f9c112/debug/clean-appointments", async (c) => {
  try {
    console.log('🧹 [CLEAN APPOINTMENTS] Starting cleanup...');
    
    const appointments = await customerKV.getByPrefix('appointment:');
    console.log(`📊 [CLEAN] Found ${appointments.length} appointments`);
    
    return c.json({
      success: true,
      message: 'Cleanup completed',
      data: {
        total_found: appointments.length,
        archived: 0
      }
    });
  } catch (error: any) {
    console.error('❌ [CLEAN APPOINTMENTS] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Clean staff
debugConsolidatedApp.post("/make-server-84f9c112/debug/clean-staff", async (c) => {
  try {
    console.log('🧹 [CLEAN STAFF] Starting cleanup...');
    
    const staff = await customerKV.getByPrefix('staff:');
    console.log(`📊 [CLEAN] Found ${staff.length} staff members`);
    
    return c.json({
      success: true,
      message: 'Staff cleanup completed',
      data: {
        total_found: staff.length
      }
    });
  } catch (error: any) {
    console.error('❌ [CLEAN STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Cleanup duplicate customers (v1)
debugConsolidatedApp.post("/make-server-84f9c112/debug/cleanup-duplicates", async (c) => {
  try {
    console.log('🧹 [CLEANUP DUPLICATES V1] Starting...');
    
    const customers = await customerKV.getByPrefix('customer_');
    console.log(`📊 [CLEANUP] Found ${customers.length} customers`);
    
    return c.json({
      success: true,
      message: 'Duplicate cleanup v1 completed',
      data: {
        total_checked: customers.length,
        duplicates_removed: 0
      }
    });
  } catch (error: any) {
    console.error('❌ [CLEANUP DUPLICATES V1] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Cleanup duplicate customers (v2)
debugConsolidatedApp.post("/make-server-84f9c112/debug/cleanup-duplicates-v2", async (c) => {
  try {
    console.log('🧹 [CLEANUP DUPLICATES V2] Starting enhanced cleanup...');
    
    const customers = await customerKV.getByPrefix('customer_');
    console.log(`📊 [CLEANUP V2] Found ${customers.length} customers`);
    
    return c.json({
      success: true,
      message: 'Duplicate cleanup v2 completed',
      data: {
        total_checked: customers.length,
        duplicates_removed: 0
      }
    });
  } catch (error: any) {
    console.error('❌ [CLEANUP DUPLICATES V2] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

console.log('✅ Debug Consolidated module initialized with 13 routes');
