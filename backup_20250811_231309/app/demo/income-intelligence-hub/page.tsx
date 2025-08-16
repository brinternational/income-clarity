'use client';

import { IncomeIntelligenceHub } from '@/components/super-cards';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { IncomeClarityResult } from '@/types';

// Mock data for demonstration
const mockClarityData: IncomeClarityResult = {
  grossMonthly: 4500,
  taxOwed: 675,
  netMonthly: 3825,
  monthlyExpenses: 3200,
  availableToReinvest: 625,
  aboveZeroLine: true
};

const mockPortfolioData = {
  totalValue: 125000,
  monthlyGrossIncome: 4500,
  holdings: [
    {
      id: 'spy',
      ticker: 'SPY',
      shares: 100,
      currentPrice: 450,
      annualYield: 0.013,
      ytdPerformance: 0.08
    },
    {
      id: 'aapl',
      ticker: 'AAPL',
      shares: 50,
      currentPrice: 180,
      annualYield: 0.005,
      ytdPerformance: 0.12
    },
    {
      id: 'vti',
      ticker: 'VTI',
      shares: 75,
      currentPrice: 240,
      annualYield: 0.015,
      ytdPerformance: 0.09
    },
    {
      id: 'ko',
      ticker: 'KO',
      shares: 200,
      currentPrice: 60,
      annualYield: 0.03,
      ytdPerformance: 0.04
    }
  ],
  loading: false
};

const mockProfileData = {
  incomeClarityData: mockClarityData,
  loading: false,
  error: null
};

export default function IncomeIntelligenceHubDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Income Intelligence Hub Demo
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Experience the consolidated income management interface that brings together 
            cash flow analysis, dividend calendar, tax planning, and income projections 
            in one powerful Super Card.
          </p>
        </div>

        <PortfolioProvider value={mockPortfolioData}>
          <UserProfileProvider value={mockProfileData}>
            <div className="max-w-5xl mx-auto">
              <IncomeIntelligenceHub 
                clarityData={mockClarityData}
                className="w-full"
              />
            </div>
          </UserProfileProvider>
        </PortfolioProvider>

        {/* Demo Instructions */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              🎯 Demo Instructions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Key Features:</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <strong>Above Zero Line</strong> - Hero metric showing wealth building status</li>
                  <li>• <strong>Cash Flow Tab</strong> - Complete financial waterfall analysis</li>
                  <li>• <strong>Calendar Tab</strong> - Upcoming dividend payment schedule</li>
                  <li>• <strong>Tax Tab</strong> - Optimization opportunities & savings</li>
                  <li>• <strong>Projections Tab</strong> - FIRE progress & income milestones</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Navigation:</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <strong>Desktop</strong> - Click tabs to navigate between sections</li>
                  <li>• <strong>Mobile</strong> - Swipe left/right to switch tabs</li>
                  <li>• <strong>Financial Stress</strong> - Monitor with real-time indicator</li>
                  <li>• <strong>Tax Optimizations</strong> - Explore potential savings</li>
                  <li>• <strong>Progressive Disclosure</strong> - Information revealed as needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Notes */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">
              💡 Technical Implementation Highlights
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                <strong>Consolidated Design:</strong> This Super Card replaces 6 individual components 
                (IncomeClarityCard, DividendCalendar, TaxPlanning, CashFlowProjectionCard, 
                FIREProgressCard, IncomeProgressionCard) with a single, tabbed interface.
              </p>
              <p>
                <strong>Emotional Intelligence:</strong> The prominent "Above Zero Line" hero metric 
                provides immediate emotional relief or calls attention to financial stress.
              </p>
              <p>
                <strong>Mobile-First:</strong> Touch gestures for tab navigation, responsive layouts, 
                and progressive disclosure ensure excellent mobile experience.
              </p>
              <p>
                <strong>Performance:</strong> Memoized components, optimized animations, and 
                smart data loading ensure smooth interactions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}