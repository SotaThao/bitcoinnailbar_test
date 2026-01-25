# CUSTOMER DATA MIGRATION PLAN
## From KV Store → Postgres `customer_profiles` Table

**Date:** January 23, 2026  
**Status:** 🟡 PLANNING PHASE  
**Priority:** 🔴 HIGH (Data Architecture Critical)

---

## 📊 CURRENT STATE ANALYSIS

### ❌ **PROBLEM: Data Architecture Mismatch**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Postgres Table EXISTS but NOT USED                    │
│  ┌───────────────────────────────────────────┐        │
│  │  customer_profiles                        │        │
│  │  - Foreign keys to auth.users             │        │
│  │  - Foreign keys to customer_memberships   │        │
│  │  - 4 indexes (tier, status, email, date)  │        │
│  │  - Triggers (auto updated_at)             │        │
│  │  - Constraints (tier, status, language)   │        │
│  └───────────────────────────────────────────┘        │
│                    ⚠️ UNUSED                           │
│                                                         │
│  Application is using KV Store instead                 │
│  ┌───────────────────────────────────────────┐        │
│  │  kv_store_customers (NoSQL)               │        │
│  │  - No foreign keys                        │        │
│  │  - No indexes                             │        │
│  │  - Embedded membership data               │        │
│  │  - Region-specific structure              │        │
│  └───────────────────────────────────────────┘        │
│                    ✅ ACTIVE                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗺️ CUSTOMER ENDPOINTS MAPPING

### **1. ADMIN TAB - Customer Management**

**Frontend:**  
`/src/app/components/admin/CustomerManagementTab.tsx`

**Backend:**  
`/supabase/functions/server/customers_new.tsx`

**Endpoints:**
```
GET    /make-server-84f9c112/customers           → List customers (paginated)
GET    /make-server-84f9c112/customers/:id      → Get customer details
POST   /make-server-84f9c112/customers          → Create customer (manual)
PUT    /make-server-84f9c112/customers/:id      → Update customer (manual)
DELETE /make-server-84f9c112/customers/:id      → Soft delete (set is_deleted=true)
POST   /make-server-84f9c112/customers/search   → Search by phone/name/email
```

**Storage:** `kv_store_customers` table (NoSQL)

**Key Format:**
- US: `customer_us:5551234567` (phone-indexed)
- VN: `customer_vn:uuid` (uuid-indexed)

---

### **2. BOOKING PAGE - Auto Create/Update**

**Frontend:**  
`/src/app/components/pages/BookingPage.tsx`

**Backend:**  
`/supabase/functions/server/customers_booking.tsx`

**Endpoints:**
```
POST /make-server-84f9c112/customers/book       → Auto create or update during booking
GET  /make-server-84f9c112/customers/lookup/:phone → Lookup customer by phone
```

**Operations:**
- Auto create customer if phone not exists
- Update customer stats: `total_visits++`, `total_spent+=`, `last_visit`
- Track appointments: `appointment_ids.push(appointment_id)`
- Check membership status for discount eligibility

**Storage:** `kv_store_customers` table

---

### **3. MEMBERSHIP ACTIVATION - Auto Create/Update**

**Frontend:**  
Membership activation flow (redeem code system)

**Backend:**  
`/supabase/functions/server/customers_membership.tsx`

**Endpoints:**
```
POST /make-server-84f9c112/customers/activate-membership  → Auto create/update on redeem
GET  /make-server-84f9c112/customers/membership/:identifier → Get membership by phone/email
```

**Operations:**
- Auto create customer if not exists
- Embed full membership object into customer record
- Update membership tier, status, expiry

**Storage:** `kv_store_customers` table

---

### **4. REDEEM CODE SYSTEM - Membership Update**

**Backend:**  
`/supabase/functions/server/redeem.tsx`

**Function:**  
`updateCustomerMembership(userId, membership, redeemCode, redemption)`

**Operations:**
- Update customer membership on code redemption
- Extend membership for same tier
- Upgrade membership for higher tier

**Storage:** `kv_store_customers` table

---

## 📋 DATA MODEL COMPARISON

### **Current (KV Store):**

```typescript
interface CustomerUS {
  id: string;                      // customer_us:5551234567
  phone: string;                   // 5551234567
  phone_display: string;           // (555) 123-4567
  full_name: string;
  region: 'US';
  
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  
  // Statistics
  total_visits: number;
  total_spent: number;             // USD
  last_visit?: string;
  appointment_ids: string[];       // Array of IDs
  
  // Embedded Membership (NoSQL style)
  membership?: {
    id: string;
    tier: string;
    amount: number;
    activated_at: string;
    expires_at: string;
    status: 'active' | 'expired';
    benefits: string[];
    redeem_code?: string;
  };
  
  created_at: string;
  created_by: string;
  updated_at?: string;
  is_deleted?: boolean;
}
```

### **Target (Postgres Table):**

```sql
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Membership Info
  tier TEXT DEFAULT 'silver',                -- guest, silver, gold, platinum
  status TEXT DEFAULT 'active',              -- active, inactive, suspended
  membership_id UUID,                        -- FK → customer_memberships
  membership_start_date TIMESTAMPTZ,
  membership_end_date TIMESTAMPTZ,
  membership_auto_renew BOOLEAN DEFAULT FALSE,
  
  -- Statistics
  loyalty_points INTEGER DEFAULT 0,
  lifetime_spend NUMERIC(10,2) DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  last_visit_date TIMESTAMPTZ,
  
  -- Preferences
  marketing_opt_in BOOLEAN DEFAULT TRUE,
  sms_opt_in BOOLEAN DEFAULT FALSE,
  preferred_language TEXT DEFAULT 'en',      -- en, vi
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT customer_profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT customer_profiles_membership_id_fkey 
    FOREIGN KEY (membership_id) REFERENCES customer_memberships (id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_customer_profiles_tier ON customer_profiles (tier);
CREATE INDEX idx_customer_profiles_status ON customer_profiles (status);
CREATE INDEX idx_customer_profiles_email ON customer_profiles (email);
CREATE INDEX idx_customer_profiles_membership_end ON customer_profiles (membership_end_date);

-- Triggers
CREATE TRIGGER customer_profiles_updated_at 
  BEFORE UPDATE ON customer_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_customer_profiles_updated_at();
```

---

## 🔄 MIGRATION STRATEGY

### **Phase 1: Analysis (CURRENT)**
- ✅ Map all customer CRUD endpoints
- ✅ Identify data dependencies
- ✅ Document current architecture

### **Phase 2: Preparation**
- [ ] Create migration script
- [ ] Create backup of KV data
- [ ] Create `customers_postgres.tsx` (new implementation)
- [ ] Update TypeScript interfaces

### **Phase 3: Migration Execution**
- [ ] Migrate existing KV data → Postgres
- [ ] Update backend endpoints to use Postgres
- [ ] Update frontend to match new response format
- [ ] Test all customer flows

### **Phase 4: Cleanup**
- [ ] Verify all features work
- [ ] Remove old KV-based files
- [ ] Archive `customers_new.tsx`, `customers_booking.tsx`, `customers_membership.tsx`
- [ ] Update documentation

---

## ⚙️ FIELD MAPPING (KV → Postgres)

| KV Store Field | Postgres Field | Notes |
|----------------|----------------|-------|
| `id` (customer_us:phone) | `id` (UUID) | Need to generate UUID, keep phone separate |
| `phone` | `phone` | Direct mapping |
| `phone_display` | ❌ Not stored | Format on-the-fly in frontend |
| `full_name` | `full_name` | Direct mapping |
| `region` | ❌ Not stored | US-only market, not needed |
| `email` | `email` (UNIQUE) | Direct mapping |
| `date_of_birth` | ❌ Not in schema | Need to add column or skip |
| `gender` | ❌ Not in schema | Need to add column or skip |
| `address` | ❌ Not in schema | Need to add column or skip |
| `notes` | ❌ Not in schema | Need to add column or skip |
| `total_visits` | `total_visits` | Direct mapping |
| `total_spent` | `lifetime_spend` | Direct mapping (rename) |
| `last_visit` | `last_visit_date` | Direct mapping |
| `appointment_ids[]` | ❌ Not stored | Create separate `appointments` table |
| `membership.tier` | `tier` | Extract from embedded object |
| `membership.id` | `membership_id` (FK) | Foreign key reference |
| `membership.activated_at` | `membership_start_date` | Rename |
| `membership.expires_at` | `membership_end_date` | Rename |
| `membership.status` | `status` | Direct mapping |
| `created_at` | `created_at` | Direct mapping |
| `created_by` | ❌ Not stored | Need to add column or skip |
| `updated_at` | `updated_at` | Auto-managed by trigger |
| `is_deleted` | ❌ Not in schema | Can add `deleted_at` column |

---

## 🚨 BREAKING CHANGES TO ADDRESS

### **1. ID Structure Change**
```
OLD: customer_us:5551234567 (phone-based)
NEW: UUID (standard Postgres)
```

**Impact:**
- ✅ Better for foreign keys
- ⚠️ Need migration script to map old IDs → new UUIDs
- ⚠️ All references need updating

### **2. Membership Embedded → Referenced**
```
OLD: membership: { tier, expires_at, benefits, ... }  (NoSQL embedded)
NEW: membership_id: UUID (FK reference)                (SQL normalized)
```

**Impact:**
- ✅ Better data integrity
- ✅ Avoid duplication
- ⚠️ Need JOIN queries to get full membership data
- ⚠️ May need `customer_memberships` table structure review

### **3. Missing Fields in Postgres Schema**
```
KV has but Postgres missing:
- date_of_birth
- gender  
- address
- notes (staff notes)
- created_by
- appointment_ids[]
- is_deleted (soft delete)
```

**Options:**
- **A.** Add columns to `customer_profiles` table (via Supabase UI)
- **B.** Skip these fields in migration
- **C.** Store in separate tables (e.g., `customer_notes`, `customer_addresses`)

### **4. Appointment Tracking**
```
KV: appointment_ids: string[]  (embedded array)
Postgres: ❌ Not implemented
```

**Recommendation:**
- Create `appointments` table with FK → `customer_profiles.id`
- Query with JOIN instead of embedded array

---

## 📦 REQUIRED NEW TABLES (If not exist)

### **1. `customer_memberships` Table**
```sql
CREATE TABLE customer_memberships (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,           -- silver, gold, platinum, diamond
  amount NUMERIC(10,2),         -- Purchase amount
  activated_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,         -- active, expired, cancelled
  benefits JSONB,               -- Store benefits array as JSON
  redeem_code TEXT,             -- Original redeem code used
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_memberships_customer_id ON customer_memberships (customer_id);
CREATE INDEX idx_customer_memberships_status ON customer_memberships (status);
CREATE INDEX idx_customer_memberships_expires_at ON customer_memberships (expires_at);
```

### **2. `appointments` Table** (Recommendation)
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  service_id UUID,              -- FK to services table
  staff_id UUID,                -- FK to staff table
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,         -- scheduled, completed, cancelled, no_show
  total_amount NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_customer_id ON appointments (customer_id);
CREATE INDEX idx_appointments_date ON appointments (appointment_date);
CREATE INDEX idx_appointments_status ON appointments (status);
```

---

## 🛠️ MIGRATION IMPLEMENTATION PLAN

### **Step 1: Schema Updates (via Supabase UI)**

Add missing columns to `customer_profiles`:

```sql
-- Add missing fields
ALTER TABLE customer_profiles 
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN address TEXT,
  ADD COLUMN notes TEXT,
  ADD COLUMN created_by UUID,
  ADD COLUMN deleted_at TIMESTAMPTZ;

-- Add index for soft delete
CREATE INDEX idx_customer_profiles_deleted_at 
  ON customer_profiles (deleted_at) 
  WHERE deleted_at IS NULL;
```

### **Step 2: Create Migration Script**

**File:** `/supabase/functions/server/migrate-customers-to-postgres.tsx`

```typescript
/**
 * ONE-TIME MIGRATION SCRIPT
 * Migrate customers from kv_store_customers → customer_profiles
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

async function migrateCustomers() {
  console.log('🚀 [MIGRATION] Starting customer migration...');
  
  // 1. Get all customers from KV store
  const { data: kvData, error: kvError } = await supabase
    .from('kv_store_customers')
    .select('*');
  
  if (kvError) {
    console.error('❌ Failed to fetch KV data:', kvError);
    return;
  }
  
  console.log(`📦 Found ${kvData.length} customers in KV store`);
  
  let success = 0;
  let failed = 0;
  
  for (const kvRecord of kvData) {
    const customer = kvRecord.value;
    
    try {
      // 2. Transform KV data → Postgres format
      const postgresCustomer = {
        id: crypto.randomUUID(),  // Generate new UUID
        email: customer.email || `${customer.phone}@temp.com`,  // Email required
        phone: customer.phone,
        full_name: customer.full_name,
        tier: customer.membership?.tier || 'guest',
        status: customer.is_deleted ? 'inactive' : 'active',
        membership_start_date: customer.membership?.activated_at,
        membership_end_date: customer.membership?.expires_at,
        membership_auto_renew: false,
        loyalty_points: 0,
        lifetime_spend: customer.total_spent,
        total_visits: customer.total_visits,
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
      
      // 3. Insert into Postgres
      const { error: insertError } = await supabase
        .from('customer_profiles')
        .insert(postgresCustomer);
      
      if (insertError) {
        console.error(`❌ Failed to migrate ${customer.id}:`, insertError);
        failed++;
      } else {
        console.log(`✅ Migrated: ${customer.full_name} (${customer.phone})`);
        success++;
      }
      
    } catch (error) {
      console.error(`❌ Error migrating ${customer.id}:`, error);
      failed++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📦 Total: ${kvData.length}`);
}

// Run migration
migrateCustomers();
```

### **Step 3: Create New Postgres-based Endpoints**

**File:** `/supabase/functions/server/customers_postgres.tsx`

Key differences:
```typescript
// OLD (KV Store)
const customers = await customerKV.getByPrefix('customer_us:');

// NEW (Postgres)
const { data: customers } = await supabase
  .from('customer_profiles')
  .select(`
    *,
    customer_memberships (
      id,
      tier,
      status,
      activated_at,
      expires_at,
      benefits
    )
  `)
  .is('deleted_at', null)
  .order('created_at', { ascending: false });
```

### **Step 4: Update Integration Points**

**Files to update:**
1. `/supabase/functions/server/customers_booking.tsx`
2. `/supabase/functions/server/customers_membership.tsx`  
3. `/supabase/functions/server/redeem.tsx`
4. `/src/app/components/admin/CustomerManagementTab.tsx`

**Changes:**
- Replace `customerKV` calls with `supabase.from('customer_profiles')`
- Update data transformation logic
- Handle foreign key references properly

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data Loss** | 🔴 Critical | Full backup before migration + rollback plan |
| **Downtime** | 🟡 Medium | Run migration during low-traffic hours |
| **ID Reference Breaking** | 🔴 Critical | Create ID mapping table (old_id → new_id) |
| **Foreign Key Violations** | 🟡 Medium | Validate all FKs before insert |
| **Missing Fields** | 🟡 Medium | Set default values or NULL |
| **Appointment Tracking** | 🟡 Medium | Create `appointments` table first |

---

## 📈 BENEFITS OF MIGRATION

### **Performance:**
- ✅ **Indexed queries:** 4x-10x faster for large datasets
- ✅ **Efficient JOINs:** Get customer + membership in 1 query
- ✅ **Complex filtering:** SQL WHERE clauses vs manual filtering

### **Data Integrity:**
- ✅ **Foreign Keys:** Prevent orphaned records
- ✅ **Constraints:** Validate tier, status, language at DB level
- ✅ **Transactions:** ACID compliance for multi-step operations

### **Scalability:**
- ✅ **Relational structure:** Easy to add new tables (appointments, transactions)
- ✅ **Analytics:** Native SQL for reports
- ✅ **Backup/Restore:** Standard Postgres tools

### **Maintenance:**
- ✅ **Standard patterns:** Well-known SQL patterns
- ✅ **Migration tools:** Supabase migrations
- ✅ **Type safety:** Generated TypeScript types from schema

---

## 📝 NEXT STEPS

### **Immediate (High Priority):**
1. ✅ **Review this document with team**
2. ⏳ **Decide on missing fields:** Add columns or skip?
3. ⏳ **Backup KV data:** Export all customer records
4. ⏳ **Create migration script**
5. ⏳ **Test migration on staging/dev environment**

### **Short-term (After Migration):**
1. Create `customers_postgres.tsx`
2. Update all integration points
3. Test all customer flows
4. Deploy to production
5. Monitor for issues

### **Long-term (Phase 2):**
1. Add manual CRUD UI in CustomerManagementTab
2. Create appointments management system
3. Build customer analytics dashboard
4. Implement customer segmentation

---

## 🔗 RELATED FILES

### **Backend (Current - KV Store):**
- `/supabase/functions/server/customers_new.tsx` - Main CRUD
- `/supabase/functions/server/customers_booking.tsx` - Booking integration
- `/supabase/functions/server/customers_membership.tsx` - Membership integration
- `/supabase/functions/server/kv_store_customers.tsx` - KV helper functions
- `/supabase/functions/server/redeem.tsx` - Contains `updateCustomerMembership()`

### **Backend (Old - Unused):**
- `/supabase/functions/server/customers.tsx` - Legacy implementation

### **Frontend:**
- `/src/app/components/admin/CustomerManagementTab.tsx` - Admin UI
- `/src/app/components/pages/BookingPage.tsx` - Booking flow
- `/utils/auth.ts` - JWT token management

---

## 💡 RECOMMENDATIONS

### ✅ **DO:**
1. Migrate to Postgres for better scalability
2. Use foreign keys for data integrity
3. Create separate `appointments` table
4. Keep `customer_memberships` normalized
5. Add missing columns to schema

### ❌ **DON'T:**
1. Mix KV Store and Postgres (choose one)
2. Embed membership data (use foreign keys)
3. Store appointment_ids as array (use separate table)
4. Skip data validation (use constraints)
5. Forget to backup before migration

---

## 📞 SUPPORT & QUESTIONS

If you have questions during implementation:
1. Check this document first
2. Review Postgres schema in Supabase UI
3. Test queries in SQL Editor
4. Consult with backend team on foreign key strategy

---

**Last Updated:** January 23, 2026  
**Author:** System Architect  
**Status:** ⏳ AWAITING APPROVAL TO PROCEED
