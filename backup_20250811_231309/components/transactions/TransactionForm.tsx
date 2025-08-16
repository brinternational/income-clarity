'use client'

import React, { useState } from 'react'
import { Button } from '@/components/forms/Button'
import { Input } from '@/components/forms/Input'
import { Select } from '@/components/forms/Select'
import { Textarea } from '@/components/forms/Textarea'
import toast from 'react-hot-toast'

interface Portfolio {
  id: string
  name: string
}

interface TransactionFormProps {
  portfolios: Portfolio[]
  onSuccess?: () => void
  onCancel?: () => void
  defaultPortfolioId?: string
}

interface FormData {
  portfolioId: string
  ticker: string
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'SPLIT' | 'MERGER'
  shares: number | ''
  amount: number | ''
  date: string
  notes: string
}

const transactionTypes = [
  { value: 'BUY', label: 'Buy' },
  { value: 'SELL', label: 'Sell' },
  { value: 'DIVIDEND', label: 'Dividend' },
  { value: 'INTEREST', label: 'Interest' },
  { value: 'SPLIT', label: 'Stock Split' },
  { value: 'MERGER', label: 'Merger' }
]

export function TransactionForm({ 
  portfolios, 
  onSuccess, 
  onCancel, 
  defaultPortfolioId 
}: TransactionFormProps) {
  const [formData, setFormData] = useState<FormData>({
    portfolioId: defaultPortfolioId || '',
    ticker: '',
    type: 'BUY',
    shares: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker symbol is required'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    // For BUY/SELL transactions, shares are required
    if ((formData.type === 'BUY' || formData.type === 'SELL')) {
      if (!formData.shares || formData.shares <= 0) {
        newErrors.shares = 'Shares are required for buy/sell transactions'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateTotal = (): number | null => {
    if (formData.shares && formData.amount && (formData.type === 'BUY' || formData.type === 'SELL')) {
      return Number(formData.shares) * Number(formData.amount)
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        portfolioId: formData.portfolioId || undefined,
        ticker: formData.ticker.toUpperCase(),
        type: formData.type,
        shares: formData.shares || undefined,
        amount: Number(formData.amount),
        date: formData.date,
        notes: formData.notes || undefined
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Transaction recorded successfully')
        
        // Reset form
        setFormData({
          portfolioId: defaultPortfolioId || '',
          ticker: '',
          type: 'BUY',
          shares: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        })

        onSuccess?.()
      } else {
        toast.error(result.error || 'Failed to record transaction')
      }
    } catch (error) {
      // Error handled by emergency recovery script finally {
      setIsSubmitting(false)
    }
  }

  const total = calculateTotal()
  const requiresShares = formData.type === 'BUY' || formData.type === 'SELL'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Portfolio Selection (Optional) */}
        {portfolios.length > 0 && (
          <div className="md:col-span-2">
            <Select
              label="Portfolio (Optional)"
              value={formData.portfolioId}
              onChange={(value) => handleInputChange('portfolioId', value)}
              options={[
                { value: '', label: 'No specific portfolio' },
                ...portfolios.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
          </div>
        )}

        {/* Ticker Symbol */}
        <div>
          <Input
            label="Ticker Symbol"
            value={formData.ticker}
            onChange={(value) => handleInputChange('ticker', value)}
            placeholder="e.g. AAPL, MSFT"
            error={errors.ticker}
            required
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        {/* Transaction Type */}
        <div>
          <Select
            label="Transaction Type"
            value={formData.type}
            onChange={(value) => handleInputChange('type', value as any)}
            options={transactionTypes}
            required
          />
        </div>

        {/* Shares (conditional) */}
        {requiresShares && (
          <div>
            <Input
              label="Number of Shares"
              type="number"
              value={formData.shares}
              onChange={(value) => handleInputChange('shares', Number(value))}
              placeholder="0"
              error={errors.shares}
              required
              min="0"
              step="0.0001"
            />
          </div>
        )}

        {/* Amount */}
        <div>
          <Input
            label={requiresShares ? "Price per Share" : "Total Amount"}
            type="number"
            value={formData.amount}
            onChange={(value) => handleInputChange('amount', Number(value))}
            placeholder="0.00"
            error={errors.amount}
            required
            min="0"
            step="0.01"
            prefix="$"
          />
        </div>

        {/* Date */}
        <div>
          <Input
            label="Transaction Date"
            type="date"
            value={formData.date}
            onChange={(value) => handleInputChange('date', value)}
            error={errors.date}
            required
          />
        </div>

        {/* Total Calculation Display */}
        {total && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 font-semibold">
              ${total.toFixed(2)}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="md:col-span-2">
          <Textarea
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(value) => handleInputChange('notes', value)}
            placeholder="Add any additional details..."
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? 'Recording...' : 'Record Transaction'}
        </Button>
      </div>

      {/* Form Summary */}
      {formData.ticker && formData.amount && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-semibold text-blue-900 mb-2">Transaction Summary:</h4>
          <p className="text-blue-800">
            {formData.type} {formData.shares && `${formData.shares} shares of `}
            {formData.ticker.toUpperCase()} 
            {requiresShares && formData.shares && formData.amount 
              ? ` at $${formData.amount}/share (Total: $${total?.toFixed(2)})`
              : ` for $${formData.amount}`
            }
          </p>
        </div>
      )}
    </form>
  )
}