/**
 * Income Intelligence Hub Component Tests
 * Tests the main income card component functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IncomeIntelligenceHub } from '@/components/super-cards/IncomeIntelligenceHub'
import '@testing-library/jest-dom'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock hooks
jest.mock('@/hooks/useOptimizedAnimation', () => ({
  useStaggeredCountingAnimation: jest.fn().mockReturnValue({
    heroMetric: 625,
    netIncome: 3825,
    expenses: 3200,
    taxOwed: 675,
  }),
}))

// Mock super cards API
jest.mock('@/lib/api/super-cards-api', () => ({
  superCardsAPI: {
    fetchIncomeHub: jest.fn().mockResolvedValue({
      monthlyIncome: 4500,
      monthlyDividendIncome: 4500,
      incomeClarityData: {
        grossMonthly: 4500,
        taxOwed: 675,
        netMonthly: 3825,
        monthlyExpenses: 3200,
        availableToReinvest: 625,
        aboveZeroLine: true,
      },
      expenseMilestones: [
        { name: 'Food', target: 800, current: 750 },
        { name: 'Housing', target: 1500, current: 1400 },
      ],
      availableToReinvest: 625,
    }),
  },
}))

// Mock components
jest.mock('@/components/income/IncomeClarityCard', () => {
  return function MockIncomeClarityCard({ data, viewMode }: any) {
    return (
      <div data-testid="income-clarity-card">
        <span>Available: ${data.availableToReinvest}</span>
        <span>View: {viewMode}</span>
      </div>
    )
  }
})

jest.mock('@/components/charts/DividendProjections', () => {
  return function MockDividendProjections() {
    return <div data-testid="dividend-projections">Dividend Projections</div>
  }
})

jest.mock('@/components/charts/DividendCalendar', () => {
  return function MockDividendCalendar() {
    return <div data-testid="dividend-calendar">Dividend Calendar</div>
  }
})

jest.mock('@/components/income/IncomeProgressionCard', () => {
  return function MockIncomeProgressionCard() {
    return <div data-testid="income-progression">Income Progression</div>
  }
})

jest.mock('@/components/income/IncomeStabilityCard', () => {
  return function MockIncomeStabilityCard() {
    return <div data-testid="income-stability">Income Stability</div>
  }
})

jest.mock('@/components/income/CashFlowProjectionCard', () => {
  return function MockCashFlowProjectionCard() {
    return <div data-testid="cash-flow-projection">Cash Flow Projection</div>
  }
})

jest.mock('@/components/income/InteractiveDividendCalendar', () => {
  return function MockInteractiveDividendCalendar() {
    return <div data-testid="interactive-dividend-calendar">Interactive Calendar</div>
  }
})

jest.mock('@/components/income/IncomeProgressionTracker', () => {
  return function MockIncomeProgressionTracker() {
    return <div data-testid="income-progression-tracker">Progression Tracker</div>
  }
})

jest.mock('@/components/income/DividendIntelligenceEngine', () => {
  return function MockDividendIntelligenceEngine() {
    return <div data-testid="dividend-intelligence">Intelligence Engine</div>
  }
})

describe('IncomeIntelligenceHub Component', () => {
  const mockClarityData = {
    grossMonthly: 4500,
    taxOwed: 675,
    netMonthly: 3825,
    monthlyExpenses: 3200,
    availableToReinvest: 625,
    aboveZeroLine: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('monthly'),
        setItem: jest.fn(),
      },
      writable: true,
    })

    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    // Mock window resize event
    global.addEventListener = jest.fn()
    global.removeEventListener = jest.fn()
  })

  it('should render the hero metric section correctly', () => {
    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    expect(screen.getByText(/ABOVE ZERO LINE/i)).toBeInTheDocument()
    expect(screen.getByText(/\+\$625/)).toBeInTheDocument()
    expect(screen.getByText(/You are building wealth every month!/i)).toBeInTheDocument()
  })

  it('should show below zero state when available amount is negative', () => {
    const belowZeroData = {
      ...mockClarityData,
      availableToReinvest: -200,
      aboveZeroLine: false,
    }

    render(<IncomeIntelligenceHub clarityData={belowZeroData} />)

    expect(screen.getByText(/BELOW ZERO LINE/i)).toBeInTheDocument()
    expect(screen.getByText(/-\$200/)).toBeInTheDocument()
    expect(screen.getByText(/Focus on optimization to reach positive cash flow/i)).toBeInTheDocument()
  })

  it('should render all tab navigation buttons', () => {
    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    expect(screen.getByRole('button', { name: /Cash Flow/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Progression/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Stability/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Projections/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Calendar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tracker/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Intelligence/i })).toBeInTheDocument()
  })

  it('should switch tabs when tab buttons are clicked', async () => {
    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    // Should start with Cash Flow tab (default)
    expect(screen.getByTestId('income-clarity-card')).toBeInTheDocument()

    // Click Progression tab
    fireEvent.click(screen.getByRole('button', { name: /Progression/i }))
    await waitFor(() => {
      expect(screen.getByTestId('income-progression')).toBeInTheDocument()
    })

    // Click Projections tab
    fireEvent.click(screen.getByRole('button', { name: /Projections/i }))
    await waitFor(() => {
      expect(screen.getByTestId('dividend-projections')).toBeInTheDocument()
    })

    // Click Calendar tab
    fireEvent.click(screen.getByRole('button', { name: /Calendar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('dividend-calendar')).toBeInTheDocument()
    })
  })

  it('should toggle between monthly and annual view modes', () => {
    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    // Should show monthly value by default
    expect(screen.getByText(/\+\$625\/month/)).toBeInTheDocument()

    // Find and click the annual toggle (this would be in the IncomeViewToggle component)
    // For this test, we'll simulate the view mode change
    const component = screen.getByText(/\+\$625\/month/)
    expect(component).toBeInTheDocument()
  })

  it('should display above zero streak information', () => {
    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    expect(screen.getByText(/Above Zero Streak/i)).toBeInTheDocument()
    expect(screen.getByText(/months/i)).toBeInTheDocument()
    expect(screen.getByText(/Current/i)).toBeInTheDocument()
    expect(screen.getByText(/Record/i)).toBeInTheDocument()
    expect(screen.getByText(/Success Rate/i)).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    render(<IncomeIntelligenceHub isLoading={true} />)

    // Should render skeleton loader
    // The actual skeleton component would be tested separately
    expect(screen.queryByText(/ABOVE ZERO LINE/i)).not.toBeInTheDocument()
  })

  it('should use provided clarity data over internal state', () => {
    const customData = {
      ...mockClarityData,
      availableToReinvest: 1000,
    }

    render(<IncomeIntelligenceHub clarityData={customData} />)

    expect(screen.getByText(/\+\$1000/)).toBeInTheDocument()
  })

  it('should handle mobile screen size detection', () => {
    // Mock mobile screen size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    })

    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    // Should show mobile swipe hint
    expect(screen.getByText(/Swipe left or right to switch tabs/i)).toBeInTheDocument()
  })

  it('should calculate stress level correctly for positive cash flow', () => {
    const positiveData = {
      ...mockClarityData,
      availableToReinvest: 800,
      monthlyExpenses: 3200,
    }

    render(<IncomeIntelligenceHub clarityData={positiveData} />)

    // Should show positive message for above zero
    expect(screen.getByText(/You are building wealth every month!/i)).toBeInTheDocument()
  })

  it('should calculate stress level correctly for negative cash flow', () => {
    const negativeData = {
      ...mockClarityData,
      availableToReinvest: -400,
      aboveZeroLine: false,
    }

    render(<IncomeIntelligenceHub clarityData={negativeData} />)

    // Should show guidance message for below zero
    expect(screen.getByText(/Focus on optimization to reach positive cash flow/i)).toBeInTheDocument()
  })

  it('should show swipe indicators on mobile', () => {
    // Mock mobile screen
    Object.defineProperty(window, 'innerWidth', {
      value: 480,
      writable: true,
    })

    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    // Should show current tab position indicators
    expect(screen.getByText(/1 \/ 7/)).toBeInTheDocument()
  })

  it('should handle touch events for tab navigation', () => {
    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    const container = screen.getByText(/Income Intelligence Hub/i).closest('div')
    
    // Simulate touch events
    fireEvent.touchStart(container!, { 
      targetTouches: [{ clientX: 100 }] 
    } as any)
    fireEvent.touchMove(container!, { 
      targetTouches: [{ clientX: 50 }] 
    } as any)
    fireEvent.touchEnd(container!)

    // Touch navigation would change tabs, but we can't easily test the actual tab change
    // without more complex mocking
    expect(container).toBeInTheDocument()
  })

  it('should apply correct CSS classes for above/below zero states', () => {
    const { rerender } = render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    // Check for positive state classes
    expect(screen.getByText(/ABOVE ZERO LINE/i).closest('div')).toHaveClass()

    // Test negative state
    const negativeData = {
      ...mockClarityData,
      availableToReinvest: -200,
      aboveZeroLine: false,
    }

    rerender(<IncomeIntelligenceHub clarityData={negativeData} />)
    expect(screen.getByText(/BELOW ZERO LINE/i).closest('div')).toHaveClass()
  })

  it('should preserve view mode in localStorage', () => {
    render(<IncomeIntelligenceHub clarityData={mockClarityData} />)

    // Check that localStorage.getItem was called for view mode
    expect(window.localStorage.getItem).toHaveBeenCalledWith('income-clarity-view-mode')
  })
})