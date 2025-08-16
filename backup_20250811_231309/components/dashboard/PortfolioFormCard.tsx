'use client'

import { useState, useCallback } from 'react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { Plus, X, DollarSign, TrendingUp, Percent, Calendar, Save, AlertCircle } from 'lucide-react'
import { Holding } from '@/types'
import { HoldingFormData as PortfolioHoldingFormData } from '@/components/forms/portfolio/AddHoldingForm'
// Generate simple UUID replacement
const generateId = () => `holding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

interface HoldingFormData {
  ticker: string
  companyName: string
  shares: number
  avgCostBasis: number
  currentPrice: number
  yield: number
  dividendType: 'qualified' | 'ordinary' | 'covered-call' | 'reit'
  sector: string
}

const initialFormData: HoldingFormData = {
  ticker: '',
  companyName: '',
  shares: 0,
  avgCostBasis: 0,
  currentPrice: 0,
  yield: 0,
  dividendType: 'qualified',
  sector: 'Diversified'
}

const dividendTypes = [
  { value: 'qualified', label: 'Qualified Dividend' },
  { value: 'covered-call', label: 'Covered Call' },
  { value: 'reit', label: 'REIT' },
  { value: 'ordinary', label: 'Ordinary Income' }
]

const sectors = [
  'Technology',
  'Financials',
  'Healthcare', 
  'Consumer Discretionary',
  'Communication Services',
  'Industrials',
  'Consumer Staples',
  'Energy',
  'Real Estate',
  'Materials',
  'Utilities',
  'Diversified'
]

export function PortfolioFormCard() {
  const { addHolding } = usePortfolio()
  const [formData, setFormData] = useState<HoldingFormData>(initialFormData)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = useCallback((field: keyof HoldingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker symbol is required'
    } else if (formData.ticker.length > 10) {
      newErrors.ticker = 'Ticker symbol too long'
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (formData.shares <= 0) {
      newErrors.shares = 'Shares must be greater than 0'
    }

    if (formData.avgCostBasis <= 0) {
      newErrors.avgCostBasis = 'Average cost basis must be greater than 0'
    }

    if (formData.currentPrice <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0'
    }

    if (formData.yield < 0 || formData.yield > 100) {
      newErrors.yield = 'Yield must be between 0 and 100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    
    try {
      const newHoldingData: PortfolioHoldingFormData = {
        ticker: formData.ticker.toUpperCase(),
        shares: formData.shares,
        avgCost: formData.avgCostBasis,
        currentPrice: formData.currentPrice,
        taxTreatment: formData.dividendType === 'qualified' ? 'qualified' : 
                      formData.dividendType === 'reit' ? 'roc' : 'ordinary',
        strategy: formData.dividendType === 'covered-call' ? 'covered_call' : 
                  formData.dividendType === 'reit' ? 'reit' : 'dividend',
        sector: formData.sector
      }

      await addHolding(newHoldingData)

      // Reset form
      setFormData(initialFormData)
      setIsExpanded(false)
      
    } catch (error) {
      // console.error('Error adding holding:', error)
    // } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
    setIsExpanded(false)
  }

  // Calculate preview values
  const totalValue = formData.shares * formData.currentPrice
  const monthlyIncome = totalValue * (formData.yield / 100) / 12
  const gainLoss = formData.shares * (formData.currentPrice - formData.avgCostBasis)

  return (
    <div 
      className="rounded-xl shadow-lg transition-all duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-success-secondary)' }}
          >
            <Plus className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
          </div>
          <div>
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Add New Holding
            </h3>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Expand your dividend portfolio
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text-primary)'
          }}
          aria-label={isExpanded ? 'Collapse form' : 'Expand form'}
        >
          <Plus className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Expandable Form */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Ticker Symbol *
              </label>
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
                placeholder="e.g., SCHD"
                className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                  errors.ticker ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: errors.ticker ? '#EF4444' : 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                maxLength={10}
              />
              {errors.ticker && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.ticker}
                </p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="e.g., Schwab US Dividend Equity ETF"
                className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                  errors.companyName ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: errors.companyName ? '#EF4444' : 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.companyName}
                </p>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Shares *
              </label>
              <input
                type="number"
                value={formData.shares || ''}
                onChange={(e) => handleInputChange('shares', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                  errors.shares ? 'border-red-500' : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: errors.shares ? '#EF4444' : 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
              {errors.shares && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.shares}
                </p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Avg Cost Basis *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="number"
                  value={formData.avgCostBasis || ''}
                  onChange={(e) => handleInputChange('avgCostBasis', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                    errors.avgCostBasis ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: errors.avgCostBasis ? '#EF4444' : 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              {errors.avgCostBasis && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.avgCostBasis}
                </p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Current Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="number"
                  value={formData.currentPrice || ''}
                  onChange={(e) => handleInputChange('currentPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-all duration-200 ${
                    errors.currentPrice ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: errors.currentPrice ? '#EF4444' : 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              {errors.currentPrice && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.currentPrice}
                </p>
              )}
            </div>
          </div>

          {/* Investment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Dividend Yield *
              </label>
              <div className="relative">
                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="number"
                  value={formData.yield || ''}
                  onChange={(e) => handleInputChange('yield', parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  min="0"
                  max="100"
                  step="0.1"
                  className={`w-full px-4 pr-10 py-3 rounded-lg border text-sm transition-all duration-200 ${
                    errors.yield ? 'border-red-500' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: errors.yield ? '#EF4444' : 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              {errors.yield && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.yield}
                </p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Dividend Type
              </label>
              <select
                value={formData.dividendType}
                onChange={(e) => handleInputChange('dividendType', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {dividendTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview Values */}
          {(totalValue > 0 || monthlyIncome > 0) && (
            <div 
              className="rounded-lg p-4 border transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--color-accent-secondary)',
                borderColor: 'var(--color-accent)'
              }}
            >
              <h4 
                className="text-sm font-semibold mb-3 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Holding Preview
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div 
                    className="text-lg font-bold transition-colors duration-300"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    ${totalValue.toLocaleString()}
                  </div>
                  <div 
                    className="text-xs transition-colors duration-300"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Total Value
                  </div>
                </div>
                <div>
                  <div 
                    className="text-lg font-bold transition-colors duration-300"
                    style={{ color: 'var(--color-success)' }}
                  >
                    ${monthlyIncome.toFixed(0)}
                  </div>
                  <div 
                    className="text-xs transition-colors duration-300"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Monthly Income
                  </div>
                </div>
                <div>
                  <div 
                    className={`text-lg font-bold transition-colors duration-300`}
                    style={{ 
                      color: gainLoss >= 0 ? 'var(--color-success)' : 'var(--color-error)'
                    }}
                  >
                    {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(0)}
                  </div>
                  <div 
                    className="text-xs transition-colors duration-300"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Unrealized P&L
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              onClick={resetForm}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-secondary)',
                border: `1px solid var(--color-border)`
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving || Object.keys(errors).length > 0}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed theme-btn-primary flex items-center justify-center space-x-2"
              style={{
                backgroundColor: 'var(--color-success)',
                color: 'white'
              }}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Add Holding</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}