'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  Clock,
  Info,
  TrendingDown,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Trade {
  id: string;
  action: 'buy' | 'sell';
  ticker: string;
  shares: number;
  lotId?: string;
  currentPrice: number;
  costBasis: number;
  holdingPeriod: number;
  taxStatus: 'short-term' | 'long-term' | 'qualified' | 'ordinary';
  taxImpact: number;
  reason: string;
}

interface WashSaleRisk {
  ticker: string;
  riskLevel: 'low' | 'medium' | 'high';
  daysUntilClear: number;
  alternative: string;
}

interface WashSaleEvent {
  date: Date;
  ticker: string;
  type: 'sell' | 'safe-window-start' | 'safe-window-end';
  riskLevel?: 'low' | 'medium' | 'high';
  alternative?: string;
  tradeId?: string;
}

interface WashSaleCalendarProps {
  trades: Trade[];
  washSaleRisks: WashSaleRisk[];
}

export const WashSaleCalendar: React.FC<WashSaleCalendarProps> = ({
  trades,
  washSaleRisks
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate wash sale events for calendar
  const washSaleEvents = useMemo(() => {
    const events: WashSaleEvent[] = [];
    const today = new Date();

    // Add current wash sale windows
    washSaleRisks.forEach(risk => {
      const clearDate = new Date(today);
      clearDate.setDate(today.getDate() + risk.daysUntilClear);

      events.push({
        date: clearDate,
        ticker: risk.ticker,
        type: 'safe-window-start',
        riskLevel: risk.riskLevel,
        alternative: risk.alternative
      });
    });

    // Add projected sell dates from trades
    trades.filter(t => t.action === 'sell' && t.taxImpact < 0).forEach(trade => {
      // Assume trade execution within next 7 days
      const sellDate = new Date(today);
      sellDate.setDate(today.getDate() + Math.floor(Math.random() * 7));
      
      events.push({
        date: sellDate,
        ticker: trade.ticker,
        type: 'sell',
        tradeId: trade.id
      });

      // Add 30-day wash sale window end
      const windowEnd = new Date(sellDate);
      windowEnd.setDate(sellDate.getDate() + 30);
      
      events.push({
        date: windowEnd,
        ticker: trade.ticker,
        type: 'safe-window-end',
        tradeId: trade.id
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [trades, washSaleRisks]);

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = washSaleEvents.filter(event => 
        event.date.toDateString() === current.toDateString()
      );
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate, washSaleEvents]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return washSaleEvents.filter(event =>
      event.date.toDateString() === selectedDate.toDateString()
    );
  }, [selectedDate, washSaleEvents]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventColor = (type: WashSaleEvent['type'], riskLevel?: string) => {
    switch (type) {
      case 'sell':
        return 'bg-red-100 border-red-300';
      case 'safe-window-start':
        return riskLevel === 'high' 
          ? 'bg-red-100 border-red-300'
          : riskLevel === 'medium'
          ? 'bg-yellow-100 border-yellow-300'
          : 'bg-green-100 border-green-300';
      case 'safe-window-end':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getEventIcon = (type: WashSaleEvent['type']) => {
    switch (type) {
      case 'sell':
        return TrendingDown;
      case 'safe-window-start':
        return Shield;
      case 'safe-window-end':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const formatEventDescription = (event: WashSaleEvent) => {
    switch (event.type) {
      case 'sell':
        return `Planned sale of ${event.ticker}`;
      case 'safe-window-start':
        return `${event.ticker} wash sale window clears`;
      case 'safe-window-end':
        return `${event.ticker} safe to repurchase`;
      default:
        return 'Wash sale event';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                Wash Sale Calendar
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Track wash sale windows and safe trading periods
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Month Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                
                <h4 className="font-semibold text-gray-900 min-w-[140px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => setSelectedDate(day.date)}
                className={`relative p-2 rounded-lg text-sm transition-all min-h-[60px] ${
                  !day.isCurrentMonth
                    ? 'text-gray-300 hover:bg-gray-50'
                    : day.isToday
                    ? 'bg-blue-100 text-blue-900 font-bold hover:bg-blue-200'
                    : selectedDate?.toDateString() === day.date.toDateString()
                    ? 'bg-indigo-100 text-indigo-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-center mb-1">{day.date.getDate()}</div>
                
                {/* Event Indicators */}
                <div className="space-y-1">
                  {day.events.slice(0, 2).map((event, eventIndex) => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <div
                        key={eventIndex}
                        className={`flex items-center justify-center p-1 rounded border text-xs ${
                          getEventColor(event.type, event.riskLevel)
                        }`}
                      >
                        <EventIcon className="h-3 w-3" />
                      </div>
                    );
                  })}
                  
                  {day.events.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.events.length - 2} more
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Calendar Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded flex items-center justify-center">
              <TrendingDown className="h-2 w-2 text-red-600" />
            </div>
            <span>Planned Sale</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center">
              <Shield className="h-2 w-2 text-yellow-600" />
            </div>
            <span>Wash Window Clears</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded flex items-center justify-center">
              <Shield className="h-2 w-2 text-green-600" />
            </div>
            <span>Safe Window</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
              <CheckCircle className="h-2 w-2 text-blue-600" />
            </div>
            <span>Safe to Repurchase</span>
          </div>
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
            <h4 className="text-lg font-bold text-gray-900">
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h4>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {selectedDateEvents.map((event, index) => {
                const EventIcon = getEventIcon(event.type);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 ${getEventColor(event.type, event.riskLevel)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <EventIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">
                          {formatEventDescription(event)}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.type === 'safe-window-start' && event.alternative && (
                            <>Consider {event.alternative} as alternative investment</>
                          )}
                          {event.type === 'sell' && (
                            <>Tax loss harvesting opportunity</>
                          )}
                          {event.type === 'safe-window-end' && (
                            <>30-day wash sale window has expired</>
                          )}
                        </p>
                        
                        {event.riskLevel && (
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              event.riskLevel === 'high'
                                ? 'bg-red-100 text-red-800'
                                : event.riskLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              Risk Level: {event.riskLevel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Wash Sale Risks */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b">
          <h4 className="text-lg font-bold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Active Wash Sale Windows
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Securities currently within the 30-day wash sale window
          </p>
        </div>
        
        <div className="p-6">
          {washSaleRisks.length > 0 ? (
            <div className="space-y-4">
              {washSaleRisks.map((risk, index) => (
                <motion.div
                  key={risk.ticker}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    risk.riskLevel === 'high'
                      ? 'bg-red-50 border-red-200'
                      : risk.riskLevel === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        risk.riskLevel === 'high'
                          ? 'bg-red-100'
                          : risk.riskLevel === 'medium'
                          ? 'bg-yellow-100'
                          : 'bg-green-100'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          risk.riskLevel === 'high'
                            ? 'text-red-600'
                            : risk.riskLevel === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`} />
                      </div>
                      
                      <div>
                        <h5 className="font-bold text-gray-900">{risk.ticker}</h5>
                        <p className="text-sm text-gray-600">
                          {risk.daysUntilClear} days until wash sale window clears
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        risk.riskLevel === 'high'
                          ? 'bg-red-100 text-red-800'
                          : risk.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {risk.riskLevel} Risk
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Alternative: <span className="font-medium">{risk.alternative}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h5 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h5>
              <p className="text-gray-600">
                No active wash sale windows. You're free to trade without wash sale concerns.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};