'use client';

import React, { useState } from 'react';
import { DollarSign, Calendar, Receipt, Tag, RotateCcw, Store, Star } from 'lucide-react';
import { FormField, Input, Select, Button, Textarea, Toggle } from '../index';
import { SelectOption } from '../Select';

export interface ExpenseFormData {
  category: string;
  merchant?: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  priority: number;
  essential: boolean;
  notes?: string;
  metadata?: string;
}

export interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<ExpenseFormData>;
}

const expenseCategories: SelectOption[] = [
  { value: 'UTILITIES', label: '🔌 Utilities (Electric, Water, Gas)' },
  { value: 'INSURANCE', label: '🛡️ Insurance (Health, Auto, Home)' },
  { value: 'FOOD', label: '🍔 Food & Groceries' },
  { value: 'RENT', label: '🏠 Rent/Mortgage' },
  { value: 'ENTERTAINMENT', label: '🎮 Entertainment & Recreation' },
  { value: 'TRANSPORTATION', label: '🚗 Transportation' },
  { value: 'HEALTHCARE', label: '🏥 Healthcare & Medical' },
  { value: 'EDUCATION', label: '📚 Education & Learning' },
  { value: 'SUBSCRIPTIONS', label: '💳 Subscriptions & Memberships' },
  { value: 'CLOTHING', label: '👕 Clothing & Personal Care' },
  { value: 'TRAVEL', label: '✈️ Travel & Vacation' },
  { value: 'SAVINGS', label: '💰 Savings & Investments' },
  { value: 'MISCELLANEOUS', label: '📦 Miscellaneous' }
];

const recurringFrequencies: SelectOption[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' }
];

const priorityOptions: SelectOption[] = [
  { value: '10', label: '10 - Critical (Must have)' },
  { value: '9', label: '9 - Very High' },
  { value: '8', label: '8 - High' },
  { value: '7', label: '7 - Important' },
  { value: '6', label: '6 - Above Average' },
  { value: '5', label: '5 - Average' },
  { value: '4', label: '4 - Below Average' },
  { value: '3', label: '3 - Low' },
  { value: '2', label: '2 - Very Low' },
  { value: '1', label: '1 - Optional (Nice to have)' }
];

export function ExpenseForm({ onSubmit, onCancel, loading = false, initialData }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: initialData?.category || '',
    merchant: initialData?.merchant || '',
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    recurring: initialData?.recurring || false,
    frequency: initialData?.frequency || 'MONTHLY',
    priority: initialData?.priority || 5,
    essential: initialData?.essential !== undefined ? initialData.essential : true,
    notes: initialData?.notes || '',
    metadata: initialData?.metadata || ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {};
    
    if (!formData.category) {
      newErrors.category = 'Please select an expense category';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10';
    }
    
    if (formData.recurring && !formData.frequency) {
      newErrors.frequency = 'Please select frequency for recurring expenses';
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
        merchant: formData.merchant?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        frequency: formData.recurring ? formData.frequency : undefined
      });
    } catch (error) {
      // Error handled by emergency recovery script
    }
  };
  
  // Calculate monthly equivalent for recurring expenses
  const getMonthlyEquivalent = () => {
    if (!formData.recurring || formData.amount <= 0) return null;
    
    const multipliers = {
      MONTHLY: 1,
      QUARTERLY: 1/3,
      ANNUALLY: 1/12
    };
    
    const monthly = formData.amount * multipliers[formData.frequency || 'MONTHLY'];
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
    
    const annual = formData.amount * multipliers[formData.frequency || 'MONTHLY'];
    return annual;
  };
  
  const monthlyEquivalent = getMonthlyEquivalent();
  const annualProjection = getAnnualProjection();
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-red-600" />
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        <p className="text-sm text-gray-600">
          Track your expenses to calculate your true income clarity
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <FormField 
            label="Category" 
            required 
            error={errors.category}
            hint="What type of expense is this?"
          >
            <Select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              options={expenseCategories}
              placeholder="Select expense category"
              error={!!errors.category}
              leftIcon={<Tag className="w-5 h-5" />}
            />
          </FormField>

          {/* Merchant */}
          <FormField 
            label="Merchant/Payee" 
            error={errors.merchant}
            hint="Where did you spend this money?"
          >
            <Input
              type="text"
              placeholder="e.g., Amazon, Electric Company"
              value={formData.merchant || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
              error={!!errors.merchant}
              leftIcon={<Store className="w-5 h-5" />}
              maxLength={100}
            />
          </FormField>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <FormField 
            label="Amount" 
            required 
            error={errors.amount}
          >
            <Input
              type="number"
              placeholder="100.00"
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

        {/* Priority */}
        <FormField 
          label="Priority Level" 
          error={errors.priority}
          hint="How important is this expense? (10 = Critical, 1 = Optional)"
        >
          <Select
            value={formData.priority.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
            options={priorityOptions}
            leftIcon={<Star className="w-5 h-5" />}
          />
        </FormField>
        
        {/* Notes */}
        <FormField 
          label="Notes" 
          hint="Optional details about this expense"
        >
          <Textarea
            placeholder="Add details about this expense..."
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            maxLength={500}
          />
        </FormField>

        {/* Essential Toggle */}
        <FormField label="Expense Type">
          <Toggle
            checked={formData.essential}
            onChange={(e) => setFormData(prev => ({ ...prev, essential: e.target.checked }))}
            label="This is an essential expense"
            description="Essential expenses are needs vs wants (rent, food, utilities vs entertainment)"
          />
        </FormField>
        
        {/* Recurring Toggle */}
        <FormField label="Recurring Expense">
          <Toggle
            checked={formData.recurring}
            onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
            label="This is a recurring expense"
            description="Enable if this expense repeats regularly"
          />
        </FormField>
        
        {/* Recurring Frequency */}
        {formData.recurring && (
          <FormField 
            label="Frequency" 
            required
            error={errors.frequency}
            hint="How often does this expense occur?"
          >
            <Select
              value={formData.frequency || 'MONTHLY'}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
              options={recurringFrequencies}
              leftIcon={<RotateCcw className="w-5 h-5" />}
            />
          </FormField>
        )}
        
        {/* Projections Display */}
        {formData.recurring && formData.amount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Receipt className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900 mb-2">
                  Expense Projections
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {monthlyEquivalent && formData.frequency !== 'MONTHLY' && (
                    <div>
                      <span className="text-red-700">Monthly equivalent:</span>
                      <div className="font-semibold currency-display text-red-900">
                        ${monthlyEquivalent.toFixed(2)}/month
                      </div>
                    </div>
                  )}
                  {annualProjection && (
                    <div>
                      <span className="text-red-700">Annual projection:</span>
                      <div className="font-semibold currency-display text-red-900">
                        ${annualProjection.toFixed(2)}/year
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-red-600 mt-2">
                  Based on current {formData.frequency?.toLowerCase()} frequency
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
            {initialData ? 'Update Expense' : 'Add Expense'}
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
