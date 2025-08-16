/**
 * Cron Job: Stock Price Cache Update
 * Updates cached stock prices for better performance
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { LocalModeUtils } from '@/lib/config/local-mode'

export const runtime = 'nodejs'
export const maxDuration = 120

// Common stock symbols to cache
const SYMBOLS_TO_CACHE = [
  'SPY', 'QQQ', 'VTI', 'IWM', 'VEA', 'VWO',
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA',
  'JNJ', 'PG', 'KO', 'PEP', 'WMT', 'HD',
  'JPM', 'BAC', 'V', 'MA', 'BRK.B',
  'SCHD', 'SPHD', 'VYM', 'HDV', 'NOBL'
]

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // LOCAL_MODE: Skip cron job entirely - no network calls
    if (LocalModeUtils.isEnabled()) {
      LocalModeUtils.log('Cron Stock Price Cache - LOCAL_MODE: Skipping cron job')
      return NextResponse.json({ 
        success: true, 
        cached: 0,
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

    const updateResults = []
    let successCount = 0
    let errorCount = 0

    // Get unique symbols from user holdings
    const { data: userSymbols, error: symbolsError } = await supabase
      .from('holdings')
      .select('symbol')
      .not('symbol', 'is', null)

    const allSymbols = new Set([
      ...SYMBOLS_TO_CACHE,
      ...(userSymbols?.map(h => h.symbol) || [])
    ])

    // console.log(`[CRON] Updating cache for ${allSymbols.size} symbols`)
    // Update prices for each symbol
    for (const symbol of allSymbols) {
      try {
        const price = await fetchStockPrice(symbol)
        
        if (price) {
          const { error: upsertError } = await supabase
            .from('stock_prices')
            .upsert({
              symbol,
              price: price.price,
              change_percent: price.changePercent,
              volume: price.volume,
              market_cap: price.marketCap,
              pe_ratio: price.peRatio,
              dividend_yield: price.dividendYield,
              updated_at: new Date().toISOString()
            })

          if (upsertError) {
            throw upsertError
          }

          updateResults.push({
            symbol,
            status: 'success',
            price: price.price
          })
          successCount++
        } else {
          updateResults.push({
            symbol,
            status: 'no_data',
            error: 'No price data available'
          })
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        // console.error(`[CRON] Failed to update ${symbol}:`, error)
        // updateResults.push({
          // symbol,
          // status: 'error',
          // error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }

    // Clean up old cache entries (older than 7 days)
    const { error: cleanupError } = await supabase
      .from('stock_prices')
      .delete()
      .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // console.log(`[CRON] Stock price cache update completed: ${successCount} success, ${errorCount} errors`)
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      total_symbols: allSymbols.size,
      success_count: successCount,
      error_count: errorCount,
      cleanup_performed: !cleanupError,
      results: updateResults.slice(0, 10) // Limit response size
    })

  } catch (error) {
    console.error('[CRON] Stock price cache update failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )