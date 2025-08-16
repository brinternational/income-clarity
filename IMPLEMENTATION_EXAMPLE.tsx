// Example: How to implement the 5 Super Cards with the new optimized backend
// This shows the transformation from 18+ individual cards to 5 consolidated super cards

'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import { RefreshCw, TrendingUp, DollarSign, Target, Zap, AlertCircle } from 'lucide-react'

// 1. PERFORMANCE COMMAND CENTER - Replaces: SPYComparison, HoldingsPerformance, PortfolioOverview
function PerformanceCommandCenter() {
  const { data, loading, error } = useDashboardData()
  
  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />
  if (error) return <ErrorCard message={error} />
  
  const perf = data?.performanceCommand
  if (!perf) return <NoDataCard />

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Command Center</h2>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
            perf.performance_status === 'beating' ? 'bg-green-100 text-green-800' :
            perf.performance_status === 'lagging' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {perf.performance_status === 'beating' ? '🚀 Crushing It!' :
             perf.performance_status === 'lagging' ? '📉 Underperforming' :
             '⚖️ Matching Market'}
          </span>
        </div>
      </div>

      {/* Main Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Portfolio vs SPY</h3>
            
            {/* Time Period Buttons */}
            <div className="flex space-x-2 mb-4">
              {['1M', '3M', '1Y'].map(period => (
                <button key={period} className="px-3 py-1 bg-white rounded-md text-sm hover:bg-blue-100">
                  {period}
                </button>
              ))}
            </div>

            {/* Performance Bars */}
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-20 text-sm">Portfolio</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 mx-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${Math.max(0, perf.portfolio_return_1y * 100)}%` }}
                  />
                </div>
                <span className="w-16 text-sm font-medium text-blue-600">
                  {(perf.portfolio_return_1y * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="w-20 text-sm">SPY</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 mx-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full" 
                    style={{ width: `${Math.max(0, perf.spy_return_1y * 100)}%` }}
                  />
                </div>
                <span className="w-16 text-sm font-medium text-orange-600">
                  {(perf.spy_return_1y * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Outperformance Highlight */}
            <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-green-500">
              <p className="text-sm">
                <span className="font-semibold text-green-600">
                  {perf.outperformance_1y > 0 ? '+' : ''}{(perf.outperformance_1y * 100).toFixed(1)}%
                </span>
                {' '}vs SPY over 12 months
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Portfolio Value</h4>
            <p className="text-2xl font-bold text-gray-900">
              ${perf.portfolio_value.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Gain/Loss</h4>
            <p className={`text-2xl font-bold ${
              perf.portfolio_value > perf.portfolio_cost ? 'text-green-600' : 'text-red-600'
            }`}>
              ${(perf.portfolio_value - perf.portfolio_cost).toLocaleString()}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Performance Status</h4>
            <p className="text-lg font-semibold">
              {perf.performance_status === 'beating' && '🎯 Above Market'}
              {perf.performance_status === 'lagging' && '📈 Growth Opportunity'}
              {perf.performance_status === 'matching' && '⚖️ Market Aligned'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. INCOME INTELLIGENCE CENTER - Replaces: IncomeClarityCard, TaxPlanning, YTDIncomeAccumulator
function IncomeIntelligenceCenter() {
  const { data } = useDashboardData()
  const income = data?.incomeIntelligence
  
  if (!income) return <NoDataCard />

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Income Intelligence Center</h2>
        <DollarSign className="w-6 h-6 text-green-600" />
      </div>

      {/* Income Flow Visualization */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Income Flow</h3>
        
        <div className="space-y-4">
          {/* Waterfall visualization */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Gross Income</span>
            <span className="text-xl font-bold text-green-600">
              ${income.gross_monthly_income.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between border-l-2 border-orange-300 pl-4">
            <span className="text-sm">Tax Obligation</span>
            <span className="text-lg font-semibold text-orange-600">
              -${income.estimated_tax_owed.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between border-l-2 border-blue-300 pl-4">
            <span className="text-sm">Net After Tax</span>
            <span className="text-lg font-semibold text-blue-600">
              ${income.net_monthly_income.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between border-l-2 border-red-300 pl-4">
            <span className="text-sm">Monthly Expenses</span>
            <span className="text-lg font-semibold text-red-600">
              -${income.total_monthly_expenses.toLocaleString()}
            </span>
          </div>
          
          <div className="border-t-2 border-gray-300 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Available to Reinvest</span>
              <span className={`text-2xl font-bold ${
                income.available_to_reinvest > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {income.available_to_reinvest > 0 ? '+' : ''}${income.available_to_reinvest.toLocaleString()}
              </span>
            </div>
            
            {/* Above Zero Line Indicator */}
            <div className="mt-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                income.above_zero_line 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {income.above_zero_line 
                  ? '✅ Above Zero Line - Growing!' 
                  : '⚠️ Below Zero Line - Reducing Principal'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Income Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{income.dividend_count}</p>
          <p className="text-sm text-gray-600">Dividend Payments</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {(income.estimated_tax_owed / income.gross_monthly_income * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Effective Tax Rate</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">{income.expense_count}</p>
          <p className="text-sm text-gray-600">Tracked Expenses</p>
        </div>
      </div>
    </div>
  )
}

// 3. LIFESTYLE TRACKER - Replaces: ExpenseMilestones, FIREProgressCard
function LifestyleTracker() {
  const { data } = useDashboardData()
  const lifestyle = data?.lifestyleTracker
  
  if (!lifestyle) return <NoDataCard />

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Lifestyle Tracker</h2>
        <Target className="w-6 h-6 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Coverage */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Expense Coverage</h3>
          
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - lifestyle.expense_coverage_percentage / 100)}`}
                className="text-purple-600"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">
                {lifestyle.expense_coverage_percentage.toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {lifestyle.covered_categories} of {lifestyle.total_expense_categories} categories covered
            </p>
            {lifestyle.next_milestone_amount > 0 && (
              <p className="text-sm font-medium text-purple-600 mt-2">
                Next milestone: +${lifestyle.next_milestone_amount.toLocaleString()}/month
              </p>
            )}
          </div>
        </div>

        {/* FIRE Progress */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">FIRE Progress</h3>
          
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - lifestyle.fire_progress_percentage / 100)}`}
                className="text-orange-600"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">
                {lifestyle.fire_progress_percentage.toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ${lifestyle.current_portfolio_value.toLocaleString()} / ${lifestyle.fire_target.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-orange-600 mt-2">
              FIRE Target Progress
            </p>
          </div>
        </div>
      </div>

      {/* Milestone Achievement */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <h4 className="font-semibold text-blue-800 mb-2">🎯 Next Milestone</h4>
        <p className="text-sm text-blue-700">
          {lifestyle.expense_coverage_percentage >= 100 
            ? "Congratulations! All expenses covered. Focus on FIRE progress."
            : `Cover ${lifestyle.next_milestone_amount > 0 ? `$${lifestyle.next_milestone_amount.toLocaleString()}` : 'remaining'} monthly expenses to reach full coverage.`
          }
        </p>
      </div>
    </div>
  )
}

// 4. STRATEGY OPTIMIZER - Replaces: StrategyComparison, TaxIntelligence, MarginIntelligence
function StrategyOptimizer() {
  const { data } = useDashboardData()
  const strategy = data?.strategyOptimizer
  
  if (!strategy) return <NoDataCard />

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Strategy Optimizer</h2>
        <TrendingUp className="w-6 h-6 text-indigo-600" />
      </div>

      {/* Overall Strategy Score */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Portfolio Health Score</h3>
          <span className={`text-3xl font-bold ${
            strategy.overall_strategy_score >= 80 ? 'text-green-600' :
            strategy.overall_strategy_score >= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {strategy.overall_strategy_score.toFixed(0)}/100
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full ${
              strategy.overall_strategy_score >= 80 ? 'bg-green-500' :
              strategy.overall_strategy_score >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${strategy.overall_strategy_score}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600">
          {strategy.overall_strategy_score >= 80 && "Excellent portfolio optimization! 🚀"}
          {strategy.overall_strategy_score >= 60 && strategy.overall_strategy_score < 80 && "Good foundation, room for improvement 📈"}
          {strategy.overall_strategy_score < 60 && "Several optimization opportunities available ⚡"}
        </p>
      </div>

      {/* Strategy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">{strategy.sector_diversification}</p>
          <p className="text-sm text-gray-600">Sectors</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {(strategy.avg_dividend_yield * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Avg Yield</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {strategy.tax_efficiency_score.toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600">Tax Efficiency</p>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <h4 className="font-semibold text-yellow-800 mb-2">🤖 AI Recommendations</h4>
        <ul className="space-y-1">
          {strategy.recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-yellow-700 flex items-start">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
        
        <div className="mt-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            strategy.rebalancing_priority === 'High' ? 'bg-red-100 text-red-800' :
            strategy.rebalancing_priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {strategy.rebalancing_priority} Priority Rebalancing
          </span>
        </div>
      </div>
    </div>
  )
}

// 5. QUICK ACTIONS - Replaces: Navigation, Forms, Recent Activity
function QuickActions() {
  const { data, refetch, invalidateCache } = useDashboardData()
  const actions = data?.quickActions
  
  if (!actions) return <NoDataCard />

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        <Zap className="w-6 h-6 text-yellow-600" />
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xl font-bold text-green-600">{actions.recent_dividends}</p>
          <p className="text-xs text-gray-600">Dividends</p>
        </div>
        
        <div className="text-center">
          <p className="text-xl font-bold text-blue-600">{actions.recent_expenses}</p>
          <p className="text-xs text-gray-600">Expenses</p>
        </div>
        
        <div className="text-center">
          <p className="text-xl font-bold text-purple-600">{actions.recent_updates}</p>
          <p className="text-xs text-gray-600">Updates</p>
        </div>
        
        <div className="text-center">
          <p className="text-xl font-bold text-indigo-600">{actions.total_recent_activities}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">🎯 Suggested Next Steps</h4>
        <ul className="space-y-2">
          {actions.suggested_actions.map((action, index) => (
            <li key={index} className="flex items-center text-sm">
              <input type="checkbox" className="mr-2 rounded" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => refetch()}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
        
        <button 
          onClick={() => invalidateCache()}
          className="flex items-center justify-center space-x-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Zap className="w-4 h-4" />
          <span>Clear Cache</span>
        </button>
      </div>
    </div>
  )
}

// Helper Components
function NoDataCard() {
  return (
    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-gray-600 mb-2">No Data Available</h3>
      <p className="text-sm text-gray-500">Complete your setup to see insights here.</p>
    </div>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
        <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
      </div>
      <p className="text-sm text-red-700 mt-2">{message}</p>
    </div>
  )
}

// Main Dashboard Component - All 5 Super Cards
export default function OptimizedDashboard() {
  const { data, loading, error, isStale, refetch } = useDashboardData()

  if (loading) {
    return (
      <div className="space-y-6">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="animate-pulse h-64 bg-gray-200 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Performance Banner */}
      {data?.metadata && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Dashboard loaded in {data.metadata.responseTime}ms • 
                Cache: {data.metadata.cacheStatus} • 
                {isStale && 'Data is stale'}
              </p>
              <p className="text-xs text-blue-600">
                Last updated: {new Date(data.metadata.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
            {isStale && (
              <button 
                onClick={refetch}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      )}

      {/* The 5 Super Cards */}
      <div className="space-y-6">
        <PerformanceCommandCenter />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeIntelligenceCenter />
          <LifestyleTracker />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StrategyOptimizer />
          <QuickActions />
        </div>
      </div>

      {/* Footer Stats */}
      {data && (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
          Portfolio tracking {data.strategyOptimizer?.total_holdings || 0} holdings • 
          {data.incomeIntelligence?.dividend_count || 0} dividend payments • 
          {data.lifestyleTracker?.total_expense_categories || 0} expense categories
        </div>
      )}
    </div>
  )
}