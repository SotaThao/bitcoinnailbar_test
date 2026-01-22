import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAuthToken } from '/utils/auth';
import { Search, UserPlus, Edit, Trash2, RefreshCw, Phone, Mail, Calendar, Award, Globe } from 'lucide-react';
import { SelectField } from "../ui/select-field";

interface Customer {
  id: string;
  phone: string;
  phone_display: string;  // ← Added formatted display
  full_name: string;
  region: 'US' | 'VN';   // ← Added region
  email?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  total_visits: number;
  total_spent: number;
  membership?: {         // ← Changed from membership_id to full object
    id: string;
    tier: string;
    status: 'active' | 'expired';
  };
  created_at: string;
  updated_at?: string;
  last_visit?: string;
}

export default function CustomerManagementTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const customersPerPage = 20;

  const fetchCustomers = async (page: number = 1, silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error('❌ No admin token found - Please login first');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/customers?page=${page}&limit=${customersPerPage}&region=US`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        
        // If 401, session expired - redirect to login
        if (response.status === 401) {
          console.error('🔒 Session expired. Please login again.');
          window.location.href = '/admin/login';
          return;
        }
        
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      console.log('📊 Fetch result:', result);
      
      if (result.success) {
        setCustomers(result.data.customers || []);
        setTotalPages(result.data.pagination.totalPages || 1);
        setCurrentPage(page);
      } else {
        console.error('❌ Failed to fetch customers:', result.error);
      }
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);

    // Auto-refresh every 30 seconds (silent mode)
    const interval = setInterval(() => {
      fetchCustomers(currentPage, true); // ← Silent polling
    }, 30000);

    return () => clearInterval(interval);
  }, []); // Remove region dependency

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCustomers(1, false); // Manual action, show loading
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error('❌ No admin token found - Please login first');
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/customers/search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Session-Token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            region: 'US', // Hardcoded to US
            limit: customersPerPage,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Search API Error:', response.status, errorText);
        
        // If 401, session expired - redirect to login
        if (response.status === 401) {
          console.error('🔒 Session expired. Please login again.');
          window.location.href = '/admin/login';
          return;
        }
        
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data || []);
        setTotalPages(1);
      } else {
        console.error('❌ Search failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error searching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPhone = (phone: string) => {
    // Format: (555) 123-4567
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search & Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9800] focus:border-transparent h-9"
            />
          </div>
          
          {/* Add Customer Button */}
          <button
            className="flex items-center gap-2 px-6 py-2 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-colors h-9 whitespace-nowrap"
            onClick={() => alert('Add Customer feature coming soon!')}
          >
            <UserPlus className="w-4 h-4" />
            Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-sm text-gray-600">Total Customers</div>
            <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">With Membership</div>
            <div className="text-2xl font-bold text-[#FF9800]">
              {customers.filter(c => c.membership).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Visits</div>
            <div className="text-2xl font-bold text-gray-900">
              {customers.reduce((sum, c) => sum + c.total_visits, 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No customers found</p>
          <button
            onClick={() => alert('Add Customer feature coming soon!')}
            className="mt-4 px-4 py-2 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-colors"
          >
            Add First Customer
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-[#FF9800] flex items-center justify-center text-white font-semibold">
                            {customer.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {customer.id.split('_')[1]?.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {customer.phone_display} {/* ← Use pre-formatted phone from backend */}
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {customer.total_visits}
                        </div>
                        <div className="text-xs text-gray-500">visits</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          ${customer.total_spent.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.last_visit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.membership ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF9800] bg-opacity-10 text-[#FF9800]">
                            <Award className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => alert('View/Edit customer feature coming soon!')}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            title="Edit customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchCustomers(currentPage - 1, false)}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchCustomers(currentPage + 1, false)}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}