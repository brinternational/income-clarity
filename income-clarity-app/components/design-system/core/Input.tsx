/**
 * Income Clarity Design System - Input Component
 * 
 * Unified input component with consistent styling across all form fields.
 * Supports various input types, states, and accessibility features.
 */

'use client'

import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Input variants
const inputVariants = {
  default: [
    'border-neutral-300 bg-white',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'hover:border-neutral-400',
    'dark:border-neutral-600 dark:bg-neutral-800',
    'dark:focus:border-brand-400 dark:focus:ring-brand-400/20',
    'dark:hover:border-neutral-500'
  ].join(' '),

  filled: [
    'border-transparent bg-neutral-100',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'focus:bg-white',
    'hover:bg-neutral-50',
    'dark:bg-neutral-700 dark:hover:bg-neutral-600',
    'dark:focus:bg-neutral-800 dark:focus:border-brand-400'
  ].join(' '),

  flushed: [
    'border-0 border-b-2 border-neutral-300 bg-transparent rounded-none',
    'focus:border-brand-500 focus:ring-0',
    'hover:border-neutral-400',
    'dark:border-neutral-600 dark:hover:border-neutral-500',
    'dark:focus:border-brand-400'
  ].join(' '),

  unstyled: [
    'border-0 bg-transparent p-0 focus:ring-0'
  ].join(' ')
}

// Input sizes
const inputSizes = {
  xs: 'px-2 py-1 text-xs min-h-[24px]',
  sm: 'px-3 py-2 text-sm min-h-[32px]',
  md: 'px-4 py-3 text-sm min-h-[40px]',
  lg: 'px-4 py-4 text-base min-h-[48px]',
  xl: 'px-6 py-5 text-lg min-h-[56px]',
}

// Input states
const inputStates = {
  default: '',
  error: [
    'border-error-500 bg-error-50',
    'focus:border-error-500 focus:ring-error-500/20',
    'dark:bg-error-900/20 dark:border-error-600'
  ].join(' '),
  success: [
    'border-success-500 bg-success-50',
    'focus:border-success-500 focus:ring-success-500/20',
    'dark:bg-success-900/20 dark:border-success-600'
  ].join(' '),
  warning: [
    'border-warning-500 bg-warning-50',
    'focus:border-warning-500 focus:ring-warning-500/20',
    'dark:bg-warning-900/20 dark:border-warning-600'
  ].join(' ')
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: keyof typeof inputVariants
  size?: keyof typeof inputSizes
  state?: keyof typeof inputStates
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
  showPasswordToggle?: boolean
  // Form integration
  label?: string
  helperText?: string
  errorMessage?: string
  successMessage?: string
  required?: boolean
  optional?: boolean
  // Enhanced accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
  // Special input types
  currency?: boolean
  percentage?: boolean
  numeric?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    state = 'default',
    leftElement,
    rightElement,
    showPasswordToggle = false,
    label,
    helperText,
    errorMessage,
    successMessage,
    required = false,
    optional = false,
    ariaLabel,
    ariaDescribedBy,
    currency = false,
    percentage = false,
    numeric = false,
    type = 'text',
    id,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    // Auto-generate ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    // Generate helper IDs
    const helperTextId = helperText ? `${inputId}-helper` : undefined
    const errorId = errorMessage ? `${inputId}-error` : undefined
    const successId = successMessage ? `${inputId}-success` : undefined

    // Determine actual input type
    const inputType = showPasswordToggle 
      ? (showPassword ? 'text' : 'password')
      : type

    // Determine current state based on props
    const currentState = errorMessage ? 'error' 
      : successMessage ? 'success' 
      : state

    // Handle special input types
    const handleSpecialTypes = () => {
      const specialProps: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}
      
      if (currency) {
        specialProps.inputMode = 'decimal'
        specialProps.pattern = '[0-9]*'
      } else if (percentage) {
        specialProps.inputMode = 'decimal'
        specialProps.pattern = '[0-9]*'
        specialProps.min = '0'
        specialProps.max = '100'
      } else if (numeric) {
        specialProps.inputMode = 'numeric'
        specialProps.pattern = '[0-9]*'
      }
      
      return specialProps
    }

    // Calculate padding based on elements
    const getPaddingClasses = () => {
      const basePadding = inputSizes[size]
      const hasLeft = leftElement || currency
      const hasRight = rightElement || showPasswordToggle || percentage
      
      if (hasLeft && hasRight) {
        return 'pl-10 pr-10'
      } else if (hasLeft) {
        return 'pl-10 pr-4'
      } else if (hasRight) {
        return 'pl-4 pr-10'
      }
      
      return basePadding.split(' ').filter(cls => cls.startsWith('px-')).join(' ')
    }

    // Base input classes
    const baseClasses = cn(
      'w-full border rounded-lg transition-all duration-200',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'disabled:bg-neutral-50 dark:disabled:bg-neutral-800',
      'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
      'text-neutral-900 dark:text-neutral-100'
    )

    // Size classes (height and text size)
    const sizeClasses = inputSizes[size].split(' ').filter(cls => 
      cls.startsWith('py-') || cls.startsWith('text-') || cls.startsWith('min-h-')
    ).join(' ')

    // Padding classes
    const paddingClasses = getPaddingClasses()

    // Combine all classes
    const inputClasses = cn(
      baseClasses,
      inputVariants[variant],
      inputStates[currentState],
      sizeClasses,
      paddingClasses,
      currency || numeric ? 'font-mono tabular-nums' : '',
      numeric && !currency ? 'text-right' : '',
      className
    )

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-2',
              currentState === 'error' ? 'text-error-600 dark:text-error-400' : 
              currentState === 'success' ? 'text-success-600 dark:text-success-400' :
              'text-neutral-700 dark:text-neutral-300'
            )}
          >
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">*</span>
            )}
            {optional && (
              <span className="text-neutral-400 ml-1 font-normal">(optional)</span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Element */}
          {(leftElement || currency) && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
              {currency ? (
                <span className="text-sm font-medium">$</span>
              ) : (
                leftElement
              )}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={[helperTextId, errorId, successId, ariaDescribedBy]
              .filter(Boolean)
              .join(' ') || undefined}
            aria-invalid={currentState === 'error'}
            aria-required={required}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...handleSpecialTypes()}
            {...props}
          />

          {/* Right Element */}
          {(rightElement || showPasswordToggle || percentage) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              ) : percentage ? (
                <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium">%</span>
              ) : (
                rightElement
              )}
            </div>
          )}

          {/* State Icon */}
          {(currentState === 'error' || currentState === 'success') && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {currentState === 'error' ? (
                <AlertCircle className="w-4 h-4 text-error-500" aria-hidden="true" />
              ) : (
                <CheckCircle className="w-4 h-4 text-success-500" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        {/* Helper Text, Error Message, or Success Message */}
        {helperText && !errorMessage && !successMessage && (
          <p 
            id={helperTextId}
            className="mt-1 text-xs text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}

        {errorMessage && (
          <p 
            id={errorId}
            className="mt-1 text-xs text-error-600 dark:text-error-400 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p 
            id={successId}
            className="mt-1 text-xs text-success-600 dark:text-success-400 flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            {successMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Export utility functions
export const getInputVariant = (variant: keyof typeof inputVariants) => {
  return inputVariants[variant]
}

export const getInputSize = (size: keyof typeof inputSizes) => {
  return inputSizes[size]
}

export const getInputState = (state: keyof typeof inputStates) => {
  return inputStates[state]
}