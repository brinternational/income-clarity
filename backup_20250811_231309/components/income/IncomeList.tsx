'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Filter, 
  Search, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';

interface Income {
  id: string;
  source: string;
  category: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: string;
  taxable: boolean;
  notes?: string;
  createdAt: string;
}

interface IncomeListProps {
  incomes: Income[];
  loading?: boolean;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
  onView?: (income: Income) => void;
}

type SortField = 'date' | 'amount' | 'source' | 'category';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  search: string;
  category: string;
  recurring: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const categoryLabels: Record<string, string> = {
  'SALARY': 'Salary/Wages',
  'DIVIDEND': 'Dividend Income',
  'INTEREST': 'Interest Income',
  'CAPITAL_GAINS': 'Capital Gains',
  'OTHER': 'Other Income'
};

const frequencyLabels: Record<string, string> = {
  'MONTHLY': 'Monthly',
  'QUARTERLY': 'Quarterly',
  'ANNUALLY': 'Annually'
};

export function IncomeList({ incomes, loading = false, onEdit, onDelete, onView }: IncomeListProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    recurring: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [selectedIncomes, setSelectedIncomes] = useState<Set<string>>(new Set());

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
  const filteredAndSortedIncomes = React.useMemo(() => {
    let filtered = incomes.filter(income => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          income.source.toLowerCase().includes(searchLower) ||
          income.category.toLowerCase().includes(searchLower) ||
          (income.notes && income.notes.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && income.category !== filters.category) {
        return false;
      }

      // Recurring filter
      if (filters.recurring !== '') {
        const isRecurring = filters.recurring === 'true';
        if (income.recurring !== isRecurring) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const incomeDate = new Date(income.date);
        if (filters.dateRange.start && incomeDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && incomeDate > new Date(filters.dateRange.end)) {
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
        case 'source':
          aValue = a.source.toLowerCase();
          bValue = b.source.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [incomes, filters, sortField, sortOrder]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return filteredAndSortedIncomes.reduce(
      (acc, income) => ({
        total: acc.total + income.amount,
        taxable: acc.taxable + (income.taxable ? income.amount : 0),
        recurring: acc.recurring + (income.recurring ? income.amount : 0),
        count: acc.count + 1
      }),
      { total: 0, taxable: 0, recurring: 0, count: 0 }
    );
  }, [filteredAndSortedIncomes]);

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

  const handleSelectAll = () => {
    if (selectedIncomes.size === filteredAndSortedIncomes.length) {
      setSelectedIncomes(new Set());
    } else {
      setSelectedIncomes(new Set(filteredAndSortedIncomes.map(income => income.id)));
    }
  };

  const handleSelectIncome = (id: string) => {
    const newSelected = new Set(selectedIncomes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIncomes(newSelected);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading income entries...</span>
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
              <TrendingUp className="w-5 h-5 text-green-600" />
              Income Entries
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
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totals.total)}
            </div>
            <div className="text-sm text-green-700">Total Income</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(totals.taxable)}
            </div>
            <div className="text-sm text-blue-700">Taxable</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(totals.recurring)}
            </div>
            <div className="text-sm text-purple-700">Recurring</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {totals.count}
            </div>
            <div className="text-sm text-gray-700">Entries</div>
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
                  placeholder="Source, category, notes..."
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

            {/* Recurring Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.recurring}
                onChange={(e) => setFilters(prev => ({ ...prev, recurring: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="true">Recurring</option>
                <option value="false">One-time</option>
              </select>
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
                  checked={selectedIncomes.size === filteredAndSortedIncomes.length && filteredAndSortedIncomes.length > 0}
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
                onClick={() => handleSort('source')}
              >
                <div className="flex items-center gap-2">
                  Source
                  <SortIcon field="source" />
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
            {filteredAndSortedIncomes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No income entries found</p>
                    <p className="text-sm mt-1">
                      {filters.search || filters.category || filters.recurring || filters.dateRange.start || filters.dateRange.end
                        ? 'Try adjusting your filters'
                        : 'Add your first income entry to get started'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedIncomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIncomes.has(income.id)}
                      onChange={() => handleSelectIncome(income.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(income.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {income.source}
                    </div>
                    {income.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {income.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {categoryLabels[income.category] || income.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(income.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {income.recurring ? (
                      <div className="flex items-center gap-1">
                        <RotateCcw className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          {frequencyLabels[income.frequency || ''] || 'Recurring'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">One-time</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      income.taxable 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {income.taxable ? 'Taxable' : 'Tax-Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(income)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(income)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit income"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(income.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete income"
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