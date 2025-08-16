'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingState {
  [key: string]: {
    isLoading: boolean;
    message?: string;
    progress?: number;
  };
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean, message?: string, progress?: number) => void;
  isLoading: (key: string) => boolean;
  getLoadingState: (key: string) => LoadingState[string] | null;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = (key: string, isLoading: boolean, message?: string, progress?: number) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading,
        message,
        progress
      }
    }));
  };

  const isLoading = (key: string): boolean => {
    return loadingStates[key]?.isLoading || false;
  };

  const getLoadingState = (key: string): LoadingState[string] | null => {
    return loadingStates[key] || null;
  };

  const clearLoading = (key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const clearAllLoading = () => {
    setLoadingStates({});
  };

  return (
    <LoadingContext.Provider value={{
      loadingStates,
      setLoading,
      isLoading,
      getLoadingState,
      clearLoading,
      clearAllLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook for common loading patterns
export const useAsyncOperation = (key: string) => {
  const { setLoading, isLoading, getLoadingState } = useLoading();

  const executeAsync = async <T,>(
    operation: () => Promise<T>,
    message?: string
  ): Promise<T | null> => {
    try {
      setLoading(key, true, message);
      const result = await operation();
      setLoading(key, false);
      return result;
    } catch (error) {
      setLoading(key, false);
      throw error;
    }
  };

  const executeWithProgress = async <T,>(
    operation: (updateProgress: (progress: number) => void) => Promise<T>,
    message?: string
  ): Promise<T | null> => {
    try {
      setLoading(key, true, message, 0);
      
      const updateProgress = (progress: number) => {
        const currentState = getLoadingState(key);
        if (currentState) {
          setLoading(key, true, currentState.message, progress);
        }
      };

      const result = await operation(updateProgress);
      setLoading(key, false);
      return result;
    } catch (error) {
      setLoading(key, false);
      throw error;
    }
  };

  return {
    executeAsync,
    executeWithProgress,
    isLoading: isLoading(key),
    loadingState: getLoadingState(key)
  };
};

// Common loading keys - helps avoid typos and provides consistency
export const LOADING_KEYS = {
  DASHBOARD: 'dashboard',
  PORTFOLIO: 'portfolio',
  PRICE_UPDATE: 'price_update',
  REPORT_GENERATION: 'report_generation',
  DATA_EXPORT: 'data_export',
  BACKUP_RESTORE: 'backup_restore',
  SETTINGS: 'settings',
  AUTHENTICATION: 'authentication',
  NAVIGATION: 'navigation',
  API_CALL: 'api_call'
} as const;