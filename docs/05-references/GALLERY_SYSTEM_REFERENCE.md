# 📸 GALLERY SYSTEM REFERENCE

Quick reference cho Gallery Management System.

---

## 🔗 **ROUTES**

| Route | Type | Description |
|-------|------|-------------|
| `/gallery` | Public | Gallery page với dynamic images |
| `/admin/gallery` | Admin | Gallery management panel |

---

## 🛠️ **API ENDPOINTS**

### **Public**
```
GET /gallery/images
→ Returns: { success: true, data: GalleryImage[] }
```

### **Admin**
```
POST   /admin/gallery/upload
       Body: FormData { file, category }
       → Returns: { success: true, data: GalleryImage }

DELETE /admin/gallery/:id
       → Returns: { success: true }

PUT    /admin/gallery/reorder
       Body: { images: GalleryImage[] }
       → Returns: { success: true, data: GalleryImage[] }

PUT    /admin/gallery/:id/category
       Body: { category: string }
       → Returns: { success: true, data: GalleryImage }

PUT    /admin/gallery/:id
       Body: FormData { file?, category? }
       → Returns: { success: true, data: GalleryImage }
```

---

## 📦 **DATA STRUCTURE**

### **GalleryImage Type:**
```typescript
{
  id: string;              // UUID
  cloudinary_url: string;  // CDN URL
  public_id: string;       // Cloudinary ID
  category: string;        // Category name
  order: number;           // Display order
  width: number;           // Image width
  height: number;          // Image height
  uploadedAt: string;      // ISO timestamp
}
```

### **KV Store:**
```
Key: "gallery:images"
Value: GalleryImage[]
```

---

## 🎨 **CATEGORIES**

Available categories with colors:

| Category | Color |
|----------|-------|
| Interior | Purple |
| Nail Art | Pink |
| Atmosphere | Blue |
| Pedicure | Green |
| Manicure | Yellow |
| Bar | Orange |
| Staff | Indigo |
| Products | Red |
| Other | Gray |

**To add new category:**
Edit `/src/app/components/admin/GalleryManagement.tsx`:
1. Add to `CATEGORIES` array
2. Add color to `CATEGORY_COLORS` object

---

## 🧩 **COMPONENTS**

### **Admin:**
```
/src/app/components/admin/GalleryManagement.tsx
- Main admin page
- Upload UI
- Category filters
- Drag & drop grid
- Preview modal
```

### **Public:**
```
/src/app/components/pages/GalleryPage.tsx
- Public gallery display
- Dynamic fetch from backend
- Category filtering
- Lightbox viewer
```

### **Backend:**
```
/supabase/functions/server/gallery.tsx
- Gallery endpoints module
- Cloudinary integration
- Image upload/delete
- Order management
```

---

## 🔐 **PERMISSIONS**

| Action | Public | Admin | Owner |
|--------|--------|-------|-------|
| View Gallery | ✅ | ✅ | ✅ |
| Upload Images | ❌ | ✅ | ✅ |
| Delete Images | ❌ | ✅ | ✅ |
| Reorder Images | ❌ | ✅ | ✅ |
| Change Category | ❌ | ✅ | ✅ |

---

## 📌 **KEY FEATURES**

✅ **Upload:**
- Multiple files at once
- Category selection
- Max 10MB per image
- Auto-resize support (Cloudinary)

✅ **Management:**
- Drag & drop reorder
- Inline category editing
- Delete with confirmation
- Preview modal

✅ **Display:**
- Category filtering
- Responsive grid (1/2/3/4 columns)
- Lightbox viewer
- Keyboard navigation (arrows, ESC)

---

## 🚀 **QUICK COMMANDS**

### **Upload Image:**
```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('category', 'Interior');

fetch(`/admin/gallery/upload`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### **Fetch Images:**
```typescript
const response = await fetch('/gallery/images', {
  headers: { Authorization: `Bearer ${token}` }
});
const { data } = await response.json();
// data is GalleryImage[]
```

### **Delete Image:**
```typescript
fetch(`/admin/gallery/${imageId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🎯 **MIGRATION CHECKLIST**

- [ ] Download 8 current Figma images
- [ ] Login to `/admin/gallery`
- [ ] Upload images by category
- [ ] Verify order matches original
- [ ] Test public gallery page
- [ ] Check Cloudinary CDN URLs
- [ ] Archive old components (optional)

---

## 📊 **MONITORING**

### **Check Upload Status:**
```bash
# Backend logs
supabase functions logs server

# Look for:
"📸 [GALLERY] Fetched X images"
"📤 [GALLERY] Uploading image - Category: X"
"✅ [GALLERY] Image uploaded - ID: X"
```

### **Check Cloudinary Usage:**
1. Login to Cloudinary Dashboard
2. Navigate to Media Library
3. Search folder: `bitcoin-nail-bar/gallery`
4. Check bandwidth usage in Analytics

---

## 🔧 **TROUBLESHOOTING**

| Issue | Solution |
|-------|----------|
| Upload fails | Check CLOUDINARY_URL secret |
| Images not showing | Verify backend endpoint response |
| Drag & drop broken | Refresh page, check @dnd-kit |
| Category missing | Add to CATEGORIES array |

---

## 📚 **RELATED DOCS**

- [GALLERY_MIGRATION_GUIDE.md](/docs/03-guides/GALLERY_MIGRATION_GUIDE.md) - Detailed migration steps
- [BACKEND_REFACTOR_PLAN.md](/docs/01-architecture/BACKEND_REFACTOR_PLAN.md) - Backend module architecture

---

**Version:** 1.0  
**Last Updated:** 2025-01-20  
**Status:** ✅ Production Ready
