# Manual Redeem Code Creation Guide

## Overview

This guide explains how to create manual/test redeem codes that **skip VLinkPay validation**, useful for:
- 🎁 **Gift codes** (promotional giveaways)
- 🧪 **Test codes** (development/QA testing)
- 💼 **Comp codes** (complimentary memberships for partners)
- 🎫 **Offline sales** (codes sold outside VLinkPay)

---

## ⚠️ Important Concepts

### **Two Types of Redeem Codes:**

| Type | Source | VLinkPay Validation | merchantOrderCode |
|------|--------|-------------------|-------------------|
| **Payment Codes** | Created via `/payment/create-order` | ✅ **REQUIRED** | Auto-generated: `BNB-{timestamp}-{random}` |
| **Manual Codes** | Created manually in Admin/Supabase | ❌ **SKIPPED** | Not required (can be null or placeholder) |

---

## 🔧 Manual Code Data Structure

### **Minimal Structure:**

```json
{
  "code": "YBQSBCLUB7GH0GSN",
  "membershipTier": "gold",
  "duration": 6,
  "amount": 99.99,
  "status": "unused",
  "expiresAt": "2026-02-23T00:00:00Z",
  "isManualCode": true,
  "createdBy": "admin",
  "createdAt": "2026-01-23T10:00:00Z"
}
```

### **Complete Structure (Recommended):**

```json
{
  "code": "YBQSBCLUB7GH0GSN",
  "membershipTier": "gold",
  "duration": 6,
  "amount": 99.99,
  "status": "unused",
  "expiresAt": "2026-02-23T00:00:00Z",
  "isManualCode": true,
  "merchantOrderCode": "MANUAL-GIFT-001",
  "customerEmail": "customer@example.com",
  "createdBy": "admin",
  "createdAt": "2026-01-23T10:00:00Z",
  "notes": "Promotional gift code for Facebook campaign"
}
```

---

## 📊 Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | ✅ Yes | Unique redeem code (uppercase) |
| `membershipTier` | `"gold"` \| `"platinum"` \| `"diamond"` | ✅ Yes | Membership tier |
| `duration` | number | ✅ Yes | Duration in months (e.g., 6, 12) |
| `amount` | number | ✅ Yes | Dollar amount (for tracking) |
| `status` | `"unused"` \| `"used"` | ✅ Yes | Code status |
| `expiresAt` | ISO date | ✅ Yes | Expiration date |
| `isManualCode` | boolean | ✅ Yes | **MUST be `true`** to skip VLinkPay |
| `merchantOrderCode` | string | ⚠️ Optional | Placeholder for tracking (e.g., "MANUAL-001") |
| `customerEmail` | string | ❌ No | Optional email for notifications |
| `createdBy` | string | ❌ No | Who created this code |
| `notes` | string | ❌ No | Internal notes |

---

## 🎯 Backend Logic

### **VLinkPay Validation Flow:**

```typescript
// Check if this is a manual/test code
if (redemption.isManualCode === true) {
  log.info('🧪 Manual/Test code detected - SKIPPING VLinkPay validation');
  vlinkpayConfirmed = true;
} else {
  // Regular payment code - MUST validate with VLinkPay
  log.info('💳 Payment code - VLinkPay validation REQUIRED');
  
  // Validate merchantOrderCode exists
  if (!redemption.merchantOrderCode) {
    return error('Mã đơn hàng không tìm thấy');
  }
  
  // Call VLinkPay API
  const response = await fetch('/gifthubs/public/merchant/redeem', {
    body: { redeemCode, merchantOrderCode }
  });
  
  vlinkpayConfirmed = (response.status === 200);
}
```

---

## 📝 How to Create Manual Codes

### **Option 1: Via Supabase Dashboard**

1. Go to Supabase Dashboard → Table `kv_store_89edbd69`
2. Insert new row:
   - **key:** `redeem_code:YBQSBCLUB7GH0GSN`
   - **value:** (paste JSON structure above)

### **Option 2: Via Admin Panel (Future)**

```typescript
// TODO: Create admin endpoint
POST /admin/redeem-codes/create
Body: {
  membershipTier: "gold",
  duration: 6,
  amount: 99.99,
  quantity: 10, // Generate 10 codes
  expiresInDays: 30,
  notes: "Promotional campaign"
}
```

---

## ✅ Example: Test Code for YBQSBCLUB7GH0GSN

**To fix your current error**, update the KV store:

### **KV Key:**
```
redeem_code:YBQSBCLUB7GH0GSN
```

### **KV Value:**
```json
{
  "code": "YBQSBCLUB7GH0GSN",
  "membershipTier": "gold",
  "duration": 6,
  "amount": 99.99,
  "status": "unused",
  "expiresAt": "2026-12-31T23:59:59Z",
  "isManualCode": true,
  "merchantOrderCode": "TEST-MANUAL-001",
  "customerEmail": null,
  "createdBy": "admin_test",
  "createdAt": "2026-01-23T10:00:00Z",
  "notes": "Test code for debugging redeem flow"
}
```

**Key Change:**
- ✅ Added `"isManualCode": true`
- ✅ Added placeholder `merchantOrderCode`
- ✅ Backend will skip VLinkPay validation

---

## 🧪 Testing Manual Codes

### **Test Flow:**

1. **Create manual code** in KV store with `isManualCode: true`
2. **Go to redeem page:** `/membership-packages`
3. **Enter code:** `YBQSBCLUB7GH0GSN`
4. **Enter phone:** `(555) 425-1252`
5. **Click "Kích hoạt Membership"**

### **Expected Backend Logs:**

```
🔍 [REDEEM] Validating code: YBQSBCLUB7GH0GSN
📋 [REDEEM] Querying database...
🌐 [REDEEM] Checking if VLinkPay validation is needed...
🧪 [REDEEM] Manual/Test code detected - SKIPPING VLinkPay validation
   This code was created manually and does not require payment confirmation
✅ [REDEEM] Code validated successfully, proceeding with membership creation...
```

---

## 🚨 Security Considerations

### **⚠️ Manual codes bypass revenue tracking!**

**Recommendations:**
1. ✅ **Track all manual codes** with `createdBy` and `notes`
2. ✅ **Set expiration dates** (don't make codes valid forever)
3. ✅ **Monitor usage** via admin dashboard
4. ✅ **Log all redemptions** for audit trail
5. ⚠️ **Don't share codes publicly** (they skip payment validation)

### **Revenue Reconciliation:**

```
Payment Codes → VLinkPay records revenue automatically
Manual Codes → Manually track in accounting system
```

---

## 📊 Use Cases

### **Use Case 1: Promotional Giveaway**
```json
{
  "code": "FACEBOOK2026",
  "membershipTier": "gold",
  "duration": 3,
  "amount": 0,
  "isManualCode": true,
  "expiresAt": "2026-02-28T23:59:59Z",
  "notes": "Facebook promo - 1000 codes generated"
}
```

### **Use Case 2: Comp for Partner**
```json
{
  "code": "PARTNER-ABC123",
  "membershipTier": "diamond",
  "duration": 12,
  "amount": 0,
  "isManualCode": true,
  "expiresAt": "2027-01-01T00:00:00Z",
  "notes": "Complimentary for business partner XYZ Corp"
}
```

### **Use Case 3: Offline Sale**
```json
{
  "code": "OFFLINE-SALE-001",
  "membershipTier": "platinum",
  "duration": 6,
  "amount": 199.99,
  "isManualCode": true,
  "merchantOrderCode": "CASH-SALE-20260123",
  "expiresAt": "2026-12-31T23:59:59Z",
  "notes": "Sold in-store, cash payment received"
}
```

---

## 🔗 Related Documentation

- [Membership Logic](/docs/01-architecture/MEMBERSHIP_LOGIC.md)
- [Payment Flow](/docs/02-api/PAYMENT_FLOW.md)
- [VLinkPay Integration](/docs/02-api/VLINKPAY_INTEGRATION.md)

---

## 📞 Support

Questions about manual codes? Contact the development team.
