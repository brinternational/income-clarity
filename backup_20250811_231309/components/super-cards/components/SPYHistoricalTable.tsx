'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Award, Target, Clock } from 'lucide-react';
import { SPYHistoricalData, TimePeriod } from '@/hooks/useSPYIntelligence';

interface SPYHistoricalTableProps {
  data: SPYHistoricalData[];
  selectedPeriod: TimePeriod;
  onPeriodSelect: (period: TimePeriod) => void;
  isLoading?: boolean;
}

const periodLabels: Record<TimePeriod, string> = {
  '1M': '1 Month',
  '3M': '3 Months', 
  '6M': '6 Months',
  '1Y': '1 Year',
  '5Y': '5 Years'
};

const SPYHistoricalTableComponent = ({
  data,
  selectedPeriod,
  onPeriodSelect,
  isLoading = false
}: SPYHistoricalTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-4 bg-slate-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedData = data.find(d => d.period === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-4 h-4 text-slate-600" />
          <h4 className="font-semibold text-slate-800">Historical Performance</h4>
        </div>
        
        <div className="flex bg-slate-50 rounded-lg p-1 gap-1 overflow-x-auto">
          {data.map(({ period }) => (
            <button
              key={period}
              onClick={() => onPeriodSelect(period)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 touch-friendly ${
                selectedPeriod === period
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Period Details */}
      {selectedData && (
        <motion.div
          key={selectedPeriod}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-25 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-slate-800">{periodLabels[selectedData.period]} Performance</h5>
                <p className="text-xs text-slate-600 mt-1">
                  Detailed analysis and risk metrics
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                selectedData.outperformance > 0 
                  ? 'bg-prosperity-100 text-prosperity-600' 
                  : 'bg-wealth-100 text-wealth-600'
              }`}>
                {selectedData.outperformance > 0 ? (
                  <Award className="w-5 h-5" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {/* Portfolio Return */}
              <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-25 rounded-lg border border-primary-100">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-4 h-4 text-primary-600 mr-1" />
                  <span className="text-xs text-slate-600">Portfolio</span>
                </div>
                <div className="text-xl font-bold text-primary-600 mb-1">
                  {selectedData.portfolioReturn >= 0 ? '+' : ''}{(selectedData.portfolioReturn * 100).toFixed(1)}%
                </div>
                <div className="flex items-center justify-center">
                  {selectedData.portfolioReturn >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-prosperity-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-alert-500" />
                  )}
                </div>
              </div>

              {/* SPY Return */}
              <div className="text-center p-4 bg-gradient-to-br from-wealth-50 to-wealth-25 rounded-lg border border-wealth-100">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-4 h-4 text-wealth-600 mr-1" />
                  <span className="text-xs text-slate-600">SPY</span>
                </div>
                <div className="text-xl font-bold text-wealth-600 mb-1">
                  {selectedData.spyReturn >= 0 ? '+' : ''}{(selectedData.spyReturn * 100).toFixed(1)}%
                </div>
                <div className="flex items-center justify-center">
                  {selectedData.spyReturn >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-prosperity-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-alert-500" />
                  )}
                </div>
              </div>

              {/* Outperformance */}
              <div className={`text-center p-4 bg-gradient-to-br rounded-lg border ${
                selectedData.outperformance > 0 
                  ? 'from-prosperity-50 to-prosperity-25 border-prosperity-100'
                  : 'from-alert-50 to-alert-25 border-alert-100'
              }`}>
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-4 h-4 text-slate-600 mr-1" />
                  <span className="text-xs text-slate-600">Alpha</span>
                </div>
                <div className={`text-xl font-bold mb-1 ${
                  selectedData.outperformance > 0 ? 'text-prosperity-600' : 'text-alert-600'
                }`}>
                  {selectedData.outperformance >= 0 ? '+' : ''}{(selectedData.outperformance * 100).toFixed(1)}%
                </div>
                <div className="flex items-center justify-center">
                  {selectedData.outperformance >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-prosperity-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-alert-500" />
                  )}
                </div>
              </div>

              {/* Win Rate */}
              <div className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-25 rounded-lg border border-secondary-100">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-4 h-4 text-secondary-600 mr-1" />
                  <span className="text-xs text-slate-600">Win Rate</span>
                </div>
                <div className="text-xl font-bold text-secondary-600 mb-1">
                  {(selectedData.winRate * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-secondary-600 font-medium">
                  Success Rate
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div>
              <h6 className="font-semibold text-slate-800 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 text-slate-600 mr-2" />
                Risk Analysis
              </h6>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Volatility */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Volatility</div>
                  <div className="text-lg font-bold text-slate-800">
                    {(selectedData.volatility * 100).toFixed(1)}%
                  </div>
                  <div className={`text-xs font-medium ${
                    selectedData.volatility < 0.15 ? 'text-prosperity-600' : 
                    selectedData.volatility < 0.25 ? 'text-wealth-600' : 'text-alert-600'
                  }`}>
                    {selectedData.volatility < 0.15 ? 'Low Risk' : 
                     selectedData.volatility < 0.25 ? 'Moderate Risk' : 'High Risk'}
                  </div>
                </div>

                {/* Sharpe Ratio */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Sharpe Ratio</div>
                  <div className="text-lg font-bold text-slate-800">
                    {selectedData.sharpeRatio.toFixed(2)}
                  </div>
                  <div className={`text-xs font-medium ${
                    selectedData.sharpeRatio > 1 ? 'text-prosperity-600' : 
                    selectedData.sharpeRatio > 0.5 ? 'text-wealth-600' : 'text-alert-600'
                  }`}>
                    {selectedData.sharpeRatio > 1 ? 'Excellent' : 
                     selectedData.sharpeRatio > 0.5 ? 'Good' : 'Poor'}
                  </div>
                </div>

                {/* Max Drawdown */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Max Drawdown</div>
                  <div className="text-lg font-bold text-slate-800">
                    {(selectedData.maxDrawdown * 100).toFixed(1)}%
                  </div>
                  <div className={`text-xs font-medium ${
                    selectedData.maxDrawdown > -0.1 ? 'text-prosperity-600' : 
                    selectedData.maxDrawdown > -0.2 ? 'text-wealth-600' : 'text-alert-600'
                  }`}>
                    {selectedData.maxDrawdown > -0.1 ? 'Low Risk' : 
                     selectedData.maxDrawdown > -0.2 ? 'Moderate' : 'High Risk'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* All Periods Summary Table - Mobile Optimized */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h6 className="font-semibold text-slate-800">Performance Summary</h6>
          <p className="text-xs text-slate-600 mt-1">All time periods comparison</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-25">
                <th className="text-left p-3 text-xs font-medium text-slate-600 uppercase tracking-wide">Period</th>
                <th className="text-right p-3 text-xs font-medium text-slate-600 uppercase tracking-wide">Portfolio</th>
                <th className="text-right p-3 text-xs font-medium text-slate-600 uppercase tracking-wide">SPY</th>
                <th className="text-right p-3 text-xs font-medium text-slate-600 uppercase tracking-wide">Alpha</th>
                <th className="text-right p-3 text-xs font-medium text-slate-600 uppercase tracking-wide">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, index) => (
                <motion.tr
                  key={item.period}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedPeriod === item.period ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => onPeriodSelect(item.period)}
                >
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedPeriod === item.period ? 'bg-primary-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-sm font-medium text-slate-800">{item.period}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className={`text-sm font-semibold ${
                      item.portfolioReturn >= 0 ? 'text-prosperity-600' : 'text-alert-600'
                    }`}>
                      {item.portfolioReturn >= 0 ? '+' : ''}{(item.portfolioReturn * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={`text-sm font-semibold ${
                      item.spyReturn >= 0 ? 'text-prosperity-600' : 'text-alert-600'
                    }`}>
                      {item.spyReturn >= 0 ? '+' : ''}{(item.spyReturn * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <span className={`text-sm font-bold ${
                        item.outperformance >= 0 ? 'text-prosperity-600' : 'text-alert-600'
                      }`}>
                        {item.outperformance >= 0 ? '+' : ''}{(item.outperformance * 100).toFixed(1)}%
                      </span>
                      {item.outperformance >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-prosperity-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-alert-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm font-semibold text-secondary-600">
                      {(item.winRate * 100).toFixed(0)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const SPYHistoricalTable = memo(SPYHistoricalTableComponent);