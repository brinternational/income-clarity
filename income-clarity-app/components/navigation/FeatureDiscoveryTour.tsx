'use client'

import { useState, useEffect } from 'react'
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride'

interface FeatureDiscoveryTourProps {
  autoStart?: boolean
  onComplete?: () => void
  onSkip?: () => void
}

export default function FeatureDiscoveryTour({
  autoStart = true,
  onComplete,
  onSkip
}: FeatureDiscoveryTourProps) {
  const [runTour, setRunTour] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Define the tour steps for all 8 strategic cards
  const steps: Step[] = [
    {
      target: '[data-tour="income-clarity-card"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Welcome to Income Clarity!</h3>
          <p className="text-sm mb-3">
            This enhanced card shows your dividend income clarity with above/below zero tracking, 
            tax breakdowns, and waterfall animations to visualize your money flow.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✨ New Feature</span>
            <span>Enhanced with animations & insights</span>
          </div>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="income-stability-card"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Income Stability Tracker</h3>
          <p className="text-sm mb-3">
            Monitor the consistency and reliability of your dividend income streams. 
            Get insights into which holdings provide the most stable income.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✨ New Feature</span>
            <span>Dashboard integration complete</span>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="fire-progress-card"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">FIRE Progress Tracker</h3>
          <p className="text-sm mb-3">
            Track your Financial Independence, Retire Early (FIRE) progress. 
            See how close you are to covering your expenses with dividend income.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">📊 Income Tab</span>
            <span>Strategic planning tool</span>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="cash-flow-projection-card"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Cash Flow Projections</h3>
          <p className="text-sm mb-3">
            Forecast your future dividend income based on current holdings, 
            growth rates, and reinvestment strategies.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">📊 Income Tab</span>
            <span>Future income planning</span>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="income-progression-card"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Income Progression Analytics</h3>
          <p className="text-sm mb-3">
            Analyze how your dividend income has grown over time and identify 
            trends to optimize your investment strategy.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">📊 Income Tab</span>
            <span>Growth analysis tool</span>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="rebalancing-suggestions"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Smart Rebalancing</h3>
          <p className="text-sm mb-3">
            Get intelligent suggestions for portfolio rebalancing to optimize 
            your dividend income and risk profile.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">🏦 Portfolio Tab</span>
            <span>AI-powered recommendations</span>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="strategy-comparison-engine"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Strategy Comparison Engine</h3>
          <p className="text-sm mb-3">
            Compare different income strategies: 4% Rule, Covered Calls, and 
            Dividend Income. Interactive calculator with visual comparisons.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">🧠 Strategy Tab</span>
            <span>Interactive comparison tool</span>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="tax-savings-calculator-card"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Tax Optimization Calculator</h3>
          <p className="text-sm mb-3">
            Calculate potential tax savings through strategic dividend investing. 
            Optimize your tax efficiency with qualified dividends.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">🧠 Strategy Tab</span>
            <span>Tax optimization tool</span>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="strategy-health-card"]',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Strategy Health Monitor</h3>
          <p className="text-sm mb-3">
            Monitor the overall health of your dividend strategy with key 
            metrics and alerts for potential improvements.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">🧠 Strategy Tab</span>
            <span>Health monitoring system</span>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.bottom-navigation, .desktop-navigation',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">🎉 Tour Complete!</h3>
          <p className="text-sm mb-3">
            You've discovered all 8 new strategic features! Notice the badges on tabs 
            that show you where to find new features. They'll disappear as you explore.
          </p>
          <div className="text-xs text-gray-600">
            <p>💡 <strong>Tip:</strong> You can restart this tour anytime from Settings → Help</p>
          </div>
        </div>
      ),
      placement: 'top',
    },
  ]

  // Check if user has completed tour before
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('income-clarity-tour-completed')
    const shouldRunTour = autoStart && !hasCompletedTour

    if (shouldRunTour) {
      // Small delay to ensure components are mounted
      const timer = setTimeout(() => {
        setRunTour(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [autoStart])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false)
      
      // Mark tour as completed
      localStorage.setItem('income-clarity-tour-completed', 'true')
      localStorage.setItem('income-clarity-tour-completed-at', new Date().toISOString())
      
      if (status === STATUS.FINISHED) {
        onComplete?.()
      } else if (status === STATUS.SKIPPED) {
        onSkip?.()
      }
    } else if (type === EVENTS.STEP_AFTER) {
      setStepIndex(index + (action === 'prev' ? -1 : 1))
    }
  }

  const restartTour = () => {
    localStorage.removeItem('income-clarity-tour-completed')
    setStepIndex(0)
    setRunTour(true)
  }

  const skipTour = () => {
    setRunTour(false)
    localStorage.setItem('income-clarity-tour-completed', 'true')
    localStorage.setItem('income-clarity-tour-skipped-at', new Date().toISOString())
    onSkip?.()
  }

  if (!runTour) return null

  return (
    <>
      <Joyride
        steps={steps}
        run={runTour}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        scrollDuration={300}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: 'var(--color-accent, #3b82f6)',
            textColor: 'var(--color-text, #1f2937)',
            backgroundColor: 'var(--color-card, #ffffff)',
            borderRadius: 8,
            arrowColor: 'var(--color-card, #ffffff)',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
          },
          tooltip: {
            borderRadius: 8,
            padding: 0,
            fontSize: '14px',
          },
          tooltipContainer: {
            maxWidth: '400px',
          },
          tooltipTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '8px',
          },
          buttonNext: {
            backgroundColor: 'var(--color-accent, #3b82f6)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          buttonBack: {
            color: 'var(--color-text-secondary, #6b7280)',
            fontSize: '14px',
            marginRight: '8px',
          },
          buttonSkip: {
            color: 'var(--color-text-secondary, #6b7280)',
            fontSize: '14px',
          },
          progress: {
            backgroundColor: 'var(--color-accent, #3b82f6)',
          },
          beacon: {
            backgroundColor: 'var(--color-accent, #3b82f6)',
            border: '2px solid var(--color-card, #ffffff)',
          },
          beaconInner: {
            backgroundColor: 'var(--color-accent, #3b82f6)',
          },
          spotlight: {
            borderRadius: 8,
            border: '4px solid var(--color-accent, #3b82f6)',
          },
        }}
        locale={{
          back: '← Back',
          close: 'Close',
          last: '🎉 Complete Tour',
          next: 'Next →',
          skip: 'Skip Tour',
        }}
      />

      {/* Tour Control Button - Hidden by default, can be triggered from settings */}
      <button
        onClick={restartTour}
        className="hidden"
        id="restart-feature-tour"
        aria-label="Restart feature discovery tour"
      >
        Restart Tour
      </button>
    </>
  )
}

// Export utility functions for external control
export const tourUtils = {
  restartTour: () => {
    localStorage.removeItem('income-clarity-tour-completed')
    const button = document.getElementById('restart-feature-tour')
    button?.click()
  },
  
  hasCompletedTour: () => {
    return !!localStorage.getItem('income-clarity-tour-completed')
  },
  
  getTourCompletionDate: () => {
    return localStorage.getItem('income-clarity-tour-completed-at')
  },
  
  resetTourState: () => {
    localStorage.removeItem('income-clarity-tour-completed')
    localStorage.removeItem('income-clarity-tour-completed-at')
    localStorage.removeItem('income-clarity-tour-skipped-at')
  }
}