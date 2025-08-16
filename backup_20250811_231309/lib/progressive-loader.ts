// MPERF-003: Progressive Data Loading with Priority Queues
// Implements tiered data loading: critical → supporting → deferred
// Uses intelligent priority queues based on user behavior and device capabilities

import { NetworkAdapter, NetworkCondition } from './network-adapter'
import { BatcherManager } from './request-batcher'

export type LoadPriority = 'critical' | 'high' | 'medium' | 'low' | 'deferred'
export type LoadStage = 'initial' | 'secondary' | 'tertiary' | 'background'

export interface DataRequest {
  id: string
  endpoint: string
  params: Record<string, any>
  priority: LoadPriority
  stage: LoadStage
  dependencies?: string[] // IDs of requests this depends on
  timeout?: number
  retryAttempts?: number
  cacheStrategy?: 'required' | 'preferred' | 'none'
  networkRequirements?: {
    minQuality?: 'fast' | 'moderate' | 'slow'
    maxLatency?: number
    dataLimit?: number // bytes
  }
  userActivityRequired?: 'active' | 'any' // Only load when user is active
  transform?: (data: any) => any // Data transformation function
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onProgress?: (loaded: number, total: number) => void
}

export interface LoadingSession {
  id: string
  startTime: number
  stages: Record<LoadStage, {
    started: boolean
    completed: boolean
    startTime?: number
    endTime?: number
    requests: Set<string>
    errors: Error[]
  }>
  totalRequests: number
  completedRequests: number
  failedRequests: number
}

export class ProgressiveDataLoader {
  private static instance: ProgressiveDataLoader | null = null
  
  private requestQueue = new Map<LoadPriority, DataRequest[]>()
  private activeRequests = new Map<string, Promise<any>>()
  private completedRequests = new Map<string, any>()
  private failedRequests = new Map<string, Error>()
  private dependencies = new Map<string, Set<string>>() // request_id -> dependent_ids
  
  private currentSession: LoadingSession | null = null
  private processingStage: LoadStage | null = null
  private isPaused = false
  
  private userActivity: 'active' | 'inactive' = 'active'
  private lastActivity = Date.now()
  
  // Configuration for different device/network combinations
  private static loadingStrategies = {
    'mobile-slow': {
      maxConcurrent: 2,
      stageDelays: { initial: 0, secondary: 2000, tertiary: 5000, background: 10000 },
      priorityLimits: { critical: 3, high: 2, medium: 1, low: 1, deferred: 0 },
      timeouts: { critical: 10000, high: 8000, medium: 6000, low: 4000, deferred: 2000 }
    },
    'mobile-moderate': {
      maxConcurrent: 3,
      stageDelays: { initial: 0, secondary: 1000, tertiary: 3000, background: 6000 },
      priorityLimits: { critical: 5, high: 3, medium: 2, low: 1, deferred: 1 },
      timeouts: { critical: 8000, high: 6000, medium: 5000, low: 4000, deferred: 3000 }
    },
    'mobile-fast': {
      maxConcurrent: 4,
      stageDelays: { initial: 0, secondary: 500, tertiary: 1500, background: 3000 },
      priorityLimits: { critical: 8, high: 5, medium: 3, low: 2, deferred: 1 },
      timeouts: { critical: 6000, high: 5000, medium: 4000, low: 3000, deferred: 2000 }
    },
    'tablet': {
      maxConcurrent: 5,
      stageDelays: { initial: 0, secondary: 300, tertiary: 1000, background: 2000 },
      priorityLimits: { critical: 10, high: 6, medium: 4, low: 2, deferred: 2 },
      timeouts: { critical: 5000, high: 4000, medium: 3500, low: 3000, deferred: 2500 }
    },
    'desktop': {
      maxConcurrent: 8,
      stageDelays: { initial: 0, secondary: 100, tertiary: 500, background: 1000 },
      priorityLimits: { critical: 15, high: 10, medium: 6, low: 4, deferred: 3 },
      timeouts: { critical: 4000, high: 3500, medium: 3000, low: 2500, deferred: 2000 }
    }
  }

  private constructor() {
    this.initializeQueues()
    this.startActivityMonitoring()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ProgressiveDataLoader {
    if (!this.instance) {
      this.instance = new ProgressiveDataLoader()
    }
    return this.instance
  }

  /**
   * Start a new progressive loading session
   */
  startSession(sessionId?: string): string {
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.currentSession = {
      id,
      startTime: Date.now(),
      stages: {
        initial: { started: false, completed: false, requests: new Set(), errors: [] },
        secondary: { started: false, completed: false, requests: new Set(), errors: [] },
        tertiary: { started: false, completed: false, requests: new Set(), errors: [] },
        background: { started: false, completed: false, requests: new Set(), errors: [] }
      },
      totalRequests: 0,
      completedRequests: 0,
      failedRequests: 0
    }

    // console.log(`Started progressive loading session: ${id}`)
    // return id
  }

  /**
   * Add data request to loading queue
   */
  addRequest(request: DataRequest): void {
    if (!this.requestQueue.has(request.priority)) {
      this.requestQueue.set(request.priority, [])
    }
    
    this.requestQueue.get(request.priority)!.push(request)
    
    // Track session statistics
    if (this.currentSession) {
      this.currentSession.totalRequests++
      this.currentSession.stages[request.stage].requests.add(request.id)
    }

    // Set up dependencies
    if (request.dependencies) {
      for (const depId of request.dependencies) {
        if (!this.dependencies.has(depId)) {
          this.dependencies.set(depId, new Set())
        }
        this.dependencies.get(depId)!.add(request.id)
      }
    }

    // console.log(`Added request ${request.id} with priority ${request.priority} to stage ${request.stage}`)
  }

  /**
   * Add multiple requests with smart priority assignment
   */
  addRequests(requests: Omit<DataRequest, 'priority' | 'stage'>[]): void {
    requests.forEach(req => {
      // Smart priority assignment based on endpoint and data type
      const priority = this.determinePriority(req.endpoint, req.params)
      const stage = this.determineStage(priority, req.endpoint)
      
      this.addRequest({
        ...req,
        priority,
        stage
      })
    })
  }

  /**
   * Start processing the loading queue
   */
  async processQueue(): Promise<void> {
    if (this.isPaused || !this.currentSession) return

    // console.log('Starting progressive data loading...')

    // Process stages sequentially
    const stages: LoadStage[] = ['initial', 'secondary', 'tertiary', 'background']
    
    for (const stage of stages) {
      await this.processStage(stage)
      
      if (this.isPaused) {
        // console.log(`Progressive loading paused at stage: ${stage}`)
        // break
      }
    }
    
    // console.log('Progressive loading completed')
  }

  /**
   * Get current loading progress
   */
  getProgress(): {
    sessionId: string | null
    currentStage: LoadStage | null
    totalRequests: number
    completedRequests: number
    failedRequests: number
    stageProgress: Record<LoadStage, {
      total: number
      completed: number
      failed: number
      status: 'pending' | 'active' | 'completed' | 'failed'
    }>
    estimatedTimeRemaining?: number // milliseconds
  } {
    if (!this.currentSession) {
      return {
        sessionId: null,
        currentStage: null,
        totalRequests: 0,
        completedRequests: 0,
        failedRequests: 0,
        stageProgress: {
          initial: { total: 0, completed: 0, failed: 0, status: 'pending' },
          secondary: { total: 0, completed: 0, failed: 0, status: 'pending' },
          tertiary: { total: 0, completed: 0, failed: 0, status: 'pending' },
          background: { total: 0, completed: 0, failed: 0, status: 'pending' }
        }
      }
    }

    const stageProgress: any = {}
    
    Object.entries(this.currentSession.stages).forEach(([stageName, stage]) => {
      const total = stage.requests.size
      let completed = 0
      let failed = 0
      
      stage.requests.forEach(reqId => {
        if (this.completedRequests.has(reqId)) completed++
        else if (this.failedRequests.has(reqId)) failed++
      })
      
      let status: 'pending' | 'active' | 'completed' | 'failed' = 'pending'
      if (stage.started && !stage.completed) status = 'active'
      else if (stage.completed) status = completed === total ? 'completed' : 'failed'
      
      stageProgress[stageName] = { total, completed, failed, status }
    })

    return {
      sessionId: this.currentSession.id,
      currentStage: this.processingStage,
      totalRequests: this.currentSession.totalRequests,
      completedRequests: this.currentSession.completedRequests,
      failedRequests: this.currentSession.failedRequests,
      stageProgress,
      estimatedTimeRemaining: this.estimateTimeRemaining()
    }
  }

  /**
   * Pause progressive loading
   */
  pause(): void {
    this.isPaused = true
    // console.log('Progressive loading paused')
  }

  /**
   * Resume progressive loading
   */
  resume(): void {
    this.isPaused = false
    // console.log('Progressive loading resumed')
    // this.processQueue() // Continue processing
  }

  /**
   * Cancel current loading session
   */
  cancel(): void {
    this.isPaused = true
    
    // Cancel active requests
    this.activeRequests.forEach((promise, requestId) => {
      // console.log(`Cancelling request: ${requestId}`)
      // Note: Actual cancellation would depend on request implementation
    })
    
    this.clearSession()
    // console.log('Progressive loading cancelled')
  }

  /**
   * Get cached result for a request
   */
  getCachedResult(requestId: string): any | null {
    return this.completedRequests.get(requestId) || null
  }

  /**
   * Check if request failed
   */
  getRequestError(requestId: string): Error | null {
    return this.failedRequests.get(requestId) || null
  }

  // Private methods

  private initializeQueues(): void {
    const priorities: LoadPriority[] = ['critical', 'high', 'medium', 'low', 'deferred']
    priorities.forEach(priority => {
      this.requestQueue.set(priority, [])
    })
  }

  private startActivityMonitoring(): void {
    if (typeof window === 'undefined') return

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    const updateActivity = () => {
      this.lastActivity = Date.now()
      if (this.userActivity !== 'active') {
        this.userActivity = 'active'
        this.onActivityChange()
      }
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // Check for inactivity
    setInterval(() => {
      const timeSinceActivity = Date.now() - this.lastActivity
      if (timeSinceActivity > 30000 && this.userActivity === 'active') { // 30 seconds
        this.userActivity = 'inactive'
        this.onActivityChange()
      }
    }, 10000) // Check every 10 seconds
  }

  private onActivityChange(): void {
    // console.log(`User activity changed to: ${this.userActivity}`)

    // Pause loading if user becomes inactive and we're not processing critical requests
    if (this.userActivity === 'inactive' && this.processingStage !== 'initial') {
      this.pause()
    } else if (this.userActivity === 'active' && this.isPaused) {
      this.resume()
    }
  }

  private async processStage(stage: LoadStage): Promise<void> {
    if (!this.currentSession || this.isPaused) return

    const stageData = this.currentSession.stages[stage]
    if (stageData.requests.size === 0) {
      stageData.completed = true
      return
    }

    // console.log(`Processing stage: ${stage} (${stageData.requests.size} requests)`)

    this.processingStage = stage
    stageData.started = true
    stageData.startTime = Date.now()

    // Get strategy based on current network conditions
    const strategy = this.getCurrentStrategy()
    
    // Apply stage delay (except for initial stage)
    if (stage !== 'initial') {
      const delay = strategy.stageDelays[stage]
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // Process requests for this stage by priority
    const priorities: LoadPriority[] = ['critical', 'high', 'medium', 'low', 'deferred']
    
    for (const priority of priorities) {
      if (this.isPaused) break
      
      const requests = this.getRequestsForStageAndPriority(stage, priority)
      if (requests.length === 0) continue

      const limit = strategy.priorityLimits[priority]
      if (limit === 0) continue // Skip this priority level

      // Process requests in batches according to priority limits and concurrency
      const batches = this.createBatches(requests, Math.min(limit, strategy.maxConcurrent))
      
      for (const batch of batches) {
        if (this.isPaused) break
        
        await this.processBatch(batch, strategy)
      }
    }

    stageData.completed = true
    stageData.endTime = Date.now()
    
    // console.log(`Completed stage: ${stage} in ${stageData.endTime! - stageData.startTime!}ms`)
  }

  private getRequestsForStageAndPriority(stage: LoadStage, priority: LoadPriority): DataRequest[] {
    const queuedRequests = this.requestQueue.get(priority) || []
    return queuedRequests.filter(req => 
      req.stage === stage && 
      !this.activeRequests.has(req.id) &&
      !this.completedRequests.has(req.id) &&
      !this.failedRequests.has(req.id) &&
      this.areDependenciesMet(req)
    )
  }

  private areDependenciesMet(request: DataRequest): boolean {
    if (!request.dependencies) return true
    
    return request.dependencies.every(depId => 
      this.completedRequests.has(depId)
    )
  }

  private async processBatch(requests: DataRequest[], strategy: any): Promise<void> {
    const batchPromises = requests.map(request => this.processRequest(request, strategy))
    
    // Wait for all requests in batch to complete (but don't fail if some fail)
    await Promise.allSettled(batchPromises)
  }

  private async processRequest(request: DataRequest, strategy: any): Promise<void> {
    const { id, endpoint, params, priority } = request
    
    // Check if user activity is required
    if (request.userActivityRequired === 'active' && this.userActivity !== 'active') {
      // console.log(`Skipping request ${id} - user not active`)
      // return
    }

    // Check network requirements
    if (!this.meetsNetworkRequirements(request)) {
      // console.log(`Skipping request ${id} - network requirements not met`)
      // return
    }

    // console.log(`Processing request: ${id} (${priority})`)

    try {
      this.activeRequests.set(id, Promise.resolve()) // Placeholder
      
      // Use appropriate timeout
      const timeout = request.timeout || strategy.timeouts[priority]
      
      // Make the actual request using the batcher for efficiency
      const data = await Promise.race([
        BatcherManager.batchRequest(endpoint, params, this.mapPriorityToBatcher(priority)),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ])

      // Transform data if transformer provided
      const result = request.transform ? request.transform(data) : data
      
      // Store result
      this.completedRequests.set(id, result)
      this.activeRequests.delete(id)
      
      // Update session stats
      if (this.currentSession) {
        this.currentSession.completedRequests++
      }

      // Call success callback
      if (request.onSuccess) {
        request.onSuccess(result)
      }

      // Process dependent requests
      this.processDependents(id)
      
      // console.log(`Completed request: ${id}`)

    } catch (error) {
      // console.error(`Failed request: ${id}`, error)

      this.failedRequests.set(id, error as Error)
      this.activeRequests.delete(id)
      
      // Update session stats
      if (this.currentSession) {
        this.currentSession.failedRequests++
        const stage = this.currentSession.stages[request.stage]
        stage.errors.push(error as Error)
      }

      // Call error callback
      if (request.onError) {
        request.onError(error as Error)
      }

      // Handle retry logic
      const retryAttempts = request.retryAttempts || (priority === 'critical' ? 3 : 1)
      if (retryAttempts > 0) {
        const retryRequest = { ...request, retryAttempts: retryAttempts - 1 }
        setTimeout(() => this.addRequest(retryRequest), 1000 * (4 - retryAttempts)) // Exponential backoff
      }
    }
  }

  private processDependents(completedRequestId: string): void {
    const dependents = this.dependencies.get(completedRequestId)
    if (!dependents) return

    dependents.forEach(dependentId => {
      // Find and potentially trigger dependent request
      for (const [priority, requests] of this.requestQueue) {
        const requestIndex = requests.findIndex(req => req.id === dependentId)
        if (requestIndex >= 0) {
          const request = requests[requestIndex]
          if (this.areDependenciesMet(request)) {
            // console.log(`Dependencies met for request: ${dependentId}`)
            // Request will be picked up in next processing cycle
          }
          break
        }
      }
    })
  }

  private meetsNetworkRequirements(request: DataRequest): boolean {
    if (!request.networkRequirements) return true
    
    const networkCondition = NetworkAdapter.getCurrentCondition()
    if (!networkCondition) return true
    
    const { minQuality, maxLatency, dataLimit } = request.networkRequirements
    
    if (minQuality && this.getQualityRank(networkCondition.quality) < this.getQualityRank(minQuality)) {
      return false
    }
    
    if (maxLatency && networkCondition.rtt > maxLatency) {
      return false
    }
    
    // Data limit check would require knowing the expected response size
    // This is a placeholder for more sophisticated data usage tracking
    
    return true
  }

  private getQualityRank(quality: string): number {
    const ranks = { slow: 1, moderate: 2, fast: 3 }
    return ranks[quality as keyof typeof ranks] || 1
  }

  private getCurrentStrategy() {
    const deviceType = this.detectDeviceType()
    const networkCondition = NetworkAdapter.getCurrentCondition()
    
    let strategyKey = deviceType
    
    if (deviceType === 'mobile' && networkCondition) {
      strategyKey = `mobile-${networkCondition.quality}`
    }
    
    return ProgressiveDataLoader.loadingStrategies[strategyKey as keyof typeof ProgressiveDataLoader.loadingStrategies] ||
           ProgressiveDataLoader.loadingStrategies.desktop
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'
    
    const userAgent = navigator.userAgent
    if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) return 'mobile'
    if (/iPad|Tablet/i.test(userAgent)) return 'tablet'
    return 'desktop'
  }

  private determinePriority(endpoint: string, params: Record<string, any>): LoadPriority {
    // Smart priority assignment based on endpoint and parameters
    const priorityRules = {
      '/api/super-cards': (p: any) => {
        if (p.cards?.includes('performance') || p.cards?.includes('income')) return 'critical'
        if (p.cards?.includes('lifestyle')) return 'high'
        return 'medium'
      },
      '/api/portfolios': () => 'critical',
      '/api/market-data': (p: any) => p.realtime ? 'high' : 'medium',
      '/api/expenses': () => 'medium',
      '/api/analytics': () => 'low',
      '/api/notifications': () => 'deferred'
    }

    const rule = priorityRules[endpoint as keyof typeof priorityRules]
    return rule ? rule(params) : 'medium'
  }

  private determineStage(priority: LoadPriority, endpoint: string): LoadStage {
    if (priority === 'critical') return 'initial'
    if (priority === 'high') return 'secondary'
    if (priority === 'medium') return 'tertiary'
    if (priority === 'low' || priority === 'deferred') return 'background'
    return 'tertiary'
  }

  private mapPriorityToBatcher(priority: LoadPriority): 'high' | 'medium' | 'low' {
    if (priority === 'critical' || priority === 'high') return 'high'
    if (priority === 'medium') return 'medium'
    return 'low'
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  private estimateTimeRemaining(): number {
    if (!this.currentSession || this.currentSession.totalRequests === 0) return 0
    
    const elapsed = Date.now() - this.currentSession.startTime
    const progress = this.currentSession.completedRequests / this.currentSession.totalRequests
    
    if (progress === 0) return 0
    
    const estimatedTotal = elapsed / progress
    return Math.max(0, estimatedTotal - elapsed)
  }

  private clearSession(): void {
    this.requestQueue.forEach(queue => queue.length = 0)
    this.activeRequests.clear()
    this.completedRequests.clear()
    this.failedRequests.clear()
    this.dependencies.clear()
    this.currentSession = null
    this.processingStage = null
  }
}

/**
 * High-level API for progressive loading
 */
export class ProgressiveLoadingManager {
  private static loader = ProgressiveDataLoader.getInstance()

  /**
   * Load Super Cards dashboard progressively
   */
  static async loadDashboard(userId: string): Promise<void> {
    const sessionId = this.loader.startSession('dashboard')
    
    // Critical: Above-the-fold performance and income cards
    this.loader.addRequest({
      id: 'performance-card',
      endpoint: '/api/super-cards',
      params: { cards: ['performance'], fields: { performance: ['portfolio_value', 'total_return_1y'] } },
      priority: 'critical',
      stage: 'initial'
    })

    this.loader.addRequest({
      id: 'income-card',
      endpoint: '/api/super-cards',
      params: { cards: ['income'], fields: { income: ['monthly_dividend_income', 'net_monthly_income'] } },
      priority: 'critical',
      stage: 'initial'
    })

    // High: Supporting data
    this.loader.addRequest({
      id: 'lifestyle-card',
      endpoint: '/api/super-cards',
      params: { cards: ['lifestyle'] },
      priority: 'high',
      stage: 'secondary',
      dependencies: ['performance-card', 'income-card']
    })

    // Medium: Strategy recommendations
    this.loader.addRequest({
      id: 'strategy-card',
      endpoint: '/api/super-cards',
      params: { cards: ['strategy'] },
      priority: 'medium',
      stage: 'tertiary'
    })

    // Low: Quick actions
    this.loader.addRequest({
      id: 'quick-actions',
      endpoint: '/api/super-cards',
      params: { cards: ['quickActions'] },
      priority: 'low',
      stage: 'background',
      userActivityRequired: 'active'
    })

    // Background: Analytics and detailed data
    this.loader.addRequest({
      id: 'analytics-data',
      endpoint: '/api/analytics',
      params: { userId, timeRange: '1Y' },
      priority: 'deferred',
      stage: 'background',
      networkRequirements: { minQuality: 'moderate' }
    })

    await this.loader.processQueue()
  }

  /**
   * Load portfolio page progressively
   */
  static async loadPortfolio(portfolioId: string): Promise<void> {
    const sessionId = this.loader.startSession('portfolio')
    
    // Critical: Portfolio overview
    this.loader.addRequest({
      id: 'portfolio-overview',
      endpoint: '/api/portfolios',
      params: { portfolioId, action: 'overview' },
      priority: 'critical',
      stage: 'initial'
    })

    // High: Holdings list
    this.loader.addRequest({
      id: 'portfolio-holdings',
      endpoint: '/api/portfolios',
      params: { portfolioId, action: 'holdings' },
      priority: 'high',
      stage: 'secondary'
    })

    // Medium: Performance charts
    this.loader.addRequest({
      id: 'performance-charts',
      endpoint: '/api/portfolios',
      params: { portfolioId, action: 'performance', timeRange: '1Y' },
      priority: 'medium',
      stage: 'tertiary'
    })

    // Low: Detailed analytics
    this.loader.addRequest({
      id: 'detailed-analytics',
      endpoint: '/api/portfolios',
      params: { portfolioId, action: 'analytics' },
      priority: 'low',
      stage: 'background'
    })

    await this.loader.processQueue()
  }

  /**
   * Get loading progress
   */
  static getProgress() {
    return this.loader.getProgress()
  }

  /**
   * Pause loading
   */
  static pause(): void {
    this.loader.pause()
  }

  /**
   * Resume loading
   */
  static resume(): void {
    this.loader.resume()
  }
}

export default ProgressiveDataLoader