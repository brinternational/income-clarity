'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useSuperCardStore, useGlobalActions } from '@/store/superCardStore'
import { logger } from '@/lib/logger'
// LocalModeUtils removed - we're in LITE PRODUCTION

interface SuperCardContextType {
  // This context is now lightweight - just coordination functions
  initializeCards: () => Promise<void>
  isInitialized: boolean
}

const SuperCardContext = createContext<SuperCardContextType | null>(null)

interface SuperCardProviderProps {
  children: ReactNode
}

export function SuperCardProvider({ children }: SuperCardProviderProps) {
  const { refreshAll } = useGlobalActions()
  const [isInitialized, setIsInitialized] = React.useState(false)

  const initializeCards = async () => {
    if (isInitialized) return
    
    try {
      // LITE PRODUCTION: Simple initialization without complex async operations
      // Initialize all Super Cards with data
      // logger.log('SuperCardProvider: Starting card initialization...')
      // await refreshAll()
      setIsInitialized(true)
      // logger.log('SuperCardProvider: Card initialization completed successfully')
    } catch (error) {
      // logger.error('SuperCardProvider: Failed to initialize Super Cards:', error)
      // Still mark as initialized to prevent infinite loading
      // Individual cards will handle their own error states
      setIsInitialized(true)
    }
  }

  useEffect(() => {
    // Auto-initialize on mount
    initializeCards()
  }, [])

  const contextValue: SuperCardContextType = {
    initializeCards,
    isInitialized
  }

  return (
    <SuperCardContext.Provider value={contextValue}>
      {children}
    </SuperCardContext.Provider>
  )
}

export function useSuperCardContext() {
  const context = useContext(SuperCardContext)
  if (!context) {
    throw new Error('useSuperCardContext must be used within a SuperCardProvider')
  }
  return context
}

// Migration helper - allows gradual migration from old contexts
export function useContextMigrationHelper() {
  const performanceHub = useSuperCardStore(state => state.performanceHub)
  const incomeHub = useSuperCardStore(state => state.incomeHub)
  
  // Return data in the format the old components expect
  return {
    // Portfolio context compatibility
    portfolio: {
      spyComparison: performanceHub.spyComparison,
      totalValue: performanceHub.portfolioValue,
      holdings: performanceHub.holdings
    },
    
    // UserProfile context compatibility  
    incomeClarityData: incomeHub.incomeClarityData,
    expenseMilestones: incomeHub.expenseMilestones,
    totalExpenseCoverage: incomeHub.totalExpenseCoverage,
    monthlyDividendIncome: incomeHub.monthlyDividendIncome,
    
    // Loading states
    loading: performanceHub.loading || incomeHub.loading,
    
    // Legacy support for existing components
    portfolioLoading: performanceHub.loading,
    expenseLoading: incomeHub.loading
  }
}