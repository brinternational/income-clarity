'use client'

import React, { useState } from 'react'
import { Button } from '@/components/forms/Button'
import { TransactionForm, TransactionList, TransactionFilters } from '@/components/transactions'
import { ImportModal, ExportModal } from '@/components/import-export'
import { 
  Database, 
  Import, 
  Download, 
  Plus, 
  TrendingUp, 
  PieChart,
  Calculator,
  FileText 
} from 'lucide-react'

export default function PortfolioFeaturesDemo() {
  const [activeTab, setActiveTab] = useState('transactions')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [transactionFilters, setTransactionFilters] = useState({})

  const features = [
    {
      id: 'transactions',
      title: 'Transaction Management',
      description: 'Record and track buy/sell/dividend transactions',
      icon: Database,
      color: 'bg-blue-500'
    },
    {
      id: 'import-export',
      title: 'Import/Export',
      description: 'Import from CSV/Excel, export to JSON/PDF',
      icon: Import,
      color: 'bg-green-500'
    },
    {
      id: 'metrics',
      title: 'Portfolio Metrics',
      description: 'Calculate returns, allocation, and performance',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      id: 'dividends',
      title: 'Dividend Calculator',
      description: 'Project income and payment schedules',
      icon: Calculator,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Portfolio Management Features Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete portfolio management system with transaction tracking, 
            import/export functionality, and advanced analytics.
          </p>
        </div>

        {/* Feature Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`p-6 rounded-lg border transition-all duration-200 text-left ${
                  activeTab === feature.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </button>
            )
          })}
        </div>

        {/* Feature Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'transactions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Transaction Management</h2>
                  <p className="text-gray-600 mt-1">
                    Record and track all your investment transactions
                  </p>
                </div>
                <Button
                  onClick={() => setShowTransactionForm(!showTransactionForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </div>

              {showTransactionForm && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Transaction</h3>
                  <TransactionForm
                    portfolios={[]} // Would normally pass real portfolios
                    onSuccess={() => setShowTransactionForm(false)}
                    onCancel={() => setShowTransactionForm(false)}
                  />
                </div>
              )}

              <div className="space-y-6">
                <TransactionFilters
                  onFiltersChange={setTransactionFilters}
                  className="border border-gray-200"
                />
                
                <TransactionList
                  filters={transactionFilters}
                  onAddTransaction={() => setShowTransactionForm(true)}
                />
              </div>
            </div>
          )}

          {activeTab === 'import-export' && (
            <div className="p-6">
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Import className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Import & Export Data
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Import your portfolio data from CSV or Excel files, or export your data 
                    for backup and analysis.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => setShowImportModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Import className="h-4 w-4" />
                      Import Data
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">CSV Import</h3>
                    <p className="text-sm text-gray-600">
                      Import portfolios, holdings, and transactions from CSV files
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Database className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Excel Support</h3>
                    <p className="text-sm text-gray-600">
                      Import from Excel files with multiple sheets and automatic detection
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Download className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Multi-Format Export</h3>
                    <p className="text-sm text-gray-600">
                      Export to JSON, CSV, or PDF with comprehensive reporting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="p-6">
              <div className="text-center py-12">
                <TrendingUp className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Portfolio Metrics
                </h2>
                <p className="text-gray-600 mb-8">
                  Advanced analytics including performance calculations, risk metrics, 
                  and benchmark comparisons.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 mb-2">8.5%</div>
                    <div className="text-sm text-blue-600">Annualized Return</div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 mb-2">1.2</div>
                    <div className="text-sm text-green-600">Sharpe Ratio</div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700 mb-2">-12%</div>
                    <div className="text-sm text-purple-600">Max Drawdown</div>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700 mb-2">0.85</div>
                    <div className="text-sm text-orange-600">Beta vs SPY</div>
                  </div>
                </div>

                <div className="mt-8 text-left bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Available Calculations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Total Return & Annualized Return</li>
                      <li>• XIRR (Internal Rate of Return)</li>
                      <li>• Risk-adjusted metrics (Sharpe, Sortino)</li>
                      <li>• Portfolio allocation analysis</li>
                    </ul>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Benchmark comparison (vs SPY)</li>
                      <li>• Volatility and Beta calculation</li>
                      <li>• Maximum drawdown analysis</li>
                      <li>• Value at Risk (VaR) estimation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dividends' && (
            <div className="p-6">
              <div className="text-center py-12">
                <Calculator className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Dividend Calculator
                </h2>
                <p className="text-gray-600 mb-8">
                  Track dividend income, project future payments, and analyze 
                  dividend growth trends.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 mb-2">$342</div>
                    <div className="text-sm text-green-600">Monthly Income</div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 mb-2">$4,104</div>
                    <div className="text-sm text-blue-600">Annual Income</div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700 mb-2">3.2%</div>
                    <div className="text-sm text-purple-600">Portfolio Yield</div>
                  </div>
                </div>

                <div className="text-left bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Dividend Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Income projection & scheduling</li>
                      <li>• Dividend calendar with payment dates</li>
                      <li>• Yield on cost calculations</li>
                      <li>• Growth rate analysis</li>
                    </ul>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Ex-dividend date tracking</li>
                      <li>• Dividend reinvestment analysis</li>
                      <li>• Tax-adjusted income calculations</li>
                      <li>• Portfolio yield optimization</li>
                    </ul>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded border">
                    <h4 className="font-medium text-gray-900 mb-2">Next Dividend Payments</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>AAPL - Jan 15, 2025</span>
                        <span className="font-medium">$24.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MSFT - Feb 14, 2025</span>
                        <span className="font-medium">$37.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span>JNJ - Mar 12, 2025</span>
                        <span className="font-medium">$59.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false)
          // Refresh transaction list if on transactions tab
          if (activeTab === 'transactions') {
            window.location.reload()
          }
        }}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  )
}