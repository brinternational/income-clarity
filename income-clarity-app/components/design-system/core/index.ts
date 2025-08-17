/**
 * Income Clarity Design System - Core Components Index
 * 
 * Central export for all core atomic components.
 * These are the building blocks of the design system.
 */

// Core Components
export { 
  Button, 
  type ButtonProps, 
  getButtonVariant, 
  getButtonSize 
} from './Button'

export { 
  Input, 
  type InputProps, 
  getInputVariant, 
  getInputSize, 
  getInputState 
} from './Input'

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  type CardProps, 
  getCardVariant, 
  getCardSize, 
  getCardRadius 
} from './Card'

export { 
  Badge, 
  NotificationBadge, 
  StatusBadge,
  type BadgeProps, 
  getBadgeVariant, 
  getBadgeSize 
} from './Badge'

export { 
  Alert, 
  AlertTitle, 
  AlertDescription, 
  AlertActions,
  ToastAlert, 
  InlineAlert,
  type AlertProps, 
  type ToastAlertProps,
  getAlertVariant, 
  getAlertSize, 
  getAlertIcon 
} from './Alert'

// Re-export theme for convenience
export { theme } from '../theme'

// Component size types for consistency
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading'