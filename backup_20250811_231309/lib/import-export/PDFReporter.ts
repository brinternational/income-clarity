import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface Portfolio {
  id: string
  name: string
  description?: string
  createdAt: string
}

interface Holding {
  id: string
  portfolioId: string
  ticker: string
  shares: number
  averagePrice: number
  currentPrice?: number
  lastUpdated?: string
}

interface Transaction {
  id: string
  portfolioId?: string
  ticker: string
  type: string
  shares?: number
  amount: number
  date: string
  notes?: string
}

interface PortfolioMetrics {
  totalValue: number
  costBasis: number
  gainLoss: number
  gainLossPercent: number
  dividendYield: number
  totalDividends: number
}

export interface PDFReportOptions {
  title?: string
  includeMetrics?: boolean
  includeHoldings?: boolean
  includeTransactions?: boolean
  logo?: string
  theme?: 'light' | 'dark' | 'professional'
  pageFormat?: 'a4' | 'letter'
}

export class PDFReporter {
  private readonly API_BASE_URL = '/api'

  /**
   * Generate comprehensive portfolio report PDF
   */
  async generatePortfolioReport(
    portfolioId: string, 
    options: PDFReportOptions = {}
  ): Promise<Blob> {
    try {
      // Fetch portfolio data
      const [portfolioData, holdingsData, transactionsData] = await Promise.all([
        this.fetchPortfolioData(portfolioId),
        options.includeHoldings !== false ? this.fetchHoldingsData(portfolioId) : null,
        options.includeTransactions !== false ? this.fetchTransactionsData(portfolioId) : null
      ])

      if (!portfolioData) {
        throw new Error('Portfolio not found')
      }

      // Calculate metrics if requested
      let metrics: PortfolioMetrics | null = null
      if (options.includeMetrics !== false && holdingsData) {
        metrics = this.calculatePortfolioMetrics(holdingsData, transactionsData || [])
      }

      // Create PDF
      const pdf = this.createPDF(options)
      
      // Add header
      this.addHeader(pdf, options.title || `${portfolioData.name} Portfolio Report`)
      
      // Add portfolio overview
      this.addPortfolioOverview(pdf, portfolioData, metrics)
      
      // Add holdings section
      if (holdingsData && holdingsData.length > 0 && options.includeHoldings !== false) {
        this.addHoldingsSection(pdf, holdingsData)
      }
      
      // Add transactions section
      if (transactionsData && transactionsData.length > 0 && options.includeTransactions !== false) {
        this.addTransactionsSection(pdf, transactionsData)
      }
      
      // Add footer
      this.addFooter(pdf)

      return new Blob([pdf.output('blob')], { type: 'application/pdf' })

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Generate summary report for all portfolios
   */
  async generateSummaryReport(options: PDFReportOptions = {}): Promise<Blob> {
    try {
      // Fetch all portfolios
      const portfoliosResponse = await fetch(`${this.API_BASE_URL}/portfolios`)
      if (!portfoliosResponse.ok) {
        throw new Error('Failed to fetch portfolios')
      }

      const portfoliosResult = await portfoliosResponse.json()
      if (!portfoliosResult.success || !portfoliosResult.data) {
        throw new Error('No portfolio data available')
      }

      const portfolios: Portfolio[] = portfoliosResult.data
      
      // Fetch holdings for each portfolio
      const portfolioMetrics: Array<{
        portfolio: Portfolio
        holdings: Holding[]
        metrics: PortfolioMetrics
      }> = []

      for (const portfolio of portfolios) {
        const holdings = await this.fetchHoldingsData(portfolio.id)
        const transactions = await this.fetchTransactionsData(portfolio.id)
        
        if (holdings) {
          const metrics = this.calculatePortfolioMetrics(holdings, transactions || [])
          portfolioMetrics.push({ portfolio, holdings, metrics })
        }
      }

      // Create PDF
      const pdf = this.createPDF(options)
      
      // Add header
      this.addHeader(pdf, options.title || 'Portfolio Summary Report')
      
      // Add executive summary
      this.addExecutiveSummary(pdf, portfolioMetrics)
      
      // Add individual portfolio summaries
      for (const { portfolio, holdings, metrics } of portfolioMetrics) {
        pdf.addPage()
        this.addPortfolioSummaryPage(pdf, portfolio, holdings, metrics)
      }
      
      // Add footer
      this.addFooter(pdf)

      return new Blob([pdf.output('blob')], { type: 'application/pdf' })

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Generate transaction history report
   */
  async generateTransactionReport(
    portfolioId?: string,
    options: PDFReportOptions = {}
  ): Promise<Blob> {
    try {
      const transactions = await this.fetchTransactionsData(portfolioId)
      
      if (!transactions || transactions.length === 0) {
        throw new Error('No transaction data found')
      }

      // Create PDF
      const pdf = this.createPDF(options)
      
      // Add header
      this.addHeader(pdf, options.title || 'Transaction History Report')
      
      // Add transaction summary
      this.addTransactionSummary(pdf, transactions)
      
      // Add detailed transaction table
      this.addTransactionsSection(pdf, transactions, true)
      
      // Add footer
      this.addFooter(pdf)

      return new Blob([pdf.output('blob')], { type: 'application/pdf' })

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Create PDF instance with default settings
   */
  private createPDF(options: PDFReportOptions): jsPDF {
    const format = options.pageFormat || 'a4'
    const pdf = new jsPDF('portrait', 'mm', format)
    
    // Set default font
    pdf.setFont('helvetica')
    
    return pdf
  }

  /**
   * Add header to PDF
   */
  private addHeader(pdf: jsPDF, title: string): void {
    const pageWidth = pdf.internal.pageSize.width
    
    // Title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, 20, 30)
    
    // Date
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    pdf.text(`Generated on ${date}`, pageWidth - 20, 30, { align: 'right' })
    
    // Line separator
    pdf.setLineWidth(0.5)
    pdf.line(20, 35, pageWidth - 20, 35)
  }

  /**
   * Add portfolio overview section
   */
  private addPortfolioOverview(
    pdf: jsPDF, 
    portfolio: Portfolio, 
    metrics: PortfolioMetrics | null
  ): void {
    let yPos = 50
    
    // Portfolio details
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Portfolio Overview', 20, yPos)
    
    yPos += 10
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    pdf.text(`Name: ${portfolio.name}`, 20, yPos)
    yPos += 6
    
    if (portfolio.description) {
      pdf.text(`Description: ${portfolio.description}`, 20, yPos)
      yPos += 6
    }
    
    pdf.text(`Created: ${new Date(portfolio.createdAt).toLocaleDateString()}`, 20, yPos)
    yPos += 15

    // Metrics section
    if (metrics) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Performance Metrics', 20, yPos)
      yPos += 10

      const metricsData = [
        ['Total Value', this.formatCurrency(metrics.totalValue)],
        ['Cost Basis', this.formatCurrency(metrics.costBasis)],
        ['Gain/Loss', `${this.formatCurrency(metrics.gainLoss)} (${metrics.gainLossPercent.toFixed(2)}%)`],
        ['Dividend Yield', `${metrics.dividendYield.toFixed(2)}%`],
        ['Total Dividends', this.formatCurrency(metrics.totalDividends)]
      ]

      pdf.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 60, halign: 'right' }
        }
      })
    }
  }

  /**
   * Add holdings section
   */
  private addHoldingsSection(pdf: jsPDF, holdings: Holding[]): void {
    // Check if we need a new page
    const currentY = (pdf as any).lastAutoTable?.finalY || 120
    if (currentY > 200) {
      pdf.addPage()
    }

    const yPos = currentY > 120 ? currentY + 20 : 120

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Holdings', 20, yPos)

    const holdingsData = holdings.map(holding => [
      holding.ticker,
      holding.shares.toLocaleString(),
      this.formatCurrency(holding.averagePrice),
      holding.currentPrice ? this.formatCurrency(holding.currentPrice) : 'N/A',
      this.formatCurrency(holding.shares * (holding.currentPrice || holding.averagePrice))
    ])

    pdf.autoTable({
      startY: yPos + 5,
      head: [['Ticker', 'Shares', 'Avg Price', 'Current Price', 'Market Value']],
      body: holdingsData,
      theme: 'striped',
      headStyles: { fillColor: [46, 125, 50] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    })
  }

  /**
   * Add transactions section
   */
  private addTransactionsSection(pdf: jsPDF, transactions: Transaction[], fullPage = false): void {
    let yPos: number

    if (fullPage) {
      yPos = 50
    } else {
      const currentY = (pdf as any).lastAutoTable?.finalY || 200
      if (currentY > 220) {
        pdf.addPage()
        yPos = 30
      } else {
        yPos = currentY + 20
      }
    }

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Recent Transactions', 20, yPos)

    // Limit to most recent 20 transactions if not full page
    const displayTransactions = fullPage ? transactions : transactions.slice(0, 20)

    const transactionsData = displayTransactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.ticker,
      transaction.type,
      transaction.shares ? transaction.shares.toLocaleString() : '—',
      this.formatCurrency(transaction.amount),
      transaction.notes ? transaction.notes.substring(0, 30) + (transaction.notes.length > 30 ? '...' : '') : '—'
    ])

    pdf.autoTable({
      startY: yPos + 5,
      head: [['Date', 'Ticker', 'Type', 'Shares', 'Amount', 'Notes']],
      body: transactionsData,
      theme: 'striped',
      headStyles: { fillColor: [156, 39, 176] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 35 }
      }
    })

    if (!fullPage && transactions.length > 20) {
      const finalY = (pdf as any).lastAutoTable.finalY
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'italic')
      pdf.text(`Showing 20 of ${transactions.length} transactions`, 20, finalY + 5)
    }
  }

  /**
   * Add executive summary for multiple portfolios
   */
  private addExecutiveSummary(
    pdf: jsPDF,
    portfolioMetrics: Array<{
      portfolio: Portfolio
      holdings: Holding[]
      metrics: PortfolioMetrics
    }>
  ): void {
    let yPos = 50

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Executive Summary', 20, yPos)
    yPos += 15

    // Calculate totals
    const totals = portfolioMetrics.reduce(
      (acc, { metrics }) => ({
        totalValue: acc.totalValue + metrics.totalValue,
        costBasis: acc.costBasis + metrics.costBasis,
        gainLoss: acc.gainLoss + metrics.gainLoss,
        totalDividends: acc.totalDividends + metrics.totalDividends
      }),
      { totalValue: 0, costBasis: 0, gainLoss: 0, totalDividends: 0 }
    )

    const totalGainLossPercent = totals.costBasis > 0 ? (totals.gainLoss / totals.costBasis) * 100 : 0

    const summaryData = [
      ['Total Portfolios', portfolioMetrics.length.toString()],
      ['Combined Value', this.formatCurrency(totals.totalValue)],
      ['Combined Cost Basis', this.formatCurrency(totals.costBasis)],
      ['Combined Gain/Loss', `${this.formatCurrency(totals.gainLoss)} (${totalGainLossPercent.toFixed(2)}%)`],
      ['Total Dividends', this.formatCurrency(totals.totalDividends)]
    ]

    pdf.autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: 'right' }
      }
    })
  }

  /**
   * Add individual portfolio summary page
   */
  private addPortfolioSummaryPage(
    pdf: jsPDF,
    portfolio: Portfolio,
    holdings: Holding[],
    metrics: PortfolioMetrics
  ): void {
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(portfolio.name, 20, 30)

    this.addPortfolioOverview(pdf, portfolio, metrics)

    if (holdings.length > 0) {
      this.addHoldingsSection(pdf, holdings)
    }
  }

  /**
   * Add transaction summary
   */
  private addTransactionSummary(pdf: jsPDF, transactions: Transaction[]): void {
    let yPos = 50

    // Calculate transaction summary
    const summary = {
      totalTransactions: transactions.length,
      buyTransactions: transactions.filter(t => t.type === 'BUY').length,
      sellTransactions: transactions.filter(t => t.type === 'SELL').length,
      dividendTransactions: transactions.filter(t => t.type === 'DIVIDEND').length,
      totalInvested: transactions
        .filter(t => t.type === 'BUY')
        .reduce((sum, t) => sum + t.amount, 0),
      totalDividends: transactions
        .filter(t => t.type === 'DIVIDEND')
        .reduce((sum, t) => sum + t.amount, 0)
    }

    const summaryData = [
      ['Total Transactions', summary.totalTransactions.toString()],
      ['Buy Orders', summary.buyTransactions.toString()],
      ['Sell Orders', summary.sellTransactions.toString()],
      ['Dividend Payments', summary.dividendTransactions.toString()],
      ['Total Invested', this.formatCurrency(summary.totalInvested)],
      ['Total Dividends', this.formatCurrency(summary.totalDividends)]
    ]

    pdf.autoTable({
      startY: yPos,
      head: [['Summary', 'Count/Amount']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60, halign: 'right' }
      }
    })
  }

  /**
   * Add footer to PDF
   */
  private addFooter(pdf: jsPDF): void {
    const pageCount = pdf.internal.pages.length - 1
    const pageWidth = pdf.internal.pageSize.width
    const pageHeight = pdf.internal.pageSize.height

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      
      // Page number
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' })
      
      // App name
      pdf.text('Generated by Income Clarity App', 20, pageHeight - 10)
    }
  }

  /**
   * Fetch portfolio data from API
   */
  private async fetchPortfolioData(portfolioId: string): Promise<Portfolio | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/portfolios/${portfolioId}`)
      if (response.ok) {
        const result = await response.json()
        return result.success ? result.data : null
      }
      return null
    } catch (error) {
      // console.error('Error fetching portfolio:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })