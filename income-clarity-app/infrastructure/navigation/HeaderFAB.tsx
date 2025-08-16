'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  TrendingUp, 
  Receipt, 
  DollarSign, 
  StickyNote, 
  Upload 
} from 'lucide-react'

interface HeaderFABProps {
  onAddClick?: () => void
  className?: string
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

export function HeaderFAB({ onAddClick, className = '' }: HeaderFABProps) {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)

  // Quick actions - same as bottom FAB for consistency
  const quickActions: QuickAction[] = [
    {
      id: 'add-holding',
      label: 'Add Holding',
      icon: <TrendingUp className="w-4 h-4" />,
      onClick: () => {
        setShowQuickActions(false)
        onAddClick?.()
      }
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: <Receipt className="w-4 h-4" />,
      onClick: () => {
        setShowQuickActions(false)
        onAddClick?.()
      }
    },
    {
      id: 'log-income',
      label: 'Log Income',
      icon: <DollarSign className="w-4 h-4" />,
      onClick: () => {
        setShowQuickActions(false)
        onAddClick?.()
      }
    },
    {
      id: 'quick-note',
      label: 'Quick Note',
      icon: <StickyNote className="w-4 h-4" />,
      onClick: () => {
        setShowQuickActions(false)
        onAddClick?.()
      }
    }
  ]

  const handleFABClick = () => {
    if (onAddClick) {
      onAddClick()
    } else {
      setShowQuickActions(!showQuickActions)
    }
  }

  // Close quick actions on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setShowQuickActions(false)
      }
    }

    if (showQuickActions) {
      document.addEventListener('mousedown', handleOutsideClick)
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showQuickActions])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showQuickActions) {
        setShowQuickActions(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showQuickActions])

  return (
    <div ref={fabRef} className={`relative ${className}`}>
      {/* Quick Actions Menu */}
      {showQuickActions && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-10 backdrop-blur-sm"
            onClick={() => setShowQuickActions(false)}
          />
          
          {/* Menu dropdown */}
          <div 
            className="absolute right-0 top-full mt-2 z-50"
            style={{ minWidth: '200px' }}
          >
            <div 
              className="flex flex-col space-y-2 p-3 rounded-xl shadow-xl backdrop-blur-md border"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-border)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
              role="menu"
              aria-label="Quick actions menu"
            >
              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left"
                  style={{ 
                    backgroundColor: 'var(--color-secondary)',
                    color: 'var(--color-text-primary)',
                    animationDelay: `${index * 50}ms`,
                    minHeight: '40px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-tertiary)'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      action.onClick()
                    }
                  }}
                  role="menuitem"
                  tabIndex={0}
                  aria-label={action.label}
                >
                  <div className="flex-shrink-0">
                    {action.icon}
                  </div>
                  <span className="font-medium text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* FAB Button */}
      <button
        onClick={handleFABClick}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-105"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '40px',
          minHeight: '40px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleFABClick()
          }
          if (e.key === 'Escape' && showQuickActions) {
            setShowQuickActions(false)
          }
        }}
        aria-label="Quick actions menu"
        aria-expanded={showQuickActions}
        aria-haspopup="menu"
        tabIndex={0}
        role="button"
        title="Quick Actions"
      >
        <Plus 
          className={`w-5 h-5 transition-transform duration-300 ${
            showQuickActions ? 'rotate-45' : ''
          }`} 
        />
      </button>

      {/* Animations for menu items */}
      <style jsx>{`
        .quick-action-enter {
          animation: slideInFade 300ms ease-out forwards;
        }
        
        @keyframes slideInFade {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}