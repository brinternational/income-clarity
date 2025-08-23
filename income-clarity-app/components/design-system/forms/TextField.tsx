/**
 * Income Clarity Design System - TextField Component
 * 
 * Enhanced input field with label, helper text, validation states,
 * and consistent styling. Extends the base Input component.
 */

'use client'

import React, { forwardRef } from 'react'
import { Input, type InputProps } from '../core/Input'
import { cn } from '@/lib/utils'

export interface TextFieldProps extends InputProps {
  // Layout options
  orientation?: 'vertical' | 'horizontal'
  labelWidth?: string
  // Enhanced validation
  validate?: (value: string) => string | null
  validateOnBlur?: boolean
  validateOnChange?: boolean
  // Auto-formatting
  autoFormat?: boolean
  formatType?: 'currency' | 'percentage' | 'phone' | 'ssn' | 'date'
  // Icon support (legacy props - converted to leftElement/rightElement)
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({
    className,
    orientation = 'vertical',
    labelWidth = '120px',
    validate,
    validateOnBlur = true,
    validateOnChange = false,
    autoFormat = false,
    formatType,
    onChange,
    onBlur,
    label,
    errorMessage,
    leftIcon,
    rightIcon,
    ...props
  }, ref) => {
    const [internalError, setInternalError] = React.useState<string | null>(null)
    const [value, setValue] = React.useState(props.value || props.defaultValue || '')

    // Format value based on type
    const formatValue = (inputValue: string): string => {
      if (!autoFormat || !formatType) return inputValue

      switch (formatType) {
        case 'currency':
          // Remove non-numeric characters except decimal
          const numericValue = inputValue.replace(/[^\d.]/g, '')
          if (numericValue === '') return ''
          const num = parseFloat(numericValue)
          return isNaN(num) ? inputValue : num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          })

        case 'percentage':
          const percentValue = inputValue.replace(/[^\d.]/g, '')
          if (percentValue === '') return ''
          const percent = parseFloat(percentValue)
          return isNaN(percent) ? inputValue : `${percent}%`

        case 'phone':
          // Format as (XXX) XXX-XXXX
          const phoneDigits = inputValue.replace(/\D/g, '')
          if (phoneDigits.length <= 3) return phoneDigits
          if (phoneDigits.length <= 6) return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`
          return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`

        case 'ssn':
          // Format as XXX-XX-XXXX
          const ssnDigits = inputValue.replace(/\D/g, '')
          if (ssnDigits.length <= 3) return ssnDigits
          if (ssnDigits.length <= 5) return `${ssnDigits.slice(0, 3)}-${ssnDigits.slice(3)}`
          return `${ssnDigits.slice(0, 3)}-${ssnDigits.slice(3, 5)}-${ssnDigits.slice(5, 9)}`

        default:
          return inputValue
      }
    }

    // Validate value
    const validateValue = (inputValue: string): string | null => {
      if (!validate) return null
      return validate(inputValue)
    }

    // Handle change with formatting and validation
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      const formattedValue = formatValue(newValue)
      
      setValue(formattedValue)
      
      // Update the event value for parent handling
      const updatedEvent = {
        ...event,
        target: { ...event.target, value: formattedValue }
      }
      
      onChange?.(updatedEvent)

      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateValue(formattedValue)
        setInternalError(error)
      }
    }

    // Handle blur with validation
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event)

      // Validate on blur if enabled
      if (validateOnBlur) {
        const error = validateValue(event.target.value)
        setInternalError(error)
      }
    }

    // Determine which error to show
    const displayError = errorMessage || internalError

    // Horizontal layout
    if (orientation === 'horizontal') {
      return (
        <div className={cn('flex items-start gap-4', className)}>
          {label && (
            <label
              htmlFor={props.id}
              className={cn(
                'text-sm font-medium text-neutral-700 dark:text-neutral-300 pt-3 flex-shrink-0',
                displayError ? 'text-error-600 dark:text-error-400' : ''
              )}
              style={{ width: labelWidth }}
            >
              {label}
              {props.required && (
                <span className="text-error-500 ml-1" aria-label="required">*</span>
              )}
              {props.optional && (
                <span className="text-neutral-400 ml-1 font-normal">(optional)</span>
              )}
            </label>
          )}
          <div className="flex-1">
            <Input
              ref={ref}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={displayError}
              leftElement={leftIcon}
              rightElement={rightIcon}
              {...props}
              label={undefined} // Remove label since we're handling it separately
            />
          </div>
        </div>
      )
    }

    // Vertical layout (default)
    return (
      <Input
        ref={ref}
        className={className}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        label={label}
        errorMessage={displayError}
        leftElement={leftIcon}
        rightElement={rightIcon}
        {...props}
      />
    )
  }
)

TextField.displayName = 'TextField'

// Currency field - Pre-configured for financial values
export const CurrencyField = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'formatType' | 'autoFormat' | 'currency'>>(
  ({ ...props }, ref) => (
    <TextField
      ref={ref}
      autoFormat
      formatType="currency"
      currency
      type="text"
      inputMode="decimal"
      {...props}
    />
  )
)

CurrencyField.displayName = 'CurrencyField'

// Percentage field - Pre-configured for percentage values
export const PercentageField = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'formatType' | 'autoFormat' | 'percentage'>>(
  ({ ...props }, ref) => (
    <TextField
      ref={ref}
      autoFormat
      formatType="percentage"
      percentage
      type="text"
      inputMode="decimal"
      {...props}
    />
  )
)

PercentageField.displayName = 'PercentageField'

// Phone field - Pre-configured for phone numbers
export const PhoneField = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'formatType' | 'autoFormat'>>(
  ({ ...props }, ref) => (
    <TextField
      ref={ref}
      autoFormat
      formatType="phone"
      type="tel"
      inputMode="tel"
      {...props}
    />
  )
)

PhoneField.displayName = 'PhoneField'

// SSN field - Pre-configured for social security numbers
export const SSNField = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'formatType' | 'autoFormat'>>(
  ({ ...props }, ref) => (
    <TextField
      ref={ref}
      autoFormat
      formatType="ssn"
      type="text"
      inputMode="numeric"
      {...props}
    />
  )
)

SSNField.displayName = 'SSNField'

// Email field with explicit icon support
export interface EmailFieldProps extends Omit<TextFieldProps, 'validate'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const EmailField = forwardRef<HTMLInputElement, EmailFieldProps>(
  ({ ...props }, ref) => {
    const emailValidation = (value: string): string | null => {
      if (!value) return null
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? null : 'Please enter a valid email address'
    }

    return (
      <TextField
        ref={ref}
        validate={emailValidation}
        type="email"
        inputMode="email"
        autoComplete="email"
        {...props}
      />
    )
  }
)

EmailField.displayName = 'EmailField'

// Password field with explicit icon support
export interface PasswordFieldProps extends Omit<TextFieldProps, 'showPasswordToggle'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ ...props }, ref) => (
    <TextField
      ref={ref}
      type="password"
      showPasswordToggle
      autoComplete="current-password"
      {...props}
    />
  )
)

PasswordField.displayName = 'PasswordField'

// Search field - Pre-configured for search inputs
export const SearchField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ ...props }, ref) => (
    <TextField
      ref={ref}
      type="search"
      inputMode="search"
      autoComplete="off"
      {...props}
    />
  )
)

SearchField.displayName = 'SearchField'