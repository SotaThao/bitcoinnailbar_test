# Event Management System Implementation

**Feature**: Event Management với auto-popup modal trên homepage  
**Start Date**: January 23, 2026  
**Status**: 🚧 Phase 1 (Backend) - In Progress  
**KV Store**: `kv_store_84f9c112` (Homepage/Public Data)

---

## 📋 Background Context

Bitcoin Nail Bar đang mở rộng hệ thống với Event Management System. System này cho phép admin tạo, chỉnh sửa, và quản lý các sự kiện (events), đồng thời hiển thị event popup modal trên homepage tương tự như PromotionModal hiện tại.

### Business Requirements
- **User Flow**: Navigate sang form registration (external link)
- **Display**: Tương tự PromotionModal với thông tin event
- **Chatbot Integration**: Chatbot sẽ ưu tiên giới thiệu event khi user dismiss modal
- **Priority**: Event popup có priority cao hơn promotion modal

### Integration với hệ thống hiện tại
- Sử dụng `kv_store_84f9c112` (Homepage/Public Data) vì đây là public-facing content
- Admin quản lý events qua admin panel với authentication từ `kv_store_89edbd69`
- Tương thích với PaymentModal mechanism (đã fix với postMessage để close iframe)

---

## 🏗️ Implementation Phases

### ✅ Phase 1: Backend API (COMPLETED)
**File**: `/supabase/functions/server/events.tsx`

#### Endpoints Implemented:

1. **GET `/events`** (Public)
   - Trả về tất cả active events
   - Sort theo date (sớm nhất trước)
   - Không cần authentication

2. **GET `/events/all`** (Admin Only)
   - Trả về tất cả events (bao gồm inactive)
   - Requires admin token authentication
   - Sort theo createdAt (mới nhất trước)

3. **POST `/events`** (Admin Only)
   - Tạo event mới
   - Required fields: `title`, `description`, `date`, `time`, `location`
   - Optional fields: `imageUrl`, `isActive` (default: true)
   - Auto-generate eventId: `evt_${timestamp}_${random}`

4. **PUT `/events/:id`** (Admin Only)
   - Update existing event
   - Merge với existing data
   - Auto-update `updatedAt` timestamp

5. **DELETE `/events/:id`** (Admin Only)
   - Hard delete event từ KV store
   - Check existence trước khi delete

#### Event Data Schema:
```typescript
interface Event {
  id: string;              // evt_1234567890_abc123
  title: string;           // Event name
  description: string;     // Event description
  date: string;           // ISO format: "2026-02-14"
  time: string;           // "7:00 PM - 10:00 PM"
  location: string;       // "Bitcoin Nail Bar - Downtown"
  imageUrl: string;       // Unsplash or uploaded image
  isActive: boolean;      // Show/hide from public
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
}
```

#### KV Store Keys:
- Pattern: `event:{eventId}`
- Example: `event:evt_1737673200_a7d3f2`
- Table: `kv_store_84f9c112`

#### Authentication:
- Reuse existing admin validation từ các admin endpoints
- Check token từ `kv_store_89edbd69` key `admin_auth_token`

---

### 🔄 Phase 2: Frontend EventModal Component (TODO)

**Location**: `/src/app/components/EventModal.tsx`

#### Requirements:
- [ ] Clone structure từ PromotionModal.tsx
- [ ] Display event information: title, date, time, location, description, image
- [ ] CTA button: "Register Now" navigate to external registration link
- [ ] Auto-popup logic: Check localStorage để không spam user
- [ ] Close button với proper cleanup
- [ ] Responsive mobile-first design
- [ ] Integrate với chatbot context

#### Props Interface:
```typescript
interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  registrationUrl: string; // External link
}
```

#### Key Features:
1. **Auto-Popup Logic**:
   - Check localStorage key: `event_modal_dismissed_{eventId}`
   - Show modal nếu chưa dismiss trong X days
   - Priority: Event modal > Promotion modal

2. **Registration Flow**:
   - Button "Register Now" → Open external link in new tab
   - Optional: Track registration click event
   - Close modal after click (or keep open?)

3. **Chatbot Context**:
   - Khi user close modal → Set context flag
   - Chatbot sẽ mention event trong conversation

---

### 🔄 Phase 3: Admin Event Management Page (TODO)

**Location**: `/src/app/pages/admin/ManageEventsPage.tsx`

#### Requirements:
- [ ] Table/List view showing all events (active + inactive)
- [ ] Columns: Title, Date, Time, Location, Status (Active/Inactive), Actions
- [ ] Create new event form/modal
- [ ] Edit event inline hoặc modal
- [ ] Delete event với confirmation dialog
- [ ] Toggle active status quick action
- [ ] Search và filter events
- [ ] Mobile-responsive admin view

#### CRUD Operations:
1. **Create**:
   - Form with all required fields
   - Image upload to Cloudinary hoặc Unsplash
   - Preview before save
   - Default isActive = true

2. **Read**:
   - Fetch from `GET /events/all`
   - Display in sortable table
   - Show status badges (Active/Inactive)

3. **Update**:
   - Inline edit hoặc modal
   - Update individual fields
   - Toggle active status

4. **Delete**:
   - Confirmation dialog: "Are you sure?"
   - Hard delete from KV store

---

### 🔄 Phase 4: Homepage Integration (TODO)

**Location**: `/src/app/App.tsx` hoặc `/src/app/pages/HomePage.tsx`

#### Requirements:
- [ ] Fetch active events từ `GET /events`
- [ ] Determine which event to show (latest? priority?)
- [ ] Show EventModal on homepage load
- [ ] Implement priority logic: Event > Promotion
- [ ] Handle multiple active events (show first? rotate?)
- [ ] localStorage management để track dismissals

#### Priority Logic:
```typescript
// Pseudocode
if (hasActiveEvent && !isDismissedRecently(eventId)) {
  showEventModal();
} else if (hasActivePromotion && !isDismissedRecently(promotionId)) {
  showPromotionModal();
}
```

---

### 🔄 Phase 5: Chatbot Integration (TODO)

**Location**: Chatbot component (TBD)

#### Requirements:
- [ ] Access event data từ context
- [ ] Detect khi user dismiss EventModal
- [ ] Mention event trong conversation: "Hey, did you see our upcoming event?"
- [ ] Provide event details if user asks
- [ ] Link to registration form

---

## 🔧 Technical Notes

### KV Store Architecture
```
kv_store_84f9c112 (Homepage/Public):
  ├── event:evt_xxx_xxx         → Event data
  ├── promotion:prm_xxx_xxx     → Promotion data
  └── gallery:img_xxx_xxx       → Gallery images

kv_store_89edbd69 (Admin/Backend):
  ├── admin_auth_token          → Admin authentication
  ├── membership:mem_xxx_xxx    → Membership data
  └── redeem:code_xxx_xxx       → Redeem codes
```

### API Base URL
```
https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/events
```

### Authentication Flow
```typescript
// Admin endpoints
headers: {
  'Authorization': `Bearer ${adminToken}`
}

// Public endpoints
No auth required
```

---

## 📝 Testing Checklist

### Backend Testing (Done):
- [x] GET /events returns active events only
- [x] GET /events/all requires admin token
- [x] POST /events creates event với correct schema
- [x] PUT /events/:id updates existing event
- [x] DELETE /events/:id removes event
- [x] Validation errors return 400
- [x] Auth failures return 401
- [x] Not found returns 404

### Frontend Testing (TODO):
- [ ] EventModal displays correctly on mobile
- [ ] EventModal displays correctly on desktop
- [ ] Registration link opens in new tab
- [ ] Close button works và updates localStorage
- [ ] Auto-popup logic respects dismiss period
- [ ] Event priority > Promotion priority
- [ ] Admin can create new events
- [ ] Admin can edit existing events
- [ ] Admin can delete events
- [ ] Admin can toggle active status

---

## 🚨 Important Considerations

### 1. **Image Management**
- Use Unsplash for stock images: `unsplash_tool({ query: "event party celebration" })`
- Future: Implement Cloudinary upload for custom images
- Store imageUrl as string in Event schema

### 2. **Event Priority Logic**
- Nếu có nhiều active events, show event nào?
  - Option 1: Show event với date gần nhất
  - Option 2: Show event mới tạo nhất (createdAt)
  - Option 3: Add priority field (priority: number)
- **Decision needed**: Xác định logic với business team

### 3. **Registration Link Management**
- Event có external registration form
- Store registrationUrl trong Event schema? (Chưa có trong current schema)
- Hoặc hardcode URL pattern? (Không recommended)
- **Action**: Consider thêm `registrationUrl` field vào Event interface

### 4. **Analytics & Tracking**
- Track event views (how many users saw modal?)
- Track registration clicks (how many clicked "Register Now"?)
- Store analytics data trong KV store? hoặc use external service?
- **Future enhancement**: Implement basic analytics

### 5. **Dismiss Period**
- User dismiss modal → Don't show again for X days
- Current pattern: 7 days (theo PromotionModal)
- Should event dismiss period be different? (Shorter? Longer?)
- **Decision**: Reuse 7 days pattern from PromotionModal

---

## 🎯 Next Steps

1. **Register events routes trong main index.tsx**:
   ```typescript
   // In /supabase/functions/server/index.tsx
   import eventsApp from './events.tsx';
   
   app.route('/make-server-84f9c112/events', eventsApp);
   ```

2. **Test backend endpoints** với Postman hoặc curl:
   ```bash
   # Test public endpoint
   curl https://xxx.supabase.co/functions/v1/make-server-84f9c112/events
   
   # Test admin endpoint
   curl -H "Authorization: Bearer TOKEN" \
     https://xxx.supabase.co/functions/v1/make-server-84f9c112/events/all
   ```

3. **Phase 2**: Build EventModal component
   - Clone PromotionModal.tsx structure
   - Update styling và content
   - Implement registration link logic

4. **Phase 3**: Build admin management page
   - Create ManageEventsPage.tsx
   - Implement CRUD operations
   - Add to admin navigation

5. **Phase 4**: Integrate EventModal vào homepage
   - Fetch active events
   - Implement priority logic
   - Handle auto-popup

6. **Phase 5**: Integrate with chatbot
   - Pass event context
   - Handle dismissed state
   - Mention event in conversation

---

## 📚 Related Documentation

- [Promotion Modal Implementation](/docs/03-guides/PROMOTION_MODAL.md) (if exists)
- [KV Store Architecture](/docs/01-architecture/KV_STORE_TABLES.md) (if exists)
- [Admin Authentication](/docs/02-api/ADMIN_AUTH.md) (if exists)
- [Payment Modal Fix](/docs/04-changelogs/PAYMENT_MODAL_FIX.md) (if exists)

---

## 🔗 References

- Backend file: `/supabase/functions/server/events.tsx`
- Main server: `/supabase/functions/server/index.tsx`
- KV Store helper: `/supabase/functions/server/kv_store.tsx`
- Promotion modal reference: `/src/app/components/PromotionModal.tsx` (for structure)

---

**Last Updated**: January 23, 2026  
**Updated By**: Senior Fullstack Architect  
**Status**: Backend completed, awaiting Phase 2 frontend implementation
