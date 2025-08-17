/**
 * Income Clarity Design System - Badge Component
 * 
 * Unified badge component for status indicators, labels, and notifications.
 * Supports various styles, states, and semantic meanings.
 */

'use client'

import React, { forwardRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Badge variants
const badgeVariants = {
  // Default - Neutral styling
  default: [
    'bg-neutral-100 text-neutral-800 border border-neutral-200',
    'dark:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-600'
  ].join(' '),

  // Primary - Brand color
  primary: [
    'bg-brand-100 text-brand-800 border border-brand-200',
    'dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800'
  ].join(' '),

  // Secondary - Secondary brand color
  secondary: [
    'bg-secondary-100 text-secondary-800 border border-secondary-200',
    'dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-800'
  ].join(' '),

  // Success - Positive states
  success: [
    'bg-success-100 text-success-800 border border-success-200',
    'dark:bg-success-900/30 dark:text-success-300 dark:border-success-800'
  ].join(' '),

  // Warning - Caution states
  warning: [
    'bg-warning-100 text-warning-800 border border-warning-200',
    'dark:bg-warning-900/30 dark:text-warning-300 dark:border-warning-800'
  ].join(' '),

  // Error - Negative states
  error: [
    'bg-error-100 text-error-800 border border-error-200',
    'dark:bg-error-900/30 dark:text-error-300 dark:border-error-800'
  ].join(' '),

  // Info - Informational states
  info: [
    'bg-info-100 text-info-800 border border-info-200',
    'dark:bg-info-900/30 dark:text-info-300 dark:border-info-800'
  ].join(' '),

  // Solid variants
  solidDefault: [
    'bg-neutral-600 text-white border border-neutral-600',
    'dark:bg-neutral-300 dark:text-neutral-900 dark:border-neutral-300'
  ].join(' '),

  solidPrimary: [
    'bg-brand-600 text-white border border-brand-600'
  ].join(' '),

  solidSecondary: [
    'bg-secondary-600 text-white border border-secondary-600'
  ].join(' '),

  solidSuccess: [
    'bg-success-600 text-white border border-success-600'
  ].join(' '),

  solidWarning: [
    'bg-warning-600 text-white border border-warning-600'
  ].join(' '),

  solidError: [
    'bg-error-600 text-white border border-error-600'
  ].join(' '),

  solidInfo: [
    'bg-info-600 text-white border border-info-600'
  ].join(' '),

  // Outline variants
  outline: [
    'bg-transparent text-neutral-600 border-2 border-neutral-300',
    'dark:text-neutral-400 dark:border-neutral-600'
  ].join(' '),

  outlinePrimary: [
    'bg-transparent text-brand-600 border-2 border-brand-300',
    'dark:text-brand-400 dark:border-brand-600'
  ].join(' '),

  outlineSecondary: [
    'bg-transparent text-secondary-600 border-2 border-secondary-300',
    'dark:text-secondary-400 dark:border-secondary-600'
  ].join(' '),

  outlineSuccess: [
    'bg-transparent text-success-600 border-2 border-success-300',
    'dark:text-success-400 dark:border-success-600'
  ].join(' '),

  outlineWarning: [
    'bg-transparent text-warning-600 border-2 border-warning-300',
    'dark:text-warning-400 dark:border-warning-600'
  ].join(' '),

  outlineError: [
    'bg-transparent text-error-600 border-2 border-error-300',
    'dark:text-error-400 dark:border-error-600'
  ].join(' '),

  outlineInfo: [
    'bg-transparent text-info-600 border-2 border-info-300',
    'dark:text-info-400 dark:border-info-600'
  ].join(' '),

  // Special variants
  dot: [
    'bg-transparent text-neutral-700 border-0 relative',
    'dark:text-neutral-300'
  ].join(' '),

  gradient: [
    'bg-gradient-to-r from-brand-500 to-secondary-500 text-white border-0'
  ].join(' ')
}

// Badge sizes
const badgeSizes = {
  xs: 'px-1.5 py-0.5 text-xs min-h-[16px]',
  sm: 'px-2 py-1 text-xs min-h-[20px]',
  md: 'px-2.5 py-1 text-sm min-h-[24px]',
  lg: 'px-3 py-1.5 text-sm min-h-[28px]',
  xl: 'px-4 py-2 text-base min-h-[32px]'
}

// Dot colors for dot variant
const dotColors = {
  default: 'bg-neutral-400',
  primary: 'bg-brand-500',
  secondary: 'bg-secondary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500'
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants
  size?: keyof typeof badgeSizes
  removable?: boolean
  onRemove?: () => void
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  // Dot variant specific
  dotColor?: keyof typeof dotColors
  // Accessibility
  ariaLabel?: string
  // Special states
  pulse?: boolean
  rounded?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    removable = false,
    onRemove,
    leftIcon,
    rightIcon,
    dotColor = 'default',
    ariaLabel,
    pulse = false,
    rounded = false,
    children,
    ...props
  }, ref) => {
    // Base badge classes
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-200',
      'whitespace-nowrap',
      rounded ? 'rounded-full' : 'rounded-md'
    )

    // Size classes
    const sizeClasses = badgeSizes[size]

    // Animation classes
    const animationClasses = cn(
      pulse && 'animate-pulse'
    )

    // Handle icon sizes based on badge size
    const getIconSize = () => {
      switch (size) {
        case 'xs':
          return 'w-2.5 h-2.5'
        case 'sm':
          return 'w-3 h-3'
        case 'md':
          return 'w-3.5 h-3.5'
        case 'lg':
          return 'w-4 h-4'
        case 'xl':
          return 'w-4 h-4'
        default:
          return 'w-3.5 h-3.5'
      }
    }

    const iconSize = getIconSize()

    // Combine all classes
    const badgeClasses = cn(
      baseClasses,
      badgeVariants[variant],
      sizeClasses,
      animationClasses,
      className
    )

    return (
      <span
        ref={ref}
        className={badgeClasses}
        aria-label={ariaLabel}
        {...props}
      >
        {/* Dot for dot variant */}
        {variant === 'dot' && (
          <span
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full',
              dotColors[dotColor],
              pulse && 'animate-ping'
            )}
            aria-hidden="true"
          />
        )}

        {/* Left Icon */}
        {leftIcon && (
          <span className={cn('flex-shrink-0', children && 'mr-1')} aria-hidden="true">
            {React.cloneElement(leftIcon as React.ReactElement, {
              className: cn(iconSize, (leftIcon as React.ReactElement).props?.className)
            })}
          </span>
        )}

        {/* Content */}
        <span className={variant === 'dot' ? 'ml-3' : ''}>{children}</span>

        {/* Right Icon */}
        {rightIcon && !removable && (
          <span className={cn('flex-shrink-0', children && 'ml-1')} aria-hidden="true">
            {React.cloneElement(rightIcon as React.ReactElement, {
              className: cn(iconSize, (rightIcon as React.ReactElement).props?.className)
            })}
          </span>
        )}

        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className={cn(
              'flex-shrink-0 rounded-full p-0.5 transition-colors',
              'hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-current',
              children && 'ml-1'
            )}
            aria-label="Remove badge"
          >
            <X className={iconSize} aria-hidden="true" />
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// Notification Badge - Special component for notification counts
export const NotificationBadge = forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant' | 'size'> & {
  count?: number
  max?: number
  showZero?: boolean
}>(
  ({
    count = 0,
    max = 99,
    showZero = false,
    className,
    ...props
  }, ref) => {
    if (count === 0 && !showZero) return null

    const displayCount = count > max ? `${max}+` : count.toString()

    return (
      <Badge
        ref={ref}
        variant="solidError"
        size="xs"
        rounded
        className={cn('min-w-[18px] h-[18px] text-[10px] font-bold', className)}
        ariaLabel={`${count} notifications`}
        {...props}
      >
        {displayCount}
      </Badge>
    )
  }
)

NotificationBadge.displayName = 'NotificationBadge'

// Status Badge - For financial/status indicators
export const StatusBadge = forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant'> & {
  status: 'positive' | 'negative' | 'neutral' | 'pending'
  value?: string | number
  showIcon?: boolean
}>(
  ({
    status,
    value,
    showIcon = true,
    children,
    ...props
  }, ref) => {
    const getVariant = () => {
      switch (status) {
        case 'positive':
          return 'success'
        case 'negative':
          return 'error'
        case 'pending':
          return 'warning'
        default:
          return 'default'
      }
    }

    const getIcon = () => {
      if (!showIcon) return null
      
      switch (status) {
        case 'positive':
          return <span className="text-success-600">↗</span>
        case 'negative':
          return <span className="text-error-600">↘</span>
        case 'pending':
          return <span className="text-warning-600">⏳</span>
        default:
          return <span className="text-neutral-600">—</span>
      }
    }

    return (
      <Badge
        ref={ref}
        variant={getVariant() as keyof typeof badgeVariants}
        leftIcon={getIcon()}
        {...props}
      >
        {children || value}
      </Badge>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

// Export utility functions
export const getBadgeVariant = (variant: keyof typeof badgeVariants) => {
  return badgeVariants[variant]
}

export const getBadgeSize = (size: keyof typeof badgeSizes) => {
  return badgeSizes[size]
}