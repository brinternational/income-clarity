/**
 * Income Clarity Design System - FormGroup Component
 * 
 * Container component for organizing form fields with consistent
 * spacing, layout, and accessibility features.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// FormGroup variants
const formGroupVariants = {
  default: [
    'bg-transparent border-0'
  ].join(' '),

  card: [
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700',
    'rounded-lg p-6'
  ].join(' '),

  section: [
    'bg-neutral-50 dark:bg-neutral-900',
    'border border-neutral-200 dark:border-neutral-700',
    'rounded-lg p-6'
  ].join(' '),

  outlined: [
    'bg-transparent',
    'border-2 border-dashed border-neutral-300 dark:border-neutral-600',
    'rounded-lg p-6'
  ].join(' ')
}

// FormGroup sizes for spacing
const formGroupSizes = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8'
}

export interface FormGroupProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  variant?: keyof typeof formGroupVariants
  size?: keyof typeof formGroupSizes
  // Layout options
  orientation?: 'vertical' | 'horizontal' | 'grid'
  columns?: number
  // Content
  title?: string
  description?: string
  helperText?: string
  errorMessage?: string
  // Form integration
  required?: boolean
  disabled?: boolean
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const FormGroup = forwardRef<HTMLFieldSetElement, FormGroupProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    orientation = 'vertical',
    columns = 2,
    title,
    description,
    helperText,
    errorMessage,
    required = false,
    disabled = false,
    ariaLabel,
    ariaDescribedBy,
    children,
    ...props
  }, ref) => {
    // Auto-generate ID
    const groupId = `form-group-${Math.random().toString(36).substr(2, 9)}`
    const helperTextId = helperText ? `${groupId}-helper` : undefined
    const errorId = errorMessage ? `${groupId}-error` : undefined
    const descriptionId = description ? `${groupId}-description` : undefined

    // Determine current state
    const hasError = !!errorMessage

    // Base classes
    const baseClasses = cn(
      'w-full',
      'disabled:opacity-50'
    )

    // Layout classes
    const layoutClasses = cn(
      'flex',
      orientation === 'vertical' && 'flex-col',
      orientation === 'horizontal' && 'flex-row flex-wrap items-start',
      orientation === 'grid' && 'grid',
      orientation === 'grid' && columns === 1 && 'grid-cols-1',
      orientation === 'grid' && columns === 2 && 'grid-cols-1 md:grid-cols-2',
      orientation === 'grid' && columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      orientation === 'grid' && columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      formGroupSizes[size]
    )

    // Combine classes
    const groupClasses = cn(
      baseClasses,
      formGroupVariants[variant],
      className
    )

    return (
      <fieldset
        ref={ref}
        className={groupClasses}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={cn(
          helperTextId,
          errorId,
          descriptionId,
          ariaDescribedBy
        ).trim() || undefined}
        aria-invalid={hasError}
        aria-required={required}
        {...props}
      >
        {title && (
          <legend className={cn(
            'text-lg font-semibold mb-2',
            hasError ? 'text-error-600 dark:text-error-400' :
            'text-neutral-900 dark:text-neutral-100'
          )}>
            {title}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">*</span>
            )}
          </legend>
        )}

        {description && (
          <p 
            id={descriptionId}
            className={cn(
              'text-sm text-neutral-600 dark:text-neutral-400',
              title ? 'mb-4' : 'mb-3'
            )}
          >
            {description}
          </p>
        )}

        <div className={layoutClasses}>
          {children}
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

FormGroup.displayName = 'FormGroup'

// Form Section - A semantic wrapper for form sections
export interface FormSectionProps extends Omit<FormGroupProps, 'variant'> {
  elevated?: boolean
}

export const FormSection = forwardRef<HTMLFieldSetElement, FormSectionProps>(
  ({
    elevated = false,
    ...props
  }, ref) => (
    <FormGroup
      ref={ref}
      variant={elevated ? 'card' : 'section'}
      {...props}
    />
  )
)

FormSection.displayName = 'FormSection'

// Form Row - Horizontal layout for related fields
export interface FormRowProps extends Omit<FormGroupProps, 'orientation'> {
  wrap?: boolean
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export const FormRow = forwardRef<HTMLFieldSetElement, FormRowProps>(
  ({
    wrap = true,
    align = 'start',
    justify = 'start',
    className,
    ...props
  }, ref) => {
    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    }

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }

    return (
      <FormGroup
        ref={ref}
        orientation="horizontal"
        className={cn(
          alignClasses[align],
          justifyClasses[justify],
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      />
    )
  }
)

FormRow.displayName = 'FormRow'

// Form Grid - Grid layout for structured forms
export interface FormGridProps extends Omit<FormGroupProps, 'orientation'> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  colsTablet?: 1 | 2 | 3 | 4 | 6 | 12
  colsDesktop?: 1 | 2 | 3 | 4 | 6 | 12
}

export const FormGrid = forwardRef<HTMLFieldSetElement, FormGridProps>(
  ({
    cols = 2,
    colsTablet,
    colsDesktop,
    className,
    ...props
  }, ref) => {
    const getColClass = (columns: number, prefix = '') => {
      const prefixStr = prefix ? `${prefix}:` : ''
      return `${prefixStr}grid-cols-${columns}`
    }

    const gridClasses = cn(
      getColClass(cols),
      colsTablet && getColClass(colsTablet, 'md'),
      colsDesktop && getColClass(colsDesktop, 'lg')
    )

    return (
      <FormGroup
        ref={ref}
        orientation="grid"
        className={cn(gridClasses, className)}
        {...props}
      />
    )
  }
)

FormGrid.displayName = 'FormGrid'

// Form Field - Individual field wrapper with consistent spacing
export interface FormFieldProps {
  children: React.ReactNode
  span?: number
  spanTablet?: number
  spanDesktop?: number
  className?: string
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({
    children,
    span = 1,
    spanTablet,
    spanDesktop,
    className,
    ...props
  }, ref) => {
    const getSpanClass = (spanValue: number, prefix = '') => {
      const prefixStr = prefix ? `${prefix}:` : ''
      if (spanValue === 1) return ''
      return `${prefixStr}col-span-${spanValue}`
    }

    const spanClasses = cn(
      getSpanClass(span),
      spanTablet && getSpanClass(spanTablet, 'md'),
      spanDesktop && getSpanClass(spanDesktop, 'lg')
    )

    return (
      <div
        ref={ref}
        className={cn(spanClasses, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

// Export utility functions
export const getFormGroupVariant = (variant: keyof typeof formGroupVariants) => {
  return formGroupVariants[variant]
}

export const getFormGroupSize = (size: keyof typeof formGroupSizes) => {
  return formGroupSizes[size]
}