'use client';

import { useState, useEffect, memo, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, TrendingUp, TrendingDown, Zap, Target, Droplets, Activity, Heart, Shield, AlertTriangle, 
  Calendar, CheckCircle, AlertCircle, Award, Flame, BarChart3, Download, Eye, ChevronDown, 
  PieChart, ArrowRight, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, TrendingUpIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { IncomeClarityResult, StreakTracker, TaxBreakdown, EnhancedIncomeClarityResult } from '@/types';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import ShareButton from '@/components/shared/ShareButton';
import { generateShareContent } from '@/utils/shareContent';
import { generateDemoStreakData, formatMonthDisplay, getMilestoneMessage, getWarningMessage } from '@/utils/streakCalculations';
import { useTheme } from '@/contexts/ThemeContext';
import { prefersReducedMotion } from '@/utils/accessibility';

interface EnhancedIncomeClarityProps {
  clarityData: IncomeClarityResult;
  enhancedData?: EnhancedIncomeClarityResult;
}

// Generate mock enhanced data if not provided
const generateMockEnhancedData = (base: IncomeClarityResult): EnhancedIncomeClarityResult => {
  const mockTaxBreakdown: TaxBreakdown[] = [
    {
      type: 'qualified',
      label: 'Qualified Dividends',
      amount: base.taxOwed * 0.65,
      percentage: 65,
      color: '#059669',
      description: 'Dividends taxed at favorable capital gains rates'
    },
    {
      type: 'ordinary',
      label: 'Ordinary Income',
      amount: base.taxOwed * 0.25,
      percentage: 25,
      color: '#dc2626',
      description: 'Income taxed at regular income tax rates'
    },
    {
      type: 'roc',
      label: 'Return of Capital',
      amount: base.taxOwed * 0.1,
      percentage: 10,
      color: '#2563eb',
      description: 'Tax-deferred return of your original investment'
    }
  ];

  const incomeTrend = [
    base.grossMonthly * 0.92,
    base.grossMonthly * 0.95,
    base.grossMonthly * 0.98,
    base.grossMonthly * 1.01,
    base.grossMonthly * 1.03,
    base.grossMonthly
  ];

  return {
    ...base,
    monthsAboveZero: base.aboveZeroLine ? 8 : 0,
    taxBreakdownByType: mockTaxBreakdown,
    viewMode: 'monthly',
    projectedIncome: base.grossMonthly * 1.08,
    incomeTrend,
    incomeGrowthRate: 2.8
  };
};

const EnhancedIncomeClarityCardComponent = ({ clarityData, enhancedData }: EnhancedIncomeClarityProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showMilestoneAnimation, setShowMilestoneAnimation] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly'>('monthly');
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();

  // Use provided enhanced data or generate mock data
  const enhanced = enhancedData || generateMockEnhancedData(clarityData);

  // Check for reduced motion preference
  useEffect(() => {
    setAnimationsEnabled(!prefersReducedMotion());
  }, []);

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

  // Celebration animation for milestones
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Export card as PNG
  const exportCard = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        const link = document.createElement('a');
        link.download = 'income-clarity-report.png';
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        // Error handled by emergency recovery script
  };

  // Calculate financial stress level (0-100 scale)
  const calculateStressLevel = (): { score: number; level: 'low' | 'moderate' | 'high'; message: string } => {
    const availableAmount = clarityData.availableToReinvest;
    const monthlyExpenses = clarityData.monthlyExpenses;
    
    if (availableAmount >= 0) {
      // Prevent division by zero - use a minimum expense value
      const safeMonthlyExpenses = Math.max(monthlyExpenses, 1);
      const bufferRatio = availableAmount / safeMonthlyExpenses;
      
      if (bufferRatio >= 0.5) {
        return { score: Math.max(0, 10 - (bufferRatio * 10)), level: 'low', message: 'Excellent financial position! You have plenty of room for unexpected expenses.' };
      } else if (bufferRatio >= 0.2) {
        return { score: 10 + (25 - bufferRatio * 50), level: 'low', message: 'Great job! You\'re building wealth and have good financial security.' };
      } else {
        return { score: 25 + (10 - bufferRatio * 50), level: 'moderate', message: 'You\'re doing well staying above zero! Consider building a bigger buffer.' };
      }
    } else {
      // Prevent division by zero - use a minimum expense value
      const safeMonthlyExpenses = Math.max(monthlyExpenses, 1);
      const deficitRatio = Math.abs(availableAmount) / safeMonthlyExpenses;
      
      if (deficitRatio <= 0.1) {
        return { score: 50 + (deficitRatio * 150), level: 'moderate', message: 'You\'re close to breaking even! Small optimizations can make a big difference.' };
      } else if (deficitRatio <= 0.3) {
        return { score: 65 + (deficitRatio * 67), level: 'high', message: 'Focus on increasing income or reducing expenses to improve your position.' };
      } else {
        return { score: Math.min(100, 85 + (deficitRatio * 50)), level: 'high', message: 'Consider major budget adjustments or income improvements to reduce financial stress.' };
      }
    }
  };

  const stressData = calculateStressLevel();

  // Use optimized animation system
  const baseValues = viewMode === 'quarterly' ? {
    gross: clarityData.grossMonthly * 3,
    tax: clarityData.taxOwed * 3,
    net: clarityData.netMonthly * 3,
    expenses: clarityData.monthlyExpenses * 3,
    available: Math.abs(clarityData.availableToReinvest * 3),
  } : {
    gross: clarityData.grossMonthly,
    tax: clarityData.taxOwed,
    net: clarityData.netMonthly,
    expenses: clarityData.monthlyExpenses,
    available: Math.abs(clarityData.availableToReinvest),
  };

  const animatedValues = useStaggeredCountingAnimation(
    {
      ...baseValues,
      stress: stressData.score,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      totalAbove: streakData.totalAboveZeroMonths,
      projectedIncome: viewMode === 'quarterly' ? enhanced.projectedIncome * 3 : enhanced.projectedIncome,
      growthRate: enhanced.incomeGrowthRate,
    },
    1000,
    200
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const waterfallSteps = [
    {
      label: `Gross ${viewMode === 'monthly' ? 'Monthly' : 'Quarterly'} Income`,
      value: Math.round(animatedValues.gross),
      actualValue: baseValues.gross,
      type: 'positive' as const,
      icon: DollarSign,
      description: `Your total ${viewMode} income before deductions`
    },
    {
      label: 'Tax Owed',
      value: Math.round(animatedValues.tax),
      actualValue: baseValues.tax,
      type: 'negative' as const,
      icon: null,
      description: 'Federal and state taxes on your income'
    },
    {
      label: `Net After-Tax Income`,
      value: Math.round(animatedValues.net),
      actualValue: baseValues.net,
      type: 'milestone' as const,
      icon: Target,
      description: 'Your take-home pay after taxes'
    },
    {
      label: `${viewMode === 'monthly' ? 'Monthly' : 'Quarterly'} Living Expenses`,
      value: Math.round(animatedValues.expenses),
      actualValue: baseValues.expenses,
      type: 'negative' as const,
      icon: null,
      description: 'Essential costs and lifestyle spending'
    }
  ];

  return (
    <motion.div 
      ref={cardRef}
      className={`premium-card hover-lift animate-on-mount p-4 sm:p-6 lg:p-8`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Enhanced Header with Export and View Toggle */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800">
              Enhanced Income Clarity
            </h3>
            
            {/* Above Zero Months Badge */}
            <motion.div 
              className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full flex items-center space-x-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                Above zero for {enhanced.monthsAboveZero} months
              </span>
            </motion.div>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-500">
            Your complete financial waterfall analysis with enhanced insights
          </p>
        </div>
        
        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* View Mode Toggle */}
          <motion.button
            onClick={() => setViewMode(viewMode === 'monthly' ? 'quarterly' : 'monthly')}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {viewMode === 'monthly' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
            <span className="text-sm font-medium capitalize">{viewMode}</span>
          </motion.button>
          
          {/* Export Button */}
          <motion.button
            onClick={exportCard}
            className="p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-primary-600"
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
          </motion.button>
          
          <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg sm:rounded-xl">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Income Forecast Section */}
      <motion.div 
        className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUpIcon className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Income Forecast</h4>
          </div>
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-900">
              ${Math.round(animatedValues.projectedIncome).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">
              Projected next {viewMode} (+{animatedValues.growthRate.toFixed(1)}%)
            </div>
          </div>
          
          {/* Mini trend chart */}
          <div className="flex items-end space-x-1 h-8">
            {enhanced.incomeTrend.map((value, index) => {
              const height = (value / Math.max(...enhanced.incomeTrend)) * 100;
              return (
                <motion.div
                  key={index}
                  className="bg-blue-400 w-2 rounded-t"
                  style={{ height: `${height}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                />
              );
            })}
          </div>
        </div>
        
        <AnimatePresence>
          {showForecast && (
            <motion.div
              className="mt-4 p-3 bg-white rounded-lg border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Based on 6-month trend</span>
                  <span className="font-medium text-green-600">+{enhanced.incomeGrowthRate.toFixed(1)}% growth</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Confidence level</span>
                  <span className="font-medium">High (85%)</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tax Breakdown Expansion */}
      <motion.div 
        className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-900">Tax Breakdown by Type</h4>
          </div>
          <button
            onClick={() => setShowTaxBreakdown(!showTaxBreakdown)}
            className="p-1 hover:bg-amber-100 rounded transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-amber-600 transform transition-transform ${showTaxBreakdown ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {enhanced.taxBreakdownByType.map((breakdown, index) => (
            <motion.div
              key={breakdown.type}
              className="flex items-center space-x-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: breakdown.color }}
              />
              <span className="text-sm font-medium">{breakdown.percentage}%</span>
            </motion.div>
          ))}
        </div>
        
        <AnimatePresence>
          {showTaxBreakdown && (
            <motion.div
              className="mt-4 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {enhanced.taxBreakdownByType.map((breakdown, index) => (
                <motion.div
                  key={breakdown.type}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: breakdown.color }}
                    />
                    <div>
                      <div className="font-medium text-slate-800">{breakdown.label}</div>
                      <div className="text-xs text-slate-500">{breakdown.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-800">
                      ${breakdown.amount.toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-500">{breakdown.percentage}%</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* PROMINENT Zero Line Status - Most Important Metric */}
      <motion.div 
        className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 ${
          clarityData.aboveZeroLine 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100/50' 
            : clarityData.availableToReinvest === 0
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-yellow-100/50'
            : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-red-100/50'
        } shadow-lg`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <motion.div 
              className={`p-2 sm:p-3 rounded-full ${
                clarityData.aboveZeroLine 
                  ? 'bg-green-100 text-green-700' 
                  : clarityData.availableToReinvest === 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              } transition-all duration-300`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {clarityData.aboveZeroLine ? (
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : clarityData.availableToReinvest === 0 ? (
                <Target className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />
              )}
            </motion.div>
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
            <motion.div 
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
                clarityData.aboveZeroLine 
                  ? 'text-green-600' 
                  : clarityData.availableToReinvest === 0
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
              role="status" 
              aria-live="polite"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            >
              {clarityData.aboveZeroLine ? '+' : clarityData.availableToReinvest === 0 ? '±' : ''}${Math.round(Math.abs(animatedValues.available)).toLocaleString()}
            </motion.div>
            <div className={`text-sm sm:text-base font-semibold mt-1 ${
              clarityData.aboveZeroLine 
                ? 'text-green-600' 
                : clarityData.availableToReinvest === 0
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {viewMode === 'monthly' ? 'Monthly' : 'Quarterly'} {clarityData.aboveZeroLine 
                ? 'Surplus' 
                : clarityData.availableToReinvest === 0
                ? 'Break Even'
                : 'Deficit'
              }
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
            </div>
            <div className="flex items-center space-x-2">
              <motion.div 
                className={`text-2xl font-bold ${
                  stressData.level === 'low' ? 'text-green-600' :
                  stressData.level === 'moderate' ? 'text-yellow-600' :
                  'text-red-600'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {Math.round(animatedValues.stress)}
              </motion.div>
              <span className="text-slate-500 text-sm font-medium">/100</span>
            </div>
          </div>
          
          {/* Visual Progress Bar with Animation */}
          <div className="relative">
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <motion.div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  stressData.level === 'low' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  stressData.level === 'moderate' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                  'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(animatedValues.stress, 100)}%` }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />
            </div>
            {/* Stress level markers */}
            <div className="absolute top-0 left-[30%] w-0.5 h-3 bg-slate-300" />
            <div className="absolute top-0 left-[70%] w-0.5 h-3 bg-slate-300" />
          </div>
          
          {/* Supportive Message */}
          <motion.div 
            className={`p-3 rounded-lg border-l-4 ${
              stressData.level === 'low' ? 'bg-green-50 border-green-400 text-green-800' :
              stressData.level === 'moderate' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
              'bg-red-50 border-red-400 text-red-800'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {stressData.message}
            </p>
          </motion.div>
        </div>

        {/* Above Zero Streak Tracker */}
        <motion.div 
          className="mt-6 p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-prosperity-25 rounded-xl border border-slate-200 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
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
            <AnimatePresence>
              {showMilestoneAnimation && streakData.milestones.lastMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  onClick={triggerCelebration}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-prosperity-500 to-primary-500 text-white rounded-full text-sm font-bold shadow-lg">
                    <Award className="w-4 h-4" />
                    <span>{streakData.milestones.lastMilestone} MONTHS!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Current vs Longest Streak Display */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <motion.div 
                className={`text-3xl sm:text-4xl font-bold ${
                  streakData.currentStreak > 0 ? 'text-prosperity-600' : 'text-slate-500'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                {Math.round(animatedValues.currentStreak)}
              </motion.div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                Current Streak
              </div>
              <div className="text-xs text-slate-500">
                {streakData.currentStreak === 1 ? 'month' : 'months'}
              </div>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-3xl sm:text-4xl font-bold text-primary-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                {Math.round(animatedValues.longestStreak)}
              </motion.div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                Longest Streak
              </div>
              <div className="text-xs text-slate-500">
                {streakData.longestStreak === 1 ? 'month' : 'months'}
              </div>
            </div>
          </div>
          
          {/* 12-Month History Mini Chart with Enhanced Animation */}
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
                <motion.div
                  key={month.month}
                  className="group relative"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
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
                  
                  {/* Enhanced Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {formatMonthDisplay(month.month)}: {month.aboveZero ? '+' : ''}${month.surplus}
                    {month.milestoneReached && <div className="text-prosperity-300">🎉 Milestone!</div>}
                  </div>
                </motion.div>
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
              <motion.div 
                className={`flex items-center space-x-1 text-xs ${
                  streakData.milestones.threeMonths ? 'text-prosperity-600' : 'text-slate-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  streakData.milestones.threeMonths ? 'bg-prosperity-500' : 'bg-slate-300'
                }`} />
                <span>3 months</span>
              </motion.div>
              <motion.div 
                className={`flex items-center space-x-1 text-xs ${
                  streakData.milestones.sixMonths ? 'text-prosperity-600' : 'text-slate-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  streakData.milestones.sixMonths ? 'bg-prosperity-500' : 'bg-slate-300'
                }`} />
                <span>6 months</span>
              </motion.div>
              <motion.div 
                className={`flex items-center space-x-1 text-xs ${
                  streakData.milestones.twelveMonths ? 'text-prosperity-600' : 'text-slate-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                <div className={`w-2 h-2 rounded-full ${
                  streakData.milestones.twelveMonths ? 'bg-prosperity-500' : 'bg-slate-300'
                }`} />
                <span>12 months</span>
              </motion.div>
            </div>
          </div>
          
          {/* Encouragement Messages with Animation */}
          <AnimatePresence>
            {streakData.warningTriggered && (
              <motion.div 
                className="p-3 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 mb-3"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs sm:text-sm font-medium text-yellow-800">
                    {getWarningMessage(clarityData.availableToReinvest, streakData.currentStreak)}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Celebration or Encouragement Messages */}
          {streakData.currentStreak === 3 || streakData.currentStreak === 6 || streakData.currentStreak === 12 ? (
            <motion.div 
              className="p-3 rounded-lg border-l-4 border-prosperity-400 bg-prosperity-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-prosperity-600" />
                <p className="text-xs sm:text-sm font-medium text-prosperity-800">
                  {getMilestoneMessage(streakData.currentStreak)}
                </p>
              </div>
            </motion.div>
          ) : streakData.currentStreak > 0 ? (
            <motion.div 
              className="p-3 rounded-lg border-l-4 border-primary-400 bg-primary-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
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
            </motion.div>
          ) : (
            <motion.div 
              className="p-3 rounded-lg border-l-4 border-slate-400 bg-slate-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-slate-600" />
                <p className="text-xs sm:text-sm font-medium text-slate-700">
                  Get above zero this month to start your streak! Every journey begins with the first step.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Progress indicator showing financial health */}
        <div className="flex items-center justify-between text-xs sm:text-sm mt-4">
          <span className="font-medium text-slate-600">
            Financial Status
          </span>
          <motion.div 
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              clarityData.aboveZeroLine 
                ? 'bg-green-100 text-green-800' 
                : clarityData.availableToReinvest === 0
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {clarityData.aboveZeroLine 
              ? 'WEALTH BUILDING' 
              : clarityData.availableToReinvest === 0
              ? 'STABLE'
              : 'NEEDS ATTENTION'
            }
          </motion.div>
        </div>
      </motion.div>
      
      {/* Enhanced waterfall visualization with improved animations */}
      <div className="waterfall-container space-y-4 sm:space-y-6">
        {waterfallSteps.map((step, index) => (
          <motion.div 
            key={step.label}
            className={`waterfall-step ${step.type} group relative transition-all duration-500 ease-premium waterfall-optimized`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Enhanced flowing connector with professional waterfall animation */}
            {index < waterfallSteps.length - 1 && (
              <>
                {/* Main waterfall flow line */}
                <motion.div 
                  className={`waterfall-flow-line ${step.type}`}
                  data-theme={currentTheme.id}
                  initial={animationsEnabled ? { height: 0, opacity: 0 } : { height: '100%', opacity: 1 }}
                  animate={animationsEnabled ? { height: '100%', opacity: 1 } : { height: '100%', opacity: 1 }}
                  transition={animationsEnabled ? { 
                    delay: 0.3 + index * 0.3,
                    duration: 0.8,
                    ease: "easeInOut"
                  } : { duration: 0 }}
                  style={{
                    position: 'absolute',
                    bottom: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: step.type === 'milestone' ? '6px' : '3px',
                    height: '24px',
                    borderRadius: '3px',
                    zIndex: 10
                  }}
                />
                
                {/* Animated money drops */}
                {animationsEnabled && (
                  <>
                    <motion.div 
                      className="money-drop-enhanced"
                      initial={{ opacity: 0, scale: 0, y: -20 }}
                      animate={{ 
                        opacity: [0, 0.8, 0.6, 0.4, 0],
                        scale: [0, 1.2, 1, 0.8, 0.3],
                        y: [-20, -10, 0, 15, 30]
                      }}
                      transition={{
                        delay: 0.8 + index * 0.3,
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1.5
                      }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '48%',
                        transform: 'translateX(-50%)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: step.type === 'positive' ? 'radial-gradient(circle, rgba(34, 197, 94, 0.9) 0%, rgba(34, 197, 94, 0.3) 70%)' :
                                   step.type === 'negative' ? 'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(239, 68, 68, 0.3) 70%)' :
                                   step.type === 'milestone' ? 'radial-gradient(circle, rgba(168, 85, 247, 0.9) 0%, rgba(168, 85, 247, 0.3) 70%)' :
                                   'radial-gradient(circle, rgba(59, 130, 246, 0.9) 0%, rgba(59, 130, 246, 0.3) 70%)',
                        boxShadow: step.type === 'positive' ? '0 0 12px rgba(34, 197, 94, 0.4)' :
                                  step.type === 'negative' ? '0 0 12px rgba(239, 68, 68, 0.4)' :
                                  step.type === 'milestone' ? '0 0 12px rgba(168, 85, 247, 0.4)' :
                                  '0 0 12px rgba(59, 130, 246, 0.4)',
                        pointerEvents: 'none',
                        zIndex: 11
                      }}
                    />
                    
                    {/* Secondary money particles for visual richness */}
                    <motion.div 
                      className="money-particle-secondary"
                      initial={{ opacity: 0, scale: 0, y: -15, x: -5 }}
                      animate={{ 
                        opacity: [0, 0.6, 0.4, 0.2, 0],
                        scale: [0, 0.8, 0.6, 0.4, 0.1],
                        y: [-15, -5, 5, 20, 35],
                        x: [-5, -2, 2, 5, 8]
                      }}
                      transition={{
                        delay: 1.2 + index * 0.3,
                        duration: 2.2,
                        repeat: Infinity,
                        repeatDelay: 1.8
                      }}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '52%',
                        transform: 'translateX(-50%)',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: step.type === 'positive' ? 'radial-gradient(circle, rgba(34, 197, 94, 0.7) 0%, rgba(34, 197, 94, 0.2) 70%)' :
                                   step.type === 'negative' ? 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 0%, rgba(239, 68, 68, 0.2) 70%)' :
                                   step.type === 'milestone' ? 'radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, rgba(168, 85, 247, 0.2) 70%)' :
                                   'radial-gradient(circle, rgba(59, 130, 246, 0.7) 0%, rgba(59, 130, 246, 0.2) 70%)',
                        pointerEvents: 'none',
                        zIndex: 9
                      }}
                    />
                  </>
                )}
              </>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-300 touch-friendly">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-0">
                {step.icon && (
                  <motion.div 
                    className={`p-1.5 sm:p-2 rounded-lg ${
                      step.type === 'positive' ? 'bg-prosperity-50 text-prosperity-600' :
                      step.type === 'milestone' ? 'bg-primary-50 text-primary-600' :
                      'bg-slate-50 text-slate-600'
                    }`}
                    whileHover={{ rotate: 5 }}
                  >
                    <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm sm:text-base font-medium ${
                      step.type === 'milestone' ? 'text-slate-800 sm:text-lg' : 'text-slate-700'
                    }`}>
                      {step.label}
                    </span>
                    {step.type === 'milestone' && (
                      <motion.div 
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-600 transition-colors leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <motion.div 
                  className={`currency-display font-semibold text-lg sm:text-xl currency-animated ${
                    step.type === 'positive' ? 'text-prosperity-600' :
                    step.type === 'negative' ? 'text-alert-600' :
                    step.type === 'milestone' ? 'text-primary-600' :
                    'text-slate-800'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                >
                  {step.type === 'negative' ? '-' : ''}${step.value.toLocaleString()}
                  {step.type === 'negative' && (
                    <motion.div
                      className="inline-block ml-1"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Droplets className="w-3 h-3 text-red-500" />
                    </motion.div>
                  )}
                </motion.div>
                {step.value !== step.actualValue && (
                  <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
                    <motion.div 
                      className="h-1 bg-gradient-to-r from-primary-500 to-prosperity-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(step.value / step.actualValue) * 100}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Enhanced Available to Reinvest section */}
        <motion.div 
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
            clarityData.aboveZeroLine 
              ? 'bg-gradient-to-br from-prosperity-50 via-prosperity-25 to-white border-2 border-prosperity-200' 
              : 'bg-gradient-to-br from-alert-50 via-alert-25 to-white border-2 border-alert-200'
          } achievement-glow ${clarityData.aboveZeroLine ? 'achieved' : ''}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          
          {/* Enhanced background pattern with shimmer */}
          <div className="absolute inset-0 opacity-5">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <motion.div 
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                    clarityData.aboveZeroLine 
                      ? 'bg-prosperity-100 text-prosperity-700' 
                      : 'bg-alert-100 text-alert-700'
                  }`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {clarityData.aboveZeroLine ? (
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </motion.div>
                <div>
                  <h4 className="font-display font-semibold text-base sm:text-lg text-slate-800">
                    Available to Reinvest
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {clarityData.aboveZeroLine 
                      ? 'Your wealth-building power' 
                      : `${viewMode} budget gap to address`
                    }
                  </p>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <motion.div 
                  className={`currency-display font-bold text-2xl sm:text-3xl currency-animated ${
                    clarityData.aboveZeroLine 
                      ? 'text-gradient-prosperity' 
                      : 'text-gradient-alert'
                  }`}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                >
                  {clarityData.aboveZeroLine ? '+' : '-'}${Math.round(animatedValues.available).toLocaleString()}
                </motion.div>
                <div className={`text-xs sm:text-sm font-medium mt-1 ${
                  clarityData.aboveZeroLine ? 'text-prosperity-600' : 'text-alert-600'
                }`}>
                  {clarityData.aboveZeroLine ? 'Above Zero Line' : 'Below Zero Line'}
                </div>
              </div>
            </div>
            
            {/* Enhanced status indicator with improved animations */}
            <motion.div 
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
                clarityData.aboveZeroLine 
                  ? 'bg-prosperity-100/50 border border-prosperity-200' 
                  : 'bg-alert-100/50 border border-alert-200'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <motion.div 
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    clarityData.aboveZeroLine ? 'bg-prosperity-500' : 'bg-alert-500'
                  }`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className={`text-sm font-medium ${
                  clarityData.aboveZeroLine ? 'text-prosperity-700' : 'text-alert-700'
                }`}>
                  {clarityData.aboveZeroLine 
                    ? `Building wealth every ${viewMode.slice(0, -2)}` 
                    : 'Opportunity for optimization'
                  }
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {clarityData.aboveZeroLine && (
                  <motion.div 
                    className="text-xs font-medium text-prosperity-600 bg-prosperity-50 px-2 sm:px-3 py-1 rounded-full text-center sm:text-left"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    ${Math.round((clarityData.availableToReinvest * (viewMode === 'quarterly' ? 4 : 12))).toLocaleString()}/year potential
                  </motion.div>
                )}
                <ShareButton
                  shareType="income-status"
                  shareData={generateShareContent('income-status', { clarityData })}
                  variant="ghost"
                  size="sm"
                  className={clarityData.aboveZeroLine ? 'text-prosperity-600 hover:text-prosperity-700 hover:bg-prosperity-50' : 'text-slate-600 hover:text-slate-700 hover:bg-slate-100'}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Enhanced progress visualization */}
      {clarityData.aboveZeroLine && (
        <motion.div 
          className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-primary-50 rounded-lg sm:rounded-xl border border-slate-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm mb-2">
            <span className="font-medium text-slate-700 mb-1 sm:mb-0">
              {viewMode === 'monthly' ? 'Monthly' : 'Quarterly'} Investment Power
            </span>
            <span className="font-semibold text-primary-600 text-center sm:text-right">
              {((clarityData.availableToReinvest / Math.max(clarityData.grossMonthly, 1)) * 100).toFixed(1)}% of gross
            </span>
          </div>
          <div className="progress-bar-premium">
            <motion.div 
              className="progress-fill bg-gradient-to-r from-prosperity-500 to-primary-500"
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min((clarityData.availableToReinvest / Math.max(clarityData.grossMonthly, 1)) * 100, 100)}%`
              }}
              transition={{ delay: 1.7, duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const EnhancedIncomeClarityCard = memo(EnhancedIncomeClarityCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.clarityData.grossMonthly === nextProps.clarityData.grossMonthly &&
    prevProps.clarityData.taxOwed === nextProps.clarityData.taxOwed &&
    prevProps.clarityData.netMonthly === nextProps.clarityData.netMonthly &&
    prevProps.clarityData.monthlyExpenses === nextProps.clarityData.monthlyExpenses &&
    prevProps.clarityData.availableToReinvest === nextProps.clarityData.availableToReinvest &&
    prevProps.clarityData.aboveZeroLine === nextProps.clarityData.aboveZeroLine
  );
});