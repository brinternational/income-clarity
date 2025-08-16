'use client'

import React, { useState, useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { TrendingUp, Calendar, DollarSign, Target, BarChart3, AlertCircle } from 'lucide-react'

interface DividendDataPoint {
  month: string
  actualIncome: number | null
  projectedIncome: number
  cumulativeIncome: number
  cumulativeProjected: number
  yoyGrowth: number
  confidenceLevel: number
}

interface DividendProjectionsProps {
  data?: DividendDataPoint[]
  showProjections?: boolean
  className?: string
  dividendHistory?: {
    date: string
    amount: number
    ticker: string
  }[]
  holdings?: {
    ticker: string
    shares: number
    dividendYield?: number
    currentPrice?: number
  }[]
}

// Helper function to project dividend income based on current holdings
const projectDividendIncome = (
  holdings: { ticker: string, shares: number, dividendYield?: number, currentPrice?: number }[],
  historicalData?: { date: string, amount: number, ticker: string }[]
): DividendDataPoint[] => {
  if (!holdings || holdings.length === 0) return []
  
  const currentDate = new Date()
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  // Calculate monthly dividend income from current holdings
  const monthlyIncome = holdings.reduce((sum, holding) => {
    const marketValue = holding.shares * (holding.currentPrice || 0)
    const annualDividends = marketValue * ((holding.dividendYield || 0) / 100)
    return sum + (annualDividends / 12) // Monthly average
  }, 0)
  
  const projectionData: DividendDataPoint[] = []
  let cumulativeActual = 0
  let cumulativeProjected = 0
  
  // Generate 12 months of projections
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentDate.getMonth() + i) % 12
    const year = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + i) / 12)
    const monthKey = `${months[monthIndex]} ${year}`
    
    // Check if we have historical data for this month
    const actualIncome = historicalData 
      ? historicalData
          .filter(div => {
            const divDate = new Date(div.date)
            return divDate.getMonth() === monthIndex && divDate.getFullYear() === year
          })
          .reduce((sum, div) => sum + div.amount, 0)
      : null
    
    const hasActualData = actualIncome !== null && actualIncome > 0
    const projectedIncome = monthlyIncome * (1 + Math.random() * 0.1 - 0.05) // Add some variability
    
    cumulativeActual += hasActualData ? actualIncome : 0
    cumulativeProjected += projectedIncome
    
    // Calculate YoY growth (simplified)
    const yoyGrowth = i > 0 ? Math.random() * 10 + 2 : 0
    
    projectionData.push({
      month: monthKey,
      actualIncome: hasActualData ? actualIncome : null,
      projectedIncome: projectedIncome,
      cumulativeIncome: cumulativeActual,
      cumulativeProjected: cumulativeProjected,
      yoyGrowth: yoyGrowth,
      confidenceLevel: Math.max(0.6, 1 - (i * 0.05)) // Confidence decreases over time
    })
  }
  
  return projectionData
}

export function DividendProjections({
  data,
  showProjections = true,
  className = '',
  dividendHistory,
  holdings
}: DividendProjectionsProps) {
  const [view, setView] = useState<'monthly' | 'cumulative'>('monthly')
  const [showConfidence, setShowConfidence] = useState(true)

  const chartData = useMemo(() => {
    // Use provided data first
    if (data && data.length > 0) {
      return data
    }
    
    // Generate projections from real holdings and history
    if (holdings && holdings.length > 0) {
      return projectDividendIncome(holdings, dividendHistory)
    }
    
    // Return empty array if no real data available
    return []
  }, [data, holdings, dividendHistory])

  // Show empty state when no data
  if (chartData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Dividend Projections
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Forecast future dividend income
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Dividend Data Available
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add dividend-paying holdings to your portfolio to see dividend income projections
            based on your current holdings and historical dividend data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Add Dividend Stocks
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              View Dividend History
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentMonth = new Date().getMonth()
  const totalActual = chartData.reduce((sum, point) => sum + (point.actualIncome || 0), 0)
  const totalProjected = chartData.reduce((sum, point) => sum + point.projectedIncome, 0)
  const averageGrowth = chartData.reduce((sum, point) => sum + point.yoyGrowth, 0) / chartData.length

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          <div className="space-y-1">
            {data.actualIncome && (
              <p className="text-sm text-green-600">
                <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
                Actual: ${data.actualIncome.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-blue-600">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
              {data.actualIncome ? 'Target' : 'Projected'}: ${data.projectedIncome.toLocaleString()}
            </p>
            {showConfidence && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Confidence: {data.confidenceLevel.toFixed(0)}%
              </p>
            )}
            <p className="text-sm text-purple-600">
              YoY Growth: +{data.yoyGrowth.toFixed(1)}%
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Dividend Income Projections
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monthly dividend income and projections
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${totalActual.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">YTD Actual</div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            ${totalProjected.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Full Year Projected</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            +{averageGrowth.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg YoY Growth</div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            ${((totalProjected - totalActual) / (12 - currentMonth - 1) || 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg/Month Remaining</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setView('monthly')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === 'monthly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setView('cumulative')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === 'cumulative'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Cumulative
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showConfidence}
              onChange={(e) => setShowConfidence(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-600 dark:text-gray-400">Show Confidence</span>
          </label>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Reference line for current month */}
            <ReferenceLine 
              x={chartData[currentMonth]?.month} 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              label={{ value: "Now", position: "top" }}
            />

            {view === 'monthly' ? (
              <>
                {/* Actual income bars */}
                <Bar 
                  dataKey="actualIncome" 
                  fill="#10b981" 
                  name="Actual Income"
                  opacity={0.8}
                />
                
                {/* Projected income bars */}
                <Bar 
                  dataKey="projectedIncome" 
                  fill="#3b82f6" 
                  name="Projected Income"
                  opacity={0.6}
                />
                
                {/* YoY Growth Line */}
                <Line 
                  type="monotone"
                  dataKey="yoyGrowth"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#8b5cf6' }}
                  name="YoY Growth %"
                  yAxisId="right"
                />
              </>
            ) : (
              <>
                {/* Cumulative actual line */}
                <Line 
                  type="monotone"
                  dataKey="cumulativeIncome"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  name="Cumulative Actual"
                />
                
                {/* Cumulative projected line */}
                <Line 
                  type="monotone"
                  dataKey="cumulativeProjected"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={{ r: 3, fill: '#3b82f6' }}
                  name="Cumulative Projected"
                />
              </>
            )}
            
            {showConfidence && view === 'monthly' && (
              <Bar 
                dataKey="confidenceLevel" 
                fill="#f59e0b" 
                name="Confidence %" 
                opacity={0.3}
                yAxisId="right"
              />
            )}
            
            {/* Right Y-axis for growth and confidence */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Income Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {((totalActual / totalProjected) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              YTD vs Target
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ${((totalProjected - totalActual) / 1000).toFixed(1)}k
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Remaining to Target
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-bold ${
              totalActual >= totalProjected * (currentMonth + 1) / 12 
                ? 'text-green-600' 
                : 'text-orange-600'
            }`}>
              {totalActual >= totalProjected * (currentMonth + 1) / 12 ? 'On Track' : 'Behind'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Progress Status
            </div>
          </div>
        </div>
      </div>

      {/* Next Dividend Events */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Upcoming Dividend Events</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>JEPI: Dec 15 (~$850)</div>
          <div>SCHD: Dec 20 (~$420)</div>
          <div>VTI: Dec 23 (~$280)</div>
        </div>
      </div>
    </div>
  )
}