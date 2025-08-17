/**
 * Income Clarity Design System - Card Component
 * 
 * Unified card component for consistent content containers.
 * Supports various styles, states, and interactive behaviors.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Card variants
const cardVariants = {
  // Default - Clean white background with subtle shadow
  default: [
    'bg-white border border-neutral-200',
    'shadow-sm hover:shadow-md',
    'dark:bg-neutral-800 dark:border-neutral-700'
  ].join(' '),

  // Elevated - More prominent shadow for hierarchy
  elevated: [
    'bg-white border border-neutral-200',
    'shadow-md hover:shadow-lg',
    'dark:bg-neutral-800 dark:border-neutral-700'
  ].join(' '),

  // Outlined - Emphasis on border, minimal shadow
  outlined: [
    'bg-white border-2 border-neutral-300',
    'hover:border-neutral-400',
    'dark:bg-neutral-800 dark:border-neutral-600',
    'dark:hover:border-neutral-500'
  ].join(' '),

  // Filled - Subtle background fill
  filled: [
    'bg-neutral-50 border border-neutral-200',
    'hover:bg-neutral-100',
    'dark:bg-neutral-700 dark:border-neutral-600',
    'dark:hover:bg-neutral-600'
  ].join(' '),

  // Glass - Glassmorphism effect
  glass: [
    'bg-white/10 backdrop-blur-md border border-white/20',
    'hover:bg-white/20 hover:border-white/30',
    'shadow-lg'
  ].join(' '),

  // Gradient - Subtle gradient background
  gradient: [
    'bg-gradient-to-br from-white to-neutral-50',
    'border border-neutral-200 shadow-sm',
    'hover:from-neutral-50 hover:to-neutral-100',
    'dark:from-neutral-800 dark:to-neutral-900',
    'dark:border-neutral-700'
  ].join(' '),

  // Interactive - For clickable cards
  interactive: [
    'bg-white border border-neutral-200',
    'shadow-sm hover:shadow-md',
    'cursor-pointer transition-all duration-200',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus:outline-none focus:ring-2 focus:ring-brand-500/50',
    'dark:bg-neutral-800 dark:border-neutral-700'
  ].join(' '),

  // Success state
  success: [
    'bg-success-50 border border-success-200',
    'dark:bg-success-900/20 dark:border-success-800'
  ].join(' '),

  // Warning state
  warning: [
    'bg-warning-50 border border-warning-200',
    'dark:bg-warning-900/20 dark:border-warning-800'
  ].join(' '),

  // Error state
  error: [
    'bg-error-50 border border-error-200',
    'dark:bg-error-900/20 dark:border-error-800'
  ].join(' '),

  // Info state
  info: [
    'bg-info-50 border border-info-200',
    'dark:bg-info-900/20 dark:border-info-800'
  ].join(' ')
}

// Card sizes (affects padding and spacing)
const cardSizes = {
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
}

// Border radius options
const cardRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-3xl'
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants
  size?: keyof typeof cardSizes
  radius?: keyof typeof cardRadius
  hover?: boolean
  clickable?: boolean
  loading?: boolean
  disabled?: boolean
  // Semantic props
  role?: string
  tabIndex?: number
  // Enhanced accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    radius = 'md',
    hover = false,
    clickable = false,
    loading = false,
    disabled = false,
    role,
    tabIndex,
    ariaLabel,
    ariaDescribedBy,
    children,
    onClick,
    ...props
  }, ref) => {
    // Base card classes
    const baseClasses = cn(
      'relative overflow-hidden transition-all duration-200',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    )

    // Interactive behavior
    const interactiveClasses = cn(
      (clickable || onClick) && !disabled && [
        'cursor-pointer',
        'hover:scale-[1.01] active:scale-[0.99]',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/50'
      ],
      hover && !disabled && 'hover:shadow-lg'
    )

    // Loading state
    const loadingClasses = loading && 'animate-pulse'

    // Combine all classes
    const cardClasses = cn(
      baseClasses,
      cardVariants[variant],
      cardSizes[size],
      cardRadius[radius],
      interactiveClasses,
      loadingClasses,
      className
    )

    // Handle click events
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || loading) return
      onClick?.(event)
    }

    // Handle keyboard events for accessibility
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || loading) return
      if ((clickable || onClick) && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        onClick?.(event as any)
      }
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        role={role || (clickable || onClick ? 'button' : undefined)}
        tabIndex={tabIndex || (clickable || onClick ? 0 : undefined)}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-neutral-900/50 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Sub-components for better composition
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        'text-neutral-900 dark:text-neutral-100',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-neutral-500 dark:text-neutral-400',
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
)

CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
)

CardFooter.displayName = 'CardFooter'

// Export utility functions
export const getCardVariant = (variant: keyof typeof cardVariants) => {
  return cardVariants[variant]
}

export const getCardSize = (size: keyof typeof cardSizes) => {
  return cardSizes[size]
}

export const getCardRadius = (radius: keyof typeof cardRadius) => {
  return cardRadius[radius]
}