"use client";

import { useState, useEffect } from 'react';

export interface FormPersistenceOptions {
  clearOnSubmit?: boolean;
  saveDebounceMs?: number;
}

export function useFormPersistence<T extends Record<string, any>>(
  key: string,
  initialData: T,
  options: FormPersistenceOptions = {}
) {
  const { clearOnSubmit = true, saveDebounceMs = 500 } = options;
  const [formData, setFormData] = useState<T>(initialData);

  // Load persisted snapshot on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`form_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormData(prev => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore read errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Debounced save
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(`form_${key}`, JSON.stringify(formData));
      } catch {
        // Ignore quota errors
      }
    }, saveDebounceMs);
    return () => clearTimeout(id);
  }, [formData, key, saveDebounceMs]);

  const updateFormData = (updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(initialData);
    try { localStorage.removeItem(`form_${key}`); } catch {}
  };

  const clearPersistence = () => {
    try { localStorage.removeItem(`form_${key}`); } catch {}
  };

  const handleSubmit = async (submitFn: (data: T) => Promise<void>) => {
    await submitFn(formData);
    if (clearOnSubmit) clearPersistence();
  };

  return { formData, updateFormData, resetForm, clearPersistence, handleSubmit };
}

export function hasUnsavedChanges(key: string): boolean {
  try { return localStorage.getItem(`form_${key}`) !== null; } catch { return false; }
}

export function clearAllFormPersistence(): void {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('form_')) localStorage.removeItem(k);
    }
  } catch {}
}

export function useAutoSave<T extends Record<string, any>>(
  data: T,
  key: string,
  debounceMs: number = 1000
) {
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(`autosave_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
      } catch {}
    }, debounceMs);
    return () => clearTimeout(id);
  }, [data, key, debounceMs]);
}

export function restoreAutoSave<T>(key: string, maxAgeMs: number = 24 * 60 * 60 * 1000): T | null {
  try {
    const stored = localStorage.getItem(`autosave_${key}`);
    if (!stored) return null;
    const { data, timestamp } = JSON.parse(stored);
    if (Date.now() - timestamp > maxAgeMs) {
      localStorage.removeItem(`autosave_${key}`);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}