# FIELD MAPPING - Database to UI Data Flow

## OVERVIEW

This document maps every data field from the Prisma database through the API layer to the final UI components, showing the complete transformation chain for all Super Cards data.

---

## HOLDINGS DATA FLOW

### Core Holdings Transformation
```
Database (Prisma) → API Response → Component Props → UI Display
```

| Database Field | Type | API Field | Component Prop | UI Element | Calculation |
|----------------|------|-----------|----------------|------------|-------------|
| `holdings.ticker` | string | `symbol` | `ticker/symbol` | Stock symbol display | Direct mapping |
| `holdings.shares` | number | `shares` | `shares` | "XXX shares" | Direct mapping |
| `holdings.costBasis` | number | `costBasis` | `avgCost` | "$XX.XX avg cost" | Direct mapping |
| `holdings.currentPrice` | number | `price` | `currentPrice` | "$XX.XX current" | From Polygon API |
| `holdings.dividendYield` | number | `dividendYield` | `dividendYield` | "X.X% yield" | Direct mapping (%) |
| `holdings.shares * holdings.currentPrice` | calculated | `value` | `currentValue` | "$XX,XXX value" | `shares × currentPrice` |
| `(currentPrice - costBasis) / costBasis` | calculated | `gainLossPercent` | `performance` | "+X.X% gain" | Performance calculation |

### Holdings Database Query
```sql
SELECT 
  h.ticker,
  h.shares,
  h.costBasis,
  h.currentPrice,
  h.dividendYield,
  h.sector,
  h.shares * h.currentPrice as current_value,
  (h.currentPrice - h.costBasis) / h.costBasis as gain_loss_percent,
  h.shares * h.currentPrice * h.dividendYield / 100 / 12 as monthly_dividend
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?
```

---

## INCOME DATA FLOW

### Monthly Income Calculation
```
Database Income Records → Service Calculations → API Response → UI Display
```

| Database Source | Field | API Response | UI Element | Calculation |
|----------------|-------|--------------|------------|-------------|
| `incomes.amount` (MONTHLY) | number | `monthlyIncome` | "Monthly Income: $X,XXX" | `SUM(amount WHERE frequency='MONTHLY')` |
| `incomes.amount` (QUARTERLY) | number | `monthlyIncome` | "Monthly Income: $X,XXX" | `SUM(amount WHERE frequency='QUARTERLY') / 3` |
| `incomes.amount` (ANNUALLY) | number | `monthlyIncome` | "Monthly Income: $X,XXX" | `SUM(amount WHERE frequency='ANNUALLY') / 12` |
| Holdings dividend calculation | calculated | `monthlyDividendIncome` | "Dividend Income: $XXX" | `Σ(holdings.value × yield) / 12` |

### Income Clarity Calculation Chain
```
Database Fields → Service Layer → API Response → Component Props
```

| Calculation Step | Formula | API Field | UI Display |
|------------------|---------|-----------|------------|
| **Gross Monthly** | `monthlyIncome + monthlyDividendIncome` | `incomeClarityData.grossMonthly` | "Gross Monthly: $X,XXX" |
| **Tax Owed** | `grossMonthly × taxProfile.effectiveRate` | `incomeClarityData.taxOwed` | "Tax Owed: $XXX" |
| **Net Monthly** | `grossMonthly - taxOwed` | `incomeClarityData.netMonthly` | "Net Monthly: $X,XXX" |
| **Available to Reinvest** | `netMonthly - monthlyExpenses` | `availableToReinvest` | "Available: $XXX" |
| **Above Zero Line** | `availableToReinvest > 0` | `incomeClarityData.aboveZeroLine` | Green/Red indicator |

### Income Database Queries
```sql
-- Monthly income aggregation
SELECT 
  SUM(CASE 
    WHEN frequency = 'MONTHLY' THEN amount
    WHEN frequency = 'QUARTERLY' THEN amount / 3
    WHEN frequency = 'ANNUALLY' THEN amount / 12
    ELSE amount
  END) as monthly_income_total
FROM incomes 
WHERE userId = ? AND category != 'DIVIDEND'

-- Dividend income from holdings
SELECT 
  SUM(h.shares * h.currentPrice * h.dividendYield / 100 / 12) as monthly_dividend_income
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?
```

---

## EXPENSE DATA FLOW

### Monthly Expense Calculation
```
Database Expense Records → Service Aggregation → API Response → UI Components
```

| Database Field | Type | Calculation | API Response | UI Element |
|----------------|------|-------------|--------------|------------|
| `expenses.amount` (MONTHLY) | number | Direct sum | `monthlyExpenses` | "Monthly Expenses: $X,XXX" |
| `expenses.amount` (QUARTERLY) | number | `amount / 3` | `monthlyExpenses` | Included in total |
| `expenses.amount` (ANNUALLY) | number | `amount / 12` | `monthlyExpenses` | Included in total |
| `expenses.category` | string | Group by category | `expenseBreakdown` | Category charts |

### Expense Milestone Mapping
```
Database Expenses → Category Grouping → Milestone Calculation → UI Cards
```

| Expense Category | Database Filter | Milestone Logic | UI Display |
|------------------|----------------|-----------------|------------|
| **Housing** | `category = 'RENT'` | `monthlyDividendIncome > housingTotal` | "Housing Covered: ✅/❌" |
| **Utilities** | `category = 'UTILITIES'` | `monthlyDividendIncome > utilitiesTotal` | "Utilities Covered: ✅/❌" |
| **Food** | `category = 'FOOD'` | `monthlyDividendIncome > foodTotal` | "Food Covered: ✅/❌" |

### Expense Database Query
```sql
SELECT 
  category,
  SUM(CASE 
    WHEN frequency = 'MONTHLY' THEN amount
    WHEN frequency = 'QUARTERLY' THEN amount / 3
    WHEN frequency = 'ANNUALLY' THEN amount / 12
    ELSE amount
  END) as monthly_amount
FROM expenses 
WHERE userId = ?
GROUP BY category
```

---

## PORTFOLIO PERFORMANCE DATA FLOW

### Portfolio Value Calculation
```
Holdings Data → Price Updates → Value Calculation → Performance Metrics
```

| Calculation | Database Source | API Processing | UI Display |
|-------------|----------------|----------------|------------|
| **Total Portfolio Value** | `SUM(holdings.shares × holdings.currentPrice)` | `portfolioValue` | "$XXX,XXX Portfolio Value" |
| **Total Cost Basis** | `SUM(holdings.shares × holdings.costBasis)` | `costBasis` | Internal calculation |
| **Total Return %** | `(portfolioValue - costBasis) / costBasis × 100` | `portfolioReturn` | "+X.X% Total Return" |
| **Daily Change** | `SUM(shares × (currentPrice - previousClose))` | `dailyChange` | "+$XXX Today" |

### SPY Comparison Chain
```
Polygon SPY Data → Portfolio Return → Comparison Calculation → Outperformance Display
```

| Data Source | Field | Calculation | UI Element |
|-------------|-------|-------------|------------|
| Polygon API | `SPY.price` | Current SPY price | "$XXX.XX SPY Price" |
| Polygon API | `SPY.changePercent` | Daily SPY change | "SPY: +X.X%" |
| Portfolio calculation | `portfolioReturn` | Portfolio performance | "Portfolio: +X.X%" |
| Comparison | `portfolioReturn - spyReturn` | Outperformance | "+X.X% vs SPY" |

### Performance Database Integration
```sql
-- Portfolio performance snapshot
SELECT 
  p.name as portfolio_name,
  p.totalValue,
  p.totalCost,
  p.totalGain,
  p.totalGainPercent,
  p.monthlyIncome,
  COUNT(h.id) as holdings_count,
  SUM(h.shares * h.currentPrice) as calculated_value
FROM portfolios p 
LEFT JOIN holdings h ON p.id = h.portfolioId 
WHERE p.userId = ?
GROUP BY p.id
```

---

## TAX STRATEGY DATA FLOW

### Tax Profile to Strategy Calculations
```
Tax Profile Data → Portfolio Context → Strategy Generation → Savings Calculation
```

| Database Field | Type | API Usage | Strategy Impact | UI Display |
|----------------|------|-----------|-----------------|------------|
| `taxProfile.state` | string | `currentLocation` | State-specific strategies | "Tax Location: XX" |
| `taxProfile.effectiveRate` | number | `taxRate` | Overall tax burden | "Effective Rate: XX%" |
| `taxProfile.marginalRate` | number | Strategy calculations | Tax loss harvesting value | Used in savings calc |
| `taxProfile.qualifiedDividendRate` | number | Asset location strategy | Dividend optimization | "Qualified Rate: XX%" |

### Tax Strategy Calculations
```
Portfolio Data + Tax Profile → Dynamic Strategy Generation → Potential Savings
```

| Strategy | Calculation Formula | Database Inputs | UI Display |
|----------|-------------------|-----------------|------------|
| **Tax Loss Harvesting** | `portfolioValue × 0.02 × marginalRate` | Portfolio value, marginal rate | "Potential Savings: $XXX" |
| **Asset Location** | `annualDividends × (marginalRate - qualifiedRate)` | Dividend income, tax rates | "Tax Efficiency: $XXX" |
| **Roth Conversion** | `portfolioValue × 0.01 × 0.12` | Portfolio value | "Long-term Savings: $XXX" |

### Tax Database Query
```sql
SELECT 
  tp.state,
  tp.filingStatus,
  tp.effectiveRate,
  tp.marginalRate,
  tp.qualifiedDividendRate,
  tp.capitalGainsRate,
  -- Portfolio context
  SUM(h.shares * h.currentPrice) as portfolio_value,
  SUM(h.shares * h.currentPrice * h.dividendYield / 100) as annual_dividends
FROM tax_profiles tp
JOIN users u ON tp.userId = u.id
LEFT JOIN portfolios p ON u.id = p.userId  
LEFT JOIN holdings h ON p.id = h.portfolioId
WHERE tp.userId = ?
```

---

## FINANCIAL PLANNING DATA FLOW

### FIRE Calculations
```
Expense Data → Portfolio Value → FIRE Targets → Timeline Projections
```

| FIRE Type | Calculation | Database Inputs | API Response | UI Display |
|-----------|-------------|-----------------|--------------|------------|
| **Lean FIRE** | `annualExpenses × 20` | Monthly expenses × 12 | `fireTargets[0].targetAmount` | "Lean FIRE: $XXX,XXX" |
| **Traditional FIRE** | `annualExpenses × 25` | Monthly expenses × 12 | `fireTargets[1].targetAmount` | "FIRE: $XXX,XXX" |
| **Fat FIRE** | `annualExpenses × 30` | Monthly expenses × 12 | `fireTargets[2].targetAmount` | "Fat FIRE: $XXX,XXX" |
| **Years to Target** | `ln(target/current) / ln(1.07)` | Portfolio value, target | `fireTargets[x].yearsToTarget` | "XX years to FIRE" |

### Milestone Progress Mapping
```
Fixed Milestones → Current Portfolio Value → Progress Calculation → Visual Progress
```

| Milestone | Target Value | Progress Calculation | UI Element |
|-----------|--------------|---------------------|------------|
| **First $10K** | `10000` | `Math.min(100, portfolioValue / 10000 × 100)` | Progress bar: "XX% complete" |
| **First $100K** | `100000` | `Math.min(100, portfolioValue / 100000 × 100)` | Progress bar: "XX% complete" |
| **First $500K** | `500000` | `Math.min(100, portfolioValue / 500000 × 100)` | Progress bar: "XX% complete" |
| **First Million** | `1000000` | `Math.min(100, portfolioValue / 1000000 × 100)` | Progress bar: "XX% complete" |

### Financial Planning Database Queries
```sql
-- Annual expenses for FIRE calculations
SELECT 
  SUM(CASE 
    WHEN frequency = 'MONTHLY' THEN amount * 12
    WHEN frequency = 'QUARTERLY' THEN amount * 4
    WHEN frequency = 'ANNUALLY' THEN amount
    ELSE amount * 12
  END) as annual_expenses
FROM expenses 
WHERE userId = ?

-- Current portfolio value for milestones
SELECT 
  SUM(h.shares * h.currentPrice) as current_portfolio_value
FROM holdings h 
JOIN portfolios p ON h.portfolioId = p.id 
WHERE p.userId = ?

-- Financial goals (if any custom goals exist)
SELECT 
  name,
  targetAmount,
  currentAmount,
  targetDate,
  category
FROM financial_goals 
WHERE userId = ? AND isActive = true
```

---

## EXTERNAL API INTEGRATIONS

### Polygon.io Stock Price Integration
```
Polygon API → Stock Price Service → Cache → Database Updates → UI Display
```

| Polygon Field | API Response | Cache Key | Database Update | UI Display |
|---------------|--------------|-----------|-----------------|------------|
| `results[0].c` | Current close price | `symbol:price:timestamp` | `holdings.currentPrice` | "$XX.XX current price" |
| `results[0].o` | Open price | `symbol:open:timestamp` | Previous close calculation | Daily change calculation |
| `results[0].t` | Timestamp | `symbol:timestamp` | `holdings.lastUpdated` | "Updated: X minutes ago" |

### Stock Price Service Data Flow
```typescript
// Service method chain
getStockPrice(symbol) → Polygon API → Cache Check → Price Calculation → Return StockPrice

interface StockPrice {
  symbol: string;        // Direct from symbol parameter
  price: number;         // From Polygon results[0].c
  change: number;        // price - previousClose
  changePercent: number; // (change / previousClose) * 100
  previousClose: number; // From Polygon results[0].o
  timestamp: Date;       // From Polygon results[0].t
}
```

---

## ERROR HANDLING & FALLBACKS

### API Failure Data Flow
```
API Request → Error Detection → Fallback Data → User Notification
```

| Error Scenario | Detection | Fallback Strategy | UI Handling |
|----------------|-----------|-------------------|-------------|
| **Polygon API Down** | Network timeout/error | Simulated price data | "Using cached prices" notice |
| **Database Connection** | Prisma error | Empty state response | "Unable to load data" message |
| **Invalid User Data** | Validation failure | Default values | "Please check your data" prompt |
| **Calculation Error** | Math/logic error | Previous cached values | "Data temporarily unavailable" |

### Fallback Data Sources
```typescript
// Stock prices fallback
const basePrices: Record<string, number> = {
  'SPY': 642.69,    // Hardcoded fallback prices
  'SCHD': 85.20,    // Used when Polygon fails
  'VTI': 295.30     // Ensures UI remains functional
};

// Performance fallback
const fallbackResponse = {
  portfolioValue: 125000,        // Static fallback values
  spyComparison: { /* ... */ },  // Prevents UI crashes
  holdings: [ /* ... */ ]        // Shows example data
};
```

---

## DATA VALIDATION & TRANSFORMATION

### Input Validation Chain
```
Raw Database Data → Type Validation → Range Checks → Format Conversion → API Response
```

| Data Type | Validation Rules | Transformation | Output Format |
|-----------|------------------|----------------|---------------|
| **Currency Values** | `>= 0, finite number` | Round to 2 decimals | `$XX,XXX.XX` |
| **Percentages** | `-100% to +1000%` | Convert to decimal | `X.X%` |
| **Dates** | Valid ISO date | Convert to Date object | `MMM DD, YYYY` |
| **Stock Symbols** | 1-5 uppercase letters | Trim and uppercase | `AAPL` |

### Calculation Validation
```typescript
// Safe division with fallback
const calculateReturn = (current: number, cost: number): number => {
  if (!cost || cost <= 0) return 0;
  return Math.round(((current - cost) / cost) * 10000) / 100; // Round to 2 decimals
};

// Safe percentage calculation
const calculatePercentage = (part: number, total: number): number => {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.max(0, (part / total) * 100));
};
```

This comprehensive field mapping ensures every data transformation is documented and traceable from database to UI display.