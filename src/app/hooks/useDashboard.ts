/**
 * Custom hook for dashboard data
 * Provides loading state, error handling, and dashboard stats
 */

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import type { DashboardData } from '../lib/admin-types';

export function useDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await apiClient.dashboard.getStats();

      if (!response.success || !response.data) {
        const errorMsg = response.error || 'Failed to load dashboard data';
        throw new Error(errorMsg);
      }

      return response.data as DashboardData;
    },
    staleTime: 30 * 1000, // Fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds (optional)
  });

  // Show error toast only on error
  if (error) {
    toast.error(error.message);
  }

  return {
    dashboardData: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}