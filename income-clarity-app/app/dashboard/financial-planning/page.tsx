'use client'

import { SidebarAppShell } from '@/components/SidebarAppShell'
import { FinancialPlanningHub } from '@/components/super-cards/FinancialPlanningHub'
import { AuthProvider } from '@/contexts/AuthContext'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { ExpenseProvider } from '@/contexts/ExpenseContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { DataPersistenceProvider } from '@/contexts/DataPersistenceContext'
import { SuperCardProvider } from '@/components/super-cards/SuperCardProvider'
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard'
import { Target } from 'lucide-react'

function FinancialPlanningHubPage() {
  return (
    <SidebarAppShell title="Financial Planning - Income Clarity">
      <div className="py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-2xl">
                <Target className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground dark:text-foreground">
                Financial Planning
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                FIRE progress & milestones
              </p>
            </div>
          </div>
        </div>
        
        {/* Financial Planning Hub Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FinancialPlanningHub />
        </div>
      </div>
    </SidebarAppShell>
  )
}

export default function FinancialPlanningHubPageWrapper() {
  return (
    <AuthProvider>
      <OnboardingGuard>
        <UserProfileProvider>
          <PortfolioProvider>
            <ExpenseProvider>
              <NotificationProvider>
                <DataPersistenceProvider>
                  <SuperCardProvider>
                    <FinancialPlanningHubPage />
                  </SuperCardProvider>
                </DataPersistenceProvider>
              </NotificationProvider>
            </ExpenseProvider>
          </PortfolioProvider>
        </UserProfileProvider>
      </OnboardingGuard>
    </AuthProvider>
  )
}