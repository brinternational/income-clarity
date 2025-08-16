'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PiggyBank, Target, TrendingUp, Calendar, AlertTriangle, CheckCircle, DollarSign, Percent } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface TaxReserveData {
  currentReserve: number
  targetReserve: number
  shortfall: number
  percentageComplete: number
  monthsToTarget: number
  recommendedMonthlySavings: number
  quarterlyTaxPayment: number
  reserveStatus: 'underfunded' | 'onTrack' | 'fullyFunded' | 'overFunded'
  riskLevel: 'low' | 'medium' | 'high'
  monthlyBreakdown: {
    month: string
    projectedDividends: number
    taxesOwed: number
    recommendedReserve: number
    cumulativeReserve: number
  }[]
}

const TaxReserveFundComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(false)

  // Calculate comprehensive tax reserve data
  const calculateTaxReserveData = (): TaxReserveData => {
    if (!incomeClarityData || !profileData) {
      return {
        currentReserve: 0,
        targetReserve: 0,
        shortfall: 0,
        percentageComplete: 0,
        monthsToTarget: 12,
        recommendedMonthlySavings: 0,
        quarterlyTaxPayment: 0,
        reserveStatus: 'underfunded',
        riskLevel: 'medium',
        monthlyBreakdown: []
      }
    }

    const monthlyDividendIncome = incomeClarityData.grossMonthly
    const annualDividendIncome = monthlyDividendIncome * 12
    const federalRate = profileData.taxInfo?.federalRate || 22
    const stateRate = profileData.taxInfo?.stateRate || 0
    const effectiveTaxRate = (federalRate + stateRate) / 100

    // Estimate dividend breakdown for more accurate tax calculation
    const qualifiedDividends = annualDividendIncome * 0.65 // ETFs like SCHD, VYM
    const ordinaryDividends = annualDividendIncome * 0.35 // Covered calls, REITs

    const qualifiedTaxRate = 0.15 // 15% for most qualified dividends
    const ordinaryTaxRate = effectiveTaxRate

    const annualTaxBill = (qualifiedDividends * qualifiedTaxRate) + (ordinaryDividends * ordinaryTaxRate)
    const quarterlyTaxPayment = annualTaxBill / 4
    const targetReserve = quarterlyTaxPayment * 1.1 // 10% buffer

    // Mock current reserve (in real app, this would come from user data)
    const currentReserve = targetReserve * 0.4 // Assume 40% funded initially

    const shortfall = Math.max(0, targetReserve - currentReserve)
    const percentageComplete = targetReserve > 0 ? Math.min(100, (currentReserve / targetReserve) * 100) : 0
    const monthsToTarget = Math.max(1, Math.ceil(shortfall / (monthlyDividendIncome * 0.15))) // Assume 15% of income can be reserved
    const recommendedMonthlySavings = Math.ceil(shortfall / monthsToTarget)

    // Determine reserve status
    let reserveStatus: 'underfunded' | 'onTrack' | 'fullyFunded' | 'overFunded'
    if (percentageComplete < 50) {
      reserveStatus = 'underfunded'
    } else if (percentageComplete < 95) {
      reserveStatus = 'onTrack'
    } else if (percentageComplete <= 110) {
      reserveStatus = 'fullyFunded'
    } else {
      reserveStatus = 'overFunded'
    }

    // Risk level assessment
    let riskLevel: 'low' | 'medium' | 'high'
    if (percentageComplete >= 100) {
      riskLevel = 'low'
    } else if (percentageComplete >= 75) {
      riskLevel = 'medium'
    } else {
      riskLevel = 'high'
    }

    // Generate monthly breakdown for the next 12 months
    const monthlyBreakdown = []
    let cumulativeReserve = currentReserve
    const currentDate = new Date()

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      const monthName = monthDate.toLocaleString('default', { month: 'short' })
      
      // Add some seasonal variance to dividend income (higher in Dec, Mar, Jun, Sep)
      const isQuarterEnd = [2, 5, 8, 11].includes(monthDate.getMonth())
      const seasonalMultiplier = isQuarterEnd ? 1.3 : 0.85
      const projectedDividends = monthlyDividendIncome * seasonalMultiplier

      const monthlyTaxesOwed = projectedDividends * effectiveTaxRate
      const recommendedReserve = monthlyTaxesOwed
      cumulativeReserve += recommendedReserve

      monthlyBreakdown.push({
        month: monthName,
        projectedDividends,
        taxesOwed: monthlyTaxesOwed,
        recommendedReserve,
        cumulativeReserve
      })
    }

    return {
      currentReserve,
      targetReserve,
      shortfall,
      percentageComplete,
      monthsToTarget,
      recommendedMonthlySavings,
      quarterlyTaxPayment,
      reserveStatus,
      riskLevel,
      monthlyBreakdown
    }
  }

  const taxReserveData = calculateTaxReserveData()

  // Animated counting for main values
  const animatedTargetReserve = useCountingAnimation(taxReserveData.targetReserve, 800, isVisible ? 0 : 0)
  const animatedCurrentReserve = useCountingAnimation(taxReserveData.currentReserve, 900, isVisible ? 100 : 0)
  const animatedPercentage = useCountingAnimation(taxReserveData.percentageComplete, 1000, isVisible ? 200 : 0)

  // Visibility animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fullyFunded': return 'var(--color-success)'
      case 'onTrack': return 'var(--color-info)'
      case 'underfunded': return 'var(--color-error)'
      case 'overFunded': return 'var(--color-warning)'
      default: return 'var(--color-info)'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fullyFunded': return CheckCircle
      case 'onTrack': return TrendingUp
      case 'underfunded': return AlertTriangle
      case 'overFunded': return Target
      default: return Target
    }
  }

  const StatusIcon = getStatusIcon(taxReserveData.reserveStatus)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border theme-card glass-card"
      style={{
        backgroundColor: 'var(--color-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-info)', opacity: 0.1 }}
            >
              <PiggyBank className="w-6 h-6" style={{ color: 'var(--color-info)' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Tax Reserve Fund
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Stay ahead of quarterly tax payments
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
              taxReserveData.riskLevel === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
              taxReserveData.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              <StatusIcon className="w-4 h-4" />
              <span>{taxReserveData.reserveStatus.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
            </div>
            <button
              onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: 'var(--color-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
              }}
            >
              <Calendar className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current Progress */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Reserve Fund Progress
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>
                  {animatedPercentage.toFixed(1)}%
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  of target
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, taxReserveData.percentageComplete)}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: getStatusColor(taxReserveData.reserveStatus) }}
                />
              </div>
              
              <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span>{formatCurrency(animatedCurrentReserve)}</span>
                <span>{formatCurrency(animatedTargetReserve)}</span>
              </div>
            </div>
          </div>

          {/* Target & Recommendations */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Monthly Recommendation
              </span>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold"
              style={{ color: 'var(--color-success)' }}
            >
              {formatCurrency(taxReserveData.recommendedMonthlySavings)}
            </motion.div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Set aside monthly to reach target in {taxReserveData.monthsToTarget} months
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Quarterly Payment */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Quarterly Payment
              </span>
              <Calendar className="w-4 h-4" style={{ color: 'var(--color-info)' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(taxReserveData.quarterlyTaxPayment)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Every 3 months
            </p>
          </div>

          {/* Shortfall */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: taxReserveData.shortfall > 0 ? 'var(--color-warning)' : 'var(--color-success)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {taxReserveData.shortfall > 0 ? 'Shortfall' : 'Surplus'}
              </span>
              <AlertTriangle className="w-4 h-4" style={{ 
                color: taxReserveData.shortfall > 0 ? 'var(--color-warning)' : 'var(--color-success)' 
              }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(Math.abs(taxReserveData.shortfall))}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {taxReserveData.shortfall > 0 ? 'Need to save' : 'Above target'}
            </p>
          </div>

          {/* Months to Target */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Time to Target
              </span>
              <Target className="w-4 h-4" style={{ color: 'var(--color-info)' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {taxReserveData.monthsToTarget}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              months at current pace
            </p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <AnimatePresence>
          {showMonthlyBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                12-Month Tax Reserve Plan
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taxReserveData.monthlyBreakdown.slice(0, 6).map((month, index) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-tertiary)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {month.month}
                      </h5>
                      <div className={`w-3 h-3 rounded-full ${
                        [2, 5, 8, 11].includes(index) ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Dividends:</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(month.projectedDividends)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Tax Reserve:</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(month.recommendedReserve)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1" style={{ borderColor: 'var(--color-border)' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Total Reserve:</span>
                        <span style={{ color: 'var(--color-success)' }}>
                          {formatCurrency(month.cumulativeReserve)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const TaxReserveFund = memo(TaxReserveFundComponent)