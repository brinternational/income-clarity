'use client';

import React, { forwardRef } from 'react';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  // Accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ 
    className = '', 
    label,
    description,
    size = 'md',
    id,
    ariaLabel,
    ariaDescribedBy,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: {
        container: 'w-8 h-5',
        circle: 'w-3 h-3',
        translate: 'translate-x-3'
      },
      md: {
        container: 'w-11 h-6',
        circle: 'w-4 h-4',
        translate: 'translate-x-5'
      },
      lg: {
        container: 'w-14 h-8',
        circle: 'w-6 h-6',
        translate: 'translate-x-6'
      }
    };
    
    const sizeConfig = sizeClasses[size];
    
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
    const descId = description ? `${toggleId}-description` : undefined;
    
    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            className="sr-only peer"
            aria-label={ariaLabel || label}
            aria-describedby={[
              ariaDescribedBy,
              descId
            ].filter(Boolean).join(' ') || undefined}
            role="switch"
            aria-checked={props.checked}
            {...props}
          />
          <div 
            className={`
              ${sizeConfig.container} bg-gray-200 rounded-full 
              peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
              transition-colors duration-200 cursor-pointer touch-target
              peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            `}
            role="presentation"
            aria-hidden="true"
          >
            <div 
              className={`
                ${sizeConfig.circle} bg-white rounded-full shadow-md
                transform transition-transform duration-200 ease-in-out
                peer-checked:${sizeConfig.translate}
                absolute top-1/2 left-1 -translate-y-1/2
              `}
              aria-hidden="true"
            />
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label 
                htmlFor={toggleId} 
                className="block text-sm font-medium text-gray-900 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p 
                id={descId}
                className="text-sm text-gray-500 mt-1"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
