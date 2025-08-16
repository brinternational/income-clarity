'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map,
  MapPin,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Crown,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plane,
  Calculator,
  Globe,
  BarChart3
} from 'lucide-react';
import { useMultiStateComparison } from '@/hooks/useMultiStateComparison';

interface MultiStateTaxComparisonProps {
  portfolioValue?: number;
  selectedStrategy?: 'dividend' | 'sell_spy' | 'covered_call' | 'sixty_forty';
  className?: string;
}

const STRATEGY_LABELS = {
  dividend: 'Dividend Focus',
  sell_spy: 'Sell SPY',
  covered_call: 'Covered Call',
  sixty_forty: '60/40 Portfolio'
};

const STATE_REGIONS = {
  'Northeast': [
    'Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 
    'Connecticut', 'New York', 'New Jersey', 'Pennsylvania'
  ],
  'Southeast': [
    'Delaware', 'Maryland', 'Virginia', 'West Virginia', 'North Carolina', 
    'South Carolina', 'Georgia', 'Florida', 'Kentucky', 'Tennessee', 
    'Alabama', 'Mississippi', 'Arkansas', 'Louisiana'
  ],
  'Midwest': [
    'Ohio', 'Michigan', 'Indiana', 'Illinois', 'Wisconsin', 'Minnesota', 
    'Iowa', 'Missouri', 'North Dakota', 'South Dakota', 'Nebraska', 'Kansas'
  ],
  'West': [
    'Montana', 'Wyoming', 'Colorado', 'New Mexico', 'Idaho', 'Utah', 
    'Arizona', 'Nevada', 'Washington', 'Oregon', 'California', 'Alaska', 'Hawaii'
  ],
  'Southwest': [
    'Texas', 'Oklahoma'
  ],
  'Territories': [
    'Puerto Rico', 'US Virgin Islands', 'Guam', 'American Samoa', 
    'Northern Mariana Islands', 'Washington DC'
  ]
};

export const MultiStateTaxComparison: React.FC<MultiStateTaxComparisonProps> = ({
  portfolioValue = 500000,
  selectedStrategy = 'dividend',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'tax_rate' | 'after_tax_return' | 'alphabetical'>('after_tax_return');
  const [viewMode, setViewMode] = useState<'table' | 'map' | 'rankings'>('rankings');
  const [showMigrationAnalysis, setShowMigrationAnalysis] = useState(false);
  const [selectedFromState, setSelectedFromState] = useState<string>('California');
  const [selectedToState, setSelectedToState] = useState<string>('Puerto Rico');

  const {
    stateComparisons,
    isLoading,
    error,
    summaryStats,
    getAllStateRankings,
    getMigrationAnalysis,
    getLocationAdvantage
  } = useMultiStateComparison({
    portfolioValue
  });

  const stateRankings = useMemo(() => {
    const rankings = getAllStateRankings(selectedStrategy);
    
    // Apply search filter
    let filtered = rankings.filter(state => 
      state.state.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply region filter
    if (selectedRegion !== 'all') {
      const regionStates = STATE_REGIONS[selectedRegion as keyof typeof STATE_REGIONS] || [];
      filtered = filtered.filter(state => regionStates.includes(state.state));
    }

    // Apply sorting
    switch (sortBy) {
      case 'tax_rate':
        filtered.sort((a, b) => a.taxRate - b.taxRate);
        break;
      case 'after_tax_return':
        filtered.sort((a, b) => b.afterTaxReturn - a.afterTaxReturn);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.state.localeCompare(b.state));
        break;
    }

    return filtered;
  }, [getAllStateRankings, selectedStrategy, searchQuery, selectedRegion, sortBy]);

  const migrationAnalysis = useMemo(() => {
    if (!showMigrationAnalysis) return null;
    return getMigrationAnalysis(selectedFromState, selectedToState, selectedStrategy, 5);
  }, [getMigrationAnalysis, selectedFromState, selectedToState, selectedStrategy, showMigrationAnalysis]);

  const topPerformers = useMemo(() => {
    return stateRankings.slice(0, 5);
  }, [stateRankings]);

  const worstPerformers = useMemo(() => {
    return stateRankings.slice(-5).reverse();
  }, [stateRankings]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-green-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-2xl font-bold text-white">🌎 Multi-State Tax Comparison</h3>
              <p className="text-indigo-100 text-lg">
                Compare {STRATEGY_LABELS[selectedStrategy]} across all 50 states + Puerto Rico • 
                <span className="text-yellow-200 font-semibold"> 🏝️ PR always wins!</span>
              </p>
            </div>
          </div>
          
          {/* Strategy Selector */}
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value as typeof selectedStrategy)}
            className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {Object.entries(STRATEGY_LABELS).map(([key, label]) => (
              <option key={key} value={key} className="text-gray-900">
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {['rankings', 'table', 'migration'].map(mode => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode as typeof viewMode);
                if (mode === 'migration') setShowMigrationAnalysis(true);
                else setShowMigrationAnalysis(false);
              }}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                (mode === 'migration' && showMigrationAnalysis) || viewMode === mode
                  ? 'bg-white text-indigo-600 font-medium'
                  : 'bg-indigo-500 text-white hover:bg-indigo-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Best State</p>
              <p className="font-bold text-green-600 flex items-center justify-center">
                <Crown className="h-4 w-4 mr-1" />
                {summaryStats.bestState}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tax Rate Range</p>
              <p className="font-bold text-gray-900">
                {(summaryStats.minTaxRate * 100).toFixed(1)}% - {(summaryStats.maxTaxRate * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Max Potential Savings</p>
              <p className="font-bold text-green-600">
                ${summaryStats.maxPotentialSavings.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">States Analyzed</p>
              <p className="font-bold text-blue-600">{summaryStats.states}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Filters */}
        {!showMigrationAnalysis && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                {Object.keys(STATE_REGIONS).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="after_tax_return">Best Returns</option>
                <option value="tax_rate">Lowest Tax</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
        )}

        {/* Rankings View */}
        {viewMode === 'rankings' && !showMigrationAnalysis && (
          <div className="space-y-6">
            {/* Top Performers */}
            <div>
              <h4 className="font-semibold text-green-600 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Top 5 Performers
              </h4>
              <div className="grid gap-3">
                {topPerformers.map((state, index) => {
                  const isPR = state.state === 'Puerto Rico';
                  
                  return (
                    <motion.div
                      key={state.state}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        isPR
                          ? 'bg-gradient-to-r from-yellow-50 to-green-50 border-yellow-300'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          isPR
                            ? 'bg-yellow-400 text-yellow-800'
                            : 'bg-green-500 text-white'
                        }`}>
                          {isPR ? <Crown className="h-4 w-4" /> : state.rank}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {state.state}
                            {isPR && <Star className="h-4 w-4 ml-1 text-yellow-600" />}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(state.taxRate * 100).toFixed(1)}% tax rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isPR ? 'text-green-600' : 'text-green-600'}`}>
                          {(state.afterTaxReturn * 100).toFixed(2)}%
                        </p>
                        <p className="text-sm text-gray-500">
                          ${state.annualIncome.toLocaleString()}/year
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Worst Performers */}
            <div>
              <h4 className="font-semibold text-red-600 mb-3 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2" />
                Bottom 5 Performers
              </h4>
              <div className="grid gap-3">
                {worstPerformers.map((state, index) => (
                  <motion.div
                    key={state.state}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-red-50 border-red-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold text-sm">
                        {state.rank}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {state.state}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(state.taxRate * 100).toFixed(1)}% tax rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {(state.afterTaxReturn * 100).toFixed(2)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        ${state.annualIncome.toLocaleString()}/year
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && !showMigrationAnalysis && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">Rank</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-600">State</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-600">Tax Rate</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-600">After-Tax Return</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-600">Annual Income</th>
                </tr>
              </thead>
              <tbody>
                {stateRankings.map((state, index) => {
                  const isPR = state.state === 'Puerto Rico';
                  
                  return (
                    <motion.tr
                      key={state.state}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        isPR ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="py-3 px-2">
                        {isPR ? (
                          <Crown className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <span className="font-medium">{state.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{state.state}</span>
                          {isPR && <Star className="h-4 w-4 text-yellow-600" />}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`font-medium ${
                          state.taxRate === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {(state.taxRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-bold text-green-600">
                          {(state.afterTaxReturn * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-medium text-gray-900">
                          ${state.annualIncome.toLocaleString()}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Migration Analysis */}
        {showMigrationAnalysis && migrationAnalysis && (
          <div className="space-y-6">
            {/* Migration Selector */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Plane className="h-5 w-5 mr-2" />
                Migration Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From State:</label>
                  <select
                    value={selectedFromState}
                    onChange={(e) => setSelectedFromState(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {stateRankings.map(state => (
                      <option key={state.state} value={state.state}>
                        {state.state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To State:</label>
                  <select
                    value={selectedToState}
                    onChange={(e) => setSelectedToState(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {stateRankings.map(state => (
                      <option key={state.state} value={state.state}>
                        {state.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Migration Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Impact */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h5 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Financial Impact
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Annual Savings:</span>
                    <span className={`font-bold ${
                      migrationAnalysis.annualSavings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {migrationAnalysis.annualSavings > 0 ? '+' : ''}${migrationAnalysis.annualSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">5-Year Total:</span>
                    <span className={`font-bold ${
                      migrationAnalysis.totalSavings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {migrationAnalysis.totalSavings > 0 ? '+' : ''}${migrationAnalysis.totalSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tax Savings:</span>
                    <span className={`font-bold ${
                      migrationAnalysis.taxSavings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {migrationAnalysis.taxSavings > 0 ? '+' : ''}${migrationAnalysis.taxSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Improvement:</span>
                    <span className={`font-bold ${
                      migrationAnalysis.percentageImprovement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {migrationAnalysis.percentageImprovement > 0 ? '+' : ''}{migrationAnalysis.percentageImprovement.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Rate Comparison */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Tax Rate Comparison
                </h5>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{selectedFromState}</span>
                      <span className="font-bold text-red-600">
                        {(migrationAnalysis.fromTaxRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full"
                        style={{ width: `${migrationAnalysis.fromTaxRate * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{selectedToState}</span>
                      <span className="font-bold text-green-600">
                        {(migrationAnalysis.toTaxRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${migrationAnalysis.toTaxRate * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tax Rate Reduction:</span>
                      <span className="font-bold text-green-600">
                        -{(migrationAnalysis.taxRateReduction * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`rounded-lg p-4 border ${
              migrationAnalysis.isWorthwhile
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                {migrationAnalysis.isWorthwhile ? (
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-yellow-600" />
                )}
                <span className={`font-medium ${
                  migrationAnalysis.isWorthwhile ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {migrationAnalysis.isWorthwhile 
                    ? `Highly recommended migration with ${migrationAnalysis.annualSavings.toLocaleString()} annual savings`
                    : 'Migration may not provide significant financial benefits'
                  }
                </span>
              </div>
              <p className={`text-sm mt-2 ${
                migrationAnalysis.isWorthwhile ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {migrationAnalysis.isWorthwhile 
                  ? `This migration would save you over ${Math.abs(migrationAnalysis.totalSavings).toLocaleString()} over 5 years with ${migrationAnalysis.percentageImprovement.toFixed(1)}% better returns.`
                  : 'Consider other factors beyond tax savings when making location decisions.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};