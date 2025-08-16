// API-003: Batch Request Support for Super Cards
// Multiple cards, multiple users, single request to reduce network overhead
// Optimized for dashboard widgets and admin interfaces

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase-client'
import { LocalModeUtils, LOCAL_MODE_CONFIG } from '@/lib/config/local-mode'
import { cookies } from 'next/headers'
import { Redis } from '@upstash/redis'
import type { Database } from '@/lib/database.types'

// Redis connection
const redis = process.env.REDIS_URL ? new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN
}) : null

// Batch request configuration
const BATCH_LIMITS = {
  MAX_REQUESTS_PER_BATCH: 10,
  MAX_CARDS_PER_REQUEST: 5,
  MAX_USERS_PER_BATCH: 5, // For admin/multi-user requests
  TIMEOUT_MS: 10000, // 10 second timeout for entire batch
}

type SuperCard = 'performance' | 'income' | 'lifestyle' | 'strategy' | 'quickActions'

interface BatchRequestItem {
  id: string // Client-provided request ID for matching responses
  userId?: string // Optional - defaults to authenticated user
  cards: SuperCard[]
  fields?: Partial<Record<SuperCard, string[]>>
  timeRange?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'MAX'
  includeProjections?: boolean
  includeComparisons?: boolean
}

interface BatchRequest {
  requests: BatchRequestItem[]
  options?: {
    parallelExecution?: boolean // Process requests in parallel (default: true)
    failFast?: boolean // Stop on first error (default: false)
    cacheResults?: boolean // Cache individual results (default: true)
  }
}

interface BatchResponseItem {
  id: string // Matches the request ID
  success: boolean
  data?: any
  error?: string
  responseTime?: number
  cached?: boolean
}

interface BatchResponse {
  results: BatchResponseItem[]
  metadata: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    totalResponseTime: number
    averageResponseTime: number
    timestamp: string
    batchId: string
  }
}

class BatchProcessor {
  private supabase: any
  private requestId: string

  constructor(supabase: any) {
    this.supabase = supabase
    this.requestId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  async processBatch(batchRequest: BatchRequest, authenticatedUserId: string): Promise<BatchResponse> {
    const startTime = Date.now()
    const results: BatchResponseItem[] = []
    
    const { requests, options = {} } = batchRequest
    const {
      parallelExecution = true,
      failFast = false,
      cacheResults = true
    } = options

    try {
      if (parallelExecution && !failFast) {
        // Process all requests in parallel
        const promises = requests.map(request => 
          this.processSingleRequest(request, authenticatedUserId, cacheResults)
        )
        
        const settledResults = await Promise.allSettled(promises)
        
        settledResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            results.push({
              id: requests[index].id,
              success: false,
              error: result.reason?.message || 'Unknown error'
            })
          }
        })
      } else {
        // Process requests sequentially
        for (const request of requests) {
          try {
            const result = await this.processSingleRequest(request, authenticatedUserId, cacheResults)
            results.push(result)
            
            if (failFast && !result.success) {
              break
            }
          } catch (error) {
            const errorResult = {
              id: request.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
            results.push(errorResult)
            
            if (failFast) {
              break
            }
          }
        }
      }

      const totalResponseTime = Date.now() - startTime
      const successfulRequests = results.filter(r => r.success).length

      return {
        results,
        metadata: {
          totalRequests: requests.length,
          successfulRequests,
          failedRequests: requests.length - successfulRequests,
          totalResponseTime,
          averageResponseTime: Math.round(totalResponseTime / requests.length),
          timestamp: new Date().toISOString(),
          batchId: this.requestId
        }
      }

    } catch (error) {
      // Error handled by emergency recovery script
  }

  private async processSingleRequest(
    request: BatchRequestItem, 
    authenticatedUserId: string, 
    enableCache: boolean
  ): Promise<BatchResponseItem> {
    const startTime = Date.now()
    const requestUserId = request.userId || authenticatedUserId

    try {
      // Validate user access (users can only access their own data unless admin)
      if (request.userId && request.userId !== authenticatedUserId) {
        // Check if authenticated user is admin
        const { data: authUser } = await this.supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', authenticatedUserId)
          .single()

        if (authUser?.subscription_tier !== 'enterprise') {
          return {
            id: request.id,
            success: false,
            error: 'Unauthorized: Cannot access other users data',
            responseTime: Date.now() - startTime
          }
        }
      }

      // Check cache first if enabled
      if (enableCache && redis) {
        const cacheKey = this.generateCacheKey(requestUserId, request)
        const cached = await this.getCachedResult(cacheKey)
        
        if (cached) {
          return {
            id: request.id,
            success: true,
            data: cached,
            responseTime: Date.now() - startTime,
            cached: true
          }
        }
      }

      // Fetch fresh data for each card
      const cardData: Record<SuperCard, any> = {}
      const dataPromises = request.cards.map(async (card) => {
        const data = await this.fetchCardData(requestUserId, card, request.fields?.[card], request.timeRange)
        cardData[card] = data
      })

      await Promise.all(dataPromises)

      const result = {
        data: cardData,
        metadata: {
          userId: requestUserId,
          cards: request.cards,
          timeRange: request.timeRange || '1Y',
          dataFreshness: request.cards.reduce((acc, card) => {
            acc[card] = new Date().toISOString()
            return acc
          }, {} as Record<SuperCard, string>)
        }
      }

      // Cache the result if enabled
      if (enableCache && redis) {
        const cacheKey = this.generateCacheKey(requestUserId, request)
        await this.cacheResult(cacheKey, result, 300) // 5 minute TTL
      }

      return {
        id: request.id,
        success: true,
        data: result,
        responseTime: Date.now() - startTime,
        cached: false
      }

    } catch (error) {
      // console.error(`Error processing request ${request.id}:`, error)
      return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )} {
  if (!body.requests || !Array.isArray(body.requests)) {
    return { valid: false, error: 'requests array is required' }
  }

  if (body.requests.length === 0) {
    return { valid: false, error: 'requests array cannot be empty' }
  }

  if (body.requests.length > BATCH_LIMITS.MAX_REQUESTS_PER_BATCH) {
    return { valid: false, error: `Maximum ${BATCH_LIMITS.MAX_REQUESTS_PER_BATCH} requests per batch` }
  }

  // Validate each request
  const validCards: SuperCard[] = ['performance', 'income', 'lifestyle', 'strategy', 'quickActions']
  const validTimeRanges = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD', 'MAX']

  for (const [index, request] of body.requests.entries()) {
    if (!request.id) {
      return { valid: false, error: `Request at index ${index} missing required 'id' field` }
    }

    if (!request.cards || !Array.isArray(request.cards) || request.cards.length === 0) {
      return { valid: false, error: `Request '${request.id}' missing or empty 'cards' array` }
    }

    if (request.cards.length > BATCH_LIMITS.MAX_CARDS_PER_REQUEST) {
      return { valid: false, error: `Request '${request.id}' exceeds maximum ${BATCH_LIMITS.MAX_CARDS_PER_REQUEST} cards` }
    }

    const invalidCards = request.cards.filter((card: string) => !validCards.includes(card as SuperCard))
    if (invalidCards.length > 0) {
      return { 
        valid: false, 
        error: `Request '${request.id}' has invalid cards: ${invalidCards.join(', ')}. Valid: ${validCards.join(', ')}` 
      }
    }

    if (request.timeRange && !validTimeRanges.includes(request.timeRange)) {
      return { 
        valid: false, 
        error: `Request '${request.id}' has invalid timeRange. Valid: ${validTimeRanges.join(', ')}` 
      }
    }
  }

  // Check for unique request IDs
  const requestIds = body.requests.map((r: any) => r.id)
  const uniqueIds = new Set(requestIds)
  if (uniqueIds.size !== requestIds.length) {
    return { valid: false, error: 'Request IDs must be unique within a batch' }
  }

  // Check unique user count for admin requests
  const uniqueUsers = new Set(
    body.requests
      .map((r: any) => r.userId)
      .filter((userId: string) => userId)
  )
  
  if (uniqueUsers.size > BATCH_LIMITS.MAX_USERS_PER_BATCH) {
    return { valid: false, error: `Maximum ${BATCH_LIMITS.MAX_USERS_PER_BATCH} different users per batch` }
  }

  return { valid: true, batchRequest: body as BatchRequest }
}

// Main POST endpoint for batch requests
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    })

    // Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' }, 
        { status: 401 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const validation = validateBatchRequest(body)
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Set timeout for entire batch
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Batch request timeout')), BATCH_LIMITS.TIMEOUT_MS)
    })

    // Process batch
    const processor = new BatchProcessor(supabase)
    const batchPromise = processor.processBatch(validation.batchRequest!, user.id)

    const result = await Promise.race([batchPromise, timeoutPromise]) as BatchResponse

    const totalTime = Date.now() - startTime

    return NextResponse.json(result, {
      headers: {
        'X-Batch-Response-Time': `${totalTime}ms`,
        'X-Batch-ID': result.metadata.batchId,
        'X-Success-Rate': `${(result.metadata.successfulRequests / result.metadata.totalRequests * 100).toFixed(1)}%`
      }
    })

  } catch (error) {
    console.error('Batch API error:', error)
return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )