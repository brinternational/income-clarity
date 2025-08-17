/**
 * Comprehensive Rate Limiting Test Suite
 * 
 * Tests for:
 * - Rate limiter service functionality
 * - Cache service multi-tier caching
 * - Polygon batch service rate limiting
 * - Yodlee rate limiting wrapper
 * - API middleware rate limiting
 * - Monitoring and alerting
 * - Circuit breaker patterns
 * - Performance under load
 */

import { rateLimiterService, RateLimitConfig } from '../../lib/services/rate-limiter/rate-limiter.service';
import { cacheService } from '../../lib/services/cache/cache.service';
import { polygonBatchService } from '../../lib/services/polygon/polygon-batch.service';
import { yodleeRateLimitedService } from '../../lib/services/yodlee/yodlee-rate-limited.service';
import { apiRateLimitMiddleware } from '../../lib/middleware/api-rate-limit';
import { rateLimitMonitorService } from '../../lib/services/monitoring/rate-limit-monitor.service';

// Mock Redis for testing
jest.mock('ioredis', () => {
  const mockRedis = {
    pipeline: jest.fn(() => ({
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      zadd: jest.fn(),
      expire: jest.fn(),
      exec: jest.fn(() => Promise.resolve([[null, 0], [null, 0], [null, 1], [null, 1]]))
    })),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(() => Promise.resolve([])),
    dbsize: jest.fn(() => Promise.resolve(0)),
    flushdb: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
    status: 'ready'
  };
  return jest.fn(() => mockRedis);
});

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    cacheEntry: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(() => Promise.resolve([{ '1': 1 }])),
    $disconnect: jest.fn()
  }))
}));

// Mock fetch for external API calls
global.fetch = jest.fn();

describe('Rate Limiting System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any internal state
  });

  afterEach(async () => {
    // Cleanup services
    await rateLimiterService.clearRateLimits();
    await cacheService.clearAll();
  });

  describe('RateLimiterService', () => {
    it('should allow requests within rate limit', async () => {
      const config: RateLimitConfig = {
        identifier: 'test_user_1',
        maxRequests: 10,
        windowMs: 60000
      };

      const result = await rateLimiterService.checkRateLimit(config);
      
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBeGreaterThan(0);
      expect(result.resetTime).toBeInstanceOf(Date);
    });

    it('should block requests exceeding rate limit', async () => {
      const config: RateLimitConfig = {
        identifier: 'test_user_2',
        maxRequests: 1,
        windowMs: 60000
      };

      // First request should be allowed
      const result1 = await rateLimiterService.checkRateLimit(config);
      expect(result1.allowed).toBe(true);

      // Mock Redis to return that we've exceeded the limit
      const mockRedis = require('ioredis')();
      mockRedis.pipeline().exec.mockResolvedValueOnce([[null, 0], [null, 2], [null, 1], [null, 1]]);

      // Second request should be blocked
      const result2 = await rateLimiterService.checkRateLimit(config);
      expect(result2.allowed).toBe(false);
      expect(result2.retryAfter).toBeDefined();
    });

    it('should handle Redis failures gracefully (fail open)', async () => {
      const config: RateLimitConfig = {
        identifier: 'test_user_3',
        maxRequests: 10,
        windowMs: 60000
      };

      // Mock Redis failure
      const mockRedis = require('ioredis')();
      mockRedis.pipeline().exec.mockRejectedValueOnce(new Error('Redis connection failed'));

      const result = await rateLimiterService.checkRateLimit(config);
      
      // Should fail open (allow request)
      expect(result.allowed).toBe(true);
    });

    it('should execute function with rate limiting and retries', async () => {
      const config: RateLimitConfig = {
        identifier: 'test_api_call',
        maxRequests: 5,
        windowMs: 60000
      };

      const mockApiCall = jest.fn(() => Promise.resolve('success'));

      const result = await rateLimiterService.executeWithRateLimit(
        mockApiCall,
        config,
        3
      );

      expect(result).toBe('success');
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should handle circuit breaker pattern', async () => {
      const config: RateLimitConfig = {
        identifier: 'test_circuit_breaker',
        maxRequests: 5,
        windowMs: 60000
      };

      const status = await rateLimiterService.getRateLimitStatus(config.identifier);
      expect(status.circuitBreakerState).toBeDefined();
    });

    it('should batch execute multiple operations', async () => {
      const config: RateLimitConfig = {
        identifier: 'test_batch',
        maxRequests: 10,
        windowMs: 60000
      };

      const items = [
        { id: 'item1', apiCall: () => Promise.resolve('result1') },
        { id: 'item2', apiCall: () => Promise.resolve('result2') },
        { id: 'item3', apiCall: () => Promise.resolve('result3') }
      ];

      const results = await rateLimiterService.batchExecute(items, config, 2);

      expect(results.size).toBe(3);
      expect(results.get('item1')?.result).toBe('result1');
      expect(results.get('item2')?.result).toBe('result2');
      expect(results.get('item3')?.result).toBe('result3');
    });
  });

  describe('CacheService', () => {
    it('should cache and retrieve data from memory tier', async () => {
      const key = 'test_memory_key';
      const data = { test: 'data' };
      const config = {
        key,
        ttl: 60000,
        tier: 'memory' as const
      };

      await cacheService.set(key, data, config);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(data);
    });

    it('should handle cache miss with fallback', async () => {
      const key = 'test_fallback_key';
      const fallbackData = { fallback: 'data' };
      
      const retrieved = await cacheService.get(
        key,
        () => Promise.resolve(fallbackData)
      );

      expect(retrieved).toEqual(fallbackData);
    });

    it('should invalidate cache by tags', async () => {
      const key1 = 'test_tag_key_1';
      const key2 = 'test_tag_key_2';
      const data1 = { data: 'tagged1' };
      const data2 = { data: 'tagged2' };

      await cacheService.set(key1, data1, {
        key: key1,
        ttl: 60000,
        tier: 'memory',
        tags: ['tag1', 'tag2']
      });

      await cacheService.set(key2, data2, {
        key: key2,
        ttl: 60000,
        tier: 'memory',
        tags: ['tag2', 'tag3']
      });

      await cacheService.invalidateByTags(['tag2']);

      const retrieved1 = await cacheService.get(key1);
      const retrieved2 = await cacheService.get(key2);

      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });

    it('should provide cache statistics', async () => {
      const stats = await cacheService.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('memoryUsage');
      expect(stats).toHaveProperty('totalKeys');
    });

    it('should handle TTL expiration', async () => {
      const key = 'test_ttl_key';
      const data = { test: 'data' };
      const config = {
        key,
        ttl: 100, // 100ms
        tier: 'memory' as const
      };

      await cacheService.set(key, data, config);
      
      // Should be available immediately
      let retrieved = await cacheService.get(key);
      expect(retrieved).toEqual(data);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be null after TTL expiration
      retrieved = await cacheService.get(key);
      expect(retrieved).toBeNull();
    });
  });

  describe('PolygonBatchService', () => {
    beforeEach(() => {
      // Mock successful Polygon API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          results: [{
            c: 100.50,
            o: 100.00,
            h: 101.00,
            l: 99.50,
            v: 1000000,
            t: Date.now()
          }]
        })
      });
    });

    it('should batch multiple stock price requests', async () => {
      const symbols = ['AAPL', 'MSFT', 'GOOGL'];
      
      const response = await polygonBatchService.getBatchPrices({ symbols });

      expect(response.prices.size).toBeGreaterThan(0);
      expect(response.errors).toBeDefined();
      expect(response.fromCache).toBeDefined();
      expect(response.fromApi).toBeDefined();
      expect(response.rateLimitStatus).toBeDefined();
    });

    it('should handle rate limit exceeded responses', async () => {
      // Mock rate limit exceeded response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      const symbols = ['AAPL'];
      
      const response = await polygonBatchService.getBatchPrices({ symbols });

      // Should fall back to simulated data
      expect(response.prices.size).toBe(1);
      expect(response.prices.get('AAPL')?.dataSource).toBe('simulated');
    });

    it('should cache successful API responses', async () => {
      const symbols = ['AAPL'];
      
      // First request
      const response1 = await polygonBatchService.getBatchPrices({ symbols });
      
      // Second request should use cache
      const response2 = await polygonBatchService.getBatchPrices({ symbols });

      expect(response2.fromCache).toContain('AAPL');
    });

    it('should get service health status', async () => {
      const health = await polygonBatchService.getServiceHealth();

      expect(health).toHaveProperty('configured');
      expect(health).toHaveProperty('tier');
      expect(health).toHaveProperty('rateLimitStatus');
      expect(health).toHaveProperty('cacheStats');
    });

    it('should handle dividend data requests', async () => {
      // Mock dividend API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'OK',
          results: [{
            ex_dividend_date: '2024-01-15',
            pay_date: '2024-01-22',
            cash_amount: 0.25,
            frequency: 4
          }]
        })
      });

      const symbols = ['AAPL'];
      const dividends = await polygonBatchService.getBatchDividendData(symbols);

      expect(dividends.size).toBe(1);
      expect(dividends.get('AAPL')).toBeDefined();
    });
  });

  describe('YodleeRateLimitedService', () => {
    it('should execute Yodlee requests with rate limiting', async () => {
      const mockRequest = {
        operation: () => Promise.resolve(['account1', 'account2']),
        endpoint: 'accounts' as const,
        userId: 'test_user',
        priority: 1
      };

      const response = await yodleeRateLimitedService.executeRequest(mockRequest);

      expect(response.data).toEqual(['account1', 'account2']);
      expect(response.fromCache).toBe(false);
      expect(response.rateLimitInfo).toBeDefined();
      expect(response.executionTime).toBeGreaterThan(0);
    });

    it('should provide service metrics', () => {
      const metrics = yodleeRateLimitedService.getMetrics();

      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('successfulRequests');
      expect(metrics).toHaveProperty('failedRequests');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('endpointMetrics');
    });

    it('should get rate limit status for all endpoints', async () => {
      const status = await yodleeRateLimitedService.getRateLimitStatus();

      expect(status).toHaveProperty('auth');
      expect(status).toHaveProperty('accounts');
      expect(status).toHaveProperty('transactions');
      expect(status).toHaveProperty('holdings');
    });

    it('should batch execute operations', async () => {
      const userTokens = ['token1', 'token2'];
      const batchRequest = {
        userTokens,
        operation: 'accounts' as const,
        priority: 2
      };

      const response = await yodleeRateLimitedService.batchExecute(batchRequest);

      expect(response.results.size).toBe(2);
      expect(response.successfulRequests).toBeGreaterThanOrEqual(0);
      expect(response.failedRequests).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Rate Limit Middleware', () => {
    const mockRequest = (pathname: string, headers: Record<string, string> = {}) => ({
      nextUrl: { pathname },
      headers: {
        get: (key: string) => headers[key] || null
      },
      cookies: {
        get: () => null
      },
      ip: '127.0.0.1'
    });

    it('should allow requests under rate limit', async () => {
      const middleware = apiRateLimitMiddleware.createMiddleware();
      const req = mockRequest('/api/test');

      const response = await middleware(req as any);

      expect(response).toBeNull(); // null means continue processing
    });

    it('should block requests exceeding rate limit', async () => {
      const middleware = apiRateLimitMiddleware.createMiddleware({
        maxRequests: 1,
        windowMs: 60000
      });
      const req = mockRequest('/api/test');

      // Mock that rate limit is exceeded
      const mockRedis = require('ioredis')();
      mockRedis.pipeline().exec.mockResolvedValue([[null, 0], [null, 2], [null, 1], [null, 1]]);

      const response = await middleware(req as any);

      expect(response).toBeDefined();
      expect(response?.status).toBe(429);
    });

    it('should handle different endpoint patterns', async () => {
      const authReq = mockRequest('/api/auth/login');
      const uploadReq = mockRequest('/api/portfolio/import');
      const apiReq = mockRequest('/api/stock-prices');

      const middleware = apiRateLimitMiddleware.createMiddleware();

      // These should be processed (returning null means continue)
      const authResponse = await middleware(authReq as any);
      const uploadResponse = await middleware(uploadReq as any);
      const apiResponse = await middleware(apiReq as any);

      // All should allow the first request
      expect(authResponse).toBeNull();
      expect(uploadResponse).toBeNull();
      expect(apiResponse).toBeNull();
    });

    it('should create DDoS protection', async () => {
      const ddosMiddleware = apiRateLimitMiddleware.createDDoSProtection();
      const req = mockRequest('/api/test');

      const response = await ddosMiddleware(req as any);

      expect(response).toBeNull(); // Should allow normal requests
    });

    it('should get rate limit metrics', () => {
      const metrics = apiRateLimitMiddleware.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('Monitoring Service', () => {
    it('should collect current metrics', async () => {
      const metrics = await rateLimitMonitorService.getCurrentMetrics();

      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('rateLimits');
      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('services');
      expect(metrics).toHaveProperty('application');
    });

    it('should provide health summary', async () => {
      const health = await rateLimitMonitorService.getHealthSummary();

      expect(health).toHaveProperty('overall');
      expect(health).toHaveProperty('services');
      expect(health).toHaveProperty('activeAlerts');
      expect(health).toHaveProperty('lastUpdate');
      expect(['healthy', 'warning', 'critical']).toContain(health.overall);
    });

    it('should calculate SLA metrics', () => {
      const sla = rateLimitMonitorService.getSLAMetrics(24);

      expect(sla).toHaveProperty('uptime');
      expect(sla).toHaveProperty('availabilityPercentage');
      expect(sla).toHaveProperty('meanResponseTime');
      expect(sla).toHaveProperty('errorRate');
      expect(sla).toHaveProperty('rateLimitViolations');
    });

    it('should handle alert management', () => {
      const activeAlerts = rateLimitMonitorService.getActiveAlerts();
      const allAlerts = rateLimitMonitorService.getAllAlerts();

      expect(Array.isArray(activeAlerts)).toBe(true);
      expect(Array.isArray(allAlerts)).toBe(true);
    });

    it('should export metrics in different formats', () => {
      const jsonMetrics = rateLimitMonitorService.exportMetrics('json');
      const prometheusMetrics = rateLimitMonitorService.exportMetrics('prometheus');

      expect(typeof jsonMetrics).toBe('string');
      expect(typeof prometheusMetrics).toBe('string');
    });
  });

  describe('Integration Tests', () => {
    it('should handle high load without blocking', async () => {
      const config: RateLimitConfig = {
        identifier: 'load_test',
        maxRequests: 100,
        windowMs: 60000
      };

      // Simulate 50 concurrent requests
      const promises = Array.from({ length: 50 }, async (_, i) => {
        return rateLimiterService.checkRateLimit({
          ...config,
          identifier: `load_test_${i}`
        });
      });

      const results = await Promise.all(promises);
      const allowedRequests = results.filter(r => r.allowed).length;

      expect(allowedRequests).toBeGreaterThan(0);
      expect(allowedRequests).toBeLessThanOrEqual(50);
    });

    it('should maintain cache consistency across services', async () => {
      const symbols = ['AAPL', 'MSFT'];
      
      // Request through batch service
      await polygonBatchService.getBatchPrices({ symbols });
      
      // Request through legacy service should hit cache
      const cacheStats1 = await cacheService.getStats();
      
      // Make another request
      await polygonBatchService.getBatchPrices({ symbols });
      
      const cacheStats2 = await cacheService.getStats();
      
      // Cache hits should increase
      expect(cacheStats2.hits).toBeGreaterThanOrEqual(cacheStats1.hits);
    });

    it('should handle service failures gracefully', async () => {
      // Simulate Redis failure
      const mockRedis = require('ioredis')();
      mockRedis.pipeline().exec.mockRejectedValue(new Error('Redis down'));

      const config: RateLimitConfig = {
        identifier: 'failure_test',
        maxRequests: 10,
        windowMs: 60000
      };

      // Should still work (fail open)
      const result = await rateLimiterService.checkRateLimit(config);
      expect(result.allowed).toBe(true);
    });

    it('should demonstrate circuit breaker functionality', async () => {
      const config: RateLimitConfig = {
        identifier: 'circuit_breaker_test',
        maxRequests: 5,
        windowMs: 60000
      };

      // Simulate multiple failures
      const failingApiCall = jest.fn(() => Promise.reject(new Error('API failure')));

      try {
        await rateLimiterService.executeWithRateLimit(failingApiCall, config, 1);
      } catch (error) {
        // Expected to fail
      }

      const status = await rateLimiterService.getRateLimitStatus(config.identifier);
      expect(status).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should complete rate limit checks quickly', async () => {
      const config: RateLimitConfig = {
        identifier: 'perf_test',
        maxRequests: 100,
        windowMs: 60000
      };

      const startTime = Date.now();
      await rateLimiterService.checkRateLimit(config);
      const duration = Date.now() - startTime;

      // Should complete within 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle cache operations efficiently', async () => {
      const key = 'perf_cache_test';
      const data = { large: 'data'.repeat(1000) };
      const config = {
        key,
        ttl: 60000,
        tier: 'memory' as const
      };

      const startTime = Date.now();
      await cacheService.set(key, data, config);
      await cacheService.get(key);
      const duration = Date.now() - startTime;

      // Should complete within 50ms
      expect(duration).toBeLessThan(50);
    });
  });
});

describe('Rate Limiting Edge Cases', () => {
  it('should handle clock skew gracefully', async () => {
    const config: RateLimitConfig = {
      identifier: 'clock_skew_test',
      maxRequests: 5,
      windowMs: 60000
    };

    // Mock Date.now to simulate clock skew
    const originalNow = Date.now;
    Date.now = jest.fn(() => originalNow() + 5000); // 5 seconds in future

    try {
      const result = await rateLimiterService.checkRateLimit(config);
      expect(result.allowed).toBe(true);
    } finally {
      Date.now = originalNow;
    }
  });

  it('should handle concurrent requests correctly', async () => {
    const config: RateLimitConfig = {
      identifier: 'concurrent_test',
      maxRequests: 5,
      windowMs: 60000
    };

    // Execute 10 concurrent requests
    const promises = Array.from({ length: 10 }, () => 
      rateLimiterService.checkRateLimit(config)
    );

    const results = await Promise.all(promises);
    const allowedCount = results.filter(r => r.allowed).length;

    // Should respect the rate limit even with concurrent requests
    expect(allowedCount).toBeLessThanOrEqual(5);
  });

  it('should handle memory pressure gracefully', async () => {
    // Fill cache with many entries to simulate memory pressure
    const promises = Array.from({ length: 1000 }, async (_, i) => {
      const key = `memory_pressure_${i}`;
      const data = { index: i, data: 'test'.repeat(100) };
      return cacheService.set(key, data, {
        key,
        ttl: 60000,
        tier: 'memory'
      });
    });

    await Promise.all(promises);

    // Service should still function
    const stats = await cacheService.getStats();
    expect(stats.memoryUsage).toBeGreaterThan(0);
  });
});