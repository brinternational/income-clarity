'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  purchaseDate: string;
  currentPrice?: number;
  currentValue: number;
  costBasisTotal: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface QuickPurchaseFormProps {
  holdings: Holding[];
  selectedHolding?: Holding | null;
  portfolioId: string;
  onSubmit: (purchaseData: any) => Promise<void>;
  onCancel: () => void;
}

export function QuickPurchaseForm({ 
  holdings, 
  selectedHolding, 
  portfolioId, 
  onSubmit, 
  onCancel 
}: QuickPurchaseFormProps) {
  const [formData, setFormData] = useState({
    holdingId: '',
    shares: '',
    pricePerShare: '',
    purchaseDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [newAverageCost, setNewAverageCost] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Accessibility: Focus management
  const firstInputRef = useRef<HTMLSelectElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize form data
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      holdingId: selectedHolding?.id || '',
      shares: '',
      pricePerShare: selectedHolding?.currentPrice?.toString() || '',
      purchaseDate: today,
    });

    // Focus management for accessibility
    setTimeout(() => {
      if (selectedHolding) {
        // If pre-selected, focus on shares input
        const sharesInput = document.querySelector('[name="shares"]') as HTMLInputElement;
        sharesInput?.focus();
      } else {
        // Otherwise, focus on ticker dropdown
        firstInputRef.current?.focus();
      }
    }, 100);
  }, [selectedHolding]);

  // Calculate total cost and new average cost basis
  useEffect(() => {
    const shares = parseFloat(formData.shares) || 0;
    const pricePerShare = parseFloat(formData.pricePerShare) || 0;
    const newTotal = shares * pricePerShare;
    setTotalCost(newTotal);

    // Calculate new average cost basis
    if (formData.holdingId && shares > 0 && pricePerShare > 0) {
      const selectedHolding = holdings.find(h => h.id === formData.holdingId);
      if (selectedHolding) {
        const existingValue = selectedHolding.shares * selectedHolding.costBasis;
        const newValue = shares * pricePerShare;
        const totalShares = selectedHolding.shares + shares;
        const newAvg = (existingValue + newValue) / totalShares;
        setNewAverageCost(newAvg);
      }
    }
  }, [formData.shares, formData.pricePerShare, formData.holdingId, holdings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Input validation
      if (!formData.holdingId) {
        throw new Error('Please select a stock');
      }

      if (!formData.shares || isNaN(parseFloat(formData.shares)) || parseFloat(formData.shares) <= 0) {
        throw new Error('Please enter a valid number of shares');
      }

      if (!formData.pricePerShare || isNaN(parseFloat(formData.pricePerShare)) || parseFloat(formData.pricePerShare) <= 0) {
        throw new Error('Please enter a valid price per share');
      }

      if (!formData.purchaseDate) {
        throw new Error('Please select a purchase date');
      }

      const purchaseData = {
        holdingId: formData.holdingId,
        shares: parseFloat(formData.shares),
        pricePerShare: parseFloat(formData.pricePerShare),
        purchaseDate: formData.purchaseDate,
        totalCost: totalCost,
      };

  await onSubmit(purchaseData);

  const addedShares = purchaseData.shares;
  const addedPrice = purchaseData.pricePerShare;
  const stock = holdings.find(h => h.id === purchaseData.holdingId);
  // Show success message briefly
  setSuccessMessage(`Successfully added ${addedShares} shares of ${stock?.ticker || ''} at $${addedPrice.toFixed(2)}`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const selectedStock = holdings.find(h => h.id === formData.holdingId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="quick-purchase-title"
        aria-describedby="quick-purchase-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg">
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 id="quick-purchase-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Add Purchase
              </h2>
              <p id="quick-purchase-description" className="text-sm text-gray-600 dark:text-gray-400">
                Add shares to an existing holding
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Stock Selection */}
          <div>
            <label htmlFor="holding-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock
            </label>
            <select
              id="holding-select"
              ref={firstInputRef}
              value={formData.holdingId}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, holdingId: e.target.value }));
                // Auto-populate price with current price if available
                const holding = holdings.find(h => h.id === e.target.value);
                if (holding?.currentPrice) {
                  setFormData(prev => ({ ...prev, pricePerShare: holding.currentPrice!.toString() }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              disabled={!!selectedHolding}
            >
              <option value="">Select a stock...</option>
              {holdings.map((holding) => (
                <option key={holding.id} value={holding.id}>
                  {holding.ticker} - {holding.shares} shares @ ${holding.costBasis.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Current Position Summary (if stock selected) */}
          {selectedStock && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Current Position</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Shares:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {selectedStock.shares.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Avg Cost:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    ${selectedStock.costBasis.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Shares */}
            <div>
              <label htmlFor="shares-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shares
              </label>
              <input
                id="shares-input"
                name="shares"
                type="number"
                step="0.001"
                min="0"
                value={formData.shares}
                onChange={(e) => setFormData(prev => ({ ...prev, shares: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
                required
                aria-describedby="shares-help"
              />
              <p id="shares-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Number of shares to add
              </p>
            </div>

            {/* Price Per Share */}
            <div>
              <label htmlFor="price-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Per Share
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="price-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePerShare}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerShare: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  required
                  aria-describedby="price-help"
                />
              </div>
              <p id="price-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Purchase price per share
              </p>
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label htmlFor="date-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purchase Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="date-input"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Purchase Summary */}
          {totalCost > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Purchase Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Total Cost:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {newAverageCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">New Avg Cost:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      ${newAverageCost.toFixed(2)}
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
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              ref={submitButtonRef}
              type="submit"
              disabled={loading || !formData.holdingId || !formData.shares || !formData.pricePerShare}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:text-gray-500"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                'Add Purchase'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}