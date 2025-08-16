'use client'

import { useState, useEffect, memo } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Target, Zap, Calculator, Globe } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useExpense } from '@/contexts/ExpenseContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface IncomeClarityData {
  grossMonthly: number
  taxOwed: number
  netMonthly: number
  monthlyExpenses: number
  availableToReinvest: number
  aboveZeroLine: boolean
  taxRate: number
  location: string
}

const IncomeSummaryComponent = () => {
  const { profileData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const { totalMonthlyExpenses } = useExpense()
  const [isVisible, setIsVisible] = useState(false)

  // Calculate comprehensive income data
  const calculateIncomeData = (): IncomeClarityData => {
    const grossMonthly = portfolio?.monthlyGrossIncome || 0
    const federalRate = profileData?.taxInfo?.federalRate || 0.22
    const stateRate = profileData?.taxInfo?.stateRate || 0.05
    const totalTaxRate = federalRate + stateRate
    const location = profileData?.location?.state || 'Unknown'
    
    const taxOwed = grossMonthly * totalTaxRate
    const netMonthly = grossMonthly - taxOwed
    const monthlyExpenses = totalMonthlyExpenses || 0
    const availableToReinvest = netMonthly - monthlyExpenses
    const aboveZeroLine = availableToReinvest > 0

    return {
      grossMonthly,
      taxOwed,
      netMonthly,
      monthlyExpenses,
      availableToReinvest,
      aboveZeroLine,
      taxRate: totalTaxRate * 100,
      location
    }
  }

  const clarityData = calculateIncomeData()

  // Use optimized animation system
  const animatedValues = useStaggeredCountingAnimation(
    {
      gross: clarityData.grossMonthly,
      tax: clarityData.taxOwed,
      net: clarityData.netMonthly,
      expenses: clarityData.monthlyExpenses,
      available: Math.abs(clarityData.availableToReinvest),
    },
    1200,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const waterfallSteps = [
    {
      label: 'Monthly Dividend Income',
      value: Math.round(animatedValues.gross),
      actualValue: clarityData.grossMonthly,
      type: 'positive' as const,
      icon: DollarSign,
      description: 'Total monthly dividends from your portfolio'
    },
    {
      label: `Tax Liability (${clarityData.taxRate.toFixed(1)}%)`,
      value: Math.round(animatedValues.tax),
      actualValue: clarityData.taxOwed,
      type: 'negative' as const,
      icon: Calculator,
      description: `Federal and ${clarityData.location} state taxes`
    },
    {
      label: 'Net After-Tax Income',
      value: Math.round(animatedValues.net),
      actualValue: clarityData.netMonthly,
      type: 'milestone' as const,
      icon: Target,
      description: 'Your spendable dividend income'
    },
    {
      label: 'Monthly Living Expenses',
      value: Math.round(animatedValues.expenses),
      actualValue: clarityData.monthlyExpenses,
      type: 'negative' as const,
      icon: null,
      description: 'All tracked monthly expenses'
    }
  ]

  return (
    <div className={`premium-card hover-lift animate-on-mount p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* PROMINENT Zero Line Status - Most Important Metric */}
      <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 ${
        clarityData.aboveZeroLine 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100/50' 
          : clarityData.availableToReinvest === 0
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-yellow-100/50'
          : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-red-100/50'
      } shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 sm:p-3 rounded-full ${
              clarityData.aboveZeroLine 
                ? 'bg-green-100 text-green-700' 
                : clarityData.availableToReinvest === 0
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            } transition-all duration-300`}>
              {clarityData.aboveZeroLine ? (
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : clarityData.availableToReinvest === 0 ? (
                <Target className="w-6 h-6 sm:w-8 sm:h-8" />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />
              )}
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                clarityData.aboveZeroLine 
                  ? 'text-green-800' 
                  : clarityData.availableToReinvest === 0
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {clarityData.aboveZeroLine 
                  ? 'ABOVE ZERO LINE' 
                  : clarityData.availableToReinvest === 0
                  ? 'BREAKING EVEN'
                  : 'BELOW ZERO LINE'
                }
              </h2>
              <p className={`text-sm sm:text-base font-medium ${
                clarityData.aboveZeroLine 
                  ? 'text-green-700' 
                  : clarityData.availableToReinvest === 0
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                {clarityData.aboveZeroLine 
                  ? 'Your dividend income covers all expenses with surplus!' 
                  : clarityData.availableToReinvest === 0
                  ? 'Your dividend income exactly covers monthly expenses'
                  : 'Your dividend income does not yet cover all monthly expenses'
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
              clarityData.aboveZeroLine 
                ? 'text-green-600' 
                : clarityData.availableToReinvest === 0
                ? 'text-yellow-600'
                : 'text-red-600'
            }`} role="status" aria-live="polite">
              {clarityData.aboveZeroLine ? '+' : clarityData.availableToReinvest === 0 ? '±' : '-'}${Math.round(Math.abs(animatedValues.available)).toLocaleString()}
            </div>
            <div className={`text-sm sm:text-base font-semibold mt-1 ${
              clarityData.aboveZeroLine 
                ? 'text-green-600' 
                : clarityData.availableToReinvest === 0
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {clarityData.aboveZeroLine 
                ? 'Monthly Surplus' 
                : clarityData.availableToReinvest === 0
                ? 'Break Even'
                : 'Monthly Shortfall'
              }
            </div>
          </div>
        </div>
        
        {/* Financial Health Progress Bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-medium text-slate-600 flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Financial Independence Progress</span>
          </span>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            clarityData.aboveZeroLine 
              ? 'bg-green-100 text-green-800' 
              : clarityData.availableToReinvest === 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {clarityData.aboveZeroLine 
              ? 'FINANCIALLY FREE' 
              : clarityData.availableToReinvest === 0
              ? 'BREAK EVEN'
              : 'BUILDING WEALTH'
            }
          </div>
        </div>
      </div>

      {/* Income Analysis Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Income Analysis Dashboard
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Your complete dividend income waterfall with tax-optimized calculations
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-600" />
        </div>
      </div>
      
      {/* Enhanced waterfall visualization */}
      <div className="space-y-4 sm:space-y-6">
        {waterfallSteps.map((step, index) => (
          <div 
            key={step.label}
            className={`group relative transition-all duration-500 ease-premium ${
              index === 0 ? 'animate-fade-in' : ''
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-300 touch-friendly">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-0">
                {step.icon && (
                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                    step.type === 'positive' ? 'bg-green-50 text-green-600' :
                    step.type === 'milestone' ? 'bg-blue-50 text-blue-600' :
                    step.type === 'negative' ? 'bg-red-50 text-red-600' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    <step.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm sm:text-base font-medium ${
                      step.type === 'milestone' ? 'text-slate-800 sm:text-lg' : 'text-slate-700'
                    }`}>
                      {step.label}
                    </span>
                    {step.type === 'milestone' && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-600 transition-colors leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className={`currency-display font-semibold text-lg sm:text-xl animate-currency ${
                  step.type === 'positive' ? 'text-green-600' :
                  step.type === 'negative' ? 'text-red-600' :
                  step.type === 'milestone' ? 'text-blue-600' :
                  'text-slate-800'
                }`}>
                  {step.type === 'negative' ? '-' : ''}${step.value.toLocaleString()}
                </div>
                {step.value !== step.actualValue && (
                  <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
                    <div 
                      className="h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((step.value / step.actualValue) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Annual Projections */}
      {clarityData.grossMonthly > 0 && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg sm:rounded-xl border border-slate-100">
          <h4 className="font-semibold text-slate-700 mb-4">Annual Projections</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-green-600 text-lg sm:text-xl">
                ${(clarityData.grossMonthly * 12).toLocaleString()}
              </div>
              <div className="text-slate-600">Gross Income</div>
            </div>
            <div>
              <div className="font-bold text-red-600 text-lg sm:text-xl">
                ${(clarityData.taxOwed * 12).toLocaleString()}
              </div>
              <div className="text-slate-600">Tax Liability</div>
            </div>
            <div>
              <div className="font-bold text-blue-600 text-lg sm:text-xl">
                ${(clarityData.netMonthly * 12).toLocaleString()}
              </div>
              <div className="text-slate-600">After-Tax Income</div>
            </div>
            <div>
              <div className={`font-bold text-lg sm:text-xl ${
                clarityData.aboveZeroLine ? 'text-green-600' : 'text-red-600'
              }`}>
                {clarityData.aboveZeroLine ? '+' : '-'}${(Math.abs(clarityData.availableToReinvest) * 12).toLocaleString()}
              </div>
              <div className="text-slate-600">
                {clarityData.aboveZeroLine ? 'Reinvestment' : 'Shortfall'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
export const IncomeSummary = memo(IncomeSummaryComponent)