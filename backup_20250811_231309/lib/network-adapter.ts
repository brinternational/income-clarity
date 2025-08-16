// MPERF-002: Network-Aware Data Fetching for Mobile Performance
// Adapts data fetching strategies based on network conditions (4G/3G/2G)
// Optimizes batch sizes, prefetching, and cache strategies

export type NetworkType = '4g' | '3g' | '2g' | 'wifi' | 'ethernet' | 'unknown'
export type ConnectionQuality = 'fast' | 'moderate' | 'slow' | 'offline'

export interface NetworkCondition {
  type: NetworkType
  quality: ConnectionQuality
  rtt: number // Round trip time in ms
  downlink: number // Downlink bandwidth in Mbps
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
  saveData: boolean // Data saver mode
  timestamp: number
}

export interface NetworkAdaptation {
  batchSize: number
  prefetch: boolean
  highResImages: boolean
  cacheStrategy: 'aggressive' | 'balanced' | 'minimal'
  timeout: number // Request timeout in ms
  maxConcurrent: number // Max concurrent requests
  retryStrategy: 'aggressive' | 'conservative' | 'minimal'
  compressionPreference: 'size' | 'speed' | 'balanced'
}

export class NetworkAdapter {
  private static currentCondition: NetworkCondition | null = null
  private static listeners: ((condition: NetworkCondition) => void)[] = []
  private static monitoringInterval: NodeJS.Timeout | null = null
  
  // Network adaptation configurations
  private static adaptations: Record<string, NetworkAdaptation> = {
    'wifi-fast': {
      batchSize: 10,
      prefetch: true,
      highResImages: true,
      cacheStrategy: 'aggressive',
      timeout: 5000,
      maxConcurrent: 6,
      retryStrategy: 'aggressive',
      compressionPreference: 'speed'
    },
    'ethernet-fast': {
      batchSize: 15,
      prefetch: true,
      highResImages: true,
      cacheStrategy: 'aggressive', 
      timeout: 3000,
      maxConcurrent: 8,
      retryStrategy: 'aggressive',
      compressionPreference: 'speed'
    },
    '4g-fast': {
      batchSize: 5,
      prefetch: true,
      highResImages: true,
      cacheStrategy: 'aggressive',
      timeout: 8000,
      maxConcurrent: 4,
      retryStrategy: 'conservative',
      compressionPreference: 'balanced'
    },
    '4g-moderate': {
      batchSize: 3,
      prefetch: false,
      highResImages: false,
      cacheStrategy: 'balanced',
      timeout: 10000,
      maxConcurrent: 3,
      retryStrategy: 'conservative',
      compressionPreference: 'size'
    },
    '3g-moderate': {
      batchSize: 3,
      prefetch: false,
      highResImages: false,
      cacheStrategy: 'balanced',
      timeout: 15000,
      maxConcurrent: 2,
      retryStrategy: 'conservative',
      compressionPreference: 'size'
    },
    '3g-slow': {
      batchSize: 2,
      prefetch: false,
      highResImages: false,
      cacheStrategy: 'minimal',
      timeout: 20000,
      maxConcurrent: 2,
      retryStrategy: 'minimal',
      compressionPreference: 'size'
    },
    '2g-slow': {
      batchSize: 1,
      prefetch: false,
      highResImages: false,
      cacheStrategy: 'minimal',
      timeout: 30000,
      maxConcurrent: 1,
      retryStrategy: 'minimal',
      compressionPreference: 'size'
    },
    'slow-2g-slow': {
      batchSize: 1,
      prefetch: false,
      highResImages: false,
      cacheStrategy: 'minimal',
      timeout: 45000,
      maxConcurrent: 1,
      retryStrategy: 'minimal',
      compressionPreference: 'size'
    },
    'unknown-moderate': {
      batchSize: 3,
      prefetch: false,
      highResImages: false,
      cacheStrategy: 'balanced',
      timeout: 12000,
      maxConcurrent: 3,
      retryStrategy: 'conservative',
      compressionPreference: 'balanced'
    },
    'offline': {
      batchSize: 0,
      prefetch: false,
      highResImages: false,
      cacheStrategy: 'minimal',
      timeout: 0,
      maxConcurrent: 0,
      retryStrategy: 'minimal',
      compressionPreference: 'size'
    }
  }

  /**
   * Initialize network monitoring
   */
  static initialize() {
    if (typeof window === 'undefined' || this.monitoringInterval) return

    // Initial network detection
    this.detectNetworkCondition()

    // Monitor network changes
    window.addEventListener('online', this.handleNetworkChange.bind(this))
    window.addEventListener('offline', this.handleNetworkChange.bind(this))

    // Monitor connection changes if supported
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', this.handleNetworkChange.bind(this))
    }

    // Periodic network quality checks
    this.monitoringInterval = setInterval(() => {
      this.detectNetworkCondition()
    }, 30000) // Check every 30 seconds

    // console.log('Network adapter initialized')
  }

  /**
   * Clean up network monitoring
   */
  static cleanup() {
    if (typeof window === 'undefined') return

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    window.removeEventListener('online', this.handleNetworkChange.bind(this))
    window.removeEventListener('offline', this.handleNetworkChange.bind(this))

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.removeEventListener('change', this.handleNetworkChange.bind(this))
    }
  }

  /**
   * Detect current network conditions
   */
  static detectNetworkCondition(): NetworkCondition {
    if (typeof window === 'undefined') {
      return this.getServerSideDefaults()
    }

    let condition: NetworkCondition = {
      type: 'unknown',
      quality: 'moderate',
      rtt: 100,
      downlink: 1.0,
      effectiveType: '3g',
      saveData: false,
      timestamp: Date.now()
    }

    // Check online status
    if (!navigator.onLine) {
      condition.quality = 'offline'
      condition.type = 'unknown'
    } else if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      condition.type = this.normalizeConnectionType(connection.type || connection.effectiveType)
      condition.rtt = connection.rtt || 100
      condition.downlink = connection.downlink || 1.0
      condition.effectiveType = connection.effectiveType || '3g'
      condition.saveData = connection.saveData || false
      
      // Determine quality based on effective type and RTT
      condition.quality = this.determineConnectionQuality(
        condition.effectiveType,
        condition.rtt,
        condition.downlink
      )
    }

    this.currentCondition = condition
    this.notifyListeners(condition)

    return condition
  }

  /**
   * Get network adaptation for current conditions
   */
  static getCurrentAdaptation(): NetworkAdaptation {
    const condition = this.currentCondition || this.detectNetworkCondition()
    
    if (condition.quality === 'offline') {
      return this.adaptations['offline']
    }

    const key = this.getAdaptationKey(condition)
    return this.adaptations[key] || this.adaptations['unknown-moderate']
  }

  /**
   * Get network adaptation for specific request headers
   */
  static getAdaptationFromHeaders(headers: Record<string, string>): NetworkAdaptation {
    const networkType = headers['x-network-type'] as NetworkType || 'unknown'
    const rtt = parseInt(headers['x-network-rtt'] || '100')
    const downlink = parseFloat(headers['x-network-downlink'] || '1.0')
    const saveData = headers['x-save-data'] === 'true'
    const effectiveType = headers['x-effective-connection-type'] as any || '3g'

    const condition: NetworkCondition = {
      type: networkType,
      quality: this.determineConnectionQuality(effectiveType, rtt, downlink),
      rtt,
      downlink,
      effectiveType,
      saveData,
      timestamp: Date.now()
    }

    const key = this.getAdaptationKey(condition)
    return this.adaptations[key] || this.adaptations['unknown-moderate']
  }

  /**
   * Add network condition listener
   */
  static addListener(callback: (condition: NetworkCondition) => void) {
    this.listeners.push(callback)
  }

  /**
   * Remove network condition listener
   */
  static removeListener(callback: (condition: NetworkCondition) => void) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Get current network condition
   */
  static getCurrentCondition(): NetworkCondition | null {
    return this.currentCondition
  }

  /**
   * Force network condition check
   */
  static async forceNetworkCheck(): Promise<NetworkCondition> {
    // Perform RTT measurement
    const startTime = performance.now()
    try {
      await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
    } catch (error) {
      // Error handled by emergency recovery script
    const rtt = performance.now() - startTime

    // Update condition with measured RTT
    if (this.currentCondition) {
      this.currentCondition.rtt = rtt
      this.currentCondition.quality = this.determineConnectionQuality(
        this.currentCondition.effectiveType,
        rtt,
        this.currentCondition.downlink
      )
      this.currentCondition.timestamp = Date.now()
    }

    return this.detectNetworkCondition()
  }

  // Private methods

  private static getServerSideDefaults(): NetworkCondition {
    return {
      type: 'unknown',
      quality: 'moderate',
      rtt: 100,
      downlink: 1.0,
      effectiveType: '3g',
      saveData: false,
      timestamp: Date.now()
    }
  }

  private static handleNetworkChange() {
    setTimeout(() => {
      this.detectNetworkCondition()
    }, 100) // Small delay to ensure connection is stable
  }

  private static normalizeConnectionType(type: string): NetworkType {
    const typeMap: Record<string, NetworkType> = {
      'wifi': 'wifi',
      'ethernet': 'ethernet',
      'cellular': '4g',
      '4g': '4g',
      '3g': '3g',
      '2g': '2g',
      'slow-2g': '2g',
      'bluetooth': '2g',
      'wimax': '4g',
      'other': 'unknown',
      'none': 'unknown',
      'unknown': 'unknown'
    }
    
    return typeMap[type.toLowerCase()] || 'unknown'
  }

  private static determineConnectionQuality(
    effectiveType: string,
    rtt: number,
    downlink: number
  ): ConnectionQuality {
    // Offline check
    if (!navigator.onLine) return 'offline'

    // Quality matrix based on effective type and measured metrics
    if (effectiveType === '4g' && rtt < 100 && downlink > 2.0) return 'fast'
    if (effectiveType === '4g' && rtt < 200 && downlink > 1.0) return 'moderate'
    if (effectiveType === '3g' && rtt < 300 && downlink > 0.5) return 'moderate'
    if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'slow'
    if (rtt > 500 || downlink < 0.5) return 'slow'
    
    return 'moderate'
  }

  private static getAdaptationKey(condition: NetworkCondition): string {
    if (condition.quality === 'offline') return 'offline'
    
    return `${condition.effectiveType}-${condition.quality}`
  }

  private static notifyListeners(condition: NetworkCondition) {
    this.listeners.forEach(callback => {
      try {
        callback(condition)
      } catch (error) {
        // Error handled by emergency recovery script)
  }
}

/**
 * Network-aware fetch wrapper
 */
export class NetworkAwareFetch {
  private static activeRequests = new Set<AbortController>()
  private static requestQueue: Array<{
    url: string
    options: RequestInit
    resolve: (value: Response) => void
    reject: (error: Error) => void
  }> = []

  /**
   * Fetch with network adaptation
   */
  static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const adaptation = NetworkAdapter.getCurrentAdaptation()
    const condition = NetworkAdapter.getCurrentCondition()

    // Handle offline scenario
    if (adaptation.maxConcurrent === 0) {
      throw new Error('Network unavailable')
    }

    // Apply network-specific timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, adaptation.timeout)

    // Queue request if we've hit concurrent limit
    if (this.activeRequests.size >= adaptation.maxConcurrent) {
      return this.queueRequest(url, options)
    }

    try {
      this.activeRequests.add(controller)

      const networkOptions: RequestInit = {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'X-Network-Type': condition?.type || 'unknown',
          'X-Connection-Quality': condition?.quality || 'moderate',
          'X-Client-RTT': condition?.rtt.toString() || '100',
          'X-Save-Data': condition?.saveData ? 'true' : 'false',
          'X-Effective-Connection-Type': condition?.effectiveType || '3g'
        }
      }

      const response = await fetch(url, networkOptions)
      clearTimeout(timeoutId)

      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Handle abort/timeout with retry logic
      if ((error as Error).name === 'AbortError') {
        return this.handleRetry(url, options, adaptation)
      }
      
      throw error
    } finally {
      this.activeRequests.delete(controller)
      this.processQueue()
    }
  }

  /**
   * Batch fetch with network adaptation
   */
  static async batchFetch(
    requests: Array<{ url: string; options?: RequestInit }>
  ): Promise<Response[]> {
    const adaptation = NetworkAdapter.getCurrentAdaptation()
    const batchSize = Math.min(requests.length, adaptation.batchSize)
    
    if (batchSize === 0) {
      throw new Error('Network unavailable for batch requests')
    }

    const results: Response[] = []
    
    // Process in batches
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      
      const batchPromises = batch.map(({ url, options = {} }) => 
        this.fetch(url, options)
      )
      
      const batchResults = await Promise.allSettled(batchPromises)
      
      // Process batch results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          // Create error response for failed requests
          results.push(new Response(null, { 
            status: 500, 
            statusText: 'Network Error'
          }))
        }
      }
      
      // Add delay between batches for slower networks
      if (i + batchSize < requests.length && adaptation.cacheStrategy === 'minimal') {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return results
  }

  private static queueRequest(
    url: string, 
    options: RequestInit
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject })
    })
  }

  private static processQueue() {
    const adaptation = NetworkAdapter.getCurrentAdaptation()
    
    while (
      this.requestQueue.length > 0 && 
      this.activeRequests.size < adaptation.maxConcurrent
    ) {
      const request = this.requestQueue.shift()!
      
      this.fetch(request.url, request.options)
        .then(request.resolve)
        .catch(request.reject)
    }
  }

  private static async handleRetry(
    url: string,
    options: RequestInit,
    adaptation: NetworkAdaptation
  ): Promise<Response> {
    const maxRetries = adaptation.retryStrategy === 'aggressive' ? 3 :
                     adaptation.retryStrategy === 'conservative' ? 2 : 1

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        return await this.fetch(url, options)
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }
      }
    }

    throw new Error('Max retries exceeded')
  }
}

/**
 * Network monitoring and analytics
 */
export class NetworkAnalytics {
  private static metrics = {
    requests: 0,
    failures: 0,
    totalRTT: 0,
    networkChanges: 0,
    byConnectionType: new Map<string, { requests: number; avgRTT: number; failures: number }>()
  }

  static recordRequest(condition: NetworkCondition, rtt: number, success: boolean) {
    this.metrics.requests++
    this.metrics.totalRTT += rtt
    
    if (!success) {
      this.metrics.failures++
    }

    const connectionKey = `${condition.effectiveType}-${condition.quality}`
    const connectionStats = this.metrics.byConnectionType.get(connectionKey) || {
      requests: 0,
      avgRTT: 0,
      failures: 0
    }

    connectionStats.requests++
    connectionStats.avgRTT = (connectionStats.avgRTT * (connectionStats.requests - 1) + rtt) / connectionStats.requests
    
    if (!success) {
      connectionStats.failures++
    }

    this.metrics.byConnectionType.set(connectionKey, connectionStats)
  }

  static recordNetworkChange() {
    this.metrics.networkChanges++
  }

  static getMetrics() {
    return {
      ...this.metrics,
      avgRTT: this.metrics.requests > 0 ? this.metrics.totalRTT / this.metrics.requests : 0,
      successRate: this.metrics.requests > 0 ? 
        ((this.metrics.requests - this.metrics.failures) / this.metrics.requests) * 100 : 100,
      connectionStats: Object.fromEntries(this.metrics.byConnectionType)
    }
  }

  static reset() {
    this.metrics = {
      requests: 0,
      failures: 0,
      totalRTT: 0,
      networkChanges: 0,
      byConnectionType: new Map()
    }
  }
}

// Initialize network adapter when module loads
if (typeof window !== 'undefined') {
  NetworkAdapter.initialize()
}

export default NetworkAdapter