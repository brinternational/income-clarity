'use client'

import React, { useState, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  MoreVertical, 
  Edit, 
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Search
} from 'lucide-react'
import { Button } from '../forms'

interface HoldingMetrics {
  currentValue: number
  gainLoss: number
  returnPercentage: number
  annualDividendIncome: number
  monthlyDividendIncome: number
}

interface Holding {
  id: string
  portfolioId: string
  ticker: string
  shares: number
  costBasis: number
  purchaseDate: string
  currentPrice?: number
  dividendYield?: number
  sector?: string
  createdAt: string
  updatedAt: string
  metrics: HoldingMetrics
}

type SortField = 'ticker' | 'shares' | 'costBasis' | 'currentValue' | 'gainLoss' | 'return' | 'dividend'
type SortDirection = 'asc' | 'desc'

interface HoldingsTableProps {
  portfolioId: string
  holdings: Holding[]
  loading?: boolean
  onAddHolding?: () => void
  onEditHolding?: (holding: Holding) => void
  onDeleteHolding?: (holdingId: string) => void
  onRefresh?: () => void
}

export function HoldingsTable({
  portfolioId,
  holdings,
  loading = false,
  onAddHolding,
  onEditHolding,
  onDeleteHolding,
  onRefresh
}: HoldingsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('currentValue')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedHoldings, setSelectedHoldings] = useState<Set<string>>(new Set())

  // Filter and sort holdings
  const filteredAndSortedHoldings = useMemo(() => {
    let filtered = holdings

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(holding => 
        holding.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        holding.sector?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case 'ticker':
          return sortDirection === 'asc' 
            ? a.ticker.localeCompare(b.ticker)
            : b.ticker.localeCompare(a.ticker)
        case 'shares':
          aValue = a.shares
          bValue = b.shares
          break
        case 'costBasis':
          aValue = a.costBasis
          bValue = b.costBasis
          break
        case 'currentValue':
          aValue = a.metrics.currentValue
          bValue = b.metrics.currentValue
          break
        case 'gainLoss':
          aValue = a.metrics.gainLoss
          bValue = b.metrics.gainLoss
          break
        case 'return':
          aValue = a.metrics.returnPercentage
          bValue = b.metrics.returnPercentage
          break
        case 'dividend':
          aValue = a.metrics.annualDividendIncome
          bValue = b.metrics.annualDividendIncome
          break
        default:
          aValue = a.metrics.currentValue
          bValue = b.metrics.currentValue
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })
  }, [holdings, searchQuery, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleSelectHolding = (holdingId: string) => {
    setSelectedHoldings(prev => {
      const newSet = new Set(prev)
      if (newSet.has(holdingId)) {
        newSet.delete(holdingId)
      } else {
        newSet.add(holdingId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedHoldings.size === filteredAndSortedHoldings.length) {
      setSelectedHoldings(new Set())
    } else {
      setSelectedHoldings(new Set(filteredAndSortedHoldings.map(h => h.id)))
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1" />
      : <ChevronDown className="w-4 h-4 ml-1" />
  }

  // Calculate totals
  const totals = useMemo(() => {
    return filteredAndSortedHoldings.reduce((acc, holding) => ({
      costBasis: acc.costBasis + holding.costBasis,
      currentValue: acc.currentValue + holding.metrics.currentValue,
      gainLoss: acc.gainLoss + holding.metrics.gainLoss,
      annualDividend: acc.annualDividend + holding.metrics.annualDividendIncome
    }), {
      costBasis: 0,
      currentValue: 0,
      gainLoss: 0,
      annualDividend: 0
    })
  }, [filteredAndSortedHoldings])

  const totalReturn = totals.costBasis > 0 ? (totals.gainLoss / totals.costBasis) * 100 : 0

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Holdings</h3>
            <p className="text-sm text-gray-600">
              {holdings.length} holdings • ${totals.currentValue.toLocaleString()} total value
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search holdings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            {onAddHolding && (
              <Button onClick={onAddHolding} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Holding
              </Button>
            )}
          </div>
        </div>
      </div>

      {filteredAndSortedHoldings.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {holdings.length === 0 ? 'No holdings yet' : 'No holdings found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {holdings.length === 0 
              ? 'Add your first holding to start tracking your portfolio performance'
              : 'Try adjusting your search criteria'
            }
          </p>
          {holdings.length === 0 && onAddHolding && (
            <Button onClick={onAddHolding}>
              Add Your First Holding
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedHoldings.size === filteredAndSortedHoldings.length && filteredAndSortedHoldings.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ticker')}
                  >
                    <div className="flex items-center">
                      Ticker {getSortIcon('ticker')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('shares')}
                  >
                    <div className="flex items-center">
                      Shares {getSortIcon('shares')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('costBasis')}
                  >
                    <div className="flex items-center">
                      Cost Basis {getSortIcon('costBasis')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('currentValue')}
                  >
                    <div className="flex items-center">
                      Current Value {getSortIcon('currentValue')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('gainLoss')}
                  >
                    <div className="flex items-center">
                      Gain/Loss {getSortIcon('gainLoss')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('dividend')}
                  >
                    <div className="flex items-center">
                      Annual Dividend {getSortIcon('dividend')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedHoldings.map((holding) => (
                  <HoldingRow
                    key={holding.id}
                    holding={holding}
                    selected={selectedHoldings.has(holding.id)}
                    onSelect={() => handleSelectHolding(holding.id)}
                    onEdit={() => onEditHolding?.(holding)}
                    onDelete={() => onDeleteHolding?.(holding.id)}
                  />
                ))}
              </tbody>
              {/* Totals Row */}
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr className="font-semibold">
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${totals.costBasis.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${totals.currentValue.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 text-sm ${totals.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totals.gainLoss >= 0 ? '+' : '-'}${Math.abs(totals.gainLoss).toLocaleString()} 
                    ({totalReturn.toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${totals.annualDividend.toFixed(2)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// HoldingRow Component
interface HoldingRowProps {
  holding: Holding
  selected: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function HoldingRow({ holding, selected, onSelect, onEdit, onDelete }: HoldingRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const { metrics } = holding
  const isGain = metrics.gainLoss >= 0
  const costPerShare = holding.shares > 0 ? holding.costBasis / holding.shares : 0

  return (
    <tr className={`hover:bg-gray-50 ${selected ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{holding.ticker}</div>
          {holding.sector && (
            <div className="text-xs text-gray-500">{holding.sector}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {holding.shares.toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">${holding.costBasis.toLocaleString()}</div>
        <div className="text-xs text-gray-500">${costPerShare.toFixed(2)}/share</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">${metrics.currentValue.toLocaleString()}</div>
        {holding.currentPrice && (
          <div className="text-xs text-gray-500">${holding.currentPrice.toFixed(2)}/share</div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className={`text-sm font-medium ${isGain ? 'text-green-600' : 'text-red-600'}`}>
          <div className="flex items-center">
            {isGain ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isGain ? '+' : '-'}${Math.abs(metrics.gainLoss).toLocaleString()}
          </div>
        </div>
        <div className={`text-xs ${isGain ? 'text-green-600' : 'text-red-600'}`}>
          {metrics.returnPercentage.toFixed(1)}%
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">${metrics.annualDividendIncome.toFixed(2)}</div>
        {holding.dividendYield && (
          <div className="text-xs text-gray-500">
            {(holding.dividendYield * 100).toFixed(2)}% yield
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Holding</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete()
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Holding</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}