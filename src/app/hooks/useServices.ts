/**
 * Custom hook for managing services data
 * Provides loading state, error handling, and service operations
 * 
 * UPDATE: Now fetches from service-menu instead of legacy services endpoint
 * to ensure data consistency between Admin Panel and Booking Page
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import type { Service } from '../lib/admin-types';
import { flattenServiceData } from '../lib/service-menu-utils';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use getServiceMenu instead of getAll to fetch the structured menu data
      // This ensures consistency with BookingPage and AdminServices which use useServiceMenu
      const response = await apiClient.settings.getServiceMenu();

      if (response.success && response.data) {
        // Flatten the structured data into a linear list of services with IDs
        // This is crucial because BookingPage sends IDs generated from this same structure
        const flattened = flattenServiceData(response.data);
        setServices(flattened);
        console.log(`✅ [useServices] Loaded ${flattened.length} services from Service Menu`);
      } else {
        const errorMsg = response.error || 'Failed to load services';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while loading services';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    loading,
    error,
    refetch: loadServices,
  };
}
