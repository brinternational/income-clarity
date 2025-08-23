'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Settings,
  HelpCircle, 
  User, 
  LogOut, 
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Receipt,
  Crown,
  CreditCard,
  LayoutGrid,
  TrendingUp,
  PieChart,
  Calculator,
  Target,
  Bell,
  DollarSign
} from 'lucide-react'
import { NAVIGATION_CONFIG } from '@/lib/navigation-config'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFeatureAccess } from '@/components/premium/FeatureGate'
import { logger } from '@/lib/logger'

interface SidebarNavigationProps {
  children?: React.ReactNode
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href: string
  badge?: string
  isPremium?: boolean
  isUpgrade?: boolean
  children?: NavigationItem[]
}

export function SidebarNavigation({ children }: SidebarNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Get auth context - handle case where it might not be available
  let authContext = null
  let user = null
  let signOut = null
  let profile = null
  let loading = false
  let isAuthAvailable = true
  
  try {
    authContext = useAuthContext()
    user = authContext.user
    signOut = authContext.signOut
    profile = authContext.profile
    loading = authContext.loading
  } catch (error) {
    // Auth context not available - probably in demo mode
    isAuthAvailable = false
  }

  // Get premium access - with fallback for when it's not available
  let isPremium = false
  let isFreeTier = true
  try {
    const { isPremium: premiumStatus, isFreeTier: freeStatus } = useFeatureAccess()
    isPremium = premiumStatus
    isFreeTier = freeStatus
  } catch (error) {
    // Feature access not available
  }

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-collapse on mobile
      if (mobile) {
        setIsExpanded(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load saved sidebar state
  useEffect(() => {
    const savedState = localStorage.getItem('income-clarity-sidebar-expanded')
    if (savedState !== null) {
      setIsExpanded(JSON.parse(savedState) && !isMobile)
    }
  }, [isMobile])

  // Save sidebar state
  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem('income-clarity-sidebar-expanded', JSON.stringify(newState))
  }

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: NAVIGATION_CONFIG.dashboard
    },
    {
      id: 'super-cards',
      label: 'Super Cards',
      icon: LayoutGrid,
      href: '/dashboard/super-cards',
      badge: 'AI'
    }
  ]

  // Super Cards individual navigation items
  const superCardsItems: NavigationItem[] = [
    {
      id: 'performance-hub',
      label: 'Performance Hub',
      icon: TrendingUp,
      href: '/dashboard/performance',
      badge: 'AI'
    },
    {
      id: 'income-intelligence',
      label: 'Income Intelligence',
      icon: DollarSign,
      href: '/dashboard/income',
      badge: 'AI'
    },
    {
      id: 'tax-strategy',
      label: 'Tax Strategy',
      icon: Calculator,
      href: '/dashboard/tax-strategy',
      badge: 'AI'
    },
    {
      id: 'portfolio-strategy',
      label: 'Portfolio Strategy',
      icon: PieChart,
      href: '/dashboard/portfolio-strategy',
      badge: 'AI'
    },
    {
      id: 'financial-planning',
      label: 'Financial Planning',
      icon: Target,
      href: '/dashboard/financial-planning',
      badge: 'AI'
    }
  ]

  // Additional navigation items
  const additionalItems: NavigationItem[] = [
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: PieChart,
      href: '/portfolio'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: Receipt,
      href: '/transactions'
    }
  ]

  // Premium/upgrade navigation items
  const premiumItems: NavigationItem[] = isPremium 
    ? [
        {
          id: 'bank-sync',
          label: 'Bank Sync',
          icon: Crown,
          href: '/settings/bank-connections',
          isPremium: true,
          badge: 'Premium'
        }
      ]
    : [
        {
          id: 'upgrade',
          label: 'Upgrade',
          icon: Crown,
          href: '/pricing',
          isUpgrade: true,
          badge: 'Premium'
        }
      ]

  const handleNavigate = (href: string) => {
    router.push(href)
    setShowProfileDropdown(false)
    // Auto-collapse on mobile after navigation
    if (isMobile) {
      setIsExpanded(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (signOut) {
        const result = await signOut()
        if (result.success) {
          setShowProfileDropdown(false)
          router.push(NAVIGATION_CONFIG.login)
        }
      } else {
        // Fallback for when auth context is not available
        setShowProfileDropdown(false)
        router.push(NAVIGATION_CONFIG.login)
      }
    } catch (error) {
      // Fallback redirect
      router.push(NAVIGATION_CONFIG.login)
    }
  }

  const isActive = (href: string) => {
    if (href === NAVIGATION_CONFIG.dashboard) {
      return pathname === href || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Mobile overlay component
  const MobileOverlay = () => (
    <div 
      className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
        isMobile && isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsExpanded(false)}
    />
  )

  // Navigation item component
  const NavigationItemComponent = ({ item, isCompact = false }: { item: NavigationItem; isCompact?: boolean }) => {
    const active = isActive(item.href)
    const IconComponent = item.icon

    return (
      <button
        onClick={() => handleNavigate(item.href)}
        className={`
          group relative w-full flex items-center transition-all duration-200 rounded-lg
          ${isCompact ? 'p-3 justify-center' : 'p-3 justify-start space-x-3'}
          ${active 
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm' 
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground dark:hover:text-foreground'
          }
          ${item.isPremium ? 'border-l-2 border-purple-500' : ''}
          ${item.isUpgrade ? 'border-l-2 border-blue-500' : ''}
        `}
        aria-label={item.label}
        title={isCompact ? item.label : ''}
      >
        <IconComponent 
          className={`h-5 w-5 flex-shrink-0 ${
            item.isPremium ? 'text-purple-600 dark:text-purple-400' :
            item.isUpgrade ? 'text-blue-600 dark:text-blue-400' : ''
          }`} 
        />
        
        {!isCompact && (
          <span className="text-sm font-medium flex-1 text-left">
            {item.label}
          </span>
        )}
        
        {!isCompact && item.badge && (
          <span className={`
            px-2 py-0.5 text-xs rounded-full font-medium
            ${item.isPremium 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              : item.isUpgrade 
              ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            }
          `}>
            {item.badge}
          </span>
        )}

        {/* Compact tooltip */}
        {isCompact && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-background text-white dark:text-foreground text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {item.label}
            {item.badge && (
              <span className="ml-1 text-xs opacity-75">({item.badge})</span>
            )}
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <MobileOverlay />
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-border transition-all duration-300 ease-in-out shadow-lg
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isMobile ? 'translate-x-0' : ''}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {isExpanded && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">
                Income Clarity
              </span>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground dark:hover:text-foreground transition-colors"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto py-4">
          <nav className="flex-1 px-3 space-y-1">
            {/* Main Navigation */}
            {navigationItems.map((item) => (
              <NavigationItemComponent 
                key={item.id} 
                item={item} 
                isCompact={!isExpanded} 
              />
            ))}

            {/* Super Cards Section */}
            {isExpanded && (
              <div className="pt-2 pb-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Intelligence Hubs
                </p>
              </div>
            )}
            {superCardsItems.map((item) => (
              <NavigationItemComponent 
                key={item.id} 
                item={item} 
                isCompact={!isExpanded} 
              />
            ))}

            {/* Divider */}
            <div className="border-t border-border my-3" />

            {/* Additional Navigation */}
            {additionalItems.map((item) => (
              <NavigationItemComponent 
                key={item.id} 
                item={item} 
                isCompact={!isExpanded} 
              />
            ))}

            {/* Divider */}
            <div className="border-t border-border my-3" />

            {/* Premium/Upgrade Navigation */}
            {premiumItems.map((item) => (
              <NavigationItemComponent 
                key={item.id} 
                item={item} 
                isCompact={!isExpanded} 
              />
            ))}

            {/* Divider */}
            <div className="border-t border-border my-3" />

            {/* Settings */}
            <NavigationItemComponent 
              item={{
                id: 'settings',
                label: 'Settings',
                icon: Settings,
                href: NAVIGATION_CONFIG.settings
              }}
              isCompact={!isExpanded} 
            />
          </nav>

          {/* User Profile Section */}
          <div className="px-3 py-4 border-t border-border">
            {isAuthAvailable && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`
                    w-full flex items-center transition-all duration-200 rounded-lg p-3
                    ${isExpanded ? 'justify-between' : 'justify-center'}
                    text-muted-foreground hover:bg-secondary hover:text-foreground dark:hover:text-foreground
                  `}
                  aria-label="User menu"
                >
                  <div className={`flex items-center ${isExpanded ? 'space-x-3' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    {isExpanded && (
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground truncate">
                          {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {isPremium ? 'Premium' : 'Free'}
                        </p>
                      </div>
                    )}
                  </div>
                  {isExpanded && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className={`
                    absolute bottom-full mb-2 rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-border z-50
                    ${isExpanded ? 'left-0 right-0' : 'left-full ml-2 w-48'}
                  `}>
                    <div className="py-2">
                      <button
                        onClick={() => handleNavigate(NAVIGATION_CONFIG.profile)}
                        className="w-full px-4 py-2 text-left text-sm text-foreground/90 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>View Profile</span>
                      </button>
                      
                      {isPremium ? (
                        <button
                          onClick={() => handleNavigate('/settings/billing')}
                          className="w-full px-4 py-2 text-left text-sm text-foreground/90 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Billing</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleNavigate('/pricing')}
                          className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-2"
                        >
                          <Crown className="h-4 w-4" />
                          <span>Upgrade to Premium</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleNavigate(NAVIGATION_CONFIG.onboarding)}
                        className="w-full px-4 py-2 text-left text-sm text-foreground/90 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <span>Setup Guide</span>
                      </button>
                      
                      <hr className="my-1 border-border" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigate(NAVIGATION_CONFIG.login)}
                  className={`
                    w-full flex items-center transition-colors rounded-lg p-3
                    ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
                    text-muted-foreground hover:bg-secondary hover:text-foreground dark:hover:text-foreground
                  `}
                >
                  <User className="h-5 w-5" />
                  {isExpanded && <span className="text-sm font-medium">Login</span>}
                </button>
                
                <button
                  onClick={() => handleNavigate(NAVIGATION_CONFIG.signup)}
                  className={`
                    w-full flex items-center transition-colors rounded-lg p-3 bg-blue-600 hover:bg-blue-700 text-white
                    ${isExpanded ? 'justify-start space-x-3' : 'justify-center'}
                  `}
                >
                  <User className="h-5 w-5" />
                  {isExpanded && <span className="text-sm font-medium">Sign Up</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isExpanded && !isMobile ? 'ml-64' : 'ml-16'}`}>
        {children}
      </div>

      {/* Click outside handler for profile dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </div>
  )
}