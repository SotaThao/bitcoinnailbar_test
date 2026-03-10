/**
 * MANUAL ASSIGNMENT MODULE
 * Provides a simple POST endpoint for manual technician assignment from frontend
 */

import { Hono } from 'npm:hono@4.6.14';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { createAssignmentLog } from './assignment-logs.tsx';

const app = new Hono();
const supabase = getSupabaseClient();

// POST /assignments/manual - Manual assign technician with reason
app.post('/make-server-84f9c112/assignments/manual', async (c) => {
  try {
    const body = await c.req.json();
    const { appointment_id, technician_id, reason, changed_by } = body;

    console.log('📝 [MANUAL ASSIGN] Request:', { appointment_id, technician_id, reason, changed_by });

    // Validate inputs
    if (!appointment_id || !technician_id || !reason) {
      return c.json({
        success: false,
        error: 'Missing required fields: appointment_id, technician_id, reason',
      }, 400);
    }

    // Get appointment from Postgres
    const { data: appointment, error: apptError } = await supabase
      .from('appointment_info')
      .select('*')
      .eq('id', appointment_id)
      .maybeSingle();

    if (apptError) {
      console.error('❌ [MANUAL ASSIGN] Postgres error:', apptError);
      throw apptError;
    }

    if (!appointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }

    // Get technician info
    const { data: technician, error: techError } = await supabase
      .from('technician_info')
      .select('*')
      .eq('id', technician_id)
      .maybeSingle();

    if (techError) {
      console.error('❌ [MANUAL ASSIGN] Technician fetch error:', techError);
      throw techError;
    }

    if (!technician) {
      return c.json({ success: false, error: 'Technician not found' }, 404);
    }

    // Store previous assignment for log
    const previousTechnicianId = appointment.technician_id || null;
    let previousTechnicianName = null;

    if (previousTechnicianId) {
      const { data: prevTech } = await supabase
        .from('technician_info')
        .select('name')
        .eq('id', previousTechnicianId)
        .maybeSingle();
      previousTechnicianName = prevTech?.name || null;
    }

    // Update appointment in Postgres
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointment_info')
      .update({
        technician_id: technician_id,
        assignment_method: 'manual',
        assignment_score: null, // No score for manual assignment
        last_assignment_change: new Date().toISOString(),
        assignment_change_count: (appointment.assignment_change_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointment_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [MANUAL ASSIGN] Update error:', updateError);
      throw updateError;
    }

    // Create assignment log
    await createAssignmentLog({
      appointmentId: appointment_id,
      fromTechnicianId: previousTechnicianId,
      fromTechnicianName: previousTechnicianName,
      toTechnicianId: technician_id,
      toTechnicianName: technician.name,
      reasonText: reason,
      reasonCategory: 'manual',
      assignmentMethod: 'manual',
      assignmentScore: null,
      changedBy: changed_by || 'admin',
      changedByName: changed_by || 'Admin',
      changedByRole: 'admin',
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    console.log(`✅ [MANUAL ASSIGN] Successfully assigned ${technician.name} to appointment ${appointment_id}`);

    return c.json({
      success: true,
      data: {
        appointment: updatedAppointment,
        technician: technician,
      },
      message: 'Technician assigned successfully',
    });
  } catch (error: any) {
    console.error('❌ [MANUAL ASSIGN] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to assign technician',
    }, 500);
  }
});

export { app as manualAssignmentApp };
