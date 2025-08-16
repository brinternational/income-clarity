'use client';

interface Portfolio {
  id: string;
  name: string;
  type: string;
  holdingsCount?: number;
}

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  currentValue?: number;
}

interface DeleteConfirmationModalProps {
  type: 'portfolio' | 'holding';
  item: Portfolio | Holding;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({ type, item, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  const isPortfolio = type === 'portfolio';
  const portfolio = isPortfolio ? item as Portfolio : null;
  const holding = !isPortfolio ? item as Holding : null;

  const getTitle = () => {
    if (isPortfolio) {
      return `Delete Portfolio: ${portfolio?.name}`;
    }
    return `Delete Holding: ${holding?.ticker}`;
  };

  const getDescription = () => {
    if (isPortfolio) {
      if (portfolio?.holdingsCount && portfolio.holdingsCount > 0) {
        return `This portfolio contains ${portfolio.holdingsCount} holding${portfolio.holdingsCount !== 1 ? 's' : ''}. Please remove all holdings before deleting this portfolio.`;
      }
      return 'Are you sure you want to delete this portfolio? This action cannot be undone.';
    }
    return 'Are you sure you want to delete this holding? This action cannot be undone.';
  };

  const getItemDetails = () => {
    if (isPortfolio && portfolio) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-white mb-1">{portfolio.name}</div>
            <div className="text-gray-600 dark:text-gray-400">
              Type: {portfolio.type}
              {portfolio.holdingsCount !== undefined && (
                <> • Holdings: {portfolio.holdingsCount}</>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (!isPortfolio && holding) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-white mb-1">{holding.ticker}</div>
            <div className="text-gray-600 dark:text-gray-400">
              Shares: {holding.shares.toLocaleString()}
              {holding.currentValue && (
                <> • Value: ${holding.currentValue.toLocaleString()}</>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const canDelete = () => {
    if (isPortfolio && portfolio) {
      return !portfolio.holdingsCount || portfolio.holdingsCount === 0;
    }
    return true;
  };

  const getWarningIcon = () => {
    const iconClass = canDelete() 
      ? "text-red-600 dark:text-red-400" 
      : "text-yellow-600 dark:text-yellow-400";
    
    return (
      <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 ${iconClass}`}>
        {canDelete() ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {getWarningIcon()}
            
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {getTitle()}
            </h3>
            
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {getDescription()}
            </p>

            <div className="mt-4 w-full">
              {getItemDetails()}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                       hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            {canDelete() ? (
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                         transition-colors flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete {type}</span>
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50"
              >
                Cannot Delete
              </button>
            )}
          </div>

          {!canDelete() && isPortfolio && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Note:</strong> Remove all holdings from this portfolio before deleting it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}