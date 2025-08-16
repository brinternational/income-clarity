'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Monitor, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { UserSettings } from '../types/settings';
import { PasswordStrengthIndicator } from '../../ui/PasswordStrengthIndicator';
import { logger } from '@/lib/logger'

interface AccountSecurityTabProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function AccountSecurityTab({ settings, onUpdate, onSave, isSaving }: AccountSecurityTabProps) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { security } = settings;

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordChange = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSave = () => {
    if (validatePasswordChange()) {
      // In a real app, this would make an API call
      // logger.log('Password change requested');

      // Update last password change date
      onUpdate({
        security: {
          ...security,
          passwordLastChanged: new Date().toISOString()
        }
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
      
      onSave();
    }
  };

  const handleTwoFactorToggle = () => {
    onUpdate({
      security: {
        ...security,
        twoFactorEnabled: !security.twoFactorEnabled
      }
    });
  };

  const handleDisconnectAccount = (accountId: string) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      onUpdate({
        security: {
          ...security,
          connectedAccounts: security.connectedAccounts.filter(acc => acc.id !== accountId)
        }
      });
    }
  };

  const handleLogoutSession = (sessionId: string) => {
    if (confirm('Are you sure you want to log out of this session?')) {
      onUpdate({
        security: {
          ...security,
          activeSessions: security.activeSessions.filter(session => session.id !== sessionId)
        }
      });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account & Security</h2>
        <p className="text-gray-600">
          Manage your account security settings and connected devices.
        </p>
      </div>

      <div className="space-y-8">
        {/* Account Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Account Status
            </h3>
            
            {security.accountVerified ? (
              <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Unverified</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="font-medium text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Last Password Change</p>
              <p className="font-medium text-gray-900">
                {new Date(security.passwordLastChanged).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Two-Factor Auth</p>
              <p className={`font-medium ${security.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Password Management */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Key className="w-5 h-5 mr-2 text-green-600" />
              Password
            </h3>
            
            {!showChangePassword && (
              <button
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            )}
          </div>
          
          {showChangePassword ? (
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
                
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <PasswordStrengthIndicator password={passwordData.newPassword} />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Password last changed {new Date(security.passwordLastChanged).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-purple-600" />
              Two-Factor Authentication
            </h3>
            
            <button
              onClick={handleTwoFactorToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                security.twoFactorEnabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Add an extra layer of security to your account by requiring a verification code from your phone.
          </p>
          
          {security.twoFactorEnabled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Two-factor authentication is enabled</span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Your account is protected with SMS verification codes.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center text-amber-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="font-medium">Two-factor authentication is disabled</span>
              </div>
              <p className="text-amber-600 text-sm mt-1">
                Enable 2FA to secure your account with SMS verification.
              </p>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Monitor className="w-5 h-5 mr-2 text-blue-600" />
            Active Sessions
          </h3>
          
          <p className="text-gray-600 mb-4">
            These are the devices and browsers where you're currently logged in.
          </p>
          
          <div className="space-y-3">
            {/* Current session (mock) */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Current Session</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Active now
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      San Francisco, CA
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Chrome on Windows</p>
                </div>
              </div>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                This device
              </span>
            </div>
            
            {/* Mock other sessions */}
            <div className="text-center py-8 text-gray-500">
              <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No other active sessions</p>
            </div>
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
                <span>Save Security Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}