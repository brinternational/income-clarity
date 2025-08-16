'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Shield,
  Target,
  Activity,
  ArrowRight,
  MapPin,
  AlertCircle,
  CheckCircle,
  Crown
} from 'lucide-react';
import { useStrategyTaxComparison } from '@/hooks/useStrategyTaxComparison';

interface StrategyOption {
  id: 'sell_spy' | 'dividend' | 'covered_call' | 'sixty_forty';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const STRATEGIES: StrategyOption[] = [
  {
    id: 'sell_spy',
    name: 'Sell SPY',
    description: 'Sell SPY ETF for capital gains',
    icon: TrendingUp,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 'dividend',
    name: 'Dividend Focus',
    description: 'High dividend yield portfolio',
    icon: DollarSign,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'covered_call',
    name: 'Covered Call',
    description: 'Generate option premium income',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'sixty_forty',
    name: '60/40 Portfolio',
    description: '60% stocks, 40% bonds',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

interface FourStrategyAnalysisProps {
  portfolioValue?: number;
  currentLocation?: string;
  className?: string;
}

export const FourStrategyAnalysis: React.FC<FourStrategyAnalysisProps> = ({
  portfolioValue = 500000,
  currentLocation = 'Puerto Rico',
  className = ''
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [timeHorizon, setTimeHorizon] = useState<1 | 3 | 5 | 10>(5);
  
  const { 
    strategies, 
    isLoading, 
    error,
    calculateTaxImpact,
    getAfterTaxReturn
  } = useStrategyTaxComparison({
    portfolioValue,
    location: currentLocation,
    timeHorizon
  });

  const analysisResults = useMemo(() => {
    return STRATEGIES.map(strategy => {
      const taxImpact = calculateTaxImpact(strategy.id, portfolioValue);
      const afterTaxReturn = getAfterTaxReturn(strategy.id);
      
      return {
        ...strategy,
        ...taxImpact,
        afterTaxReturn,
        isPuertoRicoWinner: currentLocation === 'Puerto Rico' && strategy.id === 'dividend'
      };
    });
  }, [strategies, portfolioValue, currentLocation, timeHorizon, calculateTaxImpact, getAfterTaxReturn]);

  const bestStrategy = useMemo(() => {
    return analysisResults.reduce((best, current) => 
      current.afterTaxReturn > best.afterTaxReturn ? current : best
    );
  }, [analysisResults]);

  const puertoRicoAdvantage = useMemo(() => {
    if (currentLocation !== 'Puerto Rico') return null;
    
    const dividendStrategy = analysisResults.find(s => s.id === 'dividend');
    const otherStrategies = analysisResults.filter(s => s.id !== 'dividend');
    
    if (!dividendStrategy) return null;
    
    const averageOtherReturn = otherStrategies.reduce((sum, s) => sum + s.afterTaxReturn, 0) / otherStrategies.length;
    const advantage = dividendStrategy.afterTaxReturn - averageOtherReturn;
    
    return {
      annualAdvantage: advantage * portfolioValue,
      totalAdvantage: advantage * portfolioValue * timeHorizon,
      percentageAdvantage: (advantage / averageOtherReturn) * 100
    };
  }, [analysisResults, currentLocation, portfolioValue, timeHorizon]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              4-Strategy Tax Analysis
            </h3>
            <p className="text-blue-100">
              Compare after-tax returns across investment strategies
            </p>
          </div>
          <div className="flex items-center space-x-2 text-white">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">{currentLocation}</span>
          </div>
        </div>

        {/* Time Horizon Selector */}
        <div className="mt-4 flex space-x-2">
          {[1, 3, 5, 10].map(years => (
            <button
              key={years}
              onClick={() => setTimeHorizon(years as 1 | 3 | 5 | 10)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                timeHorizon === years
                  ? 'bg-white text-blue-600 font-medium'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              {years}Y
            </button>
          ))}
        </div>
      </div>

      {/* Puerto Rico Advantage Banner */}
      {puertoRicoAdvantage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4"
        >
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="font-bold text-green-800">Puerto Rico Dividend Advantage</p>
              <p className="text-sm text-green-700">
                Save ${puertoRicoAdvantage.annualAdvantage.toLocaleString()}/year • 
                ${puertoRicoAdvantage.totalAdvantage.toLocaleString()} over {timeHorizon} years • 
                {puertoRicoAdvantage.percentageAdvantage.toFixed(1)}% better returns
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Strategy Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {analysisResults.map((strategy, index) => {
            const Icon = strategy.icon;
            const isWinner = strategy.id === bestStrategy.id;
            
            return (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedStrategy === strategy.id
                    ? 'border-blue-500 bg-blue-50'
                    : isWinner
                    ? 'border-green-500 bg-green-50'
                    : strategy.isPuertoRicoWinner
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedStrategy(
                  selectedStrategy === strategy.id ? null : strategy.id
                )}
              >
                {/* Winner Badge */}
                {isWinner && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    BEST
                  </div>
                )}

                {/* Puerto Rico Winner Badge */}
                {strategy.isPuertoRicoWinner && !isWinner && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    PR ★
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${strategy.bgColor}`}>
                    <Icon className={`h-5 w-5 ${strategy.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {strategy.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {strategy.description}
                    </p>
                    
                    {/* Key Metrics */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">After-Tax Return</span>
                        <span className="font-bold text-gray-900">
                          {(strategy.afterTaxReturn * 100).toFixed(2)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Tax Rate</span>
                        <span className={`font-medium ${
                          strategy.effectiveTaxRate === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(strategy.effectiveTaxRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{timeHorizon}Y Value</span>
                        <span className="font-bold text-green-600">
                          ${(strategy.afterTaxReturn * portfolioValue * timeHorizon).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed View */}
                <AnimatePresence>
                  {selectedStrategy === strategy.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Gross Return:</span>
                          <span className="ml-2 font-medium">
                            {(strategy.grossReturn * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tax Owed:</span>
                          <span className="ml-2 font-medium text-red-600">
                            ${strategy.annualTax.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Net Income:</span>
                          <span className="ml-2 font-medium text-green-600">
                            ${(strategy.afterTaxReturn * portfolioValue).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Tax Efficiency:</span>
                          <div className="ml-2 flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(1 - strategy.effectiveTaxRate) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {((1 - strategy.effectiveTaxRate) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Summary Comparison */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Strategy Comparison Summary</h4>
          
          {currentLocation === 'Puerto Rico' && (
            <div className="mb-3 p-3 bg-green-100 rounded-lg border border-green-300">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Puerto Rico Tax Advantage</span>
              </div>
              <p className="text-sm text-green-700">
                Qualified dividends are tax-free in Puerto Rico, providing a significant advantage 
                for dividend-focused strategies. This can save you thousands annually compared to 
                mainland US tax rates.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Best Strategy:</span>
              <span className="font-bold text-green-600 flex items-center">
                {bestStrategy.name}
                <ArrowRight className="h-4 w-4 ml-1" />
                {(bestStrategy.afterTaxReturn * 100).toFixed(2)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Annual Advantage:</span>
              <span className="font-bold text-green-600">
                ${((bestStrategy.afterTaxReturn - analysisResults[analysisResults.indexOf(bestStrategy) === 0 ? 1 : 0].afterTaxReturn) * portfolioValue).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{timeHorizon}-Year Advantage:</span>
              <span className="font-bold text-green-600">
                ${((bestStrategy.afterTaxReturn - analysisResults[analysisResults.indexOf(bestStrategy) === 0 ? 1 : 0].afterTaxReturn) * portfolioValue * timeHorizon).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};