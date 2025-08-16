'use client'

import { usePortfolio } from '@/contexts/PortfolioContext'
import { DollarSign, Calendar, TrendingUp, Clock } from 'lucide-react'

interface DividendEvent {
  ticker: string
  amount: number
  exDate: string
  payDate: string
  frequency: string
}

export function IncomeAnalysis() {
  const { holdings, portfolio } = usePortfolio()

  // Mock dividend calendar data - in real app from API
  const upcomingDividends: DividendEvent[] = [
    { ticker: 'JEPI', amount: 28.50, exDate: '2025-01-15', payDate: '2025-01-20', frequency: 'Monthly' },
    { ticker: 'SCHD', amount: 45.20, exDate: '2025-01-28', payDate: '2025-02-05', frequency: 'Quarterly' },
    { ticker: 'VYM', amount: 32.10, exDate: '2025-02-12', payDate: '2025-02-18', frequency: 'Quarterly' },
    { ticker: 'REITS', amount: 18.75, exDate: '2025-02-25', payDate: '2025-03-05', frequency: 'Monthly' }
  ]

  const monthlyIncome = portfolio?.monthlyNetIncome || 0
  const annualIncome = monthlyIncome * 12
  const totalPortfolioValue = holdings?.reduce((sum, h) => sum + (h.currentValue || 0), 0) || 0
  const portfolioYield = totalPortfolioValue > 0 ? (annualIncome / totalPortfolioValue) * 100 : 0

  // Calculate yield on cost (mock data)
  const yieldOnCost = 4.8 // This would be calculated from original cost basis

  if (!holdings || holdings.length === 0) {
    return (
      <div 
        className="rounded-xl shadow-lg p-6 transition-all duration-300"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-accent-secondary)' }}
          >
            <DollarSign className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Income Analysis
            </h3>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Dividend income tracking
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-50">💰</div>
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Add dividend holdings to track income
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="rounded-xl shadow-lg p-6 transition-all duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: 'var(--color-accent-secondary)' }}
        >
          <DollarSign className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h3 
            className="text-lg font-bold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Income Analysis
          </h3>
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Dividend income & projections
          </p>
        </div>
      </div>

      {/* Income Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          className="p-4 rounded-lg transition-colors duration-300"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span 
              className="text-sm font-semibold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Monthly Income
            </span>
          </div>
          <div 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: 'var(--color-accent)' }}
          >
            ${monthlyIncome.toFixed(0)}
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Current projection
          </div>
        </div>

        <div 
          className="p-4 rounded-lg transition-colors duration-300"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
            <span 
              className="text-sm font-semibold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Portfolio Yield
            </span>
          </div>
          <div 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: 'var(--color-success)' }}
          >
            {portfolioYield.toFixed(1)}%
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Current yield
          </div>
        </div>
      </div>

      {/* Annual Projections */}
      <div 
        className="p-4 rounded-lg mb-6 border transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--color-accent-secondary)',
          borderColor: 'var(--color-accent)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-accent)' }}
            >
              ${annualIncome.toFixed(0)} Annual Income
            </div>
            <div 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Based on current holdings
            </div>
          </div>
          <div className="text-right">
            <div 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-success)' }}
            >
              {yieldOnCost.toFixed(1)}%
            </div>
            <div 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Yield on Cost
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Dividends */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-4 h-4" style={{ color: 'var(--color-info)' }} />
          <h4 
            className="text-sm font-semibold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Upcoming Dividends
          </h4>
        </div>
        
        <div className="space-y-3">
          {upcomingDividends.slice(0, 3).map((dividend, index) => (
            <div 
              key={`${dividend.ticker}-${dividend.exDate}`}
              className="flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-colors duration-300"
                  style={{ 
                    backgroundColor: 'var(--color-accent-secondary)',
                    color: 'var(--color-accent)'
                  }}
                >
                  {dividend.ticker.slice(0, 2)}
                </div>
                <div>
                  <div 
                    className="font-mono text-sm font-semibold transition-colors duration-300"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {dividend.ticker}
                  </div>
                  <div 
                    className="text-xs transition-colors duration-300"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Ex: {new Date(dividend.exDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div 
                  className="text-sm font-semibold transition-colors duration-300"
                  style={{ color: 'var(--color-success)' }}
                >
                  ${dividend.amount.toFixed(2)}
                </div>
                <div 
                  className="text-xs transition-colors duration-300"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {dividend.frequency}
                </div>
              </div>
            </div>
          ))}
        </div>

        {upcomingDividends.length > 3 && (
          <div className="text-center mt-3">
            <button 
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
              style={{ 
                color: 'var(--color-accent)',
                backgroundColor: 'var(--color-accent-secondary)'
              }}
            >
              View All Upcoming ({upcomingDividends.length})
            </button>
          </div>
        )}
      </div>

      {/* Income Growth Projection */}
      <div 
        className="pt-4 border-t transition-colors duration-300"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div 
              className="text-sm font-semibold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Next Year Projection
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Based on 5% dividend growth
            </div>
          </div>
          <div className="text-right">
            <div 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-success)' }}
            >
              ${(annualIncome * 1.05).toFixed(0)}
            </div>
            <div 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-success)' }}
            >
              +${(annualIncome * 0.05).toFixed(0)} growth
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}