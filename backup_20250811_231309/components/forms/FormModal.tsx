'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl'
};

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}: FormModalProps) {
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm"
          onClick={handleOverlayClick}
        />
        
        {/* Modal */}
        <div className={`
          relative inline-block w-full ${maxWidthClasses[maxWidth]} 
          overflow-hidden text-left align-middle transition-all transform 
          bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-xl rounded-xl
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-slate-300">
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-4 -mr-2"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {/* Content */}
          <div className="px-6 pb-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing modal state
 */
export function useModal(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
}
