# 🚀 Category Migration Guide

## 📌 Quick Summary

**Vấn đề:** 4 categories (Acrylic Nail Services, Dipping Powder, Gel Shellac Service, Waxing Services) đang được **hardcoded** trong frontend, chưa có trong backend KV Store.

**Giải pháp:** Migrate 8 categories từ frontend → backend để có thể quản lý từ Admin Panel.

---

## 🎯 Migration Commands

Mở **Browser Console** (F12) và chạy các lệnh sau:

### **1. Kiểm Tra Dữ Liệu Hiện Tại**

```javascript
// Xem tất cả categories & services
inspectAll()

// Hoặc xem riêng lẻ
inspectCategories()  // Xem categories trong backend
inspectServices()    // Xem services trong backend
```

**Expected Output:**
```
📋 [DEBUG] Total Categories: 0
🛠️ [DEBUG] Total Service Categories: 0
```

---

### **2. Migration (With Confirmation)**

```javascript
// Migrate 8 categories với confirm dialog
migrateCategoriesWithConfirm()
```

**Steps:**
1. Popup sẽ hỏi: "Migrate 8 categories to backend?"
2. Click **OK** để tiếp tục
3. Console sẽ hiển thị:
   ```
   ✅ [MIGRATION] Successfully migrated categories!
   📊 [MIGRATION] Total: 8 categories
   ✅ [VERIFY] Found 8 categories in backend
   ```

---

### **3. Verify Migration**

```javascript
// Kiểm tra lại
verifyMigration()
```

**Expected Output:**
```
✅ [VERIFY] Found 8 categories in backend

┌─────────┬────┬───────────────────────────┬────────────────┬─────────┐
│ (index) │ id │           name            │      key       │ enabled │
├─────────┼────┼───────────────────────────┼────────────────┼─────────┤
│    0    │  1 │ 'Acrylic Nail Services'   │   'acrylic'    │  true   │
│    1    │  2 │ 'Dipping Powder'          │   'dipping'    │  true   │
│    2    │  3 │ 'Gel Shellac Service'     │     'gel'      │  true   │
│    3    │  4 │ 'Waxing Services'         │   'waxing'     │  true   │
│    4    │  5 │ 'Pedicure'                │  'pedicure'    │  true   │
│    5    │  6 │ 'Manicure'                │  'manicure'    │  true   │
│    6    │  7 │ 'Kids Services'           │    'kids'      │  true   │
│    7    │  8 │ 'Additional Services'     │ 'additional'   │  true   │
└─────────┴────┴───────────────────────────┴────────────────┴─────────┘
```

---

### **4. Xóa 4 Categories Không Cần (Optional)**

Nếu muốn xóa 4 categories cũ sau khi migrate:

```javascript
deleteSpecificCategories()
```

Sẽ xóa:
- Acrylic Nail Services
- Dipping Powder
- Gel Shellac Service
- Waxing Services

---

## 🔍 Debug Commands Khác

```javascript
// Xem tất cả staff
window.fetch('https://'+projectId+'.supabase.co/functions/v1/make-server-84f9c112/staff', {
  headers: {'Authorization': 'Bearer '+publicAnonKey}
}).then(r=>r.json()).then(console.table)

// Xem tất cả branches
window.fetch('https://'+projectId+'.supabase.co/functions/v1/make-server-84f9c112/branches', {
  headers: {'Authorization': 'Bearer '+publicAnonKey}
}).then(r=>r.json()).then(console.table)
```

---

## 📂 Files Modified

### **Created Files:**
- `/HARDCODED_CATEGORIES_REPORT.md` - Chi tiết báo cáo
- `/STORAGE_INFO.md` - Thông tin storage
- `/CATEGORY_MIGRATION_GUIDE.md` - Hướng dẫn migration (file này)
- `/src/app/utils/migrateCategories.ts` - Migration utility
- `/src/app/utils/debugStorage.ts` - Debug utilities

### **Updated Files:**
- `/src/app/App.tsx` - Import migration utilities

---

## ⚠️ Important Notes

### **Trước Khi Migrate:**

1. ✅ Backup dữ liệu hiện tại (nếu có):
   ```javascript
   inspectAll()
   ```

2. ✅ Đảm bảo backend endpoint hoạt động:
   ```javascript
   fetch('https://'+projectId+'.supabase.co/functions/v1/make-server-84f9c112/settings/categories', {
     headers: {'Authorization': 'Bearer '+publicAnonKey}
   }).then(r=>r.json()).then(console.log)
   ```

### **Sau Khi Migrate:**

1. ✅ Refresh Admin Services page: `/admin/services`
2. ✅ Kiểm tra sidebar categories
3. ✅ Test CRUD operations:
   - Tạo category mới
   - Edit category
   - Delete category

---

## 🎨 UI Changes After Migration

### **Before Migration:**
```
Categories (Hardcoded)
├─ Acrylic Nail Services  [Cannot delete]
├─ Dipping Powder         [Cannot delete]
├─ Gel Shellac Service    [Cannot delete]
├─ Waxing Services        [Cannot delete]
├─ Pedicure              [Cannot delete]
├─ Manicure              [Cannot delete]
├─ Kids Services         [Cannot delete]
└─ Additional Services   [Cannot delete]
```

### **After Migration:**
```
Categories (Backend-Driven)
├─ Acrylic Nail Services  [✅ Can Edit/Delete]
├─ Dipping Powder         [✅ Can Edit/Delete]
├─ Gel Shellac Service    [✅ Can Edit/Delete]
├─ Waxing Services        [✅ Can Edit/Delete]
├─ Pedicure              [✅ Can Edit/Delete]
├─ Manicure              [✅ Can Edit/Delete]
├─ Kids Services         [✅ Can Edit/Delete]
└─ Additional Services   [✅ Can Edit/Delete]
```

---

## 🚨 Rollback Plan

Nếu migration gặp lỗi, chạy:

```javascript
// Xóa tất cả categories trong backend
fetch('https://'+projectId+'.supabase.co/functions/v1/make-server-84f9c112/settings/categories', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer '+publicAnonKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([])
}).then(r=>r.json()).then(console.log)
```

UI sẽ tự động fallback về hardcoded categories.

---

## 🎯 Next Steps (Optional)

### **Step 1: Remove Hardcoded Constants**

Edit `/src/app/lib/service-constants.ts`:

```typescript
// ❌ Delete or comment out
// export const SERVICE_CATEGORIES: ServiceCategory[] = [ ... ];

// ✅ Replace with empty array
export const SERVICE_CATEGORIES: ServiceCategory[] = [];
```

### **Step 2: Update Services.tsx**

Edit `/src/app/components/admin/Services.tsx`:

```typescript
// ❌ Remove merge logic
const allCategories = [
  ...SERVICE_CATEGORIES,  // Delete this line
  ...categories
];

// ✅ Use only backend categories
const allCategories = categories;
```

### **Step 3: Update Fallback References**

Search for all occurrences of:
- `SERVICE_CATEGORIES[0]?.name`
- `'Acrylic Nail Services'`

Replace with:
- `allCategories[0]?.name || ''`

---

## 📞 Support

Nếu gặp vấn đề:

1. Check Console logs
2. Verify backend endpoint: `/admin/debug-data`
3. Run `inspectAll()` để xem dữ liệu hiện tại
4. Check `/STORAGE_INFO.md` để hiểu cấu trúc dữ liệu

---

**Created:** January 16, 2026  
**Status:** Ready for migration ✅
