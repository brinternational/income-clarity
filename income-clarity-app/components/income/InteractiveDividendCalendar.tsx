'use client'

import { useState, useMemo, memo } from 'react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { Calendar, ChevronLeft, ChevronRight, Bell, Filter, TrendingUp, ExternalLink } from 'lucide-react'

type IncomeViewMode = 'monthly' | 'annual'

interface DividendPayment {
  id: string
  ticker: string
  exDate: Date
  payDate: Date
  amount: number
  shares: number
  totalPayment: number
  frequency: 'monthly' | 'quarterly' | 'annual'
  status: 'upcoming' | 'past' | 'today'
  yield: number
}

interface CalendarDay {
  date: Date
  payments: DividendPayment[]
  totalAmount: number
  isCurrentMonth: boolean
  isToday: boolean
}

interface InteractiveDividendCalendarProps {
  viewMode?: IncomeViewMode;
}

const InteractiveDividendCalendarComponent = ({ viewMode = 'monthly' }: InteractiveDividendCalendarProps) => {
  const { holdings } = usePortfolio()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewType, setViewType] = useState<'month' | 'year'>('month')
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'high-yield'>('all')
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)

  // Format dividend values based on view mode
  const formatDividendValue = (monthlyValue: number) => {
    if (viewMode === 'annual') {
      return {
        value: monthlyValue * 12,
        suffix: '/year',
        label: 'Annual',
        multiplier: 12
      };
    }
    return {
      value: monthlyValue,
      suffix: '/month',
      label: 'Monthly', 
      multiplier: 1
    };
  };

  // Generate comprehensive dividend payments based on holdings
  const generateDividendPayments = useMemo(() => {
    if (!holdings || holdings.length === 0) return []

    const payments: DividendPayment[] = []
    const currentDate = new Date()
    const currentYear = selectedDate.getFullYear()

    holdings.forEach(holding => {
      // Determine frequency based on ticker patterns (simplified logic)
      const frequency = holding.ticker.includes('REIT') || holding.ticker === 'JEPI' ? 'monthly' : 'quarterly'
      const paymentsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1
      
      // Calculate annual dividend and per-payment amount
      const annualDividend = (holding.currentPrice || 100) * (holding.annualYield || 0.04)
      const dividendPerPayment = annualDividend / paymentsPerYear

      // Generate payments for current year
      for (let i = 0; i < paymentsPerYear; i++) {
        let payMonth: number
        if (frequency === 'monthly') {
          payMonth = i // 0-11 for monthly
        } else if (frequency === 'quarterly') {
          payMonth = i * 3 // 0, 3, 6, 9 for quarterly
        } else {
          payMonth = 11 // December for annual
        }

        // Create realistic ex-date and pay-date
        const exDate = new Date(currentYear, payMonth, Math.floor(Math.random() * 5) + 10) // 10th-15th
        const payDate = new Date(currentYear, payMonth, Math.floor(Math.random() * 5) + 25) // 25th-30th

        // Determine status
        let status: 'upcoming' | 'past' | 'today' = 'upcoming'
        if (payDate < currentDate) status = 'past'
        else if (payDate.toDateString() === currentDate.toDateString()) status = 'today'

        payments.push({
          id: `${holding.id}-${payMonth}-${currentYear}`,
          ticker: holding.ticker,
          exDate,
          payDate,
          amount: dividendPerPayment,
          shares: holding.shares,
          totalPayment: dividendPerPayment * holding.shares,
          frequency,
          status,
          yield: holding.annualYield || 0.04
        })
      }
    })

    return payments.sort((a, b) => a.payDate.getTime() - b.payDate.getTime())
  }, [holdings, selectedDate])

  const dividendPayments = generateDividendPayments

  // Filter payments based on selected filter
  const filteredPayments = useMemo(() => {
    switch (filterType) {
      case 'upcoming':
        return dividendPayments.filter(p => p.status === 'upcoming' || p.status === 'today')
      case 'high-yield':
        return dividendPayments.filter(p => p.yield > 0.05) // > 5%
      default:
        return dividendPayments
    }
  }, [dividendPayments, filterType])

  // Generate calendar grid for month view
  const generateCalendarGrid = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days: CalendarDay[] = []
    const today = new Date()
    
    for (let date = new Date(startDate); date <= lastDay || days.length % 7 !== 0; date.setDate(date.getDate() + 1)) {
      const dayPayments = filteredPayments.filter(p => 
        p.payDate.toDateString() === date.toDateString()
      )
      
      days.push({
        date: new Date(date),
        payments: dayPayments,
        totalAmount: dayPayments.reduce((sum, p) => sum + p.totalPayment, 0),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    return days
  }, [selectedDate, filteredPayments])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()
    
    const monthlyPayments = filteredPayments.filter(p => 
      p.payDate.getMonth() === currentMonth && p.payDate.getFullYear() === currentYear
    )
    
    const upcomingPayments = filteredPayments.filter(p => p.status === 'upcoming')
    const totalAnnual = filteredPayments.reduce((sum, p) => sum + p.totalPayment, 0)
    const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + p.totalPayment, 0)
    
    return {
      monthlyTotal,
      monthlyCount: monthlyPayments.length,
      upcomingCount: upcomingPayments.length,
      totalAnnual,
      averageMonthly: totalAnnual / 12
    }
  }, [filteredPayments, selectedDate])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Interactive Dividend Calendar</h2>
              <p className="text-gray-600">Track ex-dates, pay dates, and income flow</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNotificationSettings(!showNotificationSettings)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors relative"
              title="Notification settings"
            >
              <Bell className="w-5 h-5 text-blue-600" />
              {summaryStats.upcomingCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
            >
              <option value="all">All Payments</option>
              <option value="upcoming">Upcoming Only</option>
              <option value="high-yield">High Yield (&gt;5%)</option>
            </select>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              ${(summaryStats.monthlyTotal * formatDividendValue(1).multiplier).toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">This {viewMode === 'annual' ? 'Year' : 'Month'}</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {summaryStats.monthlyCount}
            </div>
            <div className="text-xs text-gray-600">Payments</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">
              {summaryStats.upcomingCount}
            </div>
            <div className="text-xs text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-600">
              ${(summaryStats.averageMonthly * formatDividendValue(1).multiplier).toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">{formatDividendValue(1).label} Avg</div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 sm:p-6">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {generateCalendarGrid.map((day, index) => (
            <div
              key={index}
              className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                !day.isCurrentMonth ? 'opacity-40 bg-gray-25' : ''
              } ${
                day.isToday ? 'bg-blue-50 border-blue-200' : ''
              } ${
                day.payments.length > 0 ? 'bg-green-25 border-green-200' : ''
              }`}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className={`text-sm font-medium mb-1 ${
                day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {day.date.getDate()}
              </div>
              
              {day.payments.length > 0 && (
                <div className="space-y-1">
                  {day.payments.slice(0, 2).map(payment => (
                    <div
                      key={payment.id}
                      className={`text-xs px-2 py-1 rounded text-center font-medium ${
                        payment.status === 'today' ? 'bg-blue-100 text-blue-700' :
                        payment.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}
                      title={`${payment.ticker}: $${(payment.totalPayment * formatDividendValue(1).multiplier).toFixed(2)}`}
                    >
                      {payment.ticker}
                    </div>
                  ))}
                  {day.payments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.payments.length - 2} more
                    </div>
                  )}
                  <div className="text-xs font-semibold text-green-600 text-center">
                    ${(day.totalAmount * formatDividendValue(1).multiplier).toFixed(0)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Payments List */}
      <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Next 5 Payments</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <span>View All</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {filteredPayments
            .filter(p => p.status === 'upcoming')
            .slice(0, 5)
            .map(payment => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">
                      {payment.ticker.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{payment.ticker}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-3">
                      <span>Ex: {payment.exDate.toLocaleDateString()}</span>
                      <span>Pay: {payment.payDate.toLocaleDateString()}</span>
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{(payment.yield * 100).toFixed(1)}%</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    ${(payment.totalPayment * formatDividendValue(1).multiplier).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {payment.shares.toLocaleString()} shares
                  </div>
                </div>
              </div>
            ))}
        </div>

        {filteredPayments.filter(p => p.status === 'upcoming').length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming dividend payments found</p>
            <p className="text-sm text-gray-500">
              {holdings?.length === 0 ? 'Add dividend-paying stocks to see your payment schedule' : 'Try adjusting your filter settings'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export const InteractiveDividendCalendar = memo(({ viewMode = 'monthly' }: InteractiveDividendCalendarProps = {}) => (
  <InteractiveDividendCalendarComponent viewMode={viewMode} />
))