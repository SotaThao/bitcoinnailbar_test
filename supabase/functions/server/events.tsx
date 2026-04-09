/**
 * Events Management Module
 * Handles event CRUD operations and image uploads for public events display
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    }
  }
);

const KV_TABLE = "kv_store_84f9c112"; // Homepage/Public data table
const BUCKET_NAME = 'make-84f9c112-events';

// ============================================================================
// TYPES
// ============================================================================

interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format (YYYY-MM-DD)
  time: string; // HH:MM format
  location: string;
  buttonText: string; // NEW: CTA button text (required)
  buttonLink: string; // NEW: CTA button link (required)
  backgroundColor?: string; // NEW: Auto-preview background color
  textColor?: string; // NEW: Auto-preview text color
  imageUrl?: string;
  imagePath?: string; // Storage path for deletion
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Initialize bucket on startup
const initBucket = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });

      if (error) {
        if (error.statusCode === '409' || error.message?.includes('already exists')) {
          // already exists
        } else {
          // creation failed
        }
      } else {
        // created
      }
    } else {
      // Update bucket to public if needed
      try {
        const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
          public: true,
        });
        if (updateError) {
          // could not update
        }
      } catch (e) {
        // update skipped
      }
    }
  } catch (error) {
    // initialization error
  }
};

// Call init on module load
initBucket();

// Helper to validate admin JWT token
async function validateAdminToken(sessionToken: string | null): Promise<{ valid: boolean; userId?: string }> {
  if (!sessionToken) {
    return { valid: false };
  }

  try {
    // Import JWT verification from helpers
    const { verifyJWT } = await import('./helpers.tsx');

    const payload = await verifyJWT(sessionToken);

    // verifyJWT returns payload directly, or null if invalid
    if (!payload || !payload.userId) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: payload.userId,
    };
  } catch (error) {
    return { valid: false };
  }
}

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

// GET /events - Get all active events (public)
app.get('/make-server-84f9c112/events', async (c) => {
  try {
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('value')
      .like('key', 'event:%');
    
    if (error) {
      return c.json({ success: false, error: 'Failed to fetch events' }, 500);
    }

    const events = (data || [])
      .map(item => item.value as Event)
      .filter(event => event.isActive)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return c.json({ success: true, data: events });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

// GET /admin/events - Get all events including inactive (admin only)
app.get('/make-server-84f9c112/admin/events', async (c) => {
  const sessionToken = c.req.header('X-Session-Token');
  const { valid } = await validateAdminToken(sessionToken);
  
  if (!valid) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('value')
      .like('key', 'event:%');
    
    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    // Parse and sort by date (newest first)
    const events = (data || [])
      .map((d: any) => d.value)
      .sort((a: Event, b: Event) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return c.json({ success: true, data: events });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /admin/events - Create new event (admin only)
app.post('/make-server-84f9c112/admin/events', async (c) => {
  const sessionToken = c.req.header('X-Session-Token');
  const { valid } = await validateAdminToken(sessionToken);
  
  if (!valid) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const body = await c.req.json();
    const { title, description, date, time, location, imageUrl, imagePath, isActive, buttonText, buttonLink, backgroundColor, textColor } = body;
    
    // Validation
    if (!title || !description || !date || !time || !location || !buttonText || !buttonLink) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: title, description, date, time, location, buttonText, buttonLink' 
      }, 400);
    }
    
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();
    
    const newEvent: Event = {
      id: eventId,
      title,
      description,
      date,
      time,
      location,
      imageUrl: imageUrl || '',
      imagePath: imagePath || '',
      isActive: isActive !== undefined ? isActive : true,
      createdAt: now,
      updatedAt: now,
      buttonText,
      buttonLink,
      backgroundColor,
      textColor,
    };
    
    const { error } = await supabase
      .from(KV_TABLE)
      .upsert({ key: `event:${eventId}`, value: newEvent });
    
    if (error) {
      return c.json({ success: false, error: 'Failed to create event' }, 500);
    }

    return c.json({ success: true, data: newEvent }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /admin/events/:id - Update event (admin only)
app.put('/make-server-84f9c112/admin/events/:id', async (c) => {
  const sessionToken = c.req.header('X-Session-Token');
  const { valid } = await validateAdminToken(sessionToken);
  
  if (!valid) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const eventId = c.req.param('id');
    const body = await c.req.json();
    
    // Get existing event
    const { data: existingData, error: fetchError } = await supabase
      .from(KV_TABLE)
      .select('value')
      .eq('key', `event:${eventId}`)
      .maybeSingle();
    
    if (fetchError || !existingData) {
      return c.json({ success: false, error: 'Event not found' }, 404);
    }
    
    const existingEvent = existingData.value as Event;
    
    // Update event
    const updatedEvent: Event = {
      ...existingEvent,
      ...body,
      id: eventId, // Ensure ID doesn't change
      createdAt: existingEvent.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from(KV_TABLE)
      .upsert({ key: `event:${eventId}`, value: updatedEvent });
    
    if (error) {
      return c.json({ success: false, error: 'Failed to update event' }, 500);
    }

    return c.json({ success: true, data: updatedEvent });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /admin/events/:id - Delete event (admin only)
app.delete('/make-server-84f9c112/admin/events/:id', async (c) => {
  const sessionToken = c.req.header('X-Session-Token');
  const { valid } = await validateAdminToken(sessionToken);
  
  if (!valid) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const eventId = c.req.param('id');
    
    // Check if event exists and get image path for cleanup
    const { data: existingData, error: fetchError } = await supabase
      .from(KV_TABLE)
      .select('value')
      .eq('key', `event:${eventId}`)
      .maybeSingle();
    
    if (fetchError || !existingData) {
      return c.json({ success: false, error: 'Event not found' }, 404);
    }
    
    const event = existingData.value as Event;
    
    // Delete image from storage if exists
    if (event.imagePath) {
      try {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([event.imagePath]);
      } catch (err) {
        // Failed to delete image
      }
    }

    // Delete event from KV store
    const { error } = await supabase
      .from(KV_TABLE)
      .delete()
      .eq('key', `event:${eventId}`);

    if (error) {
      return c.json({ success: false, error: 'Failed to delete event' }, 500);
    }

    return c.json({ success: true, message: 'Event deleted successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================================================
// IMAGE UPLOAD ENDPOINTS
// ============================================================================

// POST /events/upload-image - Upload event image
app.post('/make-server-84f9c112/events/upload-image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }
    
    if (!eventId) {
      return c.json({ success: false, error: 'Missing eventId' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: 'Invalid file type. Only PNG, JPG, and WebP allowed.' }, 400);
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      return c.json({ success: false, error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `events/${eventId}/${timestamp}.${ext}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, uint8Array, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    return c.json({
      success: true,
      data: {
        path: data.path,
        publicUrl: publicUrlData.publicUrl,
        filename
      }
    });

  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Upload failed'
    }, 500);
  }
});

// DELETE /events/delete-image - Delete event image
app.delete('/make-server-84f9c112/events/delete-image', async (c) => {
  try {
    const { path } = await c.req.json();
    
    if (!path) {
      return c.json({ success: false, error: 'No path provided' }, 400);
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true });

  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message || 'Delete failed'
    }, 500);
  }
});

export { app as eventsApp };