/**
 * Super Cards API Client
 * Handles all API interactions for Super Card components
 */

import { LOCAL_MODE_CONFIG } from '@/lib/config/local-mode'
import { mockSuperCardsData } from '@/lib/mock-data/super-cards-mock-data'
import { superCardsDatabaseService } from '@/lib/services/super-cards-database.service'

export type SuperCard = 'performance' | 'income' | 'tax' | 'portfolio' | 'planning'
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'MAX'

interface SuperCardRequest {
  cards: SuperCard[]
  fields?: Partial<Record<SuperCard, string[]>>
  timeRange?: TimeRange
  includeProjections?: boolean
  includeComparisons?: boolean
  includeMetadata?: boolean
}

interface SuperCardResponse {
  data: Partial<Record<SuperCard, any>>
  metadata: {
    requestId: string
    timestamp: string
    responseTime: number
    cached: boolean
    ttl: number
    userId: string
    dataFreshness: Record<SuperCard, string>
  }
  pagination?: {
    hasMore: boolean
    nextCursor?: string
  }
}

class SuperCardsAPI {
  private baseUrl = '/api/super-cards'
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTTL = 60000 // 1 minute cache

  /**
   * Fetch data for specific super cards
   */
  async fetchSuperCards(request: SuperCardRequest): Promise<SuperCardResponse> {
    // Check if in local mode
    if (LOCAL_MODE_CONFIG.enabled) {
      return this.getMockData(request)
    }

    const cacheKey = this.getCacheKey(request)
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cached: true,
          responseTime: 0
        }
      }
    }

    const startTime = performance.now()

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data: SuperCardResponse = await response.json()
      
      // Update response time
      data.metadata.responseTime = performance.now() - startTime
      
      // Cache the response
      this.setCache(cacheKey, data)
      
      return data
    } catch (error) {
      // console.error('Error fetching super cards:', error)

      // Fallback to mock data on error
      return this.getMockData(request)
    }
  }

  /**
   * Fetch Performance Hub specific data
   */
  async fetchPerformanceHub(timeRange: TimeRange = '1Y'): Promise<any> {
    // Try to get real database data first
    try {
      // console.log('Fetching performance data from SQLite database...')
      // const realData = await superCardsDatabaseService.getPerformanceHubData(timeRange)
      
      // If we have real data, use it
      if (realData.portfolioValue > 0 || realData.holdings.length > 0) {
        // console.log('Using real database data for Performance Hub')
        // return realData
      }
    } catch (error) {
      // console.warn('Failed to fetch real performance data from database, falling back to mock:', error)
    }


    // Fallback to mock data if no real data available
    // console.log('Using mock data for Performance Hub')
    // const response = await this.fetchSuperCards({
      // cards: ['performance'],
      // timeRange,
      // includeComparisons: true,
      // includeMetadata: true,
      // fields: {
        // performance: [
          // 'portfolioValue',
          // 'spyComparison',
          // 'holdings',
          // 'timePeriodData',
          // 'sectorAllocation',
          // 'performanceMetrics'
        // ]
      }
    })

    return response.data.performance || this.getDefaultPerformanceData()
  }

  /**
   * Fetch Income Hub specific data
   */
  async fetchIncomeHub(): Promise<any> {
    // Try to get real database data first
    try {
      // console.log('Fetching income data from SQLite database...')
      // const realData = await superCardsDatabaseService.getIncomeHubData()
      
      // If we have real data, use it
      if (realData.monthlyIncome > 0) {
        // console.log('Using real database data for Income Hub')
        // return realData
      }
    } catch (error) {
      // console.warn('Failed to fetch real income data from database, falling back to legacy:', error)
    }


    // Fallback to mock data
    // console.log('Using mock data for Income Hub')
    // const response = await this.fetchSuperCards({
      // cards: ['income'],
      // includeProjections: true,
      // includeMetadata: true,
      // fields: {
        // income: [
          // 'monthlyIncome',
          // 'availableToReinvest',
          // 'incomeClarityData',
          // 'expenseMilestones',
          // 'taxBreakdown',
          // 'dividendSchedule'
        // ]
      }
    })

    return response.data.income || this.getDefaultIncomeData()
  }

  /**
   * Fetch Tax Hub specific data
   */
  async fetchTaxHub(): Promise<any> {
    // Try to get real database data first
    try {
      // console.log('Fetching tax data from SQLite database...')
      // const realData = await superCardsDatabaseService.getTaxHubData()
      
      // console.log('Using real database data for Tax Hub')
      // return realData
    } catch (error) {
      // console.warn('Failed to fetch real tax data from database, falling back to mock:', error)
    }

    // Fallback to mock data
    // console.log('Using mock data for Tax Hub')
    // const response = await this.fetchSuperCards({
      // cards: ['tax'],
      // includeComparisons: true,
      // fields: {
        // tax: [
          // 'currentTaxBill',
          // 'estimatedQuarterly',
          // 'taxOptimizationSavings',
          // 'taxDragAnalysis',
          // 'withholdingTaxes'
        // ]
      }
    })

    return response.data.tax || this.getDefaultTaxData()
  }

  /**
   * Fetch Portfolio Strategy Hub data
   */
  async fetchPortfolioHub(): Promise<any> {
    // Try to get real database data first
    try {
      // console.log('Fetching portfolio strategy data from SQLite database...')
      // const realData = await superCardsDatabaseService.getPortfolioHubData()
      
      // console.log('Using real database data for Portfolio Hub')
      // return realData
    } catch (error) {
      // console.warn('Failed to fetch real portfolio data from database, falling back to mock:', error)
    }

    // Fallback to mock data
    // console.log('Using mock data for Portfolio Hub')
    // const response = await this.fetchSuperCards({
      // cards: ['portfolio'],
      // includeComparisons: true,
      // fields: {
        // portfolio: [
          // 'portfolioHealth',
          // 'strategyComparison',
          // 'rebalancingData',
          // 'marginIntelligence'
        // ]
      }
    })

    return response.data.portfolio || this.getDefaultPortfolioData()
  }

  /**
   * Fetch Planning Hub data
   */
  async fetchPlanningHub(): Promise<any> {
    // Try to get real database data first
    try {
      // console.log('Fetching financial planning data from SQLite database...')
      // const realData = await superCardsDatabaseService.getPlanningHubData()
      
      // console.log('Using real database data for Planning Hub')
      // return realData
    } catch (error) {
      // console.warn('Failed to fetch real planning data from database, falling back to mock:', error)
    }

    // Fallback to mock data
    // console.log('Using mock data for Planning Hub')
    // const response = await this.fetchSuperCards({
      // cards: ['planning'],
      // includeProjections: true,
      // fields: {
        // planning: [
          // 'fireData',
          // 'expenseMilestones',
          // 'aboveZeroData',
          // 'customGoals'
        // ]
      }
    })

    return response.data.planning || this.getDefaultPlanningData()
  }

  /**
   * Get mock data for local development
   */
  private getMockData(request: SuperCardRequest): SuperCardResponse {
    const data: Partial<Record<SuperCard, any>> = {}
    
    request.cards.forEach(card => {
      switch (card) {
        case 'performance':
          data.performance = this.getDefaultPerformanceData()
          break
        case 'income':
          data.income = this.getDefaultIncomeData()
          break
        case 'tax':
          data.tax = this.getDefaultTaxData()
          break
        case 'portfolio':
          data.portfolio = this.getDefaultPortfolioData()
          break
        case 'planning':
          data.planning = this.getDefaultPlanningData()
          break
      }
    })

    return {
      data,
      metadata: {
        requestId: `mock_${Date.now()}`,
        timestamp: new Date().toISOString(),
        responseTime: 10,
        cached: false,
        ttl: 300,
        userId: 'demo_user',
        dataFreshness: request.cards.reduce((acc, card) => {
          acc[card] = new Date().toISOString()
          return acc
        }, {} as Record<SuperCard, string>)
      }
    }
  }

  /**
   * Default data providers for each hub
   */
  private getDefaultPerformanceData() {
    return {
      portfolioValue: 520000,
      spyOutperformance: 2.1,
      holdings: mockSuperCardsData.performance.holdings,
      spyComparison: {
        portfolioReturn: 8.2,
        spyReturn: 6.1,
        outperformance: 2.1
      },
      timePeriodData: {
        '1M': { portfolioReturn: 2.3, spyReturn: 1.8, outperformance: 0.5 },
        '3M': { portfolioReturn: 4.5, spyReturn: 3.2, outperformance: 1.3 },
        '6M': { portfolioReturn: 6.8, spyReturn: 5.1, outperformance: 1.7 },
        '1Y': { portfolioReturn: 8.2, spyReturn: 6.1, outperformance: 2.1 }
      }
    }
  }

  private getDefaultIncomeData() {
    return {
      monthlyIncome: 2080,
      availableToReinvest: 580,
      isAboveZero: true,
      incomeClarityData: {
        grossIncome: 2500,
        taxes: 420,
        netIncome: 2080,
        expenses: 1500,
        availableToReinvest: 580
      },
      expenseMilestones: mockSuperCardsData.income.expenseMilestones,
      totalExpenseCoverage: 138.67,
      monthlyDividendIncome: 2080,
      taxBreakdown: [
        { type: 'Federal', amount: 300, percentage: 12 },
        { type: 'State', amount: 120, percentage: 4.8 }
      ]
    }
  }

  private getDefaultTaxData() {
    return {
      currentTaxBill: 5040,
      estimatedQuarterly: 1260,
      taxOptimizationSavings: 1200,
      taxDragAnalysis: {
        totalDrag: 20,
        optimizedDrag: 15,
        savingsOpportunity: 5
      },
      withholdingTaxes: [
        { country: 'Ireland', amount: 120, recoverable: 60 },
        { country: 'UK', amount: 80, recoverable: 40 }
      ]
    }
  }

  private getDefaultPortfolioData() {
    return {
      portfolioHealth: {
        healthScore: 85,
        riskLevel: 'moderate' as const,
        diversificationScore: 78,
        rebalanceNeeded: false,
        totalValue: 520000
      },
      strategyComparison: [
        { strategy: 'Current', return: 8.2, risk: 12.5, sharpeRatio: 0.66 },
        { strategy: 'Balanced', return: 6.5, risk: 8.2, sharpeRatio: 0.79 },
        { strategy: 'Growth', return: 10.3, risk: 18.7, sharpeRatio: 0.55 }
      ],
      rebalancingData: [],
      marginIntelligence: {
        utilizationRate: 0,
        availableCredit: 100000,
        interestCost: 0,
        riskLevel: 'low' as const
      }
    }
  }

  private getDefaultPlanningData() {
    return {
      fireData: {
        fireProgress: 26,
        yearsToFire: 12,
        currentSavingsRate: 23,
        aboveZeroStreak: 18,
        monthlyInvestment: 580,
        netWorth: 520000
      },
      expenseMilestones: mockSuperCardsData.planning.expenseMilestones,
      aboveZeroData: {
        currentStreak: 18,
        longestStreak: 24,
        totalMonths: 36,
        successRate: 83.33
      },
      customGoals: []
    }
  }

  /**
   * Cache utilities
   */
  private getCacheKey(request: SuperCardRequest): string {
    return JSON.stringify({
      cards: request.cards.sort(),
      timeRange: request.timeRange,
      fields: request.fields
    })
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > this.cacheTTL
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
    
    // Limit cache size
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const superCardsAPI = new SuperCardsAPI()