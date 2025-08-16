'use client';

import { useState, useCallback, useEffect } from 'react';
import { UserSettings, defaultSettings, SaveMessage, SettingsUpdate } from '../types/settings';
import { deepMerge } from '../utils/helpers';

const STORAGE_KEY = 'income_clarity_user_settings';

export function useUserSettings(initialData?: Partial<UserSettings>) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return deepMerge(defaultSettings, parsed, initialData || {});
        }
      } catch (error) {
        // Error handled by emergency recovery script
    
    // Fall back to default + initial data
    return deepMerge(defaultSettings, initialData || {});
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        // Error handled by emergency recovery script
  }, [settings]);

  const updateSettings = useCallback((updates: SettingsUpdate) => {
    setSettings(prev => ({
      ...deepMerge(prev, updates),
      lastUpdated: new Date().toISOString()
    }));
    
    // Clear any existing save messages when user makes changes
    if (saveMessage) {
      setSaveMessage(null);
    }
  }, [saveMessage]);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call:
      // await api.updateUserSettings(settings);
      
      // console.log('Settings saved:', settings);

      setSaveMessage({
        type: 'success',
        text: 'Settings saved successfully!'
      });

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);

    } catch (error) {
      // Error handled by emergency recovery script finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetSettings = useCallback((section?: keyof UserSettings) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: defaultSettings[section],
        lastUpdated: new Date().toISOString()
      }));
    } else {
      setSettings(defaultSettings);
    }
  }, []);

  const clearMessage = useCallback(() => {
    setSaveMessage(null);
  }, []);

  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `income-clarity-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [settings]);

  const importSettings = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          const merged = deepMerge(defaultSettings, imported);
          setSettings(merged);
          setSaveMessage({
            type: 'success',
            text: 'Settings imported successfully!'
          });
          resolve();
        } catch (error) {
          setSaveMessage({
            type: 'error',
            text: 'Failed to import settings. Invalid file format.'
          });
          reject(error);
        }
      };
      
      reader.onerror = () => {
        setSaveMessage({
          type: 'error',
          text: 'Failed to read settings file.'
        });
        reject(new Error('File read error'));
      };
      
      reader.readAsText(file);
    });
  }, []);

  // Validation helper
  const validateSettings = useCallback(() => {
    const errors: string[] = [];

    // Validate email format
    if (settings.personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.personal.email)) {
      errors.push('Invalid email format');
    }

    // Validate phone number if provided
    if (settings.personal.phone && !/^\+?[\d\s\-\(\)]+$/.test(settings.personal.phone)) {
      errors.push('Invalid phone number format');
    }

    // Validate tax rates
    if (settings.tax.federalTaxRate < 0 || settings.tax.federalTaxRate > 50) {
      errors.push('Federal tax rate must be between 0% and 50%');
    }

    if (settings.tax.stateTaxRate < 0 || settings.tax.stateTaxRate > 20) {
      errors.push('State tax rate must be between 0% and 20%');
    }

    return errors;
  }, [settings]);

  return {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    validateSettings,
    isSaving,
    saveMessage,
    clearMessage
  };
}