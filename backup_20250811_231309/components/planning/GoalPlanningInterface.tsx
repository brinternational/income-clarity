'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Award,
  Clock,
  Zap,
  Lightbulb,
  Filter,
  BarChart3,
  Settings,
  Star
} from 'lucide-react';
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation';
import { useGoalStore } from '@/hooks/useGoalStore';
import { FinancialGoalCreationModal } from './FinancialGoalCreationModal';
import { GoalProgressTracker } from './GoalProgressTracker';
import { useIncomeHub } from '@/store/superCardStore';

interface SMARTGoal {
  id: string;
  title: string;
  description: string;
  specific: string;
  measurable: number;
  achievable: string;
  relevant: string;
  timeBound: string;
  targetDate: Date;
  currentProgress: number;
  category: 'financial' | 'career' | 'personal' | 'health' | 'education';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'at-risk';
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
}

interface GoalPlanningInterfaceProps {
  goals?: SMARTGoal[];
  onGoalCreate?: (goal: Omit<SMARTGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onGoalUpdate?: (id: string, updates: Partial<SMARTGoal>) => void;
  onGoalDelete?: (id: string) => void;
  onMilestoneToggle?: (goalId: string, milestoneId: string) => void;
  className?: string;
}

const defaultGoals: SMARTGoal[] = [
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    description: 'Build a complete emergency fund for financial security',
    specific: 'Save 6 months of living expenses in a high-yield savings account',
    measurable: 18000,
    achievable: 'Save $1,500 monthly by reducing discretionary spending',
    relevant: 'Essential for financial stability and peace of mind',
    timeBound: 'Complete by December 31, 2024',
    targetDate: new Date('2024-12-31'),
    currentProgress: 8500,
    category: 'financial',
    priority: 'high',
    status: 'active',
    milestones: [
      {
        id: 'milestone-1',
        title: '3 Months Expenses',
        description: 'First major milestone - 3 months coverage',
        targetValue: 9000,
        currentValue: 8500,
        targetDate: new Date('2024-06-30'),
        completed: false
      },
      {
        id: 'milestone-2',
        title: '6 Months Full Coverage',
        description: 'Complete emergency fund goal',
        targetValue: 18000,
        currentValue: 8500,
        targetDate: new Date('2024-12-31'),
        completed: false
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 'house-down-payment',
    title: 'House Down Payment',
    description: 'Save for dream home down payment',
    specific: 'Save $80,000 for 20% down payment on $400,000 home',
    measurable: 80000,
    achievable: 'Invest $2,000 monthly in conservative portfolio',
    relevant: 'Building long-term wealth through real estate ownership',
    timeBound: 'Target completion by June 2026',
    targetDate: new Date('2026-06-30'),
    currentProgress: 25000,
    category: 'financial',
    priority: 'medium',
    status: 'active',
    milestones: [
      {
        id: 'milestone-3',
        title: '25% Progress',
        description: 'Quarter way to down payment',
        targetValue: 20000,
        currentValue: 25000,
        targetDate: new Date('2024-12-31'),
        completed: true,
        completedAt: new Date('2024-03-01')
      },
      {
        id: 'milestone-4',
        title: '50% Progress',
        description: 'Halfway to down payment goal',
        targetValue: 40000,
        currentValue: 25000,
        targetDate: new Date('2025-06-30'),
        completed: false
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 'skill-development',
    title: 'Professional Certification',
    description: 'Advance career through specialized certification',
    specific: 'Complete AWS Solutions Architect certification',
    measurable: 1, // 1 certification
    achievable: 'Study 10 hours weekly, take practice exams',
    relevant: 'Increases earning potential by 20-30%',
    timeBound: 'Pass certification exam by September 2024',
    targetDate: new Date('2024-09-30'),
    currentProgress: 0.6, // 60% complete
    category: 'career',
    priority: 'high',
    status: 'active',
    milestones: [
      {
        id: 'milestone-5',
        title: 'Complete Course Materials',
        description: 'Finish all learning modules',
        targetValue: 1,
        currentValue: 0.8,
        targetDate: new Date('2024-07-31'),
        completed: false
      },
      {
        id: 'milestone-6',
        title: 'Practice Exams',
        description: 'Score 90%+ on practice tests',
        targetValue: 3,
        currentValue: 1,
        targetDate: new Date('2024-08-31'),
        completed: false
      }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15')
  }
];

export const GoalPlanningInterface = ({
  goals: legacyGoals,
  onGoalCreate,
  onGoalUpdate,
  onGoalDelete,
  onMilestoneToggle,
  className = ''
}: GoalPlanningInterfaceProps) => {
  // Use new goal store
  const {
    goals,
    stats,
    insights,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    getGoalsByStatus
  } = useGoalStore();
  
  // Get income data for smart suggestions
  const { monthlyIncome, availableToReinvest } = useIncomeHub();
  
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [celebrationGoal, setCelebrationGoal] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'at-risk'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'deadline'>('priority');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'tracker'>('grid');

  // Use goal store stats
  const goalStats = stats;

  // Animated values for statistics
  const animatedStats = useStaggeredCountingAnimation(
    {
      total: goalStats.total,
      completed: goalStats.completed,
      atRisk: goalStats.atRisk,
      avgProgress: goalStats.averageProgress
    },
    1000,
    100
  );

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let filtered = goals.filter(goal => {
      if (filter === 'all') return true;
      if (filter === 'completed') return goal.status === 'completed';
      if (filter === 'active') return goal.status === 'active';
      if (filter === 'at-risk') return goal.status === 'at-risk';
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === 'progress') {
        const aProgress = (a.currentAmount / a.targetAmount) * 100;
        const bProgress = (b.currentAmount / b.targetAmount) * 100;
        return bProgress - aProgress;
      }
      if (sortBy === 'deadline') {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      return 0;
    });
  }, [goals, filter, sortBy]);

  // Check for new insights that might trigger celebrations
  useEffect(() => {
    const successInsights = insights.filter(insight => insight.type === 'success');
    if (successInsights.length > 0) {
      // Show celebration for milestone achievements
      const milestoneInsight = successInsights.find(insight => 
        insight.title.includes('Milestone') && insight.goalId
      );
      if (milestoneInsight) {
        const goal = goals.find(g => g.id === milestoneInsight.goalId);
        if (goal) {
          setCelebrationGoal(goal);
          setTimeout(() => setCelebrationGoal(null), 4000);
        }
      }
    }
  }, [insights, goals]);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: SMARTGoal['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'at-risk': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'paused': return <Clock className="w-5 h-5 text-gray-600" />;
      default: return <Zap className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: SMARTGoal['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatProgress = (goal: any) => {
    return `${formatCurrency(goal.currentAmount)} / ${formatCurrency(goal.targetAmount)}`;
  };

  const getProgressPercentage = (goal: any) => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const handleCreateGoal = (goalData: any) => {
    addGoal(goalData);
    setShowGoalForm(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Milestone Celebration Modal */}
      <AnimatePresence>
        {celebrationGoal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center max-w-md w-full"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Milestone Achieved!
              </h3>
              <p className="text-slate-600 mb-4">
                Congratulations on reaching a milestone for "{celebrationGoal.title}"!
              </p>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-yellow-600">Goal Progress Updated</span>
              </div>
              <button
                onClick={() => setCelebrationGoal(null)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Keep Going!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Goal Creation Modal */}
      <FinancialGoalCreationModal
        isOpen={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        onCreateGoal={handleCreateGoal}
      />

      {/* Header and Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-primary-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Goal Planning Hub</h2>
            <p className="text-slate-600">
              Create and track financial goals with smart suggestions
              {availableToReinvest > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  • ${Math.round(availableToReinvest).toLocaleString()}/month available
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {Math.round(animatedStats.total)}
            </div>
            <div className="text-xs text-slate-600">Total Goals</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(animatedStats.completed)}
            </div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {Math.round(animatedStats.atRisk)}
            </div>
            <div className="text-xs text-slate-600">At Risk</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(animatedStats.avgProgress)}%
            </div>
            <div className="text-xs text-slate-600">Avg Progress</div>
          </div>
        </div>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center space-x-2 mb-3">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span>Smart Insights</span>
            </h4>
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight, index) => (
                <motion.div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    insight.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' :
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                    insight.type === 'danger' ? 'bg-red-50 border-red-400 text-red-800' :
                    'bg-blue-50 border-blue-400 text-blue-800'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs opacity-80 mt-1">{insight.message}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Goals
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === 'active' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === 'completed' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('at-risk')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              filter === 'at-risk' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            At Risk
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">View:</span>
            <div className="flex bg-slate-100 rounded-lg p-1">
              {[
                { id: 'grid', label: 'Grid', icon: BarChart3 },
                { id: 'list', label: 'List', icon: Filter },
                { id: 'tracker', label: 'Tracker', icon: Target }
              ].map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => setViewMode(view.id as any)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${
                      viewMode === view.id
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:block">{view.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2"
            >
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Goals Display */}
      <div className="space-y-4">
        {viewMode === 'tracker' ? (
          /* Goal Progress Tracker View */
          <div className="space-y-6">
            {filteredGoals.map((goal, index) => (
              <GoalProgressTracker
                key={goal.id}
                goal={goal}
                onUpdateProgress={updateGoalProgress}
                className="animate-slide-up"
              />
            ))}
          </div>
        ) : (
          /* Grid/List View */
          <AnimatePresence>
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}>
              {filteredGoals.map((goal, index) => {
                const progressPercentage = getProgressPercentage(goal);
                const daysToDeadline = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <motion.div
                    key={goal.id}
                    className={`bg-white rounded-xl border-2 p-6 ${getPriorityColor(goal.priority)} cursor-pointer hover:shadow-lg transition-all`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(goal.status)}
                          <h3 className="text-lg font-semibold text-slate-800">{goal.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            goal.priority === 'high' ? 'bg-red-100 text-red-600' :
                            goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {goal.priority} priority
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{goal.description}</p>
                        <div className="text-xs text-slate-500">
                          Target: {new Date(goal.targetDate).toLocaleDateString()} 
                          {daysToDeadline >= 0 ? ` (${daysToDeadline} days left)` : ' (Overdue)'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold mb-1 ${getProgressColor(progressPercentage)}`}>
                          {progressPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatProgress(goal)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            progressPercentage >= 90 ? 'bg-green-500' :
                            progressPercentage >= 70 ? 'bg-blue-500' :
                            progressPercentage >= 50 ? 'bg-yellow-500' :
                            progressPercentage >= 30 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Milestones Preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {goal.milestones.filter(m => m.completed).length} / {goal.milestones.length} milestones
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {goal.category}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions (visible on hover) */}
                    <div className="mt-4 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateGoalProgress(goal.id, goal.currentAmount + (availableToReinvest || 1000));
                          }}
                          className="px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors text-xs"
                        >
                          Add Progress
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGoal(goal.id);
                          }}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        {filteredGoals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Goals Found</h3>
            <p className="text-slate-500 mb-4">
              {filter === 'all' ? 'Create your first SMART goal to get started' : `No ${filter} goals at the moment`}
            </p>
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create New Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};