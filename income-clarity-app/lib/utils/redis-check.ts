/**
 * Redis Environment Check Utility
 * 
 * Provides a simple check to determine if Redis should be used
 * based on environment configuration
 */

export const isRedisEnabled = (): boolean => {
  // Check multiple environment flags
  if (process.env.REDIS_DISABLED === 'true') return false;
  if (process.env.DISABLE_REDIS_CONNECTIONS === 'true') return false;
  if (process.env.ENABLE_REDIS === 'false') return false;
  
  return true;
};

export const shouldUseRedis = isRedisEnabled;

// For backwards compatibility
export default {
  isRedisEnabled,
  shouldUseRedis
};