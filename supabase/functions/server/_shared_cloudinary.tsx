/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CLOUDINARY HELPERS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Utilities for uploading/deleting images to/from Cloudinary
 */

import { getEnv } from './_shared_constants.tsx';

/**
 * Cloudinary configuration parsed from CLOUDINARY_URL
 */
export interface CloudinaryConfig {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
}

/**
 * Parse Cloudinary URL environment variable
 * Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
 */
export const parseCloudinaryUrl = (): CloudinaryConfig | null => {
  const cloudinaryUrl = getEnv("CLOUDINARY_URL");
  
  if (!cloudinaryUrl) {
    return null;
  }

  const matches = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  
  if (!matches) {
    return null;
  }

  const [, apiKey, apiSecret, cloudName] = matches;
  
  return { apiKey, apiSecret, cloudName };
};

/**
 * Generate SHA-1 signature for Cloudinary API requests
 */
export const generateSignature = async (signatureString: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Upload image to Cloudinary
 * 
 * @param file - File to upload (File or Blob)
 * @param options - Upload options
 * @returns Upload result with secure_url and public_id
 */
export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
}

export interface CloudinaryUploadResult {
  success: boolean;
  secure_url?: string;
  public_id?: string;
  error?: string;
}

export const uploadImage = async (
  file: File | Blob,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    const config = parseCloudinaryUrl();
    
    if (!config) {
      return { success: false, error: "Cloudinary not configured" };
    }

    const { apiKey, apiSecret, cloudName } = config;
    const timestamp = Math.round(Date.now() / 1000).toString();

    // Build signature string
    let signatureString = `timestamp=${timestamp}`;
    
    if (options.folder) {
      signatureString = `folder=${options.folder}&timestamp=${timestamp}`;
    }
    
    if (options.publicId) {
      signatureString = `public_id=${options.publicId}&timestamp=${timestamp}`;
    }
    
    signatureString += apiSecret;

    // Generate signature
    const signature = await generateSignature(signatureString);

    // Build form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    
    if (options.folder) {
      formData.append("folder", options.folder);
    }
    
    if (options.publicId) {
      formData.append("public_id", options.publicId);
    }

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    const result = await response.json();

    return {
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
};

/**
 * Delete image from Cloudinary
 * 
 * @param publicId - Public ID of the image to delete
 * @returns Deletion result
 */
export interface CloudinaryDeleteResult {
  success: boolean;
  error?: string;
}

export const deleteImage = async (publicId: string): Promise<CloudinaryDeleteResult> => {
  try {
    const config = parseCloudinaryUrl();
    
    if (!config) {
      return { success: false, error: "Cloudinary not configured" };
    }

    const { apiKey, apiSecret, cloudName } = config;
    const timestamp = Math.round(Date.now() / 1000).toString();

    // Build signature string for deletion
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await generateSignature(signatureString);

    // Build form data
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    // Delete from Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
};

/**
 * Upload image from base64 data URL
 * Useful for QR codes and canvas-generated images
 */
export const uploadBase64Image = async (
  dataURL: string,
  filename: string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    // Convert base64 to Blob
    const base64Data = dataURL.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: 'image/png' });
    const file = new File([blob], filename, { type: 'image/png' });
    
    return await uploadImage(file, options);
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
};
