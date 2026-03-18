import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "../server/kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== BRANCHES (CHI NHÁNH) ==========
app.get("/branches", async (c) => {
  try {
    const branches = await kv.getByPrefix("branch:");
    return c.json({ success: true, data: branches });
  } catch (error) {
    console.log("Error fetching branches:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/branches", async (c) => {
  try {
    const body = await c.req.json();
    const { name, address, phone, hours } = body;
    
    const branchId = `branch:${Date.now()}`;
    const branch = {
      id: branchId,
      name,
      address,
      phone,
      hours,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(branchId, branch);
    return c.json({ success: true, data: branch });
  } catch (error) {
    console.log("Error creating branch:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== SERVICES (DỊCH VỤ) ==========
app.get("/services", async (c) => {
  try {
    const services = await kv.getByPrefix("service:");
    return c.json({ success: true, data: services });
  } catch (error) {
    console.log("Error fetching services:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/services", async (c) => {
  try {
    const body = await c.req.json();
    const { name, duration, price, category, description } = body;
    
    const serviceId = `service:${Date.now()}`;
    const service = {
      id: serviceId,
      name,
      duration, // in minutes
      price,
      category, // Manicure, Pedicure, Nail Art, etc.
      description,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(serviceId, service);
    return c.json({ success: true, data: service });
  } catch (error) {
    console.log("Error creating service:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== STAFF (NHÂN VIÊN) ==========
app.get("/staff", async (c) => {
  try {
    const staff = await kv.getByPrefix("staff:");
    return c.json({ success: true, data: staff });
  } catch (error) {
    console.log("Error fetching staff:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/staff", async (c) => {
  try {
    const body = await c.req.json();
    const { name, role, branchId, commissionRate, phone, email } = body;
    
    const staffId = `staff:${Date.now()}`;
    const staffMember = {
      id: staffId,
      name,
      role, // Technician, Manager, Admin
      branchId,
      commissionRate, // e.g., 0.6 for 60%
      phone,
      email,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(staffId, staffMember);
    return c.json({ success: true, data: staffMember });
  } catch (error) {
    console.log("Error creating staff:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== APPOINTMENTS (LỊCH HẸN) ==========
app.get("/appointments", async (c) => {
  try {
    const appointments = await kv.getByPrefix("appointment:");
    return c.json({ success: true, data: appointments });
  } catch (error) {
    console.log("Error fetching appointments:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/appointments", async (c) => {
  try {
    const body = await c.req.json();
    const { customerName, customerPhone, customerEmail, branchId, staffId, serviceIds, appointmentTime, notes } = body;
    
    const appointmentId = `appointment:${Date.now()}`;
    const appointment = {
      id: appointmentId,
      customerName,
      customerPhone,
      customerEmail,
      branchId,
      staffId,
      serviceIds, // array of service IDs
      appointmentTime, // ISO string
      status: "pending", // pending, confirmed, completed, cancelled
      notes,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(appointmentId, appointment);
    return c.json({ success: true, data: appointment });
  } catch (error) {
    console.log("Error creating appointment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/appointments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Appointment not found" }, 404);
    }
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(id, updated);
    
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log("Error updating appointment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== PAYROLL (LƯƠNG THỢ) ==========
app.post("/payroll/calculate", async (c) => {
  try {
    const body = await c.req.json();
    const { staffId, startDate, endDate } = body;
    
    // Get all completed appointments for this staff in date range
    const allAppointments = await kv.getByPrefix("appointment:");
    const completedAppointments = allAppointments.filter((appt: any) => 
      appt.staffId === staffId && 
      appt.status === "completed" &&
      new Date(appt.appointmentTime) >= new Date(startDate) &&
      new Date(appt.appointmentTime) <= new Date(endDate)
    );
    
    // Get staff details
    const staff = await kv.get(staffId);
    if (!staff) {
      return c.json({ success: false, error: "Staff not found" }, 404);
    }
    
    // Get all services
    const services = await kv.getByPrefix("service:");
    const serviceMap = new Map(services.map((s: any) => [s.id, s]));
    
    // Calculate revenue and commission
    let totalRevenue = 0;
    let totalTips = 0;
    const details = [];
    
    for (const appt of completedAppointments) {
      let apptRevenue = 0;
      for (const serviceId of appt.serviceIds || []) {
        const service = serviceMap.get(serviceId);
        if (service) {
          apptRevenue += service.price;
        }
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
    
    // Save payroll record
    const payrollId = `payroll:${staffId}:${Date.now()}`;
    await kv.set(payrollId, payrollData);
    
    return c.json({ success: true, data: payrollData });
  } catch (error) {
    console.log("Error calculating payroll:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/payroll/:staffId", async (c) => {
  try {
    const staffId = c.req.param("staffId");
    const payrollRecords = await kv.getByPrefix(`payroll:${staffId}:`);
    return c.json({ success: true, data: payrollRecords });
  } catch (error) {
    console.log("Error fetching payroll:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== REVIEWS (ĐÁNH GIÁ) ==========
app.get("/reviews", async (c) => {
  try {
    const reviews = await kv.getByPrefix("review:");
    return c.json({ success: true, data: reviews });
  } catch (error) {
    console.log("Error fetching reviews:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { appointmentId, customerName, rating, comment, staffId, branchId } = body;
    
    const reviewId = `review:${Date.now()}`;
    const review = {
      id: reviewId,
      appointmentId,
      customerName,
      rating, // 1-5 stars
      comment,
      staffId,
      branchId,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(reviewId, review);
    return c.json({ success: true, data: review });
  } catch (error) {
    console.log("Error creating review:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== ANALYTICS (THỐNG KÊ) ==========
app.get("/analytics/revenue", async (c) => {
  try {
    const { startDate, endDate, branchId } = c.req.query();
    
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
        if (service) {
          apptRevenue += service.price;
        }
      }
      totalRevenue += apptRevenue;
      
      // Group by date
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
    console.log("Error fetching analytics:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========== DEBUG: CLEANUP DUPLICATES ==========
app.post("/debug/cleanup-duplicates", async (c) => {
  try {
    console.log("🧹 [CLEANUP] Endpoint called");
    
    // Get all staff records with their keys
    const staffData = await kv.getByPrefix("staff:");
    
    console.log(`   Total staff records before: ${staffData.length}`);
    
    if (staffData.length === 0) {
      console.log("ℹ️  [CLEANUP] No staff records found");
      return c.json({
        success: true,
        data: {
          deletedCount: 0,
          remainingCount: 0,
          summary: "No staff records found to clean"
        }
      });
    }
    
    // Group staff by name
    const staffByName: any = {};
    const staffKeysById: any = {}; // Map to track keys
    
    // We need to get keys separately since getByPrefix only returns values
    // Let's fetch all keys directly from the KV store
    const allStaffKeys: string[] = [];
    
    // Since we can't easily get keys from the current kv implementation,
    // we'll use a different approach: track by ID which should be unique
    const staffById: any = {};
    
    for (const staff of staffData) {
      if (!staff.id) continue;
      
      if (!staffByName[staff.name]) {
        staffByName[staff.name] = [];
      }
      staffByName[staff.name].push(staff);
      staffById[staff.id] = staff;
    }
    
    let deletedCount = 0;
    const deleteIds: string[] = [];
    
    // For each name group, keep the oldest record (by ID timestamp)
    for (const [name, records] of Object.entries(staffByName) as [string, any][]) {
      if (records.length > 1) {
        // Sort by ID to find oldest (earliest timestamp in ID)
        records.sort((a: any, b: any) => {
          const timestampA = parseInt(a.id.split(':')[1] || '0');
          const timestampB = parseInt(b.id.split(':')[1] || '0');
          return timestampA - timestampB;
        });
        
        // Keep the first (oldest), delete the rest
        for (let i = 1; i < records.length; i++) {
          deleteIds.push(records[i].id);
          deletedCount++;
        }
        
        console.log(`   ✓ ${name}: Kept ${records[0].id}, marked ${records.length - 1} for deletion`);
      }
    }
    
    // Delete all duplicates
    if (deleteIds.length > 0) {
      for (const id of deleteIds) {
        await kv.del(id);
      }
      console.log(`   🗑️  Deleted ${deleteIds.length} duplicate records`);
    }
    
    // Verify final count
    const staffAfter = await kv.getByPrefix("staff:");
    
    console.log("🧹 [CLEANUP] Completed!");
    console.log(`   Records deleted: ${deletedCount}`);
    console.log(`   Records remaining: ${staffAfter.length}`);
    
    return c.json({
      success: true,
      data: {
        deletedCount,
        remainingCount: staffAfter.length,
        summary: `Deleted ${deletedCount} duplicate staff records. ${staffAfter.length} unique staff remain.`
      }
    });
  } catch (error: any) {
    console.error('🚨 [CLEANUP ERROR]', error);
    console.error('   Stack:', error.stack);
    return c.json({ success: false, error: error.message || String(error) }, 500);
  }
});

Deno.serve(app.fetch);
