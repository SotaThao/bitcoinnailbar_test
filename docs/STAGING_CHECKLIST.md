# ✅ STAGING SETUP CHECKLIST

**Quick reference - Hoàn thành từng bước**

---

## 📋 BƯỚC CẦN LÀM

### **☑️ STEP 1: Verify Staging Branch**
- [ ] Login vào Supabase Dashboard
- [ ] Thấy staging branch trong project
- [ ] Staging có database riêng
- [ ] Staging có API keys riêng

---

### **☑️ STEP 2: Get Staging Credentials**

**Vào:** Supabase Dashboard → Staging Branch → Settings → API

**Copy 3 thứ này:**
- [ ] `SUPABASE_URL` (staging)
- [ ] `SUPABASE_ANON_KEY` (staging)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (staging)

**Vào:** Settings → Database → Connection String
- [ ] `SUPABASE_DB_URL` (staging)

---

### **☑️ STEP 3: Configure Secrets**

**Vào:** Edge Functions → Settings (trong staging branch)

**Add các secrets này:**
```bash
✅ Required (staging-specific):
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SUPABASE_DB_URL

✅ Copy from production:
- [ ] DEEPSEEK_API_KEY
- [ ] CLOUDINARY_URL
- [ ] RESEND_API_KEY
- [ ] RESEND_FROM_EMAIL

✅ Optional:
- [ ] JWT_SECRET
```

---

### **☑️ STEP 4: Deploy Backend**

**In terminal:**
```bash
# Link to staging
- [ ] supabase link --project-ref [staging-ref]

# Deploy server function
- [ ] supabase functions deploy server --no-verify-jwt

# Verify deployment
- [ ] supabase functions list
```

---

### **☑️ STEP 5: Test Health Check**

```bash
# Replace [staging-ref] with your actual staging project ref
- [ ] curl https://[staging-ref].supabase.co/functions/v1/make-server-84f9c112/health
```

**Expected response:**
```json
{
  "status": "ok",
  "version": "v7-staff-management"
}
```

---

### **☑️ STEP 6: Create Test Owner**

```bash
- [ ] POST /setup/owner
```

**Request:**
```json
{
  "email": "admin@staging.test",
  "password": "staging123",
  "name": "Staging Admin"
}
```

**Should return:** `{ "success": true, "token": "..." }`

---

### **☑️ STEP 7: Update Frontend Config**

**Option A - Simple Toggle:**

Edit `/utils/supabase/info.tsx`:
```typescript
- [ ] const USE_STAGING = true; // Set to true

- [ ] export const projectId = USE_STAGING 
      ? "[staging-ref]"
      : "[production-ref]";

- [ ] export const publicAnonKey = USE_STAGING
      ? "[staging-anon-key]"
      : "[production-anon-key]";
```

---

### **☑️ STEP 8: Test Frontend**

**Connect frontend to staging và test:**
- [ ] Login works
- [ ] Chatbot works
- [ ] Can create booking
- [ ] Admin panel loads
- [ ] Dashboard shows data
- [ ] No CORS errors
- [ ] No console errors

---

### **☑️ STEP 9: Verify Database**

**In Supabase Dashboard → Staging → Table Editor:**
- [ ] Table `kv_store_89edbd69` exists
- [ ] Has columns: key, value, created_at, updated_at
- [ ] Can read data
- [ ] Can write data

---

### **☑️ STEP 10: Final Verification**

**All systems green?**
- [ ] ✅ Backend deployed to staging
- [ ] ✅ Health check passes
- [ ] ✅ Secrets configured
- [ ] ✅ Frontend connects to staging
- [ ] ✅ Login works
- [ ] ✅ Booking flow works
- [ ] ✅ Admin panel works
- [ ] ✅ Database accessible

**If ALL checked → Ready to refactor!** 🎉

---

## 🚀 NEXT STEP

### **After staging is ready:**

**Option 1: Start Phase 1 Refactoring** ✅ Recommended
- Extract chatbot.tsx (490 lines)
- Test in staging
- Deploy to production when verified

**Option 2: Seed Test Data First**
- Create sample customers
- Create sample appointments
- Create sample staff
- Then start refactoring

---

## 🆘 NEED HELP?

**If stuck on any step:**
1. Check full guide: `/docs/03-guides/STAGING_SETUP_GUIDE.md`
2. Ask me for help with specific step
3. I can guide you through each command

---

## 📊 PROGRESS TRACKING

**Mark your progress:**

```
Setup Progress: [____________________] 0%

After each step:
□□□□□□□□□□ → Step 1 done
■□□□□□□□□□ → Step 2 done
■■□□□□□□□□ → Step 3 done
...
■■■■■■■■■■ → All done! 🎉
```

---

**Current step you're on:**
→ _____________________ (fill this in)

**Bạn đang ở step nào? Tôi sẽ guide bạn qua step đó!** 🚀
