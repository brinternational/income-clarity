'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  AlertTriangle,
  Zap,
  Clock,
  Users,
  Timer,
  Shield,
  DollarSign,
  Filter,
  ArrowUpDown,
  Eye,
  Download,
  Info
} from 'lucide-react';

interface Trade {
  id: string;
  action: 'buy' | 'sell';
  ticker: string;
  shares: number;
  lotId?: string;
  currentPrice: number;
  costBasis: number;
  holdingPeriod: number;
  taxStatus: 'short-term' | 'long-term' | 'qualified' | 'ordinary';
  taxImpact: number;
  reason: string;
}

interface WashSaleRisk {
  ticker: string;
  riskLevel: 'low' | 'medium' | 'high';
  daysUntilClear: number;
  alternative: string;
}

interface TradeRecommendationsProps {
  trades: Trade[];
  washSaleRisks: WashSaleRisk[];
  selectedTrades: string[];
  onTradeToggle: (tradeId: string) => void;
  onPreviewTrades: () => void;
  onExecuteTrades: () => void;
  executionMode: 'preview' | 'execute' | 'export';
}

type SortField = 'ticker' | 'action' | 'amount' | 'taxImpact' | 'holdingPeriod';
type FilterType = 'all' | 'buy' | 'sell' | 'tax-loss' | 'long-term';

export const TradeRecommendations: React.FC<TradeRecommendationsProps> = ({
  trades,
  washSaleRisks,
  selectedTrades,
  onTradeToggle,
  onPreviewTrades,
  onExecuteTrades,
  executionMode
}) => {
  const [sortField, setSortField] = useState<SortField>('taxImpact');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showDetails, setShowDetails] = useState<string[]>([]);

  // Filter and sort trades
  const filteredAndSortedTrades = React.useMemo(() => {
    let filtered = trades;

    // Apply filters
    switch (filter) {
      case 'buy':
        filtered = trades.filter(t => t.action === 'buy');
        break;
      case 'sell':
        filtered = trades.filter(t => t.action === 'sell');
        break;
      case 'tax-loss':
        filtered = trades.filter(t => t.taxImpact < 0);
        break;
      case 'long-term':
        filtered = trades.filter(t => t.taxStatus === 'long-term');
        break;
      default:
        filtered = trades;
    }

    // Sort trades
    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'ticker':
          aValue = a.ticker;
          bValue = b.ticker;
          break;
        case 'action':
          aValue = a.action;
          bValue = b.action;
          break;
        case 'amount':
          aValue = a.shares * a.currentPrice;
          bValue = b.shares * b.currentPrice;
          break;
        case 'taxImpact':
          aValue = a.taxImpact;
          bValue = b.taxImpact;
          break;
        case 'holdingPeriod':
          aValue = a.holdingPeriod;
          bValue = b.holdingPeriod;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [trades, filter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleDetails = (tradeId: string) => {
    setShowDetails(prev =>
      prev.includes(tradeId)
        ? prev.filter(id => id !== tradeId)
        : [...prev, tradeId]
    );
  };

  const getWashSaleRisk = (ticker: string) => {
    return washSaleRisks.find(risk => risk.ticker === ticker);
  };

  const getTotalImpact = (tradeIds: string[]) => {
    return trades
      .filter(t => tradeIds.includes(t.id))
      .reduce((sum, t) => sum + t.taxImpact, 0);
  };

  const getTotalAmount = (tradeIds: string[]) => {
    return trades
      .filter(t => tradeIds.includes(t.id))
      .reduce((sum, t) => sum + (t.shares * t.currentPrice), 0);
  };

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Trade Recommendations
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAndSortedTrades.length} recommendations • 
              {selectedTrades.length} selected • 
              Est. impact: ${getTotalImpact(selectedTrades).toLocaleString()}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 lg:mt-0">
            {/* Filter Options */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Trades</option>
                <option value="buy">Buy Only</option>
                <option value="sell">Sell Only</option>
                <option value="tax-loss">Tax Loss</option>
                <option value="long-term">Long-Term</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <select
                value={sortField}
                onChange={(e) => handleSort(e.target.value as SortField)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="taxImpact">Tax Impact</option>
                <option value="ticker">Ticker</option>
                <option value="action">Action</option>
                <option value="amount">Amount</option>
                <option value="holdingPeriod">Holding Period</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected Trades Summary */}
        {selectedTrades.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Selected:</span>
                  <span className="ml-1 font-bold">{selectedTrades.length}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Amount:</span>
                  <span className="ml-1 font-bold">${getTotalAmount(selectedTrades).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Tax Impact:</span>
                  <span className={`ml-1 font-bold ${
                    getTotalImpact(selectedTrades) < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getTotalImpact(selectedTrades) < 0 ? '+' : ''}$
                    {Math.abs(getTotalImpact(selectedTrades)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Status:</span>
                  <span className="ml-1 font-bold capitalize">{executionMode}</span>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <button
                  onClick={onPreviewTrades}
                  disabled={selectedTrades.length === 0}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={onExecuteTrades}
                  disabled={selectedTrades.length === 0 || executionMode !== 'execute'}
                  className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  <span>Execute</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trade List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAndSortedTrades.map((trade, index) => {
            const isSelected = selectedTrades.includes(trade.id);
            const ActionIcon = trade.action === 'buy' ? TrendingUp : TrendingDown;
            const actionColor = trade.action === 'buy' 
              ? 'text-green-600 bg-green-100' 
              : 'text-red-600 bg-red-100';
            const washSaleRisk = getWashSaleRisk(trade.ticker);
            const showDetail = showDetails.includes(trade.id);
            
            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-300 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onTradeToggle(trade.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Selection Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>

                      {/* Action Icon */}
                      <div className={`p-2 rounded-lg ${actionColor}`}>
                        <ActionIcon className="h-5 w-5" />
                      </div>

                      {/* Trade Details */}
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-bold text-gray-900 text-lg">{trade.ticker}</h4>
                          
                          {/* Status Badges */}
                          {trade.taxImpact < 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                              <Zap className="h-3 w-3 mr-1" />
                              Tax Loss
                            </span>
                          )}
                          
                          {trade.taxStatus === 'long-term' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
                              <Timer className="h-3 w-3 mr-1" />
                              Long-Term
                            </span>
                          )}
                          
                          {washSaleRisk && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                              washSaleRisk.riskLevel === 'high' 
                                ? 'bg-red-100 text-red-800'
                                : washSaleRisk.riskLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Wash Sale Risk
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="capitalize font-medium">{trade.action}</span> {trade.shares} shares
                          {trade.lotId && (
                            <span className="ml-2 text-blue-600 font-medium">({trade.lotId})</span>
                          )}
                        </p>
                        
                        <p className="text-xs text-gray-500 mt-1">{trade.reason}</p>
                      </div>
                    </div>

                    {/* Trade Values */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        ${(trade.shares * trade.currentPrice).toLocaleString()}
                      </p>
                      
                      {trade.taxImpact !== 0 && (
                        <p className={`text-sm font-medium ${
                          trade.taxImpact < 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Tax: {trade.taxImpact < 0 ? '+' : ''}${Math.abs(trade.taxImpact).toLocaleString()}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Held {Math.floor(trade.holdingPeriod / 30)} months
                      </p>
                      
                      {/* Details Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails(trade.id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-2 flex items-center"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        {showDetail ? 'Less' : 'More'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {showDetail && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Current Price:</span>
                            <p className="font-medium">${trade.currentPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Cost Basis:</span>
                            <p className="font-medium">${trade.costBasis.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Gain/Loss:</span>
                            <p className={`font-medium ${
                              (trade.currentPrice - trade.costBasis) * trade.shares >= 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              ${((trade.currentPrice - trade.costBasis) * trade.shares).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Tax Treatment:</span>
                            <p className="font-medium capitalize">{trade.taxStatus.replace('-', ' ')}</p>
                          </div>
                        </div>

                        {/* Wash Sale Warning */}
                        {washSaleRisk && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">
                                  Wash Sale Risk: {washSaleRisk.riskLevel}
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                  {washSaleRisk.daysUntilClear} days until wash sale window clears. 
                                  Consider {washSaleRisk.alternative} as alternative.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredAndSortedTrades.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trades found</h3>
          <p className="text-gray-600">
            Try adjusting your filters to see more trade recommendations.
          </p>
        </div>
      )}
    </div>
  );
};