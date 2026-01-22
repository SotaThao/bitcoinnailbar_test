/**
 * Cloudinary URL Optimization Utilities
 * Adds automatic format and quality transformations to Cloudinary URLs
 */

/**
 * Optimize Cloudinary URL for web delivery
 * Adds f_auto (automatic format selection) and q_auto (automatic quality)
 * 
 * @param url - Original Cloudinary URL
 * @param options - Optional transformations
 * @returns Optimized URL
 * 
 * @example
 * Input:  https://res.cloudinary.com/cloud/image/upload/folder/image.png
 * Output: https://res.cloudinary.com/cloud/image/upload/f_auto,q_auto/folder/image.png
 */
export function optimizeCloudinaryUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    quality?: 'auto' | number;
  }
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Check if transformations already exist
  if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto')) {
    return url;
  }

  const transformations: string[] = [];

  // Format auto (WebP/AVIF for modern browsers)
  transformations.push('f_auto');

  // Quality auto or custom
  if (options?.quality === 'auto' || !options?.quality) {
    transformations.push('q_auto');
  } else {
    transformations.push(`q_${options.quality}`);
  }

  // Width
  if (options?.width) {
    transformations.push(`w_${options.width}`);
  }

  // Height
  if (options?.height) {
    transformations.push(`h_${options.height}`);
  }

  // Crop mode
  if (options?.crop) {
    transformations.push(`c_${options.crop}`);
  }

  const transformString = transformations.join(',');

  // Insert transformations after /upload/
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Optimize Cloudinary URL for thumbnail
 * Smaller dimensions for faster loading
 */
export function optimizeCloudinaryThumbnail(url: string, size: number = 400): string {
  return optimizeCloudinaryUrl(url, {
    width: size,
    height: size,
    crop: 'fill',
  });
}

/**
 * Optimize Cloudinary URL for hero/large images
 * Higher quality, responsive width
 */
export function optimizeCloudinaryHero(url: string, maxWidth: number = 1920): string {
  return optimizeCloudinaryUrl(url, {
    width: maxWidth,
    crop: 'scale',
    quality: 'auto',
  });
}
