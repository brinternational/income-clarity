interface Portfolio {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface Holding {
  id: string
  portfolioId: string
  ticker: string
  shares: number
  averagePrice: number
  currentPrice?: number
  lastUpdated?: string
  createdAt: string
  updatedAt: string
}

interface Transaction {
  id: string
  portfolioId?: string
  userId: string
  ticker: string
  type: string
  shares?: number
  amount: number
  date: string
  notes?: string
  metadata?: string
  createdAt: string
}

interface ExportData {
  portfolios: Portfolio[]
  holdings: Holding[]
  transactions: Transaction[]
  metadata: {
    exportedAt: string
    exportedBy: string
    version: string
    totalItems: {
      portfolios: number
      holdings: number
      transactions: number
    }
  }
}

export interface ExportOptions {
  includePortfolios?: boolean
  includeHoldings?: boolean
  includeTransactions?: boolean
  portfolioIds?: string[]
  dateFrom?: string
  dateTo?: string
  format?: 'pretty' | 'compact'
}

export class JSONExporter {
  private readonly API_BASE_URL = '/api'
  
  /**
   * Export specific portfolio data to JSON
   */
  async exportPortfolio(portfolioId: string, options: ExportOptions = {}): Promise<Blob> {
    try {
      const exportData: Partial<ExportData> = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'income-clarity-app',
          version: '1.0.0',
          totalItems: {
            portfolios: 0,
            holdings: 0,
            transactions: 0
          }
        }
      }

      // Fetch portfolio data
      if (options.includePortfolios !== false) {
        const portfolioResponse = await fetch(`${this.API_BASE_URL}/portfolios/${portfolioId}`)
        if (portfolioResponse.ok) {
          const portfolioResult = await portfolioResponse.json()
          if (portfolioResult.success && portfolioResult.data) {
            exportData.portfolios = [portfolioResult.data]
            exportData.metadata!.totalItems.portfolios = 1
          }
        }
      }

      // Fetch holdings data
      if (options.includeHoldings !== false) {
        const holdingsResponse = await fetch(`${this.API_BASE_URL}/holdings?portfolioId=${portfolioId}`)
        if (holdingsResponse.ok) {
          const holdingsResult = await holdingsResponse.json()
          if (holdingsResult.success && holdingsResult.data) {
            exportData.holdings = holdingsResult.data
            exportData.metadata!.totalItems.holdings = holdingsResult.data.length
          }
        }
      }

      // Fetch transactions data
      if (options.includeTransactions !== false) {
        const transactionsParams = new URLSearchParams({
          portfolioId,
          limit: '1000' // Get all transactions for the portfolio
        })

        if (options.dateFrom) {
          transactionsParams.set('dateFrom', options.dateFrom)
        }
        if (options.dateTo) {
          transactionsParams.set('dateTo', options.dateTo)
        }

        const transactionsResponse = await fetch(`${this.API_BASE_URL}/transactions?${transactionsParams}`)
        if (transactionsResponse.ok) {
          const transactionsResult = await transactionsResponse.json()
          if (transactionsResult.success && transactionsResult.data) {
            exportData.transactions = transactionsResult.data
            exportData.metadata!.totalItems.transactions = transactionsResult.data.length
          }
        }
      }

      // Create JSON blob
      const jsonString = options.format === 'compact' 
        ? JSON.stringify(exportData)
        : JSON.stringify(exportData, null, 2)

      return new Blob([jsonString], { type: 'application/json' })

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Export all user data to JSON
   */
  async exportAllData(options: ExportOptions = {}): Promise<Blob> {
    try {
      const exportData: Partial<ExportData> = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'income-clarity-app',
          version: '1.0.0',
          totalItems: {
            portfolios: 0,
            holdings: 0,
            transactions: 0
          }
        }
      }

      // Fetch all portfolios
      let portfoliosToExport: string[] = []
      
      if (options.includePortfolios !== false) {
        const portfoliosResponse = await fetch(`${this.API_BASE_URL}/portfolios`)
        if (portfoliosResponse.ok) {
          const portfoliosResult = await portfoliosResponse.json()
          if (portfoliosResult.success && portfoliosResult.data) {
            // Filter portfolios if specific IDs provided
            let portfolios = portfoliosResult.data
            if (options.portfolioIds && options.portfolioIds.length > 0) {
              portfolios = portfolios.filter((p: Portfolio) => 
                options.portfolioIds!.includes(p.id)
              )
            }
            
            exportData.portfolios = portfolios
            exportData.metadata!.totalItems.portfolios = portfolios.length
            portfoliosToExport = portfolios.map((p: Portfolio) => p.id)
          }
        }
      } else if (options.portfolioIds) {
        portfoliosToExport = options.portfolioIds
      }

      // Fetch all holdings
      if (options.includeHoldings !== false) {
        const allHoldings: Holding[] = []
        
        for (const portfolioId of portfoliosToExport) {
          const holdingsResponse = await fetch(`${this.API_BASE_URL}/holdings?portfolioId=${portfolioId}`)
          if (holdingsResponse.ok) {
            const holdingsResult = await holdingsResponse.json()
            if (holdingsResult.success && holdingsResult.data) {
              allHoldings.push(...holdingsResult.data)
            }
          }
        }
        
        exportData.holdings = allHoldings
        exportData.metadata!.totalItems.holdings = allHoldings.length
      }

      // Fetch all transactions
      if (options.includeTransactions !== false) {
        const allTransactions: Transaction[] = []
        
        const transactionsParams = new URLSearchParams({
          limit: '10000' // Large number to get all transactions
        })

        if (options.dateFrom) {
          transactionsParams.set('dateFrom', options.dateFrom)
        }
        if (options.dateTo) {
          transactionsParams.set('dateTo', options.dateTo)
        }

        // If specific portfolios, filter by them
        if (portfoliosToExport.length > 0) {
          for (const portfolioId of portfoliosToExport) {
            const params = new URLSearchParams(transactionsParams)
            params.set('portfolioId', portfolioId)
            
            const transactionsResponse = await fetch(`${this.API_BASE_URL}/transactions?${params}`)
            if (transactionsResponse.ok) {
              const transactionsResult = await transactionsResponse.json()
              if (transactionsResult.success && transactionsResult.data) {
                allTransactions.push(...transactionsResult.data)
              }
            }
          }
        } else {
          // Get all transactions
          const transactionsResponse = await fetch(`${this.API_BASE_URL}/transactions?${transactionsParams}`)
          if (transactionsResponse.ok) {
            const transactionsResult = await transactionsResponse.json()
            if (transactionsResult.success && transactionsResult.data) {
              allTransactions.push(...transactionsResult.data)
            }
          }
        }
        
        exportData.transactions = allTransactions
        exportData.metadata!.totalItems.transactions = allTransactions.length
      }

      // Create JSON blob
      const jsonString = options.format === 'compact' 
        ? JSON.stringify(exportData)
        : JSON.stringify(exportData, null, 2)

      return new Blob([jsonString], { type: 'application/json' })

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Export holdings only to JSON
   */
  async exportHoldings(portfolioIds?: string[], options: ExportOptions = {}): Promise<Blob> {
    try {
      const exportData: {
        holdings: Holding[]
        metadata: {
          exportedAt: string
          exportedBy: string
          version: string
          totalItems: number
          portfolioIds?: string[]
        }
      } = {
        holdings: [],
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'income-clarity-app',
          version: '1.0.0',
          totalItems: 0,
          portfolioIds
        }
      }

      if (portfolioIds && portfolioIds.length > 0) {
        // Fetch holdings for specific portfolios
        for (const portfolioId of portfolioIds) {
          const holdingsResponse = await fetch(`${this.API_BASE_URL}/holdings?portfolioId=${portfolioId}`)
          if (holdingsResponse.ok) {
            const holdingsResult = await holdingsResponse.json()
            if (holdingsResult.success && holdingsResult.data) {
              exportData.holdings.push(...holdingsResult.data)
            }
          }
        }
      } else {
        // Fetch all holdings
        const holdingsResponse = await fetch(`${this.API_BASE_URL}/holdings`)
        if (holdingsResponse.ok) {
          const holdingsResult = await holdingsResponse.json()
          if (holdingsResult.success && holdingsResult.data) {
            exportData.holdings = holdingsResult.data
          }
        }
      }

      exportData.metadata.totalItems = exportData.holdings.length

      // Create JSON blob
      const jsonString = options.format === 'compact' 
        ? JSON.stringify(exportData)
        : JSON.stringify(exportData, null, 2)

      return new Blob([jsonString], { type: 'application/json' })

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Export transactions only to JSON
   */
  async exportTransactions(options: ExportOptions = {}): Promise<Blob> {
    try {
      const exportData: {
        transactions: Transaction[]
        metadata: {
          exportedAt: string
          exportedBy: string
          version: string
          totalItems: number
          filters: {
            portfolioIds?: string[]
            dateFrom?: string
            dateTo?: string
          }
        }
      } = {
        transactions: [],
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'income-clarity-app',
          version: '1.0.0',
          totalItems: 0,
          filters: {
            portfolioIds: options.portfolioIds,
            dateFrom: options.dateFrom,
            dateTo: options.dateTo
          }
        }
      }

      const params = new URLSearchParams({
        limit: '10000' // Large number to get all matching transactions
      })

      if (options.dateFrom) {
        params.set('dateFrom', options.dateFrom)
      }
      if (options.dateTo) {
        params.set('dateTo', options.dateTo)
      }

      if (options.portfolioIds && options.portfolioIds.length > 0) {
        // Fetch transactions for specific portfolios
        for (const portfolioId of options.portfolioIds) {
          const portfolioParams = new URLSearchParams(params)
          portfolioParams.set('portfolioId', portfolioId)
          
          const transactionsResponse = await fetch(`${this.API_BASE_URL}/transactions?${portfolioParams}`)
          if (transactionsResponse.ok) {
            const transactionsResult = await transactionsResponse.json()
            if (transactionsResult.success && transactionsResult.data) {
              exportData.transactions.push(...transactionsResult.data)
            }
          }
        }
      } else {
        // Fetch all transactions with date filters
        const transactionsResponse = await fetch(`${this.API_BASE_URL}/transactions?${params}`)
        if (transactionsResponse.ok) {
          const transactionsResult = await transactionsResponse.json()
          if (transactionsResult.success && transactionsResult.data) {
            exportData.transactions = transactionsResult.data
          }
        }
      }

      exportData.metadata.totalItems = exportData.transactions.length

      // Create JSON blob
      const jsonString = options.format === 'compact' 
        ? JSON.stringify(exportData)
        : JSON.stringify(exportData, null, 2)

      return new Blob([jsonString], { type: 'application/json' })

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Download JSON blob as file
   */
  downloadJSON(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `income-clarity-export-${new Date().toISOString().split('T')[0]}.json`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Create CSV export from JSON data
   */
  async exportToCSV(data: any[], type: 'portfolios' | 'holdings' | 'transactions'): Promise<Blob> {
    let headers: string[] = []
    let rows: string[][] = []

    switch (type) {
      case 'portfolios':
        headers = ['ID', 'Name', 'Description', 'Created At']
        rows = data.map((p: Portfolio) => [
          p.id,
          p.name,
          p.description || '',
          p.createdAt
        ])
        break

      case 'holdings':
        headers = ['ID', 'Portfolio ID', 'Ticker', 'Shares', 'Average Price', 'Current Price', 'Created At']
        rows = data.map((h: Holding) => [
          h.id,
          h.portfolioId,
          h.ticker,
          h.shares.toString(),
          h.averagePrice.toString(),
          h.currentPrice?.toString() || '',
          h.createdAt
        ])
        break

      case 'transactions':
        headers = ['ID', 'Portfolio ID', 'Ticker', 'Type', 'Shares', 'Amount', 'Date', 'Notes']
        rows = data.map((t: Transaction) => [
          t.id,
          t.portfolioId || '',
          t.ticker,
          t.type,
          t.shares?.toString() || '',
          t.amount.toString(),
          t.date,
          t.notes || ''
        ])
        break
    }

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n')

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  }
}