import { Hono } from 'npm:hono@4.6.14';
import { kv } from './helpers.tsx';

const app = new Hono();

/**
 * GET /debug-users
 * List all users in database (for debugging/recovery)
 * NO AUTH REQUIRED - for emergency recovery
 */
app.get('/make-server-84f9c112/debug-users', async (c) => {
  try {
    // Get all user records with user: and user# prefixes
    const usersColon = await kv.getByPrefix('user:');
    const usersHash = await kv.getByPrefix('user#');
    const allUsers = [...usersColon, ...usersHash];

    // Filter out sensitive data (don't expose password hashes)
    const safeUsers = allUsers.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      last_login: user.last_login,
      permissions: user.permissions,
      has_password_hash: !!user.password_hash,
      password_hash_preview: user.password_hash?.substring(0, 10) + '...',
    }));

    return c.json({
      success: true,
      data: {
        total_users: safeUsers.length,
        users: safeUsers,
        table: 'kv_store_89edbd69',
        prefix: 'user:',
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app };