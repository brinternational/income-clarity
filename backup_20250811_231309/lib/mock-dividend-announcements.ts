import type { DividendAnnouncement } from '@/types';

/**
 * Mock dividend announcements for testing and demo purposes
 * In production, this would be replaced by real data from financial APIs
 */

// Generate dates relative to today for consistent testing
const today = new Date();
const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(today.getDate() - days);
  return date.toISOString();
};

const getDaysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(today.getDate() + days);
  return date.toISOString();
};

// Mock announcement data for different types
export const mockDividendAnnouncements: DividendAnnouncement[] = [
  // Recent dividend increase - SCHD
  {
    id: 'ann-001',
    userId: 'demo-user',
    symbol: 'SCHD',
    companyName: 'Schwab US Dividend Equity ETF',
    announcementType: 'increase',
    oldAmount: 0.65,
    newAmount: 0.75,
    percentageChange: 15.38,
    announcementDate: getDaysAgo(2),
    effectiveDate: getDaysFromNow(14),
    description: 'Quarterly dividend increased by 15.4% due to strong portfolio performance',
    source: 'api',
    created_at: getDaysAgo(2),
    updated_at: getDaysAgo(2)
  },

  // Special dividend announcement - O (Realty Income)
  {
    id: 'ann-002',
    userId: 'demo-user',
    symbol: 'O',
    companyName: 'Realty Income Corporation',
    announcementType: 'special',
    newAmount: 0.50,
    announcementDate: getDaysAgo(5),
    effectiveDate: getDaysFromNow(21),
    recordDate: getDaysFromNow(14),
    payDate: getDaysFromNow(28),
    description: 'Special dividend of $0.50 per share to celebrate 30th anniversary of monthly dividends',
    source: 'api',
    created_at: getDaysAgo(5),
    updated_at: getDaysAgo(5)
  },

  // Dividend initiation - New tech stock starts dividend
  {
    id: 'ann-003',
    userId: 'demo-user',
    symbol: 'NVDA',
    companyName: 'NVIDIA Corporation',
    announcementType: 'initiation',
    newAmount: 0.08,
    announcementDate: getDaysAgo(7),
    effectiveDate: getDaysFromNow(30),
    description: 'Company initiates quarterly dividend program at $0.08 per share',
    source: 'api',
    created_at: getDaysAgo(7),
    updated_at: getDaysAgo(7)
  },

  // Dividend decrease - Economic pressures
  {
    id: 'ann-004',
    userId: 'demo-user',
    symbol: 'XOM',
    companyName: 'Exxon Mobil Corporation',
    announcementType: 'decrease',
    oldAmount: 0.91,
    newAmount: 0.75,
    percentageChange: -17.58,
    announcementDate: getDaysAgo(10),
    effectiveDate: getDaysFromNow(18),
    description: 'Quarterly dividend reduced by 17.6% to maintain financial flexibility',
    source: 'api',
    created_at: getDaysAgo(10),
    updated_at: getDaysAgo(10)
  },

  // Frequency change - Monthly to quarterly
  {
    id: 'ann-005',
    userId: 'demo-user',
    symbol: 'MAIN',
    companyName: 'Main Street Capital Corporation',
    announcementType: 'frequency_change',
    oldAmount: 0.225,
    newAmount: 0.675,  // 3x monthly amount for quarterly
    oldFrequency: 'monthly',
    newFrequency: 'quarterly',
    announcementDate: getDaysAgo(12),
    effectiveDate: getDaysFromNow(45),
    description: 'Payment frequency changed from monthly to quarterly to align with industry standards',
    source: 'api',
    created_at: getDaysAgo(12),
    updated_at: getDaysAgo(12)
  },

  // Dividend suspension - Challenging times
  {
    id: 'ann-006',
    userId: 'demo-user',
    symbol: 'F',
    companyName: 'Ford Motor Company',
    announcementType: 'suspension',
    oldAmount: 0.15,
    newAmount: 0,
    announcementDate: getDaysAgo(15),
    effectiveDate: getDaysFromNow(7),
    description: 'Dividend payments suspended to invest in electric vehicle transition',
    source: 'api',
    created_at: getDaysAgo(15),
    updated_at: getDaysAgo(15)
  },

  // Another increase - JEPI
  {
    id: 'ann-007',
    userId: 'demo-user',
    symbol: 'JEPI',
    companyName: 'JPMorgan Equity Premium Income ETF',
    announcementType: 'increase',
    oldAmount: 0.35,
    newAmount: 0.42,
    percentageChange: 20.00,
    announcementDate: getDaysAgo(18),
    effectiveDate: getDaysFromNow(12),
    description: 'Monthly distribution increased by 20% due to enhanced options income',
    source: 'api',
    created_at: getDaysAgo(18),
    updated_at: getDaysAgo(18)
  },

  // Historical special dividend
  {
    id: 'ann-008',
    userId: 'demo-user',
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    announcementType: 'special',
    newAmount: 3.00,
    announcementDate: getDaysAgo(25),
    effectiveDate: getDaysAgo(5),
    recordDate: getDaysAgo(12),
    payDate: getDaysAgo(2),
    description: 'One-time special dividend of $3.00 per share from exceptional cash flow',
    source: 'api',
    created_at: getDaysAgo(25),
    updated_at: getDaysAgo(25)
  }
];

// Helper functions for testing and data generation

/**
 * Get announcements by type
 */
export function getAnnouncementsByType(type: DividendAnnouncement['announcementType']): DividendAnnouncement[] {
  return mockDividendAnnouncements.filter(announcement => announcement.announcementType === type);
}

/**
 * Get announcements by symbol
 */
export function getAnnouncementsBySymbol(symbol: string): DividendAnnouncement[] {
  return mockDividendAnnouncements.filter(announcement => 
    announcement.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/**
 * Get recent announcements (within specified days)
 */
export function getRecentAnnouncements(days: number = 30): DividendAnnouncement[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(today.getDate() - days);
  
  return mockDividendAnnouncements.filter(announcement => 
    new Date(announcement.announcementDate) >= cutoffDate
  );
}

/**
 * Get upcoming effective announcements (changes taking effect soon)
 */
export function getUpcomingEffectiveAnnouncements(days: number = 30): DividendAnnouncement[] {
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return mockDividendAnnouncements.filter(announcement => 
    new Date(announcement.effectiveDate) >= today && 
    new Date(announcement.effectiveDate) <= futureDate
  );
}

/**
 * Calculate announcement statistics
 */
export function getAnnouncementStats() {
  const stats = {
    total: mockDividendAnnouncements.length,
    byType: {} as Record<string, number>,
    recent: getRecentAnnouncements(7).length,
    upcoming: getUpcomingEffectiveAnnouncements(30).length,
    averageChange: 0
  };

  // Count by type
  mockDividendAnnouncements.forEach(announcement => {
    stats.byType[announcement.announcementType] = 
      (stats.byType[announcement.announcementType] || 0) + 1;
  });

  // Calculate average percentage change for increases/decreases
  const changesWithPercent = mockDividendAnnouncements.filter(a => 
    a.percentageChange !== undefined && 
    (a.announcementType === 'increase' || a.announcementType === 'decrease')
  );

  if (changesWithPercent.length > 0) {
    stats.averageChange = changesWithPercent.reduce((sum, a) => 
      sum + (a.percentageChange || 0), 0) / changesWithPercent.length;
  }

  return stats;
}

/**
 * Generate notification title for announcement
 */
export function getAnnouncementNotificationTitle(announcement: DividendAnnouncement): string {
  const { announcementType, symbol, percentageChange } = announcement;
  
  switch (announcementType) {
    case 'increase':
      return `🎉 ${symbol} Dividend Increased ${percentageChange ? `(+${percentageChange.toFixed(1)}%)` : ''}`;
    case 'decrease':
      return `📉 ${symbol} Dividend Decreased ${percentageChange ? `(${percentageChange.toFixed(1)}%)` : ''}`;
    case 'special':
      return `💎 ${symbol} Special Dividend Announced`;
    case 'initiation':
      return `🆕 ${symbol} Starts Dividend Program`;
    case 'suspension':
      return `⚠️ ${symbol} Suspends Dividend`;
    case 'frequency_change':
      return `📅 ${symbol} Changes Payment Schedule`;
    default:
      return `📢 ${symbol} Dividend Update`;
  }
}

/**
 * Generate notification body for announcement
 */
export function getAnnouncementNotificationBody(announcement: DividendAnnouncement): string {
  const { announcementType, oldAmount, newAmount, oldFrequency, newFrequency, description } = announcement;
  
  switch (announcementType) {
    case 'increase':
    case 'decrease':
      return `${oldAmount ? `From $${oldAmount.toFixed(3)}` : ''} to $${newAmount.toFixed(3)} per share`;
    case 'special':
      return `$${newAmount.toFixed(3)} per share - ${description || 'Special dividend declared'}`;
    case 'initiation':
      return `New dividend: $${newAmount.toFixed(3)} per share`;
    case 'suspension':
      return description || 'Dividend payments temporarily suspended';
    case 'frequency_change':
      return `Changed from ${oldFrequency} to ${newFrequency} payments`;
    default:
      return description || 'Dividend announcement update';
  }
}