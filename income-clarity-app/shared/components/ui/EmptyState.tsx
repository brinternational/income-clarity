import React from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'portfolio' | 'income' | 'expense' | 'performance' | 'planning';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  variant = 'default',
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'portfolio':
        return 'border-blue-200 bg-blue-50/50';
      case 'income':
        return 'border-green-200 bg-green-50/50';
      case 'expense':
        return 'border-red-200 bg-red-50/50';
      case 'performance':
        return 'border-purple-200 bg-purple-50/50';
      case 'planning':
        return 'border-indigo-200 bg-indigo-50/50';
      default:
        return 'border-gray-200 bg-gray-50/50';
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'portfolio':
        return (
          <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'income':
        return (
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'expense':
        return (
          <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'performance':
        return (
          <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'planning':
        return (
          <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
    }
  };

  return (
    <Card className={`border-2 border-dashed transition-colors ${getVariantClasses()} ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4">
          {icon || getDefaultIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-sm">
          {description}
        </p>
        
        {actionText && onAction && (
          <Button
            onClick={onAction}
            variant="outline"
            className="hover:shadow-md transition-shadow"
          >
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Predefined EmptyState variants for common use cases
export const PortfolioEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState
    variant="portfolio"
    title="No holdings yet"
    description="Add your first investment to start tracking your portfolio performance and dividends."
    actionText="Add Investment"
    {...props}
  />
);

export const IncomeEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState
    variant="income"
    title="No income tracked"
    description="Start recording your dividend payments and other income to see your progress."
    actionText="Add Income"
    {...props}
  />
);

export const ExpenseEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState
    variant="expense"
    title="No expenses recorded"
    description="Track your spending to understand your financial habits and improve your savings rate."
    actionText="Add Expense"
    {...props}
  />
);

export const PerformanceEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState
    variant="performance"
    title="No performance data"
    description="Add investments to your portfolio to see performance metrics and analytics."
    actionText="View Portfolio"
    {...props}
  />
);

export const PlanningEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState
    variant="planning"
    title="No financial plan set"
    description="Set your financial goals and let us help you track your progress towards FIRE."
    actionText="Set Goals"
    {...props}
  />
);

export default EmptyState;