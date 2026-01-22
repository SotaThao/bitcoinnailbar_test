/**
 * Gallery Management Module
 * Handles image upload, deletion, reordering, and categorization for public gallery
 */

import { Hono } from "npm:hono@4";
import * as kv from "./kv_store.tsx";

const galleryApp = new Hono();

// ============================================================================
// TYPES
// ============================================================================

interface GalleryImage {
  id: string;
  cloudinary_url: string;
  public_id: string;
  category: string;
  order: number;
  width: number;
  height: number;
  uploadedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize folder name for Cloudinary
 * Removes special characters, converts spaces to hyphens, lowercase
 */
function sanitizeFolderName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .toLowerCase(); // Lowercase
}

/**
 * Parse Cloudinary URL from environment variable
 */
function parseCloudinaryConfig() {
  const cloudinaryUrl = Deno.env.get("CLOUDINARY_URL");
  if (!cloudinaryUrl) {
    throw new Error("CLOUDINARY_URL not configured");
  }

  const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (!matches) {
    throw new Error("Invalid CLOUDINARY_URL format");
  }

  const [, apiKey, apiSecret, cloudName] = matches;
  return { apiKey, apiSecret, cloudName };
}

/**
 * Generate signature for Cloudinary upload
 */
async function generateCloudinarySignature(
  timestamp: number,
  folder: string,
  apiSecret: string
): Promise<string> {
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary(
  file: File,
  folder: string = "bitcoin-nail-bar/gallery"
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const { apiKey, apiSecret, cloudName } = parseCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await generateCloudinarySignature(timestamp, folder, apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const result = await response.json();
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

/**
 * Delete image from Cloudinary
 */
async function deleteFromCloudinary(publicId: string): Promise<void> {
  const { apiKey, apiSecret, cloudName } = parseCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Cloudinary delete failed:", errorText);
    // Don't throw - allow deletion from KV even if Cloudinary fails
  } else {
    console.log("✅ Deleted from Cloudinary:", publicId);
  }
}

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * GET /gallery/images
 * Public endpoint - Fetch all gallery images
 */
galleryApp.get("/make-server-84f9c112/gallery/images", async (c) => {
  try {
    const images = (await kv.get("gallery:images")) || [];
    console.log(`📸 [GALLERY] Fetched ${images.length} images`);
    
    // Sort by order
    const sortedImages = images.sort((a: GalleryImage, b: GalleryImage) => a.order - b.order);
    
    return c.json({ success: true, data: sortedImages });
  } catch (error: any) {
    console.error("❌ [GALLERY] Fetch error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * POST /admin/gallery/upload
 * Admin endpoint - Upload new gallery image
 */
galleryApp.post("/make-server-84f9c112/admin/gallery/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    const category = (body["category"] as string) || "Uncategorized";

    if (!file || !(file instanceof File)) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return c.json({ success: false, error: "File must be an image" }, 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ success: false, error: "Image must be less than 10MB" }, 400);
    }

    console.log(`📤 [GALLERY] Uploading image - Category: ${category}, Size: ${file.size}`);

    // Upload to Cloudinary with category-based folder structure
    const sanitizedCategory = sanitizeFolderName(category);
    const folderPath = `bitcoin-nail-bar/gallery/${sanitizedCategory}`;
    const { url, publicId, width, height } = await uploadToCloudinary(file, folderPath);

    // Get existing images
    const images = (await kv.get("gallery:images")) || [];

    // Create new image object
    const newImage: GalleryImage = {
      id: crypto.randomUUID(),
      cloudinary_url: url,
      public_id: publicId,
      category,
      order: images.length,
      width,
      height,
      uploadedAt: new Date().toISOString(),
    };

    // Save to KV
    const updatedImages = [...images, newImage];
    await kv.set("gallery:images", updatedImages);

    console.log(`✅ [GALLERY] Image uploaded - ID: ${newImage.id}, URL: ${url}`);

    return c.json({ success: true, data: newImage });
  } catch (error: any) {
    console.error("❌ [GALLERY] Upload error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * DELETE /admin/gallery/:id
 * Admin endpoint - Delete gallery image
 */
galleryApp.delete("/make-server-84f9c112/admin/gallery/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const images = (await kv.get("gallery:images")) || [];

    const imageToDelete = images.find((img: GalleryImage) => img.id === id);
    if (!imageToDelete) {
      return c.json({ success: false, error: "Image not found" }, 404);
    }

    console.log(`🗑️ [GALLERY] Deleting image - ID: ${id}, Public ID: ${imageToDelete.public_id}`);

    // Delete from Cloudinary
    await deleteFromCloudinary(imageToDelete.public_id);

    // Remove from KV and reorder
    const remainingImages = images
      .filter((img: GalleryImage) => img.id !== id)
      .map((img: GalleryImage, index: number) => ({
        ...img,
        order: index,
      }));

    await kv.set("gallery:images", remainingImages);

    console.log(`✅ [GALLERY] Image deleted - ID: ${id}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.error("❌ [GALLERY] Delete error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * PUT /admin/gallery/reorder
 * Admin endpoint - Reorder gallery images
 */
galleryApp.put("/make-server-84f9c112/admin/gallery/reorder", async (c) => {
  try {
    const { images: reorderedImages } = await c.req.json();

    // Update order field
    const updatedImages = reorderedImages.map((img: GalleryImage, index: number) => ({
      ...img,
      order: index,
    }));

    await kv.set("gallery:images", updatedImages);

    console.log(`✅ [GALLERY] Reordered ${updatedImages.length} images`);

    return c.json({ success: true, data: updatedImages });
  } catch (error: any) {
    console.error("❌ [GALLERY] Reorder error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * PUT /admin/gallery/:id/category
 * Admin endpoint - Update image category
 */
galleryApp.put("/make-server-84f9c112/admin/gallery/:id/category", async (c) => {
  try {
    const id = c.req.param("id");
    const { category } = await c.req.json();

    if (!category) {
      return c.json({ success: false, error: "Category is required" }, 400);
    }

    const images = (await kv.get("gallery:images")) || [];
    const imageIndex = images.findIndex((img: GalleryImage) => img.id === id);

    if (imageIndex === -1) {
      return c.json({ success: false, error: "Image not found" }, 404);
    }

    // Update category
    images[imageIndex].category = category;
    await kv.set("gallery:images", images);

    console.log(`✅ [GALLERY] Updated category - ID: ${id}, Category: ${category}`);

    return c.json({ success: true, data: images[imageIndex] });
  } catch (error: any) {
    console.error("❌ [GALLERY] Category update error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

/**
 * PUT /admin/gallery/:id
 * Admin endpoint - Update image (replace image and/or category)
 */
galleryApp.put("/make-server-84f9c112/admin/gallery/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.parseBody();
    const file = body["file"];
    const category = body["category"] as string;

    const images = (await kv.get("gallery:images")) || [];
    const imageIndex = images.findIndex((img: GalleryImage) => img.id === id);

    if (imageIndex === -1) {
      return c.json({ success: false, error: "Image not found" }, 404);
    }

    const existingImage = images[imageIndex];

    // If new file provided, upload and delete old one
    if (file && file instanceof File) {
      console.log(`🔄 [GALLERY] Replacing image - ID: ${id}`);

      // Upload new image with category-based folder structure
      const sanitizedCategory = sanitizeFolderName(existingImage.category);
      const folderPath = `bitcoin-nail-bar/gallery/${sanitizedCategory}`;
      const { url, publicId, width, height } = await uploadToCloudinary(file, folderPath);

      // Delete old image from Cloudinary
      await deleteFromCloudinary(existingImage.public_id);

      // Update image data
      existingImage.cloudinary_url = url;
      existingImage.public_id = publicId;
      existingImage.width = width;
      existingImage.height = height;
    }

    // Update category if provided
    if (category) {
      existingImage.category = category;
    }

    images[imageIndex] = existingImage;
    await kv.set("gallery:images", images);

    console.log(`✅ [GALLERY] Image updated - ID: ${id}`);

    return c.json({ success: true, data: existingImage });
  } catch (error: any) {
    console.error("❌ [GALLERY] Update error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default galleryApp;