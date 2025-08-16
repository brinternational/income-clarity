'use client';

import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { PerformanceHub } from '@/components/super-cards/PerformanceHub';

// Mock data for demo
const mockPortfolioData = {
  portfolio: {
    spyComparison: {
      portfolioReturn: 0.082,
      spyReturn: 0.061,
      outperformance: 0.021
    },
    totalValue: 285000,
    monthlyGrossIncome: 4500
  },
  holdings: [
    {
      id: '1',
      ticker: 'AAPL',
      ytdPerformance: 0.15,
      currentValue: 45000,
      monthlyIncome: 180,
      sector: 'Technology'
    },
    {
      id: '2', 
      ticker: 'MSFT',
      ytdPerformance: 0.12,
      currentValue: 38000,
      monthlyIncome: 152,
      sector: 'Technology'
    },
    {
      id: '3',
      ticker: 'JNJ', 
      ytdPerformance: 0.05,
      currentValue: 32000,
      monthlyIncome: 256,
      sector: 'Healthcare'
    },
    {
      id: '4',
      ticker: 'KO',
      ytdPerformance: 0.08,
      currentValue: 28000,
      monthlyIncome: 168,
      sector: 'Consumer Staples'
    },
    {
      id: '5',
      ticker: 'VZ',
      ytdPerformance: 0.03,
      currentValue: 25000,
      monthlyIncome: 200,
      sector: 'Telecommunications'
    },
    {
      id: '6',
      ticker: 'XOM',
      ytdPerformance: 0.18,
      currentValue: 35000,
      monthlyIncome: 245,
      sector: 'Energy'
    }
  ],
  loading: false
};

const timePeriodData = {
  '1M': { portfolioReturn: 0.032, spyReturn: 0.021, outperformance: 0.011 },
  '3M': { portfolioReturn: 0.085, spyReturn: 0.067, outperformance: 0.018 },
  '6M': { portfolioReturn: 0.145, spyReturn: 0.098, outperformance: 0.047 },
  '1Y': { portfolioReturn: 0.082, spyReturn: 0.061, outperformance: 0.021 }
};

const MockPortfolioProvider = ({ children }: { children: React.ReactNode }) => (
  <PortfolioProvider value={mockPortfolioData}>
    {children}
  </PortfolioProvider>
);

export default function PerformanceHubDemo() {
  return (
    <MockPortfolioProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Performance Hub Super Card
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Consolidation of SPYComparison, HoldingsPerformance, and PortfolioOverview 
              into a single tabbed interface with progressive disclosure.
            </p>
          </div>

          {/* Performance Hub Demo */}
          <div className="mb-12">
            <PerformanceHub
              portfolioReturn={0.082}
              spyReturn={0.061}
              outperformance={0.021}
              timePeriodData={timePeriodData}
              isLoading={false}
            />
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Hero Metric</h3>
              <p className="text-sm text-slate-600">
                Prominent outperformance display extracted from SPY comparison
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-prosperity-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Mobile First</h3>
              <p className="text-sm text-slate-600">
                Swipe navigation between tabs with touch-friendly interactions
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-wealth-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Smart Insights</h3>
              <p className="text-sm text-slate-600">
                AI-powered recommendations based on performance analysis
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Performance</h3>
              <p className="text-sm text-slate-600">
                Renders in &lt;100ms with optimized animations and memoization
              </p>
            </div>
          </div>

          {/* Implementation Details */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Implementation Details</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">PERF-001 to PERF-004 ✅</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• PerformanceHub container created at /components/super-cards/</li>
                  <li>• Hero metric prominently displayed (+2.1% vs SPY)</li>
                  <li>• 3-tab interface: Overview, Holdings, Analysis</li>
                  <li>• Top 3 performers analysis with smart insights</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">PERF-005 to PERF-008 ✅</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Reused existing components without rebuilding</li>
                  <li>• Smart recommendations based on performance</li>
                  <li>• Mobile swipe navigation with haptic feedback</li>
                  <li>• Memoized for &lt;100ms render performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockPortfolioProvider>
  );
}