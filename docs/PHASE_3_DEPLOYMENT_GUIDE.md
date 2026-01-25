# PHASE 3 - DEPLOYMENT & TESTING GUIDE

**Status:** 🟡 IN PROGRESS  
**Date:** 2026-01-23

---

## ⚠️ **CRITICAL: RUN SQL FIRST!**

Before testing, you **MUST** run the SQL schema update in Supabase.

### **Step-by-Step:**

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to **SQL Editor** (left sidebar)

2. **Create New Query**
   - Click "+ New query"
   - Name it: "Customer Migration Schema Update"

3. **Copy & Paste This SQL:**

```sql
-- ============================================
-- CUSTOMER PROFILES SCHEMA UPDATE
-- Add missing fields from KV Store
-- Date: 2026-01-23
-- ============================================

-- Add missing columns
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS notes text;

-- Add phone index for fast lookup (ID is UUID now, not phone-based)
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles (phone);

-- Add created_by tracking (optional - can be NULL)
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS created_by text;

-- Add membership_amount for tier comparison logic
ALTER TABLE customer_profiles 
  ADD COLUMN IF NOT EXISTS membership_amount NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN customer_profiles.membership_amount IS 'Amount paid for current membership (used for tier upgrade comparison)';

-- Verify schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'customer_profiles'
ORDER BY ordinal_position;
```

4. **Run the Query**
   - Click "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for success message
   - Should see list of columns at the end

5. **Verify Success**
   - Check that query ran without errors
   - Last SELECT should show all columns including new ones:
     - `date_of_birth`
     - `gender`
     - `address`
     - `notes`
     - `created_by`
     - `membership_amount`

---

## 🔐 **STEP 2: LOGIN TO ADMIN**

The "Authentication failed" error means your session expired.

1. **Go to Login Page**
   - Navigate to `/admin/login`
   - Or click the error message

2. **Login as Owner**
   - Use your owner credentials
   - Get fresh JWT token

3. **Navigate to Loyalty Programs**
   - Click "Loyalty Programs" in sidebar
   - Should load customer list (if SQL was run)

---

## 🧪 **STEP 3: TEST CUSTOMER LIST**

Once logged in and SQL is run:

### **Expected Behavior:**
- ✅ Customer list loads
- ✅ Shows customers in table
- ✅ Pagination works
- ✅ No errors in console

### **If You See Errors:**

**Error: "Column does not exist"**
- **Cause:** SQL schema update not run
- **Fix:** Go back to Step 1

**Error: "No customers found"**
- **Cause:** Database is empty (normal for fresh install)
- **Fix:** Create test customer using Postman

**Error: "401 Unauthorized"**
- **Cause:** Token expired
- **Fix:** Login again

---

## 📊 **STEP 4: VERIFY DATA STRUCTURE**

Open browser console (F12) and check the API response:

```javascript
// Should see this structure:
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "uuid-here",  // ✅ UUID (not customer_us:phone)
        "phone": "5551234567",
        "phone_display": "(555) 123-4567",  // ✅ Formatted
        "full_name": "Customer Name",
        "email": "email@example.com",
        "total_visits": 0,  // ✅ Renamed from visits
        "total_spent": 0,   // ✅ Renamed from lifetime_spend
        "membership": {     // ✅ Transformed from flat fields
          "tier": "guest",
          "status": "active"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 1,
      "totalCount": 0
    }
  }
}
```

---

## 🧪 **STEP 5: CREATE TEST CUSTOMER**

If database is empty, create a test customer using Postman:

### **Using Postman:**

1. **Import Collection**
   - File: `/docs/CUSTOMER_API_POSTMAN_COLLECTION.json`

2. **Set Environment Variables**
   - `projectId`: Your Supabase project ID
   - `publicAnonKey`: Your anon key
   - `adminToken`: JWT from login (copy from localStorage)

3. **Run Request: "1.2 Create Customer"**
   - Body already populated with test data
   - Click Send
   - Should get 200 OK

4. **Refresh Admin UI**
   - Go back to browser
   - Refresh Loyalty Programs page
   - Should see the test customer

---

## ✅ **SUCCESS CRITERIA**

Migration is successful when:

- ✅ SQL schema update runs without errors
- ✅ Admin can login and access Loyalty Programs
- ✅ Customer list loads (even if empty)
- ✅ Can create customer via Postman
- ✅ New customer appears in admin UI
- ✅ All fields display correctly
- ✅ Pagination works

---

## 🚨 **ROLLBACK PLAN**

If something goes wrong:

### **Option 1: Revert to KV Store**

Edit `/supabase/functions/server/index.tsx`:

```typescript
// Comment out Postgres imports
// import { customersApp } from './customers_postgres.tsx';
// import { customersBookingApp } from './customers_booking_postgres.tsx';
// import { customersMembershipApp } from './customers_membership_postgres.tsx';

// Uncomment KV Store imports
import { customersApp } from './customers_new.tsx';
import { customersBookingApp } from './customers_booking.tsx';
import { customersMembershipApp } from './customers_membership.tsx';
```

Deploy and it will go back to KV Store.

### **Option 2: Fix Forward**

1. Check Supabase logs for exact error
2. Verify SQL ran correctly
3. Check column names match code
4. Re-run SQL if needed

---

## 📝 **TESTING CHECKLIST**

### **Backend (Postman):**
- [ ] SQL schema update ran successfully
- [ ] GET /customers returns empty array or customer list
- [ ] POST /customers creates customer
- [ ] Customer appears in database
- [ ] Response format matches expected structure

### **Frontend (Browser):**
- [ ] Can login to admin
- [ ] Loyalty Programs page loads
- [ ] Customer list displays
- [ ] Pagination works
- [ ] No console errors

### **Integration:**
- [ ] Create customer in Postman → appears in UI
- [ ] Click customer in UI → details load
- [ ] Search works
- [ ] Pagination works

---

## 🎯 **CURRENT STATUS**

**Screenshot Analysis:**
- ❌ "Authentication failed" error
- ⚠️ This is EXPECTED - session expired
- ✅ Solution: Login again

**Next Actions:**
1. ⚠️ **RUN SQL FIRST** (most important!)
2. 🔐 Login to admin
3. 🧪 Test customer list
4. ✅ Verify everything works

---

## 📞 **TROUBLESHOOTING**

### **Problem: "Column 'date_of_birth' does not exist"**
**Solution:** Run SQL schema update in Step 1

### **Problem: "Authentication failed"**
**Solution:** Login again at `/admin/login`

### **Problem: "Empty customer list"**
**Solution:** Normal for fresh database. Create test customer.

### **Problem: "Cannot read property 'id' of undefined"**
**Solution:** Response structure mismatch. Check browser console for exact error.

---

**Last Updated:** 2026-01-23  
**Phase:** 3 - Frontend Testing  
**Status:** Waiting for SQL schema update
