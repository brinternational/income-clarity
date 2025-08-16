import { useState } from 'react';

export function useMultiStateComparison() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const compareStrategies = (data?: any) => {
    // Strategy comparison logic
    return strategies;
  };
  
  return { 
    strategies, 
    loading, 
    compareStrategies,
    stateComparisons: [],
    isLoading: false,
    error: null,
    getBestStrategyByState: (state?: string) => null,
    getLocationAdvantage: (location?: string, amount?: number) => null,
    getAllStateRankings: () => [],
    summaryStats: null,
    getMigrationAnalysis: () => null
  };
}