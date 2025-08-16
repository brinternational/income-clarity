'use client'

import React, { useState } from 'react'
import { TrendingUp, Calendar, DollarSign, Hash, Percent } from 'lucide-react'
import { FormField, Input, Button, Select } from '../index'

export interface HoldingFormData {
  ticker: string
  shares: number
  costBasis: number
  purchaseDate: string
  currentPrice?: number
  dividendYield?: number
  sector?: string
}

interface HoldingFormProps {
  portfolioId: string
  onSubmit: (data: HoldingFormData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  initialData?: Partial<HoldingFormData>
}

const SECTOR_OPTIONS = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Consumer Defensive', label: 'Consumer Defensive' },
  { value: 'Consumer Cyclical', label: 'Consumer Cyclical' },
  { value: 'Industrials', label: 'Industrials' },
  { value: 'Energy', label: 'Energy' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Materials', label: 'Materials' },
  { value: 'Communication Services', label: 'Communication Services' },
  { value: 'ETF', label: 'ETF' },
  { value: 'Other', label: 'Other' }
]

export function HoldingForm({ 
  portfolioId,
  onSubmit, 
  onCancel, 
  loading = false, 
  initialData 
}: HoldingFormProps) {
  const [formData, setFormData] = useState<HoldingFormData>({
    ticker: initialData?.ticker || '',
    shares: initialData?.shares || 0,
    costBasis: initialData?.costBasis || 0,
    purchaseDate: initialData?.purchaseDate || new Date().toISOString().split('T')[0],
    currentPrice: initialData?.currentPrice || undefined,
    dividendYield: initialData?.dividendYield || undefined,
    sector: initialData?.sector || ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof HoldingFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HoldingFormData, string>> = {}
    
    // Ticker validation
    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker symbol is required'
    } else if (formData.ticker.trim().length > 10) {
      newErrors.ticker = 'Ticker symbol must be 10 characters or less'
    }
    
    // Shares validation
    if (!formData.shares || formData.shares <= 0) {
      newErrors.shares = 'Shares must be greater than 0'
    }
    
    // Cost basis validation
    if (!formData.costBasis || formData.costBasis <= 0) {
      newErrors.costBasis = 'Cost basis must be greater than 0'
    }
    
    // Purchase date validation
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required'
    } else {
      const purchaseDate = new Date(formData.purchaseDate)
      const today = new Date()
      if (purchaseDate > today) {
        newErrors.purchaseDate = 'Purchase date cannot be in the future'
      }
    }
    
    // Current price validation (if provided)
    if (formData.currentPrice !== undefined && formData.currentPrice <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0'
    }
    
    // Dividend yield validation (if provided)
    if (formData.dividendYield !== undefined && (formData.dividendYield < 0 || formData.dividendYield > 1)) {
      newErrors.dividendYield = 'Dividend yield must be between 0 and 100%'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      await onSubmit({
        ...formData,
        ticker: formData.ticker.toUpperCase().trim(),
        sector: formData.sector?.trim() || undefined
      })
    } catch (error) {
      // Error handled by emergency recovery script

  // Calculate current value and estimated annual dividend
  const currentValue = formData.shares * (formData.currentPrice || 0)
  const annualDividend = currentValue * (formData.dividendYield || 0)
  const costBasisPerShare = formData.shares > 0 ? formData.costBasis / formData.shares : 0
  const unrealizedGainLoss = currentValue - formData.costBasis
  const unrealizedReturn = formData.costBasis > 0 ? (unrealizedGainLoss / formData.costBasis) * 100 : 0

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {initialData ? 'Edit Holding' : 'Add New Holding'}
        </h2>
        <p className="text-sm text-gray-600">
          Add stocks, ETFs, or other securities to your portfolio
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ticker Symbol */}
          <FormField 
            label="Ticker Symbol" 
            required 
            error={errors.ticker}
            hint="Stock or ETF ticker symbol"
          >
            <Input
              placeholder="SPY"
              value={formData.ticker}
              onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value }))}
              error={!!errors.ticker}
              leftIcon={<TrendingUp className="w-5 h-5" />}
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
          </FormField>

          {/* Sector */}
          <FormField 
            label="Sector" 
            hint="Industry sector (optional)"
          >
            <Select
              value={formData.sector || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, sector: value || undefined }))}
              placeholder="Select sector"
              options={SECTOR_OPTIONS}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shares */}
          <FormField 
            label="Shares" 
            required 
            error={errors.shares}
            hint="Number of shares owned"
          >
            <Input
              type="number"
              placeholder="100"
              value={formData.shares || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, shares: parseFloat(e.target.value) || 0 }))}
              error={!!errors.shares}
              leftIcon={<Hash className="w-5 h-5" />}
              min="0"
              step="0.001"
            />
          </FormField>

          {/* Cost Basis */}
          <FormField 
            label="Total Cost Basis" 
            required 
            error={errors.costBasis}
            hint="Total amount paid for all shares"
          >
            <Input
              type="number"
              placeholder="42000"
              value={formData.costBasis || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, costBasis: parseFloat(e.target.value) || 0 }))}
              error={!!errors.costBasis}
              leftIcon={<DollarSign className="w-5 h-5" />}
              min="0"
              step="0.01"
            />
          </FormField>
        </div>

        {/* Purchase Date */}
        <FormField 
          label="Purchase Date" 
          required 
          error={errors.purchaseDate}
          hint="Date when you purchased this holding"
        >
          <Input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
            error={!!errors.purchaseDate}
            leftIcon={<Calendar className="w-5 h-5" />}
            max={new Date().toISOString().split('T')[0]}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Price */}
          <FormField 
            label="Current Price" 
            error={errors.currentPrice}
            hint="Current market price per share (optional)"
          >
            <Input
              type="number"
              placeholder="420.00"
              value={formData.currentPrice || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value ? parseFloat(e.target.value) : undefined }))}
              error={!!errors.currentPrice}
              leftIcon={<DollarSign className="w-5 h-5" />}
              min="0"
              step="0.01"
            />
          </FormField>

          {/* Dividend Yield */}
          <FormField 
            label="Dividend Yield" 
            error={errors.dividendYield}
            hint="Annual dividend yield as decimal (e.g., 0.025 for 2.5%)"
          >
            <Input
              type="number"
              placeholder="0.025"
              value={formData.dividendYield || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dividendYield: e.target.value ? parseFloat(e.target.value) : undefined }))}
              error={!!errors.dividendYield}
              leftIcon={<Percent className="w-5 h-5" />}
              min="0"
              max="1"
              step="0.001"
            />
          </FormField>
        </div>

        {/* Calculations Summary */}
        {(formData.shares > 0 && formData.costBasis > 0) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Cost per Share</p>
                <p className="font-medium">${costBasisPerShare.toFixed(2)}</p>
              </div>
              {formData.currentPrice && (
                <>
                  <div>
                    <p className="text-gray-600">Current Value</p>
                    <p className="font-medium">${currentValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Gain/Loss</p>
                    <p className={`font-medium ${unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(unrealizedGainLoss).toLocaleString()} ({unrealizedReturn.toFixed(1)}%)
                    </p>
                  </div>
                </>
              )}
              {formData.dividendYield && formData.currentPrice && (
                <div>
                  <p className="text-gray-600">Annual Dividend</p>
                  <p className="font-medium">${annualDividend.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="sm:flex-1"
          >
            {initialData ? 'Update Holding' : 'Add Holding'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              fullWidth
              className="sm:flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}