'use client';

import React from 'react';
import { Settings, Palette, Globe, Calendar, Hash, Save } from 'lucide-react';
import { UserSettings } from '../types/settings';
import { ThemeSelector } from '../../theme/ThemeSelector';

interface AppPreferencesTabProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function AppPreferencesTab({ settings, onUpdate, onSave, isSaving }: AppPreferencesTabProps) {
  const { app } = settings;

  const handleAppChange = (field: keyof typeof app, value: string | boolean | string[]) => {
    onUpdate({
      app: {
        ...app,
        [field]: value
      }
    });
  };

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' }
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European Format)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)' }
  ];

  const numberFormats = [
    { value: '1,000.00', label: '1,000.00 (US Format)' },
    { value: '1.000,00', label: '1.000,00 (European Format)' },
    { value: '1 000,00', label: '1 000,00 (French Format)' }
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">App Preferences</h2>
        <p className="text-gray-600">
          Customize how the application looks and behaves.
        </p>
      </div>

      <div className="space-y-8">
        {/* Theme */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Palette className="w-5 h-5 mr-2 text-purple-600" />
            Theme & Appearance
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color Theme
              </label>
              <ThemeSelector />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <label htmlFor="compactMode" className="text-sm font-medium text-gray-700">
                  Compact Mode
                </label>
                <p className="text-sm text-gray-500">
                  Use smaller spacing and components
                </p>
              </div>
              <input
                id="compactMode"
                type="checkbox"
                checked={app.compactMode}
                onChange={(e) => handleAppChange('compactMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <label htmlFor="showAnimations" className="text-sm font-medium text-gray-700">
                  Animations
                </label>
                <p className="text-sm text-gray-500">
                  Enable smooth transitions and animations
                </p>
              </div>
              <input
                id="showAnimations"
                type="checkbox"
                checked={app.showAnimations}
                onChange={(e) => handleAppChange('showAnimations', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Globe className="w-5 h-5 mr-2 text-green-600" />
            Localization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                id="currency"
                value={app.currency}
                onChange={(e) => handleAppChange('currency', e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                id="language"
                value={app.language}
                onChange={(e) => handleAppChange('language', e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español (Coming Soon)</option>
                <option value="fr">Français (Coming Soon)</option>
                <option value="de">Deutsch (Coming Soon)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="dateFormat"
                  value={app.dateFormat}
                  onChange={(e) => handleAppChange('dateFormat', e.target.value as any)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {dateFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Example: {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: app.dateFormat.includes('MM') ? '2-digit' : 'numeric',
                  day: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label htmlFor="numberFormat" className="block text-sm font-medium text-gray-700 mb-2">
                Number Format
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="numberFormat"
                  value={app.numberFormat}
                  onChange={(e) => handleAppChange('numberFormat', e.target.value as any)}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {numberFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Example: {app.numberFormat.replace('1', '1234').replace('000', '')}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Dashboard Layout
          </h3>

          <p className="text-gray-600 mb-4">
            Customize the order of cards on your dashboard. Drag and drop functionality coming soon!
          </p>

          <div className="space-y-3">
            {[
              'Income Clarity Card',
              'Portfolio Overview',
              'SPY Comparison', 
              'Dividend Calendar',
              'Holdings Performance',
              'Tax Planning',
              'Expense Milestones'
            ].map((card, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{card}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Coming Soon:</strong> Drag and drop to reorder your dashboard cards, hide cards you don't use, and create custom layouts.
            </p>
          </div>
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
                <span>Save App Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}