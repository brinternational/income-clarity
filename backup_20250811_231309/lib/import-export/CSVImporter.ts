import Papa from 'papaparse'

export interface ParsedPortfolioData {
  name: string
  description?: string
}

export interface ParsedHoldingData {
  ticker: string
  shares: number
  averagePrice: number
  currentPrice?: number
  portfolioName?: string
}

export interface ParsedTransactionData {
  ticker: string
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'SPLIT' | 'MERGER'
  shares?: number
  amount: number
  date: string
  notes?: string
  portfolioName?: string
}

export interface ParsedPriceData {
  ticker: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjustedClose?: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  validRowsCount: number
  totalRowsCount: number
}

export interface ImportResult<T> {
  success: boolean
  data: T[]
  validation: ValidationResult
  message?: string
}

export class CSVImporter {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly REQUIRED_PORTFOLIO_HEADERS = ['name']
  private static readonly REQUIRED_HOLDINGS_HEADERS = ['ticker', 'shares', 'averagePrice']
  private static readonly REQUIRED_TRANSACTION_HEADERS = ['ticker', 'type', 'amount', 'date']
  private static readonly REQUIRED_PRICE_HEADERS = ['ticker', 'date', 'open', 'high', 'low', 'close', 'volume']

  /**
   * Parse CSV file containing portfolio data
   */
  async parsePortfolioCSV(file: File): Promise<ImportResult<ParsedPortfolioData>> {
    try {
      // Validate file
      const fileValidation = this.validateFile(file)
      if (!fileValidation.isValid) {
        return {
          success: false,
          data: [],
          validation: fileValidation,
          message: fileValidation.errors.join(', ')
        }
      }

      // Parse CSV
      const csvData = await this.parseCSVFile(file)
      if (!csvData.success) {
        return {
          success: false,
          data: [],
          validation: {
            isValid: false,
            errors: [csvData.error || 'Failed to parse CSV'],
            warnings: [],
            validRowsCount: 0,
            totalRowsCount: 0
          }
        }
      }

      // Validate headers
      const headerValidation = this.validateHeaders(
        csvData.meta?.fields || [],
        CSVImporter.REQUIRED_PORTFOLIO_HEADERS,
        ['description']
      )

      if (!headerValidation.isValid) {
        return {
          success: false,
          data: [],
          validation: headerValidation
        }
      }

      // Process and validate data
      const processedData: ParsedPortfolioData[] = []
      const validation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        validRowsCount: 0,
        totalRowsCount: csvData.data?.length || 0
      }

      if (csvData.data) {
        for (let i = 0; i < csvData.data.length; i++) {
          const row = csvData.data[i]
          const rowValidation = this.validatePortfolioRow(row, i + 1)
          
          if (rowValidation.isValid) {
            processedData.push({
              name: row.name?.trim() || '',
              description: row.description?.trim() || undefined
            })
            validation.validRowsCount++
          } else {
            validation.errors.push(...rowValidation.errors)
          }
          
          validation.warnings.push(...rowValidation.warnings)
        }
      }

      validation.isValid = validation.errors.length === 0

      return {
        success: validation.isValid,
        data: processedData,
        validation,
        message: validation.isValid 
          ? `Successfully parsed ${validation.validRowsCount} portfolios`
          : `Parsing completed with errors`
      }

    } catch (error) {
      // console.error('Error parsing portfolio CSV:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }) i++) {
          const row = csvData.data[i]
          const rowValidation = this.validateHoldingRow(row, i + 1)
          
          if (rowValidation.isValid) {
            processedData.push({
              ticker: row.ticker?.trim().toUpperCase() || '',
              shares: parseFloat(row.shares) || 0,
              averagePrice: parseFloat(row.averagePrice) || 0,
              currentPrice: row.currentPrice ? parseFloat(row.currentPrice) : undefined,
              portfolioName: row.portfolioName?.trim() || undefined
            })
            validation.validRowsCount++
          } else {
            validation.errors.push(...rowValidation.errors)
          }
          
          validation.warnings.push(...rowValidation.warnings)
        }
      }

      validation.isValid = validation.errors.length === 0

      return {
        success: validation.isValid,
        data: processedData,
        validation,
        message: validation.isValid 
          ? `Successfully parsed ${validation.validRowsCount} holdings`
          : `Parsing completed with errors`
      }

    } catch (error) {
      // console.error('Error parsing holdings CSV:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }) i++) {
          const row = csvData.data[i]
          const rowValidation = this.validateTransactionRow(row, i + 1)
          
          if (rowValidation.isValid) {
            processedData.push({
              ticker: row.ticker?.trim().toUpperCase() || '',
              type: (row.type?.trim().toUpperCase() as any) || 'BUY',
              shares: row.shares ? parseFloat(row.shares) : undefined,
              amount: parseFloat(row.amount) || 0,
              date: row.date?.trim() || '',
              notes: row.notes?.trim() || undefined,
              portfolioName: row.portfolioName?.trim() || undefined
            })
            validation.validRowsCount++
          } else {
            validation.errors.push(...rowValidation.errors)
          }
          
          validation.warnings.push(...rowValidation.warnings)
        }
      }

      validation.isValid = validation.errors.length === 0

      return {
        success: validation.isValid,
        data: processedData,
        validation,
        message: validation.isValid 
          ? `Successfully parsed ${validation.validRowsCount} transactions`
          : `Parsing completed with errors`
      }

    } catch (error) {
      // console.error('Error parsing transaction CSV:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }) i++) {
          const row = csvData.data[i]
          const rowValidation = this.validatePriceRow(row, i + 1)
          
          if (rowValidation.isValid) {
            processedData.push({
              ticker: row.ticker?.trim().toUpperCase() || '',
              date: row.date?.trim() || '',
              open: parseFloat(row.open) || 0,
              high: parseFloat(row.high) || 0,
              low: parseFloat(row.low) || 0,
              close: parseFloat(row.close) || 0,
              volume: Math.floor(parseFloat(row.volume)) || 0,
              adjustedClose: row.adjustedclose ? parseFloat(row.adjustedclose) : undefined
            })
            validation.validRowsCount++
          } else {
            validation.errors.push(...rowValidation.errors)
          }
          
          validation.warnings.push(...rowValidation.warnings)
        }
      }

      validation.isValid = validation.errors.length === 0

      return {
        success: validation.isValid,
        data: processedData,
        validation,
        message: validation.isValid 
          ? `Successfully parsed ${validation.validRowsCount} price records`
          : `Parsing completed with errors`
      }

    } catch (error) {
      // console.error('Error parsing price CSV:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })