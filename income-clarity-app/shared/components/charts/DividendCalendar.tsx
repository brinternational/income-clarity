'use client'

import React, { useState, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface DividendEvent {
  symbol: string
  companyName: string
  date: string
  amount: number
  type: 'ex-dividend' | 'payment' | 'announcement'
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual'
  yield: number
}

interface DividendCalendarProps {
  events?: DividendEvent[]
  className?: string
}

const eventTypeConfig = {
  'ex-dividend': { 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <TrendingUp className="w-3 h-3" />,
    label: 'Ex-Div'
  },
  'payment': { 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <DollarSign className="w-3 h-3" />,
    label: 'Payment'
  },
  'announcement': { 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <Clock className="w-3 h-3" />,
    label: 'Announce'
  }
}

// Mock data generator
const generateMockEvents = (): DividendEvent[] => {
  const currentDate = new Date()
  const events: DividendEvent[] = []
  
  const holdings = [
    { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', frequency: 'Monthly', yield: 11.2, avgAmount: 850 },
    { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', frequency: 'Quarterly', yield: 3.8, avgAmount: 420 },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', frequency: 'Quarterly', yield: 1.4, avgAmount: 180 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', frequency: 'Quarterly', yield: 0.7, avgAmount: 125 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', frequency: 'Quarterly', yield: 2.9, avgAmount: 220 },
    { symbol: 'O', name: 'Realty Income Corporation', frequency: 'Monthly', yield: 5.2, avgAmount: 280 },
    { symbol: 'KO', name: 'The Coca-Cola Company', frequency: 'Quarterly', yield: 3.1, avgAmount: 150 },
    { symbol: 'T', name: 'AT&T Inc.', frequency: 'Quarterly', yield: 7.8, avgAmount: 195 }
  ]
  
  // Generate events for next 6 months
  for (let monthOffset = -1; monthOffset < 6; monthOffset++) {
    holdings.forEach((holding, holdingIndex) => {
      const eventDate = new Date(currentDate)
      eventDate.setMonth(currentDate.getMonth() + monthOffset)
      
      // Determine frequency offset
      let shouldAddEvent = false
      if (holding.frequency === 'Monthly') {
        shouldAddEvent = true
      } else if (holding.frequency === 'Quarterly') {
        shouldAddEvent = monthOffset % 3 === holdingIndex % 3
      }
      
      if (shouldAddEvent) {
        // Ex-dividend date
        const exDate = new Date(eventDate)
        exDate.setDate(Math.floor(Math.random() * 28) + 1) // Random day in month
        
        // Payment date (usually 2-4 weeks after ex-dividend)
        const paymentDate = new Date(exDate)
        paymentDate.setDate(exDate.getDate() + 14 + Math.floor(Math.random() * 14))
        
        // Announcement date (usually 2-6 weeks before ex-dividend)
        const announceDate = new Date(exDate)
        announceDate.setDate(exDate.getDate() - 14 - Math.floor(Math.random() * 14))
        
        const amount = holding.avgAmount * (0.8 + Math.random() * 0.4) // ±20% variation
        
        // Only add if in reasonable date range
        if (announceDate >= new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)) {
          events.push({
            symbol: holding.symbol,
            companyName: holding.name,
            date: announceDate.toISOString().split('T')[0],
            amount,
            type: 'announcement',
            frequency: holding.frequency as any,
            yield: holding.yield
          })
        }
        
        if (exDate >= new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)) {
          events.push({
            symbol: holding.symbol,
            companyName: holding.name,
            date: exDate.toISOString().split('T')[0],
            amount,
            type: 'ex-dividend',
            frequency: holding.frequency as any,
            yield: holding.yield
          })
        }
        
        if (paymentDate >= currentDate) {
          events.push({
            symbol: holding.symbol,
            companyName: holding.name,
            date: paymentDate.toISOString().split('T')[0],
            amount,
            type: 'payment',
            frequency: holding.frequency as any,
            yield: holding.yield
          })
        }
      }
    })
  }
  
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function DividendCalendar({
  events,
  className = ''
}: DividendCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  const dividendEvents = useMemo(() => {
    return events || generateMockEvents()
  }, [events])

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get events for current month
  const monthEvents = dividendEvents.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear
  })

  // Group events by date
  const eventsByDate = monthEvents.reduce((acc, event) => {
    const dateKey = event.date
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, DividendEvent[]>)

  // Calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())
  
  const calendarDays = []
  const currentDateIter = new Date(startDate)
  
  while (calendarDays.length < 42) { // 6 weeks
    calendarDays.push(new Date(currentDateIter))
    currentDateIter.setDate(currentDateIter.getDate() + 1)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentMonth + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const totalMonthIncome = monthEvents
    .filter(e => e.type === 'payment')
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Dividend Calendar
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track dividend events and payments
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {monthEvents.length} events • ${totalMonthIncome.toLocaleString()} expected
          </p>
        </div>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {view === 'calendar' ? (
        /* Calendar View */
        <div className="space-y-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateKey = day.toISOString().split('T')[0]
              const dayEvents = eventsByDate[dateKey] || []
              const isCurrentMonth = day.getMonth() === currentMonth
              const isToday = day.toDateString() === new Date().toDateString()

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`
                    min-h-[80px] p-2 border rounded-lg relative
                    ${isCurrentMonth 
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                    }
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                  }`}>
                    {day.getDate()}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => {
                      const config = eventTypeConfig[event.type]
                      return (
                        <div
                          key={eventIndex}
                          className={`
                            px-1 py-0.5 rounded text-xs font-medium border
                            ${config.color}
                            truncate cursor-pointer
                          `}
                          title={`${event.symbol} - $${event.amount.toFixed(0)} (${config.label})`}
                        >
                          <div className="flex items-center space-x-1">
                            {config.icon}
                            <span>{event.symbol}</span>
                          </div>
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {monthEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No dividend events this month
            </div>
          ) : (
            monthEvents.map((event, index) => {
              const config = eventTypeConfig[event.type]
              const eventDate = new Date(event.date)
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg border ${config.color}`}>
                      {config.icon}
                    </div>
                    
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {event.symbol}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.companyName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {event.frequency} • {event.yield.toFixed(1)}% yield
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      ${event.amount.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {eventDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                      {config.label}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {Object.entries(eventTypeConfig).map(([type, config]) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`p-1 rounded border ${config.color}`}>
                {config.icon}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-blue-600">
            {monthEvents.filter(e => e.type === 'payment').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Payments
          </div>
        </div>
        
        <div>
          <div className="text-lg font-bold text-green-600">
            ${totalMonthIncome.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Income
          </div>
        </div>
        
        <div>
          <div className="text-lg font-bold text-orange-600">
            {monthEvents.filter(e => e.type === 'ex-dividend').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Ex-Dividend
          </div>
        </div>
      </div>
    </div>
  )
}