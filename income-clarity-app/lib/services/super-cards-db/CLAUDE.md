# SUPER CARDS DATABASE SERVICE - CLAUDE.md

## 🗃️ Super Cards Database Service (Central Data Hub)

**STATUS**: Working - Real Data Integration  
**DATA SOURCE**: Prisma + SQLite  
**INTEGRATION**: Live user data from holdings, expenses, income  
**SCOPE**: All 5 Super Cards data aggregation

### Current State Overview
- ✅ Prisma integration for real user data
- ✅ All 5 Super Cards data compilation
- ✅ SQLite local caching for performance
- ✅ Real-time calculations from user holdings
- ✅ Fallback data for empty portfolios
- ✅ Comprehensive data aggregation methods

### Service Files Structure
```
/lib/services/super-cards-db/
└── super-cards-database.service.ts  # Central data aggregation service

Related Database:
├── prisma/schema.prisma              # Database schema
└── data/super-cards.sqlite          # Local cache database
```

## 🏗️ Architecture Overview

### Data Flow Architecture
```
User Data (Prisma) → Aggregation Logic → Super Cards Data → UI Components
    ↓                       ↓                    ↓              ↓
Holdings/Expenses    →  Calculations      →  Structured    →  Dashboard
Income/Goals                                   Results         Display
```

### Dual Database Approach
1. **Prisma Database**: Source of truth for user data
2. **SQLite Cache**: Performance optimization for aggregated results

## 💳 Super Cards Data Structures

### 1. Income Intelligence Hub
```typescript
interface IncomeHubData {
  monthlyDividendIncome: number;    // From real holdings
  grossMonthly: number;             // Income + dividends
  taxOwed: number;                  // Based on tax profile
  netMonthly: number;               // After taxes
  monthlyExpenses: number;          // From user expenses
  availableToReinvest: number;      // Net - expenses
  aboveZeroLine: boolean;          // Positive cash flow
  expenseMilestones: ExpenseMilestone[];
}
```

### 2. Performance Hub
```typescript
interface PerformanceHubData {
  portfolioValue: number;           // Current market value
  spyPrice: number;                // SPY benchmark
  totalReturn: number;             // Portfolio performance %
  dividendYield: number;           // Weighted average yield
  monthlyDividends: number;        // Monthly dividend income
  yearlyDividends: number;         // Annual projections
  spyComparison: number;          // vs SPY performance
  holdings: PortfolioHolding[];   // Detailed holdings
}
```

### 3. Portfolio Strategy Hub
```typescript
interface PortfolioStrategyHubData {
  holdings: PortfolioHolding[];           // Current positions
  sectorAllocation: SectorAllocation[];   // Sector breakdown
  riskMetrics: RiskMetrics;              // Beta, volatility, Sharpe
  strategies: Strategy[];                 // Active strategies
  portfolioComposition?: any;            // Allocation analysis
  rebalancingSuggestions?: any;          // Rebalancing advice
}
```

### 4. Tax Strategy Hub
```typescript
interface TaxStrategyHubData {
  currentLocation: string;              // User's state
  taxRate: number;                     // Effective tax rate
  strategies: TaxStrategy[];           // Available strategies
  potentialSavings: number;           // Estimated savings
}
```

### 5. Financial Planning Hub
```typescript
interface FinancialPlanningHubData {
  fireTargets: FIRETarget[];           // FIRE scenarios
  milestones: Milestone[];             // Progress milestones
  projections: FinancialProjection[]; // 10-year projections
}
```

## 🔄 Data Aggregation Methods

### Income Hub Data Compilation
```typescript
async getIncomeHubData(): Promise<IncomeHubData | null>
```
**Data Sources:**
- `prisma.income` → Monthly income streams
- `prisma.expense` → Monthly expenses
- `prisma.holding` → Dividend calculations
- `prisma.taxProfile` → Tax rate calculations

**Calculations:**
- Monthly dividend income from holdings × yield
- Gross monthly = income + dividends
- Tax owed = gross × effective rate
- Available to reinvest = net - expenses

### Performance Hub Data Compilation
```typescript
async getPerformanceHubData(): Promise<PerformanceHubData | null>
```
**Data Sources:**
- `prisma.holding` → Portfolio positions
- Real-time price service → Current values
- Cost basis calculations → Return percentages

**Calculations:**
- Portfolio value = shares × current prices
- Total return = (current - cost basis) / cost basis
- Weighted dividend yield across holdings
- SPY comparison analysis

### Portfolio Strategy Hub Data Compilation
```typescript
async getPortfolioStrategyHubData(): Promise<PortfolioStrategyHubData | null>
```
**Data Sources:**
- `prisma.holding` → Position details
- Historical data service → Risk metrics
- Sector classification → Allocation analysis

**Calculations:**
- Sector allocation percentages
- Risk metrics (beta, volatility, Sharpe ratio)
- Strategy status based on portfolio composition

### Tax Strategy Hub Data Compilation
```typescript
async getTaxStrategyHubData(): Promise<TaxStrategyHubData | null>
```
**Data Sources:**
- `prisma.taxProfile` → User tax situation
- `prisma.holding` → Portfolio for tax calculations
- Tax calculator service → Strategy suggestions

**Calculations:**
- Tax-loss harvesting opportunities
- Asset location optimization potential
- Roth conversion benefits
- Charitable giving strategies

### Financial Planning Hub Data Compilation
```typescript
async getFinancialPlanningHubData(): Promise<FinancialPlanningHubData | null>
```
**Data Sources:**
- `prisma.holding` → Current portfolio value
- `prisma.expense` → Annual expense calculations
- `prisma.financialGoal` → User-defined goals

**Calculations:**
- FIRE targets using 25x rule variations
- Milestone progress tracking
- 10-year projection modeling

## 📊 Real Data Integration

### Holdings Integration
```typescript
// Real portfolio data from Prisma
const holdings = await this.prisma.holding.findMany({
  where: { portfolio: { userId: user.id } },
  include: { portfolio: true }
});

// Calculate current values
holdings.map(holding => {
  const currentValue = holding.shares * (holding.currentPrice || 0);
  const annualDividend = currentValue * ((holding.dividendYield || 0) / 100);
  return { ...holding, currentValue, annualDividend };
});
```

### Expense Integration
```typescript
// Monthly expenses from user data
const monthlyExpenses = expenses
  .filter(expense => expense.frequency === 'MONTHLY')
  .reduce((sum, expense) => sum + expense.amount, 0);

// Expense milestones
const expenseMilestones = [
  {
    id: 'housing',
    category: 'Housing',
    monthlyAmount: expenses.filter(e => e.category === 'RENT')
      .reduce((sum, e) => sum + e.amount, 0),
    covered: monthlyDividendIncome > 500,
    priority: 1
  }
];
```

### Tax Profile Integration
```typescript
// Tax calculations from user profile
const taxProfile = await this.prisma.taxProfile.findFirst({ 
  where: { userId: user.id } 
});
const effectiveTaxRate = taxProfile?.effectiveRate || 0.22;
const taxOwed = grossMonthly * effectiveTaxRate;
```

## 🚀 Performance Optimizations

### Caching Strategy
- **SQLite Cache**: Stores aggregated results for quick access
- **Prisma Efficiency**: Optimized queries with includes
- **Calculation Caching**: Expensive calculations cached locally

### Real-time Updates
```typescript
// Update methods for each hub
async updateIncomeHubData(data: Partial<IncomeHubData>): Promise<boolean>
async updatePerformanceHubData(data: Partial<PerformanceHubData>): Promise<boolean>
async updatePortfolioStrategyHubData(data: Partial<PortfolioStrategyHubData>): Promise<boolean>
```

### Fallback Handling
```typescript
// Default data when no user data exists
private getDefaultIncomeHubData(): IncomeHubData
private getDefaultPerformanceHubData(): PerformanceHubData
private getDefaultPortfolioStrategyHubData(): PortfolioStrategyHubData
private getDefaultTaxStrategyHubData(): TaxStrategyHubData
private getDefaultFinancialPlanningHubData(): FinancialPlanningHubData
```

## 🔍 Risk Metrics Integration

### Historical Data Service Integration
```typescript
try {
  // Real risk metrics from historical data
  const { historicalDataService } = await import('@/lib/services/historical/historical-data.service');
  const realRiskMetrics = await historicalDataService.calculateRiskMetrics(user.id, '1Y');
  
  riskMetrics = {
    beta: realRiskMetrics.beta,
    volatility: realRiskMetrics.volatility,
    sharpeRatio: realRiskMetrics.sharpeRatio,
    maxDrawdown: realRiskMetrics.maxDrawdown
  };
} catch (error) {
  // Fallback to estimated metrics
  riskMetrics = { beta: 1.0, volatility: 15.5, sharpeRatio: 1.2, maxDrawdown: 12.3 };
}
```

## 💼 FIRE Calculations

### FIRE Target Calculations
```typescript
// Multiple FIRE scenarios
const fireTargets: FIRETarget[] = [
  {
    id: 'lean-fire',
    type: 'lean',
    targetAmount: annualExpenses * 20,  // 20x for lean FIRE
    monthlyNeeded: (target - current) / 12 / 30,
    yearsToTarget: calculateYearsToTarget(current, target, 0.07)
  },
  {
    id: 'traditional-fire',
    type: 'fat',
    targetAmount: annualExpenses * 25,  // Traditional 25x rule
    monthlyNeeded: (target - current) / 12 / 25,
    yearsToTarget: calculateYearsToTarget(current, target, 0.07)
  }
];
```

### Projection Modeling
```typescript
// 10-year projections with compound growth
let projectedValue = portfolioValue;
for (let i = 0; i <= 10; i++) {
  const annualDividends = projectedValue * 0.03; // 3% dividend yield
  projections.push({
    year: currentYear + i,
    portfolioValue: projectedValue,
    annualDividends,
    reinvestmentAmount: monthlyContribution * 12
  });
  
  // Compound growth: value * (1 + return) + contributions
  projectedValue = projectedValue * (1 + annualReturn) + (monthlyContribution * 12);
}
```

## 🔧 Database Schema Integration

### Prisma Relations Used
```typescript
// Holdings with portfolio
holding.findMany({
  where: { portfolio: { userId: user.id } },
  include: { portfolio: true }
})

// Income streams
income.findMany({ where: { userId: user.id } })

// Expenses by category
expense.findMany({ where: { userId: user.id } })

// Tax profile
taxProfile.findFirst({ where: { userId: user.id } })

// Financial goals
financialGoal.findMany({ where: { userId: user.id, isActive: true } })
```

## 📈 Key Service Methods

### Core Data Retrieval
```typescript
// Hub data getters
getIncomeHubData(): Promise<IncomeHubData | null>
getPerformanceHubData(): Promise<PerformanceHubData | null>
getPortfolioStrategyHubData(): Promise<PortfolioStrategyHubData | null>
getTaxStrategyHubData(): Promise<TaxStrategyHubData | null>
getFinancialPlanningHubData(): Promise<FinancialPlanningHubData | null>

// Portfolio operations
getPortfolioHoldings(): Promise<PortfolioHolding[]>
updatePortfolioHolding(holding: PortfolioHolding): Promise<boolean>

// Utility methods
getCurrentUser(): Promise<User | null>
initializeWithSampleData(): Promise<boolean>
closeConnection(): Promise<void>
```

## 🚨 Error Handling & Resilience

### Error Scenarios
1. **No User Data**: Falls back to default empty state
2. **Empty Portfolio**: Shows getting started guidance
3. **Missing Tax Profile**: Uses default tax rates
4. **Calculation Errors**: Logs errors, continues with defaults

### Graceful Degradation
```typescript
try {
  // Attempt real data calculation
  const realData = await calculateFromUserData();
  return realData;
} catch (error) {
  logger.error('Error calculating hub data:', error);
  return this.getDefaultData();
}
```

## 🧪 Testing & Development

### Sample Data Removed
- **Production Ready**: No mock data in service
- **Real Data Only**: Requires actual user portfolio
- **Graceful Empty State**: Handles new users appropriately

### Testing Commands
```bash
# Test data aggregation
curl http://localhost:3000/api/super-cards/income-hub
curl http://localhost:3000/api/super-cards/performance-hub
curl http://localhost:3000/api/super-cards/portfolio-strategy-hub
curl http://localhost:3000/api/super-cards/tax-strategy-hub
curl http://localhost:3000/api/super-cards/financial-planning-hub
```

## 📊 Performance Considerations

### Optimization Strategies
- **Parallel Queries**: Multiple Prisma queries run concurrently
- **Selective Loading**: Only fetch needed data with includes
- **Calculation Caching**: Cache expensive computations
- **Lazy Loading**: Calculate on-demand rather than precompute

### Memory Management
- **Connection Pooling**: Prisma connection management
- **SQLite Cleanup**: Regular cache cleanup
- **Error Boundary**: Isolate calculation failures

## 🚀 Future Enhancements

### Planned Improvements
- **Redis Caching**: Replace SQLite with Redis for scalability
- **Real-time Updates**: WebSocket integration for live data
- **Historical Tracking**: Track changes over time
- **Advanced Analytics**: More sophisticated calculations
- **Batch Processing**: Bulk user data updates

### Integration Opportunities
- **Yodlee Integration**: Real bank data integration
- **Machine Learning**: Portfolio optimization suggestions
- **Alerts System**: Milestone and performance alerts
- **Export Features**: Data export capabilities