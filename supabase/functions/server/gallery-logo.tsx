import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

const GALLERY_LOGO_KEY = 'gallery:logo';

interface GalleryLogo {
  url: string;
  uploadedAt: string;
}

// GET /make-server-84f9c112/gallery-logo
// Lấy logo hiện tại
app.get('/', async (c) => {
  try {
    const logo = await kv.get<GalleryLogo>(GALLERY_LOGO_KEY);
    
    if (!logo) {
      return c.json({ logo: null });
    }

    return c.json({ logo });
  } catch (error) {
    return c.json(
      { error: 'Failed to fetch gallery logo', details: String(error) },
      500
    );
  }
});

// POST /make-server-84f9c112/gallery-logo
// Upload/update logo mới
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return c.json(
        { error: 'Logo URL is required and must be a string' },
        400
      );
    }

    // Validate URL format (basic check)
    try {
      new URL(url);
    } catch {
      return c.json(
        { error: 'Invalid URL format' },
        400
      );
    }

    const logo: GalleryLogo = {
      url,
      uploadedAt: new Date().toISOString()
    };

    await kv.set(GALLERY_LOGO_KEY, logo);

    return c.json({ 
      success: true, 
      logo 
    });
  } catch (error) {
    return c.json(
      { error: 'Failed to update gallery logo', details: String(error) },
      500
    );
  }
});

// DELETE /make-server-84f9c112/gallery-logo
// Xóa logo
app.delete('/', async (c) => {
  try {
    await kv.del(GALLERY_LOGO_KEY);

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { error: 'Failed to delete gallery logo', details: String(error) },
      500
    );
  }
});

export default app;
