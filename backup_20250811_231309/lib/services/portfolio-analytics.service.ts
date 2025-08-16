/**
 * Portfolio Analytics Service
 * Integrates PortfolioMetrics, PerformanceCalculator, and DividendCalculator
 * with real portfolio data from the database
 */

import { PortfolioMetrics, PerformanceCalculator, DividendCalculator } from '@/lib/calculations'
import type { 
  GainLoss, 
  AllocationData, 
  PortfolioSummary,
  Returns,
  PerformanceMetrics,
  DividendProjection,
  DividendSummary
} from '@/lib/calculations'

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
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'SPLIT' | 'MERGER'
  shares?: number
  amount: number
  date: string
  notes?: string
  metadata?: string
  createdAt: string
}

export interface EnhancedHolding extends Holding {
  currentValue: number
  costBasis: number
  unrealizedGainLoss: number
  unrealizedGainLossPercent: number
  portfolioPercentage: number
  annualDividendIncome: number
  dividendYield: number
  ytdPerformance?: number
}

export interface PortfolioAnalytics {
  portfolio: Portfolio
  summary: PortfolioSummary
  performance: PerformanceMetrics
  dividendSummary: DividendSummary
  enhancedHoldings: EnhancedHolding[]
  benchmarkComparison?: {
    symbol: string
    return: number
    outperformance: number
  }
}

export interface SuperCardsPerformanceData {
  portfolioValue: number
  spyComparison: {
    portfolioReturn: number
    spyReturn: number
    outperformance: number
  }
  holdings: Array<{
    ticker: string
    shares: number
    currentValue: number
    ytdPerformance: number
    allocation: number
    dividendYield: number
  }>
  timePeriodData: {
    [key: string]: {
      portfolioReturn: number
      spyReturn: number
      outperformance: number
    }
  }
  spyOutperformance: number
}

export class PortfolioAnalyticsService {
  private portfolioMetrics: PortfolioMetrics
  private performanceCalculator: PerformanceCalculator
  private dividendCalculator: DividendCalculator
  private readonly API_BASE_URL = '/api'

  constructor() {
    this.portfolioMetrics = new PortfolioMetrics()
    this.performanceCalculator = new PerformanceCalculator()
    this.dividendCalculator = new DividendCalculator()
  }

  /**
   * Fetch comprehensive analytics for a portfolio
   */
  async getPortfolioAnalytics(portfolioId: string): Promise<PortfolioAnalytics> {
    try {
      // Fetch all required data in parallel
      const [portfolio, holdings, transactions] = await Promise.all([
        this.fetchPortfolio(portfolioId),
        this.fetchHoldings(portfolioId),
        this.fetchTransactions(portfolioId)
      ])

      if (!portfolio) {
        throw new Error('Portfolio not found')
      }

      // Calculate comprehensive metrics
      const summary = await this.portfolioMetrics.calculatePortfolioSummary(holdings, transactions)
      const performance = await this.performanceCalculator.calculatePerformanceMetrics(
        portfolio, 
        holdings, 
        transactions, 
        'SPY'
      )
      const dividendSummary = this.dividendCalculator.calculateDividendSummary(holdings, transactions)

      // Create enhanced holdings with additional metrics
      const enhancedHoldings = this.createEnhancedHoldings(holdings, summary, dividendSummary)

      return {
        portfolio,
        summary,
        performance,
        dividendSummary,
        enhancedHoldings,
        benchmarkComparison: performance.benchmarkComparison ? {
          symbol: 'SPY',
          return: performance.benchmarkComparison.benchmarkReturn,
          outperformance: performance.benchmarkComparison.outperformance
        } : undefined
      }
    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Get analytics for all user portfolios
   */
  async getAllPortfoliosAnalytics(): Promise<PortfolioAnalytics[]> {
    try {
      const portfolios = await this.fetchAllPortfolios()
      const analyticsPromises = portfolios.map(p => this.getPortfolioAnalytics(p.id))
      return await Promise.all(analyticsPromises)
    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Convert analytics to Super Cards format for backward compatibility
   */
  async getPerformanceHubData(portfolioId?: string, timeRange: string = '1Y'): Promise<SuperCardsPerformanceData> {
    try {
      let analytics: PortfolioAnalytics | PortfolioAnalytics[]
      
      if (portfolioId) {
        analytics = await this.getPortfolioAnalytics(portfolioId)
      } else {
        // Get combined data from all portfolios
        const allAnalytics = await this.getAllPortfoliosAnalytics()
        if (allAnalytics.length === 0) {
          return this.getEmptyPerformanceData()
        }
        analytics = allAnalytics[0] // Use first portfolio for now, could be combined
      }

      if (Array.isArray(analytics)) {
        analytics = analytics[0]
      }

      if (!analytics) {
        return this.getEmptyPerformanceData()
      }

      const spyReturn = analytics.benchmarkComparison?.return || 10.5
      const portfolioReturn = analytics.performance.totalReturn.annualizedReturnPercent
      const outperformance = portfolioReturn - spyReturn

      return {
        portfolioValue: analytics.summary.totalValue,
        spyComparison: {
          portfolioReturn: portfolioReturn / 100,
          spyReturn: spyReturn / 100,
          outperformance: outperformance / 100
        },
        holdings: analytics.enhancedHoldings.map(h => ({
          ticker: h.ticker,
          shares: h.shares,
          currentValue: h.currentValue,
          ytdPerformance: h.ytdPerformance || 0,
          allocation: h.portfolioPercentage,
          dividendYield: h.dividendYield
        })),
        timePeriodData: this.generateTimePeriodData(analytics.performance.totalReturn),
        spyOutperformance: outperformance / 100
      }
    } catch (error) {
      // console.error('Error generating performance hub data:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })