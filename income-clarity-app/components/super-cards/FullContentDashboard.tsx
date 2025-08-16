'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutGrid,
  TrendingUp,
  DollarSign,
  Calculator,
  PieChart,
  Target,
  ChevronUp
} from 'lucide-react'

// Import all Super Card Hubs directly
const PerformanceHub = lazy(() => import('./PerformanceHub').then(m => ({ default: m.PerformanceHub })))
const IncomeIntelligenceHub = lazy(() => import('./IncomeIntelligenceHub').then(m => ({ default: m.IncomeIntelligenceHub })))
const TaxStrategyHub = lazy(() => import('./TaxStrategyHub').then(m => ({ default: m.TaxStrategyHub })))
const PortfolioStrategyHub = lazy(() => import('./PortfolioStrategyHub').then(m => ({ default: m.PortfolioStrategyHub })))
const FinancialPlanningHub = lazy(() => import('./FinancialPlanningHub').then(m => ({ default: m.FinancialPlanningHub })))

import { useSuperCardStore } from '@/store/superCardStore'
import { logger } from '@/lib/logger'

// Loading component for each hub
const HubLoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-slate-200 rounded-lg mb-4 w-1/3"></div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="h-32 bg-slate-200 rounded-lg"></div>
      <div className="h-32 bg-slate-200 rounded-lg"></div>
    </div>
    <div className="h-64 bg-slate-200 rounded-lg mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
    </div>
  </div>
)

// Hub configuration with full content display
const SUPER_HUBS = [
  {
    id: 'performance',
    title: 'Performance Hub',
    subtitle: 'SPY Comparison & Portfolio Analysis',
    icon: TrendingUp,
    component: PerformanceHub,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 'income',
    title: 'Income Intelligence',
    subtitle: 'Income Clarity & Future Projections',
    icon: DollarSign,
    component: IncomeIntelligenceHub,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100'
  },
  {
    id: 'tax',
    title: 'Tax Strategy',
    subtitle: 'Tax Optimization & Planning',
    icon: Calculator,
    component: TaxStrategyHub,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100'
  },
  {
    id: 'portfolio',
    title: 'Portfolio Strategy',
    subtitle: 'Rebalancing & Health Metrics',
    icon: PieChart,
    component: PortfolioStrategyHub,
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-50 to-orange-100'
  },
  {
    id: 'planning',
    title: 'Financial Planning',
    subtitle: 'FIRE Progress & Milestones',
    icon: Target,
    component: FinancialPlanningHub,
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bgGradient: 'from-indigo-50 to-indigo-100'
  }
]

interface FullContentDashboardProps {
  className?: string
}

export function FullContentDashboard({ className = '' }: FullContentDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { initialize, isLoading: storeLoading } = useSuperCardStore()

  useEffect(() => {
    logger.info('FullContentDashboard: Initializing all super cards data')
    
    const initializeData = async () => {
      try {
        await initialize()
        setIsLoading(false)
      } catch (error) {
        logger.error('FullContentDashboard: Failed to initialize', error)
        setIsLoading(false)
      }
    }

    initializeData()
  }, [initialize])

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToHub = (hubId: string) => {
    const element = document.getElementById(`hub-${hubId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (isLoading || storeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl">
              <LayoutGrid className="h-12 w-12 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-2">Loading Complete Dashboard</h2>
          <p className="text-slate-600">Preparing all financial intelligence hubs...</p>
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
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${className}`}>
      {/* Fixed Header with Navigation */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  Full Content Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                  All 5 Intelligence Hubs • Complete View
                </p>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {SUPER_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  onClick={() => scrollToHub(hub.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 bg-gradient-to-r ${hub.gradient} text-white shadow-md hover:shadow-lg`}
                  aria-label={`Navigate to ${hub.title}`}
                >
                  <hub.icon className="h-4 w-4 inline mr-1" />
                  {hub.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className="lg:hidden">
              <select
                onChange={(e) => scrollToHub(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Navigate to hub"
              >
                <option value="">Jump to Hub...</option>
                {SUPER_HUBS.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - All Hubs in Full View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {SUPER_HUBS.map((hub, index) => {
            const HubComponent = hub.component
            
            return (
              <motion.section
                key={hub.id}
                id={`hub-${hub.id}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.6, 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 80,
                    damping: 20
                  }
                }}
                className="scroll-mt-24"
              >
                {/* Hub Section Header */}
                <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-r ${hub.gradient} text-white shadow-xl`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                        <hub.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">{hub.title}</h2>
                        <p className="text-lg opacity-90 mt-1">{hub.subtitle}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                        Hub {index + 1} of 5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hub Full Content */}
                <div className={`rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden`}>
                  <div className={`p-1 bg-gradient-to-r ${hub.bgGradient}`}>
                    <div className="bg-white rounded-xl p-6">
                      <Suspense fallback={<HubLoadingSkeleton />}>
                        <div className="min-h-[600px]">
                          <HubComponent />
                        </div>
                      </Suspense>
                    </div>
                  </div>
                </div>

                {/* Hub Divider (except for last hub) */}
                {index < SUPER_HUBS.length - 1 && (
                  <div className="flex items-center justify-center mt-12">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent w-full"></div>
                  </div>
                )}
              </motion.section>
            )
          })}
        </div>

        {/* Footer Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="mt-16 mb-8 text-center"
        >
          <div className="inline-flex items-center space-x-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 shadow-xl">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-slate-800 font-semibold text-lg">
                Complete Dashboard Active
              </span>
            </div>
            
            <div className="h-6 w-px bg-slate-400"></div>
            
            <div className="text-slate-600">
              All 5 Financial Intelligence Hubs • Real-time Data • Full Content View
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all z-40"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  )
}

export default FullContentDashboard