/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * RETRY UTILITY
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Exponential backoff retry logic for network operations
 */

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - The async function to retry
 * @param retries - Number of retry attempts (default: 3)
 * @param delay - Initial delay in milliseconds (default: 200ms)
 * @returns Promise<T> - Result from the function
 * 
 * Retry Strategy:
 * - 1st retry: 200ms delay
 * - 2nd retry: 400ms delay
 * - 3rd retry: 800ms delay
 * 
 * Retryable Errors:
 * - Connection errors
 * - Connection reset
 * - Network connection lost
 * - Gateway errors
 * - Internal server errors
 * - HTML error pages (Cloudflare 500/502/503)
 * - TypeErrors
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 200
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = String(error);
    
    // Check if error is HTML (Cloudflare error page)
    const isHTMLError = errorStr.includes('<!DOCTYPE html>') || errorStr.includes('<html');
    
    // Retry on network/connection errors and HTML error pages
    const isRetryable = 
      errorStr.includes("connection error") || 
      errorStr.includes("connection reset") || 
      errorStr.includes("network connection lost") || 
      errorStr.includes("gateway error") ||
      errorStr.includes("Internal server error") ||
      errorStr.includes("TypeError") ||
      isHTMLError;
    
    if (retries > 0 && isRetryable) {
      // Wait with exponential backoff
      await new Promise(r => setTimeout(r, delay));

      // Retry with doubled delay
      return retry(fn, retries - 1, delay * 2);
    }

    throw error;
  }
};

/**
 * Retry with custom configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  customRetryCheck?: (error: any) => boolean;
}

export const retryWithConfig = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 200,
    maxDelay = 5000,
    customRetryCheck
  } = config;

  let currentRetry = 0;
  let currentDelay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      currentRetry++;

      const shouldRetry = customRetryCheck 
        ? customRetryCheck(error)
        : isDefaultRetryable(error);

      if (currentRetry >= maxRetries || !shouldRetry) {
        throw error;
      }

      await new Promise(r => setTimeout(r, currentDelay));
      currentDelay = Math.min(currentDelay * 2, maxDelay);
    }
  }
};

/**
 * Check if error is retryable by default
 */
const isDefaultRetryable = (error: any): boolean => {
  const errorStr = String(error);
  
  const isHTMLError = errorStr.includes('<!DOCTYPE html>') || errorStr.includes('<html');
  
  return (
    errorStr.includes("connection error") || 
    errorStr.includes("connection reset") || 
    errorStr.includes("network connection lost") || 
    errorStr.includes("gateway error") ||
    errorStr.includes("Internal server error") ||
    errorStr.includes("TypeError") ||
    isHTMLError
  );
};
