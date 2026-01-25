# Phase 2.6 - Appointments Module Extraction

**Date:** January 24, 2026  
**Status:** 🚧 IN PROGRESS  
**Wave:** 2 - Business Logic (Medium Complexity)  
**Impact:** Core booking system refactor

---

## 🎯 Objective

Extract **Appointments CRUD routes** from monolith `/supabase/functions/server/index.tsx` (~500 lines) into dedicated module `/supabase/functions/server/appointments.tsx`.

This is the **core booking engine** of Bitcoin Nail Bar with:
- Email notifications
- QR code generation
- Realtime broadcast to admin
- Customer booking integration
- Staff assignment logic

---

## 📋 Routes to Extract

### Current Inline Routes (in index.tsx)

| Method | Route | Line | Description |
|--------|-------|------|-------------|
| POST | `/appointments` | 1242 | Create new appointment |
| GET | `/appointments` | 1253 | Get all appointments (admin) |
| GET | `/appointments/:id` | 1273 | Get single appointment |
| PUT | `/appointments/:id` | 1292 | Update appointment |

### Helper Functions to Extract

| Function | Lines | Description |
|----------|-------|-------------|
| `createAppointment()` | ~600-900 | Main booking logic with email + realtime |
| Email template integration | - | Uses `email-templates.tsx` |
| Realtime broadcast | ~842-870 | Supabase channel broadcast |

---

## 🏗️ Implementation Plan

### Step 1: Create Appointments Module
- [ ] Create `/supabase/functions/server/appointments.tsx`
- [ ] Import dependencies (Hono, KV, email, Supabase client)
- [ ] Setup Hono app instance

### Step 2: Extract Helper Functions
- [ ] Move `createAppointment()` function
- [ ] Preserve email sending logic (uses `email-templates.tsx`)
- [ ] Preserve QR code generation
- [ ] Preserve realtime broadcast to admin

### Step 3: Extract CRUD Routes
- [ ] POST `/appointments` - Create appointment
- [ ] GET `/appointments` - List all (with sorting)
- [ ] GET `/appointments/:id` - Get single
- [ ] PUT `/appointments/:id` - Update appointment

### Step 4: Update index.tsx
- [ ] Import `appointmentsApp` from `./appointments.tsx`
- [ ] Mount router: `app.route('/', appointmentsApp)`
- [ ] Remove inline routes (lines 1242-1300+)
- [ ] Update comments to reflect extraction

### Step 5: Testing
- [ ] Test POST - Create appointment via chatbot
- [ ] Test POST - Create appointment via admin
- [ ] Test GET - List appointments in admin dashboard
- [ ] Test PUT - Update appointment status
- [ ] Verify email sending works
- [ ] Verify QR code generation works
- [ ] Verify realtime broadcast works

---

## 🔧 Technical Details

### Dependencies Required

```typescript
import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { sendEmail } from './email.tsx';
import { generateBookingConfirmationEmail } from './email-templates.tsx';
```

### Integration Points

1. **Email System** - `email.tsx` + `email-templates.tsx`
2. **KV Store** - `kv_store.tsx` for appointment data
3. **Supabase Realtime** - Broadcast to admin dashboard
4. **Customer System** - Integration with customer profiles
5. **Staff System** - Staff assignment validation

### Data Flow

```
Frontend Booking Form
  ↓
POST /appointments
  ↓
createAppointment()
  ├─→ Validate input
  ├─→ Generate appointment ID
  ├─→ Save to KV Store (kv_store_84f9c112)
  ├─→ Generate QR code
  ├─→ Send email confirmation
  ├─→ Broadcast realtime event
  └─→ Return appointment data
```

---

## 📊 Expected Outcomes

### Lines of Code Impact
- **Removed from index.tsx:** ~500 lines
- **Added to appointments.tsx:** ~520 lines (with comments)
- **Net reduction in monolith:** -500 lines

### File Structure After
```
/supabase/functions/server/
  ├── index.tsx (routes monolith - now ~2,800 lines)
  ├── appointments.tsx (NEW - ~520 lines)
  ├── email-templates.tsx (already exists)
  ├── email.tsx (already exists)
  └── kv_store.tsx (shared)
```

### Wave 2 Progress
```
✅ Phase 2.5 - Staff Module (5 routes)
🚧 Phase 2.6 - Appointments Module (4 routes) ← YOU ARE HERE
✅ Phase 2.7 - Events Module (3 routes) ← Already done!
⏳ Phase 2.8 - Customers Integration
⏳ Phase 2.9 - Membership Integration
⏳ Phase 2.10 - Settings Module
```

---

## ⚠️ Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Email sending breaks | 🟡 Medium | Test with real bookings |
| Realtime broadcast fails | 🟢 Low | Non-critical, can fail silently |
| QR code generation issue | 🟢 Low | Already tested in template fix |
| Customer integration broken | 🟡 Medium | Test chatbot booking flow |

---

## 🧪 Test Checklist

### Functional Tests
- [ ] Create appointment via chatbot with email
- [ ] Create appointment via chatbot without email
- [ ] Create appointment via admin panel
- [ ] Update appointment status
- [ ] Get appointment list in admin
- [ ] View single appointment details

### Integration Tests
- [ ] Email confirmation sent successfully
- [ ] QR code generated and included in email
- [ ] Realtime notification appears in admin dashboard
- [ ] Customer profile linked correctly
- [ ] Staff assignment works

### Edge Cases
- [ ] Missing email field (should work with NULL)
- [ ] Invalid phone format
- [ ] Duplicate appointment time
- [ ] Missing staff assignment

---

## 📝 Notes

### Why Appointments Module is Critical
- **Core business function** - Main revenue generator
- **Complex integrations** - Email, realtime, customers, staff
- **High transaction volume** - Most frequently used endpoint
- **User-facing errors** - Booking failures directly impact customers

### Email Template Integration
- Already extracted to `email-templates.tsx` in previous fix
- No changes needed to template code
- Just import and use `generateBookingConfirmationEmail()`

### Realtime Broadcast
```typescript
await supabase.channel('appointments').send({
  type: 'broadcast',
  event: 'appointment_created',
  payload: { /* appointment data */ }
});
```

---

## 🚀 Next Steps After Completion

1. **Verify deployment** - No Supabase errors
2. **Run full booking flow test** - Chatbot → Email → Admin view
3. **Update migration tracking doc**
4. **Proceed to Phase 2.8** - Customers Integration (verification only)

---

## 📊 Wave 2 Overall Progress

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[██████░░░░░░░░░░░░░░] 33% (2/6 phases)

✅ Phase 2.5 - Staff Module
🚧 Phase 2.6 - Appointments Module ← IN PROGRESS
✅ Phase 2.7 - Events Module
⏳ Phase 2.8 - Customers Integration
⏳ Phase 2.9 - Membership Integration
⏳ Phase 2.10 - Settings Module
```

**Total Refactor Progress:**
```
Wave 1: ████████████ 100% (4/4 phases) ✅
Wave 2: ████░░░░░░░░  33% (2/6 phases) 🚧
Wave 3: ░░░░░░░░░░░░   0% (0/2 phases) ⏳

Overall: ██████░░░░░░ 50% (6/12 phases)
```

---

**Ready to begin implementation!** 🎯

**Next Action:** Create `/supabase/functions/server/appointments.tsx` and start extraction.
