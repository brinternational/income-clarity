# Cache Service

## Service Overview
Multi-tier caching service implementing comprehensive caching strategy with memory, Redis, and database persistence layers. Provides intelligent TTL management, cache invalidation strategies, and performance monitoring.

## Current Implementation

### Core Architecture
- **Memory Cache**: Fastest access, limited size (1000 items / 100MB max)
- **Redis Cache**: Shared across instances with graceful fallback
- **Database Cache**: Persistent storage using Prisma/SQLite
- **Intelligent TTL**: Pre-configured for different data types

### Key Methods/APIs

#### Core Cache Operations
```typescript
// Get with fallback hierarchy (memory → redis → database → fallback function)
async get<T>(key: string, fallback?: () => Promise<T>, config?: Partial<CacheConfig>): Promise<T | null>

// Set data in specified cache tiers
async set<T>(key: string, data: T, config: CacheConfig): Promise<void>

// Delete from all cache tiers
async delete(key: string): Promise<void>

// Tag-based invalidation
async invalidateByTags(tags: string[]): Promise<void>

// Clear all caches
async clearAll(): Promise<void>
```

#### Cache Management
```typescript
// Check if key exists in any tier
async exists(key: string): Promise<boolean>

// Get cache statistics
async getStats(): Promise<CacheStats>

// Warmup cache with common data
async warmupCache(keys: Array<{key: string; fetcher: () => Promise<any>; config: CacheConfig}>): Promise<void>
```

### Configuration

#### Environment Variables
- `REDIS_HOST`: Redis server host (default: localhost)
- `REDIS_PORT`: Redis server port (default: 6379)
- `REDIS_PASSWORD`: Redis authentication password

#### TTL Configurations (milliseconds)
```typescript
CACHE_TTLS = {
  // Real-time data
  STOCK_PRICES: 60 * 1000,        // 1 minute
  PORTFOLIO_VALUE: 5 * 60 * 1000, // 5 minutes
  USER_SESSION: 15 * 60 * 1000,   // 15 minutes
  
  // Daily data
  DAILY_PRICES: 24 * 60 * 60 * 1000,      // 24 hours
  MARKET_HOURS: 24 * 60 * 60 * 1000,      // 24 hours
  DIVIDEND_DATA: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Static data
  COMPANY_INFO: 30 * 24 * 60 * 60 * 1000,     // 30 days
  SECTOR_DATA: 30 * 24 * 60 * 60 * 1000,      // 30 days
  TAX_BRACKETS: 365 * 24 * 60 * 60 * 1000,    // 365 days
  
  // API responses
  POLYGON_RESPONSES: 5 * 60 * 1000,            // 5 minutes
  YODLEE_RESPONSES: 15 * 60 * 1000,            // 15 minutes
  
  // Calculated data
  PERFORMANCE_METRICS: 30 * 60 * 1000,        // 30 minutes
  TAX_CALCULATIONS: 60 * 60 * 1000,           // 1 hour
  REBALANCING_SUGGESTIONS: 60 * 60 * 1000     // 1 hour
}
```

#### Memory Limits
- `MAX_MEMORY_CACHE_SIZE`: 1000 items
- `MAX_MEMORY_CACHE_SIZE_MB`: 100 MB

### Dependencies
- **Redis**: ioredis for Redis connectivity
- **Prisma Client**: Database operations
- **Logger**: Application logging service
- **CacheEntry Model**: Database table for persistent cache

### Integration Points

#### Service Connections
- **Redis**: Optional distributed cache layer
- **Database**: Persistent cache storage via Prisma
- **Rate Limiter Service**: Uses cache for rate limit storage
- **Polygon Service**: Caches API responses
- **Yodlee Service**: Caches authentication and data responses

#### Cache Tiers
- `memory`: Fast local cache only
- `redis`: Redis cache only (shared)
- `database`: Database cache only (persistent)
- `all`: All three tiers (recommended for important data)

#### Tag-Based Invalidation
- `prices`: Stock price data
- `real-time`: Live data requiring frequent updates
- `daily`: Daily aggregated data
- `company`: Company information (static)
- `dividends`: Dividend data
- `scheduled`: Scheduled/planned data
- `user-specific`: User-related cached data

### Status: Working
- ✅ All cache tiers operational
- ✅ Redis graceful fallback working
- ✅ Memory management and cleanup
- ✅ Tag-based invalidation
- ✅ Performance monitoring
- ✅ Automatic cleanup intervals
- ✅ Compression support ready
- ✅ Circuit breaker pattern implemented

### Cache Statistics Available
- Hit/miss rates across all tiers
- Memory usage tracking
- Redis connection status
- Total keys across tiers
- Performance metrics

### Automatic Maintenance
- 5-minute cleanup intervals for expired entries
- Memory cache eviction (oldest 10% when full)
- Connection monitoring and reconnection
- Graceful degradation when Redis unavailable

## Recent Changes
- Implemented multi-tier architecture
- Added comprehensive TTL configurations
- Enhanced error handling and fallback mechanisms
- Added tag-based invalidation system
- Integrated performance monitoring