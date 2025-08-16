'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Calendar, Target, Zap, Award, BarChart3, ArrowUp, ArrowDown } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface MonthlyYTDData {
  month: string
  monthlyIncome: number
  cumulativeIncome: number
  target: number
  percentageOfTarget: number
}

interface YTDIncomeData {
  totalYTDIncome: number
  currentMonth: string
  annualTarget: number
  percentageOfTarget: number
  monthlyAverage: number
  monthlyData: MonthlyYTDData[]
  isOnTrack: boolean
  projectedAnnual: number
  monthsRemaining: number
  lastMonthGrowth: number
}

const YTDIncomeAccumulatorComponent = () => {
  const { incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState(false)

  // Calculate YTD income data
  const calculateYTDData = (): YTDIncomeData => {
    if (!incomeClarityData || !portfolio) {
      return {
        totalYTDIncome: 0,
        currentMonth: new Date().toLocaleString('default', { month: 'long' }),
        annualTarget: 50000,
        percentageOfTarget: 0,
        monthlyAverage: 0,
        monthlyData: [],
        isOnTrack: false,
        projectedAnnual: 0,
        monthsRemaining: 12 - new Date().getMonth(),
        lastMonthGrowth: 0
      }
    }

    const currentMonthIndex = new Date().getMonth()
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' })
    const monthsElapsed = currentMonthIndex + 1
    const monthsRemaining = 12 - monthsElapsed

    // Generate mock YTD data based on current monthly income
    const baseMonthlyIncome = incomeClarityData.netMonthly
    const annualTarget = baseMonthlyIncome * 12 * 1.1 // 10% growth target

    const monthlyData: MonthlyYTDData[] = []
    let cumulativeIncome = 0

    // Generate monthly data with some realistic variance
    for (let i = 0; i < monthsElapsed; i++) {
      const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
      // Add some variance to monthly income (±10%)
      const variance = (Math.random() - 0.5) * 0.2
      const monthlyIncome = Math.max(0, baseMonthlyIncome * (1 + variance))
      cumulativeIncome += monthlyIncome

      const monthlyTarget = (annualTarget / 12) * (i + 1)
      
      monthlyData.push({
        month: monthName,
        monthlyIncome,
        cumulativeIncome,
        target: monthlyTarget,
        percentageOfTarget: (cumulativeIncome / monthlyTarget) * 100
      })
    }

    const monthlyAverage = monthsElapsed > 0 ? cumulativeIncome / monthsElapsed : 0
    const projectedAnnual = monthlyAverage * 12
    const targetPortionForPeriod = annualTarget * (monthsElapsed / 12)
    const percentageOfTarget = targetPortionForPeriod > 0 ? (cumulativeIncome / targetPortionForPeriod) * 100 : 0
    const isOnTrack = percentageOfTarget >= 90
    
    // Calculate last month growth
    const lastMonthGrowth = monthlyData.length > 1 && monthlyData[monthlyData.length - 2].monthlyIncome > 0 ? 
      ((monthlyData[monthlyData.length - 1].monthlyIncome - monthlyData[monthlyData.length - 2].monthlyIncome) / monthlyData[monthlyData.length - 2].monthlyIncome) * 100 : 0

    return {
      totalYTDIncome: cumulativeIncome,
      currentMonth: currentMonthName,
      annualTarget,
      percentageOfTarget,
      monthlyAverage,
      monthlyData,
      isOnTrack,
      projectedAnnual,
      monthsRemaining,
      lastMonthGrowth
    }
  }

  const ytdData = calculateYTDData()

  // Animated counting for main values
  const animatedYTD = useCountingAnimation(ytdData.totalYTDIncome, 800, isVisible ? 0 : 0)
  const animatedTarget = useCountingAnimation(ytdData.annualTarget, 900, isVisible ? 100 : 0)
  const animatedPercentage = useCountingAnimation(ytdData.percentageOfTarget, 1000, isVisible ? 200 : 0)

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
              style={{ backgroundColor: 'var(--color-success)', opacity: 0.1 }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                YTD Dividend Income
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Real-time accumulation tracking for {ytdData.currentMonth}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {ytdData.lastMonthGrowth !== 0 && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                ytdData.lastMonthGrowth > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {ytdData.lastMonthGrowth > 0 ? 
                  <ArrowUp className="w-3 h-3" /> : 
                  <ArrowDown className="w-3 h-3" />
                }
                <span>{Math.abs(ytdData.lastMonthGrowth).toFixed(1)}%</span>
              </div>
            )}
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
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* YTD Total & Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* YTD Total */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Total YTD Income
              </span>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold"
              style={{ color: 'var(--color-success)' }}
            >
              {formatCurrency(animatedYTD)}
            </motion.div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Monthly average: {formatCurrency(ytdData.monthlyAverage)}
            </p>
          </div>

          {/* Annual Progress */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Annual Target Progress
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>
                  {animatedPercentage.toFixed(1)}%
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  of {formatCurrency(animatedTarget)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ytdData.percentageOfTarget)}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: ytdData.isOnTrack ? 'var(--color-success)' : 'var(--color-warning)' }}
                />
              </div>
              
              <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <span>{ytdData.isOnTrack ? 'On Track' : 'Behind Target'}</span>
                <span>Projected: {formatCurrency(ytdData.projectedAnnual)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Months Remaining */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Months Remaining
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {ytdData.monthsRemaining}
                </p>
              </div>
            </div>
          </div>

          {/* Current Pace */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Current Pace
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {ytdData.isOnTrack ? 'Ahead' : 'Behind'}
                </p>
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Next Milestone
                </p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(Math.ceil(ytdData.totalYTDIncome / 10000) * 10000)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown Toggle */}
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
                Monthly Breakdown
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ytdData.monthlyData.map((month, index) => (
                  <motion.div
                    key={month.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-tertiary)',
                      borderColor: month.percentageOfTarget >= 100 ? 'var(--color-success)' : 'var(--color-warning)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {month.month}
                      </h5>
                      <div className={`w-3 h-3 rounded-full ${
                        month.percentageOfTarget >= 100 ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Monthly:</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(month.monthlyIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Cumulative:</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(month.cumulativeIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>vs Target:</span>
                        <span style={{ 
                          color: month.percentageOfTarget >= 100 ? 'var(--color-success)' : 'var(--color-warning)' 
                        }}>
                          {month.percentageOfTarget.toFixed(0)}%
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

export const YTDIncomeAccumulator = memo(YTDIncomeAccumulatorComponent)