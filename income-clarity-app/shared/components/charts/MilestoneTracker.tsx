'use client'

import React, { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { 
  Target, 
  Zap, 
  Shield, 
  ShoppingBag, 
  Home, 
  Car,
  Gamepad2,
  Trophy,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface Milestone {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  icon: React.ReactNode
  color: string
  category: 'essential' | 'comfort' | 'freedom'
  isCompleted: boolean
  completedDate?: string
  estimatedCompletion?: string
  priority: number
}

interface MilestoneTrackerProps {
  milestones?: Milestone[]
  monthlyDividendIncome?: number
  className?: string
}

const defaultMilestones: Milestone[] = [
  {
    id: 'utilities',
    name: 'Utilities Covered',
    description: 'Electric, gas, water, internet',
    targetAmount: 250,
    currentAmount: 320,
    icon: <Zap className="w-5 h-5" />,
    color: '#3b82f6',
    category: 'essential',
    isCompleted: true,
    completedDate: '2024-03-15',
    priority: 1
  },
  {
    id: 'insurance',
    name: 'Insurance Covered',
    description: 'Health, auto, home insurance',
    targetAmount: 400,
    currentAmount: 320,
    icon: <Shield className="w-5 h-5" />,
    color: '#10b981',
    category: 'essential',
    isCompleted: false,
    estimatedCompletion: '2025-02-10',
    priority: 2
  },
  {
    id: 'groceries',
    name: 'Groceries Covered',
    description: 'Monthly food and essentials',
    targetAmount: 600,
    currentAmount: 320,
    icon: <ShoppingBag className="w-5 h-5" />,
    color: '#f59e0b',
    category: 'essential',
    isCompleted: false,
    estimatedCompletion: '2025-08-15',
    priority: 3
  },
  {
    id: 'housing',
    name: 'Housing Covered',
    description: 'Rent/mortgage payment',
    targetAmount: 1800,
    currentAmount: 320,
    icon: <Home className="w-5 h-5" />,
    color: '#ef4444',
    category: 'essential',
    isCompleted: false,
    estimatedCompletion: '2027-05-20',
    priority: 4
  },
  {
    id: 'transportation',
    name: 'Transportation Covered',
    description: 'Car payment, gas, maintenance',
    targetAmount: 500,
    currentAmount: 320,
    icon: <Car className="w-5 h-5" />,
    color: '#8b5cf6',
    category: 'comfort',
    isCompleted: false,
    estimatedCompletion: '2025-11-30',
    priority: 5
  },
  {
    id: 'entertainment',
    name: 'Entertainment Covered',
    description: 'Dining, movies, subscriptions',
    targetAmount: 400,
    currentAmount: 320,
    icon: <Gamepad2 className="w-5 h-5" />,
    color: '#06b6d4',
    category: 'comfort',
    isCompleted: false,
    estimatedCompletion: '2025-02-25',
    priority: 6
  },
  {
    id: 'financial-independence',
    name: 'Full Financial Independence',
    description: 'All expenses covered by dividends',
    targetAmount: 4000,
    currentAmount: 320,
    icon: <Trophy className="w-5 h-5" />,
    color: '#fbbf24',
    category: 'freedom',
    isCompleted: false,
    estimatedCompletion: '2029-12-31',
    priority: 7
  }
]

export function MilestoneTracker({
  milestones,
  monthlyDividendIncome = 3200,
  className = ''
}: MilestoneTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [milestoneData, setMilestoneData] = useState(milestones || defaultMilestones)
  const [showAnimation, setShowAnimation] = useState(true)
  const controls = useAnimation()

  useEffect(() => {
    if (showAnimation) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          staggerChildren: 0.1
        }
      })
    }
  }, [controls, showAnimation])

  const categories = [
    { id: 'all', label: 'All Milestones', count: milestoneData.length },
    { id: 'essential', label: 'Essential', count: milestoneData.filter(m => m.category === 'essential').length },
    { id: 'comfort', label: 'Comfort', count: milestoneData.filter(m => m.category === 'comfort').length },
    { id: 'freedom', label: 'Freedom', count: milestoneData.filter(m => m.category === 'freedom').length }
  ]

  const filteredMilestones = selectedCategory === 'all' 
    ? milestoneData 
    : milestoneData.filter(m => m.category === selectedCategory)

  const completedMilestones = milestoneData.filter(m => m.isCompleted).length
  const totalValue = milestoneData.reduce((sum, m) => sum + (m.targetAmount || 0), 0)
  const currentValue = milestoneData.reduce((sum, m) => sum + Math.min(m.currentAmount || 0, m.targetAmount || 0), 0)
  
  // Safe calculation for overall progress to prevent NaN%
  const overallProgress = totalValue > 0 ? (currentValue / totalValue) * 100 : 0
  const safeOverallProgress = isNaN(overallProgress) || !isFinite(overallProgress) ? 0 : overallProgress

  const getProgressPercentage = (milestone: Milestone) => {
    // Handle edge cases to prevent NaN%
    if (!milestone || typeof milestone.currentAmount !== 'number' || typeof milestone.targetAmount !== 'number') {
      return 0
    }
    
    if (milestone.targetAmount <= 0) {
      return 0
    }
    
    const percentage = (milestone.currentAmount / milestone.targetAmount) * 100
    
    // Check for NaN and return 0 if invalid
    if (isNaN(percentage) || !isFinite(percentage)) {
      return 0
    }
    
    return Math.min(Math.max(percentage, 0), 100)
  }

  const getTimeToCompletion = (milestone: Milestone) => {
    if (milestone.isCompleted) return 'Completed'
    const remaining = milestone.targetAmount - milestone.currentAmount
    const monthsNeeded = Math.ceil(remaining / (monthlyDividendIncome * 0.1)) // Assuming 10% goes to new milestones
    return `~${monthsNeeded} months`
  }

  const getCelebrationAnimation = () => ({
    scale: [1, 1.05, 1],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 0.6,
      repeat: 2,
      repeatType: 'reverse' as const
    }
  })

  const MilestoneCard = ({ milestone, index }: { milestone: Milestone; index: number }) => {
    const progress = getProgressPercentage(milestone)
    const isNearCompletion = progress >= 80
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        transition={{ delay: index * 0.1 }}
        className={`
          relative p-6 rounded-xl border-2 transition-all duration-300
          ${milestone.isCompleted 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
            : isNearCompletion
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }
          hover:shadow-lg hover:scale-102 cursor-pointer
        `}
        whileHover={milestone.isCompleted ? getCelebrationAnimation() : { scale: 1.02 }}
        onClick={() => {
          if (milestone.isCompleted && showAnimation) {
            // Celebration animation
            controls.start(getCelebrationAnimation())
          }
        }}
      >
        {/* Milestone Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${milestone.isCompleted ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-700'}
              `}
              style={{ backgroundColor: milestone.isCompleted ? '#10b981' : undefined }}
            >
              {milestone.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <div style={{ color: milestone.color }}>
                  {milestone.icon}
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {milestone.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {milestone.description}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold" style={{ color: milestone.color }}>
              ${milestone.targetAmount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              target
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-medium" style={{ color: milestone.color }}>
              {progress.toFixed(0)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: milestone.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </div>

        {/* Milestone Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-500">Current Income</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              ${milestone.currentAmount}
            </div>
          </div>
          
          <div>
            <div className="text-gray-500 dark:text-gray-500">
              {milestone.isCompleted ? 'Completed' : 'Time to Goal'}
            </div>
            <div className={`font-semibold ${
              milestone.isCompleted ? 'text-green-600' : 'text-blue-600'
            }`}>
              {milestone.isCompleted 
                ? new Date(milestone.completedDate!).toLocaleDateString()
                : getTimeToCompletion(milestone)
              }
            </div>
          </div>
        </div>

        {/* Achievement Badge */}
        {milestone.isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2"
          >
            <Trophy className="w-4 h-4" />
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Milestone Progress
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your dividend income milestones
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              showAnimation
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {showAnimation ? 'Animation On' : 'Animation Off'}
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Overall Progress
          </h4>
          <span className="text-lg font-bold text-blue-600">
            {safeOverallProgress.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-4 overflow-hidden mb-2">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${safeOverallProgress}%` }}
            transition={{ duration: 1.5 }}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {completedMilestones}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              ${monthlyDividendIncome.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Monthly Income</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Target</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {filteredMilestones.map((milestone, index) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={index}
          />
        ))}
      </div>

      {/* Next Milestone Spotlight */}
      {(() => {
        const nextMilestone = milestoneData
          .filter(m => !m.isCompleted)
          .sort((a, b) => (a.targetAmount - a.currentAmount) - (b.targetAmount - b.currentAmount))[0]
        
        if (!nextMilestone) return null

        return (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Next Milestone: {nextMilestone.name}
                </h4>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  ${(nextMilestone.targetAmount - nextMilestone.currentAmount).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  remaining
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  ${monthlyDividendIncome.toLocaleString()} current income
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  {getTimeToCompletion(nextMilestone)} to completion
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  {getProgressPercentage(nextMilestone).toFixed(0)}% complete
                </span>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}