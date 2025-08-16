'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/forms/Input';
import { 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Trash2,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { ImportData } from '../ImportWizard';

export interface DataPreviewProps {
  data: ImportData[];
  onEdit: (editedData: ImportData[]) => void;
  onValidate: () => void;
}

interface FilterOptions {
  showErrors: boolean;
  showWarnings: boolean;
  showValid: boolean;
  searchTerm: string;
}

export function DataPreview({ data, onEdit, onValidate }: DataPreviewProps) {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<ImportData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    showErrors: true,
    showWarnings: true,
    showValid: true,
    searchTerm: ''
  });

  const statistics = useMemo(() => {
    const total = data.length;
    const withErrors = data.filter(item => item.errors && item.errors.length > 0).length;
    const withWarnings = data.filter(item => item.warnings && item.warnings.length > 0).length;
    const valid = total - withErrors;

    return {
      total,
      withErrors,
      withWarnings,
      valid,
      importable: valid
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Error filter
      const hasErrors = item.errors && item.errors.length > 0;
      const hasWarnings = item.warnings && item.warnings.length > 0;
      const isValid = !hasErrors;

      if (hasErrors && !filters.showErrors) return false;
      if (hasWarnings && !hasErrors && !filters.showWarnings) return false;
      if (isValid && !hasWarnings && !filters.showValid) return false;

      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          item.symbol.toLowerCase().includes(searchLower) ||
          item.notes?.toLowerCase().includes(searchLower) ||
          item.sector?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [data, filters]);

  const handleEditStart = (item: ImportData) => {
    setEditingRow(item.id);
    setEditData({ ...item });
  };

  const handleEditSave = () => {
    if (!editData || !editingRow) return;

    const newData = data.map(item => 
      item.id === editingRow ? editData : item
    );

    onEdit(newData);
    setEditingRow(null);
    setEditData(null);
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const handleDeleteRow = (id: string) => {
    const newData = data.filter(item => item.id !== id);
    onEdit(newData);
  };

  const handleAddRow = () => {
    const newRow: ImportData = {
      id: `new-${Date.now()}`,
      symbol: '',
      shares: 0,
      costBasis: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      errors: []
    };

    onEdit([...data, newRow]);
    handleEditStart(newRow);
  };

  const exportPreview = () => {
    const csvContent = [
      'Symbol,Shares,Cost Basis,Purchase Date,Current Price,Dividend Yield,Sector,Notes,Status',
      ...filteredData.map(item => [
        item.symbol,
        item.shares,
        item.costBasis,
        item.purchaseDate,
        item.currentPrice || '',
        item.dividendYield || '',
        item.sector || '',
        item.notes || '',
        (item.errors && item.errors.length > 0) ? 'Error' : 'Valid'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_preview.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getRowStatus = (item: ImportData) => {
    if (item.errors && item.errors.length > 0) return 'error';
    if (item.warnings && item.warnings.length > 0) return 'warning';
    return 'valid';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Preview & Validate</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Review your portfolio data before importing. Fix any errors and verify the information is correct.
        </p>
      </div>

      {/* Statistics */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.importable}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Importable</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{statistics.withErrors}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">With Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{statistics.withWarnings}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">With Warnings</div>
          </div>
        </div>
      </Card>

      {/* Filters and Actions */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Show:</span>
            </div>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showErrors}
                onChange={(e) => setFilters(prev => ({ ...prev, showErrors: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-red-600">Errors ({statistics.withErrors})</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showWarnings}
                onChange={(e) => setFilters(prev => ({ ...prev, showWarnings: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-yellow-600">Warnings ({statistics.withWarnings})</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showValid}
                onChange={(e) => setFilters(prev => ({ ...prev, showValid: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-green-600">Valid ({statistics.valid})</span>
            </label>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search symbols..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              />
            </div>
            
            <Button variant="outline" onClick={handleAddRow} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
            
            <Button variant="outline" onClick={exportPreview} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={onValidate} size="sm">
              Re-validate
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Shares</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Cost Basis</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Purchase Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Current Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((item) => {
                const isEditing = editingRow === item.id;
                const status = getRowStatus(item);
                
                return (
                  <tr key={item.id} className={`
                    ${status === 'error' ? 'bg-red-50 dark:bg-red-900/10' : 
                      status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/10' : 
                      'bg-white dark:bg-gray-900'}
                  `}>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        {status === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <div className="text-xs">
                          {item.errors && item.errors.length > 0 && (
                            <div className="text-red-600">{item.errors.length} error{item.errors.length !== 1 ? 's' : ''}</div>
                          )}
                          {item.warnings && item.warnings.length > 0 && (
                            <div className="text-yellow-600">{item.warnings.length} warning{item.warnings.length !== 1 ? 's' : ''}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Symbol */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={editData?.symbol || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, symbol: e.target.value.toUpperCase() } : null)}
                          className="text-sm"
                          placeholder="AAPL"
                        />
                      ) : (
                        <div className="font-medium">{item.symbol}</div>
                      )}
                    </td>

                    {/* Shares */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData?.shares || 0}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, shares: parseFloat(e.target.value) || 0 } : null)}
                          className="text-sm"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div>{item.shares.toLocaleString()}</div>
                      )}
                    </td>

                    {/* Cost Basis */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData?.costBasis || 0}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, costBasis: parseFloat(e.target.value) || 0 } : null)}
                          className="text-sm"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div>${item.costBasis.toFixed(2)}</div>
                      )}
                    </td>

                    {/* Purchase Date */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editData?.purchaseDate || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, purchaseDate: e.target.value } : null)}
                          className="text-sm"
                        />
                      ) : (
                        <div>{new Date(item.purchaseDate).toLocaleDateString()}</div>
                      )}
                    </td>

                    {/* Current Price */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData?.currentPrice || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, currentPrice: parseFloat(e.target.value) || undefined } : null)}
                          className="text-sm"
                          placeholder="Auto-fetch"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <div>{item.currentPrice ? `$${item.currentPrice.toFixed(2)}` : 'Auto-fetch'}</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" onClick={handleEditSave}>
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleEditCancel}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStart(item)}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRow(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div>No data matches your current filters</div>
          </div>
        )}
      </Card>

      {/* Validation Messages */}
      {data.some(item => item.errors?.length || item.warnings?.length) && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Validation Messages</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.map(item => (
              <div key={item.id}>
                {item.errors?.map((error, index) => (
                  <div key={`error-${index}`} className="flex items-start space-x-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>{item.symbol || 'Row'}:</strong> {error}</span>
                  </div>
                ))}
                {item.warnings?.map((warning, index) => (
                  <div key={`warning-${index}`} className="flex items-start space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>{item.symbol || 'Row'}:</strong> {warning}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}