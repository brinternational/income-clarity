'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { 
  History, 
  Download, 
  Trash2, 
  RotateCcw,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export interface ImportHistoryProps {
  onRestore: (importId: string) => void;
}

interface ImportRecord {
  id: string;
  timestamp: string;
  method: 'csv' | 'paste' | 'json' | 'broker';
  brokerName?: string;
  fileName?: string;
  recordsImported: number;
  recordsSkipped: number;
  recordsWithErrors: number;
  status: 'completed' | 'partial' | 'failed';
  size: string;
  canRestore: boolean;
  canDownload: boolean;
}

const MOCK_IMPORT_HISTORY: ImportRecord[] = [
  {
    id: '1',
    timestamp: '2024-08-13T10:30:00Z',
    method: 'csv',
    fileName: 'portfolio_export.csv',
    recordsImported: 25,
    recordsSkipped: 0,
    recordsWithErrors: 2,
    status: 'partial',
    size: '2.5 KB',
    canRestore: true,
    canDownload: true
  },
  {
    id: '2',
    timestamp: '2024-08-12T15:45:00Z',
    method: 'broker',
    brokerName: 'Fidelity',
    fileName: 'positions_export_20240812.csv',
    recordsImported: 18,
    recordsSkipped: 0,
    recordsWithErrors: 0,
    status: 'completed',
    size: '1.8 KB',
    canRestore: true,
    canDownload: true
  },
  {
    id: '3',
    timestamp: '2024-08-10T09:15:00Z',
    method: 'paste',
    recordsImported: 12,
    recordsSkipped: 1,
    recordsWithErrors: 0,
    status: 'completed',
    size: '0.9 KB',
    canRestore: true,
    canDownload: false
  },
  {
    id: '4',
    timestamp: '2024-08-08T14:20:00Z',
    method: 'json',
    fileName: 'backup_portfolio.json',
    recordsImported: 0,
    recordsSkipped: 0,
    recordsWithErrors: 35,
    status: 'failed',
    size: '4.2 KB',
    canRestore: false,
    canDownload: true
  },
  {
    id: '5',
    timestamp: '2024-08-05T11:00:00Z',
    method: 'broker',
    brokerName: 'Schwab',
    fileName: 'account_positions.csv',
    recordsImported: 31,
    recordsSkipped: 2,
    recordsWithErrors: 1,
    status: 'partial',
    size: '3.1 KB',
    canRestore: true,
    canDownload: true
  }
];

export function ImportHistory({ onRestore }: ImportHistoryProps) {
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'failed'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'csv' | 'paste' | 'json' | 'broker'>('all');
  const [selectedImports, setSelectedImports] = useState<Set<string>>(new Set());

  useEffect(() => {
    // In real implementation, fetch from API
    setImportHistory(MOCK_IMPORT_HISTORY);
  }, []);

  const filteredHistory = importHistory.filter(record => {
    if (statusFilter !== 'all' && record.status !== statusFilter) return false;
    if (methodFilter !== 'all' && record.method !== methodFilter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.fileName?.toLowerCase().includes(searchLower) ||
        record.brokerName?.toLowerCase().includes(searchLower) ||
        record.method.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleSelectImport = (importId: string) => {
    const newSelected = new Set(selectedImports);
    if (newSelected.has(importId)) {
      newSelected.delete(importId);
    } else {
      newSelected.add(importId);
    }
    setSelectedImports(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImports.size === filteredHistory.length) {
      setSelectedImports(new Set());
    } else {
      setSelectedImports(new Set(filteredHistory.map(r => r.id)));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedImports.size} import record(s)?`)) {
      const newHistory = importHistory.filter(record => !selectedImports.has(record.id));
      setImportHistory(newHistory);
      setSelectedImports(new Set());
    }
  };

  const handleDownload = (record: ImportRecord) => {
    // In real implementation, trigger download
    logger.log('Downloading import record:', record.id);
  };

  const handleDelete = (record: ImportRecord) => {
    if (window.confirm('Delete this import record?')) {
      const newHistory = importHistory.filter(r => r.id !== record.id);
      setImportHistory(newHistory);
    }
  };

  const getStatusIcon = (status: ImportRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getMethodDisplay = (record: ImportRecord) => {
    if (record.method === 'broker' && record.brokerName) {
      return `${record.brokerName} Export`;
    }
    
    switch (record.method) {
      case 'csv': return 'CSV Upload';
      case 'paste': return 'Manual Paste';
      case 'json': return 'JSON Import';
      case 'broker': return 'Broker Import';
      default: return (record.method as string).toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <History className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        <div>
          <h3 className="text-lg font-semibold">Import History</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage your previous portfolio imports
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search imports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-full sm:w-48"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Methods</option>
              <option value="csv">CSV Upload</option>
              <option value="paste">Manual Paste</option>
              <option value="json">JSON Import</option>
              <option value="broker">Broker Import</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedImports.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedImports.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Import Records */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedImports.size === filteredHistory.length && filteredHistory.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Import Details</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Records</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredHistory.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedImports.has(record.id)}
                      onChange={() => handleSelectImport(record.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className="capitalize text-sm font-medium">
                        {record.status}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-sm">
                        {getMethodDisplay(record)}
                      </div>
                      {record.fileName && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center mt-1">
                          <FileText className="w-3 h-3 mr-1" />
                          {record.fileName}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Size: {record.size}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="text-green-600">✓ {record.recordsImported} imported</div>
                      {record.recordsSkipped > 0 && (
                        <div className="text-yellow-600">⚠ {record.recordsSkipped} skipped</div>
                      )}
                      {record.recordsWithErrors > 0 && (
                        <div className="text-red-600">✗ {record.recordsWithErrors} errors</div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {record.canRestore && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRestore(record.id)}
                          title="Restore this import"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {record.canDownload && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(record)}
                          title="Download import file"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete import record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div>No import history found</div>
            {searchTerm && (
              <div className="text-sm mt-1">Try adjusting your search or filters</div>
            )}
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      {importHistory.length > 0 && (
        <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
          <h4 className="font-medium mb-2">Import Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold">{importHistory.length}</div>
              <div className="text-gray-600 dark:text-gray-400">Total Imports</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">
                {importHistory.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Successful</div>
            </div>
            <div>
              <div className="font-semibold">
                {importHistory.reduce((sum, r) => sum + r.recordsImported, 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Records Imported</div>
            </div>
            <div>
              <div className="font-semibold">
                {importHistory.filter(r => r.canRestore).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Available for Restore</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}