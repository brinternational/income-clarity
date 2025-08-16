'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  TrendingUp, 
  Calendar, 
  Target,
  Award,
  CheckCircle
} from 'lucide-react';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';

interface AboveZeroTrackerProps {
  currentStreak: number;
  longestStreak: number;
  totalMonths: number;
  currentAmount: number;
  isAboveZero: boolean;
  className?: string;
}

interface Milestone {
  months: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const AboveZeroTracker = ({
  currentStreak = 6,
  longestStreak = 8,
  totalMonths = 24,
  currentAmount = 625,
  isAboveZero = true,
  className = ''
}: AboveZeroTrackerProps) => {
  const [celebratingMilestone, setCelebratingMilestone] = useState<Milestone | null>(null);
  
  const successRate = totalMonths > 0 ? Math.round((currentStreak / totalMonths) * 100) : 0;
  
  // Animated values
  const animatedValues = useStaggeredCountingAnimation(
    {
      currentStreak,
      longestStreak,
      successRate,
      currentAmount: Math.abs(currentAmount)
    },
    1000,
    100
  );

  // Milestone definitions
  const milestones: Milestone[] = [
    {
      months: 3,
      title: 'Getting Started',
      description: '3 months above zero',
      icon: '🌱',
      unlocked: currentStreak >= 3
    },
    {
      months: 6,
      title: 'Building Momentum',
      description: '6 months of consistent growth',
      icon: '🚀',
      unlocked: currentStreak >= 6
    },
    {
      months: 12,
      title: 'One Year Strong',
      description: '12 months of financial discipline',
      icon: '🏆',
      unlocked: currentStreak >= 12
    },
    {
      months: 18,
      title: 'Wealth Builder',
      description: '18 months of compound growth',
      icon: '💎',
      unlocked: currentStreak >= 18
    },
    {
      months: 24,
      title: 'Financial Mastermind',
      description: '2 years of consistent wealth building',
      icon: '👑',
      unlocked: currentStreak >= 24
    }
  ];

  // Check for new milestones
  useEffect(() => {
    const newMilestone = milestones.find(m => 
      m.months === currentStreak && m.unlocked
    );
    
    if (newMilestone && currentStreak > 0) {
      setCelebratingMilestone(newMilestone);
      setTimeout(() => setCelebratingMilestone(null), 5000);
    }
  }, [currentStreak]);

  const getStreakMessage = () => {
    if (!isAboveZero) {
      return {
        message: "Focus on reaching positive cash flow",
        color: "text-red-600",
        bgColor: "bg-red-50"
      };
    }
    
    if (currentStreak === 0) {
      return {
        message: "Start your wealth building journey",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    }
    
    if (currentStreak < 3) {
      return {
        message: "Great start! Keep building momentum",
        color: "text-green-600",
        bgColor: "bg-green-50"
      };
    }
    
    if (currentStreak < 6) {
      return {
        message: "Excellent progress! Consistency is key",
        color: "text-prosperity-600",
        bgColor: "bg-prosperity-50"
      };
    }
    
    if (currentStreak < 12) {
      return {
        message: "Amazing dedication! You're building wealth!",
        color: "text-wealth-600",
        bgColor: "bg-wealth-50"
      };
    }
    
    return {
      message: "Wealth building master! Keep it going!",
      color: "text-primary-600",
      bgColor: "bg-primary-50"
    };
  };

  const streakInfo = getStreakMessage();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Milestone Celebration */}
      {celebratingMilestone && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 text-center max-w-sm w-full"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            <div className="text-6xl mb-4">{celebratingMilestone.icon}</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {celebratingMilestone.title}!
            </h3>
            <p className="text-slate-600 mb-6">{celebratingMilestone.description}</p>
            <button
              onClick={() => setCelebratingMilestone(null)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Continue Building Wealth!
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Main Streak Display */}
      <div className={`p-6 rounded-2xl border-2 ${streakInfo.bgColor} border-opacity-50`}>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl"
              whileHover={{ scale: 1.05 }}
              animate={{ rotate: isAboveZero ? [0, -5, 5, 0] : 0 }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Flame className="w-8 h-8 text-orange-600" />
            </motion.div>
          </div>
          
          <motion.div
            className="text-6xl font-bold text-primary-600 mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {Math.round(animatedValues.currentStreak)}
          </motion.div>
          
          <div className="text-xl font-semibold text-slate-700 mb-2">
            Month{currentStreak !== 1 ? 's' : ''} Above Zero
          </div>
          
          <div className={`text-sm font-medium ${streakInfo.color}`}>
            {streakInfo.message}
          </div>
        </div>

        {/* Current Amount Display */}
        <div className="text-center mb-6">
          <div className={`text-3xl font-bold mb-2 ${
            isAboveZero ? 'text-green-600' : 'text-red-600'
          }`}>
            {isAboveZero ? '+' : '-'}${Math.round(animatedValues.currentAmount).toLocaleString()}/month
          </div>
          <div className="text-sm text-slate-600">
            {isAboveZero ? 'Available to reinvest' : 'Amount to optimize'}
          </div>
        </div>

        {/* Streak Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {Math.round(animatedValues.currentStreak)}
            </div>
            <div className="text-xs text-slate-600">Current</div>
          </div>
          
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <div className="text-2xl font-bold text-wealth-600 mb-1">
              {Math.round(animatedValues.longestStreak)}
            </div>
            <div className="text-xs text-slate-600">Record</div>
          </div>
          
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(animatedValues.successRate)}%
            </div>
            <div className="text-xs text-slate-600">Success</div>
          </div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-slate-800">Milestone Progress</h3>
        </div>
        
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.months}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${
                milestone.unlocked 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-slate-50 border border-slate-200'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-2xl">{milestone.icon}</div>
              
              <div className="flex-1">
                <div className={`font-semibold ${
                  milestone.unlocked ? 'text-green-800' : 'text-slate-600'
                }`}>
                  {milestone.title}
                </div>
                <div className="text-xs text-slate-500">
                  {milestone.description}
                </div>
              </div>
              
              <div className="flex items-center">
                {milestone.unlocked ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-full"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-primary-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
          <Target className="w-5 h-5 text-primary-600 mr-2" />
          Streak Insights
        </h3>
        
        <div className="space-y-3 text-sm">
          {isAboveZero ? (
            <>
              <div className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Wealth Building Mode Active</div>
                  <div className="text-green-600">You're consistently living below your means</div>
                </div>
              </div>
              
              {currentStreak >= 6 && (
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Compound Growth Effect</div>
                    <div className="text-blue-600">Your consistency is creating compound wealth</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start space-x-2">
              <Target className="w-4 h-4 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium text-orange-800">Optimization Opportunity</div>
                <div className="text-orange-600">Focus on increasing income or reducing expenses</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};