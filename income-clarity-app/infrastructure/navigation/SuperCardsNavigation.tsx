'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings,
  HelpCircle, 
  User, 
  LogOut, 
  Home,
  ArrowLeft,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  Receipt
} from 'lucide-react'
import { NAVIGATION_CONFIG } from '@/lib/navigation-config'
import { useAuthContext } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'

interface SuperCardsNavigationProps {
  selectedCard?: string | null
  cardTitle?: string
  onBack?: () => void
  showBackButton?: boolean
}

export function SuperCardsNavigation({
  selectedCard,
  cardTitle,
  onBack,
  showBackButton = false
}: SuperCardsNavigationProps) {
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  
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
    // logger.log('Auth context not available, using fallback navigation')
  }

  const handleNavigateToSettings = () => {
    router.push(NAVIGATION_CONFIG.settings)
    setShowMobileMenu(false)
    setShowProfileDropdown(false)
  }

  const handleNavigateToProfile = () => {
    router.push(NAVIGATION_CONFIG.profile)
    setShowMobileMenu(false)
    setShowProfileDropdown(false)
  }

  const handleNavigateToOnboarding = () => {
    router.push(NAVIGATION_CONFIG.onboarding)
    setShowMobileMenu(false)
    setShowProfileDropdown(false)
  }

  const handleNavigateToDashboard = () => {
    router.push(NAVIGATION_CONFIG.dashboard)
    setShowMobileMenu(false)
  }

  const handleNavigateToAnalytics = () => {
    router.push('/analytics')
    setShowMobileMenu(false)
    setShowProfileDropdown(false)
  }

  const handleNavigateToTransactions = () => {
    router.push('/transactions')
    setShowMobileMenu(false)
    setShowProfileDropdown(false)
  }

  const handleLogout = async () => {
    try {
      if (signOut) {
        const result = await signOut()
        if (result.success) {
          setShowMobileMenu(false)
          setShowProfileDropdown(false)
          router.push(NAVIGATION_CONFIG.login)
        }
      } else {
        // Fallback for when auth context is not available
        setShowMobileMenu(false)
        setShowProfileDropdown(false)
        router.push(NAVIGATION_CONFIG.login)
      }
    } catch (error) {
      // logger.error('Logout failed:', error)
      // Fallback redirect
      router.push(NAVIGATION_CONFIG.login)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push(NAVIGATION_CONFIG.dashboard)
    }
    setShowMobileMenu(false)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Back to Super Cards grid"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {cardTitle || 'Super Cards'}
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={handleNavigateToDashboard}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={handleNavigateToAnalytics}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>

              <button
                onClick={handleNavigateToTransactions}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Receipt className="h-4 w-4" />
                <span>Transactions</span>
              </button>

              <button
                onClick={handleNavigateToSettings}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>

              {/* Profile Dropdown / Auth Buttons */}
              {isAuthAvailable && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User className="h-4 w-4" />
                    <span>{user?.email || profile?.full_name || 'Profile'}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-50">
                      <div className="py-1">
                        <button
                          onClick={handleNavigateToProfile}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                        >
                          <User className="h-4 w-4" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={handleNavigateToOnboarding}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span>Setup Guide</span>
                        </button>
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(NAVIGATION_CONFIG.login)}
                    className="px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push(NAVIGATION_CONFIG.signup)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={handleNavigateToDashboard}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={handleNavigateToAnalytics}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>

              <button
                onClick={handleNavigateToTransactions}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Receipt className="h-4 w-4" />
                <span>Transactions</span>
              </button>

              {isAuthAvailable && user ? (
                <>
                  <button
                    onClick={handleNavigateToSettings}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={handleNavigateToProfile}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={handleNavigateToOnboarding}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Setup Guide</span>
                  </button>

                  <hr className="my-2 border-slate-200 dark:border-slate-700" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      router.push(NAVIGATION_CONFIG.login)
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push(NAVIGATION_CONFIG.signup)
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left bg-blue-600 hover:bg-blue-700 text-white transition-colors rounded-lg"
                  >
                    <User className="h-4 w-4" />
                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside handler for dropdowns */}
      {(showProfileDropdown && !showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </>
  )
}