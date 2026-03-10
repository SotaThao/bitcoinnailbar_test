/**
 * DEBUG CUSTOMER AUDIT
 * Comprehensive data audit across all customer storage locations
 * Use this to identify data inconsistencies and migration needs
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

/**
 * GET /debug/customer-audit
 * Returns comprehensive audit of customer data across all storage locations
 */
app.get('/make-server-84f9c112/debug/customer-audit', async (c) => {
  try {
    console.log('🔍 [AUDIT] Starting customer data audit...');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. Check Postgres customer_profiles
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const { data: pgCustomers, error: pgError } = await supabase
      .from('customer_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const pgStats = {
      total: pgCustomers?.length || 0,
      active: pgCustomers?.filter((c: any) => c.status === 'active').length || 0,
      suspended: pgCustomers?.filter((c: any) => c.status === 'suspended').length || 0,
      with_membership: pgCustomers?.filter((c: any) => c.tier && c.tier !== 'guest').length || 0,
      tiers: {
        guest: pgCustomers?.filter((c: any) => c.tier === 'guest').length || 0,
        bronze: pgCustomers?.filter((c: any) => c.tier === 'bronze').length || 0,
        silver: pgCustomers?.filter((c: any) => c.tier === 'silver').length || 0,
        gold: pgCustomers?.filter((c: any) => c.tier === 'gold').length || 0,
        platinum: pgCustomers?.filter((c: any) => c.tier === 'platinum').length || 0,
        diamond: pgCustomers?.filter((c: any) => c.tier === 'diamond').length || 0,
      },
      sample_records: pgCustomers?.slice(0, 5).map((c: any) => ({
        id: c.id,
        phone: c.phone,
        full_name: c.full_name,
        tier: c.tier,
        status: c.status,
        total_visits: c.total_visits,
        lifetime_spend: c.lifetime_spend,
        membership_end_date: c.membership_end_date,
        created_at: c.created_at,
      })) || []
    };

    console.log('✅ [AUDIT] Postgres customer_profiles:', pgStats.total, 'records');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. Check KV Store kv_store_84f9c112 (old homepage data)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const { data: kvOldRecords, error: kvOldError } = await supabase
      .from('kv_store_84f9c112')
      .select('key, value')
      .like('key', 'customer:%');

    const kvOldStats = {
      total: kvOldRecords?.length || 0,
      sample_keys: kvOldRecords?.slice(0, 5).map((r: any) => r.key) || []
    };

    console.log('✅ [AUDIT] KV Store (kv_store_84f9c112):', kvOldStats.total, 'customer records');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. Check KV Store kv_store_customers (separate table)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let kvCustomersStats = { total: 0, sample_keys: [], error: null };
    try {
      const { data: kvCustomersRecords, error: kvCustomersError } = await supabase
        .from('kv_store_customers')
        .select('key, value')
        .or('key.like.customer_us:%,key.like.customer_vn:%');

      kvCustomersStats = {
        total: kvCustomersRecords?.length || 0,
        sample_keys: kvCustomersRecords?.slice(0, 5).map((r: any) => r.key) || [],
        error: kvCustomersError
      };

      console.log('✅ [AUDIT] KV Store (kv_store_customers):', kvCustomersStats.total, 'customer records');
    } catch (e) {
      kvCustomersStats.error = `Table might not exist: ${e}`;
      console.log('⚠️ [AUDIT] kv_store_customers table not accessible');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4. Summary & Recommendations
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const totalRecords = pgStats.total + kvOldStats.total + kvCustomersStats.total;
    
    const recommendations = [];
    
    if (kvOldStats.total > 0) {
      recommendations.push({
        severity: 'HIGH',
        issue: `Found ${kvOldStats.total} customer records in OLD KV store (kv_store_84f9c112)`,
        action: 'These should be migrated to Postgres customer_profiles table'
      });
    }

    if (kvCustomersStats.total > 0) {
      recommendations.push({
        severity: 'HIGH',
        issue: `Found ${kvCustomersStats.total} customer records in SEPARATE KV table (kv_store_customers)`,
        action: 'These should be migrated to Postgres customer_profiles table'
      });
    }

    if (pgStats.total === 0 && totalRecords > 0) {
      recommendations.push({
        severity: 'CRITICAL',
        issue: 'Postgres customer_profiles table is EMPTY but data exists in KV stores!',
        action: 'IMMEDIATE MIGRATION REQUIRED - Run migration script to consolidate data'
      });
    }

    if (pgStats.total > 0 && (kvOldStats.total > 0 || kvCustomersStats.total > 0)) {
      recommendations.push({
        severity: 'MEDIUM',
        issue: 'Data fragmentation detected - customers exist in multiple storage locations',
        action: 'Run data consolidation to merge all records into Postgres'
      });
    }

    const auditResult = {
      timestamp: new Date().toISOString(),
      summary: {
        total_records: totalRecords,
        postgres_records: pgStats.total,
        kv_old_records: kvOldStats.total,
        kv_customers_records: kvCustomersStats.total,
        data_fragmented: totalRecords > pgStats.total,
      },
      postgres: {
        ...pgStats,
        error: pgError
      },
      kv_store_84f9c112: kvOldStats,
      kv_store_customers: kvCustomersStats,
      recommendations,
      status: recommendations.length > 0 ? 'ACTION_REQUIRED' : 'HEALTHY',
    };

    console.log('✅ [AUDIT] Audit complete:', auditResult.status);

    return c.json({
      success: true,
      data: auditResult
    });

  } catch (error: any) {
    console.error('❌ [AUDIT] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Audit failed'
    }, 500);
  }
});

/**
 * GET /debug/customer-compare/:phone
 * Compare a specific customer across all storage locations
 */
app.get('/make-server-84f9c112/debug/customer-compare/:phone', async (c) => {
  try {
    const phone = c.req.param('phone');
    const normalizedPhone = phone.replace(/\D/g, ''); // Remove non-digits

    console.log(`🔍 [COMPARE] Searching for phone: ${normalizedPhone}`);

    // Check Postgres
    const { data: pgCustomer } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    // Check KV old
    const { data: kvOldRecords } = await supabase
      .from('kv_store_84f9c112')
      .select('key, value')
      .like('key', 'customer:%');

    const kvOldMatch = kvOldRecords?.find((r: any) => {
      try {
        const value = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
        return value.phone?.replace(/\D/g, '') === normalizedPhone;
      } catch {
        return false;
      }
    });

    // Check KV customers
    let kvCustomersMatch = null;
    try {
      const { data: kvCustomersRecord } = await supabase
        .from('kv_store_customers')
        .select('key, value')
        .eq('key', `customer_us:${normalizedPhone}`)
        .maybeSingle();

      kvCustomersMatch = kvCustomersRecord;
    } catch (e) {
      console.log('⚠️ kv_store_customers not accessible');
    }

    const comparison = {
      phone: normalizedPhone,
      found_in: {
        postgres: !!pgCustomer,
        kv_old: !!kvOldMatch,
        kv_customers: !!kvCustomersMatch,
      },
      data: {
        postgres: pgCustomer || null,
        kv_old: kvOldMatch ? (typeof kvOldMatch.value === 'string' ? JSON.parse(kvOldMatch.value) : kvOldMatch.value) : null,
        kv_customers: kvCustomersMatch ? (typeof kvCustomersMatch.value === 'string' ? JSON.parse(kvCustomersMatch.value) : kvCustomersMatch.value) : null,
      },
      conflicts: []
    };

    // Detect conflicts
    const locations = Object.keys(comparison.found_in).filter((k: string) => comparison.found_in[k as keyof typeof comparison.found_in]);
    
    if (locations.length > 1) {
      comparison.conflicts.push({
        severity: 'HIGH',
        issue: `Customer exists in ${locations.length} different storage locations`,
        locations
      });
    }

    return c.json({
      success: true,
      data: comparison
    });

  } catch (error: any) {
    console.error('❌ [COMPARE] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Comparison failed'
    }, 500);
  }
});

export { app as debugCustomerAuditApp };
