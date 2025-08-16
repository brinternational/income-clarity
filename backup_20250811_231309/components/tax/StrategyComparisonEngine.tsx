'use client';

/**
 * StrategyComparisonEngine.tsx - THE COMPETITIVE MOAT
 * 
 * THE KEY DIFFERENTIATOR for Income Clarity! Shows which investment strategy wins
 * based on location's tax laws, especially highlighting Puerto Rico's massive advantage.
 * 
 * Features:
 * - 4 Strategy Comparison (SPY, Dividends, Covered Calls, 60/40)
 * - Location-Based Tax Intelligence with PR 0% advantage
 * - Interactive Portfolio/Income Inputs
 * - Winner Badges and Visual Comparisons
 * - "Moving to PR saves $X" alerts
 * - Mobile responsive with smooth animations
 */

import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  DollarSign,
  TrendingUp,
  Calculator,
  Crown,
  AlertTriangle,
  Info,
  ChevronDown,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

import { useStrategyComparison, useCurrencyFormatter, usePercentageFormatter } from '@/hooks/useStrategyComparison';
import { STATE_TAX_RATES } from '@/lib/state-tax-rates';
import { getStrategyColors, getStrategyAllocation, type StrategyResult } from '@/lib/tax-strategies';

interface StrategyComparisonEngineProps {
  initialPortfolioValue?: number;
  initialTargetIncome?: number;
  initialLocation?: string;
  className?: string;
}

const StrategyComparisonEngineComponent = ({
  initialPortfolioValue = 1000000,
  initialTargetIncome = 60000,
  initialLocation = 'California',
  className = ''
}: StrategyComparisonEngineProps) => {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const {
    input,
    result,
    isCalculating,
    error,
    updatePortfolioValue,
    updateTargetIncome,
    updateLocation,
    updateFilingStatus,
    winnerStrategy,
    puertoRicoSavings,
    locationInsights,
    isValid
  } = useStrategyComparison({
    portfolioValue: initialPortfolioValue,
    targetAnnualIncome: initialTargetIncome,
    location: initialLocation,
    autoCalculate: true
  });

  const formatCurrency = useCurrencyFormatter();
  const formatPercentage = usePercentageFormatter();

  const handlePortfolioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updatePortfolioValue(value);
  }, [updatePortfolioValue]);

  const handleIncomeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateTargetIncome(value);
  }, [updateTargetIncome]);

  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateLocation(e.target.value);
  }, [updateLocation]);

  // Get sorted states for dropdown
  const sortedStates = Object.entries(STATE_TAX_RATES)
    .sort(([, a], [, b]) => {
      // Puerto Rico first, then no-tax states, then alphabetical
      if (a.abbreviation === 'PR') return -1;
      if (b.abbreviation === 'PR') return 1;
      if (a.rate === 0 && b.rate !== 0) return -1;
      if (a.rate !== 0 && b.rate === 0) return 1;
      return a.name.localeCompare(b.name);
    });

  if (isCalculating) {
    return (
      <motion.div 
        className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !result) {
    return (
      <motion.div 
        className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Calculation Error</h3>
          <p className="text-gray-600">{error || 'Unable to calculate strategies'}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 rounded-2xl shadow-xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div 
          className="inline-flex items-center space-x-2 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Strategy Comparison Engine
        </motion.h2>
        
        <motion.p 
          className="text-gray-600 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Compare 4 investment strategies • Find your tax-optimized winner
        </motion.p>
      </div>

      {/* Puerto Rico Advantage Alert */}
      {!locationInsights.isPuertoRico && puertoRicoSavings > 5000 && (
        <motion.div 
          className="mb-8 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border-2 border-green-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-800 text-lg">
                🏝️ Puerto Rico saves you {formatCurrency(puertoRicoSavings)}/year!
              </h3>
              <p className="text-green-700 text-sm">
                0% tax on qualified dividends + federal benefits = Maximum tax optimization
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-green-600" />
          </div>
        </motion.div>
      )}

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Portfolio Value */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Portfolio Value
          </label>
          <input
            type="number"
            value={input.portfolioValue}
            onChange={handlePortfolioChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-lg font-semibold"
            placeholder="1000000"
            min="0"
            step="10000"
          />
        </div>

        {/* Target Annual Income */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <Target className="w-4 h-4 inline mr-1" />
            Target Annual Income
          </label>
          <input
            type="number"
            value={input.targetAnnualIncome}
            onChange={handleIncomeChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-lg font-semibold"
            placeholder="60000"
            min="0"
            step="5000"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <MapPin className="w-4 h-4 inline mr-1" />
            Your Location
          </label>
          <div className="relative">
            <select
              value={input.location}
              onChange={handleLocationChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-lg font-semibold appearance-none bg-white"
            >
              {sortedStates.map(([code, info]) => (
                <option key={code} value={info.name}>
                  {info.abbreviation === 'PR' ? '🏝️ ' : ''}
                  {info.name}
                  {info.rate === 0 ? ' (0% tax)' : ` (${(info.rate * 100).toFixed(1)}% tax)`}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Location Insights */}
      <motion.div 
        className={`mb-8 p-4 rounded-xl border-2 ${locationInsights.color.bg} ${locationInsights.color.border}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl ${locationInsights.isPuertoRico ? '🏝️' : '📍'}`}>
              {locationInsights.isPuertoRico ? '🏝️' : '📍'}
            </div>
            <div>
              <h3 className={`font-bold ${locationInsights.color.text}`}>
                {locationInsights.advantage}
              </h3>
              <p className={`text-sm ${locationInsights.color.text} opacity-80`}>
                {locationInsights.description}
              </p>
            </div>
          </div>
          <div className={`text-right ${locationInsights.color.text}`}>
            <p className="font-semibold">{locationInsights.savingsMessage}</p>
          </div>
        </div>
      </motion.div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {result.strategies.map((strategy, index) => (
          <StrategyCard 
            key={strategy.strategyName}
            strategy={strategy}
            isSelected={selectedStrategy === strategy.strategyName}
            onClick={() => setSelectedStrategy(selectedStrategy === strategy.strategyName ? null : strategy.strategyName)}
            animationDelay={0.7 + (index * 0.1)}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
        ))}
      </div>

      {/* Winner Summary */}
      {winnerStrategy && (
        <motion.div 
          className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-gold-50 rounded-xl border-2 border-yellow-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-800">
                  Winner: {winnerStrategy.strategyName}
                </h3>
                <p className="text-yellow-700">
                  Net Income: {formatCurrency(winnerStrategy.netIncome)} • 
                  Tax Efficiency: {formatPercentage(winnerStrategy.netIncome / winnerStrategy.grossIncome * 100)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-yellow-600">Effective Tax Rate</p>
              <p className="text-2xl font-bold text-yellow-800">
                {formatPercentage(winnerStrategy.effectiveRate * 100)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Detailed Breakdown Toggle */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-100 text-blue-800 rounded-xl hover:bg-blue-200 transition-colors font-semibold"
        >
          <Info className="w-5 h-5" />
          <span>{showDetailedBreakdown ? 'Hide' : 'Show'} Detailed Breakdown</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showDetailedBreakdown ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {showDetailedBreakdown && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tax Breakdown by Strategy</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">Strategy</th>
                      <th className="text-right py-3 px-2 font-semibold">Gross Income</th>
                      <th className="text-right py-3 px-2 font-semibold">Federal Tax</th>
                      <th className="text-right py-3 px-2 font-semibold">State Tax</th>
                      <th className="text-right py-3 px-2 font-semibold">Net Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.strategies.map((strategy) => (
                      <tr key={strategy.strategyName} className={`border-b ${strategy.isWinner ? 'bg-yellow-50' : ''}`}>
                        <td className="py-3 px-2 font-semibold">
                          <div className="flex items-center space-x-2">
                            <span>{strategy.icon}</span>
                            <span>{strategy.strategyName}</span>
                            {strategy.isWinner && <Crown className="w-4 h-4 text-yellow-600" />}
                          </div>
                        </td>
                        <td className="text-right py-3 px-2">{formatCurrency(strategy.grossIncome)}</td>
                        <td className="text-right py-3 px-2 text-red-600">{formatCurrency(strategy.federalTax)}</td>
                        <td className="text-right py-3 px-2 text-red-600">{formatCurrency(strategy.stateTax)}</td>
                        <td className="text-right py-3 px-2 font-semibold text-green-600">{formatCurrency(strategy.netIncome)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategy Details */}
            {selectedStrategy && (
              <StrategyDetails 
                strategy={result.strategies.find(s => s.strategyName === selectedStrategy)!}
                formatCurrency={formatCurrency}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Strategy Card Component
interface StrategyCardProps {
  strategy: StrategyResult;
  isSelected: boolean;
  onClick: () => void;
  animationDelay: number;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

const StrategyCard = memo(({ 
  strategy, 
  isSelected, 
  onClick, 
  animationDelay,
  formatCurrency,
  formatPercentage 
}: StrategyCardProps) => {
  const colors = getStrategyColors(strategy.strategyType);

  return (
    <motion.div
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, type: "spring" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`relative p-6 rounded-xl border-2 ${colors.bg} ${colors.border} hover:shadow-lg transition-all`}>
        {/* Winner Badge */}
        {strategy.isWinner && (
          <motion.div 
            className="absolute -top-3 -right-3 p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationDelay + 0.2, type: "spring" }}
          >
            <Crown className="w-5 h-5 text-white" />
          </motion.div>
        )}

        {/* Strategy Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`text-3xl`}>{strategy.icon}</div>
            <div>
              <h3 className={`font-bold text-lg ${colors.text}`}>
                {strategy.strategyName}
              </h3>
              <p className={`text-sm opacity-75 ${colors.text}`}>
                {strategy.complexity} • {strategy.riskLevel} Risk
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${colors.text} opacity-75`}>Gross Income</span>
            <span className={`font-semibold ${colors.text}`}>
              {formatCurrency(strategy.grossIncome)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className={`text-sm ${colors.text} opacity-75`}>Total Tax</span>
            <span className="font-semibold text-red-600">
              -{formatCurrency(strategy.totalTax)}
            </span>
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-semibold ${colors.text}`}>Net Income</span>
              <span className={`font-bold text-lg text-green-600`}>
                {formatCurrency(strategy.netIncome)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className={`text-sm ${colors.text} opacity-75`}>Tax Rate</span>
            <span className={`font-semibold ${colors.accent}`}>
              {formatPercentage(strategy.effectiveRate * 100)}
            </span>
          </div>
        </div>

        {/* Quick Pros/Cons */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-green-600 mb-1">Pros</p>
              <ul className="space-y-1">
                {strategy.pros.slice(0, 2).map((pro, index) => (
                  <li key={index} className="text-gray-600">• {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-600 mb-1">Cons</p>
              <ul className="space-y-1">
                {strategy.cons.slice(0, 2).map((con, index) => (
                  <li key={index} className="text-gray-600">• {con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

StrategyCard.displayName = 'StrategyCard';

// Strategy Details Component
interface StrategyDetailsProps {
  strategy: StrategyResult;
  formatCurrency: (value: number) => string;
}

const StrategyDetails = memo(({ strategy, formatCurrency }: StrategyDetailsProps) => {
  const allocation = getStrategyAllocation(strategy.strategyType);

  return (
    <motion.div 
      className="bg-white rounded-xl p-6 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <span>{strategy.icon}</span>
        <span>{strategy.strategyName} Details</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Info */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Strategy Overview</h4>
          <p className="text-gray-600 mb-4">{strategy.description}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Risk Level:</span>
              <span className="font-semibold">{strategy.riskLevel}</span>
            </div>
            <div className="flex justify-between">
              <span>Complexity:</span>
              <span className="font-semibold">{strategy.complexity}</span>
            </div>
            <div className="flex justify-between">
              <span>Yield Required:</span>
              <span className="font-semibold">{strategy.yieldRequired.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Recommended Allocation</h4>
          <p className="text-gray-600 text-sm mb-3">{allocation.description}</p>
          
          <div className="space-y-2">
            {allocation.allocations.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-sm">{item.asset}</span>
                  <span className="text-xs text-gray-500 ml-2">({item.ticker})</span>
                </div>
                <span className="font-semibold text-sm">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

StrategyDetails.displayName = 'StrategyDetails';

// Memoize the main component
export const StrategyComparisonEngine = memo(StrategyComparisonEngineComponent);

StrategyComparisonEngine.displayName = 'StrategyComparisonEngine';