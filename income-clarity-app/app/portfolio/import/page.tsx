'use client';

import React from 'react';
import { ImportWizard } from '@/components/portfolio/ImportWizard';
import { Card } from '@/components/ui/card';
import { Download, FileSpreadsheet, HelpCircle } from 'lucide-react';

export default function PortfolioImportPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Import Portfolio
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Import your holdings from multiple sources with our comprehensive import tools
        </p>
      </div>

      {/* Quick Help Section */}
      <Card className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-start space-x-4">
          <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Import Methods Available
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>CSV Upload:</strong> Standard format or broker-specific
              </div>
              <div>
                <strong>Manual Paste:</strong> Copy from Excel/Google Sheets
              </div>
              <div>
                <strong>JSON Import:</strong> Backup restore or advanced users
              </div>
              <div>
                <strong>Broker Formats:</strong> Fidelity, Schwab, Vanguard, E*TRADE, TD Ameritrade, Robinhood
              </div>
              <div>
                <strong>Validation:</strong> Real-time symbol validation and error detection
              </div>
              <div>
                <strong>Preview:</strong> Review and edit before importing
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Template Downloads */}
      <Card className="mb-8 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Download Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => downloadTemplate('standard')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <FileSpreadsheet className="w-6 h-6 text-green-600 mb-2" />
            <div className="font-medium">Standard CSV Template</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Simple format: Symbol, Shares, Cost Basis, Date
            </div>
          </button>
          
          <button
            onClick={() => downloadTemplate('detailed')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <FileSpreadsheet className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium">Detailed CSV Template</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Full format with sectors, dividends, and metadata
            </div>
          </button>

          <button
            onClick={() => downloadTemplate('broker')}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <FileSpreadsheet className="w-6 h-6 text-purple-600 mb-2" />
            <div className="font-medium">Broker Format Examples</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sample files from major brokers
            </div>
          </button>
        </div>
      </Card>

      {/* Main Import Wizard */}
      <ImportWizard />
    </div>
  );
}

function downloadTemplate(type: 'standard' | 'detailed' | 'broker') {
  let csvContent = '';
  let filename = '';

  switch (type) {
    case 'standard':
      csvContent = 'Symbol,Shares,CostBasis,PurchaseDate\nAAPL,100,150.00,2024-01-15\nMSFT,50,250.00,2024-01-20\nJEPI,200,55.00,2024-02-01';
      filename = 'portfolio_import_standard.csv';
      break;
    case 'detailed':
      csvContent = 'Symbol,Shares,CostBasis,PurchaseDate,CurrentPrice,DividendYield,Sector,Notes\nAAPL,100,150.00,2024-01-15,175.00,0.5,Technology,"iPhone maker"\nMSFT,50,250.00,2024-01-20,300.00,0.7,Technology,"Cloud services"\nJEPI,200,55.00,2024-02-01,58.50,11.8,"Income ETF","High dividend yield"';
      filename = 'portfolio_import_detailed.csv';
      break;
    case 'broker':
      // Create a zip file example or multiple broker formats
      csvContent = 'Symbol,Quantity,Price,Date,Type\n"AAPL",100,"$150.00","01/15/2024","BUY"\n"MSFT",50,"$250.00","01/20/2024","BUY"';
      filename = 'broker_format_example.csv';
      break;
  }

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}