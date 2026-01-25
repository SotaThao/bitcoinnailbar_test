/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * KV STORE HELPERS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Type-safe KV Store operations with retry logic
 * 
 * 🚨 CRITICAL: Use the correct KV table for your data!
 * - kvAdmin: For admin/backend data (kv_store_89edbd69)
 * - kvHomepage: For public/homepage data (kv_store_84f9c112)
 */

import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { retry } from './_shared_retry.tsx';
import { KV_TABLE_ADMIN, KV_TABLE_HOMEPAGE } from './_shared_constants.tsx';

/**
 * KV Store interface
 */
export interface KVStore {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T): Promise<void>;
  getByPrefix<T = any>(prefix: string): Promise<T[]>;
  mdel(keys: string[]): Promise<void>;
  mget<T = any>(keys: string[]): Promise<T[]>;
  mset<T = any>(entries: { key: string; value: T }[]): Promise<void>;
}

/**
 * Create KV Store instance for a specific table
 */
const createKVStore = (tableName: string): KVStore => {
  const supabase = getSupabaseClient();

  return {
    /**
     * Get a single value by key
     */
    async get<T = any>(key: string): Promise<T | null> {
      return retry(async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select("value")
          .eq("key", key)
          .maybeSingle();
        
        if (error) {
          throw new Error(`[KV GET] ${error.message || JSON.stringify(error)}`);
        }
        
        return data?.value ?? null;
      });
    },

    /**
     * Set a single key-value pair (upsert)
     */
    async set<T = any>(key: string, value: T): Promise<void> {
      return retry(async () => {
        const { error } = await supabase
          .from(tableName)
          .upsert({ key, value });
        
        if (error) {
          throw new Error(`[KV SET] ${error.message || JSON.stringify(error)}`);
        }
      });
    },

    /**
     * Get all values with keys matching a prefix
     */
    async getByPrefix<T = any>(prefix: string): Promise<T[]> {
      return retry(async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select("value")
          .like("key", `${prefix}%`);
        
        if (error) {
          throw new Error(`[KV GETBYPREFIX] ${error.message || JSON.stringify(error)}`);
        }
        
        return data?.map((d: any) => d.value) ?? [];
      });
    },

    /**
     * Delete multiple keys
     */
    async mdel(keys: string[]): Promise<void> {
      if (keys.length === 0) return;
      
      return retry(async () => {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .in("key", keys);
        
        if (error) {
          throw new Error(`[KV MDEL] ${error.message || JSON.stringify(error)}`);
        }
      });
    },

    /**
     * Get multiple values by keys
     */
    async mget<T = any>(keys: string[]): Promise<T[]> {
      if (keys.length === 0) return [];
      
      return retry(async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select("key, value")
          .in("key", keys);
        
        if (error) {
          throw new Error(`[KV MGET] ${error.message || JSON.stringify(error)}`);
        }
        
        // Maintain order of input keys
        const valueMap = new Map(data?.map((d: any) => [d.key, d.value]) ?? []);
        return keys.map(key => valueMap.get(key)).filter((v): v is T => v !== undefined);
      });
    },

    /**
     * Set multiple key-value pairs (batch upsert)
     */
    async mset<T = any>(entries: { key: string; value: T }[]): Promise<void> {
      if (entries.length === 0) return;
      
      return retry(async () => {
        const { error } = await supabase
          .from(tableName)
          .upsert(entries);
        
        if (error) {
          throw new Error(`[KV MSET] ${error.message || JSON.stringify(error)}`);
        }
      });
    },
  };
};

/**
 * KV Store for Admin/Backend data
 * 
 * Use this for:
 * - VLinkPay settings
 * - Redeem codes
 * - Membership data
 * - Payment records
 * - User management
 * - Auth tokens
 * - Admin configurations
 */
export const kvAdmin = createKVStore(KV_TABLE_ADMIN);

/**
 * KV Store for Homepage/Public data
 * 
 * Use this for:
 * - Service categories
 * - Services menu
 * - Gallery images
 * - Promotions
 * - Public-facing content
 */
export const kvHomepage = createKVStore(KV_TABLE_HOMEPAGE);

/**
 * Legacy compatibility: Default to admin table
 * @deprecated Use kvAdmin or kvHomepage explicitly
 */
export const kv = kvAdmin;
