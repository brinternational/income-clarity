'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  leftIcon?: React.ReactNode;
  // Accessibility props
  label?: string;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className = '', 
    error = false, 
    leftIcon,
    options,
    placeholder,
    label,
    errorMessage,
    helperText,
    required = false,
    id,
    ...props 
  }, ref) => {
    const baseClasses = `
      w-full px-4 py-3 border rounded-lg transition-all duration-200
      focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 focus:outline-none
      disabled:bg-white/5 disabled:text-muted-foreground disabled:cursor-not-allowed
      appearance-none bg-white/10 backdrop-blur cursor-pointer text-white
    `;
    
    const errorClasses = error 
      ? 'border-red-400/50 bg-red-500/10 focus:ring-red-400/50 focus:border-red-400/50'
      : 'border-white/20 hover:border-white/30';
    
    const paddingClasses = leftIcon ? 'pl-10 pr-10' : 'pl-4 pr-10';
    
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error && errorMessage ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    
    return (
      <div>
        {label && (
          <label 
            htmlFor={selectId}
            className={`block text-sm font-medium mb-2 ${
              error ? 'text-red-400' : 'text-muted-foreground'
            }`}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
        
          <select
            ref={ref}
            id={selectId}
            className={`
              ${baseClasses}
              ${errorClasses}
              ${paddingClasses}
              ${className}
            `}
            aria-invalid={error}
            aria-describedby={[
              errorId,
              helperId
            ].filter(Boolean).join(' ') || undefined}
            required={required}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        
          <div 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          >
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        
        {error && errorMessage && (
          <p 
            id={errorId}
            className="mt-1 text-sm text-red-400 form-field-error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
        
        {helperText && (
          <p 
            id={helperId}
            className="mt-1 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
