'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard'
import { TremorSuperCardsDashboard } from '@/components/tremor-dashboard/TremorSuperCardsDashboard'
import { Toaster } from 'react-hot-toast'

export default function TremorDashboardPage() {
  return (
    <AuthProvider>
      <OnboardingGuard>
        <UserProfileProvider>
          <div className="min-h-screen bg-background">
            <TremorSuperCardsDashboard />
            <Toaster position="top-right" />
          </div>
        </UserProfileProvider>
      </OnboardingGuard>
    </AuthProvider>
  )
}