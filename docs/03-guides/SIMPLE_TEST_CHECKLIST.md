# ✅ SIMPLE TEST CHECKLIST - CHO NGƯỜI KHÔNG TECH

**Dành cho:** Product Owner, QA, hoặc bất kỳ ai muốn verify hệ thống hoạt động  
**Thời gian:** 5 phút  
**Không cần:** Code, terminal, hay technical knowledge

---

## 📋 **BƯỚC 1: MỞ APP**

Mở Bitcoin Nail Bar app trong browser:

- **Development:** http://localhost:5173
- **Production:** https://your-app-url.com

---

## 🔐 **BƯỚC 2: LOGIN VÀO ADMIN**

1. Click button **"Login"** hoặc **"Admin"**
2. Nhập credentials:
   - Username: `admin`
   - Password: [your admin password]
3. Click **"Sign In"**

**✅ Expected:** Redirect vào Admin Dashboard

---

## 🎯 **BƯỚC 3: KIỂM TRA CÁC TRANG**

Đi qua từng trang sau và đánh dấu checklist:

### **3.1. Admin Dashboard** (`/admin`)

- [ ] Trang load thành công (không có spinner xoay mãi)
- [ ] Hiển thị statistics (số customers, bookings, etc.)
- [ ] Không có error messages màu đỏ
- [ ] Dữ liệu hiển thị chính xác

---

### **3.2. Customers Page** (`/admin/customers`)

- [ ] Trang load thành công
- [ ] Danh sách customers hiển thị
- [ ] Có thể search customers
- [ ] Có thể click vào customer để xem chi tiết
- [ ] Có thể tạo customer mới (click "Add Customer")

**Test thêm (optional):**
- [ ] Click "Add Customer" → Form hiển thị
- [ ] Nhập thông tin → Click "Save" → Customer được tạo
- [ ] Edit customer → Save → Thay đổi được lưu

---

### **3.3. Memberships Page** (`/admin/memberships`)

- [ ] Trang load thành công
- [ ] Danh sách memberships hiển thị
- [ ] Hiển thị đúng membership tiers (Gold, Platinum, Diamond)
- [ ] Có thể xem chi tiết membership
- [ ] Có thể assign membership cho customer

**Test thêm (optional):**
- [ ] Click "Assign Membership" → Form hiển thị
- [ ] Select customer + tier → Save → Membership được tạo

---

### **3.4. Settings Page** (`/admin/settings`)

- [ ] Trang load thành công
- [ ] Hiển thị các settings sections
- [ ] Có thể edit settings
- [ ] Click "Save" → Settings được lưu

---

### **3.5. VLinkPay Settings** (`/admin/vlinkpay-settings`)

- [ ] Trang load thành công
- [ ] Hiển thị VLinkPay configuration
- [ ] Có merchant code, encryption key fields
- [ ] Có thể edit và save (nếu có quyền)

---

### **3.6. Gallery Management** (`/admin/gallery`)

- [ ] Trang load thành công
- [ ] Danh sách images hiển thị
- [ ] Có thể upload image mới
- [ ] Có thể delete image
- [ ] Có thể reorder images (drag-drop)

---

### **3.7. Promotions** (`/admin/promotions`)

- [ ] Trang load thành công
- [ ] Danh sách promotions hiển thị
- [ ] Có thể tạo promotion mới
- [ ] Có thể edit/delete promotion

---

### **3.8. Events** (`/admin/events`)

- [ ] Trang load thành công
- [ ] Danh sách events hiển thị
- [ ] Có thể tạo event mới
- [ ] Có thể edit/delete event

---

## 🏠 **BƯỚC 4: KIỂM TRA HOMEPAGE (Public Pages)**

Logout hoặc mở tab incognito, rồi check các trang public:

### **4.1. Homepage** (`/`)

- [ ] Trang load thành công
- [ ] Hero section hiển thị
- [ ] Services section hiển thị
- [ ] Gallery hiển thị (images từ admin gallery)
- [ ] Promotions hiển thị (nếu có)

---

### **4.2. Services Page** (`/services`)

- [ ] Trang load thành công
- [ ] Danh sách services hiển thị
- [ ] Có thể click vào service để xem chi tiết
- [ ] Pricing hiển thị đúng

---

### **4.3. Booking Page** (`/booking`)

- [ ] Trang load thành công
- [ ] Form booking hiển thị
- [ ] Có thể select service
- [ ] Có thể select date/time
- [ ] Có thể submit booking

**Test booking flow (optional):**
- [ ] Fill form → Submit → Success message
- [ ] Check admin → Booking xuất hiện trong danh sách

---

## 🚀 **BƯỚC 5: KIỂM TRA PERFORMANCE**

### **5.1. Load Speed:**

- [ ] Mỗi trang load < 3 giây
- [ ] Không có "hanging" (app bị đơ)
- [ ] Transitions mượt mà

---

### **5.2. Browser Console:**

1. Nhấn F12 để mở DevTools
2. Vào tab **Console**
3. Check:
   - [ ] Không có error messages màu đỏ
   - [ ] Không có warning quá nhiều (1-2 warnings OK)

---

### **5.3. Network:**

1. DevTools → Tab **Network**
2. Reload trang
3. Check:
   - [ ] Các API calls có status 200 (màu xanh)
   - [ ] Không có status 500 (màu đỏ)
   - [ ] Không có failed requests

---

## 📊 **BƯỚC 6: CHECKLIST TỔNG HỢP**

### **BACKEND (Phase 1 Refactor):**

Nếu bạn tech-savvy, test thêm:

- [ ] Health check endpoint works
- [ ] Server logs không có errors
- [ ] Retry logic hoạt động (check trong logs)
- [ ] KV Store operations work (kvAdmin + kvHomepage)

### **FRONTEND:**

- [ ] Tất cả admin pages load OK
- [ ] Tất cả public pages load OK
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] No console errors
- [ ] Performance OK

---

## ❌ **NẾU CÓ VẤN ĐỀ:**

### **Trang không load / Spinner xoay mãi:**

1. Check internet connection
2. Hard reload: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
3. Clear cache and reload
4. Nếu vẫn lỗi → Báo tech team

---

### **Error message hiển thị:**

1. Screenshot error message
2. Check console (F12) → Copy error
3. Báo tech team kèm screenshot + error log

---

### **Data không hiển thị / Hiển thị sai:**

1. Verify đang login đúng account
2. Reload trang
3. Check Network tab (F12) → Có failed requests không?
4. Nếu vẫn sai → Báo tech team

---

### **Không thể tạo/edit/delete:**

1. Verify có quyền admin
2. Check console có error không
3. Try logout + login lại
4. Nếu vẫn không được → Báo tech team

---

## 🎉 **PASS CRITERIA:**

**Phase 1 refactor được xem là thành công nếu:**

✅ Tất cả trang load được (không crash)  
✅ CRUD operations hoạt động bình thường  
✅ Không có error messages trong console  
✅ Performance không giảm (load time < 3s)  
✅ Data hiển thị chính xác  

**Nếu đạt 5/5 criteria trên → Phase 1 PASS! 🎊**

---

## 📝 **BÁO CÁO KẾT QUẢ:**

Format báo cáo đơn giản:

```
PHASE 1 TEST - [Ngày test]

ADMIN PAGES:
- Dashboard: ✅ / ❌
- Customers: ✅ / ❌
- Memberships: ✅ / ❌
- Settings: ✅ / ❌
- VLinkPay: ✅ / ❌
- Gallery: ✅ / ❌
- Promotions: ✅ / ❌
- Events: ✅ / ❌

PUBLIC PAGES:
- Homepage: ✅ / ❌
- Services: ✅ / ❌
- Booking: ✅ / ❌

PERFORMANCE:
- Load speed: ✅ / ❌
- No errors: ✅ / ❌
- CRUD works: ✅ / ❌

ISSUES FOUND:
[Mô tả vấn đề nếu có]
```

---

**Sẵn sàng test?** Làm theo checklist từ trên xuống dưới! 📋✨
