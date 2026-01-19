/**
 * Custom hook for analytics data
 * Provides loading state, error handling, and analytics data
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { AnalyticsData } from '../lib/admin-types';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = startOfMonth(new Date()).toISOString();
      const endDate = endOfMonth(new Date()).toISOString();

      const response = await apiClient.analytics.getRevenue(startDate, endDate);

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        const errorMsg = response.error || 'Failed to load analytics';
        setError(errorMsg);
        // Don't show toast for analytics as it's not critical
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while loading analytics';
      setError(errorMsg);
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: loadAnalytics,
  };
}
