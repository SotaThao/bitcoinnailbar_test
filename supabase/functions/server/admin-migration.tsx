/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ADMIN MIGRATION ENDPOINTS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Admin endpoints to trigger metadata migration.
 * 
 * **Endpoints:**
 * - POST /admin/migrate/all - Migrate all entities
 * - POST /admin/migrate/prefix - Migrate by key prefix
 * - GET /admin/migrate/status - Get migration status
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { Hono } from 'npm:hono@4';
import { requireAuth } from './helpers.tsx';
import { migrateAll, migrateByPrefix } from './migrate-metadata.tsx';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { hasMetadata, getEntityStats } from './metadata.tsx';

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

// ========== MIGRATION ENDPOINTS ==========

/**
 * POST /admin/migrate/all
 * Migrate ALL entities in KV store to include metadata
 * Auth: Owner only
 */
app.post('/admin/migrate/all', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Only owner can run migrations
    if (currentUser.role !== 'owner') {
      return c.json({
        success: false,
        error: 'Only owner can run migrations',
      }, 403);
    }
    
    const result = await migrateAll();
    
    return c.json({
      success: true,
      message: 'Migration completed',
      data: result,
    });
    
  } catch (error: any) {
    return c.json({
      success: false,
      error: `Migration failed: ${error.message}`,
    }, 500);
  }
});

/**
 * POST /admin/migrate/prefix
 * Migrate entities with specific key prefix
 * Auth: Owner only
 * 
 * Body: { prefix: "customer:" }
 */
app.post('/admin/migrate/prefix', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Only owner can run migrations
    if (currentUser.role !== 'owner') {
      return c.json({
        success: false,
        error: 'Only owner can run migrations',
      }, 403);
    }
    
    const { prefix } = await c.req.json();
    
    if (!prefix) {
      return c.json({
        success: false,
        error: 'prefix is required',
      }, 400);
    }
    
    const result = await migrateByPrefix(prefix);
    
    return c.json({
      success: true,
      message: `Migration completed for prefix "${prefix}"`,
      data: result,
    });
    
  } catch (error: any) {
    return c.json({
      success: false,
      error: `Migration failed: ${error.message}`,
    }, 500);
  }
});

/**
 * GET /admin/migrate/status
 * Get current migration status (how many entities have metadata)
 * Auth: Owner only
 */
app.get('/admin/migrate/status', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Only owner can check migration status
    if (currentUser.role !== 'owner') {
      return c.json({
        success: false,
        error: 'Only owner can check migration status',
      }, 403);
    }
    
    // Fetch all entities
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key, value');
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return c.json({
        success: true,
        data: {
          total: 0,
          with_metadata: 0,
          without_metadata: 0,
          percentage: 0,
          entities: [],
        },
      });
    }
    
    // Count entities with and without metadata
    let withMetadata = 0;
    let withoutMetadata = 0;
    const entitiesWithMetadata: any[] = [];
    
    for (const row of data) {
      try {
        const value = typeof row.value === 'string' 
          ? JSON.parse(row.value) 
          : row.value;
        
        if (hasMetadata(value)) {
          withMetadata++;
          entitiesWithMetadata.push(value);
        } else {
          withoutMetadata++;
        }
      } catch (err) {
        withoutMetadata++;
      }
    }
    
    const percentage = Math.round((withMetadata / data.length) * 100);

    // Get entity stats
    const stats = entitiesWithMetadata.length > 0
      ? getEntityStats(entitiesWithMetadata)
      : null;

    return c.json({
      success: true,
      data: {
        total: data.length,
        with_metadata: withMetadata,
        without_metadata: withoutMetadata,
        percentage,
        stats,
        need_migration: withoutMetadata > 0,
      },
    });
    
  } catch (error: any) {
    return c.json({
      success: false,
      error: `Failed to check migration status: ${error.message}`,
    }, 500);
  }
});

/**
 * GET /admin/migrate/prefixes
 * List available key prefixes for targeted migration
 * Auth: Owner only
 */
app.get('/admin/migrate/prefixes', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Only owner can check prefixes
    if (currentUser.role !== 'owner') {
      return c.json({
        success: false,
        error: 'Only owner can check prefixes',
      }, 403);
    }
    
    // Fetch all keys
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key');
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return c.json({
        success: true,
        data: [],
      });
    }
    
    // Extract unique prefixes
    const prefixMap = new Map<string, number>();
    
    data.forEach(row => {
      const key = row.key;
      const prefix = key.includes(':') 
        ? key.split(':')[0] + ':' 
        : key.split('_')[0] + '_';
      
      prefixMap.set(prefix, (prefixMap.get(prefix) || 0) + 1);
    });
    
    // Convert to array and sort by count
    const prefixes = Array.from(prefixMap.entries())
      .map(([prefix, count]) => ({ prefix, count }))
      .sort((a, b) => b.count - a.count);
    
    return c.json({
      success: true,
      data: prefixes,
    });
    
  } catch (error: any) {
    return c.json({
      success: false,
      error: `Failed to list prefixes: ${error.message}`,
    }, 500);
  }
});

export { app as adminMigrationApp };
