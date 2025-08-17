/**
 * Production-Grade Rate Limiting Service
 * 
 * Implements comprehensive rate limiting with:
 * - Redis-based distributed rate limiting
 * - Per-API rate tracking
 * - Queue management with priority
 * - Exponential backoff and retry logic
 * - Circuit breaker pattern
 * - Request batching optimization
 * - Detailed monitoring and metrics
 */

import Redis from 'ioredis';
import { logger } from '@/lib/logger';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
  burstLimit?: number;
  queueSize?: number;
  priority?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: Date;
  retryAfter?: number;
  queuePosition?: number;
}

export interface ApiLimits {
  POLYGON: {
    FREE_TIER: { requests: 5; window: 60000 }; // 5 requests per minute
    BASIC_TIER: { requests: 100; window: 60000 }; // 100 requests per minute
  };
  YODLEE: {
    AUTH: { requests: 10; window: 60000 }; // 10 auth requests per minute
    DATA: { requests: 100; window: 3600000 }; // 100 data requests per hour
    REFRESH: { requests: 50; window: 3600000 }; // 50 refresh requests per hour
  };
  INTERNAL: {
    USER_ACTIONS: { requests: 100; window: 60000 }; // 100 user actions per minute
    PORTFOLIO_REFRESH: { requests: 10; window: 300000 }; // 10 portfolio refreshes per 5 minutes
  };
}

export class RateLimiterService {
  private redis: Redis;
  private redisConnected: boolean = false;
  private memoryLimits: Map<string, { count: number; windowStart: number; windowMs: number; maxRequests: number }> = new Map();
  private requestQueues: Map<string, Array<{ id: string; resolve: Function; reject: Function; priority: number; timestamp: number }>> = new Map();
  private circuitBreakers: Map<string, { failures: number; lastFailure: number; state: 'closed' | 'open' | 'half-open' }> = new Map();
  private metrics: Map<string, { requests: number; errors: number; avgResponseTime: number }> = new Map();

  // API Rate Limits Configuration
  public readonly API_LIMITS: ApiLimits = {
    POLYGON: {
      FREE_TIER: { requests: 5, window: 60000 },
      BASIC_TIER: { requests: 100, window: 60000 }
    },
    YODLEE: {
      AUTH: { requests: 10, window: 60000 },
      DATA: { requests: 100, window: 3600000 },
      REFRESH: { requests: 50, window: 3600000 }
    },
    INTERNAL: {
      USER_ACTIONS: { requests: 100, window: 60000 },
      PORTFOLIO_REFRESH: { requests: 10, window: 300000 }
    }
  };

  constructor() {
    // Initialize Redis with graceful fallback
    this.initializeRedis();

    // Start queue processors
    this.startQueueProcessors();
    
    // Start memory cleanup for fallback mode
    this.startMemoryCleanup();
    
    logger.log('🚦 Rate Limiter Service initialized (Redis optional)');
  }

  /**
   * Initialize Redis with graceful fallback
   */
  private async initializeRedis(): Promise<void> {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 2, // Reduced retries
        lazyConnect: true,
        connectTimeout: 5000 // 5 second timeout
      });

      this.redis.on('connect', () => {
        this.redisConnected = true;
        logger.log('✅ Rate Limiter Redis connected');
      });

      this.redis.on('error', (error) => {
        this.redisConnected = false;
        logger.warn('⚠️ Rate Limiter Redis error (memory fallback mode):', error.message);
      });

      this.redis.on('close', () => {
        this.redisConnected = false;
        logger.warn('⚠️ Rate Limiter Redis connection closed (memory fallback mode)');
      });

      // Test connection with timeout
      try {
        await Promise.race([
          this.redis.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
        ]);
        this.redisConnected = true;
        logger.log('✅ Rate Limiter Redis connection verified');
      } catch (error) {
        this.redisConnected = false;
        logger.warn('⚠️ Rate Limiter Redis unavailable, using memory-based rate limiting');
      }
    } catch (error) {
      this.redisConnected = false;
      this.redis = null;
      logger.warn('⚠️ Rate Limiter Redis initialization failed, using memory-based rate limiting:', (error as Error).message);
    }
  }

  /**
   * Check if request is allowed under rate limit
   */
  async checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const resetTime = new Date(now + config.windowMs);

    try {
      // Use Redis if available, otherwise fallback to memory
      if (this.redisConnected && this.redis) {
        return await this.checkRateLimitRedis(config, now, resetTime);
      } else {
        return await this.checkRateLimitMemory(config, now, resetTime);
      }
    } catch (error) {
      logger.error('Rate limit check failed:', error);
      
      // Fail open in case of Redis issues (log the failure)
      logger.warn('⚠️ Rate limiting failed open due to error');
      return {
        allowed: true,
        remainingRequests: config.maxRequests,
        resetTime
      };
    }
  }

  /**
   * Redis-based rate limiting (distributed)
   */
  private async checkRateLimitRedis(config: RateLimitConfig, now: number, resetTime: Date): Promise<RateLimitResult> {
    if (!this.redis) {
      throw new Error('Redis not available');
    }

    const key = `rate_limit:${config.identifier}`;
    const windowStart = now - config.windowMs;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests in window
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiry
      pipeline.expire(key, Math.ceil(config.windowMs / 1000));
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis pipeline failed');
      }

      const currentCount = (results[1][1] as number) || 0;
      const remainingRequests = Math.max(0, config.maxRequests - currentCount);

      return this.handleRateLimitResult(config, currentCount, remainingRequests, resetTime, now);
    } catch (error) {
      this.redisConnected = false;
      logger.warn('⚠️ Redis rate limit check failed, falling back to memory:', (error as Error).message);
      return await this.checkRateLimitMemory(config, now, resetTime);
    }
  }

  /**
   * Memory-based rate limiting (single instance)
   */
  private async checkRateLimitMemory(config: RateLimitConfig, now: number, resetTime: Date): Promise<RateLimitResult> {
    const key = config.identifier;
    let limitData = this.memoryLimits.get(key);

    // Initialize or reset window if needed
    if (!limitData || now - limitData.windowStart >= config.windowMs) {
      limitData = {
        count: 0,
        windowStart: now,
        windowMs: config.windowMs,
        maxRequests: config.maxRequests
      };
    }

    // Increment count
    limitData.count++;
    this.memoryLimits.set(key, limitData);

    const remainingRequests = Math.max(0, config.maxRequests - limitData.count);
    
    return this.handleRateLimitResult(config, limitData.count, remainingRequests, resetTime, now);
  }

  /**
   * Handle rate limit result logic (shared between Redis and memory)
   */
  private handleRateLimitResult(
    config: RateLimitConfig, 
    currentCount: number, 
    remainingRequests: number, 
    resetTime: Date, 
    now: number
  ): RateLimitResult {
    // Check if allowed
    if (currentCount >= config.maxRequests) {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(config.identifier)) {
        const retryAfter = this.getCircuitBreakerRetryAfter(config.identifier);
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime,
          retryAfter
        };
      }

      // Add to queue if burst limit not exceeded
      if (config.queueSize && config.queueSize > 0) {
        const queuePosition = this.addToQueueSync(config);
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime,
          queuePosition,
          retryAfter: this.calculateQueueRetryTime(queuePosition, config.windowMs)
        };
      }

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime,
        retryAfter: config.windowMs - (now % config.windowMs)
      };
    }

    return {
      allowed: true,
      remainingRequests,
      resetTime
    };
  }

  /**
   * Execute function with rate limiting and retry logic
   */
  async executeWithRateLimit<T>(
    apiCall: () => Promise<T>,
    config: RateLimitConfig,
    maxRetries: number = 3
  ): Promise<T> {
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check rate limit
        const rateLimitResult = await this.checkRateLimit(config);
        
        if (!rateLimitResult.allowed) {
          if (rateLimitResult.queuePosition !== undefined) {
            // Wait in queue
            await this.waitInQueue(config.identifier, rateLimitResult.queuePosition);
          } else if (rateLimitResult.retryAfter) {
            // Wait for retry period with exponential backoff
            const backoffDelay = Math.min(
              rateLimitResult.retryAfter * Math.pow(2, attempt),
              30000 // Max 30 seconds
            );
            await this.sleep(backoffDelay);
            continue;
          } else {
            throw new Error('Rate limit exceeded and no retry time available');
          }
        }

        // Execute the API call
        const result = await apiCall();
        
        // Record success metrics
        this.recordMetrics(config.identifier, Date.now() - startTime, false);
        this.recordCircuitBreakerSuccess(config.identifier);
        
        return result;

      } catch (error) {
        lastError = error as Error;
        
        // Record failure metrics
        this.recordMetrics(config.identifier, Date.now() - startTime, true);
        this.recordCircuitBreakerFailure(config.identifier);
        
        // Check if it's a rate limit error (429 status)
        if (this.isRateLimitError(error)) {
          // Wait with exponential backoff
          const backoffDelay = Math.min(
            1000 * Math.pow(2, attempt),
            16000 // Max 16 seconds
          );
          await this.sleep(backoffDelay);
          continue;
        }
        
        // For non-rate-limit errors, throw immediately
        throw error;
      }
    }

    throw lastError!;
  }

  /**
   * Batch multiple API calls to optimize rate limit usage
   */
  async batchExecute<T>(
    items: Array<{ id: string; apiCall: () => Promise<T> }>,
    config: RateLimitConfig,
    batchSize: number = 5
  ): Promise<Map<string, { result?: T; error?: Error }>> {
    const results = new Map<string, { result?: T; error?: Error }>();
    
    // Process in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Execute batch with rate limiting
      const batchPromises = batch.map(async (item) => {
        try {
          const result = await this.executeWithRateLimit(item.apiCall, config);
          results.set(item.id, { result });
        } catch (error) {
          results.set(item.id, { error: error as Error });
        }
      });
      
      await Promise.all(batchPromises);
      
      // Wait between batches to respect rate limits
      if (i + batchSize < items.length) {
        const batchDelay = Math.ceil(config.windowMs / config.maxRequests);
        await this.sleep(batchDelay);
      }
    }
    
    return results;
  }

  /**
   * Get rate limit status for monitoring
   */
  async getRateLimitStatus(identifier: string): Promise<{
    currentRequests: number;
    maxRequests: number;
    windowMs: number;
    resetTime: Date;
    queueSize: number;
    circuitBreakerState: string;
  }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    
    try {
      const currentRequests = await this.redis.zcard(key);
      const queue = this.requestQueues.get(identifier) || [];
      const circuitBreaker = this.circuitBreakers.get(identifier);
      
      // Find matching config (simplified - in production, store config in Redis)
      const config = this.findConfigForIdentifier(identifier);
      
      return {
        currentRequests,
        maxRequests: config?.maxRequests || 0,
        windowMs: config?.windowMs || 60000,
        resetTime: new Date(now + (config?.windowMs || 60000)),
        queueSize: queue.length,
        circuitBreakerState: circuitBreaker?.state || 'closed'
      };
    } catch (error) {
      logger.error('Failed to get rate limit status:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive metrics for monitoring
   */
  getMetrics(): Record<string, {
    requests: number;
    errors: number;
    errorRate: number;
    avgResponseTime: number;
  }> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((metrics, identifier) => {
      result[identifier] = {
        requests: metrics.requests,
        errors: metrics.errors,
        errorRate: metrics.requests > 0 ? (metrics.errors / metrics.requests) * 100 : 0,
        avgResponseTime: metrics.avgResponseTime
      };
    });
    
    return result;
  }

  /**
   * Clear rate limits for testing or emergency reset
   */
  async clearRateLimits(identifier?: string): Promise<void> {
    try {
      if (identifier) {
        await this.redis.del(`rate_limit:${identifier}`);
        this.requestQueues.delete(identifier);
        this.circuitBreakers.delete(identifier);
        logger.log(`🔄 Cleared rate limits for ${identifier}`);
      } else {
        const keys = await this.redis.keys('rate_limit:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
        this.requestQueues.clear();
        this.circuitBreakers.clear();
        logger.log('🔄 Cleared all rate limits');
      }
    } catch (error) {
      logger.error('Failed to clear rate limits:', error);
      throw error;
    }
  }

  // Private helper methods

  private addToQueueSync(config: RateLimitConfig): number {
    const queue = this.requestQueues.get(config.identifier) || [];
    const queueItem = {
      id: `${Date.now()}-${Math.random()}`,
      resolve: () => {},
      reject: () => {},
      priority: config.priority || 0,
      timestamp: Date.now()
    };
    
    // Add to queue with priority ordering
    queue.push(queueItem);
    queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
    
    // Trim queue if it exceeds max size
    if (config.queueSize && queue.length > config.queueSize) {
      const rejected = queue.splice(config.queueSize);
      rejected.forEach(item => item.reject(new Error('Queue overflow')));
    }
    
    this.requestQueues.set(config.identifier, queue);
    return queue.findIndex(item => item.id === queueItem.id) + 1;
  }

  private async addToQueue(config: RateLimitConfig): Promise<number> {
    return this.addToQueueSync(config);
  }

  private async waitInQueue(identifier: string, position: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const queue = this.requestQueues.get(identifier);
      if (!queue || position > queue.length) {
        resolve();
        return;
      }
      
      const queueItem = queue[position - 1];
      if (queueItem) {
        queueItem.resolve = resolve;
        queueItem.reject = reject;
      } else {
        resolve();
      }
    });
  }

  private startQueueProcessors(): void {
    // Process queues every second
    setInterval(() => {
      this.requestQueues.forEach((queue, identifier) => {
        if (queue.length > 0) {
          const item = queue.shift();
          if (item) {
            item.resolve();
          }
        }
      });
    }, 1000);
  }

  private calculateQueueRetryTime(position: number, windowMs: number): number {
    // Estimate retry time based on queue position and window
    return Math.ceil((position * windowMs) / 5); // Assume 5 requests can be processed per window
  }

  private isCircuitBreakerOpen(identifier: string): boolean {
    const breaker = this.circuitBreakers.get(identifier);
    if (!breaker) return false;
    
    const now = Date.now();
    
    // Reset to half-open after timeout
    if (breaker.state === 'open' && now - breaker.lastFailure > 60000) {
      breaker.state = 'half-open';
    }
    
    return breaker.state === 'open';
  }

  private getCircuitBreakerRetryAfter(identifier: string): number {
    const breaker = this.circuitBreakers.get(identifier);
    if (!breaker) return 60000;
    
    return Math.max(0, 60000 - (Date.now() - breaker.lastFailure));
  }

  private recordCircuitBreakerSuccess(identifier: string): void {
    const breaker = this.circuitBreakers.get(identifier) || { failures: 0, lastFailure: 0, state: 'closed' as const };
    breaker.failures = 0;
    breaker.state = 'closed';
    this.circuitBreakers.set(identifier, breaker);
  }

  private recordCircuitBreakerFailure(identifier: string): void {
    const breaker = this.circuitBreakers.get(identifier) || { failures: 0, lastFailure: 0, state: 'closed' as const };
    breaker.failures++;
    breaker.lastFailure = Date.now();
    
    // Open circuit breaker after 5 consecutive failures
    if (breaker.failures >= 5) {
      breaker.state = 'open';
    }
    
    this.circuitBreakers.set(identifier, breaker);
  }

  private recordMetrics(identifier: string, responseTime: number, isError: boolean): void {
    const metrics = this.metrics.get(identifier) || { requests: 0, errors: 0, avgResponseTime: 0 };
    
    metrics.requests++;
    if (isError) metrics.errors++;
    
    // Calculate rolling average response time
    metrics.avgResponseTime = (metrics.avgResponseTime * (metrics.requests - 1) + responseTime) / metrics.requests;
    
    this.metrics.set(identifier, metrics);
  }

  private isRateLimitError(error: any): boolean {
    // Check if error indicates rate limiting (429 status code)
    return error?.response?.status === 429 || 
           error?.status === 429 ||
           error?.message?.includes('rate limit') ||
           error?.message?.includes('429');
  }

  private findConfigForIdentifier(identifier: string): RateLimitConfig | null {
    // Simplified config lookup - in production, store configs in Redis or database
    if (identifier.includes('polygon')) {
      return {
        identifier,
        maxRequests: this.API_LIMITS.POLYGON.FREE_TIER.requests,
        windowMs: this.API_LIMITS.POLYGON.FREE_TIER.window
      };
    }
    if (identifier.includes('yodlee')) {
      return {
        identifier,
        maxRequests: this.API_LIMITS.YODLEE.DATA.requests,
        windowMs: this.API_LIMITS.YODLEE.DATA.window
      };
    }
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup method for graceful shutdown
   */
  /**
   * Start memory cleanup for fallback mode
   */
  private startMemoryCleanup(): void {
    // Clean up expired memory entries every minute
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, limitData] of this.memoryLimits.entries()) {
        if (now - limitData.windowStart >= limitData.windowMs) {
          this.memoryLimits.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        logger.log(`🧹 Cleaned up ${cleaned} expired rate limit entries from memory`);
      }
    }, 60000); // Every minute
  }

  async cleanup(): Promise<void> {
    try {
      if (this.redis && this.redisConnected) {
        await this.redis.quit();
      }
      logger.log('🔄 Rate Limiter Service cleaned up');
    } catch (error) {
      logger.error('Error during rate limiter cleanup:', error);
    }
  }
}

// Export singleton instance
export const rateLimiterService = new RateLimiterService();

// Export types
export type { RateLimitConfig, RateLimitResult, ApiLimits };