// Accessibility utilities

export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  firstFocusable?.focus();
  
  return (e: KeyboardEvent) => {
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
}

export const shortcutManager = {
  register: (key: string | any, callback?: () => void) => {},
  unregister: (key: string) => {},
  startListening: () => {},
  stopListening: () => {}
};

export const liveRegionManager = {
  announce: (message: string, priority?: string) => announceToScreenReader(message)
};