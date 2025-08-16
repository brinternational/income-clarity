'use client'

import { useState } from 'react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { TrendingUp, BarChart3, Calendar, Target } from 'lucide-react'

type TimeFrame = 'YTD' | '1Y' | '3Y' | '5Y'

interface PerformanceData {
  period: TimeFrame
  portfolio: number
  spy: number
  outperformance: number
}

export function PerformanceChart() {
  const { portfolio, holdings } = usePortfolio()
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('YTD')

  // Mock performance data - in real app this would come from API
  const performanceData: PerformanceData[] = [
    { period: 'YTD', portfolio: 0.124, spy: 0.082, outperformance: 0.042 },
    { period: '1Y', portfolio: 0.186, spy: 0.142, outperformance: 0.044 },
    { period: '3Y', portfolio: 0.089, spy: 0.105, outperformance: -0.016 },
    { period: '5Y', portfolio: 0.124, spy: 0.118, outperformance: 0.006 }
  ]

  const currentData = performanceData.find(d => d.period === selectedTimeFrame) || performanceData[0]

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
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Performance Chart
            </h3>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Portfolio vs SPY comparison
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-4xl mb-3 opacity-50">📈</div>
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Add holdings to see performance tracking
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
      {/* Header with Time Frame Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-accent-secondary)' }}
          >
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Performance vs SPY
            </h3>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Historical comparison
            </p>
          </div>
        </div>
        
        {/* Time Frame Buttons */}
        <div 
          className="flex rounded-lg p-1"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        >
          {performanceData.map((data) => (
            <button
              key={data.period}
              onClick={() => setSelectedTimeFrame(data.period)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                selectedTimeFrame === data.period ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: selectedTimeFrame === data.period 
                  ? 'var(--color-accent)' 
                  : 'transparent',
                color: selectedTimeFrame === data.period 
                  ? 'white' 
                  : 'var(--color-text-primary)'
              }}
            >
              {data.period}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div 
            className="text-2xl font-bold mb-1 transition-colors duration-300"
            style={{ 
              color: currentData.portfolio > 0 
                ? 'var(--color-success)' 
                : 'var(--color-error)' 
            }}
          >
            {currentData.portfolio > 0 ? '+' : ''}{(currentData.portfolio * 100).toFixed(1)}%
          </div>
          <div 
            className="text-xs font-semibold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Portfolio
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {selectedTimeFrame}
          </div>
        </div>
        
        <div className="text-center">
          <div 
            className="text-2xl font-bold mb-1 transition-colors duration-300"
            style={{ 
              color: currentData.spy > 0 
                ? 'var(--color-info)' 
                : 'var(--color-error)' 
            }}
          >
            {currentData.spy > 0 ? '+' : ''}{(currentData.spy * 100).toFixed(1)}%
          </div>
          <div 
            className="text-xs font-semibold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            SPY Benchmark
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {selectedTimeFrame}
          </div>
        </div>
        
        <div className="text-center">
          <div 
            className="text-2xl font-bold mb-1 transition-colors duration-300"
            style={{ 
              color: currentData.outperformance > 0 
                ? 'var(--color-success)' 
                : 'var(--color-warning)' 
            }}
          >
            {currentData.outperformance > 0 ? '+' : ''}{(currentData.outperformance * 100).toFixed(1)}%
          </div>
          <div 
            className="text-xs font-semibold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Alpha
          </div>
          <div 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            vs SPY
          </div>
        </div>
      </div>

      {/* Visual Performance Bars */}
      <div className="space-y-4">
        {/* Portfolio Performance Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--color-success)' }}
              />
              <span 
                className="text-sm font-semibold transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Your Portfolio
              </span>
            </div>
            <span 
              className="text-sm font-bold transition-colors duration-300"
              style={{ 
                color: currentData.portfolio > 0 
                  ? 'var(--color-success)' 
                  : 'var(--color-error)' 
              }}
            >
              {currentData.portfolio > 0 ? '+' : ''}{(currentData.portfolio * 100).toFixed(1)}%
            </span>
          </div>
          <div 
            className="w-full h-3 rounded-full transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                backgroundColor: currentData.portfolio > 0 
                  ? 'var(--color-success)' 
                  : 'var(--color-error)',
                width: `${Math.abs(currentData.portfolio) * 200}%`,
                maxWidth: '100%'
              }}
            />
          </div>
        </div>

        {/* SPY Benchmark Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: 'var(--color-info)' }}
              />
              <span 
                className="text-sm font-semibold transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                S&P 500 (SPY)
              </span>
            </div>
            <span 
              className="text-sm font-bold transition-colors duration-300"
              style={{ 
                color: currentData.spy > 0 
                  ? 'var(--color-info)' 
                  : 'var(--color-error)' 
              }}
            >
              {currentData.spy > 0 ? '+' : ''}{(currentData.spy * 100).toFixed(1)}%
            </span>
          </div>
          <div 
            className="w-full h-3 rounded-full transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                backgroundColor: currentData.spy > 0 
                  ? 'var(--color-info)' 
                  : 'var(--color-error)',
                width: `${Math.abs(currentData.spy) * 200}%`,
                maxWidth: '100%',
                animationDelay: '300ms'
              }}
            />
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div 
        className="mt-6 pt-4 border-t transition-colors duration-300"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currentData.outperformance > 0 ? (
              <>
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                <span 
                  className="text-sm font-semibold transition-colors duration-300"
                  style={{ color: 'var(--color-success)' }}
                >
                  Outperforming SPY
                </span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
                <span 
                  className="text-sm font-semibold transition-colors duration-300"
                  style={{ color: 'var(--color-warning)' }}
                >
                  Room for Improvement
                </span>
              </>
            )}
          </div>
          <div 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {selectedTimeFrame} performance
          </div>
        </div>
        
        <div className="mt-2">
          <p 
            className="text-xs transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {currentData.outperformance > 0 
              ? `Your dividend-focused strategy is beating the market by ${(Math.abs(currentData.outperformance) * 100).toFixed(1)} percentage points.`
              : `Consider rebalancing to improve performance. Current underperformance: ${(Math.abs(currentData.outperformance) * 100).toFixed(1)} percentage points.`
            }
          </p>
        </div>
      </div>
    </div>
  )
}