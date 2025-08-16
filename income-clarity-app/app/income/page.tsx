'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperCardsAppShell } from '@/components/SuperCardsAppShell';
import { IncomeList } from '@/components/income/IncomeList';
import { IncomeForm } from '@/components/income/IncomeForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { logger } from '@/lib/logger'

interface IncomeRecord {
  id: string;
  amount: number;
  category: string;
  source: string;
  date: string;
  description?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  taxWithheld?: number;
  createdAt: string;
}

interface IncomeTotals {
  category: string;
  total: number;
}

export default function IncomePage() {
  const router = useRouter();
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [totals, setTotals] = useState<IncomeTotals[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<IncomeRecord | null>(null);

  // Load income on component mount
  useEffect(() => {
    loadIncome();
  }, []);

  const loadIncome = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/income');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load income');
      }
      
      const data = await response.json();
      setIncome(data.income || []);
      setTotals(data.totals || []);
      setGrandTotal(data.grandTotal || 0);
      setError('');
    } catch (err) {
      setError('Failed to load income records. Please try again.');
      logger.error('Error loading income:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncome = () => {
    setEditingIncome(null);
    setShowIncomeForm(true);
  };

  const handleEditIncome = (income: IncomeRecord) => {
    setEditingIncome(income);
    setShowIncomeForm(true);
  };

  const handleDeleteIncome = (income: IncomeRecord) => {
    setDeleteConfirmation(income);
  };

  const handleIncomeFormSubmit = async (formData: any) => {
    try {
      const url = editingIncome 
        ? `/api/income/${editingIncome.id}`
        : '/api/income';
      
      const method = editingIncome ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save income');
      }

      setShowIncomeForm(false);
      setEditingIncome(null);
      await loadIncome();
    } catch (err) {
      logger.error('Error saving income:', err);
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      const response = await fetch(`/api/income/${deleteConfirmation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete income');
      }

      setDeleteConfirmation(null);
      await loadIncome();
    } catch (err) {
      logger.error('Error deleting income:', err);
      setError('Failed to delete income record. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <SuperCardsAppShell>
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </SuperCardsAppShell>
    );
  }

  return (
    <SuperCardsAppShell>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Income Tracking</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your income from all sources
            </p>
          </div>
          <button
            onClick={handleCreateIncome}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Income
          </button>
        </div>

        {/* Summary Cards */}
        {income.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(grandTotal)}</p>
            </div>
            {totals.slice(0, 3).map((total) => (
              <div key={total.category} className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">{total.category}</p>
                <p className="text-xl font-bold">{formatCurrency(total.total)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Income List or Empty State */}
        {income.length === 0 ? (
          <EmptyState
            variant="income"
            title="No income recorded"
            description="Start tracking your income to see your cash flow"
            actionText="Add Income"
            onAction={handleCreateIncome}
          />
        ) : (
          <IncomeList
            incomes={income.map(i => ({
              ...i,
              recurring: i.isRecurring,
              frequency: i.recurringFrequency,
              taxable: i.taxWithheld ? i.taxWithheld > 0 : false,
              notes: i.description,
            }))}
            onEdit={(incomeData) => {
              const incomeRecord: IncomeRecord = {
                ...incomeData,
                isRecurring: incomeData.recurring,
                recurringFrequency: incomeData.frequency,
                taxWithheld: incomeData.taxable ? 0.15 : 0,
                description: incomeData.notes,
                createdAt: incomeData.createdAt || new Date().toISOString(),
              };
              handleEditIncome(incomeRecord);
            }}
            onDelete={(id) => {
              const incomeRecord = income.find(i => i.id === id);
              if (incomeRecord) handleDeleteIncome(incomeRecord);
            }}
          />
        )}

        {/* Modals */}
        {showIncomeForm && (
          <IncomeForm
            income={editingIncome}
            onSubmit={handleIncomeFormSubmit}
            onCancel={() => {
              setShowIncomeForm(false);
              setEditingIncome(null);
            }}
          />
        )}

        {/* Delete Confirmation */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">Delete Income Record?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete this income record from {deleteConfirmation.source}? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperCardsAppShell>
  );
}