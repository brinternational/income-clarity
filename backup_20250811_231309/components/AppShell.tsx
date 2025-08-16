'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PWAHeader } from '@/components/navigation/PWAHeader'
import BottomNavigation from '@/components/navigation/BottomNavigation'
import { PWAInstaller } from '@/components/PWAInstaller'
import { UpdateNotification } from '@/components/pwa/UpdateNotification'
import DesktopFAB from '@/components/navigation/DesktopFAB'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useAuthContext } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  showHeader?: boolean
  showBottomNav?: boolean
  showPWAInstaller?: boolean
  className?: string
  onSettingsClick?: () => void
  onLogout?: () => void
  onAddClick?: () => void
}

export function AppShell({ 
  children,
  title = "Income Clarity",
  showHeader = true,
  showBottomNav = true,
  showPWAInstaller = true,
  className = "",
  onSettingsClick,
  onLogout,
  onAddClick
}: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useMobileDetection()
  const { user, logout } = useAuthContext()
  
  // Service Worker registration state
  const [swRegistered, setSwRegistered] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  
  // PWA Installation state
  const [installPromptShown, setInstallPromptShown] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  
  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('performance')
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker()
    setupNetworkListeners()
    setupPWAInstallListeners()
  }, [])

  // Update current tab based on pathname and URL parameters
  useEffect(() => {
    const getTabFromPath = (path: string) => {
      if (path === '/dashboard') return 'performance'
      if (path.startsWith('/dashboard/income')) return 'income'
      if (path.startsWith('/dashboard/expenses')) return 'lifestyle'
      if (path.startsWith('/dashboard/strategy')) return 'strategy'
      if (path.startsWith('/dashboard/portfolio')) return 'portfolio'
      
      // Handle Super Cards routing with URL parameters
      if (path.startsWith('/dashboard/super-cards')) {
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search)
          const card = urlParams.get('card')
          
          switch (card) {
            case 'performance': return 'performance'
            case 'income': return 'income'
            case 'planning': return 'lifestyle' // Financial Planning maps to Lifestyle
            case 'tax': return 'strategy' // Tax Strategy maps to Strategy
            case 'portfolio': return 'strategy' // Portfolio Strategy maps to Strategy
            default: return 'performance'
          }
        }
        return 'performance' // SSR fallback
      }
      
      return 'performance'
    }

    const tab = getTabFromPath(pathname)
    setCurrentTab(tab)
  }, [pathname])

  // Service Worker registration
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        setSwRegistered(true)
        // console.log('Service Worker registered:', registration)

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          // console.log('Service Worker update found')
        })
        
        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // Check every hour
        
      } catch (error) {
        // Error handled by emergency recovery script
  }

  // Network status monitoring
  const setupNetworkListeners = () => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }

  // PWA install prompt handling
  const setupPWAInstallListeners = () => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setCanInstall(true)
      
      // Show install prompt after user has used the app for a bit
      if (!installPromptShown) {
        setTimeout(() => {
          setInstallPromptShown(true)
        }, 30000) // Show after 30 seconds
      }
    }

    const handleAppInstalled = () => {
      setCanInstall(false)
      setInstallPromptShown(false)
      // console.log('PWA installed successfully')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }

  // Navigation handlers - use props if provided, otherwise default behavior
  const handleSettingsClick = useCallback(() => {
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      router.push('/settings')
    }
  }, [onSettingsClick, router])

  const handleLogout = useCallback(async () => {
    if (onLogout) {
      onLogout()
    } else {
      try {
        // await logout()
        router.push('/auth' + '/login')
      } catch (error) {
        // Error handled by emergency recovery script
  }, [onLogout, router])

  const handleAddClick = useCallback(() => {
    if (onAddClick) {
      onAddClick()
    } else {
      // Open quick actions or add modal
      setShowQuickActions(true)
    }
  }, [onAddClick])

  const handleTabChange = useCallback((tab: string) => {
    setCurrentTab(tab)
    
    // Navigate to Super Cards system with appropriate card parameter
    const cardRoutes: Record<string, string> = {
      performance: '/dashboard/super-cards?card=performance',
      income: '/dashboard/super-cards?card=income', 
      lifestyle: '/dashboard/super-cards?card=planning', // Lifestyle maps to Financial Planning
      strategy: '/dashboard/super-cards?card=tax', // Strategy maps to Tax Strategy
      portfolio: '/dashboard/super-cards?card=portfolio'
    }

    const route = cardRoutes[tab]
    if (route) {
      router.push(route)
    }
  }, [router])

  const handleQuickActionsToggle = useCallback(() => {
    setShowQuickActions(!showQuickActions)
  }, [showQuickActions])

  // Determine if we should show navigation based on route
  const shouldShowNavigation = () => {
    // Hide navigation on auth pages and onboarding
    if (pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
      return false
    }
    return true
  }

  const showNavigation = shouldShowNavigation()

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 ${className}`}>
      {/* PWA Header */}
      {showHeader && showNavigation && (
        <PWAHeader
          title={title}
          userName={user?.email}
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
          onAddClick={handleAddClick}
        />
      )}

      {/* Main Content Area */}
      <main 
        className={`flex-1 ${
          showNavigation && showBottomNav && isMobile 
            ? 'pb-24' // Add bottom padding for mobile bottom nav
            : ''
        }`}
        role="main"
        aria-label="Application content"
        style={{ isolation: 'isolate' }}
      >
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
            <div className="flex items-center justify-center space-x-2 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                You're offline. Some features may be limited.
              </span>
            </div>
          </div>
        )}

        {/* App Content */}
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      {showBottomNav && showNavigation && isMobile && (
        <BottomNavigation
          activeTab={currentTab as any}
          onTabChange={handleTabChange}
          onQuickActionsClick={handleQuickActionsToggle}
        />
      )}

      {/* Desktop FAB (Desktop Only) */}
      {showNavigation && !isMobile && (
        <DesktopFAB 
          onAddClick={handleAddClick}
        />
      )}

      {/* PWA Installer */}
      {showPWAInstaller && canInstall && installPromptShown && (
        <PWAInstaller />
      )}

      {/* Update Notification */}
      <UpdateNotification />

      {/* Toast Notifications */}
      <Toaster
        position={isMobile ? "top-center" : "bottom-right"}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-primary)',
            color: 'var(--color-text-primary)',
            borderRadius: '12px',
            border: '1px solid var(--color-border)'
          }
        }}
      />

      {/* Service Worker Status (Dev Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50 opacity-50 hover:opacity-100 transition-opacity">
          <div className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs">
            SW: {swRegistered ? '✅' : '❌'} | Net: {isOnline ? '🟢' : '🔴'}
          </div>
        </div>
      )}
    </div>
  )
}

// Type definition for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default AppShell