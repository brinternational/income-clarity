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

interface Portfolio {
  id: string
  name: string
  description?: string
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
}

export interface Returns {
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  annualizedReturnPercent: number
  monthlyReturns: Array<{
    date: string
    returnAmount: number
    returnPercent: number
    portfolioValue: number
  }>
  yearToDateReturn: number
  yearToDatePercent: number
  sinceInceptionReturn: number
  sinceInceptionPercent: number
}

export interface Comparison {
  portfolioReturn: number
  benchmarkReturn: number
  outperformance: number
  outperformancePercent: number
  correlation: number
  beta: number
  alpha: number
  trackingError: number
  informationRatio: number
}

export interface PerformanceMetrics {
  totalReturn: Returns
  riskMetrics: {
    volatility: number
    sharpeRatio: number
    sortinoRatio: number
    maxDrawdown: number
    valueAtRisk: number
    beta: number
    alpha: number
  }
  benchmarkComparison?: Comparison
}

export class PerformanceCalculator {
  private readonly riskFreeRate: number = 0.02 // 2% annual risk-free rate

  /**
   * Calculate comprehensive returns for a portfolio
   */
  calculateReturns(
    portfolio: Portfolio, 
    holdings: Holding[], 
    transactions: Transaction[]
  ): Returns {
    const sortedTransactions = transactions
      .filter(t => t.portfolioId === portfolio.id || !t.portfolioId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (sortedTransactions.length === 0) {
      return this.getEmptyReturns()
    }

    const startDate = new Date(portfolio.createdAt)
    const endDate = new Date()
    const currentValue = this.calculateCurrentValue(holdings)
    const totalInvested = this.calculateTotalInvested(sortedTransactions)
    const totalWithdrawn = this.calculateTotalWithdrawn(sortedTransactions)
    const netInvestment = totalInvested - totalWithdrawn

    // Calculate total return
    const totalReturn = currentValue - netInvestment
    const totalReturnPercent = netInvestment > 0 ? (totalReturn / netInvestment) * 100 : 0

    // Calculate annualized return
    const daysDiff = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const yearsElapsed = daysDiff / 365.25
    const annualizedReturnPercent = yearsElapsed > 0 
      ? (Math.pow(currentValue / Math.max(1, netInvestment), 1 / yearsElapsed) - 1) * 100
      : 0
    const annualizedReturn = (annualizedReturnPercent / 100) * netInvestment

    // Calculate monthly returns
    const monthlyReturns = this.calculateMonthlyReturns(sortedTransactions, holdings)

    // Calculate YTD return
    const yearStart = new Date(endDate.getFullYear(), 0, 1)
    const ytdTransactions = sortedTransactions.filter(t => new Date(t.date) >= yearStart)
    const ytdInvested = this.calculateTotalInvested(ytdTransactions)
    const ytdWithdrawn = this.calculateTotalWithdrawn(ytdTransactions)
    const ytdNetInvestment = ytdInvested - ytdWithdrawn
    const yearToDateReturn = currentValue - ytdNetInvestment
    const yearToDatePercent = ytdNetInvestment > 0 ? (yearToDateReturn / ytdNetInvestment) * 100 : 0

    return {
      totalReturn,
      totalReturnPercent,
      annualizedReturn,
      annualizedReturnPercent,
      monthlyReturns,
      yearToDateReturn,
      yearToDatePercent,
      sinceInceptionReturn: totalReturn,
      sinceInceptionPercent: totalReturnPercent
    }
  }

  /**
   * Calculate XIRR (Extended Internal Rate of Return)
   * More accurate than simple annualized returns for irregular cash flows
   */
  calculateXIRR(transactions: Transaction[]): number {
    if (transactions.length < 2) return 0

    // Prepare cash flows with dates
    const cashFlows: Array<{ date: Date; amount: number }> = []
    
    for (const transaction of transactions) {
      const date = new Date(transaction.date)
      let amount = 0
      
      switch (transaction.type) {
        case 'BUY':
          amount = -Math.abs(transaction.amount) // Cash out
          break
        case 'SELL':
          amount = Math.abs(transaction.amount) // Cash in
          break
        case 'DIVIDEND':
        case 'INTEREST':
          amount = Math.abs(transaction.amount) // Cash in
          break
      }
      
      if (amount !== 0) {
        cashFlows.push({ date, amount })
      }
    }

    // Add current portfolio value as final cash flow
    const currentValue = this.getCurrentPortfolioValue(transactions)
    cashFlows.push({ date: new Date(), amount: currentValue })

    // Use Newton-Raphson method to find IRR
    return this.calculateIRRNewtonRaphson(cashFlows)
  }

  /**
   * Compare portfolio performance to benchmark
   */
  compareToBenchmark(
    portfolio: Portfolio,
    holdings: Holding[],
    transactions: Transaction[],
    benchmarkSymbol: string = 'SPY'
  ): Promise<Comparison> {
    // This would typically require historical benchmark data
    // For now, provide a basic comparison structure
    
    const portfolioReturns = this.calculateReturns(portfolio, holdings, transactions)
    
    // Mock benchmark data - in a real implementation, you'd fetch this from an API
    const mockBenchmarkReturn = 10.5 // 10.5% annual return for SPY
    
    const outperformance = portfolioReturns.annualizedReturnPercent - mockBenchmarkReturn
    const outperformancePercent = mockBenchmarkReturn > 0 
      ? (outperformance / mockBenchmarkReturn) * 100 
      : 0

    return Promise.resolve({
      portfolioReturn: portfolioReturns.annualizedReturnPercent,
      benchmarkReturn: mockBenchmarkReturn,
      outperformance,
      outperformancePercent,
      correlation: 0.85, // Would need historical data to calculate
      beta: 1.2, // Would need historical data to calculate
      alpha: outperformance, // Simplified alpha calculation
      trackingError: 5.0, // Would need historical data to calculate
      informationRatio: outperformancePercent / 5.0 // Simplified calculation
    })
  }

  /**
   * Calculate comprehensive performance metrics
   */
  async calculatePerformanceMetrics(
    portfolio: Portfolio,
    holdings: Holding[],
    transactions: Transaction[],
    benchmarkSymbol?: string
  ): Promise<PerformanceMetrics> {
    const returns = this.calculateReturns(portfolio, holdings, transactions)
    const riskMetrics = this.calculateRiskMetrics(returns, transactions)
    
    let benchmarkComparison: Comparison | undefined
    if (benchmarkSymbol) {
      benchmarkComparison = await this.compareToBenchmark(
        portfolio, 
        holdings, 
        transactions, 
        benchmarkSymbol
      )
    }

    return {
      totalReturn: returns,
      riskMetrics,
      benchmarkComparison
    }
  }

  /**
   * Calculate risk-adjusted metrics
   */
  private calculateRiskMetrics(returns: Returns, transactions: Transaction[]) {
    const monthlyReturns = returns.monthlyReturns.map(r => r.returnPercent / 100)
    
    // Calculate volatility (standard deviation of monthly returns)
    const avgReturn = monthlyReturns.reduce((sum, r) => sum + r, 0) / monthlyReturns.length
    const variance = monthlyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / monthlyReturns.length
    const volatility = Math.sqrt(variance) * Math.sqrt(12) * 100 // Annualized volatility

    // Calculate Sharpe ratio
    const excessReturn = (returns.annualizedReturnPercent / 100) - this.riskFreeRate
    const sharpeRatio = volatility > 0 ? excessReturn / (volatility / 100) : 0

    // Calculate Sortino ratio (only downside volatility)
    const downshideReturns = monthlyReturns.filter(r => r < 0)
    const downsideVariance = downshideReturns.length > 0
      ? downshideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downshideReturns.length
      : 0
    const downsideVolatility = Math.sqrt(downsideVariance) * Math.sqrt(12) * 100
    const sortinoRatio = downsideVolatility > 0 ? excessReturn / (downsideVolatility / 100) : 0

    // Calculate maximum drawdown
    const maxDrawdown = this.calculateMaxDrawdown(returns.monthlyReturns)

    // Calculate Value at Risk (95% confidence, 1 month)
    const sortedReturns = [...monthlyReturns].sort((a, b) => a - b)
    const varIndex = Math.floor(0.05 * sortedReturns.length)
    const valueAtRisk = sortedReturns[varIndex] * 100

    return {
      volatility,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      valueAtRisk,
      beta: 1.0, // Would need market data to calculate
      alpha: 0 // Would need benchmark data to calculate
    }
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(monthlyReturns: Array<{ portfolioValue: number }>): number {
    if (monthlyReturns.length < 2) return 0

    let maxDrawdown = 0
    let peak = monthlyReturns[0].portfolioValue

    for (const month of monthlyReturns) {
      if (month.portfolioValue > peak) {
        peak = month.portfolioValue
      }
      
      const drawdown = (peak - month.portfolioValue) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    return maxDrawdown * 100 // Return as percentage
  }

  /**
   * Calculate monthly returns for the portfolio
   */
  private calculateMonthlyReturns(
    transactions: Transaction[], 
    holdings: Holding[]
  ): Array<{ date: string; returnAmount: number; returnPercent: number; portfolioValue: number }> {
    // This is a simplified implementation
    // A full implementation would track portfolio value month by month
    
    const monthlyData: Array<{ date: string; returnAmount: number; returnPercent: number; portfolioValue: number }> = []
    const currentValue = this.calculateCurrentValue(holdings)
    const startDate = transactions.length > 0 ? new Date(transactions[0].date) : new Date()
    const endDate = new Date()
    
    // Generate monthly data points
    const currentMonth = new Date(startDate)
    let previousValue = 0
    let monthCount = 0
    
    while (currentMonth <= endDate && monthCount < 60) { // Limit to 5 years of data
      const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
      
      // Calculate portfolio value for this month (simplified)
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate <= currentMonth
      })
      
      const invested = this.calculateTotalInvested(monthTransactions)
      const withdrawn = this.calculateTotalWithdrawn(monthTransactions)
      const netInvestment = invested - withdrawn
      
      // Estimate portfolio value (this is simplified - real calculation would use historical prices)
      const estimatedValue = monthCount === 0 ? netInvestment : 
        previousValue + (netInvestment - previousValue) * 0.1 // Simplified growth
      
      const returnAmount = estimatedValue - netInvestment
      const returnPercent = netInvestment > 0 ? (returnAmount / netInvestment) * 100 : 0
      
      monthlyData.push({
        date: monthKey,
        returnAmount,
        returnPercent,
        portfolioValue: estimatedValue
      })
      
      previousValue = estimatedValue
      currentMonth.setMonth(currentMonth.getMonth() + 1)
      monthCount++
    }
    
    return monthlyData
  }

  /**
   * Calculate current portfolio value
   */
  private calculateCurrentValue(holdings: Holding[]): number {
    return holdings.reduce((total, holding) => {
      const price = holding.currentPrice || holding.averagePrice
      return total + (holding.shares * price)
    }, 0)
  }

  /**
   * Calculate total amount invested (BUY transactions)
   */
  private calculateTotalInvested(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'BUY')
      .reduce((total, t) => total + Math.abs(t.amount), 0)
  }

  /**
   * Calculate total amount withdrawn (SELL transactions)
   */
  private calculateTotalWithdrawn(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'SELL')
      .reduce((total, t) => total + Math.abs(t.amount), 0)
  }

  /**
   * Get current portfolio value from transactions (for XIRR calculation)
   */
  private getCurrentPortfolioValue(transactions: Transaction[]): number {
    // This would typically fetch current portfolio value
    // For now, return a simplified calculation
    const totalInvested = this.calculateTotalInvested(transactions)
    const totalWithdrawn = this.calculateTotalWithdrawn(transactions)
    const dividends = transactions
      .filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST')
      .reduce((total, t) => total + t.amount, 0)
    
    // Simplified: assume 8% annual growth
    return (totalInvested - totalWithdrawn) * 1.08 + dividends
  }

  /**
   * Calculate IRR using Newton-Raphson method
   */
  private calculateIRRNewtonRaphson(cashFlows: Array<{ date: Date; amount: number }>): number {
    if (cashFlows.length < 2) return 0

    const baseDate = cashFlows[0].date
    const periods = cashFlows.map(cf => 
      (cf.date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    )
    const amounts = cashFlows.map(cf => cf.amount)

    let rate = 0.1 // Initial guess: 10%
    
    for (let i = 0; i < 100; i++) { // Max 100 iterations
      let npv = 0
      let dnpv = 0
      
      for (let j = 0; j < amounts.length; j++) {
        const factor = Math.pow(1 + rate, periods[j])
        npv += amounts[j] / factor
        dnpv -= amounts[j] * periods[j] / (factor * (1 + rate))
      }
      
      if (Math.abs(npv) < 0.0001) { // Convergence threshold
        return rate * 100 // Return as percentage
      }
      
      if (Math.abs(dnpv) < 1e-10) break // Avoid division by zero
      
      rate = rate - npv / dnpv
      
      // Prevent unrealistic rates
      if (rate < -0.99 || rate > 10) {
        return 0
      }
    }
    
    return rate * 100 // Return as percentage
  }

  /**
   * Get empty returns structure
   */
  private getEmptyReturns(): Returns {
    return {
      totalReturn: 0,
      totalReturnPercent: 0,
      annualizedReturn: 0,
      annualizedReturnPercent: 0,
      monthlyReturns: [],
      yearToDateReturn: 0,
      yearToDatePercent: 0,
      sinceInceptionReturn: 0,
      sinceInceptionPercent: 0
    }
  }
}