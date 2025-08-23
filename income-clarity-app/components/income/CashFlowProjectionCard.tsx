'use client'

import { useState, useEffect, memo } from 'react'
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'
import { TrendingUp, Calendar, BarChart, AlertCircle, DollarSign, TrendingDown } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'

type IncomeViewMode = 'monthly' | 'annual'

interface CashFlowProjectionCardProps {
  viewMode?: IncomeViewMode;
}

interface ProjectionPeriod {
  label: string
  months: number
  active: boolean
}

interface CashFlowProjection {
  month: string
  income: number
  expenses: number
  netFlow: number
  cumulativeFlow: number
  isDividendMonth?: boolean
  seasonalAdjustment?: number
  confidence?: number
}

interface SeasonalEvent {
  month: number // 0-11 (Jan-Dec)
  name: string
  multiplier: number // 1.0 = no change, 1.2 = 20% increase
  type: 'expense' | 'income'
}

const CashFlowProjectionCardComponent = ({ viewMode = 'monthly' }: CashFlowProjectionCardProps) => {
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

  const [selectedPeriod, setSelectedPeriod] = useState<number>(6) // 6 months default
  const [isVisible, setIsVisible] = useState(false)

  // Seasonal events that affect cash flow
  const seasonalEvents: SeasonalEvent[] = [
    { month: 11, name: 'Holiday Spending', multiplier: 1.25, type: 'expense' }, // December
    { month: 3, name: 'Tax Payments', multiplier: 1.15, type: 'expense' }, // April
    { month: 2, name: 'Q1 Dividends', multiplier: 1.1, type: 'income' }, // March
    { month: 5, name: 'Q2 Dividends', multiplier: 1.1, type: 'income' }, // June
    { month: 8, name: 'Q3 Dividends', multiplier: 1.1, type: 'income' }, // September
    { month: 11, name: 'Q4 Dividends', multiplier: 1.1, type: 'income' }, // December
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

  // Calculate current month progress
  const getCurrentMonthProgress = () => {
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    const progressRatio = currentDay / daysInMonth
    
    const monthlyIncome = incomeClarityData?.netMonthly || 3825
    const monthlyExpenses = incomeClarityData?.monthlyExpenses || 3200
    const expectedNetFlow = monthlyIncome - monthlyExpenses
    
    // Apply seasonal adjustments for current month
    const currentSeasonalEvents = seasonalEvents.filter(event => event.month === now.getMonth())
    let adjustedNetFlow = expectedNetFlow
    
    currentSeasonalEvents.forEach(event => {
      if (event.type === 'expense') {
        adjustedNetFlow -= (monthlyExpenses * (event.multiplier - 1))
      } else {
        adjustedNetFlow += (monthlyIncome * (event.multiplier - 1))
      }
    })
    
    const projectedForMonth = adjustedNetFlow
    const daysRemaining = daysInMonth - currentDay
    
    return {
      projectedForMonth,
      daysRemaining,
      progressRatio,
      seasonalEvents: currentSeasonalEvents
    }
  }

  const periods: ProjectionPeriod[] = [
    { label: '3M', months: 3, active: selectedPeriod === 3 },
    { label: '6M', months: 6, active: selectedPeriod === 6 },
    { label: '12M', months: 12, active: selectedPeriod === 12 },
  ]

  // Generate cash flow projections with seasonal adjustments
  const generateProjections = (months: number): CashFlowProjection[] => {
    const monthlyIncome = incomeClarityData?.netMonthly || 3825
    const monthlyExpenses = incomeClarityData?.monthlyExpenses || 3200
    
    const projections: CashFlowProjection[] = []
    let cumulativeFlow = 0
    
    for (let i = 0; i < months; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() + i)
      const month = date.getMonth()
      
      // Start with base values
      let projectedIncome = monthlyIncome
      let projectedExpenses = monthlyExpenses
      
      // Apply seasonal adjustments
      const monthlySeasonalEvents = seasonalEvents.filter(event => event.month === month)
      let seasonalAdjustment = 0
      
      monthlySeasonalEvents.forEach(event => {
        if (event.type === 'expense') {
          const increase = monthlyExpenses * (event.multiplier - 1)
          projectedExpenses += increase
          seasonalAdjustment -= increase
        } else if (event.type === 'income') {
          const increase = monthlyIncome * (event.multiplier - 1)
          projectedIncome += increase
          seasonalAdjustment += increase
        }
      })
      
      // Add some realistic market variation (smaller than before since we have seasonal adjustments)
      const incomeVariation = (Math.random() - 0.5) * 0.05 // ±2.5% variation
      const expenseVariation = (Math.random() - 0.5) * 0.08 // ±4% variation
      
      projectedIncome *= (1 + incomeVariation)
      projectedExpenses *= (1 + expenseVariation)
      
      const netFlow = projectedIncome - projectedExpenses
      cumulativeFlow += netFlow
      
      // Determine confidence level (lower for farther months)
      const confidence = Math.max(0.6, 1 - (i * 0.1))
      
      // Check if it's a dividend month (quarterly)
      const isDividendMonth = [2, 5, 8, 11].includes(month) // Mar, Jun, Sep, Dec
      
      projections.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: projectedIncome,
        expenses: projectedExpenses,
        netFlow: netFlow,
        cumulativeFlow: cumulativeFlow,
        isDividendMonth,
        seasonalAdjustment,
        confidence
      })
    }
    
    return projections
  }

  const projections = generateProjections(selectedPeriod)
  const totalProjectedFlow = projections[projections.length - 1]?.cumulativeFlow || 0
  const avgMonthlyFlow = totalProjectedFlow / selectedPeriod
  const positiveMonths = projections.filter(p => p.netFlow > 0).length
  const negativeMonths = projections.filter(p => p.netFlow < 0).length
  const currentMonthProgress = getCurrentMonthProgress()
  
  // Enhanced zero-line crossing alerts
  const getZeroLineCrossingAlert = () => {
    const nextMonth = projections[0]
    const nextTwoMonths = projections.slice(0, 2)
    const hasNegativeNext = nextMonth?.netFlow < 0
    const hasNegativeSoon = nextTwoMonths.some(p => p.netFlow < 0)
    
    if (hasNegativeNext) {
      return {
        type: 'critical' as const,
        message: `⚠️ Projected to go negative next month (${nextMonth.month}): ${nextMonth.netFlow < 0 ? '-' : '+'}$${Math.abs(nextMonth.netFlow).toLocaleString()}`,
        icon: 'AlertCircle'
      }
    } else if (hasNegativeSoon) {
      const negativeMonth = nextTwoMonths.find(p => p.netFlow < 0)
      return {
        type: 'warning' as const,
        message: `⚠️ Cash flow may turn negative in ${negativeMonth?.month}: ${negativeMonth?.netFlow && negativeMonth.netFlow < 0 ? '-' : '+'}$${Math.abs(negativeMonth?.netFlow || 0).toLocaleString()}`,
        icon: 'TrendingDown'
      }
    } else if (totalProjectedFlow > 0) {
      return {
        type: 'positive' as const,
        message: `✅ Strong cash flow projected: All ${selectedPeriod} months positive`,
        icon: 'TrendingUp'
      }
    }
    return null
  }
  
  const zeroCrossingAlert = getZeroLineCrossingAlert()

  const animatedValues = useStaggeredCountingAnimation(
    {
      totalFlow: Math.abs(totalProjectedFlow),
      avgFlow: Math.abs(avgMonthlyFlow),
      positive: positiveMonths,
      negative: negativeMonths,
    },
    1000,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const maxAbsFlow = Math.max(...projections.map(p => Math.abs(p.netFlow)))

  return (
    <SkeletonCardWrapper 
      isLoading={isLoading} 
      cardType="income"
      className={isVisible ? 'animate-slide-up' : 'opacity-0'}
    >
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-foreground mb-1">
            Cash Flow Projection
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Forecast your income vs expenses over time
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <BarChart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-600" />
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg">
          <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
          <span className="text-sm font-medium text-muted-foreground px-2">Period:</span>
          {periods.map((period) => (
            <button
              key={period.label}
              onClick={() => setSelectedPeriod(period.months)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                period.active
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
              }`}
              aria-pressed={period.active}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Month Progress */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Current {viewMode === 'annual' ? 'Year' : 'Month'} Projection</span>
            </h4>
            <p className="text-2xl font-bold text-blue-700 mb-1">
              On track for {currentMonthProgress.projectedForMonth >= 0 ? '+' : '-'}${Math.abs(currentMonthProgress.projectedForMonth * formatIncomeValue(1).multiplier).toLocaleString()} this {viewMode === 'annual' ? 'year' : 'month'}
            </p>
            <p className="text-sm text-blue-600">
              {currentMonthProgress.daysRemaining} days remaining • {Math.round(currentMonthProgress.progressRatio * 100)}% through month
              {currentMonthProgress.seasonalEvents.length > 0 && (
                <span className="ml-2">• {currentMonthProgress.seasonalEvents[0].name} adjustment applied</span>
              )}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${currentMonthProgress.projectedForMonth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <DollarSign className={`w-5 h-5 ${currentMonthProgress.projectedForMonth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
      </div>

      {/* Zero-Line Crossing Alert */}
      {zeroCrossingAlert && (
        <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg border-2 ${
          zeroCrossingAlert.type === 'critical' 
            ? 'bg-red-50 border-red-200' 
            : zeroCrossingAlert.type === 'warning'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start space-x-3">
            {zeroCrossingAlert.type === 'critical' ? (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            ) : zeroCrossingAlert.type === 'warning' ? (
              <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            ) : (
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${
                zeroCrossingAlert.type === 'critical' 
                  ? 'text-red-700' 
                  : zeroCrossingAlert.type === 'warning'
                  ? 'text-yellow-700'
                  : 'text-green-700'
              }`}>
                {zeroCrossingAlert.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className={`text-center p-3 sm:p-4 rounded-lg border-2 ${
          totalProjectedFlow >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`text-lg sm:text-xl font-bold ${
            totalProjectedFlow >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalProjectedFlow >= 0 ? '+' : '-'}${Math.round(animatedValues.totalFlow * formatIncomeValue(1).multiplier).toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total Flow {formatIncomeValue(1).suffix}</div>
        </div>
        
        <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className={`text-lg sm:text-xl font-bold ${
            avgMonthlyFlow >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {avgMonthlyFlow >= 0 ? '+' : '-'}${Math.round(animatedValues.avgFlow * formatIncomeValue(1).multiplier).toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Avg {viewMode === 'annual' ? 'Annual' : 'Monthly'}</div>
        </div>
        
        <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg border-2 border-purple-200 col-span-2 sm:col-span-1">
          <div className="text-lg sm:text-xl font-bold text-purple-600">
            {Math.round(animatedValues.positive)}/{selectedPeriod}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Positive Months</div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground/90">Monthly Cash Flow Projections</h4>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-2 bg-green-200 rounded opacity-40"></div>
              <span>Confidence Band</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Dividend Month</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Seasonal Event</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {projections.map((projection, index) => (
            <div 
              key={projection.month}
              className="flex items-center space-x-3"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Month Label with Seasonal Indicators */}
              <div className="w-16 text-xs font-medium text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span>{projection.month}</span>
                  {projection.isDividendMonth && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" title="Dividend month" />
                  )}
                  {projection.seasonalAdjustment !== undefined && projection.seasonalAdjustment !== 0 && (
                    <div className={`w-2 h-2 rounded-full ${(projection.seasonalAdjustment || 0) > 0 ? 'bg-green-500' : 'bg-orange-500'}`} 
                         title={(projection.seasonalAdjustment || 0) > 0 ? 'Seasonal boost' : 'Seasonal adjustment'} />
                  )}
                </div>
              </div>
              
              {/* Flow Bar with Confidence Bands */}
              <div className="flex-1 relative h-6 bg-slate-100 rounded">
                {/* Zero line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300"></div>
                
                {/* Confidence band (uncertainty) */}
                <div 
                  className={`absolute top-0 bottom-0 rounded transition-all duration-1000 ease-out ${
                    projection.netFlow >= 0 
                      ? 'bg-green-200 left-1/2' 
                      : 'bg-red-200 right-1/2'
                  }`}
                  style={{ 
                    width: `${Math.min((Math.abs(projection.netFlow) / maxAbsFlow) * 50 * (1 + (1 - (projection.confidence || 0.8))), 50)}%`,
                    opacity: 0.4
                  }}
                ></div>
                
                {/* Actual flow bar */}
                <div 
                  className={`absolute top-0 bottom-0 rounded transition-all duration-1000 ease-out ${
                    projection.netFlow >= 0 
                      ? 'bg-green-500 left-1/2' 
                      : 'bg-red-500 right-1/2'
                  } ${projection.isDividendMonth ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
                  style={{ 
                    width: `${Math.min((Math.abs(projection.netFlow) / maxAbsFlow) * 50, 50)}%` 
                  }}
                ></div>
                
                {/* Dividend month indicator */}
                {projection.isDividendMonth && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Dividend payment month" />
                  </div>
                )}
              </div>
              
              {/* Amount */}
              <div className={`w-20 text-right text-sm font-medium ${
                projection.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {projection.netFlow >= 0 ? '+' : '-'}${Math.abs(projection.netFlow).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Analysis */}
      <div className={`p-4 sm:p-6 rounded-lg border-2 ${
        negativeMonths > selectedPeriod / 2 
          ? 'bg-red-50 border-red-200' 
          : negativeMonths > 0 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start space-x-3">
          {negativeMonths > selectedPeriod / 2 ? (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          ) : negativeMonths > 0 ? (
            <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          ) : (
            <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h4 className={`font-semibold mb-2 ${
              negativeMonths > selectedPeriod / 2 
                ? 'text-red-700' 
                : negativeMonths > 0 
                ? 'text-yellow-700' 
                : 'text-green-700'
            }`}>
              {negativeMonths > selectedPeriod / 2 
                ? 'Cash Flow Risk Alert' 
                : negativeMonths > 0 
                ? 'Moderate Cash Flow Variation' 
                : 'Strong Cash Flow Outlook'
              }
            </h4>
            <p className="text-sm text-muted-foreground">
              {negativeMonths > selectedPeriod / 2 
                ? 'You have multiple months with negative cash flow projected. Consider reducing expenses or increasing income.'
                : negativeMonths > 0 
                ? 'Some months show negative cash flow due to market variations. Build an emergency fund as a buffer.'
                : 'Your cash flow projection looks strong with consistent positive monthly surplus!'
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
const CashFlowProjectionCard = ({ viewMode = 'monthly' }: CashFlowProjectionCardProps) => (
  <WithErrorBoundary cardName="Cash Flow Projection" showDetails={false}>
    <CashFlowProjectionCardComponent viewMode={viewMode} />
  </WithErrorBoundary>
)

export default memo(CashFlowProjectionCard)