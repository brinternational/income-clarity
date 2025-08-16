'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, PieChart, BarChart3, Download, Share2, Target, Zap, Award } from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { exportElementAsImage, exportDataAsCSV } from '@/utils/exportUtils'

export function PortfolioOverview() {
  const { portfolio, holdings } = usePortfolio()
  const [isExporting, setIsExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const totalValue = portfolio?.totalValue || 0
  const monthlyIncome = portfolio?.monthlyGrossIncome || 0
  const marginUsed = portfolio?.marginUsed || 0
  const marginAvailable = 50000 // Mock available margin
  const marginUtilization = marginAvailable > 0 ? (marginUsed / (marginUsed + marginAvailable)) * 100 : 0

  // Calculate diversification metrics
  const calculateDiversificationScore = () => {
    if (!holdings || holdings.length === 0) return 0
    
    // Factor in sector diversity, position sizes, and concentration risk
    const sectors = new Set(holdings.map(h => h.sector || 'Unknown'))
    const sectorDiversity = Math.min(sectors.size / 11, 1) * 40 // Max 11 sectors, 40 points
    
    // Position size balance (penalize heavy concentration)
    const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0)
    const positionSizes = holdings.map(h => (h.currentValue || 0) / totalPortfolioValue)
    const maxPosition = Math.max(...positionSizes)
    const balanceScore = maxPosition < 0.1 ? 30 : maxPosition < 0.2 ? 20 : maxPosition < 0.3 ? 10 : 0
    
    // Number of holdings (diversification breadth)
    const breadthScore = holdings.length >= 20 ? 30 : holdings.length >= 10 ? 20 : holdings.length >= 5 ? 10 : 0
    
    return Math.round(sectorDiversity + balanceScore + breadthScore)
  }

  const diversificationScore = calculateDiversificationScore()
  
  // Rebalancing alerts
  const getRebalancingAlerts = () => {
    if (!holdings || holdings.length === 0) return []
    
    const alerts: Array<{
      type: 'overweight' | 'sector_concentration' | 'underperformance';
      ticker?: string;
      sector?: string;
      weight?: number;
      performance?: number;
      message: string;
    }> = []
    const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0)
    
    // Check for overweight positions
    const overweightThreshold = 0.15 // 15%
    holdings.forEach(holding => {
      const weight = (holding.currentValue || 0) / totalValue
      if (weight > overweightThreshold) {
        alerts.push({
          type: 'overweight' as const,
          ticker: holding.ticker,
          weight: weight * 100,
          message: `${holding.ticker} is ${(weight * 100).toFixed(1)}% of portfolio (>15%)`
        })
      }
    })
    
    // Check sector concentration
    const sectorWeights: Record<string, number> = {}
    holdings.forEach(holding => {
      const sector = holding.sector || 'Unknown'
      sectorWeights[sector] = (sectorWeights[sector] || 0) + ((holding.currentValue || 0) / totalValue)
    })
    
    Object.entries(sectorWeights).forEach(([sector, weight]) => {
      if (weight > 0.3) { // 30% sector concentration
        alerts.push({
          type: 'sector_concentration' as const,
          sector,
          weight: weight * 100,
          message: `${sector} sector is ${(weight * 100).toFixed(1)}% of portfolio (>30%)`
        })
      }
    })
    
    return alerts.slice(0, 3) // Limit to top 3 alerts
  }

  const rebalancingAlerts = getRebalancingAlerts()
  
  // Export functions
  const handleExportImage = async () => {
    if (!cardRef.current) return
    setIsExporting(true)
    
    try {
      await exportElementAsImage(cardRef.current, {
        filename: 'portfolio-overview',
        backgroundColor: '#ffffff'
      })
    } catch (error) {
      // console.error('Export failed:', error)
    // } finally {
      setIsExporting(false)
    }
  }
  
  const handleExportData = () => {
    const exportData = {
      totalValue,
      monthlyIncome,
      annualIncome: monthlyIncome * 12,
      portfolioYield: totalValue > 0 ? ((monthlyIncome * 12 / totalValue) * 100).toFixed(2) : '0.00',
      holdingsCount: holdings?.length || 0,
      marginUsed,
      marginUtilization: marginUtilization.toFixed(1),
      diversificationScore,
      exportDate: new Date().toISOString()
    }
    
    exportDataAsCSV([exportData], 'portfolio-overview')
  }

  return (
    <motion.div 
      ref={cardRef}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <TrendingUp className="w-6 h-6 text-green-600" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Portfolio Overview</h2>
            <p className="text-gray-600">Total value and performance insights</p>
          </div>
        </div>
        
        {/* Export Controls */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleExportData}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Export data as CSV"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={handleExportImage}
            disabled={isExporting}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Export as image"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Portfolio Value */}
        <motion.div 
          className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div 
            className="text-3xl font-bold text-green-600 mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            ${totalValue.toLocaleString()}
          </motion.div>
          <div className="text-gray-600">Total Portfolio Value</div>
          
          {/* Animated background sparkles */}
          <motion.div
            className="absolute top-2 right-2 text-green-300 opacity-30"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-4 h-4" />
          </motion.div>
        </motion.div>

        {/* Diversification Score */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                diversificationScore >= 80 ? 'bg-green-100 text-green-600' :
                diversificationScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Diversification Score</div>
                <div className="text-sm text-gray-600">Risk management rating</div>
              </div>
            </div>
            <div className={`text-2xl font-bold ${
              diversificationScore >= 80 ? 'text-green-600' :
              diversificationScore >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {diversificationScore}/100
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className={`h-2 rounded-full ${
                  diversificationScore >= 80 ? 'bg-green-500' :
                  diversificationScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${diversificationScore}%` }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly Income */}
          <motion.div 
            className="bg-blue-50 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors cursor-pointer"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="text-2xl font-bold text-blue-600 mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              ${monthlyIncome.toLocaleString()}
            </motion.div>
            <div className="text-sm text-blue-700 font-medium">Monthly Income</div>
            <div className="text-xs text-gray-600 mt-1">
              ${(monthlyIncome * 12).toLocaleString()}/year
            </div>
            {monthlyIncome > 0 && (
              <motion.div
                className="mt-2 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <TrendingUp className="w-3 h-3 text-green-500" />
              </motion.div>
            )}
          </motion.div>

          {/* Yield */}
          <motion.div 
            className="bg-purple-50 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors cursor-pointer"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="text-2xl font-bold text-purple-600 mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              {totalValue > 0 ? ((monthlyIncome * 12 / totalValue) * 100).toFixed(1) : '0.0'}%
            </motion.div>
            <div className="text-sm text-purple-700 font-medium">Portfolio Yield</div>
            <div className="text-xs text-gray-600 mt-1">Annual dividend yield</div>
            {totalValue > 0 && ((monthlyIncome * 12 / totalValue) * 100) > 4 && (
              <motion.div
                className="mt-2 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <Award className="w-3 h-3 text-gold-500" />
              </motion.div>
            )}
          </motion.div>

          {/* Holdings Count */}
          <motion.div 
            className="bg-orange-50 rounded-lg p-4 text-center hover:bg-orange-100 transition-colors cursor-pointer"
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div 
              className="text-2xl font-bold text-orange-600 mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              {holdings?.length || 0}
            </motion.div>
            <div className="text-sm text-orange-700 font-medium">Holdings</div>
            <div className="text-xs text-gray-600 mt-1">Active positions</div>
            {(holdings?.length || 0) >= 20 && (
              <motion.div
                className="mt-2 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <Target className="w-3 h-3 text-green-500" />
              </motion.div>
            )}
          </motion.div>

          {/* Margin Usage */}
          <motion.div 
            className={`rounded-lg p-4 text-center transition-colors cursor-pointer ${
              marginUtilization > 50 ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'
            }`}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div 
              className={`text-2xl font-bold mb-1 ${
                marginUtilization > 50 ? 'text-red-600' : 'text-gray-600'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
            >
              {marginUtilization.toFixed(1)}%
            </motion.div>
            <div className={`text-sm font-medium ${
              marginUtilization > 50 ? 'text-red-700' : 'text-gray-700'
            }`}>
              Margin Usage
            </div>
            <div className="text-xs text-gray-600 mt-1">
              ${marginUsed.toLocaleString()} used
            </div>
            {marginUtilization > 70 && (
              <motion.div
                className="mt-2 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                <AlertTriangle className="w-3 h-3 text-red-500" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Rebalancing Alerts */}
        {rebalancingAlerts.length > 0 && (
          <motion.div 
            className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-800">Rebalancing Alerts</h4>
            </div>
            <div className="space-y-2">
              {rebalancingAlerts.map((alert, index) => (
                <motion.div 
                  key={index}
                  className="text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  {alert.message}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Performance Summary */}
        {portfolio?.spyComparison && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">vs SPY Performance</div>
              <div className={`text-sm font-semibold ${
                portfolio.spyComparison.outperformance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {portfolio.spyComparison.outperformance >= 0 ? '+' : ''}
                {(portfolio.spyComparison.outperformance * 100).toFixed(1)}%
              </div>
            </div>
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>Portfolio: {(portfolio.spyComparison.portfolioReturn * 100).toFixed(1)}%</span>
              <span>SPY: {(portfolio.spyComparison.spyReturn * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions */}
        <motion.div 
          className="flex space-x-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button 
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Details</span>
          </motion.button>
          <motion.button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target className="w-4 h-4" />
            <span>Rebalance</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}