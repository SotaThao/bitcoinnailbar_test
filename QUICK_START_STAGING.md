# ⚡ Quick Start - Staging Setup (10 Phút)

**Cho người đã quen Supabase, cần setup nhanh**

---

## 📋 Prerequisites

```bash
✅ Supabase Pro Plan
✅ Node.js >= 18
✅ Git installed
```

---

## 🚀 Setup 6 Bước

### 1️⃣ **Install CLI** (30s)
```bash
npm install -g supabase
supabase --version
```

### 2️⃣ **Login** (30s)
```bash
supabase login
# Browser mở → Click "Authorize"
```

### 3️⃣ **Link Project** (1 min)
```bash
# Lấy Project Ref: Dashboard → Settings → General → Reference ID
supabase link --project-ref YOUR_PROJECT_REF
# Nhập database password khi được hỏi
```

### 4️⃣ **Enable Branching** (1 min)
```bash
# Dashboard → Settings → General → Enable Branching
# Wait 30-60s cho provision

# Verify:
supabase branches list
# Should see: main branch
```

### 5️⃣ **Create Staging** (2 min)
```bash
supabase branches create staging

# ⚠️ LƯU NGAY:
# - Staging Project Ref
# - API URL  
# - Anon Key
# - Service Role Key
```

### 6️⃣ **Deploy** (5 min)
```bash
# A. Update .env.staging với staging values

# B. Set secrets:
STAGING_REF="xyz789staging"  # Thay bằng staging ref

supabase secrets set DEEPSEEK_API_KEY="sk-..." --project-ref $STAGING_REF
supabase secrets set CLOUDINARY_URL="cloudinary://..." --project-ref $STAGING_REF
supabase secrets set RESEND_API_KEY="re_..." --project-ref $STAGING_REF
supabase secrets set RESEND_FROM_EMAIL="noreply@bitcoinnailbar.com" --project-ref $STAGING_REF
supabase secrets set JWT_SECRET="staging-secret-2024" --project-ref $STAGING_REF

# C. Deploy:
chmod +x scripts/deploy-staging.sh
npm run deploy:staging
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

### Deploy Commands:
```bash
# Staging
npm run deploy:staging

# Production  
npm run deploy:prod
```

### View Logs:
```bash
# Staging
supabase functions logs make-server-84f9c112 --project-ref STAGING_REF

# Production
supabase functions logs make-server-84f9c112 --project-ref MAIN_REF
```

### Manage Secrets:
```bash
# List
supabase secrets list --project-ref REF

# Add/Update
supabase secrets set KEY="value" --project-ref REF

# Delete
supabase secrets unset KEY --project-ref REF
```

### Switch Branch:
```bash
./scripts/switch-branch.sh staging
./scripts/switch-branch.sh main
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

| Problem | Solution |
|---------|----------|
| 404 on deploy | Redeploy: `npm run deploy:staging` |
| 401 Unauthorized | Check secrets: `supabase secrets list --project-ref REF` |
| Branch not found | Enable branching in Dashboard |
| Secrets not working | Redeploy after setting secrets |

---

## 📚 Full Guides

- **Chi tiết tiếng Việt:** `/STAGING_SETUP_GUIDE_VIETNAMESE.md`
- **Checklist đầy đủ:** `/STAGING_SETUP_CHECKLIST.md`
- **Technical docs:** `/docs/SUPABASE_BRANCHING_GUIDE.md`

---

✅ **Done in 10 minutes!** 🎉
