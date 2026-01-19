# 👥 Customer Management API Reference

## 📌 Overview

Module quản lý khách hàng của Bitcoin Nail Bar, bao gồm CRUD operations, tìm kiếm, check-in, và lịch sử giao dịch.

**Base URL:** `/make-server-84f9c112`

**Module File:** `/supabase/functions/server/customers.tsx`

---

## 🔐 Authentication & Authorization

### Authorization Matrix

| Route | Owner | Admin | Staff | Public |
|-------|-------|-------|-------|--------|
| GET /customers | ✅ | ✅ (with permission) | ✅ (with permission) | ❌ |
| POST /customers | ✅ | ✅ (with permission) | ✅ (with permission) | ❌ |
| GET /customers/:id | ✅ | ✅ | ✅ | ❌ |
| PUT /customers/:id | ✅ | ✅ (with permission) | ✅ (with permission) | ❌ |
| DELETE /customers/:id | ✅ | ❌ | ❌ | ❌ |
| POST /customers/search | ✅ | ✅ (with permission) | ✅ (with permission) | ❌ |
| GET /customers/:id/history | ✅ | ✅ (with permission) | ✅ (with permission) | ❌ |
| POST /customers/check-in | ✅ | ✅ | ✅ | ✅ |
| GET /customers/profile | 🚧 Not implemented | 🚧 | 🚧 | 🚧 |

**Required Permission:** `can_manage_appointments` (for most routes)

---

## 📊 Data Model

### Customer Type

```typescript
interface Customer {
  id: string;                  // Format: "customer_{uuid}"
  phone: string;               // Required, unique, 10 digits
  full_name: string;           // Required
  email?: string;              // Optional
  date_of_birth?: string;      // Optional, ISO format (YYYY-MM-DD)
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;              // Staff notes
  total_visits: number;        // Auto-incremented on check-in
  total_spent: number;         // VND, updated on payment
  membership_id?: string;      // Link to membership
  created_at: string;          // ISO timestamp
  created_by: string;          // Staff/Admin ID
  updated_at?: string;         // ISO timestamp
  last_visit?: string;         // ISO timestamp
  is_deleted?: boolean;        // Soft delete flag
}
```

### KV Store Schema

```
customer:{uuid}                → Customer object
customer_phone:{phone}         → Lookup index: "customer:{uuid}"
customer_email:{email}         → Lookup index: "customer:{uuid}"
```

**Example Keys:**
```
customer:customer_123abc       → { id: "customer_123abc", phone: "0901234567", ... }
customer_phone:0901234567      → "customer:customer_123abc"
customer_email:john@mail.com   → "customer:customer_123abc"
```

---

## 🔌 API Endpoints

### 1. List All Customers

**GET** `/customers`

Get paginated list of active customers.

**Auth:** Required + `can_manage_appointments` permission

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Items per page |
| membership_id | string | - | Filter by membership ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "customer_abc123",
        "phone": "0901234567",
        "full_name": "Nguyễn Văn A",
        "email": "vana@gmail.com",
        "total_visits": 5,
        "total_spent": 2500000,
        "membership_id": "mem_vip_001",
        "created_at": "2026-01-01T10:00:00Z",
        "last_visit": "2026-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 120,
      "totalPages": 3
    }
  }
}
```

---

### 2. Create New Customer

**POST** `/customers`

Create a new customer record.

**Auth:** Required + `can_manage_appointments` permission

**Request Body:**
```json
{
  "phone": "0901234567",        // Required
  "full_name": "Nguyễn Văn A",  // Required
  "email": "vana@gmail.com",    // Optional
  "date_of_birth": "1990-05-15", // Optional (YYYY-MM-DD)
  "gender": "male",              // Optional: male | female | other
  "address": "123 Đường ABC, Quận 1, TP.HCM", // Optional
  "notes": "Khách hàng VIP, thích thiết kế cầu kỳ" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "customer_abc123",
    "phone": "0901234567",
    "full_name": "Nguyễn Văn A",
    "email": "vana@gmail.com",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "total_visits": 0,
    "total_spent": 0,
    "created_at": "2026-01-17T10:00:00Z",
    "created_by": "user_owner_001",
    "is_deleted": false
  }
}
```

**Error Cases:**
- `400` - Missing required fields
- `400` - Invalid phone format
- `400` - Phone number already registered

---

### 3. Get Customer Details

**GET** `/customers/:id`

Get detailed information about a specific customer.

**Auth:** Required (any authenticated user)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "customer_abc123",
    "phone": "0901234567",
    "full_name": "Nguyễn Văn A",
    "email": "vana@gmail.com",
    "total_visits": 12,
    "total_spent": 5400000,
    "membership_id": "mem_vip_001",
    "created_at": "2025-06-01T10:00:00Z",
    "last_visit": "2026-01-15T14:30:00Z"
  }
}
```

**Error Cases:**
- `404` - Customer not found or deleted

---

### 4. Update Customer

**PUT** `/customers/:id`

Update customer information.

**Auth:** Required + `can_manage_appointments` permission

**Request Body:**
```json
{
  "full_name": "Nguyễn Văn A (Updated)",
  "email": "newemail@gmail.com",
  "phone": "0909999888",  // Will update phone index
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "customer_abc123",
    "phone": "0909999888",
    "full_name": "Nguyễn Văn A (Updated)",
    "updated_at": "2026-01-17T11:00:00Z"
    // ... other fields
  }
}
```

**Error Cases:**
- `404` - Customer not found
- `400` - Invalid phone format
- `400` - Phone number already registered to another customer

---

### 5. Delete Customer (Soft Delete)

**DELETE** `/customers/:id`

Soft delete a customer (Owner only).

**Auth:** Owner only

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

**Error Cases:**
- `403` - Only owner can delete customers
- `404` - Customer not found

---

### 6. Search Customers

**POST** `/customers/search`

Search customers by phone, name, or email (fuzzy matching).

**Auth:** Required + `can_manage_appointments` permission

**Request Body:**
```json
{
  "query": "0901",  // Search term
  "limit": 20       // Optional, default: 20
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "customer_abc123",
      "phone": "0901234567",
      "full_name": "Nguyễn Văn A",
      "total_visits": 12
    },
    {
      "id": "customer_xyz789",
      "phone": "0901888999",
      "full_name": "Trần Thị B",
      "total_visits": 5
    }
  ]
}
```

---

### 7. Get Customer History

**GET** `/customers/:id/history`

Get customer's visit and transaction history.

**Auth:** Required + `can_manage_appointments` permission

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_id": "customer_abc123",
    "full_name": "Nguyễn Văn A",
    "phone": "0901234567",
    "metrics": {
      "total_visits": 12,
      "total_spent": 5400000,
      "last_visit": "2026-01-15T14:30:00Z",
      "member_since": "2025-06-01T10:00:00Z",
      "membership_status": "Active"
    },
    "appointments": [],  // TODO: Future implementation
    "transactions": []   // TODO: Future implementation
  }
}
```

**Note:** Full appointment/transaction history will be implemented in future iterations.

---

### 8. Customer Check-In

**POST** `/customers/check-in`

Check-in customer at store (increments visit counter).

**Auth:** None (public endpoint)

**Request Body:**
```json
{
  "phone": "0901234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer_name": "Nguyễn Văn A",
    "total_visits": 13,
    "membership_status": "Active"
  }
}
```

**Error Cases:**
- `400` - Phone number required
- `404` - Customer not found

---

### 9. Get Customer Profile (Placeholder)

**GET** `/customers/profile`

Get authenticated customer's own profile.

**Auth:** Required (customer auth - not yet implemented)

**Response:**
```json
{
  "success": false,
  "error": "Customer authentication not yet implemented"
}
```

**Status:** `501 Not Implemented`

---

## 🔧 Helper Functions

### Phone Normalization

```typescript
normalizePhone("(090) 123-4567")  // → "0901234567"
normalizePhone("090 123 4567")    // → "0901234567"
```

### Phone Validation

```typescript
isValidPhone("0901234567")   // → true
isValidPhone("123456789")    // → false (not starting with 0)
isValidPhone("09012345")     // → false (not 10 digits)
```

---

## 🚀 Usage Examples

### Frontend Integration

```typescript
// Create customer
const response = await fetch('/make-server-84f9c112/customers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`,
  },
  body: JSON.stringify({
    phone: '0901234567',
    full_name: 'Nguyễn Văn A',
    email: 'vana@gmail.com',
  }),
});

// Search customers
const searchResponse = await fetch('/make-server-84f9c112/customers/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`,
  },
  body: JSON.stringify({
    query: '0901',
    limit: 20,
  }),
});

// Check-in (no auth required)
const checkinResponse = await fetch('/make-server-84f9c112/customers/check-in', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '0901234567',
  }),
});
```

---

## 📝 Testing Checklist

- [ ] Owner can create/read/update/delete customers
- [ ] Admin/Staff with permission can create/read/update customers
- [ ] Admin/Staff without permission get 403 error
- [ ] Phone normalization works correctly
- [ ] Phone uniqueness is enforced
- [ ] Email lookup index is created/updated
- [ ] Soft delete works (customers not shown in list)
- [ ] Search by phone (partial match) works
- [ ] Search by name (fuzzy match) works
- [ ] Pagination works correctly
- [ ] Check-in increments visit counter
- [ ] Check-in updates last_visit timestamp
- [ ] Phone validation rejects invalid formats

---

## 🔄 Future Enhancements

1. **Customer Authentication**
   - Implement customer login via phone OTP
   - Allow customers to view their own profile
   - Self-service appointment history

2. **Full History Tracking**
   - Link to appointments table
   - Link to payments/transactions table
   - Generate visit analytics

3. **Advanced Search**
   - Filter by visit count range
   - Filter by spending range
   - Filter by last visit date

4. **Merge Duplicate Customers**
   - API endpoint to merge two customer records
   - Transfer history from old to new record

5. **Customer Segmentation**
   - Tag customers (VIP, Regular, New, etc.)
   - Auto-assign tags based on metrics

---

## 🐛 Known Issues

- ❌ Customer profile endpoint not yet implemented
- ⚠️ History endpoint returns placeholder data (no actual appointment/transaction history)

---

## 📞 Support

For backend issues, check server logs:
```bash
# View real-time logs
deno run --allow-all supabase/functions/server/index.tsx
```

Search for log prefixes:
- `[CREATE CUSTOMER]`
- `[UPDATE CUSTOMER]`
- `[SEARCH CUSTOMERS]`
- `[CHECK-IN]`
