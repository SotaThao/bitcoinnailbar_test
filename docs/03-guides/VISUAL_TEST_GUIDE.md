# 📸 VISUAL TEST GUIDE - PHASE 1 (WITH SCREENSHOTS)

**Dành cho:** Người học bằng hình ảnh  
**Cấp độ:** Beginner-friendly  

---

## 🔍 **PHẦN 1: TÌM THÔNG TIN CẦN THIẾT**

### **Step 1.1: Lấy PROJECT_ID**

1. Vào https://supabase.com/dashboard
2. Chọn project của bạn
3. Sidebar → **Settings** (⚙️ icon)
4. Click **API**
5. Tìm section **Project URL**

**Sẽ trông như thế này:**
```
Project URL: https://abc123xyz.supabase.co
              ↑
              PROJECT_ID = "abc123xyz"
```

**Hoặc** tìm trong code:
```
📁 /src/app/App.tsx
→ Tìm dòng: const projectId = "abc123xyz";
```

---

### **Step 1.2: Lấy ANON_KEY**

**Cùng trang với Project URL:**

1. Scroll xuống section **Project API keys**
2. Tìm key có label **anon** hoặc **public**
3. Click icon 📋 để copy

**Key sẽ dài như thế này:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
(~400 characters)
```

**Hoặc** tìm trong code:
```
📁 /src/app/App.tsx
→ Tìm dòng: const publicAnonKey = "eyJ...";
```

---

## 🧪 **PHẦN 2: TEST BẰNG BROWSER (DỄ NHẤT)**

### **Method A: Test Health Check (Không cần key)**

**Đơn giản nhất - chỉ cần browser!**

1. Mở Chrome/Firefox/Safari
2. Paste URL này vào address bar:

```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/health
```

**VD thực tế:**
```
https://abc123xyz.supabase.co/functions/v1/make-server-84f9c112/health
```

3. Nhấn Enter

**✅ Nếu thành công, bạn sẽ thấy:**
```json
{
  "status": "ok",
  "version": "v7-staff-management",
  "timestamp": "2026-01-24T10:30:00.000Z"
}
```

**❌ Nếu lỗi, bạn sẽ thấy:**
- Page not found (404) → Function chưa deploy
- Internal server error (500) → Có bug trong code
- Connection timeout → Server đang restart

---

### **Method B: Test với DevTools Console (Cần ANON_KEY)**

**Cho người muốn test nhiều endpoints:**

1. **Mở app của bạn:**
   - Dev: http://localhost:5173
   - Production: https://your-app-url.com

2. **Mở DevTools:**
   - Windows: Nhấn `F12`
   - Mac: Nhấn `Cmd + Option + I`
   - Hoặc: Right-click → "Inspect" → Tab "Console"

3. **Copy script từ `/docs/03-guides/QUICK_TEST_SCRIPT.md`**

4. **Thay PROJECT_ID và ANON_KEY** (2 dòng đầu)

5. **Paste vào Console và nhấn Enter**

**Bạn sẽ thấy kết quả như thế này:**

```
🚀 PHASE 1 REFACTOR TEST SUITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Project: abc123xyz
🔑 ANON_KEY: eyJhbGciOiJIUzI1NiIs...
🌐 Base URL: https://abc123xyz.supabase.co/functions/v1/make-server-84f9c112
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ 1. Health Check
  Test server status
  ✅ PASS (142ms)
  Status: 200
  Response: {status: "ok", version: "v7-staff-management", ...}

▶ 2. Debug Users
  Test kvAdmin + retry logic
  ✅ PASS (256ms)
  Status: 200
  Response: {users: Array(3)}

▶ 3. VLinkPay Settings
  Test kvAdmin read
  ✅ PASS (198ms)
  Status: 200
  Response: {encryption_key: "...", merchant_code: "..."}

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests:  6
✅ Passed:    6
❌ Failed:    0
Success Rate: 100.0%

🎉 ALL TESTS PASSED! Phase 1 refactor successful!
✅ Ready for Phase 2!
```

---

## 📊 **PHẦN 3: KIỂM TRA SERVER LOGS**

### **Step 3.1: Vào Supabase Dashboard**

1. Vào https://supabase.com/dashboard
2. Chọn project
3. Sidebar → **Edge Functions** (⚡ icon)
4. Click vào function **make-server-84f9c112**

---

### **Step 3.2: Xem Logs**

1. Click tab **Logs** (bên cạnh tab "Details")
2. Xem real-time logs

**✅ Logs tốt (cần tìm):**
```
✅ Supabase client initialized
[INFO] Health check successful
[KV GET] Fetching key: "users"
✅ [CLOUDINARY UPLOAD] Success
```

**❌ Logs xấu (cần fix):**
```
❌ Missing SUPABASE_URL
❌ [RETRY] All retries exhausted
❌ Module not found
❌ [KV GET] Error: ...
```

**💡 Tips:**
- Logs mới nhất ở trên cùng
- Filter bằng keyword: `❌`, `ERROR`, `FAIL`
- Real-time: Logs update khi bạn call endpoints

---

## 🖥️ **PHẦN 4: KIỂM TRA NETWORK TAB**

**Mục đích:** Xem API requests và responses

### **Step 4.1: Mở Network Tab**

1. Vào app (localhost hoặc production)
2. Mở DevTools (F12)
3. Click tab **Network** (nằm cạnh Console)

---

### **Step 4.2: Filter API Calls**

1. Trong Network tab, click filter **XHR** hoặc **Fetch**
2. Reload trang (Ctrl+R hoặc F5)

**Bạn sẽ thấy danh sách requests:**

```
Name                          Status  Type    Size    Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
health                        200     xhr     245B    142ms  ✅
debug/users                   200     xhr     1.2KB   256ms  ✅
vlinkpay-settings             200     xhr     456B    198ms  ✅
gallery                       200     xhr     3.4KB   312ms  ✅
customers                     200     xhr     5.6KB   445ms  ✅
```

---

### **Step 4.3: Inspect Request Details**

1. Click vào request (VD: "health")
2. Xem tabs:

**Tab Headers:**
- Request URL: `https://...supabase.co/functions/v1/...`
- Request Method: `GET`
- Status Code: `200 OK` ✅

**Tab Response:**
- Xem JSON response
- Verify data đúng

**Tab Timing:**
- Total time < 500ms → Good ✅
- Total time > 2s → Slow ⚠️

---

## 🎨 **PHẦN 5: TEST UI (FRONTEND)**

### **Step 5.1: Login vào Admin**

1. Vào app: http://localhost:5173
2. Click **"Admin"** hoặc **"Login"**
3. Nhập credentials
4. Click **"Sign In"**

**✅ Success indicators:**
- Redirect vào `/admin` dashboard
- Hiển thị stats cards (customers, bookings, ...)
- Menu sidebar có các options
- Profile icon hiển thị tên user

---

### **Step 5.2: Test Customers Page**

1. Sidebar → Click **"Customers"**
2. Đợi trang load

**✅ Cần thấy:**
- Danh sách customers trong table
- Search bar hoạt động
- Pagination (nếu có nhiều customers)
- Button "Add Customer"

**Test CRUD:**
1. Click **"Add Customer"**
2. Modal/form xuất hiện
3. Fill thông tin → Click "Save"
4. Customer mới xuất hiện trong list ✅

---

### **Step 5.3: Test Memberships Page**

1. Sidebar → Click **"Memberships"**
2. Đợi trang load

**✅ Cần thấy:**
- Danh sách memberships
- Filter by tier (Gold/Platinum/Diamond)
- Có thể assign membership

---

### **Step 5.4: Test Settings Pages**

**VLinkPay Settings:**
1. Sidebar → **"Settings"** → **"VLinkPay"**
2. Verify form hiển thị
3. Có fields: Merchant Code, Encryption Key, API Endpoint
4. Có thể edit và save

**Gallery Management:**
1. Sidebar → **"Gallery"**
2. Verify images hiển thị
3. Có thể upload image mới
4. Có thể delete/reorder images

---

## 🏠 **PHẦN 6: TEST PUBLIC PAGES**

### **Step 6.1: Homepage**

1. Logout hoặc mở incognito tab
2. Vào: http://localhost:5173
3. Verify:
   - Hero section load
   - Services grid hiển thị
   - Gallery carousel hoạt động
   - Footer links work

---

### **Step 6.2: Services Page**

1. Click **"Services"** trong menu
2. Verify:
   - Danh sách services load
   - Service cards có images
   - Pricing hiển thị
   - Click vào service → Xem chi tiết

---

### **Step 6.3: Booking Page**

1. Click **"Book Now"**
2. Verify:
   - Form booking hiển thị
   - Có thể chọn service
   - Calendar/time picker hoạt động
3. Test submit (optional):
   - Fill form
   - Click "Submit"
   - Success message xuất hiện

---

## 🎯 **CHECKLIST TRỰC QUAN**

### **Backend Tests:**
```
[ ] Health check returns 200 OK
[ ] Server logs có "✅ Supabase client initialized"
[ ] Không có error logs màu đỏ
[ ] All 6 endpoints pass trong test script
```

### **Frontend Tests:**
```
[ ] Login thành công
[ ] Admin dashboard load
[ ] Customers page load + CRUD works
[ ] Memberships page load
[ ] Settings pages load
[ ] Gallery management works
[ ] Homepage load (public)
[ ] Services page load (public)
[ ] Booking page load (public)
```

### **Performance:**
```
[ ] Mỗi trang load < 3s
[ ] API requests < 500ms
[ ] Không có "hanging" (app đơ)
[ ] Browser console không có errors
```

---

## 📸 **SCREENSHOT CHECKLIST**

**Nếu cần report issues, chụp screenshots của:**

1. **Error messages** (nếu có)
2. **Console errors** (DevTools → Console)
3. **Failed requests** (DevTools → Network)
4. **Server logs** (Supabase Dashboard → Logs)
5. **Test script results** (nếu chạy script)

---

## ✅ **PASS CRITERIA (Tổng kết)**

**Phase 1 thành công khi:**

✅ Health check trả về 200 OK  
✅ Test script: 6/6 tests pass  
✅ Server logs không có errors  
✅ Tất cả admin pages load được  
✅ CRUD operations hoạt động  
✅ Public pages load được  
✅ Performance OK (< 3s load time)  

**Nếu đạt 7/7 → Phase 1 PASS! 🎊**

---

**Questions?** Check `/docs/03-guides/TESTING_PHASE_1_REFACTOR.md` cho detailed instructions! 📚
