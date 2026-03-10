# MEMBERSHIP TIERS CONFIGURATION GUIDE

## 📍 Overview

This guide explains how to manage membership tiers in the Bitcoin Nail Bar system. All tier configuration is centralized in a single source of truth for easy maintenance and scalability.

---

## 📂 File Locations

### **Frontend Config:**
```
/src/app/config/membership-tiers.ts
```
- Central configuration for all tier definitions
- TypeScript types and interfaces
- Helper functions for tier comparison
- Visual styling definitions

### **Backend Config:**
```
/supabase/functions/server/membership-tier-config.tsx
```
- Backend validation logic
- Tier priority mapping (must match frontend)
- Helper functions for upgrade/downgrade logic

---

## 🎯 Tier Structure

Each membership tier has the following structure:

```typescript
{
  // ===== Core Identity =====
  id: string;                // Unique identifier (lowercase, kebab-case)
  name: string;              // Display name (e.g., "Gold")
  displayName: string;       // Formatted display name (e.g., "GOLD")
  
  // ===== Hierarchy & Comparison =====
  priority: number;          // Higher number = Higher tier (1 = lowest)
  
  // ===== Pricing & Duration =====
  price: number;             // Price in USD
  duration: number;          // Duration in days (365 = 1 year)
  
  // ===== Benefits =====
  benefits: string[];        // List of benefit descriptions
  
  // ===== Visual Styling =====
  visual: {
    icon: LucideIcon;        // Lucide icon component
    borderColor: string;     // Tailwind border class
    bgGradient: string;      // Tailwind gradient class
    buttonStyle: string;     // Button styling classes
    glowColor: string;       // Glow effect color (rgba)
    hexColor: string;        // Hex color for badges/indicators
    popular: boolean;        // Mark as "Most Popular"
  };
  
  // ===== Metadata =====
  enabled: boolean;          // Enable/disable tier without removing
  description?: string;      // Optional description for admin
}
```

---

## 🔧 How to Add a New Tier

### **Step 1: Add to Frontend Config**

Open `/src/app/config/membership-tiers.ts` and add your tier to the `MEMBERSHIP_TIERS` array:

```typescript
{
  id: 'emerald',           // ⚠️ Must be lowercase, unique
  name: 'Emerald',
  displayName: 'EMERALD',
  priority: 6,             // ⚠️ Must be unique, higher than existing
  price: 599,
  duration: 365,
  benefits: [
    '35% off all services',
    'VIP+++ priority booking',
    'Unlimited everything',
  ],
  visual: {
    icon: Gem,
    borderColor: 'border-emerald-500',
    bgGradient: 'from-emerald-900 to-black',
    buttonStyle: 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    hexColor: '#10b981',
    popular: false,
  },
  enabled: true,
  description: 'Super premium tier',
},
```

### **Step 2: Add to Backend Config**

Open `/supabase/functions/server/membership-tier-config.tsx` and update:

#### **TIER_PRIORITY mapping:**
```typescript
export const TIER_PRIORITY: Record<string, number> = {
  'silver': 1,
  'gold': 2,
  'platinum': 3,
  'vip-crypto': 4,
  'diamond': 5,
  'emerald': 6,     // ✅ Add new tier
};
```

#### **TIER_METADATA array:**
```typescript
export const TIER_METADATA: TierMetadata[] = [
  // ... existing tiers
  { 
    id: 'emerald', 
    name: 'Emerald', 
    priority: 6, 
    enabled: true, 
    durationDays: 365 
  }, // ✅ Add new tier
];
```

### **Step 3: Verify Configuration**

Run validation in console (frontend):

```typescript
import { validateTierConfig } from '@/app/config/membership-tiers';

const errors = validateTierConfig();
if (errors.length > 0) {
  console.error('❌ Tier config errors:', errors);
} else {
  console.log('✅ Tier config is valid');
}
```

Run validation in backend:

```typescript
import { validateConfig } from './membership-tier-config.tsx';

const result = validateConfig();
if (!result.valid) {
  console.error('❌ Backend config errors:', result.errors);
} else {
  console.log('✅ Backend config is valid');
}
```

---

## ✏️ How to Modify an Existing Tier

### **Change Price:**
```typescript
// Frontend: /src/app/config/membership-tiers.ts
{
  id: 'gold',
  price: 249,  // Changed from 199
  // ... rest unchanged
}
```

### **Change Benefits:**
```typescript
{
  id: 'gold',
  benefits: [
    '15% off all services',
    'Priority booking + express lane',
    'Free nail art (up to 7 nails)',  // ✅ Modified
    // ... add more
  ],
}
```

### **Change Visual Styling:**
```typescript
{
  id: 'gold',
  visual: {
    borderColor: 'border-yellow-400',  // ✅ Modified
    hexColor: '#fbbf24',               // ✅ Modified
    // ... rest unchanged
  },
}
```

### **Mark as Popular:**
```typescript
{
  id: 'gold',
  visual: {
    popular: true,  // ✅ Will show "Most Popular" badge
  },
}
```

---

## 🚫 How to Disable a Tier

To disable a tier **without removing it** (for existing members):

```typescript
{
  id: 'diamond',
  enabled: false,  // ✅ Disabled - not available for new purchases
  // ... rest unchanged
}
```

**Result:**
- ✅ Existing members keep their tier
- ❌ New users cannot purchase this tier
- ✅ Tier still appears in comparison logic (for upgrade validation)

---

## 🗑️ How to Remove a Tier (Permanently)

⚠️ **WARNING:** Only do this if no users have this tier!

### **Step 1: Remove from Frontend**
Delete the tier object from `MEMBERSHIP_TIERS` array in `/src/app/config/membership-tiers.ts`

### **Step 2: Remove from Backend**
Remove tier from both `TIER_PRIORITY` and `TIER_METADATA` in `/supabase/functions/server/membership-tier-config.tsx`

### **Step 3: Verify**
Run validation to ensure no errors

---

## 📊 Tier Comparison Logic

### **Priority System:**
```
Silver    = 1  (Lowest)
Gold      = 2
Platinum  = 3
VIP-Crypto = 4
Diamond   = 5  (Highest)
```

### **Comparison Rules:**
| Current Tier | Redeem Code | Result |
|--------------|-------------|--------|
| **Gold** | Gold | ➕ **Extension** (add +1 year to current expiry) |
| **Gold** | Platinum | ⬆️ **Upgrade** (replace tier, reset expiry) |
| **Platinum** | Gold | ❌ **Rejected** (cannot downgrade) |
| **None** | Any | ✨ **New Membership** (create new) |

### **Helper Functions:**

#### **Frontend:**
```typescript
import {
  compareTiers,
  isHigherTier,
  isSameTier,
  getUpgradeType,
  getTierComparisonMessage,
} from '@/app/config/membership-tiers';

// Compare tiers
const comparison = compareTiers('gold', 'platinum');
// Returns: negative number (gold < platinum)

// Check if upgrade
const isUpgrade = isHigherTier('platinum', 'gold');
// Returns: true

// Get upgrade type
const type = getUpgradeType('gold', 'platinum');
// Returns: 'upgrade'

// Get user-friendly message
const message = getTierComparisonMessage('gold', 'platinum');
// Returns: "Congratulations! You're upgrading from GOLD to PLATINUM!"
```

#### **Backend:**
```typescript
import {
  getTierPriority,
  getUpgradeType,
  calculateNewExpiry,
} from './membership-tier-config.tsx';

// Get tier priority
const priority = getTierPriority('gold');
// Returns: 2

// Get upgrade type
const type = getUpgradeType('gold', 'platinum');
// Returns: 'upgrade'

// Calculate new expiry
const newExpiry = calculateNewExpiry(
  currentExpiryDate,
  'extension',  // or 'upgrade'
  365           // duration in days
);
// Returns: Date object
```

---

## 🧪 Testing Checklist

After modifying tier configuration:

- [ ] Run `validateTierConfig()` in frontend console
- [ ] Run `validateConfig()` in backend
- [ ] Check no duplicate `priority` values
- [ ] Check no duplicate `id` values
- [ ] Test new tier purchase flow
- [ ] Test tier upgrade flow (lower → higher)
- [ ] Test tier extension flow (same tier)
- [ ] Test downgrade rejection (higher → lower)
- [ ] Verify visual styling renders correctly
- [ ] Check admin tier editor displays correctly

---

## 🔄 Synchronization

⚠️ **CRITICAL:** Frontend and Backend configs must be synchronized!

### **What Must Match:**
1. **Tier IDs:** Same spelling and case-sensitivity
2. **Priority Values:** Exact same numbers
3. **Enabled Status:** Same enabled/disabled state

### **Auto-Sync Checklist:**
When updating tiers, update BOTH files:
- [ ] `/src/app/config/membership-tiers.ts` (Frontend)
- [ ] `/supabase/functions/server/membership-tier-config.tsx` (Backend)

### **Validation Script:**
```bash
# Future: Add automated sync validation script
npm run validate-tier-config
```

---

## 📝 Best Practices

1. **Priority Values:**
   - Use sequential numbers (1, 2, 3, 4, 5...)
   - Leave gaps for future tiers (e.g., 1, 3, 5, 7, 9...)
   - Never reuse priority values

2. **Tier IDs:**
   - Use lowercase, kebab-case (e.g., `vip-crypto`, not `VIP_CRYPTO`)
   - Keep short and memorable
   - Never change existing IDs (breaks user data)

3. **Pricing:**
   - Consider price anchoring (make middle tier most attractive)
   - Use psychological pricing ($199, not $200)

4. **Benefits:**
   - List most important benefits first
   - Be specific and measurable
   - Use action-oriented language

5. **Visual Design:**
   - Use distinct colors for easy identification
   - Ensure sufficient contrast for accessibility
   - Test on mobile devices

---

## 🆘 Troubleshooting

### **Error: "Duplicate priority values detected"**
**Fix:** Ensure each tier has a unique `priority` value

### **Error: "Tier not found"**
**Fix:** Check spelling and case-sensitivity of tier IDs

### **Error: "Cannot downgrade from X to Y"**
**Expected Behavior:** Users cannot redeem lower tiers

### **Visual styling not applying**
**Fix:** Check Tailwind classes are valid and not purged

---

## 📚 Related Files

- `/src/app/config/membership-tiers.ts` - Frontend config
- `/supabase/functions/server/membership-tier-config.tsx` - Backend config
- `/src/app/lib/membership-visuals.ts` - Legacy visual config (deprecated)
- `/src/app/components/organisms/MembershipSection.tsx` - UI rendering
- `/supabase/functions/server/membership-redeem.tsx` - Redeem logic

---

## 🎓 Examples

### **Example 1: Add Seasonal Tier**
```typescript
{
  id: 'summer-special',
  name: 'Summer Special',
  displayName: 'SUMMER SPECIAL',
  priority: 2.5,  // Between gold (2) and platinum (3)
  price: 249,
  duration: 90,   // 3 months only
  benefits: ['20% off', 'Beach-themed designs'],
  visual: { /* summer theme */ },
  enabled: true,
  description: 'Limited time summer offer',
}
```

### **Example 2: Disable Tier Temporarily**
```typescript
{
  id: 'platinum',
  enabled: false,  // Temporarily disabled during promotion
  // ... rest unchanged
}
```

### **Example 3: Change Tier Name (Display Only)**
```typescript
{
  id: 'vip-crypto',  // ⚠️ Never change this
  name: 'VIP-Crypto',
  displayName: 'VIP CRYPTO ELITE',  // ✅ Can change this
}
```

---

## 📞 Support

For questions or issues:
- Check validation errors first
- Review this guide
- Check related files
- Test in development environment first

---

**Last Updated:** January 2026  
**Version:** 2.0  
**Maintainer:** Bitcoin Nail Bar Development Team
