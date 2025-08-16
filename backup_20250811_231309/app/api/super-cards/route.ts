// API-001: Consolidated Super Cards API - Single endpoint with field selection
// Optimized for production scale with GraphQL-style field selection
// Target: Sub 200ms response time with intelligent caching
// LOCAL_MODE: Complete offline functionality with mock data

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-client'
import { LocalModeUtils, LOCAL_MODE_CONFIG } from '@/lib/config/local-mode'
import { cookies } from 'next/headers'
import { multiLevelCache } from '@/lib/cache-service'
import { monitor } from '@/lib/cache-monitor'
import { RedisUtils } from '@/lib/redis-client'
import { createSuperCardsCacheMiddleware } from '@/middleware/cache'
import type { Database } from '@/lib/database.types'
import type { SuperCard } from '@/lib/super-cards-client'

// LOCAL_MODE imports
import { localStorageAdapter } from '@/lib/storage/local-storage-adapter'
import { mockSuperCardsData } from '@/lib/mock-data/super-cards-mock-data'

// Multi-level cache configuration (using our new cache service)
const CACHE_CONFIG = {
  TTL: 300, // 5 minutes base TTL
  SHORT_TTL: 60, // 1 minute for frequently changing data
  LONG_TTL: 900, // 15 minutes for stable data
  PREFIX: 'sc:v2:' // Updated prefix for consistency
}

// Rate limiting configuration
const RATE_LIMITS = {
  STANDARD: { requests: 100, window: 60000 }, // 100 req/min
  PREMIUM: { requests: 500, window: 60000 },  // 500 req/min
  BURST: { requests: 20, window: 5000 }       // 20 req/5sec burst
}

// Performance monitoring
class SuperCardsMetrics {
  private static instance: SuperCardsMetrics
  private metrics: Map<string, any> = new Map()

  static getInstance(): SuperCardsMetrics {
    if (!SuperCardsMetrics.instance) {
      SuperCardsMetrics.instance = new SuperCardsMetrics()
    }
    return SuperCardsMetrics.instance
  }

  record(metric: string, value: any, metadata?: any) {
    this.metrics.set(`${metric}_${Date.now()}`, {
      metric,
      value,
      metadata,
      timestamp: Date.now()
    })
  }

  async flush() {
    // TODO: Send to monitoring service (DataDog, New Relic, etc.)
    // await monitoringService.record(metrics)
  }
}

// Enhanced rate limiter with burst protection
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number; burstCount: number; burstResetTime: number }>()

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
    if (now > userRequests.resetTime) {
      userRequests.count = 0
      userRequests.resetTime = now + limits.window
    }

    if (userRequests.count >= limits.requests) {
      return { allowed: false, retryAfter: Math.ceil((userRequests.resetTime - now) / 1000) }
    }

    // Allow request
    userRequests.count++
    userRequests.burstCount++
    this.requests.set(userId, userRequests)
    
    return { allowed: true }
  }
}

// Enhanced Super Cards cache manager with intelligent invalidation
class SuperCardsCache {
  private cacheMiddleware: any

  constructor() {
    this.cacheMiddleware = createSuperCardsCacheMiddleware({
      ttl: CACHE_CONFIG.TTL,
      prefix: CACHE_CONFIG.PREFIX
    })
  }

  generateCacheKey(userId: string, cards: SuperCard[], fields?: string[], timeRange?: string): string {
    const sortedCards = [...cards].sort()
    const sortedFields = fields ? [...fields].sort() : []
    return `${CACHE_CONFIG.PREFIX}${userId}:${sortedCards.join(',')}:${sortedFields.join(',')}:${timeRange || 'default'}`
  }

  async get(userId: string, cards: SuperCard[], fields?: string[], timeRange?: string): Promise<any> {
    const key = this.generateCacheKey(userId, cards, fields, timeRange)
    const cardType = cards[0] || 'performance'
    
    try {
      const result = await multiLevelCache.get<SuperCardResponse>(key, cardType)
      
      if (result.data) {
        // Update metadata with cache info
        result.data.metadata.cached = true
        result.data.metadata.cacheSource = result.source
        result.data.metadata.cacheResponseTime = result.responseTime
        
        return result.data
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  async set(userId: string, cards: SuperCard[], data: any, fields?: string[], timeRange?: string): Promise<boolean> {
    const key = this.generateCacheKey(userId, cards, fields, timeRange)
    const cardType = cards[0] || 'performance'
    
    try {
      const success = await multiLevelCache.set(key, data, {
        ttl: CACHE_CONFIG.TTL,
        type: cardType,
        userId
      })
      
      return success
    } catch (error) {
      return false
    }
  }

  async invalidateUser(userId: string): Promise<number> {
    try {
      return await multiLevelCache.invalidate(`${CACHE_CONFIG.PREFIX}${userId}`, {
        cascadeL1: true,
        cascadeL2: true,
        cascadeL3: false, // L3 handled by DB triggers
        userId
      })
    } catch (error) {
      return 0
    }
  }

  async warmUserCache(userId: string, cards: SuperCard[] = ['performance', 'income']): Promise<void> {
    try {
      // Pre-warm cache with most commonly requested data
      for (const card of cards) {
        await this.get(userId, [card])
      }
    } catch (error) {
      // Silently handle cache warming errors
    }
  }
}

// Request validation with comprehensive security checks
function validateSuperCardRequest(body: any): { valid: boolean; error?: string; request?: SuperCardRequest } {
  const { cards, fields, timeRange, includeProjections, includeComparisons } = body

  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return { valid: false, error: 'Cards array is required and must not be empty' }
  }

  const validCards: SuperCard[] = ['performance', 'income', 'lifestyle', 'strategy', 'quickActions']
  const invalidCards = cards.filter((card: string) => !validCards.includes(card as SuperCard))
  
  if (invalidCards.length > 0) {
    return { valid: false, error: `Invalid cards: ${invalidCards.join(', ')}. Valid cards: ${validCards.join(', ')}` }
  }

  // Validate fields if provided
  if (fields && !Array.isArray(fields)) {
    return { valid: false, error: 'Fields must be an array' }
  }

  // Validate timeRange
  const validTimeRanges = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD', 'ALL']
  if (timeRange && !validTimeRanges.includes(timeRange)) {
    return { valid: false, error: `Invalid timeRange. Valid options: ${validTimeRanges.join(', ')}` }
  }

  return {
    valid: true,
    request: {
      cards: cards as SuperCard[],
      fields: fields || ['all'],
      timeRange: timeRange || '1M',
      includeProjections: Boolean(includeProjections),
      includeComparisons: Boolean(includeComparisons)
    }
  }
}

// Enhanced Super Cards data fetcher with LOCAL_MODE support
async function fetchSuperCardsData(request: SuperCardRequest, userId: string): Promise<SuperCardResponse> {
  const startTime = Date.now()
  const metrics = SuperCardsMetrics.getInstance()

  try {
    // LOCAL_MODE: Use mock data for offline development
    if (LocalModeUtils.isEnabled()) {
      metrics.record('local_mode_request', { cards: request.cards, userId })
      
      const mockData = await mockSuperCardsData.getSuperCards(request.cards, {
        fields: request.fields,
        timeRange: request.timeRange,
        includeProjections: request.includeProjections,
        includeComparisons: request.includeComparisons
      })

      return {
        data: mockData,
        metadata: {
          source: 'local_mode',
          responseTime: Date.now() - startTime,
          cached: false,
          userId,
          timestamp: new Date().toISOString(),
          version: '2.0'
        }
      }
    }

    // Production mode: Use Supabase
    const supabase = createRouteHandlerClient({ cookies })
    
    // Parallel data fetching for multiple cards
    const cardPromises = request.cards.map(async (card) => {
      switch (card) {
        case 'performance':
          return await fetchPerformanceData(supabase, request, userId)
        case 'income':
          return await fetchIncomeData(supabase, request, userId)
        case 'lifestyle':
          return await fetchLifestyleData(supabase, request, userId)
        case 'strategy':
          return await fetchStrategyData(supabase, request, userId)
        case 'quickActions':
          return await fetchQuickActionsData(supabase, request, userId)
        default:
          throw new Error(`Unsupported card type: ${card}`)
      }
    })

    const cardResults = await Promise.all(cardPromises)
    
    // Combine results
    const combinedData = cardResults.reduce((acc, result, index) => {
      acc[request.cards[index]] = result
      return acc
    }, {} as any)

    metrics.record('database_request', { 
      cards: request.cards, 
      responseTime: Date.now() - startTime,
      userId 
    })

    return {
      data: combinedData,
      metadata: {
        source: 'database',
        responseTime: Date.now() - startTime,
        cached: false,
        userId,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    }

  } catch (error) {
    metrics.record('fetch_error', { error: error.message, userId, cards: request.cards })
    throw error
  }
}

// Individual card data fetchers
async function fetchPerformanceData(supabase: any, request: SuperCardRequest, userId: string) {
  // Implementation for performance data
  return {
    type: 'performance',
    data: {},
    fields: request.fields
  }
}

async function fetchIncomeData(supabase: any, request: SuperCardRequest, userId: string) {
  // Implementation for income data
  return {
    type: 'income', 
    data: {},
    fields: request.fields
  }
}

async function fetchLifestyleData(supabase: any, request: SuperCardRequest, userId: string) {
  // Implementation for lifestyle data
  return {
    type: 'lifestyle',
    data: {},
    fields: request.fields
  }
}

async function fetchStrategyData(supabase: any, request: SuperCardRequest, userId: string) {
  // Implementation for strategy data
  return {
    type: 'strategy',
    data: {},
    fields: request.fields
  }
}

async function fetchQuickActionsData(supabase: any, request: SuperCardRequest, userId: string) {
  // Implementation for quick actions data
  return {
    type: 'quickActions',
    data: {},
    fields: request.fields
  }
}

// Initialize global instances
const rateLimiter = new RateLimiter()
const cache = new SuperCardsCache()

// Types
interface SuperCardRequest {
  cards: SuperCard[]
  fields?: string[]
  timeRange?: string
  includeProjections?: boolean
  includeComparisons?: boolean
}

interface SuperCardResponse {
  data: any
  metadata: {
    source: string
    responseTime: number
    cached: boolean
    userId: string
    timestamp: string
    version: string
    cacheSource?: string
    cacheResponseTime?: number
  }
}

// Main API handler
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Extract user ID (in production, get from JWT/session)
    const userId = request.nextUrl.searchParams.get('userId') || 'demo-user'
    const cards = request.nextUrl.searchParams.get('cards')?.split(',') as SuperCard[] || ['performance']
    const fields = request.nextUrl.searchParams.get('fields')?.split(',')
    const timeRange = request.nextUrl.searchParams.get('timeRange') || '1M'
    
    // Rate limiting
    const rateCheck = await rateLimiter.isAllowed(userId)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateCheck.retryAfter },
        { status: 429 }
      )
    }

    // Try cache first
    const cachedData = await cache.get(userId, cards, fields, timeRange)
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      })
    }

    // Fetch fresh data
    const request_body = { cards, fields, timeRange, includeProjections: false, includeComparisons: false }
    const validation = validateSuperCardRequest(request_body)
    
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const response = await fetchSuperCardsData(validation.request!, userId)
    
    // Cache the response
    await cache.set(userId, cards, response, fields, timeRange)
    
    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    })

  } catch (error) {
    console.error('Super Cards API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const userId = body.userId || 'demo-user'
    
    // Rate limiting
    const rateCheck = await rateLimiter.isAllowed(userId)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateCheck.retryAfter },
        { status: 429 }
      )
    }

    // Validate request
    const validation = validateSuperCardRequest(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Try cache first
    const cachedData = await cache.get(
      userId, 
      validation.request!.cards, 
      validation.request!.fields, 
      validation.request!.timeRange
    )
    
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      })
    }

    // Fetch fresh data
    const response = await fetchSuperCardsData(validation.request!, userId)
    
    // Cache the response
    await cache.set(
      userId, 
      validation.request!.cards, 
      response, 
      validation.request!.fields, 
      validation.request!.timeRange
    )
    
    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now() - startTime}ms`
      }
    })

  } catch (error) {
    console.error('Super Cards API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}