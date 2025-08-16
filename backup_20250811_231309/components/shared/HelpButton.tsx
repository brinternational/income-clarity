'use client'

import { useState, useRef, useEffect } from 'react'
import { HelpCircle, X, ExternalLink } from 'lucide-react'

interface HelpButtonProps {
  title: string
  content: string
  size?: 'sm' | 'md' | 'lg'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
  helpUrl?: string
  learnMoreText?: string
}

export default function HelpButton({
  title,
  content,
  size = 'sm',
  position = 'top-right',
  className = '',
  helpUrl,
  learnMoreText = 'Learn More'
}: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState(position)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Size variants
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Tooltip positioning
  const positionClasses = {
    'top-right': 'bottom-full mb-2 right-0',
    'top-left': 'bottom-full mb-2 left-0',
    'bottom-right': 'top-full mt-2 right-0',
    'bottom-left': 'top-full mt-2 left-0'
  }

  // Auto-adjust tooltip position based on viewport
  useEffect(() => {
    if (isOpen && tooltipRef.current && buttonRef.current) {
      const tooltip = tooltipRef.current
      const button = buttonRef.current
      const rect = tooltip.getBoundingClientRect()
      const buttonRect = button.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      let newPosition = position

      // Check if tooltip goes off-screen and adjust
      if (position.includes('top') && buttonRect.top - rect.height < 0) {
        newPosition = position.replace('top', 'bottom') as typeof position
      } else if (position.includes('bottom') && buttonRect.bottom + rect.height > viewport.height) {
        newPosition = position.replace('bottom', 'top') as typeof position
      }

      if (position.includes('right') && buttonRect.right + rect.width > viewport.width) {
        newPosition = newPosition.replace('right', 'left') as typeof position
      } else if (position.includes('left') && buttonRect.left - rect.width < 0) {
        newPosition = newPosition.replace('left', 'right') as typeof position
      }

      if (newPosition !== tooltipPosition) {
        setTooltipPosition(newPosition)
      }
    }
  }, [isOpen, position, tooltipPosition])

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        tooltipRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Help Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]}
          rounded-full
          transition-all duration-200
          flex items-center justify-center
          hover:scale-110
          focus:outline-none focus:ring-2 focus:ring-offset-1
          focus:ring-blue-500
        `}
        style={{
          backgroundColor: 'var(--color-accent, #3b82f6)',
          color: 'white'
        }}
        aria-label={`Get help about ${title}`}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? 'help-tooltip' : undefined}
        type="button"
      >
        <HelpCircle className={`${sizeClasses[size]} p-0.5`} />
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div
          ref={tooltipRef}
          id="help-tooltip"
          className={`
            absolute z-50 w-72 p-4 rounded-lg shadow-2xl border
            ${positionClasses[tooltipPosition]}
            animate-in fade-in zoom-in-95 duration-150
          `}
          style={{
            backgroundColor: 'var(--color-primary, white)',
            borderColor: 'var(--color-border, #e5e7eb)',
            color: 'var(--color-text, #1f2937)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
          role="tooltip"
          onKeyDown={handleKeyDown}
        >
          {/* Arrow */}
          <div 
            className={`
              absolute w-3 h-3 border transform rotate-45
              ${tooltipPosition.includes('top') ? 'bottom-[-6px]' : 'top-[-6px]'}
              ${tooltipPosition.includes('left') ? 'left-4' : 'right-4'}
            `}
            style={{
              backgroundColor: 'var(--color-primary, white)',
              borderColor: 'var(--color-border, #e5e7eb)',
              borderBottomColor: tooltipPosition.includes('top') ? 'var(--color-border, #e5e7eb)' : 'transparent',
              borderRightColor: tooltipPosition.includes('top') ? 'var(--color-border, #e5e7eb)' : 'transparent',
              borderTopColor: tooltipPosition.includes('bottom') ? 'var(--color-border, #e5e7eb)' : 'transparent',
              borderLeftColor: tooltipPosition.includes('bottom') ? 'var(--color-border, #e5e7eb)' : 'transparent'
            }}
          />

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close help tooltip"
          >
            <X className="w-3 h-3" style={{ color: 'var(--color-text-secondary, #6b7280)' }} />
          </button>

          {/* Content */}
          <div className="pr-6">
            <h4 
              className="font-semibold text-sm mb-2"
              style={{ color: 'var(--color-text-primary, #111827)' }}
            >
              {title}
            </h4>
            <p 
              className="text-xs leading-relaxed mb-3"
              style={{ color: 'var(--color-text-secondary, #6b7280)' }}
            >
              {content}
            </p>

            {/* Learn More Link */}
            {helpUrl && (
              <a
                href={helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
                style={{ color: 'var(--color-accent, #3b82f6)' }}
              >
                {learnMoreText}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Predefined help content for strategic cards
export const helpContent = {
  incomeClarityCard: {
    title: "Income Clarity Card",
    content: "This enhanced card shows your dividend income clarity with above/below zero tracking, tax breakdowns, and waterfall animations that visualize your money flow from gross income to reinvestment potential.",
    helpUrl: "#income-clarity-help"
  },
  incomeStabilityCard: {
    title: "Income Stability Tracker",
    content: "Monitor the consistency and reliability of your dividend income streams. This card analyzes volatility, payment frequency, and provides a stability score to help you understand income predictability.",
    helpUrl: "#income-stability-help"
  },
  fireProgressCard: {
    title: "FIRE Progress Tracker", 
    content: "Track your Financial Independence, Retire Early (FIRE) progress. See how close you are to covering your monthly expenses with dividend income alone, including projections and milestone tracking.",
    helpUrl: "#fire-progress-help"
  },
  cashFlowProjectionCard: {
    title: "Cash Flow Projections",
    content: "Forecast your future dividend income based on current holdings, historical growth rates, and reinvestment strategies. Includes scenario planning and growth rate assumptions.",
    helpUrl: "#cash-flow-projection-help"
  },
  incomeProgressionCard: {
    title: "Income Progression Analytics",
    content: "Analyze how your dividend income has grown over time with trend analysis, growth rate calculations, and identification of the best performing periods in your investment journey.",
    helpUrl: "#income-progression-help"
  },
  rebalancingSuggestions: {
    title: "Smart Rebalancing",
    content: "Get AI-powered suggestions for portfolio rebalancing to optimize your dividend income and risk profile. Includes sector allocation recommendations and tax-efficient rebalancing strategies.",
    helpUrl: "#rebalancing-help"
  },
  strategyComparisonEngine: {
    title: "Strategy Comparison Engine",
    content: "Compare different income strategies: 4% Rule withdrawal, Covered Call premiums, and Dividend Income approaches. Interactive calculator with visual comparisons and tax efficiency analysis.",
    helpUrl: "#strategy-comparison-help"
  },
  taxSavingsCalculatorCard: {
    title: "Tax Optimization Calculator",
    content: "Calculate potential tax savings through strategic dividend investing. Optimize qualified dividend percentages, tax-loss harvesting opportunities, and location-based tax efficiency.",
    helpUrl: "#tax-optimization-help"
  },
  strategyHealthCard: {
    title: "Strategy Health Monitor",
    content: "Monitor the overall health of your dividend strategy with key metrics like yield sustainability, payout ratio trends, dividend growth consistency, and portfolio diversification scores.",
    helpUrl: "#strategy-health-help"
  }
}