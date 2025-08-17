/**
 * Income Clarity Design System - Select Component
 * 
 * Unified select dropdown component with consistent styling,
 * accessibility features, and support for various states.
 */

'use client'

import React, { forwardRef, useState } from 'react'
import { ChevronDown, Check, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Select variants matching Input component
const selectVariants = {
  default: [
    'border-neutral-300 bg-white',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'hover:border-neutral-400',
    'dark:border-neutral-600 dark:bg-neutral-800',
    'dark:focus:border-brand-400 dark:focus:ring-brand-400/20',
    'dark:hover:border-neutral-500'
  ].join(' '),

  filled: [
    'border-transparent bg-neutral-100',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
    'focus:bg-white',
    'hover:bg-neutral-50',
    'dark:bg-neutral-700 dark:hover:bg-neutral-600',
    'dark:focus:bg-neutral-800 dark:focus:border-brand-400'
  ].join(' '),

  flushed: [
    'border-0 border-b-2 border-neutral-300 bg-transparent rounded-none',
    'focus:border-brand-500 focus:ring-0',
    'hover:border-neutral-400',
    'dark:border-neutral-600 dark:hover:border-neutral-500',
    'dark:focus:border-brand-400'
  ].join(' '),

  unstyled: [
    'border-0 bg-transparent p-0 focus:ring-0'
  ].join(' ')
}

// Select sizes
const selectSizes = {
  xs: 'px-2 py-1 text-xs min-h-[24px]',
  sm: 'px-3 py-2 text-sm min-h-[32px]',
  md: 'px-4 py-3 text-sm min-h-[40px]',
  lg: 'px-4 py-4 text-base min-h-[48px]',
  xl: 'px-6 py-5 text-lg min-h-[56px]',
}

// Option interface
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
  description?: string
  icon?: React.ReactNode
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: keyof typeof selectVariants
  size?: keyof typeof selectSizes
  // Options
  options?: SelectOption[]
  placeholder?: string
  // Enhanced features
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  // Form integration
  label?: string
  helperText?: string
  errorMessage?: string
  successMessage?: string
  required?: boolean
  optional?: boolean
  // Native select mode
  native?: boolean
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
  // Callbacks
  onSelectionChange?: (value: string | string[] | null) => void
  onSearchChange?: (searchTerm: string) => void
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    options = [],
    placeholder = 'Select an option...',
    searchable = false,
    clearable = false,
    multiple = false,
    native = false,
    label,
    helperText,
    errorMessage,
    successMessage,
    required = false,
    optional = false,
    ariaLabel,
    ariaDescribedBy,
    value,
    defaultValue,
    disabled,
    onChange,
    onSelectionChange,
    onSearchChange,
    id,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedValues, setSelectedValues] = useState<string[]>(() => {
      if (multiple) {
        if (Array.isArray(value)) return value.map(String)
        if (Array.isArray(defaultValue)) return defaultValue.map(String)
        return []
      } else {
        if (value !== undefined) return [String(value)]
        if (defaultValue !== undefined) return [String(defaultValue)]
        return []
      }
    })

    // Auto-generate ID if not provided
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    
    // Generate helper IDs
    const helperTextId = helperText ? `${selectId}-helper` : undefined
    const errorId = errorMessage ? `${selectId}-error` : undefined
    const successId = successMessage ? `${selectId}-success` : undefined

    // Determine current state
    const currentState = errorMessage ? 'error' 
      : successMessage ? 'success' 
      : 'default'

    // Filter options based on search
    const filteredOptions = React.useMemo(() => {
      if (!searchable || !searchTerm) return options

      return options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [options, searchTerm, searchable])

    // Group options
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, SelectOption[]> = {}
      const ungrouped: SelectOption[] = []

      filteredOptions.forEach(option => {
        if (option.group) {
          if (!groups[option.group]) groups[option.group] = []
          groups[option.group].push(option)
        } else {
          ungrouped.push(option)
        }
      })

      return { groups, ungrouped }
    }, [filteredOptions])

    // Handle selection
    const handleSelect = (optionValue: string) => {
      let newSelection: string[]

      if (multiple) {
        newSelection = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue]
      } else {
        newSelection = [optionValue]
        setIsOpen(false)
      }

      setSelectedValues(newSelection)
      
      // Call callbacks
      const returnValue = multiple ? newSelection : (newSelection[0] || null)
      onSelectionChange?.(returnValue)

      // Create synthetic event for onChange
      if (onChange) {
        const syntheticEvent = {
          target: { value: multiple ? newSelection : newSelection[0] || '' }
        } as React.ChangeEvent<HTMLSelectElement>
        onChange(syntheticEvent)
      }
    }

    // Handle clear
    const handleClear = () => {
      setSelectedValues([])
      onSelectionChange?.(multiple ? [] : null)
      
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' }
        } as React.ChangeEvent<HTMLSelectElement>
        onChange(syntheticEvent)
      }
    }

    // Handle search
    const handleSearch = (term: string) => {
      setSearchTerm(term)
      onSearchChange?.(term)
    }

    // Get display text
    const getDisplayText = () => {
      if (selectedValues.length === 0) return placeholder

      if (multiple) {
        if (selectedValues.length === 1) {
          const option = options.find(opt => String(opt.value) === selectedValues[0])
          return option?.label || selectedValues[0]
        }
        return `${selectedValues.length} items selected`
      } else {
        const option = options.find(opt => String(opt.value) === selectedValues[0])
        return option?.label || selectedValues[0]
      }
    }

    // Base classes
    const baseClasses = cn(
      'w-full border rounded-lg transition-all duration-200',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'disabled:bg-neutral-50 dark:disabled:bg-neutral-800',
      'text-neutral-900 dark:text-neutral-100'
    )

    // State classes
    const stateClasses = {
      default: '',
      error: [
        'border-error-500 bg-error-50',
        'focus:border-error-500 focus:ring-error-500/20',
        'dark:bg-error-900/20 dark:border-error-600'
      ].join(' '),
      success: [
        'border-success-500 bg-success-50',
        'focus:border-success-500 focus:ring-success-500/20',
        'dark:bg-success-900/20 dark:border-success-600'
      ].join(' ')
    }

    // Size classes
    const sizeClasses = selectSizes[size]

    // Combine classes
    const selectClasses = cn(
      baseClasses,
      selectVariants[variant],
      stateClasses[currentState],
      sizeClasses,
      'cursor-pointer appearance-none pr-10',
      className
    )

    // Native select fallback
    if (native) {
      return (
        <div className="w-full">
          {label && (
            <label 
              htmlFor={selectId}
              className={cn(
                'block text-sm font-medium mb-2',
                currentState === 'error' ? 'text-error-600 dark:text-error-400' : 
                currentState === 'success' ? 'text-success-600 dark:text-success-400' :
                'text-neutral-700 dark:text-neutral-300'
              )}
            >
              {label}
              {required && (
                <span className="text-error-500 ml-1" aria-label="required">*</span>
              )}
              {optional && (
                <span className="text-neutral-400 ml-1 font-normal">(optional)</span>
              )}
            </label>
          )}

          <div className="relative">
            <select
              ref={ref}
              id={selectId}
              className={selectClasses}
              disabled={disabled}
              aria-label={ariaLabel}
              aria-describedby={cn(
                helperTextId,
                errorId,
                successId,
                ariaDescribedBy
              ).trim() || undefined}
              aria-invalid={currentState === 'error'}
              aria-required={required}
              value={selectedValues[0] || ''}
              onChange={(e) => handleSelect(e.target.value)}
              {...props}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                <optgroup key={groupName} label={groupName}>
                  {groupOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              {groupedOptions.ungrouped.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {/* Chevron Icon */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            </div>
          </div>

          {/* Helper/Error Text */}
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
      )
    }

    // Custom select implementation
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className={cn(
              'block text-sm font-medium mb-2',
              currentState === 'error' ? 'text-error-600 dark:text-error-400' : 
              currentState === 'success' ? 'text-success-600 dark:text-success-400' :
              'text-neutral-700 dark:text-neutral-300'
            )}
          >
            {label}
            {required && (
              <span className="text-error-500 ml-1" aria-label="required">*</span>
            )}
            {optional && (
              <span className="text-neutral-400 ml-1 font-normal">(optional)</span>
            )}
          </label>
        )}

        <div className="relative">
          {/* Select Button */}
          <button
            type="button"
            id={selectId}
            className={cn(
              selectClasses,
              'flex items-center justify-between text-left'
            )}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={cn(
              helperTextId,
              errorId,
              successId,
              ariaDescribedBy
            ).trim() || undefined}
            aria-invalid={currentState === 'error'}
            aria-required={required}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={cn(
              'truncate',
              selectedValues.length === 0 && 'text-neutral-400 dark:text-neutral-500'
            )}>
              {getDisplayText()}
            </span>

            <div className="flex items-center gap-1">
              {clearable && selectedValues.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
                  aria-label="Clear selection"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <ChevronDown 
                className={cn(
                  'w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform',
                  isOpen && 'rotate-180'
                )} 
              />
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className={cn(
              'absolute z-50 w-full mt-1',
              'bg-white dark:bg-neutral-800',
              'border border-neutral-200 dark:border-neutral-700',
              'rounded-lg shadow-lg',
              'max-h-60 overflow-auto'
            )}>
              {/* Search */}
              {searchable && (
                <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-sm"
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="py-1">
                {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                  <div key={groupName}>
                    <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-700">
                      {groupName}
                    </div>
                    {groupOptions.map((option) => (
                      <OptionItem
                        key={option.value}
                        option={option}
                        selected={selectedValues.includes(String(option.value))}
                        multiple={multiple}
                        onClick={() => handleSelect(String(option.value))}
                      />
                    ))}
                  </div>
                ))}
                
                {groupedOptions.ungrouped.map((option) => (
                  <OptionItem
                    key={option.value}
                    option={option}
                    selected={selectedValues.includes(String(option.value))}
                    multiple={multiple}
                    onClick={() => handleSelect(String(option.value))}
                  />
                ))}

                {filteredOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                    No options found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Click outside to close */}
          {isOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </div>

        {/* Helper/Error Text */}
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
    )
  }
)

Select.displayName = 'Select'

// Option item component
interface OptionItemProps {
  option: SelectOption
  selected: boolean
  multiple: boolean
  onClick: () => void
}

const OptionItem: React.FC<OptionItemProps> = ({ option, selected, multiple, onClick }) => {
  return (
    <button
      type="button"
      className={cn(
        'w-full px-3 py-2 text-left flex items-center gap-2',
        'hover:bg-neutral-100 dark:hover:bg-neutral-700',
        'focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700',
        selected && 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300',
        option.disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={option.disabled}
      onClick={onClick}
      role="option"
      aria-selected={selected}
    >
      {multiple && (
        <div className={cn(
          'w-4 h-4 border-2 rounded flex items-center justify-center',
          selected ? 'bg-brand-500 border-brand-500' : 'border-neutral-300 dark:border-neutral-600'
        )}>
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
      )}
      
      {option.icon && (
        <span className="flex-shrink-0">{option.icon}</span>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="font-medium">{option.label}</div>
        {option.description && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {option.description}
          </div>
        )}
      </div>
      
      {!multiple && selected && (
        <Check className="w-4 h-4 text-brand-500" />
      )}
    </button>
  )
}

// Export utility functions
export const getSelectVariant = (variant: keyof typeof selectVariants) => {
  return selectVariants[variant]
}

export const getSelectSize = (size: keyof typeof selectSizes) => {
  return selectSizes[size]
}