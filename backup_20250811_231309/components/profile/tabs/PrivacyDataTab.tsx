'use client';

import React, { useState } from 'react';
import { Lock, Download, Trash2, Save, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { UserSettings } from '../types/settings';

interface PrivacyDataTabProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function PrivacyDataTab({ settings, onUpdate, onSave, isSaving }: PrivacyDataTabProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const { privacy } = settings;

  const handlePrivacyChange = (field: keyof typeof privacy, value: boolean | number) => {
    onUpdate({
      privacy: {
        ...privacy,
        [field]: value
      }
    });
  };

  const handleExportData = () => {
    // In a real app, this would make an API call to generate and download user data
    const userData = {
      exportedAt: new Date().toISOString(),
      profile: settings.personal,
      settings: settings.app,
      privacySettings: settings.privacy,
      // In a real app, this would include portfolio data, transactions, etc.
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `income-clarity-data-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE MY ACCOUNT') {
      // In a real app, this would make an API call to delete the account
      alert('Account deletion would be initiated. This is a demo, so no actual deletion occurs.');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Privacy & Data</h2>
        <p className="text-gray-600">
          Control your privacy settings and manage your data.
        </p>
      </div>

      <div className="space-y-8">
        {/* Privacy Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
            <Eye className="w-5 h-5 mr-2 text-green-600" />
            Privacy Controls
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <label htmlFor="privacyMode" className="text-sm font-medium text-gray-700">
                  Privacy Mode
                </label>
                <p className="text-sm text-gray-500">
                  Hide sensitive numbers and amounts throughout the app
                </p>
              </div>
              <input
                id="privacyMode"
                type="checkbox"
                checked={privacy.privacyMode}
                onChange={(e) => handlePrivacyChange('privacyMode', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <label htmlFor="analyticsEnabled" className="text-sm font-medium text-gray-700">
                  Analytics & Usage Data
                </label>
                <p className="text-sm text-gray-500">
                  Help improve the app by sharing anonymous usage statistics
                </p>
              </div>
              <input
                id="analyticsEnabled"
                type="checkbox"
                checked={privacy.analyticsEnabled}
                onChange={(e) => handlePrivacyChange('analyticsEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <label htmlFor="shareAnonymousData" className="text-sm font-medium text-gray-700">
                  Anonymous Data Sharing
                </label>
                <p className="text-sm text-gray-500">
                  Share anonymized data for market research (no personal info)
                </p>
              </div>
              <input
                id="shareAnonymousData"
                type="checkbox"
                checked={privacy.shareAnonymousData}
                onChange={(e) => handlePrivacyChange('shareAnonymousData', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div>
                <label htmlFor="marketingEmails" className="text-sm font-medium text-gray-700">
                  Marketing Communications
                </label>
                <p className="text-sm text-gray-500">
                  Receive emails about new features, tips, and product updates
                </p>
              </div>
              <input
                id="marketingEmails"
                type="checkbox"
                checked={privacy.marketingEmails}
                onChange={(e) => handlePrivacyChange('marketingEmails', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <label htmlFor="cookiesAccepted" className="text-sm font-medium text-gray-700">
                  Cookies & Tracking
                </label>
                <p className="text-sm text-gray-500">
                  Allow cookies for personalization and analytics
                </p>
              </div>
              <input
                id="cookiesAccepted"
                type="checkbox"
                checked={privacy.cookiesAccepted}
                onChange={(e) => handlePrivacyChange('cookiesAccepted', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Retention</h3>
          
          <div>
            <label htmlFor="dataRetention" className="block text-sm font-medium text-gray-700 mb-2">
              Automatic Data Cleanup
            </label>
            <select
              id="dataRetention"
              value={privacy.dataRetention}
              onChange={(e) => handlePrivacyChange('dataRetention', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={365}>Delete data older than 1 year</option>
              <option value={730}>Delete data older than 2 years</option>
              <option value={1095}>Delete data older than 3 years</option>
              <option value={1825}>Delete data older than 5 years</option>
              <option value={-1}>Keep all data</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Automatically remove old portfolio snapshots and historical data to reduce storage.
              Your core holdings and current data will never be deleted.
            </p>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Download className="w-5 h-5 mr-2 text-blue-600" />
            Data Export
          </h3>
          
          <p className="text-gray-600 mb-4">
            Download a complete copy of your data including profile, settings, portfolio holdings, and transaction history.
          </p>
          
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download My Data</span>
          </button>
          
          <p className="mt-2 text-sm text-gray-500">
            Your data will be exported as a JSON file. This may take a few minutes for large portfolios.
          </p>
        </div>

        {/* Account Deletion */}
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 flex items-center mb-4">
            <Trash2 className="w-5 h-5 mr-2 text-red-600" />
            Delete Account
          </h3>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h4>
                <p className="text-sm text-red-700 mt-1">
                  Deleting your account will permanently remove all your data, including portfolio holdings, 
                  transaction history, and settings. This action is irreversible.
                </p>
              </div>
            </div>
          </div>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-700 mb-2">
                  To confirm deletion, type <strong>"DELETE MY ACCOUNT"</strong> below:
                </label>
                <input
                  id="deleteConfirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Permanently Delete Account
                </button>
              </div>
            </div>
          )}
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
                <span>Save Privacy Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}