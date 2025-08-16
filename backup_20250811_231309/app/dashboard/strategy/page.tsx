'use client'

import { Suspense } from 'react'
import { RequireAuth } from '@/contexts/AuthContext'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { ExpenseProvider } from '@/contexts/ExpenseContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import BottomNavigation from '@/components/navigation/BottomNavigation'
import { ArrowLeft, Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'

// 7 Strategy page cards
import TaxIntelligenceEngineCard from '@/components/strategy/TaxIntelligenceEngineCard'
import TaxSavingsCalculatorCard from '@/components/strategy/TaxSavingsCalculatorCard'
import StrategyHealthCard from '@/components/strategy/StrategyHealthCard'
import TaxSettingsCard from '@/components/strategy/TaxSettingsCard'
import StrategyComparisonEngine from '@/components/strategy/StrategyComparisonEngine'
import ResearchHubCard from '@/components/strategy/ResearchHubCard'
import BenchmarkingCard from '@/components/strategy/BenchmarkingCard'

function StrategyPageContent() {
  const router = useRouter()

  const handleSettingsClick = () => console.log('Settings clicked')
  const handleLogout = () => router.push('/auth' + '/login')
  const handleAddClick = () => console.log('Add clicked')

  return (
    <AppShell
      title="Strategy Optimization"
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Strategy & Research</h1>
                <p className="text-sm text-gray-600">Tax optimization & strategic insights - 7 Key Tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 7 Strategy Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Card 1: Tax Intelligence Engine */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-80" />
        }>
          <TaxIntelligenceEngineCard />
        </Suspense>

        {/* Card 2: Tax Savings Calculator */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-96" />
        }>
          <div data-tour="tax-savings-calculator-card">
            <TaxSavingsCalculatorCard />
          </div>
        </Suspense>

        {/* Card 3: Strategy Health */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-80" />
        }>
          <div data-tour="strategy-health-card">
            <StrategyHealthCard />
          </div>
        </Suspense>

        {/* Card 4: Tax Settings */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
        }>
          <TaxSettingsCard />
        </Suspense>

        {/* Card 5: Strategy Comparison Engine - Full Width */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-96" />
        }>
          <div data-tour="strategy-comparison-engine">
            <StrategyComparisonEngine />
          </div>
        </Suspense>

        {/* Two-column layout for research and benchmarking */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card 6: Research Hub */}
          <Suspense fallback={
            <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
          }>
            <ResearchHubCard />
          </Suspense>

          {/* Card 7: Benchmarking */}
          <Suspense fallback={
            <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
          }>
            <BenchmarkingCard />
          </Suspense>
        </div>
      </div>
    </AppShell>
  )
}

export default function StrategyPage() {
  return (
    <RequireAuth>
      <NotificationProvider>
        <UserProfileProvider>
          <PortfolioProvider>
            <ExpenseProvider>
              <StrategyPageContent />
            </ExpenseProvider>
          </PortfolioProvider>
        </UserProfileProvider>
      </NotificationProvider>
    </RequireAuth>
  )
}