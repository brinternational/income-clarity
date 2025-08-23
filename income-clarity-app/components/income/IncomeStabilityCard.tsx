'use client'

import { useState, useEffect, memo } from 'react'
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'
import { Shield, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Info } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'
import HelpButton, { helpContent } from '@/components/shared/HelpButton'

interface StabilityData {
  overallScore: number
  diversificationScore: number
  qualityScore: number
  volatilityScore: number
  concentrationRisk: number
  recessionProofPercentage: number
  dividendCutProbability: number
}

const IncomeStabilityCardComponent = () => {
  const { incomeClarityData, loading: profileLoading, error: profileError } = useUserProfile()
  const { portfolio, holdings, loading: portfolioLoading, error: portfolioError } = usePortfolio()
  const [localLoading, setLocalLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  // Simulate initial data loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Handle errors from contexts
  if (profileError) {
    throw new Error(`Failed to load profile data: ${profileError}`)
  }
  if (portfolioError) {
    throw new Error(`Failed to load portfolio data: ${portfolioError}`)
  }

  const isLoading = profileLoading || portfolioLoading || localLoading

  // Calculate income stability metrics
  const calculateStabilityData = (): StabilityData => {
    if (!holdings || holdings.length === 0) {
      return {
        overallScore: 0,
        diversificationScore: 0,
        qualityScore: 0,
        volatilityScore: 0,
        concentrationRisk: 100,
        recessionProofPercentage: 0,
        dividendCutProbability: 100
      }
    }

    // Calculate diversification score (based on number of holdings)
    const diversificationScore = Math.min((holdings.length / 8) * 100, 100)

    // Quality score based on dividend type mix
    const qualifiedPercentage = holdings.filter(h => 
      h.taxTreatment === 'qualified' || h.ticker.includes('SCHD') || h.ticker.includes('VYM')
    ).length / holdings.length * 100
    
    const qualityScore = qualifiedPercentage * 0.8 + 
                        (holdings.filter(h => h.annualYield && h.annualYield < 0.06).length / holdings.length * 100) * 0.2

    // Volatility score (mock - inverse of average yield)
    const avgYield = holdings.reduce((sum, h) => sum + (h.annualYield || 0.04), 0) / holdings.length
    const volatilityScore = Math.max(0, 100 - (avgYield * 1000)) // Higher yield = more volatility risk

    // Concentration risk (largest position percentage)
    const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || (h.shares * h.currentPrice)), 0)
    const largestPosition = totalValue > 0 ? Math.max(...holdings.map(h => 
      ((h.currentValue || (h.shares * h.currentPrice)) / totalValue) * 100
    )) : 0
    const concentrationRisk = largestPosition > 30 ? largestPosition : 0

    // Recession-proof percentage (defensive sectors)
    const recessionProofPercentage = holdings.filter(h => 
      h.sector?.toLowerCase().includes('dividend') || 
      h.sector?.toLowerCase().includes('equity') ||
      h.ticker.includes('SCHD') || h.ticker.includes('VYM')
    ).length / holdings.length * 100

    // Overall dividend cut probability
    const dividendCutProbability = Math.max(0, 
      20 - (qualityScore * 0.3) - (diversificationScore * 0.2) + (avgYield > 0.08 ? 15 : 0)
    )

    // Overall stability score
    const overallScore = (
      diversificationScore * 0.25 +
      qualityScore * 0.30 +
      volatilityScore * 0.20 +
      (100 - concentrationRisk) * 0.15 +
      recessionProofPercentage * 0.10
    )

    return {
      overallScore,
      diversificationScore,
      qualityScore,
      volatilityScore,
      concentrationRisk,
      recessionProofPercentage,
      dividendCutProbability
    }
  }

  const stabilityData = calculateStabilityData()

  const animatedValues = useStaggeredCountingAnimation(
    {
      overall: stabilityData.overallScore,
      diversification: stabilityData.diversificationScore,
      quality: stabilityData.qualityScore,
      volatility: stabilityData.volatilityScore,
      recessionProof: stabilityData.recessionProofPercentage,
      cutProbability: stabilityData.dividendCutProbability,
    },
    1000,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const stabilityFactors = [
    {
      label: 'Portfolio Diversification',
      score: animatedValues.diversification,
      icon: BarChart3,
      description: 'Number of holdings and sector spread'
    },
    {
      label: 'Dividend Quality',
      score: animatedValues.quality,
      icon: CheckCircle,
      description: 'Qualified dividends and sustainable yields'
    },
    {
      label: 'Income Volatility',
      score: animatedValues.volatility,
      icon: TrendingUp,
      description: 'Consistency of dividend payments'
    },
    {
      label: 'Recession Resilience',
      score: animatedValues.recessionProof,
      icon: Shield,
      description: 'Defensive holdings percentage'
    }
  ]

  return (
    <SkeletonCardWrapper 
      isLoading={isLoading} 
      cardType="strategy"
      className={isVisible ? 'animate-slide-up' : 'opacity-0'}
    >
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-foreground">
              Income Stability Score
            </h3>
            <HelpButton 
              {...helpContent.incomeStabilityCard}
              size="sm"
              position="bottom-left"
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            How reliable and sustainable is your dividend income?
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-600" />
        </div>
      </div>

      {/* Overall Score */}
      <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border-2 ${getScoreBg(stabilityData.overallScore)}`}>
        <div className="text-center">
          <div className={`text-4xl sm:text-5xl font-bold mb-2 ${getScoreColor(stabilityData.overallScore)}`}>
            {Math.round(animatedValues.overall)}
          </div>
          <div className="text-sm sm:text-base text-muted-foreground mb-2">Stability Score (out of 100)</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
            stabilityData.overallScore >= 80 ? 'bg-green-100 text-green-800' :
            stabilityData.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {stabilityData.overallScore >= 80 ? 'VERY STABLE' :
             stabilityData.overallScore >= 60 ? 'MODERATELY STABLE' : 'NEEDS IMPROVEMENT'}
          </div>
        </div>
      </div>

      {/* Stability Factors */}
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        {stabilityFactors.map((factor, index) => (
          <div 
            key={factor.label}
            className="group relative transition-all duration-500 ease-premium"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-300">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-1.5 sm:p-2 bg-slate-50 rounded-lg">
                  <factor.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-medium text-foreground/90">
                    {factor.label}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground transition-colors leading-tight">
                    {factor.description}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg sm:text-xl font-bold ${getScoreColor(factor.score)}`}>
                  {Math.round(factor.score)}
                </div>
                <div className="w-16 sm:w-20 bg-slate-100 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                      factor.score >= 80 ? 'bg-green-500' :
                      factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(factor.score, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Assessment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-700">Recession Resilience</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(animatedValues.recessionProof)}%
          </div>
          <div className="text-xs text-blue-600">of holdings are defensive</div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-orange-700">Cut Probability</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(animatedValues.cutProbability)}%
          </div>
          <div className="text-xs text-orange-600">risk of dividend cuts</div>
        </div>
      </div>

      {/* Improvement Recommendation */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border border-indigo-100">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground/90 mb-2">Stability Recommendation</h4>
            <p className="text-sm text-muted-foreground">
              {stabilityData.overallScore >= 80 ? 
                'Excellent stability! Your dividend income is well-diversified and reliable.' :
                stabilityData.concentrationRisk > 30 ?
                'Consider diversifying your holdings to reduce concentration risk and improve stability.' :
                'Focus on adding more qualified dividend ETFs like SCHD or VYM to improve dividend quality.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
      </SkeletonCardWrapper>
  )
}

// Wrap with error boundary
const IncomeStabilityCard = () => (
  <WithErrorBoundary cardName="Income Stability Analyzer" showDetails={false}>
    <IncomeStabilityCardComponent />
  </WithErrorBoundary>
)

export default memo(IncomeStabilityCard)