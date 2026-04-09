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
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Public bucket for promotion images and chatbot avatars
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });

      if (error) {
        // Ignore "already exists" error (race condition)
        if (error.statusCode === '409' || error.message?.includes('already exists')) {
          // Bucket already exists
        } else {
          // Bucket creation failed
        }
      } else {
        // Bucket created successfully
      }
    } else {
      // Bucket already exists

      // Update bucket to public if it's not already
      try {
        const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
          public: true,
        });
        if (updateError) {
          // Could not update bucket to public
        } else {
          // Bucket updated to public
        }
      } catch (e) {
        // Bucket update skipped
      }
    }
  } catch (error) {
    // Bucket initialization error
  }
};

// Call init on module load
initBucket();

// Upload image endpoint
app.post('/make-server-84f9c112/promotions/upload-image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const promotionId = formData.get('promotionId') as string;
    const imageType = formData.get('imageType') as string; // 'background' or 'icon'
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }
    
    if (!promotionId || !imageType) {
      return c.json({ success: false, error: 'Missing required fields: promotionId, imageType' }, 400);
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
    const filename = `${promotionId}/${imageType}-${timestamp}.${ext}`;

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

    // Get public URL (bucket is public, no expiry needed)
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    return c.json({
      success: true,
      data: {
        path: data.path,
        signedUrl: publicUrlData.publicUrl, // Using public URL instead of signed URL
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

export { app as promotionsApp };