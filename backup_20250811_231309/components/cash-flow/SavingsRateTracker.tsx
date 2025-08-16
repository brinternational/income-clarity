'use client';

import React from 'react';
import { Target, TrendingUp, Award, AlertTriangle } from 'lucide-react';

interface SavingsRateTrackerProps {
  currentRate: number;
  isAboveZero: boolean;
  targetRate?: number;
  historicalRates?: Array<{
    period: string;
    rate: number;
  }>;
}

export function SavingsRateTracker({ 
  currentRate, 
  isAboveZero, 
  targetRate = 20,
  historicalRates = []
}: SavingsRateTrackerProps) {

  const getSavingsRateLevel = (rate: number) => {
    if (rate < 0) return { level: 'negative', label: 'Negative', color: 'red' };
    if (rate < 5) return { level: 'low', label: 'Getting Started', color: 'orange' };
    if (rate < 10) return { level: 'fair', label: 'Fair', color: 'yellow' };
    if (rate < 15) return { level: 'good', label: 'Good', color: 'blue' };
    if (rate < 20) return { level: 'great', label: 'Great', color: 'green' };
    return { level: 'excellent', label: 'FIRE Track', color: 'purple' };
  };

  const currentLevel = getSavingsRateLevel(currentRate);
  const progressPercentage = Math.min(Math.max((currentRate / targetRate) * 100, 0), 100);

  const milestones = [
    { rate: 5, label: 'Getting Started', icon: '🌱', description: 'Building the habit' },
    { rate: 10, label: 'Building Momentum', icon: '🚀', description: 'Making progress' },
    { rate: 15, label: 'Strong Saver', icon: '💪', description: 'Above average' },
    { rate: 20, label: 'FIRE Track', icon: '🔥', description: 'Financial independence' },
    { rate: 30, label: 'Aggressive Saver', icon: '⚡', description: 'Fast track to FIRE' },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-500 text-red-50 border-red-200',
      orange: 'bg-orange-500 text-orange-50 border-orange-200',
      yellow: 'bg-yellow-500 text-yellow-50 border-yellow-200',
      blue: 'bg-blue-500 text-blue-50 border-blue-200',
      green: 'bg-green-500 text-green-50 border-green-200',
      purple: 'bg-purple-500 text-purple-50 border-purple-200'
    };
    return colors[color as keyof typeof colors];
  };

  const getBackgroundClasses = (color: string) => {
    const colors = {
      red: 'bg-red-50 border-red-200',
      orange: 'bg-orange-50 border-orange-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Savings Rate Tracker
        </h3>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorClasses(currentLevel.color)}`}>
          {currentLevel.label}
        </div>
      </div>

      {/* Current Rate Display */}
      <div className={`rounded-lg p-6 border mb-6 ${getBackgroundClasses(currentLevel.color)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium text-gray-700">Current Savings Rate</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {currentRate >= 0 ? '+' : ''}{currentRate.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-right">
            {isAboveZero ? (
              <div className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Above Zero!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">Below Zero</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress to Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Progress to {targetRate}% target</span>
            <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
          </div>
          
          <div className="w-full bg-white bg-opacity-50 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-700 ease-out ${
                currentRate >= 0 ? 'bg-white bg-opacity-80' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4 mb-6">
        <div className="text-sm font-medium text-gray-700">Savings Rate Milestones</div>
        
        <div className="space-y-3">
          {milestones.map((milestone, index) => {
            const isAchieved = currentRate >= milestone.rate;
            const isCurrent = currentRate >= milestone.rate && 
              (index === milestones.length - 1 || currentRate < milestones[index + 1].rate);
            
            return (
              <div 
                key={milestone.rate}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isAchieved 
                    ? isCurrent
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className={`text-2xl ${isAchieved ? '' : 'grayscale opacity-50'}`}>
                  {milestone.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {milestone.rate}% - {milestone.label}
                    </span>
                    {isAchieved && (
                      <Award className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{milestone.description}</div>
                </div>
                
                {/* Status */}
                <div className="text-right">
                  {isCurrent && (
                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Current
                    </div>
                  )}
                  {isAchieved && !isCurrent && (
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Recommendations</h4>
        <div className="text-sm text-gray-700 space-y-1">
          {currentRate < 0 && (
            <>
              <p>• Focus on getting above zero first by reducing expenses or increasing income</p>
              <p>• Review your largest expense categories for potential cuts</p>
            </>
          )}
          {currentRate >= 0 && currentRate < 10 && (
            <>
              <p>• Great job getting above zero! Now aim for 10% to build momentum</p>
              <p>• Consider automating savings to make it easier</p>
            </>
          )}
          {currentRate >= 10 && currentRate < 20 && (
            <>
              <p>• You're doing well! Push toward 20% for financial independence</p>
              <p>• Look for opportunities to increase income or optimize expenses</p>
            </>
          )}
          {currentRate >= 20 && (
            <>
              <p>• Excellent! You're on the FIRE track 🔥</p>
              <p>• Consider investment strategies to maximize your savings growth</p>
            </>
          )}
          <p>• Remember: consistency beats perfection. Small improvements compound over time.</p>
        </div>
      </div>
    </div>
  );
}