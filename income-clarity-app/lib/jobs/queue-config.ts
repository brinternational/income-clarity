/**
 * Queue Configuration Service
 * Central configuration for BullMQ queues, Redis connection, and job options
 */

import { ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../logger';

// Environment variables with fallbacks
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  maxMemoryPolicy: 'allkeys-lru',
} as const;

// Queue Names - Centralized queue definitions
export const QUEUE_NAMES = {
  SYNC: 'sync',
  EMAIL: 'email', 
  CLEANUP: 'cleanup',
  WEBHOOK: 'webhook',
  NOTIFICATIONS: 'notifications',
} as const;

// Job Types for each queue
export const JOB_TYPES = {
  SYNC: {
    YODLEE_LOGIN: 'yodlee:sync:login',
    YODLEE_MANUAL: 'yodlee:sync:manual', 
    YODLEE_SCHEDULED: 'yodlee:sync:scheduled',
    YODLEE_WEBHOOK: 'yodlee:sync:webhook',
    STOCK_PRICES: 'sync:stock-prices',
    PORTFOLIO_REFRESH: 'sync:portfolio-refresh',
  },
  EMAIL: {
    WELCOME: 'email:welcome',
    UPGRADE: 'email:upgrade',
    SYNC_SUCCESS: 'email:sync:success',
    SYNC_FAILURE: 'email:sync:failure',
    WEEKLY_DIGEST: 'email:weekly-digest',
    PASSWORD_RESET: 'email:password-reset',
    SUBSCRIPTION_REMINDER: 'email:subscription-reminder',
  },
  CLEANUP: {
    SYNC_LOGS: 'cleanup:sync-logs',
    SESSIONS: 'cleanup:sessions',
    CACHE: 'cleanup:cache',
    OLD_DATA: 'cleanup:old-data',
    TEMP_FILES: 'cleanup:temp-files',
  },
  WEBHOOK: {
    YODLEE_REFRESH: 'webhook:yodlee:refresh',
    YODLEE_DATA_UPDATE: 'webhook:yodlee:data-update',
    PAYMENT_SUCCESS: 'webhook:payment:success',
    PAYMENT_FAILED: 'webhook:payment:failed',
  },
  NOTIFICATIONS: {
    SYNC_COMPLETE: 'notification:sync-complete',
    PORTFOLIO_ALERT: 'notification:portfolio-alert',
    SYSTEM_MAINTENANCE: 'notification:system-maintenance',
  },
} as const;

// Priority Levels (higher number = higher priority)
export const JOB_PRIORITY = {
  CRITICAL: 10,  // Webhook syncs, payment processing
  HIGH: 5,       // Manual syncs, email notifications
  NORMAL: 3,     // Scheduled syncs
  LOW: 1,        // Cleanup tasks
} as const;

// Default job options for reliability
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
  removeOnComplete: {
    age: 3600, // 1 hour
    count: 100,
  },
  removeOnFail: {
    age: 86400, // 24 hours
    count: 50,
  },
  delay: 0,
} as const;

// Queue-specific options
export const QUEUE_OPTIONS = {
  [QUEUE_NAMES.SYNC]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 5000,
    },
    removeOnComplete: {
      age: 7200, // 2 hours
      count: 200,
    },
  },
  [QUEUE_NAMES.EMAIL]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 5,
    backoff: {
      type: 'exponential' as const,
      delay: 1000,
    },
    removeOnComplete: {
      age: 86400, // 24 hours
      count: 500,
    },
  },
  [QUEUE_NAMES.CLEANUP]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 2,
    backoff: {
      type: 'fixed' as const,
      delay: 10000,
    },
    removeOnComplete: {
      age: 86400, // 24 hours
      count: 50,
    },
  },
  [QUEUE_NAMES.WEBHOOK]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 5,
    backoff: {
      type: 'exponential' as const,
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // 1 hour
      count: 100,
    },
  },
  [QUEUE_NAMES.NOTIFICATIONS]: {
    ...DEFAULT_JOB_OPTIONS,
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400, // 24 hours
      count: 200,
    },
  },
} as const;

// Rate limiting configuration per queue
export const RATE_LIMITS = {
  [QUEUE_NAMES.SYNC]: {
    max: 10,     // Max 10 jobs
    duration: 60000, // Per minute
  },
  [QUEUE_NAMES.EMAIL]: {
    max: 100,    // Max 100 emails
    duration: 60000, // Per minute
  },
  [QUEUE_NAMES.WEBHOOK]: {
    max: 50,     // Max 50 webhooks
    duration: 60000, // Per minute
  },
  [QUEUE_NAMES.CLEANUP]: {
    max: 5,      // Max 5 cleanup jobs
    duration: 300000, // Per 5 minutes
  },
  [QUEUE_NAMES.NOTIFICATIONS]: {
    max: 200,    // Max 200 notifications
    duration: 60000, // Per minute
  },
} as const;

// Cron patterns for scheduled jobs
export const CRON_PATTERNS = {
  NIGHTLY_SYNC: '0 2 * * *',        // 2 AM daily
  CLEANUP_WEEKLY: '0 3 * * 0',      // 3 AM Sunday
  EMAIL_DIGEST: '0 9 * * 1',        // 9 AM Monday
  STOCK_PRICES: '0 */4 * * *',      // Every 4 hours
  SESSION_CLEANUP: '0 */2 * * *',   // Every 2 hours
  CACHE_REFRESH: '*/30 * * * *',    // Every 30 minutes
} as const;

/**
 * Create Redis connection with proper error handling and monitoring
 */
export function createRedisConnection(): IORedis {
  const redis = new IORedis(REDIS_CONFIG);

  redis.on('connect', () => {
    logger.info('Redis connected successfully', { 
      host: REDIS_CONFIG.host, 
      port: REDIS_CONFIG.port,
      db: REDIS_CONFIG.db
    });
  });

  redis.on('ready', () => {
    logger.info('Redis connection ready');
  });

  redis.on('error', (error) => {
    logger.error('Redis connection error', { 
      error: error.message,
      host: REDIS_CONFIG.host,
      port: REDIS_CONFIG.port
    });
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  redis.on('reconnecting', (time) => {
    logger.info('Redis reconnecting', { delayMs: time });
  });

  redis.on('end', () => {
    logger.warn('Redis connection ended');
  });

  return redis;
}

/**
 * Get BullMQ connection options
 */
export function getBullMQConnection(): ConnectionOptions {
  return {
    connection: REDIS_CONFIG,
  };
}

/**
 * Validate Redis connection and configuration
 */
export async function validateRedisConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  let redis: IORedis | null = null;

  try {
    redis = createRedisConnection();
    
    // Test basic connection
    await redis.ping();
    
    // Test read/write operations
    const testKey = 'queue:health:check';
    const testValue = Date.now().toString();
    
    await redis.set(testKey, testValue, 'EX', 10); // Expire in 10 seconds
    const retrievedValue = await redis.get(testKey);
    
    if (retrievedValue !== testValue) {
      throw new Error('Redis read/write test failed');
    }
    
    // Get Redis info
    const info = await redis.info('server');
    const memoryInfo = await redis.info('memory');
    
    // Cleanup test key
    await redis.del(testKey);
    
    return {
      success: true,
      message: 'Redis connection validated successfully',
      details: {
        server: info.split('\n').find(line => line.startsWith('redis_version')),
        memory: memoryInfo.split('\n').find(line => line.startsWith('used_memory_human')),
        config: {
          host: REDIS_CONFIG.host,
          port: REDIS_CONFIG.port,
          db: REDIS_CONFIG.db,
        }
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Redis validation failed: ${error.message}`,
      details: {
        config: {
          host: REDIS_CONFIG.host,
          port: REDIS_CONFIG.port,
          db: REDIS_CONFIG.db,
        }
      }
    };
  } finally {
    if (redis) {
      await redis.quit();
    }
  }
}

/**
 * Get job options for specific queue and job type
 */
export function getJobOptions(
  queueName: keyof typeof QUEUE_NAMES,
  priority: keyof typeof JOB_PRIORITY = 'NORMAL',
  customOptions: Partial<typeof DEFAULT_JOB_OPTIONS> = {}
) {
  const baseOptions = QUEUE_OPTIONS[QUEUE_NAMES[queueName]] || DEFAULT_JOB_OPTIONS;
  
  return {
    ...baseOptions,
    priority: JOB_PRIORITY[priority],
    ...customOptions,
  };
}

/**
 * Health check for queue system
 */
export async function getQueueSystemHealth(): Promise<{
  redis: boolean;
  queues: Record<string, boolean>;
  memory: string;
  errors: string[];
}> {
  const errors: string[] = [];
  let redis: IORedis | null = null;
  
  try {
    redis = createRedisConnection();
    
    // Test Redis
    await redis.ping();
    const redisHealthy = true;
    
    // Get memory usage
    const memoryInfo = await redis.info('memory');
    const memoryMatch = memoryInfo.match(/used_memory_human:(.+)/);
    const memory = memoryMatch ? memoryMatch[1].trim() : 'Unknown';
    
    // Test each queue (simplified check)
    const queues: Record<string, boolean> = {};
    for (const queueName of Object.values(QUEUE_NAMES)) {
      try {
        // Simple check - just verify we can access queue info
        const queueKey = `bull:${queueName}:meta`;
        await redis.exists(queueKey);
        queues[queueName] = true;
      } catch (error) {
        queues[queueName] = false;
        errors.push(`Queue ${queueName}: ${error.message}`);
      }
    }
    
    return {
      redis: redisHealthy,
      queues,
      memory,
      errors,
    };
    
  } catch (error) {
    errors.push(`Redis: ${error.message}`);
    
    return {
      redis: false,
      queues: Object.fromEntries(Object.values(QUEUE_NAMES).map(name => [name, false])),
      memory: 'Unknown',
      errors,
    };
  } finally {
    if (redis) {
      await redis.quit();
    }
  }
}

// Export types for use in other modules
export type QueueName = keyof typeof QUEUE_NAMES;
export type JobType = string;
export type JobPriority = keyof typeof JOB_PRIORITY;

// Export singleton Redis connection for reuse
let redisInstance: IORedis | null = null;

export function getRedisInstance(): IORedis {
  if (!redisInstance) {
    redisInstance = createRedisConnection();
  }
  return redisInstance;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
  }
}