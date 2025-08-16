'use client'

import React, { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CheckCircle, AlertCircle, DollarSign, Bell, Target, TrendingUp } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface QuarterlyPayment {
  quarter: string
  dueDate: string
  dueDateFormatted: string
  estimatedAmount: number
  isPaid: boolean
  isOverdue: boolean
  daysUntilDue: number
  paymentStatus: 'upcoming' | 'due_soon' | 'overdue' | 'paid'
  penaltyRisk: 'low' | 'medium' | 'high'
  cumulativeIncome: number
  suggestedPaymentDate: string
}

interface TaxScheduleData {
  nextPayment: QuarterlyPayment | null
  quarterlyPayments: QuarterlyPayment[]
  totalAnnualEstimated: number
  totalPaidYTD: number
  remainingForYear: number
  averageQuarterlyPayment: number
  penaltyRiskScore: number
  recommendedActions: string[]
  importantDates: {
    date: string
    event: string
    importance: 'high' | 'medium' | 'low'
  }[]
}

const TaxPaymentScheduleComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [showFullSchedule, setShowFullSchedule] = useState(false)

  // Helper function to format currency - moved up to avoid initialization error
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calculate comprehensive tax payment schedule
  const calculateTaxSchedule = (): TaxScheduleData => {
    if (!incomeClarityData || !profileData) {
      return {
        nextPayment: null,
        quarterlyPayments: [],
        totalAnnualEstimated: 0,
        totalPaidYTD: 0,
        remainingForYear: 0,
        averageQuarterlyPayment: 0,
        penaltyRiskScore: 0,
        recommendedActions: [],
        importantDates: []
      }
    }

    const annualDividendIncome = incomeClarityData.grossMonthly * 12
    const federalRate = profileData.taxInfo?.federalRate || 22
    const stateRate = profileData.taxInfo?.stateRate || 0
    const effectiveTaxRate = (federalRate + stateRate) / 100

    // Calculate annual tax estimate
    const qualifiedDividends = annualDividendIncome * 0.65
    const ordinaryDividends = annualDividendIncome * 0.35
    const qualifiedTaxRate = 0.15
    const ordinaryTaxRate = effectiveTaxRate

    const totalAnnualEstimated = (qualifiedDividends * qualifiedTaxRate) + (ordinaryDividends * ordinaryTaxRate)
    const averageQuarterlyPayment = totalAnnualEstimated / 4

    const currentYear = new Date().getFullYear()
    const currentDate = new Date()

    // Define quarterly due dates
    const dueDates = [
      { quarter: 'Q1 2024', date: new Date(currentYear, 0, 15), suggestedPayDate: new Date(currentYear, 0, 10) }, // Jan 15
      { quarter: 'Q2 2024', date: new Date(currentYear, 3, 15), suggestedPayDate: new Date(currentYear, 3, 10) }, // Apr 15
      { quarter: 'Q3 2024', date: new Date(currentYear, 5, 17), suggestedPayDate: new Date(currentYear, 5, 12) }, // Jun 17 (15th is weekend)
      { quarter: 'Q4 2024', date: new Date(currentYear, 8, 16), suggestedPayDate: new Date(currentYear, 8, 11) }  // Sep 16 (15th is weekend)
    ]

    // Create quarterly payment objects
    const quarterlyPayments: QuarterlyPayment[] = dueDates.map((due, index) => {
      const daysUntilDue = Math.ceil((due.date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      const isPaid = currentDate > due.date && daysUntilDue < -30 // Assume paid if more than 30 days past due
      const isOverdue = currentDate > due.date && !isPaid

      let paymentStatus: 'upcoming' | 'due_soon' | 'overdue' | 'paid'
      if (isPaid) {
        paymentStatus = 'paid'
      } else if (isOverdue) {
        paymentStatus = 'overdue'
      } else if (daysUntilDue <= 30) {
        paymentStatus = 'due_soon'
      } else {
        paymentStatus = 'upcoming'
      }

      // Calculate penalty risk
      let penaltyRisk: 'low' | 'medium' | 'high'
      if (isPaid || daysUntilDue > 30) {
        penaltyRisk = 'low'
      } else if (daysUntilDue > 0) {
        penaltyRisk = 'medium'
      } else {
        penaltyRisk = 'high'
      }

      // Add seasonal variance to payments
      const seasonalMultiplier = [0, 3, 5, 8].includes(new Date().getMonth()) ? 1.2 : 0.9
      const estimatedAmount = averageQuarterlyPayment * seasonalMultiplier

      return {
        quarter: due.quarter,
        dueDate: due.date.toISOString().split('T')[0],
        dueDateFormatted: due.date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        estimatedAmount: Math.round(estimatedAmount),
        isPaid,
        isOverdue,
        daysUntilDue,
        paymentStatus,
        penaltyRisk,
        cumulativeIncome: annualDividendIncome * (index + 1) / 4,
        suggestedPaymentDate: due.suggestedPayDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
    })

    // Find next payment
    const nextPayment = quarterlyPayments.find(p => !p.isPaid) || null

    // Calculate YTD totals
    const totalPaidYTD = quarterlyPayments
      .filter(p => p.isPaid)
      .reduce((sum, p) => sum + p.estimatedAmount, 0)
    
    const remainingForYear = totalAnnualEstimated - totalPaidYTD

    // Calculate penalty risk score (0-100)
    let penaltyRiskScore = 0
    quarterlyPayments.forEach(payment => {
      if (payment.isOverdue) penaltyRiskScore += 40
      else if (payment.paymentStatus === 'due_soon') penaltyRiskScore += 20
      else if (payment.penaltyRisk === 'high') penaltyRiskScore += 30
    })
    penaltyRiskScore = Math.min(100, penaltyRiskScore)

    // Generate recommended actions
    const recommendedActions = []
    if (nextPayment) {
      if (nextPayment.daysUntilDue <= 7) {
        recommendedActions.push(`Urgent: Pay ${nextPayment.quarter} estimated tax by ${nextPayment.dueDateFormatted}`)
      } else if (nextPayment.daysUntilDue <= 30) {
        recommendedActions.push(`Schedule ${nextPayment.quarter} payment for ${nextPayment.suggestedPaymentDate}`)
      }
    }
    
    recommendedActions.push('Set up calendar reminders for all quarterly due dates')
    recommendedActions.push('Review actual vs estimated income quarterly')
    
    if (penaltyRiskScore > 50) {
      recommendedActions.push('Consider increasing quarterly payments to avoid penalties')
    }

    // Important dates for next 90 days
    const importantDates: Array<{
      date: string;
      event: string;
      importance: 'high' | 'medium' | 'low';
    }> = []
    quarterlyPayments.forEach(payment => {
      if (!payment.isPaid && payment.daysUntilDue <= 90 && payment.daysUntilDue >= 0) {
        importantDates.push({
          date: payment.dueDate,
          event: `${payment.quarter} Estimated Tax Due - ${formatCurrency(payment.estimatedAmount)}`,
          importance: payment.daysUntilDue <= 30 ? 'high' : payment.daysUntilDue <= 60 ? 'medium' : 'low'
        })
      }
    })

    return {
      nextPayment,
      quarterlyPayments,
      totalAnnualEstimated,
      totalPaidYTD,
      remainingForYear,
      averageQuarterlyPayment,
      penaltyRiskScore,
      recommendedActions,
      importantDates
    }
  }

  const scheduleData = calculateTaxSchedule()

  // Animated counting for main values
  const animatedNextPayment = useCountingAnimation(
    scheduleData.nextPayment?.estimatedAmount || 0, 800, isVisible ? 0 : 0
  )
  const animatedRemaining = useCountingAnimation(scheduleData.remainingForYear, 900, isVisible ? 100 : 0)
  const animatedRiskScore = useCountingAnimation(scheduleData.penaltyRiskScore, 1000, isVisible ? 200 : 0)

  // Visibility animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'var(--color-success)'
      case 'upcoming': return 'var(--color-info)'
      case 'due_soon': return 'var(--color-warning)'
      case 'overdue': return 'var(--color-error)'
      default: return 'var(--color-info)'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle
      case 'upcoming': return Calendar
      case 'due_soon': return Clock
      case 'overdue': return AlertCircle
      default: return Calendar
    }
  }

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'var(--color-success)'
    if (score <= 60) return 'var(--color-warning)'
    return 'var(--color-error)'
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
              style={{ backgroundColor: 'var(--color-info)', opacity: 0.1 }}
            >
              <Calendar className="w-6 h-6" style={{ color: 'var(--color-info)' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Tax Payment Schedule
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Never miss a quarterly tax deadline
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {scheduleData.nextPayment && (
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                scheduleData.nextPayment.daysUntilDue <= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                scheduleData.nextPayment.daysUntilDue <= 30 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                <Bell className="w-4 h-4" />
                <span>{scheduleData.nextPayment.daysUntilDue} days</span>
              </div>
            )}
            <button
              onClick={() => setShowFullSchedule(!showFullSchedule)}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: 'var(--color-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
              }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Next Payment Alert */}
        {scheduleData.nextPayment && (
          <div 
            className="p-4 rounded-xl border mb-6"
            style={{
              backgroundColor: getStatusColor(scheduleData.nextPayment.paymentStatus),
              borderColor: getStatusColor(scheduleData.nextPayment.paymentStatus),
              opacity: 0.1
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {React.createElement(getStatusIcon(scheduleData.nextPayment.paymentStatus), {
                  className: "w-6 h-6",
                  style: { color: getStatusColor(scheduleData.nextPayment.paymentStatus) }
                })}
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Next Payment: {scheduleData.nextPayment.quarter}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Due {scheduleData.nextPayment.dueDateFormatted} • 
                    Suggested pay date: {scheduleData.nextPayment.suggestedPaymentDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(animatedNextPayment)}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {scheduleData.nextPayment.daysUntilDue > 0 ? 
                    `${scheduleData.nextPayment.daysUntilDue} days remaining` :
                    `${Math.abs(scheduleData.nextPayment.daysUntilDue)} days overdue`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Annual Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Annual Estimated */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Annual Estimated
              </span>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl font-bold"
              style={{ color: 'var(--color-info)' }}
            >
              {formatCurrency(scheduleData.totalAnnualEstimated)}
            </motion.div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Total for {new Date().getFullYear()}
            </p>
          </div>

          {/* Remaining This Year */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Remaining This Year
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
              {formatCurrency(animatedRemaining)}
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {scheduleData.quarterlyPayments.filter(p => !p.isPaid).length} payments left
            </p>
          </div>

          {/* Penalty Risk */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" style={{ color: getRiskColor(scheduleData.penaltyRiskScore) }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Penalty Risk Score
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: getRiskColor(scheduleData.penaltyRiskScore) }}>
              {animatedRiskScore.toFixed(0)}/100
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {scheduleData.penaltyRiskScore <= 30 ? 'Low risk' :
               scheduleData.penaltyRiskScore <= 60 ? 'Medium risk' : 'High risk'}
            </p>
          </div>
        </div>

        {/* Quick Payment Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {scheduleData.quarterlyPayments.map((payment, index) => {
            const StatusIcon = getStatusIcon(payment.paymentStatus)
            return (
              <motion.div
                key={payment.quarter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 rounded-xl border text-center"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  borderColor: getStatusColor(payment.paymentStatus),
                  opacity: payment.isPaid ? 0.6 : 1
                }}
              >
                <StatusIcon 
                  className="w-5 h-5 mx-auto mb-2" 
                  style={{ color: getStatusColor(payment.paymentStatus) }} 
                />
                <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {payment.quarter}
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(payment.estimatedAmount)}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {payment.isPaid ? 'Paid' : 
                   payment.isOverdue ? 'Overdue' :
                   payment.dueDateFormatted}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Recommended Actions */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Recommended Actions
          </h4>
          <div className="space-y-2">
            {scheduleData.recommendedActions.map((action, index) => (
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
                    {action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Schedule Breakdown */}
        <AnimatePresence>
          {showFullSchedule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Complete Payment Schedule
              </h4>
              
              <div className="space-y-4">
                {scheduleData.quarterlyPayments.map((payment, index) => {
                  const StatusIcon = getStatusIcon(payment.paymentStatus)
                  return (
                    <motion.div
                      key={payment.quarter}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--color-tertiary)',
                        borderColor: getStatusColor(payment.paymentStatus),
                        opacity: payment.isPaid ? 0.7 : 1
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <StatusIcon 
                            className="w-6 h-6" 
                            style={{ color: getStatusColor(payment.paymentStatus) }} 
                          />
                          <div>
                            <h5 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {payment.quarter}
                            </h5>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                              Due: {payment.dueDateFormatted}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                              Suggested pay: {payment.suggestedPaymentDate}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {formatCurrency(payment.estimatedAmount)}
                          </p>
                          <p className={`text-sm font-medium ${
                            payment.isPaid ? 'text-green-600' :
                            payment.isOverdue ? 'text-red-600' :
                            payment.paymentStatus === 'due_soon' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {payment.isPaid ? '✓ Paid' :
                             payment.isOverdue ? `${Math.abs(payment.daysUntilDue)} days overdue` :
                             payment.daysUntilDue <= 30 ? `${payment.daysUntilDue} days left` :
                             'Upcoming'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            Risk: {payment.penaltyRisk}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const TaxPaymentSchedule = memo(TaxPaymentScheduleComponent)