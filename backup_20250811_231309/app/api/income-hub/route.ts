/**
 * Income Hub API - Consolidated endpoint
 * Consolidates: Income clarity, progression, stability, calendar, tax breakdown
 * Target response time: < 300ms
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

// Income Hub response interface
interface IncomeHubData {
  monthlyIncome: number
  annualIncome: number
  taxOwed: number
  netIncome: number
  availableToReinvest: number
  isAboveZero: boolean
  incomeClarityData: {
    grossMonthly: number
    federalTax: number
    stateTax: number
    netMonthly: number
    monthlyExpenses: number
    availableToReinvest: number
    aboveZeroLine: boolean
  }
  taxBreakdown: Array<{
    type: string
    amount: number
    percentage: number
    description: string
  }>
  incomeProgression: Array<{
    month: string
    grossIncome: number
    netIncome: number
    expenses: number
    surplus: number
  }>
  dividendCalendar: Array<{
    symbol: string
    exDate: string
    payDate: string
    amount: number
    estimatedAmount: number
  }>
  incomeStability: {
    consistencyScore: number
    volatilityIndex: number
    growthRate: number
    predictability: 'high' | 'medium' | 'low'
  }
  milestones: Array<{
    id: string
    category: string
    monthlyAmount: number
    coveredByDividends: boolean
    progress: number
    description: string
  }>
  lastUpdated: string
}

// Income data service
class IncomeHubService {
  constructor(private supabase: any, private userId: string, private userProfile: any) {}

  async getData(timeRange: string, fields?: string[]): Promise<IncomeHubData> {
    try {
      // Get user's current location for tax calculations
      const location = this.userProfile?.location || 'US-CA' // Default to California

      // Fetch dividend income data
      const incomeData = await this.getDividendIncomeData()
      
      // Fetch user expenses
      const expenseData = await this.getExpenseData()
      
      // Calculate tax breakdown
      const taxBreakdown = this.calculateTaxBreakdown(incomeData.annualIncome, location)
      
      // Calculate net income after taxes
      const totalTaxOwed = taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0)
      const netAnnualIncome = incomeData.annualIncome - totalTaxOwed
      const netMonthlyIncome = netAnnualIncome / 12
      
      // Calculate available to reinvest
      const availableToReinvest = netMonthlyIncome - expenseData.monthlyExpenses
      const isAboveZero = availableToReinvest > 0

      // Get income progression data
      const incomeProgression = await this.getIncomeProgression()
      
      // Get dividend calendar
      const dividendCalendar = await this.getDividendCalendar()
      
      // Calculate income stability metrics
      const incomeStability = this.calculateIncomeStability(incomeProgression)
      
      // Get milestones
      const milestones = await this.getIncomeMilestones(netMonthlyIncome)

      // Build income clarity data
      const incomeClarityData = {
        grossMonthly: incomeData.monthlyIncome,
        federalTax: taxBreakdown.find(t => t.type === 'Federal')?.amount || 0,
        stateTax: taxBreakdown.find(t => t.type === 'State')?.amount || 0,
        netMonthly: netMonthlyIncome,
        monthlyExpenses: expenseData.monthlyExpenses,
        availableToReinvest,
        aboveZeroLine: isAboveZero
      }

      return {
        monthlyIncome: incomeData.monthlyIncome,
        annualIncome: incomeData.annualIncome,
        taxOwed: totalTaxOwed,
        netIncome: netAnnualIncome,
        availableToReinvest,
        isAboveZero,
        incomeClarityData,
        taxBreakdown,
        incomeProgression,
        dividendCalendar,
        incomeStability,
        milestones,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      // Error handled by emergency recovery script
  }

  private async getDividendIncomeData(): Promise<{
    monthlyIncome: number
    annualIncome: number
  }> {
    try {
      // Get user's portfolios and calculate estimated dividend income
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
        return { monthlyIncome: 0, annualIncome: 0 }
      }

      let totalAnnualDividends = 0

      for (const portfolio of portfolios) {
        for (const holding of portfolio.portfolio_holdings) {
          // Estimate annual dividends (mock implementation)
          const estimatedDividendPerShare = this.getEstimatedDividend(holding.symbol)
          totalAnnualDividends += holding.shares * estimatedDividendPerShare
        }
      }

      return {
        monthlyIncome: totalAnnualDividends / 12,
        annualIncome: totalAnnualDividends
      }
    } catch (error) {
      console.error('Error getting dividend income data:', error)
      return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )})
    }
    
    return months
  }

  private async getDividendCalendar(): Promise<IncomeHubData['dividendCalendar']> {
    // Mock implementation - in production, get actual dividend calendar data
    const calendar = [
      {
        symbol: 'AAPL',
        exDate: '2024-02-09',
        payDate: '2024-02-16',
        amount: 0.24,
        estimatedAmount: 24.00 // Based on shares owned
      },
      {
        symbol: 'MSFT',
        exDate: '2024-02-15',
        payDate: '2024-03-14',
        amount: 0.75,
        estimatedAmount: 37.50
      }
    ]

    return calendar
  }

  private calculateIncomeStability(progression: IncomeHubData['incomeProgression']): IncomeHubData['incomeStability'] {
    if (progression.length === 0) {
      return {
        consistencyScore: 0,
        volatilityIndex: 0,
        growthRate: 0,
        predictability: 'low'
      }
    }

    const incomes = progression.map(p => p.grossIncome)
    const average = incomes.reduce((sum, income) => sum + income, 0) / incomes.length
    
    // Calculate volatility (standard deviation)
    const variance = incomes.reduce((sum, income) => sum + Math.pow(income - average, 2), 0) / incomes.length
    const volatilityIndex = Math.sqrt(variance) / average * 100

    // Calculate growth rate (first month vs last month)
    const growthRate = incomes.length > 1 ? 
      ((incomes[incomes.length - 1] - incomes[0]) / incomes[0]) * 100 : 0

    // Calculate consistency score (inverse of volatility)
    const consistencyScore = Math.max(0, 100 - volatilityIndex)

    // Determine predictability
    let predictability: 'high' | 'medium' | 'low'
    if (volatilityIndex < 10) predictability = 'high'
    else if (volatilityIndex < 20) predictability = 'medium'
    else predictability = 'low'

    return {
      consistencyScore,
      volatilityIndex,
      growthRate,
      predictability
    }
  }

  private async getIncomeMilestones(netMonthlyIncome: number): Promise<IncomeHubData['milestones']> {
    try {
      const { data: expenseCategories, error } = await this.supabase
        .from('expense_categories')
        .select('id, name, monthly_amount')
        .eq('user_id', this.userId)
        .order('monthly_amount', { ascending: true })

      if (error || !expenseCategories) {
        return this.getDefaultMilestones()
      }

      const milestones = expenseCategories.map((category: any) => ({
        id: category.id,
        category: category.name,
        monthlyAmount: category.monthly_amount,
        coveredByDividends: netMonthlyIncome >= category.monthly_amount,
        progress: Math.min(100, (netMonthlyIncome / category.monthly_amount) * 100),
        description: `Monthly ${category.name.toLowerCase()} expenses`
      }))

      return milestones
    } catch (error) {
      console.error('Error getting income milestones:', error)
      return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )