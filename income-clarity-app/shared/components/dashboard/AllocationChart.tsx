'use client'

import { usePortfolio } from '@/contexts/PortfolioContext'
import { PieChart, Target, TrendingUp } from 'lucide-react'

export function AllocationChart() {
  const { holdings, portfolio } = usePortfolio()

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
            <PieChart className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Asset Allocation
            </h3>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Portfolio distribution
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-50">📊</div>
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Add holdings to see allocation breakdown
          </p>
        </div>
      </div>
    )
  }

  // Calculate allocation data
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0)
  
  // Group by sector/type for simplified allocation
  const allocations = holdings.map(holding => ({
    ticker: holding.ticker,
    value: holding.currentValue || 0,
    percentage: totalValue > 0 ? ((holding.currentValue || 0) / totalValue) * 100 : 0,
    sector: holding.sector || 'Other' // This would come from real data
  })).sort((a, b) => b.percentage - a.percentage)

  // Pie chart calculation for visual display
  const pieSegments = allocations.map((allocation, index) => {
    const startAngle = allocations.slice(0, index).reduce((sum, a) => sum + (a.percentage * 3.6), 0)
    const endAngle = startAngle + (allocation.percentage * 3.6)
    
    // Generate colors based on index
    const colors = [
      'var(--color-accent)',
      'var(--color-success)',
      'var(--color-warning)',
      'var(--color-error)',
      'var(--color-info)',
      'var(--color-primary)',
    ]
    
    return {
      ...allocation,
      startAngle,
      endAngle,
      color: colors[index % colors.length]
    }
  })

  return (
    <div 
      className="rounded-xl shadow-lg p-6 transition-all duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-accent-secondary)' }}
          >
            <PieChart className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Asset Allocation
            </h3>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ${(totalValue / 1000).toFixed(1)}k total
            </p>
          </div>
        </div>
        
        {/* Diversification Score */}
        <div 
          className="px-3 py-2 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-secondary)',
            borderColor: 'var(--color-success)',
            color: 'var(--color-success)'
          }}
        >
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span className="text-xs font-semibold">
              {holdings.length > 10 ? 'Well' : holdings.length > 5 ? 'Good' : 'Basic'} Diversified
            </span>
          </div>
        </div>
      </div>

      {/* Simple Pie Chart Visualization */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {pieSegments.map((segment, index) => {
            if (segment.percentage < 1) return null
            
            const circumference = 2 * Math.PI * 40
            const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`
            const rotation = allocations.slice(0, index).reduce((sum, a) => sum + a.percentage, 0) * 3.6
            
            return (
              <circle
                key={segment.ticker}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={segment.color}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: '50% 50%',
                  transition: 'all 0.5s ease'
                }}
                className="transition-all duration-500"
              />
            )
          })}
        </svg>
        
        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {holdings.length}
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Holdings
          </div>
        </div>
      </div>

      {/* Allocation List */}
      <div className="space-y-3">
        {allocations.slice(0, 5).map((allocation, index) => (
          <div key={allocation.ticker} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{ backgroundColor: pieSegments[index]?.color || 'var(--color-border)' }}
              />
              <div>
                <div 
                  className="font-mono text-sm font-semibold transition-colors duration-300"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {allocation.ticker}
                </div>
                <div 
                  className="text-xs transition-colors duration-300"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ${(allocation.value / 1000).toFixed(1)}k
                </div>
              </div>
            </div>
            <div className="text-right">
              <div 
                className="text-sm font-semibold transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {allocation.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
        
        {allocations.length > 5 && (
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              +{allocations.length - 5} more holdings
            </div>
            <div 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {allocations.slice(5).reduce((sum, a) => sum + a.percentage, 0).toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Risk Metrics */}
      <div 
        className="mt-6 pt-4 border-t transition-colors duration-300"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {((allocations[0]?.percentage || 0)).toFixed(0)}%
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Largest Position
            </div>
          </div>
          <div>
            <div 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-accent)' }}
            >
              {portfolio?.monthlyNetIncome ? `$${portfolio.monthlyNetIncome.toFixed(0)}` : '$0'}
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Monthly Income
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}