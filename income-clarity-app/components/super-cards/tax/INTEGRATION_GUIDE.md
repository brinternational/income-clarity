# StrategyComparisonEngine Integration Guide

This guide shows how to integrate the StrategyComparisonEngine into the Income Clarity Tax Strategy Hub.

## 🚀 Quick Integration

### 1. Import the Component

```tsx
import { StrategyComparisonEngine } from '@/components/super-cards/tax';
```

### 2. Basic Usage

```tsx
<StrategyComparisonEngine
  annualIncome={portfolioValue}
  location={userLocation}
  filingStatus={userFilingStatus}
/>
```

### 3. Full Integration Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import { StrategyComparisonEngine } from '@/components/super-cards/tax';
import { useUserProfile } from '@/contexts/UserProfileContext';

export function TaxStrategyComparisonTab() {
  const { profileData } = useUserProfile();
  const [portfolioValue, setPortfolioValue] = useState(100000);
  
  // Use actual user data when available
  const userLocation = profileData?.location?.state || 'CA';
  const userFilingStatus = profileData?.taxInfo?.filingStatus === 'married_joint' 
    ? 'marriedJoint' 
    : 'single';

  return (
    <div className="space-y-6">
      {/* Portfolio Value Input */}
      <div className="bg-white p-4 rounded-lg border">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Portfolio Value
        </label>
        <input
          type="number"
          value={portfolioValue}
          onChange={(e) => setPortfolioValue(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          min="10000"
          max="10000000"
          step="10000"
        />
      </div>

      {/* Strategy Comparison Engine */}
      <StrategyComparisonEngine
        annualIncome={portfolioValue}
        location={userLocation}
        filingStatus={userFilingStatus}
        showActions={true}
        className="bg-white p-6 rounded-xl border shadow-sm"
      />
    </div>
  );
}
```

## 🎯 Tax Strategy Hub Integration

### Main Hub Component

```tsx
// TaxStrategyHub.tsx
import { StrategyComparisonEngine } from './tax';

const TaxStrategyHub = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">
            Strategy Tax Comparison
          </h2>
          <p className="text-slate-600 mt-2">
            Compare investment strategies to maximize your after-tax income
          </p>
        </div>
        
        <div className="p-6">
          <StrategyComparisonEngine
            annualIncome={userPortfolioValue}
            location={userTaxLocation}
            filingStatus={userFilingStatus}
            showActions={true}
          />
        </div>
      </div>
    </div>
  );
};
```

### Tab Integration

```tsx
// TaxStrategyTabs.tsx
const tabs = [
  {
    id: 'strategy-comparison',
    name: '🏆 Strategy Comparison',
    description: 'THE MOAT - Compare 4 strategies',
    component: StrategyComparisonTab,
    badge: 'HERO'
  },
  {
    id: 'tax-intelligence',
    name: 'Tax Intelligence',
    description: 'Current tax analysis',
    component: TaxIntelligenceTab
  },
  // ... other tabs
];
```

## 📊 State Management Integration

### Zustand Store

```tsx
// stores/taxStrategyStore.ts
interface TaxStrategyState {
  selectedStrategies: string[];
  portfolioValue: number;
  taxLocation: string;
  filingStatus: 'single' | 'marriedJoint';
  comparisonResults: StrategyComparison[];
  lastUpdated: string;
}

const useTaxStrategyStore = create<TaxStrategyState>((set, get) => ({
  selectedStrategies: [],
  portfolioValue: 100000,
  taxLocation: 'CA',
  filingStatus: 'single',
  comparisonResults: [],
  lastUpdated: '',
  
  updatePortfolioValue: (value: number) => {
    set({ portfolioValue: value, lastUpdated: new Date().toISOString() });
  },
  
  updateTaxLocation: (location: string) => {
    set({ taxLocation: location, lastUpdated: new Date().toISOString() });
  }
}));
```

### Store Integration

```tsx
import { useTaxStrategyStore } from '@/stores/taxStrategyStore';

export function StrategyComparisonTab() {
  const {
    portfolioValue,
    taxLocation,
    filingStatus,
    updatePortfolioValue,
    updateTaxLocation
  } = useTaxStrategyStore();

  return (
    <StrategyComparisonEngine
      annualIncome={portfolioValue}
      location={taxLocation}
      filingStatus={filingStatus}
      // Component will automatically recalculate when props change
    />
  );
}
```

## 🎨 Theme Integration

### Custom Styling

```tsx
// Custom themed version
<StrategyComparisonEngine
  annualIncome={portfolioValue}
  location={taxLocation}
  filingStatus={filingStatus}
  className="
    bg-gradient-to-br from-slate-50 to-blue-50
    border-2 border-blue-200
    rounded-2xl
    shadow-xl
    p-8
  "
/>
```

### Dark Mode Support

```tsx
// Add dark mode classes
<div className="dark:bg-slate-800 dark:border-slate-600">
  <StrategyComparisonEngine
    // ... props
    className="dark:text-slate-100"
  />
</div>
```

## 📱 Mobile Optimization

### Responsive Container

```tsx
<div className="
  px-4 sm:px-6 lg:px-8
  max-w-7xl mx-auto
  space-y-6
">
  <StrategyComparisonEngine
    annualIncome={portfolioValue}
    location={taxLocation}
    filingStatus={filingStatus}
    className="w-full"
  />
</div>
```

### Mobile Tab Integration

```tsx
// Mobile-specific wrapper
const MobileTaxStrategyHub = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6">
        <StrategyComparisonEngine
          annualIncome={portfolioValue}
          location={taxLocation}
          filingStatus={filingStatus}
          showActions={true}
          className="bg-white rounded-xl shadow-sm"
        />
      </div>
    </div>
  );
};
```

## 🔗 API Integration

### Portfolio Data

```tsx
// Integrate with portfolio API
const usePortfolioValue = () => {
  const [value, setValue] = useState(100000);
  
  useEffect(() => {
    fetch('/api/portfolio/summary')
      .then(res => res.json())
      .then(data => setValue(data.totalValue));
  }, []);
  
  return value;
};

// Usage
const portfolioValue = usePortfolioValue();

<StrategyComparisonEngine
  annualIncome={portfolioValue}
  // ... other props
/>
```

### User Profile Integration

```tsx
// Automatic user data integration
const useUserTaxProfile = () => {
  const { user } = useAuth();
  
  return {
    location: user?.profile?.tax_location || 'CA',
    filingStatus: user?.profile?.filing_status || 'single',
    portfolioValue: user?.portfolio?.total_value || 100000
  };
};
```

## 📈 Analytics Integration

### Track Strategy Comparisons

```tsx
import { trackEvent } from '@/lib/analytics';

const handleStrategyView = (strategy: string) => {
  trackEvent('strategy_comparison_view', {
    strategy,
    location: taxLocation,
    portfolio_value: portfolioValue
  });
};

// Track winner selection
const handleWinnerSelection = (winner: StrategyComparison) => {
  trackEvent('optimal_strategy_identified', {
    strategy: winner.strategy,
    annual_advantage: winner.taxSavings,
    location: taxLocation
  });
};
```

## 🧪 Testing Integration

### Jest Unit Tests

```tsx
// __tests__/StrategyComparisonEngine.test.tsx
import { render, screen } from '@testing-library/react';
import { StrategyComparisonEngine } from '../StrategyComparisonEngine';

describe('StrategyComparisonEngine', () => {
  it('renders all 4 strategies', () => {
    render(
      <StrategyComparisonEngine
        annualIncome={100000}
        location="CA"
        filingStatus="single"
      />
    );
    
    expect(screen.getByText('Sell SPY Shares')).toBeInTheDocument();
    expect(screen.getByText('Dividend Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Covered Calls')).toBeInTheDocument();
    expect(screen.getByText('60/40 Portfolio')).toBeInTheDocument();
  });
  
  it('highlights Puerto Rico advantage', () => {
    render(
      <StrategyComparisonEngine
        annualIncome={100000}
        location="PR"
        filingStatus="single"
      />
    );
    
    expect(screen.getByText(/Puerto Rico Tax Paradise/)).toBeInTheDocument();
  });
});
```

### Playwright E2E Tests

```tsx
// e2e/strategy-comparison.spec.ts
import { test, expect } from '@playwright/test';

test('strategy comparison calculates correctly', async ({ page }) => {
  await page.goto('/tax-strategy');
  
  // Test California high-tax scenario
  await page.fill('[data-testid="portfolio-value"]', '500000');
  await page.selectOption('[data-testid="tax-location"]', 'CA');
  
  // Verify winner is calculated
  await expect(page.locator('[data-testid="winner-badge"]')).toBeVisible();
  
  // Test Puerto Rico scenario
  await page.selectOption('[data-testid="tax-location"]', 'PR');
  await expect(page.locator(':text("Tax Paradise")')).toBeVisible();
});
```

## 🚀 Performance Optimization

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const StrategyComparisonEngine = lazy(() => 
  import('./StrategyComparisonEngine').then(module => ({ 
    default: module.StrategyComparisonEngine 
  }))
);

export function LazyStrategyComparison(props) {
  return (
    <Suspense fallback={<StrategyComparisonSkeleton />}>
      <StrategyComparisonEngine {...props} />
    </Suspense>
  );
}
```

### Memoization

```tsx
import { memo, useMemo } from 'react';

const OptimizedStrategyComparison = memo(StrategyComparisonEngine, 
  (prevProps, nextProps) => {
    return (
      prevProps.annualIncome === nextProps.annualIncome &&
      prevProps.location === nextProps.location &&
      prevProps.filingStatus === nextProps.filingStatus
    );
  }
);
```

---

This integration guide ensures seamless implementation of the StrategyComparisonEngine as the centerpiece of Income Clarity's competitive advantage.