/**
 * Service Menu Utilities
 * Pure utility functions for service data transformation
 * Extracted from Services.tsx for reusability and testability
 */

import type { Service, ServiceMenuData } from './admin-types';

/**
 * Parse price string and return the maximum price value
 * Supports formats:
 * - "45" → 45
 * - "5-10" → 10 (max of range)
 * - "10+" → 10 (the number before +)
 * - "" → 0
 * 
 * @param priceStr - Price string to parse
 * @returns Maximum price as number
 */
export function parseMaxPrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') {
    return priceStr;
  }
  
  if (!priceStr || typeof priceStr !== 'string') {
    return 0;
  }

  const trimmed = priceStr.trim();
  
  // Handle range format "5-10"
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    const prices = parts.map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
    return prices.length > 0 ? Math.max(...prices) : 0;
  }
  
  // Handle "+" format "10+"
  if (trimmed.includes('+')) {
    const num = parseFloat(trimmed.replace('+', ''));
    return isNaN(num) ? 0 : num;
  }
  
  // Handle single number "45"
  const num = parseFloat(trimmed);
  return isNaN(num) ? 0 : num;
}

/**
 * Flatten nested service menu data structure into flat array
 * 
 * Transforms:
 * {
 *   acrylic: {
 *     groups: [
 *       { name: "FULL SET", items: [{ name: "Acrylic Full Set", regular: 45, member: 40 }] }
 *     ]
 *   }
 * }
 * 
 * Into:
 * [
 *   {
 *     id: "acrylic-0-0",
 *     name: "Acrylic Full Set",
 *     description: "", // Service description
 *     category: "Acrylic Nail Services",
 *     categoryKey: "acrylic",
 *     groupName: "FULL SET",
 *     price: 45,
 *     memberPrice: 40,
 *     ...
 *   }
 * ]
 */
export function flattenServiceData(
  data: ServiceMenuData,
  categoryMapping?: Record<string, string>
): Service[] {
  console.log('🔧 [flattenServiceData] Input data:', data);
  console.log('🔧 [flattenServiceData] Category mapping:', categoryMapping);
  
  const flattened: Service[] = [];
  
  // Use provided mapping, fallback to using key as name if no mapping provided
  const keyToName = categoryMapping || {};

  Object.keys(data).forEach((key) => {
    const categoryData = data[key];
    const categoryName = keyToName[key] || key;
    
    console.log(`🔧 [flattenServiceData] Processing category: ${key} (${categoryName})`);

    if (categoryData.groups) {
      console.log(`🔧 [flattenServiceData] Found ${categoryData.groups.length} groups in category ${key}`);
      categoryData.groups.forEach((group, groupIndex) => {
        if (group.items) {
          console.log(`🔧 [flattenServiceData] Group "${group.name}" has ${group.items.length} items`);
          group.items.forEach((item, itemIndex) => {
            const regularRaw = item.regular || 0;
            const memberRaw = item.member || 0;
            
            flattened.push({
              id: `${key}-${groupIndex}-${itemIndex}`,
              name: item.name,
              description: (item as any).description || '', // Service description
              category: categoryName,
              categoryKey: key,
              groupName: group.name,
              duration: item.duration || '45 min',
              durationMinutes: (item as any).durationMinutes || 45,
              price: parseMaxPrice(regularRaw), // Parsed for calculations
              regular: regularRaw, // Raw value (can be string)
              memberPrice: parseMaxPrice(memberRaw), // Parsed for calculations
              member: memberRaw, // Raw value (can be string)
              priceDisplay: typeof regularRaw === 'string' ? regularRaw : String(regularRaw), // For display
              memberPriceDisplay: memberRaw ? (typeof memberRaw === 'string' ? memberRaw : String(memberRaw)) : '', // For display
              status: (item as any).status || 'active', // Default to 'active' if not set
              serviceType: (item as any).serviceType || 'regular',
              compatibleServiceIds: (item as any).compatibleServiceIds || [],
              ownerRecommended: (item as any).owner_recommended || false, // NEW: Owner recommendation flag
              imageUrl: (item as any).imageUrl || '', // Service image URL
            });
          });
        } else {
          console.warn(`⚠️ [flattenServiceData] Group "${group.name}" has no items`);
        }
      });
    } else {
      console.warn(`⚠️ [flattenServiceData] Category ${key} has no groups`);
    }
  });

  console.log(`✅ [flattenServiceData] Total services flattened: ${flattened.length}`);
  return flattened;
}

/**
 * Parse service ID to extract category key, group index, and item index
 * 
 * @param serviceId - Composite ID like "acrylic-0-2"
 * @returns Object with parsed components
 */
export function parseServiceId(serviceId: string): {
  categoryKey: string;
  groupIndex: number;
  itemIndex: number;
} {
  const [categoryKey, groupIdxStr, itemIdxStr] = serviceId.split('-');
  return {
    categoryKey,
    groupIndex: parseInt(groupIdxStr, 10),
    itemIndex: parseInt(itemIdxStr, 10),
  };
}

/**
 * Update or create a service in the data structure
 * 
 * @param data - Current service menu data
 * @param serviceData - Service data to save (name, price, etc.)
 * @param categoryKey - Category key (e.g., "acrylic")
 * @param groupName - Group name (e.g., "FULL SET")
 * @param editingServiceId - If editing, the ID of the service being edited
 * @returns Updated service menu data
 */
export function updateServiceInData(
  data: ServiceMenuData,
  serviceData: {
    name: string;
    description?: string; // Service description
    price: string | number; // Support both string and number
    memberPrice: string | number; // Support both string and number
    status?: 'active' | 'disabled';
    serviceType?: 'regular' | 'addon';
    compatibleServiceIds?: string[];
    ownerRecommended?: boolean; // NEW: Owner recommendation flag
    durationMinutes?: number; // Duration in minutes
    imageUrl?: string; // Service image URL
  },
  categoryKey: string,
  groupName: string,
  editingServiceId?: string
): { updatedData: ServiceMenuData; newServiceId?: string } {
  // Deep clone to avoid mutations
  const newData = JSON.parse(JSON.stringify(data)) as ServiceMenuData;

  // Ensure category exists
  if (!newData[categoryKey]) {
    newData[categoryKey] = { groups: [] };
  }

  // Find or create group
  let groupIndex = newData[categoryKey].groups.findIndex((g) => g.name === groupName);
  let targetGroup = newData[categoryKey].groups[groupIndex];
  
  if (!targetGroup) {
    targetGroup = { name: groupName, items: [] };
    newData[categoryKey].groups.push(targetGroup);
    groupIndex = newData[categoryKey].groups.length - 1;
  }

  const newItem: any = {
    name: serviceData.name,
    regular: serviceData.price,
    member: serviceData.memberPrice,
  };

  // Add description if provided
  if (serviceData.description !== undefined) {
    newItem.description = serviceData.description;
  }

  // Add status if provided
  if (serviceData.status) {
    newItem.status = serviceData.status;
  }

  // Add serviceType if provided
  if (serviceData.serviceType) {
    newItem.serviceType = serviceData.serviceType;
  }

  // Add compatibleServiceIds if provided
  if (serviceData.compatibleServiceIds && serviceData.compatibleServiceIds.length > 0) {
    newItem.compatibleServiceIds = serviceData.compatibleServiceIds;
  }

  // Add ownerRecommended if provided (NEW)
  if (serviceData.ownerRecommended !== undefined) {
    newItem.owner_recommended = serviceData.ownerRecommended;
  }

  // Add durationMinutes if provided
  if (serviceData.durationMinutes !== undefined && serviceData.durationMinutes > 0) {
    newItem.durationMinutes = serviceData.durationMinutes;
  }

  // Add imageUrl if provided
  if (serviceData.imageUrl !== undefined) {
    newItem.imageUrl = serviceData.imageUrl;
  }

  let newServiceId: string | undefined;

  if (editingServiceId) {
    // Update existing service
    const { categoryKey: oldKey, groupIndex: oldGroupIdx, itemIndex: oldItemIdx } =
      parseServiceId(editingServiceId);

    // Check if category or group changed
    const isSameLocation =
      oldKey === categoryKey &&
      data[oldKey]?.groups[oldGroupIdx]?.name === groupName;

    if (isSameLocation) {
      // Same location - just update the item
      newData[categoryKey].groups[oldGroupIdx].items[oldItemIdx] = newItem;
    } else {
      // Different location - remove from old, add to new
      if (newData[oldKey]?.groups[oldGroupIdx]?.items[oldItemIdx]) {
        newData[oldKey].groups[oldGroupIdx].items.splice(oldItemIdx, 1);
      }
      targetGroup.items.push(newItem);
      // Construct new ID for the moved item
      newServiceId = `${categoryKey}-${groupIndex}-${targetGroup.items.length - 1}`;
    }
  } else {
    // Create new service
    targetGroup.items.push(newItem);
    // Construct new ID
    newServiceId = `${categoryKey}-${groupIndex}-${targetGroup.items.length - 1}`;
  }

  return { updatedData: newData, newServiceId };
}

/**
 * Delete a service from the service menu data structure
 * 
 * @param data - Current service menu data
 * @param serviceId - ID of service to delete (e.g., "acrylic-0-2")
 * @returns Updated service menu data, or null if service not found
 */
export function deleteServiceFromData(
  data: ServiceMenuData,
  serviceId: string
): ServiceMenuData | null {
  const { categoryKey, groupIndex, itemIndex } = parseServiceId(serviceId);

  // Validate that the service exists
  if (
    !data[categoryKey] ||
    !data[categoryKey].groups[groupIndex] ||
    !data[categoryKey].groups[groupIndex].items[itemIndex]
  ) {
    return null;
  }

  // Deep clone to avoid mutations
  const newData = JSON.parse(JSON.stringify(data)) as ServiceMenuData;

  // Remove the item
  newData[categoryKey].groups[groupIndex].items.splice(itemIndex, 1);

  // Optional: Clean up empty groups
  if (newData[categoryKey].groups[groupIndex].items.length === 0) {
    // Uncomment to remove empty groups:
    // newData[categoryKey].groups.splice(groupIndex, 1);
  }

  return newData;
}

/**
 * Filter services by category and search query
 * 
 * @param services - Array of services
 * @param category - Category display name to filter by
 * @param searchQuery - Search query (filters by service name)
 * @returns Filtered services
 */
export function filterServices(
  services: Service[],
  category: string,
  searchQuery: string
): Service[] {
  return services.filter(
    (service) =>
      service.category === category &&
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

/**
 * Validate service form data
 * 
 * @param formData - Form data to validate
 * @returns Object with isValid flag and error message
 */
export function validateServiceForm(formData: {
  name: string;
  category: string;
  groupName: string;
  price: string;
  memberPrice: string;
  serviceType?: 'regular' | 'addon';
  compatibleServiceIds?: string[];
}): { isValid: boolean; error?: string } {
  if (!formData.name.trim()) {
    return { isValid: false, error: 'Service name is required' };
  }

  if (!formData.category) {
    return { isValid: false, error: 'Category is required' };
  }

  if (!formData.groupName.trim()) {
    return { isValid: false, error: 'Group name is required' };
  }

  // Price is now optional for both regular and add-on services
  // Validate member price comparison only if both prices are provided
  if (formData.memberPrice.trim() && formData.price.trim()) {
    const regularPriceNum = parseFloat(formData.price);
    const memberPriceNum = parseFloat(formData.memberPrice);
    
    // Only compare if both are valid single numbers (not ranges or "+")
    if (!isNaN(regularPriceNum) && !isNaN(memberPriceNum)) {
      if (memberPriceNum > regularPriceNum) {
        return { isValid: false, error: 'Member price cannot be higher than regular price' };
      }
    }
  }

  return { isValid: true };
}