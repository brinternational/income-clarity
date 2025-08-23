'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Mail } from 'lucide-react';
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  cardName?: string;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Strategic Card Error Boundary
 * Prevents individual cards from crashing the entire app
 */
export class StrategyCardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
      errorInfo: null 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // logger.error(`❌ [${this.props.cardName || 'Strategic Card'}] Error caught by error boundary:`, {
      // error,
      // errorInfo,
      // componentStack: errorInfo.componentStack,
      // timestamp: new Date().toISOString(),
    // });

    this.setState({
      error,
      errorInfo,
    });

    // Log to Neo4j if available
    try {
      // We could integrate with our Neo4j logging system here
      const errorData = {
        type: 'component_error',
        component: this.props.cardName || 'Strategic Card',
        message: error.message,
        stack: error.stack,
        severity: 'high',
        timestamp: new Date().toISOString(),
      };

      // For now, just log to console with structured data
      // logger.log('🔍 Error logged for analysis:', errorData);
    } catch (loggingError) {
      // Error handled by emergency recovery script
    }
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <StrategyCardErrorFallback
          cardName={this.props.cardName}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          showDetails={this.props.showDetails}
          onRetry={() => {
            this.setState({
              hasError: false,
              error: null,
              errorInfo: null,
            });
          }}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default fallback UI for strategic cards when errors occur
 */
interface FallbackProps {
  cardName?: string;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails?: boolean;
  onRetry: () => void;
}

const StrategyCardErrorFallback: React.FC<FallbackProps> = ({ 
  cardName, 
  error, 
  errorInfo, 
  showDetails = false,
  onRetry 
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);

  return (
    <div className="premium-card p-4 sm:p-6 lg:p-8 border border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-1 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            {cardName ? `${cardName} Unavailable` : 'Card Error'}
          </h3>
          <p className="text-xs sm:text-sm text-red-600">
            This component encountered an error and couldn't load properly.
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
          <Bug className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
        </div>
      </div>

      {/* Error Message */}
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg border border-red-200">
          <h4 className="font-medium text-red-700 mb-2">What happened?</h4>
          <p className="text-sm text-red-600">
            {error?.message || 'An unexpected error occurred while loading this feature.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>

          {showDetails && (
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors duration-200"
            >
              <Bug className="w-4 h-4 mr-2" />
              {showTechnicalDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}

          <button
            onClick={() => {
              const subject = encodeURIComponent(`Error in ${cardName || 'Strategic Card'}`);
              const body = encodeURIComponent(
                `Error: ${error?.message || 'Unknown error'}\n\nComponent: ${cardName || 'Unknown'}\n\nStack trace and details have been logged.`
              );
              window.open(`mailto:support@example.com?subject=${subject}&body=${body}`, '_blank');
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Mail className="w-4 h-4 mr-2" />
            Report Issue
          </button>
        </div>

        {/* Technical Details (Debug Mode) */}
        {showTechnicalDetails && showDetails && error && (
          <div className="mt-4 p-4 bg-slate-100 rounded-lg border">
            <h4 className="font-medium text-foreground/90 mb-2">Technical Details</h4>
            <div className="space-y-2">
              <div>
                <strong className="text-sm text-muted-foreground">Error:</strong>
                <pre className="text-xs text-muted-foreground bg-white p-2 rounded border mt-1 overflow-auto max-h-32">
                  {error.message}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <strong className="text-sm text-muted-foreground">Stack:</strong>
                  <pre className="text-xs text-muted-foreground bg-white p-2 rounded border mt-1 overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong className="text-sm text-muted-foreground">Component Stack:</strong>
                  <pre className="text-xs text-muted-foreground bg-white p-2 rounded border mt-1 overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Guidance */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-700 mb-2">What can you do?</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Try refreshing the page or clicking "Try Again"</li>
            <li>• Check your internet connection</li>
            <li>• Clear your browser cache and reload</li>
            <li>• The rest of your dashboard should continue working normally</li>
            {cardName && (
              <li>• This issue only affects the {cardName} - other features remain functional</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Simple error boundary wrapper for strategic cards
 * Usage: <WithErrorBoundary cardName="Tax Calculator"><YourCard /></WithErrorBoundary>
 */
export const WithErrorBoundary: React.FC<{
  children: ReactNode;
  cardName?: string;
  showDetails?: boolean;
  fallback?: ReactNode;
}> = ({ children, cardName, showDetails = false, fallback }) => (
  <StrategyCardErrorBoundary 
    cardName={cardName} 
    showDetails={showDetails}
    fallback={fallback}
  >
    {children}
  </StrategyCardErrorBoundary>
);

/**
 * HOC for wrapping strategic cards with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  cardName: string,
  showDetails = false
) {
  const WrappedComponent = (props: P) => (
    <WithErrorBoundary cardName={cardName} showDetails={showDetails}>
      <Component {...props} />
    </WithErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default StrategyCardErrorBoundary;