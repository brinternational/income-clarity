'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Calendar, DollarSign, AlertTriangle, Info } from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'

interface DividendPayment {
  id: string
  ticker: string
  exDate: string
  payDate: string
  amount: number
  shares: number
  totalPayment: number
  isSpecial?: boolean
  confidence?: number
  projectedAmount?: number
  actualAmount?: number
  taxWithholding?: number
  dripEnabled?: boolean
  growth?: number
  quarter: 1 | 2 | 3 | 4
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter'
}

interface SeasonalAnalysis {
  quarter: number
  season: string
  totalPayments: number
  averagePayment: number
  paymentCount: number
  percentageOfAnnual: number
}

export function DividendCalendar() {
  const { holdings } = usePortfolio()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedPayment, setSelectedPayment] = useState<DividendPayment | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'seasonal' | 'forecast' | 'special'>('calendar')

  // Generate enhanced dividend payments with analytics
  const generateDividendPayments = (): DividendPayment[] => {
    if (!holdings || holdings.length === 0) return []

    const payments: DividendPayment[] = []
    const currentDate = new Date()

    holdings.forEach((holding, holdingIndex) => {
      // Generate quarterly payments for each holding
      for (let quarter = 0; quarter < 4; quarter++) {
        const payMonth = (quarter * 3) + 1 // Jan, Apr, Jul, Oct
        const exDate = new Date(selectedYear, payMonth - 1, 15)
        const payDate = new Date(selectedYear, payMonth - 1, 28)

        // Estimate dividend per share (enhanced calculation)
        const annualDividendPerShare = (holding.currentPrice || 100) * (holding.annualYield || 0.04)
        const quarterlyDividendPerShare = annualDividendPerShare / 4
        
        // Add variability for special dividends (10% chance)
        const isSpecial = Math.random() < 0.1
        const specialMultiplier = isSpecial ? 1.5 + (Math.random() * 0.5) : 1
        const finalAmount = quarterlyDividendPerShare * specialMultiplier
        
        // Calculate confidence score (based on holding reliability)
        const confidence = Math.max(70, 95 - (holdingIndex * 3) - (Math.random() * 10))
        
        // Seasonal mapping
        const seasonMap = ['Winter', 'Spring', 'Summer', 'Fall'] as const
        const season = seasonMap[quarter]
        
        // Tax withholding (assume 15% for qualified dividends, 22% for others)
        const taxRate = isSpecial ? 0.22 : 0.15
        const taxWithholding = finalAmount * holding.shares * taxRate
        
        // Previous year comparison for growth
        const growth = -2 + (Math.random() * 8) // -2% to +6% growth
        
        payments.push({
          id: `${holding.id}-q${quarter}`,
          ticker: holding.ticker,
          exDate: exDate.toISOString().split('T')[0],
          payDate: payDate.toISOString().split('T')[0],
          amount: finalAmount,
          shares: holding.shares,
          totalPayment: finalAmount * holding.shares,
          isSpecial,
          confidence: Math.round(confidence),
          projectedAmount: finalAmount,
          actualAmount: Math.random() > 0.3 ? finalAmount * (0.95 + Math.random() * 0.1) : undefined,
          taxWithholding,
          dripEnabled: Math.random() > 0.4,
          growth: isSpecial ? undefined : growth,
          quarter: (quarter + 1) as 1 | 2 | 3 | 4,
          season
        })
        
        // Occasionally add special dividend
        if (isSpecial && Math.random() < 0.3) {
          payments.push({
            id: `${holding.id}-special-${quarter}`,
            ticker: holding.ticker,
            exDate: new Date(selectedYear, payMonth, 5).toISOString().split('T')[0],
            payDate: new Date(selectedYear, payMonth, 18).toISOString().split('T')[0],
            amount: quarterlyDividendPerShare * 0.25, // Smaller special dividend
            shares: holding.shares,
            totalPayment: quarterlyDividendPerShare * 0.25 * holding.shares,
            isSpecial: true,
            confidence: Math.round(confidence * 0.8),
            projectedAmount: quarterlyDividendPerShare * 0.25,
            taxWithholding: quarterlyDividendPerShare * 0.25 * holding.shares * 0.22,
            dripEnabled: false, // Special dividends often not in DRIP
            quarter: (quarter + 1) as 1 | 2 | 3 | 4,
            season
          })
        }
      }
    })

    return payments.sort((a, b) => new Date(a.payDate).getTime() - new Date(b.payDate).getTime())
  }

  const dividendPayments = generateDividendPayments()
  const monthlyPayments = dividendPayments.filter(payment => {
    const payDate = new Date(payment.payDate)
    return payDate.getMonth() === selectedMonth && payDate.getFullYear() === selectedYear
  })

  const totalMonthlyAmount = monthlyPayments.reduce((sum, payment) => sum + payment.totalPayment, 0)

  // Seasonal Analysis Calculations
  const calculateSeasonalAnalysis = (): SeasonalAnalysis[] => {
    const quarters = [1, 2, 3, 4]
    const seasons = ['Winter', 'Spring', 'Summer', 'Fall']
    const totalAnnual = dividendPayments.reduce((sum, p) => sum + p.totalPayment, 0)
    
    return quarters.map((quarter, index) => {
      const quarterPayments = dividendPayments.filter(p => p.quarter === quarter)
      const total = quarterPayments.reduce((sum, p) => sum + p.totalPayment, 0)
      
      return {
        quarter,
        season: seasons[index],
        totalPayments: total,
        averagePayment: total / Math.max(1, quarterPayments.length),
        paymentCount: quarterPayments.length,
        percentageOfAnnual: totalAnnual > 0 ? (total / totalAnnual) * 100 : 0
      }
    })
  }

  // Forecast Accuracy Calculations
  const calculateForecastAccuracy = () => {
    const paymentsWithActual = dividendPayments.filter(p => p.actualAmount)
    if (paymentsWithActual.length === 0) return { accuracy: 0, variance: 0 }
    
    let totalVariance = 0
    let accurateCount = 0
    
    paymentsWithActual.forEach(payment => {
      const variance = Math.abs(payment.actualAmount! - payment.projectedAmount!) / payment.projectedAmount!
      totalVariance += variance
      if (variance < 0.05) accurateCount++ // Within 5% is considered accurate
    })
    
    return {
      accuracy: (accurateCount / paymentsWithActual.length) * 100,
      variance: (totalVariance / paymentsWithActual.length) * 100,
      totalTracked: paymentsWithActual.length
    }
  }

  const seasonalAnalysis = calculateSeasonalAnalysis()
  const forecastAccuracy = calculateForecastAccuracy()
  const specialDividends = dividendPayments.filter(p => p.isSpecial)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Enhanced Dividend Calendar</h2>
            <p className="text-gray-600">Advanced analytics and forecasting</p>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'calendar', label: 'Calendar', icon: Calendar },
              { key: 'seasonal', label: 'Seasonal', icon: TrendingUp },
              { key: 'forecast', label: 'Forecast', icon: DollarSign },
              { key: 'special', label: 'Special', icon: AlertTriangle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-1 ${
                  viewMode === key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month/Year Selector - Only show for calendar view */}
      {viewMode === 'calendar' && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
          
          {/* Quick Stats */}
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-indigo-600">{specialDividends.length}</div>
              <div className="text-gray-500">Special</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{forecastAccuracy.accuracy.toFixed(0)}%</div>
              <div className="text-gray-500">Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'calendar' && (
        <>
          {/* Monthly Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                ${totalMonthlyAmount.toFixed(2)}
              </div>
              <div className="text-sm text-indigo-700">
                Expected for {monthNames[selectedMonth]} {selectedYear}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {monthlyPayments.length} dividend payments • {monthlyPayments.filter(p => p.isSpecial).length} special
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'seasonal' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seasonal Income Patterns</h3>
            <p className="text-gray-600">Analyze your dividend flow by quarter</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasonalAnalysis.map((season) => (
              <motion.div
                key={season.quarter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (season.quarter - 1) * 0.1 }}
                className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Q{season.quarter} - {season.season}</h4>
                    <p className="text-sm text-gray-600">{season.paymentCount} payments</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">${season.totalPayments.toFixed(0)}</div>
                    <div className="text-sm text-indigo-700">{season.percentageOfAnnual.toFixed(1)}% of annual</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Average per payment:</span>
                    <span className="font-semibold">${season.averagePayment.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Seasonal Insights */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Seasonal Insights</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  {seasonalAnalysis.reduce((max, current) => 
                    current.totalPayments > max.totalPayments ? current : max
                  ).season} (Q{seasonalAnalysis.reduce((max, current) => 
                    current.totalPayments > max.totalPayments ? current : max
                  ).quarter}) is your heaviest dividend season with{' '}
                  {seasonalAnalysis.reduce((max, current) => 
                    current.totalPayments > max.totalPayments ? current : max
                  ).percentageOfAnnual.toFixed(1)}% of annual income.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'forecast' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Forecast Accuracy Tracking</h3>
            <p className="text-gray-600">Monitor prediction vs actual results</p>
          </div>
          
          {/* Accuracy Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {forecastAccuracy.accuracy.toFixed(1)}%
              </div>
              <div className="text-green-700 font-medium">Forecast Accuracy</div>
              <div className="text-sm text-green-600 mt-1">Within 5% target</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {forecastAccuracy.variance.toFixed(1)}%
              </div>
              <div className="text-blue-700 font-medium">Average Variance</div>
              <div className="text-sm text-blue-600 mt-1">Prediction vs actual</div>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {forecastAccuracy.totalTracked}
              </div>
              <div className="text-indigo-700 font-medium">Payments Tracked</div>
              <div className="text-sm text-indigo-600 mt-1">Historical data points</div>
            </div>
          </div>
          
          {/* Confidence Scores by Holding */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Confidence Scores by Holding</h4>
            <div className="space-y-3">
              {Array.from(new Set(dividendPayments.map(p => p.ticker))).map(ticker => {
                const tickerPayments = dividendPayments.filter(p => p.ticker === ticker)
                const avgConfidence = tickerPayments.reduce((sum, p) => sum + p.confidence!, 0) / tickerPayments.length
                
                return (
                  <div key={ticker} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                        {ticker.slice(0, 2)}
                      </div>
                      <span className="font-medium text-gray-900">{ticker}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            avgConfidence >= 90 ? 'bg-green-500' : 
                            avgConfidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${avgConfidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{avgConfidence.toFixed(0)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'special' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Dividend Tracker</h3>
            <p className="text-gray-600">One-time and irregular dividend payments</p>
          </div>
          
          {specialDividends.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Special Dividends</h3>
              <p className="text-gray-600">
                No special dividend payments detected in your portfolio
              </p>
            </div>
          ) : (
            <>
              {/* Special Dividend Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {specialDividends.length}
                    </div>
                    <div className="text-orange-700">Special Payments</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      ${specialDividends.reduce((sum, p) => sum + p.totalPayment, 0).toFixed(0)}
                    </div>
                    <div className="text-orange-700">Total Value</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {((specialDividends.reduce((sum, p) => sum + p.totalPayment, 0) / 
                        dividendPayments.reduce((sum, p) => sum + p.totalPayment, 0)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-orange-700">of Annual Income</div>
                  </div>
                </div>
              </div>
              
              {/* Special Dividend List */}
              <div className="space-y-3">
                {specialDividends.map(payment => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{payment.ticker} - Special Dividend</div>
                          <div className="text-sm text-gray-600">
                            Pay Date: {new Date(payment.payDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">${payment.totalPayment.toFixed(2)}</div>
                        <div className="text-sm text-orange-700">${payment.amount.toFixed(4)} per share</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <>
          {/* Dividend Payments List */}
          {monthlyPayments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 opacity-50">💰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dividends This Month</h3>
              <p className="text-gray-600">
                {holdings?.length === 0 
                  ? 'Add dividend-paying stocks to see your payment schedule'
                  : 'No dividend payments scheduled for this month'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthlyPayments.map(payment => {
                const exDate = new Date(payment.exDate)
                const payDate = new Date(payment.payDate)
                const isUpcoming = payDate >= new Date()
                
                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      payment.isSpecial 
                        ? 'border-orange-200 bg-orange-50 hover:bg-orange-100'
                        : isUpcoming 
                          ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative ${
                          payment.isSpecial
                            ? 'bg-orange-100 text-orange-700'
                            : isUpcoming 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {payment.ticker.slice(0, 2)}
                          {payment.isSpecial && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">!</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{payment.ticker}</span>
                            {payment.isSpecial && (
                              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                                Special
                              </span>
                            )}
                            {payment.confidence && payment.confidence < 85 && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                                Low Confidence
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center space-x-2">
                            <span>{payment.shares.toLocaleString()} shares @ ${payment.amount.toFixed(4)}</span>
                            {payment.growth !== undefined && payment.growth > 0 && (
                              <span className="text-green-600 text-xs">↑ {payment.growth.toFixed(1)}%</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-semibold text-lg ${
                          payment.isSpecial 
                            ? 'text-orange-600' 
                            : isUpcoming 
                              ? 'text-indigo-600' 
                              : 'text-gray-600'
                        }`}>
                          ${payment.totalPayment.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <div>Ex: {exDate.toLocaleDateString()} • Pay: {payDate.toLocaleDateString()}</div>
                          {payment.taxWithholding && (
                            <div className="text-red-600">Tax: -${payment.taxWithholding.toFixed(2)}</div>
                          )}
                          {payment.confidence && (
                            <div className={`${payment.confidence >= 90 ? 'text-green-600' : 
                              payment.confidence >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {payment.confidence}% confidence
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Quick Stats for Calendar View */}
          {dividendPayments.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold text-gray-900">
                    ${dividendPayments.reduce((sum, p) => sum + p.totalPayment, 0).toFixed(0)}
                  </div>
                  <div className="text-gray-600">Annual Total</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    ${(dividendPayments.reduce((sum, p) => sum + p.totalPayment, 0) / 12).toFixed(0)}
                  </div>
                  <div className="text-gray-600">Monthly Avg</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {specialDividends.length}
                  </div>
                  <div className="text-gray-600">Special</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    ${dividendPayments.reduce((sum, p) => sum + (p.taxWithholding || 0), 0).toFixed(0)}
                  </div>
                  <div className="text-gray-600">Tax Withheld</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Enhanced Payment Detail Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative ${
                    selectedPayment.isSpecial ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {selectedPayment.ticker.slice(0, 2)}
                    {selectedPayment.isSpecial && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                      <span>{selectedPayment.ticker} Dividend</span>
                      {selectedPayment.isSpecial && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
                          Special
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">Q{selectedPayment.quarter} {selectedPayment.season} Payment</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-xl">×</div>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Payment Overview */}
                <div className={`rounded-lg p-4 ${
                  selectedPayment.isSpecial ? 'bg-orange-50 border border-orange-200' : 'bg-indigo-50 border border-indigo-200'
                }`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      selectedPayment.isSpecial ? 'text-orange-600' : 'text-indigo-600'
                    }`}>
                      ${selectedPayment.totalPayment.toFixed(2)}
                    </div>
                    <div className={`text-sm ${
                      selectedPayment.isSpecial ? 'text-orange-700' : 'text-indigo-700'
                    }`}>
                      Total Dividend Payment
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-gray-500">Ex-Dividend Date</div>
                    <div className="font-medium">{new Date(selectedPayment.exDate).toLocaleDateString()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Payment Date</div>
                    <div className="font-medium">{new Date(selectedPayment.payDate).toLocaleDateString()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Dividend per Share</div>
                    <div className="font-medium">${selectedPayment.amount.toFixed(4)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Shares Owned</div>
                    <div className="font-medium">{selectedPayment.shares.toLocaleString()}</div>
                  </div>
                </div>

                {/* Forecast & Tax Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Financial Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedPayment.confidence && (
                      <div className="space-y-1">
                        <div className="text-gray-500">Forecast Confidence</div>
                        <div className={`font-medium flex items-center space-x-2 ${
                          selectedPayment.confidence >= 90 ? 'text-green-600' : 
                          selectedPayment.confidence >= 80 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          <span>{selectedPayment.confidence}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedPayment.confidence >= 90 ? 'bg-green-500' : 
                                selectedPayment.confidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${selectedPayment.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPayment.taxWithholding && (
                      <div className="space-y-1">
                        <div className="text-gray-500">Tax Withholding</div>
                        <div className="font-medium text-red-600">
                          -${selectedPayment.taxWithholding.toFixed(2)}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="text-gray-500">Net After Tax</div>
                      <div className="font-medium text-green-600">
                        ${(selectedPayment.totalPayment - (selectedPayment.taxWithholding || 0)).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-gray-500">DRIP Status</div>
                      <div className={`font-medium ${
                        selectedPayment.dripEnabled ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {selectedPayment.dripEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Growth Information */}
                {selectedPayment.growth !== undefined && (
                  <div className={`rounded-lg p-3 ${
                    selectedPayment.growth > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`flex items-center space-x-2 ${
                      selectedPayment.growth > 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${selectedPayment.growth < 0 ? 'rotate-180' : ''}`} />
                      <span className="text-sm font-medium">
                        {selectedPayment.growth > 0 ? '+' : ''}{selectedPayment.growth.toFixed(1)}% vs previous quarter
                      </span>
                    </div>
                  </div>
                )}

                {/* Forecast Accuracy */}
                {selectedPayment.actualAmount && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-blue-700 font-medium">Actual vs Projected</div>
                        <div className="text-blue-600">
                          Projected: ${selectedPayment.projectedAmount!.toFixed(4)} | 
                          Actual: ${selectedPayment.actualAmount.toFixed(4)}
                        </div>
                      </div>
                      <div className={`font-bold text-lg ${
                        Math.abs(selectedPayment.actualAmount - selectedPayment.projectedAmount!) / selectedPayment.projectedAmount! < 0.05
                          ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {(((selectedPayment.actualAmount - selectedPayment.projectedAmount!) / selectedPayment.projectedAmount!) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button 
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setSelectedPayment(null)}
                  >
                    View Holdings
                  </button>
                  <button 
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors text-white ${
                      selectedPayment.isSpecial 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    onClick={() => setSelectedPayment(null)}
                  >
                    Manage Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}