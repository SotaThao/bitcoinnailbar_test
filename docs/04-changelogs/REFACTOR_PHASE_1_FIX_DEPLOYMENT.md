# 🔧 PHASE 1 DEPLOYMENT FIX

**Date:** 2026-01-24  
**Issue:** Module not found error during deployment  
**Status:** ✅ FIXED  

---

## 🐛 **PROBLEM:**

```
Error: Module not found "file:///tmp/.../shared/constants.tsx"
```

**Root Cause:**  
Supabase Edge Functions không hỗ trợ subfolders khi deploy. Tất cả files phải nằm ở cùng cấp với `index.tsx`.

---

## ✅ **SOLUTION:**

Di chuyển tất cả shared utilities từ subfolder `shared/` ra root level với prefix `_shared_`:

### **Migration:**

| Old Path | New Path |
|----------|----------|
| `./shared/constants.tsx` | `./_shared_constants.tsx` |
| `./shared/supabase-client.tsx` | `./_shared_supabase_client.tsx` |
| `./shared/retry.tsx` | `./_shared_retry.tsx` |
| `./shared/kv.tsx` | `./_shared_kv.tsx` |
| `./shared/cloudinary.tsx` | `./_shared_cloudinary.tsx` |

### **Changes Applied:**

1. ✅ Created 5 new files with `_shared_` prefix
2. ✅ Updated imports in `index.tsx` (lines 12-15)
3. ✅ Deleted old `shared/` folder
4. ✅ Updated all cross-references

---

## 📝 **FILES CHANGED:**

### **Created:**
- `/supabase/functions/server/_shared_constants.tsx`
- `/supabase/functions/server/_shared_supabase_client.tsx`
- `/supabase/functions/server/_shared_retry.tsx`
- `/supabase/functions/server/_shared_kv.tsx`
- `/supabase/functions/server/_shared_cloudinary.tsx`

### **Modified:**
- `/supabase/functions/server/index.tsx` (lines 12-15)

### **Deleted:**
- `/supabase/functions/server/shared/` (entire folder)

---

## 🧪 **DEPLOYMENT TEST:**

After fix, deployment should succeed with:

```
✅ Function deployed successfully
✅ No module not found errors
✅ All routes accessible
```

---

## 📚 **LESSONS LEARNED:**

1. **Supabase Edge Functions Architecture:**
   - All files MUST be at the same level as entrypoint
   - Cannot use nested folders for imports
   - Prefix naming convention for organization: `_shared_`, `_utils_`, etc.

2. **Best Practices:**
   - Test deployment early and often
   - Use flat file structure for Edge Functions
   - Document architectural constraints

---

## ⏭️ **NEXT:**

Deploy and verify all endpoints work:
1. Health check
2. Debug routes
3. VLinkPay settings
4. Gallery
5. Promotions

If successful → Proceed to **PHASE 2: Debug & Setup Endpoints**
