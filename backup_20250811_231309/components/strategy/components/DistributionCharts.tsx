/**
 * DistributionCharts Component
 * Interactive visualization of peer performance distributions
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Info
} from 'lucide-react';

interface DistributionData {
  metric: string;
  userValue: number;
  userPercentile: number;
  distribution: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  unit: string;
  isHigherBetter: boolean;
}

interface DistributionChartsProps {
  distributions: DistributionData[];
  className?: string;
  selectedMetric?: string;
  onMetricSelect?: (metric: string) => void;
}

export const DistributionCharts: React.FC<DistributionChartsProps> = ({
  distributions,
  className = '',
  selectedMetric,
  onMetricSelect
}) => {
  const [activeMetric, setActiveMetric] = useState(selectedMetric || distributions[0]?.metric);
  const [viewMode, setViewMode] = useState<'box' | 'histogram' | 'percentile'>('box');

  const currentDistribution = useMemo(() => {
    return distributions.find(d => d.metric === activeMetric) || distributions[0];
  }, [distributions, activeMetric]);

  const handleMetricChange = (metric: string) => {
    setActiveMetric(metric);
    onMetricSelect?.(metric);
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'bg-emerald-500';
    if (percentile >= 75) return 'bg-green-500';
    if (percentile >= 50) return 'bg-yellow-500';
    if (percentile >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile >= 90) return 'Elite (Top 10%)';
    if (percentile >= 75) return 'Excellent (Top 25%)';
    if (percentile >= 50) return 'Above Average';
    if (percentile >= 25) return 'Below Average';
    return 'Needs Improvement';
  };

  if (!currentDistribution) {
    return (
      <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Distribution Data</h3>
        <p className="text-gray-600">Distribution charts will appear here when data is available</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">Performance Distribution</h3>
              <p className="text-blue-100">
                See how you compare to the full peer group distribution
              </p>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex space-x-1">
            {(['box', 'histogram', 'percentile'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 font-medium'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector */}
        <select
          value={activeMetric}
          onChange={(e) => handleMetricChange(e.target.value)}
          className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          {distributions.map(dist => (
            <option key={dist.metric} value={dist.metric} className="text-gray-900">
              {dist.metric}
            </option>
          ))}
        </select>
      </div>

      <div className="p-6">
        {/* Current Metric Overview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">{currentDistribution.metric}</h4>
              <p className="text-sm text-gray-600">Your position in the peer group</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {currentDistribution.userValue}{currentDistribution.unit}
              </p>
              <p className={`text-sm font-medium ${
                currentDistribution.userPercentile >= 75 ? 'text-green-600' :
                currentDistribution.userPercentile >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {currentDistribution.userPercentile}th percentile
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{getPercentileLabel(currentDistribution.userPercentile)}</span>
            <span className="flex items-center space-x-1">
              <Info className="h-4 w-4" />
              <span>{currentDistribution.isHigherBetter ? 'Higher is better' : 'Lower is better'}</span>
            </span>
          </div>
        </div>

        {/* Distribution Visualization */}
        {viewMode === 'box' && <BoxPlotView distribution={currentDistribution} />}
        {viewMode === 'histogram' && <HistogramView distribution={currentDistribution} />}
        {viewMode === 'percentile' && <PercentileView distribution={currentDistribution} />}

        {/* Distribution Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(currentDistribution.distribution).map(([percentile, value]) => (
            <div key={percentile} className="text-center">
              <p className="text-xs text-gray-600 mb-1">{percentile.toUpperCase()}</p>
              <p className="text-lg font-bold text-gray-900">
                {value}{currentDistribution.unit}
              </p>
              <p className="text-xs text-gray-500">
                {percentile === 'p10' ? '10th' :
                 percentile === 'p25' ? '25th' :
                 percentile === 'p50' ? 'Median' :
                 percentile === 'p75' ? '75th' :
                 '90th'} percentile
              </p>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Distribution Insights
          </h5>
          <div className="space-y-2 text-sm text-blue-700">
            <DistributionInsights distribution={currentDistribution} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Box Plot Visualization Component
const BoxPlotView: React.FC<{ distribution: DistributionData }> = ({ distribution }) => {
  const { p10, p25, p50, p75, p90 } = distribution.distribution;
  const range = p90 - p10;
  const userPosition = ((distribution.userValue - p10) / range) * 100;

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-gray-900 flex items-center">
        <Activity className="h-5 w-5 mr-2" />
        Box Plot Distribution
      </h5>
      
      <div className="relative h-24 bg-gray-100 rounded-lg">
        {/* Box plot visualization */}
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
          {/* Whiskers */}
          <div 
            className="absolute bg-gray-400 h-0.5"
            style={{
              left: '5%',
              right: '95%',
              width: `${((p25 - p10) / range) * 90}%`,
              marginLeft: '5%'
            }}
          />
          <div 
            className="absolute bg-gray-400 h-0.5"
            style={{
              left: `${5 + ((p75 - p10) / range) * 90}%`,
              width: `${((p90 - p75) / range) * 90}%`
            }}
          />
          
          {/* Box */}
          <div 
            className="absolute bg-blue-300 border-2 border-blue-500 h-8 rounded"
            style={{
              left: `${5 + ((p25 - p10) / range) * 90}%`,
              width: `${((p75 - p25) / range) * 90}%`
            }}
          />
          
          {/* Median line */}
          <div 
            className="absolute bg-blue-800 w-0.5 h-8 rounded"
            style={{
              left: `${5 + ((p50 - p10) / range) * 90}%`
            }}
          />
          
          {/* User position */}
          <div 
            className={`absolute w-2 h-10 rounded ${getPercentileColor(distribution.userPercentile)} border-2 border-white shadow-lg z-10`}
            style={{
              left: `${Math.max(0, Math.min(95, 5 + userPosition * 0.9))}%`,
              top: '-5px'
            }}
          />
        </div>
        
        {/* Labels */}
        <div className="absolute bottom-1 left-2 text-xs text-gray-600">
          {p10}{distribution.unit}
        </div>
        <div className="absolute bottom-1 right-2 text-xs text-gray-600">
          {p90}{distribution.unit}
        </div>
        <div 
          className="absolute -top-6 text-xs font-medium text-gray-900"
          style={{ left: `${Math.max(0, Math.min(90, 5 + userPosition * 0.9))}%` }}
        >
          You: {distribution.userValue}{distribution.unit}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>10th percentile</span>
        <span>25th</span>
        <span>Median</span>
        <span>75th</span>
        <span>90th percentile</span>
      </div>
    </div>
  );
};

// Histogram Visualization Component
const HistogramView: React.FC<{ distribution: DistributionData }> = ({ distribution }) => {
  // Generate mock histogram data based on distribution
  const histogramData = useMemo(() => {
    const { p10, p25, p50, p75, p90 } = distribution.distribution;
    const bins = [];
    const binCount = 10;
    const range = p90 - p10;
    const binWidth = range / binCount;
    
    for (let i = 0; i < binCount; i++) {
      const binStart = p10 + (i * binWidth);
      const binEnd = binStart + binWidth;
      const binCenter = (binStart + binEnd) / 2;
      
      // Mock frequency based on normal-ish distribution
      let frequency;
      if (binCenter < p25) {
        frequency = Math.max(5, 30 - Math.abs(binCenter - p25) * 2);
      } else if (binCenter > p75) {
        frequency = Math.max(5, 30 - Math.abs(binCenter - p75) * 2);
      } else {
        frequency = Math.max(20, 50 - Math.abs(binCenter - p50) * 1.5);
      }
      
      bins.push({
        start: binStart,
        end: binEnd,
        center: binCenter,
        frequency: frequency,
        isUserBin: distribution.userValue >= binStart && distribution.userValue < binEnd
      });
    }
    
    return bins;
  }, [distribution]);

  const maxFrequency = Math.max(...histogramData.map(bin => bin.frequency));

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-gray-900 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2" />
        Peer Group Distribution
      </h5>
      
      <div className="relative h-48">
        <div className="flex items-end justify-between h-full">
          {histogramData.map((bin, index) => (
            <div
              key={index}
              className="flex-1 mx-px flex flex-col justify-end"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(bin.frequency / maxFrequency) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`w-full rounded-t transition-all hover:opacity-80 cursor-pointer ${
                  bin.isUserBin
                    ? getPercentileColor(distribution.userPercentile)
                    : 'bg-gray-300'
                }`}
                title={`${bin.start.toFixed(1)}${distribution.unit} - ${bin.end.toFixed(1)}${distribution.unit}: ${bin.frequency} investors`}
              />
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute -left-12 top-0 text-xs text-gray-600">
          {maxFrequency}
        </div>
        <div className="absolute -left-12 bottom-0 text-xs text-gray-600">
          0
        </div>
      </div>
      
      {/* X-axis */}
      <div className="flex justify-between text-xs text-gray-600">
        <span>{distribution.distribution.p10}{distribution.unit}</span>
        <span>{distribution.distribution.p90}{distribution.unit}</span>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <span className={`inline-block w-3 h-3 rounded mr-2 ${getPercentileColor(distribution.userPercentile)}`}></span>
        Your position in the distribution
      </div>
    </div>
  );
};

// Percentile Ranking Visualization
const PercentileView: React.FC<{ distribution: DistributionData }> = ({ distribution }) => {
  const percentileRanges = [
    { min: 90, max: 100, label: 'Elite (Top 10%)', color: 'bg-emerald-500', count: '10%' },
    { min: 75, max: 90, label: 'Excellent (75th-90th)', color: 'bg-green-500', count: '15%' },
    { min: 50, max: 75, label: 'Above Average (50th-75th)', color: 'bg-yellow-500', count: '25%' },
    { min: 25, max: 50, label: 'Below Average (25th-50th)', color: 'bg-orange-500', count: '25%' },
    { min: 0, max: 25, label: 'Needs Improvement (Bottom 25%)', color: 'bg-red-500', count: '25%' },
  ];

  const userRange = percentileRanges.find(range => 
    distribution.userPercentile >= range.min && distribution.userPercentile < range.max
  ) || percentileRanges[0];

  return (
    <div className="space-y-4">
      <h5 className="font-medium text-gray-900 flex items-center">
        <Users className="h-5 w-5 mr-2" />
        Percentile Rankings
      </h5>
      
      <div className="space-y-3">
        {percentileRanges.map((range, index) => {
          const isUserRange = range === userRange;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                isUserRange 
                  ? 'border-purple-300 bg-purple-50' 
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${range.color}`} />
                <div>
                  <h6 className={`font-medium ${isUserRange ? 'text-purple-900' : 'text-gray-900'}`}>
                    {range.label}
                  </h6>
                  <p className="text-sm text-gray-600">
                    {range.min}th - {range.max}th percentile
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-bold ${isUserRange ? 'text-purple-600' : 'text-gray-600'}`}>
                  {range.count}
                </p>
                {isUserRange && (
                  <div className="flex items-center text-sm text-purple-600">
                    <Target className="h-4 w-4 mr-1" />
                    <span>You're here</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Distribution Insights Component
const DistributionInsights: React.FC<{ distribution: DistributionData }> = ({ distribution }) => {
  const insights = [];

  const { p10, p25, p50, p75, p90 } = distribution.distribution;
  const userValue = distribution.userValue;
  const userPercentile = distribution.userPercentile;

  // Compare to median
  const medianComparison = ((userValue - p50) / p50) * 100;
  if (Math.abs(medianComparison) > 5) {
    insights.push(
      `You're ${Math.abs(medianComparison).toFixed(1)}% ${
        medianComparison > 0 ? 'above' : 'below'
      } the peer group median of ${p50}${distribution.unit}`
    );
  }

  // Performance tier
  if (userPercentile >= 90) {
    insights.push("You're in the elite top 10% - exceptional performance!");
  } else if (userPercentile >= 75) {
    insights.push(`You're ${90 - userPercentile} percentile points away from elite status`);
  } else if (userPercentile < 50) {
    insights.push(`Focus on improvement - ${50 - userPercentile} points to reach average performance`);
  }

  // Range analysis
  const range = p90 - p10;
  const userPosition = userValue - p10;
  const positionPercent = (userPosition / range) * 100;
  
  if (positionPercent < 20) {
    insights.push("You're in the lower end of the performance range");
  } else if (positionPercent > 80) {
    insights.push("You're in the upper end of the performance range");
  }

  return (
    <>
      {insights.map((insight, index) => (
        <p key={index}>• {insight}</p>
      ))}
      {insights.length === 0 && (
        <p>• Your performance is close to the peer group median</p>
      )}
    </>
  );
};