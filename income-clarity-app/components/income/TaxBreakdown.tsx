'use client'

import { useState, useMemo, memo } from 'react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { Calculator, MapPin, Shield, TrendingUp, AlertTriangle, FileText, Download, Users } from 'lucide-react'

interface TaxStrategy {
  id: string
  title: string
  description: string
  potentialSavings: number
  complexity: 'easy' | 'medium' | 'advanced'
  applicable: boolean
}

interface TaxBreakdownData {
  grossDividends: number
  qualifiedDividends: number
  ordinaryDividends: number
  federalTax: number
  stateTax: number
  totalTax: number
  effectiveTaxRate: number
  marginalTaxRate: number
  afterTaxIncome: number
  quarterlyEstimate: number
}

const TaxBreakdownComponent = () => {
  const { portfolio, holdings } = usePortfolio()
  const { profileData } = useUserProfile()
  const [activeTab, setActiveTab] = useState<'breakdown' | 'strategies' | 'quarterly'>('breakdown')
  const [showTaxYearSelector, setShowTaxYearSelector] = useState(false)
  const [selectedTaxYear, setSelectedTaxYear] = useState(new Date().getFullYear())

  // Calculate comprehensive tax breakdown
  const taxBreakdown = useMemo((): TaxBreakdownData => {
    const grossDividends = (portfolio?.monthlyGrossIncome || 0) * 12
    
    // Estimate qualified vs ordinary dividends (mock logic - in reality this would be more complex)
    const qualifiedPercentage = 0.85 // 85% of dividends are typically qualified
    const qualifiedDividends = grossDividends * qualifiedPercentage
    const ordinaryDividends = grossDividends * (1 - qualifiedPercentage)
    
    // Tax rates from profile
    const federalRate = profileData?.taxInfo?.federalRate || 0.22
    const stateRate = profileData?.taxInfo?.stateRate || 0.05
    const qualifiedRate = federalRate > 0.22 ? 0.20 : federalRate > 0.12 ? 0.15 : 0 // Qualified dividend rates
    
    // Calculate taxes
    const federalTaxQualified = qualifiedDividends * qualifiedRate
    const federalTaxOrdinary = ordinaryDividends * federalRate
    const federalTax = federalTaxQualified + federalTaxOrdinary
    const stateTax = grossDividends * stateRate // Most states tax both equally
    const totalTax = federalTax + stateTax
    
    const effectiveTaxRate = grossDividends > 0 ? (totalTax / grossDividends) : 0
    const marginalTaxRate = federalRate + stateRate
    const afterTaxIncome = grossDividends - totalTax
    const quarterlyEstimate = totalTax / 4

    return {
      grossDividends,
      qualifiedDividends,
      ordinaryDividends,
      federalTax,
      stateTax,
      totalTax,
      effectiveTaxRate,
      marginalTaxRate,
      afterTaxIncome,
      quarterlyEstimate
    }
  }, [portfolio, profileData])

  // Generate tax optimization strategies
  const taxStrategies = useMemo((): TaxStrategy[] => {
    const strategies: TaxStrategy[] = [
      {
        id: 'asset-location',
        title: 'Asset Location Optimization',
        description: 'Move high-dividend stocks to tax-deferred accounts (401k, IRA) to defer taxes and optimize after-tax returns.',
        potentialSavings: taxBreakdown.totalTax * 0.15, // Could save 15% through optimization
        complexity: 'medium',
        applicable: taxBreakdown.totalTax > 1000
      },
      {
        id: 'qualified-focus',
        title: 'Focus on Qualified Dividends',
        description: 'Prioritize stocks that pay qualified dividends to benefit from lower capital gains tax rates.',
        potentialSavings: (taxBreakdown.ordinaryDividends * (taxBreakdown.marginalTaxRate - 0.15)), // Savings from ordinary to qualified
        complexity: 'easy',
        applicable: taxBreakdown.ordinaryDividends > taxBreakdown.qualifiedDividends * 0.2
      },
      {
        id: 'state-optimization',
        title: 'State Tax Optimization',
        description: `Consider tax-friendly states or municipal bonds from your state (${profileData?.location?.state || 'Unknown'}) for tax-free income.`,
        potentialSavings: taxBreakdown.stateTax * 0.5, // Could reduce state tax burden
        complexity: 'advanced',
        applicable: taxBreakdown.stateTax > 500
      },
      {
        id: 'timing-strategy',
        title: 'Tax-Loss Harvesting',
        description: 'Harvest investment losses to offset dividend income and reduce overall tax liability.',
        potentialSavings: taxBreakdown.totalTax * 0.10, // Up to 10% through harvesting
        complexity: 'medium',
        applicable: taxBreakdown.totalTax > 2000
      },
      {
        id: 'retirement-accounts',
        title: 'Max Out Retirement Contributions',
        description: 'Increase 401(k)/IRA contributions to lower taxable income and reduce dividend tax burden.',
        potentialSavings: 22000 * (taxBreakdown.marginalTaxRate), // Max 401k contribution tax savings
        complexity: 'easy',
        applicable: true
      },
      {
        id: 'municipal-bonds',
        title: 'Municipal Bond Allocation',
        description: 'Replace some dividend stocks with tax-free municipal bonds, especially for high tax bracket investors.',
        potentialSavings: (taxBreakdown.grossDividends * 0.2) * taxBreakdown.effectiveTaxRate, // 20% of portfolio in munis
        complexity: 'medium',
        applicable: taxBreakdown.effectiveTaxRate > 0.20
      }
    ]

    return strategies.filter(s => s.applicable).sort((a, b) => b.potentialSavings - a.potentialSavings)
  }, [taxBreakdown, profileData])

  // Generate quarterly tax calendar
  const quarterlyTaxCalendar = useMemo(() => {
    const currentYear = selectedTaxYear
    return [
      {
        quarter: 'Q1',
        period: `Jan 1 - Mar 31, ${currentYear}`,
        dueDate: `Apr 15, ${currentYear}`,
        estimate: taxBreakdown.quarterlyEstimate,
        status: new Date() > new Date(currentYear, 3, 15) ? 'past' : 'upcoming'
      },
      {
        quarter: 'Q2',
        period: `Apr 1 - Jun 30, ${currentYear}`,
        dueDate: `Jun 15, ${currentYear}`,
        estimate: taxBreakdown.quarterlyEstimate,
        status: new Date() > new Date(currentYear, 5, 15) ? 'past' : 'upcoming'
      },
      {
        quarter: 'Q3',
        period: `Jul 1 - Sep 30, ${currentYear}`,
        dueDate: `Sep 15, ${currentYear}`,
        estimate: taxBreakdown.quarterlyEstimate,
        status: new Date() > new Date(currentYear, 8, 15) ? 'past' : 'upcoming'
      },
      {
        quarter: 'Q4',
        period: `Oct 1 - Dec 31, ${currentYear}`,
        dueDate: `Jan 15, ${currentYear + 1}`,
        estimate: taxBreakdown.quarterlyEstimate,
        status: 'upcoming'
      }
    ]
  }, [taxBreakdown, selectedTaxYear])

  const getComplexityColor = (complexity: TaxStrategy['complexity']) => {
    switch (complexity) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
    }
  }

  const getComplexityIcon = (complexity: TaxStrategy['complexity']) => {
    switch (complexity) {
      case 'easy': return <Shield className="w-4 h-4" />
      case 'medium': return <AlertTriangle className="w-4 h-4" />
      case 'advanced': return <Users className="w-4 h-4" />
    }
  }

  if (taxBreakdown.grossDividends === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="text-center py-8">
          <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tax Planning Needed Yet</h3>
          <p className="text-gray-600 mb-4">Add dividend-paying holdings to see detailed tax breakdown and optimization strategies.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Add Holdings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tax Planning Center</h2>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{profileData?.location?.state || 'Unknown'} • {selectedTaxYear} Tax Year</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTaxYearSelector(!showTaxYearSelector)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors text-sm font-medium"
            >
              {selectedTaxYear}
            </button>
            <button className="p-2 hover:bg-white/50 rounded-lg transition-colors" title="Download tax report">
              <Download className="w-5 h-5 text-amber-600" />
            </button>
          </div>
        </div>

        {/* Tax Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${taxBreakdown.grossDividends.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Gross Dividends</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">
              ${taxBreakdown.totalTax.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Tax</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(taxBreakdown.effectiveTaxRate * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Effective Rate</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${taxBreakdown.afterTaxIncome.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">After-Tax</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
          {[
            { id: 'breakdown' as const, label: 'Tax Breakdown', icon: Calculator },
            { id: 'strategies' as const, label: 'Strategies', icon: TrendingUp },
            { id: 'quarterly' as const, label: 'Quarterly', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            {/* Dividend Type Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dividend Classification</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">Qualified Dividends</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Preferred Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ${taxBreakdown.qualifiedDividends.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">
                    {taxBreakdown.grossDividends > 0 ? ((taxBreakdown.qualifiedDividends / taxBreakdown.grossDividends) * 100).toFixed(1) : '0.0'}% of total dividends
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${taxBreakdown.grossDividends > 0 ? (taxBreakdown.qualifiedDividends / taxBreakdown.grossDividends) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800">Ordinary Dividends</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Regular Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    ${taxBreakdown.ordinaryDividends.toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-700">
                    {taxBreakdown.grossDividends > 0 ? ((taxBreakdown.ordinaryDividends / taxBreakdown.grossDividends) * 100).toFixed(1) : '0.0'}% of total dividends
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-orange-500 rounded-full"
                        style={{ width: `${taxBreakdown.grossDividends > 0 ? (taxBreakdown.ordinaryDividends / taxBreakdown.grossDividends) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Liability Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Liability</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-red-800">Federal Tax</div>
                    <div className="text-sm text-red-600">
                      Marginal rate: {((profileData?.taxInfo?.federalRate || 0.22) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-xl font-bold text-red-600">
                    ${taxBreakdown.federalTax.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-blue-800">
                      {profileData?.location?.state || 'State'} Tax
                    </div>
                    <div className="text-sm text-blue-600">
                      State rate: {((profileData?.taxInfo?.stateRate || 0.05) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    ${taxBreakdown.stateTax.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-800">Total Tax Liability</div>
                    <div className="text-sm text-gray-600">
                      Effective rate: {(taxBreakdown.effectiveTaxRate * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    ${taxBreakdown.totalTax.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strategies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tax Optimization Strategies</h3>
              <div className="text-sm text-gray-600">
                Potential savings: ${taxStrategies.reduce((sum, s) => sum + s.potentialSavings, 0).toLocaleString()}
              </div>
            </div>

            {taxStrategies.map((strategy, index) => (
              <div
                key={strategy.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{strategy.title}</h4>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(strategy.complexity)}`}>
                        {getComplexityIcon(strategy.complexity)}
                        <span className="capitalize">{strategy.complexity}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{strategy.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      ${strategy.potentialSavings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Potential Savings</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Rank #{index + 1} by potential impact
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'quarterly' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quarterly Tax Estimates</h3>
              <div className="text-sm text-gray-600">
                Annual estimate: ${(taxBreakdown.quarterlyEstimate * 4).toLocaleString()}
              </div>
            </div>

            {quarterlyTaxCalendar.map((quarter) => (
              <div
                key={quarter.quarter}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  quarter.status === 'past'
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-blue-300 bg-blue-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                    quarter.status === 'past'
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-blue-200 text-blue-700'
                  }`}>
                    {quarter.quarter}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{quarter.period}</div>
                    <div className="text-sm text-gray-600">Due: {quarter.dueDate}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    quarter.status === 'past' ? 'text-gray-600' : 'text-blue-600'
                  }`}>
                    ${quarter.estimate.toLocaleString()}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    quarter.status === 'past'
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-blue-200 text-blue-700'
                  }`}>
                    {quarter.status === 'past' ? 'Completed' : 'Upcoming'}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Download 1040-ES</span>
              </button>
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Consult CPA</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const TaxBreakdown = memo(TaxBreakdownComponent)