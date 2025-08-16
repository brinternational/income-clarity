'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger'

interface DataSourceIndicatorProps {
  dataSource: 'polygon' | 'simulated' | 'cost-basis-fallback' | 'cache';
  showDetails?: boolean;
  priceAge?: number | null; // in minutes
  className?: string;
  variant?: 'compact' | 'full';
  onRefresh?: () => Promise<void>;
}

export function DataSourceIndicator({ 
  dataSource, 
  showDetails = false,
  priceAge,
  className = '',
  variant = 'compact',
  onRefresh
}: DataSourceIndicatorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getSourceInfo = () => {
    switch (dataSource) {
      case 'polygon':
        return {
          label: 'Live Data',
          icon: '🟢',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          description: 'Real-time data from Polygon.io',
          reliability: 'High'
        };
      case 'simulated':
        return {
          label: 'Simulated',
          icon: '🔶',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          description: 'Simulated market data (API not available)',
          reliability: 'Medium'
        };
      case 'cost-basis-fallback':
        return {
          label: 'Cost Basis',
          icon: '🔴',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          description: 'Using original purchase price (no current data)',
          reliability: 'Low'
        };
      case 'cache':
        return {
          label: 'Cached',
          icon: '🟡',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          description: 'Cached data (may be slightly outdated)',
          reliability: 'Good'
        };
      default:
        return {
          label: 'Unknown',
          icon: '⚪',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          description: 'Data source unknown',
          reliability: 'Unknown'
        };
    }
  };

  const formatPriceAge = (minutes: number | null) => {
    if (minutes === null) return 'Unknown age';
    if (minutes < 1) return 'Just updated';
    if (minutes < 60) return `${Math.floor(minutes)} min old`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} old`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} old`;
  };

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      logger.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sourceInfo = getSourceInfo();

  if (variant === 'compact') {
    return (
      <div 
        className={`inline-flex items-center space-x-1 relative ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="text-xs">{sourceInfo.icon}</span>
        <span className={`text-xs font-medium ${sourceInfo.color}`}>
          {sourceInfo.label}
        </span>
        
        {priceAge !== null && priceAge !== undefined && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({formatPriceAge(priceAge)})
          </span>
        )}

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Refresh data"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
            >
              🔄
            </motion.div>
          </button>
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 z-50"
            >
              <div className={`px-2 py-1 rounded text-xs whitespace-nowrap ${sourceInfo.bgColor} ${sourceInfo.borderColor} border`}>
                <div className={`font-medium ${sourceInfo.color}`}>{sourceInfo.description}</div>
                {priceAge !== null && priceAge !== undefined && (
                  <div className="text-gray-600 dark:text-gray-300">
                    Updated: {formatPriceAge(priceAge)}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`p-3 rounded-lg border ${sourceInfo.bgColor} ${sourceInfo.borderColor} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{sourceInfo.icon}</span>
          <div>
            <div className={`font-medium ${sourceInfo.color}`}>
              {sourceInfo.label}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {sourceInfo.description}
            </div>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isRefreshing
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : `hover:bg-white dark:hover:bg-gray-800 ${sourceInfo.color}`
            }`}
          >
            <motion.span
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              className="inline-block mr-1"
            >
              🔄
            </motion.span>
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Reliability:</span>
              <span className={`ml-1 font-medium ${sourceInfo.color}`}>
                {sourceInfo.reliability}
              </span>
            </div>
            {priceAge !== null && priceAge !== undefined && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Age:</span>
                <span className="ml-1 text-gray-900 dark:text-white">
                  {formatPriceAge(priceAge)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}