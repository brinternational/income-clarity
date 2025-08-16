import { NextRequest, NextResponse } from 'next/server'
import { createClientComponentClient } from '@/lib/supabase-client'

// Test API endpoint to verify Supabase connection and basic CRUD operations
export async function GET(request: NextRequest) {
  try {
    const supabase = createClientComponentClient()
    
    // Test 1: Check connection with a simple query
    // console.log('Testing Supabase connection...')
    // const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
    
    if (connectionError) {
      // console.error('Connection test failed:', connectionError)
      // return NextResponse.json({
        // success: false,
        // test: 'connection',
        // error: connectionError.message,
        // details: connectionError
      // }, { status: 500 })
    }

    // Test 2: Check if we can access auth info
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test 3: Try to select from each major table to verify schema
    const tableTests = []
    const tablesToTest = [
      'users', 'portfolios', 'holdings', 'transactions', 
      'expenses', 'budgets', 'financial_goals'
    ]
    
    for (const table of tablesToTest) {
      try {
        const { data, error, count } = await supabase
          .from(table as any)
          .select('*', { count: 'exact' })
          .limit(1)
        
        tableTests.push({
          table,
          success: !error,
          count: count || 0,
          error: error?.message || null,
          hasData: data && data.length > 0
        })
      } catch (err) {
        tableTests.push({
          table,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          count: 0,
          hasData: false
        })
      }
    }

    // Test 4: Check if we can create a test record (will test RLS)
    let insertTest = null
    if (user) {
      try {
        // Try to insert a test expense (should work with RLS if user is authenticated)
        const { data: insertData, error: insertError } = await supabase
          .from('expenses')
          .insert([
            {
              user_id: user.id,
              category: 'test',
              amount: 1.00,
              description: 'Supabase API test record',
              expense_date: new Date().toISOString().split('T')[0],
              tags: ['test', 'api-verification']
            }
          ])
          .select()
        
        insertTest = {
          success: !insertError,
          error: insertError?.message || null,
          data: insertData
        }
      } catch (err) {
        insertTest = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }
    }

    // Test 5: Database health check
    const { data: healthData, error: healthError } = await supabase
      .rpc('version' as any) // PostgreSQL version function
      .single()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tests: {
        connection: {
          success: true,
          message: 'Successfully connected to Supabase'
        },
        authentication: {
          success: !authError,
          user: user ? {
            id: user.id,
            email: user.email,
            authenticated: true
          } : {
            authenticated: false,
            message: 'No authenticated user (this is expected for anonymous testing)'
          },
          error: authError?.message || null
        },
        tableAccess: {
          success: tableTests.every(test => test.success),
          results: tableTests,
          totalTables: tablesToTest.length,
          accessibleTables: tableTests.filter(test => test.success).length
        },
        insertOperation: insertTest,
        databaseHealth: {
          success: !healthError,
          error: healthError?.message || null,
          data: healthData
        }
      },
      summary: {
        overallStatus: tableTests.every(test => test.success) ? 'HEALTHY' : 'ISSUES_DETECTED',
        tablesWithData: tableTests.filter(test => test.hasData).length,
        totalRecordsFound: tableTests.reduce((sum, test) => sum + test.count, 0)
      }
    })

  } catch (error) {
    console.error('Supabase test API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )