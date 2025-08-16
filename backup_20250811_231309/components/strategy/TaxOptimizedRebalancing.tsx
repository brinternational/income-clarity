'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  Play,
  AlertTriangle,
  Zap,
  Activity,
  Clock,
  Users,
  Award,
  Timer,
  FileText,
  Info,
  BarChart3,
  Filter,
  Download,
  Smartphone,
  MapPin,
  Calculator,
  Percent,
  PieChart,
  TrendingUp as Growth,
  Layers
} from 'lucide-react';
import { useTaxOptimizedRebalancing } from '@/hooks/useTaxOptimizedRebalancing';
import { useUserStore } from '@/store/userStore';
import { RebalancingDashboard } from './components/RebalancingDashboard';
import { TaxImpactAnalysis } from './components/TaxImpactAnalysis';
import { TradeRecommendations } from './components/TradeRecommendations';
import { WashSaleCalendar } from './components/WashSaleCalendar';

interface TaxOptimizedRebalancingProps {
  className?: string;
}

interface RebalancingStrategy {
  id: string;
  name: string;
  description: string;
  targetAllocation: AssetAllocation;
  currentAllocation: AssetAllocation;
  taxImpact: TaxImpact;
  recommendedTrades: Trade[];
  estimatedSavings: number;
  executionPriority: 'immediate' | 'end-of-quarter' | 'year-end';
}

interface AssetAllocation {
  stocks: number;
  bonds: number;
  reits: number;
  international: number;
  cash: number;
  alternatives: number;
}

interface TaxImpact {
  shortTermGains: number;
  longTermGains: number;
  shortTermLosses: number;
  longTermLosses: number;
  netTaxLiability: number;
  effectiveTaxRate: number;
  location: string;
}

interface Trade {
  id: string;
  action: 'buy' | 'sell';
  ticker: string;
  shares: number;
  lotId?: string;
  currentPrice: number;
  costBasis: number;
  holdingPeriod: number;
  taxStatus: 'short-term' | 'long-term' | 'qualified' | 'ordinary';
  taxImpact: number;
  reason: string;
}

const REBALANCING_STRATEGIES = [
  {
    id: 'aggressive-harvest',
    name: 'Aggressive Tax Loss Harvesting',
    description: 'Maximize loss realization to offset gains',
    riskLevel: 'high',
    expectedSavings: 4500
  },
  {
    id: 'puerto-rico-optimize',
    name: 'Puerto Rico Income Maximization',
    description: 'Zero tax optimization with Act 60 benefits',
    riskLevel: 'low',
    expectedSavings: 8200
  },
  {
    id: 'year-end-planning',
    name: 'Year-End Tax Planning',
    description: 'December optimization for tax year',
    riskLevel: 'medium',
    expectedSavings: 3200
  },
  {
    id: 'retirement-transition',
    name: 'Retirement Transition',
    description: 'Pre-retirement rebalancing strategy',
    riskLevel: 'low',
    expectedSavings: 2800
  },
  {
    id: 'high-tax-state',
    name: 'High Tax State Strategy',
    description: 'CA/NY optimization focus',
    riskLevel: 'medium',
    expectedSavings: 5200
  }
];

const TRIGGER_TYPES = {
  'threshold-5': '5% Deviation Threshold',
  'threshold-10': '10% Deviation Threshold', 
  'threshold-15': '15% Deviation Threshold',
  'monthly': 'Monthly Calendar',
  'quarterly': 'Quarterly Calendar',
  'annually': 'Annual Calendar',
  'volatility': 'Market Volatility Events',
  'harvest': 'Tax Loss Opportunities'
};

export const TaxOptimizedRebalancing: React.FC<TaxOptimizedRebalancingProps> = ({
  className = ''
}) => {
  const user = useUserStore(state => state.user);
  const [selectedStrategy, setSelectedStrategy] = useState('puerto-rico-optimize');
  const [selectedTrigger, setSelectedTrigger] = useState('threshold-10');
  const [viewMode, setViewMode] = useState<'dashboard' | 'analysis' | 'trades' | 'calendar'>('dashboard');
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [executionMode, setExecutionMode] = useState<'preview' | 'execute' | 'export'>('preview');
  const [showMobile, setShowMobile] = useState(false);

  const {
    rebalancingStrategy,
    taxSituation,
    tradeRecommendations,
    portfolioDrift,
    harvestingOpportunities,
    washSaleRisks,
    estimatedSavings,
    isLoading,
    error,
    executeRebalancing,
    previewTrades,
    exportStrategy
  } = useTaxOptimizedRebalancing({
    strategy: selectedStrategy,
    trigger: selectedTrigger,
    userLocation: user?.location?.state || 'California'
  });

  // Mock data for demonstration (would be replaced by real hook data)
  const mockData = useMemo(() => ({
    currentTaxSituation: {
      location: user?.location?.state || 'Puerto Rico',
      ytdGains: 12450,
      ytdLosses: 3200,
      netTaxLiability: 0, // Puerto Rico Act 60 benefit
      effectiveTaxRate: 0
    },
    portfolioDrift: [
      { asset: 'Stocks', target: 60, current: 68, drift: 8, action: 'Sell' },
      { asset: 'Bonds', target: 20, current: 15, drift: -5, action: 'Buy' },
      { asset: 'REITs', target: 15, current: 12, drift: -3, action: 'Buy' },
      { asset: 'Cash', target: 5, current: 5, drift: 0, action: 'Hold' }
    ],
    tradeRecommendations: [
      {
        id: '1',
        action: 'sell' as const,
        ticker: 'SCHD',
        shares: 50,
        lotId: 'Lot-3',
        currentPrice: 75.20,
        costBasis: 72.50,
        holdingPeriod: 380,
        taxStatus: 'long-term' as const,
        taxImpact: 0, // Puerto Rico resident
        reason: 'Rebalance overweight dividend position'
      },
      {
        id: '2',
        action: 'sell' as const,
        ticker: 'ARKK',
        shares: 100,
        lotId: 'Lot-1',
        currentPrice: 45.80,
        costBasis: 68.90,
        holdingPeriod: 245,
        taxStatus: 'short-term' as const,
        taxImpact: -2300, // Tax loss benefit
        reason: 'Harvest tax loss - down 34%'
      },
      {
        id: '3',
        action: 'buy' as const,
        ticker: 'AGG',
        shares: 200,
        currentPrice: 105.40,
        costBasis: 105.40,
        holdingPeriod: 0,
        taxStatus: 'qualified' as const,
        taxImpact: 0,
        reason: 'Rebalance underweight bond allocation'
      }
    ],
    estimatedSavings: 4500,
    washSaleRisks: [
      {
        ticker: 'ARKK',
        riskLevel: 'low',
        daysUntilClear: 15,
        alternative: 'VTI'
      }
    ]
  }), [user]);

  const handleTradeToggle = useCallback((tradeId: string) => {
    setSelectedTrades(prev => 
      prev.includes(tradeId) 
        ? prev.filter(id => id !== tradeId)
        : [...prev, tradeId]
    );
  }, []);

  const handlePreviewTrades = useCallback(async () => {
    try {
      const preview = await previewTrades(selectedTrades);
      // console.log('Trade preview:', preview);
      // setExecutionMode('execute');
    } catch (error) {
      // Error handled by emergency recovery script, [selectedTrades, previewTrades]);

  const handleExecuteTrades = useCallback(async () => {
    try {
      const results = await executeRebalancing(selectedTrades);
      // console.log('Trades executed:', results);
      // Show success notification
    } catch (error) {
      // Error handled by emergency recovery script, [selectedTrades, executeRebalancing]);

  const handleExportStrategy = useCallback(async () => {
    try {
      const exportData = await exportStrategy(selectedStrategy);
      // Trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rebalancing-strategy-${selectedStrategy}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Error handled by emergency recovery script, [selectedStrategy, exportStrategy]);

  const locationOptimization = useMemo(() => {
    const location = user?.location?.state || 'Puerto Rico';
    const optimizations = {
      'Puerto Rico': {
        capitalGainsTax: 0,
        dividendTax: 0,
        strategy: 'maximize-income',
        specialRules: ['Act 60', 'Act 22'],
        advantages: ['0% on qualified dividends', '0% on capital gains', 'No federal tax on PR income']
      },
      'California': {
        capitalGainsTax: 0.133,
        dividendTax: 0.133,
        strategy: 'tax-loss-harvest',
        specialRules: [],
        advantages: ['Harvest losses aggressively', 'Defer gains to next year']
      },
      'Texas': {
        capitalGainsTax: 0,
        dividendTax: 0,
        strategy: 'federal-only',
        specialRules: [],
        advantages: ['No state taxes', 'Focus on federal optimization']
      }
    };
    return optimizations[location] || optimizations['California'];
  }, [user]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <Target className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Tax-Optimized Rebalancing Engine</h2>
              <p className="text-emerald-100">
                Smart portfolio rebalancing with location-aware tax optimization
              </p>
            </div>
          </div>
          
          {/* Mobile Toggle */}
          <button
            onClick={() => setShowMobile(!showMobile)}
            className="lg:hidden flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white"
          >
            <Smartphone className="h-4 w-4" />
            <span>Mobile View</span>
          </button>
        </div>

        {/* Strategy & Trigger Selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Rebalancing Strategy
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {REBALANCING_STRATEGIES.map(strategy => (
                <option key={strategy.id} value={strategy.id} className="text-gray-900">
                  {strategy.name} (${strategy.expectedSavings.toLocaleString()} savings)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-emerald-100 text-sm font-medium mb-2">
              Rebalancing Trigger
            </label>
            <select
              value={selectedTrigger}
              onChange={(e) => setSelectedTrigger(e.target.value)}
              className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {Object.entries(TRIGGER_TYPES).map(([key, label]) => (
                <option key={key} value={key} className="text-gray-900">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'analysis', label: 'Tax Analysis', icon: Calculator },
            { key: 'trades', label: 'Trade Recommendations', icon: Activity },
            { key: 'calendar', label: 'Wash Sale Calendar', icon: Calendar }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key as typeof viewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === key
                  ? 'bg-white text-emerald-600'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Tax Situation Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="bg-blue-100 rounded-lg p-3">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Current Tax Situation</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>📍 Location: <strong>{mockData.currentTaxSituation.location}</strong></span>
                <span>💰 YTD Gains: <strong>${mockData.currentTaxSituation.ytdGains.toLocaleString()}</strong></span>
                <span>📉 YTD Losses: <strong>${mockData.currentTaxSituation.ytdLosses.toLocaleString()}</strong></span>
              </div>
              {mockData.currentTaxSituation.location === 'Puerto Rico' && (
                <div className="mt-2 flex items-center space-x-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    Net Tax Liability: $0 (Act 60 Benefits) 🎉
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-600">
              ${mockData.estimatedSavings.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Estimated Annual Tax Savings</p>
          </div>
        </div>
      </div>

      {/* Content Views */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RebalancingDashboard
                portfolioDrift={mockData.portfolioDrift}
                tradeRecommendations={mockData.tradeRecommendations}
                estimatedSavings={mockData.estimatedSavings}
                locationOptimization={locationOptimization}
                onTradeToggle={handleTradeToggle}
                selectedTrades={selectedTrades}
              />
            </motion.div>
          )}

          {viewMode === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TaxImpactAnalysis
                currentSituation={mockData.currentTaxSituation}
                tradeRecommendations={mockData.tradeRecommendations}
                locationOptimization={locationOptimization}
                estimatedSavings={mockData.estimatedSavings}
              />
            </motion.div>
          )}

          {viewMode === 'trades' && (
            <motion.div
              key="trades"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TradeRecommendations
                trades={mockData.tradeRecommendations}
                washSaleRisks={mockData.washSaleRisks}
                selectedTrades={selectedTrades}
                onTradeToggle={handleTradeToggle}
                onPreviewTrades={handlePreviewTrades}
                onExecuteTrades={handleExecuteTrades}
                executionMode={executionMode}
              />
            </motion.div>
          )}

          {viewMode === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WashSaleCalendar
                trades={mockData.tradeRecommendations}
                washSaleRisks={mockData.washSaleRisks}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="bg-gray-50 border-t px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              {selectedTrades.length} trades selected
            </span>
            <span>•</span>
            <span>
              Est. impact: {selectedTrades.length > 0 ? '+' : ''}$
              {mockData.tradeRecommendations
                .filter(t => selectedTrades.includes(t.id))
                .reduce((sum, t) => sum + Math.abs(t.taxImpact), 0)
                .toLocaleString()} tax benefit
            </span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handlePreviewTrades}
              disabled={selectedTrades.length === 0}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              <span>Preview Trades</span>
            </button>
            
            <button
              onClick={handleExecuteTrades}
              disabled={selectedTrades.length === 0 || executionMode !== 'execute'}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Execute</span>
            </button>
            
            <button
              onClick={handleExportStrategy}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};