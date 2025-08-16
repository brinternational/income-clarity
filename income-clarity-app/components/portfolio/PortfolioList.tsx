'use client';

import { useState } from 'react';

interface Portfolio {
  id: string;
  name: string;
  type: string;
  institution?: string;
  isPrimary: boolean;
  holdingsCount: number;
  totalValue: number;
  totalCostBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioListProps {
  portfolios: Portfolio[];
  onSelect: (portfolio: Portfolio) => void;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (portfolio: Portfolio) => void;
}

export function PortfolioList({ portfolios, onSelect, onEdit, onDelete }: PortfolioListProps) {
  const [hoveredPortfolio, setHoveredPortfolio] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'taxable': 'Taxable',
      'ira': 'IRA',
      'roth_ira': 'Roth IRA',
      '401k': '401(k)',
      'crypto': 'Crypto',
      'other': 'Other',
    };
    return typeMap[type] || type;
  };

  const handleCardClick = (portfolio: Portfolio, event: React.MouseEvent) => {
    // Don't trigger selection if clicking on action buttons
    const target = event.target as HTMLElement;
    if (target.closest('[data-action]')) {
      return;
    }
    onSelect(portfolio);
  };

  return (
    <div className="space-y-4">
      {portfolios.map((portfolio) => (
        <div
          key={portfolio.id}
          className={`
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
            rounded-lg p-6 cursor-pointer transition-all duration-200
            ${hoveredPortfolio === portfolio.id 
              ? 'shadow-lg border-blue-300 dark:border-blue-600' 
              : 'shadow-sm hover:shadow-md'
            }
          `}
          onMouseEnter={() => setHoveredPortfolio(portfolio.id)}
          onMouseLeave={() => setHoveredPortfolio(null)}
          onClick={(e) => handleCardClick(portfolio, e)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {portfolio.name}
                </h3>
                {portfolio.isPrimary && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-medium">
                    Primary
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span>{getTypeDisplayName(portfolio.type)}</span>
                {portfolio.institution && (
                  <>
                    <span>•</span>
                    <span>{portfolio.institution}</span>
                  </>
                )}
                <span>•</span>
                <span>{portfolio.holdingsCount} holding{portfolio.holdingsCount !== 1 ? 's' : ''}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Total Value
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.totalValue)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Cost Basis
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.totalCostBasis)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Gain/Loss
                  </p>
                  <p className={`text-lg font-semibold ${
                    portfolio.gainLoss >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(portfolio.gainLoss)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Return
                  </p>
                  <p className={`text-lg font-semibold ${
                    portfolio.gainLossPercent >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentage(portfolio.gainLossPercent)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4" data-action="true">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(portfolio);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Edit Portfolio"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(portfolio);
                }}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete Portfolio"
                disabled={portfolio.holdingsCount > 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Click hint */}
          <div className={`
            mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 
            text-xs text-gray-500 dark:text-gray-400 transition-opacity
            ${hoveredPortfolio === portfolio.id ? 'opacity-100' : 'opacity-0'}
          `}>
            Click to view holdings →
          </div>
        </div>
      ))}
    </div>
  );
}