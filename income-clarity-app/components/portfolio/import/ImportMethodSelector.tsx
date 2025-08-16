'use client';

import React from 'react';
import { 
  Upload, 
  FileText, 
  Clipboard, 
  Database, 
  Building2,
  Banknote,
  TrendingUp,
  DollarSign,
  PiggyBank
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ImportMethod } from '../ImportWizard';

export interface ImportMethodSelectorProps {
  onSelect: (method: ImportMethod) => void;
  selectedMethod: ImportMethod | null;
}

const IMPORT_METHODS: ImportMethod[] = [
  {
    id: 'csv',
    name: 'CSV Upload',
    description: 'Upload a CSV file with your holdings data',
    icon: <Upload className="w-8 h-8" />
  },
  {
    id: 'paste',
    name: 'Manual Paste',
    description: 'Copy and paste data from Excel or Google Sheets',
    icon: <Clipboard className="w-8 h-8" />
  },
  {
    id: 'json',
    name: 'JSON Import',
    description: 'Import from JSON backup or advanced data format',
    icon: <Database className="w-8 h-8" />
  },
  {
    id: 'broker',
    name: 'Broker Import',
    description: 'Import from major brokerage account exports',
    icon: <Building2 className="w-8 h-8" />
  }
];

const BROKER_FORMATS = [
  {
    name: 'Fidelity',
    description: 'Account positions export',
    icon: <Banknote className="w-6 h-6 text-green-600" />,
    format: 'CSV with account, symbol, quantity, price columns'
  },
  {
    name: 'Charles Schwab',
    description: 'Portfolio export',
    icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
    format: 'CSV with detailed position information'
  },
  {
    name: 'Vanguard',
    description: 'Holdings export',
    icon: <PiggyBank className="w-6 h-6 text-red-600" />,
    format: 'Simplified position export format'
  },
  {
    name: 'E*TRADE',
    description: 'Portfolio summary',
    icon: <DollarSign className="w-6 h-6 text-purple-600" />,
    format: 'Standard brokerage CSV format'
  },
  {
    name: 'TD Ameritrade',
    description: 'Account export',
    icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
    format: 'Position and transaction data'
  },
  {
    name: 'Robinhood',
    description: 'Account statement',
    icon: <Banknote className="w-6 h-6 text-green-500" />,
    format: 'Mobile-first CSV export'
  }
];

export function ImportMethodSelector({ onSelect, selectedMethod }: ImportMethodSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Import Method</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select how you'd like to import your portfolio data. We support multiple formats and brokers.
        </p>
      </div>

      {/* Main Import Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {IMPORT_METHODS.map((method) => (
          <div
            key={method.id}
            className={`
              rounded-lg border bg-white shadow-sm p-6 cursor-pointer transition-all hover:shadow-md
              ${selectedMethod?.id === method.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            onClick={() => onSelect(method)}
          >
            <div className="flex items-start space-x-4">
              <div className={`
                p-3 rounded-lg
                ${selectedMethod?.id === method.id
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }
              `}>
                {method.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{method.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {method.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Broker-Specific Information */}
      {selectedMethod?.id === 'broker' && (
        <Card className="p-6 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Supported Brokers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BROKER_FORMATS.map((broker) => (
              <div key={broker.name} className="flex items-start space-x-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  {broker.icon}
                </div>
                <div>
                  <h4 className="font-medium">{broker.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {broker.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {broker.format}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Most brokers allow you to export your portfolio data as CSV. 
              Look for "Export" or "Download" options in your account's portfolio section.
            </p>
          </div>
        </Card>
      )}

      {/* CSV Format Information */}
      {selectedMethod?.id === 'csv' && (
        <Card className="p-6 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-lg mb-4">CSV Format Requirements</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <li>• <strong>Symbol/Ticker:</strong> Stock symbol (e.g., AAPL, MSFT)</li>
                <li>• <strong>Shares:</strong> Number of shares owned</li>
                <li>• <strong>Cost Basis:</strong> Average purchase price per share</li>
                <li>• <strong>Purchase Date:</strong> When you acquired the position</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional Columns:</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <li>• <strong>Current Price:</strong> Latest market price</li>
                <li>• <strong>Dividend Yield:</strong> Annual dividend yield percentage</li>
                <li>• <strong>Sector:</strong> Industry sector</li>
                <li>• <strong>Notes:</strong> Additional information</li>
              </ul>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Don't worry about column names - our smart mapper will help you match your columns to the correct fields.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Manual Paste Information */}
      {selectedMethod?.id === 'paste' && (
        <Card className="p-6 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-lg mb-4">Manual Paste Instructions</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">From Excel:</h4>
                <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-decimal list-inside">
                  <li>Select your data range including headers</li>
                  <li>Copy (Ctrl+C or Cmd+C)</li>
                  <li>Paste into our import area</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">From Google Sheets:</h4>
                <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-decimal list-inside">
                  <li>Highlight your portfolio data</li>
                  <li>Copy the selection</li>
                  <li>Paste directly into the text area</li>
                </ol>
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
              <p className="text-sm text-green-800 dark:text-green-200">
                Tab-separated and comma-separated formats are both supported. The system will automatically detect the format.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* JSON Import Information */}
      {selectedMethod?.id === 'json' && (
        <Card className="p-6 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-lg mb-4">JSON Import Format</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Upload a JSON file with your portfolio data. This is perfect for advanced users or restoring from backups.
            </p>
            <div className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg text-sm">
              <pre className="text-green-400 font-mono text-xs">
{`{
  "portfolio": [
    {
      "symbol": "AAPL",
      "shares": 100,
      "costBasis": 150.00,
      "purchaseDate": "2024-01-15",
      "currentPrice": 175.00,
      "dividendYield": 0.5,
      "sector": "Technology",
      "notes": "iPhone maker"
    }
  ]
}`}
              </pre>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                JSON imports support all available fields and maintain perfect data integrity.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}