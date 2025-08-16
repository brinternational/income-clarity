'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, Download, AlertCircle } from 'lucide-react'
import { logger } from '@/lib/logger'

interface PerformanceDataPoint {
  date: string
  portfolioValue: number
  spyValue: number
  dividendIncome: number
  cumulativeDividends: number
}

interface PerformanceChartProps {
  data?: PerformanceDataPoint[]
  timeframe?: '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL'
  showDividends?: boolean
  className?: string
  performanceSnapshots?: {
    date: string
    totalValue: number
    spyPrice: number
    dividendIncome: number
  }[]
}

interface PerformanceSnapshot {
  id: string
  date: string
  totalValue: number
  totalCostBasis: number
  totalGainLoss: number
  totalReturn: number
  dividendIncome: number
  spyPrice?: number
  spyReturn?: number
  monthlyIncome: number
  monthlyExpenses: number
  netIncome: number
}

const timeframeOptions = [
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: 'ALL', label: 'All' }
] as const

// Helper function to filter data by timeframe
const filterDataByTimeframe = (data: PerformanceDataPoint[], timeframe: string): PerformanceDataPoint[] => {
  const now = new Date()
  const startDate = new Date()
  
  switch (timeframe) {
    case '1M':
      startDate.setMonth(now.getMonth() - 1)
      break
    case '3M':
      startDate.setMonth(now.getMonth() - 3)
      break
    case '6M':
      startDate.setMonth(now.getMonth() - 6)
      break
    case '1Y':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case '5Y':
      startDate.setFullYear(now.getFullYear() - 5)
      break
    case 'ALL':
      return data // Return all data
    default:
      return data
  }
  
  return data.filter(point => new Date(point.date) >= startDate)
}

// Convert performance snapshots to chart format
const convertSnapshotsToChartData = (snapshots: PerformanceSnapshot[]): PerformanceDataPoint[] => {
  if (snapshots.length === 0) return []
  
  // Sort snapshots by date
  const sortedSnapshots = [...snapshots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  let cumulativeDividends = 0
  
  return sortedSnapshots.map((snapshot, index) => {
    cumulativeDividends += snapshot.dividendIncome
    
    return {
      date: snapshot.date.split('T')[0], // Format as YYYY-MM-DD
      portfolioValue: snapshot.totalValue,
      spyValue: snapshot.spyPrice || 0,
      dividendIncome: snapshot.dividendIncome,
      cumulativeDividends: cumulativeDividends
    }
  })
}

export function PerformanceChart({
  data,
  timeframe = '1Y',
  showDividends = true,
  className = '',
  performanceSnapshots
}: PerformanceChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [chartType, setChartType] = useState<'line' | 'area'>('area')
  const [isLoading, setIsLoading] = useState(false)

  const chartData = useMemo(() => {
    // Use provided data first
    if (data && data.length > 0) {
      return filterDataByTimeframe(data, selectedTimeframe)
    }
    
    // Convert performance snapshots to chart data
    if (performanceSnapshots && performanceSnapshots.length > 0) {
      const convertedData = performanceSnapshots.map((snapshot, index) => {
        return {
          date: snapshot.date.split('T')[0],
          portfolioValue: snapshot.totalValue,
          spyValue: snapshot.spyPrice,
          dividendIncome: snapshot.dividendIncome,
          cumulativeDividends: performanceSnapshots
            .slice(0, index + 1)
            .reduce((sum, s) => sum + s.dividendIncome, 0)
        }
      })
      
      return filterDataByTimeframe(convertedData, selectedTimeframe)
    }
    
    // Return empty array if no real data available
    return []
  }, [data, performanceSnapshots, selectedTimeframe])

  // Show empty state when no data
  if (!isLoading && chartData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Portfolio Performance
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your portfolio vs SPY benchmark
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Performance Data Available
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Start tracking your portfolio performance by adding holdings and transactions.
            This chart will show your returns compared to the SPY benchmark.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Add Holdings
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              View Transactions
            </button>
          </div>
        </div>
      </div>
    )
  }

  const latestData = chartData[chartData.length - 1] || {
    portfolioValue: 0,
    spyValue: 0,
    cumulativeDividends: 0
  }

  const firstData = chartData[0] || {
    portfolioValue: 0,
    spyValue: 0,
    cumulativeDividends: 0
  }

  const portfolioReturn = ((latestData.portfolioValue - firstData.portfolioValue) / firstData.portfolioValue) * 100
  const spyReturn = ((latestData.spyValue - firstData.spyValue) / firstData.spyValue) * 100
  const outperformance = portfolioReturn - spyReturn

  const exportChart = () => {
    // Implementation for exporting chart as PNG or CSV
    logger.log('Exporting chart data...')
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
              Portfolio: ${data.portfolioValue?.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-gray-400 rounded mr-2"></span>
              SPY: ${data.spyValue?.toLocaleString()}
            </p>
            {showDividends && data.dividendIncome > 0 && (
              <p className="text-sm">
                <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
                Dividend: ${data.dividendIncome}
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Portfolio Performance
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Historical performance vs S&P 500
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportChart}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Export Chart"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className={`text-2xl font-bold flex items-center justify-center ${
            portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {portfolioReturn >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
            {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(1)}%
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Portfolio</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{selectedTimeframe}</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className={`text-2xl font-bold flex items-center justify-center ${
            spyReturn >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {spyReturn >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
            {spyReturn >= 0 ? '+' : ''}{spyReturn.toFixed(1)}%
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">S&P 500</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Benchmark</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className={`text-2xl font-bold flex items-center justify-center ${
            outperformance >= 0 ? 'text-green-600' : 'text-orange-600'
          }`}>
            {outperformance >= 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
            {outperformance >= 0 ? '+' : ''}{outperformance.toFixed(1)}%
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Alpha</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">vs SPY</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        {/* Timeframe Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedTimeframe(option.value as any)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                selectedTimeframe === option.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Chart Type Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              chartType === 'area'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              chartType === 'line'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {chartType === 'area' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  name="Portfolio"
                />
                <Area
                  type="monotone"
                  dataKey="spyValue"
                  stackId="2"
                  stroke="#6b7280"
                  fill="#6b7280"
                  fillOpacity={0.1}
                  name="S&P 500"
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Portfolio"
                />
                <Line
                  type="monotone"
                  dataKey="spyValue"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={false}
                  name="S&P 500"
                />
              </>
            )}
            
            {showDividends && (
              <Line
                type="monotone"
                dataKey="cumulativeDividends"
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Cumulative Dividends"
                yAxisId="right"
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {outperformance > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">Outperforming SPY</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-600">Underperforming SPY</span>
              </>
            )}
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            Total dividends: ${latestData.cumulativeDividends.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}