/**
 * Comprehensive metrics collection service for business metrics, technical metrics, and custom events
 * Provides real-time analytics, performance tracking, and business intelligence capabilities
 */

import { logger } from '@/lib/logging/logger.service';

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer'
}

export interface Metric {
  id: string;
  timestamp: string;
  name: string;
  type: MetricType;
  value: number;
  unit?: string;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface BusinessMetric extends Metric {
  event: string;
  userId?: string;
  revenue?: number;
  conversionStep?: string;
}

export interface TechnicalMetric extends Metric {
  component: string;
  operation?: string;
  duration?: number;
  status?: 'success' | 'error' | 'timeout';
}

export interface UserMetric extends Metric {
  userId: string;
  sessionId?: string;
  feature?: string;
  action?: string;
}

export interface MetricAggregation {
  name: string;
  timeRange: { start: string; end: string };
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  rate: number; // per second
}

export interface ConversionFunnel {
  name: string;
  steps: Array<{
    step: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
  totalUsers: number;
  overallConversionRate: number;
}

export interface RetentionCohort {
  cohortDate: string;
  users: number;
  retention: Array<{
    period: number;
    retainedUsers: number;
    retentionRate: number;
  }>;
}

class MetricsService {
  private metrics: Map<string, Metric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private timers: Map<string, { startTime: number; operations: string[] }> = new Map();
  private readonly MAX_METRICS_PER_TYPE = 10000;
  private readonly FLUSH_INTERVAL = 60000; // 1 minute

  constructor() {
    this.startMetricsFlushing();
    this.startPeriodicReporting();
  }

  /**
   * Business Metrics - Track user behavior, conversions, revenue
   */

  // User registration and conversion metrics
  trackUserSignup(userId: string, source: string, plan: 'free' | 'premium' = 'free'): void {
    this.recordBusinessMetric({
      event: 'user_signup',
      userId,
      value: 1,
      tags: { source, plan },
      metadata: { timestamp: new Date().toISOString() }
    });
  }

  trackConversion(userId: string, fromPlan: string, toPlan: string, revenue: number): void {
    this.recordBusinessMetric({
      event: 'plan_conversion',
      userId,
      value: 1,
      revenue,
      tags: { fromPlan, toPlan },
      metadata: { conversionType: 'upgrade' }
    });
  }

  trackChurn(userId: string, plan: string, reason?: string): void {
    this.recordBusinessMetric({
      event: 'user_churn',
      userId,
      value: 1,
      tags: { plan, reason: reason || 'unknown' },
      metadata: { churnDate: new Date().toISOString() }
    });
  }

  trackRevenue(amount: number, source: string, userId?: string): void {
    this.recordBusinessMetric({
      event: 'revenue',
      userId,
      value: amount,
      revenue: amount,
      tags: { source, currency: 'USD' }
    });
  }

  // Feature usage metrics
  trackFeatureUsage(userId: string, feature: string, action: string, value: number = 1): void {
    this.recordUserMetric({
      userId,
      name: 'feature_usage',
      value,
      feature,
      action,
      tags: { feature, action }
    });
  }

  trackSyncEvent(userId: string, syncType: 'manual' | 'automatic', success: boolean, duration?: number): void {
    this.recordBusinessMetric({
      event: 'sync_completed',
      userId,
      value: success ? 1 : 0,
      tags: { syncType, status: success ? 'success' : 'failure' },
      metadata: { duration }
    });
  }

  trackPortfolioView(userId: string, portfolioValue: number): void {
    this.recordUserMetric({
      userId,
      name: 'portfolio_view',
      value: 1,
      tags: { valueRange: this.getValueRange(portfolioValue) },
      metadata: { portfolioValue }
    });
  }

  /**
   * Technical Metrics - Track system performance, API responses, errors
   */

  trackApiRequest(endpoint: string, method: string, statusCode: number, duration: number, userId?: string): void {
    this.recordTechnicalMetric({
      component: 'API',
      name: 'api_request',
      operation: `${method} ${endpoint}`,
      value: 1,
      duration,
      status: statusCode < 400 ? 'success' : 'error',
      tags: {
        endpoint: endpoint.replace(/\/\d+/g, '/:id'), // Normalize dynamic IDs
        method,
        statusCode: statusCode.toString(),
        statusClass: `${Math.floor(statusCode / 100)}xx`
      },
      metadata: { userId }
    });

    // Track response time separately
    this.recordTechnicalMetric({
      component: 'API',
      name: 'api_response_time',
      operation: endpoint,
      value: duration,
      unit: 'ms',
      tags: { endpoint, method }
    });
  }

  trackDatabaseQuery(query: string, duration: number, success: boolean): void {
    const operation = this.normalizeQuery(query);
    
    this.recordTechnicalMetric({
      component: 'Database',
      name: 'db_query',
      operation,
      value: 1,
      duration,
      status: success ? 'success' : 'error',
      tags: { operation, status: success ? 'success' : 'error' },
      unit: 'ms'
    });
  }

  trackExternalApiCall(service: string, endpoint: string, duration: number, success: boolean): void {
    this.recordTechnicalMetric({
      component: 'ExternalAPI',
      name: 'external_api_call',
      operation: `${service}:${endpoint}`,
      value: 1,
      duration,
      status: success ? 'success' : 'error',
      tags: { service, endpoint, status: success ? 'success' : 'error' }
    });
  }

  trackMemoryUsage(component: string, heapUsed: number, heapTotal: number): void {
    this.recordTechnicalMetric({
      component,
      name: 'memory_usage',
      value: heapUsed,
      unit: 'bytes',
      tags: { type: 'heap_used' },
      metadata: { heapTotal, heapUtilization: heapUsed / heapTotal }
    });
  }

  trackCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, duration?: number): void {
    this.recordTechnicalMetric({
      component: 'Cache',
      name: 'cache_operation',
      operation,
      value: 1,
      duration,
      tags: { operation, keyType: this.getCacheKeyType(key) }
    });
  }

  /**
   * Custom Metrics - Flexible metric tracking
   */

  increment(name: string, value: number = 1, tags: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, tags);
    this.counters.set(key, (this.counters.get(key) || 0) + value);
    
    this.recordMetric({
      name,
      type: MetricType.COUNTER,
      value: this.counters.get(key)!,
      tags
    });
  }

  gauge(name: string, value: number, tags: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, tags);
    this.gauges.set(key, value);
    
    this.recordMetric({
      name,
      type: MetricType.GAUGE,
      value,
      tags
    });
  }

  histogram(name: string, value: number, tags: Record<string, string> = {}): void {
    this.recordMetric({
      name,
      type: MetricType.HISTOGRAM,
      value,
      tags
    });
  }

  timer(name: string, operation?: string): { end: () => void } {
    const timerId = `${name}:${operation || 'default'}:${Date.now()}`;
    const startTime = Date.now();
    
    this.timers.set(timerId, {
      startTime,
      operations: operation ? [operation] : []
    });

    return {
      end: () => {
        const timer = this.timers.get(timerId);
        if (timer) {
          const duration = Date.now() - timer.startTime;
          this.recordMetric({
            name,
            type: MetricType.TIMER,
            value: duration,
            unit: 'ms',
            tags: operation ? { operation } : {}
          });
          this.timers.delete(timerId);
        }
      }
    };
  }

  /**
   * Analytics and Aggregation
   */

  getMetricAggregation(
    name: string,
    timeRange: { start: string; end: string },
    tags: Record<string, string> = {}
  ): MetricAggregation | null {
    const metrics = this.getMetricsInRange(name, timeRange, tags);
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    const sortedValues = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;
    const avg = sum / count;

    const timeRangeSeconds = (new Date(timeRange.end).getTime() - new Date(timeRange.start).getTime()) / 1000;
    const rate = count / timeRangeSeconds;

    return {
      name,
      timeRange,
      count,
      sum,
      avg,
      min: sortedValues[0],
      max: sortedValues[sortedValues.length - 1],
      p50: sortedValues[Math.floor(count * 0.5)],
      p95: sortedValues[Math.floor(count * 0.95)],
      p99: sortedValues[Math.floor(count * 0.99)],
      rate
    };
  }

  getConversionFunnel(funnelName: string, timeRange: { start: string; end: string }): ConversionFunnel {
    // Define funnel steps for different scenarios
    const funnelSteps = this.getFunnelSteps(funnelName);
    const stepMetrics = funnelSteps.map(step => {
      const metrics = this.getMetricsInRange(step.event, timeRange, step.tags || {});
      return {
        step: step.name,
        users: new Set(metrics.map(m => (m as BusinessMetric).userId).filter(Boolean)).size,
        conversionRate: 0, // Will be calculated
        dropoffRate: 0 // Will be calculated
      };
    });

    // Calculate conversion rates
    const totalUsers = stepMetrics[0]?.users || 0;
    stepMetrics.forEach((step, index) => {
      if (index === 0) {
        step.conversionRate = 1;
        step.dropoffRate = 0;
      } else {
        const previousUsers = stepMetrics[index - 1].users;
        step.conversionRate = previousUsers > 0 ? step.users / previousUsers : 0;
        step.dropoffRate = 1 - step.conversionRate;
      }
    });

    const overallConversionRate = totalUsers > 0 ? (stepMetrics[stepMetrics.length - 1]?.users || 0) / totalUsers : 0;

    return {
      name: funnelName,
      steps: stepMetrics,
      totalUsers,
      overallConversionRate
    };
  }

  getRetentionCohorts(timeRange: { start: string; end: string }): RetentionCohort[] {
    // This would typically query stored user data
    // For now, return a simplified structure
    const cohorts: RetentionCohort[] = [];
    
    // Generate weekly cohorts
    const startDate = new Date(timeRange.start);
    const endDate = new Date(timeRange.end);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 7)) {
      const cohortDate = date.toISOString().split('T')[0];
      const signupMetrics = this.getMetricsInRange('user_signup', {
        start: cohortDate,
        end: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      const users = new Set(signupMetrics.map(m => (m as BusinessMetric).userId)).size;
      
      cohorts.push({
        cohortDate,
        users,
        retention: this.calculateRetentionForCohort(cohortDate, users)
      });
    }
    
    return cohorts;
  }

  /**
   * Utility Methods
   */

  getCurrentMetrics(): Record<string, any> {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      activeTimers: this.timers.size,
      totalMetrics: Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0)
    };
  }

  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: Record<string, any>;
  } {
    const apiErrorRate = this.calculateErrorRate('api_request', { minutes: 15 });
    const avgResponseTime = this.calculateAverageResponseTime({ minutes: 15 });
    const memoryUsage = this.getLatestGauge('memory_usage');

    const status = this.determineHealthStatus(apiErrorRate, avgResponseTime, memoryUsage);

    return {
      status,
      metrics: {
        apiErrorRate,
        avgResponseTime,
        memoryUsage,
        activeConnections: this.getLatestGauge('active_connections') || 0,
        queueDepth: this.getLatestGauge('queue_depth') || 0
      }
    };
  }

  private recordBusinessMetric(data: Partial<BusinessMetric>): void {
    const metric: BusinessMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: MetricType.COUNTER,
      name: data.event || 'business_event',
      event: data.event!,
      value: data.value || 1,
      userId: data.userId,
      revenue: data.revenue,
      conversionStep: data.conversionStep,
      tags: data.tags || {},
      metadata: data.metadata
    };

    this.storeMetric(metric);
    logger.metric(metric.event, metric.value, metric.tags);
  }

  private recordTechnicalMetric(data: Partial<TechnicalMetric>): void {
    const metric: TechnicalMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: MetricType.GAUGE,
      name: data.name!,
      component: data.component!,
      operation: data.operation,
      value: data.value || 1,
      duration: data.duration,
      status: data.status,
      unit: data.unit,
      tags: data.tags || {},
      metadata: data.metadata
    };

    this.storeMetric(metric);
  }

  private recordUserMetric(data: Partial<UserMetric>): void {
    const metric: UserMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: MetricType.COUNTER,
      name: data.name!,
      userId: data.userId!,
      sessionId: data.sessionId,
      feature: data.feature,
      action: data.action,
      value: data.value || 1,
      tags: data.tags || {},
      metadata: data.metadata
    };

    this.storeMetric(metric);
  }

  private recordMetric(data: Partial<Metric>): void {
    const metric: Metric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      name: data.name!,
      type: data.type || MetricType.GAUGE,
      value: data.value || 0,
      unit: data.unit,
      tags: data.tags || {},
      metadata: data.metadata
    };

    this.storeMetric(metric);
  }

  private storeMetric(metric: Metric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metrics = this.metrics.get(metric.name)!;
    metrics.push(metric);

    // Limit stored metrics to prevent memory issues
    if (metrics.length > this.MAX_METRICS_PER_TYPE) {
      metrics.splice(0, metrics.length - this.MAX_METRICS_PER_TYPE);
    }
  }

  private getMetricsInRange(
    name: string,
    timeRange: { start: string; end: string },
    tags: Record<string, string> = {}
  ): Metric[] {
    const metrics = this.metrics.get(name) || [];
    const start = new Date(timeRange.start);
    const end = new Date(timeRange.end);

    return metrics.filter(metric => {
      const timestamp = new Date(metric.timestamp);
      const inTimeRange = timestamp >= start && timestamp <= end;
      const matchesTags = Object.entries(tags).every(([key, value]) => metric.tags[key] === value);
      return inTimeRange && matchesTags;
    });
  }

  private getMetricKey(name: string, tags: Record<string, string>): string {
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join(',');
    return `${name}:${tagString}`;
  }

  private normalizeQuery(query: string): string {
    // Normalize SQL queries to group similar operations
    return query
      .replace(/\b\d+\b/g, '?') // Replace numbers with placeholders
      .replace(/'\w+'/g, '?') // Replace string literals
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  }

  private getCacheKeyType(key: string): string {
    if (key.startsWith('user:')) return 'user';
    if (key.startsWith('portfolio:')) return 'portfolio';
    if (key.startsWith('session:')) return 'session';
    return 'other';
  }

  private getValueRange(value: number): string {
    if (value < 1000) return '0-1K';
    if (value < 10000) return '1K-10K';
    if (value < 100000) return '10K-100K';
    if (value < 1000000) return '100K-1M';
    return '1M+';
  }

  private getFunnelSteps(funnelName: string): Array<{ name: string; event: string; tags?: Record<string, string> }> {
    const funnels = {
      signup: [
        { name: 'Landing Page Visit', event: 'page_view', tags: { page: 'landing' } },
        { name: 'Signup Started', event: 'signup_started' },
        { name: 'Email Verified', event: 'email_verified' },
        { name: 'Account Created', event: 'user_signup' },
        { name: 'First Login', event: 'login_success' }
      ],
      conversion: [
        { name: 'Free User', event: 'user_signup', tags: { plan: 'free' } },
        { name: 'Trial Started', event: 'trial_started' },
        { name: 'Payment Info Added', event: 'payment_method_added' },
        { name: 'Subscription Created', event: 'plan_conversion' }
      ]
    };

    return funnels[funnelName as keyof typeof funnels] || [];
  }

  private calculateRetentionForCohort(cohortDate: string, cohortSize: number): Array<{ period: number; retainedUsers: number; retentionRate: number }> {
    // Simplified retention calculation
    // In production, this would query actual user activity data
    const retention = [];
    for (let period = 1; period <= 12; period++) {
      const retainedUsers = Math.floor(cohortSize * Math.pow(0.85, period)); // Simplified retention curve
      retention.push({
        period,
        retainedUsers,
        retentionRate: cohortSize > 0 ? retainedUsers / cohortSize : 0
      });
    }
    return retention;
  }

  private calculateErrorRate(metricName: string, timeWindow: { minutes: number }): number {
    const end = new Date();
    const start = new Date(end.getTime() - timeWindow.minutes * 60000);
    
    const metrics = this.getMetricsInRange(metricName, {
      start: start.toISOString(),
      end: end.toISOString()
    });

    const total = metrics.length;
    const errors = metrics.filter(m => m.tags.status === 'error').length;
    
    return total > 0 ? errors / total : 0;
  }

  private calculateAverageResponseTime(timeWindow: { minutes: number }): number {
    const end = new Date();
    const start = new Date(end.getTime() - timeWindow.minutes * 60000);
    
    const metrics = this.getMetricsInRange('api_response_time', {
      start: start.toISOString(),
      end: end.toISOString()
    });

    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  private getLatestGauge(name: string): number | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;
    
    return metrics[metrics.length - 1].value;
  }

  private determineHealthStatus(errorRate: number, responseTime: number, memoryUsage: number | null): 'healthy' | 'degraded' | 'unhealthy' {
    if (errorRate > 0.1 || responseTime > 5000 || (memoryUsage && memoryUsage > 0.9)) {
      return 'unhealthy';
    }
    if (errorRate > 0.05 || responseTime > 2000 || (memoryUsage && memoryUsage > 0.8)) {
      return 'degraded';
    }
    return 'healthy';
  }

  private startMetricsFlushing(): void {
    setInterval(() => {
      this.flushMetrics();
    }, this.FLUSH_INTERVAL);
  }

  private startPeriodicReporting(): void {
    setInterval(() => {
      this.reportSystemMetrics();
    }, 300000); // 5 minutes
  }

  private flushMetrics(): void {
    // In production, this would send metrics to external services
    const totalMetrics = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0);
    
    logger.info('Metrics flush', {
      totalMetrics,
      metricTypes: this.metrics.size,
      counters: this.counters.size,
      gauges: this.gauges.size,
      activeTimers: this.timers.size
    });
  }

  private reportSystemMetrics(): void {
    const memUsage = process.memoryUsage();
    
    this.gauge('system.memory.heap_used', memUsage.heapUsed, { unit: 'bytes' });
    this.gauge('system.memory.heap_total', memUsage.heapTotal, { unit: 'bytes' });
    this.gauge('system.memory.external', memUsage.external, { unit: 'bytes' });
    
    const cpuUsage = process.cpuUsage();
    this.gauge('system.cpu.user', cpuUsage.user, { unit: 'microseconds' });
    this.gauge('system.cpu.system', cpuUsage.system, { unit: 'microseconds' });
  }

  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const metricsService = new MetricsService();

// Helper functions for common metric scenarios
export function trackPageView(userId: string, page: string, sessionId?: string): void {
  metricsService.trackFeatureUsage(userId, 'navigation', 'page_view');
  metricsService.increment('page_views', 1, { page });
}

export function trackButtonClick(userId: string, button: string, page: string): void {
  metricsService.trackFeatureUsage(userId, 'interaction', 'button_click');
  metricsService.increment('button_clicks', 1, { button, page });
}

export function trackFormSubmission(userId: string, form: string, success: boolean): void {
  metricsService.trackFeatureUsage(userId, 'form', success ? 'submit_success' : 'submit_error');
  metricsService.increment('form_submissions', 1, { form, status: success ? 'success' : 'error' });
}

export function measureApiCall<T>(
  endpoint: string,
  method: string,
  fn: () => Promise<T>
): Promise<T> {
  const timer = metricsService.timer('api_request', endpoint);
  const startTime = Date.now();
  
  return fn()
    .then(result => {
      const duration = Date.now() - startTime;
      metricsService.trackApiRequest(endpoint, method, 200, duration);
      timer.end();
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      const statusCode = error.status || error.statusCode || 500;
      metricsService.trackApiRequest(endpoint, method, statusCode, duration);
      timer.end();
      throw error;
    });
}

export default MetricsService;