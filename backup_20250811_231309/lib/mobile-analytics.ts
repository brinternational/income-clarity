// MPERF-008: Mobile Analytics and Monitoring System
// Tracks mobile-specific metrics, performance budgets, and user experience
// Provides real-time monitoring and alerting for mobile performance issues

import { NetworkCondition, NetworkAdapter } from './network-adapter'
import { BatteryStatus } from './battery-efficient-polling'

export interface MobileMetrics {
  // Network performance
  networkLatency: number[] // RTT measurements in ms
  payloadSizes: number[] // Response sizes in bytes
  requestCounts: number[] // Requests per time period
  cacheHitRates: number[] // Cache hit rates over time
  compressionRatios: number[] // Compression savings
  
  // Battery impact
  batteryLevels: number[] // Battery level snapshots
  batteryDrain: number[] // Battery drain per hour calculations
  chargingStates: boolean[] // Charging state history
  
  // Performance metrics
  initialLoadTimes: number[] // Time to first meaningful paint
  interactionTimes: number[] // Response times for user interactions
  frameDrops: number[] // Frame drops during animations
  memoryUsage: number[] // Heap size measurements
  
  // User experience
  offlineRequests: number[] // Failed requests when offline
  errorRates: number[] // Error rates over time
  retryAttempts: number[] // Network retry attempts
  userSessions: number[] // Session lengths
  
  // Device characteristics
  deviceTypes: Record<string, number> // Device type distribution
  connectionTypes: Record<string, number> // Connection type distribution
  screenSizes: Record<string, number> // Screen size distribution
  
  // Timestamps
  timestamps: number[] // Measurement timestamps
}

export interface PerformanceBudgets {
  initialLoad: number // Max initial load time in ms (3G)
  interaction: number // Max interaction response time in ms
  dataUsage: number // Max data usage per session in bytes
  batteryDrain: number // Max battery drain per hour in %
  memoryLimit: number // Max memory usage in MB
  errorRate: number // Max acceptable error rate (0-1)
  cacheHitRate: number // Min acceptable cache hit rate (0-1)
}

export interface MobileAlert {
  id: string
  type: 'performance' | 'network' | 'battery' | 'error' | 'budget'
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  metric: string
  value: number
  threshold: number
  timestamp: number
  acknowledged: boolean
}

export class MobileAnalytics {
  private static instance: MobileAnalytics | null = null
  
  private metrics: MobileMetrics = {
    networkLatency: [],
    payloadSizes: [],
    requestCounts: [],
    cacheHitRates: [],
    compressionRatios: [],
    batteryLevels: [],
    batteryDrain: [],
    chargingStates: [],
    initialLoadTimes: [],
    interactionTimes: [],
    frameDrops: [],
    memoryUsage: [],
    offlineRequests: [],
    errorRates: [],
    retryAttempts: [],
    userSessions: [],
    deviceTypes: {},
    connectionTypes: {},
    screenSizes: {},
    timestamps: []
  }

  private performanceBudgets: PerformanceBudgets = {
    initialLoad: 3000, // 3 seconds on 3G
    interaction: 100, // 100ms response time
    dataUsage: 500 * 1024, // 500KB per session
    batteryDrain: 2.0, // 2% per hour
    memoryLimit: 100, // 100MB
    errorRate: 0.05, // 5% error rate
    cacheHitRate: 0.80 // 80% cache hit rate
  }

  private alerts: MobileAlert[] = []
  private alertListeners: ((alert: MobileAlert) => void)[] = []
  private monitoringInterval: NodeJS.Timeout | null = null
  private sessionStart = Date.now()
  private currentSession = {
    requests: 0,
    dataUsage: 0,
    errors: 0,
    cacheHits: 0,
    cacheMisses: 0
  }

  private constructor() {
    this.initializeMonitoring()
    this.detectDeviceCharacteristics()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MobileAnalytics {
    if (!this.instance) {
      this.instance = new MobileAnalytics()
    }
    return this.instance
  }

  /**
   * Record network request metrics
   */
  recordNetworkRequest(
    latency: number,
    payloadSize: number,
    cached: boolean,
    compressionRatio?: number,
    error?: boolean
  ) {
    const timestamp = Date.now()
    
    this.metrics.networkLatency.push(latency)
    this.metrics.payloadSizes.push(payloadSize)
    this.metrics.timestamps.push(timestamp)
    
    if (compressionRatio !== undefined) {
      this.metrics.compressionRatios.push(compressionRatio)
    }
    
    // Update session metrics
    this.currentSession.requests++
    this.currentSession.dataUsage += payloadSize
    
    if (cached) {
      this.currentSession.cacheHits++
    } else {
      this.currentSession.cacheMisses++
    }
    
    if (error) {
      this.currentSession.errors++
      this.metrics.offlineRequests.push(timestamp)
    }
    
    // Calculate current cache hit rate
    const totalCacheRequests = this.currentSession.cacheHits + this.currentSession.cacheMisses
    if (totalCacheRequests > 0) {
      const hitRate = this.currentSession.cacheHits / totalCacheRequests
      this.metrics.cacheHitRates.push(hitRate)
    }
    
    // Check performance budgets
    this.checkBudgets()
    
    // Trim metrics arrays to prevent memory leaks
    this.trimMetricsArrays()
  }

  /**
   * Record battery status
   */
  recordBatteryStatus(batteryStatus: BatteryStatus) {
    const timestamp = Date.now()
    
    this.metrics.batteryLevels.push(batteryStatus.level)
    this.metrics.chargingStates.push(batteryStatus.charging)
    this.metrics.timestamps.push(timestamp)
    
    // Calculate battery drain rate
    if (this.metrics.batteryLevels.length > 1 && !batteryStatus.charging) {
      const previousLevel = this.metrics.batteryLevels[this.metrics.batteryLevels.length - 2]
      const previousTime = this.metrics.timestamps[this.metrics.timestamps.length - 2]
      
      const levelDiff = previousLevel - batteryStatus.level
      const timeDiff = (timestamp - previousTime) / (1000 * 60 * 60) // Convert to hours
      
      if (timeDiff > 0 && levelDiff > 0) {
        const drainRate = levelDiff / timeDiff // % per hour
        this.metrics.batteryDrain.push(drainRate)
        
        // Check battery budget
        if (drainRate > this.performanceBudgets.batteryDrain) {
          this.createAlert('battery', 'warning', 
            `High battery drain rate: ${drainRate.toFixed(1)}% per hour`,
            'batteryDrain', drainRate, this.performanceBudgets.batteryDrain
          )
        }
      }
    }
  }

  /**
   * Record performance timing
   */
  recordPerformanceTiming(type: 'initial' | 'interaction', duration: number) {
    const timestamp = Date.now()
    
    if (type === 'initial') {
      this.metrics.initialLoadTimes.push(duration)
      
      if (duration > this.performanceBudgets.initialLoad) {
        this.createAlert('performance', 'warning',
          `Slow initial load: ${duration}ms`,
          'initialLoad', duration, this.performanceBudgets.initialLoad
        )
      }
    } else {
      this.metrics.interactionTimes.push(duration)
      
      if (duration > this.performanceBudgets.interaction) {
        this.createAlert('performance', 'warning',
          `Slow interaction: ${duration}ms`,
          'interaction', duration, this.performanceBudgets.interaction
        )
      }
    }
    
    this.metrics.timestamps.push(timestamp)
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(heapSizeMB: number) {
    this.metrics.memoryUsage.push(heapSizeMB)
    this.metrics.timestamps.push(Date.now())
    
    if (heapSizeMB > this.performanceBudgets.memoryLimit) {
      this.createAlert('performance', 'error',
        `High memory usage: ${heapSizeMB}MB`,
        'memoryUsage', heapSizeMB, this.performanceBudgets.memoryLimit
      )
    }
  }

  /**
   * Record frame drops (animation performance)
   */
  recordFrameDrops(droppedFrames: number) {
    this.metrics.frameDrops.push(droppedFrames)
    this.metrics.timestamps.push(Date.now())
    
    if (droppedFrames > 5) {
      this.createAlert('performance', 'warning',
        `Animation performance issue: ${droppedFrames} dropped frames`,
        'frameDrops', droppedFrames, 5
      )
    }
  }

  /**
   * Record network retry attempt
   */
  recordRetryAttempt(attempts: number) {
    this.metrics.retryAttempts.push(attempts)
    this.metrics.timestamps.push(Date.now())
    
    if (attempts > 3) {
      this.createAlert('network', 'warning',
        `High retry count: ${attempts} attempts`,
        'retryAttempts', attempts, 3
      )
    }
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary() {
    const now = Date.now()
    const sessionDuration = (now - this.sessionStart) / (1000 * 60) // minutes
    
    // Calculate averages for recent data (last 50 samples or 5 minutes)
    const recentMetrics = this.getRecentMetrics(5 * 60 * 1000) // 5 minutes
    
    return {
      session: {
        duration: Math.round(sessionDuration),
        requests: this.currentSession.requests,
        dataUsage: this.currentSession.dataUsage,
        dataUsageMB: Math.round(this.currentSession.dataUsage / 1024 / 1024 * 100) / 100,
        errors: this.currentSession.errors,
        errorRate: this.currentSession.requests > 0 ? 
          this.currentSession.errors / this.currentSession.requests : 0,
        cacheHitRate: (this.currentSession.cacheHits + this.currentSession.cacheMisses) > 0 ?
          this.currentSession.cacheHits / (this.currentSession.cacheHits + this.currentSession.cacheMisses) : 0
      },
      performance: {
        avgLatency: this.calculateAverage(recentMetrics.networkLatency),
        avgInitialLoad: this.calculateAverage(recentMetrics.initialLoadTimes),
        avgInteraction: this.calculateAverage(recentMetrics.interactionTimes),
        avgMemoryUsage: this.calculateAverage(recentMetrics.memoryUsage),
        avgFrameDrops: this.calculateAverage(recentMetrics.frameDrops)
      },
      battery: {
        currentLevel: this.metrics.batteryLevels[this.metrics.batteryLevels.length - 1] || null,
        avgDrainRate: this.calculateAverage(recentMetrics.batteryDrain),
        charging: this.metrics.chargingStates[this.metrics.chargingStates.length - 1] || null
      },
      network: {
        avgPayloadSize: this.calculateAverage(recentMetrics.payloadSizes),
        avgCompressionRatio: this.calculateAverage(recentMetrics.compressionRatios),
        currentCacheHitRate: recentMetrics.cacheHitRates[recentMetrics.cacheHitRates.length - 1] || null
      },
      budgets: this.checkAllBudgets(),
      alerts: this.alerts.filter(alert => !alert.acknowledged && 
        (Date.now() - alert.timestamp) < 5 * 60 * 1000) // Active alerts from last 5 minutes
    }
  }

  /**
   * Get detailed analytics for dashboard
   */
  getDetailedAnalytics() {
    return {
      metrics: this.metrics,
      budgets: this.performanceBudgets,
      alerts: this.alerts,
      trends: {
        latencyTrend: this.calculateTrend(this.metrics.networkLatency),
        batteryTrend: this.calculateTrend(this.metrics.batteryLevels),
        errorTrend: this.calculateTrend(this.metrics.errorRates),
        memoryTrend: this.calculateTrend(this.metrics.memoryUsage)
      },
      deviceStats: {
        deviceTypes: this.metrics.deviceTypes,
        connectionTypes: this.metrics.connectionTypes,
        screenSizes: this.metrics.screenSizes
      }
    }
  }

  /**
   * Update performance budgets
   */
  updatePerformanceBudgets(budgets: Partial<PerformanceBudgets>) {
    this.performanceBudgets = { ...this.performanceBudgets, ...budgets }
    this.checkBudgets() // Re-check with new budgets
  }

  /**
   * Add alert listener
   */
  addAlertListener(callback: (alert: MobileAlert) => void) {
    this.alertListeners.push(callback)
  }

  /**
   * Remove alert listener
   */
  removeAlertListener(callback: (alert: MobileAlert) => void) {
    const index = this.alertListeners.indexOf(callback)
    if (index > -1) {
      this.alertListeners.splice(index, 1)
    }
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
    }
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff)
  }

  /**
   * Export analytics data
   */
  exportData(): string {
    return JSON.stringify({
      metrics: this.metrics,
      budgets: this.performanceBudgets,
      alerts: this.alerts,
      session: {
        start: this.sessionStart,
        duration: Date.now() - this.sessionStart,
        ...this.currentSession
      },
      device: this.getDeviceInfo(),
      timestamp: Date.now()
    }, null, 2)
  }

  /**
   * Reset all metrics (new session)
   */
  reset() {
    this.metrics = {
      networkLatency: [],
      payloadSizes: [],
      requestCounts: [],
      cacheHitRates: [],
      compressionRatios: [],
      batteryLevels: [],
      batteryDrain: [],
      chargingStates: [],
      initialLoadTimes: [],
      interactionTimes: [],
      frameDrops: [],
      memoryUsage: [],
      offlineRequests: [],
      errorRates: [],
      retryAttempts: [],
      userSessions: [],
      deviceTypes: {},
      connectionTypes: {},
      screenSizes: {},
      timestamps: []
    }

    this.currentSession = {
      requests: 0,
      dataUsage: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    }

    this.sessionStart = Date.now()
    this.alerts = []
  }

  // Private methods

  private initializeMonitoring() {
    if (typeof window === 'undefined') return

    // Monitor performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Observe navigation timing
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navEntries.length > 0) {
        const nav = navEntries[0]
        const loadTime = nav.loadEventEnd - nav.navigationStart
        this.recordPerformanceTiming('initial', loadTime)
      }

      // Observe resource timing
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming
            this.recordNetworkRequest(
              resource.responseEnd - resource.requestStart,
              resource.transferSize || 0,
              resource.transferSize === 0 // Likely cached if 0 transfer size
            )
          }
        }
      })
      
      observer.observe({ entryTypes: ['resource'] })
    }

    // Monitor memory usage
    if ('memory' in performance) {
      this.monitoringInterval = setInterval(() => {
        const memory = (performance as any).memory
        if (memory) {
          const heapSizeMB = memory.usedJSHeapSize / 1024 / 1024
          this.recordMemoryUsage(heapSizeMB)
        }
      }, 30000) // Every 30 seconds
    }

    // Monitor network changes
    NetworkAdapter.addListener((condition: NetworkCondition) => {
      const connectionType = `${condition.effectiveType}-${condition.quality}`
      this.metrics.connectionTypes[connectionType] = 
        (this.metrics.connectionTypes[connectionType] || 0) + 1
    })

    // Monitor frame rate
    let frameCount = 0
    let lastTime = performance.now()
    let droppedFrames = 0

    const countFrames = () => {
      frameCount++
      const now = performance.now()
      
      if (now - lastTime >= 1000) { // Every second
        const fps = frameCount
        const expectedFrames = 60
        droppedFrames = Math.max(0, expectedFrames - fps)
        
        if (droppedFrames > 0) {
          this.recordFrameDrops(droppedFrames)
        }
        
        frameCount = 0
        lastTime = now
      }
      
      requestAnimationFrame(countFrames)
    }
    
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(countFrames)
    }
  }

  private detectDeviceCharacteristics() {
    if (typeof window === 'undefined') return

    const userAgent = navigator.userAgent
    let deviceType = 'desktop'

    if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = 'tablet'
    }

    this.metrics.deviceTypes[deviceType] = (this.metrics.deviceTypes[deviceType] || 0) + 1

    // Screen size
    const screenSize = `${screen.width}x${screen.height}`
    this.metrics.screenSizes[screenSize] = (this.metrics.screenSizes[screenSize] || 0) + 1
  }

  private createAlert(
    type: MobileAlert['type'],
    severity: MobileAlert['severity'],
    message: string,
    metric: string,
    value: number,
    threshold: number
  ) {
    const alert: MobileAlert = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      acknowledged: false
    }

    this.alerts.push(alert)

    // Notify listeners
    this.alertListeners.forEach(listener => {
      try {
        listener(alert)
      } catch (error) {
        // Error handled by emergency recovery script)

    // console.warn(`Mobile Performance Alert [${severity.toUpperCase()}]:`, message)
  }

  private checkBudgets() {
    const summary = this.getPerformanceSummary()

    // Check data usage budget
    if (summary.session.dataUsage > this.performanceBudgets.dataUsage) {
      this.createAlert('budget', 'warning',
        `Data usage exceeded: ${summary.session.dataUsageMB}MB`,
        'dataUsage', summary.session.dataUsage, this.performanceBudgets.dataUsage
      )
    }

    // Check error rate budget
    if (summary.session.errorRate > this.performanceBudgets.errorRate) {
      this.createAlert('budget', 'error',
        `Error rate exceeded: ${(summary.session.errorRate * 100).toFixed(1)}%`,
        'errorRate', summary.session.errorRate, this.performanceBudgets.errorRate
      )
    }

    // Check cache hit rate budget
    if (summary.session.cacheHitRate < this.performanceBudgets.cacheHitRate) {
      this.createAlert('budget', 'warning',
        `Cache hit rate below target: ${(summary.session.cacheHitRate * 100).toFixed(1)}%`,
        'cacheHitRate', summary.session.cacheHitRate, this.performanceBudgets.cacheHitRate
      )
    }
  }

  private checkAllBudgets() {
    const summary = this.getPerformanceSummary()
    
    return {
      initialLoad: {
        current: summary.performance.avgInitialLoad || 0,
        budget: this.performanceBudgets.initialLoad,
        status: (summary.performance.avgInitialLoad || 0) <= this.performanceBudgets.initialLoad ? 'pass' : 'fail'
      },
      interaction: {
        current: summary.performance.avgInteraction || 0,
        budget: this.performanceBudgets.interaction,
        status: (summary.performance.avgInteraction || 0) <= this.performanceBudgets.interaction ? 'pass' : 'fail'
      },
      dataUsage: {
        current: summary.session.dataUsage,
        budget: this.performanceBudgets.dataUsage,
        status: summary.session.dataUsage <= this.performanceBudgets.dataUsage ? 'pass' : 'fail'
      },
      batteryDrain: {
        current: summary.battery.avgDrainRate || 0,
        budget: this.performanceBudgets.batteryDrain,
        status: (summary.battery.avgDrainRate || 0) <= this.performanceBudgets.batteryDrain ? 'pass' : 'fail'
      },
      errorRate: {
        current: summary.session.errorRate,
        budget: this.performanceBudgets.errorRate,
        status: summary.session.errorRate <= this.performanceBudgets.errorRate ? 'pass' : 'fail'
      },
      cacheHitRate: {
        current: summary.session.cacheHitRate,
        budget: this.performanceBudgets.cacheHitRate,
        status: summary.session.cacheHitRate >= this.performanceBudgets.cacheHitRate ? 'pass' : 'fail'
      }
    }
  }

  private getRecentMetrics(timeWindow: number) {
    const cutoff = Date.now() - timeWindow
    const recentIndices: number[] = []

    // Find indices of recent timestamps
    for (let i = this.metrics.timestamps.length - 1; i >= 0; i--) {
      if (this.metrics.timestamps[i] >= cutoff) {
        recentIndices.unshift(i)
      } else {
        break
      }
    }

    // Extract recent values for all metric arrays
    return {
      networkLatency: recentIndices.map(i => this.metrics.networkLatency[i]).filter(v => v !== undefined),
      payloadSizes: recentIndices.map(i => this.metrics.payloadSizes[i]).filter(v => v !== undefined),
      cacheHitRates: recentIndices.map(i => this.metrics.cacheHitRates[i]).filter(v => v !== undefined),
      compressionRatios: recentIndices.map(i => this.metrics.compressionRatios[i]).filter(v => v !== undefined),
      batteryLevels: recentIndices.map(i => this.metrics.batteryLevels[i]).filter(v => v !== undefined),
      batteryDrain: recentIndices.map(i => this.metrics.batteryDrain[i]).filter(v => v !== undefined),
      initialLoadTimes: recentIndices.map(i => this.metrics.initialLoadTimes[i]).filter(v => v !== undefined),
      interactionTimes: recentIndices.map(i => this.metrics.interactionTimes[i]).filter(v => v !== undefined),
      frameDrops: recentIndices.map(i => this.metrics.frameDrops[i]).filter(v => v !== undefined),
      memoryUsage: recentIndices.map(i => this.metrics.memoryUsage[i]).filter(v => v !== undefined)
    }
  }

  private calculateAverage(values: number[]): number | null {
    if (values.length === 0) return null
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  private calculateTrend(values: number[]): 'improving' | 'stable' | 'degrading' | 'insufficient_data' {
    if (values.length < 10) return 'insufficient_data'

    const recent = values.slice(-5) // Last 5 values
    const previous = values.slice(-10, -5) // Previous 5 values

    const recentAvg = this.calculateAverage(recent) || 0
    const previousAvg = this.calculateAverage(previous) || 0

    const change = (recentAvg - previousAvg) / previousAvg

    if (Math.abs(change) < 0.05) return 'stable' // Less than 5% change
    return change > 0 ? 'degrading' : 'improving'
  }

  private trimMetricsArrays() {
    const maxSize = 1000 // Keep last 1000 measurements

    Object.keys(this.metrics).forEach(key => {
      const metric = this.metrics[key as keyof MobileMetrics]
      if (Array.isArray(metric) && metric.length > maxSize) {
        const excess = metric.length - maxSize
        metric.splice(0, excess)
      }
    })
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') return {}

    return {
      userAgent: navigator.userAgent,
      screenSize: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio,
      language: navigator.language,
      platform: navigator.platform,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints
    }
  }
}

/**
 * Easy-to-use analytics wrapper
 */
export class MobilePerformanceMonitor {
  private static analytics = MobileAnalytics.getInstance()

  /**
   * Start monitoring mobile performance
   */
  static startMonitoring() {
    // console.log('Mobile performance monitoring started')

    // Set up automatic error tracking
    window.addEventListener('error', (event) => {
      this.analytics.recordNetworkRequest(0, 0, false, undefined, true)
    })

    // Track long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            // console.warn('Long task detected:', entry.duration, 'ms')
            // this.analytics.recordInteractionTiming(entry.duration)
          }
        }
      })
      
      try {
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // Error handled by emergency recovery script
  }

  /**
   * Record API call performance
   */
  static recordAPICall(
    url: string,
    duration: number,
    responseSize: number,
    cached: boolean,
    compressionRatio?: number,
    error?: boolean
  ) {
    this.analytics.recordNetworkRequest(duration, responseSize, cached, compressionRatio, error)
  }

  /**
   * Record user interaction timing
   */
  static recordInteraction(duration: number) {
    this.analytics.recordPerformanceTiming('interaction', duration)
  }

  /**
   * Get performance dashboard data
   */
  static getPerformanceDashboard() {
    return this.analytics.getPerformanceSummary()
  }

  /**
   * Check if performance is within budgets
   */
  static isPerformanceAcceptable(): boolean {
    const budgets = this.analytics.getPerformanceSummary().budgets
    const failingBudgets = Object.values(budgets).filter(budget => budget.status === 'fail')
    return failingBudgets.length === 0
  }

  /**
   * Export performance data for analysis
   */
  static exportData(): string {
    return this.analytics.exportData()
  }

  /**
   * Subscribe to performance alerts
   */
  static onAlert(callback: (alert: MobileAlert) => void) {
    this.analytics.addAlertListener(callback)
  }
}

// Auto-start monitoring on module load
if (typeof window !== 'undefined') {
  MobilePerformanceMonitor.startMonitoring()
}

export default MobileAnalytics