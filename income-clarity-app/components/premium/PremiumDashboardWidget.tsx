'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureAccess } from './FeatureGate';

interface SyncStatistics {
  totalAccounts: number;
  lastSyncTime: string;
  successRate: number;
  totalTransactions: number;
  syncFrequency: 'daily' | 'weekly' | 'manual';
  nextScheduledSync?: string;
  dataFreshness: number; // hours since last sync
}

interface UsageMetrics {
  portfoliosCreated: number;
  portfolioLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  reportsGenerated: number;
  reportsLimit: number;
  storageUsed: number; // MB
  storageLimit: number; // MB
}

interface SubscriptionInfo {
  plan: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  daysRemaining: number;
  isTrialPeriod: boolean;
  trialDaysRemaining?: number;
}

// Mock data - replace with actual API calls
const mockSyncStats: SyncStatistics = {
  totalAccounts: 3,
  lastSyncTime: '2024-01-15T10:30:00Z',
  successRate: 95.5,
  totalTransactions: 1247,
  syncFrequency: 'daily',
  nextScheduledSync: '2024-01-16T09:00:00Z',
  dataFreshness: 2
};

const mockUsageMetrics: UsageMetrics = {
  portfoliosCreated: 5,
  portfolioLimit: -1, // -1 means unlimited
  apiCallsUsed: 1250,
  apiCallsLimit: 10000,
  reportsGenerated: 8,
  reportsLimit: 50,
  storageUsed: 45.2,
  storageLimit: 1000
};

const mockSubscription: SubscriptionInfo = {
  plan: 'PREMIUM',
  status: 'trialing',
  currentPeriodEnd: '2024-01-29T23:59:59Z',
  daysRemaining: 14,
  isTrialPeriod: true,
  trialDaysRemaining: 12
};

export function PremiumDashboardWidget() {
  const { isPremium, isEnterprise, isFreeTier } = useFeatureAccess();
  const [syncStats, setSyncStats] = useState<SyncStatistics>(mockSyncStats);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>(mockUsageMetrics);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(mockSubscription);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (hours: number) => {
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${Math.floor(hours)} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const getUsageColor = (used: number, limit: number) => {
    if (limit === -1) return 'text-green-600 dark:text-green-400'; // Unlimited
    const percentage = (used / limit) * 100;
    if (percentage > 90) return 'text-red-600 dark:text-red-400';
    if (percentage > 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusBadge = (status: SubscriptionInfo['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    
    return badges[status];
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      // TODO: Trigger manual sync API call
      console.log('Starting manual sync...');
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update sync stats
      setSyncStats(prev => ({
        ...prev,
        lastSyncTime: new Date().toISOString(),
        dataFreshness: 0
      }));
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleManageBanks = () => {
    // Navigate to bank settings
    console.log('Opening bank management...');
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  if (isFreeTier) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💎</span>
            Premium Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Unlock Premium Features
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              Get bank sync, real-time data, and advanced analytics
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: '🏦', label: 'Bank Sync' },
                { icon: '📈', label: 'Real-time Data' },
                { icon: '📊', label: 'Advanced Analytics' },
                { icon: '📧', label: 'Email Reports' }
              ].map((feature, index) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-xl mb-1">{feature.icon}</div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {feature.label}
                  </div>
                </div>
              ))}
            </div>
            
            <Button onClick={handleUpgrade} className="w-full">
              Start Free Trial
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              14 days free • No credit card required
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>💎</span>
            Premium Status
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
              {subscription.isTrialPeriod ? 'Trial' : subscription.plan}
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '−' : '+'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Trial/Subscription Warning */}
          {subscription.isTrialPeriod && subscription.trialDaysRemaining !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-600 dark:text-blue-400">⏰</span>
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    Trial ends in {subscription.trialDaysRemaining} days
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Upgrade now to keep premium features
                  </div>
                </div>
              </div>
              <Button
                onClick={handleUpgrade}
                variant="outline"
                size="sm"
                className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/40"
              >
                Upgrade Now
              </Button>
            </motion.div>
          )}

          {/* Sync Status */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Bank Sync Status
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleManualSync}
                  variant="outline"
                  size="sm"
                  disabled={isManualSyncing}
                >
                  <span className={`mr-1 ${isManualSyncing ? 'animate-spin' : ''}`}>
                    🔄
                  </span>
                  {isManualSyncing ? 'Syncing...' : 'Sync'}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {syncStats.totalAccounts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Connected Accounts
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {syncStats.successRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Success Rate
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Last synced: {formatRelativeTime(syncStats.dataFreshness)}
              {syncStats.nextScheduledSync && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Next sync: {formatDate(syncStats.nextScheduledSync)}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleManageBanks}
                variant="outline"
                size="sm"
                className="justify-start"
              >
                🏦 Manage Banks
              </Button>
              <Button
                onClick={() => window.location.href = '/settings/billing'}
                variant="outline"
                size="sm"
                className="justify-start"
              >
                💳 Billing
              </Button>
            </div>
          </div>

          {/* Detailed Metrics (Expandable) */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 border-t border-gray-200 dark:border-gray-600 space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Usage Metrics
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Portfolios */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Portfolios
                      </span>
                      <span className={`text-sm font-medium ${getUsageColor(usageMetrics.portfoliosCreated, usageMetrics.portfolioLimit)}`}>
                        {usageMetrics.portfoliosCreated}
                        {usageMetrics.portfolioLimit > 0 ? ` / ${usageMetrics.portfolioLimit}` : ' (Unlimited)'}
                      </span>
                    </div>
                    
                    {/* API Calls */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        API Calls
                      </span>
                      <span className={`text-sm font-medium ${getUsageColor(usageMetrics.apiCallsUsed, usageMetrics.apiCallsLimit)}`}>
                        {usageMetrics.apiCallsUsed.toLocaleString()} / {usageMetrics.apiCallsLimit.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Reports */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Reports Generated
                      </span>
                      <span className={`text-sm font-medium ${getUsageColor(usageMetrics.reportsGenerated, usageMetrics.reportsLimit)}`}>
                        {usageMetrics.reportsGenerated} / {usageMetrics.reportsLimit}
                      </span>
                    </div>
                    
                    {/* Storage */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Storage Used
                      </span>
                      <span className={`text-sm font-medium ${getUsageColor(usageMetrics.storageUsed, usageMetrics.storageLimit)}`}>
                        {usageMetrics.storageUsed} MB / {usageMetrics.storageLimit} MB
                      </span>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Subscription Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Plan</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {subscription.plan}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">
                          {subscription.isTrialPeriod ? 'Trial ends' : 'Renews'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDate(subscription.currentPeriodEnd)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

export default PremiumDashboardWidget;