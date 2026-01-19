export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  createdBy: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: 'manicure' | 'pedicure' | 'combo' | 'special';
  imageUrl?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'technician';
  branchId?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  branchId: string;
  serviceId: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  branchId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  serviceId?: string;
  createdAt: string;
}

export interface Revenue {
  appointmentId: string;
  branchId: string;
  staffId: string;
  amount: number;
  date: string;
  serviceId: string;
  createdAt: string;
}

export interface PayrollData {
  staffId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalRevenue: number;
  commissionRate: number;
  totalCommission: number;
  recordsCount: number;
  records: Revenue[];
}
