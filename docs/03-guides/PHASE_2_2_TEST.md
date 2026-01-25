# 🧪 PHASE 2.2 TEST - BRANCHES MODULE

**Extracted:** `branches.tsx` (3 routes)  
**From:** Inline routes in `index.tsx`  
**Risk Level:** ⭐ Very Low

---

## ✅ **CHANGES MADE:**

### **1. Created `/supabase/functions/server/branches.tsx`**
**Routes extracted:**
- `GET /make-server-84f9c112/branches` - List all branches
- `POST /make-server-84f9c112/branches` - Create branch
- `DELETE /make-server-84f9c112/branches/:id` - Delete branch

**Dependencies:**
- `_shared_kv.tsx` → `kvAdmin`
- `_shared_supabase_client.tsx` → `getSupabaseClient`
- `_shared_constants.tsx` → `KV_TABLE_ADMIN`

**KV Table:** `kv_store_89edbd69` (admin)  
**KV Prefix:** `branch:`

### **2. Updated `/supabase/functions/server/index.tsx`**
**Changes:**
- ✅ Added import: `import { branchesApp } from './branches.tsx';`
- ✅ Mounted module: `app.route('/', branchesApp);`
- ✅ Removed 'branches' from `kvRoutes` array (line ~1439)
- ✅ Commented out POST and DELETE branch routes

---

## 🧪 **TEST ENDPOINTS:**

### **Test 1: List All Branches (With Auth)**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/branches
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "branch:1737745200000",
      "name": "Main Branch",
      "address": "123 Main St",
      "createdAt": "2026-01-24T..."
    }
  ]
}
```

---

### **Test 2: Create Branch (With Auth)**
```bash
curl -X POST \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Branch Phase 2.2",
    "address": "456 Test St",
    "phone": "555-0123"
  }' \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/branches
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "branch:1737745300000",
    "name": "Test Branch Phase 2.2",
    "address": "456 Test St",
    "phone": "555-0123",
    "createdAt": "2026-01-24T..."
  }
}
```

---

### **Test 3: Delete Branch (With Auth)**

⚠️ **Use ID from Test 2 response**

```bash
curl -X DELETE \
  -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/branches/branch:1737745300000
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

---

## ⚡ **QUICK TEST SCRIPT (Browser Console)**

```javascript
// ════════════════════════════════════════════
// PHASE 2.2 QUICK TEST - BRANCHES MODULE
// ════════════════════════════════════════════
const PROJECT_ID = "YOUR_PROJECT_ID";
const ANON_KEY = "YOUR_ANON_KEY";
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112`;

console.clear();
console.log("%c🧪 PHASE 2.2 TEST - BRANCHES MODULE", "font-size: 16px; font-weight: bold; color: #00ff00;");

async function testPhase22() {
  let createdBranchId = null;

  // Test 1: List branches
  console.log("\n%c▶ Test 1: List Branches", "font-weight: bold;");
  try {
    const res1 = await fetch(`${BASE_URL}/branches`, {
      headers: { 'Authorization': `Bearer ${ANON_KEY}` }
    });
    const data1 = await res1.json();
    console.log(res1.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res1.ok ? "color: #00ff00;" : "color: #ff0000;");
    console.log("  Response:", data1);
  } catch (e) {
    console.log("%c  ❌ ERROR", "color: #ff0000;");
    console.error(e);
  }

  // Test 2: Create branch
  console.log("\n%c▶ Test 2: Create Branch", "font-weight: bold;");
  try {
    const res2 = await fetch(`${BASE_URL}/branches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Branch Phase 2.2',
        address: '456 Test St',
        phone: '555-0123'
      })
    });
    const data2 = await res2.json();
    console.log(res2.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res2.ok ? "color: #00ff00;" : "color: #ff0000;");
    console.log("  Response:", data2);
    
    if (data2.success && data2.data) {
      createdBranchId = data2.data.id;
      console.log(`  📝 Created branch ID: ${createdBranchId}`);
    }
  } catch (e) {
    console.log("%c  ❌ ERROR", "color: #ff0000;");
    console.error(e);
  }

  // Test 3: Delete branch
  if (createdBranchId) {
    console.log("\n%c▶ Test 3: Delete Branch", "font-weight: bold;");
    try {
      const res3 = await fetch(`${BASE_URL}/branches/${createdBranchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ANON_KEY}` }
      });
      const data3 = await res3.json();
      console.log(res3.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res3.ok ? "color: #00ff00;" : "color: #ff0000;");
      console.log("  Response:", data3);
    } catch (e) {
      console.log("%c  ❌ ERROR", "color: #ff0000;");
      console.error(e);
    }
  } else {
    console.log("\n%c▶ Test 3: SKIPPED (no branch ID)", "color: orange;");
  }

  console.log("\n%c═══════════════════════════════════", "color: #666;");
  console.log("%c📊 PHASE 2.2 TEST COMPLETE", "font-weight: bold;");
}

testPhase22();
```

---

## ✅ **SUCCESS CRITERIA:**

**Phase 2.2 PASS nếu:**
- ✅ GET /branches returns array of branches
- ✅ POST /branches creates new branch with generated ID
- ✅ DELETE /branches/:id deletes branch successfully
- ✅ No errors in server logs
- ✅ No "Module not found" errors

**3/3 tests pass = Phase 2.2 COMPLETE! 🎉**

---

## 🚨 **IF TESTS FAIL:**

### **Error: "Module not found 'branches.tsx'"**
**Fix:** Deploy lại function

### **Error: "branches is not defined in kvRoutes"**
**Fix:** Confirm đã remove 'branches' from kvRoutes array (line ~1439)

### **GET still returns old data**
**Fix:** Clear edge function cache in Supabase Dashboard

---

## 📝 **REPORT FORMAT:**

```
✅ PHASE 2.2 TEST RESULTS:

Test 1 (List): ✅ / ❌
Test 2 (Create): ✅ / ❌
Test 3 (Delete): ✅ / ❌

Server Logs: Clean / Has Errors
Module Import: Success / Failed

STATUS: PASS / FAIL

[If PASS] → Ready for Phase 2.3 (Services Module)
[If FAIL] → [Describe issue]
```

---

**Khi tất cả tests PASS, reply "OK 2.3" để tiếp tục Phase 2.3!** 🚀
