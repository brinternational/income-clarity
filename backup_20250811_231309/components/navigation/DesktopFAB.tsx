'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Receipt, DollarSign, StickyNote, Upload } from 'lucide-react'

interface DesktopFABProps {
  onAddClick?: () => void
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

export default function DesktopFAB({ onAddClick }: DesktopFABProps) {
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Quick actions for desktop FAB menu - Material Design compliant
  const quickActions: QuickAction[] = [
    {
      id: 'add-holding',
      label: 'Add Holding',
      icon: <TrendingUp className="w-5 h-5" />,
      onClick: () => {
        setShowQuickActions(false)
        onAddClick?.()
      }
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: <Receipt className="w-5 h-5" />,
      onClick: () => {
        setShowQuickActions(false)
        onAddClick?.()
      }
    },
    {
      id: 'add-income',
      label: 'Add Income',
      icon: <DollarSign className="w-5 h-5" />,
      onClick: () => {
        setShowQuickActions(false)
        onAddClick?.()
      }
    },
    {
      id: 'quick-note',
      label: 'Quick Note',
      icon: <StickyNote className="w-5 h-5" />,
      onClick: () => {
        setShowQuickActions(false)
        onAddClick?.()
      }
    },
    {
      id: 'import-data',
      label: 'Import Data',
      icon: <Upload className="w-5 h-5" />,
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
      const target = event.target as Element
      if (!target.closest('.desktop-fab-container')) {
        setShowQuickActions(false)
      }
    }

    if (showQuickActions) {
      document.addEventListener('click', handleOutsideClick)
      return () => document.removeEventListener('click', handleOutsideClick)
    }
  }, [showQuickActions])

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showQuickActions) {
        setShowQuickActions(false)
      }
    }

    if (showQuickActions) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showQuickActions])

  return (
    <>
      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-sm hidden lg:block" />
      )}

      {/* Desktop FAB - Bottom Right */}
      <div className="desktop-fab-container fixed bottom-6 right-6 z-50 hidden lg:block">
        {/* Quick Actions Menu - Desktop */}
        {showQuickActions && (
          <div className="absolute bottom-full right-0 mb-4">
            <div 
              className="flex flex-col space-y-2 p-4 rounded-2xl shadow-xl backdrop-blur-md border"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-border)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)'
              }}
              role="menu"
              aria-label="Quick actions menu"
            >
              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 min-w-[200px]"
                  style={{ 
                    backgroundColor: 'var(--color-secondary)',
                    color: 'var(--color-text-primary)',
                    animationDelay: `${index * 80}ms`,
                    animation: 'slideInRight 350ms ease-out forwards',
                    minHeight: '48px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-tertiary)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
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
                  <span className="font-medium text-left">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop FAB Button */}
        <button
          onClick={handleFABClick}
          className="flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            minWidth: '56px',
            minHeight: '56px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
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
        >
          <Plus 
            className={`w-8 h-8 transition-transform duration-300 ${
              showQuickActions ? 'rotate-45' : ''
            }`} 
          />
        </button>
      </div>

      {/* Add CSS for desktop animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .desktop-fab-container button:active {
          transform: scale(0.95) !important;
        }
        
        .desktop-fab-container button:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
        
        /* Enhanced backdrop blur for desktop */
        @supports (backdrop-filter: blur(20px)) {
          .desktop-quick-actions-menu {
            backdrop-filter: blur(20px);
          }
        }
      `}</style>
    </>
  )
}