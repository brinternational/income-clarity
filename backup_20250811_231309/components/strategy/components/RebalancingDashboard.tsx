'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Activity,
  PieChart,
  Zap,
  Award,
  CheckCircle,
  Minus
} from 'lucide-react';

interface PortfolioDrift {
  asset: string;
  target: number;
  current: number;
  drift: number;
  action: 'Buy' | 'Sell' | 'Hold';
}

interface TradeRecommendation {
  id: string;
  action: 'buy' | 'sell';
  ticker: string;
  shares: number;
  lotId?: string;
  currentPrice: number;
  costBasis: number;
  holdingPeriod: number;
  taxStatus: 'short-term' | 'long-term' | 'qualified' | 'ordinary';
  taxImpact: number;
  reason: string;
}

interface LocationOptimization {
  capitalGainsTax: number;
  dividendTax: number;
  strategy: string;
  specialRules: string[];
  advantages: string[];
}

interface RebalancingDashboardProps {
  portfolioDrift: PortfolioDrift[];
  tradeRecommendations: TradeRecommendation[];
  estimatedSavings: number;
  locationOptimization: LocationOptimization;
  onTradeToggle: (tradeId: string) => void;
  selectedTrades: string[];
}

export const RebalancingDashboard: React.FC<RebalancingDashboardProps> = ({
  portfolioDrift,
  tradeRecommendations,
  estimatedSavings,
  locationOptimization,
  onTradeToggle,
  selectedTrades
}) => {
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'buy':
        return TrendingUp;
      case 'sell':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'buy':
        return 'text-green-600 bg-green-100';
      case 'sell':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDriftColor = (drift: number) => {
    const absDrift = Math.abs(drift);
    if (absDrift === 0) return 'text-green-600';
    if (absDrift < 3) return 'text-yellow-600';
    if (absDrift < 7) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Drift Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-600" />
            Portfolio Drift Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Current allocation vs. target allocation across asset classes
          </p>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Asset</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Target</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Current</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Drift</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolioDrift.map((asset, index) => {
                  const ActionIcon = getActionIcon(asset.action);
                  const actionColor = getActionColor(asset.action);
                  const driftColor = getDriftColor(asset.drift);
                  
                  return (
                    <motion.tr
                      key={asset.asset}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{asset.asset}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-gray-700">{asset.target}%</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-gray-700">{asset.current}%</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold ${driftColor}`}>
                          {asset.drift > 0 ? '+' : ''}{asset.drift}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${actionColor}`}>
                          <ActionIcon className="h-4 w-4" />
                          <span>{asset.action}</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tax-Optimized Trade Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-emerald-600" />
            Tax-Optimized Trade Recommendations
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Smart trades to rebalance your portfolio while minimizing tax impact
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {tradeRecommendations.map((trade, index) => {
              const isSelected = selectedTrades.includes(trade.id);
              const ActionIcon = trade.action === 'buy' ? TrendingUp : TrendingDown;
              const actionColor = trade.action === 'buy' 
                ? 'text-green-600 bg-green-100' 
                : 'text-red-600 bg-red-100';
              
              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => onTradeToggle(trade.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Selection Indicator */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>

                      {/* Action Icon */}
                      <div className={`p-2 rounded-lg ${actionColor}`}>
                        <ActionIcon className="h-5 w-5" />
                      </div>

                      {/* Trade Details */}
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-bold text-gray-900">{trade.ticker}</h4>
                          {trade.taxImpact < 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              Tax Loss
                            </span>
                          )}
                          {trade.taxStatus === 'long-term' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Long-Term
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 capitalize">
                          {trade.action} {trade.shares} shares
                          {trade.lotId && (
                            <span className="ml-2 text-xs text-blue-600">({trade.lotId})</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{trade.reason}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${(trade.shares * trade.currentPrice).toLocaleString()}
                      </p>
                      {trade.taxImpact !== 0 && (
                        <p className={`text-sm ${trade.taxImpact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          Tax Impact: {trade.taxImpact < 0 ? '+' : ''}${Math.abs(trade.taxImpact).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location-Based Tax Advantages */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Award className="h-5 w-5 mr-2 text-purple-600" />
            Location-Based Tax Advantages
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Optimizations available based on your current location
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax Rates */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Current Tax Rates</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Capital Gains Tax:</span>
                  <span className="font-medium text-gray-900">
                    {locationOptimization.capitalGainsTax === 0 
                      ? '0% 🎉' 
                      : `${(locationOptimization.capitalGainsTax * 100).toFixed(1)}%`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dividend Tax:</span>
                  <span className="font-medium text-gray-900">
                    {locationOptimization.dividendTax === 0 
                      ? '0% 🎉' 
                      : `${(locationOptimization.dividendTax * 100).toFixed(1)}%`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strategy Focus:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {locationOptimization.strategy.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Special Rules & Advantages */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Special Advantages</h4>
              <div className="space-y-2">
                {locationOptimization.advantages.map((advantage, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{advantage}</span>
                  </div>
                ))}
              </div>
              
              {locationOptimization.specialRules.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Special Rules:</h5>
                  <div className="flex flex-wrap gap-2">
                    {locationOptimization.specialRules.map((rule, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              ESTIMATE
            </span>
          </div>
          <h3 className="text-2xl font-bold text-green-700">${estimatedSavings.toLocaleString()}</h3>
          <p className="text-sm text-green-600">Annual Tax Savings</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              READY
            </span>
          </div>
          <h3 className="text-2xl font-bold text-blue-700">{tradeRecommendations.length}</h3>
          <p className="text-sm text-blue-600">Trade Recommendations</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              OPTIMAL
            </span>
          </div>
          <h3 className="text-2xl font-bold text-purple-700">
            {Math.max(...portfolioDrift.map(p => Math.abs(p.drift)))}%
          </h3>
          <p className="text-sm text-purple-600">Max Portfolio Drift</p>
        </div>
      </div>
    </div>
  );
};