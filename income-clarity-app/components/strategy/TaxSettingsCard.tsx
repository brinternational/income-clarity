'use client';

import React, { useState } from 'react';
import { Settings, MapPin, Users, Calculator, Save } from 'lucide-react';

interface TaxSettings {
  state: string;
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
  federalBracket: string;
  dependents: number;
  itemizedDeductions: boolean;
  estimatedDeductions: number;
}

interface TaxSettingsCardProps {
  settings?: TaxSettings;
  onSave?: (settings: TaxSettings) => void;
  className?: string;
}

export function TaxSettingsCard({ 
  settings = {
    state: 'CA',
    filingStatus: 'single',
    federalBracket: '22%',
    dependents: 0,
    itemizedDeductions: false,
    estimatedDeductions: 12950
  },
  onSave,
  className = ''
}: TaxSettingsCardProps) {

  const [formData, setFormData] = useState<TaxSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const stateOptions = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'FL', name: 'Florida' },
    { code: 'TX', name: 'Texas' },
    { code: 'NY', name: 'New York' },
    { code: 'PR', name: 'Puerto Rico' }
  ];

  const filingStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married_jointly', label: 'Married Filing Jointly' },
    { value: 'married_separately', label: 'Married Filing Separately' },
    { value: 'head_of_household', label: 'Head of Household' }
  ];

  const federalBrackets = [
    '10%', '12%', '22%', '24%', '32%', '35%', '37%'
  ];

  const handleInputChange = (field: keyof TaxSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setHasChanges(false);
  };

  const getStateTaxRate = (stateCode: string) => {
    const taxRates: { [key: string]: number } = {
      'CA': 9.3, 'NY': 8.82, 'NJ': 8.97, 'HI': 8.25,
      'OR': 8.75, 'MN': 9.85, 'DC': 8.95, 'VT': 8.75,
      'TX': 0, 'FL': 0, 'WA': 0, 'NV': 0, 'WY': 0, 'SD': 0, 'TN': 0, 'PR': 0
    };
    return taxRates[stateCode] || 5.0; // Default rate for other states
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Settings className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-foreground">Tax Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground">Configure your tax profile for accurate calculations</p>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center mb-3">
            <MapPin className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="font-semibold text-foreground">Location</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-2">
                State of Residence
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {stateOptions.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span>State tax rate:</span>
                <span className="font-semibold">{getStateTaxRate(formData.state)}%</span>
              </div>
              {getStateTaxRate(formData.state) === 0 && (
                <div className="text-prosperity-600 text-xs mt-1">
                  No state income tax! 🎉
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filing Status */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center mb-3">
            <Users className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="font-semibold text-foreground">Filing Status</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-2">
                Filing Status
              </label>
              <select
                value={formData.filingStatus}
                onChange={(e) => handleInputChange('filingStatus', e.target.value as TaxSettings['filingStatus'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {filingStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-2">
                Number of Dependents
              </label>
              <input
                type="number"
                value={formData.dependents}
                onChange={(e) => handleInputChange('dependents', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="0"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* Tax Brackets & Deductions */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center mb-3">
            <Calculator className="w-5 h-5 text-primary-600 mr-2" />
            <h4 className="font-semibold text-foreground">Tax Brackets & Deductions</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-2">
                Federal Tax Bracket
              </label>
              <select
                value={formData.federalBracket}
                onChange={(e) => handleInputChange('federalBracket', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {federalBrackets.map(bracket => (
                  <option key={bracket} value={bracket}>{bracket} Tax Bracket</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="itemized-deductions"
                  checked={formData.itemizedDeductions}
                  onChange={(e) => handleInputChange('itemizedDeductions', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <label htmlFor="itemized-deductions" className="ml-2 block text-sm text-foreground/90">
                  I itemize deductions
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-2">
                  {formData.itemizedDeductions ? 'Estimated Itemized Deductions' : 'Standard Deduction'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={formData.estimatedDeductions}
                    onChange={(e) => handleInputChange('estimatedDeductions', parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={!formData.itemizedDeductions}
                    step="100"
                  />
                </div>
                {!formData.itemizedDeductions && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Standard deduction for {formData.filingStatus.replace('_', ' ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              hasChanges 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-slate-300 text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {hasChanges ? 'Save Settings' : 'Settings Saved'}
          </button>
        </div>

        {/* Current Summary */}
        <div className="bg-slate-50 rounded-lg p-4 border">
          <h4 className="font-semibold text-foreground mb-3">Current Settings Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">State:</span> 
              <span className="font-semibold ml-2">{stateOptions.find(s => s.code === formData.state)?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Filing Status:</span> 
              <span className="font-semibold ml-2">{filingStatusOptions.find(f => f.value === formData.filingStatus)?.label}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Federal Bracket:</span> 
              <span className="font-semibold ml-2">{formData.federalBracket}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Dependents:</span> 
              <span className="font-semibold ml-2">{formData.dependents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}