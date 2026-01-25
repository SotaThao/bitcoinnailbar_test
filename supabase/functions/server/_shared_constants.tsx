/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHARED CONSTANTS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Centralized configuration constants for the entire server
 */

/**
 * JWT Secret for token signing/verification
 * In production, this MUST be set via JWT_SECRET environment variable
 */
export const JWT_SECRET = new TextEncoder().encode(
  Deno.env.get('JWT_SECRET') || 'bitcoin-nail-bar-secret-key-change-in-production'
);

/**
 * KV Store Table Names
 * 
 * 🚨 CRITICAL: These tables serve different purposes!
 * 
 * KV_TABLE_ADMIN: For admin/backend data
 * - VLinkPay settings
 * - Redeem codes
 * - Membership data
 * - Payment records
 * - User management
 * - Auth tokens
 * 
 * KV_TABLE_HOMEPAGE: For public/homepage data
 * - Service categories
 * - Services menu
 * - Gallery images
 * - Promotions
 */
export const KV_TABLE_ADMIN = "kv_store_89edbd69";
export const KV_TABLE_HOMEPAGE = "kv_store_84f9c112";

/**
 * Environment variable getters for safety
 */
export const getEnv = (key: string, defaultValue = ""): string => {
  return Deno.env.get(key) ?? defaultValue;
};
