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
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'SPLIT' | 'MERGER'
  shares?: number
  amount: number
  date: string
  notes?: string
}

interface DividendData {
  ticker: string
  annualDividend: number
  quarterlyDividend: number
  yield: number
  payoutRatio: number
  frequency: 'quarterly' | 'monthly' | 'annually' | 'semi-annually'
  exDates: string[]
  payDates: string[]
  lastDividendAmount: number
  lastDividendDate: string
}

export interface DividendProjection {
  ticker: string
  shares: number
  annualIncome: number
  quarterlyIncome: number
  monthlyIncome: number
  yield: number
  nextPaymentDate?: string
  nextPaymentAmount?: number
}

export interface IncomeSchedule {
  date: string
  ticker: string
  expectedAmount: number
  shares: number
  type: 'dividend' | 'interest'
  confidence: 'high' | 'medium' | 'low'
}

export interface DividendSummary {
  totalAnnualIncome: number
  totalQuarterlyIncome: number
  totalMonthlyIncome: number
  averageYield: number
  portfolioYield: number
  growthRate: number
  projections: DividendProjection[]
  schedule: IncomeSchedule[]
  trends: {
    month: number
    year: number
    threeYear: number
    fiveYear: number
  }
}

export class DividendCalculator {
  private dividendData: Map<string, DividendData> = new Map()
  private readonly stockService?: any

  constructor(stockPriceService?: any) {
    this.stockService = stockPriceService
    this.initializeDividendData()
  }

  /**
   * Calculate dividend yield for a portfolio
   */
  calculateYield(holdings: Holding[]): number {
    const totalValue = holdings.reduce((sum, holding) => {
      const price = holding.currentPrice || holding.averagePrice
      return sum + (holding.shares * price)
    }, 0)

    if (totalValue === 0) return 0

    const totalAnnualIncome = holdings.reduce((sum, holding) => {
      const dividendData = this.dividendData.get(holding.ticker)
      if (dividendData) {
        return sum + (holding.shares * dividendData.annualDividend)
      }
      return sum
    }, 0)

    return (totalAnnualIncome / totalValue) * 100
  }

  /**
   * Project income for specified number of months
   */
  projectIncome(holdings: Holding[], months: number): number {
    const monthlyIncome = holdings.reduce((sum, holding) => {
      const dividendData = this.dividendData.get(holding.ticker)
      if (dividendData) {
        const monthlyDividend = dividendData.annualDividend / 12
        return sum + (holding.shares * monthlyDividend)
      }
      return sum
    }, 0)

    return monthlyIncome * months
  }

  /**
   * Calculate detailed payment schedule
   */
  calculatePaymentSchedule(holdings: Holding[]): IncomeSchedule[] {
    const schedule: IncomeSchedule[] = []
    const currentDate = new Date()
    
    for (const holding of holdings) {
      const dividendData = this.dividendData.get(holding.ticker)
      if (!dividendData) continue

      // Generate next 12 months of projected payments
      for (let month = 0; month < 12; month++) {
        const paymentDate = new Date(currentDate)
        paymentDate.setMonth(currentDate.getMonth() + month)

        let expectedAmount = 0
        let confidence: 'high' | 'medium' | 'low' = 'medium'

        switch (dividendData.frequency) {
          case 'monthly':
            expectedAmount = dividendData.annualDividend / 12
            confidence = 'high'
            break
          case 'quarterly':
            if (month % 3 === 0) {
              expectedAmount = dividendData.quarterlyDividend
              confidence = 'high'
            }
            break
          case 'semi-annually':
            if (month % 6 === 0) {
              expectedAmount = dividendData.annualDividend / 2
              confidence = 'medium'
            }
            break
          case 'annually':
            if (month === 0) {
              expectedAmount = dividendData.annualDividend
              confidence = 'low'
            }
            break
        }

        if (expectedAmount > 0) {
          schedule.push({
            date: paymentDate.toISOString().split('T')[0],
            ticker: holding.ticker,
            expectedAmount: expectedAmount * holding.shares,
            shares: holding.shares,
            type: 'dividend',
            confidence
          })
        }
      }
    }

    return schedule.sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Calculate comprehensive dividend summary
   */
  calculateDividendSummary(
    holdings: Holding[], 
    transactions: Transaction[] = []
  ): DividendSummary {
    const projections = this.calculateProjections(holdings)
    const schedule = this.calculatePaymentSchedule(holdings)
    
    const totalAnnualIncome = projections.reduce((sum, p) => sum + p.annualIncome, 0)
    const totalQuarterlyIncome = totalAnnualIncome / 4
    const totalMonthlyIncome = totalAnnualIncome / 12
    
    const portfolioValue = holdings.reduce((sum, h) => {
      const price = h.currentPrice || h.averagePrice
      return sum + (h.shares * price)
    }, 0)
    
    const portfolioYield = portfolioValue > 0 ? (totalAnnualIncome / portfolioValue) * 100 : 0
    
    const averageYield = projections.length > 0
      ? projections.reduce((sum, p) => sum + p.yield, 0) / projections.length
      : 0

    const growthRate = this.calculateDividendGrowthRate(transactions)
    const trends = this.calculateDividendTrends(transactions)

    return {
      totalAnnualIncome,
      totalQuarterlyIncome,
      totalMonthlyIncome,
      averageYield,
      portfolioYield,
      growthRate,
      projections,
      schedule,
      trends
    }
  }

  /**
   * Calculate individual dividend projections
   */
  private calculateProjections(holdings: Holding[]): DividendProjection[] {
    return holdings.map(holding => {
      const dividendData = this.dividendData.get(holding.ticker) || this.getDefaultDividendData(holding.ticker)
      
      const annualIncome = holding.shares * dividendData.annualDividend
      const quarterlyIncome = annualIncome / 4
      const monthlyIncome = annualIncome / 12
      
      // Calculate next payment date
      let nextPaymentDate: string | undefined
      let nextPaymentAmount: number | undefined
      
      if (dividendData.payDates.length > 0) {
        const currentDate = new Date()
        const nextPayment = dividendData.payDates.find(date => new Date(date) > currentDate)
        
        if (nextPayment) {
          nextPaymentDate = nextPayment
          nextPaymentAmount = this.calculateNextPaymentAmount(dividendData) * holding.shares
        }
      }

      return {
        ticker: holding.ticker,
        shares: holding.shares,
        annualIncome,
        quarterlyIncome,
        monthlyIncome,
        yield: dividendData.yield,
        nextPaymentDate,
        nextPaymentAmount
      }
    }).filter(projection => projection.annualIncome > 0)
  }

  /**
   * Calculate dividend growth rate from transaction history
   */
  private calculateDividendGrowthRate(transactions: Transaction[]): number {
    const dividendTransactions = transactions
      .filter(t => t.type === 'DIVIDEND')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (dividendTransactions.length < 8) return 0 // Need at least 2 years of quarterly data

    // Group by year
    const yearlyDividends: Record<string, number> = {}
    
    for (const transaction of dividendTransactions) {
      const year = new Date(transaction.date).getFullYear().toString()
      yearlyDividends[year] = (yearlyDividends[year] || 0) + transaction.amount
    }

    const years = Object.keys(yearlyDividends).sort()
    if (years.length < 2) return 0

    // Calculate compound annual growth rate (CAGR)
    const firstYear = yearlyDividends[years[0]]
    const lastYear = yearlyDividends[years[years.length - 1]]
    const numberOfYears = years.length - 1

    if (firstYear <= 0) return 0

    const cagr = (Math.pow(lastYear / firstYear, 1 / numberOfYears) - 1) * 100
    return cagr
  }

  /**
   * Calculate dividend trends
   */
  private calculateDividendTrends(transactions: Transaction[]): {
    month: number
    year: number
    threeYear: number
    fiveYear: number
  } {
    const dividendTransactions = transactions
      .filter(t => t.type === 'DIVIDEND')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const currentDate = new Date()
    
    const calculateTrendForPeriod = (months: number) => {
      const cutoffDate = new Date(currentDate)
      cutoffDate.setMonth(currentDate.getMonth() - months)
      
      const periodTransactions = dividendTransactions.filter(t => 
        new Date(t.date) >= cutoffDate
      )
      
      if (periodTransactions.length < 2) return 0
      
      const firstHalf = periodTransactions.slice(0, Math.floor(periodTransactions.length / 2))
      const secondHalf = periodTransactions.slice(Math.floor(periodTransactions.length / 2))
      
      const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t.amount, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t.amount, 0) / secondHalf.length
      
      return firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0
    }

    return {
      month: calculateTrendForPeriod(1),
      year: calculateTrendForPeriod(12),
      threeYear: calculateTrendForPeriod(36),
      fiveYear: calculateTrendForPeriod(60)
    }
  }

  /**
   * Calculate next payment amount based on frequency
   */
  private calculateNextPaymentAmount(dividendData: DividendData): number {
    switch (dividendData.frequency) {
      case 'monthly':
        return dividendData.annualDividend / 12
      case 'quarterly':
        return dividendData.quarterlyDividend
      case 'semi-annually':
        return dividendData.annualDividend / 2
      case 'annually':
        return dividendData.annualDividend
      default:
        return dividendData.lastDividendAmount || 0
    }
  }

  /**
   * Get default dividend data for unknown tickers
   */
  private getDefaultDividendData(ticker: string): DividendData {
    return {
      ticker,
      annualDividend: 0,
      quarterlyDividend: 0,
      yield: 0,
      payoutRatio: 0,
      frequency: 'quarterly',
      exDates: [],
      payDates: [],
      lastDividendAmount: 0,
      lastDividendDate: ''
    }
  }

  /**
   * Initialize dividend data for common dividend stocks
   * In a real application, this would be fetched from an API
   */
  private initializeDividendData(): void {
    const commonDividendStocks = [
      {
        ticker: 'AAPL',
        annualDividend: 0.96,
        quarterlyDividend: 0.24,
        yield: 0.5,
        payoutRatio: 15.0,
        frequency: 'quarterly' as const,
        exDates: ['2024-02-09', '2024-05-10', '2024-08-12', '2024-11-08'],
        payDates: ['2024-02-16', '2024-05-16', '2024-08-15', '2024-11-14'],
        lastDividendAmount: 0.24,
        lastDividendDate: '2024-11-14'
      },
      {
        ticker: 'MSFT',
        annualDividend: 3.00,
        quarterlyDividend: 0.75,
        yield: 0.7,
        payoutRatio: 25.0,
        frequency: 'quarterly' as const,
        exDates: ['2024-02-14', '2024-05-15', '2024-08-14', '2024-11-13'],
        payDates: ['2024-03-14', '2024-06-13', '2024-09-12', '2024-12-12'],
        lastDividendAmount: 0.75,
        lastDividendDate: '2024-12-12'
      },
      {
        ticker: 'JNJ',
        annualDividend: 4.76,
        quarterlyDividend: 1.19,
        yield: 2.9,
        payoutRatio: 45.0,
        frequency: 'quarterly' as const,
        exDates: ['2024-02-23', '2024-05-24', '2024-08-23', '2024-11-22'],
        payDates: ['2024-03-12', '2024-06-11', '2024-09-10', '2024-12-10'],
        lastDividendAmount: 1.19,
        lastDividendDate: '2024-12-10'
      },
      {
        ticker: 'KO',
        annualDividend: 1.84,
        quarterlyDividend: 0.46,
        yield: 3.0,
        payoutRatio: 75.0,
        frequency: 'quarterly' as const,
        exDates: ['2024-03-14', '2024-06-13', '2024-09-12', '2024-12-12'],
        payDates: ['2024-04-01', '2024-07-01', '2024-10-01', '2025-01-01'],
        lastDividendAmount: 0.46,
        lastDividendDate: '2025-01-01'
      },
      {
        ticker: 'PG',
        annualDividend: 3.65,
        quarterlyDividend: 0.9125,
        yield: 2.4,
        payoutRatio: 60.0,
        frequency: 'quarterly' as const,
        exDates: ['2024-01-18', '2024-04-18', '2024-07-18', '2024-10-17'],
        payDates: ['2024-02-15', '2024-05-15', '2024-08-15', '2024-11-15'],
        lastDividendAmount: 0.9125,
        lastDividendDate: '2024-11-15'
      },
      {
        ticker: 'VZ',
        annualDividend: 2.66,
        quarterlyDividend: 0.665,
        yield: 6.5,
        payoutRatio: 50.0,
        frequency: 'quarterly' as const,
        exDates: ['2024-01-08', '2024-04-08', '2024-07-08', '2024-10-07'],
        payDates: ['2024-02-01', '2024-05-01', '2024-08-01', '2024-11-01'],
        lastDividendAmount: 0.665,
        lastDividendDate: '2024-11-01'
      },
      {
        ticker: 'T',
        annualDividend: 1.11,
        quarterlyDividend: 0.2775,
        yield: 7.5,
        payoutRatio: 90.0,
        frequency: 'quarterly' as const,
        exDates: ['2024-01-09', '2024-04-09', '2024-07-09', '2024-10-08'],
        payDates: ['2024-02-01', '2024-05-01', '2024-08-01', '2024-11-01'],
        lastDividendAmount: 0.2775,
        lastDividendDate: '2024-11-01'
      },
      {
        ticker: 'SPY',
        annualDividend: 6.57,
        quarterlyDividend: 1.6425,
        yield: 1.2,
        payoutRatio: 100.0,
        frequency: 'quarterly' as const,
        exDates: ['2024-03-15', '2024-06-21', '2024-09-20', '2024-12-20'],
        payDates: ['2024-04-30', '2024-07-31', '2024-10-31', '2025-01-31'],
        lastDividendAmount: 1.6425,
        lastDividendDate: '2025-01-31'
      }
    ]

    for (const stock of commonDividendStocks) {
      this.dividendData.set(stock.ticker, stock)
    }
  }

  /**
   * Update dividend data for a ticker (would typically fetch from API)
   */
  async updateDividendData(ticker: string): Promise<void> {
    if (!this.stockService) return

    try {
      // This would typically fetch from a financial data API
      const dividendInfo = await this.stockService.getDividendInfo(ticker)
      
      if (dividendInfo) {
        this.dividendData.set(ticker, dividendInfo)
      }
    } catch (error) {
      // Error handled by emergency recovery script

  /**
   * Get dividend calendar for date range
   */
  getDividendCalendar(
    holdings: Holding[], 
    startDate: string, 
    endDate: string
  ): Array<{
    date: string
    ticker: string
    type: 'ex-dividend' | 'payment'
    amount: number
    shares: number
  }> {
    const calendar: Array<{
      date: string
      ticker: string
      type: 'ex-dividend' | 'payment'
      amount: number
      shares: number
    }> = []

    for (const holding of holdings) {
      const dividendData = this.dividendData.get(holding.ticker)
      if (!dividendData) continue

      // Add ex-dividend dates
      for (const exDate of dividendData.exDates) {
        if (exDate >= startDate && exDate <= endDate) {
          calendar.push({
            date: exDate,
            ticker: holding.ticker,
            type: 'ex-dividend',
            amount: dividendData.quarterlyDividend * holding.shares,
            shares: holding.shares
          })
        }
      }

      // Add payment dates
      for (const payDate of dividendData.payDates) {
        if (payDate >= startDate && payDate <= endDate) {
          calendar.push({
            date: payDate,
            ticker: holding.ticker,
            type: 'payment',
            amount: dividendData.quarterlyDividend * holding.shares,
            shares: holding.shares
          })
        }
      }
    }

    return calendar.sort((a, b) => a.date.localeCompare(b.date))
  }
}