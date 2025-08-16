'use client';

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className = '', 
    error = false, 
    resize = 'vertical',
    ...props 
  }, ref) => {
    const baseClasses = `
      w-full px-4 py-3 border rounded-lg transition-all duration-200
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      placeholder:text-gray-400
    `;
    
    const errorClasses = error 
      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 bg-white hover:border-gray-400';
    
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };
    
    return (
      <textarea
        ref={ref}
        className={`
          ${baseClasses}
          ${errorClasses}
          ${resizeClasses[resize]}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
