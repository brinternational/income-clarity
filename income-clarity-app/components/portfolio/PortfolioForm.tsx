'use client';

import { useState, useEffect, useRef } from 'react';

interface Portfolio {
  id: string;
  name: string;
  type: string;
  institution?: string;
  isPrimary: boolean;
}

interface PortfolioFormProps {
  portfolio?: Portfolio | null;
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
}

const PORTFOLIO_TYPES = [
  { value: 'taxable', label: 'Taxable Account' },
  { value: 'ira', label: 'Traditional IRA' },
  { value: 'roth_ira', label: 'Roth IRA' },
  { value: '401k', label: '401(k)' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'other', label: 'Other' },
];

export function PortfolioForm({ portfolio, onSubmit, onCancel }: PortfolioFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'taxable',
    institution: '',
    isPrimary: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Accessibility: Focus management
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (portfolio) {
      setFormData({
        name: portfolio.name || '',
        type: portfolio.type || 'taxable',
        institution: portfolio.institution || '',
        isPrimary: portfolio.isPrimary || false,
      });
    }
    
    // Focus management for accessibility
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, [portfolio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Portfolio name is required');
      }

      if (!formData.type) {
        throw new Error('Portfolio type is required');
      }

      // Submit form
      await onSubmit({
        name: formData.name.trim(),
        type: formData.type,
        institution: formData.institution.trim() || null,
        isPrimary: formData.isPrimary,
      });
      
      // Show success message
      setSuccessMessage(portfolio ? 'Portfolio updated successfully!' : 'Portfolio created successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="portfolio-form-title"
        aria-describedby="portfolio-form-description"
      >
        <div className="p-6">
          <h2 id="portfolio-form-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
          </h2>
          <p id="portfolio-form-description" className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {portfolio ? 'Update your portfolio information' : 'Create a new portfolio to track your investments'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg" role="alert">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg" role="alert">
              <p className="text-green-700 dark:text-green-300 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Portfolio Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Portfolio Name *
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Main Portfolio, Retirement Account"
                required
                disabled={loading}
                aria-describedby="name-help"
              />
              <p id="name-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Choose a descriptive name for your portfolio
              </p>
            </div>

            {/* Portfolio Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                disabled={loading}
              >
                {PORTFOLIO_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Institution (Optional)
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => handleChange('institution', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Fidelity, Vanguard, Charles Schwab"
                disabled={loading}
              />
            </div>

            {/* Primary Portfolio */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) => handleChange('isPrimary', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded 
                         focus:ring-blue-500 dark:focus:ring-blue-600"
                disabled={loading}
              />
              <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Set as primary portfolio
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                         hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center space-x-2"
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span>{portfolio ? 'Update Portfolio' : 'Create Portfolio'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}