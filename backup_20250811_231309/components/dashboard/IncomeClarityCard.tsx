'use client';

import { useState, useEffect, memo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Zap, Target, Droplets, Activity, Heart, Shield, AlertTriangle, Calendar, CheckCircle, AlertCircle, Award, Flame } from 'lucide-react';
import { IncomeClarityResult, StreakTracker } from '@/types';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import ShareButton from '@/components/shared/ShareButton';
import { generateShareContent } from '@/utils/shareContent';
import { generateDemoStreakData, formatMonthDisplay, getMilestoneMessage, getWarningMessage } from '@/utils/streakCalculations';
import { SkeletonIncomeClarityCard } from '@/components/ui/skeletons';
import HelpButton, { helpContent } from '@/components/shared/HelpButton';

type IncomeViewMode = 'monthly' | 'annual';

interface IncomeClarityProps {
  clarityData: IncomeClarityResult;
  isLoading?: boolean;
  viewMode?: IncomeViewMode;
}

const IncomeClarityCardComponent = ({ clarityData, isLoading = false, viewMode = 'monthly' }: IncomeClarityProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showMilestoneAnimation, setShowMilestoneAnimation] = useState(false);

  // Format values based on view mode
  const formatIncomeValue = (monthlyValue: number) => {
    if (viewMode === 'annual') {
      return {
        value: monthlyValue * 12,
        suffix: '/year',
        multiplier: 12
      };
    }
    return {
      value: monthlyValue,
      suffix: '/month',
      multiplier: 1
    };
  };

  // Get formatted values
  const grossIncome = formatIncomeValue(clarityData.grossMonthly);
  const netIncome = formatIncomeValue(clarityData.netMonthly);
  const expenses = formatIncomeValue(clarityData.monthlyExpenses);
  const available = formatIncomeValue(Math.abs(clarityData.availableToReinvest));
  const taxOwed = formatIncomeValue(clarityData.taxOwed);

  // Show skeleton if loading
  if (isLoading) {
    return <SkeletonIncomeClarityCard />;
  }

  // Generate streak data based on current surplus
  const streakData: StreakTracker = generateDemoStreakData(
    clarityData.availableToReinvest,
    clarityData.availableToReinvest > 500 ? 'good-streak' : 
    clarityData.availableToReinvest > 0 ? 'new-user' : 'broken-streak'
  );

  // Check for milestone achievement to trigger animation
  useEffect(() => {
    if (streakData.currentStreak === 3 || streakData.currentStreak === 6 || streakData.currentStreak === 12) {
      setShowMilestoneAnimation(true);
      const timer = setTimeout(() => setShowMilestoneAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [streakData.currentStreak]);

  // Calculate financial stress level (0-100 scale)
  const calculateStressLevel = (): { score: number; level: 'low' | 'moderate' | 'high'; message: string } => {
    const availableAmount = clarityData.availableToReinvest;
    const monthlyExpenses = clarityData.monthlyExpenses;
    
    if (availableAmount >= 0) {
      // User has surplus - calculate stress based on how much buffer they have
      // Prevent division by zero - use a minimum expense value
      const safeMonthlyExpenses = Math.max(monthlyExpenses, 1);
      const bufferRatio = availableAmount / safeMonthlyExpenses;
      
      if (bufferRatio >= 0.5) {
        // 50%+ buffer = very low stress (0-10)
        return { score: Math.max(0, 10 - (bufferRatio * 10)), level: 'low', message: 'Excellent financial position! You have plenty of room for unexpected expenses.' };
      } else if (bufferRatio >= 0.2) {
        // 20-50% buffer = low stress (10-25)
        return { score: 10 + (25 - bufferRatio * 50), level: 'low', message: 'Great job! You\'re building wealth and have good financial security.' };
      } else {
        // 0-20% buffer = moderate stress (25-35)
        return { score: 25 + (10 - bufferRatio * 50), level: 'moderate', message: 'You\'re doing well staying above zero! Consider building a bigger buffer.' };
      }
    } else {
      // User has deficit - stress increases with size of deficit
      // Prevent division by zero - use a minimum expense value
      const safeMonthlyExpenses = Math.max(monthlyExpenses, 1);
      const deficitRatio = Math.abs(availableAmount) / safeMonthlyExpenses;
      
      if (deficitRatio <= 0.1) {
        // Small deficit 0-10% = moderate stress (50-65)
        return { score: 50 + (deficitRatio * 150), level: 'moderate', message: 'You\'re close to breaking even! Small optimizations can make a big difference.' };
      } else if (deficitRatio <= 0.3) {
        // Medium deficit 10-30% = high stress (65-85)
        return { score: 65 + (deficitRatio * 67), level: 'high', message: 'Focus on increasing income or reducing expenses to improve your position.' };
      } else {
        // Large deficit 30%+ = very high stress (85-100)
        return { score: Math.min(100, 85 + (deficitRatio * 50)), level: 'high', message: 'Consider major budget adjustments or income improvements to reduce financial stress.' };
      }
    }
  };

  const stressData = calculateStressLevel();

  // Use optimized animation system
  const animatedValues = useStaggeredCountingAnimation(
    {
      gross: clarityData.grossMonthly,
      tax: clarityData.taxOwed,
      net: clarityData.netMonthly,
      expenses: clarityData.monthlyExpenses,
      available: Math.abs(clarityData.availableToReinvest),
      stress: stressData.score,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalAbove: streakData.totalAboveZeroMonths,
    },
    1000,
    200
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const waterfallSteps = [
    {
      label: viewMode === 'annual' ? 'Gross Annual Income' : 'Gross Monthly Income',
      value: Math.round(animatedValues.gross * grossIncome.multiplier),
      actualValue: grossIncome.value,
      type: 'positive' as const,
      icon: DollarSign,
      description: viewMode === 'annual' ? 'Your total annual income before deductions' : 'Your total monthly income before deductions',
      suffix: grossIncome.suffix
    },
    {
      label: viewMode === 'annual' ? 'Annual Tax Owed' : 'Tax Owed',
      value: Math.round(animatedValues.tax * taxOwed.multiplier),
      actualValue: taxOwed.value,
      type: 'negative' as const,
      icon: null,
      description: 'Federal and state taxes on your income',
      suffix: taxOwed.suffix
    },
    {
      label: viewMode === 'annual' ? 'Net Annual After-Tax Income' : 'Net After-Tax Income',
      value: Math.round(animatedValues.net * netIncome.multiplier),
      actualValue: netIncome.value,
      type: 'milestone' as const,
      icon: Target,
      description: 'Your take-home pay after taxes',
      suffix: netIncome.suffix
    },
    {
      label: viewMode === 'annual' ? 'Annual Living Expenses' : 'Monthly Living Expenses',
      value: Math.round(animatedValues.expenses * expenses.multiplier),
      actualValue: expenses.value,
      type: 'negative' as const,
      icon: null,
      description: viewMode === 'annual' ? 'Essential annual costs and lifestyle spending' : 'Essential monthly costs and lifestyle spending',
      suffix: expenses.suffix
    }
  ];

  return (
    <div className={`premium-card hover-lift animate-on-mount p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* PROMINENT Zero Line Status - Most Important Metric */}
      <section 
        className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 ${
          clarityData.aboveZeroLine 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100/50' 
            : clarityData.availableToReinvest === 0
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-yellow-100/50'
            : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-red-100/50'
        } shadow-lg`}
        role="status"
        aria-labelledby="zero-line-status"
        aria-live="polite"
      >
        <h3 id="zero-line-status" className="sr-only">
          {clarityData.aboveZeroLine 
            ? 'Above Zero Line - Positive cash flow' 
            : clarityData.availableToReinvest === 0
            ? 'At Zero Line - Breaking even'
            : 'Below Zero Line - Negative cash flow'}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 sm:p-3 rounded-full ${
              clarityData.aboveZeroLine 
                ? 'bg-green-100 text-green-700' 
                : clarityData.availableToReinvest === 0
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            } transition-all duration-300`}>
              {clarityData.aboveZeroLine ? (
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : clarityData.availableToReinvest === 0 ? (
                <Target className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />
              )}
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                clarityData.aboveZeroLine 
                  ? 'text-green-800' 
                  : clarityData.availableToReinvest === 0
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {clarityData.aboveZeroLine 
                  ? 'ABOVE ZERO LINE' 
                  : clarityData.availableToReinvest === 0
                  ? 'BREAKING EVEN'
                  : 'BELOW ZERO LINE'
                }
              </h2>
              <p className={`text-sm sm:text-base font-medium ${
                clarityData.aboveZeroLine 
                  ? 'text-green-700' 
                  : clarityData.availableToReinvest === 0
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                {clarityData.aboveZeroLine 
                  ? 'You are building wealth every month!' 
                  : clarityData.availableToReinvest === 0
                  ? 'You are covering all expenses - push for surplus!'
                  : 'Focus on optimization to reach positive cash flow'
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
              clarityData.aboveZeroLine 
                ? 'text-green-600' 
                : clarityData.availableToReinvest === 0
                ? 'text-yellow-600'
                : 'text-red-600'
            }`} role="status" aria-live="polite">
              {clarityData.aboveZeroLine ? '+' : clarityData.availableToReinvest === 0 ? '±' : ''}${Math.round(Math.abs(animatedValues.available) * available.multiplier).toLocaleString()}
            </div>
            <div className={`text-sm sm:text-base font-semibold mt-1 ${
              clarityData.aboveZeroLine 
                ? 'text-green-600' 
                : clarityData.availableToReinvest === 0
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {clarityData.aboveZeroLine 
                ? `${viewMode === 'annual' ? 'Annual' : 'Monthly'} Surplus` 
                : clarityData.availableToReinvest === 0
                ? 'Break Even'
                : `${viewMode === 'annual' ? 'Annual' : 'Monthly'} Deficit`
              }
              <span className="text-xs opacity-75 ml-1">({available.suffix})</span>
            </div>
          </div>
        </div>
        
        {/* Financial Stress Level Indicator */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${
                stressData.level === 'low' ? 'bg-green-100 text-green-700' :
                stressData.level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {stressData.level === 'low' ? (
                  <Shield className="w-4 h-4" />
                ) : stressData.level === 'moderate' ? (
                  <Heart className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <span className="font-medium text-slate-700 text-sm">Financial Stress Level</span>
              <div className="group relative">
                <Activity className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  0-30: Low stress | 31-70: Moderate | 71-100: High stress
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`text-2xl font-bold ${
                stressData.level === 'low' ? 'text-green-600' :
                stressData.level === 'moderate' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {Math.round(animatedValues.stress)}
              </div>
              <span className="text-slate-500 text-sm font-medium">/100</span>
            </div>
          </div>
          
          {/* Visual Progress Bar */}
          <div className="relative">
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  stressData.level === 'low' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  stressData.level === 'moderate' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                  'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${Math.min(animatedValues.stress, 100)}%` }}
              />
            </div>
            {/* Stress level markers */}
            <div className="absolute top-0 left-[30%] w-0.5 h-3 bg-slate-300" />
            <div className="absolute top-0 left-[70%] w-0.5 h-3 bg-slate-300" />
          </div>
          
          {/* Supportive Message */}
          <div className={`p-3 rounded-lg border-l-4 ${
            stressData.level === 'low' ? 'bg-green-50 border-green-400 text-green-800' :
            stressData.level === 'moderate' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
            'bg-red-50 border-red-400 text-red-800'
          }`}>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {stressData.message}
            </p>
          </div>
        </div>

        {/* Above Zero Streak Tracker - Most Important Emotional Metric */}
        <div className="mt-6 p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-prosperity-25 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                streakData.currentStreak > 0 
                  ? 'bg-prosperity-100 text-prosperity-700' 
                  : 'bg-alert-100 text-alert-700'
              }`}>
                {streakData.currentStreak > 0 ? (
                  <Flame className="w-5 h-5" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-display font-semibold text-base sm:text-lg text-slate-800">
                  Above Zero Streak
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  {streakData.currentStreak > 0 
                    ? 'Consecutive months of wealth building' 
                    : 'Time to start your streak'
                  }
                </p>
              </div>
            </div>
            
            {/* Milestone Animation Badge */}
            {showMilestoneAnimation && streakData.milestones.lastMilestone && (
              <div className="animate-bounce">
                <div className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-prosperity-500 to-primary-500 text-white rounded-full text-sm font-bold shadow-lg">
                  <Award className="w-4 h-4" />
                  <span>{streakData.milestones.lastMilestone} MONTHS!</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Current vs Longest Streak Display */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-3xl sm:text-4xl font-bold ${
                streakData.currentStreak > 0 ? 'text-prosperity-600' : 'text-slate-500'
              }`}>
                {Math.round(animatedValues.currentStreak)}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                Current Streak
              </div>
              <div className="text-xs text-slate-500">
                {streakData.currentStreak === 1 ? 'month' : 'months'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary-600">
                {Math.round(animatedValues.longestStreak)}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                Longest Streak
              </div>
              <div className="text-xs text-slate-500">
                {streakData.longestStreak === 1 ? 'month' : 'months'}
              </div>
            </div>
          </div>
          
          {/* 12-Month History Mini Chart */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">Last 12 Months</span>
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <CheckCircle className="w-3 h-3 text-prosperity-500" />
                <span>Above Zero</span>
                <div className="w-3 h-3 rounded-full bg-slate-300 ml-2" />
                <span>Below Zero</span>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-1">
              {streakData.monthlyHistory.map((month, index) => (
                <div
                  key={month.month}
                  className="group relative"
                >
                  <div
                    className={`aspect-square rounded-md border-2 transition-all duration-200 ${
                      month.aboveZero 
                        ? 'bg-prosperity-100 border-prosperity-300 hover:bg-prosperity-200' 
                        : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {month.aboveZero && (
                      <div className="flex items-center justify-center h-full">
                        <CheckCircle className="w-3 h-3 text-prosperity-600" />
                      </div>
                    )}
                    {month.milestoneReached && (
                      <div className="absolute -top-1 -right-1">
                        <Award className="w-3 h-3 text-primary-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {formatMonthDisplay(month.month)}: {month.aboveZero ? '+' : ''}${month.surplus}
                    {month.milestoneReached && <div className="text-prosperity-300">🎉 Milestone!</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Milestone Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">Milestones Achieved</span>
              <span className="text-xs text-slate-500">
                {Math.round(animatedValues.totalAbove)}/{streakData.monthlyHistory.length} months above zero
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-1 text-xs ${
                streakData.milestones.threeMonths ? 'text-prosperity-600' : 'text-slate-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  streakData.milestones.threeMonths ? 'bg-prosperity-500' : 'bg-slate-300'
                }`} />
                <span>3 months</span>
              </div>
              <div className={`flex items-center space-x-1 text-xs ${
                streakData.milestones.sixMonths ? 'text-prosperity-600' : 'text-slate-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  streakData.milestones.sixMonths ? 'bg-prosperity-500' : 'bg-slate-300'
                }`} />
                <span>6 months</span>
              </div>
              <div className={`flex items-center space-x-1 text-xs ${
                streakData.milestones.twelveMonths ? 'text-prosperity-600' : 'text-slate-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  streakData.milestones.twelveMonths ? 'bg-prosperity-500' : 'bg-slate-300'
                }`} />
                <span>12 months</span>
              </div>
            </div>
          </div>
          
          {/* Warning or Encouragement Message */}
          {streakData.warningTriggered && (
            <div className="p-3 rounded-lg border-l-4 border-yellow-400 bg-yellow-50">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-xs sm:text-sm font-medium text-yellow-800">
                  {getWarningMessage(clarityData.availableToReinvest, streakData.currentStreak)}
                </p>
              </div>
            </div>
          )}
          
          {/* Celebration Message for Current Milestone */}
          {streakData.currentStreak === 3 || streakData.currentStreak === 6 || streakData.currentStreak === 12 ? (
            <div className="p-3 rounded-lg border-l-4 border-prosperity-400 bg-prosperity-50">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-prosperity-600" />
                <p className="text-xs sm:text-sm font-medium text-prosperity-800">
                  {getMilestoneMessage(streakData.currentStreak)}
                </p>
              </div>
            </div>
          ) : streakData.currentStreak > 0 ? (
            <div className="p-3 rounded-lg border-l-4 border-primary-400 bg-primary-50">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-primary-600" />
                <p className="text-xs sm:text-sm font-medium text-primary-800">
                  {streakData.currentStreak < 3 
                    ? `${3 - streakData.currentStreak} more month${3 - streakData.currentStreak === 1 ? '' : 's'} to your first milestone!` 
                    : streakData.currentStreak < 6 
                    ? `${6 - streakData.currentStreak} more month${6 - streakData.currentStreak === 1 ? '' : 's'} to 6-month milestone!` 
                    : `${12 - streakData.currentStreak} more month${12 - streakData.currentStreak === 1 ? '' : 's'} to 1-year milestone!`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border-l-4 border-slate-400 bg-slate-50">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-slate-600" />
                <p className="text-xs sm:text-sm font-medium text-slate-700">
                  Get above zero this month to start your streak! Every journey begins with the first step.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress indicator showing financial health */}
        <div className="flex items-center justify-between text-xs sm:text-sm mt-4">
          <span className="font-medium text-slate-600">
            Financial Status
          </span>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            clarityData.aboveZeroLine 
              ? 'bg-green-100 text-green-800' 
              : clarityData.availableToReinvest === 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {clarityData.aboveZeroLine 
              ? 'WEALTH BUILDING' 
              : clarityData.availableToReinvest === 0
              ? 'STABLE'
              : 'NEEDS ATTENTION'
            }
          </div>
        </div>
      </section>

      {/* Mobile-optimized header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800">
              Income Clarity Dashboard
            </h3>
            <HelpButton 
              {...helpContent.incomeClarityCard}
              size="sm"
              position="bottom-left"
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Your complete financial waterfall analysis
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-600" />
        </div>
      </div>
      
      {/* Enhanced waterfall visualization with flow animations */}
      <div className="waterfall-container space-y-4 sm:space-y-6">
        {waterfallSteps.map((step, index) => (
          <div 
            key={step.label}
            className={`waterfall-step ${step.type} group relative transition-all duration-500 ease-premium waterfall-optimized ${
              index === 0 ? 'animate-fade-in' : ''
            }`}
            style={{ 
              animationDelay: `${index * 150}ms`,
              '--flow-delay': `${index * 300}ms`
            } as React.CSSProperties}
          >
            {/* Animated flowing connector */}
            {index < waterfallSteps.length - 1 && (
              <>
                <div 
                  className="money-drop"
                  style={{
                    animationDelay: `${(index * 300) + 500}ms`,
                    animationDuration: '2s'
                  }}
                />
                {/* Subtle money cascade particles */}
                <div 
                  className="money-cascade-particle"
                  style={{
                    top: '-5px',
                    left: '48%',
                    animationDelay: `${(index * 300) + 800}ms`
                  }}
                >
                  $
                </div>
                <div 
                  className="money-cascade-particle"
                  style={{
                    top: '-8px',
                    left: '52%',
                    animationDelay: `${(index * 300) + 1200}ms`
                  }}
                >
                  💰
                </div>
              </>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-300 touch-friendly">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-0">
                {step.icon && (
                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                    step.type === 'positive' ? 'bg-prosperity-50 text-prosperity-600' :
                    step.type === 'milestone' ? 'bg-primary-50 text-primary-600' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm sm:text-base font-medium ${
                      step.type === 'milestone' ? 'text-slate-800 sm:text-lg' : 'text-slate-700'
                    }`}>
                      {step.label}
                    </span>
                    {step.type === 'milestone' && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-glow-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-600 transition-colors leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className={`currency-display font-semibold text-lg sm:text-xl currency-animated ${
                  step.type === 'positive' ? 'text-prosperity-600' :
                  step.type === 'negative' ? 'text-alert-600' :
                  step.type === 'milestone' ? 'text-primary-600' :
                  'text-slate-800'
                }`}>
                  {step.type === 'negative' ? '-' : ''}${step.value.toLocaleString()}
                  {step.type === 'negative' && <Droplets className="w-3 h-3 text-red-500 animate-bounce ml-1 inline" />}
                </div>
                <div className="text-xs text-slate-500 mt-1">{step.suffix}</div>
                {step.value !== step.actualValue && (
                  <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
                    <div 
                      className="h-1 bg-gradient-to-r from-primary-500 to-prosperity-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(step.value / step.actualValue) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Mobile-optimized Available to Reinvest section */}
        <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
          clarityData.aboveZeroLine 
            ? 'bg-gradient-to-br from-prosperity-50 via-prosperity-25 to-white border-2 border-prosperity-200' 
            : 'bg-gradient-to-br from-alert-50 via-alert-25 to-white border-2 border-alert-200'
        } achievement-glow ${clarityData.aboveZeroLine ? 'achieved' : ''}`}>
          
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shimmer" />
          </div>
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                  clarityData.aboveZeroLine 
                    ? 'bg-prosperity-100 text-prosperity-700' 
                    : 'bg-alert-100 text-alert-700'
                }`}>
                  {clarityData.aboveZeroLine ? (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base sm:text-lg text-slate-800">
                    Available to Reinvest
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {clarityData.aboveZeroLine 
                      ? 'Your wealth-building power' 
                      : 'Monthly budget gap to address'
                    }
                  </p>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className={`currency-display font-bold text-2xl sm:text-3xl currency-animated ${
                  clarityData.aboveZeroLine 
                    ? 'text-gradient-prosperity' 
                    : 'text-gradient-alert'
                }`}>
                  {clarityData.aboveZeroLine ? '+' : '-'}${Math.round(animatedValues.available * available.multiplier).toLocaleString()}
                </div>
                <div className="text-sm text-slate-500 mt-1">{available.suffix}</div>
                <div className={`text-xs sm:text-sm font-medium mt-1 ${
                  clarityData.aboveZeroLine ? 'text-prosperity-600' : 'text-alert-600'
                }`}>
                  {clarityData.aboveZeroLine ? 'Above Zero Line' : 'Below Zero Line'} • {viewMode === 'annual' ? 'Annual' : 'Monthly'}
                </div>
              </div>
            </div>
            
            {/* Mobile-optimized status indicator */}
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
              clarityData.aboveZeroLine 
                ? 'bg-prosperity-100/50 border border-prosperity-200' 
                : 'bg-alert-100/50 border border-alert-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  clarityData.aboveZeroLine ? 'bg-prosperity-500' : 'bg-alert-500'
                } animate-subtle-pulse`} />
                <span className={`text-sm font-medium ${
                  clarityData.aboveZeroLine ? 'text-prosperity-700' : 'text-alert-700'
                }`}>
                  {clarityData.aboveZeroLine 
                    ? 'Building wealth every month' 
                    : 'Opportunity for optimization'
                  }
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {clarityData.aboveZeroLine && (
                  <div className="text-xs font-medium text-prosperity-600 bg-prosperity-50 px-2 sm:px-3 py-1 rounded-full text-center sm:text-left">
                    {viewMode === 'monthly' 
                      ? `$${Math.round(clarityData.availableToReinvest * 12).toLocaleString()}/year potential`
                      : `$${Math.round(clarityData.availableToReinvest).toLocaleString()}/month potential`
                    }
                  </div>
                )}
                <ShareButton
                  shareType="income-status"
                  shareData={generateShareContent('income-status', { clarityData })}
                  variant="ghost"
                  size="sm"
                  className={clarityData.aboveZeroLine ? 'text-prosperity-600 hover:text-prosperity-700 hover:bg-prosperity-50' : 'text-slate-600 hover:text-slate-700 hover:bg-slate-100'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized progress visualization */}
      {clarityData.aboveZeroLine && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-primary-50 rounded-lg sm:rounded-xl border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm mb-2">
            <span className="font-medium text-slate-700 mb-1 sm:mb-0">Monthly Investment Power</span>
            <span className="font-semibold text-primary-600 text-center sm:text-right">
              {((clarityData.availableToReinvest / Math.max(clarityData.grossMonthly, 1)) * 100).toFixed(1)}% of gross
            </span>
          </div>
          <div className="progress-bar-premium">
            <div 
              className="progress-fill bg-gradient-to-r from-prosperity-500 to-primary-500"
              style={{ 
                width: `${Math.min((clarityData.availableToReinvest / Math.max(clarityData.grossMonthly, 1)) * 100, 100)}%`,
                '--progress-width': `${Math.min((clarityData.availableToReinvest / Math.max(clarityData.grossMonthly, 1)) * 100, 100)}%`
              } as any}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const IncomeClarityCard = memo(IncomeClarityCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.clarityData.grossMonthly === nextProps.clarityData.grossMonthly &&
    prevProps.clarityData.taxOwed === nextProps.clarityData.taxOwed &&
    prevProps.clarityData.netMonthly === nextProps.clarityData.netMonthly &&
    prevProps.clarityData.monthlyExpenses === nextProps.clarityData.monthlyExpenses &&
    prevProps.clarityData.availableToReinvest === nextProps.clarityData.availableToReinvest &&
    prevProps.clarityData.aboveZeroLine === nextProps.clarityData.aboveZeroLine
  );
});