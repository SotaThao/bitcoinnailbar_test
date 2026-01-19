import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { PlusCircle } from 'lucide-react'; // Default icon for custom categories
import type { ServiceCategory } from '../lib/service-constants';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112`;

export function useServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('🔄 [useServiceCategories] Starting fetch from:', `${API_BASE}/settings/categories`);
      const response = await fetch(`${API_BASE}/settings/categories`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      console.log('📡 [useServiceCategories] Response status:', response.status);
      const data = await response.json();
      console.log('📥 [useServiceCategories] Response data:', data);
      
      if (data.success) {
        setCategories(data.data || []);
        console.log('✅ [useServiceCategories] Loaded categories, count:', data.data?.length || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('❌ [useServiceCategories] Error:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
      console.log('🏁 [useServiceCategories] Fetch completed');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const addCategory = async (category: Omit<ServiceCategory, 'id'>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/settings/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(category)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Category added successfully! ✨');
        await fetchCategories(); // Refresh list
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
      return false;
    }
  };

  // Update category
  const updateCategory = async (updatedCategory: ServiceCategory): Promise<boolean> => {
    try {
      const updatedList = categories.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      );

      const response = await fetch(`${API_BASE}/settings/categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(updatedList)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Category updated successfully! ✨');
        await fetchCategories(); // Refresh list
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      return false;
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: number): Promise<boolean> => {
    try {
      console.log(`🗑️ [Frontend] Attempting to delete category ID: ${categoryId}`);
      
      // Guard: Validate category ID
      if (!categoryId || categoryId <= 0) {
        console.error(`❌ [Frontend] Invalid category ID: ${categoryId}`);
        toast.error('Invalid category ID');
        return false;
      }
      
      // Guard: Check if category exists in local state
      const categoryExists = categories.find(cat => cat.id === categoryId);
      if (!categoryExists) {
        console.warn(`⚠️ [Frontend] Category ${categoryId} not found in local state (may have been already deleted)`);
        toast.warning('Category not found or already deleted');
        return false;
      }
      
      const response = await fetch(`${API_BASE}/settings/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ [Frontend] Category ${categoryId} deleted successfully`);
        
        // Check if category was already deleted
        if (data.alreadyDeleted) {
          console.log(`ℹ️ [Frontend] Category ${categoryId} was already deleted, refreshing list`);
          toast.info('Category was already deleted');
        } else {
          toast.success(data.message || 'Category deleted successfully! 🗑️');
        }
        
        await fetchCategories(); // Refresh list
        return true;
      } else {
        // Handle specific error messages from backend
        throw new Error(data.error || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('❌ [Frontend] Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
      return false;
    }
  };

  // Delete multiple categories by names (CASCADE DELETE)
  const deleteCategoriesByNames = async (names: string[]): Promise<boolean> => {
    try {
      console.log(`🗑️ [Frontend] Attempting to delete categories:`, names);
      
      const response = await fetch(`${API_BASE}/settings/categories/delete-batch`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ names })
      });

      console.log(`📡 [Frontend] Batch delete response status: ${response.status}`);
      const data = await response.json();
      console.log(`📦 [Frontend] Batch delete response:`, data);

      if (data.success) {
        toast.success(data.message || `Deleted ${data.deleted?.length || 0} categories! 🗑️`);
        await fetchCategories(); // Refresh list
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete categories');
      }
    } catch (error: any) {
      console.error('❌ [Frontend] Error deleting categories:', error);
      toast.error(error.message || 'Failed to delete categories');
      return false;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    deleteCategoriesByNames,
    refreshCategories: fetchCategories
  };
}