'use client'

import { useState, useEffect, memo } from 'react'
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'
import { TrendingUp, Calendar, Target, Zap, Award, BarChart3, Plus, Clock, DollarSign } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'

type IncomeViewMode = 'monthly' | 'annual'

interface IncomeProgressionCardProps {
  viewMode?: IncomeViewMode;
}

interface HistoricalData {
  month: string
  income: number
  milestone?: string
  milestoneDate?: string
  achieved?: boolean
  isProjected?: boolean
}

interface JourneyMilestone {
  id: string
  amount: number
  name: string
  achieved: boolean
  achievedDate?: string
  projected?: boolean
  projectedDate?: string
  color: string
}

interface ProgressionStats {
  currentIncome: number
  growthRate: number
  monthlyGrowthRate: number
  monthsTracked: number
  nextMilestone: number
  monthsToMilestone: number
  velocityRating: string
}

const IncomeProgressionCardComponent = ({ viewMode = 'monthly' }: IncomeProgressionCardProps) => {
  const { incomeClarityData, loading: profileLoading, error: profileError } = useUserProfile()
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

  const isLoading = profileLoading || localLoading

  const [isVisible, setIsVisible] = useState(false)
  const [timeRange, setTimeRange] = useState<12 | 24>(12)
  const [showCustomMilestone, setShowCustomMilestone] = useState(false)

  // Journey milestones - predefined progression path
  const journeyMilestones: JourneyMilestone[] = [
    { id: 'start', amount: 1000, name: 'Journey Start', achieved: true, achievedDate: 'Jan 2023', color: 'green' },
    { id: 'rent', amount: 3000, name: 'Rent Covered', achieved: true, achievedDate: 'March 2024', color: 'green' },
    { id: 'essentials', amount: 3500, name: 'Essentials Covered', achieved: true, achievedDate: 'May 2024', color: 'green' },
    { id: 'freedom', amount: 5000, name: 'Freedom Level', achieved: false, projectedDate: 'Feb 2025', color: 'blue' },
    { id: 'comfort', amount: 7500, name: 'Comfort Level', achieved: false, projectedDate: 'Aug 2025', color: 'gray' },
    { id: 'luxury', amount: 10000, name: 'Luxury Level', achieved: false, projectedDate: 'Jan 2026', color: 'gray' }
  ]

  // Format income values based on view mode
  const formatIncomeValue = (monthlyValue: number) => {
    if (viewMode === 'annual') {
      return {
        value: monthlyValue * 12,
        suffix: '/year',
        multiplier: 12
      };
    }
    return {
      value: monthlyValue,
      suffix: '/month',
      multiplier: 1
    };
  };

  // Generate historical progression data with projections
  const generateHistoricalData = (): HistoricalData[] => {
    const currentIncome = incomeClarityData?.netMonthly || 3825
    const months = timeRange
    const data: HistoricalData[] = []
    
    // Historical data (started lower and grew to current)
    const baseIncome = currentIncome * 0.6 // Started 40% lower for more dramatic progression
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      
      // Growth curve with realistic variation
      const growthFactor = 1 + ((months - 1 - i) / months) * 0.67 // More growth over time
      const variation = (Math.random() - 0.5) * 0.08 // Smaller variation for smoother curve
      const income = baseIncome * growthFactor * (1 + variation)
      
      // Check for milestone achievements with dates
      let milestone = undefined
      let milestoneDate = undefined
      let achieved = false
      
      if (income >= 1000 && baseIncome * growthFactor < 1000) {
        milestone = 'Journey Start'
        milestoneDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        achieved = true
      }
      if (income >= 3000 && baseIncome * growthFactor < 3000) {
        milestone = 'Rent Covered'
        milestoneDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        achieved = true
      }
      if (income >= 3500 && baseIncome * growthFactor < 3500) {
        milestone = 'Essentials Covered'
        milestoneDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        achieved = true
      }
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: income,
        milestone,
        milestoneDate,
        achieved,
        isProjected: false
      })
    }

    // Add 6 months of projected data
    const monthlyGrowth = data.length > 1 ? (data[data.length - 1].income - data[0].income) / data.length : 100
    
    for (let i = 1; i <= 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      const projectedIncome = currentIncome + (monthlyGrowth * i)
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: projectedIncome,
        isProjected: true
      })
    }
    
    return data
  }

  const historicalData = generateHistoricalData()

  // Calculate progression statistics with enhanced metrics
  const calculateProgressionStats = (): ProgressionStats => {
    const historicalOnly = historicalData.filter(d => !d.isProjected)
    const currentIncome = historicalOnly[historicalOnly.length - 1]?.income || 0
    const startIncome = historicalOnly[0]?.income || 0
    const growthRate = startIncome > 0 ? ((currentIncome - startIncome) / startIncome) * 100 : 0
    
    // Calculate monthly growth rate in dollars
    const monthlyGrowthRate = historicalOnly.length > 1 ? 
      (currentIncome - startIncome) / historicalOnly.length : 0
    
    // Next milestone from journey milestones
    const nextMilestone = journeyMilestones.find(m => !m.achieved)?.amount || 10000
    
    // Estimate months to next milestone
    const incomeGap = nextMilestone - currentIncome
    const monthsToMilestone = monthlyGrowthRate > 0 ? 
      Math.ceil(incomeGap / monthlyGrowthRate) : 99
    
    // Enhanced velocity rating based on monthly dollar growth
    const velocityRating = monthlyGrowthRate > 200 ? 'Excellent' : 
                          monthlyGrowthRate > 100 ? 'Good' : 
                          monthlyGrowthRate > 50 ? 'Steady' : 'Slow'
    
    return {
      currentIncome,
      growthRate,
      monthlyGrowthRate,
      monthsTracked: historicalOnly.length,
      nextMilestone,
      monthsToMilestone: Math.min(monthsToMilestone, 99),
      velocityRating
    }
  }

  const stats = calculateProgressionStats()

  const animatedValues = useStaggeredCountingAnimation(
    {
      current: stats.currentIncome,
      growth: stats.growthRate,
      milestone: stats.nextMilestone,
      months: stats.monthsToMilestone,
      monthlyGrowth: stats.monthlyGrowthRate,
    },
    1200,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const maxIncome = Math.max(...historicalData.map(d => d.income))
  const minIncome = Math.min(...historicalData.map(d => d.income))
  const range = maxIncome - minIncome

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'Excellent': return 'text-green-600'
      case 'Good': return 'text-blue-600'
      case 'Steady': return 'text-yellow-600'
      default: return 'text-slate-600'
    }
  }

  const getVelocityBg = (velocity: string) => {
    switch (velocity) {
      case 'Excellent': return 'bg-green-50 border-green-200'
      case 'Good': return 'bg-blue-50 border-blue-200'
      case 'Steady': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-slate-50 border-slate-200'
    }
  }

  return (
    <SkeletonCardWrapper 
      isLoading={isLoading} 
      cardType="income"
      className={isVisible ? 'animate-slide-up' : 'opacity-0'}
    >
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header with Time Range Toggle */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Income Progression Journey
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your path from $1k to $3k to $5k and beyond
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Time Range Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setTimeRange(12)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                timeRange === 12 
                  ? 'bg-white text-slate-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              12M
            </button>
            <button
              onClick={() => setTimeRange(24)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                timeRange === 24 
                  ? 'bg-white text-slate-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              24M
            </button>
          </div>
          <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg sm:rounded-xl flex-shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Journey Milestones Overview */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-700 flex items-center space-x-2">
            <Target className="w-4 h-4 text-slate-500" />
            <span>Journey Milestones</span>
          </h4>
          <button
            onClick={() => setShowCustomMilestone(!showCustomMilestone)}
            className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Custom</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {journeyMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm ${
                milestone.achieved
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : milestone.color === 'blue'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                milestone.achieved ? 'bg-green-500' : 
                milestone.color === 'blue' ? 'bg-blue-500' : 'bg-slate-400'
              }`} />
              <span className="font-medium">${milestone.amount.toLocaleString()}</span>
              <span className="text-xs opacity-75">
                {milestone.achieved ? milestone.achievedDate : milestone.projectedDate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
          <div className="text-lg sm:text-xl font-bold text-green-600">
            ${Math.round(animatedValues.current * formatIncomeValue(1).multiplier).toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">Current {viewMode === 'annual' ? 'Annual' : 'Monthly'}</div>
        </div>
        
        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
          <div className="text-lg sm:text-xl font-bold text-blue-600">
            +${Math.round(animatedValues.monthlyGrowth * formatIncomeValue(1).multiplier).toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">{viewMode === 'annual' ? 'Annual' : 'Monthly'} Growth</div>
        </div>
        
        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
          <div className="text-lg sm:text-xl font-bold text-purple-600">
            ${Math.round(animatedValues.milestone * formatIncomeValue(1).multiplier).toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">Next Milestone {formatIncomeValue(1).suffix}</div>
        </div>
        
        <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
          <div className="text-lg sm:text-xl font-bold text-orange-600">
            {Math.round(animatedValues.months)}m
          </div>
          <div className="text-xs sm:text-sm text-slate-600">Est. Time to Goal</div>
        </div>
      </div>

      {/* Income Progression Chart with Projections */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-700 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>{timeRange}-Month Income Journey</span>
          </h4>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-2 bg-gradient-to-t from-blue-500 to-green-500 rounded-sm"></div>
              <span>Historical</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-2 bg-gradient-to-t from-slate-300 to-slate-400 rounded-sm opacity-60"></div>
              <span>Projected</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-40 sm:h-48">
          <div className="absolute inset-0 flex items-end justify-between space-x-1">
            {historicalData.map((data, index) => {
              const height = range > 0 ? ((data.income - minIncome) / range) * 100 : 0
              const isProjected = data.isProjected
              
              return (
                <div 
                  key={`${data.month}-${index}`}
                  className="flex-1 flex flex-col items-center"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Milestone marker with enhanced styling */}
                  {data.milestone && !isProjected && (
                    <div className="mb-2 relative group">
                      <div className={`p-1.5 rounded-full ${
                        data.achieved 
                          ? 'bg-green-100 ring-2 ring-green-300' 
                          : 'bg-yellow-100 ring-2 ring-yellow-300'
                      }`}>
                        <Award className={`w-3 h-3 ${
                          data.achieved ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap px-2 py-1 rounded shadow-sm ${
                        data.achieved 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        <div className="font-semibold">{data.milestone}</div>
                        {data.milestoneDate && (
                          <div className="text-xs opacity-75">{data.milestoneDate}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Income bar with different styles for historical vs projected */}
                  <div 
                    className={`w-full rounded-t transition-all duration-1000 ease-out mb-1 ${
                      isProjected 
                        ? 'bg-gradient-to-t from-slate-300 to-slate-400 opacity-60 border-2 border-dashed border-slate-300' 
                        : 'bg-gradient-to-t from-blue-500 to-green-500 shadow-sm'
                    }`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    {/* Income value on hover */}
                    <div className="opacity-0 hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ${Math.round(data.income).toLocaleString()}
                      {isProjected && <span className="text-slate-300"> (projected)</span>}
                    </div>
                  </div>
                  
                  {/* Month label */}
                  <div className={`text-xs text-center ${
                    isProjected ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {data.month}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Current month divider line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-blue-400 opacity-50"
            style={{ 
              left: `${((timeRange / (timeRange + 6)) * 100)}%` 
            }}
          >
            <div className="absolute -top-4 -left-6 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
              Now
            </div>
          </div>
        </div>
      </div>

      {/* Growth Velocity Assessment */}
      <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border-2 ${getVelocityBg(stats.velocityRating)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className={`w-5 h-5 ${getVelocityColor(stats.velocityRating)}`} />
            <span className={`font-semibold ${getVelocityColor(stats.velocityRating)}`}>
              Growth Velocity: {stats.velocityRating}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              stats.velocityRating === 'Excellent' ? 'bg-green-100 text-green-800' :
              stats.velocityRating === 'Good' ? 'bg-blue-100 text-blue-800' :
              stats.velocityRating === 'Steady' ? 'bg-yellow-100 text-yellow-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              +${Math.round(stats.monthlyGrowthRate)}/mo
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              stats.velocityRating === 'Excellent' ? 'bg-green-100 text-green-800' :
              stats.velocityRating === 'Good' ? 'bg-blue-100 text-blue-800' :
              stats.velocityRating === 'Steady' ? 'bg-yellow-100 text-yellow-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              {stats.growthRate.toFixed(1)}% Annual
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          {stats.velocityRating === 'Excellent' ? 
            `Outstanding growth rate of $${Math.round(stats.monthlyGrowthRate)}/month! You're accelerating toward financial independence.` :
            stats.velocityRating === 'Good' ?
            `Strong growth trajectory at $${Math.round(stats.monthlyGrowthRate)}/month. Consider increasing reinvestment to accelerate further.` :
            stats.velocityRating === 'Steady' ?
            `Consistent progress at $${Math.round(stats.monthlyGrowthRate)}/month. Look for opportunities to boost dividend-paying investments.` :
            `Growth of $${Math.round(stats.monthlyGrowthRate)}/month is slower than optimal. Focus on increasing your portfolio allocation.`
          }
        </p>
      </div>

      {/* Next Milestone Projection */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border border-indigo-100">
        <div className="flex items-start space-x-3">
          <Target className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-slate-700 mb-2 flex items-center space-x-2">
              <span>Next Milestone Projection</span>
              <Calendar className="w-4 h-4 text-slate-500" />
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-2">
                  At your current growth rate of <strong>+${Math.round(stats.monthlyGrowthRate)}/month</strong>, you'll reach your next milestone in approximately <strong>{stats.monthsToMilestone} months</strong>.
                </p>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>• Current: ${Math.round(stats.currentIncome).toLocaleString()}</span>
                  <span>• Gap: ${Math.round(stats.nextMilestone - stats.currentIncome).toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-center">
                  <div className="text-xl font-bold text-indigo-600">${stats.nextMilestone.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mb-1">Target Amount</div>
                  <div className="text-sm font-medium text-slate-700">
                    {new Date(Date.now() + stats.monthsToMilestone * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-slate-500">Projected Achievement</div>
                </div>
              </div>
            </div>
            
            {/* Progress bar to next milestone */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Progress to Next Milestone</span>
                <span>{Math.round(((stats.currentIncome - (journeyMilestones.find(m => m.achieved && m.amount < stats.currentIncome)?.amount || 0)) / (stats.nextMilestone - (journeyMilestones.find(m => m.achieved && m.amount < stats.currentIncome)?.amount || 0))) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.round(((stats.currentIncome - (journeyMilestones.find(m => m.achieved && m.amount < stats.currentIncome)?.amount || 0)) / (stats.nextMilestone - (journeyMilestones.find(m => m.achieved && m.amount < stats.currentIncome)?.amount || 0))) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Acceleration tips */}
            <div className="text-xs text-slate-500 bg-white p-2 rounded border-l-2 border-indigo-200">
              <strong>💡 Acceleration tip:</strong> To reach this milestone faster, consider increasing your dividend reinvestment by 10% or adding $100-200/month to dividend-paying stocks.
            </div>
          </div>
        </div>
      </div>
    </div>
      </SkeletonCardWrapper>
  )
}

// Wrap with error boundary
const IncomeProgressionCard = ({ viewMode = 'monthly' }: IncomeProgressionCardProps) => (
  <WithErrorBoundary cardName="Income Progression" showDetails={false}>
    <IncomeProgressionCardComponent viewMode={viewMode} />
  </WithErrorBoundary>
)

export default memo(IncomeProgressionCard)