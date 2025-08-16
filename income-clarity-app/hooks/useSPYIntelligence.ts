'use client';

import { useState, useEffect, useMemo } from 'react';

interface SPYIntelligenceData {
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  monthlyChange: number;
  ytdChange: number;
  pe_ratio: number;
  dividend_yield: number;
  volume: number;
  market_sentiment: 'bullish' | 'bearish' | 'neutral';
  support_levels: number[];
  resistance_levels: number[];
  trend: 'uptrend' | 'downtrend' | 'sideways';
  trends?: {
    direction: 'improving' | 'declining' | 'stable';
    short: string;
    medium: string;
    long: string;
  };
  historicalData?: SPYHistoricalData[];
  riskMetrics?: {
    volatility: number;
    maxDrawdown: number;
    sharpeRatio: number;
    informationRatio: number;
  };
  recommendations?: Array<{
    type: 'bullish' | 'bearish' | 'neutral' | 'outperforming' | 'underperforming';
    title: string;
    description: string;
    confidence: number;
  }>;
}

interface PortfolioComparison {
  portfolioReturn: number;
  spyReturn: number;
  outperformance: number;
  alpha: number;
  beta: number;
  sharpe_ratio: number;
}

export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'All';

export interface SPYHistoricalData {
  date: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  period?: TimePeriod;
  portfolioReturn?: number;
  spyReturn?: number;
  outperformance?: number;
  maxDrawdown?: number;
  winRate?: number;
  volatility?: number;
  sharpeRatio?: number;
}

interface SPYIntelligenceResult {
  spyData: SPYIntelligenceData;
  data: SPYIntelligenceData; // Alias for compatibility
  comparison: PortfolioComparison;
  insights: string[];
  recommendations: Array<{
    type: 'bullish' | 'bearish' | 'neutral';
    title: string;
    description: string;
    confidence: number;
  }>;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  error: string | null;
  refresh: () => void;
  refreshData: () => void; // Alias for compatibility
  selectedPeriod: TimePeriod;
  setSelectedPeriod: (period: TimePeriod) => void;
}

export function useSPYIntelligence(
  portfolioReturn: number = 0.082,
  spyReturn: number = 0.061
): SPYIntelligenceResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1Y');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Mock SPY data - in production this would come from an API
  const spyData: SPYIntelligenceData = useMemo(() => ({
    currentPrice: 441.85,
    dailyChange: 2.35,
    dailyChangePercent: 0.53,
    weeklyChange: 1.8,
    monthlyChange: 3.2,
    ytdChange: 18.7,
    pe_ratio: 24.8,
    dividend_yield: 1.31,
    volume: 67850000,
    market_sentiment: 'bullish',
    support_levels: [435.50, 428.20, 421.80],
    resistance_levels: [448.90, 455.30, 462.15],
    trend: 'uptrend',
    trends: {
      direction: portfolioReturn > spyReturn ? 'improving' : 'declining',
      short: 'Bullish momentum',
      medium: 'Consolidation expected',
      long: 'Continued growth'
    },
    historicalData: [
      {
        date: new Date().toISOString().split('T')[0],
        price: 441.85,
        change: 2.35,
        changePercent: 0.53,
        volume: 67850000,
        period: '1Y',
        portfolioReturn: portfolioReturn,
        spyReturn: spyReturn,
        outperformance: portfolioReturn - spyReturn,
        maxDrawdown: 0.15,
        winRate: portfolioReturn > spyReturn ? 0.75 : 0.45,
        volatility: 0.18,
        sharpeRatio: 0.82
      }
    ],
    riskMetrics: {
      volatility: 0.18,
      maxDrawdown: 0.15,
      sharpeRatio: 0.82,
      informationRatio: (portfolioReturn - spyReturn) / 0.05 // Simplified calculation
    }
  }), [lastUpdate, portfolioReturn, spyReturn]);

  const comparison: PortfolioComparison = useMemo(() => {
    const outperformance = portfolioReturn - spyReturn;
    
    return {
      portfolioReturn,
      spyReturn,
      outperformance,
      alpha: outperformance,
      beta: 1.15, // Slightly more volatile than market
      sharpe_ratio: 0.73
    };
  }, [portfolioReturn, spyReturn]);

  const insights: string[] = useMemo(() => {
    const insights = [];
    
    if (comparison.outperformance > 0.02) {
      insights.push(`Your portfolio is beating SPY by ${(comparison.outperformance * 100).toFixed(1)}% - excellent alpha generation!`);
    } else if (comparison.outperformance > 0) {
      insights.push(`You're slightly outperforming SPY by ${(comparison.outperformance * 100).toFixed(1)}%`);
    } else {
      insights.push(`SPY is currently outperforming your portfolio by ${(Math.abs(comparison.outperformance) * 100).toFixed(1)}%`);
    }

    if (spyData.market_sentiment === 'bullish') {
      insights.push('Market sentiment is bullish - good environment for growth stocks');
    } else if (spyData.market_sentiment === 'bearish') {
      insights.push('Market sentiment is bearish - consider defensive positioning');
    }

    if (spyData.pe_ratio > 25) {
      insights.push('SPY P/E ratio is elevated - market may be overvalued');
    } else if (spyData.pe_ratio < 20) {
      insights.push('SPY P/E ratio suggests market is reasonably valued');
    }

    return insights;
  }, [comparison, spyData]);

  const recommendations = useMemo(() => {
    const recs = [];

    if (comparison.outperformance < -0.05) {
      recs.push({
        type: 'neutral' as const,
        title: 'Consider SPY Allocation',
        description: 'Your portfolio is underperforming SPY significantly. Consider increasing SPY exposure.',
        confidence: 85
      });
    }

    if (spyData.trend === 'uptrend' && spyData.market_sentiment === 'bullish') {
      recs.push({
        type: 'bullish' as const,
        title: 'Momentum Play',
        description: 'Strong uptrend with bullish sentiment suggests continued momentum.',
        confidence: 78
      });
    }

    if (spyData.pe_ratio > 25) {
      recs.push({
        type: 'bearish' as const,
        title: 'Valuation Concern',
        description: 'High P/E ratio suggests market may be overextended.',
        confidence: 65
      });
    }

    return recs.slice(0, 3); // Limit to 3 recommendations
  }, [comparison, spyData]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdate(Date.now());
    } catch (err) {
      setError('Failed to refresh SPY data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 minutes during market hours
  useEffect(() => {
    const now = new Date();
    const isMarketHours = now.getHours() >= 9 && now.getHours() < 16;
    
    if (isMarketHours) {
      const interval = setInterval(() => {
        setLastUpdate(Date.now());
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, []);

  // Enhanced spy data with recommendations included
  const enhancedSpyData: SPYIntelligenceData = useMemo(() => ({
    ...spyData,
    recommendations
  }), [spyData, recommendations]);

  return {
    spyData: enhancedSpyData,
    data: enhancedSpyData, // Alias for compatibility - this is what the component uses
    comparison,
    insights,
    recommendations,
    loading,
    isLoading: loading, // Alias for compatibility
    error,
    refresh,
    refreshData: refresh, // Alias for compatibility
    selectedPeriod,
    setSelectedPeriod
  };
}