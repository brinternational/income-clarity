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

export interface GainLoss {
  totalGain: number
  totalLoss: number
  netGainLoss: number
  percentageGainLoss: number
  unrealizedGainLoss: number
  realizedGainLoss: number
}

export interface AllocationData {
  byTicker: Array<{
    ticker: string
    value: number
    percentage: number
    shares: number
  }>
  bySector?: Array<{
    sector: string
    value: number
    percentage: number
    tickers: string[]
  }>
  topHoldings: Array<{
    ticker: string
    value: number
    percentage: number
    shares: number
  }>
}

export interface PortfolioSummary {
  totalValue: number
  costBasis: number
  cashValue: number
  netWorth: number
  gainLoss: GainLoss
  allocation: AllocationData
  metrics: {
    diversificationScore: number
    concentrationRisk: number
    averageHoldingSize: number
    positionCount: number
  }
}

export class PortfolioMetrics {
  private readonly stockService?: any

  constructor(stockPriceService?: any) {
    this.stockService = stockPriceService
  }

  /**
   * Calculate total portfolio value
   */
  calculateTotalValue(holdings: Holding[]): number {
    return holdings.reduce((total, holding) => {
      const currentPrice = holding.currentPrice || holding.averagePrice
      return total + (holding.shares * currentPrice)
    }, 0)
  }

  /**
   * Calculate total cost basis
   */
  calculateCostBasis(holdings: Holding[]): number {
    return holdings.reduce((total, holding) => {
      return total + (holding.shares * holding.averagePrice)
    }, 0)
  }

  /**
   * Calculate comprehensive gain/loss metrics
   */
  calculateGainLoss(holdings: Holding[], transactions: Transaction[] = []): GainLoss {
    const totalValue = this.calculateTotalValue(holdings)
    const costBasis = this.calculateCostBasis(holdings)
    
    // Unrealized gain/loss (current holdings)
    const unrealizedGainLoss = totalValue - costBasis
    
    // Realized gain/loss from transactions
    const realizedGainLoss = this.calculateRealizedGains(transactions)
    
    const netGainLoss = unrealizedGainLoss + realizedGainLoss
    const percentageGainLoss = costBasis > 0 ? (netGainLoss / costBasis) * 100 : 0
    
    return {
      totalGain: Math.max(0, netGainLoss),
      totalLoss: Math.max(0, -netGainLoss),
      netGainLoss,
      percentageGainLoss,
      unrealizedGainLoss,
      realizedGainLoss
    }
  }

  /**
   * Calculate realized gains from sell transactions
   */
  private calculateRealizedGains(transactions: Transaction[]): number {
    const sellTransactions = transactions.filter(t => t.type === 'SELL')
    const buyTransactions = transactions.filter(t => t.type === 'BUY')
    
    let totalRealizedGains = 0
    
    for (const sell of sellTransactions) {
      if (!sell.shares) continue
      
      // Find corresponding buy transactions for this ticker
      const buys = buyTransactions
        .filter(b => b.ticker === sell.ticker && new Date(b.date) <= new Date(sell.date))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // FIFO
      
      let sharesRemaining = sell.shares
      let totalCostBasis = 0
      
      for (const buy of buys) {
        if (!buy.shares || sharesRemaining <= 0) continue
        
        const sharesToUse = Math.min(buy.shares, sharesRemaining)
        totalCostBasis += sharesToUse * buy.amount
        sharesRemaining -= sharesToUse
        
        if (sharesRemaining <= 0) break
      }
      
      const proceeds = sell.shares * sell.amount
      const realizedGain = proceeds - totalCostBasis
      totalRealizedGains += realizedGain
    }
    
    return totalRealizedGains
  }

  /**
   * Calculate portfolio allocation by ticker
   */
  calculateAllocation(holdings: Holding[]): AllocationData {
    const totalValue = this.calculateTotalValue(holdings)
    
    if (totalValue === 0) {
      return {
        byTicker: [],
        topHoldings: []
      }
    }

    const allocationByTicker = holdings.map(holding => {
      const currentPrice = holding.currentPrice || holding.averagePrice
      const value = holding.shares * currentPrice
      const percentage = (value / totalValue) * 100
      
      return {
        ticker: holding.ticker,
        value,
        percentage,
        shares: holding.shares
      }
    }).sort((a, b) => b.value - a.value)

    // Get top 10 holdings
    const topHoldings = allocationByTicker.slice(0, 10)

    // Calculate diversification metrics
    const positionCount = holdings.length
    const averageHoldingSize = positionCount > 0 ? totalValue / positionCount : 0
    
    // Concentration risk (percentage in top holding)
    const concentrationRisk = allocationByTicker.length > 0 ? allocationByTicker[0].percentage : 0
    
    // Diversification score (inverse of concentration, 0-100 scale)
    const diversificationScore = Math.max(0, 100 - concentrationRisk)

    return {
      byTicker: allocationByTicker,
      topHoldings,
      metrics: {
        diversificationScore,
        concentrationRisk,
        averageHoldingSize,
        positionCount
      }
    } as any
  }

  /**
   * Calculate comprehensive portfolio summary
   */
  async calculatePortfolioSummary(
    holdings: Holding[], 
    transactions: Transaction[] = [],
    includeCurrentPrices = false
  ): Promise<PortfolioSummary> {
    // Update current prices if requested and service available
    if (includeCurrentPrices && this.stockService) {
      await this.updateCurrentPrices(holdings)
    }

    const totalValue = this.calculateTotalValue(holdings)
    const costBasis = this.calculateCostBasis(holdings)
    const gainLoss = this.calculateGainLoss(holdings, transactions)
    const allocation = this.calculateAllocation(holdings)
    
    // Calculate cash value from dividends and sales
    const cashValue = this.calculateCashValue(transactions)
    const netWorth = totalValue + cashValue

    return {
      totalValue,
      costBasis,
      cashValue,
      netWorth,
      gainLoss,
      allocation,
      metrics: {
        diversificationScore: allocation.metrics?.diversificationScore || 0,
        concentrationRisk: allocation.metrics?.concentrationRisk || 0,
        averageHoldingSize: allocation.metrics?.averageHoldingSize || 0,
        positionCount: allocation.metrics?.positionCount || 0
      }
    }
  }

  /**
   * Calculate cash value from transactions
   */
  private calculateCashValue(transactions: Transaction[]): number {
    return transactions.reduce((cash, transaction) => {
      switch (transaction.type) {
        case 'SELL':
          return cash + transaction.amount
        case 'DIVIDEND':
        case 'INTEREST':
          return cash + transaction.amount
        case 'BUY':
          return cash - transaction.amount
        default:
          return cash
      }
    }, 0)
  }

  /**
   * Update current prices for holdings
   */
  private async updateCurrentPrices(holdings: Holding[]): Promise<void> {
    if (!this.stockService) return

    const tickers = [...new Set(holdings.map(h => h.ticker))]
    
    try {
      const prices = await this.stockService.getBatchPrices(tickers)
      
      for (const holding of holdings) {
        if (prices[holding.ticker]) {
          holding.currentPrice = prices[holding.ticker].price
          holding.lastUpdated = new Date().toISOString()
        }
      }
    } catch (error) {
      // Error handled by emergency recovery script

  /**
   * Calculate position size recommendations
   */
  calculatePositionSizing(
    holdings: Holding[], 
    targetAllocation: Record<string, number> = {}
  ): Array<{
    ticker: string
    currentPercentage: number
    targetPercentage: number
    recommendedAction: 'buy' | 'sell' | 'hold'
    suggestedShares?: number
    suggestedAmount?: number
  }> {
    const totalValue = this.calculateTotalValue(holdings)
    const allocation = this.calculateAllocation(holdings)
    
    return allocation.byTicker.map(holding => {
      const targetPercentage = targetAllocation[holding.ticker] || 0
      const currentPercentage = holding.percentage
      const difference = targetPercentage - currentPercentage
      
      let recommendedAction: 'buy' | 'sell' | 'hold' = 'hold'
      let suggestedShares: number | undefined
      let suggestedAmount: number | undefined
      
      if (Math.abs(difference) > 2) { // Only recommend if difference > 2%
        if (difference > 0) {
          recommendedAction = 'buy'
          suggestedAmount = (difference / 100) * totalValue
          
          const holdingData = holdings.find(h => h.ticker === holding.ticker)
          if (holdingData?.currentPrice || holdingData?.averagePrice) {
            const price = holdingData.currentPrice || holdingData.averagePrice
            suggestedShares = suggestedAmount / price
          }
        } else {
          recommendedAction = 'sell'
          suggestedAmount = Math.abs(difference / 100) * totalValue
          
          const holdingData = holdings.find(h => h.ticker === holding.ticker)
          if (holdingData?.currentPrice || holdingData?.averagePrice) {
            const price = holdingData.currentPrice || holdingData.averagePrice
            suggestedShares = suggestedAmount / price
          }
        }
      }
      
      return {
        ticker: holding.ticker,
        currentPercentage,
        targetPercentage,
        recommendedAction,
        suggestedShares,
        suggestedAmount
      }
    })
  }

  /**
   * Calculate risk metrics
   */
  calculateRiskMetrics(holdings: Holding[], transactions: Transaction[] = []): {
    volatilityScore: number
    beta: number
    sharpeRatio: number
    maxDrawdown: number
    valueAtRisk: number
    diversificationRatio: number
  } {
    // This would typically require historical price data
    // For now, provide basic calculations based on available data
    
    const allocation = this.calculateAllocation(holdings)
    const gainLoss = this.calculateGainLoss(holdings, transactions)
    
    // Basic risk calculations
    const concentrationRisk = allocation.metrics?.concentrationRisk || 0
    const diversificationRatio = Math.max(0, (100 - concentrationRisk) / 100)
    
    // Simplified volatility based on position concentration
    const volatilityScore = concentrationRisk > 50 ? 8 : concentrationRisk > 25 ? 5 : 3
    
    return {
      volatilityScore,
      beta: 1.0, // Would need market data
      sharpeRatio: 0, // Would need risk-free rate and historical returns
      maxDrawdown: Math.min(0, gainLoss.percentageGainLoss), // Simplified
      valueAtRisk: 0, // Would need historical volatility data
      diversificationRatio
    }
  }
}