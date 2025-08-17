'use client'

import { useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { ExpenseProvider } from '@/contexts/ExpenseContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { DataPersistenceProvider } from '@/contexts/DataPersistenceContext'
import { SuperCardsNavigation } from '@/components/navigation/SuperCardsNavigation'
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard'
import { PerformanceHub } from '@/components/super-cards/PerformanceHub'
import { IncomeIntelligenceHub } from '@/components/super-cards/IncomeIntelligenceHub'
import { TaxStrategyHub } from '@/components/super-cards/TaxStrategyHub'
import { PortfolioStrategyHub } from '@/components/super-cards/PortfolioStrategyHub'
import { FinancialPlanningHub } from '@/components/super-cards/FinancialPlanningHub'
import { ArrowLeft, Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

function UnifiedSuperCardsDashboard() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [cardData, setCardData] = useState<any>({
    performance: null,
    income: null,
    tax: null,
    portfolio: null,
    financial: null
  })
  const [loading, setLoading] = useState(true)
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('')

  useEffect(() => {
    fetchAllCardData()
    // Update the last refresh time only on client side to prevent hydration mismatch
    setLastRefreshTime(new Date().toLocaleTimeString())
  }, [])

  // Update refresh time when data is fetched
  useEffect(() => {
    if (!loading) {
      setLastRefreshTime(new Date().toLocaleTimeString())
    }
  }, [loading])

  const fetchAllCardData = async () => {
    setLoading(true)
    try {
      const fetchWithAuth = (url: string) => 
        fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(async response => {
          if (!response.ok) {
            if (response.status === 302 || response.url.includes('/auth/login')) {
              throw new Error('Authentication required');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          console.log(`✅ Fetched data from ${url}:`, data);
          return data;
        });

      const [performance, income, tax, portfolio, financial] = await Promise.all([
        fetchWithAuth('/api/super-cards/performance-hub'),
        fetchWithAuth('/api/super-cards/income-hub'),
        fetchWithAuth('/api/super-cards/tax-strategy-hub'),
        fetchWithAuth('/api/super-cards/portfolio-strategy-hub'),
        fetchWithAuth('/api/super-cards/financial-planning-hub')
      ])

      console.log('🎯 Setting card data:', {
        performance: performance.data || performance,
        income: income.data || income,
        tax: tax.data || tax,
        portfolio: portfolio.data || portfolio,
        financial: financial.data || financial
      });

      setCardData({
        performance: performance.data || performance,
        income: income.data || income,
        tax: tax.data || tax,
        portfolio: portfolio.data || portfolio,
        financial: financial.data || financial
      })
    } catch (error) {
      console.error('Error fetching card data:', error)
      
      // If authentication failed, redirect to login
      if (error instanceof Error && error.message.includes('Authentication required')) {
        window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }
      
      // Set fallback data if API calls fail
      setCardData({
        performance: {
          portfolioValue: 125000,
          spyComparison: {
            portfolioReturn: 0.082,
            spyReturn: 0.061,
            outperformance: 0.021
          },
          holdings: [
            { id: 1, ticker: 'SCHD', shares: 586, value: 50000, ytdPerformance: 0.089 },
            { id: 2, ticker: 'VTI', shares: 102, value: 30000, ytdPerformance: 0.075 },
            { id: 3, ticker: 'VXUS', shares: 382, value: 25000, ytdPerformance: 0.045 },
            { id: 4, ticker: 'BND', shares: 279, value: 20000, ytdPerformance: 0.032 }
          ],
          timePeriodData: {
            '1Y': { portfolioReturn: 0.082, spyReturn: 0.061, outperformance: 0.021 }
          },
          spyOutperformance: 0.021
        },
        income: {
          monthlyIncome: 4500,
          monthlyDividendIncome: 4500,
          availableToReinvest: 625,
          incomeClarityData: {
            grossMonthly: 4500,
            taxOwed: 675,
            netMonthly: 3825,
            monthlyExpenses: 3200,
            availableToReinvest: 625,
            aboveZeroLine: true
          }
        },
        tax: {
          currentTaxBill: 12500,
          projectedSavings: 7500,
          taxEfficiency: 0.78,
          taxStrategies: []
        },
        portfolio: {
          portfolioHealth: { score: 85 },
          holdings: [],
          rebalancingSuggestions: []
        },
        financial: {
          fireProgress: 0.23,
          yearsToFire: 12,
          currentNetWorth: 125000,
          targetNetWorth: 1250000,
          monthlyInvestment: 3500,
          currentSavingsRate: 0.35
        }
      })
    }
    setLoading(false)
  }

  const toggleExpand = (cardIndex: number) => {
    setExpandedCard(expandedCard === cardIndex ? null : cardIndex)
  }

  const cards = [
    {
      component: PerformanceHub,
      data: cardData.performance,
      title: 'Performance Hub',
      color: 'from-blue-500 to-blue-600',
      testId: 'performance-hub'
    },
    {
      component: IncomeIntelligenceHub,
      data: cardData.income,
      title: 'Income Intelligence',
      color: 'from-green-500 to-green-600',
      testId: 'income-intelligence-hub'
    },
    {
      component: TaxStrategyHub,
      data: cardData.tax,
      title: 'Tax Strategy',
      color: 'from-purple-500 to-purple-600',
      testId: 'tax-strategy-hub'
    },
    {
      component: PortfolioStrategyHub,
      data: cardData.portfolio,
      title: 'Portfolio Strategy',
      color: 'from-orange-500 to-orange-600',
      testId: 'portfolio-strategy-hub'
    },
    {
      component: FinancialPlanningHub,
      data: cardData.financial,
      title: 'Financial Planning',
      color: 'from-pink-500 to-pink-600',
      testId: 'financial-planning-hub'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <SuperCardsNavigation
        selectedCard={null}
        cardTitle="Unified Super Cards - All 5 Hubs"
        showBackButton={false}
      />
      
      {/* Refresh Controls Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Real-time unified view of all 5 Super Cards
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              data-testid="refresh-data"
              onClick={() => {
                fetchAllCardData()
                setLastRefreshTime(new Date().toLocaleTimeString())
              }}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
            <div data-testid="loading-skeleton" className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading all Super Cards...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 h-[calc(100vh-9rem)] overflow-hidden">
              {cards.map((card, index) => {
                const Component = card.component
                const isExpanded = expandedCard === index
                const width = isExpanded ? 'flex-grow' : 'flex-1'
                
              return (
                <div
                  key={index}
                  data-testid={card.testId}
                  className={`${width} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col min-w-0`}
                  style={{ minWidth: isExpanded ? '40%' : '0' }}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${card.color} text-white p-2 flex items-center justify-between`}>
                    <h2 className="font-bold text-sm truncate">{card.title}</h2>
                    <button
                      onClick={() => toggleExpand(index)}
                      className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                      title={isExpanded ? "Minimize" : "Maximize"}
                    >
                      {isExpanded ? (
                        <Minimize2 className="h-3 w-3" />
                      ) : (
                        <Maximize2 className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  
                  {/* Card Content */}
                  <div className="flex-1 overflow-auto p-2">
                    {card.data ? (
                      <div className={`${isExpanded ? '' : 'text-xs'} transition-all`}>
                        <Component 
                          data={card.data}
                          isCompact={!isExpanded}
                          isLoading={false}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </div>

      {/* Compact Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-4 py-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-400">
              Click expand icon to focus • All data updates in real-time
            </span>
          </div>
          <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
            <span>Last refresh: {lastRefreshTime || 'Loading...'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnifiedSuperCardsPage() {
  return (
    <AuthProvider>
      <OnboardingGuard>
        <UserProfileProvider>
          <PortfolioProvider>
            <ExpenseProvider>
              <NotificationProvider>
                <DataPersistenceProvider>
                  <UnifiedSuperCardsDashboard />
                </DataPersistenceProvider>
              </NotificationProvider>
            </ExpenseProvider>
          </PortfolioProvider>
        </UserProfileProvider>
      </OnboardingGuard>
    </AuthProvider>
  )
}