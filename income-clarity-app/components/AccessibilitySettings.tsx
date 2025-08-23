'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './design-system/core/Card';
import { Button } from './design-system/core/Button';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  focusIndicators: 'standard' | 'enhanced' | 'high-contrast';
  announcements: boolean;
}

export function AccessibilitySettings() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    focusIndicators: 'standard',
    announcements: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('accessibility-preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
    }
  }, []);

  // Apply accessibility preferences to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Reduce motion
    if (preferences.reduceMotion) {
      root.style.setProperty('--animation-duration', '0ms');
      root.style.setProperty('--transition-duration', '0ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // High contrast mode
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (preferences.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Screen reader optimizations
    if (preferences.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }

    // Focus indicators
    root.classList.remove('focus-standard', 'focus-enhanced', 'focus-high-contrast');
    root.classList.add(`focus-${preferences.focusIndicators}`);

  }, [preferences]);

  const updatePreference = (key: keyof AccessibilityPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = () => {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
      setHasChanges(false);
      
      // Announce to screen readers
      if (preferences.announcements) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = 'Accessibility preferences saved successfully';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }
    } catch (error) {
      console.error('Failed to save accessibility preferences:', error);
    }
  };

  const resetToDefaults = () => {
    setPreferences({
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      screenReaderOptimized: false,
      keyboardNavigation: true,
      focusIndicators: 'standard',
      announcements: true
    });
    setHasChanges(true);
  };

  return (
    <section 
      aria-labelledby="accessibility-settings-title"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 
          id="accessibility-settings-title"
          className="text-2xl font-semibold text-accessible-primary"
        >
          Accessibility Settings
        </h2>
        
        {hasChanges && (
          <div 
            role="status" 
            aria-live="polite"
            className="text-sm text-accessible-secondary"
          >
            Unsaved changes
          </div>
        )}
      </div>

      <Card className="p-6">
        <fieldset>
          <legend className="text-lg font-medium text-accessible-primary mb-4">
            Visual Accessibility
          </legend>
          
          <div className="space-y-4">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <label 
                  htmlFor="high-contrast"
                  className="text-accessible-primary font-medium"
                >
                  High Contrast Mode
                </label>
                <p 
                  id="high-contrast-desc"
                  className="text-sm text-accessible-secondary mt-1"
                >
                  Increases contrast ratios for better visibility
                </p>
              </div>
              <button
                id="high-contrast"
                role="switch"
                aria-checked={preferences.highContrast}
                aria-describedby="high-contrast-desc"
                onClick={() => updatePreference('highContrast', !preferences.highContrast)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2
                  ${preferences.highContrast ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span className="sr-only">
                  {preferences.highContrast ? 'Disable' : 'Enable'} high contrast mode
                </span>
                <span 
                  className={`
                    inline-block h-4 w-4 transform rounded-full 
                    bg-white transition-transform
                    ${preferences.highContrast ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Large Text */}
            <div className="flex items-center justify-between">
              <div>
                <label 
                  htmlFor="large-text"
                  className="text-accessible-primary font-medium"
                >
                  Large Text
                </label>
                <p 
                  id="large-text-desc"
                  className="text-sm text-accessible-secondary mt-1"
                >
                  Increases font sizes throughout the application
                </p>
              </div>
              <button
                id="large-text"
                role="switch"
                aria-checked={preferences.largeText}
                aria-describedby="large-text-desc"
                onClick={() => updatePreference('largeText', !preferences.largeText)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2
                  ${preferences.largeText ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span className="sr-only">
                  {preferences.largeText ? 'Disable' : 'Enable'} large text
                </span>
                <span 
                  className={`
                    inline-block h-4 w-4 transform rounded-full 
                    bg-white transition-transform
                    ${preferences.largeText ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Focus Indicators */}
            <div>
              <label 
                htmlFor="focus-indicators"
                className="text-accessible-primary font-medium block mb-2"
              >
                Focus Indicators
              </label>
              <select
                id="focus-indicators"
                value={preferences.focusIndicators}
                onChange={(e) => updatePreference('focusIndicators', e.target.value)}
                className="
                  w-full p-2 border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  focus:border-blue-500 text-accessible-primary
                "
                aria-describedby="focus-indicators-desc"
              >
                <option value="standard">Standard (2px outline)</option>
                <option value="enhanced">Enhanced (3px outline)</option>
                <option value="high-contrast">High Contrast (4px outline)</option>
              </select>
              <p 
                id="focus-indicators-desc"
                className="text-sm text-accessible-secondary mt-1"
              >
                Controls the visibility of keyboard focus indicators
              </p>
            </div>
          </div>
        </fieldset>
      </Card>

      <Card className="p-6">
        <fieldset>
          <legend className="text-lg font-medium text-accessible-primary mb-4">
            Motion and Animation
          </legend>
          
          <div className="space-y-4">
            {/* Reduce Motion */}
            <div className="flex items-center justify-between">
              <div>
                <label 
                  htmlFor="reduce-motion"
                  className="text-accessible-primary font-medium"
                >
                  Reduce Motion
                </label>
                <p 
                  id="reduce-motion-desc"
                  className="text-sm text-accessible-secondary mt-1"
                >
                  Minimizes animations and transitions that may cause discomfort
                </p>
              </div>
              <button
                id="reduce-motion"
                role="switch"
                aria-checked={preferences.reduceMotion}
                aria-describedby="reduce-motion-desc"
                onClick={() => updatePreference('reduceMotion', !preferences.reduceMotion)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2
                  ${preferences.reduceMotion ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span className="sr-only">
                  {preferences.reduceMotion ? 'Disable' : 'Enable'} reduced motion
                </span>
                <span 
                  className={`
                    inline-block h-4 w-4 transform rounded-full 
                    bg-white transition-transform
                    ${preferences.reduceMotion ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </fieldset>
      </Card>

      <Card className="p-6">
        <fieldset>
          <legend className="text-lg font-medium text-accessible-primary mb-4">
            Assistive Technology
          </legend>
          
          <div className="space-y-4">
            {/* Screen Reader Optimization */}
            <div className="flex items-center justify-between">
              <div>
                <label 
                  htmlFor="screen-reader"
                  className="text-accessible-primary font-medium"
                >
                  Screen Reader Optimization
                </label>
                <p 
                  id="screen-reader-desc"
                  className="text-sm text-accessible-secondary mt-1"
                >
                  Optimizes interface for screen reader users
                </p>
              </div>
              <button
                id="screen-reader"
                role="switch"
                aria-checked={preferences.screenReaderOptimized}
                aria-describedby="screen-reader-desc"
                onClick={() => updatePreference('screenReaderOptimized', !preferences.screenReaderOptimized)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2
                  ${preferences.screenReaderOptimized ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span className="sr-only">
                  {preferences.screenReaderOptimized ? 'Disable' : 'Enable'} screen reader optimization
                </span>
                <span 
                  className={`
                    inline-block h-4 w-4 transform rounded-full 
                    bg-white transition-transform
                    ${preferences.screenReaderOptimized ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Announcements */}
            <div className="flex items-center justify-between">
              <div>
                <label 
                  htmlFor="announcements"
                  className="text-accessible-primary font-medium"
                >
                  Screen Reader Announcements
                </label>
                <p 
                  id="announcements-desc"
                  className="text-sm text-accessible-secondary mt-1"
                >
                  Enables status updates and notifications for screen readers
                </p>
              </div>
              <button
                id="announcements"
                role="switch"
                aria-checked={preferences.announcements}
                aria-describedby="announcements-desc"
                onClick={() => updatePreference('announcements', !preferences.announcements)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2
                  ${preferences.announcements ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span className="sr-only">
                  {preferences.announcements ? 'Disable' : 'Enable'} screen reader announcements
                </span>
                <span 
                  className={`
                    inline-block h-4 w-4 transform rounded-full 
                    bg-white transition-transform
                    ${preferences.announcements ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </fieldset>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          aria-describedby="reset-desc"
        >
          Reset to Defaults
        </Button>
        <div id="reset-desc" className="sr-only">
          This will reset all accessibility settings to their default values
        </div>

        <Button
          onClick={savePreferences}
          disabled={!hasChanges}
          aria-describedby="save-desc"
        >
          Save Settings
        </Button>
        <div id="save-desc" className="sr-only">
          Save your accessibility preferences to apply them across the application
        </div>
      </div>

      {/* Status message for screen readers */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {hasChanges ? 'You have unsaved accessibility preference changes' : 'All accessibility preferences are saved'}
      </div>
    </section>
  );
}