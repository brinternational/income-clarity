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

# STOCK PRICE SERVICE - CLAUDE.md

## 📈 Stock Price Service (Polygon API Integration)

**STATUS**: Working - Rate Limited  
**API PROVIDER**: Polygon.io  
**DATA SOURCE**: Real-time + Simulated Fallback  
**RATE LIMIT**: 5 requests/minute (Free tier)

### Current State Overview
- ✅ Polygon API integration complete
- ✅ Rate limiting and caching implemented
- ✅ Batch processing optimization
- ✅ Fallback to simulated data
- ⚠️ **Free tier limitations**: 5 requests/minute
- ✅ Health monitoring and status reporting

### Service Files Structure
```
/lib/services/stock/
└── stock-price.service.ts        # Main stock price service

Related Services:
├── /polygon/polygon-batch.service.ts    # Rate-limited batch processing
├── /rate-limiter/rate-limiter.service.ts # Rate limiting
└── /cache/cache.service.ts              # Caching layer
```

## 🛠️ Core Stock Price Service

### Key Features
- **Polygon API Integration**: Real market data when available
- **Intelligent Caching**: 5-minute cache duration
- **Batch Optimization**: Groups multiple requests efficiently
- **Rate Limit Aware**: Respects API limits with backoff
- **Fallback Data**: Simulated prices when API unavailable
- **Portfolio Calculations**: Bulk portfolio value calculations

### Critical Methods
```typescript
// Core price fetching
getStockPrice(symbol: string, forceRefresh?: boolean): Promise<StockPrice>
getMultipleStockPrices(symbols: string[], forceRefresh?: boolean): Promise<Map<string, StockPrice>>
getSPYPrice(): Promise<StockPrice>

// Portfolio operations
calculatePortfolioValue(holdings): Promise<{ totalValue: number; holdings: Array<...> }>
updateHoldingsPrices(holdings): Promise<{ updated: number; errors: Array<...> }>

// Health and monitoring
testApiConnection(): Promise<{ success: boolean; message: string; latency?: number }>
getHealthStatus(): Promise<HealthStatus>

// Dividend data
getDividendData(symbol: string, startDate?, endDate?): Promise<DividendData>
```

### Environment Variables Required
```bash
POLYGON_API_KEY=your_polygon_api_key_here
```

### Current Configuration Status
- ✅ Service initialized and functional
- ⚠️ **POLYGON_API_KEY**: Configured but free tier limited
- ✅ Rate limiting active to prevent overages
- ✅ Fallback data available for all major tickers

## 📊 Data Sources & Quality

### Real Data (Polygon API)
- **Coverage**: All major US stocks and ETFs
- **Update Frequency**: Real-time market data
- **Rate Limit**: 5 requests/minute (Free tier)
- **Data Quality**: Professional-grade financial data
- **Latency**: ~200-500ms per request

### Simulated Data (Fallback)
- **Major Tickers**: SPY, QQQ, SCHD, VTI, VXUS, BND, VOO, IWM, VIG, VYM
- **Base Prices**: Realistic market values
- **Variation**: Small random fluctuations for realism
- **Consistency**: Stable baseline for development

### Current Simulated Base Prices
```typescript
const basePrices = {
  'SPY': 642.69,    // S&P 500 ETF
  'QQQ': 540.50,    // Nasdaq ETF
  'SCHD': 85.20,    // Dividend ETF
  'VTI': 295.30,    // Total Stock Market
  'VXUS': 65.40,    // International
  'BND': 71.80,     // Bond ETF
  'VOO': 590.20,    // S&P 500 (Vanguard)
  'IWM': 225.60,    // Small Cap
  'VIG': 195.80,    // Dividend Growth
  'VYM': 125.40     // High Dividend Yield
};
```

## ⚡ Rate Limiting & Optimization

### Polygon API Limits
- **Free Tier**: 5 requests/minute
- **Basic Tier**: 100 requests/minute
- **Professional**: Higher limits available

### Rate Limiting Strategy
- **Batch Service Integration**: Uses polygon-batch.service for optimization
- **Request Grouping**: Combines multiple symbol requests
- **Intelligent Queuing**: Delays requests to stay within limits
- **Cache First**: Always checks cache before API calls
- **Exponential Backoff**: Handles rate limit errors gracefully

### Caching Strategy
```typescript
// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const priceCache = new Map<string, { data: StockPrice; timestamp: number }>();

// Cache invalidation
clearCache(): void  // Manual cache clearing for testing
```

## 🔄 Batch Processing Integration

### Polygon Batch Service Integration
The stock price service leverages the specialized `polygon-batch.service.ts` for:
- **Request Batching**: Groups multiple symbol requests
- **Rate Limit Management**: Intelligent request spacing
- **Cache Optimization**: Efficient cache hit/miss handling
- **Error Recovery**: Fallback strategies for failed requests

### Batch Performance Metrics
```typescript
// Example batch response
{
  prices: Map<string, StockPrice>,
  fromCache: string[],  // Symbols served from cache
  fromApi: string[],    // Symbols fetched from API
  errors: Array<{ symbol: string; error: string }>
}
```

## 📈 Portfolio Integration

### Portfolio Value Calculation
```typescript
interface PortfolioCalculation {
  totalValue: number;
  holdings: Array<{
    symbol: string;
    shares: number;
    price: number;
    value: number;
  }>;
}
```

### Holdings Price Updates
- **Bulk Updates**: Processes all holdings efficiently
- **Error Isolation**: Individual ticker failures don't affect others
- **Data Source Tracking**: Reports whether data is real or simulated

## 💰 Dividend Data Integration

### Dividend Features
- **Historical Dividends**: Fetch past dividend payments
- **Frequency Analysis**: Quarterly, monthly, annual patterns
- **Yield Calculations**: Current yield based on price and dividends
- **Payment Schedules**: Ex-date and payment date tracking

### Simulated Dividend Yields
```typescript
const simulatedYields = {
  'SPY': 0.013,   // 1.3%
  'QQQ': 0.007,   // 0.7%
  'SCHD': 0.035,  // 3.5%
  'VTI': 0.015,   // 1.5%
  'VXUS': 0.025,  // 2.5%
  'BND': 0.028,   // 2.8%
  'VOO': 0.014,   // 1.4%
  'VIG': 0.018,   // 1.8%
  'VYM': 0.029    // 2.9%
};
```

## 🔍 Health Monitoring

### Service Health Checks
```typescript
interface HealthStatus {
  apiConfigured: boolean;      // API key present
  apiAvailable: boolean;       // API responding
  dataSource: 'polygon' | 'simulated';
  cacheSize: number;          // Current cache entries
  rateLimitStatus?: any;      // Rate limit status
  serviceHealth?: any;        // Detailed service health
}
```

### Connection Testing
- **API Ping**: Tests connectivity with SPY ticker
- **Latency Measurement**: Tracks response times
- **Error Detection**: Identifies API issues
- **Status Reporting**: Comprehensive health reporting

## 🚨 Error Handling & Fallbacks

### Error Scenarios
1. **API Key Missing**: Falls back to simulated data
2. **Rate Limit Exceeded**: Implements exponential backoff
3. **Network Issues**: Retries with increasing delays
4. **Invalid Symbols**: Returns error in batch response
5. **API Outage**: Seamless fallback to simulated data

### Fallback Strategy
```typescript
// Automatic fallback hierarchy
1. Cache (if fresh)
2. Polygon API (if available and under rate limit)
3. Simulated data (always available)
```

## 📊 Performance Optimization

### Caching Efficiency
- **5-minute cache duration** balances freshness with API usage
- **Symbol-based caching** for efficient lookups
- **Memory management** with cache size monitoring

### Batch Request Optimization
- **Request Grouping**: Combines up to 10 symbols per request
- **Staggered Timing**: Spreads requests over time
- **Priority Handling**: Important symbols (SPY) get priority

## 🧪 Testing & Development

### Mock Data Quality
- **Realistic Prices**: Based on current market values
- **Random Variation**: Small fluctuations for realism
- **Consistent Baseline**: Reliable for development testing

### Testing Commands
```bash
# Test API connection
curl http://localhost:3000/api/stocks/health

# Get stock price
curl http://localhost:3000/api/stocks/price/SPY

# Batch price request
curl -X POST http://localhost:3000/api/stocks/batch \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["SPY", "QQQ", "SCHD"]}'
```

## 🔧 Configuration & Setup

### API Key Configuration
```bash
# Required for real data
POLYGON_API_KEY=your_api_key_from_polygon_io

# Optional: Upgrade to higher tier for more requests
# Free tier: 5 requests/minute
# Basic tier: 100 requests/minute
```

### Polygon.io Setup
1. **Create Account** at polygon.io
2. **Generate API Key** from dashboard
3. **Choose Tier** based on usage needs
4. **Configure Environment Variable**

## 📈 Usage Recommendations

### Production Setup
- **Upgrade API Tier**: Consider Basic tier for production
- **Monitor Usage**: Track API calls to avoid overages
- **Cache Strategy**: Tune cache duration based on needs
- **Error Monitoring**: Set up alerts for API failures

### Development Best Practices
- **Use Simulated Data**: For development and testing
- **Batch Requests**: Always use batch service for multiple symbols
- **Cache Awareness**: Leverage caching for efficiency
- **Graceful Degradation**: Handle API unavailability gracefully

## 🚀 Future Enhancements

### Planned Improvements
- **Redis Caching**: Replace in-memory cache with Redis
- **Real-time Streaming**: WebSocket integration for live prices
- **Historical Data**: Extended historical price data
- **Options Data**: Options pricing and Greeks
- **International Markets**: Support for non-US markets

### Integration Opportunities
- **Portfolio Performance**: Real-time portfolio tracking
- **Alert System**: Price movement notifications
- **Backtesting**: Historical performance analysis
- **Risk Metrics**: Volatility and correlation calculations