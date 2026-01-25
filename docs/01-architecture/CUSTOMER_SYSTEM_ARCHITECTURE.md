# CUSTOMER SYSTEM ARCHITECTURE

**Status:** 🟡 Transitioning (KV Store → Postgres)  
**Last Updated:** 2026-01-23

---

## 🗺️ SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    BITCOIN NAIL BAR                          │
│                    CUSTOMER SYSTEM                           │
└─────────────────────────────────────────────────────────────┘

┌───────────────┐         ┌───────────────┐         ┌──────────────┐
│   FRONTEND    │────────▶│    BACKEND    │────────▶│   DATABASE   │
│               │         │               │         │              │
│  - Booking    │         │ - customers   │         │  KV Store    │
│  - Admin UI   │         │   _new.tsx    │         │  (CURRENT)   │
│  - Redeem     │         │ - customers   │         │              │
│               │         │   _booking    │         │  Postgres    │
│               │         │ - customers   │         │  (FUTURE)    │
│               │         │   _membership │         │              │
└───────────────┘         └───────────────┘         └──────────────┘
```

---

## 📊 CURRENT STATE (KV Store)

### **Data Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENTS                     │
├─────────────────────┬──────────────────┬────────────────────┤
│  BookingPage.tsx    │  Admin Tab       │  Redeem Flow       │
│  (Public)           │  (Protected)     │  (Public)          │
└──────────┬──────────┴─────────┬────────┴──────────┬─────────┘
           │                    │                   │
           ▼                    ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND ENDPOINTS                         │
├────────────────────┬─────────────────┬─────────────────────┤
│ customers_booking  │ customers_new   │ customers_membership│
│ .tsx               │ .tsx            │ .tsx                │
│                    │                 │                     │
│ POST /book         │ GET /customers  │ POST /activate-     │
│ GET /lookup/:phone │ POST /customers │      membership     │
│                    │ PUT /customers  │ GET /membership/    │
│                    │ DELETE          │     :identifier     │
└────────────────────┴─────────────────┴─────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                  KV STORE LAYER                               │
│  kv_store_customers.tsx (Helper Functions)                    │
├──────────────────────────────────────────────────────────────┤
│  • get(key)                                                  │
│  • set(key, value)                                           │
│  • getAll(limit, offset)                                     │
│  • searchByPhone(phone)                                      │
│  • searchByEmail(email)                                      │
│  • search(query, region, limit)                              │
│  • countAll()                                                │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                   SUPABASE KV TABLE                           │
│  kv_store_customers (PostgreSQL)                              │
├──────────────────────────────────────────────────────────────┤
│  key: TEXT (PRIMARY KEY)                                      │
│  value: JSONB                                                │
│  created_at: TIMESTAMPTZ                                      │
└──────────────────────────────────────────────────────────────┘

STORED DATA STRUCTURE:
{
  "key": "customer_us:5551234567",
  "value": {
    "id": "customer_us:5551234567",
    "phone": "5551234567",
    "phone_display": "(555) 123-4567",
    "full_name": "John Doe",
    "region": "US",
    "email": "john@example.com",
    "total_visits": 5,
    "total_spent": 250.00,
    "membership": {
      "tier": "Gold",
      "expires_at": "2027-01-01",
      "status": "active"
    },
    "appointment_ids": ["appt1", "appt2"],
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

---

## 🎯 FUTURE STATE (Postgres)

### **Data Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENTS                     │
│                    (NO CHANGES NEEDED)                       │
├─────────────────────┬──────────────────┬────────────────────┤
│  BookingPage.tsx    │  Admin Tab       │  Redeem Flow       │
│  (Public)           │  (Protected)     │  (Public)          │
└──────────┬──────────┴─────────┬────────┴──────────┬─────────┘
           │                    │                   │
           ▼                    ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND ENDPOINTS (NEW)                   │
├────────────────────┬─────────────────┬─────────────────────┤
│ customers_booking  │ customers       │ customers_membership│
│ _postgres.tsx      │ _postgres.tsx   │ _postgres.tsx       │
│                    │                 │                     │
│ Same endpoints     │ Same endpoints  │ Same endpoints      │
│ Different impl.    │ Different impl. │ Different impl.     │
└────────────────────┴─────────────────┴─────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                  SUPABASE CLIENT                              │
│  @supabase/supabase-js                                        │
├──────────────────────────────────────────────────────────────┤
│  const { data, error } = await supabase                       │
│    .from('customer_profiles')                                │
│    .select('*')                                              │
│    .eq('phone', phone)                                       │
│    .single();                                                │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│               POSTGRES TABLE: customer_profiles               │
├──────────────────────────────────────────────────────────────┤
│  id                   UUID PRIMARY KEY                        │
│  phone                TEXT                                    │
│  email                TEXT UNIQUE                             │
│  full_name            TEXT NOT NULL                           │
│  tier                 TEXT DEFAULT 'silver'                   │
│  status               TEXT DEFAULT 'active'                   │
│  total_visits         INTEGER DEFAULT 0                       │
│  lifetime_spend       NUMERIC(10,2) DEFAULT 0                │
│  last_visit_date      TIMESTAMPTZ                             │
│  membership_id        UUID → FOREIGN KEY                      │
│  membership_start_date TIMESTAMPTZ                            │
│  membership_end_date  TIMESTAMPTZ                             │
│  created_at           TIMESTAMPTZ DEFAULT now()              │
│  updated_at           TIMESTAMPTZ DEFAULT now()              │
├──────────────────────────────────────────────────────────────┤
│  INDEXES:                                                     │
│  • idx_customer_profiles_tier                                │
│  • idx_customer_profiles_status                              │
│  • idx_customer_profiles_email                               │
│  • idx_customer_profiles_membership_end                      │
├──────────────────────────────────────────────────────────────┤
│  TRIGGERS:                                                    │
│  • customer_profiles_updated_at (auto-update timestamp)      │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                  FOREIGN KEY RELATIONS                        │
├──────────────────────────────────────────────────────────────┤
│  customer_profiles.id → auth.users.id                         │
│  customer_profiles.membership_id → customer_memberships.id    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA STRUCTURE COMPARISON

### **KV Store (Current):**

```typescript
interface CustomerKV {
  id: string;                // "customer_us:5551234567"
  phone: string;             // "5551234567"
  phone_display: string;     // "(555) 123-4567"
  full_name: string;
  region: 'US' | 'VN';
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  notes?: string;
  total_visits: number;
  total_spent: number;
  last_visit?: string;
  appointment_ids: string[];  // Embedded array
  
  // Embedded membership object
  membership?: {
    id: string;
    tier: string;
    amount: number;
    activated_at: string;
    expires_at: string;
    status: 'active' | 'expired';
    benefits: string[];
    redeem_code?: string;
  };
  
  created_at: string;
  created_by: string;
  updated_at?: string;
  is_deleted?: boolean;
}
```

### **Postgres (Future):**

```typescript
interface CustomerPostgres {
  id: string;                // UUID (auto-generated)
  phone: string;             // Stored separately
  email: string;
  full_name: string;
  avatar_url?: string;
  
  // Flattened membership fields
  tier: 'guest' | 'silver' | 'gold' | 'platinum';
  status: 'active' | 'inactive' | 'suspended';
  membership_id?: string;     // Foreign key
  membership_start_date?: string;
  membership_end_date?: string;
  membership_auto_renew?: boolean;
  
  // Statistics (renamed fields)
  loyalty_points: number;
  lifetime_spend: number;     // Was: total_spent
  total_visits: number;
  last_visit_date?: string;   // Was: last_visit
  
  // Preferences
  marketing_opt_in: boolean;
  sms_opt_in: boolean;
  preferred_language: 'en' | 'vi';
  
  // Metadata (auto-managed by Postgres)
  created_at: string;
  updated_at: string;         // Auto-trigger
}
```

---

## 🔀 MIGRATION MAPPING

```
┌─────────────────────────────────────────────────────────────┐
│                   FIELD TRANSFORMATION                        │
├───────────────────────────┬─────────────────────────────────┤
│  KV Store                 │  Postgres                       │
├───────────────────────────┼─────────────────────────────────┤
│  id: "customer_us:xxx"    │  id: UUID (new)                 │
│                           │  phone: "xxx" (separate)        │
├───────────────────────────┼─────────────────────────────────┤
│  phone_display            │  ❌ Calculate on-the-fly       │
├───────────────────────────┼─────────────────────────────────┤
│  region: "US"             │  ❌ Remove (US only)            │
├───────────────────────────┼─────────────────────────────────┤
│  total_spent              │  lifetime_spend                 │
├───────────────────────────┼─────────────────────────────────┤
│  last_visit               │  last_visit_date                │
├───────────────────────────┼─────────────────────────────────┤
│  appointment_ids[]        │  ❌ Use relation table          │
├───────────────────────────┼─────────────────────────────────┤
│  membership.tier          │  tier (flatten)                 │
│  membership.activated_at  │  membership_start_date          │
│  membership.expires_at    │  membership_end_date            │
│  membership.status        │  status (customer-level)        │
│  membership.amount        │  ❌ In memberships table        │
│  membership.benefits      │  ❌ In memberships table        │
├───────────────────────────┼─────────────────────────────────┤
│  is_deleted: true         │  status: 'inactive'             │
├───────────────────────────┼─────────────────────────────────┤
│  created_by               │  ❌ Auth system handles         │
└───────────────────────────┴─────────────────────────────────┘
```

---

## 🚀 INTEGRATION POINTS

### **1. Booking Integration**

```
User Books Appointment
         │
         ▼
┌────────────────────┐
│  BookingPage.tsx   │
└────────┬───────────┘
         │
         ▼
POST /customers/book
{
  phone: "5551234567",
  full_name: "Jane",
  appointment_id: "appt_123",
  appointment_amount: 75,
  appointment_status: "Pending"
}
         │
         ▼
┌──────────────────────────────┐
│  Backend Logic:              │
│  1. Search by phone          │
│  2. If exists → Update       │
│  3. If not → Create new      │
│  4. Check membership         │
│  5. Return discount status   │
└──────────────────────────────┘
         │
         ▼
Response: {
  customer: {...},
  membership: {...},
  has_valid_membership: true
}
```

### **2. Membership Activation**

```
User Redeems Code
         │
         ▼
┌────────────────────┐
│  Redeem Flow       │
└────────┬───────────┘
         │
         ▼
POST /customers/activate-membership
{
  phone: "5551234567",
  membership: {
    tier: "Gold",
    amount: 1200,
    duration: 12
  }
}
         │
         ▼
┌──────────────────────────────┐
│  Backend Logic:              │
│  1. Search by phone          │
│  2. If exists → Update       │
│     - Same tier → Stack      │
│     - Diff tier → Compare    │
│  3. If not → Create new      │
└──────────────────────────────┘
         │
         ▼
Response: {
  customer: {...},
  membership_action: "stacked"
}
```

### **3. Admin Management**

```
Admin Views Customers
         │
         ▼
┌────────────────────────────┐
│  CustomerManagementTab     │
└────────┬───────────────────┘
         │
         ▼
GET /customers?page=1&limit=20
         │
         ▼
┌──────────────────────────────┐
│  Backend Logic:              │
│  1. Get paginated list       │
│  2. Filter by status         │
│  3. Calculate totals         │
└──────────────────────────────┘
         │
         ▼
Response: {
  customers: [...],
  pagination: {
    page: 1,
    totalPages: 5,
    totalCount: 92
  }
}
```

---

## 🎯 BENEFITS OF POSTGRES MIGRATION

### **Data Integrity:**

```
KV Store (No Constraints):
┌─────────────────────┐
│  customer_us:xxx    │◀─── No foreign keys
│  {                  │
│    membership: {...}│◀─── Embedded data
│  }                  │     (can become stale)
└─────────────────────┘

Postgres (With Constraints):
┌─────────────────────┐         ┌──────────────────┐
│  customer_profiles  │────────▶│  auth.users      │
│  id: UUID           │         │  id: UUID        │
│  membership_id ─────┼────────▶│                  │
└─────────────────────┘         └──────────────────┘
         │                               │
         │                               │
         ▼                               ▼
┌─────────────────────┐         Foreign keys ensure
│  customer_          │         referential integrity
│  memberships        │
└─────────────────────┘
```

### **Performance:**

```
KV Store Query (Full Scan):
┌───────────────────────────────────────┐
│  SELECT * FROM kv_store_customers     │
│  WHERE value->>'phone' = '5551234567' │  ❌ No index on JSONB field
└───────────────────────────────────────┘
                 │
                 ▼
         Full table scan (SLOW)

Postgres Query (Indexed):
┌───────────────────────────────────────┐
│  SELECT * FROM customer_profiles      │
│  WHERE phone = '5551234567'           │  ✅ Index on phone column
└───────────────────────────────────────┘
                 │
                 ▼
         Index seek (FAST)
```

---

## 📚 RELATED DOCUMENTATION

- **Migration Plan:** `/docs/04-changelogs/CUSTOMER_POSTGRES_MIGRATION.md`
- **Endpoint Map:** `/docs/02-api/CUSTOMER_ENDPOINTS_MAP.md`
- **Quick Start:** `/docs/03-guides/CUSTOMER_MIGRATION_QUICKSTART.md`

---

**END OF DOCUMENT**
