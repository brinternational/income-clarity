'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/forms/Button'
import { ArrowUpDown, Filter, Download, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface Transaction {
  id: string
  portfolioId?: string
  ticker: string
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'SPLIT' | 'MERGER'
  shares?: number
  amount: number
  date: string
  notes?: string
  createdAt: string
}

interface TransactionSummary {
  totalTransactions: number
  totalInvested: number
  totalDividends: number
  totalProceeds: number
  netCashFlow: number
}

interface TransactionListProps {
  portfolioId?: string
  onAddTransaction?: () => void
  filters?: {
    ticker?: string
    type?: string
    portfolioId?: string
  }
}

type SortField = 'date' | 'ticker' | 'type' | 'amount'
type SortDirection = 'asc' | 'desc'

const typeColors = {
  BUY: 'text-green-700 bg-green-100',
  SELL: 'text-red-700 bg-red-100',
  DIVIDEND: 'text-blue-700 bg-blue-100',
  INTEREST: 'text-purple-700 bg-purple-100',
  SPLIT: 'text-yellow-700 bg-yellow-100',
  MERGER: 'text-gray-700 bg-gray-100'
}

export function TransactionList({ portfolioId, onAddTransaction, filters }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Refs for accessibility
  const tableRef = useRef<HTMLTableElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const announcementRef = useRef<HTMLDivElement>(null)

  const ITEMS_PER_PAGE = 50

  const fetchTransactions = async (page = 1, reset = false) => {
    try {
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: ((page - 1) * ITEMS_PER_PAGE).toString()
      })

      if (portfolioId) {
        params.set('portfolioId', portfolioId)
      }
      if (filters?.ticker) {
        params.set('ticker', filters.ticker)
      }
      if (filters?.type) {
        params.set('type', filters.type)
      }
      if (filters?.portfolioId) {
        params.set('portfolioId', filters.portfolioId)
      }

      const response = await fetch(`/api/transactions?${params}`)
      const result = await response.json()

      if (result.success) {
        const newTransactions = result.data || []
        
        setTransactions(prev => 
          reset ? newTransactions : [...prev, ...newTransactions]
        )
        setSummary(result.summary)
        setHasMore(result.pagination?.hasMore || false)
        
        // Announce to screen readers
        if (announcementRef.current) {
          const count = reset ? newTransactions.length : newTransactions.length
          announcementRef.current.textContent = `Loaded ${count} transactions. ${result.pagination?.totalCount || 0} total transactions found.`
        }
      } else {
        toast.error('Failed to load transactions')
        if (announcementRef.current) {
          announcementRef.current.textContent = 'Failed to load transactions. Please try again.'
        }
      }
    } catch (error) {
      logger.error('Error fetching transactions:', error)
      toast.error('Error loading transactions')
      if (announcementRef.current) {
        announcementRef.current.textContent = 'Error loading transactions. Please check your connection and try again.'
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    setCurrentPage(1)
    fetchTransactions(1, true)
  }, [portfolioId, filters])

  // Filter transactions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransactions(transactions)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = transactions.filter(transaction => 
        transaction.ticker.toLowerCase().includes(query) ||
        transaction.type.toLowerCase().includes(query) ||
        transaction.notes?.toLowerCase().includes(query) ||
        transaction.amount.toString().includes(query)
      )
      setFilteredTransactions(filtered)
      
      // Announce search results
      if (announcementRef.current) {
        announcementRef.current.textContent = `Search found ${filtered.length} transactions matching "${searchQuery}"`
      }
    }
  }, [transactions, searchQuery])

  // Debounced search handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  // Keyboard navigation for table
  const handleTableKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!tableRef.current) return

    const focusableElements = tableRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (currentIndex < focusableElements.length - 1) {
          (focusableElements[currentIndex + 1] as HTMLElement).focus()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (currentIndex > 0) {
          (focusableElements[currentIndex - 1] as HTMLElement).focus()
        }
        break
      case 'Home':
        e.preventDefault()
        if (focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus()
        }
        break
      case 'End':
        e.preventDefault()
        if (focusableElements.length > 0) {
          (focusableElements[focusableElements.length - 1] as HTMLElement).focus()
        }
        break
    }
  }, [])

  // Virtualization calculation
  const displayTransactions = useMemo(() => {
    return filteredTransactions.slice(0, currentPage * ITEMS_PER_PAGE)
  }, [filteredTransactions, currentPage])

  const handleSort = (field: SortField) => {
    const newDirection = field === sortField && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortField(field)
    setSortDirection(newDirection)

    const sorted = [...filteredTransactions].sort((a, b) => {
      let aVal: any = a[field]
      let bVal: any = b[field]

      // Convert to comparable values
      if (field === 'date') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      } else if (field === 'amount') {
        aVal = Number(aVal)
        bVal = Number(bVal)
      }

      if (newDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    setFilteredTransactions(sorted)
    
    // Announce sort change to screen readers
    if (announcementRef.current) {
      announcementRef.current.textContent = `Sorted by ${field} in ${newDirection}ending order. ${sorted.length} transactions displayed.`
    }
  }

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchTransactions(nextPage, false)
  }

  const exportToCSV = () => {
    const dataToExport = searchQuery ? filteredTransactions : transactions
    
    if (dataToExport.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const headers = ['Date', 'Ticker', 'Type', 'Shares', 'Amount', 'Notes']
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(t => [
        t.date,
        t.ticker,
        t.type,
        t.shares || '',
        t.amount,
        t.notes ? `"${t.notes.replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast.success(`${dataToExport.length} transactions exported to CSV`)
    
    // Announce to screen readers
    if (announcementRef.current) {
      announcementRef.current.textContent = `Exported ${dataToExport.length} transactions to CSV file`
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Header with Actions and Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            <p className="text-sm text-gray-600" id="transaction-count">
              {searchQuery 
                ? `${filteredTransactions.length} of ${summary?.totalTransactions || 0} transactions`
                : `${summary?.totalTransactions || 0} transactions`
              }
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
              className="flex items-center gap-2"
              aria-describedby="transaction-count"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            
            {onAddTransaction && (
              <Button
                onClick={onAddTransaction}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Search transactions by ticker, type, notes, or amount"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <Plus className="h-4 w-4 rotate-45" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600">Total Invested</p>
            <p className="text-xl font-bold text-green-700">
              {formatCurrency(summary.totalInvested)}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600">Dividends Received</p>
            <p className="text-xl font-bold text-blue-700">
              {formatCurrency(summary.totalDividends)}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600">Proceeds from Sales</p>
            <p className="text-xl font-bold text-purple-700">
              {formatCurrency(summary.totalProceeds)}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${
            summary.netCashFlow >= 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm ${
              summary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              Net Cash Flow
            </p>
            <p className={`text-xl font-bold ${
              summary.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {summary.netCashFlow >= 0 ? '+' : '-'}{formatCurrency(summary.netCashFlow)}
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {searchQuery ? `No transactions match "${searchQuery}"` : 'No transactions found'}
            </p>
            {!searchQuery && onAddTransaction && (
              <Button
                onClick={onAddTransaction}
                className="mt-4"
                variant="outline"
              >
                Add Your First Transaction
              </Button>
            )}
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                className="mt-4"
                variant="outline"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table 
                ref={tableRef}
                className="w-full"
                role="table"
                aria-label="Transaction history table"
                onKeyDown={handleTableKeyDown}
              >
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                      role="columnheader"
                      aria-sort={sortField === 'date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('ticker')}
                    >
                      <div className="flex items-center gap-1">
                        Ticker
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        Type
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shares
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.ticker}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[transaction.type]}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.shares ? transaction.shares.toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {transaction.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {displayTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.ticker}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[transaction.type]}`}>
                      {transaction.type}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      {transaction.shares && (
                        <p className="text-sm text-gray-600">
                          {transaction.shares.toLocaleString()} shares
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  {transaction.notes && (
                    <p className="text-sm text-gray-600">{transaction.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Load More Button */}
      {(hasMore || displayTransactions.length < filteredTransactions.length) && (
        <div className="text-center space-y-2">
          {displayTransactions.length < filteredTransactions.length && (
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="w-full sm:w-auto"
              aria-describedby="transaction-count"
            >
              Show More Results ({filteredTransactions.length - displayTransactions.length} remaining)
            </Button>
          )}
          {hasMore && !searchQuery && (
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="w-full sm:w-auto ml-2"
            >
              Load More Transactions
            </Button>
          )}
        </div>
      )}
    </div>
  )
}