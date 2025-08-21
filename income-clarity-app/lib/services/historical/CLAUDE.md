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

# Historical Data Service

## 📋 Purpose
Provides comprehensive historical portfolio performance data using real market data from Polygon API. Calculates advanced risk metrics, portfolio analytics, and market comparisons.

## 📊 Core Analytics
- **Portfolio Value History**: Real historical performance using actual market prices
- **Risk Metrics**: Beta, Sharpe ratio, volatility, max drawdown, alpha
- **Market Comparison**: SPY benchmark analysis and outperformance
- **Time Range Analysis**: 1M, 3M, 6M, 1Y, 2Y, 5Y periods
- **Correlation Analysis**: Portfolio correlation with market indices

## 🔧 Key Methods
- `calculateHistoricalPortfolioValue()` - Historical performance calculation
- `calculateRiskMetrics()` - Advanced risk analytics (beta, alpha, Sharpe)
- `fetchHistoricalPrices()` - Polygon API integration for price data
- `getTimeRangeData()` - Multi-period performance analysis
- `initializeHistoricalData()` - Bulk historical data setup

## 📈 Risk Calculations
- **Beta**: Portfolio sensitivity to market movements
- **Alpha**: Excess return vs CAPM expected return
- **Sharpe Ratio**: Risk-adjusted return measurement
- **Volatility**: Annualized standard deviation
- **Max Drawdown**: Largest peak-to-trough decline
- **Information Ratio**: Active return per unit tracking error

## 🔗 Dependencies
- `@/lib/db` - Prisma database client
- `./stock/stock-price.service` - Market data integration
- `@/lib/logger` - Logging service
- `POLYGON_API_KEY` - Environment variable for API access

## ⚡ Current Status
**✅ FULLY IMPLEMENTED**
- Production-ready Polygon API integration
- Complete risk metrics calculation engine
- Historical data caching and storage
- SPY benchmark comparison
- Multi-timeframe analysis
- Database storage for calculated metrics

## ⚙️ Configuration Required
- `POLYGON_API_KEY` environment variable
- Database schema for historical prices and risk metrics
- Rate limiting respects Polygon API limits (200ms between requests)

## 📝 Recent Changes
- Added comprehensive risk metrics calculation
- Implemented historical data caching in database
- Enhanced SPY benchmark comparison
- Added confidence scoring for risk metrics based on data points