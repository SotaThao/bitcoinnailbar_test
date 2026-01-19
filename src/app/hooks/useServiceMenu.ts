/**
 * Custom hook for service menu management
 * Provides loading state, CRUD operations, and data transformations
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api-client';
import {
  flattenServiceData,
  updateServiceInData,
  deleteServiceFromData,
} from '../lib/service-menu-utils';
import type { Service, ServiceMenuData } from '../lib/admin-types';

interface UseServiceMenuReturn {
  services: Service[];
  rawData: ServiceMenuData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  saveService: (
    serviceData: {
      name: string;
      category: string;
      groupName: string;
      price: string;
      memberPrice: string;
      status: 'active' | 'disabled';
      serviceType: 'regular' | 'addon';
      compatibleServiceIds: string[];
      ownerRecommended?: boolean; // NEW: Owner recommendation flag
    },
    editingServiceId?: string,
    allCategories?: Array<{ name: string; key: string }>
  ) => Promise<{ success: boolean; newServiceId?: string }>;
  deleteService: (serviceId: string) => Promise<boolean>;
}

export function useServiceMenu(): UseServiceMenuReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [rawData, setRawData] = useState<ServiceMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [useServiceMenu] Starting fetch from:', '/settings/service-menu');
      const response = await apiClient.settings.getServiceMenu();
      console.log('📥 [useServiceMenu] Response received:', response);

      if (response.success && response.data) {
        setRawData(response.data);
        const flattened = flattenServiceData(response.data);
        setServices(flattened);
        console.log('✅ [useServiceMenu] Loaded services from API, count:', flattened.length);
      } else {
        const errorMsg = response.error || 'Failed to load services data';
        console.error('❌ [useServiceMenu] Error:', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while loading services';
      console.error('❌ [useServiceMenu] Exception:', err);
      setError(errorMsg);
      console.error('Error loading services:', err);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
      console.log('🏁 [useServiceMenu] Fetch completed');
    }
  }, []);

  const saveToBackend = async (data: ServiceMenuData): Promise<boolean> => {
    try {
      const response = await apiClient.settings.updateServiceMenu(data);

      if (!response.success) {
        throw new Error(response.error || 'Failed to save');
      }

      return true;
    } catch (err: any) {
      console.error('Save failed:', err);
      toast.error(err.message || 'Failed to save changes');
      return false;
    }
  };

  const saveService = async (
    serviceData: {
      name: string;
      category: string;
      groupName: string;
      price: string;
      memberPrice: string;
      status: 'active' | 'disabled';
      serviceType: 'regular' | 'addon';
      compatibleServiceIds: string[];
      ownerRecommended?: boolean; // NEW: Owner recommendation flag
    },
    editingServiceId?: string,
    allCategories?: Array<{ name: string; key: string }>
  ): Promise<{ success: boolean; newServiceId?: string }> => {
    if (!rawData) {
      toast.error('Service data not loaded');
      return { success: false };
    }

    console.log('🔍 saveService called with:', {
      serviceData,
      editingServiceId,
      allCategories: allCategories?.map(c => ({ name: c.name, key: c.key }))
    });

    let categoryKey: string | undefined;
    
    if (allCategories) {
      const categoryObj = allCategories.find(cat => cat.name === serviceData.category);
      categoryKey = categoryObj?.key;
      console.log('🔑 Found categoryKey:', categoryKey, 'for category:', serviceData.category);
    } else {
      console.error('❌ No allCategories provided');
      toast.error('Category mapping not available');
      return { success: false };
    }
    
    if (!categoryKey) {
      console.error('❌ Invalid category:', serviceData.category);
      toast.error('Invalid category');
      return { success: false };
    }

    try {
      console.log('📝 Creating/updating service in category:', categoryKey);
      const { updatedData, newServiceId } = updateServiceInData(
        rawData,
        {
          name: serviceData.name,
          price: serviceData.price,
          memberPrice: serviceData.memberPrice || '',
          status: serviceData.status,
          serviceType: serviceData.serviceType,
          compatibleServiceIds: serviceData.compatibleServiceIds,
          ownerRecommended: serviceData.ownerRecommended // NEW: Owner recommendation flag
        },
        categoryKey,
        serviceData.groupName,
        editingServiceId
      );

      console.log('💾 Saving to backend...');
      const success = await saveToBackend(updatedData);

      if (success) {
        console.log('✅ Backend save successful, updating local state...');
        setRawData(updatedData);
        
        // Build category mapping from allCategories
        const categoryMapping: Record<string, string> = {};
        if (allCategories) {
          allCategories.forEach(cat => {
            categoryMapping[cat.key] = cat.name;
          });
        }
        
        // Flatten with dynamic mapping
        const flattened = flattenServiceData(updatedData, allCategories ? categoryMapping : undefined);
        setServices(flattened);
        console.log('✅ Local state updated, new services count:', flattened.length);
        toast.success(editingServiceId ? 'Service updated' : 'Service created');
        return { success: true, newServiceId };
      }

      console.error('❌ Backend save failed');
      return { success: false };
    } catch (err: any) {
      console.error('❌ Error saving service:', err);
      toast.error(err.message || 'Failed to save service');
      return { success: false };
    }
  };

  const deleteService = async (serviceId: string): Promise<boolean> => {
    if (!rawData) {
      toast.error('Service data not loaded');
      return false;
    }

    try {
      const updatedData = deleteServiceFromData(rawData, serviceId);

      if (!updatedData) {
        toast.error('Service not found');
        return false;
      }

      const success = await saveToBackend(updatedData);

      if (success) {
        setRawData(updatedData);
        setServices(flattenServiceData(updatedData));
        toast.success('Service deleted');
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error deleting service:', err);
      toast.error(err.message || 'Failed to delete service');
      return false;
    }
  };

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    rawData,
    loading,
    error,
    refetch: loadServices,
    saveService,
    deleteService,
  };
}