/**
 * Production-ready Logger Utility
 * - Development: Shows all logs
 * - Production: Only shows errors
 */

const IS_PRODUCTION = import.meta.env.PROD;

export const logger = {
  log: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.log(...args);
    }
  },

  info: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.info(...args);
    }
  },

  warn: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.warn(...args);
    }
  },

  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },

  debug: (...args: any[]) => {
    if (!IS_PRODUCTION) {
      console.debug(...args);
    }
  },
};

// Export for convenience
export default logger;
