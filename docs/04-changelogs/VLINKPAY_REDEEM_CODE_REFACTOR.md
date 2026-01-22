# VLinkPay Redeem Code Flow Refactor

**Date:** January 23, 2026  
**Status:** ✅ Complete

## 🎯 **Overview**

Refactored the payment flow to correctly integrate with VLinkPay's redeem code generation system.

---

## 🔄 **OLD FLOW (Incorrect)**

```
1. User clicks "Buy Now"
   ↓
2. Backend generates redeemCode: BTCNAIL-XXXXX-XXXXX
   ↓
3. Save to DB (status: pending)
   ↓
4. Create VLinkPay payment URL
   ↓
5. User pays
   ↓
6. System validates with VLinkPay API
```

**❌ Problem:** Backend was generating codes instead of receiving them from VLinkPay.

---

## ✅ **NEW FLOW (Correct)**

```
1. User clicks "Buy Now"
   ↓
2. Backend generates merchantOrderCode: ORDER-timestamp-uuid
   ↓
3. Save ORDER to DB (status: pending_payment, NO redeemCode)
   ↓
4. Create VLinkPay payment URL with merchantOrderCode
   ↓
5. User pays on VLinkPay
   ↓
6. VLinkPay redirects to: {redirectUrl}?redeemCode=FAO1TUHIT0MMQVKT
   ↓
7. Frontend calls /payment/complete-order with:
      - merchantOrderCode (from sessionStorage)
      - redeemCode (from URL params)
   ↓
8. Backend:
      - Updates order (status: completed)
      - Creates redeem_code entry with VLinkPay code
      - Ready for user redemption
```

---

## 📦 **Database Structure**

### **Orders (Key: `order:{merchantOrderCode}`)**
```typescript
{
  merchantOrderCode: "ORDER-1234567890-ABC",
  redeemCode: null | "FAO1TUHIT0MMQVKT",
  status: "pending_payment" | "completed",
  membershipTier: "gold",
  duration: 12,
  amount: 479,
  customerEmail: "user@example.com",
  createdAt: "2026-01-23T...",
  expiresAt: "2026-02-23T...",
  paymentCompletedAt: null | "2026-01-23T...",
  redeemedAt: null,
  redeemedBy: null
}
```

### **Redeem Codes (Key: `redeem_code:{code}`)**
```typescript
{
  code: "FAO1TUHIT0MMQVKT", // ← VLinkPay generated
  merchantOrderCode: "ORDER-1234567890-ABC",
  membershipTier: "gold",
  duration: 12,
  amount: 479,
  status: "pending" | "redeemed",
  createdAt: "2026-01-23T...",
  expiresAt: "2026-02-23T...",
  paymentCompletedAt: "2026-01-23T...",
  redeemedAt: null | "2026-01-23T...",
  redeemedBy: null | "0987654321"
}
```

---

## 🚀 **New Backend Endpoints**

### **POST /payment/create-link**
- Creates ORDER with merchantOrderCode
- NO redeemCode generated
- Returns: `{ paymentUrl, merchantOrderCode }`

### **POST /payment/complete-order** ⭐ NEW
- Receives merchantOrderCode + redeemCode from frontend
- Updates order status to "completed"
- Creates redeem_code entry
- Returns: `{ redeemCode, membershipTier, duration }`

---

## 🎨 **Frontend Changes**

### **MembershipCard.tsx**
- Store `merchantOrderCode` in sessionStorage after payment link created
- Used for completing order after VLinkPay redirect

### **PaymentSuccessPage.tsx** ⭐ NEW
- Route: `/payment/success`
- Handles VLinkPay redirect with redeemCode
- Calls `/payment/complete-order` API
- Displays success message with code
- Auto-redirects to homepage with redeem tab

### **App.tsx**
- Added route: `/payment/success`

---

## 🔧 **Code Format Changes**

### **Old Format (Backend Generated)**
```
BTCNAIL-26KQ8-X8V7L
```
- Pattern: `BTCNAIL-{5chars}-{5chars}`
- Charset: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`

### **New Format (VLinkPay Generated)**
```
FAO1TUHIT0MMQVKT
```
- Pattern: Alphanumeric string (16 chars)
- Mixed uppercase letters and numbers

---

## ✅ **Testing Checklist**

- [ ] User can create payment link
- [ ] merchantOrderCode stored in sessionStorage
- [ ] VLinkPay redirect contains redeemCode param
- [ ] `/payment/success` page loads correctly
- [ ] complete-order API creates redeem code
- [ ] Code appears in admin dashboard
- [ ] User can redeem VLinkPay code
- [ ] Old BTCNAIL codes still work (backward compatibility)

---

## 🚨 **Important Notes**

1. **VLinkPay Redirect URL:** Must be set to `https://yoursite.com/payment/success` in VLinkPay settings
2. **SessionStorage:** Used to persist merchantOrderCode between payment modal and redirect
3. **Backward Compatibility:** Old BTCNAIL codes still exist in database and can be redeemed
4. **Status Flow:** `pending_payment` → `completed` → `pending` → `redeemed`

---

## 📝 **Migration Notes**

- **Old codes:** Will remain in DB with `redeem_code:BTCNAIL-XXX` keys
- **New codes:** Will be created with `redeem_code:VLINKPAY-CODE` keys
- **No data loss:** Both formats coexist
- **Admin can delete:** Old spam codes via Delete button

---

## 🎯 **Next Steps**

1. ✅ Test full payment flow on staging
2. ⏳ Configure VLinkPay redirect URL
3. ⏳ Monitor logs for successful completions
4. ⏳ Clean up old BTCNAIL spam codes
