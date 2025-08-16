'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Filter, 
  Search, 
  Receipt, 
  Edit, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  RotateCcw,
  Star,
  Shield,
  ShoppingCart
} from 'lucide-react';

interface Expense {
  id: string;
  category: string;
  merchant?: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: string;
  priority: number;
  essential: boolean;
  notes?: string;
  createdAt: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  loading?: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onView?: (expense: Expense) => void;
}

type SortField = 'date' | 'amount' | 'category' | 'priority';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  search: string;
  category: string;
  essential: string;
  recurring: string;
  dateRange: {
    start: string;
    end: string;
  };
  minAmount: string;
  maxAmount: string;
}

const categoryLabels: Record<string, string> = {
  'UTILITIES': '🔌 Utilities',
  'INSURANCE': '🛡️ Insurance', 
  'FOOD': '🍔 Food & Groceries',
  'RENT': '🏠 Rent/Mortgage',
  'ENTERTAINMENT': '🎮 Entertainment',
  'TRANSPORTATION': '🚗 Transportation',
  'HEALTHCARE': '🏥 Healthcare',
  'EDUCATION': '📚 Education',
  'SUBSCRIPTIONS': '💳 Subscriptions',
  'CLOTHING': '👕 Clothing',
  'TRAVEL': '✈️ Travel',
  'SAVINGS': '💰 Savings',
  'MISCELLANEOUS': '📦 Miscellaneous'
};

const frequencyLabels: Record<string, string> = {
  'MONTHLY': 'Monthly',
  'QUARTERLY': 'Quarterly',
  'ANNUALLY': 'Annually'
};

export function ExpenseList({ expenses, loading = false, onEdit, onDelete, onView }: ExpenseListProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    essential: '',
    recurring: '',
    dateRange: {
      start: '',
      end: ''
    },
    minAmount: '',
    maxAmount: ''
  });
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Apply filters and sorting
  const filteredAndSortedExpenses = React.useMemo(() => {
    let filtered = expenses.filter(expense => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          expense.category.toLowerCase().includes(searchLower) ||
          (expense.merchant && expense.merchant.toLowerCase().includes(searchLower)) ||
          (expense.notes && expense.notes.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && expense.category !== filters.category) {
        return false;
      }

      // Essential filter
      if (filters.essential !== '') {
        const isEssential = filters.essential === 'true';
        if (expense.essential !== isEssential) return false;
      }

      // Recurring filter
      if (filters.recurring !== '') {
        const isRecurring = filters.recurring === 'true';
        if (expense.recurring !== isRecurring) return false;
      }

      // Amount range filter
      if (filters.minAmount && expense.amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && expense.amount > parseFloat(filters.maxAmount)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const expenseDate = new Date(expense.date);
        if (filters.dateRange.start && expenseDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && expenseDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      return true;
    });

    // Sort
    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [expenses, filters, sortField, sortOrder]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return filteredAndSortedExpenses.reduce(
      (acc, expense) => ({
        total: acc.total + expense.amount,
        essential: acc.essential + (expense.essential ? expense.amount : 0),
        discretionary: acc.discretionary + (!expense.essential ? expense.amount : 0),
        recurring: acc.recurring + (expense.recurring ? expense.amount : 0),
        count: acc.count + 1,
        avgPriority: acc.count > 0 ? (acc.avgPriority * acc.count + expense.priority) / (acc.count + 1) : expense.priority
      }),
      { total: 0, essential: 0, discretionary: 0, recurring: 0, count: 0, avgPriority: 0 }
    );
  }, [filteredAndSortedExpenses]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return 'text-red-600 bg-red-100';
    if (priority >= 7) return 'text-orange-600 bg-orange-100';
    if (priority >= 5) return 'text-yellow-600 bg-yellow-100';
    if (priority >= 3) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const handleSelectAll = () => {
    if (selectedExpenses.size === filteredAndSortedExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(filteredAndSortedExpenses.map(expense => expense.id)));
    }
  };

  const handleSelectExpense = (id: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedExpenses(newSelected);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading expenses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600" />
              Expense Entries
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {totals.count} entries • Total: {formatCurrency(totals.total)}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(totals.total)}
            </div>
            <div className="text-sm text-red-700">Total Expenses</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(totals.essential)}
            </div>
            <div className="text-sm text-orange-700">Essential</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(totals.discretionary)}
            </div>
            <div className="text-sm text-purple-700">Discretionary</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">
              {totals.avgPriority.toFixed(1)}
            </div>
            <div className="text-sm text-blue-700">Avg Priority</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Category, merchant, notes..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Essential Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.essential}
                onChange={(e) => setFilters(prev => ({ ...prev, essential: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="true">Essential</option>
                <option value="false">Discretionary</option>
              </select>
            </div>

            {/* Recurring Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={filters.recurring}
                onChange={(e) => setFilters(prev => ({ ...prev, recurring: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Frequencies</option>
                <option value="true">Recurring</option>
                <option value="false">One-time</option>
              </select>
            </div>
          </div>

          {/* Additional Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedExpenses.size === filteredAndSortedExpenses.length && filteredAndSortedExpenses.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-2">
                  Category
                  <SortIcon field="category" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Merchant
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount
                  <SortIcon field="amount" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedExpenses.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No expenses found</p>
                    <p className="text-sm mt-1">
                      {Object.values(filters).some(f => typeof f === 'string' ? f : f.start || f.end)
                        ? 'Try adjusting your filters'
                        : 'Add your first expense to get started'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.has(expense.id)}
                      onChange={() => handleSelectExpense(expense.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {categoryLabels[expense.category] || expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {expense.merchant || '-'}
                    </div>
                    {expense.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {expense.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(expense.priority)}`}>
                      {expense.priority}/10
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {expense.essential ? (
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-orange-700">Essential</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-700">Discretionary</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {expense.recurring ? (
                      <div className="flex items-center gap-1">
                        <RotateCcw className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          {frequencyLabels[expense.frequency || ''] || 'Recurring'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">One-time</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(expense)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit expense"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}