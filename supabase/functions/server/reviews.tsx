/**
 * REVIEWS MODULE
 * Phase 2.4 - Extracted from index.tsx (Wave 1 Complete!)
 * 
 * Routes:
 * - GET  /reviews - List all reviews
 * - POST /reviews - Create review
 * 
 * KV Table: kv_store_89edbd69 (admin)
 * KV Prefix: review:
 * 
 * Special Logic: None (simple CRUD)
 */

import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';

const app = new Hono();

// ========== GET ALL REVIEWS ==========
app.get('/make-server-84f9c112/reviews', async (c) => {
  try {
    const reviews = await kv.getByPrefix('review:');
    return c.json({ success: true, data: reviews });
  } catch (e) {
    return c.json({ success: false, error: String(e) }, 500);
  }
});

// ========== CREATE REVIEW ==========
app.post('/make-server-84f9c112/reviews', async (c) => {
  try {
    const body = await c.req.json();
    const id = `review:${Date.now()}`;
    const review = {
      id,
      ...body,
      createdAt: new Date().toISOString()
    };

    await kv.set(id, review);

    return c.json({ success: true, data: review });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app as reviewsApp };
