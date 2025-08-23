'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity,
  BarChart3,
  TrendingUp,
  Zap,
  ChevronLeft,
  ChevronRight,
  Shield,
  Target,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingDown
} from 'lucide-react';
import { usePortfolioHub, usePortfolioActions } from '@/store/superCardStore';
import { StrategyHealthCard } from '@/components/strategy/StrategyHealthCard';
import { RebalancingSuggestions } from '@/components/dashboard/RebalancingSuggestions';
import { StrategyComparisonEngine } from '@/components/strategy/StrategyComparisonEngine';
import { MarginIntelligence } from '@/components/dashboard/MarginIntelligence';
import { PeerBenchmarkingView } from '@/components/strategy/PeerBenchmarkingView';
import { BacktestingEngine } from '@/components/strategy/BacktestingEngine';
import { PortfolioComposition, YieldOnCostAnalysis } from '@/components/charts';
import { SectorAllocationChart } from '@/components/dashboard/SectorAllocationChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { superCardsAPI } from '@/lib/api/super-cards-api';
import { logger } from '@/lib/logger';
import { DataSourceBadgeGroup, SyncStatusIndicator, FreshnessIndicator, useSyncStatus } from '@/components/sync';
import { FeatureGate, useFeatureAccess } from '@/components/premium';
import { useUser } from '@/hooks/useUser';

interface PortfolioStrategyHubProps {
  data?: any; // For unified view compatibility
  isCompact?: boolean; // For unified view layout
  strategyData?: {
    healthScore: number;
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    diversificationScore: number;
    rebalanceNeeded: boolean;
    totalValue: number;
  };
  isLoading?: boolean;
  className?: string;
}

type TabType = 'health' | 'rebalancing' | 'comparison' | 'margin' | 'benchmarking' | 'backtesting';

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
    id: 'health',
    label: 'Composition',
    description: 'Portfolio composition chart',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'rebalancing',
    label: 'Rebalancing',
    description: 'Optimization suggestions',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'comparison',
    label: 'Comparison',
    description: 'Strategy comparison',
    icon: TrendingUp,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50'
  },
  {
    id: 'benchmarking',
    label: 'Peer Ranking',
    description: 'Compare with peers',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'backtesting',
    label: 'Backtesting',
    description: 'Historical analysis',
    icon: TrendingDown,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    id: 'margin',
    label: 'Margin',
    description: 'Leverage intelligence',
    icon: Zap,
    color: 'text-wealth-600',
    bgColor: 'bg-wealth-50'
  }
];

const PortfolioStrategyHubComponent = ({ 
  data,
  isCompact = false,
  strategyData,
  isLoading = false,
  className = ''
}: PortfolioStrategyHubProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('health');
  const [isVisible, setIsVisible] = useState(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [loadStartTime] = useState(() => performance.now());
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { user } = useUser();
  const { isPremium, hasFeature } = useFeatureAccess();
  const { lastSyncTime, triggerSync } = useSyncStatus(user?.id || '');
  
  const portfolioHub = usePortfolioHub();
  const { updateData, setLoading, setError } = usePortfolioActions();
  
  // When data prop is provided, use it directly; otherwise use store data
  const displayData = data || portfolioHub;
  
  // CRITICAL FIX: Use displayData consistently instead of individual store values
  const { portfolioHealth, strategyComparison, loading: hubLoading } = displayData;
  
  // Add extensive logging to verify data flow
  console.log('🔍 PortfolioHub displayData:', displayData);
  console.log('🔍 portfolioHealth from displayData:', portfolioHealth);
  console.log('🔍 strategyComparison from displayData:', strategyComparison);

  // SIMPLIFIED: Use displayData.portfolioHealth directly since displayData handles data prop fallback
  const effectiveStrategyData = displayData.portfolioHealth ?? strategyData;
  
  // Default strategy data with strong portfolio health
  const activeData = effectiveStrategyData || {
    healthScore: 85,
    riskLevel: 'moderate' as const,
    diversificationScore: 78,
    rebalanceNeeded: false,
    totalValue: 125000
  };

  // Hero metric animation - portfolio health score
  const animatedValues = useStaggeredCountingAnimation(
    {
      heroMetric: activeData.healthScore,
      diversification: activeData.diversificationScore,
      portfolioValue: activeData.totalValue,
      riskScore: activeData.riskLevel === 'conservative' ? 30 : activeData.riskLevel === 'moderate' ? 60 : 90,
    },
    1200,
    150
  );

  // Fetch Portfolio Hub data from API
  const fetchPortfolioData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await superCardsAPI.fetchPortfolioStrategyHub();
      
      // Update store with fetched data
      updateData({
        strategyHealth: data.strategyHealth,
        rebalancingSuggestions: data.rebalancingSuggestions,
        marginIntelligence: data.marginIntelligence,
        portfolioMetrics: data.portfolioMetrics,
        riskAnalysis: data.riskAnalysis
      });
      
      // logger.log('Portfolio Hub data fetched successfully:', data);
    } catch (error) {
      // Error handled by emergency recovery script
      setError('Failed to fetch portfolio data');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateData]);

  // Fetch data on mount
  // Only fetch if no external data provided
  useEffect(() => {
    if (!data) {
      fetchPortfolioData();
    }
  }, [data]); // Remove fetchPortfolioData from deps and include data

  useEffect(() => {
    setIsVisible(true);
    if (!isLoaded) {
      const loadTime = performance.now() - loadStartTime;
      // logger.log(`Portfolio Strategy Hub loaded in ${loadTime.toFixed(2)}ms`);
      // setIsLoaded(true);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('portfolioStrategyHubLoaded', {
          detail: { loadTime, componentsLoaded: 4 }
        }));
      }
    }
  }, [loadStartTime, isLoaded]);

  // Health score insights
  const healthInsights = useMemo(() => {
    const score = activeData.healthScore;
    
    if (score >= 85) {
      return {
        grade: 'A',
        status: 'Excellent',
        message: 'Portfolio is well-optimized',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        action: 'Maintain current strategy'
      };
    }
    
    if (score >= 75) {
      return {
        grade: 'B',
        status: 'Good',
        message: 'Minor optimization opportunities',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: Target,
        action: 'Consider small adjustments'
      };
    }
    
    if (score >= 65) {
      return {
        grade: 'C',
        status: 'Fair',
        message: 'Rebalancing recommended',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: AlertCircle,
        action: 'Review asset allocation'
      };
    }
    
    return {
      grade: 'D',
      status: 'Needs Improvement',
      message: 'Significant optimization needed',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: AlertCircle,
      action: 'Major rebalancing required'
    };
  }, [activeData.healthScore]);

  // Risk level display
  const riskLevelInfo = useMemo(() => {
    const risk = activeData.riskLevel;
    
    switch (risk) {
      case 'conservative':
        return { label: 'Conservative', color: 'text-green-600', bgColor: 'bg-green-50', icon: '🛡️' };
      case 'moderate':
        return { label: 'Moderate', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '⚖️' };
      case 'aggressive':
        return { label: 'Aggressive', color: 'text-red-600', bgColor: 'bg-red-50', icon: '🚀' };
      default:
        return { label: 'Unknown', color: 'text-muted-foreground', bgColor: 'bg-slate-50', icon: '❓' };
    }
  }, [activeData.riskLevel]);

  // Touch gesture handlers
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

  if (isLoading || (displayData.loading && !data)) {
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
      {/* Hero Metric Section - Portfolio Health Score */}
      <div className={`text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br rounded-xl sm:rounded-2xl border-2 ${healthInsights.bgColor} ${healthInsights.color.replace('text-', 'border-').replace('-600', '-200')}`}>
        <div className="flex items-center justify-center mb-3">
          <motion.div 
            className={`p-3 sm:p-4 rounded-xl ${healthInsights.bgColor}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <healthInsights.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${healthInsights.color}`} />
          </motion.div>
        </div>
        
        <motion.div 
          className={`font-bold text-4xl sm:text-5xl lg:text-6xl mb-2 ${healthInsights.color}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {Math.round(animatedValues.heroMetric)}
          <span className="text-2xl sm:text-3xl lg:text-4xl ml-1">/100</span>
        </motion.div>
        
        <motion.div 
          className="text-muted-foreground font-medium text-sm sm:text-base mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Portfolio Health Score
        </motion.div>

        <motion.div 
          className={`font-semibold text-lg ${healthInsights.color}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Grade {healthInsights.grade} - {healthInsights.status}
        </motion.div>

        {/* Risk Level & Diversification */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <motion.div 
            className={`p-3 rounded-lg ${riskLevelInfo.bgColor}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">{riskLevelInfo.icon}</span>
              <div>
                <div className={`font-semibold text-sm ${riskLevelInfo.color}`}>{riskLevelInfo.label}</div>
                <div className="text-xs text-muted-foreground">Risk Profile</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="p-3 rounded-lg bg-primary-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-primary-600">{Math.round(animatedValues.diversification)}%</div>
              <div className="text-xs text-muted-foreground">Diversification</div>
            </div>
          </motion.div>
        </div>

        {/* Rebalance Alert */}
        {activeData.rebalanceNeeded && (
          <motion.div 
            className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="text-left">
                <div className="font-semibold text-yellow-800">Rebalancing Suggested</div>
                <div className="text-xs text-yellow-600">{healthInsights.action}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Portfolio Metrics */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-prosperity-50 to-prosperity-25 rounded-lg border border-prosperity-100">
          <div className="text-lg font-bold text-prosperity-600 mb-1">
            ${Math.round(animatedValues.portfolioValue / 1000)}K
          </div>
          <div className="text-xs text-muted-foreground">Total Value</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-25 rounded-lg border border-blue-100">
          <div className="text-lg font-bold text-blue-600 mb-1">
            {Math.round(animatedValues.riskScore)}
          </div>
          <div className="text-xs text-muted-foreground">Risk Score</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-25 rounded-lg border border-green-100">
          <div className="text-lg font-bold text-green-600 mb-1">
            {activeData.rebalanceNeeded ? 'Action' : 'Good'}
          </div>
          <div className="text-xs text-muted-foreground">Status</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground">
              Portfolio Strategy Hub
            </h3>
            
            {/* Holdings Data Source Indicators */}
            <div className="hidden sm:flex items-center gap-2">
              <DataSourceBadgeGroup
                sources={[
                  { source: 'MANUAL', count: 12 },
                  ...(isPremium ? [{ source: 'YODLEE' as const, lastSync: lastSyncTime, count: 8 }] : [])
                ]}
                size="sm"
              />
              <FreshnessIndicator 
                lastSync={lastSyncTime}
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
          
          {/* Sync Status and Controls */}
          <div className="flex items-center space-x-4">
            {/* Reconciliation Status for Premium Users */}
            {isPremium && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Reconciled</span>
                </div>
                <SyncStatusIndicator
                  userId={user?.id || ''}
                  lastSyncTime={lastSyncTime}
                  onRefresh={triggerSync}
                  size="sm"
                  showLabel={false}
                />
              </div>
            )}
            
            {/* Mobile swipe indicators */}
            <div className="flex items-center space-x-2 sm:hidden">
              {currentTabIndex > 0 && (
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground font-medium">
                {currentTabIndex + 1} / {TABS.length}
              </span>
              {currentTabIndex < TABS.length - 1 && (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        
        {/* Tab Bar */}
        <div 
          className="flex bg-slate-50 rounded-lg sm:rounded-xl p-1 gap-1 relative overflow-hidden"
          role="tablist" 
          aria-label="Portfolio strategy navigation"
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
                className={`flex-1 relative px-3 py-3 sm:py-4 text-center transition-all duration-300 rounded-md sm:rounded-lg touch-friendly focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 rounded-md sm:rounded-lg"
                    layoutId="activeStrategyTab"
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
                    isActive ? 'text-primary-100' : 'text-muted-foreground'
                  } hidden sm:block`}>
                    {tab.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          id={`${activeTab}-panel`}
          role="tabpanel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="min-h-[400px]"
        >
          {activeTab === 'health' && (
            <div className="space-y-6">
              <PortfolioComposition 
                data={portfolioHub.holdings || []}
                showSectorBreakdown={true}
                className="border-0 bg-transparent shadow-none p-0"
              />
              
              {/* Asset Allocation Chart - Portfolio distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Asset Allocation Overview
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Visual breakdown of your portfolio allocation with diversification insights
                  </p>
                </div>
                <AllocationChart />
              </div>
              
              {/* Sector Allocation Chart - Interactive sector breakdown */}
              <div className="-mx-4 -my-2">
                <SectorAllocationChart />
              </div>
              
              {/* Legacy Strategy Health for comparison */}
              <div className="-mx-4 -my-2">
                <StrategyHealthCard />
              </div>
            </div>
          )}

          {activeTab === 'rebalancing' && (
            <div className="space-y-6">
              <YieldOnCostAnalysis 
                holdings={portfolioHub.holdings || []}
                showRebalanceRecommendations={true}
                className="border-0 bg-transparent shadow-none p-0"
              />
              
              {/* Legacy Rebalancing Suggestions */}
              <div className="-mx-4 -my-2">
                <RebalancingSuggestions />
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="-mx-4 -my-2">
              <StrategyComparisonEngine />
            </div>
          )}

          {activeTab === 'benchmarking' && (
            <div className="-mx-4 -my-2">
              <PeerBenchmarkingView 
                portfolioValue={activeData.totalValue}
                location="Puerto Rico"
                strategy="dividend_focused"
              />
            </div>
          )}

          {activeTab === 'backtesting' && (
            <div className="-mx-4 -my-2">
              <BacktestingEngine />
            </div>
          )}

          {activeTab === 'margin' && (
            <div className="-mx-4 -my-2">
              <MarginIntelligence />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Mobile swipe hint */}
      <div className="mt-6 text-center text-xs text-muted-foreground sm:hidden">
        👈 Swipe left or right to switch tabs
      </div>
    </motion.div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const PortfolioStrategyHub = memo(PortfolioStrategyHubComponent, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.isCompact === nextProps.isCompact &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.strategyData?.healthScore === nextProps.strategyData?.healthScore &&
    prevProps.strategyData?.rebalanceNeeded === nextProps.strategyData?.rebalanceNeeded &&
    prevProps.strategyData?.totalValue === nextProps.strategyData?.totalValue
  );
});