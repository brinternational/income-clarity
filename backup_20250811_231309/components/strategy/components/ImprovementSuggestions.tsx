/**
 * ImprovementSuggestions Component
 * AI-powered improvement recommendations based on peer benchmarking data
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  AlertTriangle,
  Info,
  BookOpen,
  Users,
  DollarSign,
  Shield,
  PieChart,
  Clock,
  Award,
  Filter
} from 'lucide-react';

interface PeerBenchmarkingData {
  overallPercentile: number;
  improvementOpportunities: Array<{
    category: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  competitiveInsights: string[];
}

interface PuertoRicoAdvantage {
  taxComparison: {
    prResident: number;
    mainlandMedian: number;
    californiaPeers: number;
    newYorkPeers: number;
  };
  insights: string[];
  peerGroups: string[];
}

interface BenchmarkMetric {
  metric: string;
  percentile: number;
  category?: string;
}

interface ImprovementSuggestionsProps {
  peerData: PeerBenchmarkingData | null;
  currentGroup: {
    id: string;
    name: string;
    size: number;
  };
  strengthsAndWeaknesses: {
    strengths: BenchmarkMetric[];
    weaknesses: BenchmarkMetric[];
  };
  puertoRicoAdvantage: PuertoRicoAdvantage | null;
  benchmarkData: any[];
  className?: string;
}

interface ActionPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: string;
  expectedImprovement: string;
  steps: string[];
  completed: boolean;
}

export const ImprovementSuggestions: React.FC<ImprovementSuggestionsProps> = ({
  peerData,
  currentGroup,
  strengthsAndWeaknesses,
  puertoRicoAdvantage,
  benchmarkData,
  className = ''
}) => {
  const [selectedImpact, setSelectedImpact] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const actionPlans = useMemo<ActionPlan[]>(() => {
    const plans: ActionPlan[] = [];

    // Generate action plans based on weaknesses
    strengthsAndWeaknesses.weaknesses.forEach((weakness, index) => {
      if (weakness.metric === 'Diversification Score') {
        plans.push({
          id: `diversification-${index}`,
          title: 'Improve Portfolio Diversification',
          description: 'Add REITs, international exposure, or different sectors to reduce concentration risk',
          category: 'Portfolio Construction',
          impact: 'medium',
          difficulty: 'easy',
          timeToImplement: '1-2 weeks',
          expectedImprovement: '+15-20 percentile points',
          steps: [
            'Analyze current sector allocation',
            'Identify underweighted sectors',
            'Add REIT ETFs (VNQ, SCHH) for real estate exposure',
            'Consider international dividend ETFs (VXUS, VTIAX)',
            'Rebalance portfolio to target allocation'
          ],
          completed: false
        });
      }

      if (weakness.metric === 'Income Stability') {
        plans.push({
          id: `income-stability-${index}`,
          title: 'Enhance Income Stability',
          description: 'Focus on dividend aristocrats and high-quality dividend payers',
          category: 'Income Generation',
          impact: 'high',
          difficulty: 'medium',
          timeToImplement: '2-4 weeks',
          expectedImprovement: '+20-25 percentile points',
          steps: [
            'Research dividend aristocrats (25+ year track records)',
            'Analyze dividend coverage ratios and payout trends',
            'Replace volatile dividend stocks with stable performers',
            'Consider dividend-focused ETFs (SCHD, VYM, DVY)',
            'Monitor quarterly earnings for dividend safety'
          ],
          completed: false
        });
      }

      if (weakness.metric === 'Tax Efficiency') {
        plans.push({
          id: `tax-efficiency-${index}`,
          title: 'Optimize Tax Efficiency',
          description: 'Implement tax-loss harvesting and asset location strategies',
          category: 'Tax Efficiency',
          impact: 'high',
          difficulty: 'medium',
          timeToImplement: '3-6 weeks',
          expectedImprovement: '+10-15 percentile points',
          steps: [
            'Review asset location (tax-advantaged vs taxable accounts)',
            'Implement tax-loss harvesting opportunities',
            'Consider municipal bonds for high tax brackets',
            'Optimize holding periods for long-term capital gains',
            'Use tax-efficient index funds where possible'
          ],
          completed: false
        });
      }
    });

    // Add Puerto Rico specific opportunities
    if (puertoRicoAdvantage) {
      plans.push({
        id: 'pr-advantage',
        title: 'Maximize Puerto Rico Tax Benefits',
        description: 'Leverage your 0% dividend tax rate advantage to the fullest',
        category: 'Tax Efficiency',
        impact: 'high',
        difficulty: 'easy',
        timeToImplement: '1-2 weeks',
        expectedImprovement: 'Maintain top 2% tax efficiency',
        steps: [
          'Focus on high-dividend yield stocks (REITs, utilities)',
          'Consider dividend-focused strategies over growth',
          'Maximize taxable account allocations for dividends',
          'Document Act 60 compliance for tax benefits',
          'Consider dividend reinvestment programs (DRIPs)'
        ],
        completed: false
      });
    }

    // Add opportunity-based plans
    if (peerData?.improvementOpportunities) {
      peerData.improvementOpportunities.forEach((opportunity, index) => {
        plans.push({
          id: `opportunity-${index}`,
          title: opportunity.recommendation.split(' ').slice(0, 4).join(' '),
          description: opportunity.recommendation,
          category: opportunity.category,
          impact: opportunity.impact,
          difficulty: opportunity.difficulty,
          timeToImplement: opportunity.difficulty === 'easy' ? '1-2 weeks' :
                           opportunity.difficulty === 'medium' ? '2-4 weeks' : '1-3 months',
          expectedImprovement: opportunity.impact === 'high' ? '+15-25 percentile points' :
                              opportunity.impact === 'medium' ? '+10-15 percentile points' :
                              '+5-10 percentile points',
          steps: generateStepsForRecommendation(opportunity.recommendation),
          completed: false
        });
      });
    }

    return plans.filter(plan => {
      if (selectedImpact !== 'all' && plan.impact !== selectedImpact) return false;
      if (selectedDifficulty !== 'all' && plan.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [strengthsAndWeaknesses, puertoRicoAdvantage, peerData, selectedImpact, selectedDifficulty]);

  const toggleActionCompletion = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
    }
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Portfolio Construction': return PieChart;
      case 'Income Generation': return DollarSign;
      case 'Tax Efficiency': return Shield;
      case 'Performance': return TrendingUp;
      default: return Target;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-bold text-gray-900 flex items-center">
            <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
            Improvement Insights
          </h4>
          <p className="text-gray-600 mt-1">
            Personalized recommendations to improve your rankings
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={selectedImpact}
            onChange={(e) => setSelectedImpact(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Impact</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Puerto Rico Advantage Callout */}
      {puertoRicoAdvantage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-yellow-300" />
              <div>
                <h4 className="text-xl font-bold">Your Puerto Rico Edge</h4>
                <p className="text-green-100">Leverage your unique tax advantage</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h5 className="font-semibold mb-2">Tax Savings</h5>
              <p className="text-2xl font-bold text-yellow-300">
                {((puertoRicoAdvantage.taxComparison.mainlandMedian - puertoRicoAdvantage.taxComparison.prResident) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-green-100">vs mainland peers</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h5 className="font-semibold mb-2">Annual Advantage</h5>
              <p className="text-2xl font-bold text-yellow-300">$12,000+</p>
              <p className="text-sm text-green-100">saved in taxes</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h5 className="font-semibold mb-2">Global Ranking</h5>
              <p className="text-2xl font-bold text-yellow-300">Top 1%</p>
              <p className="text-sm text-green-100">tax efficiency</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Competitive Insights */}
      {peerData?.competitiveInsights && peerData.competitiveInsights.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h5 className="font-semibold text-blue-800 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Competitive Intelligence
          </h5>
          <div className="space-y-2">
            {peerData.competitiveInsights.map((insight, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="text-blue-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plans */}
      <div className="space-y-4">
        <h5 className="font-semibold text-gray-900 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Action Plans ({actionPlans.length})
        </h5>

        {actionPlans.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Great Performance!</h3>
            <p className="text-gray-600">
              You're performing well across all metrics. Consider advanced strategies to reach elite status.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actionPlans.map((plan, index) => {
              const isCompleted = completedActions.has(plan.id);
              const isExpanded = expandedAction === plan.id;
              const CategoryIcon = getCategoryIcon(plan.category);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isCompleted 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleActionCompletion(plan.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                      </button>
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CategoryIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h6 className={`font-semibold ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                            {plan.title}
                          </h6>
                          <p className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                            {plan.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(plan.impact)}`}>
                            {plan.impact.toUpperCase()} IMPACT
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                            {plan.difficulty.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{plan.timeToImplement}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setExpandedAction(isExpanded ? null : plan.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ArrowRight className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h6 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Implementation Steps
                            </h6>
                            <ol className="space-y-2">
                              {plan.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start space-x-2 text-sm">
                                  <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="text-gray-700">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          
                          <div>
                            <h6 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Expected Impact
                            </h6>
                            <div className="space-y-3">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600 mb-1">Ranking Improvement</p>
                                <p className="font-bold text-green-600">{plan.expectedImprovement}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600 mb-1">Implementation Time</p>
                                <p className="font-bold text-blue-600">{plan.timeToImplement}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600 mb-1">Category</p>
                                <p className="font-bold text-purple-600">{plan.category}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Summary */}
      {actionPlans.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h5 className="font-semibold text-purple-800 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Progress Summary
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {completedActions.size}/{actionPlans.length}
              </p>
              <p className="text-sm text-purple-600">Actions Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {actionPlans.filter(p => p.impact === 'high').length}
              </p>
              <p className="text-sm text-purple-600">High Impact Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((completedActions.size / actionPlans.length) * 100)}%
              </p>
              <p className="text-sm text-purple-600">Progress Complete</p>
            </div>
          </div>
          
          {completedActions.size > 0 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Great progress! Keep implementing these improvements to climb the rankings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to generate steps for recommendations
const generateStepsForRecommendation = (recommendation: string): string[] => {
  const lowerRec = recommendation.toLowerCase();
  
  if (lowerRec.includes('reit') || lowerRec.includes('diversification')) {
    return [
      'Research REIT ETFs (VNQ, SCHH, REM)',
      'Analyze current real estate exposure',
      'Determine target allocation (5-15% of portfolio)',
      'Execute purchases during market weakness',
      'Monitor performance and rebalance quarterly'
    ];
  }
  
  if (lowerRec.includes('dividend') || lowerRec.includes('aristocrat')) {
    return [
      'Screen for dividend aristocrats (25+ year history)',
      'Analyze dividend coverage and payout ratios',
      'Review earnings growth and sustainability',
      'Start with small positions in top candidates',
      'Monitor quarterly earnings and dividend announcements'
    ];
  }
  
  if (lowerRec.includes('tax') || lowerRec.includes('harvest')) {
    return [
      'Review current holdings for tax-loss opportunities',
      'Identify substantially identical securities to avoid wash sale rules',
      'Execute tax-loss harvesting before year-end',
      'Reinvest proceeds in similar but not identical assets',
      'Document all transactions for tax reporting'
    ];
  }
  
  return [
    'Research the specific recommendation in detail',
    'Assess your current situation and needs',
    'Create a implementation timeline',
    'Execute the strategy gradually',
    'Monitor results and adjust as needed'
  ];
};