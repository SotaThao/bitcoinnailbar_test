# 🔄 Development Workflow Diagrams

## 1. Standard Development Flow

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT CYCLE                    │
└─────────────────────────────────────────────────────────┘

   ┌───────────────┐
   │  Developer    │
   │  Makes Code   │
   │  Changes      │
   └───────┬───────┘
           │
           ↓
   ┌───────────────┐
   │  Local Test   │
   │  npm run dev  │
   └───────┬───────┘
           │
           ↓
   ┌───────────────┐
   │  Git Commit   │
   │  git push     │
   └───────┬───────┘
           │
           ↓
   ┌─────────────────────────────────────┐
   │  STAGING ENVIRONMENT                │
   │  - Deploy: npm run deploy:staging   │
   │  - Isolated database                │
   │  - Test data only                   │
   └───────┬─────────────────────────────┘
           │
           ↓
   ┌───────────────┐
   │  Run Tests    │
   │  - API tests  │
   │  - Manual QA  │
   │  - Load tests │
   └───────┬───────┘
           │
           ├────────── Tests Failed ─────┐
           │                             │
           │                             ↓
           │                    ┌────────────────┐
           │                    │  Debug & Fix   │
           │                    │  Check Logs    │
           │                    └────────┬───────┘
           │                             │
           │                             ↓
           │                    ┌────────────────┐
           │                    │  Commit Fix    │
           │                    └────────┬───────┘
           │                             │
           │ ←───────────────────────────┘
           │
           │ Tests Passed
           ↓
   ┌─────────────────────────────────────┐
   │  PRODUCTION ENVIRONMENT             │
   │  - Deploy: npm run deploy:production│
   │  - Real customer data               │
   │  - Live application                 │
   └───────┬─────────────────────────────┘
           │
           ↓
   ┌───────────────┐
   │  Monitor      │
   │  - Logs       │
   │  - Metrics    │
   │  - Alerts     │
   └───────────────┘
```

---

## 2. Branch Switching Flow

```
┌─────────────────────────────────────────────────────────┐
│              SUPABASE BRANCH MANAGEMENT                 │
└─────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Developer   │
                    └──────┬───────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ↓                                   ↓
   ┌──────────┐                       ┌──────────┐
   │ STAGING  │                       │   MAIN   │
   │  Branch  │                       │  Branch  │
   └────┬─────┘                       └────┬─────┘
        │                                  │
        │  supabase branches               │
        │  switch staging                  │
        │                                  │
        ↓                                  ↓
   ┌────────────────────┐           ┌────────────────────┐
   │ Staging Database   │           │  Prod Database     │
   │ - Test data        │           │  - Real data       │
   │ - Experiments OK   │           │  - Careful changes │
   └────────────────────┘           └────────────────────┘
        │                                  │
        ↓                                  ↓
   ┌────────────────────┐           ┌────────────────────┐
   │ Staging Functions  │           │  Prod Functions    │
   │ - Latest code      │           │  - Stable code     │
   │ - Debug enabled    │           │  - Optimized       │
   └────────────────────┘           └────────────────────┘
        │                                  │
        ↓                                  ↓
   ┌────────────────────┐           ┌────────────────────┐
   │ Test & Iterate     │           │  Monitor & Scale   │
   └────────────────────┘           └────────────────────┘
```

---

## 3. Deployment Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                 DEPLOYMENT PIPELINE                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Code Changes   │
│  in Git Repo    │
└────────┬────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Pre-Deployment Checks               │
│  ✓ Syntax validation                │
│  ✓ TypeScript compilation           │
│  ✓ Linting                           │
└────────┬─────────────────────────────┘
         │
         ├─── Failed ───► Fix Issues ──┐
         │                             │
         │ Passed                      │
         ↓                             │
┌──────────────────────────────────────┤
│  STAGING DEPLOYMENT                  │
│                                      │
│  1. Switch Branch                    │
│     supabase branches switch staging │
│                                      │
│  2. Deploy Functions                 │
│     supabase functions deploy        │
│                                      │
│  3. Run Migrations (if any)          │
│     supabase db push                 │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Automated Tests                     │
│  ✓ Health check                      │
│  ✓ API endpoint tests                │
│  ✓ Integration tests                 │
└────────┬─────────────────────────────┘
         │
         ├─── Failed ───► Review Logs ──┤
         │                              │
         │ Passed                       │
         ↓                              │
┌──────────────────────────────────────┤
│  Manual QA Testing                   │
│  □ UI/UX validation                  │
│  □ Feature verification              │
│  □ Edge case testing                 │
└────────┬─────────────────────────────┘
         │
         ├─── Issues Found ─────────────┤
         │                              │
         │ Approved                     │
         ↓                              │
┌──────────────────────────────────────┤
│  PRODUCTION DEPLOYMENT               │
│                                      │
│  1. Switch to Main                   │
│     supabase branches switch main    │
│                                      │
│  2. Deploy Functions                 │
│     supabase functions deploy        │
│                                      │
│  3. Run Migrations                   │
│     supabase db push                 │
│                                      │
│  4. Smoke Tests                      │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Post-Deployment                     │
│  ✓ Monitor logs                      │
│  ✓ Check metrics                     │
│  ✓ Alert on errors                   │
│  ✓ Document changes                  │
└──────────────────────────────────────┘
```

---

## 4. Rollback Strategy

```
┌─────────────────────────────────────────────────────────┐
│                  ROLLBACK PROCEDURE                     │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Production      │
│  Issue Detected  │
│  🚨 Alert!       │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Assess Severity                     │
│  - Critical: Immediate rollback      │
│  - Major: Rollback within 15 min     │
│  - Minor: Fix forward or rollback    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  ROLLBACK DECISION                   │
└────────┬─────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
┌─────────┐ ┌──────────┐
│Fix Fwd  │ │ Rollback │
└─────────┘ └────┬─────┘
                 │
                 ↓
         ┌───────────────────────┐
         │  1. Get Last Stable   │
         │     git log --oneline │
         │     git checkout <sha>│
         └───────┬───────────────┘
                 │
                 ↓
         ┌───────────────────────┐
         │  2. Deploy Previous   │
         │     supabase          │
         │     functions deploy  │
         └───────┬───────────────┘
                 │
                 ↓
         ┌───────────────────────┐
         │  3. Verify Health     │
         │     curl health check │
         └───────┬───────────────┘
                 │
                 ↓
         ┌───────────────────────┐
         │  4. Post-Mortem       │
         │     - What happened?  │
         │     - Root cause?     │
         │     - Prevention?     │
         └───────────────────────┘
```

---

## 5. Secret Management Flow

```
┌─────────────────────────────────────────────────────────┐
│              SECRET MANAGEMENT WORKFLOW                 │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐
│  New Secret      │
│  Required        │
│  (e.g., API Key) │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Add to Staging First                │
│                                      │
│  supabase secrets set                │
│    KEY=value                         │
│    --project-ref [STAGING_REF]       │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Test in Staging                     │
│  - Verify secret works               │
│  - Check logs for errors             │
│  - Test dependent features           │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Document in .env.example            │
│  (without actual value)              │
│                                      │
│  # API Key for XYZ Service           │
│  XYZ_API_KEY=sk-...                  │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Add to Production                   │
│                                      │
│  supabase secrets set                │
│    KEY=value                         │
│    --project-ref [PROD_REF]          │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Verify Both Environments            │
│                                      │
│  Staging:  supabase secrets list     │
│            --project-ref [STAGING]   │
│                                      │
│  Prod:     supabase secrets list     │
│            --project-ref [PROD]      │
└──────────────────────────────────────┘
```

---

## 6. Database Migration Flow

```
┌─────────────────────────────────────────────────────────┐
│              DATABASE MIGRATION WORKFLOW                │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Schema Change   │
│  Needed          │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Create Migration                    │
│                                      │
│  supabase migration new              │
│    add_user_preferences              │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Write SQL in Migration File         │
│                                      │
│  supabase/migrations/               │
│    20260120_add_user_preferences.sql │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Test Locally                        │
│                                      │
│  supabase db reset                   │
│  (applies all migrations)            │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Apply to Staging                    │
│                                      │
│  supabase branches switch staging    │
│  supabase db push                    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Test in Staging                     │
│  - Verify schema changes             │
│  - Test app functionality            │
│  - Check data integrity              │
└────────┬─────────────────────────────┘
         │
         ├─── Issues? ──► Fix & Retry ──┐
         │                              │
         │ Success                      │
         ↓                              │
┌──────────────────────────────────────┤
│  Backup Production                   │
│                                      │
│  supabase db dump                    │
│    --project-ref [PROD_REF]          │
│    > backup.sql                      │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Apply to Production                 │
│                                      │
│  supabase branches switch main       │
│  supabase db push                    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Verify & Monitor                    │
│  - Check application health          │
│  - Monitor error logs                │
│  - Validate data                     │
└──────────────────────────────────────┘
```

---

## 7. Feature Development Cycle

```
┌─────────────────────────────────────────────────────────┐
│            FEATURE DEVELOPMENT LIFECYCLE                │
└─────────────────────────────────────────────────────────┘

Day 1: Planning
┌──────────────────┐
│  Requirements    │
│  - User story    │
│  - Acceptance    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Technical       │
│  Design          │
│  - API design    │
│  - DB schema     │
└────────┬─────────┘

Day 2-4: Development
         │
         ↓
┌──────────────────┐
│  Create Branch   │
│  git checkout -b │
│  feature/new     │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Write Code      │
│  - Backend       │
│  - Frontend      │
│  - Tests         │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Local Testing   │
│  npm run dev     │
└────────┬─────────┘

Day 5: Staging
         │
         ↓
┌──────────────────┐
│  Deploy Staging  │
│  npm run         │
│  deploy:staging  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  QA Testing      │
│  - Manual test   │
│  - Automated     │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Code Review     │
│  - PR created    │
│  - Peer review   │
└────────┬─────────┘

Day 6: Production
         │
         ↓
┌──────────────────┐
│  Merge to Main   │
│  git merge       │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Deploy Prod     │
│  npm run         │
│  deploy:prod     │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Monitor         │
│  - 24h watch     │
│  - Metrics       │
└──────────────────┘
```

---

## Legend

```
┌──────────┐
│  Process │  ← Action or step
└──────────┘

     │
     ↓        ← Flow direction

├─── ───►    ← Decision branch

✓            ← Completed/Success
□            ← Pending/Todo
✗            ← Failed/Error
🚨           ← Alert/Warning
```

---

**Use these diagrams as reference when:**
- Onboarding new team members
- Planning deployments
- Troubleshooting issues
- Documenting procedures
- Training sessions

---

*Visual workflow documentation for Bitcoin Nail Bar project*  
*Last Updated: January 20, 2026*
