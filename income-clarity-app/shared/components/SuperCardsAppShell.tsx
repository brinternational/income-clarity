'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppShell } from './AppShell'
import { SuperCardsNavigation } from '@/components/navigation/SuperCardsNavigation'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { useSuperCardStore } from '@/store/superCardStore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  Maximize2, 
  Minimize2,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface SuperCardsAppShellProps {
  children: React.ReactNode
  selectedCard?: string | null
  onCardSelect?: (cardId: string | null) => void
  showBackButton?: boolean
  cardTitle?: string
  cardDescription?: string
}

// Super Card configuration for navigation
const SUPER_CARDS_CONFIG = [
  { 
    id: 'performance', 
    title: 'Performance Hub',
    shortTitle: 'Performance',
    route: '/dashboard/super-cards?card=performance',
    icon: '📊'
  },
  { 
    id: 'income', 
    title: 'Income Intelligence',
    shortTitle: 'Income',
    route: '/dashboard/super-cards?card=income',
    icon: '💰'
  },
  { 
    id: 'tax', 
    title: 'Tax Strategy',
    shortTitle: 'Tax',
    route: '/dashboard/super-cards?card=tax',
    icon: '🏦'
  },
  { 
    id: 'portfolio', 
    title: 'Portfolio Strategy',
    shortTitle: 'Portfolio',
    route: '/dashboard/super-cards?card=portfolio',
    icon: '📈'
  },
  { 
    id: 'planning', 
    title: 'Financial Planning',
    shortTitle: 'Planning',
    route: '/dashboard/super-cards?card=planning',
    icon: '🎯'
  }
]

export function SuperCardsAppShell({
  children,
  selectedCard,
  onCardSelect,
  showBackButton = false,
  cardTitle,
  cardDescription
}: SuperCardsAppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useMobileDetection()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Super Cards store integration
  const { 
    activeCard, 
    setActiveCard, 
    refreshCard,
    isLoading,
    lastUpdated 
  } = useSuperCardStore()

  // Swipe navigation for mobile
  const { swipeHandlers } = useSwipeNavigation({
    onSwipeLeft: () => navigateToNextCard(),
    onSwipeRight: () => navigateToPreviousCard(),
    enabled: isMobile && selectedCard !== null,
    threshold: 50
  })

  // Navigation helpers
  const navigateToNextCard = useCallback(() => {
    if (!selectedCard) return
    
    const currentIndex = SUPER_CARDS_CONFIG.findIndex(card => card.id === selectedCard)
    const nextIndex = (currentIndex + 1) % SUPER_CARDS_CONFIG.length
    const nextCard = SUPER_CARDS_CONFIG[nextIndex]
    
    onCardSelect?.(nextCard.id)
    router.push(nextCard.route)
  }, [selectedCard, onCardSelect, router])

  const navigateToPreviousCard = useCallback(() => {
    if (!selectedCard) return
    
    const currentIndex = SUPER_CARDS_CONFIG.findIndex(card => card.id === selectedCard)
    const prevIndex = currentIndex === 0 ? SUPER_CARDS_CONFIG.length - 1 : currentIndex - 1
    const prevCard = SUPER_CARDS_CONFIG[prevIndex]
    
    onCardSelect?.(prevCard.id)
    router.push(prevCard.route)
  }, [selectedCard, onCardSelect, router])

  const handleBackToGrid = useCallback(() => {
    onCardSelect?.(null)
    router.push('/dashboard/super-cards')
  }, [onCardSelect, router])

  const handleRefreshCard = useCallback(async () => {
    if (!selectedCard) return

    setIsRefreshing(true)
    try {
      await refreshCard(selectedCard)
      toast.success('Card refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh card')
      // logger.error('Refresh failed:', error)
    // } finally {
      setIsRefreshing(false)
    }
  }, [selectedCard, refreshCard])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen()
    }
  }, [isFullscreen])

  // Get current card info
  const currentCardConfig = selectedCard 
    ? SUPER_CARDS_CONFIG.find(card => card.id === selectedCard)
    : null

  // Custom header for Super Cards
  const renderSuperCardsHeader = () => {
    if (!selectedCard) return null

    return (
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Navigation */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBackToGrid}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Back to Super Cards grid"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              {/* Card navigation arrows (mobile) */}
              {isMobile && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={navigateToPreviousCard}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Previous Super Card"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={navigateToNextCard}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Next Super Card"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Center - Card Info */}
            <div className="flex items-center space-x-3 flex-1 justify-center">
              <div className="text-2xl" role="img" aria-hidden="true">
                {currentCardConfig?.icon}
              </div>
              <div className="text-center">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {cardTitle || currentCardConfig?.title}
                </h1>
                {cardDescription && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                    {cardDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Right side - Card-specific Actions Only */}
            <div className="flex items-center space-x-2">
              {/* Refresh Button */}
              <button
                onClick={handleRefreshCard}
                disabled={isRefreshing || isLoading}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh card data"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Grid View Button */}
              <button
                onClick={handleBackToGrid}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="View all Super Cards"
                title="All Cards"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>

              {/* Fullscreen Toggle (Desktop) */}
              {!isMobile && (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Last Updated Info */}
          {lastUpdated && (
            <div className="pb-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Use SuperCardsNavigation instead of AppShell
  if (selectedCard) {
    // When viewing a card, show SuperCardsNavigation
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <SuperCardsNavigation
          selectedCard={selectedCard}
          cardTitle={cardTitle || currentCardConfig?.title}
          onBack={handleBackToGrid}
          showBackButton={showBackButton}
        />
        <div className="flex-1 relative overflow-y-auto p-4">
          {children}
        </div>
        
        {/* Mobile Swipe Indicator */}
        {isMobile && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center space-x-2 bg-slate-900/80 dark:bg-slate-100/80 backdrop-blur-sm px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-white/60 dark:bg-slate-800/60 rounded-full"></div>
              <div className="text-xs text-white dark:text-slate-800 font-medium">
                Swipe to navigate
              </div>
              <div className="w-2 h-2 bg-white/60 dark:bg-slate-800/60 rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-slate-900/20 dark:bg-slate-100/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-900 dark:text-slate-100">Loading Super Card...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Grid view - with SuperCardsNavigation
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <SuperCardsNavigation
        selectedCard={null}
        cardTitle="Super Cards"
        showBackButton={false}
      />
      {children}
      
      {/* Loading Overlay for grid */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/20 dark:bg-slate-100/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-900 dark:text-slate-100">Loading Super Cards...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperCardsAppShell