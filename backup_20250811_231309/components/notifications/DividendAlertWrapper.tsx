'use client';

import React from 'react';
import { DividendAlertCard } from './DividendAlertCard';
import { Notification } from '@/contexts/NotificationContext';
import type { DividendAlert } from '@/types/dividendAlerts';

interface DividendAlertWrapperProps {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}

/**
 * DividendAlertWrapper Component
 * 
 * Wrapper that detects if a notification is a dividend alert and renders
 * it with the specialized DividendAlertCard component. This allows the
 * existing NotificationCenter to display dividend alerts with enhanced
 * styling and information without major modifications.
 */
export function DividendAlertWrapper({
  notification,
  onMarkRead,
  onDelete
}: DividendAlertWrapperProps) {
  // Check if this is a dividend-related notification
  const isDividendAlert = notification.title.toLowerCase().includes('dividend') ||
                         notification.message.toLowerCase().includes('dividend') ||
                         notification.id.includes('dividend-alert');

  // If it's not a dividend alert, return null to use default rendering
  if (!isDividendAlert) {
    return null;
  }

  // Extract dividend information from the notification
  // This is a simplified approach - in a real implementation, you might
  // store additional metadata in the notification or have a mapping service
  const mockDividendAlert: DividendAlert = {
    id: notification.id,
    type: extractDividendType(notification),
    title: notification.title,
    message: notification.message,
    timestamp: notification.timestamp,
    read: notification.read,
    ticker: extractTicker(notification),
    companyName: extractCompanyName(notification),
    previousAmount: 0.65, // Mock data - would be extracted from metadata
    newAmount: 0.72,      // Mock data - would be extracted from metadata
    percentageChange: 10.8,
    exDividendDate: new Date(),
    paymentDate: new Date(),
    annualIncomeImpact: 280,
    userHoldings: 100,
    actionUrl: notification.actionUrl,
    actionLabel: notification.actionLabel
  };

  return (
    <DividendAlertCard
      alert={mockDividendAlert}
      onMarkRead={onMarkRead}
      onDelete={onDelete}
      onViewHoldings={() => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
      }}
    />
  );
}

/**
 * Extract dividend alert type from notification content
 */
function extractDividendType(notification: Notification): DividendAlert['type'] {
  const title = notification.title.toLowerCase();
  const message = notification.message.toLowerCase();
  
  if (title.includes('increase') || message.includes('increased')) {
    return 'increases';
  }
  if (title.includes('cut') || message.includes('reduced') || message.includes('cut')) {
    return 'cuts';
  }
  if (title.includes('special') || message.includes('special')) {
    return 'special';
  }
  if (title.includes('suspend') || message.includes('suspend')) {
    return 'suspensions';
  }
  
  return 'increases'; // Default fallback
}

/**
 * Extract ticker symbol from notification content
 */
function extractTicker(notification: Notification): string {
  // Look for ticker pattern in title (e.g., "SCHD Dividend Increase!")
  const tickerMatch = notification.title.match(/^([A-Z]{1,5})\s/);
  if (tickerMatch) {
    return tickerMatch[1];
  }
  
  // Fallback to looking in message
  const messageMatch = notification.message.match(/([A-Z]{1,5})\s/);
  if (messageMatch) {
    return messageMatch[1];
  }
  
  return 'UNKNOWN';
}

/**
 * Extract company name from notification content
 */
function extractCompanyName(notification: Notification): string {
  // Try to extract company name from message
  // Pattern: "CompanyName increased their dividend..."
  const match = notification.message.match(/^([^(]+?)\s(?:increased|reduced|declared|suspended)/);
  if (match) {
    return match[1].trim();
  }
  
  // Fallback to a generic name
  const ticker = extractTicker(notification);
  return `${ticker} Corporation`;
}