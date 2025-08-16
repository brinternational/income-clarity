'use client';

import React, { useState } from 'react';
import { User, MapPin, DollarSign, Target, Percent, Building2, Shield } from 'lucide-react';
import { FormField, Input, Select, Button } from '../index';
import { SelectOption } from '../Select';
import { RiskToleranceSlider, RiskLevel } from '../../profile/RiskToleranceSlider';
import { ExperienceSelector, ExperienceLevel } from '../../profile/ExperienceSelector';

export interface ProfileSetupData {
  fullName: string;
  email: string;
  location: {
    country: 'US' | 'PR';
    state: string;
  };
  taxInfo: {
    filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
    federalRate: number;
    stateRate: number;
    capitalGainsRate: number;
  };
  goals: {
    monthlyExpenses: number;
    targetCoverage: number;
    stressFreeLiving: number;
    retirementAge?: number;
  };
  riskProfile: {
    riskTolerance: number; // 0-100 scale
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    investmentExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
}

export interface ProfileSetupFormProps {
  onSubmit: (data: ProfileSetupData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<ProfileSetupData>;
}

const usStates: SelectOption[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const countryOptions: SelectOption[] = [
  { value: 'US', label: 'United States' },
  { value: 'PR', label: 'Puerto Rico' }
];

const filingStatusOptions: SelectOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'married_joint', label: 'Married Filing Jointly' },
  { value: 'married_separate', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' }
];

// Tax rate suggestions based on common brackets
const getTaxRateSuggestions = (country: string, state: string, filingStatus: string) => {
  if (country === 'PR') {
    return {
      federal: 0,
      state: 0,
      capitalGains: 0,
      note: 'Puerto Rico residents enjoy 0% tax on qualified dividends and capital gains!'
    };
  }
  
  // Simplified federal rates (2024 approximation)
  const federalRates = {
    single: 22,
    married_joint: 22,
    married_separate: 22,
    head_of_household: 22
  };
  
  // High-tax states (simplified)
  const highTaxStates = ['CA', 'NY', 'NJ', 'CT', 'MA', 'OR', 'MN'];
  const mediumTaxStates = ['IL', 'VA', 'MD', 'GA', 'CO', 'UT', 'ND'];
  
  let stateRate = 0;
  if (highTaxStates.includes(state)) {
    stateRate = state === 'CA' ? 13.3 : 8;
  } else if (mediumTaxStates.includes(state)) {
    stateRate = 5;
  }
  
  return {
    federal: federalRates[filingStatus as keyof typeof federalRates] || 22,
    state: stateRate,
    capitalGains: 15, // Most common rate
    note: stateRate === 0 ? `${state} has no state income tax!` : undefined
  };
};

export function ProfileSetupForm({ onSubmit, onCancel, loading = false, initialData }: ProfileSetupFormProps) {
  const [formData, setFormData] = useState<ProfileSetupData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    location: {
      country: initialData?.location?.country || 'US',
      state: initialData?.location?.state || ''
    },
    taxInfo: {
      filingStatus: initialData?.taxInfo?.filingStatus || 'single',
      federalRate: initialData?.taxInfo?.federalRate || 22,
      stateRate: initialData?.taxInfo?.stateRate || 0,
      capitalGainsRate: initialData?.taxInfo?.capitalGainsRate || 15
    },
    goals: {
      monthlyExpenses: initialData?.goals?.monthlyExpenses || 3800,
      targetCoverage: initialData?.goals?.targetCoverage || 1.0,
      stressFreeLiving: initialData?.goals?.stressFreeLiving || 5000,
      retirementAge: initialData?.goals?.retirementAge || undefined
    },
    riskProfile: {
      riskTolerance: initialData?.riskProfile?.riskTolerance || 50,
      riskLevel: initialData?.riskProfile?.riskLevel || 'moderate',
      investmentExperience: initialData?.riskProfile?.investmentExperience || 'intermediate'
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1: // Personal Info
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
        
      case 2: // Location
        if (!formData.location.country) {
          newErrors.country = 'Please select your country';
        }
        if (formData.location.country === 'US' && !formData.location.state) {
          newErrors.state = 'Please select your state';
        }
        break;
        
      case 3: // Tax Info
        if (!formData.taxInfo.filingStatus) {
          newErrors.filingStatus = 'Please select your filing status';
        }
        if (formData.taxInfo.federalRate < 0 || formData.taxInfo.federalRate > 50) {
          newErrors.federalRate = 'Federal tax rate must be between 0% and 50%';
        }
        if (formData.taxInfo.stateRate < 0 || formData.taxInfo.stateRate > 20) {
          newErrors.stateRate = 'State tax rate must be between 0% and 20%';
        }
        break;
        
      case 4: // Goals
        if (formData.goals.monthlyExpenses <= 0) {
          newErrors.monthlyExpenses = 'Monthly expenses must be greater than 0';
        }
        if (formData.goals.targetCoverage <= 0 || formData.goals.targetCoverage > 5) {
          newErrors.targetCoverage = 'Target coverage must be between 0 and 5';
        }
        if (formData.goals.stressFreeLiving <= 0) {
          newErrors.stressFreeLiving = 'Stress-free living amount must be greater than 0';
        }
        break;
        
      case 5: // Risk Profile
        if (formData.riskProfile.riskTolerance < 0 || formData.riskProfile.riskTolerance > 100) {
          newErrors.riskTolerance = 'Risk tolerance must be between 0 and 100';
        }
        if (!formData.riskProfile.riskLevel) {
          newErrors.riskLevel = 'Please select a risk level';
        }
        if (!formData.riskProfile.investmentExperience) {
          newErrors.investmentExperience = 'Please select your investment experience level';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    try {
      await onSubmit({
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase()
      });
    } catch (error) {
      // Error handled by emergency recovery script;
  
  // Auto-update tax rates when location changes
  React.useEffect(() => {
    const suggestions = getTaxRateSuggestions(
      formData.location.country, 
      formData.location.state, 
      formData.taxInfo.filingStatus
    );
    
    setFormData(prev => ({
      ...prev,
      taxInfo: {
        ...prev.taxInfo,
        federalRate: suggestions.federal,
        stateRate: suggestions.state,
        capitalGainsRate: suggestions.capitalGains
      }
    }));
  }, [formData.location.country, formData.location.state, formData.taxInfo.filingStatus]);
  
  const taxSuggestions = getTaxRateSuggestions(
    formData.location.country, 
    formData.location.state, 
    formData.taxInfo.filingStatus
  );
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Profile Setup
          </h2>
          <span className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Personal Information
              </h3>
              <p className="text-sm text-gray-600">
                Let's start with your basic information
              </p>
            </div>
            
            <FormField 
              label="Full Name" 
              required 
              error={errors.fullName}
            >
              <Input
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                error={!!errors.fullName}
                leftIcon={<User className="w-5 h-5" />}
              />
            </FormField>
            
            <FormField 
              label="Email Address" 
              required 
              error={errors.email}
            >
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={!!errors.email}
                leftIcon={<User className="w-5 h-5" />}
              />
            </FormField>
          </div>
        )}
        
        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location Information
              </h3>
              <p className="text-sm text-gray-600">
                We need your location to calculate accurate tax rates
              </p>
            </div>
            
            <FormField 
              label="Country" 
              required 
              error={errors.country}
            >
              <Select
                value={formData.location.country}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, country: e.target.value as any, state: '' }
                }))}
                options={countryOptions}
                leftIcon={<MapPin className="w-5 h-5" />}
              />
            </FormField>
            
            {formData.location.country === 'US' && (
              <FormField 
                label="State" 
                required 
                error={errors.state}
              >
                <Select
                  value={formData.location.state}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, state: e.target.value }
                  }))}
                  options={usStates}
                  placeholder="Select your state"
                  leftIcon={<Building2 className="w-5 h-5" />}
                />
              </FormField>
            )}
            
            {formData.location.country === 'PR' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <h4 className="text-sm font-medium text-green-900">
                    Puerto Rico Tax Advantage!
                  </h4>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  As a Puerto Rico resident, you enjoy 0% tax on qualified dividends and capital gains - 
                  a huge advantage for dividend income investors!
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Step 3: Tax Information */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Percent className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tax Information
              </h3>
              <p className="text-sm text-gray-600">
                We've pre-filled typical rates for your location
              </p>
            </div>
            
            <FormField 
              label="Filing Status" 
              required 
              error={errors.filingStatus}
            >
              <Select
                value={formData.taxInfo.filingStatus}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  taxInfo: { ...prev.taxInfo, filingStatus: e.target.value as any }
                }))}
                options={filingStatusOptions}
              />
            </FormField>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField 
                label="Federal Tax Rate" 
                required 
                error={errors.federalRate}
                hint="%"
              >
                <Input
                  type="number"
                  value={formData.taxInfo.federalRate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    taxInfo: { ...prev.taxInfo, federalRate: parseFloat(e.target.value) || 0 }
                  }))}
                  error={!!errors.federalRate}
                  variant="number"
                  min="0"
                  max="50"
                  step="0.1"
                />
              </FormField>
              
              <FormField 
                label="State Tax Rate" 
                required 
                error={errors.stateRate}
                hint="%"
              >
                <Input
                  type="number"
                  value={formData.taxInfo.stateRate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    taxInfo: { ...prev.taxInfo, stateRate: parseFloat(e.target.value) || 0 }
                  }))}
                  error={!!errors.stateRate}
                  variant="number"
                  min="0"
                  max="20"
                  step="0.1"
                />
              </FormField>
              
              <FormField 
                label="Capital Gains Rate" 
                required 
                error={errors.capitalGainsRate}
                hint="%"
              >
                <Input
                  type="number"
                  value={formData.taxInfo.capitalGainsRate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    taxInfo: { ...prev.taxInfo, capitalGainsRate: parseFloat(e.target.value) || 0 }
                  }))}
                  error={!!errors.capitalGainsRate}
                  variant="number"
                  min="0"
                  max="50"
                  step="0.1"
                />
              </FormField>
            </div>
            
            {taxSuggestions.note && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  💡 {taxSuggestions.note}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Step 4: Financial Goals */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Financial Goals
              </h3>
              <p className="text-sm text-gray-600">
                Set your targets for income clarity calculations
              </p>
            </div>
            
            <FormField 
              label="Monthly Expenses" 
              required 
              error={errors.monthlyExpenses}
              hint="Your current total monthly expenses"
            >
              <Input
                type="number"
                placeholder="3800"
                value={formData.goals.monthlyExpenses}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  goals: { ...prev.goals, monthlyExpenses: parseFloat(e.target.value) || 0 }
                }))}
                error={!!errors.monthlyExpenses}
                leftIcon={<DollarSign className="w-5 h-5" />}
                variant="currency"
                min="0"
                step="50"
              />
            </FormField>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField 
                label="Target Coverage" 
                required 
                error={errors.targetCoverage}
                hint="1.0 = 100% expense coverage"
              >
                <Input
                  type="number"
                  placeholder="1.0"
                  value={formData.goals.targetCoverage}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    goals: { ...prev.goals, targetCoverage: parseFloat(e.target.value) || 0 }
                  }))}
                  error={!!errors.targetCoverage}
                  variant="number"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </FormField>
              
              <FormField 
                label="Stress-Free Living" 
                required 
                error={errors.stressFreeLiving}
                hint="Monthly income for complete peace of mind"
              >
                <Input
                  type="number"
                  placeholder="5000"
                  value={formData.goals.stressFreeLiving}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    goals: { ...prev.goals, stressFreeLiving: parseFloat(e.target.value) || 0 }
                  }))}
                  error={!!errors.stressFreeLiving}
                  leftIcon={<DollarSign className="w-5 h-5" />}
                  variant="currency"
                  min="0"
                  step="100"
                />
              </FormField>
            </div>
            
            <FormField 
              label="Target Retirement Age" 
              hint="Optional - helps with long-term planning"
            >
              <Input
                type="number"
                placeholder="65"
                value={formData.goals.retirementAge || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  goals: { ...prev.goals, retirementAge: e.target.value ? parseInt(e.target.value) : undefined }
                }))}
                variant="number"
                min="40"
                max="80"
                step="1"
              />
            </FormField>
          </div>
        )}
        
        {/* Step 5: Risk Profile */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Risk & Experience Profile
              </h3>
              <p className="text-sm text-gray-600">
                Help us personalize your investment recommendations
              </p>
            </div>
            
            <div className="space-y-8">
              {/* Risk Tolerance Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Risk Tolerance Level
                </label>
                <RiskToleranceSlider
                  value={formData.riskProfile.riskTolerance}
                  onChange={(value: number, level: RiskLevel) => {
                    setFormData(prev => ({
                      ...prev,
                      riskProfile: {
                        ...prev.riskProfile,
                        riskTolerance: value,
                        riskLevel: level
                      }
                    }));
                  }}
                  disabled={loading}
                />
                {errors.riskTolerance && (
                  <p className="mt-1 text-sm text-red-600">{errors.riskTolerance}</p>
                )}
              </div>

              {/* Investment Experience Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Investment Experience Level
                </label>
                <ExperienceSelector
                  value={formData.riskProfile.investmentExperience}
                  onChange={(level: ExperienceLevel) => {
                    setFormData(prev => ({
                      ...prev,
                      riskProfile: {
                        ...prev.riskProfile,
                        investmentExperience: level
                      }
                    }));
                  }}
                  disabled={loading}
                />
                {errors.investmentExperience && (
                  <p className="mt-1 text-sm text-red-600">{errors.investmentExperience}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handlePrevious}
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              loading={loading}
            >
              Complete Setup
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
