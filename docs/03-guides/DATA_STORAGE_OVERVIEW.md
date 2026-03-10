# Data Storage Architecture - Bitcoin Nail Bar

**Last Updated:** 2026-01-28  
**Status:** ✅ Current System

---

## 🗄️ Storage Systems Overview

Bitcoin Nail Bar sử dụng **2 storage systems**:

### 1. **Supabase Postgres Database**
- Customer profiles
- Customer bookings history
- Customer membership data

### 2. **Supabase KV Store (Key-Value Store)**
- Admin/backend operational data
- Public/homepage content data

---

## 📊 KV Store Tables

Hệ thống có **2 KV tables riêng biệt**:

### **Table 1: `kv_store_89edbd69` (Admin/Backend Data)**

**Purpose:** Admin operations, backend management, authentication

**Data Stored:**

| **Category** | **Prefix** | **Example Key** | **Description** |
|-------------|-----------|----------------|----------------|
| **Staff** | `staff:` | `staff:1738051200000` | Technician/staff information |
| **Appointments** | `appointment:` | `appointment:1738051200000` | Booking appointments |
| **Assignment Reasons** | `assignment-reason:` | `assignment-reason:1738051200000` | Predefined reasons for technician changes |
| **Assignment Logs** | `assignment-log:` | `assignment-log:appointment:123:1738051200000` | Audit logs for technician assignments |
| **VLinkPay Settings** | `vlinkpay-settings:` | `vlinkpay-settings:default` | Payment gateway configuration |
| **Redeem Codes** | `redeem:` | `redeem:ABC123` | Membership redeem codes |
| **Membership Data** | `membership:` | `membership:user123` | User membership records |
| **Payment Records** | `payment:` | `payment:1738051200000` | Payment transaction history |
| **User Management** | `user:` | `user:user123` | Admin/staff user accounts |
| **Roles** | `role:` | `role:admin` | User roles & permissions |
| **Auth Tokens** | `auth:` | `auth:token123` | Authentication tokens |
| **Payroll** | `payroll:` | `payroll:1738051200000` | Payroll records |
| **Events** | `event:` | `event:1738051200000` | Calendar events |

---

### **Table 2: `kv_store_84f9c112` (Homepage/Public Data)**

**Purpose:** Public-facing content, website data

**Data Stored:**

| **Category** | **Prefix** | **Example Key** | **Description** |
|-------------|-----------|----------------|----------------|
| **Service Menu** | `settings:service-menu` | `settings:service-menu` | Service categories & pricing |
| **Gallery** | `gallery:` | `gallery:image123` | Salon photos |
| **Gallery Logo** | `gallery-logo:` | `gallery-logo:settings` | Gallery watermark settings |
| **Promotions** | `promotion:` | `promotion:1738051200000` | Special offers & promotions |
| **Branches** | `branch:` | `branch:downtown` | Salon locations |
| **Reviews** | `review:` | `review:1738051200000` | Customer reviews |
| **Settings** | `settings:` | `settings:general` | Public site configuration |

---

## 🔍 How to Identify Which Table to Use

### **Use `kv_store_89edbd69` (Admin) when:**
- ✅ Data is for internal operations
- ✅ Data requires authentication/authorization
- ✅ Data contains sensitive information (payments, staff, redeem codes)
- ✅ Data is for admin panel only

### **Use `kv_store_84f9c112` (Homepage) when:**
- ✅ Data is displayed on public website
- ✅ No authentication required to view
- ✅ Data is for customers to browse (services, gallery, promotions)

---

## 💾 Postgres Database Schema

**Table: `customer_profiles`**

Used for customer management (migrated from KV store to Postgres in Phase 3).

```sql
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  
  -- Membership
  membership_tier VARCHAR(50),
  membership_id VARCHAR(100),
  membership_start_date TIMESTAMPTZ,
  membership_end_date TIMESTAMPTZ,
  membership_points INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ,
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Legacy
  legacy_customer_id VARCHAR(100)
);
```

---

## 📂 Backend Code References

### **KV Store Helpers** (`/supabase/functions/server/_shared_kv.tsx`)

```typescript
import { kvAdmin } from './_shared_kv.tsx';     // For kv_store_89edbd69
import { kvHomepage } from './_shared_kv.tsx';  // For kv_store_84f9c112

// Example usage:
const staff = await kvAdmin.getByPrefix('staff:');
const gallery = await kvHomepage.getByPrefix('gallery:');
```

### **Constants** (`/supabase/functions/server/_shared_constants.tsx`)

```typescript
export const KV_TABLE_ADMIN = "kv_store_89edbd69";
export const KV_TABLE_HOMEPAGE = "kv_store_84f9c112";
```

---

## 🎯 Technician Assignment System Storage

### **NEW: Assignment Data** (Added 2026-01-28)

All technician assignment data uses **`kv_store_89edbd69` (Admin table)**:

| **Data Type** | **Prefix** | **Example** |
|--------------|-----------|------------|
| Assignment Reasons | `assignment-reason:` | `assignment-reason:1738051200000` |
| Assignment Logs | `assignment-log:` | `assignment-log:appointment:123:1738051200000` |
| Staff (Technicians) | `staff:` | `staff:1738051200000` |
| Appointments | `appointment:` | `appointment:1738051200000` |

### **Data Relationships:**

```
Staff (technician)
  ├─ id: "staff:1738051200000"
  ├─ name: "Jennifer Martinez"
  ├─ specialties: ["Manicure", "Pedicure"]
  └─ rating: 4.9

Appointment
  ├─ id: "appointment:1738051200000"
  ├─ staffId: "staff:1738051200000"          ← References Staff.id
  ├─ staffName: "Jennifer Martinez"
  ├─ assignmentMethod: "auto" | "manual"
  └─ assignmentScore: 87

Assignment Log
  ├─ id: "assignment-log:appointment:123:1738051200000"
  ├─ appointmentId: "appointment:123"        ← References Appointment.id
  ├─ fromStaffId: "staff:111"
  ├─ toStaffId: "staff:222"                  ← References Staff.id
  ├─ reasonId: "assignment-reason:456"       ← References AssignmentReason.id
  └─ changedBy: "user:admin"
```

---

## 🚨 Critical Reminders

### **NEVER MIX THE TWO KV TABLES!**

❌ **WRONG:**
```typescript
// Saving staff data to homepage table
await kvHomepage.set('staff:123', staffData);  // NO!
```

✅ **CORRECT:**
```typescript
// Saving staff data to admin table
await kvAdmin.set('staff:123', staffData);     // YES!
```

### **Data Migration Checklist:**

When adding new features, ask:

1. **Is this data sensitive?** → Use `kv_store_89edbd69`
2. **Is this for public display?** → Use `kv_store_84f9c112`
3. **Does it involve customers?** → Check if Postgres `customer_profiles` is better
4. **Does it need audit logs?** → Store in `kv_store_89edbd69` with change tracking

---

## 📋 Quick Reference: Data Location Lookup

Need to find where specific data is stored? Use this table:

| **What I Need** | **Storage** | **Key/Table** |
|----------------|------------|---------------|
| Technician list | KV Admin | `staff:*` |
| Appointment details | KV Admin | `appointment:*` |
| Assignment history | KV Admin | `assignment-log:*` |
| Assignment reasons | KV Admin | `assignment-reason:*` |
| Customer profile | Postgres | `customer_profiles` table |
| Service menu | KV Homepage | `settings:service-menu` |
| Gallery photos | KV Homepage | `gallery:*` |
| Promotions | KV Homepage | `promotion:*` |
| Payment records | KV Admin | `payment:*` |
| Redeem codes | KV Admin | `redeem:*` |
| User accounts | KV Admin | `user:*` |
| Roles & permissions | KV Admin | `role:*` |

---

## 🔧 Common Operations

### **Get All Technicians:**
```typescript
const staff = await kvAdmin.getByPrefix('staff:');
```

### **Get Single Appointment:**
```typescript
const appointment = await kvAdmin.get('appointment:1738051200000');
```

### **Get Assignment Logs for Appointment:**
```typescript
const logs = await kvAdmin.getByPrefix('assignment-log:appointment:123:');
```

### **Get Customer Profile from Postgres:**
```typescript
const supabase = getSupabaseClient();
const { data, error } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('phone', customerPhone)
  .single();
```

---

## 📊 Storage Size Estimates (Current)

| **Table** | **Approx Records** | **Primary Data** |
|----------|-------------------|------------------|
| `kv_store_89edbd69` | ~1000-5000 | Staff, Appointments, Payments, Auth |
| `kv_store_84f9c112` | ~500-1000 | Services, Gallery, Promotions |
| `customer_profiles` (Postgres) | ~500-2000 | Customer data |

---

**End of Document**
