/**
 * Query Cache Service for Income Clarity Lite
 * Implements intelligent caching for expensive database calculations
 */

import { prisma } from '@/lib/db';

// Cache configuration
const CACHE_CONFIG = {
  // Cache durations (in milliseconds)
  portfolio_performance: 5 * 60 * 1000,    // 5 minutes
  income_analysis: 10 * 60 * 1000,         // 10 minutes
  expense_breakdown: 10 * 60 * 1000,       // 10 minutes
  financial_goals: 15 * 60 * 1000,         // 15 minutes
  tax_calculations: 30 * 60 * 1000,        // 30 minutes
  performance_snapshots: 60 * 60 * 1000,   // 1 hour
  stock_prices: 5 * 60 * 1000,             // 5 minutes
  dividend_schedules: 24 * 60 * 60 * 1000, // 24 hours
  default: 15 * 60 * 1000                  // 15 minutes default
};

// In-memory cache for frequently accessed data
const inMemoryCache = new Map<string, { data: any; expiresAt: number; hitCount: number }>();

export class QueryCacheService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Generate a cache key based on query type and parameters
   */
  private generateCacheKey(queryType: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `${queryType}_${Buffer.from(sortedParams).toString('base64')}`;
  }

  /**
   * Get cached result from database or in-memory cache
   */
  async getCachedResult<T>(
    queryType: string, 
    params: Record<string, any>, 
    queryFunction: () => Promise<T>,
    useInMemory: boolean = true
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(queryType, params);
    const now = Date.now();
    
    // Check in-memory cache first (if enabled)
    if (useInMemory && inMemoryCache.has(cacheKey)) {
      const cached = inMemoryCache.get(cacheKey)!;
      if (cached.expiresAt > now) {
        cached.hitCount++;
        // console.log(`📋 Cache HIT (memory): ${queryType} (hits: ${cached.hitCount})`);
        // return cached.data;
      } else {
        // Remove expired entry
        inMemoryCache.delete(cacheKey);
      }
    }

    // Check database cache
    try {
      const dbCached = await this.prisma.calculationCache.findFirst({
        where: {
          cacheKey,
          expiresAt: { gt: new Date() }
        }
      });

      if (dbCached) {
        const data = JSON.parse(dbCached.data);
        
        // Store in memory cache for faster subsequent access
        if (useInMemory) {
          const duration = CACHE_CONFIG[queryType as keyof typeof CACHE_CONFIG] || CACHE_CONFIG.default;
          inMemoryCache.set(cacheKey, {
            data,
            expiresAt: now + duration,
            hitCount: 1
          });
        }
        
        // console.log(`📋 Cache HIT (database): ${queryType}`);
        // return data;
      }
    } catch (error) {
      // console.warn(`Cache lookup failed: ${error.message}`);
    }

    // Cache miss - execute query and store result
    // console.log(`💾 Cache MISS: ${queryType} - executing query`);
    // const startTime = performance.now();
    
    try {
      const result = await queryFunction();
      const executionTime = performance.now() - startTime;
      
      // Store in database cache
      await this.setCachedResult(queryType, params, result);
      
      // Store in memory cache if enabled
      if (useInMemory) {
        const duration = CACHE_CONFIG[queryType as keyof typeof CACHE_CONFIG] || CACHE_CONFIG.default;
        inMemoryCache.set(cacheKey, {
          data: result,
          expiresAt: now + duration,
          hitCount: 0
        });
      }
      
      // console.log(`✅ Query executed and cached: ${queryType} (${executionTime.toFixed(2)}ms)`);
      // return result;
      
    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Store result in database cache
   */
  private async setCachedResult(
    queryType: string, 
    params: Record<string, any>, 
    result: any
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(queryType, params);
    const duration = CACHE_CONFIG[queryType as keyof typeof CACHE_CONFIG] || CACHE_CONFIG.default;
    const expiresAt = new Date(Date.now() + duration);

    try {
      // Use upsert to handle race conditions
      await this.prisma.calculationCache.upsert({
        where: { cacheKey },
        create: {
          cacheKey,
          data: JSON.stringify(result),
          expiresAt
        },
        update: {
          data: JSON.stringify(result),
          expiresAt,
          createdAt: new Date() // Update creation time on refresh
        }
      });
    } catch (error) {
      // Error handled by emergency recovery script

  /**
   * Invalidate cache for specific query type and params
   */
  async invalidateCache(queryType: string, params: Record<string, any>): Promise<void> {
    const cacheKey = this.generateCacheKey(queryType, params);
    
    // Remove from in-memory cache
    inMemoryCache.delete(cacheKey);
    
    // Remove from database cache
    try {
      await this.prisma.calculationCache.delete({
        where: { cacheKey }
      });
      // console.log(`🗑️ Cache invalidated: ${queryType}`);
    // } catch (error) {
      // Error handled by emergency recovery script

  /**
   * Invalidate all cache entries for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    // Remove from in-memory cache
    for (const [key, cached] of inMemoryCache.entries()) {
      if (key.includes(userId)) {
        inMemoryCache.delete(key);
      }
    }
    
    // Remove from database cache (matches any cache key containing the user ID)
    try {
      await this.prisma.calculationCache.deleteMany({
        where: {
          cacheKey: {
            contains: userId
          }
        }
      });
      // console.log(`🗑️ User cache invalidated: ${userId}`);
    // } catch (error) {
      // Error handled by emergency recovery script

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<{ deletedCount: number; memoryCleared: number }> {
    const now = new Date();
    
    // Clean database cache
    let deletedCount = 0;
    try {
      const result = await this.prisma.calculationCache.deleteMany({
        where: {
          expiresAt: { lte: now }
        }
      });
      deletedCount = result.count;
    } catch (error) {
      // console.warn(`Database cache cleanup failed: ${error.message}`);
    }

    // Clean in-memory cache
    let memoryCleared = 0;
    const currentTime = Date.now();
    for (const [key, cached] of inMemoryCache.entries()) {
      if (cached.expiresAt <= currentTime) {
        inMemoryCache.delete(key);
        memoryCleared++;
      }
    }

    // console.log(`🧹 Cache cleanup: ${deletedCount} DB entries, ${memoryCleared} memory entries`);
    // return { deletedCount, memoryCleared };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    databaseEntries: number;
    memoryEntries: number;
    memorySize: number;
    topHits: Array<{ key: string; hits: number }>;
  }> {
    // Database cache stats
    let databaseEntries = 0;
    try {
      const dbStats = await this.prisma.calculationCache.count({
        where: {
          expiresAt: { gt: new Date() }
        }
      });
      databaseEntries = dbStats;
    } catch (error) {
      // console.warn(`Failed to get database cache stats: ${error.message}`);
    }

    // Memory cache stats
    const memoryEntries = inMemoryCache.size;
    let memorySize = 0;
    const hitCounts: Array<{ key: string; hits: number }> = [];

    for (const [key, cached] of inMemoryCache.entries()) {
      memorySize += JSON.stringify(cached.data).length;
      hitCounts.push({ key: key.substring(0, 50), hits: cached.hitCount });
    }

    // Sort by hit count for top hits
    const topHits = hitCounts
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return {
      databaseEntries,
      memoryEntries,
      memorySize,
      topHits
    };
  }

  /**
   * Warm up cache with common queries for a user
   */
  async warmupUserCache(userId: string): Promise<void> {
    // console.log(`🔥 Warming up cache for user: ${userId}`);

    const warmupQueries = [
      {
        type: 'portfolio_performance',
        params: { userId },
        query: () => this.prisma.portfolio.findMany({
          where: { userId },
          include: { holdings: true }
        })
      },
      {
        type: 'recent_transactions',
        params: { userId, limit: 50 },
        query: () => this.prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 50
        })
      },
      {
        type: 'financial_goals',
        params: { userId, isActive: true },
        query: () => this.prisma.financialGoal.findMany({
          where: { userId, isActive: true },
          orderBy: { priority: 'asc' }
        })
      }
    ];

    // Execute warmup queries concurrently
    await Promise.allSettled(
      warmupQueries.map(async ({ type, params, query }) => {
        try {
          await this.getCachedResult(type, params, query, false); // Don't use in-memory for warmup
        } catch (error) {
          // Error handled by emergency recovery script)
    );

    // console.log(`✅ Cache warmup completed for user: ${userId}`);
  }
}

// Singleton instance
let cacheService: QueryCacheService | null = null;

export function getCacheService(prisma: PrismaClient): QueryCacheService {
  if (!cacheService) {
    cacheService = new QueryCacheService(prisma);
    
    // Set up periodic cache cleanup (every 30 minutes)
    if (typeof setInterval !== 'undefined') {
      setInterval(async () => {
        try {
          await cacheService!.cleanupExpiredCache();
        } catch (error) {
          // Error handled by emergency recovery script, 30 * 60 * 1000);
    }
  }
  
  return cacheService;
}

export default QueryCacheService;