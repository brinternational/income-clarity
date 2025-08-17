# API Rate Limiting Documentation

## Overview

This document describes the comprehensive rate limiting and throttling system implemented to protect Income Clarity from API abuse, prevent service degradation, and ensure reliable operation at scale.

## Architecture

### Core Components

1. **Rate Limiter Service** - Redis-based distributed rate limiting
2. **Cache Service** - Multi-tier caching with intelligent TTL management
3. **Polygon Batch Service** - Optimized external API calls with rate limiting
4. **Yodlee Rate Limited Service** - Bank API wrapper with comprehensive throttling
5. **API Middleware** - Request-level rate limiting for all endpoints
6. **Monitoring Service** - Real-time metrics and alerting

### System Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │────│  API Middleware │────│  Rate Limiter   │
│   Request       │    │  (Next.js)      │    │  Service        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cache         │────│  External APIs  │────│  Redis          │
│   Service       │    │  (Polygon/      │    │  (Distributed   │
│                 │    │   Yodlee)       │    │   Rate Limits)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Monitoring &   │
                       │  Alerting       │
                       └─────────────────┘
```

## Rate Limit Configurations

### External API Limits

#### Polygon.io API
| Tier | Requests/Minute | Daily Limit | Implementation |
|------|----------------|-------------|----------------|
| **Free** | 5 | 7,200 | `polygonBatchService.RATE_CONFIGS.FREE_TIER` |
| **Basic** | 100 | 144,000 | `polygonBatchService.RATE_CONFIGS.BASIC_TIER` |

**Configuration:**
```typescript
POLYGON: {
  FREE_TIER: { requests: 5, window: 60000 },    // 5 calls/minute
  BASIC_TIER: { requests: 100, window: 60000 }   // 100 calls/minute
}
```

#### Yodlee API
| Endpoint | Requests/Hour | Queue Size | Implementation |
|----------|---------------|------------|----------------|
| **Authentication** | 10 | 20 | `yodleeRateLimitedService.RATE_CONFIGS.AUTH` |
| **Account Data** | 100 | 200 | `yodleeRateLimitedService.RATE_CONFIGS.ACCOUNTS` |
| **Transactions** | 50 | 100 | `yodleeRateLimitedService.RATE_CONFIGS.TRANSACTIONS` |
| **Holdings** | 50 | 100 | `yodleeRateLimitedService.RATE_CONFIGS.HOLDINGS` |
| **Refresh** | 20 | 50 | `yodleeRateLimitedService.RATE_CONFIGS.REFRESH` |

### Internal API Limits

| User Type | Requests/15min | Endpoint Examples | Implementation |
|-----------|----------------|-------------------|----------------|
| **Anonymous** | 100 | Public endpoints | `apiRateLimitMiddleware.DEFAULT_LIMITS.ANONYMOUS` |
| **Authenticated** | 1,000 | Dashboard, portfolio | `apiRateLimitMiddleware.DEFAULT_LIMITS.AUTHENTICATED` |
| **Premium** | 5,000 | Advanced features | `apiRateLimitMiddleware.DEFAULT_LIMITS.PREMIUM` |

#### Endpoint-Specific Limits

| Endpoint Pattern | Limit Type | Requests | Window | Purpose |
|------------------|------------|----------|--------|---------|
| `/api/auth/(login\|signup\|reset)` | AUTH_SENSITIVE | 5 | 15 min | Prevent brute force |
| `/api/portfolio/import` | UPLOAD | 10 | 1 hour | File upload protection |
| `/api/(portfolios\|holdings\|transactions)` | DATABASE_WRITE | 200 | 1 min | Database protection |
| `/api/stock-prices` | EXTERNAL_API | 30 | 1 min | External API protection |
| `/api/admin` | CRITICAL | 50 | 15 min | Admin endpoint protection |

## Caching Strategy

### Multi-Tier Cache Configuration

#### Memory Cache (Fastest)
- **Capacity**: 1,000 items max, 100MB max
- **TTL**: Varies by data type
- **Use Cases**: Frequently accessed data, session info

#### Redis Cache (Shared)
- **Persistence**: Shared across instances
- **TTL**: Synchronized with memory cache
- **Use Cases**: Distributed caching, rate limit counters

#### Database Cache (Persistent)
- **Storage**: PostgreSQL/SQLite
- **TTL**: Long-term storage
- **Use Cases**: Historical data, expensive calculations

### Cache TTL Configuration

| Data Type | TTL | Tier | Purpose |
|-----------|-----|------|---------|
| **Stock Prices** | 1 minute | All | Real-time data |
| **Portfolio Value** | 5 minutes | All | Calculated metrics |
| **Daily Prices** | 24 hours | All | Historical data |
| **Company Info** | 30 days | All | Static reference |
| **User Tokens** | 15 minutes | Redis | Security |
| **Dividend Data** | 7 days | All | Scheduled events |

## Implementation Guide

### 1. Basic Rate Limiting

```typescript
import { rateLimiterService } from '@/lib/services/rate-limiter/rate-limiter.service';

// Define rate limit configuration
const config = {
  identifier: 'user_123_api_calls',
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  queueSize: 50,
  priority: 1
};

// Check rate limit
const result = await rateLimiterService.checkRateLimit(config);
if (!result.allowed) {
  throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}ms`);
}
```

### 2. API Middleware Usage

```typescript
import { createRateLimit } from '@/lib/middleware/api-rate-limit';

// Apply to API route
export default async function handler(req: NextRequest) {
  const rateLimitResponse = await createRateLimit({
    maxRequests: 50,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests to this endpoint'
  })(req);
  
  if (rateLimitResponse) {
    return rateLimitResponse; // Rate limit exceeded
  }
  
  // Continue with normal processing
  return NextResponse.json({ success: true });
}
```

### 3. External API Calls

```typescript
import { polygonBatchService } from '@/lib/services/polygon/polygon-batch.service';

// Single stock price with automatic rate limiting and caching
const price = await polygonBatchService.getStockPrice('AAPL');

// Batch requests (optimized for rate limits)
const batchResponse = await polygonBatchService.getBatchPrices({
  symbols: ['AAPL', 'MSFT', 'GOOGL'],
  forceRefresh: false,
  priority: 1
});

console.log(`${batchResponse.fromCache.length} from cache, ${batchResponse.fromApi.length} from API`);
```

### 4. Caching Implementation

```typescript
import { cacheService } from '@/lib/services/cache/cache.service';

// Store data with automatic tier selection
await cacheService.set('user_portfolio_123', portfolioData, {
  key: 'user_portfolio_123',
  ttl: 5 * 60 * 1000, // 5 minutes
  tier: 'all',
  tags: ['portfolio', 'user-data']
});

// Retrieve with fallback
const portfolio = await cacheService.get(
  'user_portfolio_123',
  async () => {
    // Fallback function if cache miss
    return await calculatePortfolioValue(userId);
  }
);
```

### 5. Monitoring Integration

```typescript
import { rateLimitMonitorService } from '@/lib/services/monitoring/rate-limit-monitor.service';

// Start monitoring
await rateLimitMonitorService.startMonitoring(30000); // 30-second intervals

// Get health status
const health = await rateLimitMonitorService.getHealthSummary();
console.log(`System health: ${health.overall}`);
console.log(`Active alerts: ${health.activeAlerts}`);

// Get SLA metrics
const sla = rateLimitMonitorService.getSLAMetrics(24); // Last 24 hours
console.log(`Availability: ${sla.availabilityPercentage}%`);
console.log(`Mean response time: ${sla.meanResponseTime}ms`);
```

## Monitoring and Alerting

### Default Alert Rules

| Alert | Condition | Severity | Cooldown | Action |
|-------|-----------|----------|----------|--------|
| **Polygon Rate Limit Critical** | `remainingRequests <= 1` | Critical | 5 min | Immediate notification |
| **Redis Disconnected** | `!redisConnected` | Critical | 1 min | Escalate to on-call |
| **Cache Hit Rate Low** | `hitRate < 50%` | Medium | 15 min | Performance review |
| **API Error Rate High** | `errorRate > 5%` | High | 5 min | Investigation needed |
| **Memory Usage High** | `memoryUsage > 85%` | Medium | 15 min | Scale resources |

### Metrics Collection

#### Prometheus Export
```bash
# Get metrics in Prometheus format
curl http://localhost:3000/api/metrics/prometheus
```

#### JSON Export
```bash
# Get detailed metrics
curl http://localhost:3000/api/metrics/json
```

### Health Check Endpoints

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `/api/health` | Basic health check | `{ status: 'ok' }` |
| `/api/health/detailed` | Comprehensive status | Full health report |
| `/api/health/rate-limits` | Rate limit status | All rate limit counters |
| `/api/metrics` | Performance metrics | Prometheus/JSON metrics |

## Best Practices

### 1. Rate Limit Design

- **Fail Open**: If rate limiting fails, allow requests to prevent service outage
- **Graceful Degradation**: Return cached data when APIs are rate limited
- **User Feedback**: Provide clear error messages with retry timing
- **Priority Queuing**: Critical operations get higher priority

### 2. Cache Optimization

- **Cache Early**: Cache at the earliest possible point
- **Invalidation Strategy**: Use tags for efficient cache invalidation
- **TTL Tuning**: Adjust TTLs based on data volatility
- **Memory Management**: Monitor cache size and evict old entries

### 3. API Integration

- **Batch Requests**: Combine multiple requests when possible
- **Request Deduplication**: Avoid duplicate requests for same data
- **Exponential Backoff**: Implement retry logic with exponential backoff
- **Circuit Breakers**: Fail fast when external services are down

### 4. Monitoring

- **Real-time Dashboards**: Monitor rate limits in real-time
- **Proactive Alerting**: Alert before limits are reached
- **Historical Analysis**: Track patterns to optimize limits
- **SLA Tracking**: Monitor compliance with availability targets

## Troubleshooting

### Common Issues

#### 1. Rate Limit Exceeded Errors

**Symptoms:**
- HTTP 429 responses
- "Rate limit exceeded" error messages
- Slow API responses

**Solutions:**
```bash
# Check current rate limit status
curl http://localhost:3000/api/health/rate-limits

# Clear rate limits (admin only)
curl -X POST http://localhost:3000/api/admin/rate-limits/reset \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Check cache hit rates
curl http://localhost:3000/api/metrics | grep cache_hit_rate
```

#### 2. Cache Miss Performance Issues

**Symptoms:**
- Slow response times
- High external API usage
- Low cache hit rates

**Solutions:**
```bash
# Warm up cache
curl -X POST http://localhost:3000/api/admin/cache/warmup

# Check cache statistics
curl http://localhost:3000/api/health/cache

# Invalidate stale cache
curl -X DELETE http://localhost:3000/api/admin/cache/clear
```

#### 3. External API Failures

**Symptoms:**
- Simulated data in responses
- "Service unavailable" messages
- Circuit breaker open state

**Solutions:**
```bash
# Test external API connectivity
curl http://localhost:3000/api/health/external-apis

# Check circuit breaker status
curl http://localhost:3000/api/metrics | grep circuit_breaker

# Manual service health check
npm run test:integration -- --grep "external-api"
```

### Environment Variables

#### Required Configuration

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# External API Keys
POLYGON_API_KEY=your_polygon_api_key
POLYGON_TIER=FREE  # or BASIC

# Yodlee Configuration
YODLEE_CLIENT_ID=your_yodlee_client_id
YODLEE_CLIENT_SECRET=your_yodlee_client_secret
YODLEE_ADMIN_LOGIN=your_yodlee_admin_login
YODLEE_API_URL=https://sandbox.api.yodlee.com/ysl

# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_INTERVAL=30000  # 30 seconds
ALERT_EMAIL=alerts@yourdomain.com
```

### Scripts and Commands

#### Useful Management Scripts

```bash
# Start services with monitoring
npm run start:production

# Run rate limiting tests
npm run test:rate-limits

# Performance benchmark
npm run benchmark:rate-limits

# Clear all caches
npm run cache:clear

# Reset all rate limits
npm run rate-limits:reset

# Generate health report
npm run health:report

# Monitor real-time metrics
npm run monitor:realtime
```

#### Database Maintenance

```bash
# Optimize cache tables
npx prisma db execute --file=lib/cache-optimization.sql

# Clean up expired cache entries
npm run cache:cleanup

# Backup rate limit data
npm run backup:rate-limits
```

## Performance Targets

### Service Level Objectives (SLOs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Availability** | 99.9% | Monthly uptime |
| **API Response Time** | <200ms P95 | Excluding external API calls |
| **Cache Hit Rate** | >80% | For frequently accessed data |
| **Rate Limit Violations** | <0.1% | Of total requests |
| **External API Success** | >95% | When APIs are available |

### Capacity Planning

| Component | Current Capacity | Scale Triggers | Scale Actions |
|-----------|------------------|----------------|---------------|
| **Redis** | 1GB memory | >80% memory usage | Add Redis cluster nodes |
| **Rate Limiter** | 10k req/min | >8k req/min sustained | Increase rate limits |
| **Cache** | 100MB memory | >80MB usage | Increase eviction rate |
| **Monitoring** | 1k metrics/min | >800 metrics/min | Batch metric collection |

## Security Considerations

### Rate Limiting Security

- **DDoS Protection**: Automatic IP blocking for excessive requests
- **Authentication Bypass Prevention**: Strict limits on auth endpoints
- **Data Extraction Prevention**: Limits on data export endpoints
- **Resource Exhaustion Protection**: Memory and CPU usage monitoring

### Cache Security

- **Data Isolation**: User-specific cache keys
- **Sensitive Data**: No passwords or tokens in cache
- **Cache Poisoning Prevention**: Validate cached data integrity
- **Access Control**: Redis authentication and network isolation

## Future Enhancements

### Planned Improvements

1. **Adaptive Rate Limiting**: AI-based dynamic limit adjustment
2. **Geographic Rate Limiting**: Location-based limits
3. **User Behavior Analysis**: Pattern-based anomaly detection
4. **Advanced Caching**: ML-powered cache preloading
5. **Real-time Dashboard**: Live monitoring interface
6. **A/B Testing**: Rate limit optimization experiments

### Scalability Roadmap

- **Distributed Rate Limiting**: Multi-region support
- **Horizontal Scaling**: Auto-scaling based on load
- **Advanced Monitoring**: Distributed tracing integration
- **Compliance Features**: GDPR-compliant rate limiting

---

## Support

### Documentation Links

- [Architecture Overview](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Testing Guide](./TESTING.md)
- [Monitoring Setup](./MONITORING.md)

### Contact Information

- **Development Team**: dev@yourdomain.com
- **Operations Team**: ops@yourdomain.com
- **Security Team**: security@yourdomain.com

---

*This documentation is automatically updated with each release. Last updated: 2025-08-17*