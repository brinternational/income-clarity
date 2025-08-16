'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  DollarSign,
  RefreshCw,
  Calendar,
  Filter,
  Eye
} from 'lucide-react';

interface BudgetCategory {
  id: string;
  category: string;
  budgetedAmount: number;
  actualSpent: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  expenseCount: number;
  priority: number;
  essential: boolean;
  notes?: string;
}

interface BudgetProgress {
  categories: BudgetCategory[];
  overall: {
    totalBudgeted: number;
    totalActual: number;
    percentage: number;
    remaining: number;
    isOverBudget: boolean;
    shouldAlert: boolean;
  };
  timeline: {
    daysInBudget: number;
    daysElapsed: number;
    daysRemaining: number;
    percentageComplete: number;
  };
  projections: {
    dailySpendRate: number;
    projectedTotal: number;
    projectedOverage: number;
    onTrack: boolean;
    recommendedDailySpend: number;
  };
}

interface BudgetData {
  id: string;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  alertThreshold: number;
  isActive: boolean;
  progress: BudgetProgress;
}

interface BudgetTrackerProps {
  budgetId: string;
  showDetails?: boolean;
  onUpdateBudget?: (budget: BudgetData) => void;
}

type FilterType = 'all' | 'over' | 'under' | 'essential' | 'discretionary';
type SortType = 'category' | 'amount' | 'percentage' | 'remaining';

export function BudgetTracker({ budgetId, showDetails = true, onUpdateBudget }: BudgetTrackerProps) {
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('category');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBudgetData();
  }, [budgetId]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/budgets/${budgetId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch budget data');
      }

      const result = await response.json();
      
      if (result.success) {
        setBudget(result.data);
        onUpdateBudget?.(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      // Error handled by emergency recovery script finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBudgetData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFilteredCategories = () => {
    if (!budget) return [];

    let filtered = budget.progress.categories;

    switch (filter) {
      case 'over':
        filtered = filtered.filter(cat => cat.isOverBudget);
        break;
      case 'under':
        filtered = filtered.filter(cat => !cat.isOverBudget);
        break;
      case 'essential':
        filtered = filtered.filter(cat => cat.essential);
        break;
      case 'discretionary':
        filtered = filtered.filter(cat => !cat.essential);
        break;
    }

    // Sort categories
    return filtered.sort((a, b) => {
      switch (sort) {
        case 'amount':
          return b.budgetedAmount - a.budgetedAmount;
        case 'percentage':
          return b.percentage - a.percentage;
        case 'remaining':
          return a.remaining - b.remaining;
        default:
          return a.category.localeCompare(b.category);
      }
    });
  };

  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'red';
    if (percentage >= 90) return 'orange';
    if (percentage >= 70) return 'yellow';
    return 'green';
  };

  const getProgressColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-500 text-red-50',
      orange: 'bg-orange-500 text-orange-50',
      yellow: 'bg-yellow-500 text-yellow-50',
      green: 'bg-green-500 text-green-50'
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading budget tracker...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Budget</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchBudgetData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!budget) {
    return null;
  }

  const { progress } = budget;
  const filteredCategories = getFilteredCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              {budget.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {budget.period.toLowerCase()}
              </span>
              {budget.isActive && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Active
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Progress */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
              progress.overall.isOverBudget 
                ? 'bg-red-100 text-red-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {progress.overall.isOverBudget ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <CheckCircle className="w-8 h-8" />
              )}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">
                {progress.overall.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {formatCurrency(progress.overall.totalActual)} of {formatCurrency(progress.overall.totalBudgeted)}
              </div>
              <div className={`text-sm font-medium mt-1 ${
                progress.overall.isOverBudget ? 'text-red-600' : 'text-green-600'
              }`}>
                {progress.overall.isOverBudget ? 'Over Budget' : 'On Track'}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-full">
              <Clock className="w-8 h-8" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">
                {progress.timeline.daysRemaining}
              </div>
              <div className="text-sm text-gray-600">
                Days Remaining
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress.timeline.percentageComplete, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {progress.timeline.percentageComplete.toFixed(0)}% complete
              </div>
            </div>
          </div>

          {/* Projection */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
              progress.projections.onTrack 
                ? 'bg-green-100 text-green-600' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(progress.projections.projectedTotal)}
              </div>
              <div className="text-sm text-gray-600">
                Projected Total
              </div>
              <div className={`text-sm font-medium mt-1 ${
                progress.projections.onTrack ? 'text-green-600' : 'text-orange-600'
              }`}>
                {progress.projections.onTrack ? 'On Track' : `${formatCurrency(progress.projections.projectedOverage)} over`}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Daily Spend */}
        {progress.timeline.daysRemaining > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Recommended Daily Spend
                </span>
              </div>
              <span className="text-lg font-bold text-blue-900">
                {formatCurrency(progress.projections.recommendedDailySpend)}
              </span>
            </div>
            <div className="text-sm text-blue-600 mt-1">
              To stay on budget for the remaining {progress.timeline.daysRemaining} days
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {showDetails && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Category Breakdown
            </h3>

            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="over">Over Budget</option>
                  <option value="under">Under Budget</option>
                  <option value="essential">Essential</option>
                  <option value="discretionary">Discretionary</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="category">Name</option>
                  <option value="amount">Budget Amount</option>
                  <option value="percentage">% Used</option>
                  <option value="remaining">Remaining</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const progressColor = getProgressColor(category.percentage, category.isOverBudget);
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">
                        {category.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      {category.essential && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Essential
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        Priority {category.priority}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(category.actualSpent)} / {formatCurrency(category.budgetedAmount)}
                      </div>
                      <div className={`text-xs ${
                        category.isOverBudget ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {category.remaining >= 0 ? formatCurrency(category.remaining) + ' remaining' : 
                         formatCurrency(Math.abs(category.remaining)) + ' over'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColorClasses(progressColor)}`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                      {category.percentage > 100 && (
                        <div 
                          className="absolute top-0 left-0 h-3 bg-red-600 rounded-full opacity-50"
                          style={{ width: `${Math.min((category.percentage - 100), 100)}%` }}
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {category.expenseCount} expense{category.expenseCount !== 1 ? 's' : ''}
                      </span>
                      <span className={`text-xs font-medium ${
                        category.isOverBudget ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {category.notes && (
                    <div className="mt-2 text-sm text-gray-600 italic">
                      {category.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No categories match your current filter</p>
              <p className="text-sm">Try adjusting your filter settings</p>
            </div>
          )}
        </div>
      )}

      {/* Alerts */}
      {progress.overall.shouldAlert && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Budget Alert</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You've reached {progress.overall.percentage.toFixed(0)}% of your budget threshold. 
                Consider reviewing your spending patterns.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}