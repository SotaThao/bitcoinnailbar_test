/**
 * Custom hook for dashboard data
 * Provides loading state, error handling, and dashboard stats
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import type { DashboardData } from '../lib/admin-types';

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.dashboard.getStats();

      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        const errorMsg = response.error || 'Failed to load dashboard data';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while loading dashboard';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    dashboardData,
    loading,
    error,
    refetch: loadDashboard,
  };
}
