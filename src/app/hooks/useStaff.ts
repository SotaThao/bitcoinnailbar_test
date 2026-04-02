/**
 * Custom hook for managing staff data
 * Provides loading state, error handling, and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import type { Staff } from '../lib/admin-types';
import { normalizeStaffList } from '@/app/lib/staffNickName';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.staff.getAll();

      if (response.success && response.data) {
        setStaff(normalizeStaffList(response.data) as Staff[]);
      } else {
        const errorMsg = response.error || 'Failed to load staff';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while loading staff';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  return {
    staff,
    loading,
    error,
    refetch: loadStaff,
  };
}
