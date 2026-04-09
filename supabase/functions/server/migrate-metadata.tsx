/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * METADATA MIGRATION UTILITY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Progressive migration tool to add metadata to existing KV store entries.
 * 
 * **Usage:**
 * This file can be imported and used in admin endpoints to gradually
 * migrate existing data to include metadata.
 * 
 * **Safety:**
 * - Non-destructive (preserves all existing data)
 * - Backward compatible (can be run multiple times)
 * - Idempotent (skips already migrated entities)
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  type EntityType,
  type EntityStatus,
  type Metadata,
  withMetadata,
  hasMetadata,
  migrateEntity,
} from './metadata.tsx';

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

const KV_TABLE = 'kv_store_89edbd69'; // Admin data table

// ========== ENTITY TYPE MAPPING ==========

/**
 * Map key prefix to entity type
 */
const KEY_PREFIX_TO_TYPE: Record<string, EntityType> = {
  'customer:': 'customer',
  'customer_': 'customer', // customer_phone, customer_email
  'membership:': 'membership',
  'order:': 'order',
  'redeem_code:': 'redeem_code',
  'redeem_history:': 'redeem_history',
  'user:': 'user',
  'permissions:': 'permissions',
  'notification:': 'notification',
  'branch:': 'branch',
  'vlinkpay': 'settings',
  'gallery': 'gallery',
  'menu': 'menu',
  'promotion': 'promotion',
  'service:': 'service',
  'appointment:': 'appointment',
  'role:': 'role',
};

/**
 * Infer entity type from key
 */
function inferEntityType(key: string): EntityType {
  for (const [prefix, type] of Object.entries(KEY_PREFIX_TO_TYPE)) {
    if (key.startsWith(prefix)) {
      return type;
    }
  }
  return 'settings'; // Default fallback
}

// ========== STATUS INFERENCE ==========

/**
 * Infer status from entity data
 */
function inferStatus(data: any, entityType: EntityType): EntityStatus {
  // Check explicit status field
  if (data.status) {
    return data.status as EntityStatus;
  }
  
  // Check is_active flag (users, customers)
  if (data.is_active === false) {
    return 'inactive';
  }
  
  // Check is_deleted flag
  if (data.is_deleted === true) {
    return 'deleted';
  }
  
  // Check expiration (memberships, redeem codes)
  if (data.expiresAt || data.expiryDate) {
    const expiryDate = new Date(data.expiresAt || data.expiryDate);
    if (expiryDate < new Date()) {
      return 'expired';
    }
  }
  
  // Check redeemed status
  if (data.redeemedAt) {
    return 'used';
  }
  
  // Default to active
  return 'active';
}

// ========== MIGRATION FUNCTIONS ==========

/**
 * Migrate single entity
 */
async function migrateSingleEntity(
  key: string,
  value: any
): Promise<{ success: boolean; key: string; error?: string }> {
  try {
    // Skip if already has metadata
    if (hasMetadata(value)) {
      return { success: true, key };
    }

    // Infer entity type from key
    const entityType = inferEntityType(key);

    // Infer status from data
    const status = inferStatus(value, entityType);

    // Create migrated entity
    const migrated = migrateEntity(value, entityType, () => status);
    
    // Save back to KV
    const { error } = await supabase
      .from(KV_TABLE)
      .update({ value: migrated })
      .eq('key', key);
    
    if (error) {
      return { success: false, key, error: error.message };
    }

    return { success: true, key };

  } catch (err: any) {
    return { success: false, key, error: err.message };
  }
}

/**
 * Migrate all entities with a specific key prefix
 */
export async function migrateByPrefix(
  prefix: string
): Promise<{
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: Array<{ key: string; error: string }>;
}> {

  try {
    // Fetch all entities with prefix
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key, value')
      .like('key', `${prefix}%`);
    
    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return { total: 0, migrated: 0, skipped: 0, failed: 0, errors: [] };
    }

    const results = {
      total: data.length,
      migrated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ key: string; error: string }>,
    };
    
    // Process each entity
    for (const row of data) {
      try {
        const value = typeof row.value === 'string' 
          ? JSON.parse(row.value) 
          : row.value;
        
        const result = await migrateSingleEntity(row.key, value);
        
        if (result.success) {
          if (hasMetadata(value)) {
            results.skipped++;
          } else {
            results.migrated++;
          }
        } else {
          results.failed++;
          if (result.error) {
            results.errors.push({ key: result.key, error: result.error });
          }
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({ key: row.key, error: err.message });
      }
    }

    return results;

  } catch (err: any) {
    throw err;
  }
}

/**
 * Migrate ALL entities in the KV store
 */
export async function migrateAll(): Promise<{
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: Array<{ key: string; error: string }>;
}> {

  try {
    // Fetch ALL entities
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key, value');
    
    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return { total: 0, migrated: 0, skipped: 0, failed: 0, errors: [] };
    }

    const results = {
      total: data.length,
      migrated: 0,
      skipped: 0,
      failed: 0,
      errors: [] as Array<{ key: string; error: string }>,
    };
    
    // Process each entity
    for (const row of data) {
      try {
        const value = typeof row.value === 'string' 
          ? JSON.parse(row.value) 
          : row.value;
        
        const result = await migrateSingleEntity(row.key, value);
        
        if (result.success) {
          if (hasMetadata(value)) {
            results.skipped++;
          } else {
            results.migrated++;
          }
        } else {
          results.failed++;
          if (result.error) {
            results.errors.push({ key: result.key, error: result.error });
          }
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({ key: row.key, error: err.message });
      }
    }

    return results;

  } catch (err: any) {
    throw err;
  }
}

// ========== EXAMPLE USAGE ==========

/**
 * Example: Migrate all customers
 * 
 * ```typescript
 * import { migrateByPrefix } from './migrate-metadata.tsx';
 * 
 * const result = await migrateByPrefix('customer:');
 * console.log(result);
 * ```
 */

/**
 * Example: Migrate all entities
 * 
 * ```typescript
 * import { migrateAll } from './migrate-metadata.tsx';
 * 
 * const result = await migrateAll();
 * console.log(result);
 * ```
 */
