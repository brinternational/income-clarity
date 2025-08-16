'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExpenseForm, type ExpenseFormData } from '@/components/forms/expenses';
import { useExpenses } from '@/hooks/useExpenses';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { ArrowLeft } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AddExpensePage() {
  const router = useRouter();
  const { addExpense } = useExpenses();
  const { user } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (data: ExpenseFormData) => {
    if (!user) {
      // console.error('No user found');
      // return;
    }

    setLoading(true);
    
    try {
      await addExpense({
        user_id: 'demo-user-id', // Using demo ID for simple auth
        category: data.category,
        amount: data.amount,
        description: data.description,
        expense_date: data.expense_date,
        is_recurring: data.recurring,
        recurring_frequency: data.recurringFrequency
      });
      
      // Show success and redirect
      router.push('/dashboard?success=expense-added');
    } catch (error) {
      // Error handled by emergency recovery script finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Expense
          </h1>
          <p className="text-gray-600 mt-2">
            Track your expenses to calculate your true income clarity
          </p>
        </div>
        
        {/* Form */}
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
}
