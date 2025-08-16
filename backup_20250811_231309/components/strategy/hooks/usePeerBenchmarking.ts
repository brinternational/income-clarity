/**
 * usePeerBenchmarking Hook
 * Manages peer benchmarking data, comparisons, and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { superCardsAPI } from '@/lib/api/super-cards-api';

export interface PeerBenchmarkingData {
  overallPercentile: number;
  strengths: Array<{
    metric: string;
    percentile: number;
    category: string;
  }>;
  weaknesses: Array<{
    metric: string;
    percentile: number;
    category: string;
  }>;
  peerComparisons: Array<{
    category: string;
    metrics: Array<{
      metric: string;
      userValue: number;
      peerAverage: number;
      peerMedian: number;
      percentile: number;
      bestInGroup: number;
      unit: string;
      isHigherBetter: boolean;
    }>;
  }>;
  competitiveInsights: string[];
  improvementOpportunities: Array<{
    category: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  rankingHistory: Array<{
    date: string;
    overallRank: number;
    percentile: number;
  }>;
}

export interface PeerBenchmarkingOptions {
  portfolioValue: number;
  location: string;
  strategy: string;
  selectedGroup: string;
  timeframe: '1M' | '3M' | '6M' | '1Y' | 'All';
}

export const usePeerBenchmarking = (options: PeerBenchmarkingOptions) => {
  const [peerData, setPeerData] = useState<PeerBenchmarkingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPeerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch real peer benchmarking data
      const response = await fetch('/api/peer-benchmarking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioValue: options.portfolioValue,
          location: options.location,
          strategy: options.strategy,
          peerGroupId: options.selectedGroup,
          timeframe: options.timeframe,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPeerData(data);
        setLastUpdated(new Date());
        return;
      }

      // Fallback to mock data if API unavailable
      // console.log('Using mock peer benchmarking data');
      // const mockData = generateMockPeerData(options);
      setPeerData(mockData);
      setLastUpdated(new Date());

    } catch (err) {
      // console.error('Error fetching peer benchmarking data:', err);

      // Generate mock data on error
      const mockData = generateMockPeerData(options);
      setPeerData(mockData);
      setLastUpdated(new Date());
      setError('Using demo data - real peer comparisons coming soon');
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const refreshData = useCallback(() => {
    fetchPeerData();
  }, [fetchPeerData]);

  const setPeerGroup = useCallback((groupId: string) => {
    // This will be handled by parent component updating options
  }, []);

  const setTimeframe = useCallback((timeframe: '1M' | '3M' | '6M' | '1Y' | 'All') => {
    // This will be handled by parent component updating options
  }, []);

  useEffect(() => {
    fetchPeerData();
  }, [fetchPeerData]);

  return {
    peerData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    setPeerGroup,
    setTimeframe,
  };
};

// Mock data generator for development/fallback
const generateMockPeerData = (options: PeerBenchmarkingOptions): PeerBenchmarkingData => {
  // Calculate percentiles based on Puerto Rico advantage
  const isPuertoRico = options.location === 'Puerto Rico';
  const taxEfficiencyBonus = isPuertoRico ? 25 : 0;

  const basePercentiles = {
    totalReturn: 78 + (options.strategy === 'dividend' ? 5 : 0),
    dividendYield: 72 + (options.strategy === 'dividend' ? 10 : 0),
    taxEfficiency: Math.min(98, 45 + taxEfficiencyBonus),
    expenseCoverage: 82,
    diversificationScore: 65,
    riskAdjustedReturn: 71,
    aboveZeroStreak: 85,
    incomeStability: 78,
  };

  const overallPercentile = Math.round(
    Object.values(basePercentiles).reduce((sum, val) => sum + val, 0) / 
    Object.values(basePercentiles).length
  );

  const strengths = Object.entries(basePercentiles)
    .filter(([_, percentile]) => percentile >= 75)
    .map(([metric, percentile]) => ({
      metric: formatMetricName(metric),
      percentile,
      category: getCategoryForMetric(metric),
    }))
    .sort((a, b) => b.percentile - a.percentile)
    .slice(0, 3);

  const weaknesses = Object.entries(basePercentiles)
    .filter(([_, percentile]) => percentile <= 50)
    .map(([metric, percentile]) => ({
      metric: formatMetricName(metric),
      percentile,
      category: getCategoryForMetric(metric),
    }))
    .sort((a, b) => a.percentile - b.percentile)
    .slice(0, 3);

  return {
    overallPercentile,
    strengths,
    weaknesses,
    peerComparisons: generateMockComparisons(basePercentiles),
    competitiveInsights: generateCompetitiveInsights(options, overallPercentile, isPuertoRico),
    improvementOpportunities: generateImprovementOpportunities(weaknesses),
    rankingHistory: generateRankingHistory(overallPercentile),
  };
};

const formatMetricName = (metric: string): string => {
  const nameMap: Record<string, string> = {
    totalReturn: 'Total Return',
    dividendYield: 'Dividend Yield',
    taxEfficiency: 'Tax Efficiency',
    expenseCoverage: 'Expense Coverage',
    diversificationScore: 'Diversification',
    riskAdjustedReturn: 'Risk-Adjusted Return',
    aboveZeroStreak: 'Above-Zero Streak',
    incomeStability: 'Income Stability',
  };
  return nameMap[metric] || metric;
};

const getCategoryForMetric = (metric: string): string => {
  const categoryMap: Record<string, string> = {
    totalReturn: 'Performance',
    dividendYield: 'Income Generation',
    taxEfficiency: 'Tax Efficiency',
    expenseCoverage: 'Income Generation',
    diversificationScore: 'Portfolio Construction',
    riskAdjustedReturn: 'Performance',
    aboveZeroStreak: 'Income Generation',
    incomeStability: 'Income Generation',
  };
  return categoryMap[metric] || 'Other';
};

const generateMockComparisons = (basePercentiles: Record<string, number>) => {
  return [
    {
      category: 'Performance',
      metrics: [
        {
          metric: 'Annual Return',
          userValue: 8.7,
          peerAverage: 7.2,
          peerMedian: 6.8,
          percentile: basePercentiles.totalReturn,
          bestInGroup: 12.4,
          unit: '%',
          isHigherBetter: true,
        },
        {
          metric: 'Risk-Adjusted Return',
          userValue: 0.71,
          peerAverage: 0.58,
          peerMedian: 0.55,
          percentile: basePercentiles.riskAdjustedReturn,
          bestInGroup: 0.89,
          unit: '',
          isHigherBetter: true,
        },
      ],
    },
    {
      category: 'Tax Efficiency',
      metrics: [
        {
          metric: 'Effective Tax Rate',
          userValue: 2.1,
          peerAverage: 18.5,
          peerMedian: 16.8,
          percentile: basePercentiles.taxEfficiency,
          bestInGroup: 0.0,
          unit: '%',
          isHigherBetter: false,
        },
      ],
    },
    {
      category: 'Income Generation',
      metrics: [
        {
          metric: 'Dividend Yield',
          userValue: 4.2,
          peerAverage: 3.8,
          peerMedian: 3.6,
          percentile: basePercentiles.dividendYield,
          bestInGroup: 6.8,
          unit: '%',
          isHigherBetter: true,
        },
        {
          metric: 'Expense Coverage',
          userValue: 135,
          peerAverage: 118,
          peerMedian: 108,
          percentile: basePercentiles.expenseCoverage,
          bestInGroup: 250,
          unit: '%',
          isHigherBetter: true,
        },
      ],
    },
  ];
};

const generateCompetitiveInsights = (
  options: PeerBenchmarkingOptions,
  overallPercentile: number,
  isPuertoRico: boolean
): string[] => {
  const insights = [
    `You're performing better than ${overallPercentile}% of peers in your group`,
  ];

  if (isPuertoRico) {
    insights.push('Your Puerto Rico tax advantage puts you in the top 2% for tax efficiency');
    insights.push('PR residents in your bracket save an average of $12,000 annually vs mainland peers');
  }

  if (options.strategy === 'dividend') {
    insights.push('Your dividend focus strategy is outperforming balanced portfolios by 1.5%');
  }

  if (overallPercentile >= 75) {
    insights.push('You\'re in the top quartile of investors - excellent performance!');
  } else if (overallPercentile >= 50) {
    insights.push('Solid performance with room for optimization in key areas');
  }

  return insights;
};

const generateImprovementOpportunities = (
  weaknesses: Array<{ metric: string; percentile: number; category: string }>
) => {
  const opportunities = [];

  for (const weakness of weaknesses) {
    if (weakness.metric === 'Diversification') {
      opportunities.push({
        category: weakness.category,
        recommendation: 'Consider adding REITs or international exposure to improve diversification',
        impact: 'medium' as const,
        difficulty: 'easy' as const,
      });
    } else if (weakness.metric === 'Income Stability') {
      opportunities.push({
        category: weakness.category,
        recommendation: 'Focus on dividend aristocrats with 25+ year track records',
        impact: 'high' as const,
        difficulty: 'medium' as const,
      });
    } else if (weakness.metric === 'Risk-Adjusted Return') {
      opportunities.push({
        category: weakness.category,
        recommendation: 'Rebalance to reduce volatility while maintaining returns',
        impact: 'high' as const,
        difficulty: 'medium' as const,
      });
    }
  }

  return opportunities;
};

const generateRankingHistory = (currentPercentile: number) => {
  const history = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    // Generate realistic ranking progression
    const variance = (Math.random() - 0.5) * 10;
    const percentile = Math.max(10, Math.min(95, currentPercentile + variance));
    
    history.push({
      date: date.toISOString(),
      overallRank: Math.round((100 - percentile) * 30), // Assuming ~3000 peers
      percentile: Math.round(percentile),
    });
  }

  return history;
};