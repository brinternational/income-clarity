'use client';

import React, { useState, useCallback } from 'react';
import { TrendingUp, DollarSign, Percent, Building2, RefreshCw, AlertCircle } from 'lucide-react';
import { FormField, Input, Select, Button } from '../index';
import { SelectOption } from '../Select';
import { SkeletonForm } from '@/components/ui/skeletons';

export interface HoldingFormData {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice?: number;
  taxTreatment: 'qualified' | 'ordinary' | 'roc' | 'mixed';
  strategy: 'dividend' | 'covered_call' | 'growth' | 'reit';
  sector?: string;
}

export interface AddHoldingFormProps {
  onSubmit: (data: HoldingFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<HoldingFormData>;
}

const taxTreatmentOptions: SelectOption[] = [
  { value: 'qualified', label: 'Qualified Dividends (15% tax)' },
  { value: 'ordinary', label: 'Ordinary Income (marginal rate)' },
  { value: 'roc', label: 'Return of Capital (tax-deferred)' },
  { value: 'mixed', label: 'Mixed Treatment' }
];

const strategyOptions: SelectOption[] = [
  { value: 'dividend', label: 'Dividend Growth' },
  { value: 'covered_call', label: 'Covered Call Income' },
  { value: 'growth', label: 'Growth with Dividend' },
  { value: 'reit', label: 'Real Estate Investment Trust' }
];

const sectorOptions: SelectOption[] = [
  { value: '', label: 'Select sector (optional)' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Financials', label: 'Financial Services' },
  { value: 'Consumer Discretionary', label: 'Consumer Discretionary' },
  { value: 'Consumer Staples', label: 'Consumer Staples' },
  { value: 'Energy', label: 'Energy' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Materials', label: 'Materials' },
  { value: 'Industrials', label: 'Industrials' },
  { value: 'Communication', label: 'Communication Services' }
];

export function AddHoldingForm({ onSubmit, onCancel, loading = false, initialData }: AddHoldingFormProps) {
  const [formData, setFormData] = useState<HoldingFormData>({
    ticker: initialData?.ticker || '',
    shares: initialData?.shares || 0,
    avgCost: initialData?.avgCost || 0,
    currentPrice: initialData?.currentPrice || undefined,
    taxTreatment: initialData?.taxTreatment || 'qualified',
    strategy: initialData?.strategy || 'dividend',
    sector: initialData?.sector || ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof HoldingFormData, string>>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string>('');
  const [priceSource, setPriceSource] = useState<string>('');
  
  // Show skeleton if form is loading
  if (loading) {
    return <SkeletonForm fields={6} />;
  }
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof HoldingFormData, string>> = {};
    
    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker symbol is required';
    } else if (!/^[A-Za-z]{1,5}$/.test(formData.ticker.trim())) {
      newErrors.ticker = 'Please enter a valid ticker symbol (1-5 letters)';
    }
    
    if (formData.shares <= 0) {
      newErrors.shares = 'Number of shares must be greater than 0';
    }
    
    if (formData.avgCost <= 0) {
      newErrors.avgCost = 'Average cost must be greater than 0';
    }
    
    if (formData.currentPrice !== undefined && formData.currentPrice <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({
        ...formData,
        ticker: formData.ticker.toUpperCase().trim(),
        sector: formData.sector || undefined
      });
    } catch (error) {
      // Error handled by emergency recovery script;
  
  const calculateCurrentValue = () => {
    if (formData.currentPrice && formData.shares > 0) {
      return formData.currentPrice * formData.shares;
    }
    return null;
  };
  
  const calculateGainLoss = () => {
    if (formData.currentPrice && formData.avgCost > 0 && formData.shares > 0) {
      const currentValue = formData.currentPrice * formData.shares;
      const costBasis = formData.avgCost * formData.shares;
      const gain = currentValue - costBasis;
      const percentage = (gain / costBasis) * 100;
      return { gain, percentage };
    }
    return null;
  };

  /**
   * Fetch current stock price from API
   */
  const fetchStockPrice = useCallback(async (ticker: string) => {
    if (!ticker || ticker.length < 1) {
      return;
    }

    const normalizedTicker = ticker.toUpperCase().trim();
    
    // Validate ticker format
    if (!/^[A-Z]{1,5}$/.test(normalizedTicker)) {
      setPriceError('Invalid ticker format');
      return;
    }

    setPriceLoading(true);
    setPriceError('');
    setPriceSource('');

    try {
      const response = await fetch(`/api/stock-price?ticker=${encodeURIComponent(normalizedTicker)}`);
      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        setPriceError(data.error || 'Failed to fetch price');
        return;
      }

      // Success - update form with fetched price
      setFormData(prev => ({ ...prev, currentPrice: data.price }));
      setPriceSource(`${data.source} (${new Date(data.lastUpdated).toLocaleTimeString()})`);
      
      // Clear any existing price error
      if (errors.currentPrice) {
        setErrors(prev => ({ ...prev, currentPrice: undefined }));
      }

      // console.log(`Fetched price for ${normalizedTicker}: $${data.price}`);
    // } catch (error) {
      // Error handled by emergency recovery script finally {
      setPriceLoading(false);
    }
  }, [errors.currentPrice]);

  /**
   * Handle ticker field blur to auto-fetch price
   */
  const handleTickerBlur = useCallback(() => {
    if (formData.ticker && !formData.currentPrice) {
      fetchStockPrice(formData.ticker);
    }
  }, [formData.ticker, formData.currentPrice, fetchStockPrice]);

  /**
   * Manual refresh price button handler
   */
  const handleRefreshPrice = useCallback(() => {
    if (formData.ticker) {
      fetchStockPrice(formData.ticker);
    }
  }, [formData.ticker, fetchStockPrice]);
  
  const currentValue = calculateCurrentValue();
  const gainLoss = calculateGainLoss();
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {initialData ? 'Edit Holding' : 'Add New Holding'}
        </h2>
        <p className="text-sm text-gray-600">
          Enter the details of your dividend-paying investment
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ticker Symbol */}
        <FormField 
          label="Ticker Symbol" 
          required 
          error={errors.ticker}
          hint="e.g., JEPI, SCHD, VTI"
        >
          <Input
            placeholder="TICKER"
            value={formData.ticker}
            onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
            onBlur={handleTickerBlur}
            error={!!errors.ticker}
            leftIcon={<TrendingUp className="w-5 h-5" />}
            maxLength={5}
          />
        </FormField>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Number of Shares */}
          <FormField 
            label="Shares Owned" 
            required 
            error={errors.shares}
          >
            <Input
              type="number"
              placeholder="100"
              value={formData.shares || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, shares: parseFloat(e.target.value) || 0 }))}
              error={!!errors.shares}
              variant="number"
              min="0"
              step="0.001"
            />
          </FormField>
          
          {/* Average Cost */}
          <FormField 
            label="Average Cost per Share" 
            required 
            error={errors.avgCost}
          >
            <Input
              type="number"
              placeholder="50.00"
              value={formData.avgCost || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, avgCost: parseFloat(e.target.value) || 0 }))}
              error={!!errors.avgCost}
              leftIcon={<DollarSign className="w-5 h-5" />}
              variant="currency"
              min="0"
              step="0.01"
            />
          </FormField>
        </div>
        
        {/* Current Price (Optional) */}
        <FormField 
          label="Current Price" 
          error={errors.currentPrice || priceError}
          hint={priceSource || "Leave blank to fetch automatically"}
        >
          <div className="relative">
            <Input
              type="number"
              placeholder="55.00"
              value={formData.currentPrice || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, currentPrice: e.target.value ? parseFloat(e.target.value) : undefined }));
                // Clear auto-fetch info when manually editing
                if (e.target.value) {
                  setPriceSource('');
                  setPriceError('');
                }
              }}
              error={!!(errors.currentPrice || priceError)}
              leftIcon={<DollarSign className="w-5 h-5" />}
              variant="currency"
              min="0"
              step="0.01"
              disabled={priceLoading}
            />
            {/* Refresh Price Button */}
            {formData.ticker && (
              <button
                type="button"
                onClick={handleRefreshPrice}
                disabled={priceLoading || !formData.ticker}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                  priceLoading 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Fetch current price"
              >
                <RefreshCw className={`w-4 h-4 ${priceLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
          {/* Price Error Display */}
          {priceError && (
            <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{priceError}</span>
            </div>
          )}
          {/* Price Source Display */}
          {priceSource && !priceError && (
            <div className="mt-1 text-xs text-green-600">
              ✓ Price fetched from {priceSource}
            </div>
          )}
        </FormField>
        
        {/* Tax Treatment */}
        <FormField 
          label="Tax Treatment" 
          required
          hint="How the income from this holding is taxed"
        >
          <Select
            value={formData.taxTreatment}
            onChange={(e) => setFormData(prev => ({ ...prev, taxTreatment: e.target.value as any }))}
            options={taxTreatmentOptions}
            leftIcon={<Percent className="w-5 h-5" />}
          />
        </FormField>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Strategy */}
          <FormField 
            label="Investment Strategy" 
            required
          >
            <Select
              value={formData.strategy}
              onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value as any }))}
              options={strategyOptions}
            />
          </FormField>
          
          {/* Sector (Optional) */}
          <FormField 
            label="Sector" 
            hint="Optional classification"
          >
            <Select
              value={formData.sector || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
              options={sectorOptions}
              leftIcon={<Building2 className="w-5 h-5" />}
            />
          </FormField>
        </div>
        
        {/* Calculated Values Display */}
        {(currentValue || gainLoss) && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Calculated Values</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {currentValue && (
                <div>
                  <span className="text-gray-600">Current Value:</span>
                  <span className="ml-2 font-semibold text-gray-900 currency-display">
                    ${currentValue.toLocaleString()}
                  </span>
                </div>
              )}
              {gainLoss && (
                <div>
                  <span className="text-gray-600">Gain/Loss:</span>
                  <span className={`ml-2 font-semibold currency-display ${
                    gainLoss.gain >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${gainLoss.gain.toLocaleString()} ({gainLoss.percentage >= 0 ? '+' : ''}{gainLoss.percentage.toFixed(1)}%)
                  </span>
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
  );
}
