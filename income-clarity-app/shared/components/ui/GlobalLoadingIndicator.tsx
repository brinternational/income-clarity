'use client';

import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { LoadingSpinner, LoadingBar } from './LoadingSpinner';

interface GlobalLoadingIndicatorProps {
  className?: string;
  position?: 'top' | 'bottom' | 'center';
}

export const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({ 
  className = '',
  position = 'top'
}) => {
  const { loadingStates } = useLoading();

  // Find the first active loading state
  const activeLoading = Object.entries(loadingStates).find(([_, state]) => state.isLoading);
  
  if (!activeLoading) {
    return null;
  }

  const [key, state] = activeLoading;
  const { message, progress } = state;

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <div className={`
      fixed z-50 ${positionClasses[position]} ${className}
      ${position === 'center' ? 'pointer-events-none' : ''}
    `}>
      {position === 'center' ? (
        // Center loading overlay
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg p-6 pointer-events-auto">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="md" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {message || 'Loading...'}
              </div>
              {progress !== undefined && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round(progress)}% complete
                </div>
              )}
            </div>
          </div>
          {progress !== undefined && (
            <LoadingBar progress={progress} className="mt-3 w-48" />
          )}
        </div>
      ) : (
        // Top/bottom bar
        <div className="bg-blue-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" color="white" />
                <span className="text-sm font-medium">
                  {message || 'Loading...'}
                </span>
              </div>
              {progress !== undefined && (
                <span className="text-xs text-blue-100">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
            {progress !== undefined && (
              <div className="pb-2">
                <LoadingBar progress={progress} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Page-level loading overlay
export const PageLoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  className?: string;
}> = ({ 
  isVisible, 
  message = 'Loading...',
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 
      backdrop-blur-sm flex items-center justify-center
      ${className}
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Please wait
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Inline loading state for components
export const InlineLoading: React.FC<{
  isLoading: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}> = ({ 
  isLoading, 
  message = 'Loading...',
  size = 'md',
  className = '',
  children
}) => {
  if (!isLoading && !children) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {isLoading && (
        <>
          <LoadingSpinner size={size} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </span>
        </>
      )}
      {!isLoading && children}
    </div>
  );
};

// Button loading state
export const LoadingButton: React.FC<{
  isLoading: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}> = ({
  isLoading,
  loadingText = 'Loading...',
  disabled = false,
  onClick,
  className = '',
  children,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        relative inline-flex items-center justify-center px-4 py-2 
        border border-transparent text-sm font-medium rounded-md
        text-white bg-blue-600 hover:bg-blue-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
    >
      {isLoading && (
        <LoadingSpinner 
          size="sm" 
          color="white" 
          className="mr-2" 
        />
      )}
      {isLoading ? loadingText : children}
    </button>
  );
};