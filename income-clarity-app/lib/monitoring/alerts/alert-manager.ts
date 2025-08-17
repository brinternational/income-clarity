/**
 * Alert manager for handling alert aggregation, deduplication, and escalation policies
 * Manages the complete alert lifecycle from trigger to resolution
 */

import { logger } from '@/lib/logging/logger.service';
import { metricsService } from '../metrics.service';
import { 
  AlertRule, 
  AlertSeverity, 
  AlertCondition, 
  AlertNotification, 
  AlertChannel,
  AlertConditionType,
  DefaultAlertRules 
} from './alert-rules';

export enum AlertStatus {
  FIRING = 'firing',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
  ACKNOWLEDGED = 'acknowledged'
}

export interface ActiveAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  description: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: string;
  endsAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  suppressedUntil?: string;
  triggerCount: number;
  lastNotificationSent?: string;
  escalationLevel: number;
  fingerprint: string;
  context?: Record<string, any>;
}

export interface AlertEvent {
  type: 'trigger' | 'resolve' | 'acknowledge' | 'suppress' | 'escalate';
  alertId: string;
  timestamp: string;
  user?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface AlertGroup {
  id: string;
  alerts: ActiveAlert[];
  groupKey: string;
  severity: AlertSeverity;
  status: AlertStatus;
  startsAt: string;
  endsAt?: string;
  lastUpdate: string;
}

export interface NotificationDelivery {
  id: string;
  alertId: string;
  channel: AlertChannel;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
  nextRetry?: string;
}

class AlertManager {
  private activeAlerts: Map<string, ActiveAlert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private alertHistory: AlertEvent[] = [];
  private notificationQueue: NotificationDelivery[] = [];
  private suppressionRules: Map<string, { until: Date; reason: string }> = new Map();
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.loadDefaultRules();
    this.startPeriodicTasks();
  }

  /**
   * Add or update an alert rule
   */
  addRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    logger.info(`Alert rule added: ${rule.name}`, { ruleId: rule.id });
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): boolean {
    const removed = this.alertRules.delete(ruleId);
    if (removed) {
      logger.info(`Alert rule removed: ${ruleId}`);
    }
    return removed;
  }

  /**
   * Get all active alert rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  /**
   * Evaluate metric against all applicable rules
   */
  evaluateMetric(metricName: string, value: number, labels: Record<string, string> = {}): void {
    const applicableRules = this.getApplicableRules(metricName);
    
    for (const rule of applicableRules) {
      if (!rule.enabled) continue;
      
      try {
        this.evaluateRule(rule, metricName, value, labels);
      } catch (error) {
        logger.error(`Failed to evaluate rule ${rule.id}`, error as Error, {
          ruleId: rule.id,
          metricName,
          value
        });
      }
    }
  }

  /**
   * Trigger an alert manually
   */
  triggerAlert(
    ruleId: string,
    message: string,
    labels: Record<string, string> = {},
    context?: Record<string, any>
  ): string {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      throw new Error(`Alert rule not found: ${ruleId}`);
    }

    const alertId = this.generateAlertId(rule, labels);
    const fingerprint = this.generateFingerprint(rule, labels);

    const alert: ActiveAlert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      status: AlertStatus.FIRING,
      message,
      description: rule.description,
      labels,
      annotations: this.generateAnnotations(rule, context),
      startsAt: new Date().toISOString(),
      triggerCount: 1,
      escalationLevel: 0,
      fingerprint,
      context
    };

    this.processAlert(alert);
    return alertId;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, user?: string, reason?: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      logger.warn(`Attempted to resolve non-existent alert: ${alertId}`);
      return;
    }

    alert.status = AlertStatus.RESOLVED;
    alert.endsAt = new Date().toISOString();

    this.recordAlertEvent({
      type: 'resolve',
      alertId,
      timestamp: new Date().toISOString(),
      user,
      reason
    });

    // Cancel any pending escalations
    this.cancelEscalation(alertId);

    // Remove from active alerts
    this.activeAlerts.delete(alertId);

    logger.info(`Alert resolved: ${alert.ruleName}`, {
      alertId,
      resolvedBy: user,
      reason,
      duration: Date.now() - new Date(alert.startsAt).getTime()
    });

    metricsService.increment('alerts.resolved', 1, {
      severity: alert.severity,
      rule: alert.ruleId
    });
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, user: string, reason?: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      logger.warn(`Attempted to acknowledge non-existent alert: ${alertId}`);
      return;
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = user;

    this.recordAlertEvent({
      type: 'acknowledge',
      alertId,
      timestamp: new Date().toISOString(),
      user,
      reason
    });

    // Cancel escalation for acknowledged alerts
    this.cancelEscalation(alertId);

    logger.info(`Alert acknowledged: ${alert.ruleName}`, {
      alertId,
      acknowledgedBy: user,
      reason
    });

    metricsService.increment('alerts.acknowledged', 1, {
      severity: alert.severity,
      rule: alert.ruleId
    });
  }

  /**
   * Suppress alerts for a specific rule or pattern
   */
  suppressAlerts(
    pattern: string,
    duration: number, // minutes
    reason: string,
    user: string
  ): void {
    const until = new Date(Date.now() + duration * 60000);
    this.suppressionRules.set(pattern, { until, reason });

    // Suppress matching active alerts
    for (const alert of this.activeAlerts.values()) {
      if (this.matchesSuppressionPattern(alert, pattern)) {
        alert.status = AlertStatus.SUPPRESSED;
        alert.suppressedUntil = until.toISOString();

        this.recordAlertEvent({
          type: 'suppress',
          alertId: alert.id,
          timestamp: new Date().toISOString(),
          user,
          reason,
          metadata: { duration, pattern }
        });
      }
    }

    logger.info(`Alerts suppressed`, {
      pattern,
      duration,
      reason,
      suppressedBy: user,
      until: until.toISOString()
    });
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): ActiveAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): ActiveAlert | undefined {
    return this.activeAlerts.get(alertId);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): {
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    byRule: Record<string, number>;
    avgResolutionTime: number;
  } {
    const alerts = this.getActiveAlerts();
    const stats = {
      total: alerts.length,
      bySeverity: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byRule: {} as Record<string, number>,
      avgResolutionTime: 0
    };

    // Calculate statistics
    alerts.forEach(alert => {
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1;
      stats.byRule[alert.ruleId] = (stats.byRule[alert.ruleId] || 0) + 1;
    });

    // Calculate average resolution time from resolved alerts in history
    const resolvedEvents = this.alertHistory.filter(e => e.type === 'resolve');
    if (resolvedEvents.length > 0) {
      const totalResolutionTime = resolvedEvents.reduce((sum, event) => {
        const triggerEvent = this.alertHistory.find(e => 
          e.alertId === event.alertId && e.type === 'trigger'
        );
        if (triggerEvent) {
          return sum + (new Date(event.timestamp).getTime() - new Date(triggerEvent.timestamp).getTime());
        }
        return sum;
      }, 0);
      stats.avgResolutionTime = totalResolutionTime / resolvedEvents.length;
    }

    return stats;
  }

  private loadDefaultRules(): void {
    DefaultAlertRules.forEach(group => {
      if (group.enabled) {
        group.rules.forEach(rule => {
          this.addRule(rule);
        });
      }
    });
  }

  private startPeriodicTasks(): void {
    // Check for expired suppressions every minute
    setInterval(() => {
      this.cleanupExpiredSuppressions();
    }, 60000);

    // Process notification queue every 30 seconds
    setInterval(() => {
      this.processNotificationQueue();
    }, 30000);

    // Update alert statistics every 5 minutes
    setInterval(() => {
      this.updateAlertMetrics();
    }, 300000);
  }

  private getApplicableRules(metricName: string): AlertRule[] {
    return Array.from(this.alertRules.values()).filter(rule =>
      rule.conditions.some(condition => condition.metric === metricName)
    );
  }

  private evaluateRule(
    rule: AlertRule,
    metricName: string,
    value: number,
    labels: Record<string, string>
  ): void {
    const condition = rule.conditions.find(c => c.metric === metricName);
    if (!condition) return;

    const shouldTrigger = this.evaluateCondition(condition, value, labels);
    const alertId = this.generateAlertId(rule, labels);
    const existingAlert = this.activeAlerts.get(alertId);

    if (shouldTrigger && !existingAlert) {
      // New alert
      const fingerprint = this.generateFingerprint(rule, labels);
      const alert: ActiveAlert = {
        id: alertId,
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        status: AlertStatus.FIRING,
        message: this.generateAlertMessage(rule, condition, value, labels),
        description: rule.description,
        labels,
        annotations: this.generateAnnotations(rule, { metricValue: value }),
        startsAt: new Date().toISOString(),
        triggerCount: 1,
        escalationLevel: 0,
        fingerprint,
        context: { metricValue: value, condition }
      };

      this.processAlert(alert);
    } else if (!shouldTrigger && existingAlert && existingAlert.status === AlertStatus.FIRING) {
      // Alert should be resolved
      this.resolveAlert(alertId, 'system', 'Metric returned to normal');
    } else if (shouldTrigger && existingAlert) {
      // Update existing alert
      existingAlert.triggerCount++;
      existingAlert.lastNotificationSent = undefined; // Allow re-notification
    }
  }

  private evaluateCondition(
    condition: AlertCondition,
    value: number,
    labels: Record<string, string>
  ): boolean {
    // Apply filters
    if (condition.filters) {
      for (const [key, expectedValue] of Object.entries(condition.filters)) {
        if (labels[key] !== expectedValue) {
          return false;
        }
      }
    }

    // Evaluate condition
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return value === condition.threshold;
      case 'ne': return value !== condition.threshold;
      default: return false;
    }
  }

  private processAlert(alert: ActiveAlert): void {
    // Check if alert is suppressed
    if (this.isAlertSuppressed(alert)) {
      alert.status = AlertStatus.SUPPRESSED;
      return;
    }

    this.activeAlerts.set(alert.id, alert);

    this.recordAlertEvent({
      type: 'trigger',
      alertId: alert.id,
      timestamp: alert.startsAt
    });

    logger.warn(`Alert triggered: ${alert.ruleName}`, {
      alertId: alert.id,
      severity: alert.severity,
      message: alert.message,
      labels: alert.labels
    });

    metricsService.increment('alerts.triggered', 1, {
      severity: alert.severity,
      rule: alert.ruleId
    });

    // Send notifications
    this.sendNotifications(alert);

    // Schedule escalation if configured
    this.scheduleEscalation(alert);
  }

  private sendNotifications(alert: ActiveAlert): void {
    const rule = this.alertRules.get(alert.ruleId);
    if (!rule) return;

    for (const notification of rule.notifications) {
      if (notification.severity.includes(alert.severity)) {
        const delivery: NotificationDelivery = {
          id: this.generateDeliveryId(),
          alertId: alert.id,
          channel: notification.channel,
          status: 'pending',
          retryCount: 0
        };

        this.notificationQueue.push(delivery);
      }
    }

    alert.lastNotificationSent = new Date().toISOString();
  }

  private scheduleEscalation(alert: ActiveAlert): void {
    const rule = this.alertRules.get(alert.ruleId);
    if (!rule) return;

    // Find notifications with escalation config
    const escalatableNotifications = rule.notifications.filter(n => n.escalation);
    
    if (escalatableNotifications.length > 0) {
      const escalationDelay = escalatableNotifications[0].escalation!.delay * 60000;
      
      const timer = setTimeout(() => {
        this.escalateAlert(alert.id);
      }, escalationDelay);

      this.escalationTimers.set(alert.id, timer);
    }
  }

  private escalateAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.status !== AlertStatus.FIRING) return;

    alert.escalationLevel++;

    this.recordAlertEvent({
      type: 'escalate',
      alertId,
      timestamp: new Date().toISOString(),
      metadata: { escalationLevel: alert.escalationLevel }
    });

    logger.error(`Alert escalated: ${alert.ruleName}`, {
      alertId,
      escalationLevel: alert.escalationLevel
    });

    metricsService.increment('alerts.escalated', 1, {
      severity: alert.severity,
      rule: alert.ruleId
    });

    // Send escalation notifications
    this.sendEscalationNotifications(alert);
  }

  private sendEscalationNotifications(alert: ActiveAlert): void {
    const rule = this.alertRules.get(alert.ruleId);
    if (!rule) return;

    for (const notification of rule.notifications) {
      if (notification.escalation && notification.severity.includes(alert.severity)) {
        for (const escalationChannel of notification.escalation.escalateTo) {
          const delivery: NotificationDelivery = {
            id: this.generateDeliveryId(),
            alertId: alert.id,
            channel: escalationChannel,
            status: 'pending',
            retryCount: 0
          };

          this.notificationQueue.push(delivery);
        }
      }
    }
  }

  private processNotificationQueue(): void {
    const pendingNotifications = this.notificationQueue.filter(d => d.status === 'pending');
    
    for (const delivery of pendingNotifications) {
      try {
        this.sendNotification(delivery);
      } catch (error) {
        logger.error('Failed to send notification', error as Error, {
          deliveryId: delivery.id,
          alertId: delivery.alertId,
          channel: delivery.channel
        });
        
        delivery.status = 'failed';
        delivery.error = (error as Error).message;
        delivery.retryCount++;
        
        // Schedule retry if under limit
        if (delivery.retryCount < 3) {
          delivery.status = 'pending';
          delivery.nextRetry = new Date(Date.now() + 60000 * Math.pow(2, delivery.retryCount)).toISOString();
        }
      }
    }
  }

  private sendNotification(delivery: NotificationDelivery): void {
    const alert = this.activeAlerts.get(delivery.alertId);
    if (!alert) return;

    // Mock notification sending - in real implementation, integrate with actual services
    logger.info(`Sending notification via ${delivery.channel}`, {
      alertId: alert.id,
      ruleName: alert.ruleName,
      severity: alert.severity,
      channel: delivery.channel
    });

    delivery.status = 'sent';
    delivery.sentAt = new Date().toISOString();

    // Mock delivery confirmation
    setTimeout(() => {
      delivery.status = 'delivered';
      delivery.deliveredAt = new Date().toISOString();
    }, 1000);

    metricsService.increment('notifications.sent', 1, {
      channel: delivery.channel,
      severity: alert.severity
    });
  }

  private isAlertSuppressed(alert: ActiveAlert): boolean {
    for (const [pattern, suppression] of this.suppressionRules.entries()) {
      if (Date.now() > suppression.until.getTime()) continue;
      if (this.matchesSuppressionPattern(alert, pattern)) {
        return true;
      }
    }
    return false;
  }

  private matchesSuppressionPattern(alert: ActiveAlert, pattern: string): boolean {
    // Simple pattern matching - can be enhanced with regex
    return alert.ruleId.includes(pattern) || 
           alert.ruleName.toLowerCase().includes(pattern.toLowerCase()) ||
           Object.values(alert.labels).some(value => value.includes(pattern));
  }

  private cancelEscalation(alertId: string): void {
    const timer = this.escalationTimers.get(alertId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(alertId);
    }
  }

  private cleanupExpiredSuppressions(): void {
    const now = Date.now();
    for (const [pattern, suppression] of this.suppressionRules.entries()) {
      if (now > suppression.until.getTime()) {
        this.suppressionRules.delete(pattern);
        logger.info(`Suppression rule expired: ${pattern}`);
      }
    }
  }

  private updateAlertMetrics(): void {
    const stats = this.getAlertStatistics();
    
    metricsService.gauge('alerts.active.total', stats.total);
    
    Object.entries(stats.bySeverity).forEach(([severity, count]) => {
      metricsService.gauge('alerts.active.by_severity', count, { severity });
    });
    
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      metricsService.gauge('alerts.active.by_status', count, { status });
    });
  }

  private recordAlertEvent(event: AlertEvent): void {
    this.alertHistory.push(event);
    
    // Keep only last 10000 events
    if (this.alertHistory.length > 10000) {
      this.alertHistory.splice(0, this.alertHistory.length - 10000);
    }
  }

  private generateAlertId(rule: AlertRule, labels: Record<string, string>): string {
    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    
    return `${rule.id}:${Buffer.from(labelString).toString('base64')}`;
  }

  private generateFingerprint(rule: AlertRule, labels: Record<string, string>): string {
    const content = `${rule.id}:${JSON.stringify(labels, Object.keys(labels).sort())}`;
    return Buffer.from(content).toString('base64').substring(0, 16);
  }

  private generateDeliveryId(): string {
    return `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertMessage(
    rule: AlertRule,
    condition: AlertCondition,
    value: number,
    labels: Record<string, string>
  ): string {
    return `${rule.name}: ${condition.metric} is ${value} (threshold: ${condition.threshold})`;
  }

  private generateAnnotations(rule: AlertRule, context?: Record<string, any>): Record<string, string> {
    const annotations: Record<string, string> = {
      summary: rule.description,
      runbook: `https://docs.incomeClarity.com/runbooks/${rule.id}`,
      dashboard: `https://monitoring.incomeClarity.com/dashboard/${rule.id}`
    };

    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        annotations[`context_${key}`] = String(value);
      });
    }

    return annotations;
  }
}

// Singleton instance
export const alertManager = new AlertManager();

export default AlertManager;