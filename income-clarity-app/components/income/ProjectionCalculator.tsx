'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useExpense } from '@/contexts/ExpenseContext'
import { Calculator, Target, TrendingUp, DollarSign, Sliders, Info } from 'lucide-react'

interface ProjectionInputs {
  monthlyInvestment: number
  dividendGrowthRate: number
  averageYield: number
  reinvestDividends: boolean
}

interface ProjectionResult {
  month: number
  portfolioValue: number
  monthlyIncome: number
  cumulativeInvestment: number
  totalReturn: number
  targetProgress: number
}

interface Milestone {
  id: string
  name: string
  targetIncome: number
  color: string
  description: string
}

const ProjectionCalculatorComponent = () => {
  const { portfolio } = usePortfolio()
  const { profileData } = useUserProfile()
  const { totalMonthlyExpenses } = useExpense()
  
  const [inputs, setInputs] = useState<ProjectionInputs>({
    monthlyInvestment: 1000,
    dividendGrowthRate: 5, // 5% annually
    averageYield: 4, // 4% annually
    reinvestDividends: true
  })
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<3 | 6 | 12 | 24 | 60>(12)
  const [targetIncomeGoal, setTargetIncomeGoal] = useState(totalMonthlyExpenses || 3000)

  // Predefined milestones
  const milestones: Milestone[] = [
    {
      id: 'utilities',
      name: 'Cover Utilities',
      targetIncome: 300,
      color: '#10b981',
      description: 'Basic utility bills covered'
    },
    {
      id: 'insurance',
      name: 'Insurance Covered',
      targetIncome: 800,
      color: '#3b82f6',
      description: 'Health & car insurance'
    },
    {
      id: 'groceries',
      name: 'Groceries Covered',
      targetIncome: 1500,
      color: '#8b5cf6',
      description: 'Food and necessities'
    },
    {
      id: 'housing',
      name: 'Housing Covered',
      targetIncome: targetIncomeGoal || 3000,
      color: '#f59e0b',
      description: 'Complete housing costs'
    },
    {
      id: 'financial-freedom',
      name: 'Financial Freedom',
      targetIncome: (targetIncomeGoal || 3000) * 1.25,
      color: '#ef4444',
      description: 'All expenses + buffer'
    }
  ]

  // Calculate month-by-month projections
  const projections = useMemo((): ProjectionResult[] => {
    const currentPortfolioValue = (portfolio?.totalValue || 0)
    const currentMonthlyIncome = (portfolio?.monthlyGrossIncome || 0)
    const results: ProjectionResult[] = []
    
    let portfolioValue = currentPortfolioValue
    let monthlyIncome = currentMonthlyIncome
    let cumulativeInvestment = 0
    
    const monthlyGrowthRate = inputs.dividendGrowthRate / 100 / 12 // Convert annual % to monthly decimal
    const monthlyYield = inputs.averageYield / 100 / 12 // Convert annual % to monthly decimal
    
    for (let month = 1; month <= selectedTimeframe; month++) {
      // Add monthly investment
      portfolioValue += inputs.monthlyInvestment
      cumulativeInvestment += inputs.monthlyInvestment
      
      // Calculate dividend income for this month
      monthlyIncome = portfolioValue * monthlyYield
      
      // Reinvest dividends if selected
      if (inputs.reinvestDividends) {
        portfolioValue += monthlyIncome
      }
      
      // Apply dividend growth (companies increasing their dividends)
      monthlyIncome *= (1 + monthlyGrowthRate)
      
      // Calculate total return
      const totalReturn = portfolioValue - currentPortfolioValue - cumulativeInvestment
      
      // Calculate progress toward income goal
      const targetProgress = Math.min((monthlyIncome / targetIncomeGoal) * 100, 100)
      
      results.push({
        month,
        portfolioValue,
        monthlyIncome,
        cumulativeInvestment,
        totalReturn,
        targetProgress
      })
    }
    
    return results
  }, [portfolio, inputs, selectedTimeframe, targetIncomeGoal])

  // Find when milestones will be achieved
  const milestoneAchievement = useMemo(() => {
    return milestones.map(milestone => {
      const achievementMonth = projections.findIndex(p => p.monthlyIncome >= milestone.targetIncome)
      return {
        ...milestone,
        achievementMonth: achievementMonth >= 0 ? achievementMonth + 1 : null,
        currentProgress: Math.min((projections[projections.length - 1]?.monthlyIncome || 0) / milestone.targetIncome * 100, 100)
      }
    })
  }, [milestones, projections])

  // Summary statistics
  const summary = useMemo(() => {
    if (projections.length === 0) return null
    
    const finalProjection = projections[projections.length - 1]
    const initialIncome = portfolio?.monthlyGrossIncome || 0
    const incomeGrowth = initialIncome > 0 ? ((finalProjection.monthlyIncome - initialIncome) / initialIncome) * 100 : 0
    
    return {
      finalPortfolioValue: finalProjection.portfolioValue,
      finalMonthlyIncome: finalProjection.monthlyIncome,
      totalInvestment: finalProjection.cumulativeInvestment,
      totalReturn: finalProjection.totalReturn,
      incomeGrowth,
      monthsToGoal: projections.findIndex(p => p.monthlyIncome >= targetIncomeGoal) + 1
    }
  }, [projections, portfolio, targetIncomeGoal])

  const handleInputChange = useCallback((field: keyof ProjectionInputs, value: number | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatMonths = (months: number) => {
    if (months <= 12) return `${months} months`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Income Projections</h2>
              <p className="text-gray-600">Calculate your path to financial independence</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(Number(e.target.value) as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>1 Year</option>
              <option value={24}>2 Years</option>
              <option value={60}>5 Years</option>
            </select>
          </div>
        </div>

        {/* Quick Summary */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(summary.finalMonthlyIncome)}
              </div>
              <div className="text-xs text-gray-600">Monthly Income</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(summary.finalPortfolioValue)}
              </div>
              <div className="text-xs text-gray-600">Portfolio Value</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <div className={`text-xl font-bold ${summary.incomeGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                +{summary.incomeGrowth.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Income Growth</div>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-600">
                {summary.monthsToGoal > 0 && summary.monthsToGoal <= selectedTimeframe 
                  ? formatMonths(summary.monthsToGoal)
                  : '> ' + formatMonths(selectedTimeframe)
                }
              </div>
              <div className="text-xs text-gray-600">To Goal</div>
            </div>
          </div>
        )}
      </div>

      {/* Input Controls */}
      <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Sliders className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Projection Settings</h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Monthly Investment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>Monthly Investment</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={inputs.monthlyInvestment}
                onChange={(e) => handleInputChange('monthlyInvestment', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Dividend Growth Rate */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>Dividend Growth</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputs.dividendGrowthRate}
                onChange={(e) => handleInputChange('dividendGrowthRate', Number(e.target.value))}
                className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                max="20"
                step="0.5"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {/* Average Yield */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>Portfolio Yield</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputs.averageYield}
                onChange={(e) => handleInputChange('averageYield', Number(e.target.value))}
                className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                max="15"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          {/* Income Goal */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>Income Goal</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={targetIncomeGoal}
                onChange={(e) => setTargetIncomeGoal(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="100"
              />
            </div>
          </div>
        </div>

        {/* Reinvest Toggle */}
        <div className="flex items-center space-x-3 mt-4 p-3 bg-white rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="reinvestDividends"
            checked={inputs.reinvestDividends}
            onChange={(e) => handleInputChange('reinvestDividends', e.target.checked)}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="reinvestDividends" className="flex-1 flex items-center justify-between text-sm font-medium text-gray-700">
            <span>Automatically reinvest all dividends</span>
            <div className="flex items-center space-x-1 text-gray-500">
              <Info className="w-4 h-4" />
              <span className="text-xs">Compounds growth</span>
            </div>
          </label>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Milestones</h3>
        <div className="space-y-3">
          {milestoneAchievement.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: milestone.color }}
                />
                <div>
                  <div className="font-medium text-gray-900">{milestone.name}</div>
                  <div className="text-sm text-gray-600">{milestone.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(milestone.targetIncome)}
                </div>
                <div className="text-sm text-gray-600">
                  {milestone.achievementMonth 
                    ? `Month ${milestone.achievementMonth}`
                    : `${milestone.currentProgress.toFixed(0)}% there`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Progress Chart */}
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Projection Chart</h3>
        
        <div className="relative" style={{ height: '200px' }}>
          {/* Chart area */}
          <div className="h-full flex items-end justify-between space-x-1">
            {projections.filter((_, index) => index % Math.ceil(projections.length / 12) === 0).map((point, index) => {
              const maxIncome = Math.max(...projections.map(p => p.monthlyIncome))
              const height = (point.monthlyIncome / maxIncome) * 100
              
              return (
                <div key={point.month} className="flex-1 flex flex-col items-center space-y-2">
                  {/* Bar */}
                  <div
                    className="w-full bg-green-500 rounded-t-lg transition-all duration-500 hover:bg-green-600 cursor-pointer relative group"
                    style={{ 
                      height: `${height}%`,
                      minHeight: '4px'
                    }}
                    title={`Month ${point.month}: ${formatCurrency(point.monthlyIncome)}`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-10">
                      <div className="font-semibold">Month {point.month}</div>
                      <div>Income: {formatCurrency(point.monthlyIncome)}</div>
                      <div>Portfolio: {formatCurrency(point.portfolioValue)}</div>
                      <div>Progress: {point.targetProgress.toFixed(0)}%</div>
                    </div>
                  </div>

                  {/* Month label */}
                  <div className="text-xs text-gray-600">
                    {point.month}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Goal line */}
          {summary && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-red-400 pointer-events-none"
              style={{ 
                bottom: `${(targetIncomeGoal / Math.max(...projections.map(p => p.monthlyIncome))) * 100}%` 
              }}
            >
              <div className="absolute -top-6 left-0 text-xs text-red-600 font-medium bg-white px-2 py-1 rounded">
                Goal: {formatCurrency(targetIncomeGoal)}
              </div>
            </div>
          )}
        </div>

        {/* Key Insights */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-semibold text-blue-800 mb-2">Portfolio Growth</div>
            <div className="text-sm text-blue-700">
              With {formatCurrency(inputs.monthlyInvestment)}/month investment and {inputs.reinvestDividends ? 'dividend reinvestment' : 'no reinvestment'}, 
              your portfolio will grow to <strong>{formatCurrency(summary?.finalPortfolioValue || 0)}</strong> in {formatMonths(selectedTimeframe)}.
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="font-semibold text-green-800 mb-2">Income Timeline</div>
            <div className="text-sm text-green-700">
              {summary?.monthsToGoal && summary.monthsToGoal <= selectedTimeframe 
                ? `You'll reach your income goal of ${formatCurrency(targetIncomeGoal)} in approximately ${formatMonths(summary.monthsToGoal)}.`
                : `To reach ${formatCurrency(targetIncomeGoal)}/month, you'll need more than ${formatMonths(selectedTimeframe)} with current settings.`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProjectionCalculator = memo(ProjectionCalculatorComponent)