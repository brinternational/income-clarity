/**
 * Super Cards Performance Optimization Layer
 * Advanced caching, request batching, and performance monitoring
 */

import { SuperCard } from '@/lib/super-cards-client'

// Performance monitoring
class SuperCardsPerformanceMonitor {
  private static instance: SuperCardsPerformanceMonitor
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private observers: PerformanceObserver[] = []

  static getInstance(): SuperCardsPerformanceMonitor {
    if (!SuperCardsPerformanceMonitor.instance) {
      SuperCardsPerformanceMonitor.instance = new SuperCardsPerformanceMonitor()
    }
    return SuperCardsPerformanceMonitor.instance
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    try {
      // Monitor Core Web Vitals
      const vitalsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('core-web-vitals', {
            name: entry.name,
            value: entry.value || (entry as any).processingStart,
            timestamp: Date.now(),
            type: 'core-web-vital'
          })
        }
      })

      vitalsObserver.observe({ entryTypes: ['layout-shift', 'largest-contentful-paint', 'first-input'] })
      this.observers.push(vitalsObserver)

      // Monitor navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const nav = entry as PerformanceNavigationTiming
          this.recordMetric('navigation', {
            name: 'page-load',
            value: nav.loadEventEnd - nav.fetchStart,
            timestamp: Date.now(),
            type: 'navigation',
            details: {
              dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
              tcpConnect: nav.connectEnd - nav.connectStart,
              serverResponse: nav.responseEnd - nav.requestStart,
              domProcessing: nav.domContentLoadedEventEnd - nav.responseEnd
            }
          })
        }
      })

      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)

    } catch (error) {
      console.warn('Performance observer not supported:', error)
    }
  }

  recordMetric(category: string, metric: PerformanceMetric) {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, [])
    }
    
    const categoryMetrics = this.metrics.get(category)!
    categoryMetrics.push(metric)

    // Keep only last 100 metrics per category
    if (categoryMetrics.length > 100) {
      categoryMetrics.shift()
    }

    // Alert on performance regressions
    this.checkPerformanceThresholds(category, metric)
  }

  private checkPerformanceThresholds(category: string, metric: PerformanceMetric) {
    const thresholds: Record<string, number> = {
      'api-response': 200, // 200ms
      'component-render': 100, // 100ms
      'cache-hit': 50, // 50ms
      'largest-contentful-paint': 2500, // 2.5s
      'first-input-delay': 100, // 100ms
      'cumulative-layout-shift': 0.1 // 0.1 score
    }

    const threshold = thresholds[metric.name] || thresholds[category]
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded: ${category}/${metric.name} = ${metric.value}ms (threshold: ${threshold}ms)`)
      
      // Could integrate with monitoring service here
      this.reportPerformanceIssue(category, metric, threshold)
    }
  }

  private reportPerformanceIssue(category: string, metric: PerformanceMetric, threshold: number) {
    // Integration point for external monitoring (DataDog, Sentry, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_issue', {
        category,
        metric_name: metric.name,
        value: metric.value,
        threshold,
        custom_parameters: {
          user_agent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType || 'unknown'
        }
      })
    }
  }

  getMetrics(category?: string): PerformanceMetric[] {
    if (category) {
      return this.metrics.get(category) || []
    }
    return Array.from(this.metrics.values()).flat()
  }

  getAverageMetric(category: string, name: string): number {
    const categoryMetrics = this.metrics.get(category) || []
    const namedMetrics = categoryMetrics.filter(m => m.name === name)
    
    if (namedMetrics.length === 0) return 0
    
    return namedMetrics.reduce((sum, m) => sum + m.value, 0) / namedMetrics.length
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// Advanced request batching and deduplication
class SuperCardsRequestOptimizer {
  private static instance: SuperCardsRequestOptimizer
  private pendingRequests: Map<string, Promise<any>> = new Map()
  private batchQueue: BatchQueueItem[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 50 // 50ms batch window
  private readonly MAX_BATCH_SIZE = 10

  static getInstance(): SuperCardsRequestOptimizer {
    if (!SuperCardsRequestOptimizer.instance) {
      SuperCardsRequestOptimizer.instance = new SuperCardsRequestOptimizer()
    }
    return SuperCardsRequestOptimizer.instance
  }

  // Request deduplication
  async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const existingRequest = this.pendingRequests.get(key)
    if (existingRequest) {
      return existingRequest as T
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, promise)
    return promise
  }

  // Intelligent request batching
  async batchRequest(cards: SuperCard[], fields?: string[], timeRange?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const item: BatchQueueItem = {
        cards,
        fields,
        timeRange,
        resolve,
        reject,
        timestamp: Date.now()
      }

      this.batchQueue.push(item)

      // If we hit max batch size, process immediately
      if (this.batchQueue.length >= this.MAX_BATCH_SIZE) {
        this.processBatch()
        return
      }

      // Otherwise, set/reset the batch timer
      if (this.batchTimer) {
        clearTimeout(this.batchTimer)
      }

      this.batchTimer = setTimeout(() => {
        this.processBatch()
      }, this.BATCH_DELAY)
    })
  }

  private async processBatch() {
    if (this.batchQueue.length === 0) return

    const batch = [...this.batchQueue]
    this.batchQueue = []
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      // Group similar requests
      const groupedRequests = this.groupBatchRequests(batch)
      
      // Process each group
      const results = await Promise.all(
        groupedRequests.map(group => this.processBatchGroup(group))
      )

      // Distribute results back to original requesters
      this.distributeBatchResults(batch, results.flat())

    } catch (error) {
      // Reject all pending requests
      batch.forEach(item => item.reject(error))
    }
  }

  private groupBatchRequests(batch: BatchQueueItem[]): BatchQueueItem[][] {
    const groups: Map<string, BatchQueueItem[]> = new Map()

    batch.forEach(item => {
      const key = `${item.cards.sort().join(',')}:${item.timeRange || 'default'}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(item)
    })

    return Array.from(groups.values())
  }

  private async processBatchGroup(group: BatchQueueItem[]): Promise<any[]> {
    const representative = group[0]
    const allCards = [...new Set(group.flatMap(item => item.cards))]
    const allFields = [...new Set(group.flatMap(item => item.fields || []))]

    const batchRequest = {
      userId: 'batch-user', // Could be extracted from context
      requests: [{
        id: `batch-${Date.now()}`,
        cards: allCards,
        fields: allFields.length > 0 ? allFields : undefined,
        timeRange: representative.timeRange
      }]
    }

    const response = await fetch('/api/super-cards/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchRequest)
    })

    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.results || []
  }

  private distributeBatchResults(originalRequests: BatchQueueItem[], results: any[]) {
    originalRequests.forEach((request, index) => {
      // Filter results for this specific request
      const relevantData = results[0]?.data || {}
      const filteredData = Object.keys(relevantData)
        .filter(key => request.cards.includes(key as SuperCard))
        .reduce((obj: any, key) => {
          obj[key] = relevantData[key]
          return obj
        }, {})

      request.resolve({
        data: filteredData,
        metadata: {
          source: 'batch',
          batchSize: originalRequests.length,
          responseTime: Date.now() - request.timestamp
        }
      })
    })
  }
}

// Smart prefetching based on user patterns
class SuperCardsPrefetcher {
  private static instance: SuperCardsPrefetcher
  private userPatterns: Map<string, CardAccessPattern> = new Map()
  private prefetchedData: Map<string, CacheItem> = new Map()
  private readonly MAX_PREFETCH_ITEMS = 20

  static getInstance(): SuperCardsPrefetcher {
    if (!SuperCardsPrefetcher.instance) {
      SuperCardsPrefetcher.instance = new SuperCardsPrefetcher()
    }
    return SuperCardsPrefetcher.instance
  }

  // Learn user access patterns
  recordAccess(userId: string, cards: SuperCard[], timeRange?: string) {
    const key = `${userId}:${cards.sort().join(',')}`
    const pattern = this.userPatterns.get(key) || {
      cards,
      timeRange,
      accessCount: 0,
      lastAccess: 0,
      averageInterval: 0
    }

    const now = Date.now()
    if (pattern.lastAccess > 0) {
      const interval = now - pattern.lastAccess
      pattern.averageInterval = (pattern.averageInterval * pattern.accessCount + interval) / (pattern.accessCount + 1)
    }

    pattern.accessCount++
    pattern.lastAccess = now
    this.userPatterns.set(key, pattern)

    // Schedule prefetch for frequently accessed data
    if (pattern.accessCount >= 3 && pattern.averageInterval > 0) {
      const nextAccessTime = now + pattern.averageInterval * 0.8 // Prefetch 20% early
      setTimeout(() => {
        this.prefetchData(userId, cards, timeRange)
      }, Math.max(0, nextAccessTime - now))
    }
  }

  // Intelligent prefetching
  private async prefetchData(userId: string, cards: SuperCard[], timeRange?: string) {
    const cacheKey = `${userId}:${cards.join(',')}:${timeRange || 'default'}`
    
    // Don't prefetch if already cached
    if (this.prefetchedData.has(cacheKey)) {
      return
    }

    try {
      const response = await fetch(`/api/super-cards?cards=${cards.join(',')}&userId=${userId}&timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        
        this.prefetchedData.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: 5 * 60 * 1000 // 5 minutes
        })

        // Cleanup old prefetched data
        this.cleanupPrefetchedData()
      }
    } catch (error) {
      console.warn('Prefetch failed:', error)
    }
  }

  // Get prefetched data
  getPrefetchedData(userId: string, cards: SuperCard[], timeRange?: string): any | null {
    const cacheKey = `${userId}:${cards.join(',')}:${timeRange || 'default'}`
    const item = this.prefetchedData.get(cacheKey)
    
    if (!item) return null
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.prefetchedData.delete(cacheKey)
      return null
    }

    return item.data
  }

  private cleanupPrefetchedData() {
    if (this.prefetchedData.size <= this.MAX_PREFETCH_ITEMS) return

    // Remove oldest items
    const items = Array.from(this.prefetchedData.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)

    const itemsToRemove = items.slice(0, items.length - this.MAX_PREFETCH_ITEMS)
    itemsToRemove.forEach(([key]) => this.prefetchedData.delete(key))
  }
}

// Interfaces
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: string
  details?: Record<string, any>
}

interface BatchQueueItem {
  cards: SuperCard[]
  fields?: string[]
  timeRange?: string
  resolve: (value: any) => void
  reject: (error: any) => void
  timestamp: number
}

interface CardAccessPattern {
  cards: SuperCard[]
  timeRange?: string
  accessCount: number
  lastAccess: number
  averageInterval: number
}

interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

// Export singleton instances
export const performanceMonitor = SuperCardsPerformanceMonitor.getInstance()
export const requestOptimizer = SuperCardsRequestOptimizer.getInstance()
export const prefetcher = SuperCardsPrefetcher.getInstance()

// Performance decorator for Super Cards functions
export function withPerformanceMonitoring(category: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      
      try {
        const result = await method.apply(this, args)
        
        performanceMonitor.recordMetric(category, {
          name: propertyName,
          value: Date.now() - startTime,
          timestamp: Date.now(),
          type: 'method-execution'
        })

        return result
      } catch (error) {
        performanceMonitor.recordMetric(category, {
          name: `${propertyName}-error`,
          value: Date.now() - startTime,
          timestamp: Date.now(),
          type: 'method-error',
          details: { error: error.message }
        })
        throw error
      }
    }

    return descriptor
  }
}