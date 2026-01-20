# ✅ Staging Branch Setup Checklist

> **Time Required:** ~30 minutes  
> **Difficulty:** Intermediate  
> **Prerequisites:** Supabase Pro Plan, Owner/Admin access

---

## 📋 Pre-Setup Verification

```bash
□ Supabase project is on Pro Plan or higher
□ You have Owner/Admin access to project
□ Node.js >= 18 installed (node --version)
□ Git is installed (git --version)
□ Project ID available from Dashboard
```

---

## 🚀 Setup Steps

### 1. Install Supabase CLI (5 min)

```bash
# Install
npm install -g supabase

# Verify
supabase --version
```

**Status:** □ Installed, version: _________

---

### 2. Login to Supabase (2 min)

```bash
supabase login
```

**Status:** □ Logged in successfully

---

### 3. Link Project (3 min)

```bash
# Get Project Ref from: Dashboard → Settings → General
# Format: abc123xyz

supabase link --project-ref YOUR_PROJECT_REF

# Verify
supabase status
```

**Status:** □ Project linked  
**Project Ref ID:** _________________

---

### 4. Enable Branching in Dashboard (3 min)

**Manual Steps:**
1. □ Open [Supabase Dashboard](https://supabase.com/dashboard)
2. □ Go to Settings → General
3. □ Find "Branching" section
4. □ Click "Enable Branching"
5. □ Confirm dialog

**Verify:**
```bash
supabase branches list
```

**Status:** □ Branching enabled, shows "main" branch

---

### 5. Create Staging Branch (5 min)

```bash
supabase branches create staging
```

**Copy these values immediately:**

```
Branch ID: _________________________________
Project Ref: _______________________________
Database URL: ______________________________
API URL: ___________________________________
Anon Key: __________________________________
Service Role Key: __________________________
```

**Status:** □ Staging branch created

---

### 6. Configure Environment Variables (10 min)

#### 6.1 Update `.env.staging` file

```bash
# File already created at: /.env.staging
# Replace placeholders with values from Step 5
```

**Status:** □ `.env.staging` updated with correct values

#### 6.2 Set Secrets in Supabase Dashboard

For **STAGING** branch:

1. Dashboard → Project Settings → Edge Functions
2. Select **staging** branch
3. Add these secrets:

```bash
□ DEEPSEEK_API_KEY = sk-_______________
□ CLOUDINARY_URL = cloudinary://_______
□ RESEND_API_KEY = re__________________
□ RESEND_FROM_EMAIL = _________________
□ JWT_SECRET = ________________________
```

**Or via CLI:**
```bash
STAGING_REF="YOUR_STAGING_REF"

supabase secrets set DEEPSEEK_API_KEY="sk-..." --project-ref $STAGING_REF
supabase secrets set CLOUDINARY_URL="cloudinary://..." --project-ref $STAGING_REF
supabase secrets set RESEND_API_KEY="re_..." --project-ref $STAGING_REF
supabase secrets set RESEND_FROM_EMAIL="noreply@bitcoinnailbar.com" --project-ref $STAGING_REF
supabase secrets set JWT_SECRET="staging-secret-key-2024" --project-ref $STAGING_REF
```

**Status:** □ All 5 secrets configured in staging

---

### 7. Make Scripts Executable (1 min)

```bash
chmod +x scripts/deploy-staging.sh
chmod +x scripts/switch-branch.sh
```

**Status:** □ Scripts are executable

---

### 8. Initial Deployment Test (5 min)

```bash
# Deploy to staging
./scripts/deploy-staging.sh

# Or
npm run deploy:staging
```

**Status:** □ Deployment successful

---

### 9. Health Check (2 min)

```bash
# Replace STAGING_REF with your staging project ref
curl https://[STAGING_REF].supabase.co/functions/v1/make-server-84f9c112/health

# Expected: {"status":"ok","version":"v7-staff-management"}
```

**Status:** □ Health check returns 200 OK

**Staging URL:** https://_________________________.supabase.co

---

## 🧪 Post-Setup Testing

### Test Critical Endpoints:

```bash
STAGING_URL="https://[STAGING_REF].supabase.co/functions/v1/make-server-84f9c112"

# 1. Health check
□ curl "$STAGING_URL/health"

# 2. Service menu
□ curl "$STAGING_URL/settings/service-menu" | jq '.success'

# 3. Membership tiers
□ curl "$STAGING_URL/make-server-84f9c112/membership/tiers" | jq '.success'
```

**Status:** □ All 3 endpoints return success

---

## 📝 Documentation

```bash
□ Staging URL documented in team wiki
□ Environment variables backed up securely
□ Team notified of staging environment
□ Testing procedures documented
```

---

## 🎯 Final Verification

### Run this command to verify everything:

```bash
echo "=== Supabase Staging Setup Verification ==="
echo ""
echo "1. CLI Installed:"
supabase --version
echo ""
echo "2. Login Status:"
supabase projects list | head -3
echo ""
echo "3. Branches:"
supabase branches list
echo ""
echo "4. Staging Secrets:"
supabase secrets list --project-ref $(supabase branches get staging --json | jq -r '.project_ref')
echo ""
echo "5. Health Check:"
curl -s https://$(supabase branches get staging --json | jq -r '.project_ref').supabase.co/functions/v1/make-server-84f9c112/health
echo ""
echo "=== Setup Complete! ==="
```

**Status:** □ All checks passed ✅

---

## 📊 Setup Summary

| Item | Status | Notes |
|------|--------|-------|
| Supabase CLI | □ | Version: _____ |
| Login | □ | |
| Project Link | □ | Ref: _____ |
| Branching Enabled | □ | |
| Staging Branch | □ | Ref: _____ |
| Environment Vars | □ | 5 secrets set |
| Scripts | □ | Executable |
| Deployment | □ | Success |
| Health Check | □ | 200 OK |

---

## 🚨 Troubleshooting

### Common Issues:

**"Branch not found"**
```bash
# Solution:
supabase branches create staging
```

**"Not logged in"**
```bash
# Solution:
supabase login
```

**"Deployment failed"**
```bash
# Check logs:
supabase functions logs make-server-84f9c112 --project-ref [STAGING_REF]

# Check secrets:
supabase secrets list --project-ref [STAGING_REF]
```

**"Health check returns 404"**
```bash
# Verify deployment:
supabase functions list --project-ref [STAGING_REF]

# Redeploy:
npm run deploy:staging
```

---

## 🎉 Next Steps

After completing this checklist:

1. □ Read full documentation: `/docs/SUPABASE_BRANCHING_GUIDE.md`
2. □ Test a simple code change in staging
3. □ Verify staging → production workflow
4. □ Begin Phase 1 refactoring (see refactoring plan)
5. □ Setup CI/CD (optional, recommended for teams)

---

## 📞 Support

- Documentation: `/docs/SUPABASE_BRANCHING_GUIDE.md`
- Supabase Docs: https://supabase.com/docs/guides/platform/branching
- Discord: https://discord.supabase.com

---

**Setup Date:** ___________________  
**Completed By:** ___________________  
**Staging URL:** https://_____________________.supabase.co  
**Time Taken:** _________ minutes

---

## ✅ Sign-off

□ I have completed all setup steps  
□ All tests are passing  
□ Documentation is updated  
□ Team is notified  
□ Ready to start development on staging branch

**Signature:** _____________________  
**Date:** _____________________
