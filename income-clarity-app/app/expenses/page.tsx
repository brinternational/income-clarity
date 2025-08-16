'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperCardsAppShell } from '@/components/SuperCardsAppShell';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { logger } from '@/lib/logger'

interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  merchant?: string;
  date: string;
  notes?: string;
  recurring: boolean;
  frequency?: string;
  essential: boolean;
  priority: number;
  createdAt: string;
}

interface ExpenseTotals {
  category: string;
  total: number;
}

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [totals, setTotals] = useState<ExpenseTotals[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<ExpenseRecord | null>(null);

  // Load expenses on component mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load expenses');
      }
      
      const data = await response.json();
      setExpenses(data.expenses || []);
      setTotals(data.totals || []);
      setGrandTotal(data.grandTotal || 0);
      setMonthlyAverage(data.monthlyAverage || 0);
      setError('');
    } catch (err) {
      setError('Failed to load expense records. Please try again.');
      logger.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setDeleteConfirmation(expense);
    }
  };

  const handleExpenseFormSubmit = async (formData: any) => {
    try {
      const url = editingExpense 
        ? `/api/expenses/${editingExpense.id}`
        : '/api/expenses';
      
      const method = editingExpense ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save expense');
      }

      setShowExpenseForm(false);
      setEditingExpense(null);
      await loadExpenses();
    } catch (err) {
      logger.error('Error saving expense:', err);
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      const response = await fetch(`/api/expenses/${deleteConfirmation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete expense');
      }

      setDeleteConfirmation(null);
      await loadExpenses();
    } catch (err) {
      logger.error('Error deleting expense:', err);
      setError('Failed to delete expense record. Please try again.');
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
            <h1 className="text-3xl font-bold">Expense Tracking</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your spending and track where your money goes
            </p>
          </div>
          <button
            onClick={handleCreateExpense}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        {expenses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(grandTotal)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Average</p>
              <p className="text-xl font-bold">{formatCurrency(monthlyAverage)}</p>
            </div>
            {totals.slice(0, 2).map((total) => (
              <div key={total.category} className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">{total.category}</p>
                <p className="text-xl font-bold">{formatCurrency(total.total)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Expense List or Empty State */}
        {expenses.length === 0 ? (
          <EmptyState
            variant="expense"
            title="No expenses recorded"
            description="Start tracking your expenses to understand your spending patterns"
            actionText="Add Expense"
            onAction={handleCreateExpense}
          />
        ) : (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        )}

        {/* Modals */}
        {showExpenseForm && (
          <ExpenseForm
            expense={editingExpense}
            onSubmit={handleExpenseFormSubmit}
            onCancel={() => {
              setShowExpenseForm(false);
              setEditingExpense(null);
            }}
          />
        )}

        {/* Delete Confirmation */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">Delete Expense Record?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete this expense? 
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