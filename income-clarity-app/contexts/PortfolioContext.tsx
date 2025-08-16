'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface PortfolioContextType {
  portfolio: any;
  holdings: any[];
  loading: boolean;
  totalValue: number;
  addHolding: (holding: any) => Promise<void>;
  error: any;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const addHolding = async (holding: any) => {
    setHoldings(prev => [...prev, holding]);
  };
  
  const totalValue = holdings.reduce((sum: number, h: any) => sum + (h.value || 0), 0);
  
  return (
    <PortfolioContext.Provider value={{ 
      portfolio: null,
      holdings,
      loading,
      totalValue,
      addHolding,
      error
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
}