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
// Design System imports
import { Button } from '@/components/design-system/core/Button';
import { TextField, EmailField } from '@/components/design-system/forms/TextField';
import { Select } from '@/components/design-system/forms/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/core/Card';
import { Alert } from '@/components/design-system/core/Alert';
import { logger } from '@/lib/logger';
import { 
  EmailPreferences, 
  EmailNotificationCategories, 
  EmailPreferencesFormData,
  DEFAULT_EMAIL_CATEGORIES,
  EMAIL_FREQUENCY_OPTIONS,
  EMAIL_CATEGORY_DESCRIPTIONS
} from '@/types/email-preferences';
import { FastLinkConnect } from '@/components/yodlee/FastLinkConnect';
import { ConnectedAccountsList } from '@/components/yodlee/ConnectedAccountsList';
import PlanManagement from '@/components/settings/PlanManagement';

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
  
  // Plan management state
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium'>('free');

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
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = useCallback(async () => {
    try {
      const response = await fetch('/api/user/plan');
      
      if (!response.ok) {
        logger.error('Failed to fetch current plan');
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
      }
    } catch (error) {
      logger.error('Error fetching current plan:', error);
    }
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

  const handlePlanChange = useCallback((newPlan: 'free' | 'premium') => {
    setCurrentPlan(newPlan);
    logger.info(`Plan changed to: ${newPlan}`);
  }, []);

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

  const exportData = async (type: 'portfolio' | 'transactions' | 'tax') => {
    try {
      setLoading(true);
      setError(null);
      
      logger.log(`Exporting ${type} data...`);
      
      // Direct API call approach - more reliable than dynamic imports
      const apiEndpoint = `/api/user/export/${type}`;
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create and trigger download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Get filename from response headers or generate one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${type}_export.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Show success message
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      logger.info(`${type} export completed successfully: ${filename}`);
      
    } catch (error: any) {
      logger.error(`Error exporting ${type} data:`, error);
      setError(`Failed to export ${type} data: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
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
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            iconOnly
            ariaLabel="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
              <Settings className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Customize your Income Clarity experience
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Button */}
          <Button
            onClick={saveSettings}
            disabled={loading}
            variant={saved ? 'success' : 'primary'}
            size="md"
            loading={loading}
            leftIcon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          >
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </Button>

          {/* Close Button */}
          <Button
            onClick={() => router.push('/dashboard/super-cards')}
            variant="ghost"
            size="sm"
            iconOnly
            ariaLabel="Close settings"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <Alert variant="error" className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Success Message */}
      {saved && (
        <Alert variant="success" className="flex items-center space-x-2">
          <Check className="w-5 h-5" />
          <span>Settings saved successfully!</span>
        </Alert>
      )}

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 text-muted-foreground mr-2" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-3">
                  Theme
                </label>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleThemeChange('light')}
                    variant={settings.theme === 'light' ? 'primary' : 'outline'}
                    size="md"
                    leftIcon={<Sun className="w-4 h-4" />}
                  >
                    Light
                  </Button>
                  <Button
                    onClick={() => handleThemeChange('dark')}
                    variant={settings.theme === 'dark' ? 'primary' : 'outline'}
                    size="md"
                    leftIcon={<Moon className="w-4 h-4" />}
                  >
                    Dark
                  </Button>
                </div>
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-foreground/90 mb-2">
                  Currency
                </label>
                <Select
                  id="currency"
                  value={settings.currency}
                  onChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                  options={[
                    { value: 'USD', label: 'USD - US Dollar' },
                    { value: 'EUR', label: 'EUR - Euro' },
                    { value: 'GBP', label: 'GBP - British Pound' },
                    { value: 'CAD', label: 'CAD - Canadian Dollar' }
                  ]}
                />
              </div>

              {/* Language */}
              <div>
                <label htmlFor="locale" className="block text-sm font-medium text-foreground/90 mb-2">
                  Language
                </label>
                <Select
                  id="locale"
                  value={settings.locale}
                  onChange={(value) => setSettings(prev => ({ ...prev, locale: value }))}
                  options={[
                    { value: 'en-US', label: 'English (US)' },
                    { value: 'en-GB', label: 'English (UK)' },
                    { value: 'es-ES', label: 'Español' },
                    { value: 'fr-FR', label: 'Français' }
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 text-muted-foreground mr-2" />
              Plan Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlanManagement 
              currentPlan={currentPlan}
              onPlanChange={handlePlanChange}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank Connections Section - Moved higher for premium feature visibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-border p-6 ring-2 ring-purple-100 dark:ring-purple-900/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <Database className="w-5 h-5 text-purple-600 mr-2" />
            Bank Connections
            <span className="ml-3 px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
              Premium
            </span>
          </h2>
          <div className="flex items-center text-sm text-purple-600 dark:text-purple-400">
            <Zap className="w-4 h-4 mr-1" />
            Auto-sync enabled
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Premium benefit callout */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
              <span className="font-medium text-purple-900 dark:text-purple-100">
                Automatic Transaction Import
              </span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Connect your bank accounts to automatically import transactions and portfolio data. 
              Save hours of manual data entry every week.
            </p>
          </div>
          
          {/* Connected Accounts List */}
          <ConnectedAccountsList />
          
          {/* FastLink Connection */}
          <FastLinkConnect 
            onSuccess={(accounts) => {
              logger.info('Successfully connected accounts:', accounts);
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
            onError={(error) => {
              logger.error('Failed to connect accounts:', error);
            }}
          />
          
          <div className="text-xs text-muted-foreground mt-4 space-y-1">
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              <span>Bank connections are secured with industry-standard encryption</span>
            </div>
            <p>Powered by Yodlee for secure financial data aggregation</p>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 text-muted-foreground mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground/90">
                      {key === 'dividendAlerts' && 'Dividend Alerts'}
                      {key === 'milestoneAlerts' && 'Milestone Achievements'}
                      {key === 'weeklyReport' && 'Weekly Reports'}
                      {key === 'priceAlerts' && 'Price Alerts'}
                    </label>
                    <p className="text-xs text-muted-foreground">
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Email Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <Mail className="w-5 h-5 text-muted-foreground mr-2" />
            Email Notifications
          </h2>
          
          <Button
            onClick={saveEmailPreferences}
            disabled={emailLoading}
            variant={emailSaved ? 'success' : 'primary'}
            size="md"
            loading={emailLoading}
            leftIcon={emailSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          >
            {emailLoading ? 'Saving...' : emailSaved ? 'Saved!' : 'Save Email Settings'}
          </Button>
        </div>

        {/* Email Error Message */}
        {emailError && (
          <Alert variant="error" className="flex items-center space-x-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{emailError}</span>
          </Alert>
        )}

        {/* Email Success Message */}
        {emailSaved && (
          <Alert variant="success" className="flex items-center space-x-2 mb-6">
            <Check className="w-5 h-5" />
            <span>Email preferences saved successfully!</span>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Email Address Configuration */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground/90 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <EmailField
                  id="email"
                  value={emailPreferences.email}
                  onChange={(e) => handleEmailPreferenceChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  rightElement={
                    emailVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : emailPreferences.email ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : null
                  }
                />
              </div>
              
              {emailPreferences.email && !emailVerified && (
                <Button
                  onClick={sendVerificationEmail}
                  disabled={sendingVerification}
                  variant="outline"
                  size="md"
                  loading={sendingVerification}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {sendingVerification ? 'Sending...' : 'Verify'}
                </Button>
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
              <label className="text-sm font-medium text-foreground/90">
                Enable Email Notifications
              </label>
              <p className="text-xs text-muted-foreground">
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
              <label className="block text-sm font-medium text-foreground/90 mb-3">
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
                        : 'border-border hover:border-slate-400 bg-white dark:bg-slate-700 text-foreground/90'
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
              <h3 className="text-sm font-medium text-foreground/90 mb-4">
                Notification Categories
              </h3>
              <div className="space-y-3">
                {Object.entries(EMAIL_CATEGORY_DESCRIPTIONS).map(([category, info]) => (
                  <div key={category} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground/90">
                        {info.title}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {info.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Test Email Button */}
                      {emailPreferences.categories[category as keyof EmailNotificationCategories] && emailVerified && (
                        <button
                          onClick={() => sendTestEmail(category as keyof EmailNotificationCategories)}
                          disabled={sendingTestEmail === category}
                          className="px-3 py-1 text-xs border border-border text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
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
            <h4 className="text-sm font-medium text-foreground/90 mb-2">
              Email Status
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Email Address: {emailPreferences.email || 'Not configured'}</p>
              <p>• Verification Status: {emailVerified ? '✅ Verified' : '❌ Not verified'}</p>
              <p>• Notifications: {emailPreferences.notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}</p>
              <p>• Frequency: {EMAIL_FREQUENCY_OPTIONS.find(f => f.value === emailPreferences.frequency)?.label}</p>
              <p>• Active Categories: {Object.values(emailPreferences.categories).filter(Boolean).length} of {Object.keys(emailPreferences.categories).length}</p>
            </div>
          </div>
        </div>
        </Card>
      </motion.div>


      {/* Data & Privacy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-border p-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
          <Shield className="w-5 h-5 text-muted-foreground mr-2" />
          Data & Privacy
        </h2>

        <div className="space-y-6">
          {/* Export Options */}
          <div>
            <h3 className="text-sm font-medium text-foreground/90 mb-3">Export Your Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => exportData('portfolio')}
                disabled={loading}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  loading 
                    ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
                    : 'border-border hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${loading ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                    Portfolio CSV
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${loading ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
              </button>
              <button
                onClick={() => exportData('transactions')}
                disabled={loading}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  loading 
                    ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
                    : 'border-border hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${loading ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                    Transactions CSV
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${loading ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
              </button>
              <button
                onClick={() => exportData('tax')}
                disabled={loading}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  loading 
                    ? 'border-slate-200 bg-slate-50 cursor-not-allowed' 
                    : 'border-border hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${loading ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                    Tax Report CSV
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${loading ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
              </button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className="text-sm font-medium text-foreground/90 mb-3">Privacy Preferences</h3>
            <div className="space-y-3">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground/90">
                      {key === 'shareData' && 'Share Anonymous Usage Data'}
                      {key === 'analytics' && 'Analytics & Performance Tracking'}
                    </label>
                    <p className="text-xs text-muted-foreground">
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
          <div className="border-t border-border pt-6">
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
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-border p-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
          <Code className="w-5 h-5 text-muted-foreground mr-2" />
          Advanced
        </h2>

        <div className="space-y-6">
          {/* API Access */}
          <div>
            <h3 className="text-sm font-medium text-foreground/90 mb-3">API Access</h3>
            <button
              onClick={() => alert('API key generation will be available soon!')}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
            >
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground/90">Generate API Key</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Feature Flags */}
          <div>
            <h3 className="text-sm font-medium text-foreground/90 mb-3">Developer Features</h3>
            <div className="space-y-3">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground/90">
                      {key === 'developerMode' && 'Developer Mode'}
                      {key === 'debugLogging' && 'Debug Logging'}
                    </label>
                    <p className="text-xs text-muted-foreground">
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
              <h3 className="text-sm font-medium text-foreground/90 mb-3">Demo Data Management</h3>
              
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
              
              <div className="mt-3 text-xs text-muted-foreground">
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
        className="text-center text-sm text-muted-foreground py-4"
      >
        <p>Settings are automatically saved to your account</p>
      </motion.div>
    </div>
  );
}