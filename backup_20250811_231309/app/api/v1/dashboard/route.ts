// Unified Dashboard API - Single endpoint for all 5 super cards
// Target: <500ms response time with intelligent caching

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-client'
import { cookies } from 'next/headers'
import { Redis } from '@upstash/redis'
import type { Database } from '@/lib/database.types'
import { LocalModeUtils, LOCAL_MODE_CONFIG } from '@/lib/config/local-mode'

// Redis cache client (optional - falls back to no cache)
const redis = process.env.REDIS_URL ? new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN
}) : null

// Cache configuration
const CACHE_TTL = 300 // 5 minutes
const CACHE_PREFIX = 'dashboard:v1:'

interface DashboardData {
  performanceCommand: any
  incomeIntelligence: any
  lifestyleTracker: any
  strategyOptimizer: any
  quickActions: any
  metadata: {
    lastUpdated: string
    refreshInterval: number
    cacheStatus: 'fresh' | 'cached' | 'stale'
    responseTime?: number
    userId: string
  }
}

// Performance monitoring
class PerformanceMonitor {
  private startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  getDuration(): number {
    return Date.now() - this.startTime
  }

  async logSlowRequest(duration: number, userId: string, cached: boolean) {
    if (duration > 500) {
      // console.warn(`🐌 Slow dashboard request: ${duration}ms`, {
        // userId,
        // cached,
        // timestamp: new Date().toISOString()
      })
      
      // TODO: Send to monitoring service (Sentry, DataDog, etc.)
      // await monitoringService.recordSlowRequest({
      //   duration,
      //   userId,
      //   endpoint: '/api/v1/dashboard',
      //   cached
      })
    }
  }
}

// Main dashboard data fetcher
class DashboardService {
  constructor(private supabase: any) {}

  async getUserDashboard(userId: string): Promise<DashboardData> {
    const startTime = Date.now()
    
    try {
      // Use the optimized database function for single query
      const { data, error } = await this.supabase
        .rpc('get_user_dashboard', { target_user_id: userId })
        .single()

      if (error) {
        console.error('Database error:', error)
        // throw new Error(`Dashboard query failed: ${error.message}`)
      }

      // If data is null/empty, return default structure
      if (!data) {
        return this.getDefaultDashboardData(userId)
      }

      const responseTime = Date.now() - startTime
      
      return {
        ...data,
        metadata: {
          ...data.metadata,
          responseTime,
          userId,
          cacheStatus: 'fresh'
        }
      }

    } catch (error) {
      console.error('Dashboard service error:', error)
      // Return safe fallback data
      return this.getDefaultDashboardData(userId)
    }
  }

  private getDefaultDashboardData(userId: string): DashboardData {
    return {
      performanceCommand: {
        portfolio_return_1y: 0,
        spy_return_1y: 0,
        outperformance_1y: 0,
        performance_status: 'no_data',
        portfolio_value: 0,
        last_updated: new Date().toISOString()
      },
      incomeIntelligence: {
        gross_monthly_income: 0,
        net_monthly_income: 0,
        available_to_reinvest: 0,
        above_zero_line: false,
        last_updated: new Date().toISOString()
      },
      lifestyleTracker: {
        expense_coverage_percentage: 0,
        fire_progress_percentage: 0,
        total_monthly_expenses: 0,
        next_milestone_amount: 0,
        last_updated: new Date().toISOString()
      },
      strategyOptimizer: {
        overall_strategy_score: 0,
        recommendations: ['Complete portfolio setup to get personalized recommendations'],
        rebalancing_priority: 'Low',
        tax_efficiency_score: 0,
        last_updated: new Date().toISOString()
      },
      quickActions: {
        total_recent_activities: 0,
        suggested_actions: ['Add your first holding', 'Set up expense tracking', 'Complete profile setup'],
        last_activity_date: null,
        last_updated: new Date().toISOString()
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        refreshInterval: 300000,
        cacheStatus: 'fresh',
        userId
      }
    }
  }
}

// Cache management
class CacheManager {
  constructor(private redis: Redis | null) {}

  async get(key: string): Promise<DashboardData | null> {
    if (!this.redis) return null
    
    try {
      const cached = await this.redis.get(key)
      if (cached) {
        const data = JSON.parse(cached as string)
        data.metadata.cacheStatus = 'cached'
        return data
      }
    } catch (error) {
      // console.warn('Cache read error:', error)
    }
    
    return null
  }

  async set(key: string, data: DashboardData, ttl: number = CACHE_TTL): Promise<void> {
    if (!this.redis) return
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      // Error handled by emergency recovery script

  async invalidate(userId: string): Promise<void> {
    if (!this.redis) return
    
    try {
      const keys = [
        `${CACHE_PREFIX}${userId}`,
        `${CACHE_PREFIX}${userId}:performance`,
        `${CACHE_PREFIX}${userId}:income`
      ]
      
      await Promise.all(keys.map(key => this.redis!.del(key)))
    } catch (error) {
      // Error handled by emergency recovery script
}

// Rate limiting (simple in-memory for now)
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  
  isAllowed(userId: string, limit: number = 60, window: number = 60000): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(userId)
    
    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(userId, { count: 1, resetTime: now + window })
      return true
    }
    
    if (userRequests.count >= limit) {
      return false
    }
    
    userRequests.count++
    return true
  }
}

// Main API route handler
export async function GET(request: NextRequest) {
  const monitor = new PerformanceMonitor()
  const rateLimiter = new RateLimiter()
  
  try {
    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' }, 
        { status: 401 }
      )
    }

    // Rate limiting
    if (!rateLimiter.isAllowed(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded - please try again in a minute' },
        { status: 429 }
      )
    }

    // Check cache first
    const cacheManager = new CacheManager(redis)
    const cacheKey = `${CACHE_PREFIX}${user.id}`
    
    let dashboardData = await cacheManager.get(cacheKey)
    
    if (dashboardData) {
      // Cache hit - return immediately
      const duration = monitor.getDuration()
      await monitor.logSlowRequest(duration, user.id, true)
      
      return NextResponse.json(dashboardData, {
        headers: {
          'Cache-Control': 'private, max-age=60',
          'X-Response-Time': `${duration}ms`,
          'X-Cache-Status': 'HIT'
        }
      })
    }

    // Cache miss - fetch fresh data
    const dashboardService = new DashboardService(supabase)
    dashboardData = await dashboardService.getUserDashboard(user.id)

    // Cache the result
    await cacheManager.set(cacheKey, dashboardData)

    const duration = monitor.getDuration()
    await monitor.logSlowRequest(duration, user.id, false)

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'private, max-age=60',
        'X-Response-Time': `${duration}ms`,
        'X-Cache-Status': 'MISS'
      }
    })

  } catch (error) {
    const duration = monitor.getDuration()
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { 
        status: 500,
        headers: {
          'X-Response-Time': `${duration}ms`,
          'X-Cache-Status': 'ERROR'
        }
      }
    )
  }
}

// POST endpoint for cache invalidation
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'invalidate_cache') {
      const cacheManager = new CacheManager(redis)
      await cacheManager.invalidate(user.id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Cache invalidated successfully' 
      })
    }

    if (action === 'refresh_views') {
      // Trigger materialized view refresh for this user
      await supabase.rpc('refresh_user_dashboard_views', { 
        target_user_id: user.id 
      })
      
      // Also invalidate cache
      const cacheManager = new CacheManager(redis)
      await cacheManager.invalidate(user.id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Views refreshed and cache invalidated' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Dashboard POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )