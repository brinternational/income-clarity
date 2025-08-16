'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Activity,
  DollarSign,
  Info,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { logger } from '@/lib/logger'

interface StockPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  timestamp: Date
}

interface Holding {
  id: string
  symbol: string
  shares: number
  costBasis: number
  purchaseDate?: string
  sector?: string
}

interface RealTimeHoldingsTableProps {
  holdings: Holding[]
  onUpdate?: (holdings: any[]) => void
}

export function RealTimeHoldingsTable({ holdings, onUpdate }: RealTimeHoldingsTableProps) {
  const [prices, setPrices] = useState<Map<string, StockPrice>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch real-time prices
  const fetchPrices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const symbols = holdings.map(h => h.symbol)
      const response = await fetch('/api/stock-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      })
      
      if (!response.ok) throw new Error('Failed to fetch prices')
      
      const data = await response.json()
      const priceMap = new Map<string, StockPrice>()
      
      data.prices.forEach((price: StockPrice) => {
        priceMap.set(price.symbol, price)
      })
      
      setPrices(priceMap)
      setLastUpdate(new Date())
      
      // Notify parent with updated holdings data
      if (onUpdate) {
        const updatedHoldings = holdings.map(holding => {
          const price = priceMap.get(holding.symbol)
          return {
            ...holding,
            currentPrice: price?.price || 0,
            currentValue: (price?.price || 0) * holding.shares,
            gainLoss: ((price?.price || 0) * holding.shares) - holding.costBasis,
            gainLossPercent: (((price?.price || 0) * holding.shares) - holding.costBasis) / holding.costBasis * 100,
            dayChange: price?.change || 0,
            dayChangePercent: price?.changePercent || 0
          }
        })
        onUpdate(updatedHoldings)
      }
    } catch (err) {
      logger.error('Error fetching prices:', err)
      setError('Unable to fetch real-time prices')
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 60 seconds when market is open
  useEffect(() => {
    fetchPrices()
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        const now = new Date()
        const hour = now.getHours()
        const day = now.getDay()
        
        // Only refresh during market hours (9:30 AM - 4:00 PM ET, Mon-Fri)
        const isMarketOpen = day >= 1 && day <= 5 && hour >= 9 && hour < 16
        
        if (isMarketOpen) {
          fetchPrices()
        }
      }, 60000) // 1 minute
      
      return () => clearInterval(interval)
    }
  }, [holdings, autoRefresh])

  // Calculate portfolio totals
  const totals = useMemo(() => {
    let totalValue = 0
    let totalCost = 0
    let totalDayChange = 0
    
    holdings.forEach(holding => {
      const price = prices.get(holding.symbol)
      if (price) {
        const value = price.price * holding.shares
        totalValue += value
        totalCost += holding.costBasis
        totalDayChange += (price.change * holding.shares)
      }
    })
    
    return {
      totalValue,
      totalCost,
      totalGainLoss: totalValue - totalCost,
      totalGainLossPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      totalDayChange,
      totalDayChangePercent: totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0
    }
  }, [holdings, prices])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      {/* Header with Controls */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Real-Time Holdings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                autoRefresh ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Auto-refresh
              </span>
            </label>
            
            {/* Manual refresh button */}
            <button
              onClick={fetchPrices}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Value</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              ${totals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Gain/Loss</div>
            <div className={`text-xl font-bold flex items-center ${
              totals.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {totals.totalGainLoss >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              ${Math.abs(totals.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm ml-1">({totals.totalGainLossPercent.toFixed(2)}%)</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Day Change</div>
            <div className={`text-xl font-bold flex items-center ${
              totals.totalDayChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {totals.totalDayChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              ${Math.abs(totals.totalDayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Data Source</div>
            <div className="flex items-center text-sm">
              <Activity className="w-4 h-4 mr-1 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                {process.env.NEXT_PUBLIC_POLYGON_ENABLED === 'true' ? 'Polygon.io' : 'Simulated'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Holdings Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Day Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                % Return
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {holdings.map((holding) => {
                const price = prices.get(holding.symbol)
                const currentValue = (price?.price || 0) * holding.shares
                const gainLoss = currentValue - holding.costBasis
                const gainLossPercent = holding.costBasis > 0 ? (gainLoss / holding.costBasis) * 100 : 0
                
                return (
                  <motion.tr
                    key={holding.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {holding.symbol.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {holding.symbol}
                          </div>
                          {holding.sector && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {holding.sector}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                      {holding.shares.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {loading ? (
                        <div className="animate-pulse h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${price?.price.toFixed(2) || '—'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {loading ? (
                        <div className="animate-pulse h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                      ) : price ? (
                        <div className={`text-sm font-medium flex items-center justify-end ${
                          price.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {price.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          ${Math.abs(price.change).toFixed(2)}
                          <span className="text-xs ml-1">({price.changePercent.toFixed(2)}%)</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {loading ? (
                        <div className="animate-pulse h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {loading ? (
                        <div className="animate-pulse h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                      ) : (
                        <div className={`text-sm font-medium ${
                          gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {loading ? (
                        <div className="animate-pulse h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
                      ) : (
                        <div className={`text-sm font-bold ${
                          gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {holdings.length === 0 && (
        <div className="p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No holdings yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Add your first holding to see real-time prices
          </p>
        </div>
      )}
    </div>
  )
}