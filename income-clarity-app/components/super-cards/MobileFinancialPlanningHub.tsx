'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target,
  TrendingUp,
  Flame,
  Settings,
  Trophy,
  Calendar,
  DollarSign,
  Zap,
  X,
  Info,
  RefreshCw,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react';
import { usePlanningHub, usePlanningActions, useExpenseMilestones, useIncomeHub } from '@/store/superCardStore';
import { FIREProgressCard } from '@/components/income/FIREProgressCard';
import { ExpenseMilestones } from '@/components/dashboard/ExpenseMilestones';
import { AboveZeroTracker } from '@/components/planning/AboveZeroTracker';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';

interface MobileFinancialPlanningHubProps {
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
  onClose?: () => void;
}

type TabType = 'fire' | 'milestones' | 'abovezero' | 'goals';

const MOBILE_TABS = [
  {
    id: 'fire' as TabType,
    label: 'FIRE',
    shortLabel: 'FIRE',
    description: 'Financial independence',
    icon: Target,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50'
  },
  {
    id: 'milestones' as TabType,
    label: 'Goals',
    shortLabel: 'Goal',
    description: 'Expense milestones',
    icon: Trophy,
    color: 'text-prosperity-600',
    bgColor: 'bg-prosperity-50'
  },
  {
    id: 'abovezero' as TabType,
    label: 'Streak',
    shortLabel: 'Stk',
    description: 'Above zero tracking',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'goals' as TabType,
    label: 'Custom',
    shortLabel: 'Set',
    description: 'Custom goals',
    icon: Settings,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50'
  }
];

const MobileFinancialPlanningHubComponent = ({ 
  planningData,
  isLoading = false,
  className = '',
  onClose
}: MobileFinancialPlanningHubProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('fire');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [pullRefreshDistance, setPullRefreshDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const planningHub = usePlanningHub();
  const { updateData, setLoading, setError } = usePlanningActions();
  const { fireData, expenseMilestones, aboveZeroData, loading: hubLoading } = planningHub;
  
  // Get expense milestones from income hub (correct data structure for ExpenseMilestones component)
  const expenseMilestonesData = useExpenseMilestones();
  const incomeExpenseMilestones = expenseMilestonesData.expenseMilestones;
  const { totalExpenseCoverage } = useIncomeHub();

  // Mobile-optimized FIRE data - inspiring progress
  const activeData = planningData || fireData || {
    fireProgress: 23.5,
    yearsToFire: 12.3,
    currentSavingsRate: 35,
    aboveZeroStreak: 6,
    monthlyInvestment: 2450,
    netWorth: 145000
  };

  // Mobile-optimized animations - faster and lighter
  const animatedValues = useStaggeredCountingAnimation(
    {
      heroMetric: activeData.fireProgress,
      yearsToFire: activeData.yearsToFire,
      savingsRate: activeData.currentSavingsRate,
      monthlyInvestment: activeData.monthlyInvestment,
      netWorth: activeData.netWorth / 1000,
      aboveZeroStreak: activeData.aboveZeroStreak
    },
    800, // Faster for mobile
    100
  );

  // Mobile-optimized FIRE stage insights
  const fireStageInsights = useMemo(() => {
    const progress = activeData.fireProgress;
    const years = activeData.yearsToFire;
    
    if (progress >= 100) {
      return {
        stage: 'FIRE Achieved! 🏆',
        shortStage: 'Achieved',
        emoji: '🏆',
        message: `Congratulations! You're financially free!`,
        color: 'text-gold-600',
        bgColor: 'bg-gold-50',
        motivation: 'You did it!',
        priority: 'celebration'
      };
    }
    
    if (progress >= 75) {
      return {
        stage: 'Final Sprint 🚀',
        shortStage: 'Final Sprint',
        emoji: '🚀',
        message: `Just ${years.toFixed(1)} years to freedom!`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        motivation: 'Almost there!',
        priority: 'high'
      };
    }
    
    if (progress >= 50) {
      return {
        stage: 'Accelerating ⚡',
        shortStage: 'Accelerating',
        emoji: '⚡',
        message: `Halfway point! ${years.toFixed(1)} years left.`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        motivation: 'Strong momentum!',
        priority: 'good'
      };
    }
    
    if (progress >= 25) {
      return {
        stage: 'Building Steam 📈',
        shortStage: 'Building',
        emoji: '📈',
        message: `Quarter way there! ${years.toFixed(1)} years to go.`,
        color: 'text-primary-600',
        bgColor: 'bg-primary-50',
        motivation: 'Great progress!',
        priority: 'progress'
      };
    }
    
    if (progress >= 10) {
      return {
        stage: 'Getting Started 🌱',
        shortStage: 'Started',
        emoji: '🌱',
        message: `Strong start! ${years.toFixed(1)} years estimated.`,
        color: 'text-prosperity-600',
        bgColor: 'bg-prosperity-50',
        motivation: 'Keep growing!',
        priority: 'beginning'
      };
    }
    
    return {
      stage: 'Beginning Journey 🎯',
      shortStage: 'Beginning',
      emoji: '🎯',
      message: `Your FIRE journey! ${years.toFixed(1)} years to freedom.`,
      color: 'text-wealth-600',
      bgColor: 'bg-wealth-50',
      motivation: 'Time to start!',
      priority: 'start'
    };
  }, [activeData.fireProgress, activeData.yearsToFire]);

  // Milestone celebration detection
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

  // Mobile touch handlers with pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.targetTouches[0].clientY;
    const deltaY = currentY - touchStart.y;
    
    // Pull to refresh logic
    if (deltaY > 0 && window.scrollY === 0) {
      setPullRefreshDistance(Math.min(deltaY / 3, 60));
    }
  };

  const handleTouchEnd = () => {
    if (pullRefreshDistance > 40) {
      handleRefresh();
    }
    setPullRefreshDistance(0);
  };

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Refresh FIRE data here
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || hubLoading) {
    return (
      <div className="h-screen bg-slate-50">
        {/* Mobile Loading Skeleton */}
        <div className="animate-pulse p-4">
          <div className="h-16 bg-slate-200 rounded-xl mb-4"></div>
          <div className="h-32 bg-slate-200 rounded-xl mb-4"></div>
          <div className="flex space-x-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 h-12 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-gradient-to-br from-slate-50 to-white overflow-hidden ${className}`}>
      {/* Milestone Celebration - Mobile optimized */}
      {showMilestoneCelebration && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 text-center max-w-xs w-full border-4 border-gold-200"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              FIRE Milestone!
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              You've reached {activeData.fireProgress.toFixed(1)}% toward financial independence!
            </p>
            <button
              onClick={() => setShowMilestoneCelebration(false)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Keep Building! 🚀
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Pull to refresh indicator */}
      {pullRefreshDistance > 0 && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50"
          style={{ y: pullRefreshDistance - 30 }}
        >
          <div className={`p-2 rounded-full ${pullRefreshDistance > 40 ? 'bg-green-500' : 'bg-slate-300'} text-white`}>
            <RefreshCw className="w-4 h-4" />
          </div>
        </motion.div>
      )}

      <div 
        className="h-full overflow-y-auto overscroll-y-contain"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-slate-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${fireStageInsights.bgColor}`}>
                <span className="text-xl">{fireStageInsights.emoji}</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-800">FIRE Planning</h1>
                <p className="text-xs text-slate-500">{fireStageInsights.shortStage}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBottomSheet(true)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Info className="w-4 h-4 text-slate-600" />
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section - FIRE Progress */}
        <div className="px-4 py-6">
          <div className={`text-center p-6 bg-gradient-to-br rounded-2xl border-2 ${fireStageInsights.bgColor} ${fireStageInsights.color.replace('text-', 'border-').replace('-600', '-200')}`}>
            <div className="flex items-center justify-center mb-3">
              <div className={`p-3 rounded-xl ${fireStageInsights.bgColor}`}>
                <span className="text-2xl">{fireStageInsights.emoji}</span>
              </div>
            </div>
            
            <div className={`text-5xl font-bold mb-1 ${fireStageInsights.color}`}>
              {animatedValues.heroMetric.toFixed(1)}%
            </div>
            
            <div className="text-sm text-slate-600 mb-2">
              Progress to FIRE
            </div>

            <div className={`text-lg font-semibold ${fireStageInsights.color} mb-2`}>
              {fireStageInsights.stage}
            </div>

            <div className="text-sm text-slate-600 mb-4">
              {fireStageInsights.message}
            </div>

            {/* Years to FIRE - Mobile optimized */}
            <div className="inline-flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4 text-primary-600" />
              <span>{animatedValues.yearsToFire.toFixed(1)} years to freedom</span>
            </div>
          </div>

          {/* Mobile FIRE Metrics - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-4 bg-prosperity-50 rounded-xl border border-prosperity-100">
              <div className="text-lg font-bold text-prosperity-600 mb-1">
                ${Math.round(animatedValues.netWorth)}K
              </div>
              <div className="text-xs text-slate-600">Net Worth</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-lg font-bold text-blue-600 mb-1">
                {Math.round(animatedValues.savingsRate)}%
              </div>
              <div className="text-xs text-slate-600">Savings Rate</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-lg font-bold text-green-600 mb-1">
                ${Math.round(animatedValues.monthlyInvestment).toLocaleString()}
              </div>
              <div className="text-xs text-slate-600">Monthly Invest</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-lg font-bold text-orange-600 mb-1">
                {Math.round(animatedValues.aboveZeroStreak)}
              </div>
              <div className="text-xs text-slate-600">Streak Months</div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="px-4">
          <div className="flex bg-white rounded-2xl p-1 gap-1 shadow-lg border border-slate-100">
            {MOBILE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 relative px-2 py-3 text-center transition-all duration-200 rounded-xl ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl"
                      layoutId="activeMobilePlanningTab"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative flex flex-col items-center space-y-1">
                    <Icon className="w-4 h-4" />
                    <div className="text-xs font-semibold">
                      {tab.shortLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content - Mobile optimized */}
        <div className="flex-1 px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'fire' && (
                <div className="space-y-4">
                  <FIREProgressCard />
                </div>
              )}

              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  <ExpenseMilestones 
                    milestones={incomeExpenseMilestones} 
                    totalCoverage={totalExpenseCoverage} 
                  />
                </div>
              )}

              {activeTab === 'abovezero' && (
                <div className="space-y-4">
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
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Custom Goals</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Set custom financial goals beyond FIRE milestones
                  </p>
                  <div className="bg-primary-50 rounded-xl p-4 text-left">
                    <h4 className="font-semibold text-primary-800 mb-2 text-sm">Coming Soon:</h4>
                    <ul className="text-xs text-primary-600 space-y-1">
                      <li>• Custom savings targets</li>
                      <li>• Investment goal tracking</li>
                      <li>• Timeline-based objectives</li>
                      <li>• Progress visualization</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Motivation Bar */}
        <div className="px-4 pb-4">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-prosperity-500 rounded-2xl p-4 text-white"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6" />
              <div className="flex-1">
                <div className="font-bold">{fireStageInsights.motivation}</div>
                <div className="text-sm opacity-90">You're doing great - keep investing!</div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </motion.div>
        </div>

        {/* Swipe hints */}
        <div className="text-center text-xs text-slate-400 py-2">
          Swipe tabs • Pull to refresh
        </div>
      </div>

      {/* Bottom Sheet for FIRE insights */}
      {showBottomSheet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowBottomSheet(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-lg font-bold mb-4">FIRE Planning Insights</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-xl">
                <h4 className="font-semibold text-primary-800 mb-2 flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>FIRE Progress</span>
                </h4>
                <p className="text-sm text-primary-600">
                  At {activeData.fireProgress.toFixed(1)}% progress, you're {fireStageInsights.stage.toLowerCase()}. 
                  With a {activeData.currentSavingsRate}% savings rate, you're on track for FIRE in {activeData.yearsToFire.toFixed(1)} years.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Investment Power</span>
                </h4>
                <p className="text-sm text-green-600">
                  Your ${activeData.monthlyInvestment.toLocaleString()}/month investments are building wealth steadily. 
                  Current net worth: ${Math.round(activeData.netWorth / 1000)}K.
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-xl">
                <h4 className="font-semibold text-orange-800 mb-2 flex items-center space-x-2">
                  <Flame className="w-4 h-4" />
                  <span>Above Zero Streak</span>
                </h4>
                <p className="text-sm text-orange-600">
                  You've maintained positive investment flow for {activeData.aboveZeroStreak} months. 
                  This consistency is key to reaching FIRE.
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowBottomSheet(false)}
              className="w-full mt-6 bg-primary-600 text-white py-3 rounded-xl font-medium"
            >
              Keep Building Wealth!
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export const MobileFinancialPlanningHub = memo(MobileFinancialPlanningHubComponent, (prevProps, nextProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.planningData?.fireProgress === nextProps.planningData?.fireProgress &&
    prevProps.planningData?.yearsToFire === nextProps.planningData?.yearsToFire &&
    prevProps.planningData?.aboveZeroStreak === nextProps.planningData?.aboveZeroStreak
  );
});