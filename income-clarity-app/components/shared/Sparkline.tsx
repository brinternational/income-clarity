'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  fill?: boolean;
  animated?: boolean;
  className?: string;
}

const SparklineComponent = ({
  data,
  width = 60,
  height = 20,
  color = '#059669',
  strokeWidth = 1.5,
  fill = false,
  animated = true,
  className = ''
}: SparklineProps) => {
  if (!data || data.length < 2) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="w-1 h-1 bg-slate-300 rounded-full" />
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  // Generate path points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;
  
  // Create fill path if needed
  const fillPath = fill 
    ? `${pathData} L ${width},${height} L 0,${height} Z`
    : '';

  // Determine trend direction
  const trend = data[data.length - 1] > data[0] ? 'up' : 'down';
  const trendColor = trend === 'up' ? '#059669' : '#dc2626';
  const finalColor = color === '#059669' ? trendColor : color;

  return (
    <div className={`inline-block ${className}`}>
      <svg 
        width={width} 
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`sparkline-gradient-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={finalColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={finalColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        {fill && (
          <motion.path
            d={fillPath}
            fill={`url(#sparkline-gradient-${Math.random()})`}
            initial={animated ? { opacity: 0 } : {}}
            animate={animated ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        )}
        
        {/* Main line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={finalColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : {}}
          animate={animated ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* End point dot */}
        <motion.circle
          cx={points[points.length - 1]?.split(',')[0] || 0}
          cy={points[points.length - 1]?.split(',')[1] || 0}
          r="1.5"
          fill={finalColor}
          initial={animated ? { scale: 0, opacity: 0 } : {}}
          animate={animated ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.8 }}
        />
      </svg>
    </div>
  );
};

export const Sparkline = memo(SparklineComponent);

interface YieldSparklineProps {
  data: number[];
  current: number;
  width?: number;
  height?: number;
  showValue?: boolean;
  className?: string;
}

const YieldSparklineComponent = ({
  data,
  current,
  width = 80,
  height = 24,
  showValue = true,
  className = ''
}: YieldSparklineProps) => {
  const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const isPositive = trend >= 0;
  const color = isPositive ? '#059669' : '#dc2626';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Sparkline
        data={data}
        width={width}
        height={height}
        color={color}
        fill={true}
        strokeWidth={1.5}
        className="flex-shrink-0"
      />
      {showValue && (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {current.toFixed(2)}%
          </span>
          <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{trend.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
};

export const YieldSparkline = memo(YieldSparklineComponent);

interface RiskIndicatorProps {
  beta: number;
  volatility: number;
  correlation: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RiskIndicatorComponent = ({
  beta,
  volatility,
  correlation,
  size = 'md',
  className = ''
}: RiskIndicatorProps) => {
  // Risk scoring (0-100 scale)
  const betaScore = Math.min(Math.abs(beta - 1) * 50, 100);
  const volatilityScore = Math.min(volatility * 100, 100);
  const correlationScore = Math.abs(correlation) * 100;
  
  const overallRisk = (betaScore + volatilityScore + correlationScore) / 3;
  
  const getRiskLevel = (score: number): { level: string; color: string; bgColor: string } => {
    if (score <= 30) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score <= 60) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const risk = getRiskLevel(overallRisk);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1'
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className={`rounded-full font-medium ${risk.color} ${risk.bgColor} ${sizeClasses[size]}`}>
        {risk.level} Risk
      </div>
      
      {/* Detailed metrics tooltip on hover */}
      <div className="group relative">
        <div className={`w-2 h-2 rounded-full ${risk.bgColor} cursor-help`} />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          <div className="space-y-1">
            <div>Beta: {beta.toFixed(2)} (vs S&P 500)</div>
            <div>Volatility: {(volatility * 100).toFixed(1)}%</div>
            <div>Correlation: {correlation.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RiskIndicator = memo(RiskIndicatorComponent);