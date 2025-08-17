/**
 * Income Clarity Design System - Button Component
 * 
 * Unified button component that replaces all existing button implementations.
 * Supports all variants, sizes, states, and accessibility requirements.
 */

'use client'

import React, { forwardRef } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'
import { haptic, HapticPattern } from '@/utils/hapticFeedback'

// Button variants based on design system
const buttonVariants = {
  // Primary - Main brand actions
  primary: [
    'bg-gradient-to-r from-brand-500 to-secondary-500',
    'text-white',
    'hover:from-brand-600 hover:to-secondary-600',
    'active:from-brand-700 active:to-secondary-700',
    'focus:ring-2 focus:ring-brand-500/50',
    'shadow-sm hover:shadow-md',
    'transform hover:scale-105 active:scale-95',
    'disabled:from-neutral-300 disabled:to-neutral-400',
    'disabled:hover:scale-100 disabled:cursor-not-allowed'
  ].join(' '),

  // Secondary - Supporting actions
  secondary: [
    'bg-white/10 backdrop-blur-sm',
    'text-white border border-white/20',
    'hover:bg-white/20 hover:border-white/30',
    'active:bg-white/30',
    'focus:ring-2 focus:ring-white/30',
    'disabled:bg-neutral-100 disabled:text-neutral-400',
    'disabled:border-neutral-200 disabled:cursor-not-allowed'
  ].join(' '),

  // Outline - Subtle actions
  outline: [
    'border border-neutral-300 bg-white',
    'text-neutral-700 hover:bg-neutral-50',
    'active:bg-neutral-100',
    'focus:ring-2 focus:ring-brand-500/50',
    'disabled:bg-neutral-50 disabled:text-neutral-400',
    'disabled:border-neutral-200 disabled:cursor-not-allowed',
    'dark:border-neutral-600 dark:bg-neutral-800',
    'dark:text-neutral-300 dark:hover:bg-neutral-700',
    'dark:active:bg-neutral-600'
  ].join(' '),

  // Ghost - Minimal visual weight
  ghost: [
    'text-neutral-700 hover:bg-neutral-100',
    'active:bg-neutral-200',
    'focus:ring-2 focus:ring-brand-500/50',
    'disabled:text-neutral-400 disabled:cursor-not-allowed',
    'dark:text-neutral-300 dark:hover:bg-neutral-700',
    'dark:active:bg-neutral-600'
  ].join(' '),

  // Danger - Destructive actions
  danger: [
    'bg-gradient-to-r from-error-500 to-error-600',
    'text-white',
    'hover:from-error-600 hover:to-error-700',
    'active:from-error-700 active:to-error-800',
    'focus:ring-2 focus:ring-error-500/50',
    'shadow-sm hover:shadow-md',
    'transform hover:scale-105 active:scale-95',
    'disabled:from-neutral-300 disabled:to-neutral-400',
    'disabled:hover:scale-100 disabled:cursor-not-allowed'
  ].join(' '),

  // Success - Positive actions
  success: [
    'bg-gradient-to-r from-success-500 to-secondary-500',
    'text-white',
    'hover:from-success-600 hover:to-secondary-600',
    'active:from-success-700 active:to-secondary-700',
    'focus:ring-2 focus:ring-success-500/50',
    'shadow-sm hover:shadow-md',
    'transform hover:scale-105 active:scale-95',
    'disabled:from-neutral-300 disabled:to-neutral-400',
    'disabled:hover:scale-100 disabled:cursor-not-allowed'
  ].join(' '),

  // Link - Text-like appearance
  link: [
    'text-brand-600 underline-offset-4',
    'hover:underline hover:text-brand-700',
    'active:text-brand-800',
    'focus:ring-2 focus:ring-brand-500/50',
    'disabled:text-neutral-400 disabled:cursor-not-allowed',
    'dark:text-brand-400 dark:hover:text-brand-300'
  ].join(' ')
}

// Button sizes
const buttonSizes = {
  xs: 'px-2 py-1 text-xs gap-1 min-h-[24px]',
  sm: 'px-3 py-2 text-sm gap-2 min-h-[32px]',
  md: 'px-4 py-3 text-sm gap-2 min-h-[40px]',
  lg: 'px-6 py-4 text-base gap-3 min-h-[48px]',
  xl: 'px-8 py-5 text-lg gap-3 min-h-[56px]',
}

// Icon-only button sizes
const iconSizes = {
  xs: 'p-1 min-h-[24px] min-w-[24px]',
  sm: 'p-2 min-h-[32px] min-w-[32px]',
  md: 'p-3 min-h-[40px] min-w-[40px]',
  lg: 'p-4 min-h-[48px] min-w-[48px]',
  xl: 'p-5 min-h-[56px] min-w-[56px]',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconOnly?: boolean
  fullWidth?: boolean
  hapticPattern?: HapticPattern
  disableHaptic?: boolean
  asChild?: boolean
  href?: string
  // Accessibility props
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaPressed?: boolean
  ariaExpanded?: boolean
  srOnlyText?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    iconOnly = false,
    fullWidth = false,
    hapticPattern,
    disableHaptic = false,
    asChild = false,
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
    // Determine haptic pattern based on variant
    const getHapticPattern = (): HapticPattern => {
      if (hapticPattern) return hapticPattern
      
      switch (variant) {
        case 'danger':
          return HapticPattern.Heavy
        case 'success':
          return HapticPattern.Success
        case 'primary':
          return HapticPattern.Medium
        case 'ghost':
        case 'outline':
        case 'link':
          return HapticPattern.Light
        default:
          return HapticPattern.Medium
      }
    }
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return
      
      // Trigger haptic feedback unless disabled
      if (!disableHaptic) {
        const pattern = getHapticPattern()
        haptic[pattern]()
      }
      
      // Call original onClick handler
      onClick?.(event)
    }

    // Base button styles
    const baseClasses = cn(
      // Layout and typography
      'inline-flex items-center justify-center font-medium rounded-lg',
      // Transitions and interactions
      'transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-offset-2',
      // Touch targets (minimum 44px for accessibility)
      'touch-target',
      // States
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )

    // Size classes
    const sizeClasses = iconOnly ? iconSizes[size] : buttonSizes[size]
    
    // Full width
    const widthClasses = fullWidth ? 'w-full' : ''
    
    // Combine all classes
    const buttonClasses = cn(
      baseClasses,
      buttonVariants[variant],
      sizeClasses,
      widthClasses,
      className
    )
    
    const isDisabled = disabled || loading

    // Button content with loading state
    const buttonContent = (
      <>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            {!iconOnly && <span className="sr-only">Loading</span>}
          </>
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        
        {!iconOnly && children}
        
        {srOnlyText && (
          <span className="sr-only">{srOnlyText}</span>
        )}
        
        {!loading && rightIcon && !iconOnly && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </>
    )

    // Render as Link if href is provided
    if (href && !isDisabled) {
      return (
        <Link
          href={href}
          className={buttonClasses}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          onClick={(e) => {
            // Trigger haptic feedback for link navigation
            if (!disableHaptic) {
              const pattern = getHapticPattern()
              haptic[pattern]()
            }
            // Call original onClick handler if provided
            onClick?.(e as any)
          }}
        >
          {buttonContent}
        </Link>
      )
    }
    
    // Render as button
    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        onClick={handleClick}
        aria-label={ariaLabel || (iconOnly ? 'Button' : undefined)}
        aria-describedby={ariaDescribedBy}
        aria-pressed={ariaPressed}
        aria-expanded={ariaExpanded}
        aria-busy={loading}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Export utility function for external styling
export const getButtonVariant = (variant: keyof typeof buttonVariants) => {
  return buttonVariants[variant]
}

export const getButtonSize = (size: keyof typeof buttonSizes, iconOnly: boolean = false) => {
  return iconOnly ? iconSizes[size] : buttonSizes[size]
}