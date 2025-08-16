'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'

function DashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to Super Cards - the new dashboard system
    router.replace('/dashboard/super-cards')
  }, [router])
  
  // Show loading state during redirect with AppShell
  return (
    <AppShell title="Income Clarity - Dashboard">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600">Redirecting to Super Cards...</p>
        </div>
      </div>
    </AppShell>
  )
}

export default function Dashboard() {
  return <DashboardRedirect />
}