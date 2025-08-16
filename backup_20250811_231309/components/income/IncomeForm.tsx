'use client';

import React, { useState } from 'react';
import { DollarSign, Calendar, Briefcase, Tag, RotateCcw, FileText, TrendingUp } from 'lucide-react';
import { FormField, Input, Select, Button, Textarea, Toggle } from '../forms';
import { SelectOption } from '../forms/Select';

export interface IncomeFormData {
  source: string;
  category: 'SALARY' | 'DIVIDEND' | 'INTEREST' | 'CAPITAL_GAINS' | 'OTHER';
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  taxable: boolean;
  notes?: string;
  metadata?: string;
}

export interface IncomeFormProps {
  onSubmit: (data: IncomeFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<IncomeFormData>;
}

const incomeCategories: SelectOption[] = [
  { value: 'SALARY', label: 'Salary/Wages' },
  { value: 'DIVIDEND', label: 'Dividend Income' },
  { value: 'INTEREST', label: 'Interest Income' },
  { value: 'CAPITAL_GAINS', label: 'Capital Gains' },
  { value: 'OTHER', label: 'Other Income' }
];

const recurringFrequencies: SelectOption[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' }
];

export function IncomeForm({ onSubmit, onCancel, loading = false, initialData }: IncomeFormProps) {
  const [formData, setFormData] = useState<IncomeFormData>({
    source: initialData?.source || '',
    category: initialData?.category || 'DIVIDEND',
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    recurring: initialData?.recurring || false,
    frequency: initialData?.frequency || 'QUARTERLY',
    taxable: initialData?.taxable !== undefined ? initialData.taxable : true,
    notes: initialData?.notes || '',
    metadata: initialData?.metadata || ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof IncomeFormData, string>>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof IncomeFormData, string>> = {};
    
    if (!formData.source.trim()) {
      newErrors.source = 'Please enter an income source';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select an income category';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    if (formData.recurring && !formData.frequency) {
      newErrors.frequency = 'Please select frequency for recurring income';
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
        notes: formData.notes?.trim() || undefined,
        frequency: formData.recurring ? formData.frequency : undefined
      });
    } catch (error) {
      // Error handled by emergency recovery script;
  
  // Calculate monthly equivalent for recurring income
  const getMonthlyEquivalent = () => {
    if (!formData.recurring || formData.amount <= 0) return null;
    
    const multipliers = {
      MONTHLY: 1,
      QUARTERLY: 1/3,
      ANNUALLY: 1/12
    };
    
    const monthly = formData.amount * multipliers[formData.frequency || 'QUARTERLY'];
    return monthly;
  };

  // Calculate annual projection
  const getAnnualProjection = () => {
    if (!formData.recurring || formData.amount <= 0) return null;
    
    const multipliers = {
      MONTHLY: 12,
      QUARTERLY: 4,
      ANNUALLY: 1
    };
    
    const annual = formData.amount * multipliers[formData.frequency || 'QUARTERLY'];
    return annual;
  };
  
  const monthlyEquivalent = getMonthlyEquivalent();
  const annualProjection = getAnnualProjection();
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          {initialData ? 'Edit Income' : 'Add New Income'}
        </h2>
        <p className="text-sm text-gray-600">
          Track your income sources to calculate your true financial position
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source */}
          <FormField 
            label="Income Source" 
            required 
            error={errors.source}
            hint="Company, stock symbol, or description"
          >
            <Input
              type="text"
              placeholder="e.g., AAPL, Employer Name, Freelance"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              error={!!errors.source}
              leftIcon={<Briefcase className="w-5 h-5" />}
              maxLength={100}
            />
          </FormField>
          
          {/* Category */}
          <FormField 
            label="Category" 
            required 
            error={errors.category}
            hint="Type of income"
          >
            <Select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              options={incomeCategories}
              error={!!errors.category}
              leftIcon={<Tag className="w-5 h-5" />}
            />
          </FormField>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <FormField 
            label="Amount" 
            required 
            error={errors.amount}
            hint="Gross amount before taxes"
          >
            <Input
              type="number"
              placeholder="1000.00"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              error={!!errors.amount}
              leftIcon={<DollarSign className="w-5 h-5" />}
              variant="currency"
              min="0"
              step="0.01"
            />
          </FormField>
          
          {/* Date */}
          <FormField 
            label="Date" 
            required 
            error={errors.date}
          >
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              error={!!errors.date}
              leftIcon={<Calendar className="w-5 h-5" />}
            />
          </FormField>
        </div>
        
        {/* Notes */}
        <FormField 
          label="Notes" 
          hint="Optional details about this income"
        >
          <Textarea
            placeholder="Add any additional details..."
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            maxLength={500}
          />
        </FormField>
        
        {/* Taxable Toggle */}
        <FormField label="Tax Status">
          <Toggle
            checked={formData.taxable}
            onChange={(e) => setFormData(prev => ({ ...prev, taxable: e.target.checked }))}
            label="This income is taxable"
            description="Uncheck if this is tax-free income (e.g., municipal bonds, Roth distributions)"
          />
        </FormField>
        
        {/* Recurring Toggle */}
        <FormField label="Recurring Income">
          <Toggle
            checked={formData.recurring}
            onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
            label="This is recurring income"
            description="Enable if this income repeats regularly (salary, dividends, etc.)"
          />
        </FormField>
        
        {/* Recurring Frequency */}
        {formData.recurring && (
          <FormField 
            label="Frequency" 
            required
            error={errors.frequency}
            hint="How often does this income occur?"
          >
            <Select
              value={formData.frequency || 'QUARTERLY'}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
              options={recurringFrequencies}
              leftIcon={<RotateCcw className="w-5 h-5" />}
            />
          </FormField>
        )}
        
        {/* Projection Display */}
        {formData.recurring && formData.amount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-900 mb-2">
                  Income Projections
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {monthlyEquivalent && formData.frequency !== 'MONTHLY' && (
                    <div>
                      <span className="text-green-700">Monthly equivalent:</span>
                      <div className="font-semibold currency-display text-green-900">
                        ${monthlyEquivalent.toFixed(2)}/month
                      </div>
                    </div>
                  )}
                  {annualProjection && (
                    <div>
                      <span className="text-green-700">Annual projection:</span>
                      <div className="font-semibold currency-display text-green-900">
                        ${annualProjection.toFixed(2)}/year
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Based on current {formData.frequency?.toLowerCase()} frequency
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tax Status Info */}
        {!formData.taxable && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Tax-Free Income
                </h4>
                <p className="text-sm text-blue-700">
                  This income will not be included in tax calculations. Make sure this is 
                  truly tax-free income like municipal bond interest or Roth distributions.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="sm:flex-1"
          >
            {initialData ? 'Update Income' : 'Add Income'}
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