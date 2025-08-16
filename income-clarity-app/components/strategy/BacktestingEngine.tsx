'use client';

import React, { useState } from 'react';
import { Activity, Calendar, TrendingUp, TrendingDown, BarChart3, Zap } from 'lucide-react';

interface BacktestResult {
  strategy: string;
  period: string;
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  calmarRatio: number;
}

interface BacktestingEngineProps {
  results?: BacktestResult[];
  className?: string;
}

export function BacktestingEngine({ 
  results = [
    {
      strategy: 'Current Portfolio',
      period: '2020-2024',
      totalReturn: 42.8,
      annualizedReturn: 8.2,
      volatility: 14.5,
      sharpeRatio: 0.65,
      maxDrawdown: -18.2,
      calmarRatio: 0.45
    },
    {
      strategy: 'High Dividend Strategy',
      period: '2020-2024',
      totalReturn: 35.2,
      annualizedReturn: 6.8,
      volatility: 11.8,
      sharpeRatio: 0.72,
      maxDrawdown: -14.6,
      calmarRatio: 0.47
    },
    {
      strategy: 'Growth Strategy',
      period: '2020-2024',
      totalReturn: 68.4,
      annualizedReturn: 11.5,
      volatility: 22.1,
      sharpeRatio: 0.58,
      maxDrawdown: -28.5,
      calmarRatio: 0.40
    },
    {
      strategy: 'SPY Benchmark',
      period: '2020-2024',
      totalReturn: 48.6,
      annualizedReturn: 9.3,
      volatility: 16.2,
      sharpeRatio: 0.61,
      maxDrawdown: -23.9,
      calmarRatio: 0.39
    }
  ],
  className = ''
}: BacktestingEngineProps) {

  const [selectedMetric, setSelectedMetric] = useState<keyof BacktestResult>('annualizedReturn');
  const [timePeriod, setTimePeriod] = useState('2020-2024');

  const metrics = [
    { key: 'annualizedReturn' as const, label: 'Annual Return', suffix: '%', higherIsBetter: true },
    { key: 'volatility' as const, label: 'Volatility', suffix: '%', higherIsBetter: false },
    { key: 'sharpeRatio' as const, label: 'Sharpe Ratio', suffix: '', higherIsBetter: true },
    { key: 'maxDrawdown' as const, label: 'Max Drawdown', suffix: '%', higherIsBetter: false },
    { key: 'calmarRatio' as const, label: 'Calmar Ratio', suffix: '', higherIsBetter: true }
  ];

  const timePeriods = ['2020-2024', '2015-2024', '2010-2024', '2000-2024'];

  const getBestStrategy = (metric: keyof BacktestResult) => {
    const metricInfo = metrics.find(m => m.key === metric);
    if (!metricInfo) return results[0];
    
    return results.reduce((best, current) => {
      const currentVal = Math.abs(current[metric] as number);
      const bestVal = Math.abs(best[metric] as number);
      
      if (metricInfo.higherIsBetter) {
        return currentVal > bestVal ? current : best;
      } else {
        return currentVal < bestVal ? current : best;
      }
    });
  };

  const getPerformanceColor = (strategy: BacktestResult, metric: keyof BacktestResult) => {
    const best = getBestStrategy(metric);
    if (strategy.strategy === best.strategy) return 'text-prosperity-600';
    
    const metricInfo = metrics.find(m => m.key === metric);
    if (!metricInfo) return 'text-slate-600';
    
    const val = strategy[metric] as number;
    const benchmark = results.find(r => r.strategy === 'SPY Benchmark')?.[metric] as number || 0;
    
    if (metricInfo.higherIsBetter) {
      return val > benchmark ? 'text-primary-600' : 'text-slate-600';
    } else {
      return Math.abs(val) < Math.abs(benchmark) ? 'text-primary-600' : 'text-slate-600';
    }
  };

  const formatValue = (value: number, suffix: string, metric: keyof BacktestResult) => {
    if (metric === 'maxDrawdown') {
      return `${value.toFixed(1)}${suffix}`;
    }
    return `${Math.abs(value).toFixed(metric === 'sharpeRatio' || metric === 'calmarRatio' ? 2 : 1)}${suffix}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Activity className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-slate-800">Strategy Backtesting</h3>
        </div>
        <p className="text-sm text-slate-600">Historical performance analysis of different investment strategies</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Time Period Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Time Period
          </label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {timePeriods.map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>

        {/* Metric Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Primary Metric
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as keyof BacktestResult)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {metrics.map(metric => (
              <option key={metric.key} value={metric.key}>{metric.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h4 className="font-semibold text-slate-800">Backtest Results ({timePeriod})</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Strategy
                </th>
                {metrics.map(metric => (
                  <th 
                    key={metric.key}
                    className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors ${
                      selectedMetric === metric.key ? 'text-primary-600 bg-primary-50' : 'text-slate-500'
                    }`}
                    onClick={() => setSelectedMetric(metric.key)}
                  >
                    {metric.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {results.map((result, index) => {
                const isBest = getBestStrategy(selectedMetric).strategy === result.strategy;
                const isBenchmark = result.strategy === 'SPY Benchmark';
                
                return (
                  <tr 
                    key={index}
                    className={`transition-colors ${
                      isBest ? 'bg-prosperity-50' : 
                      isBenchmark ? 'bg-primary-50' : 
                      'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {isBest && <TrendingUp className="w-4 h-4 text-prosperity-600 mr-2" />}
                        {isBenchmark && <BarChart3 className="w-4 h-4 text-primary-600 mr-2" />}
                        <div>
                          <div className={`text-sm font-medium ${
                            isBest ? 'text-prosperity-800' : 
                            isBenchmark ? 'text-primary-800' : 
                            'text-slate-900'
                          }`}>
                            {result.strategy}
                          </div>
                          {isBest && (
                            <div className="text-xs text-prosperity-600">Best performer</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {metrics.map(metric => (
                      <td 
                        key={metric.key}
                        className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                          selectedMetric === metric.key && isBest ? 'text-prosperity-600' :
                          getPerformanceColor(result, metric.key)
                        }`}
                      >
                        {formatValue(result[metric.key] as number, metric.suffix, metric.key)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
        <h4 className="font-semibold text-primary-800 mb-2 flex items-center">
          <Zap className="w-4 h-4 mr-1" />
          Backtest Insights
        </h4>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Best risk-adjusted returns: {getBestStrategy('sharpeRatio').strategy} (Sharpe: {getBestStrategy('sharpeRatio').sharpeRatio.toFixed(2)})</li>
          <li>• Lowest volatility: {getBestStrategy('volatility').strategy} ({getBestStrategy('volatility').volatility.toFixed(1)}%)</li>
          <li>• Highest total return: {getBestStrategy('totalReturn').strategy} ({getBestStrategy('totalReturn').totalReturn.toFixed(1)}%)</li>
          <li>• Best drawdown control: {getBestStrategy('maxDrawdown').strategy} ({getBestStrategy('maxDrawdown').maxDrawdown.toFixed(1)}%)</li>
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-slate-500 text-center p-3 bg-slate-50 rounded-lg">
        Past performance does not guarantee future results. Backtesting assumes perfect execution and does not account for transaction costs, taxes, or market impact.
      </div>
    </div>
  );
}