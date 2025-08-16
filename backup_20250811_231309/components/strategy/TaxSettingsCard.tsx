'use client'

import { useState, useEffect, memo } from 'react'
import { Settings, MapPin, User, FileText, Save, AlertCircle, CheckCircle, Calculator, DollarSign, TrendingUp } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { calculateTotalTaxBurden, formatCurrency, formatPercentage, FEDERAL_TAX_BRACKETS_2024, STATE_TAX_INFO, getQualifiedDividendRate } from '@/lib/tax-brackets'

interface TaxSettingsData {
  location: string
  filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household'
  federalRate: number
  stateRate: number
  estimatedQuarterly: boolean
  withholding: number
  annualIncome: number
}

const TaxSettingsCardComponent = () => {
  const { profileData, updateProfile } = useUserProfile()
  const [isVisible, setIsVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [settings, setSettings] = useState<TaxSettingsData>({
    location: '',
    filingStatus: 'single',
    federalRate: 0.22,
    stateRate: 0.05,
    estimatedQuarterly: true,
    withholding: 0,
    annualIncome: 75000
  })

  useEffect(() => {
    if (profileData) {
      setSettings({
        location: profileData.location?.state || '',
        filingStatus: profileData.taxInfo?.filingStatus || 'single',
        federalRate: (profileData.taxInfo?.federalRate || 22) / 100,
        stateRate: (profileData.taxInfo?.stateRate || 5) / 100,
        estimatedQuarterly: true, // Default value, not in current interface
        withholding: 0, // Default value, not in current interface
        annualIncome: 75000 // Default value, not in current interface
      })
    }
    setIsVisible(true)
  }, [profileData])

  const locations = [
    { value: 'Puerto Rico', label: 'Puerto Rico', stateRate: 0.04, highlight: true },
    { value: 'Texas', label: 'Texas', stateRate: 0.0 },
    { value: 'Florida', label: 'Florida', stateRate: 0.0 },
    { value: 'California', label: 'California', stateRate: 0.133 },
    { value: 'New York', label: 'New York', stateRate: 0.108 },
    { value: 'Other', label: 'Other State', stateRate: 0.05 }
  ]

  const filingStatuses = [
    { value: 'single', label: 'Single' },
    { value: 'married_joint', label: 'Married Filing Jointly' },
    { value: 'married_separate', label: 'Married Filing Separately' },
    { value: 'head_of_household', label: 'Head of Household' }
  ]

  const handleLocationChange = (location: string) => {
    const locationData = locations.find(l => l.value === location)
    setSettings(prev => ({
      ...prev,
      location,
      stateRate: locationData?.stateRate || 0.05
    }))
  }

  const handleSave = async () => {
    try {
      await updateProfile({
        location: { 
          country: 'US' as const,
          state: settings.location 
        },
        taxInfo: {
          filingStatus: settings.filingStatus,
          federalRate: Math.round(settings.federalRate * 100),
          stateRate: Math.round(settings.stateRate * 100),
          capitalGainsRate: 15 // Default capital gains rate
        }
      })
      setIsEditing(false)
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (error) {
      // Error handled by emergency recovery script

  const getLocationBenefit = (location: string) => {
    if (location === 'Puerto Rico') {
      return { text: '0% dividend tax', color: 'text-green-600', bg: 'bg-green-50' }
    } else if (location === 'Texas' || location === 'Florida') {
      return { text: 'No state tax', color: 'text-blue-600', bg: 'bg-blue-50' }
    } else if (location === 'California') {
      return { text: 'High tax state', color: 'text-red-600', bg: 'bg-red-50' }
    } else if (location === 'New York') {
      return { text: 'High tax state', color: 'text-red-600', bg: 'bg-red-50' }
    }
    return { text: 'Standard rates', color: 'text-slate-600', bg: 'bg-slate-50' }
  }

  return (
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Tax Settings
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure your tax preferences and location for optimized calculations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {showSaveSuccess && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Saved!</span>
            </div>
          )}
          <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Tax Location Settings */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-700 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              Tax Location
            </h4>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Settings
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locations.map((location) => (
                  <button
                    key={location.value}
                    onClick={() => handleLocationChange(location.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      settings.location === location.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${location.highlight ? 'ring-2 ring-green-200' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">{location.label}</span>
                      {location.highlight && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Best
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {location.stateRate === 0 ? 'No state tax' : `${(location.stateRate * 100).toFixed(1)}% state tax`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-700">{settings.location || 'Not set'}</div>
                  <div className="text-sm text-slate-500">
                    State tax rate: {(settings.stateRate * 100).toFixed(1)}%
                  </div>
                </div>
                {settings.location && (
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getLocationBenefit(settings.location).bg
                  } ${getLocationBenefit(settings.location).color}`}>
                    {getLocationBenefit(settings.location).text}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filing Status */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
            <User className="w-4 h-4 mr-2 text-purple-600" />
            Filing Status
          </h4>

          {isEditing ? (
            <select
              value={settings.filingStatus}
              onChange={(e) => setSettings(prev => ({ ...prev, filingStatus: e.target.value as TaxSettingsData['filingStatus'] }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filingStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="font-medium text-slate-700">{settings.filingStatus}</div>
            </div>
          )}
        </div>

        {/* Tax Rates */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-green-600" />
            Tax Rates
          </h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Federal Rate</span>
                <span className="font-semibold text-slate-700">
                  {(settings.federalRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">State Rate</span>
                <span className="font-semibold text-slate-700">
                  {(settings.stateRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Annual Income Input */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
            Annual Income
          </h4>

          {isEditing ? (
            <div>
              <label className="block text-sm text-slate-600 mb-2">
                Enter your annual income for accurate tax calculations
              </label>
              <input
                type="number"
                value={settings.annualIncome}
                onChange={(e) => setSettings(prev => ({ ...prev, annualIncome: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="75000"
                min="0"
                max="10000000"
                step="1000"
              />
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="font-semibold text-slate-700 text-lg">
                {formatCurrency(settings.annualIncome)}
              </div>
              <div className="text-sm text-slate-500">Annual income for tax calculations</div>
            </div>
          )}
        </div>

        {/* Tax Bracket Calculator */}
        {settings.annualIncome > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-purple-600" />
              Tax Bracket Calculator
            </h4>

            {(() => {
              const taxResult = calculateTotalTaxBurden(settings.annualIncome, settings.filingStatus, settings.location)
              const mappedFilingStatus = settings.filingStatus === 'single' ? 'Single' :
                                       settings.filingStatus === 'married_joint' ? 'Married Filing Jointly' :
                                       settings.filingStatus === 'married_separate' ? 'Married Filing Separately' :
                                       settings.filingStatus === 'head_of_household' ? 'Head of Household' : 'Single'
              const federalBrackets = FEDERAL_TAX_BRACKETS_2024[mappedFilingStatus] || FEDERAL_TAX_BRACKETS_2024['Single']
              const qualifiedDivRate = getQualifiedDividendRate(settings.location, settings.filingStatus, settings.annualIncome)

              return (
                <div className="space-y-4">
                  {/* Tax Summary */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-700">{formatPercentage(taxResult.marginalRate)}</div>
                        <div className="text-sm text-slate-500">Marginal Rate</div>
                        <div className="text-xs text-slate-400">Top tax bracket</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-700">{formatPercentage(taxResult.effectiveRate)}</div>
                        <div className="text-sm text-slate-500">Effective Rate</div>
                        <div className="text-xs text-slate-400">Overall tax rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-700">{formatCurrency(taxResult.totalTax)}</div>
                        <div className="text-sm text-slate-500">Total Tax</div>
                        <div className="text-xs text-slate-400">Federal + State</div>
                      </div>
                    </div>
                  </div>

                  {/* Federal Bracket Breakdown */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h5 className="font-medium text-slate-700 mb-3">Federal Tax Brackets ({filingStatuses.find(f => f.value === settings.filingStatus)?.label})</h5>
                    <div className="space-y-2">
                      {federalBrackets.slice(0, taxResult.bracketIndex + 1).map((bracket, index) => {
                        const isCurrentBracket = index === taxResult.bracketIndex
                        const incomeInBracket = Math.min(settings.annualIncome, bracket.max) - bracket.min
                        const taxFromBracket = incomeInBracket * bracket.rate
                        
                        return (
                          <div key={index} className={`flex justify-between items-center p-2 rounded ${
                            isCurrentBracket ? 'bg-blue-100 border border-blue-200' : 'bg-white'
                          }`}>
                            <div className="flex items-center space-x-2">
                              {isCurrentBracket && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              <span className="text-sm">
                                {formatPercentage(bracket.rate)} on {formatCurrency(bracket.min)} - {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
                              </span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(taxFromBracket)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Dividend Tax Rate */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Qualified Dividends</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatPercentage(qualifiedDivRate)}
                        </div>
                        {settings.location === 'Puerto Rico' && (
                          <div className="text-xs text-green-600 font-medium">Special Rate!</div>
                        )}
                      </div>
                    </div>
                    {settings.location === 'Puerto Rico' && (
                      <div className="mt-2 text-sm text-green-700">
                        ✨ Puerto Rico residents pay 0% federal tax on qualified dividends
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* State Tax Comparison */}
        {settings.location && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-orange-600" />
              State Tax Comparison
            </h4>

            {(() => {
              const compareStates = ['Texas', 'Florida', 'California', 'New York', 'Puerto Rico']
              const comparisons = compareStates.map(state => {
                const taxResult = calculateTotalTaxBurden(settings.annualIncome, settings.filingStatus, state)
                const stateInfo = STATE_TAX_INFO[state]
                return { state, taxResult, stateInfo }
              }).sort((a, b) => a.taxResult.totalTax - b.taxResult.totalTax)

              const currentStateTax = calculateTotalTaxBurden(settings.annualIncome, settings.filingStatus, settings.location)
              
              return (
                <div className="space-y-2">
                  <div className="text-sm text-slate-600 mb-3">
                    Annual tax burden comparison (based on {formatCurrency(settings.annualIncome)} income):
                  </div>
                  
                  {comparisons.map(({ state, taxResult, stateInfo }, index) => {
                    const isCurrentState = state === settings.location
                    const savings = currentStateTax.totalTax - taxResult.totalTax
                    
                    return (
                      <div key={state} className={`flex justify-between items-center p-3 rounded-lg ${
                        isCurrentState ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            index === 0 ? 'bg-green-100 text-green-700' :
                            index === 1 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-slate-700">{state}</div>
                            <div className="text-xs text-slate-500">
                              {!stateInfo.hasIncomeTax ? 'No state tax' : 
                               stateInfo.flatRate ? `${formatPercentage(stateInfo.flatRate)} flat rate` :
                               'Progressive brackets'}
                            </div>
                          </div>
                          {isCurrentState && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-700">
                            {formatCurrency(taxResult.totalTax)}
                          </div>
                          {!isCurrentState && (
                            <div className={`text-sm ${
                              savings > 0 ? 'text-green-600' : savings < 0 ? 'text-red-600' : 'text-slate-500'
                            }`}>
                              {savings > 0 ? 'Save ' : savings < 0 ? 'Cost ' : ''}
                              {savings !== 0 ? formatCurrency(Math.abs(savings)) : 'Same'}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}

        {/* Quarterly Estimates */}
        <div>
          <h4 className="font-semibold text-slate-700 mb-3">Tax Planning Preferences</h4>
          
          {isEditing ? (
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.estimatedQuarterly}
                  onChange={(e) => setSettings(prev => ({ ...prev, estimatedQuarterly: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Calculate quarterly estimated taxes</span>
              </label>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {settings.estimatedQuarterly ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-slate-700">
                  Quarterly estimates: {settings.estimatedQuarterly ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { TaxSettingsCardComponent as TaxSettingsCard }
export default memo(TaxSettingsCardComponent)