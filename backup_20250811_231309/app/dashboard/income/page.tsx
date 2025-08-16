'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { RequireSimpleAuth } from '@/contexts/SimpleAuthContext'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { ExpenseProvider } from '@/contexts/ExpenseContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import BottomNavigation from '@/components/navigation/BottomNavigation'
import { ArrowLeft, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'

// 7 Income page cards as per blueprint
import { IncomeClarityCard } from '@/components/dashboard/IncomeClarityCard'
import { DividendCalendar } from '@/components/dashboard/DividendCalendar'
import TaxBreakdownCard from '@/components/income/TaxBreakdownCard'
import FIREProgressCard from '@/components/income/FIREProgressCard'
import IncomeStabilityCard from '@/components/income/IncomeStabilityCard'
import CashFlowProjectionCard from '@/components/income/CashFlowProjectionCard'
import IncomeProgressionCard from '@/components/income/IncomeProgressionCard'
import { useUserProfile } from '@/contexts/UserProfileContext'

function IncomePageContent() {
  const router = useRouter()
  const { incomeClarityData } = useUserProfile()

  const handleSettingsClick = () => console.log('Settings clicked')
  const handleLogout = () => router.push('/auth' + '/login')
  const handleAddClick = () => console.log('Add clicked')

  return (
    <AppShell
      title="Income Intelligence"
      onSettingsClick={handleSettingsClick}
      onLogout={handleLogout}
      onAddClick={handleAddClick}
    >
      {/* PWA Header with back navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Income Analysis</h1>
                <p className="text-sm text-gray-600">Dividend income optimization - 7 Key Insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 7 Income Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Card 1: Income Clarity Card (from dashboard) */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
        }>
          {incomeClarityData && <IncomeClarityCard clarityData={incomeClarityData} />}
        </Suspense>

        {/* Card 2: Interactive Dividend Calendar */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-96" />
        }>
          <DividendCalendar />
        </Suspense>

        {/* Card 3: Tax Breakdown Card */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-80" />
        }>
          <TaxBreakdownCard />
        </Suspense>

        {/* Card 4: FIRE Progress Card */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
        }>
          <div data-tour="fire-progress-card">
            <FIREProgressCard />
          </div>
        </Suspense>

        {/* Card 5: Income Stability Score Card */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
        }>
          <IncomeStabilityCard />
        </Suspense>

        {/* Two-column layout for projections */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card 6: Cash Flow Projection */}
          <Suspense fallback={
            <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
          }>
            <div data-tour="cash-flow-projection-card">
              <CashFlowProjectionCard />
            </div>
          </Suspense>

          {/* Card 7: Income Progression Chart */}
          <Suspense fallback={
            <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
          }>
            <div data-tour="income-progression-card">
              <IncomeProgressionCard />
            </div>
          </Suspense>
        </div>
      </div>
    </AppShell>
  )
}

export default function IncomePage() {
  return (
    <RequireSimpleAuth>
      <NotificationProvider>
        <UserProfileProvider>
          <PortfolioProvider>
            <ExpenseProvider>
              <IncomePageContent />
            </ExpenseProvider>
          </PortfolioProvider>
        </UserProfileProvider>
      </NotificationProvider>
    </RequireSimpleAuth>
  )
}