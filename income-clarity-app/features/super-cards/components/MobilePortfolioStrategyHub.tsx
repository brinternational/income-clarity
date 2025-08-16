'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity,
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  Target,
  AlertCircle,
  CheckCircle,
  X,
  Info,
  RefreshCw,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { usePortfolioHub, usePortfolioActions } from '@/store/superCardStore';
import { StrategyHealthCard } from '@/components/strategy/StrategyHealthCard';
import { RebalancingSuggestions } from '@/components/dashboard/RebalancingSuggestions';
import { StrategyComparisonEngine } from '@/components/strategy/StrategyComparisonEngine';
import { MarginIntelligence } from '@/components/dashboard/MarginIntelligence';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';

interface MobilePortfolioStrategyHubProps {
  strategyData?: {
    healthScore: number;
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    diversificationScore: number;
    rebalanceNeeded: boolean;
    totalValue: number;
  };
  isLoading?: boolean;
  className?: string;
  onClose?: () => void;
}

type TabType = 'health' | 'rebalancing' | 'comparison' | 'margin';

const MOBILE_TABS = [
  {
    id: 'health' as TabType,
    label: 'Health',
    shortLabel: 'HP',
    description: 'Portfolio health',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'rebalancing' as TabType,
    label: 'Balance',
    shortLabel: 'Bal',
    description: 'Optimization',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'comparison' as TabType,
    label: 'Compare',
    shortLabel: 'Cmp',
    description: 'Strategy analysis',
    icon: TrendingUp,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50'
  },
  {
    id: 'margin' as TabType,
    label: 'Leverage',
    shortLabel: 'Lev',
    description: 'Margin intelligence',
    icon: Zap,
    color: 'text-wealth-600',
    bgColor: 'bg-wealth-50'
  }
];

const MobilePortfolioStrategyHubComponent = ({ 
  strategyData,
  isLoading = false,
  className = '',
  onClose
}: MobilePortfolioStrategyHubProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('health');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [pullRefreshDistance, setPullRefreshDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const portfolioHub = usePortfolioHub();
  const { updateData, setLoading, setError } = usePortfolioActions();
  const { portfolioHealth, strategyComparison, loading: hubLoading } = portfolioHub;

  // Mobile-optimized portfolio data
  const activeData = strategyData || portfolioHealth || {
    healthScore: 85,
    riskLevel: 'moderate' as const,
    diversificationScore: 78,
    rebalanceNeeded: false,
    totalValue: 125000
  };

  // Mobile-optimized animations - faster and lighter
  const animatedValues = useStaggeredCountingAnimation(
    {
      heroMetric: activeData.healthScore,
      diversification: activeData.diversificationScore,
      portfolioValue: activeData.totalValue,
      riskScore: activeData.riskLevel === 'conservative' ? 30 : activeData.riskLevel === 'moderate' ? 60 : 90,
    },
    800, // Faster for mobile
    100
  );

  // Mobile-optimized health insights
  const healthInsights = useMemo(() => {
    const score = activeData.healthScore;
    
    if (score >= 85) {
      return {
        grade: 'A',
        status: 'Excellent',
        message: 'Portfolio optimized',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        action: 'Keep it up!',
        emoji: '🎯'
      };
    }
    
    if (score >= 75) {
      return {
        grade: 'B',
        status: 'Good',
        message: 'Minor tweaks needed',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: Target,
        action: 'Small adjustments',
        emoji: '👍'
      };
    }
    
    if (score >= 65) {
      return {
        grade: 'C',
        status: 'Fair',
        message: 'Rebalancing time',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: AlertCircle,
        action: 'Review allocation',
        emoji: '⚠️'
      };
    }
    
    return {
      grade: 'D',
      status: 'Needs Work',
      message: 'Major optimization',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: AlertCircle,
      action: 'Rebalance now',
      emoji: '🔧'
    };
  }, [activeData.healthScore]);

  // Risk level info for mobile
  const riskLevelInfo = useMemo(() => {
    const risk = activeData.riskLevel;
    
    switch (risk) {
      case 'conservative':
        return { 
          label: 'Conservative', 
          short: 'Low Risk',
          color: 'text-green-600', 
          bgColor: 'bg-green-50', 
          icon: '🛡️',
          description: 'Safety first'
        };
      case 'moderate':
        return { 
          label: 'Moderate', 
          short: 'Med Risk',
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50', 
          icon: '⚖️',
          description: 'Balanced approach'
        };
      case 'aggressive':
        return { 
          label: 'Aggressive', 
          short: 'High Risk',
          color: 'text-red-600', 
          bgColor: 'bg-red-50', 
          icon: '🚀',
          description: 'Growth focused'
        };
      default:
        return { 
          label: 'Unknown', 
          short: 'Unknown',
          color: 'text-slate-600', 
          bgColor: 'bg-slate-50', 
          icon: '❓',
          description: 'Not set'
        };
    }
  }, [activeData.riskLevel]);

  // Mobile touch handlers with pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.targetTouches[0].clientY;
    const deltaY = currentY - touchStart.y;
    
    // Pull to refresh logic
    if (deltaY > 0 && window.scrollY === 0) {
      setPullRefreshDistance(Math.min(deltaY / 3, 60));
    }
  };

  const handleTouchEnd = () => {
    if (pullRefreshDistance > 40) {
      handleRefresh();
    }
    setPullRefreshDistance(0);
  };

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Refresh portfolio data here
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || hubLoading) {
    return (
      <div className="h-screen bg-slate-50">
        {/* Mobile Loading Skeleton */}
        <div className="animate-pulse p-4">
          <div className="h-16 bg-slate-200 rounded-xl mb-4"></div>
          <div className="h-32 bg-slate-200 rounded-xl mb-4"></div>
          <div className="flex space-x-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 h-12 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-gradient-to-br from-slate-50 to-white overflow-hidden ${className}`}>
      {/* Pull to refresh indicator */}
      {pullRefreshDistance > 0 && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50"
          style={{ y: pullRefreshDistance - 30 }}
        >
          <div className={`p-2 rounded-full ${pullRefreshDistance > 40 ? 'bg-green-500' : 'bg-slate-300'} text-white`}>
            <RefreshCw className="w-4 h-4" />
          </div>
        </motion.div>
      )}

      <div 
        className="h-full overflow-y-auto overscroll-y-contain"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg border-b border-slate-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${healthInsights.bgColor}`}>
                <Activity className={`w-5 h-5 ${healthInsights.color}`} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Portfolio Strategy</h1>
                <p className="text-xs text-slate-500">Health & Optimization</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBottomSheet(true)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Info className="w-4 h-4 text-slate-600" />
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section - Health Score */}
        <div className="px-4 py-6">
          <div className={`text-center p-6 bg-gradient-to-br rounded-2xl border-2 ${healthInsights.bgColor} ${healthInsights.color.replace('text-', 'border-').replace('-600', '-200')}`}>
            <div className="flex items-center justify-center mb-3">
              <div className={`p-3 rounded-xl ${healthInsights.bgColor}`}>
                <span className="text-2xl">{healthInsights.emoji}</span>
              </div>
            </div>
            
            <div className={`text-5xl font-bold mb-1 ${healthInsights.color}`}>
              {Math.round(animatedValues.heroMetric)}
              <span className="text-2xl ml-1">/100</span>
            </div>
            
            <div className="text-sm text-slate-600 mb-2">
              Portfolio Health Score
            </div>

            <div className={`text-lg font-semibold ${healthInsights.color} mb-1`}>
              Grade {healthInsights.grade} - {healthInsights.status}
            </div>

            <div className="text-sm text-slate-600">
              {healthInsights.message}
            </div>
          </div>

          {/* Mobile Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm border">
              <div className="text-lg font-bold text-prosperity-600 mb-1">
                ${Math.round(animatedValues.portfolioValue / 1000)}K
              </div>
              <div className="text-xs text-slate-600">Portfolio Value</div>
            </div>
            
            <div className={`text-center p-4 rounded-xl shadow-sm border ${riskLevelInfo.bgColor}`}>
              <div className="flex items-center justify-center space-x-1 mb-1">
                <span className="text-lg">{riskLevelInfo.icon}</span>
                <div className={`text-sm font-bold ${riskLevelInfo.color}`}>
                  {riskLevelInfo.short}
                </div>
              </div>
              <div className="text-xs text-slate-600">Risk Level</div>
            </div>
            
            <div className="text-center p-4 bg-primary-50 rounded-xl shadow-sm border border-primary-100">
              <div className="text-lg font-bold text-primary-600 mb-1">
                {Math.round(animatedValues.diversification)}%
              </div>
              <div className="text-xs text-slate-600">Diversified</div>
            </div>
          </div>

          {/* Rebalance Alert - Mobile optimized */}
          {activeData.rebalanceNeeded && (
            <motion.div
              className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <div className="font-semibold text-yellow-800">Rebalancing Needed</div>
                  <div className="text-xs text-yellow-600">{healthInsights.action}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-yellow-600" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Mobile Tab Navigation */}
        <div className="px-4">
          <div className="flex bg-white rounded-2xl p-1 gap-1 shadow-lg border border-slate-100">
            {MOBILE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 relative px-2 py-3 text-center transition-all duration-200 rounded-xl ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl"
                      layoutId="activeMobilePortfolioTab"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative flex flex-col items-center space-y-1">
                    <Icon className="w-4 h-4" />
                    <div className="text-xs font-semibold">
                      {tab.shortLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content - Mobile optimized */}
        <div className="flex-1 px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'health' && (
                <div className="space-y-4">
                  <StrategyHealthCard />
                </div>
              )}

              {activeTab === 'rebalancing' && (
                <div className="space-y-4">
                  <RebalancingSuggestions />
                </div>
              )}

              {activeTab === 'comparison' && (
                <div className="space-y-4">
                  <StrategyComparisonEngine />
                </div>
              )}

              {activeTab === 'margin' && (
                <div className="space-y-4">
                  <MarginIntelligence />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Action Bar */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              className="flex items-center justify-center space-x-2 p-3 bg-primary-600 text-white rounded-xl font-medium"
              whileTap={{ scale: 0.98 }}
            >
              <Gauge className="w-4 h-4" />
              <span>Health Check</span>
            </motion.button>
            
            <motion.button
              className="flex items-center justify-center space-x-2 p-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium"
              whileTap={{ scale: 0.98 }}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rebalance</span>
            </motion.button>
          </div>
        </div>

        {/* Swipe hints */}
        <div className="text-center text-xs text-slate-400 py-2">
          Swipe tabs • Pull to refresh
        </div>
      </div>

      {/* Bottom Sheet for insights */}
      {showBottomSheet && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowBottomSheet(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-lg font-bold mb-4">Portfolio Health Insights</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Health Score</span>
                </h4>
                <p className="text-sm text-green-600">
                  Your portfolio health score of {activeData.healthScore}/100 indicates {healthInsights.status.toLowerCase()} performance. {healthInsights.message}.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Risk Management</span>
                </h4>
                <p className="text-sm text-blue-600">
                  Your {riskLevelInfo.label.toLowerCase()} risk profile with {activeData.diversificationScore}% diversification provides {riskLevelInfo.description.toLowerCase()}.
                </p>
              </div>

              {activeData.rebalanceNeeded && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Rebalancing Alert</span>
                  </h4>
                  <p className="text-sm text-yellow-600">
                    Your portfolio would benefit from rebalancing to optimize performance and manage risk.
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowBottomSheet(false)}
              className="w-full mt-6 bg-primary-600 text-white py-3 rounded-xl font-medium"
            >
              Got It
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export const MobilePortfolioStrategyHub = memo(MobilePortfolioStrategyHubComponent, (prevProps, nextProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.strategyData?.healthScore === nextProps.strategyData?.healthScore &&
    prevProps.strategyData?.rebalanceNeeded === nextProps.strategyData?.rebalanceNeeded &&
    prevProps.strategyData?.totalValue === nextProps.strategyData?.totalValue
  );
});