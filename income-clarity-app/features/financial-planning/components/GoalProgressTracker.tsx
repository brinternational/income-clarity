'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Calculator,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { useIncomeHub } from '@/store/superCardStore';

interface Goal {
  id: string;
  title: string;
  category: 'income' | 'portfolio' | 'fire' | 'expense' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  milestones: Array<{
    percentage: number;
    description: string;
    completed?: boolean;
  }>;
}

interface GoalProgressTrackerProps {
  goal: Goal;
  onUpdateProgress: (goalId: string, newAmount: number) => void;
  className?: string;
}

export const GoalProgressTracker = ({
  goal,
  onUpdateProgress,
  className = ''
}: GoalProgressTrackerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newAmount, setNewAmount] = useState(goal.currentAmount.toString());
  const { availableToReinvest, monthlyIncome } = useIncomeHub();

  // Calculate progress metrics
  const progressMetrics = useMemo(() => {
    const progressPercentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    
    const targetDate = new Date(goal.targetDate);
    const currentDate = new Date();
    const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    const monthsRemaining = Math.max(0.1, daysRemaining / 30);
    
    // Calculate required monthly savings
    const requiredMonthlySavings = remainingAmount / monthsRemaining;
    
    // Calculate timeline predictions based on current income
    const monthlyAvailable = availableToReinvest || 0;
    let projectedCompletion = null;
    let onTrack = true;
    
    if (monthlyAvailable > 0 && remainingAmount > 0) {
      const monthsToComplete = remainingAmount / monthlyAvailable;
      projectedCompletion = new Date();
      projectedCompletion.setMonth(projectedCompletion.getMonth() + monthsToComplete);
      onTrack = projectedCompletion <= targetDate;
    }

    return {
      progressPercentage,
      remainingAmount,
      daysRemaining,
      monthsRemaining,
      requiredMonthlySavings,
      projectedCompletion,
      onTrack,
      isCompleted: progressPercentage >= 100,
      isOverdue: daysRemaining <= 0 && progressPercentage < 100
    };
  }, [goal, availableToReinvest]);

  // Animated progress values
  const animatedValues = useStaggeredCountingAnimation(
    {
      currentAmount: goal.currentAmount,
      progressPercentage: progressMetrics.progressPercentage,
      remainingAmount: progressMetrics.remainingAmount,
      requiredMonthlySavings: progressMetrics.requiredMonthlySavings
    },
    1000,
    100
  );

  const getStatusColor = () => {
    if (progressMetrics.isCompleted) return 'text-green-600';
    if (progressMetrics.isOverdue) return 'text-red-600';
    if (!progressMetrics.onTrack) return 'text-orange-600';
    return 'text-blue-600';
  };

  const getStatusIcon = () => {
    if (progressMetrics.isCompleted) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (progressMetrics.isOverdue) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (!progressMetrics.onTrack) return <Clock className="w-5 h-5 text-orange-600" />;
    return <Zap className="w-5 h-5 text-blue-600" />;
  };

  const getStatusMessage = () => {
    if (progressMetrics.isCompleted) return 'Goal completed! 🎉';
    if (progressMetrics.isOverdue) return 'Goal is overdue';
    if (!progressMetrics.onTrack) return 'Behind schedule';
    if (progressMetrics.projectedCompletion) {
      const ahead = progressMetrics.projectedCompletion < new Date(goal.targetDate);
      return ahead ? 'Ahead of schedule' : 'On track';
    }
    return 'In progress';
  };

  const handleSaveProgress = () => {
    const amount = parseFloat(newAmount);
    if (!isNaN(amount) && amount >= 0) {
      onUpdateProgress(goal.id, amount);
      setIsEditing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-xl border-2 border-slate-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon()}
            <h3 className="text-lg font-semibold text-slate-800">{goal.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              goal.priority === 'high' ? 'bg-red-100 text-red-600' :
              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>
              {goal.priority} priority
            </span>
          </div>
          
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Progress</span>
          <span className={`text-sm font-bold ${getStatusColor()}`}>
            {animatedValues.progressPercentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-3 rounded-full ${
              progressMetrics.isCompleted ? 'bg-green-500' :
              progressMetrics.isOverdue ? 'bg-red-500' :
              !progressMetrics.onTrack ? 'bg-orange-500' :
              'bg-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, animatedValues.progressPercentage)}%` }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-25 rounded-lg border border-blue-100">
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(animatedValues.currentAmount)}
          </div>
          <div className="text-xs text-slate-600">Current Amount</div>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-25 rounded-lg border border-green-100">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(goal.targetAmount)}
          </div>
          <div className="text-xs text-slate-600">Target Amount</div>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-25 rounded-lg border border-orange-100">
          <div className="text-lg font-bold text-orange-600">
            {formatCurrency(animatedValues.remainingAmount)}
          </div>
          <div className="text-xs text-slate-600">Remaining</div>
        </div>
        
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-25 rounded-lg border border-purple-100">
          <div className="text-lg font-bold text-purple-600">
            {progressMetrics.daysRemaining}
          </div>
          <div className="text-xs text-slate-600">Days Left</div>
        </div>
      </div>

      {/* Smart Insights */}
      {!progressMetrics.isCompleted && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-25 rounded-lg p-4 mb-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>Smart Insights</span>
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Required monthly savings:</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(animatedValues.requiredMonthlySavings)}
              </span>
            </div>
            
            {availableToReinvest > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Available monthly:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(availableToReinvest)}
                </span>
              </div>
            )}
            
            {progressMetrics.projectedCompletion && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Projected completion:</span>
                <span className={`font-semibold ${progressMetrics.onTrack ? 'text-green-600' : 'text-orange-600'}`}>
                  {progressMetrics.projectedCompletion.toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Target date:</span>
              <span className="font-semibold text-slate-800">
                {formatDate(goal.targetDate)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Section */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Update Progress</span>
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-32 px-3 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
                step="0.01"
              />
              <button
                onClick={handleSaveProgress}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewAmount(goal.currentAmount.toString());
                }}
                className="px-3 py-1 bg-slate-300 text-slate-700 text-sm rounded hover:bg-slate-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Update Amount</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <button
          onClick={() => onUpdateProgress(goal.id, goal.currentAmount + (availableToReinvest || 1000))}
          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1 text-xs"
        >
          <ArrowUp className="w-3 h-3" />
          <span>Add Monthly</span>
        </button>
        
        <button
          onClick={() => onUpdateProgress(goal.id, Math.max(0, goal.currentAmount - 1000))}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1 text-xs"
        >
          <ArrowDown className="w-3 h-3" />
          <span>Subtract</span>
        </button>
        
        <button
          onClick={() => onUpdateProgress(goal.id, goal.targetAmount)}
          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1 text-xs"
        >
          <Target className="w-3 h-3" />
          <span>Complete</span>
        </button>
      </div>
    </div>
  );
};