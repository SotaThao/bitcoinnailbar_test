/**
 * SETUP MODULE
 * Phase 2.1 - Extracted from index.tsx
 * 
 * Routes:
 * - GET  /health - Health check
 * - GET  /setup/check - Check if owner exists
 * - POST /setup/owner - Create owner account (one-time)
 */

import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';
import type { User, Permissions } from './helpers.tsx';

const app = new Hono();

// ========== HEALTH CHECK ==========
app.get("/make-server-84f9c112/health", (c) => {
  return c.json({ status: "ok", version: "v7-staff-management", timestamp: new Date().toISOString() });
});

// ========== SETUP ENDPOINTS ==========

// Check if owner exists
app.get('/make-server-84f9c112/setup/check', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    const hasOwner = users.some((user: User) => user.role === 'owner');
    
    console.log(`🔍 [SETUP CHECK] Owner exists: ${hasOwner}`);
    return c.json({ success: true, data: { has_owner: hasOwner } });
  } catch (error: any) {
    console.error('❌ [SETUP CHECK] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create owner account (one-time only)
app.post('/make-server-84f9c112/setup/owner', async (c) => {
  try {
    const { full_name, email, phone, password } = await c.req.json();

    // Validate required fields
    if (!full_name || !email || !password) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    // Check if owner already exists
    const users = await kv.getByPrefix('user:');
    const hasOwner = users.some((user: User) => user.role === 'owner');
    
    if (hasOwner) {
      return c.json({ success: false, error: 'Owner account already exists' }, 403);
    }

    // Check if email already exists
    const emailExists = users.some((user: User) => user.email === email);
    if (emailExists) {
      return c.json({ success: false, error: 'Email already in use' }, 400);
    }

    // Generate a simple user ID (in production, use UUID)
    const userId = `owner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Hash password using Web Crypto API (available in Deno)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create user record
    const user: User = {
      id: userId,
      email,
      full_name,
      phone,
      role: 'owner',
      is_active: true,
      password_hash, // Store hashed password
      created_at: new Date().toISOString(),
      created_by: userId, // self-created
    };

    await kv.set(`user:${userId}`, user);

    // Create owner permissions (full access)
    const permissions: Permissions = {
      user_id: userId,
      can_manage_services: true,
      can_manage_staff: true,
      can_view_reports: true,
      can_manage_appointments: true,
      can_process_payments: true,
      can_view_analytics: true,
      can_manage_settings: true,
    };

    await kv.set(`permissions:${userId}`, permissions);

    console.log(`✅ [CREATE OWNER] Owner created: ${email}`);
    
    // Return user without password_hash
    const { password_hash: _, ...userWithoutPassword } = user;
    
    return c.json({ 
      success: true, 
      data: { user: userWithoutPassword, permissions } 
    });
  } catch (error: any) {
    console.error('❌ [CREATE OWNER] Exception:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app as setupApp };
