/**
 * Income Clarity Design System - Forms Components Index
 * 
 * Central export for all form-related components.
 * These components provide enhanced form functionality with validation and accessibility.
 */

// Enhanced Input Components
export { 
  TextField, 
  CurrencyField, 
  PercentageField, 
  PhoneField, 
  SSNField, 
  EmailField, 
  PasswordField, 
  SearchField,
  type TextFieldProps 
} from './TextField'

export { 
  Select, 
  type SelectProps, 
  type SelectOption, 
  getSelectVariant, 
  getSelectSize 
} from './Select'

// Choice Components
export { 
  Checkbox, 
  CheckboxGroup, 
  type CheckboxProps, 
  getCheckboxVariant, 
  getCheckboxSize 
} from './Checkbox'

export { 
  Radio, 
  RadioGroup, 
  type RadioProps, 
  type RadioOption, 
  type RadioGroupProps,
  getRadioVariant, 
  getRadioSize 
} from './Radio'

// Layout Components
export { 
  FormGroup, 
  FormSection, 
  FormRow, 
  FormGrid, 
  FormField,
  type FormGroupProps, 
  type FormSectionProps, 
  type FormRowProps, 
  type FormGridProps, 
  type FormFieldProps,
  getFormGroupVariant, 
  getFormGroupSize 
} from './FormGroup'

// Re-export core Input for convenience
export { Input, type InputProps } from '../core/Input'

// Common form types
export type FormSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type FormVariant = 'default' | 'filled' | 'outline' | 'flushed' | 'unstyled'
export type FormState = 'default' | 'error' | 'success' | 'warning'
export type FormOrientation = 'horizontal' | 'vertical'