# ✅ POSTGRES MIGRATION TESTING GUIDE

**Date:** 2026-01-28  
**Purpose:** Guide để test migration từ KV Store → Postgres tables

---

## 📋 **PRE-MIGRATION CHECKLIST**

### ✅ **Step 1: Verify Postgres Tables**

Run trong Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('technician_info', 'appointment_info', 'assignment_change_log')
ORDER BY table_name;
```

**Expected output:**
```
appointment_info
assignment_change_log
technician_info
```

---

### ✅ **Step 2: Check Migration Status**

**Request:**
```bash
GET https://{projectId}.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migration-status
Authorization: Bearer {JWT_TOKEN}
```

**Expected response:**
```json
{
  "success": true,
  "kvStore": {
    "technicians": 0,      // Number in KV Store
    "appointments": 0,
    "assignmentLogs": 0
  },
  "postgres": {
    "technicians": 0,      // Number in Postgres
    "appointments": 0,
    "assignmentLogs": 0
  },
  "migrationComplete": {
    "technicians": true,
    "appointments": true,
    "assignmentLogs": true
  }
}
```

---

## 🚀 **MIGRATION EXECUTION**

### **Option 1: Migrate All (Recommended)**

Chạy tất cả migrations trong 1 request:

**Request:**
```bash
POST https://{projectId}.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-all
Authorization: Bearer {JWT_TOKEN}
```

**Expected response:**
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

---

### **Option 2: Step-by-Step Migration**

#### **Step 1: Migrate Technicians**

```bash
POST https://{projectId}.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-technicians
Authorization: Bearer {JWT_TOKEN}
```

**Expected:**
```json
{
  "success": true,
  "migrated": 5,
  "errors": 0,
  "total": 5,
  "details": [
    {
      "legacy_id": "staff:1738051200000",
      "postgres_id": "a1b2c3d4-...",
      "name": "Jenny Nguyen",
      "status": "success"
    },
    ...
  ]
}
```

---

#### **Step 2: Migrate Appointments**

⚠️ **IMPORTANT:** Chạy SAU KHI migrate technicians xong!

```bash
POST https://{projectId}.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-appointments
Authorization: Bearer {JWT_TOKEN}
```

**Expected:**
```json
{
  "success": true,
  "migrated": 23,
  "errors": 0,
  "total": 23,
  "details": [...]
}
```

---

#### **Step 3: Migrate Assignment Logs**

⚠️ **IMPORTANT:** Chạy SAU KHI migrate appointments xong!

```bash
POST https://{projectId}.supabase.co/functions/v1/make-server-89edbd69/migrate-to-postgres/migrate-assignment-logs
Authorization: Bearer {JWT_TOKEN}
```

**Expected:**
```json
{
  "success": true,
  "migrated": 8,
  "errors": 0,
  "total": 8
}
```

---

## 🔍 **POST-MIGRATION VERIFICATION**

### **Step 1: Check Record Counts**

Run trong Supabase SQL Editor:

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

---

### **Step 2: Verify Foreign Key Relationships**

```sql
-- Check appointments have valid technician_id
SELECT 
  COUNT(*) AS total_appointments,
  COUNT(technician_id) AS with_technician,
  COUNT(*) - COUNT(technician_id) AS without_technician
FROM appointment_info;
```

```sql
-- Check logs have valid appointment_id
SELECT 
  COUNT(*) AS total_logs,
  COUNT(appointment_id) AS with_appointment
FROM assignment_change_log;
```

---

### **Step 3: Check Sample Data**

```sql
-- View sample technicians
SELECT 
  id,
  name,
  phone,
  rating,
  is_available,
  legacy_staff_id
FROM technician_info
LIMIT 5;
```

```sql
-- View sample appointments
SELECT 
  id,
  customer_name,
  customer_phone,
  appointment_time,
  status,
  legacy_appointment_id
FROM appointment_info
ORDER BY appointment_time DESC
LIMIT 5;
```

---

## 🔄 **IDEMPOTENCY TEST**

Migration được thiết kế để chạy nhiều lần an toàn (idempotent).

**Test:** Chạy `/migrate-all` 2 lần liên tiếp

**Expected behavior:**
- Lần 1: `migrated: X` (migrate all records)
- Lần 2: `migrated: 0` (skip all - already exists)

**Test command:**
```bash
# Run 1
POST /migrate-all

# Run 2 (immediately after)
POST /migrate-all
```

**Expected response lần 2:**
```json
{
  "success": true,
  "results": {
    "technicians": {
      "success": true,
      "migrated": 0,
      "message": "No technicians to migrate"
    },
    ...
  }
}
```

---

## ⚠️ **TROUBLESHOOTING**

### **Issue 1: Foreign Key Errors**

**Error:**
```
violates foreign key constraint "appointment_info_technician_id_fkey"
```

**Solution:** Migrate technicians trước, appointments sau

---

### **Issue 2: Duplicate Legacy IDs**

**Error:**
```
duplicate key value violates unique constraint "technician_info_legacy_staff_id_key"
```

**Solution:** Record đã tồn tại - migration đã chạy trước đó. Safe to ignore.

---

### **Issue 3: Missing Customer IDs**

**Warning in logs:**
```
⚠️  Appointment migrated without customer_id - customer not found
```

**Explanation:** Customer chưa có trong `customer_profiles` table. Appointment vẫn được migrate nhưng `customer_id` = NULL.

**Fix:** Không cần fix - hệ thống vẫn work với `customer_phone`.

---

## 🧹 **ROLLBACK (if needed)**

Nếu migration có issue và muốn reset:

**WARNING:** ⚠️ Điều này sẽ XÓA TẤT CẢ migrated data!

```sql
-- Delete all migrated data
DELETE FROM assignment_change_log;
DELETE FROM appointment_info;
DELETE FROM technician_info;
```

Sau đó chạy lại migration.

---

## ✅ **SUCCESS CRITERIA**

Migration thành công khi:

- ✅ `kvStore.technicians` = `postgres.technicians`
- ✅ `kvStore.appointments` = `postgres.appointments`
- ✅ `kvStore.assignmentLogs` = `postgres.assignmentLogs`
- ✅ Foreign key relationships intact (appointments → technicians)
- ✅ No errors in migration response
- ✅ Idempotency test passed (can run multiple times)

---

## 📞 **SUPPORT**

**Common Commands:**

```bash
# Check migration status
GET /migration-status

# Run full migration
POST /migrate-all

# View logs in Supabase
# → Functions → make-server-89edbd69 → Logs
```

**SQL Queries:**

```sql
-- Total records
SELECT COUNT(*) FROM technician_info;
SELECT COUNT(*) FROM appointment_info;
SELECT COUNT(*) FROM assignment_change_log;

-- Check foreign keys
SELECT * FROM appointment_info WHERE technician_id IS NULL;
SELECT * FROM appointment_info WHERE customer_id IS NULL;
```

---

**Ready to test?** Bắt đầu với `/migration-status` để check current state! 🚀
