import { Hono } from 'npm:hono@4.6.14';
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

const BUCKET_NAME = 'make-84f9c112-promotions';

// Initialize bucket on startup
const initBucket = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log('📦 [PROMOTIONS] Creating storage bucket...');
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });
      
      if (error) {
        // Ignore "already exists" error (race condition)
        if (error.statusCode === '409' || error.message?.includes('already exists')) {
          console.log('✅ [PROMOTIONS] Bucket already exists');
        } else {
          console.error('❌ [PROMOTIONS] Bucket creation failed:', error);
        }
      } else {
        console.log('✅ [PROMOTIONS] Bucket created successfully');
      }
    } else {
      console.log('✅ [PROMOTIONS] Bucket already exists');
    }
  } catch (error) {
    console.error('❌ [PROMOTIONS] Bucket initialization error:', error);
  }
};

// Call init on module load
initBucket();

// Upload image endpoint
app.post('/make-server-84f9c112/promotions/upload-image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string; // 'vi' or 'en'
    const promotionId = formData.get('promotionId') as string;
    const imageType = formData.get('imageType') as string; // 'background' or 'icon'
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }
    
    if (!language || !promotionId || !imageType) {
      return c.json({ success: false, error: 'Missing required fields: language, promotionId, imageType' }, 400);
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
    const filename = `${promotionId}/${language}/${imageType}-${timestamp}.${ext}`;

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
      console.error('❌ [PROMOTIONS] Upload error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    // Generate signed URL (valid for 24 hours)
    const { data: signedUrlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filename, 86400); // 24 hours (reduced from 1 year for security)

    if (!signedUrlData) {
      return c.json({ success: false, error: 'Failed to generate signed URL' }, 500);
    }

    console.log('✅ [PROMOTIONS] Image uploaded:', filename);

    return c.json({
      success: true,
      data: {
        path: data.path,
        signedUrl: signedUrlData.signedUrl,
        filename
      }
    });

  } catch (error: any) {
    console.error('❌ [PROMOTIONS] Upload error:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Upload failed' 
    }, 500);
  }
});

// Delete image endpoint
app.delete('/make-server-84f9c112/promotions/delete-image', async (c) => {
  try {
    const { path } = await c.req.json();
    
    if (!path) {
      return c.json({ success: false, error: 'No path provided' }, 400);
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('❌ [PROMOTIONS] Delete error:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log('✅ [PROMOTIONS] Image deleted:', path);

    return c.json({ success: true });

  } catch (error: any) {
    console.error('❌ [PROMOTIONS] Delete error:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Delete failed' 
    }, 500);
  }
});

export { app as promotionsApp };