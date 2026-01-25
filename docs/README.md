# 📚 BITCOIN NAIL BAR - DOCUMENTATION INDEX

Welcome to the Bitcoin Nail Bar system documentation. This index will help you find what you need quickly.

---

## 🚀 Quick Start

### For Developers (First Time Setup)
1. Read [Architecture Overview](#-architecture)
2. Understand [Database Structure](./01-architecture/DATABASE_STRUCTURE.md)
3. Review [API Endpoints](./02-api/API_ENDPOINTS.md)
4. Check [Metadata System](./02-api/METADATA_SYSTEM.md)

### For System Admins
1. Review [Migration Guide](./04-changelogs/METADATA_MIGRATION_GUIDE.md)
2. Run [Migration Steps](./04-changelogs/METADATA_MIGRATION_GUIDE.md#-migration-steps)
3. Monitor [System Status](#admin-endpoints)

---

## 📂 Documentation Structure

```
/docs/
├── 01-architecture/
│   ├── DATABASE_STRUCTURE.md        # Complete database schema
│   └── KV_STORE_VISUAL_MAP.md       # Visual diagrams & maps
│
├── 02-api/
│   ├── METADATA_SYSTEM.md           # Metadata helper guide
│   └── API_ENDPOINTS.md             # All API routes
│
├── 03-guides/
│   ├── QUICK_REFERENCE.md           # Quick lookup guide
│   └── CUSTOMER_MANAGEMENT.md       # Customer features
│
├── 04-changelogs/
│   └── METADATA_MIGRATION_GUIDE.md  # Migration instructions
│
└── README.md                        # This file
```

---

## 🏗️ Architecture

### Database Architecture

Bitcoin Nail Bar uses **2 separate KV tables**:

#### 🔵 `kv_store_84f9c112` - Homepage/Public Data
- Service categories
- Services menu
- Gallery images
- Promotions

#### 🔴 `kv_store_89edbd69` - Admin/Backend Data
- Customers
- Memberships
- Orders & Payments
- Redeem codes
- Users & Permissions
- VLinkPay settings
- Notifications

📖 **Full Details:** [DATABASE_STRUCTURE.md](./01-architecture/DATABASE_STRUCTURE.md)

---

### Metadata System

All entities now support structured metadata for better organization:

```json
{
  "phone": "5551234567",
  "name": "John Doe",
  "_meta": {
    "entity_type": "customer",
    "status": "active",
    "created_at": "2025-01-22T10:00:00Z",
    "updated_at": "2025-01-22T10:00:00Z"
  }
}
```

**Benefits:**
- ✅ Clear entity types
- ✅ Status tracking
- ✅ Automatic timestamps
- ✅ Easier queries
- ✅ No breaking changes

📖 **Full Details:** [METADATA_SYSTEM.md](./02-api/METADATA_SYSTEM.md)

---

## 🛠️ Implementation Files

### Backend Server (`/supabase/functions/server/`)

#### Core Files
| File | Purpose |
|------|---------|
| `index.tsx` | Main server entry point |
| `helpers.tsx` | Shared utilities & KV helpers |
| `metadata.tsx` | Metadata helper functions |
| `migrate-metadata.tsx` | Migration utilities |

#### Feature Modules
| File | Purpose |
|------|---------|
| `payment.tsx` | VLinkPay payment flow |
| `membership-redeem.tsx` | Membership activation |
| `admin-redeem-codes.tsx` | Redeem code management |
| `customers.tsx` | Customer CRUD operations |
| `auth.tsx` | User authentication |
| `roles.tsx` | Role management |
| `vlinkpay-settings.tsx` | VLinkPay configuration |
| `gallery.tsx` | Gallery management |
| `promotions.tsx` | Promotions management |

#### Admin Tools
| File | Purpose |
|------|---------|
| `admin-migration.tsx` | Metadata migration endpoints |

---

## 📡 API Endpoints

### Admin Endpoints

#### Migration Endpoints (Owner Only)
```
GET  /admin/migrate/status       # Check migration status
GET  /admin/migrate/prefixes     # List key prefixes
POST /admin/migrate/prefix       # Migrate by prefix
POST /admin/migrate/all          # Migrate all entities
```

#### Redeem Code Management
```
GET    /admin/redeem-codes       # List all codes
DELETE /admin/redeem-codes/:code # Delete code
GET    /admin/orders             # List all orders
```

#### User Management
```
GET    /users                    # List users
POST   /users                    # Create user
PUT    /users/:id                # Update user
POST   /users/:id/deactivate     # Deactivate user
POST   /users/:id/activate       # Activate user
PUT    /users/:id/permissions    # Update permissions
```

### Customer Endpoints

#### Customer Management
```
GET    /customers                # List customers
POST   /customers                # Create customer
GET    /customers/:id            # Get customer
PUT    /customers/:id            # Update customer
DELETE /customers/:id            # Delete customer (Owner only)
POST   /customers/search         # Search customers
POST   /customers/check-in       # Customer check-in
GET    /customers/:id/history    # Customer history
```

### Payment Endpoints

```
POST /payment/create-link        # Create payment link
POST /payment/complete-order     # Complete order after payment
GET  /payment/status/:code       # Check payment status
```

### Membership Endpoints

```
POST /membership/redeem          # Redeem membership code
GET  /membership/check/:phone    # Check membership status
```

📖 **Full Details:** Contact admin for complete API documentation

---

## 🔧 Common Tasks

### For Developers

#### Create Entity with Metadata
```typescript
import { withMetadata } from './metadata.tsx';

const customer = withMetadata(
  { phone, name, email },
  'customer',
  'active'
);

await kv.set('customer:xxx', customer);
```

#### Query Active Entities
```typescript
import { getActive, sortByCreatedAt } from './metadata.tsx';

const customers = await kv.getByPrefix('customer:');
const active = getActive(customers);
const sorted = sortByCreatedAt(active, 'desc');
```

#### Update Entity Status
```typescript
import { updateMetadata } from './metadata.tsx';

const entity = await kv.get('customer:xxx');
const updated = {
  ...entity,
  _meta: updateMetadata(entity._meta, { status: 'inactive' })
};
await kv.set('customer:xxx', updated);
```

📖 **More Examples:** [QUICK_REFERENCE.md](./03-guides/QUICK_REFERENCE.md)

---

### For Admins

#### Check Migration Status
```bash
GET /make-server-84f9c112/admin/migrate/status
Authorization: Bearer YOUR_TOKEN
```

#### Run Migration
```bash
POST /make-server-84f9c112/admin/migrate/prefix
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "prefix": "customer:"
}
```

📖 **Full Guide:** [METADATA_MIGRATION_GUIDE.md](./04-changelogs/METADATA_MIGRATION_GUIDE.md)

---

## 🎯 Best Practices

### 1. Always Use Metadata for New Entities
✅ **Do:**
```typescript
const entity = withMetadata(data, 'customer', 'active');
```

❌ **Don't:**
```typescript
const entity = { ...data }; // Missing metadata!
```

### 2. Update Metadata When Changing Status
✅ **Do:**
```typescript
_meta: updateMetadata(existing._meta, { status: 'inactive' })
```

❌ **Don't:**
```typescript
status: 'inactive' // Metadata not updated!
```

### 3. Remove Metadata Before Client Response
✅ **Do:**
```typescript
return c.json({ data: withoutMetadata(entity) });
```

❌ **Don't:**
```typescript
return c.json({ data: entity }); // Exposes internal metadata!
```

### 4. Use Helper Functions
✅ **Do:**
```typescript
const active = getActive(customers);
```

❌ **Don't:**
```typescript
const active = customers.filter(c => c._meta?.status === 'active');
```

---

## 📊 Visual Guides

### Key Naming Pattern
```
{entity_type}:{identifier}

Examples:
- customer:customer_abc123
- customer_phone:5551234567
- membership:5551234567
- order:ORDER-123-ABC
- redeem_code:XYZ789
```

### Entity Lifecycle
```
ORDER:     pending_payment → completed
CODE:      pending → used | expired
MEMBERSHIP: active → expired
CUSTOMER:  active ↔ inactive → deleted
```

📖 **Full Visual Map:** [KV_STORE_VISUAL_MAP.md](./01-architecture/KV_STORE_VISUAL_MAP.md)

---

## ⚠️ Critical Rules

### 🔴 NEVER MIX THE TWO TABLES!

**kv_store_84f9c112 (Public):**
- ✅ Services, categories, gallery, promotions
- ❌ Customers, orders, memberships, users

**kv_store_89edbd69 (Admin):**
- ✅ Customers, orders, memberships, users
- ❌ Services, categories (public content)

### 🔒 Authorization Levels

| Action | Owner | Admin | Staff |
|--------|-------|-------|-------|
| Run migrations | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Delete customers | ✅ | ❌ | ❌ |
| Manage customers | ✅ | ✅ | ✅ |
| Process payments | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ❌ |

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Entity missing metadata
**Solution:** Use `withMetadata()` helper when creating entities

#### Issue: Migration shows errors
**Solution:** Check error details and manually fix corrupted entries

#### Issue: Status not updating
**Solution:** Use `updateMetadata()` helper to ensure timestamps update

📖 **Full Troubleshooting:** [METADATA_MIGRATION_GUIDE.md](./04-changelogs/METADATA_MIGRATION_GUIDE.md#-troubleshooting)

---

## 📚 Additional Resources

### Documentation Files
- [DATABASE_STRUCTURE.md](./01-architecture/DATABASE_STRUCTURE.md) - Complete schema
- [METADATA_SYSTEM.md](./02-api/METADATA_SYSTEM.md) - Metadata guide
- [KV_STORE_VISUAL_MAP.md](./01-architecture/KV_STORE_VISUAL_MAP.md) - Visual diagrams
- [QUICK_REFERENCE.md](./03-guides/QUICK_REFERENCE.md) - Quick lookup
- [METADATA_MIGRATION_GUIDE.md](./04-changelogs/METADATA_MIGRATION_GUIDE.md) - Migration steps

### Code Files
- `/supabase/functions/server/metadata.tsx` - Helper functions
- `/supabase/functions/server/migrate-metadata.tsx` - Migration utilities
- `/supabase/functions/server/admin-migration.tsx` - Migration endpoints

---

## 🎓 Learning Path

### For New Developers
1. ✅ Read [Database Structure](./01-architecture/DATABASE_STRUCTURE.md)
2. ✅ Review [KV Store Visual Map](./01-architecture/KV_STORE_VISUAL_MAP.md)
3. ✅ Study [Metadata System](./02-api/METADATA_SYSTEM.md)
4. ✅ Practice with [Quick Reference](./03-guides/QUICK_REFERENCE.md)

### For System Admins
1. ✅ Read [Migration Guide](./04-changelogs/METADATA_MIGRATION_GUIDE.md)
2. ✅ Check [Migration Status](#check-migration-status)
3. ✅ Run [Migration](#run-migration)
4. ✅ Verify [Results](#verify-migration)

---

## 🆘 Need Help?

1. Check relevant documentation file
2. Review code examples in [Quick Reference](./03-guides/QUICK_REFERENCE.md)
3. Check server logs for detailed errors
4. Contact system administrator

---

## 🆕 Event Management System (NEW - Jan 23, 2026)

Bitcoin Nail Bar now includes an Event Management System for creating and displaying special events.

### ✅ Phase 1: Backend Complete

**API Endpoints**:
```
GET    /make-server-84f9c112/events         # Get active events (public)
GET    /make-server-84f9c112/events/all     # Get all events (admin)
POST   /make-server-84f9c112/events         # Create event (admin)
PUT    /make-server-84f9c112/events/:id     # Update event (admin)
DELETE /make-server-84f9c112/events/:id     # Delete event (admin)
```

**Event Schema**:
```typescript
interface Event {
  id: string;              // evt_1737673200_abc123
  title: string;
  description: string;
  date: string;           // ISO: "2026-02-14"
  time: string;           // "7:00 PM - 10:00 PM"
  location: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Storage**: `kv_store_84f9c112` with key pattern `event:{eventId}`

### 📖 Event System Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **Build Recap** | Complete session summary | [EVENT_SYSTEM_BUILD_RECAP.md](./04-changelogs/EVENT_SYSTEM_BUILD_RECAP.md) |
| **Implementation Log** | Full roadmap (5 phases) | [EVENT_MANAGEMENT_SYSTEM.md](./04-changelogs/EVENT_MANAGEMENT_SYSTEM.md) |
| **API Reference** | Complete API docs | [EVENT_MANAGEMENT_API.md](./02-api/EVENT_MANAGEMENT_API.md) |
| **Frontend Guide** | Implementation steps | [EVENT_MANAGEMENT_FRONTEND.md](./03-guides/EVENT_MANAGEMENT_FRONTEND.md) |
| **Quick Reference** | Status & links | [EVENT_QUICK_REFERENCE.md](./05-references/EVENT_QUICK_REFERENCE.md) |

### 🔄 Next Steps (Frontend)

Phase 2-5 are pending implementation:
- **Phase 2**: EventModal component (homepage popup)
- **Phase 3**: Admin management page
- **Phase 4**: Homepage integration
- **Phase 5**: Chatbot integration

Start here: [EVENT_MANAGEMENT_FRONTEND.md](./03-guides/EVENT_MANAGEMENT_FRONTEND.md)

---

**Last Updated:** January 23, 2026  
**System Version:** 1.1 (with Event Management System)

---

## 🚨 CUSTOMER SYSTEM MIGRATION (NEW - Jan 23, 2026)

### ⚠️ CRITICAL: KV Store → Postgres Migration Planned

**Current State**: Customer data stored in **KV Store** (`kv_store_customers`)  
**Future State**: Migrate to **Postgres Table** (`customer_profiles`)

### 📚 Migration Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **Migration Plan** | Complete migration roadmap (5 phases) | [CUSTOMER_POSTGRES_MIGRATION.md](./04-changelogs/CUSTOMER_POSTGRES_MIGRATION.md) |
| **Endpoint Map** | All customer API endpoints reference | [CUSTOMER_ENDPOINTS_MAP.md](./02-api/CUSTOMER_ENDPOINTS_MAP.md) |
| **Quick Start** | Developer implementation guide | [CUSTOMER_MIGRATION_QUICKSTART.md](./03-guides/CUSTOMER_MIGRATION_QUICKSTART.md) |

### 🎯 Why Migrate?

✅ **Data Integrity** - Foreign keys, constraints, triggers  
✅ **Performance** - Indexed queries, native SQL JOINs  
✅ **Scalability** - Relational structure, better analytics  
✅ **Postgres Table Already Exists** - Fully designed schema with indexes

### 📊 Current Customer Endpoints (KV Store)

**Files Using KV Store:**
- `customers_new.tsx` - Main CRUD
- `customers_booking.tsx` - Booking integration
- `customers_membership.tsx` - Membership activation
- `redeem.tsx` - Update on redeem

**Frontend:**
- `CustomerManagementTab.tsx` - Admin UI (READ ONLY)
- `BookingPage.tsx` - Calls booking integration

### ⏳ Migration Status

- ✅ **Phase 1**: Planning & Analysis (Complete)
- ✅ **Phase 2**: Backend implementation (Complete - 3 files created!)
- ⏸️ **Phase 3**: Frontend updates (Next)
- ⏸️ **Phase 4**: Data migration (Optional)
- ⏸️ **Phase 5**: Deprecation (Pending)

**📄 [View Detailed Status](./MIGRATION_STATUS.md)**

### 🚀 Next Steps for Developers

1. **Read**: [CUSTOMER_POSTGRES_MIGRATION.md](./04-changelogs/CUSTOMER_POSTGRES_MIGRATION.md)
2. **Decide**: Missing fields strategy (date_of_birth, gender, address, notes)
3. **Implement**: [CUSTOMER_MIGRATION_QUICKSTART.md](./03-guides/CUSTOMER_MIGRATION_QUICKSTART.md)

---