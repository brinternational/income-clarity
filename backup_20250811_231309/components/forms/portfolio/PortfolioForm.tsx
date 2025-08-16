'use client';

import React, { useState } from 'react';
import { Briefcase, Building, CheckCircle } from 'lucide-react';
import { FormField, Input, Button, Select } from '../index';

export interface PortfolioFormData {
  name: string;
  type: '401k' | 'IRA' | 'Taxable' | 'Crypto';
  institution?: string;
  isPrimary: boolean;
}

export interface PortfolioFormProps {
  onSubmit: (data: PortfolioFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<PortfolioFormData>;
}

export function PortfolioForm({ onSubmit, onCancel, loading = false, initialData }: PortfolioFormProps) {
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'Taxable',
    institution: initialData?.institution || '',
    isPrimary: initialData?.isPrimary || false
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof PortfolioFormData, string>>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PortfolioFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Portfolio name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Portfolio name must be less than 100 characters';
    }
    
    if (!formData.type) {
      newErrors.type = 'Portfolio type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        institution: formData.institution?.trim() || undefined
      });
    } catch (error) {
      // Error handled by emergency recovery script;
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {initialData ? 'Edit Portfolio' : 'Create New Portfolio'}
        </h2>
        <p className="text-sm text-gray-600">
          Set up your dividend income portfolio with clear goals and strategy
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Portfolio Name */}
        <FormField 
          label="Portfolio Name" 
          required 
          error={errors.name}
          hint="Give your portfolio a memorable name"
        >
          <Input
            placeholder="My Dividend Portfolio"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={!!errors.name}
            leftIcon={<Briefcase className="w-5 h-5" />}
            maxLength={100}
          />
        </FormField>
        
        {/* Portfolio Type */}
        <FormField 
          label="Portfolio Type" 
          required 
          error={errors.type}
          hint="Select the type of investment account"
        >
          <Select
            value={formData.type}
            onChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
            error={!!errors.type}
            options={[
              { value: 'Taxable', label: 'Taxable Account', description: 'Regular brokerage account' },
              { value: '401k', label: '401(k)', description: 'Employer-sponsored retirement account' },
              { value: 'IRA', label: 'IRA', description: 'Individual Retirement Account' },
              { value: 'Crypto', label: 'Crypto', description: 'Cryptocurrency holdings' }
            ]}
          />
        </FormField>
        
        {/* Institution */}
        <FormField 
          label="Institution" 
          hint="Optional: Brokerage or financial institution"
        >
          <Input
            placeholder="e.g., Schwab, Fidelity, Vanguard"
            value={formData.institution || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
            leftIcon={<Building className="w-5 h-5" />}
            maxLength={100}
          />
        </FormField>
        
        {/* Primary Portfolio */}
        <FormField 
          label="Primary Portfolio" 
          hint="Mark this as your main portfolio for dashboard display"
        >
          <div className="flex items-center space-x-3">
            <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
              formData.isPrimary
                ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="checkbox"
                checked={formData.isPrimary}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-5 h-5 ${formData.isPrimary ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Set as Primary Portfolio
                  </span>
                  <p className="text-xs text-gray-600">
                    This portfolio will be featured on your main dashboard
                  </p>
                </div>
              </div>
            </label>
          </div>
        </FormField>
        
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="sm:flex-1"
          >
            {initialData ? 'Update Portfolio' : 'Create Portfolio'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              fullWidth
              className="sm:flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
