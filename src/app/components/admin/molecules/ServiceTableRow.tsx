/**
 * Service Table Row Component (Molecule)
 * Displays a single service row with actions dropdown
 */

import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import type { Service } from '../../../lib/admin-types';

interface ServiceTableRowProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  isCategoryDisabled?: boolean;
  isAddonChild?: boolean; // New prop to indicate this is a child add-on
  parentServiceName?: string; // Name of parent service (optional for context)
  onToggleStatus?: (service: Service) => void;
}

export function ServiceTableRow({ service, onEdit, onDelete, isCategoryDisabled = false, isAddonChild = false, onToggleStatus }: ServiceTableRowProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      onDelete(service.id);
    }
  };
  
  const handleToggleClick = () => {
    console.log('🔘 [ServiceTableRow] Toggle clicked for:', service.name);
    console.log('   - Current status:', service.status);
    console.log('   - Service object:', service);
    console.log('   - onToggleStatus function exists:', !!onToggleStatus);
    console.log('   - isCategoryDisabled:', isCategoryDisabled);
    
    if (onToggleStatus) {
      onToggleStatus(service);
    } else {
      console.error('❌ [ServiceTableRow] onToggleStatus is undefined!');
    }
  };
  
  const isDisabled = isCategoryDisabled;
  
  // Ensure status has a default value
  const currentStatus = service.status || 'active';
  const isActive = currentStatus === 'active';

  return (
    <tr className={`transition-colors group ${isDisabled ? 'opacity-50 bg-gray-50' : isAddonChild ? 'bg-orange-50/30 hover:bg-orange-50/50' : 'hover:bg-gray-50'}`}>
      <td className={`px-6 py-4 font-medium transition-colors ${isDisabled ? 'text-gray-500' : 'text-gray-900 group-hover:text-[#FF9F1C]'} ${isAddonChild ? 'pl-12' : ''}`}>
        {isAddonChild && (
          <span className="inline-block mr-2 text-gray-400">└─</span>
        )}
        {service.name}
        {isDisabled && (
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600">
            Category Disabled
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-xs uppercase tracking-wide">
        {service.serviceType === 'addon' ? (
          <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-sm">ADD ON</span>
        ) : (
          <span className="text-gray-500">{service.groupName}</span>
        )}
      </td>
      <td className="px-6 py-4 font-bold text-gray-900">${service.priceDisplay || service.price}</td>
      <td className="px-6 py-4 font-bold text-[#FF9F1C]">
        {service.memberPriceDisplay ? `$${service.memberPriceDisplay}` : (service.memberPrice || service.member) ? `$${service.memberPrice || service.member}` : '-'}
      </td>
      <td className="px-6 py-4">
        {onToggleStatus && !isCategoryDisabled ? (
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleClick}
              disabled={isCategoryDisabled}
              className="data-[state=checked]:bg-green-500"
            />
            <span className={`text-sm font-medium transition-colors ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
              {isActive ? 'Active' : 'Disabled'}
            </span>
          </div>
        ) : (
          // Read-only badge if no toggle function or category disabled
          <div className="flex items-center gap-3 opacity-50">
            <Switch
              checked={isActive}
              disabled={true}
              className="data-[state=checked]:bg-green-500"
            />
            <span className={`text-sm font-medium ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
              {isActive ? 'Active' : 'Disabled'}
            </span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        {isDisabled ? (
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 text-gray-300 cursor-not-allowed" 
            disabled
            title="Actions disabled - Category is disabled"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-100 shadow-lg">
              <DropdownMenuLabel className="text-gray-900">Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Edit2 className="w-4 h-4 mr-2 text-gray-500" /> Edit Service
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                className="focus:bg-red-50 focus:text-red-600 text-red-600 cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2 text-red-600" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  );
}