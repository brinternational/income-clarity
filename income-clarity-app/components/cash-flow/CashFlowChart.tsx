'use client';

import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

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
      byCategory?: Record<string, { amount: number; count: number }>;
    };
    expenses: {
      total: number;
      count: number;
      recurringMonthly: number;
      byCategory?: Record<string, { amount: number; count: number }>;
      analysis?: {
        topCategories: Array<{ category: string; amount: number; percentage: number }>;
        essentialRatio: number;
        recurringRatio: number;
        averagePriority: number;
      };
    };
  };
  monthlyTrend?: Array<{
    month: string;
    income: number;
    expenses: number;
    netCashFlow: number;
  }>;
}

interface CashFlowChartProps {
  data: CashFlowData;
  period: 'month' | 'quarter' | 'year';
}

type ChartType = 'overview' | 'categories' | 'trend';

export function CashFlowChart({ data, period }: CashFlowChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('overview');
  
  const { summary, breakdown, monthlyTrend } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Overview Chart - Income vs Expenses
  const OverviewChart = () => {
    const maxValue = Math.max(summary.totalIncome, summary.totalExpenses);
    const incomePercentage = maxValue > 0 ? (summary.totalIncome / maxValue) * 100 : 0;
    const expensePercentage = maxValue > 0 ? (summary.totalExpenses / maxValue) * 100 : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Income Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Income</span>
              <span className="text-sm text-gray-600">{formatCurrency(summary.totalIncome)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-700 ease-out"
                style={{ width: `${incomePercentage}%` }}
              />
            </div>
          </div>

          {/* Expense Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-700">Expenses</span>
              <span className="text-sm text-gray-600">{formatCurrency(summary.totalExpenses)}</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-700 ease-out"
                style={{ width: `${expensePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Net Cash Flow Indicator */}
        <div className={`p-4 rounded-lg ${
          summary.isAboveZero 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${
                summary.isAboveZero ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className={`font-medium ${
                summary.isAboveZero ? 'text-green-800' : 'text-red-800'
              }`}>
                Net Cash Flow
              </span>
            </div>
            <span className={`text-lg font-bold ${
              summary.isAboveZero ? 'text-green-900' : 'text-red-900'
            }`}>
              {formatCurrency(summary.netCashFlow)}
            </span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-gray-600">Income Breakdown</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Total entries:</span>
                <span className="font-medium">{breakdown.incomes.count}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly recurring:</span>
                <span className="font-medium">{formatCurrency(breakdown.incomes.recurringMonthly)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-gray-600">Expense Breakdown</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Total entries:</span>
                <span className="font-medium">{breakdown.expenses.count}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly recurring:</span>
                <span className="font-medium">{formatCurrency(breakdown.expenses.recurringMonthly)}</span>
              </div>
              {breakdown.expenses.analysis && (
                <>
                  <div className="flex justify-between">
                    <span>Essential ratio:</span>
                    <span className="font-medium">{breakdown.expenses.analysis.essentialRatio.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg priority:</span>
                    <span className="font-medium">{breakdown.expenses.analysis.averagePriority.toFixed(1)}/10</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Categories Chart
  const CategoriesChart = () => {
    if (!breakdown.expenses.analysis) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Category data not available</p>
        </div>
      );
    }

    const { topCategories } = breakdown.expenses.analysis;

    return (
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700 mb-4">
          Top Expense Categories
        </div>
        
        {topCategories.map((category, index) => {
          const percentage = category.percentage;
          
          return (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {index + 1}. {category.category}
                </span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(category.amount)} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${
                    index === 0 ? 'bg-red-500' :
                    index === 1 ? 'bg-orange-500' :
                    index === 2 ? 'bg-yellow-500' :
                    index === 3 ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Trend Chart (for yearly view)
  const TrendChart = () => {
    if (!monthlyTrend || monthlyTrend.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Trend data not available</p>
        </div>
      );
    }

    const maxValue = Math.max(
      ...monthlyTrend.map(m => Math.max(m.income, m.expenses))
    );

    return (
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-700 mb-4">
          Monthly Trend
        </div>
        
        <div className="space-y-3">
          {monthlyTrend.slice(-6).map((month) => {
            const incomeHeight = maxValue > 0 ? (month.income / maxValue) * 100 : 0;
            const expenseHeight = maxValue > 0 ? (month.expenses / maxValue) * 100 : 0;
            
            return (
              <div key={month.month} className="flex items-end gap-2 h-12">
                <div className="w-16 text-xs text-gray-600 flex-shrink-0">
                  {formatMonth(month.month)}
                </div>
                
                {/* Income Bar */}
                <div className="flex-1 flex items-end justify-start">
                  <div 
                    className="bg-green-500 rounded-t min-w-0 transition-all duration-500"
                    style={{ 
                      height: `${Math.max(incomeHeight, 8)}%`,
                      width: '45%'
                    }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  />
                </div>
                
                {/* Expense Bar */}
                <div className="flex-1 flex items-end justify-end">
                  <div 
                    className="bg-red-500 rounded-t min-w-0 transition-all duration-500"
                    style={{ 
                      height: `${Math.max(expenseHeight, 8)}%`,
                      width: '45%'
                    }}
                    title={`Expenses: ${formatCurrency(month.expenses)}`}
                  />
                </div>
                
                {/* Net Flow Indicator */}
                <div className="w-16 text-xs text-right">
                  <div className={`font-medium ${
                    month.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {month.netCashFlow >= 0 ? '+' : ''}{(month.netCashFlow / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Expenses</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Cash Flow Analysis
        </h3>

        {/* Chart Type Selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveChart('overview')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeChart === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveChart('categories')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeChart === 'categories'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Categories
          </button>
          {period === 'year' && monthlyTrend && (
            <button
              onClick={() => setActiveChart('trend')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeChart === 'trend'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trend
            </button>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="min-h-[300px]">
        {activeChart === 'overview' && <OverviewChart />}
        {activeChart === 'categories' && <CategoriesChart />}
        {activeChart === 'trend' && <TrendChart />}
      </div>
    </div>
  );
}