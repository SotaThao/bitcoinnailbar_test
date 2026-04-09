import { Hono } from 'npm:hono@4.6.14';
import { kv, hashPassword } from './helpers.tsx';

const app = new Hono();

/**
 * POST /debug-check-user
 * Check if user exists and verify password
 * NO AUTH REQUIRED - for emergency recovery
 */
app.post('/make-server-84f9c112/debug-check-user', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Get user by email lookup
    const userKey = await kv.get(`user_email:${email.toLowerCase()}`);

    if (!userKey) {
      return c.json({
        success: false,
        found: false,
        message: 'Email not found in database',
      });
    }

    // Get user record
    const user = await kv.get(userKey);

    if (!user) {
      return c.json({
        success: false,
        found: false,
        message: 'User record not found',
      });
    }

    // Verify password if provided
    let passwordMatch = false;
    if (password) {
      const passwordHash = await hashPassword(password);
      passwordMatch = passwordHash === user.password_hash;
    }

    // Return user info (without password hash)
    return c.json({
      success: true,
      found: true,
      passwordMatch,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        created_by: user.created_by,
        last_login: user.last_login,
        permissions: user.permissions,
      },
      lookup_key: userKey,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app };
