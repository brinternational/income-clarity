'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureAccess } from './FeatureGate';

interface BankAccount {
  id: string;
  providerAccountId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  lastSynced: string;
  status: 'connected' | 'error' | 'syncing' | 'disconnected';
  syncSettings: {
    autoSync: boolean;
    frequency: 'daily' | 'weekly' | 'manual';
    includeTransactions: boolean;
    includeBalances: boolean;
  };
  errorMessage?: string;
}

interface SyncStatus {
  isRunning: boolean;
  progress: number;
  currentAccount?: string;
  lastSync?: string;
  totalAccounts: number;
  completedAccounts: number;
}

// Mock data - replace with actual API calls
const mockBankAccounts: BankAccount[] = [
  {
    id: 'acc_1',
    providerAccountId: 'yodlee_12345',
    accountName: 'Primary Checking',
    accountNumber: '****1234',
    bankName: 'Chase Bank',
    accountType: 'checking',
    balance: 12500.50,
    lastSynced: '2024-01-15T10:30:00Z',
    status: 'connected',
    syncSettings: {
      autoSync: true,
      frequency: 'daily',
      includeTransactions: true,
      includeBalances: true
    }
  },
  {
    id: 'acc_2',
    providerAccountId: 'yodlee_67890',
    accountName: 'Investment Account',
    accountNumber: '****5678',
    bankName: 'Fidelity Investments',
    accountType: 'investment',
    balance: 145000.00,
    lastSynced: '2024-01-15T08:15:00Z',
    status: 'connected',
    syncSettings: {
      autoSync: true,
      frequency: 'daily',
      includeTransactions: true,
      includeBalances: true
    }
  },
  {
    id: 'acc_3',
    providerAccountId: 'yodlee_24680',
    accountName: 'Savings Account',
    accountNumber: '****9012',
    bankName: 'Bank of America',
    accountType: 'savings',
    balance: 25000.00,
    lastSynced: '2024-01-14T15:45:00Z',
    status: 'error',
    syncSettings: {
      autoSync: false,
      frequency: 'manual',
      includeTransactions: true,
      includeBalances: true
    },
    errorMessage: 'Login credentials need to be updated'
  }
];

export function BankConnectionSettings() {
  const { hasFeature, isPremium } = useFeatureAccess();
  const [accounts, setAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    progress: 0,
    totalAccounts: 0,
    completedAccounts: 0
  });
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [loading, setLoading] = useState(false);

  const canAccessBankSync = hasFeature('BANK_SYNC');

  useEffect(() => {
    // Simulate real-time sync progress updates
    if (syncStatus.isRunning) {
      const interval = setInterval(() => {
        setSyncStatus(prev => {
          if (prev.progress >= 100) {
            clearInterval(interval);
            return {
              ...prev,
              isRunning: false,
              progress: 100,
              completedAccounts: prev.totalAccounts,
              lastSync: new Date().toISOString()
            };
          }
          return {
            ...prev,
            progress: Math.min(prev.progress + 10, 100),
            completedAccounts: Math.floor((prev.progress + 10) / 100 * prev.totalAccounts)
          };
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [syncStatus.isRunning]);

  const handleAddAccount = async () => {
    if (!canAccessBankSync) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrate with Yodlee FastLink
      console.log('Opening Yodlee FastLink...');
      
      // Simulate FastLink flow
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add new mock account
      const newAccount: BankAccount = {
        id: `acc_${Date.now()}`,
        providerAccountId: `yodlee_${Date.now()}`,
        accountName: 'New Account',
        accountNumber: '****0000',
        bankName: 'Wells Fargo',
        accountType: 'checking',
        balance: 5000.00,
        lastSynced: new Date().toISOString(),
        status: 'connected',
        syncSettings: {
          autoSync: true,
          frequency: 'daily',
          includeTransactions: true,
          includeBalances: true
        }
      };
      
      setAccounts(prev => [...prev, newAccount]);
      setShowAddAccount(false);
    } catch (error) {
      console.error('Failed to add account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    setLoading(true);
    try {
      // TODO: API call to disconnect account
      console.log('Disconnecting account:', accountId);
      
      setAccounts(prev => 
        prev.map(acc => 
          acc.id === accountId 
            ? { ...acc, status: 'disconnected' as const }
            : acc
        )
      );
    } catch (error) {
      console.error('Failed to disconnect account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReconnectAccount = async (accountId: string) => {
    setLoading(true);
    try {
      // TODO: API call to reconnect account
      console.log('Reconnecting account:', accountId);
      
      setAccounts(prev => 
        prev.map(acc => 
          acc.id === accountId 
            ? { 
                ...acc, 
                status: 'connected' as const, 
                lastSynced: new Date().toISOString(),
                errorMessage: undefined
              }
            : acc
        )
      );
    } catch (error) {
      console.error('Failed to reconnect account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async (accountId?: string) => {
    if (!canAccessBankSync) {
      return;
    }

    const accountsToSync = accountId 
      ? accounts.filter(acc => acc.id === accountId)
      : accounts.filter(acc => acc.status === 'connected');

    setSyncStatus({
      isRunning: true,
      progress: 0,
      totalAccounts: accountsToSync.length,
      completedAccounts: 0,
      currentAccount: accountsToSync[0]?.accountName
    });

    // Update last synced times after completion
    setTimeout(() => {
      setAccounts(prev => 
        prev.map(acc => 
          accountsToSync.some(syncAcc => syncAcc.id === acc.id)
            ? { ...acc, lastSynced: new Date().toISOString() }
            : acc
        )
      );
    }, accountsToSync.length * 500 + 1000);
  };

  const handleUpdateSyncSettings = async (
    accountId: string, 
    settings: Partial<BankAccount['syncSettings']>
  ) => {
    try {
      // TODO: API call to update sync settings
      console.log('Updating sync settings:', accountId, settings);
      
      setAccounts(prev => 
        prev.map(acc => 
          acc.id === accountId 
            ? { ...acc, syncSettings: { ...acc.syncSettings, ...settings } }
            : acc
        )
      );
    } catch (error) {
      console.error('Failed to update sync settings:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: BankAccount['status']) => {
    const badges = {
      connected: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      syncing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };
    
    return badges[status];
  };

  const getAccountTypeIcon = (type: BankAccount['accountType']) => {
    const icons = {
      checking: '🏦',
      savings: '💰',
      investment: '📈',
      credit: '💳'
    };
    
    return icons[type];
  };

  if (!canAccessBankSync) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Bank Sync Requires Premium
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your bank accounts and automatically sync transactions with a Premium subscription.
          </p>
          <Button onClick={() => window.location.href = '/pricing'}>
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      {syncStatus.isRunning && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin text-blue-600">⚪</div>
              <div className="flex-1">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Syncing {syncStatus.currentAccount}...
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {syncStatus.completedAccounts} of {syncStatus.totalAccounts} accounts completed
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${syncStatus.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Connected Accounts</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Manage your connected bank and investment accounts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleManualSync()}
                variant="outline"
                disabled={loading || syncStatus.isRunning}
                className="flex items-center gap-2"
              >
                <span className={syncStatus.isRunning ? 'animate-spin' : ''}>🔄</span>
                Sync All
              </Button>
              <Button
                onClick={() => setShowAddAccount(true)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <span>+</span>
                Add Account
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {accounts.length > 0 && (
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  layout
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {getAccountTypeIcon(account.accountType)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {account.accountName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {account.bankName} • {account.accountNumber}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(account.status)}`}>
                            {account.status}
                          </span>
                          {account.status === 'connected' && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Last synced: {formatDate(account.lastSynced)}
                            </span>
                          )}
                        </div>
                        {account.errorMessage && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {account.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(account.balance)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {account.status === 'connected' && (
                          <>
                            <Button
                              onClick={() => handleManualSync(account.id)}
                              variant="ghost"
                              size="sm"
                              disabled={loading || syncStatus.isRunning}
                            >
                              Sync
                            </Button>
                            <Button
                              onClick={() => handleDisconnectAccount(account.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              disabled={loading}
                            >
                              Disconnect
                            </Button>
                          </>
                        )}
                        {account.status === 'error' && (
                          <Button
                            onClick={() => handleReconnectAccount(account.id)}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                          >
                            Reconnect
                          </Button>
                        )}
                        {account.status === 'disconnected' && (
                          <Button
                            onClick={() => handleReconnectAccount(account.id)}
                            variant="default"
                            size="sm"
                            disabled={loading}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Sync Settings */}
                  {account.status === 'connected' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={account.syncSettings.autoSync}
                              onChange={(e) => 
                                handleUpdateSyncSettings(account.id, { autoSync: e.target.checked })
                              }
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Auto-sync
                            </span>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Frequency
                          </label>
                          <select
                            value={account.syncSettings.frequency}
                            onChange={(e) => 
                              handleUpdateSyncSettings(account.id, { 
                                frequency: e.target.value as 'daily' | 'weekly' | 'manual' 
                              })
                            }
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="manual">Manual</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={account.syncSettings.includeTransactions}
                              onChange={(e) => 
                                handleUpdateSyncSettings(account.id, { 
                                  includeTransactions: e.target.checked 
                                })
                              }
                              className="rounded"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              Transactions
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={account.syncSettings.includeBalances}
                              onChange={(e) => 
                                handleUpdateSyncSettings(account.id, { 
                                  includeBalances: e.target.checked 
                                })
                              }
                              className="rounded"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              Balances
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏦</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Connected Accounts
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Connect your bank and investment accounts to automatically sync your portfolio data.
            </p>
            <Button onClick={() => setShowAddAccount(true)}>
              Connect First Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddAccount(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🏦</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Add Bank Account
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Connect securely through our banking partner Yodlee. Your credentials are encrypted and never stored.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">🔒</span>
                    <span>Bank-level security</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">✓</span>
                    <span>Read-only access</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-500">🏆</span>
                    <span>Trusted by major banks</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowAddAccount(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAccount}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Connecting...' : 'Connect Account'}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  By connecting, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BankConnectionSettings;