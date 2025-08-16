'use client'

import React, { useState, useEffect } from 'react'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Button } from '@/components/forms/Button'
import { Plus, TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface Portfolio {
  id: string
  name: string
  type: string
}

interface FilterValues {
  portfolioId?: string
  ticker?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}

interface QuickStat {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
}

export default function TransactionsPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [filters, setFilters] = useState<FilterValues>({})
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [quickStats, setQuickStats] = useState<QuickStat[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch portfolios for filter dropdown
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await fetch('/api/portfolios', {
          headers: {
            'x-demo-user-id': 'demo-user'
          }
        })
        const result = await response.json()
        
        if (result.success) {
          setPortfolios(result.data || [])
        }
      } catch (error) {
        logger.error('Failed to fetch portfolios:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolios()
  }, [])

  // Fetch quick stats based on current filters
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const params = new URLSearchParams()
        if (filters.portfolioId) params.set('portfolioId', filters.portfolioId)
        if (filters.ticker) params.set('ticker', filters.ticker)
        if (filters.type) params.set('type', filters.type)
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.set('dateTo', filters.dateTo)

        const response = await fetch(`/api/transactions?limit=1&${params}`, {
          headers: {
            'x-demo-user-id': 'demo-user'
          }
        })
        const result = await response.json()
        
        if (result.success && result.summary) {
          const { summary } = result
          
          const stats: QuickStat[] = [
            {
              label: 'Total Transactions',
              value: summary.totalTransactions.toLocaleString(),
              icon: <Receipt className="h-5 w-5" />,
              color: 'text-blue-600 bg-blue-50 border-blue-200'
            },
            {
              label: 'Total Invested',
              value: `$${summary.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              trend: 'up',
              icon: <TrendingUp className="h-5 w-5" />,
              color: 'text-green-600 bg-green-50 border-green-200'
            },
            {
              label: 'Dividends Received',
              value: `$${summary.totalDividends.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              trend: summary.totalDividends > 0 ? 'up' : 'neutral',
              icon: <DollarSign className="h-5 w-5" />,
              color: 'text-purple-600 bg-purple-50 border-purple-200'
            },
            {
              label: 'Net Cash Flow',
              value: `${summary.netCashFlow >= 0 ? '+' : '-'}$${Math.abs(summary.netCashFlow).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              trend: summary.netCashFlow >= 0 ? 'up' : 'down',
              icon: summary.netCashFlow >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />,
              color: summary.netCashFlow >= 0 
                ? 'text-green-600 bg-green-50 border-green-200'
                : 'text-red-600 bg-red-50 border-red-200'
            }
          ]
          
          setQuickStats(stats)
        }
      } catch (error) {
        logger.error('Failed to fetch quick stats:', error)
      }
    }

    if (!loading) {
      fetchQuickStats()
    }
  }, [filters, loading, refreshKey])

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
  }

  const handleAddTransaction = () => {
    setShowTransactionForm(true)
  }

  const handleTransactionAdded = () => {
    setShowTransactionForm(false)
    setRefreshKey(prev => prev + 1) // Force refresh of components
    toast.success('Transaction added successfully!')
  }

  const handleTransactionFormClose = () => {
    setShowTransactionForm(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Transaction History
            </h1>
            <p className="text-gray-600">
              Track all your portfolio transactions and analyze your investment activity
            </p>
          </div>
          
          <Button
            onClick={handleAddTransaction}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {quickStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${stat.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="opacity-70">
                  {stat.icon}
                </div>
              </div>
              
              {stat.trend && (
                <div className={`flex items-center mt-2 text-xs ${
                  stat.trend === 'up' ? 'text-green-600' :
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {stat.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  <span>
                    {stat.trend === 'up' ? 'Positive' : 
                     stat.trend === 'down' ? 'Negative' : 'Neutral'} trend
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <TransactionFilters
          portfolios={portfolios}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-lg shadow-sm">
        <TransactionList
          key={refreshKey}
          filters={filters}
          onAddTransaction={handleAddTransaction}
        />
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
              <TransactionForm
                portfolios={portfolios}
                onSuccess={handleTransactionAdded}
                onCancel={handleTransactionFormClose}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}