// Hybrid Storage Service - Seamlessly switches between localStorage and Supabase
// Provides unified API that works offline (localStorage) and online (Supabase)

import { LocalStorageService } from './local-storage'
import { portfoliosService, expensesService, profilesService } from '@/lib/api'
import type { Portfolio, Expense, Profile } from '@/types'

export interface StorageMode {
  primary: 'localStorage' | 'supabase'
  fallback: 'localStorage' | 'supabase'
  autoSync: boolean
}

export interface StorageStatus {
  mode: StorageMode
  online: boolean
  authenticated: boolean
  lastSync: Date | null
  syncInProgress: boolean
}

export class HybridStorageService {
  private static storageMode: StorageMode = {
    primary: 'localStorage',
    fallback: 'localStorage', 
    autoSync: false
  }
  
  private static userId: string = 'mock-user-1' // TODO: Replace with real auth
  private static lastSync: Date | null = null
  private static syncInProgress: boolean = false
  private static syncQueue: Array<{ type: string; data: any; operation: string }> = []

  /**
   * Configure storage mode
   */
  static configure(mode: StorageMode, userId?: string) {
    this.storageMode = mode
    if (userId) {
      this.userId = userId
    }
  }

  /**
   * Get current storage status
   */
  static getStatus(): StorageStatus {
    return {
      mode: this.storageMode,
      online: navigator?.onLine || true,
      authenticated: !!this.userId,
      lastSync: this.lastSync,
      syncInProgress: this.syncInProgress
    }
  }

  /**
   * Switch to cloud mode (authenticated users)
   */
  static enableCloudMode(userId: string) {
    this.userId = userId
    this.storageMode = {
      primary: 'supabase',
      fallback: 'localStorage',
      autoSync: true
    }
  }

  /**
   * Switch to offline mode (demo/unauthenticated users)
   */
  static enableOfflineMode() {
    this.storageMode = {
      primary: 'localStorage',
      fallback: 'localStorage',
      autoSync: false
    }
  }

  // PORTFOLIO OPERATIONS

  /**
   * Get all portfolios
   */
  static async getPortfolios(): Promise<Portfolio[]> {
    if (this.storageMode.primary === 'supabase' && this.userId) {
      try {
        const { data, error } = await portfoliosService.getPortfolios(this.userId)
        if (error) throw new Error(String(error))
        
        // Convert Supabase format to app format and sync to localStorage
        const appPortfolios: Portfolio[] = (data || []).map(p => ({
          id: p.id,
          userId: p.user_id,
          name: p.name,
          totalValue: p.total_value,
          monthlyGrossIncome: 0, // TODO: Calculate from holdings
          monthlyNetIncome: 0, // TODO: Calculate from holdings
          monthlyAvailable: 0, // TODO: Calculate from holdings
          marginUsed: 0,
          marginCost: 0,
          spyComparison: {
            portfolioReturn: 0, // TODO: Calculate
            spyReturn: 0.082, // Default SPY return
            outperformance: 0
          },
          holdings: (p.holdings || []).map((h: any) => ({
            id: h.id,
            portfolio_id: h.portfolio_id,
            ticker: h.symbol,
            shares: h.quantity,
            avgCost: h.average_cost,
            currentPrice: h.current_price,
            currentValue: h.current_value,
            monthlyIncome: 0,
            ytdPerformance: 0,
            created_at: h.created_at || new Date().toISOString(),
            updated_at: h.updated_at || new Date().toISOString()
          })),
          created_at: p.created_at,
          updated_at: p.updated_at
        }))
        
        if (this.storageMode.autoSync) {
          LocalStorageService.setPortfolios(appPortfolios)
        }
        
        return appPortfolios
      } catch (error) {
        // console.warn('Supabase portfolio fetch failed, falling back to localStorage:', error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 }) expenses: number; profile: boolean }
    downloaded: { portfolios: number; expenses: number; profile: boolean }
    errors: string[] 
  }> {
    const result = {
      uploaded: { portfolios: 0, expenses: 0, profile: false },
      downloaded: { portfolios: 0, expenses: 0, profile: false },
      errors: [] as string[]
    }

    if (!this.userId || this.storageMode.primary !== 'supabase') {
      result.errors.push('Sync requires authenticated Supabase mode')
      return result
    }

    this.syncInProgress = true

    try {
      // First, download from Supabase to ensure we have latest
      const [supabasePortfolios, supabaseExpenses, supabaseProfile] = await Promise.all([
        this.getPortfolios(),
        this.getExpenses(), 
        this.getProfile()
      ])

      result.downloaded.portfolios = supabasePortfolios.length
      result.downloaded.expenses = supabaseExpenses.length
      result.downloaded.profile = supabaseProfile !== null

      // Then process any queued local changes
      const queueResult = await this.processQueue()
      
      this.lastSync = new Date()
      
    } catch (error: any) {
      result.errors.push(`Full sync failed: ${error.message}`)
    }

    this.syncInProgress = false
    return result
  }

  /**
   * Clear all data (both localStorage and queued operations)
   */
  static clearAll() {
    LocalStorageService.clearAll()
    this.syncQueue = []
    this.lastSync = null
  }

  /**
   * Export all data for backup
   */
  static exportData(): string {
    return LocalStorageService.exportData()
  }

  /**
   * Import data from backup
   */
  static importData(jsonData: string): boolean {
    return LocalStorageService.importData(jsonData)
  }
}