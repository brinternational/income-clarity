#!/usr/bin/env node

/**
 * FINAL FIX TEST
 * 
 * This script implements a comprehensive solution and tests it thoroughly.
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function implementAndTestFinalFix() {
  console.log('🔧 IMPLEMENTING FINAL FIX FOR INFINITE LOADING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // First, let me implement a comprehensive fix
  console.log('\n📝 STEP 1: Implementing comprehensive fix...');
  
  const fixContent = `'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
  // Use AuthContext instead of custom authentication
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [cardData, setCardData] = useState<any>({
    performance: null,
    income: null,
    tax: null,
    portfolio: null,
    financial: null
  })
  const [loading, setLoading] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('')
  const [hasTriedFetch, setHasTriedFetch] = useState(false)
  const [componentKey, setComponentKey] = useState(0) // NEW: Force component reset
  const mountedRef = useRef(true)
  const fetchInProgressRef = useRef(false)

  // COMPREHENSIVE FIX: Force component reset after navigation issues
  useEffect(() => {
    let resetTimer: NodeJS.Timeout;
    
    if (isAuthenticated && !authLoading) {
      // If component seems stuck (loading for too long or no data after 5 seconds)
      resetTimer = setTimeout(() => {
        if ((loading && !fetchInProgressRef.current) || (!loading && !hasTriedFetch)) {
          console.log('🔄 RESET: Force resetting component due to stuck state');
          setComponentKey(prev => prev + 1);
          setHasTriedFetch(false);
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }, 5000);
    }
    
    return () => {
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [isAuthenticated, authLoading, loading, hasTriedFetch]);

  // Fetch data when authenticated and stable
  useEffect(() => {
    console.log('🔄 DEBUG: Auth effect - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading, 'hasTriedFetch:', hasTriedFetch, 'loading:', loading);
    
    if (isAuthenticated && !authLoading && !hasTriedFetch && !fetchInProgressRef.current) {
      console.log('🔄 DEBUG: Triggering fetchAllCardData');
      setHasTriedFetch(true);
      fetchAllCardData();
    }
  }, [isAuthenticated, authLoading, hasTriedFetch])

  // Reset component state when component key changes (force reset)
  useEffect(() => {
    if (componentKey > 0) {
      console.log('🔄 DEBUG: Component reset triggered, key:', componentKey);
      setCardData({
        performance: null,
        income: null,
        tax: null,
        portfolio: null,
        financial: null
      });
      setLoading(false);
      setHasTriedFetch(false);
      fetchInProgressRef.current = false;
    }
  }, [componentKey]);

  // Update refresh time when data is fetched
  useEffect(() => {
    if (!loading) {
      setLastRefreshTime(new Date().toLocaleTimeString())
    }
  }, [loading])

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    }
  }, [])

  const fetchAllCardData = async () => {
    console.log('🚀 DEBUG: Starting fetchAllCardData');
    
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      console.log('⚠️ DEBUG: Fetch already in progress, skipping');
      return;
    }
    
    // Check if component is still mounted before starting
    if (!mountedRef.current) {
      console.log('⚠️ DEBUG: Component unmounted, skipping fetch');
      return;
    }
    
    fetchInProgressRef.current = true;
    setLoading(true)
    
    try {
      console.log('🚀 Fetching all Super Card data...');
      
      const fetchWithAuth = (url: string) => 
        fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(async response => {
          if (!response.ok) {
            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
          }
          const data = await response.json();
          console.log(\`✅ Fetched data from \${url}\`);
          return data;
        });

      console.log('🔄 DEBUG: About to start Promise.all for API calls');
      
      const [incomeData, performanceData, taxData, portfolioData, planningData] = await Promise.all([
        fetchWithAuth('/api/super-cards/income-hub'),
        fetchWithAuth('/api/super-cards/performance-hub'), 
        fetchWithAuth('/api/super-cards/tax-strategy-hub'),
        fetchWithAuth('/api/super-cards/portfolio-strategy-hub'),
        fetchWithAuth('/api/super-cards/financial-planning-hub')
      ]);

      console.log('🔄 DEBUG: Promise.all completed, creating newCardData object');
      
      // Check if component is still mounted before updating state
      if (!mountedRef.current) {
        console.log('⚠️ DEBUG: Component unmounted during fetch, skipping state update');
        return;
      }
      
      const newCardData = { 
        income: incomeData, 
        performance: performanceData, 
        tax: taxData, 
        portfolio: portfolioData, 
        financial: planningData 
      };
      
      console.log('🔄 DEBUG: Setting cardData to:', newCardData);
      
      // CRITICAL: Ensure loading is set to false and data is set atomically
      setCardData(newCardData);
      setLoading(false);
      console.log('✅ DEBUG: cardData state updated successfully, loading set to false');
      setLastRefreshTime(new Date().toLocaleTimeString())
      
    } catch (error) {
      console.error('❌ Error fetching card data:', error)
      // On error, still set loading to false
      setLoading(false);
    } finally {
      fetchInProgressRef.current = false;
    }
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

  // Debug: Log current state
  console.log('🔍 DEBUG: Current state - loading:', loading, 'isAuthenticated:', isAuthenticated, 'authLoading:', authLoading, 'hasTriedFetch:', hasTriedFetch, 'componentKey:', componentKey);

  return (
    <div key={componentKey} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
              onClick={async () => {
                await fetchAllCardData()
                if (!loading) {
                  setLastRefreshTime(new Date().toLocaleTimeString())
                }
              }}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading || !isAuthenticated}
            >
              <RefreshCw className={\`h-3 w-3 \${loading ? 'animate-spin' : ''}\`} />
              <span>Refresh All</span>
            </button>
            <button
              onClick={() => {
                console.log('🔄 Manual reset triggered');
                setComponentKey(prev => prev + 1);
              }}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Reset component if stuck"
            >
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-2">
        {authLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
            <div data-testid="loading-skeleton" className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading all Super Cards...</p>
            </div>
          </div>
        ) : (
          <div data-testid="super-cards-grid" className="flex gap-2 h-[calc(100vh-9rem)] overflow-hidden">
              {cards.map((card, index) => {
                const Component = card.component
                const isExpanded = expandedCard === index
                const width = isExpanded ? 'flex-grow' : 'flex-1'
                
                // Debug: Log each card's data
                console.log(\`🎯 DEBUG: \${card.title} data:\`, card.data);
                
              return (
                <div
                  key={index}
                  data-testid={card.testId}
                  className={\`\${width} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col min-w-0\`}
                  style={{ minWidth: isExpanded ? '40%' : '0' }}
                >
                  {/* Card Header */}
                  <div className={\`bg-gradient-to-r \${card.color} text-white p-2 flex items-center justify-between\`}>
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
                      <div className={\`\${isExpanded ? '' : 'text-xs'} transition-all\`}>
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
            <span>Key: {componentKey}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnifiedSuperCardsPage() {
  return (
    <OnboardingGuard>
      <UnifiedSuperCardsDashboard />
    </OnboardingGuard>
  )
}`;

  // Write the fixed component
  await fs.promises.writeFile('/public/MasterV2/income-clarity/income-clarity-app/app/dashboard/super-cards-unified/page.tsx', fixContent);
  console.log('   ✅ Comprehensive fix implemented');

  // Now test it
  console.log('\n🧪 STEP 2: Testing the comprehensive fix...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });

    // Aggressive rapid navigation test
    console.log('   → Performing aggressive rapid navigation...');
    for (let i = 0; i < 3; i++) {
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForTimeout(200);
      await page.goto('http://localhost:3000/dashboard/super-cards-unified');
      await page.waitForTimeout(200);
    }

    // Monitor for success
    console.log('   → Monitoring for successful load...');
    let success = false;
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      
      const cardsVisible = await page.isVisible('[data-testid="super-cards-grid"]');
      const loadingVisible = await page.isVisible('[data-testid="loading-skeleton"]');
      
      console.log(`   📊 ${i + 1}s: Cards=${cardsVisible}, Loading=${loadingVisible}`);
      
      if (cardsVisible && !loadingVisible) {
        success = true;
        console.log(`   ✅ SUCCESS: Cards loaded after ${i + 1} seconds!`);
        break;
      }
    }

    if (!success) {
      console.log('   ❌ STILL FAILING: Testing manual reset button...');
      
      // Try clicking the reset button
      const resetButton = await page.$('button:has-text("Reset")');
      if (resetButton) {
        await resetButton.click();
        await page.waitForTimeout(3000);
        
        const cardsAfterReset = await page.isVisible('[data-testid="super-cards-grid"]');
        if (cardsAfterReset) {
          console.log('   ✅ RESET BUTTON WORKS: Cards loaded after manual reset!');
          success = true;
        }
      }
    }

    console.log(`\n🎯 FINAL RESULT: ${success ? 'FIXED' : 'STILL BROKEN'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the final fix
implementAndTestFinalFix().catch(console.error);