'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/utils/hapticFeedback';

interface RippleEffect {
  id: string;
  x: number;
  y: number;
  startTime: number;
}

interface TouchFeedbackProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  rippleColor?: string;
  rippleDuration?: number;
  rippleSize?: number;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection' | 'impact';
  pressScale?: number;
  bounceOnPress?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
  onPress?: () => void;
  onRelease?: () => void;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
  tabIndex?: number;
}

const TouchFeedbackComponent = ({
  children,
  className = '',
  disabled = false,
  rippleColor = 'rgba(59, 130, 246, 0.3)',
  rippleDuration = 600,
  rippleSize = 100,
  hapticType = 'light',
  pressScale = 0.95,
  bounceOnPress = true,
  glowOnHover = true,
  onClick,
  onPress,
  onRelease,
  style,
  'aria-label': ariaLabel,
  role = 'button',
  tabIndex = 0,
  ...rest
}: TouchFeedbackProps) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique ID for ripple effects
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Create ripple effect at touch/click position
  const createRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      // Fallback to center
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newRipple: RippleEffect = {
      id: generateId(),
      x,
      y,
      startTime: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, rippleDuration);

  }, [disabled, rippleDuration]);

  // Handle press start
  const handlePressStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;

    setIsPressed(true);
    createRipple(event);
    onPress?.();

    // Haptic feedback
    if (hapticType === 'impact') {
      haptic.impact('light');
    } else if (hapticType === 'selection') {
      haptic.selection();
    } else {
      haptic.impact(hapticType);
    }

    // Long press detection (for potential future use)
    pressTimerRef.current = setTimeout(() => {
      // Could trigger long press action here
    }, 500);

  }, [disabled, hapticType, onPress, createRipple]);

  // Handle press end
  const handlePressEnd = useCallback(() => {
    if (disabled) return;

    setIsPressed(false);
    onRelease?.();

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

  }, [disabled, onRelease]);

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    onClick?.();
  }, [disabled, onClick]);

  // Handle touch events
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    handlePressStart(event);
  }, [handlePressStart]);

  const handleTouchEnd = useCallback(() => {
    handlePressEnd();
  }, [handlePressEnd]);

  // Handle mouse events
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    handlePressStart(event);
  }, [handlePressStart]);

  const handleMouseUp = useCallback(() => {
    handlePressEnd();
  }, [handlePressEnd]);

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
    setIsHovered(false);
    handlePressEnd();
  }, [handlePressEnd]);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setIsHovered(true);
    }
  }, [disabled]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsPressed(true);
      
      // Create ripple at center
      const element = elementRef.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const syntheticEvent = {
          clientX: rect.left + centerX,
          clientY: rect.top + centerY,
          preventDefault: () => {},
          stopPropagation: () => {}
        } as React.MouseEvent;
        
        createRipple(syntheticEvent);
      }
      
      onPress?.();
      haptic.selection();
    }
  }, [disabled, onPress, createRipple]);

  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsPressed(false);
      onRelease?.();
      onClick?.();
    }
  }, [disabled, onRelease, onClick]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    if (!disabled) {
      setIsFocused(true);
    }
  }, [disabled]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsPressed(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  // Calculate dynamic styles
  const dynamicStyle: React.CSSProperties = {
    ...style,
    position: 'relative',
    overflow: 'hidden',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    ...(glowOnHover && isHovered && !disabled && {
      boxShadow: `0 0 20px ${rippleColor}`,
    }),
    ...(isFocused && !disabled && {
      outline: `2px solid ${rippleColor}`,
      outlineOffset: '2px',
    }),
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <motion.div
      ref={elementRef}
      className={`touch-feedback ${className}`}
      style={dynamicStyle}
      role={role}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : tabIndex}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      animate={{
        scale: isPressed && bounceOnPress ? pressScale : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        duration: 0.1
      }}
      whileHover={!disabled && glowOnHover ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled && bounceOnPress ? {
        scale: pressScale,
        transition: { duration: 0.1 }
      } : {}}
      {...rest}
    >
      {children}

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: ripple.x - rippleSize / 2,
              top: ripple.y - rippleSize / 2,
              width: rippleSize,
              height: rippleSize,
              backgroundColor: rippleColor,
            }}
            initial={{
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: 2,
              opacity: 0,
            }}
            exit={{
              scale: 2.5,
              opacity: 0,
            }}
            transition={{
              duration: rippleDuration / 1000,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Hover glow effect */}
      {glowOnHover && isHovered && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            background: `radial-gradient(circle, ${rippleColor} 0%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Press feedback overlay */}
      {isPressed && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            backgroundColor: rippleColor,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        />
      )}

      {/* Focus ring */}
      {isFocused && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[inherit] border-2"
          style={{
            borderColor: rippleColor,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
};

// Memoize to prevent unnecessary re-renders
export const TouchFeedback = memo(TouchFeedbackComponent, (prevProps, nextProps) => {
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.rippleColor === nextProps.rippleColor &&
    prevProps.rippleDuration === nextProps.rippleDuration &&
    prevProps.rippleSize === nextProps.rippleSize &&
    prevProps.hapticType === nextProps.hapticType &&
    prevProps.pressScale === nextProps.pressScale &&
    prevProps.bounceOnPress === nextProps.bounceOnPress &&
    prevProps.glowOnHover === nextProps.glowOnHover
  );
});

export default TouchFeedback;