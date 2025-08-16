'use client'

import { Suspense, useState } from 'react'
import { HoldingsPerformance } from '@/components/dashboard/HoldingsPerformance'
import { PortfolioFormCard } from '@/components/dashboard/PortfolioFormCard'
import { MarginIntelligence } from '@/components/dashboard/MarginIntelligence'
import { RebalancingSuggestions } from '@/components/dashboard/RebalancingSuggestions'
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview'
import { AllocationChart } from '@/components/dashboard/AllocationChart'
import { SectorAllocationChart } from '@/components/dashboard/SectorAllocationChart'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'
import { IncomeAnalysis } from '@/components/dashboard/IncomeAnalysis'
import { PortfolioActions } from '@/components/dashboard/PortfolioActions'
import { RequireSimpleAuth } from '@/contexts/SimpleAuthContext'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { ExpenseProvider } from '@/contexts/ExpenseContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ArrowLeft, TrendingUp, DollarSign, PieChart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNavigation from '@/components/navigation/BottomNavigation'
import ShareButton from '@/components/shared/ShareButton'
import { generateShareContent } from '@/utils/shareContent'
import { AppShell } from '@/components/AppShell'

function PortfolioPageContent() {
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)

  const handleAddHolding = () => {
    // For now, just show a basic message - in full implementation this would open settings modal
    // console.log('Add holding requested from portfolio page')
    // TODO: Implement full settings modal like dashboard
    alert('Add Holding functionality - this would open the settings modal in full implementation')
  }

  const handleSettingsClick = () => setShowSettings(true)
  const handleLogout = () => router.push('/auth' + '/login')
  const handleAddClick = () => handleAddHolding()

  return (
    <AppShell
      title="Portfolio"
      onSettingsClick={handleSettingsClick}
      onLogout={handleLogout}
      onAddClick={handleAddClick}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--color-primary)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ 
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-text-primary)'
              }}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Portfolio
              </h1>
              <p 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Complete holdings analysis and performance insights
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-4">
            <div 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
              <span 
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                +5.2% YTD
              </span>
            </div>
            <div 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <DollarSign className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              <span 
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                $2,847/mo
              </span>
            </div>
            <ShareButton
              shareType="portfolio"
              shareData={generateShareContent('portfolio', { 
                portfolioData: { portfolioReturn: 0.082, spyReturn: 0.051, outperformance: 0.031, totalValue: 45600 }
              })}
              variant="ghost"
              size="sm"
              className="text-white hover:text-gray-200 hover:bg-white/10"
              showLabel={false}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 pb-32 lg:pb-8">
        {/* Page Introduction */}
        <div 
          className="rounded-xl p-6 border transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--color-accent-secondary)', 
            borderColor: 'var(--color-accent)'
          }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">💼</span>
            <h2 
              className="text-xl font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Portfolio Management Hub
            </h2>
          </div>
          <p 
            className="transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Manage your holdings, analyze performance, optimize allocation, and get actionable rebalancing recommendations
          </p>
        </div>

        {/* THE 4 PORTFOLIO CARDS - Main Feature Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Card 1: Holdings Management Card */}
          <Suspense fallback={
            <div 
              className="rounded-xl p-8 text-center transition-colors duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <div className="animate-pulse">
                <div className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Loading Holdings Management...
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  Fetching your holdings data
                </div>
              </div>
            </div>
          }>
            <HoldingsPerformance onAddHolding={handleAddHolding} />
          </Suspense>

          {/* Card 2: Portfolio Form Card */}
          <Suspense fallback={
            <div 
              className="rounded-xl p-8 text-center transition-colors duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <div className="animate-pulse">
                <div className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Loading Portfolio Form...
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  Preparing form interface
                </div>
              </div>
            </div>
          }>
            <PortfolioFormCard />
          </Suspense>

          {/* Card 3: Margin Intelligence Card */}
          <Suspense fallback={
            <div 
              className="rounded-xl p-8 text-center transition-colors duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <div className="animate-pulse">
                <div className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Loading Margin Intelligence...
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  Analyzing risk metrics
                </div>
              </div>
            </div>
          }>
            <MarginIntelligence />
          </Suspense>

          {/* Card 4: Rebalancing Suggestions Card */}
          <Suspense fallback={
            <div 
              className="rounded-xl p-8 text-center transition-colors duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <div className="animate-pulse">
                <div className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Loading Rebalancing Suggestions...
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  Calculating optimization recommendations
                </div>
              </div>
            </div>
          }>
            <div data-tour="rebalancing-suggestions">
              <RebalancingSuggestions />
            </div>
          </Suspense>
        </div>

        {/* Additional Portfolio Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={
              <div 
                className="rounded-xl p-8 text-center transition-colors duration-300"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <div className="animate-pulse">
                  <div className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Loading Portfolio Overview...
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    Fetching your latest portfolio data
                  </div>
                </div>
              </div>
            }>
              <PortfolioOverview />
            </Suspense>
          </div>
          
          <div>
            <Suspense fallback={
              <div 
                className="rounded-xl p-8 text-center transition-colors duration-300"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <div className="animate-pulse">
                  <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Loading Allocation Chart...
                  </div>
                </div>
              </div>
            }>
              <AllocationChart />
            </Suspense>
          </div>
        </div>

        {/* Sector Allocation Analysis */}
        <Suspense fallback={
          <div 
            className="rounded-xl p-8 text-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="animate-pulse">
              <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Loading Sector Allocation...
              </div>
            </div>
          </div>
        }>
          <SectorAllocationChart />
        </Suspense>

        {/* Performance & Income Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Suspense fallback={
            <div 
              className="rounded-xl p-8 text-center transition-colors duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <div className="animate-pulse">
                <div className="w-full h-64 bg-gray-300 rounded mb-4"></div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Loading Performance Chart...
                </div>
              </div>
            </div>
          }>
            <PerformanceChart />
          </Suspense>
          
          <Suspense fallback={
            <div 
              className="rounded-xl p-8 text-center transition-colors duration-300"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <div className="animate-pulse">
                <div className="space-y-4">
                  <div className="w-full h-8 bg-gray-300 rounded"></div>
                  <div className="w-3/4 h-6 bg-gray-300 rounded"></div>
                  <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
                </div>
                <div className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Loading Income Analysis...
                </div>
              </div>
            </div>
          }>
            <IncomeAnalysis />
          </Suspense>
        </div>

        {/* Portfolio Actions */}
        <Suspense fallback={
          <div 
            className="rounded-xl p-8 text-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="animate-pulse">
              <div className="flex justify-center space-x-4">
                <div className="w-32 h-10 bg-gray-300 rounded"></div>
                <div className="w-32 h-10 bg-gray-300 rounded"></div>
                <div className="w-32 h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        }>
          <PortfolioActions onAddHolding={handleAddHolding} />
        </Suspense>
      </div>
    </AppShell>
  )
}

export default function PortfolioPage() {
  return (
    <RequireSimpleAuth>
      <ThemeProvider>
        <UserProfileProvider>
          <PortfolioProvider>
            <ExpenseProvider>
              <PortfolioPageContent />
            </ExpenseProvider>
          </PortfolioProvider>
        </UserProfileProvider>
      </ThemeProvider>
    </RequireSimpleAuth>
  )
}