'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting form data to localStorage
 * Automatically saves and restores form state
 */
export function useFormPersistence<T extends Record<string, any>>(
  key: string,
  initialData: T,
  options: {
    clearOnSubmit?: boolean;
    saveDebounceMs?: number;
  } = {}
) {
  const { clearOnSubmit = true, saveDebounceMs = 500 } = options;
  const [formData, setFormData] = useState<T>(initialData);
  
  // Load persisted data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`form_${key}`);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setFormData({ ...initialData, ...parsedData });
      }
    } catch (error) {
      // Error handled by emergency recovery script, [key]);
  
  // Save to localStorage with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`form_${key}`, JSON.stringify(formData));
      } catch (error) {
        // Error handled by emergency recovery script, saveDebounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [formData, key, saveDebounceMs]);
  
  const updateFormData = (updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  const resetForm = () => {
    setFormData(initialData);
    try {
      localStorage.removeItem(`form_${key}`);
    } catch (error) {
      // Error handled by emergency recovery script;
  
  const clearPersistence = () => {
    try {
      localStorage.removeItem(`form_${key}`);
    } catch (error) {
      // Error handled by emergency recovery script;
  
  const handleSubmit = async (submitFn: (data: T) => Promise<void>) => {
    await submitFn(formData);
    if (clearOnSubmit) {
      clearPersistence();
    }
  };
  
  return {
    formData,
    updateFormData,
    resetForm,
    clearPersistence,
    handleSubmit
  };
}

/**
 * Utility function to check if a form has unsaved changes
 */
export function hasUnsavedChanges(key: string): boolean {
  try {
    const stored = localStorage.getItem(`form_${key}`);
    return stored !== null;
  } catch {
    return false;
  }
}

/**
 * Utility function to clear all form persistence data
 */
export function clearAllFormPersistence(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('form_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    // Error handled by emergency recovery script

/**
 * Auto-save form data as user types
 */
export function useAutoSave<T extends Record<string, any>>(
  data: T,
  key: string,
  debounceMs: number = 1000
) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`autosave_${key}`, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (error) {
        // Error handled by emergency recovery script, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [data, key, debounceMs]);
}

/**
 * Restore auto-saved data
 */
export function restoreAutoSave<T>(key: string, maxAgeMs: number = 24 * 60 * 60 * 1000): T | null {
  try {
    const stored = localStorage.getItem(`autosave_${key}`);
    if (!stored) return null;
    
    const { data, timestamp } = JSON.parse(stored);
    const age = Date.now() - timestamp;
    
    if (age > maxAgeMs) {
      localStorage.removeItem(`autosave_${key}`);
      return null;
    }
    
    return data;
  } catch (error) {
    // console.warn('Failed to restore auto-save data:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })