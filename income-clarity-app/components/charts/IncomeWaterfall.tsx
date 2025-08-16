'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { 
  DollarSign, 
  TrendingDown, 
  Home, 
  ShoppingBag, 
  Car,
  Zap,
  Banknote,
  ArrowDown,
  ArrowRight,
  MapPin,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

interface WaterfallData {
  category: string
  value: number
  cumulativeValue: number
  type: 'positive' | 'negative' | 'total'
  icon: React.ReactNode
  description: string
  details?: string[]
}

interface IncomeWaterfallProps {
  data?: WaterfallData[]
  timeframe?: 'monthly' | 'annual'
  location?: string
  className?: string
  incomeData?: {
    dividendIncome: number
    expenses: { category: string, amount: number }[]
    taxes: { federal: number, state: number, local: number }
  }
}

interface IncomeRecord {
  category: string
  amount: number
  source: string
  date: string
}

interface ExpenseRecord {
  category: string
  amount: number
  date: string
}

// Helper function to calculate tax rates based on location
const calculateTaxRates = (location: string, income: number) => {
  const isPuertoRico = location.toLowerCase().includes('puerto rico')
  const isTexas = location.toLowerCase().includes('texas')
  const isFlorida = location.toLowerCase().includes('florida')
  const isNevada = location.toLowerCase().includes('nevada')
  
  // Federal tax rates for qualified dividends (0%, 15%, or 20%)
  let federalDividendRate = 0.15 // Most common rate
  if (income < 44625) federalDividendRate = 0 // 2024 thresholds for single filers
  if (income > 492300) federalDividendRate = 0.20
  
  // State tax rates
  let stateRate = 0
  if (!isPuertoRico && !isTexas && !isFlorida && !isNevada) {
    // California example - high tax state
    if (location.toLowerCase().includes('california')) stateRate = 0.093
    else if (location.toLowerCase().includes('new york')) stateRate = 0.085
    else stateRate = 0.05 // Average state tax rate
  }
  
  // Puerto Rico Act 60 special rates
  const puertoRicoRate = isPuertoRico ? 0.05 : 0
  
  return {
    federal: isPuertoRico ? 0 : federalDividendRate,
    state: stateRate,
    local: puertoRicoRate
  }
}

// Convert real income and expense data to waterfall format
const generateWaterfallFromRealData = (
  incomeRecords: IncomeRecord[],
  expenseRecords: ExpenseRecord[],
  timeframe: 'monthly' | 'annual',
  location: string
): WaterfallData[] => {
  const multiplier = timeframe === 'annual' ? 12 : 1
  
  // Calculate total dividend income
  const dividendIncome = incomeRecords
    .filter(record => record.category === 'DIVIDEND')
    .reduce((sum, record) => sum + record.amount, 0) * multiplier
  
  if (dividendIncome === 0) {
    return [] // Return empty array if no dividend income
  }
  
  const taxRates = calculateTaxRates(location, dividendIncome)
  const federalTax = dividendIncome * taxRates.federal
  const stateTax = dividendIncome * taxRates.state
  const localTax = dividendIncome * taxRates.local
  
  const netIncome = dividendIncome - federalTax - stateTax - localTax
  
  // Group expenses by category
  const expensesByCategory = expenseRecords.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)
  
  // Apply timeframe multiplier to expenses
  Object.keys(expensesByCategory).forEach(category => {
    expensesByCategory[category] *= multiplier
  })
  
  const data: WaterfallData[] = [
    {
      category: 'Dividend Income',
      value: dividendIncome,
      cumulativeValue: dividendIncome,
      type: 'positive',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Total dividend income',
      details: incomeRecords
        .filter(record => record.category === 'DIVIDEND')
        .map(record => `${record.source}: $${(record.amount * multiplier).toLocaleString()}`)
    },
    {
      category: 'Federal Taxes',
      value: -federalTax,
      cumulativeValue: dividendIncome - federalTax,
      type: 'negative',
      icon: <TrendingDown className="w-4 h-4" />,
      description: location.toLowerCase().includes('puerto rico') 
        ? 'No federal tax (Act 60)' 
        : `Federal dividend tax (${(taxRates.federal * 100).toFixed(1)}%)`,
      details: location.toLowerCase().includes('puerto rico') 
        ? ['Act 60 tax exemption']
        : [`${(taxRates.federal * 100).toFixed(1)}% on qualified dividends`]
    }
  ]
  
  if (stateTax > 0 || localTax > 0) {
    data.push({
      category: 'State/Local Taxes',
      value: -(stateTax + localTax),
      cumulativeValue: netIncome,
      type: 'negative',
      icon: <MapPin className="w-4 h-4" />,
      description: location.toLowerCase().includes('puerto rico')
        ? 'PR Act 60 rate (5%)'
        : `${location} tax (${((taxRates.state + taxRates.local) * 100).toFixed(1)}%)`,
      details: [
        location.toLowerCase().includes('puerto rico')
          ? 'Act 60 preferential rate'
          : `State/local dividend tax`
      ]
    })
  }
  
  // Extract expense amounts from categorized data
  const housing = expensesByCategory['HOUSING'] || 0
  const food = expensesByCategory['FOOD'] || 0
  const transport = expensesByCategory['TRANSPORTATION'] || 0
  const utilities = expensesByCategory['UTILITIES'] || 0
  const other = Object.keys(expensesByCategory)
    .filter(cat => !['HOUSING', 'FOOD', 'TRANSPORTATION', 'UTILITIES'].includes(cat))
    .reduce((sum, cat) => sum + expensesByCategory[cat], 0)
  
  const totalExpenses = housing + food + transport + utilities + other
  const available = netIncome - totalExpenses
  const grossIncome = dividendIncome
  
  data.push({
    category: 'Net Income',
    value: netIncome,
    cumulativeValue: netIncome,
    type: 'total',
    icon: <Banknote className="w-4 h-4" />,
    description: 'After-tax income available',
    details: [`${((netIncome / grossIncome) * 100).toFixed(1)}% of gross income`]
  })
  
  data.push({
    category: 'Housing',
    value: -housing,
    cumulativeValue: netIncome - housing,
    type: 'negative',
    icon: <Home className="w-4 h-4" />,
    description: 'Rent/mortgage & utilities',
    details: ['Rent/Mortgage', 'Property taxes', 'Insurance', 'Maintenance']
  })

  data.push({
    category: 'Food & Dining',
    value: -food,
    cumulativeValue: netIncome - housing - food,
    type: 'negative',
    icon: <ShoppingBag className="w-4 h-4" />,
    description: 'Groceries & restaurants',
    details: ['Groceries', 'Restaurants', 'Coffee/drinks']
  })

  data.push({
    category: 'Transportation',
    value: -transport,
    cumulativeValue: netIncome - housing - food - transport,
    type: 'negative',
    icon: <Car className="w-4 h-4" />,
    description: 'Car payment, gas, insurance',
    details: ['Car payment', 'Gas', 'Insurance', 'Maintenance']
  })

  data.push({
    category: 'Utilities',
    value: -utilities,
    cumulativeValue: netIncome - housing - food - transport - utilities,
    type: 'negative',
    icon: <Zap className="w-4 h-4" />,
    description: 'Electric, internet, phone',
    details: ['Electricity', 'Internet', 'Phone', 'Streaming services']
  })

  data.push({
    category: 'Other Expenses',
    value: -other,
    cumulativeValue: available,
    type: 'negative',
    icon: <ShoppingBag className="w-4 h-4" />,
    description: 'Miscellaneous spending',
    details: ['Entertainment', 'Healthcare', 'Personal care', 'Shopping']
  })

  data.push({
    category: 'Available to Save',
    value: available,
    cumulativeValue: available,
    type: available > 0 ? 'positive' : 'negative',
    icon: <Banknote className="w-4 h-4" />,
    description: 'Amount left for investing',
    details: [`${((available / grossIncome) * 100).toFixed(1)}% of gross income`]
  })
  
  return data
}

export function IncomeWaterfall({
  data,
  timeframe = 'monthly',
  location = 'California',
  className = '',
  incomeData
}: IncomeWaterfallProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [showAnimation, setShowAnimation] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const waterfallData = useMemo(() => {
    // Use provided data first
    if (data && data.length > 0) {
      return data
    }
    
    // If incomeData is provided, use it to generate real waterfall
    if (incomeData) {
      // Convert provided income data to our format
      const incomeRecords: IncomeRecord[] = [{
        category: 'DIVIDEND',
        amount: incomeData.dividendIncome,
        source: 'Portfolio Dividends',
        date: new Date().toISOString()
      }]
      
      const expenseRecords: ExpenseRecord[] = incomeData.expenses.map(expense => ({
        category: expense.category.toUpperCase(),
        amount: expense.amount,
        date: new Date().toISOString()
      }))
      
      return generateWaterfallFromRealData(incomeRecords, expenseRecords, timeframe, location)
    }
    
    // Return empty array if no real data available
    return []
  }, [data, incomeData, timeframe, location])

  // Show empty state when no data
  if (!isLoading && waterfallData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Income Waterfall
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your income flow and expenses
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Income Data Available
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add dividend income and expense records to see your income waterfall analysis.
            This chart shows how your income flows through taxes and expenses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Income Records
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Add Expenses
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getBarColor = (type: string, category: string) => {
    if (type === 'positive') return '#10b981'
    if (type === 'total') return category === 'Available to Save' ? '#3b82f6' : '#6366f1'
    return '#ef4444'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-gray-600 dark:text-gray-400">
              {data.icon}
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{data.description}</p>
          <div className="space-y-1">
            <p className={`text-lg font-bold ${
              data.type === 'positive' ? 'text-green-600' : 
              data.type === 'negative' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {data.value > 0 ? '+' : ''}${Math.abs(data.value).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Running total: ${data.cumulativeValue.toLocaleString()}
            </p>
            {data.details && data.details.length > 0 && (
              <div className="mt-2 space-y-1">
                {data.details.map((detail: string, index: number) => (
                  <p key={index} className="text-xs text-gray-500 dark:text-gray-400">
                    • {detail}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const finalAmount = waterfallData[waterfallData.length - 1]?.cumulativeValue || 0
  const grossIncome = waterfallData[0]?.value || 0

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Income Waterfall
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              From gross income to available savings
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setShowAnimation(!showAnimation)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                showAnimation
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {showAnimation ? 'Animation On' : 'Animation Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            ${grossIncome.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Gross Income
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">
            ${(grossIncome - waterfallData.find(d => d.category === 'Net Income')?.cumulativeValue || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Taxes
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">
            ${((waterfallData.find(d => d.category === 'Net Income')?.cumulativeValue || 0) - finalAmount).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Expenses
          </div>
        </div>

        <div className={`p-4 rounded-lg text-center ${
          finalAmount > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20'
        }`}>
          <div className={`text-2xl font-bold ${
            finalAmount > 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            ${Math.abs(finalAmount).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {finalAmount > 0 ? 'Available' : 'Shortfall'}
          </div>
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={waterfallData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="category"
              stroke="#6b7280"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Bar
              dataKey="cumulativeValue"
              fill="#8884d8"
              onMouseEnter={(data: any) => setSelectedStep(data.category)}
              onMouseLeave={() => setSelectedStep(null)}
            >
              {waterfallData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={getBarColor(entry.type, entry.category)}
                  fillOpacity={selectedStep === entry.category ? 1 : 0.8}
                  stroke={selectedStep === entry.category ? '#ffffff' : 'none'}
                  strokeWidth={selectedStep === entry.category ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Flow Visualization */}
      {showAnimation && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Income Flow Breakdown
          </h4>
          <div className="flex flex-wrap items-center justify-center space-x-2 space-y-2">
            {waterfallData.slice(0, -1).map((step, index) => (
              <motion.div
                key={step.category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  step.type === 'positive' ? 'bg-green-100 text-green-800' :
                  step.type === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <div className="flex items-center space-x-1">
                    {step.icon}
                    <span>${Math.abs(step.value).toLocaleString()}</span>
                  </div>
                </div>
                {index < waterfallData.length - 2 && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Location Comparison */}
      {location.toLowerCase().includes('puerto rico') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Puerto Rico Tax Advantage</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Thanks to Act 60, you're saving approximately ${((grossIncome * 0.20) * (timeframe === 'annual' ? 1 : 12)).toLocaleString()} 
            {timeframe === 'monthly' ? ' annually' : ''} compared to high-tax states like California.
          </p>
        </div>
      )}

      {/* Summary Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className={`text-lg font-bold ${
              finalAmount > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {((finalAmount / grossIncome) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Savings Rate
            </div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-blue-600">
              {(((waterfallData.find(d => d.category === 'Net Income')?.cumulativeValue || 0) / grossIncome) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              After-Tax Rate
            </div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-orange-600">
              {finalAmount > 0 ? Math.floor(12 / ((finalAmount * 12) / (grossIncome * 12))) || '∞' : '∞'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Years to Double Income
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}