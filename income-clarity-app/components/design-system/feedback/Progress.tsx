/**
 * Income Clarity Design System - Progress Component
 * 
 * Progress indicators for showing completion status
 * with animated transitions and accessibility support.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Progress variants
const progressVariants = {
  default: {
    track: 'bg-neutral-200 dark:bg-neutral-700',
    fill: 'bg-brand-600 dark:bg-brand-500'
  },
  primary: {
    track: 'bg-brand-100 dark:bg-brand-900',
    fill: 'bg-brand-600 dark:bg-brand-500'
  },
  secondary: {
    track: 'bg-secondary-100 dark:bg-secondary-900',
    fill: 'bg-secondary-600 dark:bg-secondary-500'
  },
  success: {
    track: 'bg-success-100 dark:bg-success-900',
    fill: 'bg-success-600 dark:bg-success-500'
  },
  warning: {
    track: 'bg-warning-100 dark:bg-warning-900',
    fill: 'bg-warning-600 dark:bg-warning-500'
  },
  error: {
    track: 'bg-error-100 dark:bg-error-900',
    fill: 'bg-error-600 dark:bg-error-500'
  }
}

// Progress sizes
const progressSizes = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
  xl: 'h-6'
}

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: keyof typeof progressVariants
  size?: keyof typeof progressSizes
  // Progress value
  value: number
  max?: number
  // Labels
  label?: string
  showValue?: boolean
  formatValue?: (value: number, max: number) => string
  // Styling
  striped?: boolean
  animated?: boolean
  // States
  indeterminate?: boolean
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    value,
    max = 100,
    label,
    showValue = false,
    formatValue,
    striped = false,
    animated = true,
    indeterminate = false,
    ...props
  }, ref) => {
    // Calculate percentage
    const percentage = indeterminate ? 0 : Math.min(Math.max((value / max) * 100, 0), 100)

    // Format display value
    const displayValue = formatValue 
      ? formatValue(value, max) 
      : `${Math.round(percentage)}%`

    // Generate unique ID for accessibility
    const progressId = `progress-${Math.random().toString(36).substr(2, 9)}`
    const labelId = label ? `${progressId}-label` : undefined

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <span
                id={labelId}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {displayValue}
              </span>
            )}
          </div>
        )}

        {/* Progress Track */}
        <div
          ref={ref}
          className={cn(
            'w-full rounded-full overflow-hidden',
            progressSizes[size],
            progressVariants[variant].track
          )}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-labelledby={labelId}
          aria-label={!labelId ? (label || 'Progress') : undefined}
          {...props}
        >
          {/* Progress Fill */}
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              progressVariants[variant].fill,
              // Indeterminate animation
              indeterminate && [
                'w-1/3 animate-pulse',
                animated && 'animate-bounce'
              ],
              // Striped pattern
              striped && [
                'bg-gradient-to-r from-transparent via-white/20 to-transparent',
                'bg-[length:1rem_1rem]',
                animated && 'animate-pulse'
              ]
            )}
            style={{
              width: indeterminate ? '33%' : `${percentage}%`,
              ...(striped && animated && {
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)',
                animation: 'progress-stripe 1s linear infinite'
              })
            }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

// Circular Progress Component
export interface CircularProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: keyof typeof progressVariants
  size?: number
  // Progress value
  value: number
  max?: number
  // Styling
  strokeWidth?: number
  // Labels
  showValue?: boolean
  formatValue?: (value: number, max: number) => string
  // Content
  children?: React.ReactNode
  // States
  indeterminate?: boolean
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  ({
    className,
    variant = 'default',
    size = 120,
    value,
    max = 100,
    strokeWidth = 8,
    showValue = false,
    formatValue,
    children,
    indeterminate = false,
    ...props
  }, ref) => {
    // Calculate percentage and circumference
    const percentage = indeterminate ? 25 : Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    // Format display value
    const displayValue = formatValue 
      ? formatValue(value, max) 
      : `${Math.round(percentage)}%`

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className={progressVariants[variant].track}
          />
          
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-300 ease-out',
              progressVariants[variant].fill,
              indeterminate && 'animate-spin'
            )}
            style={{
              ...(indeterminate && {
                animationDuration: '2s'
              })
            }}
          />
        </svg>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (showValue && (
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {displayValue}
            </span>
          ))}
        </div>
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'

// Step Progress Component
export interface StepProgressProps {
  steps: Array<{
    label: string
    description?: string
    completed?: boolean
    error?: boolean
  }>
  currentStep: number
  variant?: keyof typeof progressVariants
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export const StepProgress = ({
  steps,
  currentStep,
  variant = 'default',
  orientation = 'horizontal',
  className
}: StepProgressProps) => {
  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = step.completed || index < currentStep
        const isCurrent = index === currentStep
        const hasError = step.error
        const isLast = index === steps.length - 1

        return (
          <div
            key={index}
            className={cn(
              'flex items-center',
              orientation === 'horizontal' ? 'flex-row' : 'flex-col text-center',
              !isLast && orientation === 'horizontal' && 'flex-1'
            )}
          >
            {/* Step Circle */}
            <div className="relative">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium',
                  'transition-colors duration-200',
                  hasError ? [
                    'border-error-500 bg-error-500 text-white'
                  ] : isCompleted ? [
                    'border-brand-500 bg-brand-500 text-white'
                  ] : isCurrent ? [
                    'border-brand-500 bg-white text-brand-500',
                    'dark:bg-neutral-800 dark:text-brand-400'
                  ] : [
                    'border-neutral-300 bg-white text-neutral-400',
                    'dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-500'
                  ]
                )}
              >
                {hasError ? '!' : isCompleted ? '✓' : index + 1}
              </div>

              {/* Step Content */}
              <div
                className={cn(
                  orientation === 'horizontal' ? 'absolute top-full mt-2 left-1/2 transform -translate-x-1/2' : 'mt-2',
                  'text-center'
                )}
              >
                <div
                  className={cn(
                    'text-sm font-medium whitespace-nowrap',
                    isCurrent ? 'text-brand-600 dark:text-brand-400' :
                    isCompleted ? 'text-neutral-900 dark:text-neutral-100' :
                    'text-neutral-500 dark:text-neutral-400'
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  orientation === 'horizontal' ? 'flex-1 h-0.5 mx-4' : 'w-0.5 h-8 mx-auto',
                  isCompleted ? progressVariants[variant].fill : progressVariants[variant].track
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Export utility functions
export const getProgressVariant = (variant: keyof typeof progressVariants) => {
  return progressVariants[variant]
}

export const getProgressSize = (size: keyof typeof progressSizes) => {
  return progressSizes[size]
}