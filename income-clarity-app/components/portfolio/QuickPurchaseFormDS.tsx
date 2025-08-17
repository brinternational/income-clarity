/**
 * Manual Portfolio Entry - Quick Purchase Form
 * MANUAL-003: Quick add for recording new purchases
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/design-system/core/Button'
import { TextField, CurrencyField } from '@/components/design-system/forms/TextField'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/design-system/feedback/Modal'
import { Card } from '@/components/design-system/core/Card'
import { Alert } from '@/components/design-system/core/Alert'
import { Plus, Calculator, TrendingUp, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface QuickPurchaseFormProps {
  open: boolean
  onClose: () => void
  holding: {
    id: string
    ticker: string
    shares: number
    costBasis: number
    currentPrice?: number
  }
  onSuccess?: (updatedHolding: any) => void
}

interface FormData {
  additionalShares: string
  purchasePrice: string
  purchaseDate: string
  notes: string
}

export function QuickPurchaseFormDS({ 
  open, 
  onClose, 
  holding,
  onSuccess 
}: QuickPurchaseFormProps) {
  const [formData, setFormData] = useState<FormData>({
    additionalShares: '',
    purchasePrice: holding.currentPrice?.toString() || holding.costBasis.toString(),
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        additionalShares: '',
        purchasePrice: holding.currentPrice?.toString() || holding.costBasis.toString(),
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setError('')
      setValidationErrors({})
    }
  }, [open, holding])

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field-specific error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // Clear general error
    if (error) setError('')
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.additionalShares) {
      errors.additionalShares = 'Number of shares is required'
    } else if (isNaN(parseFloat(formData.additionalShares)) || parseFloat(formData.additionalShares) <= 0) {
      errors.additionalShares = 'Shares must be a positive number'
    }

    if (!formData.purchasePrice) {
      errors.purchasePrice = 'Purchase price is required'
    } else if (isNaN(parseFloat(formData.purchasePrice)) || parseFloat(formData.purchasePrice) <= 0) {
      errors.purchasePrice = 'Purchase price must be a positive number'
    }

    if (!formData.purchaseDate) {
      errors.purchaseDate = 'Purchase date is required'
    } else {
      const purchaseDate = new Date(formData.purchaseDate)
      const today = new Date()
      if (purchaseDate > today) {
        errors.purchaseDate = 'Purchase date cannot be in the future'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const additionalShares = parseFloat(formData.additionalShares)
      const purchasePrice = parseFloat(formData.purchasePrice)
      
      // Calculate new weighted average cost basis
      const currentTotalCost = holding.shares * holding.costBasis
      const additionalCost = additionalShares * purchasePrice
      const newTotalShares = holding.shares + additionalShares
      const newCostBasis = (currentTotalCost + additionalCost) / newTotalShares

      const payload = {
        shares: newTotalShares,
        costBasis: newCostBasis,
        purchaseDate: formData.purchaseDate,
        ...(formData.notes.trim() && { notes: formData.notes.trim() })
      }

      logger.log(`🔄 Recording purchase for ${holding.ticker}:`, {
        additionalShares,
        purchasePrice,
        newTotalShares,
        newCostBasis
      })

      const response = await fetch(`/api/holdings/${holding.id}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shares: additionalShares,
          pricePerShare: purchasePrice,
          purchaseDate: formData.purchaseDate
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to record purchase')
      }

      const result = await response.json()
      logger.log(`✅ Purchase recorded successfully for ${holding.ticker}:`, result.holding)
      
      onSuccess?.(result.holding)
      onClose()
    } catch (err) {
      logger.error('❌ Error recording purchase:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while recording the purchase')
    } finally {
      setLoading(false)
    }
  }

  // Calculate new position summary
  const calculateNewPosition = () => {
    const additionalShares = parseFloat(formData.additionalShares) || 0
    const purchasePrice = parseFloat(formData.purchasePrice) || 0
    
    const currentTotalCost = holding.shares * holding.costBasis
    const additionalCost = additionalShares * purchasePrice
    const newTotalShares = holding.shares + additionalShares
    const newCostBasis = newTotalShares > 0 ? (currentTotalCost + additionalCost) / newTotalShares : 0
    
    return {
      newTotalShares,
      newCostBasis,
      additionalCost,
      newTotalCost: currentTotalCost + additionalCost
    }
  }

  const newPosition = calculateNewPosition()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Purchase"
      description={`Add shares to your ${holding.ticker} position`}
      size="md"
      closeOnBackdropClick={!loading}
      showCloseButton={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Current Position Summary */}
        <Card className="bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
          <div className="p-4">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Current {holding.ticker} Position
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Shares:</span>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {holding.shares.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                </div>
              </div>
              
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Avg Cost Basis:</span>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  ${holding.costBasis.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Purchase Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            Purchase Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Additional Shares"
              type="number"
              step="0.001"
              min="0"
              value={formData.additionalShares}
              onChange={(e) => handleFieldChange('additionalShares', e.target.value)}
              placeholder="0.000"
              errorMessage={validationErrors.additionalShares}
              required
              disabled={loading}
              inputMode="decimal"
              leftIcon={<Plus className="w-4 h-4" />}
            />

            <CurrencyField
              label="Purchase Price (per share)"
              value={formData.purchasePrice}
              onChange={(e) => handleFieldChange('purchasePrice', e.target.value)}
              placeholder="$0.00"
              errorMessage={validationErrors.purchasePrice}
              required
              disabled={loading}
            />
          </div>

          <TextField
            label="Purchase Date"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleFieldChange('purchaseDate', e.target.value)}
            errorMessage={validationErrors.purchaseDate}
            required
            disabled={loading}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <TextField
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Notes about this purchase..."
            disabled={loading}
            maxLength={200}
            helperText={`${formData.notes.length}/200 characters`}
          />
        </div>

        {/* New Position Summary */}
        {(formData.additionalShares && formData.purchasePrice) && (
          <Card className="bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800">
            <div className="p-4">
              <h3 className="text-sm font-medium text-brand-900 dark:text-brand-100 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                New Position Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-brand-700 dark:text-brand-300">Total Shares:</span>
                  <div className="font-semibold text-brand-900 dark:text-brand-100">
                    {newPosition.newTotalShares.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                  </div>
                  <div className="text-xs text-brand-600 dark:text-brand-400">
                    +{parseFloat(formData.additionalShares).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} shares
                  </div>
                </div>
                
                <div>
                  <span className="text-brand-700 dark:text-brand-300">New Avg Cost:</span>
                  <div className="font-semibold text-brand-900 dark:text-brand-100">
                    ${newPosition.newCostBasis.toFixed(2)}
                  </div>
                  <div className="text-xs text-brand-600 dark:text-brand-400">
                    {newPosition.newCostBasis > holding.costBasis ? 'Higher' : 'Lower'} than current
                  </div>
                </div>
                
                <div>
                  <span className="text-brand-700 dark:text-brand-300">Purchase Cost:</span>
                  <div className="font-semibold text-brand-900 dark:text-brand-100">
                    ${newPosition.additionalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-brand-600 dark:text-brand-400">
                    Total: ${newPosition.newTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            leftIcon={<Plus className="w-4 h-4" />}
            disabled={!formData.additionalShares || !formData.purchasePrice || !formData.purchaseDate}
          >
            Record Purchase
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}