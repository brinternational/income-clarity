'use client'

/**
 * Data Import Wizard - Multiple ways to import portfolio data
 * Implements ONBOARD-006: Data Import Options
 * 
 * Supports CSV import, manual entry, OCR screenshot parsing
 */

import { useState, useRef } from 'react'
import { 
  Upload, 
  FileText, 
  Camera, 
  Edit3, 
  Check, 
  X, 
  AlertCircle,
  Download,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react'
import { importUtils, ImportResult, ImportedHolding, getImportFormatExamples, validateImportFile } from '@/lib/import-utils'

interface DataImportWizardProps {
  onImportComplete: (holdings: ImportedHolding[]) => void
  onClose: () => void
  className?: string
}

type ImportMethod = 'csv' | 'screenshot' | 'manual' | null

export default function DataImportWizard({ onImportComplete, onClose, className = '' }: DataImportWizardProps) {
  const [method, setMethod] = useState<ImportMethod>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult<ImportedHolding> | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [manualHolding, setManualHolding] = useState({
    symbol: '',
    quantity: 0,
    averageCost: 0
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMethodSelect = (selectedMethod: ImportMethod) => {
    setMethod(selectedMethod)
    setImportResult(null)
    setSelectedFile(null)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const error = validateImportFile(file, method === 'csv' ? 'csv' : 'image')
    if (error) {
      alert(error)
      return
    }

    setSelectedFile(file)
    setIsLoading(true)

    try {
      let result: ImportResult<ImportedHolding>

      if (method === 'csv') {
        const csvContent = await file.text()
        result = await importUtils.parseCSV(csvContent, undefined, {
          skipDuplicates: true,
          validateSymbols: true,
          fetchCurrentPrices: false,
          autoDetectFormat: true,
          cleanupData: true
        })
      } else if (method === 'screenshot') {
        result = await importUtils.parseScreenshot(file, {
          validateSymbols: true
        })
      } else {
        result = { success: false, errors: ['Invalid import method'], warnings: [], processed: 0, skipped: 0 }
      }

      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        processed: 0,
        skipped: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualAdd = async () => {
    if (!manualHolding.symbol || manualHolding.quantity <= 0) {
      alert('Please enter a valid symbol and quantity')
      return
    }

    setIsLoading(true)

    try {
      const result = await importUtils.addManualHolding(
        manualHolding.symbol,
        manualHolding.quantity,
        manualHolding.averageCost || undefined,
        { validateSymbols: true, fetchCurrentPrices: true }
      )

      setImportResult(result)
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`Manual entry failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        processed: 0,
        skipped: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportComplete = () => {
    if (importResult?.data) {
      onImportComplete(importResult.data)
    }
  }

  const downloadSampleCSV = () => {
    const sampleCSV = importUtils.generateSampleCSV()
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-portfolio.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">How would you like to import your holdings?</h3>
        <p className="text-gray-600">Choose the method that works best for you</p>
      </div>

      {/* CSV Import */}
      <button
        onClick={() => handleMethodSelect('csv')}
        className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Upload CSV File</h4>
            <p className="text-sm text-gray-600">
              Upload a CSV file with your holdings (Symbol, Quantity, Average Cost)
            </p>
            <p className="text-xs text-green-600 mt-1">Recommended • Supports most brokerages</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
        </div>
      </button>

      {/* Screenshot Import */}
      <button
        onClick={() => handleMethodSelect('screenshot')}
        className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <Camera className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Screenshot Upload</h4>
            <p className="text-sm text-gray-600">
              Upload a screenshot of your portfolio holdings page
            </p>
            <p className="text-xs text-purple-600 mt-1">AI-powered • Works with any brokerage</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
        </div>
      </button>

      {/* Manual Entry */}
      <button
        onClick={() => handleMethodSelect('manual')}
        className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Edit3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Manual Entry</h4>
            <p className="text-sm text-gray-600">
              Add holdings one by one with validation and price lookup
            </p>
            <p className="text-xs text-blue-600 mt-1">Precise • Good for small portfolios</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
        </div>
      </button>
    </div>
  )

  const renderCSVImport = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload CSV File</h3>
        <p className="text-gray-600">Upload a CSV file with your portfolio holdings</p>
      </div>

      {!selectedFile ? (
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">CSV files only, maximum 1MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={downloadSampleCSV}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample CSV</span>
            </button>
            
            <button
              onClick={() => {
                const example = getImportFormatExamples().csv
                alert(`CSV Format Example:\n\n${example.example}`)
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Format</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">{selectedFile.name}</span>
            <span className="text-sm text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Processing CSV file...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderScreenshotImport = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Screenshot Upload</h3>
        <p className="text-gray-600">Upload a clear screenshot of your portfolio holdings</p>
      </div>

      {!selectedFile ? (
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-colors"
          >
            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Click to upload screenshot</p>
            <p className="text-sm text-gray-500">PNG, JPG, or JPEG files, maximum 5MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📸 Tips for best results:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Make sure symbols and quantities are clearly visible</li>
              <li>• Use good lighting and avoid glare</li>
              <li>• Crop to show just the holdings table</li>
              <li>• Higher resolution images work better</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Camera className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">{selectedFile.name}</span>
            <span className="text-sm text-gray-500">({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
          </div>
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-sm">Processing screenshot with AI...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderManualEntry = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Edit3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Manual Entry</h3>
        <p className="text-gray-600">Add holdings one by one with real-time validation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
            Stock Symbol *
          </label>
          <input
            id="symbol"
            type="text"
            required
            value={manualHolding.symbol}
            onChange={(e) => setManualHolding(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            placeholder="SCHD"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Shares *
          </label>
          <input
            id="quantity"
            type="number"
            required
            min="0"
            step="1"
            value={manualHolding.quantity || ''}
            onChange={(e) => setManualHolding(prev => ({ ...prev, quantity: Number(e.target.value) }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="100"
          />
        </div>

        <div>
          <label htmlFor="averageCost" className="block text-sm font-medium text-gray-700 mb-2">
            Average Cost (Optional)
          </label>
          <input
            id="averageCost"
            type="number"
            min="0"
            step="0.01"
            value={manualHolding.averageCost || ''}
            onChange={(e) => setManualHolding(prev => ({ ...prev, averageCost: Number(e.target.value) }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="75.50"
          />
        </div>
      </div>

      <button
        onClick={handleManualAdd}
        disabled={!manualHolding.symbol || manualHolding.quantity <= 0 || isLoading}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Validating...</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Add Holding</span>
          </>
        )}
      </button>
    </div>
  )

  const renderResults = () => {
    if (!importResult) return null

    return (
      <div className="space-y-6">
        <div className="text-center">
          {importResult.success ? (
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
          )}
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {importResult.success ? 'Import Successful!' : 'Import Failed'}
          </h3>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-green-600" />
              <span>{importResult.processed} processed</span>
            </span>
            {importResult.skipped > 0 && (
              <span className="flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span>{importResult.skipped} skipped</span>
              </span>
            )}
            {importResult.errors.length > 0 && (
              <span className="flex items-center space-x-1">
                <X className="w-4 h-4 text-red-600" />
                <span>{importResult.errors.length} errors</span>
              </span>
            )}
          </div>
        </div>

        {/* Success Results */}
        {importResult.success && importResult.data && importResult.data.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Holdings Ready to Import:</h4>
            <div className="space-y-2">
              {importResult.data.map((holding, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-semibold text-gray-900">{holding.symbol}</span>
                    <span className="text-gray-600">{holding.name}</span>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{holding.quantity.toLocaleString()} shares</div>
                    {holding.averageCost && <div>${holding.averageCost.toFixed(2)} avg</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {importResult.warnings.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Warnings:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {importResult.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors */}
        {importResult.errors.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2 flex items-center">
              <X className="w-4 h-4 mr-2" />
              Errors:
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              {importResult.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={() => {
              setMethod(null)
              setImportResult(null)
              setSelectedFile(null)
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Try Another Method
          </button>

          {importResult.success && importResult.data && importResult.data.length > 0 && (
            <button
              onClick={handleImportComplete}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Import {importResult.data.length} Holdings
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Import Portfolio Data</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!method && renderMethodSelection()}
      {method === 'csv' && !importResult && renderCSVImport()}
      {method === 'screenshot' && !importResult && renderScreenshotImport()}
      {method === 'manual' && !importResult && renderManualEntry()}
      {importResult && renderResults()}
    </div>
  )
}