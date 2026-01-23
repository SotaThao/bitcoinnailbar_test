# Manual Deployment Guide - Supabase Edge Functions

## Overview

This guide walks through manually deploying Supabase Edge Functions when automatic deployment fails with 403 errors.

---

## 🛠️ Prerequisites

- Node.js installed (v18+)
- npm or pnpm
- Supabase account access
- Terminal/Command Line

---

## 📝 Step-by-Step Deployment

### **Step 1: Install Supabase CLI**

Choose your package manager:

#### Option A: npm (recommended)
```bash
npm install -g supabase
```

#### Option B: Homebrew (macOS)
```bash
brew install supabase/tap/supabase
```

#### Option C: Scoop (Windows)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verify installation:**
```bash
supabase --version
```

Expected output: `supabase version 1.x.x`

---

### **Step 2: Login to Supabase**

```bash
supabase login
```

**What happens:**
1. Opens browser for authentication
2. Login with your Supabase account
3. CLI receives access token
4. Token saved locally at `~/.supabase/access-token`

**Expected output:**
```
✔ Access token generated successfully
```

**Troubleshooting:**
- If browser doesn't open: Copy the URL from terminal manually
- If login fails: Check you're using the correct Supabase account

---

### **Step 3: Link Your Project**

```bash
supabase link --project-ref mx5e0ZrIo0MDLcRVGK8gXp
```

**What this does:**
- Connects your local code to remote Supabase project
- Creates `.supabase/` config folder
- Saves project reference

**You'll be prompted for:**
1. **Database password** - Enter your Supabase database password

**Expected output:**
```
✔ Linked to project mx5e0ZrIo0MDLcRVGK8gXp
```

**Troubleshooting:**
- `Project not found` → Check project ID in Supabase Dashboard
- `Access denied` → Verify you have Owner/Admin role

---

### **Step 4: Navigate to Functions Directory**

```bash
cd supabase/functions
```

**Verify structure:**
```bash
ls -la
```

Expected files:
```
server/
  ├── index.tsx
  ├── payment.tsx
  ├── redeem.tsx
  ├── membership-redeem.tsx
  ├── helpers.tsx
  └── ... (other files)
```

---

### **Step 5: Deploy the Function**

```bash
supabase functions deploy make-server
```

**What happens:**
1. CLI bundles all TypeScript files
2. Uploads to Supabase cloud
3. Function becomes live instantly

**Expected output:**
```
Bundling make-server
Deploying make-server (project ref: mx5e0ZrIo0MDLcRVGK8gXp)
✔ Deployed Function make-server on project mx5e0ZrIo0MDLcRVGK8gXp
URL: https://mx5e0zrio0mdlcrvgk8gxp.supabase.co/functions/v1/make-server
```

**Copy the URL** - You'll need it for testing!

---

### **Step 6: Verify Deployment**

#### **Check Function Status**
```bash
supabase functions list
```

Expected output:
```
┌──────────────┬────────┬─────────────────────┐
│ Function     │ Status │ Version             │
├──────────────┼────────┼─────────────────────┤
│ make-server  │ ACTIVE │ 2026-01-23 10:30:00 │
└──────────────┴────────┴─────────────────────┘
```

#### **Test the Endpoint**

```bash
curl https://mx5e0zrio0mdlcrvgk8gxp.supabase.co/functions/v1/make-server/payment/create-link \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tierName": "gold",
    "duration": 6,
    "amount": 99.99
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.vlinkpay.com/...",
    "merchantOrderCode": "BNB-1737675432000-A1B2C3D4"
  }
}
```

✅ **If you see `BNB-` prefix → Deployment successful!**

---

## 🔑 Finding Your Credentials

### **Project Reference ID**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Settings → General → Reference ID
4. Example: `mx5e0ZrIo0MDLcRVGK8gXp`

### **Database Password**

1. Supabase Dashboard → Settings → Database
2. Database Password (set during project creation)
3. If forgotten: Reset password in Settings

### **Anon Key (for testing)**

1. Supabase Dashboard → Settings → API
2. Copy `anon` `public` key
3. Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🐛 Troubleshooting Common Errors

### **Error: `command not found: supabase`**

**Solution:**
```bash
# Re-install globally
npm install -g supabase

# Verify installation
which supabase
```

### **Error: `Failed to link project: 403 Forbidden`**

**Causes:**
- Not logged in
- Wrong project ID
- Insufficient permissions

**Solution:**
```bash
# Re-login
supabase logout
supabase login

# Verify project ID in dashboard
supabase link --project-ref YOUR_CORRECT_PROJECT_ID
```

### **Error: `Database password incorrect`**

**Solution:**
1. Dashboard → Settings → Database → Reset Password
2. Try linking again with new password

### **Error: `Function deployment failed: bundle error`**

**Causes:**
- TypeScript syntax errors
- Missing imports
- Invalid Deno imports

**Solution:**
```bash
# Check for errors in code
cd supabase/functions/server
cat payment.tsx | grep "ORDER-"

# Should see: `BNB-${Date.now()}`
```

### **Error: `Too many requests (429)`**

**Solution:**
- Wait 5 minutes and retry
- Rate limit: 10 deployments per minute

---

## 🔄 Re-deploying After Code Changes

Whenever you update code:

```bash
# 1. Make code changes in /supabase/functions/server/

# 2. Navigate to functions directory
cd supabase/functions

# 3. Deploy
supabase functions deploy make-server

# 4. Verify
supabase functions list
```

**Pro tip:** Use `--debug` flag for verbose output:
```bash
supabase functions deploy make-server --debug
```

---

## 📊 Deployment Checklist

Before deploying, verify:

- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Logged in (`supabase login`)
- [ ] Project linked (`supabase projects list`)
- [ ] In functions directory (`cd supabase/functions`)
- [ ] Code changes saved
- [ ] No syntax errors in TypeScript files

After deploying, test:

- [ ] Function appears in `supabase functions list`
- [ ] Status = `ACTIVE`
- [ ] Test endpoint with `curl` or Postman
- [ ] Check logs: `supabase functions logs make-server`

---

## 📝 Environment Variables

If your function uses environment variables:

### **Set via CLI:**
```bash
supabase secrets set VLINKPAY_ENCRYPTION_KEY=your_secret_key
```

### **Set via Dashboard:**
1. Dashboard → Edge Functions → make-server
2. Settings → Secrets
3. Add `VLINKPAY_ENCRYPTION_KEY`

### **Verify secrets:**
```bash
supabase secrets list
```

---

## 🎯 Quick Reference Commands

| Task | Command |
|------|---------|
| Install CLI | `npm install -g supabase` |
| Login | `supabase login` |
| Logout | `supabase logout` |
| Link project | `supabase link --project-ref PROJECT_ID` |
| List projects | `supabase projects list` |
| Deploy function | `supabase functions deploy FUNCTION_NAME` |
| List functions | `supabase functions list` |
| View logs | `supabase functions logs FUNCTION_NAME` |
| Set secret | `supabase secrets set KEY=VALUE` |
| List secrets | `supabase secrets list` |
| Delete function | `supabase functions delete FUNCTION_NAME` |

---

## 🔗 Useful Links

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Deno Deploy Docs](https://deno.com/deploy/docs)
- [Troubleshooting Guide](https://supabase.com/docs/guides/functions/troubleshooting)

---

## 🆘 Still Having Issues?

### **Check Deployment Logs:**
```bash
supabase functions logs make-server --tail
```

### **Test Locally (Optional):**
```bash
supabase functions serve make-server
```

Then test at: `http://localhost:54321/functions/v1/make-server`

### **Contact Support:**
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

---

## ✅ Success Indicators

You've successfully deployed when:

1. ✅ CLI shows "Deployed Function make-server"
2. ✅ `supabase functions list` shows `ACTIVE` status
3. ✅ Test API call returns `merchantOrderCode: "BNB-..."`
4. ✅ Function logs show recent activity
5. ✅ Frontend can call the endpoint without errors

---

**Deployment complete!** 🎉

Your Edge Function is now live and serving traffic.
