'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/forms/Button'
import { Select } from '@/components/forms/Select'
import { Input } from '@/components/forms/Input'
import { Toggle } from '@/components/forms/Toggle'
import { X, Download, FileText, Database, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { JSONExporter, PDFReporter } from '@/lib/import-export'

interface Portfolio {
  id: string
  name: string
}

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

type ExportFormat = 'json' | 'csv' | 'pdf'
type ExportScope = 'all' | 'portfolio'

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json')
  const [exportScope, setExportScope] = useState<ExportScope>('all')
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('')
  const [includePortfolios, setIncludePortfolios] = useState(true)
  const [includeHoldings, setIncludeHoldings] = useState(true)
  const [includeTransactions, setIncludeTransactions] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])

  const exportFormatOptions = [
    { value: 'json', label: 'JSON - Full data with metadata' },
    { value: 'csv', label: 'CSV - Spreadsheet format' },
    { value: 'pdf', label: 'PDF - Professional report' }
  ]

  const exportScopeOptions = [
    { value: 'all', label: 'All Data' },
    { value: 'portfolio', label: 'Specific Portfolio' }
  ]

  // Fetch portfolios on mount
  useEffect(() => {
    if (isOpen) {
      fetchPortfolios()
    }
  }, [isOpen])

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('/api/portfolios')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setPortfolios(result.data)
          if (result.data.length > 0 && !selectedPortfolioId) {
            setSelectedPortfolioId(result.data[0].id)
          }
        }
      }
    } catch (error) {
      // Error handled by emergency recovery script

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      let blob: Blob
      let filename: string
      
      const options = {
        includePortfolios,
        includeHoldings,
        includeTransactions,
        portfolioIds: exportScope === 'portfolio' && selectedPortfolioId ? [selectedPortfolioId] : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        format: 'pretty' as const
      }

      switch (exportFormat) {
        case 'json':
          const jsonExporter = new JSONExporter()
          
          if (exportScope === 'portfolio' && selectedPortfolioId) {
            blob = await jsonExporter.exportPortfolio(selectedPortfolioId, options)
            const portfolio = portfolios.find(p => p.id === selectedPortfolioId)
            filename = `${portfolio?.name || 'portfolio'}-export-${new Date().toISOString().split('T')[0]}.json`
          } else {
            blob = await jsonExporter.exportAllData(options)
            filename = `income-clarity-export-${new Date().toISOString().split('T')[0]}.json`
          }
          
          jsonExporter.downloadJSON(blob, filename)
          break

        case 'csv':
          const csvExporter = new JSONExporter()
          
          // For CSV, we need to export each data type separately
          if (includePortfolios) {
            // Export portfolios
            const portfolioData = await fetch('/api/portfolios').then(r => r.json())
            if (portfolioData.success) {
              const csvBlob = await csvExporter.exportToCSV(portfolioData.data, 'portfolios')
              const link = document.createElement('a')
              link.href = URL.createObjectURL(csvBlob)
              link.download = `portfolios-${new Date().toISOString().split('T')[0]}.csv`
              link.click()
              URL.revokeObjectURL(link.href)
            }
          }
          
          if (includeHoldings) {
            // Export holdings
            const holdingsUrl = exportScope === 'portfolio' && selectedPortfolioId 
              ? `/api/holdings?portfolioId=${selectedPortfolioId}`
              : '/api/holdings'
            const holdingsData = await fetch(holdingsUrl).then(r => r.json())
            if (holdingsData.success && holdingsData.data.length > 0) {
              const csvBlob = await csvExporter.exportToCSV(holdingsData.data, 'holdings')
              const link = document.createElement('a')
              link.href = URL.createObjectURL(csvBlob)
              link.download = `holdings-${new Date().toISOString().split('T')[0]}.csv`
              link.click()
              URL.revokeObjectURL(link.href)
            }
          }
          
          if (includeTransactions) {
            // Export transactions
            const transactionsParams = new URLSearchParams({ limit: '10000' })
            if (exportScope === 'portfolio' && selectedPortfolioId) {
              transactionsParams.set('portfolioId', selectedPortfolioId)
            }
            if (dateFrom) transactionsParams.set('dateFrom', dateFrom)
            if (dateTo) transactionsParams.set('dateTo', dateTo)
            
            const transactionsData = await fetch(`/api/transactions?${transactionsParams}`).then(r => r.json())
            if (transactionsData.success && transactionsData.data.length > 0) {
              const csvBlob = await csvExporter.exportToCSV(transactionsData.data, 'transactions')
              const link = document.createElement('a')
              link.href = URL.createObjectURL(csvBlob)
              link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
              link.click()
              URL.revokeObjectURL(link.href)
            }
          }
          
          filename = 'Multiple CSV files downloaded'
          break

        case 'pdf':
          const pdfReporter = new PDFReporter()
          const pdfOptions = {
            includeMetrics: true,
            includeHoldings,
            includeTransactions,
            theme: 'professional' as const
          }
          
          if (exportScope === 'portfolio' && selectedPortfolioId) {
            blob = await pdfReporter.generatePortfolioReport(selectedPortfolioId, pdfOptions)
            const portfolio = portfolios.find(p => p.id === selectedPortfolioId)
            filename = `${portfolio?.name || 'portfolio'}-report-${new Date().toISOString().split('T')[0]}.pdf`
          } else {
            blob = await pdfReporter.generateSummaryReport(pdfOptions)
            filename = `portfolio-summary-${new Date().toISOString().split('T')[0]}.pdf`
          }
          
          pdfReporter.downloadPDF(blob, filename)
          break
      }
      
      toast.success(`Export completed: ${filename}`)
      onClose()
      
    } catch (error) {
      // Error handled by emergency recovery script finally {
      setIsExporting(false)
    }
  }

  const resetModal = () => {
    setExportFormat('json')
    setExportScope('all')
    setSelectedPortfolioId('')
    setIncludePortfolios(true)
    setIncludeHoldings(true)
    setIncludeTransactions(true)
    setDateFrom('')
    setDateTo('')
    setIsExporting(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const setDateRange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date()
    const startDate = new Date(today)
    
    switch (range) {
      case 'week':
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(today.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1)
        break
    }

    setDateFrom(startDate.toISOString().split('T')[0])
    setDateTo(today.toISOString().split('T')[0])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="space-y-3">
                {exportFormatOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="exportFormat"
                      value={option.value}
                      checked={exportFormat === option.value}
                      onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      {option.value === 'json' && <Database className="h-4 w-4 text-blue-500" />}
                      {option.value === 'csv' && <FileText className="h-4 w-4 text-green-500" />}
                      {option.value === 'pdf' && <FileText className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Scope */}
            <div>
              <Select
                label="Export Scope"
                value={exportScope}
                onChange={(value) => setExportScope(value as ExportScope)}
                options={exportScopeOptions}
              />
            </div>

            {/* Portfolio Selection */}
            {exportScope === 'portfolio' && portfolios.length > 0 && (
              <div>
                <Select
                  label="Select Portfolio"
                  value={selectedPortfolioId}
                  onChange={setSelectedPortfolioId}
                  options={portfolios.map(p => ({ value: p.id, label: p.name }))}
                  required
                />
              </div>
            )}

            {/* Data Types to Include */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Data Types to Include
              </label>
              <div className="space-y-3">
                <Toggle
                  label="Portfolios"
                  checked={includePortfolios}
                  onChange={setIncludePortfolios}
                  description="Portfolio information and metadata"
                />
                <Toggle
                  label="Holdings"
                  checked={includeHoldings}
                  onChange={setIncludeHoldings}
                  description="Current positions and shares owned"
                />
                <Toggle
                  label="Transactions"
                  checked={includeTransactions}
                  onChange={setIncludeTransactions}
                  description="Buy/sell/dividend transaction history"
                />
              </div>
            </div>

            {/* Date Range Filter (for transactions) */}
            {includeTransactions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Transaction Date Range (Optional)
                </label>
                
                {/* Quick Date Range Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange('week')}
                  >
                    Last Week
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange('month')}
                  >
                    Last Month
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange('quarter')}
                  >
                    Last Quarter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange('year')}
                  >
                    Last Year
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateFrom('')
                      setDateTo('')
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {/* Custom Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="From Date"
                    type="date"
                    value={dateFrom}
                    onChange={setDateFrom}
                    placeholder="Select start date"
                  />
                  <Input
                    label="To Date"
                    type="date"
                    value={dateTo}
                    onChange={setDateTo}
                    placeholder="Select end date"
                    min={dateFrom || undefined}
                  />
                </div>
              </div>
            )}

            {/* Export Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <strong>Format:</strong> {exportFormatOptions.find(o => o.value === exportFormat)?.label}
                </li>
                <li>
                  <strong>Scope:</strong> {exportScope === 'all' ? 'All data' : `${portfolios.find(p => p.id === selectedPortfolioId)?.name || 'Selected portfolio'}`}
                </li>
                <li>
                  <strong>Includes:</strong> {[
                    includePortfolios && 'Portfolios',
                    includeHoldings && 'Holdings',
                    includeTransactions && 'Transactions'
                  ].filter(Boolean).join(', ')}
                </li>
                {(dateFrom || dateTo) && (
                  <li>
                    <strong>Date Range:</strong> {dateFrom || '(start)'} to {dateTo || '(end)'}
                  </li>
                )}
              </ul>
            </div>

            {/* Format-specific Notes */}
            {exportFormat === 'csv' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">CSV Export Notes</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Each data type will be exported as a separate CSV file</li>
                  <li>• Files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
                  <li>• Perfect for further analysis or importing into other systems</li>
                </ul>
              </div>
            )}

            {exportFormat === 'pdf' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">PDF Export Notes</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Professional report format with metrics and charts</li>
                  <li>• Includes portfolio performance analysis</li>
                  <li>• Perfect for sharing with advisors or record-keeping</li>
                </ul>
              </div>
            )}

            {exportFormat === 'json' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">JSON Export Notes</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Complete data backup with all metadata</li>
                  <li>• Can be re-imported into Income Clarity or other applications</li>
                  <li>• Preserves all relationships between portfolios, holdings, and transactions</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || (exportScope === 'portfolio' && !selectedPortfolioId) || (!includePortfolios && !includeHoldings && !includeTransactions)}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}