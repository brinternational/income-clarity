'use client'

import { Suspense, useState } from 'react'
import { RequireSimpleAuth } from '@/contexts/SimpleAuthContext'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { ExpenseProvider } from '@/contexts/ExpenseContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import BottomNavigation from '@/components/navigation/BottomNavigation'
import { ArrowLeft, CreditCard, Target, TrendingDown, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'

// Import existing expense-related components
import { ExpenseMilestones } from '@/components/dashboard/ExpenseMilestones'
import { ExpenseForm } from '@/components/forms/expenses/ExpenseForm'

function ExpensesPageContent() {
  const router = useRouter()
  const [showAddExpense, setShowAddExpense] = useState(false)

  const handleAddExpense = () => {
    setShowAddExpense(true)
  }

  const handleSettingsClick = () => console.log('Settings clicked')
  const handleLogout = () => router.push('/auth' + '/login')
  const handleAddClick = () => handleAddExpense()

  return (
    <AppShell
      title="Lifestyle Coverage"
      onSettingsClick={handleSettingsClick}
      onLogout={handleLogout}
      onAddClick={handleAddClick}
    >
      {/* PWA Header with back navigation */}
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
                color: 'var(--color-text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-accent-muted)' }}
              >
                <CreditCard className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Expense Management
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Track spending & milestone progress
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Add Expense Button */}
          <button
            onClick={handleAddExpense}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
            style={{ 
              backgroundColor: 'var(--color-accent)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="font-medium">Add Expense</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Expense Overview Cards Row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Monthly Budget Overview */}
          <div 
            className="p-6 rounded-xl border transition-all duration-200"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-border)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-warning-muted)' }}
              >
                <Target className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Monthly Budget
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Total Expenses
                </span>
                <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  $3,200
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  This Month
                </span>
                <span className="text-lg font-semibold" style={{ color: 'var(--color-warning)' }}>
                  $2,847
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: 'var(--color-warning)',
                    width: '89%'
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                89% of monthly budget used
              </p>
            </div>
          </div>

          {/* Expense Velocity */}
          <div 
            className="p-6 rounded-xl border transition-all duration-200"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-border)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-info-muted)' }}
              >
                <TrendingDown className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Spending Trend
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  vs Last Month
                </span>
                <span className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                  -$127
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Daily Average
                </span>
                <span className="text-lg font-semibold" style={{ color: 'var(--color-info)' }}>
                  $94.90
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-success)' }}>
                ↓ 4% decrease from last month
              </p>
            </div>
          </div>

          {/* Coverage Status */}
          <div 
            className="p-6 rounded-xl border transition-all duration-200"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-border)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-success-muted)' }}
              >
                <Target className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              </div>
              <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Coverage Status
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Dividend Income
                </span>
                <span className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                  $3,825
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Coverage Ratio
                </span>
                <span className="text-lg font-semibold" style={{ color: 'var(--color-success)' }}>
                  119.5%
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--color-success)' }}>
                ✅ Fully covered with $625 surplus
              </p>
            </div>
          </div>
        </div>

        {/* Expense Milestones - Full width */}
        <Suspense fallback={
          <div className="animate-pulse bg-gray-200 rounded-xl h-96" />
        }>
          <ExpenseMilestones 
            milestones={[
              {
                id: '1',
                name: 'Monthly Essential Bills',
                amount: 1200,
                covered: false,
                percentageCovered: 95,
                monthlyIncomeNeeded: 60,
                isCustom: false,
                priority: 1
              },
              {
                id: '2',
                name: 'Food & Groceries',
                amount: 800,
                covered: true,
                percentageCovered: 100,
                monthlyIncomeNeeded: 0,
                isCustom: false,
                priority: 2
              },
              {
                id: '3',
                name: 'Entertainment & Dining',
                amount: 500,
                covered: false,
                percentageCovered: 70,
                monthlyIncomeNeeded: 150,
                isCustom: false,
                priority: 3
              }
            ]}
            totalCoverage={119.5}
          />
        </Suspense>

        {/* Recent Expenses & Add Form */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Expenses List */}
          <div 
            className="p-6 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Recent Expenses
            </h3>
            <div className="space-y-3">
              {/* Placeholder for recent expenses - would come from ExpenseContext */}
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Groceries</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Food & Dining • Dec 5</p>
                </div>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>$127.43</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Electric Bill</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Utilities • Dec 3</p>
                </div>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>$89.21</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Gas Station</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Transportation • Dec 2</p>
                </div>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>$45.67</span>
              </div>
            </div>
          </div>

          {/* Add Expense Form */}
          <Suspense fallback={
            <div className="animate-pulse bg-gray-200 rounded-xl h-64" />
          }>
            {showAddExpense && (
              <div 
                className="p-6 rounded-xl border"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Add New Expense
                  </h3>
                  <button
                    onClick={() => setShowAddExpense(false)}
                    className="text-sm px-3 py-1 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: 'var(--color-secondary)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
                <ExpenseForm 
                  onSubmit={async (data) => {
                    // console.log('Expense submitted:', data)
                    // TODO: Integrate with ExpenseContext to save expense
                    setShowAddExpense(false)
                  }}
                  onCancel={() => setShowAddExpense(false)}
                />
              </div>
            )}
            
            {!showAddExpense && (
              <div 
                className="p-6 rounded-xl border border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center h-64"
                style={{ 
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-secondary)'
                }}
                onClick={handleAddExpense}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-muted)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary)'
                }}
              >
                <PlusCircle className="w-12 h-12 mb-3" style={{ color: 'var(--color-accent)' }} />
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Add Expense
                </h3>
                <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  Click to add a new expense and track your spending
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </AppShell>
  )
}

export default function ExpensesPage() {
  return (
    <RequireSimpleAuth>
      <NotificationProvider>
        <UserProfileProvider>
          <PortfolioProvider>
            <ExpenseProvider>
              <ExpensesPageContent />
            </ExpenseProvider>
          </PortfolioProvider>
        </UserProfileProvider>
      </NotificationProvider>
    </RequireSimpleAuth>
  )
}