# 🎨 Staging Setup - Visual Flowchart

---

## 🗺️ OVERVIEW - 6 BƯỚC CHÍNH

```
┌─────────────────────────────────────────────────────────────┐
│                  STAGING SETUP PROCESS                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌──────────────────────────────────────┐
        │  1️⃣  INSTALL SUPABASE CLI           │
        │  npm install -g supabase             │
        │  ⏱️  30 seconds                       │
        └──────────────────┬───────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │  2️⃣  LOGIN TO SUPABASE               │
        │  supabase login                      │
        │  ⏱️  30 seconds                       │
        └──────────────────┬───────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │  3️⃣  LINK YOUR PROJECT               │
        │  supabase link --project-ref XXX     │
        │  ⏱️  1 minute                         │
        └──────────────────┬───────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │  4️⃣  ENABLE BRANCHING                │
        │  Dashboard → Enable Branching        │
        │  ⏱️  1 minute                         │
        └──────────────────┬───────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │  5️⃣  CREATE STAGING BRANCH           │
        │  supabase branches create staging    │
        │  ⏱️  2 minutes                        │
        └──────────────────┬───────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │  6️⃣  CONFIGURE & DEPLOY              │
        │  Set secrets + Deploy function       │
        │  ⏱️  5 minutes                        │
        └──────────────────┬───────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │  ✅ STAGING READY!                   │
        └──────────────────────────────────────┘
```

---

## 🔄 DETAILED FLOW - BƯỚC 1: INSTALL CLI

```
┌─────────────────────────────────────────────────┐
│  START: Install Supabase CLI                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  Check Node.js       │
        │  node --version      │
        └──────┬───────────────┘
               │
               ↓
        ┌────────────────┐
        │  >= 18?        │
        └────┬───────┬───┘
             │ NO    │ YES
             ↓       ↓
    ┌────────────┐  ┌──────────────────────┐
    │ Install    │  │  npm install -g      │
    │ Node.js    │  │  supabase            │
    │ >= 18      │  └──────────┬───────────┘
    └──────┬─────┘             │
           │                   │
           └───────────────────┘
                     │
                     ↓
        ┌──────────────────────────┐
        │  Verify Installation     │
        │  supabase --version      │
        └──────────┬───────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  Shows version?      │
        └────┬───────────┬─────┘
             │ NO        │ YES
             ↓           ↓
    ┌────────────────┐  ┌────────────┐
    │ Check PATH     │  │  ✅ DONE   │
    │ Restart shell  │  └────────────┘
    └────────────────┘
```

---

## 🔄 DETAILED FLOW - BƯỚC 4: ENABLE BRANCHING

```
┌──────────────────────────────────────────────────┐
│  START: Enable Branching in Dashboard           │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│  1. Open Supabase Dashboard                    │
│     https://supabase.com/dashboard             │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│  2. Select Your Project                        │
│     "Bitcoin Nail Bar"                         │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│  3. Navigate to Settings                       │
│     Settings → General                         │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│  4. Find "Preview Branches" Section            │
│     Scroll down                                │
└────────────────┬───────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────┐
│  5. Check Current Status                       │
└────┬──────────────────────────┬────────────────┘
     │ Already Enabled          │ Not Enabled
     ↓                          ↓
┌─────────────────┐   ┌──────────────────────────┐
│ ✅ Skip to      │   │ Click "Enable Branching" │
│    Next Step    │   └──────────┬───────────────┘
└─────────────────┘              │
                                 ↓
                    ┌──────────────────────────────┐
                    │ Confirmation Popup Appears   │
                    │ "Enable Preview Branches?"   │
                    └──────────┬───────────────────┘
                               │
                               ↓
                    ┌──────────────────────────────┐
                    │ Click "Enable Branching"     │
                    └──────────┬───────────────────┘
                               │
                               ↓
                    ┌──────────────────────────────┐
                    │ ⏳ Provisioning...            │
                    │    (30-60 seconds)           │
                    └──────────┬───────────────────┘
                               │
                               ↓
                    ┌──────────────────────────────┐
                    │ ✅ Branching Enabled!        │
                    └──────────┬───────────────────┘
                               │
                               ↓
        ┌────────────────────────────────────────┐
        │  6. Verify in CLI                      │
        │     supabase branches list             │
        └────────────────┬───────────────────────┘
                         │
                         ↓
        ┌────────────────────────────────────┐
        │  Expected: Shows "main" branch     │
        │  ✅ Ready to create staging        │
        └────────────────────────────────────┘
```

---

## 🔄 DETAILED FLOW - BƯỚC 5: CREATE STAGING

```
┌──────────────────────────────────────────────┐
│  START: Create Staging Branch                │
└──────────────┬───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│  Run Command:                                │
│  supabase branches create staging            │
└──────────────┬───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│  ⏳ Provisioning Infrastructure               │
│     - Creating database                      │
│     - Setting up API endpoints               │
│     - Generating keys                        │
│     (2-3 minutes)                            │
└──────────────┬───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│  ✅ Branch Created Successfully!              │
│  Terminal shows configuration details        │
└──────────────┬───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│  🚨 CRITICAL: Copy These Values IMMEDIATELY  │
│                                              │
│  1. Project Ref: xyz789staging               │
│  2. API URL: https://xyz789staging...        │
│  3. Anon Key: eyJhbGci...                    │
│  4. Service Role Key: eyJhbGci...            │
│  5. Database URL: postgresql://...           │
└──────────────┬───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│  Save to Safe Location:                      │
│  - Notepad/Text file                         │
│  - Password manager                          │
│  - .env.staging file (next step)             │
└──────────────┬───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│  Verify Creation:                            │
│  supabase branches list                      │
└──────────────┬───────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│  Expected Output:                            │
│  ┌────────┬────────┬──────────────┐          │
│  │ NAME   │ STATUS │ CREATED AT   │          │
│  ├────────┼────────┼──────────────┤          │
│  │ main   │ ACTIVE │ ...          │          │
│  │ staging│ ACTIVE │ ...          │          │
│  └────────┴────────┴──────────────┘          │
│                                              │
│  ✅ 2 branches shown → Success!              │
└──────────────────────────────────────────────┘
```

---

## 🔄 DETAILED FLOW - BƯỚC 6: CONFIGURE SECRETS

```
┌──────────────────────────────────────────────────┐
│  START: Configure Secrets                       │
└──────────────┬───────────────────────────────────┘
               │
               ↓
      ┌────────────────────┐
      │  Choose Method:    │
      └────┬──────────┬────┘
           │          │
    Option A      Option B
    Dashboard       CLI
           │          │
           ↓          ↓
┌────────────────┐  ┌──────────────────────┐
│ Via Dashboard  │  │  Via Terminal        │
└────┬───────────┘  └─────┬────────────────┘
     │                    │
     ↓                    │
┌──────────────────────┐  │
│ 1. Open Dashboard    │  │
│ 2. Edge Functions    │  │
│ 3. Switch to staging │  │
│ 4. Click "Secrets"   │  │
│ 5. Add each secret:  │  │
│    - DEEPSEEK_API_KEY│  │
│    - CLOUDINARY_URL  │  │
│    - RESEND_API_KEY  │  │
│    - RESEND_FROM...  │  │
│    - JWT_SECRET      │  │
└──────────┬───────────┘  │
           │              │
           │              ↓
           │   ┌──────────────────────────┐
           │   │ Run 5 commands:          │
           │   │ supabase secrets set ... │
           │   │ (one per secret)         │
           │   └──────────┬───────────────┘
           │              │
           └──────────────┘
                  │
                  ↓
       ┌──────────────────────────┐
       │  Verify Secrets Set:     │
       │  supabase secrets list   │
       │  --project-ref STAGING   │
       └──────────┬───────────────┘
                  │
                  ↓
       ┌──────────────────────────┐
       │  Shows 5 secrets?        │
       └────┬──────────────┬──────┘
            │ NO           │ YES
            ↓              ↓
    ┌───────────────┐  ┌────────────┐
    │ Re-add        │  │  ✅ DONE   │
    │ missing ones  │  └────────────┘
    └───────────────┘
```

---

## 🔄 COMPLETE WORKFLOW - PRODUCTION vs STAGING

```
┌─────────────────────────────────────────────────────────────┐
│              DEVELOPMENT WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  1. Write Code  │
│  (Local)        │
└────────┬────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│  2. Test Locally                         │
│     npm run dev                          │
└────────┬─────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│  3. Deploy to STAGING                    │
│     npm run deploy:staging               │
└────────┬─────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│  4. Test in Staging Environment          │
│     https://STAGING_REF.supabase.co/...  │
└────────┬─────────────────────────────────┘
         │
         ↓
    ┌─────────────┐
    │  Tests OK?  │
    └──┬───────┬──┘
       │ NO    │ YES
       ↓       ↓
┌──────────┐  ┌────────────────────────────┐
│ Fix bugs │  │  5. Deploy to PRODUCTION   │
│ Go to #1 │  │     npm run deploy:prod    │
└────┬─────┘  └─────────┬──────────────────┘
     │                  │
     └──────────────────┘
                        │
                        ↓
            ┌──────────────────────────┐
            │  6. Monitor Production   │
            │     Check logs           │
            └──────────────────────────┘
```

---

## 📊 BRANCHING STRUCTURE

```
┌────────────────────────────────────────────────────────────┐
│                    SUPABASE PROJECT                        │
└────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ↓                           ↓
    ┌───────────────────────┐   ┌───────────────────────┐
    │    MAIN BRANCH        │   │   STAGING BRANCH      │
    │  (Production)         │   │   (Testing)           │
    ├───────────────────────┤   ├───────────────────────┤
    │ Project Ref: abc123   │   │ Project Ref: xyz789   │
    │ URL: abc123.supabase  │   │ URL: xyz789.supabase  │
    │                       │   │                       │
    │ Database: Production  │   │ Database: Isolated    │
    │ Data: Real customers  │   │ Data: Test data       │
    │                       │   │                       │
    │ Secrets:              │   │ Secrets:              │
    │ - PROD API keys       │   │ - STAGING API keys    │
    │ - PROD credentials    │   │ - TEST credentials    │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                ↓                           ↓
    ┌───────────────────────┐   ┌───────────────────────┐
    │  Edge Functions       │   │  Edge Functions       │
    │  - make-server (v10)  │   │  - make-server (v1)   │
    │  - Stable version     │   │  - Testing version    │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                ↓                           ↓
    ┌───────────────────────┐   ┌───────────────────────┐
    │  Real Users           │   │  Developers           │
    │  - Customers          │   │  - Testing features   │
    │  - Admin panel        │   │  - Debugging          │
    │  - Live bookings      │   │  - Experiments        │
    └───────────────────────┘   └───────────────────────┘
```

---

## 🎯 DECISION FLOW - WHEN TO USE WHICH BRANCH

```
                    ┌──────────────────┐
                    │  Need to test    │
                    │  something?      │
                    └────────┬─────────┘
                             │
                             ↓
                ┌────────────────────────┐
                │  Is it a big change?   │
                │  (New feature/major)   │
                └─────┬────────────┬─────┘
                      │ NO         │ YES
                      ↓            ↓
        ┌──────────────────┐  ┌─────────────────────┐
        │ Small fix/tweak  │  │ New feature/major   │
        └────────┬─────────┘  └──────┬──────────────┘
                 │                   │
                 ↓                   ↓
    ┌──────────────────────┐  ┌──────────────────────┐
    │ Can test locally?    │  │ Deploy to STAGING    │
    └─────┬──────────┬─────┘  └──────┬───────────────┘
          │ YES      │ NO            │
          ↓          ↓               ↓
    ┌─────────┐  ┌────────────┐  ┌────────────────┐
    │ Test    │  │ Deploy to  │  │ Test thoroughly│
    │ locally │  │ STAGING    │  │ in STAGING     │
    └────┬────┘  └─────┬──────┘  └───────┬────────┘
         │             │                  │
         └─────────────┴──────────────────┘
                       │
                       ↓
            ┌──────────────────────┐
            │  Tests all passed?   │
            └─────┬──────────┬─────┘
                  │ NO       │ YES
                  ↓          ↓
        ┌──────────────┐  ┌─────────────────┐
        │ Fix in       │  │ Deploy to PROD  │
        │ STAGING      │  └─────────────────┘
        └──────────────┘
```

---

## ✅ SUCCESS CHECKPOINTS

```
Checkpoint 1: CLI Ready
├─ ✅ Supabase CLI installed
├─ ✅ Version >= 1.150
└─ ✅ Command works in terminal

Checkpoint 2: Authentication
├─ ✅ Logged in successfully
├─ ✅ Can list projects
└─ ✅ Project linked

Checkpoint 3: Branching Enabled
├─ ✅ Feature enabled in Dashboard
├─ ✅ CLI shows main branch
└─ ✅ Ready to create staging

Checkpoint 4: Staging Created
├─ ✅ Branch created
├─ ✅ Values saved
├─ ✅ CLI shows 2 branches
└─ ✅ Separate URLs confirmed

Checkpoint 5: Configuration
├─ ✅ .env.staging updated
├─ ✅ 5 secrets set
├─ ✅ Can verify secrets
└─ ✅ Scripts executable

Checkpoint 6: Deployed
├─ ✅ Function deployed
├─ ✅ Health check passes
├─ ✅ Endpoints working
└─ ✅ Logs accessible

🎉 ALL CHECKPOINTS PASSED → STAGING READY!
```

---

## 🎓 NEXT STEPS AFTER SETUP

```
┌──────────────────────────────────────────┐
│  Staging Environment is Ready! ✅        │
└──────────────────┬───────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  What to do next?    │
        └──────┬───────────────┘
               │
    ┌──────────┼──────────┐
    ↓          ↓          ↓
┌────────┐ ┌────────┐ ┌─────────────┐
│ Test   │ │ Start  │ │ Setup       │
│ Flow   │ │ Refact │ │ Monitoring  │
└───┬────┘ └───┬────┘ └──────┬──────┘
    │          │              │
    ↓          ↓              ↓
```

### Option A: Test Booking Flow
1. Create test booking via chatbot
2. Verify email with QR
3. Check admin panel
4. Test status updates

### Option B: Start Refactoring
1. Read Phase 1 plan
2. Extract appointments module
3. Test in staging
4. Deploy to production

### Option C: Setup Monitoring
1. Configure alerts
2. Setup error tracking
3. Monitor performance
4. Review logs regularly

---

**Chọn option phù hợp với priority của bạn!** 🚀
