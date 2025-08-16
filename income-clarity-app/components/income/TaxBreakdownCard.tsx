'use client'

import { useState, useEffect, memo } from 'react'
import { Calculator, DollarSign, Receipt, MapPin, Info } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface TaxBreakdownData {
  totalTax: number
  federalTax: number
  stateTax: number
  qualifiedDividendTax: number
  ordinaryIncomeTax: number
  reitTax: number
  effectiveRate: number
  location: string
}

const TaxBreakdownCardComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)

  // Calculate tax breakdown by dividend type
  const calculateTaxBreakdown = (): TaxBreakdownData => {
    if (!incomeClarityData || !portfolio) {
      return {
        totalTax: 0, federalTax: 0, stateTax: 0,
        qualifiedDividendTax: 0, ordinaryIncomeTax: 0, reitTax: 0,
        effectiveRate: 0, location: 'Unknown'
      }
    }

    const grossIncome = incomeClarityData.grossMonthly
    const federalRate = profileData?.taxInfo?.federalRate || 0.22
    const stateRate = profileData?.taxInfo?.stateRate || 0.05
    const location = profileData?.location?.state || 'Unknown'

    // Estimate income breakdown by dividend type (mock data)
    const qualifiedIncome = grossIncome * 0.65 // SCHD, VYM etc.
    const ordinaryIncome = grossIncome * 0.25  // JEPI, QYLD etc.
    const reitIncome = grossIncome * 0.10      // VNQ, SCHH etc.

    // Tax calculations
    const qualifiedDividendTax = qualifiedIncome * (federalRate * 0.5 + stateRate) // Qualified = lower federal rate
    const ordinaryIncomeTax = ordinaryIncome * (federalRate + stateRate)
    const reitTax = reitIncome * (federalRate + stateRate)

    const totalTax = incomeClarityData.taxOwed
    const federalTax = grossIncome * federalRate
    const stateTax = grossIncome * stateRate
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0

    return {
      totalTax,
      federalTax,
      stateTax,
      qualifiedDividendTax,
      ordinaryIncomeTax,
      reitTax,
      effectiveRate,
      location
    }
  }

  const taxData = calculateTaxBreakdown()

  const animatedValues = useStaggeredCountingAnimation(
    {
      total: taxData.totalTax,
      federal: taxData.federalTax,
      state: taxData.stateTax,
      qualified: taxData.qualifiedDividendTax,
      ordinary: taxData.ordinaryIncomeTax,
      reit: taxData.reitTax,
      rate: taxData.effectiveRate,
    },
    1000,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const taxItems = [
    {
      label: 'Federal Tax',
      value: Math.round(animatedValues.federal),
      actualValue: taxData.federalTax,
      icon: Receipt,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Federal income tax on dividends'
    },
    {
      label: `${taxData.location} State Tax`,
      value: Math.round(animatedValues.state),
      actualValue: taxData.stateTax,
      icon: MapPin,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'State tax on dividend income'
    },
    {
      label: 'Qualified Dividends',
      value: Math.round(animatedValues.qualified),
      actualValue: taxData.qualifiedDividendTax,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Tax on qualified dividends (ETFs like SCHD)'
    },
    {
      label: 'Ordinary Income',
      value: Math.round(animatedValues.ordinary),
      actualValue: taxData.ordinaryIncomeTax,
      icon: Calculator,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      description: 'Tax on covered calls & high-yield ETFs'
    }
  ]

  return (
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Tax Breakdown by Holding Type
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Understanding your dividend tax liability by investment type
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Receipt className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-600" />
        </div>
      </div>

      {/* Total Tax Summary */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-100">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 mb-2">
            ${Math.round(animatedValues.total).toLocaleString()}
          </div>
          <div className="text-sm sm:text-base text-slate-600 mb-2">Monthly Tax Liability</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
            taxData.effectiveRate < 20 ? 'bg-green-100 text-green-800' :
            taxData.effectiveRate < 30 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {animatedValues.rate.toFixed(1)}% Effective Rate
          </div>
        </div>
      </div>

      {/* Tax Breakdown Items */}
      <div className="space-y-4 sm:space-y-6">
        {taxItems.map((item, index) => (
          <div 
            key={item.label}
            className="group relative transition-all duration-500 ease-premium"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-300">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-0">
                <div className={`p-1.5 sm:p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm sm:text-base font-medium text-slate-700">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 group-hover:text-slate-600 transition-colors leading-tight">
                    {item.description}
                  </p>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className={`currency-display font-semibold text-lg sm:text-xl ${item.color}`}>
                  ${item.value.toLocaleString()}
                </div>
                {item.value !== item.actualValue && (
                  <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
                    <div 
                      className="h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((item.value / item.actualValue) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tax Optimization Tips */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl border border-blue-100">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Tax Optimization Tip</h4>
            <p className="text-sm text-slate-600">
              {taxData.location === 'Puerto Rico' ? 
                'As a Puerto Rico resident, you benefit from 0% tax on qualified dividends and capital gains!' :
                'Consider tax-advantaged accounts or qualified dividend-focused ETFs to reduce your tax burden.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(TaxBreakdownCardComponent)