# 🚀 Quick Reference - Supabase Branching

> Keep this handy for daily development

---

## 📦 NPM Scripts (Fastest)

```bash
# Development
npm run dev                    # Local dev (uses .env)
npm run dev:staging            # Local dev with staging vars

# Branching
npm run supabase:branch:list   # List all branches
npm run supabase:branch:staging # Switch to staging
npm run supabase:branch:main   # Switch to main/production

# Deployment
npm run deploy:staging         # Deploy to staging
npm run deploy:production      # Deploy to production

# Status
npm run supabase:status        # Check current status
```

---

## 🔧 CLI Commands

### Daily Workflow

```bash
# Morning: Switch to staging
supabase branches switch staging

# Deploy your changes
supabase functions deploy

# Test
curl https://[STAGING_REF].supabase.co/functions/v1/make-server-84f9c112/health

# If tests pass, deploy to production
supabase branches switch main
supabase functions deploy
```

### Branch Management

```bash
# List branches
supabase branches list

# Get branch details
supabase branches get staging
supabase branches get staging --json  # JSON output

# Switch branches
supabase branches switch staging
supabase branches switch main

# Create new branch
supabase branches create feature-xyz

# Delete branch
supabase branches delete feature-xyz
```

### Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy make-server-84f9c112

# Deploy to specific branch
supabase functions deploy --project-ref [STAGING_REF]

# Deploy with no verification prompt
supabase functions deploy --no-verify-jwt
```

### Secrets Management

```bash
# List secrets
supabase secrets list

# Set secret
supabase secrets set KEY=value

# Set for specific branch
supabase secrets set KEY=value --project-ref [STAGING_REF]

# Unset secret
supabase secrets unset KEY
```

### Logs & Debugging

```bash
# View function logs
supabase functions logs make-server-84f9c112

# Follow logs (live)
supabase functions logs make-server-84f9c112 --follow

# Logs for specific branch
supabase functions logs make-server-84f9c112 --project-ref [STAGING_REF]

# Database logs
supabase db logs
```

### Database Operations

```bash
# Database status
supabase db status

# Create migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database (CAREFUL!)
supabase db reset

# Dump database
supabase db dump > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

---

## 🌐 URLs

### Staging
```
API: https://[STAGING_REF].supabase.co
Functions: https://[STAGING_REF].supabase.co/functions/v1/
Health: https://[STAGING_REF].supabase.co/functions/v1/make-server-84f9c112/health
Dashboard: https://supabase.com/dashboard/project/[STAGING_REF]
```

### Production
```
API: https://[PROD_REF].supabase.co
Functions: https://[PROD_REF].supabase.co/functions/v1/
Health: https://[PROD_REF].supabase.co/functions/v1/make-server-84f9c112/health
Dashboard: https://supabase.com/dashboard/project/[PROD_REF]
```

---

## 🧪 Quick Tests

### Health Check
```bash
curl https://[REF].supabase.co/functions/v1/make-server-84f9c112/health
# Expected: {"status":"ok","version":"v7-staff-management"}
```

### Service Menu
```bash
curl https://[REF].supabase.co/functions/v1/make-server-84f9c112/settings/service-menu | jq '.success'
# Expected: true
```

### Membership Tiers
```bash
curl https://[REF].supabase.co/functions/v1/make-server-84f9c112/membership/tiers | jq '.data | length'
# Expected: 3 (or number of tiers)
```

---

## 🔑 Environment Variables

### Required Secrets (Set in Supabase Dashboard)
```
□ DEEPSEEK_API_KEY
□ CLOUDINARY_URL
□ RESEND_API_KEY
□ RESEND_FROM_EMAIL
□ JWT_SECRET
```

### Check if all secrets are set
```bash
supabase secrets list
```

---

## 📂 File Locations

```
/.env.staging          # Staging environment vars
/docs/                 # Full documentation
/scripts/              # Helper scripts
  ├── deploy-staging.sh
  └── switch-branch.sh
/supabase/functions/   # Edge Functions
  └── server/
      ├── index.tsx    # Main entry point
      ├── auth.tsx
      ├── customers.tsx
      └── ...
```

---

## 🚨 Emergency Commands

### Rollback Deployment
```bash
# Redeploy previous working version
git checkout <previous-commit>
supabase functions deploy
git checkout main
```

### Reset Database (DESTRUCTIVE!)
```bash
# Staging only! Never on production!
supabase db reset --project-ref [STAGING_REF]
```

### Check Function Status
```bash
supabase functions list
```

### View Recent Errors
```bash
supabase functions logs make-server-84f9c112 --tail 50
```

---

## 💡 Pro Tips

### 1. Always Test in Staging First
```bash
# ❌ Never do this
git push && supabase functions deploy

# ✅ Do this
git push
supabase branches switch staging
supabase functions deploy
# Test thoroughly
supabase branches switch main
supabase functions deploy
```

### 2. Use Aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias sb="supabase"
alias sbs="supabase branches switch"
alias sbd="supabase functions deploy"
alias sbl="supabase functions logs make-server-84f9c112"

# Usage:
sbs staging
sbd
sbl --follow
```

### 3. Quick Branch Info
```bash
# Get staging URL quickly
supabase branches get staging --json | jq -r '.api_url'

# Get staging project ref
supabase branches get staging --json | jq -r '.project_ref'
```

### 4. Compare Secrets
```bash
# Staging secrets
supabase secrets list --project-ref [STAGING_REF] > staging.txt

# Production secrets
supabase secrets list --project-ref [PROD_REF] > prod.txt

# Compare
diff staging.txt prod.txt
```

---

## 🔄 Typical Development Workflow

```bash
# 1. Start new feature
git checkout -b feature/new-payment-method

# 2. Make changes to code
# ... edit files ...

# 3. Test locally
npm run dev

# 4. Deploy to staging
supabase branches switch staging
supabase functions deploy

# 5. Test staging
curl https://[STAGING_REF].supabase.co/functions/v1/make-server-84f9c112/health

# 6. If tests pass, merge to main
git checkout main
git merge feature/new-payment-method

# 7. Deploy to production
supabase branches switch main
supabase functions deploy

# 8. Monitor production
supabase functions logs make-server-84f9c112 --follow
```

---

## 📊 Status Checks

### Check Everything
```bash
echo "Current Branch:"
supabase branches list | grep "*"

echo "Secrets:"
supabase secrets list | wc -l

echo "Functions:"
supabase functions list

echo "Database:"
supabase db status
```

---

## 🆘 Help & Documentation

```bash
# CLI help
supabase --help
supabase branches --help
supabase functions --help

# Full documentation
cat docs/SUPABASE_BRANCHING_GUIDE.md
```

---

**Keep this file bookmarked for quick access!** 🔖

Last Updated: January 20, 2026
