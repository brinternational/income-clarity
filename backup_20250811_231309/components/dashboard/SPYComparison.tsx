'use client';

import { useState, useEffect, memo } from 'react';
import { TrendingUp, TrendingDown, Zap, Award, Target, BarChart3, Activity, Calendar } from 'lucide-react';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import ShareButton from '@/components/shared/ShareButton';
import { generateShareContent } from '@/utils/shareContent';
import { SkeletonSPYComparison } from '@/components/ui/skeletons';

type TimePeriod = '1M' | '3M' | '6M' | '1Y';

interface TimePeriodData {
  portfolioReturn: number;
  spyReturn: number;
  outperformance: number;
}

interface SPYComparisonProps {
  portfolioReturn: number;
  spyReturn: number;
  outperformance: number;
  isLoading?: boolean;
  // Optional time period data for different periods
  timePeriodData?: {
    [key in TimePeriod]: TimePeriodData;
  };
}

const SPYComparisonComponent = ({ portfolioReturn, spyReturn, outperformance, isLoading = false, timePeriodData }: SPYComparisonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y'); // Default to YTD/1Y
  
  // Show skeleton if loading
  if (isLoading) {
    return <SkeletonSPYComparison />;
  }
  
  // Get current period data (use props as fallback for 1Y)
  const getCurrentPeriodData = (): TimePeriodData => {
    if (timePeriodData && selectedPeriod !== '1Y') {
      return timePeriodData[selectedPeriod];
    }
    return { portfolioReturn, spyReturn, outperformance };
  };

  const currentData = getCurrentPeriodData();
  const isBeating = currentData.outperformance > 0;
  const performanceLevel = Math.abs(currentData.outperformance);
  const isSignificantOutperformance = performanceLevel > 0.05; // 5%

  // Use optimized animation system with current period data
  const animatedValues = useStaggeredCountingAnimation(
    {
      portfolio: currentData.portfolioReturn * 100,
      spy: currentData.spyReturn * 100,
      outperformance: currentData.outperformance * 100,
    },
    1200,
    200
  );

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Generate simple performance visualization data (memoized)
  const chartBars = {
    portfolioHeight: Math.abs(animatedValues.portfolio) * 2.5 + 10,
    spyHeight: Math.abs(animatedValues.spy) * 2.5 + 10,
  };

  // Time period labels and descriptions
  const periodLabels = {
    '1M': { label: '1M', description: '1 Month' },
    '3M': { label: '3M', description: '3 Months' },
    '6M': { label: '6M', description: '6 Months' },
    '1Y': { label: '1Y', description: 'Year-to-Date' }
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  return (
    <div className={`premium-card hover-lift animate-on-mount p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Mobile-optimized header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Portfolio Performance
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Your strategy vs SPY benchmark
          </p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${
          isBeating 
            ? 'bg-gradient-to-br from-prosperity-50 to-prosperity-100' 
            : 'bg-gradient-to-br from-wealth-50 to-wealth-100'
        }`}>
          {isBeating ? (
            <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-prosperity-600" />
          ) : (
            <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-wealth-600" />
          )}
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Time Period</span>
          </div>
        </div>
        
        {/* Button Group - Mobile-first responsive design */}
        <div 
          className="flex bg-slate-50 rounded-lg p-1 gap-1 touch-friendly" 
          role="tablist" 
          aria-label="Select time period for performance comparison"
        >
          {(['1M', '3M', '6M', '1Y'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              role="tab"
              aria-selected={selectedPeriod === period}
              aria-controls="performance-chart"
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 touch-friendly focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                selectedPeriod === period
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
              onClick={() => handlePeriodChange(period)}
            >
              <span className="block text-center">
                <div className="font-semibold">{periodLabels[period].label}</div>
                <div className={`text-xs ${
                  selectedPeriod === period ? 'text-primary-100' : 'text-slate-500'
                }`}>
                  {period === '1Y' ? 'YTD' : periodLabels[period].description.split(' ')[0]}
                </div>
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Mobile-optimized performance metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Your Portfolio Performance */}
        <div className="relative p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-sm transition-all duration-300 touch-friendly">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-sm" />
              <span className="text-sm sm:text-base font-medium text-slate-700">Your Strategy</span>
            </div>
            <div className="p-1 sm:p-1.5 bg-primary-50 rounded-lg">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <div className="currency-display font-bold text-xl sm:text-2xl text-primary-600 animate-currency">
              {animatedValues.portfolio >= 0 ? '+' : ''}{animatedValues.portfolio.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1">
              {portfolioReturn >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-prosperity-600" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-alert-600" />
              )}
            </div>
          </div>
          
          <div className="mt-2 sm:mt-3 text-xs text-slate-500 font-medium">
            {periodLabels[selectedPeriod].description} performance
          </div>
        </div>
        
        {/* SPY Benchmark */}
        <div className="relative p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-100 hover:border-wealth-200 hover:shadow-sm transition-all duration-300 touch-friendly">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-wealth-500 to-wealth-600 rounded-full shadow-sm" />
              <span className="text-sm sm:text-base font-medium text-slate-700">SPY Benchmark</span>
            </div>
            <div className="p-1 sm:p-1.5 bg-wealth-50 rounded-lg">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-wealth-600" />
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <div className="currency-display font-bold text-xl sm:text-2xl text-wealth-600 animate-currency">
              {animatedValues.spy >= 0 ? '+' : ''}{animatedValues.spy.toFixed(1)}%
            </div>
            <div className="flex items-center space-x-1">
              {spyReturn >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-prosperity-600" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-alert-600" />
              )}
            </div>
          </div>
          
          <div className="mt-2 sm:mt-3 text-xs text-slate-500 font-medium">
            S&P 500 market performance
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized performance comparison visualization */}
      <div className="mb-6 sm:mb-8" id="performance-chart">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h4 className="text-sm sm:text-base font-display font-semibold text-slate-800">Performance Comparison</h4>
          <div className="text-xs sm:text-sm font-medium text-slate-600">
            Live Data
          </div>
        </div>
        
        {/* Mobile-friendly visual comparison chart */}
        <div className="relative h-24 sm:h-32 bg-gradient-to-b from-slate-50 to-slate-25 rounded-lg sm:rounded-xl border border-slate-100 p-3 sm:p-4 overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full border-t border-slate-200" 
                style={{ top: `${i * 25}%` }}
              />
            ))}
          </div>
          
          {/* Performance bars - optimized for mobile */}
          <div className="relative h-full flex items-end justify-center space-x-4 sm:space-x-8">
            {/* Portfolio bar */}
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <div className="text-xs font-medium text-slate-600 text-center leading-tight">Your Portfolio</div>
              <div 
                className="w-12 sm:w-16 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-1000 ease-out shadow-sm relative"
                style={{ height: `${Math.max(chartBars.portfolioHeight, 10)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent shimmer rounded-t-lg" />
              </div>
              <div className="text-xs font-bold text-primary-600">
                {animatedValues.portfolio.toFixed(1)}%
              </div>
            </div>
            
            {/* SPY bar */}
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <div className="text-xs font-medium text-slate-600 text-center leading-tight">SPY Benchmark</div>
              <div 
                className="w-12 sm:w-16 bg-gradient-to-t from-wealth-500 to-wealth-400 rounded-t-lg transition-all duration-1000 ease-out shadow-sm relative"
                style={{ height: `${Math.max(chartBars.spyHeight, 10)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent shimmer rounded-t-lg" />
              </div>
              <div className="text-xs font-bold text-wealth-600">
                {animatedValues.spy.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized performance status */}
      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
        isBeating 
          ? 'bg-gradient-to-br from-prosperity-50 via-prosperity-25 to-white border-2 border-prosperity-200' 
          : 'bg-gradient-to-br from-wealth-50 via-wealth-25 to-white border-2 border-wealth-200'
      } achievement-glow ${isBeating && isSignificantOutperformance ? 'achieved' : ''}`}>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shimmer" />
        </div>
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                isBeating 
                  ? 'bg-prosperity-100 text-prosperity-700' 
                  : 'bg-wealth-100 text-wealth-700'
              }`}>
                {isBeating ? (
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <div>
                <h4 className="font-display font-semibold text-base sm:text-lg text-slate-800">
                  {isBeating ? 'Outperforming Market' : 'Market Alignment Opportunity'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600">
                  {isBeating 
                    ? 'Your strategy is generating alpha' 
                    : 'Room for strategy optimization'
                  }
                </p>
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              <div className={`currency-display font-bold text-2xl sm:text-3xl animate-currency ${
                isBeating 
                  ? 'text-gradient-prosperity' 
                  : 'text-gradient-wealth'
              }`}>
                {isBeating ? '+' : ''}{animatedValues.outperformance.toFixed(1)}%
              </div>
              <div className={`text-xs sm:text-sm font-medium mt-1 ${
                isBeating ? 'text-prosperity-600' : 'text-wealth-600'
              }`}>
                vs SPY Benchmark
              </div>
            </div>
          </div>
          
          {/* Status details - mobile optimized */}
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl ${
            isBeating 
              ? 'bg-prosperity-100/50 border border-prosperity-200' 
              : 'bg-wealth-100/50 border border-wealth-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                isBeating ? 'bg-prosperity-500' : 'bg-wealth-500'
              } animate-subtle-pulse`} />
              <span className={`text-sm font-medium ${
                isBeating ? 'text-prosperity-700' : 'text-wealth-700'
              }`}>
                {isBeating 
                  ? `Beating market by ${Math.abs(outperformance * 100).toFixed(1)}%` 
                  : `Tracking ${Math.abs(outperformance * 100).toFixed(1)}% behind market`
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-2 justify-center sm:justify-end">
              {isBeating && isSignificantOutperformance && (
                <div className="text-xs font-bold text-prosperity-600 bg-prosperity-50 px-2 sm:px-3 py-1 rounded-full border border-prosperity-200">
                  🏆 Significant Alpha
                </div>
              )}
              <ShareButton
                shareType="spy-performance"
                shareData={generateShareContent('spy-performance', { 
                  portfolioData: { portfolioReturn: currentData.portfolioReturn, spyReturn: currentData.spyReturn, outperformance: currentData.outperformance }
                })}
                variant="ghost"
                size="sm"
                className={isBeating ? 'text-prosperity-600 hover:text-prosperity-700 hover:bg-prosperity-50' : 'text-wealth-600 hover:text-wealth-700 hover:bg-wealth-50'}
              />
              <div className="text-xs font-medium text-slate-600 bg-slate-50 px-2 sm:px-3 py-1 rounded-full">
                Updated: Now
              </div>
            </div>
          </div>
          
          {/* Mobile-optimized performance insights */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-white/50 rounded-lg border border-slate-100 touch-friendly">
              <div className="text-xs text-slate-500 font-medium mb-1">Risk-Adjusted</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {isBeating ? 'Optimal' : 'Reviewing'}
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-white/50 rounded-lg border border-slate-100 touch-friendly">
              <div className="text-xs text-slate-500 font-medium mb-1">Volatility</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {Math.abs(outperformance) > 0.1 ? 'Higher' : 'Moderate'}
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-white/50 rounded-lg border border-slate-100 touch-friendly">
              <div className="text-xs text-slate-500 font-medium mb-1">Strategy Health</div>
              <div className={`text-xs sm:text-sm font-semibold ${isBeating ? 'text-prosperity-600' : 'text-wealth-600'}`}>
                {isBeating ? 'Strong' : 'Stable'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized additional insights */}
      {!isBeating && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-primary-50 rounded-lg sm:rounded-xl border border-slate-100">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm sm:text-base font-semibold text-slate-800 mb-1">Strategy Optimization Opportunity</h5>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Consider reviewing your portfolio allocation to capture additional market gains. 
                Small adjustments could help close the {Math.abs(outperformance * 100).toFixed(1)}% gap.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const SPYComparison = memo(SPYComparisonComponent, (prevProps, nextProps) => {
  return (
    prevProps.portfolioReturn === nextProps.portfolioReturn &&
    prevProps.spyReturn === nextProps.spyReturn &&
    prevProps.outperformance === nextProps.outperformance
  );
});