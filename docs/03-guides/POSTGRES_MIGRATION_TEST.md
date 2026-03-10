# 🧪 POSTGRES MIGRATION TEST GUIDE

## Overview

This guide explains how to test the KV Store → Postgres migration for the Staff & Appointments system.

---

## ✅ What Was Migrated

### **Tables Created:**
1. **`technician_info`** - Staff/technician data
2. **`appointment_info`** - Appointment bookings
3. **`assignment_change_log`** - Assignment history audit trail

### **Backend Files Refactored:**
- ✅ `/supabase/functions/server/appointments.tsx`
- ✅ `/supabase/functions/server/staff.tsx`
- ✅ `/supabase/functions/server/technician-assignment.tsx`
- ✅ `/supabase/functions/server/assignment-logs.tsx`

---

## 🚀 How to Test

### **Method 1: Test Page (Recommended)**

1. **Login as Admin/Owner**
2. **Navigate to:** `https://your-app.com/admin/test-migration`
3. **Click:** "▶️ Run All Tests"
4. **Watch:** Console logs for detailed output
5. **Verify:** All tests pass (green checkmarks)

### **What the Test Does:**

1. **Seeds 6 staff members** into `technician_info` table
2. **Retrieves all staff** from Postgres
3. **Creates a new appointment** in `appointment_info` table
4. **Auto-assigns best technician** using scoring algorithm (0-100 points)
5. **Logs assignment** to `assignment_change_log` table
6. **Verifies data integrity** across all tables

---

## 📋 Test Checklist

### ✅ **Staff Module:**
- [ ] Can create staff member
- [ ] Can update staff member
- [ ] Can delete staff member
- [ ] Can list all staff from Postgres
- [ ] Seed creates 6 staff members

### ✅ **Appointments Module:**
- [ ] Can create appointment
- [ ] Can update appointment
- [ ] Can list all appointments from Postgres
- [ ] Customer profile auto-created/updated
- [ ] Technician ID resolved via legacy_staff_id

### ✅ **Assignment Module:**
- [ ] Auto-assignment calculates scores correctly
- [ ] Manual assignment requires reason
- [ ] Time conflicts detected
- [ ] Skill matching works
- [ ] Income balancing works

### ✅ **Assignment Logs:**
- [ ] Logs written to Postgres
- [ ] Logs queryable by appointment
- [ ] Logs queryable by technician
- [ ] Statistics generated correctly

---

## 🔍 Verify Data in Postgres

### **Using Supabase Dashboard:**

1. Go to **Table Editor**
2. Check these tables:
   - `technician_info` - Should have 6+ staff members
   - `appointment_info` - Should have test appointments
   - `assignment_change_log` - Should have assignment logs

### **Using SQL Query:**

```sql
-- Count technicians
SELECT COUNT(*) FROM technician_info;

-- Count appointments
SELECT COUNT(*) FROM appointment_info;

-- Count assignment logs
SELECT COUNT(*) FROM assignment_change_log;

-- View recent appointments with technician
SELECT 
  a.id,
  a.customer_name,
  a.appointment_time,
  t.name AS technician_name,
  a.assignment_method,
  a.assignment_score
FROM appointment_info a
LEFT JOIN technician_info t ON a.technician_id = t.id
ORDER BY a.created_at DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### **Test Fails: "No staff found"**
- Run seed endpoint manually: `POST /staff/seed`
- Check Postgres connection
- Verify migration was completed

### **Test Fails: "Appointment not found"**
- Check appointment was created in Postgres (not KV Store)
- Verify backend routes are using Supabase client

### **Assignment Score is 0**
- Verify technician has matching specialties
- Check technician is available (is_available = true)
- Verify no time conflicts
- Check working_days includes appointment day

### **No Assignment Logs**
- Verify `assignment-logs.tsx` is using Postgres insert
- Check Postgres permissions
- Look for error logs in backend

---

## 📊 Expected Results

### **Successful Test Output:**

```
✅ Seed Staff (Postgres) - 6 staff members created
✅ Get All Staff (Postgres) - 6 staff members returned
✅ Create Appointment (Postgres) - Appointment created with UUID
✅ Auto-Assign Technician - Jennifer Martinez (Score: 85/100)
✅ Get Assignment Logs - 1 log entry found
✅ Get All Appointments - 1+ appointments returned
```

### **Score Breakdown (0-100 points):**

- **40 points:** Availability (working day, no conflicts, available)
- **30 points:** Skill match (specialties match service names)
- **15 points:** Rating (5-star = 15 points, 4-star = 12 points)
- **15 points:** Income balance (below average = bonus points)

**Example:** Jennifer Martinez
- Available on appointment day: +40
- Matches 2/2 services: +30
- Rating 4.8/5: +14
- Income below average: +12
- **Total: 96/100** ⭐

---

## 🎯 Next Steps After Testing

### **If All Tests Pass:**
1. ✅ Migration successful!
2. ✅ New bookings write to Postgres
3. ✅ Old KV data preserved (can be archived)
4. ⚠️ Run migration endpoints to copy old data

### **Migration Endpoints (Optional):**
```bash
# Migrate old KV data to Postgres
POST /make-server-89edbd69/migrate-to-postgres/migrate-all

# Check migration status
GET /make-server-89edbd69/migrate-to-postgres/migration-status
```

---

## ⚠️ Important Notes

### **What's Still in KV Store:**
- ✅ Service Menu (`settings:service-menu`) - Intentional
- ✅ Assignment Reasons (`assignment-reason:*`) - Intentional
- ✅ Gallery, Promotions, VLinkPay - Using correct tables

### **Data Mapping:**
- `staffId` (KV) → `technician_id` (Postgres)
- `staff:123` (KV) → UUID in `technician_info`
- `appointment:456` (KV) → UUID in `appointment_info`

### **Foreign Keys:**
- `appointment_info.technician_id` → `technician_info.id`
- `appointment_info.customer_id` → `customer_profiles.id`
- `assignment_change_log.appointment_id` → `appointment_info.id`

---

## 📞 Support

If tests fail or you encounter issues:
1. Check browser console for detailed error logs
2. Check Supabase function logs
3. Verify Postgres tables exist with correct schema
4. Contact dev team with test results JSON export

---

**Last Updated:** January 28, 2026  
**Migration Version:** v1.0 (Postgres Only)
