'use client'

import { useState } from 'react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { TrendingUp, TrendingDown, Minus, Filter, ArrowUpDown } from 'lucide-react'
import { SkeletonHoldingsPerformance } from '@/components/ui/skeletons'
import { Holding } from '@/types'

interface HoldingsPerformanceProps {
  onAddHolding?: () => void
}

type SortOption = 'performance-high' | 'performance-low' | 'alphabetical' | 'value-high' | 'value-low'
type FilterOption = 'all' | 'outperforming' | 'underperforming'

// Type guard utility to ensure holdings is always a valid array
const ensureHoldingsArray = (holdings: Holding[] | null | undefined): Holding[] => {
  return Array.isArray(holdings) ? holdings : []
}

export function HoldingsPerformance({ onAddHolding }: HoldingsPerformanceProps) {
  const { holdings, portfolio, loading } = usePortfolio()
  const [sortBy, setSortBy] = useState<SortOption>('performance-high')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [hoveredHolding, setHoveredHolding] = useState<string | null>(null)

  // Show skeleton if loading
  if (loading) {
    return <SkeletonHoldingsPerformance />;
  }

  const safeHoldings = ensureHoldingsArray(holdings)
  
  if (safeHoldings.length === 0) {
    return (
      <div 
        className="rounded-xl shadow-lg p-6 transition-all duration-300"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300"
              style={{ backgroundColor: 'var(--color-accent-secondary)' }}
            >
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 
                className="text-xl font-bold transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Holdings vs SPY Performance
              </h2>
              <p 
                className="transition-colors duration-300"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                YTD Performance Comparison • SPY: 8.2%
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">📈</div>
          <h3 
            className="text-lg font-semibold mb-2 transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            No Holdings Yet
          </h3>
          <p 
            className="mb-6 transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Add your first dividend holding to see performance tracking
          </p>
          {onAddHolding && (
            <button
              onClick={onAddHolding}
              className="px-6 py-3 rounded-lg font-semibold theme-btn-primary transition-all duration-200"
            >
              Add Your First Holding
            </button>
          )}
        </div>
      </div>
    )
  }

  const spyReturn = portfolio?.spyComparison.spyReturn || 0.082

  // Sorting and filtering logic with proper null safety
  const getSortedAndFilteredHoldings = (): Holding[] => {
    let filtered = safeHoldings.filter(holding => {
      if (filterBy === 'outperforming') return holding.ytdPerformance > spyReturn
      if (filterBy === 'underperforming') return holding.ytdPerformance < spyReturn - 0.005
      return true
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance-high':
          return b.ytdPerformance - a.ytdPerformance
        case 'performance-low':
          return a.ytdPerformance - b.ytdPerformance
        case 'alphabetical':
          return a.ticker.localeCompare(b.ticker)
        case 'value-high':
          return (b.currentValue || 0) - (a.currentValue || 0)
        case 'value-low':
          return (a.currentValue || 0) - (b.currentValue || 0)
        default:
          return b.ytdPerformance - a.ytdPerformance
      }
    })
  }

  const displayedHoldings = getSortedAndFilteredHoldings()

  return (
    <div 
      className="rounded-xl shadow-lg p-6 transition-all duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-accent-secondary)' }}
          >
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 
              className="text-xl font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Holdings vs SPY Performance
            </h2>
            <p 
              className="transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              YTD Performance Comparison • SPY: {(spyReturn * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Portfolio Outperformance Badge */}
          <div 
            className="border rounded-lg px-4 py-2 transition-all duration-300"
            style={{ 
              backgroundColor: 'var(--color-accent-secondary)',
              borderColor: 'var(--color-accent)'
            }}
          >
            <span 
              className="text-sm font-semibold transition-colors duration-300"
              style={{ color: 'var(--color-accent)' }}
            >
              Portfolio Outperformance: {portfolio ? 
                (portfolio.spyComparison.outperformance >= 0 ? '+' : '') + 
                (portfolio.spyComparison.outperformance * 100).toFixed(1) + '%' : '0%'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm px-3 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="performance-high">Best Performance</option>
              <option value="performance-low">Worst Performance</option>
              <option value="value-high">Highest Value</option>
              <option value="value-low">Lowest Value</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* Filter Dropdown */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="text-sm px-3 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="all">All Holdings</option>
              <option value="outperforming">Outperforming SPY</option>
              <option value="underperforming">Underperforming SPY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Performance Bars */}
      <div className="space-y-3">
        {displayedHoldings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 opacity-50">🔍</div>
            <h3 
              className="text-lg font-semibold mb-2 transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              No Holdings Match Filter
            </h3>
            <p 
              className="transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Try adjusting your filter settings
            </p>
          </div>
        ) : displayedHoldings.map((holding, index) => {
          const holdingReturn = holding.ytdPerformance
          const delta = holdingReturn - spyReturn
          const isOutperforming = delta > 0.005
          const isUnderperforming = delta < -0.005
          const isMatching = Math.abs(delta) <= 0.005

          // Enhanced bar calculation for better visual representation with null safety
          const allReturns = [...safeHoldings.map(h => h.ytdPerformance), spyReturn]
          const maxReturn = Math.max(...allReturns)
          const minReturn = Math.min(...allReturns)
          const range = maxReturn - minReturn || 0.2
          
          // Calculate position relative to SPY (SPY is at 50%)
          const spyPosition = 50
          const relativePosition = spyPosition + ((holdingReturn - spyReturn) / range) * 100
          const clampedPosition = Math.max(5, Math.min(95, relativePosition))

          // Bar styles based on performance
          const barColor = isMatching 
            ? 'var(--color-warning)' 
            : isOutperforming 
              ? 'var(--color-success)'
              : 'var(--color-error)'

          const performanceIcon = isMatching 
            ? <Minus className="w-4 h-4" />
            : isOutperforming 
              ? <TrendingUp className="w-4 h-4" />
              : <TrendingDown className="w-4 h-4" />

          return (
            <div 
              key={holding.id} 
              className="relative rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{ 
                backgroundColor: hoveredHolding === holding.id 
                  ? 'var(--color-accent-secondary)' 
                  : 'var(--color-secondary)',
                border: `1px solid ${hoveredHolding === holding.id 
                  ? 'var(--color-accent)' 
                  : 'var(--color-border)'}`
              }}
              onMouseEnter={() => setHoveredHolding(holding.id)}
              onMouseLeave={() => setHoveredHolding(null)}
            >
              {/* Tooltip */}
              {hoveredHolding === holding.id && (
                <div 
                  className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-lg border text-sm whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <div className="font-semibold">{holding.ticker}</div>
                  <div>Current Value: ${(holding.currentValue || 0).toLocaleString()}</div>
                  <div>Monthly Income: ${(holding.monthlyIncome || 0).toFixed(0)}</div>
                  <div>vs SPY: {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(2)}%</div>
                  {/* Arrow pointing down */}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid var(--color-border)'
                    }}
                  />
                </div>
              )}

              <div className="flex items-center space-x-4 p-4">
                {/* Ticker and Icon */}
                <div className="flex items-center space-x-2 w-20">
                  <div 
                    className="p-1.5 rounded-lg transition-colors duration-300"
                    style={{ 
                      backgroundColor: isMatching 
                        ? 'var(--color-warning-secondary)' 
                        : isOutperforming 
                          ? 'var(--color-success-secondary)'
                          : 'var(--color-error-secondary)',
                      color: barColor
                    }}
                  >
                    {performanceIcon}
                  </div>
                  <div 
                    className="text-sm font-mono font-bold transition-colors duration-300"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {holding.ticker}
                  </div>
                </div>
                
                {/* Enhanced Performance Bar */}
                <div className="flex-1 relative h-8">
                  {/* Background track */}
                  <div 
                    className="absolute inset-0 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                  
                  {/* SPY baseline (vertical line at center) */}
                  <div 
                    className="absolute top-0 h-full w-1 transition-colors duration-300 rounded-full"
                    style={{ 
                      left: '50%', 
                      backgroundColor: 'var(--color-text-secondary)',
                      transform: 'translateX(-50%)'
                    }}
                  />
                  <div 
                    className="absolute -top-1 text-xs font-semibold transition-colors duration-300"
                    style={{ 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    SPY
                  </div>
                  
                  {/* Performance bar */}
                  <div 
                    className="absolute top-1 bottom-1 rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      backgroundColor: barColor,
                      left: clampedPosition > 50 ? '50%' : `${clampedPosition}%`,
                      right: clampedPosition > 50 ? `${100 - clampedPosition}%` : '50%',
                      minWidth: '2px',
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                  
                  {/* Performance indicator dot */}
                  <div 
                    className="absolute top-1/2 w-3 h-3 rounded-full border-2 transition-all duration-700 ease-out"
                    style={{ 
                      left: `${clampedPosition}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'var(--color-primary)',
                      borderColor: barColor,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
                
                {/* Performance Text */}
                <div className="w-24 text-right">
                  <div 
                    className="text-sm font-bold transition-colors duration-300"
                    style={{ 
                      color: isMatching 
                        ? 'var(--color-warning)' 
                        : isOutperforming 
                          ? 'var(--color-success)'
                          : 'var(--color-error)'
                    }}
                  >
                    {(holdingReturn * 100).toFixed(1)}%
                  </div>
                  <div 
                    className="text-xs transition-colors duration-300"
                    style={{ 
                      color: isMatching 
                        ? 'var(--color-warning)' 
                        : isOutperforming 
                          ? 'var(--color-success)'
                          : 'var(--color-error)'
                    }}
                  >
                    {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
                  </div>
                </div>
                
                {/* Monthly Income */}
                <div className="w-20 text-right">
                  <div 
                    className="text-sm font-semibold transition-colors duration-300"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    ${(holding.monthlyIncome || 0).toFixed(0)}
                  </div>
                  <div 
                    className="text-xs transition-colors duration-300"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    /month
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enhanced Summary Stats */}
      <div 
        className="mt-6 pt-4 border-t transition-colors duration-300"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div 
              className="text-xl font-bold mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-success)' }}
            >
              {safeHoldings.filter(h => h.ytdPerformance > spyReturn + 0.005).length}
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Outperforming
            </div>
            <div 
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: 'var(--color-success)' }}
            >
              Beating SPY
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-xl font-bold mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-error)' }}
            >
              {safeHoldings.filter(h => h.ytdPerformance < spyReturn - 0.005).length}
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Underperforming
            </div>
            <div 
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: 'var(--color-error)' }}
            >
              Below SPY
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-xl font-bold mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              ${((safeHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0)) / 1000).toFixed(0)}k
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Total Value
            </div>
            <div 
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: 'var(--color-accent)' }}
            >
              All Holdings
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-xl font-bold mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-accent)' }}
            >
              ${safeHoldings.reduce((sum, h) => sum + (h.monthlyIncome || 0), 0).toFixed(0)}
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Monthly Income
            </div>
            <div 
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: 'var(--color-accent)' }}
            >
              Dividend Flow
            </div>
          </div>
        </div>

        {/* Performance Distribution Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span 
              className="text-sm font-medium transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Performance Distribution
            </span>
            <span 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {displayedHoldings.length} of {safeHoldings.length} holdings shown
            </span>
          </div>
          
          <div className="flex h-2 rounded-full overflow-hidden">
            {safeHoldings.length > 0 && (
              <>
                <div 
                  className="transition-all duration-500"
                  style={{ 
                    backgroundColor: 'var(--color-success)',
                    width: `${(safeHoldings.filter(h => h.ytdPerformance > spyReturn + 0.005).length / safeHoldings.length) * 100}%`
                  }}
                />
                <div 
                  className="transition-all duration-500"
                  style={{ 
                    backgroundColor: 'var(--color-warning)',
                    width: `${(safeHoldings.filter(h => Math.abs(h.ytdPerformance - spyReturn) <= 0.005).length / safeHoldings.length) * 100}%`
                  }}
                />
                <div 
                  className="transition-all duration-500"
                  style={{ 
                    backgroundColor: 'var(--color-error)',
                    width: `${(safeHoldings.filter(h => h.ytdPerformance < spyReturn - 0.005).length / safeHoldings.length) * 100}%`
                  }}
                />
              </>
            )}
          </div>
          
          <div className="flex justify-between text-xs mt-1">
            <span 
              className="transition-colors duration-300"
              style={{ color: 'var(--color-success)' }}
            >
              Above SPY
            </span>
            <span 
              className="transition-colors duration-300"
              style={{ color: 'var(--color-warning)' }}
            >
              Near SPY
            </span>
            <span 
              className="transition-colors duration-300"
              style={{ color: 'var(--color-error)' }}
            >
              Below SPY
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}