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

# Polygon API Batch Service

## Service Overview
Production-grade service for Polygon API integration featuring batch processing, intelligent rate limiting (5 calls/minute for free tier), request optimization, multi-tier caching, error handling with retry logic, circuit breaker pattern, and comprehensive monitoring.

## Current Implementation

### Core Features
- **Batch Processing**: Multi-symbol requests with intelligent batching
- **Rate Limiting**: 5 requests/minute (FREE) / 100 requests/minute (BASIC)
- **Caching Strategy**: Memory → Redis → Database → API fallback
- **Error Handling**: Exponential backoff, circuit breaker, graceful degradation
- **Data Sources**: Real Polygon API + high-quality simulated fallback
- **Circuit Breaker**: Automatic service protection

### Key Methods/APIs

#### Stock Price Operations
```typescript
// Batch price retrieval with intelligent caching
async getBatchPrices(request: BatchPriceRequest): Promise<BatchPriceResponse>

// Single stock price with caching
async getStockPrice(symbol: string, forceRefresh: boolean = false): Promise<StockPrice>
```

#### Dividend & Company Data
```typescript
// Batch dividend data retrieval
async getBatchDividendData(symbols: string[], startDate?: string, endDate?: string): Promise<Map<string, DividendData[]>>

// Batch company information
async getBatchCompanyInfo(symbols: string[]): Promise<Map<string, CompanyInfo>>
```

#### Service Management
```typescript
// Health and monitoring
async getServiceHealth(): Promise<{configured: boolean, tier: string, rateLimitStatus: any, lastTestResult?: any}>

// Cache management
async clearCache(): Promise<void>
```

### Configuration

#### Environment Variables
- `POLYGON_API_KEY`: Polygon.io API key (required for real data)
- `POLYGON_TIER`: API tier level ('FREE' or 'BASIC', default: 'FREE')

#### Rate Limit Configurations
```typescript
RATE_CONFIGS = {
  FREE_TIER: {
    maxRequests: 5,
    windowMs: 60000,        // 1 minute
    queueSize: 50,
    priority: 1
  },
  BASIC_TIER: {
    maxRequests: 100,
    windowMs: 60000,        // 1 minute
    queueSize: 200,
    priority: 1
  }
}
```

#### Cache TTL Settings
```typescript
CACHE_CONFIGS = {
  REAL_TIME_PRICES: {
    ttl: 60 * 1000,         // 1 minute
    tier: 'all',
    tags: ['prices', 'real-time']
  },
  DAILY_PRICES: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    tier: 'all',
    tags: ['prices', 'daily']
  },
  COMPANY_INFO: {
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
    tier: 'all',
    tags: ['company', 'static']
  },
  DIVIDEND_DATA: {
    ttl: 7 * 24 * 60 * 60 * 1000,  // 7 days
    tier: 'all',
    tags: ['dividends', 'scheduled']
  }
}
```

### Dependencies
- **Rate Limiter Service**: Request throttling and queue management
- **Cache Service**: Multi-tier caching (memory/Redis/database)
- **Logger**: Comprehensive logging and monitoring
- **Fetch API**: HTTP requests to Polygon.io

### Integration Points

#### Service Integrations
- **Rate Limiter**: Uses `polygon_free_tier` or `polygon_basic_tier` identifiers
- **Cache Service**: Stores API responses with appropriate TTLs
- **Portfolio Service**: Provides real-time price data
- **Super Cards**: Powers Performance Hub and Income Intelligence
- **Background Jobs**: Scheduled price updates and data sync

#### Data Flow Architecture
```
Request → Cache Check → Rate Limit Check → API Call → Cache Store → Response
    ↓           ↓              ↓              ↓           ↓
  Symbol    Memory Cache   Queue/Delay   Polygon API   Multi-tier
  Batch     Redis Cache    Circuit       Response      Storage
           Database Cache  Breaker       Processing
```

### Status: Working
- ✅ Free tier rate limiting (5 req/min) fully operational
- ✅ Batch processing optimized for rate limits
- ✅ Multi-tier caching working across all tiers
- ✅ Circuit breaker protecting against API failures
- ✅ High-quality simulated data fallback
- ✅ Comprehensive error handling and retry logic
- ✅ Real-time monitoring and health checks
- ✅ Cache invalidation by tags
- ✅ Priority-based request queuing
- ✅ Exponential backoff on failures

### API Endpoints Used
- **Stock Prices**: `/v2/aggs/ticker/{symbol}/prev` (previous day data)
- **Dividend Data**: `/v3/reference/dividends?ticker={symbol}`
- **Company Info**: `/v3/reference/tickers/{symbol}`

### Batch Processing Logic
1. **Cache Check**: Check all symbols against cache first
2. **API Batching**: Group uncached symbols for API calls
3. **Rate Limiting**: Process within API limits (5/min free, 100/min basic)
4. **Parallel Processing**: Execute up to 3 concurrent requests
5. **Result Merging**: Combine cached and fresh data
6. **Cache Population**: Store new results for future requests

### Simulated Data Fallback
When API key not configured or API unavailable:
- **Stock Prices**: Realistic prices with ±1% daily variation
- **Company Info**: Comprehensive company data for major symbols
- **Dividends**: Historical quarterly dividend patterns
- **Base Prices**: Updated for major ETFs and stocks (SPY, QQQ, AAPL, etc.)

### Error Handling Strategies
- **429 Rate Limit**: Exponential backoff with circuit breaker
- **API Errors**: Graceful degradation to simulated data
- **Network Issues**: Retry with backoff, fallback to cache
- **Invalid Symbols**: Return errors in batch response
- **Circuit Breaker**: Temporary service protection

### Performance Optimizations
- **Intelligent Batching**: Minimize API calls while respecting rate limits
- **Cache-First Strategy**: Always check cache before API
- **Concurrent Processing**: Parallel requests within rate limit constraints
- **Queue Management**: Priority-based request ordering
- **Memory Efficiency**: Optimized data structures and cleanup

## Recent Changes
- Enhanced batch processing to respect rate limits
- Implemented comprehensive circuit breaker pattern
- Added high-quality simulated data fallback
- Optimized cache strategies for different data types
- Integrated with rate limiter service for distributed limiting