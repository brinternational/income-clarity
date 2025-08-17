# SUPER CARDS ARCHITECTURAL BLUEPRINT

## SYSTEM OVERVIEW

The Super Cards system consists of 5 intelligence hubs that provide comprehensive financial analysis through real-time data integration, smart calculations, and predictive insights.

**Architecture Pattern**: Database → Service Layer → API Routes → React Components → UI Display

---

## 1. PERFORMANCE HUB

### File Locations
```
Component:    /features/super-cards/components/PerformanceHub.tsx
API Route:    /app/api/super-cards/performance-hub/route.ts
Service:      /lib/services/super-cards-database.service.ts
Stock API:    /lib/services/stock-price.service.ts
Store:        /store/superCardStore.ts (usePerformanceHub)
Tests:        /__tests__/super-cards/performance-hub.test.ts
```

### Data Sources & Field Mappings

| UI Element | Database Field | API Response | Component Prop | Calculation |
|------------|---------------|--------------|----------------|-------------|
| **Portfolio Value** | `holdings.shares * holdings.currentPrice` | `data.portfolioValue` | `portfolioValue` | `Σ(shares × currentPrice)` |
| **SPY Price** | `stockPriceService.getSPYPrice()` | `data.spyComparison.spyPrice` | `spyPrice` | Real-time from Polygon API |
| **Portfolio Return** | `(currentValue - costBasis) / costBasis` | `data.spyComparison.portfolioReturn` | `portfolioReturn` | `(totalValue - totalCost) / totalCost` |
| **SPY Return** | `polygon:/v2/aggs/ticker/SPY/prev` | `data.spyComparison.spyReturn` | `spyReturn` | From Polygon API or calculated |
| **Outperformance** | `portfolioReturn - spyReturn` | `data.spyComparison.outperformance` | `outperformance` | Dynamic calculation |
| **Holdings List** | `holdings.*` | `data.holdings[]` | `holdings` | Array of portfolio positions |
| **YTD Performance** | `priceData.changePercent / 100` | `holding.ytdPerformance` | `ytdPerformance` | From price change data |

### Database Schema Mapping
```sql
-- Holdings table to Performance Hub
SELECT 
  h.ticker as symbol,
  h.shares,
  h.costBasis,
  h.currentPrice,
  h.dividendYield,
  h.shares * h.currentPrice as currentValue,
  (h.currentPrice - h.costBasis) / h.costBasis as gain_loss_percent
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?
```

### API Data Flow
```typescript
Database Holdings → Polygon API Prices → Performance Calculations → Component State

// Performance Hub API Response Structure
{
  portfolioValue: number,           // Sum of all holdings values
  costBasis: number,               // Sum of all cost basis
  spyComparison: {
    portfolioReturn: number,       // Portfolio vs cost basis
    spyReturn: number,            // SPY performance for timeframe
    outperformance: number,       // Portfolio - SPY
    timeRange: string,            // Selected time period
    spyPrice: number,             // Current SPY price
    lastUpdated: Date             // Data freshness timestamp
  },
  holdings: Array<{
    symbol: string,               // Stock ticker
    shares: number,               // Number of shares owned
    price: number,                // Current price from Polygon
    value: number,                // shares * price
    ytdPerformance: number,       // YTD performance %
    vsSpyPerformance: number      // vs SPY performance
  }>,
  timePeriodData: {
    '1D': { portfolioReturn, spyReturn, outperformance },
    '1W': { portfolioReturn, spyReturn, outperformance },
    '1M': { portfolioReturn, spyReturn, outperformance },
    '3M': { portfolioReturn, spyReturn, outperformance },
    '6M': { portfolioReturn, spyReturn, outperformance },
    '1Y': { portfolioReturn, spyReturn, outperformance },
    'All': { portfolioReturn, spyReturn, outperformance }
  }
}
```

### Real Data Status
- ✅ Portfolio value from real holdings
- ✅ Current prices from Polygon API
- ✅ SPY price from Polygon API
- ❌ Historical performance (using approximations)
- ❌ Time period charts (using mock data)

---

## 2. INCOME INTELLIGENCE HUB

### File Locations
```
Component:    /features/super-cards/components/IncomeIntelligenceHub.tsx
API Route:    /app/api/super-cards/income-hub/route.ts
Service:      /lib/services/super-cards-database.service.ts
Store:        /store/superCardStore.ts (useIncomeHub)
```

### Data Sources & Field Mappings

| UI Element | Database Field | API Response | Component Prop | Calculation |
|------------|---------------|--------------|----------------|-------------|
| **Monthly Dividend Income** | `holdings.shares * currentPrice * dividendYield / 1200` | `data.monthlyDividendIncome` | `monthlyDividendIncome` | `Σ(value × yield) / 12` |
| **Gross Monthly** | `income.amount (monthly) + dividendIncome` | `data.incomeClarityData.grossMonthly` | `grossMonthly` | Sum of all monthly income |
| **Tax Owed** | `grossMonthly * taxProfile.effectiveRate` | `data.incomeClarityData.taxOwed` | `taxOwed` | Based on tax profile |
| **Net Monthly** | `grossMonthly - taxOwed` | `data.incomeClarityData.netMonthly` | `netMonthly` | After-tax income |
| **Monthly Expenses** | `expenses.amount (monthly)` | `data.incomeClarityData.monthlyExpenses` | `monthlyExpenses` | Sum of monthly expenses |
| **Available to Reinvest** | `netMonthly - monthlyExpenses` | `data.availableToReinvest` | `availableToReinvest` | Net income minus expenses |
| **Above Zero Line** | `availableToReinvest > 0` | `data.incomeClarityData.aboveZeroLine` | `aboveZeroLine` | Boolean calculation |

### Database Schema Mapping
```sql
-- Income calculation query
SELECT 
  SUM(CASE WHEN frequency = 'MONTHLY' THEN amount ELSE 0 END) as monthly_income,
  SUM(CASE WHEN frequency = 'QUARTERLY' THEN amount/3 ELSE 0 END) as quarterly_monthly,
  SUM(CASE WHEN frequency = 'ANNUALLY' THEN amount/12 ELSE 0 END) as annual_monthly
FROM incomes 
WHERE userId = ?

-- Expense calculation query  
SELECT 
  SUM(CASE WHEN frequency = 'MONTHLY' THEN amount ELSE 0 END) as monthly_expenses
FROM expenses 
WHERE userId = ?

-- Dividend calculation from holdings
SELECT 
  SUM(h.shares * h.currentPrice * h.dividendYield / 100 / 12) as monthly_dividend_income
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?
```

### Real Data Status
- ✅ All income calculations from real database records
- ✅ All expense calculations from real database records  
- ✅ Dividend income calculated from real holdings
- ✅ Tax calculations from user's tax profile
- ✅ Expense milestones generated from real data

---

## 3. TAX STRATEGY HUB

### File Locations
```
Component:    /features/super-cards/components/TaxStrategyHub.tsx
API Route:    /app/api/super-cards/tax-strategy-hub/route.ts
Service:      /lib/services/super-cards-database.service.ts
Store:        /store/superCardStore.ts (useTaxStrategyHub)
```

### Data Sources & Field Mappings

| UI Element | Database Field | API Response | Component Prop | Calculation |
|------------|---------------|--------------|----------------|-------------|
| **Current Location** | `taxProfile.state` | `data.currentLocation` | `currentLocation` | Direct from tax profile |
| **Tax Rate** | `taxProfile.effectiveRate` | `data.taxRate` | `taxRate` | User's effective rate |
| **Marginal Rate** | `taxProfile.marginalRate` | `calculated` | `marginalRate` | User's marginal rate |
| **Portfolio Value** | `Σ(holdings.value)` | `calculated` | `portfolioValue` | For strategy calculations |
| **Annual Dividends** | `Σ(holdings.annualDividends)` | `calculated` | `annualDividends` | For tax optimization |
| **Tax Loss Harvesting** | `portfolioValue * 0.02 * marginalRate` | `strategy.potentialSavings` | `potentialSavings` | Dynamic calculation |
| **Asset Location** | `annualDividends * (marginalRate - 0.15)` | `strategy.potentialSavings` | `potentialSavings` | Dividend rate optimization |

### Database Schema Mapping
```sql
-- Tax profile query
SELECT 
  state,
  filingStatus,
  federalBracket,
  stateBracket,
  effectiveRate,
  marginalRate,
  qualifiedDividendRate,
  capitalGainsRate
FROM tax_profiles 
WHERE userId = ?

-- Portfolio value for tax strategies
SELECT 
  SUM(h.shares * h.currentPrice) as portfolio_value,
  SUM(h.shares * h.currentPrice * h.dividendYield / 100) as annual_dividends
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?
```

### Real Data Status
- ✅ All tax data from user's tax profile
- ✅ Portfolio value from real holdings
- ✅ Strategy calculations using real portfolio data
- ✅ Dynamic potential savings calculations

---

## 4. PORTFOLIO STRATEGY HUB

### File Locations
```
Component:    /features/super-cards/components/PortfolioStrategyHub.tsx
API Route:    /app/api/super-cards/portfolio-strategy-hub/route.ts
Service:      /lib/services/super-cards-database.service.ts
Store:        /store/superCardStore.ts (usePortfolioStrategyHub)
```

### Data Sources & Field Mappings

| UI Element | Database Field | API Response | Component Prop | Calculation |
|------------|---------------|--------------|----------------|-------------|
| **Holdings** | `holdings.*` | `data.holdings[]` | `holdings` | Direct from database |
| **Sector Allocation** | `holdings.sector` | `data.sectorAllocation[]` | `sectorAllocation` | Grouped by sector |
| **Sector Percentage** | `sectorValue / totalValue * 100` | `allocation.percentage` | `percentage` | Dynamic calculation |
| **Beta** | `1.0 (default)` | `data.riskMetrics.beta` | `beta` | ❌ Needs real calculation |
| **Volatility** | `15.5 (default)` | `data.riskMetrics.volatility` | `volatility` | ❌ Needs real calculation |
| **Sharpe Ratio** | `1.2 (default)` | `data.riskMetrics.sharpeRatio` | `sharpeRatio` | ❌ Needs real calculation |
| **Max Drawdown** | `12.3 (default)` | `data.riskMetrics.maxDrawdown` | `maxDrawdown` | ❌ Needs real calculation |

### Database Schema Mapping
```sql
-- Holdings and sector allocation
SELECT 
  h.ticker,
  h.shares,
  h.costBasis,
  h.currentPrice,
  h.dividendYield,
  h.sector,
  h.shares * h.currentPrice as current_value,
  h.shares * h.currentPrice * h.dividendYield / 100 as annual_dividend
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?

-- Sector allocation calculation
SELECT 
  h.sector,
  SUM(h.shares * h.currentPrice) as sector_value,
  COUNT(*) as holdings_count
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?
GROUP BY h.sector
```

### Real Data Status
- ✅ Holdings from real database
- ✅ Sector allocation calculated from real data
- ✅ Portfolio composition from real holdings
- ❌ Risk metrics using default values (needs implementation)

---

## 5. FINANCIAL PLANNING HUB

### File Locations
```
Component:    /features/super-cards/components/FinancialPlanningHub.tsx
API Route:    /app/api/super-cards/financial-planning-hub/route.ts
Service:      /lib/services/super-cards-database.service.ts
Store:        /store/superCardStore.ts (useFinancialPlanningHub)
```

### Data Sources & Field Mappings

| UI Element | Database Field | API Response | Component Prop | Calculation |
|------------|---------------|--------------|----------------|-------------|
| **Lean FIRE Target** | `annualExpenses * 20` | `fireTarget.targetAmount` | `targetAmount` | 20x annual expenses |
| **Traditional FIRE** | `annualExpenses * 25` | `fireTarget.targetAmount` | `targetAmount` | 25x annual expenses |
| **Fat FIRE Target** | `annualExpenses * 30` | `fireTarget.targetAmount` | `targetAmount` | 30x annual expenses |
| **Current Portfolio** | `Σ(holdings.value)` | `calculated` | `currentValue` | Real portfolio value |
| **Monthly Needed** | `(target - current) / months` | `fireTarget.monthlyNeeded` | `monthlyNeeded` | To reach target |
| **Years to Target** | `Math.log(target/current) / Math.log(1.07)` | `fireTarget.yearsToTarget` | `yearsToTarget` | At 7% growth |
| **Milestones** | `[10k, 100k, 500k, 1M]` | `milestone.targetValue` | `targetValue` | Fixed milestones |
| **Milestone Progress** | `currentValue / targetValue * 100` | `milestone.percentage` | `percentage` | Real progress |

### Database Schema Mapping
```sql
-- Annual expenses calculation
SELECT 
  SUM(CASE 
    WHEN frequency = 'MONTHLY' THEN amount * 12
    WHEN frequency = 'QUARTERLY' THEN amount * 4  
    WHEN frequency = 'ANNUALLY' THEN amount
    ELSE amount * 12
  END) as annual_expenses
FROM expenses 
WHERE userId = ?

-- Current portfolio value
SELECT 
  SUM(h.shares * h.currentPrice) as portfolio_value
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?

-- Financial goals
SELECT 
  name,
  targetAmount,
  currentAmount,
  targetDate,
  category,
  priority
FROM financial_goals 
WHERE userId = ? AND isActive = true
```

### Real Data Status
- ✅ All calculations based on real expense data
- ✅ Current portfolio value from real holdings
- ✅ FIRE targets dynamically calculated
- ✅ Milestone progress based on real portfolio value
- ✅ Projections using real base values

---

## SHARED SERVICES & UTILITIES

### Stock Price Service (`/lib/services/stock-price.service.ts`)
```typescript
interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  timestamp: Date;
}

// Key Methods:
getStockPrice(symbol: string): Promise<StockPrice>
getMultipleStockPrices(symbols: string[]): Promise<Map<string, StockPrice>>
getSPYPrice(): Promise<StockPrice>
testApiConnection(): Promise<{success: boolean, latency?: number}>
```

### Super Cards Database Service (`/lib/services/super-cards-database.service.ts`)
```typescript
// Key Methods:
getIncomeHubData(): Promise<IncomeHubData>
getPerformanceHubData(): Promise<PerformanceHubData> 
getTaxStrategyHubData(): Promise<TaxStrategyHubData>
getPortfolioStrategyHubData(): Promise<PortfolioStrategyHubData>
getFinancialPlanningHubData(): Promise<FinancialPlanningHubData>
```

### State Management (`/store/superCardStore.ts`)
```typescript
// Store Structure:
{
  performanceHub: {
    portfolioValue: number,
    spyComparison: object,
    holdings: array,
    loading: boolean,
    error: string | null
  },
  incomeHub: { /* similar structure */ },
  taxStrategyHub: { /* similar structure */ },
  portfolioStrategyHub: { /* similar structure */ },
  financialPlanningHub: { /* similar structure */ }
}
```

---

## API RESPONSE FORMATS

### Performance Hub API (`/api/super-cards/performance-hub`)
```json
{
  "portfolioValue": 125000,
  "costBasis": 115000,
  "spyComparison": {
    "portfolioReturn": 0.082,
    "spyReturn": 0.061,
    "outperformance": 0.021,
    "timeRange": "1Y",
    "spyPrice": 580.50,
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  "holdings": [
    {
      "symbol": "SCHD",
      "shares": 586,
      "price": 85.20,
      "value": 49927.20,
      "ytdPerformance": 0.089,
      "vsSpyPerformance": 0.028
    }
  ],
  "timePeriodData": {
    "1D": { "portfolioReturn": 0.0012, "spyReturn": 0.0008, "outperformance": 0.0004 },
    "1Y": { "portfolioReturn": 0.082, "spyReturn": 0.061, "outperformance": 0.021 }
  },
  "dataSource": "polygon",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Income Hub API (`/api/super-cards/income-hub`)
```json
{
  "monthlyIncome": 2250.00,
  "monthlyDividendIncome": 450.00,
  "incomeClarityData": {
    "grossMonthly": 4200.00,
    "taxOwed": 924.00,
    "netMonthly": 3276.00,
    "monthlyExpenses": 2800.00,
    "availableToReinvest": 476.00,
    "aboveZeroLine": true
  },
  "expenseMilestones": [
    {
      "id": "housing",
      "category": "Housing",
      "monthlyAmount": 1200.00,
      "covered": false,
      "priority": 1
    }
  ],
  "isEmpty": false
}
```

---

## DEPLOYMENT ARCHITECTURE

### Production Environment
```
Database: SQLite (Prisma ORM)
APIs: Next.js App Router (TypeScript)
External: Polygon.io (Stock Prices)
Caching: React Cache + In-Memory Maps
State: Zustand Store
UI: React + Tailwind CSS + Framer Motion
```

### Data Flow Summary
```
User Request → API Route → Service Layer → Database/External API → 
Response Processing → Cache Update → Component State → UI Update
```

---

## TESTING STRATEGY

### API Testing
```bash
# Performance Hub
curl http://localhost:3000/api/super-cards/performance-hub

# Income Hub  
curl http://localhost:3000/api/super-cards/income-hub

# Test User Account
Email: test@example.com
Password: password123
```

### Component Testing
```typescript
// Key test files:
/__tests__/super-cards/performance-hub.test.ts
/__tests__/super-cards/income-hub.test.ts
/__tests__/super-cards/stock-price.service.test.ts
```

---

## MONITORING & OBSERVABILITY

### Key Metrics
- **API Response Times**: < 500ms target
- **Polygon API Uptime**: Monitor for failures
- **Data Freshness**: < 5 minutes for real-time data
- **Error Rates**: < 1% for all API calls

### Health Checks
```typescript
// Stock Price Service Health
stockPriceService.getHealthStatus()
stockPriceService.testApiConnection()

// Database Health
prisma.$queryRaw`SELECT 1` // Connection test
```

This blueprint provides the complete architectural reference for the Super Cards system, showing exactly how data flows from source to display and where each piece of functionality is implemented.