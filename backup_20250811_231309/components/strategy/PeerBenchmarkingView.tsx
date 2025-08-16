'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Shield,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  RefreshCw,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  TrophyIcon,
  Zap,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { usePeerBenchmarking } from '@/components/strategy/hooks/usePeerBenchmarking';
import { PeerGroupSelector } from '@/components/strategy/components/PeerGroupSelector';
import { RankingsDisplay } from '@/components/strategy/components/RankingsDisplay';
import { DistributionCharts } from '@/components/strategy/components/DistributionCharts';
import { ImprovementSuggestions } from '@/components/strategy/components/ImprovementSuggestions';

export interface PeerGroup {
  id: string;
  name: string;
  description: string;
  size: number;
  memberCount: number;
  avgPortfolioValue: number;
  criteria: string[];
  averageMetrics: {
    totalReturn: number;
    dividendYield: number;
    expenseCoverage: number;
    taxEfficiency: number;
    diversificationScore: number;
    riskAdjustedReturn: number;
    aboveZeroStreak: number;
    incomeStability: number;
  };
  topPerformers: PeerComparison[];
  distribution: {
    metric: string;
    percentiles: {
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    }
  }[];
}

export interface BenchmarkMetric {
  metric: string;
  userValue: number;
  peerAverage: number;
  peerMedian: number;
  percentile: number;
  bestInGroup: number;
  unit: string;
  isHigherBetter: boolean;
}

export interface PeerComparison {
  userId: string; // anonymized
  peerGroupId: string;
  metrics: {
    totalReturn: number;
    dividendYield: number;
    expenseCoverage: number;
    taxEfficiency: number;
    diversificationScore: number;
    riskAdjustedReturn: number;
    aboveZeroStreak: number;
    incomeStability: number;
  };
  percentileRanking: {
    overall: number; // 0-100
    byMetric: Record<string, number>;
  };
  anonymizedProfile: {
    portfolioSizeBracket: string;
    strategy: string;
    location: string; // state only
    experienceLevel: string;
  };
}

export interface SuccessStory {
  id: string;
  title: string;
  description: string;
  peerProfile: {
    portfolioSize: string;
    location: string; // state only
    strategy: string;
    timeframe: string;
  };
  keyMetrics: {
    returnImprovement: number;
    yieldIncrease: number;
    taxSavings: number;
  };
  lessons: string[];
}

interface BenchmarkCategory {
  category: string;
  metrics: BenchmarkMetric[];
}

interface PeerBenchmarkingViewProps {
  portfolioValue?: number;
  location?: string;
  strategy?: string;
  className?: string;
}

const PEER_GROUPS: PeerGroup[] = [
  {
    id: 'dividend_investors_pr',
    name: 'Puerto Rico Dividend Investors',
    description: 'Puerto Rico residents leveraging Act 60 tax benefits for dividend income',
    size: 156,
    memberCount: 156,
    avgPortfolioValue: 485000,
    criteria: ['Location: Puerto Rico', 'Strategy: Dividend Focus', 'Value: $250K-$1M', 'Act 60 Eligible'],
    averageMetrics: {
      totalReturn: 9.2,
      dividendYield: 4.8,
      expenseCoverage: 145,
      taxEfficiency: 98.5,
      diversificationScore: 82,
      riskAdjustedReturn: 0.76,
      aboveZeroStreak: 22,
      incomeStability: 91
    },
    topPerformers: [],
    distribution: []
  },
  {
    id: 'dividend_investors_us',
    name: 'US Mainland Dividend Investors',
    description: 'Mainland US dividend income investors across all states',
    size: 2847,
    memberCount: 2847,
    avgPortfolioValue: 520000,
    criteria: ['Location: US States', 'Strategy: Dividend Focus', 'Value: $250K-$1M'],
    averageMetrics: {
      totalReturn: 7.2,
      dividendYield: 3.8,
      expenseCoverage: 118,
      taxEfficiency: 65.2,
      diversificationScore: 78,
      riskAdjustedReturn: 0.58,
      aboveZeroStreak: 14,
      incomeStability: 87
    },
    topPerformers: [],
    distribution: []
  },
  {
    id: 'covered_call_writers',
    name: 'Covered Call Writers',
    description: 'Advanced income investors using covered call strategies',
    size: 1203,
    memberCount: 1203,
    avgPortfolioValue: 675000,
    criteria: ['Strategy: Covered Call', 'Value: $500K+', 'Experience: Advanced'],
    averageMetrics: {
      totalReturn: 11.8,
      dividendYield: 8.2,
      expenseCoverage: 185,
      taxEfficiency: 72.1,
      diversificationScore: 74,
      riskAdjustedReturn: 0.88,
      aboveZeroStreak: 28,
      incomeStability: 94
    },
    topPerformers: [],
    distribution: []
  },
  {
    id: 'fire_investors',
    name: 'FIRE Enthusiasts',
    description: 'Financial Independence, Retire Early focused investors',
    size: 4512,
    memberCount: 4512,
    avgPortfolioValue: 425000,
    criteria: ['Goal: FIRE', 'Age: 25-45', 'Savings Rate: >30%', 'Strategy: Growth + Income'],
    averageMetrics: {
      totalReturn: 8.9,
      dividendYield: 2.8,
      expenseCoverage: 95,
      taxEfficiency: 71.8,
      diversificationScore: 85,
      riskAdjustedReturn: 0.72,
      aboveZeroStreak: 11,
      incomeStability: 76
    },
    topPerformers: [],
    distribution: []
  },
  {
    id: 'high_net_worth',
    name: 'High Net Worth ($1M+)',
    description: 'Sophisticated investors with portfolios over $1M',
    size: 892,
    memberCount: 892,
    avgPortfolioValue: 2150000,
    criteria: ['Value: $1M+', 'Strategy: Diversified', 'Experience: Expert'],
    averageMetrics: {
      totalReturn: 9.8,
      dividendYield: 3.2,
      expenseCoverage: 280,
      taxEfficiency: 78.5,
      diversificationScore: 92,
      riskAdjustedReturn: 0.84,
      aboveZeroStreak: 35,
      incomeStability: 96
    },
    topPerformers: [],
    distribution: []
  },
  {
    id: 'reit_focused',
    name: 'REIT Focused Investors',
    description: 'Real Estate Investment Trust specialists',
    size: 756,
    memberCount: 756,
    avgPortfolioValue: 380000,
    criteria: ['Strategy: REIT Heavy', 'Allocation: >40% REITs', 'Focus: Income'],
    averageMetrics: {
      totalReturn: 6.8,
      dividendYield: 5.9,
      expenseCoverage: 165,
      taxEfficiency: 58.2,
      diversificationScore: 68,
      riskAdjustedReturn: 0.52,
      aboveZeroStreak: 20,
      incomeStability: 88
    },
    topPerformers: [],
    distribution: []
  }
];

const BENCHMARK_DATA: BenchmarkCategory[] = [
  {
    category: 'Performance',
    metrics: [
      {
        metric: 'Annual Return',
        userValue: 8.7,
        peerAverage: 7.2,
        peerMedian: 6.8,
        percentile: 78,
        bestInGroup: 12.4,
        unit: '%',
        isHigherBetter: true
      },
      {
        metric: 'Dividend Yield',
        userValue: 4.2,
        peerAverage: 3.8,
        peerMedian: 3.6,
        percentile: 72,
        bestInGroup: 6.8,
        unit: '%',
        isHigherBetter: true
      },
      {
        metric: 'Volatility',
        userValue: 12.3,
        peerAverage: 15.7,
        peerMedian: 14.2,
        percentile: 82,
        bestInGroup: 8.9,
        unit: '%',
        isHigherBetter: false
      }
    ]
  },
  {
    category: 'Tax Efficiency',
    metrics: [
      {
        metric: 'Effective Tax Rate',
        userValue: 2.1,
        peerAverage: 18.5,
        peerMedian: 16.8,
        percentile: 98,
        bestInGroup: 0.0,
        unit: '%',
        isHigherBetter: false
      },
      {
        metric: 'After-Tax Return',
        userValue: 8.5,
        peerAverage: 5.9,
        peerMedian: 5.7,
        percentile: 95,
        bestInGroup: 8.7,
        unit: '%',
        isHigherBetter: true
      },
      {
        metric: 'Tax-Loss Harvesting',
        userValue: 2850,
        peerAverage: 1200,
        peerMedian: 950,
        percentile: 89,
        bestInGroup: 4500,
        unit: '$',
        isHigherBetter: true
      }
    ]
  },
  {
    category: 'Portfolio Construction',
    metrics: [
      {
        metric: 'Diversification Score',
        userValue: 87,
        peerAverage: 82,
        peerMedian: 84,
        percentile: 65,
        bestInGroup: 95,
        unit: '/100',
        isHigherBetter: true
      },
      {
        metric: 'Expense Ratio',
        userValue: 0.08,
        peerAverage: 0.45,
        peerMedian: 0.35,
        percentile: 91,
        bestInGroup: 0.03,
        unit: '%',
        isHigherBetter: false
      },
      {
        metric: 'Rebalancing Frequency',
        userValue: 4,
        peerAverage: 2.8,
        peerMedian: 2,
        percentile: 76,
        bestInGroup: 6,
        unit: '/year',
        isHigherBetter: true
      }
    ]
  },
  {
    category: 'Income Generation',
    metrics: [
      {
        metric: 'Monthly Income',
        userValue: 1850,
        peerAverage: 1420,
        peerMedian: 1280,
        percentile: 71,
        bestInGroup: 2950,
        unit: '$',
        isHigherBetter: true
      },
      {
        metric: 'Income Stability',
        userValue: 94,
        peerAverage: 87,
        peerMedian: 89,
        percentile: 78,
        bestInGroup: 98,
        unit: '/100',
        isHigherBetter: true
      },
      {
        metric: 'Coverage Ratio',
        userValue: 1.35,
        peerAverage: 1.15,
        peerMedian: 1.08,
        percentile: 82,
        bestInGroup: 1.85,
        unit: 'x',
        isHigherBetter: true
      }
    ]
  }
];

export const PeerBenchmarkingView: React.FC<PeerBenchmarkingViewProps> = ({
  portfolioValue = 500000,
  location = 'Puerto Rico',
  strategy = 'dividend',
  className = ''
}) => {
  const [selectedGroup, setSelectedGroup] = useState(PEER_GROUPS[0].id);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'rankings' | 'insights'>('overview');
  const [selectedCategory, setSelectedCategory] = useState('Performance');
  const [showPuertoRicoAdvantage, setShowPuertoRicoAdvantage] = useState(location === 'Puerto Rico');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'All'>('1Y');

  // Use our custom hook for data management
  const {
    peerData,
    isLoading,
    error,
    refreshData,
    setPeerGroup,
    setTimeframe
  } = usePeerBenchmarking({
    portfolioValue,
    location,
    strategy,
    selectedGroup,
    timeframe: selectedTimeframe
  });

  const currentGroup = useMemo(() => {
    return PEER_GROUPS.find(group => group.id === selectedGroup) || PEER_GROUPS[0];
  }, [selectedGroup]);

  const overallScore = useMemo(() => {
    if (peerData?.overallPercentile) {
      return peerData.overallPercentile;
    }
    const allMetrics = BENCHMARK_DATA.flatMap(category => category.metrics);
    const avgPercentile = allMetrics.reduce((sum, metric) => sum + metric.percentile, 0) / allMetrics.length;
    return Math.round(avgPercentile);
  }, [peerData]);

  const strengthsAndWeaknesses = useMemo(() => {
    if (peerData?.strengths && peerData?.weaknesses) {
      return {
        strengths: peerData.strengths,
        weaknesses: peerData.weaknesses
      };
    }
    
    const allMetrics = BENCHMARK_DATA.flatMap(category => 
      category.metrics.map(metric => ({ ...metric, category: category.category }))
    );
    
    const strengths = allMetrics
      .filter(metric => metric.percentile >= 75)
      .sort((a, b) => b.percentile - a.percentile)
      .slice(0, 3);
    
    const weaknesses = allMetrics
      .filter(metric => metric.percentile <= 50)
      .sort((a, b) => a.percentile - b.percentile)
      .slice(0, 3);
    
    return { strengths, weaknesses };
  }, [peerData]);

  const puertoRicoAdvantage = useMemo(() => {
    if (location !== 'Puerto Rico') return null;
    
    return {
      taxComparison: {
        prResident: 0,
        mainlandMedian: 0.15,
        californiaPeers: 0.25,
        newYorkPeers: 0.28
      },
      insights: [
        "Your 0% tax rate gives you a 15-28% advantage over mainland peers",
        "PR residents in your bracket save average $12,000/year in taxes",
        "You're in the top 1% for tax efficiency globally"
      ],
      peerGroups: [
        "Puerto Rico Dividend Investors",
        "Act 60 Beneficiaries",
        "Caribbean FIRE Community"
      ]
    };
  }, [location]);

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-emerald-600';
    if (percentile >= 75) return 'text-green-600';
    if (percentile >= 50) return 'text-yellow-600';
    if (percentile >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPercentileBg = (percentile: number) => {
    if (percentile >= 90) return 'bg-emerald-100 border-emerald-300';
    if (percentile >= 75) return 'bg-green-100 border-green-300';
    if (percentile >= 50) return 'bg-yellow-100 border-yellow-300';
    if (percentile >= 25) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getTrendIcon = (userValue: number, peerAverage: number, isHigherBetter: boolean) => {
    const isUserBetter = isHigherBetter 
      ? userValue > peerAverage 
      : userValue < peerAverage;
    
    if (Math.abs(userValue - peerAverage) < 0.1) return Minus;
    return isUserBetter ? ArrowUp : ArrowDown;
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setPeerGroup(groupId);
  };

  const handleTimeframeChange = (timeframe: '1M' | '3M' | '6M' | '1Y' | 'All') => {
    setSelectedTimeframe(timeframe);
    setTimeframe(timeframe);
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="text-gray-600">Loading peer benchmarking data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load peer data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">Peer Benchmarking</h3>
              <p className="text-purple-100">
                Compare your performance against similar investors
              </p>
            </div>
          </div>
          
          {/* Overall Score */}
          <div className="text-center">
            <p className="text-purple-100 text-sm">Overall Percentile</p>
            <p className="text-3xl font-bold text-white">{overallScore}th</p>
          </div>
        </div>

        {/* Peer Group Selector */}
        <PeerGroupSelector
          selectedGroup={selectedGroup}
          peerGroups={PEER_GROUPS}
          onChange={handleGroupChange}
          className="w-full"
          userProfile={{
            portfolioValue,
            location,
            strategy,
            experienceLevel: portfolioValue >= 1000000 ? 'expert' : portfolioValue >= 500000 ? 'advanced' : 'intermediate'
          }}
        />
      </div>

      {/* Peer Group Info */}
      <div className="bg-purple-50 border-b border-purple-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-bold text-purple-800">{currentGroup.name}</h4>
            <p className="text-sm text-purple-700">{currentGroup.description}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-purple-600">{currentGroup.size}</p>
            <p className="text-sm text-purple-600">Members</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentGroup.criteria.map((criterion, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-medium"
            >
              {criterion}
            </span>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* View Mode Toggle */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['overview', 'detailed', 'rankings', 'insights'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as typeof viewMode)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                viewMode === mode
                  ? 'bg-purple-600 text-white font-medium'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-2 mb-6">
          <span className="text-sm text-gray-600 py-1">Timeframe:</span>
          {['1M', '3M', '6M', '1Y', 'All'].map(timeframe => (
            <button
              key={timeframe}
              onClick={() => handleTimeframeChange(timeframe as any)}
              className={`px-3 py-1 rounded text-sm transition-all ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>

        {/* Overview */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Puerto Rico Tax Advantage Banner */}
            {showPuertoRicoAdvantage && puertoRicoAdvantage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-8 w-8 text-yellow-300" />
                    <div>
                      <h4 className="text-xl font-bold">Puerto Rico Tax Advantage</h4>
                      <p className="text-green-100">Your secret weapon: 0% dividend tax rate</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPuertoRicoAdvantage(false)}
                    className="text-green-100 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {puertoRicoAdvantage.insights.map((insight, index) => (
                    <div key={index} className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-green-100">{insight}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Key Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Highlights */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h5 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Your Strengths
                </h5>
                <div className="space-y-3">
                  {strengthsAndWeaknesses.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-green-700">{strength.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                          {strength.percentile}th percentile
                        </span>
                        <Star className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <h5 className="font-semibold text-orange-800 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Improvement Areas
                </h5>
                <div className="space-y-3">
                  {strengthsAndWeaknesses.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-orange-700">{weakness.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-medium">
                          {weakness.percentile}th percentile
                        </span>
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {BENCHMARK_DATA.map((category, index) => {
                const avgPercentile = category.metrics.reduce((sum, metric) => sum + metric.percentile, 0) / category.metrics.length;
                const scoreColor = getPercentileColor(avgPercentile);
                
                return (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-lg p-4 border-2 cursor-pointer transition-all ${getPercentileBg(avgPercentile)}`}
                    onClick={() => setSelectedCategory(category.category)}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {category.category === 'Performance' && <TrendingUp className="h-6 w-6 text-gray-600" />}
                        {category.category === 'Tax Efficiency' && <Shield className="h-6 w-6 text-gray-600" />}
                        {category.category === 'Portfolio Construction' && <PieChart className="h-6 w-6 text-gray-600" />}
                        {category.category === 'Income Generation' && <DollarSign className="h-6 w-6 text-gray-600" />}
                      </div>
                      <h6 className="font-semibold text-gray-900 mb-1">{category.category}</h6>
                      <p className={`text-2xl font-bold ${scoreColor}`}>
                        {Math.round(avgPercentile)}th
                      </p>
                      <p className="text-xs text-gray-600">percentile</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed View */}
        {viewMode === 'detailed' && (
          <div className="space-y-6">
            {/* Category Selector */}
            <div className="flex flex-wrap gap-2">
              {BENCHMARK_DATA.map(category => (
                <button
                  key={category.category}
                  onClick={() => setSelectedCategory(category.category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category.category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {category.category}
                </button>
              ))}
            </div>

            {/* Selected Category Metrics */}
            <div className="space-y-4">
              {BENCHMARK_DATA.find(cat => cat.category === selectedCategory)?.metrics.map((metric, index) => {
                const TrendIcon = getTrendIcon(metric.userValue, metric.peerAverage, metric.isHigherBetter);
                const isUserBetter = metric.isHigherBetter 
                  ? metric.userValue > metric.peerAverage 
                  : metric.userValue < metric.peerAverage;
                
                return (
                  <motion.div
                    key={metric.metric}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getPercentileBg(metric.percentile)}`}>
                          <BarChart3 className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-900">{metric.metric}</h6>
                          <p className={`text-sm ${getPercentileColor(metric.percentile)}`}>
                            {metric.percentile}th percentile
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <TrendIcon className={`h-5 w-5 ${
                            isUserBetter ? 'text-green-600' : 'text-red-600'
                          }`} />
                          <span className="text-2xl font-bold text-gray-900">
                            {metric.userValue}{metric.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Your Value</p>
                        <p className="font-bold text-purple-600">
                          {metric.userValue}{metric.unit}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Peer Average</p>
                        <p className="font-medium text-gray-900">
                          {metric.peerAverage}{metric.unit}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Peer Median</p>
                        <p className="font-medium text-gray-900">
                          {metric.peerMedian}{metric.unit}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Best in Group</p>
                        <p className="font-bold text-green-600">
                          {metric.bestInGroup}{metric.unit}
                        </p>
                      </div>
                    </div>

                    {/* Visual percentile bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>0th</span>
                        <span>50th</span>
                        <span>100th</span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            metric.percentile >= 75 ? 'bg-green-500' :
                            metric.percentile >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${metric.percentile}%` }}
                        />
                        <div
                          className="absolute top-0 w-2 h-3 bg-purple-600 rounded-full"
                          style={{ left: `${metric.percentile}%`, transform: 'translateX(-50%)' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rankings View */}
        {viewMode === 'rankings' && (
          <RankingsDisplay
            currentGroup={currentGroup}
            overallScore={overallScore}
            strengthsAndWeaknesses={strengthsAndWeaknesses}
            benchmarkData={BENCHMARK_DATA}
            getPercentileColor={getPercentileColor}
            getPercentileBg={getPercentileBg}
            onRefresh={refreshData}
          />
        )}

        {/* Insights View */}
        {viewMode === 'insights' && (
          <ImprovementSuggestions
            peerData={peerData}
            currentGroup={currentGroup}
            strengthsAndWeaknesses={strengthsAndWeaknesses}
            puertoRicoAdvantage={puertoRicoAdvantage}
            benchmarkData={BENCHMARK_DATA}
          />
        )}
      </div>
    </div>
  );
};