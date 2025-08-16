'use client';

import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator, ArrowRight, Zap } from 'lucide-react';

interface IncomeClarityData {
  gross: number;
  taxes: number;
  net: number;
  expenses: number;
  available: number;
  taxRate: number;
}

interface IncomeClarityCardProps {
  data?: IncomeClarityData;
  viewMode?: 'monthly' | 'annual';
  className?: string;
}

export function IncomeClarityCard({ 
  data,
  viewMode = 'monthly',
  className = ''
}: IncomeClarityCardProps) {

  // Ensure all data properties have values, using defaults for any missing ones
  const safeData = {
    gross: data?.gross ?? 5000,
    taxes: data?.taxes ?? 1350,
    net: data?.net ?? 3650,
    expenses: data?.expenses ?? 3200,
    available: data?.available ?? 450,
    taxRate: data?.taxRate ?? 27.0
  };

  const multiplier = viewMode === 'annual' ? 12 : 1;
  const period = viewMode === 'annual' ? 'Annual' : 'Monthly';
  
  const displayData = {
    gross: safeData.gross * multiplier,
    taxes: safeData.taxes * multiplier,
    net: safeData.net * multiplier,
    expenses: safeData.expenses * multiplier,
    available: safeData.available * multiplier,
    taxRate: safeData.taxRate
  };

  const isPositive = displayData.available > 0;
  const availablePercentage = displayData.net > 0 ? (displayData.available / displayData.net) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString()}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Calculator className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-slate-800">Income Clarity</h3>
        </div>
        <p className="text-sm text-slate-600">{period} income waterfall from gross to available</p>
      </div>

      {/* Income Waterfall */}
      <div className="space-y-4">
        {/* Gross Income */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-25 rounded-xl p-4 border border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="font-semibold text-primary-800">Gross Income</div>
                <div className="text-xs text-primary-600">{period} total income</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(displayData.gross)}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-slate-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
            <span className="text-xs">Minus taxes</span>
          </div>
        </div>

        {/* Taxes */}
        <div className="bg-gradient-to-r from-alert-50 to-alert-25 rounded-xl p-4 border border-alert-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-alert-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-alert-600" />
              </div>
              <div>
                <div className="font-semibold text-alert-800">Taxes</div>
                <div className="text-xs text-alert-600">{displayData.taxRate.toFixed(1)}% effective rate</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-alert-600">
                -{formatCurrency(displayData.taxes)}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-slate-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
            <span className="text-xs">Equals net income</span>
          </div>
        </div>

        {/* Net Income */}
        <div className="bg-gradient-to-r from-prosperity-50 to-prosperity-25 rounded-xl p-4 border border-prosperity-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-prosperity-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-prosperity-600" />
              </div>
              <div>
                <div className="font-semibold text-prosperity-800">Net Income</div>
                <div className="text-xs text-prosperity-600">After-tax income</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-prosperity-600">
                {formatCurrency(displayData.net)}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-slate-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
            <span className="text-xs">Minus expenses</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-200 rounded-lg">
                <DollarSign className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Expenses</div>
                <div className="text-xs text-slate-600">{period} living costs</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-700">
                -{formatCurrency(displayData.expenses)}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-slate-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
            <span className="text-xs">Available to invest</span>
          </div>
        </div>

        {/* Available to Reinvest - THE MAGIC NUMBER */}
        <div className={`rounded-xl p-6 border-2 ${
          isPositive 
            ? 'bg-gradient-to-br from-prosperity-50 via-prosperity-25 to-white border-prosperity-300' 
            : 'bg-gradient-to-br from-alert-50 via-alert-25 to-white border-alert-300'
        }`}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className={`w-6 h-6 mr-2 ${isPositive ? 'text-prosperity-600' : 'text-alert-600'}`} />
              <span className="font-semibold text-slate-800">THE MAGIC NUMBER</span>
            </div>
            
            <div className={`text-4xl font-bold mb-2 ${
              isPositive ? 'text-prosperity-600' : 'text-alert-600'
            }`}>
              {isPositive ? '+' : ''}{formatCurrency(displayData.available)}
            </div>
            
            <div className="text-sm font-medium text-slate-700 mb-3">
              Available to Reinvest ({period})
            </div>
            
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isPositive 
                ? 'bg-prosperity-100 text-prosperity-700 border border-prosperity-200' 
                : 'bg-alert-100 text-alert-700 border border-alert-200'
            }`}>
              {isPositive 
                ? `${availablePercentage.toFixed(1)}% of net income` 
                : 'Above expenses - need to reduce costs'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
        <h4 className="font-semibold text-primary-800 mb-2 flex items-center">
          <Calculator className="w-4 h-4 mr-1" />
          Key Insights
        </h4>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Your effective tax rate is {displayData.taxRate.toFixed(1)}%</li>
          <li>• Living expenses consume {displayData.net > 0 ? ((displayData.expenses / displayData.net) * 100).toFixed(1) : '0.0'}% of net income</li>
          {isPositive ? (
            <li>• You have {availablePercentage.toFixed(1)}% available for wealth building</li>
          ) : (
            <li>• Consider reducing expenses by ${formatCurrency(Math.abs(displayData.available))} to break even</li>
          )}
        </ul>
      </div>

      {/* Action Items */}
      {!isPositive && (
        <div className="bg-alert-50 rounded-lg p-4 border border-alert-200">
          <h4 className="font-semibold text-alert-800 mb-2">Action Needed</h4>
          <p className="text-sm text-alert-700">
            Your expenses exceed your net income. Consider reviewing your budget to identify areas where you can reduce spending.
          </p>
        </div>
      )}
      
      {isPositive && availablePercentage > 20 && (
        <div className="bg-prosperity-50 rounded-lg p-4 border border-prosperity-200">
          <h4 className="font-semibold text-prosperity-800 mb-2">Excellent Position!</h4>
          <p className="text-sm text-prosperity-700">
            You're saving over 20% of your net income - you're on track for financial independence.
          </p>
        </div>
      )}
    </div>
  );
}