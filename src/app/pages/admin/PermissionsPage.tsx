import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Shield, Save, AlertCircle } from 'lucide-react';
import { getAuthToken, getCurrentUser } from '/utils/auth';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { OwnerOnlyAccess } from '@/app/components/OwnerOnlyAccess';
import AdminLayout from '@/app/components/AdminLayout';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_built_in?: boolean;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
}

// Map system permissions to checkbox states
interface PermissionCheckboxes {
  manage_services: boolean;
  manage_staff: boolean;
  view_reports: boolean;
  manage_appointments: boolean;
  process_payments: boolean;
  view_analytics: boolean;
  manage_settings: boolean;
  manage_bookings: boolean;
  view_customers: boolean;
  manage_customers: boolean;
  view_memberships: boolean;
  manage_memberships: boolean;
}

const PERMISSION_LABELS: Record<keyof PermissionCheckboxes, string> = {
  manage_services: 'Manage Services',
  manage_staff: 'Manage Staff',
  view_reports: 'View Reports',
  manage_appointments: 'Manage Appointments',
  process_payments: 'Process Payments',
  view_analytics: 'View Analytics',
  manage_settings: 'System Settings',
  manage_bookings: 'Manage Bookings',
  view_customers: 'View Customers',
  manage_customers: 'Manage Customers',
  view_memberships: 'View Memberships',
  manage_memberships: 'Manage Memberships',
};

export default function PermissionsPage() {
  // Check if current user is owner first
  const currentUser = getCurrentUser();
  const isOwner = currentUser?.role === 'owner';

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, PermissionCheckboxes>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner) {
      fetchRoles();
    }
  }, [isOwner]);

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
            manage_services: role.permissions.includes('manage_services'),
            manage_staff: role.permissions.includes('manage_staff'),
            view_reports: role.permissions.includes('view_reports'),
            manage_appointments: role.permissions.includes('manage_appointments'),
            process_payments: role.permissions.includes('process_payments'),
            view_analytics: role.permissions.includes('view_analytics'),
            manage_settings: role.permissions.includes('manage_settings'),
            manage_bookings: role.permissions.includes('manage_bookings'),
            view_customers: role.permissions.includes('view_customers'),
            manage_customers: role.permissions.includes('manage_customers'),
            view_memberships: role.permissions.includes('view_memberships'),
            manage_memberships: role.permissions.includes('manage_memberships'),
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
        setSuccess(`Permissions updated successfully for "${roleName}" role`);
        setTimeout(() => setSuccess(null), 3000);
        
        // Refresh roles to get updated data
        await fetchRoles();
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

  // If not owner, show access denied
  if (!isOwner) {
    return (
      <AdminLayout>
        <OwnerOnlyAccess />
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Permissions Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure access permissions for each role</p>
        </div>

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
          <div className="overflow-x-auto relative">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-max w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Role
                    </th>
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <th key={key} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="whitespace-nowrap">{label}</span>
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sticky right-0 bg-gray-50 z-10 min-w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-medium text-gray-900 capitalize whitespace-nowrap">{role.name}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getRoleBadgeColor(role)}`}>
                            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      {Object.keys(PERMISSION_LABELS).map((permKey) => {
                        const permission = permKey as keyof PermissionCheckboxes;
                        const isChecked = rolePermissions[role.id]?.[permission] || false;
                        const isDisabled = permission === 'manage_settings'; // Always disabled for non-owner

                        return (
                          <td key={permKey} className="px-4 py-4 text-center">
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
                      <td className="px-6 py-4 sticky right-0 bg-white z-10">
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
            
            {/* Scroll Indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none"></div>
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
    </AdminLayout>
  );
}