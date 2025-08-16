/**
 * Data Import Utilities - Multiple ways to get portfolio data quickly
 * Implements ONBOARD-006: Data Import Options
 * 
 * Supports CSV import, manual entry, OCR screenshot parsing,
 * and future brokerage API connections
 */

export interface ImportResult<T> {
  success: boolean
  data?: T[]
  errors: string[]
  warnings: string[]
  processed: number
  skipped: number
}

export interface ImportedHolding {
  symbol: string
  name?: string
  quantity: number
  averageCost?: number
  currentValue?: number
  costBasis?: number
  sector?: string
  dividendYield?: number
  source: 'csv' | 'manual' | 'ocr' | 'api'
  confidence?: number // For OCR imports
}

export interface ImportOptions {
  skipDuplicates: boolean
  validateSymbols: boolean
  fetchCurrentPrices: boolean
  autoDetectFormat: boolean
  cleanupData: boolean
}

export interface CSVFormat {
  symbolColumn: string
  quantityColumn: string
  costBasisColumn?: string
  averageCostColumn?: string
  nameColumn?: string
  hasHeaders: boolean
  delimiter: ',' | ';' | '\t'
}

export interface BrokerageConnection {
  provider: 'schwab' | 'fidelity' | 'vanguard' | 'robinhood' | 'etrade'
  status: 'connected' | 'pending' | 'error' | 'disconnected'
  lastSync?: Date
  holdings?: number
  error?: string
}

export class ImportUtils {
  private static instance: ImportUtils
  
  static getInstance(): ImportUtils {
    if (!ImportUtils.instance) {
      ImportUtils.instance = new ImportUtils()
    }
    return ImportUtils.instance
  }

  /**
   * Parse CSV file and extract holdings data
   */
  async parseCSV(
    csvContent: string, 
    format?: Partial<CSVFormat>, 
    options: Partial<ImportOptions> = {}
  ): Promise<ImportResult<ImportedHolding>> {
    const defaultOptions: ImportOptions = {
      skipDuplicates: true,
      validateSymbols: true,
      fetchCurrentPrices: false,
      autoDetectFormat: true,
      cleanupData: true,
      ...options
    }

    const result: ImportResult<ImportedHolding> = {
      success: false,
      data: [],
      errors: [],
      warnings: [],
      processed: 0,
      skipped: 0
    }

    try {
      // Auto-detect format if not provided
      const detectedFormat = format || this.detectCSVFormat(csvContent)
      
      // Parse CSV content
      const rows = this.parseCSVRows(csvContent, detectedFormat.delimiter)
      
      if (rows.length === 0) {
        result.errors.push('CSV file appears to be empty')
        return result
      }

      // Skip header row if present
      const dataRows = detectedFormat.hasHeaders ? rows.slice(1) : rows
      const headers = detectedFormat.hasHeaders ? rows[0] : []

      // Find column indices
      const columnIndices = this.findColumnIndices(headers, detectedFormat)

      // Process each row
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        const lineNumber = detectedFormat.hasHeaders ? i + 2 : i + 1

        try {
          const holding = await this.parseHoldingRow(row, columnIndices, defaultOptions)
          if (holding) {
            holding.source = 'csv'
            result.data!.push(holding)
            result.processed++
          } else {
            result.skipped++
          }
        } catch (error) {
          result.errors.push(`Line ${lineNumber}: ${error instanceof Error ? error.message : 'Parse error'}`)
          result.skipped++
        }
      }

      // Validate and enhance data
      if (defaultOptions.validateSymbols) {
        await this.validateSymbols(result.data!)
      }

      if (defaultOptions.fetchCurrentPrices) {
        await this.fetchCurrentPrices(result.data!)
      }

      result.success = result.data!.length > 0
      
      if (result.errors.length > 0 && result.data!.length === 0) {
        result.success = false
      }

    } catch (error) {
      result.errors.push(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Parse holdings from screenshot using OCR (basic implementation)
   */
  async parseScreenshot(
    imageFile: File,
    options: Partial<ImportOptions> = {}
  ): Promise<ImportResult<ImportedHolding>> {
    const result: ImportResult<ImportedHolding> = {
      success: false,
      data: [],
      errors: [],
      warnings: [],
      processed: 0,
      skipped: 0
    }

    try {
      // Convert image to text (would use real OCR service in production)
      const ocrText = await this.performOCR(imageFile)
      
      if (!ocrText || ocrText.trim().length === 0) {
        result.errors.push('No text found in image. Please ensure the screenshot is clear and contains portfolio data.')
        return result
      }

      // Parse holdings from OCR text
      const holdings = await this.parseOCRText(ocrText)
      
      // Add confidence scores and validate
      for (const holding of holdings) {
        holding.source = 'ocr'
        holding.confidence = this.calculateOCRConfidence(holding)
        
        if (holding.confidence && holding.confidence > 0.7) {
          result.data!.push(holding)
          result.processed++
        } else {
          result.warnings.push(`Low confidence for ${holding.symbol}: ${holding.confidence?.toFixed(2)}`)
          result.skipped++
        }
      }

      // Validate symbols if requested
      if (options.validateSymbols) {
        await this.validateSymbols(result.data!)
      }

      result.success = result.data!.length > 0

    } catch (error) {
      result.errors.push(`Screenshot parsing failed: ${error instanceof Error ? error.message : 'OCR error'}`)
    }

    return result
  }

  /**
   * Manual holding entry with validation
   */
  async addManualHolding(
    symbol: string,
    quantity: number,
    averageCost?: number,
    options: Partial<ImportOptions> = {}
  ): Promise<ImportResult<ImportedHolding>> {
    const result: ImportResult<ImportedHolding> = {
      success: false,
      data: [],
      errors: [],
      warnings: [],
      processed: 0,
      skipped: 0
    }

    try {
      // Clean up symbol
      const cleanSymbol = symbol.toUpperCase().trim()

      // Validate symbol format
      if (!/^[A-Z]{1,5}$/.test(cleanSymbol)) {
        result.errors.push('Invalid symbol format. Use 1-5 capital letters only.')
        return result
      }

      // Validate quantity
      if (quantity <= 0) {
        result.errors.push('Quantity must be greater than 0')
        return result
      }

      // Validate average cost if provided
      if (averageCost !== undefined && averageCost <= 0) {
        result.errors.push('Average cost must be greater than 0 if provided')
        return result
      }

      // Create holding
      const holding: ImportedHolding = {
        symbol: cleanSymbol,
        quantity,
        averageCost,
        source: 'manual'
      }

      // Fetch additional data
      if (options.fetchCurrentPrices || options.validateSymbols) {
        const stockData = await this.fetchStockData(cleanSymbol)
        if (stockData) {
          holding.name = stockData.name
          holding.currentValue = stockData.price * quantity
          holding.sector = stockData.sector
          holding.dividendYield = stockData.dividendYield
        } else if (options.validateSymbols) {
          result.errors.push(`Symbol ${cleanSymbol} not found or invalid`)
          return result
        }
      }

      result.data = [holding]
      result.processed = 1
      result.success = true

    } catch (error) {
      result.errors.push(`Manual entry failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Get supported brokerage connections (future feature)
   */
  getSupportedBrokerages(): Array<{
    id: string
    name: string
    logo: string
    status: 'available' | 'beta' | 'coming_soon'
    features: string[]
    oauth: boolean
  }> {
    return [
      {
        id: 'schwab',
        name: 'Charles Schwab',
        logo: '/brokers/schwab.png',
        status: 'coming_soon',
        features: ['Holdings Import', 'Real-time Sync', 'Dividend Calendar'],
        oauth: true
      },
      {
        id: 'fidelity', 
        name: 'Fidelity',
        logo: '/brokers/fidelity.png',
        status: 'coming_soon',
        features: ['Holdings Import', 'Transaction History', 'Tax Documents'],
        oauth: true
      },
      {
        id: 'vanguard',
        name: 'Vanguard',
        logo: '/brokers/vanguard.png', 
        status: 'coming_soon',
        features: ['Holdings Import', 'Performance Tracking'],
        oauth: true
      },
      {
        id: 'robinhood',
        name: 'Robinhood',
        logo: '/brokers/robinhood.png',
        status: 'beta',
        features: ['Holdings Import', 'Real-time Quotes'],
        oauth: true
      }
    ]
  }

  /**
   * Generate sample CSV template
   */
  generateSampleCSV(): string {
    const samples = [
      'Symbol,Quantity,Average Cost,Name',
      'SCHD,150,75.50,"Schwab US Dividend Equity ETF"',
      'VYM,100,108.25,"Vanguard High Dividend Yield ETF"',  
      'SPHD,200,42.15,"Invesco S&P 500 High Dividend Low Volatility ETF"',
      'DGRO,75,55.75,"iShares Core Dividend Growth ETF"'
    ]
    
    return samples.join('\n')
  }

  /**
   * Detect CSV format automatically
   */
  private detectCSVFormat(csvContent: string): CSVFormat {
    const lines = csvContent.split('\n').slice(0, 5) // Check first 5 lines
    
    // Detect delimiter
    const delimiters = [',', ';', '\t']
    let bestDelimiter = ','
    let maxColumns = 0
    
    for (const delimiter of delimiters) {
      const avgColumns = lines.reduce((sum, line) => sum + line.split(delimiter).length, 0) / lines.length
      if (avgColumns > maxColumns) {
        maxColumns = avgColumns
        bestDelimiter = delimiter
      }
    }

    // Detect if first row is headers
    const firstRow = lines[0]?.split(bestDelimiter) || []
    const hasHeaders = firstRow.some(cell => 
      /symbol|quantity|shares|cost|price|name|ticker/i.test(cell)
    )

    // Find column mappings
    const symbolColumn = this.findColumnName(firstRow, ['symbol', 'ticker', 'stock']) || 'symbol'
    const quantityColumn = this.findColumnName(firstRow, ['quantity', 'shares', 'qty']) || 'quantity'
    const costBasisColumn = this.findColumnName(firstRow, ['cost basis', 'total cost', 'cost_basis'])
    const averageCostColumn = this.findColumnName(firstRow, ['average cost', 'avg cost', 'price', 'cost']) || 'average_cost'
    const nameColumn = this.findColumnName(firstRow, ['name', 'company', 'description'])

    return {
      symbolColumn,
      quantityColumn,
      costBasisColumn,
      averageCostColumn,
      nameColumn,
      hasHeaders,
      delimiter: bestDelimiter as ',' | ';' | '\t'
    }
  }

  /**
   * Find column name from headers
   */
  private findColumnName(headers: string[], candidates: string[]): string | undefined {
    for (const candidate of candidates) {
      const found = headers.find(header => 
        header.toLowerCase().includes(candidate.toLowerCase())
      )
      if (found) return found
    }
    return undefined
  }

  /**
   * Parse CSV rows
   */
  private parseCSVRows(content: string, delimiter: string): string[][] {
    const lines = content.split('\n').filter(line => line.trim())
    return lines.map(line => line.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, '')))
  }

  /**
   * Find column indices in data
   */
  private findColumnIndices(headers: string[], format: CSVFormat): Record<string, number> {
    const indices: Record<string, number> = {}
    
    if (format.hasHeaders) {
      indices.symbol = headers.findIndex(h => h.toLowerCase() === format.symbolColumn.toLowerCase())
      indices.quantity = headers.findIndex(h => h.toLowerCase() === format.quantityColumn.toLowerCase())
      
      if (format.averageCostColumn) {
        indices.averageCost = headers.findIndex(h => h.toLowerCase() === format.averageCostColumn!.toLowerCase())
      }
      if (format.nameColumn) {
        indices.name = headers.findIndex(h => h.toLowerCase() === format.nameColumn!.toLowerCase())
      }
    } else {
      // Assume standard order: Symbol, Quantity, Average Cost
      indices.symbol = 0
      indices.quantity = 1
      indices.averageCost = 2
    }

    return indices
  }

  /**
   * Parse individual holding row
   */
  private async parseHoldingRow(
    row: string[], 
    indices: Record<string, number>, 
    options: ImportOptions
  ): Promise<ImportedHolding | null> {
    // Extract symbol
    const symbol = row[indices.symbol]?.toUpperCase().trim()
    if (!symbol || !/^[A-Z]{1,5}$/.test(symbol)) {
      throw new Error(`Invalid symbol: ${symbol}`)
    }

    // Extract quantity
    const quantityStr = row[indices.quantity]?.replace(/,/g, '')
    const quantity = parseFloat(quantityStr)
    if (!quantityStr || isNaN(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity: ${quantityStr}`)
    }

    // Extract average cost (optional)
    let averageCost: number | undefined
    if (indices.averageCost !== undefined && indices.averageCost >= 0) {
      const costStr = row[indices.averageCost]?.replace(/[$,]/g, '')
      if (costStr) {
        averageCost = parseFloat(costStr)
        if (isNaN(averageCost) || averageCost <= 0) {
          averageCost = undefined
        }
      }
    }

    // Extract name (optional)
    const name = indices.name !== undefined && indices.name >= 0 ? 
      row[indices.name]?.trim() : undefined

    return {
      symbol,
      quantity,
      averageCost,
      name,
      source: 'csv'
    }
  }

  /**
   * Validate stock symbols
   */
  private async validateSymbols(holdings: ImportedHolding[]): Promise<void> {
    // This would use a real stock API in production
    // For now, just check against common ETFs
    const validSymbols = new Set([
      'SCHD', 'VYM', 'DVY', 'NOBL', 'VIG', 'DGRO', 'SPHD', 'HDV', 'SPYD', 'JEPI',
      'SPY', 'QQQ', 'VTI', 'VXUS', 'BND', 'VEA', 'VWO', 'AAPL', 'MSFT', 'GOOGL',
      'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'CRM', 'ADBE', 'PYPL'
    ])

    for (const holding of holdings) {
      if (!validSymbols.has(holding.symbol)) {
        // In production, would make API call to validate
        holding.sector = 'Unknown'
      }
    }
  }

  /**
   * Fetch current prices (mock implementation)
   */
  private async fetchCurrentPrices(holdings: ImportedHolding[]): Promise<void> {
    // Mock prices for demo
    const mockPrices: Record<string, number> = {
      'SCHD': 79.45,
      'VYM': 112.80,
      'DVY': 132.15,
      'SPHD': 44.60,
      'DGRO': 58.90
    }

    for (const holding of holdings) {
      const price = mockPrices[holding.symbol] || 100
      holding.currentValue = price * holding.quantity
    }
  }

  /**
   * Fetch stock data (mock implementation)
   */
  private async fetchStockData(symbol: string): Promise<{
    name: string
    price: number
    sector: string
    dividendYield: number
  } | null> {
    // Mock data for demo
    const mockData: Record<string, any> = {
      'SCHD': { name: 'Schwab US Dividend Equity ETF', price: 79.45, sector: 'Diversified', dividendYield: 0.035 },
      'VYM': { name: 'Vanguard High Dividend Yield ETF', price: 112.80, sector: 'Diversified', dividendYield: 0.029 },
      'SPHD': { name: 'Invesco S&P 500 High Dividend Low Volatility ETF', price: 44.60, sector: 'Value', dividendYield: 0.041 }
    }

    return mockData[symbol] || null
  }

  /**
   * Perform OCR on image (mock implementation)
   */
  private async performOCR(imageFile: File): Promise<string> {
    // In production, would use Google Vision API, AWS Textract, or similar
    // For demo, return mock OCR text
    return `
Portfolio Holdings
Symbol    Shares    Price     Value
SCHD      150       $79.45    $11,917.50
VYM       100       $112.80   $11,280.00
SPHD      200       $44.60    $8,920.00
    `
  }

  /**
   * Parse OCR text to extract holdings
   */
  private async parseOCRText(ocrText: string): Promise<ImportedHolding[]> {
    const holdings: ImportedHolding[] = []
    const lines = ocrText.split('\n')
    
    for (const line of lines) {
      // Look for pattern: SYMBOL spaces NUMBER
      const match = line.match(/([A-Z]{2,5})\s+(\d+\.?\d*)/g)
      if (match) {
        const parts = line.trim().split(/\s+/)
        if (parts.length >= 2) {
          const symbol = parts[0]
          const quantity = parseFloat(parts[1])
          
          if (/^[A-Z]{2,5}$/.test(symbol) && quantity > 0) {
            holdings.push({
              symbol,
              quantity,
              source: 'ocr'
            })
          }
        }
      }
    }

    return holdings
  }

  /**
   * Calculate confidence score for OCR results
   */
  private calculateOCRConfidence(holding: ImportedHolding): number {
    let confidence = 0.5 // Base confidence

    // Symbol validation
    if (/^[A-Z]{2,5}$/.test(holding.symbol)) {
      confidence += 0.3
    }

    // Quantity validation  
    if (holding.quantity && holding.quantity > 0 && holding.quantity % 1 === 0) {
      confidence += 0.2 // Integer quantities are more likely correct
    }

    return Math.min(confidence, 1.0)
  }
}

// Export singleton instance
export const importUtils = ImportUtils.getInstance()

/**
 * Helper functions for import UI components
 */
export const getImportFormatExamples = () => ({
  csv: {
    title: 'CSV File Format',
    description: 'Upload a CSV file with your holdings',
    example: 'Symbol,Quantity,Average Cost\nSCHD,150,75.50\nVYM,100,108.25',
    accept: '.csv'
  },
  screenshot: {
    title: 'Portfolio Screenshot',
    description: 'Upload a screenshot of your portfolio',
    example: 'Clear image showing symbols, shares, and values',
    accept: 'image/*'
  },
  manual: {
    title: 'Manual Entry',
    description: 'Add holdings one by one',
    example: 'Enter symbol, quantity, and optional cost basis'
  }
})

export const validateImportFile = (file: File, type: 'csv' | 'image'): string | null => {
  if (type === 'csv') {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Please upload a CSV file'
    }
    if (file.size > 1024 * 1024) { // 1MB limit
      return 'CSV file too large. Maximum size is 1MB'
    }
  } else if (type === 'image') {
    if (!file.type.startsWith('image/')) {
      return 'Please upload an image file'  
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return 'Image file too large. Maximum size is 5MB'
    }
  }
  
  return null
}