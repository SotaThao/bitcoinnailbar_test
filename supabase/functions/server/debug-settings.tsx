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

const KV_TABLE = 'kv_store_89edbd69';

// GET debug/vlinkpay-settings (without prefix since it will be mounted with prefix)
app.get('/debug/vlinkpay-settings', async (c) => {
  try {
    console.log('🔍 [DEBUG] Fetching VLinkPay settings from database...');
    
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('value')
      .eq('key', 'vlinkpay_settings')
      .maybeSingle();
    
    if (error) {
      console.error('❌ [DEBUG] Error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    if (!data) {
      console.log('⚠️ [DEBUG] No settings found');
      return c.json({ success: false, message: 'No settings found' }, 404);
    }
    
    // Parse value - it might be string or object
    let settings;
    try {
      settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    } catch (parseError) {
      console.error('❌ [DEBUG] Failed to parse settings:', parseError);
      return c.json({ success: false, error: 'Invalid settings format' }, 500);
    }
    
    console.log('📊 [DEBUG] Settings structure:', {
      hasApiKey: !!settings.apiKey,
      apiKeyLength: settings.apiKey?.length || 0,
      apiKeyPreview: settings.apiKey ? settings.apiKey.substring(0, 20) + '...' : 'N/A',
      hasSecretKey: !!settings.secretKey,
      secretKeyLength: settings.secretKey?.length || 0,
      secretKeyPreview: settings.secretKey ? settings.secretKey.substring(0, 20) + '...' : 'N/A',
      hasMerchantRefCode: !!settings.merchantRefCode,
      merchantRefCode: settings.merchantRefCode,
      sandboxEndpoint: settings.sandboxEndpoint,
      isActive: settings.isActive,
      allKeys: Object.keys(settings)
    });
    
    return c.json({
      success: true,
      data: {
        hasApiKey: !!settings.apiKey,
        apiKeyLength: settings.apiKey?.length || 0,
        hasSecretKey: !!settings.secretKey,
        secretKeyLength: settings.secretKey?.length || 0,
        merchantRefCode: settings.merchantRefCode,
        sandboxEndpoint: settings.sandboxEndpoint,
        redirectUrl: settings.redirectUrl,
        isActive: settings.isActive,
        allFields: Object.keys(settings),
        updatedAt: settings.updatedAt
      }
    });
  } catch (err: any) {
    console.error('❌ [DEBUG] Exception:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

export { app as debugSettingsApp };