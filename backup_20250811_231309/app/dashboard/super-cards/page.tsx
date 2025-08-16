'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { RequireAuth, AuthProvider, useAuthContext } from '@/contexts/AuthContext'
import { UserProfileProvider, useUserProfile } from '@/contexts/UserProfileContext'
import { PortfolioProvider, usePortfolio } from '@/contexts/PortfolioContext'
import { ExpenseProvider, useExpense } from '@/contexts/ExpenseContext'
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext'
import { DataPersistenceProvider } from '@/contexts/DataPersistenceContext'
import { SuperCardProvider } from '@/components/super-cards/SuperCardProvider'
import { useSuperCardStore } from '@/store/superCardStore'

// Import all 5 Super Cards - Desktop versions
import { PerformanceHub } from '@/components/super-cards/PerformanceHub'
import { IncomeIntelligenceHub } from '@/components/super-cards/IncomeIntelligenceHub'
import { TaxStrategyHub } from '@/components/super-cards/TaxStrategyHub'
import { PortfolioStrategyHub } from '@/components/super-cards/PortfolioStrategyHub'
import { FinancialPlanningHub } from '@/components/super-cards/FinancialPlanningHub'

// Import Mobile variants
import { MobileTaxStrategyHub } from '@/components/super-cards/MobileTaxStrategyHub'
import { MobilePortfolioStrategyHub } from '@/components/super-cards/MobilePortfolioStrategyHub'
import { MobileFinancialPlanningHub } from '@/components/super-cards/MobileFinancialPlanningHub'

// Import mobile detection and gesture hooks
import { useMobileDetection, useBreakpoint } from '@/hooks/useMobileDetection'
import { useMultiGesture } from '@/hooks/useGestureHandlers'
import { LocalModeUtils } from '@/lib/config/local-mode'

// App Shell integration
import { SuperCardsAppShell } from '@/components/SuperCardsAppShell'
import toast, { Toaster } from 'react-hot-toast'
import { 
  LayoutGrid,
  TrendingUp,
  DollarSign,
  Calculator,
  PieChart,
  Target,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

// Super Card configuration
const SUPER_CARDS = [
  {
    id: 'performance',
    title: 'Performance Hub',
    description: 'SPY comparison & portfolio analysis',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    component: PerformanceHub
  },
  {
    id: 'income',
    title: 'Income Intelligence',
    description: 'Income clarity & projections',
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100',
    component: IncomeIntelligenceHub
  },
  {
    id: 'tax',
    title: 'Tax Strategy',
    description: 'Tax optimization & planning',
    icon: Calculator,
    color: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    component: TaxStrategyHub
  },
  {
    id: 'portfolio',
    title: 'Portfolio Strategy',
    description: 'Rebalancing & health metrics',
    icon: PieChart,
    color: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
    component: PortfolioStrategyHub
  },
  {
    id: 'planning',
    title: 'Financial Planning',
    description: 'FIRE progress & milestones',
    icon: Target,
    color: 'from-indigo-500 to-indigo-600',
    bgGradient: 'from-indigo-50 to-indigo-100',
    component: FinancialPlanningHub
  }
]

function SuperCardsDashboard() {
  // console.log('🔍 DEBUG: SuperCardsDashboard - Now implementing ACTUAL cards with AppShell')

  // URL parameters for navigation integration
  const searchParams = useSearchParams()
  
  // Get card from URL on initial render
  const initialCard = searchParams.get('card')
  
  // State management - bypass loading entirely
  const [selectedCard, setSelectedCard] = useState<string | null>(
    initialCard && SUPER_CARDS.find(c => c.id === initialCard) ? initialCard : null
  )

  // Card selection handlers
  const handleCardClick = useCallback((cardId: string) => {
    // console.log('🔍 DEBUG: Card clicked:', cardId)
    // setSelectedCard(cardId)
  }, [])

  const handleCardSelect = useCallback((cardId: string | null) => {
    // console.log('🔍 DEBUG: Card selected via AppShell:', cardId)
    // setSelectedCard(cardId)
  }, [])

  const handleBack = useCallback(() => {
    // console.log('🔍 DEBUG: Returning to card grid')
    // setSelectedCard(null)
  }, [])

  // console.log('🔍 DEBUG: Rendering with selectedCard:', selectedCard)

  // Get current card configuration
  const currentCard = selectedCard ? SUPER_CARDS.find(c => c.id === selectedCard) : null

  // Individual card view
  if (selectedCard) {
    const card = SUPER_CARDS.find(c => c.id === selectedCard)
    if (!card) {
      return (
        <SuperCardsAppShell
          selectedCard={selectedCard}
          onCardSelect={handleCardSelect}
          showBackButton={true}
          cardTitle="Card Not Found"
        >
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600">Card not found</p>
              <button 
                onClick={handleBack}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Grid
              </button>
            </div>
          </div>
        </SuperCardsAppShell>
      )
    }

    const CardComponent = card.component

    return (
      <SuperCardsAppShell
        selectedCard={selectedCard}
        onCardSelect={handleCardSelect}
        showBackButton={true}
        cardTitle={card.title}
        cardDescription={card.description}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CardComponent />
        </div>
      </SuperCardsAppShell>
    )
  }

  // Main card grid view
  return (
    <SuperCardsAppShell
      selectedCard={selectedCard}
      onCardSelect={handleCardSelect}
      showBackButton={false}
    >
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYwZiI+PGNpcmNsZSBjeD0iMjIiIGN5PSIyMiIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center space-x-4 mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl">
                  <LayoutGrid className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Super Cards
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mt-2"></div>
              </div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed"
            >
              Your comprehensive financial intelligence dashboard with advanced analytics and insights
            </motion.p>
            
            {/* Floating elements for visual interest */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-20 right-16 w-16 h-16 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-cyan-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
          </div>
        </div>
        
        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 text-white fill-current">
            <path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 V120 H0 V60Z"></path>
          </svg>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100 -z-10"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {SUPER_CARDS.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="group cursor-pointer"
              onClick={() => handleCardClick(card.id)}
            >
              <div className="relative">
                {/* Card glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${card.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-all duration-500`}></div>
                
                {/* Main card */}
                <div className={`
                  relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl
                  border border-white/20 shadow-xl
                  hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1
                  transition-all duration-500 ease-out
                  p-8 min-h-[320px] flex flex-col
                `} style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%), linear-gradient(135deg, ${card.color.includes('blue') ? 'rgba(59,130,246,0.05)' : card.color.includes('green') ? 'rgba(16,185,129,0.05)' : card.color.includes('purple') ? 'rgba(139,92,246,0.05)' : card.color.includes('orange') ? 'rgba(249,115,22,0.05)' : 'rgba(99,102,241,0.05)'} 0%, transparent 100%)`
                }}>
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${card.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
                        <div className={`relative p-4 rounded-2xl bg-gradient-to-r ${card.color} text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                          <card.icon className="h-7 w-7" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors duration-300">
                          {card.title}
                        </h3>
                        <p className="text-slate-600 text-base font-medium">
                          {card.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Animated arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <div className="p-2 rounded-full bg-slate-100 group-hover:bg-slate-200">
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="flex-1 space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/50">
                      <div className="text-sm text-slate-700 font-medium mb-2">
                        Explore advanced analytics and insights
                      </div>
                      <div className="text-xs text-slate-500">
                        Real-time data • Interactive visualizations • Export capabilities
                      </div>
                    </div>
                    
                    {/* Status and features */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg" style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)' }}></div>
                        <span className="text-sm font-semibold text-green-700">Active</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-xs text-slate-500 ml-2">Premium</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce delay-100"></div>
                  <div className="absolute bottom-8 left-6 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce delay-300"></div>
                  <div className="absolute top-1/2 right-8 w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-bounce delay-500"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced success message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 shadow-lg backdrop-blur-sm">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping"></div>
            </div>
            <span className="text-green-800 font-semibold">All 5 Super Cards loaded successfully!</span>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </SuperCardsAppShell>
  )
}

export default function SuperCardsDashboardPage() {
  // console.log('🚀 SUPER CARDS: Running with auth providers enabled')

  return (
    <RequireAuth>
      <AuthProvider>
        <UserProfileProvider>
          <PortfolioProvider>
            <ExpenseProvider>
              <NotificationProvider>
                <DataPersistenceProvider>
                  <SuperCardProvider>
                    <SuperCardsDashboard />
                  </SuperCardProvider>
                </DataPersistenceProvider>
              </NotificationProvider>
            </ExpenseProvider>
          </PortfolioProvider>
        </UserProfileProvider>
      </AuthProvider>
    </RequireAuth>
  )
}