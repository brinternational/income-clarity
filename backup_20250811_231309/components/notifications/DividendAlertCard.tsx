'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Pause, 
  Calendar,
  DollarSign,
  ExternalLink,
  Eye,
  Trash2
} from 'lucide-react';
import { DividendAlert, DIVIDEND_ALERT_COLORS } from '@/types/dividendAlerts';

interface DividendAlertCardProps {
  alert: DividendAlert;
  onMarkRead?: () => void;
  onDelete?: () => void;
  onViewHoldings?: () => void;
  className?: string;
}

// Icon mapping for dividend alert types
const getAlertIcon = (type: DividendAlert['type']) => {
  switch (type) {
    case 'increases':
      return TrendingUp;
    case 'cuts':
      return TrendingDown;
    case 'special':
      return Gift;
    case 'suspensions':
      return Pause;
    default:
      return DollarSign;
  }
};

// Format currency values
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format percentage values
const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(1)}%`;
};

// Format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * DividendAlertCard Component
 * 
 * Displays a dividend alert with appropriate styling, icons, and actions.
 * Integrates with the existing notification system while providing
 * dividend-specific information and formatting.
 */
export function DividendAlertCard({
  alert,
  onMarkRead,
  onDelete,
  onViewHoldings,
  className = ''
}: DividendAlertCardProps) {
  const colors = DIVIDEND_ALERT_COLORS[alert.type];
  const IconComponent = getAlertIcon(alert.type);
  
  // Determine if this is a positive or negative change
  const isPositive = alert.type === 'increases' || alert.type === 'special';
  const isNegative = alert.type === 'cuts' || alert.type === 'suspensions';

  return (
    <div
      className={`
        p-4 border-l-4 rounded-lg transition-all duration-200 
        hover:shadow-md hover:scale-[1.01] 
        ${!alert.read ? 'bg-opacity-5' : 'bg-transparent'}
        ${className}
      `}
      style={{
        borderLeftColor: colors.border,
        backgroundColor: !alert.read ? colors.background : 'transparent',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: colors.background }}
          >
            <IconComponent
              className="w-5 h-5"
              style={{ color: colors.primary }}
            />
          </div>

          {/* Title and Ticker */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3
                className={`text-sm font-semibold ${!alert.read ? '' : 'opacity-75'}`}
                style={{ color: 'var(--color-text-primary)' }}
              >
                {alert.ticker}
              </h3>
              {!alert.read && (
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.primary }}
                  aria-label="Unread"
                />
              )}
            </div>
            <p
              className={`text-xs ${!alert.read ? 'opacity-80' : 'opacity-60'}`}
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {alert.companyName}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 ml-2">
          {!alert.read && onMarkRead && (
            <button
              onClick={onMarkRead}
              className="p-1.5 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-text-secondary)'
              }}
              title="Mark as read"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.background;
                e.currentTarget.style.color = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-text-secondary)'
              }}
              title="Delete alert"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = 'var(--color-error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Dividend Change Details */}
      <div className="space-y-2 mb-3">
        {/* Amount Change */}
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Dividend Change:
          </span>
          <div className="flex items-center space-x-2">
            <span
              className="font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {formatCurrency(alert.previousAmount)} → {formatCurrency(alert.newAmount)}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isPositive ? 'text-white' : isNegative ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: colors.primary,
                color: 'white'
              }}
            >
              {formatPercentage(alert.percentageChange)}
            </span>
          </div>
        </div>

        {/* Income Impact */}
        {alert.userHoldings && alert.userHoldings > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Annual Income Impact:
            </span>
            <span
              className="font-medium"
              style={{ 
                color: isPositive ? '#10b981' : isNegative ? '#ef4444' : 'var(--color-text-primary)'
              }}
            >
              {alert.annualIncomeImpact >= 0 ? '+' : ''}{formatCurrency(alert.annualIncomeImpact)}
            </span>
          </div>
        )}

        {/* Holdings */}
        {alert.userHoldings && alert.userHoldings > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Your Holdings:
            </span>
            <span
              className="font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {alert.userHoldings} shares
            </span>
          </div>
        )}
      </div>

      {/* Special Information */}
      {alert.reason && (
        <div className="mb-3">
          <p
            className="text-xs p-2 rounded"
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-text-secondary)'
            }}
          >
            <strong>Reason:</strong> {alert.reason}
          </p>
        </div>
      )}

      {alert.specialType && (
        <div className="mb-3">
          <span
            className="inline-block px-2 py-1 text-xs font-medium rounded"
            style={{
              backgroundColor: colors.background,
              color: colors.primary
            }}
          >
            {alert.specialType} Dividend
          </span>
        </div>
      )}

      {/* Important Dates */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Ex-Div: {formatDate(alert.exDividendDate)}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Payment: {formatDate(alert.paymentDate)}
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs opacity-60"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {alert.timestamp.toLocaleDateString()} at {alert.timestamp.toLocaleTimeString()}
        </span>

        {/* Action Button */}
        {alert.actionUrl && alert.actionLabel && onViewHoldings && (
          <button
            onClick={onViewHoldings}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: colors.primary,
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <ExternalLink className="w-3 h-3" />
            <span>{alert.actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}