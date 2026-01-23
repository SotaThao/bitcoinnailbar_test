# MEMBERSHIP LOGIC SPECIFICATION

## Overview
System quản lý membership với logic tier priority, time accumulation, và stacking.

---

## 1. TIER PRIORITY SYSTEM

### Tier Hierarchy (Highest to Lowest)
```
Diamond > Platinum > Gold
```

### Priority Rules
1. **Active Membership:** Chỉ có 1 membership active tại một thời điểm
2. **Tier Selection:** Membership có tier CAO NHẤT được activate
3. **Status Types:**
   - `active`: Đang được sử dụng
   - `pending`: Đợi để activate sau khi membership hiện tại hết hạn
   - `expired`: Đã hết hạn

---

## 2. MEMBERSHIP STACKING LOGIC

### Case 1: Different Tiers (Tier Cao > Tier Thấp)

**Scenario:**
- User có: Gold (6 tháng còn lại, expires: 2025-07-01)
- User mua: Platinum (12 tháng mới)

**Logic:**
1. Platinum → `active` (tier cao hơn)
2. Gold → `pending` (chuyển sang đợi)
3. Khi Platinum hết hạn → Gold tự động activate (nếu chưa expired)

**Result:**
```json
{
  "memberships": [
    {
      "tier": "platinum",
      "status": "active",
      "startDate": "2025-01-23",
      "endDate": "2026-01-23"  // 12 tháng từ hôm nay
    },
    {
      "tier": "gold", 
      "status": "pending",
      "startDate": "2024-01-01",
      "endDate": "2025-07-01"  // GIỮ NGUYÊN end date
    }
  ]
}
```

---

### Case 2: Same Tier (Cộng Dồn Thời Gian)

**Scenario:**
- User có: Gold (6 tháng còn lại, expires: 2025-07-01)
- User mua: Gold (12 tháng mới)

**Logic:**
1. Tìm membership Gold đang active
2. **Extend end date** = current end date + 12 tháng mới
3. KHÔNG tạo membership mới

**Result:**
```json
{
  "tier": "gold",
  "status": "active",
  "startDate": "2024-01-01",
  "endDate": "2026-07-01"  // 2025-07-01 + 12 tháng = 18 tháng total
}
```

**⚠️ Important:** Start date GIỮ NGUYÊN, chỉ extend end date

---

### Case 3: Multiple Active Tiers

**Scenario:**
- User có:
  - Gold (6 tháng còn lại)
  - Platinum (3 tháng còn lại)
  - Diamond (1 tháng còn lại)

**Logic:**
1. Sort by tier priority: Diamond > Platinum > Gold
2. Diamond → `active`
3. Platinum → `pending`
4. Gold → `pending`

**Activation Order:**
```
Today: Diamond (active)
After 1 month: Diamond expires → Platinum auto-activate
After 4 months: Platinum expires → Gold auto-activate
After 10 months: Gold expires
```

---

## 3. IMPLEMENTATION PSEUDOCODE

### Redeem New Membership

```typescript
function redeemMembership(userId: string, newTier: string, duration: number) {
  // 1. Get existing memberships
  const existing = getUserMemberships(userId);
  
  // 2. Check if same tier exists
  const sameTier = existing.find(m => 
    m.tier === newTier && 
    m.status === 'active' && 
    new Date(m.endDate) > new Date()
  );
  
  if (sameTier) {
    // Case 2: Same tier → Extend time
    sameTier.endDate = addMonths(sameTier.endDate, duration);
    save(existing);
    return;
  }
  
  // 3. Different tier → Create new membership
  const newMembership = {
    tier: newTier,
    startDate: now(),
    endDate: addMonths(now(), duration),
    status: 'pending'
  };
  
  existing.push(newMembership);
  
  // 4. Update active membership based on priority
  updateActiveMembership(existing);
  save(existing);
}

function updateActiveMembership(memberships: Membership[]) {
  // Filter expired
  const valid = memberships.filter(m => new Date(m.endDate) > new Date());
  
  // Sort by tier priority
  valid.sort((a, b) => TIER_PRIORITY[b.tier] - TIER_PRIORITY[a.tier]);
  
  // Set status
  valid.forEach((m, index) => {
    m.status = index === 0 ? 'active' : 'pending';
  });
  
  // Mark expired
  memberships
    .filter(m => new Date(m.endDate) <= new Date())
    .forEach(m => m.status = 'expired');
}
```

---

## 4. EDGE CASES

### Case 4.1: Tier Thấp → Tier Cao (Upgrade)
- Gold (active, 6 tháng) + mua Diamond (12 tháng)
- Result: Diamond active, Gold pending

### Case 4.2: Tier Cao → Tier Thấp (Downgrade)
- Diamond (active, 1 tháng) + mua Gold (12 tháng)
- Result: Diamond active, Gold pending (đợi Diamond hết hạn)

### Case 4.3: Multiple Same Tier Purchases
- User mua Gold 3 lần (6 tháng, 12 tháng, 6 tháng)
- Result: 1 Gold membership with 24 tháng total

### Case 4.4: Expired Membership + New Purchase
- User có Gold expired (2024-12-31)
- User mua Gold (12 tháng) hôm nay
- Result: Gold active (2025-01-23 → 2026-01-23), expired membership archived

---

## 5. DATABASE STRUCTURE

```typescript
interface UserMemberships {
  userId: string;
  memberships: Membership[];
  activeMembership: string | null;  // ID of active membership
}

interface Membership {
  id: string;
  tier: 'gold' | 'platinum' | 'diamond';
  startDate: string;  // ISO 8601
  endDate: string;    // ISO 8601
  status: 'active' | 'pending' | 'expired';
  redeemCode: string;
  duration: number;   // Original duration in months
  amount: number;     // Original purchase amount
}
```

---

## 6. VALIDATION RULES

✅ **Must Have:**
- User chỉ có 1 active membership tại một thời điểm
- Tier priority luôn được respect
- Same tier luôn cộng dồn thời gian
- Expired memberships tự động được mark

❌ **Must Not:**
- Không được có 2 active memberships cùng lúc
- Không tạo duplicate membership khi same tier
- Không reset start date khi extend same tier
- Không xóa pending memberships khi có tier cao hơn

---

## 7. TESTING SCENARIOS

### Test 1: Basic Redemption
```
Given: User chưa có membership
When: Redeem Gold (12 tháng)
Then: Gold active, endDate = now + 12 tháng
```

### Test 2: Same Tier Extension
```
Given: Gold active (expires 2025-06-01)
When: Redeem Gold (6 tháng)
Then: Gold active, endDate = 2025-12-01 (cộng dồn)
```

### Test 3: Tier Upgrade
```
Given: Gold active (6 tháng)
When: Redeem Diamond (3 tháng)
Then: Diamond active, Gold pending
```

### Test 4: Multiple Tiers Stack
```
Given: Gold active (12 tháng), Platinum pending (6 tháng)
When: Redeem Diamond (3 tháng)
Then: Diamond active, Platinum pending, Gold pending
Order: Diamond → Platinum → Gold
```

---

**Last Updated:** 2025-01-23  
**Version:** 1.0  
**Author:** System Documentation
