/**
 * Service Category Sidebar Component (Molecule)
 * Displays category navigation
 */

import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import type { ServiceCategory } from '../../../lib/service-constants';

interface ServiceCategorySidebarProps {
  categories: ServiceCategory[];
  activeTab: string;
  onTabChange: (categoryName: string) => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: ServiceCategory) => void;
  onDeleteCategory?: (categoryId: number) => void;
}

export function ServiceCategorySidebar({
  categories,
  activeTab,
  onTabChange,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: ServiceCategorySidebarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-0">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-bold text-gray-900">Categories</h2>
        {onAddCategory && (
          <Button
            onClick={onAddCategory}
            size="sm"
            variant="outline"
            className="h-8 px-3 border-[#FF9F1C] text-[#FF9F1C] hover:bg-[#FF9F1C] hover:text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add New
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {categories.map((cat, index) => {
          const isActive = activeTab === cat.name;
          const isDisabled = (cat as any).status === 'disabled';
          
          return (
            <div
              key={`${cat.id}-${cat.name}-${index}`}
              className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#FF9F1C] text-white shadow-md shadow-orange-200'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-[#FF9F1C] bg-transparent'
              } ${isDisabled ? 'opacity-50' : ''}`}
            >
              <div 
                className="flex items-center gap-3 overflow-hidden flex-1"
                onClick={() => onTabChange(cat.name)}
              >
                <span className="truncate">{cat.name}</span>
                {isDisabled && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                    Disabled
                  </span>
                )}
              </div>
              
              {/* Action Buttons - Only show when editing is enabled */}
              {(onEditCategory || onDeleteCategory) && (
                <div className={`flex items-center gap-1 ml-2 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  {onEditCategory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory(cat);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'hover:bg-white/20' 
                          : 'hover:bg-orange-100'
                      }`}
                      title="Edit category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteCategory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`🗑️ [UI] Delete button clicked for category:`, { id: cat.id, name: cat.name });
                        
                        // Guard: Check if category exists before attempting delete
                        if (!cat.id || cat.id <= 0) {
                          console.error(`❌ [UI] Invalid category ID: ${cat.id}`);
                          alert('Cannot delete: Invalid category ID');
                          return;
                        }
                        
                        if (confirm(`Are you sure you want to delete "${cat.name}" (ID: ${cat.id})?\n\nThis will also delete all services in this category.`)) {
                          console.log(`✅ [UI] User confirmed delete for category ID: ${cat.id}`);
                          onDeleteCategory(cat.id);
                        } else {
                          console.log(`❌ [UI] User cancelled delete`);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'hover:bg-white/20' 
                          : 'hover:bg-red-100 hover:text-red-600'
                      }`}
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}