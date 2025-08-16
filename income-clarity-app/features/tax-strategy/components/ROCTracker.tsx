'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  DollarSign,
  FileText,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useROCTracking } from '@/hooks/useROCTracking';

interface ROCTrackerProps {
  className?: string;
}

const ROC_CATEGORIES = {
  'qualified_dividend': {
    name: 'Qualified Dividend',
    description: 'Regular qualified dividend payments',
    taxTreatment: 'Qualified rates',
    color: 'blue'
  },
  'return_of_capital': {
    name: 'Return of Capital (19a)',
    description: 'Tax-advantaged return of capital',
    taxTreatment: 'Reduces cost basis',
    color: 'green'
  },
  'capital_gain': {
    name: 'Capital Gain',
    description: 'Long/short-term capital gain distributions',
    taxTreatment: 'Capital gains rates',
    color: 'orange'
  },
  'ordinary_income': {
    name: 'Ordinary Income',
    description: 'Interest and ordinary income distributions',
    taxTreatment: 'Ordinary rates',
    color: 'red'
  }
};

export const ROCTracker: React.FC<ROCTrackerProps> = ({
  className = ''
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTicker, setSelectedTicker] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'tax_planning'>('summary');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    rocDistributions,
    taxSummary,
    tickers,
    isLoading,
    error,
    getTaxAdvantage,
    getYearlyROCSummary,
    exportTaxReport
  } = useROCTracking();

  const filteredDistributions = useMemo(() => {
    return rocDistributions.filter(dist => 
      dist.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dist.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rocDistributions, searchQuery]);

  const yearlyROCSummary = useMemo(() => {
    return getYearlyROCSummary();
  }, [getYearlyROCSummary]);

  const totalROCAdvantage = useMemo(() => {
    return filteredDistributions.reduce((total, dist) => {
      if (dist.category === 'return_of_capital') {
        const advantage = getTaxAdvantage(dist.amount, 0);
        return total + advantage.annualSavings;
      }
      return total;
    }, 0);
  }, [filteredDistributions, getTaxAdvantage]);

  const rocByCategory = useMemo(() => {
    const categories = Object.keys(ROC_CATEGORIES);
    return categories.map(category => {
      const categoryDistributions = filteredDistributions.filter(
        dist => dist.category === category
      );
      const totalAmount = categoryDistributions.reduce(
        (sum, dist) => sum + dist.amount, 0
      );
      return {
        category,
        ...ROC_CATEGORIES[category as keyof typeof ROC_CATEGORIES],
        totalAmount,
        count: categoryDistributions.length,
        percentage: totalAmount / filteredDistributions.reduce((sum, dist) => sum + dist.amount, 0) * 100
      };
    }).filter(cat => cat.totalAmount > 0);
  }, [filteredDistributions]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-2xl font-bold text-white">📊 19a ROC Tracker</h3>
              <p className="text-green-100 text-lg">
                Track Return of Capital distributions • 
                <span className="text-yellow-200 font-semibold"> 🏝️ Even better in Puerto Rico!</span>
              </p>
            </div>
          </div>
          
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            {[2024, 2023, 2022, 2021, 2020].map(year => (
              <option key={year} value={year} className="text-gray-900">
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {['summary', 'detailed', 'tax_planning'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as typeof viewMode)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white text-green-600 font-medium'
                  : 'bg-green-500 text-white hover:bg-green-400'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ROC Advantage Banner */}
      {totalROCAdvantage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-bold text-green-800">ROC Tax Advantage Active</p>
                <p className="text-sm text-green-700">
                  Saving ${totalROCAdvantage.toLocaleString()} annually through ROC distributions
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ${totalROCAdvantage.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">Tax Savings</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search distributions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Ticker Filter */}
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Holdings</option>
              {tickers.map(ticker => (
                <option key={ticker} value={ticker}>{ticker}</option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={() => exportTaxReport()}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Tax Report</span>
          </button>
        </div>

        {/* Summary View */}
        {viewMode === 'summary' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">ROC Distributions</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ${rocByCategory.find(cat => cat.category === 'return_of_capital')?.totalAmount.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600">Tax-deferred income</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Qualified Dividends</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  ${rocByCategory.find(cat => cat.category === 'qualified_dividend')?.totalAmount.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-blue-600">Qualified tax rates</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Capital Gains</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  ${rocByCategory.find(cat => cat.category === 'capital_gain')?.totalAmount.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-orange-600">Capital gains rates</p>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Ordinary Income</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  ${rocByCategory.find(cat => cat.category === 'ordinary_income')?.totalAmount.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-red-600">Ordinary tax rates</p>
              </div>
            </div>

            {/* Distribution Breakdown Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Distribution Breakdown
              </h4>
              <div className="space-y-3">
                {rocByCategory.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-${category.color}-500`} />
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${category.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {category.percentage.toFixed(1)}% • {category.count} distributions
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Yearly ROC Summary */}
            {yearlyROCSummary && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {selectedYear} ROC Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-green-700">Total ROC Received</p>
                    <p className="text-xl font-bold text-green-600">
                      ${yearlyROCSummary.totalROC.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-700">Cost Basis Reduction</p>
                    <p className="text-xl font-bold text-green-600">
                      ${yearlyROCSummary.costBasisReduction.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-700">Tax Deferred</p>
                    <p className="text-xl font-bold text-green-600">
                      ${yearlyROCSummary.taxDeferred.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed View */}
        {viewMode === 'detailed' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Detailed Distribution History
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Ticker</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Type</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">Amount</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">Tax Treatment</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-600">Tax Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributions.map((distribution, index) => {
                    const category = ROC_CATEGORIES[distribution.category as keyof typeof ROC_CATEGORIES];
                    const taxAdvantage = distribution.category === 'return_of_capital' 
                      ? getTaxAdvantage(distribution.ticker, distribution.amount)
                      : null;
                    
                    return (
                      <motion.tr
                        key={distribution.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-2">
                          <span className="text-sm text-gray-900">
                            {new Date(distribution.exDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-medium text-gray-900">
                            {distribution.ticker}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${category.color}-100 text-${category.color}-800`}>
                            {category.name}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="font-bold text-gray-900">
                            ${distribution.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="text-sm text-gray-600">
                            {category.taxTreatment}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {taxAdvantage ? (
                            <span className="font-medium text-green-600">
                              -${taxAdvantage.annualSavings.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Taxable
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tax Planning View */}
        {viewMode === 'tax_planning' && taxSummary && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Tax Planning Analysis
            </h4>

            {/* Tax Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-4">Current Year Tax Impact</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxable Distributions:</span>
                    <span className="font-bold text-red-600">
                      ${taxSummary.taxableAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tax-Deferred (ROC):</span>
                    <span className="font-bold text-green-600">
                      ${taxSummary.rocAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Tax Owed:</span>
                    <span className="font-bold text-red-600">
                      ${taxSummary.estimatedTax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tax Savings (ROC):</span>
                    <span className="font-bold text-green-600">
                      ${taxSummary.rocTaxSavings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h5 className="font-semibold text-green-800 mb-4">Cost Basis Tracking</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Original Cost Basis:</span>
                    <span className="font-bold text-gray-900">
                      ${taxSummary.originalCostBasis.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ROC Reduction:</span>
                    <span className="font-bold text-orange-600">
                      -${taxSummary.totalROCReduction.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Adjusted Cost Basis:</span>
                    <span className="font-bold text-blue-600">
                      ${taxSummary.adjustedCostBasis.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Future Cap Gains:</span>
                    <span className="font-bold text-orange-600">
                      ${taxSummary.potentialCapitalGains.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROC Tax Advantage Analysis */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <h5 className="font-semibold text-green-800 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                ROC Tax Advantage Analysis
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-green-700">Current Year Deferral</p>
                  <p className="text-xl font-bold text-green-600">
                    ${taxSummary.rocTaxSavings.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-700">Tax Deferral Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    {((taxSummary.rocAmount / (taxSummary.rocAmount + taxSummary.taxableAmount)) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-700">Effective Tax Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    {((taxSummary.estimatedTax / (taxSummary.rocAmount + taxSummary.taxableAmount)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-300">
                <p className="text-sm text-green-700 mb-2">
                  <strong>Tax Planning Note:</strong>
                </p>
                <p className="text-sm text-green-700">
                  Your ROC distributions are reducing your cost basis by ${taxSummary.totalROCReduction.toLocaleString()}, 
                  which defers ${taxSummary.rocTaxSavings.toLocaleString()} in taxes this year. However, this will 
                  increase your capital gains when you eventually sell these positions. Monitor your cost basis carefully 
                  to avoid surprise tax bills on future sales.
                </p>
              </div>
            </div>

            {/* Quarterly Planning */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-4">Quarterly Tax Planning</h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, index) => {
                  const quarterlyTax = taxSummary.estimatedTax / 4;
                  const quarterlyROC = taxSummary.rocAmount / 4;
                  
                  return (
                    <div key={quarter} className="bg-white rounded-lg p-4 border border-blue-300">
                      <h6 className="font-medium text-blue-800 mb-2">{quarter} {selectedYear}</h6>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Est. Tax:</span>
                          <span className="font-medium text-red-600">
                            ${quarterlyTax.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">ROC Deferred:</span>
                          <span className="font-medium text-green-600">
                            ${quarterlyROC.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};