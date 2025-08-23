'use client';

import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  onPasswordToggle?: () => void;
  showPassword?: boolean;
  variant?: 'default' | 'currency' | 'number';
  // Accessibility props
  label?: string;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    error = false, 
    leftIcon, 
    rightIcon,
    showPasswordToggle = false,
    onPasswordToggle,
    showPassword = false,
    variant = 'default',
    type = 'text',
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
      placeholder:text-muted-foreground text-white
    `;
    
    const variantClasses = {
      default: '',
      currency: 'font-mono tabular-nums',
      number: 'font-mono tabular-nums text-right'
    };
    
    const errorClasses = error 
      ? 'border-red-400/50 bg-red-500/10 backdrop-blur focus:ring-red-400/50 focus:border-red-400/50'
      : 'border-white/20 bg-white/10 backdrop-blur hover:border-white/30';
    
    const paddingClasses = leftIcon && rightIcon
      ? 'pl-10 pr-10'
      : leftIcon
      ? 'pl-10 pr-4'
      : rightIcon || showPasswordToggle
      ? 'pl-4 pr-10'
      : 'px-4';
    
    const inputType = showPasswordToggle 
      ? (showPassword ? 'text' : 'password')
      : type;
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error && errorMessage ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    
    return (
      <div className="relative">
        {label && (
          <label 
            htmlFor={inputId}
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
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}
        
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`
              ${baseClasses}
              ${variantClasses[variant]}
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
          />
        
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onPasswordToggle}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors touch-target"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          )}
        
          {rightIcon && !showPasswordToggle && (
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && errorMessage && (
          <p 
            id={errorId}
            data-testid={`${inputId}-error`}
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

Input.displayName = 'Input';
