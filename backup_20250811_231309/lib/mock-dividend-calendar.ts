import type { DividendCalendarEntry } from '@/types';

/**
 * Mock dividend calendar data for testing push notifications
 * Based on realistic dividend schedules for popular dividend stocks
 */

// Helper to create dates relative to today
const today = new Date();
const addDays = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const addMonths = (months: number) => {
  const date = new Date(today);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

export const mockDividendCalendar: DividendCalendarEntry[] = [
  // SCHD - Schwab US Dividend Equity ETF (Quarterly)
  {
    id: 'div-schd-2025-q1',
    symbol: 'SCHD',
    companyName: 'Schwab US Dividend Equity ETF',
    exDate: addDays(2),           // Ex-dividend in 2 days (good for testing 24h warning)
    recordDate: addDays(3),       // Record date day after ex-date
    payDate: addDays(30),         // Pay date ~30 days later
    dividendAmount: 0.74,         // Realistic quarterly dividend
    frequency: 'quarterly',
    divType: 'regular',
    currency: 'USD',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  
  // JEPI - JPMorgan Equity Premium Income ETF (Monthly)
  {
    id: 'div-jepi-2025-m1',
    symbol: 'JEPI',
    companyName: 'JPMorgan Equity Premium Income ETF',
    exDate: addDays(15),          // Ex-dividend in 2 weeks
    recordDate: addDays(16),      
    payDate: addDays(45),         
    dividendAmount: 0.42,         // Monthly dividend
    frequency: 'monthly',
    divType: 'regular',
    currency: 'USD',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // VYM - Vanguard High Dividend Yield ETF (Quarterly)
  {
    id: 'div-vym-2025-q1',
    symbol: 'VYM',
    companyName: 'Vanguard High Dividend Yield ETF',
    exDate: addDays(5),           // Ex-dividend in 5 days
    recordDate: addDays(6),       
    payDate: addDays(35),         
    dividendAmount: 0.89,         // Quarterly dividend
    frequency: 'quarterly',
    divType: 'regular',
    currency: 'USD',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // QYLD - Global X NASDAQ 100 Covered Call ETF (Monthly) 
  {
    id: 'div-qyld-2025-m1',
    symbol: 'QYLD',
    companyName: 'Global X NASDAQ 100 Covered Call ETF',
    exDate: addDays(10),          // Ex-dividend in 10 days
    recordDate: addDays(11),      
    payDate: addDays(40),         
    dividendAmount: 0.18,         // Monthly dividend (high yield)
    frequency: 'monthly',
    divType: 'regular',
    currency: 'USD',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // O - Realty Income Corporation (Monthly REIT)
  {
    id: 'div-o-2025-m1',
    symbol: 'O',
    companyName: 'Realty Income Corporation',
    exDate: addDays(7),           // Ex-dividend in 1 week
    recordDate: addDays(8),       
    payDate: addDays(37),         
    dividendAmount: 0.264,        // Monthly REIT dividend
    frequency: 'monthly',
    divType: 'regular',
    currency: 'USD',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // SPHD - Invesco S&P 500 High Dividend Low Volatility ETF (Quarterly)
  {
    id: 'div-sphd-2025-q1',
    symbol: 'SPHD',
    companyName: 'Invesco S&P 500 High Dividend Low Volatility ETF',
    exDate: addDays(20),          // Ex-dividend in 20 days
    recordDate: addDays(21),      
    payDate: addDays(50),         
    dividendAmount: 0.52,         // Quarterly dividend
    frequency: 'quarterly',
    divType: 'regular',
    currency: 'USD',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // DIV - Global X SuperDividend ETF (Monthly)
  {
    id: 'div-div-2025-m1',
    symbol: 'DIV',
    companyName: 'Global X SuperDividend ETF',
    exDate: addDays(12),          // Ex-dividend in 12 days
    recordDate: addDays(13),      
    payDate: addDays(42),         
    dividendAmount: 0.09,         // Monthly dividend
    frequency: 'monthly',
    divType: 'regular',
    currency: 'USD',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // RYLD - Global X Russell 2000 Covered Call ETF (Monthly)
  {
    id: 'div-ryld-2025-m1',
    symbol: 'RYLD',
    companyName: 'Global X Russell 2000 Covered Call ETF',
    exDate: addDays(25),          // Ex-dividend in 25 days
    recordDate: addDays(26),      
    payDate: addDays(55),         
    dividendAmount: 0.17,         // Monthly dividend
    frequency: 'monthly',
    divType: 'regular',
    currency: 'USD',
    source: 'api',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Future quarters/months for continued testing
  // SCHD Q2
  {
    id: 'div-schd-2025-q2',
    symbol: 'SCHD',
    companyName: 'Schwab US Dividend Equity ETF',
    exDate: addMonths(3),         // Next quarter
    recordDate: addDays(1 + 90),  
    payDate: addDays(30 + 90),    
    dividendAmount: 0.76,         // Slightly increased
    frequency: 'quarterly',
    divType: 'regular',
    currency: 'USD',
    source: 'estimated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // JEPI next month
  {
    id: 'div-jepi-2025-m2',
    symbol: 'JEPI',
    companyName: 'JPMorgan Equity Premium Income ETF',
    exDate: addDays(45),          // Next month
    recordDate: addDays(46),      
    payDate: addDays(75),         
    dividendAmount: 0.41,         // Slightly variable (realistic)
    frequency: 'monthly',
    divType: 'regular',
    currency: 'USD',
    source: 'estimated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Special dividend for testing
  {
    id: 'div-schd-special-2025',
    symbol: 'SCHD',
    companyName: 'Schwab US Dividend Equity ETF',
    exDate: addDays(60),          // Special dividend in 2 months
    recordDate: addDays(61),      
    payDate: addDays(90),         
    dividendAmount: 0.25,         // Special dividend
    frequency: 'special',
    divType: 'special',
    currency: 'USD',
    source: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper functions for testing

export function getDividendsForSymbol(symbol: string): DividendCalendarEntry[] {
  return mockDividendCalendar.filter(entry => entry.symbol === symbol);
}

export function getUpcomingDividends(daysAhead: number = 30): DividendCalendarEntry[] {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);
  
  return mockDividendCalendar.filter(entry => {
    const exDate = new Date(entry.exDate);
    return exDate >= today && exDate <= targetDate;
  });
}

export function getDividendsInRange(startDays: number, endDays: number): DividendCalendarEntry[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + startDays);
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + endDays);
  
  return mockDividendCalendar.filter(entry => {
    const exDate = new Date(entry.exDate);
    return exDate >= startDate && exDate <= endDate;
  });
}

export function getTotalExpectedDividends(holdings: any[]): number {
  let total = 0;
  
  for (const holding of holdings) {
    const dividends = getDividendsForSymbol(holding.ticker);
    for (const dividend of dividends) {
      total += holding.shares * dividend.dividendAmount;
    }
  }
  
  return total;
}

// Sample notification test scenarios
export const notificationTestScenarios = {
  // Scenario 1: 24-hour warning test (SCHD going ex-dividend tomorrow)
  tomorrow: {
    symbol: 'SCHD',
    type: 'ex-dividend-24h',
    message: 'SCHD goes ex-dividend tomorrow - $0.74/share dividend'
  },
  
  // Scenario 2: Morning reminder test (VYM going ex-dividend today)
  today: {
    symbol: 'VYM', 
    type: 'ex-dividend-morning',
    message: 'Today is VYM ex-dividend day - last chance for $0.89/share'
  },
  
  // Scenario 3: Weekly summary test
  weekly: {
    type: 'weekly-summary',
    message: '3 stocks going ex-dividend this week - expected $1,250 income'
  },
  
  // Scenario 4: Payment received test
  payment: {
    symbol: 'JEPI',
    type: 'dividend-payment',
    message: 'JEPI dividend payment received - $420.00 deposited'
  }
};

export default mockDividendCalendar;