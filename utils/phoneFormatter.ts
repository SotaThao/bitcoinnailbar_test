/**
 * Phone Formatter Utilities for US Phone Numbers
 * Format: (xxx) xxx-xxxx
 */

/**
 * Format US phone number with (xxx) xxx-xxxx pattern
 * @param value - Raw phone number string (can include non-numeric characters)
 * @returns Formatted phone string
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limited = cleaned.slice(0, 10);
  
  // Apply formatting based on length
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
}

/**
 * Get raw phone number (only digits) from formatted string
 * @param formatted - Formatted phone string like "(123) 456-7890"
 * @returns Raw digits only "1234567890"
 */
export function getRawPhoneNumber(formatted: string): string {
  return formatted.replace(/\D/g, '');
}

/**
 * Validate US phone number (must have exactly 10 digits)
 * @param value - Phone number string (formatted or raw)
 * @returns true if valid, false otherwise
 */
export function isValidPhoneNumber(value: string): boolean {
  const cleaned = getRawPhoneNumber(value);
  return cleaned.length === 10;
}

/**
 * Check if a string looks like a phone number
 * @param value - Input string
 * @returns true if contains only digits/formatting chars, false if contains letters
 */
export function looksLikePhone(value: string): boolean {
  // If it contains letters, it's probably email
  return !/[a-zA-Z]/.test(value);
}

/**
 * Format input for display (decide between phone format and raw text)
 * @param value - User input
 * @returns Formatted string (phone format if numeric, raw if email)
 */
export function formatUserIdInput(value: string): string {
  if (looksLikePhone(value)) {
    return formatPhoneNumber(value);
  }
  return value; // Keep as-is for email
}
