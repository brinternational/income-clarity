'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FreshnessIndicatorProps {
  lastSync: Date | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  customThresholds?: {
    fresh: number; // hours
    stale: number; // hours
  };
}

type FreshnessLevel = 'fresh' | 'moderate' | 'stale' | 'very_stale' | 'unknown';

export function FreshnessIndicator({
  lastSync,
  className = '',
  size = 'sm',
  showLabel = false,
  showTooltip = true,
  customThresholds = { fresh: 24, stale: 168 } // 1 day fresh, 1 week stale
}: FreshnessIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getFreshnessLevel = (): FreshnessLevel => {
    if (!lastSync) return 'unknown';

    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < customThresholds.fresh) return 'fresh';
    if (diffHours < customThresholds.stale) return 'moderate';
    if (diffHours < customThresholds.stale * 2) return 'stale';
    return 'very_stale';
  };

  const getFreshnessConfig = (level: FreshnessLevel) => {
    switch (level) {
      case 'fresh':
        return {
          color: '#10B981', // green-500
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-700 dark:text-green-300',
          label: 'Fresh',
          description: 'Recently updated data',
          priority: 'high'
        };
      case 'moderate':
        return {
          color: '#F59E0B', // yellow-500
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          label: 'Moderate',
          description: 'Data is somewhat outdated',
          priority: 'medium'
        };
      case 'stale':
        return {
          color: '#EF4444', // red-500
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-700 dark:text-red-300',
          label: 'Stale',
          description: 'Data may be outdated',
          priority: 'low'
        };
      case 'very_stale':
        return {
          color: '#DC2626', // red-600
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-200',
          label: 'Very Stale',
          description: 'Data is significantly outdated',
          priority: 'critical'
        };
      default:
        return {
          color: '#6B7280', // gray-500
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          textColor: 'text-gray-700 dark:text-gray-300',
          label: 'Unknown',
          description: 'Data freshness unknown',
          priority: 'unknown'
        };
    }
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Never updated';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          dot: 'w-2 h-2',
          container: 'gap-1',
          text: 'text-xs',
          padding: 'px-1.5 py-0.5'
        };
      case 'md':
        return {
          dot: 'w-3 h-3',
          container: 'gap-1.5',
          text: 'text-sm',
          padding: 'px-2 py-1'
        };
      case 'lg':
        return {
          dot: 'w-4 h-4',
          container: 'gap-2',
          text: 'text-base',
          padding: 'px-3 py-1.5'
        };
    }
  };

  const freshnessLevel = getFreshnessLevel();
  const config = getFreshnessConfig(freshnessLevel);
  const sizeConfig = getSizeConfig();

  return (
    <div 
      className={`relative inline-flex items-center ${sizeConfig.container} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Freshness Dot */}
      <motion.div
        className={`
          ${sizeConfig.dot} rounded-full border-2 border-white dark:border-gray-800 shadow-sm
          transition-all duration-200
        `}
        style={{ backgroundColor: config.color }}
        animate={
          freshnessLevel === 'very_stale' 
            ? { opacity: [1, 0.5, 1] }
            : { opacity: 1 }
        }
        transition={{
          duration: 2,
          repeat: freshnessLevel === 'very_stale' ? Infinity : 0,
          ease: 'easeInOut'
        }}
      />

      {/* Label */}
      {showLabel && (
        <span className={`${sizeConfig.text} font-medium ${config.textColor}`}>
          {config.label}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none"
            >
              <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700 min-w-max">
                <div className="font-medium">{config.description}</div>
                <div className="text-gray-300 mt-1">
                  {formatTimestamp(lastSync)}
                </div>
                
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                  <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// Extended version with more details
interface DetailedFreshnessIndicatorProps extends FreshnessIndicatorProps {
  dataType?: string;
  showMetrics?: boolean;
}

export function DetailedFreshnessIndicator({
  lastSync,
  dataType = 'Data',
  showMetrics = false,
  className = '',
  ...props
}: DetailedFreshnessIndicatorProps) {
  const freshnessLevel = lastSync ? getFreshnessLevel(lastSync, props.customThresholds) : 'unknown';
  const config = getFreshnessConfig(freshnessLevel);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <FreshnessIndicator
        lastSync={lastSync}
        showLabel={true}
        {...props}
      />
      
      {showMetrics && (
        <div className="flex flex-col">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {dataType} freshness
          </span>
          <span className={`text-xs font-medium ${config.textColor}`}>
            {formatTimestamp(lastSync)}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getFreshnessLevel(
  lastSync: Date, 
  thresholds = { fresh: 24, stale: 168 }
): FreshnessLevel {
  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < thresholds.fresh) return 'fresh';
  if (diffHours < thresholds.stale) return 'moderate';
  if (diffHours < thresholds.stale * 2) return 'stale';
  return 'very_stale';
}

function getFreshnessConfig(level: FreshnessLevel) {
  switch (level) {
    case 'fresh':
      return {
        color: '#10B981',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-300',
        label: 'Fresh',
        description: 'Recently updated data',
        priority: 'high'
      };
    case 'moderate':
      return {
        color: '#F59E0B',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        label: 'Moderate',
        description: 'Data is somewhat outdated',
        priority: 'medium'
      };
    case 'stale':
      return {
        color: '#EF4444',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-300',
        label: 'Stale',
        description: 'Data may be outdated',
        priority: 'low'
      };
    case 'very_stale':
      return {
        color: '#DC2626',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-800 dark:text-red-200',
        label: 'Very Stale',
        description: 'Data is significantly outdated',
        priority: 'critical'
      };
    default:
      return {
        color: '#6B7280',
        bgColor: 'bg-gray-100 dark:bg-gray-900/20',
        textColor: 'text-gray-700 dark:text-gray-300',
        label: 'Unknown',
        description: 'Data freshness unknown',
        priority: 'unknown'
      };
  }
}

function formatTimestamp(date: Date | null): string {
  if (!date) return 'Never updated';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}