'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar, Target, DollarSign } from 'lucide-react';

interface ProjectionData {
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
}

interface CashFlowProjectionProps {
  projections: ProjectionData;
  currentNetFlow: number;
}

export function CashFlowProjection({ projections, currentNetFlow }: CashFlowProjectionProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [timeframe, setTimeframe] = useState<3 | 6 | 12>(6);

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
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const displayData = projections.data.slice(0, timeframe);
  const maxCumulative = Math.max(...displayData.map(d => Math.abs(d.cumulativeCashFlow)));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Cash Flow Projections
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Based on current recurring income and expenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value) as 3 | 6 | 12)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm font-medium text-green-700">Avg Monthly Income</div>
          <div className="text-lg font-bold text-green-900 mt-1">
            {formatCurrency(projections.summary.averageMonthlyIncome)}
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm font-medium text-red-700">Avg Monthly Expenses</div>
          <div className="text-lg font-bold text-red-900 mt-1">
            {formatCurrency(projections.summary.averageMonthlyExpenses)}
          </div>
        </div>
        
        <div className={`rounded-lg p-4 ${
          projections.summary.averageNetCashFlow >= 0 
            ? 'bg-blue-50' 
            : 'bg-orange-50'
        }`}>
          <div className={`text-sm font-medium ${
            projections.summary.averageNetCashFlow >= 0 
              ? 'text-blue-700' 
              : 'text-orange-700'
          }`}>
            Avg Net Cash Flow
          </div>
          <div className={`text-lg font-bold mt-1 ${
            projections.summary.averageNetCashFlow >= 0 
              ? 'text-blue-900' 
              : 'text-orange-900'
          }`}>
            {formatCurrency(projections.summary.averageNetCashFlow)}
          </div>
        </div>
        
        <div className={`rounded-lg p-4 ${
          projections.summary.finalCumulativeAmount >= 0 
            ? 'bg-purple-50' 
            : 'bg-yellow-50'
        }`}>
          <div className={`text-sm font-medium ${
            projections.summary.finalCumulativeAmount >= 0 
              ? 'text-purple-700' 
              : 'text-yellow-700'
          }`}>
            {timeframe} Month Total
          </div>
          <div className={`text-lg font-bold mt-1 ${
            projections.summary.finalCumulativeAmount >= 0 
              ? 'text-purple-900' 
              : 'text-yellow-900'
          }`}>
            {formatCurrency(displayData[displayData.length - 1]?.cumulativeCashFlow || 0)}
          </div>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">
            Cumulative Cash Flow Projection
          </div>
          
          <div className="relative h-64 border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500 py-2">
              <span>{formatCurrency(maxCumulative).replace('$', '+$')}</span>
              <span>$0</span>
              <span>{formatCurrency(-maxCumulative)}</span>
            </div>
            
            {/* Zero line */}
            <div className="absolute left-16 right-0 top-1/2 h-px bg-gray-400"></div>
            
            {/* Chart area */}
            <div className="ml-16 h-full flex items-end justify-between">
              {displayData.map((month, index) => {
                const height = maxCumulative > 0 
                  ? Math.abs(month.cumulativeCashFlow / maxCumulative) * 50 
                  : 0;
                const isPositive = month.cumulativeCashFlow >= 0;
                
                return (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    {/* Bar */}
                    <div className="w-full max-w-8 flex flex-col items-center justify-end h-full">
                      <div className="relative flex-1 flex items-center justify-center">
                        <div 
                          className={`w-6 transition-all duration-700 ease-out ${
                            isPositive ? 'bg-green-500' : 'bg-red-500'
                          } ${isPositive ? 'self-end' : 'self-start'}`}
                          style={{ 
                            height: `${Math.max(height, 4)}%`,
                            marginTop: isPositive ? 'auto' : '0',
                            marginBottom: isPositive ? '0' : 'auto'
                          }}
                          title={`${formatMonth(month.month)}: ${formatCurrency(month.cumulativeCashFlow)}`}
                        />
                      </div>
                      
                      {/* Month label */}
                      <div className="text-xs text-gray-600 mt-2 text-center">
                        {formatMonth(month.month).split(' ')[0]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Positive Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Negative Flow</span>
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                <th className="text-right py-3 px-4 font-medium text-green-700">Income</th>
                <th className="text-right py-3 px-4 font-medium text-red-700">Expenses</th>
                <th className="text-right py-3 px-4 font-medium text-blue-700">Net Flow</th>
                <th className="text-right py-3 px-4 font-medium text-purple-700">Cumulative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayData.map((month, index) => (
                <tr key={month.month} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {formatMonth(month.month)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-600">
                    {formatCurrency(month.income)}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600">
                    {formatCurrency(month.expenses)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    month.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {month.netCashFlow >= 0 ? '+' : ''}{formatCurrency(month.netCashFlow)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${
                    month.cumulativeCashFlow >= 0 ? 'text-purple-600' : 'text-orange-600'
                  }`}>
                    {month.cumulativeCashFlow >= 0 ? '+' : ''}{formatCurrency(month.cumulativeCashFlow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Projection Insights</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {projections.summary.averageNetCashFlow > 0 ? (
            <>
              <p>• Your projected savings rate looks positive! You're on track to save {formatCurrency(projections.summary.averageNetCashFlow)} per month.</p>
              <p>• At this rate, you'll accumulate {formatCurrency(projections.summary.finalCumulativeAmount)} over {timeframe} months.</p>
            </>
          ) : (
            <>
              <p>• Your projections show negative cash flow of {formatCurrency(Math.abs(projections.summary.averageNetCashFlow))} per month.</p>
              <p>• Consider reviewing your expenses or finding additional income sources to get above zero.</p>
            </>
          )}
          <p>• These projections are based on your current recurring income and expenses.</p>
        </div>
      </div>
    </div>
  );
}