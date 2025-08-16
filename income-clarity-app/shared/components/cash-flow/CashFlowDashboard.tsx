'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  PieChart,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { CashFlowChart } from './CashFlowChart';
import { CashFlowProjection } from './CashFlowProjection';
import { SavingsRateTracker } from './SavingsRateTracker';

interface CashFlowData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    savingsRate: number;
    isAboveZero: boolean;
  };
  breakdown: {
    incomes: {
      total: number;
      count: number;
      recurringMonthly: number;
    };
    expenses: {
      total: number;
      count: number;
      recurringMonthly: number;
    };
  };
  monthlyDividendIncome: number;
  projections?: {
    data: Array<{
      month: string;
      income: number;
      expenses: number;
      netCashFlow: number;
      cumulativeCashFlow: number;
    }>;
    summary: {
      averageMonthlyIncome: number;
      averageMonthlyExpenses: number;
      averageNetCashFlow: number;
      finalCumulativeAmount: number;
    };
  };
  milestones?: {
    monthlyDividendIncome: number;
    coverage: Array<{
      id: string;
      category: string;
      monthlyAmount: number;
      coveredByDividends: boolean;
      progress: number;
    }>;
    totalCovered: number;
    percentageCovered: number;
  };
}

interface CashFlowDashboardProps {
  period?: 'month' | 'quarter' | 'year';
  year?: number;
  month?: number;
}

export function CashFlowDashboard({ period = 'month', year, month }: CashFlowDashboardProps) {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    fetchCashFlowData();
  }, [selectedPeriod, year, month]);

  const fetchCashFlowData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period: selectedPeriod,
        includeProjections: 'true',
        includeMilestones: 'true',
        includeFIRE: 'true',
        projectionMonths: '12'
      });

      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());

      const response = await fetch(`/api/cash-flow?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cash flow data');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      // Error handled by emergency recovery script finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading cash flow data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCashFlowData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, breakdown, monthlyDividendIncome, projections, milestones } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Cash Flow Dashboard
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track your income, expenses, and savings progress
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'quarter' | 'year')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Cash Flow */}
        <div className={`bg-white rounded-xl shadow-lg border-2 p-6 ${
          summary.isAboveZero 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                summary.isAboveZero ? 'text-green-700' : 'text-red-700'
              }`}>
                Net Cash Flow
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                summary.isAboveZero ? 'text-green-900' : 'text-red-900'
              }`}>
                {formatCurrency(summary.netCashFlow)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              summary.isAboveZero 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {summary.isAboveZero ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            </div>
          </div>
          <div className="mt-4">
            {summary.isAboveZero ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Above Zero! 🎉</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Below Zero</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total Income</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">{formatCurrency(breakdown.incomes.recurringMonthly)}</span> monthly recurring
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">{formatCurrency(breakdown.expenses.recurringMonthly)}</span> monthly recurring
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Savings Rate</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatPercentage(summary.savingsRate)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  summary.savingsRate >= 20 
                    ? 'bg-green-600' 
                    : summary.savingsRate >= 10 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.abs(summary.savingsRate), 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Target: 20%+ for FIRE
            </p>
          </div>
        </div>
      </div>

      {/* Dividend Income Milestones */}
      {milestones && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Dividend Milestone Progress
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(milestones.monthlyDividendIncome)} monthly dividend income • {milestones.totalCovered}/{milestones.coverage.length} milestones covered
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">
                {milestones.percentageCovered.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {milestones.coverage.map((milestone, index) => (
              <div key={milestone.id} className="relative">
                <div className={`p-4 rounded-lg border-2 ${
                  milestone.coveredByDividends 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {index + 1}. {milestone.category}
                    </h4>
                    {milestone.coveredByDividends && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    {formatCurrency(milestone.monthlyAmount)}
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        milestone.coveredByDividends 
                          ? 'bg-green-500' 
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(milestone.progress, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mt-1">
                    {milestone.progress.toFixed(0)}% covered
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <CashFlowChart 
          data={data}
          period={selectedPeriod}
        />

        {/* Savings Rate Tracker */}
        <SavingsRateTracker
          currentRate={summary.savingsRate}
          isAboveZero={summary.isAboveZero}
          targetRate={20}
        />
      </div>

      {/* Projections */}
      {projections && (
        <CashFlowProjection 
          projections={projections}
          currentNetFlow={summary.netCashFlow}
        />
      )}
    </div>
  );
}