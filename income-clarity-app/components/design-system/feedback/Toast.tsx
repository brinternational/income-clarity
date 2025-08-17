/**
 * Income Clarity Design System - Toast Component
 * 
 * Toast notifications for displaying temporary messages
 * with auto-dismiss and positioning options.
 */

'use client'

import React, { forwardRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Toast variants
const toastVariants = {
  default: [
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700',
    'text-neutral-900 dark:text-neutral-100'
  ].join(' '),

  success: [
    'bg-success-50 dark:bg-success-900',
    'border border-success-200 dark:border-success-700',
    'text-success-900 dark:text-success-100'
  ].join(' '),

  error: [
    'bg-error-50 dark:bg-error-900',
    'border border-error-200 dark:border-error-700',
    'text-error-900 dark:text-error-100'
  ].join(' '),

  warning: [
    'bg-warning-50 dark:bg-warning-900',
    'border border-warning-200 dark:border-warning-700',
    'text-warning-900 dark:text-warning-100'
  ].join(' '),

  info: [
    'bg-info-50 dark:bg-info-900',
    'border border-info-200 dark:border-info-700',
    'text-info-900 dark:text-info-100'
  ].join(' ')
}

// Toast positions
const toastPositions = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4'
}

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: keyof typeof toastVariants
  // Content
  title?: string
  description?: string
  // Behavior
  duration?: number | null // null = no auto-dismiss
  dismissible?: boolean
  // Callbacks
  onDismiss?: () => void
  onAction?: () => void
  // Action
  actionLabel?: string
  // Icons
  showIcon?: boolean
  icon?: React.ReactNode
  // Animation
  animate?: boolean
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({
    className,
    variant = 'default',
    title,
    description,
    duration = 5000,
    dismissible = true,
    onDismiss,
    onAction,
    actionLabel,
    showIcon = true,
    icon,
    animate = true,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = useState(true)
    const [isEntering, setIsEntering] = useState(animate)
    const [isExiting, setIsExiting] = useState(false)

    // Auto-dismiss timer
    useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss()
        }, duration)

        return () => clearTimeout(timer)
      }
    }, [duration])

    // Entry animation
    useEffect(() => {
      if (animate && isEntering) {
        const timer = setTimeout(() => {
          setIsEntering(false)
        }, 150)
        return () => clearTimeout(timer)
      }
    }, [animate, isEntering])

    // Handle dismiss with animation
    const handleDismiss = () => {
      if (animate) {
        setIsExiting(true)
        setTimeout(() => {
          setIsVisible(false)
          onDismiss?.()
        }, 150)
      } else {
        setIsVisible(false)
        onDismiss?.()
      }
    }

    // Don't render if not visible
    if (!isVisible) return null

    // Get icon based on variant
    const getVariantIcon = () => {
      if (icon) return icon
      if (!showIcon) return null

      const iconProps = { className: 'w-5 h-5 flex-shrink-0' }
      
      switch (variant) {
        case 'success':
          return <Check {...iconProps} />
        case 'error':
          return <AlertCircle {...iconProps} />
        case 'warning':
          return <AlertTriangle {...iconProps} />
        case 'info':
          return <Info {...iconProps} />
        default:
          return <Info {...iconProps} />
      }
    }

    // Base classes
    const baseClasses = cn(
      'flex items-start gap-3 p-4 rounded-lg shadow-lg',
      'max-w-sm w-full pointer-events-auto',
      'transition-all duration-150 ease-in-out',
      // Animation states
      animate && isEntering && 'transform translate-y-2 opacity-0',
      animate && isExiting && 'transform translate-y-2 opacity-0',
      animate && !isEntering && !isExiting && 'transform translate-y-0 opacity-100',
      // Variant styling
      toastVariants[variant],
      className
    )

    const variantIcon = getVariantIcon()

    return (
      <div
        ref={ref}
        className={baseClasses}
        role="alert"
        aria-live="polite"
        {...props}
      >
        {variantIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {variantIcon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-medium">
              {title}
            </div>
          )}
          
          {description && (
            <div className={cn(
              'text-sm',
              title ? 'mt-1' : '',
              variant === 'default' ? 'text-neutral-600 dark:text-neutral-400' :
              variant === 'success' ? 'text-success-700 dark:text-success-200' :
              variant === 'error' ? 'text-error-700 dark:text-error-200' :
              variant === 'warning' ? 'text-warning-700 dark:text-warning-200' :
              'text-info-700 dark:text-info-200'
            )}>
              {description}
            </div>
          )}

          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={cn(
                'mt-2 text-sm font-medium underline hover:no-underline',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 rounded',
                variant === 'default' ? 'text-brand-600 focus:ring-brand-500' :
                variant === 'success' ? 'text-success-700 focus:ring-success-500' :
                variant === 'error' ? 'text-error-700 focus:ring-error-500' :
                variant === 'warning' ? 'text-warning-700 focus:ring-warning-500' :
                'text-info-700 focus:ring-info-500'
              )}
            >
              {actionLabel}
            </button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 p-1 rounded-md transition-colors',
              'hover:bg-black/5 dark:hover:bg-white/5',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500'
            )}
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)

Toast.displayName = 'Toast'

// Toast Container for positioning
export interface ToastContainerProps {
  children: React.ReactNode
  position?: keyof typeof toastPositions
  className?: string
}

export const ToastContainer = ({ children, position = 'top-right', className }: ToastContainerProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const portalRoot = document.getElementById('toast-root') || document.body

  return createPortal(
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        toastPositions[position],
        className
      )}
    >
      {children}
    </div>,
    portalRoot
  )
}

// Toast Manager for programmatic usage
export interface ToastOptions extends Omit<ToastProps, 'onDismiss'> {
  id?: string
}

interface ToastInstance extends ToastOptions {
  id: string
}

class ToastManager {
  private toasts: ToastInstance[] = []
  private listeners: Set<(toasts: ToastInstance[]) => void> = new Set()
  private idCounter = 0

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  show(options: ToastOptions): string {
    const id = options.id || `toast-${++this.idCounter}`
    const toast: ToastInstance = {
      ...options,
      id
    }

    this.toasts.push(toast)
    this.notify()
    return id
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  dismissAll() {
    this.toasts = []
    this.notify()
  }

  subscribe(listener: (toasts: ToastInstance[]) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Convenience methods
  success(title: string, description?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, variant: 'success', title, description })
  }

  error(title: string, description?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, variant: 'error', title, description })
  }

  warning(title: string, description?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, variant: 'warning', title, description })
  }

  info(title: string, description?: string, options?: Partial<ToastOptions>) {
    return this.show({ ...options, variant: 'info', title, description })
  }
}

export const toast = new ToastManager()

// Toast Provider Component
export interface ToastProviderProps {
  position?: keyof typeof toastPositions
  className?: string
}

export const ToastProvider = ({ position = 'top-right', className }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastInstance[]>([])

  useEffect(() => {
    return toast.subscribe(setToasts)
  }, [])

  return (
    <ToastContainer position={position} className={className}>
      {toasts.map((toastData) => (
        <Toast
          key={toastData.id}
          {...toastData}
          onDismiss={() => toast.dismiss(toastData.id)}
        />
      ))}
    </ToastContainer>
  )
}

// Export utility functions
export const getToastVariant = (variant: keyof typeof toastVariants) => {
  return toastVariants[variant]
}

export const getToastPosition = (position: keyof typeof toastPositions) => {
  return toastPositions[position]
}