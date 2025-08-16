'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  LayoutGrid, 
  Maximize2, 
  Minimize2,
  Filter,
  Zap,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react'

import { FinancialPlanningHub } from './FinancialPlanningHub'
import { IncomeIntelligenceHub } from './IncomeIntelligenceHub' 
import { PerformanceHub } from './PerformanceHub'
import { PortfolioStrategyHub } from './PortfolioStrategyHub'
import { TaxStrategyHub } from './TaxStrategyHub'
import { Card, CardContent } from '@/components/ui/card'

type ViewMode = 'grid' | 'carousel' | 'fullscreen' | 'compact'
type SuperCardType = 'planning' | 'income' | 'performance' | 'strategy' | 'tax'

interface SuperCardConfig {
  id: SuperCardType
  title: string
  icon: React.ElementType
  component: React.ComponentType<any>
  color: string
  description: string
  priority: number
}

const superCardsConfig: SuperCardConfig[] = [
  {
    id: 'performance',
    title: 'Performance Hub',
    icon: TrendingUp,
    component: PerformanceHub,
    color: 'from-emerald-500 to-green-600',
    description: 'Track portfolio performance vs SPY with intelligent insights',
    priority: 1
  },
  {
    id: 'income',
    title: 'Income Intelligence',
    icon: Activity,
    component: IncomeIntelligenceHub,
    color: 'from-blue-500 to-cyan-600',
    description: 'Monitor dividend income and above-zero tracking',
    priority: 2
  },
  {
    id: 'planning', 
    title: 'Financial Planning',
    icon: Zap,
    component: FinancialPlanningHub,
    color: 'from-purple-500 to-indigo-600',
    description: 'FIRE progress, goals, and milestone celebrations',
    priority: 3
  },
  {
    id: 'strategy',
    title: 'Portfolio Strategy',
    icon: LayoutGrid,
    component: PortfolioStrategyHub,
    color: 'from-orange-500 to-red-600',
    description: 'Advanced rebalancing and allocation strategies',
    priority: 4
  },
  {
    id: 'tax',
    title: 'Tax Strategy',
    icon: Settings,
    component: TaxStrategyHub,
    color: 'from-teal-500 to-emerald-600',
    description: 'Puerto Rico advantages and tax optimization',
    priority: 5
  }
]

interface EnhancedLayoutProps {
  initialViewMode?: ViewMode
  enableSwipeGestures?: boolean
  showMobileOptimization?: boolean
}

export function SuperCardsEnhancedLayout({
  initialViewMode = 'grid',
  enableSwipeGestures = true,
  showMobileOptimization = true
}: EnhancedLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [activeCard, setActiveCard] = useState<SuperCardType>('performance')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [enabledCards, setEnabledCards] = useState<Set<SuperCardType>>(
    new Set(superCardsConfig.map(card => card.id))
  )
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  
  // Scroll progress for header effects
  const { scrollYProgress } = useScroll()
  const headerOpacity = useSpring(scrollYProgress, { stiffness: 400, damping: 40 })
  
  // Container ref for swipe handling
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-optimize view mode for mobile
  useEffect(() => {
    if (isMobile && showMobileOptimization) {
      if (viewMode === 'grid') {
        setViewMode('carousel')
      }
    }
  }, [isMobile, showMobileOptimization, viewMode])

  // Touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeGestures) return
    
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeGestures || !touchStart) return
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = () => {
    if (!enableSwipeGestures || !touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > 50
    const isRightSwipe = distanceX < -50
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX)

    if (isVerticalSwipe) return // Ignore vertical swipes

    if (viewMode === 'carousel') {
      const enabledCardsArray = superCardsConfig.filter(card => enabledCards.has(card.id))
      const currentIndex = enabledCardsArray.findIndex(card => card.id === activeCard)
      
      if (isLeftSwipe && currentIndex < enabledCardsArray.length - 1) {
        setActiveCard(enabledCardsArray[currentIndex + 1].id)
      } else if (isRightSwipe && currentIndex > 0) {
        setActiveCard(enabledCardsArray[currentIndex - 1].id)
      }
    }
  }

  const enabledCardsConfig = useMemo(() => 
    superCardsConfig.filter(card => enabledCards.has(card.id))
      .sort((a, b) => a.priority - b.priority),
    [enabledCards]
  )

  const renderCard = (cardConfig: SuperCardConfig, index?: number) => {
    const CardComponent = cardConfig.component
    const isActive = cardConfig.id === activeCard
    
    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { delay: (index || 0) * 0.1 }
      },
      exit: { opacity: 0, y: -20 }
    }

    return (
      <motion.div
        key={cardConfig.id}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`
          ${viewMode === 'fullscreen' ? 'col-span-1' : ''}
          ${viewMode === 'compact' ? 'h-64' : ''}
          ${viewMode === 'carousel' && !isActive ? 'hidden md:block opacity-30 scale-95' : ''}
        `}
      >
        <Card className={`
          h-full transition-all duration-300 hover:shadow-xl
          ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}
          ${viewMode === 'compact' ? 'overflow-hidden' : ''}
        `}>
          <div className={`h-2 bg-gradient-to-r ${cardConfig.color}`} />
          
          <CardContent className={`p-4 ${viewMode === 'compact' ? 'p-3' : ''}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`
                p-2 rounded-lg bg-gradient-to-r ${cardConfig.color}
                flex items-center justify-center text-white
              `}>
                <cardConfig.icon size={isMobile ? 18 : 20} />
              </div>
              <div>
                <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {cardConfig.title}
                </h3>
                {viewMode !== 'compact' && (
                  <p className="text-xs text-gray-600 mt-1">
                    {cardConfig.description}
                  </p>
                )}
              </div>
            </div>

            <div className={viewMode === 'compact' ? 'h-32 overflow-hidden' : ''}>
              <CardComponent 
                compact={viewMode === 'compact'}
                mobile={isMobile}
                active={isActive}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderGrid = () => (
    <motion.div 
      className={`
        grid gap-6 
        ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}
        ${viewMode === 'compact' ? 'gap-4' : ''}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="wait">
        {enabledCardsConfig.map((card, index) => renderCard(card, index))}
      </AnimatePresence>
    </motion.div>
  )

  const renderCarousel = () => {
    const activeCardConfig = enabledCardsConfig.find(card => card.id === activeCard)
    const currentIndex = enabledCardsConfig.findIndex(card => card.id === activeCard)
    
    return (
      <div className="space-y-4">
        {/* Carousel Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const prevIndex = Math.max(0, currentIndex - 1)
              setActiveCard(enabledCardsConfig[prevIndex].id)
            }}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {enabledCardsConfig.map((card, index) => (
              <button
                key={card.id}
                onClick={() => setActiveCard(card.id)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${index === currentIndex 
                    ? 'bg-blue-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                  }
                `}
              />
            ))}
          </div>
          
          <button
            onClick={() => {
              const nextIndex = Math.min(enabledCardsConfig.length - 1, currentIndex + 1)
              setActiveCard(enabledCardsConfig[nextIndex].id)
            }}
            disabled={currentIndex === enabledCardsConfig.length - 1}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Active Card */}
        <AnimatePresence mode="wait">
          {activeCardConfig && renderCard(activeCardConfig)}
        </AnimatePresence>

        {/* Card Selector for Mobile */}
        {isMobile && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {enabledCardsConfig.map((card) => (
              <button
                key={card.id}
                onClick={() => setActiveCard(card.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap
                  transition-all duration-200 min-w-max
                  ${card.id === activeCard 
                    ? `bg-gradient-to-r ${card.color} text-white shadow-lg` 
                    : 'bg-gray-100 hover:bg-gray-200'
                  }
                `}
              >
                <card.icon size={16} />
                <span className="text-sm">{card.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Enhanced Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b"
        style={{ opacity: headerOpacity }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Super Cards
              </h1>
              <p className="text-sm text-gray-600">
                {enabledCardsConfig.length} cards • Enhanced Experience
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Selector */}
              <div className="hidden md:flex bg-gray-100 rounded-lg p-1">
                {[
                  { mode: 'grid' as ViewMode, icon: Grid3X3 },
                  { mode: 'carousel' as ViewMode, icon: LayoutGrid },
                  { mode: 'compact' as ViewMode, icon: Minimize2 },
                  { mode: 'fullscreen' as ViewMode, icon: Maximize2 }
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`
                      p-2 rounded transition-all duration-200
                      ${viewMode === mode 
                        ? 'bg-white shadow-sm text-blue-600' 
                        : 'hover:bg-gray-200'
                      }
                    `}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isFilterOpen 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                  }
                `}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="flex flex-wrap gap-2">
                  {superCardsConfig.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => {
                        const newEnabledCards = new Set(enabledCards)
                        if (enabledCards.has(card.id)) {
                          newEnabledCards.delete(card.id)
                        } else {
                          newEnabledCards.add(card.id)
                        }
                        setEnabledCards(newEnabledCards)
                      }}
                      className={`
                        flex items-center gap-2 px-3 py-1 rounded-full text-sm
                        transition-all duration-200
                        ${enabledCards.has(card.id)
                          ? `bg-gradient-to-r ${card.color} text-white`
                          : 'bg-gray-100 hover:bg-gray-200'
                        }
                      `}
                    >
                      <card.icon size={14} />
                      {card.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'grid' || viewMode === 'compact' || viewMode === 'fullscreen' 
          ? renderGrid() 
          : renderCarousel()
        }
      </main>

      {/* Mobile-Optimized Footer */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="text-center text-xs text-gray-600">
            Swipe to navigate • {enabledCardsConfig.length} active cards
          </div>
        </div>
      )}
    </div>
  )
}