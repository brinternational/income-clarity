'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/services/logging/logger.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error with context
    const errorLogger = logger.withContext({
      component: 'GlobalErrorBoundary',
      errorId: this.state.errorId,
      retryCount: this.retryCount,
      userId: this.getUserId(),
      url: typeof window !== 'undefined' ? window.location.href : undefined
    });

    errorLogger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
      retryAttempts: this.retryCount,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external monitoring service
    this.reportToMonitoring(error, errorInfo);
  }

  private getUserId(): string | undefined {
    // Get user ID from session/auth context
    if (typeof window !== 'undefined') {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private reportToMonitoring(error: Error, errorInfo: ErrorInfo) {
    // This would integrate with your monitoring service (Sentry, etc.)
    if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
      const errorReport = {
        type: 'react_error_boundary',
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: this.getUserId()
      };

      try {
        window.navigator.sendBeacon(
          '/api/monitoring/errors',
          JSON.stringify(errorReport)
        );
      } catch (beaconError) {
        console.error('Failed to send error report:', beaconError);
      }
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      logger.info('Retrying after error boundary catch', {
        errorId: this.state.errorId,
        retryCount: this.retryCount
      });
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      });
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  private copyErrorDetails = () => {
    if (this.state.error && typeof navigator !== 'undefined' && navigator.clipboard) {
      const errorDetails = {
        errorId: this.state.errorId,
        message: this.state.error.message,
        stack: this.state.error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
        .then(() => {
          alert('Error details copied to clipboard');
        })
        .catch(() => {
          alert('Failed to copy error details');
        });
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.retryCount < this.maxRetries;
      const isProduction = process.env.NODE_ENV === 'production';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-xl text-red-600">
                Something went wrong
              </CardTitle>
              <CardDescription>
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.state.errorId && (
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <span className="font-medium">Error ID:</span> {this.state.errorId}
                </div>
              )}

              {!isProduction && this.state.error && (
                <div className="bg-red-50 p-3 rounded text-sm">
                  <div className="font-medium text-red-700 mb-1">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </Button>
                )}

                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>

                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {this.state.error && (
                <Button 
                  onClick={this.copyErrorDetails}
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center gap-2 text-gray-500"
                >
                  <Bug className="h-4 w-4" />
                  Copy Error Details
                </Button>
              )}

              <div className="text-xs text-gray-500 text-center">
                If this problem persists, please contact support with the error ID above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundaries
export function useErrorBoundary() {
  const [, setState] = React.useState();
  
  return React.useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
}

// HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary fallback={fallback}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default GlobalErrorBoundary;