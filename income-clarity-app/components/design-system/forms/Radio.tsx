/**
 * Income Clarity Design System - Radio Component
 * 
 * Accessible radio button component with consistent styling,
 * support for radio groups, and validation.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Radio variants
const radioVariants = {
  default: [
    'border-neutral-300 bg-white',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'hover:border-neutral-400',
    'checked:border-brand-500',
    'dark:border-neutral-600 dark:bg-neutral-800',
    'dark:focus:border-brand-400 dark:focus:ring-brand-400/20',
    'dark:hover:border-neutral-500',
    'dark:checked:border-brand-500'
  ].join(' '),

  filled: [
    'border-transparent bg-neutral-100',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'focus:bg-white',
    'hover:bg-neutral-50',
    'checked:border-brand-500',
    'dark:bg-neutral-700 dark:hover:bg-neutral-600',
    'dark:focus:bg-neutral-800 dark:focus:border-brand-400',
    'dark:checked:border-brand-500'
  ].join(' '),

  outline: [
    'border-2 border-brand-500 bg-transparent',
    'focus:ring-2 focus:ring-brand-500/20',
    'hover:bg-brand-50',
    'checked:border-brand-500',
    'dark:border-brand-400 dark:hover:bg-brand-900/20',
    'dark:focus:ring-brand-400/20',
    'dark:checked:border-brand-500'
  ].join(' ')
}

// Radio sizes
const radioSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7'
}

// Dot sizes for checked state
const dotSizes = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
  xl: 'w-3 h-3'
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: keyof typeof radioVariants
  size?: keyof typeof radioSizes
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

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
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
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`
    
    // Generate helper IDs
    const helperTextId = helperText ? `${radioId}-helper` : undefined
    const errorId = errorMessage ? `${radioId}-error` : undefined
    const successId = successMessage ? `${radioId}-success` : undefined
    const descriptionId = description ? `${radioId}-description` : undefined

    // Determine current state
    const currentState = errorMessage ? 'error' 
      : successMessage ? 'success' 
      : 'default'

    // Base classes
    const baseClasses = cn(
      'border rounded-full transition-all duration-200',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'cursor-pointer'
    )

    // State classes
    const stateClasses = {
      default: '',
      error: [
        'border-error-500',
        'focus:border-error-500 focus:ring-error-500/20'
      ].join(' '),
      success: [
        'border-success-500',
        'focus:border-success-500 focus:ring-success-500/20'
      ].join(' ')
    }

    // Combine classes
    const radioClasses = cn(
      baseClasses,
      radioVariants[variant],
      stateClasses[currentState],
      radioSizes[size],
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
            type="radio"
            id={radioId}
            className={cn(radioClasses, 'appearance-none')}
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

          {/* Checked Dot */}
          {checked && (
            <div className={cn(
              'absolute inset-0 flex items-center justify-center pointer-events-none'
            )}>
              <div className={cn(
                'rounded-full',
                dotSizes[size],
                currentState === 'error' ? 'bg-error-500' :
                currentState === 'success' ? 'bg-success-500' :
                'bg-brand-500'
              )} />
            </div>
          )}
        </div>

        {(label || description || helperText || errorMessage || successMessage) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label 
                htmlFor={radioId}
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

Radio.displayName = 'Radio'

// Radio Group for managing radio button groups
export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  children?: React.ReactNode
  options?: RadioOption[]
  name: string
  label?: string
  description?: string
  helperText?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
  variant?: keyof typeof radioVariants
  size?: keyof typeof radioSizes
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  ({
    children,
    options = [],
    name,
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
    variant = 'default',
    size = 'md',
    ...props
  }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState<string>(
      value || defaultValue || ''
    )

    // Auto-generate ID
    const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`
    const helperTextId = helperText ? `${groupId}-helper` : undefined
    const errorId = errorMessage ? `${groupId}-error` : undefined
    const descriptionId = description ? `${groupId}-description` : undefined

    // Sync with external value
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    // Handle change
    const handleChange = (newValue: string) => {
      if (value === undefined) {
        setSelectedValue(newValue)
      }
      onChange?.(newValue)
    }

    // Render radio buttons from options
    const renderOptions = () => {
      return options.map((option, index) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          variant={variant}
          size={size}
          label={option.label}
          description={option.description}
          disabled={disabled || option.disabled}
          checked={selectedValue === option.value}
          onChange={(e) => {
            if (e.target.checked) {
              handleChange(option.value)
            }
          }}
        />
      ))
    }

    // Render children with enhanced props
    const renderChildren = () => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Radio) {
          const childValue = child.props.value
          if (!childValue) return child

          return React.cloneElement(child, {
            name: child.props.name || name,
            checked: selectedValue === childValue,
            disabled: disabled || child.props.disabled,
            variant: child.props.variant || variant,
            size: child.props.size || size,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
                handleChange(childValue)
              }
              child.props.onChange?.(e)
            }
          })
        }
        return child
      })
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
          {options.length > 0 ? renderOptions() : renderChildren()}
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

RadioGroup.displayName = 'RadioGroup'

// Export utility functions
export const getRadioVariant = (variant: keyof typeof radioVariants) => {
  return radioVariants[variant]
}

export const getRadioSize = (size: keyof typeof radioSizes) => {
  return radioSizes[size]
}