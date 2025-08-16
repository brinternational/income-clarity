// Environment Variable Loading Check
// Ensures proper environment configuration for production deployment

import { logger } from '@/lib/logger';

export interface EnvironmentCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  liteProductionEnabled: boolean;
}

export function checkEnvironmentConfiguration(): EnvironmentCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check LITE_PRODUCTION_MODE configuration
  const liteProductionEnv = process.env.LITE_PRODUCTION_MODE;
  const liteProductionEnabled = liteProductionEnv === 'true';
  
  // logger.log('🔧 Environment Configuration Check:', {
  //   NODE_ENV: process.env.NODE_ENV,
  //   LITE_PRODUCTION_MODE: liteProductionEnv,
  //   liteProductionEnabled
  // });

  // Validation logic
  if (liteProductionEnv === undefined) {
    warnings.push('LITE_PRODUCTION_MODE environment variable not set. Check your .env file configuration.');
  }

  if (process.env.NODE_ENV === 'production' && !liteProductionEnabled) {
    warnings.push('Production environment detected without LITE_PRODUCTION_MODE. Consider enabling for SQLite-based production.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    liteProductionEnabled
  };
}

// Auto-check on import
if (typeof window === 'undefined') {
  // Only run on server-side to avoid duplicate client logs
  const result = checkEnvironmentConfiguration();

  if (result.errors.length > 0) {
    logger.error('🚨 Environment Configuration Errors:');
    result.errors.forEach(error => logger.error(`  ❌ ${error}`));
  }

  if (result.warnings.length > 0 && process.env.SUPPRESS_ENV_WARNINGS !== 'true') {
    logger.warn('⚠️ Environment Configuration Warnings:');
    result.warnings.forEach(warning => logger.warn(`  ⚠️ ${warning}`));
  }
}