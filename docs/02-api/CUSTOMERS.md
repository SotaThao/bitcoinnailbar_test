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

---

## 🔌 API Endpoints

### 1. List All Customers
**GET** `/customers`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Items per page |
| membership_id | string | - | Filter by membership ID |

### 2. Create New Customer
**POST** `/customers`

**Request Body:**
```json
{
  "phone": "0901234567",
  "full_name": "Nguyễn Văn A",
  "email": "vana@gmail.com",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "notes": "Khách hàng VIP"
}
```

### 3-8. Other Endpoints
- `GET /customers/:id` - Get customer details
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Soft delete (Owner only)
- `POST /customers/search` - Search by phone/name/email
- `GET /customers/:id/history` - Get visit history
- `POST /customers/check-in` - Check-in at store (public)

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
isValidPhone("123456789")    // → false
```

---

**Last Updated:** January 20, 2026  
**Version:** 1.0.0
