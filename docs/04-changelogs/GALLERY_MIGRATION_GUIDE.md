# GALLERY MIGRATION GUIDE

## 🎯 Overview
Hoàn tất migration từ hardcoded Figma assets sang Cloudinary-powered Gallery Management System với dynamic backend fetching.

## ✅ Completed Changes

### 1. **Frontend Migration** ✅
**Files Updated:**
- `/src/app/components/organisms/GallerySection.tsx` (Homepage gallery)
- `/src/app/components/pages/GalleryPage.tsx` (Full gallery page)

**Changes:**
- ❌ **Removed:** 8 hardcoded Figma asset imports from GallerySection
  ```typescript
  // BEFORE (Deleted)
  import img1 from 'figma:asset/490a930e6c326d1add62e3f6ba528d76450ac949.png';
  import img2 from 'figma:asset/3976be47e4190d18a738dedbeb3ac96221c6c101.png';
  // ... 6 more
  const galleryImages = [img1, img2, img3, img4, img5, img6, img7, img8];
  ```

- ✅ **Added:** Dynamic fetching from backend (both pages)
  ```typescript
  // AFTER (Current)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  
  useEffect(() => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery/images`
    );
    // Fetches from Cloudinary via backend
  }, []);
  ```

- ✅ **Auto-hide:** GallerySection không render nếu không có images
  ```typescript
  if (loading || galleryImages.length === 0) {
    return null; // Won't break homepage if empty
  }
  ```

- ✅ **Simplified:** GalleryPage removed category filter system, shows all images in grid

### 2. **Admin Panel** ✅
**File:** `/src/app/components/admin/GalleryManagement.tsx`

**Features:**
- Single "Upload Images" button (no category complexity)
- Drag-to-reorder functionality
- Preview modal with zoom
- Delete with confirmation
- Multi-file upload support (max 10MB each)

### 3. **Navigation Update** ✅
**File:** `/src/app/components/AdminLayout.tsx`

**Change:** Moved Gallery từ "General" section lên "Main Features"
```typescript
const mainNavLinks = [
  // ...
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/gallery', label: 'Gallery', icon: Image }, // ← NEW POSITION
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];
```

## 🚀 Required Action: Upload 8 Images

### Step 1: Locate Original Images
8 hình ảnh cần migrate từ Figma assets (hash IDs):
1. `490a930e6c326d1add62e3f6ba528d76450ac949.png`
2. `3976be47e4190d18a738dedbeb3ac96221c6c101.png`
3. `421e44d36e14dee66a0a1ff99a2b4e3dc34150ad.png`
4. `4bfb016c30178cac0fd6016ed541b8df4380f18f.png`
5. `36f854256560dfcfb8c919a5776a411f0c3c8422.png`
6. `335b66cb51969fc7c9a2c97186c9aa7dee54ed2f.png`
7. `98a7d0f5d1022bd53d3508b351bacc1e15f89655.png`
8. `76c9e9fb732fce98feb10ecd16537ebe409ebec5.png`

### Step 2: Upload to Admin Panel
1. Navigate to `/admin/gallery`
2. Click "Upload Images" button (orange)
3. Select all 8 images at once (multi-select supported)
4. Wait for upload confirmation toast
5. Drag to reorder if needed (homepage displays in order)

### Step 3: Verify Homepage
1. Visit homepage (`/`)
2. Scroll to Gallery section (bottom)
3. Confirm 8 images display with infinite scroll animation
4. Test lightbox by clicking any image

## 🔧 Technical Details

### Backend Endpoints Used
```
GET  /gallery/images          → Fetch all gallery images (ordered)
POST /admin/gallery/upload    → Upload new image
PUT  /admin/gallery/reorder   → Update image order
DELETE /admin/gallery/:id     → Delete image
```

### Data Flow
```
Admin Upload → Cloudinary Storage → KV Store (metadata) → Public API → Homepage
```

### Image Properties
- **Storage:** Cloudinary CDN
- **Max Size:** 10MB per file
- **Format:** Any image/* type
- **Order:** Determined by drag-drop in admin panel
- **Category:** All set to "Gallery" (simplified from 9 categories)

## 📊 Benefits

### Before (Hardcoded)
- ❌ Requires code deployment to update images
- ❌ No admin UI control
- ❌ Figma dependency
- ❌ No CDN optimization

### After (Dynamic)
- ✅ Admin can update via UI instantly
- ✅ Cloudinary CDN delivery
- ✅ Drag-to-reorder without code
- ✅ No deployment needed for content changes

## 🐛 Troubleshooting

### Homepage gallery section not showing?
**Cause:** No images uploaded yet  
**Fix:** Upload at least 1 image in `/admin/gallery`

### Images not loading?
**Check:**
1. Browser console for API errors
2. Backend logs: `console.log` in gallery module
3. Cloudinary URL validity (should be `https://res.cloudinary.com/...`)

### Order not saving?
**Fix:** Backend PUT /admin/gallery/reorder endpoint handles this. Check network tab.

## ✅ Migration Checklist

- [x] Frontend code updated (GallerySection.tsx)
- [x] Backend endpoints functional
- [x] Admin UI simplified (single upload button)
- [x] Navigation menu updated
- [ ] **Upload 8 images** ← YOUR ACTION REQUIRED
- [ ] Verify homepage display
- [ ] Test lightbox functionality
- [ ] Test reorder drag-drop

## 🎉 Next Steps

After uploading 8 images:
1. Test full user flow (admin upload → homepage display)
2. Optional: Continue backend refactor (5 remaining modules)
3. Document any edge cases discovered

---

**Last Updated:** January 20, 2026  
**Migration Status:** 90% Complete (Waiting for 8 image uploads)