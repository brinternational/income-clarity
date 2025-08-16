'use client'

import { useState, useEffect, memo } from 'react'
import { Calculator, MapPin, ArrowRight, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'

interface LocationTaxData {
  location: string
  stateRate: number
  federalRate: number
  qualifiedDividendRate: number
  monthlyTax: number
  annualTax: number
  savings: number
  rank: number
  pros: string[]
  cons: string[]
}

interface TaxSavingsData {
  currentLocation: LocationTaxData
  locations: LocationTaxData[]
  bestSavings: number
  optimalLocation: string
}

const TaxSavingsCalculatorCardComponent = () => {
  const { profileData, incomeClarityData, loading: profileLoading, error: profileError } = useUserProfile()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [localLoading, setLocalLoading] = useState(true)

  // Simulate initial data loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const calculateTaxSavings = (): TaxSavingsData => {
    const grossIncome = incomeClarityData?.grossMonthly || 0
    const currentLocation = profileData?.location?.state || 'Texas'
    
    // Tax rates by location (simplified)
    const locationData = {
      'Puerto Rico': { stateRate: 0.04, federalRate: 0.0, qualifiedDividendRate: 0.0 },
      'Texas': { stateRate: 0.0, federalRate: 0.22, qualifiedDividendRate: 0.15 },
      'Florida': { stateRate: 0.0, federalRate: 0.22, qualifiedDividendRate: 0.15 },
      'California': { stateRate: 0.133, federalRate: 0.22, qualifiedDividendRate: 0.20 },
      'New York': { stateRate: 0.108, federalRate: 0.22, qualifiedDividendRate: 0.20 },
      'Other': { stateRate: 0.05, federalRate: 0.22, qualifiedDividendRate: 0.15 }
    }

    const locations: LocationTaxData[] = Object.entries(locationData).map(([location, rates], index) => {
      const totalRate = rates.stateRate + rates.federalRate
      const monthlyTax = grossIncome * totalRate
      const annualTax = monthlyTax * 12
      
      return {
        location,
        stateRate: rates.stateRate,
        federalRate: rates.federalRate,
        qualifiedDividendRate: rates.qualifiedDividendRate,
        monthlyTax,
        annualTax,
        savings: 0, // Will be calculated below
        rank: index + 1,
        pros: location === 'Puerto Rico' 
          ? ['0% tax on dividends', '4% flat rate on other income', 'No federal taxes']
          : location === 'Texas' || location === 'Florida'
          ? ['No state income tax', 'Business-friendly environment'] 
          : ['Established infrastructure', 'Strong job market'],
        cons: location === 'Puerto Rico'
          ? ['Relocation required', 'Different tax laws']
          : location === 'California' || location === 'New York'
          ? ['High state taxes', 'High cost of living']
          : []
      }
    })

    // Calculate savings relative to current location
    const currentLocationData = locations.find(l => l.location === currentLocation) || locations[0]
    const currentTax = currentLocationData.monthlyTax

    locations.forEach(location => {
      location.savings = (currentTax - location.monthlyTax) * 12
    })

    // Sort by savings (best first)
    locations.sort((a, b) => b.savings - a.savings)
    locations.forEach((location, index) => {
      location.rank = index + 1
    })

    const bestSavings = locations[0].savings
    const optimalLocation = locations[0].location

    return {
      currentLocation: currentLocationData,
      locations,
      bestSavings,
      optimalLocation
    }
  }

  const savingsData = calculateTaxSavings()
  const selectedLocationData = selectedLocation 
    ? savingsData.locations.find(l => l.location === selectedLocation)
    : null

  const animatedValues = useStaggeredCountingAnimation(
    {
      currentTax: savingsData.currentLocation.monthlyTax,
      bestSavings: savingsData.bestSavings,
      selectedTax: selectedLocationData?.monthlyTax || 0,
      selectedSavings: selectedLocationData?.savings || 0,
    },
    1000,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Handle errors from context
  if (profileError) {
    throw new Error(`Failed to load profile data: ${profileError}`)
  }

  const isLoading = profileLoading || localLoading

  return (
    <SkeletonCardWrapper 
      isLoading={isLoading} 
      cardType="tax"
      className={isVisible ? 'animate-slide-up' : 'opacity-0'}
    >
      <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
        isVisible ? 'animate-slide-up' : 'opacity-0'
      }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Tax Savings Calculator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare dividend tax impact across different locations
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-green-50 to-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
        </div>
      </div>

      {/* Current Location Summary */}
      <div className="mb-6 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-slate-700">Current Location</h4>
              <p className="text-sm text-slate-600">{savingsData.currentLocation.location}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-700">
              ${Math.round(animatedValues.currentTax).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">monthly tax</div>
          </div>
        </div>

        {savingsData.bestSavings > 0 && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Best Potential Savings</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  ${Math.round(animatedValues.bestSavings).toLocaleString()}
                </div>
                <div className="text-xs text-green-600">per year in {savingsData.optimalLocation}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Comparison */}
      <div className="space-y-3 sm:space-y-4">
        <h4 className="font-semibold text-slate-700 mb-4">Location Comparison</h4>
        
        {savingsData.locations.map((location, index) => (
          <div 
            key={location.location}
            className={`group relative transition-all duration-300 cursor-pointer ${
              selectedLocation === location.location ? 'ring-2 ring-blue-200' : ''
            } ${location.location === savingsData.currentLocation.location ? 'bg-blue-50' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedLocation(
              selectedLocation === location.location ? '' : location.location
            )}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all duration-300">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                  {location.rank}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-slate-700">{location.location}</span>
                    {location.location === savingsData.currentLocation.location && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Current
                      </span>
                    )}
                    {location.rank === 1 && location.savings > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Best
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {location.stateRate === 0 ? 'No state tax' : `${(location.stateRate * 100).toFixed(1)}% state tax`}
                  </div>
                </div>
              </div>
              
              <div className="text-right mr-3">
                <div className="font-semibold text-slate-700">
                  ${Math.round(location.monthlyTax).toLocaleString()}
                </div>
                <div className={`text-sm font-medium ${
                  location.savings > 0 ? 'text-green-600' : 
                  location.savings < 0 ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {location.savings > 0 ? '+' : ''}
                  ${Math.round(location.savings).toLocaleString()}/year
                </div>
              </div>
              
              <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                selectedLocation === location.location ? 'rotate-90' : ''
              }`} />
            </div>

            {/* Expanded Details */}
            {selectedLocation === location.location && (
              <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-slate-700 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Advantages
                    </h5>
                    <ul className="space-y-1">
                      {location.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-center">
                          <div className="w-1 h-1 bg-green-600 rounded-full mr-2" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {location.cons.length > 0 && (
                    <div>
                      <h5 className="font-medium text-slate-700 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 text-orange-600 mr-2" />
                        Considerations
                      </h5>
                      <ul className="space-y-1">
                        {location.cons.map((con, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-center">
                            <div className="w-1 h-1 bg-orange-600 rounded-full mr-2" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Annual Tax</span>
                    <span className="font-semibold">${location.annualTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-slate-600">Effective Rate</span>
                    <span className="font-semibold">
                      {(((location.stateRate + location.federalRate) * 100)).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </SkeletonCardWrapper>
  )
}

// Wrap with error boundary
const TaxSavingsCalculatorCard = () => (
  <WithErrorBoundary cardName="Tax Savings Calculator" showDetails={false}>
    <TaxSavingsCalculatorCardComponent />
  </WithErrorBoundary>
)

export { TaxSavingsCalculatorCard }
export default memo(TaxSavingsCalculatorCard)