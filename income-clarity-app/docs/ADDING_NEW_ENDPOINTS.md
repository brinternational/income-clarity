# Adding New API Endpoints with Rate Limiting

## Quick Start Guide

This guide shows developers how to wrap new API endpoints with our production-grade throttling and rate limiting system. Follow these patterns to ensure your endpoints are scalable, reliable, and resilient.

## Table of Contents

- [Overview](#overview)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Common Patterns](#common-patterns)
- [Testing Rate Limiting](#testing-rate-limiting)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

Our rate limiting system provides:
- **Redis-based distributed rate limiting** - Works across multiple server instances
- **Circuit breaker pattern** - Prevents cascade failures
- **Intelligent caching** - Multi-tier caching (memory, Redis, database)
- **Request batching** - Optimizes external API usage
- **Comprehensive monitoring** - Detailed metrics and logging

### Available Services

```typescript
import { rateLimiterService } from '@/lib/services/rate-limiter/rate-limiter.service';
import { cacheService } from '@/lib/services/cache/cache.service';
import { polygonBatchService } from '@/lib/services/polygon/polygon-batch.service';
```

## Step-by-Step Implementation

### Step 1: Import Required Services

```typescript
// app/api/your-new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiterService, RateLimitConfig } from '@/lib/services/rate-limiter/rate-limiter.service';
import { cacheService, CacheConfig } from '@/lib/services/cache/cache.service';
import { logger } from '@/lib/logger';
```

### Step 2: Define Rate Limit Configuration

```typescript
// Define your rate limiting configuration
const RATE_CONFIG: RateLimitConfig = {
  identifier: 'your_endpoint_name', // Unique identifier for this endpoint
  maxRequests: 10,                   // Max requests allowed
  windowMs: 60 * 1000,              // Time window in milliseconds (1 minute)
  queueSize: 20,                    // Optional: Queue size for overflow requests
  priority: 1                       // Optional: Request priority (higher = more important)
};

// Define cache configuration
const CACHE_CONFIG: CacheConfig = {
  key: 'your_endpoint',
  ttl: 5 * 60 * 1000,              // Cache for 5 minutes
  tier: 'all',                     // Use all cache tiers (memory, Redis, database)
  tags: ['your-feature', 'api-data'] // Tags for cache invalidation
};
```

### Step 3: Basic GET Endpoint Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Apply rate limiting
    const rateLimitResult = await rateLimiterService.checkRateLimit(RATE_CONFIG);
    
    if (!rateLimitResult.allowed) {
      logger.warn(`Rate limit exceeded for endpoint: ${RATE_CONFIG.identifier}`);
      return new Response('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.retryAfter || 60000) / 1000)),
          'X-RateLimit-Remaining': String(rateLimitResult.remainingRequests),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString()
        }
      });
    }

    // 2. Extract request parameters
    const { searchParams } = new URL(request.url);
    const param1 = searchParams.get('param1') || 'default';
    const param2 = searchParams.get('param2');
    
    // 3. Create cache key based on parameters
    const cacheKey = `${CACHE_CONFIG.key}:${param1}:${param2}`;
    
    // 4. Check cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      logger.log(`Cache hit for: ${cacheKey}`);
      return NextResponse.json({
        ...cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    // 5. Fetch data (your business logic here)
    const data = await fetchYourData(param1, param2);
    
    // 6. Cache the result
    await cacheService.set(cacheKey, data, {
      ...CACHE_CONFIG,
      key: cacheKey
    });
    
    // 7. Return response
    logger.log(`Data fetched and cached for: ${cacheKey}`);
    return NextResponse.json({
      ...data,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Endpoint error:', error);
    
    // Return fallback data if available
    const fallbackData = await getFallbackData();
    return NextResponse.json(fallbackData || { error: 'Service temporarily unavailable' }, {
      status: fallbackData ? 200 : 500
    });
  }
}
```

### Step 4: POST Endpoint with Validation

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting with higher priority for POST requests
    const postRateConfig = {
      ...RATE_CONFIG,
      identifier: `${RATE_CONFIG.identifier}_post`,
      maxRequests: 5,  // Lower limit for write operations
      priority: 2      // Higher priority
    };
    
    const rateLimitResult = await rateLimiterService.checkRateLimit(postRateConfig);
    
    if (!rateLimitResult.allowed) {
      return new Response('Too Many Requests', { status: 429 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = validateRequestBody(body);
    
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.errors },
        { status: 400 }
      );
    }

    // 3. Process the request
    const result = await processRequest(body);
    
    // 4. Invalidate related cache entries
    await cacheService.invalidateByTags(['your-feature']);
    
    return NextResponse.json(result);

  } catch (error) {
    logger.error('POST endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Common Patterns

### Pattern 1: External API Integration

For endpoints that call external APIs (like Polygon, Yodlee):

```typescript
export async function GET(request: NextRequest) {
  try {
    // Use executeWithRateLimit for external API calls
    const data = await rateLimiterService.executeWithRateLimit(
      async () => {
        // Your external API call
        const response = await fetch('https://api.example.com/data', {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        return response.json();
      },
      {
        identifier: 'external_api_calls',
        maxRequests: 5,
        windowMs: 60 * 1000,
        priority: 1
      },
      3 // Max retries
    );

    return NextResponse.json(data);
  } catch (error) {
    // Handle rate limit errors gracefully
    if (error.message.includes('rate limit')) {
      return new Response('External service temporarily unavailable', { status: 503 });
    }
    throw error;
  }
}
```

### Pattern 2: Database Operations with Caching

```typescript
export async function GET(request: NextRequest) {
  const userId = request.headers.get('user-id');
  const cacheKey = `user_data:${userId}`;
  
  // Use cache with fallback to database
  const userData = await cacheService.get(
    cacheKey,
    async () => {
      // Fallback function: fetch from database
      return await prisma.user.findUnique({
        where: { id: userId },
        include: { portfolios: true }
      });
    },
    {
      key: cacheKey,
      ttl: cacheService.CACHE_TTLS.USER_PREFERENCES,
      tier: 'all',
      tags: ['user-data', `user-${userId}`]
    }
  );

  return NextResponse.json(userData);
}
```

### Pattern 3: Batch Processing

```typescript
export async function POST(request: NextRequest) {
  const { symbols } = await request.json();
  
  // Use batch processing for multiple external calls
  const results = await rateLimiterService.batchExecute(
    symbols.map(symbol => ({
      id: symbol,
      apiCall: () => fetchStockData(symbol)
    })),
    {
      identifier: 'batch_stock_data',
      maxRequests: 10,
      windowMs: 60 * 1000
    },
    3 // Batch size
  );

  // Process results
  const successfulResults = new Map();
  const errors = [];
  
  results.forEach((result, symbol) => {
    if (result.error) {
      errors.push({ symbol, error: result.error.message });
    } else {
      successfulResults.set(symbol, result.result);
    }
  });

  return NextResponse.json({
    data: Object.fromEntries(successfulResults),
    errors,
    total: symbols.length,
    successful: successfulResults.size
  });
}
```

### Pattern 4: Real-time Data with Smart Caching

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols')?.split(',') || [];
  
  // Use Polygon batch service for real-time stock data
  const priceData = await polygonBatchService.getBatchPrices({
    symbols,
    forceRefresh: searchParams.get('force') === 'true',
    priority: 1
  });

  return NextResponse.json({
    prices: Object.fromEntries(priceData.prices),
    errors: priceData.errors,
    fromCache: priceData.fromCache,
    fromApi: priceData.fromApi,
    rateLimitStatus: priceData.rateLimitStatus,
    dataSource: process.env.POLYGON_API_KEY ? 'polygon' : 'simulated'
  });
}
```

### Pattern 5: User-Specific Rate Limiting

```typescript
export async function GET(request: NextRequest) {
  const userId = request.headers.get('user-id');
  const userTier = await getUserTier(userId); // 'free', 'premium', etc.
  
  // Different rate limits based on user tier
  const rateConfig = {
    identifier: `user_requests:${userId}`,
    maxRequests: userTier === 'premium' ? 100 : 10,
    windowMs: 60 * 1000,
    priority: userTier === 'premium' ? 2 : 1
  };
  
  const rateLimitResult = await rateLimiterService.checkRateLimit(rateConfig);
  
  if (!rateLimitResult.allowed) {
    const upgradeMessage = userTier === 'free' 
      ? 'Upgrade to premium for higher rate limits'
      : 'Rate limit exceeded';
      
    return NextResponse.json(
      { error: upgradeMessage },
      { status: 429 }
    );
  }
  
  // Continue with request processing...
}
```

## Testing Rate Limiting

### Unit Tests

```typescript
// __tests__/api/your-endpoint.test.ts
import { rateLimiterService } from '@/lib/services/rate-limiter/rate-limiter.service';
import { GET } from '@/app/api/your-endpoint/route';

describe('/api/your-endpoint', () => {
  beforeEach(async () => {
    // Clear rate limits before each test
    await rateLimiterService.clearRateLimits();
  });

  it('should handle rate limiting correctly', async () => {
    const mockRequest = new Request('http://localhost/api/your-endpoint');
    
    // First request should succeed
    const response1 = await GET(mockRequest);
    expect(response1.status).toBe(200);
    
    // Exceed rate limit
    for (let i = 0; i < 15; i++) {
      await GET(mockRequest);
    }
    
    // Next request should be rate limited
    const rateLimitedResponse = await GET(mockRequest);
    expect(rateLimitedResponse.status).toBe(429);
  });
});
```

### Integration Tests

```typescript
// Test with real external services
describe('Integration: External API calls', () => {
  it('should handle external API rate limits', async () => {
    // Test actual rate limiting with external services
    const requests = Array.from({ length: 10 }, (_, i) => 
      fetch(`/api/your-endpoint?test=${i}`)
    );
    
    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status);
    
    // Some should succeed, some should be rate limited
    expect(statusCodes).toContain(200);
    expect(statusCodes).toContain(429);
  });
});
```

### Manual Testing

```bash
# Test rate limiting manually
for i in {1..15}; do
  curl -w "%{http_code}\n" -o /dev/null -s "http://localhost:3000/api/your-endpoint"
done

# Should see: 200, 200, 200, ..., 429, 429, 429
```

## Troubleshooting

### Common Issues

1. **Rate limits not working**
   ```bash
   # Check Redis connection
   docker exec -it redis redis-cli ping
   
   # Check rate limiter status
   curl http://localhost:3000/api/health
   ```

2. **Cache not invalidating**
   ```typescript
   // Manually clear cache for testing
   await cacheService.invalidateByTags(['your-feature']);
   ```

3. **External API errors**
   ```typescript
   // Check API configuration
   const health = await polygonBatchService.getServiceHealth();
   console.log('Service health:', health);
   ```

### Debugging Rate Limits

```typescript
// Add debugging to your endpoint
const rateLimitStatus = await rateLimiterService.getRateLimitStatus('your_endpoint');
console.log('Rate limit status:', rateLimitStatus);

// Check metrics
const metrics = rateLimiterService.getMetrics();
console.log('Rate limiter metrics:', metrics);
```

### Performance Monitoring

```typescript
// Monitor endpoint performance
const startTime = Date.now();
// ... your endpoint logic
const duration = Date.now() - startTime;
logger.log(`Endpoint completed in ${duration}ms`);
```

## Best Practices

### 1. Choose Appropriate Rate Limits

```typescript
// API type guidelines:
const RATE_LIMITS = {
  // High-frequency data (stock prices, real-time updates)
  REAL_TIME: { maxRequests: 30, windowMs: 60000 },
  
  // User actions (creating portfolios, updating settings)
  USER_ACTIONS: { maxRequests: 10, windowMs: 60000 },
  
  // Heavy computations (backtesting, complex calculations)
  HEAVY_COMPUTE: { maxRequests: 3, windowMs: 60000 },
  
  // External API calls (limited by third-party)
  EXTERNAL_API: { maxRequests: 5, windowMs: 60000 }
};
```

### 2. Cache Strategy

```typescript
// Cache TTL guidelines:
const CACHE_STRATEGIES = {
  // Real-time data: Short TTL
  STOCK_PRICES: { ttl: 60 * 1000, tier: 'redis' },
  
  // User data: Medium TTL
  USER_PREFERENCES: { ttl: 15 * 60 * 1000, tier: 'all' },
  
  // Static data: Long TTL
  COMPANY_INFO: { ttl: 24 * 60 * 60 * 1000, tier: 'all' },
  
  // Computed data: Medium TTL with tags
  CALCULATIONS: { ttl: 30 * 60 * 1000, tier: 'all', tags: ['computed'] }
};
```

### 3. Error Handling

```typescript
// Comprehensive error handling
try {
  // Your endpoint logic
} catch (error) {
  // Log the error
  logger.error('Endpoint error:', { error, endpoint: 'your-endpoint' });
  
  // Determine error type and response
  if (error.message.includes('rate limit')) {
    return new Response('Rate limit exceeded', { status: 429 });
  } else if (error.message.includes('validation')) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  } else if (error.message.includes('external')) {
    return new Response('External service unavailable', { status: 503 });
  } else {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### 4. Monitoring and Alerts

```typescript
// Add monitoring to critical endpoints
const monitoringConfig = {
  endpoint: 'your-endpoint',
  alertThresholds: {
    errorRate: 0.05,      // Alert if >5% error rate
    responseTime: 5000,    // Alert if >5s response time
    rateLimitHits: 100     // Alert if rate limit hit >100 times/hour
  }
};
```

### 5. Documentation Standards

Always include in your endpoint documentation:
- Rate limits and quotas
- Cache behavior and TTL
- Expected response times
- Error codes and meanings
- Dependencies on external services

### 6. Security Considerations

```typescript
// Input validation
function validateInput(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid request body');
  }
  
  // Add specific validation rules
  return { isValid: errors.length === 0, errors };
}

// Rate limit by IP for public endpoints
const ipRateConfig = {
  identifier: `ip:${getClientIP(request)}`,
  maxRequests: 100,
  windowMs: 60 * 1000
};
```

This comprehensive guide should help you implement new endpoints with proper rate limiting, caching, and error handling. Always test your endpoints thoroughly and monitor their performance in production.