import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as jose from 'npm:jose@5.2.0';

// ========== CONSTANTS ==========
export const JWT_SECRET = new TextEncoder().encode(
  Deno.env.get('JWT_SECRET') || 'bitcoin-nail-bar-secret-key-change-in-production'
);

export const KV_TABLE = "kv_store_89edbd69";

// ========== SUPABASE CLIENT ==========
// Use a single shared Supabase client to prevent connection reset issues
export const supabase = createClient(
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

// ========== TYPE DEFINITIONS ==========
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'owner' | 'admin' | 'staff';
  avatar_url?: string;
  is_active: boolean;
  password_hash?: string;
  created_at: string;
  created_by: string;
  last_login?: string;
  permissions?: Permissions;
}

export interface Session {
  token: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

export interface StaffDetails {
  user_id: string;
  employee_id: string;
  experience_level: 'senior' | 'full' | 'probation';
  employment_type: 'full-time' | 'part-time';
  hourly_rate?: number;
  commission_rate?: number;
  start_date: string;
  specialties?: string[];
  notes?: string;
}

export interface Permissions {
  user_id: string;
  can_manage_services: boolean;
  can_manage_staff: boolean;
  can_view_reports: boolean;
  can_manage_appointments: boolean;
  can_process_payments: boolean;
  can_view_analytics: boolean;
  can_manage_settings: boolean;
}

// ========== RETRY HELPER ==========
export const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 200): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    // Retry on network/connection errors
    if (retries > 0 && (String(error).includes("connection error") || String(error).includes("connection reset") || String(error).includes("TypeError"))) {
      console.warn(`⚠️ Request failed, retrying... (${retries} left). Error: ${error.message || error}`);
      await new Promise(r => setTimeout(r, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    console.error(`❌ [RETRY] All retries exhausted. Final error:`, error);
    throw error;
  }
};

// ========== KV STORE ==========
export const kv = {
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
  },
  async getByPrefix(prefix: string) {
    return retry(async () => {
      const { data, error } = await supabase.from(KV_TABLE).select("value").like("key", prefix + "%");
      if (error) throw new Error(`[KV GETBYPREFIX] ${error.message || JSON.stringify(error)}`);
      return data?.map((d: any) => d.value) ?? [];
    });
  },
  async mdel(keys: string[]) {
    return retry(async () => {
      const { error } = await supabase.from(KV_TABLE).delete().in("key", keys);
      if (error) throw new Error(`[KV MDEL] ${error.message || JSON.stringify(error)}`);
    });
  }
};

// ========== ID GENERATORS ==========
export const generateUserId = () => crypto.randomUUID();
export const generateSessionToken = () => crypto.randomUUID();

// ========== PASSWORD HELPERS ==========
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// ========== JWT HELPERS ==========
export const generateJWT = async (user: User): Promise<string> => {
  const payload = {
    sub: user.id, // subject (user ID)
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    permissions: {
      can_manage_services: user.permissions?.can_manage_services || false,
      can_manage_staff: user.permissions?.can_manage_staff || false,
      can_view_reports: user.permissions?.can_view_reports || false,
      can_manage_appointments: user.permissions?.can_manage_appointments || false,
      can_process_payments: user.permissions?.can_process_payments || false,
      can_view_analytics: user.permissions?.can_view_analytics || false,
      can_manage_settings: user.permissions?.can_manage_settings || false,
    },
  };

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(JWT_SECRET);

  return jwt;
};

export const verifyJWT = async (token: string): Promise<any> => {
  try {
    // 1. Try custom JWT verification first (Custom Auth)
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (customError) {
    // 2. If custom verification fails, try Supabase Auth verification
    try {
      const { data: { user }, error: sbError } = await supabase.auth.getUser(token);
      
      if (sbError || !user) {
        // If both fail, log the first error (usually more relevant if we expected custom auth)
        // But if signature failed, it might be Supabase token, so checking user is the right fallback.
        console.error('❌ [JWT] Verification failed (Custom & Supabase):', customError);
        return null;
      }
      
      // Map Supabase User to our internal User/Payload format
      // Supabase users might not have all the custom fields we expect, so provide defaults.
      return {
        sub: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'staff', // Fallback role
        full_name: user.user_metadata?.full_name || user.email,
        permissions: user.user_metadata?.permissions || {},
        is_supabase_user: true
      };
    } catch (error) {
      console.error('❌ [JWT] Supabase verification exception:', error);
      return null;
    }
  }
};

// ========== MIDDLEWARE HELPERS ==========
export const requireAuth = async (c: any, next: any) => {
  // Check for custom session token first (bypasses Supabase Gateway verification)
  let token = c.req.header('X-Session-Token');
  
  // Fallback to Authorization header if X-Session-Token is missing
  if (!token) {
    const authHeader = c.req.header('Authorization');
    token = authHeader?.replace('Bearer ', '');
  }

  if (!token) {
    return c.json({ success: false, error: 'Missing authorization header' }, 401);
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }

  // Attach user info to context for downstream handlers
  c.set('user', payload);
  await next();
};

export const requirePermission = (permission: string) => {
  return async (c: any, next: any) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    // Owner has all permissions
    if (user.role === 'owner') {
      await next();
      return;
    }

    // Check specific permission
    if (!user.permissions || !user.permissions[permission]) {
      return c.json({ 
        success: false, 
        error: `Permission denied: ${permission} required` 
      }, 403);
    }

    await next();
  };
};
