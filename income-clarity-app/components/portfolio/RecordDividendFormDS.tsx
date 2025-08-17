/**
 * Manual Portfolio Entry - Record Dividend Form
 * MANUAL-004: "Record Dividend" action with form and history tracking
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/design-system/core/Button'
import { TextField, CurrencyField } from '@/components/design-system/forms/TextField'
import { Select } from '@/components/design-system/forms/Select'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/design-system/feedback/Modal'
import { Card } from '@/components/design-system/core/Card'
import { Alert } from '@/components/design-system/core/Alert'
import { DollarSign, Calendar, RotateCcw, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface RecordDividendFormProps {
  open: boolean
  onClose: () => void
  holding: {
    id: string
    ticker: string
    shares: number
    dividendYield?: number
  }
  onSuccess?: (dividendRecord: any) => void
}

interface FormData {
  dividendType: 'total' | 'per-share'
  dividendAmount: string
  paymentDate: string
  reinvested: boolean
  notes: string
}

export function RecordDividendFormDS({ 
  open, 
  onClose, 
  holding,
  onSuccess 
}: RecordDividendFormProps) {
  const [formData, setFormData] = useState<FormData>({
    dividendType: 'per-share',
    dividendAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    reinvested: false,
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        dividendType: 'per-share',
        dividendAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        reinvested: false,
        notes: ''
      })
      setError('')
      setValidationErrors({})
    }
  }, [open])

  const handleFieldChange = (field: keyof FormData, value: string | boolean) => {
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

    if (!formData.dividendAmount) {
      errors.dividendAmount = 'Dividend amount is required'
    } else if (isNaN(parseFloat(formData.dividendAmount)) || parseFloat(formData.dividendAmount) <= 0) {
      errors.dividendAmount = 'Dividend amount must be a positive number'
    }

    if (!formData.paymentDate) {
      errors.paymentDate = 'Payment date is required'
    } else {
      const paymentDate = new Date(formData.paymentDate)
      const today = new Date()
      if (paymentDate > today) {
        errors.paymentDate = 'Payment date cannot be in the future'
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
      const dividendAmount = parseFloat(formData.dividendAmount)
      
      // Calculate total dividend and per-share amount
      const totalDividend = formData.dividendType === 'total' 
        ? dividendAmount 
        : dividendAmount * holding.shares
      
      const perShareAmount = formData.dividendType === 'per-share' 
        ? dividendAmount 
        : dividendAmount / holding.shares

      const payload = {
        dividendPerShare: perShareAmount,
        paymentDate: formData.paymentDate,
        paymentType: 'REGULAR',
        totalShares: holding.shares,
        ...(formData.notes.trim() && { notes: formData.notes.trim() })
      }

      logger.log(`💰 Recording dividend for ${holding.ticker}:`, payload)

      const response = await fetch(`/api/holdings/${holding.id}/dividends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to record dividend')
      }

      const result = await response.json()
      logger.log(`✅ Dividend recorded successfully for ${holding.ticker}:`, result)
      
      onSuccess?.(result.dividend)
      onClose()
    } catch (err) {
      logger.error('❌ Error recording dividend:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while recording the dividend')
    } finally {
      setLoading(false)
    }
  }

  // Calculate dividend summary
  const calculateDividendSummary = () => {
    const amount = parseFloat(formData.dividendAmount) || 0
    
    if (formData.dividendType === 'total') {
      return {
        totalDividend: amount,
        perShareAmount: holding.shares > 0 ? amount / holding.shares : 0
      }
    } else {
      return {
        totalDividend: amount * holding.shares,
        perShareAmount: amount
      }
    }
  }

  const dividendSummary = calculateDividendSummary()

  // Estimate annual yield if we have the data
  const estimateAnnualYield = () => {
    if (dividendSummary.perShareAmount > 0 && holding.shares > 0) {
      // Assuming quarterly dividends (multiply by 4)
      const estimatedAnnualDividend = dividendSummary.perShareAmount * 4
      return {
        quarterlyEstimate: dividendSummary.perShareAmount,
        annualEstimate: estimatedAnnualDividend,
        hasEstimate: true
      }
    }
    return { hasEstimate: false }
  }

  const yieldEstimate = estimateAnnualYield()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Dividend"
      description={`Record dividend payment for ${holding.ticker}`}
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
              {holding.ticker} Position
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Shares Owned:</span>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {holding.shares.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                </div>
              </div>
              
              {holding.dividendYield && (
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Dividend Yield:</span>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {holding.dividendYield.toFixed(2)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Dividend Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
            Dividend Details
          </h3>
          
          <Select
            label="Dividend Entry Type"
            value={formData.dividendType}
            onChange={(value) => handleFieldChange('dividendType', value)}
            disabled={loading}
            leftIcon={<DollarSign className="w-4 h-4" />}
          >
            <option value="per-share">Per Share Amount</option>
            <option value="total">Total Amount Received</option>
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyField
              label={formData.dividendType === 'total' ? 'Total Dividend Received' : 'Dividend Per Share'}
              value={formData.dividendAmount}
              onChange={(e) => handleFieldChange('dividendAmount', e.target.value)}
              placeholder="$0.00"
              errorMessage={validationErrors.dividendAmount}
              required
              disabled={loading}
              helperText={formData.dividendType === 'total' ? 'Total amount you received' : 'Amount per share'}
            />

            <TextField
              label="Payment Date"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => handleFieldChange('paymentDate', e.target.value)}
              errorMessage={validationErrors.paymentDate}
              required
              disabled={loading}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="reinvested"
              checked={formData.reinvested}
              onChange={(e) => handleFieldChange('reinvested', e.target.checked)}
              className="w-4 h-4 text-brand-600 bg-white border-neutral-300 rounded focus:ring-brand-500 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
              disabled={loading}
            />
            <label htmlFor="reinvested" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Dividend was reinvested (DRIP)
            </label>
          </div>

          <TextField
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Notes about this dividend payment..."
            disabled={loading}
            maxLength={200}
            helperText={`${formData.notes.length}/200 characters`}
          />
        </div>

        {/* Dividend Summary */}
        {formData.dividendAmount && (
          <Card className="bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
            <div className="p-4">
              <h3 className="text-sm font-medium text-success-900 dark:text-success-100 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Dividend Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-success-700 dark:text-success-300">Total Received:</span>
                  <div className="font-semibold text-success-900 dark:text-success-100">
                    ${dividendSummary.totalDividend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-success-600 dark:text-success-400">
                    ${dividendSummary.perShareAmount.toFixed(4)} per share
                  </div>
                </div>
                
                {yieldEstimate.hasEstimate && (
                  <div>
                    <span className="text-success-700 dark:text-success-300">Estimated Annual:</span>
                    <div className="font-semibold text-success-900 dark:text-success-100">
                      ${(yieldEstimate.annualEstimate * holding.shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-success-600 dark:text-success-400">
                      If quarterly: ${yieldEstimate.annualEstimate.toFixed(4)} per share/year
                    </div>
                  </div>
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
            variant="success"
            loading={loading}
            leftIcon={<DollarSign className="w-4 h-4" />}
            disabled={!formData.dividendAmount || !formData.paymentDate}
          >
            Record Dividend
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}