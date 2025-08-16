'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileSpreadsheet, FolderPlus, X } from 'lucide-react';
import { SuperCardsAppShell } from '@/components/SuperCardsAppShell';
import { PortfolioList } from '@/components/portfolio/PortfolioList';
import { PortfolioForm } from '@/components/portfolio/PortfolioForm';
import { EnhancedHoldingsList } from '@/components/portfolio/EnhancedHoldingsList';
import { EnhancedHoldingForm } from '@/components/portfolio/EnhancedHoldingForm';
import { QuickPurchaseForm } from '@/components/portfolio/QuickPurchaseForm';
import { DividendRecordForm } from '@/components/portfolio/DividendRecordForm';
import { EnhancedDeleteModal } from '@/components/portfolio/EnhancedDeleteModal';
import { ImportWizard } from '@/components/portfolio/ImportWizard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { logger } from '@/lib/logger';

interface Portfolio {
  id: string;
  name: string;
  type: string;
  institution?: string;
  isPrimary: boolean;
  holdingsCount: number;
  totalValue: number;
  totalCostBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  createdAt: string;
  updatedAt: string;
}

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

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [showHoldingForm, setShowHoldingForm] = useState(false);
  const [showQuickPurchaseForm, setShowQuickPurchaseForm] = useState(false);
  const [showDividendRecordForm, setShowDividendRecordForm] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [selectedHoldingForPurchase, setSelectedHoldingForPurchase] = useState<Holding | null>(null);
  const [selectedHoldingForDividend, setSelectedHoldingForDividend] = useState<Holding | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'portfolio' | 'holding';
    item: Portfolio | Holding;
  } | null>(null);
  
  // FAB state
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Load portfolios on component mount
  useEffect(() => {
    loadPortfolios();
  }, []);

  // Load holdings when a portfolio is selected
  useEffect(() => {
    if (selectedPortfolio) {
      loadHoldings(selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/portfolios');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load portfolios');
      }
      
      const data = await response.json();
      setPortfolios(data.portfolios || []);
      setError('');
    } catch (err) {
      setError('Failed to load portfolios. Please try again.');
      logger.error('Error loading portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHoldings = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/portfolios/${portfolioId}/holdings`);
      
      if (!response.ok) {
        throw new Error('Failed to load holdings');
      }
      
      const data = await response.json();
      setHoldings(data.holdings || []);
    } catch (err) {
      logger.error('Error loading holdings:', err);
      setHoldings([]);
    }
  };

  const handleCreatePortfolio = () => {
    setEditingPortfolio(null);
    setShowPortfolioForm(true);
  };

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setShowPortfolioForm(true);
  };

  const handleDeletePortfolio = (portfolio: Portfolio) => {
    setDeleteConfirmation({ type: 'portfolio', item: portfolio });
  };

  const handlePortfolioFormSubmit = async (formData: any) => {
    try {
      const url = editingPortfolio 
        ? `/api/portfolios/${editingPortfolio.id}`
        : '/api/portfolios';
      
      const method = editingPortfolio ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save portfolio');
      }

      setShowPortfolioForm(false);
      setEditingPortfolio(null);
      await loadPortfolios();
    } catch (err) {
      logger.error('Error saving portfolio:', err);
      throw err;
    }
  };

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setHoldings([]);
  };

  const handleBackToPortfolios = () => {
    setSelectedPortfolio(null);
    setHoldings([]);
  };

  const handleCreateHolding = () => {
    setEditingHolding(null);
    setShowHoldingForm(true);
  };

  const handleEditHolding = (holding: Holding) => {
    setEditingHolding(holding);
    setShowHoldingForm(true);
  };

  const handleDeleteHolding = (holding: Holding) => {
    setDeleteConfirmation({ type: 'holding', item: holding });
  };

  const handleQuickPurchase = (holding?: Holding) => {
    setSelectedHoldingForPurchase(holding || null);
    setShowQuickPurchaseForm(true);
  };

  const handleRecordDividend = (holding: Holding) => {
    setSelectedHoldingForDividend(holding);
    setShowDividendRecordForm(true);
  };

  const handleQuickPurchaseSubmit = async (purchaseData: any) => {
    try {
      const response = await fetch(`/api/holdings/${purchaseData.holdingId}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shares: purchaseData.shares,
          pricePerShare: purchaseData.pricePerShare,
          purchaseDate: purchaseData.purchaseDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add purchase');
      }

      setShowQuickPurchaseForm(false);
      setSelectedHoldingForPurchase(null);
      
      // Refresh holdings and portfolio data
      if (selectedPortfolio) {
        await loadHoldings(selectedPortfolio.id);
        await loadPortfolios(); // Refresh portfolio totals
      }
    } catch (err) {
      logger.error('Error adding purchase:', err);
      throw err;
    }
  };

  const handleDividendRecordSubmit = async (dividendData: any) => {
    if (!selectedHoldingForDividend) return;

    try {
      const response = await fetch(`/api/holdings/${selectedHoldingForDividend.id}/dividends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dividendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record dividend');
      }

      setShowDividendRecordForm(false);
      setSelectedHoldingForDividend(null);
      
      // Refresh holdings and portfolio data
      if (selectedPortfolio) {
        await loadHoldings(selectedPortfolio.id);
        await loadPortfolios(); // Refresh portfolio totals
      }
    } catch (err) {
      logger.error('Error recording dividend:', err);
      throw err;
    }
  };

  const handleHoldingFormSubmit = async (formData: any) => {
    if (!selectedPortfolio) return;

    try {
      const url = editingHolding 
        ? `/api/holdings/${editingHolding.id}`
        : `/api/portfolios/${selectedPortfolio.id}/holdings`;
      
      const method = editingHolding ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save holding');
      }

      setShowHoldingForm(false);
      setEditingHolding(null);
      await loadHoldings(selectedPortfolio.id);
      await loadPortfolios(); // Refresh portfolio totals
    } catch (err) {
      logger.error('Error saving holding:', err);
      throw err;
    }
  };

  const handleInlineHoldingUpdate = async (holdingId: string, field: string, value: number) => {
    try {
      const response = await fetch(`/api/holdings/${holdingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update holding');
      }

      // Refresh holdings and portfolio totals
      if (selectedPortfolio) {
        await loadHoldings(selectedPortfolio.id);
        await loadPortfolios();
      }
    } catch (err) {
      logger.error('Error updating holding:', err);
      throw err;
    }
  };

  const handleRefreshPrices = async () => {
    if (!selectedPortfolio) return;

    try {
      setLoading(true);
      const response = await fetch('/api/holdings/refresh-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioId: selectedPortfolio.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh prices');
      }

      // Reload holdings and portfolio data
      await loadHoldings(selectedPortfolio.id);
      await loadPortfolios();
      
    } catch (err) {
      logger.error('Error refreshing prices:', err);
      setError('Failed to refresh prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      const { type, item } = deleteConfirmation;
      
      const url = type === 'portfolio' 
        ? `/api/portfolios/${item.id}`
        : `/api/holdings/${item.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete ${type}`);
      }

      setDeleteConfirmation(null);

      if (type === 'portfolio') {
        // If deleting current portfolio, go back to list
        if (selectedPortfolio && selectedPortfolio.id === item.id) {
          setSelectedPortfolio(null);
          setHoldings([]);
        }
        await loadPortfolios();
      } else {
        // Refresh holdings and portfolio totals
        if (selectedPortfolio) {
          await loadHoldings(selectedPortfolio.id);
          await loadPortfolios();
        }
      }
    } catch (err) {
      logger.error('Error deleting:', err);
      setError(`Failed to delete ${deleteConfirmation.type}. Please try again.`);
    }
  };

  // FAB Component
  const FloatingActionButton = () => {
    const fabMenuItems = [
      // Quick Purchase - only show when portfolio is selected and has holdings
      ...(selectedPortfolio && holdings.length > 0 ? [{
        id: 'quick-purchase',
        label: 'Quick Purchase',
        icon: Plus,
        action: () => {
          handleQuickPurchase();
          setIsFabOpen(false);
        },
        color: 'bg-emerald-600 hover:bg-emerald-700'
      }] : []),
      {
        id: 'add-holding',
        label: 'Add Holding',
        icon: FolderPlus,
        action: () => {
          if (selectedPortfolio) {
            handleCreateHolding();
          } else {
            // If no portfolio selected, show a portfolio-focused action
            handleCreatePortfolio();
          }
          setIsFabOpen(false);
        },
        color: 'bg-green-600 hover:bg-green-700'
      },
      {
        id: 'import-csv',
        label: 'Import CSV',
        icon: FileSpreadsheet,
        action: () => {
          setShowImportWizard(true);
          setIsFabOpen(false);
        },
        color: 'bg-purple-600 hover:bg-purple-700'
      },
      {
        id: 'new-portfolio',
        label: 'New Portfolio',
        icon: FolderPlus,
        action: () => {
          handleCreatePortfolio();
          setIsFabOpen(false);
        },
        color: 'bg-blue-600 hover:bg-blue-700'
      }
    ];

    return (
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isFabOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
                onClick={() => setIsFabOpen(false)}
                style={{ zIndex: -1 }}
              />
              
              {/* Menu Items */}
              <div className="flex flex-col space-y-3 mb-4">
                {fabMenuItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.3, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                      transition: {
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.3, 
                      y: 20,
                      transition: {
                        delay: (fabMenuItems.length - index - 1) * 0.02
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={item.action}
                    className={`
                      group flex items-center justify-center w-12 h-12 
                      ${item.color} text-white rounded-full shadow-lg 
                      transition-all duration-200 focus:outline-none 
                      focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      relative overflow-hidden
                    `}
                    aria-label={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                    
                    {/* Tooltip */}
                    <div className="
                      absolute right-14 top-1/2 transform -translate-y-1/2
                      bg-gray-900 text-white text-xs px-2 py-1 rounded
                      opacity-0 group-hover:opacity-100 transition-opacity
                      whitespace-nowrap pointer-events-none
                    ">
                      {item.label}
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="
            flex items-center justify-center w-14 h-14 
            bg-blue-600 hover:bg-blue-700 text-white rounded-full 
            shadow-lg transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            relative overflow-hidden
          "
          aria-label={isFabOpen ? 'Close menu' : 'Open actions menu'}
          aria-expanded={isFabOpen}
        >
          <motion.div
            animate={{ rotate: isFabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isFabOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </motion.div>
        </motion.button>
      </div>
    );
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

        {!selectedPortfolio ? (
          // Portfolio List View
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Your Portfolios</h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowImportWizard(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Import Portfolio</span>
                </button>
                <button
                  onClick={handleCreatePortfolio}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Portfolio
                </button>
              </div>
            </div>

            {portfolios.length === 0 ? (
              <EmptyState
                variant="portfolio"
                title="No portfolios yet"
                description="Create your first portfolio to start tracking your investments"
                actionText="Create Portfolio"
                onAction={handleCreatePortfolio}
              />
            ) : (
              <PortfolioList
                portfolios={portfolios}
                onSelect={handlePortfolioSelect}
                onEdit={handleEditPortfolio}
                onDelete={handleDeletePortfolio}
              />
            )}
          </div>
        ) : (
          // Portfolio Detail View with Holdings
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToPortfolios}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ← Back to Portfolios
                </button>
                <div>
                  <h1 className="text-3xl font-bold">{selectedPortfolio.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedPortfolio.type}
                    {selectedPortfolio.institution && ` • ${selectedPortfolio.institution}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateHolding}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add Holding
              </button>
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold">${selectedPortfolio.totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Cost Basis</p>
                <p className="text-2xl font-bold">${selectedPortfolio.totalCostBasis.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Gain/Loss</p>
                <p className={`text-2xl font-bold ${selectedPortfolio.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${selectedPortfolio.gainLoss.toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Return</p>
                <p className={`text-2xl font-bold ${selectedPortfolio.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedPortfolio.gainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Holdings */}
            {holdings.length === 0 ? (
              <EmptyState
                variant="portfolio"
                title="No holdings yet"
                description="Add your first holding to start tracking this portfolio"
                actionText="Add Holding"
                onAction={handleCreateHolding}
              />
            ) : (
              <EnhancedHoldingsList
                holdings={holdings}
                onEdit={handleEditHolding}
                onDelete={handleDeleteHolding}
                onQuickPurchase={handleQuickPurchase}
                onRecordDividend={handleRecordDividend}
                onRefreshPrices={handleRefreshPrices}
                onInlineUpdate={handleInlineHoldingUpdate}
              />
            )}
          </div>
        )}

        {/* Modals */}
        {showPortfolioForm && (
          <PortfolioForm
            portfolio={editingPortfolio}
            onSubmit={handlePortfolioFormSubmit}
            onCancel={() => {
              setShowPortfolioForm(false);
              setEditingPortfolio(null);
            }}
          />
        )}

        {showHoldingForm && selectedPortfolio && (
          <EnhancedHoldingForm
            holding={editingHolding}
            portfolioName={selectedPortfolio.name}
            onSubmit={handleHoldingFormSubmit}
            onCancel={() => {
              setShowHoldingForm(false);
              setEditingHolding(null);
            }}
          />
        )}

        {showQuickPurchaseForm && selectedPortfolio && (
          <QuickPurchaseForm
            holdings={holdings}
            selectedHolding={selectedHoldingForPurchase}
            portfolioId={selectedPortfolio.id}
            onSubmit={handleQuickPurchaseSubmit}
            onCancel={() => {
              setShowQuickPurchaseForm(false);
              setSelectedHoldingForPurchase(null);
            }}
          />
        )}

        {showDividendRecordForm && selectedHoldingForDividend && (
          <DividendRecordForm
            holding={selectedHoldingForDividend}
            onSubmit={handleDividendRecordSubmit}
            onCancel={() => {
              setShowDividendRecordForm(false);
              setSelectedHoldingForDividend(null);
            }}
          />
        )}

        {deleteConfirmation && (
          <EnhancedDeleteModal
            type={deleteConfirmation.type}
            item={deleteConfirmation.item}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirmation(null)}
            isOpen={!!deleteConfirmation}
          />
        )}

        {showImportWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Import Portfolio</h2>
                  <button
                    onClick={() => setShowImportWizard(false)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <ImportWizard
                  onComplete={async (result) => {
                    if (result.success) {
                      await loadPortfolios();
                      setShowImportWizard(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Floating Action Button */}
        <FloatingActionButton />
      </div>
    </SuperCardsAppShell>
  );
}