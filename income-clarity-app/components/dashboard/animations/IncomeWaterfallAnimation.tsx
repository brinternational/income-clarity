'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
  Receipt,
  Target,
  AlertCircle
} from 'lucide-react';
import { IncomeClarityResult } from '@/types';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';

type IncomeViewMode = 'monthly' | 'annual';

interface IncomeWaterfallAnimationProps {
  data: IncomeClarityResult;
  isVisible?: boolean;
  className?: string;
  showMobileVersion?: boolean;
  viewMode?: IncomeViewMode;
}

interface WaterfallStage {
  id: string;
  label: string;
  amount: number;
  type: 'income' | 'deduction' | 'result' | 'final';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  bgColor: string;
}

const IncomeWaterfallAnimation = ({
  data,
  isVisible = true,
  className = '',
  showMobileVersion = false,
  viewMode = 'monthly'
}: IncomeWaterfallAnimationProps) => {
  const [animationStarted, setAnimationStarted] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Calculate federal and state tax breakdown from total tax
  const federalTax = useMemo(() => {
    // Estimate: typically 70% federal, 30% state for combined tax
    return Math.round(data.taxOwed * 0.7);
  }, [data.taxOwed]);

  const stateTax = useMemo(() => {
    return data.taxOwed - federalTax;
  }, [data.taxOwed, federalTax]);

  // Define waterfall stages
  const stages: WaterfallStage[] = useMemo(() => [
    {
      id: 'gross',
      label: viewMode === 'annual' ? 'Gross Annual Income' : 'Gross Monthly Income',
      amount: formatIncomeValue(data.grossMonthly).value,
      type: 'income',
      icon: DollarSign,
      description: `Your total dividend income before taxes (${formatIncomeValue(data.grossMonthly).suffix})`,
      color: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    {
      id: 'federal-tax',
      label: viewMode === 'annual' ? 'Federal Tax (Annual)' : 'Federal Tax',
      amount: -formatIncomeValue(federalTax).value,
      type: 'deduction',
      icon: Receipt,
      description: `Federal taxes on dividend income (${formatIncomeValue(federalTax).suffix})`,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'state-tax',
      label: viewMode === 'annual' ? 'State Tax (Annual)' : 'State Tax',
      amount: -formatIncomeValue(stateTax).value,
      type: 'deduction',
      icon: AlertCircle,
      description: `State taxes - varies by location (${formatIncomeValue(stateTax).suffix})`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'net',
      label: viewMode === 'annual' ? 'Net Annual Income' : 'Net Income',
      amount: formatIncomeValue(data.netMonthly).value,
      type: 'result',
      icon: Wallet,
      description: `Your income after all taxes (${formatIncomeValue(data.netMonthly).suffix})`,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'expenses',
      label: viewMode === 'annual' ? 'Annual Expenses' : 'Monthly Expenses',
      amount: -formatIncomeValue(data.monthlyExpenses).value,
      type: 'deduction',
      icon: TrendingDown,
      description: `Your fixed living expenses (${formatIncomeValue(data.monthlyExpenses).suffix})`,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'available',
      label: 'Available to Reinvest',
      amount: formatIncomeValue(data.availableToReinvest).value,
      type: 'final',
      icon: Target,
      description: `Money left for growing your portfolio (${formatIncomeValue(data.availableToReinvest).suffix})`,
      color: data.availableToReinvest >= 0 ? 'text-green-700' : 'text-red-700',
      bgColor: data.availableToReinvest >= 0 ? 'bg-green-50' : 'bg-red-50'
    }
  ], [data, federalTax, stateTax, viewMode, formatIncomeValue]);

  // Animate numbers for each stage
  const animatedNumbers = useStaggeredCountingAnimation(
    stages.reduce((acc, stage, index) => ({
      ...acc,
      [stage.id]: Math.abs(stage.amount)
    }), {}),
    1500, // 1.5 second duration per stage
    300   // 300ms stagger delay
  );

  // Start animation when visible
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimationStarted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Progressive stage highlighting
  useEffect(() => {
    if (!animationStarted) return;

    let timeouts: NodeJS.Timeout[] = [];

    stages.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setActiveStage(index);
      }, index * 400 + 200); // 400ms between stages, 200ms initial delay

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [animationStarted, stages]);

  // Respect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const animationDuration = prefersReducedMotion ? 0.1 : 0.6;
  const staggerDelay = prefersReducedMotion ? 0.05 : 0.2;

  // Flow line component
  const FlowLine = ({ 
    isActive, 
    type, 
    delay = 0 
  }: { 
    isActive: boolean; 
    type: 'positive' | 'negative';
    delay?: number;
  }) => (
    <div className="flex justify-center my-2">
      <motion.div
        className={`w-1 rounded-full ${
          type === 'positive' ? 'bg-green-400' : 'bg-red-400'
        }`}
        initial={{ height: 0, opacity: 0 }}
        animate={isActive ? { 
          height: showMobileVersion ? 20 : 32, 
          opacity: 1 
        } : { height: 0, opacity: 0 }}
        transition={{ 
          duration: prefersReducedMotion ? 0.1 : 0.8, 
          delay: delay,
          ease: "easeOut"
        }}
      />
    </div>
  );

  // Stage component
  const StageCard = ({ 
    stage, 
    index, 
    isActive 
  }: { 
    stage: WaterfallStage; 
    index: number; 
    isActive: boolean;
  }) => {
    const Icon = stage.icon;
    const animatedValue = animatedNumbers[stage.id] || 0;
    const displayValue = animationStarted ? animatedValue : 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: isActive ? 1.05 : 1,
        }}
        transition={{ 
          duration: animationDuration,
          delay: index * staggerDelay,
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
        className={`relative p-4 rounded-xl border-2 transition-all duration-500 ${
          isActive 
            ? `${stage.bgColor} ${stage.color} border-current shadow-lg ring-4 ring-opacity-30 ring-current` 
            : 'bg-white border-slate-200 text-muted-foreground'
        } ${showMobileVersion ? 'p-3' : 'p-4'}`}
      >
        {/* Glow effect for active stage */}
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-xl ${stage.bgColor} opacity-30`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ 
              duration: prefersReducedMotion ? 0.1 : 2,
              repeat: prefersReducedMotion ? 0 : Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isActive ? 'bg-white/20' : 'bg-slate-100'
              }`}>
                <Icon className={`${showMobileVersion ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </div>
              <div>
                <h4 className={`font-semibold ${
                  showMobileVersion ? 'text-sm' : 'text-base'
                }`}>
                  {stage.label}
                </h4>
                <p className={`text-xs opacity-80 ${
                  showMobileVersion ? 'hidden' : 'block'
                }`}>
                  {stage.description}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <motion.div
              className={`font-bold ${
                showMobileVersion ? 'text-xl' : 'text-2xl'
              } ${stage.color}`}
              animate={isActive && !prefersReducedMotion ? { 
                scale: [1, 1.1, 1] 
              } : {}}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              {stage.amount < 0 ? '-' : '+'}${Math.round(displayValue).toLocaleString()}
            </motion.div>
            <div className={`text-xs opacity-70 ${
              showMobileVersion ? 'text-xs' : 'text-sm'
            }`}>
              per month
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`waterfall-animation ${className}`}
    >
      <div className="space-y-1">
        {stages.map((stage, index) => (
          <div key={stage.id}>
            <StageCard
              stage={stage}
              index={index}
              isActive={activeStage >= index && animationStarted}
            />
            
            {/* Flow line between stages */}
            {index < stages.length - 1 && (
              <FlowLine
                isActive={activeStage > index && animationStarted}
                type={stages[index + 1].amount < 0 ? 'negative' : 'positive'}
                delay={index * staggerDelay + 0.3}
              />
            )}
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: stages.length * staggerDelay + 1,
          duration: animationDuration 
        }}
        className={`mt-6 p-4 rounded-xl text-center ${
          data.availableToReinvest >= 0
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200'
        } ${showMobileVersion ? 'mt-4 p-3' : 'mt-6 p-4'}`}
      >
        <div className={`font-semibold ${
          data.availableToReinvest >= 0 ? 'text-green-700' : 'text-red-700'
        } ${showMobileVersion ? 'text-sm' : 'text-base'}`}>
          {data.availableToReinvest >= 0 
            ? '🎯 You\'re building wealth every month!' 
            : '⚠️ Focus on optimization to reach positive cash flow'
          }
        </div>
        <div className={`text-xs mt-1 opacity-80 ${
          data.availableToReinvest >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          Annual impact: {data.availableToReinvest >= 0 ? '+' : '-'}${Math.abs(Math.round(data.availableToReinvest * 12)).toLocaleString()}
        </div>
      </motion.div>
    </div>
  );
};

export default IncomeWaterfallAnimation;