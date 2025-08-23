/**
 * FOCUS MANAGEMENT UTILITIES
 * Enhanced focus management for better accessibility
 */

export class FocusManager {
  private static focusStack: HTMLElement[] = [];
  private static isTrapping = false;
  
  /**
   * Trap focus within a container
   */
  static trapFocus(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    this.isTrapping = true;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab: Moving backwards
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab: Moving forwards  
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        this.releaseFocusTrap();
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    container.setAttribute('data-focus-trap-active', 'true');
    
    // Focus the first element
    firstFocusable.focus();
    
    // Store cleanup function
    (container as any)._focusTrapCleanup = () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeAttribute('data-focus-trap-active');
      this.isTrapping = false;
    };
  }
  
  /**
   * Release focus trap
   */
  static releaseFocusTrap(): void {
    const trapContainer = document.querySelector('[data-focus-trap-active="true"]');
    if (trapContainer) {
      const cleanup = (trapContainer as any)._focusTrapCleanup;
      if (cleanup) cleanup();
      
      // Return focus to the element that opened the trap
      const returnElement = this.focusStack.pop();
      if (returnElement && returnElement.isConnected) {
        returnElement.focus();
      }
    }
  }
  
  /**
   * Store current focus to return to later
   */
  static storeFocus(): void {
    if (document.activeElement && document.activeElement !== document.body) {
      this.focusStack.push(document.activeElement as HTMLElement);
    }
  }
  
  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="tab"]'
    ].join(',');
    
    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => this.isVisible(el as HTMLElement)) as HTMLElement[];
  }
  
  /**
   * Check if element is visible and can receive focus
   */
  private static isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetParent !== null
    );
  }
  
  /**
   * Enhanced focus indicator for programmatic focus
   */
  static enhanceFocus(element: HTMLElement): void {
    element.classList.add('enhanced-focus');
    element.addEventListener('blur', () => {
      element.classList.remove('enhanced-focus');
    }, { once: true });
  }
  
  /**
   * Skip to main content
   */
  static skipToMain(): void {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus({ preventScroll: false });
      (mainContent as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  /**
   * Skip to navigation
   */
  static skipToNavigation(): void {
    const navigation = document.querySelector('nav, [role="navigation"], #main-nav');
    if (navigation) {
      const firstFocusable = this.getFocusableElements(navigation as HTMLElement)[0];
      if (firstFocusable) {
        firstFocusable.focus();
        firstFocusable.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Alt + M: Skip to main content
  if (e.altKey && e.key === 'm') {
    e.preventDefault();
    FocusManager.skipToMain();
  }
  
  // Alt + N: Skip to navigation
  if (e.altKey && e.key === 'n') {
    e.preventDefault();
    FocusManager.skipToNavigation();
  }
  
  // Escape: Close modal/trap focus
  if (e.key === 'Escape') {
    FocusManager.releaseFocusTrap();
  }
});

// CSS for enhanced focus indicators
const focusStyles = `
.enhanced-focus {
  outline: 3px solid #00d4aa !important;
  outline-offset: 2px !important;
  border-radius: 6px !important;
  box-shadow: 0 0 0 6px rgba(0, 212, 170, 0.2) !important;
}

[data-focus-trap-active="true"] {
  position: relative;
}

[data-focus-trap-active="true"]::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  pointer-events: none;
}
`;

// Inject styles
if (!document.getElementById('focus-manager-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'focus-manager-styles';
  styleSheet.textContent = focusStyles;
  document.head.appendChild(styleSheet);
}