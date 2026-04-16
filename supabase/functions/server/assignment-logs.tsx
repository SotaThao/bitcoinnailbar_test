import { Hono } from 'npm:hono';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { requireAuth } from './helpers.tsx';

const app = new Hono();
const supabase = getSupabaseClient();

// Helper: Create assignment change log (NOW WRITES TO POSTGRES!)
export async function createAssignmentLog(params: {
  appointmentId: string;
  fromTechnicianId: string | null;
  fromTechnicianName: string | null;
  toTechnicianId: string;
  toTechnicianName: string;
  reasonId?: string;
  reasonText: string;
  reasonCategory: string;
  customReason?: string;
  assignmentMethod: 'auto' | 'manual';
  assignmentScore?: number;
  changedBy: string;
  changedByName: string;
  changedByRole: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const logEntry = {
      appointment_id: params.appointmentId,
      
      // Change details
      from_technician_id: params.fromTechnicianId,
      from_technician_name: params.fromTechnicianName,
      to_technician_id: params.toTechnicianId,
      to_technician_name: params.toTechnicianName,
      
      // Reason tracking
      reason_id: params.reasonId || null,
      reason_text: params.reasonText,
      reason_category: params.reasonCategory,
      custom_reason: params.customReason || null,
      
      // Assignment method
      assignment_method: params.assignmentMethod,
      assignment_score: params.assignmentScore || null,
      
      // User tracking
      changed_by: params.changedBy,
      changed_by_name: params.changedByName,
      changed_by_role: params.changedByRole,
      
      // Metadata
      timestamp: new Date().toISOString(),
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    };
    
    // Insert into Postgres assignment_change_log table
    const { data, error } = await supabase
      .from('assignment_change_log')
      .insert(logEntry)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// GET /assignment-logs/appointment/:appointmentId - Get all logs for specific appointment
app.get('/appointment/:appointmentId', requireAuth, async (c) => {
  try {
    const appointmentId = c.req.param('appointmentId');
    
    // Get all logs for this appointment from Postgres
    const { data: logs, error } = await supabase
      .from('assignment_change_log')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      data: logs || [],
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch assignment logs',
    }, 500);
  }
});

// GET /assignment-logs/recent - Get recent assignment changes (admin view)
app.get('/recent', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Check permission
    const hasPermission = 
      currentUser.role === 'owner' ||
      currentUser.role === 'admin' ||
      currentUser.permissions?.includes('view_reports') ||
      currentUser.permissions?.includes('manage_bookings');
    
    if (!hasPermission) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: You do not have permission to view assignment logs' 
      }, 403);
    }
    
    // Get query params
    const limit = parseInt(c.req.query('limit') || '50');
    const technicianId = c.req.query('technicianId');
    const changedBy = c.req.query('changedBy');
    
    // Build Postgres query
    let query = supabase
      .from('assignment_change_log')
      .select('*', { count: 'exact' });
    
    // Filter by technician if provided
    if (technicianId) {
      query = query.or(`to_technician_id.eq.${technicianId},from_technician_id.eq.${technicianId}`);
    }
    
    // Filter by changedBy if provided
    if (changedBy) {
      query = query.eq('changed_by', changedBy);
    }
    
    // Sort and limit
    query = query
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    const { data: logs, error, count } = await query;
    
    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      data: logs || [],
      total: count || 0,
      limit: limit,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch recent assignment logs',
    }, 500);
  }
});

// GET /assignment-logs/stats - Get assignment statistics
app.get('/stats', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    // Check permission
    const hasPermission = 
      currentUser.role === 'owner' ||
      currentUser.role === 'admin' ||
      currentUser.permissions?.includes('view_reports');
    
    if (!hasPermission) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: You do not have permission to view assignment statistics' 
      }, 403);
    }
    
    // Get all logs from Postgres
    const { data: allLogs, error } = await supabase
      .from('assignment_change_log')
      .select('*');
    
    if (error) {
      throw error;
    }

    const logs = allLogs || [];
    
    // Calculate statistics
    const totalChanges = logs.length;
    const autoAssignments = logs.filter((log: any) => log.assignment_method === 'auto').length;
    const manualAssignments = logs.filter((log: any) => log.assignment_method === 'manual').length;
    
    // Reason breakdown
    const reasonCounts: Record<string, number> = {};
    logs.forEach((log: any) => {
      const category = log.reason_category || 'other';
      reasonCounts[category] = (reasonCounts[category] || 0) + 1;
    });
    
    // Most active users (who made most changes)
    const userChangeCounts: Record<string, { count: number; name: string }> = {};
    logs.forEach((log: any) => {
      const userId = log.changed_by;
      if (!userChangeCounts[userId]) {
        userChangeCounts[userId] = { count: 0, name: log.changed_by_name };
      }
      userChangeCounts[userId].count++;
    });
    
    const topUsers = Object.entries(userChangeCounts)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Average assignment score (for auto-assignments)
    const autoLogsWithScore = logs.filter((log: any) => 
      log.assignment_method === 'auto' && log.assignment_score !== null
    );
    const avgScore = autoLogsWithScore.length > 0
      ? autoLogsWithScore.reduce((sum: number, log: any) => sum + log.assignment_score, 0) / autoLogsWithScore.length
      : 0;
    
    const stats = {
      totalChanges,
      autoAssignments,
      manualAssignments,
      autoAssignmentRate: totalChanges > 0 ? (autoAssignments / totalChanges * 100).toFixed(1) : 0,
      reasonBreakdown: reasonCounts,
      topUsers,
      averageAutoAssignScore: avgScore.toFixed(1),
    };

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch assignment statistics',
    }, 500);
  }
});

export default app;