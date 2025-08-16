'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  BarChart3, 
  PieChart, 
  Activity,
  Zap,
  Target,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  Clock
} from 'lucide-react';
import { usePerformanceHub, usePerformanceActions } from '@/store/superCardStore';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { SPYIntelligenceHub } from './components/SPYIntelligenceHub';
import { HoldingsPerformance } from '@/components/dashboard/HoldingsPerformance';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { SectorAllocationChart } from '@/components/dashboard/SectorAllocationChart';
import { SkeletonSPYComparison } from '@/components/ui/skeletons';
import { superCardsAPI } from '@/lib/api/super-cards-api';
import type { TimeRange } from '@/lib/api/super-cards-api';

interface PerformanceHubProps {
  portfolioReturn?: number;
  spyReturn?: number;
  outperformance?: number;
  isLoading?: boolean;
  timePeriodData?: {
    [key: string]: {
      portfolioReturn: number;
      spyReturn: number;
      outperformance: number;
    };
  };
  className?: string;
}

type TabType = 'spy' | 'overview' | 'holdings' | 'analysis';

interface TabConfig {
  id: TabType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const TABS: TabConfig[] = [
  {
    id: 'spy',
    label: 'SPY Intelligence',
    description: 'Market intelligence',
    icon: Activity,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50'
  },
  {
    id: 'overview',
    label: 'Overview',
    description: 'Portfolio summary',
    icon: Award,
    color: 'text-prosperity-600',
    bgColor: 'bg-prosperity-50'
  },
  {
    id: 'holdings',
    label: 'Holdings',
    description: 'Individual performance',
    icon: BarChart3,
    color: 'text-wealth-600',
    bgColor: 'bg-wealth-50'
  },
  {
    id: 'analysis',
    label: 'Sectors',
    description: 'Sector allocation',
    icon: PieChart,
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-50'
  }
];

const PerformanceHubComponent = ({ 
  portfolioReturn = 0.082,
  spyReturn = 0.061,
  outperformance = 0.021,
  isLoading = false,
  timePeriodData,
  className = ''
}: PerformanceHubProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('spy');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'All'>('1Y');
  const [isVisible, setIsVisible] = useState(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [loadStartTime] = useState(() => performance.now());
  const [isLoaded, setIsLoaded] = useState(false);
  
  const performanceHub = usePerformanceHub();
  const { updateData, setLoading, setError } = usePerformanceActions();
  const { spyComparison, holdings, portfolioValue, timePeriodData: storeTimePeriodData } = performanceHub;

  // Extract hero metric from SPY comparison (use store data first, then props as fallback)
  const heroMetric = spyComparison?.outperformance || outperformance;
  const isBeatingMarket = heroMetric > 0;
  
  // Use store time period data if available, otherwise fall back to props
  const activeTimePeriodData = storeTimePeriodData || timePeriodData;

  // Animated values for hero metric
  const animatedValues = useStaggeredCountingAnimation(
    {
      heroMetric: heroMetric * 100,
      portfolio: (spyComparison?.portfolioReturn || portfolioReturn) * 100,
      spy: (spyComparison?.spyReturn || spyReturn) * 100,
    },
    1200,
    150
  );

  // Fetch Performance Hub data from API
  const fetchPerformanceData = useCallback(async (timeRange: TimeRange = '1Y') => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await superCardsAPI.fetchPerformanceHub(timeRange);
      
      // Update store with fetched data
      updateData({
        portfolioValue: data.portfolioValue,
        spyComparison: data.spyComparison,
        holdings: data.holdings,
        timePeriodData: data.timePeriodData,
        spyOutperformance: data.spyOutperformance || data.spyComparison?.outperformance || 0
      });
      
      // console.log('Performance Hub data fetched successfully:', data);
    // } catch (error) {
      // Error handled by emergency recovery script finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateData]);

  // Fetch data on mount and when time period changes
  useEffect(() => {
    fetchPerformanceData(selectedTimePeriod as TimeRange);
  }, [selectedTimePeriod, fetchPerformanceData]);

  useEffect(() => {
    setIsVisible(true);
    // Measure load time performance
    if (!isLoaded) {
      const loadTime = performance.now() - loadStartTime;
      // console.log(`Performance Hub loaded in ${loadTime.toFixed(2)}ms`);
      // setIsLoaded(true);
      
      // Log performance for monitoring
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('performanceHubLoaded', {
          detail: { loadTime, componentsLoaded: 4 }
        }));
      }
    }
  }, [loadStartTime, isLoaded]);

  // Performance insights engine - "Top 3 performers" analysis
  const performanceInsights = useMemo(() => {
    if (!holdings || holdings.length === 0) return null;

    const sortedHoldings = holdings
      .filter(h => h.ytdPerformance !== undefined)
      .sort((a, b) => (b.ytdPerformance || 0) - (a.ytdPerformance || 0));

    const topPerformers = sortedHoldings.slice(0, 3);
    const underperformers = sortedHoldings.slice(-2);
    
    const avgPerformance = holdings.reduce((sum, h) => sum + (h.ytdPerformance || 0), 0) / holdings.length;
    const volatility = holdings.length > 1 
      ? Math.sqrt(holdings.reduce((sum, h) => sum + Math.pow((h.ytdPerformance || 0) - avgPerformance, 2), 0) / holdings.length)
      : 0;

    const benchmarkReturn = spyComparison?.spyReturn || spyReturn;
    return {
      topPerformers,
      underperformers,
      avgPerformance,
      volatility,
      outperformingCount: holdings.filter(h => (h.ytdPerformance || 0) > benchmarkReturn).length,
      totalHoldings: holdings.length
    };
  }, [holdings, spyReturn, spyComparison?.spyReturn]);

  // Portfolio-focused recommendations (SPY logic moved to SPY Intelligence tab)
  const recommendations = useMemo(() => {
    if (!performanceInsights) return [];

    const recs = [];
    
    if (performanceInsights.volatility > 0.15) {
      recs.push({
        type: 'risk',
        title: 'High Portfolio Volatility',
        description: 'Consider diversifying to reduce risk concentration',
        action: 'Add Diversification',
        priority: 'medium'
      });
    }

    if (performanceInsights.outperformingCount / performanceInsights.totalHoldings < 0.5) {
      recs.push({
        type: 'rebalance',
        title: 'Mixed Performance Signal',
        description: `Only ${Math.round((performanceInsights.outperformingCount / performanceInsights.totalHoldings) * 100)}% of holdings performing well`,
        action: 'Review Allocation',
        priority: 'medium'
      });
    }

    if (performanceInsights.avgPerformance > 0.10) {
      recs.push({
        type: 'celebration',
        title: 'Strong Portfolio Performance',
        description: `Your portfolio shows strong performance with ${performanceInsights.avgPerformance > 0 ? '+' : ''}${(performanceInsights.avgPerformance * 100).toFixed(1)}% average return`,
        action: 'Maintain Strategy',
        priority: 'positive'
      });
    }

    return recs.slice(0, 2); // Limit to top 2 recommendations
  }, [performanceInsights]);

  // Touch gesture handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    
    if (isLeftSwipe && currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
    }
  };

  const currentTabIndex = TABS.findIndex(tab => tab.id === activeTab);

  // Enhanced loading and error states
  if (isLoading || performanceHub.loading) {
    return (
      <motion.div 
        className="premium-card p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-white/10 backdrop-blur rounded-xl"></div>
          <div className="h-8 bg-white/10 backdrop-blur rounded-lg w-1/3"></div>
          <div className="space-y-4">
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-1 h-12 bg-white/10 backdrop-blur rounded-md"></div>
              ))}
            </div>
            <div className="h-96 bg-white/10 backdrop-blur rounded-xl"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (performanceHub.error) {
    return (
      <motion.div 
        className="premium-card p-6 border-alert-200 bg-alert-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center space-y-4">
          <div className="text-alert-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-alert-800">Performance Data Unavailable</h3>
          <p className="text-alert-600 text-sm">{performanceHub.error}</p>
          <button 
            onClick={() => fetchPerformanceData(selectedTimePeriod as TimeRange)} 
            className="px-4 py-2 bg-alert-600 text-white rounded-lg hover:bg-alert-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`premium-card hover-lift animate-on-mount ${className} ${
        isVisible ? 'animate-slide-up' : 'opacity-0'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hero Metric Section - Prominent Display */}
      <div className="text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-primary-50 via-primary-25 to-white rounded-xl sm:rounded-2xl border border-primary-200">
        <div className="flex items-center justify-center mb-3">
          <motion.div 
            className={`p-3 sm:p-4 rounded-xl ${
              isBeatingMarket 
                ? 'bg-gradient-to-br from-prosperity-100 to-prosperity-50' 
                : 'bg-gradient-to-br from-wealth-100 to-wealth-50'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {isBeatingMarket ? (
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-prosperity-600" />
            ) : (
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-wealth-600" />
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className={`currency-display font-bold text-4xl sm:text-5xl lg:text-6xl animate-currency mb-2 ${
            isBeatingMarket 
              ? 'text-gradient-prosperity' 
              : 'text-gradient-wealth'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {animatedValues.heroMetric >= 0 ? '+' : ''}{animatedValues.heroMetric.toFixed(1)}%
        </motion.div>
        
        <motion.div 
          className="text-slate-600 font-medium text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          vs SPY Performance
        </motion.div>
        
        {isBeatingMarket && heroMetric > 0.05 && (
          <motion.div 
            className="mt-3 inline-flex items-center space-x-2 bg-prosperity-50 text-prosperity-700 px-3 py-1 rounded-full text-sm font-medium border border-prosperity-200"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
          >
            <Star className="w-4 h-4" />
            <span>Strong Alpha Generation</span>
          </motion.div>
        )}
      </div>

      {/* Global Time Period Selector */}
      <div className="mb-6 bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Time Period</span>
          </div>
          <div className="text-xs text-slate-500">
            Global setting for all tabs
          </div>
        </div>
        
        <div className="flex bg-white/10 backdrop-blur rounded-lg p-1 gap-1 touch-friendly overflow-x-auto">
          {(['1D', '1W', '1M', '3M', '6M', '1Y', 'All'] as const).map((period) => (
            <button
              key={period}
              type="button"
              className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 touch-friendly focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                selectedTimePeriod === period
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              onClick={() => setSelectedTimePeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation - Mobile-first with swipe indicators */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-display font-semibold text-slate-800">
            Performance Hub
          </h3>
          
          {/* Refresh Button and Mobile swipe indicators */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchPerformanceData(selectedTimePeriod as TimeRange)}
              disabled={performanceHub.loading}
              className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh data"
            >
              <svg className={`w-5 h-5 ${performanceHub.loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Mobile swipe indicators */}
            <div className="flex items-center space-x-2 sm:hidden">
              {currentTabIndex > 0 && (
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              )}
              <span className="text-xs text-slate-500 font-medium">
                {currentTabIndex + 1} / {TABS.length}
              </span>
              {currentTabIndex < TABS.length - 1 && (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </div>
        </div>
        
        {/* Tab Bar */}
        <div 
          className="flex bg-slate-50 rounded-lg sm:rounded-xl p-1 gap-1 relative overflow-hidden"
          role="tablist" 
          aria-label="Performance hub navigation"
        >
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                className={`flex-1 relative px-3 py-3 sm:py-4 text-center transition-all duration-300 rounded-md sm:rounded-lg touch-friendly focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 rounded-md sm:rounded-lg"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <div className="relative flex flex-col items-center space-y-1 sm:space-y-2">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <div className="text-xs sm:text-sm font-semibold">
                    {tab.label}
                  </div>
                  <div className={`text-xs ${
                    isActive ? 'text-primary-100' : 'text-slate-500'
                  } hidden sm:block`}>
                    {tab.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content - Progressive disclosure */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          id={`${activeTab}-panel`}
          role="tabpanel"
          aria-labelledby={`${activeTab}-tab`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="min-h-[400px]"
        >
          {activeTab === 'spy' && (
            <div>
              <SPYIntelligenceHub
                portfolioReturn={spyComparison?.portfolioReturn || portfolioReturn}
                spyReturn={spyComparison?.spyReturn || spyReturn}
                outperformance={spyComparison?.outperformance || outperformance}
                className="min-h-[600px]"
              />
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Portfolio Performance Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-25 rounded-lg border border-primary-100">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {animatedValues.portfolio.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-600">Portfolio Return</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-prosperity-50 to-prosperity-25 rounded-lg border border-prosperity-100">
                  <div className="text-2xl font-bold text-prosperity-600 mb-1">
                    {performanceInsights?.outperformingCount || 0}
                  </div>
                  <div className="text-xs text-slate-600">Strong Holdings</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-wealth-50 to-wealth-25 rounded-lg border border-wealth-100">
                  <div className="text-2xl font-bold text-wealth-600 mb-1">
                    {performanceInsights?.totalHoldings || 0}
                  </div>
                  <div className="text-xs text-slate-600">Total Holdings</div>
                </div>
              </div>

              {/* Performance Insights */}
              {performanceInsights && (
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-primary-600 mr-2" />
                    Performance Insights
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {performanceInsights.topPerformers.slice(0, 2).map((holding, index) => (
                      <div key={holding.id} className="flex items-center justify-between p-3 bg-prosperity-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-prosperity-500 rounded-full"></div>
                          <span className="font-mono font-semibold text-sm">{holding.ticker}</span>
                        </div>
                        <div className="text-prosperity-600 font-semibold text-sm">
                          +{((holding.ytdPerformance || 0) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Recommendations */}
              {recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800 flex items-center">
                    <Target className="w-5 h-5 text-primary-600 mr-2" />
                    Portfolio Recommendations
                  </h4>
                  
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'high' 
                          ? 'bg-alert-50 border-alert-500' 
                          : rec.priority === 'positive'
                          ? 'bg-prosperity-50 border-prosperity-500'
                          : 'bg-primary-50 border-primary-500'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-800 text-sm">{rec.title}</h5>
                          <p className="text-slate-600 text-xs mt-1">{rec.description}</p>
                        </div>
                        <button className="ml-4 text-xs font-medium px-3 py-1 bg-white/50 rounded-full border border-slate-200 hover:border-primary-400 transition-colors flex items-center space-x-1 text-slate-700">
                          <span>{rec.action}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'holdings' && (
            <div>
              <HoldingsPerformance />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div>
              <SectorAllocationChart />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Mobile swipe hint */}
      <div className="mt-6 text-center text-xs text-slate-500 sm:hidden">
        👈 Swipe left or right to switch tabs
      </div>
    </motion.div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const PerformanceHub = memo(PerformanceHubComponent, (prevProps, nextProps) => {
  return (
    prevProps.portfolioReturn === nextProps.portfolioReturn &&
    prevProps.spyReturn === nextProps.spyReturn &&
    prevProps.outperformance === nextProps.outperformance &&
    prevProps.isLoading === nextProps.isLoading
  );
});