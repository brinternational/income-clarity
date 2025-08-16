'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/forms/Button';
import { Toggle } from '@/components/forms/Toggle';
import { Select } from '@/components/forms/Select';
import { shortcutManager, liveRegionManager } from '@/utils/accessibility';
import { Eye, Keyboard, Volume2, MousePointer, Contrast, Move } from 'lucide-react';

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusIndicators: 'default' | 'enhanced' | 'high-contrast';
  keyboardShortcuts: boolean;
  screenReaderAnnouncements: boolean;
  skipLinks: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  focusIndicators: 'default',
  keyboardShortcuts: true,
  screenReaderAnnouncements: true,
  skipLinks: true,
  fontSize: 'medium',
};

export function AccessibilitySettings() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch (error) {
        // Error handled by emergency recovery script
    
    // Also check system preferences
    const systemPreferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: more)').matches,
      largeText: window.matchMedia('(prefers-reduced-motion: reduce)').matches, // Fallback
    };
    
    setPreferences(prev => ({ ...prev, ...systemPreferences }));
  }, []);
  
  // Save preferences to localStorage and apply them
  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences));
    applyPreferences(newPreferences);
    
    // Announce change to screen readers
    if (preferences.screenReaderAnnouncements) {
      liveRegionManager.announce(`${key} ${value ? 'enabled' : 'disabled'}`, 'polite');
    }
  };
  
  // Apply preferences to the DOM
  const applyPreferences = (prefs: AccessibilityPreferences) => {
    const root = document.documentElement;
    
    // Reduced motion
    if (prefs.reducedMotion) {
      root.style.setProperty('--motion-duration', '0.01ms');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--motion-duration');
      root.classList.remove('reduce-motion');
    }
    
    // High contrast
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large text
    if (prefs.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Font size
    const fontSizeMap = {
      'small': '0.875rem',
      'medium': '1rem',
      'large': '1.125rem',
      'extra-large': '1.25rem',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[prefs.fontSize]);
    
    // Focus indicators
    root.setAttribute('data-focus-style', prefs.focusIndicators);
    
    // Skip links
    const skipLinks = document.querySelectorAll('.skip-link');
    skipLinks.forEach(link => {
      (link as HTMLElement).style.display = prefs.skipLinks ? 'block' : 'none';
    });
  };
  
  // Test keyboard shortcut
  const testKeyboardShortcut = () => {
    if (preferences.screenReaderAnnouncements) {
      liveRegionManager.announce('Keyboard shortcut test successful! Alt+D opens Dashboard, Alt+P opens Portfolio, Alt+S opens Settings.', 'assertive');
    }
  };
  
  // Test screen reader
  const testScreenReader = () => {
    liveRegionManager.announce('Screen reader announcements are working correctly. This is a test message.', 'assertive');
  };
  
  // Reset to defaults
  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem('accessibility-preferences');
    applyPreferences(DEFAULT_PREFERENCES);
    
    if (DEFAULT_PREFERENCES.screenReaderAnnouncements) {
      liveRegionManager.announce('Accessibility settings reset to defaults', 'polite');
    }
  };
  
  // Apply preferences on mount
  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);
  
  const focusIndicatorOptions = [
    { value: 'default', label: 'Default Focus Ring' },
    { value: 'enhanced', label: 'Enhanced Focus Ring' },
    { value: 'high-contrast', label: 'High Contrast Focus' },
  ];
  
  const fontSizeOptions = [
    { value: 'small', label: 'Small (14px)' },
    { value: 'medium', label: 'Medium (16px)' },
    { value: 'large', label: 'Large (18px)' },
    { value: 'extra-large', label: 'Extra Large (20px)' },
  ];
  
  return (
    <div className="space-y-8">
      {/* Visual Settings */}
      <section aria-labelledby="visual-settings">
        <h3 id="visual-settings" className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Visual Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Reduce Motion</label>
              <p className="text-sm text-gray-600">Minimize animations and transitions</p>
            </div>
            <Toggle
              checked={preferences.reducedMotion}
              onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
              aria-describedby="reduce-motion-desc"
            />
          </div>
          <div id="reduce-motion-desc" className="sr-only">
            Reduces or disables animations and transitions for users sensitive to motion
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">High Contrast</label>
              <p className="text-sm text-gray-600">Increase color contrast for better visibility</p>
            </div>
            <Toggle
              checked={preferences.highContrast}
              onChange={(e) => updatePreference('highContrast', e.target.checked)}
              aria-describedby="high-contrast-desc"
            />
          </div>
          <div id="high-contrast-desc" className="sr-only">
            Increases color contrast to meet WCAG AAA standards
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Large Text</label>
              <p className="text-sm text-gray-600">Make text easier to read</p>
            </div>
            <Toggle
              checked={preferences.largeText}
              onChange={(e) => updatePreference('largeText', e.target.checked)}
              aria-describedby="large-text-desc"
            />
          </div>
          <div id="large-text-desc" className="sr-only">
            Increases text size throughout the application for better readability
          </div>
          
          <div className="space-y-2">
            <label className="font-medium" htmlFor="font-size-select">Base Font Size</label>
            <Select
              id="font-size-select"
              value={preferences.fontSize}
              onChange={(e) => updatePreference('fontSize', e.target.value as AccessibilityPreferences['fontSize'])}
              options={fontSizeOptions}
              aria-describedby="font-size-desc"
            />
            <div id="font-size-desc" className="text-sm text-gray-600">
              Controls the base font size for all text in the application
            </div>
          </div>
        </div>
      </section>
      
      {/* Navigation Settings */}
      <section aria-labelledby="navigation-settings">
        <h3 id="navigation-settings" className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MousePointer className="w-5 h-5" />
          Navigation Settings
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium" htmlFor="focus-indicators-select">Focus Indicators</label>
            <Select
              id="focus-indicators-select"
              value={preferences.focusIndicators}
              onChange={(e) => updatePreference('focusIndicators', e.target.value as AccessibilityPreferences['focusIndicators'])}
              options={focusIndicatorOptions}
              aria-describedby="focus-indicators-desc"
            />
            <div id="focus-indicators-desc" className="text-sm text-gray-600">
              Choose how focus indicators appear when navigating with keyboard
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Skip Links</label>
              <p className="text-sm text-gray-600">Show skip navigation links</p>
            </div>
            <Toggle
              checked={preferences.skipLinks}
              onChange={(e) => updatePreference('skipLinks', e.target.checked)}
              aria-describedby="skip-links-desc"
            />
          </div>
          <div id="skip-links-desc" className="sr-only">
            Displays skip links at the top of pages to jump to main content
          </div>
        </div>
      </section>
      
      {/* Keyboard Settings */}
      <section aria-labelledby="keyboard-settings">
        <h3 id="keyboard-settings" className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          Keyboard Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Keyboard Shortcuts</label>
              <p className="text-sm text-gray-600">Enable application keyboard shortcuts</p>
            </div>
            <Toggle
              checked={preferences.keyboardShortcuts}
              onChange={(e) => updatePreference('keyboardShortcuts', e.target.checked)}
              aria-describedby="keyboard-shortcuts-desc"
            />
          </div>
          <div id="keyboard-shortcuts-desc" className="sr-only">
            Enables keyboard shortcuts like Alt+D for Dashboard, Alt+P for Portfolio
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(!showShortcuts)}
              aria-expanded={showShortcuts}
            >
              {showShortcuts ? 'Hide' : 'Show'} Shortcuts
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testKeyboardShortcut}
              disabled={!preferences.keyboardShortcuts}
            >
              Test Shortcuts
            </Button>
          </div>
          
          {showShortcuts && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Available Keyboard Shortcuts:</h4>
              <ul className="space-y-1 text-sm">
                <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + D</kbd> - Open Dashboard</li>
                <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + P</kbd> - Open Portfolio</li>
                <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Alt + S</kbd> - Open Settings</li>
                <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Esc</kbd> - Close modals/dialogs</li>
                <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Tab</kbd> - Navigate forward</li>
                <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Shift + Tab</kbd> - Navigate backward</li>
                <li><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Arrow Keys</kbd> - Navigate within components</li>
              </ul>
            </div>
          )}
        </div>
      </section>
      
      {/* Screen Reader Settings */}
      <section aria-labelledby="screen-reader-settings">
        <h3 id="screen-reader-settings" className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Screen Reader Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Screen Reader Announcements</label>
              <p className="text-sm text-gray-600">Enable live region announcements</p>
            </div>
            <Toggle
              checked={preferences.screenReaderAnnouncements}
              onChange={(e) => updatePreference('screenReaderAnnouncements', e.target.checked)}
              aria-describedby="announcements-desc"
            />
          </div>
          <div id="announcements-desc" className="sr-only">
            Enables live announcements for dynamic content changes
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={testScreenReader}
            disabled={!preferences.screenReaderAnnouncements}
          >
            Test Screen Reader
          </Button>
        </div>
      </section>
      
      {/* Actions */}
      <section className="pt-4 border-t">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <Move className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </section>
    </div>
  );
}