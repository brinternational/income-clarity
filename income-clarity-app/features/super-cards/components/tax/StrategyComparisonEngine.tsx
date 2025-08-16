'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  MapPin,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  Calculator,
  AlertTriangle,
  Lightbulb,
  PartyPopper,
  Heart,
  Target,
  Medal,
  Crown
} from 'lucide-react';
import { 
  STATE_TAX_RATES,
  calculateTotalTax,
  calculateFederalTax,
  type StateTaxInfo
} from '@/lib/state-tax-rates';

interface StrategyComparisonEngineProps {
  /** Annual income from investments */
  annualIncome?: number;
  /** User's current tax location (state code) */
  location?: string;
  /** User's filing status */
  filingStatus?: 'single' | 'marriedJoint';
  /** Whether to show export/share functionality */
  showActions?: boolean;
  /** Custom className for styling */
  className?: string;
}

interface StrategyComparison {
  strategy: 'spy_sell' | 'dividends' | 'covered_calls' | 'bonds_60_40';
  strategyName: string;
  description: string;
  grossYield: number;
  grossIncome: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  tenYearProjection: number[];
  taxSavings?: number; // vs worst strategy
  dollarAdvantage: string;
  isWinner: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  suitableFor: string[];
  pros: string[];
  cons: string[];
}

const STRATEGY_CONFIGS = {
  spy_sell: {
    name: 'Sell SPY Shares',
    description: 'Traditional 4% withdrawal by selling SPY shares',
    baseYield: 0.04,
    taxType: 'qualified' as const, // Capital gains tax treatment
    riskLevel: 'medium' as const,
    pros: [
      'Simple strategy',
      'Broad market exposure',
      'No dividend dependency'
    ],
    cons: [
      'Depletes principal',
      'Market timing risk',
      'No passive income'
    ]
  },
  dividends: {
    name: 'Dividend Portfolio',
    description: 'Quality dividend stocks (SCHD, VYM style)',
    baseYield: 0.038,
    taxType: 'qualified' as const, // Qualified dividend treatment
    riskLevel: 'low' as const,
    pros: [
      'Preserves principal',
      'Growing income stream',
      'Tax-advantaged'
    ],
    cons: [
      'Lower initial yield',
      'Sector concentration risk',
      'Dividend cut risk'
    ]
  },
  covered_calls: {
    name: 'Covered Calls',
    description: 'High-yield ETFs with covered call strategies (JEPI, QYLD)',
    baseYield: 0.11,
    taxType: 'ordinary' as const, // Ordinary income tax treatment
    riskLevel: 'medium' as const,
    pros: [
      'High current income',
      'Premium collection',
      'Downside protection'
    ],
    cons: [
      'Capped upside',
      'Higher tax burden',
      'Complex strategy'
    ]
  },
  bonds_60_40: {
    name: '60/40 Portfolio',
    description: 'Traditional 60% stocks, 40% bonds allocation',
    baseYield: 0.055,
    taxType: 'mixed' as const, // Mix of qualified dividends and ordinary interest
    riskLevel: 'medium' as const,
    pros: [
      'Diversification',
      'Interest + dividends',
      'Time-tested approach'
    ],
    cons: [
      'Interest rate risk',
      'Inflation exposure',
      'Mixed tax treatment'
    ]
  }
} as const;

export default function StrategyComparisonEngine({
  annualIncome = 100000,
  location = 'CA',
  filingStatus = 'single',
  showActions = true,
  className = ''
}: StrategyComparisonEngineProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showProjections, setShowProjections] = useState(false);
  const [animateWinner, setAnimateWinner] = useState(false);

  const locationName = STATE_TAX_RATES[location.toUpperCase()]?.name || location;
  const isPuertoRico = location.toUpperCase() === 'PR';

  // Calculate strategy comparisons
  const strategyComparisons = useMemo(() => {
    const strategies: StrategyComparison[] = [];
    
    Object.entries(STRATEGY_CONFIGS).forEach(([key, config]) => {
      const strategyKey = key as keyof typeof STRATEGY_CONFIGS;
      const grossIncome = annualIncome * config.baseYield;
      
      // Calculate taxes based on strategy type
      let federalTax = 0;
      let stateTax = 0;
      
      if (config.taxType === 'qualified') {
        // Qualified dividends or capital gains
        federalTax = calculateFederalTax(grossIncome, 'qualified', filingStatus);
        stateTax = STATE_TAX_RATES[location.toUpperCase()]?.rate 
          ? grossIncome * (STATE_TAX_RATES[location.toUpperCase()]?.rate * 0.75) // Some states have lower rates on capital gains
          : 0;
      } else if (config.taxType === 'ordinary') {
        // Ordinary income (covered calls, interest)
        federalTax = calculateFederalTax(grossIncome, 'ordinary', filingStatus);
        stateTax = STATE_TAX_RATES[location.toUpperCase()]?.rate 
          ? grossIncome * STATE_TAX_RATES[location.toUpperCase()]!.rate
          : 0;
      } else {
        // Mixed treatment (60/40 portfolio) - assume 70% qualified, 30% ordinary
        const qualifiedPortion = grossIncome * 0.7;
        const ordinaryPortion = grossIncome * 0.3;
        
        federalTax = calculateFederalTax(qualifiedPortion, 'qualified', filingStatus) +
                    calculateFederalTax(ordinaryPortion, 'ordinary', filingStatus);
        
        const stateRate = STATE_TAX_RATES[location.toUpperCase()]?.rate || 0;
        stateTax = (qualifiedPortion * stateRate * 0.75) + (ordinaryPortion * stateRate);
      }
      
      const totalTax = federalTax + stateTax;
      const netIncome = grossIncome - totalTax;
      const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
      
      // Generate 10-year projection assuming 3% annual growth in income
      const tenYearProjection = Array.from({ length: 10 }, (_, i) => {
        const yearIncome = netIncome * Math.pow(1.03, i);
        return yearIncome;
      });
      
      strategies.push({
        strategy: strategyKey,
        strategyName: config.name,
        description: config.description,
        grossYield: config.baseYield,
        grossIncome,
        federalTax,
        stateTax,
        totalTax,
        netIncome,
        effectiveTaxRate,
        tenYearProjection,
        dollarAdvantage: '',
        isWinner: false,
        riskLevel: config.riskLevel,
        suitableFor: ['Most investors'], // Will be customized below
        pros: [...config.pros],
        cons: [...config.cons]
      });
    });
    
    // Determine winner and calculate advantages
    const sortedByNet = [...strategies].sort((a, b) => b.netIncome - a.netIncome);
    const winner = sortedByNet[0];
    const baseline = sortedByNet[sortedByNet.length - 1]; // Worst performer
    
    strategies.forEach(strategy => {
      strategy.isWinner = strategy.strategy === winner.strategy;
      const advantageVsBaseline = strategy.netIncome - baseline.netIncome;
      strategy.taxSavings = advantageVsBaseline;
      
      if (advantageVsBaseline > 0) {
        strategy.dollarAdvantage = `+$${Math.round(advantageVsBaseline).toLocaleString()}`;
      } else if (advantageVsBaseline < 0) {
        strategy.dollarAdvantage = `-$${Math.round(Math.abs(advantageVsBaseline)).toLocaleString()}`;
      } else {
        strategy.dollarAdvantage = 'baseline';
      }
      
      // Customize suitability based on location and risk profile
      if (isPuertoRico) {
        if (strategy.strategy === 'dividends') {
          strategy.suitableFor = ['Puerto Rico residents', 'Tax-conscious investors'];
        } else if (strategy.strategy === 'spy_sell') {
          strategy.suitableFor = ['Zero-tax jurisdictions', 'Growth-focused investors'];
        }
      } else {
        const stateRate = STATE_TAX_RATES[location.toUpperCase()]?.rate || 0;
        if (stateRate === 0) {
          strategy.suitableFor = ['No-tax states', 'High-income investors'];
        } else if (stateRate > 0.08) {
          strategy.suitableFor = ['High-tax states', 'Income-focused investors'];
        }
      }
    });
    
    return strategies.sort((a, b) => b.netIncome - a.netIncome);
  }, [annualIncome, location, filingStatus]);

  const winner = strategyComparisons.find(s => s.isWinner);
  const maxSavings = Math.max(...strategyComparisons.map(s => s.taxSavings || 0));

  // Trigger winner animation when data changes
  useEffect(() => {
    if (winner) {
      setAnimateWinner(true);
      const timer = setTimeout(() => setAnimateWinner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [winner?.strategy, location]);

  const handleExport = useCallback(() => {
    // Generate CSV data for export
    const csvData = strategyComparisons.map(strategy => ({
      Strategy: strategy.strategyName,
      'Gross Yield': `${(strategy.grossYield * 100).toFixed(1)}%`,
      'Gross Income': `$${Math.round(strategy.grossIncome).toLocaleString()}`,
      'Federal Tax': `$${Math.round(strategy.federalTax).toLocaleString()}`,
      'State Tax': `$${Math.round(strategy.stateTax).toLocaleString()}`,
      'Net Income': `$${Math.round(strategy.netIncome).toLocaleString()}`,
      'Effective Rate': `${(strategy.effectiveTaxRate * 100).toFixed(1)}%`,
      'Dollar Advantage': strategy.dollarAdvantage
    }));

    // Convert to CSV and download
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy-comparison-${location}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [strategyComparisons, location]);

  const handleShare = useCallback(async () => {
    if (navigator.share && winner) {
      try {
        await navigator.share({
          title: 'Income Clarity - Strategy Comparison',
          text: `${winner.strategyName} is the best strategy for ${locationName}, generating $${Math.round(winner.netIncome).toLocaleString()} annual after-tax income!`,
          url: window.location.href
        });
      } catch (err) {
        // Error handled by emergency recovery script
      }
    }
  }, [winner, locationName]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Key Insights */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">
            Strategy Tax Comparison
          </h2>
        </div>
        
        <div className="text-slate-600 max-w-2xl mx-auto">
          <p>
            Compare 4 investment strategies based on your tax location. 
            See which approach maximizes your <strong>after-tax income</strong> in {locationName}.
          </p>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className={`p-6 rounded-2xl border-2 ${
              isPuertoRico 
                ? 'bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-amber-300'
                : 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-300'
            }`}>
              <div className="flex items-center justify-center space-x-3 mb-3">
                <motion.div
                  animate={animateWinner ? { rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: animateWinner ? 3 : 0 }}
                >
                  {isPuertoRico ? (
                    <PartyPopper className="w-8 h-8 text-amber-600" />
                  ) : (
                    <Crown className="w-8 h-8 text-green-600" />
                  )}
                </motion.div>
                <h3 className={`text-xl font-bold ${
                  isPuertoRico ? 'text-amber-900' : 'text-green-900'
                }`}>
                  Winner: {winner.strategyName}
                </h3>
                <Medal className={`w-6 h-6 ${
                  isPuertoRico ? 'text-amber-600' : 'text-green-600'
                }`} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-3xl font-bold ${
                    isPuertoRico ? 'text-amber-700' : 'text-green-700'
                  }`}>
                    ${Math.round(winner.netIncome).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Annual Take-Home</div>
                </div>
                
                <div>
                  <div className={`text-2xl font-bold ${
                    isPuertoRico ? 'text-amber-700' : 'text-green-700'
                  }`}>
                    {((1 - winner.effectiveTaxRate) * winner.grossYield * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-600">After-Tax Yield</div>
                </div>
                
                <div>
                  <div className={`text-2xl font-bold ${
                    isPuertoRico ? 'text-amber-700' : 'text-green-700'
                  }`}>
                    {winner.dollarAdvantage}
                  </div>
                  <div className="text-sm text-slate-600">vs Worst Strategy</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Puerto Rico Special Alert */}
        {isPuertoRico && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl border-2 border-amber-300"
          >
            <div className="flex items-center justify-center space-x-2 text-amber-800">
              <Star className="w-5 h-5" />
              <span className="font-semibold">
                🏝️ Puerto Rico Tax Paradise: 0% on qualified dividends!
              </span>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Strategy Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strategyComparisons.map((strategy, index) => (
          <motion.div
            key={strategy.strategy}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              strategy.isWinner
                ? isPuertoRico
                  ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400 shadow-lg shadow-amber-200/50'
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg shadow-green-200/50'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedStrategy(
              selectedStrategy === strategy.strategy ? null : strategy.strategy
            )}
          >
            {/* Winner Badge */}
            {strategy.isWinner && (
              <div className="absolute -top-3 -right-3">
                <motion.div
                  animate={animateWinner ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 1, repeat: animateWinner ? 2 : 0 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isPuertoRico
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                      : 'bg-gradient-to-br from-green-400 to-emerald-500'
                  } shadow-lg`}
                >
                  <Trophy className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            )}

            {/* Strategy Header */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {strategy.strategyName}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {strategy.description}
                  </p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  strategy.riskLevel === 'low' 
                    ? 'bg-green-100 text-green-700'
                    : strategy.riskLevel === 'high'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {strategy.riskLevel.toUpperCase()} RISK
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900">
                    {(strategy.grossYield * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-600">Gross Yield</div>
                </div>
                
                <div className={`text-center p-3 rounded-lg ${
                  strategy.isWinner
                    ? isPuertoRico
                      ? 'bg-amber-100'
                      : 'bg-green-100'
                    : 'bg-slate-50'
                }`}>
                  <div className={`text-lg font-bold ${
                    strategy.isWinner
                      ? isPuertoRico
                        ? 'text-amber-700'
                        : 'text-green-700'
                      : 'text-slate-900'
                  }`}>
                    ${Math.round(strategy.netIncome).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-600">After-Tax Income</div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {strategy.taxSavings && strategy.taxSavings > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : strategy.taxSavings && strategy.taxSavings < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : null}
                  
                  <span className={`text-sm font-medium ${
                    strategy.taxSavings && strategy.taxSavings > 0
                      ? 'text-green-700'
                      : strategy.taxSavings && strategy.taxSavings < 0
                        ? 'text-red-700'
                        : 'text-slate-600'
                  }`}>
                    {strategy.dollarAdvantage} per year
                  </span>
                </div>
                
                <div className="text-xs text-slate-500">
                  {(strategy.effectiveTaxRate * 100).toFixed(1)}% effective tax
                </div>
              </div>
            </div>

            {/* Expand/Collapse Indicator */}
            <div className="flex items-center justify-center">
              {selectedStrategy === strategy.strategy ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {selectedStrategy === strategy.strategy && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-slate-200 space-y-4"
                >
                  {/* Tax Breakdown */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center p-2 bg-slate-50 rounded">
                      <div className="font-semibold text-slate-900">
                        ${Math.round(strategy.federalTax).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600">Federal Tax</div>
                    </div>
                    
                    <div className="text-center p-2 bg-slate-50 rounded">
                      <div className="font-semibold text-slate-900">
                        ${Math.round(strategy.stateTax).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600">State Tax</div>
                    </div>
                    
                    <div className="text-center p-2 bg-slate-50 rounded">
                      <div className="font-semibold text-slate-900">
                        ${Math.round(strategy.totalTax).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600">Total Tax</div>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Advantages
                      </h4>
                      <ul className="space-y-1">
                        {strategy.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Considerations
                      </h4>
                      <ul className="space-y-1">
                        {strategy.cons.map((con, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suitable For */}
                  <div>
                    <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      Best For
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {strategy.suitableFor.map((suitable, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {suitable}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* 10-Year Projection Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowProjections(!showProjections)}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          <span>{showProjections ? 'Hide' : 'Show'} 10-Year Projections</span>
          {showProjections ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 10-Year Projections Chart */}
      <AnimatePresence>
        {showProjections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
              10-Year Income Projection (3% Annual Growth)
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {strategyComparisons.map((strategy) => (
                <div key={strategy.strategy} className="space-y-2">
                  <h4 className={`text-sm font-semibold ${
                    strategy.isWinner ? 'text-green-700' : 'text-slate-700'
                  }`}>
                    {strategy.strategyName}
                  </h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Year 1:</span>
                      <span className="font-medium">
                        ${Math.round(strategy.tenYearProjection[0]).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Year 5:</span>
                      <span className="font-medium">
                        ${Math.round(strategy.tenYearProjection[4]).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-green-700 font-semibold">
                      <span>Year 10:</span>
                      <span>
                        ${Math.round(strategy.tenYearProjection[9]).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className={`text-xs text-center p-2 rounded ${
                      strategy.isWinner ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      Total 10-Year: ${Math.round(
                        strategy.tenYearProjection.reduce((sum, year) => sum + year, 0)
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Results</span>
          </button>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      )}

      {/* Pro Tip */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Smart Strategy Selection</h4>
            <p className="text-sm text-blue-800 mb-3">
              The best strategy depends on your tax situation, risk tolerance, and income goals. 
              {isPuertoRico 
                ? ' As a Puerto Rico resident under Act 60, you have a significant tax advantage on qualified dividends!'
                : winner?.strategy === 'dividends' 
                  ? ' Qualified dividends offer excellent tax efficiency for long-term wealth building.'
                  : winner?.strategy === 'covered_calls'
                    ? ' High-yield strategies work well when you need immediate income, despite higher taxes.'
                    : ' Your current tax situation favors this approach for maximum after-tax income.'
              }
            </p>
            <div className="text-xs text-blue-700">
              💡 Consider combining strategies or consulting a tax advisor for personalized optimization.
            </div>
          </div>
        </div>
      </div>

      {/* Location Context */}
      <div className="text-center text-sm text-slate-500">
        <div className="flex items-center justify-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>
            Analysis for {locationName} • {filingStatus === 'single' ? 'Single' : 'Married Filing Jointly'} • 
            ${annualIncome.toLocaleString()} portfolio
          </span>
        </div>
      </div>
    </div>
  );
}