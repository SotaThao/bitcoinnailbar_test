# PHASE 3 - TROUBLESHOOTING GUIDE

**Issue:** Loyalty Programs page is blank (no tabs showing)

---

## 🔍 **DIAGNOSIS STEPS**

### **Step 1: Check Browser Console**

1. **Open DevTools**
   - Press F12 or Right-click → Inspect
   - Go to "Console" tab

2. **Look for errors:**
   - Red error messages?
   - Component render errors?
   - Missing import errors?

3. **Common errors to look for:**
   ```
   - "Cannot read property 'map' of undefined"
   - "X is not defined"
   - "Failed to fetch"
   - "Component suspended while rendering"
   ```

### **Step 2: Check Network Tab**

1. **Go to "Network" tab in DevTools**
2. **Reload the page** (Ctrl/Cmd + R)
3. **Look for failed requests:**
   - Any red items?
   - 404 errors?
   - 500 errors?

### **Step 3: Check React Components**

1. **Install React DevTools** (if not installed)
   - Chrome: https://chrome.google.com/webstore
   - Search "React Developer Tools"

2. **Check component tree:**
   - Is `AdminMembershipPage` rendering?
   - Is `PillTabs` rendering?
   - Are child components visible?

---

## 🚨 **KNOWN ISSUES**

### **Issue 1: Blank Page (Current)**

**Symptoms:**
- Page header shows "Loyalty Programs"
- No tabs visible
- Blank content area

**Possible Causes:**

#### **Cause A: PillTabs Component Issue**
```tsx
// Check if PillTabs is rendering correctly
// File: /src/app/components/ui/pill-tabs.tsx
```

**Fix:** Check if component is exported correctly

#### **Cause B: CSS Loading Issue**
**Fix:** Check if styles are loaded in browser inspector

#### **Cause C: JavaScript Error**
**Fix:** Check console for errors

---

## 🔧 **QUICK FIXES**

### **Fix 1: Hard Refresh**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### **Fix 2: Clear Cache**
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

### **Fix 3: Check Different Page**

Instead of `/admin/membership`, try:
```
/admin/loyalty
```

This should show:
- Customer Management tab
- Redeem Codes tab

**If this works, it confirms the issue is specific to MembershipPage**

---

## 📊 **COMPARISON: Two Different Pages**

### **Page 1: `/admin/membership` (Loyalty Programs)**
- **Tabs:** Memberships, Promotions, Events
- **Component:** `AdminMembershipPage`
- **File:** `/src/app/components/admin/MembershipPage.tsx`
- **Purpose:** Manage membership tiers, promotions, events
- **Current Status:** ⚠️ BLANK (issue)

### **Page 2: `/admin/loyalty` (Redeem Codes)**
- **Tabs:** Customer Management, Redeem Codes
- **Component:** `RedeemCodesPage`
- **File:** `/src/app/pages/admin/RedeemCodesPage.tsx`
- **Purpose:** Manage customers, redeem codes
- **Current Status:** ✅ Should work (uses same PillTabs)

---

## 🎯 **ACTION PLAN**

### **Step 1: Navigate to Customer Management**

1. **In sidebar, look for different link**
   - Or manually go to: `/admin/loyalty`

2. **Check if Customer Management tab loads**
   - This uses CustomerManagementTab component
   - Should fetch from new Postgres endpoint

3. **If this works:**
   - ✅ Postgres migration is working
   - ⚠️ MembershipPage has separate issue

### **Step 2: Test Customer Management**

**Once on `/admin/loyalty`:**

1. **Click "Customer Management" tab**
2. **Check browser console for errors**
3. **Check Network tab for API call:**
   ```
   GET /make-server-84f9c112/customers?page=1&limit=20
   ```

4. **Expected Response:**
   ```json
   {
     "success": true,
     "data": {
       "customers": [],
       "pagination": {
         "page": 1,
         "totalPages": 0,
         "totalCount": 0
       }
     }
   }
   ```

### **Step 3: Debug MembershipPage (Optional)**

If Customer Management works but MembershipPage doesn't:

**Check PillTabs component:**

```tsx
// File: /src/app/components/ui/pill-tabs.tsx
// Verify it's exported correctly
```

**Possible fix:**
- Re-export PillTabsContent if missing
- Check CSS classes
- Check if Radix UI dependencies installed

---

## 📝 **WHAT TO REPORT**

If you need help, please provide:

1. **Browser Console Errors** (screenshot or copy/paste)
2. **Network Tab** (any failed requests)
3. **Which page you're on** (`/admin/membership` or `/admin/loyalty`)
4. **Does hard refresh help?** (Ctrl + Shift + R)
5. **React DevTools component tree** (if installed)

---

## ✅ **SUCCESS INDICATORS**

Migration is working if:

### **On `/admin/loyalty` → Customer Management tab:**
- ✅ Tab switches work
- ✅ "Customer Management" tab shows
- ✅ Either shows empty state OR customer list
- ✅ No console errors about "column does not exist"
- ✅ Network tab shows successful API call

### **Example of working state:**

```
Customer Management Tab:
┌────────────────────────────────────┐
│  Search: [_________________] 🔍    │
│                                    │
│  No customers found                │
│  or                                │
│  Customer list with columns:       │
│  - Phone                           │
│  - Name                            │
│  - Email                           │
│  - Tier                            │
│  - Total Visits                    │
└────────────────────────────────────┘
```

---

## 🚀 **NEXT STEPS**

1. ✅ **Try `/admin/loyalty` page first**
   - This is where Customer Management lives
   - Separate from Loyalty Programs page

2. 🔍 **Check console and network tabs**
   - Screenshot any errors
   - Check API responses

3. 🧪 **Create test customer via Postman**
   - If list is empty, create a test customer
   - Refresh page to see it appear

4. ⚠️ **MembershipPage blank issue**
   - Separate problem (not related to Postgres migration)
   - Can be fixed later
   - Customer Management is more important

---

**Last Updated:** 2026-01-23  
**Status:** Debugging blank page issue  
**Priority:** Check `/admin/loyalty` instead
