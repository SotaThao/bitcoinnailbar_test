# 🎯 BẠN ĐÃ TẠO STAGING - LÀM GÌ TIẾP THEO?

**Status:** ✅ Staging branch created on Supabase  
**Next:** Configure và deploy

---

## 📍 BẠN ĐANG Ở ĐÂY

```
✅ Step 1: Create staging branch (DONE!)
⬇️
🔵 Step 2: Get staging credentials (DO THIS NOW)
⬇️
⚪ Step 3: Configure secrets
⬇️
⚪ Step 4: Deploy to staging
⬇️
⚪ Step 5: Test staging
⬇️
⚪ Step 6: Start refactoring
```

---

## 🚀 LÀM NGAY - 5 BƯỚC

### **BƯỚC 1: Get Staging Credentials** ⏱️ 2 phút

**Làm gì:**
1. Vào: https://supabase.com/dashboard
2. Chọn project của bạn
3. **Chuyển sang STAGING branch** (có dropdown ở góc trên)
4. Vào: Settings → API

**Copy 2 thứ này:**
```typescript
// 1. Project URL
STAGING_URL: https://[staging-ref].supabase.co

// 2. Anon/Public Key (rất dài, bắt đầu bằng eyJhbGc...)
STAGING_ANON_KEY: eyJhbGc...
```

**Paste vào đây để tôi giúp update code:**
```
STAGING_URL: _________________________
STAGING_ANON_KEY: _____________________
```

---

### **BƯỚC 2: Configure Secrets** ⏱️ 3 phút

**Trong Supabase Dashboard (STAGING branch):**

1. Vào: Edge Functions → Settings
2. Thêm từng secret này:

```bash
# Required - MUST use staging values
SUPABASE_URL = https://[your-staging-ref].supabase.co
SUPABASE_ANON_KEY = [staging-anon-key-from-step-1]
SUPABASE_SERVICE_ROLE_KEY = [staging-service-role-key]

# Optional - Copy from production
DEEPSEEK_API_KEY = [same as production]
CLOUDINARY_URL = [same as production]
RESEND_API_KEY = [same as production]
RESEND_FROM_EMAIL = [same as production]
```

**Where to get SERVICE_ROLE_KEY:**
- Same page (Settings → API)
- Scroll down to "service_role" key
- Click "Reveal" and copy

**✅ Checklist:**
- [ ] Added SUPABASE_URL
- [ ] Added SUPABASE_ANON_KEY
- [ ] Added SUPABASE_SERVICE_ROLE_KEY
- [ ] Added other API keys

---

### **BƯỚC 3: Link to Staging** ⏱️ 1 phút

**Mở terminal và chạy:**

```bash
# Get your staging project ref from URL
# Example: https://abc123xyz.supabase.co → ref is "abc123xyz"

# Link to staging
supabase link --project-ref [your-staging-ref]

# Enter your database password when prompted
```

**✅ Success khi thấy:**
```
Linked to project [your-staging-ref]
```

---

### **BƯỚC 4: Deploy to Staging** ⏱️ 2 phút

```bash
# Deploy server function to staging
supabase functions deploy server --no-verify-jwt
```

**✅ Success khi thấy:**
```
Deployed function server (1.2s)
URL: https://[staging-ref].supabase.co/functions/v1/server
```

---

### **BƯỚC 5: Test Staging** ⏱️ 2 phút

**Test health endpoint:**

```bash
# Replace [staging-ref] with yours
curl https://[staging-ref].supabase.co/functions/v1/make-server-84f9c112/health
```

**✅ Should return:**
```json
{
  "status": "ok",
  "version": "v7-staff-management"
}
```

**If success → Staging is ready!** 🎉

---

## 🔧 UPDATE FRONTEND CONFIG

**Tôi đã tạo file mới:** `/utils/supabase/config.tsx`

**Bạn cần update:**

1. **Open:** `/utils/supabase/config.tsx`

2. **Update STAGING config:**
```typescript
const STAGING = {
  projectId: "YOUR_STAGING_REF", // ← Replace with staging ref
  publicAnonKey: "YOUR_STAGING_ANON_KEY" // ← Replace with staging key
};
```

3. **Toggle environment:**
```typescript
export const USE_STAGING = true; // ← Set true để dùng staging
```

4. **Update imports in App.tsx:**
```typescript
// Change from:
import { projectId, publicAnonKey } from '/utils/supabase/info';

// To:
import { projectId, publicAnonKey } from '/utils/supabase/config';
```

---

## 📋 QUICK CHECKLIST

**Hoàn thành theo thứ tự:**

```
□ Step 1: Get staging URL và anon key (2 min)
□ Step 2: Configure secrets in Supabase (3 min)
□ Step 3: Link to staging branch (1 min)
□ Step 4: Deploy server function (2 min)
□ Step 5: Test health endpoint (2 min)
□ Step 6: Update config.tsx with staging creds (1 min)
□ Step 7: Test frontend with staging (3 min)

Total time: ~15 minutes
```

---

## 🆘 CẦN GIÚP?

**Nếu gặp lỗi ở bất kỳ bước nào:**

### **Lỗi 1: "Cannot link to project"**
```bash
Error: Failed to link project
```
**Fix:** Check project ref đúng chưa, check password database

---

### **Lỗi 2: "Function deploy failed"**
```bash
Error: Failed to deploy function
```
**Fix:** 
```bash
# Check you're linked to staging
supabase status

# Try deploy again
supabase functions deploy server --no-verify-jwt
```

---

### **Lỗi 3: "Health check returns 404"**
```bash
Error: 404 Not Found
```
**Fix:** Function chưa deploy. Chạy lại:
```bash
supabase functions deploy server --no-verify-jwt
```

---

### **Lỗi 4: "CORS error"**
```bash
CORS policy blocked
```
**Fix:** Secrets chưa set đúng. Check lại secrets trong Supabase Dashboard

---

## ✅ SAU KHI STAGING READY

**Bạn có thể:**

1. ✅ **Start refactoring safely**
   - Edit code
   - Deploy to staging
   - Test thoroughly
   - Deploy to production when ready

2. ✅ **Test new features**
   - Build in staging first
   - No risk to production
   - Users won't see bugs

3. ✅ **Peace of mind**
   - Professional workflow
   - Industry best practice
   - Sleep well 😴

---

## 🎯 NEXT ACTION

**Bạn cần làm GÌ NGAY:**

**Option A: Tôi đã có staging credentials** ✅
- Paste staging URL và key cho tôi
- Tôi sẽ update config.tsx
- Sau đó guide deploy

**Option B: Chưa get credentials**
- Follow BƯỚC 1 ở trên
- Get URL và keys
- Reply lại với credentials

**Option C: Cần help với specific step**
- Tell me which step
- Tôi guide chi tiết

---

## 📊 PROGRESS

**Your current progress:**
```
✅ Created staging branch
⬜ Got staging credentials
⬜ Configured secrets
⬜ Deployed to staging
⬜ Tested staging
⬜ Ready to refactor
```

---

**BẠN ĐANG Ở BƯỚC NÀO? CẦN GIÚP GÌ?**

Reply với:
- **"A"** - Tôi đã có credentials (paste credentials)
- **"B"** - Guide tôi get credentials
- **"C"** - Help với [step number]

**Tôi đang chờ để help bạn complete staging setup!** 🚀
