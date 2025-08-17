'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logging/logger.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, Settings, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
  userId?: string;
  onSyncRetry?: () => Promise<void>;
  onManualSync?: () => Promise<void>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
  retryCount: number;
  lastSyncAttempt: Date | null;
}

export class SyncErrorBoundary extends Component<Props, State> {
  private maxRetries: number = 2;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0,
      lastSyncAttempt: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
      lastSyncAttempt: new Date()
    });

    // Log sync-specific error with detailed context
    const syncLogger = logger.withContext({
      component: 'SyncErrorBoundary',
      userId: this.props.userId,
      syncOperation: this.getSyncOperation(error),
      retryCount: this.state.retryCount
    });

    syncLogger.error('Sync operation failed', error, {
      componentStack: errorInfo.componentStack,
      errorType: this.categorizeError(error),
      syncContext: this.getSyncContext(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });

    // Auto-retry for certain types of errors
    if (this.shouldAutoRetry(error)) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    // Clean up any pending retries
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private getSyncOperation(error: Error): string {
    const message = error.message.toLowerCase();
    if (message.includes('yodlee')) return 'yodlee_sync';
    if (message.includes('portfolio')) return 'portfolio_sync';
    if (message.includes('transaction')) return 'transaction_sync';
    if (message.includes('account')) return 'account_sync';
    return 'unknown_sync';
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Network-related errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'NETWORK_ERROR';
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('token') || message.includes('auth')) {
      return 'AUTH_ERROR';
    }

    // Rate limiting errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'RATE_LIMIT_ERROR';
    }

    // Yodlee-specific errors
    if (message.includes('yodlee') || stack.includes('yodlee')) {
      return 'YODLEE_API_ERROR';
    }

    // Database errors
    if (message.includes('database') || stack.includes('prisma') || stack.includes('sqlite')) {
      return 'DATABASE_ERROR';
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  private getSyncContext(): Record<string, any> {
    return {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
      syncEnabled: true, // Could check actual sync settings
      lastSuccessfulSync: this.getLastSuccessfulSync()
    };
  }

  private getLastSuccessfulSync(): string | null {
    // This would check your sync status from the database/localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastSuccessfulSync');
    }
    return null;
  }

  private shouldAutoRetry(error: Error): boolean {
    const errorType = this.categorizeError(error);
    const retryableErrors = ['NETWORK_ERROR', 'RATE_LIMIT_ERROR', 'YODLEE_API_ERROR'];
    
    return (
      retryableErrors.includes(errorType) &&
      this.state.retryCount < this.maxRetries
    );
  }

  private scheduleRetry() {
    if (this.state.retryCount >= this.maxRetries) return;

    const delay = Math.pow(2, this.state.retryCount) * 1000; // Exponential backoff
    
    const timeout = setTimeout(() => {
      this.handleAutoRetry();
    }, delay);

    this.retryTimeouts.push(timeout);
  }

  private handleAutoRetry = async () => {
    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1 
    });

    try {
      // Clear the error state to retry rendering
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      });

      logger.info('Auto-retrying sync operation', {
        component: 'SyncErrorBoundary',
        retryCount: this.state.retryCount,
        userId: this.props.userId
      });

    } catch (retryError) {
      logger.error('Auto-retry failed', retryError as Error, {
        component: 'SyncErrorBoundary',
        originalError: this.state.error?.message
      });
      
      this.setState({ isRetrying: false });
    }
  };

  private handleManualRetry = async () => {
    this.setState({ isRetrying: true });

    try {
      if (this.props.onSyncRetry) {
        await this.props.onSyncRetry();
      }

      // Clear error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
        retryCount: 0
      });

      logger.info('Manual sync retry initiated', {
        component: 'SyncErrorBoundary',
        userId: this.props.userId
      });

    } catch (retryError) {
      logger.error('Manual sync retry failed', retryError as Error);
      this.setState({ isRetrying: false });
    }
  };

  private handleManualSync = async () => {
    this.setState({ isRetrying: true });

    try {
      if (this.props.onManualSync) {
        await this.props.onManualSync();
      }

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
        retryCount: 0
      });

    } catch (syncError) {
      logger.error('Manual sync failed', syncError as Error);
      this.setState({ isRetrying: false });
    }
  };

  private getErrorMessage(): string {
    if (!this.state.error) return 'Unknown sync error occurred';

    const errorType = this.categorizeError(this.state.error);
    
    switch (errorType) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to sync service. Please check your internet connection.';
      case 'AUTH_ERROR':
        return 'Authentication failed. You may need to reconnect your accounts.';
      case 'RATE_LIMIT_ERROR':
        return 'Too many sync requests. Please wait a moment before trying again.';
      case 'YODLEE_API_ERROR':
        return 'There was an issue with the financial data provider. This usually resolves itself quickly.';
      case 'DATABASE_ERROR':
        return 'Unable to save sync data. Please try again in a moment.';
      case 'VALIDATION_ERROR':
        return 'Invalid data received during sync. Please contact support if this persists.';
      default:
        return 'An unexpected error occurred during sync. Please try again.';
    }
  }

  private getRecoveryActions() {
    const errorType = this.state.error ? this.categorizeError(this.state.error) : '';
    
    const actions = [];

    if (errorType === 'AUTH_ERROR') {
      actions.push({
        label: 'Reconnect Accounts',
        action: () => window.location.href = '/settings/accounts',
        icon: <Settings className="h-4 w-4" />,
        variant: 'default' as const
      });
    }

    if (errorType === 'YODLEE_API_ERROR') {
      actions.push({
        label: 'Check Service Status',
        action: () => window.open('https://status.yodlee.com', '_blank'),
        icon: <ExternalLink className="h-4 w-4" />,
        variant: 'outline' as const
      });
    }

    // Always offer manual retry
    actions.push({
      label: this.state.isRetrying ? 'Retrying...' : 'Try Again',
      action: this.handleManualRetry,
      icon: <RefreshCw className={`h-4 w-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />,
      variant: 'default' as const,
      disabled: this.state.isRetrying
    });

    return actions;
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();
      const recoveryActions = this.getRecoveryActions();
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sync Error: {errorMessage}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sync Temporarily Unavailable</CardTitle>
              <CardDescription>
                We're having trouble syncing your financial data. Here are some ways to resolve this:
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.state.retryCount > 0 && (
                <div className="bg-blue-50 p-3 rounded text-sm">
                  Attempted {this.state.retryCount} automatic {this.state.retryCount === 1 ? 'retry' : 'retries'}.
                  {canRetry && ' Will retry automatically in a moment.'}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {recoveryActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.action}
                    variant={action.variant}
                    disabled={action.disabled}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>

              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <details className="bg-gray-50 p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium">Technical Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}

              <div className="text-xs text-gray-500">
                Last sync attempt: {this.state.lastSyncAttempt?.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SyncErrorBoundary;