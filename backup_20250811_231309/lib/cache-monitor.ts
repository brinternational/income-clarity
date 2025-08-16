/**
 * Cache Performance Monitoring Service
 * Tracks cache hit rates, response times, and memory usage
 * Provides alerts for performance degradation
 */

import { multiLevelCache, type CacheStats } from './cache-service'
import { redis } from './redis-client'

// Performance thresholds for alerts
interface PerformanceThresholds {
  maxResponseTimeMs: number
  minHitRate: number
  maxMemoryUsageMB: number
  maxErrorRate: number
  alertCooldownMs: number
}

// Default performance thresholds
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxResponseTimeMs: 50,      // Target: <50ms for cached requests
  minHitRate: 0.8,           // Target: >80% hit rate
  maxMemoryUsageMB: 500,     // Target: <500MB for 10k users
  maxErrorRate: 0.05,        // Target: <5% error rate
  alertCooldownMs: 300000    // 5 minute cooldown between alerts
}

// Alert levels
type AlertLevel = 'info' | 'warning' | 'critical'

interface CacheAlert {
  level: AlertLevel
  metric: string
  message: string
  value: number
  threshold: number
  timestamp: number
  suggestions?: string[]
}

// Performance metrics tracking
interface PerformanceMetrics {
  timestamp: number
  hitRate: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  memoryUsageMB: number
  errorRate: number
  l1HitRate: number
  l2HitRate: number
  l3HitRate: number
  redisHealth: boolean
  redisLatency?: number
}

class CacheMonitorService {
  private metrics: PerformanceMetrics[] = []
  private alerts: CacheAlert[] = []
  private lastAlerts = new Map<string, number>() // Alert cooldown tracking
  private maxMetricsHistory = 1000 // Keep last 1000 metric snapshots
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  constructor(private thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS) {
    // Start monitoring if in browser environment
    if (typeof window !== 'undefined') {
      this.startMonitoring()
    }
  }

  /**
   * Start continuous cache monitoring
   */
  startMonitoring(intervalMs: number = 30000): void { // Every 30 seconds
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics()
        await this.checkThresholds()
      } catch (error) {
        // Error handled by emergency recovery script, intervalMs)

    // console.log('Cache monitoring started')
  }

  /**
   * Stop cache monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
    // console.log('Cache monitoring stopped')
  }

  /**
   * Collect current cache performance metrics
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    const stats = await multiLevelCache.getStats()
    const totalRequests = stats.l1Hits + stats.l2Hits + stats.l3Hits + stats.misses
    
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      hitRate: stats.hitRate,
      averageResponseTime: stats.averageResponseTime,
      p95ResponseTime: stats.performance.p95ResponseTime,
      p99ResponseTime: stats.performance.p99ResponseTime,
      memoryUsageMB: stats.l1Stats.memoryMB,
      errorRate: totalRequests > 0 ? stats.errors / totalRequests : 0,
      l1HitRate: totalRequests > 0 ? stats.l1Hits / totalRequests : 0,
      l2HitRate: totalRequests > 0 ? stats.l2Hits / totalRequests : 0,
      l3HitRate: totalRequests > 0 ? stats.l3Hits / totalRequests : 0,
      redisHealth: stats.l2Stats.connected,
      redisLatency: stats.l2Stats.latency
    }

    // Store metrics
    this.metrics.push(metrics)
    
    // Trim old metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift()
    }

    return metrics
  }

  /**
   * Check performance thresholds and generate alerts
   */
  async checkThresholds(): Promise<CacheAlert[]> {
    const currentMetrics = this.metrics[this.metrics.length - 1]
    if (!currentMetrics) return []

    const newAlerts: CacheAlert[] = []

    // Check response time threshold
    if (currentMetrics.p95ResponseTime > this.thresholds.maxResponseTimeMs) {
      const alert = this.createAlert(
        'critical',
        'response_time',
        `P95 response time is ${currentMetrics.p95ResponseTime.toFixed(1)}ms (target: <${this.thresholds.maxResponseTimeMs}ms)`,
        currentMetrics.p95ResponseTime,
        this.thresholds.maxResponseTimeMs,
        [
          'Check Redis connection health',
          'Review L1 cache memory usage',
          'Consider increasing cache TTL values',
          'Check for database query performance issues'
        ]
      )
      if (alert) newAlerts.push(alert)
    }

    // Check hit rate threshold
    if (currentMetrics.hitRate < this.thresholds.minHitRate) {
      const alert = this.createAlert(
        'warning',
        'hit_rate',
        `Cache hit rate is ${(currentMetrics.hitRate * 100).toFixed(1)}% (target: >${(this.thresholds.minHitRate * 100)}%)`,
        currentMetrics.hitRate,
        this.thresholds.minHitRate,
        [
          'Review cache key strategies',
          'Increase cache TTL values',
          'Implement cache warming for popular queries',
          'Check for excessive cache invalidation'
        ]
      )
      if (alert) newAlerts.push(alert)
    }

    // Check memory usage threshold
    if (currentMetrics.memoryUsageMB > this.thresholds.maxMemoryUsageMB) {
      const alert = this.createAlert(
        'warning',
        'memory_usage',
        `Cache memory usage is ${currentMetrics.memoryUsageMB.toFixed(1)}MB (target: <${this.thresholds.maxMemoryUsageMB}MB)`,
        currentMetrics.memoryUsageMB,
        this.thresholds.maxMemoryUsageMB,
        [
          'Enable cache compression',
          'Reduce L1 cache TTL values',
          'Implement more aggressive LRU eviction',
          'Review cached data sizes'
        ]
      )
      if (alert) newAlerts.push(alert)
    }

    // Check error rate threshold
    if (currentMetrics.errorRate > this.thresholds.maxErrorRate) {
      const alert = this.createAlert(
        'critical',
        'error_rate',
        `Cache error rate is ${(currentMetrics.errorRate * 100).toFixed(1)}% (target: <${(this.thresholds.maxErrorRate * 100)}%)`,
        currentMetrics.errorRate,
        this.thresholds.maxErrorRate,
        [
          'Check Redis connection stability',
          'Review cache service logs',
          'Verify database connectivity',
          'Check for network issues'
        ]
      )
      if (alert) newAlerts.push(alert)
    }

    // Check Redis health
    if (!currentMetrics.redisHealth) {
      const alert = this.createAlert(
        'critical',
        'redis_health',
        'Redis connection is unhealthy - falling back to L1 cache only',
        0,
        1,
        [
          'Check Redis server status',
          'Verify Redis connection configuration',
          'Review network connectivity',
          'Check Redis memory usage and limits'
        ]
      )
      if (alert) newAlerts.push(alert)
    }

    // Check Redis latency
    if (currentMetrics.redisLatency && currentMetrics.redisLatency > 20) {
      const alert = this.createAlert(
        'warning',
        'redis_latency',
        `Redis latency is ${currentMetrics.redisLatency.toFixed(1)}ms (target: <20ms)`,
        currentMetrics.redisLatency,
        20,
        [
          'Check Redis server location and network',
          'Review Redis configuration',
          'Consider Redis connection pooling',
          'Check for Redis memory pressure'
        ]
      )
      if (alert) newAlerts.push(alert)
    }

    return newAlerts
  }

  /**
   * Create alert with cooldown protection
   */
  private createAlert(
    level: AlertLevel,
    metric: string,
    message: string,
    value: number,
    threshold: number,
    suggestions: string[] = []
  ): CacheAlert | null {
    const now = Date.now()
    const lastAlert = this.lastAlerts.get(metric) || 0
    
    // Check cooldown
    if (now - lastAlert < this.thresholds.alertCooldownMs) {
      return null
    }
    
    const alert: CacheAlert = {
      level,
      metric,
      message,
      value,
      threshold,
      timestamp: now,
      suggestions
    }
    
    this.alerts.push(alert)
    this.lastAlerts.set(metric, now)
    
    // Log alert
    // console.warn(`Cache Alert [${level.toUpperCase()}]: ${message}`)

    return alert
  }

  /**
   * Get current cache health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'critical'
    score: number // 0-100
    issues: string[]
    recommendations: string[]
  }> {
    const metrics = await this.collectMetrics()
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Evaluate hit rate (40% of score)
    if (metrics.hitRate < 0.5) {
      score -= 40
      issues.push(`Low hit rate: ${(metrics.hitRate * 100).toFixed(1)}%`)
      recommendations.push('Implement cache warming strategy')
    } else if (metrics.hitRate < 0.8) {
      score -= 20
      issues.push(`Below target hit rate: ${(metrics.hitRate * 100).toFixed(1)}%`)
      recommendations.push('Review cache TTL settings')
    }

    // Evaluate response time (30% of score)
    if (metrics.p95ResponseTime > 100) {
      score -= 30
      issues.push(`High response time: P95 ${metrics.p95ResponseTime.toFixed(1)}ms`)
      recommendations.push('Optimize cache lookup performance')
    } else if (metrics.p95ResponseTime > 50) {
      score -= 15
      issues.push(`Elevated response time: P95 ${metrics.p95ResponseTime.toFixed(1)}ms`)
      recommendations.push('Review cache hierarchy efficiency')
    }

    // Evaluate error rate (20% of score)
    if (metrics.errorRate > 0.1) {
      score -= 20
      issues.push(`High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`)
      recommendations.push('Investigate cache service errors')
    } else if (metrics.errorRate > 0.05) {
      score -= 10
      issues.push(`Elevated error rate: ${(metrics.errorRate * 100).toFixed(1)}%`)
      recommendations.push('Monitor error patterns')
    }

    // Evaluate Redis health (10% of score)
    if (!metrics.redisHealth) {
      score -= 10
      issues.push('Redis connection unhealthy')
      recommendations.push('Check Redis server status')
    } else if (metrics.redisLatency && metrics.redisLatency > 20) {
      score -= 5
      issues.push(`High Redis latency: ${metrics.redisLatency.toFixed(1)}ms`)
      recommendations.push('Optimize Redis connection')
    }

    // Determine status
    let status: 'healthy' | 'degraded' | 'critical'
    if (score >= 90) {
      status = 'healthy'
    } else if (score >= 70) {
      status = 'degraded'
    } else {
      status = 'critical'
    }

    return { status, score: Math.max(0, score), issues, recommendations }
  }

  /**
   * Get performance trends over time
   */
  getPerformanceTrends(windowMinutes: number = 60): {
    hitRateTrend: 'improving' | 'stable' | 'declining'
    responseTimeTrend: 'improving' | 'stable' | 'declining'
    errorRateTrend: 'improving' | 'stable' | 'declining'
    dataPoints: number
  } {
    const cutoffTime = Date.now() - (windowMinutes * 60 * 1000)
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime)
    
    if (recentMetrics.length < 2) {
      return {
        hitRateTrend: 'stable',
        responseTimeTrend: 'stable',
        errorRateTrend: 'stable',
        dataPoints: recentMetrics.length
      }
    }

    const firstHalf = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2))
    const secondHalf = recentMetrics.slice(Math.floor(recentMetrics.length / 2))

    // Calculate averages
    const firstHitRate = firstHalf.reduce((sum, m) => sum + m.hitRate, 0) / firstHalf.length
    const secondHitRate = secondHalf.reduce((sum, m) => sum + m.hitRate, 0) / secondHalf.length

    const firstResponseTime = firstHalf.reduce((sum, m) => sum + m.p95ResponseTime, 0) / firstHalf.length
    const secondResponseTime = secondHalf.reduce((sum, m) => sum + m.p95ResponseTime, 0) / secondHalf.length

    const firstErrorRate = firstHalf.reduce((sum, m) => sum + m.errorRate, 0) / firstHalf.length
    const secondErrorRate = secondHalf.reduce((sum, m) => sum + m.errorRate, 0) / secondHalf.length

    return {
      hitRateTrend: this.calculateTrend(firstHitRate, secondHitRate, 0.05),
      responseTimeTrend: this.calculateTrend(firstResponseTime, secondResponseTime, 5, true), // Lower is better
      errorRateTrend: this.calculateTrend(firstErrorRate, secondErrorRate, 0.01, true), // Lower is better
      dataPoints: recentMetrics.length
    }
  }

  private calculateTrend(first: number, second: number, threshold: number, lowerIsBetter = false): 'improving' | 'stable' | 'declining' {
    const change = second - first
    const relativeChange = Math.abs(change) / (first || 1)

    if (relativeChange < threshold) return 'stable'

    if (lowerIsBetter) {
      return change < 0 ? 'improving' : 'declining'
    } else {
      return change > 0 ? 'improving' : 'declining'
    }
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(maxAge: number = 3600000): CacheAlert[] { // 1 hour default
    const cutoff = Date.now() - maxAge
    return this.alerts.filter(alert => alert.timestamp >= cutoff)
  }

  /**
   * Generate cache performance report
   */
  async generateReport(): Promise<{
    summary: {
      status: string
      score: number
      hitRate: number
      averageResponseTime: number
      memoryUsage: number
    }
    performance: {
      l1HitRate: number
      l2HitRate: number
      l3HitRate: number
      redisHealth: boolean
      trends: ReturnType<typeof this.getPerformanceTrends>
    }
    alerts: CacheAlert[]
    recommendations: string[]
  }> {
    const health = await this.getHealthStatus()
    const currentMetrics = await this.collectMetrics()
    const trends = this.getPerformanceTrends()
    const recentAlerts = this.getRecentAlerts()

    return {
      summary: {
        status: health.status,
        score: health.score,
        hitRate: currentMetrics.hitRate,
        averageResponseTime: currentMetrics.averageResponseTime,
        memoryUsage: currentMetrics.memoryUsageMB
      },
      performance: {
        l1HitRate: currentMetrics.l1HitRate,
        l2HitRate: currentMetrics.l2HitRate,
        l3HitRate: currentMetrics.l3HitRate,
        redisHealth: currentMetrics.redisHealth,
        trends
      },
      alerts: recentAlerts,
      recommendations: health.recommendations
    }
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Clear old data to free memory
   */
  cleanup(): void {
    const oneHourAgo = Date.now() - 3600000
    
    // Keep only recent metrics
    this.metrics = this.metrics.filter(m => m.timestamp >= oneHourAgo)
    
    // Keep only recent alerts
    this.alerts = this.alerts.filter(a => a.timestamp >= oneHourAgo)
    
    // console.log('Cache monitor cleaned up old data')
  }

  /**
   * Destroy monitor and clean up resources
   */
  destroy(): void {
    this.stopMonitoring()
    this.metrics = []
    this.alerts = []
    this.lastAlerts.clear()
    // console.log('Cache monitor destroyed')
  }
}

// Global singleton instance
let cacheMonitor: CacheMonitorService | null = null

export const getCacheMonitor = (): CacheMonitorService => {
  if (!cacheMonitor) {
    cacheMonitor = new CacheMonitorService()
  }
  return cacheMonitor
}

// Export instance for direct use
export const monitor = getCacheMonitor()

// Export types and classes
export { CacheMonitorService, type CacheAlert, type PerformanceMetrics, type PerformanceThresholds }

// Utility functions
export const CacheMonitorUtils = {
  // Format performance metrics for display
  formatMetrics: (metrics: PerformanceMetrics) => ({
    hitRate: `${(metrics.hitRate * 100).toFixed(1)}%`,
    responseTime: `${metrics.averageResponseTime.toFixed(1)}ms`,
    p95ResponseTime: `${metrics.p95ResponseTime.toFixed(1)}ms`,
    memoryUsage: `${metrics.memoryUsageMB.toFixed(1)}MB`,
    errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
    redisStatus: metrics.redisHealth ? 'Connected' : 'Disconnected',
    redisLatency: metrics.redisLatency ? `${metrics.redisLatency.toFixed(1)}ms` : 'N/A'
  }),

  // Get alert severity color
  getAlertColor: (level: AlertLevel): string => {
    switch (level) {
      case 'info': return '#3B82F6'      // Blue
      case 'warning': return '#F59E0B'   // Yellow
      case 'critical': return '#EF4444'  // Red
      default: return '#6B7280'          // Gray
    }
  },

  // Check if cache is healthy
  isHealthy: (metrics: PerformanceMetrics): boolean => {
    return metrics.hitRate >= 0.8 && 
           metrics.p95ResponseTime <= 50 && 
           metrics.errorRate <= 0.05 && 
           metrics.redisHealth
  }
}