'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect page for legacy /super-cards route
 * 
 * This page handles backward compatibility by redirecting users
 * from the old /super-cards route to the new /dashboard/super-cards route.
 * 
 * This ensures that:
 * 1. Dashboard button navigation works correctly
 * 2. Any bookmarked /super-cards URLs still function
 * 3. SEO and external links are preserved
 */
export default function SuperCardsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the correct dashboard route
    router.replace('/dashboard/super-cards')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}