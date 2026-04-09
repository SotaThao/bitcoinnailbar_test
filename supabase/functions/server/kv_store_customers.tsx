/**
 * KV Store Helper for Customers Table
 * Table: kv_store_customers
 * Key Pattern: customer_us:{phone} | customer_vn:{uuid}
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

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

const TABLE_NAME = 'kv_store_customers';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER: Safe JSON parse
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const safeParse = (value: any) => {
  if (typeof value === 'object' && value !== null) return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CRUD OPERATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const customerKV = {
  /**
   * Get customer by key
   */
  async get(key: string) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('key', key)
      .maybeSingle();
    
    if (error) {
      throw error;
    }

    return data ? safeParse(data.value) : null;
  },

  /**
   * Set/Update customer
   */
  async set(key: string, value: any) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value)
      });

    if (error) {
      throw error;
    }
  },

  /**
   * Delete customer by key
   */
  async del(key: string) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('key', key);

    if (error) {
      throw error;
    }
  },

  /**
   * Get multiple customers by keys
   */
  async mget(keys: string[]) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('key, value')
      .in('key', keys);

    if (error) {
      throw error;
    }

    return data.map(row => safeParse(row.value));
  },

  /**
   * Get all customers with prefix
   */
  async getByPrefix(prefix: string) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('key, value')
      .like('key', `${prefix}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(row => safeParse(row.value));
  },

  /**
   * Search customers by phone
   */
  async searchByPhone(phone: string) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('value->>phone', phone)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? safeParse(data.value) : null;
  },

  /**
   * Search customers by name (fuzzy)
   */
  async searchByName(query: string, limit: number = 20) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .ilike('value->>full_name', `%${query}%`)
      .limit(limit);

    if (error) {
      throw error;
    }

    return data.map(row => safeParse(row.value));
  },

  /**
   * Search customers by email
   */
  async searchByEmail(email: string) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('value->>email', email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? safeParse(data.value) : null;
  },

  /**
   * Get ALL customers (no region filter - US market only)
   */
  async getAll(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw error;
    }

    return data.map(row => safeParse(row.value));
  },

  /**
   * Count all customers
   */
  async countAll() {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count || 0;
  },

  /**
   * Full-text search across name, email, phone
   */
  async search(query: string, region?: 'US' | 'VN', limit: number = 20) {
    let supabaseQuery = supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('value->>is_deleted', 'false');

    // Add region filter if specified
    if (region) {
      supabaseQuery = supabaseQuery.eq('value->>region', region);
    }

    // Search in name, email, or phone
    const lowerQuery = query.toLowerCase();
    supabaseQuery = supabaseQuery.or(
      `value->>full_name.ilike.%${lowerQuery}%,value->>email.ilike.%${lowerQuery}%,value->>phone.like.%${lowerQuery}%`
    );

    const { data, error } = await supabaseQuery.limit(limit);

    if (error) {
      throw error;
    }

    return data.map(row => safeParse(row.value));
  }
};