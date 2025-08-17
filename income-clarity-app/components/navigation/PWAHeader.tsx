'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  User, 
  Wifi, 
  WifiOff, 
  Download, 
  Share2, 
  Bell,
  ChevronDown,
  Globe,
  Smartphone,
  Monitor,
  X,
  Check
} from 'lucide-react'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import { useNotifications } from '@/contexts/NotificationContext'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { ThemeSelector } from '@/components/theme/ThemeSelector'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { HeaderFAB } from '@/components/navigation/HeaderFAB'
import { logger } from '@/lib/logger'

interface PWAHeaderProps {
  title: string
  userName?: string
  onSettingsClick: () => void
  onLogout: () => void
  onAddClick?: () => void
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAHeader({ title, userName, onSettingsClick, onLogout, onAddClick }: PWAHeaderProps) {
  const { isOnline, isSlowConnection, connectionType } = useConnectionStatus()
  const { unreadCount, requestPermission, hasPermission } = useNotifications()
  const { incomeClarityData } = useUserProfile()
  
  // PWA Installation state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const [showHealthTooltip, setShowHealthTooltip] = useState(false)

  // Portfolio Health Status Calculation
  const calculateHealthStatus = () => {
    const { availableToReinvest, monthlyExpenses } = incomeClarityData
    
    if (availableToReinvest >= monthlyExpenses * 0.2) {
      // 20%+ buffer = Green (Good)
      return { 
        color: 'var(--color-success)', 
        level: 'Good', 
        message: 'Strong financial position',
        bgColor: 'rgba(16, 185, 129, 1)'
      }
    } else if (availableToReinvest >= 0) {
      // 0-20% buffer = Yellow (Warning) 
      return { 
        color: 'var(--color-warning)', 
        level: 'Warning', 
        message: 'Limited financial buffer',
        bgColor: 'rgba(251, 191, 36, 1)'
      }
    } else {
      // Negative = Red (Critical)
      return { 
        color: 'var(--color-error)', 
        level: 'Critical', 
        message: 'Expenses exceed income',
        bgColor: 'rgba(239, 68, 68, 1)'
      }
    }
  }

  const healthStatus = calculateHealthStatus()

  // PWA installation detection
  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true
    setIsInstalled(isAppInstalled)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        // logger.log('User accepted the install prompt')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      // Error handled by emergency recovery script
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Income Clarity - Live Off Your Portfolio',
      text: 'Check out this dividend income lifestyle management tool!',
      url: window.location.origin
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
        // You could show a toast notification here
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      // Error handled by emergency recovery script
    }
  }

  const getConnectionStatusDisplay = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Offline',
        color: 'var(--color-error)',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      }
    }

    if (isSlowConnection) {
      return {
        icon: <Globe className="w-4 h-4" />,
        text: 'Slow',
        color: 'var(--color-warning)',
        bgColor: 'rgba(251, 191, 36, 0.1)'
      }
    }

    return {
      icon: <Wifi className="w-4 h-4" />,
      text: 'Online',
      color: 'var(--color-success)',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    }
  }

  const connectionStatus = getConnectionStatusDisplay()

  return (
    <>
    <header 
      className="relative transition-all duration-300 backdrop-blur-xl border-b z-50"
      style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderImage: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1)) 1'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-lg shadow-sm"></div>
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm tracking-tight">
              {title}
            </h1>
          </div>

          {/* Right side - PWA Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Connection Status */}
            <div 
              className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
              style={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
              title={`Connection: ${connectionStatus.text}${connectionType !== 'unknown' ? ` (${connectionType})` : ''}`}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isOnline ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              {connectionStatus.icon}
              <span className="hidden md:inline">{connectionStatus.text}</span>
            </div>

            {/* PWA Install Button */}
            {!isInstalled && deferredPrompt && (
              <button
                onClick={handleInstallApp}
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/30"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
                title="Install Income Clarity as an app"
              >
                <Download className="w-4 h-4 group-hover:animate-bounce" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="group p-3 rounded-xl transition-all duration-300 hover:scale-105 hover:rotate-12 backdrop-blur-sm border border-white/20"
              style={{ 
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
              title="Share Income Clarity"
            >
              <Share2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="group p-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 relative"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
                title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className={`w-4 h-4 text-white transition-all duration-300 ${
                  unreadCount > 0 ? 'animate-pulse' : 'group-hover:rotate-12'
                }`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Header FAB - Quick Actions */}
            <HeaderFAB 
              onAddClick={onAddClick}
              className="hidden sm:block"
            />

            {/* Theme Selector */}
            <ThemeSelector />

            {/* Profile Dropdown */}
            <div className="relative z-50">
              <button
                data-testid="user-menu"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="group flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 relative"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
                onMouseEnter={() => setShowHealthTooltip(true)}
                onMouseLeave={() => setShowHealthTooltip(false)}
                title={`Portfolio Health: ${healthStatus.level} - ${healthStatus.message}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  {/* Portfolio Health Status Indicator */}
                  <div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white transition-all duration-300 animate-pulse"
                    style={{ backgroundColor: healthStatus.bgColor }}
                    title={`Portfolio Health: ${healthStatus.level}`}
                  />
                </div>
                
                <div className="hidden sm:block">
                  <span data-testid="user-email" className="text-sm font-medium text-white block">
                    {userName || 'User'}
                  </span>
                  <span className="text-xs text-white/70">
                    {healthStatus.level}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-white/70 group-hover:rotate-180 transition-transform duration-300" />
                
                {/* Health Status Tooltip */}
                {showHealthTooltip && (
                  <div className="absolute top-full left-0 mt-3 px-4 py-3 rounded-2xl shadow-2xl border z-50 w-72 backdrop-blur-xl"
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)'
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full animate-pulse shadow-lg"
                        style={{ 
                          backgroundColor: healthStatus.bgColor,
                          boxShadow: `0 0 10px ${healthStatus.bgColor}`
                        }}
                      />
                      <span className="font-semibold text-sm text-white">
                        Portfolio Health: {healthStatus.level}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mb-3">
                      {healthStatus.message}
                    </p>
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                      <div className="text-xs text-white/70 mb-1">Available to Reinvest:</div>
                      <span 
                        className="font-bold text-lg"
                        style={{ color: incomeClarityData.availableToReinvest >= 0 ? '#10b981' : '#ef4444' }}
                      >
                        ${incomeClarityData.availableToReinvest.toLocaleString()}/month
                      </span>
                    </div>
                  </div>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl shadow-2xl border z-[9999] backdrop-blur-xl overflow-hidden"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                  }}
                >
                  <div className="p-2">
                    <button
                      onClick={() => {
                        onSettingsClick()
                        setShowProfileDropdown(false)
                      }}
                      className="group w-full px-4 py-3 text-left text-sm flex items-center space-x-3 transition-all duration-300 rounded-xl hover:scale-[0.98]"
                      style={{ color: 'white' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div className="p-2 rounded-lg bg-white/10">
                        <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      </div>
                      <span className="font-medium">Settings</span>
                    </button>
                    
                    <div className="my-2 h-px bg-white/10"></div>
                    
                    <button
                      data-testid="logout-button"
                      onClick={() => {
                        onLogout()
                        setShowProfileDropdown(false)
                      }}
                      className="group w-full px-4 py-3 text-left text-sm transition-all duration-300 rounded-xl hover:scale-[0.98] flex items-center space-x-3"
                      style={{ color: '#ff6b6b' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showProfileDropdown || showHealthTooltip) && (
        <div
          className="fixed inset-0 z-[9998] bg-black/5 backdrop-blur-sm"
          onClick={() => {
            setShowProfileDropdown(false)
            setShowHealthTooltip(false)
          }}
        />
      )}
      
      {/* Subtle bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </header>

    {/* Notification Center */}
    <NotificationCenter
      isOpen={showNotificationPanel}
      onClose={() => setShowNotificationPanel(false)}
    />
  </>
  )
}