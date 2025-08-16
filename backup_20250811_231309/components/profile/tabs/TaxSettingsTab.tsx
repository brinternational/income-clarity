'use client';

import React, { useState } from 'react';
import { Percent, Save, DollarSign } from 'lucide-react';
import { UserSettings } from '../types/settings';

interface TaxSettingsTabProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function TaxSettingsTab({ settings, onUpdate, onSave, isSaving }: TaxSettingsTabProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { tax } = settings;

  const handleInputChange = (field: keyof typeof tax, value: string | number | boolean) => {
    const newTax = { ...tax, [field]: value };
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    onUpdate({
      tax: newTax
    });
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};
    
    if (tax.federalTaxRate < 0 || tax.federalTaxRate > 50) {
      newErrors.federalTaxRate = 'Federal tax rate must be between 0% and 50%';
    }
    
    if (tax.stateTaxRate < 0 || tax.stateTaxRate > 20) {
      newErrors.stateTaxRate = 'State tax rate must be between 0% and 20%';
    }
    
    if (tax.capitalGainsRate < 0 || tax.capitalGainsRate > 50) {
      newErrors.capitalGainsRate = 'Capital gains rate must be between 0% and 50%';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave();
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tax Settings</h2>
        <p className="text-gray-600">
          Configure your tax information for accurate income calculations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Tax Location
          </label>
          <select
            id="location"
            value={tax.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="US-AL">Alabama</option>
            <option value="US-CA">California</option>
            <option value="US-FL">Florida</option>
            <option value="US-NY">New York</option>
            <option value="US-TX">Texas</option>
            <option value="PR">Puerto Rico</option>
          </select>
        </div>

        {/* Filing Status */}
        <div>
          <label htmlFor="filingStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Filing Status
          </label>
          <select
            id="filingStatus"
            value={tax.filingStatus}
            onChange={(e) => handleInputChange('filingStatus', e.target.value as any)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="single">Single</option>
            <option value="married_joint">Married Filing Jointly</option>
            <option value="married_separate">Married Filing Separately</option>
            <option value="head_of_household">Head of Household</option>
          </select>
        </div>

        {/* Tax Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="federalTaxRate" className="block text-sm font-medium text-gray-700 mb-2">
              Federal Tax Rate (%)
            </label>
            <div className="relative">
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="federalTaxRate"
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={tax.federalTaxRate}
                onChange={(e) => handleInputChange('federalTaxRate', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.federalTaxRate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.federalTaxRate && (
              <p className="mt-1 text-sm text-red-600">{errors.federalTaxRate}</p>
            )}
          </div>

          <div>
            <label htmlFor="stateTaxRate" className="block text-sm font-medium text-gray-700 mb-2">
              State Tax Rate (%)
            </label>
            <div className="relative">
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="stateTaxRate"
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={tax.stateTaxRate}
                onChange={(e) => handleInputChange('stateTaxRate', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.stateTaxRate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.stateTaxRate && (
              <p className="mt-1 text-sm text-red-600">{errors.stateTaxRate}</p>
            )}
          </div>

          <div>
            <label htmlFor="capitalGainsRate" className="block text-sm font-medium text-gray-700 mb-2">
              Capital Gains Rate (%)
            </label>
            <div className="relative">
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="capitalGainsRate"
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={tax.capitalGainsRate}
                onChange={(e) => handleInputChange('capitalGainsRate', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.capitalGainsRate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.capitalGainsRate && (
              <p className="mt-1 text-sm text-red-600">{errors.capitalGainsRate}</p>
            )}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Advanced Tax Settings</h3>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <label htmlFor="qualifiedDivOptimization" className="text-sm font-medium text-gray-700">
                Qualified Dividend Optimization
              </label>
              <p className="text-sm text-gray-500">
                Apply lower tax rates to qualified dividends
              </p>
            </div>
            <input
              id="qualifiedDivOptimization"
              type="checkbox"
              checked={tax.qualifiedDivOptimization}
              onChange={(e) => handleInputChange('qualifiedDivOptimization', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <label htmlFor="track19a" className="text-sm font-medium text-gray-700">
                Track 19a Statements
              </label>
              <p className="text-sm text-gray-500">
                Monitor qualified business income deductions
              </p>
            </div>
            <input
              id="track19a"
              type="checkbox"
              checked={tax.track19a}
              onChange={(e) => handleInputChange('track19a', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="taxLotMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Tax Lot Accounting Method
            </label>
            <select
              id="taxLotMethod"
              value={tax.taxLotMethod}
              onChange={(e) => handleInputChange('taxLotMethod', e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="FIFO">First In, First Out (FIFO)</option>
              <option value="LIFO">Last In, First Out (LIFO)</option>
              <option value="SpecificID">Specific Identification</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={validateAndSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Tax Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}