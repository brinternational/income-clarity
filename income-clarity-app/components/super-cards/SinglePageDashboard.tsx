'use client'

import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutGrid,
  TrendingUp,
  DollarSign,
  Calculator,
  PieChart,
  Target,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from 'lucide-react'

// Lazy load Super Cards for better performance
const PerformanceHub = lazy(() => import('./PerformanceHub').then(m => ({ default: m.PerformanceHub })))
const IncomeIntelligenceHub = lazy(() => import('./IncomeIntelligenceHub').then(m => ({ default: m.IncomeIntelligenceHub })))
const TaxStrategyHub = lazy(() => import('./TaxStrategyHub').then(m => ({ default: m.TaxStrategyHub })))
const PortfolioStrategyHub = lazy(() => import('./PortfolioStrategyHub').then(m => ({ default: m.PortfolioStrategyHub })))
const FinancialPlanningHub = lazy(() => import('./FinancialPlanningHub').then(m => ({ default: m.FinancialPlanningHub })))

import { useSuperCardStore } from '@/store/superCardStore'
import { logger } from '@/lib/logger'

// Loading skeleton component for better UX
const CardLoadingSkeleton = memo(() => (
  <div className="h-full min-h-[500px] animate-pulse">
    <div className="space-y-4">
      <div className="h-8 bg-slate-200 rounded-lg"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-slate-200 rounded-lg"></div>
        <div className="h-24 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="h-48 bg-slate-200 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
))

// Super Card configuration
const SUPER_CARDS = [
  {
    id: 'performance',
    title: 'Performance Hub',
    description: 'SPY comparison & portfolio analysis',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    component: PerformanceHub,
    primaryColor: 'blue'
  },
  {
    id: 'income',
    title: 'Income Intelligence',
    description: 'Income clarity & projections',
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100',
    component: IncomeIntelligenceHub,
    primaryColor: 'green'
  },
  {
    id: 'tax',
    title: 'Tax Strategy',
    description: 'Tax optimization & planning',
    icon: Calculator,
    color: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    component: TaxStrategyHub,
    primaryColor: 'purple'
  },
  {
    id: 'portfolio',
    title: 'Portfolio Strategy',
    description: 'Rebalancing & health metrics',
    icon: PieChart,
    color: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
    component: PortfolioStrategyHub,
    primaryColor: 'orange'
  },
  {
    id: 'planning',
    title: 'Financial Planning',
    description: 'FIRE progress & milestones',
    icon: Target,
    color: 'from-indigo-500 to-indigo-600',
    bgGradient: 'from-indigo-50 to-indigo-100',
    component: FinancialPlanningHub,
    primaryColor: 'indigo'
  }
]

interface CardState {
  id: string
  isExpanded: boolean
  isMinimized: boolean
  isHidden: boolean
}

interface SinglePageDashboardProps {
  className?: string
}

export function SinglePageDashboard({ className = '' }: SinglePageDashboardProps) {
  // State for managing individual card visibility and sizing
  const [cardStates, setCardStates] = useState<CardState[]>(
    SUPER_CARDS.map(card => ({
      id: card.id,
      isExpanded: false,
      isMinimized: false,
      isHidden: false
    }))
  )

  // Layout mode: 'equal' (all cards same size) or 'adaptive' (cards can expand/contract)
  const [layoutMode, setLayoutMode] = useState<'equal' | 'adaptive'>('equal')
  
  // Mobile/responsive state
  const [isMobile, setIsMobile] = useState(false)
  
  // Loading state for performance
  const [isLoading, setIsLoading] = useState(true)

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Simulate loading completion
    const timer = setTimeout(() => setIsLoading(false), 1000)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timer)
    }
  }, [])

  // Card state management functions
  const toggleCardExpanded = useCallback((cardId: string) => {
    setCardStates(prev => 
      prev.map(state => {
        if (state.id === cardId) {
          return { ...state, isExpanded: !state.isExpanded, isMinimized: false }
        }
        // In adaptive mode, minimize other cards when one expands
        if (layoutMode === 'adaptive' && !state.isExpanded) {
          return { ...state, isMinimized: !prev.find(s => s.id === cardId)?.isExpanded }
        }
        return state
      })
    )
  }, [layoutMode])

  const toggleCardMinimized = useCallback((cardId: string) => {
    setCardStates(prev => 
      prev.map(state => 
        state.id === cardId 
          ? { ...state, isMinimized: !state.isMinimized, isExpanded: false }
          : state
      )
    )
  }, [])

  const toggleCardHidden = useCallback((cardId: string) => {
    setCardStates(prev => 
      prev.map(state => 
        state.id === cardId 
          ? { ...state, isHidden: !state.isHidden, isExpanded: false, isMinimized: false }
          : state
      )
    )
  }, [])

  const resetAllCards = useCallback(() => {
    setCardStates(prev => 
      prev.map(state => ({
        ...state,
        isExpanded: false,
        isMinimized: false,
        isHidden: false
      }))
    )
  }, [])

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keys when not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case 'r':
        case 'R':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            resetAllCards()
          }
          break
        case 'l':
        case 'L':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setLayoutMode(prev => prev === 'equal' ? 'adaptive' : 'equal')
          }
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            const cardIndex = parseInt(event.key) - 1
            const cardId = SUPER_CARDS[cardIndex]?.id
            if (cardId) {
              toggleCardMinimized(cardId)
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetAllCards, toggleCardMinimized])

  // Calculate grid layout based on visible cards and their states
  const visibleCards = useMemo(() => {
    return cardStates.filter(state => !state.isHidden)
  }, [cardStates])

  const getGridColumns = useMemo(() => {
    if (isMobile) return 'grid-cols-1'
    
    const visibleCount = visibleCards.length
    if (visibleCount <= 2) return 'grid-cols-1 lg:grid-cols-2'
    if (visibleCount <= 3) return 'grid-cols-1 lg:grid-cols-3'
    if (visibleCount <= 4) return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4'
    return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-5'
  }, [isMobile, visibleCards.length])

  const getCardSize = useCallback((cardState: CardState) => {
    if (cardState.isHidden) return 'hidden'
    if (cardState.isMinimized) return 'h-32'
    if (cardState.isExpanded && layoutMode === 'adaptive') return 'h-[800px]'
    return 'h-[600px]' // Standard height
  }, [layoutMode])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl">
              <LayoutGrid className="h-12 w-12 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-2">Loading Super Cards</h2>
          <p className="text-slate-600">Preparing your complete financial dashboard...</p>
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: 5 }, (_, i) => (
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
      aria-label="Complete financial dashboard with all 5 Super Cards"
    >
      {/* Header with controls */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur-md opacity-50"></div>
                <div className="relative p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                  <LayoutGrid className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Complete Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                  All 5 Super Cards • Real-time Data
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Layout mode toggle */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-100">
                <span className="text-sm font-medium text-slate-700" id="layout-mode-label">Layout:</span>
                <button
                  onClick={() => setLayoutMode(layoutMode === 'equal' ? 'adaptive' : 'equal')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    layoutMode === 'equal' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  aria-labelledby="layout-mode-label"
                  aria-pressed={layoutMode === 'equal'}
                  aria-describedby="layout-mode-description"
                >
                  {layoutMode === 'equal' ? 'Equal' : 'Adaptive'}
                </button>
                <span id="layout-mode-description" className="sr-only">
                  {layoutMode === 'equal' 
                    ? 'All cards have equal size. Click to switch to adaptive mode.' 
                    : 'Cards can expand and contract. Click to switch to equal mode.'
                  }
                </span>
              </div>

              {/* Reset button */}
              <button
                onClick={resetAllCards}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Reset all cards to default state"
              >
                Reset All
              </button>

              {/* Keyboard shortcuts help */}
              <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-xs text-blue-700 font-mono">
                  Ctrl+L: Layout • Ctrl+R: Reset • Ctrl+1-5: Toggle cards
                </span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></div>
                <span className="text-sm font-medium text-green-700">
                  {visibleCards.length}/5 Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cards grid */}
        <div className={`grid gap-6 ${getGridColumns}`}>
          {SUPER_CARDS.map((card, index) => {
            const cardState = cardStates.find(state => state.id === card.id)!
            const CardComponent = card.component

            if (cardState.isHidden) return null

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
                layout
                className={`relative ${getCardSize(cardState)} transition-all duration-300`}
              >
                {/* Card container */}
                <div className="h-full rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl overflow-hidden">
                  {/* Card header */}
                  <div className={`px-4 py-3 bg-gradient-to-r ${card.color} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <card.icon className="h-5 w-5" />
                        <div>
                          <h3 className="font-bold text-sm">{card.title}</h3>
                          {!cardState.isMinimized && (
                            <p className="text-xs opacity-90">{card.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Card controls */}
                      <div className="flex items-center space-x-1">
                        {layoutMode === 'adaptive' && (
                          <button
                            onClick={() => toggleCardExpanded(card.id)}
                            className="p-1 rounded hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label={`${cardState.isExpanded ? 'Shrink' : 'Expand'} ${card.title} card`}
                            aria-pressed={cardState.isExpanded}
                          >
                            {cardState.isExpanded ? (
                              <Minimize2 className="h-4 w-4" />
                            ) : (
                              <Maximize2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => toggleCardMinimized(card.id)}
                          className="p-1 rounded hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={`${cardState.isMinimized ? 'Restore' : 'Minimize'} ${card.title} card`}
                          aria-pressed={cardState.isMinimized}
                        >
                          {cardState.isMinimized ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="h-full p-4 overflow-auto">
                    <AnimatePresence mode="wait">
                      {!cardState.isMinimized && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="h-full"
                        >
                          <div className="h-full min-h-[500px]">
                            <Suspense fallback={<CardLoadingSkeleton />}>
                              <CardComponent />
                            </Suspense>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Loading overlay for individual cards */}
                {cardState.isMinimized && (
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-center">
                    <div className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 font-medium">
                      Minimized • Click to restore
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Footer summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center space-x-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-slate-800 font-semibold">
                Dashboard Active
              </span>
            </div>
            
            <div className="h-4 w-px bg-slate-400"></div>
            
            <div className="flex space-x-2 text-sm text-slate-600">
              <span>{visibleCards.length} cards visible</span>
              <span>•</span>
              <span>Real-time updates</span>
              <span>•</span>
              <span>Fully responsive</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}