import { Hono } from 'npm:hono@4.6.14';
import { kvAdmin as kv } from './_shared_kv.tsx';

export const utilitiesApp = new Hono();

// ========================================
// GENERAL UPLOAD (Cloudinary)
// ========================================

// POST: Upload file to Cloudinary
utilitiesApp.post("/make-server-84f9c112/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    if (!file || !(file instanceof File)) return c.json({ success: false, error: "No file" }, 400);

    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (!cloudinaryUrl) return c.json({ success: false, error: "Config missing" }, 500);

    const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (!matches) return c.json({ success: false, error: "Invalid config" }, 500);
    const [, apiKey, apiSecret, cloudName] = matches;

    const timestamp = Math.round(Date.now() / 1000).toString();
    const signatureString = `timestamp=${timestamp}${apiSecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST", body: formData,
    });

    if (!response.ok) return c.json({ success: false, error: await response.text() }, 500);
    const result = await response.json();
    return c.json({ success: true, url: result.secure_url });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ========================================
// NOTE: Chatbot route moved to chatbot.tsx
// Advanced chatbot with DeepSeek Function Calling
// ========================================

// ========================================
// MENU IMAGES MANAGEMENT (Cloudinary)
// ========================================

// GET: List all menu images
utilitiesApp.get("/make-server-84f9c112/menu/images", async (c) => {
  try {
    const images = await kv.get("menu:images") || [];
    return c.json({ success: true, data: images });
  } catch (error: any) {
    console.error("❌ [GET MENU IMAGES] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST: Upload menu image to Cloudinary
utilitiesApp.post("/make-server-84f9c112/admin/menu/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];
    const orderStr = body['order'];
    const name = body['name'];
    
    if (!file || !(file instanceof File)) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ success: false, error: "Menu name is required" }, 400);
    }

    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (!cloudinaryUrl) {
      return c.json({ success: false, error: "Cloudinary not configured" }, 500);
    }

    const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (!matches) {
      return c.json({ success: false, error: "Invalid Cloudinary URL" }, 500);
    }
    const [, apiKey, apiSecret, cloudName] = matches;

    const images = await kv.get("menu:images") || [];
    
    // Generate signature
    const timestamp = Math.round(Date.now() / 1000).toString();
    const order = parseInt(orderStr || images.length.toString());
    const folder = `bitcoin-nail-bar/menu/page-${order + 1}`;
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [CLOUDINARY UPLOAD] Error:", errorText);
      return c.json({ success: false, error: errorText }, 500);
    }

    const result = await response.json();
    
    // Save metadata to KV
    const newImage = {
      id: `menu-img-${Date.now()}`,
      name: name.trim(),
      cloudinary_url: result.secure_url,
      public_id: result.public_id,
      order: parseInt(orderStr || images.length.toString()),
      width: result.width,
      height: result.height,
      uploadedAt: new Date().toISOString(),
    };
    
    images.push(newImage);
    // Sort by order
    images.sort((a: any, b: any) => a.order - b.order);
    
    await kv.set("menu:images", images);
    
    console.log(`✅ [MENU UPLOAD] Image uploaded: ${newImage.id} - ${newImage.name}`);
    return c.json({ success: true, data: newImage });
  } catch (error: any) {
    console.error("❌ [MENU UPLOAD] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE: Remove menu image
utilitiesApp.delete("/make-server-84f9c112/admin/menu/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const images = await kv.get("menu:images") || [];
    
    const imageToDelete = images.find((img: any) => img.id === id);
    if (!imageToDelete) {
      return c.json({ success: false, error: "Image not found" }, 404);
    }
    
    // Delete from Cloudinary
    const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
    if (cloudinaryUrl) {
      const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (matches) {
        const [, apiKey, apiSecret, cloudName] = matches;
        const timestamp = Math.round(Date.now() / 1000).toString();
        const signatureString = `public_id=${imageToDelete.public_id}&timestamp=${timestamp}${apiSecret}`;
        
        const encoder = new TextEncoder();
        const data = encoder.encode(signatureString);
        const hashBuffer = await crypto.subtle.digest("SHA-1", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const deleteFormData = new FormData();
        deleteFormData.append("public_id", imageToDelete.public_id);
        deleteFormData.append("api_key", apiKey);
        deleteFormData.append("timestamp", timestamp);
        deleteFormData.append("signature", signature);
        
        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
          method: "POST",
          body: deleteFormData,
        });
      }
    }
    
    // Remove from KV
    const updatedImages = images.filter((img: any) => img.id !== id);
    await kv.set("menu:images", updatedImages);
    
    console.log(`✅ [MENU DELETE] Image deleted: ${id}`);
    return c.json({ success: true, message: "Image deleted" });
  } catch (error: any) {
    console.error("❌ [MENU DELETE] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Reorder menu images
utilitiesApp.put("/make-server-84f9c112/admin/menu/reorder", async (c) => {
  try {
    const { images: reorderedImages } = await c.req.json();
    
    // Update order field
    const updatedImages = reorderedImages.map((img: any, index: number) => ({
      ...img,
      order: index,
    }));
    
    await kv.set("menu:images", updatedImages);
    
    console.log(`✅ [MENU REORDER] ${updatedImages.length} images reordered`);
    return c.json({ success: true, data: updatedImages });
  } catch (error: any) {
    console.error("❌ [MENU REORDER] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT: Update menu image (name and/or image)
utilitiesApp.put("/make-server-84f9c112/admin/menu/:id/update", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.parseBody();
    const file = body['file'];
    const name = body['name'];
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ success: false, error: "Menu name is required" }, 400);
    }

    const images = await kv.get("menu:images") || [];
    const imageIndex = images.findIndex((img: any) => img.id === id);
    
    if (imageIndex === -1) {
      return c.json({ success: false, error: "Image not found" }, 404);
    }

    const existingImage = images[imageIndex];
    let updatedImageData: any = {
      ...existingImage,
      name: name.trim(),
    };

    // If new file is provided, upload to Cloudinary and delete old image
    if (file && file instanceof File) {
      const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
      if (!cloudinaryUrl) {
        return c.json({ success: false, error: "Cloudinary not configured" }, 500);
      }

      const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (!matches) {
        return c.json({ success: false, error: "Invalid Cloudinary URL" }, 500);
      }
      const [, apiKey, apiSecret, cloudName] = matches;

      // Upload new image to Cloudinary
      const timestamp = Math.round(Date.now() / 1000).toString();
      const folder = `bitcoin-nail-bar/menu/page-${existingImage.order + 1}`;
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest("SHA-1", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [CLOUDINARY UPDATE] Error:", errorText);
        return c.json({ success: false, error: errorText }, 500);
      }

      const result = await response.json();

      // Delete old image from Cloudinary
      const deleteSignatureString = `public_id=${existingImage.public_id}&timestamp=${timestamp}${apiSecret}`;
      const deleteData = encoder.encode(deleteSignatureString);
      const deleteHashBuffer = await crypto.subtle.digest("SHA-1", deleteData);
      const deleteHashArray = Array.from(new Uint8Array(deleteHashBuffer));
      const deleteSignature = deleteHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const deleteFormData = new FormData();
      deleteFormData.append("public_id", existingImage.public_id);
      deleteFormData.append("api_key", apiKey);
      deleteFormData.append("timestamp", timestamp);
      deleteFormData.append("signature", deleteSignature);

      await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: "POST",
        body: deleteFormData,
      });

      // Update with new Cloudinary data
      updatedImageData = {
        ...updatedImageData,
        cloudinary_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      };
    }

    // Update in array
    images[imageIndex] = updatedImageData;
    await kv.set("menu:images", images);

    console.log(`✅ [MENU UPDATE] Image updated: ${id}`);
    return c.json({ success: true, data: updatedImageData });
  } catch (error: any) {
    console.error("❌ [MENU UPDATE] Exception:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ========================================
// VLINK PROXY (CORS Bypass)
// ========================================

// GET: Proxy for VLinkExchange to avoid CORS
utilitiesApp.get("/make-server-84f9c112/proxy/vlink", async (c) => {
  try {
    console.log('🔍 [PROXY VLINK] Fetching from upstream...');
    const response = await fetch('https://vlinkexchange.com/matching/public/active-markets?limit=500', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://vlinkexchange.com/',
        'Origin': 'https://vlinkexchange.com'
      }
    });
    if (!response.ok) {
      console.warn(`⚠️ [PROXY VLINK] Primary API failed (${response.status})`);
      throw new Error(`Upstream API failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ [PROXY VLINK] Successfully fetched data');
    return c.json(data);
  } catch (error: any) {
    console.error("❌ [PROXY VLINK] Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

console.log('✅ Utilities module initialized (8 routes: upload, chat, menu images x5, vlink proxy)');
