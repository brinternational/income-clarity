'use client';

import React from 'react';

/**
 * Base skeleton component with theming support
 */
export const SkeletonBase = ({ 
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded',
  ...props 
}: {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
  [key: string]: any;
}) => (
  <div 
    className={`${width} ${height} ${rounded} animate-pulse skeleton-bg ${className}`}
    style={{
      backgroundColor: 'var(--color-skeleton, #e2e8f0)',
    }}
    {...props}
  />
);

/**
 * Text skeleton for content placeholders
 */
export const SkeletonText = ({ 
  lines = 1,
  className = '',
  widthVariation = true 
}: {
  lines?: number;
  className?: string;
  widthVariation?: boolean;
}) => {
  const widths = widthVariation ? ['w-full', 'w-4/5', 'w-3/4', 'w-5/6'] : ['w-full'];
  
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          width={widths[index % widths.length]}
          height="h-4"
          className="last:w-3/4"
        />
      ))}
    </div>
  );
};

/**
 * Skeleton for dashboard cards
 */
export const SkeletonCard = ({ 
  className = '',
  showHeader = true,
  showIcon = true,
  contentLines = 3,
  showMetrics = true 
}: {
  className?: string;
  showHeader?: boolean;
  showIcon?: boolean;
  contentLines?: number;
  showMetrics?: boolean;
}) => (
  <div 
    className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 ${className}`}
    style={{
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)',
    }}
  >
    {/* Header */}
    {showHeader && (
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <SkeletonBase height="h-6" width="w-48" className="mb-2" />
          <SkeletonBase height="h-4" width="w-36" />
        </div>
        {showIcon && (
          <SkeletonBase 
            width="w-12" 
            height="h-12" 
            rounded="rounded-xl" 
          />
        )}
      </div>
    )}

    {/* Main content */}
    <div className="space-y-4">
      <SkeletonText lines={contentLines} />
      
      {/* Metrics section */}
      {showMetrics && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <SkeletonBase height="h-8" width="w-24" />
            <SkeletonBase height="h-4" width="w-20" />
          </div>
          <div className="space-y-2">
            <SkeletonBase height="h-8" width="w-24" />
            <SkeletonBase height="h-4" width="w-20" />
          </div>
        </div>
      )}
    </div>
  </div>
);

/**
 * Skeleton for chart components
 */
export const SkeletonChart = ({ 
  className = '',
  height = 'h-64',
  showLegend = true 
}: {
  className?: string;
  height?: string;
  showLegend?: boolean;
}) => (
  <div className={`${className}`}>
    {/* Chart area */}
    <div className={`${height} rounded-lg mb-4 flex items-end justify-center space-x-2 p-4`}
         style={{ backgroundColor: 'var(--color-secondary)' }}>
      {/* Mock chart bars */}
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonBase
          key={index}
          width="w-8"
          height={`h-${Math.floor(Math.random() * 20) + 10}`}
          rounded="rounded-t"
          className="animate-pulse"
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
    
    {/* Legend */}
    {showLegend && (
      <div className="flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <SkeletonBase width="w-3" height="h-3" rounded="rounded-full" />
          <SkeletonBase width="w-16" height="h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonBase width="w-3" height="h-3" rounded="rounded-full" />
          <SkeletonBase width="w-16" height="h-4" />
        </div>
      </div>
    )}
  </div>
);

/**
 * Skeleton for table components
 */
export const SkeletonTable = ({ 
  rows = 5,
  columns = 4,
  className = '',
  showHeader = true 
}: {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}) => (
  <div className={`overflow-hidden rounded-lg ${className}`}
       style={{ 
         backgroundColor: 'var(--color-primary)',
         border: '1px solid var(--color-border)'
       }}>
    {/* Table Header */}
    {showHeader && (
      <div className="grid gap-4 p-4 border-b"
           style={{ 
             gridTemplateColumns: `repeat(${columns}, 1fr)`,
             borderColor: 'var(--color-border)'
           }}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonBase key={index} height="h-5" width="w-20" />
        ))}
      </div>
    )}

    {/* Table Rows */}
    <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          className="grid gap-4 p-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonBase 
              key={colIndex} 
              height="h-4" 
              width={colIndex === 0 ? "w-24" : "w-16"}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for form components
 */
export const SkeletonForm = ({ 
  fields = 4,
  className = '',
  showButtons = true 
}: {
  fields?: number;
  className?: string;
  showButtons?: boolean;
}) => (
  <div className={`space-y-6 ${className}`}>
    {/* Form fields */}
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <SkeletonBase height="h-4" width="w-24" />
        <SkeletonBase 
          height="h-10" 
          width="w-full" 
          rounded="rounded-md" 
        />
      </div>
    ))}

    {/* Action buttons */}
    {showButtons && (
      <div className="flex justify-end space-x-3 pt-4">
        <SkeletonBase height="h-10" width="w-20" rounded="rounded-md" />
        <SkeletonBase height="h-10" width="w-24" rounded="rounded-md" />
      </div>
    )}
  </div>
);

/**
 * Skeleton for the Income Clarity Card
 */
export const SkeletonIncomeClarityCard = ({ className = '' }: { className?: string }) => (
  <div 
    className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 ${className}`}
    style={{
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)',
    }}
  >
    {/* Zero line status skeleton */}
    <div className="mb-6 p-4 sm:p-6 rounded-xl border-2" 
         style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <SkeletonBase width="w-12" height="h-12" rounded="rounded-full" />
          <div>
            <SkeletonBase height="h-7" width="w-40" className="mb-2" />
            <SkeletonBase height="h-4" width="w-56" />
          </div>
        </div>
        <div className="text-right">
          <SkeletonBase height="h-12" width="w-24" className="mb-1" />
          <SkeletonBase height="h-4" width="w-20" />
        </div>
      </div>
      
      {/* Stress level skeleton */}
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SkeletonBase width="w-6" height="h-6" rounded="rounded-lg" />
            <SkeletonBase height="h-4" width="w-32" />
          </div>
          <SkeletonBase height="h-6" width="w-12" />
        </div>
        <SkeletonBase height="h-3" width="w-full" rounded="rounded-full" />
        <SkeletonBase height="h-16" width="w-full" rounded="rounded-lg" />
      </div>
    </div>

    {/* Header skeleton */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <SkeletonBase height="h-6" width="w-48" className="mb-1" />
        <SkeletonBase height="h-4" width="w-56" />
      </div>
      <SkeletonBase width="w-12" height="h-12" rounded="rounded-xl" />
    </div>

    {/* Waterfall steps skeleton */}
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg border"
             style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center space-x-3">
            <SkeletonBase width="w-8" height="h-8" rounded="rounded-lg" />
            <div>
              <SkeletonBase height="h-4" width="w-32" className="mb-1" />
              <SkeletonBase height="h-3" width="w-48" />
            </div>
          </div>
          <SkeletonBase height="h-6" width="w-20" />
        </div>
      ))}
    </div>

    {/* Final result skeleton */}
    <div className="mt-6 p-4 rounded-xl border-2" 
         style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SkeletonBase width="w-10" height="h-10" rounded="rounded-xl" />
          <div>
            <SkeletonBase height="h-5" width="w-36" className="mb-1" />
            <SkeletonBase height="h-4" width="w-40" />
          </div>
        </div>
        <div className="text-right">
          <SkeletonBase height="h-8" width="w-24" className="mb-1" />
          <SkeletonBase height="h-4" width="w-20" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton for SPY Comparison Card
 */
export const SkeletonSPYComparison = ({ className = '' }: { className?: string }) => (
  <div 
    className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 ${className}`}
    style={{
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)',
    }}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <SkeletonBase height="h-6" width="w-40" className="mb-1" />
        <SkeletonBase height="h-4" width="w-48" />
      </div>
      <SkeletonBase width="w-12" height="h-12" rounded="rounded-xl" />
    </div>

    {/* Time period selector */}
    <div className="flex justify-center space-x-2 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonBase key={index} width="w-12" height="h-8" rounded="rounded-md" />
      ))}
    </div>

    {/* Performance comparison */}
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="text-center">
        <SkeletonBase height="h-8" width="w-16" className="mx-auto mb-2" />
        <SkeletonBase height="h-4" width="w-20" className="mx-auto mb-1" />
        <SkeletonBase height="h-3" width="w-12" className="mx-auto" />
      </div>
      <div className="text-center">
        <SkeletonBase height="h-8" width="w-16" className="mx-auto mb-2" />
        <SkeletonBase height="h-4" width="w-20" className="mx-auto mb-1" />
        <SkeletonBase height="h-3" width="w-12" className="mx-auto" />
      </div>
    </div>

    {/* Chart skeleton */}
    <SkeletonChart height="h-40" showLegend={false} />

    {/* Outperformance indicator */}
    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SkeletonBase width="w-8" height="h-8" rounded="rounded-lg" />
          <SkeletonBase height="h-5" width="w-32" />
        </div>
        <SkeletonBase height="h-6" width="w-16" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for Holdings Performance Card
 */
export const SkeletonHoldingsPerformance = ({ className = '' }: { className?: string }) => (
  <div 
    className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 ${className}`}
    style={{
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)',
    }}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <SkeletonBase height="h-6" width="w-36" className="mb-1" />
        <SkeletonBase height="h-4" width="w-44" />
      </div>
      <SkeletonBase width="w-24" height="h-8" rounded="rounded-md" />
    </div>

    {/* Holdings table skeleton */}
    <SkeletonTable rows={4} columns={5} showHeader={true} />
  </div>
);

/**
 * Loading state wrapper that shows skeleton while loading
 */
export const SkeletonWrapper = ({ 
  isLoading, 
  skeleton, 
  children,
  delay = 0
}: {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) => {
  const [shouldShow, setShouldShow] = React.useState(!delay);

  React.useEffect(() => {
    if (delay && !shouldShow) {
      const timer = setTimeout(() => setShouldShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay, shouldShow]);

  if (isLoading && shouldShow) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
};

/**
 * Skeleton for Tax Savings Calculator Card
 */
export const SkeletonTaxSavingsCard = ({ className = '' }: { className?: string }) => (
  <div 
    className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 ${className}`}
    style={{
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)',
    }}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <SkeletonBase height="h-6" width="w-48" className="mb-2" />
        <SkeletonBase height="h-4" width="w-56" />
      </div>
      <SkeletonBase width="w-12" height="h-12" rounded="rounded-xl" />
    </div>

    {/* Current Location Summary */}
    <div className="mb-6 p-4 rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <SkeletonBase width="w-5" height="h-5" rounded="rounded" />
          <div>
            <SkeletonBase height="h-4" width="w-24" className="mb-1" />
            <SkeletonBase height="h-4" width="w-16" />
          </div>
        </div>
        <div className="text-right">
          <SkeletonBase height="h-8" width="w-20" className="mb-1" />
          <SkeletonBase height="h-3" width="w-16" />
        </div>
      </div>
      <div className="p-3 rounded-lg border">
        <SkeletonBase height="h-6" width="w-full" />
      </div>
    </div>

    {/* Location Comparison */}
    <div className="space-y-3">
      <SkeletonBase height="h-5" width="w-32" className="mb-4" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-full" />
              <div>
                <SkeletonBase height="h-4" width="w-20" className="mb-1" />
                <SkeletonBase height="h-3" width="w-24" />
              </div>
            </div>
            <div className="text-right">
              <SkeletonBase height="h-4" width="w-16" className="mb-1" />
              <SkeletonBase height="h-3" width="w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for FIRE Progress Card
 */
export const SkeletonFIREProgressCard = ({ className = '' }: { className?: string }) => (
  <div 
    className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 ${className}`}
    style={{
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)',
    }}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <SkeletonBase height="h-6" width="w-44" className="mb-2" />
        <SkeletonBase height="h-4" width="w-52" />
      </div>
      <SkeletonBase width="w-12" height="h-12" rounded="rounded-xl" />
    </div>

    {/* Progress Circle */}
    <div className="mb-6 flex justify-center">
      <SkeletonBase width="w-32" height="h-32" rounded="rounded-full" className="sm:w-40 sm:h-40" />
    </div>

    {/* Metrics Grid */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="text-center p-3 rounded-xl border">
          <SkeletonBase height="h-6" width="w-16" className="mx-auto mb-2" />
          <SkeletonBase height="h-3" width="w-20" className="mx-auto" />
        </div>
      ))}
    </div>

    {/* Milestones */}
    <div className="mb-6">
      <SkeletonBase height="h-5" width="w-28" className="mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <SkeletonBase width="w-8" height="h-8" rounded="rounded-full" />
              <div>
                <SkeletonBase height="h-4" width="w-16" className="mb-1" />
                <SkeletonBase height="h-3" width="w-24" />
              </div>
            </div>
            <SkeletonBase width="w-6" height="h-6" rounded="rounded" />
          </div>
        ))}
      </div>
    </div>

    {/* Tip */}
    <div className="p-4 rounded-xl border">
      <div className="flex items-start space-x-3">
        <SkeletonBase width="w-5" height="h-5" rounded="rounded" className="mt-0.5" />
        <div className="flex-1">
          <SkeletonBase height="h-4" width="w-40" className="mb-2" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton for Strategy Cards (generic)
 */
export const SkeletonStrategyCard = ({ 
  className = '',
  showChart = false,
  metricsCount = 2 
}: { 
  className?: string;
  showChart?: boolean;
  metricsCount?: number;
}) => (
  <div 
    className={`p-4 sm:p-6 lg:p-8 rounded-xl border transition-all duration-300 ${className}`}
    style={{
      backgroundColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)',
    }}
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <SkeletonBase height="h-6" width="w-40" className="mb-2" />
        <SkeletonBase height="h-4" width="w-48" />
      </div>
      <SkeletonBase width="w-12" height="h-12" rounded="rounded-xl" />
    </div>

    {/* Chart if needed */}
    {showChart && (
      <div className="mb-6">
        <SkeletonChart height="h-32" showLegend={false} />
      </div>
    )}

    {/* Metrics */}
    <div className={`grid grid-cols-${Math.min(metricsCount, 2)} gap-4 mb-6`}>
      {Array.from({ length: metricsCount }).map((_, index) => (
        <div key={index} className="text-center p-3 rounded-lg border">
          <SkeletonBase height="h-6" width="w-16" className="mx-auto mb-2" />
          <SkeletonBase height="h-3" width="w-20" className="mx-auto" />
        </div>
      ))}
    </div>

    {/* Content */}
    <div className="space-y-4">
      <SkeletonText lines={3} />
      <div className="p-3 rounded-lg border">
        <SkeletonBase height="h-4" width="w-full" />
      </div>
    </div>
  </div>
);

/**
 * Generic loading wrapper for strategic cards
 */
export const SkeletonCardWrapper = ({ 
  isLoading, 
  cardType = 'strategy',
  children,
  className = '',
  delay = 300
}: {
  isLoading: boolean;
  cardType?: 'strategy' | 'fire' | 'tax' | 'income';
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const [shouldShow, setShouldShow] = React.useState(!delay);

  React.useEffect(() => {
    if (delay && !shouldShow) {
      const timer = setTimeout(() => setShouldShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay, shouldShow]);

  if (isLoading && shouldShow) {
    switch (cardType) {
      case 'fire':
        return <SkeletonFIREProgressCard className={className} />;
      case 'tax':
        return <SkeletonTaxSavingsCard className={className} />;
      case 'income':
        return <SkeletonCard className={className} showMetrics={true} contentLines={4} />;
      case 'strategy':
      default:
        return <SkeletonStrategyCard className={className} />;
    }
  }

  return <>{children}</>;
};