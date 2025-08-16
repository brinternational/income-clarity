import * as XLSX from 'xlsx'
import { 
  ParsedPortfolioData, 
  ParsedHoldingData, 
  ParsedTransactionData, 
  ValidationResult, 
  ImportResult 
} from './CSVImporter'

export interface ExcelParseOptions {
  sheetName?: string
  startRow?: number
  headerRow?: number
  maxRows?: number
}

export class ExcelImporter {
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  private static readonly SUPPORTED_EXTENSIONS = ['.xlsx', '.xls', '.xlsm']

  /**
   * Parse Excel file with multiple sheets
   * Attempts to find and parse portfolios, holdings, and transactions
   */
  async parseExcelFile(file: File): Promise<{
    success: boolean
    portfolios?: ImportResult<ParsedPortfolioData>
    holdings?: ImportResult<ParsedHoldingData>
    transactions?: ImportResult<ParsedTransactionData>
    availableSheets?: string[]
    error?: string
  }> {
    try {
      // Validate file
      const fileValidation = this.validateFile(file)
      if (!fileValidation.isValid) {
        return {
          success: false,
          error: fileValidation.errors.join(', ')
        }
      }

      // Read Excel file
      const buffer = await this.readFileAsBuffer(file)
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetNames = workbook.SheetNames

      if (sheetNames.length === 0) {
        return {
          success: false,
          error: 'No sheets found in Excel file'
        }
      }

      const results: any = {
        success: true,
        availableSheets: sheetNames
      }

      // Try to parse each sheet type
      for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName]
        const sheetData = this.convertSheetToJSON(sheet)

        if (sheetData.length === 0) continue

        const normalizedSheetName = sheetName.toLowerCase()

        // Determine sheet type and parse accordingly
        if (normalizedSheetName.includes('portfolio') || normalizedSheetName.includes('account')) {
          try {
            results.portfolios = await this.parsePortfolioData(sheetData, sheetName)
          } catch (error) {
            // Error handled by emergency recovery script else if (normalizedSheetName.includes('holding') || normalizedSheetName.includes('position')) {
          try {
            results.holdings = await this.parseHoldingsData(sheetData, sheetName)
          } catch (error) {
            // Error handled by emergency recovery script else if (normalizedSheetName.includes('transaction') || normalizedSheetName.includes('trade') || normalizedSheetName.includes('activity')) {
          try {
            results.transactions = await this.parseTransactionData(sheetData, sheetName)
          } catch (error) {
            // Error handled by emergency recovery script
      }

      // If no specific sheets found, try to parse the first sheet
      if (!results.portfolios && !results.holdings && !results.transactions && sheetNames.length > 0) {
        const firstSheet = workbook.Sheets[sheetNames[0]]
        const firstSheetData = this.convertSheetToJSON(firstSheet)
        
        if (firstSheetData.length > 0) {
          // Try to determine data type from headers
          const headers = Object.keys(firstSheetData[0] || {}).map(h => h.toLowerCase())
          
          if (this.hasPortfolioHeaders(headers)) {
            results.portfolios = await this.parsePortfolioData(firstSheetData, sheetNames[0])
          } else if (this.hasTransactionHeaders(headers)) {
            results.transactions = await this.parseTransactionData(firstSheetData, sheetNames[0])
          } else if (this.hasHoldingHeaders(headers)) {
            results.holdings = await this.parseHoldingsData(firstSheetData, sheetNames[0])
          }
        }
      }

      return results

    } catch (error) {
      // console.error('Error parsing Excel file:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }) i++) {
      const row = sheetData[i]
      
      if (!row.name || !row.name.trim()) {
        validation.errors.push(`Row ${i + 1}: Portfolio name is required`)
        continue
      }

      processedData.push({
        name: row.name.trim(),
        description: row.description?.trim() || undefined
      })
      validation.validRowsCount++
    }

    validation.isValid = validation.errors.length === 0

    return {
      success: validation.isValid,
      data: processedData,
      validation,
      message: `Parsed ${validation.validRowsCount} portfolios from sheet "${sheetName}"`
    }
  }

  /**
   * Parse holdings data from sheet data
   */
  private async parseHoldingsData(sheetData: any[], sheetName: string): Promise<ImportResult<ParsedHoldingData>> {
    const processedData: ParsedHoldingData[] = []
    const validation: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      validRowsCount: 0,
      totalRowsCount: sheetData.length
    }

    if (sheetData.length === 0) {
      validation.errors.push(`Sheet "${sheetName}" contains no data`)
      validation.isValid = false
      return { success: false, data: [], validation }
    }

    const headers = Object.keys(sheetData[0]).map(h => h.toLowerCase())
    const requiredHeaders = ['ticker', 'shares', 'averageprice']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      validation.errors.push(`Sheet "${sheetName}" missing required columns: ${missingHeaders.join(', ')}`)
      validation.isValid = false
      return { success: false, data: [], validation }
    }

    // Process each row
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i]
      const rowErrors: string[] = []
      
      if (!row.ticker || !row.ticker.trim()) {
        rowErrors.push(`Row ${i + 1}: Ticker is required`)
      }

      const shares = parseFloat(row.shares)
      if (isNaN(shares) || shares <= 0) {
        rowErrors.push(`Row ${i + 1}: Invalid shares value`)
      }

      const averagePrice = parseFloat(row.averageprice)
      if (isNaN(averagePrice) || averagePrice <= 0) {
        rowErrors.push(`Row ${i + 1}: Invalid average price value`)
      }

      if (rowErrors.length > 0) {
        validation.errors.push(...rowErrors)
        continue
      }

      processedData.push({
        ticker: row.ticker.trim().toUpperCase(),
        shares,
        averagePrice,
        currentPrice: row.currentprice ? parseFloat(row.currentprice) : undefined,
        portfolioName: row.portfolioname?.trim() || undefined
      })
      validation.validRowsCount++
    }

    validation.isValid = validation.errors.length === 0

    return {
      success: validation.isValid,
      data: processedData,
      validation,
      message: `Parsed ${validation.validRowsCount} holdings from sheet "${sheetName}"`
    }
  }

  /**
   * Parse transaction data from sheet data
   */
  private async parseTransactionData(sheetData: any[], sheetName: string): Promise<ImportResult<ParsedTransactionData>> {
    const processedData: ParsedTransactionData[] = []
    const validation: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      validRowsCount: 0,
      totalRowsCount: sheetData.length
    }

    if (sheetData.length === 0) {
      validation.errors.push(`Sheet "${sheetName}" contains no data`)
      validation.isValid = false
      return { success: false, data: [], validation }
    }

    const headers = Object.keys(sheetData[0]).map(h => h.toLowerCase())
    const requiredHeaders = ['ticker', 'type', 'amount', 'date']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      validation.errors.push(`Sheet "${sheetName}" missing required columns: ${missingHeaders.join(', ')}`)
      validation.isValid = false
      return { success: false, data: [], validation }
    }

    const validTypes = ['BUY', 'SELL', 'DIVIDEND', 'INTEREST', 'SPLIT', 'MERGER']

    // Process each row
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i]
      const rowErrors: string[] = []
      
      if (!row.ticker || !row.ticker.trim()) {
        rowErrors.push(`Row ${i + 1}: Ticker is required`)
      }

      if (!row.type || !validTypes.includes(row.type.trim().toUpperCase())) {
        rowErrors.push(`Row ${i + 1}: Invalid transaction type`)
      }

      const amount = parseFloat(row.amount)
      if (isNaN(amount) || amount <= 0) {
        rowErrors.push(`Row ${i + 1}: Invalid amount value`)
      }

      if (!row.date || !row.date.trim()) {
        rowErrors.push(`Row ${i + 1}: Date is required`)
      } else {
        const date = new Date(row.date.trim())
        if (isNaN(date.getTime())) {
          rowErrors.push(`Row ${i + 1}: Invalid date format`)
        }
      }

      if (rowErrors.length > 0) {
        validation.errors.push(...rowErrors)
        continue
      }

      processedData.push({
        ticker: row.ticker.trim().toUpperCase(),
        type: row.type.trim().toUpperCase() as any,
        shares: row.shares ? parseFloat(row.shares) : undefined,
        amount,
        date: row.date.trim(),
        notes: row.notes?.trim() || undefined,
        portfolioName: row.portfolioname?.trim() || undefined
      })
      validation.validRowsCount++
    }

    validation.isValid = validation.errors.length === 0

    return {
      success: validation.isValid,
      data: processedData,
      validation,
      message: `Parsed ${validation.validRowsCount} transactions from sheet "${sheetName}"`
    }
  }

  /**
   * Check if headers suggest portfolio data
   */
  private hasPortfolioHeaders(headers: string[]): boolean {
    return headers.includes('name') && 
           !headers.includes('ticker') && 
           !headers.includes('shares')
  }

  /**
   * Check if headers suggest holdings data
   */
  private hasHoldingHeaders(headers: string[]): boolean {
    return headers.includes('ticker') && 
           headers.includes('shares') && 
           (headers.includes('averageprice') || headers.includes('price'))
  }

  /**
   * Check if headers suggest transaction data
   */
  private hasTransactionHeaders(headers: string[]): boolean {
    return headers.includes('ticker') && 
           headers.includes('type') && 
           headers.includes('amount') && 
           headers.includes('date')
  }
}