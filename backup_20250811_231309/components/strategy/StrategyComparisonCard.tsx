'use client'

import { useState, useEffect, memo } from 'react'
import { BarChart3, TrendingUp, Shield, Home, Zap, ArrowUpDown, Info } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface Strategy {
  id: string
  name: string
  description: string
  monthlyIncome: number
  taxEfficiency: number
  riskLevel: 'Low' | 'Moderate' | 'High'
  volatility: number
  minPortfolio: number
  icon: any
  color: string
  bg: string
  pros: string[]
  cons: string[]
  etfs: string[]
}

interface StrategyComparisonData {
  strategies: Strategy[]
  currentStrategy: string
  bestForLocation: string
  recommendations: string[]
}

const StrategyComparisonCardComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState<string>('qualified-dividend')
  const [sortBy, setSortBy] = useState<'income' | 'efficiency' | 'risk'>('efficiency')

  const calculateStrategyComparison = (): StrategyComparisonData => {
    const location = profileData?.location?.state || 'Other'
    const portfolioValue = 150000 // Placeholder
    
    const strategies: Strategy[] = [
      {
        id: 'qualified-dividend',
        name: 'Qualified Dividend Focus',
        description: 'Low-tax dividend ETFs with qualified dividend treatment',
        monthlyIncome: 3825,
        taxEfficiency: location === 'Puerto Rico' ? 95 : location === 'Texas' || location === 'Florida' ? 90 : 82,
        riskLevel: 'Moderate',
        volatility: 18,
        minPortfolio: 50000,
        icon: Shield,
        color: 'text-green-600',
        bg: 'bg-green-50',
        pros: ['Tax-efficient', 'Stable companies', 'Long-term growth'],
        cons: ['Lower immediate yield', 'Market volatility'],
        etfs: ['SCHD', 'VYM', 'DGRO', 'HDV']
      },
      {
        id: 'covered-call',
        name: 'Covered Call Income',
        description: 'High-yield ETFs using covered call strategies',
        monthlyIncome: 4200,
        taxEfficiency: location === 'Puerto Rico' ? 75 : 65,
        riskLevel: 'Low',
        volatility: 12,
        minPortfolio: 25000,
        icon: TrendingUp,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        pros: ['High monthly income', 'Lower volatility', 'Regular payments'],
        cons: ['Higher tax rates', 'Limited upside', 'Complex distributions'],
        etfs: ['JEPI', 'QYLD', 'XYLD', 'NUSI']
      },
      {
        id: 'reit-focused',
        name: 'REIT Income Strategy',
        description: 'Real estate investment trusts for diversification',
        monthlyIncome: 3650,
        taxEfficiency: location === 'Puerto Rico' ? 80 : 70,
        riskLevel: 'Moderate',
        volatility: 22,
        minPortfolio: 30000,
        icon: Home,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        pros: ['Real estate exposure', 'Inflation hedge', 'High yields'],
        cons: ['Interest rate sensitive', 'Ordinary tax rates', 'Sector concentration'],
        etfs: ['VNQ', 'SCHH', 'REM', 'MORT']
      },
      {
        id: 'hybrid-growth',
        name: 'Hybrid Growth & Income',
        description: 'Balanced approach with growth and dividend components',
        monthlyIncome: 3925,
        taxEfficiency: location === 'Puerto Rico' ? 88 : 80,
        riskLevel: 'Moderate',
        volatility: 20,
        minPortfolio: 75000,
        icon: Zap,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        pros: ['Balanced approach', 'Growth potential', 'Diversification'],
        cons: ['Complex allocation', 'Requires larger portfolio', 'Active management'],
        etfs: ['SCHD', 'VTI', 'JEPI', 'VNQ']
      }
    ]

    // Sort strategies
    const sortedStrategies = [...strategies].sort((a, b) => {
      if (sortBy === 'income') return b.monthlyIncome - a.monthlyIncome
      if (sortBy === 'efficiency') return b.taxEfficiency - a.taxEfficiency
      if (sortBy === 'risk') {
        const riskOrder = { 'Low': 1, 'Moderate': 2, 'High': 3 }
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
      }
      return 0
    })

    const currentStrategy = 'qualified-dividend'
    const bestForLocation = location === 'Puerto Rico' ? 'qualified-dividend' : 'qualified-dividend'
    
    const recommendations = [
      `For ${location}, qualified dividend strategy is optimal`,
      'Consider your portfolio size and risk tolerance',
      'Tax efficiency is crucial for long-term wealth building'
    ]

    return {
      strategies: sortedStrategies,
      currentStrategy,
      bestForLocation,
      recommendations
    }
  }

  const comparisonData = calculateStrategyComparison()
  const selectedStrategyData = comparisonData.strategies.find(s => s.id === selectedStrategy)

  const animatedValues = useStaggeredCountingAnimation(
    {
      income: selectedStrategyData?.monthlyIncome || 0,
      efficiency: selectedStrategyData?.taxEfficiency || 0,
      volatility: selectedStrategyData?.volatility || 0,
    },
    1000,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getRiskColor = (risk: string) => {
    if (risk === 'Low') return 'text-green-600 bg-green-100'
    if (risk === 'Moderate') return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Strategy Comparison
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare different dividend investment approaches
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-purple-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-2 mb-6">
        <ArrowUpDown className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-600">Sort by:</span>
        <div className="flex space-x-1">
          {[
            { key: 'efficiency', label: 'Tax Efficiency' },
            { key: 'income', label: 'Income' },
            { key: 'risk', label: 'Risk' }
          ].map((sort) => (
            <button
              key={sort.key}
              onClick={() => setSortBy(sort.key as any)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                sortBy === sort.key
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {comparisonData.strategies.map((strategy, index) => (
          <div
            key={strategy.id}
            className={`group cursor-pointer transition-all duration-300 ${
              selectedStrategy === strategy.id ? 'ring-2 ring-blue-200' : ''
            } ${strategy.id === comparisonData.bestForLocation ? 'ring-2 ring-green-200' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedStrategy(strategy.id)}
          >
            <div className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${strategy.bg}`}>
                    <strategy.icon className={`w-4 h-4 ${strategy.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-700 text-sm">{strategy.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{strategy.description}</p>
                  </div>
                </div>
                {strategy.id === comparisonData.bestForLocation && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Best
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-700">
                    ${strategy.monthlyIncome.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">Monthly Income</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${strategy.color}`}>
                    {strategy.taxEfficiency}%
                  </div>
                  <div className="text-xs text-slate-500">Tax Efficiency</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(strategy.riskLevel)}`}>
                  {strategy.riskLevel} Risk
                </span>
                <span className="text-xs text-slate-500">
                  {strategy.volatility}% volatility
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Strategy Details */}
      {selectedStrategyData && (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <selectedStrategyData.icon className={`w-5 h-5 ${selectedStrategyData.color}`} />
            <h4 className="font-semibold text-slate-700">{selectedStrategyData.name}</h4>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">
                ${Math.round(animatedValues.income).toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Monthly Income</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${selectedStrategyData.color}`}>
                {Math.round(animatedValues.efficiency)}%
              </div>
              <div className="text-sm text-slate-500">Tax Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">
                {Math.round(animatedValues.volatility)}%
              </div>
              <div className="text-sm text-slate-500">Volatility</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-slate-700 mb-2">Key ETFs</h5>
              <div className="flex flex-wrap gap-2">
                {selectedStrategyData.etfs.map((etf) => (
                  <span key={etf} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                    {etf}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-slate-700 mb-2">Requirements</h5>
              <div className="text-sm text-slate-600 space-y-1">
                <div>Min. Portfolio: ${selectedStrategyData.minPortfolio.toLocaleString()}</div>
                <div>Risk Level: {selectedStrategyData.riskLevel}</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <h5 className="font-medium text-slate-700 mb-2 text-green-600">Pros</h5>
              <ul className="space-y-1">
                {selectedStrategyData.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center">
                    <div className="w-1 h-1 bg-green-600 rounded-full mr-2" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-slate-700 mb-2 text-red-600">Cons</h5>
              <ul className="space-y-1">
                {selectedStrategyData.cons.map((con, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center">
                    <div className="w-1 h-1 bg-red-600 rounded-full mr-2" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl border border-blue-100">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Strategy Recommendations</h4>
            <div className="space-y-1">
              {comparisonData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-600">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(StrategyComparisonCardComponent)