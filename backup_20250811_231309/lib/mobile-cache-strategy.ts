// MPERF-004: Mobile-Specific Caching Strategy for Performance Optimization
// Implements longer TTLs, aggressive prefetching, and offline support for mobile devices
// Integrates with existing multi-level cache system

import { NetworkAdapter, NetworkCondition } from './network-adapter'

export interface MobileCacheConfig {
  ttl: {
    performance: number // seconds
    income: number
    lifestyle: number
    strategy: number
    quickActions: number
    market_data: number
    portfolio_data: number
  }
  prefetchPatterns: string[] // Cards to prefetch together
  offlineData: {
    lastKnownGood: boolean // Store last known good data
    maxAge: number // Max age for offline data (seconds)
    maxSize: number // Max cache size in MB
  }
  strategy: 'aggressive' | 'balanced' | 'minimal'
  compressionLevel: number // 1-11 for brotli
}

export class MobileCacheStrategy {
  private static configs: Record<string, MobileCacheConfig> = {
    // High-end mobile devices with good connectivity
    'mobile-fast': {
      ttl: {
        performance: 600, // 10 minutes (vs 5 for desktop)
        income: 7200, // 2 hours (vs 1 hour)
        lifestyle: 14400, // 4 hours (vs 2 hours)
        strategy: 3600, // 1 hour (vs 30min)
        quickActions: 300, // 5 minutes (vs 1 minute)
        market_data: 180, // 3 minutes (vs 1 minute)
        portfolio_data: 900 // 15 minutes (vs 5 minutes)
      },
      prefetchPatterns: ['performance', 'income'], // Always prefetch these together
      offlineData: {
        lastKnownGood: true,
        maxAge: 86400, // 24 hours
        maxSize: 50 // 50MB cache limit
      },
      strategy: 'aggressive',
      compressionLevel: 8
    },

    // Mid-range mobile devices
    'mobile-moderate': {
      ttl: {
        performance: 900, // 15 minutes
        income: 10800, // 3 hours
        lifestyle: 21600, // 6 hours
        strategy: 5400, // 1.5 hours
        quickActions: 600, // 10 minutes
        market_data: 300, // 5 minutes
        portfolio_data: 1800 // 30 minutes
      },
      prefetchPatterns: ['performance'], // Limited prefetching
      offlineData: {
        lastKnownGood: true,
        maxAge: 86400,
        maxSize: 30 // 30MB cache limit
      },
      strategy: 'balanced',
      compressionLevel: 9
    },

    // Low-end mobile devices or slow connections
    'mobile-slow': {
      ttl: {
        performance: 1800, // 30 minutes
        income: 21600, // 6 hours
        lifestyle: 43200, // 12 hours
        strategy: 10800, // 3 hours
        quickActions: 1200, // 20 minutes
        market_data: 600, // 10 minutes
        portfolio_data: 3600 // 1 hour
      },
      prefetchPatterns: [], // No prefetching
      offlineData: {
        lastKnownGood: true,
        maxAge: 172800, // 48 hours
        maxSize: 15 // 15MB cache limit
      },
      strategy: 'minimal',
      compressionLevel: 11 // Maximum compression
    },

    // Tablet devices (between mobile and desktop)
    'tablet': {
      ttl: {
        performance: 450, // 7.5 minutes
        income: 5400, // 1.5 hours
        lifestyle: 10800, // 3 hours
        strategy: 2700, // 45 minutes
        quickActions: 180, // 3 minutes
        market_data: 120, // 2 minutes
        portfolio_data: 600 // 10 minutes
      },
      prefetchPatterns: ['performance', 'income', 'lifestyle'],
      offlineData: {
        lastKnownGood: true,
        maxAge: 86400,
        maxSize: 75 // 75MB cache limit
      },
      strategy: 'aggressive',
      compressionLevel: 6
    },

    // Desktop fallback
    'desktop': {
      ttl: {
        performance: 300, // 5 minutes (original)
        income: 3600, // 1 hour (original)
        lifestyle: 7200, // 2 hours (original)
        strategy: 1800, // 30 minutes (original)
        quickActions: 60, // 1 minute (original)
        market_data: 60, // 1 minute (original)
        portfolio_data: 300 // 5 minutes (original)
      },
      prefetchPatterns: ['performance', 'income', 'lifestyle', 'strategy'],
      offlineData: {
        lastKnownGood: false,
        maxAge: 3600, // 1 hour
        maxSize: 100 // 100MB cache limit
      },
      strategy: 'balanced',
      compressionLevel: 4
    }
  }

  private static serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private static offlineCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  /**
   * Get mobile cache configuration based on device and network conditions
   */
  static getCacheConfig(
    deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop',
    networkCondition?: NetworkCondition
  ): MobileCacheConfig {
    let configKey = deviceType

    // Refine mobile config based on network quality
    if (deviceType === 'mobile' && networkCondition) {
      switch (networkCondition.quality) {
        case 'fast':
          configKey = 'mobile-fast'
          break
        case 'moderate':
          configKey = 'mobile-moderate'
          break
        case 'slow':
        case 'offline':
          configKey = 'mobile-slow'
          break
      }
    }

    return this.configs[configKey] || this.configs['desktop']
  }

  /**
   * Get TTL for specific data type with mobile optimization
   */
  static getTTL(
    dataType: keyof MobileCacheConfig['ttl'],
    deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop',
    networkCondition?: NetworkCondition
  ): number {
    const config = this.getCacheConfig(deviceType, networkCondition)
    let baseTTL = config.ttl[dataType]

    // Extend TTL for data saver mode
    if (networkCondition?.saveData) {
      baseTTL *= 2
    }

    // Reduce TTL if network is very fast (fresh data preferred)
    if (networkCondition?.quality === 'fast' && networkCondition.downlink > 5) {
      baseTTL *= 0.7
    }

    return baseTTL
  }

  /**
   * Determine what data should be prefetched based on current request
   */
  static getPrefetchList(
    currentCard: string,
    deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop',
    networkCondition?: NetworkCondition
  ): string[] {
    const config = this.getCacheConfig(deviceType, networkCondition)
    
    // Don't prefetch on slow networks or data saver mode
    if (networkCondition?.quality === 'slow' || networkCondition?.saveData) {
      return []
    }

    const prefetchPatterns: Record<string, string[]> = {
      performance: config.prefetchPatterns,
      income: ['lifestyle'], // Income users often check expenses
      lifestyle: ['performance'], // Lifestyle users often check portfolio
      strategy: ['performance', 'income'], // Strategy needs context
      quickActions: [] // Quick actions don't need prefetch
    }

    return prefetchPatterns[currentCard] || []
  }

  /**
   * Store data in offline cache for last-known-good fallback
   */
  static storeOfflineData(
    key: string,
    data: any,
    ttl: number,
    deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop',
    networkCondition?: NetworkCondition
  ) {
    const config = this.getCacheConfig(deviceType, networkCondition)
    
    if (!config.offlineData.lastKnownGood) return

    // Check cache size limits
    const currentSize = this.calculateCacheSize()
    if (currentSize > config.offlineData.maxSize * 1024 * 1024) { // Convert MB to bytes
      this.evictOldestOfflineData()
    }

    // Store with extended TTL for offline use
    const offlineTTL = Math.max(ttl, config.offlineData.maxAge)
    this.offlineCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: offlineTTL * 1000 // Convert to milliseconds
    })
  }

  /**
   * Get offline data if available and not expired
   */
  static getOfflineData(key: string): any | null {
    const cached = this.offlineCache.get(key)
    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.offlineCache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Initialize Service Worker for offline caching
   */
  static async initializeServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw-mobile-cache.js', {
        scope: '/'
      })

      this.serviceWorkerRegistration = registration

      // Listen for Service Worker messages
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage)

      // console.log('Mobile cache Service Worker registered')
      // return true
    } catch (error) {
      // console.error('Service Worker registration failed:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 }) i++) {
      this.offlineCache.delete(entries[i][0])
    }
  }

  private static calculateHitRate(): number {
    // This would be tracked by actual cache implementation
    return 85 // Placeholder - would track actual hit rate
  }
}

/**
 * Mobile-optimized cache wrapper for Super Cards client
 */
export class MobileSuperCardsCache {
  private deviceType: 'mobile' | 'tablet' | 'desktop'
  private networkCondition: NetworkCondition | null = null

  constructor(deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop') {
    this.deviceType = deviceType
    this.updateNetworkCondition()

    // Listen for network changes
    NetworkAdapter.addListener(this.onNetworkChange.bind(this))
  }

  /**
   * Get cached data with mobile optimization
   */
  async get(key: string, dataType: keyof MobileCacheConfig['ttl']): Promise<any | null> {
    // Try Service Worker cache first
    if (MobileCacheStrategy.serviceWorkerRegistration?.active) {
      const swResponse = await this.getFromServiceWorker(key)
      if (swResponse) return swResponse
    }

    // Try offline cache
    const offlineData = MobileCacheStrategy.getOfflineData(key)
    if (offlineData) return offlineData

    return null
  }

  /**
   * Set cached data with mobile optimization
   */
  async set(
    key: string,
    data: any,
    dataType: keyof MobileCacheConfig['ttl']
  ): Promise<void> {
    const ttl = MobileCacheStrategy.getTTL(dataType, this.deviceType, this.networkCondition)
    
    // Store in offline cache
    MobileCacheStrategy.storeOfflineData(
      key,
      data,
      ttl,
      this.deviceType,
      this.networkCondition
    )

    // Store in Service Worker cache
    if (MobileCacheStrategy.serviceWorkerRegistration?.active) {
      await this.setInServiceWorker(key, data, ttl)
    }
  }

  /**
   * Prefetch related data
   */
  async prefetch(cardType: string, userId: string): Promise<void> {
    await MobileCacheStrategy.prefetchData(
      cardType,
      userId,
      this.deviceType,
      this.networkCondition
    )
  }

  /**
   * Get cache headers for HTTP responses
   */
  getCacheHeaders(dataType: keyof MobileCacheConfig['ttl']): Record<string, string> {
    return MobileCacheStrategy.getCacheHeaders(
      dataType,
      this.deviceType,
      this.networkCondition
    )
  }

  // Private methods

  private onNetworkChange = (condition: NetworkCondition) => {
    this.networkCondition = condition
  }

  private updateNetworkCondition() {
    this.networkCondition = NetworkAdapter.getCurrentCondition()
  }

  private async getFromServiceWorker(key: string): Promise<any | null> {
    return new Promise((resolve) => {
      const channel = new MessageChannel()
      
      channel.port1.onmessage = (event) => {
        resolve(event.data.success ? event.data.data : null)
      }

      MobileCacheStrategy.serviceWorkerRegistration?.active?.postMessage({
        type: 'GET_CACHE',
        key
      }, [channel.port2])

      // Timeout after 100ms
      setTimeout(() => resolve(null), 100)
    })
  }

  private async setInServiceWorker(key: string, data: any, ttl: number): Promise<void> {
    MobileCacheStrategy.serviceWorkerRegistration?.active?.postMessage({
      type: 'SET_CACHE',
      key,
      data,
      ttl,
      timestamp: Date.now()
    })
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  // Initialize Service Worker
  MobileCacheStrategy.initializeServiceWorker()

  // Cleanup expired cache periodically
  setInterval(() => {
    const cleaned = MobileCacheStrategy.cleanupOfflineCache()
    if (cleaned > 0) {
      // console.log(`Cleaned up ${cleaned} expired cache items`)
    }
  }, 5 * 60 * 1000) // Every 5 minutes
}

export default MobileCacheStrategy