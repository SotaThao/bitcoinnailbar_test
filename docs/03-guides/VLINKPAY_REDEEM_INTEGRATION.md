# VLinkPay Redeem Integration Guide

## 📋 Overview

Tài liệu này mô tả integration với **VLinkPay Merchant Redeem API** để xác nhận thanh toán và ghi nhận doanh thu khi user activate membership code.

---

## 🎯 Critical Logic

### ⚠️ QUAN TRỌNG: HTTP Status Code ONLY

```
HTTP Status 200 = SUCCESS → Allow membership activation
HTTP Status 400/Other = FAILURE → Block activation
```

**Response body PHẢI được IGNORE hoàn toàn**, theo spec của VLinkPay:

> "Nếu API này trả về Http Status Code = 200 (Success) thì cho phép redeem thành công, không cần quan tâm đến các API khác."

### Why Ignore Response Body?

VLinkPay có thể trả về HTTP 200 với response body chứa error messages (ví dụ: "Card không đủ số dư"), nhưng điều này **KHÔNG ảnh hưởng** đến quyết định approve redeem:

- ✅ HTTP 200 → Revenue đã được recorded vào UDSV wallet → Allow redeem
- ❌ HTTP 400 → Revenue KHÔNG được recorded → Block redeem

---

## 🔌 API Specification

### Endpoint
```
POST {SANDBOX_ENDPOINT}/gifthubs/public/merchant/redeem
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Api-key": "{SECRET_KEY}"
}
```

### Request Body
```json
{
  "redeemCode": "ABC123",
  "merchantOrderCode": "ORDER_12345"
}
```

### Response
- **HTTP 200**: Success → Revenue recorded in UDSV wallet
- **HTTP 400**: Failure → Revenue NOT recorded

---

## 🔄 Redemption Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User nhập redeem code và click "Activate"               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend validate code:                                   │
│    - Code tồn tại trong KV store?                           │
│    - Chưa được redeem?                                      │
│    - Chưa expired?                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Call VLinkPay Redeem API                                 │
│    POST /gifthubs/public/merchant/redeem                    │
│    Body: { redeemCode, merchantOrderCode }                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Check ONLY HTTP Status Code                              │
│    ⚠️  IGNORE response body content!                        │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────┐            ┌─────────┐
    │ Status  │            │ Status  │
    │  = 200  │            │ ≠ 200   │
    └────┬────┘            └────┬────┘
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌──────────────────┐
│ ✅ Allow Redeem  │   │ ❌ Block Redeem  │
│ - Create member  │   │ - Return error   │
│ - Mark as used   │   │ - Show message   │
└──────────────────┘   └──────────────────┘
```

---

## 💻 Implementation

### Backend: `/supabase/functions/server/redeem.tsx`

```typescript
// Call VLinkPay API
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Api-key': decryptedSecretKey
  },
  body: JSON.stringify({
    redeemCode: normalizedCode,
    merchantOrderCode: redemption.merchantOrderCode
  })
});

const responseText = await response.text();

// ⚠️ CRITICAL: ONLY check HTTP status code, IGNORE response body
if (response.status === 200) {
  console.log('✅ SUCCESS! VLinkPay confirmed order (HTTP 200)');
  console.log('⚠️  Response body ignored per VLinkPay spec');
  vlinkpayConfirmed = true;
  // Proceed with membership activation...
} else {
  console.error(`❌ VLinkPay returned non-200 status: ${response.status}`);
  // Block activation
}
```

### Key Points:
1. **NO parsing** của response body JSON
2. **NO checking** error/success/message fields
3. **ONLY** check: `response.status === 200`

---

## 🐛 Troubleshooting

### Issue: "Card không đủ số dư" nhưng HTTP 200

**Nguyên nhân:**
- VLinkPay trả về HTTP 200 (success)
- Response body có error message "Card không đủ số dư"
- Code cũ parse response body và show error → SAI!

**Giải pháp:**
- ✅ IGNORE response body
- ✅ Chỉ check HTTP status === 200
- ✅ Cho phép redeem ngay khi HTTP 200

**Why?**
VLinkPay đã ghi nhận revenue vào UDSV wallet khi trả về HTTP 200. Error messages trong response body là thông tin internal của VLinkPay (ví dụ: balance check của payment method), không ảnh hưởng đến merchant settlement.

---

### Issue: VLinkPay API trả về 400

**Possible Causes:**
1. **Invalid API Key**: Kiểm tra Secret Key trong VLINKPAY Settings
2. **Invalid redeemCode**: Code không tồn tại trong VLinkPay system
3. **Invalid merchantOrderCode**: Order không found
4. **Network timeout**: VLinkPay server không response

**Next Steps:**
1. Check backend logs để xem exact error
2. Verify API credentials trong Admin > VLINKPAY Settings
3. Check VLinkPay dashboard để confirm order status
4. Contact VLinkPay support với: redeemCode + merchantOrderCode

---

### Issue: Code expired hoặc already used

**Causes:**
- Code đã được redeem trước đó
- Code đã quá expiration date (thường 30 ngày)

**Next Steps:**
1. Check code status trong Admin > Customers Data > Redeem Codes tab
2. Nếu code hợp lệ nhưng bị expired, có thể manual extend trong database
3. Issue new code for customer nếu cần

---

## 🔐 Security Notes

### API Key Encryption
- Secret Key được encrypt trong database (AES-256-GCM)
- Decrypt chỉ khi cần call VLinkPay API
- Never log decrypted key (chỉ log masked: `ABC...XYZ`)

### Code Validation
- Codes được normalize: UPPERCASE + trim()
- Check expiration trước khi call VLinkPay
- Check duplicate redemption để tránh race condition

---

## 📊 Monitoring

### Logs to Watch

**Success Case:**
```
🌐 [REDEEM] Calling VLINKPAY API to confirm order...
📥 [REDEEM] VLinkPay Response Status: 200 OK
✅ [REDEEM] SUCCESS! VLinkPay confirmed order (HTTP 200)
💰 [REDEEM] Revenue will be recorded in UDSV wallet
⚠️  [REDEEM] Response body ignored per VLinkPay spec
✅ [REDEEM] VLinkPay confirmation successful - proceeding with activation!
```

**Failure Case:**
```
🌐 [REDEEM] Calling VLINKPAY API to confirm order...
📥 [REDEEM] VLinkPay Response Status: 400 Bad Request
❌ [REDEEM] VLinkPay returned non-200 status: 400
🚨 [REDEEM] VLINKPAY CONFIRMATION FAILED
⚠️  CRITICAL: Revenue will NOT be recorded in UDSV wallet
```

---

## 📚 References

- **VLinkPay Merchant API Docs**: (Internal)
- **Redeem Endpoint**: `/supabase/functions/server/redeem.tsx`
- **Admin Dashboard**: Admin > Customers Data > Redeem Codes tab
- **Settings**: Admin > VLINKPAY Settings

---

## 🔄 Changelog

### 2026-01-23: Critical Fix - Ignore Response Body
- **Issue**: VLinkPay trả về HTTP 200 nhưng response body có error → code cũ block activation
- **Fix**: Simplify logic - CHỈ check HTTP status code, IGNORE response body hoàn toàn
- **Impact**: Redeem sẽ work correctly theo VLinkPay spec

### Previous: Initial Implementation
- Integrate VLinkPay Redeem API
- Add retry mechanism với code variations
- Add extensive logging

---

## ✅ Testing Checklist

- [ ] Test redeem với valid code → Should succeed với HTTP 200
- [ ] Verify response body có error message → Should still succeed
- [ ] Test redeem với invalid code → Should fail với HTTP 400
- [ ] Test redeem với expired code → Should block trước khi call VLinkPay
- [ ] Test redeem với already-used code → Should block trước khi call VLinkPay
- [ ] Check backend logs → Should see "Response body ignored" message
- [ ] Check VLinkPay dashboard → Revenue should be recorded
- [ ] Check Admin dashboard → Code status should update to "used"

---

**Last Updated**: January 23, 2026  
**Maintained By**: Backend Team  
**Status**: ✅ Production Ready
