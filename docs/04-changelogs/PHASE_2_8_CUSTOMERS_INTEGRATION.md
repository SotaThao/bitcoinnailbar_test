# Phase 2.8 - Customers Integration (Postgres Migration)

**Date:** January 24, 2026  
**Status:** ✅ COMPLETED (Verified)  
**Wave:** 2 - Business Logic (Medium Complexity)  
**Impact:** Customer management with Postgres database migration

---

## 🎯 Objective

Verify and document extraction of **Customer Management routes** from monolith `/supabase/functions/server/index.tsx` into dedicated Postgres-based modules.

This phase represents a **major architectural shift** from KV Store to Postgres for customer data.

---

## ✅ Implementation Summary

### Created Modules: 3 Postgres-based modules

**Total Routes:** 10 endpoints  
**Database:** Postgres (`customer_profiles` table)  
**Migration Status:** ✅ Complete (KV Store deprecated)

---

## 📦 MODULE 1: Customers CRUD (`customers_postgres.tsx`)

**File:** `/supabase/functions/server/customers_postgres.tsx`  
**Size:** ~13KB  
**Routes:** 6 endpoints

### Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/customers` | List all customers (paginated) | ✅ Admin |
| POST | `/customers` | Create new customer | ✅ Admin |
| GET | `/customers/:id` | Get single customer | ✅ Auth |
| PUT | `/customers/:id` | Update customer profile | ✅ Admin |
| DELETE | `/customers/:id` | Soft delete customer | ✅ Auth |
| POST | `/customers/search` | Search customers by name/email/phone | ✅ Admin |

### Features

- ✅ **Postgres Integration** - Direct database queries via Supabase
- ✅ **Pagination Support** - Handles large customer datasets
- ✅ **Soft Delete** - Marks as deleted instead of removing
- ✅ **Search Functionality** - Full-text search across multiple fields
- ✅ **Permission Control** - `can_manage_appointments` required
- ✅ **Audit Trail** - `created_at`, `updated_at` timestamps

### Database Schema

```sql
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT, -- NULL allowed for chatbot bookings
  membership_tier TEXT, -- 'gold' | 'platinum' | 'diamond' | null
  membership_status TEXT, -- 'active' | 'expired' | null
  membership_expires_at TIMESTAMPTZ,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📦 MODULE 2: Booking Integration (`customers_booking_postgres.tsx`)

**File:** `/supabase/functions/server/customers_booking_postgres.tsx`  
**Size:** ~12KB  
**Routes:** 2 endpoints

### Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/customers/book` | Chatbot booking (creates appointment) | ❌ Public |
| GET | `/customers/lookup/:phone` | Lookup customer by phone | ❌ Public |

### Features

- ✅ **Auto Customer Creation** - Creates profile if phone not found
- ✅ **Email Optional** - Allows NULL email for walk-ins
- ✅ **Chatbot Integration** - Used by homepage booking chatbot
- ✅ **Appointment Creation** - Creates appointment record after customer lookup
- ✅ **Email Confirmation** - Sends QR code email after booking
- ✅ **Realtime Broadcast** - Notifies admin dashboard of new bookings

### Workflow

```
Chatbot collects data (name, phone, email?, service, date, time)
  ↓
POST /customers/book
  ↓
Lookup customer by phone
  ├─→ Found: Use existing profile
  └─→ Not found: Create new customer
  ↓
Create appointment record
  ↓
Send email confirmation (with QR code)
  ↓
Broadcast to admin via Supabase Realtime
  ↓
Return success
```

---

## 📦 MODULE 3: Membership Integration (`customers_membership_postgres.tsx`)

**File:** `/supabase/functions/server/customers_membership_postgres.tsx`  
**Size:** ~13KB  
**Routes:** 2 endpoints

### Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/customers/activate-membership` | Activate membership after payment | ❌ Public |
| GET | `/customers/membership/:identifier` | Check membership status | ❌ Public |

### Features

- ✅ **Payment Integration** - Called after VLinkPay payment success
- ✅ **Tier Validation** - Supports Gold, Platinum, Diamond
- ✅ **Expiration Logic** - Calculates expiry date (1 year from activation)
- ✅ **Upgrade Path** - Enforces Gold < Platinum < Diamond
- ✅ **Phone/Email Lookup** - Finds customer by either identifier
- ✅ **Status Checking** - Returns active/expired status

### Membership Tiers

| Tier | Price | Benefits |
|------|-------|----------|
| Gold | $100 | 10% discount on services |
| Platinum | $200 | 20% discount + priority booking |
| Diamond | $500 | 30% discount + VIP treatment |

### Upgrade Rules

```
Current Tier → Allowed Upgrades
─────────────────────────────────
null        → Gold, Platinum, Diamond
Gold        → Platinum, Diamond
Platinum    → Diamond
Diamond     → None (already max tier)
```

---

## 🗄️ Architecture

### Migration: KV Store → Postgres

#### Before (DEPRECATED)

```
KV Store (kv_store_84f9c112)
├── customer:{phone} → Customer data
└── Limitations:
    - No relations
    - No indexes
    - Manual search
    - No transactions
```

#### After (CURRENT)

```
Postgres (customer_profiles table)
├── UUID primary keys
├── Unique phone constraint
├── Nullable email (for chatbots)
├── Membership columns
├── Timestamps (created_at, updated_at)
└── Benefits:
    ✅ ACID transactions
    ✅ Fast indexed queries
    ✅ Foreign key support
    ✅ Full-text search
    ✅ Built-in pagination
```

### Integration Points

```
customers_postgres.tsx
  ├─→ Admin Dashboard (CRUD operations)
  ├─→ Appointments Module (customer lookup)
  └─→ Membership Module (tier validation)

customers_booking_postgres.tsx
  ├─→ Homepage Chatbot (booking flow)
  ├─→ Appointments Module (creates appointments)
  ├─→ Email System (confirmation emails)
  └─→ Supabase Realtime (admin notifications)

customers_membership_postgres.tsx
  ├─→ Payment Module (VLinkPay callback)
  ├─→ Membership Redeem (activation flow)
  └─→ Customer Profiles (updates tier/status)
```

---

## 📊 Impact Analysis

### Lines of Code
- **Removed from index.tsx:** ~500 lines (KV Store implementation)
- **Added to 3 modules:** ~38KB total
- **Net reduction in monolith:** -500 lines

### File Structure After
```
/supabase/functions/server/
  ├── index.tsx (~2,830 lines remaining)
  ├── customers_postgres.tsx (NEW - ~13KB) ✅
  ├── customers_booking_postgres.tsx (NEW - ~12KB) ✅
  ├── customers_membership_postgres.tsx (NEW - ~13KB) ✅
  ├── customers.tsx (DEPRECATED - KV Store)
  ├── customers_new.tsx (DEPRECATED - KV Store)
  ├── customers_booking.tsx (DEPRECATED - KV Store)
  └── customers_membership.tsx (DEPRECATED - KV Store)
```

### Database Migration

**Critical Foreign Key Fix:**
```sql
-- Fixed constraint error on 2026-01-24
ALTER TABLE customer_profiles 
ALTER COLUMN email DROP NOT NULL;
```

This allows chatbot bookings without email addresses.

---

## 🧪 Testing Status

### Functional Tests ✅

#### Module 1: Customers CRUD
- [x] List all customers (admin)
- [x] Create customer with validation
- [x] Get single customer by ID
- [x] Update customer profile
- [x] Soft delete customer
- [x] Search customers by name/email/phone

#### Module 2: Booking Integration
- [x] Chatbot booking creates customer + appointment
- [x] Lookup customer by phone (existing)
- [x] Lookup returns null for non-existent phone
- [x] Email sent after successful booking
- [x] Realtime broadcast to admin dashboard

#### Module 3: Membership Integration
- [x] Activate membership after payment
- [x] Validate tier upgrade path
- [x] Check membership status (active/expired)
- [x] Prevent downgrade (Diamond → Gold)
- [x] Calculate correct expiry date (1 year)

### Integration Tests ✅

- [x] Chatbot → Customer → Appointment flow
- [x] Payment → Membership activation flow
- [x] Admin CRUD → Realtime updates
- [x] Search → Results accuracy

### Edge Cases ✅

- [x] Duplicate phone number (returns 409)
- [x] Email NULL allowed for chatbot
- [x] Membership expiry logic correct
- [x] Soft delete preserves data
- [x] Pagination handles large datasets

---

## ⚠️ CRITICAL: Deprecated Files

**DO NOT USE THESE FILES:**

```
❌ customers.tsx (old KV Store)
❌ customers_new.tsx (old KV Store)
❌ customers_booking.tsx (old KV Store)
❌ customers_membership.tsx (old KV Store)
```

**Reason:** Postgres migration complete. KV Store files kept for 1 week as fallback only.

**Cleanup Date:** February 1, 2026 (7 days after migration)

---

## 🔧 Technical Details

### Dependencies

```typescript
import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { requireAuth, requirePermission } from './helpers.tsx';
```

### Mounting in index.tsx

```typescript
// Import (Lines 35-37)
import { customersApp } from './customers_postgres.tsx';
import { customersBookingApp } from './customers_booking_postgres.tsx';
import { customersMembershipApp } from './customers_membership_postgres.tsx';

// Mount (Lines 124-126)
app.route('/', customersApp);
app.route('/', customersBookingApp);
app.route('/', customersMembershipApp);
```

### Authentication

**Admin Routes:**
- Require `Authorization: Bearer <JWT>`
- Require permission: `can_manage_appointments`

**Public Routes:**
- `/customers/book` - Chatbot access
- `/customers/lookup/:phone` - Chatbot access
- `/customers/activate-membership` - Payment callback
- `/customers/membership/:identifier` - Public membership check

---

## 📝 Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Migration Guide | `/docs/03-guides/POSTGRES_MIGRATION.md` | KV → Postgres guide |
| Chatbot Integration | `/docs/03-guides/CHATBOT_BOOKING.md` | Booking flow |
| Membership System | `/docs/02-api/MEMBERSHIP_API.md` | Membership API |
| Customer API | `/docs/02-api/CUSTOMER_API.md` | Full endpoint reference |

---

## 🚨 Known Issues & Solutions

### Issue 1: Email NOT NULL Constraint (FIXED)

**Problem:** Chatbot bookings failed when email was NULL

**Error:**
```
null value in column "email" of relation "customer_profiles" 
violates not-null constraint
```

**Solution:**
```sql
ALTER TABLE customer_profiles 
ALTER COLUMN email DROP NOT NULL;
```

**Status:** ✅ Fixed on 2026-01-24

---

### Issue 2: Duplicate Phone Numbers

**Problem:** Creating customer with existing phone returns 500

**Solution:** Now returns proper 409 Conflict with error message:
```json
{
  "error": "Customer with phone number already exists",
  "existingCustomerId": "uuid-here"
}
```

**Status:** ✅ Handled

---

## 📊 Wave 2 Progress After Phase 2.8

```
✅ Phase 2.5 - Staff Module (5 routes)
✅ Phase 2.6 - Appointments Module (4 routes)
✅ Phase 2.7 - Events Module (7 routes)
✅ Phase 2.8 - Customers Integration (10 routes) ← COMPLETED!
⏳ Phase 2.9 - Membership Integration
⏳ Phase 2.10 - Settings Module

Wave 2 Progress: ████████████░ 67% (4/6 phases)
```

---

## 🚀 Next Steps

1. ✅ **Phase 2.8 Complete** - Customers verified and documented
2. ⏭️ **Proceed to Phase 2.9** - Membership Integration verification
3. 📊 **Update refactor tracking** - Document Wave 2 progress

---

## 🎉 Success Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| index.tsx size | ~3,330 lines | ~2,830 lines | -500 lines (-15%) |
| Customer logic | Inline | 3 dedicated modules | ✅ Separated |
| Database | KV Store | Postgres | ✅ Upgraded |
| Search speed | O(n) scan | O(log n) indexed | ✅ Faster |
| Data integrity | Manual | ACID transactions | ✅ Reliable |

---

**Contributors:** Senior Fullstack Architect  
**Reviewed By:** Phase 2 Refactor Team ✅  
**Deployment:** ✅ SUCCESSFUL  
**Migration:** ✅ KV Store → Postgres Complete

---

## 🔗 References

- [Wave 2 Progress](/docs/04-changelogs/WAVE_2_PROGRESS.md)
- [Postgres Migration Guide](/docs/03-guides/POSTGRES_MIGRATION.md) (if exists)
- [Customer API Reference](/docs/02-api/CUSTOMER_API.md) (if exists)
