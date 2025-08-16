'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { RefreshCw, ArrowDown, CheckCircle } from 'lucide-react';
import { haptic } from '@/utils/hapticFeedback';
import { liveRegionManager } from '@/utils/accessibility';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  threshold?: number;
  refreshTimeout?: number;
  className?: string;
  pullDistance?: number;
}

type RefreshState = 'idle' | 'pulling' | 'triggered' | 'refreshing' | 'success' | 'error';

const PullToRefreshComponent = ({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
  refreshTimeout = 30000,
  className = '',
  pullDistance = 120
}: PullToRefreshProps) => {
  const [refreshState, setRefreshState] = useState<RefreshState>('idle');
  const [pullOffset, setPullOffset] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  // Check if at top of scroll container
  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const scrollTop = container.scrollTop || window.scrollY;
    setIsAtTop(scrollTop <= 10);
  }, []);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    const scrollElement = container || window;
    
    scrollElement.addEventListener('scroll', checkScrollPosition, { passive: true });
    checkScrollPosition(); // Initial check
    
    return () => {
      scrollElement.removeEventListener('scroll', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  // Calculate refresh progress based on pull distance
  const calculateProgress = (offset: number) => {
    const progress = Math.min(offset / threshold, 1);
    return Math.max(0, progress);
  };

  // Handle pan gesture
  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || refreshState === 'refreshing') return;
    
    const offset = Math.max(0, info.offset.y);
    const progress = calculateProgress(offset);
    
    setPullOffset(offset);
    setRefreshProgress(progress);
    
    if (offset > threshold && refreshState !== 'triggered') {
      setRefreshState('triggered');
      haptic.impact('medium');
      liveRegionManager.announce('Release to refresh', 'polite');
    } else if (offset <= threshold && refreshState !== 'pulling' && offset > 0) {
      setRefreshState('pulling');
    } else if (offset === 0 && refreshState !== 'idle') {
      setRefreshState('idle');
    }
  };

  // Handle pan end - trigger refresh if threshold met
  const handlePanEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || refreshState === 'refreshing') return;
    
    const offset = Math.max(0, info.offset.y);
    const velocity = info.velocity.y;
    
    if (offset > threshold || (velocity > 500 && offset > threshold * 0.5)) {
      await triggerRefresh();
    } else {
      // Animate back to idle
      setRefreshState('idle');
      setPullOffset(0);
      setRefreshProgress(0);
      
      controls.start({
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
    }
  };

  // Trigger refresh action
  const triggerRefresh = async () => {
    if (disabled || refreshState === 'refreshing') return;
    
    // Prevent too frequent refreshes (minimum 2 seconds apart)
    const now = Date.now();
    if (now - lastRefreshTime < 2000) {
      setRefreshState('idle');
      setPullOffset(0);
      setRefreshProgress(0);
      return;
    }
    
    setRefreshState('refreshing');
    setLastRefreshTime(now);
    haptic.impact('heavy');
    liveRegionManager.announce('Refreshing content', 'polite');
    
    // Animate to refresh position
    controls.start({
      y: threshold,
      transition: { type: 'spring', stiffness: 200, damping: 25 }
    });
    
    // Set up timeout
    refreshTimeoutRef.current = setTimeout(() => {
      if (refreshState === 'refreshing') {
        setRefreshState('error');
        liveRegionManager.announce('Refresh timeout', 'assertive');
      }
    }, refreshTimeout);
    
    try {
      await onRefresh();
      setRefreshState('success');
      liveRegionManager.announce('Content refreshed successfully', 'polite');
      
      // Show success state briefly
      setTimeout(() => {
        setRefreshState('idle');
        setPullOffset(0);
        setRefreshProgress(0);
        
        controls.start({
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30 }
        });
      }, 1000);
      
    } catch (error) {
      setRefreshState('error');
      liveRegionManager.announce('Refresh failed. Please try again.', 'assertive');
      // console.error('Pull-to-refresh failed:', error);

      // Show error state briefly
      setTimeout(() => {
        setRefreshState('idle');
        setPullOffset(0);
        setRefreshProgress(0);
        
        controls.start({
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30 }
        });
      }, 2000);
    } finally {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Get refresh indicator content
  const getRefreshIndicator = () => {
    const iconSize = "w-6 h-6";
    const baseClasses = "transition-all duration-200";
    
    switch (refreshState) {
      case 'pulling':
        return (
          <motion.div
            className="flex items-center space-x-2 text-blue-600"
            animate={{ scale: refreshProgress * 0.2 + 0.8 }}
          >
            <ArrowDown 
              className={`${iconSize} ${baseClasses}`} 
              style={{ 
                transform: `rotate(${refreshProgress * 180}deg)` 
              }}
            />
            <span className="text-sm font-medium">Pull to refresh</span>
          </motion.div>
        );
        
      case 'triggered':
        return (
          <motion.div
            className="flex items-center space-x-2 text-green-600"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <ArrowDown className={`${iconSize} ${baseClasses} rotate-180`} />
            <span className="text-sm font-medium">Release to refresh</span>
          </motion.div>
        );
        
      case 'refreshing':
        return (
          <motion.div
            className="flex items-center space-x-2 text-blue-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className={iconSize} />
            </motion.div>
            <span className="text-sm font-medium">Refreshing...</span>
          </motion.div>
        );
        
      case 'success':
        return (
          <motion.div
            className="flex items-center space-x-2 text-green-600"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <CheckCircle className={iconSize} />
            <span className="text-sm font-medium">Refreshed!</span>
          </motion.div>
        );
        
      case 'error':
        return (
          <motion.div
            className="flex items-center space-x-2 text-red-600"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <RefreshCw className={iconSize} />
            <span className="text-sm font-medium">Refresh failed</span>
          </motion.div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Refresh Indicator */}
      {(refreshState !== 'idle' || pullOffset > 0) && (
        <motion.div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4 bg-gradient-to-b from-white via-white/90 to-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ 
            opacity: refreshState === 'idle' ? refreshProgress : 1,
            y: refreshState === 'idle' ? Math.max(-50 + (pullOffset * 0.5), -50) : 0
          }}
          style={{
            height: refreshState === 'idle' ? Math.min(pullOffset, pullDistance) : pullDistance
          }}
        >
          {getRefreshIndicator()}
          
          {/* Progress Bar */}
          {refreshState === 'pulling' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: '0%' }}
                animate={{ width: `${refreshProgress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        drag={isAtTop && !disabled ? 'y' : false}
        dragConstraints={{ top: 0, bottom: pullDistance }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        animate={controls}
        className="relative"
        style={{
          paddingTop: refreshState === 'refreshing' ? threshold : 0
        }}
      >
        {children}
      </motion.div>

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite">
        {refreshState === 'refreshing' && 'Refreshing content, please wait...'}
        {refreshState === 'success' && 'Content refreshed successfully'}
        {refreshState === 'error' && 'Refresh failed, please try again'}
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const PullToRefresh = memo(PullToRefreshComponent, (prevProps, nextProps) => {
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.threshold === nextProps.threshold &&
    prevProps.refreshTimeout === nextProps.refreshTimeout
  );
});

export default PullToRefresh;