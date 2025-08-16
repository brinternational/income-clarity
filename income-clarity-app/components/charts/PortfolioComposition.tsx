'use client'

import React, { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Zap, 
  Home,
  Heart,
  Shield,
  Truck,
  Wrench,
  Users,
  AlertCircle
} from 'lucide-react'

// Helper functions for data processing
const getCompanyName = (ticker: string): string => {
  const companyNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'JNJ': 'Johnson & Johnson',
    'KO': 'The Coca-Cola Company',
    'PG': 'Procter & Gamble',
    'MMM': '3M Company',
    'T': 'AT&T Inc.',
    'VZ': 'Verizon Communications',
    'SCHD': 'Schwab US Dividend Equity ETF',
    'SPY': 'SPDR S&P 500 ETF Trust',
    'VTI': 'Vanguard Total Stock Market ETF'
  }
  return companyNames[ticker] || ticker
}

const getSectorFromTicker = (ticker: string): string => {
  const sectorMap: { [key: string]: string } = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'GOOGL': 'Technology',
    'AMZN': 'Consumer Cyclical',
    'TSLA': 'Consumer Cyclical',
    'JNJ': 'Healthcare',
    'KO': 'Consumer Defensive',
    'PG': 'Consumer Defensive',
    'MMM': 'Industrials',
    'T': 'Communication',
    'VZ': 'Communication',
    'SCHD': 'Financial Services',
    'SPY': 'Financial Services',
    'VTI': 'Financial Services'
  }
  return sectorMap[ticker] || 'Other'
}

const getRiskLevel = (ticker: string): string => {
  const riskMap: { [key: string]: string } = {
    'AAPL': 'Medium',
    'MSFT': 'Low',
    'GOOGL': 'Medium',
    'AMZN': 'High',
    'TSLA': 'High',
    'JNJ': 'Low',
    'KO': 'Low',
    'PG': 'Low',
    'MMM': 'Medium',
    'T': 'Medium',
    'VZ': 'Medium',
    'SCHD': 'Low',
    'SPY': 'Low',
    'VTI': 'Low'
  }
  return riskMap[ticker] || 'Medium'
}

interface HoldingData {
  symbol: string
  name: string
  value: number
  percentage: number
  sector: string
  dividendYield: number
  risk: 'Low' | 'Medium' | 'High'
}

interface SectorData {
  name: string
  value: number
  percentage: number
  color: string
  icon: React.ReactNode
  holdings: HoldingData[]
  avgYield: number
  riskLevel: string
}

interface PortfolioCompositionProps {
  data?: HoldingData[]
  className?: string
  showSectorBreakdown?: boolean
  holdings?: {
    id: string
    ticker: string
    shares: number
    costBasis: number
    currentPrice?: number
    dividendYield?: number
    sector?: string
  }[]
}

const sectorConfig = {
  'Technology': { 
    color: '#3b82f6', 
    icon: <Zap className="w-4 h-4" />,
    riskMultiplier: 1.2
  },
  'Healthcare': { 
    color: '#ef4444', 
    icon: <Heart className="w-4 h-4" />,
    riskMultiplier: 0.9
  },
  'Financials': { 
    color: '#10b981', 
    icon: <DollarSign className="w-4 h-4" />,
    riskMultiplier: 1.1
  },
  'Real Estate': { 
    color: '#f59e0b', 
    icon: <Home className="w-4 h-4" />,
    riskMultiplier: 1.0
  },
  'Consumer Defensive': { 
    color: '#8b5cf6', 
    icon: <Shield className="w-4 h-4" />,
    riskMultiplier: 0.8
  },
  'Industrials': { 
    color: '#f97316', 
    icon: <Wrench className="w-4 h-4" />,
    riskMultiplier: 1.0
  },
  'Communication': { 
    color: '#06b6d4', 
    icon: <Users className="w-4 h-4" />,
    riskMultiplier: 1.1
  },
  'Transportation': { 
    color: '#84cc16', 
    icon: <Truck className="w-4 h-4" />,
    riskMultiplier: 1.2
  },
  'Diversified': { 
    color: '#6b7280', 
    icon: <Building2 className="w-4 h-4" />,
    riskMultiplier: 0.7
  }
}

// Mock data generator
// Safe calculation helpers
const safePercentage = (value: number | undefined, total: number | undefined): string => {
  if (!value || !total || total === 0 || isNaN(value) || isNaN(total)) return '0.0';
  const percentage = (value / total) * 100;
  return isNaN(percentage) ? '0.0' : percentage.toFixed(1);
};

const safeNumber = (value: number | undefined, fallback = 0): number => {
  return value && !isNaN(value) ? value : fallback;
};

const safeYield = (value: number | undefined): string => {
  const safe = safeNumber(value, 0);
  return safe.toFixed(1);
};

const generateMockData = (): HoldingData[] => {
  const mockHoldings: HoldingData[] = [
    { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF', value: 45000, percentage: 30, sector: 'Diversified', dividendYield: 11.2, risk: 'Medium' },
    { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', value: 30000, percentage: 20, sector: 'Diversified', dividendYield: 3.8, risk: 'Low' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', value: 22500, percentage: 15, sector: 'Diversified', dividendYield: 1.4, risk: 'Low' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', value: 15000, percentage: 10, sector: 'Technology', dividendYield: 0.7, risk: 'Medium' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', value: 12000, percentage: 8, sector: 'Healthcare', dividendYield: 2.9, risk: 'Low' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co', value: 9000, percentage: 6, sector: 'Financials', dividendYield: 2.4, risk: 'Medium' },
    { symbol: 'O', name: 'Realty Income Corporation', value: 7500, percentage: 5, sector: 'Real Estate', dividendYield: 5.2, risk: 'Medium' },
    { symbol: 'PG', name: 'Procter & Gamble Company', value: 6000, percentage: 4, sector: 'Consumer Defensive', dividendYield: 2.6, risk: 'Low' },
    { symbol: 'UNP', name: 'Union Pacific Corporation', value: 3000, percentage: 2, sector: 'Transportation', dividendYield: 2.1, risk: 'Medium' }
  ]
  
  return mockHoldings
}

export function PortfolioComposition({
  data,
  className = '',
  showSectorBreakdown = true,
  holdings
}: PortfolioCompositionProps) {
  const [view, setView] = useState<'sector' | 'holdings'>('sector')
  const [selectedSector, setSelectedSector] = useState<string | null>(null)

  const holdingsData = useMemo(() => {
    // Use provided data first
    if (data && data.length > 0) {
      return data
    }
    
    // Convert real holdings to chart format
    if (holdings && holdings.length > 0) {
      const totalValue = holdings.reduce((sum, holding) => 
        sum + (holding.shares * (holding.currentPrice || holding.costBasis)), 0
      )
      
      return holdings
        .filter(holding => holding.currentPrice || holding.costBasis) // Only holdings with values
        .map(holding => {
          const value = holding.shares * (holding.currentPrice || holding.costBasis)
          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0
          
          return {
            symbol: holding.ticker,
            name: getCompanyName(holding.ticker),
            value: value,
            percentage: percentage,
            sector: holding.sector || getSectorFromTicker(holding.ticker),
            dividendYield: holding.dividendYield || 0,
            risk: getRiskLevel(holding.ticker) as 'Low' | 'Medium' | 'High'
          }
        })
    }
    
    // Return empty array if no real data available
    return []
  }, [data, holdings])

  // Show empty state when no data
  if (holdingsData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Portfolio Composition
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyze your portfolio allocation by sector
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Holdings to Display
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add holdings to your portfolio to see composition analysis by sector and individual positions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Add Holdings
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Import Portfolio
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalValue = holdingsData.reduce((sum, holding) => sum + safeNumber(holding.value, 0), 0)
  
  // Group by sector
  const sectorData = useMemo(() => {
    const sectors = holdingsData.reduce((acc, holding) => {
      const sector = holding.sector
      if (!acc[sector]) {
        acc[sector] = {
          name: sector,
          value: 0,
          percentage: 0,
          color: sectorConfig[sector as keyof typeof sectorConfig]?.color || '#6b7280',
          icon: sectorConfig[sector as keyof typeof sectorConfig]?.icon || <Building2 className="w-4 h-4" />,
          holdings: [],
          avgYield: 0,
          riskLevel: 'Medium'
        }
      }
      
      acc[sector].value += safeNumber(holding.value, 0)
      acc[sector].holdings.push(holding)
      
      return acc
    }, {} as Record<string, SectorData>)
    
    // Calculate percentages and average yields
    Object.values(sectors).forEach(sector => {
      // Safe percentage calculation
      if (totalValue > 0 && !isNaN(totalValue)) {
        sector.percentage = (sector.value / totalValue) * 100;
        if (isNaN(sector.percentage)) sector.percentage = 0;
      } else {
        sector.percentage = 0;
      }
      
      // Safe average yield calculation
      if (sector.holdings.length > 0) {
        const totalYield = sector.holdings.reduce((sum, h) => sum + safeNumber(h.dividendYield, 0), 0);
        sector.avgYield = totalYield / sector.holdings.length;
        if (isNaN(sector.avgYield)) sector.avgYield = 0;
      } else {
        sector.avgYield = 0;
      }
      
      const avgRisk = sector.holdings.reduce((sum, h) => {
        return sum + (h.risk === 'Low' ? 1 : h.risk === 'Medium' ? 2 : 3)
      }, 0) / sector.holdings.length
      
      sector.riskLevel = avgRisk <= 1.5 ? 'Low' : avgRisk <= 2.5 ? 'Medium' : 'High'
    })
    
    return Object.values(sectors).sort((a, b) => b.percentage - a.percentage)
  }, [holdingsData, totalValue])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {view === 'sector' ? (
            <>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.name}</p>
              <div className="space-y-1">
                <p className="text-sm">Value: ${data.value.toLocaleString()}</p>
                <p className="text-sm">Percentage: {safePercentage(data.percentage, 100)}%</p>
                <p className="text-sm">Holdings: {data.holdings.length}</p>
                <p className="text-sm">Avg Yield: {safeYield(data.avgYield)}%</p>
                <p className="text-sm">Risk: {data.riskLevel}</p>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.symbol}</p>
              <div className="space-y-1">
                <p className="text-sm">{data.name}</p>
                <p className="text-sm">Value: ${data.value.toLocaleString()}</p>
                <p className="text-sm">Percentage: {safePercentage(data.percentage, 100)}%</p>
                <p className="text-sm">Yield: {safeYield(data.dividendYield)}%</p>
                <p className="text-sm">Risk: {data.risk}</p>
              </div>
            </>
          )}
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }: any) => {
    if (percentage < 5) return null // Don't show labels for small segments
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {safeNumber(percentage, 0).toFixed(0)}%
      </text>
    )
  }

  const displayData = view === 'sector' ? sectorData : holdingsData
  const chartData = view === 'sector' ? sectorData : holdingsData.map(h => ({ ...h, color: sectorConfig[h.sector as keyof typeof sectorConfig]?.color || '#6b7280' }))

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Portfolio Composition
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ${(totalValue / 1000).toFixed(1)}k total value
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setView('sector')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === 'sector'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            By Sector
          </button>
          <button
            onClick={() => setView('holdings')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === 'holdings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            By Holdings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm aspect-square">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey={view === 'sector' ? 'value' : 'value'}
                  onMouseEnter={(data) => setSelectedSector(data.name)}
                  onMouseLeave={() => setSelectedSector(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke={selectedSector === entry.name ? '#ffffff' : 'none'}
                      strokeWidth={selectedSector === entry.name ? 3 : 0}
                      style={{
                        filter: selectedSector === entry.name ? 'brightness(1.1)' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center Stats */}
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {displayData.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {view === 'sector' ? 'Sectors' : 'Holdings'}
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayData.map((item, index) => (
            <div 
              key={view === 'sector' ? item.name : (item as HoldingData).symbol}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedSector === item.name
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onMouseEnter={() => setSelectedSector(item.name)}
              onMouseLeave={() => setSelectedSector(null)}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: view === 'sector' ? (item as SectorData).color : sectorConfig[(item as HoldingData).sector as keyof typeof sectorConfig]?.color || '#6b7280' }}
                />
                {view === 'sector' && (
                  <div className="text-gray-600 dark:text-gray-400">
                    {(item as SectorData).icon}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {view === 'sector' ? item.name : (item as HoldingData).symbol}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {view === 'sector' 
                      ? `${(item as SectorData).holdings.length} holdings`
                      : (item as HoldingData).name
                    }
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {safePercentage(item.percentage, 100)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ${(item.value / 1000).toFixed(1)}k
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {view === 'sector' 
                    ? `${safeYield((item as SectorData).avgYield)}% yield`
                    : `${safeYield((item as HoldingData).dividendYield)}% yield`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {safeNumber(sectorData[0]?.percentage, 0).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Largest Position
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-bold ${
              sectorData.length >= 4 ? 'text-green-600' : 
              sectorData.length >= 3 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {sectorData.length >= 4 ? 'Excellent' : 
               sectorData.length >= 3 ? 'Good' : 'Basic'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Diversification
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {(() => {
                if (sectorData.length === 0) return '0.0';
                const weightedSum = sectorData.reduce((sum, s) => {
                  const yieldValue = safeNumber(s.avgYield, 0);
                  const percentage = safeNumber(s.percentage, 0);
                  return sum + (yieldValue * percentage);
                }, 0);
                const result = weightedSum / 100;
                return safeNumber(result, 0).toFixed(1);
              })()}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Weighted Avg Yield
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-bold ${
              sectorData.filter(s => s.riskLevel === 'High').length === 0 ? 'text-green-600' :
              sectorData.filter(s => s.riskLevel === 'High').length <= 1 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {sectorData.filter(s => s.riskLevel === 'High').length === 0 ? 'Conservative' :
               sectorData.filter(s => s.riskLevel === 'High').length <= 1 ? 'Balanced' : 'Aggressive'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Risk Profile
            </div>
          </div>
        </div>
      </div>

      {/* Rebalancing Suggestions */}
      {sectorData.some(s => safeNumber(s.percentage, 0) > 40) && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">Rebalancing Suggestion</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Consider rebalancing {sectorData.find(s => safeNumber(s.percentage, 0) > 40)?.name} sector as it represents 
            {safeNumber(sectorData.find(s => safeNumber(s.percentage, 0) > 40)?.percentage, 0).toFixed(0)}% of your portfolio.
          </p>
        </div>
      )}
    </div>
  )
}