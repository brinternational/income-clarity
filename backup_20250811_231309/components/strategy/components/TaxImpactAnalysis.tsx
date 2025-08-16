'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  Info,
  Target,
  PieChart,
  BarChart3,
  Zap,
  MapPin
} from 'lucide-react';

interface CurrentSituation {
  location: string;
  ytdGains: number;
  ytdLosses: number;
  netTaxLiability: number;
  effectiveTaxRate: number;
}

interface TradeRecommendation {
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

interface LocationOptimization {
  capitalGainsTax: number;
  dividendTax: number;
  strategy: string;
  specialRules: string[];
  advantages: string[];
}

interface TaxImpactAnalysisProps {
  currentSituation: CurrentSituation;
  tradeRecommendations: TradeRecommendation[];
  locationOptimization: LocationOptimization;
  estimatedSavings: number;
}

export const TaxImpactAnalysis: React.FC<TaxImpactAnalysisProps> = ({
  currentSituation,
  tradeRecommendations,
  locationOptimization,
  estimatedSavings
}) => {
  // Calculate tax impact breakdown
  const taxAnalysis = React.useMemo(() => {
    let shortTermGains = 0;
    let longTermGains = 0;
    let shortTermLosses = 0;
    let longTermLosses = 0;
    let taxLossHarvesting = 0;

    tradeRecommendations.forEach(trade => {
      const gainLoss = (trade.currentPrice - trade.costBasis) * trade.shares;
      
      if (trade.action === 'sell') {
        if (trade.taxStatus === 'long-term') {
          if (gainLoss > 0) {
            longTermGains += gainLoss;
          } else {
            longTermLosses += Math.abs(gainLoss);
            if (trade.taxImpact < 0) {
              taxLossHarvesting += Math.abs(trade.taxImpact);
            }
          }
        } else {
          if (gainLoss > 0) {
            shortTermGains += gainLoss;
          } else {
            shortTermLosses += Math.abs(gainLoss);
            if (trade.taxImpact < 0) {
              taxLossHarvesting += Math.abs(trade.taxImpact);
            }
          }
        }
      }
    });

    return {
      shortTermGains,
      longTermGains,
      shortTermLosses,
      longTermLosses,
      taxLossHarvesting,
      netGains: shortTermGains + longTermGains - shortTermLosses - longTermLosses
    };
  }, [tradeRecommendations]);

  // Calculate tax optimization strategies
  const optimizationStrategies = React.useMemo(() => {
    const strategies = [];

    // Tax Loss Harvesting
    const harvestingOpportunity = tradeRecommendations.filter(t => t.taxImpact < 0);
    if (harvestingOpportunity.length > 0) {
      strategies.push({
        id: 'tax-loss-harvesting',
        name: 'Tax Loss Harvesting',
        description: 'Realize losses to offset gains',
        trades: harvestingOpportunity.length,
        savings: harvestingOpportunity.reduce((sum, t) => sum + Math.abs(t.taxImpact), 0),
        icon: Zap,
        color: 'green'
      });
    }

    // Long-term vs Short-term optimization
    const longTermTrades = tradeRecommendations.filter(t => 
      t.taxStatus === 'long-term' && t.action === 'sell'
    );
    if (longTermTrades.length > 0) {
      strategies.push({
        id: 'long-term-optimization',
        name: 'Long-Term Capital Gains',
        description: 'Prioritize long-term holdings for lower tax rates',
        trades: longTermTrades.length,
        savings: longTermTrades.length * 500, // Estimated savings per trade
        icon: Clock,
        color: 'blue'
      });
    }

    // Location-based optimization
    if (currentSituation.location === 'Puerto Rico') {
      strategies.push({
        id: 'puerto-rico-advantage',
        name: 'Puerto Rico Act 60',
        description: 'Zero tax on qualified income and gains',
        trades: tradeRecommendations.length,
        savings: taxAnalysis.netGains * 0.20, // 20% federal rate avoided
        icon: Award,
        color: 'purple'
      });
    }

    return strategies;
  }, [tradeRecommendations, currentSituation, taxAnalysis]);

  // Multi-year tax planning scenarios
  const taxScenarios = [
    {
      name: 'Current Year',
      gains: currentSituation.ytdGains + taxAnalysis.netGains,
      losses: currentSituation.ytdLosses + taxAnalysis.shortTermLosses + taxAnalysis.longTermLosses,
      taxBill: currentSituation.netTaxLiability,
      savings: estimatedSavings
    },
    {
      name: 'Next Year',
      gains: currentSituation.ytdGains * 1.15, // Projected 15% growth
      losses: 0,
      taxBill: currentSituation.ytdGains * 1.15 * locationOptimization.capitalGainsTax,
      savings: 0
    },
    {
      name: '3-Year Projection',
      gains: currentSituation.ytdGains * 1.45, // 45% growth over 3 years
      losses: 0,
      taxBill: currentSituation.ytdGains * 1.45 * locationOptimization.capitalGainsTax,
      savings: estimatedSavings * 2.5 // Compounded savings
    }
  ];

  return (
    <div className="space-y-8">
      {/* Tax Impact Overview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-blue-600" />
            Tax Impact Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Detailed breakdown of tax implications for your rebalancing strategy
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Short-Term Gains */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-5 w-5 text-red-600" />
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  SHORT-TERM
                </span>
              </div>
              <h4 className="text-lg font-bold text-red-700">
                ${taxAnalysis.shortTermGains.toLocaleString()}
              </h4>
              <p className="text-sm text-red-600">Capital Gains</p>
              <p className="text-xs text-red-500 mt-1">
                Taxed as ordinary income
              </p>
            </div>

            {/* Long-Term Gains */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  LONG-TERM
                </span>
              </div>
              <h4 className="text-lg font-bold text-blue-700">
                ${taxAnalysis.longTermGains.toLocaleString()}
              </h4>
              <p className="text-sm text-blue-600">Capital Gains</p>
              <p className="text-xs text-blue-500 mt-1">
                Preferential tax rates
              </p>
            </div>

            {/* Tax Losses */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  HARVEST
                </span>
              </div>
              <h4 className="text-lg font-bold text-green-700">
                ${(taxAnalysis.shortTermLosses + taxAnalysis.longTermLosses).toLocaleString()}
              </h4>
              <p className="text-sm text-green-600">Tax Losses</p>
              <p className="text-xs text-green-500 mt-1">
                Offset gains & save taxes
              </p>
            </div>

            {/* Tax Savings */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <Shield className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                  SAVINGS
                </span>
              </div>
              <h4 className="text-lg font-bold text-emerald-700">
                ${taxAnalysis.taxLossHarvesting.toLocaleString()}
              </h4>
              <p className="text-sm text-emerald-600">Tax Benefits</p>
              <p className="text-xs text-emerald-500 mt-1">
                From loss harvesting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Optimization Strategies */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Tax Optimization Strategies
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Available strategies to minimize your tax burden
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimizationStrategies.map((strategy, index) => {
              const Icon = strategy.icon;
              const colorClasses = {
                green: 'bg-green-50 border-green-200 text-green-800',
                blue: 'bg-blue-50 border-blue-200 text-blue-800',
                purple: 'bg-purple-50 border-purple-200 text-purple-800'
              };
              
              return (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-lg p-6 border-2 ${colorClasses[strategy.color]}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
                      {strategy.trades} trades
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-2">{strategy.name}</h4>
                  <p className="text-sm opacity-80 mb-3">{strategy.description}</p>
                  <div className="text-2xl font-bold">
                    ${strategy.savings.toLocaleString()}
                  </div>
                  <p className="text-sm opacity-70">Estimated savings</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Year Tax Scenarios */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
            Multi-Year Tax Projection
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Project tax implications over multiple years
          </p>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Period</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Gains</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Losses</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Tax Bill</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Savings</th>
                </tr>
              </thead>
              <tbody>
                {taxScenarios.map((scenario, index) => (
                  <motion.tr
                    key={scenario.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{scenario.name}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium text-red-600">
                        ${scenario.gains.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium text-green-600">
                        ${scenario.losses.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-gray-900">
                        ${scenario.taxBill.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-emerald-600">
                        ${scenario.savings.toLocaleString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Location-Specific Tax Benefits */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
            Location-Specific Tax Benefits
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tax advantages based on your current location: {currentSituation.location}
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Benefits */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-4 w-4 mr-2 text-emerald-600" />
                Active Benefits
              </h4>
              <div className="space-y-3">
                {locationOptimization.advantages.map((advantage, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <Shield className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-emerald-800">{advantage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Comparison */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="h-4 w-4 mr-2 text-blue-600" />
                Tax Rate Comparison
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Your Location ({currentSituation.location}):</span>
                  <span className="font-bold text-emerald-600">
                    {locationOptimization.capitalGainsTax === 0 ? '0%' : `${(locationOptimization.capitalGainsTax * 100).toFixed(1)}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">California (High Tax):</span>
                  <span className="font-bold text-red-600">33.3%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Federal Average:</span>
                  <span className="font-bold text-gray-600">20.0%</span>
                </div>
                {currentSituation.location === 'Puerto Rico' && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Special Note</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      As a Puerto Rico resident under Act 60, you pay 0% on qualifying investment income and capital gains, 
                      potentially saving thousands annually compared to mainland US tax rates.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};