# REDEEM POSTGRES INTEGRATION FIX

**Date:** 2026-01-23  
**Status:** 🚨 **CRITICAL** - Redeem code vẫn dùng KV Store

---

## 🚨 **PROBLEM:**

### **Current State:**

File `/supabase/functions/server/redeem.tsx` has this comment:
```typescript
// ❌ DEPRECATED: KV Store import removed - now using Postgres via internal API
// import { customerKV } from './kv_store_customers.tsx';
```

**But the code STILL uses `customerKV`!**

### **Lines Using customerKV:**

| Line | Code | Purpose |
|------|------|---------|
| 596 | `customerKV.searchByPhone()` | Search customer by phone |
| 601 | `customerKV.searchByEmail()` | Search customer by email |
| 635 | `customerKV.set()` | Update existing customer |
| 693 | `customerKV.set()` | Create new customer (phone) |
| 740 | `customerKV.set()` | Create new customer (email) |
| 932 | `customerKV.searchByPhone()` | Helper function search |
| 937 | `customerKV.searchByEmail()` | Helper function search |
| 971 | `customerKV.set()` | Helper function update |

---

## 🎯 **ROOT CAUSE:**

**Import statement is commented out but code still compiles!**

**Why?** Checking if customerKV is imported elsewhere...

Actually, looking closer at the code, the import is commented but there's NO actual working import statement!

**This means:**
- Either the code is broken (throws runtime error)
- OR customerKV is imported globally/differently

---

## 🔍 **INVESTIGATION NEEDED:**

### **Check 1: Is redeem.tsx actually working?**

Test: Try to redeem a code
- If it works → customerKV is defined somewhere
- If it fails → Code is broken

### **Check 2: Check import at top of file**

Read full imports section of redeem.tsx

---

## ✅ **SOLUTION:**

### **Option 1: Use Internal Postgres API (Recommended)**

Replace all `customerKV` calls with fetch to Postgres endpoints:

**Before:**
```typescript
const existingCustomer = await customerKV.searchByPhone(normalizedPhone);
```

**After:**
```typescript
const response = await fetch(
  `https://${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-84f9c112/customers/search?phone=${normalizedPhone}`,
  {
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    }
  }
);
const data = await response.json();
const existingCustomer = data.data?.customers?.[0];
```

**Pros:**
- Consistent with Postgres migration
- API-based (good separation)
- Already implemented endpoints

**Cons:**
- HTTP overhead (internal call)
- More verbose

---

### **Option 2: Direct Postgres Query (Fastest)**

Import Supabase client and query `customer_profiles` table directly:

**Before:**
```typescript
const existingCustomer = await customerKV.searchByPhone(normalizedPhone);
```

**After:**
```typescript
const { data: existingCustomer } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('phone', normalizedPhone)
  .neq('status', 'suspended')
  .maybeSingle();
```

**Pros:**
- Fast (direct DB query)
- Less code
- No HTTP overhead

**Cons:**
- Mixing concerns (API + DB logic in same file)
- Need to handle Postgres data format

---

### **Option 3: Create Shared Helper Module**

Create `/supabase/functions/server/customers_helpers.tsx`:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

export const customerHelpers = {
  async searchByPhone(phone: string) {
    const { data } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('phone', phone)
      .neq('status', 'suspended')
      .maybeSingle();
    return data;
  },

  async searchByEmail(email: string) {
    const { data } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('email', email)
      .neq('status', 'suspended')
      .maybeSingle();
    return data;
  },

  async update(id: string, customer: any) {
    const { error } = await supabase
      .from('customer_profiles')
      .update(customer)
      .eq('id', id);
    if (error) throw error;
  },

  async create(customer: any) {
    const { error } = await supabase
      .from('customer_profiles')
      .insert(customer);
    if (error) throw error;
  }
};
```

Then in redeem.tsx:
```typescript
import { customerHelpers } from './customers_helpers.tsx';

// Use
const existingCustomer = await customerHelpers.searchByPhone(normalizedPhone);
await customerHelpers.update(existingCustomer.id, updatedCustomer);
```

**Pros:**
- Reusable across files
- Clean abstraction
- Easy to maintain

**Cons:**
- One more file to manage

---

## 📊 **RECOMMENDED APPROACH:**

**✅ Use Option 2: Direct Postgres Query**

**Why?**
1. Fast - no HTTP overhead
2. Simple - no new files
3. Consistent - same pattern as other backend files
4. Supabase client already imported in redeem.tsx

**Implementation:**
1. Remove customerKV calls
2. Replace with direct Postgres queries
3. Handle data format differences (KV vs Postgres)

---

## 🚀 **IMPLEMENTATION PLAN:**

### **Step 1: Backup Current File**

```bash
cp redeem.tsx redeem_backup_kv.tsx
```

### **Step 2: Update Search Functions**

**Line 596 - Search by Phone:**
```typescript
// OLD
existingCustomer = await customerKV.searchByPhone(normalizedPhone);

// NEW
const { data: existingCustomer } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('phone', normalizedPhone)
  .neq('status', 'suspended')
  .maybeSingle();
```

**Line 601 - Search by Email:**
```typescript
// OLD
existingCustomer = await customerKV.searchByEmail(normalizedUserId);

// NEW
const { data: existingCustomer } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('email', normalizedUserId)
  .neq('status', 'suspended')
  .maybeSingle();
```

### **Step 3: Update Create/Update Functions**

**Line 635, 693, 740, 971 - Set/Update Customer:**
```typescript
// OLD
await customerKV.set(existingCustomer.id, existingCustomer);

// NEW
const { error } = await supabase
  .from('customer_profiles')
  .upsert({
    id: existingCustomer.id,
    phone: existingCustomer.phone,
    email: existingCustomer.email,
    full_name: existingCustomer.full_name,
    total_visits: existingCustomer.total_visits,
    lifetime_spend: existingCustomer.total_spent, // ← Note: rename field
    tier: existingCustomer.membership?.tier || 'guest',
    membership_id: existingCustomer.membership?.id,
    membership_expires: existingCustomer.membership?.expires_at,
    membership_amount: existingCustomer.membership?.amount,
    notes: existingCustomer.notes,
    status: existingCustomer.is_deleted ? 'suspended' : 'active',
    updated_at: new Date().toISOString()
  });

if (error) {
  log.error('❌ [REDEEM] Failed to update customer:', error);
  throw error;
}
```

### **Step 4: Data Format Mapping**

**KV Store Format → Postgres Format:**

| KV Field | Postgres Field | Notes |
|----------|----------------|-------|
| `id` | `id` | Same |
| `phone` | `phone` | Same |
| `email` | `email` | Same |
| `full_name` | `full_name` | Same |
| `total_visits` | `total_visits` | Same |
| `total_spent` | `lifetime_spend` | ⚠️ **Field renamed** |
| `membership.tier` | `tier` | Extract from object |
| `membership.id` | `membership_id` | Extract from object |
| `membership.expires_at` | `membership_expires` | Extract from object |
| `membership.amount` | `membership_amount` | Extract from object |
| `notes` | `notes` | Same |
| `is_deleted` | `status` | Map: `true` → `'suspended'`, `false` → `'active'` |
| `created_at` | `created_at` | Same |
| `updated_at` | `updated_at` | Same |

**⚠️ CRITICAL: Handle field renames carefully!**

---

## 🧪 **TESTING CHECKLIST:**

After implementing fix:

- [ ] Redeem new code (create customer)
- [ ] Redeem code for existing customer (update customer)
- [ ] Redeem same tier code (time accumulation)
- [ ] Redeem higher tier code (upgrade)
- [ ] Redeem lower tier code (should fail)
- [ ] Check customer appears in `/admin/redeem-codes` tab
- [ ] Verify data in Postgres `customer_profiles` table
- [ ] Check membership data is correct

---

## 📈 **IMPACT:**

**Files to Update:**
- `/supabase/functions/server/redeem.tsx` (8 changes)

**Files to Test:**
- Frontend: `/src/app/pages/admin/MembershipManagement.tsx`
- Frontend: `/src/app/pages/admin/RedeemCodesManagement.tsx`
- Backend: All customer endpoints

**Breaking Changes:**
- None (internal implementation only)

**Data Migration:**
- Not needed (reading from Postgres)

---

## ⚠️ **RISKS:**

1. **Data format mismatch** - KV vs Postgres structure
2. **Missing fields** - Postgres may not have all KV fields
3. **Null handling** - undefined vs null differences
4. **Performance** - Direct queries faster than HTTP calls

**Mitigation:**
- Test thoroughly with real redeem flow
- Check console logs for errors
- Verify data in both databases during transition

---

## 🎯 **SUCCESS CRITERIA:**

✅ Redeem code creates/updates customer in Postgres  
✅ Customer appears in Customer Management tab  
✅ Membership data correct in `customer_profiles` table  
✅ No errors in console logs  
✅ Backward compatible with existing redemptions  

---

**Next Step:** Implement Option 2 (Direct Postgres Query) in redeem.tsx

**Last Updated:** 2026-01-23  
**Status:** Ready for implementation
