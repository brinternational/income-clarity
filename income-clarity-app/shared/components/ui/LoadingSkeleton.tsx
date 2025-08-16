'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
    <div className="animate-pulse">
      <Skeleton variant="rectangular" height="24" className="mb-4" width="60%" />
      <Skeleton variant="text" height="16" className="mb-2" />
      <Skeleton variant="text" height="16" className="mb-2" width="80%" />
      <Skeleton variant="text" height="16" width="40%" />
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b dark:border-gray-600">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height="16" width="80%" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y dark:divide-gray-600">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height="16" width={colIndex === 0 ? "100%" : "60%"} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Portfolio Card Skeleton
export const PortfolioCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton width="120" height="20" />
        <Skeleton variant="circular" width="32" height="32" />
      </div>
      
      {/* Main value */}
      <Skeleton width="100" height="32" className="mb-2" />
      <Skeleton width="80" height="16" className="mb-4" />
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton width="60" height="20" className="mx-auto mb-1" />
            <Skeleton width="80" height="14" className="mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton width="200" height="32" className="mb-2" />
        <Skeleton width="300" height="16" />
      </div>
      <Skeleton width="120" height="40" variant="rectangular" />
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    
    {/* Main content */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CardSkeleton className="h-96" />
      </div>
      <div>
        <CardSkeleton className="h-96" />
      </div>
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ 
  fields?: number;
  className?: string;
}> = ({ 
  fields = 5,
  className = '' 
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
    <div className="animate-pulse space-y-6">
      {/* Title */}
      <Skeleton width="200" height="24" />
      
      {/* Fields */}
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton width="120" height="16" className="mb-2" />
          <Skeleton width="100%" height="40" variant="rectangular" />
        </div>
      ))}
      
      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        <Skeleton width="80" height="36" variant="rectangular" />
        <Skeleton width="100" height="36" variant="rectangular" />
      </div>
    </div>
  </div>
);

// Text Lines Skeleton
export const TextSkeleton: React.FC<{ 
  lines?: number;
  className?: string;
}> = ({ 
  lines = 3,
  className = '' 
}) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i}
        variant="text" 
        height="16"
        width={i === lines - 1 ? "75%" : "100%"}
      />
    ))}
  </div>
);