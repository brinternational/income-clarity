'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface DataPersistenceContextType {
  // Stub interface
}

const DataPersistenceContext = createContext<DataPersistenceContextType | undefined>(undefined);

export function DataPersistenceProvider({ children }: { children: ReactNode }) {
  return (
    <DataPersistenceContext.Provider value={{}}>
      {children}
    </DataPersistenceContext.Provider>
  );
}

export function useDataPersistence() {
  const context = useContext(DataPersistenceContext);
  if (!context) {
    throw new Error('useDataPersistence must be used within DataPersistenceProvider');
  }
  return context;
}