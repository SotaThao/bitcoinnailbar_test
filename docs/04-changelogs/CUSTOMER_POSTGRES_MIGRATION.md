# CUSTOMER POSTGRES MIGRATION PLAN

**Status:** 🟡 PLANNING  
**Created:** 2026-01-23  
**Priority:** HIGH

---

## 📋 EXECUTIVE SUMMARY

Currently, the customer system uses **KV Store** (`kv_store_customers` table) for all customer data. However, a fully-featured **Postgres table** (`customer_profiles`) exists in the database with proper foreign keys, indexes, and constraints.

**This document outlines the migration plan from KV Store → Postgres Table.**

---

## 🚨 CURRENT STATE ANALYSIS

### **Backend Files Using KV Store:**

| File | Purpose | Table | Endpoints |
|------|---------|-------|-----------|
| `customers_new.tsx` | Main CRUD | `kv_store_customers` | `GET/POST/PUT/DELETE /customers` |
| `customers_booking.tsx` | Booking integration | `kv_store_customers` | `POST /customers/book` |
| `customers_membership.tsx` | Membership activation | `kv_store_customers` | `POST /customers/activate-membership` |
| `redeem.tsx` | Update on redeem | `kv_store_customers` | Helper function `updateCustomerMembership()` |

### **Frontend Files:**

| File | Purpose | Operations |
|------|---------|------------|
| `CustomerManagementTab.tsx` | Admin UI | **READ ONLY** (list, pagination) |
| `BookingPage.tsx` | Booking flow | Calls `POST /customers/book` |

---

## 📊 POSTGRES TABLE SCHEMA

### **Existing Table: `customer_profiles`**

```sql
create table public.customer_profiles (
  -- Identity
  id uuid not null,
  email text not null,
  phone text null,
  full_name text not null,
  avatar_url text null,
  
  -- Membership Tier
  tier text not null default 'silver'::text,
  status text not null default 'active'::text,
  membership_id uuid null,
  membership_start_date timestamp with time zone null,
  membership_end_date timestamp with time zone null,
  membership_auto_renew boolean null default false,
  
  -- Statistics
  loyalty_points integer null default 0,
  lifetime_spend numeric(10, 2) null default 0,
  total_visits integer null default 0,
  
  -- Preferences
  marketing_opt_in boolean null default true,
  sms_opt_in boolean null default false,
  preferred_language text null default 'en'::text,
  
  -- Metadata
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  last_visit_date timestamp with time zone null,
  
  -- Constraints
  constraint customer_profiles_pkey primary key (id),
  constraint customer_profiles_email_key unique (email),
  constraint customer_profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint customer_profiles_membership_id_fkey foreign key (membership_id) references customer_memberships (id) on delete set null,
  constraint customer_profiles_tier_check check (tier = any (array['guest'::text, 'silver'::text, 'gold'::text, 'platinum'::text])),
  constraint customer_profiles_status_check check (status = any (array['active'::text, 'inactive'::text, 'suspended'::text]))
);

-- Indexes
create index idx_customer_profiles_tier on public.customer_profiles using btree (tier);
create index idx_customer_profiles_status on public.customer_profiles using btree (status);
create index idx_customer_profiles_email on public.customer_profiles using btree (email);
create index idx_customer_profiles_membership_end on public.customer_profiles using btree (membership_end_date);

-- Trigger
create trigger customer_profiles_updated_at 
  before update on customer_profiles 
  for each row execute function update_customer_profiles_updated_at();
```

---

## 🗺️ FIELD MAPPING

### **KV Store → Postgres Mapping:**

| KV Store Field | Postgres Field | Notes |
|----------------|----------------|-------|
| `id` (customer_us:xxx) | `id` (uuid) | Need to generate UUID, store phone separately |
| `phone` | `phone` | Direct mapping |
| `phone_display` | ❌ Calculate on-the-fly | Not stored in Postgres |
| `full_name` | `full_name` | Direct mapping |
| `region` | ❌ Remove | US market only now |
| `email` | `email` | Direct mapping |
| `date_of_birth` | ❌ Not in schema | Need to add column OR ignore |
| `gender` | ❌ Not in schema | Need to add column OR ignore |
| `address` | ❌ Not in schema | Need to add column OR ignore |
| `notes` | ❌ Not in schema | Need to add column OR ignore |
| `total_visits` | `total_visits` | Direct mapping |
| `total_spent` | `lifetime_spend` | Rename |
| `last_visit` | `last_visit_date` | Rename |
| `appointment_ids[]` | ❌ Use relation table | Foreign keys instead |
| **`membership` (embedded)** | **`membership_id` + fields** | Normalize to separate table |
| `membership.tier` | `tier` | Direct mapping |
| `membership.activated_at` | `membership_start_date` | Rename |
| `membership.expires_at` | `membership_end_date` | Rename |
| `membership.status` | `status` | Map to customer status |
| `membership.amount` | ❌ In `customer_memberships` table | Foreign key relation |
| `membership.benefits` | ❌ In `customer_memberships` table | Foreign key relation |
| `membership.redeem_code` | ❌ Track in redemptions table | Separate tracking |
| `created_at` | `created_at` | Direct mapping |
| `created_by` | ❌ Not in schema | Auth system handles this |
| `updated_at` | `updated_at` | Direct mapping (auto-trigger) |
| `is_deleted` | `status = 'inactive'` | Soft delete via status |

---

## ⚠️ MISSING FIELDS IN POSTGRES

**Fields in KV Store but NOT in Postgres table:**

1. ❌ `date_of_birth`
2. ❌ `gender`
3. ❌ `address`
4. ❌ `notes`
5. ❌ `appointment_ids[]` (should use relational table)
6. ❌ `region` (no longer needed - US only)

**Recommendation:**

- **Option 1:** Add these fields to `customer_profiles` table
- **Option 2:** Store in JSONB `metadata` column (flexible)
- **Option 3:** Ignore and migrate without them (lossy)

---

## 📦 MIGRATION PHASES

### **PHASE 1: Preparation (CURRENT)**

**Tasks:**

- ✅ Audit all customer endpoints
- ✅ Map KV Store fields → Postgres fields
- ✅ Document missing fields
- ⏸️ Decide on missing fields strategy
- ⏸️ Create new backend file: `customers_postgres.tsx`

**Timeline:** 1 day

---

### **PHASE 2: Backend Implementation (NEXT)**

**Tasks:**

1. **Create `customers_postgres.tsx`:**
   - Implement all CRUD operations using Postgres
   - Use `createClient` with `SUPABASE_SERVICE_ROLE_KEY`
   - Handle UUID generation for new customers
   - Implement phone lookup (since ID is now UUID, not phone)

2. **Endpoints to implement:**
   ```
   GET    /customers                  → List customers
   POST   /customers                  → Create customer
   GET    /customers/:id              → Get customer details
   PUT    /customers/:id              → Update customer
   DELETE /customers/:id              → Soft delete (status = inactive)
   POST   /customers/search           → Search customers
   ```

3. **Create `customers_booking_postgres.tsx`:**
   - Auto-create/update during booking
   - Handle membership validation

4. **Create `customers_membership_postgres.tsx`:**
   - Activate membership
   - Update membership fields

5. **Update `redeem.tsx`:**
   - Change `updateCustomerMembership()` to use Postgres

**Timeline:** 2-3 days

---

### **PHASE 3: Frontend Updates**

**Tasks:**

1. **Update `CustomerManagementTab.tsx`:**
   - Change to use new UUID-based IDs
   - Update interface to match Postgres schema
   - Handle `lifetime_spend` vs `total_spent` rename
   - Handle `last_visit_date` vs `last_visit` rename

2. **Update `BookingPage.tsx`:**
   - Ensure compatibility with new API

3. **Test all flows:**
   - List customers
   - View customer details
   - Booking creates/updates customer
   - Membership activation updates customer
   - Redeem code updates customer

**Timeline:** 1 day

---

### **PHASE 4: Data Migration (Optional)**

**If existing KV Store data needs to be preserved:**

1. **Create migration script:**
   - Read all customers from KV Store
   - Transform to Postgres schema
   - Insert into `customer_profiles`
   - Handle ID conversion (phone → UUID)

2. **Run migration:**
   - Backup KV Store data
   - Run migration script
   - Verify data integrity

**Timeline:** 1 day

---

### **PHASE 5: Deprecation**

**Tasks:**

1. **Remove old files:**
   - ❌ Delete `customers_new.tsx`
   - ❌ Delete `customers_booking.tsx`
   - ❌ Delete `customers_membership.tsx`
   - ❌ Delete `kv_store_customers.tsx`

2. **Update `index.tsx`:**
   - Remove old routes
   - Mount new Postgres-based routes

3. **Archive documentation:**
   - Move old docs to `/docs/05-references/deprecated/`

**Timeline:** 0.5 day

---

## 🎯 BENEFITS OF MIGRATION

### **1. Data Integrity**

✅ Foreign keys ensure referential integrity  
✅ Constraints prevent invalid data  
✅ Triggers auto-update timestamps

### **2. Performance**

✅ Indexed queries (tier, status, email, membership_end_date)  
✅ Native SQL JOINs for complex queries  
✅ Better query optimization

### **3. Scalability**

✅ Relational structure for complex relationships  
✅ Easy to add new fields  
✅ Better for analytics/reporting

### **4. Maintainability**

✅ Standard SQL operations  
✅ No manual JSON serialization  
✅ Better tooling support (pgAdmin, Supabase Studio)

---

## ⚠️ RISKS & MITIGATION

### **Risk 1: Data Loss**

**Risk:** Missing fields (`date_of_birth`, `gender`, `address`, `notes`) may be lost.

**Mitigation:**
- Add these fields to Postgres schema before migration
- OR use JSONB `metadata` column

### **Risk 2: Breaking Changes**

**Risk:** Frontend expects KV Store structure.

**Mitigation:**
- Backend returns transformed response matching old structure
- Frontend doesn't need to change initially

### **Risk 3: Downtime**

**Risk:** Switching endpoints causes service interruption.

**Mitigation:**
- Phase 2-3 can run in parallel (new endpoints alongside old)
- Switch frontend only after full testing
- Keep old endpoints for 1 week as fallback

---

## 📝 DECISION REQUIRED

### **Missing Fields Strategy:**

**Option A: Add to Postgres Schema (RECOMMENDED)**

```sql
ALTER TABLE customer_profiles 
  ADD COLUMN date_of_birth date,
  ADD COLUMN gender text,
  ADD COLUMN address text,
  ADD COLUMN notes text;
```

**Pros:** No data loss, full feature parity  
**Cons:** Requires ALTER TABLE (need admin access)

**Option B: Use JSONB Metadata**

```sql
ALTER TABLE customer_profiles 
  ADD COLUMN metadata jsonb default '{}'::jsonb;
```

**Pros:** Flexible, no schema changes needed later  
**Cons:** No type safety, harder to query

**Option C: Ignore Missing Fields**

**Pros:** No schema changes  
**Cons:** Data loss, reduced functionality

---

## 🚀 NEXT STEPS

1. **DECISION:** Choose missing fields strategy (A, B, or C above)
2. **ALTER TABLE** (if needed): Add missing columns to `customer_profiles`
3. **IMPLEMENT:** Create `customers_postgres.tsx` with full CRUD
4. **TEST:** All endpoints with Postman/curl
5. **INTEGRATE:** Update frontend to use new endpoints
6. **MIGRATE DATA:** (Optional) Migrate existing KV Store data
7. **DEPRECATE:** Remove old KV-based files

---

## 📚 RELATED DOCUMENTATION

- `BOOKING_CUSTOMER_LOGIC.md` - Booking integration rules
- `/supabase/functions/server/customers_new.tsx` - Current KV implementation
- `/src/app/components/admin/CustomerManagementTab.tsx` - Frontend UI

---

## 📌 APPENDIX: ENDPOINT INVENTORY

### **Current KV Store Endpoints:**

| Method | Endpoint | Auth Required | Usage |
|--------|----------|---------------|-------|
| GET | `/customers` | ✅ Yes | List customers (admin) |
| POST | `/customers` | ✅ Yes | Create customer (admin) |
| GET | `/customers/:id` | ✅ Yes | Get customer details |
| PUT | `/customers/:id` | ✅ Yes | Update customer (admin) |
| DELETE | `/customers/:id` | ✅ Yes (Owner only) | Soft delete |
| POST | `/customers/search` | ✅ Yes | Search customers |
| POST | `/customers/book` | ❌ No | Auto-create/update during booking |
| GET | `/customers/lookup/:phone` | ❌ No | Lookup by phone (booking autofill) |
| POST | `/customers/activate-membership` | ❌ No | Activate membership after redeem |
| GET | `/customers/membership/:identifier` | ❌ No | Check membership status |

### **Frontend API Calls:**

| Component | Endpoint | Purpose |
|-----------|----------|---------|
| `CustomerManagementTab.tsx` | `GET /customers` | List customers with pagination |
| `BookingPage.tsx` | `POST /customers/book` | Create/update customer on booking |
| ❓ Redeem flow | `POST /customers/activate-membership` | Update customer on membership activation |

---

## ✅ CHECKLIST

**Before starting Phase 2:**

- [ ] Decision made on missing fields strategy
- [ ] Postgres schema updated (if needed)
- [ ] Backup existing KV Store data
- [ ] Create branch: `feature/customer-postgres-migration`

**Phase 2 completion:**

- [ ] `customers_postgres.tsx` created
- [ ] All 10 endpoints implemented
- [ ] Error handling complete
- [ ] Logging added
- [ ] Manual testing passed

**Phase 3 completion:**

- [ ] Frontend updated
- [ ] E2E testing passed
- [ ] No breaking changes

**Phase 5 completion:**

- [ ] Old files deleted
- [ ] Documentation updated
- [ ] Migration complete

---

**END OF DOCUMENT**
