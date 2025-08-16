import { createClientComponentClient } from '../supabase-client'
import type { 
  User, 
  UserInsert, 
  UserUpdate, 
  FinancialGoal,
  FinancialGoalInsert,
  FinancialGoalUpdate,
  UserFinancialSummary,
  RiskTolerance,
  SubscriptionTier,
  Json
} from '../database.types'

export interface UserProfile extends User {
  // Extended profile information
  calculatedData?: {
    portfolioCount: number
    totalNetWorth: number
    monthlyIncome: number
    monthlyExpenses: number
    savingsRate: number
    fireNumber: number
    yearsToFire: number
  }
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  currency: string
  dateFormat: string
  notifications: {
    email: boolean
    push: boolean
    rebalancing: boolean
    dividends: boolean
    expenses: boolean
    goals: boolean
  }
  privacy: {
    sharePortfolio: boolean
    sharePerformance: boolean
    analyticsOptIn: boolean
  }
  dashboard: {
    defaultView: 'overview' | 'detailed'
    hiddenSections: string[]
    refreshInterval: number
  }
}

export class ProfilesService {
  private static instance: ProfilesService
  private supabase: ReturnType<typeof createClientComponentClient>

  constructor() {
    this.supabase = createClientComponentClient()
  }

  static getInstance(): ProfilesService {
    if (!ProfilesService.instance) {
      ProfilesService.instance = new ProfilesService()
    }
    return ProfilesService.instance
  }

  // User Profile CRUD operations
  async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Get calculated portfolio data
      const calculatedData = await this.calculateUserMetrics(userId)

      return { 
        data: data ? { ...data, calculatedData } : null, 
        error: null 
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateUserProfile(userId: string, updates: UserUpdate): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      // Get updated calculated data
      const calculatedData = await this.calculateUserMetrics(userId)

      return { 
        data: data ? { ...data, calculatedData } : null, 
        error: null 
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  async createUserProfile(userData: UserInsert): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Provide default preferences if none exist
      const defaultPreferences: UserPreferences = {
        theme: 'system',
        currency: 'USD',
        dateFormat: 'MM/dd/yyyy',
        notifications: {
          email: true,
          push: true,
          rebalancing: true,
          dividends: true,
          expenses: true,
          goals: true
        },
        privacy: {
          sharePortfolio: false,
          sharePerformance: false,
          analyticsOptIn: true
        },
        dashboard: {
          defaultView: 'overview',
          hiddenSections: [],
          refreshInterval: 300 // 5 minutes
        }
      }

      const preferences = (data?.preferences as any) || defaultPreferences

      return { data: preferences, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<{ data: UserPreferences | null; error: any }> {
    try {
      // First get current preferences
      const { data: currentPrefs } = await this.getUserPreferences(userId)
      const updatedPreferences = { ...currentPrefs, ...preferences }

      const { data, error } = await this.supabase
        .from('users')
        .update({ 
          preferences: updatedPreferences as any,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select('preferences')
        .single()

      if (error) throw error

      return { data: data?.preferences as any, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Financial Goals Management
  async getUserFinancialGoals(userId: string): Promise<{ data: FinancialGoal[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async createFinancialGoal(goal: FinancialGoalInsert): Promise<{ data: FinancialGoal | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('financial_goals')
        .insert(goal)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateFinancialGoal(goalId: string, updates: FinancialGoalUpdate): Promise<{ data: FinancialGoal | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('financial_goals')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', goalId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteFinancialGoal(goalId: string): Promise<{ data: FinancialGoal | null; error: any }> {
    try {
      // Instead of soft delete, let's use hard delete for financial goals
      const { data, error } = await this.supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Subscription Management
  async updateSubscription(
    userId: string, 
    tier: SubscriptionTier, 
    expiresAt?: string
  ): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ 
          subscription_tier: tier,
          subscription_expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async checkSubscriptionStatus(userId: string): Promise<{ data: { isActive: boolean; tier: SubscriptionTier; expiresAt: string | null } | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .single()

      if (error) throw error

      const now = new Date()
      const expiresAt = data.subscription_expires_at ? new Date(data.subscription_expires_at) : null
      const isActive = !expiresAt || expiresAt > now

      return { 
        data: {
          isActive,
          tier: data.subscription_tier,
          expiresAt: data.subscription_expires_at
        }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Profile Analytics
  async getUserFinancialSummary(userId: string): Promise<{ data: UserFinancialSummary | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('user_financial_summary')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getUserActivityStats(userId: string, daysBack = 30): Promise<{ data: any | null; error: any }> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)

      // Get portfolio activities
      const { data: portfolioActivity } = await this.supabase
        .from('portfolios')
        .select('created_at, updated_at')
        .eq('user_id', userId)
        .gte('updated_at', startDate.toISOString())

      // Get transaction activities (skip for now as it requires join)
      const transactionActivity: any[] = []

      // Get expense activities  
      const { data: expenseActivity } = await this.supabase
        .from('expenses')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())

      const stats = {
        portfolioUpdates: portfolioActivity?.length || 0,
        transactionCount: transactionActivity?.length || 0,
        expenseCount: expenseActivity?.length || 0,
        totalActivity: (portfolioActivity?.length || 0) + (transactionActivity?.length || 0) + (expenseActivity?.length || 0),
        periodDays: daysBack
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Risk Assessment
  async updateRiskTolerance(userId: string, riskTolerance: RiskTolerance): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ 
          risk_tolerance: riskTolerance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getRiskAssessment(userId: string): Promise<{ data: any | null; error: any }> {
    try {
      // Get user's risk tolerance
      const { data: user } = await this.supabase
        .from('users')
        .select('risk_tolerance, date_of_birth')
        .eq('id', userId)
        .single()

      // Get portfolio composition for risk analysis
      const { data: portfolios } = await this.supabase
        .from('portfolios')
        .select(`
          *,
          holdings (
            asset_type,
            current_value,
            allocation_percentage
          )
        `)
        .eq('user_id', userId)

      if (!user || !portfolios) return { data: null, error: 'User or portfolio data not found' }

      // Calculate risk metrics
      const age = user.date_of_birth ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null
      const totalValue = portfolios.reduce((sum, p) => sum + p.total_value, 0)
      
      // Asset allocation analysis
      const assetAllocation = {
        stocks: 0,
        bonds: 0,
        cash: 0,
        crypto: 0,
        other: 0
      }

      portfolios.forEach(portfolio => {
        portfolio.holdings?.forEach((holding: any) => {
          const value = holding.current_value || 0
          switch (holding.asset_type) {
            case 'stock':
            case 'etf':
              assetAllocation.stocks += value
              break
            case 'bond':
              assetAllocation.bonds += value
              break
            case 'cash':
              assetAllocation.cash += value
              break
            case 'crypto':
              assetAllocation.crypto += value
              break
            default:
              assetAllocation.other += value
          }
        })
      })

      // Convert to percentages
      Object.keys(assetAllocation).forEach(key => {
        assetAllocation[key as keyof typeof assetAllocation] = 
          totalValue > 0 ? (assetAllocation[key as keyof typeof assetAllocation] / totalValue) * 100 : 0
      })

      // Risk score calculation (0-100)
      let riskScore = 0
      riskScore += assetAllocation.stocks * 0.8 // Stocks are high risk
      riskScore += assetAllocation.crypto * 1.0 // Crypto is highest risk
      riskScore += assetAllocation.bonds * 0.3 // Bonds are lower risk
      riskScore += assetAllocation.other * 0.5 // Other moderate risk

      const assessment = {
        currentRiskTolerance: user.risk_tolerance,
        suggestedRiskTolerance: riskScore > 70 ? 'aggressive' : riskScore > 40 ? 'moderate' : 'conservative',
        riskScore,
        age,
        assetAllocation,
        recommendations: this.generateRiskRecommendations(riskScore, age, user.risk_tolerance, assetAllocation)
      }

      return { data: assessment, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Real-time subscriptions
  subscribeToProfileChanges(userId: string, callback: (payload: any) => void) {
    const subscription = this.supabase
      .channel(`profile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }

  subscribeToGoalChanges(userId: string, callback: (payload: any) => void) {
    const subscription = this.supabase
      .channel(`goals-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_goals',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }

  // Private helper methods
  private async calculateUserMetrics(userId: string) {
    try {
      // Get portfolio count and total value
      const { data: portfolios } = await this.supabase
        .from('portfolios')
        .select('total_value')
        .eq('user_id', userId)

      // Get monthly income from dividends (simplified calculation)
      const { data: holdings } = await this.supabase
        .from('holdings')
        .select('current_value, dividend_yield')
        .in('portfolio_id', portfolios?.map((p: any) => p.id) || [])

      // Get monthly expenses
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
      const { data: expenses } = await this.supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', userId)
        .gte('expense_date', currentMonth)

      const portfolioCount = portfolios?.length || 0
      const totalNetWorth = portfolios?.reduce((sum, p) => sum + p.total_value, 0) || 0
      const monthlyExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
      
      // Estimate monthly dividend income
      const monthlyIncome = holdings?.reduce((sum, h) => {
        const annualDividend = (h.current_value * (h.dividend_yield || 0.04)) // Default 4% yield
        return sum + (annualDividend / 12)
      }, 0) || 0

      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0
      const fireNumber = monthlyExpenses * 12 * 25 // 4% rule
      const yearsToFire = fireNumber > totalNetWorth ? (fireNumber - totalNetWorth) / ((monthlyIncome - monthlyExpenses) * 12) : 0

      return {
        portfolioCount,
        totalNetWorth,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        fireNumber,
        yearsToFire: Math.max(0, yearsToFire)
      }
    } catch (error) {
      // console.error('Error calculating user metrics:', error)
      // Return default metrics on error
      return {
        portfolioCount: 0,
        totalNetWorth: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        fireNumber: 0,
        yearsToFire: 0
      }
    }
  }
}

export const profilesService = ProfilesService.getInstance()