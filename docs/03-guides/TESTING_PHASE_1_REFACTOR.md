# 🧪 HƯỚNG DẪN TEST PHASE 1 REFACTOR

**Mục đích:** Verify rằng shared utilities hoạt động đúng sau khi deploy  
**Thời gian:** ~10 phút  
**Prerequisites:** Deploy đã thành công

---

## 📍 **BƯỚC 1: LẤY PROJECT URL**

Tìm Project URL của bạn tại Supabase Dashboard:

1. Vào https://supabase.com/dashboard/project/{your-project-id}
2. Sidebar → **Settings** → **API**
3. Copy **Project URL** (dạng: `https://xxx.supabase.co`)

**Hoặc** tìm trong code frontend tại `/src/app/App.tsx`:

```typescript
// Tìm dòng này:
const projectId = "..."; // Your project ID
```

Khi đó URL sẽ là: `https://{projectId}.supabase.co`

---

## 🔍 **BƯỚC 2: CHECK DEPLOYMENT STATUS**

### **Option A: Qua Supabase Dashboard**

1. Vào **Edge Functions** trong sidebar
2. Click vào function `make-server-84f9c112`
3. Xem **Logs** tab để check:
   - ✅ "Function deployed successfully"
   - ✅ "✅ Supabase client initialized" (từ shared utilities)
   - ❌ Không có error "Module not found"

### **Option B: Qua Terminal (nếu dùng Supabase CLI)**

```bash
# Check function status
supabase functions list

# View logs
supabase functions logs make-server-84f9c112
```

**Expected:** Không có error messages, chỉ có info logs.

---

## 🧪 **BƯỚC 3: TEST CÁC ENDPOINTS**

Tôi sẽ cung cấp 2 cách test: **Browser** (dễ nhất) và **curl** (nâng cao).

### **3.1. TEST HEALTH CHECK** (Không cần auth)

**Mục đích:** Verify server đang chạy

#### **Browser:**
Mở link sau (thay `{PROJECT_ID}` bằng project ID của bạn):

```
https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "version": "v7-staff-management",
  "timestamp": "2026-01-24T..."
}
```

#### **curl:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/health
```

---

### **3.2. TEST DEBUG USERS** (Cần auth, test KV Store)

**Mục đích:** Verify `kvAdmin` đang hoạt động đúng

#### **Lấy ANON_KEY:**

1. Supabase Dashboard → **Settings** → **API**
2. Copy **anon** / **public** key (dạng: `eyJ...`)

**Hoặc** tìm trong frontend code:

```typescript
// File: /src/app/App.tsx
const publicAnonKey = "..."; // Copy key này
```

#### **Browser (dùng DevTools):**

1. Mở Chrome DevTools (F12)
2. Vào tab **Console**
3. Paste đoạn code sau (thay `{PROJECT_ID}` và `{ANON_KEY}`):

```javascript
fetch('https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/debug/users', {
  headers: {
    'Authorization': 'Bearer {ANON_KEY}'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Response:', data))
.catch(err => console.error('❌ Error:', err));
```

#### **curl:**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/debug/users
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "...",
      "username": "admin",
      "role": "admin",
      ...
    }
  ]
}
```

**✅ Test Pass Nếu:**
- Status code: 200
- Response có danh sách users
- Không có error trong logs

---

### **3.3. TEST VLINKPAY SETTINGS** (Test retry logic + KV)

**Mục đích:** Verify retry logic và KV Store

#### **Browser (DevTools Console):**

```javascript
fetch('https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/vlinkpay-settings', {
  headers: {
    'Authorization': 'Bearer {ANON_KEY}'
  }
})
.then(r => r.json())
.then(data => console.log('✅ VLinkPay Settings:', data))
.catch(err => console.error('❌ Error:', err));
```

#### **curl:**
```bash
curl -H "Authorization: Bearer {ANON_KEY}" \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/vlinkpay-settings
```

**Expected Response:**
```json
{
  "encryption_key": "...",
  "merchant_code": "...",
  "api_endpoint": "..."
}
```

**✅ Test Pass Nếu:**
- Response chứa VLinkPay config
- Nếu có connection error, sẽ retry 3 lần (check logs)

---

### **3.4. TEST GALLERY** (Test kvHomepage)

**Mục đích:** Verify `kvHomepage` hoạt động riêng biệt với `kvAdmin`

#### **Browser:**

```
https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/gallery
```

**Hoặc DevTools Console:**

```javascript
fetch('https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/gallery')
.then(r => r.json())
.then(data => console.log('✅ Gallery:', data))
.catch(err => console.error('❌ Error:', err));
```

#### **curl:**
```bash
curl https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/gallery
```

**Expected Response:**
```json
{
  "success": true,
  "images": [
    {
      "id": "...",
      "cloudinary_url": "...",
      "title": "..."
    }
  ]
}
```

**✅ Test Pass Nếu:**
- Response có array of images
- Data đến từ `kv_store_84f9c112` (homepage table)

---

### **3.5. TEST PROMOTIONS** (Test kvHomepage)

#### **Browser:**

```
https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/promotions
```

**Expected Response:**
```json
{
  "success": true,
  "promotions": [...]
}
```

---

### **3.6. TEST CUSTOMERS** (Test Postgres + new kv)

**Mục đích:** Verify Postgres integration vẫn hoạt động

#### **Browser (DevTools Console):**

```javascript
fetch('https://{PROJECT_ID}.supabase.co/functions/v1/make-server-84f9c112/customers', {
  headers: {
    'Authorization': 'Bearer {ANON_KEY}'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Customers:', data))
.catch(err => console.error('❌ Error:', err));
```

**Expected Response:**
```json
{
  "success": true,
  "customers": [
    {
      "id": "...",
      "name": "...",
      "phone": "...",
      "email": "..."
    }
  ]
}
```

---

## 📊 **BƯỚC 4: KIỂM TRA SERVER LOGS**

### **Qua Supabase Dashboard:**

1. Vào **Edge Functions** → `make-server-84f9c112`
2. Click **Logs** tab
3. Tìm các messages sau:

#### **✅ GOOD LOGS (Expected):**

```
✅ Supabase client initialized
[KV GET] Fetching key: "users"
[KV GETBYPREFIX] Fetching keys with prefix: "user:"
✅ [CLOUDINARY UPLOAD] Success: https://...
```

#### **❌ BAD LOGS (Errors):**

```
❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
❌ [RETRY] All retries exhausted
❌ [KV GET] Error: ...
Module not found "..."
```

### **Qua CLI (nếu có):**

```bash
# Real-time logs
supabase functions logs make-server-84f9c112 --follow

# Filter errors only
supabase functions logs make-server-84f9c112 | grep "❌"
```

---

## 🎯 **BƯỚC 5: TEST TRONG APP (Frontend)**

Nếu tất cả backend tests pass, test luôn trong app:

### **5.1. Test Admin Dashboard:**

1. Vào app: `http://localhost:5173` (hoặc URL production)
2. Login với admin account
3. Vào các trang sau và verify không có errors:

   - ✅ **Admin Dashboard** (`/admin`)
   - ✅ **Customers List** (`/admin/customers`)
   - ✅ **Memberships** (`/admin/memberships`)
   - ✅ **Settings** (`/admin/settings`)
   - ✅ **VLinkPay Settings** (`/admin/vlinkpay-settings`)

### **5.2. Check Browser Console:**

1. Mở DevTools (F12)
2. Vào **Console** tab
3. Verify:
   - ✅ Không có errors màu đỏ
   - ✅ API calls thành công (status 200)
   - ✅ Data load được

### **5.3. Check Network Tab:**

1. DevTools → **Network** tab
2. Filter: XHR/Fetch
3. Click vào các requests tới `/functions/v1/make-server-84f9c112/...`
4. Verify:
   - ✅ Status: 200 OK
   - ✅ Response có data
   - ✅ Response time < 2s

---

## ✅ **CHECKLIST TỔNG HỢP**

Copy checklist này và đánh dấu khi test:

```
BACKEND TESTS:
[ ] Health check returns 200 OK
[ ] Debug users returns user list
[ ] VLinkPay settings returns config
[ ] Gallery returns images from kv_store_84f9c112
[ ] Promotions returns promotions
[ ] Customers returns customer list from Postgres

SERVER LOGS:
[ ] "✅ Supabase client initialized" xuất hiện
[ ] Không có "Module not found" errors
[ ] Không có "connection reset" errors (hoặc retry thành công)

FRONTEND TESTS:
[ ] Admin dashboard loads without errors
[ ] Customers page loads
[ ] Memberships page loads
[ ] Settings page loads
[ ] VLinkPay settings page loads
[ ] Browser console không có errors màu đỏ
[ ] API calls status 200 trong Network tab
```

---

## 🐛 **NẾU CÓ LỖI:**

### **Lỗi: "Module not found"**

**Nguyên nhân:** Imports không đúng  
**Fix:** Verify rằng tất cả imports trong `index.tsx` dùng `_shared_` prefix:

```typescript
import { JWT_SECRET } from './_shared_constants.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { retry } from './_shared_retry.tsx';
import { kvAdmin as kv } from './_shared_kv.tsx';
```

### **Lỗi: "Unauthorized" (401)**

**Nguyên nhân:** Thiếu hoặc sai ANON_KEY  
**Fix:** Re-copy ANON_KEY từ Supabase Dashboard → Settings → API

### **Lỗi: "KV GET/SET failed"**

**Nguyên nhân:** Supabase client chưa init hoặc table không tồn tại  
**Fix:**
1. Check logs có "✅ Supabase client initialized"?
2. Verify table `kv_store_89edbd69` và `kv_store_84f9c112` tồn tại trong Database

### **Lỗi: Connection timeout**

**Nguyên nhân:** Retry logic đang chạy  
**Expected:** Sau 3 retries (~1.4s) sẽ thành công hoặc fail  
**Check logs:** Tìm "⚠️ [RETRY] Request failed, retrying..."

---

## 📝 **BÁO CÁO KẾT QUẢ**

Sau khi test xong, báo cáo theo format sau:

```
✅ PHASE 1 TEST RESULTS:

BACKEND:
- Health check: ✅ / ❌
- Debug users: ✅ / ❌
- VLinkPay settings: ✅ / ❌
- Gallery: ✅ / ❌
- Promotions: ✅ / ❌
- Customers: ✅ / ❌

LOGS:
- Supabase client initialized: ✅ / ❌
- No module errors: ✅ / ❌
- No connection errors: ✅ / ❌

FRONTEND:
- Admin dashboard: ✅ / ❌
- All pages load: ✅ / ❌
- No console errors: ✅ / ❌

ERRORS (if any):
[Paste error messages here]
```

---

**Ready?** Bắt đầu từ BƯỚC 1 và làm theo từng bước! 🚀
