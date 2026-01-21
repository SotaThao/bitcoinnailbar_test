# 📚 Bitcoin Nail Bar - Documentation Index

**Last Updated:** January 21, 2026  
**Version:** v7 - Staff Management & VLINKPAY Integration

---

## 🎯 START HERE

### **New to the Project?**
1. Read: [Overview](/docs/01-architecture/OVERVIEW.md)
2. Follow: [Quick Reference](/docs/05-references/QUICK_REFERENCE.md)
3. Setup: [Staging Quick Start](/docs/03-guides/STAGING_QUICK_START.md)

### **Need to Implement a Feature?**
1. Check: [Changelogs](/docs/04-changelogs/) for similar implementations
2. Read: [API Reference](/docs/02-api/) for available endpoints
3. Follow: [Guidelines](/docs/03-guides/GUIDELINES.md) for code standards

---

## 📂 DOCUMENTATION STRUCTURE

### **01 - Architecture** 📐

Core system design and decision documents.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [OVERVIEW.md](/docs/01-architecture/OVERVIEW.md) | High-level system architecture | 2026-01 |
| [BACKEND_REFACTOR_PLAN.md](/docs/01-architecture/BACKEND_REFACTOR_PLAN.md) | Modular backend architecture | 2026-01 |
| [STORAGE.md](/docs/01-architecture/STORAGE.md) | Supabase Storage & Cloudinary integration | 2026-01 |
| [JWT_AUTH.md](/docs/01-architecture/JWT_AUTH.md) | JWT authentication system | 2026-01 |
| [SESSION_AUTH.md](/docs/01-architecture/SESSION_AUTH.md) | Session-based auth alternative | 2026-01 |
| [RISK_ANALYSIS_NO_STAGING.md](/docs/01-architecture/RISK_ANALYSIS_NO_STAGING.md) | Production-only deployment risks | 2026-01 |

**Related Files (Needs Organization):**
- `/docs/STAGING_DECISION.md` → Architecture decision on staging
- `/docs/TECHNICIAN_ASSIGNMENT_ANALYSIS.md` → Staff assignment system
- `/docs/WORKFLOW_DIAGRAM.md` → System workflow diagrams

---

### **02 - API Reference** 🔌

REST API endpoint documentation.

| Document | Description | Endpoints |
|----------|-------------|-----------|
| [CUSTOMERS.md](/docs/02-api/CUSTOMERS.md) | Customer management API | `/customers/*` |
| [SERVICES.md](/docs/02-api/SERVICES.md) | Services & categories API | `/services/*` |

**Missing Documentation:**
- Authentication API (`/auth/*`)
- Payment API (`/payment/*`)
- Redeem Code API (`/redeem/*`)
- Gallery API (`/gallery/*`)
- Membership API (`/membership/*`)

---

### **03 - Guides** 📖

Step-by-step implementation guides.

#### **🚀 Setup & Deployment**

| Guide | Purpose | Time |
|-------|---------|------|
| [STAGING_QUICK_START.md](/docs/03-guides/STAGING_QUICK_START.md) | Quick staging setup (experienced users) | 10 min |
| [STAGING_SETUP_GUIDE.md](/docs/03-guides/STAGING_SETUP_GUIDE.md) | Detailed staging setup | 30 min |
| [REALTIME_SETUP.md](/docs/03-guides/REALTIME_SETUP.md) | Realtime subscription setup | 15 min |

**Needs Consolidation:**
- `/QUICK_START_STAGING.md` (Root - duplicate)
- `/README_STAGING_SETUP.md` (Root - duplicate)
- `/STAGING_SETUP_CHECKLIST.md` (Root - duplicate)
- `/docs/SUPABASE_BRANCHING_GUIDE.md` (Needs move to guides)

---

#### **💳 Payment & VLINKPAY**

| Guide | Purpose | Critical? |
|-------|---------|-----------|
| [VLINKPAY_INTEGRATION.md](/docs/03-guides/VLINKPAY_INTEGRATION.md) | Complete VLINKPAY integration | ✅ YES |
| [VLINKPAY_ENCRYPTION_SETUP.md](/docs/03-guides/VLINKPAY_ENCRYPTION_SETUP.md) | AES-256-GCM encryption setup | ✅ YES |
| [VLINKPAY_TIMESTAMP_SPECIFICATION.md](/docs/03-guides/VLINKPAY_TIMESTAMP_SPECIFICATION.md) | Timestamp format for VLINKPAY | ✅ YES |
| [CHECKSUM_EXPLAINED.md](/docs/03-guides/CHECKSUM_EXPLAINED.md) | MD5 checksum security | ✅ YES |
| [CHECKSUM_VISUAL_GUIDE.md](/docs/03-guides/CHECKSUM_VISUAL_GUIDE.md) | Visual checksum tutorial | ⚠️ Helpful |
| [PAYMENT_REDIRECT_URL.md](/docs/03-guides/PAYMENT_REDIRECT_URL.md) | Payment redirect flow | ⚠️ Helpful |
| [AMOUNT_FORMAT_TESTING_GUIDE.md](/docs/03-guides/AMOUNT_FORMAT_TESTING_GUIDE.md) | Amount format debugging | 🧪 Testing |

**Needs Organization:**
- `/docs/QUICK_START_ENCRYPTION.md` (Move to guides)

---

#### **📊 Data & Migration**

| Guide | Purpose | Status |
|-------|---------|--------|
| [MIGRATION.md](/docs/03-guides/MIGRATION.md) | Database migration guide | ✅ Active |
| [GALLERY_MIGRATION_GUIDE.md](/docs/03-guides/GALLERY_MIGRATION_GUIDE.md) | Cloudinary migration | ✅ Complete |
| [BOOKING_FLOW_VERIFICATION.md](/docs/03-guides/BOOKING_FLOW_VERIFICATION.md) | Booking system testing | ✅ Active |

**Duplicate Alert:**
- `/docs/04-changelogs/GALLERY_MIGRATION_GUIDE.md` (Remove from changelogs)

---

#### **📏 Development Standards**

| Guide | Purpose | Required? |
|-------|---------|-----------|
| [GUIDELINES.md](/docs/03-guides/GUIDELINES.md) | Code standards & workflow | ✅ MUST READ |

---

### **04 - Changelogs** 📝

Feature implementation history and bug fixes.

#### **🔐 Security & Encryption**

| Changelog | Date | Impact |
|-----------|------|--------|
| [VLINKPAY_API_KEY_ENCRYPTION.md](/docs/04-changelogs/VLINKPAY_API_KEY_ENCRYPTION.md) | 2026-01 | ✅ Critical |
| [ENCRYPTION_KEY_FIX.md](/docs/04-changelogs/ENCRYPTION_KEY_FIX.md) | 2026-01 | ✅ Critical |

**Needs Organization:**
- `/docs/FIX_ENCRYPTION_ERROR.md` (Move to changelogs)

---

#### **💳 Payment System**

| Changelog | Date | Impact |
|-----------|------|--------|
| [VLINKPAY_PAYMENT_SYSTEM.md](/docs/04-changelogs/VLINKPAY_PAYMENT_SYSTEM.md) | 2026-01 | ✅ Major |
| [VLINKPAY_IFRAME_IMPLEMENTATION.md](/docs/04-changelogs/VLINKPAY_IFRAME_IMPLEMENTATION.md) | 2026-01 | ✅ Major |
| [VLINKPAY_REDEEM_API_INTEGRATION.md](/docs/04-changelogs/VLINKPAY_REDEEM_API_INTEGRATION.md) | 2026-01 | ✅ Major |
| [VLINKPAY_SETTINGS_FIX.md](/docs/04-changelogs/VLINKPAY_SETTINGS_FIX.md) | 2026-01 | ⚠️ Fix |
| [PAYMENT_MODAL_URL_EXPORT.md](/docs/04-changelogs/PAYMENT_MODAL_URL_EXPORT.md) | 2026-01 | ⚠️ Enhancement |
| [PAYMENT_FLOW_BUG_ANALYSIS.md](/docs/04-changelogs/PAYMENT_FLOW_BUG_ANALYSIS.md) | 2026-01-21 | 🚨 CRITICAL |
| [AMOUNT_FORMAT_FIX.md](/docs/04-changelogs/AMOUNT_FORMAT_FIX.md) | 2026-01 | ⚠️ Fix |
| [CURRENCY_USD_FORMAT.md](/docs/04-changelogs/CURRENCY_USD_FORMAT.md) | 2026-01 | ⚠️ Fix |
| [AUTO_CONFIGURED_REDIRECT_URL.md](/docs/04-changelogs/AUTO_CONFIGURED_REDIRECT_URL.md) | 2026-01 | ⚠️ Enhancement |
| [EMAIL_PLACEHOLDER_FIX.md](/docs/04-changelogs/EMAIL_PLACEHOLDER_FIX.md) | 2026-01 | ⚠️ Fix |

---

#### **🔧 Backend Refactor**

| Changelog | Date | Impact |
|-----------|------|--------|
| [REFACTOR_PHASE2.md](/docs/04-changelogs/REFACTOR_PHASE2.md) | 2026-01 | ✅ Major |

**Needs Organization:**
- `/docs/REFACTOR_SUMMARY.md` (Move to changelogs)

---

#### **🤖 AI & Chatbot**

| Changelog | Date | Impact |
|-----------|------|--------|
| [AI_CHATBOT_INTELLIGENCE_UPGRADE.md](/docs/04-changelogs/AI_CHATBOT_INTELLIGENCE_UPGRADE.md) | 2026-01 | ✅ Major |
| [CHATBOT.md](/docs/04-changelogs/CHATBOT.md) | 2026-01 | ⚠️ Enhancement |

---

#### **📅 Booking & Appointments**

| Changelog | Date | Impact |
|-----------|------|--------|
| [BOOKING_FLOW_TEST_REPORT.md](/docs/04-changelogs/BOOKING_FLOW_TEST_REPORT.md) | 2026-01 | ✅ Testing |

---

#### **🎨 UI/UX Fixes**

| Changelog | Date | Impact |
|-----------|------|--------|
| [FLIPBOOK_PREVIOUS_FIX.md](/docs/04-changelogs/FLIPBOOK_PREVIOUS_FIX.md) | 2026-01 | ⚠️ Fix |
| [PHONE_FORMATTING.md](/docs/04-changelogs/PHONE_FORMATTING.md) | 2026-01 | ⚠️ Enhancement |
| [FIX_SUMMARY.md](/docs/04-changelogs/FIX_SUMMARY.md) | 2026-01 | ⚠️ Multiple |

---

### **05 - References** 📚

Quick reference materials.

| Reference | Description |
|-----------|-------------|
| [QUICK_REFERENCE.md](/docs/05-references/QUICK_REFERENCE.md) | Common commands & patterns |
| [GALLERY_SYSTEM_REFERENCE.md](/docs/05-references/GALLERY_SYSTEM_REFERENCE.md) | Cloudinary gallery system |
| [SECURITY_SIGNED_URLS.md](/docs/05-references/SECURITY_SIGNED_URLS.md) | Signed URL implementation |
| [MOBILE_VS_DESKTOP_FIXES.md](/docs/05-references/MOBILE_VS_DESKTOP_FIXES.md) | Responsive design fixes |
| [ATTRIBUTIONS.md](/docs/05-references/ATTRIBUTIONS.md) | Third-party libraries & credits |

**Duplicate Alert:**
- `/ATTRIBUTIONS.md` (Root - duplicate)
- `/docs/ATTRIBUTIONS.md` (Docs root - duplicate)

---

## 🚨 FILES NEEDING ORGANIZATION

### **Root Directory** (Should be empty except system files)

- `/ATTRIBUTIONS.md` → Duplicate of `/docs/05-references/ATTRIBUTIONS.md`
- `/QUICK_START_STAGING.md` → Duplicate, see `/docs/03-guides/STAGING_QUICK_START.md`
- `/README_STAGING_SETUP.md` → Consolidate into main staging guide
- `/STAGING_SETUP_CHECKLIST.md` → Consolidate into main staging guide
- `/STAGING_SETUP_FLOWCHART.md` → Consolidate into main staging guide
- `/STAGING_SETUP_GUIDE_VIETNAMESE.md` → Move to `/docs/03-guides/`
- `/STAGING_SETUP_SUMMARY.md` → Consolidate into main staging guide

---

### **/docs/ Root** (Only README.md should be here)

#### **Should Move to `/docs/01-architecture/`:**
- `/docs/STAGING_DECISION.md`
- `/docs/TECHNICIAN_ASSIGNMENT_ANALYSIS.md`
- `/docs/WORKFLOW_DIAGRAM.md`

#### **Should Move to `/docs/03-guides/`:**
- `/docs/ENCRYPTION_KEY_GENERATOR.html`
- `/docs/GENERATE_KEY_NOW.html` (Duplicate - delete one)
- `/docs/QUICK_START_ENCRYPTION.md`
- `/docs/SUPABASE_BRANCHING_GUIDE.md`

#### **Should Move to `/docs/04-changelogs/`:**
- `/docs/FIX_ENCRYPTION_ERROR.md`
- `/docs/REFACTOR_SUMMARY.md`
- `/docs/FINAL_MIGRATION_REPORT.md`

#### **Outdated/Should Delete:**
- `/docs/FILE_MIGRATION_NEEDED.md` (Migration complete)
- `/docs/MIGRATION_STATUS.md` (Outdated)
- `/docs/MIGRATION_COMPLETE.md` (Consolidate)
- `/docs/MIGRATION_COMPLETE_SUMMARY.md` (Consolidate)
- `/docs/STAGING_CHECKLIST.md` (Duplicate)
- `/docs/STAGING_NEXT_STEPS.md` (Outdated)

#### **Should Review:**
- `/docs/DOCUMENTATION.md` (Merge into this README)

---

## 🎯 RECOMMENDED READING PATHS

### **For New Developers:**

1. [Overview](/docs/01-architecture/OVERVIEW.md)
2. [Guidelines](/docs/03-guides/GUIDELINES.md)
3. [Quick Reference](/docs/05-references/QUICK_REFERENCE.md)
4. [Staging Quick Start](/docs/03-guides/STAGING_QUICK_START.md)

---

### **For Payment Integration:**

1. [VLINKPAY Integration](/docs/03-guides/VLINKPAY_INTEGRATION.md)
2. [Encryption Setup](/docs/03-guides/VLINKPAY_ENCRYPTION_SETUP.md)
3. [Checksum Explained](/docs/03-guides/CHECKSUM_EXPLAINED.md)
4. [Payment Flow Bug Analysis](/docs/04-changelogs/PAYMENT_FLOW_BUG_ANALYSIS.md) 🚨

---

### **For API Development:**

1. [Backend Refactor Plan](/docs/01-architecture/BACKEND_REFACTOR_PLAN.md)
2. [Customers API](/docs/02-api/CUSTOMERS.md)
3. [Services API](/docs/02-api/SERVICES.md)

---

### **For Deployment:**

1. [Staging Quick Start](/docs/03-guides/STAGING_QUICK_START.md)
2. [Supabase Branching Guide](/docs/SUPABASE_BRANCHING_GUIDE.md)
3. [Risk Analysis](/docs/01-architecture/RISK_ANALYSIS_NO_STAGING.md)

---

## 📊 DOCUMENTATION STATISTICS

- **Total Documents:** 67 files
- **Properly Organized:** 25 files (37%)
- **Need Organization:** 42 files (63%)
- **Duplicates Found:** 8+ files
- **Outdated Files:** 12+ files

**See Full Audit:** [DOCUMENTATION_AUDIT_REPORT.md](/docs/DOCUMENTATION_AUDIT_REPORT.md)

---

## 🔍 QUICK SEARCH

### **By Topic:**

- **Authentication:** [JWT_AUTH.md](/docs/01-architecture/JWT_AUTH.md), [SESSION_AUTH.md](/docs/01-architecture/SESSION_AUTH.md)
- **Payment:** [VLINKPAY_INTEGRATION.md](/docs/03-guides/VLINKPAY_INTEGRATION.md)
- **Security:** [VLINKPAY_ENCRYPTION_SETUP.md](/docs/03-guides/VLINKPAY_ENCRYPTION_SETUP.md), [CHECKSUM_EXPLAINED.md](/docs/03-guides/CHECKSUM_EXPLAINED.md)
- **Deployment:** [STAGING_QUICK_START.md](/docs/03-guides/STAGING_QUICK_START.md)
- **Database:** [MIGRATION.md](/docs/03-guides/MIGRATION.md), [STORAGE.md](/docs/01-architecture/STORAGE.md)
- **Gallery:** [GALLERY_SYSTEM_REFERENCE.md](/docs/05-references/GALLERY_SYSTEM_REFERENCE.md)

---

### **By Status:**

- **🚨 Critical Issues:** [PAYMENT_FLOW_BUG_ANALYSIS.md](/docs/04-changelogs/PAYMENT_FLOW_BUG_ANALYSIS.md)
- **🧪 In Testing:** [AMOUNT_FORMAT_TESTING_GUIDE.md](/docs/03-guides/AMOUNT_FORMAT_TESTING_GUIDE.md)
- **✅ Completed:** [REFACTOR_PHASE2.md](/docs/04-changelogs/REFACTOR_PHASE2.md), [GALLERY_MIGRATION_GUIDE.md](/docs/03-guides/GALLERY_MIGRATION_GUIDE.md)

---

## 💡 CONTRIBUTING TO DOCS

### **File Naming Convention:**

```
ALL_CAPS_WITH_UNDERSCORES.md
```

Examples:
- ✅ `VLINKPAY_INTEGRATION.md`
- ✅ `PAYMENT_FLOW_BUG_ANALYSIS.md`
- ❌ `vlinkpay-integration.md`
- ❌ `Payment Flow Bug Analysis.md`

---

### **Where to Put New Docs:**

| Type | Folder | Example |
|------|--------|---------|
| Architecture decision | `/docs/01-architecture/` | `CACHING_STRATEGY.md` |
| API endpoint docs | `/docs/02-api/` | `BOOKINGS.md` |
| How-to guide | `/docs/03-guides/` | `REDIS_SETUP.md` |
| Feature changelog | `/docs/04-changelogs/` | `NEW_FEATURE_X.md` |
| Quick reference | `/docs/05-references/` | `COMMON_ERRORS.md` |

---

### **Documentation Template:**

```markdown
# FEATURE_NAME

**Date:** YYYY-MM-DD  
**Author:** Your Name  
**Status:** Draft | Active | Outdated

---

## Overview

Brief description...

## Problem

What problem does this solve?

## Solution

How it works...

## Implementation

Step-by-step guide...

## Testing

How to verify...

## References

- Related doc 1
- Related doc 2

---

**End of Document**
```

---

## 📞 SUPPORT

### **Documentation Issues:**

- Missing docs? Create an issue
- Found errors? Submit a PR
- Need clarification? Ask in team chat

### **Related Resources:**

- **Project Guidelines:** `/guidelines/Guidelines.md`
- **Main README:** `/README.md` (if exists)
- **Audit Report:** [DOCUMENTATION_AUDIT_REPORT.md](/docs/DOCUMENTATION_AUDIT_REPORT.md)

---

**Last Reviewed:** January 21, 2026  
**Next Review:** February 2026

---

**End of Documentation Index**
