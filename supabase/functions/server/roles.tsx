import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { requireAuth } from './helpers.tsx';

const app = new Hono();

// Available permissions in the system
export const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', name: 'View Dashboard', category: 'General' },
  { id: 'view_bookings', name: 'View Bookings', category: 'Bookings' },
  { id: 'manage_bookings', name: 'Manage Bookings', category: 'Bookings' },
  { id: 'cancel_bookings', name: 'Cancel Bookings', category: 'Bookings' },
  { id: 'view_customers', name: 'View Customers', category: 'Customers' },
  { id: 'manage_customers', name: 'Manage Customers', category: 'Customers' },
  { id: 'view_services', name: 'View Services', category: 'Services' },
  { id: 'manage_services', name: 'Manage Services', category: 'Services' },
  { id: 'view_staff', name: 'View Staff', category: 'Staff' },
  { id: 'manage_staff', name: 'Manage Staff Schedule', category: 'Staff' },
  { id: 'assign_technicians', name: 'Assign Technicians to Appointments', category: 'Staff' },
  { id: 'view_reports', name: 'View Reports', category: 'Reports' },
  { id: 'manage_reports', name: 'Manage Reports', category: 'Reports' },
  { id: 'view_memberships', name: 'View Memberships', category: 'Memberships' },
  { id: 'manage_memberships', name: 'Manage Memberships', category: 'Memberships' },
  { id: 'view_settings', name: 'View Settings', category: 'Settings' },
  { id: 'manage_settings', name: 'Manage Settings', category: 'Settings' },
];

// GET /roles - List all roles
app.get('/', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can list roles
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can view roles' }, 403);
    }

    // Get all roles from KV store
    const roles = await kv.getByPrefix('role:');
    
    // Sort by created_at desc
    const sortedRoles = roles.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({
      success: true,
      data: sortedRoles,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch roles',
    }, 500);
  }
});

// GET /roles/permissions - Get available permissions
app.get('/permissions', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can view permissions
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can view permissions' }, 403);
    }

    return c.json({
      success: true,
      data: AVAILABLE_PERMISSIONS,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to fetch permissions',
    }, 500);
  }
});

// POST /roles - Create new role
app.post('/', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can create roles
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can create roles' }, 403);
    }

    const body = await c.req.json();
    const { name, description, permissions } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ success: false, error: 'Role name is required' }, 400);
    }

    if (!Array.isArray(permissions)) {
      return c.json({ success: false, error: 'Permissions must be an array' }, 400);
    }

    // Check for duplicate role name
    const existingRoles = await kv.getByPrefix('role:');
    const duplicateName = existingRoles.find(
      (role) => role.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicateName) {
      return c.json({ success: false, error: 'Role name already exists' }, 400);
    }

    // Validate permissions
    const validPermissionIds = AVAILABLE_PERMISSIONS.map(p => p.id);
    const invalidPermissions = permissions.filter((p: string) => !validPermissionIds.includes(p));
    
    if (invalidPermissions.length > 0) {
      return c.json({ 
        success: false, 
        error: `Invalid permissions: ${invalidPermissions.join(', ')}` 
      }, 400);
    }

    // Create role
    const roleId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newRole = {
      id: roleId,
      name: name.trim(),
      description: description?.trim() || '',
      permissions: permissions,
      created_at: now,
      updated_at: now,
    };

    await kv.set(`role:${roleId}`, newRole);

    return c.json({
      success: true,
      data: newRole,
    }, 201);
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to create role',
    }, 500);
  }
});

// PUT /roles/:id - Update role
app.put('/:id', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can update roles
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can update roles' }, 403);
    }

    const roleId = c.req.param('id');
    const body = await c.req.json();
    const { name, description, permissions } = body;

    // Get existing role
    const existingRole = await kv.get(`role:${roleId}`);
    if (!existingRole) {
      return c.json({ success: false, error: 'Role not found' }, 404);
    }

    // Validation
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return c.json({ success: false, error: 'Role name cannot be empty' }, 400);
      }

      // Check for duplicate name (excluding current role)
      const allRoles = await kv.getByPrefix('role:');
      const duplicateName = allRoles.find(
        (role) => role.id !== roleId && role.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (duplicateName) {
        return c.json({ success: false, error: 'Role name already exists' }, 400);
      }
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return c.json({ success: false, error: 'Permissions must be an array' }, 400);
      }

      // Validate permissions
      const validPermissionIds = AVAILABLE_PERMISSIONS.map(p => p.id);
      const invalidPermissions = permissions.filter((p: string) => !validPermissionIds.includes(p));
      
      if (invalidPermissions.length > 0) {
        return c.json({ 
          success: false, 
          error: `Invalid permissions: ${invalidPermissions.join(', ')}` 
        }, 400);
      }
    }

    // Update role
    const updatedRole = {
      ...existingRole,
      name: name !== undefined ? name.trim() : existingRole.name,
      description: description !== undefined ? description?.trim() || '' : existingRole.description,
      permissions: permissions !== undefined ? permissions : existingRole.permissions,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`role:${roleId}`, updatedRole);

    return c.json({
      success: true,
      data: updatedRole,
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to update role',
    }, 500);
  }
});

// DELETE /roles/:id - Delete role
app.delete('/:id', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can delete roles
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can delete roles' }, 403);
    }

    const roleId = c.req.param('id');

    // Get existing role
    const existingRole = await kv.get(`role:${roleId}`);
    if (!existingRole) {
      return c.json({ success: false, error: 'Role not found' }, 404);
    }

    // Prevent deleting built-in roles
    if (existingRole.is_built_in) {
      return c.json({ 
        success: false, 
        error: 'Cannot delete built-in role' 
      }, 403);
    }

    // Check if role is assigned to any users
    const users = await kv.getByPrefix('user:');
    const usersWithRole = users.filter(user => user.role === existingRole.name.toLowerCase());

    if (usersWithRole.length > 0) {
      return c.json({ 
        success: false, 
        error: `Cannot delete role. ${usersWithRole.length} user(s) are currently assigned to this role.` 
      }, 400);
    }

    // Delete role
    await kv.del(`role:${roleId}`);

    return c.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Failed to delete role',
    }, 500);
  }
});

export default app;