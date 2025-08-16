'use client';

import React, { useState } from 'react';
import { Button } from '../forms/Button';
import { CSVImporter } from '../../lib/import-export/CSVImporter';

interface PriceData {
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

interface BatchUploadResult {
  success: boolean;
  message: string;
  processed: number;
  errors: number;
  details?: Array<{
    ticker: string;
    date: string;
    status: 'success' | 'error';
    message?: string;
  }>;
}

export const BatchPriceUploadForm: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BatchUploadResult | null>(null);
  const [previewData, setPreviewData] = useState<PriceData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadResult(null);
    setPreviewData([]);
    setShowPreview(false);

    // Preview first few rows
    try {
      const importer = new CSVImporter();
      const result = await importer.parsePriceCSV(file);
      
      if (result.success && result.data.length > 0) {
        setPreviewData(result.data.slice(0, 5)); // Show first 5 rows
        setShowPreview(true);
      }
    } catch (error) {
      // Error handled by emergency recovery script;

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // Parse CSV file
      const importer = new CSVImporter();
      const parseResult = await importer.parsePriceCSV(selectedFile);

      if (!parseResult.success) {
        setUploadResult({
          success: false,
          message: parseResult.message || 'Failed to parse CSV file',
          processed: 0,
          errors: 1
        });
        return;
      }

      // Process in batches to avoid overwhelming the server
      const batchSize = 50;
      const batches = [];
      for (let i = 0; i < parseResult.data.length; i += batchSize) {
        batches.push(parseResult.data.slice(i, i + batchSize));
      }

      let totalProcessed = 0;
      let totalErrors = 0;
      const details: Array<{ ticker: string; date: string; status: 'success' | 'error'; message?: string }> = [];

      // Process each batch
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        try {
          const response = await fetch('/api/stock-price/batch-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prices: batch })
          });

          const batchResult = await response.json();

          if (batchResult.success) {
            totalProcessed += batchResult.processed || 0;
            totalErrors += batchResult.errors || 0;
            if (batchResult.details) {
              details.push(...batchResult.details);
            }
          } else {
            totalErrors += batch.length;
            batch.forEach(item => {
              details.push({
                ticker: item.ticker,
                date: item.date,
                status: 'error',
                message: batchResult.message || 'Batch processing failed'
              });
            });
          }
        } catch (error) {
          totalErrors += batch.length;
          batch.forEach(item => {
            details.push({
              ticker: item.ticker,
              date: item.date,
              status: 'error',
              message: 'Network error'
            });
          });
        }

        // Update progress
        setUploadProgress(Math.round(((batchIndex + 1) / batches.length) * 100));
      }

      setUploadResult({
        success: totalErrors === 0,
        message: `Processed ${totalProcessed} prices with ${totalErrors} errors`,
        processed: totalProcessed,
        errors: totalErrors,
        details: details
      });

    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed',
        processed: 0,
        errors: 1
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'ticker,date,open,high,low,close,volume,adjustedClose',
      'AAPL,2024-01-15,185.50,187.25,184.75,186.50,65432100,186.50',
      'MSFT,2024-01-15,395.00,398.50,394.25,397.75,23456789,397.75',
      'GOOGL,2024-01-15,140.25,142.10,139.80,141.50,18765432,141.50'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'price_upload_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          📁 Batch Price Upload
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
        >
          📥 Download Template
        </Button>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select CSV File
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-300
              dark:hover:file:bg-blue-800"
          />
        </div>
        
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {/* CSV Format Requirements */}
      <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          📋 CSV Format Requirements
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <p><strong>Required columns:</strong> ticker, date, open, high, low, close, volume</p>
          <p><strong>Optional columns:</strong> adjustedClose</p>
          <p><strong>Date format:</strong> YYYY-MM-DD (e.g., 2024-01-15)</p>
          <p><strong>Price format:</strong> Decimal numbers (e.g., 123.45)</p>
          <p><strong>Volume format:</strong> Integer numbers (e.g., 1000000)</p>
        </div>
      </div>

      {/* Preview Data */}
      {showPreview && previewData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            📊 Preview (first 5 rows)
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ticker</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Open</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">High</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Low</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Close</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.map((price, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800">
                    <td className="px-3 py-2 font-medium text-gray-900 dark:text-white">{price.ticker}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{price.date}</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">${price.open.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">${price.high.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">${price.low.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">${price.close.toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{price.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <div className={`mb-6 p-4 rounded-lg border ${
          uploadResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className={`text-sm font-medium mb-2 ${
            uploadResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          }`}>
            {uploadResult.success ? '✅ Upload Complete' : '❌ Upload Failed'}
          </div>
          <div className={`text-sm ${
            uploadResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {uploadResult.message}
          </div>
          
          {uploadResult.details && uploadResult.details.length > 0 && (
            <div className="mt-3">
              <details className="cursor-pointer">
                <summary className="text-sm font-medium">
                  View Details ({uploadResult.processed} processed, {uploadResult.errors} errors)
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto">
                  <div className="text-xs space-y-1">
                    {uploadResult.details.map((detail, index) => (
                      <div key={index} className={`flex items-center space-x-2 ${
                        detail.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{detail.status === 'success' ? '✅' : '❌'}</span>
                        <span>{detail.ticker} ({detail.date})</span>
                        {detail.message && <span>- {detail.message}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="min-w-[150px]"
        >
          {isUploading ? 'Uploading...' : 'Upload Prices'}
        </Button>
      </div>

      {/* Upload Tips */}
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Large files will be processed in batches of 50 prices</li>
          <li>Existing prices for the same ticker and date will be updated</li>
          <li>Invalid rows will be skipped and reported in the results</li>
          <li>Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};