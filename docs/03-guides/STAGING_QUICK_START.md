# ⚡ Quick Start - Staging Setup (10 Minutes)

**For users familiar with Supabase who need quick setup**

**Last Updated:** January 21, 2026

---

## 📋 Prerequisites

```bash
✅ Supabase Pro Plan
✅ Node.js >= 18
✅ Git installed
✅ Supabase CLI (will install below)
```

---

## 🚀 Setup in 6 Steps

### 1️⃣ **Install CLI** (30s)

```bash
npm install -g supabase
supabase --version
```

---

### 2️⃣ **Login** (30s)

```bash
supabase login
# Browser opens → Click "Authorize"
```

---

### 3️⃣ **Link Project** (1 min)

```bash
# Get Project Ref: Dashboard → Settings → General → Reference ID
supabase link --project-ref YOUR_PROJECT_REF
# Enter database password when prompted
```

---

### 4️⃣ **Enable Branching** (1 min)

```bash
# Dashboard → Settings → General → Enable Branching
# Wait 30-60s for provisioning

# Verify:
supabase branches list
# Should see: main branch
```

---

### 5️⃣ **Create Staging Branch** (2 min)

```bash
supabase branches create staging

# ⚠️ SAVE IMMEDIATELY:
# - Staging Project Ref
# - API URL  
# - Anon Key
# - Service Role Key
```

---

### 6️⃣ **Deploy** (5 min)

```bash
# A. Update .env.staging with staging values

# B. Set secrets:
STAGING_REF="xyz789staging"  # Replace with your staging ref

supabase secrets set \
  SUPABASE_URL="https://$STAGING_REF.supabase.co" \
  SUPABASE_ANON_KEY="your-staging-anon-key" \
  SUPABASE_SERVICE_ROLE_KEY="your-staging-service-role-key" \
  --project-ref $STAGING_REF

# C. Deploy:
chmod +x scripts/deploy-staging.sh
./scripts/deploy-staging.sh
```

---

## ✅ Verify (30s)

```bash
# Health check:
curl https://YOUR_STAGING_REF.supabase.co/functions/v1/make-server-84f9c112/health

# Expected: {"status":"ok","version":"v7-staff-management"}
```

---

## 📝 Cheat Sheet

### **Deploy Commands:**

```bash
# Staging
npm run deploy:staging

# Production  
npm run deploy:prod
```

---

### **View Logs:**

```bash
# Staging
supabase functions logs make-server-84f9c112 --project-ref STAGING_REF

# Production
supabase functions logs make-server-84f9c112 --project-ref MAIN_REF
```

---

### **Manage Secrets:**

```bash
# List
supabase secrets list --project-ref REF

# Add/Update
supabase secrets set KEY="value" --project-ref REF

# Delete
supabase secrets unset KEY --project-ref REF
```

---

### **Switch Branch:**

```bash
supabase branches switch staging
supabase branches switch main
```

---

## 🎯 URLs to Bookmark

```bash
# Production
https://MAIN_REF.supabase.co/functions/v1/make-server-84f9c112

# Staging
https://STAGING_REF.supabase.co/functions/v1/make-server-84f9c112
```

---

## 🚨 Common Issues

**Issue 1: "Branching not available"**
→ Upgrade to Pro Plan

**Issue 2: "Branch creation failed"**
→ Wait 1-2 minutes after enabling branching

**Issue 3: "Secrets not syncing"**
→ Use `--project-ref` flag explicitly

---

## 📚 Full Guides

- **Detailed Guide:** See `/docs/03-guides/STAGING_SETUP_COMPLETE_GUIDE.md`
- **Architecture:** See `/docs/01-architecture/STAGING_DECISION.md`
- **Branching Guide:** See `/docs/03-guides/SUPABASE_BRANCHING_GUIDE.md`

---

**Total Time:** ~10 minutes  
**Difficulty:** Easy (if familiar with Supabase)

---

**End of Quick Start Guide**
