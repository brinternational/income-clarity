'use client'

/**
 * Interactive Tutorial - Guided tour of Super Cards and key features
 * Implements ONBOARD-003: Interactive Tutorial using guided tour
 * 
 * Shows users around the dashboard with contextual tips and highlights
 */

import { useState, useEffect } from 'react'
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  DollarSign,
  PieChart,
  Zap,
  BookOpen,
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  content: string
  target?: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  highlight?: string
  action?: string
  celebrate?: boolean
  skipable?: boolean
}

interface TutorialProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  variant?: 'first-time' | 'feature-discovery' | 'quick-tour'
}

const tutorialSteps: Record<string, TutorialStep[]> = {
  'first-time': [
    {
      id: 'welcome',
      title: '🎉 Welcome to Income Clarity!',
      content: 'Let\'s take a quick tour of your new dividend tracking dashboard. This will only take 2 minutes.',
      position: 'center',
      action: 'Start Tour'
    },
    {
      id: 'performance-hub',
      title: '📈 Performance Hub',
      content: 'This is your Performance Hub - see how your portfolio compares to SPY every day. The key metric is whether you\'re above or below the SPY line.',
      target: '.performance-hub',
      position: 'bottom',
      highlight: '.spy-comparison',
      action: 'Next'
    },
    {
      id: 'income-clarity',
      title: '💰 Income Intelligence',
      content: 'Your Income Intelligence Hub shows exactly how much dividend income you receive after taxes. This is what really matters for covering expenses.',
      target: '.income-hub',
      position: 'top',
      highlight: '.net-income',
      action: 'Next'
    },
    {
      id: 'zero-line',
      title: '🎯 The Zero Line Goal',
      content: 'The most important metric: when your dividend income covers 100% of your expenses. This is your path to financial freedom!',
      target: '.lifestyle-hub',
      position: 'left',
      highlight: '.above-zero-line',
      celebrate: true,
      action: 'Next'
    },
    {
      id: 'strategy-optimization',
      title: '🧠 Strategy Intelligence',
      content: 'Get personalized recommendations to optimize your portfolio based on your location, risk tolerance, and goals.',
      target: '.strategy-hub',
      position: 'right',
      highlight: '.optimization-score',
      action: 'Next'
    },
    {
      id: 'quick-actions',
      title: '⚡ Quick Actions',
      content: 'Add holdings, update expenses, or make portfolio changes quickly with smart defaults based on your profile.',
      target: '.quick-actions',
      position: 'top',
      action: 'Next'
    },
    {
      id: 'complete',
      title: '🚀 You\'re All Set!',
      content: 'You now know the essentials of Income Clarity. Start adding your holdings and track your progress toward the zero line!',
      position: 'center',
      celebrate: true,
      action: 'Get Started'
    }
  ],
  'feature-discovery': [
    {
      id: 'super-cards',
      title: '⭐ Super Cards Overview',
      content: 'These 5 Super Cards give you complete clarity on your dividend portfolio at a glance.',
      position: 'center',
      action: 'Explore Features'
    },
    {
      id: 'tax-intelligence',
      title: '🧠 Tax Intelligence Engine',
      content: 'See your exact tax impact by location and get personalized optimization strategies. This can save you thousands annually.',
      target: '.tax-intelligence',
      position: 'bottom',
      highlight: '.tax-savings',
      action: 'Next'
    },
    {
      id: 'performance-tracking',
      title: '📊 Advanced Performance',
      content: 'Track individual holding performance vs SPY. Green holdings are winners, red holdings need attention.',
      target: '.holdings-performance',
      position: 'left',
      highlight: '.individual-performance',
      action: 'Next'
    },
    {
      id: 'dividend-calendar',
      title: '📅 Dividend Intelligence',
      content: 'Never miss a dividend payment again. See upcoming payments, ex-dates, and seasonal patterns.',
      target: '.dividend-calendar',
      position: 'right',
      highlight: '.upcoming-dividends',
      action: 'Next'
    },
    {
      id: 'complete',
      title: '💎 Advanced User!',
      content: 'You\'ve discovered the advanced features that set Income Clarity apart. Use these tools to optimize your dividend strategy.',
      position: 'center',
      celebrate: true,
      action: 'Continue'
    }
  ],
  'quick-tour': [
    {
      id: 'overview',
      title: '⚡ Quick Overview',
      content: 'Here\'s a 30-second tour of the key features you\'ll use most.',
      position: 'center',
      action: 'Quick Tour'
    },
    {
      id: 'main-metrics',
      title: '📊 Key Metrics',
      content: 'Focus on these three numbers: Portfolio Value, Monthly Income, and Expense Coverage ratio.',
      target: '.key-metrics',
      position: 'bottom',
      highlight: '.coverage-ratio',
      action: 'Next'
    },
    {
      id: 'add-holdings',
      title: '➕ Add Holdings',
      content: 'Click here to add your dividend stocks and ETFs. Supports CSV import, manual entry, or screenshots.',
      target: '.add-holdings-btn',
      position: 'left',
      highlight: '.add-holdings-btn',
      action: 'Got It'
    },
    {
      id: 'complete',
      title: '✅ Ready to Go!',
      content: 'That\'s all you need to get started. Add some holdings and watch your progress!',
      position: 'center',
      action: 'Start Adding'
    }
  ]
}

export default function InteractiveTutorial({ 
  isOpen, 
  onClose, 
  onComplete, 
  variant = 'first-time' 
}: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [highlightElement, setHighlightElement] = useState<Element | null>(null)
  
  const steps = tutorialSteps[variant]

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCurrentStep(0)
      // Prevent body scroll during tutorial
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      // Restore body scroll
      document.body.style.overflow = 'auto'
      clearHighlight()
    }

    return () => {
      document.body.style.overflow = 'auto'
      clearHighlight()
    }
  }, [isOpen])

  useEffect(() => {
    if (isVisible && currentStep < steps.length) {
      const step = steps[currentStep]
      if (step.target || step.highlight) {
        highlightTarget(step.target || step.highlight)
      } else {
        clearHighlight()
      }
    }
  }, [currentStep, isVisible, steps])

  const highlightTarget = (selector?: string) => {
    clearHighlight()
    
    if (selector) {
      const element = document.querySelector(selector)
      if (element) {
        setHighlightElement(element)
        element.classList.add('tutorial-highlight')
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        })
      }
    }
  }

  const clearHighlight = () => {
    if (highlightElement) {
      highlightElement.classList.remove('tutorial-highlight')
      setHighlightElement(null)
    }
    
    // Clear all highlights in case of multiple elements
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight')
    })
  }

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const handleComplete = () => {
    onComplete()
    onClose()
  }

  const getTooltipPosition = (step: TutorialStep) => {
    if (step.position === 'center') return 'center'
    
    if (step.target && highlightElement) {
      const rect = highlightElement.getBoundingClientRect()
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      // Auto-adjust position based on element location
      if (rect.top > viewport.height / 2) {
        return 'top'
      } else {
        return 'bottom'
      }
    }

    return step.position
  }

  const getTooltipStyle = (step: TutorialStep) => {
    if (step.position === 'center' || !highlightElement) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60
      }
    }

    const rect = highlightElement.getBoundingClientRect()
    const position = getTooltipPosition(step)
    
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 60
    }

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          bottom: window.innerHeight - rect.top + 10,
          left: Math.max(20, rect.left + rect.width / 2),
          transform: 'translateX(-50%)'
        }
      case 'bottom':
        return {
          ...baseStyle,
          top: rect.bottom + 10,
          left: Math.max(20, rect.left + rect.width / 2),
          transform: 'translateX(-50%)'
        }
      case 'left':
        return {
          ...baseStyle,
          top: rect.top + rect.height / 2,
          right: window.innerWidth - rect.left + 10,
          transform: 'translateY(-50%)'
        }
      case 'right':
        return {
          ...baseStyle,
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
          transform: 'translateY(-50%)'
        }
      default:
        return {
          ...baseStyle,
          top: rect.bottom + 10,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        }
    }
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]

  return (
    <>
      {/* Tutorial Styles */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative !important;
          z-index: 55 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2) !important;
          border-radius: 8px !important;
          animation: tutorial-pulse 2s ease-in-out infinite !important;
        }
        
        @keyframes tutorial-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.7), 0 0 0 12px rgba(59, 130, 246, 0.3); }
        }

        .tutorial-overlay {
          pointer-events: auto !important;
        }

        .tutorial-tooltip {
          pointer-events: auto !important;
        }
      `}</style>

      {/* Overlay */}
      <div 
        className="tutorial-overlay fixed inset-0 bg-black bg-opacity-70 z-50"
        onClick={currentStepData.skipable !== false ? handleSkip : undefined}
      />

      {/* Tutorial Tooltip */}
      <div 
        className="tutorial-tooltip bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
        style={getTooltipStyle(currentStepData)}
      >
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="mb-6">
          {currentStepData.celebrate && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
          )}
          
          <h3 className="text-xl font-bold text-gray-900 mb-3 pr-8">
            {currentStepData.title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.content}
          </p>

          {/* Feature highlights for certain steps */}
          {currentStep === 2 && variant === 'first-time' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Pro Tip:</p>
                  <p className="text-sm text-green-700">
                    Watch for the "Above Zero Line" indicator - that's your financial freedom milestone!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>
            )}
            
            {currentStepData.skipable !== false && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip Tour
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
              currentStepData.celebrate 
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-md'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {currentStep === steps.length - 1 ? (
              <>
                {currentStepData.action || 'Complete Tour'}
                {currentStepData.celebrate && <Sparkles className="w-4 h-4 ml-2" />}
              </>
            ) : (
              <>
                {currentStepData.action || 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tutorial Hints for key elements */}
      {currentStep === 1 && variant === 'first-time' && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-60 animate-bounce">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Above SPY = 🟢 Good performance!</span>
          </div>
        </div>
      )}

      {currentStep === 2 && variant === 'first-time' && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-60 animate-bounce">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">After-tax income is what matters!</span>
          </div>
        </div>
      )}
    </>
  )
}

// Tutorial hook for managing state
export function useTutorial(defaultVariant: 'first-time' | 'feature-discovery' | 'quick-tour' = 'first-time') {
  const [isOpen, setIsOpen] = useState(false)
  const [variant, setVariant] = useState(defaultVariant)

  const startTutorial = (tutorialVariant?: typeof defaultVariant) => {
    if (tutorialVariant) {
      setVariant(tutorialVariant)
    }
    setIsOpen(true)
  }

  const closeTutorial = () => {
    setIsOpen(false)
  }

  const completeTutorial = () => {
    // Mark tutorial as completed
    localStorage.setItem(`tutorial-${variant}-completed`, 'true')
    setIsOpen(false)
  }

  const shouldShowTutorial = (tutorialVariant: typeof defaultVariant): boolean => {
    return !localStorage.getItem(`tutorial-${tutorialVariant}-completed`)
  }

  return {
    isOpen,
    variant,
    startTutorial,
    closeTutorial,
    completeTutorial,
    shouldShowTutorial
  }
}

// Tutorial trigger component for dashboard
interface TutorialTriggerProps {
  variant?: 'first-time' | 'feature-discovery' | 'quick-tour'
  className?: string
  children?: React.ReactNode
}

export function TutorialTrigger({ 
  variant = 'quick-tour', 
  className = '',
  children 
}: TutorialTriggerProps) {
  const { startTutorial } = useTutorial()

  return (
    <button
      onClick={() => startTutorial(variant)}
      className={`flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${className}`}
    >
      <BookOpen className="w-4 h-4" />
      <span>{children || 'Take Tutorial'}</span>
    </button>
  )
}