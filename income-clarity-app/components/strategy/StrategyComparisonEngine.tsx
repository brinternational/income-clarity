'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Zap, Award, Target } from 'lucide-react';

interface StrategyData {
  name: string;
  returns: number;
  risk: number;
  taxEfficiency: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

interface StrategyComparisonEngineProps {
  strategies?: StrategyData[];
  className?: string;
}

export function StrategyComparisonEngine({ 
  strategies = [
    {
      name: 'Current Portfolio',
      returns: 8.2,
      risk: 12.5,
      taxEfficiency: 7.8,
      sharpeRatio: 0.65,
      maxDrawdown: -15.2
    },
    {
      name: 'High Dividend',
      returns: 6.8,
      risk: 9.2,
      taxEfficiency: 6.2,
      sharpeRatio: 0.74,
      maxDrawdown: -12.8
    },
    {
      name: 'Growth Focus',
      returns: 11.5,
      risk: 18.7,
      taxEfficiency: 9.1,
      sharpeRatio: 0.61,
      maxDrawdown: -22.4
    },
    {
      name: 'Balanced Mix',
      returns: 9.3,
      risk: 14.1,
      taxEfficiency: 8.5,
      sharpeRatio: 0.66,
      maxDrawdown: -17.5
    }
  ],
  className = ''
}: StrategyComparisonEngineProps) {

  const [selectedMetric, setSelectedMetric] = useState<'returns' | 'risk' | 'taxEfficiency' | 'sharpeRatio'>('returns');

  const metrics = [
    { key: 'returns' as const, label: 'Annual Returns', suffix: '%', format: (val: number) => val.toFixed(1) },
    { key: 'risk' as const, label: 'Volatility', suffix: '%', format: (val: number) => val.toFixed(1) },
    { key: 'taxEfficiency' as const, label: 'Tax Efficiency', suffix: '/10', format: (val: number) => val.toFixed(1) },
    { key: 'sharpeRatio' as const, label: 'Sharpe Ratio', suffix: '', format: (val: number) => val.toFixed(2) }
  ];

  const getBestStrategy = (metric: string) => {
    const sortedStrategies = [...strategies].sort((a, b) => {
      const aValue = a[metric as keyof StrategyData] as number;
      const bValue = b[metric as keyof StrategyData] as number;
      if (metric === 'risk') return aValue - bValue; // Lower is better for risk
      return bValue - aValue; // Higher is better for others
    });
    return sortedStrategies[0];
  };

  const getMetricColor = (strategy: StrategyData, metric: string) => {
    const best = getBestStrategy(metric);
    if (strategy.name === best.name) return 'text-prosperity-600 bg-prosperity-50';
    return 'text-foreground/90 bg-slate-50';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <BarChart3 className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-foreground">Strategy Comparison</h3>
        </div>
        <p className="text-sm text-muted-foreground">Compare different portfolio strategies across key metrics</p>
      </div>

      {/* Metric Selector */}
      <div className="flex bg-slate-100 rounded-lg p-1 gap-1 overflow-x-auto">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`flex-1 min-w-0 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              selectedMetric === metric.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="space-y-3">
        {strategies.map((strategy, index) => {
          const currentMetric = metrics.find(m => m.key === selectedMetric);
          const value = strategy[selectedMetric];
          const maxValue = Math.max(...strategies.map(s => s[selectedMetric]));
          const minValue = Math.min(...strategies.map(s => s[selectedMetric]));
          const range = maxValue - minValue;
          const normalizedValue = range > 0 ? ((value - minValue) / range) * 100 : 50;
          const isRisk = selectedMetric === 'risk';
          const isBest = getBestStrategy(selectedMetric).name === strategy.name;
          
          return (
            <div 
              key={strategy.name} 
              className={`p-4 rounded-lg border-2 transition-all ${
                isBest 
                  ? 'border-prosperity-200 bg-prosperity-50' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {isBest && <Award className="w-4 h-4 text-prosperity-600" />}
                  <span className={`font-semibold ${isBest ? 'text-prosperity-800' : 'text-foreground'}`}>
                    {strategy.name}
                  </span>
                  {isBest && (
                    <span className="text-xs bg-prosperity-100 text-prosperity-700 px-2 py-1 rounded-full">
                      Best
                    </span>
                  )}
                </div>
                <div className={`font-bold ${isBest ? 'text-prosperity-600' : 'text-foreground/90'}`}>
                  {currentMetric?.format(value)}{currentMetric?.suffix}
                </div>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`rounded-full h-2 transition-all duration-500 ${
                    isBest ? 'bg-prosperity-500' : 'bg-primary-400'
                  }`}
                  style={{ 
                    width: `${isRisk ? (100 - normalizedValue) : normalizedValue}%` 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {strategies.length}
          </div>
          <div className="text-xs text-muted-foreground">Strategies</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground/90">
            {getBestStrategy(selectedMetric).name}
          </div>
          <div className="text-xs text-muted-foreground">Best Strategy</div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
        <h4 className="font-semibold text-primary-800 mb-2 flex items-center">
          <Zap className="w-4 h-4 mr-1" />
          Quick Insights
        </h4>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• {getBestStrategy('returns').name} offers the highest returns at {getBestStrategy('returns').returns.toFixed(1)}%</li>
          <li>• {getBestStrategy('risk').name} has the lowest risk at {getBestStrategy('risk').risk.toFixed(1)}%</li>
          <li>• {getBestStrategy('sharpeRatio').name} provides the best risk-adjusted returns</li>
        </ul>
      </div>
    </div>
  );
}