'use client'

import { useState } from 'react'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { ExpenseProvider } from '@/contexts/ExpenseContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { DataPersistenceProvider } from '@/contexts/DataPersistenceContext'
import { SuperCardProvider } from '@/components/super-cards/SuperCardProvider'
import { SPYComparison } from '@/components/dashboard/SPYComparison'
import { IncomeClarityCard } from '@/components/dashboard/IncomeClarityCard'
import { ExpenseMilestones } from '@/components/dashboard/ExpenseMilestones'
import { HoldingsPerformance } from '@/components/dashboard/HoldingsPerformance'
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview'
import { MarginIntelligence } from '@/components/dashboard/MarginIntelligence'
import { DividendCalendar } from '@/components/dashboard/DividendCalendar'
import { TaxPlanning } from '@/components/dashboard/TaxPlanning'
import { YTDIncomeAccumulator } from '@/components/income/YTDIncomeAccumulator'
import { TaxBillCalculator } from '@/components/income/TaxBillCalculator'
import { CashFlowIntelligence } from '@/components/intelligence/CashFlowIntelligence'
import IncomeStabilityCard from '@/components/income/IncomeStabilityCard'
import toast, { Toaster } from 'react-hot-toast'
import { MigrationBanner } from '@/components/migration/MigrationBanner'
import { AppShell } from '@/components/AppShell'

// Demo data
const mockData = {
  spyComparison: {
    portfolioReturn: 8.2,
    spyReturn: 6.1,
    outperformance: 2.1
  },
  timePeriodData: {
    '1M': { portfolioReturn: 0.032, spyReturn: 0.021, outperformance: 0.011 },
    '3M': { portfolioReturn: 0.085, spyReturn: 0.067, outperformance: 0.018 },
    '6M': { portfolioReturn: 0.145, spyReturn: 0.098, outperformance: 0.047 },
    '1Y': { portfolioReturn: 0.082, spyReturn: 0.061, outperformance: 0.021 }
  },
  incomeClarityData: {
    grossMonthly: 4500,
    taxOwed: 675,
    netMonthly: 3825,
    monthlyExpenses: 3200,
    availableToReinvest: 625,
    aboveZeroLine: true
  },
  expenseMilestones: [
    { id: '1', name: 'Utilities', amount: 300, covered: true, percentageCovered: 100, monthlyIncomeNeeded: 300 },
    { id: '2', name: 'Insurance', amount: 600, covered: true, percentageCovered: 100, monthlyIncomeNeeded: 600 },
    { id: '3', name: 'Food', amount: 800, covered: true, percentageCovered: 100, monthlyIncomeNeeded: 800 },
    { id: '4', name: 'Rent', amount: 1500, covered: true, percentageCovered: 100, monthlyIncomeNeeded: 1500 },
    { id: '5', name: 'Entertainment', amount: 500, covered: false, percentageCovered: 0, monthlyIncomeNeeded: 500 }
  ],
  totalCoverage: 80
}

function DemoDashboardContent() {
  const [showSettings, setShowSettings] = useState(false)

  const handleSettingsClick = () => setShowSettings(true)
  const handleLogout = () => window.location.href = '/auth' + '/login'
  const handleAddClick = () => setShowSettings(true)

  return (
    <AppShell
      title="Income Clarity (Demo)"
      onSettingsClick={handleSettingsClick}
      onLogout={handleLogout}
      onAddClick={handleAddClick}
    >
      <div className="min-h-screen transition-all duration-300" style={{ backgroundColor: 'var(--color-secondary)' }}>
        {/* Dashboard */}
        <main 
          id="main-content" 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          role="main"
          aria-labelledby="dashboard-title"
        >
        <h1 id="dashboard-title" className="sr-only">Dashboard - Portfolio Performance and Income Overview</h1>
        
        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">
            🎮 Demo Mode - Explore all features with sample data!
          </p>
        </div>
        
        {/* Migration Banner */}
        <section aria-labelledby="migration-section" className="mb-6">
          <h2 id="migration-section" className="sr-only">Data Migration to Cloud</h2>
          <MigrationBanner className="max-w-full" />
        </section>
        
        <section aria-labelledby="performance-section">
          <h2 id="performance-section" className="sr-only">Performance Comparison</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SPY Comparison - Full width */}
            <div className="lg:col-span-2">
              <SPYComparison 
                portfolioReturn={mockData.spyComparison.portfolioReturn}
                spyReturn={mockData.spyComparison.spyReturn}
                outperformance={mockData.spyComparison.outperformance}
                timePeriodData={mockData.timePeriodData}
                isLoading={false}
              />
            </div>

            {/* Income Clarity */}
            <div role="region" aria-labelledby="income-clarity-title" data-tour="income-clarity-card">
              <h3 id="income-clarity-title" className="sr-only">Income Clarity Overview</h3>
              <IncomeClarityCard 
                clarityData={mockData.incomeClarityData}
                isLoading={false}
              />
            </div>

            {/* Expense Milestones */}
            <div role="region" aria-labelledby="expense-milestones-title">
              <h3 id="expense-milestones-title" className="sr-only">Expense Coverage Milestones</h3>
              <ExpenseMilestones 
                milestones={mockData.expenseMilestones}
                totalCoverage={mockData.totalCoverage}
              />
            </div>

            {/* Income Stability Card */}
            <div role="region" aria-labelledby="income-stability-title" data-tour="income-stability-card">
              <h3 id="income-stability-title" className="sr-only">Income Stability Analysis</h3>
              <IncomeStabilityCard />
            </div>
          </div>
        </section>

        {/* Additional Dashboard Components */}
        <section aria-labelledby="portfolio-section" className="mt-8">
          <h2 id="portfolio-section" className="sr-only">Portfolio Analysis and Intelligence</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Holdings Performance - Full width */}
            <div className="lg:col-span-2" role="region" aria-labelledby="holdings-title">
              <h3 id="holdings-title" className="sr-only">Holdings Performance Analysis</h3>
              <HoldingsPerformance onAddHolding={() => toast.info('Add holdings feature coming soon!')} />
            </div>

            {/* Portfolio Overview */}
            <div role="region" aria-labelledby="portfolio-overview-title">
              <h3 id="portfolio-overview-title" className="sr-only">Portfolio Overview and Allocation</h3>
              <PortfolioOverview />
            </div>

            {/* Margin Intelligence */}
            <div role="region" aria-labelledby="margin-intelligence-title">
              <h3 id="margin-intelligence-title" className="sr-only">Margin Trading Intelligence</h3>
              <MarginIntelligence />
            </div>

            {/* Dividend Calendar */}
            <div role="region" aria-labelledby="dividend-calendar-title">
              <h3 id="dividend-calendar-title" className="sr-only">Upcoming Dividend Payments</h3>
              <DividendCalendar />
            </div>

            {/* Tax Planning */}
            <div role="region" aria-labelledby="tax-planning-title">
              <h3 id="tax-planning-title" className="sr-only">Tax Planning and Optimization</h3>
              <TaxPlanning />
            </div>
          </div>
        </section>

        {/* Cash Flow Intelligence Section */}
        <section aria-labelledby="cashflow-section" className="mt-8">
          <h2 id="cashflow-section" className="sr-only">Cash Flow Intelligence and Tax Planning</h2>
          <div role="region" aria-labelledby="cashflow-intelligence-title">
            <h3 id="cashflow-intelligence-title" className="sr-only">Advanced Cash Flow Analysis</h3>
            <CashFlowIntelligence />
          </div>
        </section>

        {/* Income and Tax Components */}
        <section aria-labelledby="income-tax-section" className="mt-8">
          <h2 id="income-tax-section" className="sr-only">Income Tracking and Tax Calculations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* YTD Income Accumulator */}
            <div role="region" aria-labelledby="ytd-income-title">
              <h3 id="ytd-income-title" className="sr-only">Year-to-Date Income Summary</h3>
              <YTDIncomeAccumulator />
            </div>

            {/* Tax Bill Calculator */}
            <div role="region" aria-labelledby="tax-calculator-title">
              <h3 id="tax-calculator-title" className="sr-only">Estimated Tax Bill Calculator</h3>
              <TaxBillCalculator />
            </div>
          </div>
        </section>

          <div className="mt-8 border rounded-lg p-4 transition-all duration-300" style={{
            backgroundColor: 'var(--color-success)',
            borderColor: 'var(--color-success)',
            color: 'white',
            opacity: 0.9
          }}>
            <h3 className="text-lg font-semibold mb-2">🎨 Demo Mode Active!</h3>
            <p className="opacity-90">
              You're viewing Income Clarity with sample data. All 5 Super Cards are available to explore!
            </p>
          </div>
          
          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </main>
      </div>
    </AppShell>
  )
}

// Mock Auth Provider for demo
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export default function DemoDashboard() {
  return (
    <MockAuthProvider>
      <SuperCardProvider>
        <DataPersistenceProvider>
          <NotificationProvider>
            <ExpenseProvider>
              <PortfolioProvider>
                <UserProfileProvider>
                  <DemoDashboardContent />
                </UserProfileProvider>
              </PortfolioProvider>
            </ExpenseProvider>
          </NotificationProvider>
        </DataPersistenceProvider>
      </SuperCardProvider>
    </MockAuthProvider>
  )
}