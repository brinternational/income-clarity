'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp,
  Target,
  Coins,
  PiggyBank,
  Calculator,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { MobileCardLayout } from '@/components/mobile/MobileCardLayout';
import { useMobileCardLayout } from '@/hooks/useMobileCardLayout';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { TouchFeedback } from '@/components/mobile/TouchFeedback';
import { logger } from '@/lib/logger'

interface MobileIncomeIntelligenceHubProps {
  clarityData?: {
    grossMonthly: number;
    taxOwed: number;
    netMonthly: number;
    monthlyExpenses: number;
    availableToReinvest: number;
    aboveZeroLine: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

/**
 * MobileIncomeIntelligenceHub - Mobile-optimized income analysis
 * 
 * Features:
 * - Collapsible sections for income breakdown
 * - Sticky header with key metrics
 * - Clear zero-line status indication
 * - Investment recommendations
 * - Tax optimization insights
 */
export const MobileIncomeIntelligenceHub: React.FC<MobileIncomeIntelligenceHubProps> = ({
  clarityData,
  isLoading = false,
  className = ''
}) => {
  // Use mobile card layout management
  const {
    toggleSection,
    initializeSection,
    isSectionCollapsed,
    compactMode
  } = useMobileCardLayout({
    cardId: 'income-intelligence-hub',
    persistState: true,
    defaultCompactMode: false,
    autoCollapseOnScroll: true,
    scrollThreshold: 150
  });

  // Initialize sections on mount
  React.useEffect(() => {
    initializeSection('zero-line-status', false, 'high');
    initializeSection('income-breakdown', false, 'high');
    initializeSection('tax-analysis', true, 'medium');
    initializeSection('reinvestment-capacity', true, 'medium');
    initializeSection('optimization-tips', true, 'low');
  }, [initializeSection]);

  // Default data if none provided
  const data = clarityData || {
    grossMonthly: 4500,
    taxOwed: 675,
    netMonthly: 3825,
    monthlyExpenses: 3200,
    availableToReinvest: 625,
    aboveZeroLine: true
  };

  // Animated values
  const animatedValues = useStaggeredCountingAnimation(
    {
      grossMonthly: data.grossMonthly,
      netMonthly: data.netMonthly,
      taxOwed: data.taxOwed,
      monthlyExpenses: data.monthlyExpenses,
      availableToReinvest: data.availableToReinvest
    },
    1200,
    100
  );

  // Calculate key metrics
  const metrics = useMemo(() => {
    const taxRate = (data.taxOwed / data.grossMonthly) * 100;
    const expenseRatio = (data.monthlyExpenses / data.netMonthly) * 100;
    const reinvestmentRate = (data.availableToReinvest / data.netMonthly) * 100;
    const monthlyDeficitSurplus = data.netMonthly - data.monthlyExpenses;
    const annualReinvestmentCapacity = data.availableToReinvest * 12;

    return {
      taxRate,
      expenseRatio,
      reinvestmentRate,
      monthlyDeficitSurplus,
      annualReinvestmentCapacity
    };
  }, [data]);

  // Generate optimization recommendations
  const optimizationTips = useMemo(() => {
    const tips = [];

    if (metrics.taxRate > 25) {
      tips.push({
        type: 'tax-optimization',
        title: 'High Tax Burden',
        description: `Your effective tax rate is ${metrics.taxRate.toFixed(1)}%. Consider tax-advantaged accounts.`,
        action: 'Explore Tax Strategies',
        priority: 'high',
        icon: Calculator
      });
    }

    if (metrics.reinvestmentRate < 10) {
      tips.push({
        type: 'reinvestment',
        title: 'Low Reinvestment Rate',
        description: `Only ${metrics.reinvestmentRate.toFixed(1)}% of net income available for reinvestment.`,
        action: 'Review Expenses',
        priority: 'medium',
        icon: PiggyBank
      });
    } else if (metrics.reinvestmentRate > 20) {
      tips.push({
        type: 'opportunity',
        title: 'Strong Savings Rate',
        description: `${metrics.reinvestmentRate.toFixed(1)}% reinvestment rate is excellent. Consider growth investments.`,
        action: 'Accelerate Growth',
        priority: 'positive',
        icon: TrendingUp
      });
    }

    if (metrics.expenseRatio > 80) {
      tips.push({
        type: 'expense-management',
        title: 'High Expense Ratio',
        description: `Expenses consume ${metrics.expenseRatio.toFixed(1)}% of net income. Look for optimization opportunities.`,
        action: 'Analyze Expenses',
        priority: 'medium',
        icon: Target
      });
    }

    return tips.slice(0, 3); // Limit to top 3 tips
  }, [metrics]);

  // Zero Line Status Section
  const zeroLineStatusContent = (
    <div className="space-y-4">
      {/* Main Status Display */}
      <div className={`text-center p-6 rounded-xl border-2 ${
        data.aboveZeroLine 
          ? 'bg-gradient-to-br from-green-50 to-emerald-25 border-green-200' 
          : 'bg-gradient-to-br from-red-50 to-rose-25 border-red-200'
      }`}>
        <motion.div 
          className={`inline-flex p-4 rounded-xl mb-4 ${
            data.aboveZeroLine
              ? 'bg-gradient-to-br from-green-100 to-green-50'
              : 'bg-gradient-to-br from-red-100 to-red-50'
          }`}
          whileHover={{ scale: 1.05 }}
        >
          {data.aboveZeroLine ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-red-600" />
          )}
        </motion.div>
        
        <div className={`text-3xl font-bold mb-2 ${
          data.aboveZeroLine ? 'text-green-600' : 'text-red-600'
        }`}>
          {data.aboveZeroLine ? 'Above' : 'Below'} Zero Line
        </div>
        
        <p className="text-gray-600 text-lg mb-4">
          {data.aboveZeroLine 
            ? 'Income exceeds expenses' 
            : 'Expenses exceed income'
          }
        </p>
        
        <div className={`text-2xl font-bold ${
          data.aboveZeroLine ? 'text-green-600' : 'text-red-600'
        }`}>
          {data.aboveZeroLine ? '+' : ''}${Math.abs(animatedValues.availableToReinvest).toLocaleString()}
        </div>
        
        <p className="text-gray-600 text-base mt-2">
          {data.aboveZeroLine ? 'Available to reinvest' : 'Monthly deficit'}
        </p>
      </div>

      {/* Key Metric */}
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-2xl font-bold text-blue-600 mb-2">
          ${animatedValues.netMonthly.toLocaleString()}
        </div>
        <p className="text-gray-600 text-base">Monthly Net Income</p>
      </div>
    </div>
  );

  // Income Breakdown Section
  const incomeBreakdownContent = (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Gross Income */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900 text-base">Gross Monthly</span>
          </div>
          <div className="font-bold text-gray-900 text-lg">
            ${animatedValues.grossMonthly.toLocaleString()}
          </div>
        </div>

        {/* Tax Deduction */}
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Calculator className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-900 text-base">Tax Owed</span>
          </div>
          <div className="font-bold text-red-600 text-lg">
            -${animatedValues.taxOwed.toLocaleString()}
          </div>
        </div>

        {/* Net Income */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <Coins className="w-5 h-5 text-green-600" />
            <span className="font-bold text-gray-900 text-base">Net Income</span>
          </div>
          <div className="font-bold text-green-600 text-lg">
            ${animatedValues.netMonthly.toLocaleString()}
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-900 text-base">Monthly Expenses</span>
          </div>
          <div className="font-bold text-amber-600 text-lg">
            -${animatedValues.monthlyExpenses.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Income Allocation</p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-500 h-3 rounded-l-full"
            style={{ width: `${(data.netMonthly / data.grossMonthly) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>After Tax: {((data.netMonthly / data.grossMonthly) * 100).toFixed(1)}%</span>
          <span>Tax Rate: {metrics.taxRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );

  // Tax Analysis Section
  const taxAnalysisContent = (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-bold text-gray-900 text-lg mb-3">Tax Efficiency</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 text-base">Effective Tax Rate</span>
            <span className="font-bold text-blue-600 text-lg">{metrics.taxRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 text-base">Annual Tax Burden</span>
            <span className="font-bold text-blue-600 text-lg">${(data.taxOwed * 12).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h4 className="font-bold text-gray-900 text-lg mb-2">Tax Optimization Opportunity</h4>
        <p className="text-gray-700 text-base">
          {metrics.taxRate > 25 
            ? 'Your tax rate is above average. Consider tax-advantaged investment accounts.'
            : 'Your tax efficiency looks good. Continue current strategy.'
          }
        </p>
      </div>
    </div>
  );

  // Reinvestment Capacity Section
  const reinvestmentCapacityContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600 mb-2">
            ${animatedValues.availableToReinvest.toLocaleString()}
          </div>
          <p className="text-gray-600 text-base">Monthly Available</p>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            ${metrics.annualReinvestmentCapacity.toLocaleString()}
          </div>
          <p className="text-gray-600 text-base">Annual Capacity</p>
        </div>
      </div>

      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="font-bold text-gray-900 text-lg mb-3">Reinvestment Rate</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700 text-base">Savings Rate</span>
          <span className="font-bold text-purple-600 text-lg">{metrics.reinvestmentRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full"
            style={{ width: `${Math.min(metrics.reinvestmentRate, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Target: 15-20% for strong wealth building
        </p>
      </div>
    </div>
  );

  // Optimization Tips Section
  const optimizationTipsContent = optimizationTips.length > 0 ? (
    <div className="space-y-3">
      {optimizationTips.map((tip, index) => {
        const Icon = tip.icon;
        return (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              tip.priority === 'high' 
                ? 'bg-red-50 border-red-500' 
                : tip.priority === 'positive'
                ? 'bg-green-50 border-green-500'
                : 'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex items-start space-x-3">
              <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${
                tip.priority === 'high'
                  ? 'text-red-600'
                  : tip.priority === 'positive'
                  ? 'text-green-600'
                  : 'text-blue-600'
              }`} />
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-gray-900 text-base mb-2">{tip.title}</h5>
                <p className="text-gray-700 text-base mb-3">{tip.description}</p>
                
                <TouchFeedback
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 min-h-[44px]"
                  onClick={() => {}}
                >
                  <span className="font-medium text-base text-gray-700">{tip.action}</span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </TouchFeedback>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-gray-500 text-base text-center py-8">Your income strategy looks optimized!</p>
  );

  const sections = [
    {
      id: 'zero-line-status',
      title: 'Zero Line Status',
      content: zeroLineStatusContent,
      isCollapsible: false,
      priority: 'high' as const
    },
    {
      id: 'income-breakdown',
      title: 'Income Breakdown',
      content: incomeBreakdownContent,
      isCollapsible: true,
      defaultCollapsed: false,
      priority: 'high' as const
    },
    {
      id: 'tax-analysis',
      title: 'Tax Analysis',
      content: taxAnalysisContent,
      isCollapsible: true,
      defaultCollapsed: true,
      priority: 'medium' as const
    },
    {
      id: 'reinvestment-capacity',
      title: 'Reinvestment Capacity',
      content: reinvestmentCapacityContent,
      isCollapsible: true,
      defaultCollapsed: true,
      priority: 'medium' as const
    },
    {
      id: 'optimization-tips',
      title: 'Optimization Tips',
      content: optimizationTipsContent,
      isCollapsible: true,
      defaultCollapsed: true,
      priority: 'low' as const
    }
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <MobileCardLayout
      title="Income Intelligence"
      subtitle="Dividend Income Analysis"
      icon={DollarSign}
      sections={sections}
      className={className}
      onSectionToggle={(sectionId, isCollapsed) => {
        // logger.log(`Section ${sectionId} ${isCollapsed ? 'collapsed' : 'expanded'}`);
      }}
      enableStickyHeader={true}
      compactMode={compactMode}
      showSectionCount={true}
    />
  );
};

export default MobileIncomeIntelligenceHub;