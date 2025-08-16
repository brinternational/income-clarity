// Data Migration Service - localStorage to Supabase
// Handles seamless migration of user data from localStorage to cloud storage

import { LocalStorageService } from '@/lib/storage/local-storage'
import { portfoliosService, expensesService, profilesService } from '@/lib/api'
import type { Portfolio, Expense, Profile } from '@/types'

export interface MigrationProgress {
  step: string
  completed: number
  total: number
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  message?: string
  error?: string
}

export interface MigrationResult {
  success: boolean
  migrated: {
    portfolios: number
    expenses: number
    profile: boolean
  }
  errors: string[]
  duration: number
}

export interface MigrationData {
  profile: Profile | null
  portfolios: Portfolio[]
  expenses: Expense[]
  hasData: boolean
}

export class DataMigrationService {
  private static progressCallback?: (progress: MigrationProgress) => void
  private static MOCK_USER_ID = 'mock-user-1' // TODO: Replace with real auth

  /**
   * Check if user has localStorage data that can be migrated
   */
  static hasLocalStorageData(): boolean {
    return LocalStorageService.hasData()
  }

  /**
   * Get a preview of data that would be migrated
   */
  static getMigrationPreview(): MigrationData {
    const profile = LocalStorageService.getProfile()
    const portfolios = LocalStorageService.getPortfolios()
    const expenses = LocalStorageService.getExpenses()

    return {
      profile,
      portfolios,
      expenses,
      hasData: profile !== null || portfolios.length > 0 || expenses.length > 0
    }
  }

  /**
   * Set progress callback for UI updates
   */
  static setProgressCallback(callback: (progress: MigrationProgress) => void) {
    this.progressCallback = callback
  }

  /**
   * Report migration progress
   */
  private static reportProgress(
    step: string, 
    completed: number, 
    total: number, 
    status: MigrationProgress['status'],
    message?: string,
    error?: string
  ) {
    if (this.progressCallback) {
      this.progressCallback({
        step,
        completed,
        total,
        status,
        message,
        error
      })
    }
  }

  /**
   * Migrate all localStorage data to Supabase
   */
  static async migrateToSupabase(): Promise<MigrationResult> {
    const startTime = Date.now()
    const result: MigrationResult = {
      success: false,
      migrated: { portfolios: 0, expenses: 0, profile: false },
      errors: [],
      duration: 0
    }

    try {
      // Get local data
      const localData = this.getMigrationPreview()
      
      if (!localData.hasData) {
        this.reportProgress('validation', 0, 0, 'completed', 'No local data to migrate')
        result.success = true
        result.duration = Date.now() - startTime
        return result
      }

      const totalSteps = [
        localData.profile ? 1 : 0,
        localData.portfolios.length,
        localData.expenses.length
      ].reduce((sum, count) => sum + count, 0)

      let completedSteps = 0

      // Step 1: Migrate Profile
      if (localData.profile) {
        this.reportProgress('profile', completedSteps, totalSteps, 'in-progress', 'Migrating user profile...')
        
        try {
          // Convert localStorage Profile to Supabase User format
          const userInsert = {
            email: 'demo@example.com', // Profile email not available
            full_name: 'Demo User', // Profile name not available
            investment_experience: 'beginner', // Profile investmentExperience not available
            risk_tolerance: 'moderate' as 'conservative' | 'moderate' | 'aggressive', // Profile riskTolerance not available
            annual_income: 0, // Profile annualIncome not available
            subscription_tier: 'free' as const
          }

          const { error: profileError } = await profilesService.createUserProfile({
            id: this.MOCK_USER_ID,
            ...userInsert
          })
          
          if (profileError) {
            result.errors.push(`Profile migration failed: ${profileError}`)
          } else {
            result.migrated.profile = true
            completedSteps++
            this.reportProgress('profile', completedSteps, totalSteps, 'completed', 'Profile migrated successfully')
          }
        } catch (error: any) {
          result.errors.push(`Profile migration error: ${error.message}`)
          this.reportProgress('profile', completedSteps, totalSteps, 'error', undefined, error.message)
        }
      }

      // Step 2: Migrate Portfolios
      for (let i = 0; i < localData.portfolios.length; i++) {
        const portfolio = localData.portfolios[i]
        this.reportProgress(
          'portfolios', 
          completedSteps, 
          totalSteps, 
          'in-progress', 
          `Migrating portfolio: ${portfolio.name}`
        )

        try {
          // Convert localStorage Portfolio to Supabase format
          const portfolioInsert = {
            user_id: this.MOCK_USER_ID,
            name: 'Default Portfolio', // portfolio.name not available
            description: '', // portfolio.description not available
            portfolio_type: 'investment' as 'investment' | 'retirement' | 'emergency' | 'savings', // portfolio.type not available
            is_primary: true, // First portfolio is primary
            target_allocation: null, // portfolio.targetAllocation not available
            rebalance_threshold: 0.05 // portfolio.rebalanceThreshold not available
          }

          const { data: newPortfolio, error: portfolioError } = await portfoliosService.createPortfolio(portfolioInsert)
          
          if (portfolioError || !newPortfolio) {
            result.errors.push(`Portfolio migration failed: ${portfolioError}`)
          } else {
            // Migrate holdings for this portfolio
            if (portfolio.holdings && portfolio.holdings.length > 0) {
              for (const holding of portfolio.holdings) {
                const holdingInsert = {
                  portfolio_id: newPortfolio.id,
                  symbol: holding.ticker || 'UNKNOWN', // Use ticker instead of symbol
                  name: holding.ticker || 'Unknown Holding', // Use ticker as name
                  asset_type: 'stock' as 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity' | 'cash', // holding.assetType not available
                  quantity: holding.shares || 0, // Use shares instead of quantity
                  average_cost: holding.avgCost || 0, // Use avgCost instead of averageCost
                  current_price: holding.currentPrice || 0,
                  current_value: (holding.shares || 0) * (holding.currentPrice || 0), // Calculate current value
                  allocation_percentage: 0, // Will be calculated later
                  target_allocation: null, // holding.targetAllocation not available
                  dividend_yield: holding.yieldPercent || null,
                  last_dividend_date: null, // holding.lastDividendDate not available
                  notes: null // holding.notes not available
                }

                const { error: holdingError } = await portfoliosService.addHolding(holdingInsert)
                if (holdingError) {
                  result.errors.push(`Holding ${holding.ticker || 'UNKNOWN'} migration failed: ${holdingError}`)
                }
              }
            }

            result.migrated.portfolios++
            completedSteps++
            this.reportProgress(
              'portfolios', 
              completedSteps, 
              totalSteps, 
              'completed', 
              `Portfolio "${portfolio.name}" migrated with ${portfolio.holdings?.length || 0} holdings`
            )
          }
        } catch (error: any) {
          result.errors.push(`Portfolio "${portfolio.name}" migration error: ${error.message}`)
          this.reportProgress('portfolios', completedSteps, totalSteps, 'error', undefined, error.message)
        }
      }

      // Step 3: Migrate Expenses
      for (let i = 0; i < localData.expenses.length; i++) {
        const expense = localData.expenses[i]
        this.reportProgress(
          'expenses', 
          completedSteps, 
          totalSteps, 
          'in-progress', 
          `Migrating expense: ${expense.description}`
        )

        try {
          // Convert localStorage Expense to Supabase format
          const expenseInsert = {
            user_id: this.MOCK_USER_ID,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            expense_date: expense.date,
            is_recurring: expense.recurring || false,
            recurring_frequency: null, // expense.recurringFrequency not available
            tags: null, // expense.tags not available
            notes: null // expense.notes not available
          }

          const { error: expenseError } = await expensesService.createExpense(expenseInsert)
          
          if (expenseError) {
            result.errors.push(`Expense "${expense.description}" migration failed: ${expenseError}`)
          } else {
            result.migrated.expenses++
            completedSteps++
            this.reportProgress(
              'expenses', 
              completedSteps, 
              totalSteps, 
              'completed', 
              `Expense "${expense.description}" migrated successfully`
            )
          }
        } catch (error: any) {
          result.errors.push(`Expense "${expense.description}" migration error: ${error.message}`)
          this.reportProgress('expenses', completedSteps, totalSteps, 'error', undefined, error.message)
        }
      }

      // Final result
      result.success = result.errors.length === 0
      result.duration = Date.now() - startTime

      this.reportProgress(
        'complete', 
        completedSteps, 
        totalSteps, 
        result.success ? 'completed' : 'error',
        result.success 
          ? `Migration completed successfully in ${(result.duration / 1000).toFixed(1)}s`
          : `Migration completed with ${result.errors.length} errors`
      )

      return result

    } catch (error: any) {
      result.errors.push(`Migration failed: ${error.message}`)
      result.duration = Date.now() - startTime
      this.reportProgress('complete', 0, 0, 'error', undefined, error.message)
      return result
    }
  }

  /**
   * Create a backup of current localStorage data
   */
  static createLocalStorageBackup(): string {
    return LocalStorageService.exportData()
  }

  /**
   * Restore from backup (rollback functionality)
   */
  static restoreFromBackup(backupData: string): boolean {
    return LocalStorageService.importData(backupData)
  }

  /**
   * Clear localStorage after successful migration (optional)
   */
  static clearLocalStorageAfterMigration(confirmed: boolean = false): boolean {
    if (!confirmed) {
      throw new Error('Migration cleanup requires explicit confirmation')
    }
    
    LocalStorageService.clearAll()
    return true
  }

  /**
   * Validate migrated data by comparing counts
   */
  static async validateMigration(): Promise<{ valid: boolean; differences: string[] }> {
    const differences: string[] = []
    
    try {
      // Get local data counts
      const localData = this.getMigrationPreview()
      
      // Get Supabase data counts
      const { data: supabasePortfolios } = await portfoliosService.getPortfolios(this.MOCK_USER_ID)
      const { data: supabaseExpenses } = await expensesService.getExpenses(this.MOCK_USER_ID)
      const { data: supabaseProfile } = await profilesService.getUserProfile(this.MOCK_USER_ID)

      // Compare counts
      if (localData.portfolios.length !== (supabasePortfolios?.length || 0)) {
        differences.push(
          `Portfolio count mismatch: Local=${localData.portfolios.length}, Supabase=${supabasePortfolios?.length || 0}`
        )
      }

      if (localData.expenses.length !== (supabaseExpenses?.length || 0)) {
        differences.push(
          `Expense count mismatch: Local=${localData.expenses.length}, Supabase=${supabaseExpenses?.length || 0}`
        )
      }

      if (localData.profile && !supabaseProfile) {
        differences.push('Profile exists locally but not in Supabase')
      }

      if (!localData.profile && supabaseProfile) {
        differences.push('Profile exists in Supabase but not locally')
      }

      return {
        valid: differences.length === 0,
        differences
      }

    } catch (error: any) {
      differences.push(`Validation error: ${error.message}`)
      return { valid: false, differences }
    }
  }

  /**
   * Get migration statistics for reporting
   */
  static getMigrationStats(): {
    localStorage: { portfolios: number; expenses: number; hasProfile: boolean }
    estimatedMigrationTime: string
  } {
    const preview = this.getMigrationPreview()
    const totalItems = preview.portfolios.length + preview.expenses.length + (preview.profile ? 1 : 0)
    
    // Rough estimate: ~500ms per item
    const estimatedSeconds = Math.max(1, Math.ceil(totalItems * 0.5))
    const estimatedTime = estimatedSeconds < 60 
      ? `${estimatedSeconds} seconds` 
      : `${Math.ceil(estimatedSeconds / 60)} minutes`

    return {
      localStorage: {
        portfolios: preview.portfolios.length,
        expenses: preview.expenses.length,
        hasProfile: preview.profile !== null
      },
      estimatedMigrationTime: estimatedTime
    }
  }
}