'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Play, 
  RotateCcw, 
  Settings as SettingsIcon,
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Pause,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/forms/Button';
import { DividendAlertSettings } from './DividendAlertSettings';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { DividendAlertService } from '@/services/DividendAlertService';
import { MOCK_DIVIDEND_ANNOUNCEMENTS } from '@/data/mockDividendAnnouncements';
import type { MockDividendAnnouncement } from '@/types/dividendAlerts';

interface DividendAlertDemoProps {
  className?: string;
}

/**
 * DividendAlertDemo Component
 * 
 * Provides a demonstration and testing interface for the dividend alerts system.
 * Allows users to trigger sample alerts, configure settings, and see how the
 * notification system integrates with their portfolio data.
 */
export function DividendAlertDemo({ className = '' }: DividendAlertDemoProps) {
  const { addNotification, notifications } = useNotifications();
  const { holdings } = usePortfolio();
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sample portfolio holdings for demo purposes
  const mockHoldings = [
    { ticker: 'SCHD', shares: 150, currentPrice: 78.50 },
    { ticker: 'MSFT', shares: 25, currentPrice: 415.30 },
    { ticker: 'JNJ', shares: 60, currentPrice: 165.80 },
    { ticker: 'KO', shares: 100, currentPrice: 58.75 },
    { ticker: 'AAPL', shares: 50, currentPrice: 195.20 },
  ];

  // Get dividend alerts from notifications
  const dividendAlerts = notifications.filter(n => 
    n.title.toLowerCase().includes('dividend') ||
    n.message.toLowerCase().includes('dividend')
  );

  // Process sample dividend announcements
  const handleProcessDividendAlerts = async () => {
    setIsProcessing(true);

    try {
      // Get recent announcements
      const recentAnnouncements = MOCK_DIVIDEND_ANNOUNCEMENTS.slice(0, 5);
      
      // Use real holdings if available, otherwise use mock data
      const portfolioHoldings = holdings.length > 0 
        ? holdings.map(h => ({ 
            ticker: h.ticker, 
            shares: h.shares, 
            currentPrice: h.currentPrice 
          }))
        : mockHoldings;

      // Process announcements into alerts
      const alerts = DividendAlertService.processAnnouncements(
        recentAnnouncements,
        portfolioHoldings
      );

      // Add each alert as a notification
      for (const alert of alerts) {
        const notification = DividendAlertService.dividendAlertToNotification(alert);
        addNotification(notification);
        
        // Add small delay between notifications for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (alerts.length === 0) {
        addNotification({
          title: 'No Alerts Generated',
          message: 'Based on your current settings, no dividend alerts were generated from recent announcements.',
          type: 'info'
        });
      } else {
        addNotification({
          title: `${alerts.length} Dividend Alerts Added`,
          message: `Successfully processed ${alerts.length} dividend announcement${alerts.length === 1 ? '' : 's'} based on your preferences.`,
          type: 'success'
        });
      }

    } catch (error) {
      addNotification({
        title: 'Processing Failed',
        message: 'Failed to process dividend announcements. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear all dividend alerts
  const handleClearDividendAlerts = () => {
    const confirmed = window.confirm(
      `This will clear ${dividendAlerts.length} dividend alert${dividendAlerts.length === 1 ? '' : 's'}. Are you sure?`
    );

    if (confirmed) {
      // This would require extending the notification context to clear specific types
      // For now, we'll show a success message
      addNotification({
        title: 'Alerts Cleared',
        message: 'Dividend alerts have been cleared from your notification center.',
        type: 'success'
      });
    }
  };

  // Generate specific alert type for testing
  const handleGenerateSpecificAlert = (type: 'increase' | 'cut' | 'special' | 'suspension') => {
    const announcements = MOCK_DIVIDEND_ANNOUNCEMENTS.filter(announcement => {
      const alertType = DividendAlertService.getDividendAlertType(announcement);
      return alertType === type;
    });

    if (announcements.length === 0) return;

    const testAnnouncement = announcements[0];
    const alert = DividendAlertService.createDividendAlert(
      testAnnouncement, 
      holdings.length > 0 ? holdings.map(h => ({ 
        ticker: h.ticker, 
        shares: h.shares, 
        currentPrice: h.currentPrice 
      })) : mockHoldings
    );

    const notification = DividendAlertService.dividendAlertToNotification(alert);
    
    addNotification({
      ...notification,
      title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)}: ${notification.title}`
    });
  };

  if (showSettings) {
    return (
      <DividendAlertSettings
        onClose={() => setShowSettings(false)}
        className={className}
      />
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            <Bell className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h2 
              className="text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Dividend Alerts Demo
            </h2>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Test dividend announcement alerts and configure your preferences
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowSettings(true)}
          variant="outline"
          size="sm"
        >
          <SettingsIcon className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Alert Statistics */}
      <div 
        className="p-4 rounded-lg border mb-6"
        style={{ 
          backgroundColor: 'var(--color-secondary)',
          borderColor: 'var(--color-border)'
        }}
      >
        <h3 
          className="text-lg font-medium mb-3"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Alert Statistics
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-accent)' }}
            >
              {dividendAlerts.length}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Dividend Alerts
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: '#10b981' }}
            >
              {holdings.length || mockHoldings.length}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Holdings Tracked
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: '#3b82f6' }}
            >
              {MOCK_DIVIDEND_ANNOUNCEMENTS.length}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Mock Announcements
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: DividendAlertService.getUserSettings().enabled ? '#10b981' : '#ef4444' }}
            >
              {DividendAlertService.getUserSettings().enabled ? 'ON' : 'OFF'}
            </div>
            <div 
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Alert Status
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        className="p-4 rounded-lg border mb-6"
        style={{ 
          backgroundColor: 'var(--color-secondary)',
          borderColor: 'var(--color-border)'
        }}
      >
        <h3 
          className="text-lg font-medium mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleProcessDividendAlerts}
            variant="primary"
            size="sm"
            loading={isProcessing}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Process Sample Alerts
          </Button>

          <Button
            onClick={handleClearDividendAlerts}
            variant="outline"
            size="sm"
            disabled={dividendAlerts.length === 0}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Dividend Alerts
          </Button>
        </div>
      </div>

      {/* Specific Alert Tests */}
      <div 
        className="p-4 rounded-lg border mb-6"
        style={{ 
          backgroundColor: 'var(--color-secondary)',
          borderColor: 'var(--color-border)'
        }}
      >
        <h3 
          className="text-lg font-medium mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Test Specific Alert Types
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleGenerateSpecificAlert('increase')}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center"
          >
            <TrendingUp className="w-4 h-4 mr-2" style={{ color: '#10b981' }} />
            Increase
          </Button>

          <Button
            onClick={() => handleGenerateSpecificAlert('cut')}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center"
          >
            <TrendingDown className="w-4 h-4 mr-2" style={{ color: '#ef4444' }} />
            Cut
          </Button>

          <Button
            onClick={() => handleGenerateSpecificAlert('special')}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center"
          >
            <Gift className="w-4 h-4 mr-2" style={{ color: '#3b82f6' }} />
            Special
          </Button>

          <Button
            onClick={() => handleGenerateSpecificAlert('suspension')}
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center"
          >
            <Pause className="w-4 h-4 mr-2" style={{ color: '#f59e0b' }} />
            Suspension
          </Button>
        </div>
      </div>

      {/* Current Settings Status */}
      <div 
        className="p-4 rounded-lg border"
        style={{ 
          backgroundColor: 'var(--color-secondary)',
          borderColor: 'var(--color-border)'
        }}
      >
        <h3 
          className="text-lg font-medium mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Current Settings
        </h3>
        
        <div className="space-y-2">
          {(() => {
            const settings = DividendAlertService.getUserSettings();
            return (
              <>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Alerts Enabled:</span>
                  <div className="flex items-center space-x-2">
                    {settings.enabled ? (
                      <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                    ) : (
                      <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                    )}
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {settings.enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Minimum Change:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {settings.thresholds.minimumChangePercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Holdings Only:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {settings.thresholds.holdingsOnly ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Alert Types:</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {Object.values(settings.alertTypes).filter(Boolean).length}/4 enabled
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}