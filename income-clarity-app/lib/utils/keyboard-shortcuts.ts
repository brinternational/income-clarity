/**
 * KEYBOARD SHORTCUTS SYSTEM
 * Enhanced keyboard navigation and shortcuts
 */

export class KeyboardShortcuts {
  private static shortcuts: Map<string, () => void> = new Map();
  private static isActive = true;
  
  static init(): void {
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Register default shortcuts
    this.register('Alt+m', () => this.skipToMain());
    this.register('Alt+n', () => this.skipToNavigation());
    this.register('Alt+h', () => this.toggleHighContrast());
    this.register('Alt+f', () => this.focusSearch());
    this.register('Alt+?', () => this.showHelp());
    this.register('Escape', () => this.closeModal());
  }
  
  static register(combination: string, callback: () => void): void {
    this.shortcuts.set(combination.toLowerCase(), callback);
  }
  
  static unregister(combination: string): void {
    this.shortcuts.delete(combination.toLowerCase());
  }
  
  private static handleKeydown(e: KeyboardEvent): void {
    if (!this.isActive) return;
    
    const combination = this.getCombination(e);
    const callback = this.shortcuts.get(combination);
    
    if (callback) {
      e.preventDefault();
      callback();
    }
  }
  
  private static getCombination(e: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Meta');
    
    if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
      parts.push(e.key);
    }
    
    return parts.join('+').toLowerCase();
  }
  
  private static skipToMain(): void {
    const main = document.querySelector('#main-content, main, [role="main"]');
    if (main) {
      (main as HTMLElement).focus();
      (main as HTMLElement).scrollIntoView({ behavior: 'smooth' });
      this.announce('Skipped to main content');
    }
  }
  
  private static skipToNavigation(): void {
    const nav = document.querySelector('#main-navigation, nav, [role="navigation"]');
    if (nav) {
      const firstFocusable = nav.querySelector('button, a, [tabindex="0"]') as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
        firstFocusable.scrollIntoView({ behavior: 'smooth' });
        this.announce('Skipped to navigation');
      }
    }
  }
  
  private static toggleHighContrast(): void {
    document.documentElement.classList.toggle('high-contrast');
    const isEnabled = document.documentElement.classList.contains('high-contrast');
    this.announce(`High contrast mode ${isEnabled ? 'enabled' : 'disabled'}`);
  }
  
  private static focusSearch(): void {
    const search = document.querySelector('#search, [role="search"], input[type="search"]') as HTMLElement;
    if (search) {
      search.focus();
      search.scrollIntoView({ behavior: 'smooth' });
      this.announce('Focused search');
    }
  }
  
  private static showHelp(): void {
    const helpText = `
Available keyboard shortcuts:
- Alt+M: Skip to main content
- Alt+N: Skip to navigation  
- Alt+H: Toggle high contrast
- Alt+F: Focus search
- Alt+?: Show this help
- Escape: Close modal/menu
- Tab: Navigate forward
- Shift+Tab: Navigate backward
    `;
    
    alert(helpText); // Simple implementation - could be enhanced with a proper modal
    this.announce('Keyboard shortcuts help displayed');
  }
  
  private static closeModal(): void {
    const modal = document.querySelector('[role="dialog"], .modal-open, [data-modal-open]');
    if (modal) {
      const closeButton = modal.querySelector('[data-close], .close-button, .modal-close') as HTMLElement;
      if (closeButton) {
        closeButton.click();
        this.announce('Modal closed');
      }
    }
  }
  
  private static announce(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  static enable(): void {
    this.isActive = true;
  }
  
  static disable(): void {
    this.isActive = false;
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => KeyboardShortcuts.init());
  } else {
    KeyboardShortcuts.init();
  }
}