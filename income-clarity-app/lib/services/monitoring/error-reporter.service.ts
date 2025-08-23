/**
 * Centralized error reporting service with categorization, deduplication, and severity levels
 * Handles error aggregation, alert triggers, and integration with external monitoring services
 */

import { monitoringService, ErrorCategory, ErrorSeverity } from './monitoring.service';
import { logger } from '@/lib/services/logging/logger.service';
import crypto from 'crypto';

export interface ErrorReport {
  id: string;
  timestamp: string;
  fingerprint: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  title: string;
  message: string;
  stackTrace?: string;
  context: ErrorContext;
  tags: Record<string, string>;
  count: number;
  firstSeen: string;
  lastSeen: string;
  affectedUsers: Set<string>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  userAgent?: string;
  ipAddress?: string;
  component?: string;
  operation?: string;
  version?: string;
  environment?: string;
  metadata?: Record<string, any>;
}

export interface ErrorGroup {
  fingerprint: string;
  title: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  count: number;
  affectedUsers: number;
  firstSeen: string;
  lastSeen: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  reports: ErrorReport[];
}

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    threshold: number;
    timeWindow: number; // minutes
    operation: 'count' | 'rate' | 'unique_users';
  };
  actions: AlertAction[];
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: string;
}

export interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'pagerduty';
  config: Record<string, any>;
}

class ErrorReporterService {
  private errorGroups: Map<string, ErrorGroup> = new Map();
  private alertRules: AlertRule[] = [];
  private alertCooldowns: Map<string, Date> = new Map();
  private errorBuffer: ErrorReport[] = [];
  private readonly BUFFER_SIZE = 1000;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.initializeDefaultAlertRules();
    this.startBufferFlush();
    this.startPeriodicCleanup();
  }

  /**
   * Report an error with automatic categorization and grouping
   */
  reportError(
    error: Error,
    context: ErrorContext = {},
    customCategory?: ErrorCategory,
    customSeverity?: ErrorSeverity
  ): string {
    const category = customCategory || this.categorizeError(error, context);
    const severity = customSeverity || this.determineSeverity(error, category, context);
    const fingerprint = this.generateFingerprint(error, category, context);

    const errorReport: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      fingerprint,
      category,
      severity,
      title: this.generateTitle(error, context),
      message: error.message,
      stackTrace: error.stack,
      context: this.sanitizeContext(context),
      tags: this.generateTags(error, category, context),
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      affectedUsers: new Set(context.userId ? [context.userId] : []),
      resolved: false
    };

    // Add to buffer for batch processing
    this.addToBuffer(errorReport);

    // Group similar errors
    this.groupError(errorReport);

    // Track in monitoring service
    monitoringService.trackError(error, category, severity, context, context.userId);

    // Check alert rules
    this.checkAlertRules(errorReport);

    // Log for debugging
    logger.error('Error reported', error, {
      errorReportId: errorReport.id,
      fingerprint: errorReport.fingerprint,
      category,
      severity: ErrorSeverity[severity]
    });

    return errorReport.id;
  }

  /**
   * Report a custom error with full control
   */
  reportCustomError(
    title: string,
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context: ErrorContext = {},
    stackTrace?: string
  ): string {
    const fingerprint = this.generateCustomFingerprint(title, category, context);

    const errorReport: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      fingerprint,
      category,
      severity,
      title,
      message,
      stackTrace,
      context: this.sanitizeContext(context),
      tags: this.generateCustomTags(category, context),
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      affectedUsers: new Set(context.userId ? [context.userId] : []),
      resolved: false
    };

    this.addToBuffer(errorReport);
    this.groupError(errorReport);
    this.checkAlertRules(errorReport);

    return errorReport.id;
  }

  /**
   * Get error groups with filtering and pagination
   */
  getErrorGroups(
    filters: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      resolved?: boolean;
      timeRange?: { start: string; end: string };
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 50 }
  ): {
    groups: ErrorGroup[];
    total: number;
    page: number;
    totalPages: number;
  } {
    let groups = Array.from(this.errorGroups.values());

    // Apply filters
    if (filters.category) {
      groups = groups.filter(g => g.category === filters.category);
    }
    if (filters.severity !== undefined) {
      groups = groups.filter(g => g.severity === filters.severity);
    }
    if (filters.resolved !== undefined) {
      groups = groups.filter(g => g.reports.some(r => r.resolved === filters.resolved));
    }
    if (filters.timeRange) {
      const start = new Date(filters.timeRange.start);
      const end = new Date(filters.timeRange.end);
      groups = groups.filter(g => {
        const lastSeen = new Date(g.lastSeen);
        return lastSeen >= start && lastSeen <= end;
      });
    }

    // Sort by last seen (most recent first)
    groups.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

    // Paginate
    const total = groups.length;
    const totalPages = Math.ceil(total / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const paginatedGroups = groups.slice(start, start + pagination.limit);

    return {
      groups: paginatedGroups,
      total,
      page: pagination.page,
      totalPages
    };
  }

  /**
   * Get detailed error group information
   */
  getErrorGroup(fingerprint: string): ErrorGroup | null {
    return this.errorGroups.get(fingerprint) || null;
  }

  /**
   * Mark error group as resolved
   */
  resolveErrorGroup(fingerprint: string, resolvedBy: string): boolean {
    const group = this.errorGroups.get(fingerprint);
    if (!group) return false;

    const resolvedAt = new Date().toISOString();
    group.reports.forEach(report => {
      report.resolved = true;
      report.resolvedAt = resolvedAt;
      report.resolvedBy = resolvedBy;
    });

    logger.info('Error group resolved', {
      fingerprint,
      resolvedBy,
      resolvedAt,
      errorCount: group.count
    });

    return true;
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(timeRange: { start: string; end: string }): {
    totalErrors: number;
    uniqueErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    topErrors: Array<{ fingerprint: string; title: string; count: number }>;
    affectedUsers: number;
    resolutionRate: number;
  } {
    const start = new Date(timeRange.start);
    const end = new Date(timeRange.end);

    const relevantGroups = Array.from(this.errorGroups.values()).filter(group => {
      const lastSeen = new Date(group.lastSeen);
      return lastSeen >= start && lastSeen <= end;
    });

    const categoryStats: Record<string, number> = {};
    const severityStats: Record<string, number> = {};
    const allAffectedUsers = new Set<string>();
    let totalErrors = 0;
    let resolvedErrors = 0;

    relevantGroups.forEach(group => {
      totalErrors += group.count;
      categoryStats[group.category] = (categoryStats[group.category] || 0) + group.count;
      severityStats[ErrorSeverity[group.severity]] = (severityStats[ErrorSeverity[group.severity]] || 0) + group.count;
      
      // Count unique affected users
      group.reports.forEach(report => {
        report.affectedUsers.forEach(userId => allAffectedUsers.add(userId));
        if (report.resolved) resolvedErrors++;
      });
    });

    const topErrors = relevantGroups
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(group => ({
        fingerprint: group.fingerprint,
        title: group.title,
        count: group.count
      }));

    return {
      totalErrors,
      uniqueErrors: relevantGroups.length,
      errorsByCategory: categoryStats,
      errorsBySeverity: severityStats,
      topErrors,
      affectedUsers: allAffectedUsers.size,
      resolutionRate: totalErrors > 0 ? resolvedErrors / totalErrors : 0
    };
  }

  /**
   * Configure alert rules
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const alertRule: AlertRule = {
      id: this.generateId(),
      ...rule
    };

    this.alertRules.push(alertRule);

    logger.info('Alert rule added', {
      ruleId: alertRule.id,
      ruleName: alertRule.name,
      condition: alertRule.condition
    });

    return alertRule.id;
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return false;

    this.alertRules.splice(index, 1);
    logger.info('Alert rule removed', { ruleId });
    return true;
  }

  /**
   * Get all alert rules
   */
  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  private categorizeError(error: Error, context: ErrorContext): ErrorCategory {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    const component = context.component?.toLowerCase() || '';
    const url = context.url?.toLowerCase() || '';

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('token') || 
        message.includes('authentication') || component.includes('auth')) {
      return ErrorCategory.AUTHENTICATION;
    }

    // Payment errors
    if (message.includes('payment') || message.includes('stripe') || 
        message.includes('charge') || url.includes('payment')) {
      return ErrorCategory.PAYMENT;
    }

    // Sync errors
    if (message.includes('sync') || message.includes('yodlee') || 
        component.includes('sync') || message.includes('refresh')) {
      return ErrorCategory.SYNC;
    }

    // Database errors
    if (message.includes('database') || stack.includes('prisma') || 
        stack.includes('sqlite') || message.includes('query')) {
      return ErrorCategory.DATABASE;
    }

    // External API errors
    if (message.includes('fetch') || message.includes('request') || 
        message.includes('api') || message.includes('network')) {
      return ErrorCategory.EXTERNAL_API;
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || 
        message.includes('required') || error.name === 'ValidationError') {
      return ErrorCategory.VALIDATION;
    }

    // Permission errors
    if (message.includes('permission') || message.includes('forbidden') || 
        message.includes('access denied')) {
      return ErrorCategory.PERMISSION;
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ErrorCategory.RATE_LIMIT;
    }

    return ErrorCategory.UNKNOWN;
  }

  private determineSeverity(error: Error, category: ErrorCategory, context: ErrorContext): ErrorSeverity {
    // Critical severity conditions
    if (category === ErrorCategory.PAYMENT) return ErrorSeverity.CRITICAL;
    if (error.message.includes('crash') || error.message.includes('fatal')) return ErrorSeverity.CRITICAL;
    if (context.affectedUsers && (context.metadata?.affectedUsers as number) > 100) return ErrorSeverity.CRITICAL;

    // High severity conditions
    if (category === ErrorCategory.AUTHENTICATION || category === ErrorCategory.DATABASE) return ErrorSeverity.HIGH;
    if (error.name === 'TypeError' || error.name === 'ReferenceError') return ErrorSeverity.HIGH;

    // Medium severity conditions
    if (category === ErrorCategory.SYNC || category === ErrorCategory.EXTERNAL_API) return ErrorSeverity.MEDIUM;

    // Default to low severity
    return ErrorSeverity.LOW;
  }

  private generateFingerprint(error: Error, category: ErrorCategory, context: ErrorContext): string {
    const components = [
      category,
      error.name,
      error.message.replace(/\d+/g, 'N').replace(/[a-f0-9]{8,}/g, 'ID'), // Normalize IDs and numbers
      context.component || 'unknown',
      error.stack?.split('\n')[1]?.replace(/:\d+:\d+/g, '') || '' // First stack frame without line numbers
    ];

    const content = components.join('|');
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 16);
  }

  private generateCustomFingerprint(title: string, category: ErrorCategory, context: ErrorContext): string {
    const components = [
      category,
      title.replace(/\d+/g, 'N').replace(/[a-f0-9]{8,}/g, 'ID'),
      context.component || 'unknown'
    ];

    const content = components.join('|');
    return crypto.createHash('md5').update(content).digest('hex').substring(0, 16);
  }

  private generateTitle(error: Error, context: ErrorContext): string {
    if (context.component) {
      return `${context.component}: ${error.name} - ${error.message.substring(0, 100)}`;
    }
    return `${error.name}: ${error.message.substring(0, 100)}`;
  }

  private generateTags(error: Error, category: ErrorCategory, context: ErrorContext): Record<string, string> {
    return {
      category,
      errorType: error.name,
      environment: context.environment || process.env.NODE_ENV || 'unknown',
      version: context.version || process.env.APP_VERSION || '1.0.0',
      component: context.component || 'unknown',
      ...(context.url && { url: new URL(context.url).pathname }),
      ...(context.userAgent && { browser: this.parseBrowser(context.userAgent) })
    };
  }

  private generateCustomTags(category: ErrorCategory, context: ErrorContext): Record<string, string> {
    return {
      category,
      environment: context.environment || process.env.NODE_ENV || 'unknown',
      version: context.version || process.env.APP_VERSION || '1.0.0',
      component: context.component || 'unknown'
    };
  }

  private sanitizeContext(context: ErrorContext): ErrorContext {
    const sanitized = { ...context };
    
    // Remove sensitive information
    delete sanitized.metadata?.password;
    delete sanitized.metadata?.token;
    delete sanitized.metadata?.secret;
    delete sanitized.metadata?.key;

    return sanitized;
  }

  private parseBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'unknown';
  }

  private addToBuffer(errorReport: ErrorReport): void {
    this.errorBuffer.push(errorReport);
    
    // Flush if buffer is full
    if (this.errorBuffer.length >= this.BUFFER_SIZE) {
      this.flushBuffer();
    }
  }

  private groupError(errorReport: ErrorReport): void {
    const existingGroup = this.errorGroups.get(errorReport.fingerprint);

    if (existingGroup) {
      // Update existing group
      existingGroup.count += 1;
      existingGroup.lastSeen = errorReport.timestamp;
      existingGroup.reports.push(errorReport);
      
      // Add affected user
      if (errorReport.context.userId) {
        existingGroup.affectedUsers++;
      }

      // Update trend (simplified)
      const recentReports = existingGroup.reports.slice(-10);
      const oldReports = existingGroup.reports.slice(-20, -10);
      existingGroup.trend = recentReports.length > oldReports.length ? 'increasing' : 
                           recentReports.length < oldReports.length ? 'decreasing' : 'stable';
    } else {
      // Create new group
      const newGroup: ErrorGroup = {
        fingerprint: errorReport.fingerprint,
        title: errorReport.title,
        category: errorReport.category,
        severity: errorReport.severity,
        count: 1,
        affectedUsers: errorReport.context.userId ? 1 : 0,
        firstSeen: errorReport.timestamp,
        lastSeen: errorReport.timestamp,
        trend: 'stable',
        reports: [errorReport]
      };

      this.errorGroups.set(errorReport.fingerprint, newGroup);
    }
  }

  private checkAlertRules(errorReport: ErrorReport): void {
    this.alertRules.forEach(rule => {
      if (!rule.enabled) return;

      // Check cooldown
      const lastTriggered = this.alertCooldowns.get(rule.id);
      if (lastTriggered && Date.now() - lastTriggered.getTime() < rule.cooldownMinutes * 60000) {
        return;
      }

      // Check conditions
      if (this.evaluateAlertCondition(rule, errorReport)) {
        this.triggerAlert(rule, errorReport);
        this.alertCooldowns.set(rule.id, new Date());
      }
    });
  }

  private evaluateAlertCondition(rule: AlertRule, errorReport: ErrorReport): boolean {
    const { condition } = rule;

    // Check category filter
    if (condition.category && errorReport.category !== condition.category) {
      return false;
    }

    // Check severity filter
    if (condition.severity !== undefined && errorReport.severity !== condition.severity) {
      return false;
    }

    // For this implementation, we'll use simplified threshold checking
    // In production, this would query historical data based on timeWindow
    const group = this.errorGroups.get(errorReport.fingerprint);
    if (!group) return false;

    switch (condition.operation) {
      case 'count':
        return group.count >= condition.threshold;
      case 'rate':
        // Simplified rate calculation
        return group.count >= condition.threshold;
      case 'unique_users':
        return group.affectedUsers >= condition.threshold;
      default:
        return false;
    }
  }

  private triggerAlert(rule: AlertRule, errorReport: ErrorReport): void {
    logger.error(`ALERT TRIGGERED: ${rule.name}`, new Error(errorReport.message), {
      alert: true,
      ruleId: rule.id,
      ruleName: rule.name,
      errorReportId: errorReport.id,
      fingerprint: errorReport.fingerprint
    });

    // Execute alert actions
    rule.actions.forEach(action => {
      this.executeAlertAction(action, rule, errorReport);
    });

    // Update last triggered time
    rule.lastTriggered = new Date().toISOString();
  }

  private executeAlertAction(action: AlertAction, rule: AlertRule, errorReport: ErrorReport): void {
    try {
      switch (action.type) {
        case 'email':
          this.sendEmailAlert(action.config, rule, errorReport);
          break;
        case 'slack':
          this.sendSlackAlert(action.config, rule, errorReport);
          break;
        case 'webhook':
          this.sendWebhookAlert(action.config, rule, errorReport);
          break;
        case 'pagerduty':
          this.sendPagerDutyAlert(action.config, rule, errorReport);
          break;
      }
    } catch (error) {
      logger.error('Failed to execute alert action', error as Error, {
        actionType: action.type,
        ruleId: rule.id
      });
    }
  }

  private sendEmailAlert(config: any, rule: AlertRule, errorReport: ErrorReport): void {
    // Email alert implementation
    console.log('Would send email alert:', { config, rule: rule.name, error: errorReport.title });
  }

  private sendSlackAlert(config: any, rule: AlertRule, errorReport: ErrorReport): void {
    // Slack alert implementation
    console.log('Would send Slack alert:', { config, rule: rule.name, error: errorReport.title });
  }

  private sendWebhookAlert(config: any, rule: AlertRule, errorReport: ErrorReport): void {
    // Webhook alert implementation
    console.log('Would send webhook alert:', { config, rule: rule.name, error: errorReport.title });
  }

  private sendPagerDutyAlert(config: any, rule: AlertRule, errorReport: ErrorReport): void {
    // PagerDuty alert implementation
    console.log('Would send PagerDuty alert:', { config, rule: rule.name, error: errorReport.title });
  }

  private flushBuffer(): void {
    if (this.errorBuffer.length === 0) return;

    logger.info('Flushing error buffer', {
      bufferSize: this.errorBuffer.length,
      timestamp: new Date().toISOString()
    });

    // In production, this would batch insert to database
    this.errorBuffer = [];
  }

  private startBufferFlush(): void {
    setInterval(() => {
      this.flushBuffer();
    }, this.FLUSH_INTERVAL);
  }

  private startPeriodicCleanup(): void {
    // Clean up old error data every hour
    setInterval(() => {
      this.cleanupOldErrors();
    }, 3600000);
  }

  private cleanupOldErrors(): void {
    const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    this.errorGroups.forEach((group, fingerprint) => {
      const lastSeen = new Date(group.lastSeen);
      if (lastSeen < cutoffTime) {
        this.errorGroups.delete(fingerprint);
      }
    });
  }

  private initializeDefaultAlertRules(): void {
    // Critical payment errors
    this.addAlertRule({
      name: 'Critical Payment Errors',
      condition: {
        category: ErrorCategory.PAYMENT,
        severity: ErrorSeverity.CRITICAL,
        threshold: 1,
        timeWindow: 5,
        operation: 'count'
      },
      actions: [
        { type: 'pagerduty', config: { severity: 'critical' } },
        { type: 'slack', config: { channel: '#alerts' } }
      ],
      enabled: true,
      cooldownMinutes: 30
    });

    // High error rate
    this.addAlertRule({
      name: 'High Error Rate',
      condition: {
        threshold: 50,
        timeWindow: 15,
        operation: 'count'
      },
      actions: [
        { type: 'slack', config: { channel: '#alerts' } },
        { type: 'email', config: { recipients: ['dev-team@example.com'] } }
      ],
      enabled: true,
      cooldownMinutes: 60
    });
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const errorReporter = new ErrorReporterService();

// Helper functions for common error reporting scenarios
export function reportUnhandledError(error: Error, context: ErrorContext = {}): string {
  return errorReporter.reportError(error, {
    ...context,
    component: context.component || 'UnhandledError'
  });
}

export function reportApiError(error: Error, endpoint: string, userId?: string): string {
  return errorReporter.reportError(error, {
    component: 'API',
    operation: endpoint,
    userId
  }, ErrorCategory.EXTERNAL_API);
}

export function reportDatabaseError(error: Error, query: string, userId?: string): string {
  return errorReporter.reportError(error, {
    component: 'Database',
    operation: query.substring(0, 100),
    userId
  }, ErrorCategory.DATABASE, ErrorSeverity.HIGH);
}

export function reportPaymentError(error: Error, amount: number, userId?: string): string {
  return errorReporter.reportError(error, {
    component: 'Payment',
    userId,
    metadata: { amount }
  }, ErrorCategory.PAYMENT, ErrorSeverity.CRITICAL);
}

export function reportValidationError(fieldName: string, message: string, context: ErrorContext = {}): string {
  return errorReporter.reportCustomError(
    `Validation Error: ${fieldName}`,
    message,
    ErrorCategory.VALIDATION,
    ErrorSeverity.LOW,
    {
      ...context,
      component: 'Validation',
      metadata: { field: fieldName }
    }
  );
}

export default ErrorReporterService;