# Postgres Schema Fix - UUID Generation Workaround

**Date:** January 24, 2026  
**Status:** ⚠️ WORKAROUND APPLIED  
**Type:** Database Schema Issue  
**Impact:** Customer Profile Creation

---

## 🚨 Problem

Postgres table `customer_profiles` is missing `DEFAULT` value for `id` column:

```sql
-- Current (BROKEN)
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY NOT NULL,  -- ❌ No DEFAULT!
  -- ... other columns
);
```

This causes NULL constraint violations when inserting:
```
ERROR: null value in column "id" of relation "customer_profiles" violates not-null constraint
Failing row contains (null, ...)
```

---

## ✅ Workaround Applied (Code-Level Fix)

Generate UUID in application code before inserting.

### Files Modified

| File | Line | Change |
|------|------|--------|
| `/supabase/functions/server/index.tsx` | 700 | Added `crypto.randomUUID()` |
| `/supabase/functions/server/customers_booking_postgres.tsx` | 192 | Added `crypto.randomUUID()` |
| `/supabase/functions/server/customers_postgres.tsx` | 206 | Added `crypto.randomUUID()` |

### Implementation Pattern

**Before (Relying on DB DEFAULT):**
```typescript
const { data: customer, error } = await supabase
  .from('customer_profiles')
  .insert({
    // No id field - expect DB to auto-generate
    phone: normalizedPhone,
    email: customerEmail,
    // ...
  })
  .select()
  .single();
```

**After (Manual UUID Generation):**
```typescript
// Generate UUID in code
const customerId = crypto.randomUUID();

const { data: customer, error } = await supabase
  .from('customer_profiles')
  .insert({
    id: customerId,  // ✅ Explicitly provide UUID
    phone: normalizedPhone,
    email: customerEmail,
    // ...
  })
  .select()
  .single();
```

---

## 🔧 Permanent Fix (Database Schema Migration)

**RECOMMENDED:** Update Postgres schema to auto-generate UUIDs.

### Migration SQL

Run this in Supabase SQL Editor:

```sql
-- Add DEFAULT UUID generation to customer_profiles
ALTER TABLE customer_profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

### Verification

```sql
-- Test that DEFAULT works
INSERT INTO customer_profiles (phone, email, full_name, tier, status, total_visits, lifetime_spend, loyalty_points, marketing_opt_in, sms_opt_in, preferred_language, created_by)
VALUES ('1234567890', 'test@example.com', 'Test User', 'guest', 'active', 0, 0, 0, true, false, 'en', 'test')
RETURNING id;

-- Should return auto-generated UUID like:
-- id: 550e8400-e29b-41d4-a716-446655440000
```

### After Migration: Remove Workaround Code

Once schema is fixed, revert to cleaner pattern:

```typescript
// AFTER migration - DB auto-generates ID
const { data: customer, error } = await supabase
  .from('customer_profiles')
  .insert({
    // ✅ No id field needed anymore
    phone: normalizedPhone,
    email: customerEmail,
    // ...
  })
  .select()
  .single();

// DB returns auto-generated UUID in customer.id
```

---

## 📊 Complete Schema Reference

### Current Working Schema (with workaround)

```typescript
interface CustomerProfile {
  id: string;                    // UUID - manually generated via crypto.randomUUID()
  phone: string;                 // NOT NULL, UNIQUE (primary identifier)
  email: string;                 // NOT NULL
  full_name: string;             // NOT NULL
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  notes?: string | null;
  
  // Statistics
  total_visits: number;          // NOT NULL, DEFAULT 0
  lifetime_spend: number;        // NOT NULL, DEFAULT 0.00
  loyalty_points: number;        // NOT NULL, DEFAULT 0
  last_visit_date?: string | null;
  
  // Membership
  tier: 'guest' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  membership_id?: string | null;
  membership_end_date?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  
  // Preferences
  marketing_opt_in: boolean;     // NOT NULL, DEFAULT true
  sms_opt_in: boolean;           // NOT NULL, DEFAULT false
  preferred_language: string;    // NOT NULL, DEFAULT 'en'
  
  // Audit
  created_at: string;            // TIMESTAMP, DEFAULT now()
  updated_at: string;            // TIMESTAMP, DEFAULT now()
  created_by: string;            // NOT NULL
}
```

### Ideal Schema (after migration)

```sql
CREATE TABLE customer_profiles (
  -- UUID with auto-generation
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  notes TEXT,
  
  -- Statistics
  total_visits INTEGER NOT NULL DEFAULT 0,
  lifetime_spend DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  last_visit_date TIMESTAMP WITH TIME ZONE,
  
  -- Membership
  tier VARCHAR(20) NOT NULL DEFAULT 'guest',
  membership_id VARCHAR(100),
  membership_end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  -- Preferences
  marketing_opt_in BOOLEAN NOT NULL DEFAULT true,
  sms_opt_in BOOLEAN NOT NULL DEFAULT false,
  preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100) NOT NULL,
  
  -- Indexes
  CONSTRAINT customer_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT customer_profiles_phone_key UNIQUE (phone)
);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🧪 Testing Checklist

### Code Workaround Tests
- [x] Create customer in index.tsx (appointment booking)
- [x] Create customer in customers_booking_postgres.tsx (chatbot booking)
- [x] Create customer in customers_postgres.tsx (admin CRUD)
- [x] All UUIDs are valid format
- [x] No NULL constraint violations
- [x] IDs are unique across concurrent requests

### Schema Migration Tests (After Running SQL)
- [ ] Run migration SQL in Supabase SQL Editor
- [ ] Test INSERT without id field
- [ ] Verify UUID is auto-generated
- [ ] Remove `crypto.randomUUID()` from code
- [ ] Test all customer creation flows
- [ ] Confirm no performance regression

---

## ⚡ Performance Considerations

### Code-Level UUID Generation (Current)
- ✅ Works immediately without DB changes
- ✅ UUIDs are RFC 4122 compliant
- ✅ No DB round-trip for ID generation
- ⚠️ Code duplication across 3 files
- ⚠️ Must manually ensure consistency

### Database-Level UUID Generation (Recommended)
- ✅ Cleaner code (less boilerplate)
- ✅ Single source of truth (DB schema)
- ✅ Automatic for all inserts
- ✅ Works with bulk inserts
- ⚠️ Requires migration (5 min)

---

## 🎯 Impact

### Before Workaround
- ❌ All customer creation failed
- ❌ Bookings blocked by NULL ID errors
- ❌ Admin customer CRUD broken
- ❌ Production unusable

### After Workaround
- ✅ Customer creation works
- ✅ Bookings complete successfully
- ✅ Admin CRUD functional
- ✅ Production operational
- ⚠️ Code has duplication

### After Migration (Future)
- ✅ All benefits of workaround
- ✅ Cleaner, maintainable code
- ✅ Standard Postgres best practice
- ✅ Easier onboarding for new devs

---

## 📚 Related Issues

| Issue | File | Status |
|-------|------|--------|
| NULL ID constraint | `index.tsx` | ✅ FIXED (workaround) |
| NULL ID constraint | `customers_booking_postgres.tsx` | ✅ FIXED (workaround) |
| NULL ID constraint | `customers_postgres.tsx` | ✅ FIXED (workaround) |
| Column name mismatch | `index.tsx` | ✅ FIXED (`last_visit_date`) |
| Schema migration needed | Database | ⏳ PENDING |

---

## 🎓 Lessons Learned

1. **Always Define DEFAULT for NOT NULL Columns**
   - UUIDs should have `DEFAULT gen_random_uuid()`
   - Serial integers should have `DEFAULT nextval(...)`
   - Timestamps should have `DEFAULT CURRENT_TIMESTAMP`

2. **Code Workarounds vs Schema Fixes**
   - Code workarounds unblock immediately
   - Schema fixes provide long-term benefits
   - Always document both approaches

3. **Testing Schema Constraints**
   - Test inserts without explicit IDs
   - Verify constraints in staging before prod
   - Use migration scripts, not manual SQL

4. **UUID Best Practices**
   - Prefer `gen_random_uuid()` over `uuid_generate_v4()`
   - `gen_random_uuid()` is built-in to Postgres 13+
   - No extension required

---

## 🚀 Action Items

### Immediate (✅ DONE)
- [x] Apply code-level workaround
- [x] Test all customer creation flows
- [x] Deploy to production
- [x] Document workaround

### Short-Term (Next Sprint)
- [ ] Run schema migration SQL
- [ ] Test migration in staging
- [ ] Remove workaround code
- [ ] Re-test all flows
- [ ] Deploy clean version

### Long-Term (Technical Debt)
- [ ] Audit all Postgres tables for missing DEFAULTs
- [ ] Create migration template/checklist
- [ ] Add schema validation to CI/CD
- [ ] Document schema design standards

---

**Contributors:** Senior Fullstack Architect  
**Reviewed By:** Database Administrator ⏳  
**Status:** Workaround Deployed ✅ | Schema Fix Pending ⏳
