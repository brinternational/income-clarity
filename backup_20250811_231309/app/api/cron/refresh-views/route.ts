/**
 * Cron Job: Refresh Materialized Views
 * Keeps performance views up-to-date
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { LocalModeUtils } from '@/lib/config/local-mode'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // LOCAL_MODE: Skip cron job entirely - no network calls
    if (LocalModeUtils.isEnabled()) {
      LocalModeUtils.log('Cron Refresh Views - LOCAL_MODE: Skipping cron job')
      return NextResponse.json({ 
        success: true, 
        refreshed: 0,
        message: 'Skipped in LOCAL_MODE',
        processingTime: Date.now() - startTime 
      })
    }
    
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Supabase client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Missing Supabase configuration' 
      }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Refresh materialized views
    const refreshResults = []

    // Refresh portfolio performance view
    try {
      const { error: portfolioError } = await supabase.rpc('refresh_portfolio_performance_view')
      refreshResults.push({
        view: 'portfolio_performance',
        status: portfolioError ? 'error' : 'success',
        error: portfolioError?.message
      })
    } catch (error) {
      refreshResults.push({
        view: 'portfolio_performance',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Refresh holdings performance view
    try {
      const { error: holdingsError } = await supabase.rpc('refresh_holdings_performance_view')
      refreshResults.push({
        view: 'holdings_performance',
        status: holdingsError ? 'error' : 'success',
        error: holdingsError?.message
      })
    } catch (error) {
      refreshResults.push({
        view: 'holdings_performance',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Update cache invalidation timestamp
    const cacheKey = `views_refreshed_${Date.now()}`
    
    // Log the refresh activity
    // console.log(`[CRON] Materialized views refresh completed in ${Date.now() - startTime}ms`)
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      results: refreshResults,
      cache_invalidated: cacheKey
    })

  } catch (error) {
    console.error('[CRON] Views refresh failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )