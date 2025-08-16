'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/forms/Button'
import { Select } from '@/components/forms/Select'
import { Upload, X, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { CSVImporter, ExcelImporter, ValidationResult, ImportResult } from '@/lib/import-export'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type ImportType = 'portfolios' | 'holdings' | 'transactions'
type FileFormat = 'csv' | 'excel'

interface PreviewData {
  type: ImportType
  data: any[]
  validation: ValidationResult
  file: File
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<'select' | 'upload' | 'preview' | 'importing' | 'complete'>('select')
  const [importType, setImportType] = useState<ImportType>('portfolios')
  const [fileFormat, setFileFormat] = useState<FileFormat>('csv')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [importResults, setImportResults] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const importOptions = [
    { value: 'portfolios', label: 'Portfolios' },
    { value: 'holdings', label: 'Holdings' },
    { value: 'transactions', label: 'Transactions' }
  ]

  const formatOptions = [
    { value: 'csv', label: 'CSV File' },
    { value: 'excel', label: 'Excel File (.xlsx, .xls)' }
  ]

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      parseFile(file)
    }
  }

  const parseFile = async (file: File) => {
    setStep('upload')
    
    try {
      let result: ImportResult<any>
      
      if (fileFormat === 'csv') {
        const importer = new CSVImporter()
        
        switch (importType) {
          case 'portfolios':
            result = await importer.parsePortfolioCSV(file)
            break
          case 'holdings':
            result = await importer.parseHoldingsCSV(file)
            break
          case 'transactions':
            result = await importer.parseTransactionCSV(file)
            break
          default:
            throw new Error('Invalid import type')
        }
      } else {
        const importer = new ExcelImporter()
        
        switch (importType) {
          case 'portfolios':
            result = await importer.parsePortfolioSheet(file)
            break
          case 'holdings':
            result = await importer.parseHoldingsSheet(file)
            break
          case 'transactions':
            result = await importer.parseTransactionSheet(file)
            break
          default:
            throw new Error('Invalid import type')
        }
      }

      setPreviewData({
        type: importType,
        data: result.data,
        validation: result.validation,
        file
      })
      
      setStep('preview')
      
      if (!result.success) {
        toast.error('File contains errors. Please review and fix before importing.')
      } else {
        toast.success(`Successfully parsed ${result.data.length} records`)
      }
      
    } catch (error) {
      // console.error('Error parsing file:', error)
      // toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setStep('select')
    }
  }

  const handleImport = async () => {
    if (!previewData) return
    
    setStep('importing')
    
    try {
      // Here you would typically send the data to your API
      // For now, we'll simulate the import process
      
      const importPromises = previewData.data.map(async (item, index) => {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 100))
        
        let endpoint: string
        let payload: any
        
        switch (previewData.type) {
          case 'portfolios':
            endpoint = '/api/portfolios'
            payload = {
              name: item.name,
              description: item.description
            }
            break
            
          case 'holdings':
            endpoint = '/api/holdings'
            payload = {
              ticker: item.ticker,
              shares: item.shares,
              averagePrice: item.averagePrice,
              currentPrice: item.currentPrice,
              portfolioName: item.portfolioName
            }
            break
            
          case 'transactions':
            endpoint = '/api/transactions'
            payload = {
              ticker: item.ticker,
              type: item.type,
              shares: item.shares,
              amount: item.amount,
              date: item.date,
              notes: item.notes,
              portfolioName: item.portfolioName
            }
            break
            
          default:
            throw new Error('Invalid import type')
        }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        
        const result = await response.json()
        return { index, success: result.success, error: result.error }
      })
      
      const results = await Promise.all(importPromises)
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      
      setImportResults({
        total: previewData.data.length,
        successful,
        failed,
        results
      })
      
      setStep('complete')
      
      if (failed === 0) {
        toast.success(`Successfully imported all ${successful} records`)
        onSuccess?.()
      } else {
        toast.error(`Import completed with ${failed} failures out of ${previewData.data.length} records`)
      }
      
    } catch (error) {
      // console.error('Error importing data:', error)
      // toast.error('Failed to import data')
      setStep('preview')
    }
  }

  const resetModal = () => {
    setStep('select')
    setSelectedFile(null)
    setPreviewData(null)
    setImportResults(null)
    setIsDragging(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const downloadTemplate = () => {
    let headers: string[] = []
    let sampleRows: string[][] = []
    
    switch (importType) {
      case 'portfolios':
        headers = ['name', 'description']
        sampleRows = [
          ['My Dividend Portfolio', 'Focus on dividend-paying stocks'],
          ['Growth Portfolio', 'High-growth potential stocks']
        ]
        break
        
      case 'holdings':
        headers = ['ticker', 'shares', 'averagePrice', 'currentPrice', 'portfolioName']
        sampleRows = [
          ['AAPL', '100', '150.00', '175.00', 'My Dividend Portfolio'],
          ['MSFT', '50', '200.00', '220.00', 'Growth Portfolio']
        ]
        break
        
      case 'transactions':
        headers = ['ticker', 'type', 'shares', 'amount', 'date', 'notes', 'portfolioName']
        sampleRows = [
          ['AAPL', 'BUY', '100', '150.00', '2024-01-15', 'Initial purchase', 'My Dividend Portfolio'],
          ['AAPL', 'DIVIDEND', '', '50.00', '2024-03-15', 'Quarterly dividend', 'My Dividend Portfolio']
        ]
        break
    }
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => 
        cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${importType}_template.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Template downloaded')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Import Data</h2>
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
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Import Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Data Type"
                    value={importType}
                    onChange={(value) => setImportType(value as ImportType)}
                    options={importOptions}
                  />
                  <Select
                    label="File Format"
                    value={fileFormat}
                    onChange={(value) => setFileFormat(value as FileFormat)}
                    options={formatOptions}
                  />
                </div>
              </div>

              {/* Template Download */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-2">Need a template?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Download a sample CSV file to see the expected format for {importType}.
                </p>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>

              {/* File Upload */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Select File</h4>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    handleFileSelect(e.dataTransfer.files)
                  }}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag and drop your {fileFormat.toUpperCase()} file here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fileFormat === 'csv' ? 'CSV files up to 10MB' : 'Excel files up to 50MB'}
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={fileFormat === 'csv' ? '.csv' : '.xlsx,.xls,.xlsm'}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {step === 'upload' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Parsing file...</p>
            </div>
          )}

          {step === 'preview' && previewData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Preview Import Data</h3>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{previewData.file.name}</span>
                </div>
              </div>

              {/* Validation Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Valid Records</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {previewData.validation.validRowsCount}
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700 mt-1">
                    {previewData.validation.errors.length}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Warnings</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700 mt-1">
                    {previewData.validation.warnings.length}
                  </p>
                </div>
              </div>

              {/* Errors and Warnings */}
              {(previewData.validation.errors.length > 0 || previewData.validation.warnings.length > 0) && (
                <div className="space-y-4">
                  {previewData.validation.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">Errors (must be fixed)</h4>
                      <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                        {previewData.validation.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {previewData.validation.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Warnings (review recommended)</h4>
                      <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                        {previewData.validation.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Preview Table */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Data Preview (showing first 5 records)
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {previewData.data.length > 0 && 
                            Object.keys(previewData.data[0]).map((key) => (
                              <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {key}
                              </th>
                            ))
                          }
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.data.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value: any, colIndex) => (
                              <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Importing data...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {step === 'complete' && importResults && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Import Complete</h3>
                <p className="mt-2 text-gray-600">Your data has been imported successfully.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700">{importResults.total}</p>
                  <p className="text-sm text-blue-600">Total Records</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-700">{importResults.successful}</p>
                  <p className="text-sm text-green-600">Successful</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">{importResults.failed}</p>
                  <p className="text-sm text-red-600">Failed</p>
                </div>
              </div>

              {importResults.failed > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Failed Imports</h4>
                  <div className="text-sm text-red-700 max-h-32 overflow-y-auto">
                    {importResults.results
                      .filter((r: any) => !r.success)
                      .map((r: any, index: number) => (
                        <p key={index}>Row {r.index + 1}: {r.error}</p>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between">
            <div>
              {step === 'preview' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('select')
                    setPreviewData(null)
                  }}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              {step === 'complete' ? (
                <Button onClick={handleClose}>
                  Done
                </Button>
              ) : step === 'preview' ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!previewData?.validation.isValid}
                  >
                    Import {previewData?.validation.validRowsCount} Records
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}