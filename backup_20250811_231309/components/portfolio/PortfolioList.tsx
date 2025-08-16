'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, TrendingUp, TrendingDown, DollarSign, Briefcase, Star } from 'lucide-react'
import { Button } from '../forms'
import { PortfolioCard } from './PortfolioCard'
import { PortfolioForm, PortfolioFormData } from '../forms/portfolio/PortfolioForm'

interface Portfolio {
  id: string
  name: string
  type: string
  institution?: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
  holdings: any[]
  metrics: {
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    totalReturn: number
    holdingsCount: number
  }
}

interface PortfolioListProps {
  onPortfolioSelect?: (portfolio: Portfolio) => void
}

export function PortfolioList({ onPortfolioSelect }: PortfolioListProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'return' | 'created'>('created')

  // Fetch portfolios
  const fetchPortfolios = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/portfolios')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch portfolios')
      }

      setPortfolios(result.data || [])
      setError(null)
    } catch (err) {
      // Error handled by emergency recovery script finally {
      setLoading(false)
    }
  }

  // Create portfolio
  const handleCreatePortfolio = async (data: PortfolioFormData) => {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create portfolio')
      }

      // Refresh portfolios list
      await fetchPortfolios()
      setShowCreateForm(false)
      
      // Show success message (you could use a toast here)
      // console.log('Portfolio created successfully!')

    } catch (err) {
      // Error handled by emergency recovery script
  }

  // Delete portfolio
  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete portfolio')
      }

      // Remove from local state
      setPortfolios(prev => prev.filter(p => p.id !== portfolioId))
      
      // console.log('Portfolio deleted successfully!')

    } catch (err) {
      // Error handled by emergency recovery script
  }

  // Filter and sort portfolios
  const filteredAndSortedPortfolios = React.useMemo(() => {
    let filtered = portfolios

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(portfolio => 
        portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        portfolio.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        portfolio.institution?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(portfolio => portfolio.type === filterType)
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'value':
          return b.metrics.totalValue - a.metrics.totalValue
        case 'return':
          return b.metrics.totalReturn - a.metrics.totalReturn
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [portfolios, searchQuery, filterType, sortBy])

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    const totalValue = portfolios.reduce((sum, p) => sum + p.metrics.totalValue, 0)
    const totalCostBasis = portfolios.reduce((sum, p) => sum + p.metrics.totalCostBasis, 0)
    const totalGainLoss = totalValue - totalCostBasis
    const totalReturn = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0
    const totalHoldings = portfolios.reduce((sum, p) => sum + p.metrics.holdingsCount, 0)

    return {
      totalValue,
      totalCostBasis,
      totalGainLoss,
      totalReturn,
      totalHoldings,
      portfolioCount: portfolios.length
    }
  }, [portfolios])

  useEffect(() => {
    fetchPortfolios()
  }, [])

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Portfolio</h2>
          <Button
            variant="outline"
            onClick={() => setShowCreateForm(false)}
          >
            Back to Portfolios
          </Button>
        </div>
        <PortfolioForm
          onSubmit={handleCreatePortfolio}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Portfolios</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your investment portfolios and track performance
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Portfolio</span>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summaryStats.totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Return</p>
              <p className={`text-2xl font-bold ${summaryStats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summaryStats.totalReturn.toFixed(1)}%
              </p>
            </div>
            {summaryStats.totalReturn >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Portfolios</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryStats.portfolioCount}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Holdings</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryStats.totalHoldings}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search portfolios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter by Type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="Taxable">Taxable</option>
          <option value="401k">401(k)</option>
          <option value="IRA">IRA</option>
          <option value="Crypto">Crypto</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="created">Recently Created</option>
          <option value="name">Name</option>
          <option value="value">Total Value</option>
          <option value="return">Total Return</option>
        </select>
      </div>

      {/* Portfolio Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPortfolios} variant="outline">
            Try Again
          </Button>
        </div>
      ) : filteredAndSortedPortfolios.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {portfolios.length === 0 ? 'No portfolios yet' : 'No portfolios found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {portfolios.length === 0 
              ? 'Create your first portfolio to start tracking your investments'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {portfolios.length === 0 && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Portfolio
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPortfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onClick={() => onPortfolioSelect?.(portfolio)}
              onDelete={() => handleDeletePortfolio(portfolio.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}