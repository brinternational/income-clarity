'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  BarChart3, 
  PieChart, 
  Activity,
  Zap,
  Target,
  Star,
  ArrowRight
} from 'lucide-react';
import { MobileCardLayout } from '@/components/mobile/MobileCardLayout';
import { useMobileCardLayout } from '@/hooks/useMobileCardLayout';
import { usePerformanceHub, usePerformanceActions } from '@/store/superCardStore';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { TouchFeedback } from '@/components/mobile/TouchFeedback';
import { logger } from '@/lib/logger'

interface MobilePerformanceHubProps {
  portfolioData?: {
    totalValue: number;
    totalReturn: number;
    spyReturn: number;
    outperformance: number;
  };
  isLoading?: boolean;
  className?: string;
}

/**
 * MobilePerformanceHub - Mobile-optimized version of PerformanceHub
 * 
 * Features:
 * - Collapsible sections optimized for mobile viewing
 * - Sticky header with key metrics
 * - Minimum 44px touch targets
 * - 16px+ font sizes for body text
 * - Progressive disclosure of information
 */
export const MobilePerformanceHub: React.FC<MobilePerformanceHubProps> = ({
  portfolioData,
  isLoading = false,
  className = ''
}) => {
  const performanceHub = usePerformanceHub();
  const { spyComparison, holdings, portfolioValue } = performanceHub;

  // Use mobile card layout management
  const {
    toggleSection,
    initializeSection,
    isSectionCollapsed,
    compactMode
  } = useMobileCardLayout({
    cardId: 'performance-hub',
    persistState: true,
    defaultCompactMode: false,
    autoCollapseOnScroll: true,
    scrollThreshold: 150
  });

  // Initialize sections on mount
  React.useEffect(() => {
    initializeSection('hero-metrics', false, 'high');
    initializeSection('performance-breakdown', false, 'high');
    initializeSection('top-performers', true, 'medium');
    initializeSection('insights', true, 'medium');
    initializeSection('recommendations', true, 'low');
  }, [initializeSection]);

  // Extract metrics (prioritize portfolioData, fallback to store)
  const metrics = useMemo(() => {
    if (portfolioData) {
      return {
        portfolioReturn: portfolioData.totalReturn / 100,
        spyReturn: portfolioData.spyReturn / 100,
        outperformance: portfolioData.outperformance / 100,
        totalValue: portfolioData.totalValue
      };
    }
    
    return {
      portfolioReturn: spyComparison?.portfolioReturn || 0.082,
      spyReturn: spyComparison?.spyReturn || 0.061,
      outperformance: spyComparison?.outperformance || 0.021,
      totalValue: portfolioValue || 125000
    };
  }, [portfolioData, spyComparison, portfolioValue]);

  const isBeatingMarket = metrics.outperformance > 0;

  // Animated values
  const animatedValues = useStaggeredCountingAnimation(
    {
      outperformance: metrics.outperformance * 100,
      portfolio: metrics.portfolioReturn * 100,
      spy: metrics.spyReturn * 100,
      totalValue: metrics.totalValue
    },
    1000,
    100
  );

  // Performance insights
  const performanceInsights = useMemo(() => {
    if (!holdings || holdings.length === 0) return null;

    const sortedHoldings = holdings
      .filter(h => h.ytdPerformance !== undefined)
      .sort((a, b) => (b.ytdPerformance || 0) - (a.ytdPerformance || 0));

    const topPerformers = sortedHoldings.slice(0, 3);
    const underperformers = sortedHoldings.slice(-2);
    
    const avgPerformance = holdings.reduce((sum, h) => sum + (h.ytdPerformance || 0), 0) / holdings.length;
    const outperformingCount = holdings.filter(h => (h.ytdPerformance || 0) > metrics.spyReturn).length;

    return {
      topPerformers,
      underperformers,
      avgPerformance,
      outperformingCount,
      totalHoldings: holdings.length
    };
  }, [holdings, metrics.spyReturn]);

  // Smart recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (metrics.outperformance < 0) {
      recs.push({
        type: 'optimization',
        title: 'Close Performance Gap',
        description: `Portfolio underperforming SPY by ${Math.abs(metrics.outperformance * 100).toFixed(1)}%`,
        action: 'Review Holdings',
        priority: 'high'
      });
    } else if (metrics.outperformance > 0.05) {
      recs.push({
        type: 'celebration',
        title: 'Strong Alpha Generation',
        description: `Beating market by ${(metrics.outperformance * 100).toFixed(1)}%`,
        action: 'Maintain Strategy',
        priority: 'positive'
      });
    }

    if (performanceInsights && performanceInsights.outperformingCount / performanceInsights.totalHoldings < 0.5) {
      recs.push({
        type: 'rebalance',
        title: 'Mixed Performance',
        description: `Only ${Math.round((performanceInsights.outperformingCount / performanceInsights.totalHoldings) * 100)}% outperforming`,
        action: 'Review Allocation',
        priority: 'medium'
      });
    }

    return recs.slice(0, 2);
  }, [metrics.outperformance, performanceInsights]);

  // Hero Metrics Section
  const heroMetricsContent = (
    <div className="space-y-6">
      {/* Main Hero Display */}
      <div className="text-center p-6 bg-gradient-to-br from-primary-50 via-primary-25 to-white rounded-xl border border-primary-200">
        <motion.div 
          className={`inline-flex p-4 rounded-xl mb-4 ${
            isBeatingMarket 
              ? 'bg-gradient-to-br from-prosperity-100 to-prosperity-50' 
              : 'bg-gradient-to-br from-wealth-100 to-wealth-50'
          }`}
          whileHover={{ scale: 1.05 }}
        >
          {isBeatingMarket ? (
            <Award className="w-8 h-8 text-prosperity-600" />
          ) : (
            <Target className="w-8 h-8 text-wealth-600" />
          )}
        </motion.div>
        
        <div className={`text-5xl font-bold mb-3 ${
          isBeatingMarket ? 'text-prosperity-600' : 'text-wealth-600'
        }`}>
          {animatedValues.outperformance >= 0 ? '+' : ''}{animatedValues.outperformance.toFixed(1)}%
        </div>
        
        <p className="text-gray-600 text-lg mb-4">vs SPY Performance</p>
        
        {isBeatingMarket && metrics.outperformance > 0.05 && (
          <div className="inline-flex items-center space-x-2 bg-prosperity-50 text-prosperity-700 px-4 py-2 rounded-full text-sm font-medium border border-prosperity-200">
            <Star className="w-4 h-4" />
            <span>Strong Alpha Generation</span>
          </div>
        )}
      </div>

      {/* Portfolio Value Display */}
      <div className="grid grid-cols-1 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-25 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${animatedValues.totalValue.toLocaleString()}
          </div>
          <p className="text-gray-600 text-base">Total Portfolio Value</p>
        </div>
      </div>
    </div>
  );

  // Performance Breakdown Section
  const performanceBreakdownContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-25 rounded-lg border border-primary-100">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {animatedValues.portfolio.toFixed(1)}%
          </div>
          <p className="text-gray-600 text-base">Portfolio Return</p>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-25 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600 mb-2">
            {animatedValues.spy.toFixed(1)}%
          </div>
          <p className="text-gray-600 text-base">SPY Benchmark</p>
        </div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-prosperity-50 to-prosperity-25 rounded-lg border border-prosperity-100">
        <div className="text-2xl font-bold text-prosperity-600 mb-2">
          {performanceInsights?.outperformingCount || 0} / {performanceInsights?.totalHoldings || 0}
        </div>
        <p className="text-gray-600 text-base">Holdings Outperforming SPY</p>
      </div>
    </div>
  );

  // Top Performers Section
  const topPerformersContent = performanceInsights?.topPerformers ? (
    <div className="space-y-3">
      {performanceInsights.topPerformers.slice(0, 3).map((holding, index) => (
        <div key={`mobile-top-performer-${holding.id || holding.ticker || index}`} className="flex items-center justify-between p-4 bg-prosperity-50 rounded-lg border border-prosperity-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-prosperity-500 rounded-full"></div>
            <span className="font-mono font-bold text-lg text-gray-900">{holding.ticker}</span>
          </div>
          <div className="text-prosperity-600 font-bold text-lg">
            +{((holding.ytdPerformance || 0) * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-base text-center py-8">No holdings data available</p>
  );

  // Insights Section
  const insightsContent = performanceInsights ? (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-bold text-gray-900 text-lg mb-2">Portfolio Health</h4>
        <p className="text-gray-700 text-base">
          {performanceInsights.outperformingCount} out of {performanceInsights.totalHoldings} holdings 
          are outperforming the market ({Math.round((performanceInsights.outperformingCount / performanceInsights.totalHoldings) * 100)}%)
        </p>
      </div>
      
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h4 className="font-bold text-gray-900 text-lg mb-2">Performance Spread</h4>
        <p className="text-gray-700 text-base">
          Top performer: +{((performanceInsights.topPerformers[0]?.ytdPerformance || 0) * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  ) : (
    <p className="text-gray-500 text-base text-center py-8">No performance data available</p>
  );

  // Recommendations Section
  const recommendationsContent = recommendations.length > 0 ? (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <div
          key={`mobile-rec-${rec.priority}-${index}`}
          className={`p-4 rounded-lg border-l-4 ${
            rec.priority === 'high' 
              ? 'bg-red-50 border-red-500' 
              : rec.priority === 'positive'
              ? 'bg-green-50 border-green-500'
              : 'bg-blue-50 border-blue-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-gray-900 text-base mb-2">{rec.title}</h5>
              <p className="text-gray-700 text-base mb-3">{rec.description}</p>
            </div>
          </div>
          
          <TouchFeedback
            className="w-full mt-3 bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-2 min-h-[44px]"
            onClick={() => {}}
          >
            <span className="font-medium text-base text-gray-700">{rec.action}</span>
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </TouchFeedback>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-base text-center py-8">No recommendations at this time</p>
  );

  const sections = [
    {
      id: 'hero-metrics',
      title: 'Performance Overview',
      content: heroMetricsContent,
      isCollapsible: false,
      priority: 'high' as const
    },
    {
      id: 'performance-breakdown',
      title: 'Performance Breakdown',
      content: performanceBreakdownContent,
      isCollapsible: true,
      defaultCollapsed: false,
      priority: 'high' as const
    },
    {
      id: 'top-performers',
      title: 'Top Performers',
      content: topPerformersContent,
      isCollapsible: true,
      defaultCollapsed: true,
      priority: 'medium' as const,
      minHeight: 200
    },
    {
      id: 'insights',
      title: 'Portfolio Insights',
      content: insightsContent,
      isCollapsible: true,
      defaultCollapsed: true,
      priority: 'medium' as const
    },
    {
      id: 'recommendations',
      title: 'Smart Recommendations',
      content: recommendationsContent,
      isCollapsible: true,
      defaultCollapsed: true,
      priority: 'low' as const
    }
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <MobileCardLayout
      title="Performance Hub"
      subtitle="Portfolio vs SPY Analysis"
      icon={BarChart3}
      sections={sections}
      className={className}
      onSectionToggle={(sectionId, isCollapsed) => {
        // logger.log(`Section ${sectionId} ${isCollapsed ? 'collapsed' : 'expanded'}`);
      }}
      enableStickyHeader={true}
      compactMode={compactMode}
      showSectionCount={true}
    />
  );
};

export default MobilePerformanceHub;