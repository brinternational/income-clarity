'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  List, 
  ArrowUpDown, 
  MapPin, 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  Star,
  Filter,
  Search,
  ChevronDown,
  X
} from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { 
  STATE_TAX_RATES, 
  calculateStateSavings, 
  getStatesByTaxBurden,
  getColorForSavings,
  isPuertoRico,
  getBestTaxStates,
  type StateTaxInfo
} from '@/lib/state-tax-rates';

interface StateComparisonVisualizationProps {
  currentIncome?: number;
  currentState?: string;
  dividendType?: 'qualified' | 'ordinary';
  filingStatus?: 'single' | 'marriedJoint';
  className?: string;
}

type ViewMode = 'map' | 'list';
type SortBy = 'savings' | 'name' | 'rate' | 'total-tax';
type FilterBy = 'all' | 'save-money' | 'cost-money' | 'no-tax' | 'territories';

interface StateComparisonData {
  stateCode: string;
  stateInfo: StateTaxInfo;
  savingsInfo: ReturnType<typeof calculateStateSavings>;
  colorInfo: ReturnType<typeof getColorForSavings>;
  isCurrentState: boolean;
  isPR: boolean;
}

export function StateComparisonVisualization({
  currentIncome = 75000,
  currentState = 'CA', 
  dividendType = 'qualified',
  filingStatus = 'single',
  className = ''
}: StateComparisonVisualizationProps) {
  const { profileData } = useUserProfile();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('savings');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use profile data if available
  const actualIncome = currentIncome; // TODO: Get actual dividend income from portfolio
  const actualState = profileData?.location?.state || currentState;
  const actualFilingStatus = profileData?.taxInfo?.filingStatus === 'married_joint' ? 'marriedJoint' : 'single';

  // Calculate comparison data for all states
  const stateComparisons = useMemo(() => {
    const comparisons: StateComparisonData[] = [];
    
    Object.entries(STATE_TAX_RATES).forEach(([code, info]) => {
      const savingsInfo = calculateStateSavings(
        actualIncome,
        actualState,
        code,
        dividendType,
        actualFilingStatus
      );
      
      const colorInfo = getColorForSavings(savingsInfo.annualSavings);
      
      comparisons.push({
        stateCode: code,
        stateInfo: info,
        savingsInfo,
        colorInfo,
        isCurrentState: code.toUpperCase() === actualState.toUpperCase(),
        isPR: isPuertoRico(code)
      });
    });
    
    return comparisons;
  }, [actualIncome, actualState, dividendType, actualFilingStatus]);

  // Filter states based on current filter
  const filteredStates = useMemo(() => {
    let filtered = stateComparisons;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(state => 
        state.stateInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        state.stateCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'save-money':
        filtered = filtered.filter(state => state.savingsInfo.annualSavings > 0);
        break;
      case 'cost-money':
        filtered = filtered.filter(state => state.savingsInfo.annualSavings < 0);
        break;
      case 'no-tax':
        filtered = filtered.filter(state => state.stateInfo.rate === 0);
        break;
      case 'territories':
        filtered = filtered.filter(state => state.stateInfo.isTerritory);
        break;
    }

    return filtered;
  }, [stateComparisons, searchQuery, filterBy]);

  // Sort filtered states
  const sortedStates = useMemo(() => {
    const sorted = [...filteredStates];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'savings':
          comparison = a.savingsInfo.annualSavings - b.savingsInfo.annualSavings;
          break;
        case 'name':
          comparison = a.stateInfo.name.localeCompare(b.stateInfo.name);
          break;
        case 'rate':
          comparison = a.stateInfo.rate - b.stateInfo.rate;
          break;
        case 'total-tax':
          comparison = a.savingsInfo.targetTax.total - b.savingsInfo.targetTax.total;
          break;
      }
      
      return sortAsc ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredStates, sortBy, sortAsc]);

  // Get best tax states for quick view
  const bestTaxStates = useMemo(() => {
    return getBestTaxStates(actualIncome, dividendType, actualFilingStatus, 5);
  }, [actualIncome, dividendType, actualFilingStatus]);

  // Calculate potential maximum savings
  const maxSavings = useMemo(() => {
    return Math.max(...stateComparisons.map(s => s.savingsInfo.annualSavings));
  }, [stateComparisons]);

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(newSortBy);
      setSortAsc(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterBy('all');
    setSortBy('savings');
    setSortAsc(false);
  };

  return (
    <div className={`premium-card p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-semibold text-slate-800 mb-2">
              State Tax Comparison
            </h3>
            <p className="text-sm text-slate-600">
              Compare tax savings potential across all US states and territories
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all ${
                viewMode === 'list' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all ${
                viewMode === 'map' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              disabled // Map view coming in Phase 2
            >
              <Map className="w-4 h-4" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Maximum Savings</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(maxSavings).toLocaleString()}
            </div>
            <div className="text-xs text-green-700">per year</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Current State</span>
            </div>
            <div className="text-lg font-semibold text-blue-600">
              {STATE_TAX_RATES[actualState.toUpperCase()]?.name || actualState}
            </div>
            <div className="text-xs text-blue-700">
              {(STATE_TAX_RATES[actualState.toUpperCase()]?.rate * 100 || 0).toFixed(1)}% tax rate
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Optimal Choice</span>
            </div>
            <div className="text-lg font-semibold text-yellow-600">Puerto Rico</div>
            <div className="text-xs text-yellow-700">0% tax on qualified dividends</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Filter */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All States</option>
            <option value="save-money">Save Money</option>
            <option value="cost-money">Cost More</option>
            <option value="no-tax">No State Tax</option>
            <option value="territories">US Territories</option>
          </select>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as SortBy)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="savings">Sort by Savings</option>
            <option value="name">Sort by Name</option>
            <option value="rate">Sort by Tax Rate</option>
            <option value="total-tax">Sort by Total Tax</option>
          </select>
        </div>
        
        {/* Active filters indicator */}
        {(searchQuery || filterBy !== 'all') && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Filters active:</span>
            {searchQuery && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterBy !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                <span>Filter: {filterBy.replace('-', ' ')}</span>
                <button onClick={() => setFilterBy('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Puerto Rico Special Highlight */}
      {!stateComparisons.find(s => s.isPR && s.isCurrentState) && (
        <motion.div 
          className="mb-6 p-4 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-xl border border-amber-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">
                🏝️ Puerto Rico Advantage
              </h4>
              <p className="text-sm text-amber-800 mb-2">
                Moving to Puerto Rico could save you <strong>${Math.round(stateComparisons.find(s => s.isPR)?.savingsInfo.annualSavings || 0).toLocaleString()}</strong> per year 
                with 0% tax on qualified dividends under Act 60.
              </p>
              <div className="text-xs text-amber-700">
                That's ${Math.round((stateComparisons.find(s => s.isPR)?.savingsInfo.monthlySavings || 0)).toLocaleString()} extra per month!
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* State Comparison List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedStates.map((state, index) => (
            <motion.div
              key={state.stateCode}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`group relative p-4 border rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer ${
                state.isCurrentState 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                  : state.isPR && state.savingsInfo.annualSavings > 5000
                    ? 'ring-2 ring-amber-400 bg-amber-50 border-amber-200'
                    : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setSelectedState(selectedState === state.stateCode ? null : state.stateCode)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* State Flag/Icon */}
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                    {state.stateCode}
                  </div>
                  
                  {/* State Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-slate-900">
                        {state.stateInfo.name}
                      </h4>
                      {state.isCurrentState && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Current
                        </span>
                      )}
                      {state.isPR && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                          🏝️ Territory
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      {state.stateInfo.rate === 0 ? 'No state tax' : `${(state.stateInfo.rate * 100).toFixed(1)}% tax rate`}
                    </div>
                    {state.stateInfo.specialNotes && (
                      <div className="text-xs text-slate-500 mt-1">
                        {state.stateInfo.specialNotes}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Savings Info */}
                <div className="text-right">
                  <div className={`flex items-center space-x-2 mb-1 ${
                    state.savingsInfo.annualSavings > 0 
                      ? 'text-green-600' 
                      : state.savingsInfo.annualSavings < 0
                        ? 'text-red-600'
                        : 'text-slate-600'
                  }`}>
                    {state.savingsInfo.annualSavings > 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : state.savingsInfo.annualSavings < 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : null}
                    <span className="font-semibold">
                      {state.savingsInfo.annualSavings > 0 ? '+' : ''}
                      ${Math.round(state.savingsInfo.annualSavings).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    per year
                  </div>
                  <div className="text-xs text-slate-500">
                    (${Math.round(state.savingsInfo.monthlySavings).toLocaleString()}/month)
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              <AnimatePresence>
                {selectedState === state.stateCode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-slate-200"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 mb-1">Current Tax</div>
                        <div className="font-semibold">
                          ${Math.round(state.savingsInfo.currentTax.total).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-1">{state.stateInfo.name} Tax</div>
                        <div className="font-semibold">
                          ${Math.round(state.savingsInfo.targetTax.total).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-1">Effective Rate</div>
                        <div className="font-semibold">
                          {(state.savingsInfo.targetTax.effectiveRate * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-1">10-Year Savings</div>
                        <div className="font-semibold text-green-600">
                          ${Math.round(state.savingsInfo.annualSavings * 10).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {state.savingsInfo.annualSavings > 1000 && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          💡 Moving to {state.stateInfo.name} could save you ${Math.round(state.savingsInfo.annualSavings).toLocaleString()} per year!
                        </div>
                        <div className="text-xs text-green-700 mt-1">
                          That's enough to cover {Math.floor(state.savingsInfo.annualSavings / 500)} months of typical expenses.
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {sortedStates.length === 0 && (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">No states match your current filters</div>
          <button 
            onClick={clearFilters}
            className="text-primary-600 hover:text-primary-700 text-sm underline"
          >
            Clear filters to see all states
          </button>
        </div>
      )}

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
            <p className="text-sm text-blue-800">
              Tax optimization through relocation is one of the most powerful ways to increase your after-tax income. 
              Consider factors like cost of living, quality of life, and proximity to family when evaluating your options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StateComparisonVisualization;