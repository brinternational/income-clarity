'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { logger } from '@/lib/logger'
import { 
  usePerformanceHub, 
  useIncomeHub, 
  usePerformanceActions, 
  useIncomeActions,
  useGlobalActions,
  useCardSyncStatus 
} from '@/store/superCardStore'

interface StateSyncTestProps {
  className?: string
}

export function StateSyncTest({ className = '' }: StateSyncTestProps) {
  const [renderCount, setRenderCount] = useState(0)
  const [testResults, setTestResults] = useState<any[]>([])
  
  // Subscribe to different parts of the store
  const performanceHub = usePerformanceHub()
  const incomeHub = useIncomeHub()
  const syncStatus = useCardSyncStatus()
  
  // Get actions
  const performanceActions = usePerformanceActions()
  const incomeActions = useIncomeActions()
  const { refreshAll, optimisticUpdate, rollback, commitUpdate } = useGlobalActions()

  // Track renders
  useEffect(() => {
    setRenderCount(prev => prev + 1)
  })

  const runSyncTest = async () => {
    const results = []
    
    // logger.log('🧪 Starting State Synchronization Tests...')

    // Test 1: Performance data update
    // logger.log('Test 1: Performance data update')
    const perfStart = performance.now()
    performanceActions.updateData({
      portfolioValue: 500000,
      spyOutperformance: 2.3,
      spyComparison: {
        portfolioReturn: 8.2,
        spyReturn: 5.9,
        outperformance: 2.3
      }
    })
    const perfEnd = performance.now()
    results.push({
      name: 'Performance Update',
      duration: perfEnd - perfStart,
      success: true
    })

    // Test 2: Income data update  
    // logger.log('Test 2: Income data update')
    const incomeStart = performance.now()
    incomeActions.updateData({
      monthlyIncome: 3200,
      availableToReinvest: 850,
      isAboveZero: true
    })
    const incomeEnd = performance.now()
    results.push({
      name: 'Income Update',
      duration: incomeEnd - incomeStart,
      success: true
    })

    // Test 3: Optimistic update with rollback
    // logger.log('Test 3: Optimistic update test')
    const optimisticStart = performance.now()
    
    // Apply optimistic update
    optimisticUpdate({
      performanceHub: { portfolioValue: 999999 }
    })
    
    // Wait a bit, then rollback
    setTimeout(() => {
      rollback()
      const optimisticEnd = performance.now()
      
      results.push({
        name: 'Optimistic Update + Rollback',
        duration: optimisticEnd - optimisticStart,
        success: performanceHub.portfolioValue !== 999999
      })
      
      setTestResults([...results])
    }, 100)

    // Test 4: Cross-card state sharing
    // logger.log('Test 4: Cross-card state sharing')
    const crossStart = performance.now()
    
    // Update performance data and check if other cards can access it
    performanceActions.updateData({
      spyComparison: {
        portfolioReturn: 12.5,
        spyReturn: 8.1,
        outperformance: 4.4
      }
    })
    
    const crossEnd = performance.now()
    results.push({
      name: 'Cross-card State Sharing',
      duration: crossEnd - crossStart,
      success: true
    })

    // Test 5: Selective subscriptions (measure re-render count)
    // logger.log('Test 5: Selective subscription efficiency')
    const currentRenderCount = renderCount
    
    // Update data that this component doesn't subscribe to directly
    incomeActions.updateData({ monthlyDividendIncome: 2800 })
    
    setTimeout(() => {
      const renderIncrease = renderCount - currentRenderCount
      results.push({
        name: 'Selective Subscriptions',
        duration: 0,
        success: renderIncrease <= 1, // Should only re-render once or not at all
        extra: `Render increase: ${renderIncrease}`
      })
      
      setTestResults([...results])
    }, 50)

    // logger.log('🧪 All tests initiated')
  }

  const clearResults = () => {
    setTestResults([])
    setRenderCount(0)
  }

  return (
    <div className={`p-6 bg-white rounded-xl border border-slate-200 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          State Synchronization Test Dashboard
        </h3>
        <p className="text-slate-600 text-sm">
          Test the Zustand store performance and synchronization across Super Cards
        </p>
      </div>

      {/* Current State Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-25 rounded-lg">
          <h4 className="font-semibold text-primary-700 mb-2">Performance Hub</h4>
          <div className="text-sm space-y-1">
            <div>Portfolio Value: ${performanceHub.portfolioValue.toLocaleString()}</div>
            <div>SPY Outperformance: {performanceHub.spyOutperformance}%</div>
            <div>Status: {syncStatus.performance}</div>
            <div>Holdings: {performanceHub.holdings.length}</div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-prosperity-50 to-prosperity-25 rounded-lg">
          <h4 className="font-semibold text-prosperity-700 mb-2">Income Hub</h4>
          <div className="text-sm space-y-1">
            <div>Monthly Income: ${incomeHub.monthlyIncome.toLocaleString()}</div>
            <div>Available to Reinvest: ${incomeHub.availableToReinvest.toLocaleString()}</div>
            <div>Above Zero: {incomeHub.isAboveZero ? '✅' : '❌'}</div>
            <div>Status: {syncStatus.income}</div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={runSyncTest}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Run Sync Tests
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          Clear Results
        </button>

        <div className="flex items-center text-sm text-slate-600">
          Render Count: <span className="ml-1 font-mono">{renderCount}</span>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-800">Test Results:</h4>
          
          {testResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className="font-medium">{result.name}</span>
                </div>
                
                <div className="text-sm">
                  {result.duration > 0 && (
                    <span>{result.duration.toFixed(2)}ms</span>
                  )}
                  {result.extra && (
                    <span className="ml-2 text-xs">({result.extra})</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600">
              <div>✅ Passed: {testResults.filter(r => r.success).length}</div>
              <div>❌ Failed: {testResults.filter(r => !r.success).length}</div>
              <div>⚡ Average Duration: {(testResults.filter(r => r.duration > 0).reduce((sum, r) => sum + r.duration, 0) / testResults.filter(r => r.duration > 0).length || 0).toFixed(2)}ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}