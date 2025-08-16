'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  DollarSign,
  Shield,
  AlertCircle,
  CheckCircle,
  Star,
  Clock,
  Zap,
  Award
} from 'lucide-react';

interface IncomeDataPoint {
  month: string;
  grossIncome: number;
  netIncome: number;
  dividendIncome: number;
  otherIncome: number;
  confidence: number;
  reliability: number;
}

interface ConfidenceMetric {
  category: string;
  score: number;
  maxScore: number;
  factors: string[];
  trend: 'up' | 'down' | 'stable';
}

interface ProgressionMilestone {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  completed: boolean;
  estimatedCompletion: string;
  confidence: number;
}

interface IncomeProgressionTrackerProps {
  className?: string;
}

// Empty array - no income data available until user adds income sources
const INCOME_DATA: IncomeDataPoint[] = [];

// Empty array - no confidence metrics available until portfolio data is added
const CONFIDENCE_METRICS: ConfidenceMetric[] = [];

// Empty array - no milestones available until user sets income goals
const PROGRESSION_MILESTONES: ProgressionMilestone[] = [];

export const IncomeProgressionTracker: React.FC<IncomeProgressionTrackerProps> = ({
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'progression' | 'confidence' | 'milestones'>('progression');
  const [timeRange, setTimeRange] = useState<'6M' | '1Y' | '2Y'>('1Y');

  const currentIncome = useMemo(() => {
    if (INCOME_DATA.length === 0) {
      return {
        month: 'No Data',
        grossIncome: 0,
        netIncome: 0,
        dividendIncome: 0,
        otherIncome: 0,
        confidence: 0,
        reliability: 0
      };
    }
    return INCOME_DATA[INCOME_DATA.length - 1];
  }, []);

  const incomeGrowth = useMemo(() => {
    if (INCOME_DATA.length < 2) return 0;
    const current = INCOME_DATA[INCOME_DATA.length - 1].netIncome;
    const previous = INCOME_DATA[INCOME_DATA.length - 2].netIncome;
    return ((current - previous) / previous) * 100;
  }, []);

  const averageConfidence = useMemo(() => {
    if (INCOME_DATA.length === 0) return 0;
    const sum = INCOME_DATA.reduce((total, data) => total + data.confidence, 0);
    return Math.round(sum / INCOME_DATA.length);
  }, []);

  const overallConfidenceScore = useMemo(() => {
    if (CONFIDENCE_METRICS.length === 0) return 0;
    const sum = CONFIDENCE_METRICS.reduce((total, metric) => total + metric.score, 0);
    return Math.round(sum / CONFIDENCE_METRICS.length);
  }, []);

  const nextMilestone = useMemo(() => {
    return PROGRESSION_MILESTONES.find(milestone => !milestone.completed);
  }, []);

  const projectedGrowthRate = useMemo(() => {
    // Calculate trend from last 6 months
    const recentData = INCOME_DATA.slice(-6);
    if (recentData.length < 2) return 0;
    
    const monthlyGrowthRates = [];
    for (let i = 1; i < recentData.length; i++) {
      const growthRate = (recentData[i].netIncome - recentData[i-1].netIncome) / recentData[i-1].netIncome;
      monthlyGrowthRates.push(growthRate);
    }
    
    const avgMonthlyGrowthRate = monthlyGrowthRates.reduce((sum, rate) => sum + rate, 0) / monthlyGrowthRates.length;
    return avgMonthlyGrowthRate * 12 * 100; // Annualized percentage
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-xl font-bold text-white">Income Progression & Confidence</h3>
              <p className="text-emerald-100">
                Track income growth with confidence scoring and predictive analytics
              </p>
            </div>
          </div>
          
          {/* Current Income Display */}
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Current Monthly Income</p>
            <p className="text-3xl font-bold text-white">
              ${currentIncome.netIncome.toLocaleString()}
            </p>
            <div className="flex items-center justify-end space-x-2">
              {incomeGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-200" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300" />
              )}
              <span className={`text-sm ${incomeGrowth > 0 ? 'text-emerald-200' : 'text-red-300'}`}>
                {incomeGrowth > 0 ? '+' : ''}{incomeGrowth.toFixed(1)}% MoM
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          {['progression', 'confidence', 'milestones'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as typeof viewMode)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white text-emerald-600 font-medium'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-emerald-700">Confidence Score</p>
            <p className="text-2xl font-bold text-emerald-600">{overallConfidenceScore}%</p>
          </div>
          <div>
            <p className="text-sm text-emerald-700">Growth Rate</p>
            <p className="text-2xl font-bold text-emerald-600">
              {projectedGrowthRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-emerald-700">Reliability</p>
            <p className="text-2xl font-bold text-emerald-600">{currentIncome.reliability}%</p>
          </div>
          <div>
            <p className="text-sm text-emerald-700">Next Milestone</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${nextMilestone?.targetAmount.toLocaleString() || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Progression View */}
        {viewMode === 'progression' && (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Income Progression Analysis
              </h4>
              <div className="flex space-x-2">
                {['6M', '1Y', '2Y'].map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as typeof timeRange)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      timeRange === range
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Income Trend Chart Area */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Monthly Income Trend</h5>
                  <div className="space-y-2">
                    {INCOME_DATA.slice(-4).map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm text-gray-600">{data.month}</span>
                        <span className="font-medium text-emerald-600">
                          ${data.netIncome.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Income Composition</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Dividend Income</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-blue-600">
                          ${currentIncome.dividendIncome.toLocaleString()}
                        </span>
                        <span className="text-xs text-blue-600">
                          ({((currentIncome.dividendIncome / currentIncome.grossIncome) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Other Income</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-purple-600">
                          ${currentIncome.otherIncome.toLocaleString()}
                        </span>
                        <span className="text-xs text-purple-600">
                          ({((currentIncome.otherIncome / currentIncome.grossIncome) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium text-gray-900">Net Total</span>
                      <span className="font-bold text-emerald-600">
                        ${currentIncome.netIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Analysis */}
              <div className="bg-white rounded-lg p-4 border">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
                  Growth Analysis
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Projected Annual Growth</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {projectedGrowthRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Growth Consistency</p>
                    <p className="text-lg font-bold text-blue-600">87%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Predicted 12M Income</p>
                    <p className="text-lg font-bold text-purple-600">
                      ${Math.round(currentIncome.netIncome * (1 + projectedGrowthRate/100)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Predictive Analytics
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h6 className="font-medium text-blue-800 mb-2">6-Month Projection</h6>
                  <div className="space-y-2">
                    {['Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025'].map((month, index) => {
                      const projectedAmount = Math.round(currentIncome.netIncome * Math.pow(1 + projectedGrowthRate/100/12, index + 1));
                      const confidence = Math.max(60, 95 - (index * 5));
                      
                      return (
                        <div key={month} className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm text-gray-600">{month}</span>
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-blue-600">
                              ${projectedAmount.toLocaleString()}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {confidence}% confidence
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h6 className="font-medium text-blue-800 mb-2">Key Factors</h6>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Portfolio dividend growth (+2.3%/quarter)</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Market conditions favorable</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Tax optimization in place</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">Seasonal variations expected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confidence View */}
        {viewMode === 'confidence' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Income Confidence Analysis
            </h4>

            {/* Confidence Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CONFIDENCE_METRICS.map((metric, index) => {
                const scorePercentage = (metric.score / metric.maxScore) * 100;
                const scoreColor = scorePercentage >= 90 ? 'emerald' : scorePercentage >= 75 ? 'blue' : scorePercentage >= 60 ? 'yellow' : 'red';
                const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity;
                
                return (
                  <motion.div
                    key={metric.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-${scoreColor}-50 rounded-lg p-6 border border-${scoreColor}-200`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h5 className={`font-semibold text-${scoreColor}-800`}>{metric.category}</h5>
                      <div className="flex items-center space-x-2">
                        <TrendIcon className={`h-4 w-4 text-${scoreColor}-600`} />
                        <span className={`text-2xl font-bold text-${scoreColor}-600`}>
                          {metric.score}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`w-full bg-${scoreColor}-200 rounded-full h-3 mb-4`}>
                      <div
                        className={`bg-${scoreColor}-500 h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${scorePercentage}%` }}
                      />
                    </div>
                    
                    {/* Factors */}
                    <div className="space-y-1">
                      {metric.factors.map((factor, factorIndex) => (
                        <div key={factorIndex} className="flex items-center space-x-2">
                          <CheckCircle className={`h-3 w-3 text-${scoreColor}-600`} />
                          <span className={`text-xs text-${scoreColor}-700`}>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Monthly Confidence Trend */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h5 className="font-medium text-gray-900 mb-4">Monthly Confidence Trend</h5>
              <div className="grid gap-2">
                {INCOME_DATA.slice(-6).map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-sm text-gray-600">{data.month}</span>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full ${
                            data.confidence >= 90 ? 'bg-emerald-500' :
                            data.confidence >= 80 ? 'bg-blue-500' :
                            data.confidence >= 70 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${data.confidence}%` }}
                        />
                      </div>
                      <span className="font-medium text-gray-900 w-12 text-right">
                        {data.confidence}%
                      </span>
                      <span className="text-sm text-gray-500 w-16 text-right">
                        ({data.reliability}% reliable)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Milestones View */}
        {viewMode === 'milestones' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Income Milestones & Goals
            </h4>

            {/* Milestone Progress */}
            <div className="space-y-4">
              {PROGRESSION_MILESTONES.map((milestone, index) => {
                const progress = Math.min((milestone.currentAmount / milestone.targetAmount) * 100, 100);
                const isCompleted = milestone.completed;
                const isNext = !isCompleted && !PROGRESSION_MILESTONES.slice(0, index).some(m => !m.completed);
                
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-2 rounded-lg p-6 ${
                      isCompleted ? 'bg-emerald-50 border-emerald-300' :
                      isNext ? 'bg-blue-50 border-blue-300' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {isCompleted ? (
                          <div className="bg-emerald-500 rounded-full p-2">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                        ) : isNext ? (
                          <div className="bg-blue-500 rounded-full p-2">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div className="bg-gray-400 rounded-full p-2">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div>
                          <h5 className="font-semibold text-gray-900">{milestone.title}</h5>
                          <p className="text-sm text-gray-600">
                            {isCompleted ? `Completed ${milestone.estimatedCompletion}` :
                             `Target: ${milestone.estimatedCompletion}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${milestone.currentAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          of ${milestone.targetAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className={`text-sm font-medium ${
                          isCompleted ? 'text-emerald-600' :
                          isNext ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' :
                            isNext ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Confidence and Timing */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {milestone.confidence}% confidence
                          </span>
                        </div>
                        {isNext && (
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600">Next milestone</span>
                          </div>
                        )}
                      </div>
                      
                      {!isCompleted && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            ${(milestone.targetAmount - milestone.currentAmount).toLocaleString()} remaining
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Milestone Analytics */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h5 className="font-semibold text-purple-800 mb-4">Milestone Analytics</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-purple-700">Completed Milestones</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {PROGRESSION_MILESTONES.filter(m => m.completed).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-purple-700">Average Confidence</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(PROGRESSION_MILESTONES.reduce((sum, m) => sum + m.confidence, 0) / PROGRESSION_MILESTONES.length)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-purple-700">Est. Time to Next</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {nextMilestone?.estimatedCompletion.split(' ')[0] || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};