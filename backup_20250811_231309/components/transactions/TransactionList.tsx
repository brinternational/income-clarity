'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/forms/Button'
import { ArrowUpDown, Filter, Download, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

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
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

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
      } else {
        toast.error('Failed to load transactions')
      }
    } catch (error) {
      // Error handled by emergency recovery script finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    setCurrentPage(1)
    fetchTransactions(1, true)
  }, [portfolioId, filters])

  const handleSort = (field: SortField) => {
    const newDirection = field === sortField && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortField(field)
    setSortDirection(newDirection)

    const sorted = [...transactions].sort((a, b) => {
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

    setTransactions(sorted)
  }

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchTransactions(nextPage, false)
  }

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const headers = ['Date', 'Ticker', 'Type', 'Shares', 'Amount', 'Notes']
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
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

    toast.success('Transactions exported to CSV')
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
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <p className="text-sm text-gray-600">
            {summary?.totalTransactions || 0} transactions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="flex items-center gap-2"
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
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No transactions found</p>
            {onAddTransaction && (
              <Button
                onClick={onAddTransaction}
                className="mt-4"
                variant="outline"
              >
                Add Your First Transaction
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
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
                  {transactions.map((transaction) => (
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
              {transactions.map((transaction) => (
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
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="w-full sm:w-auto"
          >
            Load More Transactions
          </Button>
        </div>
      )}
    </div>
  )
}