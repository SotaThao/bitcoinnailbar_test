# CUSTOMER API ENDPOINTS - COMPLETE MAPPING

**Last Updated:** January 23, 2026  
**Current Storage:** `kv_store_customers` (NoSQL)  
**Target Storage:** `customer_profiles` (Postgres)

---

## 📍 ENDPOINT INVENTORY

### **1. ADMIN CRUD ENDPOINTS**

**Source:** `/supabase/functions/server/customers_new.tsx`

#### **GET /make-server-84f9c112/customers**
```
Purpose: List customers with pagination
Auth: requireAuth + requirePermission('can_manage_appointments')
Method: GET
Query Params:
  - page: number (default: 1)
  - limit: number (default: 50)
  - membership_id: string (optional filter)

Response:
{
  success: true,
  data: Customer[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    hasMore: boolean
  }
}

Storage: kv_store_customers
Key Pattern: customer_us:*, customer_vn:*
```

#### **GET /make-server-84f9c112/customers/:id**
```
Purpose: Get single customer details
Auth: requireAuth
Method: GET
Params:
  - id: string (customer_us:phone or customer_vn:uuid)

Response:
{
  success: true,
  data: Customer
}

Storage: kv_store_customers
```

#### **POST /make-server-84f9c112/customers**
```
Purpose: Create new customer (manual admin action)
Auth: requireAuth + requirePermission('can_manage_appointments')
Method: POST
Body:
{
  phone: string (required),
  full_name: string (required),
  email?: string,
  date_of_birth?: string,
  gender?: 'male' | 'female' | 'other',
  address?: string,
  notes?: string,
  region: 'US' | 'VN'
}

Response:
{
  success: true,
  data: Customer,
  message: "Customer created successfully"
}

Storage: kv_store_customers
Key: customer_us:{phone} or customer_vn:{uuid}
```

#### **PUT /make-server-84f9c112/customers/:id**
```
Purpose: Update customer (manual admin action)
Auth: requireAuth + requirePermission('can_manage_appointments')
Method: PUT
Params:
  - id: string
Body:
{
  full_name?: string,
  email?: string,
  date_of_birth?: string,
  gender?: string,
  address?: string,
  notes?: string
}

Response:
{
  success: true,
  data: Customer,
  message: "Customer updated successfully"
}

Storage: kv_store_customers
Updates: existing record + updated_at timestamp
```

#### **DELETE /make-server-84f9c112/customers/:id**
```
Purpose: Soft delete customer (set is_deleted=true)
Auth: requireAuth (Owner only)
Method: DELETE
Params:
  - id: string

Response:
{
  success: true,
  message: "Customer deleted successfully"
}

Storage: kv_store_customers
Action: Set is_deleted=true, keep data for history
```

#### **POST /make-server-84f9c112/customers/search**
```
Purpose: Search customers by phone/name/email
Auth: requireAuth + requirePermission('can_manage_appointments')
Method: POST
Body:
{
  query: string,
  region?: 'US' | 'VN',
  limit?: number (default: 20)
}

Response:
{
  success: true,
  data: Customer[],
  count: number
}

Storage: kv_store_customers
Filter: Phone (partial), name (fuzzy), email (partial)
```

---

### **2. BOOKING INTEGRATION ENDPOINTS**

**Source:** `/supabase/functions/server/customers_booking.tsx`

#### **POST /make-server-84f9c112/customers/book**
```
Purpose: Auto create/update customer during booking
Auth: Public (no auth required - booking page)
Method: POST
Body:
{
  phone: string (required),
  full_name: string (required),
  email?: string,
  address?: string,
  date_of_birth?: string,
  gender?: string,
  appointment_id: string,
  appointment_date: string,
  appointment_status: string,
  service_amount: number,
  region?: 'US' | 'VN'
}

Logic:
  IF customer EXISTS (by phone):
    - Update: total_visits++, total_spent+=amount, last_visit
    - Append: appointment_ids.push(appointment_id)
    - Update: email, address if provided
  ELSE:
    - Create new customer
    - Set: total_visits=1, total_spent=amount
    - Init: appointment_ids=[appointment_id]

Response:
{
  success: true,
  data: Customer,
  message: "Customer record updated" or "New customer created",
  has_valid_membership: boolean,
  membership_discount?: number
}

Storage: kv_store_customers
```

#### **GET /make-server-84f9c112/customers/lookup/:phone**
```
Purpose: Quick lookup customer by phone (for booking pre-fill)
Auth: Public
Method: GET
Params:
  - phone: string

Response:
{
  success: true,
  data: {
    customer: Customer,
    has_membership: boolean,
    membership_tier?: string,
    membership_expires?: string
  }
}

Storage: kv_store_customers
Key: customer_us:{phone}
```

---

### **3. MEMBERSHIP INTEGRATION ENDPOINTS**

**Source:** `/supabase/functions/server/customers_membership.tsx`

#### **POST /make-server-84f9c112/customers/activate-membership**
```
Purpose: Auto create/update customer when activating membership
Auth: Public (called after payment)
Method: POST
Body:
{
  phone: string (required),
  email?: string,
  full_name: string (required),
  membership: {
    id: string,
    tier: string,
    amount: number,
    activated_at: string,
    expires_at: string,
    status: 'active',
    benefits: string[],
    redeem_code?: string
  },
  region?: 'US' | 'VN'
}

Logic:
  IF customer EXISTS (by phone):
    - Update: membership object
  ELSE:
    - Create new customer
    - Embed: membership object

Response:
{
  success: true,
  data: Customer,
  message: "Customer membership activated"
}

Storage: kv_store_customers
```

#### **GET /make-server-84f9c112/customers/membership/:identifier**
```
Purpose: Get customer membership by phone or email
Auth: Public
Method: GET
Params:
  - identifier: string (phone or email)

Response:
{
  success: true,
  data: {
    customer: Customer,
    membership: {
      tier: string,
      status: string,
      expires_at: string,
      benefits: string[]
    }
  }
}

Storage: kv_store_customers
Search: By phone (direct) or email (secondary index)
```

---

### **4. REDEEM CODE INTEGRATION**

**Source:** `/supabase/functions/server/redeem.tsx`

#### **Function: updateCustomerMembership()**
```
Purpose: Update customer membership on code redemption
Auth: Internal function (called by redeem endpoint)
Called by: POST /redeem/verify endpoint

Parameters:
  - userId: string (phone or email)
  - membership: object
  - redeemCode: string
  - redemption: object

Logic:
  1. Normalize userId (phone or email)
  2. Lookup customer by phone or email
  3. IF customer EXISTS:
       - Update membership object
     ELSE:
       - Create customer with membership
  4. Save to KV store

Storage: kv_store_customers
```

---

## 🔄 DATA FLOW DIAGRAMS

### **Booking Flow:**
```
User fills booking form
  ↓
POST /customers/book
  ↓
Check if customer exists (by phone)
  ↓
  ├─ EXISTS → Update stats + append appointment_id
  └─ NOT EXISTS → Create customer + init stats
  ↓
Return customer + membership status
  ↓
Booking page applies discount if valid membership
```

### **Membership Activation Flow:**
```
User redeems code (via payment or direct)
  ↓
POST /redeem/verify
  ↓
Generate membership object
  ↓
updateCustomerMembership(userId, membership, ...)
  ↓
Check if customer exists (by phone/email)
  ↓
  ├─ EXISTS → Update membership field
  └─ NOT EXISTS → Create customer with membership
  ↓
POST /customers/activate-membership (notification)
```

---

## 📊 STORAGE ARCHITECTURE (Current)

### **KV Store Structure:**

```
Table: kv_store_customers
├─ customer_us:5551234567
│  └─ value: { CustomerUS object }
├─ customer_us:5559876543
│  └─ value: { CustomerUS object }
├─ customer_vn:uuid-xxx
│  └─ value: { CustomerVN object }
└─ ...

Pros:
✅ Fast lookups by phone (US)
✅ Embedded membership = 1 query
✅ Schema-less flexibility

Cons:
❌ No foreign keys
❌ No indexes (except primary key)
❌ Hard to query across relationships
❌ Manual data integrity enforcement
```

### **Postgres Structure (Target):**

```
Table: customer_profiles
├─ Columns: id, email, phone, full_name, tier, status, ...
├─ Foreign Keys:
│  ├─ id → auth.users(id)
│  └─ membership_id → customer_memberships(id)
├─ Indexes:
│  ├─ idx_customer_profiles_tier
│  ├─ idx_customer_profiles_status
│  ├─ idx_customer_profiles_email
│  └─ idx_customer_profiles_membership_end
└─ Triggers: auto update updated_at

Table: customer_memberships
├─ Columns: id, customer_id, tier, status, expires_at, ...
├─ Foreign Keys:
│  └─ customer_id → customer_profiles(id)
└─ Indexes: customer_id, status, expires_at

Pros:
✅ Foreign key integrity
✅ Multiple indexes for fast queries
✅ Standard SQL for analytics
✅ Transactions support
✅ Easy to extend (add tables)

Cons:
❌ Need JOINs to get full customer + membership
❌ Slightly more complex queries
```

---

## 🧪 TESTING CHECKLIST (Post-Migration)

### **Customer CRUD:**
- [ ] List customers in admin tab
- [ ] View customer details
- [ ] Create new customer (manual)
- [ ] Update customer info (manual)
- [ ] Soft delete customer
- [ ] Search by phone/name/email

### **Booking Integration:**
- [ ] New customer auto-created on first booking
- [ ] Existing customer stats updated on repeat booking
- [ ] Appointment IDs tracked correctly
- [ ] Membership discount applied correctly
- [ ] Customer lookup by phone works

### **Membership Integration:**
- [ ] Customer auto-created on membership purchase
- [ ] Membership data embedded correctly
- [ ] Membership status checked for bookings
- [ ] Redeem code updates membership
- [ ] Membership expiry handled

### **Data Integrity:**
- [ ] No orphaned records
- [ ] Foreign keys enforced
- [ ] Constraints validated (tier, status)
- [ ] Timestamps auto-updated
- [ ] Soft delete works (deleted_at)

---

## 📚 REFERENCE QUERIES

### **Get customer with membership (Postgres):**
```sql
SELECT 
  cp.*,
  cm.tier AS membership_tier,
  cm.status AS membership_status,
  cm.expires_at AS membership_expires,
  cm.benefits AS membership_benefits
FROM customer_profiles cp
LEFT JOIN customer_memberships cm ON cp.membership_id = cm.id
WHERE cp.deleted_at IS NULL
  AND cp.id = $1;
```

### **Search customers by phone (Postgres):**
```sql
SELECT *
FROM customer_profiles
WHERE deleted_at IS NULL
  AND phone ILIKE '%' || $1 || '%'
ORDER BY created_at DESC
LIMIT 20;
```

### **Get customer appointment history (Future):**
```sql
SELECT 
  cp.full_name,
  cp.phone,
  a.appointment_date,
  a.service_id,
  a.total_amount,
  a.status
FROM customer_profiles cp
JOIN appointments a ON cp.id = a.customer_id
WHERE cp.id = $1
ORDER BY a.appointment_date DESC;
```

---

**END OF DOCUMENT**
