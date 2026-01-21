# AMOUNT FORMAT TESTING GUIDE

**Date:** January 21, 2026  
**Purpose:** Test different amount formats to find what VLINKPAY expects  
**Status:** 🧪 Testing in Progress

---

## 📋 TESTING SUMMARY

### **Problem:**
VLINKPAY rejects payments with error: **"Your amount is invalid"**

### **Hypothesis:**
Amount format mismatch - VLINKPAY might expect different format than we're sending.

---

## 🧪 TEST CASES

### **Test #1: DECIMAL FORMAT (479.00)** ❌

**Code:**
```typescript
const formattedAmount = params.amount.toFixed(2);  // "479.00"
```

**Example URL:**
```
?amount=479.00&merchantOrderCode=ORDER-123...
```

**Result:**  
❌ **FAILED** - "Your amount is invalid"

**Status:** ✅ Tested

---

### **Test #2: INTEGER FORMAT (479)** 🧪

**Code:**
```typescript
const formattedAmount = Math.floor(params.amount).toString();  // "479"
```

**Example URL:**
```
?amount=479&merchantOrderCode=ORDER-123...
```

**Result:**  
🧪 **ACTIVE TEST** - Code deployed, ready to test

**Status:** 🚀 Ready for testing

---

### **Test #3: CENTS FORMAT (47900)** ❌

**Code:**
```typescript
const formattedAmount = Math.floor(params.amount * 100).toString();  // "47900"
```

**Example URL:**
```
?amount=47900&merchantOrderCode=ORDER-123...
```

**Calculation:**
```
$479.00 × 100 = 47900 cents
```

**Result:**  
❌ **FAILED** - VLINKPAY interprets as **$47,900.00** (wrong!)

**Status:** ✅ Tested - NOT the correct format

---

### **Test #4: VND FORMAT (11975000)** ⏹️

**Code:**
```typescript
const formattedAmount = Math.floor(params.amount * 25000).toString();  // "11975000"
```

**Example URL:**
```
?amount=11975000&merchantOrderCode=ORDER-123...
```

**Calculation:**
```
$479.00 × 25,000 VND/USD = 11,975,000 VND
```

**Result:**  
⏹️ **Not tested yet** - Will test if cents format fails

**Status:** ⏸️ On hold

---

## 🔧 CURRENT IMPLEMENTATION

### **Active Test: INTEGER FORMAT**

The backend is currently configured to test **INTEGER format (amount)**.

**File:** `/supabase/functions/server/payment.tsx`

```typescript
// Build VLINKPAY payment URL (IFRAME)
const buildVLinkPayURL = (params: {
  sandboxEndpoint: string;
  amount: number;
  merchantOrderCode: string;
  customerEmail: string;
  merchantRefCode: string;
  orderRedirectUrl: string;
  secretKey: string;
}): string => {
  const url = new URL(`${params.sandboxEndpoint}/embedded/payment-init`);
  const timestamp = Date.now();
  
  // 🧪 ACTIVE TEST: Format 2 - INTEGER (amount)
  const formattedAmount = Math.floor(params.amount).toString();
  console.log('🧪 [TEST] Amount format: INTEGER');
  console.log('🧪 [TEST] Original amount:', params.amount);
  console.log('🧪 [TEST] Formatted amount:', formattedAmount);
  console.log('🧪 [TEST] Calculation:', `${params.amount} = ${formattedAmount}`);
  
  // Generate MD5 checksum (still using decimal format)
  const checksum = generateChecksum({
    amount: params.amount,  // Converts to "479.00" internally
    merchantOrderCode: params.merchantOrderCode,
    email: params.customerEmail,
    merchantRefCode: params.merchantRefCode,
    timestamp,
    secretKey: params.secretKey
  });
  
  console.log('⚠️ [TEST] Checksum uses DECIMAL format (479.00) while URL uses INTEGER (479)');
  console.log('⚠️ [TEST] If payment fails, may need to update checksum to use integer too');
  
  url.searchParams.append('amount', formattedAmount);  // ← Using INTEGER
  url.searchParams.append('merchantOrderCode', params.merchantOrderCode);
  url.searchParams.append('email', params.customerEmail);
  url.searchParams.append('merchantRefCode', params.merchantRefCode);
  url.searchParams.append('checksum', checksum);
  url.searchParams.append('timestamp', timestamp.toString());
  url.searchParams.append('orderRedirectUrl', params.orderRedirectUrl);
  
  return url.toString();
};
```

---

## 📊 EXPECTED CONSOLE OUTPUT

When you create a payment link, you should see:

```
💳 [PAYMENT] Creating payment link...
🔐 [PAYMENT] Decrypting secret key...
✅ [PAYMENT] Secret key decrypted successfully
✅ [PAYMENT] Generated redeem code: BTCNAIL-XYZ12-ABC34
💾 [PAYMENT] Saved redeem code to database

🧪 [TEST] Amount format: INTEGER
🧪 [TEST] Original amount: 479
🧪 [TEST] Formatted amount: 479
🧪 [TEST] Calculation: 479 = 479

🔐 [CHECKSUM] Generated MD5 checksum for payment URL
🔐 [CHECKSUM] Amount format: 479.00

⚠️ [TEST] Checksum uses DECIMAL format (479.00) while URL uses INTEGER (479)
⚠️ [TEST] If payment fails, may need to update checksum to use integer too

✅ [PAYMENT] Payment link created successfully
```

---

## 🎯 TESTING PROCEDURE

### **Step 1: Deploy Backend**

The code is already updated. Just refresh your browser to use the new backend.

### **Step 2: Create Payment Link**

1. Go to membership page
2. Click "Buy" on any tier
3. Enter email
4. Click "Continue to Payment"

### **Step 3: Check Console Logs**

Open browser console (F12) and look for:

```javascript
🧪 [TEST] Amount format: INTEGER
🧪 [TEST] Original amount: 479
🧪 [TEST] Formatted amount: 479
```

### **Step 4: Copy Payment URL**

Look in console for:

```javascript
🔗 PAYMENT URL GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: your@email.com
💳 Tier: PLATINUM
💰 Amount: 479
🔗 Payment URL: https://test-web-app.vlinkpay.com/embedded/payment-init?amount=479&...
                                                                          ↑↑↑↑↑↑
                                                                      Should be INTEGER!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **Step 5: Verify Amount in URL**

Check the URL parameter:
```
?amount=479  ✅ Correct (integer format)
```

NOT:
```
?amount=479.00  ❌ Wrong (decimal format)
?amount=47900  ❌ Wrong (cents format)
```

### **Step 6: Test Payment**

1. Open payment iframe
2. Attempt payment
3. Check VLINKPAY response

### **Step 7: Report Results**

#### **If SUCCESS ✅:**
```
✅ Payment accepted
✅ No "amount invalid" error
→ INTEGER format is correct!
→ Update code to permanently use integer format
```

#### **If FAILED ❌:**

**Check error message:**

**A. "Your amount is invalid"**
```
→ Integer format also wrong
→ Need to contact VLINKPAY for correct format
→ Try VND format or ask support
```

**B. "Invalid checksum"**
```
→ Amount format might be OK
→ But checksum calculation needs update
→ Update generateChecksum to use integer too
```

**C. Other error**
```
→ Different issue
→ Check error message details
→ May not be amount-related
```

---

## ⚠️ IMPORTANT NOTES

### **1. Checksum Mismatch Risk**

**Current State:**
- URL amount: `479` (integer)
- Checksum: Uses `479.00` (decimal)

**Potential Issue:**

If VLINKPAY recalculates checksum using integer format:

```javascript
// VLINKPAY might do:
receivedChecksum = "abc123def..."
calculatedChecksum = MD5("479" + order + email + ...)  // Using integer!
                   = "xyz789ghi..."  // Different!

// Result: "Invalid checksum" error
```

**Solution if this happens:**

Update `generateChecksum` to also use integer:

```typescript
const generateChecksum = (params: {
  amount: number;
  // ... other params
}): string => {
  // Change from:
  // const formattedAmount = params.amount.toFixed(2);  // "479.00"
  
  // To:
  const formattedAmount = Math.floor(params.amount).toString();  // "479"
  
  const dataString = `${formattedAmount}${params.merchantOrderCode}...`;
  return createHash('md5').update(dataString).digest('hex');
};
```

---

### **2. Test with Different Amounts**

Test with various amounts to verify format:

| Original | Integer Format | Expected URL |
|----------|-------------|--------------|
| $1.00 | 1 | `?amount=1` |
| $10.50 | 10 | `?amount=10` |
| $99.99 | 99 | `?amount=99` |
| $479.00 | 479 | `?amount=479` |
| $999.50 | 999 | `?amount=999` |

---

### **3. Integer Rounding**

Using `Math.floor()` to ensure integer:

```javascript
Math.floor(479.00)  // 479 ✅
Math.floor(479.99)  // 479 ✅
Math.floor(479.50)  // 479 ✅

// Handles floating point precision issues:
Math.floor(479.10)  // 479 ✅
// Not: 47909.999999999 ❌
```

---

## 📝 TEST RESULTS LOG

### **Test #1: Decimal Format**
- **Date:** [Previous test]
- **Amount:** `479.00`
- **Result:** ❌ "Your amount is invalid"
- **Conclusion:** Decimal format rejected

### **Test #2: Integer Format**
- **Date:** [Current test]
- **Amount:** `479`
- **Result:** 🧪 In progress
- **Conclusion:** TBD

### **Test #3: Cents Format**
- **Date:** [Previous test]
- **Amount:** `47900`
- **Result:** ❌ VLINKPAY interprets as **$47,900.00** (wrong!)
- **Conclusion:** Cents format rejected

---

## 🔄 NEXT STEPS BASED ON RESULTS

### **If Integer Format Works ✅:**

1. **Update code permanently:**
   ```typescript
   // Keep integer format
   const formattedAmount = Math.floor(params.amount).toString();
   ```

2. **Update checksum to match:**
   ```typescript
   // Update generateChecksum to use integer
   const formattedAmount = Math.floor(params.amount).toString();
   ```

3. **Document the format:**
   - Update API documentation
   - Add comments explaining integer format
   - Update frontend to display amounts correctly

4. **Test edge cases:**
   - Small amounts: $0.01, $0.50
   - Large amounts: $1000, $10000
   - Fractional cents: $1.99, $99.95

---

### **If Integer Format Fails ❌:**

1. **Contact VLINKPAY Support:**
   ```
   Subject: Amount Format Specification
   
   Hi VLINKPAY Team,
   
   We're getting "Your amount is invalid" errors. 
   We've tested:
   - Decimal: 479.00 ❌
   - Integer: 479 ❌
   - Cents: 47900 ❌
   
   What is the expected format for the `amount` parameter?
   - Currency: USD? VND? Other?
   - Format: Decimal? Integer? Cents? Smallest unit?
   - Example: For $479.00 USD, what should `amount` be?
   
   Thanks!
   ```

2. **Try VND Format (if applicable):**
   ```typescript
   const formattedAmount = Math.floor(params.amount * 25000).toString();
   // $479 × 25,000 = 11,975,000 VND
   ```

3. **Check Documentation:**
   - Review VLINKPAY API docs
   - Look for example requests
   - Check merchant dashboard for hints

---

## 📞 VLINKPAY SUPPORT QUESTIONS

If contacting support, ask these specific questions:

1. **Amount Format:**
   - "What is the expected format for the `amount` parameter?"
   - "Is it decimal (479.00), integer (479), or cents (47900)?"

2. **Currency:**
   - "What currency does `amount` represent?"
   - "Is there a separate `currency` parameter?"

3. **Checksum:**
   - "Should `amount` in checksum match the URL format?"
   - "Example: If URL has `amount=47900`, should checksum use '47900' or '479.00'?"

4. **Example:**
   - "Can you provide a complete example request for $479.00 USD?"
   - "Including amount, checksum, and all parameters?"

---

## ✅ TESTING CHECKLIST

- [x] Test #1: Decimal format (479.00) - ❌ Failed
- [ ] Test #2: Integer format (479) - 🧪 Ready to test
- [ ] Test #3: Cents format (47900) - ❌ Failed
- [ ] Verify console logs show correct format
- [ ] Check payment URL contains integer amount
- [ ] Attempt payment and record result
- [ ] If fails, check if checksum or amount issue
- [ ] Document final working format
- [ ] Update code to use correct format permanently

---

## 🎯 SUCCESS CRITERIA

Test is successful when:

1. ✅ VLINKPAY accepts payment (no "amount invalid" error)
2. ✅ Checksum validation passes
3. ✅ Payment can be completed
4. ✅ Amount displayed correctly in VLINKPAY UI
5. ✅ Transaction processes with correct amount

---

**End of Testing Guide**