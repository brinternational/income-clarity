'use client';

import { useState, useMemo } from 'react';

export interface ProjectionScenario {
  name: string;
  probability: number;
  annualReturn: number;
  description: string;
  factors: string[];
  outperformance?: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  date?: string;
  portfolioValue?: number;
  spyValue?: number;
  spyReturn?: number;
}

export interface TimeHorizonProjection {
  timeframe: string;
  scenarios: ProjectionScenario[];
  expectedReturn: number;
  confidenceInterval: {
    low: number;
    high: number;
  };
}

export type ProjectionPeriod = '3M' | '1Y' | '3Y' | '5Y' | '10Y';

export interface SPYProjectionData {
  period: ProjectionPeriod;
  value: number;
  change: number;
  changePercent: number;
  scenarios?: ProjectionScenario[];
  probabilityOfOutperformance?: number;
  expectedOutperformance?: number;
  targetPrice?: number;
  milestones?: Array<{
    name: string;
    target: number;
    probability: number;
    date?: string;
    portfolioValue?: number;
    spyValue?: number;
  }>;
  timeframe?: string;
  expectedReturn?: number;
  confidenceInterval?: {
    low: number;
    high: number;
  };
}

interface SPYProjectionsResult {
  projections: TimeHorizonProjection[];
  currentPrice: number;
  targetPrices: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
  keyAssumptions: string[];
  risks: string[];
  opportunities: string[];
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  error: string | null;
  selectedPeriod: ProjectionPeriod;
  setSelectedPeriod: (period: ProjectionPeriod) => void;
  refreshProjections: () => void;
  getScenarioColor: (scenario: string) => string;
}

export function useSPYProjections(currentPrice: number = 441.85): SPYProjectionsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ProjectionPeriod>('1Y');
  
  const refreshProjections = () => {
    // Simulate refresh - in production would fetch new data
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };
  
  const getScenarioColor = (scenario: string): string => {
    switch(scenario.toLowerCase()) {
      case 'bear market': return 'text-red-600';
      case 'stagnation': return 'text-gray-600';
      case 'moderate growth': return 'text-blue-600';
      case 'bull market': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const scenarios: ProjectionScenario[] = useMemo(() => [
    {
      name: 'Bear Market',
      probability: 20,
      annualReturn: -0.08,
      description: 'Economic recession, high inflation',
      factors: ['Rising interest rates', 'Geopolitical tensions', 'Corporate earnings decline']
    },
    {
      name: 'Stagnation',
      probability: 25,
      annualReturn: 0.02,
      description: 'Low growth, sideways market',
      factors: ['Economic uncertainty', 'Trade tensions', 'Regulatory headwinds']
    },
    {
      name: 'Moderate Growth',
      probability: 35,
      annualReturn: 0.08,
      description: 'Steady economic growth',
      factors: ['Stable employment', 'Moderate inflation', 'Corporate profit growth']
    },
    {
      name: 'Strong Bull Market',
      probability: 20,
      annualReturn: 0.15,
      description: 'Strong economic expansion',
      factors: ['Technological breakthroughs', 'Low interest rates', 'High consumer confidence']
    }
  ], []);

  const projections: TimeHorizonProjection[] = useMemo(() => {
    const calculateExpectedReturn = (scenarios: ProjectionScenario[]) => {
      return scenarios.reduce((sum, scenario) => 
        sum + (scenario.annualReturn * scenario.probability / 100), 0
      );
    };

    const calculateConfidenceInterval = (scenarios: ProjectionScenario[], expectedReturn: number) => {
      // Simplified confidence interval calculation
      const variance = scenarios.reduce((sum, scenario) => {
        const deviation = scenario.annualReturn - expectedReturn;
        return sum + (Math.pow(deviation, 2) * scenario.probability / 100);
      }, 0);
      
      const stdDev = Math.sqrt(variance);
      
      return {
        low: expectedReturn - 1.96 * stdDev, // 95% confidence interval
        high: expectedReturn + 1.96 * stdDev
      };
    };

    return [
      {
        timeframe: '1 Year',
        scenarios,
        expectedReturn: calculateExpectedReturn(scenarios),
        confidenceInterval: calculateConfidenceInterval(scenarios, calculateExpectedReturn(scenarios))
      },
      {
        timeframe: '3 Years',
        scenarios: scenarios.map(s => ({
          ...s,
          annualReturn: s.annualReturn * 0.9 // Slightly more conservative over longer term
        })),
        expectedReturn: calculateExpectedReturn(scenarios) * 0.9,
        confidenceInterval: calculateConfidenceInterval(
          scenarios.map(s => ({ ...s, annualReturn: s.annualReturn * 0.9 })), 
          calculateExpectedReturn(scenarios) * 0.9
        )
      },
      {
        timeframe: '5 Years',
        scenarios: scenarios.map(s => ({
          ...s,
          annualReturn: s.annualReturn * 0.85 // More conservative for 5-year outlook
        })),
        expectedReturn: calculateExpectedReturn(scenarios) * 0.85,
        confidenceInterval: calculateConfidenceInterval(
          scenarios.map(s => ({ ...s, annualReturn: s.annualReturn * 0.85 })), 
          calculateExpectedReturn(scenarios) * 0.85
        )
      }
    ];
  }, [scenarios]);

  const targetPrices = useMemo(() => {
    const oneYearProjection = projections[0];
    
    return {
      conservative: currentPrice * (1 + oneYearProjection.confidenceInterval.low),
      moderate: currentPrice * (1 + oneYearProjection.expectedReturn),
      aggressive: currentPrice * (1 + oneYearProjection.confidenceInterval.high)
    };
  }, [currentPrice, projections]);

  const keyAssumptions = useMemo(() => [
    'Historical market patterns continue',
    'No major systemic financial crises',
    'Corporate earnings grow with GDP',
    'Interest rates remain within historical ranges',
    'Geopolitical risks remain manageable'
  ], []);

  const risks = useMemo(() => [
    'Rising interest rates could pressure valuations',
    'Geopolitical tensions affecting global trade',
    'Technology disruption changing market dynamics',
    'Inflation exceeding Fed targets',
    'Credit market stress events'
  ], []);

  const opportunities = useMemo(() => [
    'AI and technology adoption driving productivity',
    'Infrastructure spending boosting growth',
    'Energy transition creating new sectors',
    'Demographic trends favoring certain industries',
    'International market expansion'
  ], []);

  return {
    projections,
    currentPrice,
    targetPrices,
    keyAssumptions,
    risks,
    opportunities,
    loading,
    isLoading: loading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    refreshProjections,
    getScenarioColor
  };
}