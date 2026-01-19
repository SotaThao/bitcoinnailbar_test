import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '../AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useAnalytics } from '../../hooks/useAnalytics';
import { LoadingSpinner } from './atoms/LoadingSpinner';
import { EmptyState } from './atoms/EmptyState';

export default function AdminAnalytics() {
  const { analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="Loading analytics..." />
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={BarChart}
              title="No analytics data available"
              description="Analytics data will appear here once you have completed appointments"
            />
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your salon's performance and growth</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">Completed bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${analytics.totalAppointments > 0 ? (analytics.totalRevenue / analytics.totalAppointments).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Per appointment</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Revenue breakdown by day this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Revenue Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Revenue by day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyRevenue.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'EEE')}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => `$${value.toFixed(2)}`}
                    labelFormatter={(value) => format(new Date(value), 'EEEE, MMM d')}
                  />
                  <Bar dataKey="revenue" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key insights from this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-900">Best Day</p>
                  <p className="text-sm text-green-700">
                    {analytics.dailyRevenue.length > 0 ? 
                      format(new Date(analytics.dailyRevenue.reduce((max: any, day: any) => 
                        day.revenue > max.revenue ? day : max
                      ).date), 'MMMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">Average Daily Revenue</p>
                  <p className="text-sm text-blue-700">
                    ${analytics.dailyRevenue.length > 0 ? 
                      (analytics.totalRevenue / analytics.dailyRevenue.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-semibold text-purple-900">Total Days Active</p>
                  <p className="text-sm text-purple-700">
                    {analytics.dailyRevenue.filter((d: any) => d.revenue > 0).length} days
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}