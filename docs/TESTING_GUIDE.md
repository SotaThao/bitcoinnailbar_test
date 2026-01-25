# CUSTOMER API TESTING GUIDE

**Date:** 2026-01-23  
**Purpose:** Step-by-step guide to test Customer Postgres Migration  
**Tool:** Postman

---

## 🚀 SETUP

### **1. Import Postman Collection**

1. Open Postman
2. Click **Import** button
3. Select file: `/docs/CUSTOMER_API_POSTMAN_COLLECTION.json`
4. Collection "Bitcoin Nail Bar - Customer API (Postgres)" will appear

### **2. Configure Environment Variables**

Click **Environments** → **Create Environment** → Name: "Bitcoin Nail Bar Dev"

| Variable | Value | How to Get |
|----------|-------|------------|
| `projectId` | Your Supabase project ID | From Supabase dashboard URL |
| `publicAnonKey` | Your Supabase anon key | Project Settings → API → anon/public |
| `adminToken` | JWT token from login | Login as owner, copy from localStorage |
| `customerId` | UUID from create response | Copy from response after creating customer |

**Example:**
```
projectId: abcdefghijklmnop
publicAnonKey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
adminToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (from login)
customerId: 550e8400-e29b-41d4-a716-446655440000
```

### **3. Run SQL Schema Update**

**⚠️ REQUIRED BEFORE TESTING**

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy content from `/docs/POSTGRES_SCHEMA_UPDATE.sql`
4. Execute the script
5. Verify columns added:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'customer_profiles'
   ORDER BY ordinal_position;
   ```

---

## 📋 TEST SCENARIOS

### **SCENARIO 1: Admin CRUD Operations**

**Goal:** Test all admin endpoints for customer management

#### **Test 1.1: List Customers**
```
Request: GET /customers?page=1&limit=20
Expected: 
  - Status: 200
  - Response has `customers` array
  - Response has `pagination` object
```

**Verify:**
- [ ] Returns array of customers
- [ ] Pagination works (page, limit, totalPages, totalCount)
- [ ] Each customer has `phone_display` (formatted)

#### **Test 1.2: Create Customer**
```
Request: POST /customers
Body: {
  "phone": "5551234567",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "date_of_birth": "1990-01-15",
  "gender": "male",
  "address": "123 Main St",
  "notes": "VIP customer"
}
Expected:
  - Status: 200
  - Response has customer object with UUID
  - total_visits = 0
  - total_spent = 0
```

**Verify:**
- [ ] Customer created with UUID (not phone-based ID)
- [ ] All fields saved correctly
- [ ] Response has `phone_display` formatted
- [ ] Copy `id` to `customerId` environment variable

#### **Test 1.3: Get Customer by ID**
```
Request: GET /customers/{{customerId}}
Expected:
  - Status: 200
  - Returns single customer object
```

**Verify:**
- [ ] Customer details match created data
- [ ] UUID format correct

#### **Test 1.4: Update Customer**
```
Request: PUT /customers/{{customerId}}
Body: {
  "full_name": "John Updated Doe",
  "notes": "Updated notes"
}
Expected:
  - Status: 200
  - Updated fields reflected
```

**Verify:**
- [ ] Fields updated correctly
- [ ] Other fields unchanged
- [ ] `updated_at` timestamp changed

#### **Test 1.5: Delete Customer (Soft)**
```
Request: DELETE /customers/{{customerId}}
Expected:
  - Status: 200
  - Message: "Customer deleted successfully"
```

**Verify:**
- [ ] Customer still in database (soft delete)
- [ ] Status changed to 'suspended'
- [ ] GET /customers does NOT return this customer

#### **Test 1.6: Search Customers**
```
Request: POST /customers/search
Body: {
  "query": "555",
  "limit": 20
}
Expected:
  - Status: 200
  - Returns customers matching query
```

**Verify:**
- [ ] Search by phone works
- [ ] Search by name works
- [ ] Search by email works

---

### **SCENARIO 2: Booking Integration**

**Goal:** Test auto create/update during booking

#### **Test 2.1: New Customer - Pending Appointment**
```
Request: POST /customers/book
Body: {
  "phone": "5559876543",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "appointment_id": "appt_001",
  "appointment_time": "2026-01-25T14:00:00Z",
  "appointment_amount": 75.00,
  "appointment_status": "Pending"
}
Expected:
  - Status: 200
  - Customer created
  - total_visits = 0 (Pending status)
  - total_spent = 0 (Pending status)
  - last_visit = null
```

**✅ CRITICAL VERIFICATION:**
- [ ] `total_visits` = 0 (NOT 1)
- [ ] `total_spent` = 0 (NOT 75)
- [ ] `last_visit` = null

**Business Rule:** Only count if `appointment_status = 'Complete'`

#### **Test 2.2: New Customer - Complete Appointment**
```
Request: POST /customers/book
Body: {
  "phone": "5558765432",
  "full_name": "Mike Johnson",
  "appointment_id": "appt_002",
  "appointment_time": "2026-01-25T10:00:00Z",
  "appointment_amount": 50.00,
  "appointment_status": "Complete"
}
Expected:
  - total_visits = 1 (Complete status)
  - total_spent = 50.00
  - last_visit = "2026-01-25T10:00:00Z"
```

**✅ CRITICAL VERIFICATION:**
- [ ] `total_visits` = 1
- [ ] `total_spent` = 50.00
- [ ] `last_visit` = "2026-01-25T10:00:00Z"

#### **Test 2.3: Existing Customer - Pending Appointment**
```
Request: POST /customers/book
Body: {
  "phone": "5558765432",  (same as 2.2)
  "full_name": "Mike Johnson",
  "appointment_id": "appt_003",
  "appointment_amount": 60.00,
  "appointment_status": "Pending"
}
Expected:
  - total_visits = 1 (unchanged)
  - total_spent = 50.00 (unchanged)
  - last_visit = "2026-01-25T10:00:00Z" (unchanged)
```

**✅ CRITICAL VERIFICATION:**
- [ ] Statistics NOT updated (Pending status)
- [ ] Name/email can be updated

#### **Test 2.4: Existing Customer - Complete Appointment**
```
Request: POST /customers/book
Body: {
  "phone": "5558765432",  (same as 2.2)
  "appointment_id": "appt_004",
  "appointment_amount": 80.00,
  "appointment_status": "Complete"
}
Expected:
  - total_visits = 2 (1 + 1)
  - total_spent = 130.00 (50 + 80)
  - last_visit = new timestamp
```

**✅ CRITICAL VERIFICATION:**
- [ ] `total_visits` incremented (+1)
- [ ] `total_spent` accumulated (+80)
- [ ] `last_visit` updated to new date

#### **Test 2.5: Lookup Customer**
```
Request: GET /customers/lookup/5558765432?appointment_time=2026-01-28T14:00:00Z
Expected:
  - Status: 200
  - found = true
  - Returns customer + membership status
```

**Verify:**
- [ ] Customer found by phone
- [ ] Returns membership if valid
- [ ] `has_valid_membership` flag correct

---

### **SCENARIO 3: Membership Integration**

**Goal:** Test membership activation and stacking logic

#### **Test 3.1: Activate Membership (New Customer)**
```
Request: POST /customers/activate-membership
Body: {
  "phone": "5557654321",
  "customer_name": "Sarah Williams",
  "membership": {
    "id": "gold-1yr",
    "tier": "Gold",
    "amount": 1200,
    "duration": 12
  }
}
Expected:
  - Status: 200
  - Customer created with tier = "Gold"
  - membership_end_date = now + 12 months
  - membership_action = "activated"
```

**Verify:**
- [ ] Customer created
- [ ] tier = "Gold"
- [ ] membership_end_date set correctly
- [ ] status = "active"

#### **Test 3.2: Stack Same Tier**
```
Request: POST /customers/activate-membership
Body: {
  "phone": "5557654321",  (same as 3.1)
  "membership": {
    "tier": "Gold",
    "amount": 600,
    "duration": 6
  }
}
Expected:
  - tier = "Gold" (unchanged)
  - membership_end_date = previous_end_date + 6 months
  - membership_action = "stacked"
```

**✅ CRITICAL VERIFICATION:**
- [ ] tier still "Gold"
- [ ] membership_end_date EXTENDED (not replaced)
- [ ] membership_action = "stacked"

**Business Rule:** Same tier → Stack duration

#### **Test 3.3: Upgrade to Higher Tier**
```
Request: POST /customers/activate-membership
Body: {
  "phone": "5557654321",  (same as 3.1)
  "membership": {
    "tier": "Platinum",
    "amount": 2400,
    "duration": 12
  }
}
Expected:
  - tier = "Platinum" (upgraded)
  - membership_end_date = now + 12 months (new)
  - membership_action = "upgraded"
```

**✅ CRITICAL VERIFICATION:**
- [ ] tier changed to "Platinum"
- [ ] membership_end_date replaced (not stacked)
- [ ] membership_action = "upgraded"

**Business Rule:** Higher amount → Replace

#### **Test 3.4: Check Membership by Phone**
```
Request: GET /customers/membership/5557654321
Expected:
  - has_membership = true
  - is_active = true
  - membership object returned
```

**Verify:**
- [ ] Finds customer by phone
- [ ] Returns current membership
- [ ] is_active flag correct

#### **Test 3.5: Check Membership by Email**
```
Request: GET /customers/membership/sarah.w@example.com
Expected:
  - Same as 3.4
```

**Verify:**
- [ ] Email lookup works
- [ ] Returns same customer

---

## 🎯 EXPECTED RESULTS SUMMARY

### **Booking Logic:**
| Scenario | Status | total_visits | total_spent | last_visit |
|----------|--------|--------------|-------------|------------|
| New customer, Pending | Pending | 0 | 0 | null |
| New customer, Complete | Complete | 1 | amount | timestamp |
| Existing, Pending | Pending | unchanged | unchanged | unchanged |
| Existing, Complete | Complete | +1 | +amount | new timestamp |

### **Membership Logic:**
| Scenario | Action | Result |
|----------|--------|--------|
| No membership → New | activated | Set tier, set end_date |
| Gold → Gold | stacked | Keep tier, extend end_date |
| Gold → Platinum (higher $) | upgraded | Change tier, replace end_date |
| Platinum → Gold (lower $) | kept_existing | Keep Platinum, ignore Gold |

---

## ⚠️ COMMON ISSUES

### **Issue 1: "Column does not exist"**
**Cause:** SQL schema update not run  
**Solution:** Run `/docs/POSTGRES_SCHEMA_UPDATE.sql` in Supabase SQL Editor

### **Issue 2: "Customer not found" with valid phone**
**Cause:** Phone not normalized  
**Solution:** Ensure phone is 10 digits (e.g., "5551234567", not "(555) 123-4567")

### **Issue 3: "Unauthorized"**
**Cause:** Invalid or expired JWT token  
**Solution:** Login again and copy fresh token to `adminToken` variable

### **Issue 4: Stats updating for Pending appointments**
**Cause:** Business logic bug  
**Solution:** Check line in customers_booking_postgres.tsx where `shouldCount` is evaluated

---

## 📊 TEST REPORT TEMPLATE

After testing, fill out:

```
CUSTOMER POSTGRES MIGRATION - TEST REPORT
Date: _______________
Tester: _______________

1. Admin CRUD Operations:
   [ ] 1.1 List Customers - PASS / FAIL
   [ ] 1.2 Create Customer - PASS / FAIL
   [ ] 1.3 Get Customer by ID - PASS / FAIL
   [ ] 1.4 Update Customer - PASS / FAIL
   [ ] 1.5 Delete Customer - PASS / FAIL
   [ ] 1.6 Search Customers - PASS / FAIL

2. Booking Integration:
   [ ] 2.1 New Customer (Pending) - PASS / FAIL
   [ ] 2.2 New Customer (Complete) - PASS / FAIL
   [ ] 2.3 Existing Customer (Pending) - PASS / FAIL
   [ ] 2.4 Existing Customer (Complete) - PASS / FAIL
   [ ] 2.5 Lookup Customer - PASS / FAIL

3. Membership Integration:
   [ ] 3.1 Activate Membership (New) - PASS / FAIL
   [ ] 3.2 Stack Same Tier - PASS / FAIL
   [ ] 3.3 Upgrade to Higher Tier - PASS / FAIL
   [ ] 3.4 Check by Phone - PASS / FAIL
   [ ] 3.5 Check by Email - PASS / FAIL

OVERALL: PASS / FAIL
Issues Found: _______________
```

---

**Last Updated:** 2026-01-23  
**Testing Tool:** Postman  
**Collection:** CUSTOMER_API_POSTMAN_COLLECTION.json
