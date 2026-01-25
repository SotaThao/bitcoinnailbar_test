# CUSTOMER API ENDPOINTS - QUICK REFERENCE

**Last Updated:** 2026-01-23  
**Status:** 🟡 KV Store (Migration to Postgres pending)

---

## 📍 BASE URL

```
https://{projectId}.supabase.co/functions/v1/make-server-84f9c112
```

---

## 🗂️ ENDPOINT GROUPS

### **1. Main CRUD Operations**

**File:** `/supabase/functions/server/customers_new.tsx`  
**Table:** `kv_store_customers`

| Method | Endpoint | Auth | Permission | Purpose |
|--------|----------|------|------------|---------|
| GET | `/customers` | ✅ | `can_manage_appointments` | List customers with pagination |
| POST | `/customers` | ✅ | `can_manage_appointments` | Create new customer manually |
| GET | `/customers/:id` | ✅ | Any authenticated user | Get customer details |
| PUT | `/customers/:id` | ✅ | `can_manage_appointments` | Update customer info |
| DELETE | `/customers/:id` | ✅ | `owner` only | Soft delete customer |
| POST | `/customers/search` | ✅ | `can_manage_appointments` | Search customers by query |

---

### **2. Booking Integration**

**File:** `/supabase/functions/server/customers_booking.tsx`  
**Table:** `kv_store_customers`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/customers/book` | ❌ | **Auto-create/update** customer during booking |
| GET | `/customers/lookup/:phone` | ❌ | Lookup customer by phone for booking form autofill |

**Key Features:**

- ✅ Auto-create customer if not exists
- ✅ Auto-update stats if exists
- ✅ Only count visits/spend if `appointment_status = 'Complete'`
- ✅ Check membership validity for booking date
- ✅ Track `appointment_ids[]` array

---

### **3. Membership Integration**

**File:** `/supabase/functions/server/customers_membership.tsx`  
**Table:** `kv_store_customers`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/customers/activate-membership` | ❌ | Update customer after membership redemption |
| GET | `/customers/membership/:identifier` | ❌ | Check membership status by phone or email |

**Key Features:**

- ✅ Auto-create customer if not exists (with default name "Customer")
- ✅ Handle membership stacking (same tier → extend expiry)
- ✅ Handle membership upgrade (different tier → compare amounts)
- ✅ Embed full membership object in customer record

---

### **4. Redeem Code Helper**

**File:** `/supabase/functions/server/redeem.tsx`  
**Function:** `updateCustomerMembership(userId, membership, redeemCode, redemption)`

**Purpose:** Internal helper function called during redeem code flow to update customer membership.

---

## 📊 REQUEST/RESPONSE EXAMPLES

### **Example 1: List Customers**

**Request:**
```http
GET /customers?page=1&limit=20
Headers:
  Authorization: Bearer {publicAnonKey}
  X-Session-Token: {adminToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "customer_us:5551234567",
        "phone": "5551234567",
        "phone_display": "(555) 123-4567",
        "full_name": "John Doe",
        "region": "US",
        "email": "john@example.com",
        "total_visits": 5,
        "total_spent": 250.00,
        "membership": {
          "id": "gold-1yr",
          "tier": "Gold",
          "amount": 1200,
          "activated_at": "2026-01-01T00:00:00Z",
          "expires_at": "2027-01-01T00:00:00Z",
          "status": "active",
          "benefits": ["15% discount", "Priority booking"]
        },
        "created_at": "2026-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "totalCount": 52
    }
  }
}
```

---

### **Example 2: Create Customer (Booking)**

**Request:**
```http
POST /customers/book
Content-Type: application/json

{
  "phone": "5551234567",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "address": "123 Main St",
  "appointment_id": "appt_abc123",
  "appointment_time": "2026-01-25T14:00:00Z",
  "appointment_amount": 75.00,
  "appointment_status": "Pending"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "customer_us:5551234567",
      "phone": "5551234567",
      "phone_display": "(555) 123-4567",
      "full_name": "Jane Smith",
      "region": "US",
      "email": "jane@example.com",
      "total_visits": 0,
      "total_spent": 0,
      "appointment_ids": ["appt_abc123"],
      "created_at": "2026-01-23T10:00:00Z"
    },
    "membership": null,
    "has_valid_membership": false
  }
}
```

**Note:** Since `appointment_status = 'Pending'`, stats are NOT counted yet.

---

### **Example 3: Activate Membership**

**Request:**
```http
POST /customers/activate-membership
Content-Type: application/json

{
  "phone": "5551234567",
  "customer_name": "Jane Smith",
  "membership": {
    "id": "gold-1yr",
    "tier": "Gold",
    "amount": 1200,
    "duration": 12,
    "benefits": ["15% discount", "Priority booking"],
    "redeem_code": "GOLD2026"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "customer_us:5551234567",
      "phone": "5551234567",
      "phone_display": "(555) 123-4567",
      "full_name": "Jane Smith",
      "region": "US",
      "membership": {
        "id": "gold-1yr",
        "tier": "Gold",
        "amount": 1200,
        "activated_at": "2026-01-23T10:00:00Z",
        "expires_at": "2027-01-23T10:00:00Z",
        "status": "active",
        "benefits": ["15% discount", "Priority booking"],
        "redeem_code": "GOLD2026"
      },
      "total_visits": 0,
      "total_spent": 0,
      "appointment_ids": [],
      "created_at": "2026-01-23T10:00:00Z"
    },
    "membership_action": "activated"
  }
}
```

---

### **Example 4: Lookup Customer**

**Request:**
```http
GET /customers/lookup/5551234567?appointment_time=2026-01-25T14:00:00Z
```

**Response:**
```json
{
  "success": true,
  "found": true,
  "data": {
    "customer": {
      "id": "customer_us:5551234567",
      "phone": "5551234567",
      "phone_display": "(555) 123-4567",
      "full_name": "Jane Smith",
      "region": "US",
      "email": "jane@example.com",
      "membership": {
        "tier": "Gold",
        "expires_at": "2027-01-23T10:00:00Z",
        "status": "active"
      }
    },
    "membership": {
      "tier": "Gold",
      "expires_at": "2027-01-23T10:00:00Z",
      "status": "active",
      "benefits": ["15% discount", "Priority booking"]
    },
    "has_valid_membership": true
  }
}
```

---

## 🔐 AUTHENTICATION

### **Admin Endpoints (Requires Auth):**

```javascript
// Frontend Auth
import { getAuthToken } from '/utils/auth';

const token = getAuthToken();

fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/customers`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-Session-Token': token,  // ← JWT token from custom auth
    'Content-Type': 'application/json'
  }
});
```

### **Public Endpoints (No Auth):**

```javascript
// Booking, Membership, Lookup endpoints
fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/customers/book`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ... })
});
```

---

## 📝 CUSTOMER DATA STRUCTURE

### **TypeScript Interface:**

```typescript
export interface CustomerUS {
  id: string;                    // "customer_us:5551234567"
  phone: string;                 // Raw: "5551234567"
  phone_display: string;         // Formatted: "(555) 123-4567"
  full_name: string;
  region: 'US';
  
  // Optional fields
  email?: string;
  date_of_birth?: string;        // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  
  // Statistics
  total_visits: number;
  total_spent: number;           // USD
  last_visit?: string;
  appointment_ids: string[];     // Array of appointment IDs
  
  // Membership (embedded object)
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
  
  // Metadata
  created_at: string;
  created_by: string;
  updated_at?: string;
  is_deleted?: boolean;
}
```

---

## 🎯 BUSINESS LOGIC RULES

### **1. Booking Customer Logic**

Per `BOOKING_CUSTOMER_LOGIC.md`:

- ✅ Only count stats when `appointment_status = 'Complete'`
- ✅ Always track `appointment_ids[]` regardless of status
- ✅ Validate membership for booking date (not just current date)

### **2. Membership Stacking Logic**

- **Same Tier:** Extend expiry date by adding duration
- **Different Tier:** Compare amounts, higher amount wins
- **No Membership:** Apply new membership

### **3. Soft Delete**

- Set `is_deleted = true` instead of hard delete
- Only `owner` role can delete customers
- Filter out deleted customers in all queries

---

## 🚨 COMMON ERRORS

### **Error 1: "Phone number already exists"**

**Cause:** Trying to create customer with duplicate phone.

**Solution:** Use `PUT /customers/:id` to update existing customer.

---

### **Error 2: "Only owner can delete customers"**

**Cause:** Non-owner user trying to delete customer.

**Solution:** Only owner role can delete. Managers cannot.

---

### **Error 3: "Missing required fields"**

**Cause:** `phone`, `full_name`, `appointment_id`, `appointment_time`, `appointment_amount` missing in `/customers/book`.

**Solution:** Ensure all required fields are provided.

---

## 🔄 RELATED WORKFLOWS

### **Workflow 1: New Customer Books Appointment**

```
1. User fills booking form
2. Frontend calls: GET /customers/lookup/:phone
3. If NOT found → Frontend collects full info
4. Frontend calls: POST /customers/book (creates customer)
5. Backend returns customer + membership status
6. Frontend applies membership discount if valid
```

### **Workflow 2: Existing Customer Redeems Code**

```
1. User enters phone + redeem code
2. Backend validates code (redeem.tsx)
3. Backend calls: POST /customers/activate-membership
4. Customer membership updated
5. Backend returns success with new membership info
```

### **Workflow 3: Admin Views Customer List**

```
1. Admin navigates to /admin/loyalty → Customers tab
2. Frontend calls: GET /customers?page=1&limit=20
3. Backend returns paginated list
4. Frontend displays in table with filters
```

---

## 📚 SEE ALSO

- `BOOKING_CUSTOMER_LOGIC.md` - Booking integration rules
- `CUSTOMER_POSTGRES_MIGRATION.md` - Migration plan to Postgres
- `/supabase/functions/server/customers_new.tsx` - Main implementation
- `/supabase/functions/server/customers_booking.tsx` - Booking integration
- `/supabase/functions/server/customers_membership.tsx` - Membership integration

---

**END OF DOCUMENT**
