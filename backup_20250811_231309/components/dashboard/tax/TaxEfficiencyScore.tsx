'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  MapPin, 
  PieChart, 
  Shield, 
  Target,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { 
  calculateTaxEfficiencyScore, 
  TaxEfficiencyScore as TaxScore,
  TaxEfficiencyData,
  getScoreColor,
  getGradeDescription
} from '@/lib/calculations/taxEfficiencyScoring';
import { useTaxHub, usePerformanceHub } from '@/store/superCardStore';

interface TaxEfficiencyScoreProps {
  className?: string;
}

// Mock data for development - will be replaced with real user data
const mockUserData: TaxEfficiencyData = {
  userLocation: 'California',
  filingStatus: 'single',
  holdings: [
    { 
      id: '1', 
      portfolio_id: '1', 
      ticker: 'VYM', 
      shares: 100, 
      avgCost: 105, 
      currentPrice: 110,
      monthlyDividend: 45,
      taxTreatment: 'qualified',
      ytdPerformance: 0.08,
      created_at: '',
      updated_at: ''
    },
    { 
      id: '2', 
      portfolio_id: '1', 
      ticker: 'REML', 
      shares: 200, 
      avgCost: 8.5, 
      currentPrice: 9.2,
      monthlyDividend: 120,
      taxTreatment: 'ordinary',
      ytdPerformance: 0.12,
      created_at: '',
      updated_at: ''
    },
    { 
      id: '3', 
      portfolio_id: '1', 
      ticker: 'SCHD', 
      shares: 150, 
      avgCost: 78, 
      currentPrice: 82,
      monthlyDividend: 85,
      taxTreatment: 'qualified',
      ytdPerformance: 0.06,
      created_at: '',
      updated_at: ''
    }
  ],
  annualDividendIncome: 3000, // $250/month * 12
  accountTypes: {
    taxable: 125000,
    traditionalIra: 45000,
    rothIra: 25000,
    k401: 85000
  },
  strategies: {
    taxLossHarvesting: false,
    rocTracking: false,
    assetLocation: true,
    qualifiedHoldingPeriods: true
  }
};

export function TaxEfficiencyScore({ className = '' }: TaxEfficiencyScoreProps) {
  const [score, setScore] = useState<TaxScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  
  const taxHub = useTaxHub();
  const performanceHub = usePerformanceHub();

  // Calculate tax efficiency score
  useEffect(() => {
    const calculateScore = async () => {
      setIsLoading(true);
      
      // Simulate loading delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        // In a real implementation, this would use actual user data from stores
        const calculatedScore = calculateTaxEfficiencyScore(mockUserData);
        setScore(calculatedScore);
      } catch (error) {
        // console.error('Error calculating tax efficiency score:', error);
      // } finally {
        setIsLoading(false);
      }
    };

    calculateScore();
  }, [taxHub, performanceHub]);

  const scoreColors = useMemo(() => {
    if (!score) return { bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-500' };
    return getScoreColor(score.totalScore);
  }, [score]);

  if (isLoading) {
    return (
      <motion.div
        className={`premium-card p-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          
          {/* Score gauge skeleton */}
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
          </div>
          
          {/* Category breakdown skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!score) {
    return (
      <div className={`premium-card p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Unable to calculate tax efficiency score</p>
          <p className="text-sm">Please check your portfolio data</p>
        </div>
      </div>
    );
  }

  const priorityRecommendations = score.recommendations.slice(0, showAllRecommendations ? undefined : 3);

  return (
    <motion.div
      className={`premium-card hover-lift ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-green-100">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tax Efficiency Score</h3>
            <p className="text-sm text-gray-600">Portfolio tax optimization analysis</p>
          </div>
        </div>
      </div>

      {/* Score Gauge */}
      <div className="text-center mb-8">
        <motion.div
          className="relative mx-auto w-48 h-48 mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={scoreColors.text}
              style={{
                strokeDasharray: `${2 * Math.PI * 90}`,
                strokeDashoffset: `${2 * Math.PI * 90 * (1 - score.totalScore / 100)}`
              }}
              initial={{ strokeDashoffset: `${2 * Math.PI * 90}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 90 * (1 - score.totalScore / 100)}` }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          
          {/* Score text in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold text-gray-900"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                {Math.round(score.totalScore)}
              </motion.div>
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${scoreColors.bg} ${scoreColors.text}`}>
                Grade {score.grade}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-lg text-gray-700 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {getGradeDescription(score.grade)}
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Score Breakdown</h4>
        <div className="space-y-4">
          {[
            { 
              key: 'location', 
              label: 'Location', 
              icon: MapPin, 
              data: score.breakdown.location,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            { 
              key: 'portfolio', 
              label: 'Portfolio', 
              icon: PieChart, 
              data: score.breakdown.portfolio,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            { 
              key: 'accounts', 
              label: 'Accounts', 
              icon: Shield, 
              data: score.breakdown.accounts,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            },
            { 
              key: 'strategy', 
              label: 'Strategy', 
              icon: Target, 
              data: score.breakdown.strategy,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ].map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.key}
                className={`p-4 rounded-lg border ${category.bgColor}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${category.color}`} />
                    <span className="font-medium text-gray-900">{category.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {category.data.score}/{category.data.maxScore}
                    </div>
                    <div className="text-xs text-gray-600">
                      {category.data.percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <motion.div
                    className={`h-2 rounded-full ${category.color.replace('text', 'bg')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${category.data.percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  />
                </div>
                
                {/* Top factor */}
                {category.data.factors.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    {category.data.factors[0]}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Potential Savings */}
      {score.potentialSavings > 0 && (
        <motion.div
          className="mb-8 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-green-800">
                ${score.potentialSavings.toLocaleString()} Annual Savings Potential
              </div>
              <p className="text-sm text-green-700">
                Implementing our recommendations could save you this much per year
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900">Optimization Recommendations</h4>
          {score.recommendations.length > 3 && (
            <button
              onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>{showAllRecommendations ? 'Show Less' : 'Show All'}</span>
              <ChevronRight className={`w-4 h-4 transform transition-transform ${showAllRecommendations ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {priorityRecommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedRecommendation(selectedRecommendation === rec.id ? null : rec.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : rec.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{rec.title}</div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ${rec.potentialSavings.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">potential savings</div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {selectedRecommendation === rec.id && (
                      <motion.div
                        className="mt-4 pt-4 border-t border-gray-100"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Action Items:</h5>
                            <ul className="space-y-1">
                              {rec.actionItems.map((item, i) => (
                                <li key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-4 mb-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Impact: </span>
                                <span className={`text-sm font-medium ${
                                  rec.impact === 'major' 
                                    ? 'text-green-600' 
                                    : rec.impact === 'moderate'
                                    ? 'text-yellow-600'
                                    : 'text-blue-600'
                                }`}>
                                  {rec.impact}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-700">Timeline: </span>
                              <span className="text-sm text-gray-600">{rec.timeToImplement}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {score.recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <p className="font-medium">Excellent tax optimization!</p>
            <p className="text-sm">No immediate improvements needed.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Info className="w-4 h-4" />
            <span>Last updated: {score.lastUpdated.toLocaleDateString()}</span>
          </div>
          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
            <span>Learn more about tax efficiency</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}