'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts'
import { TrendingUp, Target, Award, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { logger } from '@/lib/logger'

interface YieldData {
  symbol: string
  companyName: string
  currentYield: number
  yieldOnCost: number
  costBasis: number
  currentPrice: number
  yearsHeld: number
  totalGainLoss: number
  dividendGrowthRate: number
  dividendGrowthYears: number
  isDividendAristocrat: boolean
  isDividendKing: boolean
}

interface YieldOnCostAnalysisProps {
  data?: YieldData[]
  className?: string
  holdings?: any[]
  showRebalanceRecommendations?: boolean
}

interface Holding {
  id: string
  ticker: string
  shares: number
  costBasis: number
  purchaseDate: string
  currentPrice?: number
  dividendYield?: number
  sector?: string
}

// Helper function to calculate years held
const calculateYearsHeld = (purchaseDate: string): number => {
  const purchase = new Date(purchaseDate)
  const now = new Date()
  const yearsDiff = (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return Math.max(0, Math.round(yearsDiff * 10) / 10)
}

// Helper function to check if stock is dividend aristocrat/king
// This would typically come from external data, for now using basic heuristics
const getDividendStatus = (ticker: string, yearsHeld: number) => {
  // Known dividend aristocrats/kings - in a real app this would come from a data service
  const dividendAristocrats = ['JNJ', 'KO', 'PG', 'MMM', 'CL', 'SYY', 'WMT', 'TGT', 'LOW', 'HD']
  const dividendKings = ['KO', 'PG', 'JNJ', 'CL']
  
  return {
    isDividendAristocrat: dividendAristocrats.includes(ticker),
    isDividendKing: dividendKings.includes(ticker)
  }
}

// Company name mapping - in a real app this would come from a stock data API
const getCompanyName = (ticker: string): string => {
  const companyNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'JNJ': 'Johnson & Johnson',
    'KO': 'The Coca-Cola Company',
    'PG': 'Procter & Gamble',
    'MMM': '3M Company',
    'T': 'AT&T Inc.',
    'VZ': 'Verizon Communications',
    'SCHD': 'Schwab US Dividend Equity ETF',
    'SPY': 'SPDR S&P 500 ETF Trust',
    'VTI': 'Vanguard Total Stock Market ETF'
  }
  return companyNames[ticker] || ticker
}

// Convert holdings data to yield analysis format
const convertHoldingsToYieldData = (holdings: Holding[]): YieldData[] => {
  return holdings
    .filter(holding => holding.currentPrice && holding.dividendYield)
    .map(holding => {
      const yearsHeld = calculateYearsHeld(holding.purchaseDate)
      const totalValue = holding.shares * (holding.currentPrice || 0)
      const totalCostBasis = holding.shares * holding.costBasis
      const totalGainLoss = totalValue - totalCostBasis
      const currentYield = holding.dividendYield || 0
      
      // Calculate yield on cost: (current annual dividend / original cost basis) * 100
      const annualDividend = (holding.currentPrice || 0) * (currentYield / 100)
      const originalAnnualDividend = holding.costBasis * (currentYield / 100)
      const yieldOnCost = holding.costBasis > 0 ? (annualDividend / holding.costBasis) * 100 : 0
      
      const { isDividendAristocrat, isDividendKing } = getDividendStatus(holding.ticker, yearsHeld)
      
      return {
        symbol: holding.ticker,
        companyName: getCompanyName(holding.ticker),
        currentYield: currentYield,
        yieldOnCost: yieldOnCost,
        costBasis: holding.costBasis,
        currentPrice: holding.currentPrice || 0,
        yearsHeld: yearsHeld,
        totalGainLoss: totalGainLoss,
        dividendGrowthRate: 0, // Would need historical dividend data to calculate
        dividendGrowthYears: Math.floor(yearsHeld),
        isDividendAristocrat,
        isDividendKing
      }
    })
}

export function YieldOnCostAnalysis({
  data,
  className = '',
  holdings,
  showRebalanceRecommendations = false
}: YieldOnCostAnalysisProps) {
  const [view, setView] = useState<'comparison' | 'scatter' | 'performance'>('comparison')
  const [sortBy, setSortBy] = useState<'yieldOnCost' | 'currentYield' | 'yearsHeld' | 'totalGain'>('yieldOnCost')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const yieldData = useMemo(() => {
    try {
      // Use provided data first, then convert holdings, fallback to empty array
      let processedData: YieldData[] = []
      
      if (data && data.length > 0) {
        processedData = data
      } else if (holdings && holdings.length > 0) {
        processedData = convertHoldingsToYieldData(holdings)
      }
      
      return processedData.sort((a, b) => {
        switch (sortBy) {
          case 'yieldOnCost':
            return b.yieldOnCost - a.yieldOnCost
          case 'currentYield':
            return b.currentYield - a.currentYield
          case 'yearsHeld':
            return b.yearsHeld - a.yearsHeld
          case 'totalGain':
            return b.totalGainLoss - a.totalGainLoss
          default:
            return 0
        }
      })
    } catch (err) {
      logger.error('Error processing yield data:', err)
      setError('Error processing portfolio data')
      return []
    }
  }, [data, holdings, sortBy])

  // Show empty state when no data
  if (!isLoading && yieldData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Yield on Cost Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare current yield vs yield on cost
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Holdings to Analyze
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add some dividend-paying stocks to your portfolio to see your yield on cost analysis.
            This chart will show you how your original investment yield compares to current yields.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Holdings
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Import Portfolio
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getBarColor = (item: YieldData) => {
    if (item.yieldOnCost > item.currentYield * 2) return '#10b981' // Excellent
    if (item.yieldOnCost > item.currentYield * 1.5) return '#3b82f6' // Good
    if (item.yieldOnCost > item.currentYield) return '#f59e0b' // Fair
    return '#ef4444' // Poor
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{data.symbol}</p>
            {(data.isDividendKing || data.isDividendAristocrat) && (
              <div className="flex items-center space-x-1">
                {data.isDividendKing && (
                  <Award className="w-4 h-4 text-yellow-500" />
                )}
                {data.isDividendAristocrat && (
                  <Target className="w-4 h-4 text-blue-500" />
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{data.companyName}</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">Yield on Cost:</span>
              <span className="text-sm font-medium text-green-600">{data.yieldOnCost.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Current Yield:</span>
              <span className="text-sm font-medium text-blue-600">{data.currentYield.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Years Held:</span>
              <span className="text-sm font-medium">{data.yearsHeld}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Gain:</span>
              <span className={`text-sm font-medium ${data.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${data.totalGainLoss.toLocaleString()}
              </span>
            </div>
            {data.dividendGrowthRate > 0 && (
              <div className="flex justify-between">
                <span className="text-sm">Dividend Growth:</span>
                <span className="text-sm font-medium text-purple-600">{data.dividendGrowthRate.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const avgYieldOnCost = yieldData.reduce((sum, item) => sum + item.yieldOnCost, 0) / yieldData.length
  const avgCurrentYield = yieldData.reduce((sum, item) => sum + item.currentYield, 0) / yieldData.length
  const totalGains = yieldData.reduce((sum, item) => sum + Math.max(0, item.totalGainLoss), 0)
  const aristocrats = yieldData.filter(item => item.isDividendAristocrat).length

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Yield on Cost Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare current yield vs yield on cost
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('comparison')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'comparison'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Comparison
            </button>
            <button
              onClick={() => setView('scatter')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'scatter'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Scatter
            </button>
            <button
              onClick={() => setView('performance')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'performance'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Performance
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {avgYieldOnCost.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Yield on Cost</div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {avgCurrentYield.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Current Yield</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {aristocrats}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Dividend Aristocrats</div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            ${(totalGains / 1000).toFixed(0)}k
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Gains</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-sm font-medium px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-300 focus:outline-none"
          >
            <option value="yieldOnCost">Sort by Yield on Cost</option>
            <option value="currentYield">Sort by Current Yield</option>
            <option value="yearsHeld">Sort by Years Held</option>
            <option value="totalGain">Sort by Total Gain</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'comparison' ? (
            <BarChart data={yieldData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="symbol" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar dataKey="yieldOnCost" fill="#10b981" name="Yield on Cost" opacity={0.8} />
              <Bar dataKey="currentYield" fill="#3b82f6" name="Current Yield" opacity={0.8} />
            </BarChart>
          ) : view === 'scatter' ? (
            <ScatterChart data={yieldData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                dataKey="yearsHeld" 
                name="Years Held"
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                type="number" 
                dataKey="yieldOnCost" 
                name="Yield on Cost"
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Holdings" fill="#3b82f6">
                {yieldData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Scatter>
            </ScatterChart>
          ) : (
            <BarChart data={yieldData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="symbol" 
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar dataKey="totalGainLoss" name="Total Gain/Loss">
                {yieldData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.totalGainLoss >= 0 ? '#10b981' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Holdings List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {yieldData.map((holding, index) => (
          <div 
            key={holding.symbol}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getBarColor(holding) }}
              />
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {holding.symbol}
                  </span>
                  {holding.isDividendKing && (
                    <Award className="w-4 h-4 text-yellow-500" />
                  )}
                  {holding.isDividendAristocrat && (
                    <Target className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {holding.companyName}
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{holding.yearsHeld}y held</span>
                  </span>
                  {holding.dividendGrowthRate > 0 && (
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{holding.dividendGrowthRate.toFixed(1)}% growth</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex space-x-4">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {holding.yieldOnCost.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Yield on Cost</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {holding.currentYield.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Current Yield</div>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                holding.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${holding.totalGainLoss.toLocaleString()} gain
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Best Performers</span>
            </div>
            <div className="space-y-1">
              {yieldData
                .filter(h => h.yieldOnCost > h.currentYield * 2)
                .slice(0, 3)
                .map(holding => (
                  <div key={holding.symbol} className="text-sm text-gray-600 dark:text-gray-400">
                    {holding.symbol}: {holding.yieldOnCost.toFixed(1)}% yield on cost
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Quality Holdings</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>{aristocrats} Dividend Aristocrats (25+ years)</div>
              <div>{yieldData.filter(h => h.isDividendKing).length} Dividend Kings (50+ years)</div>
              <div>{yieldData.filter(h => h.dividendGrowthRate > 5).length} Strong growth (&gt;5%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}