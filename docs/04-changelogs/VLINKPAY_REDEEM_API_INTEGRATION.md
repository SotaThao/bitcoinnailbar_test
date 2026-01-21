# VLINKPAY REDEEM API INTEGRATION

**Date:** January 21, 2026  
**Author:** System  
**Status:** ✅ Completed

---

## 📋 OVERVIEW

Integrated VLINKPAY external API validation into the redeem code flow. When users redeem a membership code, the system now calls VLINKPAY's `/gifthubs/public/merchant/redeem` endpoint to validate the code before activating the membership.

---

## 🔍 PROBLEM STATEMENT

### **Before:**
- Redeem code validation was only done internally (KV store lookup)
- No integration with VLINKPAY external API
- `merchantOrderCode` was generated but not saved to redemption data
- API Key was stored but never used

### **Issues Found:**
1. ❌ `merchantOrderCode` missing from redemption data structure
2. ❌ No external API call to VLINKPAY for verification
3. ❌ API Key was encrypted and stored but never decrypted/used

---

## ✅ SOLUTION IMPLEMENTED

### **1. Updated Payment Flow (`payment.tsx`)**

**Changes:**
- Added `merchantOrderCode` to redemption data structure
- Moved `generateMerchantOrderCode()` call before saving redemption data

**Before:**
```typescript
const redemptionData = {
  code: redeemCode,
  planId: planId || null,
  membershipTier: tierName.toLowerCase(),
  duration,
  amount,
  customerEmail: email || null,
  // ❌ merchantOrderCode missing
  status: 'pending',
  ...
};
```

**After:**
```typescript
const merchantOrderCode = generateMerchantOrderCode();
const redemptionData = {
  code: redeemCode,
  planId: planId || null,
  membershipTier: tierName.toLowerCase(),
  duration,
  amount,
  customerEmail: email || null,
  merchantOrderCode, // ✅ Added
  status: 'pending',
  ...
};
```

---

### **2. Updated Redeem Flow (`redeem.tsx`)**

**Changes:**
- Imported `decryptApiKey` from `vlinkpay-settings.tsx`
- Added VLINKPAY external API call in validation flow
- Proper error handling for external API failures

**New Validation Flow:**

```
User submits redeem code
    ↓
1. Validate code exists in KV store ✅
    ↓
2. Check if already redeemed ✅
    ↓
3. Check if expired ✅
    ↓
4. 🆕 Call VLINKPAY External API
   ├─ Fetch VLINKPAY settings from KV
   ├─ Decrypt API key (AES-256-GCM)
   ├─ POST {sandboxEndpoint}/gifthubs/public/merchant/redeem
   │  └─ Header: Api-key: {decrypted}
   │  └─ Body: { redeemCode, merchantOrderCode }
   ├─ If API ❌ → Return error immediately
   └─ If API ✅ → Continue
    ↓
5. Create membership in KV store ✅
    ↓
6. Mark code as redeemed ✅
    ↓
7. Return success to user ✅
```

**Code Implementation:**
```typescript
// 4.5. Call VLINKPAY External API to validate redeem code
console.log('🌐 [REDEEM] Calling VLINKPAY external API...');

try {
  // Get VLINKPAY settings
  const vlinkpaySettings = await kv.get('vlinkpay_settings');
  
  if (!vlinkpaySettings || !vlinkpaySettings.isActive) {
    return c.json({ 
      success: false, 
      error: 'Hệ thống thanh toán chưa được cấu hình.' 
    }, 500);
  }
  
  // Decrypt API key
  const decryptedApiKey = await decryptApiKey(vlinkpaySettings.apiKey);
  
  // Prepare external API request
  const externalApiUrl = `${vlinkpaySettings.sandboxEndpoint}/gifthubs/public/merchant/redeem`;
  const externalPayload = {
    redeemCode: normalizedCode,
    merchantOrderCode: redemption.merchantOrderCode
  };
  
  // Call external API
  const externalResponse = await fetch(externalApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-key': decryptedApiKey
    },
    body: JSON.stringify(externalPayload)
  });
  
  const externalData = await externalResponse.json();
  
  // Check if external API failed
  if (!externalResponse.ok) {
    const errorMessage = externalData?.message || externalData?.error || 'VLINKPAY validation failed';
    return c.json({ 
      success: false, 
      error: `Xác thực mã thất bại: ${errorMessage}` 
    }, externalResponse.status);
  }
  
  console.log('✅ [REDEEM] VLINKPAY API validation successful');
  
} catch (externalError) {
  return c.json({ 
    success: false, 
    error: `Lỗi kết nối với hệ thống thanh toán: ${externalError.message}` 
  }, 500);
}
```

---

## 🔑 API KEY USAGE MAPPING

### **Where is VLINKPAY API Key used?**

| **Location** | **Usage** | **Key Type** | **Status** |
|-------------|-----------|--------------|------------|
| `vlinkpay-settings.tsx` | Store encrypted API key | `apiKey` (encrypted) | ✅ Active |
| `vlinkpay-settings.tsx` | Store encrypted secret key | `secretKey` (encrypted) | ✅ Active |
| `payment.tsx` | Decrypt secret key for payment URL MD5 checksum | `secretKey` | ✅ Active |
| `redeem.tsx` | Decrypt API key for external redeem API | `apiKey` | 🆕 **NEW** |

### **Encryption Details:**
- **Algorithm:** AES-256-GCM
- **Key Source:** `VLINKPAY_ENCRYPTION_KEY` environment variable
- **Key Normalization:** SHA-256 hash (any string → 32 bytes)
- **Storage Format:** base64(iv + encrypted_data + auth_tag)

---

## 📊 DATA STRUCTURE CHANGES

### **Redemption Data Structure**

**Before:**
```typescript
{
  code: string,
  planId: string | null,
  membershipTier: string,
  duration: number,
  amount: number,
  customerEmail: string | null,
  status: 'pending' | 'redeemed',
  createdAt: string,
  expiresAt: string,
  redeemedAt: string | null,
  redeemedBy: string | null
}
```

**After:**
```typescript
{
  code: string,
  planId: string | null,
  membershipTier: string,
  duration: number,
  amount: number,
  customerEmail: string | null,
  merchantOrderCode: string, // 🆕 ADDED
  status: 'pending' | 'redeemed',
  createdAt: string,
  expiresAt: string,
  redeemedAt: string | null,
  redeemedBy: string | null
}
```

---

## 🧪 TESTING CHECKLIST

### **Before Testing:**
- [ ] Ensure VLINKPAY settings are configured in Admin Panel
- [ ] Verify `VLINKPAY_ENCRYPTION_KEY` is set in Supabase secrets
- [ ] Confirm sandbox endpoint is correct

### **Test Cases:**

#### **1. Successful Redeem Flow**
```bash
# Create payment link
POST /payment/create-link
Body: { tierName: "gold", duration: 3, amount: 99 }

# Expected: Returns redeemCode and paymentUrl
# Verify: redemption data includes merchantOrderCode

# Redeem the code
POST /redeem/validate
Body: { code: "BTCNAIL-XXXXX-XXXXX", userId: "user@email.com" }

# Expected:
# 1. Calls VLINKPAY API with Api-key header
# 2. VLINKPAY returns success
# 3. Membership created
# 4. Code marked as redeemed
```

#### **2. Invalid Code**
```bash
POST /redeem/validate
Body: { code: "INVALID-CODE", userId: "user@email.com" }

# Expected: Error "Mã không hợp lệ"
```

#### **3. Already Redeemed**
```bash
# Use same code twice
POST /redeem/validate
Body: { code: "ALREADY-USED", userId: "user@email.com" }

# Expected: Error "Mã này đã được sử dụng"
```

#### **4. VLINKPAY API Failure**
```bash
# Mock VLINKPAY API to return error
POST /redeem/validate
Body: { code: "BTCNAIL-XXXXX-XXXXX", userId: "user@email.com" }

# Expected: Error "Xác thực mã thất bại: {VLINKPAY error message}"
```

#### **5. Missing merchantOrderCode**
```bash
# Test with old redemption data (no merchantOrderCode)
POST /redeem/validate

# Expected: Error "Mã đơn hàng không tìm thấy"
```

---

## 📝 FILES MODIFIED

1. `/supabase/functions/server/payment.tsx`
   - Added `merchantOrderCode` to redemption data

2. `/supabase/functions/server/redeem.tsx`
   - Imported `decryptApiKey` from `vlinkpay-settings.tsx`
   - Added VLINKPAY external API call logic
   - Added comprehensive error handling

3. `/docs/04-changelogs/VLINKPAY_REDEEM_API_INTEGRATION.md`
   - Created this documentation

---

## 🚨 IMPORTANT NOTES

### **Security Considerations:**
1. ✅ API key is never exposed to frontend
2. ✅ API key is encrypted at rest (AES-256-GCM)
3. ✅ API key is only decrypted in server-side functions
4. ✅ External API calls are logged for debugging
5. ⚠️ Ensure `VLINKPAY_ENCRYPTION_KEY` is kept secure

### **Error Handling:**
- Network failures are caught and return user-friendly messages
- VLINKPAY API errors are logged with full context
- All errors include Vietnamese translations for users

### **Backward Compatibility:**
- ⚠️ Old redemption codes (created before this update) will NOT have `merchantOrderCode`
- These codes will fail validation with error: "Mã đơn hàng không tìm thấy"
- **Solution:** Migrate old codes or create new ones

---

## 🔄 MIGRATION GUIDE

### **For Existing Redemption Codes:**

If you have existing redemption codes created before this update, you need to migrate them:

```typescript
// Migration script (run in Supabase Edge Function or manually)
const migrateOldRedemptionCodes = async () => {
  // Get all redemption codes
  const allCodes = await kv.getByPrefix('redeem_code:');
  
  for (const codeData of allCodes) {
    if (!codeData.merchantOrderCode) {
      // Generate merchantOrderCode for old codes
      codeData.merchantOrderCode = `ORDER-${Date.now()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
      
      // Save back to KV
      await kv.set(`redeem_code:${codeData.code}`, codeData);
      console.log(`✅ Migrated: ${codeData.code}`);
    }
  }
};
```

---

## ✅ COMPLETION CHECKLIST

- [x] Updated `payment.tsx` to save `merchantOrderCode`
- [x] Updated `redeem.tsx` to call VLINKPAY external API
- [x] Imported `decryptApiKey` function
- [x] Added comprehensive error handling
- [x] Added detailed logging for debugging
- [x] Created documentation
- [ ] **TODO:** Run migration for existing codes (if needed)
- [ ] **TODO:** Test with real VLINKPAY sandbox environment
- [ ] **TODO:** Update frontend error messages if needed

---

## 📞 SUPPORT

If you encounter issues:

1. Check backend logs in Supabase Edge Functions
2. Verify VLINKPAY settings in Admin Panel
3. Confirm `VLINKPAY_ENCRYPTION_KEY` is set
4. Test with fresh redemption codes (not old ones)

**Key Log Indicators:**
- `🌐 [REDEEM] Calling VLINKPAY external API...` - External API call started
- `✅ [REDEEM] VLINKPAY API validation successful` - External API success
- `❌ [REDEEM] VLINKPAY API returned error:` - External API failure
- `🔐 [REDEEM] Decrypting VLINKPAY API key...` - Decryption started

---

**End of Documentation**
