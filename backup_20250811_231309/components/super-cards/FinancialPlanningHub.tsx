'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target,
  TrendingUp,
  Flame,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Calendar,
  DollarSign,
  Zap,
  Calculator,
  Activity,
  Award
} from 'lucide-react';
import { usePlanningHub, usePlanningActions, useExpenseMilestones, useIncomeHub } from '@/store/superCardStore';
import { FIREProgressCard } from '@/components/income/FIREProgressCard';
import { ExpenseMilestones } from '@/components/dashboard/ExpenseMilestones';
import { AboveZeroTracker } from '@/components/planning/AboveZeroTracker';
import { GoalPlanningInterface } from '@/components/planning/GoalPlanningInterface';
import { CoastFICalculator } from '@/components/planning/CoastFICalculator';
import { MilestoneCelebrations } from '@/components/planning/MilestoneCelebrations';
import { WhatIfScenarios } from '@/components/planning/WhatIfScenarios';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { superCardsAPI } from '@/lib/api/super-cards-api';

interface FinancialPlanningHubProps {
  planningData?: {
    fireProgress: number;
    yearsToFire: number;
    currentSavingsRate: number;
    aboveZeroStreak: number;
    monthlyInvestment: number;
    netWorth: number;
  };
  isLoading?: boolean;
  className?: string;
}

type TabType = 'fire' | 'milestones' | 'abovezero' | 'goals' | 'coastfi' | 'scenarios' | 'achievements';

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
    id: 'fire',
    label: 'FIRE',
    description: 'Financial independence',
    icon: Target,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50'
  },
  {
    id: 'milestones',
    label: 'Milestones',
    description: 'Expense milestones',
    icon: Trophy,
    color: 'text-prosperity-600',
    bgColor: 'bg-prosperity-50'
  },
  {
    id: 'abovezero',
    label: 'Above Zero',
    description: 'Wealth building streak',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'goals',
    label: 'Goals',
    description: 'SMART goal setting',
    icon: Settings,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50'
  },
  {
    id: 'coastfi',
    label: 'Coast FI',
    description: 'Coast FI calculator',
    icon: Calculator,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'scenarios',
    label: 'What-If',
    description: 'Scenario modeling',
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    description: 'Milestone celebrations',
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

const FinancialPlanningHubComponent = ({ 
  planningData,
  isLoading = false,
  className = ''
}: FinancialPlanningHubProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('fire');
  const [isVisible, setIsVisible] = useState(false);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [loadStartTime] = useState(() => performance.now());
  const [isLoaded, setIsLoaded] = useState(false);
  
  const planningHub = usePlanningHub();
  const { updateData, setLoading, setError } = usePlanningActions();
  const { fireData, expenseMilestones, aboveZeroData, loading: hubLoading } = planningHub;
  
  // Get expense milestones from income hub (correct data structure for ExpenseMilestones component)
  const incomeExpenseMilestones = useExpenseMilestones();
  const { totalExpenseCoverage } = useIncomeHub();

  // Default planning data - optimistic FIRE journey
  const activeData = planningData || fireData || {
    fireProgress: 23.5, // 23.5% to FIRE
    yearsToFire: 12.3,
    currentSavingsRate: 35,
    aboveZeroStreak: 6,
    monthlyInvestment: 2450,
    netWorth: 145000
  };

  // Hero metric animation - FIRE progress percentage
  const animatedValues = useStaggeredCountingAnimation(
    {
      heroMetric: activeData.fireProgress,
      yearsToFire: activeData.yearsToFire,
      savingsRate: activeData.currentSavingsRate,
      monthlyInvestment: activeData.monthlyInvestment,
      netWorth: activeData.netWorth / 1000, // Show in K
      aboveZeroStreak: activeData.aboveZeroStreak
    },
    1200,
    150
  );

  // Fetch Planning Hub data from API
  const fetchPlanningData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await superCardsAPI.fetchPlanningHub();
      
      // Update store with fetched data
      updateData({
        fireProgress: data.fireProgress,
        expenseMilestones: data.expenseMilestones,
        goalPlanning: data.goalPlanning,
        coastFI: data.coastFI,
        projections: data.projections
      });
      
      // console.log('Planning Hub data fetched successfully:', data);
    // } catch (error) {
      // Error handled by emergency recovery script finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateData]);

  // Fetch data on mount
  useEffect(() => {
    fetchPlanningData();
  }, [fetchPlanningData]);

  useEffect(() => {
    setIsVisible(true);
    if (!isLoaded) {
      const loadTime = performance.now() - loadStartTime;
      // console.log(`Financial Planning Hub loaded in ${loadTime.toFixed(2)}ms`);
      // setIsLoaded(true);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('financialPlanningHubLoaded', {
          detail: { loadTime, componentsLoaded: 7 }
        }));
      }
    }
  }, [loadStartTime, isLoaded]);

  // FIRE stage insights
  const fireStageInsights = useMemo(() => {
    const progress = activeData.fireProgress;
    const years = activeData.yearsToFire;
    
    if (progress >= 100) {
      return {
        stage: 'FIRE Achieved!',
        emoji: '🏆',
        message: 'Congratulations! You have achieved financial independence!',
        color: 'text-gold-600',
        bgColor: 'bg-gold-50',
        motivation: 'You are financially free!'
      };
    }
    
    if (progress >= 75) {
      return {
        stage: 'Final Sprint',
        emoji: '🚀',
        message: `Just ${years.toFixed(1)} years to complete financial independence!`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        motivation: 'The finish line is in sight!'
      };
    }
    
    if (progress >= 50) {
      return {
        stage: 'Accelerating',
        emoji: '⚡',
        message: `Over halfway there! ${years.toFixed(1)} years remaining.`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        motivation: 'Momentum is building!'
      };
    }
    
    if (progress >= 25) {
      return {
        stage: 'Building Momentum',
        emoji: '📈',
        message: `Quarter way to FIRE! ${years.toFixed(1)} years to go.`,
        color: 'text-primary-600',
        bgColor: 'bg-primary-50',
        motivation: 'Great progress, keep it up!'
      };
    }
    
    if (progress >= 10) {
      return {
        stage: 'Getting Started',
        emoji: '🌱',
        message: `Strong start! ${years.toFixed(1)} years estimated to FIRE.`,
        color: 'text-prosperity-600',
        bgColor: 'bg-prosperity-50',
        motivation: 'Every journey begins with a single step!'
      };
    }
    
    return {
      stage: 'Beginning Journey',
      emoji: '🎯',
      message: `Your FIRE journey starts now! ${years.toFixed(1)} years to freedom.`,
      color: 'text-wealth-600',
      bgColor: 'bg-wealth-50',
      motivation: 'The best time to start was yesterday, the second best time is now!'
    };
  }, [activeData.fireProgress, activeData.yearsToFire]);

  // Milestone celebration logic
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  
  useEffect(() => {
    const milestoneThresholds = [10, 25, 50, 75, 90];
    const reachedMilestone = milestoneThresholds.find(threshold => 
      Math.abs(activeData.fireProgress - threshold) < 0.5
    );
    
    if (reachedMilestone && activeData.fireProgress >= 10) {
      setShowMilestoneCelebration(true);
      setTimeout(() => setShowMilestoneCelebration(false), 4000);
    }
  }, [activeData.fireProgress]);

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

  if (isLoading || hubLoading) {
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
      {/* Milestone Celebration */}
      {showMilestoneCelebration && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center max-w-sm w-full border-4 border-amber-400/30"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              FIRE Milestone Achieved!
            </h3>
            <p className="text-slate-600 mb-6">
              You've reached {activeData.fireProgress.toFixed(1)}% toward financial independence!
            </p>
            <button
              onClick={() => setShowMilestoneCelebration(false)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Keep Building Wealth!
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Hero Metric Section - FIRE Progress */}
      <div className={`text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br rounded-xl sm:rounded-2xl border-2 ${fireStageInsights.bgColor} ${fireStageInsights.color.replace('text-', 'border-').replace('-600', '-200')}`}>
        <div className="flex items-center justify-center mb-3">
          <motion.div 
            className={`p-3 sm:p-4 rounded-xl ${fireStageInsights.bgColor}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-3xl sm:text-4xl">{fireStageInsights.emoji}</span>
          </motion.div>
        </div>
        
        <motion.div 
          className={`font-bold text-4xl sm:text-5xl lg:text-6xl mb-2 ${fireStageInsights.color}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {animatedValues.heroMetric.toFixed(1)}%
        </motion.div>
        
        <motion.div 
          className="text-slate-600 font-medium text-sm sm:text-base mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Progress to FIRE
        </motion.div>

        <motion.div 
          className={`font-semibold text-lg ${fireStageInsights.color} mb-2`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {fireStageInsights.stage}
        </motion.div>

        <motion.div 
          className="text-slate-600 text-sm mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {fireStageInsights.message}
        </motion.div>

        {/* Years to FIRE */}
        <motion.div 
          className="inline-flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full text-sm font-medium"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <Calendar className="w-4 h-4 text-primary-600" />
          <span>{animatedValues.yearsToFire.toFixed(1)} years to financial independence</span>
        </motion.div>
      </div>

      {/* FIRE Progress Breakdown */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-prosperity-50 to-prosperity-25 rounded-lg border border-prosperity-100">
          <div className="text-lg font-bold text-prosperity-600 mb-1">
            ${Math.round(animatedValues.netWorth)}K
          </div>
          <div className="text-xs text-slate-600">Net Worth</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-25 rounded-lg border border-blue-100">
          <div className="text-lg font-bold text-blue-600 mb-1">
            {Math.round(animatedValues.savingsRate)}%
          </div>
          <div className="text-xs text-slate-600">Savings Rate</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-25 rounded-lg border border-green-100">
          <div className="text-lg font-bold text-green-600 mb-1">
            ${Math.round(animatedValues.monthlyInvestment).toLocaleString()}
          </div>
          <div className="text-xs text-slate-600">Monthly Investment</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-25 rounded-lg border border-orange-100">
          <div className="text-lg font-bold text-orange-600 mb-1">
            {Math.round(animatedValues.aboveZeroStreak)}
          </div>
          <div className="text-xs text-slate-600">Above Zero Streak</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-display font-semibold text-slate-800">
            Financial Planning Hub
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
          aria-label="Financial planning navigation"
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
                    layoutId="activePlanningTab"
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
          {activeTab === 'fire' && (
            <div className="-mx-4 -my-2">
              <FIREProgressCard />
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="-mx-4 -my-2">
              <ExpenseMilestones 
                milestones={incomeExpenseMilestones} 
                totalCoverage={totalExpenseCoverage} 
              />
            </div>
          )}

          {activeTab === 'abovezero' && (
            <div className="-mx-4 -my-2">
              <AboveZeroTracker
                currentStreak={activeData.aboveZeroStreak}
                longestStreak={Math.max(activeData.aboveZeroStreak, 8)}
                totalMonths={24}
                currentAmount={activeData.monthlyInvestment}
                isAboveZero={activeData.monthlyInvestment > 0}
              />
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="-mx-4 -my-2">
              <GoalPlanningInterface />
            </div>
          )}

          {activeTab === 'coastfi' && (
            <div className="-mx-4 -my-2">
              <CoastFICalculator
                initialData={{
                  currentAge: 30,
                  currentNetWorth: activeData.netWorth,
                  targetRetirementAge: 60,
                  targetRetirementIncome: 80000,
                  currentSavingsRate: activeData.currentSavingsRate,
                  expectedInflation: 2.5,
                  expectedReturns: 7
                }}
              />
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="-mx-4 -my-2">
              <WhatIfScenarios
                baselineData={{
                  currentAge: 30,
                  currentIncome: 80000,
                  currentExpenses: 48000,
                  currentNetWorth: activeData.netWorth,
                  currentSavingsRate: activeData.currentSavingsRate
                }}
              />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="-mx-4 -my-2">
              <MilestoneCelebrations
                userProgress={{
                  level: 12,
                  totalPoints: 2450,
                  pointsToNextLevel: 550,
                  currentStreak: activeData.aboveZeroStreak,
                  longestStreak: Math.max(activeData.aboveZeroStreak, 12),
                  milestonesUnlocked: 15,
                  savingsRate: activeData.currentSavingsRate,
                  netWorth: activeData.netWorth,
                  monthsActive: 18
                }}
              />
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
export const FinancialPlanningHub = memo(FinancialPlanningHubComponent, (prevProps, nextProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.planningData?.fireProgress === nextProps.planningData?.fireProgress &&
    prevProps.planningData?.yearsToFire === nextProps.planningData?.yearsToFire &&
    prevProps.planningData?.aboveZeroStreak === nextProps.planningData?.aboveZeroStreak
  );
});