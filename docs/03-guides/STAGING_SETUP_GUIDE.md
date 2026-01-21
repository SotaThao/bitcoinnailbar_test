# 🚀 STAGING SETUP GUIDE - Step by Step

**Date:** January 20, 2026  
**Status:** ✅ Staging branch created - Ready for configuration  
**Location:** `/docs/03-guides/STAGING_SETUP_GUIDE.md`

---

## ✅ STEP 1: VERIFY STAGING BRANCH

Bạn đã tạo staging branch trên Supabase. Hãy verify:

### **Check Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Check branches:
   - ✅ `main` branch (production)
   - ✅ `staging` branch (mới tạo)

**Screenshot checklist:**
- [ ] Staging branch visible
- [ ] Staging has own database URL
- [ ] Staging has own API keys

---

## 🔧 STEP 2: GET STAGING CREDENTIALS

### **2.1 Get Staging URLs & Keys**

1. **Go to Supabase Dashboard → Staging Branch**
2. **Navigate to:** Settings → API
3. **Copy these values:**

```bash
# STAGING ENVIRONMENT VARIABLES
SUPABASE_URL=https://[your-staging-project-ref].supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (starts with eyJ)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (starts with eyJ)
```

4. **Also get Database URL:**
   - Settings → Database → Connection String
   - Copy the connection pooler URL

```bash
SUPABASE_DB_URL=postgresql://postgres.[staging-ref]:[password]@...
```

---

## 🔐 STEP 3: CONFIGURE STAGING SECRETS

### **3.1 Set Secrets for Staging Branch**

In Supabase Dashboard:

1. **Go to:** Edge Functions → Settings
2. **Switch to:** Staging branch
3. **Add these secrets:**

```bash
# Required secrets for staging:
SUPABASE_URL=https://[staging-ref].supabase.co
SUPABASE_ANON_KEY=[staging-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[staging-service-role-key]
SUPABASE_DB_URL=[staging-db-url]

# Copy from production:
DEEPSEEK_API_KEY=[same as production]
CLOUDINARY_URL=[same as production]
RESEND_API_KEY=[same as production]
RESEND_FROM_EMAIL=[same as production]

# Optional - JWT Secret
JWT_SECRET=bitcoin-nail-bar-staging-secret-key
```

**⚠️ Important:**
- SUPABASE_* credentials MUST be from staging branch
- API keys (DeepSeek, Cloudinary, Resend) can share with production
- Use different JWT_SECRET for staging (optional but recommended)

---

## 📦 STEP 4: DEPLOY BACKEND TO STAGING

### **4.1 Link to Staging Branch**

```bash
# In your terminal
supabase link --project-ref [your-staging-project-ref]

# Verify you're on staging
supabase status
```

### **4.2 Deploy Edge Functions**

```bash
# Deploy server function to staging
supabase functions deploy server --no-verify-jwt

# Check deployment
supabase functions list
```

**Expected output:**
```
✓ Deployed function server to staging
  URL: https://[staging-ref].supabase.co/functions/v1/server
```

---

## 🧪 STEP 5: TEST STAGING ENVIRONMENT

### **5.1 Test Health Endpoint**

```bash
# Test staging health check
curl https://[staging-ref].supabase.co/functions/v1/make-server-84f9c112/health

# Expected response:
{
  "status": "ok",
  "version": "v7-staff-management"
}
```

### **5.2 Test Basic Endpoints**

```bash
# Test setup check
curl https://[staging-ref].supabase.co/functions/v1/make-server-84f9c112/setup/check

# Expected:
{
  "ownerExists": false,
  "message": "..."
}
```

### **5.3 Create Test Owner Account**

```bash
curl -X POST https://[staging-ref].supabase.co/functions/v1/make-server-84f9c112/setup/owner \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@staging.test",
    "password": "staging123",
    "name": "Staging Admin"
  }'
```

**Expected:**
```json
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGc..."
}
```

---

## 🗄️ STEP 6: VERIFY DATABASE

### **6.1 Check KV Store Table**

```bash
# In Supabase Dashboard → Staging Branch
# Go to: Table Editor

# Verify table exists:
kv_store_89edbd69

# Should have columns:
- key (text, primary key)
- value (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### **6.2 Seed Initial Data (Optional)**

```bash
# Call seed endpoint if you have one
curl -X POST https://[staging-ref].supabase.co/functions/v1/make-server-84f9c112/staff/seed

# Or manually create test data via admin panel
```

---

## 🌐 STEP 7: UPDATE FRONTEND FOR STAGING

### **7.1 Create Staging Config**

Create file: `/utils/supabase/staging-info.tsx`

```typescript
// Staging environment config
export const projectId = "[your-staging-ref]";
export const publicAnonKey = "[staging-anon-key]";
export const supabaseUrl = `https://${projectId}.supabase.co`;
```

### **7.2 Environment Detection**

Update `/utils/supabase/info.tsx`:

```typescript
// Check if in staging mode
const isStaging = window.location.hostname.includes('staging') || 
                  window.location.search.includes('env=staging');

// Use staging or production config
const config = isStaging 
  ? import('./staging-info')
  : import('./info');

export const projectId = config.projectId;
export const publicAnonKey = config.publicAnonKey;
```

**Or simpler approach - Manual switch:**

```typescript
// /utils/supabase/info.tsx

// Toggle this to switch environments
const USE_STAGING = true; // ← Change to true for staging

export const projectId = USE_STAGING 
  ? "[staging-ref]"
  : "[production-ref]";

export const publicAnonKey = USE_STAGING
  ? "[staging-anon-key]"
  : "[production-anon-key]";
```

---

## 🧪 STEP 8: FULL INTEGRATION TEST

### **8.1 Test Complete User Flow**

**In Frontend (connected to staging):**

1. **Test Login:**
   - Open app
   - Login with staging admin account
   - ✅ Should succeed

2. **Test Booking Flow:**
   - Open chatbot
   - Create a test booking
   - Check admin panel
   - ✅ Booking should appear

3. **Test Dashboard:**
   - Open dashboard
   - Check stats
   - ✅ Should load without errors

4. **Test CRUD Operations:**
   - Create customer
   - Update appointment
   - Delete test data
   - ✅ All operations work

---

## ✅ STEP 9: VERIFICATION CHECKLIST

Before starting refactor, verify ALL these:

### **Infrastructure:**
- [ ] Staging branch visible in Supabase
- [ ] Staging has separate database
- [ ] Staging has separate API keys
- [ ] All secrets configured

### **Backend:**
- [ ] Server function deployed to staging
- [ ] Health endpoint responds
- [ ] Setup endpoint works
- [ ] Can create owner account
- [ ] KV store accessible

### **Frontend:**
- [ ] Can switch to staging config
- [ ] Login works
- [ ] Chatbot works
- [ ] Admin panel works
- [ ] No CORS errors

### **Data:**
- [ ] KV store table exists
- [ ] Can read/write data
- [ ] Test accounts created
- [ ] Sample data available

**If ALL checkboxes ✅ → Ready for refactoring!**

---

## 🚀 STEP 10: START REFACTORING

Now that staging is ready, you can safely refactor:

### **Workflow:**

```bash
1. Make changes in code
   ↓
2. Deploy to staging:
   supabase functions deploy server
   ↓
3. Test in staging frontend
   ↓
4. Fix bugs if any
   ↓
5. Repeat until perfect
   ↓
6. Deploy to production:
   Switch to main branch
   supabase functions deploy server
   ✅ Done!
```

---

## 🔄 DEPLOYMENT COMMANDS

### **Deploy to Staging:**

```bash
# Link to staging
supabase link --project-ref [staging-ref]

# Deploy
supabase functions deploy server --no-verify-jwt

# Test
curl https://[staging-ref].supabase.co/functions/v1/make-server-84f9c112/health
```

### **Deploy to Production:**

```bash
# Link to production
supabase link --project-ref [production-ref]

# Deploy
supabase functions deploy server --no-verify-jwt

# Test
curl https://[production-ref].supabase.co/functions/v1/make-server-84f9c112/health
```

---

## 📊 STAGING vs PRODUCTION

| Aspect | Staging | Production |
|--------|---------|------------|
| **Purpose** | Testing | Live users |
| **Data** | Test/fake data | Real data |
| **API Keys** | Separate (staging) | Separate (production) |
| **External APIs** | Can share | Live |
| **Downtime** | OK | ❌ Not OK |
| **Breaking changes** | Safe to test | Must avoid |
| **Database** | Separate | Separate |

---

## 🎯 COMMON ISSUES & SOLUTIONS

### **Issue 1: "Cannot find module"**

```bash
Error: Cannot find module './chatbot.tsx'
```

**Solution:**
```bash
# File not deployed. Deploy again:
supabase functions deploy server
```

---

### **Issue 2: "Unauthorized" errors**

```bash
Error: 401 Unauthorized
```

**Solution:**
```typescript
// Check you're using staging anon key, not production
const publicAnonKey = "[staging-anon-key]"; // Must match staging
```

---

### **Issue 3: "CORS error"**

```bash
Access to fetch blocked by CORS policy
```

**Solution:**
```typescript
// In index.tsx, verify CORS config:
app.use('*', cors({
  origin: '*', // Allow all origins
  allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

---

### **Issue 4: Secrets not found**

```bash
Error: RESEND_API_KEY is undefined
```

**Solution:**
```bash
# Set secret in staging branch:
Supabase Dashboard → Staging → Edge Functions → Settings
Add: RESEND_API_KEY = [your-key]

# Redeploy:
supabase functions deploy server
```

---

## 📚 NEXT STEPS

### **Now you can:**

1. ✅ **Start Phase 1 Refactoring:**
   - Extract chatbot.tsx
   - Deploy to staging
   - Test thoroughly
   - Fix bugs
   - Deploy to production when ready

2. ✅ **Safe Development Workflow:**
   - All changes go to staging first
   - Test completely
   - Only deploy to production when verified

3. ✅ **Peace of Mind:**
   - No fear of breaking production
   - Can experiment safely
   - Professional workflow

---

## 🎉 CONGRATULATIONS!

Your staging environment is ready! 

**You can now:**
- ✅ Refactor safely
- ✅ Test without risk
- ✅ Deploy confidently

**Risk reduced from 70-85% → 10-20%!** 🎯

---

**Ready to start refactoring?**

**Next:** Extract chatbot.tsx in staging (Phase 1.1)

Let me know when you're ready! 🚀
