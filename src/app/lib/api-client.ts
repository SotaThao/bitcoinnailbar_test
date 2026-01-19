/**
 * Centralized API Client for Admin Panel
 * Provides type-safe fetch wrapper with consistent error handling
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { ApiResponse } from './admin-types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112`;

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Core fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  // Build URL with query parameters
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  // Default headers
  const headers = {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error: any) {
    console.error('API request failed:', endpoint, error);
    return {
      success: false,
      error: error.message || 'Network error occurred',
    };
  }
}

/**
 * API Client Methods
 */
export const apiClient = {
  // Dashboard
  dashboard: {
    getStats: () => apiRequest('/dashboard/stats'),
  },

  // Appointments
  appointments: {
    getAll: () => apiRequest('/appointments'),
    getById: (id: string) => apiRequest(`/appointments/${id}`),
    update: (id: string, data: any) =>
      apiRequest(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/appointments/${id}`, { method: 'DELETE' }),
  },

  // Services
  services: {
    getAll: () => apiRequest('/services'),
    getById: (id: string) => apiRequest(`/services/${id}`),
    create: (data: any) =>
      apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/services/${id}`, { method: 'DELETE' }),
  },

  // Staff
  staff: {
    getAll: () => apiRequest('/staff'),
    getById: (id: string) => apiRequest(`/staff/${id}`),
    create: (data: any) =>
      apiRequest('/staff', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/staff/${id}`, { method: 'DELETE' }),
  },

  // Settings
  settings: {
    getSocialMedia: () =>
      apiRequest<SocialMediaSettings>('/settings/social-media'),
    updateSocialMedia: (data: SocialMediaSettings) =>
      apiRequest<void>('/settings/social-media', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getServiceMenu: () =>
      apiRequest<any>('/settings/service-menu'),
    updateServiceMenu: (data: any) =>
      apiRequest<void>('/settings/service-menu', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Analytics
  analytics: {
    getRevenue: (startDate: string, endDate: string) =>
      apiRequest('/analytics/revenue', {
        params: { startDate, endDate },
      }),
  },
};

// Export for backward compatibility
export { BASE_URL, publicAnonKey };