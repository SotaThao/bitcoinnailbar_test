/**
 * SERVICES MODULE
 * Phase 2.3 - Extracted from index.tsx
 * 
 * Routes:
 * - GET    /services - List all services with booking count enrichment
 * - POST   /services - Create service
 * - DELETE /services/:id - Delete service
 * 
 * KV Table: kv_store_89edbd69 (admin) - NOTE: Currently in admin table
 * KV Prefix: service:
 * 
 * Special Logic:
 * - GET enriches services with booking count from appointments
 * - GET adds isOwnerRecommended flag
 * - GET sorts by booking count (descending)
 */

import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';
import { getSupabaseClient } from './_shared_supabase_client.tsx';
import { KV_TABLE_ADMIN } from './_shared_constants.tsx';

const app = new Hono();
const supabase = getSupabaseClient();

// ========== GET ALL SERVICES (WITH BOOKING COUNT) ==========
app.get('/make-server-84f9c112/services', async (c) => {
  try {
    const services = await kv.getByPrefix('service:');
    
    // Enrich with booking count and owner recommendation
    const allAppointments = await kv.getByPrefix('appointment:');
    const serviceBookingCount: Record<string, number> = {};
    
    allAppointments.forEach((appt: any) => {
      if (Array.isArray(appt.serviceIds)) {
        appt.serviceIds.forEach((serviceId: string) => {
          serviceBookingCount[serviceId] = (serviceBookingCount[serviceId] || 0) + 1;
        });
      }
    });
    
    const enrichedServices = services.map((s: any) => ({
      ...s,
      bookingCount: serviceBookingCount[s.id] || 0,
      isOwnerRecommended: s.owner_recommended === true
    })).sort((a, b) => b.bookingCount - a.bookingCount);
    
    return c.json({ success: true, data: enrichedServices });
  } catch (e) {
    return c.json({ success: false, error: String(e) }, 500);
  }
});

// ========== CREATE SERVICE ==========
app.post('/make-server-84f9c112/services', async (c) => {
  try {
    const body = await c.req.json();
    const id = `service:${Date.now()}`;
    const service = {
      id,
      ...body,
      createdAt: new Date().toISOString()
    };

    await kv.set(id, service);

    return c.json({ success: true, data: service });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========== DELETE SERVICE ==========
app.delete('/make-server-84f9c112/services/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Delete from KV store using direct Supabase delete
    const { error } = await supabase.from(KV_TABLE_ADMIN).delete().eq('key', id);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, message: 'Service deleted successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export { app as servicesApp };
