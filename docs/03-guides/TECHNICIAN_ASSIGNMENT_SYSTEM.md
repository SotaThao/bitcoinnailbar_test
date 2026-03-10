# Technician Assignment System - Enhancement Plan

**Status:** 📋 Planning Phase  
**Priority:** Medium (defer after other features)  
**Date Created:** 2026-01-28  
**Last Updated:** 2026-01-28

---

## 📌 Background

Trong booking flow hiện tại, customer có thể chọn technician hoặc "No Preference". Tuy nhiên, khi appointments được tạo với "No Preference", hệ thống chưa có logic để:

1. **Manual assign** technicians cho appointments trong Admin Panel
2. **Auto-assign** technicians dựa trên criteria thông minh:
   - Availability (technician available at appointment time)
   - Skill match (specialties phù hợp với service type)
   - Rating (customer reviews tốt)
   - Income balance (cân bằng thu nhập giữa các technician)

---

## 🔍 Current System Analysis

### A. Staff Data Structure

**Storage:** `kv_store_89edbd69` (Admin KV table)  
**Prefix:** `staff:`  
**Source:** `/supabase/functions/server/staff.tsx`

```tsx
interface Staff {
  id: string;                    // "staff:1234567890"
  name: string;                  // "Jennifer Martinez"
  nickname: string;              // "Jenny"
  phone: string;
  email: string;
  role: string;                  // "Lead Technician", "Senior Nail Artist", etc.
  hireDate: string;              // "2023-01-15"
  employmentType: "W2" | "1099";
  licenseNumber: string;         // "CA-NT-987456"
  baseHourlyRate: string;        // "18.00"
  commissionRate: number;        // 0.70 (70%)
  tipSplit: string;              // "100"
  specialties: string[];         // ["Manicure", "Pedicure", "Gel Polish", "Nail Art", "Nail Extension"]
  workingDays: string[];         // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
  updatedAt?: string;
}
```

### B. Appointment Data Structure

**Storage:** `kv_store_89edbd69` (Admin KV table)  
**Prefix:** `appointment:`  
**Current Fields:**

```tsx
interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  services: string[];           // Service IDs
  serviceNames: string[];       // Service names for display
  appointmentTime: string;      // ISO timestamp
  status: "pending" | "confirmed" | "completed" | "cancelled";
  staffId?: string;             // Can be empty if "No Preference"
  staffName?: string;           // Display name (derived from staffId)
  branchId: string;
  notes?: string;
  createdAt: string;
}
```

### C. Booking Flow (Customer Side)

**File:** `/src/app/components/pages/BookingPage.tsx`

1. Step 1: Select Technician
   - Option: "No Preference" (sets `selectedStaff = ""`)
   - Option: Choose specific technician from list
2. Backend Availability Check:
   - Checks if ANY staff is available at selected time slot
3. On Submit:
   - If `selectedStaff` is empty → fallback to `staff[0]?.id` (first available)
   - Creates appointment with `staffId`

**Issues:**
- ⚠️ "No Preference" fallback logic is simplistic (just picks first staff)
- ⚠️ No load balancing
- ⚠️ No skill matching

### D. Admin Appointment Management

**File:** `/src/app/components/admin/molecules/AppointmentCard.tsx`

**Current Display:**
- Shows `staffName` if assigned
- No UI for changing/assigning technician after creation

---

## 🎯 Proposed Solutions

### Option 1: Simple Manual Assignment (Quick Implementation)

**Approach:** Add dropdown select in Admin Appointment Card

**UI Mockup:**
```
┌─────────────────────────────────────┐
│ Customer: John Doe                  │
│ Status: Pending ⏳                  │
│ Services: Manicure + Pedicure       │
│                                     │
│ ⚠️ No Technician Assigned           │
│                                     │
│ [Assign Technician ▼]              │ ← Dropdown select
│   - Jennifer Martinez (⭐ 4.9)     │
│   - Linda Nguyen (⭐ 4.8)          │
│   - Sarah Johnson (⭐ 4.7)         │
│                                     │
│ OR                                  │
│                                     │
│ [🤖 Auto-Assign Best Match]        │ ← Calls algorithm endpoint
└─────────────────────────────────────┘
```

**Implementation Steps:**

1. **Frontend Changes:**
   - Add `<SelectField>` component to `AppointmentCard.tsx`
   - Fetch staff list on component mount
   - Filter available staff (based on `workingDays`)
   - Display staff with rating/specialties

2. **Backend Changes:**
   - Add `PUT /appointments/:id/assign-technician` endpoint
   - Validate staff availability before assignment
   - Update appointment record with new `staffId`

**Pros:**
- ✅ Quick to implement (1-2 hours)
- ✅ Admin has full control
- ✅ No complex algorithm needed initially

**Cons:**
- ❌ Requires manual intervention for every "No Preference" booking
- ❌ Doesn't auto-balance workload
- ❌ Admin needs to remember technician specialties

---

### Option 2: Smart Auto-Assignment + Manual Override (Recommended)

**Approach:** System auto-assigns best technician, admin can override

**Auto-Assignment Algorithm:**

```tsx
/**
 * Calculate technician score for appointment
 * Returns 0-100 score (0 = cannot assign, 100 = perfect match)
 */
function calculateTechnicianScore(
  technician: Staff,
  appointment: Appointment,
  allTechnicians: Staff[]
): number {
  let score = 0;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. AVAILABILITY CHECK (Must Pass)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const appointmentDay = getDayOfWeek(appointment.appointmentTime);
  if (!technician.workingDays.includes(appointmentDay)) {
    return 0; // Cannot assign - not working this day
  }

  // Check for conflicting appointments
  const hasConflict = checkTimeConflict(
    technician.id,
    appointment.appointmentTime,
    appointment.estimatedDuration
  );
  if (hasConflict) {
    return 0; // Cannot assign - already booked
  }

  // Availability passed: +40 base points
  score += 40;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. SKILL MATCH (0-30 points)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const appointmentServices = getServiceDetails(appointment.services);
  const requiredSpecialties = appointmentServices.map(s => s.category);
  
  const matchingSpecialties = requiredSpecialties.filter(specialty =>
    technician.specialties.includes(specialty)
  );
  
  const skillMatchRatio = matchingSpecialties.length / requiredSpecialties.length;
  score += skillMatchRatio * 30;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. RATING (0-15 points)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Assuming rating is 0-5 scale
  // Need to add `rating` field to Staff model
  const rating = technician.rating || 4.0; // Default to 4.0 if not set
  score += (rating / 5) * 15;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. INCOME BALANCE (0-15 points)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Lower income = higher priority (fair distribution)
  const allIncomes = allTechnicians.map(t => t.totalIncome || 0);
  const avgIncome = allIncomes.reduce((a, b) => a + b, 0) / allIncomes.length;
  const techIncome = technician.totalIncome || 0;
  
  // If below average, get bonus points
  if (techIncome < avgIncome) {
    const incomeDiff = avgIncome - techIncome;
    const maxBonus = 15;
    score += Math.min((incomeDiff / avgIncome) * maxBonus, maxBonus);
  }

  return Math.round(score);
}

/**
 * Auto-assign best technician for appointment
 */
async function autoAssignTechnician(appointmentId: string) {
  const appointment = await getAppointment(appointmentId);
  const allTechnicians = await getAllStaff();

  // Calculate scores for all technicians
  const scoredTechnicians = allTechnicians
    .map(tech => ({
      technician: tech,
      score: calculateTechnicianScore(tech, appointment, allTechnicians)
    }))
    .filter(item => item.score > 0) // Remove unavailable technicians
    .sort((a, b) => b.score - a.score); // Sort by score descending

  if (scoredTechnicians.length === 0) {
    throw new Error('No available technicians for this appointment');
  }

  const bestMatch = scoredTechnicians[0];

  // Update appointment
  await updateAppointment(appointmentId, {
    staffId: bestMatch.technician.id,
    staffName: bestMatch.technician.name,
    assignmentMethod: 'auto', // Track how it was assigned
    assignmentScore: bestMatch.score,
  });

  return bestMatch;
}
```

**UI Flow:**

1. **When Appointment is Created (No Preference):**
   - System immediately calls `autoAssignTechnician(appointmentId)`
   - Appointment shows: `✅ Assigned: Jennifer Martinez (Auto • Score: 87)`

2. **Admin Appointment Card:**
   ```
   ┌─────────────────────────────────────┐
   │ Customer: John Doe                  │
   │ Status: Pending ⏳                  │
   │                                     │
   │ 👤 Technician:                      │
   │ ✅ Jennifer Martinez (Auto)         │
   │ Score: 87 • ⭐ 4.9                  │
   │                                     │
   │ [Change Technician ▼]              │ ← Manual override
   │                                     │
   │ OR                                  │
   │                                     │
   │ [🔄 Re-calculate Best Match]       │ ← Re-run algorithm
   └─────────────────────────────────────┘
   ```

3. **Manual Override:**
   - Click "Change Technician" → Shows dropdown
   - Each option shows score in real-time
   - Admin can override system recommendation

**Implementation Steps:**

**Phase 1: Extend Data Models**
1. Add to `Staff` interface:
   ```tsx
   rating?: number;           // 0-5 scale
   totalIncome?: number;      // Last 30 days revenue
   totalAppointments?: number; // Last 30 days count
   ```

2. Add to `Appointment` interface:
   ```tsx
   assignmentMethod?: "auto" | "manual" | "customer_choice";
   assignmentScore?: number;
   ```

**Phase 2: Backend API**
1. Create `/supabase/functions/server/technician-assignment.tsx`
2. Implement scoring algorithm
3. Add routes:
   - `POST /appointments/:id/auto-assign` - Auto-assign best match
   - `PUT /appointments/:id/assign-technician` - Manual assignment
   - `GET /appointments/:id/available-technicians` - List with scores

**Phase 3: Frontend UI**
1. Update `AppointmentCard.tsx`:
   - Show assigned technician with badge (Auto/Manual)
   - Add "Change Technician" button
   - Show assignment score tooltip
2. Create `TechnicianSelector` component:
   - Dropdown with real-time scoring
   - Show availability status
   - Display specialties & rating

**Phase 4: Booking Integration**
1. Update `BookingPage.tsx`:
   - When "No Preference" selected, call auto-assign after booking created
   - Show loading state: "Finding best technician..."
   - Show result: "Assigned to Jennifer Martinez"

**Pros:**
- ✅ Automatic workload balancing
- ✅ Skill-matched assignments
- ✅ Admin can still override
- ✅ Fair income distribution
- ✅ Better customer experience (gets specialist for their service)

**Cons:**
- ❌ More complex to implement (4-6 hours)
- ❌ Requires additional data tracking (rating, income)
- ❌ Algorithm needs tuning based on real usage

---

### Option 3: Hybrid Approach

**Approach:** Auto-assign ONLY for "No Preference", manual assign for unassigned

**Flow:**
1. Customer selects "No Preference" → Auto-assign after booking
2. Customer selects specific technician → Use customer choice
3. Admin can manually reassign at any time

**Best of both worlds:**
- Automatic for most cases
- Respects customer preference
- Admin override always available

---

## 🤔 Decision Points (PENDING USER INPUT)

### Question 2.1: Which Approach?
- [ ] **Option 1** - Simple manual dropdown (faster, 1-2 hours)
- [ ] **Option 2** - Smart auto + manual override (better UX, 4-6 hours)
- [ ] **Option 3** - Hybrid (auto for "No Preference" only)

### Question 2.2: Auto-Assignment Priority Ranking
Rank from 1-4 (1 = most important):

- [ ] **Availability** (technician available at appointment time)
- [ ] **Skill match** (specialties match service type)
- [ ] **Rating** (customer reviews)
- [ ] **Income balance** (fair distribution across team)

**Suggested Default:** 1=Availability, 2=Skill, 3=Income Balance, 4=Rating

### Question 2.3: UI Placement in AppointmentCard
Where should technician assignment UI appear?

- [ ] **Left Column** (with Customer Info)
- [ ] **Right Column** (with Services & Actions)
- [ ] **New Section** at bottom of card (separate from both columns)

**Suggested:** Right Column (keeps customer info clean on left)

### Question 2.4: Additional Data Requirements
Do we need to add these fields?

**To Staff Model:**
- [ ] `rating: number` (0-5 scale from customer reviews)
- [ ] `totalIncome: number` (calculated from appointments)
- [ ] `totalAppointments: number` (count of completed bookings)

**To Appointment Model:**
- [ ] `assignmentMethod: "auto" | "manual" | "customer_choice"`
- [ ] `assignmentScore: number` (for debugging algorithm)
- [ ] `estimatedDuration: number` (in minutes, for conflict checking)

---

## 📋 Technical Implementation Notes

### Backend Files to Modify/Create

1. **Create:** `/supabase/functions/server/technician-assignment.tsx`
   - Scoring algorithm
   - Auto-assignment logic
   - Availability checking

2. **Modify:** `/supabase/functions/server/appointments.tsx`
   - Add assignment routes
   - Integrate with auto-assignment after booking creation

3. **Modify:** `/supabase/functions/server/staff.tsx`
   - Add income calculation helper
   - Add rating aggregation (if reviews system integrated)

### Frontend Files to Modify/Create

1. **Modify:** `/src/app/components/admin/molecules/AppointmentCard.tsx`
   - Add technician assignment UI section
   - Add "Change Technician" button
   - Show assignment method badge

2. **Create:** `/src/app/components/admin/molecules/TechnicianSelector.tsx`
   - Dropdown/Select component
   - Real-time scoring display
   - Availability indicators

3. **Modify:** `/src/app/components/pages/BookingPage.tsx`
   - Integrate auto-assignment after booking (if hybrid approach)
   - Show "Finding best technician..." loading state

### Database Schema Changes

**Staff Extensions (add to existing KV records):**
```tsx
{
  ...existingFields,
  rating: 4.8,                    // Calculated from reviews
  totalIncome: 12500,             // Last 30 days revenue
  totalAppointments: 87,          // Last 30 days count
  lastUpdatedMetrics: "2026-01-28T10:00:00Z"
}
```

**Appointment Extensions:**
```tsx
{
  ...existingFields,
  assignmentMethod: "auto",       // "auto" | "manual" | "customer_choice"
  assignmentScore: 87,            // Algorithm score
  estimatedDuration: 90,          // Minutes
}
```

---

## 🔗 Related Systems

### Dependencies
- **Reviews System** (for technician ratings)
- **Appointment System** (for conflict checking)
- **Staff & Payroll** (for income calculations)

### Future Enhancements
- **Real-time Availability Calendar** (visual schedule view)
- **Technician Preferences** (e.g., preferred service types)
- **Customer-Technician History** (assign previous technician if available)
- **Multi-Technician Appointments** (for services requiring 2+ technicians)

---

## 📊 Success Metrics (Post-Implementation)

After implementing this system, track:

1. **Assignment Rate:**
   - % of appointments with assigned technicians
   - Before vs After comparison

2. **Manual Override Rate:**
   - % of auto-assignments that admin overrides
   - Indicates algorithm accuracy

3. **Income Distribution:**
   - Standard deviation of technician income
   - Lower = better balance

4. **Customer Satisfaction:**
   - Technician skill match rating
   - Customer feedback on assigned technician

---

## ⏰ Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | Extend data models | 30 min |
| **Phase 2** | Backend API & algorithm | 2-3 hours |
| **Phase 3** | Frontend UI components | 2-3 hours |
| **Phase 4** | Integration & testing | 1-2 hours |
| **Total** | | **5-8 hours** |

---

## 🚀 Next Steps (When Ready)

1. **Decision:** User confirms Option 1, 2, or 3
2. **Priority Ranking:** User provides scoring weights
3. **Implementation:** Follow phased approach
4. **Testing:** Verify with real appointment data
5. **Iteration:** Adjust algorithm based on admin feedback

---

**End of Document**
