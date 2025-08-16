'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { PerformanceHub } from '@/components/super-cards/PerformanceHub'
import { IncomeIntelligenceHub } from '@/components/super-cards/IncomeIntelligenceHub'
import { TaxStrategyHub } from '@/components/super-cards/TaxStrategyHub'
import { PortfolioStrategyHub } from '@/components/super-cards/PortfolioStrategyHub'
import { FinancialPlanningHub } from '@/components/super-cards/FinancialPlanningHub'
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react'
import Link from 'next/link'

export default function UnifiedSuperCardsPage() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [cardData, setCardData] = useState<any>({
    performance: null,
    income: null,
    tax: null,
    portfolio: null,
    financial: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllCardData()
  }, [])

  const fetchAllCardData = async () => {
    setLoading(true)
    try {
      const [performance, income, tax, portfolio, financial] = await Promise.all([
        fetch('/api/super-cards/performance-hub').then(r => r.json()),
        fetch('/api/super-cards/income-hub').then(r => r.json()),
        fetch('/api/super-cards/tax-strategy-hub').then(r => r.json()),
        fetch('/api/super-cards/portfolio-strategy-hub').then(r => r.json()),
        fetch('/api/super-cards/financial-planning-hub').then(r => r.json())
      ])

      setCardData({
        performance: performance.data || performance,
        income: income.data || income,
        tax: tax.data || tax,
        portfolio: portfolio.data || portfolio,
        financial: financial.data || financial
      })
    } catch (error) {
      console.error('Error fetching card data:', error)
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
      color: 'from-blue-500 to-blue-600'
    },
    {
      component: IncomeIntelligenceHub,
      data: cardData.income,
      title: 'Income Intelligence',
      color: 'from-green-500 to-green-600'
    },
    {
      component: TaxStrategyHub,
      data: cardData.tax,
      title: 'Tax Strategy',
      color: 'from-purple-500 to-purple-600'
    },
    {
      component: PortfolioStrategyHub,
      data: cardData.portfolio,
      title: 'Portfolio Strategy',
      color: 'from-orange-500 to-orange-600'
    },
    {
      component: FinancialPlanningHub,
      data: cardData.financial,
      title: 'Financial Planning',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Compact Header Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">Dashboard</span>
            </Link>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Unified Super Cards - All 5 Hubs
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAllCardData}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Refresh All
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading all Super Cards...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 h-[calc(100vh-5rem)] overflow-hidden">
              {cards.map((card, index) => {
                const Component = card.component
                const isExpanded = expandedCard === index
                const width = isExpanded ? 'flex-grow' : 'flex-1'
                
              return (
                <div
                  key={index}
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
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
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
            <span>Last refresh: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}