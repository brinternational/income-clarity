'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExpenseCategoryForm, type ExpenseCategoryData } from '@/components/forms/expenses';
import { ArrowLeft, Plus } from 'lucide-react';

export default function ExpenseCategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Mock data for existing categories
  const [categories, setCategories] = useState<ExpenseCategoryData[]>([
    {
      name: 'Housing',
      monthlyBudget: 1500,
      priority: 'essential',
      icon: '🏠',
      color: 'red'
    },
    {
      name: 'Groceries',
      monthlyBudget: 600,
      priority: 'essential',
      icon: '🛒',
      color: 'red'
    },
    {
      name: 'Entertainment',
      monthlyBudget: 300,
      priority: 'optional',
      icon: '🎬',
      color: 'green'
    }
  ]);
  
  const handleSubmit = async (data: ExpenseCategoryData) => {
    setLoading(true);
    
    try {
      // In a real app, this would save to the backend
      setCategories(prev => [...prev, data]);
      setShowForm(false);
      
      // Show success message
      router.push('/expenses/categories?success=category-added');
    } catch (error) {
      // console.error('Failed to add category:', error);
    // } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setShowForm(false);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'optional': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Categories</span>
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900">
              Create Expense Category
            </h1>
          </div>
          
          <ExpenseCategoryForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    );
  }
  
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Categories
              </h1>
              <p className="text-gray-600 mt-2">
                Organize your expenses with custom categories and budgets
              </p>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(category.priority)}`}>
                  {category.priority}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Budget:</span>
                  <span className="text-lg font-semibold text-gray-900 currency-display">
                    ${category.monthlyBudget.toLocaleString()}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: '60%' }} // Mock usage percentage
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">$360 spent</span>
                  <span className="text-gray-500">60% used</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  Edit Category
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Categories Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first expense category to start organizing your budget
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Category</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
