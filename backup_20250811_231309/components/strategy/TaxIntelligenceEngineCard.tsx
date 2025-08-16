'use client'

import { useState, useEffect, memo } from 'react'
import { Zap, TrendingUp, ArrowRight, Info, MapPin, Calculator } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface TaxOptimization {
  id: string
  title: string
  description: string
  potentialSavings: number
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  icon: any
  color: string
  bg: string
}

interface TaxIntelligenceData {
  currentEfficiency: number
  potentialSavings: number
  optimizations: TaxOptimization[]
  currentLocation: string
  optimalLocation: string
}

const TaxIntelligenceEngineCardComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null)

  const calculateTaxIntelligence = (): TaxIntelligenceData => {
    const currentLocation = profileData?.location?.state || 'Unknown'
    const grossIncome = incomeClarityData?.grossMonthly || 0
    const stateRate = profileData?.taxInfo?.stateRate || 0.05

    const optimizations: TaxOptimization[] = [
      {
        id: 'location-optimization',
        title: 'Location Optimization',
        description: currentLocation === 'Puerto Rico' 
          ? 'You\'re already in the optimal tax location!' 
          : 'Moving to Puerto Rico could save significant taxes',
        potentialSavings: currentLocation === 'Puerto Rico' ? 0 : grossIncome * stateRate * 12,
        difficulty: 'Advanced',
        icon: MapPin,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      },
      {
        id: 'qualified-focus',
        title: 'Qualified Dividend Focus',
        description: 'Increase allocation to qualified dividend ETFs',
        potentialSavings: grossIncome * 0.15 * 12, // 15% tax savings annually
        difficulty: 'Easy',
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50'
      },
      {
        id: 'tax-loss-harvesting',
        title: 'Tax-Loss Harvesting',
        description: 'Harvest losses to offset dividend income',
        potentialSavings: grossIncome * 0.08 * 12, // 8% potential savings
        difficulty: 'Medium',
        icon: Calculator,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
      }
    ]

    const currentEfficiency = currentLocation === 'Puerto Rico' ? 95 : 
                            currentLocation === 'Texas' || currentLocation === 'Florida' ? 85 : 72
    const potentialSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0)
    const optimalLocation = currentLocation === 'Puerto Rico' ? 'Puerto Rico' : 'Puerto Rico'

    return {
      currentEfficiency,
      potentialSavings,
      optimizations,
      currentLocation,
      optimalLocation
    }
  }

  const intelligenceData = calculateTaxIntelligence()

  const animatedValues = useStaggeredCountingAnimation(
    {
      efficiency: intelligenceData.currentEfficiency,
      savings: intelligenceData.potentialSavings,
      opt1: intelligenceData.optimizations[0]?.potentialSavings || 0,
      opt2: intelligenceData.optimizations[1]?.potentialSavings || 0,
      opt3: intelligenceData.optimizations[2]?.potentialSavings || 0,
    },
    1000,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Tax Intelligence Engine
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            AI-powered tax optimization recommendations for dividend income
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
        </div>
      </div>

      {/* Current Tax Efficiency Score */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
        <div className="text-center">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-600 mb-2">
            {Math.round(animatedValues.efficiency)}%
          </div>
          <div className="text-sm sm:text-base text-slate-600 mb-2">Current Tax Efficiency</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
            intelligenceData.currentEfficiency > 90 ? 'bg-green-100 text-green-800' :
            intelligenceData.currentEfficiency > 80 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {intelligenceData.currentLocation}
          </div>
        </div>
      </div>

      {/* Annual Savings Potential */}
      {intelligenceData.potentialSavings > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-700">Annual Savings Potential</h4>
              <p className="text-sm text-slate-600">With tax optimization</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${Math.round(animatedValues.savings).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">per year</div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Optimization Recommendations */}
      <div className="space-y-4 sm:space-y-6">
        <h4 className="font-semibold text-slate-700 mb-4">Smart Recommendations</h4>
        
        {intelligenceData.optimizations.map((optimization, index) => (
          <div 
            key={optimization.id}
            className={`group relative transition-all duration-500 cursor-pointer ${
              selectedOptimization === optimization.id ? 'ring-2 ring-orange-200' : ''
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
            onClick={() => setSelectedOptimization(
              selectedOptimization === optimization.id ? null : optimization.id
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition-all duration-300">
              <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                <div className={`p-1.5 sm:p-2 rounded-lg ${optimization.bg}`}>
                  <optimization.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${optimization.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm sm:text-base font-medium text-slate-700">
                      {optimization.title}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      optimization.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      optimization.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {optimization.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight mb-2">
                    {optimization.description}
                  </p>
                  
                  {selectedOptimization === optimization.id && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Annual Savings</span>
                        <span className="font-semibold text-green-600">
                          ${optimization.potentialSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    ${Math.round(optimization.potentialSavings / 12).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">per month</div>
                </div>
                <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  selectedOptimization === optimization.id ? 'rotate-90' : ''
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pro Tip */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg sm:rounded-xl border border-orange-100">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Pro Tip</h4>
            <p className="text-sm text-slate-600">
              {intelligenceData.currentLocation === 'Puerto Rico' 
                ? 'You\'re already optimized! Focus on qualified dividend ETFs to maintain your tax advantage.'
                : 'Tax optimization is the fastest way to increase your after-tax income without additional risk.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export { TaxIntelligenceEngineCardComponent as TaxIntelligenceEngineCard }
export default memo(TaxIntelligenceEngineCardComponent)