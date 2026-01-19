import { CreditCard } from 'lucide-react';
import AdminLayout from '../AdminLayout';
import { MembershipTiersEditor } from './organisms/MembershipTiersEditor';

export default function AdminMembershipPage() {
  return (
    <AdminLayout>
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Membership Configuration
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage membership tiers, pricing, and benefits.</p>
        </div>
        
        <MembershipTiersEditor />
    </div>
    </AdminLayout>
  );
}