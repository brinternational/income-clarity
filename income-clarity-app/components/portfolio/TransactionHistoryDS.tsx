/**
 * Manual Portfolio Entry - Transaction History View
 * MANUAL-005: Basic transaction history view with filtering
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/design-system/core/Button'
import { TextField, SearchField } from '@/components/design-system/forms/TextField'
import { Select } from '@/components/design-system/forms/Select'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/design-system/feedback/Modal'
import { Card } from '@/components/design-system/core/Card'
import { Alert } from '@/components/design-system/core/Alert'
import { Badge } from '@/components/design-system/core/Badge'
import { History, Filter, Download, TrendingUp, DollarSign, Calendar, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface Transaction {
  id: string
  type: 'BUY' | 'SELL' | 'DIVIDEND'
  ticker?: string
  shares?: number
  price?: number
  amount: number
  date: string
  notes?: string
  metadata?: any
}

interface TransactionHistoryProps {
  open: boolean
  onClose: () => void
  portfolioId?: string
  holdingId?: string
}

interface FilterState {
  type: string
  ticker: string
  dateFrom: string
  dateTo: string
  sortBy: 'date' | 'amount' | 'type'
  sortOrder: 'asc' | 'desc'
}

export function TransactionHistoryDS({ 
  open, 
  onClose, 
  portfolioId,
  holdingId 
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    ticker: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Fetch transactions when modal opens
  useEffect(() => {
    if (open) {
      fetchTransactions()
    }
  }, [open, portfolioId, holdingId])

  // Apply filters when transactions or filters change
  useEffect(() => {
    applyFilters()
  }, [transactions, filters])

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')

    try {
      // Determine API endpoint based on props
      let apiUrl = '/api/transactions'
      const params = new URLSearchParams()
      
      if (portfolioId) {
        params.append('portfolioId', portfolioId)
      }
      if (holdingId) {
        params.append('holdingId', holdingId)
      }
      
      if (params.toString()) {
        apiUrl += `?${params.toString()}`
      }

      logger.log('📋 Fetching transactions:', apiUrl)

      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
      logger.log(`✅ Loaded ${data.transactions?.length || 0} transactions`)
    } catch (err) {
      logger.error('❌ Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Filter by ticker
    if (filters.ticker) {
      const tickerLower = filters.ticker.toLowerCase()
      filtered = filtered.filter(t => 
        t.ticker?.toLowerCase().includes(tickerLower)
      )
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter(t => new Date(t.date) >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(t => new Date(t.date) <= toDate)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'amount':
          aValue = Math.abs(a.amount)
          bValue = Math.abs(b.amount)
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        default:
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredTransactions(filtered)
  }

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      ticker: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }

  const exportTransactions = () => {
    if (filteredTransactions.length === 0) return

    const headers = ['Date', 'Type', 'Ticker', 'Shares', 'Price', 'Amount', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.ticker || '',
        t.shares || '',
        t.price || '',
        t.amount.toFixed(2),
        (t.notes || '').replace(/,/g, ';')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-success-600" />
      case 'SELL':
        return <TrendingUp className="w-4 h-4 text-error-600 rotate-180" />
      case 'DIVIDEND':
        return <DollarSign className="w-4 h-4 text-brand-600" />
      default:
        return <TrendingUp className="w-4 h-4 text-neutral-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'success'
      case 'SELL':
        return 'error'
      case 'DIVIDEND':
        return 'brand'
      default:
        return 'neutral'
    }
  }

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    const stats = {
      totalTransactions: filteredTransactions.length,
      totalBuys: 0,
      totalSells: 0,
      totalDividends: 0,
      buyAmount: 0,
      sellAmount: 0,
      dividendAmount: 0
    }

    filteredTransactions.forEach(t => {
      switch (t.type) {
        case 'BUY':
          stats.totalBuys++
          stats.buyAmount += Math.abs(t.amount)
          break
        case 'SELL':
          stats.totalSells++
          stats.sellAmount += Math.abs(t.amount)
          break
        case 'DIVIDEND':
          stats.totalDividends++
          stats.dividendAmount += t.amount
          break
      }
    })

    return stats
  }, [filteredTransactions])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transaction History"
      description="View and filter your trading and dividend history"
      size="4xl"
      closeOnBackdropClick={!loading}
      showCloseButton={!loading}
    >
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Summary Stats */}
        <Card className="bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
          <div className="p-4">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <History className="w-4 h-4" />
              Transaction Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Total Transactions:</span>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {summaryStats.totalTransactions}
                </div>
              </div>
              
              <div>
                <span className="text-success-600 dark:text-success-400">Purchases:</span>
                <div className="font-semibold text-success-700 dark:text-success-300">
                  {summaryStats.totalBuys} (${summaryStats.buyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </div>
              </div>
              
              <div>
                <span className="text-error-600 dark:text-error-400">Sales:</span>
                <div className="font-semibold text-error-700 dark:text-error-300">
                  {summaryStats.totalSells} (${summaryStats.sellAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </div>
              </div>
              
              <div>
                <span className="text-brand-600 dark:text-brand-400">Dividends:</span>
                <div className="font-semibold text-brand-700 dark:text-brand-300">
                  {summaryStats.totalDividends} (${summaryStats.dividendAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card className="border-neutral-200 dark:border-neutral-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={loading}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTransactions}
                  disabled={loading || filteredTransactions.length === 0}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Export CSV
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Select
                label="Type"
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value)}
                disabled={loading}
              >
                <option value="">All Types</option>
                <option value="BUY">Purchases</option>
                <option value="SELL">Sales</option>
                <option value="DIVIDEND">Dividends</option>
              </Select>

              <SearchField
                label="Ticker"
                value={filters.ticker}
                onChange={(e) => handleFilterChange('ticker', e.target.value)}
                placeholder="Search ticker..."
                disabled={loading}
              />

              <TextField
                label="From Date"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                disabled={loading}
              />

              <TextField
                label="To Date"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                disabled={loading}
              />

              <Select
                label="Sort By"
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                disabled={loading}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="type">Type</option>
              </Select>

              <Select
                label="Order"
                value={filters.sortOrder}
                onChange={(value) => handleFilterChange('sortOrder', value)}
                disabled={loading}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Transaction List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-neutral-600 dark:text-neutral-400">Loading transactions...</div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-neutral-600 dark:text-neutral-400">
                {transactions.length === 0 ? 'No transactions found' : 'No transactions match your filters'}
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="border-neutral-200 dark:border-neutral-700">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getTransactionColor(transaction.type)}>
                              {transaction.type}
                            </Badge>
                            {transaction.ticker && (
                              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                {transaction.ticker}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={cn(
                          'font-semibold text-lg',
                          transaction.type === 'SELL' ? 'text-error-600 dark:text-error-400' :
                          transaction.type === 'DIVIDEND' ? 'text-success-600 dark:text-success-400' :
                          'text-neutral-900 dark:text-neutral-100'
                        )}>
                          {transaction.type === 'SELL' ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        
                        {(transaction.shares && transaction.price) && (
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {transaction.shares.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} @ ${transaction.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {transaction.notes && (
                      <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded p-2">
                        {transaction.notes}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={fetchTransactions}
            disabled={loading}
            loading={loading}
            leftIcon={<History className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  )
}