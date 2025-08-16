'use client';

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import type { TimeRange } from '@/lib/api/super-cards-api';

interface TimeRangeSelectorProps {
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'pills';
  showIcon?: boolean;
  disabled?: boolean;
}

interface TimeRangeOption {
  value: TimeRange;
  label: string;
  shortLabel: string;
  description: string;
  isPopular?: boolean;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { 
    value: '1D', 
    label: '1 Day', 
    shortLabel: '1D',
    description: 'Today\'s performance'
  },
  { 
    value: '1W', 
    label: '1 Week', 
    shortLabel: '1W',
    description: 'Past week\'s performance'
  },
  { 
    value: '1M', 
    label: '1 Month', 
    shortLabel: '1M',
    description: 'Past month\'s performance',
    isPopular: true
  },
  { 
    value: '3M', 
    label: '3 Months', 
    shortLabel: '3M',
    description: 'Quarterly performance',
    isPopular: true
  },
  { 
    value: '6M', 
    label: '6 Months', 
    shortLabel: '6M',
    description: 'Half-year performance'
  },
  { 
    value: '1Y', 
    label: '1 Year', 
    shortLabel: '1Y',
    description: 'Annual performance',
    isPopular: true
  },
  { 
    value: 'YTD', 
    label: 'Year to Date', 
    shortLabel: 'YTD',
    description: 'This year\'s performance',
    isPopular: true
  },
  { 
    value: 'MAX', 
    label: 'All Time', 
    shortLabel: 'ALL',
    description: 'Complete history'
  }
];

const TimeRangeSelector = memo(({
  selectedTimeRange,
  onTimeRangeChange,
  className = '',
  variant = 'default',
  showIcon = true,
  disabled = false
}: TimeRangeSelectorProps) => {
  const [hoveredOption, setHoveredOption] = useState<TimeRange | null>(null);

  const handleOptionClick = useCallback((timeRange: TimeRange) => {
    if (disabled) return;
    onTimeRangeChange(timeRange);
  }, [onTimeRangeChange, disabled]);

  const getButtonClass = (option: TimeRangeOption, isSelected: boolean) => {
    const baseClass = 'relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer';
    
    if (disabled) {
      return `${baseClass} opacity-50 cursor-not-allowed text-gray-400 bg-gray-100`;
    }

    if (variant === 'compact') {
      return `${baseClass} ${
        isSelected
          ? 'text-white bg-blue-600 shadow-md'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`;
    }

    if (variant === 'pills') {
      return `${baseClass} border-2 ${
        isSelected
          ? 'text-blue-700 bg-blue-50 border-blue-200 shadow-sm'
          : 'text-gray-600 bg-white border-gray-200 hover:border-blue-200 hover:text-blue-600'
      }`;
    }

    // Default variant
    return `${baseClass} ${
      isSelected
        ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg'
        : 'text-gray-700 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:text-blue-600'
    }`;
  };

  const renderOptions = () => {
    return TIME_RANGE_OPTIONS.map((option) => {
      const isSelected = selectedTimeRange === option.value;
      const isHovered = hoveredOption === option.value;

      return (
        <motion.button
          key={option.value}
          className={getButtonClass(option, isSelected)}
          onClick={() => handleOptionClick(option.value)}
          onMouseEnter={() => setHoveredOption(option.value)}
          onMouseLeave={() => setHoveredOption(null)}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          layout
        >
          {/* Popular badge */}
          {option.isPopular && !isSelected && variant === 'default' && (
            <motion.span
              className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}

          <span className="relative z-10">
            {variant === 'compact' ? option.shortLabel : option.label}
          </span>

          {/* Selection indicator */}
          {isSelected && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              layoutId="timeRangeIndicator"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30
              }}
              style={{
                background: variant === 'pills' 
                  ? 'linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(99, 102, 241, 0.1))'
                  : 'linear-gradient(135deg, rgb(59, 130, 246), rgb(99, 102, 241))'
              }}
            />
          )}

          {/* Hover effect */}
          <AnimatePresence>
            {isHovered && !isSelected && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-blue-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </AnimatePresence>
        </motion.button>
      );
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {showIcon && (
          <Clock className="w-4 h-4 text-gray-500 mr-2" />
        )}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {renderOptions()}
        </div>
      </div>
    );
  }

  return (
    <div className={`time-range-selector ${className}`}>
      {showIcon && (
        <div className="flex items-center mb-3">
          <Calendar className="w-5 h-5 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">Time Period</span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {renderOptions()}
      </div>

      {/* Description tooltip */}
      <AnimatePresence>
        {hoveredOption && variant === 'default' && (
          <motion.div
            className="mt-2 text-xs text-gray-500 text-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {TIME_RANGE_OPTIONS.find(opt => opt.value === hoveredOption)?.description}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TimeRangeSelector.displayName = 'TimeRangeSelector';

export { TimeRangeSelector };
export type { TimeRangeSelectorProps, TimeRangeOption };