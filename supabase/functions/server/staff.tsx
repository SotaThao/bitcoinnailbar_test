/**
 * STAFF MODULE
 * Phase 2.5 - Extracted from index.tsx (Wave 2 Start!)
 * 
 * Routes:
 * - GET  /staff - List all staff
 * - POST /staff - Create staff member
 * - PUT  /staff/:id - Update staff member
 * - DELETE /staff/:id - Delete staff member
 * - POST /staff/seed - Seed initial staff data (6 members)
 * 
 * ✅ REFACTORED: Now uses Postgres technician_info table instead of KV Store
 * Postgres Table: technician_info
 * 
 * Special Logic:
 * - Seed route creates 6 realistic US nail salon staff members
 * - Includes W2/1099 employment types, license numbers, specialties
 * - Commission rates, work schedules, emergency contacts
 */

import { Hono } from 'npm:hono@4.6.14';
import { getSupabaseClient } from './_shared_supabase_client.tsx';

const app = new Hono();
const supabase = getSupabaseClient();

/** UI sends `nickname`; Postgres column is `nick_name`. */
function nickNameToDb(body: any): string | null {
  const raw = body.nickname ?? body.nick_name;
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

/** Postgres rejects `""` for numeric columns — treat blank / invalid as null. */
function optionalDecimal(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

function optionalInt(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const n = parseInt(String(value).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function decimalOrDefault(value: unknown, defaultVal: number): number {
  const v = optionalDecimal(value);
  return v === null ? defaultVal : v;
}

/** Empty date strings → null for DATE / TIMESTAMPTZ columns. */
function optionalDate(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

/** Expose camelCase fields the admin UI expects (`hireDate`, `licenseNumber`, etc.). */
function mapStaffRow(row: any) {
  if (!row || typeof row !== "object") return row;
  const hourly = row.hourly_rate ?? row.hourlyRate ?? row.baseHourlyRate;
  return {
    ...row,
    nickname: row.nick_name ?? row.nickname ?? null,
    hireDate: row.hire_date ?? row.hireDate ?? "",
    licenseNumber: row.license_number ?? row.licenseNumber ?? "",
    baseHourlyRate:
      hourly != null && hourly !== ""
        ? String(hourly)
        : row.baseHourlyRate ?? "",
    role: row.role ?? "Nail Technician",
  };
}

// ========== GET ALL STAFF ==========
app.get('/make-server-84f9c112/staff', async (c) => {
  try {
    const { data: staff, error } = await supabase
      .from('technician_info')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ [GET STAFF] Postgres error:', error);
      throw error;
    }
    
    console.log(`✅ [GET STAFF] Returning ${staff?.length || 0} technicians from Postgres`);
    const rows = (staff || []).map(mapStaffRow);
    return c.json({ success: true, data: rows });
  } catch (e) {
    console.error('❌ [GET STAFF] Error:', e);
    return c.json({ success: false, error: String(e) }, 500);
  }
});

// ========== CREATE STAFF ==========
app.post('/make-server-84f9c112/staff', async (c) => {
  try {
    const body = await c.req.json();
    
    // Transform to Postgres schema
    const technicianData = {
      name: body.name,
      role: body.role ?? null,
      nick_name: nickNameToDb(body),
      phone: body.phone || null,
      email: body.email || null,
      avatar_url: body.avatar || body.avatarUrl || null,
      employment_type: body.employmentType || body.employment_type || null,
      license_number: body.licenseNumber ?? body.license_number ?? null,
      license_expiry: optionalDate(
        body.licenseExpiry ?? body.license_expiry,
      ),
      commission_rate: decimalOrDefault(
        body.commissionRate ?? body.commission_rate,
        40.0,
      ),
      hourly_rate: optionalDecimal(
        body.hourlyRate ?? body.hourly_rate ?? body.baseHourlyRate,
      ),
      specialties: Array.isArray(body.specialties) ? body.specialties : [],
      rating: decimalOrDefault(body.rating, 4.0),
      total_income: decimalOrDefault(
        body.totalIncome ?? body.total_income,
        0,
      ),
      total_appointments:
        optionalInt(body.totalAppointments ?? body.total_appointments) ?? 0,
      is_available: body.isAvailable !== false,
      unavailable_until: body.unavailableUntil || body.unavailable_until || null,
      unavailable_reason: body.unavailableReason || body.unavailable_reason || null,
      working_days: Array.isArray(body.workingDays) 
        ? body.workingDays 
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      working_hours: body.workingHours || body.working_hours || null,
      emergency_contact_name: body.emergencyContactName || body.emergency_contact_name || null,
      emergency_contact_phone: body.emergencyContactPhone || body.emergency_contact_phone || null,
      emergency_contact_relationship: body.emergencyContactRelationship || body.emergency_contact_relationship || null,
      notes: body.notes || null,
      hire_date: optionalDate(body.hireDate ?? body.hire_date),
      termination_date: optionalDate(
        body.terminationDate ?? body.termination_date,
      ),
    };
    
    const { data: newStaff, error } = await supabase
      .from('technician_info')
      .insert(technicianData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [CREATE STAFF] Postgres error:', error);
      throw error;
    }
    
    console.log(`✅ [CREATE STAFF] Created: ${newStaff.id} - ${newStaff.name}`);
    return c.json({ success: true, data: mapStaffRow(newStaff) });
  } catch (error: any) {
    console.error('❌ [CREATE STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== UPDATE STAFF ==========
app.put('/make-server-84f9c112/staff/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Get existing staff
    const { data: existing, error: fetchError } = await supabase
      .from('technician_info')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    if (!existing) {
      return c.json({ success: false, error: 'Staff not found' }, 404);
    }
    
    // Transform to Postgres schema (handle both camelCase and snake_case)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.nickname !== undefined || body.nick_name !== undefined) {
      updateData.nick_name = nickNameToDb(body);
    }
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.avatar !== undefined || body.avatarUrl !== undefined) {
      updateData.avatar_url = body.avatar || body.avatarUrl;
    }
    if (body.employmentType !== undefined || body.employment_type !== undefined) {
      updateData.employment_type = body.employmentType || body.employment_type;
    }
    if (body.licenseNumber !== undefined || body.license_number !== undefined) {
      updateData.license_number = body.licenseNumber ?? body.license_number;
    }
    if (body.licenseExpiry !== undefined || body.license_expiry !== undefined) {
      updateData.license_expiry = optionalDate(
        body.licenseExpiry ?? body.license_expiry,
      );
    }
    if (body.role !== undefined) {
      updateData.role = body.role;
    }
    if (body.commissionRate !== undefined || body.commission_rate !== undefined) {
      updateData.commission_rate =
        optionalDecimal(body.commissionRate ?? body.commission_rate) ?? 40;
    }
    if (
      body.hourlyRate !== undefined ||
      body.hourly_rate !== undefined ||
      body.baseHourlyRate !== undefined
    ) {
      let hourlyVal: unknown = undefined;
      if (body.hourlyRate !== undefined) hourlyVal = body.hourlyRate;
      else if (body.hourly_rate !== undefined) hourlyVal = body.hourly_rate;
      else hourlyVal = body.baseHourlyRate;
      updateData.hourly_rate = optionalDecimal(hourlyVal);
    }
    if (body.specialties !== undefined) updateData.specialties = body.specialties;
    if (body.rating !== undefined) {
      const r = optionalDecimal(body.rating);
      updateData.rating = r === null ? 4.0 : r;
    }
    if (body.totalIncome !== undefined || body.total_income !== undefined) {
      const ti = optionalDecimal(body.totalIncome ?? body.total_income);
      updateData.total_income = ti === null ? 0 : ti;
    }
    if (body.totalAppointments !== undefined || body.total_appointments !== undefined) {
      updateData.total_appointments =
        optionalInt(body.totalAppointments ?? body.total_appointments) ?? 0;
    }
    if (body.isAvailable !== undefined || body.is_available !== undefined) {
      updateData.is_available = body.isAvailable !== undefined ? body.isAvailable : body.is_available;
    }
    if (body.unavailableUntil !== undefined || body.unavailable_until !== undefined) {
      updateData.unavailable_until = body.unavailableUntil || body.unavailable_until;
    }
    if (body.unavailableReason !== undefined || body.unavailable_reason !== undefined) {
      updateData.unavailable_reason = body.unavailableReason || body.unavailable_reason;
    }
    if (body.workingDays !== undefined || body.working_days !== undefined) {
      updateData.working_days = body.workingDays || body.working_days;
    }
    if (body.workingHours !== undefined || body.working_hours !== undefined) {
      updateData.working_hours = body.workingHours || body.working_hours;
    }
    if (body.emergencyContactName !== undefined || body.emergency_contact_name !== undefined) {
      updateData.emergency_contact_name = body.emergencyContactName || body.emergency_contact_name;
    }
    if (body.emergencyContactPhone !== undefined || body.emergency_contact_phone !== undefined) {
      updateData.emergency_contact_phone = body.emergencyContactPhone || body.emergency_contact_phone;
    }
    if (body.emergencyContactRelationship !== undefined || body.emergency_contact_relationship !== undefined) {
      updateData.emergency_contact_relationship = body.emergencyContactRelationship || body.emergency_contact_relationship;
    }
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.hireDate !== undefined || body.hire_date !== undefined) {
      updateData.hire_date = optionalDate(body.hireDate ?? body.hire_date);
    }
    if (body.terminationDate !== undefined || body.termination_date !== undefined) {
      updateData.termination_date = optionalDate(
        body.terminationDate ?? body.termination_date,
      );
    }
    
    const { data: updatedStaff, error } = await supabase
      .from('technician_info')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [UPDATE STAFF] Postgres error:', error);
      throw error;
    }
    
    console.log(`✅ [UPDATE STAFF] Updated: ${id} - ${updatedStaff.name}`);
    return c.json({ success: true, data: mapStaffRow(updatedStaff) });
  } catch (error: any) {
    console.error('❌ [UPDATE STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== DELETE STAFF ==========
app.delete('/make-server-84f9c112/staff/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`🗑️  [DELETE STAFF] Deleting: ${id}`);
    
    const { error } = await supabase
      .from('technician_info')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ [DELETE STAFF] Postgres error:', error);
      throw error;
    }
    
    console.log(`✅ [DELETE STAFF] Successfully deleted: ${id}`);
    return c.json({ success: true, message: 'Staff deleted successfully' });
  } catch (error: any) {
    console.error('❌ [DELETE STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== SEED STAFF DATA ==========
// Creates 6 realistic staff members based on US nail salon business
app.post('/make-server-84f9c112/staff/seed', async (c) => {
  try {
    const seedStaff = [
      {
        name: "Jennifer Martinez",
        nick_name: "Jenny",
        phone: "(714) 555-0123",
        email: "jennifer.martinez@bitcoinnailbar.com",
        role: "Lead Technician",
        hire_date: "2023-01-15",
        employment_type: "W2",
        license_number: "CA-NT-987456",
        hourly_rate: "18.00",
        commission_rate: 70.00,
        tip_split: "100",
        specialties: ["Manicure", "Pedicure", "Gel Polish", "Nail Art", "Nail Extension"],
        working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        emergency_contact_name: "Maria Martinez",
        emergency_contact_phone: "(714) 555-0124"
      },
      {
        name: "Linda Nguyen",
        nick_name: "Linda",
        phone: "(714) 555-0145",
        email: "linda.nguyen@bitcoinnailbar.com",
        role: "Senior Nail Artist",
        hire_date: "2023-03-20",
        employment_type: "1099",
        license_number: "CA-NT-876543",
        hourly_rate: "16.50",
        commission_rate: 65.00,
        tip_split: "100",
        specialties: ["Nail Art", "Acrylic", "Gel Polish", "Nail Extension"],
        working_days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        emergency_contact_name: "Tom Nguyen",
        emergency_contact_phone: "(714) 555-0146"
      },
      {
        name: "Sarah Johnson",
        nick_name: "Sarah",
        phone: "(714) 555-0167",
        email: "sarah.johnson@bitcoinnailbar.com",
        role: "Nail Technician",
        hire_date: "2023-06-10",
        employment_type: "W2",
        license_number: "CA-NT-765432",
        hourly_rate: "15.50",
        commission_rate: 60.00,
        tip_split: "100",
        specialties: ["Manicure", "Pedicure", "Gel Polish", "Dip Powder"],
        working_days: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
        emergency_contact_name: "Mike Johnson",
        emergency_contact_phone: "(714) 555-0168"
      },
      {
        name: "Mai Tran",
        nick_name: "Mai",
        phone: "(714) 555-0189",
        email: "mai.tran@bitcoinnailbar.com",
        role: "Pedicure Specialist",
        hire_date: "2023-08-05",
        employment_type: "W2",
        license_number: "CA-NT-654321",
        hourly_rate: "15.50",
        commission_rate: 60.00,
        tip_split: "100",
        specialties: ["Pedicure", "Spa Treatment", "Manicure", "Gel Polish"],
        working_days: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        emergency_contact_name: "Linh Tran",
        emergency_contact_phone: "(714) 555-0190"
      },
      {
        name: "Jessica Lee",
        nick_name: "Jess",
        phone: "(714) 555-0201",
        email: "jessica.lee@bitcoinnailbar.com",
        role: "Nail Technician",
        hire_date: "2024-01-12",
        employment_type: "1099",
        license_number: "CA-NT-543210",
        hourly_rate: "15.00",
        commission_rate: 55.00,
        tip_split: "100",
        specialties: ["Manicure", "Gel Polish", "Dip Powder", "Acrylic"],
        working_days: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
        emergency_contact_name: "David Lee",
        emergency_contact_phone: "(714) 555-0202"
      },
      {
        name: "Emily Chen",
        nick_name: "Em",
        phone: "(714) 555-0223",
        email: "emily.chen@bitcoinnailbar.com",
        role: "Apprentice",
        hire_date: "2024-09-01",
        employment_type: "W2",
        license_number: "CA-NT-432109",
        hourly_rate: "14.00",
        commission_rate: 50.00,
        tip_split: "100",
        specialties: ["Manicure", "Pedicure", "Gel Polish"],
        working_days: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
        emergency_contact_name: "Amy Chen",
        emergency_contact_phone: "(714) 555-0224"
      }
    ];

    const created = [];
    for (const staff of seedStaff) {
      const { data: newStaff, error } = await supabase
        .from('technician_info')
        .insert(staff)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ [SEED STAFF] Failed to create ${staff.name}:`, error);
        continue;
      }
      
      created.push(mapStaffRow(newStaff));
      console.log(`✅ [SEED STAFF] Created: ${newStaff.name}`);
      
      // Small delay to avoid race conditions
      await new Promise(r => setTimeout(r, 10));
    }

    console.log(`✅ [SEED STAFF] Successfully seeded ${created.length} staff members`);
    
    return c.json({ 
      success: true, 
      message: `Successfully seeded ${created.length} staff members`,
      data: created 
    });
  } catch (error: any) {
    console.error('❌ [SEED STAFF] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app as staffApp };