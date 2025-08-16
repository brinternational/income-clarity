'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings,
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Pause,
  Percent,
  Users,
  Mail,
  Monitor,
  TestTube,
  Save,
  RefreshCw
} from 'lucide-react';
import { Toggle } from '@/components/forms/Toggle';
import { Button } from '@/components/forms/Button';
import { DividendAlertSettings as AlertSettings } from '@/types/dividendAlerts';
import { DividendAlertService } from '@/services/DividendAlertService';
import { useNotifications } from '@/contexts/NotificationContext';
import { MOCK_DIVIDEND_ANNOUNCEMENTS } from '@/data/mockDividendAnnouncements';

interface DividendAlertSettingsProps {
  onClose?: () => void;
  className?: string;
}

/**
 * DividendAlertSettings Component
 * 
 * Provides a comprehensive settings interface for dividend alerts,
 * allowing users to configure alert types, thresholds, and notification
 * preferences. Includes a test feature to preview alert functionality.
 */
export function DividendAlertSettings({
  onClose,
  className = ''
}: DividendAlertSettingsProps) {
  const { addNotification } = useNotifications();
  const [settings, setSettings] = useState<AlertSettings>(
    DividendAlertService.getUserSettings()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes to show unsaved changes indicator
  useEffect(() => {
    const currentSettings = DividendAlertService.getUserSettings();
    const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(currentSettings);
    setHasChanges(hasUnsavedChanges);
  }, [settings]);

  // Handle saving settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      DividendAlertService.saveUserSettings(settings);
      
      addNotification({
        title: 'Settings Saved',
        message: 'Your dividend alert preferences have been updated.',
        type: 'success'
      });

      setHasChanges(false);
      
      // Close settings panel if callback provided
      if (onClose) {
        setTimeout(onClose, 500); // Small delay to show success message
      }
    } catch (error) {
      addNotification({
        title: 'Save Failed',
        message: 'Failed to save your alert preferences. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resetting to defaults
  const handleResetToDefaults = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all dividend alert settings to their default values?'
    );
    
    if (confirmed) {
      setSettings(DividendAlertService.getUserSettings());
      setHasChanges(true);
    }
  };

  // Test alert functionality
  const handleTestAlert = () => {
    // Use a sample announcement to create a test alert
    const testAnnouncement = MOCK_DIVIDEND_ANNOUNCEMENTS.find(
      a => a.ticker === 'SCHD'
    ) || MOCK_DIVIDEND_ANNOUNCEMENTS[0];

    const testAlert = DividendAlertService.createDividendAlert(testAnnouncement);
    const notification = DividendAlertService.dividendAlertToNotification(testAlert);
    
    addNotification({
      ...notification,
      title: `Test Alert: ${notification.title}`,
      message: `This is a test alert to preview how dividend notifications will appear. ${notification.message}`
    });
  };

  // Update settings helper
  const updateSettings = (updates: Partial<AlertSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates
    }));
  };

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
              Dividend Alert Settings
            </h2>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Configure how you receive dividend announcements
            </p>
          </div>
        </div>

        {hasChanges && (
          <div 
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b'
            }}
          >
            Unsaved Changes
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Main Toggle */}
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-secondary)',
            borderColor: 'var(--color-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 
                className="text-lg font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Enable Dividend Alerts
              </h3>
              <p 
                className="text-sm mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Receive notifications about dividend changes for your holdings
              </p>
            </div>
            <Toggle
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              size="lg"
            />
          </div>
        </div>

        {/* Alert Types */}
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
            Alert Types
          </h3>
          
          <div className="space-y-4">
            {/* Dividend Increases */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4" style={{ color: '#10b981' }} />
                <div>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Dividend Increases
                  </span>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Companies raising their dividend payments
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.alertTypes.increases}
                onChange={(e) => 
                  updateSettings({ 
                    alertTypes: { ...settings.alertTypes, increases: e.target.checked } 
                  })
                }
                disabled={!settings.enabled}
              />
            </div>

            {/* Dividend Cuts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                <div>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Dividend Cuts
                  </span>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Companies reducing their dividend payments
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.alertTypes.cuts}
                onChange={(e) => 
                  updateSettings({ 
                    alertTypes: { ...settings.alertTypes, cuts: e.target.checked } 
                  })
                }
                disabled={!settings.enabled}
              />
            </div>

            {/* Special Dividends */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gift className="w-4 h-4" style={{ color: '#3b82f6' }} />
                <div>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Special Dividends
                  </span>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Extra dividend payments and bonuses
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.alertTypes.special}
                onChange={(e) => 
                  updateSettings({ 
                    alertTypes: { ...settings.alertTypes, special: e.target.checked } 
                  })
                }
                disabled={!settings.enabled}
              />
            </div>

            {/* Dividend Suspensions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Pause className="w-4 h-4" style={{ color: '#f59e0b' }} />
                <div>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Dividend Suspensions
                  </span>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Companies pausing dividend payments
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.alertTypes.suspensions}
                onChange={(e) => 
                  updateSettings({ 
                    alertTypes: { ...settings.alertTypes, suspensions: e.target.checked } 
                  })
                }
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
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
            Alert Thresholds
          </h3>
          
          <div className="space-y-4">
            {/* Minimum Change Percentage */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <label 
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Minimum Change Percentage
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={settings.thresholds.minimumChangePercent}
                  onChange={(e) => 
                    updateSettings({
                      thresholds: {
                        ...settings.thresholds,
                        minimumChangePercent: parseFloat(e.target.value)
                      }
                    })
                  }
                  disabled={!settings.enabled}
                  className="flex-1"
                  style={{ accentColor: 'var(--color-accent)' }}
                />
                <span 
                  className="text-sm font-medium w-12"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {settings.thresholds.minimumChangePercent}%
                </span>
              </div>
              <p 
                className="text-xs mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Only alert for dividend changes greater than this percentage
              </p>
            </div>

            {/* Holdings Only Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Holdings Only
                  </span>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Only alert for stocks you currently own
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.thresholds.holdingsOnly}
                onChange={(e) => 
                  updateSettings({
                    thresholds: { ...settings.thresholds, holdingsOnly: e.target.checked }
                  })
                }
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </div>

        {/* Notification Channels */}
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
            Notification Channels
          </h3>
          
          <div className="space-y-4">
            {/* Browser Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Browser Notifications
                  </span>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Push notifications to your browser
                  </p>
                </div>
              </div>
              <Toggle
                checked={settings.notifications.browser}
                onChange={(e) => 
                  updateSettings({
                    notifications: { ...settings.notifications, browser: e.target.checked }
                  })
                }
                disabled={!settings.enabled}
              />
            </div>

            {/* Email Notifications (Future) */}
            <div className="flex items-center justify-between opacity-50">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <div>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    Email Notifications
                  </span>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Email alerts (coming soon)
                  </p>
                </div>
              </div>
              <Toggle
                checked={false}
                onChange={() => {}}
                disabled={true}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleTestAlert}
              variant="outline"
              size="sm"
              disabled={!settings.enabled}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Alert
            </Button>

            <Button
              onClick={handleResetToDefaults}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            )}

            <Button
              onClick={handleSaveSettings}
              variant="primary"
              size="sm"
              disabled={!hasChanges}
              loading={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}