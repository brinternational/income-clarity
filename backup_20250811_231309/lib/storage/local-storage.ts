// Local Storage Service for Income Clarity
// Provides data persistence using browser localStorage with type safety

import type { Portfolio, Expense, Profile } from '@/types'

const STORAGE_KEYS = {
  PROFILE: 'income_clarity_profile',
  PORTFOLIOS: 'income_clarity_portfolios',
  EXPENSES: 'income_clarity_expenses',
  PREFERENCES: 'income_clarity_preferences',
} as const

export class LocalStorageService {
  private static isClient = typeof window !== 'undefined'

  // Helper to safely parse JSON
  private static safeJsonParse<T>(value: string | null, fallback: T): T {
    if (!value) return fallback
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }

  // Profile methods
  static getProfile(): Profile | null {
    if (!this.isClient) return null
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE)
    return this.safeJsonParse(data, null)
  }

  static setProfile(profile: Profile): void {
    if (!this.isClient) return
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
  }

  static clearProfile(): void {
    if (!this.isClient) return
    localStorage.removeItem(STORAGE_KEYS.PROFILE)
  }

  // Portfolio methods
  static getPortfolios(): Portfolio[] {
    if (!this.isClient) return []
    const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS)
    return this.safeJsonParse(data, [])
  }

  static setPortfolios(portfolios: Portfolio[]): void {
    if (!this.isClient) return
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios))
  }

  static addPortfolio(portfolio: Portfolio): void {
    const portfolios = this.getPortfolios()
    portfolios.push(portfolio)
    this.setPortfolios(portfolios)
  }

  static updatePortfolio(id: string, updates: Partial<Portfolio>): void {
    const portfolios = this.getPortfolios()
    const index = portfolios.findIndex(p => p.id === id)
    if (index !== -1) {
      portfolios[index] = { ...portfolios[index], ...updates }
      this.setPortfolios(portfolios)
    }
  }

  static deletePortfolio(id: string): void {
    const portfolios = this.getPortfolios()
    const filtered = portfolios.filter(p => p.id !== id)
    this.setPortfolios(filtered)
  }

  // Expense methods
  static getExpenses(): Expense[] {
    if (!this.isClient) return []
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES)
    return this.safeJsonParse(data, [])
  }

  static setExpenses(expenses: Expense[]): void {
    if (!this.isClient) return
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
  }

  static addExpense(expense: Expense): void {
    const expenses = this.getExpenses()
    expenses.push(expense)
    this.setExpenses(expenses)
  }

  static updateExpense(id: string, updates: Partial<Expense>): void {
    const expenses = this.getExpenses()
    const index = expenses.findIndex(e => e.id === id)
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updates }
      this.setExpenses(expenses)
    }
  }

  static deleteExpense(id: string): void {
    const expenses = this.getExpenses()
    const filtered = expenses.filter(e => e.id !== id)
    this.setExpenses(filtered)
  }

  // Preferences methods
  static getPreferences(): Record<string, any> {
    if (!this.isClient) return {}
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    return this.safeJsonParse(data, {})
  }

  static setPreferences(preferences: Record<string, any>): void {
    if (!this.isClient) return
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences))
  }

  static updatePreference(key: string, value: any): void {
    const preferences = this.getPreferences()
    preferences[key] = value
    this.setPreferences(preferences)
  }

  // Clear all data
  static clearAll(): void {
    if (!this.isClient) return
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // Export/Import functionality
  static exportData(): string {
    const data = {
      profile: this.getProfile(),
      portfolios: this.getPortfolios(),
      expenses: this.getExpenses(),
      preferences: this.getPreferences(),
      exportDate: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      if (data.profile) this.setProfile(data.profile)
      if (data.portfolios) this.setPortfolios(data.portfolios)
      if (data.expenses) this.setExpenses(data.expenses)
      if (data.preferences) this.setPreferences(data.preferences)
      return true
    } catch {
      return false
    }
  }

  // Check if data exists
  static hasData(): boolean {
    if (!this.isClient) return false
    return !!(
      localStorage.getItem(STORAGE_KEYS.PROFILE) ||
      localStorage.getItem(STORAGE_KEYS.PORTFOLIOS) ||
      localStorage.getItem(STORAGE_KEYS.EXPENSES)
    )
  }
}