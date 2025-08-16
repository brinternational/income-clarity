'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, Wifi, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class ConnectivityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error 
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error for debugging
    // console.error('ConnectivityErrorBoundary caught an error:', error, errorInfo)
    // this.setState({ errorInfo })

    // Check if it's a connectivity-related error
    const isConnectivityError = 
      error.message.includes('ERR_BLOCKED_BY_CLIENT') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('fetch') ||
      error.message.includes('localhost') ||
      error.message.includes('connection')

    if (isConnectivityError) {
      // console.warn('🌐 Connectivity error detected, showing user-friendly fallback')
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    // Force a page refresh to retry
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default connectivity error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Wifi className="w-16 h-16 text-red-500" />
                <AlertTriangle className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Connection Issue
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're having trouble connecting to our services. This might be a temporary issue.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Don't worry!</strong> Your data is safe. The app is running in offline mode 
                and your information is being saved locally.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                If the problem persists, try refreshing the page or check your internet connection.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <summary className="text-sm font-medium text-red-800 dark:text-red-200 cursor-pointer">
                  Debug Information
                </summary>
                <pre className="mt-2 text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easy wrapping
export function withConnectivityErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <ConnectivityErrorBoundary>
        <Component {...props} />
      </ConnectivityErrorBoundary>
    )
  }
}

// Hook for handling connectivity errors in functional components
export function useConnectivityErrorHandler() {
  const handleError = (error: Error) => {
    const isConnectivityError = 
      error.message.includes('ERR_BLOCKED_BY_CLIENT') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('fetch') ||
      error.message.includes('localhost')

    if (isConnectivityError) {
      // console.warn('🌐 Connectivity error in functional component:', error)
      // You could dispatch to a global error state or show a toast
      return true // Handled
    }

    return false // Not handled, let other error handlers deal with it
  }

  return { handleError }
}