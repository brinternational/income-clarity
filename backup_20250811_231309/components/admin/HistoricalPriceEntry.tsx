'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../forms/Button';
import { Input } from '../forms/Input';
import { Select } from '../forms/Select';

interface HistoricalPriceData {
  ticker: string;
  startDate: string;
  endDate: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjustedClose?: number;
  }>;
}

interface PriceChartData {
  date: string;
  close: number;
  volume: number;
}

export const HistoricalPriceEntry: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<PriceChartData[]>([]);
  const [existingTickers, setExistingTickers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');

  // Load existing tickers on component mount
  useEffect(() => {
    loadExistingTickers();
  }, []);

  // Auto-set date range when preset is selected
  useEffect(() => {
    const today = new Date();
    let start = new Date();
    
    switch (dateRange) {
      case '7d':
        start.setDate(today.getDate() - 7);
        break;
      case '30d':
        start.setDate(today.getDate() - 30);
        break;
      case '90d':
        start.setDate(today.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        return; // Don't auto-set for custom range
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, [dateRange]);

  // Load historical data when ticker or date range changes
  useEffect(() => {
    if (selectedTicker && startDate && endDate) {
      loadHistoricalData();
    }
  }, [selectedTicker, startDate, endDate]);

  const loadExistingTickers = async () => {
    try {
      const response = await fetch('/api/stock-price/tickers');
      if (response.ok) {
        const data = await response.json();
        setExistingTickers(data.tickers || []);
      }
    } catch (error) {
      // Error handled by emergency recovery script;

  const loadHistoricalData = async () => {
    if (!selectedTicker || !startDate || !endDate) return;

    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        ticker: selectedTicker,
        startDate,
        endDate
      });

      const response = await fetch(`/api/stock-price/historical?${params}`);
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data.prices || []);
      } else {
        setHistoricalData([]);
      }
    } catch (error) {
      // Error handled by emergency recovery script finally {
      setIsLoading(false);
    }
  };

  const generateMockData = async () => {
    if (!selectedTicker || !startDate || !endDate) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/stock-price/generate-historical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: selectedTicker,
          startDate,
          endDate,
          startPrice: 100, // Default starting price
          volatility: 0.02 // 2% daily volatility
        })
      });

      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data.prices || []);
      }
    } catch (error) {
      // console.error('Failed to generate mock data:', error);
    // } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    if (historicalData.length === 0) return null;

    const prices = historicalData.map(d => d.close);
    const volumes = historicalData.map(d => d.volume);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      minPrice,
      maxPrice,
      avgPrice,
      avgVolume,
      totalReturn,
      dataPoints: historicalData.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          📈 Historical Price Data
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          View & Manage Historical Prices
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ticker Symbol
          </label>
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Ticker</option>
            {existingTickers.map(ticker => (
              <option key={ticker} value={ticker}>{ticker}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div>
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={dateRange !== 'custom'}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={dateRange !== 'custom'}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <Button
          onClick={loadHistoricalData}
          disabled={!selectedTicker || !startDate || !endDate || isLoading}
          variant="outline"
        >
          🔄 Refresh Data
        </Button>

        <Button
          onClick={generateMockData}
          disabled={!selectedTicker || !startDate || !endDate || isLoading}
          variant="outline"
        >
          🎲 Generate Mock Data
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">Data Points</div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{stats.dataPoints}</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-xs text-green-600 dark:text-green-300 font-medium">Min Price</div>
            <div className="text-lg font-bold text-green-900 dark:text-green-100">${stats.minPrice.toFixed(2)}</div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-xs text-red-600 dark:text-red-300 font-medium">Max Price</div>
            <div className="text-lg font-bold text-red-900 dark:text-red-100">${stats.maxPrice.toFixed(2)}</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="text-xs text-purple-600 dark:text-purple-300 font-medium">Avg Price</div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">${stats.avgPrice.toFixed(2)}</div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <div className="text-xs text-orange-600 dark:text-orange-300 font-medium">Avg Volume</div>
            <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
              {(stats.avgVolume / 1000000).toFixed(1)}M
            </div>
          </div>

          <div className={`rounded-lg p-3 ${
            stats.totalReturn >= 0 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className={`text-xs font-medium ${
              stats.totalReturn >= 0 
                ? 'text-green-600 dark:text-green-300'
                : 'text-red-600 dark:text-red-300'
            }`}>
              Total Return
            </div>
            <div className={`text-lg font-bold ${
              stats.totalReturn >= 0 
                ? 'text-green-900 dark:text-green-100'
                : 'text-red-900 dark:text-red-100'
            }`}>
              {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Simple Price Chart */}
      {historicalData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Price Chart
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64 flex items-end space-x-1 overflow-x-auto">
            {historicalData.map((dataPoint, index) => {
              const maxPrice = Math.max(...historicalData.map(d => d.close));
              const minPrice = Math.min(...historicalData.map(d => d.close));
              const height = ((dataPoint.close - minPrice) / (maxPrice - minPrice)) * 200;
              
              return (
                <div
                  key={index}
                  className="bg-blue-500 hover:bg-blue-600 transition-colors min-w-[4px] rounded-t group relative"
                  style={{ height: `${Math.max(height, 4)}px` }}
                  title={`${dataPoint.date}: $${dataPoint.close.toFixed(2)}`}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {new Date(dataPoint.date).toLocaleDateString()}<br/>
                    ${dataPoint.close.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{historicalData[0]?.date && new Date(historicalData[0].date).toLocaleDateString()}</span>
            <span>{historicalData[historicalData.length - 1]?.date && 
              new Date(historicalData[historicalData.length - 1].date).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Historical Data Table */}
      {historicalData.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Historical Data ({historicalData.length} records)
          </h4>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Close
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Volume
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Change %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {historicalData.map((dataPoint, index) => {
                  const prevClose = index > 0 ? historicalData[index - 1].close : dataPoint.close;
                  const changePercent = ((dataPoint.close - prevClose) / prevClose) * 100;
                  
                  return (
                    <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2 text-gray-900 dark:text-white">
                        {new Date(dataPoint.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">
                        ${dataPoint.close.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                        {dataPoint.volume.toLocaleString()}
                      </td>
                      <td className={`px-3 py-2 font-medium ${
                        index === 0 ? 'text-gray-500 dark:text-gray-400' :
                        changePercent >= 0 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {index === 0 ? '—' : 
                          `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading historical data...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && historicalData.length === 0 && selectedTicker && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Historical Data Found
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No price data exists for {selectedTicker} in the selected date range.
          </div>
          <Button onClick={generateMockData} variant="outline" size="sm">
            Generate Sample Data
          </Button>
        </div>
      )}
    </div>
  );
};