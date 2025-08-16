'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/forms/Input'
import { Select } from '@/components/forms/Select'
import { Button } from '@/components/forms/Button'
import { Filter, X, Calendar, Search, Building2 } from 'lucide-react'

interface Portfolio {
  id: string
  name: string
}

interface TransactionFiltersProps {
  portfolios?: Portfolio[]
  onFiltersChange: (filters: FilterValues) => void
  className?: string
}

interface FilterValues {
  portfolioId?: string
  ticker?: string
  type?: string
  dateFrom?: string
  dateTo?: string
}

const transactionTypes = [
  { value: '', label: 'All Types' },
  { value: 'BUY', label: 'Buy' },
  { value: 'SELL', label: 'Sell' },
  { value: 'DIVIDEND', label: 'Dividend' },
  { value: 'INTEREST', label: 'Interest' },
  { value: 'SPLIT', label: 'Stock Split' },
  { value: 'MERGER', label: 'Merger' }
]

export function TransactionFilters({ 
  portfolios = [], 
  onFiltersChange, 
  className = '' 
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({
    portfolioId: '',
    ticker: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  })
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  // Update parent when filters change
  useEffect(() => {
    // Remove empty values before passing to parent
    const activeFilters: FilterValues = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        activeFilters[key as keyof FilterValues] = value
      }
    })
    
    onFiltersChange(activeFilters)
    setHasActiveFilters(Object.keys(activeFilters).length > 0)
  }, [filters, onFiltersChange])

  const handleFilterChange = (field: keyof FilterValues, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      portfolioId: '',
      ticker: '',
      type: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  const clearFilter = (field: keyof FilterValues) => {
    setFilters(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // Get predefined date ranges
  const setDateRange = (range: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date()
    const startDate = new Date(today)
    
    switch (range) {
      case 'today':
        // Keep startDate as today
        break
      case 'week':
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(today.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1)
        break
    }

    setFilters(prev => ({
      ...prev,
      dateFrom: startDate.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    }))
  }

  const portfolioOptions = [
    { value: '', label: 'All Portfolios' },
    ...portfolios.map(p => ({ value: p.id, label: p.name }))
  ]

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {Object.values(filters).filter(v => v && v.trim() !== '').length}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 md:hidden"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`p-4 space-y-4 ${!isExpanded ? 'hidden md:block' : ''}`}>
        {/* Row 1: Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Portfolio Filter */}
          {portfolios.length > 0 && (
            <div>
              <Select
                label="Portfolio"
                value={filters.portfolioId || ''}
                onChange={(value) => handleFilterChange('portfolioId', value)}
                options={portfolioOptions}
                icon={Building2}
              />
              {filters.portfolioId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('portfolioId')}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* Ticker Filter */}
          <div>
            <Input
              label="Ticker Symbol"
              value={filters.ticker || ''}
              onChange={(value) => handleFilterChange('ticker', value)}
              placeholder="e.g. AAPL, MSFT"
              icon={Search}
              style={{ textTransform: 'uppercase' }}
            />
            {filters.ticker && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('ticker')}
                className="mt-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Type Filter */}
          <div>
            <Select
              label="Transaction Type"
              value={filters.type || ''}
              onChange={(value) => handleFilterChange('type', value)}
              options={transactionTypes}
            />
            {filters.type && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('type')}
                className="mt-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Date Range Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range</span>
          </div>
          
          {/* Quick Date Range Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange('today')}
              className="text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange('week')}
              className="text-xs"
            >
              Last Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange('month')}
              className="text-xs"
            >
              Last Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange('quarter')}
              className="text-xs"
            >
              Last Quarter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange('year')}
              className="text-xs"
            >
              Last Year
            </Button>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="From Date"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(value) => handleFilterChange('dateFrom', value)}
              />
              {filters.dateFrom && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('dateFrom')}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            <div>
              <Input
                label="To Date"
                type="date"
                value={filters.dateTo || ''}
                onChange={(value) => handleFilterChange('dateTo', value)}
                min={filters.dateFrom || undefined}
              />
              {filters.dateTo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('dateTo')}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.portfolioId && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Portfolio: {portfolios.find(p => p.id === filters.portfolioId)?.name || filters.portfolioId}
                  <button onClick={() => clearFilter('portfolioId')} className="ml-1 hover:text-blue-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.ticker && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Ticker: {filters.ticker.toUpperCase()}
                  <button onClick={() => clearFilter('ticker')} className="ml-1 hover:text-blue-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Type: {filters.type}
                  <button onClick={() => clearFilter('type')} className="ml-1 hover:text-blue-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                  <button 
                    onClick={() => {
                      clearFilter('dateFrom')
                      clearFilter('dateTo')
                    }} 
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}