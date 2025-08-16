'use client'

import { useEffect, useState } from 'react'

interface TabBadgeProps {
  count: number
  tabName: string
  className?: string
  show?: boolean
  onDismiss?: () => void
}

export default function TabBadge({ 
  count, 
  tabName, 
  className = '', 
  show = true,
  onDismiss 
}: TabBadgeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    if (show && count > 0) {
      // Small delay for entrance animation
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, count])

  const handleDismiss = () => {
    if (onDismiss) {
      setIsAnimatingOut(true)
      setTimeout(() => {
        onDismiss()
        setIsAnimatingOut(false)
      }, 200)
    }
  }

  if (!show || count === 0 || (!isVisible && !isAnimatingOut)) {
    return null
  }

  return (
    <div
      className={`
        absolute -top-1 -right-1 z-10
        ${isVisible && !isAnimatingOut 
          ? 'scale-100 opacity-100' 
          : 'scale-0 opacity-0'
        }
        transition-all duration-300 ease-out
        ${className}
      `}
      role="status"
      aria-label={`${count} new features in ${tabName}`}
    >
      {/* Badge Circle */}
      <div 
        className="
          flex items-center justify-center
          w-5 h-5 
          bg-red-500 
          text-white text-xs font-bold
          rounded-full
          shadow-lg
          ring-2 ring-white
          animate-pulse
        "
        style={{
          backgroundColor: 'var(--color-accent, #ef4444)',
          animationDuration: '2s'
        }}
      >
        {count > 9 ? '9+' : count}
      </div>

      {/* Pulse Animation Ring */}
      <div 
        className="
          absolute inset-0
          w-5 h-5
          border-2 border-red-400
          rounded-full
          animate-ping
        "
        style={{
          borderColor: 'var(--color-accent-light, rgba(239, 68, 68, 0.5))',
          animationDuration: '2s'
        }}
      />

      {/* Screen Reader Only Text */}
      <span className="sr-only">
        {count === 1 
          ? `1 new feature available in ${tabName}` 
          : `${count} new features available in ${tabName}`
        }
      </span>
    </div>
  )
}

// Hook to manage badge states across tabs
export function useTabBadges() {
  const [badgeStates, setBadgeStates] = useState({
    dashboard: { count: 1, shown: true, dismissed: false },
    strategy: { count: 3, shown: true, dismissed: false },
    income: { count: 3, shown: true, dismissed: false },
    portfolio: { count: 1, shown: true, dismissed: false },
    expenses: { count: 0, shown: false, dismissed: false }
  })

  const dismissBadge = (tabName: keyof typeof badgeStates) => {
    setBadgeStates(prev => ({
      ...prev,
      [tabName]: {
        ...prev[tabName],
        shown: false,
        dismissed: true
      }
    }))

    // Store dismissal in localStorage for persistence
    try {
      const dismissedBadges = JSON.parse(
        localStorage.getItem('income-clarity-dismissed-badges') || '{}'
      )
      dismissedBadges[tabName] = {
        dismissedAt: new Date().toISOString(),
        count: badgeStates[tabName].count
      }
      localStorage.setItem('income-clarity-dismissed-badges', JSON.stringify(dismissedBadges))
    } catch (error) {
      // Error handled by emergency recovery script

  const visitTab = (tabName: keyof typeof badgeStates) => {
    // Mark tab as visited and reduce badge count
    setBadgeStates(prev => ({
      ...prev,
      [tabName]: {
        ...prev[tabName],
        count: Math.max(0, prev[tabName].count - 1),
        shown: prev[tabName].count > 1 // Keep showing if more than 1 feature
      }
    }))

    // Store visit in localStorage
    try {
      const visitedTabs = JSON.parse(
        localStorage.getItem('income-clarity-visited-tabs') || '{}'
      )
      visitedTabs[tabName] = {
        lastVisited: new Date().toISOString(),
        visitCount: (visitedTabs[tabName]?.visitCount || 0) + 1
      }
      localStorage.setItem('income-clarity-visited-tabs', JSON.stringify(visitedTabs))
    } catch (error) {
      // Error handled by emergency recovery script

  const resetAllBadges = () => {
    setBadgeStates({
      dashboard: { count: 1, shown: true, dismissed: false },
      strategy: { count: 3, shown: true, dismissed: false },
      income: { count: 3, shown: true, dismissed: false },
      portfolio: { count: 1, shown: true, dismissed: false },
      expenses: { count: 0, shown: false, dismissed: false }
    })
    
    // Clear localStorage
    try {
      localStorage.removeItem('income-clarity-dismissed-badges')
      localStorage.removeItem('income-clarity-visited-tabs')
    } catch (error) {
      // Error handled by emergency recovery script

  // Load persisted state on mount
  useEffect(() => {
    try {
      const dismissedBadges = JSON.parse(
        localStorage.getItem('income-clarity-dismissed-badges') || '{}'
      )
      const visitedTabs = JSON.parse(
        localStorage.getItem('income-clarity-visited-tabs') || '{}'
      )

      setBadgeStates(prev => {
        const newState = { ...prev }
        
        // Apply dismissals
        Object.keys(dismissedBadges).forEach(tabName => {
          if (newState[tabName as keyof typeof newState]) {
            newState[tabName as keyof typeof newState] = {
              ...newState[tabName as keyof typeof newState],
              shown: false,
              dismissed: true
            }
          }
        })

        // Apply visit reductions (reduce count based on visits)
        Object.keys(visitedTabs).forEach(tabName => {
          if (newState[tabName as keyof typeof newState]) {
            const visitCount = visitedTabs[tabName].visitCount || 0
            const originalCount = newState[tabName as keyof typeof newState].count
            newState[tabName as keyof typeof newState] = {
              ...newState[tabName as keyof typeof newState],
              count: Math.max(0, originalCount - visitCount),
              shown: (originalCount - visitCount) > 0 && !newState[tabName as keyof typeof newState].dismissed
            }
          }
        })

        return newState
      })
    } catch (error) {
      // Error handled by emergency recovery script, [])

  return {
    badgeStates,
    dismissBadge,
    visitTab,
    resetAllBadges
  }
}