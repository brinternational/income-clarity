'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Calendar, Coins, TrendingUp } from 'lucide-react';

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  purchaseDate: string;
  currentPrice?: number;
  dividendYield?: number;
  sector?: string;
  currentValue: number;
  costBasisTotal: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface DividendRecordFormProps {
  holding: Holding;
  onSubmit: (dividendData: any) => Promise<void>;
  onCancel: () => void;
}

export function DividendRecordForm({ 
  holding,
  onSubmit, 
  onCancel 
}: DividendRecordFormProps) {
  const [formData, setFormData] = useState({
    dividendPerShare: '',
    paymentDate: '',
    exDate: '',
    paymentType: 'REGULAR' as 'REGULAR' | 'SPECIAL' | 'QUARTERLY' | 'MONTHLY' | 'ANNUALLY' | 'SEMI_ANNUALLY',
    totalShares: holding.shares.toString(),
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalDividend, setTotalDividend] = useState(0);
  const [annualYield, setAnnualYield] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Accessibility: Focus management
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      paymentDate: today,
    }));

    // Focus management for accessibility
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, []);

  // Calculate total dividend and annual yield
  useEffect(() => {
    const dividendPerShare = parseFloat(formData.dividendPerShare) || 0;
    const totalShares = parseFloat(formData.totalShares) || 0;
    const total = dividendPerShare * totalShares;
    setTotalDividend(total);

    // Calculate annual yield if current price is available
    if (holding.currentPrice && dividendPerShare > 0) {
      let annualEstimate = dividendPerShare;
      switch (formData.paymentType) {
        case 'QUARTERLY':
          annualEstimate = dividendPerShare * 4;
          break;
        case 'MONTHLY':
          annualEstimate = dividendPerShare * 12;
          break;
        case 'SEMI_ANNUALLY':
          annualEstimate = dividendPerShare * 2;
          break;
        case 'ANNUALLY':
          annualEstimate = dividendPerShare;
          break;
        default:
          // For REGULAR, SPECIAL, etc., use quarterly as default assumption
          annualEstimate = dividendPerShare * 4;
      }
      const yield_calc = (annualEstimate / holding.currentPrice) * 100;
      setAnnualYield(yield_calc);
    } else {
      setAnnualYield(null);
    }
  }, [formData.dividendPerShare, formData.totalShares, formData.paymentType, holding.currentPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.dividendPerShare || isNaN(parseFloat(formData.dividendPerShare)) || parseFloat(formData.dividendPerShare) <= 0) {
        throw new Error('Please enter a valid dividend per share amount');
      }

      if (!formData.paymentDate) {
        throw new Error('Please select a payment date');
      }

      if (!formData.totalShares || isNaN(parseFloat(formData.totalShares)) || parseFloat(formData.totalShares) <= 0) {
        throw new Error('Please enter a valid number of shares');
      }

      // Validate payment date is not in future
      const paymentDate = new Date(formData.paymentDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (paymentDate > today) {
        throw new Error('Payment date cannot be in the future');
      }

      // Validate ex-dividend date if provided
      if (formData.exDate) {
        const exDate = new Date(formData.exDate);
        if (exDate > paymentDate) {
          throw new Error('Ex-dividend date must be before or same as payment date');
        }
      }

      const dividendData = {
        dividendPerShare: parseFloat(formData.dividendPerShare),
        paymentDate: formData.paymentDate,
        exDate: formData.exDate || null,
        paymentType: formData.paymentType,
        totalShares: parseFloat(formData.totalShares),
        notes: formData.notes || null,
      };

      await onSubmit(dividendData);
      
      // Show success message
      const amount = parseFloat(formData.dividendPerShare);
      const shares = parseFloat(formData.totalShares);
      setSuccessMessage(`Successfully recorded $${(amount * shares).toFixed(2)} dividend for ${holding.ticker}`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record dividend');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="dividend-record-title"
        aria-describedby="dividend-record-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 id="dividend-record-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Record Dividend
              </h2>
              <p id="dividend-record-description" className="text-sm text-gray-600 dark:text-gray-400">
                Record dividend payment for {holding.ticker}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              role="alert"
            >
              <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
            </motion.div>
          )}

          {/* Stock Information */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Position</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {holding.ticker}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Shares:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {holding.shares.toLocaleString()}
                </span>
              </div>
              {holding.currentPrice && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatCurrency(holding.currentPrice)}
                  </span>
                </div>
              )}
              {holding.dividendYield && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Yield:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {holding.dividendYield.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dividend Per Share */}
            <div>
              <label htmlFor="dividend-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dividend Per Share
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="dividend-input"
                  ref={firstInputRef}
                  type="number"
                  step="0.0001"
                  min="0"
                  value={formData.dividendPerShare}
                  onChange={(e) => setFormData(prev => ({ ...prev, dividendPerShare: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  required
                  aria-describedby="dividend-help"
                />
              </div>
              <p id="dividend-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Dividend amount per share
              </p>
            </div>

            {/* Total Shares */}
            <div>
              <label htmlFor="shares-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Shares
              </label>
              <input
                id="shares-input"
                type="number"
                step="0.001"
                min="0"
                value={formData.totalShares}
                onChange={(e) => setFormData(prev => ({ ...prev, totalShares: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                aria-describedby="shares-help"
              />
              <p id="shares-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Shares eligible for dividend
              </p>
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="payment-date-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="payment-date-input"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Ex-Dividend Date (Optional) */}
          <div>
            <label htmlFor="ex-date-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ex-Dividend Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="ex-date-input"
                type="date"
                value={formData.exDate}
                onChange={(e) => setFormData(prev => ({ ...prev, exDate: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                max={formData.paymentDate}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The ex-dividend date (when stock trades without dividend)
            </p>
          </div>

          {/* Payment Type */}
          <div>
            <label htmlFor="payment-type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Type
            </label>
            <select
              id="payment-type-select"
              value={formData.paymentType}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as typeof formData.paymentType }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="REGULAR">Regular</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="SEMI_ANNUALLY">Semi-Annually</option>
              <option value="ANNUALLY">Annually</option>
              <option value="SPECIAL">Special</option>
            </select>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label htmlFor="notes-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes-input"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
              placeholder="Additional notes about this dividend payment..."
            />
          </div>

          {/* Dividend Summary */}
          {totalDividend > 0 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">Dividend Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700 dark:text-purple-300">Total Dividend:</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">
                    {formatCurrency(totalDividend)}
                  </span>
                </div>
                {annualYield !== null && (
                  <div className="flex justify-between">
                    <span className="text-purple-700 dark:text-purple-300">Estimated Annual Yield:</span>
                    <span className="font-medium text-purple-900 dark:text-purple-100">
                      {annualYield.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.dividendPerShare || !formData.paymentDate || !formData.totalShares}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:text-gray-500"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Recording...</span>
                </div>
              ) : (
                'Record Dividend'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}