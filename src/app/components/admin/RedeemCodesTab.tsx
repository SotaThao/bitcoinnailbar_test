import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Trash2, RefreshCw, LayoutGrid, Clock, CheckCircle, XCircle, Search, Eraser } from 'lucide-react';
import { SearchInput } from "../ui/search-input";
import { SelectField } from "../ui/select-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { StatCard } from "./atoms/StatCard";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { StatusBadge } from "../ui/status-badge";

interface RedeemCode {
  code: string;
  membershipTier: string;
  duration: string;
  amount: number;
  merchantOrderCode: string;
  status: 'pending' | 'used' | 'expired' | 'pending_payment'; // ← Removed 'completed'
  customerEmail?: string;
  createdAt: string;
  expiresAt: string;
  redeemedAt?: string;
  redeemedBy?: string;
}

export default function RedeemCodesTab() {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'used' | 'expired'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const fetchCodes = async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      console.log('🔍 [ADMIN] Fetching redeem codes...');
      console.log('🔍 [ADMIN] Using token:', token ? 'EXISTS' : 'MISSING');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/redeem-codes`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token || '',
          },
        }
      );

      console.log('📥 [ADMIN] Response status:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ [ADMIN] Response not OK:', text);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const result = await response.json();
      console.log('📦 [ADMIN] Result:', result);
      
      if (result.success) {
        setCodes(result.data || []);
        if (result.warning) {
          console.warn('⚠️ [ADMIN]', result.warning);
        }
      } else {
        console.error('❌ [ADMIN] Failed to fetch redeem codes:', result.error);
        console.error('❌ [ADMIN] Error details:', result.details);
        const errorMsg = result.details || result.error || 'Unknown error';
        if (!silent) alert(`Failed to fetch redeem codes:\n\n${errorMsg}`);
      }
    } catch (error: any) {
      console.error('❌ [ADMIN] Error fetching redeem codes:', error);
      console.error('❌ [ADMIN] Error stack:', error.stack);
      if (!silent) alert(`Error fetching redeem codes:\n\n${error.message || 'Unknown error'}`);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();

    // Auto-refresh every 30 seconds (silent mode)
    const interval = setInterval(() => {
      fetchCodes(true); // ← Silent polling
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (code: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/redeem-codes/${code}`,
        {
          method: 'DELETE',
          headers: {
            'X-Session-Token': token || '',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setCodes(codes.filter(c => c.code !== code));
        setDeleteConfirm(null);
      } else {
        alert(`Failed to delete code: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting code:', error);
      alert('Failed to delete redeem code');
    }
  };

  const handleCleanupExpired = async () => {
    if (!confirm('🧹 Clean up expired pending orders?\n\nThis will delete all pending payment orders older than 1 hour.\nThis action cannot be undone.')) {
      return;
    }

    setCleanupLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/payment/cleanup-expired`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token || '',
          },
        }
      );

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Cleanup successful!\n\nDeleted ${result.deleted} expired pending orders.`);
        // Refresh codes list
        fetchCodes();
      } else {
        alert(`❌ Cleanup failed:\n\n${result.error}`);
      }
    } catch (error: any) {
      console.error('Error cleaning up expired orders:', error);
      alert(`❌ Error during cleanup:\n\n${error.message}`);
    } finally {
      setCleanupLoading(false);
    }
  };

  const filteredCodes = codes.filter(code => {
    const matchesSearch = 
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.merchantOrderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter; // ← Simplified: no need for 'completed' mapping
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      bronze: 'bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200',
      silver: 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200',
      gold: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
    };
    return colors[tier.toLowerCase() as keyof typeof colors] || 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
  };

  return (
    <div className="space-y-6">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Total Codes" 
            value={codes.length} 
            subtext="All time" 
            icon={LayoutGrid} 
        />
        <StatCard 
            title="Pending" 
            value={codes.filter(c => c.status === 'pending').length} 
            subtext="Active codes" 
            icon={Clock}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            valueColor="text-amber-600"
        />
         <StatCard 
            title="Used" 
            value={codes.filter(c => c.status === 'used').length} 
            subtext="Redeemed codes" 
            icon={CheckCircle}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            valueColor="text-emerald-600"
        />
         <StatCard 
            title="Expired" 
            value={codes.filter(c => c.status === 'expired').length} 
            subtext="Past validity" 
            icon={XCircle}
            iconBg="bg-rose-100"
            iconColor="text-rose-600"
            valueColor="text-rose-600"
        />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
             <div className="w-full sm:w-72">
                <SearchInput 
                    placeholder="Search by code, order, or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full flex-1"
                />
             </div>
             <div className="w-full sm:w-48">
                <SelectField
                    value={statusFilter}
                    onValueChange={(val: any) => setStatusFilter(val)}
                    placeholder="All Status"
                    options={[
                        { value: "all", label: "All Status" },
                        { value: "pending", label: "Pending" },
                        { value: "pending_payment", label: "Pending Payment" },
                        { value: "used", label: "Used" },
                        { value: "expired", label: "Expired" },
                    ]}
                    containerClassName="space-y-0"
                />
             </div>
        </div>
        <div className="flex items-center">
          <Button
            size="sm"
            variant="destructive"
            className="h-8 text-xs"
            onClick={handleCleanupExpired}
            disabled={cleanupLoading}
          >
            {cleanupLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Cleanup Expired'
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200 min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No redeem codes found</h3>
          <p className="text-gray-500 max-w-sm">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                        <TableHead className="w-[200px]">Code</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCodes.map((code, index) => (
                        <TableRow key={`${code.code}-${index}`}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{code.code}</span>
                                    <span className="text-xs text-gray-500 font-mono mt-0.5">{code.merchantOrderCode}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={getTierBadge(code.membershipTier)}>
                                    {code.membershipTier}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">
                                ${code.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={code.status} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm">
                                    {code.redeemedBy ? (
                                        <span className="text-gray-900 font-medium">{code.redeemedBy}</span>
                                    ) : code.customerEmail ? (
                                        <span className="text-gray-600">{code.customerEmail}</span>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-500 text-xs">
                                {formatDate(code.createdAt)}
                            </TableCell>
                            <TableCell className="text-gray-500 text-xs">
                                {formatDate(code.expiresAt)}
                            </TableCell>
                            <TableCell className="text-right">
                                {/* Delete Actions */}
                                 {deleteConfirm === code.code ? (
                                    <div className="flex items-center justify-end gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="destructive"
                                            className="h-8 text-xs"
                                            onClick={() => handleDelete(code.code)}
                                        >
                                            Confirm
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            className="h-8 text-xs"
                                            onClick={() => setDeleteConfirm(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                 ) : (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => setDeleteConfirm(code.code)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                 )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      )}
    </div>
  );
}