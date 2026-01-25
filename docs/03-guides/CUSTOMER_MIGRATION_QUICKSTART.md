# CUSTOMER POSTGRES MIGRATION - QUICKSTART GUIDE

**For:** Developers starting Phase 2 implementation  
**Prerequisite:** Read `CUSTOMER_POSTGRES_MIGRATION.md` first

---

## 🎯 GOAL

Migrate customer system from **KV Store** → **Postgres Table** (`customer_profiles`)

---

## ⚡ QUICK DECISION TREE

### **Step 1: Decide on Missing Fields**

KV Store has these fields NOT in Postgres:

- `date_of_birth`
- `gender`
- `address`
- `notes`

**Choose ONE:**

✅ **Option A: Add to Schema (RECOMMENDED)**

```sql
-- Run in Supabase SQL Editor
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS notes text;
```

❌ **Option B: Use JSONB**

```sql
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
```

❌ **Option C: Ignore** (Data loss)

---

## 📋 PHASE 2 CHECKLIST

### **File 1: `customers_postgres.tsx`**

**Create new file:** `/supabase/functions/server/customers_postgres.tsx`

**Implement these endpoints:**

- [ ] `GET /customers` - List with pagination
- [ ] `POST /customers` - Create customer
- [ ] `GET /customers/:id` - Get by UUID
- [ ] `PUT /customers/:id` - Update customer
- [ ] `DELETE /customers/:id` - Soft delete (set status = 'inactive')
- [ ] `POST /customers/search` - Search by name/phone/email

**Key differences from KV Store:**

1. Use **UUID** for `id` instead of `customer_us:phone`
2. Store phone separately in `phone` column
3. Calculate `phone_display` on-the-fly (don't store)
4. Map `total_spent` → `lifetime_spend`
5. Map `last_visit` → `last_visit_date`
6. Map membership fields:
   - `membership.tier` → `tier`
   - `membership.activated_at` → `membership_start_date`
   - `membership.expires_at` → `membership_end_date`

---

### **File 2: `customers_booking_postgres.tsx`**

**Create new file:** `/supabase/functions/server/customers_booking_postgres.tsx`

**Implement these endpoints:**

- [ ] `POST /customers/book` - Auto-create/update on booking
- [ ] `GET /customers/lookup/:phone` - Lookup by phone

**Critical logic:**

1. Search by `phone` field (not ID)
2. Generate new UUID if creating customer
3. Only count stats if `appointment_status = 'Complete'`
4. Track appointments via foreign key (NOT embedded array)

---

### **File 3: `customers_membership_postgres.tsx`**

**Create new file:** `/supabase/functions/server/customers_membership_postgres.tsx`

**Implement these endpoints:**

- [ ] `POST /customers/activate-membership` - Update membership
- [ ] `GET /customers/membership/:identifier` - Check status

**Critical logic:**

1. Update `tier`, `membership_start_date`, `membership_end_date`
2. Handle stacking: Extend `membership_end_date` for same tier
3. Handle upgrade: Replace tier if higher amount

---

### **File 4: Update `redeem.tsx`**

**Edit:** `/supabase/functions/server/redeem.tsx`

- [ ] Update `updateCustomerMembership()` function
- [ ] Change from KV Store to Postgres
- [ ] Use UUID-based customer lookup

---

### **File 5: Update `index.tsx`**

**Edit:** `/supabase/functions/server/index.tsx`

```typescript
// OLD (Comment out, don't delete yet)
// import { customersApp } from './customers_new.tsx';
// import { customersBookingApp } from './customers_booking.tsx';
// import { customersMembershipApp } from './customers_membership.tsx';

// NEW
import { customersApp } from './customers_postgres.tsx';
import { customersBookingApp } from './customers_booking_postgres.tsx';
import { customersMembershipApp } from './customers_membership_postgres.tsx';

// Keep old routes mounted for 1 week as fallback
```

---

## 🛠️ IMPLEMENTATION TEMPLATE

### **Postgres Helper (Reusable)**

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// Example: Get customer by ID
const { data, error } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('id', customerId)
  .single();

// Example: Search by phone
const { data, error } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('phone', normalizedPhone)
  .single();

// Example: Create customer
const { data, error } = await supabase
  .from('customer_profiles')
  .insert({
    id: crypto.randomUUID(),  // Generate UUID
    phone: normalizedPhone,
    full_name: fullName,
    email: email,
    tier: 'silver',
    status: 'active',
    total_visits: 0,
    lifetime_spend: 0
  })
  .select()
  .single();

// Example: Update customer
const { data, error } = await supabase
  .from('customer_profiles')
  .update({
    total_visits: customer.total_visits + 1,
    lifetime_spend: customer.lifetime_spend + amount,
    last_visit_date: new Date().toISOString()
  })
  .eq('id', customerId)
  .select()
  .single();
```

---

## 🔄 FIELD MAPPING CHEATSHEET

| KV Store | Postgres | Notes |
|----------|----------|-------|
| `id` | `id` | **Change:** `customer_us:xxx` → UUID |
| `phone` | `phone` | Same |
| `phone_display` | ❌ Calculate | Don't store |
| `full_name` | `full_name` | Same |
| `region` | ❌ Remove | US only |
| `email` | `email` | Same |
| `total_visits` | `total_visits` | Same |
| `total_spent` | `lifetime_spend` | **Rename** |
| `last_visit` | `last_visit_date` | **Rename** |
| `membership.tier` | `tier` | **Flatten** |
| `membership.activated_at` | `membership_start_date` | **Flatten** |
| `membership.expires_at` | `membership_end_date` | **Flatten** |
| `membership.status` | `status` | **Flatten** |
| `is_deleted` | `status = 'inactive'` | **Soft delete** |
| `created_at` | `created_at` | Same |
| `updated_at` | `updated_at` | Same (auto-trigger) |

---

## 🧪 TESTING CHECKLIST

### **Manual Testing (Postman/curl):**

- [ ] List customers: `GET /customers`
- [ ] Create customer: `POST /customers`
- [ ] Get customer: `GET /customers/:id`
- [ ] Update customer: `PUT /customers/:id`
- [ ] Delete customer: `DELETE /customers/:id`
- [ ] Search customers: `POST /customers/search`
- [ ] Booking create: `POST /customers/book` (new customer)
- [ ] Booking update: `POST /customers/book` (existing customer)
- [ ] Lookup: `GET /customers/lookup/:phone`
- [ ] Activate membership: `POST /customers/activate-membership`
- [ ] Check membership: `GET /customers/membership/:identifier`

### **Integration Testing:**

- [ ] Booking flow creates customer
- [ ] Redeem code updates customer
- [ ] Admin UI lists customers
- [ ] Membership discount applies

---

## 🚨 GOTCHAS

### **1. ID Format Change**

**Old:** `customer_us:5551234567`  
**New:** `550e8400-e29b-41d4-a716-446655440000` (UUID)

**Impact:** Frontend must handle UUID format.

---

### **2. Phone Lookup**

**Old:** ID = phone → Direct lookup  
**New:** ID = UUID → Must search by `phone` column

```typescript
// OLD
const customer = await kv.get(`customer_us:${phone}`);

// NEW
const { data } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('phone', phone)
  .single();
```

---

### **3. Membership Structure**

**Old:** Embedded object  
**New:** Flattened fields

```typescript
// OLD
{
  membership: {
    tier: 'Gold',
    expires_at: '2027-01-01'
  }
}

// NEW
{
  tier: 'Gold',
  membership_end_date: '2027-01-01'
}
```

**Frontend:** Must transform response to match old structure.

---

### **4. Soft Delete**

**Old:** `is_deleted = true`  
**New:** `status = 'inactive'`

```typescript
// OLD
await kv.set(customerId, { ...customer, is_deleted: true });

// NEW
await supabase
  .from('customer_profiles')
  .update({ status: 'inactive' })
  .eq('id', customerId);
```

---

## 📚 REFERENCE DOCS

1. **Migration Plan:** `/docs/04-changelogs/CUSTOMER_POSTGRES_MIGRATION.md`
2. **Endpoint Map:** `/docs/02-api/CUSTOMER_ENDPOINTS_MAP.md`
3. **Booking Logic:** `/docs/03-guides/BOOKING_CUSTOMER_LOGIC.md`
4. **Current KV Implementation:** `/supabase/functions/server/customers_new.tsx`

---

## ✅ FINAL CHECKLIST

**Before starting:**

- [ ] Read full migration plan
- [ ] Decide on missing fields strategy
- [ ] Run ALTER TABLE (if needed)
- [ ] Create feature branch

**After Phase 2:**

- [ ] All 3 new files created
- [ ] All endpoints working
- [ ] Manual testing passed
- [ ] Error handling complete

**After Phase 3:**

- [ ] Frontend updated
- [ ] E2E testing passed
- [ ] Ready for production

---

**READY TO START? → Begin with File 1: `customers_postgres.tsx`**

**Questions? → Check full migration plan in `/docs/04-changelogs/`**

---

**END OF DOCUMENT**
