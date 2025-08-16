/**
 * Multi-Level Cache Service for Super Cards API
 * L1: In-memory cache (immediate, <1ms)
 * L2: Redis distributed cache (fast, <10ms)
 * L3: Database materialized views (fallback, <100ms)
 * Target: 80%+ cache hit rate, <50ms response for cached data
 */

import { redis, RedisUtils } from './redis-client'
import { SuperCard, TimeRange } from './super-cards-client'

// Cache statistics interface
interface CacheStats {
  l1Hits: number
  l2Hits: number
  l3Hits: number
  misses: number
  errors: number
  averageResponseTime: number
  hitRate: number
  memoryUsage: number
  lastCleanup: number
}

// Cache configuration per data type
interface CacheConfig {
  l1TTL: number // L1 cache TTL in milliseconds
  l2TTL: number // L2 cache TTL in seconds
  l3TTL: number // L3 cache TTL in seconds
  enableL1: boolean
  enableL2: boolean
  enableL3: boolean
  maxMemoryMB: number
  compressionEnabled: boolean
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  source: 'l1' | 'l2' | 'l3' | 'fresh'
  size?: number // Estimated size in bytes
  accessCount?: number
  lastAccessed?: number
}

// TTL strategy by Super Card type (optimized for data freshness requirements)
const TTL_STRATEGY = {
  performance: {
    l1TTL: 60000,    // 1 minute - portfolio values change frequently
    l2TTL: 300,      // 5 minutes
    l3TTL: 900,      // 15 minutes
    enableL1: true,
    enableL2: true,
    enableL3: true,
    maxMemoryMB: 50,
    compressionEnabled: true
  },
  income: {
    l1TTL: 300000,   // 5 minutes - dividend data changes less frequently
    l2TTL: 3600,     // 1 hour
    l3TTL: 7200,     // 2 hours
    enableL1: true,
    enableL2: true,
    enableL3: true,
    maxMemoryMB: 30,
    compressionEnabled: true
  },
  lifestyle: {
    l1TTL: 600000,   // 10 minutes - expense data changes less often
    l2TTL: 7200,     // 2 hours
    l3TTL: 14400,    // 4 hours
    enableL1: true,
    enableL2: true,
    enableL3: true,
    maxMemoryMB: 20,
    compressionEnabled: false
  },
  strategy: {
    l1TTL: 300000,   // 5 minutes - recommendations change moderately
    l2TTL: 1800,     // 30 minutes
    l3TTL: 3600,     // 1 hour
    enableL1: true,
    enableL2: true,
    enableL3: true,
    maxMemoryMB: 25,
    compressionEnabled: true
  },
  quickActions: {
    l1TTL: 30000,    // 30 seconds - real-time actions
    l2TTL: 60,       // 1 minute
    l3TTL: 300,      // 5 minutes
    enableL1: true,
    enableL2: true,
    enableL3: true,
    maxMemoryMB: 15,
    compressionEnabled: false
  },
  userNew: {
    l1TTL: 15000,    // 15 seconds - new user experience
    l2TTL: 30,       // 30 seconds
    l3TTL: 60,       // 1 minute
    enableL1: true,
    enableL2: true,
    enableL3: false, // Skip L3 for new users
    maxMemoryMB: 10,
    compressionEnabled: false
  }
} as const

class MultiLevelCacheService {
  private l1Cache = new Map<string, CacheItem<any>>()
  private stats: CacheStats = {
    l1Hits: 0,
    l2Hits: 0,
    l3Hits: 0,
    misses: 0,
    errors: 0,
    averageResponseTime: 0,
    hitRate: 0,
    memoryUsage: 0,
    lastCleanup: Date.now()
  }
  private requestTimes: number[] = []
  private maxRequestTimeHistory = 1000
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start cleanup interval for L1 cache
    this.cleanupInterval = setInterval(() => {
      this.cleanupL1Cache()
    }, 60000) // Every minute
  }

  /**
   * Get item from multi-level cache with fallback
   * L1 -> L2 -> L3 -> null (cache miss)
   */
  async get<T>(
    key: string,
    cardType: SuperCard = 'performance'
  ): Promise<{ data: T | null; source: 'l1' | 'l2' | 'l3' | 'miss'; responseTime: number }> {
    const startTime = Date.now()
    const config = TTL_STRATEGY[cardType]
    
    try {
      // L1 Cache: In-memory (fastest, <1ms)
      if (config.enableL1) {
        const l1Result = this.getFromL1<T>(key)
        if (l1Result !== null) {
          const responseTime = Date.now() - startTime
          this.recordHit('l1', responseTime)
          return { data: l1Result, source: 'l1', responseTime }
        }
      }

      // L2 Cache: Redis distributed (<10ms)
      if (config.enableL2) {
        const l2Result = await this.getFromL2<T>(key)
        if (l2Result !== null) {
          // Store in L1 for next access
          if (config.enableL1) {
            this.setInL1(key, l2Result, config.l1TTL, 'l2')
          }
          const responseTime = Date.now() - startTime
          this.recordHit('l2', responseTime)
          return { data: l2Result, source: 'l2', responseTime }
        }
      }

      // L3 Cache: Database materialized views (<100ms)
      if (config.enableL3) {
        const l3Result = await this.getFromL3<T>(key, cardType)
        if (l3Result !== null) {
          // Store in L2 and L1 for next access
          if (config.enableL2) {
            await this.setInL2(key, l3Result, config.l2TTL)
          }
          if (config.enableL1) {
            this.setInL1(key, l3Result, config.l1TTL, 'l3')
          }
          const responseTime = Date.now() - startTime
          this.recordHit('l3', responseTime)
          return { data: l3Result, source: 'l3', responseTime }
        }
      }

      // Cache miss
      const responseTime = Date.now() - startTime
      this.recordMiss(responseTime)
      return { data: null, source: 'miss', responseTime }
      
    } catch (error) {
      // console.error('Cache get error:', error)
      // this.stats.errors++
      const responseTime = Date.now() - startTime
      return { data: null, source: 'miss', responseTime }
    }
  }

  /**
   * L1 Cache: In-memory operations
   */
  private getFromL1<T>(key: string): T | null {
    const item = this.l1Cache.get(key)
    
    if (!item) return null

    // Check if expired
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.l1Cache.delete(key)
      return null
    }

    // Update access tracking
    item.accessCount = (item.accessCount || 0) + 1
    item.lastAccessed = now

    return item.data as T
  }

  private setInL1<T>(key: string, data: T, ttl: number, source: 'l1' | 'l2' | 'l3' | 'fresh'): void {
    const size = this.estimateSize(data)
    
    // Check memory limits
    if (this.getL1MemoryUsageMB() > 100) { // Max 100MB for L1 cache
      this.evictL1Items()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      source,
      size,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    this.l1Cache.set(key, item)
  }

  /**
   * L2 Cache: Redis distributed operations
   */
  private async getFromL2<T>(key: string): Promise<T | null> {
    try {
      return await redis.get<T>(key)
    } catch (error) {
      // console.error('Redis get error:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }) validItems: number }
    l2Stats: { connected: boolean; latency?: number }
    performance: { p95ResponseTime: number; p99ResponseTime: number }
  }> {
    const totalRequests = this.stats.l1Hits + this.stats.l2Hits + this.stats.l3Hits + this.stats.misses
    
    // Calculate hit rate
    const hitRate = totalRequests > 0 
      ? (this.stats.l1Hits + this.stats.l2Hits + this.stats.l3Hits) / totalRequests
      : 0

    // Calculate performance percentiles
    const sortedTimes = this.requestTimes.slice().sort((a, b) => a - b)
    const p95Index = Math.ceil(sortedTimes.length * 0.95) - 1
    const p99Index = Math.ceil(sortedTimes.length * 0.99) - 1
    
    // L1 Stats
    const l1Stats = this.getL1Stats()
    
    // L2 Stats (Redis)
    const l2Health = await redis.healthCheck()
    
    return {
      ...this.stats,
      hitRate,
      l1Stats,
      l2Stats: {
        connected: l2Health.healthy,
        latency: l2Health.latency
      },
      performance: {
        p95ResponseTime: sortedTimes[p95Index] || 0,
        p99ResponseTime: sortedTimes[p99Index] || 0
      }
    }
  }

  private getL1Stats(): { size: number; memoryMB: number; validItems: number } {
    const now = Date.now()
    let validItems = 0
    let totalSize = 0

    for (const [key, item] of this.l1Cache.entries()) {
      if (now - item.timestamp <= item.ttl) {
        validItems++
        totalSize += item.size || 0
      }
    }

    return {
      size: this.l1Cache.size,
      memoryMB: totalSize / (1024 * 1024),
      validItems
    }
  }

  /**
   * Clean up expired items from L1 cache
   */
  public cleanupL1Cache(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, item] of this.l1Cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.l1Cache.delete(key)
        cleanedCount++
      }
    }

    this.stats.lastCleanup = now
    if (cleanedCount > 0) {
      // console.log(`Cleaned ${cleanedCount} expired L1 cache items`)
    }
    
    return cleanedCount
  }

  /**
   * Evict L1 cache items using LRU strategy
   */
  private evictL1Items(): number {
    const entries = Array.from(this.l1Cache.entries())
    
    // Sort by last accessed time (LRU)
    entries.sort(([, a], [, b]) => 
      (a.lastAccessed || 0) - (b.lastAccessed || 0)
    )
    
    // Evict oldest 25% of entries
    const evictCount = Math.floor(entries.length * 0.25)
    let evictedCount = 0
    
    for (let i = 0; i < evictCount && i < entries.length; i++) {
      const [key] = entries[i]
      this.l1Cache.delete(key)
      evictedCount++
    }
    
    // console.log(`Evicted ${evictedCount} L1 cache items due to memory pressure`)
    // return evictedCount
  }

  /**
   * Memory usage calculation for L1 cache
   */
  private getL1MemoryUsageMB(): number {
    let totalSize = 0
    for (const [, item] of this.l1Cache.entries()) {
      totalSize += item.size || 0
    }
    return totalSize / (1024 * 1024)
  }

  /**
   * Estimate size of cached data
   */
  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2 // Rough estimate (UTF-16)
    } catch {
      return 1024 // Default 1KB estimate
    }
  }

  /**
   * Pattern matching for cache invalidation
   */
  private matchesPattern(key: string, pattern: string): boolean {
    // Simple pattern matching - could be enhanced with regex
    return key.includes(pattern)
  }

  /**
   * Record cache hit statistics
   */
  private recordHit(level: 'l1' | 'l2' | 'l3', responseTime: number): void {
    this.stats[`${level}Hits`]++
    this.recordResponseTime(responseTime)
  }

  /**
   * Record cache miss statistics
   */
  private recordMiss(responseTime: number): void {
    this.stats.misses++
    this.recordResponseTime(responseTime)
  }

  /**
   * Record response time for performance tracking
   */
  private recordResponseTime(time: number): void {
    this.requestTimes.push(time)
    
    // Keep only recent request times
    if (this.requestTimes.length > this.maxRequestTimeHistory) {
      this.requestTimes.shift()
    }
    
    // Update average
    const sum = this.requestTimes.reduce((a, b) => a + b, 0)
    this.stats.averageResponseTime = sum / this.requestTimes.length
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    
    this.l1Cache.clear()
    // console.log('Cache service destroyed')
  }
}

// Export singleton instance
export const multiLevelCache = new MultiLevelCacheService()

// Export class for testing or custom instances
export { MultiLevelCacheService }

// Export configuration and utilities
export { TTL_STRATEGY, type CacheConfig, type CacheStats }

// Legacy export for backward compatibility
export const cacheService = {
  get: async <T>(key: string): Promise<T | null> => {
    const result = await multiLevelCache.get<T>(key, 'performance')
    return result.data
  },
  set: async <T>(key: string, data: T, ttl?: number): Promise<void> => {
    const cardType = key.includes('performance') ? 'performance' : 'income'
    await multiLevelCache.set(key, data, cardType)
  },
  delete: async (key: string): Promise<boolean> => {
    return multiLevelCache.delete(key)
  },
  clear: async (): Promise<void> => {
    return multiLevelCache.clear()
  },
  getStats: async () => multiLevelCache.getStats(),
  cleanup: () => multiLevelCache.cleanupL1Cache()
}