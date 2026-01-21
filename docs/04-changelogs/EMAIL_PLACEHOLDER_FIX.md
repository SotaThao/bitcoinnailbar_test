# 🐛 FIXED: Email Placeholder Bug

## 📅 Date: January 21, 2026

---

## ❌ **Bug Description**

**Problem:** Email field in VLINKPAY payment form showed:
```
{email},thaob1203247@gmail.com
```

Instead of just:
```
thaob1203247@gmail.com
```

**Root Cause:** Frontend was **appending** email to URL instead of **replacing** the `{email}` placeholder.

---

## 🔍 **Technical Analysis**

### **Backend (Correct):**
```typescript
// payment.tsx - Line 224
const paymentUrl = buildVLinkPayURL({
  sandboxEndpoint: settings.sandboxEndpoint,
  amount,
  merchantOrderCode,
  customerEmail: '{email}', // ✅ Placeholder for frontend to replace
  merchantRefCode: settings.merchantRefCode,
  orderRedirectUrl: settings.redirectUrl
});
```

Backend correctly creates URL with `{email}` placeholder.

### **Frontend (Bug):**
```typescript
// PaymentModal.tsx - Line 69 (BEFORE)
const urlWithEmail = `${paymentUrl}&email=${encodeURIComponent(email)}`;
//                    ↑ ❌ APPENDING instead of REPLACING
```

This resulted in:
```
Original URL: ...email={email}&...
After append: ...email={email}&email=thaob1203247@gmail.com
              ↑ Placeholder not replaced!
```

---

## ✅ **Fix Applied**

### **Changed Code:**

**File:** `/src/app/components/membership/PaymentModal.tsx`

**Before (Line 69):**
```typescript
const handleEmailSubmit = () => {
  // ... validation code ...
  
  // ❌ BUG: Appending email instead of replacing
  const urlWithEmail = `${paymentUrl}&email=${encodeURIComponent(email)}`;
  setIframeUrl(urlWithEmail);
  setShowIframe(true);
};
```

**After (Fixed):**
```typescript
const handleEmailSubmit = () => {
  // ... validation code ...
  
  // ✅ FIX: Replace {email} placeholder
  const urlWithEmail = paymentUrl.replace('{email}', encodeURIComponent(email));
  setIframeUrl(urlWithEmail);
  setShowIframe(true);
};
```

---

## 🎯 **How It Works Now**

### **Step-by-Step Flow:**

1. **Backend generates URL with placeholder:**
   ```
   https://test-web-app.vlinkpay.com/embedded/payment-init?
     amount=990000&
     merchantOrderCode=ORD-1737450123456&
     email={email}&           ← Placeholder
     merchantRefCode=4ACDB05F&
     timestamp=1737450123456&
     orderRedirectUrl=...
   ```

2. **User enters email in modal:**
   ```
   User types: thaob1203247@gmail.com
   ```

3. **Frontend replaces placeholder:**
   ```typescript
   paymentUrl.replace('{email}', encodeURIComponent('thaob1203247@gmail.com'))
   ```

4. **Final URL sent to VLINKPAY iframe:**
   ```
   https://test-web-app.vlinkpay.com/embedded/payment-init?
     amount=990000&
     merchantOrderCode=ORD-1737450123456&
     email=thaob1203247%40gmail.com&    ← ✅ Replaced correctly
     merchantRefCode=4ACDB05F&
     timestamp=1737450123456&
     orderRedirectUrl=...
   ```

---

## 🧪 **Testing**

### **Test Case 1: Normal Email**
```
Input:  thaob1203247@gmail.com
Output: email=thaob1203247%40gmail.com  ✅
```

### **Test Case 2: Email with Plus Sign**
```
Input:  user+test@gmail.com
Output: email=user%2Btest%40gmail.com   ✅
```

### **Test Case 3: Special Characters**
```
Input:  user.name@example.co.uk
Output: email=user.name%40example.co.uk ✅
```

### **Test Case 4: Before Fix (Bug)**
```
Input:  test@gmail.com
Output: email={email}&email=test%40gmail.com  ❌ (duplicate)
```

---

## 📊 **Before vs After**

| Aspect | Before (Bug) | After (Fixed) |
|--------|--------------|---------------|
| **Email Parameter** | `{email},test@gmail.com` | `test@gmail.com` ✅ |
| **URL Encoding** | Broken (duplicate params) | Correct ✅ |
| **VLINKPAY Form** | Shows placeholder text | Shows only user email ✅ |
| **Payment Success** | May fail (wrong email) | Works correctly ✅ |

---

## 🔧 **Code Changes Summary**

### **Files Modified:**
1. **`/src/app/components/membership/PaymentModal.tsx`**
   - Line 69: Changed from append to replace

### **Change Type:**
- **Type:** Bug fix
- **Impact:** Critical (payment email was broken)
- **Lines Changed:** 1 line
- **Breaking Changes:** None

### **Diff:**
```diff
- const urlWithEmail = `${paymentUrl}&email=${encodeURIComponent(email)}`;
+ const urlWithEmail = paymentUrl.replace('{email}', encodeURIComponent(email));
```

---

## 🎯 **Impact**

### **User-Facing:**
- ✅ Email field in VLINKPAY form now shows correct email
- ✅ Redeem codes sent to correct email address
- ✅ Better user experience

### **Technical:**
- ✅ Proper URL parameter replacement
- ✅ Correct URL encoding
- ✅ No duplicate parameters

---

## ✅ **Verification Steps**

To verify the fix:

1. **Open:** `/membership` page
2. **Click:** "Join Now" on any tier
3. **Enter email:** `your-email@gmail.com`
4. **Click:** "Tiếp Tục Thanh Toán"
5. **Check VLINKPAY iframe:**
   - Email field should show: `your-email@gmail.com`
   - Should NOT show: `{email},your-email@gmail.com`

---

## 📝 **Related Issues**

### **Why Was This Not Caught Earlier?**

1. **Backend was correct** - placeholder pattern is standard
2. **Frontend logic error** - used append instead of replace
3. **No visible error** - URL was valid but had duplicate params
4. **First noticed** - when user tested and saw wrong email in form

### **Prevention:**

- ✅ Add URL validation in frontend
- ✅ Log final iframe URL in console (for debugging)
- ✅ Add E2E test for payment flow

---

## 🚀 **Deployment**

### **Status:** ✅ Fixed and Deployed

### **Rollback Plan:**
If issues occur, revert to:
```typescript
const urlWithEmail = `${paymentUrl}&email=${encodeURIComponent(email)}`;
```

But this is **NOT recommended** as it brings back the bug.

---

## 💡 **Lessons Learned**

1. **String replacement vs concatenation:**
   - Use `.replace()` for placeholders
   - Use template literals for building URLs from scratch

2. **URL parameters:**
   - Always encode with `encodeURIComponent()`
   - Avoid duplicate parameters

3. **Testing:**
   - Check final URLs before sending to third-party
   - Log important URLs for debugging

---

## 📞 **Support**

If email still shows incorrectly:

1. **Clear browser cache** (hard refresh)
2. **Check console** for URL being sent to iframe
3. **Verify** `paymentUrl` contains `{email}` placeholder
4. **Confirm** email is being replaced, not appended

---

**🎉 Bug Fixed! Email now correctly replaces placeholder instead of appending!**

---

## 🔗 **Related Documentation**

- `/docs/03-guides/PAYMENT_REDIRECT_URL.md` - Payment flow
- `/docs/QUICK_START_ENCRYPTION.md` - Encryption setup
- `/src/app/components/membership/PaymentModal.tsx` - Source code
