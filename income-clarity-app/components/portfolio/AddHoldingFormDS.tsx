/**
 * Manual Portfolio Entry - Add Holding Form
 * Uses Design System components for consistent UI
 * MANUAL-002: Simple "Add Holding" form only (skip complex import)
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/design-system/core/Button'
import { TextField, CurrencyField } from '@/components/design-system/forms/TextField'
import { Select } from '@/components/design-system/forms/Select'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/design-system/feedback/Modal'
import { Card } from '@/components/design-system/core/Card'
import { Alert } from '@/components/design-system/core/Alert'
import { Plus, TrendingUp, DollarSign, Calendar, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface AddHoldingFormProps {
  open: boolean
  onClose: () => void
  portfolioId: string
  portfolioName: string
  onSuccess?: (holding: any) => void
}

interface FormData {
  ticker: string
  shares: string
  costBasis: string
  purchaseDate: string
  currentPrice: string
  dividendYield: string
  sector: string
  notes: string
}

const SECTORS = [
  'Technology',
  'Healthcare', 
  'Financial Services',
  'Consumer Cyclical',
  'Communication Services',
  'Industrials',
  'Consumer Defensive',
  'Energy',
  'Utilities',
  'Real Estate',
  'Materials',
  'Basic Materials',
  'Other'
]

export function AddHoldingFormDS({ 
  open, 
  onClose, 
  portfolioId, 
  portfolioName,
  onSuccess 
}: AddHoldingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    ticker: '',
    shares: '',
    costBasis: '',
    purchaseDate: new Date().toISOString().split('T')[0], // Default to today
    currentPrice: '',
    dividendYield: '',
    sector: '',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        ticker: '',
        shares: '',
        costBasis: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        currentPrice: '',
        dividendYield: '',
        sector: '',
        notes: ''
      })
      setError('')
      setValidationErrors({})
    }
  }, [open])

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

    // Required fields
    if (!formData.ticker.trim()) {
      errors.ticker = 'Stock ticker is required'
    } else if (!/^[A-Z]{1,5}$/.test(formData.ticker.trim().toUpperCase())) {
      errors.ticker = 'Ticker must be 1-5 letters (e.g., AAPL, MSFT)'
    }

    if (!formData.shares) {
      errors.shares = 'Number of shares is required'
    } else if (isNaN(parseFloat(formData.shares)) || parseFloat(formData.shares) <= 0) {
      errors.shares = 'Shares must be a positive number'
    }

    if (!formData.costBasis) {
      errors.costBasis = 'Purchase price is required'
    } else if (isNaN(parseFloat(formData.costBasis)) || parseFloat(formData.costBasis) <= 0) {
      errors.costBasis = 'Purchase price must be a positive number'
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

    // Optional field validation
    if (formData.currentPrice && (isNaN(parseFloat(formData.currentPrice)) || parseFloat(formData.currentPrice) <= 0)) {
      errors.currentPrice = 'Current price must be a positive number'
    }

    if (formData.dividendYield && (isNaN(parseFloat(formData.dividendYield)) || parseFloat(formData.dividendYield) < 0 || parseFloat(formData.dividendYield) > 100)) {
      errors.dividendYield = 'Dividend yield must be between 0 and 100'
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
      const payload = {
        ticker: formData.ticker.trim().toUpperCase(),
        shares: parseFloat(formData.shares),
        costBasis: parseFloat(formData.costBasis),
        purchaseDate: formData.purchaseDate,
        ...(formData.currentPrice && { currentPrice: parseFloat(formData.currentPrice) }),
        ...(formData.dividendYield && { dividendYield: parseFloat(formData.dividendYield) }),
        ...(formData.sector && { sector: formData.sector }),
        ...(formData.notes.trim() && { notes: formData.notes.trim() })
      }

      logger.log('📝 Adding new holding:', payload)

      const response = await fetch(`/api/portfolios/${portfolioId}/holdings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add holding')
      }

      const result = await response.json()
      logger.log('✅ Holding added successfully:', result.holding)
      
      onSuccess?.(result.holding)
      onClose()
    } catch (err) {
      logger.error('❌ Error adding holding:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while adding the holding')
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary values
  const calculateSummary = () => {
    const shares = parseFloat(formData.shares) || 0
    const costBasis = parseFloat(formData.costBasis) || 0
    const currentPrice = parseFloat(formData.currentPrice) || costBasis
    
    const totalCost = shares * costBasis
    const currentValue = shares * currentPrice
    const gainLoss = currentValue - totalCost
    const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

    return {
      totalCost,
      currentValue,
      gainLoss,
      gainLossPercent,
      hasCurrentPrice: !!formData.currentPrice
    }
  }

  const summary = calculateSummary()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Holding"
      description={`Add a new stock or fund to ${portfolioName}`}
      size="lg"
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

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Stock Ticker"
              value={formData.ticker}
              onChange={(e) => handleFieldChange('ticker', e.target.value.toUpperCase())}
              placeholder="e.g., AAPL, MSFT, VTI"
              errorMessage={validationErrors.ticker}
              required
              disabled={loading}
              leftIcon={<TrendingUp className="w-4 h-4" />}
              autoComplete="off"
            />

            <Select
              label="Sector (Optional)"
              value={formData.sector}
              onChange={(value) => handleFieldChange('sector', value)}
              placeholder="Select sector"
              disabled={loading}
              leftIcon={<PieChart className="w-4 h-4" />}
            >
              <option value="">Select Sector</option>
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Purchase Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            Purchase Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="Number of Shares"
              type="number"
              step="0.001"
              min="0"
              value={formData.shares}
              onChange={(e) => handleFieldChange('shares', e.target.value)}
              placeholder="0.000"
              errorMessage={validationErrors.shares}
              required
              disabled={loading}
              inputMode="decimal"
            />

            <CurrencyField
              label="Purchase Price (per share)"
              value={formData.costBasis}
              onChange={(e) => handleFieldChange('costBasis', e.target.value)}
              placeholder="$0.00"
              errorMessage={validationErrors.costBasis}
              required
              disabled={loading}
            />

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
          </div>
        </div>

        {/* Optional Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            Optional Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyField
              label="Current Price (Optional)"
              value={formData.currentPrice}
              onChange={(e) => handleFieldChange('currentPrice', e.target.value)}
              placeholder="$0.00"
              errorMessage={validationErrors.currentPrice}
              disabled={loading}
              helperText="Leave empty to use purchase price"
            />

            <TextField
              label="Dividend Yield % (Optional)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.dividendYield}
              onChange={(e) => handleFieldChange('dividendYield', e.target.value)}
              placeholder="0.00"
              errorMessage={validationErrors.dividendYield}
              disabled={loading}
              inputMode="decimal"
              leftIcon={<DollarSign className="w-4 h-4" />}
            />
          </div>

          <TextField
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Any additional notes about this holding..."
            disabled={loading}
            maxLength={500}
            helperText={`${formData.notes.length}/500 characters`}
          />
        </div>

        {/* Summary Card */}
        {(formData.shares && formData.costBasis) && (
          <Card className="bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                Calculated Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Total Cost:</span>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    ${summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                {summary.hasCurrentPrice && (
                  <>
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">Current Value:</span>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        ${summary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-neutral-600 dark:text-neutral-400">Gain/Loss:</span>
                      <div className={cn(
                        'font-semibold',
                        summary.gainLoss >= 0 
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-error-600 dark:text-error-400'
                      )}>
                        ${summary.gainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {summary.gainLossPercent !== 0 && (
                          <span className="ml-1 text-xs">
                            ({summary.gainLossPercent >= 0 ? '+' : ''}{summary.gainLossPercent.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
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
            disabled={!formData.ticker || !formData.shares || !formData.costBasis || !formData.purchaseDate}
          >
            Add Holding
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}