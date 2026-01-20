import { projectId, publicAnonKey } from '@utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Branches API
export const branchesAPI = {
  getAll: () => fetchAPI('/branches'),
  create: (data: any) => fetchAPI('/branches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Services API
export const servicesAPI = {
  getAll: () => fetchAPI('/services'),
  create: (data: any) => fetchAPI('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Staff API
export const staffAPI = {
  getAll: () => fetchAPI('/staff'),
  create: (data: any) => fetchAPI('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Appointments API
export const appointmentsAPI = {
  getAll: () => fetchAPI('/appointments'),
  create: (data: any) => fetchAPI('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Payroll API
export const payrollAPI = {
  getForStaff: (staffId: string, weekStart: string, weekEnd: string) => 
    fetchAPI(`/payroll/${staffId}?weekStart=${weekStart}&weekEnd=${weekEnd}`),
  getAll: (weekStart: string, weekEnd: string) => 
    fetchAPI(`/payroll?weekStart=${weekStart}&weekEnd=${weekEnd}`),
};

// Reviews API
export const reviewsAPI = {
  getAll: () => fetchAPI('/reviews'),
  create: (data: any) => fetchAPI('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (period: string, startDate?: string, endDate?: string) => {
    let url = `/analytics/dashboard?period=${period}`;
    if (startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    return fetchAPI(url);
  },
  getRevenueByWeek: (weeks: number = 4) => 
    fetchAPI(`/analytics/revenue-by-week?weeks=${weeks}`),
};