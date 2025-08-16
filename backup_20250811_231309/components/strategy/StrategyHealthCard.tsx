'use client'

import { useState, useEffect, memo } from 'react'
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'
import { Heart, TrendingUp, Shield, Target, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface HealthMetric {
  id: string
  name: string
  score: number
  weight: number
  description: string
  icon: any
  color: string
  bg: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
  recommendations: string[]
}

interface StrategyHealthData {
  overallScore: number
  grade: string
  metrics: HealthMetric[]
  topRecommendations: string[]
  riskLevel: 'Low' | 'Moderate' | 'High'
}

const StrategyHealthCardComponent = () => {
  const { profileData, incomeClarityData, loading: profileLoading, error: profileError } = useUserProfile()
  const { portfolio, holdings, loading: portfolioLoading, error: portfolioError } = usePortfolio()
  const [localLoading, setLocalLoading] = useState(true)

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

  const [isVisible, setIsVisible] = useState(false)
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

  const calculateStrategyHealth = (): StrategyHealthData => {
    const taxLocation = profileData?.location?.state || 'Other'
    const riskTolerance = profileData?.riskProfile?.riskLevel || 'moderate'
    const availableToReinvest = incomeClarityData?.availableToReinvest || 0
    const monthlyExpenses = incomeClarityData?.monthlyExpenses || 1

    const metrics: HealthMetric[] = [
      {
        id: 'tax-efficiency',
        name: 'Tax Efficiency',
        score: taxLocation === 'Puerto Rico' ? 95 : 
               taxLocation === 'Texas' || taxLocation === 'Florida' ? 85 : 72,
        weight: 0.25,
        description: 'How tax-optimized your strategy is for your location',
        icon: Shield,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        status: taxLocation === 'Puerto Rico' ? 'excellent' : 
                taxLocation === 'Texas' || taxLocation === 'Florida' ? 'good' : 'fair',
        recommendations: taxLocation === 'Puerto Rico' 
          ? ['You\'re already optimized!', 'Focus on qualified dividends']
          : ['Consider qualified dividend ETFs', 'Review location tax implications']
      },
      {
        id: 'income-stability',
        name: 'Income Stability',
        score: holdings && holdings.length > 3 ? 88 : 
               holdings && holdings.length > 1 ? 75 : 60,
        weight: 0.3,
        description: 'Reliability and consistency of your dividend income',
        icon: Heart,
        color: 'text-red-600',
        bg: 'bg-red-50',
        status: holdings && holdings.length > 3 ? 'excellent' : 'good',
        recommendations: [
          'Diversify across more dividend-paying ETFs',
          'Include dividend aristocrats',
          'Monitor dividend sustainability'
        ]
      },
      {
        id: 'risk-balance',
        name: 'Risk Balance',
        score: riskTolerance === 'conservative' ? 85 : 
               riskTolerance === 'moderate' ? 90 : 75,
        weight: 0.2,
        description: 'Balance between income and risk exposure',
        icon: Target,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        status: riskTolerance === 'moderate' ? 'excellent' : 'good',
        recommendations: [
          'Align holdings with risk tolerance',
          'Consider margin usage carefully',
          'Review portfolio volatility'
        ]
      },
      {
        id: 'cash-flow',
        name: 'Cash Flow Health',
        score: availableToReinvest > monthlyExpenses * 0.2 ? 95 :
               availableToReinvest > 0 ? 80 : 50,
        weight: 0.25,
        description: 'Your ability to cover expenses and reinvest',
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50',
        status: availableToReinvest > monthlyExpenses * 0.2 ? 'excellent' :
                availableToReinvest > 0 ? 'good' : 'poor',
        recommendations: availableToReinvest > 0 
          ? ['Continue building surplus', 'Consider increasing income']
          : ['Focus on expense reduction', 'Increase dividend income', 'Review budget']
      }
    ]

    // Calculate weighted overall score
    const overallScore = metrics.reduce((sum, metric) => 
      sum + (metric.score * metric.weight), 0
    )

    const grade = overallScore >= 90 ? 'A+' :
                  overallScore >= 85 ? 'A' :
                  overallScore >= 80 ? 'B+' :
                  overallScore >= 75 ? 'B' :
                  overallScore >= 70 ? 'C+' :
                  overallScore >= 65 ? 'C' : 'D'

    const riskLevel = overallScore >= 85 ? 'Low' :
                     overallScore >= 70 ? 'Moderate' : 'High'

    const topRecommendations = metrics
      .filter(m => m.score < 85)
      .sort((a, b) => (a.score * a.weight) - (b.score * b.weight))
      .slice(0, 3)
      .flatMap(m => m.recommendations.slice(0, 1))

    return {
      overallScore,
      grade,
      metrics,
      topRecommendations,
      riskLevel
    }
  }

  const healthData = calculateStrategyHealth()

  const animatedValues = useStaggeredCountingAnimation(
    {
      overall: healthData.overallScore,
      tax: healthData.metrics[0].score,
      stability: healthData.metrics[1].score,
      risk: healthData.metrics[2].score,
      cashflow: healthData.metrics[3].score,
    },
    1000,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-yellow-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100'
    if (grade.startsWith('B')) return 'text-yellow-600 bg-yellow-100'
    if (grade.startsWith('C')) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

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
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Strategy Health Score
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive analysis of your dividend investment strategy
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-red-50 to-pink-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ${getScoreColor(healthData.overallScore)}`}>
              {Math.round(animatedValues.overall)}
            </div>
            <div className="text-sm sm:text-base text-slate-600 mb-2">Overall Score</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(healthData.grade)}`}>
              Grade: {healthData.grade}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-slate-600 mb-1">Risk Level</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              healthData.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
              healthData.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {healthData.riskLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="space-y-4 sm:space-y-6 mb-6">
        <h4 className="font-semibold text-slate-700">Health Metrics</h4>
        
        {healthData.metrics.map((metric, index) => (
          <div 
            key={metric.id}
            className={`group relative transition-all duration-300 cursor-pointer ${
              expandedMetric === metric.id ? 'ring-2 ring-blue-200' : ''
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => setExpandedMetric(
              expandedMetric === metric.id ? null : metric.id
            )}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all duration-300">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`p-2 rounded-lg ${metric.bg}`}>
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-slate-700">{metric.name}</span>
                    {metric.status === 'excellent' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {metric.status === 'poor' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  </div>
                  <p className="text-xs text-slate-500">{metric.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xl font-bold ${getScoreColor(metric.score)}`}>
                  {Math.round(
                    metric.id === 'tax-efficiency' ? animatedValues.tax :
                    metric.id === 'income-stability' ? animatedValues.stability :
                    metric.id === 'risk-balance' ? animatedValues.risk :
                    animatedValues.cashflow
                  )}
                </div>
                <div className="text-xs text-slate-500">out of 100</div>
              </div>
            </div>

            {expandedMetric === metric.id && (
              <div className="mt-2 p-4 bg-slate-50 rounded-lg">
                <h5 className="font-medium text-slate-700 mb-3">Recommendations</h5>
                <div className="space-y-2">
                  {metric.recommendations.map((recommendation, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-slate-600">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top Recommendations */}
      {healthData.topRecommendations.length > 0 && (
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl border border-blue-100">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-slate-700 mb-3">Top Improvement Areas</h4>
              <div className="space-y-2">
                {healthData.topRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-slate-600">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
      </SkeletonCardWrapper>
  )
}

// Wrap with error boundary
const StrategyHealthCard = () => (
  <WithErrorBoundary cardName="Strategy Health Monitor" showDetails={false}>
    <StrategyHealthCardComponent />
  </WithErrorBoundary>
)

export { StrategyHealthCard }
export default memo(StrategyHealthCard)