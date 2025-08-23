'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign,
  Calculator,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  TrendingDown,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { useTaxHub, useTaxActions } from '@/store/superCardStore';
import { superCardsAPI } from '@/lib/api/super-cards-api';
import { TaxIntelligenceEngineCard } from '@/components/strategy/TaxIntelligenceEngineCard';
import { TaxSavingsCalculatorCard } from '@/components/strategy/TaxSavingsCalculatorCard';
import { TaxPlanning } from '@/components/dashboard/TaxPlanning';
import { TaxSettingsCard } from '@/components/strategy/TaxSettingsCard';
import { StateComparisonVisualization } from '@/components/tax/StateComparisonVisualization';
import { TaxEfficiencyScore } from '@/components/dashboard/tax/TaxEfficiencyScore';
import { TaxEfficiencyDashboard, IncomeWaterfall } from '@/components/charts';
import { StrategyComparisonEngine } from '@/components/tax/StrategyComparisonEngine';
import { FourStrategyAnalysis } from '@/components/tax/FourStrategyAnalysis';
import { LocationBasedWinner } from '@/components/tax/LocationBasedWinner';
import { MultiStateTaxComparison } from '@/components/tax/MultiStateTaxComparison';
import { ROCTracker } from '@/components/tax/ROCTracker';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { logger } from '@/lib/logger';
import { DataSourceBadge, FreshnessIndicator, useSyncStatus } from '@/components/sync';
import { useFeatureAccess } from '@/components/premium';
import { useUser } from '@/hooks/useUser';

interface TaxStrategyHubProps {
  data?: any; // For unified view compatibility
  isCompact?: boolean; // For unified view layout
  taxData?: {
    currentTaxBill: number;
    optimizedTaxBill: number;
    potentialSavings: number;
    location: string;
  };
  isLoading?: boolean;
  className?: string;
}

type TabType = 'intelligence' | 'comparison' | 'location' | 'multistate' | 'roc' | 'planning' | 'settings';

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
    id: 'intelligence',
    label: 'Tax Dashboard',
    description: 'Enhanced tax efficiency analysis',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'comparison',
    label: '4-Strategy',
    description: 'Compare 4 strategies',
    icon: TrendingDown,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'location',
    label: 'Location',
    description: 'Location-based winners',
    icon: MapPin,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'multistate',
    label: 'All States',
    description: '50 states + territories',
    icon: Calculator,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'roc',
    label: 'ROC Tracker',
    description: '19a ROC tracking',
    icon: AlertTriangle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    id: 'planning',
    label: 'Planning',
    description: 'Tax strategy planning',
    icon: Target,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50'
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Location & preferences',
    icon: Settings,
    color: 'text-muted-foreground',
    bgColor: 'bg-slate-50'
  }
];

const TaxStrategyHubComponent = ({ 
  data,
  isCompact = false,
  taxData,
  isLoading = false,
  className = ''
}: TaxStrategyHubProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('comparison');
  const [isVisible, setIsVisible] = useState(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [loadStartTime] = useState(() => performance.now());
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { user } = useUser();
  const { isPremium } = useFeatureAccess();
  const { lastSyncTime } = useSyncStatus(user?.id || '');
  
  const taxHub = useTaxHub();
  const { updateData, setLoading, setError } = useTaxActions();
  
  // When data prop is provided, use it directly; otherwise use store data
  const displayData = data || taxHub;
  
  // CRITICAL FIX: Use displayData consistently instead of individual store values
  const { taxSettings, taxProjections, loading: hubLoading } = displayData;
  
  // Add extensive logging to verify data flow
  console.log('🔍 TaxHub displayData:', displayData);
  console.log('🔍 taxSettings from displayData:', taxSettings);
  console.log('🔍 taxProjections from displayData:', taxProjections);

  // Fetch Tax Hub data from API
  const fetchTaxData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await superCardsAPI.fetchTaxStrategyHub();
      
      // Update store with fetched data
      updateData({
        currentTaxBill: data.currentTaxBill,
        estimatedQuarterly: data.estimatedQuarterly,
        taxOptimizationSavings: data.taxOptimizationSavings,
        taxDragAnalysis: data.taxDragAnalysis,
        withholdingTaxes: data.withholdingTaxes
      });
      
      // logger.log('Tax Hub data fetched successfully:', data);
    } catch (error) {
      // Error handled by emergency recovery script
      setError('Failed to fetch tax data');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateData]);

  // Fetch data on mount
  // Only fetch if no external data provided
  useEffect(() => {
    if (!data) {
      fetchTaxData();
    }
  }, [data]); // Remove fetchTaxData from deps and include data

  // If data prop is provided (from unified view), use it to override defaults
  const effectiveTaxData = data?.taxData ?? taxData ?? displayData.taxProjections;
  
  // Default tax data - Puerto Rico advantage
  const activeData = effectiveTaxData || {
    currentTaxBill: 8750, // 15% federal + CA state on $50k dividend income
    optimizedTaxBill: 3750, // 15% federal only (PR = 0% on qualified dividends)
    potentialSavings: 5000,
    location: 'California'
  };

  const savingsPercentage = activeData.currentTaxBill > 0 
    ? (activeData.potentialSavings / activeData.currentTaxBill) * 100 
    : 0;

  // Hero metric animation - tax savings potential
  const animatedValues = useStaggeredCountingAnimation(
    {
      heroMetric: activeData.potentialSavings,
      currentBill: activeData.currentTaxBill,
      optimizedBill: activeData.optimizedTaxBill,
      savingsPercent: savingsPercentage,
    },
    1200,
    150
  );

  useEffect(() => {
    setIsVisible(true);
    if (!isLoaded) {
      const loadTime = performance.now() - loadStartTime;
      // logger.log(`Tax Strategy Hub loaded in ${loadTime.toFixed(2)}ms`);
      // setIsLoaded(true);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('taxStrategyHubLoaded', {
          detail: { loadTime, componentsLoaded: 4 }
        }));
      }
    }
  }, [loadStartTime, isLoaded]);

  // Location-based tax insights
  const locationInsights = useMemo(() => {
    const location = activeData.location.toLowerCase();
    
    if (location.includes('puerto rico')) {
      return {
        advantage: 'Maximum Tax Advantage',
        description: '0% tax on qualified dividends',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '🏝️',
        savings: 'Up to 37.3% total savings vs high-tax states'
      };
    }
    
    if (location.includes('california')) {
      return {
        advantage: 'High Tax Burden',
        description: 'Up to 37.3% on dividends',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '💸',
        savings: 'Moving to PR could save $' + Math.round(activeData.potentialSavings).toLocaleString()
      };
    }
    
    if (location.includes('texas') || location.includes('florida') || location.includes('nevada')) {
      return {
        advantage: 'No State Tax',
        description: 'Only federal taxes apply',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '🏠',
        savings: 'PR could save additional 15% federal'
      };
    }
    
    return {
      advantage: 'Tax Optimization Available',
      description: 'Explore relocation benefits',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      icon: '📍',
      savings: 'Potential savings with optimization'
    };
  }, [activeData.location, activeData.potentialSavings]);

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
      {/* Hero Metric Section - Tax Savings Potential */}
      <div className="text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-green-50 via-green-25 to-white rounded-xl sm:rounded-2xl border border-green-200">
        <div className="flex items-center justify-center mb-3">
          <motion.div 
            className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-100 to-green-50"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </motion.div>
        </div>
        
        <motion.div 
          className="currency-display font-bold text-4xl sm:text-5xl lg:text-6xl animate-currency mb-2 text-gradient-prosperity"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          ${Math.round(animatedValues.heroMetric).toLocaleString()}
        </motion.div>
        
        <motion.div 
          className="text-muted-foreground font-medium text-sm sm:text-base mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Potential Annual Tax Savings
        </motion.div>

        <motion.div 
          className="text-green-600 font-semibold text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {animatedValues.savingsPercent.toFixed(1)}% Reduction
        </motion.div>

        {/* Location Advantage Alert */}
        <motion.div 
          className={`mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${locationInsights.bgColor} ${locationInsights.color} border-opacity-30`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <span className="text-lg">{locationInsights.icon}</span>
          <div className="text-left">
            <div className="font-semibold">{locationInsights.advantage}</div>
            <div className="text-xs opacity-80">{locationInsights.savings}</div>
          </div>
        </motion.div>

        {/* Moving Saves Alert - CRITICAL for Puerto Rico advantage */}
        {!activeData.location.toLowerCase().includes('puerto rico') && activeData.potentialSavings > 3000 && (
          <motion.div 
            className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-blue-800">Moving to Puerto Rico saves ${Math.round(activeData.potentialSavings).toLocaleString()}/year</div>
                <div className="text-xs text-blue-600">0% tax on qualified dividends + federal benefits</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tax Breakdown Quick View */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-25 rounded-lg border border-red-100">
          <div className="text-2xl font-bold text-red-600 mb-1">
            ${Math.round(animatedValues.currentBill).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Current Tax Bill</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-25 rounded-lg border border-green-100">
          <div className="text-2xl font-bold text-green-600 mb-1">
            ${Math.round(animatedValues.optimizedBill).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Optimized Bill</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground">
              Tax Strategy Hub
            </h3>
            
            {/* Data Accuracy Indicators */}
            <div className="hidden sm:flex items-center gap-2">
              <DataSourceBadge 
                source={isPremium ? "MERGED" : "MANUAL"} 
                size="sm" 
              />
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-2 h-2 rounded-full ${isPremium ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-gray-600">
                  {isPremium ? 'High Accuracy' : 'Estimated'}
                </span>
              </div>
              <FreshnessIndicator 
                lastSync={lastSyncTime}
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
          
          {/* Data Quality Info and Mobile Indicators */}
          <div className="flex items-center space-x-4">
            {/* Data Quality Notice */}
            {!isPremium && (
              <div className="hidden sm:flex items-center gap-2 text-xs bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1">
                <AlertTriangle className="w-3 h-3 text-yellow-600" />
                <span className="text-yellow-800">Manual data - upgrade for accuracy</span>
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
          aria-label="Tax strategy navigation"
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
                    layoutId="activeTaxTab"
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
          {activeTab === 'intelligence' && (
            <div className="space-y-6">
              {/* Enhanced Tax Efficiency Dashboard */}
              <TaxEfficiencyDashboard 
                userLocation={taxHub.taxSettings?.state || 'CA'}
                portfolioValue={100000}
                className="border-0 bg-transparent shadow-none p-0"
              />
              
              {/* Tax Impact Waterfall */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">Tax Impact Analysis</h4>
                <IncomeWaterfall 
                  timeframe="monthly"
                  location="Current Location"
                  className="border-0 bg-transparent shadow-none p-0"
                />
              </div>
              
              {/* Legacy components for comparison */}
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Legacy Tax Analysis</h4>
                <div className="-mx-4 -my-2">
                  <TaxEfficiencyScore />
                </div>
                <div className="-mx-4 -my-2">
                  <TaxIntelligenceEngineCard />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="-mx-4 -my-2">
              <FourStrategyAnalysis 
                portfolioValue={1000000}
                currentLocation={activeData.location}
              />
            </div>
          )}

          {activeTab === 'location' && (
            <div className="-mx-4 -my-2">
              <LocationBasedWinner 
                portfolioValue={1000000}
              />
            </div>
          )}

          {activeTab === 'multistate' && (
            <div className="-mx-4 -my-2">
              <MultiStateTaxComparison 
                portfolioValue={1000000}
                selectedStrategy="dividend"
              />
            </div>
          )}

          {activeTab === 'roc' && (
            <div className="-mx-4 -my-2">
              <ROCTracker />
            </div>
          )}

          {activeTab === 'planning' && (
            <div className="-mx-4 -my-2">
              <TaxPlanning />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="-mx-4 -my-2">
              <TaxSettingsCard />
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
export const TaxStrategyHub = memo(TaxStrategyHubComponent, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.isCompact === nextProps.isCompact &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.taxData?.potentialSavings === nextProps.taxData?.potentialSavings &&
    prevProps.taxData?.currentTaxBill === nextProps.taxData?.currentTaxBill &&
    prevProps.taxData?.location === nextProps.taxData?.location
  );
});