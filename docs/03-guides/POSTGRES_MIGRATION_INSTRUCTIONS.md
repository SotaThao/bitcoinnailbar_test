# Postgres Migration Instructions - Step by Step

**Date:** 2026-01-28  
**Purpose:** Migrate Appointments & Technicians from KV Store to Postgres  
**Difficulty:** Medium  
**Estimated Time:** 15-30 minutes

---

## 🎯 OVERVIEW

This migration will move data from KV Store to Postgres tables:

| **From (KV Store)** | **To (Postgres)** | **Records** |
|---------------------|-------------------|-------------|
| `staff:*` | `technician_info` | ~5-10 technicians |
| `appointment:*` | `appointment_info` | ~100-500 appointments |
| `assignment-log:*` | `assignment_change_log` | ~50-200 logs |

---

## ⚠️ PREREQUISITES

Before starting, ensure:

- [x] You have access to Supabase Dashboard
- [x] You have `SUPABASE_SERVICE_ROLE_KEY` configured
- [x] You have Owner/Admin role in the system
- [x] You have a backup of current data (optional but recommended)

---

## 📋 STEP 1: CREATE POSTGRES TABLES

### **1.1 Open Supabase Dashboard**

1. Go to https://supabase.com/dashboard
2. Select your project: **Bitcoin Nail Bar**
3. Click **SQL Editor** in left sidebar

### **1.2 Run Migration SQL**

1. Click **"+ New Query"**
2. Open file: `/docs/01-architecture/POSTGRES_MIGRATION_SCHEMA.sql.tsx`
3. Copy **ENTIRE content** (Ctrl+A, Ctrl+C)
4. Paste into Supabase SQL Editor
5. Click **"Run"** button (or press F5)

⚠️ **IMPORTANT:** If you see error `relation "technician_info" already exists`, that means tables were already created! This is OK - skip to Step 2.

### **1.3 Verify Tables Created**

You should see success message:
```
✅ SUCCESS: Postgres tables created successfully!
```

Verify in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('technician_info', 'appointment_info', 'assignment_change_log');
```

Expected output:
```
appointment_info
assignment_change_log
technician_info
```

✅ **If you see all 3 tables, proceed to Step 2!**

---

## 📋 STEP 2: CHECK MIGRATION STATUS

Before migrating, check how much data exists:

### **2.1 Open Figma Make Admin Panel**

1. Log in to your admin account
2. Navigate to developer tools (F12)
3. Go to Console tab

### **2.2 Check Current Data**

Run this command in browser console:

```javascript
const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migration-status', {
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'X-Session-Token': localStorage.getItem('session_token')
  }
});
const data = await response.json();
console.log('Migration Status:', data);
```

Expected output:
```json
{
  "success": true,
  "kvStore": {
    "technicians": 6,
    "appointments": 150,
    "assignmentLogs": 25
  },
  "postgres": {
    "technicians": 0,
    "appointments": 0,
    "assignmentLogs": 0
  },
  "migrationComplete": {
    "technicians": false,
    "appointments": false,
    "assignmentLogs": false
  }
}
```

✅ **Note down how many records need to be migrated**

---

## 📋 STEP 3: RUN MIGRATION

### **3.1 Option A: Migrate Everything at Once (Recommended)**

Run in browser console:

```javascript
// FULL MIGRATION - Migrates all data in one go
const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-all', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'X-Session-Token': localStorage.getItem('session_token')
  }
});

const result = await response.json();
console.log('Migration Result:', result);
```

Expected output:
```json
{
  "success": true,
  "message": "Full migration completed",
  "results": {
    "technicians": {
      "success": true,
      "migrated": 6,
      "errors": 0,
      "total": 6
    },
    "appointments": {
      "success": true,
      "migrated": 150,
      "errors": 0,
      "total": 150
    },
    "assignmentLogs": {
      "success": true,
      "migrated": 25,
      "errors": 0,
      "total": 25
    }
  }
}
```

✅ **If all succeeded, go to Step 4!**

---

### **3.2 Option B: Migrate Step by Step**

If you want more control, migrate one table at a time:

#### **Step 3.2.1: Migrate Technicians First**

```javascript
const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-technicians', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'X-Session-Token': localStorage.getItem('session_token')
  }
});

const result = await response.json();
console.log('Technicians Migration:', result);
```

✅ **Wait for success before proceeding**

#### **Step 3.2.2: Migrate Appointments**

```javascript
const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-appointments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'X-Session-Token': localStorage.getItem('session_token')
  }
});

const result = await response.json();
console.log('Appointments Migration:', result);
```

✅ **Wait for success before proceeding**

#### **Step 3.2.3: Migrate Assignment Logs**

```javascript
const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-assignment-logs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'X-Session-Token': localStorage.getItem('session_token')
  }
});

const result = await response.json();
console.log('Assignment Logs Migration:', result);
```

✅ **All done!**

---

## 📋 STEP 4: VERIFY MIGRATION SUCCESS

### **4.1 Check Record Counts in Postgres**

In Supabase SQL Editor, run:

```sql
-- Check all tables
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

Expected output should match your KV Store counts from Step 2.1.

### **4.2 Spot Check Data Quality**

Check a few random records:

```sql
-- Check technicians
SELECT 
  id,
  name,
  specialties,
  rating,
  legacy_staff_id
FROM technician_info
LIMIT 5;

-- Check appointments
SELECT 
  id,
  customer_name,
  appointment_time,
  status,
  technician_id,
  legacy_appointment_id
FROM appointment_info
ORDER BY appointment_time DESC
LIMIT 5;

-- Check assignment logs
SELECT 
  id,
  appointment_id,
  from_technician_name,
  to_technician_name,
  reason_text,
  timestamp
FROM assignment_change_log
ORDER BY timestamp DESC
LIMIT 5;
```

✅ **Verify data looks correct**

### **4.3 Check Foreign Key Relationships**

```sql
-- Verify appointments are linked to technicians
SELECT 
  a.id,
  a.customer_name,
  a.appointment_time,
  t.name AS technician_name
FROM appointment_info a
LEFT JOIN technician_info t ON a.technician_id = t.id
WHERE a.technician_id IS NOT NULL
LIMIT 10;
```

✅ **Should see technician names populated correctly**

---

## 📋 STEP 5: UPDATE BACKEND CODE (Next Phase)

After migration is complete, we need to update backend code to use Postgres instead of KV Store.

**Status:** 🚧 Pending (will be done in next implementation phase)

Files to update:
- `/supabase/functions/server/staff.tsx` → Use Postgres queries
- `/supabase/functions/server/appointments.tsx` → Use Postgres queries
- `/supabase/functions/server/technician-assignment.tsx` → Use Postgres queries
- `/supabase/functions/server/assignment-logs.tsx` → Use Postgres queries

---

## ⚠️ TROUBLESHOOTING

### **Problem: "Table already exists" error**

**Solution:** Tables were already created. This is OK! Just skip to Step 3.

### **Problem: "Foreign key constraint violation"**

**Solution:** 
1. Make sure Step 3.2.1 (technicians) completed before Step 3.2.2 (appointments)
2. Appointments need technicians to exist first for foreign keys to work

### **Problem: "Unauthorized" error in Step 3**

**Solution:**
1. Verify you're logged in as Owner/Admin
2. Check your `X-Session-Token` is valid:
   ```javascript
   console.log('Session Token:', localStorage.getItem('session_token'));
   ```
3. If null, log out and log back in

### **Problem: Some records failed to migrate**

**Solution:**
1. Check the `details` array in migration response
2. Look for records with `status: 'error'`
3. Check error messages for specific issues (usually data validation)
4. Fix data in KV Store and re-run migration (it will skip already-migrated records)

### **Problem: Migration timeout**

**Solution:**
If you have >500 appointments:
1. Use Option B (Step 3.2) instead of Option A
2. Migrate in smaller batches
3. Contact support if still timing out

---

## 🎉 SUCCESS CRITERIA

Migration is complete when:

- [x] All 3 Postgres tables created
- [x] Record counts in Postgres match KV Store
- [x] Foreign key relationships work (appointments link to technicians)
- [x] Spot checks show correct data
- [x] Assignment logs reference correct appointments

---

## 🔄 ROLLBACK PLAN

If something goes wrong, you can rollback:

### **Option 1: Delete Postgres data only**

```sql
-- This keeps tables but removes data
TRUNCATE TABLE assignment_change_log CASCADE;
TRUNCATE TABLE appointment_info CASCADE;
TRUNCATE TABLE technician_info CASCADE;
```

KV Store data remains untouched!

### **Option 2: Drop tables completely**

```sql
-- This removes tables and data
DROP TABLE IF EXISTS assignment_change_log CASCADE;
DROP TABLE IF EXISTS appointment_info CASCADE;
DROP TABLE IF EXISTS technician_info CASCADE;
```

Then re-run Step 1 to recreate tables.

---

## 📞 SUPPORT

If you encounter issues:

1. Check troubleshooting section above
2. Review server logs in Supabase Dashboard → Logs
3. Check browser console for error messages
4. Contact development team with:
   - Error message
   - Screenshot of console
   - Migration status output from Step 2.1

---

**End of Instructions**

✅ **Proceed to Step 1 when ready!**