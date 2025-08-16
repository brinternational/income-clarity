'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../forms/Button';
import { Input } from '../forms/Input';
import { Select } from '../forms/Select';
import { useLoading, LOADING_KEYS } from '../../contexts/LoadingContext';
import { LoadingButton, InlineLoading } from '../ui/GlobalLoadingIndicator';
import { TableSkeleton, TextSkeleton } from '../ui/LoadingSkeleton';

interface StockPrice {
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

interface PriceUpdateResult {
  success: boolean;
  message: string;
  data?: StockPrice;
}

export const ManualPriceUpdateForm: React.FC = () => {
  const [formData, setFormData] = useState<StockPrice>({
    ticker: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
    adjustedClose: 0
  });

  const [result, setResult] = useState<PriceUpdateResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [recentUpdates, setRecentUpdates] = useState<StockPrice[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  const { setLoading, isLoading } = useLoading();

  // Load recent updates on component mount
  useEffect(() => {
    loadRecentUpdates();
  }, []);

  const loadRecentUpdates = async () => {
    setIsLoadingRecent(true);
    try {
      const response = await fetch('/api/stock-price/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentUpdates(data.prices || []);
      }
    } catch (error) {
      // console.error('Failed to load recent updates:', error);
    // } finally {
      setIsLoadingRecent(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Ticker validation
    if (!formData.ticker || formData.ticker.trim().length === 0) {
      errors.ticker = 'Ticker symbol is required';
    } else if (formData.ticker.length > 10) {
      errors.ticker = 'Ticker symbol too long (max 10 characters)';
    }

    // Date validation
    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const dateValue = new Date(formData.date);
      const today = new Date();
      if (dateValue > today) {
        errors.date = 'Date cannot be in the future';
      }
    }

    // Price validations
    if (formData.open <= 0) {
      errors.open = 'Opening price must be greater than 0';
    }
    if (formData.high <= 0) {
      errors.high = 'High price must be greater than 0';
    }
    if (formData.low <= 0) {
      errors.low = 'Low price must be greater than 0';
    }
    if (formData.close <= 0) {
      errors.close = 'Closing price must be greater than 0';
    }
    if (formData.volume < 0) {
      errors.volume = 'Volume cannot be negative';
    }

    // Logical price validations
    if (formData.high < formData.low) {
      errors.high = 'High price cannot be less than low price';
    }
    if (formData.high < formData.open) {
      errors.high = 'High price cannot be less than opening price';
    }
    if (formData.high < formData.close) {
      errors.high = 'High price cannot be less than closing price';
    }
    if (formData.low > formData.open) {
      errors.low = 'Low price cannot be greater than opening price';
    }
    if (formData.low > formData.close) {
      errors.low = 'Low price cannot be greater than closing price';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof StockPrice, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'ticker' || field === 'date' ? value : Number(value)
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-calculate adjusted close if not provided
    if (field === 'close' && typeof value === 'number' && value > 0) {
      if (!formData.adjustedClose || formData.adjustedClose === 0) {
        setFormData(prev => ({
          ...prev,
          adjustedClose: value
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(LOADING_KEYS.PRICE_UPDATE, true, 'Updating price data...');
    setResult(null);

    try {
      const response = await fetch('/api/stock-price/manual-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ticker: formData.ticker.toUpperCase().trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Stock price updated successfully',
          data: data.price
        });

        // Reset form
        setFormData({
          ticker: '',
          date: new Date().toISOString().split('T')[0],
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 0,
          adjustedClose: 0
        });

        // Reload recent updates
        loadRecentUpdates();
      } else {
        setResult({
          success: false,
          message: data.message || 'Failed to update stock price'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error - please try again'
      });
    } finally {
      setLoading(LOADING_KEYS.PRICE_UPDATE, false);
    }
  };

  const handleQuickFill = (price: number) => {
    setFormData(prev => ({
      ...prev,
      open: price,
      high: price * 1.02, // 2% higher
      low: price * 0.98,  // 2% lower
      close: price,
      adjustedClose: price
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📊 Manual Price Update
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Admin Interface
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Ticker Symbol"
              type="text"
              value={formData.ticker}
              onChange={(e) => handleInputChange('ticker', e.target.value)}
              placeholder="e.g., AAPL"
              required
              className="uppercase"
              error={validationErrors.ticker}
            />
          </div>

          <div>
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              error={validationErrors.date}
            />
          </div>
        </div>

        {/* Price Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Price Data
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                label="Opening Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.open || ''}
                onChange={(e) => handleInputChange('open', e.target.value)}
                placeholder="0.00"
                required
                error={validationErrors.open}
              />
            </div>

            <div>
              <Input
                label="High Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.high || ''}
                onChange={(e) => handleInputChange('high', e.target.value)}
                placeholder="0.00"
                required
                error={validationErrors.high}
              />
            </div>

            <div>
              <Input
                label="Low Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.low || ''}
                onChange={(e) => handleInputChange('low', e.target.value)}
                placeholder="0.00"
                required
                error={validationErrors.low}
              />
            </div>

            <div>
              <Input
                label="Closing Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.close || ''}
                onChange={(e) => handleInputChange('close', e.target.value)}
                placeholder="0.00"
                required
                error={validationErrors.close}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Volume"
                type="number"
                min="0"
                value={formData.volume || ''}
                onChange={(e) => handleInputChange('volume', e.target.value)}
                placeholder="0"
                required
                error={validationErrors.volume}
              />
            </div>

            <div>
              <Input
                label="Adjusted Close ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.adjustedClose || ''}
                onChange={(e) => handleInputChange('adjustedClose', e.target.value)}
                placeholder="Auto-calculated from close"
                error={validationErrors.adjustedClose}
              />
            </div>
          </div>
        </div>

        {/* Quick Fill Options */}
        <div className="border-t dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Fill (sets close price and estimates OHLC):
          </h4>
          <div className="flex flex-wrap gap-2">
            {[50, 100, 150, 200, 250].map((price) => (
              <Button
                key={price}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill(price)}
                disabled={isLoading(LOADING_KEYS.PRICE_UPDATE)}
              >
                ${price}
              </Button>
            ))}
          </div>
        </div>

        {/* Result Messages */}
        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className={`text-sm font-medium ${
              result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
            }`}>
              {result.success ? '✅ Success' : '❌ Error'}
            </div>
            <div className={`text-sm ${
              result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {result.message}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            isLoading={isLoading(LOADING_KEYS.PRICE_UPDATE)}
            loadingText="Updating..."
            className="min-w-[150px]"
          >
            Update Price
          </LoadingButton>
        </div>
      </form>

      {/* Recent Updates */}
      {(recentUpdates.length > 0 || isLoadingRecent) && (
        <div className="mt-8 border-t dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Updates
            </h3>
            <LoadingButton
              onClick={loadRecentUpdates}
              isLoading={isLoadingRecent}
              loadingText="Loading..."
              disabled={isLoading(LOADING_KEYS.PRICE_UPDATE)}
              className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600"
            >
              🔄 Refresh
            </LoadingButton>
          </div>
          {isLoadingRecent ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Ticker
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Close
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentUpdates.slice(0, 5).map((price, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                      {price.ticker}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(price.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                      ${price.close.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {price.volume.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};