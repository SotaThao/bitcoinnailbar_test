# 🧪 PHASE 2.1 TEST - SETUP MODULE

**Extracted:** `setup.tsx` (3 routes)  
**From:** Inline routes in `index.tsx`  
**Risk Level:** ⭐ Very Low

---

## ✅ **CHANGES MADE:**

### **1. Created `/supabase/functions/server/setup.tsx`**
**Routes extracted:**
- `GET /make-server-84f9c112/health` - Health check
- `GET /make-server-84f9c112/setup/check` - Check if owner exists
- `POST /make-server-84f9c112/setup/owner` - Create owner account

**Dependencies:**
- `_shared_kv.tsx` → `kvAdmin`
- `helpers.tsx` → `User`, `Permissions` types

### **2. Updated `/supabase/functions/server/index.tsx`**
**Changes:**
- ✅ Added import: `import { setupApp } from './setup.tsx';`
- ✅ Mounted module: `app.route('/', setupApp);`
- ✅ Commented out old inline routes (lines 1196-1395)

---

## 🧪 **TEST ENDPOINTS:**

### **Test 1: Health Check (No Auth)**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "version": "v7-staff-management",
  "timestamp": "2026-01-24T..."
}
```

---

### **Test 2: Check Owner Exists (With Auth)**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/setup/check
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "has_owner": true
  }
}
```

---

### **Test 3: Create Owner (If No Owner Exists)**

⚠️ **SKIP THIS** if owner already exists. Only test in fresh environment.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Owner",
    "email": "owner@test.com",
    "phone": "1234567890",
    "password": "test123"
  }' \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/setup/owner
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "owner_...",
      "email": "owner@test.com",
      "full_name": "Test Owner",
      "role": "owner",
      ...
    },
    "permissions": { ... }
  }
}
```

---

## ⚡ **QUICK TEST SCRIPT (Browser Console)**

```javascript
// ════════════════════════════════════════════
// PHASE 2.1 QUICK TEST
// ════════════════════════════════════════════
const PROJECT_ID = "YOUR_PROJECT_ID";
const ANON_KEY = "YOUR_ANON_KEY";
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112`;

console.clear();
console.log("%c🧪 PHASE 2.1 TEST - SETUP MODULE", "font-size: 16px; font-weight: bold; color: #00ff00;");

async function testPhase21() {
  // Test 1: Health Check
  console.log("\n%c▶ Test 1: Health Check", "font-weight: bold;");
  try {
    const res1 = await fetch(`${BASE_URL}/health`);
    const data1 = await res1.json();
    console.log(res1.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res1.ok ? "color: #00ff00;" : "color: #ff0000;");
    console.log("  Response:", data1);
  } catch (e) {
    console.log("%c  ❌ ERROR", "color: #ff0000;");
    console.error(e);
  }

  // Test 2: Setup Check
  console.log("\n%c▶ Test 2: Setup Check", "font-weight: bold;");
  try {
    const res2 = await fetch(`${BASE_URL}/setup/check`, {
      headers: { 'Authorization': `Bearer ${ANON_KEY}` }
    });
    const data2 = await res2.json();
    console.log(res2.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res2.ok ? "color: #00ff00;" : "color: #ff0000;");
    console.log("  Response:", data2);
  } catch (e) {
    console.log("%c  ❌ ERROR", "color: #ff0000;");
    console.error(e);
  }

  console.log("\n%c═══════════════════════════════════", "color: #666;");
  console.log("%c📊 PHASE 2.1 TEST COMPLETE", "font-weight: bold;");
}

testPhase21();
```

---

## ✅ **SUCCESS CRITERIA:**

**Phase 2.1 PASS nếu:**
- ✅ Health check returns 200 OK with timestamp
- ✅ Setup check returns correct owner status
- ✅ No errors in server logs
- ✅ No "Module not found" errors

**2/2 tests pass = Phase 2.1 COMPLETE! 🎉**

---

## 🚨 **IF TESTS FAIL:**

### **Error: "Module not found 'setup.tsx'"**
**Fix:** Deploy lại function
```bash
supabase functions deploy make-server-84f9c112
```

### **Error: "Cannot find type User/Permissions"**
**Fix:** Check `helpers.tsx` exports types correctly

### **Health check returns old response (no timestamp)**
**Fix:** Clear edge function cache:
- Supabase Dashboard → Edge Functions → Restart function

---

## 📝 **REPORT FORMAT:**

```
✅ PHASE 2.1 TEST RESULTS:

Test 1 (Health): ✅ / ❌
Test 2 (Setup Check): ✅ / ❌

Server Logs: Clean / Has Errors
Module Import: Success / Failed

STATUS: PASS / FAIL

[If PASS] → Ready for Phase 2.2 (Branches Module)
[If FAIL] → [Describe issue]
```

---

**Khi tất cả tests PASS, reply "OK 2.2" để tiếp tục Phase 2.2!** 🚀
