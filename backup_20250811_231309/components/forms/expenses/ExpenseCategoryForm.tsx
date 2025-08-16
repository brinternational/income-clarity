'use client';

import React, { useState } from 'react';
import { Target, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { FormField, Input, Button, Select } from '../index';
import { SelectOption } from '../Select';

export interface ExpenseCategoryData {
  name: string;
  monthlyBudget: number;
  priority: 'essential' | 'important' | 'optional';
  icon?: string;
  color?: string;
}

export interface ExpenseCategoryFormProps {
  onSubmit: (data: ExpenseCategoryData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<ExpenseCategoryData>;
}

const priorityOptions: SelectOption[] = [
  { value: 'essential', label: 'Essential (Must Pay)' },
  { value: 'important', label: 'Important (Should Pay)' },
  { value: 'optional', label: 'Optional (Nice to Have)' }
];

const colorOptions: SelectOption[] = [
  { value: 'red', label: 'Red (Essential)' },
  { value: 'yellow', label: 'Yellow (Important)' },
  { value: 'green', label: 'Green (Optional)' },
  { value: 'blue', label: 'Blue (General)' },
  { value: 'purple', label: 'Purple (Personal)' },
  { value: 'gray', label: 'Gray (Other)' }
];

export function ExpenseCategoryForm({ onSubmit, onCancel, loading = false, initialData }: ExpenseCategoryFormProps) {
  const [formData, setFormData] = useState<ExpenseCategoryData>({
    name: initialData?.name || '',
    monthlyBudget: initialData?.monthlyBudget || 0,
    priority: initialData?.priority || 'important',
    icon: initialData?.icon || '',
    color: initialData?.color || 'blue'
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseCategoryData, string>>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExpenseCategoryData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }
    
    if (formData.monthlyBudget <= 0) {
      newErrors.monthlyBudget = 'Monthly budget must be greater than 0';
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
        icon: formData.icon?.trim() || undefined,
        color: formData.color || 'blue'
      });
    } catch (error) {
      // Error handled by emergency recovery script;
  
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'essential':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          description: 'Critical expenses that must be paid (rent, utilities, insurance)',
          color: 'text-red-600'
        };
      case 'important':
        return {
          icon: <TrendingUp className="w-5 h-5 text-yellow-600" />,
          description: 'Important expenses that significantly impact quality of life',
          color: 'text-yellow-600'
        };
      case 'optional':
        return {
          icon: <Target className="w-5 h-5 text-green-600" />,
          description: 'Discretionary spending that can be adjusted if needed',
          color: 'text-green-600'
        };
      default:
        return {
          icon: <Target className="w-5 h-5 text-gray-600" />,
          description: '',
          color: 'text-gray-600'
        };
    }
  };
  
  const priorityInfo = getPriorityInfo(formData.priority);
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {initialData ? 'Edit Expense Category' : 'Create Expense Category'}
        </h2>
        <p className="text-sm text-gray-600">
          Set up a budget category to organize and track your expenses
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <FormField 
          label="Category Name" 
          required 
          error={errors.name}
          hint="e.g., Groceries, Utilities, Entertainment"
        >
          <Input
            placeholder="Enter category name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={!!errors.name}
            maxLength={50}
          />
        </FormField>
        
        {/* Monthly Budget */}
        <FormField 
          label="Monthly Budget" 
          required 
          error={errors.monthlyBudget}
          hint="How much do you typically spend in this category per month?"
        >
          <Input
            type="number"
            placeholder="500.00"
            value={formData.monthlyBudget || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, monthlyBudget: parseFloat(e.target.value) || 0 }))}
            error={!!errors.monthlyBudget}
            leftIcon={<DollarSign className="w-5 h-5" />}
            variant="currency"
            min="0"
            step="0.01"
          />
        </FormField>
        
        {/* Priority Level */}
        <FormField 
          label="Priority Level" 
          required
          hint="How important is this expense category?"
        >
          <Select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
            options={priorityOptions}
            leftIcon={priorityInfo.icon}
          />
          
          <div className={`mt-2 p-3 bg-gray-50 rounded-lg border-l-4 border-l-${formData.priority === 'essential' ? 'red' : formData.priority === 'important' ? 'yellow' : 'green'}-400`}>
            <p className={`text-sm ${priorityInfo.color}`}>
              {priorityInfo.description}
            </p>
          </div>
        </FormField>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Icon (Optional) */}
          <FormField 
            label="Icon" 
            hint="Optional emoji or symbol"
          >
            <Input
              placeholder="💰 🏠 🍔"
              value={formData.icon || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              maxLength={10}
            />
          </FormField>
          
          {/* Color */}
          <FormField 
            label="Color Theme" 
            hint="Visual identifier for charts"
          >
            <Select
              value={formData.color || 'blue'}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              options={colorOptions}
            />
          </FormField>
        </div>
        
        {/* Priority-based recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Category Priority Guidelines
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span><strong>Essential:</strong> Rent, utilities, minimum debt payments, insurance</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                  <span><strong>Important:</strong> Groceries, transportation, healthcare, education</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span><strong>Optional:</strong> Dining out, entertainment, hobbies, luxury items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="sm:flex-1"
          >
            {initialData ? 'Update Category' : 'Create Category'}
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
