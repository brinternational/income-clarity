# 🚨 CRITICAL PORT PROTECTION RULE - READ FIRST

## ⛔ ABSOLUTE MANDATE - NEVER TOUCH THESE PORTS:
- **PORT 3000**: Income Clarity production server - NEVER KILL
- **PORT 22**: SSH connection to Claude Code CLI - NEVER KILL  
- **PORT 8080**: Any other critical services - NEVER KILL

## 🚫 FORBIDDEN COMMANDS:
- `pkill -f node` (kills Claude Code CLI connection)
- `killall node` (kills everything)
- `npm run dev` with port changes
- Any command that kills ports other than 3000

## ✅ SAFE COMMANDS ONLY:
- `pkill -f custom-server.js` (targets specific server only)
- `lsof -ti:3000 | xargs kill` (port 3000 only)
- Standard npm install/build without server restarts

**VIOLATION = IMMEDIATE TASK FAILURE**

---

# Rate Limiter Service

## Service Overview
Production-grade rate limiting service implementing comprehensive distributed rate limiting with Redis-based tracking, per-API rate management, queue management with priority, exponential backoff, circuit breaker pattern, request batching optimization, and detailed monitoring.

## Current Implementation

### Core Architecture
- **Distributed Rate Limiting**: Redis-based with memory fallback
- **Multi-API Support**: Separate limits for Polygon, Yodlee, internal APIs
- **Queue Management**: Priority-based request queuing with overflow protection
- **Circuit Breaker**: Automatic service protection after consecutive failures
- **Batch Processing**: Optimized batch execution with rate limit awareness
- **Comprehensive Monitoring**: Request tracking, error rates, response times

### Key Methods/APIs

#### Rate Limiting Core
```typescript
// Check if request allowed under rate limit
async checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult>

// Execute function with rate limiting and retry logic
async executeWithRateLimit<T>(apiCall: () => Promise<T>, config: RateLimitConfig, maxRetries: number = 3): Promise<T>

// Batch multiple API calls with rate limit optimization
async batchExecute<T>(items: Array<{id: string; apiCall: () => Promise<T>}>, config: RateLimitConfig, batchSize: number = 5): Promise<Map<string, {result?: T; error?: Error}>>
```

#### Monitoring & Management
```typescript
// Get rate limit status for monitoring
async getRateLimitStatus(identifier: string): Promise<{currentRequests: number, maxRequests: number, resetTime: Date, queueSize: number, circuitBreakerState: string}>

// Get comprehensive metrics
getMetrics(): Record<string, {requests: number, errors: number, errorRate: number, avgResponseTime: number}>

// Clear rate limits for testing/emergency
async clearRateLimits(identifier?: string): Promise<void>
```

### Configuration

#### API Rate Limits
```typescript
API_LIMITS = {
  POLYGON: {
    FREE_TIER: { requests: 5, window: 60000 },      // 5 req/min
    BASIC_TIER: { requests: 100, window: 60000 }    // 100 req/min
  },
  YODLEE: {
    AUTH: { requests: 10, window: 60000 },          // 10 auth req/min
    DATA: { requests: 100, window: 3600000 },       // 100 data req/hour
    REFRESH: { requests: 50, window: 3600000 }      // 50 refresh req/hour
  },
  INTERNAL: {
    USER_ACTIONS: { requests: 100, window: 60000 }, // 100 user actions/min
    PORTFOLIO_REFRESH: { requests: 10, window: 300000 } // 10 portfolio refresh/5min
  }
}
```

#### Environment Variables
- `REDIS_HOST`: Redis server host (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
- `REDIS_PASSWORD`: Redis authentication password

#### Rate Limit Configuration Object
```typescript
RateLimitConfig = {
  maxRequests: number,     // Maximum requests in window
  windowMs: number,        // Time window in milliseconds
  identifier: string,      // Unique identifier for this rate limit
  burstLimit?: number,     // Optional burst allowance
  queueSize?: number,      // Maximum queue size
  priority?: number        // Request priority (higher = more important)
}
```

### Dependencies
- **Redis**: ioredis for distributed rate limit storage
- **Logger**: Application logging and monitoring

### Integration Points

#### Service Connections
- **Polygon Batch Service**: Uses `polygon_free_tier` and `polygon_basic_tier` identifiers
- **Yodlee Service**: Uses `yodlee_auth`, `yodlee_data`, `yodlee_refresh` identifiers
- **API Middleware**: Uses internal rate limit identifiers
- **Cache Service**: May use rate limiting for cache operations
- **Monitoring Service**: Provides rate limit metrics and status

#### Circuit Breaker Integration
- **Failure Threshold**: 5 consecutive failures trigger circuit breaker
- **Open State Duration**: 60 seconds before attempting half-open
- **States**: `closed` (normal) → `open` (failing) → `half-open` (testing)
- **Recovery**: Automatic on successful requests

### Status: Working
- ✅ Redis-based distributed rate limiting operational
- ✅ Memory fallback when Redis unavailable
- ✅ Multi-API rate limit configurations active
- ✅ Circuit breaker pattern protecting all APIs
- ✅ Priority-based queue management
- ✅ Exponential backoff and retry logic
- ✅ Batch processing optimization
- ✅ Comprehensive metrics collection
- ✅ Automatic cleanup and maintenance
- ✅ Graceful degradation strategies

### Rate Limiting Strategies

#### Redis-Based (Distributed)
- **Sliding Window**: Uses Redis sorted sets for precise tracking
- **Atomic Operations**: Redis pipelines ensure consistency
- **Expiration**: Automatic cleanup of old entries
- **Scalability**: Works across multiple application instances

#### Memory-Based (Fallback)
- **Local Tracking**: Per-instance rate limiting when Redis unavailable
- **Window Reset**: Fixed window approach for simplicity
- **Cleanup**: Automatic expired entry removal
- **Failsafe**: Ensures application continues functioning

### Queue Management
- **Priority Ordering**: Higher priority requests processed first
- **Overflow Protection**: Automatic rejection when queue full
- **FIFO Within Priority**: Fair processing within same priority level
- **Timeout Handling**: Automatic cleanup of stale queue items

### Error Handling & Retry Logic
- **Rate Limit Errors (429)**: Exponential backoff with max 16-second delay
- **Circuit Breaker Open**: Immediate failure with retry-after timing
- **Network Errors**: Standard retry with exponential backoff
- **Queue Overflow**: Immediate rejection with clear error message

### Performance Features
- **Batch Optimization**: Groups requests to maximize throughput
- **Concurrent Processing**: Parallel execution within rate limits
- **Smart Delays**: Calculated delays between batches
- **Memory Efficiency**: Optimized data structures and cleanup

### Monitoring Capabilities
- **Request Tracking**: Total requests per API/identifier
- **Error Rates**: Success/failure ratios
- **Response Times**: Average response time tracking
- **Queue Status**: Real-time queue sizes and states
- **Circuit Breaker States**: Current protection status

## Recent Changes
- Enhanced Redis integration with graceful fallback
- Implemented comprehensive circuit breaker pattern
- Added priority-based queue management
- Optimized batch processing for rate limit efficiency
- Integrated detailed monitoring and metrics collection