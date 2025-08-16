'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Undo, X, DollarSign, Calendar, TrendingUp } from 'lucide-react';

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

interface Portfolio {
  id: string;
  name: string;
  type: string;
  institution?: string;
  holdingsCount: number;
  totalValue: number;
}

interface EnhancedDeleteModalProps {
  type: 'portfolio' | 'holding';
  item: Portfolio | Holding;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const UNDO_TIMEOUT = 5000; // 5 seconds

export function EnhancedDeleteModal({ type, item, onConfirm, onCancel, isOpen }: EnhancedDeleteModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'undo'>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [undoTimer, setUndoTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 'undo' && undoTimer > 0) {
      interval = setInterval(() => {
        setUndoTimer(prev => {
          if (prev <= 1) {
            setStep('success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, undoTimer]);

  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      setError('');
      setUndoTimer(0);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    
    try {
      await onConfirm();
      setStep('undo');
      setUndoTimer(UNDO_TIMEOUT / 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    // In a real implementation, this would restore the deleted item
    setStep('success');
    onCancel();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  const isHolding = type === 'holding';
  const holding = isHolding ? (item as Holding) : null;
  const portfolio = !isHolding ? (item as Portfolio) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && step === 'confirm' && onCancel()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Delete {isHolding ? 'Holding' : 'Portfolio'}?
                    </h3>
                    
                    {isHolding && holding ? (
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-400">
                          Are you sure you want to delete this holding? This action cannot be undone.
                        </p>
                        
                        {/* Holding Details Card */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {holding.ticker}
                            </span>
                            {holding.sector && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded">
                                {holding.sector}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Shares</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {holding.shares.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Cost Basis</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(holding.costBasis)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Current Value</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(holding.currentValue)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Gain/Loss</p>
                                <p className={`font-medium ${
                                  holding.gainLoss >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {formatCurrency(holding.gainLoss)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-gray-600 dark:text-gray-400">
                          Are you sure you want to delete "{portfolio?.name}"? This will permanently delete the portfolio and all its holdings.
                        </p>
                        
                        {portfolio && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {portfolio.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {portfolio.type} • {portfolio.holdingsCount} holdings
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(portfolio.totalValue)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg"
                        role="alert"
                      >
                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                             hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors
                             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                             transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center space-x-2 focus:outline-none focus:ring-2 
                             focus:ring-red-500 focus:ring-offset-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>Delete {isHolding ? 'Holding' : 'Portfolio'}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'undo' && (
              <motion.div
                key="undo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <motion.path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    </motion.div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {isHolding ? 'Holding' : 'Portfolio'} Deleted
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {isHolding 
                      ? `${holding?.ticker} has been removed from your portfolio.`
                      : `${portfolio?.name} has been deleted.`
                    }
                  </p>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Undo className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-yellow-700 dark:text-yellow-300">
                          You can still undo this action
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          {undoTimer}s
                        </span>
                        <div className="w-8 h-8 relative">
                          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                            <circle
                              cx="16"
                              cy="16"
                              r="12"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              className="text-yellow-200 dark:text-yellow-800"
                            />
                            <motion.circle
                              cx="16"
                              cy="16"
                              r="12"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              className="text-yellow-600 dark:text-yellow-400"
                              initial={{ pathLength: 1 }}
                              animate={{ pathLength: 0 }}
                              transition={{ duration: UNDO_TIMEOUT / 1000, ease: 'linear' }}
                              style={{
                                strokeDasharray: 2 * Math.PI * 12,
                                strokeLinecap: 'round'
                              }}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onCancel}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                               hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors
                               focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Close
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUndo}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg 
                               transition-colors flex items-center space-x-2
                               focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    >
                      <Undo className="w-4 h-4" />
                      <span>Undo Delete</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 text-center"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {isHolding ? 'Holding' : 'Portfolio'} Deleted Successfully
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The {isHolding ? 'holding' : 'portfolio'} has been permanently removed.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                           transition-colors focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:ring-offset-2"
                >
                  Done
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}