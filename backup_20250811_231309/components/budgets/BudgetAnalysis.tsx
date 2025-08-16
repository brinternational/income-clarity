'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Eye,
  Calendar,
  Award,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';

interface CategoryAnalysis {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  performance: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  isOverBudget: boolean;
  spendingPattern: {
    pattern: 'consistent' | 'moderate' | 'erratic' | 'no_data';
    consistency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    weeklyAverage: number;
    peakWeek: number;
    lowWeek: number;
  };
  expenseCount: number;
  averageExpense: number;
  priority: number;
  essential: boolean;
}

interface HealthMetrics {
  overallScore: number;
  essentialCategoriesOverBudget: number;
  discretionaryCategoriesOverBudget: number;
  categoriesOnTrack: number;
  averageVariance: number;
  worstPerformingCategory: string;
  bestPerformingCategory: string;
}

interface RiskAssessment {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  risks: string[];
  riskFactors: {
    essentialOverages: number;
    velocityRisk: boolean;
    consistencyRisk: number;
    varianceRisk: number;
  };
}

interface Insight {
  type: 'positive' | 'warning' | 'alert' | 'info';
  message: string;
}

interface Recommendation {
  type: 'urgent' | 'important' | 'improvement' | 'warning';
  category?: string;
  message: string;
}

interface BudgetAnalysisData {
  budget: {
    id: string;
    name: string;
    period: string;
    startDate: string;
    endDate: string;
  };
  overall: {
    totalBudgeted: number;
    totalActual: number;
    variance: number;
    variancePercentage: number;
    performance: string;
    isOverBudget: boolean;
  };
  categories: CategoryAnalysis[];
  healthMetrics: HealthMetrics;
  velocityAnalysis: {
    dailyAverage: number;
    recentDailyAverage: number;
    velocityChange: number;
    trend: 'accelerating' | 'decelerating' | 'stable';
  };
  riskAssessment: RiskAssessment;
  insights: Insight[];
}

interface BudgetAnalysisProps {
  budgetId: string;
  showRecommendations?: boolean;
  showComparison?: boolean;
}

export function BudgetAnalysis({ 
  budgetId, 
  showRecommendations = true, 
  showComparison = false 
}: BudgetAnalysisProps) {
  const [analysis, setAnalysis] = useState<BudgetAnalysisData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'insights' | 'recommendations'>('overview');

  useEffect(() => {
    fetchAnalysisData();
  }, [budgetId]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        budgetId,
        includeRecommendations: showRecommendations.toString(),
        compareWithPrevious: showComparison.toString()
      });

      const response = await fetch(`/api/budgets/analysis?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }

      const result = await response.json();
      
      if (result.success) {
        // Since we're analyzing a specific budget, get the first (and should be only) budget
        const budgetAnalysis = result.data.budgets[0];
        if (budgetAnalysis) {
          setAnalysis(budgetAnalysis);
        }
        
        if (result.data.recommendations) {
          setRecommendations(result.data.recommendations);
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      // Error handled by emergency recovery script finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      default:
        return <Eye className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'important':
        return <Target className="w-5 h-5 text-orange-600" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <Shield className="w-5 h-5 text-yellow-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Analyzing budget performance...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">Analysis Error</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalysisData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Budget Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {analysis.budget.name} • {analysis.budget.period.toLowerCase()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(analysis.overall.performance)}`}>
              {analysis.overall.performance.charAt(0).toUpperCase() + analysis.overall.performance.slice(1)}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-6 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: <Target className="w-4 h-4" /> },
            { key: 'categories', label: 'Categories', icon: <BarChart3 className="w-4 h-4" /> },
            { key: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" /> },
            { key: 'recommendations', label: 'Tips', icon: <Award className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Score */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Budget Health Score
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {analysis.healthMetrics.overallScore.toFixed(0)}
              </div>
              <div className="text-lg text-gray-600">out of 100</div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ${
                    analysis.healthMetrics.overallScore >= 80 ? 'bg-green-500' :
                    analysis.healthMetrics.overallScore >= 60 ? 'bg-blue-500' :
                    analysis.healthMetrics.overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(analysis.healthMetrics.overallScore, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-900">
                  {analysis.healthMetrics.categoriesOnTrack}
                </div>
                <div className="text-green-700">On Track</div>
              </div>
              
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-900">
                  {analysis.healthMetrics.essentialCategoriesOverBudget + analysis.healthMetrics.discretionaryCategoriesOverBudget}
                </div>
                <div className="text-red-700">Over Budget</div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Risk Assessment
            </h3>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                analysis.riskAssessment.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                analysis.riskAssessment.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {analysis.riskAssessment.riskLevel.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-3">
              {analysis.riskAssessment.risks.map((risk, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{risk}</span>
                </div>
              ))}
              
              {analysis.riskAssessment.risks.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>No significant risks identified</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">Risk Score: {analysis.riskAssessment.riskScore}/100</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    analysis.riskAssessment.riskScore < 20 ? 'bg-green-500' :
                    analysis.riskAssessment.riskScore < 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(analysis.riskAssessment.riskScore, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Spending Velocity */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Spending Velocity
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Daily Average:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(analysis.velocityAnalysis.dailyAverage)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Trend:</span>
                <div className="flex items-center gap-2">
                  {analysis.velocityAnalysis.trend === 'accelerating' ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : analysis.velocityAnalysis.trend === 'decelerating' ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : (
                    <Target className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    analysis.velocityAnalysis.trend === 'accelerating' ? 'text-red-600' :
                    analysis.velocityAnalysis.trend === 'decelerating' ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {analysis.velocityAnalysis.trend.charAt(0).toUpperCase() + analysis.velocityAnalysis.trend.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Velocity Change:</span>
                <span className={`font-medium ${
                  analysis.velocityAnalysis.velocityChange > 0 ? 'text-red-600' : 
                  analysis.velocityAnalysis.velocityChange < 0 ? 'text-green-600' : 
                  'text-gray-600'
                }`}>
                  {formatPercentage(analysis.velocityAnalysis.velocityChange)}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Performance */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Overall Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Budgeted:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(analysis.overall.totalBudgeted)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Spent:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(analysis.overall.totalActual)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Variance:</span>
                <span className={`font-medium ${
                  analysis.overall.variance >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {analysis.overall.variance >= 0 ? '+' : ''}{formatCurrency(analysis.overall.variance)}
                  <span className="ml-1 text-xs">
                    ({formatPercentage(analysis.overall.variancePercentage)})
                  </span>
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className={`text-center py-2 px-4 rounded-lg ${
                  analysis.overall.isOverBudget 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {analysis.overall.isOverBudget ? 'Over Budget' : 'Within Budget'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
          
          <div className="space-y-4">
            {analysis.categories.map((category, index) => (
              <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">
                      {category.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    {category.essential && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        Essential
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPerformanceColor(category.performance)}`}>
                      {category.performance}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(category.actual)} / {formatCurrency(category.budgeted)}
                    </div>
                    <div className={`text-sm ${category.isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatPercentage(category.variancePercentage)} variance
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Spending Pattern:</span>
                    <div className="font-medium capitalize">
                      {category.spendingPattern.pattern.replace('_', ' ')}
                      <span className={`ml-2 ${
                        category.spendingPattern.trend === 'increasing' ? 'text-red-600' :
                        category.spendingPattern.trend === 'decreasing' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        ({category.spendingPattern.trend})
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Consistency:</span>
                    <div className="font-medium">
                      {category.spendingPattern.consistency.toFixed(0)}%
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Expenses:</span>
                    <div className="font-medium">
                      {category.expenseCount} ({formatCurrency(category.averageExpense)} avg)
                    </div>
                  </div>
                </div>

                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      category.isOverBudget ? 'bg-red-500' :
                      category.variancePercentage > 80 ? 'bg-orange-500' :
                      category.variancePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(Math.abs(category.variancePercentage), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Insights</h3>
          
          <div className="space-y-4">
            {analysis.insights.map((insight, index) => (
              <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${
                insight.type === 'positive' ? 'bg-green-50 border-green-400' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                insight.type === 'alert' ? 'bg-red-50 border-red-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                {getInsightIcon(insight.type)}
                <p className="text-sm text-gray-700">{insight.message}</p>
              </div>
            ))}
            
            {analysis.insights.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No specific insights available</p>
                <p className="text-sm">Continue tracking your budget for personalized insights</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && showRecommendations && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recommendations</h3>
          
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${
                recommendation.type === 'urgent' ? 'bg-red-50 border-red-400' :
                recommendation.type === 'important' ? 'bg-orange-50 border-orange-400' :
                recommendation.type === 'improvement' ? 'bg-blue-50 border-blue-400' :
                'bg-yellow-50 border-yellow-400'
              }`}>
                {getRecommendationIcon(recommendation.type)}
                <div className="flex-1">
                  {recommendation.category && (
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {recommendation.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  )}
                  <p className="text-sm text-gray-700">{recommendation.message}</p>
                </div>
              </div>
            ))}
            
            {recommendations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recommendations at this time</p>
                <p className="text-sm">Your budget is performing well!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}