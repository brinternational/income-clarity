'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MilestoneCelebrations } from './MilestoneCelebrations';
import { Settings, Play, RotateCcw, Zap, Trophy } from 'lucide-react';
import { logger } from '@/lib/logger'

interface DemoProps {
  className?: string;
}

export const MilestoneCelebrationsDemo: React.FC<DemoProps> = ({ className = '' }) => {
  const [simulatedProgress, setSimulatedProgress] = useState({
    monthlyIncome: 75,
    portfolioValue: 8500,
    expenseCoverage: 15,
    taxSavings: 500,
    fireProgress: 8,
    currentStreak: 2,
    savingsRate: 20
  });

  const [settings, setSettings] = useState({
    enableHaptics: true,
    enableSounds: false,
    autoDetectMilestones: true,
    persistAchievements: true
  });

  const simulateProgress = (type: string) => {
    setSimulatedProgress(prev => {
      switch (type) {
        case 'income-100':
          return { ...prev, monthlyIncome: 120 };
        case 'income-500':
          return { ...prev, monthlyIncome: 550 };
        case 'portfolio-10k':
          return { ...prev, portfolioValue: 12000 };
        case 'portfolio-100k':
          return { ...prev, portfolioValue: 105000 };
        case 'coverage-25':
          return { ...prev, expenseCoverage: 28 };
        case 'coverage-50':
          return { ...prev, expenseCoverage: 55 };
        case 'streak-3':
          return { ...prev, currentStreak: 4 };
        case 'fire-10':
          return { ...prev, fireProgress: 12 };
        case 'tax-1k':
          return { ...prev, taxSavings: 1200 };
        case 'savings-25':
          return { ...prev, savingsRate: 30 };
        default:
          return prev;
      }
    });
  };

  const resetProgress = () => {
    setSimulatedProgress({
      monthlyIncome: 75,
      portfolioValue: 8500,
      expenseCoverage: 15,
      taxSavings: 500,
      fireProgress: 8,
      currentStreak: 2,
      savingsRate: 20
    });
    // Clear stored achievements for demo
    if (typeof window !== 'undefined') {
      localStorage.removeItem('income-clarity-achievements');
    }
  };

  const simulatedUserProgress = {
    level: Math.floor((simulatedProgress.monthlyIncome + simulatedProgress.portfolioValue / 1000) / 10),
    totalPoints: Math.floor(simulatedProgress.monthlyIncome * 10 + simulatedProgress.portfolioValue / 10),
    pointsToNextLevel: 1000,
    currentStreak: simulatedProgress.currentStreak,
    longestStreak: Math.max(simulatedProgress.currentStreak, 3),
    milestonesUnlocked: Math.floor(simulatedProgress.expenseCoverage / 5),
    savingsRate: simulatedProgress.savingsRate,
    netWorth: simulatedProgress.portfolioValue,
    monthsActive: 6,
    monthlyIncome: simulatedProgress.monthlyIncome,
    portfolioValue: simulatedProgress.portfolioValue,
    expenseCoverage: simulatedProgress.expenseCoverage,
    taxSavings: simulatedProgress.taxSavings,
    fireProgress: simulatedProgress.fireProgress,
    customGoalsCompleted: 1
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Demo Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Settings className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Demo Controls</h3>
              <p className="text-sm text-slate-600">Test milestone celebrations</p>
            </div>
          </div>
          
          <button
            onClick={resetProgress}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Current Progress Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">Monthly Income</div>
            <div className="text-xl font-bold text-blue-800">${simulatedProgress.monthlyIncome}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Portfolio Value</div>
            <div className="text-xl font-bold text-green-800">${simulatedProgress.portfolioValue.toLocaleString()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium mb-1">Coverage</div>
            <div className="text-xl font-bold text-purple-800">{simulatedProgress.expenseCoverage}%</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium mb-1">FIRE Progress</div>
            <div className="text-xl font-bold text-orange-800">{simulatedProgress.fireProgress}%</div>
          </div>
        </div>

        {/* Milestone Trigger Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => simulateProgress('income-100')}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            disabled={simulatedProgress.monthlyIncome >= 100}
          >
            <Play className="w-3 h-3" />
            <span>$100 Income</span>
          </button>
          
          <button
            onClick={() => simulateProgress('portfolio-10k')}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
            disabled={simulatedProgress.portfolioValue >= 10000}
          >
            <Play className="w-3 h-3" />
            <span>$10K Portfolio</span>
          </button>
          
          <button
            onClick={() => simulateProgress('coverage-25')}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
            disabled={simulatedProgress.expenseCoverage >= 25}
          >
            <Play className="w-3 h-3" />
            <span>25% Coverage</span>
          </button>
          
          <button
            onClick={() => simulateProgress('streak-3')}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            disabled={simulatedProgress.currentStreak >= 3}
          >
            <Play className="w-3 h-3" />
            <span>3 Month Streak</span>
          </button>
          
          <button
            onClick={() => simulateProgress('fire-10')}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
            disabled={simulatedProgress.fireProgress >= 10}
          >
            <Play className="w-3 h-3" />
            <span>10% FIRE</span>
          </button>
        </div>

        {/* Settings Toggle */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.enableHaptics}
              onChange={(e) => setSettings(prev => ({ ...prev, enableHaptics: e.target.checked }))}
              className="rounded border-slate-300 text-primary-600 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="text-sm text-slate-700">Haptics</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.enableSounds}
              onChange={(e) => setSettings(prev => ({ ...prev, enableSounds: e.target.checked }))}
              className="rounded border-slate-300 text-primary-600 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="text-sm text-slate-700">Sounds</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.autoDetectMilestones}
              onChange={(e) => setSettings(prev => ({ ...prev, autoDetectMilestones: e.target.checked }))}
              className="rounded border-slate-300 text-primary-600 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="text-sm text-slate-700">Auto Detect</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.persistAchievements}
              onChange={(e) => setSettings(prev => ({ ...prev, persistAchievements: e.target.checked }))}
              className="rounded border-slate-300 text-primary-600 focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <span className="text-sm text-slate-700">Persist</span>
          </label>
        </div>
      </div>

      {/* Milestone Celebrations Component */}
      <MilestoneCelebrations
        userProgress={simulatedUserProgress}
        onAchievementUnlock={(id) => logger.log('Achievement unlocked:', id)}
        onCelebrationShare={(achievement) => logger.log('Sharing achievement:', achievement)}
        enableHaptics={settings.enableHaptics}
        enableSounds={settings.enableSounds}
        autoDetectMilestones={settings.autoDetectMilestones}
        persistAchievements={settings.persistAchievements}
        className="min-h-screen"
      />
    </div>
  );
};

export default MilestoneCelebrationsDemo;