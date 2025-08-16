// Super Cards Optimized Client - Production-ready client for all API features
// Supports field selection, batch requests, WebSocket subscriptions, and caching
// Target: 60% payload reduction, <200ms response times

import { useState, useEffect, useCallback } from 'react'
import { SuperCardWebSocketClient } from './websocket-service'

export type SuperCard = 'performance' | 'income' | 'lifestyle' | 'strategy' | 'quickActions'
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'MAX'

// Client configuration
interface SuperCardsClientConfig {
  baseUrl?: string
  enableWebSocket?: boolean
  enableCache?: boolean
  cacheTimeout?: number // seconds
  retryAttempts?: number
  retryDelay?: number
}

// Single card request
interface SuperCardRequest {
  cards: SuperCard[]
  fields?: Partial<Record<SuperCard, string[]>>
  timeRange?: TimeRange
  includeProjections?: boolean
  includeComparisons?: boolean
  includeMetadata?: boolean
}

// Batch request
interface BatchRequest {
  requests: Array<{
    id: string
    userId?: string
    cards: SuperCard[]
    fields?: Partial<Record<SuperCard, string[]>>
    timeRange?: TimeRange
    includeProjections?: boolean
    includeComparisons?: boolean
  }>
  options?: {
    parallelExecution?: boolean
    failFast?: boolean
    cacheResults?: boolean
  }
}

// Response types
interface SuperCardResponse {
  data: Partial<Record<SuperCard, any>>
  metadata: {
    requestId: string
    timestamp: string
    responseTime: number
    cached: boolean
    ttl: number
    userId: string
    dataFreshness: Record<SuperCard, string>
  }
}

interface BatchResponse {
  results: Array<{
    id: string
    success: boolean
    data?: any
    error?: string
    responseTime?: number
    cached?: boolean
  }>
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

// Client-side cache
class SuperCardsCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 100 // Maximum cache entries

  set(key: string, data: any, ttl: number = 300) {
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  clear() {
    this.cache.clear()
  }

  private cleanup() {
    const now = Date.now()
    const toDelete: string[] = []

    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key)
      }
    }

    // Remove oldest entries if still too big
    if (toDelete.length < this.cache.size / 2) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      for (let i = 0; i < Math.floor(this.cache.size / 4); i++) {
        toDelete.push(entries[i][0])
      }
    }

    toDelete.forEach(key => this.cache.delete(key))
  }
}

// Main client class
export class SuperCardsClient {
  private config: Required<SuperCardsClientConfig>
  private cache: SuperCardsCache
  private wsClient?: SuperCardWebSocketClient
  private userId?: string

  constructor(config: SuperCardsClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/api',
      enableWebSocket: config.enableWebSocket ?? true,
      enableCache: config.enableCache ?? true,
      cacheTimeout: config.cacheTimeout ?? 300,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000
    }

    this.cache = new SuperCardsCache()
  }

  // Initialize with user context
  async initialize(userId: string) {
    this.userId = userId

    // Initialize WebSocket connection if enabled
    if (this.config.enableWebSocket && typeof window !== 'undefined') {
      this.wsClient = new SuperCardWebSocketClient(
        userId,
        this.handleWebSocketUpdate.bind(this)
      )
      this.wsClient.connect()
    }
  }

  // Get single set of Super Cards (most common use case)
  async getSuperCards(request: SuperCardRequest): Promise<SuperCardResponse> {
    const cacheKey = this.generateCacheKey('single', request)
    
    // Check cache first
    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return { ...cached, metadata: { ...cached.metadata, cached: true } }
      }
    }

    const url = new URL(`${this.config.baseUrl}/super-cards`, window?.location?.origin || 'http://localhost:3000')
    
    // Build query parameters
    url.searchParams.set('cards', request.cards.join(','))
    
    if (request.fields) {
      url.searchParams.set('fields', JSON.stringify(request.fields))
    }
    
    if (request.timeRange) {
      url.searchParams.set('timeRange', request.timeRange)
    }
    
    if (request.includeProjections) {
      url.searchParams.set('includeProjections', 'true')
    }
    
    if (request.includeComparisons) {
      url.searchParams.set('includeComparisons', 'true')
    }

    const response = await this.fetchWithRetry(url.toString())
    
    if (!response.ok) {
      throw new Error(`Super Cards API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Cache successful responses
    if (this.config.enableCache && data.metadata?.ttl) {
      this.cache.set(cacheKey, data, data.metadata.ttl)
    }

    return data
  }

  // Batch request for multiple card sets
  async getBatchSuperCards(request: BatchRequest): Promise<BatchResponse> {
    const url = `${this.config.baseUrl}/super-cards/batch`
    
    const response = await this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Batch Super Cards API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Cache successful individual results if enabled
    if (this.config.enableCache && request.options?.cacheResults !== false) {
      data.results.forEach((result: any) => {
        if (result.success && result.data) {
          const requestItem = request.requests.find(r => r.id === result.id)
          if (requestItem) {
            const cacheKey = this.generateCacheKey('single', requestItem as any)
            this.cache.set(cacheKey, result.data, 300)
          }
        }
      })
    }

    return data
  }

  // Specialized methods for common patterns

  // Dashboard overview (most common request)
  async getDashboardCards(timeRange: TimeRange = '1Y'): Promise<SuperCardResponse> {
    return this.getSuperCards({
      cards: ['performance', 'income', 'lifestyle'],
      timeRange,
      fields: {
        performance: ['portfolio_value', 'total_return_1y', 'spy_comparison'],
        income: ['monthly_dividend_income', 'net_monthly_income', 'available_to_reinvest'],
        lifestyle: ['expense_coverage_percentage', 'fire_progress', 'surplus_deficit']
      }
    })
  }

  // Complete overview (all cards)
  async getCompleteOverview(timeRange: TimeRange = '1Y'): Promise<SuperCardResponse> {
    return this.getSuperCards({
      cards: ['performance', 'income', 'lifestyle', 'strategy', 'quickActions'],
      timeRange
    })
  }

  // Performance-focused request
  async getPerformanceMetrics(timeRange: TimeRange = '1Y'): Promise<SuperCardResponse> {
    return this.getSuperCards({
      cards: ['performance'],
      timeRange,
      includeProjections: true,
      includeComparisons: true,
      fields: {
        performance: [
          'portfolio_value',
          'total_return_1y', 
          'spy_comparison',
          'volatility',
          'sharpe_ratio',
          'dividend_yield'
        ]
      }
    })
  }

  // Income-focused request  
  async getIncomeAnalysis(timeRange: TimeRange = '1Y'): Promise<SuperCardResponse> {
    return this.getSuperCards({
      cards: ['income', 'lifestyle'],
      timeRange,
      fields: {
        income: [
          'monthly_dividend_income',
          'annual_dividend_income',
          'net_monthly_income',
          'available_to_reinvest',
          'yield_on_cost'
        ],
        lifestyle: [
          'expense_coverage_percentage',
          'surplus_deficit'
        ]
      }
    })
  }

  // Multi-user admin request (requires enterprise subscription)
  async getMultiUserOverview(userIds: string[]): Promise<BatchResponse> {
    const requests = userIds.slice(0, 5).map(userId => ({ // Max 5 users per batch
      id: `user-${userId}`,
      userId,
      cards: ['performance', 'income'] as SuperCard[],
      fields: {
        performance: ['portfolio_value', 'total_return_1y'],
        income: ['monthly_dividend_income', 'net_monthly_income']
      }
    }))

    return this.getBatchSuperCards({
      requests,
      options: {
        parallelExecution: true,
        cacheResults: true
      }
    })
  }

  // WebSocket subscription methods
  subscribeToUpdates(cards: SuperCard[]) {
    if (this.wsClient) {
      this.wsClient.subscribe(cards)
    } else {
      // console.warn('WebSocket not initialized - call initialize() first')
    }
  }

  unsubscribeFromUpdates(cards: SuperCard[]) {
    if (this.wsClient) {
      this.wsClient.unsubscribe(cards)
    }
  }

  // Force refresh of data
  async refreshData(cards?: SuperCard[]) {
    // Invalidate cache for specified cards
    if (cards) {
      cards.forEach(card => this.cache.invalidate(card))
    } else {
      this.cache.clear()
    }

    // Request fresh data via WebSocket
    if (this.wsClient) {
      this.wsClient.refreshData(cards)
    }
  }

  // Cache management
  async invalidateCache(pattern?: string) {
    if (pattern) {
      this.cache.invalidate(pattern)
    } else {
      this.cache.clear()
    }

    // Also invalidate server-side cache
    try {
      await this.fetchWithRetry(`${this.config.baseUrl}/super-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invalidate_cache' })
      })
    } catch (error) {
      // Error handled by emergency recovery script

  // Cleanup and disconnect
  disconnect() {
    if (this.wsClient) {
      this.wsClient.disconnect()
    }
    this.cache.clear()
  }

  // Private methods

  private handleWebSocketUpdate(card: SuperCard, data: any) {
    // Update cache with fresh data from WebSocket
    const cacheKey = `ws:${card}:${this.userId}`
    this.cache.set(cacheKey, { data: { [card]: data } }, 300)

    // Emit event for React components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('superCardUpdate', {
        detail: { card, data }
      }))
    }
  }

  private generateCacheKey(type: string, request: any): string {
    const parts = [
      type,
      this.userId || 'anon',
      request.cards?.sort().join(',') || 'all',
      request.timeRange || '1Y',
      request.fields ? JSON.stringify(request.fields) : 'all'
    ]
    return parts.join(':')
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error = new Error('Unknown error')
    
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'X-Client-Version': '2.0.0',
            'X-Request-Attempt': (attempt + 1).toString()
          }
        })

        // Don't retry 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          return response
        }

        // Retry 5xx and network errors
        if (response.ok || attempt === this.config.retryAttempts - 1) {
          return response
        }

        throw new Error(`HTTP ${response.status}`)
      } catch (error) {
        lastError = error as Error
        
        if (attempt < this.config.retryAttempts - 1) {
          const delay = this.config.retryDelay * Math.pow(2, attempt) // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }
}

// React Hook for easy integration
export function useSuperCards(config?: SuperCardsClientConfig) {
  const [client] = useState(() => new SuperCardsClient(config))
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsConnected(true)
    const handleOffline = () => setIsConnected(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsConnected(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      client.disconnect()
    }
  }, [client])

  const initializeWithUser = useCallback((userId: string) => {
    return client.initialize(userId)
  }, [client])

  return {
    client,
    isConnected,
    initializeWithUser
  }
}

// Export utility functions
export const SuperCardsUtils = {
  // Calculate payload reduction from field selection
  estimatePayloadReduction(cards: SuperCard[], fields?: Partial<Record<SuperCard, string[]>>): number {
    if (!fields) return 0

    const fieldCounts = {
      performance: 7,
      income: 8,
      lifestyle: 8,
      strategy: 7,
      quickActions: 6
    }

    let totalFields = 0
    let selectedFields = 0

    cards.forEach(card => {
      totalFields += fieldCounts[card] || 6
      selectedFields += fields[card]?.length || fieldCounts[card] || 6
    })

    return Math.round((1 - selectedFields / totalFields) * 100)
  },

  // Validate request structure
  validateRequest(request: SuperCardRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!request.cards || request.cards.length === 0) {
      errors.push('Cards array is required and must not be empty')
    }

    const validCards: SuperCard[] = ['performance', 'income', 'lifestyle', 'strategy', 'quickActions']
    const invalidCards = request.cards?.filter(card => !validCards.includes(card)) || []
    
    if (invalidCards.length > 0) {
      errors.push(`Invalid cards: ${invalidCards.join(', ')}`)
    }

    if (request.cards?.length > 5) {
      errors.push('Maximum 5 cards allowed per request')
    }

    return { valid: errors.length === 0, errors }
  },

  // Generate optimized field selection for common use cases
  getOptimizedFields(useCase: 'dashboard' | 'mobile' | 'widget' | 'admin'): Partial<Record<SuperCard, string[]>> {
    const fieldSets = {
      dashboard: {
        performance: ['portfolio_value', 'total_return_1y', 'spy_comparison', 'dividend_yield'],
        income: ['monthly_dividend_income', 'net_monthly_income', 'available_to_reinvest'],
        lifestyle: ['expense_coverage_percentage', 'fire_progress', 'surplus_deficit'],
        strategy: ['overall_score', 'diversification_score', 'recommendations'],
        quickActions: ['suggested_actions', 'completion_score', 'pending_tasks']
      },
      mobile: {
        performance: ['portfolio_value', 'total_return_1y'],
        income: ['monthly_dividend_income', 'net_monthly_income'],
        lifestyle: ['expense_coverage_percentage', 'surplus_deficit'],
        strategy: ['overall_score', 'recommendations'],
        quickActions: ['suggested_actions', 'pending_tasks']
      },
      widget: {
        performance: ['portfolio_value', 'total_return_1y'],
        income: ['monthly_dividend_income'],
        lifestyle: ['expense_coverage_percentage'],
        strategy: ['overall_score'],
        quickActions: ['pending_tasks']
      },
      admin: {} // Admin gets all fields
    }

    return fieldSets[useCase]
  }
}

export default SuperCardsClient

// Re-export types for convenience
export type {
  SuperCardRequest,
  SuperCardResponse,
  BatchRequest,
  BatchResponse,
  SuperCardsClientConfig
}