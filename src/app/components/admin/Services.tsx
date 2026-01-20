import { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { SearchInput } from '../ui/search-input';
import { Plus, Scissors, ImageIcon, PlusCircle } from 'lucide-react';
import AdminLayout from '../AdminLayout';

// New imports - Atomic components
import { ServiceCategorySidebar } from './molecules/ServiceCategorySidebar';
import { ServicesTable } from './organisms/ServicesTable';
import { ServiceFormSheet } from './molecules/ServiceFormSheet';
import { CategoryFormSheet } from './molecules/CategoryFormSheet';
import MenuUploadContent from './MenuUploadContent';
import { PillTabs, PillTabsContent, PillTabsList, PillTabsTrigger } from '../ui/pill-tabs';

// Utilities and constants
import { filterServices, flattenServiceData } from '../../lib/service-menu-utils';
import { useServiceMenu } from '../../hooks/useServiceMenu';
import { useServiceCategories } from '../../hooks/useServiceCategories';
import type { Service } from '../../lib/admin-types';
import type { ServiceCategory } from '../../lib/service-constants';

export default function AdminServices() {
  // Main Tab State (Services List vs Menu Upload)
  const [mainTab, setMainTab] = useState<'services' | 'menu'>('services');
  
  // UI State
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Category Management State
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  // Data management via custom hooks
  const { services: rawServices, rawData, loading, saveService, deleteService } = useServiceMenu();
  const { 
    categories, 
    loading: categoriesLoading,
    addCategory, 
    updateCategory, 
    deleteCategory,
    refreshCategories
  } = useServiceCategories();
  
  // Use only backend categories with default icon for those without one
  const allCategories = categories.map(cat => ({
    ...cat,
    icon: cat.icon || PlusCircle, // Default icon for custom categories
  }));

  // Show all categories including "Add-ons" in the sidebar so they can be managed
  // Previous logic filtered them out, which prevented editing/management in Admin panel
  const visibleCategories = allCategories;

  // Auto-select first category when categories load
  useEffect(() => {
    if (visibleCategories.length > 0 && !activeTab) {
      setActiveTab(visibleCategories[0].name);
    }
  }, [visibleCategories, activeTab]);

  // Build dynamic category mapping (key -> name)
  const categoryMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    allCategories.forEach(cat => {
      mapping[cat.key] = cat.name;
    });
    return mapping;
  }, [allCategories]);

  // Re-flatten services with dynamic category mapping when categories change
  const services = useMemo(() => {
    if (!rawData) return [];
    return flattenServiceData(rawData, categoryMapping);
  }, [rawData, categoryMapping]);

  // Filter services by active category and search query
  const filteredServices = filterServices(services, activeTab, searchQuery);
  
  // Get active category to check its status
  const activeCategory = allCategories.find(cat => cat.name === activeTab);
  const isCategoryDisabled = (activeCategory as any)?.status === 'disabled';

  // Open sheet for creating/editing service
  const handleOpenServiceSheet = (service?: Service) => {
    // Warn if trying to add service to disabled category
    if (!service && isCategoryDisabled) {
      if (!confirm('This category is currently disabled. Services in disabled categories cannot be activated. Do you still want to add a service?')) {
        return;
      }
    }
    setEditingService(service || null);
    setIsServiceSheetOpen(true);
  };

  // Handle save from form sheet
  const handleSaveService = async (
    formData: {
      name: string;
      category: string;
      groupName: string;
      price: string;
      memberPrice: string;
      status: 'active' | 'disabled';
      serviceType: 'regular' | 'addon';
      compatibleServiceIds: string[];
      ownerRecommended?: boolean; // NEW: Owner recommendation flag
      durationMinutes?: number;
    },
    editingServiceId?: string
  ): Promise<boolean> => {
    const result = await saveService(formData, editingServiceId, allCategories);
    return result.success;
  };

  // Quick toggle status without opening form
  const handleToggleStatus = async (service: Service) => {
    const newStatus = service.status === 'active' ? 'disabled' : 'active';
    
    console.log(`🔄 [Services] Toggling status for \"${service.name}\" from ${service.status} to ${newStatus}`);
    
    const result = await saveService(
      {
        name: service.name,
        category: service.category,
        groupName: service.groupName,
        price: service.price,
        memberPrice: service.memberPrice || service.member || '',
        status: newStatus,
        serviceType: service.serviceType || 'regular',
        compatibleServiceIds: service.compatibleServiceIds || [],
        ownerRecommended: service.owner_recommended, // Preserve owner recommendation flag
        durationMinutes: service.durationMinutes,
      },
      service.id,
      allCategories
    );
    
    if (result.success) {
      console.log(`✅ [Services] Status toggled successfully to ${newStatus}`);
    } else {
      console.error(`❌ [Services] Failed to toggle status`);
    }
  };

  const handleQuickCreateService = async (
    data: {
      name: string;
      price: string;
      memberPrice: string;
    }
  ): Promise<string | null> => {
    // Find the dedicated Add-on category if it exists
    const addonCategory = allCategories.find(cat => ['add-on', 'add-ons', 'addon'].includes(cat.name.toLowerCase()));
    
    let targetCategoryName = activeTab;
    let categoriesForSave = allCategories;

    if (addonCategory) {
      targetCategoryName = addonCategory.name;
    } else {
      // Auto-create "Add-ons" category if it doesn't exist
      const newName = 'Add-ons';
      const newKey = 'add-ons';
      
      console.log('✨ Auto-creating missing Add-ons category...');
      const success = await addCategory({
        name: newName,
        key: newKey,
        status: 'active'
      });

      if (success) {
        targetCategoryName = newName;
        // Add to temporary list so saveService can find the key immediately
        categoriesForSave = [
          ...allCategories,
          {
            id: -1, // Temporary ID
            name: newName,
            key: newKey,
            status: 'active',
            icon: PlusCircle
          }
        ];
      }
    }

    // Create new add-on service in the target category with group "Add on"
    const result = await saveService({
      name: data.name,
      category: targetCategoryName,
      groupName: 'Add on',
      price: data.price,
      memberPrice: data.memberPrice,
      status: 'active',
      serviceType: 'addon', // This is an add-on service
      compatibleServiceIds: [],
    }, undefined, categoriesForSave);

    if (result.success && result.newServiceId) {
      return result.newServiceId;
    }
    return null;
  };

  // Category management handlers
  const handleOpenCategorySheet = (category?: ServiceCategory) => {
    setEditingCategory(category || null);
    setIsCategorySheetOpen(true);
  };

  const handleSaveCategory = async (categoryData: Omit<ServiceCategory, 'id'> | ServiceCategory): Promise<boolean> => {
    if ('id' in categoryData && categoryData.id) {
      // Update existing
      return await updateCategory(categoryData as ServiceCategory);
    } else {
      // Add new
      return await addCategory(categoryData as Omit<ServiceCategory, 'id'>);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    console.log(`🗑️ [Services.tsx] handleDeleteCategory called with ID: ${categoryId}`);
    const success = await deleteCategory(categoryId);
    if (success) {
      console.log(`✅ [Services.tsx] Category ${categoryId} deleted successfully`);
      // Optionally switch to another tab if deleted category was active
      if (allCategories.length > 0) {
        const remainingCategories = allCategories.filter(cat => cat.id !== categoryId);
        if (remainingCategories.length > 0 && activeTab === allCategories.find(cat => cat.id === categoryId)?.name) {
          setActiveTab(remainingCategories[0].name);
        }
      }
    } else {
      console.error(`❌ [Services.tsx] Failed to delete category ${categoryId}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Main Tab Switcher with PillTabs */}
        <PillTabs value={mainTab} onValueChange={(value) => setMainTab(value as 'services' | 'menu')}>
          <PillTabsList>
            <PillTabsTrigger value="services" className="gap-2">
              <Scissors className="h-4 w-4" />
              Services List
            </PillTabsTrigger>
            <PillTabsTrigger value="menu" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Menu Upload
            </PillTabsTrigger>
          </PillTabsList>

          {/* Services List Tab Content */}
          <PillTabsContent value="services">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar: Categories */}
              <div className="lg:col-span-1">
                <ServiceCategorySidebar
                  categories={visibleCategories}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onAddCategory={() => handleOpenCategorySheet()}
                  onEditCategory={handleOpenCategorySheet}
                  onDeleteCategory={handleDeleteCategory}
                />
              </div>

              {/* Services Table Area */}
              <div className="lg:col-span-3 space-y-4">
                {/* Search Bar & Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <SearchInput
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    onClick={() => handleOpenServiceSheet()}
                    className="bg-[#FF9F1C] text-white hover:bg-[#e0890f] shadow-sm font-semibold whitespace-nowrap"
                    disabled={isCategoryDisabled}
                    title={isCategoryDisabled ? 'Cannot add services to disabled category' : 'Add new service'}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New Service
                  </Button>
                </div>

                {/* Services Table */}
                <ServicesTable
                  services={filteredServices}
                  allAddons={services.filter(s => s.serviceType === 'addon')}
                  loading={loading}
                  onEdit={handleOpenServiceSheet}
                  onDelete={deleteService}
                  onAddNew={() => handleOpenServiceSheet()}
                  isCategoryDisabled={isCategoryDisabled}
                  onToggleStatus={handleToggleStatus}
                />
              </div>
            </div>
          </PillTabsContent>

          {/* Menu Upload Tab Content */}
          <PillTabsContent value="menu">
            <MenuUploadContent />
          </PillTabsContent>
        </PillTabs>

        {/* Edit/Create Service Form Sheet */}
        <ServiceFormSheet
          isOpen={isServiceSheetOpen}
          onClose={() => setIsServiceSheetOpen(false)}
          editingService={editingService}
          categories={allCategories}
          defaultCategory={activeTab}
          onSave={handleSaveService}
          onQuickCreate={handleQuickCreateService}
          allServices={services}
          onEditAddon={handleOpenServiceSheet}
          onDeleteAddon={deleteService}
          onToggleStatus={handleToggleStatus}
        />

        {/* Edit/Create Category Form Sheet */}
        <CategoryFormSheet
          isOpen={isCategorySheetOpen}
          onClose={() => setIsCategorySheetOpen(false)}
          editingCategory={editingCategory}
          onSave={handleSaveCategory}
        />
      </div>
    </AdminLayout>
  );
}