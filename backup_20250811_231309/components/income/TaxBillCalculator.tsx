'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, DollarSign, Receipt, Calendar, AlertTriangle, Target, FileText, TrendingUp, HelpCircle } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface QuarterlyTaxData {
  quarter: string
  dueDate: string
  estimatedPayment: number
  isPaid: boolean
  dividendIncome: number
  applicableTaxRate: number
}

interface TaxCalculationData {
  annualDividendIncome: number
  qualifiedDividends: number
  ordinaryDividends: number
  reitDividends: number
  federalTaxOwed: number
  stateTaxOwed: number
  totalTaxBill: number
  effectiveRate: number
  marginalRate: number
  quarterlyPayments: QuarterlyTaxData[]
  taxSavingsOpportunity: number
  withholdingDeficit: number
  penaltyRisk: 'low' | 'medium' | 'high'
  nextPaymentDue: string
  nextPaymentAmount: number
}

const TaxBillCalculatorComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [showQuarterlyBreakdown, setShowQuarterlyBreakdown] = useState(false)
  const [showTaxOptimization, setShowTaxOptimization] = useState(false)

  // Calculate comprehensive tax data
  const calculateTaxData = (): TaxCalculationData => {
    if (!incomeClarityData || !profileData) {
      return {
        annualDividendIncome: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        reitDividends: 0,
        federalTaxOwed: 0,
        stateTaxOwed: 0,
        totalTaxBill: 0,
        effectiveRate: 0,
        marginalRate: 0,
        quarterlyPayments: [],
        taxSavingsOpportunity: 0,
        withholdingDeficit: 0,
        penaltyRisk: 'low',
        nextPaymentDue: '2024-01-15',
        nextPaymentAmount: 0
      }
    }

    const annualDividendIncome = incomeClarityData.grossMonthly * 12
    const federalRate = profileData.taxInfo?.federalRate || 22
    const stateRate = profileData.taxInfo?.stateRate || 0
    const capitalGainsRate = profileData.taxInfo?.capitalGainsRate || 15

    // Estimate dividend type breakdown based on typical portfolio mix
    const qualifiedDividends = annualDividendIncome * 0.65 // ETFs like SCHD, VYM
    const ordinaryDividends = annualDividendIncome * 0.25  // Covered calls like JEPI, QYLD
    const reitDividends = annualDividendIncome * 0.10      // REITs like VNQ, SCHH

    // Tax calculations
    const federalTaxOwed = 
      (qualifiedDividends * (capitalGainsRate / 100)) +
      (ordinaryDividends * (federalRate / 100)) +
      (reitDividends * (federalRate / 100))

    const stateTaxOwed = annualDividendIncome * (stateRate / 100)
    const totalTaxBill = federalTaxOwed + stateTaxOwed
    const effectiveRate = (totalTaxBill / annualDividendIncome) * 100
    const marginalRate = federalRate + stateRate

    // Calculate quarterly payments
    const quarterlyAmount = totalTaxBill / 4
    const currentYear = new Date().getFullYear()
    const quarterlyPayments: QuarterlyTaxData[] = [
      {
        quarter: 'Q1',
        dueDate: `${currentYear}-01-15`,
        estimatedPayment: quarterlyAmount,
        isPaid: new Date() > new Date(`${currentYear}-01-15`),
        dividendIncome: annualDividendIncome / 4,
        applicableTaxRate: effectiveRate
      },
      {
        quarter: 'Q2',
        dueDate: `${currentYear}-04-15`,
        estimatedPayment: quarterlyAmount,
        isPaid: new Date() > new Date(`${currentYear}-04-15`),
        dividendIncome: annualDividendIncome / 4,
        applicableTaxRate: effectiveRate
      },
      {
        quarter: 'Q3',
        dueDate: `${currentYear}-06-15`,
        estimatedPayment: quarterlyAmount,
        isPaid: new Date() > new Date(`${currentYear}-06-15`),
        dividendIncome: annualDividendIncome / 4,
        applicableTaxRate: effectiveRate
      },
      {
        quarter: 'Q4',
        dueDate: `${currentYear}-09-15`,
        estimatedPayment: quarterlyAmount,
        isPaid: new Date() > new Date(`${currentYear}-09-15`),
        dividendIncome: annualDividendIncome / 4,
        applicableTaxRate: effectiveRate
      }
    ]

    // Find next payment due
    const nextPayment = quarterlyPayments.find(q => !q.isPaid)
    const nextPaymentDue = nextPayment?.dueDate || `${currentYear + 1}-01-15`
    const nextPaymentAmount = nextPayment?.estimatedPayment || 0

    // Calculate optimization opportunities
    const qualifiedOptimization = (ordinaryDividends + reitDividends) * ((federalRate - capitalGainsRate) / 100)
    const taxSavingsOpportunity = qualifiedOptimization * 0.5 // Realistic savings potential

    // Penalty risk assessment
    const withholdingDeficit = totalTaxBill * 0.9 // Assume 90% safe harbor
    const penaltyRisk: 'low' | 'medium' | 'high' = 
      totalTaxBill < 1000 ? 'low' :
      withholdingDeficit > totalTaxBill * 0.8 ? 'low' :
      withholdingDeficit > totalTaxBill * 0.6 ? 'medium' : 'high'

    return {
      annualDividendIncome,
      qualifiedDividends,
      ordinaryDividends,
      reitDividends,
      federalTaxOwed,
      stateTaxOwed,
      totalTaxBill,
      effectiveRate,
      marginalRate,
      quarterlyPayments,
      taxSavingsOpportunity,
      withholdingDeficit,
      penaltyRisk,
      nextPaymentDue,
      nextPaymentAmount
    }
  }

  const taxData = calculateTaxData()

  // Animated counting for main values
  const animatedTaxBill = useCountingAnimation(taxData.totalTaxBill, 800, isVisible ? 0 : 0)
  const animatedAnnualIncome = useCountingAnimation(taxData.annualDividendIncome, 900, isVisible ? 100 : 0)
  const animatedEffectiveRate = useCountingAnimation(taxData.effectiveRate, 1000, isVisible ? 200 : 0)

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
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getPenaltyRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'var(--color-success)'
      case 'medium': return 'var(--color-warning)'
      case 'high': return 'var(--color-error)'
    }
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
              style={{ backgroundColor: 'var(--color-warning)', opacity: 0.1 }}
            >
              <Calculator className="w-6 h-6" style={{ color: 'var(--color-warning)' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Annual Tax Bill Estimator
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Smart tax planning for dividend income
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {taxData.penaltyRisk !== 'low' && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                <AlertTriangle className="w-3 h-3" />
                <span>{taxData.penaltyRisk} risk</span>
              </div>
            )}
            <button
              onClick={() => setShowTaxOptimization(!showTaxOptimization)}
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
        {/* Tax Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Annual Tax Bill */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Estimated Annual Tax Bill
              </span>
            </div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold"
              style={{ color: 'var(--color-warning)' }}
            >
              {formatCurrency(animatedTaxBill)}
            </motion.div>
            <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span>Federal: {formatCurrency(taxData.federalTaxOwed)}</span>
              <span>State: {formatCurrency(taxData.stateTaxOwed)}</span>
            </div>
          </div>

          {/* Effective Tax Rate */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Effective Tax Rate
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>
                  {animatedEffectiveRate.toFixed(1)}%
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  on {formatCurrency(animatedAnnualIncome)}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Marginal rate: {taxData.marginalRate}% | Qualified: {taxData.annualDividendIncome > 0 ? ((taxData.qualifiedDividends / taxData.annualDividendIncome) * 100).toFixed(0) : '0'}%
              </div>
            </div>
          </div>
        </div>

        {/* Next Payment Alert */}
        {taxData.nextPaymentAmount > 0 && (
          <div 
            className="p-4 rounded-xl border-l-4 mb-6"
            style={{
              backgroundColor: 'var(--color-warning)',
              borderLeftColor: 'var(--color-warning)',
              opacity: 0.1
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Next Quarterly Payment Due
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatDate(taxData.nextPaymentDue)} - {formatCurrency(taxData.nextPaymentAmount)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuarterlyBreakdown(!showQuarterlyBreakdown)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ 
                  backgroundColor: 'var(--color-warning)', 
                  color: 'white',
                  opacity: 0.9
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
              >
                {showQuarterlyBreakdown ? 'Hide' : 'View'} Schedule
              </button>
            </div>
          </div>
        )}

        {/* Dividend Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Qualified Dividends */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-success)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Qualified Dividends
              </span>
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(taxData.qualifiedDividends)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-success)' }}>
              {taxData.annualDividendIncome > 0 ? ((taxData.qualifiedDividends / taxData.annualDividendIncome) * 100).toFixed(0) : '0'}% of total
            </p>
          </div>

          {/* Ordinary Dividends */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-warning)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Ordinary Income
              </span>
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(taxData.ordinaryDividends)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-warning)' }}>
              {taxData.annualDividendIncome > 0 ? ((taxData.ordinaryDividends / taxData.annualDividendIncome) * 100).toFixed(0) : '0'}% of total
            </p>
          </div>

          {/* REIT Dividends */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-secondary)',
              borderColor: 'var(--color-info)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                REIT Dividends
              </span>
              <div className="w-3 h-3 rounded-full bg-blue-500" />
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(taxData.reitDividends)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-info)' }}>
              {taxData.annualDividendIncome > 0 ? ((taxData.reitDividends / taxData.annualDividendIncome) * 100).toFixed(0) : '0'}% of total
            </p>
          </div>
        </div>

        {/* Quarterly Payment Schedule */}
        <AnimatePresence>
          {showQuarterlyBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-6 mb-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Quarterly Estimated Payments
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {taxData.quarterlyPayments.map((payment, index) => (
                  <motion.div
                    key={payment.quarter}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-4 rounded-xl border ${payment.isPaid ? 'opacity-60' : ''}`}
                    style={{
                      backgroundColor: 'var(--color-tertiary)',
                      borderColor: payment.isPaid ? 'var(--color-success)' : 'var(--color-warning)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {payment.quarter}
                      </h5>
                      <div className={`w-3 h-3 rounded-full ${
                        payment.isPaid ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Due:</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {formatDate(payment.dueDate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Payment:</span>
                        <span style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(payment.estimatedPayment)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                        <span style={{ 
                          color: payment.isPaid ? 'var(--color-success)' : 'var(--color-warning)' 
                        }}>
                          {payment.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tax Optimization Suggestions */}
        <AnimatePresence>
          {showTaxOptimization && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t pt-6"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Tax Optimization Opportunities
              </h4>
              
              <div className="space-y-4">
                {/* Qualified Dividend Opportunity */}
                <div 
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--color-success)',
                    borderColor: 'var(--color-success)',
                    opacity: 0.1
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-success)' }} />
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        Maximize Qualified Dividends
                      </h5>
                      <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        Potential annual savings: {formatCurrency(taxData.taxSavingsOpportunity)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Consider shifting from covered call ETFs to qualified dividend ETFs like SCHD, VYM, or VIG.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div 
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: getPenaltyRiskColor(taxData.penaltyRisk),
                    borderColor: getPenaltyRiskColor(taxData.penaltyRisk),
                    opacity: 0.1
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: getPenaltyRiskColor(taxData.penaltyRisk) }} />
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        Penalty Risk: {taxData.penaltyRisk.toUpperCase()}
                      </h5>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {taxData.penaltyRisk === 'low' && 'You should avoid underpayment penalties with quarterly payments.'}
                        {taxData.penaltyRisk === 'medium' && 'Consider increasing quarterly payments to avoid penalties.'}
                        {taxData.penaltyRisk === 'high' && 'High risk of underpayment penalties. Consult a tax professional.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documentation Reminder */}
                <div 
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--color-info)',
                    borderColor: 'var(--color-info)',
                    opacity: 0.1
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-info)' }} />
                    <div>
                      <h5 className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        Keep Detailed Records
                      </h5>
                      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Track 1099-DIV forms and maintain records of qualified vs. ordinary income for accurate tax filing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const TaxBillCalculator = memo(TaxBillCalculatorComponent)