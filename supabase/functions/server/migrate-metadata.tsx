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
      console.log(`⏭️ [MIGRATE] Skipping (already migrated): ${key}`);
      return { success: true, key };
    }
    
    // Infer entity type from key
    const entityType = inferEntityType(key);
    
    // Infer status from data
    const status = inferStatus(value, entityType);
    
    console.log(`🔄 [MIGRATE] Migrating ${key} → Type: ${entityType}, Status: ${status}`);
    
    // Create migrated entity
    const migrated = migrateEntity(value, entityType, () => status);
    
    // Save back to KV
    const { error } = await supabase
      .from(KV_TABLE)
      .update({ value: migrated })
      .eq('key', key);
    
    if (error) {
      console.error(`❌ [MIGRATE] Failed to update ${key}:`, error);
      return { success: false, key, error: error.message };
    }
    
    console.log(`✅ [MIGRATE] Success: ${key}`);
    return { success: true, key };
    
  } catch (err: any) {
    console.error(`❌ [MIGRATE] Exception for ${key}:`, err);
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
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🚀 [MIGRATE] Starting migration for prefix: ${prefix}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  try {
    // Fetch all entities with prefix
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key, value')
      .like('key', `${prefix}%`);
    
    if (error) {
      console.error(`❌ [MIGRATE] Failed to fetch entities:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log(`ℹ️ [MIGRATE] No entities found with prefix: ${prefix}`);
      return { total: 0, migrated: 0, skipped: 0, failed: 0, errors: [] };
    }
    
    console.log(`📊 [MIGRATE] Found ${data.length} entities to process\n`);
    
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
        console.error(`❌ [MIGRATE] Failed to process ${row.key}:`, err);
        results.failed++;
        results.errors.push({ key: row.key, error: err.message });
      }
    }
    
    // Print summary
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 [MIGRATE] Migration Summary for "${prefix}"`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total:    ${results.total}`);
    console.log(`Migrated: ${results.migrated} ✅`);
    console.log(`Skipped:  ${results.skipped} ⏭️`);
    console.log(`Failed:   ${results.failed} ❌`);
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      results.errors.forEach(({ key, error }) => {
        console.log(`   - ${key}: ${error}`);
      });
    }
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    return results;
    
  } catch (err: any) {
    console.error(`❌ [MIGRATE] Migration failed:`, err);
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
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🚀 [MIGRATE ALL] Starting full KV store migration`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  try {
    // Fetch ALL entities
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key, value');
    
    if (error) {
      console.error(`❌ [MIGRATE ALL] Failed to fetch entities:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log(`ℹ️ [MIGRATE ALL] No entities found in KV store`);
      return { total: 0, migrated: 0, skipped: 0, failed: 0, errors: [] };
    }
    
    console.log(`📊 [MIGRATE ALL] Found ${data.length} entities to process\n`);
    
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
        console.error(`❌ [MIGRATE ALL] Failed to process ${row.key}:`, err);
        results.failed++;
        results.errors.push({ key: row.key, error: err.message });
      }
    }
    
    // Print summary
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 [MIGRATE ALL] Migration Complete`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Total:    ${results.total}`);
    console.log(`Migrated: ${results.migrated} ✅`);
    console.log(`Skipped:  ${results.skipped} ⏭️`);
    console.log(`Failed:   ${results.failed} ❌`);
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      results.errors.slice(0, 10).forEach(({ key, error }) => {
        console.log(`   - ${key}: ${error}`);
      });
      if (results.errors.length > 10) {
        console.log(`   ... and ${results.errors.length - 10} more errors`);
      }
    }
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    return results;
    
  } catch (err: any) {
    console.error(`❌ [MIGRATE ALL] Migration failed:`, err);
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
