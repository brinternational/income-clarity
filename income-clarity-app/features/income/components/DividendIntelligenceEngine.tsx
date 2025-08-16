'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Shield,
  DollarSign,
  Calendar,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Star,
  Clock,
  Award,
  RefreshCw,
  Filter,
  Search,
  Settings,
  Eye,
  Activity
} from 'lucide-react';

interface DividendStock {
  symbol: string;
  company: string;
  currentYield: number;
  dividendRate: number;
  payoutRatio: number;
  growthRate5Y: number;
  lastExDate: string;
  nextExDate: string;
  paymentFrequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
  sector: string;
  qualityScore: number;
  sustainabilityRating: 'High' | 'Medium' | 'Low';
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  marketCap: number;
  betaScore: number;
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
}

interface IntelligenceInsight {
  id: string;
  category: 'Opportunity' | 'Risk' | 'Optimization' | 'Alert';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  action: string;
  potentialImpact: number;
  confidence: number;
  timeframe: string;
}

interface DividendOptimization {
  currentYield: number;
  optimizedYield: number;
  improvementPotential: number;
  riskAdjustedReturn: number;
  suggestions: string[];
}

interface DividendIntelligenceEngineProps {
  className?: string;
}

// Empty array - no dividend stocks data available
const DIVIDEND_STOCKS: DividendStock[] = [];

// Empty array - no intelligence insights available until portfolio data is added
const INTELLIGENCE_INSIGHTS: IntelligenceInsight[] = [];

export const DividendIntelligenceEngine: React.FC<DividendIntelligenceEngineProps> = ({
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'insights' | 'analysis' | 'optimization' | 'screening'>('insights');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'yield' | 'quality' | 'growth' | 'recommendation'>('quality');

  const portfolioMetrics = useMemo(() => {
    // Return empty metrics when no dividend stocks are available
    if (DIVIDEND_STOCKS.length === 0) {
      return {
        totalValue: 0,
        weightedYield: 0,
        avgQualityScore: 0,
        avgGrowthRate: 0,
        totalHoldings: 0
      };
    }
    
    const totalValue = DIVIDEND_STOCKS.reduce((sum, stock) => sum + (stock.marketCap / 1000000), 0);
    const weightedYield = DIVIDEND_STOCKS.reduce((sum, stock) => 
      sum + (stock.currentYield * (stock.marketCap / 1000000)), 0
    ) / totalValue;
    const avgQualityScore = DIVIDEND_STOCKS.reduce((sum, stock) => sum + stock.qualityScore, 0) / DIVIDEND_STOCKS.length;
    const avgGrowthRate = DIVIDEND_STOCKS.reduce((sum, stock) => sum + stock.growthRate5Y, 0) / DIVIDEND_STOCKS.length;
    
    return {
      totalValue: totalValue * 1000000,
      weightedYield,
      avgQualityScore,
      avgGrowthRate,
      totalHoldings: DIVIDEND_STOCKS.length
    };
  }, []);

  const optimizationAnalysis = useMemo((): DividendOptimization => {
    const currentYield = portfolioMetrics.weightedYield;
    const optimizedYield = currentYield * 1.15; // Potential 15% improvement
    const improvementPotential = optimizedYield - currentYield;
    const riskAdjustedReturn = optimizedYield * (portfolioMetrics.avgQualityScore / 100);
    
    return {
      currentYield,
      optimizedYield,
      improvementPotential,
      riskAdjustedReturn,
      suggestions: [
        'Increase allocation to high-quality dividend growers (SCHD)',
        'Optimize for tax efficiency with qualified dividend focus',
        'Consider monthly dividend ETFs for cash flow consistency',
        'Reduce concentration in high-payout ratio positions',
        'Add defensive sectors for portfolio balance'
      ]
    };
  }, [portfolioMetrics]);

  const filteredStocks = useMemo(() => {
    let filtered = DIVIDEND_STOCKS;
    
    if (filterRisk !== 'all') {
      filtered = filtered.filter(stock => stock.riskLevel === filterRisk);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'yield':
          return b.currentYield - a.currentYield;
        case 'quality':
          return b.qualityScore - a.qualityScore;
        case 'growth':
          return b.growthRate5Y - a.growthRate5Y;
        case 'recommendation':
          const orderMap = { 'Strong Buy': 0, 'Buy': 1, 'Hold': 2, 'Sell': 3, 'Strong Sell': 4 };
          return orderMap[a.recommendation] - orderMap[b.recommendation];
        default:
          return 0;
      }
    });
  }, [filterRisk, sortBy]);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Buy': return 'text-green-600 bg-green-50';
      case 'Buy': return 'text-blue-600 bg-blue-50';
      case 'Hold': return 'text-yellow-600 bg-yellow-50';
      case 'Sell': return 'text-orange-600 bg-orange-50';
      case 'Strong Sell': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Opportunity': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'Optimization': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'Alert': return <Eye className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">Dividend Intelligence Engine</h3>
              <p className="text-blue-100">
                AI-powered dividend analysis and optimization recommendations
              </p>
            </div>
          </div>
          
          {/* Portfolio Overview */}
          <div className="text-right">
            <p className="text-blue-100 text-sm">Portfolio Yield</p>
            <p className="text-3xl font-bold text-white">
              {portfolioMetrics.weightedYield.toFixed(1)}%
            </p>
            <p className="text-blue-200 text-sm">
              Quality Score: {Math.round(portfolioMetrics.avgQualityScore)}
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {['insights', 'analysis', 'optimization', 'screening'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as typeof viewMode)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white text-blue-600 font-medium'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-blue-700">Total Holdings</p>
            <p className="text-2xl font-bold text-blue-600">{portfolioMetrics.totalHoldings}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Avg Growth (5Y)</p>
            <p className="text-2xl font-bold text-blue-600">
              {portfolioMetrics.avgGrowthRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Quality Score</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(portfolioMetrics.avgQualityScore)}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Portfolio Value</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(portfolioMetrics.totalValue / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Intelligence Insights View */}
        {viewMode === 'insights' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI Intelligence Insights
            </h4>

            <div className="grid gap-4">
              {INTELLIGENCE_INSIGHTS.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-l-4 rounded-lg p-6 ${
                    insight.priority === 'High' ? 'border-red-500 bg-red-50' :
                    insight.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(insight.category)}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        insight.category === 'Opportunity' ? 'bg-green-100 text-green-700' :
                        insight.category === 'Risk' ? 'bg-red-100 text-red-700' :
                        insight.category === 'Optimization' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {insight.category}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        insight.priority === 'High' ? 'bg-red-100 text-red-700' :
                        insight.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {insight.priority} Priority
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${Math.abs(insight.potentialImpact).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        {insight.confidence}% confidence
                      </p>
                    </div>
                  </div>
                  
                  <h5 className="font-semibold text-gray-900 mb-2">{insight.title}</h5>
                  <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                  <p className="text-sm font-medium text-blue-600 mb-2">{insight.action}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Timeframe: {insight.timeframe}</span>
                    <span>Impact: {insight.potentialImpact > 0 ? '+' : ''}${insight.potentialImpact.toLocaleString()}/year</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings Analysis View */}
        {viewMode === 'analysis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Portfolio Analysis
              </h4>
              
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="quality">Sort by Quality</option>
                  <option value="yield">Sort by Yield</option>
                  <option value="growth">Sort by Growth</option>
                  <option value="recommendation">Sort by Recommendation</option>
                </select>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Symbol</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Yield</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quality</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Growth</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Risk</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStocks.map((stock, index) => (
                      <motion.tr
                        key={stock.symbol}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedStock(selectedStock === stock.symbol ? null : stock.symbol)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{stock.symbol}</p>
                            <p className="text-xs text-gray-500">{stock.paymentFrequency}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-blue-600">{stock.currentYield.toFixed(1)}%</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{stock.qualityScore}</p>
                            {stock.qualityScore >= 90 ? (
                              <Star className="h-4 w-4 text-yellow-500" />
                            ) : stock.qualityScore >= 80 ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            {stock.growthRate5Y > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={stock.growthRate5Y > 0 ? 'text-green-600' : 'text-red-600'}>
                              {stock.growthRate5Y.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            stock.riskLevel === 'Conservative' ? 'bg-green-100 text-green-700' :
                            stock.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {stock.riskLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${getRecommendationColor(stock.recommendation)}`}>
                            {stock.recommendation}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Stock Details */}
            <AnimatePresence>
              {selectedStock && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 rounded-lg p-6 border border-blue-200"
                >
                  {(() => {
                    const stock = DIVIDEND_STOCKS.find(s => s.symbol === selectedStock);
                    if (!stock) return null;
                    
                    return (
                      <div>
                        <h5 className="font-semibold text-blue-800 mb-4">{stock.company} ({stock.symbol})</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-blue-700">Dividend Rate</p>
                            <p className="text-lg font-bold text-blue-600">${stock.dividendRate.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-700">Payout Ratio</p>
                            <p className="text-lg font-bold text-blue-600">{stock.payoutRatio.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-700">Beta Score</p>
                            <p className="text-lg font-bold text-blue-600">{stock.betaScore.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-700">Next Ex-Date</p>
                            <p className="text-lg font-bold text-blue-600">{stock.nextExDate}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Optimization View */}
        {viewMode === 'optimization' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Portfolio Optimization
            </h4>

            {/* Optimization Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <h5 className="font-medium text-green-800 mb-2">Current Yield</h5>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {optimizationAnalysis.currentYield.toFixed(2)}%
                </p>
                <p className="text-sm text-green-700">Weighted portfolio average</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">Optimized Yield</h5>
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {optimizationAnalysis.optimizedYield.toFixed(2)}%
                </p>
                <p className="text-sm text-blue-700">Potential with optimization</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                <h5 className="font-medium text-purple-800 mb-2">Improvement</h5>
                <p className="text-3xl font-bold text-purple-600 mb-1">
                  +{optimizationAnalysis.improvementPotential.toFixed(2)}%
                </p>
                <p className="text-sm text-purple-700">Annual yield increase</p>
              </div>
            </div>

            {/* Risk-Adjusted Analysis */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h5 className="font-medium text-gray-900 mb-4">Risk-Adjusted Analysis</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Risk-Adjusted Return</p>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    {optimizationAnalysis.riskAdjustedReturn.toFixed(2)}%
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quality Score Impact</span>
                      <span className="font-medium">+{(portfolioMetrics.avgQualityScore - 80).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Diversification Benefit</span>
                      <span className="font-medium">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax Efficiency</span>
                      <span className="font-medium">+28%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h6 className="font-medium text-gray-900 mb-3">Optimization Suggestions</h6>
                  <div className="space-y-2">
                    {optimizationAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                30-Day Action Plan
              </h5>
              <div className="grid gap-4">
                {[
                  { action: 'Analyze SCHD allocation increase', priority: 'High', timeframe: 'Week 1', impact: '+$850/year' },
                  { action: 'Review high payout ratio positions', priority: 'Medium', timeframe: 'Week 2', impact: 'Risk reduction' },
                  { action: 'Optimize for tax efficiency', priority: 'High', timeframe: 'Week 3', impact: '+$1,250/year' },
                  { action: 'Sector diversification analysis', priority: 'Low', timeframe: 'Week 4', impact: '+$180/year' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      <span className={`w-2 h-2 rounded-full ${
                        item.priority === 'High' ? 'bg-red-500' :
                        item.priority === 'Medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{item.action}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600 font-medium">{item.timeframe}</p>
                      <p className="text-xs text-gray-600">{item.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Screening View */}
        {viewMode === 'screening' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Dividend Screening & Discovery
            </h4>

            {/* Screening Criteria */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h5 className="font-medium text-gray-900 mb-4">Screening Criteria</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Minimum Yield</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>3.0%</option>
                    <option>4.0%</option>
                    <option>5.0%</option>
                    <option>6.0%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Quality Score</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>70+</option>
                    <option>80+</option>
                    <option>90+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Sector</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>All Sectors</option>
                    <option>Financial Services</option>
                    <option>Technology</option>
                    <option>REITs</option>
                    <option>Utilities</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Top Opportunities */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
              <h5 className="font-semibold text-emerald-800 mb-4">Top Opportunities This Week</h5>
              <div className="space-y-3">
                {[
                  { symbol: 'SCHD', reason: 'High quality score (96) with consistent growth', potential: '+15% yield improvement' },
                  { symbol: 'VYM', reason: 'Low expense ratio and broad diversification', potential: '+8% risk adjustment' },
                  { symbol: 'REML', reason: 'Monthly payments with mortgage REIT exposure', potential: '+22% yield boost' },
                ].map((opportunity, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-white rounded border">
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-emerald-800">{opportunity.symbol}</p>
                        <p className="text-sm text-emerald-700">{opportunity.reason}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">{opportunity.potential}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};