# ✅ WAVE 1 TEST CHECKLIST

**Quick reference for testing all 4 Wave 1 phases**

---

## 📋 **PRE-DEPLOY CHECKLIST:**

- [ ] All 4 module files exist:
  - [ ] `/supabase/functions/server/setup.tsx`
  - [ ] `/supabase/functions/server/branches.tsx`
  - [ ] `/supabase/functions/server/services.tsx`
  - [ ] `/supabase/functions/server/reviews.tsx`

- [ ] `index.tsx` updated:
  - [ ] 4 imports added (lines ~21-24)
  - [ ] 4 mounts added (lines ~111-115)
  - [ ] `kvRoutes = ['staff', 'appointments']` (only 2 items)
  - [ ] Inline routes commented with phase markers

- [ ] No syntax errors in code editor

---

## 🚀 **DEPLOY:**

```bash
supabase functions deploy make-server-84f9c112
```

**Check:**
- [ ] Deploy successful (no errors)
- [ ] Function shows as "Active" in Supabase dashboard

---

## 🧪 **RUN TESTS:**

### **Option 1: Automated Script (RECOMMENDED)**

1. Open browser console on your app
2. Copy/paste script from `/docs/03-guides/PHASE_2_4_TEST.md` (search for "WAVE 1 COMPREHENSIVE TEST")
3. Update `PROJECT_ID` and `ANON_KEY`
4. Run script

**Expected Output:**
```
🏆 WAVE 1 TEST RESULTS

Phase 2.1 (Setup):     ✅ 3/3 PASS
Phase 2.2 (Branches):  ✅ 3/3 PASS
Phase 2.3 (Services):  ✅ 3/3 PASS
Phase 2.4 (Reviews):   ✅ 2/2 PASS

📊 OVERALL: 11/11 tests passed (100%)
🎉 WAVE 1 COMPLETE - ALL TESTS PASSED! 🎉
```

---

### **Option 2: Manual Testing**

#### **Phase 2.1 - Setup (3 tests):**

**Test 1: Health Check**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/health
```
- [ ] Returns `{"status": "healthy", ...}`

**Test 2: Database Check**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/db-check
```
- [ ] Returns `{"success": true, "database": "connected", ...}`

**Test 3: KV Test**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/test-kv
```
- [ ] Returns `{"success": true, "message": "KV store works", ...}`

---

#### **Phase 2.2 - Branches (3 tests):**

**Test 1: List Branches**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/branches
```
- [ ] Returns array: `{"success": true, "data": [...]}`

**Test 2: Create Branch**
```bash
curl -X POST \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Branch", "address": "123 Test St"}' \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/branches
```
- [ ] Returns created branch with ID
- [ ] **Save the ID for Test 3**

**Test 3: Delete Branch**
```bash
curl -X DELETE \
  -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/branches/{BRANCH_ID}
```
- [ ] Returns `{"success": true, ...}`

---

#### **Phase 2.3 - Services (3 tests):**

**Test 1: List Services (with enrichment)**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/services
```
- [ ] Returns array: `{"success": true, "data": [...]}`
- [ ] Each service has `bookingCount` field
- [ ] Each service has `isOwnerRecommended` field

**Test 2: Create Service**
```bash
curl -X POST \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Service", "price": 50, "duration": 60}' \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/services
```
- [ ] Returns created service with ID
- [ ] **Save the ID for Test 3**

**Test 3: Delete Service**
```bash
curl -X DELETE \
  -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/services/{SERVICE_ID}
```
- [ ] Returns `{"success": true, ...}`

---

#### **Phase 2.4 - Reviews (2 tests):**

**Test 1: List Reviews**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/reviews
```
- [ ] Returns array: `{"success": true, "data": [...]}`

**Test 2: Create Review**
```bash
curl -X POST \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"customerName": "Test Customer", "rating": 5, "comment": "Test review"}' \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/reviews
```
- [ ] Returns created review with ID

---

## 🖥️ **PRODUCTION VERIFICATION:**

### **Check Admin Dashboard:**
- [ ] Navigate to admin dashboard
- [ ] Check "Branches" page loads
- [ ] Check "Services" page loads
- [ ] Check "Reviews" page loads
- [ ] Try creating a test record in each section
- [ ] Try deleting the test records

### **Check Server Logs:**
```bash
supabase functions logs make-server-84f9c112 --tail
```

- [ ] No error messages in logs
- [ ] Request logs show correct routes:
  - `GET /make-server-84f9c112/branches`
  - `GET /make-server-84f9c112/services`
  - `GET /make-server-84f9c112/reviews`
  - etc.

### **Check Database:**
Go to Supabase Table Editor → `kv_store_89edbd69`

- [ ] Test records created successfully
- [ ] Test records deleted successfully
- [ ] No orphaned data

---

## 📊 **SCORING:**

Count your checkmarks:

**11/11 checks = WAVE 1 COMPLETE! 🎉**
- Ready for Wave 2!

**8-10/11 checks = MOSTLY WORKING**
- Review failed tests
- Minor fixes needed

**< 8/11 checks = NEEDS ATTENTION**
- Review errors carefully
- Consider rollback if critical

---

## 🚨 **COMMON ISSUES:**

### **"Module not found" error:**
**Cause:** Missing module file or typo in import  
**Fix:** Verify file exists and import matches exactly

### **"Route not found" error:**
**Cause:** Module not mounted or route path typo  
**Fix:** Check `app.route('/', {module}App)` line in index.tsx

### **Services missing enrichment fields:**
**Cause:** Booking count logic not running  
**Fix:** Check services.tsx lines ~37-52

### **kvRoutes still generating removed routes:**
**Cause:** Didn't remove from array  
**Fix:** Verify `kvRoutes = ['staff', 'appointments']` (only 2 items)

### **Deploy successful but routes 500 error:**
**Cause:** Runtime error in module  
**Fix:** Check function logs for error details

---

## ✅ **SUCCESS CRITERIA:**

**WAVE 1 PASSES IF:**
- ✅ All 11 automated tests pass OR all manual tests pass
- ✅ Admin dashboard pages load without errors
- ✅ Server logs show no errors
- ✅ Database records CRUD correctly
- ✅ No breaking changes to existing features

**If all criteria met:**
→ Reply **"OK Wave 2"** to continue!

---

## 📝 **REPORT TEMPLATE:**

```
✅ WAVE 1 TEST RESULTS:

AUTOMATED TESTS:
Phase 2.1 (Setup):     [ 3/3 or X/3 ] PASS/FAIL
Phase 2.2 (Branches):  [ 3/3 or X/3 ] PASS/FAIL
Phase 2.3 (Services):  [ 3/3 or X/3 ] PASS/FAIL
Phase 2.4 (Reviews):   [ 2/2 or X/2 ] PASS/FAIL

OVERALL: [ 11/11 or X/11 ] tests passed

PRODUCTION CHECKS:
- Admin Dashboard: ✅ / ❌
- Server Logs: Clean / Has Errors
- Database CRUD: ✅ / ❌

STATUS: WAVE 1 COMPLETE! / FAILED (describe issue)

[If complete] Ready for Wave 2!
[If failed] Errors: [describe here]
```

---

## 🎯 **NEXT STEPS AFTER PASS:**

1. Take a ☕ break! You completed 4 phases!
2. Reply **"OK Wave 2"** when ready to continue
3. Wave 2 will extract 6 more modules (staff, appointments, events, etc.)

---

**Good luck! 🚀**

_For detailed test scripts, see `/docs/03-guides/PHASE_2_4_TEST.md`_
