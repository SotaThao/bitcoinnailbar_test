# DATABASE STRUCTURE

## 📊 Overview

Bitcoin Nail Bar uses **2 separate KV tables** in Supabase for data isolation:

1. **`kv_store_84f9c112`** - Homepage/Public Data
2. **`kv_store_89edbd69`** - Admin/Backend Data

---

## 🗂️ Table Architecture

### Basic Schema (Both Tables)

```sql
CREATE TABLE kv_store_XXXXXX (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enhanced Structure (With Metadata)

```json
{
  "key": "customer:5551234567",
  "value": {
    "phone": "5551234567",
    "name": "John Doe",
    "email": "john@example.com",
    "_meta": {
      "entity_type": "customer",
      "status": "active",
      "created_at": "2025-01-22T10:00:00Z",
      "updated_at": "2025-01-22T10:00:00Z",
      "version": "1.0"
    }
  }
}
```

> 📘 **Note**: Metadata system is progressively being added to all entities. See [METADATA_SYSTEM.md](../02-api/METADATA_SYSTEM.md) for details.

---

## 📦 kv_store_84f9c112 (Homepage/Public Data)

### Purpose
Stores **public-facing content** for the homepage and customer-facing features.

### Entities

#### Service Categories
```typescript
Key: "category:{id}"
Value: {
  id: string
  name: string
  description: string
  order: number
  _meta: { entity_type: "service", status: "active", ... }
}
```

#### Services Menu
```typescript
Key: "service:{id}"
Value: {
  id: string
  category_id: string
  name: string
  description: string
  price: number
  duration: number
  image_url?: string
  _meta: { entity_type: "service", status: "active", ... }
}
```

#### Gallery Images
```typescript
Key: "gallery-images"
Value: {
  images: Array<{
    id: string
    url: string
    thumbnail_url?: string
    caption?: string
    order: number
  }>
  _meta: { entity_type: "gallery", status: "active", ... }
}
```

#### Promotions
```typescript
Key: "promotion:{id}"
Value: {
  id: string
  title: string
  description: string
  discount_percentage?: number
  valid_from: string
  valid_until: string
  terms?: string
  _meta: { entity_type: "promotion", status: "active", ... }
}
```

---

## 🔐 kv_store_89edbd69 (Admin/Backend Data)

### Purpose
Stores **admin-only data** including payments, memberships, user management, and configurations.

---

### 💳 Payment & Membership Entities

#### Orders
```typescript
Key: "order:{merchantOrderCode}"
Value: {
  merchantOrderCode: string
  planId?: string
  membershipTier: string
  duration: string
  amount: number
  customerEmail?: string
  redeemCode?: string
  status: "pending_payment" | "completed"
  createdAt: string
  expiresAt: string
  paymentCompletedAt?: string
  redeemedAt?: string
  redeemedBy?: string
  _meta: {
    entity_type: "order"
    status: "pending_payment" | "completed"
    created_at: string
    updated_at: string
  }
}
```

#### Redeem Codes
```typescript
Key: "redeem_code:{code}"
Value: {
  code: string
  planId?: string
  membershipTier: string
  duration: string
  amount: number
  customerEmail?: string
  merchantOrderCode: string
  status: "pending" | "used"
  createdAt: string
  expiresAt: string
  paymentCompletedAt: string
  redeemedAt?: string
  redeemedBy?: string
  _meta: {
    entity_type: "redeem_code"
    status: "pending" | "used" | "expired"
    created_at: string
    updated_at: string
  }
}
```

#### Memberships
```typescript
Key: "membership:{phone}"
Value: {
  phone: string
  tier: string
  tierData: {
    name: string
    price: number
    benefits: string[]
  }
  redeemCode: string
  merchantOrderCode: string
  activatedAt: string
  expiresAt: string
  status: "active" | "expired"
  vlinkpayData?: object
  _meta: {
    entity_type: "membership"
    status: "active" | "expired"
    created_at: string
    updated_at: string
  }
}
```

#### Redemption History
```typescript
Key: "redeem_history:{timestamp}:{phone}"
Value: {
  phone: string
  redeemCode: string
  merchantOrderCode: string
  tier: string
  timestamp: string
  _meta: {
    entity_type: "redeem_history"
    status: "completed"
    created_at: string
    updated_at: string
  }
}
```

---

### 👥 Customer Management

#### Customers
```typescript
Key: "customer:{customer_id}"
Value: {
  id: string
  phone: string
  full_name: string
  email?: string
  date_of_birth?: string
  gender?: "male" | "female" | "other"
  address?: string
  notes?: string
  total_visits: number
  total_spent: number
  membership_id?: string
  created_at: string
  created_by: string
  updated_at?: string
  last_visit?: string
  is_deleted?: boolean
  _meta: {
    entity_type: "customer"
    status: "active" | "inactive" | "deleted"
    created_at: string
    updated_at: string
  }
}
```

#### Customer Phone Index
```typescript
Key: "customer_phone:{phone}"
Value: "customer:{customer_id}"
```

#### Customer Email Index
```typescript
Key: "customer_email:{email}"
Value: "customer:{customer_id}"
```

---

### 👤 User Management & Auth

#### Users
```typescript
Key: "user:{user_id}"
Value: {
  id: string
  email: string
  full_name: string
  phone?: string
  role: "owner" | "admin" | "staff"
  avatar_url?: string
  is_active: boolean
  password_hash: string
  created_at: string
  created_by: string
  last_login?: string
  _meta: {
    entity_type: "user"
    status: "active" | "inactive"
    created_at: string
    updated_at: string
  }
}
```

#### Permissions
```typescript
Key: "permissions:{user_id}"
Value: {
  user_id: string
  can_manage_services: boolean
  can_manage_staff: boolean
  can_view_reports: boolean
  can_manage_appointments: boolean
  can_process_payments: boolean
  can_view_analytics: boolean
  can_manage_settings: boolean
  _meta: {
    entity_type: "permissions"
    status: "active"
    created_at: string
    updated_at: string
  }
}
```

#### Roles
```typescript
Key: "role:{role_id}"
Value: {
  id: string
  name: string
  display_name: string
  description?: string
  permissions: {
    can_manage_services: boolean
    can_manage_staff: boolean
    // ... other permissions
  }
  created_at: string
  created_by: string
  _meta: {
    entity_type: "role"
    status: "active"
    created_at: string
    updated_at: string
  }
}
```

---

### ⚙️ System Settings

#### VLinkPay Settings
```typescript
Key: "vlinkpay_settings"
Value: {
  merchantRefCode: string
  apiKey: string
  secretKey: string  // Encrypted with AES-256-GCM
  sandboxEndpoint: string
  redirectUrl: string
  sandboxMode: boolean
  isActive: boolean
  _meta: {
    entity_type: "settings"
    status: "active"
    created_at: string
    updated_at: string
  }
}
```

#### Membership Tiers
```typescript
Key: "membership_tiers"
Value: [
  {
    id: string
    name: string
    price: number
    duration: string
    benefits: string[]
    popular?: boolean
  }
]
```

---

### 🔔 Notifications

#### Check-in Notifications
```typescript
Key: "notification:{timestamp}:{branch_id}"
Value: {
  id: string
  customer_name: string
  customer_phone: string
  branch_id: string
  timestamp: string
  read: boolean
  _meta: {
    entity_type: "notification"
    status: "active"
    created_at: string
    updated_at: string
  }
}
```

---

### 🏢 Branch Data

#### Branches
```typescript
Key: "branch:{branch_id}"
Value: {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  hours: {
    monday: string
    tuesday: string
    // ... other days
  }
  _meta: {
    entity_type: "branch"
    status: "active"
    created_at: string
    updated_at: string
  }
}
```

---

## 🔍 Key Naming Conventions

### Pattern
```
{entity_type}:{identifier}
```

### Examples
```
customer:customer_abc123
customer_phone:5551234567
customer_email:john@example.com
membership:5551234567
order:ORDER-123-ABC
redeem_code:XYZ789
user:user_def456
permissions:user_def456
notification:1737554400000:branch_houston
branch:branch_houston
```

### Index Keys
Some entities have additional index keys for fast lookup:
- `customer_phone:{phone}` → points to `customer:{id}`
- `customer_email:{email}` → points to `customer:{id}`

---

## 📊 Metadata System

All entities should include a `_meta` field for structured metadata:

```typescript
{
  _meta: {
    entity_type: EntityType       // Type of entity
    status: EntityStatus           // Current status
    created_at: string             // ISO timestamp
    updated_at: string             // ISO timestamp
    version?: string               // Schema version
    tags?: string[]                // Optional tags
    parent_id?: string             // Optional parent reference
  }
}
```

### Entity Types
- `customer`, `membership`, `order`, `redeem_code`, `user`, `permissions`
- `notification`, `branch`, `settings`, `gallery`, `menu`, `promotion`
- `service`, `appointment`, `redeem_history`, `role`

### Status Values
- `active`, `inactive`, `pending`, `pending_payment`
- `completed`, `expired`, `used`, `cancelled`, `deleted`

> 📘 See [METADATA_SYSTEM.md](../02-api/METADATA_SYSTEM.md) for full documentation.

---

## 🔐 Critical Rules

### ❌ NEVER MIX THE TWO TABLES!

✅ **Correct:**
```typescript
// Homepage data → kv_store_84f9c112
await kv_homepage.set('service:manicure', serviceData);

// Admin data → kv_store_89edbd69
await kv_admin.set('customer:xxx', customerData);
```

❌ **Wrong:**
```typescript
// DON'T save admin data in homepage table!
await kv_homepage.set('customer:xxx', customerData);
```

### Table Mapping

**kv_store_84f9c112:**
- ✅ Service categories, services, gallery, promotions
- ❌ Customers, orders, memberships, users

**kv_store_89edbd69:**
- ✅ Customers, orders, memberships, users, settings
- ❌ Service categories, services (public content)

---

## 🔧 Backend Files Mapping

### kv_store_89edbd69 (Admin Data)
```
/supabase/functions/server/
├── index.tsx                    # Main server
├── helpers.tsx                  # KV helpers
├── payment.tsx                  # Payment & orders
├── membership-redeem.tsx        # Membership activation
├── admin-redeem-codes.tsx       # Redeem code management
├── auth.tsx                     # User authentication
├── roles.tsx                    # Role management
├── customers.tsx                # Customer management
├── vlinkpay-settings.tsx        # VLinkPay config
└── email.tsx                    # Email notifications
```

### kv_store_84f9c112 (Homepage Data)
```
/supabase/functions/server/
├── gallery.tsx                  # Gallery management
└── promotions.tsx               # Promotions management
```

---

## 📚 Query Examples

### Get All Active Customers
```typescript
import { getActive } from './metadata.tsx';

const allCustomers = await kv.getByPrefix('customer:');
const activeCustomers = getActive(allCustomers);
```

### Find Customer by Phone
```typescript
const customerKey = await kv.get('customer_phone:5551234567');
const customer = await kv.get(customerKey);
```

### Get Pending Orders
```typescript
import { filterByStatus } from './metadata.tsx';

const allOrders = await kv.getByPrefix('order:');
const pendingOrders = filterByStatus(allOrders, 'pending_payment');
```

### Get Expired Memberships
```typescript
import { getExpired } from './metadata.tsx';

const memberships = await kv.getByPrefix('membership:');
const expired = getExpired(memberships);
```

---

## 🎯 Best Practices

1. **Always use metadata** for new entities
2. **Use helper functions** from `metadata.tsx`
3. **Check table name** before writing data
4. **Use index keys** for phone/email lookups
5. **Soft delete** instead of hard delete (set `is_deleted: true`)
6. **Update timestamps** when modifying entities
7. **Validate data** before storing
8. **Handle missing metadata** gracefully (backward compatibility)

---

## 🔄 Migration

To add metadata to existing entities:

1. **Check status:** `GET /admin/migrate/status`
2. **List prefixes:** `GET /admin/migrate/prefixes`
3. **Migrate by prefix:** `POST /admin/migrate/prefix { "prefix": "customer:" }`
4. **Migrate all:** `POST /admin/migrate/all`

See [METADATA_SYSTEM.md](../02-api/METADATA_SYSTEM.md) for details.

---

## 📖 Related Documentation

- [METADATA_SYSTEM.md](../02-api/METADATA_SYSTEM.md) - Metadata implementation
- [API_ENDPOINTS.md](../02-api/API_ENDPOINTS.md) - All API routes
- [CUSTOMER_MANAGEMENT.md](../03-guides/CUSTOMER_MANAGEMENT.md) - Customer features
