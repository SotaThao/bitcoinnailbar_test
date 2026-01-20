import { ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export function OwnerOnlyAccess() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-3">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          This page is restricted to owner accounts only. Please contact the system administrator if you need access.
        </p>
        <Button
          onClick={() => navigate('/admin/dashboard')}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
