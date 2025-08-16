# Tax-Optimized Rebalancing System

A sophisticated portfolio rebalancing engine that minimizes tax implications while maintaining optimal asset allocation. This system is specifically designed for Income Clarity users and includes special optimizations for Puerto Rico residents under Act 60.

## 📋 Overview

The Tax-Optimized Rebalancing system provides:
- **Location-aware tax optimization** with special handling for Puerto Rico Act 60 benefits
- **Intelligent trade recommendations** that minimize tax drag
- **Wash sale rule enforcement** with alternative suggestions
- **Multi-year tax planning** and scenario modeling
- **Mobile-responsive interface** with touch-optimized interactions

## 🏗️ Architecture

### Core Components

```
components/strategy/
├── TaxOptimizedRebalancing.tsx    # Main component with state management
├── components/
│   ├── RebalancingDashboard.tsx   # Portfolio drift analysis & overview
│   ├── TaxImpactAnalysis.tsx      # Detailed tax impact calculations
│   ├── TradeRecommendations.tsx   # Interactive trade selection & filtering
│   └── WashSaleCalendar.tsx       # Calendar view of wash sale windows
├── hooks/
│   └── useTaxOptimizedRebalancing.ts  # Main data hook
├── utils/
│   ├── taxCalculations.ts         # Tax calculation engine
│   └── rebalancingLogic.ts        # Portfolio rebalancing algorithms
└── __tests__/
    └── TaxOptimizedRebalancing.test.tsx  # Comprehensive test suite
```

### Integration Points

```typescript
// Zustand Store Integration
import { useUserStore } from '@/store/userStore'
import { useSuperCardStore } from '@/store/superCardStore'

// Portfolio Data Integration
import { usePortfolios } from '@/hooks/usePortfolios'

// API Integration
import { superCardsAPI } from '@/lib/api/superCardsAPI'
```

## 🎯 Key Features

### 1. Location-Aware Tax Optimization

**Puerto Rico Act 60 Benefits:**
- 0% tax on qualified dividends and capital gains
- Special rebalancing strategies that maximize income
- No wash sale concerns for tax loss harvesting

**Multi-State Support:**
- California: Aggressive tax loss harvesting
- Texas/Florida: Federal-only optimization
- New York: State income tax considerations
- Nevada/Washington: Low-tax state strategies

### 2. Advanced Rebalancing Strategies

**Pre-built Strategies:**
```typescript
const STRATEGIES = [
  'aggressive-harvest',     // Maximum loss realization
  'puerto-rico-optimize',   // Zero tax optimization  
  'year-end-planning',      // December optimization
  'retirement-transition',  // Pre-retirement focus
  'high-tax-state'         // CA/NY optimization
];
```

**Trigger Types:**
- Threshold-based (5%, 10%, 15% deviation)
- Calendar-based (Monthly, Quarterly, Annually)
- Volatility-based (Market event triggers)
- Opportunity-based (Tax loss harvesting)

### 3. Intelligent Trade Recommendations

**Tax-Aware Lot Selection:**
- FIFO (First In, First Out)
- LIFO (Last In, First Out)
- HIFO (Highest In, First Out)
- Specific ID (Manual lot selection)

**Priority Scoring:**
```typescript
interface Trade {
  priority: 'high' | 'medium' | 'low';
  taxImpact: number;      // Negative = tax benefit
  washSaleRisk: boolean;
  alternatives: string[]; // Similar ETFs
  holdingPeriod: number;  // Days held
}
```

### 4. Wash Sale Prevention

**30-Day Window Tracking:**
- Visual calendar showing wash sale windows
- Alternative security suggestions
- Risk level assessment (low/medium/high)
- Safe trading periods highlighted

**Automated Alternatives:**
```typescript
const alternatives = {
  'ARKK': 'VGT',  // Innovation → Technology
  'SPY': 'IVV',   // S&P 500 alternatives
  'SCHD': 'VYM',  // Dividend ETF alternatives
  'AGG': 'BND'    // Bond ETF alternatives
};
```

## 🚀 Usage Examples

### Basic Implementation

```tsx
import { TaxOptimizedRebalancing } from '@/components/strategy/TaxOptimizedRebalancing';

export default function PortfolioStrategyHub() {
  return (
    <div className="space-y-6">
      <TaxOptimizedRebalancing 
        className="col-span-2" 
      />
    </div>
  );
}
```

### Advanced Configuration

```tsx
// With custom strategy and trigger
const [selectedStrategy, setSelectedStrategy] = useState('puerto-rico-optimize');
const [selectedTrigger, setSelectedTrigger] = useState('threshold-10');

<TaxOptimizedRebalancing 
  strategy={selectedStrategy}
  trigger={selectedTrigger}
  onTradeExecution={(results) => {
    console.log('Trades executed:', results);
    // Handle success/error states
  }}
/>
```

### Hook Usage

```tsx
import { useTaxOptimizedRebalancing } from '@/hooks/useTaxOptimizedRebalancing';

const {
  tradeRecommendations,
  taxSituation,
  estimatedSavings,
  executeRebalancing,
  previewTrades,
  exportStrategy
} = useTaxOptimizedRebalancing({
  strategy: 'aggressive-harvest',
  trigger: 'threshold-10',
  userLocation: 'California'
});
```

## 📊 Tax Calculation Engine

### Location-Specific Tax Rates

```typescript
interface TaxRates {
  federal: {
    ordinaryIncome: number;        // 24% bracket
    shortTermCapitalGains: number; // Same as ordinary
    longTermCapitalGains: number;  // 15% bracket
    qualifiedDividends: number;    // Same as long-term
  };
  state: {
    ordinaryIncome: number;
    capitalGains: number;
    dividends: number;
  };
  specialRules?: {
    act60?: boolean;  // Puerto Rico benefits
    act22?: boolean;  // Additional PR benefits
  };
}
```

### Tax Optimization Algorithms

**Loss Harvesting:**
```typescript
const identifyHarvestingOpportunities = (holdings, taxRates) => {
  return holdings
    .filter(h => h.unrealizedLoss > 500)
    .map(h => ({
      ticker: h.ticker,
      taxBenefit: h.unrealizedLoss * taxRates.effectiveRate,
      replacement: findSimilarETF(h.ticker),
      washSaleRisk: hasWashSaleRisk(h.ticker)
    }))
    .sort((a, b) => b.taxBenefit - a.taxBenefit);
};
```

**Multi-Year Planning:**
```typescript
const projectTaxScenarios = (currentGains, taxRates) => {
  return [
    { year: 'Current', gains: currentGains, taxes: calculateTax(currentGains) },
    { year: 'Next', gains: currentGains * 1.15, taxes: calculateTax(currentGains * 1.15) },
    { year: '3-Year', gains: currentGains * 1.45, taxes: calculateTax(currentGains * 1.45) }
  ];
};
```

## 🎨 UI Components Guide

### RebalancingDashboard

**Purpose:** Portfolio drift analysis and high-level overview
**Features:**
- Current vs target allocation visualization
- Trade recommendations summary
- Location-based tax advantages
- Key performance metrics

### TaxImpactAnalysis  

**Purpose:** Detailed tax calculations and multi-year projections
**Features:**
- Short-term vs long-term capital gains breakdown
- Tax optimization strategies comparison
- Location-specific benefits analysis
- Multi-year tax scenario modeling

### TradeRecommendations

**Purpose:** Interactive trade selection and execution
**Features:**
- Filterable and sortable trade list
- Individual trade selection
- Tax impact visualization
- Batch trade execution
- Alternative suggestions for wash sales

### WashSaleCalendar

**Purpose:** Visual wash sale window tracking
**Features:**
- Monthly calendar view with event markers
- Active wash sale risk tracking
- Safe trading period identification
- Alternative security recommendations

## 🧪 Testing

### Test Coverage

**Unit Tests (80%+ coverage):**
- Tax calculation accuracy
- Rebalancing algorithm logic
- Component rendering and interactions
- Error handling and edge cases

**Integration Tests:**
- Hook data flow
- Component communication
- API integration
- User workflow completion

**Performance Tests:**
- Large portfolio handling (1000+ holdings)
- Rendering performance (<100ms)
- Memory usage optimization
- Mobile responsiveness

### Running Tests

```bash
# Run all tests
npm test components/strategy

# Run specific test file
npm test TaxOptimizedRebalancing.test.tsx

# Run with coverage
npm test -- --coverage components/strategy

# Run in watch mode
npm test -- --watch components/strategy
```

## 📱 Mobile Optimization

### Touch Interactions
- **Swipe gestures** for trade selection
- **Touch-friendly buttons** (44px minimum)
- **Pull-to-refresh** for data updates
- **Haptic feedback** for trade confirmations

### Responsive Design
- **Mobile-first** CSS approach
- **Collapsible sections** for complex data
- **Simplified navigation** on small screens
- **Optimized typography** for readability

### Performance Optimizations
- **Lazy loading** of heavy components
- **Virtual scrolling** for large trade lists
- **Image optimization** for charts and icons
- **Code splitting** for mobile bundle size

## 🔒 Security Considerations

### Data Protection
- **No sensitive data logging** in production
- **Encrypted API communication** for trade execution
- **User consent** required for trade execution
- **Audit trail** for all rebalancing actions

### Input Validation
- **Server-side validation** for all trade parameters
- **SQL injection prevention** in API queries
- **Rate limiting** on API endpoints
- **CSRF protection** for state-changing operations

## 🚀 Performance Optimization

### Bundle Size Optimization
- **Tree-shaking** for unused utilities
- **Dynamic imports** for heavy components
- **Code splitting** by view modes
- **Lazy loading** of calculation engines

### Runtime Performance
- **Memoization** of expensive calculations
- **Virtual scrolling** for large datasets
- **Debounced updates** for real-time data
- **Web Workers** for heavy computations

### Caching Strategy
- **L1 Cache:** In-memory results (1 minute)
- **L2 Cache:** Session storage (5 minutes)
- **L3 Cache:** IndexedDB (1 hour)
- **API Cache:** CDN edge caching (varies)

## 🔮 Future Enhancements

### Phase 1: Advanced Features
- [ ] **AI-powered recommendations** using machine learning
- [ ] **Real-time market data integration** with WebSocket feeds
- [ ] **Social trading features** with anonymized peer comparisons
- [ ] **Advanced charting** with technical analysis tools

### Phase 2: Platform Expansion
- [ ] **Brokerage integrations** for direct trade execution
- [ ] **Crypto asset support** with DeFi considerations  
- [ ] **International markets** with country-specific tax rules
- [ ] **API marketplace** for third-party integrations

### Phase 3: Enterprise Features
- [ ] **Multi-user accounts** for families and advisors
- [ ] **White-label solutions** for financial institutions
- [ ] **Advanced reporting** with regulatory compliance
- [ ] **Machine learning insights** for predictive analytics

## 📚 Additional Resources

### Documentation
- [Tax Strategy Hub Integration Guide](../super-cards/tax/INTEGRATION_GUIDE.md)
- [Portfolio Strategy Hub Overview](../super-cards/PortfolioStrategyHub.tsx)
- [Super Cards Blueprint](../../../SUPER_CARDS_BLUEPRINT.md)

### API References
- [Super Cards API](../../../lib/api/superCardsAPI.ts)
- [Tax Calculations API](../../../lib/api/taxCalculationsAPI.ts)
- [Portfolio Data API](../../../lib/api/portfolioAPI.ts)

### Related Components
- [Strategy Comparison Engine](./StrategyComparisonEngine.tsx)
- [Advanced Rebalancer](./AdvancedRebalancer.tsx)
- [Tax Intelligence Engine](./TaxIntelligenceEngineCard.tsx)

---

**Built with ❤️ for Income Clarity users, especially those maximizing their Puerto Rico Act 60 tax advantages.**