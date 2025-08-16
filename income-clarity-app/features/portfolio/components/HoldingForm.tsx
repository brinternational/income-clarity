'use client';

import { useState, useEffect } from 'react';

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

interface HoldingFormProps {
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

export function HoldingForm({ holding, portfolioName, onSubmit, onCancel }: HoldingFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.ticker.trim()) {
        throw new Error('Stock ticker is required');
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

      // Validate optional numeric fields
      if (formData.currentPrice && (isNaN(parseFloat(formData.currentPrice)) || parseFloat(formData.currentPrice) <= 0)) {
        throw new Error('Current price must be a valid positive number');
      }

      if (formData.dividendYield && (isNaN(parseFloat(formData.dividendYield)) || parseFloat(formData.dividendYield) < 0)) {
        throw new Error('Dividend yield must be a valid non-negative number');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {holding ? 'Edit Holding' : 'Add New Holding'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Portfolio: {portfolioName}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stock Ticker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Ticker *
                </label>
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., AAPL, MSFT, VTI"
                  required
                  disabled={loading}
                />
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sector (Optional)
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cost Basis (per share) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costBasis}
                  onChange={(e) => handleChange('costBasis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                />
              </div>

              {/* Current Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentPrice}
                  onChange={(e) => handleChange('currentPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>

              {/* Dividend Yield */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dividend Yield % (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.dividendYield}
                  onChange={(e) => handleChange('dividendYield', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Calculated Values */}
            {(formData.shares && formData.costBasis) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Calculated Values
                </h3>
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
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                         hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center space-x-2"
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span>{holding ? 'Update Holding' : 'Add Holding'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}