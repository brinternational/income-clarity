/**
 * Yodlee API Rate Limited Service
 * 
 * Production-grade wrapper for Yodlee API with:
 * - Comprehensive rate limiting per endpoint type
 * - Smart caching strategies for different data types
 * - Request batching and optimization
 * - Circuit breaker pattern for API failures
 * - Retry logic with exponential backoff
 * - Token management with refresh
 * - Monitoring and metrics
 */

import { rateLimiterService, RateLimitConfig } from '../rate-limiter/rate-limiter.service';
import { cacheService, CacheConfig } from '../cache/cache.service';
import { yodleeClient, YodleeAccount, YodleeTransaction, YodleeHolding } from './yodlee-client.service';
import { logger } from '@/lib/logger';

export interface YodleeRateLimitedRequest<T> {
  operation: () => Promise<T>;
  endpoint: 'auth' | 'accounts' | 'transactions' | 'holdings' | 'refresh';
  userId: string;
  priority?: number;
  cacheKey?: string;
  cacheTtl?: number;
  bypassCache?: boolean;
}

export interface YodleeRateLimitedResponse<T> {
  data: T;
  fromCache: boolean;
  rateLimitInfo: {
    endpoint: string;
    remainingRequests: number;
    resetTime: Date;
    queuePosition?: number;
  };
  executionTime: number;
}

export interface YodleeBatchRequest {
  userTokens: string[];
  operation: 'accounts' | 'transactions' | 'holdings';
  parameters?: any;
  priority?: number;
}

export interface YodleeBatchResponse<T> {
  results: Map<string, { data?: T; error?: string }>;
  rateLimitInfo: any;
  totalExecutionTime: number;
  successfulRequests: number;
  failedRequests: number;
}

export interface YodleeServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  rateLimitViolations: number;
  circuitBreakerTrips: number;
  endpointMetrics: Record<string, {
    requests: number;
    errors: number;
    avgResponseTime: number;
  }>;
}

export class YodleeRateLimitedService {
  // Rate limiting configurations per endpoint type
  private readonly RATE_CONFIGS = {
    AUTH: {
      identifier: 'yodlee_auth',
      maxRequests: 10,
      windowMs: 60 * 1000, // 10 auth requests per minute
      queueSize: 20,
      priority: 1
    } as RateLimitConfig,
    
    ACCOUNTS: {
      identifier: 'yodlee_accounts',
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 100 account requests per hour
      queueSize: 200,
      priority: 2
    } as RateLimitConfig,
    
    TRANSACTIONS: {
      identifier: 'yodlee_transactions',
      maxRequests: 50,
      windowMs: 60 * 60 * 1000, // 50 transaction requests per hour
      queueSize: 100,
      priority: 2
    } as RateLimitConfig,
    
    HOLDINGS: {
      identifier: 'yodlee_holdings',
      maxRequests: 50,
      windowMs: 60 * 60 * 1000, // 50 holding requests per hour
      queueSize: 100,
      priority: 2
    } as RateLimitConfig,
    
    REFRESH: {
      identifier: 'yodlee_refresh',
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 20 refresh requests per hour
      queueSize: 50,
      priority: 3
    } as RateLimitConfig
  };

  // Cache configurations for different data types
  private readonly CACHE_CONFIGS = {
    USER_TOKEN: {
      key: 'yodlee_token',
      ttl: 15 * 60 * 1000, // 15 minutes
      tier: 'redis' as const,
      tags: ['auth', 'tokens']
    },
    
    ACCOUNTS: {
      key: 'yodlee_accounts',
      ttl: 24 * 60 * 60 * 1000, // 24 hours (accounts don't change often)
      tier: 'all' as const,
      tags: ['accounts', 'user-data']
    },
    
    TRANSACTIONS: {
      key: 'yodlee_transactions',
      ttl: 60 * 60 * 1000, // 1 hour
      tier: 'all' as const,
      tags: ['transactions', 'financial-data']
    },
    
    HOLDINGS: {
      key: 'yodlee_holdings',
      ttl: 30 * 60 * 1000, // 30 minutes
      tier: 'all' as const,
      tags: ['holdings', 'investment-data']
    },
    
    REFRESH_STATUS: {
      key: 'yodlee_refresh_status',
      ttl: 5 * 60 * 1000, // 5 minutes
      tier: 'redis' as const,
      tags: ['refresh', 'status']
    }
  };

  private metrics: YodleeServiceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    rateLimitViolations: 0,
    circuitBreakerTrips: 0,
    endpointMetrics: {}
  };

  constructor() {
    logger.log('🏦 Yodlee Rate Limited Service initialized');
  }

  /**
   * Execute Yodlee API request with rate limiting and caching
   */
  async executeRequest<T>(request: YodleeRateLimitedRequest<T>): Promise<YodleeRateLimitedResponse<T>> {
    const startTime = Date.now();
    const { operation, endpoint, userId, priority = 1, cacheKey, cacheTtl, bypassCache = false } = request;
    
    let fromCache = false;
    let data: T;

    try {
      // 1. Check cache first (unless bypassed)
      if (cacheKey && !bypassCache) {
        const cached = await this.getCachedData<T>(cacheKey);
        if (cached !== null) {
          fromCache = true;
          data = cached;
          
          // Still get rate limit info for response
          const rateConfig = this.RATE_CONFIGS[endpoint.toUpperCase() as keyof typeof this.RATE_CONFIGS];
          const rateLimitStatus = await rateLimiterService.getRateLimitStatus(rateConfig.identifier);
          
          this.updateMetrics(endpoint, Date.now() - startTime, false, true);
          
          return {
            data,
            fromCache,
            rateLimitInfo: {
              endpoint,
              remainingRequests: rateLimitStatus.maxRequests - rateLimitStatus.currentRequests,
              resetTime: rateLimitStatus.resetTime
            },
            executionTime: Date.now() - startTime
          };
        }
      }

      // 2. Get rate limit configuration for endpoint
      const rateConfig = this.RATE_CONFIGS[endpoint.toUpperCase() as keyof typeof this.RATE_CONFIGS];
      if (!rateConfig) {
        throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      rateConfig.priority = priority;

      // 3. Execute with rate limiting
      data = await rateLimiterService.executeWithRateLimit(
        operation,
        rateConfig,
        3 // Max 3 retries
      );

      // 4. Cache the result if cache key provided
      if (cacheKey && data) {
        await this.cacheData(cacheKey, data, cacheTtl);
      }

      // 5. Get final rate limit status
      const rateLimitStatus = await rateLimiterService.getRateLimitStatus(rateConfig.identifier);
      
      this.updateMetrics(endpoint, Date.now() - startTime, false, fromCache);

      return {
        data,
        fromCache,
        rateLimitInfo: {
          endpoint,
          remainingRequests: rateLimitStatus.maxRequests - rateLimitStatus.currentRequests,
          resetTime: rateLimitStatus.resetTime,
          queuePosition: rateLimitStatus.queueSize > 0 ? rateLimitStatus.queueSize : undefined
        },
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      this.updateMetrics(endpoint, Date.now() - startTime, true, fromCache);
      
      // Handle rate limit violations
      if (this.isRateLimitError(error)) {
        this.metrics.rateLimitViolations++;
      }
      
      logger.error(`Yodlee ${endpoint} request failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user token with caching and rate limiting
   */
  async getUserToken(yodleeUserId: string, bypassCache: boolean = false): Promise<string> {
    const cacheKey = `${this.CACHE_CONFIGS.USER_TOKEN.key}:${yodleeUserId}`;
    
    const response = await this.executeRequest({
      operation: () => yodleeClient.getUserToken(yodleeUserId),
      endpoint: 'auth',
      userId: yodleeUserId,
      priority: 1,
      cacheKey,
      cacheTtl: this.CACHE_CONFIGS.USER_TOKEN.ttl,
      bypassCache
    });

    return response.data;
  }

  /**
   * Get user accounts with caching and rate limiting
   */
  async getAccounts(userToken: string, userId: string, forceRefresh: boolean = false): Promise<YodleeAccount[]> {
    const cacheKey = `${this.CACHE_CONFIGS.ACCOUNTS.key}:${userId}`;
    
    const response = await this.executeRequest({
      operation: () => yodleeClient.getAccounts(userToken),
      endpoint: 'accounts',
      userId,
      priority: 2,
      cacheKey,
      cacheTtl: this.CACHE_CONFIGS.ACCOUNTS.ttl,
      bypassCache: forceRefresh
    });

    return response.data;
  }

  /**
   * Get user transactions with caching and rate limiting
   */
  async getTransactions(
    userToken: string,
    userId: string,
    fromDate?: string,
    toDate?: string,
    accountIds?: string[],
    forceRefresh: boolean = false
  ): Promise<YodleeTransaction[]> {
    const cacheKey = `${this.CACHE_CONFIGS.TRANSACTIONS.key}:${userId}:${fromDate || 'all'}:${toDate || 'all'}:${accountIds?.join(',') || 'all'}`;
    
    const response = await this.executeRequest({
      operation: () => yodleeClient.getTransactions(userToken, fromDate, toDate, accountIds),
      endpoint: 'transactions',
      userId,
      priority: 2,
      cacheKey,
      cacheTtl: this.CACHE_CONFIGS.TRANSACTIONS.ttl,
      bypassCache: forceRefresh
    });

    return response.data;
  }

  /**
   * Get user holdings with caching and rate limiting
   */
  async getHoldings(
    userToken: string,
    userId: string,
    accountIds?: string[],
    forceRefresh: boolean = false
  ): Promise<YodleeHolding[]> {
    const cacheKey = `${this.CACHE_CONFIGS.HOLDINGS.key}:${userId}:${accountIds?.join(',') || 'all'}`;
    
    const response = await this.executeRequest({
      operation: () => yodleeClient.getHoldings(userToken, accountIds),
      endpoint: 'holdings',
      userId,
      priority: 2,
      cacheKey,
      cacheTtl: this.CACHE_CONFIGS.HOLDINGS.ttl,
      bypassCache: forceRefresh
    });

    return response.data;
  }

  /**
   * Refresh account data with rate limiting
   */
  async refreshAccount(userToken: string, accountId: string, userId: string): Promise<void> {
    await this.executeRequest({
      operation: () => yodleeClient.refreshAccount(userToken, accountId),
      endpoint: 'refresh',
      userId,
      priority: 3
    });

    // Invalidate related caches
    await this.invalidateUserCaches(userId);
  }

  /**
   * Get refresh status with caching
   */
  async getRefreshStatus(userToken: string, accountId: string, userId: string): Promise<any> {
    const cacheKey = `${this.CACHE_CONFIGS.REFRESH_STATUS.key}:${userId}:${accountId}`;
    
    const response = await this.executeRequest({
      operation: () => yodleeClient.getRefreshStatus(userToken, accountId),
      endpoint: 'refresh',
      userId,
      priority: 2,
      cacheKey,
      cacheTtl: this.CACHE_CONFIGS.REFRESH_STATUS.ttl
    });

    return response.data;
  }

  /**
   * Batch execute operations for multiple users
   */
  async batchExecute<T>(request: YodleeBatchRequest): Promise<YodleeBatchResponse<T>> {
    const { userTokens, operation, parameters = {}, priority = 2 } = request;
    const startTime = Date.now();
    const results = new Map<string, { data?: T; error?: string }>();
    
    let successfulRequests = 0;
    let failedRequests = 0;

    // Process in smaller batches to respect rate limits
    const batchSize = 5; // Conservative batch size
    
    for (let i = 0; i < userTokens.length; i += batchSize) {
      const batch = userTokens.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (userToken, index) => {
        const userId = `batch_user_${i + index}`;
        
        try {
          let data: T;
          
          switch (operation) {
            case 'accounts':
              data = await this.getAccounts(userToken, userId) as T;
              break;
            case 'transactions':
              data = await this.getTransactions(
                userToken, 
                userId, 
                parameters.fromDate, 
                parameters.toDate, 
                parameters.accountIds
              ) as T;
              break;
            case 'holdings':
              data = await this.getHoldings(
                userToken, 
                userId, 
                parameters.accountIds
              ) as T;
              break;
            default:
              throw new Error(`Unsupported batch operation: ${operation}`);
          }
          
          results.set(userToken, { data });
          successfulRequests++;
          
        } catch (error) {
          results.set(userToken, { error: error instanceof Error ? error.message : 'Unknown error' });
          failedRequests++;
        }
      });
      
      await Promise.all(batchPromises);
      
      // Add delay between batches
      if (i + batchSize < userTokens.length) {
        const rateConfig = this.RATE_CONFIGS[operation.toUpperCase() as keyof typeof this.RATE_CONFIGS];
        const delayMs = Math.ceil(rateConfig.windowMs / rateConfig.maxRequests);
        await this.sleep(delayMs);
      }
    }

    // Get rate limit info for the operation
    const rateConfig = this.RATE_CONFIGS[operation.toUpperCase() as keyof typeof this.RATE_CONFIGS];
    const rateLimitInfo = await rateLimiterService.getRateLimitStatus(rateConfig.identifier);

    return {
      results,
      rateLimitInfo,
      totalExecutionTime: Date.now() - startTime,
      successfulRequests,
      failedRequests
    };
  }

  /**
   * Get service metrics for monitoring
   */
  getMetrics(): YodleeServiceMetrics {
    // Calculate cache hit rate
    const totalCacheChecks = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.cacheHitRate = totalCacheChecks > 0 
      ? (this.metrics.successfulRequests / totalCacheChecks) * 100 
      : 0;

    return { ...this.metrics };
  }

  /**
   * Get rate limit status for all endpoints
   */
  async getRateLimitStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};
    
    for (const [endpoint, config] of Object.entries(this.RATE_CONFIGS)) {
      status[endpoint.toLowerCase()] = await rateLimiterService.getRateLimitStatus(config.identifier);
    }
    
    return status;
  }

  /**
   * Clear all Yodlee caches
   */
  async clearAllCaches(): Promise<void> {
    await cacheService.invalidateByTags(['auth', 'accounts', 'transactions', 'holdings', 'refresh']);
    logger.log('🧹 All Yodlee caches cleared');
  }

  /**
   * Clear caches for specific user
   */
  async invalidateUserCaches(userId: string): Promise<void> {
    const patterns = [
      `${this.CACHE_CONFIGS.USER_TOKEN.key}:${userId}`,
      `${this.CACHE_CONFIGS.ACCOUNTS.key}:${userId}`,
      `${this.CACHE_CONFIGS.TRANSACTIONS.key}:${userId}*`,
      `${this.CACHE_CONFIGS.HOLDINGS.key}:${userId}*`,
      `${this.CACHE_CONFIGS.REFRESH_STATUS.key}:${userId}*`
    ];

    for (const pattern of patterns) {
      await cacheService.delete(pattern);
    }
    
    logger.log(`🧹 Cleared Yodlee caches for user ${userId}`);
  }

  /**
   * Health check for Yodlee service
   */
  async healthCheck(): Promise<{
    configured: boolean;
    rateLimitStatus: Record<string, any>;
    cacheStats: any;
    metrics: YodleeServiceMetrics;
    testResult?: any;
  }> {
    const [rateLimitStatus, cacheStats] = await Promise.all([
      this.getRateLimitStatus(),
      cacheService.getStats()
    ]);

    let testResult;
    if (yodleeClient.isServiceConfigured()) {
      try {
        // Test basic connection (just check configuration)
        testResult = yodleeClient.getConfigurationStatus();
      } catch (error) {
        testResult = { success: false, error: error.message };
      }
    }

    return {
      configured: yodleeClient.isServiceConfigured(),
      rateLimitStatus,
      cacheStats,
      metrics: this.getMetrics(),
      testResult
    };
  }

  // Private helper methods

  private async getCachedData<T>(cacheKey: string): Promise<T | null> {
    return await cacheService.get<T>(cacheKey);
  }

  private async cacheData<T>(cacheKey: string, data: T, ttl?: number): Promise<void> {
    // Determine cache config based on key prefix
    let cacheConfig: CacheConfig;
    
    if (cacheKey.includes('token')) {
      cacheConfig = { ...this.CACHE_CONFIGS.USER_TOKEN, key: cacheKey };
    } else if (cacheKey.includes('accounts')) {
      cacheConfig = { ...this.CACHE_CONFIGS.ACCOUNTS, key: cacheKey };
    } else if (cacheKey.includes('transactions')) {
      cacheConfig = { ...this.CACHE_CONFIGS.TRANSACTIONS, key: cacheKey };
    } else if (cacheKey.includes('holdings')) {
      cacheConfig = { ...this.CACHE_CONFIGS.HOLDINGS, key: cacheKey };
    } else {
      cacheConfig = { ...this.CACHE_CONFIGS.REFRESH_STATUS, key: cacheKey };
    }

    if (ttl) {
      cacheConfig.ttl = ttl;
    }

    await cacheService.set(cacheKey, data, cacheConfig);
  }

  private updateMetrics(endpoint: string, responseTime: number, isError: boolean, fromCache: boolean): void {
    this.metrics.totalRequests++;
    
    if (isError) {
      this.metrics.failedRequests++;
    } else {
      this.metrics.successfulRequests++;
    }

    // Update average response time
    const totalResponses = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime = (
      (this.metrics.averageResponseTime * (totalResponses - 1)) + responseTime
    ) / totalResponses;

    // Update endpoint-specific metrics
    if (!this.metrics.endpointMetrics[endpoint]) {
      this.metrics.endpointMetrics[endpoint] = {
        requests: 0,
        errors: 0,
        avgResponseTime: 0
      };
    }

    const endpointMetrics = this.metrics.endpointMetrics[endpoint];
    endpointMetrics.requests++;
    
    if (isError) {
      endpointMetrics.errors++;
    }

    endpointMetrics.avgResponseTime = (
      (endpointMetrics.avgResponseTime * (endpointMetrics.requests - 1)) + responseTime
    ) / endpointMetrics.requests;
  }

  private isRateLimitError(error: any): boolean {
    return error?.response?.status === 429 || 
           error?.status === 429 ||
           error?.message?.includes('rate limit') ||
           error?.message?.includes('429') ||
           error?.message?.includes('quota');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const yodleeRateLimitedService = new YodleeRateLimitedService();

// Export types for external use
export type { 
  YodleeRateLimitedRequest as YodleeRLRequest, 
  YodleeRateLimitedResponse as YodleeRLResponse, 
  YodleeBatchRequest as YodleeRLBatchRequest, 
  YodleeBatchResponse as YodleeRLBatchResponse, 
  YodleeServiceMetrics as YodleeRLServiceMetrics 
};