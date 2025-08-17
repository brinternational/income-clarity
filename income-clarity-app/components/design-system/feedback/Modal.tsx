/**
 * Income Clarity Design System - Modal Component
 * 
 * Accessible modal dialogs with backdrop, focus management,
 * and keyboard navigation.
 */

'use client'

import React, { forwardRef, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Modal sizes
const modalSizes = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
}

// Modal variants
const modalVariants = {
  default: [
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700'
  ].join(' '),

  blur: [
    'bg-white/95 dark:bg-neutral-800/95',
    'backdrop-blur-sm',
    'border border-neutral-200/50 dark:border-neutral-700/50'
  ].join(' '),

  glass: [
    'bg-white/80 dark:bg-neutral-800/80',
    'backdrop-blur-md',
    'border border-white/20 dark:border-neutral-700/20'
  ].join(' ')
}

export interface ModalProps {
  // Visibility
  open: boolean
  onClose: () => void
  // Content
  children: React.ReactNode
  title?: string
  description?: string
  // Styling
  size?: keyof typeof modalSizes
  variant?: keyof typeof modalVariants
  // Behavior
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  // Focus management
  initialFocus?: React.RefObject<HTMLElement>
  // Animation
  animate?: boolean
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
  // Custom backdrop
  backdropClassName?: string
  // Portal
  container?: Element
  // Padding
  noPadding?: boolean
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    open,
    onClose,
    children,
    title,
    description,
    size = 'md',
    variant = 'default',
    closeOnBackdropClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    initialFocus,
    animate = true,
    ariaLabel,
    ariaDescribedBy,
    backdropClassName,
    container,
    noPadding = false
  }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)

    // Mount state for portal
    useEffect(() => {
      setMounted(true)
    }, [])

    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, closeOnEscape, onClose])

    // Focus management
    useEffect(() => {
      if (!open) return

      const previousActiveElement = document.activeElement as HTMLElement

      // Focus initial element or modal
      setTimeout(() => {
        if (initialFocus?.current) {
          initialFocus.current.focus()
        } else if (modalRef.current) {
          modalRef.current.focus()
        }
      }, 100)

      // Trap focus within modal
      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || !modalRef.current) return

        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTabKey)

      return () => {
        document.removeEventListener('keydown', handleTabKey)
        previousActiveElement?.focus()
      }
    }, [open, initialFocus])

    // Animation handling
    useEffect(() => {
      if (open && animate) {
        setIsAnimating(true)
        const timer = setTimeout(() => setIsAnimating(false), 150)
        return () => clearTimeout(timer)
      }
    }, [open, animate])

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = 'unset'
        }
      }
    }, [open])

    // Don't render if not mounted or not open
    if (!mounted || !open) return null

    // Handle backdrop click
    const handleBackdropClick = (event: React.MouseEvent) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose()
      }
    }

    // Generate IDs for accessibility
    const titleId = title ? `modal-title-${Math.random().toString(36).substr(2, 9)}` : undefined
    const descriptionId = description ? `modal-description-${Math.random().toString(36).substr(2, 9)}` : undefined

    // Modal content
    const modalContent = (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'bg-black/50 dark:bg-black/70',
          animate && 'transition-opacity duration-150',
          animate && isAnimating && 'opacity-0',
          backdropClassName
        )}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedBy || descriptionId}
      >
        <div
          ref={modalRef}
          className={cn(
            'relative w-full rounded-lg shadow-xl',
            'transform transition-all duration-150',
            modalSizes[size],
            modalVariants[variant],
            animate && isAnimating && 'scale-95 opacity-0',
            animate && !isAnimating && 'scale-100 opacity-100',
            !noPadding && 'p-6'
          )}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4 p-1 rounded-md',
                'text-neutral-400 hover:text-neutral-600',
                'dark:text-neutral-500 dark:hover:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                'focus:outline-none focus:ring-2 focus:ring-brand-500',
                'transition-colors'
              )}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          {(title || description) && (
            <div className={cn(
              'mb-4',
              showCloseButton && 'pr-10'
            )}>
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className={cn(
                    'text-sm text-neutral-600 dark:text-neutral-400',
                    title && 'mt-1'
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    )

    // Portal target
    const portalTarget = container || document.body

    return createPortal(modalContent, portalTarget)
  }
)

Modal.displayName = 'Modal'

// Modal Header Component
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onClose?: () => void
  showCloseButton?: boolean
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, onClose, showCloseButton = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700',
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className={cn(
            'ml-4 p-1 rounded-md text-neutral-400 hover:text-neutral-600',
            'dark:text-neutral-500 dark:hover:text-neutral-300',
            'hover:bg-neutral-100 dark:hover:bg-neutral-700',
            'focus:outline-none focus:ring-2 focus:ring-brand-500'
          )}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
)

ModalHeader.displayName = 'ModalHeader'

// Modal Body Component
export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('py-4', className)}
      {...props}
    >
      {children}
    </div>
  )
)

ModalBody.displayName = 'ModalBody'

// Modal Footer Component
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end gap-3 pt-4',
        'border-t border-neutral-200 dark:border-neutral-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

ModalFooter.displayName = 'ModalFooter'

// Confirmation Modal - Pre-configured for confirmations
export interface ConfirmationModalProps extends Omit<ModalProps, 'children'> {
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  variant?: 'default' | 'danger'
  loading?: boolean
}

export const ConfirmationModal = forwardRef<HTMLDivElement, ConfirmationModalProps>(
  ({
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default',
    loading = false,
    ...props
  }, ref) => {
    const handleCancel = () => {
      onCancel?.()
      props.onClose()
    }

    const handleConfirm = () => {
      onConfirm?.()
      if (!loading) {
        props.onClose()
      }
    }

    return (
      <Modal ref={ref} size="sm" {...props}>
        <ModalFooter>
          <button
            onClick={handleCancel}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-50 dark:hover:bg-neutral-700',
              'focus:outline-none focus:ring-2 focus:ring-brand-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              variant === 'danger' ? [
                'bg-error-600 hover:bg-error-700',
                'text-white',
                'focus:ring-error-500'
              ] : [
                'bg-brand-600 hover:bg-brand-700',
                'text-white',
                'focus:ring-brand-500'
              ]
            )}
          >
            {loading ? 'Loading...' : confirmLabel}
          </button>
        </ModalFooter>
      </Modal>
    )
  }
)

ConfirmationModal.displayName = 'ConfirmationModal'

// Export utility functions
export const getModalSize = (size: keyof typeof modalSizes) => {
  return modalSizes[size]
}

export const getModalVariant = (variant: keyof typeof modalVariants) => {
  return modalVariants[variant]
}