/**
 * BRANCHES MODULE
 * Phase 2.2 - Extracted from index.tsx
 * 
 * Routes:
 * - GET    /branches - List all branches
 * - POST   /branches - Create branch
 * - DELETE /branches/:id - Delete branch
 * 
 * KV Table: kv_store_89edbd69 (admin)
 * KV Prefix: branch:
 */

import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { KV_TABLE_ADMIN } from './_shared_constants.tsx';

const app = new Hono();
const supabase = getSupabaseClient();

// ========== GET ALL BRANCHES ==========
app.get('/make-server-84f9c112/branches', async (c) => {
  try {
    const branches = await kv.getByPrefix('branch:');
    return c.json({ success: true, data: branches });
  } catch (e) {
    return c.json({ success: false, error: String(e) }, 500);
  }
});

// ========== CREATE BRANCH ==========
app.post('/make-server-84f9c112/branches', async (c) => {
  try {
    const body = await c.req.json();
    const id = `branch:${Date.now()}`;
    const branch = {
      id,
      ...body,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, branch);

    return c.json({ success: true, data: branch });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== DELETE BRANCH ==========
app.delete('/make-server-84f9c112/branches/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Delete from KV store using direct Supabase delete
    const { error } = await supabase.from(KV_TABLE_ADMIN).delete().eq('key', id);
    
    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app as branchesApp };
