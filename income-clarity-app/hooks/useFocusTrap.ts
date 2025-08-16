import { useEffect, useRef, useState } from 'react';

export function useFocusTrap() {
  const ref = useRef<HTMLElement>(null);
  const [isActive, setIsActive] = useState(false);
  
  const activate = (element?: HTMLElement, options?: any) => {
    setIsActive(true);
    if (element || ref.current) {
      const el = element || ref.current;
      const focusableElements = el?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements?.[0] as HTMLElement;
      firstFocusable?.focus();
    }
  };
  
  useEffect(() => {
    if (!ref.current || !isActive) return;
    
    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();
    
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
  
  return Object.assign(ref, { isActive, activate });
}