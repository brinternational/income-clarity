/**
 * Manual Portfolio Entry Hub
 * Central component that brings together all manual portfolio management features
 * Integrates: Add Holding, Quick Purchase, Record Dividend, Transaction History, Reset Demo
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/design-system/core/Button'
import { Card } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Alert } from '@/components/design-system/core/Alert'
import { AddHoldingFormDS } from './AddHoldingFormDS'
import { QuickPurchaseFormDS } from './QuickPurchaseFormDS'
import { RecordDividendFormDS } from './RecordDividendFormDS'
import { TransactionHistoryDS } from './TransactionHistoryDS'
import { ResetDemoDataDS } from './ResetDemoDataDS'
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  History, 
  MoreHorizontal,
  Calendar,
  PieChart,
  Refresh
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface Portfolio {
  id: string
  name: string
  holdings: Holding[]
}

interface Holding {
  id: string
  ticker: string
  shares: number
  costBasis: number
  currentPrice?: number
  dividendYield?: number
  purchaseDate: string
  currentValue: number
  gainLoss: number
  gainLossPercent: number
}

interface ManualPortfolioEntryHubProps {
  portfolio: Portfolio
  onPortfolioUpdate?: () => void
}

export function ManualPortfolioEntryHub({ 
  portfolio, 
  onPortfolioUpdate 
}: ManualPortfolioEntryHubProps) {
  // Modal states
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [showQuickPurchase, setShowQuickPurchase] = useState(false)
  const [showRecordDividend, setShowRecordDividend] = useState(false)
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)
  
  // Selected holding for actions
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null)
  
  // UI states
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Auto-refresh on updates
  const handleSuccess = (message?: string) => {
    if (message) {
      setSuccessMessage(message)
      setTimeout(() => setSuccessMessage(''), 5000)
    }
    onPortfolioUpdate?.()
  }

  // Handle holding actions
  const handleQuickPurchase = (holding: Holding) => {
    setSelectedHolding(holding)
    setShowQuickPurchase(true)
  }

  const handleRecordDividend = (holding: Holding) => {
    setSelectedHolding(holding)
    setShowRecordDividend(true)
  }

  const refreshPrices = async () => {
    setRefreshing(true)
    try {
      logger.log('🔄 Refreshing holding prices...')
      
      const response = await fetch(`/api/holdings/refresh-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ portfolioId: portfolio.id })
      })

      if (response.ok) {
        handleSuccess('Prices refreshed successfully')
      } else {
        throw new Error('Failed to refresh prices')
      }
    } catch (err) {
      logger.error('Error refreshing prices:', err)
      setError('Failed to refresh prices')
      setTimeout(() => setError(''), 5000)
    } finally {
      setRefreshing(false)
    }
  }

  // Calculate portfolio summary
  const portfolioSummary = React.useMemo(() => {
    const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const totalCost = portfolio.holdings.reduce((sum, h) => sum + (h.shares * h.costBasis), 0)
    const totalGainLoss = totalValue - totalCost
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
    
    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      holdingCount: portfolio.holdings.length
    }
  }, [portfolio.holdings])

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Portfolio Summary Card */}
      <Card className="bg-gradient-to-r from-brand-50 to-secondary-50 dark:from-brand-900/20 dark:to-secondary-900/20 border-brand-200 dark:border-brand-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-brand-900 dark:text-brand-100">
                {portfolio.name}
              </h2>
              <p className="text-sm text-brand-700 dark:text-brand-300">
                {portfolioSummary.holdingCount} holdings
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPrices}
                loading={refreshing}
                leftIcon={<Refresh className="w-4 h-4" />}
              >
                Refresh Prices
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddHolding(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Holding
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-brand-700 dark:text-brand-300">Total Value</span>
              <div className="text-lg font-semibold text-brand-900 dark:text-brand-100">
                ${portfolioSummary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-brand-700 dark:text-brand-300">Total Cost</span>
              <div className="text-lg font-semibold text-brand-900 dark:text-brand-100">
                ${portfolioSummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-brand-700 dark:text-brand-300">Total Gain/Loss</span>
              <div className={cn(
                'text-lg font-semibold',
                portfolioSummary.totalGainLoss >= 0 
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-error-600 dark:text-error-400'
              )}>
                ${portfolioSummary.totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-brand-700 dark:text-brand-300">% Gain/Loss</span>
              <div className={cn(
                'text-lg font-semibold',
                portfolioSummary.totalGainLossPercent >= 0 
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-error-600 dark:text-error-400'
              )}>
                {portfolioSummary.totalGainLossPercent >= 0 ? '+' : ''}{portfolioSummary.totalGainLossPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-success-200 dark:border-success-800 hover:bg-success-50 dark:hover:bg-success-900/20 transition-colors cursor-pointer" 
              onClick={() => setShowAddHolding(true)}>
          <div className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-success-100 dark:bg-success-900/30 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="font-medium text-success-900 dark:text-success-100 mb-1">Add Holding</h3>
            <p className="text-xs text-success-700 dark:text-success-300">
              Add new stocks or funds to your portfolio
            </p>
          </div>
        </Card>
        
        <Card className="border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors cursor-pointer"
              onClick={() => setShowTransactionHistory(true)}>
          <div className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="font-medium text-brand-900 dark:text-brand-100 mb-1">Transaction History</h3>
            <p className="text-xs text-brand-700 dark:text-brand-300">
              View all your trades and dividends
            </p>
          </div>
        </Card>
        
        <ResetDemoDataDS 
          variant="card" 
          onSuccess={() => handleSuccess('Demo data loaded successfully')}
          className="col-span-1 md:col-span-2 lg:col-span-2"
        />
      </div>

      {/* Holdings List */}
      {portfolio.holdings.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Your Holdings
              </h3>
              <Badge variant="neutral">
                {portfolio.holdings.length} {portfolio.holdings.length === 1 ? 'holding' : 'holdings'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {portfolio.holdings.map((holding) => (
                <div key={holding.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {holding.ticker}
                        </h4>
                        <Badge 
                          variant={holding.gainLoss >= 0 ? 'success' : 'error'}
                          className="text-xs"
                        >
                          {holding.gainLoss >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {holding.shares.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} shares @ ${holding.costBasis.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        ${holding.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={cn(
                        'text-sm',
                        holding.gainLoss >= 0 
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-error-600 dark:text-error-400'
                      )}>
                        {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickPurchase(holding)}
                        leftIcon={<Plus className="w-4 h-4" />}
                        title="Record additional purchase"
                      >
                        Buy More
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecordDividend(holding)}
                        leftIcon={<DollarSign className="w-4 h-4" />}
                        title="Record dividend payment"
                      >
                        Dividend
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {portfolio.holdings.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
            <PieChart className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            No Holdings Yet
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Start building your portfolio by adding your first holding or loading demo data.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="primary"
              onClick={() => setShowAddHolding(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Your First Holding
            </Button>
            <ResetDemoDataDS 
              variant="button"
              onSuccess={() => handleSuccess('Demo data loaded successfully')}
            />
          </div>
        </Card>
      )}

      {/* Modals */}
      <AddHoldingFormDS
        open={showAddHolding}
        onClose={() => setShowAddHolding(false)}
        portfolioId={portfolio.id}
        portfolioName={portfolio.name}
        onSuccess={() => {
          setShowAddHolding(false)
          handleSuccess('Holding added successfully')
        }}
      />

      {selectedHolding && (
        <>
          <QuickPurchaseFormDS
            open={showQuickPurchase}
            onClose={() => {
              setShowQuickPurchase(false)
              setSelectedHolding(null)
            }}
            holding={selectedHolding}
            onSuccess={() => {
              setShowQuickPurchase(false)
              setSelectedHolding(null)
              handleSuccess('Purchase recorded successfully')
            }}
          />

          <RecordDividendFormDS
            open={showRecordDividend}
            onClose={() => {
              setShowRecordDividend(false)
              setSelectedHolding(null)
            }}
            holding={selectedHolding}
            onSuccess={() => {
              setShowRecordDividend(false)
              setSelectedHolding(null)
              handleSuccess('Dividend recorded successfully')
            }}
          />
        </>
      )}

      <TransactionHistoryDS
        open={showTransactionHistory}
        onClose={() => setShowTransactionHistory(false)}
        portfolioId={portfolio.id}
      />
    </div>
  )
}