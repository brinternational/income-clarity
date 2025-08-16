'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseFormData {
  amount: string;
  category: string;
  merchant: string;
  date: string;
  description: string;
  isRecurring: boolean;
  recurringFrequency: string;
  isEssential: boolean;
  priority: number;
}

interface ExpenseFormProps {
  expense?: any;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
}

const EXPENSE_CATEGORIES = [
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'FOOD', label: 'Food & Groceries' },
  { value: 'RENT', label: 'Rent/Mortgage' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'OTHER', label: 'Other' },
];

const RECURRING_FREQUENCIES = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
];

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    category: 'FOOD',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    recurringFrequency: 'MONTHLY',
    isEssential: true,
    priority: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        merchant: expense.merchant || '',
        date: expense.date.split('T')[0],
        description: expense.notes || '',
        isRecurring: expense.recurring,
        recurringFrequency: expense.frequency || 'MONTHLY',
        isEssential: expense.essential,
        priority: expense.priority,
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!formData.date) {
        throw new Error('Date is required');
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ExpenseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{expense ? 'Edit Expense' : 'Add Expense'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Merchant/Vendor
              </label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => handleChange('merchant', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Walmart, Netflix"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Optional notes..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isEssential"
                  checked={formData.isEssential}
                  onChange={(e) => handleChange('isEssential', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isEssential" className="text-sm font-medium">
                  This is an essential expense
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => handleChange('isRecurring', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium">
                  This is a recurring expense
                </label>
              </div>
            </div>

            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency
                </label>
                <select
                  value={formData.recurringFrequency}
                  onChange={(e) => handleChange('recurringFrequency', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {RECURRING_FREQUENCIES.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Priority (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span className="font-bold text-sm">{formData.priority}</span>
                <span>High</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}