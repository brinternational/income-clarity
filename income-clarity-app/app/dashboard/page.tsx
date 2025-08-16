'use client'

import { AppShell } from '@/components/AppShell'
import Link from 'next/link'
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Calculator,
  Target,
  ArrowRight,
  LayoutGrid
} from 'lucide-react'

export default function Dashboard() {
  return (
    <AppShell title="Income Clarity - Dashboard">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome to Income Clarity
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your comprehensive financial intelligence dashboard
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/dashboard/super-cards" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <LayoutGrid className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Super Cards
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Advanced analytics and insights with 5 intelligence hubs
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <span className="text-sm font-medium">Open Dashboard</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/portfolio" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <PieChart className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Portfolio
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage your holdings and track performance
                </p>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <span className="text-sm font-medium">Manage Holdings</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>

            <Link href="/analytics" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Analytics
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Detailed charts and performance metrics
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400">
                  <span className="text-sm font-medium">View Analytics</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$118.4K</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Annual Dividends</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$3.4K</p>
                </div>
                <Calculator className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Yield</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2.84%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Holdings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">9</p>
                </div>
                <Target className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}