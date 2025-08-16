'use client'

import { useState, useEffect } from 'react'
import { UserProfileProvider, useUserProfile } from '@/contexts/UserProfileContext'
import { PortfolioProvider, usePortfolio } from '@/contexts/PortfolioContext'
import { ExpenseProvider, useExpense } from '@/contexts/ExpenseContext'
import { HoldingFormData } from '@/components/forms/portfolio/AddHoldingForm'
import { ExpenseFormData } from '@/components/forms/expenses/ExpenseForm'

function TestResults() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  
  const { profileData, updateProfile, incomeClarityData } = useUserProfile()
  const { holdings, addHolding, totalValue, monthlyGrossIncome, loading: portfolioLoading } = usePortfolio()
  const { expenses, addExpense, totalMonthlyExpenses, loading: expenseLoading } = useExpense()

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      addResult('🚀 Starting Supabase Integration Tests')
      
      // Test 1: Profile Data
      addResult('📝 Testing profile data...')
      if (profileData) {
        addResult(`✅ Profile loaded: ${profileData.fullName} (${profileData.email})`)
        addResult(`✅ Tax info: ${profileData.taxInfo.federalRate}% federal, ${profileData.taxInfo.stateRate}% state`)
        addResult(`✅ Goals: $${profileData.goals.monthlyExpenses} monthly expenses`)
      } else {
        addResult('❌ No profile data found')
      }

      // Test 2: Update Profile
      addResult('🔄 Testing profile update...')
      try {
        await updateProfile({
          goals: {
            ...profileData?.goals!,
            monthlyExpenses: 4000,
            stressFreeLiving: 5500
          }
        })
        addResult('✅ Profile updated successfully')
      } catch (error) {
        addResult(`⚠️ Profile update: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Test 3: Portfolio Holdings
      addResult('💼 Testing portfolio holdings...')
      addResult(`📊 Current holdings: ${holdings.length} holdings`)
      addResult(`💰 Total portfolio value: $${totalValue.toFixed(2)}`)
      addResult(`📈 Monthly gross income: $${monthlyGrossIncome.toFixed(2)}`)

      // Test 4: Add New Holding
      addResult('➕ Testing add holding...')
      try {
        const testHolding: HoldingFormData = {
          ticker: 'TEST',
          shares: 10,
          avgCost: 50.00,
          currentPrice: 52.50,
          taxTreatment: 'qualified',
          strategy: 'dividend',
          sector: 'Test'
        }
        
        await addHolding(testHolding)
        addResult('✅ Test holding added successfully')
        
        // Wait a moment for state to update
        setTimeout(() => {
          addResult(`📊 Updated holdings count: ${holdings.length}`)
        }, 1000)
      } catch (error) {
        addResult(`⚠️ Add holding: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Test 5: Expenses
      addResult('💸 Testing expenses...')
      addResult(`📊 Current expenses: ${expenses.length} expense(s)`)
      addResult(`💰 Total monthly expenses: $${totalMonthlyExpenses.toFixed(2)}`)

      // Test 6: Add New Expense
      addResult('➕ Testing add expense...')
      try {
        const testExpense: ExpenseFormData = {
          category: 'Test Category',
          amount: 100.00,
          description: 'Test expense for Supabase integration',
          expense_date: new Date().toISOString().split('T')[0],
          recurring: true,
          recurringFrequency: 'monthly'
        }
        
        await addExpense(testExpense)
        addResult('✅ Test expense added successfully')
        
        // Wait a moment for state to update
        setTimeout(() => {
          addResult(`📊 Updated expenses count: ${expenses.length}`)
        }, 1000)
      } catch (error) {
        addResult(`⚠️ Add expense: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Test 7: Income Clarity Calculations
      addResult('🧮 Testing income clarity calculations...')
      if (incomeClarityData) {
        addResult(`✅ Gross monthly: $${incomeClarityData.grossMonthly.toFixed(2)}`)
        addResult(`✅ Net monthly: $${incomeClarityData.netMonthly.toFixed(2)}`)
        addResult(`✅ Monthly expenses: $${incomeClarityData.monthlyExpenses.toFixed(2)}`)
        addResult(`✅ Available to reinvest: $${incomeClarityData.availableToReinvest.toFixed(2)}`)
        addResult(`${incomeClarityData.aboveZeroLine ? '🟢' : '🔴'} Status: ${incomeClarityData.aboveZeroLine ? 'Above zero line!' : 'Below zero line'}`)
      }

      addResult('🎉 All tests completed!')
      
    } catch (error) {
      addResult(`❌ Test suite error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    // Auto-run tests when component mounts and data is loaded
    if (!portfolioLoading && !expenseLoading && !isRunning && testResults.length === 0) {
      setTimeout(runTests, 1000) // Small delay to let everything settle
    }
  }, [portfolioLoading, expenseLoading, isRunning, testResults.length])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Supabase Integration Test Suite
          </h1>
          <p className="text-gray-600 mb-6">
            This page tests the React contexts with Supabase data persistence. 
            The contexts should automatically try Supabase first, then fall back to localStorage if needed.
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isRunning 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run Tests'}
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700"
            >
              🗑️ Clear Results
            </button>
          </div>
        </div>

        {/* Current State Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">👤 Profile Status</h3>
            <div className="space-y-2 text-sm">
              <div>Name: <span className="font-mono">{profileData?.fullName || 'Not loaded'}</span></div>
              <div>Email: <span className="font-mono">{profileData?.email || 'Not loaded'}</span></div>
              <div>Location: <span className="font-mono">{profileData?.location.state || 'N/A'}</span></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">💼 Portfolio Status</h3>
            <div className="space-y-2 text-sm">
              <div>Holdings: <span className="font-mono">{holdings.length}</span></div>
              <div>Total Value: <span className="font-mono">${totalValue.toFixed(2)}</span></div>
              <div>Monthly Income: <span className="font-mono">${monthlyGrossIncome.toFixed(2)}</span></div>
              <div>Loading: <span className="font-mono">{portfolioLoading ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">💸 Expenses Status</h3>
            <div className="space-y-2 text-sm">
              <div>Expenses: <span className="font-mono">{expenses.length}</span></div>
              <div>Monthly Total: <span className="font-mono">${totalMonthlyExpenses.toFixed(2)}</span></div>
              <div>Loading: <span className="font-mono">{expenseLoading ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-black rounded-lg p-6">
          <h3 className="font-bold text-lg text-white mb-4">📊 Test Results</h3>
          <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto">
            <div className="font-mono text-sm space-y-1">
              {testResults.length === 0 ? (
                <div className="text-gray-400">No test results yet. Click "Run Tests" to start.</div>
              ) : (
                testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`${
                      result.includes('✅') ? 'text-green-400' :
                      result.includes('❌') ? 'text-red-400' :
                      result.includes('⚠️') ? 'text-yellow-400' :
                      result.includes('🎉') ? 'text-purple-400' :
                      result.includes('🚀') || result.includes('🔄') ? 'text-blue-400' :
                      'text-white'
                    }`}
                  >
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-2">🔧 Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Environment:</strong>
              <div className="font-mono bg-white p-2 rounded mt-1">
                Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}<br/>
                Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
              </div>
            </div>
            <div>
              <strong>Mock User ID:</strong>
              <div className="font-mono bg-white p-2 rounded mt-1 break-all">
                550e8400-e29b-41d4-a716-446655440000
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestSupabasePage() {
  return (
    <ExpenseProvider>
      <PortfolioProvider>
        <UserProfileProvider>
          <TestResults />
        </UserProfileProvider>
      </PortfolioProvider>
    </ExpenseProvider>
  )
}