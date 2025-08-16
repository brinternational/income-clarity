'use client';

import React from 'react';
import { Bell, Mail, MessageSquare, Save, Clock } from 'lucide-react';
import { UserSettings } from '../types/settings';

interface NotificationPrefsTabProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function NotificationPrefsTab({ settings, onUpdate, onSave, isSaving }: NotificationPrefsTabProps) {
  const { notifications } = settings;

  const handleNotificationToggle = (channel: 'email' | 'push', type: keyof typeof notifications.email) => {
    onUpdate({
      notifications: {
        ...notifications,
        [channel]: {
          ...notifications[channel],
          [type]: !notifications[channel][type]
        }
      }
    });
  };

  const handleSMSToggle = (field: keyof typeof notifications.sms, value: boolean | string) => {
    onUpdate({
      notifications: {
        ...notifications,
        sms: {
          ...notifications.sms,
          [field]: value
        }
      }
    });
  };

  const handleQuietHours = (field: keyof typeof notifications.quietHours, value: boolean | string) => {
    onUpdate({
      notifications: {
        ...notifications,
        quietHours: {
          ...notifications.quietHours,
          [field]: value
        }
      }
    });
  };

  const notificationTypes = [
    { key: 'dividendPayments', label: 'Dividend Payments', description: 'When dividends are paid to your portfolio' },
    { key: 'priceAlerts', label: 'Price Alerts', description: 'Significant price movements in your holdings' },
    { key: 'portfolioChanges', label: 'Portfolio Changes', description: 'When holdings are added or removed' },
    { key: 'taxReminders', label: 'Tax Reminders', description: 'Important tax deadlines and requirements' },
    { key: 'rebalancingAlerts', label: 'Rebalancing Alerts', description: 'Portfolio drift and rebalancing suggestions' },
    { key: 'securityAlerts', label: 'Security Alerts', description: 'Account security and login notifications' },
    { key: 'marketNews', label: 'Market News', description: 'Relevant market updates and news' }
  ] as const;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">
          Choose how and when you want to receive notifications about your portfolio.
        </p>
      </div>

      <div className="space-y-8">
        {/* Email & Push Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Types</h3>
            <p className="text-gray-600">
              Select which notifications you want to receive via email and push notifications.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-4">
                    <span className="text-sm font-medium text-gray-700">Notification Type</span>
                  </th>
                  <th className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Email</span>
                    </div>
                  </th>
                  <th className="text-center py-3 pl-4">
                    <div className="flex items-center justify-center">
                      <Bell className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Push</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {notificationTypes.map((type) => (
                  <tr key={type.key} className="border-b border-gray-100 last:border-0">
                    <td className="py-4 pr-4">
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifications.email[type.key]}
                        onChange={() => handleNotificationToggle('email', type.key)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-4 pl-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifications.push[type.key]}
                        onChange={() => handleNotificationToggle('push', type.key)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
              SMS Notifications
            </h3>
            <input
              type="checkbox"
              checked={notifications.sms.enabled}
              onChange={(e) => handleSMSToggle('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          {notifications.sms.enabled && (
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label htmlFor="smsPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="smsPhone"
                  type="tel"
                  value={notifications.sms.phoneNumber}
                  onChange={(e) => handleSMSToggle('phoneNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <label htmlFor="criticalOnly" className="text-sm font-medium text-gray-700">
                    Critical Alerts Only
                  </label>
                  <p className="text-sm text-gray-500">
                    Only send SMS for security and urgent portfolio alerts
                  </p>
                </div>
                <input
                  id="criticalOnly"
                  type="checkbox"
                  checked={notifications.sms.criticalAlertsOnly}
                  onChange={(e) => handleSMSToggle('criticalAlertsOnly', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Quiet Hours */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Quiet Hours
            </h3>
            <input
              type="checkbox"
              checked={notifications.quietHours.enabled}
              onChange={(e) => handleQuietHours('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          {notifications.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label htmlFor="quietStart" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  id="quietStart"
                  type="time"
                  value={notifications.quietHours.start}
                  onChange={(e) => handleQuietHours('start', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="quietEnd" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  id="quietEnd"
                  type="time"
                  value={notifications.quietHours.end}
                  onChange={(e) => handleQuietHours('end', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-3">
            {notifications.quietHours.enabled 
              ? `No notifications will be sent between ${notifications.quietHours.start} and ${notifications.quietHours.end}`
              : 'Enable quiet hours to pause notifications during specific times'
            }
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Notification Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}