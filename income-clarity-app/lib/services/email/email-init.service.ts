/**
 * Email Service Initialization
 * Starts email scheduler and sets up periodic tasks
 */

import { emailScheduler } from './email-scheduler.service';
import { logger } from '@/lib/logger'

let initialized = false;

/**
 * Initialize email services
 */
export function initializeEmailServices(): void {
  if (initialized) {
    logger.log('[EMAIL INIT] Email services already initialized');
    return;
  }
  
  try {
    logger.log('[EMAIL INIT] Starting email services...');
    
    // Start the weekly email scheduler
    emailScheduler.startWeeklyScheduler();
    
    initialized = true;
    logger.log('[EMAIL INIT] Email services initialized successfully');
    
  } catch (error) {
    logger.error('[EMAIL INIT] Failed to initialize email services:', error);
  }
}

/**
 * Shutdown email services
 */
export function shutdownEmailServices(): void {
  if (!initialized) {
    return;
  }
  
  try {
    logger.log('[EMAIL INIT] Shutting down email services...');
    
    // Stop the weekly email scheduler
    emailScheduler.stopWeeklyScheduler();
    
    initialized = false;
    logger.log('[EMAIL INIT] Email services shut down successfully');
    
  } catch (error) {
    logger.error('[EMAIL INIT] Error shutting down email services:', error);
  }
}

/**
 * Check if email services are initialized
 */
export function isEmailServicesInitialized(): boolean {
  return initialized;
}

// Auto-initialize in production environments
if (process.env.NODE_ENV === 'production' || process.env.LITE_PRODUCTION_MODE === 'true') {
  // Delay initialization to allow other services to start
  setTimeout(() => {
    initializeEmailServices();
  }, 5000);
}