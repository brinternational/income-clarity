'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, TrendingUp, Calendar, Target, AlertCircle, CheckCircle, DollarSign, ArrowUp, ArrowDown } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface MonthlyTaxData {
  currentMonthRecommendation: number
  projectedMonthlyIncome: number
  estimatedTaxOwed: number
  adjustmentFromLastMonth: number
  adjustmentPercentage: number
  ytdTaxesSetAside: number
  ytdTaxesOwed: number
  variance: number
  recommendationConfidence: 'high' | 'medium' | 'low'
  seasonalAdjustments: {
    month: string
    multiplier: number
    reason: string
  }[]
  riskFactors: string[]
  optimizationTips: string[]
}

const MonthlyTaxSetAsideComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [showSeasonalBreakdown, setShowSeasonalBreakdown] = useState(false)

  // Calculate comprehensive monthly tax set-aside data
  const calculateMonthlyTaxData = (): MonthlyTaxData => {
    if (!incomeClarityData || !profileData) {
      return {
        currentMonthRecommendation: 0,
        projectedMonthlyIncome: 0,
        estimatedTaxOwed: 0,
        adjustmentFromLastMonth: 0,
        adjustmentPercentage: 0,
        ytdTaxesSetAside: 0,
        ytdTaxesOwed: 0,
        variance: 0,
        recommendationConfidence: 'medium',
        seasonalAdjustments: [],
        riskFactors: [],
        optimizationTips: []
      }
    }

    const baseMonthlyIncome = incomeClarityData.grossMonthly
    const federalRate = profileData.taxInfo?.federalRate || 22
    const stateRate = profileData.taxInfo?.stateRate || 0
    const effectiveTaxRate = (federalRate + stateRate) / 100

    // Current month analysis
    const currentMonth = new Date().getMonth()
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' })
    
    // Seasonal dividend income adjustments (higher in dividend months)
    const isQuarterEnd = [2, 5, 8, 11].includes(currentMonth)
    const seasonalMultiplier = isQuarterEnd ? 1.4 : 0.8
    const projectedMonthlyIncome = baseMonthlyIncome * seasonalMultiplier

    // Estimate dividend type breakdown for accurate tax calculation
    const qualifiedDividends = projectedMonthlyIncome * 0.65
    const ordinaryDividends = projectedMonthlyIncome * 0.35
    
    const qualifiedTaxRate = 0.15 // 15% for most qualified dividends
    const ordinaryTaxRate = effectiveTaxRate

    const estimatedTaxOwed = (qualifiedDividends * qualifiedTaxRate) + (ordinaryDividends * ordinaryTaxRate)
    const currentMonthRecommendation = Math.round(estimatedTaxOwed * 1.1) // 10% buffer

    // Mock last month's recommendation for comparison
    const lastMonthMultiplier = [1, 4, 7, 10].includes(currentMonth) ? 1.4 : 0.8 // Previous quarter end
    const lastMonthProjected = baseMonthlyIncome * lastMonthMultiplier
    const lastMonthTaxOwed = (lastMonthProjected * 0.65 * qualifiedTaxRate) + (lastMonthProjected * 0.35 * ordinaryTaxRate)
    const lastMonthRecommendation = Math.round(lastMonthTaxOwed * 1.1)

    const adjustmentFromLastMonth = currentMonthRecommendation - lastMonthRecommendation
    const adjustmentPercentage = lastMonthRecommendation > 0 ? (adjustmentFromLastMonth / lastMonthRecommendation) * 100 : 0

    // YTD calculations (mock data)
    const monthsElapsed = currentMonth + 1
    const ytdTaxesSetAside = currentMonthRecommendation * monthsElapsed * 0.9 // Assume 90% compliance
    const ytdTaxesOwed = baseMonthlyIncome * monthsElapsed * 0.65 * qualifiedTaxRate + 
                        baseMonthlyIncome * monthsElapsed * 0.35 * ordinaryTaxRate
    const variance = ytdTaxesSetAside - ytdTaxesOwed

    // Confidence assessment
    let recommendationConfidence: 'high' | 'medium' | 'low'
    if (Math.abs(adjustmentPercentage) < 10) {
      recommendationConfidence = 'high'
    } else if (Math.abs(adjustmentPercentage) < 25) {
      recommendationConfidence = 'medium'
    } else {
      recommendationConfidence = 'low'
    }

    // Seasonal adjustments for next 12 months
    const seasonalAdjustments = []
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12
      const monthName = new Date(2024, monthIndex, 1).toLocaleString('default', { month: 'short' })
      const isQuarterEndMonth = [2, 5, 8, 11].includes(monthIndex)
      
      seasonalAdjustments.push({
        month: monthName,
        multiplier: isQuarterEndMonth ? 1.4 : 0.8,
        reason: isQuarterEndMonth ? 'High dividend month' : 'Regular dividend month'
      })
    }

    // Risk factors
    const riskFactors = []
    if (Math.abs(adjustmentPercentage) > 30) {
      riskFactors.push('Large month-to-month variance in dividend income')
    }
    if (variance < 0) {
      riskFactors.push('YTD taxes set aside falling behind YTD taxes owed')
    }
    if (effectiveTaxRate > 0.25) {
      riskFactors.push('High tax rate increases penalty risk if underpaid')
    }

    // Optimization tips
    const optimizationTips = [
      'Set up automatic transfers on dividend payment dates',
      'Review and adjust monthly after receiving 1099-DIV forms',
      'Consider tax-loss harvesting opportunities in December',
      'Track qualified vs ordinary dividend ratios for accuracy'
    ]

    return {
      currentMonthRecommendation,
      projectedMonthlyIncome,
      estimatedTaxOwed,
      adjustmentFromLastMonth,
      adjustmentPercentage,
      ytdTaxesSetAside,
      ytdTaxesOwed,
      variance,
      recommendationConfidence,
      seasonalAdjustments,
      riskFactors,
      optimizationTips
    }
  }

  const taxData = calculateMonthlyTaxData()

  // Animated counting for main values
  const animatedRecommendation = useCountingAnimation(taxData.currentMonthRecommendation, 800, isVisible ? 0 : 0)
  const animatedIncome = useCountingAnimation(taxData.projectedMonthlyIncome, 900, isVisible ? 100 : 0)
  const animatedVariance = useCountingAnimation(Math.abs(taxData.variance), 1000, isVisible ? 200 : 0)

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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'var(--color-success)'
      case 'medium': return 'var(--color-warning)'
      case 'low': return 'var(--color-error)'
      default: return 'var(--color-info)'
    }
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return CheckCircle
      case 'medium': return Target
      case 'low': return AlertCircle
      default: return Target
    }
  }

  const ConfidenceIcon = getConfidenceIcon(taxData.recommendationConfidence)

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
              style={{ backgroundColor: 'var(--color-warning)', opacity: 0.1 }}
            >
              <Calculator className="w-6 h-6" style={{ color: 'var(--color-warning)' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Monthly Tax Set-Aside
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Smart recommendations based on projected income
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
              taxData.recommendationConfidence === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
              taxData.recommendationConfidence === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              <ConfidenceIcon className="w-4 h-4" />
              <span>{taxData.recommendationConfidence} confidence</span>
            </div>
            {taxData.adjustmentFromLastMonth !== 0 && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                taxData.adjustmentFromLastMonth > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              }`}>
                {taxData.adjustmentFromLastMonth > 0 ? 
                  <ArrowUp className="w-3 h-3" /> : 
                  <ArrowDown className="w-3 h-3" />
                }
                <span>{Math.abs(taxData.adjustmentPercentage).toFixed(0)}%</span>
              </div>
            )}
            <button
              onClick={() => setShowSeasonalBreakdown(!showSeasonalBreakdown)}
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
        {/* Main Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* This Month's Recommendation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Set Aside This Month
              </span>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold"
              style={{ color: 'var(--color-success)' }}
            >
              {formatCurrency(animatedRecommendation)}
            </motion.div>
            <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span>From projected income:</span>
              <span className="font-medium">{formatCurrency(animatedIncome)}</span>
            </div>
          </div>

          {/* YTD Variance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                YTD Variance
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold" style={{ 
                  color: taxData.variance >= 0 ? 'var(--color-success)' : 'var(--color-error)' 
                }}>
                  {taxData.variance >= 0 ? '+' : '-'}{formatCurrency(animatedVariance)}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {taxData.variance >= 0 ? 'ahead' : 'behind'}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Set aside: {formatCurrency(taxData.ytdTaxesSetAside)} | Owed: {formatCurrency(taxData.ytdTaxesOwed)}
              </div>
            </div>
          </div>
        </div>

        {/* Month-over-Month Change */}
        {taxData.adjustmentFromLastMonth !== 0 && (
          <div 
            className="p-4 rounded-xl border mb-6"
            style={{
              backgroundColor: taxData.adjustmentFromLastMonth > 0 ? 'var(--color-warning)' : 'var(--color-success)',
              borderColor: taxData.adjustmentFromLastMonth > 0 ? 'var(--color-warning)' : 'var(--color-success)',
              opacity: 0.1
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {taxData.adjustmentFromLastMonth > 0 ? 
                  <ArrowUp className="w-5 h-5" style={{ color: 'var(--color-warning)' }} /> :
                  <ArrowDown className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
                }
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {taxData.adjustmentFromLastMonth > 0 ? 'Increase' : 'Decrease'} from Last Month
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatCurrency(Math.abs(taxData.adjustmentFromLastMonth))} ({Math.abs(taxData.adjustmentPercentage).toFixed(1)}%) 
                    {taxData.adjustmentFromLastMonth > 0 ? ' more to set aside' : ' less to set aside'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Estimated Tax Owed */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Est. Tax Owed
              </span>
              <Calculator className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(taxData.estimatedTaxOwed)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Base calculation
            </p>
          </div>

          {/* Buffer Amount */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Safety Buffer
              </span>
              <Target className="w-4 h-4" style={{ color: 'var(--color-info)' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(taxData.currentMonthRecommendation - taxData.estimatedTaxOwed)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              10% buffer included
            </p>
          </div>

          {/* Effective Rate */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Effective Rate
              </span>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {((taxData.estimatedTaxOwed / Math.max(taxData.projectedMonthlyIncome, 1)) * 100).toFixed(1)}%
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              This month's rate
            </p>
          </div>
        </div>

        {/* Risk Factors */}
        {taxData.riskFactors.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Risk Factors
            </h4>
            <div className="space-y-2">
              {taxData.riskFactors.map((risk, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--color-warning)',
                    borderColor: 'var(--color-warning)',
                    opacity: 0.1
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {risk}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seasonal Breakdown */}
        <AnimatePresence>
          {showSeasonalBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                12-Month Seasonal Adjustments
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {taxData.seasonalAdjustments.map((adjustment, index) => (
                  <motion.div
                    key={adjustment.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-3 rounded-xl border text-center"
                    style={{
                      backgroundColor: 'var(--color-tertiary)',
                      borderColor: adjustment.multiplier > 1 ? 'var(--color-warning)' : 'var(--color-info)'
                    }}
                  >
                    <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {adjustment.month}
                    </div>
                    <div className={`text-xs font-bold ${
                      adjustment.multiplier > 1 ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {(adjustment.multiplier * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {adjustment.reason.replace(' dividend month', '')}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optimization Tips */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Optimization Tips
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {taxData.optimizationTips.map((tip, index) => (
              <div 
                key={index}
                className="p-3 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-info)',
                  borderColor: 'var(--color-info)',
                  opacity: 0.1
                }}
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 mt-0.5" style={{ color: 'var(--color-info)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const MonthlyTaxSetAside = memo(MonthlyTaxSetAsideComponent)