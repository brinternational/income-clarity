'use client';

import React, { useState } from 'react';
import { Calculator, MapPin, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

interface StateOption {
  code: string;
  name: string;
  stateRate: number;
  note?: string;
}

interface TaxSavingsCalculatorCardProps {
  currentState?: string;
  annualIncome?: number;
  className?: string;
}

export function TaxSavingsCalculatorCard({ 
  currentState = 'CA',
  annualIncome = 75000,
  className = ''
}: TaxSavingsCalculatorCardProps) {

  const [selectedState, setSelectedState] = useState('TX');
  const [income, setIncome] = useState(annualIncome);

  const stateOptions: StateOption[] = [
    { code: 'TX', name: 'Texas', stateRate: 0, note: 'No state income tax' },
    { code: 'FL', name: 'Florida', stateRate: 0, note: 'No state income tax' },
    { code: 'WA', name: 'Washington', stateRate: 0, note: 'No state income tax' },
    { code: 'NV', name: 'Nevada', stateRate: 0, note: 'No state income tax' },
    { code: 'TN', name: 'Tennessee', stateRate: 0, note: 'No state income tax' },
    { code: 'WY', name: 'Wyoming', stateRate: 0, note: 'No state income tax' },
    { code: 'SD', name: 'South Dakota', stateRate: 0, note: 'No state income tax' },
    { code: 'PR', name: 'Puerto Rico', stateRate: 0, note: 'Act 60 benefits' },
    { code: 'NY', name: 'New York', stateRate: 8.82 },
    { code: 'CA', name: 'California', stateRate: 9.3 }
  ];

  const getCurrentStateTax = () => {
    const current = stateOptions.find(s => s.code === currentState);
    return current ? (income * current.stateRate / 100) : (income * 0.093); // Default to CA rate
  };

  const getNewStateTax = () => {
    const newState = stateOptions.find(s => s.code === selectedState);
    return newState ? (income * newState.stateRate / 100) : 0;
  };

  const annualSavings = getCurrentStateTax() - getNewStateTax();
  const monthlySavings = annualSavings / 12;
  const currentStateData = stateOptions.find(s => s.code === currentState);
  const selectedStateData = stateOptions.find(s => s.code === selectedState);

  const movingCosts = 15000; // Estimated moving costs
  const breakEvenMonths = annualSavings > 0 ? (movingCosts / monthlySavings) : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Calculator className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-foreground">Tax Savings Calculator</h3>
        </div>
        <p className="text-sm text-muted-foreground">Calculate potential savings by relocating to a tax-friendly state</p>
      </div>

      {/* Income Input */}
      <div className="bg-slate-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-foreground/90 mb-2">
          Annual Income
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value) || 0)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="75000"
            min="0"
            step="1000"
          />
        </div>
      </div>

      {/* State Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current State */}
        <div className="bg-alert-50 rounded-lg p-4 border border-alert-200">
          <div className="flex items-center mb-3">
            <MapPin className="w-4 h-4 text-alert-600 mr-2" />
            <span className="font-semibold text-alert-800">Current: {currentStateData?.name}</span>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-alert-600">
              ${getCurrentStateTax().toLocaleString()}
            </div>
            <div className="text-xs text-alert-700">Annual state tax</div>
            <div className="text-xs text-muted-foreground">
              {currentStateData?.stateRate || 9.3}% tax rate
            </div>
          </div>
        </div>

        {/* Target State */}
        <div className="bg-prosperity-50 rounded-lg p-4 border border-prosperity-200">
          <div className="flex items-center mb-3">
            <MapPin className="w-4 h-4 text-prosperity-600 mr-2" />
            <span className="font-semibold text-prosperity-800">Target State</span>
          </div>
          
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full mb-3 px-3 py-2 border border-prosperity-300 rounded-lg focus:ring-2 focus:ring-prosperity-500 focus:border-prosperity-500 bg-white"
          >
            {stateOptions.map(state => (
              <option key={state.code} value={state.code}>
                {state.name} ({state.stateRate}%)
              </option>
            ))}
          </select>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-prosperity-600">
              ${getNewStateTax().toLocaleString()}
            </div>
            <div className="text-xs text-prosperity-700">Annual state tax</div>
            {selectedStateData?.note && (
              <div className="text-xs text-prosperity-600 italic">
                {selectedStateData.note}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Savings Calculation */}
      <div className="bg-gradient-to-br from-prosperity-50 to-prosperity-25 rounded-xl p-6 border border-prosperity-200">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-prosperity-600" />
          </div>
          <h4 className="text-lg font-semibold text-prosperity-800">Potential Savings</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-prosperity-600 mb-1">
              ${annualSavings.toLocaleString()}
            </div>
            <div className="text-sm text-prosperity-700">Annual Savings</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-prosperity-600 mb-1">
              ${monthlySavings.toLocaleString()}
            </div>
            <div className="text-sm text-prosperity-700">Monthly Savings</div>
          </div>
        </div>

        <div className="text-center text-sm text-prosperity-600">
          {annualSavings > 0 ? (
            <span>Save {((annualSavings / getCurrentStateTax()) * 100).toFixed(1)}% on state taxes</span>
          ) : (
            <span>No savings with this state selection</span>
          )}
        </div>
      </div>

      {/* Break-Even Analysis */}
      {annualSavings > 0 && (
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h4 className="font-semibold text-foreground mb-3">Break-Even Analysis</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated moving costs</span>
              <span className="font-semibold text-foreground">${movingCosts.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly savings</span>
              <span className="font-semibold text-prosperity-600">${monthlySavings.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium text-foreground/90">Break-even time</span>
              <span className="font-bold text-primary-600">
                {breakEvenMonths.toFixed(1)} months
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <div className="text-sm text-primary-700">
              After {Math.ceil(breakEvenMonths)} months, you'll be ahead by ${(monthlySavings * (12 - Math.ceil(breakEvenMonths))).toLocaleString()} in the first year.
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="text-center">
        <button className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
          <span>View Detailed Analysis</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}