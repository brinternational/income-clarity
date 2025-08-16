/**
 * RankingsDisplay Component
 * Comprehensive rankings visualization with leaderboards and competitive elements
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Crown,
  Zap,
  Target,
  BarChart3,
  PieChart,
  DollarSign,
  Shield
} from 'lucide-react';

interface PeerGroup {
  id: string;
  name: string;
  size: number;
  memberCount: number;
}

interface BenchmarkMetric {
  metric: string;
  percentile: number;
  category?: string;
}

interface BenchmarkCategory {
  category: string;
  metrics: BenchmarkMetric[];
}

interface RankingsDisplayProps {
  currentGroup: PeerGroup;
  overallScore: number;
  strengthsAndWeaknesses: {
    strengths: BenchmarkMetric[];
    weaknesses: BenchmarkMetric[];
  };
  benchmarkData: BenchmarkCategory[];
  getPercentileColor: (percentile: number) => string;
  getPercentileBg: (percentile: number) => string;
  onRefresh?: () => void;
}

export const RankingsDisplay: React.FC<RankingsDisplayProps> = ({
  currentGroup,
  overallScore,
  strengthsAndWeaknesses,
  benchmarkData,
  getPercentileColor,
  getPercentileBg,
  onRefresh
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('1Y');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const estimatedRank = useMemo(() => {
    return Math.round(currentGroup.size * (100 - overallScore) / 100);
  }, [currentGroup.size, overallScore]);

  const rankingTrend = useMemo(() => {
    // Mock historical ranking trend - in real app this would come from API
    const trends = {
      '1M': { change: 3, direction: 'up' as const },
      '3M': { change: 7, direction: 'up' as const },
      '6M': { change: 2, direction: 'down' as const },
      '1Y': { change: 12, direction: 'up' as const },
    };
    return trends[selectedPeriod];
  }, [selectedPeriod]);

  const categoryRankings = useMemo(() => {
    return benchmarkData.map((category) => {
      const avgPercentile = category.metrics.reduce((sum, metric) => sum + metric.percentile, 0) / category.metrics.length;
      const estimatedRank = Math.round(currentGroup.size * (100 - avgPercentile) / 100);
      
      return {
        category: category.category,
        percentile: Math.round(avgPercentile),
        rank: estimatedRank,
        totalMembers: currentGroup.size,
        metricsCount: category.metrics.length
      };
    });
  }, [benchmarkData, currentGroup.size]);

  const achievements = useMemo(() => {
    const achievements = [];
    
    if (overallScore >= 90) {
      achievements.push({ icon: Crown, title: 'Top 10%', description: 'Elite performance across all metrics' });
    } else if (overallScore >= 75) {
      achievements.push({ icon: TrophyIcon, title: 'Top 25%', description: 'Strong performance in most areas' });
    }
    
    if (strengthsAndWeaknesses.strengths.length >= 3) {
      achievements.push({ icon: Star, title: 'Well-Rounded', description: 'Leading in multiple categories' });
    }
    
    // Check for specific achievements
    const taxEfficiency = benchmarkData.find(cat => cat.category === 'Tax Efficiency')?.metrics[0];
    if (taxEfficiency && taxEfficiency.percentile >= 95) {
      achievements.push({ icon: Zap, title: 'Tax Optimizer', description: 'Top 5% in tax efficiency' });
    }
    
    return achievements;
  }, [overallScore, strengthsAndWeaknesses, benchmarkData]);

  const getRankColor = (percentile: number) => {
    if (percentile >= 90) return 'text-yellow-600 bg-yellow-50';
    if (percentile >= 75) return 'text-green-600 bg-green-50';
    if (percentile >= 50) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRankIcon = (percentile: number) => {
    if (percentile >= 90) return Crown;
    if (percentile >= 75) return TrophyIcon;
    if (percentile >= 50) return Medal;
    return Target;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">
            Your Rankings in {currentGroup.name}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Updated rankings based on {selectedPeriod} performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <div className="flex space-x-1">
            {(['1M', '3M', '6M', '1Y'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2 py-1 text-xs rounded transition-all ${
                  selectedPeriod === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <button 
            onClick={onRefresh}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Ranking Card */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {React.createElement(getRankIcon(overallScore), { 
                className: "h-8 w-8 text-yellow-300" 
              })}
            </div>
            <p className="text-white/80 text-sm font-medium">Overall Rank</p>
            <p className="text-3xl font-bold">#{estimatedRank}</p>
            <p className="text-white/60 text-sm">
              out of {currentGroup.size.toLocaleString()} members
            </p>
            
            {/* Ranking Trend */}
            <div className="flex items-center justify-center mt-2 space-x-1">
              {rankingTrend.direction === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-300" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-300" />
              )}
              <span className={`text-sm ${
                rankingTrend.direction === 'up' ? 'text-green-300' : 'text-red-300'
              }`}>
                {rankingTrend.change} spots ({selectedPeriod})
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-8 w-8 text-yellow-300" />
            </div>
            <p className="text-white/80 text-sm font-medium">Categories Leading</p>
            <p className="text-3xl font-bold">
              {strengthsAndWeaknesses.strengths.length}
            </p>
            <p className="text-white/60 text-sm">
              out of {benchmarkData.length} categories
            </p>
            
            <div className="mt-2">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Top quartile performance
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-8 w-8 text-yellow-300" />
            </div>
            <p className="text-white/80 text-sm font-medium">Percentile Score</p>
            <p className="text-3xl font-bold">{overallScore}th</p>
            <p className="text-white/60 text-sm">
              Better than {overallScore}% of peers
            </p>
            
            <div className="mt-2">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <h5 className="font-semibold text-yellow-800 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Your Achievements
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 bg-white rounded-lg p-3 shadow-sm"
              >
                <div className="flex-shrink-0">
                  {React.createElement(achievement.icon, { 
                    className: "h-6 w-6 text-yellow-600" 
                  })}
                </div>
                <div>
                  <h6 className="font-medium text-gray-900 text-sm">{achievement.title}</h6>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Category Rankings */}
      <div className="space-y-4">
        <h5 className="font-semibold text-gray-900">Rankings by Category</h5>
        {categoryRankings.map((ranking, index) => {
          const RankIcon = getRankIcon(ranking.percentile);
          
          return (
            <motion.div
              key={ranking.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${getPercentileBg(ranking.percentile)}`}>
                  {ranking.category === 'Performance' && <TrendingUp className="h-6 w-6 text-gray-600" />}
                  {ranking.category === 'Tax Efficiency' && <Shield className="h-6 w-6 text-gray-600" />}
                  {ranking.category === 'Portfolio Construction' && <PieChart className="h-6 w-6 text-gray-600" />}
                  {ranking.category === 'Income Generation' && <DollarSign className="h-6 w-6 text-gray-600" />}
                </div>
                <div>
                  <h6 className="font-semibold text-gray-900">{ranking.category}</h6>
                  <p className="text-sm text-gray-600">
                    {ranking.metricsCount} metrics tracked
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <RankIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-xl font-bold text-gray-900">
                    #{ranking.rank}
                  </p>
                </div>
                <p className={`text-sm font-medium ${getPercentileColor(ranking.percentile)}`}>
                  {ranking.percentile}th percentile
                </p>
                <p className="text-xs text-gray-500">
                  Top {Math.round((ranking.rank / ranking.totalMembers) * 100)}%
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Competitive Insights */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h5 className="font-semibold text-blue-800 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Competitive Insights
        </h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm text-blue-700">You're outperforming</span>
            <span className="font-bold text-blue-800">{overallScore}% of similar investors</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm text-blue-700">To reach top 10%</span>
            <span className="font-bold text-blue-800">
              Need {Math.max(0, 90 - overallScore)} percentile points
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm text-blue-700">Your strongest category</span>
            <span className="font-bold text-blue-800">
              {strengthsAndWeaknesses.strengths[0]?.category || 'Multiple areas'}
            </span>
          </div>
        </div>
      </div>

      {/* Historical Performance Preview */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-semibold text-gray-900">Ranking History</h5>
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {(['1M', '3M', '6M', '1Y'] as const).map((period) => {
            const mockRank = estimatedRank + Math.floor((Math.random() - 0.5) * 20);
            const mockPercentile = Math.round(100 - (mockRank / currentGroup.size) * 100);
            
            return (
              <div key={period} className="text-center">
                <p className="text-xs text-gray-600 mb-1">{period} ago</p>
                <p className="text-lg font-bold text-gray-900">#{Math.max(1, mockRank)}</p>
                <p className="text-xs text-gray-500">{mockPercentile}th percentile</p>
              </div>
            );
          })}
        </div>
        
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-white rounded-lg border"
            >
              <h6 className="font-medium text-gray-900 mb-3">Anonymous Leaderboard</h6>
              <div className="space-y-2">
                {[
                  { rank: 1, percentile: 98, badge: '👑' },
                  { rank: 2, percentile: 96, badge: '🥈' },
                  { rank: 3, percentile: 94, badge: '🥉' },
                  { rank: estimatedRank, percentile: overallScore, badge: '👤', isUser: true },
                ].map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded ${
                      entry.isUser ? 'bg-purple-50 border border-purple-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{entry.badge}</span>
                      <span className="font-medium text-gray-900">
                        {entry.isUser ? 'You' : `Investor ${entry.rank}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">#{entry.rank}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {entry.percentile}th percentile
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};