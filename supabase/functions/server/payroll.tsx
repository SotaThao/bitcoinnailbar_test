import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAYROLL & ANALYTICS MODULE (Wave 6)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Routes: 4 total
// - POST /make-server-84f9c112/payroll/calculate
// - GET /make-server-84f9c112/payroll/:staffId
// - GET /make-server-84f9c112/analytics/revenue
// - GET /make-server-84f9c112/dashboard/stats
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const payrollApp = new Hono();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAYROLL ROUTES (2 routes)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /make-server-84f9c112/payroll/calculate
 * Calculate payroll for a staff member within a date range
 */
payrollApp.post("/make-server-84f9c112/payroll/calculate", async (c) => {
  try {
    const body = await c.req.json();
    const { staffId, startDate, endDate } = body;
    
    const allAppointments = await kv.getByPrefix("appointment:");
    const completedAppointments = allAppointments.filter((appt: any) => 
      appt.staffId === staffId && 
      appt.status === "completed" &&
      new Date(appt.appointmentTime) >= new Date(startDate) &&
      new Date(appt.appointmentTime) <= new Date(endDate)
    );
    
    const staff = await kv.get(staffId);
    if (!staff) return c.json({ success: false, error: "Staff not found" }, 404);
    
    const services = await kv.getByPrefix("service:");
    const serviceMap = new Map(services.map((s: any) => [s.id, s]));
    
    let totalRevenue = 0;
    let totalTips = 0;
    const details = [];
    
    for (const appt of completedAppointments) {
      let apptRevenue = 0;
      for (const serviceId of appt.serviceIds || []) {
        const service = serviceMap.get(serviceId);
        if (service) apptRevenue += service.price;
      }
      
      const tip = appt.tip || 0;
      const commission = apptRevenue * (staff.commissionRate || 0.6);
      
      totalRevenue += apptRevenue;
      totalTips += tip;
      
      details.push({
        appointmentId: appt.id,
        customerName: appt.customerName,
        date: appt.appointmentTime,
        revenue: apptRevenue,
        commission,
        tip,
      });
    }
    
    const totalCommission = totalRevenue * (staff.commissionRate || 0.6);
    const totalEarnings = totalCommission + totalTips;
    
    const payrollData = {
      staffId,
      staffName: staff.name,
      startDate,
      endDate,
      totalRevenue,
      totalCommission,
      totalTips,
      totalEarnings,
      appointmentCount: completedAppointments.length,
      details,
      generatedAt: new Date().toISOString(),
    };
    
    const payrollId = `payroll:${staffId}:${Date.now()}`;
    await kv.set(payrollId, payrollData);
    
    return c.json({ success: true, data: payrollData });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /make-server-84f9c112/payroll/:staffId
 * Get all payroll records for a specific staff member
 */
payrollApp.get("/make-server-84f9c112/payroll/:staffId", async (c) => {
  try {
    const staffId = c.req.param("staffId");
    const payrollRecords = await kv.getByPrefix(`payroll:${staffId}:`);
    return c.json({ success: true, data: payrollRecords });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANALYTICS ROUTES (1 route)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /make-server-84f9c112/analytics/revenue
 * Analyze revenue by date range and optional branch filter
 */
payrollApp.get("/make-server-84f9c112/analytics/revenue", async (c) => {
  try {
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const branchId = c.req.query('branchId');
    
    const appointments = await kv.getByPrefix("appointment:");
    const completed = appointments.filter((appt: any) => 
      appt.status === "completed" &&
      (!startDate || new Date(appt.appointmentTime) >= new Date(startDate)) &&
      (!endDate || new Date(appt.appointmentTime) <= new Date(endDate)) &&
      (!branchId || appt.branchId === branchId)
    );
    
    const services = await kv.getByPrefix("service:");
    const serviceMap = new Map(services.map((s: any) => [s.id, s]));
    
    let totalRevenue = 0;
    const dailyRevenue: any = {};
    
    for (const appt of completed) {
      let apptRevenue = 0;
      for (const serviceId of appt.serviceIds || []) {
        const service = serviceMap.get(serviceId);
        if (service) apptRevenue += service.price;
      }
      totalRevenue += apptRevenue;
      
      const date = new Date(appt.appointmentTime).toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + apptRevenue;
    }
    
    return c.json({
      success: true,
      data: {
        totalRevenue,
        totalAppointments: completed.length,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue,
        })),
      },
    });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD ROUTES (1 route)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /make-server-84f9c112/dashboard/stats
 * Real-time dashboard statistics for today
 * ✅ REFACTORED: Now reads staff from Postgres technician_info, appointments from Postgres appointment_info
 * Services still from KV Store (not yet migrated)
 */
/** Prefer nick_name / nickname for UI; fall back to legal name. */
function staffDisplayName(s: { name?: string; nick_name?: string | null; nickname?: string | null }) {
  const nick = (s.nick_name ?? s.nickname ?? "").toString().trim();
  return nick || (s.name ?? "");
}

payrollApp.get("/make-server-84f9c112/dashboard/stats", async (c) => {
  try {
    const supabase = getSupabaseClient();

    // ✅ Read from Postgres tables
    const [appointmentsResult, staffResult] = await Promise.all([
      supabase.from('appointment_info').select('*').order('created_at', { ascending: false }),
      supabase.from('technician_info').select('*').order('created_at', { ascending: true }),
    ]);

    if (appointmentsResult.error) {
      throw appointmentsResult.error;
    }
    if (staffResult.error) {
      throw staffResult.error;
    }

    const appointments = appointmentsResult.data || [];
    const staff = staffResult.data || [];

    // Services still from KV Store (not yet migrated)
    const services = await kv.getByPrefix("service:");

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Filter today's appointments (using Postgres snake_case field)
    const todayAppointments = appointments.filter((appt: any) => {
      const apptDate = new Date(appt.appointment_time);
      return apptDate >= today;
    });
    
    const yesterdayAppointments = appointments.filter((appt: any) => {
      const apptDate = new Date(appt.appointment_time);
      return apptDate >= yesterday && apptDate < today;
    });
    
    // Calculate revenue (completed appointments only)
    const completedToday = todayAppointments.filter((a: any) => a.status === 'completed');
    const completedYesterday = yesterdayAppointments.filter((a: any) => a.status === 'completed');
    
    // Calculate revenue - use total_amount from Postgres first, fallback to service lookup
    const calculateRevenue = (appts: any[]) => {
      let total = 0;
      appts.forEach((appt: any) => {
        if (appt.total_amount) {
          total += parseFloat(appt.total_amount);
        } else if (appt.service_ids && Array.isArray(appt.service_ids)) {
          appt.service_ids.forEach((serviceId: string) => {
            const service = services.find((s: any) => s.id === serviceId);
            if (service && service.price) {
              total += parseFloat(service.price);
            }
          });
        }
      });
      return total;
    };
    
    const todayRevenue = calculateRevenue(completedToday);
    const yesterdayRevenue = calculateRevenue(completedYesterday);
    const revenueChange = yesterdayRevenue > 0 
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : 0;
    
    // Active tickets (pending or confirmed today)
    const activeTickets = todayAppointments.filter((a: any) => 
      a.status === 'pending' || a.status === 'confirmed'
    );
    
    const waitingForCheckout = completedToday.length;
    
    // Staff status (available vs busy) - using Postgres UUID technician_id
    const busyStaffIds = todayAppointments
      .filter((a: any) => a.status === 'confirmed' || a.status === 'pending')
      .map((a: any) => a.technician_id);
    
    const availableStaff = staff.filter((s: any) => !busyStaffIds.includes(s.id));
    const busyStaff = staff.filter((s: any) => busyStaffIds.includes(s.id));
    
    // Waitlist (pending appointments)
    const waitlist = todayAppointments.filter((a: any) => a.status === 'pending');
    
    // Recent activity (last 10 appointments - completed, pending, confirmed)
    const recentActivity = appointments
      .filter((a: any) => ['completed', 'pending', 'confirmed'].includes(a.status))
      .sort((a: any, b: any) => new Date(b.appointment_time).getTime() - new Date(a.appointment_time).getTime())
      .slice(0, 10)
      .map((appt: any) => {
        const staffMember = staff.find((s: any) => s.id === appt.technician_id);
        
        // Use service_names from Postgres if available, fallback to KV lookup
        let serviceName = 'Service';
        let price = 0;
        
        if (appt.service_names && Array.isArray(appt.service_names) && appt.service_names.length > 0) {
          serviceName = appt.service_names.join(', ');
        } else if (appt.service_ids && Array.isArray(appt.service_ids)) {
          const apptServices = services.filter((s: any) => appt.service_ids.includes(s.id));
          serviceName = apptServices.map((s: any) => s.name).join(', ') || 'Service';
        }
        
        if (appt.total_amount) {
          price = parseFloat(appt.total_amount);
        } else if (appt.service_ids && Array.isArray(appt.service_ids)) {
          const apptServices = services.filter((s: any) => appt.service_ids.includes(s.id));
          price = apptServices.reduce((sum: number, s: any) => sum + parseFloat(s.price || 0), 0);
        }
        
        return {
          id: `#${appt.id.substring(0, 6)}`,
          client: appt.customer_name,
          service: serviceName,
          staff: staffMember ? staffDisplayName(staffMember) : 'Unassigned',
          price: `$${price.toFixed(2)}`,
          status: appt.status
        };
      });
    
    // Staff status details - Return ALL staff (pagination handled in frontend)
    const staffStatus = staff.map((s: any) => {
      const isBusy = busyStaffIds.includes(s.id);
      const staffAppt = isBusy ? todayAppointments.find((a: any) => a.technician_id === s.id) : null;
      
      let busyUntil = '';
      if (staffAppt) {
        // Use estimated_duration from Postgres if available, fallback to service lookup
        let totalDuration = 0;
        if (staffAppt.estimated_duration) {
          totalDuration = parseInt(staffAppt.estimated_duration);
        } else if (staffAppt.service_ids && Array.isArray(staffAppt.service_ids)) {
          const apptServices = services.filter((service: any) => 
            staffAppt.service_ids.includes(service.id)
          );
          totalDuration = apptServices.reduce((sum: number, service: any) => {
            return sum + (parseInt(service.duration) || 30);
          }, 0);
        } else {
          totalDuration = 30; // Default 30 min
        }
        
        const apptStartTime = new Date(staffAppt.appointment_time);
        const apptEndTime = new Date(apptStartTime.getTime() + totalDuration * 60000);
        
        // Format busy until time
        const hours = apptEndTime.getHours();
        const minutes = apptEndTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        busyUntil = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }
      
      return {
        name: staffDisplayName(s),
        status: isBusy ? 'Busy' : 'Available',
        color: isBusy ? 'bg-orange-500' : 'bg-green-500',
        text: isBusy ? `Busy until ${busyUntil}` : 'Available',
        busyUntil: busyUntil,
        isBusy: isBusy
      };
    });
    
    return c.json({
      success: true,
      data: {
        stats: {
          revenue: {
            value: `$${todayRevenue.toFixed(0)}`,
            change: revenueChange,
            subtext: `${revenueChange >= 0 ? '+' : ''}${revenueChange}% from yesterday`
          },
          activeTickets: {
            value: activeTickets.length.toString(),
            subtext: `${waitingForCheckout} waiting for checkout`
          },
          staff: {
            value: `${availableStaff.length}/${staff.length}`,
            subtext: `${busyStaff.length} busy with clients`
          },
          waitlist: {
            value: waitlist.length.toString(),
            subtext: waitlist.length > 0 ? '~15 min avg wait' : 'No waiting clients'
          }
        },
        recentActivity: recentActivity,
        staffStatus: staffStatus
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});