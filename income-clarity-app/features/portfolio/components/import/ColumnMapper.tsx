'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/forms/Select';
import { 
  ArrowRight, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

export interface ColumnMapperProps {
  rawData: string;
  currentMapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
}

interface DetectedColumn {
  index: number;
  name: string;
  sample: string[];
  confidence: number;
  suggestedMapping?: string;
}

const TARGET_COLUMNS = [
  { id: 'symbol', name: 'Symbol/Ticker', required: true, description: 'Stock symbol (e.g., AAPL, MSFT)' },
  { id: 'shares', name: 'Shares/Quantity', required: true, description: 'Number of shares owned' },
  { id: 'costBasis', name: 'Cost Basis/Price', required: true, description: 'Average purchase price per share' },
  { id: 'purchaseDate', name: 'Purchase Date', required: true, description: 'When the position was acquired' },
  { id: 'currentPrice', name: 'Current Price', required: false, description: 'Latest market price (optional)' },
  { id: 'dividendYield', name: 'Dividend Yield', required: false, description: 'Annual dividend yield percentage' },
  { id: 'sector', name: 'Sector/Industry', required: false, description: 'Stock sector classification' },
  { id: 'notes', name: 'Notes/Description', required: false, description: 'Additional information' }
];

export function ColumnMapper({ rawData, currentMapping, onMappingChange }: ColumnMapperProps) {
  const [detectedColumns, setDetectedColumns] = useState<DetectedColumn[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>(currentMapping);
  const [autoMappingApplied, setAutoMappingApplied] = useState(false);

  useEffect(() => {
    analyzeColumns(rawData);
  }, [rawData]);

  useEffect(() => {
    if (detectedColumns.length > 0 && !autoMappingApplied) {
      applyAutoMapping();
      setAutoMappingApplied(true);
    }
  }, [detectedColumns]);

  const analyzeColumns = (data: string) => {
    const lines = data.split('\n').filter(line => line.trim());
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    const dataRows = lines.slice(1, Math.min(6, lines.length)); // Analyze first 5 data rows

    const columns: DetectedColumn[] = headers.map((header, index) => {
      const samples = dataRows.map(row => {
        const cells = row.split(',');
        return cells[index]?.trim().replace(/['"]/g, '') || '';
      }).filter(Boolean);

      const suggestedMapping = suggestColumnMapping(header, samples);
      const confidence = calculateMappingConfidence(header, samples, suggestedMapping);

      return {
        index,
        name: header,
        sample: samples.slice(0, 3), // Show first 3 samples
        confidence,
        suggestedMapping
      };
    });

    setDetectedColumns(columns);
  };

  const suggestColumnMapping = (header: string, samples: string[]): string | undefined => {
    const headerLower = header.toLowerCase();

    // Symbol detection
    if (['symbol', 'ticker', 'stock', 'security'].some(term => headerLower.includes(term))) {
      return 'symbol';
    }

    // Shares detection
    if (['shares', 'quantity', 'qty', 'amount', 'units'].some(term => headerLower.includes(term))) {
      return 'shares';
    }

    // Price/Cost detection
    if (['price', 'cost', 'basis', 'avg', 'average'].some(term => headerLower.includes(term))) {
      return 'costBasis';
    }

    // Date detection
    if (['date', 'acquired', 'purchase', 'buy', 'bought'].some(term => headerLower.includes(term))) {
      return 'purchaseDate';
    }

    // Current price detection
    if (['current', 'market', 'latest'].some(term => headerLower.includes(term)) && 
        ['price', 'value'].some(term => headerLower.includes(term))) {
      return 'currentPrice';
    }

    // Dividend yield detection
    if (['yield', 'dividend'].some(term => headerLower.includes(term))) {
      return 'dividendYield';
    }

    // Sector detection
    if (['sector', 'industry', 'category', 'type'].some(term => headerLower.includes(term))) {
      return 'sector';
    }

    // Notes detection
    if (['note', 'description', 'memo', 'comment'].some(term => headerLower.includes(term))) {
      return 'notes';
    }

    // Data pattern analysis for better suggestions
    if (samples.length > 0) {
      const firstSample = samples[0];
      
      // Check if it looks like a stock symbol
      if (/^[A-Z]{1,5}$/.test(firstSample)) {
        return 'symbol';
      }
      
      // Check if it looks like a number (shares or price)
      if (/^\d+(\.\d+)?$/.test(firstSample)) {
        // If it's a whole number, probably shares
        if (!firstSample.includes('.')) {
          return 'shares';
        }
        // If it's a decimal, could be price
        return 'costBasis';
      }
      
      // Check if it looks like a date
      if (/\d{1,4}[/-]\d{1,2}[/-]\d{1,4}/.test(firstSample)) {
        return 'purchaseDate';
      }
    }

    return undefined;
  };

  const calculateMappingConfidence = (header: string, samples: string[], suggestion?: string): number => {
    if (!suggestion) return 0;

    let confidence = 0;

    // Header name confidence
    const headerLower = header.toLowerCase();
    const suggestionTerms = {
      symbol: ['symbol', 'ticker', 'stock'],
      shares: ['shares', 'quantity', 'qty'],
      costBasis: ['price', 'cost', 'basis'],
      purchaseDate: ['date', 'purchase', 'acquired'],
      currentPrice: ['current', 'market'],
      dividendYield: ['yield', 'dividend'],
      sector: ['sector', 'industry'],
      notes: ['notes', 'description']
    };

    const terms = suggestionTerms[suggestion as keyof typeof suggestionTerms] || [];
    if (terms.some(term => headerLower.includes(term))) {
      confidence += 50;
    }

    // Data pattern confidence
    if (samples.length > 0) {
      let patternMatches = 0;
      
      samples.forEach(sample => {
        switch (suggestion) {
          case 'symbol':
            if (/^[A-Z]{1,5}$/.test(sample.toUpperCase())) patternMatches++;
            break;
          case 'shares':
            if (/^\d+$/.test(sample)) patternMatches++;
            break;
          case 'costBasis':
          case 'currentPrice':
            if (/^\d+(\.\d+)?$/.test(sample)) patternMatches++;
            break;
          case 'purchaseDate':
            if (!isNaN(Date.parse(sample))) patternMatches++;
            break;
          case 'dividendYield':
            if (/^\d+(\.\d+)?%?$/.test(sample)) patternMatches++;
            break;
        }
      });
      
      confidence += (patternMatches / samples.length) * 40;
    }

    return Math.min(confidence, 100);
  };

  const applyAutoMapping = () => {
    const autoMapping: Record<string, string> = {};
    
    // Sort by confidence and apply highest confidence mappings first
    const sortedColumns = [...detectedColumns].sort((a, b) => b.confidence - a.confidence);
    const usedTargets = new Set<string>();
    
    sortedColumns.forEach(column => {
      if (column.suggestedMapping && 
          column.confidence > 60 && 
          !usedTargets.has(column.suggestedMapping)) {
        autoMapping[column.suggestedMapping] = column.name;
        usedTargets.add(column.suggestedMapping);
      }
    });
    
    setMapping(autoMapping);
  };

  const handleMappingChange = (targetColumn: string, sourceColumn: string) => {
    const newMapping = { ...mapping };
    
    if (sourceColumn === '') {
      delete newMapping[targetColumn];
    } else {
      // Remove the source column from any existing mappings
      Object.keys(newMapping).forEach(key => {
        if (newMapping[key] === sourceColumn) {
          delete newMapping[key];
        }
      });
      newMapping[targetColumn] = sourceColumn;
    }
    
    setMapping(newMapping);
  };

  const handleApplyMapping = () => {
    onMappingChange(mapping);
  };

  const resetMapping = () => {
    setMapping({});
  };

  const getUnmappedColumns = () => {
    const mappedSources = new Set(Object.values(mapping));
    return detectedColumns.filter(col => !mappedSources.has(col.name));
  };

  const getMappingStatus = () => {
    const requiredColumns = TARGET_COLUMNS.filter(col => col.required);
    const mappedRequired = requiredColumns.filter(col => mapping[col.id]);
    
    return {
      requiredMapped: mappedRequired.length,
      totalRequired: requiredColumns.length,
      isComplete: mappedRequired.length === requiredColumns.length
    };
  };

  const status = getMappingStatus();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Map Your Columns</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Map your data columns to the required portfolio fields. Required fields are marked with *.
        </p>
      </div>

      {/* Status Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {status.isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <div className="font-medium">
                Mapping Status: {status.requiredMapped}/{status.totalRequired} required fields mapped
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {detectedColumns.length} columns detected in your data
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetMapping} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={applyAutoMapping} size="sm">
              Auto-Map
            </Button>
          </div>
        </div>
      </Card>

      {/* Column Mapping Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Columns */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Portfolio Fields</h3>
          <div className="space-y-4">
            {TARGET_COLUMNS.map(targetCol => {
              const mappedSource = mapping[targetCol.id];
              const sourceColumn = detectedColumns.find(col => col.name === mappedSource);
              
              return (
                <div key={targetCol.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {targetCol.name}
                        {targetCol.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      {targetCol.description && (
                        <div className="relative group">
                          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {targetCol.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Select
                    value={mappedSource || ''}
                    onChange={(e) => handleMappingChange(targetCol.id, e.target.value)}
                    options={[
                      { value: '', label: 'Select column...' },
                      ...getUnmappedColumns().map(col => ({
                        value: col.name,
                        label: col.name
                      })),
                      ...(mappedSource ? [{ value: mappedSource, label: mappedSource }] : [])
                    ]}
                    className="w-full"
                  />
                  
                  {sourceColumn && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Sample: {sourceColumn.sample.join(', ')}
                      {sourceColumn.confidence > 0 && (
                        <span className="ml-2">
                          (Confidence: {Math.round(sourceColumn.confidence)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Detected Columns */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Detected Columns</h3>
          <div className="space-y-3">
            {detectedColumns.map(column => {
              const isMapped = Object.values(mapping).includes(column.name);
              
              return (
                <div 
                  key={column.index}
                  className={`
                    p-3 rounded-lg border transition-colors
                    ${isMapped 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{column.name}</div>
                    {isMapped && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Sample: {column.sample.join(', ')}
                  </div>
                  
                  {column.suggestedMapping && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Suggested: {TARGET_COLUMNS.find(col => col.id === column.suggestedMapping)?.name}
                      {column.confidence > 0 && (
                        <span className="ml-2">({Math.round(column.confidence)}%)</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Apply Button */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {status.isComplete 
              ? 'All required fields mapped. Ready to preview your data.'
              : `Please map ${status.totalRequired - status.requiredMapped} more required field${status.totalRequired - status.requiredMapped !== 1 ? 's' : ''}.`
            }
          </div>
          <Button
            onClick={handleApplyMapping}
            disabled={!status.isComplete}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Apply Mapping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}