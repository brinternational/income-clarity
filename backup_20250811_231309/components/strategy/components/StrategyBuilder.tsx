'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  MinusCircle, 
  Target, 
  PieChart,
  TrendingUp,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface Asset {
  ticker: string;
  name: string;
  type: 'stock' | 'etf' | 'reit' | 'bond';
  yield: number;
  category: 'dividend' | 'growth' | 'reit' | 'bond' | 'options';
  weight: number;
}

interface StrategyBuilderProps {
  onStrategyChange: (allocation: Record<string, number>) => void;
  initialAllocation?: Record<string, number>;
  className?: string;
}

const AVAILABLE_ASSETS: Omit<Asset, 'weight'>[] = [
  // Dividend ETFs
  { ticker: 'SCHD', name: 'Schwab US Dividend Equity', type: 'etf', yield: 0.035, category: 'dividend' },
  { ticker: 'VYM', name: 'Vanguard High Dividend Yield', type: 'etf', yield: 0.029, category: 'dividend' },
  { ticker: 'VIG', name: 'Vanguard Dividend Appreciation', type: 'etf', yield: 0.018, category: 'dividend' },
  { ticker: 'DGRO', name: 'iShares Core Dividend Growth', type: 'etf', yield: 0.022, category: 'dividend' },
  
  // High Yield ETFs
  { ticker: 'JEPI', name: 'JPMorgan Equity Premium Income', type: 'etf', yield: 0.082, category: 'options' },
  { ticker: 'QYLD', name: 'Global X NASDAQ Covered Call', type: 'etf', yield: 0.115, category: 'options' },
  { ticker: 'XYLD', name: 'Global X S&P 500 Covered Call', type: 'etf', yield: 0.095, category: 'options' },
  
  // REIT ETFs
  { ticker: 'VNQ', name: 'Vanguard Real Estate', type: 'reit', yield: 0.038, category: 'reit' },
  { ticker: 'SCHH', name: 'Schwab US REIT', type: 'reit', yield: 0.042, category: 'reit' },
  
  // Broad Market
  { ticker: 'VTI', name: 'Vanguard Total Stock Market', type: 'etf', yield: 0.015, category: 'growth' },
  { ticker: 'SPY', name: 'SPDR S&P 500', type: 'etf', yield: 0.013, category: 'growth' },
  { ticker: 'VXUS', name: 'Vanguard Total Intl Stock', type: 'etf', yield: 0.028, category: 'growth' },
  
  // Bonds
  { ticker: 'BND', name: 'Vanguard Total Bond Market', type: 'bond', yield: 0.025, category: 'bond' },
  { ticker: 'SCHZ', name: 'Schwab US Aggregate Bond', type: 'bond', yield: 0.027, category: 'bond' }
];

const STRATEGY_TEMPLATES = {
  dividend_growth: {
    name: 'Dividend Growth',
    description: 'Focus on companies with consistent dividend increases',
    allocation: { SCHD: 0.4, VIG: 0.3, DGRO: 0.3 }
  },
  high_yield: {
    name: 'High Yield',
    description: 'Maximize current dividend income',
    allocation: { JEPI: 0.35, QYLD: 0.25, VYM: 0.25, VNQ: 0.15 }
  },
  puerto_rico: {
    name: 'Puerto Rico Optimized',
    description: 'Tax-advantaged strategy for PR residents',
    allocation: { VYM: 0.3, SCHD: 0.25, JEPI: 0.25, VNQ: 0.2 }
  },
  balanced: {
    name: '60/40 Balanced',
    description: 'Traditional balanced portfolio',
    allocation: { VTI: 0.6, BND: 0.4 }
  }
};

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({
  onStrategyChange,
  initialAllocation = {},
  className = ''
}) => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>(() => {
    // Initialize from initial allocation
    return Object.entries(initialAllocation).map(([ticker, weight]) => {
      const asset = AVAILABLE_ASSETS.find(a => a.ticker === ticker);
      return asset ? { ...asset, weight } : { ticker, name: ticker, type: 'etf' as const, yield: 0.02, category: 'dividend' as const, weight };
    });
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const totalWeight = useMemo(() => 
    selectedAssets.reduce((sum, asset) => sum + asset.weight, 0), 
    [selectedAssets]
  );

  const weightedYield = useMemo(() => 
    selectedAssets.reduce((sum, asset) => sum + (asset.weight * asset.yield), 0), 
    [selectedAssets]
  );

  const addAsset = (assetTemplate: Omit<Asset, 'weight'>) => {
    const newAsset: Asset = { ...assetTemplate, weight: 0 };
    const updatedAssets = [...selectedAssets, newAsset];
    setSelectedAssets(updatedAssets);
  };

  const removeAsset = (ticker: string) => {
    const updatedAssets = selectedAssets.filter(asset => asset.ticker !== ticker);
    setSelectedAssets(updatedAssets);
    updateAllocation(updatedAssets);
  };

  const updateAssetWeight = (ticker: string, weight: number) => {
    const updatedAssets = selectedAssets.map(asset =>
      asset.ticker === ticker ? { ...asset, weight: weight / 100 } : asset
    );
    setSelectedAssets(updatedAssets);
    updateAllocation(updatedAssets);
  };

  const updateAllocation = (assets: Asset[]) => {
    const allocation = assets.reduce((acc, asset) => {
      acc[asset.ticker] = asset.weight;
      return acc;
    }, {} as Record<string, number>);
    onStrategyChange(allocation);
  };

  const applyTemplate = (templateKey: keyof typeof STRATEGY_TEMPLATES) => {
    const template = STRATEGY_TEMPLATES[templateKey];
    const newAssets: Asset[] = Object.entries(template.allocation).map(([ticker, weight]) => {
      const assetTemplate = AVAILABLE_ASSETS.find(a => a.ticker === ticker);
      return assetTemplate ? { ...assetTemplate, weight } : {
        ticker,
        name: ticker,
        type: 'etf' as const,
        yield: 0.02,
        category: 'dividend' as const,
        weight
      };
    });
    setSelectedAssets(newAssets);
    updateAllocation(newAssets);
  };

  const normalizeWeights = () => {
    if (totalWeight === 0) return;
    const normalizedAssets = selectedAssets.map(asset => ({
      ...asset,
      weight: asset.weight / totalWeight
    }));
    setSelectedAssets(normalizedAssets);
    updateAllocation(normalizedAssets);
  };

  const clearStrategy = () => {
    setSelectedAssets([]);
    onStrategyChange({});
  };

  const filteredAssets = useMemo(() => {
    if (selectedCategory === 'all') return AVAILABLE_ASSETS;
    return AVAILABLE_ASSETS.filter(asset => asset.category === selectedCategory);
  }, [selectedCategory]);

  const getAssetColor = (category: string) => {
    switch (category) {
      case 'dividend': return 'text-blue-600 bg-blue-50';
      case 'growth': return 'text-green-600 bg-green-50';
      case 'reit': return 'text-purple-600 bg-purple-50';
      case 'bond': return 'text-gray-600 bg-gray-50';
      case 'options': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Strategy Templates */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">Quick Start Templates</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(STRATEGY_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => applyTemplate(key as keyof typeof STRATEGY_TEMPLATES)}
              className="p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-left transition-all"
            >
              <h6 className="font-medium text-gray-900 text-sm mb-1">{template.name}</h6>
              <p className="text-xs text-gray-600">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Strategy Overview */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
            Strategy Overview
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={normalizeWeights}
              disabled={totalWeight === 0}
              className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Normalize to 100%
            </button>
            <button
              onClick={clearStrategy}
              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Weight</p>
            <p className={`text-xl font-bold ${Math.abs(totalWeight - 1) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {(totalWeight * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Expected Yield</p>
            <p className="text-xl font-bold text-blue-600">
              {(weightedYield * 100).toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Assets</p>
            <p className="text-xl font-bold text-purple-600">
              {selectedAssets.length}
            </p>
          </div>
        </div>

        {Math.abs(totalWeight - 1) > 0.01 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Portfolio weights should sum to 100%. Current total: {(totalWeight * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Assets */}
      {selectedAssets.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Portfolio Allocation</h4>
          <div className="space-y-3">
            {selectedAssets.map((asset, index) => (
              <motion.div
                key={asset.ticker}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{asset.ticker}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getAssetColor(asset.category)}`}>
                        {asset.category}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{(asset.yield * 100).toFixed(2)}% yield</span>
                  </div>
                  <p className="text-sm text-gray-600">{asset.name}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={asset.weight * 100}
                    onChange={(e) => updateAssetWeight(asset.ticker, Number(e.target.value))}
                    className="w-24"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={(asset.weight * 100).toFixed(1)}
                    onChange={(e) => updateAssetWeight(asset.ticker, Number(e.target.value))}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-right"
                  />
                  <span className="text-sm text-gray-600">%</span>
                  <button
                    onClick={() => removeAsset(asset.ticker)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Assets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Add Assets</h4>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="dividend">Dividend ETFs</option>
            <option value="growth">Growth ETFs</option>
            <option value="reit">REITs</option>
            <option value="bond">Bonds</option>
            <option value="options">Covered Calls</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {filteredAssets
            .filter(asset => !selectedAssets.some(selected => selected.ticker === asset.ticker))
            .map((asset) => (
              <button
                key={asset.ticker}
                onClick={() => addAsset(asset)}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-gray-50 text-left transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{asset.ticker}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getAssetColor(asset.category)}`}>
                      {asset.category}
                    </span>
                    <span className="text-sm text-green-600">{(asset.yield * 100).toFixed(2)}%</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{asset.name}</p>
                </div>
                <PlusCircle className="h-5 w-5 text-indigo-600 ml-2 flex-shrink-0" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};