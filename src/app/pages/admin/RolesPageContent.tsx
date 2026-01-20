import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { SearchInput } from '@/app/components/ui/search-input';
import { Plus, Pencil, Trash2, Shield, X, CheckSquare, Square, Search } from 'lucide-react';
import { getAuthToken, getCurrentUser } from '/utils/auth';
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

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface CreateRoleForm {
  name: string;
  description: string;
  permissions: string[];
}

export default function RolesPageContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<CreateRoleForm>({
    name: '',
    description: '',
    permissions: [],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolesSearchQuery, setRolesSearchQuery] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
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
        setRoles(data.data);
      } else {
        setError(data.error || 'Failed to fetch roles');
      }
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/roles/permissions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token || '',
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setPermissions(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/roles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token || '',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setRoles([data.data, ...roles]);
        setShowCreateModal(false);
        setFormData({ name: '', description: '', permissions: [] });
      } else {
        setError(data.error || 'Failed to create role');
      }
    } catch (err: any) {
      console.error('Failed to create role:', err);
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setFormLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/roles/${selectedRole.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token || '',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setRoles(roles.map(r => r.id === selectedRole.id ? data.data : r));
        setShowEditModal(false);
        setSelectedRole(null);
        setFormData({ name: '', description: '', permissions: [] });
      } else {
        setError(data.error || 'Failed to update role');
      }
    } catch (err: any) {
      console.error('Failed to update role:', err);
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    setFormLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/roles/${selectedRole.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token || '',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setRoles(roles.filter(r => r.id !== selectedRole.id));
        setShowDeleteModal(false);
        setSelectedRole(null);
      } else {
        setError(data.error || 'Failed to delete role');
      }
    } catch (err: any) {
      console.error('Failed to delete role:', err);
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setError(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setError(null);
    setShowDeleteModal(true);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filter roles based on search query
  const filteredRoles = rolesSearchQuery
    ? roles.filter(role => 
        role.name.toLowerCase().includes(rolesSearchQuery.toLowerCase()) ||
        role.description?.toLowerCase().includes(rolesSearchQuery.toLowerCase())
      )
    : roles;

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <SearchInput
            placeholder="Search roles by name or description..."
            value={rolesSearchQuery}
            onChange={(e) => setRolesSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setFormData({ name: '', description: '', permissions: [] });
            setError(null);
            setShowCreateModal(true);
          }}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white gap-2 flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          Create Role
        </Button>
      </div>

      {/* Error Message */}
      {error && !showCreateModal && !showEditModal && !showDeleteModal && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Roles Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading roles...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          {rolesSearchQuery ? (
            <>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No roles found</p>
              <p className="text-gray-500 mb-4">No roles match "{rolesSearchQuery}"</p>
              <Button
                onClick={() => setRolesSearchQuery('')}
                variant="ghost"
                className="text-[#F97316] hover:text-[#EA580C]"
              >
                Clear search
              </Button>
            </>
          ) : (
            <>
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No roles yet</p>
              <p className="text-gray-500 mb-4">Create your first custom role to get started</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Role
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Permissions</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Created</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 capitalize">
                          {role.name}
                        </span>
                        {role.is_built_in && (
                          <span className="text-xs text-gray-500">(Built-in)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      {role.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(role.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!role.is_built_in && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(role)}
                              className="text-gray-600 hover:text-[#F97316] hover:bg-orange-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(role)}
                              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {role.is_built_in && (
                          <span className="text-xs text-gray-400 italic">System role</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Role</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Role Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    placeholder="e.g., Manager, Technician"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Brief description of this role..."
                  />
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions ({formData.permissions.length} selected)
                  </label>
                  {permissions.length === 0 ? (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                      <p className="text-sm">Loading permissions...</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-80 overflow-y-auto">
                      {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <div key={category} className="p-4">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {perms.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                              >
                                <button
                                  type="button"
                                  onClick={() => togglePermission(permission.id)}
                                  className="flex-shrink-0"
                                >
                                  {formData.permissions.includes(permission.id) ? (
                                    <CheckSquare className="h-5 w-5 text-[#F97316]" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400" />
                                  )}
                                </button>
                                <span className="text-sm text-gray-700">{permission.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError(null);
                  }}
                  className="flex-1"
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white"
                  disabled={formLoading}
                >
                  {formLoading ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal - Similar structure as Create */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Role</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRole(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Same fields as Create modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    placeholder="e.g., Manager, Technician"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Brief description of this role..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions ({formData.permissions.length} selected)
                  </label>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-80 overflow-y-auto">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category} className="p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          {category}
                        </h4>
                        <div className="space-y-2">
                          {perms.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              <button
                                type="button"
                                onClick={() => togglePermission(permission.id)}
                                className="flex-shrink-0"
                              >
                                {formData.permissions.includes(permission.id) ? (
                                  <CheckSquare className="h-5 w-5 text-[#F97316]" />
                                ) : (
                                  <Square className="h-5 w-5 text-gray-400" />
                                )}
                              </button>
                              <span className="text-sm text-gray-700">{permission.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                    setError(null);
                  }}
                  className="flex-1"
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Role</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the role <strong>"{selectedRole.name}"</strong>? 
                This will remove all associated permissions.
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRole(null);
                    setError(null);
                  }}
                  className="flex-1"
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteRole}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={formLoading}
                >
                  {formLoading ? 'Deleting...' : 'Delete Role'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}