'use client'

import React, { useMemo, useState } from 'react'
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { TrendingUp, TrendingDown, BarChart3, Target, DollarSign, AlertTriangle, CheckCircle, Info, Scale } from 'lucide-react'
import { logger } from '@/lib/logger'

// Target allocation configuration (customizable)
interface TargetAllocation {
  stocks: number    // 0.60 = 60%
  reits: number     // 0.30 = 30% 
  bonds: number     // 0.10 = 10%
}

interface AllocationData {
  current: TargetAllocation
  target: TargetAllocation
  drift: TargetAllocation
}

interface RebalanceAction {
  id: string
  type: 'buy' | 'sell'
  ticker: string
  amount: number
  reason: string
  category: 'stocks' | 'reits' | 'bonds'
  taxImplication: 'none' | 'short_term' | 'long_term'
  priority: 'high' | 'medium' | 'low'
}

interface RebalanceMetrics {
  efficiencyScore: number  // 0-100
  totalCost: number       // Transaction costs
  netBenefit: number      // Expected benefit - costs
  timeToOptimal: string   // "2-3 months" estimation
}

const DEFAULT_TARGET: TargetAllocation = {
  stocks: 0.60,  // 60% stocks (dividend growth, broad market)
  reits: 0.30,   // 30% REITs (real estate income)
  bonds: 0.10    // 10% bonds (stability, defensive)
}

// Map sectors to allocation categories
const mapSectorToCategory = (sector: string): keyof TargetAllocation => {
  const lowerSector = sector.toLowerCase()
  
  if (lowerSector.includes('real estate') || lowerSector.includes('reit')) {
    return 'reits'
  } else if (lowerSector.includes('bond') || lowerSector.includes('treasury') || lowerSector.includes('fixed income')) {
    return 'bonds'
  } else {
    // Default to stocks for most ETFs (tech, financial, dividend, diversified, etc.)
    return 'stocks'
  }
}

// Estimate holding period for tax implications (simplified - would come from actual purchase dates)
const getHoldingPeriod = (holding: any): 'short_term' | 'long_term' => {
  // For demo purposes, assume most holdings are long-term
  // In real implementation, calculate from purchase date
  const ticker = holding.ticker.toUpperCase()
  
  // Simulate some short-term holdings for demo
  if (ticker.includes('NEW') || ticker.includes('RECENT')) {
    return 'short_term'
  }
  
  return 'long_term'
}

export function RebalancingSuggestions() {
  const { holdings, totalValue } = usePortfolio()
  const { incomeClarityData } = useUserProfile()
  const [targetAllocation, setTargetAllocation] = useState<TargetAllocation>(DEFAULT_TARGET)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Safely get holdings and totalValue with defensive programming
  const safeHoldings = Array.isArray(holdings) ? holdings : []
  const safeTotalValue = typeof totalValue === 'number' && !isNaN(totalValue) ? totalValue : 0
  const safeIncomeClarityData = incomeClarityData || {}

  // Calculate current allocation from holdings
  const allocationData: AllocationData = useMemo(() => {
    if (!safeHoldings || safeHoldings.length === 0 || safeTotalValue === 0) {
      return {
        current: { stocks: 0, reits: 0, bonds: 0 },
        target: targetAllocation,
        drift: { stocks: 0, reits: 0, bonds: 0 }
      }
    }

    // Group holdings by category with safe property access
    const categoryTotals = { stocks: 0, reits: 0, bonds: 0 }
    
    safeHoldings.forEach(holding => {
      if (!holding || typeof holding !== 'object') return
      
      const value = holding.currentValue || holding.value || 0
      const category = mapSectorToCategory(holding.sector || holding.category || 'diversified')
      
      if (typeof value === 'number' && !isNaN(value)) {
        categoryTotals[category] += value
      }
    })

    // Calculate current percentages with safe division
    const current: TargetAllocation = {
      stocks: safeTotalValue > 0 ? categoryTotals.stocks / safeTotalValue : 0,
      reits: safeTotalValue > 0 ? categoryTotals.reits / safeTotalValue : 0, 
      bonds: safeTotalValue > 0 ? categoryTotals.bonds / safeTotalValue : 0
    }

    // Calculate drift from target
    const drift: TargetAllocation = {
      stocks: current.stocks - targetAllocation.stocks,
      reits: current.reits - targetAllocation.reits,
      bonds: current.bonds - targetAllocation.bonds
    }

    return { current, target: targetAllocation, drift }
  }, [safeHoldings, safeTotalValue, targetAllocation])

  // Generate specific rebalancing actions with safe data access
  const rebalanceActions: RebalanceAction[] = useMemo(() => {
    if (safeTotalValue === 0 || !allocationData) return []

    const actions: RebalanceAction[] = []
    const categories = ['stocks', 'reits', 'bonds'] as const

    try {
      categories.forEach(category => {
        const drift = allocationData.drift?.[category] || 0
        const driftAmount = drift * safeTotalValue
        const absDrift = Math.abs(driftAmount)
        
        // Only suggest action if drift is significant (>$200 or >2%)
        if (absDrift > 200 && Math.abs(drift) > 0.02) {
          
          if (driftAmount > 0) {
            // Overweight - suggest selling
            const holding = safeHoldings.find(h => {
              if (!h || typeof h !== 'object') return false
              return mapSectorToCategory(h.sector || h.category || 'diversified') === category
            })
            
            if (holding && holding.ticker) {
              const holdingPeriod = getHoldingPeriod(holding)
              actions.push({
                id: `sell-${category}`,
                type: 'sell',
                ticker: String(holding.ticker),
                amount: Math.round(absDrift),
                reason: `Reduce ${category} allocation by ${(Math.abs(drift) * 100).toFixed(1)}%`,
                category,
                taxImplication: holdingPeriod === 'short_term' ? 'short_term' : 'long_term',
                priority: absDrift > 1000 ? 'high' : 'medium'
              })
            }
          } else {
            // Underweight - suggest buying  
            const holding = safeHoldings.find(h => {
              if (!h || typeof h !== 'object') return false
              return mapSectorToCategory(h.sector || h.category || 'diversified') === category
            })
            const ticker = holding?.ticker || getDefaultTicker(category)
            
            actions.push({
              id: `buy-${category}`,
              type: 'buy',
              ticker: String(ticker),
              amount: Math.round(absDrift),
              reason: `Increase ${category} allocation by ${(Math.abs(drift) * 100).toFixed(1)}%`,
              category,
              taxImplication: 'none', // Buying has no tax implications
              priority: absDrift > 1000 ? 'high' : 'medium'
            })
          }
        }
      })

      return actions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
    } catch (error) {
      logger.warn('Error generating rebalancing actions:', error)
      return []
    }
  }, [allocationData, safeTotalValue, safeHoldings])

  // Calculate rebalancing metrics with safe data access
  const metrics: RebalanceMetrics = useMemo(() => {
    try {
      if (!allocationData || !allocationData.drift) {
        return {
          efficiencyScore: 100,
          totalCost: 0,
          netBenefit: 0,
          timeToOptimal: 'N/A'
        }
      }

      const driftValues = Object.values(allocationData.drift).filter(val => typeof val === 'number' && !isNaN(val))
      const totalDrift = driftValues.reduce((sum, drift) => sum + Math.abs(drift), 0)
      const maxDrift = driftValues.length > 0 ? Math.max(...driftValues.map(Math.abs)) : 0
      
      // Efficiency score: 100 = perfect allocation, 0 = maximum drift
      const efficiencyScore = Math.max(0, 100 - (totalDrift * 100 * 2))
      
      // Estimate transaction costs ($10 per trade)
      const totalCost = Array.isArray(rebalanceActions) ? rebalanceActions.length * 10 : 0
      
      // Estimate benefit (reduced risk, better returns)
      const annualBenefit = safeTotalValue * 0.002 * totalDrift // 0.2% improvement per 1% drift
      const netBenefit = annualBenefit - totalCost
      
      // Time estimate based on available funds with safe access
      const availableFunds = Math.max(0, safeIncomeClarityData?.availableToReinvest || 0)
      const buyActions = Array.isArray(rebalanceActions) ? rebalanceActions.filter(a => a.type === 'buy') : []
      const totalBuyAmount = buyActions.reduce((sum, a) => sum + (a.amount || 0), 0)
      
      const timeToOptimal = availableFunds > 0 && totalBuyAmount > 0 ? 
        `${Math.ceil(totalBuyAmount / availableFunds)} months` :
        'N/A - Need positive cash flow'

      return {
        efficiencyScore: Math.round(efficiencyScore),
        totalCost,
        netBenefit: Math.round(netBenefit),
        timeToOptimal
      }
    } catch (error) {
      logger.warn('Error calculating metrics:', error)
      return {
        efficiencyScore: 100,
        totalCost: 0,
        netBenefit: 0,
        timeToOptimal: 'N/A'
      }
    }
  }, [allocationData, rebalanceActions, safeTotalValue, safeIncomeClarityData])

  // Helper function to get default ticker for category
  function getDefaultTicker(category: keyof TargetAllocation): string {
    switch (category) {
      case 'stocks': return 'SCHD' // Dividend growth
      case 'reits': return 'SPHD'  // High dividend REITs  
      case 'bonds': return 'TLT'   // Treasury bonds
    }
  }

  // Early return if no portfolio data (using safe values)
  if (safeTotalValue === 0 || safeHoldings.length === 0) {
    return (
      <div 
        className="rounded-xl p-6 transition-all duration-300"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Scale className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Rebalancing Intelligence
          </h2>
        </div>
        
        <div className="text-center py-8">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--color-text-secondary)' }} />
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No Portfolio Data Available
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Add holdings to your portfolio to see rebalancing recommendations
          </p>
        </div>
      </div>
    )
  }

  // Calculate total drift percentage with safe access
  const totalDriftPercentage = useMemo(() => {
    if (!allocationData || !allocationData.drift) return 0
    try {
      return Object.values(allocationData.drift)
        .filter(val => typeof val === 'number' && !isNaN(val))
        .reduce((sum, drift) => sum + Math.abs(drift), 0) * 100
    } catch (error) {
      logger.warn('Error calculating total drift percentage:', error)
      return 0
    }
  }, [allocationData])

  return (
    <div 
      className="rounded-xl transition-all duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Scale className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Rebalancing Intelligence
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Efficiency Score */}
            <div className="text-right">
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Efficiency Score
              </div>
              <div 
                className="text-2xl font-bold"
                style={{ 
                  color: metrics.efficiencyScore >= 85 ? 'var(--color-success)' :
                         metrics.efficiencyScore >= 70 ? 'var(--color-warning)' :
                         'var(--color-error)'
                }}
              >
                {metrics.efficiencyScore}/100
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              {metrics.efficiencyScore >= 90 ? (
                <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              ) : metrics.efficiencyScore >= 75 ? (
                <Info className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
              ) : (
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-error)' }} />
              )}
            </div>
          </div>
        </div>

        {/* Current vs Target Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Allocation */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Current Allocation
            </h3>
            <div className="space-y-3">
              {(['stocks', 'reits', 'bonds'] as const).map((category) => {
                const currentValue = allocationData?.current?.[category] || 0
                const driftValue = allocationData?.drift?.[category] || 0
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="capitalize text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {(currentValue * 100).toFixed(1)}%
                      </div>
                      {Math.abs(driftValue) > 0.02 && (
                        <div 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: driftValue > 0 ? 'var(--color-error-light)' : 'var(--color-warning-light)',
                            color: driftValue > 0 ? 'var(--color-error)' : 'var(--color-warning)'
                          }}
                        >
                          {driftValue > 0 ? 'Over' : 'Under'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Target Allocation */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Target Allocation
            </h3>
            <div className="space-y-3">
              {(['stocks', 'reits', 'bonds'] as const).map((category) => {
                const targetValue = targetAllocation?.[category] || 0
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <span className="capitalize text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {category}
                    </span>
                    <div className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>
                      {(targetValue * 100).toFixed(0)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rebalancing Actions */}
      {Array.isArray(rebalanceActions) && rebalanceActions.length > 0 && (
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Recommended Actions
          </h3>
          
          <div className="space-y-3">
            {rebalanceActions.map((action) => {
              if (!action || typeof action !== 'object') return null
              
              return (
              <div 
                key={action.id}
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {action.type === 'buy' ? (
                      <TrendingUp className="w-5 h-5 mt-1" style={{ color: 'var(--color-success)' }} />
                    ) : (
                      <TrendingDown className="w-5 h-5 mt-1" style={{ color: 'var(--color-error)' }} />
                    )}
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {action.type === 'buy' ? 'Buy' : 'Sell'} ${(action.amount || 0).toLocaleString()} of {action.ticker || 'Unknown'}
                        </span>
                        {action.priority === 'high' && (
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: 'var(--color-error-light)',
                              color: 'var(--color-error)'
                            }}
                          >
                            High Priority
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {action.reason || 'Portfolio rebalancing recommendation'}
                      </p>
                      
                      {action.taxImplication === 'short_term' && action.type === 'sell' && (
                        <div className="flex items-center space-x-2 mt-2">
                          <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
                          <span className="text-xs" style={{ color: 'var(--color-warning)' }}>
                            Warning: May trigger short-term capital gains tax
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      ${(action.amount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary & Metrics */}
      <div 
        className="px-6 py-4 rounded-b-xl border-t"
        style={{ 
          backgroundColor: 'var(--color-secondary)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Total Drift
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {totalDriftPercentage.toFixed(1)}%
            </div>
          </div>
          
          <div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Transaction Costs
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-error)' }}>
              ${(metrics?.totalCost || 0)}
            </div>
          </div>
          
          <div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Est. Annual Benefit
            </div>
            <div 
              className="text-lg font-bold"
              style={{ 
                color: (metrics?.netBenefit || 0) > 0 ? 'var(--color-success)' : 'var(--color-text-primary)'
              }}
            >
              ${(metrics?.netBenefit || 0) > 0 ? '+' : ''}${(metrics?.netBenefit || 0).toLocaleString()}
            </div>
          </div>
          
          <div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Time to Optimal
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {metrics?.timeToOptimal || 'N/A'}
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mt-4">
          {(metrics?.efficiencyScore || 0) >= 90 ? (
            <p className="text-sm" style={{ color: 'var(--color-success)' }}>
              ✨ Excellent allocation! Your portfolio is well-balanced.
            </p>
          ) : (metrics?.efficiencyScore || 0) >= 75 ? (
            <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
              🎯 Minor adjustments recommended for optimal allocation.
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>
              📈 Consider rebalancing to improve portfolio efficiency and risk management.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}