/**
 * Income Clarity Design System - Spinner Component
 * 
 * Loading spinner with consistent styling and animations.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Spinner variants
const spinnerVariants = {
  default: 'border-neutral-200 border-t-brand-600 dark:border-neutral-700 dark:border-t-brand-400',
  primary: 'border-brand-200 border-t-brand-600 dark:border-brand-800 dark:border-t-brand-400',
  secondary: 'border-secondary-200 border-t-secondary-600 dark:border-secondary-800 dark:border-t-secondary-400',
  success: 'border-success-200 border-t-success-600 dark:border-success-800 dark:border-t-success-400',
  warning: 'border-warning-200 border-t-warning-600 dark:border-warning-800 dark:border-t-warning-400',
  error: 'border-error-200 border-t-error-600 dark:border-error-800 dark:border-t-error-400',
  white: 'border-white/20 border-t-white'
}

// Spinner sizes
const spinnerSizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-4'
}

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: keyof typeof spinnerVariants
  size?: keyof typeof spinnerSizes
  // Content
  label?: string
  // Animation speed
  speed?: 'slow' | 'normal' | 'fast'
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    label,
    speed = 'normal',
    ...props
  }, ref) => {
    // Animation speed classes
    const speedClasses = {
      slow: 'animate-spin duration-[2s]',
      normal: 'animate-spin',
      fast: 'animate-spin duration-500'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full',
          spinnerSizes[size],
          spinnerVariants[variant],
          speedClasses[speed],
          className
        )}
        role="status"
        aria-label={label || 'Loading'}
        {...props}
      >
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

// Loading overlay component
export interface LoadingOverlayProps {
  visible: boolean
  children?: React.ReactNode
  spinner?: React.ReactNode
  label?: string
  className?: string
  backdropClassName?: string
}

export const LoadingOverlay = ({
  visible,
  children,
  spinner,
  label = 'Loading...',
  className,
  backdropClassName
}: LoadingOverlayProps) => {
  if (!visible) return <>{children}</>

  return (
    <div className={cn('relative', className)}>
      {children}
      <div
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center',
          'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm',
          backdropClassName
        )}
      >
        <div className="flex flex-col items-center gap-3">
          {spinner || <Spinner size="lg" />}
          {label && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {label}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Dots spinner variant
export interface DotsSpinnerProps extends Omit<SpinnerProps, 'variant'> {
  dotColor?: string
}

export const DotsSpinner = forwardRef<HTMLDivElement, DotsSpinnerProps>(
  ({
    className,
    size = 'md',
    speed = 'normal',
    label,
    dotColor,
    ...props
  }, ref) => {
    // Dot sizes based on spinner size
    const dotSizes = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4'
    }

    const animationDelays = ['delay-0', 'delay-75', 'delay-150']

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1', className)}
        role="status"
        aria-label={label || 'Loading'}
        {...props}
      >
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'rounded-full animate-pulse',
              dotSizes[size],
              animationDelays[index],
              dotColor || 'bg-brand-600 dark:bg-brand-400'
            )}
            style={{
              animationDuration: speed === 'slow' ? '2s' : speed === 'fast' ? '0.5s' : '1s'
            }}
          />
        ))}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    )
  }
)

DotsSpinner.displayName = 'DotsSpinner'

// Pulse spinner variant
export const PulseSpinner = forwardRef<HTMLDivElement, Omit<SpinnerProps, 'variant'>>(
  ({
    className,
    size = 'md',
    speed = 'normal',
    label,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full bg-brand-600 dark:bg-brand-400 animate-ping',
          spinnerSizes[size].split(' ').slice(0, 2), // Just width and height
          className
        )}
        style={{
          animationDuration: speed === 'slow' ? '2s' : speed === 'fast' ? '0.5s' : '1s'
        }}
        role="status"
        aria-label={label || 'Loading'}
        {...props}
      >
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    )
  }
)

PulseSpinner.displayName = 'PulseSpinner'

// Export utility functions
export const getSpinnerVariant = (variant: keyof typeof spinnerVariants) => {
  return spinnerVariants[variant]
}

export const getSpinnerSize = (size: keyof typeof spinnerSizes) => {
  return spinnerSizes[size]
}