'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';

interface SyncStatusIndicatorProps {
  userId: string;
  lastSyncTime?: Date | null;
  isActive?: boolean;
  onRefresh?: () => Promise<void>;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'rate_limited';

export function SyncStatusIndicator({
  userId,
  lastSyncTime,
  isActive = true,
  onRefresh,
  className = '',
  showLabel = true,
  size = 'md'
}: SyncStatusIndicatorProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const [rateLimitUntil, setRateLimitUntil] = useState<Date | null>(null);

  // Check if we're rate limited
  useEffect(() => {
    if (rateLimitUntil) {
      const checkRateLimit = () => {
        if (new Date() > rateLimitUntil) {
          setRateLimitUntil(null);
          setSyncStatus('idle');
        }
      };

      const interval = setInterval(checkRateLimit, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimitUntil]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never synced';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just synced';
    if (diffMins < 60) return `Synced ${diffMins}m ago`;
    if (diffHours < 24) return `Synced ${diffHours}h ago`;
    if (diffDays < 7) return `Synced ${diffDays}d ago`;
    
    return `Synced ${date.toLocaleDateString()}`;
  };

  const getSyncStatusConfig = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: '🔄',
          label: 'Syncing...',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          animate: true
        };
      case 'success':
        return {
          icon: '✅',
          label: 'Synced',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          animate: false
        };
      case 'error':
        return {
          icon: '⚠️',
          label: 'Sync Failed',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          animate: false
        };
      case 'rate_limited':
        return {
          icon: '⏱️',
          label: 'Rate Limited',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          animate: false
        };
      default:
        return {
          icon: '🔄',
          label: 'Ready to Sync',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          animate: false
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1',
          icon: 'text-xs',
          text: 'text-xs',
          button: 'text-xs px-1.5 py-0.5'
        };
      case 'md':
        return {
          container: 'px-3 py-1.5',
          icon: 'text-sm',
          text: 'text-sm',
          button: 'text-sm px-2 py-1'
        };
      case 'lg':
        return {
          container: 'px-4 py-2',
          icon: 'text-base',
          text: 'text-base',
          button: 'text-base px-3 py-1.5'
        };
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh || syncStatus === 'syncing' || rateLimitUntil) return;

    setSyncStatus('syncing');
    setLastError(null);

    try {
      await onRefresh();
      setSyncStatus('success');
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      logger.error('Sync failed:', error);
      setLastError(error.message || 'Sync failed');
      setSyncStatus('error');

      // Check if it's a rate limit error
      if (error.status === 429 || error.message?.includes('rate limit')) {
        setSyncStatus('rate_limited');
        // Set rate limit for 5 minutes
        setRateLimitUntil(new Date(Date.now() + 5 * 60 * 1000));
      }
    }
  };

  const statusConfig = getSyncStatusConfig();
  const sizeClasses = getSizeClasses();

  if (!isActive) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Indicator */}
      <div 
        className={`
          inline-flex items-center gap-2 rounded-lg border font-medium
          ${sizeClasses.container}
          ${statusConfig.bgColor}
          ${statusConfig.borderColor}
          ${statusConfig.color}
          transition-all duration-200
        `}
      >
        <motion.span
          className={sizeClasses.icon}
          animate={statusConfig.animate ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 1,
            repeat: statusConfig.animate ? Infinity : 0,
            ease: 'linear'
          }}
        >
          {statusConfig.icon}
        </motion.span>
        
        {showLabel && (
          <span className={sizeClasses.text}>
            {statusConfig.label}
          </span>
        )}

        {lastSyncTime && syncStatus === 'idle' && (
          <span className={`${sizeClasses.text} text-gray-500 dark:text-gray-400`}>
            • {formatLastSync(lastSyncTime)}
          </span>
        )}
      </div>

      {/* Refresh Button */}
      {onRefresh && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={syncStatus === 'syncing' || !!rateLimitUntil}
          className={`
            rounded-md border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 
            hover:bg-gray-50 dark:hover:bg-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${sizeClasses.button}
            ${statusConfig.color}
          `}
          aria-label="Refresh sync status"
        >
          <motion.span
            animate={syncStatus === 'syncing' ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              duration: 1,
              repeat: syncStatus === 'syncing' ? Infinity : 0,
              ease: 'linear'
            }}
          >
            🔄
          </motion.span>
          <span className="ml-1">
            {rateLimitUntil ? 'Rate Limited' : 'Refresh'}
          </span>
        </motion.button>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {syncStatus === 'error' && lastError && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-xs text-red-600 dark:text-red-400 max-w-xs truncate"
            title={lastError}
          >
            {lastError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate Limit Countdown */}
      <AnimatePresence>
        {rateLimitUntil && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-xs text-yellow-600 dark:text-yellow-400"
          >
            {Math.ceil((rateLimitUntil.getTime() - Date.now()) / 1000)}s
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing sync status across components
export function useSyncStatus(userId: string) {
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const triggerSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sync/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      setLastSyncTime(new Date());
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLastSyncTime = async () => {
    try {
      const response = await fetch(`/api/sync/status?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.lastSyncTime) {
          setLastSyncTime(new Date(data.lastSyncTime));
        }
      }
    } catch (error) {
      logger.error('Failed to fetch sync status:', error);
    }
  };

  useEffect(() => {
    fetchLastSyncTime();
  }, [userId]);

  return {
    lastSyncTime,
    isLoading,
    triggerSync,
    refreshStatus: fetchLastSyncTime
  };
}