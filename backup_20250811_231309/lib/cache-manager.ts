/**
 * Cache Manager for Super Cards Hub Endpoints
 * Manages 3-tier caching strategy with intelligent invalidation
 */

import { multiLevelCache } from './cache-service'
import { RedisUtils } from './redis-client'

// Hub-specific cache configurations
const HUB_CACHE_CONFIG = {
  'performance-hub': {
    l1TTL: 60000,    // 1 minute - frequently changing data
    l2TTL: 300,      // 5 minutes
    l3TTL: 900,      // 15 minutes
    cardType: 'performance' as const
  },
  'income-hub': {
    l1TTL: 300000,   // 5 minutes - stable dividend data
    l2TTL: 3600,     // 1 hour
    l3TTL: 7200,     // 2 hours
    cardType: 'income' as const
  },
  'tax-hub': {
    l1TTL: 600000,   // 10 minutes - tax data changes infrequently
    l2TTL: 7200,     // 2 hours
    l3TTL: 14400,    // 4 hours
    cardType: 'lifestyle' as const
  },
  'portfolio-hub': {
    l1TTL: 60000,    // 1 minute - live prices affect portfolio health
    l2TTL: 300,      // 5 minutes
    l3TTL: 900,      // 15 minutes
    cardType: 'performance' as const
  },
  'planning-hub': {
    l1TTL: 300000,   // 5 minutes - planning data is stable
    l2TTL: 3600,     // 1 hour
    l3TTL: 7200,     // 2 hours
    cardType: 'lifestyle' as const
  }
} as const

export type HubEndpoint = keyof typeof HUB_CACHE_CONFIG

// Cache key generator for hub endpoints
export class HubCacheManager {
  private generateCacheKey(
    userId: string,
    hubEndpoint: HubEndpoint,
    timeRange?: string,
    fields?: string[]
  ): string {
    const range = timeRange || '1Y'
    const fieldsHash = fields ? RedisUtils.hashFields(fields) : 'all'
    return `hub:${hubEndpoint}:${userId}:${range}:${fieldsHash}`
  }

  async get<T>(
    userId: string,
    hubEndpoint: HubEndpoint,
    timeRange?: string,
    fields?: string[]
  ): Promise<{
    data: T | null
    source: 'l1' | 'l2' | 'l3' | 'miss'
    responseTime: number
  }> {
    const key = this.generateCacheKey(userId, hubEndpoint, timeRange, fields)
    const config = HUB_CACHE_CONFIG[hubEndpoint]
    
    try {
      const result = await multiLevelCache.get<T>(key, config.cardType)
      
      if (result.data) {
        // console.log(`Cache ${result.source.toUpperCase()} for ${hubEndpoint}: ${userId} (${result.responseTime}ms)`)
      }
      
      return result
    } catch (error) {
      // console.warn(`Cache read error for ${hubEndpoint}:`, error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })