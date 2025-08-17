/**
 * Backward compatible logging utility with enhanced monitoring integration
 * Maintains original simple interface while providing production-grade logging
 */

import { Logger, logger as enhancedLogger } from './logging/logger.service';

const isDevelopment = process.env.NODE_ENV === 'development';

// Create a backward-compatible logger that integrates with the new monitoring system
const compatibleLogger = enhancedLogger.withContext({ component: 'Legacy' });

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
    // Also log to enhanced logger for production monitoring
    if (args.length > 0) {
      compatibleLogger.info(String(args[0]), { 
        args: args.slice(1),
        legacy: true 
      });
    }
  },
  
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // Enhanced error logging for production
    if (args.length > 0) {
      const message = String(args[0]);
      const error = args.find(arg => arg instanceof Error) as Error;
      compatibleLogger.error(message, error, { 
        args: args.slice(1),
        legacy: true 
      });
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
    // Enhanced warning logging
    if (args.length > 0) {
      compatibleLogger.warn(String(args[0]), { 
        args: args.slice(1),
        legacy: true 
      });
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
    // Enhanced info logging
    if (args.length > 0) {
      compatibleLogger.info(String(args[0]), { 
        args: args.slice(1),
        legacy: true 
      });
    }
  }
};

// Export enhanced Logger class for new code
export { Logger };