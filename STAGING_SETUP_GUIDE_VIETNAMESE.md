# 🚀 Hướng Dẫn Setup Staging Branch - Chi Tiết

**Thời gian:** ~30 phút  
**Độ khó:** Trung bình  
**Yêu cầu:** Supabase Pro Plan, quyền Owner/Admin

---

## 📖 MỤC LỤC

1. [Chuẩn bị](#1-chuẩn-bị)
2. [Cài đặt Supabase CLI](#2-cài-đặt-supabase-cli)
3. [Đăng nhập Supabase](#3-đăng-nhập-supabase)
4. [Kết nối Project](#4-kết-nối-project)
5. [Bật Branching](#5-bật-branching-trong-dashboard)
6. [Tạo Staging Branch](#6-tạo-staging-branch)
7. [Cấu hình Environment Variables](#7-cấu-hình-environment-variables)
8. [Deploy lần đầu](#8-deploy-lần-đầu)
9. [Kiểm tra hoạt động](#9-kiểm-tra-hoạt-động)
10. [Workflow sử dụng](#10-workflow-sử-dụng-hàng-ngày)

---

## 1. CHUẨN BỊ

### ✅ Checklist trước khi bắt đầu:

```bash
□ Supabase project đang dùng Pro Plan hoặc cao hơn
□ Bạn có quyền Owner/Admin trong project
□ Node.js >= 18 đã cài (kiểm tra: node --version)
□ Git đã cài (kiểm tra: git --version)
□ Biết Project ID của bạn
```

### 📍 Kiểm tra Plan hiện tại:

1. Mở [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. **Settings** (góc trái) → **Billing**
4. Xem plan hiện tại:
   - ✅ **Pro** hoặc **Team** → OK, tiếp tục
   - ❌ **Free** → Cần upgrade lên Pro

### 💰 Upgrade lên Pro (nếu cần):

1. Trong trang Billing → Click **Upgrade to Pro**
2. Chọn **Pro Plan** ($25/month)
3. Nhập thông tin thanh toán
4. Confirm

---

## 2. CÀI ĐẶT SUPABASE CLI

### 🖥️ **Option A: Cài qua npm (Recommended)**

Mở Terminal/Command Prompt:

```bash
npm install -g supabase
```

### 🖥️ **Option B: Cài qua Homebrew (macOS)**

```bash
brew install supabase/tap/supabase
```

### 🖥️ **Option C: Cài qua Scoop (Windows)**

```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### ✅ Kiểm tra cài đặt:

```bash
supabase --version
```

**Expected output:**
```
1.157.3 hoặc cao hơn
```

**Nếu lỗi "command not found":**
```bash
# Restart terminal
# Hoặc kiểm tra PATH:
echo $PATH  # macOS/Linux
echo %PATH% # Windows
```

---

## 3. ĐĂNG NHẬP SUPABASE

### 🔐 Login qua CLI:

```bash
supabase login
```

**Điều gì sẽ xảy ra:**
1. Terminal sẽ hiện link: `http://localhost:54321/authorize?token=...`
2. Browser tự động mở (hoặc copy link paste vào browser)
3. Trang Supabase hiện lên:
   - **"Authorize Supabase CLI"**
   - Project list của bạn
4. Click **"Authorize"**

**Terminal hiện:**
```
✅ Logged in successfully!
```

### 🔍 Verify login:

```bash
supabase projects list
```

**Expected output:**
```
┌──────────────────────────┬────────────────┬───────────────┐
│       ORGANIZATION       │      NAME      │   REFERENCE   │
├──────────────────────────┼────────────────┼───────────────┤
│ Your Org                 │ Bitcoin Nail   │ abc123xyz     │
└──────────────────────────┴────────────────┴───────────────┘
```

**Nếu thấy project của bạn → ✅ Success!**

---

## 4. KẾT NỐI PROJECT

### 📍 Bước 1: Lấy Project Reference ID

**Cách 1: Từ Dashboard**
1. Mở [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project **Bitcoin Nail Bar**
3. **Settings** → **General**
4. Tìm section **"Reference ID"**
5. Copy ID (format: `abc123xyz`)

**Cách 2: Từ CLI** (từ output bước 3)
```bash
supabase projects list
# Copy giá trị ở cột REFERENCE
```

### 📍 Bước 2: Link project

```bash
# Thay YOUR_PROJECT_REF bằng ID vừa copy
supabase link --project-ref YOUR_PROJECT_REF
```

**Example:**
```bash
supabase link --project-ref abc123xyz
```

**Terminal sẽ hỏi:**
```
Enter your database password (found in your Supabase Dashboard):
```

**Lấy password:**
1. Dashboard → **Settings** → **Database**
2. Scroll xuống **"Connection string"**
3. Click **"Reset database password"** (nếu chưa có)
4. Copy password
5. Paste vào terminal (không hiện gì khi gõ, bình thường)
6. Enter

**Success output:**
```
✅ Linked to project ref: abc123xyz
```

### ✅ Verify link:

```bash
supabase status
```

**Expected:**
```
Connected to project: abc123xyz
Name: Bitcoin Nail Bar
```

---

## 5. BẬT BRANCHING TRONG DASHBOARD

### 🌐 Bước 1: Vào Dashboard

1. Mở [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project **Bitcoin Nail Bar**
3. **Settings** (sidebar trái) → **General**

### 🌐 Bước 2: Enable Branching

1. Scroll xuống tìm section **"Preview Branches"**
2. Click nút **"Enable Branching"** (màu xanh)
3. Popup hiện lên:
   ```
   Enable Preview Branches?
   
   This will allow you to create preview branches 
   for testing changes before production.
   
   [Cancel]  [Enable Branching]
   ```
4. Click **"Enable Branching"**

### 🌐 Bước 3: Đợi provisioning

```
⏳ Enabling branching... (30-60 giây)
✅ Branching enabled!
```

### ✅ Verify trong CLI:

```bash
supabase branches list
```

**Expected output:**
```
┌──────┬────────┬─────────────────────┬────────────┐
│ NAME │ STATUS │    CREATED AT       │   DEFAULT  │
├──────┼────────┼─────────────────────┼────────────┤
│ main │ ACTIVE │ 2024-01-20 10:00:00 │     ✓      │
└──────┴────────┴─────────────────────┴────────────┘
```

**Thấy branch `main` với status ACTIVE → ✅ Success!**

**Nếu lỗi:**
```
Error: Branching not enabled for this project
```
→ Quay lại Bước 2, ensure đã click "Enable Branching"

---

## 6. TẠO STAGING BRANCH

### 🎯 Tạo branch mới:

```bash
supabase branches create staging
```

**Terminal sẽ hiện:**
```
⏳ Creating preview branch: staging...
⏳ Provisioning infrastructure... (2-3 phút)
✅ Created preview branch: staging

┌────────────────────────────────────────────────────┐
│              STAGING BRANCH DETAILS                │
├────────────────────────────────────────────────────┤
│ Branch ID:      staging-abc123                     │
│ Project Ref:    xyz789staging                      │
│ Status:         ACTIVE                             │
│                                                    │
│ 📝 API Configuration:                              │
│ ─────────────────────────────────────────────────  │
│ API URL:                                           │
│   https://xyz789staging.supabase.co                │
│                                                    │
│ Database URL:                                      │
│   postgresql://postgres:[password]@...            │
│                                                    │
│ 🔑 API Keys:                                       │
│ ─────────────────────────────────────────────────  │
│ Anon Key:                                          │
│   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...         │
│                                                    │
│ Service Role Key:                                  │
│   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...         │
└────────────────────────────────────────────────────┘
```

### 🚨 **QUAN TRỌNG: LƯU NGAY CÁC GIÁ TRỊ NÀY!**

Copy và lưu vào notepad:

```
STAGING_PROJECT_REF=xyz789staging
STAGING_API_URL=https://xyz789staging.supabase.co
STAGING_ANON_KEY=eyJhbGci...
STAGING_SERVICE_ROLE_KEY=eyJhbGci...
STAGING_DB_URL=postgresql://...
```

**⚠️ Nếu bị mất output:**
```bash
# Xem lại thông tin branch:
supabase branches get staging

# Lấy API keys:
supabase projects api-keys --project-ref xyz789staging
```

### ✅ Verify branch created:

```bash
supabase branches list
```

**Expected:**
```
┌─────────┬────────┬─────────────────────┬────────────┐
│  NAME   │ STATUS │    CREATED AT       │   DEFAULT  │
├─────────┼────────┼─────────────────────┼────────────┤
│ main    │ ACTIVE │ 2024-01-20 10:00:00 │     ✓      │
│ staging │ ACTIVE │ 2024-01-20 11:30:00 │            │
└─────────┴────────┴─────────────────────┴────────────┘
```

**Thấy 2 branches (main + staging) → ✅ Success!**

---

## 7. CÁU HÌNH ENVIRONMENT VARIABLES

### 📝 Bước 1: Update file `.env.staging`

File này đã có sẵn trong project. Mở bằng editor:

```bash
# macOS/Linux:
nano .env.staging

# Or
code .env.staging  # VS Code

# Windows:
notepad .env.staging
```

**Thay thế các giá trị:**

```bash
# ========== STAGING BRANCH CONFIGURATION ==========
# Project Information
VITE_SUPABASE_URL=https://xyz789staging.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
SUPABASE_DB_URL=postgresql://postgres:[password]@db.xyz789staging.supabase.co:5432/postgres

# Service Role (for backend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ Các secrets này sẽ được set riêng (Bước 2)
# Không paste vào file .env
```

**Lưu file:** `Ctrl+S` / `Cmd+S`

---

### 🔐 Bước 2: Set Secrets trong Supabase

**API keys KHÔNG được commit vào Git, phải set riêng!**

#### **Option A: Qua Dashboard (Dễ hơn - Recommended)**

1. Mở [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. **Edge Functions** (sidebar trái)
4. Top của page, thấy dropdown: **"Branch: main"**
5. Click dropdown → Chọn **"staging"**
6. Click tab **"Secrets"**
7. Click **"Add new secret"**

**Add từng secret:**

| Secret Name | Value | Lấy từ đâu |
|------------|-------|-----------|
| `DEEPSEEK_API_KEY` | `sk-...` | DeepSeek Dashboard |
| `CLOUDINARY_URL` | `cloudinary://...` | Cloudinary Dashboard |
| `RESEND_API_KEY` | `re_...` | Resend Dashboard |
| `RESEND_FROM_EMAIL` | `noreply@bitcoinnailbar.com` | Email domain của bạn |
| `JWT_SECRET` | `staging-secret-2024` | Tự tạo (random string) |

**Sau mỗi secret:**
- Name: `DEEPSEEK_API_KEY`
- Value: `sk-abc123...`
- Click **"Add secret"**
- Repeat cho 5 secrets

#### **Option B: Qua CLI (Nhanh hơn)**

```bash
# Set project ref
STAGING_REF="xyz789staging"  # Thay bằng staging ref của bạn

# Add secrets
supabase secrets set DEEPSEEK_API_KEY="sk-..." --project-ref $STAGING_REF
supabase secrets set CLOUDINARY_URL="cloudinary://..." --project-ref $STAGING_REF
supabase secrets set RESEND_API_KEY="re_..." --project-ref $STAGING_REF
supabase secrets set RESEND_FROM_EMAIL="noreply@bitcoinnailbar.com" --project-ref $STAGING_REF
supabase secrets set JWT_SECRET="staging-secret-2024" --project-ref $STAGING_REF
```

**Sau mỗi command:**
```
✅ Set secret DEEPSEEK_API_KEY
```

### ✅ Verify secrets:

```bash
supabase secrets list --project-ref xyz789staging
```

**Expected:**
```
┌─────────────────────┬─────────────────────┐
│        NAME         │     CREATED AT      │
├─────────────────────┼─────────────────────┤
│ DEEPSEEK_API_KEY    │ 2024-01-20 12:00:00 │
│ CLOUDINARY_URL      │ 2024-01-20 12:00:05 │
│ RESEND_API_KEY      │ 2024-01-20 12:00:10 │
│ RESEND_FROM_EMAIL   │ 2024-01-20 12:00:15 │
│ JWT_SECRET          │ 2024-01-20 12:00:20 │
└─────────────────────┴─────────────────────┘
```

**Thấy đủ 5 secrets → ✅ Success!**

---

## 8. DEPLOY LẦN ĐẦU

### 🚀 Bước 1: Make scripts executable (chỉ lần đầu)

```bash
chmod +x scripts/deploy-staging.sh
chmod +x scripts/switch-branch.sh
```

### 🚀 Bước 2: Deploy

**Option A: Dùng script helper**
```bash
./scripts/deploy-staging.sh
```

**Option B: Dùng npm script**
```bash
npm run deploy:staging
```

**Option C: Manual (dài hơn)**
```bash
# Load staging environment
export $(cat .env.staging | xargs)

# Deploy edge function
supabase functions deploy make-server-84f9c112 \
  --project-ref xyz789staging \
  --no-verify-jwt
```

### 📊 Output khi deploy:

```
⏳ Deploying Edge Function: make-server-84f9c112
⏳ Building function...
⏳ Uploading artifacts...
⏳ Creating version...
✅ Deployed function make-server-84f9c112 (v1)

🌐 Function URL:
   https://xyz789staging.supabase.co/functions/v1/make-server-84f9c112

⏱️  Deploy time: 45s
```

**Thấy "✅ Deployed" → Success!**

**Nếu lỗi:**
```bash
# Check logs để debug:
supabase functions logs make-server-84f9c112 --project-ref xyz789staging
```

---

## 9. KIỂM TRA HOẠT ĐỘNG

### ✅ Test 1: Health Check

```bash
# Thay xyz789staging bằng staging ref của bạn
curl https://xyz789staging.supabase.co/functions/v1/make-server-84f9c112/health
```

**Expected response:**
```json
{
  "status": "ok",
  "version": "v7-staff-management",
  "timestamp": "2024-01-20T12:30:00.000Z"
}
```

**Status code:** `200 OK`

### ✅ Test 2: Service Menu

```bash
curl https://xyz789staging.supabase.co/functions/v1/make-server-84f9c112/settings/service-menu
```

**Expected:**
```json
{
  "success": true,
  "data": { ... }
}
```

### ✅ Test 3: Appointments Endpoint (vừa fix)

```bash
curl https://xyz789staging.supabase.co/functions/v1/make-server-84f9c112/appointments \
  -H "Authorization: Bearer YOUR_STAGING_ANON_KEY"
```

**Expected:**
```json
{
  "success": true,
  "data": []
}
```

### 📊 Quick Test All:

```bash
STAGING_URL="https://xyz789staging.supabase.co/functions/v1/make-server-84f9c112"

echo "1. Health Check:"
curl -s "$STAGING_URL/health" | jq '.'

echo -e "\n2. Service Menu:"
curl -s "$STAGING_URL/settings/service-menu" | jq '.success'

echo -e "\n3. Appointments:"
curl -s "$STAGING_URL/appointments" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  | jq '.success'
```

**All return `true` or `ok` → ✅ All working!**

---

## 10. WORKFLOW SỬ DỤNG HÀNG NGÀY

### 📋 Khi muốn test tính năng mới:

```bash
# 1. Make code changes in local

# 2. Deploy to staging
npm run deploy:staging

# 3. Test in staging URL
curl https://xyz789staging.supabase.co/functions/v1/make-server-84f9c112/...

# 4. If OK → Deploy to production
npm run deploy:prod
```

### 📋 Switch giữa các branches:

```bash
# Switch to staging
./scripts/switch-branch.sh staging

# Switch to main (production)
./scripts/switch-branch.sh main
```

### 📋 Xem logs:

```bash
# Staging logs
supabase functions logs make-server-84f9c112 --project-ref xyz789staging

# Production logs
supabase functions logs make-server-84f9c112 --project-ref abc123main
```

### 📋 Update secrets:

```bash
# Staging
supabase secrets set NEW_SECRET="value" --project-ref xyz789staging

# Production
supabase secrets set NEW_SECRET="value" --project-ref abc123main
```

---

## 🎯 CHECKLIST HOÀN THÀNH

```bash
□ Supabase CLI installed (version >= 1.150)
□ Logged in to Supabase
□ Project linked successfully
□ Branching enabled in Dashboard
□ Staging branch created
□ .env.staging file updated
□ 5 secrets configured in staging
□ Deploy scripts executable
□ First deployment successful
□ Health check returns 200 OK
□ Service menu endpoint works
□ Appointments endpoint works
□ Know how to deploy to staging
□ Know how to switch branches
□ Know how to check logs
```

---

## 🚨 TROUBLESHOOTING

### Lỗi 1: "Branching not enabled"
```bash
# Solution:
1. Dashboard → Settings → General
2. Enable Branching
3. Wait 1 minute
4. Try again
```

### Lỗi 2: "Function not found (404)"
```bash
# Check deployment:
supabase functions list --project-ref xyz789staging

# Redeploy:
npm run deploy:staging
```

### Lỗi 3: "Unauthorized (401)"
```bash
# Check secrets:
supabase secrets list --project-ref xyz789staging

# Re-add missing secret:
supabase secrets set MISSING_SECRET="value" --project-ref xyz789staging
```

### Lỗi 4: "Cannot connect to database"
```bash
# Check database URL in .env.staging
# Should be:
SUPABASE_DB_URL=postgresql://postgres:[password]@db.xyz789staging.supabase.co:5432/postgres

# Get correct URL:
supabase branches get staging
```

### Lỗi 5: Deploy script không chạy
```bash
# Make executable:
chmod +x scripts/deploy-staging.sh

# Or run directly:
bash scripts/deploy-staging.sh
```

---

## 📚 TÀI LIỆU THAM KHẢO

- **Full Guide:** `/docs/SUPABASE_BRANCHING_GUIDE.md`
- **Deployment Guide:** `/docs/DEPLOYMENT_GUIDE.md`
- **Branch Strategy:** `/docs/BRANCHING_STRATEGY.md`
- **Supabase Docs:** https://supabase.com/docs/guides/platform/branching

---

## ✅ HOÀN TẤT!

Bạn đã setup thành công staging environment! 🎉

**Next steps:**
1. Test booking flow trong staging
2. Verify chatbot hoạt động
3. Check admin panel connects to staging
4. Begin Phase 1 refactoring

**Staging URL của bạn:**
```
https://xyz789staging.supabase.co/functions/v1/make-server-84f9c112
```

**Lưu vào đâu đó an toàn!** 📝

---

**Có thắc mắc?** Hỏi tôi bất cứ lúc nào! 🚀
