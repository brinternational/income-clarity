import React from 'react';

interface AlertProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ 
  className = '', 
  children, 
  variant = 'default' 
}) => {
  const variantStyles = {
    default: 'bg-gray-50 border-gray-200 text-gray-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ 
  className = '', 
  children 
}) => {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
};