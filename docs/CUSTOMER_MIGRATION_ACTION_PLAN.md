# CUSTOMER POSTGRES MIGRATION - ACTION PLAN

**Created:** January 23, 2026  
**Priority:** 🔴 HIGH  
**Estimated Time:** 4-6 hours  
**Risk Level:** 🟡 MEDIUM (with proper backup)

---

## 🎯 OBJECTIVES

1. ✅ Migrate customer data từ KV Store → Postgres `customer_profiles`
2. ✅ Maintain data integrity với foreign keys
3. ✅ Preserve all customer records và history
4. ✅ Zero downtime migration (if possible)
5. ✅ Rollback plan nếu có issue

---

## ⏱️ TIMELINE & PHASES

### **Phase 1: Pre-Migration (1-2 hours)**
- [ ] Backup all KV data
- [ ] Review Postgres schema
- [ ] Add missing columns
- [ ] Create mapping tables
- [ ] Test migration script on sample data

### **Phase 2: Migration Execution (1 hour)**
- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Update ID references
- [ ] Test critical flows

### **Phase 3: Code Updates (2-3 hours)**
- [ ] Create `customers_postgres.tsx`
- [ ] Update booking integration
- [ ] Update membership integration
- [ ] Update admin UI
- [ ] Update redeem code integration

### **Phase 4: Testing & Validation (30 min - 1 hour)**
- [ ] Test all CRUD operations
- [ ] Test booking flow
- [ ] Test membership activation
- [ ] Test redeem code flow
- [ ] Performance testing

---

## 📋 DETAILED CHECKLIST

### **✅ STEP 1: Backup Current Data**

**Script to export KV data:**
```typescript
// Run in Supabase SQL Editor or Deno script
const { data: kvData } = await supabase
  .from('kv_store_customers')
  .select('*');

// Save to JSON file
const backup = {
  timestamp: new Date().toISOString(),
  count: kvData.length,
  data: kvData
};

// Download as: customer_backup_2026_01_23.json
```

**Backup location:**
- Local: `/backups/customer_backup_2026_01_23.json`
- Cloud: Supabase Storage bucket `backups/`

---

### **✅ STEP 2: Update Postgres Schema**

**Add missing columns to `customer_profiles`:**

```sql
-- 1. Add optional demographic fields
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add staff tracking
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Add soft delete support
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. Add index for deleted_at (partial index for active customers only)
CREATE INDEX IF NOT EXISTS idx_customer_profiles_deleted_at 
  ON customer_profiles (deleted_at) 
  WHERE deleted_at IS NULL;

-- 5. Add phone index (important for lookups)
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone 
  ON customer_profiles (phone);
```

**Verify schema:**
```sql
\d customer_profiles
```

---

### **✅ STEP 3: Create ID Mapping Table**

**Purpose:** Map old KV IDs → new Postgres UUIDs

```sql
CREATE TABLE IF NOT EXISTS customer_id_mappings (
  old_id TEXT PRIMARY KEY,              -- customer_us:5551234567
  new_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_id_mappings_phone ON customer_id_mappings (phone);
CREATE INDEX idx_customer_id_mappings_new_id ON customer_id_mappings (new_id);
```

---

### **✅ STEP 4: Run Migration Script**

**File:** `/supabase/functions/server/migrate-customers-to-postgres.tsx`

**Key steps:**
1. Fetch all customers from `kv_store_customers`
2. For each customer:
   - Generate new UUID
   - Transform data structure
   - Insert into `customer_profiles`
   - Insert mapping into `customer_id_mappings`
3. Log results (success/failed)
4. Generate migration report

**Run command:**
```bash
deno run --allow-net --allow-env migrate-customers-to-postgres.tsx
```

**Expected output:**
```
🚀 [MIGRATION] Starting customer migration...
📦 Found 150 customers in KV store
✅ Migrated: John Doe (5551234567)
✅ Migrated: Jane Smith (5559876543)
...
📊 Migration Summary:
   ✅ Success: 148
   ❌ Failed: 2
   📦 Total: 150
```

---

### **✅ STEP 5: Create New Backend Implementation**

**File:** `/supabase/functions/server/customers_postgres.tsx`

**Replace KV queries with Postgres:**

```typescript
// OLD (KV)
const customer = await customerKV.get('customer_us:5551234567');

// NEW (Postgres)
const { data: customer } = await supabase
  .from('customer_profiles')
  .select(`
    *,
    customer_memberships (
      id, tier, status, activated_at, expires_at, benefits
    )
  `)
  .eq('phone', '5551234567')
  .is('deleted_at', null)
  .single();
```

**Key changes:**
- Replace `customerKV.*` with `supabase.from('customer_profiles')`
- Use JOINs to get membership data
- Handle foreign keys properly
- Use WHERE deleted_at IS NULL for soft delete

---

### **✅ STEP 6: Update Integration Points**

#### **6.1. Update index.tsx**

```typescript
// OLD
import { customersApp } from './customers_new.tsx';

// NEW
import { customersApp } from './customers_postgres.tsx';
```

#### **6.2. Update customers_booking.tsx**

```typescript
// OLD: customerKV.getByPhoneUS(phone)
// NEW: supabase.from('customer_profiles').select('*').eq('phone', phone)

// OLD: customerKV.set(customerId, customer)
// NEW: supabase.from('customer_profiles').upsert(customer)
```

#### **6.3. Update customers_membership.tsx**

```typescript
// OLD: Embed membership object
customer.membership = { tier, status, expires_at, ... };

// NEW: Create separate membership record
const { data: membership } = await supabase
  .from('customer_memberships')
  .insert({ customer_id, tier, status, expires_at, ... })
  .select()
  .single();

// Link to customer
await supabase
  .from('customer_profiles')
  .update({ membership_id: membership.id, tier: membership.tier })
  .eq('id', customer_id);
```

#### **6.4. Update redeem.tsx**

```typescript
// OLD: updateCustomerMembership() uses KV
// NEW: updateCustomerMembership() uses Postgres with FK references
```

---

### **✅ STEP 7: Update Frontend**

**File:** `/src/app/components/admin/CustomerManagementTab.tsx`

**Changes needed:**
```typescript
// Response structure remains similar, but:
// - customer.id is now UUID (not customer_us:phone)
// - membership is now nested object from JOIN
// - phone is separate field (not in ID)

interface Customer {
  id: string;  // UUID
  phone: string;  // Separate field
  // ... other fields
  customer_memberships?: {  // From JOIN
    tier: string;
    status: string;
    expires_at: string;
  };
}
```

---

### **✅ STEP 8: Testing Protocol**

#### **Test Case 1: Admin CRUD**
```
1. Open /admin/loyalty → Customers tab
2. Verify customer list loads
3. Click customer → View details
4. Create new customer → Verify in DB
5. Edit customer → Verify updates
6. Delete customer → Verify soft delete (deleted_at)
```

#### **Test Case 2: Booking Flow**
```
1. Go to /booking
2. Enter phone: NEW number
   → Should create customer
3. Complete booking
   → Verify total_visits=1, total_spent updated
4. Book again with SAME phone
   → Should update existing customer
   → Verify total_visits=2
```

#### **Test Case 3: Membership Activation**
```
1. Purchase membership (redeem code)
2. Enter phone/email
3. Complete payment
   → Verify customer created/updated
   → Verify membership_id FK set
   → Verify tier updated
4. Book appointment with same phone
   → Should apply membership discount
```

#### **Test Case 4: Data Integrity**
```sql
-- Check orphaned records
SELECT * FROM customer_profiles 
WHERE membership_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM customer_memberships 
    WHERE id = customer_profiles.membership_id
  );
-- Should return 0 rows

-- Check constraint violations
SELECT * FROM customer_profiles 
WHERE tier NOT IN ('guest', 'silver', 'gold', 'platinum');
-- Should return 0 rows
```

---

## 🚨 ROLLBACK PLAN

### **If Migration Fails:**

1. **Stop application immediately**
2. **Restore KV data from backup:**
   ```typescript
   const backup = JSON.parse(backupFile);
   for (const record of backup.data) {
     await supabase
       .from('kv_store_customers')
       .upsert(record);
   }
   ```
3. **Revert code changes:**
   ```bash
   git revert <migration-commit>
   ```
4. **Redeploy old version:**
   ```typescript
   // index.tsx
   import { customersApp } from './customers_new.tsx'; // Back to KV
   ```

### **If Data Corruption Detected:**

1. **Pause all customer-related operations**
2. **Compare KV backup with Postgres data:**
   ```typescript
   const kvCustomers = backupData.map(r => r.value);
   const pgCustomers = await supabase.from('customer_profiles').select('*');
   
   // Find missing records
   const missing = kvCustomers.filter(kv => 
     !pgCustomers.find(pg => pg.phone === kv.phone)
   );
   ```
3. **Re-run migration for missing records only**
4. **Verify data integrity queries**

---

## 📊 MIGRATION SCRIPT TEMPLATE

```typescript
/**
 * MIGRATION SCRIPT
 * File: /supabase/functions/server/migrate-customers-to-postgres.tsx
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface MigrationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
  idMappings: Array<{ old_id: string; new_id: string; phone: string }>;
}

async function migrateCustomers(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: 0,
    failed: 0,
    errors: [],
    idMappings: []
  };
  
  console.log('🚀 [MIGRATION] Starting...');
  
  // 1. Fetch all KV customers
  const { data: kvData, error: kvError } = await supabase
    .from('kv_store_customers')
    .select('*');
  
  if (kvError) {
    console.error('❌ Failed to fetch KV data:', kvError);
    throw kvError;
  }
  
  console.log(`📦 Found ${kvData.length} customers in KV store\n`);
  
  // 2. Process each customer
  for (const kvRecord of kvData) {
    const customer = kvRecord.value;
    const newUUID = crypto.randomUUID();
    
    try {
      // Transform data
      const postgresCustomer = {
        id: newUUID,
        email: customer.email || `${customer.phone}@placeholder.com`,
        phone: customer.phone,
        full_name: customer.full_name,
        tier: customer.membership?.tier || 'guest',
        status: customer.is_deleted ? 'inactive' : 'active',
        membership_start_date: customer.membership?.activated_at,
        membership_end_date: customer.membership?.expires_at,
        membership_auto_renew: false,
        loyalty_points: 0,
        lifetime_spend: customer.total_spent || 0,
        total_visits: customer.total_visits || 0,
        last_visit_date: customer.last_visit,
        marketing_opt_in: true,
        sms_opt_in: false,
        preferred_language: 'en',
        date_of_birth: customer.date_of_birth,
        gender: customer.gender,
        address: customer.address,
        notes: customer.notes,
        created_by: customer.created_by,
        deleted_at: customer.is_deleted ? new Date().toISOString() : null,
      };
      
      // Insert into Postgres
      const { error: insertError } = await supabase
        .from('customer_profiles')
        .insert(postgresCustomer);
      
      if (insertError) {
        throw insertError;
      }
      
      // Store ID mapping
      const { error: mappingError } = await supabase
        .from('customer_id_mappings')
        .insert({
          old_id: customer.id,
          new_id: newUUID,
          phone: customer.phone
        });
      
      if (mappingError) {
        console.warn(`⚠️ Failed to store mapping for ${customer.id}`);
      }
      
      result.success++;
      result.idMappings.push({ 
        old_id: customer.id, 
        new_id: newUUID, 
        phone: customer.phone 
      });
      
      console.log(`✅ ${result.success}/${kvData.length} - ${customer.full_name} (${customer.phone})`);
      
    } catch (error: any) {
      result.failed++;
      result.errors.push({ 
        id: customer.id, 
        error: error.message 
      });
      console.error(`❌ Failed: ${customer.id} - ${error.message}`);
    }
  }
  
  // 3. Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 MIGRATION SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Success: ${result.success}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`📦 Total: ${kvData.length}`);
  console.log(`Success Rate: ${((result.success / kvData.length) * 100).toFixed(2)}%`);
  
  if (result.errors.length > 0) {
    console.log(`\n⚠️ ERRORS:`);
    result.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.id}: ${err.error}`);
    });
  }
  
  return result;
}

// Execute migration
migrateCustomers()
  .then(result => {
    console.log('\n✅ Migration completed successfully');
    Deno.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    Deno.exit(1);
  });
```

---

### **✅ STEP 3: Create Postgres Backend**

**File:** `/supabase/functions/server/customers_postgres.tsx`

**Key implementations:**

#### **GET /customers (List)**
```typescript
app.get('/make-server-84f9c112/customers', requireAuth, async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = (page - 1) * limit;
  
  // Count total (for pagination)
  const { count } = await supabase
    .from('customer_profiles')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  
  // Fetch customers with membership
  const { data: customers, error } = await supabase
    .from('customer_profiles')
    .select(`
      *,
      customer_memberships (
        id, tier, status, activated_at, expires_at, benefits
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
  
  return c.json({
    success: true,
    data: customers,
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    }
  });
});
```

#### **POST /customers (Create)**
```typescript
app.post('/make-server-84f9c112/customers', requireAuth, async (c) => {
  const body = await c.req.json();
  const currentUser = c.get('user') as User;
  
  // Validate required fields
  if (!body.phone || !body.full_name || !body.email) {
    return c.json({ 
      success: false, 
      error: 'Missing required fields: phone, full_name, email' 
    }, 400);
  }
  
  // Check if phone already exists
  const { data: existing } = await supabase
    .from('customer_profiles')
    .select('id')
    .eq('phone', body.phone)
    .is('deleted_at', null)
    .maybeSingle();
  
  if (existing) {
    return c.json({ 
      success: false, 
      error: 'Customer with this phone already exists' 
    }, 400);
  }
  
  // Create customer
  const { data: customer, error } = await supabase
    .from('customer_profiles')
    .insert({
      email: body.email,
      phone: body.phone,
      full_name: body.full_name,
      tier: 'guest',
      status: 'active',
      date_of_birth: body.date_of_birth,
      gender: body.gender,
      address: body.address,
      notes: body.notes,
      created_by: currentUser.userId,
      total_visits: 0,
      lifetime_spend: 0,
      loyalty_points: 0,
    })
    .select()
    .single();
  
  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
  
  return c.json({ 
    success: true, 
    data: customer,
    message: 'Customer created successfully'
  }, 201);
});
```

#### **PUT /customers/:id (Update)**
```typescript
app.put('/make-server-84f9c112/customers/:id', requireAuth, async (c) => {
  const customerId = c.req.param('id');
  const body = await c.req.json();
  
  const { data: customer, error } = await supabase
    .from('customer_profiles')
    .update({
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      date_of_birth: body.date_of_birth,
      gender: body.gender,
      address: body.address,
      notes: body.notes,
      // updated_at handled by trigger
    })
    .eq('id', customerId)
    .is('deleted_at', null)
    .select()
    .single();
  
  if (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
  
  return c.json({ 
    success: true, 
    data: customer,
    message: 'Customer updated successfully'
  });
});
```

---

### **✅ STEP 9: Post-Migration Validation**

**SQL Queries to run:**

```sql
-- 1. Check total count matches
SELECT COUNT(*) FROM customer_profiles WHERE deleted_at IS NULL;
-- Should match: KV store count

-- 2. Check all phones are unique
SELECT phone, COUNT(*) 
FROM customer_profiles 
WHERE deleted_at IS NULL
GROUP BY phone 
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- 3. Check foreign key integrity
SELECT cp.id, cp.membership_id 
FROM customer_profiles cp
WHERE cp.membership_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM customer_memberships cm 
    WHERE cm.id = cp.membership_id
  );
-- Should return 0 rows

-- 4. Check all customers have valid tier
SELECT tier, COUNT(*) 
FROM customer_profiles 
GROUP BY tier;
-- Should only show: guest, silver, gold, platinum

-- 5. Check mapping table completeness
SELECT COUNT(*) FROM customer_id_mappings;
-- Should equal: KV store count
```

---

## 📦 FILES TO CREATE/MODIFY

### **New Files:**
- [ ] `/supabase/functions/server/customers_postgres.tsx` - New Postgres implementation
- [ ] `/supabase/functions/server/migrate-customers-to-postgres.tsx` - Migration script
- [ ] `/backups/customer_backup_2026_01_23.json` - Data backup

### **Modified Files:**
- [ ] `/supabase/functions/server/index.tsx` - Update import
- [ ] `/supabase/functions/server/customers_booking.tsx` - Use Postgres
- [ ] `/supabase/functions/server/customers_membership.tsx` - Use Postgres
- [ ] `/supabase/functions/server/redeem.tsx` - Update `updateCustomerMembership()`
- [ ] `/src/app/components/admin/CustomerManagementTab.tsx` - Update types

### **Files to Archive (After successful migration):**
- [ ] `/supabase/functions/server/customers_new.tsx` - Move to `/archive/`
- [ ] `/supabase/functions/server/customers.tsx` - Move to `/archive/`
- [ ] `/supabase/functions/server/kv_store_customers.tsx` - Move to `/archive/`

---

## 🎯 SUCCESS CRITERIA

✅ **Migration is successful when:**

1. All customer records migrated (0 data loss)
2. ID mappings stored correctly
3. Foreign keys validated
4. All endpoints return correct data
5. Booking flow works end-to-end
6. Membership activation works
7. Redeem codes update customer correctly
8. Admin UI loads customer list
9. No performance regression
10. Zero customer complaints

---

## 📞 SUPPORT & ESCALATION

**If issues arise:**
1. Check Supabase logs
2. Review migration summary
3. Query validation queries
4. Restore from backup if critical
5. Document issue for post-mortem

---

## 📝 POST-MIGRATION TASKS

- [ ] Update `/docs/CUSTOMER_API_ENDPOINTS.md` with Postgres queries
- [ ] Create API documentation with new response formats
- [ ] Update team wiki with new architecture
- [ ] Train staff on new system (if UI changes)
- [ ] Monitor performance for 1 week
- [ ] Archive old KV-based code

---

**APPROVAL REQUIRED BEFORE PROCEEDING**

- [ ] Technical Lead Review
- [ ] Database Schema Approved
- [ ] Backup Strategy Confirmed
- [ ] Rollback Plan Reviewed
- [ ] Testing Protocol Approved

---

**Status:** 📋 READY FOR REVIEW  
**Next Action:** Get approval to proceed with Phase 1
