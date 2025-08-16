'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, TrendingDown, Target, Clock, AlertCircle, CheckCircle, DollarSign, Users } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface ReinvestmentAnalysis {
  currentPhase: 'accumulation' | 'transition' | 'income'
  stopReinvestingDate: string
  yearsToStopReinvesting: number
  currentPortfolioSize: number
  projectedPortfolioAtStopDate: number
  monthlyIncomeAtStopDate: number
  confidenceScore: number
  reasonsToStopReinvesting: string[]
  riskFactors: string[]
  recommendedTransitionSteps: string[]
}

const ReinvestmentAdvisorComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)

  // Calculate comprehensive reinvestment analysis
  const calculateReinvestmentAnalysis = (): ReinvestmentAnalysis => {
    if (!incomeClarityData || !profileData) {
      return {
        currentPhase: 'accumulation',
        stopReinvestingDate: '2030-12-31',
        yearsToStopReinvesting: 6,
        currentPortfolioSize: 0,
        projectedPortfolioAtStopDate: 0,
        monthlyIncomeAtStopDate: 0,
        confidenceScore: 0,
        reasonsToStopReinvesting: [],
        riskFactors: [],
        recommendedTransitionSteps: []
      }
    }

    const currentAge = 35 // Default age (personalInfo not available in ProfileSetupData)
    const retirementAge = profileData.goals?.retirementAge || 65
    const currentMonthlyIncome = incomeClarityData.netMonthly
    const currentMonthlyExpenses = incomeClarityData.monthlyExpenses || 3000
    const availableToReinvest = incomeClarityData.availableToReinvest || 0

    // Estimate current portfolio size based on income
    const estimatedYield = 0.04 // 4% average dividend yield
    const currentPortfolioSize = currentMonthlyIncome * 12 / estimatedYield

    // Calculate when to stop reinvesting
    const yearsToRetirement = retirementAge - currentAge
    const incomeNeededForRetirement = currentMonthlyExpenses * 1.2 // 20% buffer
    const portfolioNeededForRetirement = (incomeNeededForRetirement * 12) / estimatedYield
    
    // Growth calculations
    const annualGrowthRate = 0.07 // 7% total return
    const yearsToStopReinvesting = Math.max(1, yearsToRetirement - 5) // Stop 5 years before retirement
    const projectedPortfolioAtStopDate = currentPortfolioSize * Math.pow(1 + annualGrowthRate, yearsToStopReinvesting)
    const monthlyIncomeAtStopDate = (projectedPortfolioAtStopDate * estimatedYield) / 12

    // Determine current phase
    let currentPhase: 'accumulation' | 'transition' | 'income'
    if (currentAge < retirementAge - 10) {
      currentPhase = 'accumulation'
    } else if (currentAge < retirementAge - 2) {
      currentPhase = 'transition'
    } else {
      currentPhase = 'income'
    }

    // Calculate stop date
    const stopDate = new Date()
    stopDate.setFullYear(stopDate.getFullYear() + yearsToStopReinvesting)
    const stopReinvestingDate = stopDate.toISOString().split('T')[0]

    // Confidence score (0-100)
    let confidenceScore = 70
    if (availableToReinvest > 0) confidenceScore += 10
    if (currentMonthlyIncome > currentMonthlyExpenses * 0.8) confidenceScore += 10
    if (yearsToStopReinvesting > 5) confidenceScore += 10
    confidenceScore = Math.min(100, confidenceScore)

    // Generate personalized recommendations
    const reasonsToStopReinvesting = [
      `Portfolio will generate $${Math.round(monthlyIncomeAtStopDate).toLocaleString()} monthly by ${stopDate.getFullYear()}`,
      `Reduces sequence of returns risk in final retirement years`,
      `Provides stable income stream without market timing concerns`,
      `Allows focus on income optimization rather than growth`
    ]

    const riskFactors = [
      yearsToStopReinvesting < 3 ? 'Short timeline may limit portfolio growth' : null,
      availableToReinvest < 500 ? 'Limited reinvestment capacity may slow growth' : null,
      currentAge > 55 ? 'Approaching traditional retirement age increases urgency' : null,
      'Market volatility could impact projected portfolio values'
    ].filter(Boolean) as string[]

    const recommendedTransitionSteps = [
      `Continue reinvesting for the next ${yearsToStopReinvesting} years`,
      'Gradually shift to higher-yielding dividend stocks 2 years before stop date',
      'Build 6-month expense reserve before transitioning to income phase',
      'Consider tax-loss harvesting opportunities during transition',
      'Review and rebalance portfolio quarterly during transition period'
    ]

    return {
      currentPhase,
      stopReinvestingDate,
      yearsToStopReinvesting,
      currentPortfolioSize,
      projectedPortfolioAtStopDate,
      monthlyIncomeAtStopDate,
      confidenceScore,
      reasonsToStopReinvesting,
      riskFactors,
      recommendedTransitionSteps
    }
  }

  const analysis = calculateReinvestmentAnalysis()

  // Animated counting for main values
  const animatedPortfolioSize = useCountingAnimation(analysis.projectedPortfolioAtStopDate, 800, isVisible ? 0 : 0)
  const animatedMonthlyIncome = useCountingAnimation(analysis.monthlyIncomeAtStopDate, 900, isVisible ? 100 : 0)
  const animatedConfidence = useCountingAnimation(analysis.confidenceScore, 1000, isVisible ? 200 : 0)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'accumulation': return TrendingDown
      case 'transition': return Clock
      case 'income': return DollarSign
      default: return Target
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'accumulation': return 'var(--color-info)'
      case 'transition': return 'var(--color-warning)'
      case 'income': return 'var(--color-success)'
      default: return 'var(--color-info)'
    }
  }

  const PhaseIcon = getPhaseIcon(analysis.currentPhase)

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
              style={{ backgroundColor: getPhaseColor(analysis.currentPhase), opacity: 0.1 }}
            >
              <PhaseIcon className="w-6 h-6" style={{ color: getPhaseColor(analysis.currentPhase) }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Stop Reinvesting Advisor
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Optimal transition from accumulation to income phase
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
              analysis.confidenceScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
              analysis.confidenceScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {analysis.confidenceScore >= 80 ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{animatedConfidence.toFixed(0)}% confidence</span>
            </div>
            <button
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: 'var(--color-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
              }}
            >
              <Users className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Key Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Stop Date Recommendation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Recommended Stop Date
              </span>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold"
              style={{ color: 'var(--color-info)' }}
            >
              {formatDate(analysis.stopReinvestingDate)}
            </motion.div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {analysis.yearsToStopReinvesting} years from now
            </p>
          </div>

          {/* Projected Income */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Monthly Income at Stop Date
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                  {formatCurrency(animatedMonthlyIncome)}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  per month
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                From portfolio of {formatCurrency(animatedPortfolioSize)}
              </div>
            </div>
          </div>
        </div>

        {/* Current Phase Status */}
        <div 
          className="p-4 rounded-xl border mb-6"
          style={{ 
            backgroundColor: getPhaseColor(analysis.currentPhase),
            borderColor: getPhaseColor(analysis.currentPhase),
            opacity: 0.1
          }}
        >
          <div className="flex items-center space-x-3">
            <PhaseIcon className="w-6 h-6" style={{ color: getPhaseColor(analysis.currentPhase) }} />
            <div>
              <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Current Phase: {analysis.currentPhase.charAt(0).toUpperCase() + analysis.currentPhase.slice(1)}
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {analysis.currentPhase === 'accumulation' && 'Focus on building portfolio size through reinvestment'}
                {analysis.currentPhase === 'transition' && 'Begin preparing for income-focused strategy'}
                {analysis.currentPhase === 'income' && 'Prioritize stable dividend income over growth'}
              </p>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {analysis.reasonsToStopReinvesting.slice(0, 3).map((reason, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: 'var(--color-secondary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-success)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {reason}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Analysis Toggle */}
        <AnimatePresence>
          {showDetailedAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-6 space-y-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {/* Risk Factors */}
              {analysis.riskFactors.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Risk Considerations
                  </h4>
                  <div className="space-y-3">
                    {analysis.riskFactors.map((risk, index) => (
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
                          <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                          <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            {risk}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transition Steps */}
              <div>
                <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Recommended Transition Steps
                </h4>
                <div className="space-y-3">
                  {analysis.recommendedTransitionSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-3 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--color-info)',
                        borderColor: 'var(--color-info)',
                        opacity: 0.1
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: 'var(--color-info)', color: 'white' }}
                        >
                          {index + 1}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {step}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const ReinvestmentAdvisor = memo(ReinvestmentAdvisorComponent)