'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import Link from 'next/link'
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Calculator,
  Target,
  ArrowRight,
  LayoutGrid,
  Layers,
  Bug,
  RefreshCw
} from 'lucide-react'

// Import Design System components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Container } from '@/components/design-system/layout/Container'
import { Grid } from '@/components/design-system/layout/Grid'
import { Stack } from '@/components/design-system/layout/Stack'

export default function Dashboard() {
  const [yodleeDebugData, setYodleeDebugData] = useState<any>(null)
  const [isDebugging, setIsDebugging] = useState(false)
  const [debugError, setDebugError] = useState<string | null>(null)

  const fetchYodleeDebugData = async () => {
    setIsDebugging(true)
    setDebugError(null)
    
    try {
      // Test multiple endpoints
      const results: any = {}
      
      // Test 1: Yodlee accounts
      console.log('Testing /api/yodlee/accounts...')
      const accountsRes = await fetch('/api/yodlee/accounts')
      results.accounts = {
        status: accountsRes.status,
        ok: accountsRes.ok,
        data: accountsRes.ok ? await accountsRes.json() : await accountsRes.text()
      }
      
      // Test 2: Yodlee user info (NEW)
      console.log('Testing /api/yodlee/user...')
      const userRes = await fetch('/api/yodlee/user')
      results.yodleeUser = {
        status: userRes.status,
        ok: userRes.ok,
        data: userRes.ok ? await userRes.json() : await userRes.text()
      }
      
      // Test 3: Health check to see Yodlee configuration
      console.log('Testing /api/health/detailed...')
      const healthRes = await fetch('/api/health/detailed')
      results.health = {
        status: healthRes.status,
        ok: healthRes.ok,
        data: healthRes.ok ? await healthRes.json() : await healthRes.text()
      }
      
      // Test 4: Check if we have any portfolios (should show real vs demo data)
      console.log('Testing /api/portfolios...')
      const portfoliosRes = await fetch('/api/portfolios')
      results.portfolios = {
        status: portfoliosRes.status,
        ok: portfoliosRes.ok,
        data: portfoliosRes.ok ? await portfoliosRes.json() : await portfoliosRes.text()
      }
      
      setYodleeDebugData(results)
    } catch (error: any) {
      setDebugError(error.message)
      console.error('Debug error:', error)
    } finally {
      setIsDebugging(false)
    }
  }

  return (
    <AppShell title="Income Clarity - Dashboard">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <Container maxWidth="7xl">
          {/* Header */}
          <Stack space="lg" className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to Income Clarity
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your comprehensive financial intelligence dashboard
              </p>
            </div>
          </Stack>

          {/* YODLEE DEBUG SECTION - TEMPORARY */}
          <Card variant="outlined" className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <Bug size={20} />
                Yodlee Integration Debug
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Debugging why test data isn't showing from Yodlee
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button
                  onClick={fetchYodleeDebugData}
                  disabled={isDebugging}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {isDebugging ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Debugging...
                    </>
                  ) : (
                    <>
                      <Bug size={16} />
                      Debug Yodlee Connection
                    </>
                  )}
                </button>
                
                {debugError && (
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Error:</h4>
                    <p className="text-red-700 dark:text-red-300">{debugError}</p>
                  </div>
                )}
                
                {yodleeDebugData && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Debug Results:</h4>
                      <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                        {JSON.stringify(yodleeDebugData, null, 2)}
                      </pre>
                    </div>
                    
                    {/* Quick analysis */}
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Quick Analysis:</h4>
                      <ul className="text-sm space-y-1">
                        <li>
                          <strong>Yodlee User Info:</strong> {
                            yodleeDebugData.yodleeUser?.ok 
                              ? `Environment: ${yodleeDebugData.yodleeUser.data?.environment || 'unknown'}, Accounts: ${yodleeDebugData.yodleeUser.data?.accountsSummary?.totalAccounts || 0}`
                              : `Failed (${yodleeDebugData.yodleeUser?.status})`
                          }
                        </li>
                        <li>
                          <strong>Yodlee Accounts:</strong> {
                            yodleeDebugData.accounts?.ok 
                              ? `${Array.isArray(yodleeDebugData.accounts.data) ? yodleeDebugData.accounts.data.length : 'Invalid'} accounts found`
                              : `Failed (${yodleeDebugData.accounts?.status})`
                          }
                        </li>
                        <li>
                          <strong>Portfolios:</strong> {
                            yodleeDebugData.portfolios?.ok 
                              ? `${Array.isArray(yodleeDebugData.portfolios.data) ? yodleeDebugData.portfolios.data.length : 'Invalid'} portfolios found`
                              : `Failed (${yodleeDebugData.portfolios?.status})`
                          }
                        </li>
                        <li>
                          <strong>Health Check:</strong> {
                            yodleeDebugData.health?.ok ? 'OK' : `Failed (${yodleeDebugData.health?.status})`
                          }
                        </li>
                        <li>
                          <strong>Connection Status:</strong> {
                            yodleeDebugData.yodleeUser?.data?.connectionStatus 
                              ? `Connected: ${yodleeDebugData.yodleeUser.data.connectionStatus.isConnected ? 'Yes' : 'No'}`
                              : 'Unknown'
                          }
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="lg" className="mb-8">
            {/* NEW: Unified Super Cards View */}
            <Link href="/dashboard/super-cards-unified" className="block">
              <Card 
                variant="interactive"
                size="md"
                radius="lg"
                hover
                className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl relative overflow-hidden"
              >
                <Badge 
                  variant="warning"
                  size="sm"
                  className="absolute top-2 right-2 bg-yellow-400 text-indigo-900 transform rotate-12"
                >
                  NEW!
                </Badge>
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-4">
                    <Layers className="h-8 w-8 mr-3" />
                    <CardTitle className="text-xl text-white">
                      Unified View
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/90 mb-4">
                    All 5 Super Cards on one screen - see everything at once!
                  </CardDescription>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Try New Experience</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/super-cards" className="block">
              <Card 
                variant="interactive"
                size="md"
                radius="lg"
                hover
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-4">
                    <LayoutGrid className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <CardTitle>
                      Super Cards
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Advanced analytics and insights with 5 intelligence hubs
                  </CardDescription>
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <span className="text-sm font-medium">Open Dashboard</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/portfolio" className="block">
              <Card 
                variant="interactive"
                size="md"
                radius="lg"
                hover
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-4">
                    <PieChart className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                    <CardTitle>
                      Portfolio
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Manage your holdings and track performance
                  </CardDescription>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <span className="text-sm font-medium">Manage Holdings</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics" className="block">
              <Card 
                variant="interactive"
                size="md"
                radius="lg"
                hover
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                    <CardTitle>
                      Analytics
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Detailed charts and performance metrics
                  </CardDescription>
                  <div className="flex items-center text-purple-600 dark:text-purple-400">
                    <span className="text-sm font-medium">View Analytics</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </Grid>

          {/* Quick Stats */}
          <Grid cols={{ base: 1, md: 4 }} gap="md">
            <Card size="sm" radius="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$118.4K</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </Card>

            <Card size="sm" radius="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Annual Dividends</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$3.4K</p>
                </div>
                <Calculator className="h-8 w-8 text-gray-400" />
              </div>
            </Card>

            <Card size="sm" radius="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Yield</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2.84%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </Card>

            <Card size="sm" radius="lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Holdings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">9</p>
                </div>
                <Target className="h-8 w-8 text-gray-400" />
              </div>
            </Card>
          </Grid>
        </Container>
      </div>
    </AppShell>
  )
}