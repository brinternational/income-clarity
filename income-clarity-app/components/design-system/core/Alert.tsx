/**
 * Income Clarity Design System - Alert Component
 * 
 * Unified alert component for displaying important messages, notifications,
 * and status updates with consistent styling and accessibility.
 */

'use client'

import React, { forwardRef, useState } from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Alert variants based on semantic meaning
const alertVariants = {
  success: [
    'bg-success-50 border-success-200 text-success-800',
    'dark:bg-success-900/20 dark:border-success-800 dark:text-success-300'
  ].join(' '),

  error: [
    'bg-error-50 border-error-200 text-error-800',
    'dark:bg-error-900/20 dark:border-error-800 dark:text-error-300'
  ].join(' '),

  warning: [
    'bg-warning-50 border-warning-200 text-warning-800',
    'dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-300'
  ].join(' '),

  info: [
    'bg-info-50 border-info-200 text-info-800',
    'dark:bg-info-900/20 dark:border-info-800 dark:text-info-300'
  ].join(' '),

  default: [
    'bg-neutral-50 border-neutral-200 text-neutral-800',
    'dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200'
  ].join(' ')
}

// Alert sizes
const alertSizes = {
  sm: 'p-3 text-sm',
  md: 'p-4 text-sm',
  lg: 'p-6 text-base'
}

// Icon mapping for each variant
const alertIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertVariants
  size?: keyof typeof alertSizes
  title?: string
  description?: string
  icon?: React.ReactNode | boolean
  dismissible?: boolean
  onDismiss?: () => void
  // Enhanced features
  actions?: React.ReactNode
  borderStyle?: 'solid' | 'dashed' | 'left-accent'
  // Accessibility
  ariaLabel?: string
  role?: 'alert' | 'alertdialog' | 'status'
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    title,
    description,
    icon = true,
    dismissible = false,
    onDismiss,
    actions,
    borderStyle = 'solid',
    ariaLabel,
    role = 'alert',
    children,
    ...props
  }, ref) => {
    const [dismissed, setDismissed] = useState(false)

    // Don't render if dismissed
    if (dismissed) return null

    // Get the appropriate icon
    const IconComponent = alertIcons[variant]
    const showIcon = icon !== false
    const customIcon = typeof icon === 'object' ? icon : null

    // Handle dismiss
    const handleDismiss = () => {
      setDismissed(true)
      onDismiss?.()
    }

    // Border style classes
    const borderClasses = {
      solid: 'border',
      dashed: 'border border-dashed',
      'left-accent': 'border-l-4 border-t border-r border-b'
    }

    // Base alert classes
    const baseClasses = cn(
      'relative rounded-lg transition-all duration-200',
      borderClasses[borderStyle]
    )

    // Size classes
    const sizeClasses = alertSizes[size]

    // Combine all classes
    const alertClasses = cn(
      baseClasses,
      alertVariants[variant],
      sizeClasses,
      className
    )

    return (
      <div
        ref={ref}
        className={alertClasses}
        role={role}
        aria-label={ariaLabel}
        {...props}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          {showIcon && (
            <div className="flex-shrink-0">
              {customIcon || (
                <IconComponent 
                  className="w-5 h-5 mt-0.5" 
                  aria-hidden="true"
                />
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            {title && (
              <h4 className="font-semibold mb-1">
                {title}
              </h4>
            )}

            {/* Description */}
            {description && (
              <p className="opacity-90">
                {description}
              </p>
            )}

            {/* Children content */}
            {children && (
              <div className={title || description ? 'mt-2' : ''}>
                {children}
              </div>
            )}

            {/* Actions */}
            {actions && (
              <div className="mt-3 flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className={cn(
                'flex-shrink-0 p-1 rounded-md transition-colors',
                'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2',
                'dark:hover:bg-white/10'
              )}
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'

// Alert Title sub-component
export const AlertTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn('font-semibold mb-1', className)}
      {...props}
    >
      {children}
    </h4>
  )
)

AlertTitle.displayName = 'AlertTitle'

// Alert Description sub-component
export const AlertDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('opacity-90', className)}
      {...props}
    >
      {children}
    </p>
  )
)

AlertDescription.displayName = 'AlertDescription'

// Alert Actions sub-component
export const AlertActions = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-3 flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </div>
  )
)

AlertActions.displayName = 'AlertActions'

// Toast Alert - For notifications
export interface ToastAlertProps extends Omit<AlertProps, 'dismissible'> {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  onAutoClose?: () => void
}

export const ToastAlert = forwardRef<HTMLDivElement, ToastAlertProps>(
  ({
    duration = 5000,
    position = 'top-right',
    onAutoClose,
    onDismiss,
    ...props
  }, ref) => {
    const [visible, setVisible] = useState(true)

    // Auto-dismiss after duration
    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setVisible(false)
          onAutoClose?.()
          onDismiss?.()
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration, onAutoClose, onDismiss])

    if (!visible) return null

    // Position classes
    const positionClasses = {
      'top-right': 'fixed top-4 right-4 z-50',
      'top-left': 'fixed top-4 left-4 z-50',
      'bottom-right': 'fixed bottom-4 right-4 z-50',
      'bottom-left': 'fixed bottom-4 left-4 z-50',
      'top-center': 'fixed top-4 left-1/2 -translate-x-1/2 z-50',
      'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50'
    }

    return (
      <Alert
        ref={ref}
        dismissible
        onDismiss={() => {
          setVisible(false)
          onDismiss?.()
        }}
        className={cn(
          positionClasses[position],
          'shadow-lg max-w-sm w-full',
          'animate-in slide-in-from-top-2 fade-in-0',
          props.className
        )}
        {...props}
      />
    )
  }
)

ToastAlert.displayName = 'ToastAlert'

// Inline Alert - For form validation
export const InlineAlert = forwardRef<HTMLDivElement, Omit<AlertProps, 'size' | 'title'>>(
  ({ className, ...props }, ref) => (
    <Alert
      ref={ref}
      size="sm"
      className={cn('border-0 bg-transparent p-0', className)}
      {...props}
    />
  )
)

InlineAlert.displayName = 'InlineAlert'

// Export utility functions
export const getAlertVariant = (variant: keyof typeof alertVariants) => {
  return alertVariants[variant]
}

export const getAlertSize = (size: keyof typeof alertSizes) => {
  return alertSizes[size]
}

export const getAlertIcon = (variant: keyof typeof alertIcons) => {
  return alertIcons[variant]
}