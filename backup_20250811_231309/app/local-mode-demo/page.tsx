'use client';

import { useState, useEffect } from 'react';
import { LocalModeUtils, LOCAL_MODE_CONFIG } from '@/lib/config/local-mode';
import { mockSuperCardsData } from '@/lib/mock-data/super-cards-mock-data';
import { 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  PieChart, 
  Target,
  CheckCircle,
  AlertCircle,
  Home
} from 'lucide-react';

export default function LocalModeDemoPage() {
  const [activeCard, setActiveCard] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [superCardsData, setSuperCardsData] = useState<any>(null);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await LocalModeUtils.simulateDelay(500);
      setSuperCardsData(mockSuperCardsData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (!LocalModeUtils.isEnabled()) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-center text-red-600 mb-2">
            LOCAL_MODE Not Active
          </h1>
          <p className="text-gray-600 text-center">
            Please set NEXT_PUBLIC_LOCAL_MODE=true in your .env.local file
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading LOCAL_MODE Demo...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Home className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Income Clarity LOCAL_MODE Demo</h1>
                <p className="text-sm text-gray-500">All 5 Super Cards with Mock Data</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">LOCAL_MODE Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCard('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeCard === 'overview' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveCard('performance')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeCard === 'performance' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Performance Hub
          </button>
          <button
            onClick={() => setActiveCard('income')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeCard === 'income' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Income Intelligence
          </button>
          <button
            onClick={() => setActiveCard('lifestyle')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeCard === 'lifestyle' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Target className="w-4 h-4" />
            Financial Planning
          </button>
          <button
            onClick={() => setActiveCard('strategy')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeCard === 'strategy' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Tax Strategy
          </button>
          <button
            onClick={() => setActiveCard('portfolio')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeCard === 'portfolio' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Portfolio Strategy
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {activeCard === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Portfolio Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(superCardsData.performance.portfolio_value)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">YTD Return</span>
                  <span className="font-bold text-green-600">
                    +{formatPercent(superCardsData.performance.total_return_1y)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">vs SPY</span>
                  <span className={`font-bold ${superCardsData.performance.spy_comparison > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {superCardsData.performance.spy_comparison > 0 ? '+' : ''}{formatPercent(superCardsData.performance.spy_comparison)}
                  </span>
                </div>
              </div>
            </div>

            {/* Income Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Income Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(superCardsData.income.monthly_dividend_income)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax Rate</span>
                  <span className="font-bold text-green-600">
                    {formatPercent(superCardsData.income.tax_rate)} 🇵🇷
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(superCardsData.income.available_to_reinvest)}
                  </span>
                </div>
              </div>
            </div>

            {/* FIRE Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">FIRE Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-bold text-gray-900">
                    {superCardsData.lifestyle.expense_coverage_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FIRE Progress</span>
                  <span className="font-bold text-blue-600">
                    {superCardsData.lifestyle.fire_progress.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Years to FIRE</span>
                  <span className="font-bold text-gray-900">
                    {superCardsData.lifestyle.projections.time_to_fire_years} years
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCard === 'performance' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Performance Hub
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Portfolio Value</span>
                    <span className="font-medium">{formatCurrency(superCardsData.performance.portfolio_value)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">YTD Return</span>
                    <span className="font-medium text-green-600">+{formatPercent(superCardsData.performance.total_return_1y)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Sharpe Ratio</span>
                    <span className="font-medium">{superCardsData.performance.sharpe_ratio}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Dividend Yield</span>
                    <span className="font-medium">{formatPercent(superCardsData.performance.dividend_yield)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Top Holdings</h3>
                <div className="space-y-2">
                  {superCardsData.performance.holdings_performance.slice(0, 4).map((holding: any) => (
                    <div key={holding.ticker} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{holding.ticker}</span>
                      <span className="font-medium text-green-600">+{formatPercent(holding.ytd_return)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCard === 'income' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Income Intelligence Hub
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Monthly Income Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Gross Income</span>
                    <span className="font-medium">{formatCurrency(superCardsData.income.monthly_dividend_income)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Tax (PR 0%)</span>
                    <span className="font-medium text-green-600">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Net Income</span>
                    <span className="font-medium">{formatCurrency(superCardsData.income.net_income)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Available to Reinvest</span>
                    <span className="font-medium text-blue-600">{formatCurrency(superCardsData.income.available_to_reinvest)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Tax Advantage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">vs California</span>
                    <span className="font-medium text-green-600">+{formatCurrency(superCardsData.income.monthly_breakdown.tax_savings_vs_california)}/mo</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">vs NYC</span>
                    <span className="font-medium text-green-600">+{formatCurrency(superCardsData.income.monthly_breakdown.tax_savings_vs_nyc)}/mo</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Annual Savings</span>
                    <span className="font-medium text-green-600">+{formatCurrency(superCardsData.income.monthly_breakdown.tax_savings_vs_california * 12)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCard === 'lifestyle' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              Financial Planning Hub
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Expense Milestones</h3>
                <div className="space-y-3">
                  {Object.entries(superCardsData.lifestyle.milestones).slice(0, 5).map(([key, milestone]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          milestone.covered ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {milestone.covered && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <span className="text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatCurrency(milestone.amount)}</span>
                        <span className={`ml-2 text-sm ${milestone.covered ? 'text-green-600' : 'text-gray-400'}`}>
                          {milestone.covered ? '✓ Covered' : `${milestone.percentage.toFixed(0)}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">FIRE Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{superCardsData.lifestyle.fire_progress.toFixed(1)}%</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Monthly Surplus</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(superCardsData.lifestyle.surplus_deficit)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCard === 'strategy' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-purple-600" />
              Tax Strategy Hub
            </h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Puerto Rico Tax Advantage</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">0% Tax Rate</p>
                <p className="text-gray-600">Annual Savings: {formatCurrency(superCardsData.strategy.annual_tax_savings)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Tax Comparison</h3>
                <div className="space-y-2">
                  {Object.entries(superCardsData.strategy.tax_comparison).map(([location, data]: [string, any]) => (
                    <div key={location} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 capitalize">{location.replace('_', ' ')}</span>
                      <div className="text-right">
                        <span className="font-medium mr-3">{formatPercent(data.rate)}</span>
                        <span className={`text-sm ${location === 'puerto_rico' ? 'text-green-600' : 'text-gray-500'}`}>
                          {formatCurrency(data.annual_tax)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCard === 'portfolio' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-orange-600" />
              Portfolio Strategy Hub
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Portfolio Scores</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Overall Score</span>
                    <span className="font-medium">{superCardsData.quickActions.overall_score}/10</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Diversification</span>
                    <span className="font-medium">{superCardsData.quickActions.diversification_score}/10</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Risk Score</span>
                    <span className="font-medium">{superCardsData.quickActions.risk_score}/10</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Sharpe Ratio</span>
                    <span className="font-medium">{superCardsData.quickActions.risk_analysis.sharpe_ratio}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Asset Allocation</h3>
                <div className="space-y-2">
                  {Object.entries(superCardsData.quickActions.asset_allocation).slice(0, 4).map(([asset, percentage]: [string, any]) => (
                    <div key={asset} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600 capitalize">{asset.replace('_', ' ')}</span>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-500">LOCAL_MODE Demo</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">Mock User: {LOCAL_MODE_CONFIG.MOCK_USER.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}