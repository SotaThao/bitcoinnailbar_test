/**
 * Security utility to sanitize sensitive data in logs
 */

/**
 * Remove token from Supabase signed URLs before logging
 * @param url - Full URL with token
 * @returns Sanitized URL with token masked
 */
export function sanitizeSignedUrl(url: string): string {
  if (!url) return url;
  
  try {
    const urlObj = new URL(url);
    
    // Check if it has a token parameter
    if (urlObj.searchParams.has('token')) {
      const token = urlObj.searchParams.get('token') || '';
      const tokenPreview = token.substring(0, 20) + '...[REDACTED]';
      urlObj.searchParams.set('token', tokenPreview);
    }
    
    return urlObj.toString();
  } catch {
    // If URL parsing fails, mask the entire token
    return url.replace(/token=([^&]+)/, 'token=...[REDACTED]');
  }
}

/**
 * Safe console.log for URLs - automatically sanitizes signed URLs
 * @param label - Log label
 * @param url - URL to log (will be sanitized if it contains token)
 */
export function logUrlSafely(label: string, url: string): void {
  if (process.env.NODE_ENV === 'production') {
    // In production, don't log at all or only log to external service
    return;
  }
  
  const sanitized = sanitizeSignedUrl(url);
  console.log(`[SAFE] ${label}:`, sanitized);
}

/**
 * Log file upload success without exposing full signed URL
 * @param fileName - Name of uploaded file
 * @param fileSize - Size in bytes
 * @param bucketName - Storage bucket name
 */
export function logUploadSuccess(fileName: string, fileSize?: number, bucketName?: string): void {
  if (process.env.NODE_ENV === 'production') return;
  
  const sizeStr = fileSize ? `${(fileSize / 1024).toFixed(2)}KB` : 'unknown size';
  const bucket = bucketName || 'unknown bucket';
  
  console.log(`✅ File uploaded: ${fileName} (${sizeStr}) to ${bucket}`);
}

/**
 * Extract metadata from signed URL without logging the token
 * @param url - Signed URL
 * @returns Metadata object
 */
export function extractUrlMetadata(url: string): {
  path: string;
  bucket: string;
  hasToken: boolean;
  expiresIn?: string;
} {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucket = pathParts[pathParts.indexOf('object') + 1] || 'unknown';
    const path = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');
    
    // Decode token to get expiry (without logging the token itself)
    let expiresIn: string | undefined;
    const token = urlObj.searchParams.get('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expTimestamp = payload.exp * 1000;
        const now = Date.now();
        const hoursLeft = Math.floor((expTimestamp - now) / (1000 * 60 * 60));
        expiresIn = hoursLeft > 0 ? `${hoursLeft}h` : 'expired';
      } catch {
        expiresIn = 'unknown';
      }
    }
    
    return {
      path,
      bucket,
      hasToken: !!token,
      expiresIn,
    };
  } catch {
    return {
      path: 'unknown',
      bucket: 'unknown',
      hasToken: false,
    };
  }
}

/**
 * Safe logging for API responses containing URLs
 * @param label - Log label
 * @param data - Response data (will sanitize any URLs found)
 */
export function logApiResponseSafely(label: string, data: any): void {
  if (process.env.NODE_ENV === 'production') return;
  
  // Deep clone to avoid mutating original
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Recursively sanitize all URL strings in the object
  function sanitizeObject(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].includes('token=')) {
        obj[key] = sanitizeSignedUrl(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
  
  sanitizeObject(sanitized);
  console.log(`[SAFE] ${label}:`, sanitized);
}

// Example usage in production check
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Conditional logger that respects production mode
 */
export const safeLogger = {
  log: (...args: any[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  url: logUrlSafely,
  upload: logUploadSuccess,
  response: logApiResponseSafely,
};
