import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { requireAuth } from './helpers.tsx';

const app = new Hono();

// Default reasons seeded on first load
const DEFAULT_REASONS = [
  {
    text: "Customer requested specific technician",
    category: "customer_request",
    displayOrder: 1
  },
  {
    text: "Original technician unavailable",
    category: "availability",
    displayOrder: 2
  },
  {
    text: "Better skill match for service type",
    category: "skill_match",
    displayOrder: 3
  },
  {
    text: "Emergency technician absence",
    category: "emergency",
    displayOrder: 4
  },
  {
    text: "Load balancing across team",
    category: "other",
    displayOrder: 5
  },
  {
    text: "Customer complaint about previous technician",
    category: "customer_request",
    displayOrder: 6
  },
  {
    text: "Technician requested schedule change",
    category: "availability",
    displayOrder: 7
  },
  {
    text: "Service requires specialized skills",
    category: "skill_match",
    displayOrder: 8
  }
];

// Helper: Check if user has permission to manage reasons
function hasManagePermission(user: any): boolean {
  return (
    user.role === 'owner' ||
    user.role === 'admin' ||
    user.permissions?.includes('manage_settings')
  );
}

// Helper: Seed default reasons if none exist
async function seedDefaultReasonsIfNeeded() {
  try {
    const existingReasons = await kv.getByPrefix('assignment-reason:');
    
    if (existingReasons.length === 0) {
      console.log('🌱 [ASSIGNMENT REASONS] Seeding default reasons...');
      
      for (const reason of DEFAULT_REASONS) {
        const reasonId = `assignment-reason:${Date.now()}${Math.random()}`;
        await kv.set(reasonId, {
          id: reasonId,
          text: reason.text,
          category: reason.category,
          displayOrder: reason.displayOrder,
          isActive: true,
          createdBy: 'system',
          createdByName: 'System',
          createdAt: new Date().toISOString(),
        });
      }
      
      console.log(`✅ [ASSIGNMENT REASONS] Seeded ${DEFAULT_REASONS.length} default reasons`);
    }
  } catch (error) {
    console.error('❌ [ASSIGNMENT REASONS] Seeding error:', error);
  }
}

// Initialize: Seed default reasons
seedDefaultReasonsIfNeeded();

// GET /assignment-reasons - List all active reasons (PUBLIC - no auth required)
app.get('/', async (c) => {
  try {
    const reasons = await kv.getByPrefix('assignment-reason:');
    
    // Filter active reasons and sort by displayOrder
    const activeReasons = reasons
      .filter((r: any) => r.isActive !== false)
      .sort((a: any, b: any) => (a.displayOrder || 999) - (b.displayOrder || 999));
    
    console.log(`✅ [ASSIGNMENT REASONS] Retrieved ${activeReasons.length} active reasons`);
    
    return c.json({
      success: true,
      data: activeReasons,
    });
  } catch (error: any) {
    console.error('❌ [ASSIGNMENT REASONS] List error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch assignment reasons',
    }, 500);
  }
});

// GET /assignment-reasons/all - List ALL reasons (including inactive) - Admin only
app.get('/all', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!hasManagePermission(currentUser)) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: Only admins can view all reasons including inactive' 
      }, 403);
    }
    
    const reasons = await kv.getByPrefix('assignment-reason:');
    
    // Sort by displayOrder
    const sortedReasons = reasons
      .sort((a: any, b: any) => (a.displayOrder || 999) - (b.displayOrder || 999));
    
    console.log(`✅ [ASSIGNMENT REASONS] Retrieved ${sortedReasons.length} total reasons (admin view)`);
    
    return c.json({
      success: true,
      data: sortedReasons,
    });
  } catch (error: any) {
    console.error('❌ [ASSIGNMENT REASONS] List all error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch all assignment reasons',
    }, 500);
  }
});

// POST /assignment-reasons - Create new reason (Admin/Owner only)
app.post('/', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!hasManagePermission(currentUser)) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: Only admins can create assignment reasons' 
      }, 403);
    }
    
    const body = await c.req.json();
    const { text, category, displayOrder } = body;
    
    // Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return c.json({ success: false, error: 'Reason text is required' }, 400);
    }
    
    if (text.trim().length > 500) {
      return c.json({ success: false, error: 'Reason text too long (max 500 chars)' }, 400);
    }
    
    const validCategories = ['customer_request', 'availability', 'skill_match', 'emergency', 'other'];
    if (category && !validCategories.includes(category)) {
      return c.json({ 
        success: false, 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      }, 400);
    }
    
    // Create reason
    const reasonId = `assignment-reason:${Date.now()}`;
    const newReason = {
      id: reasonId,
      text: text.trim(),
      category: category || 'other',
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : 999,
      isActive: true,
      createdBy: currentUser.id || currentUser.email,
      createdByName: currentUser.name || currentUser.email,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(reasonId, newReason);
    
    console.log(`✅ [ASSIGNMENT REASONS] Created reason: ${reasonId}`);
    
    return c.json({
      success: true,
      data: newReason,
    }, 201);
  } catch (error: any) {
    console.error('❌ [ASSIGNMENT REASONS] Create error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to create assignment reason',
    }, 500);
  }
});

// PUT /assignment-reasons/:id - Update reason
app.put('/:id', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!hasManagePermission(currentUser)) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: Only admins can update assignment reasons' 
      }, 403);
    }
    
    const reasonId = c.req.param('id');
    const body = await c.req.json();
    const { text, category, displayOrder, isActive } = body;
    
    // Get existing reason
    const existingReason = await kv.get(reasonId);
    if (!existingReason) {
      return c.json({ success: false, error: 'Reason not found' }, 404);
    }
    
    // Validation
    if (text !== undefined) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return c.json({ success: false, error: 'Reason text cannot be empty' }, 400);
      }
      if (text.trim().length > 500) {
        return c.json({ success: false, error: 'Reason text too long (max 500 chars)' }, 400);
      }
    }
    
    if (category !== undefined) {
      const validCategories = ['customer_request', 'availability', 'skill_match', 'emergency', 'other'];
      if (!validCategories.includes(category)) {
        return c.json({ 
          success: false, 
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
        }, 400);
      }
    }
    
    // Update reason
    const updatedReason = {
      ...existingReason,
      text: text !== undefined ? text.trim() : existingReason.text,
      category: category !== undefined ? category : existingReason.category,
      displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : existingReason.displayOrder,
      isActive: isActive !== undefined ? isActive : existingReason.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id || currentUser.email,
      updatedByName: currentUser.name || currentUser.email,
    };
    
    await kv.set(reasonId, updatedReason);
    
    console.log(`✅ [ASSIGNMENT REASONS] Updated reason: ${reasonId}`);
    
    return c.json({
      success: true,
      data: updatedReason,
    });
  } catch (error: any) {
    console.error('❌ [ASSIGNMENT REASONS] Update error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to update assignment reason',
    }, 500);
  }
});

// DELETE /assignment-reasons/:id - Soft delete (set isActive = false)
app.delete('/:id', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!hasManagePermission(currentUser)) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: Only admins can delete assignment reasons' 
      }, 403);
    }
    
    const reasonId = c.req.param('id');
    
    // Get existing reason
    const existingReason = await kv.get(reasonId);
    if (!existingReason) {
      return c.json({ success: false, error: 'Reason not found' }, 404);
    }
    
    // Soft delete (set isActive = false)
    const deletedReason = {
      ...existingReason,
      isActive: false,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser.id || currentUser.email,
      deletedByName: currentUser.name || currentUser.email,
    };
    
    await kv.set(reasonId, deletedReason);
    
    console.log(`✅ [ASSIGNMENT REASONS] Soft deleted reason: ${reasonId}`);
    
    return c.json({
      success: true,
      message: 'Reason deactivated successfully',
    });
  } catch (error: any) {
    console.error('❌ [ASSIGNMENT REASONS] Delete error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to delete assignment reason',
    }, 500);
  }
});

// PUT /assignment-reasons/reorder - Batch update displayOrder (for drag & drop)
app.put('/reorder', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!hasManagePermission(currentUser)) {
      return c.json({ 
        success: false, 
        error: 'Unauthorized: Only admins can reorder assignment reasons' 
      }, 403);
    }
    
    const body = await c.req.json();
    const { reasons } = body;
    
    if (!Array.isArray(reasons)) {
      return c.json({ success: false, error: 'Reasons must be an array' }, 400);
    }
    
    // Update displayOrder for each reason
    const updatePromises = reasons.map(async (item: any, index: number) => {
      const existingReason = await kv.get(item.id);
      if (existingReason) {
        const updatedReason = {
          ...existingReason,
          displayOrder: index,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.id || currentUser.email,
        };
        await kv.set(item.id, updatedReason);
        return updatedReason;
      }
      return null;
    });
    
    const updatedReasons = await Promise.all(updatePromises);
    const successfulUpdates = updatedReasons.filter(r => r !== null);
    
    console.log(`✅ [ASSIGNMENT REASONS] Reordered ${successfulUpdates.length} reasons`);
    
    return c.json({
      success: true,
      data: successfulUpdates,
    });
  } catch (error: any) {
    console.error('❌ [ASSIGNMENT REASONS] Reorder error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to reorder assignment reasons',
    }, 500);
  }
});

console.log('✅ Assignment Reasons module initialized');

export default app;