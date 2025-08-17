/**
 * Income Clarity Design System - Checkbox Component
 * 
 * Accessible checkbox component with consistent styling,
 * support for indeterminate state, and validation.
 */

'use client'

import React, { forwardRef } from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Checkbox variants
const checkboxVariants = {
  default: [
    'border-neutral-300 bg-white',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'hover:border-neutral-400',
    'checked:bg-brand-500 checked:border-brand-500',
    'dark:border-neutral-600 dark:bg-neutral-800',
    'dark:focus:border-brand-400 dark:focus:ring-brand-400/20',
    'dark:hover:border-neutral-500',
    'dark:checked:bg-brand-500 dark:checked:border-brand-500'
  ].join(' '),

  filled: [
    'border-transparent bg-neutral-100',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'focus:bg-white',
    'hover:bg-neutral-50',
    'checked:bg-brand-500 checked:border-brand-500',
    'dark:bg-neutral-700 dark:hover:bg-neutral-600',
    'dark:focus:bg-neutral-800 dark:focus:border-brand-400',
    'dark:checked:bg-brand-500 dark:checked:border-brand-500'
  ].join(' '),

  outline: [
    'border-2 border-brand-500 bg-transparent',
    'focus:ring-2 focus:ring-brand-500/20',
    'hover:bg-brand-50',
    'checked:bg-brand-500 checked:border-brand-500',
    'dark:border-brand-400 dark:hover:bg-brand-900/20',
    'dark:focus:ring-brand-400/20',
    'dark:checked:bg-brand-500 dark:checked:border-brand-500'
  ].join(' ')
}

// Checkbox sizes
const checkboxSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7'
}

// Icon sizes for checkboxes
const iconSizes = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4'
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: keyof typeof checkboxVariants
  size?: keyof typeof checkboxSizes
  // Enhanced features
  indeterminate?: boolean
  // Form integration
  label?: string
  description?: string
  helperText?: string
  errorMessage?: string
  successMessage?: string
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
  // Layout
  orientation?: 'horizontal' | 'vertical'
  alignment?: 'start' | 'center' | 'end'
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    indeterminate = false,
    label,
    description,
    helperText,
    errorMessage,
    successMessage,
    required = false,
    disabled = false,
    ariaLabel,
    ariaDescribedBy,
    orientation = 'horizontal',
    alignment = 'start',
    id,
    checked,
    onChange,
    ...props
  }, ref) => {
    // Auto-generate ID if not provided
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    
    // Generate helper IDs
    const helperTextId = helperText ? `${checkboxId}-helper` : undefined
    const errorId = errorMessage ? `${checkboxId}-error` : undefined
    const successId = successMessage ? `${checkboxId}-success` : undefined
    const descriptionId = description ? `${checkboxId}-description` : undefined

    // Determine current state
    const currentState = errorMessage ? 'error' 
      : successMessage ? 'success' 
      : 'default'

    // Handle indeterminate state
    React.useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.indeterminate = indeterminate
      }
    }, [indeterminate, ref])

    // Base classes
    const baseClasses = cn(
      'border rounded transition-all duration-200',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'cursor-pointer'
    )

    // State classes
    const stateClasses = {
      default: '',
      error: [
        'border-error-500',
        'focus:border-error-500 focus:ring-error-500/20',
        'checked:bg-error-500 checked:border-error-500'
      ].join(' '),
      success: [
        'border-success-500',
        'focus:border-success-500 focus:ring-success-500/20',
        'checked:bg-success-500 checked:border-success-500'
      ].join(' ')
    }

    // Combine classes
    const checkboxClasses = cn(
      baseClasses,
      checkboxVariants[variant],
      stateClasses[currentState],
      checkboxSizes[size],
      disabled && 'cursor-not-allowed',
      className
    )

    // Container classes
    const containerClasses = cn(
      'flex gap-3',
      orientation === 'vertical' ? 'flex-col' : 'flex-row items-start',
      alignment === 'center' && orientation === 'horizontal' && 'items-center',
      alignment === 'end' && orientation === 'horizontal' && 'items-end'
    )

    // Label classes
    const labelClasses = cn(
      'text-sm font-medium cursor-pointer',
      currentState === 'error' ? 'text-error-600 dark:text-error-400' : 
      currentState === 'success' ? 'text-success-600 dark:text-success-400' :
      'text-neutral-700 dark:text-neutral-300',
      disabled && 'opacity-50 cursor-not-allowed'
    )

    const contentElement = (
      <>
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(checkboxClasses, 'appearance-none')}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={cn(
              helperTextId,
              errorId,
              successId,
              descriptionId,
              ariaDescribedBy
            ).trim() || undefined}
            aria-invalid={currentState === 'error'}
            aria-required={required}
            checked={checked}
            onChange={onChange}
            {...props}
          />

          {/* Check/Indeterminate Icon */}
          <div className={cn(
            'absolute inset-0 flex items-center justify-center pointer-events-none',
            'text-white'
          )}>
            {indeterminate ? (
              <Minus className={iconSizes[size]} />
            ) : checked ? (
              <Check className={iconSizes[size]} />
            ) : null}
          </div>
        </div>

        {(label || description || helperText || errorMessage || successMessage) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label 
                htmlFor={checkboxId}
                className={labelClasses}
              >
                {label}
                {required && (
                  <span className="text-error-500 ml-1" aria-label="required">*</span>
                )}
              </label>
            )}

            {description && (
              <p 
                id={descriptionId}
                className="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
              >
                {description}
              </p>
            )}

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
                className="mt-1 text-xs text-error-600 dark:text-error-400"
                role="alert"
              >
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p 
                id={successId}
                className="mt-1 text-xs text-success-600 dark:text-success-400"
              >
                {successMessage}
              </p>
            )}
          </div>
        )}
      </>
    )

    return (
      <div className={containerClasses}>
        {contentElement}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// Checkbox Group for managing multiple checkboxes
export interface CheckboxGroupProps {
  children: React.ReactNode
  label?: string
  description?: string
  helperText?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[]) => void
  className?: string
}

export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  ({
    children,
    label,
    description,
    helperText,
    errorMessage,
    required = false,
    disabled = false,
    orientation = 'vertical',
    value,
    defaultValue,
    onChange,
    className,
    ...props
  }, ref) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      value || defaultValue || []
    )

    // Auto-generate ID
    const groupId = `checkbox-group-${Math.random().toString(36).substr(2, 9)}`
    const helperTextId = helperText ? `${groupId}-helper` : undefined
    const errorId = errorMessage ? `${groupId}-error` : undefined
    const descriptionId = description ? `${groupId}-description` : undefined

    // Sync with external value
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(value)
      }
    }, [value])

    // Handle change
    const handleChange = (newValues: string[]) => {
      if (value === undefined) {
        setSelectedValues(newValues)
      }
      onChange?.(newValues)
    }

    return (
      <fieldset
        ref={ref}
        className={cn('w-full', className)}
        disabled={disabled}
        aria-describedby={cn(
          helperTextId,
          errorId,
          descriptionId
        ).trim() || undefined}
        aria-invalid={!!errorMessage}
        aria-required={required}
        {...props}
      >
        {label && (
          <legend className={cn(
            'text-sm font-medium mb-3',
            errorMessage ? 'text-error-600 dark:text-error-400' :
            'text-neutral-700 dark:text-neutral-300'
          )}>
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">*</span>
            )}
          </legend>
        )}

        {description && (
          <p 
            id={descriptionId}
            className="mb-3 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {description}
          </p>
        )}

        <div className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === Checkbox) {
              const childValue = child.props.value
              if (!childValue) return child

              return React.cloneElement(child, {
                checked: selectedValues.includes(childValue),
                disabled: disabled || child.props.disabled,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const newValues = e.target.checked
                    ? [...selectedValues, childValue]
                    : selectedValues.filter(v => v !== childValue)
                  handleChange(newValues)
                  child.props.onChange?.(e)
                }
              })
            }
            return child
          })}
        </div>

        {helperText && !errorMessage && (
          <p 
            id={helperTextId}
            className="mt-2 text-xs text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}

        {errorMessage && (
          <p 
            id={errorId}
            className="mt-2 text-xs text-error-600 dark:text-error-400"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </fieldset>
    )
  }
)

CheckboxGroup.displayName = 'CheckboxGroup'

// Export utility functions
export const getCheckboxVariant = (variant: keyof typeof checkboxVariants) => {
  return checkboxVariants[variant]
}

export const getCheckboxSize = (size: keyof typeof checkboxSizes) => {
  return checkboxSizes[size]
}