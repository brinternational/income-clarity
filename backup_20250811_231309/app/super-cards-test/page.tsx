'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SuperCardsTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  
  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result])
  }

  const testComponent = async (componentName: string, testFn: () => Promise<void>) => {
    try {
      await testFn()
      addResult(`✅ ${componentName}: SUCCESS`)
    } catch (error) {
      addResult(`❌ ${componentName}: ${error.message}`)
    }
  }

  const runTests = async () => {
    setTestResults(['🚀 Starting Super Cards Component Tests...'])
    
    // Test 1: Try importing components
    await testComponent('Component Imports', async () => {
      const { FinancialPlanningHub } = await import('@/components/super-cards/FinancialPlanningHub')
      const { IncomeIntelligenceHub } = await import('@/components/super-cards/IncomeIntelligenceHub')
      const { PerformanceHub } = await import('@/components/super-cards/PerformanceHub')
      const { PortfolioStrategyHub } = await import('@/components/super-cards/PortfolioStrategyHub') 
      const { TaxStrategyHub } = await import('@/components/super-cards/TaxStrategyHub')
      
      if (!FinancialPlanningHub || !IncomeIntelligenceHub || !PerformanceHub || !PortfolioStrategyHub || !TaxStrategyHub) {
        throw new Error('One or more components failed to import')
      }
    })

    // Test 2: Test API connectivity
    await testComponent('Super Cards API', async () => {
      const response = await fetch('/api/super-cards?cards=performance&userId=test')
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      const data = await response.json()
      if (!data.metadata) {
        throw new Error('API response missing metadata')
      }
    })

    // Test 3: Test Batch API
    await testComponent('Super Cards Batch API', async () => {
      const response = await fetch('/api/super-cards/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test',
          requests: [{ id: 'test1', cards: ['performance'] }]
        })
      })
      if (!response.ok) {
        throw new Error(`Batch API returned ${response.status}`)
      }
      const data = await response.json()
      if (!data.results || !data.metadata) {
        throw new Error('Batch API response malformed')
      }
    })

    addResult('🎉 All tests completed!')
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Super Cards System Test Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <button 
              onClick={runTests}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Run Super Cards Tests
            </button>
            
            <div className="bg-gray-100 p-4 rounded min-h-[200px]">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index} className="text-gray-700">
                    {result}
                  </div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-gray-500 italic">
                    Click "Run Super Cards Tests" to start testing...
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="border border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700 text-sm">✅ Components Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>📊 FinancialPlanningHub.tsx</li>
                    <li>💰 IncomeIntelligenceHub.tsx</li>
                    <li>📈 PerformanceHub.tsx</li>
                    <li>🎯 PortfolioStrategyHub.tsx</li>
                    <li>💸 TaxStrategyHub.tsx</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700 text-sm">🔗 API Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>🚀 Main API: /api/super-cards</li>
                    <li>📦 Batch API: /api/super-cards/batch</li>
                    <li>🔄 Caching: Multi-level</li>
                    <li>🛡️ Rate Limiting: Active</li>
                    <li>⚡ LOCAL_MODE: Supported</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}