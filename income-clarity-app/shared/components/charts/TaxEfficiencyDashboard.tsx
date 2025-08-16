'use client'

import React, { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import { 
  MapPin, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Calculator,
  Plane,
  Award,
  AlertTriangle
} from 'lucide-react'

interface LocationTaxData {
  location: string
  state: string
  federalRate: number
  stateRate: number
  totalRate: number
  grossIncome: number
  totalTax: number
  netIncome: number
  annualSavings: number
  specialProgram?: string
  programDetails?: string
}

interface TaxEfficiencyDashboardProps {
  currentLocation?: string
  grossAnnualIncome?: number
  className?: string
  userLocation?: string
  portfolioValue?: number
}

// Mock data generator for tax comparison
const generateTaxData = (grossIncome: number): LocationTaxData[] => {
  return [
    {
      location: 'Puerto Rico',
      state: 'PR',
      federalRate: 0, // Act 60 exemption
      stateRate: 5, // Act 60 preferential rate
      totalRate: 5,
      grossIncome,
      totalTax: grossIncome * 0.05,
      netIncome: grossIncome * 0.95,
      annualSavings: 0, // baseline
      specialProgram: 'Act 60',
      programDetails: 'Individual Investor License - 0% federal tax on passive income'
    },
    {
      location: 'Nevada',
      state: 'NV',
      federalRate: 15,
      stateRate: 0,
      totalRate: 15,
      grossIncome,
      totalTax: grossIncome * 0.15,
      netIncome: grossIncome * 0.85,
      annualSavings: grossIncome * 0.10,
      specialProgram: 'No State Tax',
      programDetails: 'No state income tax on dividends'
    },
    {
      location: 'Texas',
      state: 'TX',
      federalRate: 15,
      stateRate: 0,
      totalRate: 15,
      grossIncome,
      totalTax: grossIncome * 0.15,
      netIncome: grossIncome * 0.85,
      annualSavings: grossIncome * 0.10
    },
    {
      location: 'Florida',
      state: 'FL',
      federalRate: 15,
      stateRate: 0,
      totalRate: 15,
      grossIncome,
      totalTax: grossIncome * 0.15,
      netIncome: grossIncome * 0.85,
      annualSavings: grossIncome * 0.10
    },
    {
      location: 'Tennessee',
      state: 'TN',
      federalRate: 15,
      stateRate: 0,
      totalRate: 15,
      grossIncome,
      totalTax: grossIncome * 0.15,
      netIncome: grossIncome * 0.85,
      annualSavings: grossIncome * 0.10
    },
    {
      location: 'New Hampshire',
      state: 'NH',
      federalRate: 15,
      stateRate: 0,
      totalRate: 15,
      grossIncome,
      totalTax: grossIncome * 0.15,
      netIncome: grossIncome * 0.85,
      annualSavings: grossIncome * 0.10
    },
    {
      location: 'Washington',
      state: 'WA',
      federalRate: 15,
      stateRate: 0,
      totalRate: 15,
      grossIncome,
      totalTax: grossIncome * 0.15,
      netIncome: grossIncome * 0.85,
      annualSavings: grossIncome * 0.10
    },
    {
      location: 'Delaware',
      state: 'DE',
      federalRate: 15,
      stateRate: 6.6,
      totalRate: 21.6,
      grossIncome,
      totalTax: grossIncome * 0.216,
      netIncome: grossIncome * 0.784,
      annualSavings: grossIncome * 0.064
    },
    {
      location: 'New York',
      state: 'NY',
      federalRate: 15,
      stateRate: 10.9,
      totalRate: 25.9,
      grossIncome,
      totalTax: grossIncome * 0.259,
      netIncome: grossIncome * 0.741,
      annualSavings: grossIncome * 0.009
    },
    {
      location: 'California',
      state: 'CA',
      federalRate: 15,
      stateRate: 13.3,
      totalRate: 28.3,
      grossIncome,
      totalTax: grossIncome * 0.283,
      netIncome: grossIncome * 0.717,
      annualSavings: 0, // worst case baseline
      specialProgram: 'High Tax State',
      programDetails: 'Highest state tax rate in the US'
    }
  ]
}

export function TaxEfficiencyDashboard({
  currentLocation = 'California',
  grossAnnualIncome = 50000,
  className = '',
  userLocation,
  portfolioValue
}: TaxEfficiencyDashboardProps) {
  const [view, setView] = useState<'comparison' | 'savings' | 'optimization'>('comparison')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  const taxData = useMemo(() => {
    return generateTaxData(grossAnnualIncome).sort((a, b) => a.totalRate - b.totalRate)
  }, [grossAnnualIncome])

  const currentData = taxData.find(d => d.location === currentLocation) || taxData[taxData.length - 1]
  const bestLocation = taxData[0]
  const maxSavings = currentData.totalTax - bestLocation.totalTax

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <p className="font-semibold text-gray-900 dark:text-gray-100">{data.location}</p>
            {data.specialProgram && (
              <Award className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">Total Tax Rate:</span>
              <span className="text-sm font-medium text-red-600">{data.totalRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Annual Tax:</span>
              <span className="text-sm font-medium text-red-600">${data.totalTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Net Income:</span>
              <span className="text-sm font-medium text-green-600">${data.netIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">vs Current:</span>
              <span className={`text-sm font-medium ${
                data.annualSavings > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.annualSavings > 0 ? '+' : ''}${data.annualSavings.toLocaleString()}
              </span>
            </div>
            {data.specialProgram && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-blue-600 font-medium">{data.specialProgram}</p>
                {data.programDetails && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">{data.programDetails}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const getLocationColor = (location: LocationTaxData) => {
    if (location.totalRate <= 10) return '#10b981' // Green - Excellent
    if (location.totalRate <= 20) return '#3b82f6' // Blue - Good
    if (location.totalRate <= 25) return '#f59e0b' // Yellow - Fair
    return '#ef4444' // Red - High tax
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Tax Efficiency Dashboard
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare tax burden across locations
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setView('comparison')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === 'comparison'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setView('savings')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === 'savings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Savings
          </button>
          <button
            onClick={() => setView('optimization')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === 'optimization'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Optimization
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            {currentData.totalRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current Tax Rate
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {bestLocation.totalRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Best Available
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            ${maxSavings.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Max Annual Savings
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            ${currentData.netIncome.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current Net Income
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'comparison' ? (
            <BarChart data={taxData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="state"
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar 
                dataKey="federalRate" 
                stackId="tax"
                fill="#3b82f6" 
                name="Federal Tax"
                onMouseEnter={(data: any) => setSelectedLocation(data.location)}
                onMouseLeave={() => setSelectedLocation(null)}
              />
              <Bar 
                dataKey="stateRate" 
                stackId="tax"
                fill="#ef4444" 
                name="State Tax"
              />
            </BarChart>
          ) : view === 'savings' ? (
            <BarChart data={taxData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="state"
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar dataKey="annualSavings" name="Annual Savings vs Current">
                {taxData.map((entry, index) => (
                  <Bar 
                    key={`cell-${index}`}
                    fill={entry.annualSavings >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <ComposedChart data={taxData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="state"
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar dataKey="totalTax" fill="#ef4444" name="Total Tax" opacity={0.6} />
              <Bar dataKey="netIncome" fill="#10b981" name="Net Income" opacity={0.8} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Location Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Tax-Efficient Locations */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              Most Tax-Efficient Locations
            </h4>
          </div>
          <div className="space-y-2">
            {taxData.slice(0, 3).map((location, index) => (
              <div key={location.location} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      'bg-orange-400 text-orange-900'}
                  `}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {location.location}
                  </span>
                  {location.specialProgram && (
                    <Award className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">
                    {location.totalRate}%
                  </div>
                  <div className="text-xs text-gray-500">
                    ${(currentData.totalTax - location.totalTax).toLocaleString()} saved
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relocation Analysis */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Plane className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              Relocation ROI Analysis
            </h4>
          </div>
          
          {(() => {
            const topLocation = taxData[0]
            const annualSavings = currentData.totalTax - topLocation.totalTax
            const movingCost = 15000 // Estimated moving cost
            const breakEvenMonths = Math.ceil(movingCost / (annualSavings / 12))
            
            return (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Best Location:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {topLocation.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Annual Savings:</span>
                  <span className="text-sm font-medium text-green-600">
                    ${annualSavings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Est. Moving Cost:</span>
                  <span className="text-sm font-medium text-orange-600">
                    ${movingCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Break-even Time:</span>
                  <span className="text-sm font-medium text-blue-600">
                    {breakEvenMonths} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">5-Year Savings:</span>
                  <span className="text-sm font-bold text-green-600">
                    ${(annualSavings * 5 - movingCost).toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Puerto Rico Act 60 Spotlight */}
      {taxData.find(d => d.location === 'Puerto Rico') && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border-2 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Puerto Rico Act 60 - Individual Investor License
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Potentially the most tax-efficient location for dividend investors
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${(currentData.totalTax - (taxData.find(d => d.location === 'Puerto Rico')?.totalTax || 0)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Annual Savings
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Federal Tax</div>
              <div className="text-xs text-gray-500 mt-1">On passive income</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-600">5%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Local Tax</div>
              <div className="text-xs text-gray-500 mt-1">Preferential rate</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <div className="text-lg font-bold text-purple-600">183</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days Required</div>
              <div className="text-xs text-gray-500 mt-1">Per year in PR</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Requirements Apply
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Consult with a tax professional. Requirements include minimum investment amounts,
                  residency obligations, and proper application procedures.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}