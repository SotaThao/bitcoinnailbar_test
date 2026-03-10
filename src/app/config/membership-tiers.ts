/**
 * ========================================
 * MEMBERSHIP TIERS CONFIGURATION
 * ========================================
 * 
 * 🎯 Purpose: Central configuration for all membership tiers
 * 
 * 📌 Single Source of Truth for:
 * - Tier definitions & metadata
 * - Pricing & duration
 * - Hierarchy & priority
 * - Visual styling
 * 
 * 🔧 How to Modify:
 * 1. Add/Remove/Update tiers in MEMBERSHIP_TIERS array
 * 2. All validation logic will auto-update
 * 3. No need to modify comparison functions
 * 
 * ⚠️ Important: Always maintain unique `priority` values (no duplicates)
 */

import { Star, Crown, Gem, Bitcoin, LucideIcon } from 'lucide-react';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface MembershipTier {
  // ===== Core Identity =====
  id: string;                    // Unique identifier (lowercase, kebab-case)
  name: string;                  // Display name (e.g., "Gold", "VIP-Crypto")
  displayName: string;           // Formatted display name (e.g., "GOLD", "VIP CRYPTO")
  
  // ===== Hierarchy & Comparison =====
  priority: number;              // Higher number = Higher tier (1 = lowest)
  
  // ===== Pricing & Duration =====
  price: number;                 // Price in USD
  duration: number;              // Duration in days (365 = 1 year)
  
  // ===== Benefits =====
  benefits: string[];            // List of benefit descriptions
  
  // ===== Visual Styling =====
  visual: {
    icon: LucideIcon;            // Lucide icon component
    borderColor: string;         // Tailwind border class
    bgGradient: string;          // Tailwind gradient class
    buttonStyle: string;         // Button styling classes
    glowColor: string;           // Glow effect color (rgba)
    hexColor: string;            // Hex color for badges/indicators
    popular: boolean;            // Mark as "Most Popular"
  };
  
  // ===== Metadata =====
  enabled: boolean;              // Enable/disable tier without removing
  description?: string;          // Optional description for admin
}

// ========================================
// TIER DEFINITIONS
// ========================================

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'silver',
    name: 'Silver',
    displayName: 'SILVER',
    priority: 1,
    price: 99,
    duration: 365, // 1 year
    benefits: [
      '10% off all services',
      'Priority booking',
      'Free nail art (up to 3 nails)',
      'Birthday gift',
    ],
    visual: {
      icon: Star,
      borderColor: 'border-gray-500',
      bgGradient: 'from-gray-900 to-black',
      buttonStyle: 'border border-gray-500 text-gray-300 hover:bg-gray-800',
      glowColor: 'rgba(156, 163, 175, 0.5)',
      hexColor: '#d1d5db',
      popular: false,
    },
    enabled: true,
    description: 'Entry-level membership for casual customers',
  },
  
  {
    id: 'gold',
    name: 'Gold',
    displayName: 'GOLD',
    priority: 2,
    price: 199,
    duration: 365, // 1 year
    benefits: [
      '15% off all services',
      'Priority booking + express lane',
      'Free nail art (up to 5 nails)',
      'Free removal service',
      'Birthday gift + anniversary gift',
      'Member-only events',
    ],
    visual: {
      icon: Crown,
      borderColor: 'border-[#eab308]',
      bgGradient: 'from-gray-900 to-black',
      buttonStyle: 'bg-gradient-to-r from-[#f7931a] to-[#ffab2e] text-black font-bold border-none hover:shadow-[0_0_20px_rgba(247,147,26,0.5)]',
      glowColor: 'rgba(234, 179, 8, 0.5)',
      hexColor: '#eab308',
      popular: false,
    },
    enabled: true,
    description: 'Popular choice for regular customers',
  },
  
  {
    id: 'platinum',
    name: 'Platinum',
    displayName: 'PLATINUM',
    priority: 3,
    price: 299,
    duration: 365, // 1 year
    benefits: [
      '20% off all services',
      'VIP priority booking',
      'Unlimited nail art',
      'Free removal + repair service',
      'Complimentary beverages',
      'Exclusive VIP events',
      'Referral bonus: $20 credit',
    ],
    visual: {
      icon: Gem,
      borderColor: 'border-white',
      bgGradient: 'from-gray-900 to-black',
      buttonStyle: 'bg-white text-black font-bold border-none hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]',
      glowColor: 'rgba(255, 255, 255, 0.5)',
      hexColor: '#ffffff',
      popular: true, // Most Popular
    },
    enabled: true,
    description: 'Premium tier with maximum benefits',
  },
  
  {
    id: 'vip-crypto',
    name: 'VIP-Crypto',
    displayName: 'VIP CRYPTO',
    priority: 4,
    price: 399,
    duration: 365, // 1 year
    benefits: [
      '25% off all services',
      'VIP priority booking + concierge service',
      'Unlimited nail art + custom designs',
      'Free removal, repair & spa treatment',
      'Premium beverages & snacks',
      'Exclusive VIP events + private sessions',
      'Pay with Bitcoin/Crypto: Extra 5% discount',
      'Referral bonus: $50 credit',
    ],
    visual: {
      icon: Bitcoin,
      borderColor: 'border-[#f7931a]',
      bgGradient: 'from-gray-900 to-black',
      buttonStyle: 'border border-[#f7931a] text-[#f7931a] hover:bg-[#f7931a]/10',
      glowColor: 'rgba(247, 147, 26, 0.5)',
      hexColor: '#f7931a',
      popular: false,
    },
    enabled: true,
    description: 'Ultimate VIP tier with crypto payment benefits',
  },
  
  // ===== LEGACY TIER (Disabled but kept for backward compatibility) =====
  {
    id: 'diamond',
    name: 'Diamond',
    displayName: 'DIAMOND',
    priority: 5,
    price: 499,
    duration: 365,
    benefits: [
      '30% off all services',
      'White-glove concierge service',
      'Unlimited everything',
    ],
    visual: {
      icon: Gem,
      borderColor: 'border-blue-400',
      bgGradient: 'from-blue-900 to-black',
      buttonStyle: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
      glowColor: 'rgba(96, 165, 250, 0.5)',
      hexColor: '#60a5fa',
      popular: false,
    },
    enabled: false, // ❌ Disabled - Not available for new purchases
    description: 'Legacy tier - kept for existing members only',
  },
];

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get tier by ID (case-insensitive)
 */
export function getTierById(id: string): MembershipTier | undefined {
  return MEMBERSHIP_TIERS.find(
    (tier) => tier.id.toLowerCase() === id.toLowerCase()
  );
}

/**
 * Get tier by name (case-insensitive, handles variations)
 */
export function getTierByName(name: string): MembershipTier | undefined {
  const normalizedName = name.toLowerCase().trim();
  return MEMBERSHIP_TIERS.find(
    (tier) => 
      tier.id.toLowerCase() === normalizedName ||
      tier.name.toLowerCase() === normalizedName ||
      tier.displayName.toLowerCase() === normalizedName
  );
}

/**
 * Get all enabled tiers (sorted by priority)
 */
export function getEnabledTiers(): MembershipTier[] {
  return MEMBERSHIP_TIERS
    .filter((tier) => tier.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get all tiers including disabled (sorted by priority)
 */
export function getAllTiers(): MembershipTier[] {
  return [...MEMBERSHIP_TIERS].sort((a, b) => a.priority - b.priority);
}

/**
 * Get tier priority (returns 0 if not found)
 */
export function getTierPriority(tierIdentifier: string): number {
  const tier = getTierByName(tierIdentifier);
  return tier?.priority || 0;
}

/**
 * Compare two tiers
 * @returns positive number if tier1 > tier2, negative if tier1 < tier2, 0 if equal
 */
export function compareTiers(tier1: string, tier2: string): number {
  const priority1 = getTierPriority(tier1);
  const priority2 = getTierPriority(tier2);
  return priority1 - priority2;
}

/**
 * Check if tier1 is higher than tier2
 */
export function isHigherTier(tier1: string, tier2: string): boolean {
  return compareTiers(tier1, tier2) > 0;
}

/**
 * Check if tier1 is lower than tier2
 */
export function isLowerTier(tier1: string, tier2: string): boolean {
  return compareTiers(tier1, tier2) < 0;
}

/**
 * Check if tiers are the same
 */
export function isSameTier(tier1: string, tier2: string): boolean {
  return compareTiers(tier1, tier2) === 0;
}

/**
 * Check if upgrade is allowed (new tier must be higher or equal)
 */
export function canUpgrade(currentTier: string, newTier: string): boolean {
  return compareTiers(newTier, currentTier) >= 0;
}

/**
 * Check if downgrade is prevented (new tier is lower)
 */
export function isDowngrade(currentTier: string, newTier: string): boolean {
  return compareTiers(newTier, currentTier) < 0;
}

/**
 * Get upgrade type
 * @returns 'upgrade' | 'same' | 'downgrade'
 */
export function getUpgradeType(
  currentTier: string,
  newTier: string
): 'upgrade' | 'same' | 'downgrade' {
  const comparison = compareTiers(newTier, currentTier);
  if (comparison > 0) return 'upgrade';
  if (comparison < 0) return 'downgrade';
  return 'same';
}

/**
 * Get user-friendly message for tier comparison
 */
export function getTierComparisonMessage(
  currentTier: string,
  newTier: string
): string {
  const type = getUpgradeType(currentTier, newTier);
  const current = getTierByName(currentTier);
  const newT = getTierByName(newTier);
  
  if (!current || !newT) {
    return 'Invalid tier comparison';
  }
  
  switch (type) {
    case 'upgrade':
      return `Congratulations! You're upgrading from ${current.displayName} to ${newT.displayName}!`;
    case 'same':
      return `Your ${current.displayName} membership will be extended by ${Math.floor(newT.duration / 365)} year(s).`;
    case 'downgrade':
      return `Cannot downgrade from ${current.displayName} to ${newT.displayName}. Only same-tier or upgrades are allowed.`;
    default:
      return 'Unknown tier comparison';
  }
}

/**
 * Get tier priority mapping for backend validation
 * @returns Record<string, number> mapping tier IDs to priorities
 */
export function getTierPriorityMap(): Record<string, number> {
  const map: Record<string, number> = {};
  MEMBERSHIP_TIERS.forEach((tier) => {
    map[tier.id] = tier.priority;
  });
  return map;
}

/**
 * Validate tier configuration (for testing/debugging)
 * @returns Array of validation errors (empty if valid)
 */
export function validateTierConfig(): string[] {
  const errors: string[] = [];
  
  // Check for duplicate priorities
  const priorities = MEMBERSHIP_TIERS.map((t) => t.priority);
  const uniquePriorities = new Set(priorities);
  if (priorities.length !== uniquePriorities.size) {
    errors.push('Duplicate priority values detected');
  }
  
  // Check for duplicate IDs
  const ids = MEMBERSHIP_TIERS.map((t) => t.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push('Duplicate tier IDs detected');
  }
  
  // Check for missing required fields
  MEMBERSHIP_TIERS.forEach((tier) => {
    if (!tier.id) errors.push(`Tier missing ID: ${tier.name}`);
    if (!tier.name) errors.push(`Tier missing name: ${tier.id}`);
    if (tier.priority <= 0) errors.push(`Invalid priority for ${tier.id}: ${tier.priority}`);
    if (tier.price < 0) errors.push(`Invalid price for ${tier.id}: ${tier.price}`);
    if (tier.duration <= 0) errors.push(`Invalid duration for ${tier.id}: ${tier.duration}`);
  });
  
  return errors;
}

// ========================================
// EXPORTS
// ========================================

export default {
  MEMBERSHIP_TIERS,
  getTierById,
  getTierByName,
  getEnabledTiers,
  getAllTiers,
  getTierPriority,
  compareTiers,
  isHigherTier,
  isLowerTier,
  isSameTier,
  canUpgrade,
  isDowngrade,
  getUpgradeType,
  getTierComparisonMessage,
  getTierPriorityMap,
  validateTierConfig,
};
