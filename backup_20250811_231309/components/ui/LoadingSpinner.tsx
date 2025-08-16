'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent', 
    white: 'border-white border-t-transparent'
  };

  return (
    <div className={`
      animate-spin rounded-full border-2 
      ${sizeClasses[size]} 
      ${colorClasses[color]}
      ${className}
    `} />
  );
};

interface LoadingDotsProps {
  className?: string;
  color?: 'primary' | 'secondary';
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className = '', 
  color = 'primary' 
}) => {
  const dotColor = color === 'primary' ? 'bg-blue-600' : 'bg-gray-600';

  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`h-2 w-2 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`h-2 w-2 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`h-2 w-2 rounded-full ${dotColor} animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

interface LoadingBarProps {
  progress?: number;
  className?: string;
  showPercent?: boolean;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ 
  progress, 
  className = '',
  showPercent = false 
}) => {
  const isIndeterminate = progress === undefined;

  return (
    <div className={`w-full ${className}`}>
      {showPercent && progress !== undefined && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Loading...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        {isIndeterminate ? (
          <div className="h-full bg-blue-600 rounded-full animate-pulse" 
               style={{ 
                 animation: 'loading-bar 2s ease-in-out infinite'
               }} />
        ) : (
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        )}
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 75%; margin-left: 12.5%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
};