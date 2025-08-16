'use client';

/**
 * LocationBasedWinner Component - TAX-013
 * 
 * THE COMPETITIVE MOAT: Interactive visualization showing which investment strategy wins
 * by location, with Puerto Rico's 0% tax advantage prominently highlighted!
 * 
 * Features:
 * - Interactive map-style visualization by tax regions
 * - Table view for detailed comparisons 
 * - Puerto Rico always prominently highlighted as the winner
 * - "Move to PR and save $X" messaging
 * - Winner badges and visual indicators
 * - Mobile responsive with smooth animations
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Crown,
  TrendingUp,
  DollarSign,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  Map,
  Navigation,
  Globe,
  Award,
  AlertCircle
} from 'lucide-react';
import { useMultiStateComparison } from '@/hooks/useMultiStateComparison';

interface LocationBasedWinnerProps {
  portfolioValue?: number;
  targetIncome?: number;
  selectedStates?: string[];
  className?: string;
}

const POPULAR_LOCATIONS = [
  'Puerto Rico',
  'Florida',
  'Texas', 
  'California',
  'New York',
  'Washington',
  'Nevada',
  'Tennessee'
];

const STRATEGY_ICONS = {
  sell_spy: TrendingUp,
  dividend: DollarSign,
  covered_call: Shield,
  sixty_forty: Target
} as const;

const STRATEGY_NAMES = {
  sell_spy: 'Sell SPY',
  dividend: 'Dividend Focus',
  covered_call: 'Covered Call',
  sixty_forty: '60/40 Portfolio'
} as const;

export const LocationBasedWinner: React.FC<LocationBasedWinnerProps> = ({
  portfolioValue = 500000,
  selectedStates = POPULAR_LOCATIONS,
  className = ''
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('Puerto Rico');
  const [showAllStates, setShowAllStates] = useState(false);
  const [viewMode, setViewMode] = useState<'winner' | 'comparison'>('winner');

  const {
    stateComparisons,
    isLoading,
    error,
    getBestStrategyByState,
    getLocationAdvantage,
    getAllStateRankings
  } = useMultiStateComparison();

  const locationData = useMemo(() => {
    if (!stateComparisons[selectedLocation]) return null;
    
    const strategies = stateComparisons[selectedLocation];
    const bestStrategy = getBestStrategyByState(selectedLocation);
    const advantage = getLocationAdvantage(selectedLocation, portfolioValue);
    
    return {
      strategies,
      bestStrategy,
      advantage
    };
  }, [stateComparisons, selectedLocation, getBestStrategyByState, getLocationAdvantage]);

  const stateRankings = useMemo(() => {
    return getAllStateRankings().slice(0, showAllStates ? undefined : 8);
  }, [getAllStateRankings, showAllStates]);

  const puertoRicoStats = useMemo(() => {
    const prData = stateComparisons['Puerto Rico'];
    if (!prData) return null;

    const dividendStrategy = prData.find(s => s.strategy === 'dividend');
    if (!dividendStrategy) return null;

    // Compare to average of other states
    const otherStates = Object.entries(stateComparisons)
      .filter(([state]) => state !== 'Puerto Rico')
      .map(([state, strategies]) => {
        const divStrategy = strategies.find(s => s.strategy === 'dividend');
        return divStrategy ? divStrategy.afterTaxReturn : 0;
      })
      .filter(rate => rate > 0);

    const averageOtherRate = otherStates.reduce((sum, rate) => sum + rate, 0) / otherStates.length;
    const advantage = dividendStrategy.afterTaxReturn - averageOtherRate;

    return {
      taxRate: dividendStrategy.effectiveTaxRate,
      afterTaxReturn: dividendStrategy.afterTaxReturn,
      annualAdvantage: advantage * portfolioValue,
      percentageAdvantage: (advantage / averageOtherRate) * 100,
      ranking: 1, // PR is always #1 for dividends
      taxSaved: (averageOtherRate - dividendStrategy.afterTaxReturn) * portfolioValue * -1
    };
  }, [stateComparisons, portfolioValue]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Map className="h-6 w-6 text-white" />
            <h3 className="text-xl font-bold text-white">Location-Based Strategy Winner</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('winner')}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                viewMode === 'winner'
                  ? 'bg-white text-blue-600 font-medium'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              Best Strategy
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                viewMode === 'comparison'
                  ? 'bg-white text-blue-600 font-medium'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              Compare All
            </button>
          </div>
        </div>

        {/* Location Selector */}
        <div className="relative">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {selectedStates.map(state => (
              <option key={state} value={state} className="text-gray-900">
                {state}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
        </div>
      </div>

      {/* Puerto Rico Special Banner */}
      {selectedLocation === 'Puerto Rico' && puertoRicoStats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-green-50 border-b border-yellow-200 p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-400 rounded-full p-2">
              <Crown className="h-6 w-6 text-yellow-800" />
            </div>
            <div>
              <p className="font-bold text-yellow-800 flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Puerto Rico - Tax-Free Dividend Paradise
              </p>
              <p className="text-sm text-yellow-700">
                0% tax on qualified dividends • Save ${Math.abs(puertoRicoStats.taxSaved).toLocaleString()}/year • 
                #{puertoRicoStats.ranking} best location for dividend investors
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-6">
        {/* Winner View */}
        {viewMode === 'winner' && locationData && (
          <div className="space-y-6">
            {/* Best Strategy for Location */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800">
                      Best Strategy: {STRATEGY_NAMES[locationData.bestStrategy.strategy as keyof typeof STRATEGY_NAMES]}
                    </h4>
                    <p className="text-sm text-green-600">
                      Optimal for {selectedLocation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {(locationData.bestStrategy.afterTaxReturn * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-green-600">After-Tax Return</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tax Rate</p>
                  <p className="font-bold text-gray-900">
                    {(locationData.bestStrategy.effectiveTaxRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Annual Income</p>
                  <p className="font-bold text-green-600">
                    ${(locationData.bestStrategy.afterTaxReturn * portfolioValue).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tax Owed</p>
                  <p className="font-bold text-red-600">
                    ${locationData.bestStrategy.annualTax.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="font-bold text-blue-600">
                    {((1 - locationData.bestStrategy.effectiveTaxRate) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* All Strategies for Location */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                All Strategies in {selectedLocation}
              </h4>
              <div className="grid gap-3">
                {locationData.strategies
                  .sort((a, b) => b.afterTaxReturn - a.afterTaxReturn)
                  .map((strategy, index) => {
                    const Icon = STRATEGY_ICONS[strategy.strategy as keyof typeof STRATEGY_ICONS];
                    const isWinner = index === 0;
                    
                    return (
                      <motion.div
                        key={strategy.strategy}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isWinner 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {isWinner && <Crown className="h-4 w-4 text-yellow-600" />}
                          <div className={`p-2 rounded-lg ${
                            isWinner ? 'bg-green-200' : 'bg-gray-200'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              isWinner ? 'text-green-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {STRATEGY_NAMES[strategy.strategy as keyof typeof STRATEGY_NAMES]}
                            </p>
                            <p className="text-sm text-gray-600">
                              {(strategy.effectiveTaxRate * 100).toFixed(1)}% tax rate
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isWinner ? 'text-green-600' : 'text-gray-600'}`}>
                            {(strategy.afterTaxReturn * 100).toFixed(2)}%
                          </p>
                          <p className="text-sm text-gray-500">
                            ${(strategy.afterTaxReturn * portfolioValue).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>

            {/* Migration Recommendation */}
            {selectedLocation !== 'Puerto Rico' && puertoRicoStats && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Consider Puerto Rico</span>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  Moving to Puerto Rico could save you ${Math.abs(puertoRicoStats.taxSaved).toLocaleString()} 
                  annually with 0% tax on qualified dividends.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <span>Potential annual savings</span>
                  <ArrowRight className="h-4 w-4 mx-2" />
                  <span className="font-bold">${Math.abs(puertoRicoStats.taxSaved).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comparison View */}
        {viewMode === 'comparison' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                State Rankings (Dividend Strategy)
              </h4>
              <button
                onClick={() => setShowAllStates(!showAllStates)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showAllStates ? 'Show Less' : 'Show All States'}
              </button>
            </div>

            <div className="space-y-3">
              {stateRankings.map((stateData, index) => {
                const isPR = stateData.state === 'Puerto Rico';
                const rank = index + 1;
                
                return (
                  <motion.div
                    key={stateData.state}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isPR
                        ? 'bg-gradient-to-r from-yellow-50 to-green-50 border-yellow-300'
                        : rank <= 3
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        isPR
                          ? 'bg-yellow-400 text-yellow-800'
                          : rank <= 3
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {isPR ? <Crown className="h-4 w-4" /> : rank}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 flex items-center">
                          {stateData.state}
                          {isPR && <Star className="h-4 w-4 ml-1 text-yellow-600" />}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(stateData.taxRate * 100).toFixed(1)}% effective tax rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        isPR ? 'text-green-600' : rank <= 3 ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {(stateData.afterTaxReturn * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        ${(stateData.afterTaxReturn * portfolioValue).toLocaleString()}/year
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Best Location</p>
                  <p className="font-bold text-green-600">Puerto Rico</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Worst Tax Rate</p>
                  <p className="font-bold text-red-600">
                    {Math.max(...stateRankings.map(s => s.taxRate * 100)).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Tax Rate</p>
                  <p className="font-bold text-gray-600">
                    {(stateRankings.reduce((sum, s) => sum + s.taxRate, 0) / stateRankings.length * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Savings</p>
                  <p className="font-bold text-green-600">
                    ${((Math.max(...stateRankings.map(s => s.afterTaxReturn)) - Math.min(...stateRankings.map(s => s.afterTaxReturn))) * portfolioValue).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};