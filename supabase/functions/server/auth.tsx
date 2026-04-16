import { Hono } from 'npm:hono@4';
import { 
  kv, 
  generateJWT, 
  verifyJWT, 
  hashPassword, 
  verifyPassword,
  requireAuth,
  type User,
  type Permissions
} from './helpers.tsx';

const app = new Hono();

// ========== AUTHENTICATION ROUTES ==========

// Login
app.post('/make-server-84f9c112/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Trim and normalize email
    const cleanEmail = email.trim().toLowerCase();

    // Find user by email - Check both prefixes to be safe
    const usersColon = await kv.getByPrefix('user:');
    const usersHash = await kv.getByPrefix('user#');
    
    // Combine and find all matching users
    const allUsers = [...usersColon, ...usersHash];
    const matchingUsers = allUsers.filter((u: User) => u?.email?.toLowerCase() === cleanEmail);

    if (matchingUsers.length === 0) {
      return c.json({ success: false, error: 'Invalid email or password' }, 401);
    }

    // Try to find ONE user with a valid password
    let validUser = null;

    for (const user of matchingUsers) {
      // Check if user is active
      if (!user.is_active) {
        continue;
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (isPasswordValid) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      // If we found users but none had valid password
      // Check if any were inactive which might be the reason, otherwise invalid password
      const hasInactive = matchingUsers.some(u => !u.is_active);
      if (hasInactive && matchingUsers.every(u => !u.is_active || !verifyPassword(password, u.password_hash))) {
         return c.json({ success: false, error: 'Account is inactive' }, 403);
      }

      return c.json({ success: false, error: 'Invalid email or password' }, 401);
    }

    const user = validUser;

    // Load permissions
    const permissions = await kv.get(`permissions:${user.id}`);
    user.permissions = permissions;

    // Generate JWT token
    const token = await generateJWT(user);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update last login - Use the ID from the VALID user
    await kv.set(`user:${user.id}`, {
      ...user,
      last_login: now.toISOString(),
    });

    // Return JWT and user (without password)
    const { password_hash: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      data: {
        token, // This is now a JWT
        expires_at: expiresAt.toISOString(),
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Verify JWT session
app.get('/make-server-84f9c112/auth/verify', async (c) => {
  try {
    // Check for custom session token first
    let token = c.req.header('X-Session-Token');
    const authHeader = c.req.header('Authorization');

    if (!token && authHeader) {
      token = authHeader.replace('Bearer ', '');
    }

    if (!token) {
      return c.json({ success: false, error: 'Missing authorization header' }, 401);
    }

    // Verify JWT and decode payload
    const payload = await verifyJWT(token);

    if (!payload) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }

    // Get fresh user data from KV to ensure user is still active
    let user = await kv.get(`user:${payload.sub}`);
    if (!user) {
      user = await kv.get(`user#${payload.sub}`);
    }

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    if (!user.is_active) {
      return c.json({ success: false, error: 'Account is inactive' }, 403);
    }

    // Return user without password + JWT payload
    const { password_hash: _, ...userWithoutPassword } = user;

    return c.json({
      success: true,
      data: {
        user: userWithoutPassword,
        payload: payload, // Include JWT claims (permissions, etc.)
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Logout
app.post('/make-server-84f9c112/auth/logout', async (c) => {
  try {
    let token = c.req.header('X-Session-Token');
    const authHeader = c.req.header('Authorization');

    if (!token && authHeader) {
      token = authHeader.replace('Bearer ', '');
    }

    if (!token) {
      return c.json({ success: false, error: 'No token provided' }, 401);
    }

    // Delete session from KV
    await kv.mdel([`session:${token}`]);

    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== USER MANAGEMENT ROUTES (OWNER ONLY) ==========

// Get all users (Owner only)
app.get('/make-server-84f9c112/users', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can list users
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can view users' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    
    // Remove password_hash from all users
    const sanitizedUsers = users.map((user: User) => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return c.json({
      success: true,
      data: sanitizedUsers,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create new user (Owner only)
app.post('/make-server-84f9c112/users', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can create users
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can create users' }, 403);
    }

    const { email, password, full_name, phone, role } = await c.req.json();

    // Validate input
    if (!email || !password || !full_name || !role) {
      return c.json({ success: false, error: 'Missing required fields: email, password, full_name, role' }, 400);
    }

    // Validate role - Allow custom roles
    // Check if it's a built-in role or custom role exists
    const builtInRoles = ['admin', 'staff'];
    if (!builtInRoles.includes(role)) {
      // Check if custom role exists
      const roles = await kv.getByPrefix('role:');
      const roleExists = roles.some((r: any) => r.name.toLowerCase() === role.toLowerCase());
      
      if (!roleExists) {
        return c.json({ 
          success: false, 
          error: `Role '${role}' does not exist. Please use 'admin', 'staff', or create a custom role first.` 
        }, 400);
      }
    }

    // Check if email already exists
    const users = await kv.getByPrefix('user#');
    const emailExists = users.some((user: User) => user.email === email);
    if (emailExists) {
      return c.json({ success: false, error: 'Email already in use' }, 400);
    }

    // Generate user ID
    const userId = crypto.randomUUID();

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user record
    const newUser: User = {
      id: userId,
      email,
      full_name,
      phone,
      role,
      is_active: true,
      password_hash,
      created_at: new Date().toISOString(),
      created_by: currentUser.sub, // Owner's ID from JWT
    };

    await kv.set(`user:${userId}`, newUser);

    // Create default permissions based on role
    const permissions: Permissions = {
      user_id: userId,
      can_manage_services: role === 'admin',
      can_manage_staff: role === 'admin',
      can_view_reports: role === 'admin',
      can_manage_appointments: true, // Both admin and staff
      can_process_payments: true, // Both admin and staff
      can_view_analytics: role === 'admin',
      can_manage_settings: false, // Only owner
    };

    await kv.set(`permissions:${userId}`, permissions);

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return c.json({
      success: true,
      data: {
        user: userWithoutPassword,
        permissions,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user info (Owner only)
app.put('/make-server-84f9c112/users/:id', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can update users
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can update users' }, 403);
    }

    const userId = c.req.param('id');
    const { email, full_name, phone, role, password } = await c.req.json();

    // Get existing user
    let user = await kv.get(`user:${userId}`);
    if (!user) {
      user = await kv.get(`user#${userId}`);
    }
    if (user.role === 'owner') {
      return c.json({ success: false, error: 'Cannot modify owner account' }, 403);
    }

    // If changing email, check for duplicates
    if (email && email !== user.email) {
      const users = await kv.getByPrefix('user:');
      const emailExists = users.some((u: User) => u.email === email && u.id !== userId);
      if (emailExists) {
        return c.json({ success: false, error: 'Email already in use' }, 400);
      }
    }

    // Hash new password if provided
    let password_hash = user.password_hash;
    if (password) {
      password_hash = await hashPassword(password);
    }

    // Update user
    const updatedUser = {
      ...user,
      email: email || user.email,
      full_name: full_name || user.full_name,
      phone: phone !== undefined ? phone : user.phone,
      role: role || user.role,
      password_hash,
    };

    await kv.set(`user:${userId}`, updatedUser);

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = updatedUser;

    return c.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user permissions (Owner only)
app.put('/make-server-84f9c112/users/:id/permissions', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can update permissions
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can update permissions' }, 403);
    }

    const userId = c.req.param('id');
    const permissionUpdates = await c.req.json();

    // Get existing user
    let user = await kv.get(`user:${userId}`);
    if (!user) {
      user = await kv.get(`user#${userId}`);
    }
    if (user.role === 'owner') {
      return c.json({ success: false, error: 'Cannot modify owner permissions' }, 403);
    }

    // Get existing permissions
    const existingPermissions = await kv.get(`permissions:${userId}`) || {};

    // Update permissions
    const updatedPermissions: Permissions = {
      user_id: userId,
      can_manage_services: permissionUpdates.can_manage_services ?? existingPermissions.can_manage_services ?? false,
      can_manage_staff: permissionUpdates.can_manage_staff ?? existingPermissions.can_manage_staff ?? false,
      can_view_reports: permissionUpdates.can_view_reports ?? existingPermissions.can_view_reports ?? false,
      can_manage_appointments: permissionUpdates.can_manage_appointments ?? existingPermissions.can_manage_appointments ?? false,
      can_process_payments: permissionUpdates.can_process_payments ?? existingPermissions.can_process_payments ?? false,
      can_view_analytics: permissionUpdates.can_view_analytics ?? existingPermissions.can_view_analytics ?? false,
      can_manage_settings: false, // Always false for non-owner
    };

    await kv.set(`permissions:${userId}`, updatedPermissions);

    return c.json({
      success: true,
      data: updatedPermissions,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Deactivate user (Owner only)
app.post('/make-server-84f9c112/users/:id/deactivate', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can deactivate users
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can deactivate users' }, 403);
    }

    const userId = c.req.param('id');

    // Cannot deactivate self
    if (userId === currentUser.sub) {
      return c.json({ success: false, error: 'Cannot deactivate yourself' }, 403);
    }

    // Get existing user
    let user = await kv.get(`user:${userId}`);
    if (!user) {
      user = await kv.get(`user#${userId}`);
    }
    if (user.role === 'owner') {
      return c.json({ success: false, error: 'Cannot deactivate owner account' }, 403);
    }

    // Deactivate user
    const updatedUser = {
      ...user,
      is_active: false,
    };

    await kv.set(`user:${userId}`, updatedUser);

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = updatedUser;

    return c.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Activate user (Owner only)
app.post('/make-server-84f9c112/users/:id/activate', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only owner can activate users
    if (currentUser.role !== 'owner') {
      return c.json({ success: false, error: 'Only owner can activate users' }, 403);
    }

    const userId = c.req.param('id');

    // Get existing user
    let user = await kv.get(`user:${userId}`);
    if (!user) {
      user = await kv.get(`user#${userId}`);
    }
    const updatedUser = {
      ...user,
      is_active: true,
    };

    await kv.set(`user:${userId}`, updatedUser);

    // Return user without password
    const { password_hash: _, ...userWithoutPassword } = updatedUser;

    return c.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app };