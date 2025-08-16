'use client';

import React, { useState } from 'react';
import { Button } from '../forms/Button';
import { Select } from '../forms/Select';
import { Input } from '../forms/Input';

interface ReportConfig {
  type: 'monthly' | 'tax' | 'portfolio' | 'transactions';
  format: 'pdf' | 'csv' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  options: {
    includeCharts?: boolean;
    includeDividends?: boolean;
    includeTaxEstimates?: boolean;
    includePerformance?: boolean;
    groupByMonth?: boolean;
    filterByPortfolio?: string;
  };
}

interface ReportResult {
  success: boolean;
  message: string;
  downloadUrl?: string;
  data?: any;
}

export const ReportGenerator: React.FC = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'monthly',
    format: 'pdf',
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
      end: new Date().toISOString().split('T')[0] // Today
    },
    options: {
      includeCharts: true,
      includeDividends: true,
      includeTaxEstimates: true,
      includePerformance: true,
      groupByMonth: true
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleConfigChange = (key: keyof ReportConfig, value: any) => {
    setReportConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleOptionsChange = (key: keyof ReportConfig['options'], value: any) => {
    setReportConfig(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value
      }
    }));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setResult(null);
    setProgress(0);

    try {
      // Start report generation
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportConfig)
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: 'Report generated successfully',
          downloadUrl: data.downloadUrl,
          data: data.data
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Report generation failed'
        });
      }

    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Network error occurred'
      });
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  };

  const downloadReport = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    }
  };

  const getReportDescription = (type: string): string => {
    switch (type) {
      case 'monthly':
        return 'Monthly statement with portfolio performance, dividend income, and expense tracking';
      case 'tax':
        return '1099-DIV estimate with qualified vs. ordinary dividends and tax calculations';
      case 'portfolio':
        return 'Complete portfolio summary with asset allocation and performance metrics';
      case 'transactions':
        return 'Transaction history export with buy/sell/dividend records';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          📊 Report Generator
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Professional Reports & Exports
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Report Type
          </label>
          <select
            value={reportConfig.type}
            onChange={(e) => handleConfigChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="monthly">📅 Monthly Statement</option>
            <option value="tax">🧾 Tax Report (1099-DIV)</option>
            <option value="portfolio">📈 Portfolio Summary</option>
            <option value="transactions">📋 Transaction History</option>
          </select>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {getReportDescription(reportConfig.type)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output Format
          </label>
          <select
            value={reportConfig.format}
            onChange={(e) => handleConfigChange('format', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pdf">📄 PDF Report</option>
            <option value="csv">📊 CSV Export</option>
            <option value="json">🔧 JSON Data</option>
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Input
            label="Start Date"
            type="date"
            value={reportConfig.dateRange.start}
            onChange={(e) => handleConfigChange('dateRange', {
              ...reportConfig.dateRange,
              start: e.target.value
            })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <Input
            label="End Date"
            type="date"
            value={reportConfig.dateRange.end}
            onChange={(e) => handleConfigChange('dateRange', {
              ...reportConfig.dateRange,
              end: e.target.value
            })}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Report Options */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Report Options
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportConfig.type !== 'transactions' && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reportConfig.options.includeCharts || false}
                onChange={(e) => handleOptionsChange('includeCharts', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Charts</span>
            </label>
          )}

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={reportConfig.options.includeDividends || false}
              onChange={(e) => handleOptionsChange('includeDividends', e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Dividends</span>
          </label>

          {(reportConfig.type === 'monthly' || reportConfig.type === 'tax') && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reportConfig.options.includeTaxEstimates || false}
                onChange={(e) => handleOptionsChange('includeTaxEstimates', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Tax Estimates</span>
            </label>
          )}

          {(reportConfig.type === 'monthly' || reportConfig.type === 'portfolio') && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reportConfig.options.includePerformance || false}
                onChange={(e) => handleOptionsChange('includePerformance', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include Performance</span>
            </label>
          )}

          {reportConfig.type === 'transactions' && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reportConfig.options.groupByMonth || false}
                onChange={(e) => handleOptionsChange('groupByMonth', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Group by Month</span>
            </label>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Generating report...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`mb-6 p-4 rounded-lg border ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
            result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          }`}>
            {result.success ? '✅ Report Generated' : '❌ Generation Failed'}
          </div>
          <div className={`text-sm ${
            result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {result.message}
          </div>
          
          {result.success && result.downloadUrl && (
            <div className="mt-3">
              <Button
                onClick={downloadReport}
                size="sm"
                className="mr-2"
              >
                📥 Download Report
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button
          onClick={generateReport}
          disabled={isGenerating}
          className="min-w-[150px]"
        >
          {isGenerating ? 'Generating...' : '🚀 Generate Report'}
        </Button>
      </div>

      {/* Quick Report Templates */}
      <div className="mt-8 border-t dark:border-gray-700 pt-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Quick Report Templates
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setReportConfig({
              type: 'monthly',
              format: 'pdf',
              dateRange: {
                start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              },
              options: {
                includeCharts: true,
                includeDividends: true,
                includeTaxEstimates: true,
                includePerformance: true
              }
            })}
            className="p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white">📅 This Month</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monthly statement PDF</div>
          </button>

          <button
            onClick={() => setReportConfig({
              type: 'tax',
              format: 'pdf',
              dateRange: {
                start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              },
              options: {
                includeDividends: true,
                includeTaxEstimates: true
              }
            })}
            className="p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white">🧾 Tax Year</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">1099-DIV estimate</div>
          </button>

          <button
            onClick={() => setReportConfig({
              type: 'portfolio',
              format: 'pdf',
              dateRange: {
                start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              },
              options: {
                includeCharts: true,
                includePerformance: true,
                includeDividends: true
              }
            })}
            className="p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white">📈 Portfolio</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Complete summary</div>
          </button>

          <button
            onClick={() => setReportConfig({
              type: 'transactions',
              format: 'csv',
              dateRange: {
                start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              },
              options: {
                groupByMonth: true,
                includeDividends: true
              }
            })}
            className="p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white">📋 Export Data</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Transaction CSV</div>
          </button>
        </div>
      </div>
    </div>
  );
};