'use client';

import { useState } from 'react';
import StrategyComparisonEngine from './StrategyComparisonEngine';
import { STATE_TAX_RATES } from '@/lib/state-tax-rates';

/**
 * Demo component to showcase the StrategyComparisonEngine
 * This demonstrates how to use the component with different configurations
 */
export default function StrategyComparisonEngineDemo() {
  const [income, setIncome] = useState(100000);
  const [location, setLocation] = useState('CA');
  const [filingStatus, setFilingStatus] = useState<'single' | 'marriedJoint'>('single');

  const stateOptions = Object.entries(STATE_TAX_RATES)
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([code, info]) => ({ code, name: info.name, isTerritory: info.isTerritory }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Strategy Comparison Engine Demo
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          This is Income Clarity's competitive moat - showing users which investment strategy 
          maximizes after-tax income based on their location and tax situation.
        </p>
      </div>

      {/* Configuration Controls */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Annual Portfolio Value
            </label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              min="50000"
              max="10000000"
              step="10000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Portfolio value for income calculation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tax Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {stateOptions.map(({ code, name, isTerritory }) => (
                <option key={code} value={code}>
                  {name} {isTerritory ? '(Territory)' : ''} - {code}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Your tax residence for calculation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filing Status
            </label>
            <select
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as 'single' | 'marriedJoint')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="single">Single</option>
              <option value="marriedJoint">Married Filing Jointly</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Federal tax filing status
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Engine */}
      <StrategyComparisonEngine
        annualIncome={income}
        location={location}
        filingStatus={filingStatus}
        showActions={true}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
      />

      {/* Usage Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            California High Earner
          </h3>
          <p className="text-sm text-green-800 mb-4">
            $500K portfolio in CA shows dramatic tax differences between strategies.
          </p>
          <button
            onClick={() => {
              setIncome(500000);
              setLocation('CA');
              setFilingStatus('marriedJoint');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Example
          </button>
        </div>

        <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">
            Puerto Rico Paradise
          </h3>
          <p className="text-sm text-amber-800 mb-4">
            See the massive tax advantage of PR's 0% qualified dividend rate.
          </p>
          <button
            onClick={() => {
              setIncome(300000);
              setLocation('PR');
              setFilingStatus('single');
            }}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Example
          </button>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Texas No-Tax
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            No state income tax makes every strategy more attractive in TX.
          </p>
          <button
            onClick={() => {
              setIncome(200000);
              setLocation('TX');
              setFilingStatus('marriedJoint');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Example
          </button>
        </div>
      </div>

      {/* Technical Notes */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Technical Implementation Notes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Strategy Tax Treatment</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li><strong>SPY Sell:</strong> Capital gains rates (0%, 15%, 20%)</li>
              <li><strong>Dividends:</strong> Qualified dividend rates (same as cap gains)</li>
              <li><strong>Covered Calls:</strong> Ordinary income rates (10%-37%)</li>
              <li><strong>60/40 Portfolio:</strong> Mixed (70% qualified, 30% ordinary)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">Key Features</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>✅ Real-time tax calculations for all 50 states + territories</li>
              <li>✅ 10-year income projections with 3% growth assumption</li>
              <li>✅ Puerto Rico special highlighting (0% qualified dividends)</li>
              <li>✅ Export to CSV functionality</li>
              <li>✅ Mobile-responsive design with animations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}