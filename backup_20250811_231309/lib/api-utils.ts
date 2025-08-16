/**
 * Shared API Utilities for Super Cards Consolidated Endpoints
 * Provides common functionality for authentication, error handling, and response formatting
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-client'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// Rate limiting configuration
export const RATE_LIMITS = {
  STANDARD: { requests: 100, window: 60000 }, // 100 requests per minute
  PREMIUM: { requests: 300, window: 60000 }, // 300 requests per minute
  BURST: { requests: 10, window: 1000 } // 10 requests per second burst
}

// Response time targets (milliseconds)
export const RESPONSE_TIME_TARGETS = {
  'performance-hub': 500,
  'income-hub': 300,
  'tax-hub': 400,
  'portfolio-hub': 600, // Higher due to live prices
  'planning-hub': 300
}

// API Error types
export interface APIError {
  error: string
  code: 'UNAUTHORIZED' | 'RATE_LIMIT' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR' | 'NOT_FOUND'
  requestId: string
  retryAfter?: number
}

// Standard API response format
export interface APIResponse<T> {
  data: T
  metadata: {
    requestId: string
    timestamp: string
    responseTime: number
    cached: boolean
    cacheSource?: string
    userId: string
    dataFreshness: string
  }
  status: 'success' | 'error'
}

// Request monitoring class
export class APIMonitor {
  private startTime: number
  private requestId: string

  constructor() {
    this.startTime = Date.now()
    this.requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  getDuration(): number {
    return Date.now() - this.startTime
  }

  getRequestId(): string {
    return this.requestId
  }

  async logMetrics(userId: string, endpoint: string, cached: boolean, error?: Error) {
    const duration = this.getDuration()
    const target = RESPONSE_TIME_TARGETS[endpoint as keyof typeof RESPONSE_TIME_TARGETS] || 500
    
    const metrics = {
      requestId: this.requestId,
      userId,
      endpoint,
      duration,
      target,
      cached,
      timestamp: new Date().toISOString(),
      error: error?.message,
      performance: duration <= target ? 'good' : 'slow'
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      // console.log(`📊 API Metrics [${endpoint}]:`, metrics)
    }

    // Log slow requests
    if (duration > target) {
      // console.warn(`🐌 Slow API request [${endpoint}]: ${duration}ms (target: ${target}ms)`, {
        // requestId: this.requestId,
        // userId,
        // cached
      })
    }

    // TODO: Send to monitoring service (DataDog, New Relic, etc.)
  }
}

// Rate limiter with burst protection
export class RateLimiter {
  private requests = new Map<string, { 
    count: number
    resetTime: number
    burstCount: number
    burstResetTime: number
  }>()

  async isAllowed(userId: string, tier: string = 'free'): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now()
    const limits = tier === 'premium' ? RATE_LIMITS.PREMIUM : RATE_LIMITS.STANDARD
    const burst = RATE_LIMITS.BURST

    const userRequests = this.requests.get(userId) || {
      count: 0,
      resetTime: now + limits.window,
      burstCount: 0,
      burstResetTime: now + burst.window
    }

    // Check burst limit first
    if (now <= userRequests.burstResetTime && userRequests.burstCount >= burst.requests) {
      return { allowed: false, retryAfter: Math.ceil((userRequests.burstResetTime - now) / 1000) }
    }

    // Reset burst counter if window expired
    if (now > userRequests.burstResetTime) {
      userRequests.burstCount = 0
      userRequests.burstResetTime = now + burst.window
    }

    // Check standard rate limit
    if (now <= userRequests.resetTime && userRequests.count >= limits.requests) {
      return { allowed: false, retryAfter: Math.ceil((userRequests.resetTime - now) / 1000) }
    }

    // Reset counter if window expired
    if (now > userRequests.resetTime) {
      userRequests.count = 0
      userRequests.resetTime = now + limits.window
    }

    // Allow request and increment counters
    userRequests.count++
    userRequests.burstCount++
    this.requests.set(userId, userRequests)

    return { allowed: true }
  }
}

// Shared authentication and setup
export async function initializeAPIHandler(request?: NextRequest): Promise<{
  supabase: any
  user: any
  userProfile: any
  monitor: APIMonitor
  rateLimiter: RateLimiter
} | { error: NextResponse }> {
  const monitor = new APIMonitor()
  const rateLimiter = new RateLimiter()

  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient()

    // Check if we're in demo mode (includes missing Supabase credentials)
    const isDemoMode = process.env.NODE_ENV === 'development' || 
                       request?.headers.get('X-Demo-Mode') === 'true' ||
                       request?.url.includes('localhost') ||
                       request?.url.includes('/demo') ||
                       !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                       !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let user, userProfile

    if (isDemoMode) {
      // Create consistent mock user and profile for demo (matches mock client)
      user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'demo@incomeclarity.app',
        app_metadata: {},
        user_metadata: {}
      }
      
      userProfile = {
        subscription_tier: 'premium',
        location: 'US'
      }
      
      // console.log('🎭 Demo mode active - bypassing authentication')
    // } else {
      // Normal authentication for production
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        return {
          error: NextResponse.json(
            { 
              error: 'Unauthorized - authentication required',
              code: 'UNAUTHORIZED',
              requestId: monitor.getRequestId()
            } as APIError, 
            { 
              status: 401, 
              headers: { 'X-Request-ID': monitor.getRequestId() } 
            }
          )
        }
      }

      user = authUser

      // Get user profile for rate limiting
      const { data: profile } = await supabase
        .from('users')
        .select('subscription_tier, location')
        .eq('id', user.id)
        .single()

      userProfile = profile
    }

    return {
      supabase,
      user,
      userProfile,
      monitor,
      rateLimiter
    }
  } catch (error) {
    // console.error('API initialization error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })