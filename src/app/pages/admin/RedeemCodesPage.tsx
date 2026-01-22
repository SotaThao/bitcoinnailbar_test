import { useState } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import { Gift, Users } from 'lucide-react';
import RedeemCodesTab from '@/app/components/admin/RedeemCodesTab';
import CustomerManagementTab from '@/app/components/admin/CustomerManagementTab';
import { PillTabs, PillTabsList, PillTabsTrigger } from '@/app/components/ui/pill-tabs';

export default function RedeemCodesPage() {
  const [activeTab, setActiveTab] = useState<'redeem-codes' | 'customers'>('customers');

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <PillTabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'redeem-codes' | 'customers')}
          className="w-full"
        >
          <PillTabsList>
            <PillTabsTrigger value="customers" className="gap-2">
              <Users className="w-5 h-5" />
              Customer Management
            </PillTabsTrigger>
            <PillTabsTrigger value="redeem-codes" className="gap-2">
              <Gift className="w-5 h-5" />
              Redeem Codes
            </PillTabsTrigger>
          </PillTabsList>
        </PillTabs>

        {/* Tab Content */}
        {activeTab === 'redeem-codes' && <RedeemCodesTab />}
        {activeTab === 'customers' && <CustomerManagementTab />}
      </div>
    </AdminLayout>
  );
}