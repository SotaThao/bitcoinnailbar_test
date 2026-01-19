/**
 * Service Menu Constants
 * Centralized constants for service management
 * Extracted from Services.tsx for reusability
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Category definition with icon and display name
 */
export interface ServiceCategory {
  id: number;
  name: string; // Display name (e.g., "Acrylic Nail Services")
  key: string; // JSON key (e.g., "acrylic")
  icon: LucideIcon;
  imageUrl?: string;
}

/**
 * Default values for new services
 */
export const SERVICE_FORM_DEFAULTS = {
  name: '',
  category: '',
  groupName: 'General',
  duration: '45 min',
  price: '',
  memberPrice: '',
  status: 'Active',
} as const;

/**
 * Service duration options
 */
export const DURATION_OPTIONS = [
  '15 min',
  '30 min',
  '45 min',
  '60 min',
  '90 min',
  '120 min',
] as const;

/**
 * Service status options
 */
export const STATUS_OPTIONS = ['Active', 'Inactive'] as const;