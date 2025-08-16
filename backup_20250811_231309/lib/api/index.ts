// Export all services for easy importing
export { authService, AuthService } from './auth.service'
export { portfoliosService, PortfoliosService } from './portfolios.service'
export { expensesService, ExpensesService } from './expenses.service'
export { profilesService, ProfilesService } from './profiles.service'

// Re-export types for convenience
export type {
  User,
  Portfolio,
  Holding,
  Transaction,
  Expense,
  Budget,
  FinancialGoal,
  UserInsert,
  PortfolioInsert,
  HoldingInsert,
  TransactionInsert,
  ExpenseInsert,
  BudgetInsert,
  FinancialGoalInsert,
  UserUpdate,
  PortfolioUpdate,
  HoldingUpdate,
  TransactionUpdate,
  ExpenseUpdate,
  BudgetUpdate,
  FinancialGoalUpdate,
  SubscriptionTier,
  RiskTolerance,
  PortfolioType,
  AssetType,
  TransactionType,
  RecurringFrequency,
  GoalType,
  PriorityLevel,
  PortfolioPerformance,
  UserFinancialSummary,
  PortfolioPerformanceMetrics,
  RebalanceRecommendation,
  ExpenseTrend
} from '../database.types'

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: any
}

// Common query options
export interface PaginationOptions {
  limit?: number
  offset?: number
}

export interface DateRangeOptions {
  startDate?: string
  endDate?: string
}

export interface ExpenseQueryOptions extends PaginationOptions, DateRangeOptions {
  category?: string
}

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error
  }

  // Handle Supabase errors
  if (error?.code && error?.message) {
    return new ApiError(error.message, error.code, error.status)
  }

  // Handle generic errors
  return new ApiError(error?.message || 'An unexpected error occurred')
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Format utilities
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

// Constants
export const SUBSCRIPTION_LIMITS = {
  free: {
    portfolios: 1,
    holdings: 10,
    transactions: 100,
    budgets: 3
  },
  premium: {
    portfolios: 5,
    holdings: 100,
    transactions: 1000,
    budgets: 10
  },
  enterprise: {
    portfolios: Infinity,
    holdings: Infinity,
    transactions: Infinity,
    budgets: Infinity
  }
} as const

export const RISK_TOLERANCE_DESCRIPTIONS = {
  conservative: 'Low risk, steady returns, capital preservation',
  moderate: 'Balanced risk and return, moderate growth',
  aggressive: 'High risk, high potential returns, growth focused'
} as const

export const ASSET_TYPE_COLORS = {
  stock: '#3B82F6',
  etf: '#10B981',
  bond: '#F59E0B',
  crypto: '#8B5CF6',
  commodity: '#EF4444',
  cash: '#6B7280'
} as const