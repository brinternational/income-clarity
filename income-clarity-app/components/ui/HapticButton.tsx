'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { haptic, HapticPattern } from '@/utils/hapticFeedback';

interface HapticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hapticPattern?: HapticPattern;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Button component with built-in haptic feedback
 * Automatically provides appropriate haptic feedback based on variant
 */
export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ 
    hapticPattern,
    variant = 'default',
    size = 'md',
    disabled = false,
    onClick,
    className = '',
    children,
    ...props 
  }, ref) => {
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      
      // Determine haptic pattern based on variant if not explicitly provided
      const pattern = hapticPattern || getHapticPatternForVariant(variant);
      
      // Trigger haptic feedback
      haptic[pattern]();
      
      // Call original onClick handler
      onClick?.(event);
    };

    const baseClasses = getBaseClasses();
    const variantClasses = getVariantClasses(variant);
    const sizeClasses = getSizeClasses(size);
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95';

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

HapticButton.displayName = 'HapticButton';

/**
 * Get appropriate haptic pattern for button variant
 */
function getHapticPatternForVariant(variant: HapticButtonProps['variant']): HapticPattern {
  switch (variant) {
    case 'destructive':
      return HapticPattern.Heavy;
    case 'primary':
      return HapticPattern.Medium;
    case 'ghost':
    case 'outline':
      return HapticPattern.Light;
    default:
      return HapticPattern.Medium;
  }
}

/**
 * Base button classes for consistent styling
 */
function getBaseClasses(): string {
  return [
    'inline-flex items-center justify-center',
    'rounded-md font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none touch-manipulation', // Improve touch responsiveness
  ].join(' ');
}

/**
 * Variant-specific classes
 */
function getVariantClasses(variant: HapticButtonProps['variant']): string {
  const variants = {
    default: [
      'bg-gray-100 text-gray-900 hover:bg-gray-200',
      'focus:ring-gray-500',
    ].join(' '),
    
    primary: [
      'text-white shadow-sm',
      'focus:ring-2 focus:ring-offset-2',
    ].join(' ') + ' ' + 'bg-[var(--color-accent)] hover:opacity-90 focus:ring-[var(--color-accent)]',
    
    secondary: [
      'border border-gray-300 bg-white text-gray-700',
      'hover:bg-gray-50 focus:ring-indigo-500',
    ].join(' '),
    
    destructive: [
      'bg-red-600 text-white hover:bg-red-700',
      'focus:ring-red-500',
    ].join(' '),
    
    ghost: [
      'text-gray-700 hover:bg-gray-100',
      'focus:ring-gray-500',
    ].join(' '),
    
    outline: [
      'border text-gray-700 hover:bg-gray-50',
      'focus:ring-gray-500',
    ].join(' ') + ' ' + 'border-[var(--color-border)]',
  };

  return variants[variant || 'default'] || variants.default;
}

/**
 * Size-specific classes
 */
function getSizeClasses(size: HapticButtonProps['size']): string {
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return sizes[size || 'md'] || sizes.md;
}

/**
 * Haptic Toggle Button - Special button for toggle states
 */
interface HapticToggleButtonProps extends Omit<HapticButtonProps, 'hapticPattern' | 'onToggle'> {
  pressed?: boolean;
  onToggle?: (pressed: boolean) => void;
}

export const HapticToggleButton = forwardRef<HTMLButtonElement, HapticToggleButtonProps>(
  ({ pressed = false, onToggle, onClick, className = '', ...props }, ref) => {
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const newPressed = !pressed;
      
      // Use different haptic patterns for on/off states
      if (newPressed) {
        haptic.medium();
      } else {
        haptic.light();
      }
      
      onToggle?.(newPressed);
      onClick?.(event);
    };

    const toggleClasses = pressed 
      ? 'bg-[var(--color-accent)] text-white' 
      : 'bg-gray-100 text-gray-700';

    return (
      <HapticButton
        ref={ref}
        onClick={handleClick}
        className={`${toggleClasses} ${className}`}
        aria-pressed={pressed}
        {...props}
      />
    );
  }
);

HapticToggleButton.displayName = 'HapticToggleButton';