/**
 * Dividend Alert System Types
 * 
 * This module defines the TypeScript interfaces and types for the dividend
 * announcement alerts system, including alerts for increases, cuts, special
 * dividends, and suspensions.
 */

import { Notification } from '@/contexts/NotificationContext';

export type DividendAlertType = 'increases' | 'cuts' | 'special' | 'suspensions';

/**
 * Extended notification interface specifically for dividend alerts
 */
export interface DividendAlert extends Omit<Notification, 'type'> {
  type: DividendAlertType;
  ticker: string;
  companyName: string;
  previousAmount: number;
  newAmount: number;
  percentageChange: number;
  exDividendDate: Date;
  paymentDate: Date;
  annualIncomeImpact: number;
  userHoldings?: number; // Number of shares user owns
  reason?: string; // For cuts and suspensions
  specialType?: string; // For special dividends (e.g., "Extra", "Return of Capital")
}

/**
 * Mock dividend announcement data structure
 */
export interface MockDividendAnnouncement {
  ticker: string;
  companyName: string;
  previousAmount: number;
  newAmount: number;
  exDividendDate: string; // ISO date string
  paymentDate: string; // ISO date string
  announcementDate: string; // ISO date string
  reason?: string;
  specialType?: string;
}

/**
 * User preferences for dividend alerts
 */
export interface DividendAlertSettings {
  enabled: boolean;
  alertTypes: {
    increases: boolean;
    cuts: boolean;
    special: boolean;
    suspensions: boolean;
  };
  thresholds: {
    minimumChangePercent: number; // Only alert for changes >= this %
    holdingsOnly: boolean; // Only alert for stocks user owns
  };
  notifications: {
    browser: boolean;
    email: boolean; // Future implementation
  };
}

/**
 * Default user preferences for dividend alerts
 */
export const DEFAULT_DIVIDEND_ALERT_SETTINGS: DividendAlertSettings = {
  enabled: true,
  alertTypes: {
    increases: true,
    cuts: true,
    special: true,
    suspensions: true,
  },
  thresholds: {
    minimumChangePercent: 5, // 5% minimum change
    holdingsOnly: false, // Alert for all dividend changes
  },
  notifications: {
    browser: true,
    email: false,
  },
};

/**
 * Color mapping for different alert types
 */
export const DIVIDEND_ALERT_COLORS = {
  increases: {
    primary: '#10b981', // green-500
    background: 'rgba(16, 185, 129, 0.1)',
    border: '#10b981',
  },
  cuts: {
    primary: '#ef4444', // red-500
    background: 'rgba(239, 68, 68, 0.1)',
    border: '#ef4444',
  },
  special: {
    primary: '#3b82f6', // blue-500
    background: 'rgba(59, 130, 246, 0.1)',
    border: '#3b82f6',
  },
  suspensions: {
    primary: '#f59e0b', // amber-500
    background: 'rgba(245, 158, 11, 0.1)',
    border: '#f59e0b',
  },
} as const;

/**
 * Icon mapping for different alert types (using Lucide React icons)
 */
export const DIVIDEND_ALERT_ICONS = {
  increases: 'TrendingUp',
  cuts: 'TrendingDown',
  special: 'Gift',
  suspensions: 'Pause',
} as const;