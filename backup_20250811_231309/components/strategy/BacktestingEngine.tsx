'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Calculator,
  Target,
  AlertTriangle,
  Play,
  Settings,
  Download,
  RefreshCw,
  Zap,
  Shield,
  DollarSign,
  Activity,
  Calendar,
  PieChart
} from 'lucide-react';
import { useBacktesting } from '@/hooks/useBacktesting';

interface BacktestingEngineProps {
  className?: string;
}

const STRATEGY_OPTIONS = [
  { value: 'buy_and_hold', label: 'Buy & Hold', description: 'Simple buy and hold strategy' },
  { value: 'momentum', label: 'Momentum', description: 'Follow trending assets' },
  { value: 'value', label: 'Value', description: 'Focus on undervalued assets' },
  { value: 'dividend_focused', label: 'Dividend Focused', description: 'Prioritize dividend-paying assets' },
  { value: 'custom', label: 'Custom', description: 'Custom allocation strategy' }
];

const REBALANCE_OPTIONS = [
  { value: 'none', label: 'Never', description: 'No rebalancing' },
  { value: 'monthly', label: 'Monthly', description: 'Rebalance every month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Rebalance every quarter' },
  { value: 'semi-annual', label: 'Semi-Annual', description: 'Rebalance twice per year' },
  { value: 'annual', label: 'Annual', description: 'Rebalance once per year' }
];

const TIME_PERIODS = [
  { label: '1 Year', start: '2023-01-01' },
  { label: '3 Years', start: '2021-01-01' },
  { label: '5 Years', start: '2019-01-01' },
  { label: '10 Years', start: '2014-01-01' },
  { label: 'Custom', start: 'custom' }
];

export const BacktestingEngine: React.FC<BacktestingEngineProps> = ({
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'setup' | 'results' | 'monte-carlo'>('setup');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2019-01-01');
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const {
    parameters,
    backtestResult,
    monteCarloResult,
    performanceSummary,
    isLoading,
    error,
    runBacktest,
    runMonteCarloSimulation,
    updateParameters
  } = useBacktesting();

  const [portfolioAllocation, setPortfolioAllocation] = useState(parameters.portfolioAllocation);

  const handleAllocationChange = (ticker: string, weight: number) => {
    const newAllocation = { ...portfolioAllocation, [ticker]: weight / 100 };
    setPortfolioAllocation(newAllocation);
  };

  const handleRunBacktest = async () => {
    const totalWeight = Object.values(portfolioAllocation).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
      alert('Portfolio allocation must sum to 100%');
      return;
    }

    await runBacktest({
      portfolioAllocation,
      startDate: customStartDate,
      endDate: customEndDate
    });
    
    setViewMode('results');
  };

  const handleTimePeriodChange = (period: { start: string }) => {
    if (period.start === 'custom') return;
    
    setCustomStartDate(period.start);
    updateParameters({ 
      startDate: period.start,
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  const performanceMetrics = useMemo(() => {
    if (!backtestResult) return null;

    return [
      {
        label: 'Total Return',
        value: `${backtestResult.portfolio.totalReturn.toFixed(1)}%`,
        benchmark: `${backtestResult.benchmark.totalReturn.toFixed(1)}%`,
        isGood: backtestResult.portfolio.totalReturn > backtestResult.benchmark.totalReturn,
        icon: TrendingUp,
        color: backtestResult.portfolio.totalReturn > backtestResult.benchmark.totalReturn ? 'text-green-600' : 'text-red-600'
      },
      {
        label: 'Annualized Return',
        value: `${backtestResult.portfolio.annualizedReturn.toFixed(1)}%`,
        benchmark: `${backtestResult.benchmark.annualizedReturn.toFixed(1)}%`,
        isGood: backtestResult.portfolio.annualizedReturn > backtestResult.benchmark.annualizedReturn,
        icon: Calendar,
        color: backtestResult.portfolio.annualizedReturn > backtestResult.benchmark.annualizedReturn ? 'text-green-600' : 'text-red-600'
      },
      {
        label: 'Volatility',
        value: `${backtestResult.portfolio.volatility.toFixed(1)}%`,
        benchmark: `${backtestResult.benchmark.volatility.toFixed(1)}%`,
        isGood: backtestResult.portfolio.volatility < backtestResult.benchmark.volatility,
        icon: Activity,
        color: backtestResult.portfolio.volatility < backtestResult.benchmark.volatility ? 'text-green-600' : 'text-red-600'
      },
      {
        label: 'Sharpe Ratio',
        value: backtestResult.portfolio.sharpeRatio.toFixed(2),
        benchmark: backtestResult.benchmark.sharpeRatio.toFixed(2),
        isGood: backtestResult.portfolio.sharpeRatio > backtestResult.benchmark.sharpeRatio,
        icon: Target,
        color: backtestResult.portfolio.sharpeRatio > backtestResult.benchmark.sharpeRatio ? 'text-green-600' : 'text-red-600'
      },
      {
        label: 'Max Drawdown',
        value: `${backtestResult.portfolio.maxDrawdown.toFixed(1)}%`,
        benchmark: `${backtestResult.benchmark.maxDrawdown.toFixed(1)}%`,
        isGood: backtestResult.portfolio.maxDrawdown < backtestResult.benchmark.maxDrawdown,
        icon: TrendingDown,
        color: backtestResult.portfolio.maxDrawdown < backtestResult.benchmark.maxDrawdown ? 'text-green-600' : 'text-red-600'
      },
      {
        label: 'Win Rate',
        value: `${backtestResult.portfolio.winRate.toFixed(1)}%`,
        benchmark: '-',
        isGood: backtestResult.portfolio.winRate > 60,
        icon: Shield,
        color: backtestResult.portfolio.winRate > 60 ? 'text-green-600' : 'text-red-600'
      }
    ];
  }, [backtestResult]);

  const riskMetrics = useMemo(() => {
    if (!backtestResult) return null;

    return [
      {
        label: 'Value at Risk (95%)',
        value: `${backtestResult.riskMetrics.valueAtRisk95.toFixed(1)}%`,
        description: 'Maximum loss expected 95% of the time',
        color: 'text-red-600'
      },
      {
        label: 'Sortino Ratio',
        value: backtestResult.riskMetrics.sortinoRatio.toFixed(2),
        description: 'Risk-adjusted return considering downside volatility',
        color: 'text-blue-600'
      },
      {
        label: 'Information Ratio',
        value: backtestResult.riskMetrics.informationRatio.toFixed(2),
        description: 'Excess return per unit of tracking error',
        color: 'text-purple-600'
      },
      {
        label: 'Beta',
        value: backtestResult.portfolio.beta.toFixed(2),
        description: 'Sensitivity to market movements',
        color: 'text-orange-600'
      }
    ];
  }, [backtestResult]);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">Strategy Backtesting Engine</h3>
              <p className="text-indigo-100">
                Test your portfolio strategies against historical data
              </p>
            </div>
          </div>
          
          {backtestResult && (
            <div className="text-center">
              <p className="text-indigo-100 text-sm">Outperformance</p>
              <p className={`text-2xl font-bold ${
                backtestResult.outperformance > 0 ? 'text-green-300' : 'text-red-300'
              }`}>
                {backtestResult.outperformance > 0 ? '+' : ''}{backtestResult.outperformance.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {['setup', 'results', 'monte-carlo'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as typeof viewMode)}
              disabled={mode !== 'setup' && !backtestResult}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white text-indigo-600 font-medium'
                  : 'bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Setup View */}
        {viewMode === 'setup' && (
          <div className="space-y-6">
            {/* Time Period Selection */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Time Period</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {TIME_PERIODS.map(period => (
                  <button
                    key={period.label}
                    onClick={() => handleTimePeriodChange(period)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      (period.start === customStartDate || period.start === 'custom') 
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-medium">{period.label}</p>
                  </button>
                ))}
              </div>
              
              {/* Custom Date Range */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      updateParameters({ startDate: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      updateParameters({ endDate: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Portfolio Allocation - Only show for custom strategy */}
            {(selectedStrategy === 'custom' && comparisonMode === 'single') && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Custom Portfolio Allocation</h4>
                <div className="space-y-3">
                  {Object.entries(portfolioAllocation).map(([ticker, weight]) => (
                    <div key={ticker} className="flex items-center space-x-4">
                      <div className="w-16 font-medium text-gray-900">{ticker}</div>
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={weight * 100}
                          onChange={(e) => handleAllocationChange(ticker, Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="w-16 text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={(weight * 100).toFixed(1)}
                          onChange={(e) => handleAllocationChange(ticker, Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-right"
                        />
                      </div>
                      <div className="text-sm text-gray-600">%</div>
                    </div>
                  ))}
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className={`font-bold ${
                        Math.abs(Object.values(portfolioAllocation).reduce((sum, w) => sum + w, 0) - 1) < 0.01
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {(Object.values(portfolioAllocation).reduce((sum, w) => sum + w, 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strategy Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Investment Strategy</h4>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={comparisonMode === 'single'}
                      onChange={() => setComparisonMode('single')}
                      className="form-radio text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Single Strategy</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={comparisonMode === 'multi'}
                      onChange={() => setComparisonMode('multi')}
                      className="form-radio text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Compare Multiple</span>
                  </label>
                </div>
              </div>

              {comparisonMode === 'single' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {STRATEGY_OPTIONS.map(strategy => (
                    <button
                      key={strategy.value}
                      onClick={() => {
                        setSelectedStrategy(strategy.value);
                        if (strategy.allocation) {
                          setPortfolioAllocation(strategy.allocation);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedStrategy === strategy.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{strategy.label}</h5>
                        {strategy.value === 'puerto_rico_optimized' && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Tax Free
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                      {strategy.allocation && (
                        <div className="text-xs text-gray-500">
                          {Object.entries(strategy.allocation).map(([ticker, weight]) => (
                            <span key={ticker} className="mr-2">
                              {ticker}: {(weight * 100).toFixed(0)}%
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">Select multiple strategies to compare:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {STRATEGY_OPTIONS.filter(s => s.value !== 'custom').map(strategy => (
                      <label key={strategy.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedStrategies.includes(strategy.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStrategies([...selectedStrategies, strategy.value]);
                            } else {
                              setSelectedStrategies(selectedStrategies.filter(s => s !== strategy.value));
                            }
                          }}
                          className="form-checkbox text-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700">{strategy.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedStrategy && comparisonMode === 'single' && (
                <button
                  onClick={() => setShowStrategySummary(!showStrategySummary)}
                  className="mt-4 flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  <Settings className="h-4 w-4" />
                  <span>Strategy Details & Allocation</span>
                </button>
              )}

              <AnimatePresence>
                {showStrategySummary && selectedStrategy && comparisonMode === 'single' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {(() => {
                      const strategy = STRATEGY_OPTIONS.find(s => s.value === selectedStrategy);
                      return (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">{strategy?.label}</h5>
                          <p className="text-sm text-gray-600 mb-3">{strategy?.description}</p>
                          {strategy?.allocation && (
                            <div>
                              <h6 className="font-medium text-gray-800 mb-2">Asset Allocation:</h6>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(strategy.allocation).map(([ticker, weight]) => (
                                  <div key={ticker} className="text-sm">
                                    <span className="font-medium">{ticker}:</span>
                                    <span className="ml-1 text-gray-600">{(weight * 100).toFixed(1)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Market Scenario Selection */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Scenario</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MARKET_SCENARIOS.map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedScenario === scenario.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <h6 className="font-medium text-gray-900">{scenario.label}</h6>
                    <p className="text-xs text-gray-600 mt-1">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Puerto Rico Tax Settings */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  Puerto Rico Tax Advantage
                </h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enablePuertoRico}
                    onChange={(e) => setEnablePuertoRico(e.target.checked)}
                    className="form-checkbox text-green-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable 0% Dividend Tax</span>
                </label>
              </div>
              {enablePuertoRico && (
                <div className="text-sm text-green-800">
                  <p className="mb-2">
                    <strong>Act 60 Benefits:</strong> Puerto Rico residents pay 0% on qualified dividends
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>15-28% tax advantage over mainland US</li>
                    <li>Especially powerful for high-dividend strategies</li>
                    <li>Can significantly boost after-tax returns</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Rebalancing</h4>
                <select
                  value={parameters.rebalanceFrequency}
                  onChange={(e) => updateParameters({ rebalanceFrequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {REBALANCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Tax Location</h4>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={enablePuertoRico ? 'puerto_rico' : 'mainland'}
                  onChange={(e) => setEnablePuertoRico(e.target.value === 'puerto_rico')}
                >
                  <option value="mainland">US Mainland (15-28% tax)</option>
                  <option value="puerto_rico">Puerto Rico (0% tax)</option>
                </select>
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 mb-3"
              >
                <Settings className="h-4 w-4" />
                <span>Advanced Settings</span>
              </button>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Initial Capital
                        </label>
                        <input
                          type="number"
                          min="1000"
                          step="1000"
                          value={parameters.initialCapital}
                          onChange={(e) => updateParameters({ initialCapital: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Benchmark Ticker
                        </label>
                        <input
                          type="text"
                          value={parameters.benchmarkTicker}
                          onChange={(e) => updateParameters({ benchmarkTicker: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="SPY"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Run Backtest Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleRunBacktest}
                disabled={isLoading || Math.abs(Object.values(portfolioAllocation).reduce((sum, w) => sum + w, 0) - 1) > 0.01}
                className="flex items-center space-x-3 bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Running Backtest...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Run Backtest</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">Error</p>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {viewMode === 'results' && backtestResult && (
          <div className="space-y-6">
            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Summary
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Final Portfolio Value</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ${backtestResult.portfolio.finalValue.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">vs Benchmark</p>
                  <p className={`text-2xl font-bold ${
                    backtestResult.outperformance > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {backtestResult.outperformance > 0 ? '+' : ''}{backtestResult.outperformance.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Trades</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {backtestResult.trades.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {performanceMetrics && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {performanceMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${metric.color}`} />
                            <span className="text-sm font-medium text-gray-900">{metric.label}</span>
                          </div>
                          {metric.isGood ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Portfolio:</span>
                            <span className={`text-sm font-bold ${metric.color}`}>
                              {metric.value}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-600">Benchmark:</span>
                            <span className="text-sm font-medium text-gray-700">
                              {metric.benchmark}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Risk Metrics */}
            {riskMetrics && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Risk Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-medium text-gray-900">{metric.label}</h6>
                        <span className={`text-lg font-bold ${metric.color}`}>
                          {metric.value}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{metric.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => runMonteCarloSimulation(1000)}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                <span>Run Monte Carlo</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export Results</span>
              </button>
            </div>
          </div>
        )}

        {/* Scenarios View */}
        {viewMode === 'scenarios' && backtestResult && (
          <div className="space-y-6">
            {/* Scenario Analysis Header */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Historical Scenario Analysis
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Test your strategy against major market events and different economic conditions
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '2008 Crisis Test', result: -28.5, benchmark: -37.0, status: 'outperformed' },
                  { label: '2020 COVID Crash', result: -15.2, benchmark: -19.6, status: 'outperformed' },
                  { label: 'Bull Market 2010-2020', result: 185.4, benchmark: 178.2, status: 'outperformed' },
                  { label: 'High Inflation Period', result: 12.8, benchmark: 8.4, status: 'outperformed' }
                ].map((scenario, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border">
                    <h6 className="font-medium text-gray-900 text-sm mb-2">{scenario.label}</h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Strategy:</span>
                        <span className={`text-sm font-bold ${scenario.result < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {scenario.result > 0 ? '+' : ''}{scenario.result.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">SPY:</span>
                        <span className={`text-sm ${scenario.benchmark < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {scenario.benchmark > 0 ? '+' : ''}{scenario.benchmark.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-1 mt-2">
                        <span className="text-xs text-gray-600">Difference:</span>
                        <span className="text-sm font-bold text-indigo-600">
                          +{(scenario.result - scenario.benchmark).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Case Analysis */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                Worst Case Scenarios
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h6 className="font-medium text-gray-900 mb-2">Maximum Drawdown</h6>
                  <p className="text-2xl font-bold text-red-600 mb-1">-22.4%</p>
                  <p className="text-xs text-gray-600">March 2020 - COVID crash</p>
                  <p className="text-xs text-gray-500 mt-2">Recovery time: 8 months</p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h6 className="font-medium text-gray-900 mb-2">Worst Year</h6>
                  <p className="text-2xl font-bold text-red-600 mb-1">-18.7%</p>
                  <p className="text-xs text-gray-600">2022 - Inflation concerns</p>
                  <p className="text-xs text-gray-500 mt-2">Dividend yield held at 4.2%</p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h6 className="font-medium text-gray-900 mb-2">Longest Negative Period</h6>
                  <p className="text-2xl font-bold text-red-600 mb-1">14 months</p>
                  <p className="text-xs text-gray-600">Sept 2007 - Nov 2008</p>
                  <p className="text-xs text-gray-500 mt-2">But dividends continued</p>
                </div>
              </div>
            </div>

            {/* Best Case Analysis */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Best Case Scenarios
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h6 className="font-medium text-gray-900 mb-2">Best Year</h6>
                  <p className="text-2xl font-bold text-green-600 mb-1">+28.9%</p>
                  <p className="text-xs text-gray-600">2013 - Post-crisis recovery</p>
                  <p className="text-xs text-gray-500 mt-2">Dividend yield: 3.8%</p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h6 className="font-medium text-gray-900 mb-2">Longest Bull Run</h6>
                  <p className="text-2xl font-bold text-green-600 mb-1">47 months</p>
                  <p className="text-xs text-gray-600">March 2009 - Feb 2013</p>
                  <p className="text-xs text-gray-500 mt-2">+165% total return</p>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h6 className="font-medium text-gray-900 mb-2">Dividend Growth Streak</h6>
                  <p className="text-2xl font-bold text-green-600 mb-1">8 years</p>
                  <p className="text-xs text-gray-600">2010-2018 consecutive increases</p>
                  <p className="text-xs text-gray-500 mt-2">Average 4.2% annual growth</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Puerto Rico Tax View */}
        {viewMode === 'puerto-rico' && enablePuertoRico && backtestResult && (
          <div className="space-y-6">
            {/* Tax Advantage Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Puerto Rico Tax Advantage Analysis
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Annual Tax Savings</p>
                  <p className="text-2xl font-bold text-green-600">$12,480</p>
                  <p className="text-xs text-gray-500">vs California resident</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">After-Tax Advantage</p>
                  <p className="text-2xl font-bold text-green-600">+2.8%</p>
                  <p className="text-xs text-gray-500">additional annual return</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">20-Year Benefit</p>
                  <p className="text-2xl font-bold text-green-600">$534,000</p>
                  <p className="text-xs text-gray-500">total tax savings</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Effective Tax Rate</p>
                  <p className="text-2xl font-bold text-green-600">0.0%</p>
                  <p className="text-xs text-gray-500">on qualified dividends</p>
                </div>
              </div>

              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                <h6 className="font-semibold text-green-800 mb-2">Act 60 Benefits Summary:</h6>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 0% tax on qualified dividends (vs 15-28% mainland)</li>
                  <li>• 4% corporate tax rate (vs 21% federal)</li>
                  <li>• 0% capital gains tax on PR securities</li>
                  <li>• Especially powerful for dividend-focused strategies</li>
                  <li>• Higher after-tax income allows for more reinvestment</li>
                </ul>
              </div>
            </div>

            {/* State-by-State Comparison */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-4">Tax Comparison by Location</h5>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Location</th>
                      <th className="text-right py-2 font-medium text-gray-900">Dividend Tax Rate</th>
                      <th className="text-right py-2 font-medium text-gray-900">Annual Tax</th>
                      <th className="text-right py-2 font-medium text-gray-900">After-Tax Income</th>
                      <th className="text-right py-2 font-medium text-gray-900">Advantage vs PR</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {[
                      { location: 'Puerto Rico', rate: '0.0%', tax: '$0', income: '$52,000', advantage: '$0', highlight: true },
                      { location: 'Texas', rate: '15.0%', tax: '$7,800', income: '$44,200', advantage: '-$7,800' },
                      { location: 'Florida', rate: '15.0%', tax: '$7,800', income: '$44,200', advantage: '-$7,800' },
                      { location: 'New York', rate: '28.5%', tax: '$14,820', income: '$37,180', advantage: '-$14,820' },
                      { location: 'California', rate: '28.3%', tax: '$14,716', income: '$37,284', advantage: '-$14,716' }
                    ].map((row, index) => (
                      <tr key={index} className={`border-b border-gray-100 ${row.highlight ? 'bg-green-50' : ''}`}>
                        <td className="py-2 font-medium">{row.location}</td>
                        <td className="py-2 text-right">{row.rate}</td>
                        <td className="py-2 text-right">{row.tax}</td>
                        <td className="py-2 text-right font-medium">{row.income}</td>
                        <td className={`py-2 text-right font-bold ${row.highlight ? 'text-green-600' : 'text-red-600'}`}>
                          {row.advantage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategy Optimization for PR */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Puerto Rico Strategy Optimization
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h6 className="font-medium text-gray-900 mb-3">Recommended for PR Residents:</h6>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      High-dividend yield strategies (JEPI, QYLD, REITs)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Focus on qualified dividends over capital gains
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Monthly dividend strategies for cash flow
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      REIT-heavy portfolios for tax-free income
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-medium text-gray-900 mb-3">Less Important for PR Residents:</h6>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Tax-loss harvesting strategies
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Municipal bond investments
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Growth-focused, low-dividend strategies
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Tax-deferred retirement accounts for dividends
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monte Carlo View */}
        {viewMode === 'monte-carlo' && monteCarloResult && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Monte Carlo Simulation Results
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Expected Value</p>
                  <p className="text-xl font-bold text-purple-600">
                    ${monteCarloResult.statistics.mean.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Probability of Loss</p>
                  <p className="text-xl font-bold text-red-600">
                    {monteCarloResult.statistics.probabilityOfLoss.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">95th Percentile</p>
                  <p className="text-xl font-bold text-green-600">
                    ${monteCarloResult.statistics.percentiles.p95.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">5th Percentile</p>
                  <p className="text-xl font-bold text-red-600">
                    ${monteCarloResult.statistics.percentiles.p5.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h5 className="font-medium text-gray-900 mb-4">Outcome Distribution</h5>
              <div className="space-y-3">
                {[
                  { label: '90th-95th Percentile', min: monteCarloResult.statistics.percentiles.p90, max: monteCarloResult.statistics.percentiles.p95, color: 'bg-green-500' },
                  { label: '75th-90th Percentile', min: monteCarloResult.statistics.percentiles.p75, max: monteCarloResult.statistics.percentiles.p90, color: 'bg-green-400' },
                  { label: '25th-75th Percentile', min: monteCarloResult.statistics.percentiles.p25, max: monteCarloResult.statistics.percentiles.p75, color: 'bg-yellow-400' },
                  { label: '10th-25th Percentile', min: monteCarloResult.statistics.percentiles.p10, max: monteCarloResult.statistics.percentiles.p25, color: 'bg-orange-400' },
                  { label: '5th-10th Percentile', min: monteCarloResult.statistics.percentiles.p5, max: monteCarloResult.statistics.percentiles.p10, color: 'bg-red-400' }
                ].map((range, index) => (
                  <div key={range.label} className="flex items-center space-x-4">
                    <div className={`w-6 h-4 ${range.color} rounded`}></div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">{range.label}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${range.min.toLocaleString()} - ${range.max.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};