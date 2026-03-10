# 🚀 POSTGRES MIGRATION - QUICK START GUIDE

**Date:** 2026-01-28  
**Estimated Time:** 5-10 minutes  
**Difficulty:** Easy ⭐

---

## ✅ **PREREQUISITES**

Before starting:
- [x] Postgres tables created in Supabase
- [x] Migration backend deployed
- [x] You have Owner/Admin JWT token

---

## 📝 **STEP-BY-STEP INSTRUCTIONS**

### **Step 1: Get Your JWT Token** (2 mins)

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Paste and run:
   ```javascript
   localStorage.getItem('auth_token')
   ```
4. Copy the token (starts with `eyJ...`)

**✅ Checkpoint:** You have a JWT token copied

---

### **Step 2: Check Current Status** (1 min)

Open **Postman** or **Thunder Client** and send:

**Request:**
```http
GET https://{projectId}.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migration-status
Authorization: Bearer {YOUR_JWT_TOKEN}
```

**Replace:**
- `{projectId}` with your Supabase project ID
- `{YOUR_JWT_TOKEN}` with token from Step 1

**Expected Response:**
```json
{
  "success": true,
  "kvStore": {
    "technicians": 0,
    "appointments": 0,
    "assignmentLogs": 0
  },
  "postgres": {
    "technicians": 0,
    "appointments": 0,
    "assignmentLogs": 0
  }
}
```

**✅ Checkpoint:** You see current counts

---

### **Step 3: Run Migration** (2-5 mins)

**Request:**
```http
POST https://{projectId}.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-all
Authorization: Bearer {YOUR_JWT_TOKEN}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Full migration completed",
  "results": {
    "technicians": {
      "success": true,
      "migrated": 5,
      "errors": 0,
      "total": 5
    },
    "appointments": {
      "success": true,
      "migrated": 23,
      "errors": 0,
      "total": 23
    },
    "assignmentLogs": {
      "success": true,
      "migrated": 8,
      "errors": 0,
      "total": 8
    }
  }
}
```

**✅ Checkpoint:** All migrations show `"success": true`

---

### **Step 4: Verify in Supabase** (1 min)

1. Open **Supabase Dashboard**
2. Go to **Table Editor**
3. Check these tables:
   - `technician_info` → Should have records
   - `appointment_info` → Should have records
   - `assignment_change_log` → Should have records

**SQL Query:**
```sql
SELECT 
  'technician_info' AS table_name, 
  COUNT(*) AS row_count 
FROM technician_info
UNION ALL
SELECT 
  'appointment_info', 
  COUNT(*) 
FROM appointment_info
UNION ALL
SELECT 
  'assignment_change_log', 
  COUNT(*) 
FROM assignment_change_log;
```

**Expected:**
```
table_name              | row_count
-----------------------|----------
technician_info        | 5
appointment_info       | 23
assignment_change_log  | 8
```

**✅ Checkpoint:** Counts match migration results

---

### **Step 5: Test Idempotency** (1 min)

Run the same migration again:

```http
POST https://{projectId}.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-all
Authorization: Bearer {YOUR_JWT_TOKEN}
```

**Expected Response:**
```json
{
  "success": true,
  "results": {
    "technicians": {
      "migrated": 0,
      "message": "No technicians to migrate"
    },
    ...
  }
}
```

**✅ Checkpoint:** Second run shows `migrated: 0` (no duplicates)

---

## 🎉 **MIGRATION COMPLETE!**

### **What Just Happened:**

✅ All staff data copied from KV Store → `technician_info`  
✅ All appointments copied → `appointment_info`  
✅ All assignment logs copied → `assignment_change_log`  
✅ Foreign keys mapped correctly  
✅ No data loss or duplicates  

### **Next Steps:**

1. **Keep KV Store Data** - Don't delete yet (backup)
2. **Monitor for Issues** - Check logs for 1-2 days
3. **Update Backend** - Switch endpoints to use Postgres (Phase 2 Step 4)
4. **Update Frontend** - Display from Postgres tables (Phase 2 Step 5)

---

## 🔍 **VERIFICATION CHECKLIST**

- [ ] Migration status shows correct counts
- [ ] All tables have data in Supabase
- [ ] Idempotency test passed (second run = 0 migrated)
- [ ] Foreign keys linked correctly (appointments → technicians)
- [ ] No errors in migration response

---

## ⚠️ **TROUBLESHOOTING**

### **Issue: "Unauthorized: Owner/Admin only"**

**Fix:** Get a valid JWT token with owner/admin role

---

### **Issue: "Foreign key constraint violation"**

**Fix:** Run migrations in order:
1. Technicians first
2. Appointments second
3. Assignment logs third

Or use `/migrate-all` to run in correct sequence.

---

### **Issue: Migration shows errors**

**Check:**
1. Supabase logs: Functions → make-server-89edbd69 → Logs
2. Look for detailed error messages
3. Check if Postgres tables exist

**Common Fixes:**
- Verify tables created with correct schema
- Check foreign key columns (customer_id, technician_id)
- Ensure `customer_profiles` table exists

---

## 📞 **NEED HELP?**

### **Quick Commands:**

**Check status:**
```bash
GET /migration-status
```

**Run migration:**
```bash
POST /migrate-all
```

**View individual migration:**
```bash
POST /migrate-technicians
POST /migrate-appointments
POST /migrate-assignment-logs
```

### **Logs:**

**Backend logs:** Supabase Dashboard → Functions → Logs  
**SQL Editor:** Supabase Dashboard → SQL Editor  
**Table Editor:** Supabase Dashboard → Table Editor  

---

## ✅ **SUCCESS CRITERIA**

Migration successful when:

- ✅ `migrated` counts match KV Store counts
- ✅ `errors: 0` for all migrations
- ✅ Tables visible in Supabase Table Editor
- ✅ Foreign keys linked (appointments have technician_id)
- ✅ Idempotency test passed

---

**Congrats!** 🎉 Your data is now in Postgres! Ready for Step 4: Backend Refactor.

**See:** `/docs/POSTGRES_MIGRATION_STATUS.md` for full roadmap.
