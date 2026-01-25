# 🧪 PHASE 2.5 TEST - STAFF MODULE (WAVE 2 START!)

**Extracted:** `staff.tsx` (5 routes)  
**From:** Inline routes + kvRoutes forEach in `index.tsx`  
**Risk Level:** ⭐⭐ Medium (has seed data logic)

---

## ✅ **CHANGES MADE:**

### **1. Created `/supabase/functions/server/staff.tsx`**
**Routes extracted:**
- `GET /make-server-84f9c112/staff` - List all staff
- `POST /make-server-84f9c112/staff` - Create staff member
- `PUT /make-server-84f9c112/staff/:id` - Update staff member  
- `DELETE /make-server-84f9c112/staff/:id` - Delete staff member
- `POST /make-server-84f9c112/staff/seed` - Seed 6 initial staff members

**Dependencies:**
- `_shared_kv.tsx` → `kvAdmin`

**KV Table:** `kv_store_89edbd69` (admin)  
**KV Prefix:** `staff:`

**Special Logic:**
- Seed route creates 6 realistic US nail salon staff members
- Includes: W2/1099 types, license numbers, specialties, schedules
- Commission rates, emergency contacts, work schedules

### **2. Updated `/supabase/functions/server/index.tsx`**
**Changes:**
- ✅ Added import: `import { staffApp } from './staff.tsx';`
- ✅ Mounted module: `app.route('/', staffApp);`
- ✅ Removed 'staff' from `kvRoutes` array (line ~1446)
- ✅ Commented out POST staff routes (lines ~1552-1690)

---

## 🧪 **TEST ENDPOINTS:**

### **Test 1: List All Staff**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/staff
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "staff:1737745900000",
      "name": "Jennifer Martinez",
      "nickname": "Jenny",
      "role": "Lead Technician",
      "phone": "(714) 555-0123",
      "email": "jennifer.martinez@bitcoinnailbar.com",
      "employmentType": "W2",
      "licenseNumber": "CA-NT-987456",
      "baseHourlyRate": "18.00",
      "commissionRate": 0.70,
      "specialties": ["Manicure", "Pedicure", "Gel Polish", "Nail Art", "Nail Extension"],
      "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "createdAt": "2026-01-24T..."
    }
  ]
}
```

---

### **Test 2: Create Staff Member**
```bash
curl -X POST \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Staff Phase 2.5",
    "nickname": "TestStaff",
    "phone": "(555) 555-0001",
    "role": "Nail Technician",
    "employmentType": "W2",
    "baseHourlyRate": "15.00",
    "commissionRate": 0.60
  }' \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/staff
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "staff:1737745950000",
    "name": "Test Staff Phase 2.5",
    "nickname": "TestStaff",
    "phone": "(555) 555-0001",
    "role": "Nail Technician",
    "employmentType": "W2",
    "baseHourlyRate": "15.00",
    "commissionRate": 0.60,
    "createdAt": "2026-01-24T..."
  }
}
```

---

### **Test 3: Update Staff Member**
```bash
curl -X PUT \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Staff Phase 2.5",
    "nickname": "UpdatedStaff",
    "phone": "(555) 555-0002",
    "role": "Senior Nail Artist",
    "employmentType": "1099",
    "baseHourlyRate": "20.00",
    "commissionRate": 0.80
  }' \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/staff/staff:1737745950000
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "staff:1737745950000",
    "name": "Updated Staff Phase 2.5",
    "nickname": "UpdatedStaff",
    "phone": "(555) 555-0002",
    "role": "Senior Nail Artist",
    "employmentType": "1099",
    "baseHourlyRate": "20.00",
    "commissionRate": 0.80,
    "createdAt": "2026-01-24T..."
  }
}
```

---

### **Test 4: Delete Staff Member**
```bash
curl -X DELETE \
  -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/staff/staff:1737745950000
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Staff member deleted successfully",
  "data": {
    "id": "staff:1737745950000",
    "name": "Updated Staff Phase 2.5",
    "nickname": "UpdatedStaff",
    "phone": "(555) 555-0002",
    "role": "Senior Nail Artist",
    "employmentType": "1099",
    "baseHourlyRate": "20.00",
    "commissionRate": 0.80,
    "createdAt": "2026-01-24T..."
  }
}
```

---

### **Test 5: Seed Staff Data (SPECIAL - Only run once!)**
```bash
curl -X POST \
  -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/staff/seed
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully seeded 6 staff members",
  "data": [
    {
      "id": "staff:1737745960000-abc123",
      "name": "Jennifer Martinez",
      "nickname": "Jenny",
      "role": "Lead Technician",
      ...
    },
    {
      "id": "staff:1737745960010-def456",
      "name": "Linda Nguyen",
      "nickname": "Linda",
      "role": "Senior Nail Artist",
      ...
    }
    // ... 4 more staff members ...
  ]
}
```

**⚠️ WARNING:** Seed route creates 6 staff members each time you run it. Only run once on fresh database or you'll have duplicates!

**Seeded Staff Members:**
1. **Jennifer Martinez** (Lead Technician) - W2
2. **Linda Nguyen** (Senior Nail Artist) - 1099
3. **Sarah Johnson** (Nail Technician) - W2
4. **Mai Tran** (Pedicure Specialist) - W2
5. **Jessica Lee** (Nail Technician) - 1099
6. **Emily Chen** (Apprentice) - W2

---

## ⚡ **QUICK TEST SCRIPT (Browser Console)**

```javascript
// ════════════════════════════════════════════
// PHASE 2.5 QUICK TEST - STAFF MODULE
// ════════════════════════════════════════════
const PROJECT_ID = "YOUR_PROJECT_ID";
const ANON_KEY = "YOUR_ANON_KEY";
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112`;

console.clear();
console.log("%c🧪 PHASE 2.5 TEST - STAFF MODULE", "font-size: 16px; font-weight: bold; color: #00ff00;");

async function testPhase25() {
  let staffCount = 0;

  // Test 1: List staff
  console.log("\n%c▶ Test 1: List Staff", "font-weight: bold;");
  try {
    const res1 = await fetch(`${BASE_URL}/staff`, {
      headers: { 'Authorization': `Bearer ${ANON_KEY}` }
    });
    const data1 = await res1.json();
    console.log(res1.ok && data1.success ? "%c  ✅ PASS" : "%c  ❌ FAIL", res1.ok ? "color: #00ff00;" : "color: #ff0000;");
    console.log("  Response:", data1);
    if (data1.data) {
      staffCount = data1.data.length;
      console.log(`  Found ${staffCount} staff members`);
    }
  } catch (e) {
    console.log("%c  ❌ ERROR", "color: #ff0000;");
    console.error(e);
  }

  // Test 2: Create staff
  console.log("\n%c▶ Test 2: Create Staff", "font-weight: bold;");
  try {
    const res2 = await fetch(`${BASE_URL}/staff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Staff Phase 2.5',
        nickname: 'TestStaff',
        phone: '(555) 555-0001',
        role: 'Nail Technician',
        employmentType: 'W2',
        baseHourlyRate: '15.00',
        commissionRate: 0.60
      })
    });
    const data2 = await res2.json();
    console.log(res2.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res2.ok ? "color: #00ff00;" : "color: #ff0000;");
    console.log("  Response:", data2);
    if (data2.data) console.log(`  📝 Created staff ID: ${data2.data.id}`);
  } catch (e) {
    console.log("%c  ❌ ERROR", "color: #ff0000;");
    console.error(e);
  }

  // Test 3: Update staff (if created)
  if (staffCount > 0) {
    console.log("\n%c▶ Test 3: Update Staff", "font-weight: bold;");
    try {
      const res3 = await fetch(`${BASE_URL}/staff/staff:1737745950000`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Updated Staff Phase 2.5',
          nickname: 'UpdatedStaff',
          phone: '(555) 555-0002',
          role: 'Senior Nail Artist',
          employmentType: '1099',
          baseHourlyRate: '20.00',
          commissionRate: 0.80
        })
      });
      const data3 = await res3.json();
      console.log(res3.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res3.ok ? "color: #00ff00;" : "color: #ff0000;");
      console.log("  Response:", data3);
      if (data3.data) console.log(`  📝 Updated staff ID: ${data3.data.id}`);
    } catch (e) {
      console.log("%c  ❌ ERROR", "color: #ff0000;");
      console.error(e);
    }
  } else {
    console.log("\n%c▶ Test 3: Update Staff", "font-weight: bold;");
    console.log("%c  ⏭️  SKIPPED (no staff created)", "color: #ffaa00;");
  }

  // Test 4: Delete staff (if created)
  if (staffCount > 0) {
    console.log("\n%c▶ Test 4: Delete Staff", "font-weight: bold;");
    try {
      const res4 = await fetch(`${BASE_URL}/staff/staff:1737745950000`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ANON_KEY}` }
      });
      const data4 = await res4.json();
      console.log(res4.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res4.ok ? "color: #00ff00;" : "color: #ff0000;");
      console.log("  Response:", data4);
      if (data4.data) console.log(`  🗑️ Deleted staff ID: ${data4.data.id}`);
    } catch (e) {
      console.log("%c  ❌ ERROR", "color: #ff0000;");
      console.error(e);
    }
  } else {
    console.log("\n%c▶ Test 4: Delete Staff", "font-weight: bold;");
    console.log("%c  ⏭️  SKIPPED (no staff created)", "color: #ffaa00;");
  }

  // Test 5: Seed staff (CONDITIONAL - only if no staff exists)
  if (staffCount === 0) {
    console.log("\n%c▶ Test 5: Seed Staff (No existing staff detected)", "font-weight: bold;");
    const confirmSeed = confirm("⚠️  This will create 6 staff members. Continue?");
    
    if (confirmSeed) {
      try {
        const res5 = await fetch(`${BASE_URL}/staff/seed`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${ANON_KEY}` }
        });
        const data5 = await res5.json();
        console.log(res5.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res5.ok ? "color: #00ff00;" : "color: #ff0000;");
        console.log("  Response:", data5);
        if (data5.data) console.log(`  🌱 Seeded ${data5.data.length} staff members`);
      } catch (e) {
        console.log("%c  ❌ ERROR", "color: #ff0000;");
        console.error(e);
      }
    } else {
      console.log("%c  ⏭️  SKIPPED (user cancelled)", "color: #ffaa00;");
    }
  } else {
    console.log("\n%c▶ Test 5: Seed Staff", "font-weight: bold;");
    console.log("%c  ⏭️  SKIPPED (staff already exists)", "color: #ffaa00;");
    console.log(`  Found ${staffCount} existing staff. Seed not needed.`);
  }

  console.log("\n%c═══════════════════════════════════", "color: #666;");
  console.log("%c📊 PHASE 2.5 TEST COMPLETE", "font-weight: bold;");
}

testPhase25();
```

---

## ✅ **SUCCESS CRITERIA:**

**Phase 2.5 PASS nếu:**
- ✅ GET /staff returns array of staff
- ✅ POST /staff creates new staff member
- ✅ PUT /staff/:id updates staff member
- ✅ DELETE /staff/:id deletes staff member
- ✅ POST /staff/seed creates 6 staff members (if run)
- ✅ No errors in server logs

**2/2 required tests pass = Phase 2.5 COMPLETE!** (seed is optional)

---

## 🎯 **WHAT TO TEST:**

### **QUICK TEST (3 minutes):**
Use browser console test script above - automatically tests all endpoints

### **MANUAL TEST (5 minutes):**
Test each endpoint individually with curl commands

### **PRODUCTION TEST (Optional):**
1. Check admin staff management page still works
2. Try creating staff from UI
3. Verify staff list displays correctly

---

## 🚨 **IF TESTS FAIL:**

### **Module Import Errors:**
- Check `staff.tsx` exists in `/supabase/functions/server/`
- Verify import in `index.tsx` line ~25
- Verify mount in `index.tsx` line ~116

### **Route Not Found Errors:**
- Check kvRoutes array only has `['appointments']` (1 item!)
- Verify inline routes are commented out

### **Seed Creates Duplicates:**
- This is expected if you run seed multiple times
- Seed is meant to run once on empty database
- To fix: manually delete duplicate staff from Supabase

---

## 📝 **REPORT FORMAT:**

```
✅ PHASE 2.5 TEST RESULTS:

Test 1 (List Staff):   ✅ / ❌ PASS/FAIL
Test 2 (Create Staff): ✅ / ❌ PASS/FAIL
Test 3 (Update Staff): ✅ / ❌ / ⏭️  PASS/FAIL/SKIPPED
Test 4 (Delete Staff): ✅ / ❌ / ⏭️  PASS/FAIL/SKIPPED
Test 5 (Seed Staff):   ✅ / ❌ / ⏭️  PASS/FAIL/SKIPPED

Server Logs: Clean / Has Errors

STATUS: PHASE 2.5 COMPLETE! / FAILED

[If complete] Ready for Phase 2.6 (Appointments)!
[If failed] Errors: [describe]
```

---

**Khi Phase 2.5 tests PASS, reply "OK 2.6" để tiếp tục Appointments Module!** 🚀