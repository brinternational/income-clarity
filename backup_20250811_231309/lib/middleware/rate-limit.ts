/**
 * Advanced Rate Limiting Middleware
 * Implements rate limiting using @upstash/ratelimit with Redis backend
 * Target: 10 requests per 10 seconds per user/IP, with burst allowance
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from 'next/server'
import { LocalModeUtils } from '../config/local-mode'

// Rate limiting configurations for different endpoint types
interface RateLimitConfig {
  requests: number
  window: string
  burst?: number
  priority: 'high' | 'medium' | 'low'
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // High-frequency endpoints
  'super-cards': {
    requests: 10,
    window: '10 s',
    burst: 5,
    priority: 'high'
  },
  'stock-price': {
    requests: 30,
    window: '60 s', 
    burst: 10,
    priority: 'high'
  },
  'health': {
    requests: 60,
    window: '60 s',
    priority: 'low'
  },
  
  // Medium-frequency endpoints
  'portfolios': {
    requests: 20,
    window: '60 s',
    burst: 5,
    priority: 'medium'
  },
  'expenses': {
    requests: 30,
    window: '60 s',
    burst: 10,
    priority: 'medium'
  },
  'transactions': {
    requests: 15,
    window: '60 s',
    burst: 5,
    priority: 'medium'
  },
  
  // Low-frequency but sensitive endpoints
  'auth': {
    requests: 5,
    window: '60 s',
    priority: 'high'
  },
  'profile': {
    requests: 10,
    window: '60 s',
    priority: 'medium'
  },
  
  // Default rate limit
  'default': {
    requests: 10,
    window: '10 s',
    priority: 'medium'
  }
}

export class RateLimitService {
  private static redis: Redis | null = null
  private static rateLimiters = new Map<string, Ratelimit>()
  private static fallbackLimiter: Map<string, { count: number, resetAt: number }> = new Map()

  /**
   * Initialize Redis connection for rate limiting
   */
  private static initializeRedis(): Redis | null {
    if (this.redis) return this.redis

    try {
      // Use Upstash Redis if available
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        // console.log('Rate limiting initialized with Upstash Redis')
      }
      // Use standard Redis if available
      else if (process.env.REDIS_URL) {
        this.redis = new Redis({
          url: process.env.REDIS_URL,
        })
        // console.log('Rate limiting initialized with Redis')
      }
      // No Redis available - will use in-memory fallback
      else {
        // console.warn('No Redis configuration found for rate limiting - using in-memory fallback')
        // return null
      }
    } catch (error) {
      // console.error('Failed to initialize Redis for rate limiting:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }) remaining: number; reset: Date } {
    const now = Date.now()
    const windowMs = this.parseWindow(config.window)
    const key = `${identifier}:${config.window}`
    
    const record = this.fallbackLimiter.get(key)
    
    if (!record || record.resetAt < now) {
      // New window
      const resetAt = now + windowMs
      this.fallbackLimiter.set(key, {
        count: 1,
        resetAt
      })
      
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        reset: new Date(resetAt)
      }
    }
    
    // Existing window
    if (record.count >= config.requests) {
      return {
        success: false,
        limit: config.requests,
        remaining: 0,
        reset: new Date(record.resetAt)
      }
    }
    
    record.count++
    
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests - record.count,
      reset: new Date(record.resetAt)
    }
  }

  /**
   * Parse time window string to milliseconds
   */
  private static parseWindow(window: string): number {
    const match = window.match(/(\d+)\s*([smhd])/)
    if (!match) return 60000 // Default 1 minute
    
    const value = parseInt(match[1])
    const unit = match[2]
    
    switch (unit) {
      case 's': return value * 1000
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      case 'd': return value * 24 * 60 * 60 * 1000
      default: return 60000
    }
  }

  /**
   * Determine endpoint type from pathname
   */
  private static getEndpointType(pathname: string): string {
    if (pathname.includes('/super-cards')) return 'super-cards'
    if (pathname.includes('/stock-price')) return 'stock-price'
    if (pathname.includes('/health')) return 'health'
    if (pathname.includes('/portfolios')) return 'portfolios'
    if (pathname.includes('/expenses')) return 'expenses'
    if (pathname.includes('/transactions')) return 'transactions'
    if (pathname.includes('/auth')) return 'auth'
    if (pathname.includes('/profile')) return 'profile'
    
    return 'default'
  }

  /**
   * Get identifier for rate limiting (user ID > IP address)
   */
  private static getIdentifier(request: NextRequest, userId?: string): string {
    if (userId) return `user:${userId}`
    
    // Try various IP headers (Vercel, Cloudflare, etc.)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               request.headers.get('cf-connecting-ip') ||
               request.headers.get('x-client-ip') ||
               '127.0.0.1'
    
    return `ip:${ip}`
  }

  /**
   * Check rate limit for request
   */
  static async checkRateLimit(
    request: NextRequest,
    userId?: string
  ): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: Date
    retryAfter?: number
  }> {
    // LOCAL_MODE: Skip rate limiting
    if (LocalModeUtils.isEnabled()) {
      return {
        success: true,
        limit: 1000,
        remaining: 999,
        reset: new Date(Date.now() + 60000)
      }
    }

    const pathname = request.nextUrl.pathname
    const endpointType = this.getEndpointType(pathname)
    const identifier = this.getIdentifier(request, userId)
    const config = RATE_LIMIT_CONFIGS[endpointType] || RATE_LIMIT_CONFIGS['default']

    try {
      const rateLimiter = this.getRateLimiter(endpointType)
      
      if (rateLimiter) {
        // Use Redis-backed rate limiting
        const result = await rateLimiter.limit(identifier)
        
        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          retryAfter: result.success ? undefined : Math.ceil((result.reset.getTime() - Date.now()) / 1000)
        }
      } else {
        // Fallback to in-memory rate limiting
        const result = this.checkFallbackRateLimit(identifier, config)
        
        return {
          success: result.success,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          retryAfter: result.success ? undefined : Math.ceil((result.reset.getTime() - Date.now()) / 1000)
        }
      }
    } catch (error) {
      // console.error('Rate limiting error:', error)

      // On error, allow request but log issue
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        reset: new Date(Date.now() + this.parseWindow(config.window))
      }
    }
  }

  /**
   * Get rate limit info without consuming quota
   */
  static async getRateLimitInfo(
    request: NextRequest,
    userId?: string
  ): Promise<{
    limit: number
    remaining: number
    reset: Date
    endpointType: string
  }> {
    const pathname = request.nextUrl.pathname
    const endpointType = this.getEndpointType(pathname)
    const identifier = this.getIdentifier(request, userId)
    const config = RATE_LIMIT_CONFIGS[endpointType] || RATE_LIMIT_CONFIGS['default']

    try {
      const rateLimiter = this.getRateLimiter(endpointType)
      
      if (rateLimiter) {
        // Check current state without consuming
        const info = await rateLimiter.getRemaining(identifier)
        
        return {
          limit: config.requests,
          remaining: info,
          reset: new Date(Date.now() + this.parseWindow(config.window)),
          endpointType
        }
      } else {
        // Fallback info
        const now = Date.now()
        const windowMs = this.parseWindow(config.window)
        const key = `${identifier}:${config.window}`
        const record = this.fallbackLimiter.get(key)
        
        if (!record || record.resetAt < now) {
          return {
            limit: config.requests,
            remaining: config.requests,
            reset: new Date(now + windowMs),
            endpointType
          }
        }
        
        return {
          limit: config.requests,
          remaining: Math.max(0, config.requests - record.count),
          reset: new Date(record.resetAt),
          endpointType
        }
      }
    } catch (error) {
      // console.error('Rate limit info error:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })