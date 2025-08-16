import { useState } from 'react';

export function useStrategyComparison() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const compareStrategies = (data?: any) => {
    // Strategy comparison logic
    return strategies;
  };
  
  return { 
    strategies, 
    loading, 
    compareStrategies,
    error,
    stateComparisons: [],
    isLoading: loading,
    getBestStrategyByState: (state?: string) => null,
    getLocationAdvantage: (location?: string) => null,
    getAllStateRankings: () => [],
    summaryStats: null,
    getMigrationAnalysis: () => null,
    input: null,
    result: null,
    isCalculating: false,
    updatePortfolioValue: (value?: number) => {},
    updateTargetIncome: (income?: number) => {},
    updateLocation: (location?: string) => {},
    updateFilingStatus: (status?: string) => {},
    winnerStrategy: null,
    puertoRicoSavings: null,
    locationInsights: null,
    isValid: false
  };
}

export const useCurrencyFormatter = () => {
  return (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

export const usePercentageFormatter = () => {
  return (value: number) => `${(value * 100).toFixed(2)}%`;
};