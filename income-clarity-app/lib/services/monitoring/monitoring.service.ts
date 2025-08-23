/**
 * Comprehensive monitoring service for error tracking, performance monitoring, and metrics collection
 * Integrates with external services like Sentry, DataDog, and provides custom monitoring capabilities
 */

import { logger } from '@/lib/services/logging/logger.service';
import { auditLogger, AuditEventType } from '@/lib/services/logging/audit-logger.service';

export enum ErrorCategory {
  AUTHENTICATION = 'auth',
  PAYMENT = 'payment',
  SYNC = 'sync',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 1,      // Log only
  MEDIUM = 2,   // Alert after threshold
  HIGH = 3,     // Alert immediately
  CRITICAL = 4  // Page on-call
}

export interface ErrorEvent {
  id: string;
  timestamp: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  error: Error;
  context: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  fingerprint: string;
  tags: Record<string, string>;
}

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  name: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  context: Record<string, any>;
}

export interface BusinessMetric {
  id: string;
  timestamp: string;
  event: string;
  value: number;
  properties: Record<string, any>;
  userId?: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: string;
  lastActivity: string;
  pageViews: number;
  events: string[];
  userAgent?: string;
  ipAddress?: string;
  location?: string;
}

class MonitoringService {
  private errorCounts: Map<string, number> = new Map();
  private performanceData: Map<string, number[]> = new Map();
  private activeSessions: Map<string, UserSession> = new Map();
  private alertThresholds: Map<string, number> = new Map();

  constructor() {
    this.initializeAlertThresholds();
    this.startPerformanceCollection();
  }

  private initializeAlertThresholds() {
    // Define alert thresholds for different error types
    this.alertThresholds.set('payment_errors_per_hour', 10);
    this.alertThresholds.set('sync_failure_rate', 0.25); // 25%
    this.alertThresholds.set('api_error_rate', 0.10); // 10%
    this.alertThresholds.set('response_time_p95', 5000); // 5 seconds
    this.alertThresholds.set('database_errors_per_minute', 5);
    this.alertThresholds.set('auth_failures_per_minute', 20);
  }

  private startPerformanceCollection() {
    // Collect system metrics every minute
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000);
  }

  /**
   * Track application errors with context and categorization
   */
  trackError(
    error: Error,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      category,
      severity,
      message: error.message,
      error,
      context,
      userId,
      sessionId,
      requestId,
      fingerprint: this.generateErrorFingerprint(error, category),
      tags: this.generateErrorTags(error, category, context)
    };

    // Log error
    logger.error('Error tracked by monitoring service', error, {
      monitoringEvent: errorEvent,
      category,
      severity: ErrorSeverity[severity]
    });

    // Update error counts for alerting
    this.updateErrorCounts(errorEvent);

    // Send to external monitoring services
    this.sendToExternalServices(errorEvent);

    // Check for alerting thresholds
    this.checkAlertThresholds(errorEvent);

    // Audit critical errors
    if (severity >= ErrorSeverity.HIGH) {
      this.auditCriticalError(errorEvent);
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    name: string,
    value: number,
    unit: string = 'ms',
    tags: Record<string, string> = {},
    context: Record<string, any> = {}
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      name,
      value,
      unit,
      tags,
      context
    };

    // Store for aggregation
    if (!this.performanceData.has(name)) {
      this.performanceData.set(name, []);
    }
    this.performanceData.get(name)!.push(value);

    // Keep only last 1000 data points
    const data = this.performanceData.get(name)!;
    if (data.length > 1000) {
      data.splice(0, data.length - 1000);
    }

    logger.info('Performance metric tracked', {
      metric,
      aggregateStats: this.calculateStats(data)
    });

    // Check performance thresholds
    this.checkPerformanceThresholds(metric);
  }

  /**
   * Track business metrics and events
   */
  trackBusinessMetric(
    event: string,
    value: number = 1,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    const metric: BusinessMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      event,
      value,
      properties,
      userId
    };

    logger.metric(event, value, properties);

    // Send to analytics services
    this.sendBusinessMetricToAnalytics(metric);
  }

  /**
   * Track user sessions
   */
  startUserSession(
    sessionId: string,
    userId?: string,
    userAgent?: string,
    ipAddress?: string,
    location?: string
  ): void {
    const session: UserSession = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      pageViews: 0,
      events: [],
      userAgent,
      ipAddress,
      location
    };

    this.activeSessions.set(sessionId, session);

    logger.info('User session started', {
      sessionId,
      userId,
      sessionStart: session.startTime
    });
  }

  /**
   * Update user session activity
   */
  updateUserSession(sessionId: string, event: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date().toISOString();
      session.events.push(event);
      
      if (event === 'page_view') {
        session.pageViews++;
      }
    }
  }

  /**
   * End user session
   */
  endUserSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const sessionDuration = Date.now() - new Date(session.startTime).getTime();
      
      logger.info('User session ended', {
        sessionId,
        userId: session.userId,
        duration: sessionDuration,
        pageViews: session.pageViews,
        eventCount: session.events.length
      });

      // Track session metrics
      this.trackBusinessMetric('session_ended', 1, {
        duration: sessionDuration,
        pageViews: session.pageViews,
        eventCount: session.events.length
      }, session.userId);

      this.activeSessions.delete(sessionId);
    }
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, any>;
    metrics: Record<string, any>;
  } {
    const checks = {
      errorRate: this.calculateErrorRate(),
      responseTime: this.getAverageResponseTime(),
      activeErrors: this.getActiveErrorCount(),
      systemMemory: this.getMemoryUsage(),
      activeSessions: this.activeSessions.size
    };

    const status = this.determineOverallHealth(checks);

    return {
      status,
      checks,
      metrics: this.getAggregatedMetrics()
    };
  }

  /**
   * Get error analytics
   */
  getErrorAnalytics(timeRange: string = '24h'): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    topErrors: Array<{ message: string; count: number }>;
    errorRate: number;
  } {
    // This would query stored error data
    // For now, return current session data
    const categoryCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = {};

    this.errorCounts.forEach((count, key) => {
      const [category, severity] = key.split(':');
      categoryCounts[category] = (categoryCounts[category] || 0) + count;
      severityCounts[severity] = (severityCounts[severity] || 0) + count;
    });

    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      errorsByCategory: categoryCounts,
      errorsBySeverity: severityCounts,
      topErrors: [], // Would be populated from stored data
      errorRate: this.calculateErrorRate()
    };
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(): Record<string, any> {
    const analytics: Record<string, any> = {};

    this.performanceData.forEach((values, metric) => {
      analytics[metric] = this.calculateStats(values);
    });

    return analytics;
  }

  private generateId(): string {
    return `mon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorFingerprint(error: Error, category: ErrorCategory): string {
    const content = `${category}:${error.name}:${error.message.substring(0, 100)}`;
    return Buffer.from(content).toString('base64').substring(0, 32);
  }

  private generateErrorTags(
    error: Error,
    category: ErrorCategory,
    context: Record<string, any>
  ): Record<string, string> {
    return {
      category,
      errorType: error.name,
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.APP_VERSION || '1.0.0',
      ...Object.entries(context)
        .filter(([, value]) => typeof value === 'string')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    };
  }

  private updateErrorCounts(errorEvent: ErrorEvent): void {
    const key = `${errorEvent.category}:${ErrorSeverity[errorEvent.severity]}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  private sendToExternalServices(errorEvent: ErrorEvent): void {
    // Integration with Sentry
    if (process.env.SENTRY_DSN && errorEvent.severity >= ErrorSeverity.MEDIUM) {
      this.sendToSentry(errorEvent);
    }

    // Integration with DataDog
    if (process.env.DATADOG_API_KEY) {
      this.sendToDataDog(errorEvent);
    }

    // Custom webhook integration
    if (process.env.MONITORING_WEBHOOK_URL) {
      this.sendToWebhook(errorEvent);
    }
  }

  private sendToSentry(errorEvent: ErrorEvent): void {
    try {
      // This would integrate with Sentry SDK
      console.log('Would send to Sentry:', {
        fingerprint: errorEvent.fingerprint,
        level: ErrorSeverity[errorEvent.severity].toLowerCase(),
        tags: errorEvent.tags,
        extra: errorEvent.context
      });
    } catch (error) {
      logger.error('Failed to send error to Sentry', error as Error);
    }
  }

  private sendToDataDog(errorEvent: ErrorEvent): void {
    try {
      // This would integrate with DataDog API
      console.log('Would send to DataDog:', errorEvent);
    } catch (error) {
      logger.error('Failed to send error to DataDog', error as Error);
    }
  }

  private sendToWebhook(errorEvent: ErrorEvent): void {
    try {
      // This would send to custom webhook
      fetch(process.env.MONITORING_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEvent)
      }).catch(error => {
        logger.error('Failed to send error to webhook', error);
      });
    } catch (error) {
      logger.error('Failed to send error to webhook', error as Error);
    }
  }

  private sendBusinessMetricToAnalytics(metric: BusinessMetric): void {
    // Integration with analytics services
    if (process.env.ANALYTICS_API_KEY) {
      try {
        console.log('Would send to analytics:', metric);
      } catch (error) {
        logger.error('Failed to send business metric to analytics', error as Error);
      }
    }
  }

  private checkAlertThresholds(errorEvent: ErrorEvent): void {
    const categoryKey = `${errorEvent.category}_errors_per_hour`;
    const threshold = this.alertThresholds.get(categoryKey);
    
    if (threshold && this.getErrorCountForCategory(errorEvent.category, 'hour') > threshold) {
      this.triggerAlert({
        type: 'error_threshold_exceeded',
        severity: 'HIGH',
        message: `${errorEvent.category} error threshold exceeded`,
        details: {
          category: errorEvent.category,
          threshold,
          currentCount: this.getErrorCountForCategory(errorEvent.category, 'hour')
        }
      });
    }
  }

  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    const threshold = this.alertThresholds.get(`${metric.name}_threshold`);
    
    if (threshold && metric.value > threshold) {
      this.triggerAlert({
        type: 'performance_threshold_exceeded',
        severity: 'MEDIUM',
        message: `${metric.name} threshold exceeded`,
        details: {
          metric: metric.name,
          value: metric.value,
          threshold,
          unit: metric.unit
        }
      });
    }
  }

  private triggerAlert(alert: {
    type: string;
    severity: string;
    message: string;
    details: Record<string, any>;
  }): void {
    logger.error(`ALERT: ${alert.message}`, new Error(alert.message), {
      alert: true,
      alertType: alert.type,
      severity: alert.severity,
      details: alert.details
    });

    // Send alert to notification channels
    this.sendAlertNotification(alert);
  }

  private sendAlertNotification(alert: any): void {
    // Integration with alerting services (PagerDuty, Slack, etc.)
    if (process.env.SLACK_WEBHOOK_URL) {
      this.sendSlackAlert(alert);
    }
    
    if (process.env.PAGERDUTY_INTEGRATION_KEY && alert.severity === 'CRITICAL') {
      this.sendPagerDutyAlert(alert);
    }
  }

  private sendSlackAlert(alert: any): void {
    try {
      fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${alert.severity}: ${alert.message}`,
          attachments: [{
            color: alert.severity === 'CRITICAL' ? 'danger' : 'warning',
            fields: Object.entries(alert.details).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true
            }))
          }]
        })
      }).catch(error => {
        logger.error('Failed to send Slack alert', error);
      });
    } catch (error) {
      logger.error('Failed to send Slack alert', error as Error);
    }
  }

  private sendPagerDutyAlert(alert: any): void {
    // PagerDuty integration for critical alerts
    try {
      console.log('Would send PagerDuty alert:', alert);
    } catch (error) {
      logger.error('Failed to send PagerDuty alert', error as Error);
    }
  }

  private auditCriticalError(errorEvent: ErrorEvent): void {
    auditLogger.logSecurityEvent(
      AuditEventType.SUSPICIOUS_ACTIVITY,
      {
        component: 'MonitoringService',
        userId: errorEvent.userId,
        requestId: errorEvent.requestId
      },
      'ERROR',
      {
        errorId: errorEvent.id,
        category: errorEvent.category,
        severity: ErrorSeverity[errorEvent.severity],
        fingerprint: errorEvent.fingerprint
      }
    );
  }

  private collectSystemMetrics(): void {
    try {
      const memUsage = process.memoryUsage();
      
      this.trackPerformance('system.memory.heap_used', memUsage.heapUsed, 'bytes');
      this.trackPerformance('system.memory.heap_total', memUsage.heapTotal, 'bytes');
      this.trackPerformance('system.memory.external', memUsage.external, 'bytes');
      
      // CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      this.trackPerformance('system.cpu.user', cpuUsage.user, 'microseconds');
      this.trackPerformance('system.cpu.system', cpuUsage.system, 'microseconds');
      
    } catch (error) {
      logger.error('Failed to collect system metrics', error as Error);
    }
  }

  private calculateErrorRate(): number {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    const totalRequests = totalErrors + 1000; // Simplified calculation
    return totalErrors / totalRequests;
  }

  private getAverageResponseTime(): number {
    const responseTimes = this.performanceData.get('api.response_time') || [];
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  private getActiveErrorCount(): number {
    return Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
  }

  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed / (1024 * 1024); // MB
  }

  private getErrorCountForCategory(category: ErrorCategory, timeRange: string): number {
    // Simplified - would query actual time-based data
    return this.errorCounts.get(`${category}:${timeRange}`) || 0;
  }

  private determineOverallHealth(checks: Record<string, any>): 'healthy' | 'degraded' | 'unhealthy' {
    if (checks.errorRate > 0.1 || checks.activeErrors > 100) return 'unhealthy';
    if (checks.errorRate > 0.05 || checks.responseTime > 2000) return 'degraded';
    return 'healthy';
  }

  private getAggregatedMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    this.performanceData.forEach((values, key) => {
      metrics[key] = this.calculateStats(values);
    });
    
    return metrics;
  }

  private calculateStats(values: number[]): {
    count: number;
    mean: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    if (values.length === 0) {
      return { count: 0, mean: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      mean: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();

// Helper functions for common monitoring scenarios
export function trackApiError(error: Error, endpoint: string, userId?: string): void {
  monitoringService.trackError(
    error,
    ErrorCategory.EXTERNAL_API,
    ErrorSeverity.MEDIUM,
    { endpoint },
    userId
  );
}

export function trackDatabaseError(error: Error, query: string, userId?: string): void {
  monitoringService.trackError(
    error,
    ErrorCategory.DATABASE,
    ErrorSeverity.HIGH,
    { query: query.substring(0, 100) }, // Truncate for security
    userId
  );
}

export function trackPaymentError(error: Error, amount: number, userId?: string): void {
  monitoringService.trackError(
    error,
    ErrorCategory.PAYMENT,
    ErrorSeverity.CRITICAL,
    { amount },
    userId
  );
}

export function trackSyncError(error: Error, syncType: string, userId?: string): void {
  monitoringService.trackError(
    error,
    ErrorCategory.SYNC,
    ErrorSeverity.MEDIUM,
    { syncType },
    userId
  );
}

export function trackApiResponseTime(endpoint: string, duration: number): void {
  monitoringService.trackPerformance(
    'api.response_time',
    duration,
    'ms',
    { endpoint }
  );
}

export default MonitoringService;