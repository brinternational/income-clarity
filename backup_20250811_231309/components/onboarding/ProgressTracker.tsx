'use client'

/**
 * Progress Tracker and Gamification System
 * Implements ONBOARD-005: Progress Tracking and Gamification
 * 
 * Achievements system with motivational messages and progress visualization
 */

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Shield, 
  Zap,
  Gift,
  Crown,
  Flame,
  Heart,
  Award,
  CheckCircle,
  Lock,
  Sparkles
} from 'lucide-react'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'portfolio' | 'income' | 'coverage' | 'performance' | 'optimization' | 'social'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  shareText?: string
  requirements?: string[]
}

export interface ProgressStats {
  totalPoints: number
  achievementsUnlocked: number
  currentStreak: number
  longestStreak: number
  level: number
  nextLevelPoints: number
  completionPercentage: number
}

interface ProgressTrackerProps {
  userId: string
  portfolioValue?: number
  monthlyIncome?: number
  monthlyExpenses?: number
  performanceVsSpy?: number
  className?: string
}

export default function ProgressTracker({ 
  userId, 
  portfolioValue = 0, 
  monthlyIncome = 0, 
  monthlyExpenses = 0,
  performanceVsSpy = 0,
  className = ''
}: ProgressTrackerProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState<ProgressStats>({
    totalPoints: 0,
    achievementsUnlocked: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    nextLevelPoints: 500,
    completionPercentage: 0
  })
  const [showNewAchievement, setShowNewAchievement] = useState<Achievement | null>(null)
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])

  // Initialize achievements on component mount
  useEffect(() => {
    initializeAchievements()
    loadProgressFromStorage()
  }, [userId])

  // Check for new achievements when metrics change
  useEffect(() => {
    checkForNewAchievements()
  }, [portfolioValue, monthlyIncome, monthlyExpenses, performanceVsSpy])

  const initializeAchievements = () => {
    const allAchievements: Achievement[] = [
      // Portfolio Milestones
      {
        id: 'first-holding',
        title: '🌱 First Steps',
        description: 'Added your first holding to Income Clarity',
        icon: '🌱',
        category: 'portfolio',
        rarity: 'common',
        points: 50,
        shareText: 'Just started my dividend investing journey with Income Clarity! 🌱'
      },
      {
        id: 'five-holdings',
        title: '📊 Diversified',
        description: 'Built a diversified portfolio with 5+ holdings',
        icon: '📊',
        category: 'portfolio',
        rarity: 'common',
        points: 100,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'ten-thousand',
        title: '💎 Five Figures',
        description: 'Portfolio reached $10,000',
        icon: '💎',
        category: 'portfolio',
        rarity: 'common',
        points: 200,
        shareText: 'Hit $10K in my dividend portfolio! Building toward financial freedom. 💎'
      },
      {
        id: 'fifty-thousand',
        title: '🚀 Serious Investor',
        description: 'Portfolio reached $50,000',
        icon: '🚀',
        category: 'portfolio',
        rarity: 'rare',
        points: 500,
        shareText: 'Reached $50K in dividend investments! The power of compound growth! 🚀'
      },
      {
        id: 'hundred-thousand',
        title: '👑 Six-Figure Club',
        description: 'Portfolio reached $100,000',
        icon: '👑',
        category: 'portfolio',
        rarity: 'epic',
        points: 1000,
        shareText: 'Joined the six-figure dividend portfolio club! 👑'
      },
      {
        id: 'million-dollar',
        title: '💰 Millionaire Status',
        description: 'Portfolio reached $1,000,000',
        icon: '💰',
        category: 'portfolio',
        rarity: 'legendary',
        points: 5000,
        shareText: '🎉 MILLIONAIRE STATUS ACHIEVED! 💰 Living proof that dividend investing works!'
      },

      // Income Achievements
      {
        id: 'first-dividend',
        title: '💵 First Dividend',
        description: 'Received your first dividend payment',
        icon: '💵',
        category: 'income',
        rarity: 'common',
        points: 50
      },
      {
        id: 'hundred-monthly',
        title: '📈 Income Builder',
        description: 'Monthly dividend income reached $100',
        icon: '📈',
        category: 'income',
        rarity: 'common',
        points: 150
      },
      {
        id: 'five-hundred-monthly',
        title: '💪 Income Momentum',
        description: 'Monthly dividend income reached $500',
        icon: '💪',
        category: 'income',
        rarity: 'rare',
        points: 300
      },
      {
        id: 'thousand-monthly',
        title: '🔥 Income Power',
        description: 'Monthly dividend income reached $1,000',
        icon: '🔥',
        category: 'income',
        rarity: 'epic',
        points: 750,
        shareText: 'Hit $1,000 in monthly dividend income! Financial independence is within reach! 🔥'
      },
      {
        id: 'five-thousand-monthly',
        title: '⚡ Income Master',
        description: 'Monthly dividend income reached $5,000',
        icon: '⚡',
        category: 'income',
        rarity: 'legendary',
        points: 2000,
        shareText: '⚡ $5,000 monthly dividend income achieved! Living the dividend lifestyle! ⚡'
      },

      // Coverage Achievements  
      {
        id: 'first-expense-covered',
        title: '🏠 First Expense Covered',
        description: 'Dividend income covers your first expense category',
        icon: '🏠',
        category: 'coverage',
        rarity: 'common',
        points: 100
      },
      {
        id: 'fifty-percent-coverage',
        title: '📊 Halfway There',
        description: 'Dividend income covers 50% of expenses',
        icon: '📊',
        category: 'coverage',
        rarity: 'rare',
        points: 400
      },
      {
        id: 'above-zero-line',
        title: '🎯 ABOVE THE ZERO LINE!',
        description: 'Monthly dividend income covers 100% of expenses',
        icon: '🎯',
        category: 'coverage',
        rarity: 'epic',
        points: 1500,
        shareText: '🎉 ABOVE THE ZERO LINE! My dividends now cover 100% of my expenses! Living the dream! 🎯'
      },
      {
        id: 'stress-free-living',
        title: '😌 Stress-Free Living',
        description: 'Reached your stress-free income target',
        icon: '😌',
        category: 'coverage',
        rarity: 'legendary',
        points: 3000,
        shareText: '😌 Achieved stress-free living through dividend income! Time to enjoy life! 😌'
      },

      // Performance Achievements
      {
        id: 'beat-spy',
        title: '🏆 Market Beater',
        description: 'Portfolio outperformed SPY for 1 month',
        icon: '🏆',
        category: 'performance',
        rarity: 'rare',
        points: 300
      },
      {
        id: 'consistent-outperformer',
        title: '🌟 Consistent Winner',
        description: 'Outperformed SPY for 3 months straight',
        icon: '🌟',
        category: 'performance',
        rarity: 'epic',
        points: 800,
        shareText: 'Been outperforming SPY for 3 months straight! 🌟 Dividend strategy is working!'
      },
      {
        id: 'dividend-champion',
        title: '👑 Dividend Champion',
        description: 'Outperformed SPY for 1 full year',
        icon: '👑',
        category: 'performance',
        rarity: 'legendary',
        points: 2500,
        shareText: '👑 One year of beating SPY with dividends! Proof that income investing works! 👑'
      },

      // Optimization Achievements
      {
        id: 'tax-optimized',
        title: '🧠 Tax Genius',
        description: 'Optimized portfolio for your tax situation',
        icon: '🧠',
        category: 'optimization',
        rarity: 'rare',
        points: 250
      },
      {
        id: 'location-advantage',
        title: '🏝️ Location Genius',
        description: 'Living in a tax-advantaged state for dividends',
        icon: '🏝️',
        category: 'optimization',
        rarity: 'rare',
        points: 400
      },
      {
        id: 'diversification-master',
        title: '⚖️ Diversification Master',
        description: 'Built a perfectly balanced dividend portfolio',
        icon: '⚖️',
        category: 'optimization',
        rarity: 'epic',
        points: 600
      },

      // Social Achievements
      {
        id: 'first-share',
        title: '📱 Share the Success',
        description: 'Shared your first achievement',
        icon: '📱',
        category: 'social',
        rarity: 'common',
        points: 75
      },
      {
        id: 'inspiration',
        title: '✨ Inspiration',
        description: 'Inspired others with your dividend journey',
        icon: '✨',
        category: 'social',
        rarity: 'rare',
        points: 300
      }
    ]

    setAchievements(allAchievements)
  }

  const loadProgressFromStorage = () => {
    const savedProgress = localStorage.getItem(`progress-${userId}`)
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setStats(progress)
    }
  }

  const saveProgressToStorage = (newStats: ProgressStats) => {
    localStorage.setItem(`progress-${userId}`, JSON.stringify(newStats))
  }

  const checkForNewAchievements = () => {
    const newlyUnlocked: Achievement[] = []

    achievements.forEach(achievement => {
      if (!achievement.unlockedAt && isAchievementUnlocked(achievement)) {
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date()
        }
        newlyUnlocked.push(unlockedAchievement)
      }
    })

    if (newlyUnlocked.length > 0) {
      // Update achievements with unlocked status
      setAchievements(prev => prev.map(achievement => {
        const unlocked = newlyUnlocked.find(u => u.id === achievement.id)
        return unlocked ? unlocked : achievement
      }))

      // Update stats
      const newPoints = newlyUnlocked.reduce((sum, a) => sum + a.points, 0)
      const newStats = {
        ...stats,
        totalPoints: stats.totalPoints + newPoints,
        achievementsUnlocked: stats.achievementsUnlocked + newlyUnlocked.length,
        level: calculateLevel(stats.totalPoints + newPoints),
        nextLevelPoints: getNextLevelPoints(calculateLevel(stats.totalPoints + newPoints)),
        completionPercentage: ((stats.achievementsUnlocked + newlyUnlocked.length) / achievements.length) * 100
      }
      setStats(newStats)
      saveProgressToStorage(newStats)

      // Show achievement popup for the first/most important one
      const mostImportant = newlyUnlocked.reduce((prev, current) => 
        current.points > prev.points ? current : prev
      )
      setShowNewAchievement(mostImportant)
      setRecentAchievements(prev => [...newlyUnlocked, ...prev].slice(0, 5))

      // Auto-hide achievement popup after 4 seconds
      setTimeout(() => setShowNewAchievement(null), 4000)
    }
  }

  const isAchievementUnlocked = (achievement: Achievement): boolean => {
    switch (achievement.id) {
      case 'first-holding':
        return portfolioValue > 0

      case 'ten-thousand':
        return portfolioValue >= 10000

      case 'fifty-thousand':
        return portfolioValue >= 50000

      case 'hundred-thousand':
        return portfolioValue >= 100000

      case 'million-dollar':
        return portfolioValue >= 1000000

      case 'hundred-monthly':
        return monthlyIncome >= 100

      case 'five-hundred-monthly':
        return monthlyIncome >= 500

      case 'thousand-monthly':
        return monthlyIncome >= 1000

      case 'five-thousand-monthly':
        return monthlyIncome >= 5000

      case 'fifty-percent-coverage':
        return monthlyExpenses > 0 && (monthlyIncome / monthlyExpenses) >= 0.5

      case 'above-zero-line':
        return monthlyExpenses > 0 && monthlyIncome >= monthlyExpenses

      case 'beat-spy':
        return performanceVsSpy > 0

      default:
        return false
    }
  }

  const calculateLevel = (points: number): number => {
    if (points < 500) return 1
    if (points < 1500) return 2  
    if (points < 3000) return 3
    if (points < 6000) return 4
    if (points < 10000) return 5
    return Math.floor(points / 2000) + 3
  }

  const getNextLevelPoints = (level: number): number => {
    const thresholds = [0, 500, 1500, 3000, 6000, 10000]
    if (level < thresholds.length) {
      return thresholds[level]
    }
    return (level - 3) * 2000
  }

  const getLevelTitle = (level: number): string => {
    const titles = [
      'Dividend Newcomer',
      'Income Explorer', 
      'Portfolio Builder',
      'Dividend Enthusiast',
      'Income Strategist',
      'Dividend Expert',
      'Income Master',
      'Dividend Legend'
    ]
    return titles[Math.min(level - 1, titles.length - 1)] || 'Dividend God'
  }

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'rare': return 'text-blue-600 bg-blue-100' 
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const shareAchievement = (achievement: Achievement) => {
    if (achievement.shareText && navigator.share) {
      navigator.share({
        title: `${achievement.title} - Income Clarity`,
        text: achievement.shareText,
        url: window.location.origin
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${achievement.shareText} - Track your progress at ${window.location.origin}`)
      })
    }
  }

  const getMotivationalMessage = (): string => {
    const coverageRatio = monthlyExpenses > 0 ? monthlyIncome / monthlyExpenses : 0
    
    if (coverageRatio >= 1) {
      return "🎉 You've achieved dividend lifestyle! You're living proof that it works!"
    } else if (coverageRatio >= 0.8) {
      return "⚡ So close to the zero line! You're almost there!"
    } else if (coverageRatio >= 0.5) {
      return "📈 Great progress! You're halfway to dividend independence!"
    } else if (portfolioValue >= 50000) {
      return "💎 Your portfolio is looking strong! Keep building that income!"
    } else if (portfolioValue >= 10000) {
      return "🚀 You're on your way! Every dollar invested gets you closer!"
    } else {
      return "🌱 Great start! The journey of a thousand miles begins with a single step!"
    }
  }

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)
  const lockedAchievements = achievements.filter(a => !a.unlockedAt)

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Achievement Popup */}
      {showNewAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-bounce-in">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{showNewAchievement.icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h3>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">{showNewAchievement.title}</h4>
            <p className="text-gray-600 mb-4">{showNewAchievement.description}</p>
            <div className="flex items-center justify-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRarityColor(showNewAchievement.rarity)}`}>
                {showNewAchievement.rarity.toUpperCase()}
              </span>
              <span className="text-yellow-600 font-bold">+{showNewAchievement.points} pts</span>
            </div>
            {showNewAchievement.shareText && (
              <button
                onClick={() => shareAchievement(showNewAchievement)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share Achievement
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          <p className="text-sm text-gray-600">Level {stats.level} • {getLevelTitle(stats.level)}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPoints.toLocaleString()}</div>
          <div className="text-sm text-gray-500">points</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress to Level {stats.level + 1}</span>
          <span className="text-sm text-gray-600">
            {stats.totalPoints}/{stats.nextLevelPoints}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stats.totalPoints / stats.nextLevelPoints) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">{stats.achievementsUnlocked}</div>
          <div className="text-xs text-green-700">Unlocked</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{Math.round(stats.completionPercentage)}%</div>
          <div className="text-xs text-blue-700">Complete</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-bold text-purple-600">{stats.currentStreak}</div>
          <div className="text-xs text-purple-700">Day Streak</div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-gray-700">{getMotivationalMessage()}</p>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Achievements</h4>
          <div className="space-y-2">
            {recentAchievements.slice(0, 3).map(achievement => (
              <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                <span className="text-lg">{achievement.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
                <span className="text-xs text-green-600 font-medium">+{achievement.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Achievements Preview */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Next Milestones</h4>
        <div className="space-y-2">
          {lockedAchievements.slice(0, 3).map(achievement => {
            const isClose = isAchievementClose(achievement)
            return (
              <div 
                key={achievement.id} 
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  isClose ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="relative">
                  <span className="text-lg opacity-50">{achievement.icon}</span>
                  <Lock className="w-3 h-3 text-gray-400 absolute -top-1 -right-1" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{achievement.title}</p>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${getRarityColor(achievement.rarity).split(' ')[0]}`}>
                    {achievement.points} pts
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Helper function to determine if achievement is close to being unlocked
function isAchievementClose(achievement: Achievement): boolean {
  // This would contain logic to determine proximity to achievement
  // For now, just return false
  return false
}