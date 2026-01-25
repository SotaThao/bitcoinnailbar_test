# Phase 2.7 - Events Module Extraction

**Date:** January 24, 2026  
**Status:** ✅ COMPLETED  
**Wave:** 2 - Business Logic (Medium Complexity)  
**Impact:** Event Management System refactor

---

## 🎯 Objective

Extract **Events Management routes** from monolith `/supabase/functions/server/index.tsx` into dedicated module `/supabase/functions/server/events.tsx`.

This handles:
- Public events display on homepage
- Admin event CRUD operations
- Image upload to Supabase Storage
- Active/inactive event filtering

---

## ✅ Implementation Summary

### Created Module: `/supabase/functions/server/events.tsx` (~450 lines)

**Features:**
- ✅ Public bucket initialization (`make-84f9c112-events`)
- ✅ Image upload with 5MB limit
- ✅ Automatic image deletion on event delete
- ✅ Active/inactive event filtering
- ✅ CTA button support (buttonText + buttonLink)
- ✅ Auto-preview with background/text colors

### Routes Extracted (7 endpoints)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/events` | Get active events (public) |
| GET | `/admin/events` | Get all events (admin) |
| POST | `/admin/events` | Create new event |
| PUT | `/admin/events/:id` | Update event |
| DELETE | `/admin/events/:id` | Delete event + image |
| POST | `/events/upload-image` | Upload event image |
| DELETE | `/events/delete-image` | Delete event image |

### KV Store Integration

**Table:** `kv_store_84f9c112` (Homepage/Public data)

**Key Pattern:** `event:{id}`

**Data Structure:**
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format (YYYY-MM-DD)
  time: string; // HH:MM format
  location: string;
  buttonText: string; // CTA button text
  buttonLink: string; // CTA button URL
  backgroundColor?: string; // Auto-preview bg color
  textColor?: string; // Auto-preview text color
  imageUrl?: string; // Public URL from storage
  imagePath?: string; // Storage path for deletion
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🏗️ Architecture

### Storage Bucket Configuration

**Bucket Name:** `make-84f9c112-events`

**Settings:**
- Public access enabled
- Max file size: 5MB
- Allowed types: PNG, JPEG, JPG, WebP
- Auto-initialized on module load

### Image Upload Flow

```
Admin uploads image
  ↓
POST /events/upload-image
  ↓
Validate file (5MB, mime type)
  ↓
Generate unique filename
  ↓
Upload to Supabase Storage
  ↓
Return public URL
  ↓
Admin saves event with imageUrl
```

### Image Deletion Flow

```
Admin deletes event
  ↓
DELETE /admin/events/:id
  ↓
Get event from KV
  ↓
If imagePath exists:
  ├─→ Delete from Storage
  └─→ Delete KV entry
Return success
```

---

## 📊 Impact Analysis

### Lines of Code
- **Removed from index.tsx:** ~400 lines
- **Added to events.tsx:** ~450 lines
- **Net reduction in monolith:** -400 lines

### File Structure After
```
/supabase/functions/server/
  ├── index.tsx (~3,400 lines remaining)
  ├── events.tsx (NEW - ~450 lines) ✅
  ├── gallery.tsx (already exists)
  ├── promotions.tsx (already exists)
  └── kv_store.tsx (shared)
```

### Integration Points

1. **KV Store** - Uses `kv_store_84f9c112` (Homepage data table)
2. **Supabase Storage** - Public bucket for event images
3. **Frontend** - `/src/app/pages/admin/AdminEventsPage.tsx`
4. **Public Page** - `/src/app/pages/EventsPage.tsx`

---

## 🧪 Testing Performed

### Functional Tests
- ✅ Create event with image upload
- ✅ Update event details
- ✅ Toggle event active/inactive status
- ✅ Delete event (auto-deletes image)
- ✅ Public events page shows only active events
- ✅ Admin events page shows all events

### Edge Cases
- ✅ Create event without image (optional)
- ✅ Upload image before creating event
- ✅ Delete event with missing image (no error)
- ✅ Duplicate event titles allowed
- ✅ Past date events still display if active

### Integration Tests
- ✅ Image URLs load correctly in frontend
- ✅ CTA buttons navigate properly
- ✅ Background/text colors apply in preview
- ✅ Event filtering works on public page

---

## 📝 Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| API Reference | `/docs/02-api/EVENT_MANAGEMENT_API.md` | Endpoint specs |
| Frontend Guide | `/docs/03-guides/EVENT_MANAGEMENT_FRONTEND.md` | UI implementation |
| Quick Reference | `/docs/05-references/EVENT_QUICK_REFERENCE.md` | Cheat sheet |
| Phase 1 Complete | `/docs/04-changelogs/EVENT_SYSTEM_PHASE1_COMPLETE.md` | Initial build |
| Full System Overview | `/docs/04-changelogs/EVENT_MANAGEMENT_SYSTEM.md` | Complete specs |

---

## 🔧 Technical Details

### Dependencies

```typescript
import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';
```

### Initialization

```typescript
// Auto-creates bucket on module load
const initBucket = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    });
  }
};

initBucket(); // Called immediately on import
```

### Mounting in index.tsx

```typescript
// Import
import { eventsApp } from './events.tsx';

// Mount
app.route('/', eventsApp); // Line 130
```

---

## ⚠️ Important Notes

### KV Table Usage
- ✅ **Correct:** `kv_store_84f9c112` (Homepage/Public data)
- ❌ **Wrong:** `kv_store_89edbd69` (Admin/Backend data)

Events are public-facing content, so they belong in the **homepage KV table**.

### Image Storage Best Practices
- Always store `imagePath` for deletion
- Use unique filenames (timestamp + random string)
- Validate file size and mime type before upload
- Clean up orphaned images when events are deleted

### Frontend Integration
- Public page: Only shows `isActive: true` events
- Admin page: Shows all events with toggle controls
- Image preview: Use `imageUrl` from storage
- CTA buttons: Respect `buttonText` and `buttonLink` fields

---

## 📊 Wave 2 Progress After Phase 2.7

```
✅ Phase 2.5 - Staff Module (5 routes)
✅ Phase 2.6 - Appointments Module (4 routes)
✅ Phase 2.7 - Events Module (7 routes) ← COMPLETED!
⏳ Phase 2.8 - Customers Integration
⏳ Phase 2.9 - Membership Integration
⏳ Phase 2.10 - Settings Module

Wave 2 Progress: ████████░░░░ 50% (3/6 phases)
```

---

## 🚀 Next Steps

1. ✅ **Phase 2.7 Complete** - Events module extracted
2. ⏭️ **Proceed to Phase 2.8** - Customers Integration verification
3. 📊 **Update refactor tracking** - Document Wave 2 progress

---

## 🎉 Success Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| index.tsx size | ~3,800 lines | ~3,400 lines | -400 lines (-11%) |
| Events logic | Inline | Dedicated module | ✅ Separated |
| Test coverage | Partial | Full | ✅ Improved |
| Maintainability | Low | High | ✅ Enhanced |

---

**Contributors:** Senior Fullstack Architect  
**Reviewed By:** Phase 2 Refactor Team ✅  
**Deployment:** ✅ SUCCESSFUL

---

## 🔗 References

- [Wave 2 Refactor Plan](/docs/04-changelogs/REFACTOR_PHASE2.md)
- [Wave 1 Complete](/docs/04-changelogs/WAVE_1_COMPLETE.md)
- [Event Management API](/docs/02-api/EVENT_MANAGEMENT_API.md)
