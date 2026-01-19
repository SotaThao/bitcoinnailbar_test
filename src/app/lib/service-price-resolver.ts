/**
 * Service Price Resolver Utility
 * Resolves service prices from backend data with fallback to translations.ts
 * Extracted from Appointments.tsx for reusability
 */

import { translations } from '../../utils/translations';
import { parseMaxPrice } from './service-menu-utils';
import type { Service } from './admin-types';

interface ServiceWithPrice {
  id: string;
  name: string;
  price: number;
  isUnknown: boolean;
}

/**
 * Normalizes a string for fuzzy comparison:
 * 1. Converts to lowercase
 * 2. Removes Vietnamese accents (e.g., "Móng" -> "Mong")
 * 3. Handles special chars like 'đ'
 * 4. Removes non-alphanumeric characters
 */
function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Keep only latin chars and numbers
    .trim();
}

/**
 * Removes common chatbot prefixes from service names
 */
function stripPrefixes(name: string): string {
  // Regex to remove "Dịch vụ (được) đề xuất", "Suggested Service", etc.
  // Case insensitive, optional colon or space
  return name.replace(/^(Dịch vụ( được)? đề xuất|Suggested Service|Service)[:\s]*/i, "");
}

/**
 * Resolves services and their prices for an appointment
 * Strategy:
 * 1. Try to match by service IDs from backend
 * 2. Fallback to fuzzy name matching in services list (with better Vietnamese support)
 * 3. Fallback to translations.ts price lookup
 * 4. Return "unknown" if no match found
 */
export function resolveAppointmentServices(
  appointment: {
    serviceIds?: string[];
    serviceNames?: string[];
  },
  availableServices: Service[]
): ServiceWithPrice[] {
  let displayServices: ServiceWithPrice[] = [];

  // Strategy 1: Try to find by IDs
  if (appointment.serviceIds && appointment.serviceIds.length > 0) {
    displayServices = availableServices
      .filter(s => appointment.serviceIds!.includes(s.id))
      .map(s => ({
        id: s.id,
        name: s.name,
        price: s.price || s.regular || 0,
        isUnknown: false,
      }));
  }

  // Strategy 2 & 3: If no services found by ID, try name matching + translations fallback
  if (displayServices.length === 0 && appointment.serviceNames && appointment.serviceNames.length > 0) {
    displayServices = appointment.serviceNames.map((originalName: string) => {
      // 1. Clean the input name (remove prefixes, normalize)
      const nameWithoutPrefix = stripPrefixes(originalName);
      const cleanInputName = normalizeString(nameWithoutPrefix);

      // Helper function for fuzzy matching
      const isMatch = (serviceName: string) => {
        const cleanService = normalizeString(serviceName);
        return (
          cleanService === cleanInputName ||
          cleanService.includes(cleanInputName) ||
          cleanInputName.includes(cleanService)
        );
      };

      // Try to find in available services
      const foundService = availableServices.find(s => isMatch(s.name));
      if (foundService) {
        return {
          id: foundService.id,
          name: foundService.name, // Use the official name from DB
          price: foundService.price || foundService.regular || 0,
          isUnknown: false,
        };
      }

      // Fallback to translations.ts
      const translationPrice = lookupPriceInTranslations(nameWithoutPrefix, isMatch);
      if (translationPrice > 0) {
        return {
          id: 'from-translations',
          name: originalName, // Keep original name if not found in DB
          price: translationPrice,
          isUnknown: false,
        };
      }

      // No match found
      return {
        id: 'unknown',
        name: originalName,
        price: 0,
        isUnknown: true,
      };
    });
  }

  return displayServices;
}

/**
 * Lookup price in translations.ts service menu
 */
function lookupPriceInTranslations(
  serviceName: string,
  isMatch: (name: string) => boolean
): number {
  try {
    const menuData = translations.en.services_page.service_menu.data;
    const allGroups = Object.values(menuData).flatMap((cat: any) => cat.groups || []);
    const allItems = allGroups.flatMap((g: any) => g.items || []);

    // Also check signature/comprehensive categories
    const cats = translations.en.services_page.categories;
    const otherItems = Object.values(cats).flatMap((c: any) => c.items || []);

    const allServiceItems = [...allItems, ...otherItems];

    // Find matching item
    const foundItem = allServiceItems.find((item: any) => isMatch(item.name));
    if (foundItem) {
      // Try different price field names
      if (typeof foundItem.regular === 'number') return foundItem.regular;
      if (typeof foundItem.price === 'number') return foundItem.price;
      if (typeof foundItem.price === 'string') {
        return parseFloat(foundItem.price.replace(/[$,]/g, '')) || 0;
      }
    }
  } catch (e) {
    console.error('Error looking up translation price:', e);
  }

  return 0;
}

/**
 * Calculate total amount from services
 */
export function calculateTotalAmount(services: ServiceWithPrice[]): number {
  return services.reduce((sum, s) => sum + (s.price || 0), 0);
}
