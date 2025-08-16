'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  BarChart3,
  AlertTriangle,
  Zap,
  Activity,
  Clock,
  Users,
  Award,
  Timer,
  FileText,
  Info
} from 'lucide-react';
import { useAdvancedRebalancing } from '@/hooks/useAdvancedRebalancing';

interface AdvancedRebalancerProps {
  className?: string;
}

const PRIORITY_COLORS = {
  high: 'red',
  medium: 'yellow',
  low: 'blue'
};

const ACTION_ICONS = {
  buy: TrendingUp,
  sell: TrendingDown,
  hold: Target
};

export const AdvancedRebalancer: React.FC<AdvancedRebalancerProps> = ({
  className = ''
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState('moderate');
  const [viewMode, setViewMode] = useState<'recommendations' | 'analysis' | 'schedule'>('recommendations');
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [executionMode, setExecutionMode] = useState<'manual' | 'auto'>('manual');

  const {
    portfolio,
    recommendations,
    taxOptimization,
    strategy,
    availableStrategies,
    isLoading,
    error,
    portfolioValue,
    getRebalancingSchedule,
    getEfficiencyMetrics,
    executeRebalancing,
    getRebalancingCost
  } = useAdvancedRebalancing({
    strategy: availableStrategies.find(s => s.id === selectedStrategy)
  });

  const efficiencyMetrics = useMemo(() => {
    return getEfficiencyMetrics();
  }, [getEfficiencyMetrics]);

  const rebalancingCost = useMemo(() => {
    return getRebalancingCost();
  }, [getRebalancingCost]);

  const schedule = useMemo(() => {
    return getRebalancingSchedule();
  }, [getRebalancingSchedule]);

  const activeRecommendations = useMemo(() => {
    return recommendations.filter(rec => rec.action !== 'hold');
  }, [recommendations]);

  const taxLossOpportunities = useMemo(() => {
    return recommendations.filter(rec => rec.washSaleRisk);
  }, [recommendations]);

  const handleRecommendationToggle = (ticker: string) => {
    setSelectedRecommendations(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    );
  };

  const handleExecuteSelected = async () => {
    if (selectedRecommendations.length === 0) return;
    
    try {
      const results = await executeRebalancing(selectedRecommendations);
      // console.log('Executed trades:', results);
      // In a real app, show success notification and update UI
    } catch (error) {
      // Error handled by emergency recovery script;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">Advanced Rebalancer</h3>
              <p className="text-blue-100">
                Tax-optimized portfolio rebalancing with intelligent automation
              </p>
            </div>
          </div>
          
          {/* Strategy Selector */}
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {availableStrategies.map(strat => (
              <option key={strat.id} value={strat.id} className="text-gray-900">
                {strat.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {['recommendations', 'analysis', 'schedule'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as typeof viewMode)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white text-blue-600 font-medium'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Status Banner */}
      <div className={`border-b p-4 ${
        efficiencyMetrics.status === 'needs_rebalancing' 
          ? 'bg-orange-50 border-orange-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {efficiencyMetrics.status === 'needs_rebalancing' ? (
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
            <div>
              <p className={`font-bold ${
                efficiencyMetrics.status === 'needs_rebalancing' ? 'text-orange-800' : 'text-green-800'
              }`}>
                {efficiencyMetrics.status === 'needs_rebalancing' 
                  ? `${efficiencyMetrics.needsRebalancing} positions need rebalancing`
                  : 'Portfolio is balanced'
                }
              </p>
              <p className={`text-sm ${
                efficiencyMetrics.status === 'needs_rebalancing' ? 'text-orange-700' : 'text-green-700'
              }`}>
                Efficiency Score: {efficiencyMetrics.efficiency.toFixed(1)}% • 
                Max Deviation: {(efficiencyMetrics.maxDeviation * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${portfolioValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Portfolio Value</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Recommendations View */}
        {viewMode === 'recommendations' && (
          <div className="space-y-6">
            {/* Execution Controls */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Rebalancing Recommendations</h4>
                  <p className="text-sm text-gray-600">
                    {activeRecommendations.length} actions recommended • 
                    Est. cost: ${rebalancingCost.totalCost.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Execution Mode Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExecutionMode('manual')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        executionMode === 'manual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      onClick={() => setExecutionMode('auto')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        executionMode === 'auto'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      Auto
                    </button>
                  </div>
                  
                  {/* Execute Button */}
                  <button
                    onClick={handleExecuteSelected}
                    disabled={selectedRecommendations.length === 0}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4" />
                    <span>Execute Selected</span>
                  </button>
                </div>
              </div>

              {/* Tax Optimization Summary */}
              {taxOptimization && (
                <div className="space-y-4">
                  {/* Primary Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Tax Savings</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        ${taxOptimization.taxSavings.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Harvestable Losses</span>
                      </div>
                      <p className="text-lg font-bold text-orange-600">
                        ${taxOptimization.harvestableLosses.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Tax Bill</span>
                      </div>
                      <p className="text-lg font-bold text-red-600">
                        ${taxOptimization.estimatedTaxBill.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Actions</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {activeRecommendations.length}
                      </p>
                    </div>
                  </div>

                  {/* Advanced Tax Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Optimal Rebalance Date</span>
                      </div>
                      <p className="text-sm font-bold text-purple-600">
                        {new Date(taxOptimization.optimalRebalanceDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Minimize short-term gains</p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Timer className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Long-Term Opportunity</span>
                      </div>
                      <p className="text-sm font-bold text-yellow-600">
                        ${taxOptimization.longTermGainsOpportunity.toLocaleString()}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">Potential tax savings</p>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-800">Blocked Trades</span>
                      </div>
                      <p className="text-sm font-bold text-indigo-600">
                        {taxOptimization.washSaleAvoidance.blockedTickers.length}
                      </p>
                      <p className="text-xs text-indigo-600 mt-1">Wash sale prevention</p>
                    </div>
                  </div>

                  {/* Wash Sale Avoidance */}
                  {taxOptimization.washSaleAvoidance.alternativeRecommendations.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Alternative Recommendations
                      </h5>
                      <div className="space-y-2">
                        {taxOptimization.washSaleAvoidance.alternativeRecommendations.slice(0, 3).map((alt, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{alt.original}</span>
                              <span className="text-gray-400">→</span>
                              <span className="font-medium text-blue-600">{alt.alternative}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Info className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">Wash sale avoidance</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tax Lot Optimization */}
                  {taxOptimization.taxLotOptimization.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Tax Lot Optimization
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {taxOptimization.taxLotOptimization.slice(0, 4).map((lot, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                            <div>
                              <span className="font-medium text-gray-900">{lot.ticker}</span>
                              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                {lot.recommendedLot}
                              </span>
                            </div>
                            <span className="text-sm text-green-600 font-medium">
                              +${lot.potentialSavings.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              {recommendations.map((rec, index) => {
                const ActionIcon = ACTION_ICONS[rec.action];
                const priorityColor = PRIORITY_COLORS[rec.priority];
                const isSelected = selectedRecommendations.includes(rec.ticker);
                
                return (
                  <motion.div
                    key={rec.ticker}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      rec.action === 'hold'
                        ? 'bg-gray-50 border-gray-200'
                        : isSelected
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => rec.action !== 'hold' && handleRecommendationToggle(rec.ticker)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Selection Checkbox */}
                        {rec.action !== 'hold' && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                        )}

                        {/* Action Icon */}
                        <div className={`p-2 rounded-lg ${
                          rec.action === 'buy' ? 'bg-green-100' :
                          rec.action === 'sell' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          <ActionIcon className={`h-5 w-5 ${
                            rec.action === 'buy' ? 'text-green-600' :
                            rec.action === 'sell' ? 'text-red-600' :
                            'text-gray-600'
                          }`} />
                        </div>

                        {/* Details */}
                        <div>
                          <div className="flex items-center space-x-3">
                            <h5 className="font-bold text-gray-900">{rec.ticker}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              priorityColor === 'red' ? 'bg-red-100 text-red-800' :
                              priorityColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {rec.priority}
                            </span>
                            {rec.washSaleRisk && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                                <Zap className="h-3 w-3 mr-1" />
                                Tax Loss
                              </span>
                            )}
                            {rec.isLongTerm && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
                                <Timer className="h-3 w-3 mr-1" />
                                Long-Term
                              </span>
                            )}
                            {rec.alternatives && rec.alternatives.length > 0 && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                Alt Available
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 capitalize">
                            {rec.action} {rec.shares > 0 && `${rec.shares} shares`}
                            {rec.holdPeriod && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Held {Math.floor(rec.holdPeriod / 30)} months)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
                          {rec.taxLot && (
                            <p className="text-xs text-blue-600 mt-1">
                              Tax Lot: {rec.taxLot.method} (${rec.taxLot.costBasis.toLocaleString()} basis)
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${rec.amount.toLocaleString()}
                        </p>
                        {rec.taxImpact > 0 && (
                          <p className="text-sm text-red-600">
                            Tax: ${rec.taxImpact.toLocaleString()}
                          </p>
                        )}
                        {rec.washSaleRisk && (
                          <p className="text-sm text-green-600">
                            Tax Benefit
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Tax Loss Harvesting Opportunities */}
            {taxLossOpportunities.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Tax-Loss Harvesting Opportunities
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  {taxLossOpportunities.length} positions can be harvested for tax losses, 
                  potentially saving ${taxOptimization?.taxSavings.toLocaleString()} in taxes.
                </p>
                <div className="space-y-2">
                  {taxLossOpportunities.map(opp => (
                    <div key={opp.ticker} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="font-medium text-gray-900">{opp.ticker}</span>
                      <span className="text-sm text-green-600">
                        Save ${opp.taxImpact.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analysis View */}
        {viewMode === 'analysis' && (
          <div className="space-y-6">
            {/* Portfolio Allocation Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Current vs Target Allocation
              </h4>
              <div className="space-y-4">
                {portfolio.map(holding => {
                  const deviation = holding.currentWeight - holding.targetWeight;
                  const deviationPercent = deviation * 100;
                  
                  return (
                    <div key={holding.ticker} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{holding.ticker}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            Current: {(holding.currentWeight * 100).toFixed(1)}%
                          </span>
                          <span className="text-gray-600">
                            Target: {(holding.targetWeight * 100).toFixed(1)}%
                          </span>
                          <span className={`font-medium ${
                            Math.abs(deviationPercent) < 1 ? 'text-green-600' :
                            Math.abs(deviationPercent) < 5 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {deviationPercent > 0 ? '+' : ''}{deviationPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bars */}
                      <div className="relative">
                        {/* Target allocation bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                          <div
                            className="bg-blue-300 h-3 rounded-full"
                            style={{ width: `${holding.targetWeight * 100}%` }}
                          />
                        </div>
                        
                        {/* Current allocation bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              Math.abs(deviation) < 0.01 ? 'bg-green-500' :
                              Math.abs(deviation) < 0.05 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${holding.currentWeight * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategy Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-4">Current Strategy</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium text-blue-900">{strategy.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risk Level:</span>
                    <span className={`font-medium capitalize ${
                      strategy.riskLevel === 'aggressive' ? 'text-red-600' :
                      strategy.riskLevel === 'moderate' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {strategy.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Frequency:</span>
                    <span className="font-medium text-blue-900 capitalize">
                      {strategy.rebalanceFrequency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Threshold:</span>
                    <span className="font-medium text-blue-900">
                      {(strategy.thresholdTolerance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h5 className="font-semibold text-green-800 mb-4">Performance Metrics</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Efficiency Score:</span>
                    <span className="font-bold text-green-600">
                      {efficiencyMetrics.efficiency.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Max Deviation:</span>
                    <span className="font-medium text-green-900">
                      {(efficiencyMetrics.maxDeviation * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Positions in Range:</span>
                    <span className="font-medium text-green-900">
                      {efficiencyMetrics.totalPositions - efficiencyMetrics.needsRebalancing}/
                      {efficiencyMetrics.totalPositions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tax Optimized:</span>
                    <span className={`font-medium ${
                      strategy.taxOptimized ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {strategy.taxOptimized ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule View */}
        {viewMode === 'schedule' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Rebalancing Schedule
            </h4>

            <div className="space-y-4">
              {schedule.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.date.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600 capitalize">
                      {event.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {index === 0 ? 'Next' : `+${index} periods`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Auto-Rebalancing Settings */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-4">Automation Settings</h5>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Automatic Rebalancing</p>
                    <p className="text-sm text-gray-600">
                      Execute rebalancing automatically when thresholds are exceeded
                    </p>
                  </div>
                  <button
                    onClick={() => setExecutionMode(executionMode === 'auto' ? 'manual' : 'auto')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      executionMode === 'auto'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {executionMode === 'auto' ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Tax-Loss Harvesting</p>
                    <p className="text-sm text-gray-600">
                      Automatically harvest tax losses when opportunities arise
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white">
                    Enabled
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};