import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Calendar, DollarSign, Users, Clock, ArrowUpRight, CheckCircle2, MoreHorizontal, Mail, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import AdminLayout from '../AdminLayout';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useDashboard } from '../../hooks/useDashboard';
import { StatCard } from './atoms/StatCard';
import { LoadingSpinner } from './atoms/LoadingSpinner';

export default function AdminDashboard() {
  const { dashboardData, loading, refetch } = useDashboard();

  const stats = [
    { 
      title: 'Total Revenue', 
      value: dashboardData?.stats?.revenue?.value || '$0', 
      subtext: dashboardData?.stats?.revenue?.subtext || 'No data', 
      icon: DollarSign,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    { 
      title: 'Active Tickets', 
      value: dashboardData?.stats?.activeTickets?.value || '0', 
      subtext: dashboardData?.stats?.activeTickets?.subtext || 'No active tickets', 
      icon: Calendar,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'Technicians', 
      value: dashboardData?.stats?.staff?.value || '0/0', 
      subtext: dashboardData?.stats?.staff?.subtext || 'No staff data', 
      icon: Users,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    { 
      title: 'Waitlist', 
      value: dashboardData?.stats?.waitlist?.value || '0', 
      subtext: dashboardData?.stats?.waitlist?.subtext || 'No waitlist', 
      icon: Clock,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const recentActivity = dashboardData?.recentActivity || [];
  const staffStatus = dashboardData?.staffStatus || [];

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtext={stat.subtext}
              icon={stat.icon}
              iconBg={stat.iconBg}
              iconColor={stat.iconColor}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Activity */}
           <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                 <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
                    <MoreHorizontal className="h-5 w-5" />
                 </Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                 {recentActivity.length > 0 ? (
                   recentActivity.map((item, i) => (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-400 w-12">{item.id}</span>
                            <div>
                               <h4 className="font-bold text-gray-900">{item.client}</h4>
                               <p className="text-sm text-gray-500">
                                  {item.service} <span className="text-gray-300">•</span> Staff: {item.staff}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="font-bold text-gray-900">{item.price}</div>
                            <div className={`text-xs font-medium ${
                               item.status === 'completed' ? 'text-green-600' : 
                               item.status === 'confirmed' ? 'text-blue-600' : 
                               'text-orange-500'
                            }`}>
                               {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </div>
                         </div>
                      </div>
                   ))
                 ) : (
                   <div className="p-12 text-center">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No completed appointments yet</p>
                      <p className="text-sm text-gray-400 mt-1">Activity will appear here once appointments are completed</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Staff Status */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-bold text-gray-900">Staff Status</h2>
                 <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
                    <MoreHorizontal className="h-5 w-5" />
                 </Button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                 {staffStatus.length > 0 ? (
                   staffStatus.map((staff, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${staff.color}`} />
                            <span className="font-semibold text-gray-900">{staff.name}</span>
                         </div>
                         <span className="text-xs font-medium text-gray-500">{staff.text}</span>
                      </div>
                   ))
                 ) : (
                   <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No staff members yet</p>
                      <p className="text-sm text-gray-400 mt-1">Add staff to see their status here</p>
                   </div>
                 )}
              </div>
           </div>
        </div>


      </div>
    </AdminLayout>
  );
}