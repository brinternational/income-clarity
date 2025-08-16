'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Button } from '@/components/forms/Button';
import { liveRegionManager } from '@/utils/accessibility';

export interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  initialFocus?: React.RefObject<HTMLElement>;
  finalFocus?: React.RefObject<HTMLElement>;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  initialFocus,
  finalFocus,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `modal-desc-${Math.random().toString(36).substr(2, 9)}` : undefined;
  
  // Setup focus trap
  const focusTrap = useFocusTrap();
  const { isActive } = focusTrap;
  
  // Size configurations
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };
  
  // Announce modal state to screen readers
  useEffect(() => {
    if (isOpen) {
      liveRegionManager.announce(`Dialog opened: ${title}`, 'polite');
    }
  }, [isOpen, title]);
  
  // Focus management
  useEffect(() => {
    if (isOpen && initialFocus?.current) {
      const timer = setTimeout(() => {
        initialFocus.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialFocus]);
  
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('aria-hidden', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity modal-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`
            relative w-full ${sizeClasses[size]} 
            transform rounded-xl shadow-xl transition-all
            modal-content focus-trap-active
            ${className}
          `}
          style={{
            backgroundColor: 'var(--color-primary)',
            border: '1px solid var(--color-border)',
          }}
          role="document"
        >
          {/* Modal Header */}
          <header className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex-1 pr-4">
              <h1
                id={titleId}
                className="text-xl font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                {title}
              </h1>
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                ariaLabel="Close dialog"
                className="flex-shrink-0 p-2"
              >
                <X className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </header>
          
          {/* Modal Body */}
          <main className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AccessibleModal;