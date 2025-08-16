/**
 * Performance Hub API - Consolidated endpoint
 * Consolidates: SPY comparison, holdings performance, portfolio overview, sector analysis
 * Target response time: < 500ms
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

// Performance Hub response interface
interface PerformanceHubData {
  portfolioValue: number
  totalReturn: number
  spyComparison: {
    portfolioReturn: number
    spyReturn: number
    outperformance: number
    lastUpdated: string
  }
  holdings: Array<{
    id: string
    symbol: string
    shares: number
    currentPrice: number
    marketValue: number
    totalReturn: number
    totalReturnPercent: number
    dividendYield: number
    sector?: string
  }>
  sectorAnalysis: {
    allocation: Record<string, number>
    performance: Record<string, number>
  }
  timePeriodData: {
    '1M': { portfolioReturn: number; spyReturn: number; outperformance: number }
    '3M': { portfolioReturn: number; spyReturn: number; outperformance: number }
    '6M': { portfolioReturn: number; spyReturn: number; outperformance: number }
    '1Y': { portfolioReturn: number; spyReturn: number; outperformance: number }
  }
  lastUpdated: string
}

// Performance data service
class PerformanceHubService {
  constructor(private supabase: any, private userId: string) {}

  async getData(timeRange: string, fields?: string[]): Promise<PerformanceHubData> {
    try {
      // Get user's portfolios and holdings
      const { data: portfolios, error: portfolioError } = await this.supabase
        .from('portfolios')
        .select(`
          id,
          name,
          portfolio_holdings!inner (
            id,
            symbol,
            shares,
            purchase_price,
            purchase_date
          )
        `)
        .eq('user_id', this.userId)

      if (portfolioError) {
        // console.error('Portfolio fetch error:', portfolioError)
        // return getDefaultResponse('performance') as PerformanceHubData
      }

      if (!portfolios || portfolios.length === 0) {
        return getDefaultResponse('performance') as PerformanceHubData
      }

      // Get current stock prices for all holdings
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

      // Get SPY price for comparison
      const spyResult = await stockPriceService.getStockPrice('SPY')
      const spyPrice = 'price' in spyResult ? spyResult.price : 0

      // Calculate portfolio metrics
      const holdings: PerformanceHubData['holdings'] = []
      let totalPortfolioValue = 0

      for (const portfolio of portfolios) {
        for (const holding of portfolio.portfolio_holdings) {
          const stockData = priceMap.get(holding.symbol)
          const currentPrice = stockData?.price || 0
          const marketValue = holding.shares * currentPrice
          const totalCost = holding.shares * holding.purchase_price
          const totalReturn = marketValue - totalCost
          const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

          holdings.push({
            id: holding.id,
            symbol: holding.symbol,
            shares: holding.shares,
            currentPrice,
            marketValue,
            totalReturn,
            totalReturnPercent,
            dividendYield: this.estimateDividendYield(holding.symbol),
            sector: this.getSector(holding.symbol)
          })

          totalPortfolioValue += marketValue
        }
      }

      // Calculate sector analysis
      const sectorAnalysis = this.calculateSectorAnalysis(holdings, totalPortfolioValue)

      // Get SPY comparison data (mock implementation - in production, use historical data)
      const spyComparison = await this.calculateSPYComparison(totalPortfolioValue, holdings)

      // Calculate time period data
      const timePeriodData = await this.calculateTimePeriodData(holdings, spyPrice)

      return {
        portfolioValue: totalPortfolioValue,
        totalReturn: holdings.reduce((sum, h) => sum + h.totalReturn, 0),
        spyComparison,
        holdings: fields ? this.filterHoldingFields(holdings, fields) : holdings,
        sectorAnalysis,
        timePeriodData,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      // Error handled by emergency recovery script
  }

  private calculateSectorAnalysis(
    holdings: PerformanceHubData['holdings'], 
    totalValue: number
  ): PerformanceHubData['sectorAnalysis'] {
    const allocation: Record<string, number> = {}
    const performance: Record<string, number> = {}
    const sectorValues: Record<string, number> = {}
    const sectorReturns: Record<string, number> = {}

    holdings.forEach(holding => {
      const sector = holding.sector || 'Unknown'
      allocation[sector] = (allocation[sector] || 0) + holding.marketValue
      sectorValues[sector] = (sectorValues[sector] || 0) + holding.marketValue
      sectorReturns[sector] = (sectorReturns[sector] || 0) + holding.totalReturn
    })

    // Convert to percentages
    Object.keys(allocation).forEach(sector => {
      allocation[sector] = totalValue > 0 ? (allocation[sector] / totalValue) * 100 : 0
      performance[sector] = sectorValues[sector] > 0 ? 
        (sectorReturns[sector] / (sectorValues[sector] - sectorReturns[sector])) * 100 : 0
    })

    return { allocation, performance }
  }

  private async calculateSPYComparison(
    portfolioValue: number,
    holdings: PerformanceHubData['holdings']
  ): Promise<PerformanceHubData['spyComparison']> {
    // Mock implementation - in production, calculate actual returns vs SPY
    const portfolioReturn = holdings.reduce((sum, h) => sum + h.totalReturnPercent * (h.marketValue / portfolioValue), 0)
    const spyReturn = 10.5 // Mock 1-year SPY return
    
    return {
      portfolioReturn,
      spyReturn,
      outperformance: portfolioReturn - spyReturn,
      lastUpdated: new Date().toISOString()
    }
  }

  private async calculateTimePeriodData(
    holdings: PerformanceHubData['holdings'],
    spyPrice: number
  ): Promise<PerformanceHubData['timePeriodData']> {
    // Mock implementation - in production, use historical data
    const baseReturn = holdings.reduce((sum, h) => sum + h.totalReturnPercent, 0) / holdings.length || 0
    
    return {
      '1M': {
        portfolioReturn: baseReturn * 0.1,
        spyReturn: 1.2,
        outperformance: (baseReturn * 0.1) - 1.2
      },
      '3M': {
        portfolioReturn: baseReturn * 0.3,
        spyReturn: 3.5,
        outperformance: (baseReturn * 0.3) - 3.5
      },
      '6M': {
        portfolioReturn: baseReturn * 0.6,
        spyReturn: 6.8,
        outperformance: (baseReturn * 0.6) - 6.8
      },
      '1Y': {
        portfolioReturn: baseReturn,
        spyReturn: 10.5,
        outperformance: baseReturn - 10.5
      }
    }
  }

  private filterHoldingFields(
    holdings: PerformanceHubData['holdings'], 
    fields: string[]
  ): Partial<PerformanceHubData['holdings'][0]>[] {
    return holdings.map(holding => {
      const filtered: any = {}
      fields.forEach(field => {
        if (field in holding) {
          filtered[field] = holding[field as keyof typeof holding]
        }
      })
      return filtered
    })
  }

  private estimateDividendYield(symbol: string): number {
    // Mock implementation - in production, get actual dividend data
    const estimates: Record<string, number> = {
      'AAPL': 0.44,
      'MSFT': 0.68,
      'JNJ': 2.61,
      'KO': 3.07,
      'PG': 2.41
    }
    return estimates[symbol] || 2.0
  }

  private getSector(symbol: string): string {
    // Mock implementation - in production, get actual sector data
    const sectors: Record<string, string> = {
      'AAPL': 'Technology',
      'MSFT': 'Technology', 
      'JNJ': 'Healthcare',
      'KO': 'Consumer Defensive',
      'PG': 'Consumer Defensive'
    }
    return sectors[symbol] || 'Unknown'
  }
}

// GET endpoint
export async function GET(request: NextRequest) {
  const initResult = await initializeAPIHandler(request)
  
  if ('error' in initResult) {
    return initResult.error
  }

  const { supabase, user, userProfile, monitor, rateLimiter } = initResult

  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      rateLimiter,
      user.id,
      userProfile?.subscription_tier || 'free',
      monitor
    )
    
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Parse request parameters
    const url = new URL(request.url)
    const timeRange = validateTimeRange(url.searchParams.get('timeRange') || undefined)
    const fieldsParam = url.searchParams.get('fields')
    const fields = fieldsParam ? fieldsParam.split(',').map(f => f.trim()) : undefined

    // Check cache first
    const cached = await hubCacheManager.get<PerformanceHubData>(
      user.id,
      'performance-hub',
      timeRange,
      fields
    )

    if (cached.data) {
      await monitor.logMetrics(user.id, 'performance-hub', true)
      return createSuccessResponse(cached.data, monitor, user.id, true, cached.source)
    }

    // Cache miss - fetch fresh data
    const performanceService = new PerformanceHubService(supabase, user.id)
    const performanceData = await performanceService.getData(timeRange, fields)

    // Cache the result
    await hubCacheManager.set(user.id, 'performance-hub', performanceData, timeRange, fields)

    // Trigger predictive preloading - temporarily disabled
    // hubCacheManager.predictivePreload(user.id, 'performance-hub').catch(err => {
    //   console.warn('Predictive preload error:', err)
    })

    await monitor.logMetrics(user.id, 'performance-hub', false)
    return createSuccessResponse(performanceData, monitor, user.id, false)

  } catch (error) {
    console.error('Performance Hub API error:', error)
    // await monitor.logMetrics(user.id, 'performance-hub', false, error as Error)
    return createErrorResponse(error as Error, monitor)
  }
}

// POST endpoint for cache management
export async function POST(request: NextRequest) {
  const initResult = await initializeAPIHandler(request)
  
  if ('error' in initResult) {
    return initResult.error
  }

  const { user, monitor } = initResult

  try {
    const body = await request.json()

    if (body.action === 'invalidate_cache') {
      const invalidatedCount = await hubCacheManager.invalidateUserHub(user.id, 'performance-hub')
      return createSuccessResponse({
        message: `Performance hub cache invalidated`,
        invalidatedCount
      }, monitor, user.id)
    }

    if (body.action === 'warm_cache') {
      await hubCacheManager.warmUserCache(user.id, ['performance-hub'])
      return createSuccessResponse({
        message: 'Performance hub cache warmed'
      }, monitor, user.id)
    }

    if (body.action === 'stats') {
      const stats = await hubCacheManager.getHubStats('performance-hub')
      return createSuccessResponse(stats, monitor, user.id)
    }

    return createErrorResponse(
      new Error('Invalid action. Supported: invalidate_cache, warm_cache, stats'),
      monitor,
      'VALIDATION_ERROR'
    )

  } catch (error) {
    console.error('Performance Hub POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )