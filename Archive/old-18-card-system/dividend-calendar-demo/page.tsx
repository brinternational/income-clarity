'use client'

import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { PortfolioProvider } from '@/contexts/PortfolioContext'
import { DividendCalendar } from '@/components/dashboard/DividendCalendar'

export default function DividendCalendarDemo() {
  return (
    <UserProfileProvider>
      <PortfolioProvider>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Dividend Calendar Demo</h1>
              <p className="text-gray-600">Comprehensive dividend analytics and forecasting features</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Features Implemented:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">Seasonal Analysis</h3>
                  <p className="text-sm text-indigo-700">Quarterly income pattern visualization with insights</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Forecast Accuracy</h3>
                  <p className="text-sm text-green-700">Track prediction vs actual with confidence scores</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">Special Dividends</h3>
                  <p className="text-sm text-orange-700">Identify and track special dividend payments</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Tax Withholding</h3>
                  <p className="text-sm text-red-700">Net vs gross calculations with tax planning</p>
                </div>
              </div>
            </div>
            
            <DividendCalendar />
          </div>
        </div>
      </PortfolioProvider>
    </UserProfileProvider>
  )
}