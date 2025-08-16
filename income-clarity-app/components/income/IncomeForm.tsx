'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IncomeFormData {
  amount: string;
  category: string;
  source: string;
  date: string;
  description: string;
  isRecurring: boolean;
  recurringFrequency: string;
  taxWithheld: string;
}

interface IncomeFormProps {
  income?: any;
  onSubmit: (data: IncomeFormData) => Promise<void>;
  onCancel: () => void;
}

const INCOME_CATEGORIES = [
  { value: 'DIVIDEND', label: 'Dividend Income' },
  { value: 'SALARY', label: 'Salary/Wages' },
  { value: 'INTEREST', label: 'Interest Income' },
  { value: 'RENTAL', label: 'Rental Income' },
  { value: 'BUSINESS', label: 'Business Income' },
  { value: 'OTHER', label: 'Other Income' },
];

const RECURRING_FREQUENCIES = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
];

export function IncomeForm({ income, onSubmit, onCancel }: IncomeFormProps) {
  const [formData, setFormData] = useState<IncomeFormData>({
    amount: '',
    category: 'DIVIDEND',
    source: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    recurringFrequency: 'MONTHLY',
    taxWithheld: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (income) {
      setFormData({
        amount: income.amount.toString(),
        category: income.category,
        source: income.source,
        date: income.date.split('T')[0],
        description: income.description || '',
        isRecurring: income.isRecurring,
        recurringFrequency: income.recurringFrequency || 'MONTHLY',
        taxWithheld: income.taxWithheld ? income.taxWithheld.toString() : '',
      });
    }
  }, [income]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!formData.source.trim()) {
        throw new Error('Source is required');
      }
      if (!formData.date) {
        throw new Error('Date is required');
      }

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save income');
      setLoading(false);
    }
  };

  const handleChange = (field: keyof IncomeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{income ? 'Edit Income' : 'Add Income'}</CardTitle>
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
                Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Vanguard VTSAX"
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
                {INCOME_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium">
                This is recurring income
              </label>
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
                Tax Withheld
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.taxWithheld}
                onChange={(e) => handleChange('taxWithheld', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
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
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Saving...' : income ? 'Update Income' : 'Add Income'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}