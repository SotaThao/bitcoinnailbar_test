# 🚀 Staging Setup - START HERE

**Welcome!** Đây là điểm bắt đầu cho việc setup Supabase Staging Branch.

---

## 🎯 CHỌN HƯỚNG DẪN PHÙ HỢP

### 🚦 **Tôi nên đọc file nào?**

```
┌─────────────────────────────────────────────────────┐
│  BẠN LÀ AI?                                         │
└─────────────────────────────────────────────────────┘

👤 Lần đầu setup Supabase Branching
   → Đọc: STAGING_SETUP_GUIDE_VIETNAMESE.md
   ⏱️  30 phút | 📊 Độ khó: Trung bình

⚡ Đã quen Supabase, cần setup nhanh
   → Đọc: QUICK_START_STAGING.md
   ⏱️  10 phút | 📊 Độ khó: Dễ

📋 Muốn track từng bước, không bỏ sót
   → Dùng: STAGING_SETUP_CHECKLIST.md
   ⏱️  30 phút | 📊 Độ khó: Trung bình

🎨 Thích học qua hình ảnh
   → Xem: STAGING_SETUP_FLOWCHART.md
   ⏱️  20 phút | 📊 Độ khó: Dễ

📚 Cần overview toàn bộ
   → Đọc: STAGING_SETUP_SUMMARY.md
   ⏱️  5 phút | 📊 Overview only
```

---

## 📚 TẤT CẢ TÀI LIỆU

### **🌟 Guides Chính** (Pick ONE)

| File | Mô tả | Thời gian | Khi nào dùng |
|------|-------|-----------|--------------|
| **[STAGING_SETUP_GUIDE_VIETNAMESE.md](./STAGING_SETUP_GUIDE_VIETNAMESE.md)** | Hướng dẫn chi tiết từng bước (tiếng Việt) | 30 min | Lần đầu setup |
| **[QUICK_START_STAGING.md](./QUICK_START_STAGING.md)** | Setup nhanh cho người có kinh nghiệm | 10 min | Đã quen Supabase |
| **[STAGING_SETUP_CHECKLIST.md](./STAGING_SETUP_CHECKLIST.md)** | Checklist format, track progress | 30 min | Muốn đảm bảo không bỏ sót |
| **[STAGING_SETUP_FLOWCHART.md](./STAGING_SETUP_FLOWCHART.md)** | Visual diagrams và flowcharts | 20 min | Học qua hình ảnh |
| **[STAGING_SETUP_SUMMARY.md](./STAGING_SETUP_SUMMARY.md)** | Tổng quan tất cả tài liệu | 5 min | Cần overview |

---

### **📖 Technical Documentation** (Reference)

Các file trong `/docs/` folder:

1. `SUPABASE_BRANCHING_GUIDE.md` - Technical deep dive
2. `DEPLOYMENT_GUIDE.md` - Deployment procedures
3. `BRANCHING_STRATEGY.md` - Branch strategy details
4. `ENVIRONMENT_VARIABLES.md` - Env vars reference
5. `TESTING_PROCEDURES.md` - Testing guidelines
6. `ROLLBACK_PROCEDURES.md` - Rollback guide
7. `MONITORING_SETUP.md` - Monitoring config
8. `SECURITY_CHECKLIST.md` - Security best practices
9. `CLI_REFERENCE.md` - CLI commands reference

**Khi nào dùng:** Reference material, troubleshooting, deep dive

---

### **🛠️ Helper Scripts**

Files trong `/scripts/` folder:

1. `deploy-staging.sh` - Deploy to staging
2. `switch-branch.sh` - Switch between branches

**Khi nào dùng:** Daily development workflow

---

### **🧪 Testing & Verification**

1. `BOOKING_FLOW_VERIFICATION.md` - Test booking flow
2. `BOOKING_FLOW_TEST_REPORT.md` - Bug analysis report
3. `FIX_SUMMARY.md` - Recent bug fixes

**Khi nào dùng:** After staging setup, verify everything works

---

## ⚡ QUICKSTART (1 MINUTE)

**Nếu bạn RẤT VỘI, chỉ đọc 6 dòng này:**

```bash
1. npm install -g supabase
2. supabase login
3. supabase link --project-ref YOUR_REF
4. supabase branches create staging
5. Set secrets (5 keys: DEEPSEEK, CLOUDINARY, RESEND×2, JWT)
6. npm run deploy:staging
```

**Xong! ✅ Nhưng khuyến nghị đọc guide đầy đủ để hiểu rõ hơn.**

---

## 🎓 RECOMMENDED LEARNING PATH

### **For Beginners:**

```
Step 1: Overview (5 min)
→ Read: STAGING_SETUP_SUMMARY.md

Step 2: Detailed Setup (30 min)
→ Follow: STAGING_SETUP_GUIDE_VIETNAMESE.md
→ Use: STAGING_SETUP_CHECKLIST.md to track progress

Step 3: Visual Reference (10 min)
→ Skim: STAGING_SETUP_FLOWCHART.md
→ Understand: How it all connects

Step 4: Verify (30 min)
→ Follow: BOOKING_FLOW_VERIFICATION.md
→ Test: Everything works

Total: ~1.5 hours (first time)
```

### **For Experienced:**

```
Step 1: Quick Setup (10 min)
→ Follow: QUICK_START_STAGING.md

Step 2: Deploy & Test (10 min)
→ Deploy to staging
→ Run health checks

Step 3: Reference (as needed)
→ Keep guides handy for troubleshooting

Total: ~20 minutes
```

---

## 🎯 SETUP PHASES

### **Phase 1: Prerequisites** (5 min)
- ✅ Supabase Pro Plan
- ✅ Node.js >= 18
- ✅ CLI installed
- ✅ API keys ready

**Guide:** Any of the main guides, Prerequisites section

---

### **Phase 2: Supabase Setup** (10 min)
- ✅ Login to Supabase
- ✅ Link project
- ✅ Enable branching
- ✅ Create staging branch

**Guide:** Follow step 2-5 in any guide

---

### **Phase 3: Configuration** (10 min)
- ✅ Update `.env.staging`
- ✅ Set 5 secrets
- ✅ Make scripts executable

**Guide:** Step 6-7 in guides

---

### **Phase 4: Deploy & Verify** (5 min)
- ✅ First deployment
- ✅ Health check
- ✅ Test endpoints

**Guide:** Step 8-9 in guides

---

## 🚨 COMMON QUESTIONS

### Q: Tôi phải upgrade lên Pro Plan không?
**A:** Có, Branching chỉ available trên Pro Plan ($25/month).

### Q: Staging có tốn thêm tiền không?
**A:** Có, mỗi branch tính như một project riêng. Staging branch = thêm $25/month.

### Q: Có thể dùng Free Plan được không?
**A:** Không, branching không available trên Free Plan.

### Q: Setup mất bao lâu?
**A:** 
- First time: ~30 phút
- Experienced: ~10 phút
- Advanced: ~5 phút

### Q: Tôi có thể xóa staging sau này không?
**A:** Có, dùng: `supabase branches delete staging`

### Q: Staging database có độc lập với production không?
**A:** Có, hoàn toàn độc lập. Changes trong staging không ảnh hưởng production.

---

## 🎬 NEXT STEPS AFTER SETUP

```
1. ✅ Staging environment ready
   
2. 🧪 Test booking flow
   → File: BOOKING_FLOW_VERIFICATION.md
   
3. 🛠️ Practice deployment workflow
   → Deploy small change to staging
   → Test
   → Deploy to production
   
4. 🏗️ Begin refactoring (optional)
   → Phase 1: Extract modules
   → Test in staging
   → Deploy when verified
```

---

## 📊 FILES OVERVIEW

```
Root Directory
│
├─ 📘 Main Guides (Pick ONE to start)
│  ├─ STAGING_SETUP_GUIDE_VIETNAMESE.md ⭐ Recommended for beginners
│  ├─ QUICK_START_STAGING.md
│  ├─ STAGING_SETUP_CHECKLIST.md
│  ├─ STAGING_SETUP_FLOWCHART.md
│  └─ STAGING_SETUP_SUMMARY.md
│
├─ 📚 Documentation (Reference)
│  └─ /docs/
│     ├─ SUPABASE_BRANCHING_GUIDE.md
│     ├─ DEPLOYMENT_GUIDE.md
│     ├─ BRANCHING_STRATEGY.md
│     └─ ... (9 files total)
│
├─ 🛠️ Scripts (Daily use)
│  └─ /scripts/
│     ├─ deploy-staging.sh
│     └─ switch-branch.sh
│
├─ 🧪 Testing
│  ├─ BOOKING_FLOW_VERIFICATION.md
│  ├─ BOOKING_FLOW_TEST_REPORT.md
│  └─ FIX_SUMMARY.md
│
├─ 🔧 Configuration
│  ├─ .env.staging (template)
│  └─ .env.production (template)
│
└─ 📄 This File
   └─ README_STAGING_SETUP.md (YOU ARE HERE)
```

---

## 🎯 WHAT YOU'LL ACHIEVE

After completing setup, you will have:

```
✅ Isolated staging environment
✅ Safe place to test changes
✅ Production unaffected by experiments
✅ One-command deployment
✅ Independent databases
✅ Separate API keys
✅ Easy rollback capability
✅ Professional development workflow
```

---

## 💡 PRO TIPS

1. **Bookmark URLs:**
   ```
   Production: https://MAIN_REF.supabase.co/...
   Staging: https://STAGING_REF.supabase.co/...
   ```

2. **Save Credentials Safely:**
   - Use password manager
   - Don't commit to Git
   - Keep backup copy

3. **Test in Staging First:**
   ```
   Local → Staging → Production
   (Always this order!)
   ```

4. **Use Scripts:**
   ```bash
   npm run deploy:staging  # Not manual commands
   npm run deploy:prod
   ```

5. **Monitor Both Environments:**
   - Set up alerts
   - Check logs regularly
   - Track performance

---

## 🆘 NEED HELP?

### **During Setup:**
1. Check Troubleshooting section in your guide
2. Review flowchart to identify which step failed
3. Check `/docs/` for detailed technical info
4. Ask me! 🤖

### **After Setup:**
1. Test booking flow: `BOOKING_FLOW_VERIFICATION.md`
2. Check deployment logs
3. Verify all endpoints work
4. Review security checklist

---

## ✅ READY? LET'S GO!

### **Choose your path:**

**Path A: Complete Beginner**
```bash
1. Read: STAGING_SETUP_SUMMARY.md (overview)
2. Follow: STAGING_SETUP_GUIDE_VIETNAMESE.md (step-by-step)
3. Use: STAGING_SETUP_CHECKLIST.md (track progress)
Time: 30-40 minutes
```

**Path B: Have Experience**
```bash
1. Follow: QUICK_START_STAGING.md
Time: 10 minutes
```

**Path C: Visual Learner**
```bash
1. Review: STAGING_SETUP_FLOWCHART.md
2. Follow along with text guides as needed
Time: 20 minutes
```

---

## 🎊 FINAL WORDS

You have everything you need to set up staging successfully:

- ✅ **4 main guides** (different learning styles)
- ✅ **9 technical docs** (deep dive reference)
- ✅ **2 helper scripts** (daily workflow)
- ✅ **3 testing guides** (verification)
- ✅ **Full troubleshooting** (when things go wrong)

**Pick your guide and start! Good luck! 🚀**

---

**Quick Links:**
- [Vietnamese Guide](./STAGING_SETUP_GUIDE_VIETNAMESE.md) ⭐ **START HERE** (recommended)
- [Quick Start](./QUICK_START_STAGING.md)
- [Checklist](./STAGING_SETUP_CHECKLIST.md)
- [Flowchart](./STAGING_SETUP_FLOWCHART.md)
- [Summary](./STAGING_SETUP_SUMMARY.md)

---

**Last Updated:** January 20, 2026  
**Version:** 1.0  
**Status:** Ready to use ✅
