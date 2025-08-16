'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Edit3, Loader2 } from 'lucide-react';

interface Holding {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  purchaseDate: string;
  currentPrice?: number;
  dividendYield?: number;
  sector?: string;
  currentValue: number;
  costBasisTotal: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface InlineEditHoldingProps {
  holding: Holding;
  field: 'shares' | 'costBasis';
  onSave: (holdingId: string, field: string, value: number) => Promise<void>;
  onCancel?: () => void;
  isEditing: boolean;
  onEditStart: () => void;
}

export function InlineEditHolding({ 
  holding, 
  field, 
  onSave, 
  onCancel,
  isEditing,
  onEditStart 
}: InlineEditHoldingProps) {
  const [value, setValue] = useState(holding[field].toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalValue] = useState(holding[field]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const numValue = parseFloat(value);
    
    // Validation
    if (isNaN(numValue) || numValue <= 0) {
      setError(`${field === 'shares' ? 'Shares' : 'Cost basis'} must be a positive number`);
      return;
    }

    // Check if value actually changed
    if (numValue === originalValue) {
      handleCancel();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSave(holding.id, field, numValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(originalValue.toString());
    setError('');
    if (onCancel) onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const formatDisplayValue = (val: number) => {
    if (field === 'shares') {
      return val.toLocaleString(undefined, { maximumFractionDigits: 3 });
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    }
  };

  if (!isEditing) {
    return (
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onEditStart}
        className="group relative px-2 py-1 rounded text-left transition-colors duration-150 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        title={`Click to edit ${field === 'shares' ? 'shares' : 'cost basis'}`}
        aria-label={`Edit ${field === 'shares' ? 'shares' : 'cost basis'} for ${holding.ticker}`}
      >
        <div className="flex items-center space-x-1">
          <span className="text-gray-900 dark:text-white">
            {formatDisplayValue(holding[field])}
          </span>
          <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
      animate={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
      className="relative flex items-center space-x-1 p-1 rounded"
    >
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="number"
          step={field === 'shares' ? '0.001' : '0.01'}
          min="0"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm border border-blue-300 rounded 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                   disabled:opacity-50"
          disabled={loading}
          aria-label={`Edit ${field === 'shares' ? 'shares' : 'cost basis'}`}
        />
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 mt-1 z-10 px-2 py-1 text-xs text-red-700 
                       bg-red-100 border border-red-300 rounded shadow-lg whitespace-nowrap"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center space-x-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
          disabled={loading}
          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-1 focus:ring-green-500"
          title="Save changes"
          aria-label="Save changes"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCancel}
          disabled={loading}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-1 focus:ring-gray-500"
          title="Cancel editing"
          aria-label="Cancel editing"
        >
          <X className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  );
}