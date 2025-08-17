'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataSource } from '@prisma/client';

interface DataSourceBadgeProps {
  source: DataSource;
  lastSync?: Date | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function DataSourceBadge({ 
  source, 
  lastSync, 
  className = '', 
  size = 'sm',
  showTooltip = true 
}: DataSourceBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getSourceConfig = () => {
    switch (source) {
      case 'MANUAL':
        return {
          label: 'Manual',
          icon: '✋',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          description: 'Manually entered data',
          accentColor: '#3B82F6'
        };
      case 'YODLEE':
        return {
          label: 'Bank Sync',
          icon: '🏦',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          description: 'Synchronized from bank account',
          accentColor: '#10B981'
        };
      case 'MERGED':
        return {
          label: 'Merged',
          icon: '🔄',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          description: 'Combined manual and bank data',
          accentColor: '#8B5CF6'
        };
      default:
        return {
          label: 'Unknown',
          icon: '❓',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          description: 'Data source unknown',
          accentColor: '#6B7280'
        };
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never synced';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          badge: 'px-1.5 py-0.5 text-xs',
          icon: 'text-xs',
          text: 'text-xs'
        };
      case 'md':
        return {
          badge: 'px-2 py-1 text-sm',
          icon: 'text-sm',
          text: 'text-sm'
        };
      case 'lg':
        return {
          badge: 'px-3 py-1.5 text-base',
          icon: 'text-base',
          text: 'text-base'
        };
    }
  };

  const config = getSourceConfig();
  const sizeClasses = getSizeClasses();

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`
          inline-flex items-center gap-1 rounded-full border font-medium
          ${sizeClasses.badge}
          ${config.bgColor}
          ${config.borderColor}
          ${config.color}
          transition-all duration-200
        `}
      >
        <span className={sizeClasses.icon}>{config.icon}</span>
        <span className={sizeClasses.text}>{config.label}</span>
      </motion.div>

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
              <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700">
                <div className="font-medium">{config.description}</div>
                {source === 'YODLEE' && (
                  <div className="text-gray-300 mt-1">
                    Last sync: {formatLastSync(lastSync)}
                  </div>
                )}
                
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

// Helper component for multiple badges
interface DataSourceBadgeGroupProps {
  sources: Array<{
    source: DataSource;
    lastSync?: Date | null;
    count?: number;
  }>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DataSourceBadgeGroup({ 
  sources, 
  className = '', 
  size = 'sm' 
}: DataSourceBadgeGroupProps) {
  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {sources.map((sourceInfo, index) => (
        <div key={index} className="flex items-center gap-1">
          <DataSourceBadge
            source={sourceInfo.source}
            lastSync={sourceInfo.lastSync}
            size={size}
          />
          {sourceInfo.count && sourceInfo.count > 1 && (
            <span className="text-xs text-gray-500 font-medium">
              ({sourceInfo.count})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}