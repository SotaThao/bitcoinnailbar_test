import { Hono } from 'npm:hono';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { requireAuth } from './helpers.tsx';
import { createAssignmentLog } from './assignment-logs.tsx';

const app = new Hono();
const supabase = getSupabaseClient();

// Helper: Check if user has permission to assign technicians
function hasAssignPermission(user: any): boolean {
  return (
    user.role === 'owner' ||
    user.role === 'admin' ||
    user.permissions?.includes('assign_technicians') ||
    user.permissions?.includes('manage_staff') ||
    user.permissions?.includes('manage_bookings')
  );
}

// Helper: Get day of week from ISO string
function getDayOfWeek(isoString: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(isoString);
  return days[date.getDay()];
}

// Helper: Check if technician has time conflict
async function hasTimeConflict(
  technicianId: string,
  appointmentTime: string,
  duration: number  // in minutes
): Promise<boolean> {
  try {
    // Get all confirmed/pending appointments for this technician from Postgres
    const { data: techAppointments, error } = await supabase
      .from('appointment_info')
      .select('*')
      .eq('technician_id', technicianId)
      .in('status', ['confirmed', 'pending']);
    
    if (error) {
      console.error('❌ [TIME CONFLICT CHECK] Postgres error:', error);
      return false; // Assume no conflict on error
    }
    
    if (!techAppointments || techAppointments.length === 0) {
      return false;
    }
    
    const newStart = new Date(appointmentTime).getTime();
    const newEnd = newStart + (duration * 60 * 1000);
    
    // Check for overlaps
    for (const apt of techAppointments) {
      const existingStart = new Date(apt.appointment_time).getTime();
      const existingDuration = apt.estimated_duration || 60; // Default 60 min
      const existingEnd = existingStart + (existingDuration * 60 * 1000);
      
      // Check if time ranges overlap
      const hasOverlap = (newStart < existingEnd && newEnd > existingStart);
      if (hasOverlap) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ [TIME CONFLICT CHECK] Error:', error);
    return false; // Assume no conflict on error
  }
}

// Helper: Get service details for appointment (still uses KV for service menu)
async function getServiceDetails(serviceIds: string[]): Promise<any[]> {
  try {
    // Note: Service menu is still in KV Store (settings:service-menu)
    // This is OK because we're not migrating service menu to Postgres yet
    const { kvAdmin: kv } = await import('./_shared_kv.tsx');
    const serviceMenu = await kv.get('settings:service-menu') || {};
    const services: any[] = [];
    
    // Extract all services from all categories
    Object.values(serviceMenu).forEach((category: any) => {
      if (category.groups) {
        category.groups.forEach((group: any) => {
          if (group.items) {
            group.items.forEach((item: any) => {
              services.push(item);
            });
          }
        });
      }
    });
    
    // Find matching services
    return serviceIds
      .map(id => services.find(s => s.id === id || s.name === id))
      .filter(s => s !== undefined);
  } catch (error) {
    console.error('❌ [GET SERVICE DETAILS] Error:', error);
    return [];
  }
}

/**
 * Calculate technician score for appointment
 * Returns 0-100 score (0 = cannot assign, 100 = perfect match)
 */
async function calculateTechnicianScore(
  technician: any,
  appointment: any,
  allTechnicians: any[]
): Promise<number> {
  let score = 0;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. AVAILABILITY CHECK (Must Pass)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const appointmentDay = getDayOfWeek(appointment.appointment_time);
  
  // Check working days
  if (!technician.working_days || !technician.working_days.includes(appointmentDay)) {
    console.log(`⏸️ [SCORE] ${technician.name}: Not working on ${appointmentDay}`);
    return 0; // Cannot assign - not working this day
  }
  
  // Check if currently unavailable
  if (technician.is_available === false) {
    const unavailableUntil = technician.unavailable_until 
      ? new Date(technician.unavailable_until) 
      : null;
    
    if (!unavailableUntil || unavailableUntil > new Date(appointment.appointment_time)) {
      console.log(`⏸️ [SCORE] ${technician.name}: Currently unavailable`);
      return 0; // Cannot assign - unavailable
    }
  }
  
  // Check for time conflicts
  const duration = appointment.estimated_duration || 60;
  const hasConflict = await hasTimeConflict(
    technician.id,
    appointment.appointment_time,
    duration
  );
  
  if (hasConflict) {
    console.log(`⏸️ [SCORE] ${technician.name}: Time conflict detected`);
    return 0; // Cannot assign - already booked
  }
  
  // Availability passed: +40 base points
  score += 40;
  console.log(`✅ [SCORE] ${technician.name}: Available (+40) = ${score}`);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. SKILL MATCH (0-30 points)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (appointment.service_names && appointment.service_names.length > 0) {
    const techSpecialties = technician.specialties || [];
    const servicesNeeded = appointment.service_names;
    
    // Count how many services match technician specialties
    let matchCount = 0;
    servicesNeeded.forEach((serviceName: string) => {
      const hasMatch = techSpecialties.some((specialty: string) => 
        serviceName.toLowerCase().includes(specialty.toLowerCase()) ||
        specialty.toLowerCase().includes(serviceName.toLowerCase())
      );
      if (hasMatch) matchCount++;
    });
    
    const skillMatchRatio = servicesNeeded.length > 0 
      ? matchCount / servicesNeeded.length 
      : 0;
    const skillPoints = Math.round(skillMatchRatio * 30);
    score += skillPoints;
    
    console.log(`🎯 [SCORE] ${technician.name}: Skill match ${matchCount}/${servicesNeeded.length} (+${skillPoints}) = ${score}`);
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. RATING (0-15 points)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const rating = technician.rating || 4.0; // Default to 4.0 if not set
  const ratingPoints = Math.round((rating / 5) * 15);
  score += ratingPoints;
  
  console.log(`⭐ [SCORE] ${technician.name}: Rating ${rating}/5 (+${ratingPoints}) = ${score}`);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. INCOME BALANCE (0-15 points)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const allIncomes = allTechnicians.map(t => t.total_income || 0);
  const avgIncome = allIncomes.length > 0 
    ? allIncomes.reduce((a, b) => a + b, 0) / allIncomes.length 
    : 0;
  const techIncome = technician.total_income || 0;
  
  // If below average, get bonus points (fair distribution)
  if (techIncome < avgIncome && avgIncome > 0) {
    const incomeDiff = avgIncome - techIncome;
    const incomeRatio = incomeDiff / avgIncome;
    const incomePoints = Math.min(Math.round(incomeRatio * 15), 15);
    score += incomePoints;
    
    console.log(`💰 [SCORE] ${technician.name}: Income balance (+${incomePoints}) = ${score}`);
  }
  
  return Math.round(score);
}

// POST /appointments/:id/auto-assign - Auto-assign best technician
app.post('/:appointmentId/auto-assign', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!hasAssignPermission(currentUser)) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: You do not have permission to assign technicians' 
      }, 403);
    }
    
    const appointmentId = c.req.param('appointmentId');
    
    // Get appointment from Postgres
    const { data: appointment, error: apptError } = await supabase
      .from('appointment_info')
      .select('*')
      .eq('id', appointmentId)
      .maybeSingle();
    
    if (apptError) {
      console.error('❌ [AUTO-ASSIGN] Postgres error:', apptError);
      throw apptError;
    }
    
    if (!appointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }
    
    console.log(`🤖 [AUTO-ASSIGN] Starting for appointment ${appointmentId}`);
    
    // Get all technicians from Postgres
    const { data: allTechnicians, error: techError } = await supabase
      .from('technician_info')
      .select('*');
    
    if (techError) {
      console.error('❌ [AUTO-ASSIGN] Postgres error:', techError);
      throw techError;
    }
    
    if (!allTechnicians || allTechnicians.length === 0) {
      return c.json({ 
        success: false, 
        error: 'No technicians available in the system' 
      }, 400);
    }
    
    console.log(`🤖 [AUTO-ASSIGN] Evaluating ${allTechnicians.length} technicians...`);
    
    // Calculate scores for all technicians
    const scoringPromises = allTechnicians.map(async (tech: any) => ({
      technician: tech,
      score: await calculateTechnicianScore(tech, appointment, allTechnicians)
    }));
    
    const scoredTechnicians = await Promise.all(scoringPromises);
    
    // Filter available (score > 0) and sort by score descending
    const availableTechnicians = scoredTechnicians
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    if (availableTechnicians.length === 0) {
      return c.json({ 
        success: false, 
        error: 'No available technicians found for this appointment time' 
      }, 400);
    }
    
    const bestMatch = availableTechnicians[0];
    
    console.log(`🏆 [AUTO-ASSIGN] Best match: ${bestMatch.technician.name} (Score: ${bestMatch.score})`);
    
    // Store previous assignment for log
    const previousTechnicianId = appointment.technician_id || null;
    
    // Get previous technician name if exists
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
        technician_id: bestMatch.technician.id,
        assignment_method: 'auto',
        assignment_score: bestMatch.score,
        last_assignment_change: new Date().toISOString(),
        assignment_change_count: (appointment.assignment_change_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ [AUTO-ASSIGN] Update error:', updateError);
      throw updateError;
    }
    
    // Create assignment log (this will write to Postgres after we refactor assignment-logs.tsx)
    await createAssignmentLog({
      appointmentId,
      fromTechnicianId: previousTechnicianId,
      fromTechnicianName: previousTechnicianName,
      toTechnicianId: bestMatch.technician.id,
      toTechnicianName: bestMatch.technician.name,
      reasonText: 'Initial auto-assignment by algorithm',
      reasonCategory: 'other',
      assignmentMethod: 'auto',
      assignmentScore: bestMatch.score,
      changedBy: currentUser.id || currentUser.email,
      changedByName: currentUser.name || currentUser.email || 'System',
      changedByRole: currentUser.role || 'system',
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });
    
    console.log(`✅ [AUTO-ASSIGN] Successfully assigned ${bestMatch.technician.name} to appointment ${appointmentId}`);
    
    return c.json({
      success: true,
      data: {
        appointment: updatedAppointment,
        assignedStaff: bestMatch.technician,
        score: bestMatch.score,
        method: 'auto',
      },
    });
  } catch (error: any) {
    console.error('❌ [AUTO-ASSIGN] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to auto-assign technician',
    }, 500);
  }
});

// GET /appointments/:id/available-technicians - List technicians with scores
app.get('/:appointmentId/available-technicians', requireAuth, async (c) => {
  try {
    const appointmentId = c.req.param('appointmentId');
    
    // Get appointment from Postgres
    const { data: appointment, error: apptError } = await supabase
      .from('appointment_info')
      .select('*')
      .eq('id', appointmentId)
      .maybeSingle();
    
    if (apptError) throw apptError;
    if (!appointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }
    
    // Get all technicians from Postgres
    const { data: allTechnicians, error: techError } = await supabase
      .from('technician_info')
      .select('*');
    
    if (techError) throw techError;
    
    console.log(`📋 [AVAILABLE TECHS] Scoring ${allTechnicians?.length || 0} technicians for appointment ${appointmentId}`);
    
    // Calculate scores for all
    const scoringPromises = (allTechnicians || []).map(async (tech: any) => {
      const score = await calculateTechnicianScore(tech, appointment, allTechnicians || []);
      
      // Determine availability status
      let availability = 'available';
      let nextAvailable = null;
      
      if (score === 0) {
        // Check why unavailable
        const appointmentDay = getDayOfWeek(appointment.appointment_time);
        if (!tech.working_days || !tech.working_days.includes(appointmentDay)) {
          availability = 'not_working';
        } else if (tech.is_available === false) {
          availability = 'unavailable';
          nextAvailable = tech.unavailable_until || null;
        } else {
          availability = 'busy'; // Time conflict
        }
      }
      
      // Get skill matches
      const techSpecialties = tech.specialties || [];
      const serviceNames = appointment.service_names || [];
      const skillMatch = serviceNames.filter((svc: string) =>
        techSpecialties.some((sp: string) => 
          svc.toLowerCase().includes(sp.toLowerCase()) ||
          sp.toLowerCase().includes(svc.toLowerCase())
        )
      );
      
      return {
        staff: tech,
        score,
        availability,
        skillMatch,
        nextAvailable,
        rating: tech.rating || 4.0,
      };
    });
    
    const scoredTechnicians = await Promise.all(scoringPromises);
    
    // Sort by score descending
    const sortedTechnicians = scoredTechnicians.sort((a, b) => b.score - a.score);
    
    console.log(`✅ [AVAILABLE TECHS] Returning ${sortedTechnicians.length} technicians with scores`);
    
    return c.json({
      success: true,
      data: sortedTechnicians,
    });
  } catch (error: any) {
    console.error('❌ [AVAILABLE TECHS] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch available technicians',
    }, 500);
  }
});

// PUT /appointments/:id/assign-technician - Manual assignment
app.put('/:appointmentId/assign-technician', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!hasAssignPermission(currentUser)) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: You do not have permission to assign technicians' 
      }, 403);
    }
    
    const appointmentId = c.req.param('appointmentId');
    const body = await c.req.json();
    const { technicianId, reasonId, customReason, overrideConflict } = body;
    
    // Validation
    if (!technicianId) {
      return c.json({ success: false, error: 'technicianId is required' }, 400);
    }
    
    if (!reasonId && !customReason) {
      return c.json({ 
        success: false, 
        error: 'Either reasonId or customReason is required' 
      }, 400);
    }
    
    // Get appointment from Postgres
    const { data: appointment, error: apptError } = await supabase
      .from('appointment_info')
      .select('*')
      .eq('id', appointmentId)
      .maybeSingle();
    
    if (apptError) throw apptError;
    if (!appointment) {
      return c.json({ success: false, error: 'Appointment not found' }, 404);
    }
    
    // Get technician from Postgres
    const { data: technician, error: techError } = await supabase
      .from('technician_info')
      .select('*')
      .eq('id', technicianId)
      .maybeSingle();
    
    if (techError) throw techError;
    if (!technician) {
      return c.json({ success: false, error: 'Technician not found' }, 404);
    }
    
    console.log(`👤 [MANUAL ASSIGN] Assigning ${technician.name} to appointment ${appointmentId}`);
    
    // Check for conflicts (unless override)
    if (!overrideConflict) {
      const duration = appointment.estimated_duration || 60;
      const hasConflict = await hasTimeConflict(
        technicianId,
        appointment.appointment_time,
        duration
      );
      
      if (hasConflict) {
        return c.json({ 
          success: false, 
          error: 'Technician has a time conflict. Set overrideConflict=true to force assign.',
          code: 'TIME_CONFLICT'
        }, 409);
      }
    }
    
    // Get reason details (from KV - assignment reasons still in KV)
    let reasonText = customReason || '';
    let reasonCategory = 'other';
    
    if (reasonId) {
      const { kvAdmin: kv } = await import('./_shared_kv.tsx');
      const reason = await kv.get(reasonId);
      if (reason) {
        reasonText = reason.text;
        reasonCategory = reason.category;
      }
    }
    
    // Validate custom reason length
    if (customReason && customReason.length > 500) {
      return c.json({ 
        success: false, 
        error: 'Custom reason too long (max 500 characters)' 
      }, 400);
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
        technician_id: technician.id,
        assignment_method: 'manual',
        assignment_score: null, // No score for manual
        last_assignment_change: new Date().toISOString(),
        assignment_change_count: (appointment.assignment_change_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    // Create assignment log
    const changeLog = await createAssignmentLog({
      appointmentId,
      fromTechnicianId: previousTechnicianId,
      fromTechnicianName: previousTechnicianName,
      toTechnicianId: technician.id,
      toTechnicianName: technician.name,
      reasonId: reasonId || undefined,
      reasonText,
      reasonCategory,
      customReason: customReason || undefined,
      assignmentMethod: 'manual',
      changedBy: currentUser.id || currentUser.email,
      changedByName: currentUser.name || currentUser.email,
      changedByRole: currentUser.role,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });
    
    console.log(`✅ [MANUAL ASSIGN] Successfully assigned ${technician.name} to appointment ${appointmentId}`);
    console.log(`📝 [MANUAL ASSIGN] Reason: ${reasonText}`);
    
    return c.json({
      success: true,
      data: {
        appointment: updatedAppointment,
        changeLog,
      },
    });
  } catch (error: any) {
    console.error('❌ [MANUAL ASSIGN] Error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to assign technician',
    }, 500);
  }
});

console.log('✅ Technician Assignment module initialized');

export default app;