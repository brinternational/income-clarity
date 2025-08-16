'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  Shield,
  ChevronLeft,
  ChevronRight,
  Flame,
  Activity
} from 'lucide-react';
import { useIncomeHub, useIncomeActions } from '@/store/superCardStore';
import { IncomeViewToggle, IncomeViewMode } from '@/components/shared/IncomeViewToggle';
import { IncomeClarityCard } from '@/components/dashboard/IncomeClarityCard';
import IncomeProgressionCard from '@/components/income/IncomeProgressionCard';
import IncomeStabilityCard from '@/components/income/IncomeStabilityCard';
import CashFlowProjectionCard from '@/components/income/CashFlowProjectionCard';
import { InteractiveDividendCalendar } from '@/components/income/InteractiveDividendCalendar';
import { IncomeProgressionTracker } from '@/components/income/IncomeProgressionTracker';
import { DividendIntelligenceEngine } from '@/components/income/DividendIntelligenceEngine';
import IncomeWaterfallAnimation from '@/components/dashboard/animations/IncomeWaterfallAnimation';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { IncomeClarityResult } from '@/types';
import { SkeletonIncomeClarityCard } from '@/components/ui/skeletons';
import { superCardsAPI } from '@/lib/api/super-cards-api';

// Remove local definition since we import it now

interface IncomeIntelligenceHubProps {
  clarityData?: IncomeClarityResult;
  isLoading?: boolean;
  className?: string;
  initialViewMode?: IncomeViewMode;
}

type TabType = 'cashflow' | 'progression' | 'stability' | 'projections' | 'calendar' | 'tracker' | 'intelligence';

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
    id: 'cashflow',
    label: 'Clarity',
    description: 'Animated income waterfall',
    icon: DollarSign,
    color: 'text-prosperity-600',
    bgColor: 'bg-prosperity-50'
  },
  {
    id: 'progression',
    label: 'Progression',
    description: 'Income journey & milestones',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'stability',
    label: 'Stability',
    description: 'Risk & reliability analysis',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'projections',
    label: 'Projections',
    description: 'Future cash flow & FIRE',
    icon: Target,
    color: 'text-wealth-600',
    bgColor: 'bg-wealth-50'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    description: 'Dividend payment schedule',
    icon: Calendar,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50'
  },
  {
    id: 'tracker',
    label: 'Tracker',
    description: 'Advanced progression tracking',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'intelligence',
    label: 'AI Engine',
    description: 'Dividend intelligence & optimization',
    icon: Flame,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

const IncomeIntelligenceHubComponent = ({ 
  clarityData,
  isLoading = false,
  className = '',
  initialViewMode = 'monthly'
}: IncomeIntelligenceHubProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('cashflow');
  const [isVisible, setIsVisible] = useState(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const incomeHub = useIncomeHub();
  const { updateData, setLoading, setError } = useIncomeActions();
  const { incomeClarityData, loading: profileLoading, expenseMilestones, monthlyDividendIncome } = incomeHub;
  
  const [incomeViewMode, setIncomeViewMode] = useState<IncomeViewMode>(() => {
    // Load from localStorage with fallback to initialViewMode
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('income-clarity-view-mode');
      if (saved && (saved === 'monthly' || saved === 'annual')) {
        return saved as IncomeViewMode;
      }
    }
    return initialViewMode;
  });

  // Save to localStorage when view mode changes
  const handleViewModeChange = (mode: IncomeViewMode) => {
    setIncomeViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('income-clarity-view-mode', mode);
    }
  };

  // Format income values based on view mode
  // Fetch Income Hub data from API
  const fetchIncomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await superCardsAPI.fetchIncomeHub();
      
      // Update store with fetched data
      updateData({
        monthlyDividendIncome: data.monthlyIncome || data.monthlyDividendIncome,
        incomeClarityData: data.incomeClarityData,
        expenseMilestones: data.expenseMilestones,
        availableToReinvest: data.availableToReinvest
      });
      
      // console.log('Income Hub data fetched successfully:', data);
    // } catch (error) {
      // Error handled by emergency recovery script finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateData]);

  const formatIncomeValue = (monthlyValue: number): { value: number; suffix: string; label: string } => {
    if (incomeViewMode === 'annual') {
      return {
        value: monthlyValue * 12,
        suffix: '/year',
        label: 'Annual'
      };
    }
    return {
      value: monthlyValue,
      suffix: '/month', 
      label: 'Monthly'
    };
  };
  const [aboveZeroStreak, setAboveZeroStreak] = useState({
    current: 6,
    longest: 8,
    totalMonths: 24
  });

  // Use provided data or context data
  const activeData = clarityData || incomeClarityData || {
    grossMonthly: 4500,
    taxOwed: 675,
    netMonthly: 3825,
    monthlyExpenses: 3200,
    availableToReinvest: 625,
    aboveZeroLine: true
  };

  const isAboveZero = activeData.availableToReinvest > 0;

  // Hero metric animation - the most important number
  const animatedValues = useStaggeredCountingAnimation(
    {
      heroMetric: Math.abs(activeData.availableToReinvest),
      netIncome: activeData.netMonthly,
      expenses: activeData.monthlyExpenses,
      taxOwed: activeData.taxOwed,
    },
    1200,
    150
  );

  // Fetch data on mount
  useEffect(() => {
    fetchIncomeData();
  }, [fetchIncomeData]);

  useEffect(() => {
    setIsVisible(true);
    
    // Detect mobile screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Calculate financial stress level
  const calculateStressLevel = () => {
    const availableAmount = activeData.availableToReinvest;
    const monthlyExpenses = activeData.monthlyExpenses;
    
    if (availableAmount >= 0) {
      const safeMonthlyExpenses = Math.max(monthlyExpenses, 1);
      const bufferRatio = availableAmount / safeMonthlyExpenses;
      
      if (bufferRatio >= 0.5) {
        return { score: Math.max(0, 10 - (bufferRatio * 10)), level: 'low' as const, message: 'Excellent financial position!' };
      } else if (bufferRatio >= 0.2) {
        return { score: 10 + (25 - bufferRatio * 50), level: 'low' as const, message: 'Great job building wealth!' };
      } else {
        return { score: 25 + (10 - bufferRatio * 50), level: 'moderate' as const, message: 'You\'re doing well staying above zero!' };
      }
    } else {
      const safeMonthlyExpenses = Math.max(monthlyExpenses, 1);
      const deficitRatio = Math.abs(availableAmount) / safeMonthlyExpenses;
      
      if (deficitRatio <= 0.1) {
        return { score: 50 + (deficitRatio * 150), level: 'moderate' as const, message: 'You\'re close to breaking even!' };
      } else if (deficitRatio <= 0.3) {
        return { score: 65 + (deficitRatio * 67), level: 'high' as const, message: 'Focus on increasing income or reducing expenses.' };
      } else {
        return { score: Math.min(100, 85 + (deficitRatio * 50)), level: 'high' as const, message: 'Consider major budget adjustments.' };
      }
    }
  };

  const stressLevel = calculateStressLevel();


  // Simulate Above Zero Streak data
  useEffect(() => {
    if (activeData.availableToReinvest > 0) {
      setAboveZeroStreak(prev => ({
        ...prev,
        current: Math.max(prev.current, 1)
      }));
    }
  }, [activeData.availableToReinvest]);

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

  if (isLoading || profileLoading) {
    return <SkeletonIncomeClarityCard />;
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
      {/* Hero Metric Section - ABOVE ZERO STREAK TRACKER */}
      <div className={`text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br rounded-xl sm:rounded-2xl border-2 ${
        isAboveZero 
          ? 'from-green-50 to-emerald-50 border-green-200 shadow-green-100/50' 
          : 'from-red-50 to-rose-50 border-red-200 shadow-red-100/50'
      }`}>
        <div className="flex items-center justify-center mb-3">
          <motion.div 
            className={`p-3 sm:p-4 rounded-xl ${
              isAboveZero 
                ? 'bg-gradient-to-br from-green-100 to-green-50' 
                : 'bg-gradient-to-br from-red-100 to-red-50'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {isAboveZero ? (
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className={`currency-display font-bold text-4xl sm:text-5xl lg:text-6xl animate-currency mb-2 ${
            isAboveZero 
              ? 'text-gradient-prosperity' 
              : 'text-gradient-alert'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {isAboveZero ? '+' : '-'}${Math.round(formatIncomeValue(animatedValues.heroMetric).value).toLocaleString()}{formatIncomeValue(animatedValues.heroMetric).suffix}
        </motion.div>
        
        <motion.div 
          className={`font-semibold text-lg sm:text-xl mb-2 ${
            isAboveZero ? 'text-green-700' : 'text-red-700'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isAboveZero ? 'ABOVE ZERO LINE' : 'BELOW ZERO LINE'}
        </motion.div>
        
        <motion.div 
          className={`text-sm ${isAboveZero ? 'text-green-600' : 'text-red-600'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {isAboveZero 
            ? 'You are building wealth every month!' 
            : 'Focus on optimization to reach positive cash flow'
          }
        </motion.div>

        {/* Above Zero Streak Tracker - CRITICAL for user psychology */}
        <div className="mt-6 p-4 bg-gradient-to-r from-white/60 to-prosperity-50/60 rounded-lg border border-white/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-prosperity-600" />
              <span className="font-semibold text-slate-700">Above Zero Streak</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-prosperity-600">{aboveZeroStreak.current}</div>
              <div className="text-xs text-slate-500">months</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-primary-600">{aboveZeroStreak.current}</div>
              <div className="text-xs text-slate-600">Current</div>
            </div>
            <div>
              <div className="text-lg font-bold text-wealth-600">{aboveZeroStreak.longest}</div>
              <div className="text-xs text-slate-600">Record</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{Math.round((aboveZeroStreak.totalMonths / 24) * 100)}%</div>
              <div className="text-xs text-slate-600">Success Rate</div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Monthly/Annual Toggle */}
        <IncomeViewToggle
          viewMode={incomeViewMode}
          onViewModeChange={handleViewModeChange}
          size="md"
          className="mt-6"
        />
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-display font-semibold text-slate-800">
            Income Intelligence Hub
          </h3>
          
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
        
        {/* Tab Bar */}
        <div 
          className="flex bg-slate-50 rounded-lg sm:rounded-xl p-1 gap-1 relative overflow-hidden"
          role="tablist" 
          aria-label="Income intelligence navigation"
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
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 rounded-md sm:rounded-lg"
                    layoutId="activeIncomeTab"
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
          {activeTab === 'cashflow' && (
            <div className="space-y-6">
              {/* Waterfall Animation */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">
                    Income Flow Visualization
                  </h4>
                  <p className="text-sm text-slate-600">
                    Watch your income flow from gross dividends to available reinvestment
                  </p>
                </div>
                <IncomeWaterfallAnimation 
                  data={activeData}
                  isVisible={activeTab === 'cashflow'}
                  showMobileVersion={isMobile}
                  viewMode={incomeViewMode}
                />
              </div>
              
              {/* Traditional Card for Comparison */}
              <div className="-mx-4 -my-2">
                <IncomeClarityCard 
                  clarityData={activeData}
                  isLoading={profileLoading}
                  viewMode={incomeViewMode}
                />
              </div>
            </div>
          )}

          {activeTab === 'progression' && (
            <div className="-mx-4 -my-2">
              <IncomeProgressionCard viewMode={incomeViewMode} />
            </div>
          )}

          {activeTab === 'stability' && (
            <div className="-mx-4 -my-2">
              <IncomeStabilityCard />
            </div>
          )}

          {activeTab === 'projections' && (
            <div className="-mx-4 -my-2">
              <CashFlowProjectionCard viewMode={incomeViewMode} />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="-mx-4 -my-2 -mb-6">
              <InteractiveDividendCalendar viewMode={incomeViewMode} />
            </div>
          )}

          {activeTab === 'tracker' && (
            <div className="-mx-4 -my-2">
              <IncomeProgressionTracker />
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div className="-mx-4 -my-2">
              <DividendIntelligenceEngine />
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
export const IncomeIntelligenceHub = memo(IncomeIntelligenceHubComponent, (prevProps, nextProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.clarityData?.availableToReinvest === nextProps.clarityData?.availableToReinvest &&
    prevProps.clarityData?.netMonthly === nextProps.clarityData?.netMonthly &&
    prevProps.clarityData?.monthlyExpenses === nextProps.clarityData?.monthlyExpenses
  );
});