// MPERF-005: Request Batching and Debouncing for Mobile Performance
// Batches multiple requests into single calls to reduce network round trips
// Implements intelligent debouncing to prevent excessive API calls

import { NetworkAdapter, NetworkAdaptation } from './network-adapter'

export interface BatchableRequest {
  id: string
  endpoint: string
  params: Record<string, any>
  priority: 'high' | 'medium' | 'low'
  timestamp: number
  timeout?: number
  resolve: (data: any) => void
  reject: (error: Error) => void
}

export interface BatchConfig {
  maxBatchSize: number
  debounceTime: number // ms to wait before processing batch
  maxWaitTime: number // ms maximum time to wait before forced processing
  priorityThresholds: {
    high: number // immediate processing for high priority
    medium: number // faster batching for medium priority
    low: number // longer batching for low priority
  }
}

export class MobileRequestBatcher {
  private queue: Map<string, BatchableRequest> = new Map()
  private timer: NodeJS.Timeout | null = null
  private forceFlushTimer: NodeJS.Timeout | null = null
  private processing = false
  private config: BatchConfig
  private lastFlush = 0

  // Endpoint batching configurations
  private static endpointConfigs: Record<string, BatchConfig> = {
    'super-cards': {
      maxBatchSize: 5,
      debounceTime: 100,
      maxWaitTime: 1000,
      priorityThresholds: {
        high: 10, // 10ms for high priority
        medium: 50, // 50ms for medium priority
        low: 200 // 200ms for low priority
      }
    },
    'portfolio-data': {
      maxBatchSize: 3,
      debounceTime: 150,
      maxWaitTime: 2000,
      priorityThresholds: {
        high: 25,
        medium: 100,
        low: 300
      }
    },
    'market-data': {
      maxBatchSize: 10,
      debounceTime: 50,
      maxWaitTime: 500,
      priorityThresholds: {
        high: 5,
        medium: 25,
        low: 100
      }
    },
    'expenses': {
      maxBatchSize: 8,
      debounceTime: 200,
      maxWaitTime: 3000,
      priorityThresholds: {
        high: 50,
        medium: 150,
        low: 400
      }
    },
    'default': {
      maxBatchSize: 5,
      debounceTime: 100,
      maxWaitTime: 2000,
      priorityThresholds: {
        high: 25,
        medium: 100,
        low: 250
      }
    }
  }

  constructor(endpoint: string = 'default') {
    this.config = MobileRequestBatcher.endpointConfigs[endpoint] || 
                  MobileRequestBatcher.endpointConfigs['default']
    
    // Adapt configuration based on network conditions
    this.adaptToNetwork()
  }

  /**
   * Add request to batch queue
   */
  add<T = any>(
    endpoint: string,
    params: Record<string, any>,
    priority: 'high' | 'medium' | 'low' = 'medium',
    timeout?: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: BatchableRequest = {
        id: this.generateRequestId(endpoint, params),
        endpoint,
        params,
        priority,
        timestamp: Date.now(),
        timeout,
        resolve,
        reject
      }

      // Remove any existing request with same ID (debouncing)
      if (this.queue.has(request.id)) {
        const existingRequest = this.queue.get(request.id)!
        existingRequest.reject(new Error('Request superseded by newer request'))
      }

      this.queue.set(request.id, request)
      
      // Schedule processing based on priority and network conditions
      this.scheduleProcessing(priority)
    })
  }

  /**
   * Force immediate processing of queue
   */
  async flush(): Promise<void> {
    if (this.processing || this.queue.size === 0) return

    await this.processQueue()
  }

  /**
   * Get current queue status
   */
  getStatus() {
    const queueByPriority = {
      high: 0,
      medium: 0,
      low: 0
    }

    for (const request of this.queue.values()) {
      queueByPriority[request.priority]++
    }

    return {
      queueSize: this.queue.size,
      processing: this.processing,
      queueByPriority,
      config: this.config,
      timeSinceLastFlush: Date.now() - this.lastFlush
    }
  }

  /**
   * Clear all pending requests
   */
  clear(reason = 'Queue cleared') {
    // Cancel all pending requests
    for (const request of this.queue.values()) {
      request.reject(new Error(reason))
    }

    this.queue.clear()
    this.clearTimers()
  }

  // Private methods

  private generateRequestId(endpoint: string, params: Record<string, any>): string {
    // Create deterministic ID based on endpoint and key parameters
    const keyParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key]
        return acc
      }, {} as Record<string, any>)

    const paramsString = JSON.stringify(keyParams)
    const hash = this.simpleHash(paramsString)
    
    return `${endpoint}:${hash}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  private scheduleProcessing(priority: 'high' | 'medium' | 'low') {
    const debounceTime = this.config.priorityThresholds[priority]
    
    // Clear existing timer
    this.clearTimers()

    // High priority requests get processed immediately
    if (priority === 'high' || this.queue.size >= this.config.maxBatchSize) {
      this.timer = setTimeout(() => this.processQueue(), debounceTime)
    } else {
      // Normal debouncing
      this.timer = setTimeout(() => this.processQueue(), this.config.debounceTime)
    }

    // Force flush after maximum wait time
    if (!this.forceFlushTimer) {
      this.forceFlushTimer = setTimeout(() => {
        this.processQueue()
      }, this.config.maxWaitTime)
    }
  }

  private clearTimers() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    
    if (this.forceFlushTimer) {
      clearTimeout(this.forceFlushTimer)
      this.forceFlushTimer = null
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.size === 0) return

    this.processing = true
    this.clearTimers()

    try {
      // Group requests by endpoint
      const requestsByEndpoint = new Map<string, BatchableRequest[]>()
      
      for (const request of this.queue.values()) {
        if (!requestsByEndpoint.has(request.endpoint)) {
          requestsByEndpoint.set(request.endpoint, [])
        }
        requestsByEndpoint.get(request.endpoint)!.push(request)
      }

      // Process each endpoint group
      const processingPromises: Promise<void>[] = []
      
      for (const [endpoint, requests] of requestsByEndpoint) {
        // Sort by priority and timestamp
        requests.sort((a, b) => {
          const priorityWeight = { high: 3, medium: 2, low: 1 }
          const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority]
          return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
        })

        // Batch requests up to maxBatchSize
        const batches = this.createBatches(requests, this.config.maxBatchSize)
        
        for (const batch of batches) {
          processingPromises.push(this.processBatch(endpoint, batch))
        }
      }

      // Wait for all batches to complete
      await Promise.allSettled(processingPromises)
      
      // Clear processed requests
      this.queue.clear()
      this.lastFlush = Date.now()

    } catch (error) {
      // console.error('Error processing request queue:', error)

      // Reject all requests with error
      for (const request of this.queue.values()) {
        request.reject(new Error('Batch processing failed'))
      }
      
      this.queue.clear()
    } finally {
      this.processing = false
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    
    return batches
  }

  private async processBatch(endpoint: string, requests: BatchableRequest[]) {
    try {
      // Handle different endpoint types
      let batchResponse: any

      switch (endpoint) {
        case 'super-cards':
          batchResponse = await this.processSuperCardsBatch(requests)
          break
        case 'portfolio-data':
          batchResponse = await this.processPortfolioBatch(requests)
          break  
        case 'market-data':
          batchResponse = await this.processMarketDataBatch(requests)
          break
        case 'expenses':
          batchResponse = await this.processExpensesBatch(requests)
          break
        default:
          batchResponse = await this.processGenericBatch(endpoint, requests)
      }

      // Distribute responses back to individual requests
      this.distributeResponses(requests, batchResponse)

    } catch (error) {
      // Reject all requests in the batch
      for (const request of requests) {
        request.reject(error as Error)
      }
    }
  }

  private async processSuperCardsBatch(requests: BatchableRequest[]) {
    // Create batch request for Super Cards API
    const batchRequests = requests.map(req => ({
      id: req.id,
      cards: req.params.cards || ['performance'],
      fields: req.params.fields,
      timeRange: req.params.timeRange || '1Y',
      includeProjections: req.params.includeProjections,
      includeComparisons: req.params.includeComparisons
    }))

    const response = await fetch('/api/super-cards/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: batchRequests,
        options: {
          parallelExecution: true,
          cacheResults: true
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Super Cards batch failed: ${response.status}`)
    }

    return await response.json()
  }

  private async processPortfolioBatch(requests: BatchableRequest[]) {
    // Batch portfolio requests
    const batchData = {
      operations: requests.map(req => ({
        id: req.id,
        action: req.params.action || 'get',
        portfolioId: req.params.portfolioId,
        data: req.params.data
      }))
    }

    const response = await fetch('/api/portfolios/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData)
    })

    if (!response.ok) {
      throw new Error(`Portfolio batch failed: ${response.status}`)
    }

    return await response.json()
  }

  private async processMarketDataBatch(requests: BatchableRequest[]) {
    // Batch market data requests
    const symbols = [...new Set(requests.flatMap(req => req.params.symbols || []))]
    const timeRanges = [...new Set(requests.map(req => req.params.timeRange || '1D'))]

    const response = await fetch('/api/market-data/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols,
        timeRanges,
        requestIds: requests.map(req => req.id)
      })
    })

    if (!response.ok) {
      throw new Error(`Market data batch failed: ${response.status}`)
    }

    return await response.json()
  }

  private async processExpensesBatch(requests: BatchableRequest[]) {
    // Batch expense requests
    const operations = requests.map(req => ({
      id: req.id,
      action: req.params.action || 'get',
      expenseId: req.params.expenseId,
      data: req.params.data,
      filters: req.params.filters
    }))

    const response = await fetch('/api/expenses/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations })
    })

    if (!response.ok) {
      throw new Error(`Expenses batch failed: ${response.status}`)
    }

    return await response.json()
  }

  private async processGenericBatch(endpoint: string, requests: BatchableRequest[]) {
    // Generic batch processing for other endpoints
    const batchData = {
      requests: requests.map(req => ({
        id: req.id,
        params: req.params
      }))
    }

    const response = await fetch(`/api/${endpoint}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData)
    })

    if (!response.ok) {
      throw new Error(`Generic batch failed for ${endpoint}: ${response.status}`)
    }

    return await response.json()
  }

  private distributeResponses(requests: BatchableRequest[], batchResponse: any) {
    // Handle different response formats
    if (batchResponse.results && Array.isArray(batchResponse.results)) {
      // Standard batch response format
      for (const result of batchResponse.results) {
        const request = requests.find(req => req.id === result.id)
        if (request) {
          if (result.success) {
            request.resolve(result.data)
          } else {
            request.reject(new Error(result.error || 'Batch request failed'))
          }
        }
      }
    } else {
      // Single response for all requests (e.g., market data)
      for (const request of requests) {
        request.resolve(batchResponse)
      }
    }
  }

  private adaptToNetwork() {
    const adaptation = NetworkAdapter.getCurrentAdaptation()
    
    // Adjust batch configuration based on network conditions
    if (adaptation.cacheStrategy === 'minimal') {
      // Slower networks: larger batches, longer debounce
      this.config.maxBatchSize = Math.min(this.config.maxBatchSize + 2, 10)
      this.config.debounceTime *= 1.5
      this.config.maxWaitTime *= 1.2
    } else if (adaptation.cacheStrategy === 'aggressive') {
      // Faster networks: smaller batches, shorter debounce
      this.config.maxBatchSize = Math.max(this.config.maxBatchSize - 1, 3)
      this.config.debounceTime *= 0.8
      this.config.maxWaitTime *= 0.9
    }

    // Adjust for battery saving mode
    const networkCondition = NetworkAdapter.getCurrentCondition()
    if (networkCondition?.saveData) {
      this.config.maxBatchSize = Math.min(this.config.maxBatchSize + 3, 12)
      this.config.debounceTime *= 2
    }
  }
}

/**
 * Global request batcher manager
 */
export class BatcherManager {
  private static batchers = new Map<string, MobileRequestBatcher>()
  
  /**
   * Get or create batcher for endpoint
   */
  static getBatcher(endpoint: string): MobileRequestBatcher {
    if (!this.batchers.has(endpoint)) {
      this.batchers.set(endpoint, new MobileRequestBatcher(endpoint))
    }
    return this.batchers.get(endpoint)!
  }

  /**
   * Batch a request through appropriate batcher
   */
  static async batchRequest<T = any>(
    endpoint: string,
    params: Record<string, any>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<T> {
    const batcher = this.getBatcher(endpoint)
    return batcher.add<T>(endpoint, params, priority)
  }

  /**
   * Flush all batchers
   */
  static async flushAll(): Promise<void> {
    const flushPromises: Promise<void>[] = []
    
    for (const batcher of this.batchers.values()) {
      flushPromises.push(batcher.flush())
    }
    
    await Promise.allSettled(flushPromises)
  }

  /**
   * Clear all batchers
   */
  static clearAll(reason = 'Batch manager reset') {
    for (const batcher of this.batchers.values()) {
      batcher.clear(reason)
    }
    this.batchers.clear()
  }

  /**
   * Get status of all batchers
   */
  static getGlobalStatus() {
    const status: Record<string, any> = {}
    
    for (const [endpoint, batcher] of this.batchers) {
      status[endpoint] = batcher.getStatus()
    }
    
    return {
      totalBatchers: this.batchers.size,
      endpoints: Object.keys(status),
      batchers: status,
      totalQueueSize: Object.values(status).reduce((sum: number, s: any) => sum + s.queueSize, 0)
    }
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    BatcherManager.clearAll('Page unloading')
  })

  // Periodic health check and flush
  setInterval(() => {
    const status = BatcherManager.getGlobalStatus()
    if (status.totalQueueSize > 50) {
      // console.warn('Request queue getting large, flushing:', status.totalQueueSize)
      // BatcherManager.flushAll()
    }
  }, 30000) // Check every 30 seconds
}

export default MobileRequestBatcher