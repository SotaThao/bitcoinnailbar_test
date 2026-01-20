# 🌿 Supabase Branching Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Branch Management](#branch-management)
4. [Deployment Workflow](#deployment-workflow)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Supabase Plan Requirements
- ✅ **Pro Plan** or higher
- ✅ **Owner/Admin** access to project
- ✅ Project ID: Get from [Dashboard](https://supabase.com/dashboard) → Settings → General

### 2. Local Development Tools
```bash
# Node.js >= 18
node --version

# Git
git --version

# jq (for JSON parsing in scripts)
# macOS:
brew install jq
# Ubuntu/Debian:
sudo apt-get install jq
```

---

## Initial Setup

### Step 1: Install Supabase CLI

```bash
# NPM (recommended)
npm install -g supabase

# Or via Homebrew
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### Step 2: Login to Supabase

```bash
supabase login
```

Browser will open for authentication. If not, copy URL from terminal.

### Step 3: Link Project

```bash
# Get your project reference ID from Supabase Dashboard
# Format: abc123xyz (found in Settings → General)

supabase link --project-ref YOUR_PROJECT_REF_ID

# Verify link
supabase status
```

### Step 4: Enable Branching (via Dashboard)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project → **Settings** → **General**
3. Find **Branching** section → Click **Enable Branching**
4. Confirm dialog

### Step 5: Verify Branching Enabled

```bash
supabase branches list

# Expected output:
# ┌──────────┬────────┬────────────┐
# │ Name     │ Status │ Created    │
# ├──────────┼────────┼────────────┤
# │ main     │ active │ 2024-XX-XX │
# └──────────┴────────┴────────────┘
```

---

## Branch Management

### Create Staging Branch

```bash
supabase branches create staging

# Output will include:
# - Branch ID
# - Database URL
# - API URL
# - Anon Key
# - Service Role Key
```

### Get Branch Details

```bash
# Get staging branch info
supabase branches get staging

# Get as JSON
supabase branches get staging --json

# Example output:
{
  "id": "branch-xxx",
  "name": "staging",
  "project_ref": "xyz123",
  "database_url": "postgresql://...",
  "anon_key": "eyJ...",
  "service_role_key": "eyJ...",
  "api_url": "https://xyz123.supabase.co"
}
```

### List All Branches

```bash
supabase branches list
```

### Switch Between Branches

```bash
# Switch to staging
supabase branches switch staging

# Switch to main (production)
supabase branches switch main

# Or use helper script
./scripts/switch-branch.sh staging
./scripts/switch-branch.sh main
```

### Delete Branch (Careful!)

```bash
# Delete staging branch
supabase branches delete staging

# Confirm deletion when prompted
```

---

## Deployment Workflow

### Architecture Overview

```
┌─────────────────────────────┐
│  Local Development          │
│  - Edit code                │
│  - Test locally             │
└─────────────┬───────────────┘
              │
              ↓
┌─────────────────────────────┐
│  Staging Branch             │
│  - Deploy for testing       │
│  - Isolated database        │
│  - Test data only           │
└─────────────┬───────────────┘
              │ (after QA pass)
              ↓
┌─────────────────────────────┐
│  Production (Main Branch)   │
│  - Live application         │
│  - Real customer data       │
│  - Stable releases          │
└─────────────────────────────┘
```

### Deploy to Staging

#### Method 1: Using Helper Script (Recommended)

```bash
# Make script executable (first time only)
chmod +x scripts/deploy-staging.sh

# Deploy
./scripts/deploy-staging.sh
```

#### Method 2: Manual Deployment

```bash
# Get staging project ref
STAGING_REF=$(supabase branches get staging --json | jq -r '.project_ref')

# Deploy Edge Functions
supabase functions deploy --project-ref $STAGING_REF

# Or deploy specific function
supabase functions deploy make-server-84f9c112 --project-ref $STAGING_REF
```

#### Method 3: Using NPM Scripts

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Deploy to Production

```bash
# Ensure you're on main branch
supabase branches switch main

# Deploy
supabase functions deploy

# Or
npm run deploy:production
```

---

## Environment Variables Setup

### 1. Get Branch Credentials

```bash
# For staging
supabase branches get staging --json > staging-creds.json

# For main/production
supabase projects api-keys --project-ref YOUR_MAIN_PROJECT_REF
```

### 2. Update `.env.staging`

Copy values from `staging-creds.json` to `.env.staging`:

```bash
VITE_SUPABASE_URL=https://[STAGING_REF].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_URL=https://[STAGING_REF].supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_DB_URL=postgresql://postgres.[STAGING_REF]@...
```

### 3. Set Secrets in Supabase Dashboard

For each branch (staging & production):

1. Dashboard → Project Settings → **Edge Functions**
2. Add secrets:
   - `DEEPSEEK_API_KEY`
   - `CLOUDINARY_URL`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `JWT_SECRET`

```bash
# Or via CLI
supabase secrets set DEEPSEEK_API_KEY=sk-xxx --project-ref [STAGING_REF]
supabase secrets set CLOUDINARY_URL=cloudinary://... --project-ref [STAGING_REF]
```

---

## Testing

### Health Check

```bash
# Staging
curl https://[STAGING_REF].supabase.co/functions/v1/make-server-84f9c112/health

# Expected response:
{"status":"ok","version":"v7-staff-management"}
```

### Test Deployment Checklist

```bash
□ Health endpoint returns 200
□ Auth routes work (login/logout)
□ Chatbot responds correctly
□ Database reads/writes succeed
□ Email sending works
□ File uploads work
□ No console errors in browser
□ Performance is acceptable
```

### Automated Testing Script

```bash
# Create test script
cat > scripts/test-staging.sh << 'EOF'
#!/bin/bash
STAGING_URL="https://[STAGING_REF].supabase.co/functions/v1/make-server-84f9c112"

echo "Testing Health..."
curl -s "$STAGING_URL/health" | jq

echo "Testing Service Menu..."
curl -s "$STAGING_URL/settings/service-menu" | jq '.success'

echo "✅ Tests complete"
EOF

chmod +x scripts/test-staging.sh
./scripts/test-staging.sh
```

---

## Database Migrations

### Copy Data from Production to Staging

```bash
# Dump production data
supabase db dump --project-ref [PROD_REF] > backup.sql

# Restore to staging
supabase db reset --project-ref [STAGING_REF]
psql $STAGING_DB_URL < backup.sql
```

### Schema Migrations

```bash
# Create migration
supabase migration new add_new_feature

# Edit migration file in supabase/migrations/

# Apply to staging first
supabase db push --project-ref [STAGING_REF]

# Test thoroughly

# Then apply to production
supabase db push --project-ref [PROD_REF]
```

---

## Troubleshooting

### Issue: "Branch not found"

```bash
# Solution: Create branch first
supabase branches create staging
```

### Issue: "Not logged in"

```bash
# Solution: Login
supabase login
```

### Issue: "Permission denied"

```bash
# Solution: Check project access
supabase projects list

# Ensure you're owner/admin in Supabase Dashboard
```

### Issue: "Function deployment failed"

```bash
# Check logs
supabase functions logs make-server-84f9c112 --project-ref [STAGING_REF]

# Common fixes:
# 1. Check environment variables are set
supabase secrets list --project-ref [STAGING_REF]

# 2. Verify function code syntax
# 3. Check import paths
# 4. Review function logs for errors
```

### Issue: "Database connection error"

```bash
# Check database status
supabase db status --project-ref [STAGING_REF]

# Test connection
psql $STAGING_DB_URL -c "SELECT 1"
```

### Issue: "Different environment variables between branches"

```bash
# List secrets for comparison
supabase secrets list --project-ref [STAGING_REF] > staging-secrets.txt
supabase secrets list --project-ref [PROD_REF] > prod-secrets.txt
diff staging-secrets.txt prod-secrets.txt
```

---

## Best Practices

### 1. **Always Test in Staging First**
```bash
# Never deploy directly to production
❌ git push && npm run deploy:production

# Always test staging first
✅ git push && npm run deploy:staging
✅ Run tests
✅ Manual QA
✅ Then deploy to production
```

### 2. **Use Feature Flags**
```typescript
// In code, check environment
const isStaging = Deno.env.get('SUPABASE_URL')?.includes('staging');

if (isStaging) {
  console.log('[STAGING] Extra debug logging enabled');
}
```

### 3. **Regular Data Syncs**
```bash
# Weekly: Sync production data to staging
# - Anonymize customer data
# - Keep schema up-to-date
```

### 4. **Monitor Branch Limits**
```bash
# Pro Plan: 5 branches max
# Team Plan: 10 branches max

# Clean up unused branches
supabase branches delete old-feature-branch
```

### 5. **Document Changes**
```bash
# In Git commit messages
git commit -m "feat: Add new payment method [STAGING-TESTED]"
```

---

## Quick Reference Commands

```bash
# Setup
supabase login
supabase link --project-ref YOUR_REF
supabase branches create staging

# Daily workflow
supabase branches switch staging
npm run deploy:staging
./scripts/test-staging.sh

# Deploy to production
supabase branches switch main
npm run deploy:production

# Monitoring
supabase functions logs make-server-84f9c112
supabase db status

# Cleanup
supabase branches delete old-branch
```

---

## Next Steps

After completing this setup:

1. ✅ Test a simple deployment to staging
2. ✅ Verify all environment variables are set
3. ✅ Run health checks
4. ✅ Document your staging URL
5. ✅ Setup CI/CD pipeline (optional)
6. ✅ Begin Phase 1 refactoring (see main refactoring plan)

---

## Support & Resources

- 📚 [Supabase Branching Docs](https://supabase.com/docs/guides/platform/branching)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [Report Issues](https://github.com/supabase/supabase/issues)
- 📖 [Edge Functions Guide](https://supabase.com/docs/guides/functions)

---

**Last Updated:** January 20, 2026  
**Version:** 1.0.0  
**Project:** Bitcoin Nail Bar Membership System
