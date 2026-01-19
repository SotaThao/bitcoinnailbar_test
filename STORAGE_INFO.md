# 📦 Bitcoin Nail Bar - Data Storage Information

## Nơi Lưu Trữ Categories và Services

### 🗄️ **Backend Storage: Supabase KV Store**

Tất cả dữ liệu được lưu trong **Key-Value Store** của Supabase:

---

## 📋 **1. CATEGORIES**

**KV Key:** `settings:categories`

**Cấu trúc dữ liệu:**
```typescript
[
  {
    id: number,           // Auto-increment ID (1, 2, 3...)
    name: string,         // Category name (e.g., "Manicure")
    enabled: boolean,     // Category hiển thị hay không
    description?: string
  }
]
```

**Endpoints quản lý:**
- `GET /settings/categories` - Lấy tất cả categories
- `PUT /settings/categories` - Cập nhật toàn bộ danh sách
- `POST /settings/categories` - Thêm category mới
- `DELETE /settings/categories/:id` - Xóa category (CASCADE DELETE)
- `POST /settings/categories/delete-batch` - Xóa nhiều categories theo tên

---

## 🛠️ **2. SERVICES**

**KV Key:** `settings:service-menu`

**Cấu trúc dữ liệu:**
```typescript
{
  "Category Name": {
    groups: [
      {
        id: string,        // Group ID (e.g., "manicure-gel-x")
        name: string,      // Group name (e.g., "Gel-X")
        services: [
          {
            id: string,               // Service ID (unique)
            name: string,             // Service name
            price: string,            // "5-10" | "10+" | "5" | ""
            memberPrice?: string,     // Optional member price
            duration?: string,        // "30 min"
            type: 'regular' | 'addon',
            addons?: string[],        // Array of addon service IDs
            description?: string
          }
        ]
      }
    ]
  }
}
```

**Ví dụ thực tế:**
```json
{
  "Manicure": {
    "groups": [
      {
        "id": "manicure-gel-x",
        "name": "Gel-X",
        "services": [
          {
            "id": "gelx-full-set",
            "name": "Full Set",
            "price": "65",
            "memberPrice": "60",
            "type": "regular",
            "addons": ["addon-french-tips", "addon-chrome"]
          },
          {
            "id": "addon-french-tips",
            "name": "French Tips",
            "price": "5",
            "type": "addon"
          }
        ]
      }
    ]
  }
}
```

**Endpoints quản lý:**
- `GET /settings/service-menu` - Lấy toàn bộ service menu
- `PUT /settings/service-menu` - Cập nhật service menu
- `POST /settings/service-menu/reset` - Reset về default services

---

## 🔄 **Mối Quan Hệ Categories ↔ Services**

### **Hierarchical Structure:**
```
Category (settings:categories)
  ↓
Category Name (key trong service-menu)
  ↓
Groups
  ↓
Services (regular + addons)
  ↓
Add-ons (reference qua ID)
```

### **CASCADE DELETE Logic:**

Khi xóa 1 category:
1. Xóa category khỏi `settings:categories`
2. Xóa toàn bộ services của category đó khỏi `settings:service-menu`

**Code:**
```typescript
// Backend: /supabase/functions/server/index.tsx

// 1. Remove category
const filtered = categories.filter(cat => cat.id !== categoryId);
await kv.set("settings:categories", filtered);

// 2. CASCADE: Remove services
const serviceMenu = await kv.get("settings:service-menu") || {};
delete serviceMenu[categoryName];
await kv.set("settings:service-menu", serviceMenu);
```

---

## 🔍 **Cách Kiểm Tra Dữ Liệu**

### **Option 1: Từ Browser Console**

```javascript
// Kiểm tra categories
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84f9c112/settings/categories', {
  headers: { 'Authorization': 'Bearer YOUR_ANON_KEY' }
})
.then(r => r.json())
.then(data => console.log('Categories:', data))

// Kiểm tra services
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84f9c112/settings/service-menu', {
  headers: { 'Authorization': 'Bearer YOUR_ANON_KEY' }
})
.then(r => r.json())
.then(data => console.log('Services:', data))
```

### **Option 2: Từ Backend Logs**

Mở Supabase Dashboard → Functions → Logs để xem:
- `[GET CATEGORIES]` - Khi fetch categories
- `[SERVICE MENU GET]` - Khi fetch services
- `[DELETE CATEGORY CASCADE]` - Khi xóa category

---

## 🗑️ **Xóa 4 Categories Cụ Thể**

Để xóa 4 categories từ ảnh:
- Acrylic Nail Services
- Dipping Powder
- Gel Shellac Service
- Waxing Services

**Chạy lệnh này trong Console:**
```javascript
deleteSpecificCategories()
```

Hoặc gọi trực tiếp:
```javascript
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84f9c112/settings/categories/delete-batch', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    names: [
      'Acrylic Nail Services',
      'Dipping Powder',
      'Gel Shellac Service',
      'Waxing Services'
    ]
  })
})
.then(r => r.json())
.then(console.log)
```

---

## 📁 **File Locations**

### **Backend:**
- `/supabase/functions/server/index.tsx` - Tất cả API endpoints
- `/supabase/functions/server/kv_store.tsx` - KV utilities (PROTECTED)

### **Frontend:**
- `/src/app/hooks/useServiceCategories.ts` - Category management
- `/src/app/hooks/useServiceMenu.ts` - Service menu management
- `/src/app/components/admin/molecules/ServiceCategorySidebar.tsx` - Category UI
- `/src/app/components/admin/molecules/ServiceFormSheet.tsx` - Service form UI

---

## ⚠️ **Important Notes**

1. **Không có SQL Database Tables** - Chỉ sử dụng KV Store
2. **Category Name là Primary Key** trong service-menu (không phải ID)
3. **Cascade Delete tự động** khi xóa category
4. **Add-ons reference bằng ID** không phải object nesting
5. **Member Price là optional** - có thể bỏ trống
6. **Add-on services có thể có giá trống** (miễn phí/bảo hành)

---

## 🔧 **Debug Commands**

```javascript
// Xem tất cả categories
window.fetch('https://'+projectId+'.supabase.co/functions/v1/make-server-84f9c112/settings/categories', {
  headers: {'Authorization': 'Bearer '+publicAnonKey}
}).then(r=>r.json()).then(console.table)

// Xem service menu structure
window.fetch('https://'+projectId+'.supabase.co/functions/v1/make-server-84f9c112/settings/service-menu', {
  headers: {'Authorization': 'Bearer '+publicAnonKey}
}).then(r=>r.json()).then(d => console.log(Object.keys(d.data)))

// Xóa categories
deleteSpecificCategories()
```

---

**Last Updated:** January 16, 2026
**System:** Bitcoin Nail Bar Kiosk Check-in v2.0
