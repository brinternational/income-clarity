/**
 * Income Clarity Design System - Feedback Components Index
 * 
 * Central export for all feedback components.
 * These components provide user feedback for various states and actions.
 */

// Toast Components
export { 
  Toast, 
  ToastContainer, 
  ToastProvider, 
  toast,
  type ToastProps, 
  type ToastContainerProps, 
  type ToastProviderProps, 
  type ToastOptions,
  getToastVariant, 
  getToastPosition 
} from './Toast'

// Modal Components
export { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ConfirmationModal,
  type ModalProps, 
  type ModalHeaderProps, 
  type ModalBodyProps, 
  type ModalFooterProps, 
  type ConfirmationModalProps,
  getModalSize, 
  getModalVariant 
} from './Modal'

// Loading Components
export { 
  Spinner, 
  LoadingOverlay, 
  DotsSpinner, 
  PulseSpinner,
  type SpinnerProps, 
  type LoadingOverlayProps, 
  type DotsSpinnerProps,
  getSpinnerVariant, 
  getSpinnerSize 
} from './Spinner'

// Progress Components
export { 
  Progress, 
  CircularProgress, 
  StepProgress,
  type ProgressProps, 
  type CircularProgressProps, 
  type StepProgressProps,
  getProgressVariant, 
  getProgressSize 
} from './Progress'

// Common feedback types
export type FeedbackVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type FeedbackSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type FeedbackState = 'loading' | 'success' | 'error' | 'idle'