# 📸 GALLERY MIGRATION GUIDE

## Overview
Hướng dẫn migrate các Figma assets hiện tại trong `GalleryPage.tsx` lên Cloudinary storage và chuyển sang dynamic gallery system.

---

## 🎯 **MỤC TIÊU**

✅ Upload 8 static Figma images lên Cloudinary  
✅ Chuyển public Gallery Page từ hardcoded sang dynamic backend  
✅ Admin có thể quản lý gallery qua Admin Panel  

---

## 📋 **CURRENT STATE**

### **Hardcoded Images trong GalleryPage.tsx:**
```typescript
// 8 static images imported from Figma:
import img1 from 'figma:asset/490a930e6c326d1add62e3f6ba528d76450ac949.png';
import img2 from 'figma:asset/3976be47e4190d18a738dedbeb3ac96221c6c101.png';
import img3 from 'figma:asset/421e44d36e14dee66a0a1ff99a2b4e3dc34150ad.png';
import img4 from 'figma:asset/4bfb016c30178cac0fd6016ed541b8df4380f18f.png';
import img5 from 'figma:asset/36f854256560dfcfb8c919a5776a411f0c3c8422.png';
import img6 from 'figma:asset/335b66cb51969fc7c9a2c97186c9aa7dee54ed2f.png';
import img7 from 'figma:asset/98a7d0f5d1022bd53d3508b351bacc1e15f89655.png';
import img8 from 'figma:asset/76c9e9fb732fce98feb10ecd16537ebe409ebec5.png';

const galleryImages = [
  { src: img1, category: 'Interior' },
  { src: img2, category: 'Nail Art' },
  { src: img3, category: 'Pedicure' },
  { src: img4, category: 'Atmosphere' },
  { src: img5, category: 'Interior' },
  { src: img6, category: 'Nail Art' },
  { src: img7, category: 'Relaxation' },
  { src: img8, category: 'Bar' },
];
```

---

## ✅ **NEW SYSTEM (ĐÃ IMPLEMENT)**

### **1. Backend Endpoints** (`/supabase/functions/server/gallery.tsx`)
```
✅ GET  /gallery/images              - Public: Fetch all images
✅ POST /admin/gallery/upload        - Admin: Upload new image
✅ DELETE /admin/gallery/:id         - Admin: Delete image
✅ PUT /admin/gallery/reorder        - Admin: Reorder images
✅ PUT /admin/gallery/:id/category   - Admin: Update category
```

### **2. Admin Gallery Management** (`/admin/gallery`)
- Upload multiple images với category selection
- Drag & drop reorder (dnd-kit)
- Edit category inline
- Delete với confirmation
- Filter by category
- Preview modal

### **3. Public Gallery Page** (`/gallery`)
- Fetch dynamic từ backend
- Categories từ backend data
- Real-time updates
- Loading states

---

## 🚀 **MIGRATION STEPS**

### **STEP 1: Download Figma Images**

**Option A: Screenshot Manual (Recommended for quick start)**
1. Mở app Bitcoin Nail Bar
2. Navigate tới `/gallery` page
3. Right-click mỗi image → "Save image as..."
4. Lưu với tên descriptive: `interior-1.jpg`, `nail-art-1.jpg`, etc.

**Option B: Export từ Browser DevTools**
1. Mở `/gallery` page
2. F12 → Network tab
3. Reload page
4. Filter by "Img"
5. Find các `figma:asset/xxx.png` requests
6. Right-click → Open in new tab → Save

---

### **STEP 2: Upload qua Admin Panel**

1. **Login vào Admin:**
   ```
   https://your-app.com/admin/login
   ```

2. **Navigate to Gallery Management:**
   ```
   https://your-app.com/admin/gallery
   ```

3. **Upload Images theo Category:**
   
   | Image | Category | Order |
   |-------|----------|-------|
   | img1 (490a930e...) | Interior | 0 |
   | img2 (3976be47...) | Nail Art | 1 |
   | img3 (421e44d3...) | Pedicure | 2 |
   | img4 (4bfb016c...) | Atmosphere | 3 |
   | img5 (36f85425...) | Interior | 4 |
   | img6 (335b66cb...) | Nail Art | 5 |
   | img7 (98a7d0f5...) | Other* | 6 |
   | img8 (76c9e9fb...) | Bar | 7 |

   *Note: "Relaxation" category không có sẵn, chọn "Other" hoặc thêm category mới

4. **Upload Process:**
   - Click vào category button (e.g., "Interior", "Nail Art")
   - Select multiple images cùng lúc (Ctrl/Cmd + Click)
   - Wait for upload confirmation
   - Verify images appear in list

5. **Reorder if needed:**
   - Drag & drop images để match original order
   - Changes auto-save

---

### **STEP 3: Verify Public Gallery**

1. Open public gallery page:
   ```
   https://your-app.com/gallery
   ```

2. **Check:**
   - ✅ All 8 images displayed
   - ✅ Categories filter works
   - ✅ Lightbox navigation works
   - ✅ Images load from Cloudinary URLs

3. **Test Performance:**
   - Images should load faster (Cloudinary CDN)
   - Check Network tab for `cloudinary.com` URLs

---

### **STEP 4: Cleanup (Optional)**

Sau khi verify thành công, bạn có thể:

1. **Archive old GallerySection.tsx** (nếu không dùng nữa):
   ```bash
   # This component used hardcoded Figma assets
   /src/app/components/organisms/GallerySection.tsx
   ```

2. **Update any references** nếu có components khác import GallerySection

---

## 🎨 **AVAILABLE CATEGORIES**

Default categories trong system:
```typescript
- Interior
- Nail Art
- Atmosphere
- Pedicure
- Manicure
- Bar
- Staff
- Products
- Other
```

**Để thêm category mới:**
1. Edit `/src/app/components/admin/GalleryManagement.tsx`
2. Thêm vào `CATEGORIES` array
3. Thêm color mapping vào `CATEGORY_COLORS`

---

## 📊 **DATA STRUCTURE**

### **KV Store Key:** `gallery:images`

```typescript
interface GalleryImage {
  id: string;                    // UUID
  cloudinary_url: string;        // Full CDN URL
  public_id: string;             // Cloudinary public_id
  category: string;              // Category name
  order: number;                 // Display order (0-based)
  width: number;                 // Image width in pixels
  height: number;                // Image height in pixels
  uploadedAt: string;            // ISO timestamp
}
```

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cloudinary_url": "https://res.cloudinary.com/xxx/image/upload/v1234567890/bitcoin-nail-bar/gallery/abc123.jpg",
  "public_id": "bitcoin-nail-bar/gallery/abc123",
  "category": "Interior",
  "order": 0,
  "width": 1920,
  "height": 1080,
  "uploadedAt": "2025-01-20T10:30:00.000Z"
}
```

---

## 🔧 **TROUBLESHOOTING**

### **Issue: Upload fails with "Config missing"**
**Solution:** Check CLOUDINARY_URL environment variable
```bash
# Verify secret exists
supabase secrets list

# If missing, set it:
supabase secrets set CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
```

### **Issue: Images không hiển thị trên public page**
**Solution:** 
1. Check browser console for errors
2. Verify backend response: `GET /gallery/images`
3. Check Network tab for Cloudinary URL accessibility

### **Issue: Drag & drop không work**
**Solution:** 
- Ensure `@dnd-kit` packages installed
- Check browser compatibility (modern browsers only)
- Try refresh page

---

## 📝 **NEXT STEPS**

Sau khi migration xong:

1. ✅ **Monitor Performance:**
   - Check Cloudinary bandwidth usage
   - Optimize image sizes if needed

2. ✅ **Train Staff:**
   - Show admin how to upload new images
   - Demo category management
   - Explain reordering

3. ✅ **Future Enhancements:**
   - Bulk upload UI improvements
   - Image cropping before upload
   - Auto-resize for optimization
   - AI-based category suggestions

---

## 🎯 **SUCCESS CRITERIA**

Migration is complete when:

- [x] All 8 original images uploaded to Cloudinary
- [x] Public gallery fetches from backend
- [x] Categories filter correctly
- [x] Admin can add/edit/delete images
- [x] No hardcoded Figma assets in production
- [x] Performance improved (Cloudinary CDN)

---

## 📞 **SUPPORT**

Nếu gặp vấn đề:
1. Check logs: `/admin/debug-data`
2. Review backend logs for Cloudinary errors
3. Verify KV store data: `kv.get("gallery:images")`

---

**Last Updated:** 2025-01-20  
**Version:** 1.0  
**Status:** ✅ Ready for Migration
