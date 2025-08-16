'use client'

import { useRouter, usePathname } from 'next/navigation'
import { BarChart3, DollarSign, Heart, Brain, Zap } from 'lucide-react'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { haptic } from '@/utils/hapticFeedback'
import { shortcutManager, liveRegionManager } from '@/utils/accessibility'
import { useRef, useEffect } from 'react'
import TabBadge, { useTabBadges } from './TabBadge'

interface BottomNavProps {
  activeTab?: 'performance' | 'income' | 'lifestyle' | 'strategy' | 'quickActions'
  onTabChange?: (tab: string) => void
  onQuickActionsClick?: () => void
}

export default function BottomNavigation({ 
  activeTab, 
  onTabChange,
  onQuickActionsClick 
}: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)
  const { badgeStates, visitTab } = useTabBadges()
  
  // Scroll detection for hide/show behavior
  const scrollState = useScrollDirection({
    threshold: 10,
    debounceMs: 50,
    initialVisible: true
  })
  
  // Determine active tab from pathname if not provided
  const currentTab = activeTab || (() => {
    if (pathname === '/dashboard') return 'performance'
    if (pathname.startsWith('/dashboard/income')) return 'income'
    if (pathname.startsWith('/dashboard/lifestyle') || pathname.startsWith('/dashboard/expenses')) return 'lifestyle'
    if (pathname.startsWith('/dashboard/strategy')) return 'strategy'
    
    // FIXED: Handle Super Cards routing with URL parameters
    if (pathname.startsWith('/dashboard/super-cards')) {
      // SSR-safe URL parameter extraction
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const card = urlParams.get('card')
        
        switch (card) {
          case 'performance': return 'performance'
          case 'income': return 'income'
          case 'planning': return 'lifestyle' // Financial Planning maps to Lifestyle tab
          case 'tax': return 'strategy' // Tax Strategy maps to Strategy tab
          case 'portfolio': return 'strategy' // Portfolio Strategy also maps to Strategy tab
          default: return 'performance'
        }
      }
      return 'performance' // SSR fallback
    }
    
    return 'performance'
  })()


  const handleTabClick = (tab: string, route: string | null, label: string) => {
    // Haptic feedback for navigation
    haptic.selection()
    
    // Announce navigation to screen readers
    liveRegionManager.announce(`Switching to ${label} Super Card`, 'polite')
    
    // Track tab visit for badge management
    const tabKey = tab === 'performance' ? 'dashboard' : 
                   tab === 'lifestyle' ? 'expenses' : tab
    if (badgeStates[tabKey as keyof typeof badgeStates]) {
      visitTab(tabKey as keyof typeof badgeStates)
    }
    
    onTabChange?.(tab)
    
    // Handle Quick Actions differently - it's a modal/drawer, not navigation
    if (tab === 'quickActions') {
      onQuickActionsClick?.()
    } else if (route) {
      // FIXED: Navigate to Super Cards system with card selection
      if (tab === 'performance') {
        router.push('/dashboard/super-cards?card=performance')
      } else if (tab === 'income') {
        router.push('/dashboard/super-cards?card=income')
      } else if (tab === 'lifestyle') {
        router.push('/dashboard/super-cards?card=planning') // Lifestyle maps to Financial Planning
      } else if (tab === 'strategy') {
        router.push('/dashboard/super-cards?card=tax') // Strategy maps to Tax Strategy
      } else {
        router.push(route)
      }
    }
  }
  
  // Setup keyboard navigation
  const { focusElementAtIndex } = useKeyboardNavigation(navRef as any)
  
  // Register keyboard shortcuts
  useEffect(() => {
    const shortcuts = [
      {
        key: 'd',
        altKey: true,
        callback: () => {
          router.push('/dashboard')
          liveRegionManager.announce('Dashboard opened via keyboard shortcut', 'polite')
        },
        description: 'Go to Dashboard'
      },
      {
        key: 'p',
        altKey: true,
        callback: () => {
          router.push('/dashboard/portfolio')
          liveRegionManager.announce('Portfolio opened via keyboard shortcut', 'polite')
        },
        description: 'Go to Portfolio'
      },
      {
        key: 's',
        altKey: true,
        callback: () => {
          router.push('/settings')
          liveRegionManager.announce('Settings opened via keyboard shortcut', 'polite')
        },
        description: 'Go to Settings'
      }
    ]
    
    shortcuts.forEach(shortcut => shortcutManager.register(shortcut.key))
    shortcutManager.startListening()
    
    return () => {
      shortcuts.forEach(shortcut => shortcutManager.unregister(shortcut.key))
      shortcutManager.stopListening()
    }
  }, [router])



  return (
    <nav 
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-all duration-500 backdrop-blur-xl border-t ${
          scrollState.isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        }`}
        style={{ 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(51, 65, 85, 0.95) 100%)',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          transform: scrollState.isVisible ? 'translateY(0)' : 'translateY(100%)',
          visibility: scrollState.isVisible ? 'visible' : 'hidden',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.3)'
        }}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={!scrollState.isVisible}
      >
        <div className="relative">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          {/* Navigation Tabs - 5 Super Cards Layout */}
          <div 
            ref={navRef}
            className="flex items-center justify-around px-3 py-4" 
            style={{ height: '88px' }}
            role="tablist"
            aria-label="Super Cards navigation"
          >
            {/* Performance Super Card */}
            <button
              onClick={() => handleTabClick('performance', '/dashboard', 'Performance')}
              className={`
                group flex flex-col items-center space-y-2 px-3 py-2 transition-all duration-300 active:scale-95 touch-target relative rounded-2xl
                ${badgeStates.dashboard.shown && badgeStates.dashboard.count > 0 
                  ? 'animate-pulse-glow' 
                  : ''
                }
                ${currentTab === 'performance' 
                  ? 'bg-gradient-to-b from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-400/30' 
                  : 'hover:bg-white/5'
                }
              `}
              style={{
                minWidth: '60px',
                minHeight: '60px',
                ...(badgeStates.dashboard.shown && badgeStates.dashboard.count > 0 && {
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                })
              }}
              role="tab"
              aria-label="Performance Super Card - Portfolio performance and benchmark comparison"
              aria-selected={currentTab === 'performance'}
              aria-current={currentTab === 'performance' ? 'page' : undefined}
              tabIndex={currentTab === 'performance' ? 0 : -1}
            >
              <div className="relative">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  currentTab === 'performance' 
                    ? 'bg-blue-500/20 shadow-lg' 
                    : 'bg-white/10 group-hover:bg-white/15'
                }`}>
                  <BarChart3 
                    className={`w-5 h-5 transition-all duration-300 ${
                      currentTab === 'performance' 
                        ? 'text-blue-400 scale-110 drop-shadow-sm' 
                        : 'text-white/70 group-hover:text-white group-hover:scale-105'
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <TabBadge
                  count={badgeStates.dashboard.count}
                  tabName="Performance"
                  show={badgeStates.dashboard.shown}
                />
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                currentTab === 'performance' 
                  ? 'text-blue-400' 
                  : 'text-white/70 group-hover:text-white'
              }`}>Performance</span>
              {currentTab === 'performance' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full shadow-lg"></div>
              )}
              {currentTab === 'performance' && (
                <span className="sr-only">Currently viewing Performance Super Card</span>
              )}
            </button>

            {/* Income Intelligence Super Card */}
            <button
              onClick={() => handleTabClick('income', '/dashboard/income', 'Income')}
              className={`
                group flex flex-col items-center space-y-2 px-3 py-2 transition-all duration-300 active:scale-95 touch-target relative rounded-2xl
                ${badgeStates.income.shown && badgeStates.income.count > 0 
                  ? 'animate-pulse-glow' 
                  : ''
                }
                ${currentTab === 'income' 
                  ? 'bg-gradient-to-b from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-400/30' 
                  : 'hover:bg-white/5'
                }
              `}
              style={{
                minWidth: '60px',
                minHeight: '60px',
                ...(badgeStates.income.shown && badgeStates.income.count > 0 && {
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                })
              }}
              role="tab"
              aria-label="Income Super Card - Dividend income intelligence and planning"
              aria-selected={currentTab === 'income'}
              aria-current={currentTab === 'income' ? 'page' : undefined}
              tabIndex={currentTab === 'income' ? 0 : -1}
            >
              <div className="relative">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  currentTab === 'income' 
                    ? 'bg-green-500/20 shadow-lg' 
                    : 'bg-white/10 group-hover:bg-white/15'
                }`}>
                  <DollarSign 
                    className={`w-5 h-5 transition-all duration-300 ${
                      currentTab === 'income' 
                        ? 'text-green-400 scale-110 drop-shadow-sm' 
                        : 'text-white/70 group-hover:text-white group-hover:scale-105'
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <TabBadge
                  count={badgeStates.income.count}
                  tabName="Income"
                  show={badgeStates.income.shown}
                />
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                currentTab === 'income' 
                  ? 'text-green-400' 
                  : 'text-white/70 group-hover:text-white'
              }`}>Income</span>
              {currentTab === 'income' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-400 rounded-full shadow-lg"></div>
              )}
              {currentTab === 'income' && (
                <span className="sr-only">Currently viewing Income Intelligence Super Card</span>
              )}
            </button>

            {/* Lifestyle Coverage Super Card */}
            <button
              onClick={() => handleTabClick('lifestyle', '/dashboard/expenses', 'Lifestyle')}
              className={`
                group flex flex-col items-center space-y-2 px-3 py-2 transition-all duration-300 active:scale-95 touch-target relative rounded-2xl
                ${currentTab === 'lifestyle' 
                  ? 'bg-gradient-to-b from-pink-500/20 to-pink-600/20 backdrop-blur-sm border border-pink-400/30' 
                  : 'hover:bg-white/5'
                }
              `}
              style={{
                minWidth: '60px',
                minHeight: '60px'
              }}
              role="tab"
              aria-label="Lifestyle Super Card - Expense coverage and FIRE progress"
              aria-selected={currentTab === 'lifestyle'}
              aria-current={currentTab === 'lifestyle' ? 'page' : undefined}
              tabIndex={currentTab === 'lifestyle' ? 0 : -1}
            >
              <div className="relative">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  currentTab === 'lifestyle' 
                    ? 'bg-pink-500/20 shadow-lg' 
                    : 'bg-white/10 group-hover:bg-white/15'
                }`}>
                  <Heart 
                    className={`w-5 h-5 transition-all duration-300 ${
                      currentTab === 'lifestyle' 
                        ? 'text-pink-400 scale-110 drop-shadow-sm' 
                        : 'text-white/70 group-hover:text-white group-hover:scale-105'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                currentTab === 'lifestyle' 
                  ? 'text-pink-400' 
                  : 'text-white/70 group-hover:text-white'
              }`}>Lifestyle</span>
              {currentTab === 'lifestyle' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-pink-400 rounded-full shadow-lg"></div>
              )}
              {currentTab === 'lifestyle' && (
                <span className="sr-only">Currently viewing Lifestyle Coverage Super Card</span>
              )}
            </button>

            {/* Strategy Optimization Super Card */}
            <button
              onClick={() => handleTabClick('strategy', '/dashboard/strategy', 'Strategy')}
              className={`
                group flex flex-col items-center space-y-2 px-3 py-2 transition-all duration-300 active:scale-95 touch-target relative rounded-2xl
                ${badgeStates.strategy.shown && badgeStates.strategy.count > 0 
                  ? 'animate-pulse-glow' 
                  : ''
                }
                ${currentTab === 'strategy' 
                  ? 'bg-gradient-to-b from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-400/30' 
                  : 'hover:bg-white/5'
                }
              `}
              style={{
                minWidth: '60px',
                minHeight: '60px',
                ...(badgeStates.strategy.shown && badgeStates.strategy.count > 0 && {
                  boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)'
                })
              }}
              role="tab"
              aria-label="Strategy Super Card - Tax optimization and rebalancing insights"
              aria-selected={currentTab === 'strategy'}
              aria-current={currentTab === 'strategy' ? 'page' : undefined}
              tabIndex={currentTab === 'strategy' ? 0 : -1}
            >
              <div className="relative">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  currentTab === 'strategy' 
                    ? 'bg-purple-500/20 shadow-lg' 
                    : 'bg-white/10 group-hover:bg-white/15'
                }`}>
                  <Brain 
                    className={`w-5 h-5 transition-all duration-300 ${
                      currentTab === 'strategy' 
                        ? 'text-purple-400 scale-110 drop-shadow-sm' 
                        : 'text-white/70 group-hover:text-white group-hover:scale-105'
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <TabBadge
                  count={badgeStates.strategy.count}
                  tabName="Strategy"
                  show={badgeStates.strategy.shown}
                />
              </div>
              <span className={`text-xs font-medium transition-all duration-300 ${
                currentTab === 'strategy' 
                  ? 'text-purple-400' 
                  : 'text-white/70 group-hover:text-white'
              }`}>Strategy</span>
              {currentTab === 'strategy' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-400 rounded-full shadow-lg"></div>
              )}
              {currentTab === 'strategy' && (
                <span className="sr-only">Currently viewing Strategy Optimization Super Card</span>
              )}
            </button>

            {/* Quick Actions FAB - Special behavior */}
            <button
              onClick={() => handleTabClick('quickActions', null, 'Quick Actions')}
              className="
                group flex flex-col items-center space-y-1 px-4 py-3 transition-all duration-300 active:scale-90 touch-target relative
                transform hover:scale-110 shadow-2xl rounded-2xl border border-white/20
              "
              style={{
                minWidth: '64px',
                minHeight: '64px',
                transform: 'translateY(-8px)', // More elevated FAB
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)'
              }}
              role="button"
              aria-label="Quick Actions - Add holdings, expenses, and quick inputs"
              tabIndex={0}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                <div className="relative p-2 rounded-full bg-white/10 backdrop-blur-sm">
                  <Zap 
                    className="w-6 h-6 text-white drop-shadow-lg group-hover:rotate-12 transition-all duration-300"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-white drop-shadow-lg">Actions</span>
              {/* Floating glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 blur-xl -z-10"></div>
            </button>
          </div>
          
          {/* Floating bottom indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
    </nav>
  )
}