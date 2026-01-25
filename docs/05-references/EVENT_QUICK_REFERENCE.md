# Event Management System - Quick Reference

**Last Updated**: January 23, 2026  
**Current Phase**: Backend Complete ✅ → Ready for Frontend Implementation

---

## ✅ Completed

### Backend API (Phase 1)
- [x] File created: `/supabase/functions/server/events.tsx`
- [x] Routes registered in `/supabase/functions/server/index.tsx`
- [x] GET `/events` - Public endpoint for active events
- [x] GET `/events/all` - Admin endpoint for all events
- [x] POST `/events` - Create new event (admin)
- [x] PUT `/events/:id` - Update event (admin)
- [x] DELETE `/events/:id` - Delete event (admin)
- [x] KV Store integration with `kv_store_84f9c112`
- [x] Admin authentication validation
- [x] Error handling and validation

---

## 🔄 Next Steps

### Phase 2: EventModal Component (TODO)
**Priority**: HIGH  
**Location**: `/src/app/components/EventModal.tsx`

**Tasks**:
1. Clone structure from `PromotionModal.tsx`
2. Create EventModal component with props interface
3. Implement auto-popup logic với localStorage
4. Add registration button that opens external link
5. Handle close event với chatbot context flag
6. Make responsive (mobile-first)

**Estimated Time**: 2-3 hours

---

### Phase 3: Admin Management Page (TODO)
**Priority**: MEDIUM  
**Location**: `/src/app/pages/admin/ManageEventsPage.tsx`

**Tasks**:
1. Create table/list view for all events
2. Implement create event form/modal
3. Implement edit event functionality
4. Implement delete with confirmation
5. Add search và filter capabilities
6. Add to admin navigation

**Estimated Time**: 4-5 hours

---

### Phase 4: Homepage Integration (TODO)
**Priority**: HIGH  
**Location**: `/src/app/App.tsx` or `/src/app/pages/HomePage.tsx`

**Tasks**:
1. Fetch active events on mount
2. Implement priority logic (Event > Promotion)
3. Check localStorage for dismiss status
4. Integrate EventModal component
5. Test auto-popup behavior

**Estimated Time**: 1-2 hours

---

### Phase 5: Chatbot Integration (TODO)
**Priority**: LOW  
**Location**: Chatbot component (TBD)

**Tasks**:
1. Read event context from localStorage
2. Mention event in conversation if recently dismissed
3. Provide event details on request
4. Link to registration form

**Estimated Time**: 1-2 hours

---

## 📁 File Structure

```
/supabase/functions/server/
  ├── events.tsx              ✅ Created
  └── index.tsx               ✅ Updated (routes registered)

/src/app/components/
  └── EventModal.tsx          ❌ TODO - Phase 2

/src/app/pages/admin/
  └── ManageEventsPage.tsx    ❌ TODO - Phase 3

/docs/
  ├── 02-api/
  │   └── EVENT_MANAGEMENT_API.md           ✅ Created
  ├── 03-guides/
  │   └── EVENT_MANAGEMENT_FRONTEND.md      ✅ Created
  └── 04-changelogs/
      └── EVENT_MANAGEMENT_SYSTEM.md        ✅ Created
```

---

## 🔗 Quick Links

| Document | Purpose |
|----------|---------|
| [Implementation Log](/docs/04-changelogs/EVENT_MANAGEMENT_SYSTEM.md) | Full implementation details & progress |
| [API Reference](/docs/02-api/EVENT_MANAGEMENT_API.md) | API endpoints documentation |
| [Frontend Guide](/docs/03-guides/EVENT_MANAGEMENT_FRONTEND.md) | Step-by-step frontend implementation |

---

## 🧪 Testing Backend

```bash
# Test public endpoint
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/events

# Test admin endpoint
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/events/all

# Create test event
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test event","date":"2026-03-01","time":"6PM","location":"Downtown"}' \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-84f9c112/events
```

---

## 📊 Data Schema Quick Reference

```typescript
interface Event {
  id: string;              // evt_1234567890_abc123
  title: string;
  description: string;
  date: string;           // "2026-02-14"
  time: string;           // "7:00 PM - 10:00 PM"
  location: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}
```

**KV Store**: `kv_store_84f9c112` (Homepage/Public Data)  
**Key Pattern**: `event:{eventId}`

---

## 🎯 Implementation Priorities

1. **HIGH**: EventModal Component (Phase 2)
   - Required for user-facing feature
   - Blocks homepage integration

2. **HIGH**: Homepage Integration (Phase 4)
   - Required to show events to users
   - Can be done after EventModal

3. **MEDIUM**: Admin Management Page (Phase 3)
   - Required for content management
   - Can work in parallel with frontend

4. **LOW**: Chatbot Integration (Phase 5)
   - Nice to have enhancement
   - Can be done last

---

## 🚀 Start Implementing

**Next Action**: Begin Phase 2 - EventModal Component

**Command**:
```
"Create EventModal component based on PromotionModal.tsx structure"
```

**Reference Files**:
- `/src/app/components/PromotionModal.tsx` - Structure reference
- `/docs/03-guides/EVENT_MANAGEMENT_FRONTEND.md` - Implementation guide

---

## 📝 Important Notes

1. **Table Separation**:
   - Events data → `kv_store_84f9c112` (Public)
   - Admin auth → `kv_store_89edbd69` (Admin)

2. **Priority Logic**:
   - Event modal > Promotion modal
   - Only show one modal at a time

3. **Dismiss Period**:
   - 7 days after user closes modal
   - Stored in localStorage

4. **Registration URL**:
   - Consider adding to Event schema (not implemented yet)
   - Currently must be passed as prop or hardcoded

5. **Image Management**:
   - Use Unsplash for now
   - Future: Implement Cloudinary upload

---

**Ready to continue?** 🚀

Refer to `/docs/03-guides/EVENT_MANAGEMENT_FRONTEND.md` for detailed implementation steps.
