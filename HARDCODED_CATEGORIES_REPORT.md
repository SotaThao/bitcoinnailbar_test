# 🔍 Báo Cáo: Hardcoded Categories

## ⚠️ VẤN ĐỀ: Backend báo "không có dữ liệu" nhưng UI vẫn hiển thị 4 categories

---

## 📋 **4 Categories Đang Được Hardcode:**

1. **Acrylic Nail Services** (ID: 1, key: `acrylic`)
2. **Dipping Powder** (ID: 2, key: `dipping`)
3. **Gel Shellac Service** (ID: 3, key: `gel`)
4. **Waxing Services** (ID: 4, key: `waxing`)

---

## 🗂️ **Nơi Hardcode:**

### **1. Frontend Constants - `/src/app/lib/service-constants.ts`**

```typescript
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 1, name: 'Acrylic Nail Services', key: 'acrylic', icon: PenTool },
  { id: 2, name: 'Dipping Powder', key: 'dipping', icon: Droplets },
  { id: 3, name: 'Gel Shellac Service', key: 'gel', icon: Sparkles },
  { id: 4, name: 'Waxing Services', key: 'waxing', icon: Scissors },
  { id: 5, name: 'Pedicure', key: 'pedicure', icon: Footprints },
  { id: 6, name: 'Manicure', key: 'manicure', icon: Hand },
  { id: 7, name: 'Kids Services', key: 'kids', icon: Baby },
  { id: 8, name: 'Additional Services', key: 'additional', icon: PlusCircle },
];
```

**→ Tổng cộng 8 categories hardcoded!**

---

### **2. Cách Hiển Thị Trong UI - `/src/app/components/admin/Services.tsx`**

```typescript
// Line 48-54: Merge static + dynamic categories
const allCategories = [
  ...SERVICE_CATEGORIES,  // 🔥 8 categories hardcoded từ service-constants.ts
  ...categories.map(cat => ({  // Categories từ Backend API
    ...cat,
    icon: cat.icon || PlusCircle,
  }))
];
```

**Logic:**
1. Frontend load `SERVICE_CATEGORIES` (8 categories hardcoded)
2. Frontend gọi API `/settings/categories` để lấy custom categories
3. Merge 2 danh sách lại → Hiển thị tất cả

**Kết quả:**
- Backend trả về `[]` (empty array)
- UI vẫn hiển thị 8 categories từ `SERVICE_CATEGORIES`

---

## 🎯 **Tại Sao Backend Báo "Không Có Dữ Liệu"?**

### **Backend Check:**

```typescript
// /supabase/functions/server/index.tsx - Line 1990-2001
app.get("/make-server-84f9c112/settings/categories", async (c) => {
  try {
    const categories = await kv.get("settings:categories");
    console.log(`📋 [GET CATEGORIES] Found ${categories?.length || 0} categories`);
    
    if (categories && categories.length > 0) {
      return c.json({ success: true, data: categories });
    }
    
    // 🔥 Backend trả về empty array nếu chưa có data
    return c.json({ success: true, data: [] });
  }
});
```

**Kết luận:**
- KV Store chưa có dữ liệu trong `settings:categories`
- Backend trả về `{ success: true, data: [] }`
- Frontend merge với hardcoded categories → UI vẫn thấy 8 categories

---

## 📁 **Các File Liên Quan:**

### **Hardcoded Categories:**
1. `/src/app/lib/service-constants.ts` - Định nghĩa 8 categories tĩnh
2. `/src/app/components/admin/Services.tsx` - Line 48-54 (Merge logic)
3. `/src/app/components/admin/ServiceCategorySidebar.tsx` - Hiển thị sidebar

### **Backend Storage:**
4. `/supabase/functions/server/index.tsx` - Line 1990-2020 (API endpoints)
5. Supabase KV Store - Key: `settings:categories` (EMPTY)

### **Hardcoded Services (Demo Data):**
6. `/src/app/components/pages/BookingPage.tsx` - Line 64-77 (12 Acrylic services hardcoded)

---

## 🔧 **Giải Pháp:**

### **Option 1: Migrate Hardcoded Categories → Backend**

Tạo script để copy 8 categories từ `SERVICE_CATEGORIES` vào KV Store:

```typescript
// Thêm vào /src/app/utils/migrateCategories.ts
async function migrateCategoriesToBackend() {
  const response = await fetch(`${API_BASE}/settings/categories`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(SERVICE_CATEGORIES)
  });
  
  console.log('✅ Migrated 8 categories to backend');
}

// Expose to console
window.migrateCategories = migrateCategoriesToBackend;
```

**Chạy trong Console:**
```javascript
migrateCategories()
```

---

### **Option 2: Xóa 4 Categories Không Cần**

Nếu chỉ muốn giữ lại 4 categories (Pedicure, Manicure, Kids, Additional):

**Bước 1:** Chỉnh sửa `/src/app/lib/service-constants.ts`

```typescript
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 5, name: 'Pedicure', key: 'pedicure', icon: Footprints },
  { id: 6, name: 'Manicure', key: 'manicure', icon: Hand },
  { id: 7, name: 'Kids Services', key: 'kids', icon: Baby },
  { id: 8, name: 'Additional Services', key: 'additional', icon: PlusCircle },
];
```

**Bước 2:** Backend sẽ tự động không thấy 4 categories cũ

---

### **Option 3: Chuyển Sang 100% Backend-Driven**

Xóa toàn bộ hardcoded categories, chỉ dùng API:

**File:** `/src/app/components/admin/Services.tsx`

```typescript
// ❌ Xóa merge logic cũ
const allCategories = [
  ...SERVICE_CATEGORIES,  // Xóa dòng này
  ...categories  // Chỉ dùng categories từ API
];

// ✅ Chỉ dùng categories từ backend
const allCategories = categories;
```

**File:** `/src/app/lib/service-constants.ts`

```typescript
// ❌ Xóa hoặc comment toàn bộ SERVICE_CATEGORIES
// export const SERVICE_CATEGORIES: ServiceCategory[] = [ ... ];

// ✅ Export empty array
export const SERVICE_CATEGORIES: ServiceCategory[] = [];
```

**Sau đó chạy migration để thêm vào backend:**
```javascript
migrateCategories()
```

---

## 🚨 **Lưu Ý Quan Trọng:**

### **1. Default Category trong Forms**

Nhiều nơi sử dụng fallback:

```typescript
// /src/app/components/admin/molecules/ServiceFormSheet.tsx - Line 96
const defaultCategory = editingService.category 
  || SERVICE_CATEGORIES[0]?.name  // 🔥 Fallback to hardcoded
  || 'Acrylic Nail Services';  // 🔥 Hardcoded string
```

**Cần sửa thành:**
```typescript
const defaultCategory = editingService.category 
  || allCategories[0]?.name  // ✅ Dùng categories từ state
  || '';  // ✅ Empty string nếu không có
```

---

### **2. Initial Active Tab**

```typescript
// /src/app/components/admin/Services.tsx - Line 27
const [activeTab, setActiveTab] = useState('Acrylic Nail Services');
```

**Cần sửa thành:**
```typescript
const [activeTab, setActiveTab] = useState(
  allCategories[0]?.name || ''
);
```

---

### **3. Hardcoded Services trong BookingPage**

File `/src/app/components/pages/BookingPage.tsx` có 12 services hardcoded:

```typescript
const [services, setServices] = useState<any[]>([
  { id: '1', name: 'Acrylic with polish', category: 'Acrylic Nail Services', ... },
  { id: '2', name: 'White or pear tip', category: 'Acrylic Nail Services', ... },
  // ... 10 more services
]);
```

**Giải pháp:** Fetch từ API `/settings/service-menu`

---

## 🎯 **Khuyến Nghị:**

### **Nên Làm:**

1. ✅ **Migrate 8 categories vào Backend** (Option 1)
   - Giữ được hiện trạng UI
   - Có thể quản lý từ Admin Panel
   - Dễ expand sau này

2. ✅ **Tạo utility function để inspect**
   ```javascript
   inspectAll()  // Xem categories + services hiện tại
   ```

3. ✅ **Thêm seed data endpoint**
   ```
   POST /settings/categories/seed
   ```

### **Không Nên:**

❌ Xóa trực tiếp `SERVICE_CATEGORIES` trước khi migrate
❌ Hard-delete 4 categories mà không backup
❌ Để 2 nguồn dữ liệu (hardcode + backend) hoạt động song song lâu dài

---

## 🛠️ **Action Items:**

- [ ] Tạo migration script
- [ ] Chạy `migrateCategories()` trong console
- [ ] Verify backend có 8 categories
- [ ] Xóa hardcoded constants (optional)
- [ ] Update all fallback references
- [ ] Test delete categories từ UI
- [ ] Document trong README

---

**Last Updated:** January 16, 2026  
**Status:** Đã xác định root cause - Đang chờ quyết định migration strategy
