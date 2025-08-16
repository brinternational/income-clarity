# ENHANCED TECHNICAL ROADMAP: SUPER CARD IMPLEMENTATION
*Detailed technical implementation guide with code examples and architecture patterns*

## 🏗️ TECHNICAL ARCHITECTURE

### Core Technology Stack Additions

```json
{
  "dependencies": {
    // State Management (lighter than deep context nesting)
    "zustand": "^4.4.7",
    "immer": "^10.0.3",
    
    // Data Fetching & Caching
    "swr": "^2.2.4",
    "@tanstack/react-query": "^5.17.0",
    
    // Performance Optimization
    "react-window": "^1.8.10",
    "comlink": "^4.4.1", // Web Workers
    
    // Code Quality
    "@tanstack/eslint-plugin-query": "^5.14.6",
    "react-error-boundary": "^4.0.12"
  }
}
```

### Super Card Base Architecture

```typescript
// Base Super Card Component
// /components/super-cards/base/SuperCard.tsx

import { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { useSuperCardState } from '@/hooks/useSuperCardState';

interface SuperCardProps {
  id: string;
  title: string;
  icon: React.ComponentType;
  tabs: TabConfig[];
  defaultTab?: string;
  className?: string;
}

interface TabConfig {
  id: string;
  label: string;
  component: React.LazyExoticComponent<any>;
  preload?: boolean;
  icon?: React.ComponentType;
}

export const SuperCard: React.FC<SuperCardProps> = ({
  id,
  title,
  icon: Icon,
  tabs,
  defaultTab,
  className
}) => {
  const { activeTab, setActiveTab, isExpanded, toggleExpanded } = useSuperCardState(id, defaultTab);
  
  return (
    <ErrorBoundary fallback={<SuperCardError />}>
      <motion.div
        layout
        className={`super-card ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="super-card-header">
          <div className="flex items-center space-x-3">
            <Icon className="w-6 h-6" />
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button onClick={toggleExpanded}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="super-card-tabs" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="super-card-content"
          >
            <Suspense fallback={<TabSkeleton />}>
              {tabs.map(tab => 
                activeTab === tab.id && (
                  <tab.component key={tab.id} isActive={true} />
                )
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </ErrorBoundary>
  );
};
```

### State Management with Zustand

```typescript
// /stores/superCardStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

interface SuperCardState {
  // State for each super card
  cards: {
    [cardId: string]: {
      activeTab: string;
      isExpanded: boolean;
      filters: Record<string, any>;
      cache: Record<string, any>;
    };
  };
  
  // Actions
  setActiveTab: (cardId: string, tabId: string) => void;
  toggleExpanded: (cardId: string) => void;
  updateFilters: (cardId: string, filters: Record<string, any>) => void;
  updateCache: (cardId: string, key: string, data: any) => void;
}

export const useSuperCardStore = create<SuperCardState>()(
  persist(
    immer((set) => ({
      cards: {},
      
      setActiveTab: (cardId, tabId) =>
        set((state) => {
          if (!state.cards[cardId]) {
            state.cards[cardId] = {
              activeTab: tabId,
              isExpanded: false,
              filters: {},
              cache: {}
            };
          } else {
            state.cards[cardId].activeTab = tabId;
          }
        }),
        
      toggleExpanded: (cardId) =>
        set((state) => {
          if (state.cards[cardId]) {
            state.cards[cardId].isExpanded = !state.cards[cardId].isExpanded;
          }
        }),
        
      updateFilters: (cardId, filters) =>
        set((state) => {
          if (state.cards[cardId]) {
            state.cards[cardId].filters = { ...state.cards[cardId].filters, ...filters };
          }
        }),
        
      updateCache: (cardId, key, data) =>
        set((state) => {
          if (state.cards[cardId]) {
            state.cards[cardId].cache[key] = data;
          }
        })
    })),
    {
      name: 'super-card-storage',
      partialize: (state) => ({ cards: state.cards })
    }
  )
);
```

## 🏆 PERFORMANCE HUB IMPLEMENTATION

### Complete Implementation Example

```typescript
// /components/super-cards/PerformanceHub/index.tsx
import { lazy } from 'react';
import { SuperCard } from '../base/SuperCard';
import { TrendingUp } from 'lucide-react';

// Lazy load tab components
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const HoldingsTab = lazy(() => import('./tabs/HoldingsTab'));
const ComparisonTab = lazy(() => import('./tabs/ComparisonTab'));
const AnalyticsTab = lazy(() => import('./tabs/AnalyticsTab'));

export const PerformanceHub = () => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      component: OverviewTab,
      preload: true // Preload the default tab
    },
    {
      id: 'holdings',
      label: 'Holdings',
      component: HoldingsTab
    },
    {
      id: 'comparison',
      label: 'vs SPY',
      component: ComparisonTab
    },
    {
      id: 'analytics',
      label: 'Analytics',
      component: AnalyticsTab
    }
  ];
  
  return (
    <SuperCard
      id="performance-hub"
      title="Performance Hub"
      icon={TrendingUp}
      tabs={tabs}
      defaultTab="overview"
      className="performance-hub"
    />
  );
};
```

### Overview Tab with Hero Metrics

```typescript
// /components/super-cards/PerformanceHub/tabs/OverviewTab.tsx
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { HeroMetric } from '@/components/ui/HeroMetric';
import { PerformanceChart } from '../components/PerformanceChart';
import { QuickStats } from '../components/QuickStats';
import { AIInsights } from '../components/AIInsights';

export default function OverviewTab({ isActive }: { isActive: boolean }) {
  const { data, isLoading, error } = usePerformanceData({
    enabled: isActive,
    revalidateOnFocus: true
  });
  
  if (isLoading) return <OverviewSkeleton />;
  if (error) return <ErrorState error={error} />;
  
  const { portfolioReturn, spyReturn, outperformance, holdings } = data;
  
  return (
    <div className="overview-tab">
      {/* Hero Metric - Outperformance */}
      <HeroMetric
        value={outperformance}
        label="Outperforming SPY"
        format="percentage"
        trend={outperformance > 0 ? 'up' : 'down'}
        size="large"
      />
      
      {/* Quick Stats Grid */}
      <QuickStats
        stats={[
          { label: 'Portfolio Return', value: portfolioReturn, format: 'percentage' },
          { label: 'SPY Return', value: spyReturn, format: 'percentage' },
          { label: 'Total Value', value: data.totalValue, format: 'currency' },
          { label: 'Monthly Income', value: data.monthlyIncome, format: 'currency' }
        ]}
      />
      
      {/* Performance Chart */}
      <PerformanceChart
        portfolioData={data.portfolioHistory}
        spyData={data.spyHistory}
        period={data.selectedPeriod}
      />
      
      {/* AI-Powered Insights */}
      <AIInsights
        insights={[
          {
            type: 'success',
            title: 'Top Performers',
            message: `${data.topPerformers[0].symbol} is your best performer at +${data.topPerformers[0].return}%`
          },
          {
            type: 'warning',
            title: 'Underperformers',
            message: `Consider reviewing ${data.underperformers[0].symbol} (-${Math.abs(data.underperformers[0].return)}%)`
          },
          {
            type: 'info',
            title: 'Recommendation',
            message: 'Based on your performance, consider rebalancing into dividend growth stocks'
          }
        ]}
      />
    </div>
  );
}
```

### Data Fetching Hook with SWR

```typescript
// /hooks/usePerformanceData.ts
import useSWR from 'swr';
import { useAuthContext } from '@/contexts/AuthContext';
import { performanceService } from '@/services/performance.service';

interface UsePerformanceDataOptions {
  enabled?: boolean;
  revalidateOnFocus?: boolean;
  refreshInterval?: number;
}

export function usePerformanceData(options: UsePerformanceDataOptions = {}) {
  const { user } = useAuthContext();
  const { enabled = true, revalidateOnFocus = false, refreshInterval = 0 } = options;
  
  const { data, error, isLoading, mutate } = useSWR(
    enabled && user ? ['performance', user.id] : null,
    () => performanceService.getPerformanceHubData(user!.id),
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 60000, // 1 minute
      fallbackData: getCachedData('performance'),
      onSuccess: (data) => {
        setCachedData('performance', data);
        // Preload next likely tab
        preloadTabData('holdings');
      }
    }
  );
  
  return {
    data,
    isLoading,
    error,
    refresh: mutate
  };
}

// Cache utilities
function getCachedData(key: string) {
  try {
    const cached = localStorage.getItem(`super-card-cache-${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Check if cache is less than 5 minutes old
      if (Date.now() - timestamp < 300000) {
        return data;
      }
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }
  return null;
}

function setCachedData(key: string, data: any) {
  try {
    localStorage.setItem(
      `super-card-cache-${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

function preloadTabData(tab: string) {
  // Trigger data fetching for likely next tab
  if (tab === 'holdings') {
    import('../services/holdings.service').then(({ holdingsService }) => {
      holdingsService.preloadHoldingsData();
    });
  }
}
```

### Performance Service with Aggregation

```typescript
// /services/performance.service.ts
import { supabase } from '@/lib/supabase-client';

export class PerformanceService {
  async getPerformanceHubData(userId: string) {
    // Parallel data fetching
    const [portfolio, spyData, holdings, analytics] = await Promise.all([
      this.getPortfolioSummary(userId),
      this.getSPYComparison(userId),
      this.getHoldingsPerformance(userId),
      this.getAnalytics(userId)
    ]);
    
    // Calculate derived metrics
    const outperformance = portfolio.totalReturn - spyData.return;
    const topPerformers = holdings
      .sort((a, b) => b.return - a.return)
      .slice(0, 3);
    const underperformers = holdings
      .filter(h => h.return < 0)
      .sort((a, b) => a.return - b.return)
      .slice(0, 3);
    
    return {
      portfolioReturn: portfolio.totalReturn,
      spyReturn: spyData.return,
      outperformance,
      totalValue: portfolio.totalValue,
      monthlyIncome: portfolio.monthlyIncome,
      holdings,
      topPerformers,
      underperformers,
      portfolioHistory: portfolio.history,
      spyHistory: spyData.history,
      analytics,
      lastUpdated: new Date().toISOString()
    };
  }
  
  private async getPortfolioSummary(userId: string) {
    const { data, error } = await supabase
      .from('portfolio_summary_view')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  }
  
  // ... other methods
}

export const performanceService = new PerformanceService();
```

## 💰 INCOME INTELLIGENCE HUB PATTERN

### Tax-Optimized Calendar Integration

```typescript
// /components/super-cards/IncomeHub/components/TaxOptimizedCalendar.tsx
import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/Calendar';
import { useIncomeData } from '@/hooks/useIncomeData';
import { calculateTaxImpact } from '@/lib/tax-calculations';

export function TaxOptimizedCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { dividends, taxSettings } = useIncomeData();
  
  const calendarEvents = useMemo(() => {
    return dividends.map(dividend => {
      const taxImpact = calculateTaxImpact(dividend, taxSettings);
      
      return {
        date: dividend.payDate,
        title: `${dividend.symbol} - ${formatCurrency(dividend.amount)}`,
        type: dividend.qualified ? 'qualified' : 'ordinary',
        taxImpact,
        color: getTaxOptimizedColor(taxImpact),
        recommendation: getTaxRecommendation(dividend, taxSettings)
      };
    });
  }, [dividends, taxSettings]);
  
  const nextOptimalReinvestDate = useMemo(() => {
    // Complex calculation for tax-optimized reinvestment timing
    return calculateOptimalReinvestDate(dividends, taxSettings);
  }, [dividends, taxSettings]);
  
  return (
    <div className="tax-optimized-calendar">
      <div className="calendar-header">
        <h3>Tax-Optimized Payment Schedule</h3>
        <div className="optimization-alert">
          {nextOptimalReinvestDate && (
            <Alert type="info">
              Stop reinvesting on {formatDate(nextOptimalReinvestDate)} for optimal tax treatment
            </Alert>
          )}
        </div>
      </div>
      
      <Calendar
        events={calendarEvents}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        renderEvent={(event) => (
          <div className={`calendar-event ${event.type}`}>
            <span className="symbol">{event.title}</span>
            <span className="tax-impact">{event.taxImpact}% tax</span>
            {event.recommendation && (
              <Tooltip content={event.recommendation}>
                <InfoIcon className="w-3 h-3" />
              </Tooltip>
            )}
          </div>
        )}
      />
      
      <TaxOptimizationInsights
        selectedDate={selectedDate}
        events={calendarEvents}
      />
    </div>
  );
}
```

## 🧠 STRATEGY OPTIMIZATION HUB

### AI-Powered Recommendation Engine

```typescript
// /lib/ai/strategy-advisor.ts
import { Portfolio, TaxSettings, MarketData } from '@/types';
import * as tf from '@tensorflow/tfjs';

export class StrategyAdvisor {
  private model: tf.LayersModel | null = null;
  
  async initialize() {
    // Load pre-trained model for strategy recommendations
    this.model = await tf.loadLayersModel('/models/strategy-advisor/model.json');
  }
  
  async getRecommendations(
    portfolio: Portfolio,
    taxSettings: TaxSettings,
    marketData: MarketData
  ): Promise<StrategyRecommendation[]> {
    if (!this.model) await this.initialize();
    
    // Prepare input features
    const features = this.extractFeatures(portfolio, taxSettings, marketData);
    const input = tf.tensor2d([features]);
    
    // Get predictions
    const predictions = this.model!.predict(input) as tf.Tensor;
    const scores = await predictions.array();
    
    // Generate recommendations based on scores
    const recommendations = this.interpretScores(scores[0], portfolio, taxSettings);
    
    // Clean up tensors
    input.dispose();
    predictions.dispose();
    
    return recommendations;
  }
  
  private extractFeatures(
    portfolio: Portfolio,
    taxSettings: TaxSettings,
    marketData: MarketData
  ): number[] {
    return [
      // Portfolio metrics
      portfolio.totalValue,
      portfolio.monthlyIncome,
      portfolio.yieldPercentage,
      portfolio.holdings.length,
      
      // Tax metrics
      taxSettings.federalRate,
      taxSettings.stateRate,
      taxSettings.filingStatus === 'single' ? 0 : 1,
      
      // Market metrics
      marketData.spyYield,
      marketData.volatilityIndex,
      marketData.interestRate,
      
      // Calculated metrics
      this.calculateDiversificationScore(portfolio),
      this.calculateTaxEfficiency(portfolio, taxSettings),
      this.calculateRiskScore(portfolio, marketData)
    ];
  }
  
  private interpretScores(
    scores: number[],
    portfolio: Portfolio,
    taxSettings: TaxSettings
  ): StrategyRecommendation[] {
    const recommendations: StrategyRecommendation[] = [];
    
    // Rebalancing recommendation
    if (scores[0] > 0.7) {
      recommendations.push({
        type: 'rebalance',
        priority: 'high',
        title: 'Portfolio Rebalancing Needed',
        description: 'Your portfolio has drifted from optimal allocation',
        actions: this.generateRebalancingActions(portfolio),
        impact: {
          expectedReturn: '+0.5%',
          riskReduction: '-2%',
          taxImpact: this.calculateRebalancingTaxImpact(portfolio, taxSettings)
        }
      });
    }
    
    // Tax optimization recommendation
    if (scores[1] > 0.6 && taxSettings.state !== 'PR') {
      const prSavings = this.calculatePuertoRicoSavings(portfolio, taxSettings);
      recommendations.push({
        type: 'tax-optimization',
        priority: 'medium',
        title: 'Tax Optimization Opportunity',
        description: `Moving to Puerto Rico could save $${prSavings.toLocaleString()}/year`,
        actions: [
          { 
            action: 'explore-relocation',
            description: 'Research Act 60 tax benefits'
          }
        ],
        impact: {
          annualSavings: prSavings,
          effectiveTaxRate: '0%',
          breakEvenPeriod: '18 months'
        }
      });
    }
    
    // Yield enhancement recommendation
    if (scores[2] > 0.5) {
      recommendations.push({
        type: 'yield-enhancement',
        priority: 'low',
        title: 'Yield Enhancement Opportunity',
        description: 'Consider covered call strategies on low-volatility holdings',
        actions: this.generateYieldEnhancementActions(portfolio),
        impact: {
          additionalIncome: '+$200/month',
          riskIncrease: 'minimal',
          complexity: 'moderate'
        }
      });
    }
    
    return recommendations.sort((a, b) => 
      this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority)
    );
  }
  
  private getPriorityScore(priority: string): number {
    const scores = { high: 3, medium: 2, low: 1 };
    return scores[priority] || 0;
  }
}

export const strategyAdvisor = new StrategyAdvisor();
```

## 📱 MOBILE OPTIMIZATION

### Responsive Super Card Design

```typescript
// /components/super-cards/base/ResponsiveSuperCard.tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SwipeableViews } from 'react-swipeable-views';

export function ResponsiveSuperCard({ tabs, activeTab, onTabChange }) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  if (isMobile) {
    return (
      <MobileSuperCard
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    );
  }
  
  if (isTablet) {
    return (
      <TabletSuperCard
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    );
  }
  
  return (
    <DesktopSuperCard
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
}

function MobileSuperCard({ tabs, activeTab, onTabChange }) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  
  return (
    <div className="mobile-super-card">
      {/* Swipeable tab content */}
      <SwipeableViews
        index={activeIndex}
        onChangeIndex={(index) => onTabChange(tabs[index].id)}
        enableMouseEvents
        resistance
      >
        {tabs.map(tab => (
          <div key={tab.id} className="swipeable-tab">
            <Suspense fallback={<TabSkeleton />}>
              <tab.component isActive={tab.id === activeTab} />
            </Suspense>
          </div>
        ))}
      </SwipeableViews>
      
      {/* Bottom tab indicators */}
      <div className="tab-indicators">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`indicator ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
          />
        ))}
      </div>
    </div>
  );
}
```

## 🧪 TESTING STRATEGY

### Comprehensive Test Suite

```typescript
// /__tests__/super-cards/PerformanceHub.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PerformanceHub } from '@/components/super-cards/PerformanceHub';
import { mockPerformanceData } from '@/__mocks__/performance-data';

describe('PerformanceHub Super Card', () => {
  beforeEach(() => {
    // Mock API responses
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('/api/performance')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPerformanceData)
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });
  
  it('renders with hero metric', async () => {
    render(<PerformanceHub />);
    
    await waitFor(() => {
      expect(screen.getByText('Outperforming SPY')).toBeInTheDocument();
      expect(screen.getByText('+5.2%')).toBeInTheDocument();
    });
  });
  
  it('switches tabs correctly', async () => {
    render(<PerformanceHub />);
    
    // Click on Holdings tab
    fireEvent.click(screen.getByRole('tab', { name: 'Holdings' }));
    
    await waitFor(() => {
      expect(screen.getByText('Individual Holdings Performance')).toBeInTheDocument();
    });
  });
  
  it('handles loading states', () => {
    render(<PerformanceHub />);
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });
  
  it('handles error states gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Error'));
    
    render(<PerformanceHub />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load performance data')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });
  
  it('maintains tab state between renders', async () => {
    const { rerender } = render(<PerformanceHub />);
    
    // Switch to Analytics tab
    fireEvent.click(screen.getByRole('tab', { name: 'Analytics' }));
    
    // Rerender component
    rerender(<PerformanceHub />);
    
    // Analytics tab should still be active
    expect(screen.getByRole('tab', { name: 'Analytics' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});

// Performance testing
describe('PerformanceHub Performance', () => {
  it('renders within performance budget', async () => {
    const startTime = performance.now();
    
    render(<PerformanceHub />);
    
    await waitFor(() => {
      expect(screen.getByText('Outperforming SPY')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // 100ms budget
  });
  
  it('lazy loads non-active tabs', () => {
    const { container } = render(<PerformanceHub />);
    
    // Only Overview tab should be loaded initially
    expect(container.querySelector('.overview-tab')).toBeInTheDocument();
    expect(container.querySelector('.holdings-tab')).not.toBeInTheDocument();
    expect(container.querySelector('.analytics-tab')).not.toBeInTheDocument();
  });
});
```

## 🚀 DEPLOYMENT STRATEGY

### Feature Flag Implementation

```typescript
// /lib/feature-flags.ts
import { useAuthContext } from '@/contexts/AuthContext';

export const FEATURE_FLAGS = {
  SUPER_CARDS_ENABLED: 'super_cards_enabled',
  PERFORMANCE_HUB: 'performance_hub',
  INCOME_HUB: 'income_hub',
  LIFESTYLE_HUB: 'lifestyle_hub',
  STRATEGY_HUB: 'strategy_hub',
  ACTIONS_CENTER: 'actions_center'
} as const;

export function useFeatureFlag(flag: keyof typeof FEATURE_FLAGS): boolean {
  const { user } = useAuthContext();
  
  // Check user-specific flags
  if (user?.featureFlags?.[flag]) {
    return true;
  }
  
  // Check global flags
  if (process.env.NEXT_PUBLIC_FEATURE_FLAGS) {
    const globalFlags = JSON.parse(process.env.NEXT_PUBLIC_FEATURE_FLAGS);
    return globalFlags[flag] || false;
  }
  
  // Check percentage rollout
  if (user && ROLLOUT_PERCENTAGES[flag]) {
    const hash = hashUserId(user.id);
    return hash < ROLLOUT_PERCENTAGES[flag];
  }
  
  return false;
}

// Gradual rollout configuration
const ROLLOUT_PERCENTAGES = {
  [FEATURE_FLAGS.SUPER_CARDS_ENABLED]: 0.1, // 10% of users
  [FEATURE_FLAGS.PERFORMANCE_HUB]: 0.2,     // 20% of users
  // ... other flags
};

function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100 / 100; // Return 0-1
}
```

### Progressive Enhancement

```typescript
// /app/dashboard/page.tsx
import { useFeatureFlag } from '@/lib/feature-flags';
import { PerformanceHub } from '@/components/super-cards/PerformanceHub';
import { LegacyDashboard } from '@/components/dashboard/LegacyDashboard';

export default function Dashboard() {
  const superCardsEnabled = useFeatureFlag('SUPER_CARDS_ENABLED');
  
  if (superCardsEnabled) {
    return <SuperCardDashboard />;
  }
  
  return <LegacyDashboard />;
}

function SuperCardDashboard() {
  const performanceHubEnabled = useFeatureFlag('PERFORMANCE_HUB');
  const incomeHubEnabled = useFeatureFlag('INCOME_HUB');
  // ... other flags
  
  return (
    <div className="super-card-dashboard">
      {performanceHubEnabled ? (
        <PerformanceHub />
      ) : (
        <>
          <SPYComparison />
          <HoldingsPerformance />
          <PortfolioOverview />
        </>
      )}
      
      {/* Similar pattern for other hubs */}
    </div>
  );
}
```

## 📊 MONITORING & ANALYTICS

### Performance Monitoring

```typescript
// /lib/monitoring/performance-monitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  measureSuperCardRender(cardId: string, callback: () => void) {
    const startMark = `super-card-${cardId}-start`;
    const endMark = `super-card-${cardId}-end`;
    const measureName = `super-card-${cardId}-render`;
    
    performance.mark(startMark);
    
    callback();
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    
    // Send to analytics
    this.sendMetric({
      name: 'super_card_render',
      value: measure.duration,
      tags: {
        card_id: cardId,
        viewport: this.getViewport()
      }
    });
    
    // Clean up
    performance.clearMarks();
    performance.clearMeasures();
  }
  
  private sendMetric(metric: Metric) {
    // Send to your analytics service
    if (window.analytics) {
      window.analytics.track('Performance Metric', metric);
    }
  }
  
  private getViewport(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}
```

---

This enhanced technical roadmap provides concrete implementation details, code patterns, and architecture decisions for the super card consolidation. The approach balances performance, user experience, and maintainability while providing a clear path forward for implementation.