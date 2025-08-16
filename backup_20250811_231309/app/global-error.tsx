'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in Lite Production mode
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Something went wrong!
              </h1>
              <p className="mt-2 text-gray-600">
                We've encountered an unexpected error. Please try again.
              </p>
              {error.digest && (
                <p className="mt-1 text-sm text-gray-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go to Homepage
              </button>
            </div>

            <p className="text-xs text-gray-500">
              If this problem persists, please refresh the page.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}