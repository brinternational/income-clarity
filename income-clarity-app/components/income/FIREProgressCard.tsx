'use client'

import { useState, useEffect, memo } from 'react'
import { Target, TrendingUp, Calendar, Zap, Trophy, Clock } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'

interface FIREData {
  currentPortfolioValue: number
  fireNumber: number
  fireProgress: number
  monthsToFire: number
  yearsToFire: number
  monthlyContribution: number
  coastFireAge: number
  currentAge: number
}

const FIREProgressCardComponent = () => {
  const { profileData, incomeClarityData, loading: profileLoading, error: profileError } = useUserProfile()
  const { portfolio, loading: portfolioLoading, error: portfolioError } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [localLoading, setLocalLoading] = useState(true)

  // Simulate initial data loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false)
    }, 800) // Slightly longer for complex calculations
    return () => clearTimeout(timer)
  }, [])

  // Calculate FIRE progress
  const calculateFIREData = (): FIREData => {
    const monthlyExpenses = incomeClarityData?.monthlyExpenses || 3200
    const fireNumber = monthlyExpenses * 12 * 25 // 25x annual expenses rule
    const currentPortfolioValue = portfolio?.totalValue || 125000
    const fireProgress = Math.min((currentPortfolioValue / fireNumber) * 100, 100)
    const availableToReinvest = Math.max(incomeClarityData?.availableToReinvest || 500, 100)
    
    // Calculate time to FIRE with 7% annual returns
    const monthlyReturn = 0.07 / 12
    const remainingAmount = fireNumber - currentPortfolioValue
    
    let monthsToFire = 0
    if (availableToReinvest > 0 && remainingAmount > 0) {
      // PMT calculation for future value
      const pv = currentPortfolioValue
      const fv = fireNumber
      const pmt = availableToReinvest
      
      // Approximate calculation
      monthsToFire = Math.log((fv * monthlyReturn + pmt) / (pv * monthlyReturn + pmt)) / Math.log(1 + monthlyReturn)
    }
    
    const yearsToFire = monthsToFire / 12
    const currentAge = 35 // Mock age
    const coastFireAge = currentAge + (yearsToFire * 0.7) // Coast FI earlier

    return {
      currentPortfolioValue,
      fireNumber,
      fireProgress,
      monthsToFire: Math.max(monthsToFire, 0),
      yearsToFire: Math.max(yearsToFire, 0),
      monthlyContribution: availableToReinvest,
      coastFireAge,
      currentAge
    }
  }

  const fireData = calculateFIREData()

  const animatedValues = useStaggeredCountingAnimation(
    {
      progress: fireData.fireProgress,
      fireNumber: fireData.fireNumber,
      current: fireData.currentPortfolioValue,
      years: fireData.yearsToFire,
      months: fireData.monthsToFire,
      contribution: fireData.monthlyContribution,
    },
    1200,
    200
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Handle errors from contexts
  if (profileError) {
    throw new Error(`Failed to load profile data: ${profileError}`)
  }
  if (portfolioError) {
    throw new Error(`Failed to load portfolio data: ${portfolioError}`)
  }

  const isLoading = profileLoading || portfolioLoading || localLoading

  const milestones = [
    { threshold: 25, label: 'Coast FI', achieved: fireData.fireProgress >= 25, icon: TrendingUp },
    { threshold: 50, label: 'Lean FI', achieved: fireData.fireProgress >= 50, icon: Target },
    { threshold: 75, label: 'Fat FI', achieved: fireData.fireProgress >= 75, icon: Zap },
    { threshold: 100, label: 'Full FI', achieved: fireData.fireProgress >= 100, icon: Trophy }
  ]

  return (
    <SkeletonCardWrapper 
      isLoading={isLoading} 
      cardType="fire"
      className={isVisible ? 'animate-slide-up' : 'opacity-0'}
    >
      <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
        isVisible ? 'animate-slide-up' : 'opacity-0'
      }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-foreground mb-1">
            FIRE Progress Tracker
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your journey to financial independence and early retirement
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-600" />
        </div>
      </div>

      {/* FIRE Progress Circle */}
      <div className="mb-6 sm:mb-8 flex justify-center">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          {/* Progress Circle SVG */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgb(241, 245, 249)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#fireGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - animatedValues.progress / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(239, 68, 68)" />
                <stop offset="50%" stopColor="rgb(245, 158, 11)" />
                <stop offset="100%" stopColor="rgb(34, 197, 94)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl sm:text-3xl font-bold text-foreground/90">
              {animatedValues.progress.toFixed(1)}%
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center">
              to FIRE
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-100">
          <div className="text-lg sm:text-xl font-bold text-green-600">
            ${Math.round(animatedValues.current / 1000)}K
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Current Portfolio</div>
        </div>
        
        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl border border-blue-100">
          <div className="text-lg sm:text-xl font-bold text-blue-600">
            ${Math.round(animatedValues.fireNumber / 1000)}K
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">FIRE Number</div>
        </div>
        
        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg sm:rounded-xl border border-purple-100">
          <div className="text-lg sm:text-xl font-bold text-purple-600 flex items-center justify-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{animatedValues.years > 50 ? '50+' : animatedValues.years.toFixed(1)}</span>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Years to FIRE</div>
        </div>
        
        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl border border-orange-100">
          <div className="text-lg sm:text-xl font-bold text-orange-600">
            ${Math.round(animatedValues.contribution).toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Monthly Contribution</div>
        </div>
      </div>

      {/* FIRE Milestones */}
      <div className="mb-6 sm:mb-8">
        <h4 className="font-semibold text-foreground/90 mb-4">FIRE Milestones</h4>
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.label}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                milestone.achieved 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-full ${
                  milestone.achieved 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-slate-100 text-muted-foreground'
                }`}>
                  <milestone.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`font-medium ${
                    milestone.achieved ? 'text-green-700' : 'text-muted-foreground'
                  }`}>
                    {milestone.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {milestone.threshold}% of FIRE number
                  </div>
                </div>
              </div>
              {milestone.achieved && (
                <div className="text-green-600">
                  <Trophy className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Acceleration Tip */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border border-indigo-100">
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground/90 mb-2">Acceleration Opportunity</h4>
            <p className="text-sm text-muted-foreground">
              {fireData.monthlyContribution < 1000 ? 
                'Increasing your monthly investment by $500 could reduce your time to FIRE by 3-5 years!' :
                'You\'re on an excellent savings trajectory! Consider tax optimization strategies to accelerate further.'
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
const FIREProgressCard = () => (
  <WithErrorBoundary cardName="FIRE Progress Tracker" showDetails={false}>
    <FIREProgressCardComponent />
  </WithErrorBoundary>
)

export { FIREProgressCard }
export default memo(FIREProgressCard)