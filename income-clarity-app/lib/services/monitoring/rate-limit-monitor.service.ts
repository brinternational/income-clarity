/**
 * Rate Limit Monitoring and Alerting Service
 * 
 * Production-grade monitoring system for:
 * - Real-time rate limit tracking
 * - API health monitoring
 * - Performance metrics collection
 * - Automated alerting on thresholds
 * - Historical data analysis
 * - Dashboard data aggregation
 * - Circuit breaker monitoring
 * - SLA compliance tracking
 */

import { rateLimiterService } from '../rate-limiter/rate-limiter.service';
import { cacheService } from '../cache/cache.service';
import { polygonBatchService } from '../polygon/polygon-batch.service';
import { yodleeRateLimitedService } from '../yodlee/yodlee-rate-limited.service';
import { logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

export interface MonitoringMetrics {
  timestamp: Date;
  
  // Rate limiting metrics
  rateLimits: {
    polygon: {
      currentRequests: number;
      maxRequests: number;
      remainingRequests: number;
      resetTime: Date;
      queueSize: number;
      circuitBreakerState: string;
    };
    yodlee: Record<string, {
      currentRequests: number;
      maxRequests: number;
      remainingRequests: number;
      resetTime: Date;
      queueSize: number;
    }>;
    api: Record<string, {
      currentRequests: number;
      maxRequests: number;
      remainingRequests: number;
      resetTime: Date;
    }>;
  };
  
  // Cache performance
  cache: {
    hitRate: number;
    memoryUsage: number;
    redisConnected: boolean;
    totalKeys: number;
    hits: number;
    misses: number;
  };
  
  // Service health
  services: {
    polygon: {
      configured: boolean;
      available: boolean;
      latency?: number;
      tier: string;
    };
    yodlee: {
      configured: boolean;
      available: boolean;
      endpointStatus: Record<string, any>;
    };
    redis: {
      connected: boolean;
      memory?: string;
      uptime?: number;
    };
    database: {
      connected: boolean;
      activeConnections?: number;
      queryTime?: number;
    };
  };
  
  // Application metrics
  application: {
    uptime: number;
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    cpuUsage?: number;
    activeRequests: number;
    errorRate: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string; // JavaScript expression
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldownMs: number;
  lastTriggered?: Date;
  description: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: Partial<MonitoringMetrics>;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export class RateLimitMonitorService {
  private prisma: PrismaClient;
  private metrics: MonitoringMetrics[] = [];
  private alerts: Alert[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  
  // Default alert rules
  private readonly DEFAULT_ALERT_RULES: AlertRule[] = [
    {
      id: 'polygon-rate-limit-critical',
      name: 'Polygon Rate Limit Critical',
      condition: 'metrics.rateLimits.polygon.remainingRequests <= 1',
      severity: 'critical',
      enabled: true,
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      description: 'Polygon API rate limit nearly exhausted'
    },
    {
      id: 'polygon-circuit-breaker-open',
      name: 'Polygon Circuit Breaker Open',
      condition: 'metrics.rateLimits.polygon.circuitBreakerState === "open"',
      severity: 'high',
      enabled: true,
      cooldownMs: 2 * 60 * 1000, // 2 minutes
      description: 'Polygon API circuit breaker is open'
    },
    {
      id: 'cache-hit-rate-low',
      name: 'Cache Hit Rate Low',
      condition: 'metrics.cache.hitRate < 50',
      severity: 'medium',
      enabled: true,
      cooldownMs: 15 * 60 * 1000, // 15 minutes
      description: 'Cache hit rate is below 50%'
    },
    {
      id: 'redis-disconnected',
      name: 'Redis Disconnected',
      condition: '!metrics.cache.redisConnected',
      severity: 'critical',
      enabled: true,
      cooldownMs: 1 * 60 * 1000, // 1 minute
      description: 'Redis connection is down'
    },
    {
      id: 'yodlee-rate-limit-warning',
      name: 'Yodlee Rate Limit Warning',
      condition: 'Object.values(metrics.rateLimits.yodlee).some(limit => limit.remainingRequests <= 5)',
      severity: 'medium',
      enabled: true,
      cooldownMs: 10 * 60 * 1000, // 10 minutes
      description: 'Yodlee API rate limit approaching threshold'
    },
    {
      id: 'api-error-rate-high',
      name: 'API Error Rate High',
      condition: 'metrics.application.errorRate > 5',
      severity: 'high',
      enabled: true,
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      description: 'API error rate is above 5%'
    },
    {
      id: 'memory-usage-high',
      name: 'Memory Usage High',
      condition: 'metrics.application.memoryUsage.percentage > 85',
      severity: 'medium',
      enabled: true,
      cooldownMs: 15 * 60 * 1000, // 15 minutes
      description: 'Application memory usage is above 85%'
    },
    {
      id: 'polygon-service-unavailable',
      name: 'Polygon Service Unavailable',
      condition: 'metrics.services.polygon.configured && !metrics.services.polygon.available',
      severity: 'high',
      enabled: true,
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      description: 'Polygon API service is unavailable'
    },
    {
      id: 'database-disconnected',
      name: 'Database Disconnected',
      condition: '!metrics.services.database.connected',
      severity: 'critical',
      enabled: true,
      cooldownMs: 1 * 60 * 1000, // 1 minute
      description: 'Database connection is down'
    },
    {
      id: 'yodlee-service-unavailable',
      name: 'Yodlee Service Unavailable',
      condition: 'metrics.services.yodlee.configured && !metrics.services.yodlee.available',
      severity: 'high',
      enabled: true,
      cooldownMs: 5 * 60 * 1000, // 5 minutes
      description: 'Yodlee service is unavailable'
    }
  ];

  constructor() {
    this.prisma = new PrismaClient();
    logger.log('📊 Rate Limit Monitor Service initialized');
  }

  /**
   * Start monitoring with specified interval
   */
  async startMonitoring(intervalMs: number = 30000): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('Monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    
    // Initial metrics collection
    await this.collectMetrics();
    
    // Set up periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.evaluateAlerts();
        await this.cleanupOldData();
      } catch (error) {
        logger.error('Error during monitoring cycle:', error);
      }
    }, intervalMs);

    logger.log(`📊 Started monitoring with ${intervalMs}ms interval`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    this.isMonitoring = false;
    logger.log('📊 Stopped monitoring');
  }

  /**
   * Get current metrics
   */
  async getCurrentMetrics(): Promise<MonitoringMetrics> {
    return await this.collectMetrics();
  }

  /**
   * Get historical metrics for time range
   */
  getHistoricalMetrics(startTime: Date, endTime: Date): MonitoringMetrics[] {
    return this.metrics.filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.acknowledged && !alert.resolvedAt);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      logger.log(`🔔 Alert acknowledged: ${alert.ruleName}`);
      return true;
    }
    return false;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      logger.log(`✅ Alert resolved: ${alert.ruleName}`);
      return true;
    }
    return false;
  }

  /**
   * Get service health summary
   */
  async getHealthSummary(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    services: Record<string, 'up' | 'down' | 'degraded'>;
    activeAlerts: number;
    criticalAlerts: number;
    lastUpdate: Date;
  }> {
    const metrics = await this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    
    // Determine overall health
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      overall = 'critical';
    } else if (activeAlerts.length > 0) {
      overall = 'warning';
    }

    // Service status
    const services = {
      polygon: metrics.services.polygon.available ? 'up' : 'down',
      yodlee: metrics.services.yodlee.available ? 'up' : 'down',
      redis: metrics.services.redis.connected ? 'up' : 'down',
      database: metrics.services.database.connected ? 'up' : 'down',
      cache: metrics.cache.hitRate > 30 ? 'up' : 'degraded'
    } as Record<string, 'up' | 'down' | 'degraded'>;

    return {
      overall,
      services,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      lastUpdate: new Date()
    };
  }

  /**
   * Get SLA compliance metrics
   */
  getSLAMetrics(timeRangeHours: number = 24): {
    uptime: number;
    availabilityPercentage: number;
    meanResponseTime: number;
    errorRate: number;
    rateLimitViolations: number;
  } {
    const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
    const relevantMetrics = this.getHistoricalMetrics(startTime, new Date());
    
    if (relevantMetrics.length === 0) {
      return {
        uptime: 0,
        availabilityPercentage: 0,
        meanResponseTime: 0,
        errorRate: 0,
        rateLimitViolations: 0
      };
    }

    // Calculate availability
    const healthyPeriods = relevantMetrics.filter(m => 
      m.services.database.connected && 
      m.services.redis.connected
    );
    const availabilityPercentage = (healthyPeriods.length / relevantMetrics.length) * 100;

    // Calculate mean response time (simplified)
    const responseTimes = relevantMetrics
      .map(m => m.services.polygon.latency)
      .filter(Boolean) as number[];
    const meanResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // Calculate error rate
    const errorRates = relevantMetrics.map(m => m.application.errorRate);
    const avgErrorRate = errorRates.reduce((a, b) => a + b, 0) / errorRates.length;

    // Count rate limit violations (simplified)
    const violations = relevantMetrics.filter(m => 
      m.rateLimits.polygon.remainingRequests <= 0 ||
      Object.values(m.rateLimits.yodlee).some(limit => limit.remainingRequests <= 0)
    ).length;

    return {
      uptime: healthyPeriods.length * 30, // Assuming 30-second intervals
      availabilityPercentage,
      meanResponseTime,
      errorRate: avgErrorRate,
      rateLimitViolations: violations
    };
  }

  /**
   * Export metrics data for external monitoring systems
   */
  exportMetrics(format: 'prometheus' | 'json' = 'json'): string {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    
    if (!latestMetrics) {
      return format === 'json' ? '{}' : '';
    }

    if (format === 'prometheus') {
      return this.formatPrometheusMetrics(latestMetrics);
    }

    return JSON.stringify(latestMetrics, null, 2);
  }

  // Private methods

  private async collectMetrics(): Promise<MonitoringMetrics> {
    const timestamp = new Date();
    
    try {
      // Collect rate limit data
      const [
        polygonHealth,
        yodleeHealth,
        yodleeRateLimits,
        cacheStats,
        rateLimiterMetrics
      ] = await Promise.all([
        polygonBatchService.getServiceHealth(),
        yodleeRateLimitedService.healthCheck(),
        yodleeRateLimitedService.getRateLimitStatus(),
        cacheService.getStats(),
        rateLimiterService.getMetrics()
      ]);

      // Get system metrics
      const systemMetrics = this.getSystemMetrics();
      
      const metrics: MonitoringMetrics = {
        timestamp,
        
        rateLimits: {
          polygon: {
            currentRequests: polygonHealth.rateLimitStatus?.currentRequests || 0,
            maxRequests: polygonHealth.rateLimitStatus?.maxRequests || 5,
            remainingRequests: Math.max(0, (polygonHealth.rateLimitStatus?.maxRequests || 5) - (polygonHealth.rateLimitStatus?.currentRequests || 0)),
            resetTime: polygonHealth.rateLimitStatus?.resetTime || new Date(),
            queueSize: polygonHealth.rateLimitStatus?.queueSize || 0,
            circuitBreakerState: polygonHealth.rateLimitStatus?.circuitBreakerState || 'closed'
          },
          yodlee: yodleeRateLimits,
          api: {} // Will be populated by API middleware
        },
        
        cache: cacheStats,
        
        services: {
          polygon: {
            configured: polygonHealth.configured,
            available: polygonHealth.lastTestResult?.success || false,
            latency: polygonHealth.lastTestResult?.latency,
            tier: polygonHealth.tier
          },
          yodlee: {
            configured: yodleeHealth.configured,
            available: yodleeHealth.testResult?.success !== false,
            endpointStatus: yodleeHealth.rateLimitStatus
          },
          redis: {
            connected: cacheStats.redisConnected,
            memory: undefined, // Would get from Redis INFO command
            uptime: undefined
          },
          database: {
            connected: await this.testDatabaseConnection(),
            activeConnections: undefined,
            queryTime: undefined
          }
        },
        
        application: {
          uptime: process.uptime() * 1000,
          memoryUsage: systemMetrics.memory,
          cpuUsage: systemMetrics.cpu,
          activeRequests: 0, // Would be tracked by middleware
          errorRate: this.calculateErrorRate()
        }
      };

      // Store metrics (keep last 1000 entries)
      this.metrics.push(metrics);
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      return metrics;

    } catch (error) {
      logger.error('Failed to collect metrics:', error);
      
      // Return minimal metrics on error
      return {
        timestamp,
        rateLimits: { polygon: {} as any, yodlee: {}, api: {} },
        cache: { hitRate: 0, memoryUsage: 0, redisConnected: false, totalKeys: 0, hits: 0, misses: 0 },
        services: {
          polygon: { configured: false, available: false, tier: 'FREE' },
          yodlee: { configured: false, available: false, endpointStatus: {} },
          redis: { connected: false },
          database: { connected: false }
        },
        application: {
          uptime: process.uptime() * 1000,
          memoryUsage: { used: 0, total: 0, percentage: 0 },
          activeRequests: 0,
          errorRate: 0
        }
      };
    }
  }

  private async evaluateAlerts(): Promise<void> {
    const currentMetrics = this.metrics[this.metrics.length - 1];
    if (!currentMetrics) return;

    for (const rule of this.DEFAULT_ALERT_RULES) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered && 
          Date.now() - rule.lastTriggered.getTime() < rule.cooldownMs) {
        continue;
      }

      try {
        // Evaluate condition
        const conditionMet = this.evaluateCondition(rule.condition, currentMetrics);
        
        if (conditionMet) {
          this.triggerAlert(rule, currentMetrics);
        }
      } catch (error) {
        logger.error(`Failed to evaluate alert rule ${rule.id}:`, error);
      }
    }
  }

  private evaluateCondition(condition: string, metrics: MonitoringMetrics): boolean {
    try {
      // Create safe evaluation context
      const context = { metrics, Math, Date, Object };
      
      // Simple expression evaluation (in production, use a proper expression parser)
      const func = new Function('metrics', 'Math', 'Date', 'Object', `return ${condition}`);
      return func(metrics, Math, Date, Object);
    } catch (error) {
      logger.error('Failed to evaluate condition:', condition, error);
      return false;
    }
  }

  private triggerAlert(rule: AlertRule, metrics: MonitoringMetrics): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: `${rule.description} - ${rule.condition}`,
      metrics,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);
    rule.lastTriggered = new Date();

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    logger.warn(`🚨 Alert triggered: ${rule.name} (${rule.severity})`);
    
    // In production, send notifications here (email, Slack, PagerDuty, etc.)
    this.sendAlertNotification(alert);
  }

  private sendAlertNotification(alert: Alert): void {
    // Placeholder for notification system
    // In production, integrate with email, Slack, PagerDuty, etc.
    logger.error(`ALERT: ${alert.ruleName} - ${alert.message}`);
  }

  private async testDatabaseConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  private getSystemMetrics(): {
    memory: { used: number; total: number; percentage: number };
    cpu?: number;
  } {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;
    
    return {
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: (usedMemory / totalMemory) * 100
      }
    };
  }

  private calculateErrorRate(): number {
    // Simplified error rate calculation
    // In production, track actual request/error counts
    return 0;
  }

  private formatPrometheusMetrics(metrics: MonitoringMetrics): string {
    const lines: string[] = [];
    
    // Rate limit metrics
    lines.push(`rate_limit_remaining{service="polygon"} ${metrics.rateLimits.polygon.remainingRequests}`);
    lines.push(`rate_limit_max{service="polygon"} ${metrics.rateLimits.polygon.maxRequests}`);
    
    // Cache metrics
    lines.push(`cache_hit_rate ${metrics.cache.hitRate}`);
    lines.push(`cache_memory_usage ${metrics.cache.memoryUsage}`);
    
    // Service availability
    lines.push(`service_available{service="polygon"} ${metrics.services.polygon.available ? 1 : 0}`);
    lines.push(`service_available{service="yodlee"} ${metrics.services.yodlee.available ? 1 : 0}`);
    lines.push(`service_available{service="redis"} ${metrics.services.redis.connected ? 1 : 0}`);
    lines.push(`service_available{service="database"} ${metrics.services.database.connected ? 1 : 0}`);
    
    // Application metrics
    lines.push(`app_uptime ${metrics.application.uptime}`);
    lines.push(`app_memory_usage_percentage ${metrics.application.memoryUsage.percentage}`);
    lines.push(`app_error_rate ${metrics.application.errorRate}`);
    
    return lines.join('\n');
  }

  private async cleanupOldData(): Promise<void> {
    // Keep metrics for last 24 hours
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
    
    // Keep alerts for last 7 days
    const alertCutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp > alertCutoffTime);
  }

  /**
   * Cleanup method for graceful shutdown
   */
  async cleanup(): Promise<void> {
    this.stopMonitoring();
    await this.prisma.$disconnect();
    logger.log('🔄 Rate Limit Monitor Service cleaned up');
  }
}

// Export singleton instance
export const rateLimitMonitorService = new RateLimitMonitorService();

// Export types
export type { MonitoringMetrics, AlertRule, Alert };