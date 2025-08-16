'use client'

import { useState, useMemo, memo } from 'react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { BarChart3, TrendingUp, TrendingDown, Calendar, Target, Filter } from 'lucide-react'

interface IncomeDataPoint {
  month: string
  year: number
  totalDividends: number
  dividendIncrease: number
  specialDividends: number
  netIncome: number
  growthRate: number
  monthIndex: number
}

const IncomeChartComponent = () => {
  const { portfolio, holdings } = usePortfolio()
  const [timeframe, setTimeframe] = useState<'6m' | '12m' | '24m'>('12m')
  const [chartType, setChartType] = useState<'dividends' | 'growth' | 'net'>('dividends')

  // Generate historical income data (mock data for demonstration)
  const historicalData = useMemo((): IncomeDataPoint[] => {
    const currentMonthlyIncome = portfolio?.monthlyGrossIncome || 0
    const monthsBack = timeframe === '6m' ? 6 : timeframe === '12m' ? 12 : 24
    const data: IncomeDataPoint[] = []
    
    const currentDate = new Date()
    
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthIndex = monthsBack - i - 1
      
      // Generate realistic income progression (with some volatility)
      const baseGrowthRate = 0.008 // 0.8% monthly growth
      const volatility = (Math.random() - 0.5) * 0.02 // ±1% random volatility
      const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.01 // Seasonal variation
      
      const adjustedGrowthRate = baseGrowthRate + volatility + seasonalFactor
      const historicIncome = currentMonthlyIncome / Math.pow(1 + baseGrowthRate, i)
      const actualIncome = historicIncome * (1 + adjustedGrowthRate)
      
      // Calculate dividend increases (companies that raised dividends that month)
      const dividendIncrease = i < monthsBack / 2 ? Math.random() * actualIncome * 0.1 : 0
      
      // Special dividends (rare events)
      const specialDividends = Math.random() > 0.9 ? Math.random() * actualIncome * 0.2 : 0
      
      // Net income after taxes (rough estimate)
      const netIncome = actualIncome * 0.78 // Assuming ~22% effective tax rate
      
      // Growth rate comparison to previous month
      const growthRate = monthIndex > 0 && data.length > 0 ? 
        ((actualIncome - data[data.length - 1].totalDividends) / data[data.length - 1].totalDividends) * 100 : 0

      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear(),
        totalDividends: actualIncome,
        dividendIncrease,
        specialDividends,
        netIncome,
        growthRate,
        monthIndex
      })
    }
    
    return data
  }, [portfolio, timeframe])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (historicalData.length === 0) return null
    
    const totalIncome = historicalData.reduce((sum, point) => sum + point.totalDividends, 0)
    const averageMonthly = totalIncome / historicalData.length
    const latestIncome = historicalData[historicalData.length - 1]?.totalDividends || 0
    const oldestIncome = historicalData[0]?.totalDividends || 0
    const totalGrowthRate = oldestIncome > 0 ? ((latestIncome - oldestIncome) / oldestIncome) * 100 : 0
    const averageGrowthRate = historicalData.reduce((sum, point) => sum + point.growthRate, 0) / historicalData.length
    
    const dividendIncreases = historicalData.filter(point => point.dividendIncrease > 0).length
    const specialDividendCount = historicalData.filter(point => point.specialDividends > 0).length
    
    return {
      totalIncome,
      averageMonthly,
      totalGrowthRate,
      averageGrowthRate,
      dividendIncreases,
      specialDividendCount,
      latestIncome
    }
  }, [historicalData])

  // Find max value for chart scaling
  const maxValue = useMemo(() => {
    if (historicalData.length === 0) return 1000
    
    const values = historicalData.map(point => {
      switch (chartType) {
        case 'dividends': return point.totalDividends + point.specialDividends
        case 'growth': return Math.abs(point.growthRate)
        case 'net': return point.netIncome
        default: return point.totalDividends
      }
    })
    
    return Math.max(...values)
  }, [historicalData, chartType])

  if (!summaryStats) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Income History</h3>
          <p className="text-gray-600">Add dividend-paying holdings to see your income history and trends.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Income History</h2>
              <p className="text-gray-600">Historical dividend income and growth trends</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
            >
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="24m">Last 24 Months</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className={`text-xl font-bold ${summaryStats.totalGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summaryStats.totalGrowthRate >= 0 ? '+' : ''}{summaryStats.totalGrowthRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Total Growth</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-600">
              ${summaryStats.averageMonthly.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">Avg Monthly</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-purple-600">
              {summaryStats.dividendIncreases}
            </div>
            <div className="text-xs text-gray-600">Div Increases</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-indigo-600">
              {summaryStats.specialDividendCount}
            </div>
            <div className="text-xs text-gray-600">Special Divs</div>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
          {[
            { id: 'dividends' as const, label: 'Total Income', icon: Target },
            { id: 'growth' as const, label: 'Growth Rate', icon: TrendingUp },
            { id: 'net' as const, label: 'After Tax', icon: Calendar }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                chartType === type.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4 sm:p-6">
        <div className="relative" style={{ height: '300px' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
            <span>${(maxValue).toFixed(0)}</span>
            <span>${(maxValue * 0.75).toFixed(0)}</span>
            <span>${(maxValue * 0.5).toFixed(0)}</span>
            <span>${(maxValue * 0.25).toFixed(0)}</span>
            <span>$0</span>
          </div>

          {/* Chart bars */}
          <div className="ml-12 h-full flex items-end justify-between space-x-1">
            {historicalData.map((point, index) => {
              const value = chartType === 'dividends' ? point.totalDividends : 
                          chartType === 'growth' ? Math.abs(point.growthRate) * 100 : 
                          point.netIncome
              
              const height = (value / maxValue) * 100
              const isPositiveGrowth = chartType === 'growth' ? point.growthRate >= 0 : true
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  {/* Bar */}
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                    style={{ 
                      height: `${height}%`,
                      backgroundColor: chartType === 'dividends' ? '#8b5cf6' :
                                    chartType === 'growth' ? (isPositiveGrowth ? '#10b981' : '#ef4444') :
                                    '#3b82f6',
                      minHeight: '4px'
                    }}
                    title={`${point.month} ${point.year}: ${
                      chartType === 'dividends' ? `$${point.totalDividends.toFixed(0)}` :
                      chartType === 'growth' ? `${point.growthRate.toFixed(1)}%` :
                      `$${point.netIncome.toFixed(0)}`
                    }`}
                  >
                    {/* Special dividend indicator */}
                    {chartType === 'dividends' && point.specialDividends > 0 && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full border-2 border-white" />
                    )}
                    
                    {/* Dividend increase indicator */}
                    {chartType === 'dividends' && point.dividendIncrease > 0 && (
                      <div className="absolute top-0 right-0 w-3 h-3">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      </div>
                    )}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-10">
                      <div className="font-semibold">{point.month} {point.year}</div>
                      {chartType === 'dividends' && (
                        <>
                          <div>Dividends: ${point.totalDividends.toFixed(0)}</div>
                          {point.specialDividends > 0 && <div>Special: ${point.specialDividends.toFixed(0)}</div>}
                          {point.dividendIncrease > 0 && <div>Increases: +${point.dividendIncrease.toFixed(0)}</div>}
                        </>
                      )}
                      {chartType === 'growth' && (
                        <div>Growth: {point.growthRate.toFixed(1)}%</div>
                      )}
                      {chartType === 'net' && (
                        <div>Net: ${point.netIncome.toFixed(0)}</div>
                      )}
                    </div>
                  </div>

                  {/* Month label */}
                  <div className="text-xs text-gray-600 transform rotate-45 origin-center">
                    {point.month}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 ml-12 flex flex-col justify-between pointer-events-none">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <div
                key={index}
                className="border-t border-gray-200 w-full"
                style={{ marginTop: index === 0 ? 0 : -1 }}
              />
            ))}
          </div>
        </div>

        {/* Legend and Insights */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4 text-sm">
              {chartType === 'dividends' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span>Regular Dividends</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span>Special Dividends</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span>Dividend Increases</span>
                  </div>
                </>
              )}
              {chartType === 'growth' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Positive Growth</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>Negative Growth</span>
                  </div>
                </>
              )}
              {chartType === 'net' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span>After-Tax Income</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-sm text-gray-600">
              {chartType === 'dividends' && `Average growth: ${summaryStats.averageGrowthRate.toFixed(1)}%/month`}
              {chartType === 'growth' && `Best month: +${Math.max(...historicalData.map(p => p.growthRate)).toFixed(1)}%`}
              {chartType === 'net' && `Tax efficiency: ~${((summaryStats.averageMonthly * 0.78) / summaryStats.averageMonthly * 100).toFixed(0)}%`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const IncomeChart = memo(IncomeChartComponent)