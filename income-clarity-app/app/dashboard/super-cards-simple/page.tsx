/**
 * Simple Super Cards View - Server Component Alternative
 * 
 * This is a non-React, server-side rendered alternative to the complex
 * client-side Super Cards implementation. It fetches all data server-side
 * and renders simple HTML with Tailwind CSS.
 * 
 * Benefits:
 * - No client-side JavaScript complexity
 * - Server-side data fetching (reliable)
 * - No hydration issues
 * - Fast loading
 * - Simple debugging
 */

import { superCardsDatabase } from '@/lib/services/super-cards-database.service';

// Utility function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Utility function to format percentage
function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// Server-side data fetching function
async function fetchAllSuperCardsData() {
  try {
    // Fetch all hub data in parallel
    const [incomeData, performanceData, portfolioData, taxData, planningData] = await Promise.all([
      superCardsDatabase.getIncomeHubData(),
      superCardsDatabase.getPerformanceHubData(),
      superCardsDatabase.getPortfolioStrategyHubData(),
      superCardsDatabase.getTaxStrategyHubData(),
      superCardsDatabase.getFinancialPlanningHubData(),
    ]);

    return {
      income: incomeData,
      performance: performanceData,
      portfolio: portfolioData,
      tax: taxData,
      planning: planningData,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching super cards data:', error);
    return {
      income: null,
      performance: null,
      portfolio: null,
      tax: null,
      planning: null,
      error: 'Failed to fetch data',
      fetchedAt: new Date().toISOString(),
    };
  }
}

// Income Hub Card Component
function IncomeHubCard({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Income Intelligence Hub</h2>
        <div className="text-gray-500 text-center py-8">
          <p>No income data available</p>
          <p className="text-sm mt-2">Add income and expense records to see analysis</p>
        </div>
      </div>
    );
  }

  const isAboveZero = data.availableToReinvest > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Income Intelligence Hub</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Gross Monthly Income:</span>
          <span className="font-semibold">{formatCurrency(data.grossMonthly || 0)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tax Owed:</span>
          <span className="font-semibold text-red-600">-{formatCurrency(data.taxOwed || 0)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Monthly Expenses:</span>
          <span className="font-semibold text-red-600">-{formatCurrency(data.monthlyExpenses || 0)}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Available to Reinvest:</span>
            <span className={`font-bold text-lg ${isAboveZero ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.availableToReinvest || 0)}
            </span>
          </div>
          
          <div className="mt-2 text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isAboveZero 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isAboveZero ? 'Above Zero Line' : 'Below Zero Line'}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 text-center mt-4">
          Monthly Dividend Income: {formatCurrency(data.monthlyDividendIncome || 0)}
        </div>
      </div>
    </div>
  );
}

// Performance Hub Card Component
function PerformanceHubCard({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Hub</h2>
        <div className="text-gray-500 text-center py-8">
          <p>No performance data available</p>
          <p className="text-sm mt-2">Add portfolio holdings to see performance analysis</p>
        </div>
      </div>
    );
  }

  const spyComparison = data.spyComparison || 0;
  const isOutperforming = spyComparison > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Hub</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Portfolio Value:</span>
          <span className="font-semibold text-lg">{formatCurrency(data.portfolioValue || 0)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Return:</span>
          <span className={`font-semibold ${(data.totalReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(data.totalReturn || 0)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Dividend Yield:</span>
          <span className="font-semibold">{formatPercentage(data.dividendYield || 0)}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">vs SPY:</span>
            <span className={`font-bold ${isOutperforming ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(spyComparison)}
            </span>
          </div>
          
          <div className="mt-2 text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isOutperforming 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isOutperforming ? 'Outperforming SPY' : 'Underperforming SPY'}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 text-center mt-4">
          Monthly Dividends: {formatCurrency(data.monthlyDividends || 0)} | 
          SPY Price: {formatCurrency(data.spyPrice || 0)}
        </div>
      </div>
    </div>
  );
}

// Tax Strategy Hub Card Component
function TaxStrategyHubCard({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Strategy Hub</h2>
        <div className="text-gray-500 text-center py-8">
          <p>No tax strategy data available</p>
          <p className="text-sm mt-2">Configure tax strategies to see optimization opportunities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Strategy Hub</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Current Location:</span>
          <span className="font-semibold">{data.currentLocation || 'Not Set'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Current Tax Rate:</span>
          <span className="font-semibold">{formatPercentage(data.taxRate || 0)}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Potential Savings:</span>
            <span className="font-bold text-green-600">{formatCurrency(data.potentialSavings || 0)}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 text-center mt-4">
          Strategies: {data.strategies?.length || 0} configured
        </div>
      </div>
    </div>
  );
}

// Portfolio Strategy Hub Card Component
function PortfolioStrategyHubCard({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Strategy Hub</h2>
        <div className="text-gray-500 text-center py-8">
          <p>No portfolio strategy data available</p>
          <p className="text-sm mt-2">Add holdings to see portfolio analysis</p>
        </div>
      </div>
    );
  }

  const holdingsCount = data.holdings?.length || 0;
  const topSector = data.sectorAllocation?.[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Strategy Hub</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Holdings Count:</span>
          <span className="font-semibold">{holdingsCount}</span>
        </div>
        
        {topSector && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Top Sector:</span>
            <span className="font-semibold">{topSector.sector} ({formatPercentage(topSector.percentage)})</span>
          </div>
        )}
        
        {data.riskMetrics && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Portfolio Beta:</span>
              <span className="font-semibold">{data.riskMetrics.beta?.toFixed(2) || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sharpe Ratio:</span>
              <span className="font-semibold">{data.riskMetrics.sharpeRatio?.toFixed(2) || 'N/A'}</span>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-400 text-center mt-4">
          Strategies: {data.strategies?.length || 0} active
        </div>
      </div>
    </div>
  );
}

// Financial Planning Hub Card Component
function FinancialPlanningHubCard({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Planning Hub</h2>
        <div className="text-gray-500 text-center py-8">
          <p>No financial planning data available</p>
          <p className="text-sm mt-2">Set FIRE targets to see progress tracking</p>
        </div>
      </div>
    );
  }

  const fireTargetsCount = data.fireTargets?.length || 0;
  const milestonesCount = data.milestones?.length || 0;
  const completedMilestones = data.milestones?.filter((m: any) => m.completed)?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Planning Hub</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">FIRE Targets:</span>
          <span className="font-semibold">{fireTargetsCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Milestones Progress:</span>
          <span className="font-semibold">{completedMilestones} / {milestonesCount}</span>
        </div>
        
        {milestonesCount > 0 && (
          <div className="border-t pt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedMilestones / milestonesCount) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              {Math.round((completedMilestones / milestonesCount) * 100)}% Complete
            </p>
          </div>
        )}
        
        <div className="text-xs text-gray-400 text-center mt-4">
          Projections: {data.projections?.length || 0} scenarios
        </div>
      </div>
    </div>
  );
}

// Main Server Component
export default async function SimpleUnifiedSuperCardsView() {
  // Fetch all data server-side
  const data = await fetchAllSuperCardsData();

  if (data.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Simple Super Cards View</h1>
          <div className="text-red-600 mb-4">
            <p>Failed to load dashboard data</p>
            <p className="text-sm text-gray-500 mt-2">Error: {data.error}</p>
          </div>
          <a 
            href="/dashboard/super-cards-simple"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Simple Super Cards View</h1>
              <p className="text-gray-600 mt-1">Server-side rendered dashboard - reliable and fast</p>
            </div>
            <div className="text-sm text-gray-500">
              <p>Fetched: {new Date(data.fetchedAt).toLocaleTimeString()}</p>
              <a 
                href="/dashboard/super-cards" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Back to React Version
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Super Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <IncomeHubCard data={data.income} />
          <PerformanceHubCard data={data.performance} />
          <TaxStrategyHubCard data={data.tax} />
          <PortfolioStrategyHubCard data={data.portfolio} />
          <FinancialPlanningHubCard data={data.planning} />
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <details className="bg-gray-100 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-gray-700">
              Debug: Raw Data (Click to expand)
            </summary>
            <pre className="mt-4 text-xs text-gray-600 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Simple Super Cards View - No React complexity, just reliable server-side rendering</p>
            <p className="mt-1">
              Performance: Server-side data fetching | 
              Reliability: No hydration issues | 
              Debugging: Simple HTML/CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// This tells Next.js this is a server component (no 'use client' directive)
// It will render on the server and send static HTML to the client