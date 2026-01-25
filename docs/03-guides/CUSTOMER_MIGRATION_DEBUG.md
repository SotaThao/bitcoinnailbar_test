# CUSTOMER MIGRATION DEBUG GUIDE

## 🐛 Troubleshooting: Customers Not Loading

### **Issue:**
After migrating from KV Store to Postgres `customer_profiles` table, customers are not appearing in Admin UI.

### **Root Cause:**
Old KV Store routes in `/supabase/functions/server/index.tsx` were **overriding** new Postgres routes from `customers_postgres.tsx`, causing the system to query the old KV Store instead of the new Postgres table.

---

## ✅ **FIXES APPLIED:**

### **1. Removed Duplicate Routes**
Commented out old customer routes in `index.tsx` (lines 1694-1816):
- ❌ OLD: `GET /customers` (KV Store)
- ❌ OLD: `POST /customers/search` (KV Store)
- ❌ OLD: `POST /customers` (KV Store)
- ✅ NOW: All routes handled by `customersApp` from `customers_postgres.tsx`

### **2. Added Debug Endpoints**
Created `/supabase/functions/server/debug-postgres-customers.tsx` with 3 endpoints:

#### **A. Check Table Schema**
```bash
GET /make-server-84f9c112/debug-postgres/customers/schema
```
**Returns:** Column names and sample record to verify table structure

#### **B. Count Total Customers**
```bash
GET /make-server-84f9c112/debug-postgres/customers/count
```
**Returns:** Total number of customers in `customer_profiles` table

#### **C. List Customers**
```bash
GET /make-server-84f9c112/debug-postgres/customers/list
```
**Returns:** First 10 customers with full data

---

## 🔍 **HOW TO DEBUG:**

### **Step 1: Check if Postgres table has data**
```bash
# Open browser console and run:
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/debug-postgres/customers/count', {
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log)
```

**Expected Output:**
```json
{
  "success": true,
  "total": 0  // ← If 0, table is EMPTY!
}
```

### **Step 2: Check table schema**
```bash
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/debug-postgres/customers/schema', {
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log)
```

**Expected Output:**
```json
{
  "success": true,
  "columns": [
    "id",
    "email",
    "phone",
    "full_name",
    "tier",
    "status",
    "membership_id",
    "membership_start_date",
    "membership_end_date",
    "total_visits",
    "lifetime_spend",
    "last_visit_date",
    "created_at",
    "updated_at"
  ],
  "sample_record": { ... }
}
```

### **Step 3: Check if data migration is needed**
If `total: 0`, you need to migrate data from KV Store to Postgres:

```bash
# Check KV Store customers count
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/debug-customers/all', {
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
}).then(r => r.json()).then(console.log)
```

If KV Store has customers but Postgres doesn't, **run migration endpoint** (if available) or contact admin to manually migrate data.

---

## 📊 **CURRENT ARCHITECTURE:**

### **Backend Files:**
```
/supabase/functions/server/
├── customers_postgres.tsx          ← NEW: Postgres CRUD (GET, POST, PUT, DELETE /customers)
├── customers_booking_postgres.tsx  ← NEW: Booking integration (POST /customers/book)
├── customers_membership_postgres.tsx ← NEW: Membership integration
├── index.tsx                       ← FIXED: Removed old KV Store routes
├── debug-customers.tsx             ← OLD: KV Store debug (keep for comparison)
└── debug-postgres-customers.tsx    ← NEW: Postgres debug
```

### **Table Structure:**
- **Postgres Table:** `customer_profiles` (Relational DB)
- **Old KV Table:** `kv_store_customers` (Deprecated - DO NOT USE for new features)

---

## 🚨 **IMPORTANT REMINDERS:**

1. **Always check which table your code is querying:**
   - ✅ NEW: `supabase.from('customer_profiles')` (Postgres)
   - ❌ OLD: `customerKV.get()` (KV Store)

2. **DO NOT add new routes in `index.tsx`** - use dedicated files like `customers_postgres.tsx`

3. **Frontend must use Postgres endpoints:**
   - `GET /make-server-84f9c112/customers` → List customers
   - `POST /make-server-84f9c112/customers/search` → Search customers
   - `GET /make-server-84f9c112/customers/:id` → Get customer details
   - `PUT /make-server-84f9c112/customers/:id` → Update customer
   - `DELETE /make-server-84f9c112/customers/:id` → Soft delete customer

4. **Schema Mapping:**
   Backend Postgres column → Frontend field:
   - `lifetime_spend` → `total_spent`
   - `last_visit_date` → `last_visit`
   - `membership_start_date` → `membership.activated_at`
   - `membership_end_date` → `membership.expires_at`

---

## ✅ **NEXT STEPS:**

1. **Test the fix:**
   - Open Admin > Redeem Codes > Customer Management tab
   - Check browser console for logs: `📋 [GET CUSTOMERS] Retrieved X/Y customers`
   - Verify customers are loading

2. **If customers still don't load:**
   - Check Step 1-3 above to verify data exists in Postgres
   - Check browser Network tab for API errors
   - Check Supabase Edge Function logs for backend errors

3. **If Postgres table is empty:**
   - You need to migrate data from KV Store
   - OR create test customers using `POST /customers` endpoint

---

## 📞 **Support:**

If customers still don't load after following this guide:
1. Share output of all 3 debug endpoints (schema, count, list)
2. Share browser console logs
3. Share Network tab screenshots of failing API calls
