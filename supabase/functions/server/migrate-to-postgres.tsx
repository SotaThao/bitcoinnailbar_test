import { Hono } from 'npm:hono';
import { kvAdmin as kv } from './_shared_kv.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { requireAuth } from './helpers.tsx';

const app = new Hono();

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * MIGRATION MODULE: KV Store → Postgres
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Migrates data from KV Store to Postgres tables:
 * - staff:* → technician_info
 * - appointment:* → appointment_info
 * - assignment-log:* → assignment_change_log
 * 
 * Routes:
 * - POST /migrate-technicians - Migrate staff data
 * - POST /migrate-appointments - Migrate appointment data
 * - POST /migrate-assignment-logs - Migrate assignment logs
 * - POST /migrate-all - Run all migrations
 * - GET  /migration-status - Check migration status
 */

// Helper: Check if user is owner/admin
function isAuthorized(user: any): boolean {
  return user.role === 'owner' || user.role === 'admin';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIGRATION 1: Technicians (staff:* → technician_info)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post('/migrate-technicians', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAuthorized(currentUser)) {
      return c.json({ success: false, error: 'Unauthorized: Owner/Admin only' }, 403);
    }

    console.log('🔄 [MIGRATION] Starting technician migration...');

    const supabase = getSupabaseClient();
    
    // Get all staff from KV Store
    const kvStaff = await kv.getByPrefix('staff:');
    console.log(`📊 [MIGRATION] Found ${kvStaff.length} technicians in KV Store`);

    if (kvStaff.length === 0) {
      return c.json({
        success: true,
        message: 'No technicians to migrate',
        migrated: 0,
      });
    }

    // Transform and insert into Postgres
    const migrationResults = [];
    let successCount = 0;
    let errorCount = 0;

    for (const staff of kvStaff) {
      try {
        // Check if already migrated
        const { data: existing } = await supabase
          .from('technician_info')
          .select('id')
          .eq('legacy_staff_id', staff.id)
          .single();

        if (existing) {
          console.log(`⏭️  [MIGRATION] Skipping ${staff.name} - already migrated`);
          migrationResults.push({
            legacy_id: staff.id,
            name: staff.name,
            status: 'skipped',
            reason: 'Already exists in Postgres',
          });
          continue;
        }

        // Transform data
        const technicianData = {
          name: staff.name,
          nick_name:
            staff.nickname != null &&
            String(staff.nickname).trim() !== ""
              ? String(staff.nickname).trim()
              : null,
          phone: staff.phone || null,
          email: staff.email || null,
          avatar_url: staff.avatar || staff.avatarUrl || null,
          
          employment_type: staff.employmentType || staff.employment_type || null,
          license_number: staff.licenseNumber || staff.license_number || null,
          license_expiry: staff.licenseExpiry || staff.license_expiry || null,
          commission_rate: staff.commissionRate || staff.commission_rate || 40.00,
          hourly_rate: staff.hourlyRate || staff.hourly_rate || null,
          
          specialties: Array.isArray(staff.specialties) ? staff.specialties : [],
          
          rating: staff.rating || 4.0,
          total_income: staff.totalIncome || staff.total_income || 0,
          total_appointments: staff.totalAppointments || staff.total_appointments || 0,
          last_metrics_update: staff.lastMetricsUpdate || staff.last_metrics_update || null,
          
          is_available: staff.isAvailable !== false,
          unavailable_until: staff.unavailableUntil || staff.unavailable_until || null,
          unavailable_reason: staff.unavailableReason || staff.unavailable_reason || null,
          working_days: Array.isArray(staff.workingDays) 
            ? staff.workingDays 
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          
          working_hours: staff.workingHours || staff.working_hours || null,
          
          emergency_contact_name: staff.emergencyContactName || staff.emergency_contact_name || null,
          emergency_contact_phone: staff.emergencyContactPhone || staff.emergency_contact_phone || null,
          emergency_contact_relationship: staff.emergencyContactRelationship || staff.emergency_contact_relationship || null,
          
          notes: staff.notes || null,
          hire_date: staff.hireDate || staff.hire_date || null,
          termination_date: staff.terminationDate || staff.termination_date || null,
          
          legacy_staff_id: staff.id,
          created_at: staff.createdAt || new Date().toISOString(),
        };

        // Insert into Postgres
        const { data, error } = await supabase
          .from('technician_info')
          .insert(technicianData)
          .select()
          .single();

        if (error) throw error;

        console.log(`✅ [MIGRATION] Migrated technician: ${staff.name} (${staff.id} → ${data.id})`);
        successCount++;
        migrationResults.push({
          legacy_id: staff.id,
          postgres_id: data.id,
          name: staff.name,
          status: 'success',
        });

      } catch (error: any) {
        console.error(`❌ [MIGRATION] Failed to migrate ${staff.name}:`, error);
        errorCount++;
        migrationResults.push({
          legacy_id: staff.id,
          name: staff.name,
          status: 'error',
          error: error.message,
        });
      }
    }

    console.log(`✅ [MIGRATION] Technician migration complete: ${successCount} success, ${errorCount} errors`);

    return c.json({
      success: true,
      migrated: successCount,
      errors: errorCount,
      total: kvStaff.length,
      details: migrationResults,
    });

  } catch (error: any) {
    console.error('❌ [MIGRATION] Technician migration error:', error);
    return c.json({
      success: false,
      error: error.message || 'Technician migration failed',
    }, 500);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIGRATION 2: Appointments (appointment:* → appointment_info)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post('/migrate-appointments', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAuthorized(currentUser)) {
      return c.json({ success: false, error: 'Unauthorized: Owner/Admin only' }, 403);
    }

    console.log('🔄 [MIGRATION] Starting appointment migration...');

    const supabase = getSupabaseClient();
    
    // Get all appointments from KV Store
    const kvAppointments = await kv.getByPrefix('appointment:');
    console.log(`📊 [MIGRATION] Found ${kvAppointments.length} appointments in KV Store`);

    if (kvAppointments.length === 0) {
      return c.json({
        success: true,
        message: 'No appointments to migrate',
        migrated: 0,
      });
    }

    // Create mapping: legacy staff ID → Postgres technician ID
    const { data: technicians } = await supabase
      .from('technician_info')
      .select('id, legacy_staff_id');
    
    const staffIdMap = new Map();
    technicians?.forEach((tech: any) => {
      if (tech.legacy_staff_id) {
        staffIdMap.set(tech.legacy_staff_id, tech.id);
      }
    });

    // Create mapping: customer phone → Postgres customer ID
    const { data: customers } = await supabase
      .from('customer_profiles')
      .select('id, phone');
    
    const customerPhoneMap = new Map();
    customers?.forEach((cust: any) => {
      if (cust.phone) {
        customerPhoneMap.set(cust.phone, cust.id);
      }
    });

    // Migrate appointments
    const migrationResults = [];
    let successCount = 0;
    let errorCount = 0;

    for (const appointment of kvAppointments) {
      try {
        // Check if already migrated
        const { data: existing } = await supabase
          .from('appointment_info')
          .select('id')
          .eq('legacy_appointment_id', appointment.id)
          .single();

        if (existing) {
          console.log(`⏭️  [MIGRATION] Skipping appointment ${appointment.id} - already migrated`);
          migrationResults.push({
            legacy_id: appointment.id,
            status: 'skipped',
          });
          continue;
        }

        // Resolve foreign keys
        const technicianId = appointment.staffId 
          ? staffIdMap.get(appointment.staffId) || null 
          : null;

        const customerId = appointment.customerPhone 
          ? customerPhoneMap.get(appointment.customerPhone) || null 
          : null;

        // Transform data
        const appointmentData = {
          customer_name: appointment.customerName,
          customer_phone: appointment.customerPhone,
          customer_email: appointment.customerEmail || null,
          
          customer_id: customerId,
          technician_id: technicianId,
          
          branch_id: appointment.branchId || null,
          branch_name: appointment.branchName || null,
          
          service_ids: Array.isArray(appointment.serviceIds) ? appointment.serviceIds : [],
          service_names: Array.isArray(appointment.serviceNames) ? appointment.serviceNames : [],
          estimated_duration: appointment.estimatedDuration || appointment.estimated_duration || 60,
          
          appointment_time: appointment.appointmentTime,
          status: appointment.status || 'pending',
          
          assignment_method: appointment.assignmentMethod || appointment.assignment_method || null,
          assignment_score: appointment.assignmentScore || appointment.assignment_score || null,
          last_assignment_change: appointment.lastAssignmentChange || appointment.last_assignment_change || null,
          assignment_change_count: appointment.assignmentChangeCount || appointment.assignment_change_count || 0,
          has_customer_preference: appointment.hasCustomerPreference || appointment.has_customer_preference || false,
          
          total_amount: appointment.totalAmount || appointment.total_amount || 0,
          payment_status: appointment.paymentStatus || appointment.payment_status || 'unpaid',
          payment_method: appointment.paymentMethod || appointment.payment_method || null,
          
          notes: appointment.notes || null,
          qr_code_url: appointment.qrCodeUrl || appointment.qr_code_url || null,
          cancellation_reason: appointment.cancellationReason || appointment.cancellation_reason || null,
          
          email_sent: appointment.emailSent || false,
          email_error: appointment.emailError || null,
          
          legacy_appointment_id: appointment.id,
          created_at: appointment.createdAt || new Date().toISOString(),
        };

        // Insert into Postgres
        const { data, error } = await supabase
          .from('appointment_info')
          .insert(appointmentData)
          .select()
          .single();

        if (error) throw error;

        console.log(`✅ [MIGRATION] Migrated appointment: ${appointment.id} → ${data.id}`);
        successCount++;
        migrationResults.push({
          legacy_id: appointment.id,
          postgres_id: data.id,
          customer: appointment.customerName,
          status: 'success',
        });

      } catch (error: any) {
        console.error(`❌ [MIGRATION] Failed to migrate appointment ${appointment.id}:`, error);
        errorCount++;
        migrationResults.push({
          legacy_id: appointment.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    console.log(`✅ [MIGRATION] Appointment migration complete: ${successCount} success, ${errorCount} errors`);

    return c.json({
      success: true,
      migrated: successCount,
      errors: errorCount,
      total: kvAppointments.length,
      details: migrationResults,
    });

  } catch (error: any) {
    console.error('❌ [MIGRATION] Appointment migration error:', error);
    return c.json({
      success: false,
      error: error.message || 'Appointment migration failed',
    }, 500);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIGRATION 3: Assignment Logs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post('/migrate-assignment-logs', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAuthorized(currentUser)) {
      return c.json({ success: false, error: 'Unauthorized: Owner/Admin only' }, 403);
    }

    console.log('🔄 [MIGRATION] Starting assignment log migration...');

    const supabase = getSupabaseClient();
    
    // Get all logs from KV Store
    const kvLogs = await kv.getByPrefix('assignment-log:');
    console.log(`📊 [MIGRATION] Found ${kvLogs.length} assignment logs in KV Store`);

    if (kvLogs.length === 0) {
      return c.json({
        success: true,
        message: 'No assignment logs to migrate',
        migrated: 0,
      });
    }

    // Create ID mappings
    const { data: appointments } = await supabase
      .from('appointment_info')
      .select('id, legacy_appointment_id');
    
    const appointmentIdMap = new Map();
    appointments?.forEach((apt: any) => {
      if (apt.legacy_appointment_id) {
        appointmentIdMap.set(apt.legacy_appointment_id, apt.id);
      }
    });

    const { data: technicians } = await supabase
      .from('technician_info')
      .select('id, legacy_staff_id');
    
    const staffIdMap = new Map();
    technicians?.forEach((tech: any) => {
      if (tech.legacy_staff_id) {
        staffIdMap.set(tech.legacy_staff_id, tech.id);
      }
    });

    // Migrate logs
    let successCount = 0;
    let errorCount = 0;

    for (const log of kvLogs) {
      try {
        const appointmentId = log.appointmentId 
          ? appointmentIdMap.get(log.appointmentId) 
          : null;

        if (!appointmentId) {
          console.warn(`⚠️  [MIGRATION] Skipping log - appointment not found: ${log.appointmentId}`);
          errorCount++;
          continue;
        }

        const logData = {
          appointment_id: appointmentId,
          from_technician_id: log.fromStaffId ? staffIdMap.get(log.fromStaffId) || null : null,
          to_technician_id: log.toStaffId ? staffIdMap.get(log.toStaffId) || null : null,
          
          from_technician_name: log.fromStaffName || null,
          to_technician_name: log.toStaffName,
          
          reason_id: log.reasonId || null,
          reason_text: log.reasonText,
          reason_category: log.reasonCategory || 'other',
          custom_reason: log.customReason || null,
          
          assignment_method: log.assignmentMethod || 'manual',
          assignment_score: log.assignmentScore || null,
          
          changed_by: log.changedBy,
          changed_by_name: log.changedByName,
          changed_by_role: log.changedByRole || null,
          
          timestamp: log.timestamp || new Date().toISOString(),
          ip_address: log.ipAddress || null,
          user_agent: log.userAgent || null,
          
          legacy_log_id: log.id,
        };

        const { error } = await supabase
          .from('assignment_change_log')
          .insert(logData);

        if (error) throw error;

        successCount++;

      } catch (error: any) {
        console.error(`❌ [MIGRATION] Failed to migrate log:`, error);
        errorCount++;
      }
    }

    console.log(`✅ [MIGRATION] Assignment log migration complete: ${successCount} success, ${errorCount} errors`);

    return c.json({
      success: true,
      migrated: successCount,
      errors: errorCount,
      total: kvLogs.length,
    });

  } catch (error: any) {
    console.error('❌ [MIGRATION] Assignment log migration error:', error);
    return c.json({
      success: false,
      error: error.message || 'Assignment log migration failed',
    }, 500);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIGRATE ALL (Run all migrations in sequence)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post('/migrate-all', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAuthorized(currentUser)) {
      return c.json({ success: false, error: 'Unauthorized: Owner/Admin only' }, 403);
    }

    console.log('🚀 [MIGRATION] Starting FULL migration...');

    const results: any = {
      technicians: null,
      appointments: null,
      assignmentLogs: null,
    };

    // Step 1: Migrate technicians
    console.log('📋 [MIGRATION] Step 1/3: Migrating technicians...');
    const techResponse = await app.request('/migrate-technicians', {
      method: 'POST',
      headers: c.req.raw.headers,
    });
    results.technicians = await techResponse.json();

    // Step 2: Migrate appointments
    console.log('📋 [MIGRATION] Step 2/3: Migrating appointments...');
    const apptResponse = await app.request('/migrate-appointments', {
      method: 'POST',
      headers: c.req.raw.headers,
    });
    results.appointments = await apptResponse.json();

    // Step 3: Migrate assignment logs
    console.log('📋 [MIGRATION] Step 3/3: Migrating assignment logs...');
    const logsResponse = await app.request('/migrate-assignment-logs', {
      method: 'POST',
      headers: c.req.raw.headers,
    });
    results.assignmentLogs = await logsResponse.json();

    console.log('✅ [MIGRATION] FULL migration complete!');

    return c.json({
      success: true,
      message: 'Full migration completed',
      results,
    });

  } catch (error: any) {
    console.error('❌ [MIGRATION] Full migration error:', error);
    return c.json({
      success: false,
      error: error.message || 'Full migration failed',
    }, 500);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIGRATION STATUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/migration-status', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    if (!isAuthorized(currentUser)) {
      return c.json({ success: false, error: 'Unauthorized: Owner/Admin only' }, 403);
    }

    const supabase = getSupabaseClient();

    // Count records in KV Store
    const kvStaff = await kv.getByPrefix('staff:');
    const kvAppointments = await kv.getByPrefix('appointment:');
    const kvLogs = await kv.getByPrefix('assignment-log:');

    // Count records in Postgres
    const [techCount, apptCount, logCount] = await Promise.all([
      supabase.from('technician_info').select('id', { count: 'exact', head: true }),
      supabase.from('appointment_info').select('id', { count: 'exact', head: true }),
      supabase.from('assignment_change_log').select('id', { count: 'exact', head: true }),
    ]);

    return c.json({
      success: true,
      kvStore: {
        technicians: kvStaff.length,
        appointments: kvAppointments.length,
        assignmentLogs: kvLogs.length,
      },
      postgres: {
        technicians: techCount.count || 0,
        appointments: apptCount.count || 0,
        assignmentLogs: logCount.count || 0,
      },
      migrationComplete: {
        technicians: (techCount.count || 0) >= kvStaff.length,
        appointments: (apptCount.count || 0) >= kvAppointments.length,
        assignmentLogs: (logCount.count || 0) >= kvLogs.length,
      },
    });

  } catch (error: any) {
    console.error('❌ [MIGRATION] Status check error:', error);
    return c.json({
      success: false,
      error: error.message,
    }, 500);
  }
});

console.log('✅ Postgres Migration module initialized');

export default app;
