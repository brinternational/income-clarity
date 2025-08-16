'use client';

/**
 * TaxStrategyHubDemo - Complete demonstration of TAX-012 through TAX-018 features
 * 
 * THE COMPETITIVE MOAT: Shows how all tax strategy components work together
 * to create a comprehensive analysis system that prominently displays 
 * Puerto Rico's 0% tax advantage across all investment strategies.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FourStrategyAnalysis,
  LocationBasedWinner,
  MultiStateTaxComparison,
  ROCTracker
} from './index';
import { 
  Crown, 
  TrendingUp, 
  Calculator,
  BarChart3,
  Star,
  ArrowRight
} from 'lucide-react';

interface TaxStrategyHubDemoProps {
  portfolioValue?: number;
  className?: string;
}

export const TaxStrategyHubDemo: React.FC<TaxStrategyHubDemoProps> = ({
  portfolioValue = 1000000,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'four-strategy' | 'location' | 'multi-state' | 'roc'>('four-strategy');

  const tabs = [
    {
      id: 'four-strategy' as const,
      label: '4-Strategy Analysis',
      icon: Calculator,
      description: 'Compare all 4 investment strategies',
      color: 'blue'
    },
    {
      id: 'location' as const,
      label: 'Location Winners',
      icon: Crown,
      description: 'Winners by location with PR advantage',
      color: 'green'
    },
    {
      id: 'multi-state' as const,
      label: 'Multi-State Comparison',
      icon: BarChart3,
      description: 'All 50 states + Puerto Rico',
      color: 'purple'
    },
    {
      id: 'roc' as const,
      label: 'ROC Tracker',
      icon: TrendingUp,
      description: '19a ROC distribution tracking',
      color: 'emerald'
    }
  ];

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-8">
        <div className="text-center">
          <motion.h2 
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🏝️ Tax Strategy Hub
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            THE COMPETITIVE MOAT - Complete tax optimization analysis
          </motion.p>
          <motion.div
            className="flex items-center justify-center space-x-2 text-yellow-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Crown className="h-6 w-6" />
            <span className="text-lg font-semibold">Puerto Rico ALWAYS Wins!</span>
            <Star className="h-6 w-6" />
          </motion.div>
        </div>

        {/* Portfolio Value Display */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-3 bg-white/20 rounded-full px-6 py-3">
            <span className="text-white font-medium">Portfolio Value:</span>
            <span className="text-2xl font-bold text-yellow-200">
              ${portfolioValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-3 px-8 py-6 border-b-4 transition-all ${
                  isActive
                    ? `border-${tab.color}-500 bg-${tab.color}-50 text-${tab.color}-700`
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-6 w-6 ${
                  isActive ? `text-${tab.color}-600` : 'text-gray-500'
                }`} />
                <div className="text-left">
                  <p className={`font-semibold ${
                    isActive ? `text-${tab.color}-900` : 'text-gray-900'
                  }`}>
                    {tab.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Puerto Rico Advantage Banner */}
      <motion.div
        className="bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 border-b-2 border-yellow-300 p-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-400 rounded-full">
              <Crown className="h-6 w-6 text-yellow-800" />
            </div>
            <div>
              <p className="text-lg font-bold text-orange-800">
                🏝️ Puerto Rico Tax Paradise
              </p>
              <p className="text-orange-700">
                0% tax on qualified dividends • Unmatched competitive advantage
              </p>
            </div>
          </div>
          <ArrowRight className="h-8 w-8 text-orange-600" />
          <div className="text-center">
            <p className="text-sm text-orange-700">Potential Annual Savings</p>
            <p className="text-2xl font-bold text-green-600">
              ${(portfolioValue * 0.05 * 0.238).toLocaleString()}+
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {activeTab === 'four-strategy' && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  📊 4-Strategy Tax Analysis
                </h3>
                <p className="text-gray-600">
                  Complete comparison of all investment strategies with after-tax returns.
                  Puerto Rico's 0% qualified dividend tax makes dividend strategies the clear winner!
                </p>
              </div>
              <FourStrategyAnalysis 
                portfolioValue={portfolioValue}
                currentLocation="Puerto Rico"
                className="shadow-lg"
              />
            </div>
          )}

          {activeTab === 'location' && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🗺️ Location-Based Winners
                </h3>
                <p className="text-gray-600">
                  Interactive visualization showing which strategy wins in each location.
                  See why Puerto Rico dominates across all scenarios!
                </p>
              </div>
              <LocationBasedWinner 
                portfolioValue={portfolioValue}
                targetIncome={60000}
                className="shadow-lg"
              />
            </div>
          )}

          {activeTab === 'multi-state' && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🌎 Multi-State Tax Comparison
                </h3>
                <p className="text-gray-600">
                  Compare all 50 states plus Puerto Rico with migration analysis.
                  Discover exactly how much you could save by moving to Puerto Rico!
                </p>
              </div>
              <MultiStateTaxComparison 
                portfolioValue={portfolioValue}
                selectedStrategy="dividend"
                className="shadow-lg"
              />
            </div>
          )}

          {activeTab === 'roc' && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  📊 Return of Capital Tracker
                </h3>
                <p className="text-gray-600">
                  Track 19a ROC distributions for maximum tax efficiency.
                  Even more powerful when combined with Puerto Rico's tax advantages!
                </p>
              </div>
              <ROCTracker className="shadow-lg" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer Call to Action */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
        <div className="text-center">
          <h4 className="text-xl font-bold text-white mb-2">
            Ready to Maximize Your Tax Savings?
          </h4>
          <p className="text-green-100 mb-4">
            Puerto Rico offers the ultimate tax advantage for dividend investors
          </p>
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <p className="text-green-100 text-sm">Potential Annual Savings</p>
              <p className="text-2xl font-bold text-white">
                ${(portfolioValue * 0.05 * 0.238).toLocaleString()}
              </p>
            </div>
            <ArrowRight className="h-8 w-8 text-white" />
            <div className="text-center">
              <p className="text-green-100 text-sm">10-Year Advantage</p>
              <p className="text-2xl font-bold text-yellow-200">
                ${(portfolioValue * 0.05 * 0.238 * 10).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxStrategyHubDemo;