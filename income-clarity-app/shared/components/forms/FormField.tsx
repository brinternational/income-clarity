'use client';

import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  hintClassName?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    label, 
    error, 
    hint, 
    required = false, 
    children, 
    className = '', 
    labelClassName = '',
    errorClassName = '',
    hintClassName = ''
  }, ref) => {
    return (
      <div ref={ref} className={`space-y-2 ${className}`}>
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {children}
        
        {hint && !error && (
          <p className={`text-xs text-gray-500 ${hintClassName}`}>
            {hint}
          </p>
        )}
        
        {error && (
          <div className={`flex items-center gap-2 text-xs text-red-600 ${errorClassName}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
