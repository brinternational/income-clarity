'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryAttempts = 0;
  private readonly maxRetries = 3;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      // console.error('Error:', error);
      // console.error('Error Info:', errorInfo);
      // console.error('Component Stack:', errorInfo.componentStack);
      // console.groupEnd();
    }

    // Report error to monitoring service
    this.reportError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Send error report to API
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userId: localStorage.getItem('userId') || 'anonymous'
        })
      });
    } catch (reportingError) {
      // Error handled by emergency recovery script;

  private handleRetry = () => {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReport = () => {
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Additional details:
${this.state.error?.stack}
    `);
    
    window.open(`mailto:support@incomeclarity.com?subject=${subject}&body=${body}`);
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg 
                  className="h-8 w-8 text-red-600 dark:text-red-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We encountered an unexpected error. Don't worry, we've been notified and are working on a fix.
              </p>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 bg-gray-50 dark:bg-gray-700 rounded p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technical Details
                  </summary>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <br />
                        {this.state.error.stack}
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.retryAttempts < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    🔄 Try Again
                  </button>
                )}

                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  🔃 Reload Page
                </button>

                <button
                  onClick={this.handleReport}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  📧 Report Issue
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                <p>Error ID: {this.state.errorId}</p>
                <p className="mt-1">
                  If this problem persists, please{' '}
                  <a 
                    href="mailto:support@incomeclarity.com" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    contact support
                  </a>{' '}
                  with the error ID above.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}