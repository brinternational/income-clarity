'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/core/Card';
import { Button } from '@/components/design-system/core/Button';
import { Badge } from '@/components/design-system/core/Badge';
import { 
  Building2, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  RefreshCw, 
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Logger } from '@/lib/logger';

const logger = new Logger('ConnectedAccountsList');

interface Account {
  id: string;
  accountName: string;
  accountType: string;
  accountNumber?: string;
  balance: number;
  currency: string;
  institution?: string;
  lastRefreshed: string;
  isActive: boolean;
}

export function ConnectedAccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingAccount, setRefreshingAccount] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/yodlee/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      logger.error('Failed to fetch accounts', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccount = async (accountId: string) => {
    setRefreshingAccount(accountId);
    try {
      const response = await fetch(`/api/yodlee/accounts/${accountId}/refresh`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Wait a bit then refresh the list
        setTimeout(() => {
          fetchAccounts();
          setRefreshingAccount(null);
        }, 3000);
      }
    } catch (error) {
      logger.error('Failed to refresh account', error);
      setRefreshingAccount(null);
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    
    try {
      const response = await fetch(`/api/yodlee/accounts/${accountId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAccounts(accounts.filter(a => a.id !== accountId));
      }
    } catch (error) {
      logger.error('Failed to delete account', error);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CHECKING':
      case 'SAVINGS':
        return <Building2 className="h-5 w-5" />;
      case 'CREDIT_CARD':
        return <CreditCard className="h-5 w-5" />;
      case 'INVESTMENT':
      case 'BROKERAGE':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <PiggyBank className="h-5 w-5" />;
    }
  };

  const getAccountTypeBadge = (type: string) => {
    const variantMap: Record<string, 'info' | 'success' | 'warning' | 'secondary' | 'default'> = {
      CHECKING: 'info',
      SAVINGS: 'success',
      CREDIT_CARD: 'warning',
      INVESTMENT: 'secondary',
      BROKERAGE: 'secondary',
    };
    
    return (
      <Badge variant={variantMap[type.toUpperCase()] || 'default'} size="sm">
        {type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-600 dark:text-slate-400" />
            <span className="ml-2 text-slate-600 dark:text-slate-400">Loading accounts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connected Accounts</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} linked
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAccounts()}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                  {getAccountIcon(account.accountType)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{account.accountName}</p>
                    {getAccountTypeBadge(account.accountType)}
                    {account.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    {account.institution && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {account.institution}
                      </p>
                    )}
                    {account.accountNumber && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        ••••{account.accountNumber}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Updated {new Date(account.lastRefreshed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                    ${account.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    {account.currency}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshAccount(account.id)}
                    disabled={refreshingAccount === account.id}
                    iconOnly
                    ariaLabel="Refresh account"
                  >
                    <RefreshCw 
                      className={`h-4 w-4 ${
                        refreshingAccount === account.id ? 'animate-spin' : ''
                      }`} 
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAccount(account.id)}
                    iconOnly
                    ariaLabel="Delete account"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Balance</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              ${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}