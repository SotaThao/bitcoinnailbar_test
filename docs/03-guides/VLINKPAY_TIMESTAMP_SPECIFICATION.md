# ⏰ VLINKPAY Timestamp Specification - PENDING

## 📅 Date: January 21, 2026
## Status: ⚠️ AWAITING CLIENT CONFIRMATION

---

## ❓ **Information Needed from VLINKPAY**

To complete the timestamp integration, we need the following specifications:

### 1️⃣ **Timestamp Format**

Please specify which format VLINKPAY expects:

- [ ] **Unix Timestamp (Seconds)**
  - Example: `1737468234`
  - JavaScript: `Math.floor(Date.now() / 1000)`

- [ ] **Unix Timestamp (Milliseconds)**
  - Example: `1737468234567`
  - JavaScript: `Date.now()`

- [ ] **ISO 8601 String**
  - Example: `2026-01-21T12:30:34Z`
  - JavaScript: `new Date().toISOString()`

- [ ] **Custom Format**
  - Please provide exact format: `_______________`
  - Example: `_______________`

---

### 2️⃣ **Timezone Requirement**

Which timezone should be used?

- [ ] **UTC (Coordinated Universal Time)**
  - Recommended for international systems
  - JavaScript: `new Date().toISOString()` (already UTC)

- [ ] **GMT+7 (Vietnam Time / ICT)**
  - Indochina Time
  - Offset: +7 hours from UTC

- [ ] **Other Timezone**
  - Specify: `_______________`
  - Offset from UTC: `_______________`

---

### 3️⃣ **Conversion Rule**

Is there any specific conversion formula?

**Example scenarios:**

**Scenario A: Direct timestamp (no conversion)**
```javascript
const timestamp = Date.now(); // 1737468234567
// Send as-is to VLINKPAY
```

**Scenario B: Timezone offset**
```javascript
const timestamp = Date.now() + (7 * 60 * 60 * 1000); // Add 7 hours
// Or: Date.now() - (7 * 60 * 60 * 1000) // Subtract 7 hours
```

**Scenario C: Convert to seconds**
```javascript
const timestamp = Math.floor(Date.now() / 1000); // Remove milliseconds
```

**Scenario D: Custom calculation**
```javascript
// Please provide formula:
const timestamp = _________________________;
```

---

## 🔍 **Current Implementation (Temporary)**

**File**: `/supabase/functions/server/payment.tsx`

```typescript
const buildVLinkPayURL = (params) => {
  const url = new URL(`${params.sandboxEndpoint}/embedded/payment-init`);
  
  // 🚨 TEMPORARY: Using Date.now() (Unix milliseconds in UTC)
  const timestamp = Date.now();
  
  url.searchParams.append('timestamp', timestamp.toString());
  // ... other parameters
  
  return url.toString();
};
```

**This will be updated once we receive the specification!**

---

## 📝 **To Complete Integration**

Once you provide the specifications above, we will:

1. ✅ Update `buildVLinkPayURL` function
2. ✅ Add timezone conversion logic if needed
3. ✅ Test with sandbox environment
4. ✅ Document the final implementation
5. ✅ Update changelog

---

## 🧪 **Test Cases to Prepare**

After receiving specification, we'll test:

### **Test 1: Timestamp Format**
- [ ] Generate timestamp using correct format
- [ ] Verify VLINKPAY accepts the format
- [ ] Check payment link opens successfully

### **Test 2: Timezone Accuracy**
- [ ] Verify timestamp matches expected timezone
- [ ] Test edge cases (midnight, daylight saving if applicable)
- [ ] Confirm no rejection due to timestamp mismatch

### **Test 3: Edge Cases**
- [ ] Test with future timestamps (should fail)
- [ ] Test with past timestamps (may fail if time window exists)
- [ ] Test timestamp validation on VLINKPAY side

---

## 📞 **Contact Information**

**VLINKPAY Support**
- Please provide timestamp specification from official documentation
- Or contact VLINKPAY technical support for clarification

**Development Team**
- Ready to implement as soon as specification is received
- Current implementation uses standard Unix timestamp (ms)

---

## 🚨 **Action Required**

**Client:** Please provide answers to sections 1, 2, and 3 above.

**Options to get this information:**
1. Check VLINKPAY API documentation
2. Contact VLINKPAY technical support
3. Test with sample payment and observe required format
4. Ask VLINKPAY integration specialist

---

## 📋 **Quick Reference Table**

| Format | Example | JavaScript Code |
|--------|---------|-----------------|
| Unix (seconds) | `1737468234` | `Math.floor(Date.now() / 1000)` |
| Unix (ms) | `1737468234567` | `Date.now()` |
| ISO 8601 UTC | `2026-01-21T12:30:34Z` | `new Date().toISOString()` |
| ISO 8601 GMT+7 | `2026-01-21T19:30:34+07:00` | *Custom function needed* |
| Unix (seconds) + GMT+7 | `1737493834` | `Math.floor(Date.now() / 1000) + (7*3600)` |

---

## ✅ **Next Steps**

1. **Wait for client to provide specification** ⏳
2. **Update payment.tsx with correct formula** 🔧
3. **Test in sandbox environment** 🧪
4. **Deploy to production** 🚀

---

**Last Updated:** January 21, 2026  
**Status:** Awaiting VLINKPAY timestamp specification from client
