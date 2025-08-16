'use client';

import { useState } from 'react';
import { DataSourceIndicator } from '@/components/shared/DataSourceIndicator';
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
  currentValue: number;
  costBasisTotal: number;
  gainLoss: number;
  gainLossPercent: number;
  isPriceReal?: boolean;
  priceAge?: number | null;
  dataSource?: 'polygon' | 'simulated' | 'cost-basis-fallback' | 'cache';
}

interface HoldingsListProps {
  holdings: Holding[];
  onEdit: (holding: Holding) => void;
  onDelete: (holding: Holding) => void;
  onQuickPurchase?: (holding: Holding) => void;
  onRecordDividend?: (holding: Holding) => void;
  onRefreshPrices?: () => Promise<void>;
}

export function HoldingsList({ holdings, onEdit, onDelete, onQuickPurchase, onRecordDividend, onRefreshPrices }: HoldingsListProps) {
  const [sortField, setSortField] = useState<keyof Holding>('ticker');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSort = (field: keyof Holding) => {
    // Sorting functionality for holdings table
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorting implementation for holdings table
  const sortedHoldings = [...holdings].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle string comparisons
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: keyof Holding }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Determine overall data source for the portfolio
  const getOverallDataSource = () => {
    if (holdings.length === 0) return 'polygon';
    
    const sources = holdings.map(h => h.dataSource).filter(Boolean) as string[];
    if (sources.every(s => s === 'polygon')) return 'polygon';
    if (sources.some(s => s === 'cost-basis-fallback')) return 'cost-basis-fallback';
    if (sources.some(s => s === 'simulated')) return 'simulated';
    return 'polygon';
  };

  const getOldestPriceAge = () => {
    const ages = holdings.map(h => h.priceAge).filter(age => age !== null && age !== undefined) as number[];
    return ages.length > 0 ? Math.max(...ages) : null;
  };

  const handleRefreshPrices = async () => {
    if (!onRefreshPrices || refreshing) return;
    
    setRefreshing(true);
    try {
      await onRefreshPrices();
    } catch (error) {
      logger.error('Failed to refresh prices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header with data source indicator and refresh button */}
      {holdings.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <DataSourceIndicator 
            dataSource={getOverallDataSource() as any}
            priceAge={getOldestPriceAge()}
            variant="full"
            showDetails={true}
            onRefresh={handleRefreshPrices}
          />
          {onRefreshPrices && (
            <button
              onClick={handleRefreshPrices}
              disabled={refreshing}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              aria-label="Refresh stock prices"
            >
              {refreshing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Prices</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('ticker')}
              >
                <div className="flex items-center space-x-1">
                  <span>Symbol</span>
                  <SortIcon field="ticker" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('shares')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shares</span>
                  <SortIcon field="shares" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('costBasis')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cost Basis</span>
                  <SortIcon field="costBasis" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('currentPrice')}
              >
                <div className="flex items-center space-x-1">
                  <span>Current Price</span>
                  <SortIcon field="currentPrice" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('currentValue')}
              >
                <div className="flex items-center space-x-1">
                  <span>Current Value</span>
                  <SortIcon field="currentValue" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('gainLoss')}
              >
                <div className="flex items-center space-x-1">
                  <span>Gain/Loss</span>
                  <SortIcon field="gainLoss" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort('dividendYield')}
              >
                <div className="flex items-center space-x-1">
                  <span>Yield</span>
                  <SortIcon field="dividendYield" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedHoldings.map((holding) => (
              <tr 
                key={holding.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {holding.ticker}
                    </div>
                    {holding.sector && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {holding.sector}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {holding.shares.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {formatCurrency(holding.costBasis)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  <div className="flex flex-col space-y-1">
                    <span>
                      {holding.currentPrice ? formatCurrency(holding.currentPrice) : formatCurrency(holding.costBasis)}
                    </span>
                    {holding.dataSource && (
                      <DataSourceIndicator 
                        dataSource={holding.dataSource} 
                        priceAge={holding.priceAge}
                        variant="compact"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {formatCurrency(holding.currentValue)}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <div className={`font-medium ${
                      holding.gainLoss >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(holding.gainLoss)}
                    </div>
                    <div className={`text-xs ${
                      holding.gainLossPercent >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercentage(holding.gainLossPercent)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {holding.dividendYield ? `${holding.dividendYield.toFixed(2)}%` : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {onQuickPurchase && (
                      <button
                        onClick={() => onQuickPurchase(holding)}
                        className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Quick Add Purchase"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}
                    {onRecordDividend && (
                      <button
                        onClick={() => onRecordDividend(holding)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        title="Record Dividend Payment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(holding)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Edit Holding"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(holding)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete Holding"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Additional holding details on mobile */}
      <div className="block md:hidden">
        {sortedHoldings.map((holding) => (
          <div key={`mobile-${holding.id}`} className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{holding.ticker}</div>
                {holding.sector && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">{holding.sector}</div>
                )}
              </div>
              <div className="flex space-x-1">
                {onQuickPurchase && (
                  <button
                    onClick={() => onQuickPurchase(holding)}
                    className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                    title="Quick Add Purchase"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                )}
                {onRecordDividend && (
                  <button
                    onClick={() => onRecordDividend(holding)}
                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                    title="Record Dividend Payment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => onEdit(holding)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(holding)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Shares:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{holding.shares.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Value:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{formatCurrency(holding.currentValue)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{formatCurrency(holding.costBasis)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Gain/Loss:</span>
                <span className={`ml-1 ${
                  holding.gainLoss >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(holding.gainLoss)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}