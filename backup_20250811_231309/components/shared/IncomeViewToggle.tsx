'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';

type IncomeViewMode = 'monthly' | 'annual';

interface IncomeViewToggleProps {
  viewMode: IncomeViewMode;
  onViewModeChange: (mode: IncomeViewMode) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IncomeViewToggle = ({
  viewMode,
  onViewModeChange,
  size = 'md',
  className = ''
}: IncomeViewToggleProps) => {
  const sizeClasses = {
    sm: {
      container: 'p-1',
      button: 'px-3 py-1.5 text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'p-1.5',
      button: 'px-4 py-2.5 text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      container: 'p-2',
      button: 'px-5 py-3 text-base',
      icon: 'w-5 h-5'
    }
  };

  const classes = sizeClasses[size];

  return (
    <motion.div 
      className={`flex items-center justify-center ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      <div className={`relative flex items-center bg-white/90 backdrop-blur-sm rounded-xl ${classes.container} shadow-lg border border-white/20`}>
        <div className="flex items-center space-x-1">
          <motion.button
            onClick={() => onViewModeChange('monthly')}
            className={`relative ${classes.button} font-semibold rounded-lg transition-all duration-300 ${
              viewMode === 'monthly'
                ? 'text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {viewMode === 'monthly' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg"
                layoutId="activeIncomeViewMode"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative flex items-center space-x-1.5">
              <Calendar className={classes.icon} />
              <span>Monthly</span>
            </span>
          </motion.button>
          
          <motion.button
            onClick={() => onViewModeChange('annual')}
            className={`relative ${classes.button} font-semibold rounded-lg transition-all duration-300 ${
              viewMode === 'annual'
                ? 'text-white shadow-lg'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {viewMode === 'annual' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg"
                layoutId="activeIncomeViewMode"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative flex items-center space-x-1.5">
              <TrendingUp className={classes.icon} />
              <span>Annual</span>
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Export the type for use in other components
export type { IncomeViewMode };