# BOOKING & CUSTOMER LOGIC SPECIFICATION

## Overview
System quản lý customer data với accumulation logic cho bookings, visits, và spending.

---

## 1. CUSTOMER STATISTICS TRACKING

### Core Metrics
```typescript
interface CustomerStats {
  total_visits: number;      // Số lần hoàn thành appointment
  total_spent: number;       // Tổng số tiền đã chi (USD)
  last_visit: string | null; // ISO timestamp của visit gần nhất
  appointment_ids: string[]; // Array of all appointment IDs
}
```

---

## 2. APPOINTMENT STATUS FLOW

### Status Lifecycle
```
Pending → Confirmed → Complete
            ↓
        Cancelled
```

### Status Definitions

| Status | Description | Count Visit? | Count Spent? |
|--------|-------------|--------------|--------------|
| `Pending` | Chờ xác nhận | ❌ No | ❌ No |
| `Confirmed` | Đã xác nhận | ❌ No | ❌ No |
| `Complete` | Đã hoàn thành | ✅ Yes | ✅ Yes |
| `Cancelled` | Đã hủy | ❌ No | ❌ No |

**⚠️ Critical Rule:** Chỉ `Complete` status mới được tính vào visits và spent.

---

## 3. BOOKING CREATION LOGIC

### New Booking (Customer Creation)

**Scenario:** Customer booking lần đầu

```typescript
// Input
{
  phone: "5551234567",
  full_name: "John Doe",
  appointment_id: "apt_123",
  appointment_time: "2025-01-25T10:00:00Z",
  appointment_amount: 50,
  appointment_status: "pending"
}

// Output
{
  id: "customer_us:5551234567",
  phone: "5551234567",
  full_name: "John Doe",
  total_visits: 0,        // ← 0 vì pending
  total_spent: 0,         // ← 0 vì pending
  last_visit: null,       // ← null vì chưa complete
  appointment_ids: ["apt_123"]
}
```

---

### Existing Customer (Update)

**Scenario:** Customer đã tồn tại, booking thêm

**Current State:**
```json
{
  "id": "customer_us:5551234567",
  "total_visits": 2,
  "total_spent": 100,
  "last_visit": "2025-01-15T10:00:00Z",
  "appointment_ids": ["apt_001", "apt_002"]
}
```

**New Booking:**
```json
{
  "appointment_id": "apt_003",
  "appointment_amount": 50,
  "appointment_status": "pending"
}
```

**Updated State:**
```json
{
  "id": "customer_us:5551234567",
  "total_visits": 2,                    // ← KHÔNG thay đổi (pending)
  "total_spent": 100,                   // ← KHÔNG thay đổi (pending)
  "last_visit": "2025-01-15T10:00:00Z", // ← KHÔNG thay đổi
  "appointment_ids": ["apt_001", "apt_002", "apt_003"]  // ← ADD mới
}
```

---

## 4. APPOINTMENT STATUS UPDATE LOGIC

### Status Change: Pending → Complete

**Before:**
```json
{
  "total_visits": 2,
  "total_spent": 100,
  "last_visit": "2025-01-15T10:00:00Z"
}
```

**Event:** Appointment `apt_003` ($50) status changed to `Complete`

**After:**
```json
{
  "total_visits": 3,                    // ← +1
  "total_spent": 150,                   // ← +50
  "last_visit": "2025-01-25T10:00:00Z"  // ← Updated
}
```

---

### Status Change: Confirmed → Cancelled

**Before:**
```json
{
  "total_visits": 3,
  "total_spent": 150,
  "appointment_ids": ["apt_001", "apt_002", "apt_003"]
}
```

**Event:** Appointment `apt_003` ($50, was Confirmed) → `Cancelled`

**After:**
```json
{
  "total_visits": 3,    // ← KHÔNG thay đổi (chưa count vào)
  "total_spent": 150,   // ← KHÔNG thay đổi
  "appointment_ids": ["apt_001", "apt_002", "apt_003"]  // ← Giữ ID
}
```

---

### Status Change: Complete → Cancelled (Refund Case)

**Before:**
```json
{
  "total_visits": 3,
  "total_spent": 150,
  "last_visit": "2025-01-25T10:00:00Z"
}
```

**Event:** Appointment `apt_003` ($50, was Complete) → `Cancelled`

**After:**
```json
{
  "total_visits": 2,    // ← -1 (subtract)
  "total_spent": 100,   // ← -50 (subtract)
  "last_visit": "2025-01-15T10:00:00Z"  // ← Revert to previous
}
```

**⚠️ Important:** Cần track appointment status để biết khi nào subtract.

---

## 5. ACCUMULATION RULES

### Rule 1: Additive Only for Complete
```
✅ Status = Complete → ADD to total_visits, total_spent
❌ Status ≠ Complete → DO NOT add
```

### Rule 2: Never Overwrite, Always Accumulate
```typescript
// ❌ WRONG
customer.total_spent = appointment_amount;

// ✅ CORRECT  
customer.total_spent += appointment_amount;
```

### Rule 3: Track All Appointments
```typescript
// Always add appointment_id regardless of status
customer.appointment_ids.push(appointment_id);
```

---

## 6. IMPLEMENTATION PSEUDOCODE

### Create/Update Customer on Booking

```typescript
async function handleBooking(bookingData: BookingData) {
  const { phone, appointment_id, appointment_amount, appointment_status } = bookingData;
  
  // 1. Find existing customer
  const customer = await findByPhone(phone);
  
  if (customer) {
    // 2. Update existing customer
    
    // Add appointment ID
    customer.appointment_ids.push(appointment_id);
    
    // Only count if Complete
    if (appointment_status === 'Complete') {
      customer.total_visits += 1;
      customer.total_spent += appointment_amount;
      customer.last_visit = bookingData.appointment_time;
    }
    
    customer.updated_at = now();
    await save(customer);
    
  } else {
    // 3. Create new customer
    const newCustomer = {
      id: `customer_us:${phone}`,
      phone,
      full_name: bookingData.full_name,
      total_visits: appointment_status === 'Complete' ? 1 : 0,
      total_spent: appointment_status === 'Complete' ? appointment_amount : 0,
      last_visit: appointment_status === 'Complete' ? bookingData.appointment_time : null,
      appointment_ids: [appointment_id],
      created_at: now()
    };
    
    await save(newCustomer);
  }
}
```

---

### Update Customer on Status Change

```typescript
async function handleStatusChange(
  appointment_id: string, 
  oldStatus: string, 
  newStatus: string,
  amount: number,
  timestamp: string
) {
  const customer = await findByAppointmentId(appointment_id);
  
  // Old status was Complete → subtract
  if (oldStatus === 'Complete') {
    customer.total_visits -= 1;
    customer.total_spent -= amount;
    // Optionally: recalculate last_visit from remaining appointments
  }
  
  // New status is Complete → add
  if (newStatus === 'Complete') {
    customer.total_visits += 1;
    customer.total_spent += amount;
    customer.last_visit = timestamp;
  }
  
  await save(customer);
}
```

---

## 7. EDGE CASES

### Case 7.1: Multiple Bookings Same Day
```
Customer books 3 appointments same day:
- Apt 1: Complete ($50)
- Apt 2: Complete ($30)
- Apt 3: Pending ($40)

Result:
- total_visits = 2
- total_spent = $80
- appointment_ids = 3 items
```

### Case 7.2: Booking + Immediate Cancel
```
1. Book appointment ($50) → Status: Pending
   - total_spent = 0 (not counted yet)
2. Cancel immediately → Status: Cancelled
   - total_spent = 0 (nothing to subtract)
```

### Case 7.3: Complete → Refund → Rebook
```
1. Complete ($50)
   - total_visits = 1, total_spent = $50
2. Cancelled (refund)
   - total_visits = 0, total_spent = $0
3. Rebook + Complete ($50)
   - total_visits = 1, total_spent = $50
```

### Case 7.4: Historical Data Correction
```
Customer có 10 appointments:
- 7 Complete
- 2 Cancelled
- 1 Pending

Correct values:
- total_visits = 7
- total_spent = sum of 7 Complete appointments only
```

---

## 8. DATABASE CONSISTENCY CHECKS

### Validation Query
```sql
-- Check if total_visits matches Complete appointments
SELECT 
  customer_id,
  total_visits,
  (SELECT COUNT(*) FROM appointments 
   WHERE customer_id = c.id AND status = 'Complete') as actual_visits
FROM customers c
WHERE total_visits != actual_visits;
```

### Recalculation Script
```typescript
async function recalculateCustomerStats(customerId: string) {
  const customer = await getCustomer(customerId);
  const appointments = await getAppointments(customer.appointment_ids);
  
  const completedAppointments = appointments.filter(a => a.status === 'Complete');
  
  customer.total_visits = completedAppointments.length;
  customer.total_spent = completedAppointments.reduce((sum, a) => sum + a.amount, 0);
  customer.last_visit = completedAppointments
    .sort((a, b) => new Date(b.time) - new Date(a.time))[0]?.time || null;
  
  await save(customer);
}
```

---

## 9. TESTING SCENARIOS

### Test 1: First Time Booking (Pending)
```
Given: Customer chưa tồn tại
When: Book appointment ($50, Pending)
Then: 
  - total_visits = 0
  - total_spent = 0
  - appointment_ids.length = 1
```

### Test 2: Complete Appointment
```
Given: Customer có total_visits=2, total_spent=$100
When: Appointment status changed to Complete ($50)
Then:
  - total_visits = 3
  - total_spent = $150
```

### Test 3: Cancel Before Complete
```
Given: Appointment in Pending status
When: Status changed to Cancelled
Then: No change to total_visits or total_spent
```

### Test 4: Refund After Complete
```
Given: Appointment was Complete ($50), counted in stats
When: Status changed to Cancelled (refund)
Then:
  - total_visits -= 1
  - total_spent -= $50
```

---

## 10. MIGRATION CONSIDERATIONS

### Existing Data Fix
```typescript
// Script to fix existing customers with wrong data
async function fixCustomerData() {
  const customers = await getAllCustomers();
  
  for (const customer of customers) {
    const appointments = await getAppointmentsByIds(customer.appointment_ids);
    
    // Recalculate from scratch
    const completed = appointments.filter(a => a.status === 'Complete');
    
    customer.total_visits = completed.length;
    customer.total_spent = completed.reduce((sum, a) => sum + a.amount, 0);
    customer.last_visit = completed
      .sort((a, b) => new Date(b.time) - new Date(a.time))[0]?.time || null;
    
    await save(customer);
    console.log(`Fixed customer ${customer.id}`);
  }
}
```

---

**Last Updated:** 2025-01-23  
**Version:** 1.0  
**Author:** System Documentation
