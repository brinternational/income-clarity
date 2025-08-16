'use client';

import React, { useState } from 'react';
import { Upload, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button, FormField } from '../index';
import { HoldingFormData } from './AddHoldingForm';

export interface BulkImportFormProps {
  onImport: (holdings: HoldingFormData[]) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  warnings: string[];
}

const csvTemplate = `ticker,shares,avgCost,currentPrice,taxTreatment,strategy,sector
JEPI,1200,62.50,63.25,ordinary,covered_call,Financials
SCHD,800,75.00,76.50,qualified,dividend,Consumer Staples
VTI,500,220.00,225.00,qualified,growth,Technology`;

export function BulkImportForm({ onImport, onCancel, loading = false }: BulkImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState('');
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [previewData, setPreviewData] = useState<HoldingFormData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  
  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'income-clarity-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const parseCSV = (csvText: string): { data: HoldingFormData[], errors: string[], warnings: string[] } => {
    const lines = csvText.trim().split('\n');
    const errors: string[] = [];
    const warnings: string[] = [];
    const data: HoldingFormData[] = [];
    
    if (lines.length < 2) {
      errors.push('CSV file must contain at least a header row and one data row');
      return { data, errors, warnings };
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['ticker', 'shares', 'avgcost'];
    const optionalHeaders = ['currentprice', 'taxtreatment', 'strategy', 'sector'];
    
    // Check required headers
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        errors.push(`Missing required column: ${required}`);
      }
    }
    
    if (errors.length > 0) {
      return { data, errors, warnings };
    }
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          rowData[header] = values[index];
        }
      });
      
      try {
        // Validate and convert data
        const holding: HoldingFormData = {
          ticker: rowData.ticker?.toUpperCase() || '',
          shares: parseFloat(rowData.shares) || 0,
          avgCost: parseFloat(rowData.avgcost) || 0,
          currentPrice: rowData.currentprice ? parseFloat(rowData.currentprice) : undefined,
          taxTreatment: rowData.taxtreatment as any || 'qualified',
          strategy: rowData.strategy as any || 'dividend',
          sector: rowData.sector || undefined
        };
        
        // Validate ticker
        if (!holding.ticker || !/^[A-Z]{1,5}$/.test(holding.ticker)) {
          errors.push(`Row ${i + 1}: Invalid ticker symbol "${rowData.ticker}"`);
          continue;
        }
        
        // Validate shares
        if (holding.shares <= 0) {
          errors.push(`Row ${i + 1}: Shares must be greater than 0`);
          continue;
        }
        
        // Validate avgCost
        if (holding.avgCost <= 0) {
          errors.push(`Row ${i + 1}: Average cost must be greater than 0`);
          continue;
        }
        
        // Validate tax treatment
        const validTaxTreatments = ['qualified', 'ordinary', 'roc', 'mixed'];
        if (!validTaxTreatments.includes(holding.taxTreatment)) {
          warnings.push(`Row ${i + 1}: Unknown tax treatment "${rowData.taxtreatment}", defaulting to "qualified"`);
          holding.taxTreatment = 'qualified';
        }
        
        // Validate strategy
        const validStrategies = ['dividend', 'covered_call', 'growth', 'reit'];
        if (!validStrategies.includes(holding.strategy)) {
          warnings.push(`Row ${i + 1}: Unknown strategy "${rowData.strategy}", defaulting to "dividend"`);
          holding.strategy = 'dividend';
        }
        
        data.push(holding);
      } catch (error) {
        errors.push(`Row ${i + 1}: Failed to parse data - ${error}`);
      }
    }
    
    return { data, errors, warnings };
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setErrors(['Please select a CSV file']);
      return;
    }
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const { data, errors, warnings } = parseCSV(csvText);
      setPreviewData(data);
      setErrors(errors);
      setWarnings(warnings);
    };
    reader.readAsText(selectedFile);
  };
  
  const handleCsvPaste = (csvText: string) => {
    setCsvData(csvText);
    const { data, errors, warnings } = parseCSV(csvText);
    setPreviewData(data);
    setErrors(errors);
    setWarnings(warnings);
  };
  
  const handleImport = async () => {
    if (previewData.length === 0) {
      setErrors(['No valid data to import']);
      return;
    }
    
    try {
      await onImport(previewData);
    } catch (error) {
      setErrors(['Failed to import holdings: ' + (error as Error).message]);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Bulk Import Holdings
        </h2>
        <p className="text-sm text-gray-600">
          Import multiple holdings from a CSV file or paste CSV data directly
        </p>
      </div>
      
      {/* Import Method Selection */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => setImportMethod('file')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            importMethod === 'file'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setImportMethod('paste')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            importMethod === 'paste'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Paste CSV Data
        </button>
      </div>
      
      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              CSV Template Required
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Download our template to ensure your data imports correctly. Required columns: ticker, shares, avgCost.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download Template
            </Button>
          </div>
        </div>
      </div>
      
      {/* File Upload Method */}
      {importMethod === 'file' && (
        <FormField label="Select CSV File" className="mb-6">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                CSV files only
              </p>
            </div>
          </div>
        </FormField>
      )}
      
      {/* Paste CSV Method */}
      {importMethod === 'paste' && (
        <FormField label="Paste CSV Data" className="mb-6">
          <textarea
            value={csvData}
            onChange={(e) => handleCsvPaste(e.target.value)}
            placeholder="ticker,shares,avgCost,currentPrice,taxTreatment,strategy,sector&#10;JEPI,1200,62.50,63.25,ordinary,covered_call,Financials&#10;SCHD,800,75.00,76.50,qualified,dividend,Consumer Staples"
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
          />
        </FormField>
      )}
      
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900 mb-2">Import Errors</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Warnings</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Preview Data */}
      {previewData.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-1">
                Ready to Import ({previewData.length} holdings)
              </h4>
              <p className="text-sm text-green-700">
                The following holdings will be imported:
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-green-200">
                  <th className="text-left py-2 px-3 font-medium text-green-900">Ticker</th>
                  <th className="text-left py-2 px-3 font-medium text-green-900">Shares</th>
                  <th className="text-left py-2 px-3 font-medium text-green-900">Avg Cost</th>
                  <th className="text-left py-2 px-3 font-medium text-green-900">Tax Treatment</th>
                  <th className="text-left py-2 px-3 font-medium text-green-900">Strategy</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((holding, index) => (
                  <tr key={index} className="border-b border-green-100">
                    <td className="py-2 px-3 font-medium text-green-900">{holding.ticker}</td>
                    <td className="py-2 px-3 text-green-700">{holding.shares.toLocaleString()}</td>
                    <td className="py-2 px-3 text-green-700">${holding.avgCost.toFixed(2)}</td>
                    <td className="py-2 px-3 text-green-700 capitalize">{holding.taxTreatment}</td>
                    <td className="py-2 px-3 text-green-700 capitalize">{holding.strategy.replace('_', ' ')}</td>
                  </tr>
                ))}
                {previewData.length > 10 && (
                  <tr>
                    <td colSpan={5} className="py-2 px-3 text-center text-green-600 text-xs">
                      ... and {previewData.length - 10} more holdings
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={handleImport}
          disabled={previewData.length === 0 || errors.length > 0 || loading}
          loading={loading}
          fullWidth
          className="sm:flex-1"
        >
          Import {previewData.length} Holdings
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
    </div>
  );
}
