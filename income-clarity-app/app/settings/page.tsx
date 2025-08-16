'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Moon, 
  Sun, 
  Download, 
  ChevronRight, 
  Save,
  Check,
  AlertCircle,
  Globe,
  DollarSign,
  Shield,
  Code,
  UserX,
  Key,
  Bug,
  ArrowLeft,
  X,
  Mail,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Clock,
  Zap,
  Calendar,
  Archive,
  RotateCcw,
  Database
} from 'lucide-react';
import { logger } from '@/lib/logger';
import { 
  EmailPreferences, 
  EmailNotificationCategories, 
  EmailPreferencesFormData,
  DEFAULT_EMAIL_CATEGORIES,
  EMAIL_FREQUENCY_OPTIONS,
  EMAIL_CATEGORY_DESCRIPTIONS
} from '@/types/email-preferences';

interface NotificationSettings {
  dividendAlerts: boolean;
  milestoneAlerts: boolean;
  weeklyReport: boolean;
  priceAlerts: boolean;
}

interface UserSettings {
  theme: string;
  currency: string;
  locale: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
  features: {
    developerMode: boolean;
    debugLogging: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    currency: 'USD',
    locale: 'en-US',
    timezone: 'America/New_York',
    notifications: {
      dividendAlerts: true,
      milestoneAlerts: true,
      weeklyReport: false,
      priceAlerts: true
    },
    privacy: {
      shareData: false,
      analytics: true
    },
    features: {
      developerMode: false,
      debugLogging: false
    }
  });
  
  // Email preferences state
  const [emailPreferences, setEmailPreferences] = useState<EmailPreferencesFormData>({
    email: '',
    notificationsEnabled: false,
    frequency: 'daily',
    categories: DEFAULT_EMAIL_CATEGORIES
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Email-specific states
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState<string | null>(null);
  
  // Demo reset states (DEMO-008)
  const [resettingDemo, setResettingDemo] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Fetch current settings on mount and apply saved theme
  useEffect(() => {
    // Load and apply saved theme immediately
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    fetchSettings();
    fetchEmailPreferences();
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      
      if (data.settings) {
        const updatedSettings = {
          ...data.settings
        };
        
        // Sync theme with localStorage if they differ
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && savedTheme !== updatedSettings.theme) {
          updatedSettings.theme = savedTheme;
        }
        
        setSettings(prevSettings => ({
          ...prevSettings,
          ...updatedSettings
        }));
      }
    } catch (error) {
      logger.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, []);

  const fetchEmailPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/user/email-preferences');
      
      if (!response.ok) {
        throw new Error('Failed to fetch email preferences');
      }
      
      const data = await response.json();
      
      if (data.success && data.preferences) {
        setEmailPreferences({
          email: data.preferences.email || '',
          notificationsEnabled: data.preferences.notificationsEnabled,
          frequency: data.preferences.frequency,
          categories: data.preferences.categories
        });
        setEmailVerified(data.preferences.emailVerified);
      }
    } catch (error) {
      logger.error('Error fetching email preferences:', error);
      setEmailError('Failed to load email preferences');
    }
  }, []);

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSaved(false);
      
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setSaved(true);
      
      // Clear saved indicator after 3 seconds
      setTimeout(() => setSaved(false), 3000);
      
    } catch (error) {
      logger.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (theme: string) => {
    setSettings(prev => ({ ...prev, theme }));
    
    // Apply theme immediately to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('theme', theme);
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: keyof UserSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleFeatureChange = (key: keyof UserSettings['features'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }));
  };

  const saveEmailPreferences = async () => {
    try {
      setEmailLoading(true);
      setEmailError(null);
      setEmailSaved(false);
      
      const response = await fetch('/api/user/email-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPreferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save email preferences');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEmailSaved(true);
        if (data.preferences) {
          setEmailVerified(data.preferences.emailVerified);
        }
        
        // Clear saved indicator after 3 seconds
        setTimeout(() => setEmailSaved(false), 3000);
      }
      
    } catch (error) {
      logger.error('Error saving email preferences:', error);
      setEmailError('Failed to save email preferences');
    } finally {
      setEmailLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setSendingVerification(true);
      setEmailError(null);
      
      const response = await fetch('/api/user/email-preferences/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailPreferences.email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Verification email sent! Please check your inbox and click the verification link.');
      } else {
        setEmailError(data.error || 'Failed to send verification email');
      }
      
    } catch (error) {
      logger.error('Error sending verification email:', error);
      setEmailError('Failed to send verification email');
    } finally {
      setSendingVerification(false);
    }
  };

  const sendTestEmail = async (category: keyof EmailNotificationCategories) => {
    try {
      setSendingTestEmail(category);
      setEmailError(null);
      
      const response = await fetch('/api/user/email-preferences/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Test ${EMAIL_CATEGORY_DESCRIPTIONS[category].title.toLowerCase()} email sent successfully!`);
      } else {
        setEmailError(data.error || 'Failed to send test email');
      }
      
    } catch (error) {
      logger.error('Error sending test email:', error);
      setEmailError('Failed to send test email');
    } finally {
      setSendingTestEmail(null);
    }
  };

  const handleEmailPreferenceChange = (key: keyof EmailPreferencesFormData, value: any) => {
    setEmailPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEmailCategoryChange = (category: keyof EmailNotificationCategories, enabled: boolean) => {
    setEmailPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: enabled
      }
    }));
  };

  const exportData = (type: 'portfolio' | 'transactions' | 'tax') => {
    // Placeholder for export functionality
    logger.log(`Exporting ${type} data...`);
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} export will be available soon!`);
  };

  // DEMO-008: Reset demo data function
  const resetDemoData = async () => {
    if (!confirm('This will reset all demo data and create a fresh realistic portfolio. Continue?')) {
      return;
    }

    try {
      setResettingDemo(true);
      setResetError(null);
      setResetSuccess(false);

      const response = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset demo data');
      }

      setResetSuccess(true);
      
      // Show success message with details
      alert(`Demo data reset successfully!\n\n${data.data.features.join('\n')}\n\nYou can now explore the app with realistic portfolio data.`);

      // Clear success indicator after 5 seconds
      setTimeout(() => setResetSuccess(false), 5000);
      
      // Optionally refresh the page to show new data
      if (confirm('Would you like to refresh the page to see the new demo data?')) {
        window.location.reload();
      }

    } catch (error: any) {
      logger.error('Demo reset error:', error);
      setResetError(error.message || 'Failed to reset demo data');
    } finally {
      setResettingDemo(false);
    }
  };

  if (isInitialLoad && loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header with Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
              <Settings className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Customize your Income Clarity experience
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Button */}
          <motion.button
            onClick={saveSettings}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              saved 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </motion.button>

          {/* Close Button */}
          <button
            onClick={() => router.push('/dashboard/super-cards')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </motion.div>
      )}

      {/* Success Message */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2"
        >
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Settings saved successfully!</span>
        </motion.div>
      )}

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Globe className="w-5 h-5 text-slate-600 mr-2" />
          Appearance
        </h2>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Theme
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  settings.theme === 'light'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={settings.currency}
              onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Language
            </label>
            <select
              id="locale"
              value={settings.locale}
              onChange={(e) => setSettings(prev => ({ ...prev, locale: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Español</option>
              <option value="fr-FR">Français</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Bell className="w-5 h-5 text-slate-600 mr-2" />
          Notifications
        </h2>

        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {key === 'dividendAlerts' && 'Dividend Alerts'}
                  {key === 'milestoneAlerts' && 'Milestone Achievements'}
                  {key === 'weeklyReport' && 'Weekly Reports'}
                  {key === 'priceAlerts' && 'Price Alerts'}
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {key === 'dividendAlerts' && 'Get notified when dividends are paid'}
                  {key === 'milestoneAlerts' && 'Celebrate when you reach expense milestones'}
                  {key === 'weeklyReport' && 'Weekly portfolio performance summary'}
                  {key === 'priceAlerts' && 'Alert when holdings move significantly'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange(key as keyof NotificationSettings, !value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Email Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
            <Mail className="w-5 h-5 text-slate-600 mr-2" />
            Email Notifications
          </h2>
          
          <motion.button
            onClick={saveEmailPreferences}
            disabled={emailLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              emailSaved 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {emailLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : emailSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Email Settings</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Email Error Message */}
        {emailError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 mb-6"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{emailError}</span>
          </motion.div>
        )}

        {/* Email Success Message */}
        {emailSaved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 mb-6"
          >
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Email preferences saved successfully!</span>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Email Address Configuration */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  id="email"
                  value={emailPreferences.email}
                  onChange={(e) => handleEmailPreferenceChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {emailVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : emailPreferences.email ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              
              {emailPreferences.email && !emailVerified && (
                <button
                  onClick={sendVerificationEmail}
                  disabled={sendingVerification}
                  className="flex items-center space-x-2 px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  {sendingVerification ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{sendingVerification ? 'Sending...' : 'Verify'}</span>
                </button>
              )}
            </div>
            {!emailVerified && emailPreferences.email && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Please verify your email address to receive notifications
              </p>
            )}
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Enable Email Notifications
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Master switch for all email notifications
              </p>
            </div>
            <button
              onClick={() => handleEmailPreferenceChange('notificationsEnabled', !emailPreferences.notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailPreferences.notificationsEnabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailPreferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notification Frequency */}
          {emailPreferences.notificationsEnabled && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Notification Frequency
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EMAIL_FREQUENCY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleEmailPreferenceChange('frequency', option.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      emailPreferences.frequency === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {option.value === 'immediate' && <Zap className="w-4 h-4" />}
                      {option.value === 'daily' && <Clock className="w-4 h-4" />}
                      {option.value === 'weekly' && <Calendar className="w-4 h-4" />}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-xs opacity-75">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notification Categories */}
          {emailPreferences.notificationsEnabled && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                Notification Categories
              </h3>
              <div className="space-y-3">
                {Object.entries(EMAIL_CATEGORY_DESCRIPTIONS).map(([category, info]) => (
                  <div key={category} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {info.title}
                      </label>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {info.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Test Email Button */}
                      {emailPreferences.categories[category as keyof EmailNotificationCategories] && emailVerified && (
                        <button
                          onClick={() => sendTestEmail(category as keyof EmailNotificationCategories)}
                          disabled={sendingTestEmail === category}
                          className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                        >
                          {sendingTestEmail === category ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Test'
                          )}
                        </button>
                      )}
                      
                      {/* Category Toggle */}
                      <button
                        onClick={() => handleEmailCategoryChange(
                          category as keyof EmailNotificationCategories, 
                          !emailPreferences.categories[category as keyof EmailNotificationCategories]
                        )}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          emailPreferences.categories[category as keyof EmailNotificationCategories] 
                            ? 'bg-primary-600' 
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailPreferences.categories[category as keyof EmailNotificationCategories] 
                              ? 'translate-x-6' 
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Status Information */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Status
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>• Email Address: {emailPreferences.email || 'Not configured'}</p>
              <p>• Verification Status: {emailVerified ? '✅ Verified' : '❌ Not verified'}</p>
              <p>• Notifications: {emailPreferences.notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
              <p>• Frequency: {EMAIL_FREQUENCY_OPTIONS.find(f => f.value === emailPreferences.frequency)?.label}</p>
              <p>• Active Categories: {Object.values(emailPreferences.categories).filter(Boolean).length} of {Object.keys(emailPreferences.categories).length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data & Privacy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Shield className="w-5 h-5 text-slate-600 mr-2" />
          Data & Privacy
        </h2>

        <div className="space-y-6">
          {/* Export Options */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Export Your Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => exportData('portfolio')}
                className="flex items-center justify-between p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Portfolio CSV</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => exportData('transactions')}
                className="flex items-center justify-between p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Transactions CSV</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => exportData('tax')}
                className="flex items-center justify-between p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Tax Report PDF</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Privacy Preferences</h3>
            <div className="space-y-3">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {key === 'shareData' && 'Share Anonymous Usage Data'}
                      {key === 'analytics' && 'Analytics & Performance Tracking'}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {key === 'shareData' && 'Help improve the app with anonymous usage statistics'}
                      {key === 'analytics' && 'Track performance metrics for optimization'}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrivacyChange(key as keyof UserSettings['privacy'], !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-medium text-red-700 dark:text-red-400 mb-3">Danger Zone</h3>
            <button
              onClick={() => alert('Account deletion feature will be available soon. Please contact support if needed.')}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <UserX className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Advanced Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Code className="w-5 h-5 text-slate-600 mr-2" />
          Advanced
        </h2>

        <div className="space-y-6">
          {/* API Access */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">API Access</h3>
            <button
              onClick={() => alert('API key generation will be available soon!')}
              className="flex items-center justify-between p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Generate API Key</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Feature Flags */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Developer Features</h3>
            <div className="space-y-3">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {key === 'developerMode' && 'Developer Mode'}
                      {key === 'debugLogging' && 'Debug Logging'}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {key === 'developerMode' && 'Show advanced developer tools and features'}
                      {key === 'debugLogging' && 'Enable detailed logging for troubleshooting'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFeatureChange(key as keyof UserSettings['features'], !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Reset Section - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Demo Data Management</h3>
              
              {/* Reset Error Message */}
              {resetError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 mb-4"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{resetError}</span>
                </motion.div>
              )}

              {/* Reset Success Message */}
              {resetSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2 mb-4"
                >
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">Demo data reset successfully!</span>
                </motion.div>
              )}

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Reset Demo Portfolio Data
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-4">
                      This will clear all existing data and create a fresh realistic demo portfolio with:
                      • 10 dividend stocks across 5 sectors • 2-year purchase history • 12 months of dividend payments
                      • Mix of profitable and losing positions • FIRE progress tracking • Comprehensive transactions
                    </p>
                    <motion.button
                      onClick={resetDemoData}
                      disabled={resettingDemo}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        resettingDemo 
                          ? 'bg-amber-300 text-amber-800 cursor-not-allowed' 
                          : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg'
                      }`}
                      whileHover={!resettingDemo ? { scale: 1.02 } : {}}
                      whileTap={!resettingDemo ? { scale: 0.98 } : {}}
                    >
                      {resettingDemo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Resetting Demo Data...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>Reset Demo Data</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                <p><strong>Note:</strong> This feature is only available in development mode for security.</p>
                <p>User: test@example.com • Environment: {process.env.NODE_ENV}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-slate-500 dark:text-slate-400 py-4"
      >
        <p>Settings are automatically saved to your account</p>
      </motion.div>
    </div>
  );
}