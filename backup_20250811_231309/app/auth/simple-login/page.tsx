'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { initializeDemoUser } from '@/lib/demo-data'

export default function SimpleLoginPage() {
  const router = useRouter()
  const [isLogging, setIsLogging] = useState(false)

  const handleDemoLogin = async () => {
    // console.log('🎯 Demo login button clicked!')
    // setIsLogging(true)
    
    try {
      // Initialize comprehensive demo data first
      initializeDemoUser()
      // console.log('✅ Demo data loaded successfully')

      // Simple authentication without context
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true')
      }
      // console.log('✅ Authentication successful')

      // Small delay to ensure all contexts update with demo data
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // console.log('🚀 Redirecting to dashboard with demo data...')
      // router.push('/dashboard')
      
    } catch (error) {
      // console.error('❌ Demo login failed:', error)
      // Still try to proceed
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAuthenticated', 'true')
      }
      router.push('/dashboard')
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Income Clarity
            </h2>
            <p className="text-gray-600">
              Simple demo login for testing
            </p>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={isLogging}
            className={`w-full py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isLogging 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
{isLogging ? 'Loading demo data...' : 'Start Demo'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New to Income Clarity?{' '}
              <a
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}