/**
 * CUSTOMER MIGRATION TO POSTGRES
 * Migrates customers from KV stores to customer_profiles table
 * Supports dry-run mode for safety
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAuth, requirePermission } from './helpers.tsx';

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

/**
 * POST /admin/migrate/customers-to-postgres
 * Migrate customers from KV stores to Postgres
 */
app.post('/make-server-84f9c112/admin/migrate/customers-to-postgres', requireAuth, requirePermission('can_manage_appointments'), async (c) => {
  try {
    const body = await c.req.json();
    const dryRun = body.dry_run !== false; // Default true for safety
    const mergeStrategy = body.merge_strategy || 'postgres_priority'; // postgres_priority | kv_priority | merge_max
    const deleteOldData = body.delete_old_data === true; // Default false for safety

    console.log('🚀 [MIGRATION] Starting customer migration...');
    console.log(`   Dry run: ${dryRun}`);
    console.log(`   Merge strategy: ${mergeStrategy}`);
    console.log(`   Delete old data: ${deleteOldData}`);

    const migrationLog = [];
    const errors = [];

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: Load data from KV stores
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 1A. Load from kv_store_84f9c112 (old homepage data)
    const { data: kvOldRecords, error: kvOldError } = await supabase
      .from('kv_store_84f9c112')
      .select('key, value')
      .like('key', 'customer:%');

    if (kvOldError) {
      console.error('❌ [MIGRATION] Error loading kv_store_84f9c112:', kvOldError);
      errors.push({ source: 'kv_store_84f9c112', error: kvOldError.message });
    }

    const kvOldCustomers = (kvOldRecords || []).map((r: any) => {
      try {
        const value = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
        return {
          source: 'kv_store_84f9c112',
          key: r.key,
          data: value
        };
      } catch (e) {
        errors.push({ source: 'kv_store_84f9c112', key: r.key, error: 'JSON parse error' });
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ [MIGRATION] Loaded ${kvOldCustomers.length} customers from kv_store_84f9c112`);

    // 1B. Load from kv_store_customers (separate table)
    let kvCustomersRecords = [];
    try {
      const { data, error } = await supabase
        .from('kv_store_customers')
        .select('key, value');

      if (error) throw error;

      kvCustomersRecords = (data || []).map((r: any) => {
        try {
          const value = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
          return {
            source: 'kv_store_customers',
            key: r.key,
            data: value
          };
        } catch (e) {
          errors.push({ source: 'kv_store_customers', key: r.key, error: 'JSON parse error' });
          return null;
        }
      }).filter(Boolean);

      console.log(`✅ [MIGRATION] Loaded ${kvCustomersRecords.length} customers from kv_store_customers`);
    } catch (e: any) {
      console.log('⚠️ [MIGRATION] kv_store_customers table not accessible:', e.message);
      errors.push({ source: 'kv_store_customers', error: e.message });
    }

    const allKvCustomers = [...kvOldCustomers, ...kvCustomersRecords];

    if (allKvCustomers.length === 0) {
      return c.json({
        success: true,
        message: 'No customers found in KV stores. Nothing to migrate.',
        data: {
          dry_run: dryRun,
          summary: {
            kv_customers_found: 0,
            postgres_existing: 0,
            would_create: 0,
            would_update: 0,
            conflicts: 0
          }
        }
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: Load existing Postgres data
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const { data: pgCustomers, error: pgError } = await supabase
      .from('customer_profiles')
      .select('*');

    if (pgError) {
      console.error('❌ [MIGRATION] Error loading Postgres customers:', pgError);
      return c.json({
        success: false,
        error: 'Failed to load Postgres customers: ' + pgError.message
      }, 500);
    }

    const pgCustomersByPhone = new Map();
    (pgCustomers || []).forEach((c: any) => {
      if (c.phone) {
        pgCustomersByPhone.set(c.phone, c);
      }
    });

    console.log(`✅ [MIGRATION] Loaded ${pgCustomers?.length || 0} existing Postgres customers`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3: Transform & Merge Logic
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const toCreate = [];
    const toUpdate = [];
    const conflicts = [];

    for (const kvRecord of allKvCustomers) {
      const kvData = kvRecord.data;
      
      // Normalize phone (remove non-digits)
      const phone = kvData.phone?.replace(/\D/g, '');
      if (!phone) {
        errors.push({ 
          source: kvRecord.source, 
          key: kvRecord.key, 
          error: 'Missing phone number' 
        });
        continue;
      }

      // Transform KV format to Postgres format
      const pgFormat = {
        phone,
        email: kvData.email || null,
        full_name: kvData.full_name || kvData.name || 'Unknown',
        date_of_birth: kvData.date_of_birth || null,
        gender: kvData.gender || null,
        address: kvData.address || null,
        notes: kvData.notes || null,
        
        // Membership
        tier: kvData.membership?.tier || kvData.tier || 'guest',
        status: kvData.is_deleted ? 'suspended' : 'active',
        membership_start_date: kvData.membership?.activated_at || kvData.membership_start_date || null,
        membership_end_date: kvData.membership?.expires_at || kvData.membership_end_date || null,
        membership_amount: kvData.membership?.amount || kvData.membership_amount || null,
        
        // Statistics
        total_visits: kvData.total_visits || 0,
        lifetime_spend: kvData.total_spent || kvData.lifetime_spend || 0,
        last_visit_date: kvData.last_visit || kvData.last_visit_date || null,
        
        // Optional fields
        loyalty_points: kvData.loyalty_points || 0,
        marketing_opt_in: kvData.marketing_opt_in !== false,
        sms_opt_in: kvData.sms_opt_in === true,
        preferred_language: kvData.preferred_language || 'en',
        
        // Metadata
        created_at: kvData.created_at || new Date().toISOString(),
        created_by: 'migration_from_kv'
      };

      // Check if exists in Postgres
      const existingPg = pgCustomersByPhone.get(phone);

      if (existingPg) {
        // Conflict detected
        const conflict = {
          phone,
          kv_source: kvRecord.source,
          postgres_data: existingPg,
          kv_data: pgFormat,
          resolution: null as any
        };

        // Apply merge strategy
        if (mergeStrategy === 'postgres_priority') {
          conflict.resolution = 'Keep Postgres (no change)';
          migrationLog.push(`⏭️  Skip ${phone} - Already exists in Postgres (postgres_priority)`);
          
        } else if (mergeStrategy === 'kv_priority') {
          conflict.resolution = 'Overwrite with KV data';
          toUpdate.push({ id: existingPg.id, ...pgFormat });
          migrationLog.push(`📝 Update ${phone} - Overwrite with KV data (kv_priority)`);
          
        } else if (mergeStrategy === 'merge_max') {
          // Merge: take maximum values for numeric fields
          const merged = {
            id: existingPg.id,
            ...pgFormat,
            total_visits: Math.max(existingPg.total_visits || 0, pgFormat.total_visits),
            lifetime_spend: Math.max(existingPg.lifetime_spend || 0, pgFormat.lifetime_spend),
            // Keep non-null values
            email: pgFormat.email || existingPg.email,
            full_name: pgFormat.full_name !== 'Unknown' ? pgFormat.full_name : existingPg.full_name,
            // Keep higher tier
            tier: compareTiers(pgFormat.tier, existingPg.tier) > 0 ? pgFormat.tier : existingPg.tier,
          };
          
          conflict.resolution = 'Merged (max values)';
          toUpdate.push(merged);
          migrationLog.push(`🔀 Merge ${phone} - Combined data from both sources`);
        }

        conflicts.push(conflict);
        
      } else {
        // New customer - will be created
        toCreate.push(pgFormat);
        migrationLog.push(`✨ Create ${phone} - New customer from ${kvRecord.source}`);
      }
    }

    console.log(`📊 [MIGRATION] Summary:`);
    console.log(`   Will create: ${toCreate.length}`);
    console.log(`   Will update: ${toUpdate.length}`);
    console.log(`   Conflicts: ${conflicts.length}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 4: Execute Migration (if not dry-run)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    let executionResults = null;

    if (!dryRun) {
      console.log('🚀 [MIGRATION] Executing migration...');

      const createResults = [];
      const updateResults = [];

      // Create new customers
      if (toCreate.length > 0) {
        const { data: created, error: createError } = await supabase
          .from('customer_profiles')
          .insert(toCreate)
          .select();

        if (createError) {
          console.error('❌ [MIGRATION] Create error:', createError);
          errors.push({ operation: 'create', error: createError.message });
        } else {
          createResults.push(...(created || []));
          console.log(`✅ [MIGRATION] Created ${created?.length || 0} customers`);
        }
      }

      // Update existing customers
      for (const update of toUpdate) {
        const { data: updated, error: updateError } = await supabase
          .from('customer_profiles')
          .update(update)
          .eq('id', update.id)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ [MIGRATION] Update error for ${update.phone}:`, updateError);
          errors.push({ operation: 'update', phone: update.phone, error: updateError.message });
        } else {
          updateResults.push(updated);
        }
      }

      console.log(`✅ [MIGRATION] Updated ${updateResults.length} customers`);

      executionResults = {
        created: createResults,
        updated: updateResults,
      };

      // Optional: Delete old KV data
      if (deleteOldData && errors.length === 0) {
        console.log('🗑️  [MIGRATION] Cleaning up old KV data...');

        for (const kvRecord of allKvCustomers) {
          const tableName = kvRecord.source;
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('key', kvRecord.key);

          if (deleteError) {
            console.error(`❌ [MIGRATION] Delete error for ${kvRecord.key}:`, deleteError);
            errors.push({ operation: 'delete', key: kvRecord.key, error: deleteError.message });
          }
        }

        console.log('✅ [MIGRATION] Cleanup complete');
      }
    } else {
      console.log('🔍 [MIGRATION] DRY RUN - No changes made');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 5: Return Results
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const result = {
      success: errors.length === 0,
      dry_run: dryRun,
      timestamp: new Date().toISOString(),
      summary: {
        kv_customers_found: allKvCustomers.length,
        postgres_existing: pgCustomers?.length || 0,
        would_create: toCreate.length,
        would_update: toUpdate.length,
        conflicts: conflicts.length,
        errors: errors.length
      },
      details: {
        to_create: toCreate.map(c => ({ phone: c.phone, name: c.full_name, tier: c.tier })),
        to_update: toUpdate.map(c => ({ phone: c.phone, name: c.full_name, tier: c.tier })),
        conflicts,
        errors
      },
      migration_log: migrationLog,
      execution_results: executionResults,
      next_steps: dryRun ? [
        'Review the summary and conflicts above',
        'If everything looks good, run again with {"dry_run": false}',
        'After migration, verify data with GET /debug/customer-audit'
      ] : [
        'Migration complete!',
        'Verify data with GET /debug/customer-audit',
        'Test CustomerManagementTab in frontend',
        deleteOldData ? 'Old KV data has been cleaned up' : 'Run again with {"delete_old_data": true} to cleanup KV stores'
      ]
    };

    console.log('✅ [MIGRATION] Complete!');
    console.log(JSON.stringify(result.summary, null, 2));

    return c.json(result);

  } catch (error: any) {
    console.error('❌ [MIGRATION] Fatal error:', error);
    return c.json({
      success: false,
      error: error.message || 'Migration failed'
    }, 500);
  }
});

/**
 * Helper: Compare tiers (returns > 0 if tier1 is higher)
 */
function compareTiers(tier1: string, tier2: string): number {
  const tierOrder: any = {
    'guest': 0,
    'bronze': 1,
    'silver': 2,
    'gold': 3,
    'platinum': 4,
    'diamond': 5
  };

  return (tierOrder[tier1?.toLowerCase()] || 0) - (tierOrder[tier2?.toLowerCase()] || 0);
}

export { app as migrateCustomersApp };
