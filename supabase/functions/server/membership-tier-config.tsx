/**
 * ========================================
 * MEMBERSHIP TIERS CONFIGURATION (Backend)
 * ========================================
 * 
 * 🎯 Purpose: Central tier configuration for backend validation
 * 
 * ⚠️ IMPORTANT: Keep in sync with frontend config at:
 * /src/app/config/membership-tiers.ts
 * 
 * 📝 When adding/removing tiers:
 * 1. Update TIER_PRIORITY map below
 * 2. Update frontend config file
 * 3. Update admin tier editor if needed
 */

// ========================================
// TIER HIERARCHY CONFIGURATION
// ========================================

/**
 * Tier Priority Mapping
 * Higher number = Higher tier
 * 
 * ⚠️ DO NOT use duplicate priority values
 */
export const TIER_PRIORITY: Record<string, number> = {
  'silver': 1,      // Entry level - $99/year
  'gold': 2,        // Popular choice - $199/year
  'platinum': 3,    // Premium tier - $299/year (Most Popular)
  'vip-crypto': 4,  // Ultimate VIP - $399/year
  'diamond': 5,     // Legacy tier (disabled, backward compatibility only)
};

/**
 * Tier metadata for validation and display
 */
export interface TierMetadata {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  durationDays: number;
}

export const TIER_METADATA: TierMetadata[] = [
  { id: 'silver', name: 'Silver', priority: 1, enabled: true, durationDays: 365 },
  { id: 'gold', name: 'Gold', priority: 2, enabled: true, durationDays: 365 },
  { id: 'platinum', name: 'Platinum', priority: 3, enabled: true, durationDays: 365 },
  { id: 'vip-crypto', name: 'VIP-Crypto', priority: 4, enabled: true, durationDays: 365 },
  { id: 'diamond', name: 'Diamond', priority: 5, enabled: false, durationDays: 365 }, // Legacy
];

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get tier priority (returns 0 if not found)
 */
export function getTierPriority(tierName: string): number {
  const normalized = tierName.toLowerCase().trim();
  return TIER_PRIORITY[normalized] || 0;
}

/**
 * Compare two tiers
 * @returns positive if tier1 > tier2, negative if tier1 < tier2, 0 if equal
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
  const priority1 = getTierPriority(tier1);
  const priority2 = getTierPriority(tier2);
  
  // Both must be valid tiers and equal priority
  return priority1 > 0 && priority2 > 0 && priority1 === priority2;
}

/**
 * Check if downgrade is attempted
 */
export function isDowngrade(currentTier: string, newTier: string): boolean {
  return isLowerTier(newTier, currentTier);
}

/**
 * Get upgrade type
 */
export function getUpgradeType(
  currentTier: string,
  newTier: string
): 'upgrade' | 'extension' | 'downgrade' | 'invalid' {
  const current = getTierPriority(currentTier);
  const next = getTierPriority(newTier);
  
  if (current === 0 || next === 0) return 'invalid';
  
  if (next > current) return 'upgrade';
  if (next === current) return 'extension';
  return 'downgrade';
}

/**
 * Validate tier exists and is enabled
 */
export function isValidTier(tierName: string): boolean {
  const normalized = tierName.toLowerCase().trim();
  const metadata = TIER_METADATA.find(t => t.id === normalized);
  return metadata !== undefined && metadata.enabled;
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tierName: string): string {
  const normalized = tierName.toLowerCase().trim();
  const metadata = TIER_METADATA.find(t => t.id === normalized);
  return metadata?.name || tierName.toUpperCase();
}

/**
 * Calculate new expiry date based on upgrade type
 * @param currentExpiry Current membership expiry date (ISO string or Date)
 * @param upgradeType Type of upgrade ('upgrade' | 'extension')
 * @param tierDurationDays Duration in days (default: 365)
 * @returns New expiry date
 */
export function calculateNewExpiry(
  currentExpiry: string | Date | null,
  upgradeType: 'upgrade' | 'extension',
  tierDurationDays: number = 365
): Date {
  const now = new Date();
  
  if (upgradeType === 'extension' && currentExpiry) {
    // Extension: Add duration to existing expiry
    const existingExpiry = new Date(currentExpiry);
    
    // Only extend if current membership is still active
    if (existingExpiry > now) {
      const newExpiry = new Date(existingExpiry);
      newExpiry.setDate(newExpiry.getDate() + tierDurationDays);
      return newExpiry;
    }
  }
  
  // Upgrade or expired membership: Set new expiry from now
  const newExpiry = new Date(now);
  newExpiry.setDate(newExpiry.getDate() + tierDurationDays);
  return newExpiry;
}

/**
 * Validate tier configuration (for testing)
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for duplicate priorities
  const priorities = Object.values(TIER_PRIORITY);
  const uniquePriorities = new Set(priorities);
  if (priorities.length !== uniquePriorities.size) {
    errors.push('❌ Duplicate priority values detected in TIER_PRIORITY');
  }
  
  // Check metadata consistency
  TIER_METADATA.forEach(meta => {
    if (!TIER_PRIORITY[meta.id]) {
      errors.push(`❌ Tier "${meta.id}" in metadata but missing in TIER_PRIORITY`);
    }
    if (TIER_PRIORITY[meta.id] !== meta.priority) {
      errors.push(`❌ Priority mismatch for "${meta.id}": TIER_PRIORITY=${TIER_PRIORITY[meta.id]}, METADATA=${meta.priority}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ========================================
// EXPORTS
// ========================================

export default {
  TIER_PRIORITY,
  TIER_METADATA,
  getTierPriority,
  compareTiers,
  isHigherTier,
  isLowerTier,
  isSameTier,
  isDowngrade,
  getUpgradeType,
  isValidTier,
  getTierDisplayName,
  calculateNewExpiry,
  validateConfig,
};
