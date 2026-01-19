export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'technician' | 'manager' | 'admin';
  branchId: string;
  commissionRate: number;
  specialty: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  branchId: string;
  staffId: string;
  serviceIds: string[];
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  totalAmount: number;
  tip?: number;
  materialCost?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  customerId?: string;
  customerName: string;
  branchId: string;
  staffId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Payroll {
  staffId: string;
  staffName: string;
  weekStart: string;
  weekEnd: string;
  appointmentsCount: number;
  totalRevenue: number;
  materialCosts: number;
  netRevenue: number;
  commissionRate: number;
  commission: number;
  tips: number;
  totalEarnings: number;
}

export interface Analytics {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageRevenuePerAppointment: number;
  totalStaff: number;
  totalReviews: number;
  averageRating: number;
  period: string;
  startDate?: string;
  endDate?: string;
}

export interface WeeklyRevenue {
  week: string;
  weekStart: string;
  weekEnd: string;
  revenue: number;
  appointments: number;
}
