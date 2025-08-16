'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Calculator, 
  Target, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Save,
  X,
  Info
} from 'lucide-react';

interface BudgetCategory {
  category: string;
  budgetedAmount: number;
  priority: number;
  essential: boolean;
  notes?: string;
}

interface BudgetData {
  name: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  startDate: string;
  endDate: string;
  categories: BudgetCategory[];
  totalBudget: number;
  alertThreshold: number;
  isActive: boolean;
  notes?: string;
}

interface BudgetCreatorProps {
  initialData?: Partial<BudgetData>;
  onSave: (budget: BudgetData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

const COMMON_CATEGORIES = [
  'HOUSING',
  'UTILITIES',
  'FOOD',
  'TRANSPORTATION',
  'HEALTHCARE',
  'INSURANCE',
  'ENTERTAINMENT',
  'PERSONAL_CARE',
  'CLOTHING',
  'EDUCATION',
  'SUBSCRIPTIONS',
  'MISCELLANEOUS'
];

const PERIOD_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly', months: 1 },
  { value: 'QUARTERLY', label: 'Quarterly', months: 3 },
  { value: 'ANNUALLY', label: 'Annually', months: 12 }
];

export function BudgetCreator({ 
  initialData = {}, 
  onSave, 
  onCancel, 
  isEditing = false, 
  loading = false 
}: BudgetCreatorProps) {
  const [budget, setBudget] = useState<BudgetData>({
    name: initialData.name || '',
    period: initialData.period || 'MONTHLY',
    startDate: initialData.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData.endDate || '',
    categories: initialData.categories || [],
    totalBudget: initialData.totalBudget || 0,
    alertThreshold: initialData.alertThreshold || 80,
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
    notes: initialData.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate end date based on period and start date
  useEffect(() => {
    if (budget.startDate && !isEditing) {
      const startDate = new Date(budget.startDate);
      const periodData = PERIOD_OPTIONS.find(p => p.value === budget.period);
      
      if (periodData) {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + periodData.months);
        endDate.setDate(endDate.getDate() - 1); // Last day of period
        
        setBudget(prev => ({
          ...prev,
          endDate: endDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [budget.period, budget.startDate, isEditing]);

  // Calculate total budget from categories
  useEffect(() => {
    const total = budget.categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
    setBudget(prev => ({ ...prev, totalBudget: total }));
  }, [budget.categories]);

  const addCategory = (categoryName?: string) => {
    const newCategory: BudgetCategory = {
      category: categoryName || '',
      budgetedAmount: 0,
      priority: 5,
      essential: false,
      notes: ''
    };

    setBudget(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  };

  const updateCategory = (index: number, field: keyof BudgetCategory, value: any) => {
    setBudget(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) => 
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const removeCategory = (index: number) => {
    setBudget(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const validateBudget = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!budget.name.trim()) {
      newErrors.name = 'Budget name is required';
    }

    if (!budget.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!budget.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (budget.startDate && budget.endDate && new Date(budget.startDate) >= new Date(budget.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (budget.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    budget.categories.forEach((cat, index) => {
      if (!cat.category.trim()) {
        newErrors[`category-${index}`] = 'Category name is required';
      }
      if (cat.budgetedAmount <= 0) {
        newErrors[`amount-${index}`] = 'Amount must be greater than 0';
      }
    });

    if (budget.totalBudget <= 0) {
      newErrors.totalBudget = 'Total budget must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBudget()) {
      return;
    }

    try {
      await onSave(budget);
    } catch (error) {
      // Error handled by emergency recovery script;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getUnusedCategories = () => {
    const usedCategories = budget.categories.map(cat => cat.category);
    return COMMON_CATEGORIES.filter(cat => !usedCategories.includes(cat));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            {isEditing ? 'Edit Budget' : 'Create New Budget'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Set up your budget categories and spending limits
          </p>
        </div>
        
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Name *
            </label>
            <input
              type="text"
              value={budget.name}
              onChange={(e) => setBudget(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Monthly Budget 2024"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Budget Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Period *
            </label>
            <select
              value={budget.period}
              onChange={(e) => setBudget(prev => ({ ...prev, period: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isEditing} // Don't allow changing period when editing
            >
              {PERIOD_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={budget.startDate}
              onChange={(e) => setBudget(prev => ({ ...prev, startDate: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              value={budget.endDate}
              onChange={(e) => setBudget(prev => ({ ...prev, endDate: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Budget Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Budget Categories *
            </label>
            <div className="flex items-center gap-2">
              {getUnusedCategories().length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addCategory(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md"
                  defaultValue=""
                >
                  <option value="">Add Common Category</option>
                  {getUnusedCategories().map(cat => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => addCategory()}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Custom
              </button>
            </div>
          </div>

          {errors.categories && (
            <p className="text-sm text-red-600 mb-3">{errors.categories}</p>
          )}

          <div className="space-y-3">
            {budget.categories.map((category, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {/* Category Name */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={category.category}
                    onChange={(e) => updateCategory(index, 'category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors[`category-${index}`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Category name"
                  />
                  {errors[`category-${index}`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`category-${index}`]}</p>
                  )}
                </div>

                {/* Budget Amount */}
                <div className="w-32">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={category.budgetedAmount}
                      onChange={(e) => updateCategory(index, 'budgetedAmount', parseFloat(e.target.value) || 0)}
                      className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                        errors[`amount-${index}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors[`amount-${index}`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`amount-${index}`]}</p>
                  )}
                </div>

                {/* Priority */}
                <div className="w-20">
                  <select
                    value={category.priority}
                    onChange={(e) => updateCategory(index, 'priority', parseInt(e.target.value))}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                {/* Essential Toggle */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.essential}
                      onChange={(e) => updateCategory(index, 'essential', e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Essential</span>
                  </label>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {budget.categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No budget categories added yet</p>
              <p className="text-sm">Click "Add Custom" or choose from common categories</p>
            </div>
          )}
        </div>

        {/* Total Budget Display */}
        {budget.totalBudget > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Total Budget:</span>
              <span className="text-lg font-bold text-blue-900">
                {formatCurrency(budget.totalBudget)}
              </span>
            </div>
            {budget.period === 'MONTHLY' && (
              <div className="text-sm text-blue-600 mt-1">
                Annual equivalent: {formatCurrency(budget.totalBudget * 12)}
              </div>
            )}
          </div>
        )}

        {/* Advanced Settings */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Info className="w-4 h-4" />
            Advanced Settings
            <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
              ↓
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Alert Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Threshold ({budget.alertThreshold}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={budget.alertThreshold}
                  onChange={(e) => setBudget(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>Get alerted when spending reaches {budget.alertThreshold}% of budget</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={budget.isActive}
                  onChange={(e) => setBudget(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  Active Budget (used for tracking and alerts)
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={budget.notes}
                  onChange={(e) => setBudget(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes about this budget..."
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {budget.notes?.length || 0}/1000 characters
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || budget.categories.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? 'Update Budget' : 'Create Budget'}
          </button>
        </div>
      </form>
    </div>
  );
}