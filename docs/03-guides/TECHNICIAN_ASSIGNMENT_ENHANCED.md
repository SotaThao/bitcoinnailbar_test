# Technician Assignment System - Enhanced Implementation Plan

**Status:** 🚀 Ready to Implement  
**Priority:** High  
**Option Selected:** **Option 2 (Smart Auto-Assignment + Manual Override with Audit Trail)**  
**Date Created:** 2026-01-28  
**Last Updated:** 2026-01-28

---

## 🎯 Enhanced Requirements

### ✅ Core Features (from Option 2)
1. **Smart Auto-Assignment** - Algorithm-based technician matching
2. **Manual Override** - Admin can reassign technicians
3. **Real-time Scoring** - Show match score for each technician

### 🆕 Additional Requirements (User Request)
4. **Permission-Based Control** - Only authorized roles can change assignments
5. **Reason Tracking** - Mandatory reason when changing technician
6. **Predefined Reason Library** - Admin/Owner can manage reason templates
7. **Change Audit Log** - Full history of who changed what and why
8. **Custom Reason Option** - Allow free-text input if predefined reasons don't fit

---

## 🔐 Permission System Integration

### Current Role System
**Source:** `/supabase/functions/server/roles.tsx`

**Existing Permissions:**
```typescript
{
  id: 'view_staff',
  name: 'View Staff',
  category: 'Staff'
}
{
  id: 'manage_staff',
  name: 'Manage Staff Schedule',
  category: 'Staff'
}
```

### 🆕 New Permission Required
**Add to `AVAILABLE_PERMISSIONS`:**
```typescript
{
  id: 'assign_technicians',
  name: 'Assign Technicians to Appointments',
  category: 'Staff',
  description: 'Allows manual assignment and reassignment of technicians'
}
```

### Authorization Logic
```typescript
// In technician assignment endpoint
const currentUser = c.get('user');

// Check if user has permission
const hasPermission = 
  currentUser.role === 'owner' ||
  currentUser.role === 'admin' ||
  currentUser.permissions?.includes('assign_technicians') ||
  currentUser.permissions?.includes('manage_staff');

if (!hasPermission) {
  return c.json({ 
    success: false, 
    error: 'Unauthorized: You do not have permission to assign technicians' 
  }, 403);
}
```

---

## 📊 Enhanced Data Models

### 1. Assignment Change Reasons (KV Store)

**Key:** `assignment-reason:{id}`  
**Example:** `assignment-reason:1738051200000`

```typescript
interface AssignmentReason {
  id: string;                          // "assignment-reason:1234567890"
  text: string;                        // "Customer requested specific technician"
  category: "customer_request" | "availability" | "skill_match" | "emergency" | "other";
  isActive: boolean;                   // Can be disabled without deleting
  displayOrder: number;                // For sorting in dropdown
  createdBy: string;                   // User ID who created it
  createdByName: string;               // User name for display
  createdAt: string;                   // ISO timestamp
  updatedAt?: string;
}
```

**Default Reasons (Seeded on First Load):**
```typescript
const DEFAULT_REASONS = [
  {
    text: "Customer requested specific technician",
    category: "customer_request",
    displayOrder: 1
  },
  {
    text: "Original technician unavailable",
    category: "availability",
    displayOrder: 2
  },
  {
    text: "Better skill match for service type",
    category: "skill_match",
    displayOrder: 3
  },
  {
    text: "Emergency technician absence",
    category: "emergency",
    displayOrder: 4
  },
  {
    text: "Load balancing across team",
    category: "other",
    displayOrder: 5
  },
  {
    text: "Customer complaint about previous technician",
    category: "customer_request",
    displayOrder: 6
  }
];
```

---

### 2. Assignment Change Log (KV Store)

**Key:** `assignment-log:{appointmentId}:{timestamp}`  
**Example:** `assignment-log:appointment:123:1738051200000`

```typescript
interface AssignmentChangeLog {
  id: string;                          // "assignment-log:appointment:123:1738051200000"
  appointmentId: string;               // "appointment:123"
  
  // Change Details
  fromStaffId: string | null;          // null if initial assignment
  fromStaffName: string | null;        // For display
  toStaffId: string;                   // New technician
  toStaffName: string;                 // For display
  
  // Reason Tracking
  reasonId?: string;                   // ID of predefined reason (if used)
  reasonText: string;                  // Actual reason text (from predefined or custom)
  reasonCategory: string;              // Category of reason
  customReason?: string;               // If user typed custom reason
  
  // Assignment Method
  assignmentMethod: "auto" | "manual"; // How was this assignment made?
  assignmentScore?: number;            // If auto-assigned, what was the score?
  
  // User Tracking
  changedBy: string;                   // User ID who made the change
  changedByName: string;               // User name for audit log
  changedByRole: string;               // User role at time of change
  
  // Metadata
  timestamp: string;                   // ISO timestamp
  ipAddress?: string;                  // Optional: track IP for security
  userAgent?: string;                  // Optional: track device/browser
}
```

---

### 3. Extended Appointment Model

**Existing Appointment + New Fields:**
```typescript
interface Appointment {
  // ... existing fields ...
  
  // Enhanced Assignment Fields
  staffId?: string;
  staffName?: string;
  assignmentMethod?: "auto" | "manual" | "customer_choice";
  assignmentScore?: number;            // Algorithm score (0-100)
  estimatedDuration: number;           // In minutes (for conflict checking)
  
  // Change Tracking
  lastAssignmentChange?: string;       // Timestamp of last change
  assignmentChangeCount: number;       // How many times reassigned
  hasCustomerPreference: boolean;      // Did customer select specific tech?
}
```

---

### 4. Extended Staff Model

**Existing Staff + New Fields:**
```typescript
interface Staff {
  // ... existing fields ...
  
  // Performance Metrics (for auto-assignment algorithm)
  rating?: number;                     // 0-5 scale from customer reviews
  totalIncome?: number;                // Last 30 days revenue
  totalAppointments?: number;          // Last 30 days count
  lastMetricsUpdate?: string;          // When metrics were last calculated
  
  // Availability
  isAvailable: boolean;                // Current availability status
  unavailableUntil?: string;           // ISO timestamp if temporarily unavailable
  unavailableReason?: string;          // "Sick leave", "Vacation", etc.
}
```

---

## 🔧 Backend Implementation

### File Structure
```
/supabase/functions/server/
├── technician-assignment.tsx     ← NEW: Assignment logic & algorithm
├── assignment-reasons.tsx        ← NEW: Reason management CRUD
├── assignment-logs.tsx           ← NEW: Audit log queries
├── appointments.tsx              ← MODIFY: Integrate assignment
├── staff.tsx                     ← MODIFY: Add metrics calculation
└── roles.tsx                     ← MODIFY: Add new permission
```

---

### API Endpoints

#### 📋 Assignment Reasons Management

```typescript
// GET /assignment-reasons - List all active reasons
GET /make-server-89edbd69/assignment-reasons
Response: {
  success: true,
  data: AssignmentReason[]
}

// POST /assignment-reasons - Create new reason (owner/admin only)
POST /make-server-89edbd69/assignment-reasons
Body: {
  text: string,
  category: string,
  displayOrder?: number
}

// PUT /assignment-reasons/:id - Update reason
PUT /make-server-89edbd69/assignment-reasons/:id
Body: {
  text?: string,
  category?: string,
  displayOrder?: number,
  isActive?: boolean
}

// DELETE /assignment-reasons/:id - Soft delete (set isActive = false)
DELETE /make-server-89edbd69/assignment-reasons/:id
```

---

#### 🎯 Technician Assignment

```typescript
// POST /appointments/:id/auto-assign - Auto-assign best technician
POST /make-server-89edbd69/appointments/:appointmentId/auto-assign
Response: {
  success: true,
  data: {
    assignedStaff: Staff,
    score: 87,
    method: "auto",
    changeLogId: string
  }
}

// GET /appointments/:id/available-technicians - List with scores
GET /make-server-89edbd69/appointments/:appointmentId/available-technicians
Response: {
  success: true,
  data: [
    {
      staff: Staff,
      score: 87,
      availability: "available" | "busy" | "unavailable",
      skillMatch: ["Manicure", "Gel Polish"],
      nextAvailable?: string  // ISO timestamp if currently busy
    }
  ]
}

// PUT /appointments/:id/assign-technician - Manual assignment
PUT /make-server-89edbd69/appointments/:appointmentId/assign-technician
Body: {
  staffId: string,
  reasonId?: string,          // ID of predefined reason
  customReason?: string,      // Custom reason if reasonId not used
  overrideConflict?: boolean  // Force assign even if technician is busy
}
Response: {
  success: true,
  data: {
    appointment: Appointment,
    changeLog: AssignmentChangeLog
  }
}
```

---

#### 📜 Assignment Audit Logs

```typescript
// GET /appointments/:id/assignment-logs - Get all changes for appointment
GET /make-server-89edbd69/appointments/:appointmentId/assignment-logs
Response: {
  success: true,
  data: AssignmentChangeLog[]
}

// GET /assignment-logs/recent - Get recent changes across all appointments
GET /make-server-89edbd69/assignment-logs/recent
Query: {
  limit?: number,        // Default: 50
  staffId?: string,      // Filter by technician
  changedBy?: string     // Filter by user who made change
}
```

---

## 🎨 Frontend Implementation

### 1. Assignment Reason Manager (Admin Only)

**File:** `/src/app/components/admin/AssignmentReasonManager.tsx`

**Features:**
- CRUD interface for predefined reasons
- Drag & drop to reorder reasons
- Category filtering
- Activate/Deactivate toggle
- Search reasons

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│ Assignment Reasons Management                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [+ Add New Reason]          [Search: _________]     │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ 📋 Customer Request (3 reasons)             │    │
│ │                                             │    │
│ │ ⋮⋮ Customer requested specific technician  │    │
│ │    [Edit] [🔴 Deactivate]                  │    │
│ │                                             │    │
│ │ ⋮⋮ Customer complaint about previous tech  │    │
│ │    [Edit] [🔴 Deactivate]                  │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ ⚡ Availability (2 reasons)                  │    │
│ │                                             │    │
│ │ ⋮⋮ Original technician unavailable         │    │
│ │    [Edit] [🔴 Deactivate]                  │    │
│ └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

### 2. Enhanced Appointment Card

**File:** `/src/app/components/admin/molecules/AppointmentCard.tsx`

**New Section: Technician Assignment**

```tsx
// In AppointmentCard.tsx

<div className="technician-assignment-section">
  {/* Current Assignment */}
  <div className="current-assignment">
    <label>👤 Assigned Technician:</label>
    
    {appointment.staffName ? (
      <div className="assigned-tech-info">
        <span className="tech-name">{appointment.staffName}</span>
        
        {/* Assignment Method Badge */}
        <Badge variant={
          appointment.assignmentMethod === 'auto' ? 'secondary' : 'default'
        }>
          {appointment.assignmentMethod === 'auto' && '🤖 '}
          {appointment.assignmentMethod === 'manual' && '👤 '}
          {appointment.assignmentMethod === 'customer_choice' && '⭐ '}
          {appointment.assignmentMethod || 'manual'}
        </Badge>
        
        {/* Score (if auto-assigned) */}
        {appointment.assignmentScore && (
          <Tooltip content="Algorithm match score">
            <span className="score">Score: {appointment.assignmentScore}</span>
          </Tooltip>
        )}
      </div>
    ) : (
      <div className="no-assignment">
        <AlertTriangle className="icon" />
        <span>No technician assigned</span>
      </div>
    )}
  </div>
  
  {/* Action Buttons */}
  <div className="assignment-actions">
    <Button 
      variant="outline" 
      onClick={handleChangeAssignment}
      disabled={!hasPermission('assign_technicians')}
    >
      {appointment.staffId ? 'Change Technician' : 'Assign Technician'}
    </Button>
    
    {!appointment.staffId && (
      <Button 
        onClick={handleAutoAssign}
        disabled={!hasPermission('assign_technicians')}
      >
        🤖 Auto-Assign Best Match
      </Button>
    )}
  </div>
  
  {/* Change History Link */}
  {appointment.assignmentChangeCount > 0 && (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleViewHistory}
    >
      📜 View Change History ({appointment.assignmentChangeCount})
    </Button>
  )}
</div>
```

---

### 3. Technician Assignment Modal

**File:** `/src/app/components/admin/TechnicianAssignmentModal.tsx`

**Features:**
- List available technicians with real-time scores
- Filter by availability/specialty
- Mandatory reason selection
- Custom reason input option
- Conflict warning if technician is busy

**UI Mockup:**
```
┌────────────────────────────────────────────────────────┐
│ Assign Technician to Appointment                       │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Customer: John Doe                                     │
│ Services: Manicure + Pedicure                          │
│ Time: Jan 28, 2026 at 2:00 PM                         │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Select Technician:                               │  │
│ │                                                   │  │
│ │ ○ Jennifer Martinez                              │  │
│ │   ⭐ 4.9 • Score: 87 • ✅ Available             │  │
│ │   Specialties: Manicure, Pedicure, Gel Polish   │  │
│ │                                                   │  │
│ │ ● Linda Nguyen                                   │  │
│ │   ⭐ 4.8 • Score: 82 • ✅ Available             │  │
│ │   Specialties: Manicure, Nail Art               │  │
│ │                                                   │  │
│ │ ○ Sarah Johnson                                  │  │
│ │   ⭐ 4.7 • Score: 75 • ⏰ Busy until 3:00 PM    │  │
│ │   Specialties: Pedicure, Spa Treatment          │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Reason for Change: *                             │  │
│ │                                                   │  │
│ │ [Customer requested specific technician      ▼] │  │
│ │                                                   │  │
│ │ ☐ Use custom reason instead                     │  │
│ │ [________________________________]               │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ⚠️ Warning: Sarah is busy until 3:00 PM              │
│    Force assign anyway? ☐                             │
│                                                         │
│ [Cancel]                              [Assign] ←       │
└────────────────────────────────────────────────────────┘
```

---

### 4. Assignment History Modal

**File:** `/src/app/components/admin/AssignmentHistoryModal.tsx`

**Features:**
- Timeline view of all changes
- Show who made each change
- Display reason for each change
- Highlight auto vs manual assignments

**UI Mockup:**
```
┌────────────────────────────────────────────────────────┐
│ Assignment Change History                              │
│ Appointment: John Doe - Jan 28, 2026 at 2:00 PM       │
├────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 🕒 Jan 28, 2026 - 1:45 PM                       │  │
│ │ Changed by: Admin User (admin)                   │  │
│ │                                                   │  │
│ │ Linda Nguyen → Jennifer Martinez (Manual)       │  │
│ │                                                   │  │
│ │ 📝 Reason: Customer requested specific tech     │  │
│ │    (Category: Customer Request)                  │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 🕒 Jan 28, 2026 - 10:30 AM                      │  │
│ │ Changed by: System (auto)                        │  │
│ │                                                   │  │
│ │ (unassigned) → Linda Nguyen (Auto)              │  │
│ │ Score: 82                                        │  │
│ │                                                   │  │
│ │ 📝 Reason: Initial auto-assignment               │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│                                            [Close]      │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 Implementation Workflow

### Phase 1: Backend Foundation (2-3 hours)

**Step 1.1: Add Permission**
```typescript
// /supabase/functions/server/roles.tsx
export const AVAILABLE_PERMISSIONS = [
  // ... existing permissions ...
  { 
    id: 'assign_technicians',
    name: 'Assign Technicians to Appointments',
    category: 'Staff' 
  },
];
```

**Step 1.2: Create Reason Management Module**
- File: `/supabase/functions/server/assignment-reasons.tsx`
- Implement CRUD endpoints
- Seed default reasons on first run

**Step 1.3: Create Assignment Log Module**
- File: `/supabase/functions/server/assignment-logs.tsx`
- Implement log storage & retrieval
- Add pagination for large datasets

**Step 1.4: Create Assignment Logic Module**
- File: `/supabase/functions/server/technician-assignment.tsx`
- Implement scoring algorithm (from Option 2 spec)
- Add conflict detection
- Add permission checks

**Step 1.5: Extend Appointments Module**
- File: `/supabase/functions/server/appointments.tsx`
- Add assignment routes
- Integrate with change logging

**Step 1.6: Update Main Server**
```typescript
// /supabase/functions/server/index.tsx
import assignmentReasonsApp from './assignment-reasons.tsx';
import assignmentLogsApp from './assignment-logs.tsx';
import technicianAssignmentApp from './technician-assignment.tsx';

// Mount routes
app.route('/make-server-89edbd69/assignment-reasons', assignmentReasonsApp);
app.route('/make-server-89edbd69/assignment-logs', assignmentLogsApp);
app.route('/make-server-89edbd69/appointments', technicianAssignmentApp);
```

---

### Phase 2: Frontend UI (3-4 hours)

**Step 2.1: Create Reason Manager Component**
- File: `/src/app/components/admin/AssignmentReasonManager.tsx`
- Admin-only page
- CRUD interface for reasons

**Step 2.2: Create Assignment Modal Component**
- File: `/src/app/components/admin/TechnicianAssignmentModal.tsx`
- Technician selector with scores
- Reason selector (dropdown + custom input)
- Conflict warnings

**Step 2.3: Create History Modal Component**
- File: `/src/app/components/admin/AssignmentHistoryModal.tsx`
- Timeline view
- Audit log display

**Step 2.4: Update Appointment Card**
- File: `/src/app/components/admin/molecules/AppointmentCard.tsx`
- Add technician assignment section
- Add "Change Technician" button
- Add "View History" button
- Permission-based button visibility

**Step 2.5: Add to Admin Navigation**
```typescript
// Add to admin sidebar (if not already there)
{
  label: 'Assignment Reasons',
  path: '/admin/assignment-reasons',
  icon: FileText,
  permission: 'manage_settings'
}
```

---

### Phase 3: Integration & Testing (1-2 hours)

**Step 3.1: Update Booking Flow**
- File: `/src/app/components/pages/BookingPage.tsx`
- Call auto-assign after booking created (if "No Preference")
- Show loading state: "Finding best technician..."
- Show result: "Assigned to Jennifer Martinez (Score: 87)"

**Step 3.2: Permission Seeding**
```sql
-- Add new permission to existing roles
UPDATE role:admin SET permissions = permissions + ['assign_technicians'];
UPDATE role:manager SET permissions = permissions + ['assign_technicians'];
```

**Step 3.3: Testing Checklist**
- [ ] Auto-assignment algorithm returns correct scores
- [ ] Manual assignment requires reason
- [ ] Change log tracks all changes correctly
- [ ] Permission checks work (unauthorized users blocked)
- [ ] Conflict detection works (busy technicians flagged)
- [ ] Custom reason input saves properly
- [ ] History modal shows complete timeline
- [ ] Reason manager CRUD operations work

---

## 📊 KV Store Keys Summary

```
# Assignment Reasons
assignment-reason:{id}                    - Individual reason record

# Assignment Logs
assignment-log:{appointmentId}:{timestamp} - Change log entry

# Extended Existing Keys
appointment:{id}                          - Now includes assignment fields
staff:{id}                                - Now includes rating/metrics
```

---

## 🎯 Success Metrics

After implementation, track:

1. **Assignment Coverage**
   - % of appointments with assigned technicians
   - Before vs After auto-assignment

2. **Manual Override Rate**
   - % of auto-assignments that get manually changed
   - Indicates algorithm accuracy

3. **Reason Usage**
   - Most common reasons for changes
   - Helps identify system issues (e.g., many "unavailable" = scheduling problem)

4. **Income Distribution**
   - Standard deviation of technician income
   - Should decrease if load balancing works

5. **Audit Compliance**
   - 100% of changes should have reason + user tracking
   - For regulatory compliance

---

## 🔐 Security Considerations

1. **Permission Enforcement**
   - Backend validates permission on EVERY assignment change
   - Frontend UI is just a convenience (not security boundary)

2. **Audit Log Immutability**
   - Change logs cannot be edited or deleted
   - Only created (append-only log)

3. **Reason Validation**
   - Custom reasons have max length (500 chars)
   - Sanitize input to prevent injection attacks

4. **Rate Limiting**
   - Prevent abuse: Max 10 assignment changes per minute per user
   - Alert admin if exceeded

---

## 📝 Next Steps

1. **Review & Approve** this enhanced design
2. **Implement Phase 1** (Backend)
3. **Implement Phase 2** (Frontend)
4. **Test with real data**
5. **Deploy to staging**
6. **Train staff on new system**
7. **Monitor metrics**

---

**End of Document**
