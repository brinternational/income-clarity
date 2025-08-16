'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { haptic } from '@/utils/hapticFeedback';
import { liveRegionManager } from '@/utils/accessibility';

export interface GestureAction {
  action: string;
  description: string;
  handler: () => void;
}

export const GESTURE_MAP: Record<string, GestureAction> = {
  swipeUp: {
    action: 'swipeUp',
    description: 'Show details or expand card',
    handler: () => {}
  },
  swipeDown: {
    action: 'swipeDown', 
    description: 'Hide details or collapse card',
    handler: () => {}
  },
  swipeLeft: {
    action: 'swipeLeft',
    description: 'Next card or navigate forward',
    handler: () => {}
  },
  swipeRight: {
    action: 'swipeRight',
    description: 'Previous card or navigate back', 
    handler: () => {}
  },
  pinch: {
    action: 'pinch',
    description: 'Toggle zoom or focus mode',
    handler: () => {}
  },
  doubleTap: {
    action: 'doubleTap',
    description: 'Favorite or bookmark item',
    handler: () => {}
  },
  longPress: {
    action: 'longPress',
    description: 'Show context menu or options',
    handler: () => {}
  },
  threeFingerTap: {
    action: 'threeFingerTap',
    description: 'Accessibility shortcuts',
    handler: () => {}
  }
};

interface GestureHandlerProps {
  children: React.ReactNode;
  gestures?: Partial<typeof GESTURE_MAP>;
  disabled?: boolean;
  className?: string;
  swipeThreshold?: number;
  longPressThreshold?: number;
  doubleTapThreshold?: number;
  pinchThreshold?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
  identifier: number;
}

const GestureHandlerComponent = ({
  children,
  gestures = {},
  disabled = false,
  className = '',
  swipeThreshold = 50,
  longPressThreshold = 500,
  doubleTapThreshold = 300,
  pinchThreshold = 0.2
}: GestureHandlerProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [lastTap, setLastTap] = useState<TouchPoint | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [currentPinchDistance, setCurrentPinchDistance] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeGestures = { ...GESTURE_MAP, ...gestures };

  // Calculate distance between two touch points
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Get center point of multiple touches
  const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < touches.length; i++) {
      x += touches[i].clientX;
      y += touches[i].clientY;
    }
    
    return {
      x: x / touches.length,
      y: y / touches.length
    };
  };

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    
    const touches = Array.from(e.touches).map((touch, index) => ({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      identifier: touch.identifier
    }));
    
    setTouchPoints(touches);
    setIsPressed(true);
    
    // Handle pinch start
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setInitialPinchDistance(distance);
      setCurrentPinchDistance(distance);
    }
    
    // Handle long press
    if (e.touches.length === 1 && activeGestures.longPress?.handler) {
      longPressTimeoutRef.current = setTimeout(() => {
        haptic.impact('heavy');
        liveRegionManager.announce(activeGestures.longPress.description, 'polite');
        activeGestures.longPress.handler();
      }, longPressThreshold);
    }
    
    // Handle three finger tap
    if (e.touches.length === 3 && activeGestures.threeFingerTap?.handler) {
      haptic.impact('medium');
      liveRegionManager.announce(activeGestures.threeFingerTap.description, 'polite');
      activeGestures.threeFingerTap.handler();
    }
    
  }, [disabled, activeGestures, longPressThreshold]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || touchPoints.length === 0) return;
    
    // Clear long press if finger moves too much
    if (longPressTimeoutRef.current) {
      const startPoint = touchPoints[0];
      const currentTouch = e.touches[0];
      const distance = Math.sqrt(
        Math.pow(currentTouch.clientX - startPoint.x, 2) +
        Math.pow(currentTouch.clientY - startPoint.y, 2)
      );
      
      if (distance > 10) { // 10px tolerance
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    }
    
    // Handle pinch
    if (e.touches.length === 2 && initialPinchDistance > 0) {
      const distance = getTouchDistance(e.touches);
      setCurrentPinchDistance(distance);
    }
    
  }, [disabled, touchPoints, initialPinchDistance]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled) return;
    
    // Clear long press timeout
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    
    // Handle pinch end
    if (initialPinchDistance > 0 && currentPinchDistance > 0) {
      const pinchRatio = currentPinchDistance / initialPinchDistance;
      const threshold = pinchThreshold;
      
      if (Math.abs(pinchRatio - 1) > threshold && activeGestures.pinch?.handler) {
        haptic.impact('medium');
        liveRegionManager.announce(`${pinchRatio > 1 ? 'Pinch out' : 'Pinch in'}: ${activeGestures.pinch.description}`, 'polite');
        activeGestures.pinch.handler();
      }
      
      setInitialPinchDistance(0);
      setCurrentPinchDistance(0);
    }
    
    // Handle tap gestures
    if (touchPoints.length === 1 && e.changedTouches.length === 1) {
      const touchPoint = touchPoints[0];
      const endTouch = e.changedTouches[0];
      const now = Date.now();
      
      // Calculate movement distance
      const distance = Math.sqrt(
        Math.pow(endTouch.clientX - touchPoint.x, 2) +
        Math.pow(endTouch.clientY - touchPoint.y, 2)
      );
      
      // If it was a tap (minimal movement and quick)
      if (distance < 10 && (now - touchPoint.time) < 200) {
        // Check for double tap
        if (lastTap && 
            (now - lastTap.time) < doubleTapThreshold &&
            Math.abs(endTouch.clientX - lastTap.x) < 50 &&
            Math.abs(endTouch.clientY - lastTap.y) < 50) {
          
          if (activeGestures.doubleTap?.handler) {
            haptic.impact('light');
            liveRegionManager.announce(activeGestures.doubleTap.description, 'polite');
            activeGestures.doubleTap.handler();
          }
          setLastTap(null);
        } else {
          // Single tap - store for potential double tap
          setLastTap({
            x: endTouch.clientX,
            y: endTouch.clientY,
            time: now,
            identifier: endTouch.identifier
          });
        }
      }
    }
    
    setIsPressed(false);
    setTouchPoints([]);
    
  }, [disabled, touchPoints, initialPinchDistance, currentPinchDistance, lastTap, doubleTapThreshold, pinchThreshold, activeGestures]);

  // Handle pan gestures (swipe)
  const handlePanEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const { offset, velocity } = info;
    const threshold = swipeThreshold;
    const velocityThreshold = 500;
    
    const absOffsetX = Math.abs(offset.x);
    const absOffsetY = Math.abs(offset.y);
    
    // Determine if it was a significant swipe
    const isSignificantSwipe = (
      (absOffsetX > threshold || Math.abs(velocity.x) > velocityThreshold) ||
      (absOffsetY > threshold || Math.abs(velocity.y) > velocityThreshold)
    );
    
    if (!isSignificantSwipe) return;
    
    // Determine primary direction
    let gesture: GestureAction | null = null;
    
    if (absOffsetX > absOffsetY) {
      // Horizontal swipe
      if (offset.x > 0 && activeGestures.swipeRight) {
        gesture = activeGestures.swipeRight;
      } else if (offset.x < 0 && activeGestures.swipeLeft) {
        gesture = activeGestures.swipeLeft;
      }
    } else {
      // Vertical swipe
      if (offset.y > 0 && activeGestures.swipeDown) {
        gesture = activeGestures.swipeDown;
      } else if (offset.y < 0 && activeGestures.swipeUp) {
        gesture = activeGestures.swipeUp;
      }
    }
    
    if (gesture) {
      haptic.selection();
      liveRegionManager.announce(`${gesture.action}: ${gesture.description}`, 'polite');
      gesture.handler();
    }
    
  }, [disabled, swipeThreshold, activeGestures]);

  // Set up touch event listeners
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      drag={disabled ? false : true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0}
      onPanEnd={handlePanEnd}
      whileTap={isPressed ? { scale: 0.98 } : {}}
    >
      {children}
      
      {/* Visual feedback for gestures */}
      {isPressed && (
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none rounded-lg" />
      )}
      
      {/* Pinch visual feedback */}
      {initialPinchDistance > 0 && currentPinchDistance > 0 && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-500 pointer-events-none rounded-lg"
          initial={{ scale: 1 }}
          animate={{ 
            scale: currentPinchDistance / initialPinchDistance,
            opacity: 0.6
          }}
          transition={{ duration: 0.1 }}
        />
      )}
      
      {/* Accessibility hints */}
      <div className="sr-only">
        <div role="region" aria-label="Gesture controls available">
          {Object.entries(activeGestures).map(([key, gesture]) => (
            <div key={key}>{gesture.description}</div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Memoize to prevent unnecessary re-renders
export const GestureHandler = memo(GestureHandlerComponent, (prevProps, nextProps) => {
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.swipeThreshold === nextProps.swipeThreshold &&
    prevProps.longPressThreshold === nextProps.longPressThreshold &&
    prevProps.doubleTapThreshold === nextProps.doubleTapThreshold &&
    prevProps.pinchThreshold === nextProps.pinchThreshold &&
    JSON.stringify(prevProps.gestures) === JSON.stringify(nextProps.gestures)
  );
});

export default GestureHandler;