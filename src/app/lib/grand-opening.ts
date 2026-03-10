/**
 * Grand Opening Configuration
 * 
 * Bitcoin Nail Bar officially opens on March 27-28, 2026
 * All pre-opening logic will auto-disable after this date (CST timezone)
 * 
 * This file can be safely deleted after the grand opening.
 */

// Grand Opening Date: March 28, 2026 at 23:59:59 CST (UTC-6)
// Event spans Mar 27-28; auto-disable after the event ends
const GRAND_OPENING_TIMESTAMP = Date.UTC(2026, 2, 29, 5, 59, 59); // Mar 28, 2026 23:59 CST = Mar 29 05:59 UTC

export const GRAND_OPENING_DATE = new Date(GRAND_OPENING_TIMESTAMP);

export const GRAND_OPENING_EVENT_URL = "https://event.bitcoinnailbar.com/";

/**
 * Check if the salon is still in pre-opening period
 * Returns true if current time is BEFORE Mar 28, 2026 23:59 CST
 * Auto-returns false after the grand opening event ends
 */
export function isBeforeGrandOpening(): boolean {
  return Date.now() < GRAND_OPENING_TIMESTAMP;
}

/**
 * Get formatted grand opening date string
 */
export function getGrandOpeningDateString(language: string): string {
  if (language === "vi") {
    return "27-28 tháng 3, 2026";
  }
  return "March 27-28, 2026";
}