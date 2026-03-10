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
    return c.json({ success: true, data: staff || [] });
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
      phone: body.phone || null,
      email: body.email || null,
      avatar_url: body.avatar || body.avatarUrl || null,
      employment_type: body.employmentType || body.employment_type || null,
      license_number: body.licenseNumber || body.license_number || null,
      license_expiry: body.licenseExpiry || body.license_expiry || null,
      commission_rate: body.commissionRate || body.commission_rate || 40.00,
      hourly_rate: body.hourlyRate || body.hourly_rate || null,
      specialties: Array.isArray(body.specialties) ? body.specialties : [],
      rating: body.rating || 4.0,
      total_income: body.totalIncome || body.total_income || 0,
      total_appointments: body.totalAppointments || body.total_appointments || 0,
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
      hire_date: body.hireDate || body.hire_date || null,
      termination_date: body.terminationDate || body.termination_date || null,
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
    return c.json({ success: true, data: newStaff });
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
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.avatar !== undefined || body.avatarUrl !== undefined) {
      updateData.avatar_url = body.avatar || body.avatarUrl;
    }
    if (body.employmentType !== undefined || body.employment_type !== undefined) {
      updateData.employment_type = body.employmentType || body.employment_type;
    }
    if (body.licenseNumber !== undefined || body.license_number !== undefined) {
      updateData.license_number = body.licenseNumber || body.license_number;
    }
    if (body.licenseExpiry !== undefined || body.license_expiry !== undefined) {
      updateData.license_expiry = body.licenseExpiry || body.license_expiry;
    }
    if (body.commissionRate !== undefined || body.commission_rate !== undefined) {
      updateData.commission_rate = body.commissionRate || body.commission_rate;
    }
    if (body.hourlyRate !== undefined || body.hourly_rate !== undefined) {
      updateData.hourly_rate = body.hourlyRate || body.hourly_rate;
    }
    if (body.specialties !== undefined) updateData.specialties = body.specialties;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.totalIncome !== undefined || body.total_income !== undefined) {
      updateData.total_income = body.totalIncome || body.total_income;
    }
    if (body.totalAppointments !== undefined || body.total_appointments !== undefined) {
      updateData.total_appointments = body.totalAppointments || body.total_appointments;
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
      updateData.hire_date = body.hireDate || body.hire_date;
    }
    if (body.terminationDate !== undefined || body.termination_date !== undefined) {
      updateData.termination_date = body.terminationDate || body.termination_date;
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
    return c.json({ success: true, data: updatedStaff });
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
        nickname: "Jenny",
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
        nickname: "Linda",
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
        nickname: "Sarah",
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
        nickname: "Mai",
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
        nickname: "Jess",
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
        nickname: "Em",
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
      
      created.push(newStaff);
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