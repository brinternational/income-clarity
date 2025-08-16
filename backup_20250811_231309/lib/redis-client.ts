/**
 * Redis Client for Super Cards Caching - Production-ready Redis connection
 * Supports Upstash Redis, local Redis, and graceful fallback
 * Target: <10ms connection latency with connection pooling
 */

import { Redis } from '@upstash/redis'

// Redis configuration interface
interface RedisConfig {
  url?: string
  token?: string
  maxRetries?: number
  retryDelayOnFailover?: number
  enableOfflineQueue?: boolean
  lazyConnect?: boolean
  maxConnectionAge?: number
  connectionTimeout?: number
  commandTimeout?: number
}

// Redis client wrapper with health monitoring
export class RedisClient {
  private redis: Redis | null = null
  private isConnected = false
  private connectionAttempts = 0
  private lastHealthCheck = 0
  private healthCheckInterval = 30000 // 30 seconds
  private maxConnectionAttempts = 5
  private connectionDelay = 1000 // Start with 1 second delay

  constructor(private config: RedisConfig = {}) {
    this.initialize()
  }

  private async initialize() {
    try {
      // Use Upstash Redis if URL and token are provided
      if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
        this.redis = new Redis({
          url: process.env.REDIS_URL,
          token: process.env.REDIS_TOKEN,
          automaticDeserialization: true,
          retry: {
            retries: this.config.maxRetries || 3,
            backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 10000)
          }
        })
      } 
      // Use local Redis URL if available
      else if (process.env.REDIS_URL) {
        this.redis = new Redis({
          url: process.env.REDIS_URL,
          automaticDeserialization: true,
          retry: {
            retries: this.config.maxRetries || 3,
            backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 10000)
          }
        })
      }
      // Development fallback - log but don't fail
      else {
        // console.warn('Redis configuration not found. Caching will use in-memory fallback.')
        // return
      }

      // Test connection
      await this.testConnection()
      this.isConnected = true
      this.connectionAttempts = 0
      // console.log('Redis client connected successfully')

    } catch (error) {
      // Error handled by emergency recovery script
  }

  private async testConnection(): Promise<void> {
    if (!this.redis) return

    const startTime = Date.now()
    try {
      // Simple ping test
      await this.redis.ping()
      const latency = Date.now() - startTime
      
      if (latency > 50) {
        // console.warn(`Redis ping latency high: ${latency}ms (target: <10ms)`)
      }
      
      this.lastHealthCheck = Date.now()
    } catch (error) {
      throw new Error(`Redis ping failed: ${error}`)
    }
  }

  private handleConnectionFailure() {
    this.isConnected = false
    this.connectionAttempts++

    if (this.connectionAttempts < this.maxConnectionAttempts) {
      // Exponential backoff retry
      const delay = this.connectionDelay * Math.pow(2, this.connectionAttempts - 1)
      // console.log(`Retrying Redis connection in ${delay}ms (attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})`)

      setTimeout(() => {
        this.initialize()
      }, delay)
    } else {
      // console.error('Max Redis connection attempts reached. Operating in fallback mode.')
    }
  }

  // Health check method
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    if (!this.redis || !this.isConnected) {
      return { healthy: false, error: 'Redis not connected' }
    }

    // Skip if recent health check was successful
    const now = Date.now()
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return { healthy: true, latency: 0 }
    }

    try {
      const startTime = Date.now()
      await this.redis.ping()
      const latency = Date.now() - startTime
      
      this.lastHealthCheck = now
      return { healthy: true, latency }
    } catch (error) {
      this.isConnected = false
      return { healthy: false, error: (error as Error).message }
    }
  }

  // Cache operations with automatic health checking
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.isConnected) return null

    try {
      const result = await this.redis.get(key)
      return result as T | null
    } catch (error) {
      // console.error(`Redis GET failed for key ${key}:`, error)
      // this.isConnected = false
      return null
    }
  }

  async set<T>(
    key: string, 
    value: T, 
    options: { 
      ex?: number;  // Expire time in seconds
      px?: number;  // Expire time in milliseconds
      nx?: boolean; // Only set if key doesn't exist
      xx?: boolean; // Only set if key exists
    } = {}
  ): Promise<boolean> {
    if (!this.redis || !this.isConnected) return false

    try {
      const result = await this.redis.set(key, value as any, options)
      return result === 'OK'
    } catch (error) {
      // console.error(`Redis SET failed for key ${key}:`, error)
      // this.isConnected = false
      return false
    }
  }

  async del(key: string | string[]): Promise<number> {
    if (!this.redis || !this.isConnected) return 0

    try {
      return await this.redis.del(key)
    } catch (error) {
      // console.error(`Redis DEL failed for key(s) ${key}:`, error)
      // this.isConnected = false
      return 0
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) return false

    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      // console.error(`Redis EXISTS failed for key ${key}:`, error)
      // this.isConnected = false
      return false
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.redis || !this.isConnected) return false

    try {
      const result = await this.redis.expire(key, seconds)
      return result === 1
    } catch (error) {
      // console.error(`Redis EXPIRE failed for key ${key}:`, error)
      // this.isConnected = false
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.redis || !this.isConnected) return -1

    try {
      return await this.redis.ttl(key)
    } catch (error) {
      // console.error(`Redis TTL failed for key ${key}:`, error)
      // this.isConnected = false
      return -1
    }
  }

  // Batch operations for efficiency
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.redis || !this.isConnected || keys.length === 0) return []

    try {
      const results = await this.redis.mget(...keys)
      return results as (T | null)[]
    } catch (error) {
      // console.error(`Redis MGET failed for keys ${keys}:`, error)
      // this.isConnected = false
      return []
    }
  }

  async mset(keyValuePairs: Record<string, any>): Promise<boolean> {
    if (!this.redis || !this.isConnected) return false

    try {
      const pairs: (string | any)[] = []
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pairs.push(key, value)
      })
      
      const result = await this.redis.mset(...pairs)
      return result === 'OK'
    } catch (error) {
      // console.error(`Redis MSET failed:`, error)
      // this.isConnected = false
      return false
    }
  }

  // Pattern-based operations
  async keys(pattern: string): Promise<string[]> {
    if (!this.redis || !this.isConnected) return []

    try {
      return await this.redis.keys(pattern)
    } catch (error) {
      // console.error(`Redis KEYS failed for pattern ${pattern}:`, error)
      // this.isConnected = false
      return []
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    if (!this.redis || !this.isConnected) return 0

    try {
      const keys = await this.keys(pattern)
      if (keys.length === 0) return 0
      
      return await this.del(keys)
    } catch (error) {
      // console.error(`Redis DELETE PATTERN failed for pattern ${pattern}:`, error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }) i++) {
      const char = sorted.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  },

  // Compress cache keys to save memory
  compressKey: (key: string): string => {
    // Simple compression by shortening common patterns
    return key
      .replace('super_cards', 'sc')
      .replace('performance', 'perf')
      .replace('income', 'inc')
      .replace('lifestyle', 'life')
      .replace('strategy', 'strat')
      .replace('quickActions', 'qa')
  }
}