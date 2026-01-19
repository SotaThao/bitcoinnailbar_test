/**
 * Shared TypeScript types for Admin Panel
 * Centralized type definitions to ensure type safety across all admin components
 */

export interface Staff {
  id: string;
  name: string;
  nickname?: string;
  role: string;
  phone: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'on-leave';
  hireDate: string; // YYYY-MM-DD format
  licenseNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  baseHourlyRate: number;
  commissionRate: string; // Stored as "60" (percentage 0-100)
  tipSplit?: string;
  employmentType: 'W2' | '1099';
  rating?: string;
  skillLevel?: 'junior' | 'senior' | 'master';
  specialties: string[];
  workingDays: string[];
}

export interface Service {
  id: string;
  name: string;
  price: number; // Parsed max price for calculations
  regular: number | string; // Raw value from backend (can be string like "5-10")
  member: number | string; // Raw value from backend
  duration?: string;
  durationMinutes?: number;
  category?: string;
  categoryKey?: string;
  groupName?: string;
  memberPrice?: number; // Parsed max price for calculations
  status?: 'active' | 'disabled';
  serviceType?: 'regular' | 'addon';
  compatibleServiceIds?: string[];
  priceDisplay?: string; // For displaying raw price text like "5-10", "10+"
  memberPriceDisplay?: string; // For displaying raw member price
  owner_recommended?: boolean; // For chatbot priority recommendations
}

/**
 * Service menu item (individual service in a group)
 */
export interface ServiceMenuItem {
  name: string;
  regular: number;
  member: number;
  duration?: string;
}

/**
 * Service group (contains multiple service items)
 */
export interface ServiceGroup {
  name: string;
  items: ServiceMenuItem[];
}

/**
 * Service category data (contains multiple groups)
 */
export interface ServiceCategoryData {
  groups: ServiceGroup[];
}

/**
 * Complete service menu data structure
 * Key is category key (e.g., "acrylic", "dipping")
 */
export interface ServiceMenuData {
  [categoryKey: string]: ServiceCategoryData;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  appointmentTime: string; // ISO date string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  staffId?: string;
  serviceIds?: string[];
  serviceNames?: string[];
  notes?: string;
  totalAmount?: number;
  createdAt?: string;
}

export interface DashboardStats {
  revenue: {
    value: string;
    subtext: string;
  };
  activeTickets: {
    value: string;
    subtext: string;
  };
  staff: {
    value: string;
    subtext: string;
  };
  waitlist: {
    value: string;
    subtext: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: Array<{
    id: string;
    client: string;
    service: string;
    staff: string;
    price: string;
    status: string;
  }>;
  staffStatus: Array<{
    name: string;
    text: string;
    color: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SocialMediaSettings {
  facebook: string;
  instagram: string;
  tiktok: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalAppointments: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
}