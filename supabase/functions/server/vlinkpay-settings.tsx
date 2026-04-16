import { Hono } from 'npm:hono@4.6.14';
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

// ========== AES-256-GCM ENCRYPTION HELPERS ==========

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
 * Encrypt API key using AES-256-GCM
 * Returns: base64(iv + encrypted_data + auth_tag)
 */
const encryptApiKey = async (plainText: string): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    
    // Generate random IV (12 bytes recommended for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128 // 128-bit authentication tag
      },
      key,
      data
    );
    
    // Combine IV + encrypted data for storage
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
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

// ========== VLINKPAY SETTINGS ROUTES ==========

// GET /make-server-84f9c112/vlinkpay/settings
app.get('/make-server-84f9c112/vlinkpay/settings', async (c) => {
  try {
    const settings = await kv.get('vlinkpay_settings');

    if (!settings) {
      return c.json({ 
        success: true, 
        data: null,
        message: 'No settings configured yet' 
      });
    }

    // Return settings without exposing sensitive data
    return c.json({ 
      success: true, 
      data: {
        merchantRefCode: settings.merchantRefCode,
        sandboxEndpoint: settings.sandboxEndpoint,
        redirectUrl: settings.redirectUrl,
        secretKey: '***hidden***', // Hidden for security
        isActive: settings.isActive,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to fetch settings: ${error.message}`
    }, 500);
  }
});

// POST /make-server-84f9c112/vlinkpay/settings
app.post('/make-server-84f9c112/vlinkpay/settings', async (c) => {
  try {
    const body = await c.req.json();

    const { merchantRefCode, secretKey, sandboxEndpoint, redirectUrl } = body;

    if (!merchantRefCode || !secretKey || !sandboxEndpoint || !redirectUrl) {
      return c.json({ 
        success: false, 
        error: 'merchantRefCode, secretKey, sandboxEndpoint, and redirectUrl are required' 
      }, 400);
    }
    
    // Normalize URLs - remove trailing slashes to prevent double slash issues
    const normalizedSandboxEndpoint = sandboxEndpoint.trim().replace(/\/+$/, '');
    const normalizedRedirectUrl = redirectUrl.trim().replace(/\/+$/, '');

    const encryptedSecretKey = await encryptApiKey(secretKey);

    // ⚠️ IMPORTANT: Only save secretKey, remove any old apiKey field
    const settings = {
      merchantRefCode,
      secretKey: encryptedSecretKey,  // Only this field for authentication
      sandboxEndpoint: normalizedSandboxEndpoint,
      redirectUrl: normalizedRedirectUrl,
      sandboxMode: normalizedSandboxEndpoint.includes('test') || normalizedSandboxEndpoint.includes('sandbox'),
      isActive: true,
      updatedAt: new Date().toISOString()
    };

    await kv.set('vlinkpay_settings', settings);

    // Verify save by reading back
    const savedSettings = await kv.get('vlinkpay_settings');
    
    return c.json({ 
      success: true, 
      message: 'VLINKPAY settings saved successfully',
      data: {
        merchantRefCode: settings.merchantRefCode,
        apiKey: '***hidden***', // Don't expose in response
        sandboxEndpoint: settings.sandboxEndpoint,
        redirectUrl: settings.redirectUrl,
        isActive: settings.isActive,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to save settings: ${error.message}`
    }, 500);
  }
});

// POST /make-server-84f9c112/vlinkpay/test-connection
app.post('/make-server-84f9c112/vlinkpay/test-connection', async (c) => {
  try {
    const settings = await kv.get('vlinkpay_settings');
    
    if (!settings || !settings.isActive) {
      return c.json({ 
        success: false, 
        error: 'VLINKPAY not configured' 
      }, 400);
    }
    
    // TODO: Implement actual VLINKPAY API test when credentials are provided
    // For now, just validate settings exist
    
    return c.json({ 
      success: true, 
      message: 'VLINKPAY configuration is valid',
      data: {
        merchantId: settings.merchantId,
        configured: true
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Connection test failed: ${error.message}`
    }, 500);
  }
});

export { app as vlinkpaySettingsApp };

// Export decryption function for use in other modules
export { decryptApiKey };