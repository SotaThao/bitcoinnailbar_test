import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Shield, Save, AlertCircle } from 'lucide-react';
import { getAuthToken } from '/utils/auth';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_built_in?: boolean;
  created_at: string;
  updated_at: string;
}

// Map system permissions to checkbox states (Must match server/roles.tsx AVAILABLE_PERMISSIONS)
interface PermissionCheckboxes {
  view_dashboard: boolean;
  view_bookings: boolean;
  manage_bookings: boolean;
  cancel_bookings: boolean;
  view_customers: boolean;
  manage_customers: boolean;
  view_services: boolean;
  manage_services: boolean;
  view_staff: boolean;
  manage_staff: boolean;
  view_reports: boolean;
  manage_reports: boolean;
  view_memberships: boolean;
  manage_memberships: boolean;
  view_settings: boolean;
  manage_settings: boolean;
}

const PERMISSION_LABELS: Record<keyof PermissionCheckboxes, string> = {
  view_dashboard: 'View Dashboard',
  view_bookings: 'View Bookings',
  manage_bookings: 'Manage Bookings',
  cancel_bookings: 'Cancel Bookings',
  view_customers: 'View Customers',
  manage_customers: 'Manage Customers',
  view_services: 'View Services',
  manage_services: 'Manage Services',
  view_staff: 'View Staff',
  manage_staff: 'Manage Staff',
  view_reports: 'View Reports',
  manage_reports: 'Manage Reports',
  view_memberships: 'View Memberships',
  manage_memberships: 'Manage Memberships',
  view_settings: 'View Settings',
  manage_settings: 'Manage Settings',
};

export default function PermissionsPageContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, PermissionCheckboxes>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/roles`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token || '',
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const allRoles = data.data;
        setRoles(allRoles);
        
        // Convert role permissions array to checkbox state
        const permsMap: Record<string, PermissionCheckboxes> = {};
        allRoles.forEach((role: Role) => {
          permsMap[role.id] = {
            view_dashboard: role.permissions.includes('view_dashboard'),
            view_bookings: role.permissions.includes('view_bookings'),
            manage_bookings: role.permissions.includes('manage_bookings'),
            cancel_bookings: role.permissions.includes('cancel_bookings'),
            view_customers: role.permissions.includes('view_customers'),
            manage_customers: role.permissions.includes('manage_customers'),
            view_services: role.permissions.includes('view_services'),
            manage_services: role.permissions.includes('manage_services'),
            view_staff: role.permissions.includes('view_staff'),
            manage_staff: role.permissions.includes('manage_staff'),
            view_reports: role.permissions.includes('view_reports'),
            manage_reports: role.permissions.includes('manage_reports'),
            view_memberships: role.permissions.includes('view_memberships'),
            manage_memberships: role.permissions.includes('manage_memberships'),
            view_settings: role.permissions.includes('view_settings'),
            manage_settings: role.permissions.includes('manage_settings'),
          };
        });
        setRolePermissions(permsMap);
      } else {
        setError(data.error || 'Failed to fetch roles');
      }
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError('Failed to fetch roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (roleId: string, permission: keyof PermissionCheckboxes) => {
    setRolePermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permission]: !prev[roleId][permission],
      },
    }));
  };

  const handleSavePermissions = async (roleId: string) => {
    setSaving(roleId);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      
      // Convert checkboxes back to permissions array
      const permissionsArray = Object.entries(rolePermissions[roleId])
        .filter(([_, isEnabled]) => isEnabled)
        .map(([permKey, _]) => permKey);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/roles/${roleId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token || '',
          },
          body: JSON.stringify({
            permissions: permissionsArray,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const roleName = roles.find(r => r.id === roleId)?.name;
        
        // Update local roles state to reflect saved changes without re-fetching
        setRoles(prevRoles => prevRoles.map(role => {
          if (role.id === roleId) {
            return {
              ...role,
              permissions: permissionsArray
            };
          }
          return role;
        }));

        setSuccess(`Permissions updated successfully for "${roleName}" role`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update permissions');
      }
    } catch (err: any) {
      console.error('Error updating permissions:', err);
      setError('Failed to update permissions');
    } finally {
      setSaving(null);
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    if (role.is_built_in) {
      if (role.name === 'admin') {
        return 'bg-blue-100 text-blue-700';
      }
      return 'bg-gray-100 text-gray-700';
    }
    return 'bg-purple-100 text-purple-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> Permissions are managed per role. All users assigned to a role will inherit these permissions. 
          Owner role has all permissions by default and cannot be modified.
        </p>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="w-full max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-20rem)] overflow-x-auto relative scrollbar-visible pb-4">
          <style>{`
            .scrollbar-visible {
              overflow-x: scroll !important;
              overflow-y: visible !important;
              scrollbar-width: auto;
              scrollbar-color: #94a3b8 #f1f5f9;
            }
            .scrollbar-visible::-webkit-scrollbar {
              height: 16px;
              -webkit-appearance: none;
            }
            .scrollbar-visible::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 8px;
              margin: 0 4px;
            }
            .scrollbar-visible::-webkit-scrollbar-thumb {
              background: #94a3b8;
              border-radius: 8px;
              border: 4px solid #f1f5f9;
              min-width: 40px;
            }
            .scrollbar-visible::-webkit-scrollbar-thumb:hover {
              background: #64748b;
            }
            .scrollbar-visible::-webkit-scrollbar-thumb:active {
              background: #475569;
            }
            /* Force scrollbar to always show */
            .scrollbar-visible::-webkit-scrollbar-button {
              display: none;
            }
            .scrollbar-visible::-webkit-scrollbar-corner {
              background: transparent;
            }
          `}</style>
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-max border-separate border-spacing-0">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* Fixed Role Column - Zone 1 */}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-300 border-b border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px]">
                    Role
                  </th>
                  
                  {/* Scrollable Permissions - Zone 2 */}
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <th key={key} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px] border-b border-gray-200">
                      <div className="flex flex-col items-center gap-1">
                        <span className="whitespace-nowrap">{label}</span>
                      </div>
                    </th>
                  ))}
                  
                  {/* Fixed Actions Column - Sticky Right */}
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sticky right-0 bg-gray-50 z-20 border-l border-gray-300 border-b border-gray-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    {/* Fixed Role Column - Zone 1 */}
                    <td className="px-6 py-4 sticky left-0 bg-white z-20 border-r border-gray-300 border-b border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-medium text-gray-900 capitalize whitespace-nowrap">{role.name}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getRoleBadgeColor(role)}`}>
                          {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    
                    {/* Scrollable Permissions - Zone 2 */}
                    {Object.keys(PERMISSION_LABELS).map((permKey) => {
                      const permission = permKey as keyof PermissionCheckboxes;
                      const isChecked = rolePermissions[role.id]?.[permission] || false;
                      // const isDisabled = permission === 'manage_settings'; // Removed disabled logic to match server flexibility
                      const isDisabled = false;

                      return (
                        <td key={permKey} className="px-4 py-4 text-center border-b border-gray-200">
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={() => handlePermissionToggle(role.id, permission)}
                              className="w-5 h-5 text-[#F97316] border-gray-300 rounded focus:ring-[#F97316] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </label>
                        </td>
                      );
                    })}
                    
                    {/* Fixed Actions Column - Sticky Right */}
                    <td className="px-6 py-4 sticky right-0 bg-white z-20 border-l border-gray-300 border-b border-gray-200 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-end">
                        <Button
                          onClick={() => handleSavePermissions(role.id)}
                          disabled={saving === role.id}
                          className="bg-[#F97316] hover:bg-[#EA580C] text-white text-sm gap-2"
                          size="sm"
                        >
                          <Save className="h-4 w-4" />
                          {saving === role.id ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Scroll Indicator (Visual hint) */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        </div>
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No roles found</p>
          <p className="text-sm text-gray-500 mt-1">Create roles in Role Management to assign permissions</p>
        </div>
      )}
    </div>
  );
}