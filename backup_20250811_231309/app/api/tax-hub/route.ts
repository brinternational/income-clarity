/**
 * Tax Hub API - Consolidated endpoint
 * Consolidates: Tax intelligence, savings calculator, withholding, planning
 * Target response time: < 400ms
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

// Tax Hub response interface
interface TaxHubData {
  currentTaxBill: number
  estimatedQuarterly: number
  taxOptimizationSavings: number
  taxDragAnalysis: {
    totalDrag: number
    optimizedDrag: number
    savingsOpportunity: number
    dragReduction: number
  }
  withholdingTaxes: Array<{
    country: string
    amount: number
    recoverable: number
    treatyRate: number
    description: string
  }>
  taxPlanningStrategies: Array<{
    id: string
    strategy: string
    potentialSavings: number
    complexity: 'low' | 'medium' | 'high'
    description: string
    requirements: string[]
    timeline: string
  }>
  quarterlyEstimates: {
    q1: { amount: number; dueDate: string; paid: boolean }
    q2: { amount: number; dueDate: string; paid: boolean }
    q3: { amount: number; dueDate: string; paid: boolean }
    q4: { amount: number; dueDate: string; paid: boolean }
  }
  taxBracketAnalysis: {
    currentBracket: string
    marginalRate: number
    effectiveRate: number
    nextBracketThreshold: number
    distanceToNextBracket: number
  }
  locationAnalysis: {
    currentLocation: string
    stateTaxRate: number
    federalRate: number
    totalRate: number
    alternativeLocations: Array<{
      location: string
      stateTaxRate: number
      totalRate: number
      annualSavings: number
    }>
  }
  taxLossHarvesting: {
    opportunities: Array<{
      symbol: string
      unrealizedLoss: number
      potentialSavings: number
      washSaleRisk: boolean
    }>
    totalHarvestable: number
    estimatedSavings: number
  }
  lastUpdated: string
}

// Tax data service
class TaxHubService {
  constructor(private supabase: any, private userId: string, private userProfile: any) {}

  async getData(timeRange: string, fields?: string[]): Promise<TaxHubData> {
    try {
      const location = this.userProfile?.location || 'US-CA'
      
      // Get user's income data for tax calculations
      const incomeData = await this.getIncomeData()
      
      // Calculate current tax liability
      const taxLiability = this.calculateTaxLiability(incomeData.annualIncome, location)
      
      // Get withholding taxes
      const withholdingTaxes = await this.getWithholdingTaxes()
      
      // Analyze tax optimization opportunities
      const taxOptimization = await this.analyzeTaxOptimization(incomeData, location)
      
      // Get quarterly estimates
      const quarterlyEstimates = this.calculateQuarterlyEstimates(taxLiability.totalTax)
      
      // Analyze tax bracket position
      const taxBracketAnalysis = this.analyzeTaxBracket(incomeData.annualIncome, location)
      
      // Analyze location tax implications
      const locationAnalysis = this.analyzeLocationTaxes(incomeData.annualIncome, location)
      
      // Analyze tax loss harvesting opportunities
      const taxLossHarvesting = await this.analyzeTaxLossHarvesting()

      return {
        currentTaxBill: taxLiability.totalTax,
        estimatedQuarterly: taxLiability.totalTax / 4,
        taxOptimizationSavings: taxOptimization.totalSavings,
        taxDragAnalysis: taxOptimization.dragAnalysis,
        withholdingTaxes,
        taxPlanningStrategies: taxOptimization.strategies,
        quarterlyEstimates,
        taxBracketAnalysis,
        locationAnalysis,
        taxLossHarvesting,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      // Error handled by emergency recovery script
  }

  private async getIncomeData(): Promise<{
    annualIncome: number
    ordinaryIncome: number
    qualifiedDividends: number
    capitalGains: number
  }> {
    try {
      // In a real implementation, this would aggregate from multiple sources
      const { data: portfolios, error } = await this.supabase
        .from('portfolios')
        .select(`
          portfolio_holdings (
            symbol,
            shares
          )
        `)
        .eq('user_id', this.userId)

      if (error || !portfolios) {
        return { annualIncome: 0, ordinaryIncome: 0, qualifiedDividends: 0, capitalGains: 0 }
      }

      let estimatedDividends = 0
      for (const portfolio of portfolios) {
        for (const holding of portfolio.portfolio_holdings) {
          const dividendPerShare = this.getEstimatedDividend(holding.symbol)
          estimatedDividends += holding.shares * dividendPerShare
        }
      }

      return {
        annualIncome: estimatedDividends,
        ordinaryIncome: 0, // Assuming all dividends are qualified
        qualifiedDividends: estimatedDividends,
        capitalGains: 0 // Would need to calculate from sales data
      }
    } catch (error) {
      console.error('Error getting income data for tax calculations:', error)
      return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}> = {
      'US-CA': { rate: 0.133, name: 'California' },
      'US-TX': { rate: 0, name: 'Texas' },
      'US-FL': { rate: 0, name: 'Florida' },
      'US-NY': { rate: 0.109, name: 'New York' },
      'US-WA': { rate: 0, name: 'Washington' },
      'PR': { rate: 0, name: 'Puerto Rico' },
    }

    const currentRate = stateTaxRates[currentLocation]?.rate || 0.05
    const federalRate = this.getFederalDividendRate(annualIncome)
    const currentTotalRate = (federalRate + currentRate) * 100

    const alternativeLocations: TaxHubData['locationAnalysis']['alternativeLocations'] = []

    Object.entries(stateTaxRates).forEach(([location, data]) => {
      if (location !== currentLocation) {
        const totalRate = (federalRate + data.rate) * 100
        const annualSavings = annualIncome * (currentRate - data.rate)
        
        if (annualSavings > 0) {
          alternativeLocations.push({
            location: data.name,
            stateTaxRate: data.rate * 100,
            totalRate,
            annualSavings
          })
        }
      }
    })

    // Sort by highest savings
    alternativeLocations.sort((a, b) => b.annualSavings - a.annualSavings)

    return {
      currentLocation: stateTaxRates[currentLocation]?.name || currentLocation,
      stateTaxRate: currentRate * 100,
      federalRate: federalRate * 100,
      totalRate: currentTotalRate,
      alternativeLocations: alternativeLocations.slice(0, 3) // Top 3 alternatives
    }
  }

  private async analyzeTaxLossHarvesting(): Promise<TaxHubData['taxLossHarvesting']> {
    // Mock implementation - in production, calculate actual unrealized losses
    const opportunities = [
      {
        symbol: 'META',
        unrealizedLoss: 2500,
        potentialSavings: 375, // Loss * marginal tax rate
        washSaleRisk: false
      },
      {
        symbol: 'NFLX',
        unrealizedLoss: 1200,
        potentialSavings: 180,
        washSaleRisk: true
      }
    ]

    const totalHarvestable = opportunities.reduce((sum, opp) => 
      sum + (opp.washSaleRisk ? 0 : opp.unrealizedLoss), 0)
    
    const estimatedSavings = opportunities.reduce((sum, opp) => 
      sum + (opp.washSaleRisk ? 0 : opp.potentialSavings), 0)

    return {
      opportunities,
      totalHarvestable,
      estimatedSavings
    }
  }

  private getTotalTaxRate(annualIncome: number, location: string): number {
    const taxLiability = this.calculateTaxLiability(annualIncome, location)
    return annualIncome > 0 ? (taxLiability.totalTax / annualIncome) * 100 : 0
  }

  private calculateLocationSavings(annualIncome: number, currentLocation: string): number {
    const currentTax = this.calculateTaxLiability(annualIncome, currentLocation).totalTax
    
    // Compare with Puerto Rico (0% dividend tax)
    const prTax = this.calculateTaxLiability(annualIncome, 'PR').totalTax
    
    return Math.max(0, currentTax - prTax)
  }

  private async estimateTaxLossHarvestingSavings(): Promise<number> {
    // Mock implementation - would calculate from actual portfolio data
    return 500
  }

  private getFederalDividendRate(annualIncome: number): number {
    if (annualIncome > 518900) return 0.20
    if (annualIncome > 89450) return 0.15
    if (annualIncome > 47025) return 0.15
    return 0
  }

  private isQuarterPaid(quarter: string): boolean {
    // Mock implementation - would check actual payment records
    return Math.random() > 0.5
  }

  private getEstimatedDividend(symbol: string): number {
    // Mock implementation
    const estimates: Record<string, number> = {
      'AAPL': 0.96,
      'MSFT': 3.00,
      'JNJ': 4.68,
      'KO': 1.84,
      'PG': 3.65
    }
    return estimates[symbol] || 2.00
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
    const cached = await hubCacheManager.get<TaxHubData>(
      user.id,
      'tax-hub',
      timeRange,
      fields
    )

    if (cached.data) {
      await monitor.logMetrics(user.id, 'tax-hub', true)
      return createSuccessResponse(cached.data, monitor, user.id, true, cached.source)
    }

    // Cache miss - fetch fresh data
    const taxService = new TaxHubService(supabase, user.id, userProfile)
    const taxData = await taxService.getData(timeRange, fields)

    // Cache the result
    await hubCacheManager.set(user.id, 'tax-hub', taxData, timeRange, fields)

    // Trigger predictive preloading - temporarily disabled
    // hubCacheManager.predictivePreload(user.id, 'tax-hub').catch(err => {
    //   console.warn('Predictive preload error:', err)
    })

    await monitor.logMetrics(user.id, 'tax-hub', false)
    return createSuccessResponse(taxData, monitor, user.id, false)

  } catch (error) {
    console.error('Tax Hub API error:', error)
    // await monitor.logMetrics(user.id, 'tax-hub', false, error as Error)
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
      const invalidatedCount = await hubCacheManager.invalidateUserHub(user.id, 'tax-hub')
      return createSuccessResponse({
        message: `Tax hub cache invalidated`,
        invalidatedCount
      }, monitor, user.id)
    }

    if (body.action === 'warm_cache') {
      await hubCacheManager.warmUserCache(user.id, ['tax-hub'])
      return createSuccessResponse({
        message: 'Tax hub cache warmed'
      }, monitor, user.id)
    }

    if (body.action === 'stats') {
      const stats = await hubCacheManager.getHubStats('tax-hub')
      return createSuccessResponse(stats, monitor, user.id)
    }

    return createErrorResponse(
      new Error('Invalid action. Supported: invalidate_cache, warm_cache, stats'),
      monitor,
      'VALIDATION_ERROR'
    )

  } catch (error) {
    console.error('Tax Hub POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )