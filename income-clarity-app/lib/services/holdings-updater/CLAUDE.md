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

# Holdings Price Updater Service

## 📋 Purpose
Batch updates current prices for all portfolio holdings using real-time market data. Manages rate limiting, concurrent operations, and portfolio total calculations.

## 🔧 Key Methods
- `updateAllHoldingsPrices()` - Bulk price updates for all holdings
- `updatePortfolioHoldingsPrices()` - Update specific portfolio holdings
- `refreshHoldingPrice()` - Single holding price refresh
- `updatePortfolioTotals()` - Recalculate portfolio aggregations
- `getUpdateStatus()` - Rate limiting and timing information

## ⚡ Update Logic
- **Rate Limiting**: 5-minute minimum between bulk updates
- **Batch Processing**: Groups holdings by ticker to minimize API calls
- **Smart Skipping**: Avoids unnecessary updates for unchanged prices
- **Concurrent Protection**: Prevents overlapping update operations

## 🔗 Dependencies
- `@/lib/db` - Prisma database client
- `./stock/stock-price.service` - Market data provider
- `@/lib/logger` - Logging service

## ⚡ Current Status
**✅ FULLY IMPLEMENTED**
- Production-ready batch processing
- Comprehensive error handling
- Portfolio total recalculation
- Rate limiting with override capability
- Performance monitoring and logging

## ⚙️ Configuration Required
- Stock price service must be configured
- Database schema with holdings and portfolios
- Rate limiting can be adjusted via UPDATE_INTERVAL constant

## 📝 Recent Changes
- Added portfolio total recalculation after price updates
- Implemented smart skipping for recent price data
- Enhanced error reporting with ticker-specific details
- Optimized batch processing for better performance