/**
 * Services Table Component (Organism)
 * Complete table with skeleton loading, empty state, and data rows
 */

import { Search } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ServiceTableRow } from '../molecules/ServiceTableRow';
import type { Service } from '../../../lib/admin-types';
import React from 'react';

interface ServicesTableProps {
  services: Service[];
  allAddons?: Service[]; // Optional prop to support cross-category add-ons
  loading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onAddNew: () => void;
  isCategoryDisabled?: boolean;
  onToggleStatus?: (service: Service) => void;
}

export function ServicesTable({
  services,
  allAddons = [],
  loading,
  onEdit,
  onDelete,
  onAddNew,
  isCategoryDisabled = false,
  onToggleStatus,
}: ServicesTableProps) {
  // Group services: parent services with their add-ons
  // NEW LOGIC: Regular services have compatibleServiceIds containing their add-on IDs
  const groupedServices = React.useMemo(() => {
    const result: Array<{ parent: Service; addons: Service[] }> = [];
    const processedAddonIds = new Set<string>();
    
    // Get regular services from the filtered list (current category)
    const regularServices = services.filter(s => s.serviceType !== 'addon');
    
    // Get add-ons that are in the current category (for standalone display)
    const categoryAddons = services.filter(s => s.serviceType === 'addon');
    
    // Combine local add-ons with global add-ons for lookup
    // Prefer global lookup to ensure we find add-ons from other categories
    const lookupAddons = allAddons.length > 0 ? allAddons : categoryAddons;
    
    // For each regular service, find its add-ons using compatibleServiceIds
    regularServices.forEach(parent => {
      const childAddons = lookupAddons.filter(addon => 
        parent.compatibleServiceIds && parent.compatibleServiceIds.includes(addon.id)
      );
      
      // Mark these add-ons as processed (if they exist in the current category)
      childAddons.forEach(addon => processedAddonIds.add(addon.id));
      
      result.push({ parent, addons: childAddons });
    });
    
    // Also include standalone add-ons that are IN THE CURRENT CATEGORY
    // (add-ons not linked to any regular service, or linked but we want to show them if they are in this category)
    // Actually, if an add-on is in this category, we usually want to show it.
    // But if it's already shown as a child of a service IN THIS CATEGORY, maybe hide it?
    // The previous logic was: hide if processed.
    const standaloneAddons = categoryAddons.filter(addon => !processedAddonIds.has(addon.id));
    standaloneAddons.forEach(addon => {
      result.push({ parent: addon, addons: [] });
    });
    
    return result;
  }, [services, allAddons]);

  return (
    <Card className="bg-white border-gray-100 shadow-sm overflow-hidden h-fit">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Service Name</th>
              <th className="px-6 py-4">Group</th>
              <th className="px-6 py-4">Reg. Price</th>
              <th className="px-6 py-4 text-[#FF9F1C]">Member Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-8 w-8 bg-gray-200 rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : services.length > 0 ? (
              // Data Rows with hierarchical grouping
              groupedServices.flatMap((group) => [
                // Parent Service
                <ServiceTableRow
                  key={group.parent.id}
                  service={group.parent}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isCategoryDisabled={isCategoryDisabled}
                  isAddonChild={false}
                  onToggleStatus={onToggleStatus}
                />,
                
                // Child Add-ons
                ...group.addons.map((addon) => (
                  <ServiceTableRow
                    key={`${group.parent.id}-${addon.id}`}
                    service={addon}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isCategoryDisabled={isCategoryDisabled}
                    isAddonChild={true}
                    parentServiceName={group.parent.name}
                    onToggleStatus={onToggleStatus}
                  />
                ))
              ])
            ) : (
              // Empty State
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <p>No services found in this category.</p>
                    <Button
                      variant="link"
                      onClick={onAddNew}
                      className="text-[#FF9F1C]"
                    >
                      Add a new service
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}