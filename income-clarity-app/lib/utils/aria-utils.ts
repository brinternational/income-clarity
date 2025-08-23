/**
 * ARIA UTILITIES
 * Enhanced ARIA support for better screen reader compatibility
 */

export class ARIAUtils {
  /**
   * Announce message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  /**
   * Create accessible loading state
   */
  static setLoadingState(element: HTMLElement, isLoading: boolean, message?: string): void {
    if (isLoading) {
      element.setAttribute('aria-busy', 'true');
      if (message) {
        element.setAttribute('aria-label', message);
      }
      this.announce(`Loading: ${message || 'Content'}`);
    } else {
      element.removeAttribute('aria-busy');
      element.removeAttribute('aria-label');
      this.announce('Loading complete');
    }
  }
  
  /**
   * Create accessible error state
   */
  static setErrorState(element: HTMLElement, hasError: boolean, errorMessage?: string): void {
    if (hasError) {
      element.setAttribute('aria-invalid', 'true');
      if (errorMessage) {
        const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;
        element.setAttribute('aria-describedby', errorId);
        
        let errorElement = document.getElementById(errorId);
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.id = errorId;
          errorElement.className = 'error-message';
          errorElement.setAttribute('role', 'alert');
          element.parentNode?.insertBefore(errorElement, element.nextSibling);
        }
        errorElement.textContent = errorMessage;
        
        this.announce(`Error: ${errorMessage}`, 'assertive');
      }
    } else {
      element.removeAttribute('aria-invalid');
      const describedById = element.getAttribute('aria-describedby');
      if (describedById) {
        const errorElement = document.getElementById(describedById);
        if (errorElement) {
          errorElement.remove();
        }
        element.removeAttribute('aria-describedby');
      }
    }
  }
  
  /**
   * Create accessible expanded/collapsed state
   */
  static setExpandedState(trigger: HTMLElement, target: HTMLElement, isExpanded: boolean): void {
    trigger.setAttribute('aria-expanded', String(isExpanded));
    target.setAttribute('aria-hidden', String(!isExpanded));
    
    if (!trigger.getAttribute('aria-controls')) {
      const targetId = target.id || `panel-${Math.random().toString(36).substr(2, 9)}`;
      target.id = targetId;
      trigger.setAttribute('aria-controls', targetId);
    }
    
    this.announce(`${trigger.textContent || 'Section'} ${isExpanded ? 'expanded' : 'collapsed'}`);
  }
  
  /**
   * Create accessible tab interface
   */
  static setupTabInterface(tabList: HTMLElement): void {
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]')) as HTMLElement[];
    const panels = Array.from(document.querySelectorAll('[role="tabpanel"]')) as HTMLElement[];
    
    tabs.forEach((tab, index) => {
      tab.setAttribute('tabindex', '0');
      tab.addEventListener('keydown', (e) => {
        let targetTab: HTMLElement | null = null;
        
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            targetTab = tabs[index + 1] || tabs[0];
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            targetTab = tabs[index - 1] || tabs[tabs.length - 1];
            break;
          case 'Home':
            e.preventDefault();
            targetTab = tabs[0];
            break;
          case 'End':
            e.preventDefault();
            targetTab = tabs[tabs.length - 1];
            break;
        }
        
        if (targetTab) {
          this.activateTab(targetTab, tabs, panels);
        }
      });
      
      tab.addEventListener('click', () => {
        this.activateTab(tab, tabs, panels);
      });
    });
  }
  
  private static activateTab(activeTab: HTMLElement, allTabs: HTMLElement[], allPanels: HTMLElement[]): void {
    // Update tab states
    allTabs.forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });
    
    activeTab.setAttribute('aria-selected', 'true');
    activeTab.setAttribute('tabindex', '0');
    activeTab.focus();
    
    // Update panel visibility
    const activeIndex = allTabs.indexOf(activeTab);
    allPanels.forEach((panel, index) => {
      panel.setAttribute('aria-hidden', String(index !== activeIndex));
      if (index === activeIndex) {
        panel.style.display = '';
      } else {
        panel.style.display = 'none';
      }
    });
    
    this.announce(`Tab ${activeTab.textContent} selected`);
  }
  
  /**
   * Create accessible menu
   */
  static setupMenu(menuButton: HTMLElement, menu: HTMLElement): void {
    const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    let currentIndex = -1;
    
    menuButton.addEventListener('click', () => {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      this.setExpandedState(menuButton, menu, !isExpanded);
      
      if (!isExpanded) {
        currentIndex = 0;
        menuItems[0]?.focus();
      }
    });
    
    menu.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          currentIndex = Math.min(currentIndex + 1, menuItems.length - 1);
          menuItems[currentIndex]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          currentIndex = Math.max(currentIndex - 1, 0);
          menuItems[currentIndex]?.focus();
          break;
        case 'Home':
          e.preventDefault();
          currentIndex = 0;
          menuItems[currentIndex]?.focus();
          break;
        case 'End':
          e.preventDefault();
          currentIndex = menuItems.length - 1;
          menuItems[currentIndex]?.focus();
          break;
        case 'Escape':
          e.preventDefault();
          this.setExpandedState(menuButton, menu, false);
          menuButton.focus();
          break;
      }
    });
  }
  
  /**
   * Add live region for dynamic content updates
   */
  static createLiveRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
    let liveRegion = document.getElementById(id);
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = id;
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    return liveRegion;
  }
  
  /**
   * Update live region content
   */
  static updateLiveRegion(id: string, message: string): void {
    const liveRegion = document.getElementById(id);
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
}

// Create global live regions
document.addEventListener('DOMContentLoaded', () => {
  ARIAUtils.createLiveRegion('status-messages', 'polite');
  ARIAUtils.createLiveRegion('error-messages', 'assertive');
});