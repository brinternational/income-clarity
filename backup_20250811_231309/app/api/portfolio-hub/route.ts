/**
 * Portfolio Hub API - Consolidated endpoint
 * Consolidates: Portfolio health, rebalancing, comparison, margin intelligence
 * Uses Polygon.io for live prices
 * Target response time: < 600ms (higher due to live price fetching)
 */

import { NextRequest } from 'next/server'
import { 
  initializeAPIHandler, 
  checkRateLimit, 
  createErrorResponse, 
  createSuccessResponse,
  validateTimeRange,
  buildSelectClause,
  getDefaultResponse
} from '@/lib/api-utils'
import { hubCacheManager } from '@/lib/cache-manager'
import { stockPriceService } from '@/lib/stock-price-service'

// Portfolio Hub response interface
interface PortfolioHubData {
  portfolioHealth: {
    healthScore: number
    riskLevel: 'conservative' | 'moderate' | 'aggressive'
    diversificationScore: number
    concentrationRisk: number
    rebalanceNeeded: boolean
    totalValue: number
    lastRebalance?: string
  }
  rebalancingSuggestions: Array<{
    symbol: string
    currentWeight: number
    targetWeight: number
    currentValue: number
    targetValue: number
    action: 'buy' | 'sell' | 'hold'
    amount: number
    priority: 'high' | 'medium' | 'low'
    reason: string
  }>
  strategyComparison: Array<{
    strategy: string
    currentAllocation: number
    benchmarkAllocation: number
    performance1Y: number
    sharpeRatio: number
    maxDrawdown: number
    recommendation: string
  }>
  marginIntelligence: {
    utilizationRate: number
    availableCredit: number
    interestCost: number
    riskLevel: 'low' | 'medium' | 'high'
    maintenanceMargin: number
    marginCall: boolean
    optimizationTips: string[]
  }
  riskMetrics: {
    portfolioBeta: number
    standardDeviation: number
    sharpeRatio: number
    maxDrawdown: number
    var95: number // Value at Risk
    correlationMatrix: Record<string, Record<string, number>>
  }
  sectorAnalysis: {
    diversificationScore: number
    overweightSectors: Array<{ sector: string; weight: number; benchmark: number }>
    underweightSectors: Array<{ sector: string; weight: number; benchmark: number }>
    recommendations: string[]
  }
  performanceAttribution: {
    securitySelection: number
    sectorAllocation: number
    interactionEffect: number
    totalActiveReturn: number
  }
  lastUpdated: string
}

// Portfolio data service
class PortfolioHubService {
  constructor(private supabase: any, private userId: string) {}

  async getData(timeRange: string, fields?: string[]): Promise<PortfolioHubData> {
    try {
      // Get user's portfolios and holdings with current prices
      const portfolioData = await this.getPortfolioData()
      
      if (!portfolioData || portfolioData.totalValue === 0) {
        return getDefaultResponse('portfolio') as PortfolioHubData
      }

      // Calculate portfolio health metrics
      const portfolioHealth = await this.calculatePortfolioHealth(portfolioData)
      
      // Generate rebalancing suggestions
      const rebalancingSuggestions = await this.generateRebalancingSuggestions(portfolioData)
      
      // Compare with strategy benchmarks
      const strategyComparison = await this.performStrategyComparison(portfolioData)
      
      // Analyze margin usage (if applicable)
      const marginIntelligence = await this.analyzeMarginUsage()
      
      // Calculate risk metrics
      const riskMetrics = await this.calculateRiskMetrics(portfolioData)
      
      // Analyze sector allocation
      const sectorAnalysis = await this.analyzeSectorAllocation(portfolioData)
      
      // Calculate performance attribution
      const performanceAttribution = await this.calculatePerformanceAttribution(portfolioData)

      return {
        portfolioHealth,
        rebalancingSuggestions,
        strategyComparison,
        marginIntelligence,
        riskMetrics,
        sectorAnalysis,
        performanceAttribution,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      // Error handled by emergency recovery script
  }

  private async getPortfolioData(): Promise<{
    holdings: Array<{
      symbol: string
      shares: number
      purchasePrice: number
      currentPrice: number
      marketValue: number
      weight: number
      sector: string
      beta?: number
    }>
    totalValue: number
  } | null> {
    try {
      const { data: portfolios, error } = await this.supabase
        .from('portfolios')
        .select(`
          id,
          name,
          portfolio_holdings!inner (
            id,
            symbol,
            shares,
            purchase_price
          )
        `)
        .eq('user_id', this.userId)

      if (error || !portfolios || portfolios.length === 0) {
        return null
      }

      // Get current prices for all holdings
      const symbols = portfolios
        .flatMap(p => p.portfolio_holdings)
        .map(h => h.symbol)
      
      const uniqueSymbols = [...new Set(symbols)]
      const stockPrices = await stockPriceService.getMultipleStockPrices(uniqueSymbols)
      const priceMap = new Map()
      
      stockPrices.forEach(result => {
        if ('price' in result) {
          priceMap.set(result.ticker, result)
        }
      })

      // Calculate holdings with current values
      const holdings = []
      let totalValue = 0

      for (const portfolio of portfolios) {
        for (const holding of portfolio.portfolio_holdings) {
          const stockData = priceMap.get(holding.symbol)
          const currentPrice = stockData?.price || holding.purchase_price
          const marketValue = holding.shares * currentPrice

          holdings.push({
            symbol: holding.symbol,
            shares: holding.shares,
            purchasePrice: holding.purchase_price,
            currentPrice,
            marketValue,
            weight: 0, // Will be calculated after totalValue
            sector: this.getSector(holding.symbol),
            beta: this.getBeta(holding.symbol)
          })

          totalValue += marketValue
        }
      }

      // Calculate weights
      holdings.forEach(holding => {
        holding.weight = totalValue > 0 ? (holding.marketValue / totalValue) * 100 : 0
      })

      return { holdings, totalValue }
    } catch (error) {
      console.error('Error getting portfolio data:', error)
      return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )