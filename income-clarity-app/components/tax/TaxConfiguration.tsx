'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Calculator, 
  TrendingUp, 
  DollarSign,
  Info,
  Check,
  ChevronDown,
  Building,
  Plane,
  PiggyBank,
  AlertCircle,
  Star
} from 'lucide-react'
import { STATE_TAX_DATA, taxCalculatorService } from '@/lib/services/tax-calculator.service'

interface TaxConfigurationProps {
  onSave?: (config: any) => void
  initialState?: string
  initialFilingStatus?: string
  monthlyDividendIncome?: number
}

export function TaxConfiguration({ 
  onSave, 
  initialState = '',
  initialFilingStatus = 'single',
  monthlyDividendIncome = 5000
}: TaxConfigurationProps) {
  const [selectedState, setSelectedState] = useState(initialState)
  const [filingStatus, setFilingStatus] = useState<'single' | 'married_jointly'>(
    initialFilingStatus as 'single' | 'married_jointly'
  )
  const [annualIncome, setAnnualIncome] = useState(monthlyDividendIncome * 12)
  const [showComparison, setShowComparison] = useState(false)
  const [compareStates, setCompareStates] = useState<string[]>(['CA', 'TX', 'FL', 'PR'])
  
  // Calculate tax for current selection
  const currentTaxCalc = selectedState 
    ? taxCalculatorService.calculateDividendTax(annualIncome, selectedState, filingStatus)
    : null
  
  // Get best states for dividends
  const bestStates = taxCalculatorService.getBestStatesForDividends()
  
  // Get tax optimization suggestions
  const suggestions = selectedState 
    ? taxCalculatorService.getTaxOptimizationSuggestions(selectedState, annualIncome)
    : []
  
  // Compare multiple states
  const stateComparisons = showComparison
    ? taxCalculatorService.compareStates(annualIncome, compareStates, filingStatus)
    : []

  const handleSave = () => {
    if (onSave && selectedState) {
      onSave({
        state: selectedState,
        filingStatus,
        annualDividendIncome: annualIncome,
        taxCalculation: currentTaxCalc
      })
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Calculator className="w-6 h-6 mr-2 text-blue-600" />
              Tax Configuration
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Optimize your dividend income with location intelligence
            </p>
          </div>
          
          {currentTaxCalc && currentTaxCalc.taxSavings && currentTaxCalc.taxSavings > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Annual Tax Savings</div>
              <div className="text-2xl font-bold text-green-600">
                +${currentTaxCalc.taxSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-500">vs California</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* State Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Tax Location
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select State</option>
              <optgroup label="🌟 Best for Dividends">
                {bestStates.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name} {state.code === 'PR' ? '🏝️ (0% Act 60!)' : state.hasNoStateTax ? '(No Tax!)' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All States">
                {Object.values(STATE_TAX_DATA)
                  .filter(state => !bestStates.includes(state))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name} ({(state.dividendTaxRate * 100).toFixed(1)}% tax)
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Filing Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Filing Status
            </label>
            <select
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as 'single' | 'married_jointly')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">Single</option>
              <option value="married_jointly">Married Filing Jointly</option>
            </select>
          </div>

          {/* Annual Dividend Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Annual Dividend Income
            </label>
            <input
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="60000"
            />
          </div>
        </div>

        {/* Tax Calculation Display */}
        {currentTaxCalc && selectedState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                     rounded-xl p-6 border border-blue-200 dark:border-blue-800"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tax Calculation for {STATE_TAX_DATA[selectedState].name}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">Gross Income</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  ${currentTaxCalc.grossIncome.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">Federal Tax</div>
                <div className="text-xl font-bold text-orange-600">
                  -${currentTaxCalc.federalTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-gray-500">
                  ({((currentTaxCalc.federalTax / currentTaxCalc.grossIncome) * 100).toFixed(1)}%)
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">State Tax</div>
                <div className={`text-xl font-bold ${currentTaxCalc.stateTax === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {currentTaxCalc.stateTax === 0 ? (
                    <span className="flex items-center">
                      <Check className="w-5 h-5 mr-1" />
                      $0
                    </span>
                  ) : (
                    `-$${currentTaxCalc.stateTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  ({(STATE_TAX_DATA[selectedState].dividendTaxRate * 100).toFixed(1)}%)
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">Net Income</div>
                <div className="text-xl font-bold text-green-600">
                  ${currentTaxCalc.netIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-gray-500">
                  ({((currentTaxCalc.netIncome / currentTaxCalc.grossIncome) * 100).toFixed(1)}% kept)
                </div>
              </div>
            </div>

            {/* Special Notes */}
            {STATE_TAX_DATA[selectedState].specialNotes && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    {STATE_TAX_DATA[selectedState].specialNotes}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* State Comparison */}
        <div>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm mb-4"
          >
            <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showComparison ? 'rotate-180' : ''}`} />
            {showComparison ? 'Hide' : 'Show'} State Comparison
          </button>
          
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {stateComparisons.map((comparison, index) => {
                  const isCurrentState = comparison.state.code === selectedState;
                  const isBest = index === 0;
                  
                  return (
                    <div
                      key={comparison.state.code}
                      className={`p-4 rounded-lg border ${
                        isCurrentState 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : isBest
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {isBest && <Star className="w-5 h-5 text-green-600 mr-2" />}
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {comparison.state.name}
                              {comparison.state.code === 'PR' && ' 🏝️'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {comparison.state.specialNotes || `${(comparison.state.dividendTaxRate * 100).toFixed(1)}% state tax`}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ${comparison.calculation.netIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(comparison.calculation.effectiveRate * 100).toFixed(1)}% effective rate
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tax Optimization Suggestions */}
        {suggestions.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                        rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Tax Optimization Strategies
            </h3>
            
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Puerto Rico Act 60 Special Callout */}
        {selectedState !== 'PR' && annualIncome > 50000 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Plane className="w-6 h-6 mr-2" />
                  <h3 className="text-xl font-bold">Puerto Rico Act 60 Opportunity</h3>
                </div>
                <p className="text-cyan-100 text-sm mb-3">
                  Qualified residents pay 0% tax on dividend income from Puerto Rico sources
                </p>
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="text-xs text-cyan-200">Your Current Tax</div>
                    <div className="text-2xl font-bold">
                      ${((currentTaxCalc?.federalTax || 0) + (currentTaxCalc?.stateTax || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="text-3xl">→</div>
                  <div>
                    <div className="text-xs text-cyan-200">With Act 60</div>
                    <div className="text-2xl font-bold">$0</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-cyan-200">Annual Savings</div>
                <div className="text-3xl font-bold">
                  ${((currentTaxCalc?.federalTax || 0) + (currentTaxCalc?.stateTax || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        {onSave && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!selectedState}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors flex items-center"
            >
              <Check className="w-5 h-5 mr-2" />
              Save Tax Configuration
            </button>
          </div>
        )}
      </div>
    </div>
  )
}