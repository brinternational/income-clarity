'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { haptic, HapticPattern } from '@/utils/hapticFeedback';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  hapticPattern?: HapticPattern;
  disableHaptic?: boolean;
  // Navigation props
  href?: string;
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  srOnlyText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    hapticPattern,
    disableHaptic = false,
    href,
    ariaLabel,
    ariaDescribedBy,
    ariaPressed,
    ariaExpanded,
    srOnlyText,
    onClick,
    children,
    disabled,
    ...props
  }, ref) => {
    // Determine haptic pattern based on variant if not explicitly provided
    const getHapticPattern = (): HapticPattern => {
      if (hapticPattern) return hapticPattern;
      
      switch (variant) {
        case 'danger':
          return HapticPattern.Heavy;
        case 'success':
          return HapticPattern.Success;
        case 'primary':
          return HapticPattern.Medium;
        case 'ghost':
        case 'outline':
          return HapticPattern.Light;
        default:
          return HapticPattern.Medium;
      }
    };
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      // Trigger haptic feedback unless disabled
      if (!disableHaptic) {
        const pattern = getHapticPattern();
        haptic[pattern]();
      }
      
      // Call original onClick handler
      onClick?.(event);
    };

    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-lg
      transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed touch-target
      active:scale-95
    `;
    
    const variantClasses = {
      primary: `
        bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 active:from-emerald-700 active:to-blue-700
        focus:ring-emerald-500/50 shadow-sm hover:shadow-md transform hover:scale-105
      `,
      secondary: `
        bg-white/10 backdrop-blur text-white hover:bg-white/20 active:bg-white/30
        focus:ring-white/30 border border-white/20
      `,
      outline: `
        border border-white/20 bg-white/10 backdrop-blur text-white hover:bg-white/20 active:bg-white/30
        focus:ring-emerald-500/50 hover:border-white/30
      `,
      ghost: `
        text-white hover:bg-white/10 active:bg-white/20
        focus:ring-white/30
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800
        focus:ring-red-500/50 shadow-sm hover:shadow-md transform hover:scale-105
      `,
      success: `
        bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 active:from-green-700 active:to-emerald-700
        focus:ring-green-500/50 shadow-sm hover:shadow-md transform hover:scale-105
      `
    };
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm gap-2',
      md: 'px-4 py-3 text-sm gap-2',
      lg: 'px-6 py-4 text-base gap-3'
    };
    
    const widthClasses = fullWidth ? 'w-full' : '';
    
    const isDisabled = disabled || loading;
    
    const buttonContent = (
      <>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading</span>
          </>
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}
        
        {children}
        
        {srOnlyText && (
          <span className="sr-only">{srOnlyText}</span>
        )}
        
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>
        )}
      </>
    );

    const sharedClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${widthClasses}
      ${className}
    `;

    // Render as Link if href is provided
    if (href && !isDisabled) {
      return (
        <Link
          href={href}
          className={sharedClasses}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          onClick={(e) => {
            // Trigger haptic feedback for link navigation
            if (!disableHaptic) {
              const pattern = getHapticPattern();
              haptic[pattern]();
            }
            // Call original onClick handler if provided
            onClick?.(e as any);
          }}
        >
          {buttonContent}
        </Link>
      );
    }
    
    // Render as button for all other cases
    return (
      <button
        ref={ref}
        className={sharedClasses}
        disabled={isDisabled}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        aria-busy={loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';
