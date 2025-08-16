'use client'

import React, { useState } from 'react'
import { X, Edit, Trash2, DollarSign, Percent, AlertTriangle } from 'lucide-react'
import { Button } from '../forms'

interface Holding {
  id: string
  ticker: string
  shares: number
  costBasis: number
  currentPrice?: number
  dividendYield?: number
  sector?: string
}

interface BulkEditModalProps {
  isOpen: boolean
  selectedHoldings: Holding[]
  onClose: () => void
  onUpdatePrices?: (updates: { id: string; currentPrice: number }[]) => Promise<void>
  onUpdateYields?: (updates: { id: string; dividendYield: number }[]) => Promise<void>
  onDeleteMultiple?: (holdingIds: string[]) => Promise<void>
}

type BulkAction = 'update-prices' | 'update-yields' | 'delete'

export function BulkEditModal({
  isOpen,
  selectedHoldings,
  onClose,
  onUpdatePrices,
  onUpdateYields,
  onDeleteMultiple
}: BulkEditModalProps) {
  const [action, setAction] = useState<BulkAction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Price updates state
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({})
  
  // Yield updates state
  const [yieldUpdates, setYieldUpdates] = useState<Record<string, number>>({})

  if (!isOpen) return null

  const handleClose = () => {
    if (!loading) {
      setAction(null)
      setError(null)
      setPriceUpdates({})
      setYieldUpdates({})
      onClose()
    }
  }

  const handleUpdatePrices = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const updates = Object.entries(priceUpdates)
        .filter(([_, price]) => price > 0)
        .map(([id, price]) => ({ id, currentPrice: price }))
      
      if (updates.length === 0) {
        setError('Please enter at least one valid price update')
        return
      }
      
      await onUpdatePrices?.(updates)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prices')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateYields = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const updates = Object.entries(yieldUpdates)
        .filter(([_, yield_]) => yield_ >= 0 && yield_ <= 1)
        .map(([id, dividendYield]) => ({ id, dividendYield }))
      
      if (updates.length === 0) {
        setError('Please enter at least one valid yield update (0-1)')
        return
      }
      
      await onUpdateYields?.(updates)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update yields')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMultiple = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedHoldings.length} holdings? This action cannot be undone.`)) {
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const holdingIds = selectedHoldings.map(h => h.id)
      await onDeleteMultiple?.(holdingIds)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete holdings')
    } finally {
      setLoading(false)
    }
  }

  const totalValue = selectedHoldings.reduce((sum, holding) => {
    const price = priceUpdates[holding.id] || holding.currentPrice || 0
    return sum + (holding.shares * price)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Bulk Edit Holdings
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedHoldings.length} holdings selected
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!action ? (
            /* Action Selection */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {onUpdatePrices && (
                  <button
                    onClick={() => setAction('update-prices')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center mb-3">
                      <DollarSign className="w-6 h-6 text-blue-600 mr-3" />
                      <h4 className="font-medium text-gray-900">Update Prices</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Update current market prices for selected holdings
                    </p>
                  </button>
                )}

                {onUpdateYields && (
                  <button
                    onClick={() => setAction('update-yields')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="flex items-center mb-3">
                      <Percent className="w-6 h-6 text-green-600 mr-3" />
                      <h4 className="font-medium text-gray-900">Update Yields</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Update dividend yields for selected holdings
                    </p>
                  </button>
                )}

                {onDeleteMultiple && (
                  <button
                    onClick={() => setAction('delete')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all text-left"
                  >
                    <div className="flex items-center mb-3">
                      <Trash2 className="w-6 h-6 text-red-600 mr-3" />
                      <h4 className="font-medium text-gray-900">Delete Holdings</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Permanently delete selected holdings
                    </p>
                  </button>
                )}
              </div>

              {/* Selected Holdings Summary */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-4">Selected Holdings</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedHoldings.slice(0, 8).map((holding) => (
                      <div key={holding.id} className="text-sm">
                        <div className="font-medium text-gray-900">{holding.ticker}</div>
                        <div className="text-gray-600">{holding.shares} shares</div>
                      </div>
                    ))}
                    {selectedHoldings.length > 8 && (
                      <div className="text-sm text-gray-500">
                        +{selectedHoldings.length - 8} more...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : action === 'update-prices' ? (
            /* Price Updates */
            <div className="p-6">
              <div className="mb-6">
                <button
                  onClick={() => setAction(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to actions
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Update Current Prices</h4>
                  <div className="text-sm text-gray-600">
                    Total Value: ${totalValue.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {selectedHoldings.map((holding) => (
                    <div key={holding.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{holding.ticker}</div>
                          <div className="text-sm text-gray-600">
                            {holding.shares} shares
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Current: ${holding.currentPrice?.toFixed(2) || 'N/A'}
                        </div>
                      </div>
                      <input
                        type="number"
                        placeholder="New price"
                        value={priceUpdates[holding.id] || ''}
                        onChange={(e) => setPriceUpdates(prev => ({
                          ...prev,
                          [holding.id]: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : action === 'update-yields' ? (
            /* Yield Updates */
            <div className="p-6">
              <div className="mb-6">
                <button
                  onClick={() => setAction(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to actions
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Update Dividend Yields</h4>
                <p className="text-sm text-gray-600">
                  Enter yield as decimal (e.g., 0.025 for 2.5%)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {selectedHoldings.map((holding) => (
                    <div key={holding.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{holding.ticker}</div>
                          <div className="text-sm text-gray-600">
                            {holding.shares} shares
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Current: {holding.dividendYield ? `${(holding.dividendYield * 100).toFixed(2)}%` : 'N/A'}
                        </div>
                      </div>
                      <input
                        type="number"
                        placeholder="New yield (0-1)"
                        value={yieldUpdates[holding.id] || ''}
                        onChange={(e) => setYieldUpdates(prev => ({
                          ...prev,
                          [holding.id]: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="1"
                        step="0.001"
                      />
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : action === 'delete' ? (
            /* Delete Confirmation */
            <div className="p-6">
              <div className="mb-6">
                <button
                  onClick={() => setAction(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to actions
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800">Delete Holdings</h4>
                      <p className="text-sm text-red-700 mt-1">
                        You are about to permanently delete {selectedHoldings.length} holdings. 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Holdings to Delete:</h5>
                  <div className="space-y-2">
                    {selectedHoldings.map((holding) => (
                      <div key={holding.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{holding.ticker}</span>
                        <span className="text-gray-600">
                          {holding.shares} shares • ${holding.costBasis.toLocaleString()} cost basis
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {action && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setAction(null)}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              onClick={
                action === 'update-prices' ? handleUpdatePrices :
                action === 'update-yields' ? handleUpdateYields :
                action === 'delete' ? handleDeleteMultiple :
                undefined
              }
              loading={loading}
              className={
                action === 'delete' 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : undefined
              }
            >
              {loading ? 'Processing...' : 
               action === 'update-prices' ? 'Update Prices' :
               action === 'update-yields' ? 'Update Yields' :
               action === 'delete' ? 'Delete Holdings' : 'Confirm'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}