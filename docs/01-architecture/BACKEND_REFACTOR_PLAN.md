# 🔧 KẾ HOẠCH REFACTOR BACKEND INDEX.TSX

**Date:** January 20, 2026  
**Status:** 🚧 **READY TO START**  
**Location:** `/docs/01-architecture/BACKEND_REFACTOR_PLAN.md`

---

## 📊 CURRENT STATE ANALYSIS

### **File Size:**
- **Total Lines:** 3,574 dòng code
- **Total Endpoints:** 88 endpoints
- **Major Sections:** 25 sections
- **Complexity:** 🔴 **CRITICAL - Cần refactor ngay**

### **Current Modularization:** ✅
Already extracted to separate files:
1. ✅ `auth.tsx` - Authentication & User Management
2. ✅ `customers.tsx` - Customer management
3. ✅ `roles.tsx` - RBAC roles & permissions
4. ✅ `membership.tsx` - Membership tiers
5. ✅ `promotions.tsx` - Promotions management

**Remaining in index.tsx: ~3,000 lines** ❌

---

## 🗂️ BREAKDOWN BY SECTION

### **1. Helper Functions (~300 lines)**
**Lines:** 142-292
**Contains:**
- `generateUserId()`, `generateSessionToken()`
- JWT functions: `generateJWT()`, `verifyJWT()`
- Email functions: `sendEmail()`, `sendBookingConfirmationEmail()`
- Appointment helper: `createAppointment()`

**Status:** Can be extracted ⚠️

---

### **2. Setup & Debug Endpoints (~200 lines)**
**Lines:** 802-1000
**Endpoints:**
- `GET /setup/check`
- `GET /debug/users`
- `GET /debug/sessions`
- `POST /setup/owner`
- `GET /debug/data-check`
- `POST /debug/clean-*`
- `POST /debug/cleanup-duplicates`

**Status:** Should be extracted to `debug.tsx` ⚠️

---

### **3. Service Management (~700 lines)**
**Lines:** 1067-1270
**Endpoints:**
- `POST /branches`
- `POST /services`
- `DELETE /services/:id`
- `DELETE /branches/:id`
- `POST /staff`
- `POST /staff/seed`
- `POST /reviews`

**Status:** Should be extracted to `services.tsx` 🔴

---

### **4. Appointments (~150 lines)**
**Lines:** 1329-1460
**Endpoints:**
- `POST /appointments`
- `GET /appointments`
- `GET /appointments/:id`
- `PUT /appointments/:id`
- `POST /check-in`

**Status:** Should be extracted to `appointments.tsx` ⚠️

---

### **5. Dashboard & Stats (~160 lines)**
**Lines:** 1498-1660
**Endpoints:**
- `GET /dashboard/stats`

**Contains:**
- Complex aggregation logic
- Revenue calculations
- Appointment metrics
- Staff performance

**Status:** Should be extracted to `dashboard.tsx` ⚠️

---

### **6. Payroll Logic (~80 lines)**
**Lines:** 1988-2070
**Endpoints:**
- `POST /payroll/calculate`

**Status:** Should be extracted to `payroll.tsx` ⚠️

---

### **7. Analytics (~50 lines)**
**Lines:** 2071-2120
**Endpoints:**
- `GET /analytics/revenue`

**Status:** Can merge with dashboard.tsx or separate ⚠️

---

### **8. File Upload (~60 lines)**
**Lines:** 2120-2160
**Endpoints:**
- `POST /upload`

**Contains:**
- Cloudinary integration
- File validation

**Status:** Should be extracted to `upload.tsx` ⚠️

---

### **9. AI CHATBOT (~490 lines) 🔴 LARGEST**
**Lines:** 2160-2649
**Endpoints:**
- `POST /chat`

**Contains:**
- DeepSeek API integration
- Tool definitions (11 tools)
- Conversation management
- Smart upselling logic
- Membership tier fetching

**Status:** 🔴 **MUST extract to `chatbot.tsx`** - PRIORITY #1

---

### **10. Service Menu Settings (~75 lines)**
**Lines:** 2649-2724
**Endpoints:**
- `GET /settings/service-menu`
- `PUT /settings/service-menu`

**Status:** Can extract to `settings.tsx` ⚠️

---

### **11. Service Categories (~185 lines)**
**Lines:** 2724-2909
**Endpoints:**
- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`
- `PUT /categories/reorder`

**Status:** Should merge with `services.tsx` ⚠️

---

### **12. Menu Image Management (~282 lines)**
**Lines:** 2909-3191
**Endpoints:**
- `GET /menu-images`
- `POST /menu-images/upload`
- `DELETE /menu-images/:publicId`
- `PUT /menu-images/reorder`
- `PUT /menu-images/:id`

**Contains:**
- Cloudinary integration
- Image upload/delete
- Image management

**Status:** Should extract to `menu-images.tsx` ⚠️

---

### **13. Homepage Settings (~176 lines)**
**Lines:** 3191-3367
**Endpoints:**
- `GET /settings/homepage/menu-mode`
- `PUT /settings/homepage/menu-mode`
- `GET /settings/homepage/gallery`
- `PUT /settings/homepage/gallery`

**Status:** Can merge with `settings.tsx` ⚠️

---

### **14. Availability Check (~140 lines)**
**Lines:** 3367-3508
**Endpoints:**
- `POST /appointments/availability`

**Contains:**
- Time slot checking
- Staff availability logic

**Status:** Should merge with `appointments.tsx` ⚠️

---

### **15. Startup Logic (~60 lines)**
**Lines:** 3508-3574
**Contains:**
- `seedBuiltInRoles()`
- Server initialization
- `Deno.serve(app.fetch)`

**Status:** Keep in index.tsx ✅

---

## 🎯 REFACTORING PLAN - 3 PHASES

### **📌 PHASE 1: Extract Large Modules** (Priority - 2 hours)

**Target:** Reduce index.tsx by ~1,200 lines

#### **1.1 Extract Chatbot** 🔴 **HIGHEST PRIORITY**
**File:** `/supabase/functions/server/chatbot.tsx`
**Lines to move:** 2160-2649 (~490 lines)
**Why:** Largest single module, self-contained

**What to extract:**
```typescript
// chatbot.tsx
export const chatbotApp = new Hono();

chatbotApp.post("/make-server-84f9c112/chat", async (c) => {
  // All chatbot logic here
  // DeepSeek API
  // Tool definitions
  // Conversation handling
});

export default chatbotApp;
```

**Import in index.tsx:**
```typescript
import { chatbotApp } from './chatbot.tsx';
app.route('/', chatbotApp);
```

---

#### **1.2 Extract Services Management**
**File:** `/supabase/functions/server/services.tsx`
**Lines to move:** 1067-1270 + 2724-2909 (~900 lines total)
**Combines:** Services + Categories

**What to extract:**
```typescript
// services.tsx
export const servicesApp = new Hono();

// Services CRUD
servicesApp.post("/make-server-84f9c112/services", ...);
servicesApp.delete("/make-server-84f9c112/services/:id", ...);

// Categories CRUD  
servicesApp.get("/make-server-84f9c112/categories", ...);
servicesApp.post("/make-server-84f9c112/categories", ...);
servicesApp.put("/make-server-84f9c112/categories/:id", ...);
servicesApp.delete("/make-server-84f9c112/categories/:id", ...);
servicesApp.put("/make-server-84f9c112/categories/reorder", ...);

// Branches
servicesApp.post("/make-server-84f9c112/branches", ...);
servicesApp.delete("/make-server-84f9c112/branches/:id", ...);

// Staff
servicesApp.post("/make-server-84f9c112/staff", ...);
servicesApp.post("/make-server-84f9c112/staff/seed", ...);

// Reviews
servicesApp.post("/make-server-84f9c112/reviews", ...);

export default servicesApp;
```

---

#### **1.3 Extract Menu Images**
**File:** `/supabase/functions/server/menu-images.tsx`
**Lines to move:** 2909-3191 (~282 lines)

**What to extract:**
```typescript
// menu-images.tsx
export const menuImagesApp = new Hono();

menuImagesApp.get("/make-server-84f9c112/menu-images", ...);
menuImagesApp.post("/make-server-84f9c112/menu-images/upload", ...);
menuImagesApp.delete("/make-server-84f9c112/menu-images/:publicId", ...);
menuImagesApp.put("/make-server-84f9c112/menu-images/reorder", ...);
menuImagesApp.put("/make-server-84f9c112/menu-images/:id", ...);

export default menuImagesApp;
```

---

**Phase 1 Result:**
- ✅ Chatbot extracted: -490 lines
- ✅ Services extracted: -900 lines
- ✅ Menu Images extracted: -282 lines
- **Total reduction: ~1,672 lines**
- **New index.tsx size: ~1,900 lines**

---

### **📌 PHASE 2: Extract Medium Modules** (1.5 hours)

**Target:** Reduce index.tsx by another ~800 lines

#### **2.1 Extract Appointments**
**File:** `/supabase/functions/server/appointments.tsx`
**Lines to move:** 292-799 (createAppointment helper) + 1329-1460 + 3367-3508
**Total:** ~600 lines

**What to extract:**
```typescript
// appointments.tsx
export const appointmentsApp = new Hono();

// Helper function
async function createAppointment(data: any) { ... }

// Endpoints
appointmentsApp.post("/make-server-84f9c112/appointments", ...);
appointmentsApp.get("/make-server-84f9c112/appointments", ...);
appointmentsApp.get("/make-server-84f9c112/appointments/:id", ...);
appointmentsApp.put("/make-server-84f9c112/appointments/:id", ...);
appointmentsApp.post("/make-server-84f9c112/check-in", ...);
appointmentsApp.post("/make-server-84f9c112/appointments/availability", ...);

export default appointmentsApp;
```

---

#### **2.2 Extract Dashboard & Analytics**
**File:** `/supabase/functions/server/dashboard.tsx`
**Lines to move:** 1498-2120 (~620 lines)
**Combines:** Dashboard stats + Analytics + Payroll

**What to extract:**
```typescript
// dashboard.tsx
export const dashboardApp = new Hono();

dashboardApp.get("/make-server-84f9c112/dashboard/stats", ...);
dashboardApp.post("/make-server-84f9c112/payroll/calculate", ...);
dashboardApp.get("/make-server-84f9c112/analytics/revenue", ...);

export default dashboardApp;
```

---

**Phase 2 Result:**
- ✅ Appointments extracted: -600 lines
- ✅ Dashboard extracted: -620 lines
- **Total reduction: ~1,220 lines**
- **New index.tsx size: ~680 lines**

---

### **📌 PHASE 3: Final Cleanup** (1 hour)

**Target:** Reduce index.tsx to ~200 lines (routing only)

#### **3.1 Extract Settings**
**File:** `/supabase/functions/server/settings.tsx`
**Lines to move:** 1460-1498 + 2649-2724 + 3191-3367 (~400 lines)

**What to extract:**
```typescript
// settings.tsx
export const settingsApp = new Hono();

// Social Media
settingsApp.get("/make-server-84f9c112/settings/social-media", ...);
settingsApp.put("/make-server-84f9c112/settings/social-media", ...);

// Service Menu
settingsApp.get("/make-server-84f9c112/settings/service-menu", ...);
settingsApp.put("/make-server-84f9c112/settings/service-menu", ...);

// Homepage
settingsApp.get("/make-server-84f9c112/settings/homepage/menu-mode", ...);
settingsApp.put("/make-server-84f9c112/settings/homepage/menu-mode", ...);
settingsApp.get("/make-server-84f9c112/settings/homepage/gallery", ...);
settingsApp.put("/make-server-84f9c112/settings/homepage/gallery", ...);

export default settingsApp;
```

---

#### **3.2 Extract Debug/Setup**
**File:** `/supabase/functions/server/debug.tsx`
**Lines to move:** 802-1000 + 1661-1893 (~400 lines)

**What to extract:**
```typescript
// debug.tsx
export const debugApp = new Hono();

debugApp.get("/make-server-84f9c112/setup/check", ...);
debugApp.post("/make-server-84f9c112/setup/owner", ...);
debugApp.get("/make-server-84f9c112/debug/users", ...);
debugApp.get("/make-server-84f9c112/debug/sessions", ...);
debugApp.get("/make-server-84f9c112/debug/data-check", ...);
debugApp.post("/make-server-84f9c112/debug/clean-appointments", ...);
debugApp.post("/make-server-84f9c112/debug/clean-staff", ...);
debugApp.post("/make-server-84f9c112/debug/cleanup-duplicates", ...);
debugApp.post("/make-server-84f9c112/debug/cleanup-duplicates-v2", ...);

export default debugApp;
```

---

#### **3.3 Extract Upload**
**File:** `/supabase/functions/server/upload.tsx`
**Lines to move:** 2120-2160 (~60 lines)

**What to extract:**
```typescript
// upload.tsx
export const uploadApp = new Hono();

uploadApp.post("/make-server-84f9c112/upload", async (c) => {
  // Cloudinary upload logic
});

export default uploadApp;
```

---

#### **3.4 Create Helpers Module**
**File:** `/supabase/functions/server/helpers.tsx`
**Lines to move:** 142-292 (~150 lines)

**What to extract:**
```typescript
// helpers.tsx
export const generateUserId = () => crypto.randomUUID();
export const generateSessionToken = () => crypto.randomUUID();
export const validateEmail = (email: string) => { ... };

// JWT
export const generateJWT = async (user: User): Promise<string> => { ... };
export const verifyJWT = async (token: string) => { ... };

// Email
export const sendEmail = async (to: string, subject: string, html: string) => { ... };
export const sendBookingConfirmationEmail = async (...) => { ... };
```

---

**Phase 3 Result:**
- ✅ Settings extracted: -400 lines
- ✅ Debug extracted: -400 lines
- ✅ Upload extracted: -60 lines
- ✅ Helpers extracted: -150 lines
- **Total reduction: ~1,010 lines**
- **Final index.tsx size: ~200 lines** ✅

---

## 📂 FINAL STRUCTURE

```
/supabase/functions/server/
├── index.tsx               (~200 lines) ✅ Main router
├── kv_store.tsx            (Protected) ✅ Already exists
│
├── helpers.tsx             (~150 lines) ✨ NEW
├── initial_services.ts     ✅ Already exists
│
├── auth.tsx                ✅ Already exists
├── customers.tsx           ✅ Already exists
├── roles.tsx               ✅ Already exists
├── membership.tsx          ✅ Already exists
├── promotions.tsx          ✅ Already exists
│
├── chatbot.tsx             (~500 lines) ✨ NEW - PRIORITY #1
├── services.tsx            (~900 lines) ✨ NEW
├── appointments.tsx        (~600 lines) ✨ NEW
├── dashboard.tsx           (~620 lines) ✨ NEW
├── settings.tsx            (~400 lines) ✨ NEW
├── menu-images.tsx         (~280 lines) ✨ NEW
├── upload.tsx              (~60 lines)  ✨ NEW
└── debug.tsx               (~400 lines) ✨ NEW
```

**Total files:** 17 modules  
**Average file size:** ~300 lines  
**index.tsx final size:** ~200 lines (93% reduction from 3,574) 🎉

---

## 🎯 FINAL INDEX.TSX STRUCTURE

After all refactoring, index.tsx should look like this:

```typescript
// index.tsx (~200 lines)
import { Hono } from 'npm:hono@4.6.14';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Import all modules
import { authApp } from './auth.tsx';
import { customersApp } from './customers.tsx';
import rolesApp from './roles.tsx';
import { membershipRoutes } from './membership.tsx';
import { promotionsApp } from './promotions.tsx';
import { chatbotApp } from './chatbot.tsx';
import { servicesApp } from './services.tsx';
import { appointmentsApp } from './appointments.tsx';
import { dashboardApp } from './dashboard.tsx';
import { settingsApp } from './settings.tsx';
import { menuImagesApp } from './menu-images.tsx';
import { uploadApp } from './upload.tsx';
import { debugApp } from './debug.tsx';

// Supabase client setup
const supabase = createClient(...);

// KV store setup
const kv = { ... };

// Create app
const app = new Hono();

// Middleware
app.use('*', logger(console.log));
app.use('*', cors({ ... }));

// Health check
app.get("/make-server-84f9c112/health", (c) => 
  c.json({ status: "ok", version: "v8-modular-architecture" })
);

// Mount all modules
app.route('/', authApp);
app.route('/', customersApp);
app.route('/', rolesApp);
app.route('/', membershipRoutes);
app.route('/', promotionsApp);
app.route('/', chatbotApp);
app.route('/', servicesApp);
app.route('/', appointmentsApp);
app.route('/', dashboardApp);
app.route('/', settingsApp);
app.route('/', menuImagesApp);
app.route('/', uploadApp);
app.route('/', debugApp);

// Startup logic
async function seedBuiltInRoles() { ... }

seedBuiltInRoles().catch(console.error);

// Start server
Deno.serve(app.fetch);
```

**Total:** ~200 lines ✅

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Large Modules (2 hours)**
- [ ] Create `chatbot.tsx` (490 lines)
  - [ ] Extract POST /chat endpoint
  - [ ] Move tool definitions
  - [ ] Move DeepSeek integration
  - [ ] Test chatbot functionality
  
- [ ] Create `services.tsx` (900 lines)
  - [ ] Extract services CRUD
  - [ ] Extract categories CRUD
  - [ ] Extract branches CRUD
  - [ ] Extract staff management
  - [ ] Test all service endpoints
  
- [ ] Create `menu-images.tsx` (280 lines)
  - [ ] Extract menu image endpoints
  - [ ] Move Cloudinary integration
  - [ ] Test image upload/delete

**Checkpoint:** Test all Phase 1 modules ✅

---

### **Phase 2: Medium Modules (1.5 hours)**
- [ ] Create `appointments.tsx` (600 lines)
  - [ ] Move createAppointment helper
  - [ ] Extract appointment CRUD
  - [ ] Extract check-in endpoint
  - [ ] Extract availability check
  - [ ] Test booking flow
  
- [ ] Create `dashboard.tsx` (620 lines)
  - [ ] Extract dashboard stats
  - [ ] Extract payroll logic
  - [ ] Extract analytics
  - [ ] Test all calculations

**Checkpoint:** Test all Phase 2 modules ✅

---

### **Phase 3: Final Cleanup (1 hour)**
- [ ] Create `settings.tsx` (400 lines)
  - [ ] Extract social media settings
  - [ ] Extract service menu settings
  - [ ] Extract homepage settings
  - [ ] Test all settings endpoints
  
- [ ] Create `debug.tsx` (400 lines)
  - [ ] Extract setup endpoints
  - [ ] Extract debug endpoints
  - [ ] Extract cleanup utilities
  - [ ] Test debug tools
  
- [ ] Create `upload.tsx` (60 lines)
  - [ ] Extract upload endpoint
  - [ ] Test file upload
  
- [ ] Create `helpers.tsx` (150 lines)
  - [ ] Extract utility functions
  - [ ] Extract JWT helpers
  - [ ] Extract email helpers
  - [ ] Update imports across all files

**Checkpoint:** Test entire backend ✅

---

### **Final Verification**
- [ ] All endpoints working
- [ ] No broken imports
- [ ] No duplicate code
- [ ] Clean index.tsx (~200 lines)
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Full integration test

---

## 🚨 IMPORTANT NOTES

### **1. Shared Dependencies**
Some modules need shared utilities. Create `/supabase/functions/server/shared/`:

```typescript
// shared/types.ts
export interface User { ... }
export interface Appointment { ... }

// shared/constants.ts
export const KV_TABLE = "kv_store_89edbd69";
export const JWT_SECRET = ...;

// shared/supabase.ts
export const supabase = createClient(...);
export const kv = { ... };
```

### **2. Import Pattern**
Each module should follow this pattern:

```typescript
// module-name.tsx
import { Hono } from 'npm:hono@4.6.14';
import { supabase, kv } from './shared/supabase.ts';
import { generateJWT } from './helpers.tsx';

export const moduleApp = new Hono();

// Routes here...

export default moduleApp;
```

### **3. Testing Strategy**
After each phase:
1. ✅ Run health check
2. ✅ Test affected endpoints manually
3. ✅ Check logs for errors
4. ✅ Verify frontend still works

### **4. Rollback Plan**
- Keep original index.tsx as `index.tsx.backup`
- Test in staging first
- Can revert quickly if issues found

---

## ⏱️ TIME ESTIMATE

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1** | Extract 3 large modules | 2 hours |
| **Phase 2** | Extract 2 medium modules | 1.5 hours |
| **Phase 3** | Extract 4 small modules + helpers | 1 hour |
| **Testing** | Integration testing | 0.5 hours |
| **Total** | Complete refactor | **5 hours** |

---

## 🎯 SUCCESS METRICS

### **Before Refactor:**
- ❌ 3,574 lines in one file
- ❌ 88 endpoints in index.tsx
- ❌ Hard to maintain
- ❌ Hard to find code
- ❌ Merge conflicts likely

### **After Refactor:**
- ✅ ~200 lines in index.tsx (93% reduction)
- ✅ 17 well-organized modules
- ✅ Average 300 lines per module
- ✅ Easy to maintain
- ✅ Easy to find code
- ✅ Clean architecture
- ✅ Minimal merge conflicts

---

## 🚀 RECOMMENDATION

**Start with Phase 1, Module 1.1: Chatbot** 🔴

**Why:**
1. ✅ Largest single module (~490 lines)
2. ✅ Self-contained (minimal dependencies)
3. ✅ Easy to test independently
4. ✅ Immediate 14% reduction
5. ✅ Low risk

**After chatbot success:**
- Continue with Phase 1 (services, menu-images)
- Then Phase 2 (appointments, dashboard)
- Finally Phase 3 (settings, debug, upload, helpers)

---

## 📊 PROGRESS TRACKING

Create a tracking doc to monitor progress:

```markdown
## Refactor Progress

### Phase 1: Large Modules
- [ ] chatbot.tsx (0%)
- [ ] services.tsx (0%)
- [ ] menu-images.tsx (0%)

### Phase 2: Medium Modules
- [ ] appointments.tsx (0%)
- [ ] dashboard.tsx (0%)

### Phase 3: Small Modules
- [ ] settings.tsx (0%)
- [ ] debug.tsx (0%)
- [ ] upload.tsx (0%)
- [ ] helpers.tsx (0%)

**Overall Progress:** 0/9 modules (0%)
**Lines Reduced:** 0/3,374 (0%)
```

---

**Status:** ✅ **PLAN READY - Awaiting Approval to Start**  
**Estimated Completion:** 5 hours of focused work  
**Risk Level:** 🟡 Medium (mitigated by phased approach + testing)

**Ready to begin? Tôi recommend bắt đầu với Chatbot extraction ngay!** 🚀
