/**
 * Multi-Tier Cache Service
 * 
 * Implements comprehensive caching strategy with:
 * - Memory cache (fastest access, limited size)
 * - Redis cache (shared across instances)
 * - Database cache (persistent storage)
 * - Intelligent TTL management
 * - Cache invalidation strategies
 * - Performance monitoring
 */

import Redis from 'ioredis';
import { logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

export interface CacheConfig {
  key: string;
  ttl: number; // Time to live in milliseconds
  tier: 'memory' | 'redis' | 'database' | 'all';
  tags?: string[]; // For tag-based invalidation
  compressed?: boolean; // For large data compression
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
  compressed?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
  redisConnected: boolean;
  totalKeys: number;
}

export class CacheService {
  private redis: Redis | null = null;
  private redisConnected: boolean = false;
  private prisma: PrismaClient;
  private memoryCache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    memoryHits: 0,
    redisHits: 0,
    databaseHits: 0
  };
  
  // Cache TTL configurations by data type
  public readonly CACHE_TTLS = {
    // Real-time data (short TTL)
    STOCK_PRICES: 60 * 1000,        // 1 minute
    PORTFOLIO_VALUE: 5 * 60 * 1000, // 5 minutes
    USER_SESSION: 15 * 60 * 1000,   // 15 minutes
    
    // Daily data (medium TTL)
    DAILY_PRICES: 24 * 60 * 60 * 1000,      // 24 hours
    MARKET_HOURS: 24 * 60 * 60 * 1000,      // 24 hours
    DIVIDEND_DATA: 7 * 24 * 60 * 60 * 1000, // 7 days
    
    // Static/config data (long TTL)
    COMPANY_INFO: 30 * 24 * 60 * 60 * 1000,     // 30 days
    SECTOR_DATA: 30 * 24 * 60 * 60 * 1000,      // 30 days
    TAX_BRACKETS: 365 * 24 * 60 * 60 * 1000,    // 365 days
    
    // User-specific data
    USER_PREFERENCES: 7 * 24 * 60 * 60 * 1000,  // 7 days
    PORTFOLIO_CONFIG: 24 * 60 * 60 * 1000,      // 24 hours
    
    // API responses
    POLYGON_RESPONSES: 5 * 60 * 1000,            // 5 minutes
    YODLEE_RESPONSES: 15 * 60 * 1000,            // 15 minutes
    
    // Calculated data
    PERFORMANCE_METRICS: 30 * 60 * 1000,        // 30 minutes
    TAX_CALCULATIONS: 60 * 60 * 1000,           // 1 hour
    REBALANCING_SUGGESTIONS: 60 * 60 * 1000     // 1 hour
  };

  // Memory cache size limits
  private readonly MAX_MEMORY_CACHE_SIZE = 1000; // Max items in memory
  private readonly MAX_MEMORY_CACHE_SIZE_MB = 100; // Max memory usage in MB

  constructor() {
    // Initialize Prisma
    this.prisma = new PrismaClient();

    // Initialize Redis with graceful fallback
    this.initializeRedis();

    // Start cleanup interval
    this.startCleanupInterval();
    
    logger.log('💾 Cache Service initialized (Redis optional)');
  }

  /**
   * Initialize Redis with graceful fallback
   */
  private async initializeRedis(): Promise<void> {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 2, // Reduced retries
        lazyConnect: true,
        connectTimeout: 5000, // 5 second timeout
        keyPrefix: 'ic_cache:' // Income Clarity cache prefix
      });

      this.redis.on('connect', () => {
        this.redisConnected = true;
        logger.log('✅ Cache Service Redis connected');
      });

      this.redis.on('error', (error) => {
        this.redisConnected = false;
        logger.warn('⚠️ Cache Service Redis error (degraded mode):', error.message);
      });

      this.redis.on('close', () => {
        this.redisConnected = false;
        logger.warn('⚠️ Cache Service Redis connection closed (memory-only mode)');
      });

      // Test connection with timeout
      try {
        await Promise.race([
          this.redis.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
        ]);
        this.redisConnected = true;
        logger.log('✅ Cache Service Redis connection verified');
      } catch (error) {
        this.redisConnected = false;
        logger.warn('⚠️ Cache Service Redis unavailable, continuing in memory-only mode');
      }
    } catch (error) {
      this.redisConnected = false;
      this.redis = null;
      logger.warn('⚠️ Cache Service Redis initialization failed, using memory-only mode:', (error as Error).message);
    }
  }

  /**
   * Get data from cache with fallback hierarchy
   */
  async get<T>(key: string, fallback?: () => Promise<T>, config?: Partial<CacheConfig>): Promise<T | null> {
    const startTime = Date.now();
    let result: T | null = null;
    let source = '';

    try {
      // 1. Try memory cache first (fastest)
      result = await this.getFromMemory<T>(key);
      if (result !== null) {
        this.stats.hits++;
        this.stats.memoryHits++;
        source = 'memory';
        logger.log(`📦 Cache HIT (memory): ${key} in ${Date.now() - startTime}ms`);
        return result;
      }

      // 2. Try Redis cache (medium speed) - only if connected
      if (this.redisConnected && this.redis) {
        result = await this.getFromRedis<T>(key);
        if (result !== null) {
          this.stats.hits++;
          this.stats.redisHits++;
          source = 'redis';
          
          // Store in memory for next time
          if (config?.tier !== 'redis') {
            await this.setInMemory(key, result, config?.ttl || this.CACHE_TTLS.STOCK_PRICES, config?.tags);
          }
          
          logger.log(`📦 Cache HIT (redis): ${key} in ${Date.now() - startTime}ms`);
          return result;
        }
      }

      // 3. Try database cache (slowest but persistent)
      if (config?.tier === 'all' || config?.tier === 'database') {
        result = await this.getFromDatabase<T>(key);
        if (result !== null) {
          this.stats.hits++;
          this.stats.databaseHits++;
          source = 'database';
          
          // Store in higher tiers for next time
          if (this.redisConnected && this.redis) {
            await this.setInRedis(key, result, config?.ttl || this.CACHE_TTLS.STOCK_PRICES, config?.tags);
          }
          await this.setInMemory(key, result, config?.ttl || this.CACHE_TTLS.STOCK_PRICES, config?.tags);
          
          logger.log(`📦 Cache HIT (database): ${key} in ${Date.now() - startTime}ms`);
          return result;
        }
      }

      // 4. Execute fallback function if provided
      if (fallback) {
        result = await fallback();
        if (result !== null) {
          // Store in appropriate cache tiers
          await this.set(key, result, config || { 
            key, 
            ttl: this.CACHE_TTLS.STOCK_PRICES, 
            tier: 'all' 
          });
          
          logger.log(`📦 Cache MISS (fallback executed): ${key} in ${Date.now() - startTime}ms`);
        }
      }

      this.stats.misses++;
      return result;

    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      this.stats.misses++;
      
      // Try fallback even on cache errors
      if (fallback) {
        try {
          return await fallback();
        } catch (fallbackError) {
          logger.error(`Fallback error for key ${key}:`, fallbackError);
        }
      }
      
      return null;
    }
  }

  /**
   * Set data in cache according to tier configuration
   */
  async set<T>(key: string, data: T, config: CacheConfig): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      switch (config.tier) {
        case 'memory':
          promises.push(this.setInMemory(key, data, config.ttl, config.tags));
          break;
        case 'redis':
          if (this.redisConnected && this.redis) {
            promises.push(this.setInRedis(key, data, config.ttl, config.tags));
          } else {
            logger.warn(`⚠️ Redis unavailable, skipping redis cache for key: ${key}`);
          }
          break;
        case 'database':
          promises.push(this.setInDatabase(key, data, config.ttl, config.tags));
          break;
        case 'all':
          promises.push(
            this.setInMemory(key, data, config.ttl, config.tags),
            this.setInDatabase(key, data, config.ttl, config.tags)
          );
          if (this.redisConnected && this.redis) {
            promises.push(this.setInRedis(key, data, config.ttl, config.tags));
          }
          break;
      }

      await Promise.all(promises);
      logger.log(`💾 Cache SET (${config.tier}): ${key} with TTL ${config.ttl}ms`);

    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete specific key from all cache tiers
   */
  async delete(key: string): Promise<void> {
    try {
      const promises = [
        this.deleteFromMemory(key),
        this.deleteFromDatabase(key)
      ];
      
      if (this.redisConnected && this.redis) {
        promises.push(this.deleteFromRedis(key));
      }
      
      await Promise.all(promises);
      
      logger.log(`🗑️ Cache DELETE: ${key}`);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      // Memory cache tag invalidation
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags && tags.some(tag => entry.tags!.includes(tag))) {
          this.memoryCache.delete(key);
        }
      }

      // Redis cache tag invalidation - only if connected
      if (this.redisConnected && this.redis) {
        try {
          const redisKeys = await this.redis.keys('*');
          for (const key of redisKeys) {
            const entry = await this.getFromRedis<any>(key.replace('ic_cache:', ''));
            if (entry && entry.tags && tags.some(tag => entry.tags.includes(tag))) {
              promises.push(this.deleteFromRedis(key.replace('ic_cache:', '')));
            }
          }
        } catch (error) {
          logger.warn('⚠️ Redis tag invalidation failed, continuing with other tiers:', (error as Error).message);
        }
      }

      // Database cache tag invalidation (using SQL LIKE for tags stored as JSON)
      for (const tag of tags) {
        promises.push(this.invalidateDatabaseByTag(tag));
      }

      await Promise.all(promises);
      logger.log(`🏷️ Cache invalidated by tags: ${tags.join(', ')}`);

    } catch (error) {
      logger.error('Cache tag invalidation error:', error);
      throw error;
    }
  }

  /**
   * Clear all caches (use with caution)
   */
  async clearAll(): Promise<void> {
    try {
      const promises = [
        this.clearMemoryCache(),
        this.clearDatabaseCache()
      ];
      
      if (this.redisConnected && this.redis) {
        promises.push(this.clearRedisCache());
      }
      
      await Promise.all(promises);
      
      logger.log('🧹 All caches cleared');
    } catch (error) {
      logger.error('Cache clear all error:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  async getStats(): Promise<CacheStats> {
    try {
      const memoryUsage = this.calculateMemoryUsage();
      let redisKeys = 0;
      
      if (this.redisConnected && this.redis) {
        try {
          redisKeys = await this.redis.dbsize();
        } catch (error) {
          logger.warn('⚠️ Failed to get Redis key count:', (error as Error).message);
        }
      }
      
      const totalKeys = this.memoryCache.size + redisKeys;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: this.stats.hits + this.stats.misses > 0 
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
          : 0,
        memoryUsage,
        redisConnected: this.redisConnected,
        totalKeys
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: 0,
        memoryUsage: 0,
        redisConnected: false,
        totalKeys: 0
      };
    }
  }

  /**
   * Warmup cache with commonly accessed data
   */
  async warmupCache(keys: Array<{ key: string; fetcher: () => Promise<any>; config: CacheConfig }>): Promise<void> {
    logger.log('🔥 Starting cache warmup...');
    
    const promises = keys.map(async ({ key, fetcher, config }) => {
      try {
        const exists = await this.exists(key);
        if (!exists) {
          const data = await fetcher();
          await this.set(key, data, config);
          logger.log(`🔥 Warmed up cache for: ${key}`);
        }
      } catch (error) {
        logger.error(`Failed to warm up cache for ${key}:`, error);
      }
    });

    await Promise.all(promises);
    logger.log('🔥 Cache warmup completed');
  }

  /**
   * Check if key exists in any cache tier
   */
  async exists(key: string): Promise<boolean> {
    try {
      // Check memory first
      if (this.memoryCache.has(key)) {
        const entry = this.memoryCache.get(key)!;
        if (Date.now() - entry.timestamp < entry.ttl) {
          return true;
        }
      }

      // Check Redis - only if connected
      if (this.redisConnected && this.redis) {
        try {
          const redisExists = await this.redis.exists(key);
          if (redisExists) return true;
        } catch (error) {
          logger.warn(`⚠️ Redis exists check failed for key ${key}:`, (error as Error).message);
        }
      }

      // Check database
      const dbEntry = await this.prisma.cacheEntry.findUnique({
        where: { key }
      });

      return !!dbEntry && Date.now() - dbEntry.createdAt.getTime() < dbEntry.ttl;

    } catch (error) {
      logger.error(`Cache exists check error for key ${key}:`, error);
      return false;
    }
  }

  // Private methods for each cache tier

  private async getFromMemory<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private async setInMemory<T>(key: string, data: T, ttl: number, tags?: string[]): Promise<void> {
    // Check memory limits
    if (this.memoryCache.size >= this.MAX_MEMORY_CACHE_SIZE) {
      this.evictOldestMemoryEntries();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags
    };

    this.memoryCache.set(key, entry);
  }

  private async deleteFromMemory(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.redisConnected || !this.redis) {
      return null;
    }
    
    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      const entry: CacheEntry<T> = JSON.parse(value);
      
      // Check TTL
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.redis.del(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      logger.warn(`⚠️ Redis get error for key ${key}:`, (error as Error).message);
      this.redisConnected = false;
      return null;
    }
  }

  private async setInRedis<T>(key: string, data: T, ttl: number, tags?: string[]): Promise<void> {
    if (!this.redisConnected || !this.redis) {
      logger.warn(`⚠️ Redis unavailable, skipping set for key: ${key}`);
      return;
    }
    
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        tags
      };

      const value = JSON.stringify(entry);
      await this.redis.setex(key, Math.ceil(ttl / 1000), value);
    } catch (error) {
      logger.warn(`⚠️ Redis set error for key ${key}:`, (error as Error).message);
      this.redisConnected = false;
    }
  }

  private async deleteFromRedis(key: string): Promise<void> {
    if (!this.redisConnected || !this.redis) {
      return;
    }
    
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.warn(`⚠️ Redis delete error for key ${key}:`, (error as Error).message);
      this.redisConnected = false;
    }
  }

  private async getFromDatabase<T>(key: string): Promise<T | null> {
    try {
      const entry = await this.prisma.cacheEntry.findUnique({
        where: { key }
      });

      if (!entry) return null;

      // Check TTL
      if (Date.now() - entry.createdAt.getTime() > entry.ttl) {
        await this.prisma.cacheEntry.delete({ where: { key } });
        return null;
      }

      return JSON.parse(entry.data) as T;
    } catch (error) {
      logger.error(`Database get error for key ${key}:`, error);
      return null;
    }
  }

  private async setInDatabase<T>(key: string, data: T, ttl: number, tags?: string[]): Promise<void> {
    try {
      await this.prisma.cacheEntry.upsert({
        where: { key },
        update: {
          data: JSON.stringify(data),
          ttl,
          tags: tags ? JSON.stringify(tags) : null,
          createdAt: new Date()
        },
        create: {
          key,
          data: JSON.stringify(data),
          ttl,
          tags: tags ? JSON.stringify(tags) : null
        }
      });
    } catch (error) {
      logger.error(`Database set error for key ${key}:`, error);
      throw error;
    }
  }

  private async deleteFromDatabase(key: string): Promise<void> {
    try {
      await this.prisma.cacheEntry.delete({ where: { key } });
    } catch (error) {
      // Ignore not found errors
      if (!error.message?.includes('Record to delete does not exist')) {
        logger.error(`Database delete error for key ${key}:`, error);
        throw error;
      }
    }
  }

  private async invalidateDatabaseByTag(tag: string): Promise<void> {
    try {
      // Use raw SQL for JSON search in SQLite
      await this.prisma.$executeRaw`
        DELETE FROM CacheEntry 
        WHERE tags LIKE '%"${tag}"%'
      `;
    } catch (error) {
      logger.error(`Database tag invalidation error for tag ${tag}:`, error);
      throw error;
    }
  }

  private async clearMemoryCache(): Promise<void> {
    this.memoryCache.clear();
  }

  private async clearRedisCache(): Promise<void> {
    if (!this.redisConnected || !this.redis) {
      return;
    }
    
    try {
      await this.redis.flushdb();
    } catch (error) {
      logger.warn('⚠️ Redis clear error:', (error as Error).message);
      this.redisConnected = false;
    }
  }

  private async clearDatabaseCache(): Promise<void> {
    try {
      await this.prisma.cacheEntry.deleteMany({});
    } catch (error) {
      logger.error('Database clear error:', error);
      throw error;
    }
  }

  private evictOldestMemoryEntries(): void {
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  private calculateMemoryUsage(): number {
    // Rough estimate of memory usage in MB
    let totalSize = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      totalSize += JSON.stringify(entry).length * 2; // UTF-16 encoding
    }
    return totalSize / (1024 * 1024); // Convert to MB
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleaned = 0;

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.log(`🧹 Cleaned up ${cleaned} expired cache entries from memory`);
    }
  }

  /**
   * Cleanup method for graceful shutdown
   */
  async cleanup(): Promise<void> {
    try {
      if (this.redis && this.redisConnected) {
        await this.redis.quit();
      }
      await this.prisma.$disconnect();
      logger.log('🔄 Cache Service cleaned up');
    } catch (error) {
      logger.error('Error during cache service cleanup:', error);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export types
export type { CacheConfig, CacheEntry, CacheStats };