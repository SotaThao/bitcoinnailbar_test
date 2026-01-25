# 🧪 PHASE 2.3 TEST - SERVICES MODULE

**Extracted:** `services.tsx` (3 routes)  
**From:** Inline routes + kvRoutes forEach in `index.tsx`  
**Risk Level:** ⭐ Very Low (with booking count enrichment logic)

---

## ✅ **CHANGES MADE:**

### **1. Created `/supabase/functions/server/services.tsx`**
**Routes extracted:**
- `GET /make-server-84f9c112/services` - List all services **with booking count enrichment**
- `POST /make-server-84f9c112/services` - Create service
- `DELETE /make-server-84f9c112/services/:id` - Delete service

**Special Logic (GET route):**
- ✅ Fetches all appointments to calculate booking count per service
- ✅ Adds `bookingCount` field to each service
- ✅ Adds `isOwnerRecommended` flag (from `owner_recommended` field)
- ✅ Sorts services by booking count (descending - most popular first)

**Dependencies:**
- `_shared_kv.tsx` → `kvAdmin`
- `_shared_supabase_client.tsx` → `getSupabaseClient`
- `_shared_constants.tsx` → `KV_TABLE_ADMIN`

**KV Table:** `kv_store_89edbd69` (admin)  
**KV Prefix:** `service:`

### **2. Updated `/supabase/functions/server/index.tsx`**
**Changes:**
- ✅ Added import: `import { servicesApp } from './services.tsx';`
- ✅ Mounted module: `app.route('/', servicesApp);`
- ✅ Removed 'services' from `kvRoutes` array (line ~1440)
- ✅ Commented out POST and DELETE service routes (lines ~1491-1518)

---

## 🧪 **TEST ENDPOINTS:**

### **Test 1: List All Services (With Booking Count)**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/services
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "service:1737745400000",
      "name": "Manicure",
      "price": 25,
      "duration": 30,
      "createdAt": "2026-01-24T...",
      "bookingCount": 15,
      "isOwnerRecommended": true
    },
    {
      "id": "service:1737745500000",
      "name": "Pedicure",
      "price": 35,
      "duration": 45,
      "createdAt": "2026-01-24T...",
      "bookingCount": 8,
      "isOwnerRecommended": false
    }
  ]
}
```

**Note:** Services should be sorted by `bookingCount` (highest first)

---

### **Test 2: Create Service**
```bash
curl -X POST \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Service Phase 2.3",
    "price": 50,
    "duration": 60,
    "description": "Test service for Phase 2.3",
    "owner_recommended": true
  }' \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/services
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "service:1737745600000",
    "name": "Test Service Phase 2.3",
    "price": 50,
    "duration": 60,
    "description": "Test service for Phase 2.3",
    "owner_recommended": true,
    "createdAt": "2026-01-24T..."
  }
}
```

---

### **Test 3: Delete Service**

⚠️ **Use ID from Test 2 response**

```bash
curl -X DELETE \
  -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/services/service:1737745600000
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## ⚡ **QUICK TEST SCRIPT (Browser Console)**

```javascript
// ════════════════════════════════════════════
// PHASE 2.3 QUICK TEST - SERVICES MODULE
// ════════════════════════════════════════════
const PROJECT_ID = "YOUR_PROJECT_ID";
const ANON_KEY = "YOUR_ANON_KEY";
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112`;

console.clear();
console.log("%c🧪 PHASE 2.3 TEST - SERVICES MODULE", "font-size: 16px; font-weight: bold; color: #00ff00;");

async function testPhase23() {
  let createdServiceId = null;

  // Test 1: List services
  console.log("\n%c▶ Test 1: List Services (with booking count)", "font-weight: bold;");
  try {
    const res1 = await fetch(`${BASE_URL}/services`, {
      headers: { 'Authorization': `Bearer ${ANON_KEY}` }
    });
    const data1 = await res1.json();
    
    if (res1.ok && data1.success && Array.isArray(data1.data)) {
      console.log("%c  ✅ PASS", "color: #00ff00;");
      console.log(`  Found ${data1.data.length} services`);
      
      // Check enrichment
      if (data1.data.length > 0) {
        const sample = data1.data[0];
        const hasBookingCount = 'bookingCount' in sample;
        const hasIsOwnerRecommended = 'isOwnerRecommended' in sample;
        console.log(`  Enrichment: bookingCount=${hasBookingCount}, isOwnerRecommended=${hasIsOwnerRecommended}`);
        
        if (!hasBookingCount || !hasIsOwnerRecommended) {
          console.log("%c  ⚠️  WARNING: Enrichment fields missing!", "color: orange;");
        }
      }
    } else {
      console.log("%c  ❌ FAIL", "color: #ff0000;");
    }
    console.log("  Response:", data1);
  } catch (e) {
    console.log("%c  ❌ ERROR", "color: #ff0000;");
    console.error(e);
  }

  // Test 2: Create service
  console.log("\n%c▶ Test 2: Create Service", "font-weight: bold;");
  try {
    const res2 = await fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Service Phase 2.3',
        price: 50,
        duration: 60,
        description: 'Test service for Phase 2.3',
        owner_recommended: true
      })
    });
    const data2 = await res2.json();
    console.log(res2.ok ? "%c  ✅ PASS" : "%c  ❌ FAIL", res2.ok ? "color: #00ff00;" : "color: #ff0000;");
    console.log("  Response:", data2);
    
    if (data2.success && data2.data) {
      createdServiceId = data2.data.id;
      console.log(`  📝 Created service ID: ${createdServiceId}`);
    }
  } catch (e) {
    console.log("%c  ❌ ERROR", "color: #ff0000;");
    console.error(e);
  }

  // Test 3: Delete service
  if (createdServiceId) {
    console.log("\n%c▶ Test 3: Delete Service", "font-weight: bold;");
    try {
      const res3 = await fetch(`${BASE_URL}/services/${createdServiceId}`, {
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
    console.log("\n%c▶ Test 3: SKIPPED (no service ID)", "color: orange;");
  }

  console.log("\n%c═══════════════════════════════════", "color: #666;");
  console.log("%c📊 PHASE 2.3 TEST COMPLETE", "font-weight: bold;");
}

testPhase23();
```

---

## ✅ **SUCCESS CRITERIA:**

**Phase 2.3 PASS nếu:**
- ✅ GET /services returns array of services
- ✅ Each service has `bookingCount` field (number)
- ✅ Each service has `isOwnerRecommended` field (boolean)
- ✅ Services sorted by booking count (descending)
- ✅ POST /services creates new service with generated ID
- ✅ DELETE /services/:id deletes service successfully
- ✅ No errors in server logs

**3/3 tests pass + enrichment working = Phase 2.3 COMPLETE! 🎉**

---

## 🚨 **IF TESTS FAIL:**

### **Error: "Module not found 'services.tsx'"**
**Fix:** Deploy lại function

### **Error: "services is not defined in kvRoutes"**
**Fix:** Confirm đã remove 'services' from kvRoutes array (line ~1440)

### **GET missing bookingCount/isOwnerRecommended fields**
**Fix:** Check enrichment logic in services.tsx line ~37-52

### **Services not sorted by booking count**
**Fix:** Check sort logic in services.tsx line ~52

---

## 📝 **REPORT FORMAT:**

```
✅ PHASE 2.3 TEST RESULTS:

Test 1 (List): ✅ / ❌
  - Has bookingCount: ✅ / ❌
  - Has isOwnerRecommended: ✅ / ❌
  - Sorted by count: ✅ / ❌
Test 2 (Create): ✅ / ❌
Test 3 (Delete): ✅ / ❌

Server Logs: Clean / Has Errors
Module Import: Success / Failed

STATUS: PASS / FAIL

[If PASS] → Ready for Phase 2.4 (Reviews Module)
[If FAIL] → [Describe issue]
```

---

**Khi tất cả tests PASS, reply "OK 2.4" để tiếp tục Phase 2.4!** 🚀
