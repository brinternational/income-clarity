'use client'

import React, { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '../forms'

interface Portfolio {
  id: string
  name: string
  type: string
  institution?: string
  isPrimary: boolean
  holdings: any[]
  metrics: {
    totalValue: number
    holdingsCount: number
  }
}

interface PortfolioDeleteModalProps {
  portfolio: Portfolio | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (portfolioId: string) => Promise<void>
}

export function PortfolioDeleteModal({ 
  portfolio, 
  isOpen, 
  onClose, 
  onConfirm 
}: PortfolioDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  if (!isOpen || !portfolio) return null

  const hasHoldings = portfolio.metrics.holdingsCount > 0
  const hasValue = portfolio.metrics.totalValue > 0

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      setError(null)
      
      await onConfirm(portfolio.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setError(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Delete Portfolio
              </h3>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Portfolio Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{portfolio.name}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{portfolio.type}</span>
                </div>
                {portfolio.institution && (
                  <div className="flex justify-between">
                    <span>Institution:</span>
                    <span>{portfolio.institution}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Holdings:</span>
                  <span>{portfolio.metrics.holdingsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Value:</span>
                  <span>${portfolio.metrics.totalValue.toLocaleString()}</span>
                </div>
                {portfolio.isPrimary && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Primary Portfolio:</span>
                    <span>Yes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings */}
            {hasHoldings && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      Portfolio has holdings
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      This portfolio contains {portfolio.metrics.holdingsCount} holdings 
                      {hasValue && ` worth $${portfolio.metrics.totalValue.toLocaleString()}`}. 
                      All holdings will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {portfolio.isPrimary && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Primary Portfolio
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This is your primary portfolio. Deleting it will remove it from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p>
                Are you sure you want to delete <strong>"{portfolio.name}"</strong>? 
                This will permanently remove the portfolio and all its holdings from your account.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      Deletion Failed
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Portfolio'}
          </Button>
        </div>
      </div>
    </div>
  )
}