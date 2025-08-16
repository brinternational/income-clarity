'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign,
  Calculator,
  Target,
  Settings,
  TrendingDown,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  X,
  Info
} from 'lucide-react';
import { useTaxHub, useTaxActions } from '@/store/superCardStore';
import { TaxIntelligenceEngineCard } from '@/components/strategy/TaxIntelligenceEngineCard';
import { TaxSavingsCalculatorCard } from '@/components/strategy/TaxSavingsCalculatorCard';
import { TaxPlanning } from '@/components/dashboard/TaxPlanning';
import { TaxSettingsCard } from '@/components/strategy/TaxSettingsCard';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';

interface MobileTaxStrategyHubProps {
  taxData?: {
    currentTaxBill: number;
    optimizedTaxBill: number;
    potentialSavings: number;
    location: string;
  };
  isLoading?: boolean;
  className?: string;
  onClose?: () => void;
}

type TabType = 'intelligence' | 'savings' | 'planning' | 'settings';

const MOBILE_TABS = [
  {
    id: 'intelligence' as TabType,
    label: 'AI Tax',
    shortLabel: 'AI',
    description: 'Smart optimization',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'savings' as TabType,
    label: 'Calculator',
    shortLabel: 'Calc',
    description: 'Savings potential',
    icon: Calculator,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'planning' as TabType,
    label: 'Strategy',
    shortLabel: 'Plan',
    description: 'Tax planning',
    icon: Target,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50'
  },
  {
    id: 'settings' as TabType,
    label: 'Location',
    shortLabel: 'Set',
    description: 'Settings & location',
    icon: Settings,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50'
  }
];

const MobileTaxStrategyHubComponent = ({ 
  taxData,
  isLoading = false,
  className = '',
  onClose
}: MobileTaxStrategyHubProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('intelligence');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [pullRefreshDistance, setPullRefreshDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const taxHub = useTaxHub();
  const { updateData, setLoading, setError } = useTaxActions();
  const { taxSettings, taxProjections, loading: hubLoading } = taxHub;

  // Mobile-optimized tax data with Puerto Rico focus
  const activeData = taxData || taxProjections || {
    currentTaxBill: 8750,
    optimizedTaxBill: 3750,
    potentialSavings: 5000,
    location: 'California'
  };

  const savingsPercentage = activeData.currentTaxBill > 0 
    ? (activeData.potentialSavings / activeData.currentTaxBill) * 100 
    : 0;

  // Mobile-optimized animations - faster and lighter
  const animatedValues = useStaggeredCountingAnimation(
    {
      heroMetric: activeData.potentialSavings,
      currentBill: activeData.currentTaxBill,
      optimizedBill: activeData.optimizedTaxBill,
      savingsPercent: savingsPercentage,
    },
    800, // Faster for mobile
    100
  );

  // Location-based insights optimized for mobile display
  const locationInsights = useMemo(() => {
    const location = activeData.location.toLowerCase();
    
    if (location.includes('puerto rico')) {
      return {
        advantage: 'Max Tax Advantage',
        description: '0% dividends tax',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: '🏝️',
        savings: `Save ${Math.round(activeData.potentialSavings).toLocaleString()}/yr`,
        priority: 'high'
      };
    }
    
    if (location.includes('california')) {
      return {
        advantage: 'High Tax State',
        description: 'Up to 37.3% rate',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: '💸',
        savings: `Move to PR: Save $${Math.round(activeData.potentialSavings).toLocaleString()}`,
        priority: 'critical'
      };
    }
    
    if (location.includes('texas') || location.includes('florida')) {
      return {
        advantage: 'No State Tax',
        description: 'Fed taxes only',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: '🏠',
        savings: 'PR saves 15% more',
        priority: 'medium'
      };
    }
    
    return {
      advantage: 'Tax Optimization',
      description: 'Explore options',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      icon: '📍',
      savings: 'Potential savings available',
      priority: 'low'
    };
  }, [activeData.location, activeData.potentialSavings]);

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
    
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Refresh tax data here
    } finally {
      setIsRefreshing(false);
    }
  };

  // Tab swipe navigation
  const swipeToNextTab = () => {
    const currentIndex = MOBILE_TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < MOBILE_TABS.length - 1) {
      setActiveTab(MOBILE_TABS[currentIndex + 1].id);
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  };

  const swipeToPrevTab = () => {
    const currentIndex = MOBILE_TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(MOBILE_TABS[currentIndex - 1].id);
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  };

  if (isLoading || hubLoading) {
    return (
      <div className="h-screen bg-slate-50">
        {/* Mobile Loading Skeleton */}
        <div className="animate-pulse p-4">
          <div className="h-16 bg-white/10 backdrop-blur rounded-xl mb-4"></div>
          <div className="h-32 bg-white/10 backdrop-blur rounded-xl mb-4"></div>
          <div className="flex space-x-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 h-12 bg-white/10 backdrop-blur rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-white/10 backdrop-blur rounded-xl"></div>
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
            <TrendingDown className="w-4 h-4" />
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-green-50">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">Tax Strategy</h1>
                <p className="text-xs text-slate-500">Optimization Hub</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBottomSheet(true)}
                className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
              >
                <Info className="w-4 h-4 text-slate-600" />
              </button>
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section - Compact for mobile */}
        <div className="px-4 py-6">
          <div className={`text-center p-6 bg-gradient-to-br rounded-2xl border-2 ${locationInsights.bgColor} ${locationInsights.color.replace('text-', 'border-').replace('-600', '-200')}`}>
            <div className="flex items-center justify-center mb-3">
              <div className={`p-3 rounded-xl ${locationInsights.bgColor}`}>
                <span className="text-2xl">{locationInsights.icon}</span>
              </div>
            </div>
            
            <div className="text-4xl font-bold text-gradient-prosperity mb-1">
              ${Math.round(animatedValues.heroMetric).toLocaleString()}
            </div>
            
            <div className="text-sm text-slate-600 mb-2">
              Annual Tax Savings Potential
            </div>

            <div className="text-lg font-semibold text-green-600 mb-3">
              {animatedValues.savingsPercent.toFixed(1)}% Reduction
            </div>

            {/* Location Alert - Prominent on mobile */}
            <div className={`p-3 rounded-xl ${locationInsights.bgColor} border ${locationInsights.color.replace('text-', 'border-').replace('-600', '-200')}`}>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className={`w-4 h-4 ${locationInsights.color}`} />
                <div className="text-center">
                  <div className={`font-semibold text-sm ${locationInsights.color}`}>
                    {locationInsights.advantage}
                  </div>
                  <div className="text-xs text-slate-600">
                    {locationInsights.savings}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Comparison - Mobile Cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="text-xl font-bold text-red-600 mb-1">
                ${Math.round(animatedValues.currentBill).toLocaleString()}
              </div>
              <div className="text-xs text-slate-600">Current Bill</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-xl font-bold text-green-600 mb-1">
                ${Math.round(animatedValues.optimizedBill).toLocaleString()}
              </div>
              <div className="text-xs text-slate-600">Optimized Bill</div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation - Bottom tabs */}
        <div className="px-4">
          <div className="flex bg-white/10 backdrop-blur rounded-2xl p-1 gap-1 shadow-lg border border-white/10">
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
                      layoutId="activeMobileTab"
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
              {activeTab === 'intelligence' && (
                <div className="space-y-4">
                  <TaxIntelligenceEngineCard />
                </div>
              )}

              {activeTab === 'savings' && (
                <div className="space-y-4">
                  <TaxSavingsCalculatorCard />
                </div>
              )}

              {activeTab === 'planning' && (
                <div className="space-y-4">
                  <TaxPlanning />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <TaxSettingsCard />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile-specific Puerto Rico CTA */}
        {!activeData.location.toLowerCase().includes('puerto rico') && (
          <div className="px-4 pb-4">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-4 text-white"
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏝️</div>
                <div className="flex-1">
                  <div className="font-bold">Move to Puerto Rico?</div>
                  <div className="text-sm opacity-90">Save ${Math.round(activeData.potentialSavings).toLocaleString()}/year on taxes</div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Swipe hints */}
        <div className="text-center text-xs text-slate-400 py-2">
          Swipe tabs • Pull to refresh
        </div>
      </div>

      {/* Bottom Sheet for additional info */}
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
            className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-lg font-bold mb-4">Tax Strategy Insights</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">Location Matters</h4>
                <p className="text-sm text-blue-600">
                  Your location significantly impacts your tax burden. Puerto Rico offers 0% tax on qualified dividends.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">Smart Optimization</h4>
                <p className="text-sm text-green-600">
                  AI-powered recommendations help maximize your after-tax income through strategic planning.
                </p>
              </div>
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

export const MobileTaxStrategyHub = memo(MobileTaxStrategyHubComponent, (prevProps, nextProps) => {
  return (
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.taxData?.potentialSavings === nextProps.taxData?.potentialSavings &&
    prevProps.taxData?.currentTaxBill === nextProps.taxData?.currentTaxBill &&
    prevProps.taxData?.location === nextProps.taxData?.location
  );
});