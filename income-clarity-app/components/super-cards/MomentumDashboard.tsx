'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp,
  DollarSign,
  Calculator,
  Target,
  ArrowRight,
  BarChart3,
  Percent,
  TrendingDown,
  Eye
} from 'lucide-react'

// Design System components
import { Button } from '@/components/design-system/core/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'

// Hooks for data
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useSuperCardStore } from '@/store/superCardStore'
import { logger } from '@/lib/logger'

// Momentum Card configuration - 4 essential cards for 80% of users
const MOMENTUM_CARDS = [
  {
    id: 'performance',
    title: 'Performance',
    description: 'Portfolio vs SPY',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    heroViewUrl: '/dashboard/super-cards?level=hero-view&hub=performance'
  },
  {
    id: 'income',
    title: 'Income Intelligence',
    description: 'Monthly income flow',
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100',
    heroViewUrl: '/dashboard/super-cards?level=hero-view&hub=income-tax'
  },
  {
    id: 'tax',
    title: 'Tax Strategy',
    description: 'Optimization opportunities',
    icon: Calculator,
    color: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    heroViewUrl: '/dashboard/super-cards?level=hero-view&hub=tax-strategy'
  },
  {
    id: 'planning',
    title: 'FIRE Progress',
    description: 'Financial independence',
    icon: Target,
    color: 'from-indigo-500 to-indigo-600',
    bgGradient: 'from-indigo-50 to-indigo-100',
    heroViewUrl: '/dashboard/super-cards?level=hero-view&hub=financial-planning'
  }
]

interface MomentumMetrics {
  performance: {
    totalReturn: number
    vs_spy: number
    trend: 'up' | 'down'
  }
  income: {
    monthlyIncome: number
    dividendYield: number
    annualProjection: number
  }
  tax: {
    currentRate: number
    potentialSavings: number
    optimization: string
  }
  planning: {
    fireProgress: number
    nextMilestone: string
    monthsToMilestone: number
  }
}

interface MomentumDashboardProps {
  className?: string
}

export function MomentumDashboard({ className = '' }: MomentumDashboardProps) {
  const router = useRouter()
  const { holdings, portfolioStats } = usePortfolio()
  const { userProfile } = useUserProfile()
  const { isLoading, error } = useSuperCardStore()
  
  const [metrics, setMetrics] = useState<MomentumMetrics | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)

  // Calculate momentum metrics optimized for quick loading
  const calculateMomentumMetrics = useCallback(async (): Promise<MomentumMetrics> => {
    // Fast calculations for Level 1 - no complex computations
    const totalValue = portfolioStats?.totalValue || 0
    const totalCost = portfolioStats?.totalCost || 0
    const totalReturn = totalValue > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    
    // Quick dividend calculation
    const monthlyDividends = holdings?.reduce((sum, holding) => {
      return sum + (holding.shares * (holding.dividendYield || 0) * holding.currentPrice / 12)
    }, 0) || 0
    
    return {
      performance: {
        totalReturn: Number(totalReturn.toFixed(2)),
        vs_spy: Number((totalReturn - 12.5).toFixed(2)), // SPY approximate annual return
        trend: totalReturn >= 0 ? 'up' : 'down'
      },
      income: {
        monthlyIncome: Number(monthlyDividends.toFixed(0)),
        dividendYield: portfolioStats?.dividendYield || 0,
        annualProjection: Number((monthlyDividends * 12).toFixed(0))
      },
      tax: {
        currentRate: userProfile?.taxRate || 22, // Default tax bracket
        potentialSavings: Number((monthlyDividends * 12 * 0.15).toFixed(0)), // Estimated tax savings
        optimization: 'Tax-loss harvesting available'
      },
      planning: {
        fireProgress: Math.min((totalValue / 1000000) * 100, 100), // Progress to $1M
        nextMilestone: totalValue < 100000 ? '$100K' : totalValue < 250000 ? '$250K' : totalValue < 500000 ? '$500K' : '$1M',
        monthsToMilestone: Math.ceil((100000 - totalValue) / (monthlyDividends + 2000)) // Assuming $2K monthly investment
      }
    }
  }, [holdings, portfolioStats, userProfile])

  // Load metrics on mount
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoadingMetrics(true)
        const calculatedMetrics = await calculateMomentumMetrics()
        setMetrics(calculatedMetrics)
        logger.log('✅ Momentum Dashboard: Metrics loaded successfully')
      } catch (error) {
        logger.error('❌ Momentum Dashboard: Error loading metrics', error)
      } finally {
        setIsLoadingMetrics(false)
      }
    }

    loadMetrics()
  }, [calculateMomentumMetrics])

  // Navigation handlers
  const handleCardClick = useCallback((cardId: string) => {
    const card = MOMENTUM_CARDS.find(c => c.id === cardId)
    if (card) {
      router.push(card.heroViewUrl)
    }
  }, [router])

  const handleViewDetailed = useCallback(() => {
    router.push('/dashboard/super-cards?level=detailed')
  }, [router])

  // Loading state
  if (isLoadingMetrics || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl">
              <BarChart3 className="h-12 w-12 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mt-6 mb-2">Loading Momentum Dashboard</h2>
          <p className="text-muted-foreground">Calculating key metrics...</p>
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div 
                key={i} 
                className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" 
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${className}`}
      role="main"
      aria-label="Momentum Dashboard - Quick Financial Overview"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur-md opacity-50"></div>
                <div className="relative p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Momentum Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Quick insights • 4 key metrics • Optimized for speed
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleViewDetailed}
                variant="outline"
                size="md"
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Detailed View</span>
              </Button>
              
              <Badge variant="primary" size="md">
                Level 1 • 80% Users
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {MOMENTUM_CARDS.map((card, index) => {
            const cardMetrics = metrics[card.id as keyof MomentumMetrics]
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    duration: 0.4, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }
                }}
                className="group"
              >
                <Card
                  variant="interactive"
                  size="lg"
                  radius="xl"
                  clickable
                  hover
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    relative overflow-hidden bg-white/90 backdrop-blur-xl
                    border border-white/20 shadow-xl
                    hover:shadow-2xl hover:-translate-y-1
                    transition-all duration-300 ease-out
                    min-h-[280px] cursor-pointer
                    before:absolute before:-inset-1 before:bg-gradient-to-r before:${card.color} before:rounded-3xl before:blur-xl before:opacity-0 hover:before:opacity-20 before:transition-all before:duration-300
                  `}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-r ${card.color} rounded-xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
                          <div className={`relative p-3 rounded-xl bg-gradient-to-r ${card.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <card.icon className="h-5 w-5" />
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-foreground/90 transition-colors duration-300">
                            {card.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {card.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Performance Card Metrics */}
                    {card.id === 'performance' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Return</span>
                          <div className="flex items-center space-x-2">
                            {cardMetrics.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-lg font-bold ${cardMetrics.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {cardMetrics.totalReturn > 0 ? '+' : ''}{cardMetrics.totalReturn}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">vs SPY</span>
                          <span className={`text-sm font-medium ${cardMetrics.vs_spy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {cardMetrics.vs_spy > 0 ? '+' : ''}{cardMetrics.vs_spy}%
                          </span>
                        </div>
                      </>
                    )}

                    {/* Income Card Metrics */}
                    {card.id === 'income' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Monthly Income</span>
                          <span className="text-lg font-bold text-green-600">
                            ${cardMetrics.monthlyIncome.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Annual Projection</span>
                          <span className="text-sm font-medium text-foreground/90">
                            ${cardMetrics.annualProjection.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Tax Card Metrics */}
                    {card.id === 'tax' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current Rate</span>
                          <div className="flex items-center space-x-1">
                            <Percent className="h-4 w-4 text-purple-500" />
                            <span className="text-lg font-bold text-purple-600">
                              {cardMetrics.currentRate}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Potential Savings</span>
                          <span className="text-sm font-medium text-green-600">
                            ${cardMetrics.potentialSavings.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Planning Card Metrics */}
                    {card.id === 'planning' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">FIRE Progress</span>
                          <span className="text-lg font-bold text-indigo-600">
                            {cardMetrics.fireProgress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Next Milestone</span>
                          <Badge variant="secondary" size="sm">
                            {cardMetrics.nextMilestone}
                          </Badge>
                        </div>
                      </>
                    )}

                    {/* Action hint */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-muted-foreground group-hover:text-muted-foreground transition-colors">
                        Click for detailed analysis →
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Summary section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-lg backdrop-blur-sm">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping"></div>
            </div>
            <span className="text-blue-800 font-semibold">
              Momentum Dashboard Active • Optimized for 80% of users
            </span>
            <Button
              onClick={handleViewDetailed}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              View All Details
            </Button>
          </div>
        </motion.div>

        {/* Performance note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Fast-loading overview • Click any card for detailed analysis • 
            <Button
              onClick={handleViewDetailed}
              variant="link"
              size="sm"
              className="ml-1 p-0 h-auto text-sm"
            >
              Switch to full dashboard
            </Button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}