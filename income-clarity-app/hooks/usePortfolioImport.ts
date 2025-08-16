'use client';

import { useState, useCallback } from 'react';
import { ImportData, ImportResult } from '@/features/portfolio/components/ImportWizard';
import { portfolioImportService } from '@/features/portfolio/services/portfolio-import.service';
import { logger } from '@/lib/logger';

export interface ImportHistoryItem {
  id: string;
  timestamp: string;
  method: string;
  recordsImported: number;
  recordsSkipped: number;
  recordsWithErrors: number;
  status: 'completed' | 'partial' | 'failed';
  fileName?: string;
  size: string;
}

export function usePortfolioImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateData = useCallback(async (
    rawData: string, 
    method: 'csv' | 'paste' | 'json' | 'broker'
  ): Promise<ImportData[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await portfolioImportService.validateData(rawData, method);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const importData = useCallback(async (data: ImportData[]): Promise<ImportResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await portfolioImportService.importData(data);
      
      // Save import history
      if (typeof window !== 'undefined') {
        const historyItem: ImportHistoryItem = {
          id: `import-${Date.now()}`,
          timestamp: new Date().toISOString(),
          method: 'manual', // Would be determined by the actual import method
          recordsImported: result.imported,
          recordsSkipped: 0,
          recordsWithErrors: result.errors,
          status: result.success ? 'completed' : result.imported > 0 ? 'partial' : 'failed',
          size: `${Math.round(JSON.stringify(data).length / 1024 * 100) / 100} KB`
        };
        
        const existingHistory = getImportHistory();
        const newHistory = [historyItem, ...existingHistory];
        localStorage.setItem('portfolio_import_history', JSON.stringify(newHistory));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getImportHistory = useCallback((): ImportHistoryItem[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('portfolio_import_history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load import history:', error);
      return [];
    }
  }, []);

  const deleteImport = useCallback((importId: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const history = getImportHistory();
      const filteredHistory = history.filter(item => item.id !== importId);
      localStorage.setItem('portfolio_import_history', JSON.stringify(filteredHistory));
    } catch (error) {
      logger.error('Failed to delete import:', error);
    }
  }, [getImportHistory]);

  const restoreImport = useCallback(async (importId: string): Promise<ImportData[]> => {
    // In a real implementation, this would fetch the import data from a backend
    // For now, we'll return empty array as this would require stored import data
    logger.log('Restore import:', importId);
    return [];
  }, []);

  const exportImportData = useCallback((data: ImportData[], filename: string = 'portfolio_export.csv') => {
    const csvContent = [
      'Symbol,Shares,Cost Basis,Purchase Date,Current Price,Dividend Yield,Sector,Notes',
      ...data.map(item => [
        item.symbol,
        item.shares,
        item.costBasis,
        item.purchaseDate,
        item.currentPrice || '',
        item.dividendYield || '',
        item.sector || '',
        item.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, []);

  const validateSymbol = useCallback(async (symbol: string): Promise<boolean> => {
    // In a real implementation, this would check against a stock symbol API
    // For now, we'll do basic validation
    return /^[A-Z]{1,5}$/.test(symbol.toUpperCase());
  }, []);

  const fetchStockPrice = useCallback(async (symbol: string): Promise<number | null> => {
    try {
      // In a real implementation, this would fetch from a stock price API
      // For demo purposes, return a mock price
      return Math.random() * 200 + 50; // Random price between $50-$250
    } catch (error) {
      logger.error('Failed to fetch stock price:', error);
      return null;
    }
  }, []);

  const detectDuplicates = useCallback((data: ImportData[]): ImportData[] => {
    const seen = new Map<string, ImportData>();
    const duplicates: ImportData[] = [];

    data.forEach(item => {
      const key = `${item.symbol}-${item.purchaseDate}`;
      if (seen.has(key)) {
        duplicates.push(item);
      } else {
        seen.set(key, item);
      }
    });

    return duplicates;
  }, []);

  const suggestOptimizations = useCallback((data: ImportData[]): string[] => {
    const suggestions: string[] = [];
    
    // Check for missing data
    const missingCurrentPrice = data.filter(item => !item.currentPrice).length;
    const missingSector = data.filter(item => !item.sector).length;
    const missingDividendYield = data.filter(item => !item.dividendYield).length;

    if (missingCurrentPrice > 0) {
      suggestions.push(`${missingCurrentPrice} holdings are missing current prices - these will be fetched automatically`);
    }
    
    if (missingSector > 0) {
      suggestions.push(`${missingSector} holdings are missing sector information - this will improve portfolio analysis`);
    }
    
    if (missingDividendYield > 0) {
      suggestions.push(`${missingDividendYield} holdings are missing dividend yield data - important for income tracking`);
    }

    // Check for potential issues
    const duplicateSymbols = data.filter((item, index, arr) => 
      arr.findIndex(other => other.symbol === item.symbol) !== index
    );
    
    if (duplicateSymbols.length > 0) {
      suggestions.push(`${duplicateSymbols.length} holdings have duplicate symbols - consider consolidating positions`);
    }

    const oldDates = data.filter(item => 
      new Date(item.purchaseDate) < new Date('2020-01-01')
    );
    
    if (oldDates.length > 0) {
      suggestions.push(`${oldDates.length} holdings have very old purchase dates - verify these are correct`);
    }

    return suggestions;
  }, []);

  return {
    loading,
    error,
    validateData,
    importData,
    getImportHistory,
    deleteImport,
    restoreImport,
    exportImportData,
    validateSymbol,
    fetchStockPrice,
    detectDuplicates,
    suggestOptimizations
  };
}