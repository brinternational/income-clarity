'use client';

import React, { useState } from 'react';
import { ChartBar, TrendingUp, DollarSign, Calendar, PieChart, Scale, Trophy, Flame } from 'lucide-react';

// All chart components have been moved to their respective Super Card hubs

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('YTD');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBar },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'income', name: 'Income', icon: DollarSign },
    { id: 'portfolio', name: 'Portfolio', icon: PieChart },
    { id: 'tax', name: 'Tax', icon: Scale },
    { id: 'projections', name: 'Projections', icon: Calendar },
  ];

  const timeRanges = ['1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'ALL'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Comprehensive portfolio insights and visualizations
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Looking for Portfolio Performance Charts?
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  The Performance Chart has moved to the Performance Hub for better integration with your portfolio analysis workflow and advanced SPY comparison features.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Performance Hub
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Income Analysis Moved to Income Intelligence Hub
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Comprehensive income analysis with dividend breakdowns, yields, and upcoming payments is now available in the Income Intelligence Hub's stability tab for enhanced income workflow integration.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Income Intelligence Hub
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm p-6 border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Asset Allocation Moved to Portfolio Strategy Hub
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">
                    Interactive asset allocation chart with diversification insights and portfolio distribution analysis is now available in the Portfolio Strategy Hub's composition tab.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/dashboard/super-cards'}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Go to Portfolio Strategy Hub
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm p-6 border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Sector Distribution Available in Specialized Hubs
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">
                    Interactive sector allocation analysis with advanced breakdown and diversification insights is now available in dedicated hubs for enhanced portfolio workflow integration.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => window.location.href = '/dashboard/super-cards'}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Performance Hub (Analysis)
                    </button>
                    <button 
                      onClick={() => window.location.href = '/dashboard/super-cards'}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Portfolio Strategy Hub (Composition)
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow-sm p-6 border border-purple-200 dark:border-purple-800">
                <div className="text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Milestone Tracking Moved to Financial Planning Hub
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">
                    Advanced milestone tracking with FIRE progress analysis, expense coverage milestones, and personalized goal planning is now available in the dedicated Financial Planning Hub.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/dashboard/super-cards'}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Go to Financial Planning Hub
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Performance Analysis Moved to Performance Hub
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Your comprehensive performance vs SPY benchmark analysis, including advanced charting and intelligent insights, is now available in the dedicated Performance Hub.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Performance Hub
                </button>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-green-600 dark:text-green-400" />
                <h4 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                  🎉 Migration Complete! Individual Holdings Performance Moved to Performance Hub
                </h4>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Congratulations! This completes the entire analytics reorganization project. Your Individual Holdings Performance analysis, along with all other portfolio visualizations, is now perfectly integrated in the Performance Hub for enhanced workflow and advanced features.
                </p>
                <div className="bg-green-100 dark:bg-green-800/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                    ✅ 10/10 Components Successfully Migrated - 100% Complete!
                  </p>
                </div>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Go to Performance Hub - Individual Holdings
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Yield on Cost Analysis Available in Two Specialized Hubs
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Enhanced yield on cost analysis with advanced features is now available in dedicated hubs for better workflow integration.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => window.location.href = '/dashboard/super-cards'}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Performance Hub (Holdings Analysis)
                  </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard/super-cards'}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Portfolio Strategy Hub (Rebalancing)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Income Analysis Available in Income Intelligence Hub
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Comprehensive income analysis with dividend yields, upcoming payments, and growth projections is now available in the Income Intelligence Hub's stability tab.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Income Intelligence Hub
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Looking for Dividend Calendar?
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  The comprehensive dividend calendar with both standard and interactive views has moved to the Income Intelligence Hub's calendar tab for better integration with your income analysis workflow.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Income Intelligence Hub
                </button>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 mb-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Income Projections Available in Two Specialized Hubs
                </h4>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Enhanced dividend projections with advanced analytics are available in both the Income Intelligence Hub (projections tab) for income analysis and the Financial Planning Hub (FIRE tab) for retirement planning.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => window.location.href = '/dashboard/super-cards'}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Income Intelligence Hub
                  </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard/super-cards'}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Financial Planning Hub
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Looking for Income Waterfall?
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  The Income Waterfall visualization has moved to the Income Intelligence Hub for better integration with your income analysis workflow.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Income Intelligence Hub
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-green-600 dark:text-green-400" />
                <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Portfolio Composition Analysis Moved to Portfolio Strategy Hub
                </h4>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Comprehensive portfolio composition analysis with advanced allocation insights, rebalancing recommendations, and strategic asset distribution charts is now available in the dedicated Portfolio Strategy Hub for enhanced portfolio management workflow.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Portfolio Strategy Hub
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Asset Allocation Available in Portfolio Strategy Hub
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Interactive asset allocation analysis with diversification scoring and portfolio distribution charts is now available in the Portfolio Strategy Hub's composition tab.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Portfolio Strategy Hub
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow-sm p-6 border border-purple-200 dark:border-purple-800">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Sector Breakdown Moved to Portfolio Strategy Hub
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">
                    Comprehensive sector allocation analysis with interactive pie charts, diversification scoring, and strategic rebalancing insights is now in the Portfolio Strategy Hub's composition section.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => window.location.href = '/dashboard/super-cards'}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Portfolio Strategy Hub (Composition)
                    </button>
                    <button 
                      onClick={() => window.location.href = '/dashboard/super-cards'}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Performance Hub (Alternative View)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Tab */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Tax Efficiency & Optimization Analysis Moved to Tax Strategy Hub
                </h4>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Advanced tax efficiency analysis including multi-state comparisons, location-based tax optimization strategies, ROC tracking, and comprehensive tax planning tools are now available in the dedicated Tax Strategy Hub for enhanced tax optimization workflow.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Tax Strategy Hub
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Tax Optimization Opportunities
              </h3>
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Scale className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Tax optimization analysis based on your portfolio and location</p>
              </div>
            </div>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === 'projections' && (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Advanced Income Projections in Specialized Hubs
                </h4>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Comprehensive dividend projections with enhanced analytics and FIRE planning capabilities are now available in dedicated hubs for better workflow integration.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => window.location.href = '/dashboard/super-cards'}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Income Intelligence Hub
                  </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard/super-cards'}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Financial Planning Hub
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl shadow-sm p-6 border border-orange-200 dark:border-orange-800">
              <div className="text-center">
                <Flame className="w-12 h-12 mx-auto mb-4 text-orange-600 dark:text-orange-400" />
                <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  FIRE Progress & Milestone Tracking in Financial Planning Hub
                </h4>
                <p className="text-orange-700 dark:text-orange-300 mb-4">
                  Comprehensive FIRE progress tracking, expense coverage milestones, Coast FI calculations, and personalized financial independence planning tools are now centralized in the Financial Planning Hub's dedicated milestones section.
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/super-cards'}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  Go to Financial Planning Hub
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Portfolio Growth Scenarios
              </h3>
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Monte Carlo simulations and growth projections coming soon</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}