/**
 * Disable Console Logs in Production
 * This removes ALL console.log/info/debug in production build
 * Only console.error/warn will work
 */

if (import.meta.env.PROD) {
  // Save original methods
  const noop = () => {};
  
  // Override console methods in production
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  
  // Keep warn and error for critical issues
  // console.warn and console.error stay active
}
