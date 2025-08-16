'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileText, 
  Database, 
  Settings, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Trash2
} from 'lucide-react';
import { ImportMethodSelector } from './import/ImportMethodSelector';
import { FileUploader } from './import/FileUploader';
import { DataPreview } from './import/DataPreview';
import { ColumnMapper } from './import/ColumnMapper';
import { ImportSummary } from './import/ImportSummary';
import { ImportHistory } from './import/ImportHistory';
import { usePortfolioImport } from '@/hooks/usePortfolioImport';
import { logger } from '@/lib/logger';

export interface ImportWizardProps {
  onComplete?: (result: ImportResult) => void;
}

export interface ImportData {
  id: string;
  symbol: string;
  shares: number;
  costBasis: number;
  purchaseDate: string;
  currentPrice?: number;
  dividendYield?: number;
  sector?: string;
  notes?: string;
  errors?: string[];
  warnings?: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: number;
  warnings: number;
  details: string[];
}

export interface ImportMethod {
  id: 'csv' | 'paste' | 'json' | 'broker';
  name: string;
  description: string;
  icon: React.ReactNode;
}

const WIZARD_STEPS = [
  { id: 'method', name: 'Import Method', icon: Upload },
  { id: 'upload', name: 'Upload Data', icon: FileText },
  { id: 'map', name: 'Map Columns', icon: Settings },
  { id: 'preview', name: 'Preview & Validate', icon: Database },
  { id: 'confirm', name: 'Import & Complete', icon: CheckCircle },
] as const;

type WizardStep = typeof WIZARD_STEPS[number]['id'];

export function ImportWizard({ onComplete }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<ImportMethod | null>(null);
  const [rawData, setRawData] = useState<string>('');
  const [parsedData, setParsedData] = useState<ImportData[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const {
    validateData,
    importData,
    getImportHistory,
    deleteImport,
    loading,
    error
  } = usePortfolioImport();

  const getCurrentStepIndex = () => 
    WIZARD_STEPS.findIndex(step => step.id === currentStep);

  const goToStep = (stepId: WizardStep) => {
    setCurrentStep(stepId);
  };

  const goNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[currentIndex + 1].id);
    }
  };

  const goBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentIndex - 1].id);
    }
  };

  const handleMethodSelect = (method: ImportMethod) => {
    setSelectedMethod(method);
    goNext();
  };

  const handleDataUpload = useCallback(async (data: string) => {
    setRawData(data);
    
    // Parse and validate the data
    try {
      const parsed = await validateData(data, selectedMethod?.id || 'csv');
      setParsedData(parsed);
      
      // Auto-detect column mapping if possible
      if (selectedMethod?.id === 'csv') {
        const mapping = autoDetectColumns(data);
        setColumnMapping(mapping);
      }
      
      goNext();
    } catch (error) {
      logger.error('Error parsing data:', error);
    }
  }, [selectedMethod, validateData]);

  const handleColumnMapping = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    
    // Re-parse data with new mapping
    try {
      const reparsed = applyColumnMapping(rawData, mapping);
      setParsedData(reparsed);
      goNext();
    } catch (error) {
      logger.error('Error applying column mapping:', error);
    }
  };

  const handleImportConfirm = async () => {
    try {
      const result = await importData(parsedData);
      setImportResult(result);
      goNext();
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      logger.error('Import failed:', error);
    }
  };

  const resetWizard = () => {
    setCurrentStep('method');
    setSelectedMethod(null);
    setRawData('');
    setParsedData([]);
    setColumnMapping({});
    setImportResult(null);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'method':
        return selectedMethod !== null;
      case 'upload':
        return rawData.length > 0;
      case 'map':
        return Object.keys(columnMapping).length > 0;
      case 'preview':
        return parsedData.length > 0 && parsedData.some(item => !item.errors?.length);
      default:
        return true;
    }
  };

  if (showHistory) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Import History</h2>
          <Button variant="outline" onClick={() => setShowHistory(false)}>
            Back to Import
          </Button>
        </div>
        <ImportHistory 
          onRestore={(importId) => {
            // Handle restore logic
            setShowHistory(false);
          }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = getCurrentStepIndex() > index;
            const isClickable = index <= getCurrentStepIndex();

            return (
              <div 
                key={step.id}
                className="flex items-center"
              >
                <button
                  onClick={() => isClickable && goToStep(step.id)}
                  disabled={!isClickable}
                  className={`
                    flex items-center space-x-2 p-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                      : isCompleted
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }
                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium hidden sm:block">
                    {step.name}
                  </span>
                </button>
                {index < WIZARD_STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6">
        {currentStep === 'method' && (
          <ImportMethodSelector 
            onSelect={handleMethodSelect}
            selectedMethod={selectedMethod}
          />
        )}

        {currentStep === 'upload' && selectedMethod && (
          <FileUploader
            method={selectedMethod}
            onDataUpload={handleDataUpload}
            loading={loading}
          />
        )}

        {currentStep === 'map' && (
          <ColumnMapper
            rawData={rawData}
            currentMapping={columnMapping}
            onMappingChange={handleColumnMapping}
          />
        )}

        {currentStep === 'preview' && (
          <DataPreview
            data={parsedData}
            onEdit={(editedData) => setParsedData(editedData)}
            onValidate={() => {
              // Re-validate data
              const validated = parsedData.map(item => ({
                ...item,
                errors: validateImportItem(item),
                warnings: getImportWarnings(item)
              }));
              setParsedData(validated);
            }}
          />
        )}

        {currentStep === 'confirm' && importResult && (
          <ImportSummary
            result={importResult}
            onStartOver={resetWizard}
            onViewPortfolio={() => {
              window.location.href = '/portfolio';
            }}
          />
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowHistory(true)}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Import History</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {currentStep !== 'method' && currentStep !== 'confirm' && (
              <Button variant="outline" onClick={goBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep === 'confirm' && importResult ? (
              <Button onClick={resetWizard}>
                Import Another Portfolio
              </Button>
            ) : currentStep === 'preview' ? (
              <Button 
                onClick={handleImportConfirm}
                disabled={!canGoNext() || loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Importing...' : 'Import Portfolio'}
              </Button>
            ) : (
              <Button 
                onClick={goNext}
                disabled={!canGoNext()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper functions
function autoDetectColumns(csvData: string): Record<string, string> {
  const lines = csvData.split('\n');
  if (lines.length === 0) return {};

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const mapping: Record<string, string> = {};

  // Common column mappings
  const columnMappings = {
    symbol: ['symbol', 'ticker', 'stock', 'security'],
    shares: ['shares', 'quantity', 'qty', 'amount'],
    costBasis: ['cost', 'basis', 'price', 'avgcost', 'average_cost'],
    purchaseDate: ['date', 'purchase_date', 'buy_date', 'acquired'],
    currentPrice: ['current', 'current_price', 'market_price', 'price'],
    dividendYield: ['yield', 'dividend_yield', 'div_yield'],
    sector: ['sector', 'industry', 'category'],
    notes: ['notes', 'description', 'memo']
  };

  for (const [targetCol, possibleNames] of Object.entries(columnMappings)) {
    const matchedHeader = headers.find(h => 
      possibleNames.some(name => h.includes(name))
    );
    if (matchedHeader) {
      mapping[targetCol] = matchedHeader;
    }
  }

  return mapping;
}

function applyColumnMapping(rawData: string, mapping: Record<string, string>): ImportData[] {
  // This would parse the CSV with the given column mapping
  // Implementation would depend on the specific CSV parsing logic
  return [];
}

function validateImportItem(item: ImportData): string[] {
  const errors: string[] = [];
  
  if (!item.symbol || item.symbol.trim() === '') {
    errors.push('Symbol is required');
  }
  
  if (!item.shares || item.shares <= 0) {
    errors.push('Shares must be greater than 0');
  }
  
  if (!item.costBasis || item.costBasis <= 0) {
    errors.push('Cost basis must be greater than 0');
  }
  
  if (!item.purchaseDate) {
    errors.push('Purchase date is required');
  } else if (isNaN(Date.parse(item.purchaseDate))) {
    errors.push('Invalid purchase date format');
  }
  
  return errors;
}

function getImportWarnings(item: ImportData): string[] {
  const warnings: string[] = [];
  
  if (!item.currentPrice) {
    warnings.push('Current price will be fetched automatically');
  }
  
  if (!item.sector) {
    warnings.push('Sector information will be populated from market data');
  }
  
  return warnings;
}