'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { logger } from '@/lib/logger'

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  purchaseDate: string;
  currentPrice?: number;
  dividendYield?: number;
  sector?: string;
}

interface StockValidationResult {
  symbol: string;
  price?: number;
  valid: boolean;
  sector?: string;
  dividendYield?: number;
  error?: string;
}

interface EnhancedHoldingFormProps {
  holding?: Holding | null;
  portfolioName: string;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
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
  'Other',
];

// Debounce hook for API calls
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export function EnhancedHoldingForm({ holding, portfolioName, onSubmit, onCancel }: EnhancedHoldingFormProps) {
  const [formData, setFormData] = useState({
    ticker: '',
    shares: '',
    costBasis: '',
    purchaseDate: '',
    currentPrice: '',
    dividendYield: '',
    sector: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Symbol validation state
  const [symbolValidation, setSymbolValidation] = useState<{
    status: 'idle' | 'loading' | 'valid' | 'invalid';
    result?: StockValidationResult;
    error?: string;
  }>({ status: 'idle' });

  const debouncedTicker = useDebounce(formData.ticker, 500);

  // Populate form when editing
  useEffect(() => {
    if (holding) {
      setFormData({
        ticker: holding.ticker || '',
        shares: holding.shares?.toString() || '',
        costBasis: holding.costBasis?.toString() || '',
        purchaseDate: holding.purchaseDate ? holding.purchaseDate.split('T')[0] : '',
        currentPrice: holding.currentPrice?.toString() || '',
        dividendYield: holding.dividendYield?.toString() || '',
        sector: holding.sector || '',
      });
    } else {
      // Set default purchase date to today for new holdings
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        purchaseDate: today,
      }));
    }
  }, [holding]);

  // Validate symbol when ticker changes
  const validateSymbol = useCallback(async (symbol: string) => {
    if (!symbol.trim() || symbol.length < 1) {
      setSymbolValidation({ status: 'idle' });
      return;
    }

    setSymbolValidation({ status: 'loading' });
    
    try {
      const response = await fetch(`/api/stock-prices?symbol=${symbol.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error('Failed to validate symbol');
      }
      
      const data = await response.json();
      
      if (data.error) {
        setSymbolValidation({ 
          status: 'invalid', 
          error: data.error,
          result: { symbol: symbol.toUpperCase(), valid: false, error: data.error }
        });
      } else {
        const validationResult: StockValidationResult = {
          symbol: symbol.toUpperCase(),
          valid: true,
          price: data.price,
          sector: data.sector,
          dividendYield: data.dividendYield
        };
        
        setSymbolValidation({ 
          status: 'valid', 
          result: validationResult 
        });

        // Auto-populate fields if they're empty
        setFormData(prev => ({
          ...prev,
          currentPrice: !prev.currentPrice && data.price ? data.price.toString() : prev.currentPrice,
          dividendYield: !prev.dividendYield && data.dividendYield ? data.dividendYield.toString() : prev.dividendYield,
          sector: !prev.sector && data.sector ? data.sector : prev.sector
        }));
      }
    } catch (err) {
      logger.error('Symbol validation error:', err);
      setSymbolValidation({ 
        status: 'invalid',
        error: 'Failed to validate symbol',
        result: { symbol: symbol.toUpperCase(), valid: false, error: 'Validation failed' }
      });
    }
  }, []);

  useEffect(() => {
    if (debouncedTicker && !holding) { // Only validate for new holdings
      validateSymbol(debouncedTicker);
    }
  }, [debouncedTicker, validateSymbol, holding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Enhanced validation
      if (!formData.ticker.trim()) {
        throw new Error('Stock ticker is required');
      }

      // Check symbol validation for new holdings
      if (!holding && symbolValidation.status === 'invalid') {
        throw new Error(`Invalid stock symbol: ${formData.ticker.toUpperCase()}`);
      }

      if (!formData.shares || isNaN(parseFloat(formData.shares)) || parseFloat(formData.shares) <= 0) {
        throw new Error('Valid number of shares is required');
      }

      if (!formData.costBasis || isNaN(parseFloat(formData.costBasis)) || parseFloat(formData.costBasis) <= 0) {
        throw new Error('Valid cost basis is required');
      }

      if (!formData.purchaseDate) {
        throw new Error('Purchase date is required');
      }

      // Validate future date
      const purchaseDate = new Date(formData.purchaseDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (purchaseDate > today) {
        throw new Error('Purchase date cannot be in the future');
      }

      // Validate optional numeric fields
      if (formData.currentPrice && (isNaN(parseFloat(formData.currentPrice)) || parseFloat(formData.currentPrice) <= 0)) {
        throw new Error('Current price must be a valid positive number');
      }

      if (formData.dividendYield && (isNaN(parseFloat(formData.dividendYield)) || parseFloat(formData.dividendYield) < 0 || parseFloat(formData.dividendYield) > 100)) {
        throw new Error('Dividend yield must be between 0 and 100');
      }

      // Submit form
      const submitData: any = {
        ticker: formData.ticker.trim().toUpperCase(),
        shares: parseFloat(formData.shares),
        costBasis: parseFloat(formData.costBasis),
        purchaseDate: formData.purchaseDate,
      };

      // Add optional fields if provided
      if (formData.currentPrice) {
        submitData.currentPrice = parseFloat(formData.currentPrice);
      }

      if (formData.dividendYield) {
        submitData.dividendYield = parseFloat(formData.dividendYield);
      }

      if (formData.sector) {
        submitData.sector = formData.sector;
      }

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing

    // Reset symbol validation when ticker changes
    if (field === 'ticker') {
      setSymbolValidation({ status: 'idle' });
    }
  };

  const calculateTotalValue = () => {
    const shares = parseFloat(formData.shares) || 0;
    const currentPrice = parseFloat(formData.currentPrice) || parseFloat(formData.costBasis) || 0;
    return shares * currentPrice;
  };

  const calculateTotalCost = () => {
    const shares = parseFloat(formData.shares) || 0;
    const costBasis = parseFloat(formData.costBasis) || 0;
    return shares * costBasis;
  };

  const calculateGainLoss = () => {
    return calculateTotalValue() - calculateTotalCost();
  };

  const getSymbolValidationIcon = () => {
    switch (symbolValidation.status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'valid':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {holding ? 'Edit Holding' : 'Add New Holding'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Portfolio: {portfolioName}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-center space-x-2"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock Ticker with Validation */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Ticker *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.ticker}
                    onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., AAPL, MSFT, VTI"
                    required
                    disabled={loading}
                    aria-describedby="ticker-validation"
                  />
                  <div className="absolute right-3 top-2.5">
                    {getSymbolValidationIcon()}
                  </div>
                </div>
                
                <AnimatePresence>
                  {symbolValidation.status === 'valid' && symbolValidation.result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      id="ticker-validation"
                    >
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          Valid symbol: {symbolValidation.result.symbol}
                        </span>
                      </div>
                      {symbolValidation.result.price && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Current price: ${symbolValidation.result.price.toFixed(2)}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {symbolValidation.status === 'invalid' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      id="ticker-validation"
                    >
                      <div className="flex items-center space-x-2">
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-700 dark:text-red-300">
                          {symbolValidation.error || 'Invalid stock symbol'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loading}
                >
                  <option value="">Select Sector</option>
                  {SECTORS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Shares */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Shares *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.shares}
                  onChange={(e) => handleChange('shares', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0.000"
                  required
                  disabled={loading}
                />
              </div>

              {/* Cost Basis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost Basis (per share) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costBasis}
                    onChange={(e) => handleChange('costBasis', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange('purchaseDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={loading}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                />
              </div>

              {/* Current Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.currentPrice}
                    onChange={(e) => handleChange('currentPrice', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Dividend Yield */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dividend Yield %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.dividendYield}
                    onChange={(e) => handleChange('dividendYield', e.target.value)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* Calculated Values */}
            <AnimatePresence>
              {(formData.shares && formData.costBasis) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Calculated Values
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Cost: </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${calculateTotalCost().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {formData.currentPrice && (
                      <>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Current Value: </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${calculateTotalValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Gain/Loss: </span>
                          <span className={`font-medium ${
                            calculateGainLoss() >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            ${calculateGainLoss().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {' '}
                            ({calculateTotalCost() > 0 ? ((calculateGainLoss() / calculateTotalCost()) * 100).toFixed(2) : '0.00'}%)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                         hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors
                         focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={loading}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center space-x-2 focus:outline-none focus:ring-2 
                         focus:ring-green-500 focus:ring-offset-2"
                disabled={loading || (symbolValidation.status === 'invalid' && !holding)}
              >
                {loading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>{holding ? 'Update Holding' : 'Add Holding'}</span>
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}