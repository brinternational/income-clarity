'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, Filter, ArrowUpDown, Download, 
  BarChart3, Activity, Layers, Eye, Info, Target, Zap
} from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Holding } from '@/types';
import { YieldSparkline, RiskIndicator } from '@/components/shared/Sparkline';
import { exportElementAsImage, exportDataAsCSV } from '@/utils/exportUtils';

interface EnhancedHoldingsPerformanceProps {
  onAddHolding?: () => void;
}

type SortOption = 'performance-high' | 'performance-low' | 'alphabetical' | 'value-high' | 'value-low' | 'risk-low' | 'risk-high' | 'yield-high' | 'yield-low';
type FilterOption = 'all' | 'outperforming' | 'underperforming' | 'high-risk' | 'low-risk';
type ViewMode = 'detailed' | 'compact';

// Mock data generators for enhanced features
const generateYieldHistory = (currentYield: number): number[] => {
  const months = 6;
  const data = [];
  let yield_val = currentYield * 0.8; // Start lower
  
  for (let i = 0; i < months; i++) {
    // Add some variation but trend upward
    const change = (Math.random() - 0.3) * 0.5 + 0.15; // Slight upward bias
    yield_val += change;
    data.push(Math.max(0.5, Math.min(15, yield_val))); // Keep reasonable bounds
  }
  
  return data;
};

const generateRiskMetrics = (ticker: string): { beta: number; volatility: number; correlation: number } => {
  // Generate somewhat realistic risk metrics based on ticker
  const seed = ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = (seed % 1000) / 1000;
  
  return {
    beta: 0.5 + random * 1.2, // 0.5 to 1.7
    volatility: 0.08 + random * 0.15, // 8% to 23%
    correlation: 0.3 + random * 0.6 // 0.3 to 0.9
  };
};

const calculateCorrelationMatrix = (holdings: Holding[]): { [key: string]: number } => {
  // Simplified correlation calculation (in real app would use historical price data)
  const correlations: { [key: string]: number } = {};
  
  holdings.forEach(holding => {
    const risk = generateRiskMetrics(holding.ticker);
    correlations[holding.ticker] = risk.correlation;
  });
  
  return correlations;
};

export function EnhancedHoldingsPerformance({ onAddHolding }: EnhancedHoldingsPerformanceProps) {
  const { holdings, portfolio } = usePortfolio();
  const [sortBy, setSortBy] = useState<SortOption>('performance-high');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [hoveredHolding, setHoveredHolding] = useState<string | null>(null);
  const [showCorrelationMatrix, setShowCorrelationMatrix] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Enhanced holdings data with mock metrics
  const enhancedHoldings = useMemo(() => {
    return holdings?.map(holding => ({
      ...holding,
      yieldHistory: generateYieldHistory(holding.annualYield || 4.5),
      riskMetrics: generateRiskMetrics(holding.ticker),
      currentYield: holding.annualYield || 4.5
    })) || [];
  }, [holdings]);

  const correlationMatrix = useMemo(() => {
    return calculateCorrelationMatrix(enhancedHoldings);
  }, [enhancedHoldings]);

  // Export functionality
  const handleExport = async (format: 'png' | 'csv') => {
    if (format === 'png' && componentRef.current) {
      await exportElementAsImage(componentRef.current, {
        filename: 'holdings-performance',
        format: 'png',
        scale: 2
      });
    } else if (format === 'csv') {
      const exportData = enhancedHoldings.map(holding => ({
        Ticker: holding.ticker,
        'Current Value': holding.currentValue,
        'YTD Performance': `${(holding.ytdPerformance * 100).toFixed(2)}%`,
        'Monthly Income': holding.monthlyIncome,
        'Annual Yield': `${holding.currentYield.toFixed(2)}%`,
        'Beta': holding.riskMetrics.beta.toFixed(2),
        'Volatility': `${(holding.riskMetrics.volatility * 100).toFixed(1)}%`,
        'Correlation': holding.riskMetrics.correlation.toFixed(2),
        Sector: holding.sector || 'Unknown'
      }));
      
      exportDataAsCSV(exportData, 'holdings-performance');
    }
  };

  if (!enhancedHoldings || enhancedHoldings.length === 0) {
    return (
      <motion.div 
        ref={componentRef}
        className="premium-card p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Enhanced Holdings Performance</h2>
              <p className="text-slate-600">Advanced analytics • YTD Performance vs SPY</p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">📈</div>
          <h3 className="text-lg font-semibold mb-2 text-slate-800">No Holdings Yet</h3>
          <p className="mb-6 text-slate-600">Add your first dividend holding to see advanced performance analytics</p>
          {onAddHolding && (
            <motion.button
              onClick={onAddHolding}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Your First Holding
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  const spyReturn = portfolio?.spyComparison.spyReturn || 0.082;

  // Enhanced sorting and filtering
  const getSortedAndFilteredHoldings = () => {
    let filtered = enhancedHoldings.filter(holding => {
      if (filterBy === 'outperforming') return holding.ytdPerformance > spyReturn;
      if (filterBy === 'underperforming') return holding.ytdPerformance < spyReturn - 0.005;
      if (filterBy === 'high-risk') return holding.riskMetrics.volatility > 0.15;
      if (filterBy === 'low-risk') return holding.riskMetrics.volatility <= 0.12;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance-high':
          return b.ytdPerformance - a.ytdPerformance;
        case 'performance-low':
          return a.ytdPerformance - b.ytdPerformance;
        case 'alphabetical':
          return a.ticker.localeCompare(b.ticker);
        case 'value-high':
          return (b.currentValue || 0) - (a.currentValue || 0);
        case 'value-low':
          return (a.currentValue || 0) - (b.currentValue || 0);
        case 'risk-high':
          return b.riskMetrics.volatility - a.riskMetrics.volatility;
        case 'risk-low':
          return a.riskMetrics.volatility - b.riskMetrics.volatility;
        case 'yield-high':
          return b.currentYield - a.currentYield;
        case 'yield-low':
          return a.currentYield - b.currentYield;
        default:
          return b.ytdPerformance - a.ytdPerformance;
      }
    });
  };

  const displayedHoldings = getSortedAndFilteredHoldings();

  return (
    <motion.div 
      ref={componentRef}
      className="premium-card p-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center"
            whileHover={{ rotate: 5 }}
          >
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Enhanced Holdings Performance</h2>
            <p className="text-slate-600">
              Advanced analytics • SPY: {(spyReturn * 100).toFixed(1)}% • {enhancedHoldings.length} holdings
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <motion.button
            onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-2"
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{viewMode}</span>
          </motion.button>

          {/* Correlation Matrix Toggle */}
          <motion.button
            onClick={() => setShowCorrelationMatrix(!showCorrelationMatrix)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-2"
            whileTap={{ scale: 0.95 }}
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">Correlation</span>
          </motion.button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="p-2 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-primary-600">
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 py-2 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => handleExport('png')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Export as PNG
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Export as CSV
              </button>
            </div>
          </div>

          {/* Portfolio Outperformance Badge */}
          <motion.div 
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-semibold text-green-700">
              Portfolio: {portfolio ? 
                (portfolio.spyComparison.outperformance >= 0 ? '+' : '') + 
                (portfolio.spyComparison.outperformance * 100).toFixed(1) + '%' : '0%'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Enhanced Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="text-sm px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <optgroup label="Performance">
            <option value="performance-high">Best Performance</option>
            <option value="performance-low">Worst Performance</option>
          </optgroup>
          <optgroup label="Value">
            <option value="value-high">Highest Value</option>
            <option value="value-low">Lowest Value</option>
          </optgroup>
          <optgroup label="Risk">
            <option value="risk-high">Highest Risk</option>
            <option value="risk-low">Lowest Risk</option>
          </optgroup>
          <optgroup label="Yield">
            <option value="yield-high">Highest Yield</option>
            <option value="yield-low">Lowest Yield</option>
          </optgroup>
          <optgroup label="Other">
            <option value="alphabetical">Alphabetical</option>
          </optgroup>
        </select>

        {/* Enhanced Filter Dropdown */}
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as FilterOption)}
          className="text-sm px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Holdings</option>
          <option value="outperforming">Outperforming SPY</option>
          <option value="underperforming">Underperforming SPY</option>
          <option value="high-risk">High Risk (&gt;15% vol)</option>
          <option value="low-risk">Low Risk (≤12% vol)</option>
        </select>

        <div className="text-sm text-slate-600">
          Showing {displayedHoldings.length} of {enhancedHoldings.length} holdings
        </div>
      </div>

      {/* Correlation Matrix */}
      <AnimatePresence>
        {showCorrelationMatrix && (
          <motion.div 
            className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">Correlation Analysis</h4>
              <div className="cursor-help group relative">
                <Info className="w-4 h-4 text-purple-500" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Correlation with market movements (0.0 = no correlation, 1.0 = perfect correlation)
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {displayedHoldings.slice(0, 8).map((holding, index) => (
                <motion.div
                  key={holding.ticker}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <span className="font-mono font-medium text-slate-800">{holding.ticker}</span>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      holding.riskMetrics.correlation > 0.7 ? 'text-red-600' :
                      holding.riskMetrics.correlation > 0.4 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {holding.riskMetrics.correlation.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {holding.riskMetrics.correlation > 0.7 ? 'High' :
                       holding.riskMetrics.correlation > 0.4 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Holdings List */}
      <div className="space-y-3">
        {displayedHoldings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 opacity-50">🔍</div>
            <h3 className="text-lg font-semibold mb-2 text-slate-800">No Holdings Match Filter</h3>
            <p className="text-slate-600">Try adjusting your filter settings</p>
          </div>
        ) : displayedHoldings.map((holding, index) => {
          const holdingReturn = holding.ytdPerformance;
          const delta = holdingReturn - spyReturn;
          const isOutperforming = delta > 0.005;
          const isUnderperforming = delta < -0.005;
          const isMatching = Math.abs(delta) <= 0.005;

          const barColor = isMatching ? '#f59e0b' : isOutperforming ? '#059669' : '#dc2626';
          const performanceIcon = isMatching ? Minus : isOutperforming ? TrendingUp : TrendingDown;
          const IconComponent = performanceIcon;

          return (
            <motion.div 
              key={holding.id}
              className="relative bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-sm cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredHolding(holding.id)}
              onMouseLeave={() => setHoveredHolding(null)}
              whileHover={{ scale: 1.01 }}
            >
              {/* Enhanced Tooltip */}
              <AnimatePresence>
                {hoveredHolding === holding.id && (
                  <motion.div 
                    className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-slate-800 text-white rounded-lg shadow-lg text-sm whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-white">{holding.ticker}</div>
                      <div>Value: ${(holding.currentValue || 0).toLocaleString()}</div>
                      <div>Income: ${(holding.monthlyIncome || 0).toFixed(0)}/month</div>
                      <div>vs SPY: {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(2)}%</div>
                      <div>Beta: {holding.riskMetrics.beta.toFixed(2)}</div>
                      <div>Vol: {(holding.riskMetrics.volatility * 100).toFixed(1)}%</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`p-4 ${viewMode === 'compact' ? 'py-3' : ''}`}>
                <div className="flex items-center space-x-4">
                  {/* Ticker and Performance Icon */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <motion.div 
                      className={`p-2 rounded-lg ${
                        isMatching ? 'bg-yellow-100 text-yellow-600' :
                        isOutperforming ? 'bg-green-100 text-green-600' :
                        'bg-red-100 text-red-600'
                      }`}
                      whileHover={{ rotate: 5 }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </motion.div>
                    <div>
                      <div className="font-mono font-bold text-slate-800">{holding.ticker}</div>
                      {viewMode === 'detailed' && (
                        <div className="text-xs text-slate-500">{holding.sector || 'Unknown Sector'}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Yield Trend Sparkline */}
                  {viewMode === 'detailed' && (
                    <div className="flex-shrink-0">
                      <YieldSparkline
                        data={holding.yieldHistory}
                        current={holding.currentYield}
                        width={80}
                        height={24}
                        showValue={false}
                      />
                    </div>
                  )}
                  
                  {/* Risk Indicator */}
                  {viewMode === 'detailed' && (
                    <div className="flex-shrink-0">
                      <RiskIndicator
                        beta={holding.riskMetrics.beta}
                        volatility={holding.riskMetrics.volatility}
                        correlation={holding.riskMetrics.correlation}
                        size="sm"
                      />
                    </div>
                  )}
                  
                  {/* Performance Data */}
                  <div className="flex-1 text-right">
                    <div className={`text-sm font-bold ${
                      isMatching ? 'text-yellow-600' :
                      isOutperforming ? 'text-green-600' :
                      'text-red-600'
                    }`}>
                      {(holdingReturn * 100).toFixed(1)}%
                    </div>
                    <div className={`text-xs ${
                      isMatching ? 'text-yellow-500' :
                      isOutperforming ? 'text-green-500' :
                      'text-red-500'
                    }`}>
                      {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(1)}% vs SPY
                    </div>
                  </div>
                  
                  {/* Value and Income */}
                  <div className="text-right min-w-0">
                    <div className="text-sm font-semibold text-slate-800">
                      ${(holding.currentValue || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      ${(holding.monthlyIncome || 0).toFixed(0)}/mo
                    </div>
                  </div>

                  {/* Current Yield */}
                  <div className="text-right min-w-0">
                    <div className="text-sm font-semibold text-primary-600">
                      {holding.currentYield.toFixed(2)}%
                    </div>
                    <div className="text-xs text-slate-500">
                      Yield
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Summary Statistics */}
      <motion.div 
        className="mt-6 pt-4 border-t border-slate-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            {
              value: enhancedHoldings.filter(h => h.ytdPerformance > spyReturn + 0.005).length,
              label: 'Outperforming',
              subtitle: 'Beating SPY',
              color: 'text-green-600'
            },
            {
              value: enhancedHoldings.filter(h => h.ytdPerformance < spyReturn - 0.005).length,
              label: 'Underperforming', 
              subtitle: 'Below SPY',
              color: 'text-red-600'
            },
            {
              value: `${((enhancedHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0)) / 1000).toFixed(0)}k`,
              label: 'Total Value',
              subtitle: 'All Holdings',
              color: 'text-slate-800'
            },
            {
              value: `$${enhancedHoldings.reduce((sum, h) => sum + (h.monthlyIncome || 0), 0).toFixed(0)}`,
              label: 'Monthly Income',
              subtitle: 'Dividend Flow',
              color: 'text-primary-600'
            },
            {
              value: `${(enhancedHoldings.reduce((sum, h) => sum + h.currentYield, 0) / enhancedHoldings.length).toFixed(2)}%`,
              label: 'Avg Yield',
              subtitle: 'Portfolio',
              color: 'text-purple-600'
            }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center p-3 bg-slate-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <div className={`text-xl font-bold mb-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 mb-1">
                {stat.label}
              </div>
              <div className="text-xs font-medium text-slate-400">
                {stat.subtitle}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Performance Distribution */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Performance Distribution</span>
            <span className="text-xs text-slate-500">
              {displayedHoldings.length} of {enhancedHoldings.length} holdings shown
            </span>
          </div>
          
          <motion.div 
            className="flex h-3 rounded-full overflow-hidden bg-slate-200"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            {enhancedHoldings.length > 0 && (
              <>
                <motion.div 
                  className="bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(enhancedHoldings.filter(h => h.ytdPerformance > spyReturn + 0.005).length / enhancedHoldings.length) * 100}%`
                  }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                />
                <motion.div 
                  className="bg-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(enhancedHoldings.filter(h => Math.abs(h.ytdPerformance - spyReturn) <= 0.005).length / enhancedHoldings.length) * 100}%`
                  }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                />
                <motion.div 
                  className="bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(enhancedHoldings.filter(h => h.ytdPerformance < spyReturn - 0.005).length / enhancedHoldings.length) * 100}%`
                  }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                />
              </>
            )}
          </motion.div>
          
          <div className="flex justify-between text-xs mt-1">
            <span className="text-green-600">Above SPY</span>
            <span className="text-yellow-600">Near SPY</span>
            <span className="text-red-600">Below SPY</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}