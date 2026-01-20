import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { getCurrentUser } from '/utils/auth';
import { OwnerOnlyAccess } from '@/app/components/OwnerOnlyAccess';
import AdminLayout from '@/app/components/AdminLayout';
import RolesPageContent from './RolesPageContent';
import PermissionsPageContent from './PermissionsPageContent';

type TabType = 'roles' | 'permissions';

export default function RolePermissionsPage() {
  const currentUser = getCurrentUser();
  const isOwner = currentUser?.role === 'owner';
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get tab from URL or default to 'roles'
  const searchParams = new URLSearchParams(location.search);
  const tabFromURL = (searchParams.get('tab') as TabType) || 'roles';
  const [activeTab, setActiveTab] = useState<TabType>(tabFromURL);

  // Update URL when tab changes
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const currentTab = currentParams.get('tab');
    
    if (currentTab !== activeTab) {
      navigate(`/admin/role-permissions?tab=${activeTab}`, { replace: true });
    }
  }, [activeTab, navigate, location.search]);

  // Sync state with URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromURL = (searchParams.get('tab') as TabType) || 'roles';
    if (tabFromURL !== activeTab) {
      setActiveTab(tabFromURL);
    }
  }, [location.search]);

  // If not owner, show access denied
  if (!isOwner) {
    return (
      <AdminLayout>
        <OwnerOnlyAccess />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Role & Permissions Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage roles and their associated permissions</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex gap-1">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === 'roles'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Shield className="h-4 w-4" />
            Roles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === 'permissions'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Shield className="h-4 w-4" />
            Permissions
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-200">
          {activeTab === 'roles' ? <RolesPageContent /> : <PermissionsPageContent />}
        </div>
      </div>
    </AdminLayout>
  );
}
