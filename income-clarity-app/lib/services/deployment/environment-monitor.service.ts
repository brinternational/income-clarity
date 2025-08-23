/**
 * Real-time Environment Monitor Service
 * 
 * Continuously monitors environment status, changes, and health
 * providing real-time alerts and status tracking.
 */

import { logger } from '../logging/logger.service';
import { metricsService } from '../monitoring/metrics.service';
import { environmentDetectionService, EnvironmentFingerprint, EnvironmentComparison } from './environment-detection.service';
import { deploymentVerificationService, DeploymentVerificationResult } from './deployment-verification.service';
import { EventEmitter } from 'events';

export interface EnvironmentMonitorConfig {
  checkInterval: number; // milliseconds
  alertThresholds: AlertThresholds;
  enableAlerts: boolean;
  enableMetrics: boolean;
  retainHistoryHours: number;
}

export interface AlertThresholds {
  responseTimeWarning: number; // milliseconds
  responseTimeCritical: number; // milliseconds
  environmentDriftWarning: number; // number of differences
  environmentDriftCritical: number; // number of differences
  successRateWarning: number; // percentage
  successRateCritical: number; // percentage
}

export interface EnvironmentAlert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'connectivity' | 'performance' | 'drift' | 'deployment' | 'health';
  environment: string;
  message: string;
  details: any;
  resolved: boolean;
  resolvedAt?: string;
}

export interface EnvironmentStatus {
  environment: EnvironmentFingerprint;
  lastCheck: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  uptime: number;
  alerts: EnvironmentAlert[];
  metrics: EnvironmentMetrics;
  trends: EnvironmentTrends;
}

export interface EnvironmentMetrics {
  checksPerformed: number;
  averageResponseTime: number;
  successRate: number;
  uptimePercentage: number;
  alertCount: {
    info: number;
    warning: number;
    error: number;
    critical: number;
  };
}

export interface EnvironmentTrends {
  responseTimeTrend: 'improving' | 'stable' | 'degrading';
  successRateTrend: 'improving' | 'stable' | 'degrading';
  uptimeTrend: 'improving' | 'stable' | 'degrading';
  alertTrend: 'improving' | 'stable' | 'degrading';
}

export interface MonitoringSession {
  id: string;
  startTime: string;
  endTime?: string;
  environments: string[];
  checksPerformed: number;
  alertsGenerated: number;
  status: 'active' | 'stopped' | 'error';
}

class EnvironmentMonitorService extends EventEmitter {
  private static instance: EnvironmentMonitorService;
  private config: EnvironmentMonitorConfig;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private environmentStatuses: Map<string, EnvironmentStatus> = new Map();
  private alerts: EnvironmentAlert[] = [];
  private currentSession: MonitoringSession | null = null;
  private isMonitoring: boolean = false;

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): EnvironmentMonitorService {
    if (!EnvironmentMonitorService.instance) {
      EnvironmentMonitorService.instance = new EnvironmentMonitorService();
    }
    return EnvironmentMonitorService.instance;
  }

  /**
   * Get default monitoring configuration
   */
  private getDefaultConfig(): EnvironmentMonitorConfig {
    return {
      checkInterval: 60000, // 1 minute
      alertThresholds: {
        responseTimeWarning: 2000,
        responseTimeCritical: 5000,
        environmentDriftWarning: 3,
        environmentDriftCritical: 5,
        successRateWarning: 90,
        successRateCritical: 75
      },
      enableAlerts: true,
      enableMetrics: true,
      retainHistoryHours: 24
    };
  }

  /**
   * Start monitoring environments
   */
  public async startMonitoring(environments: string[] = ['local', 'production']): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('Environment monitoring already active');
      return;
    }

    try {
      this.currentSession = {
        id: this.generateSessionId(),
        startTime: new Date().toISOString(),
        environments,
        checksPerformed: 0,
        alertsGenerated: 0,
        status: 'active'
      };

      this.isMonitoring = true;
      
      // Start monitoring each environment
      for (const env of environments) {
        await this.startEnvironmentMonitoring(env);
      }

      // Start cleanup task
      this.startCleanupTask();

      logger.info('Environment monitoring started', {
        sessionId: this.currentSession.id,
        environments,
        checkInterval: this.config.checkInterval
      });

      this.emit('monitoring:started', this.currentSession);

    } catch (error) {
      this.isMonitoring = false;
      if (this.currentSession) {
        this.currentSession.status = 'error';
      }
      
      logger.error('Failed to start environment monitoring', error as Error);
      this.emit('monitoring:error', error);
      throw error;
    }
  }

  /**
   * Stop monitoring environments
   */
  public async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      logger.warn('Environment monitoring not active');
      return;
    }

    try {
      // Clear all monitoring intervals
      for (const [env, interval] of this.monitoringIntervals.entries()) {
        clearInterval(interval);
        logger.debug(`Stopped monitoring for environment: ${env}`);
      }

      this.monitoringIntervals.clear();
      this.isMonitoring = false;

      if (this.currentSession) {
        this.currentSession.endTime = new Date().toISOString();
        this.currentSession.status = 'stopped';
      }

      logger.info('Environment monitoring stopped', {
        sessionId: this.currentSession?.id,
        duration: this.currentSession ? 
          Date.now() - new Date(this.currentSession.startTime).getTime() : 0
      });

      this.emit('monitoring:stopped', this.currentSession);

    } catch (error) {
      logger.error('Error stopping environment monitoring', error as Error);
      this.emit('monitoring:error', error);
      throw error;
    }
  }

  /**
   * Start monitoring specific environment
   */
  private async startEnvironmentMonitoring(environmentName: string): Promise<void> {
    // Perform initial check
    await this.checkEnvironment(environmentName);

    // Set up recurring checks
    const interval = setInterval(async () => {
      try {
        await this.checkEnvironment(environmentName);
      } catch (error) {
        logger.error(`Environment check failed for ${environmentName}`, error as Error);
        this.generateAlert({
          severity: 'error',
          category: 'health',
          environment: environmentName,
          message: `Environment monitoring check failed: ${(error as Error).message}`,
          details: { error: (error as Error).message }
        });
      }
    }, this.config.checkInterval);

    this.monitoringIntervals.set(environmentName, interval);
    
    logger.debug(`Started monitoring for environment: ${environmentName}`);
  }

  /**
   * Check specific environment
   */
  private async checkEnvironment(environmentName: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Get environment fingerprint and perform verification
      let verificationResult: DeploymentVerificationResult;
      
      if (environmentName === 'local') {
        // For local environment, just get fingerprint
        const env = await environmentDetectionService.getCurrentEnvironment();
        const responseTime = Date.now() - startTime;
        
        verificationResult = {
          deploymentId: `local-check-${Date.now()}`,
          timestamp: new Date().toISOString(),
          sourceEnvironment: env,
          targetEnvironment: env,
          verificationChecks: [{
            name: 'Local Environment Check',
            category: 'health',
            status: 'passed',
            duration: responseTime,
            details: { local: true }
          }],
          overallStatus: 'success',
          successRate: 100,
          duration: responseTime,
          recommendations: []
        };
      } else {
        // For other environments, perform full verification
        verificationResult = await deploymentVerificationService.verifyDeployment(environmentName);
      }

      // Update environment status
      await this.updateEnvironmentStatus(environmentName, verificationResult);

      // Check for alerts
      await this.checkForAlerts(environmentName, verificationResult);

      // Update session metrics
      if (this.currentSession) {
        this.currentSession.checksPerformed++;
      }

      // Record metrics if enabled
      if (this.config.enableMetrics) {
        this.recordMetrics(environmentName, verificationResult);
      }

    } catch (error) {
      logger.error(`Environment check failed for ${environmentName}`, error as Error);
      
      // Create error status
      const errorStatus: EnvironmentStatus = {
        environment: {
          id: `error-${environmentName}`,
          name: `${environmentName} (Error)`,
          type: 'local',
          hostname: 'unknown',
          timestamp: new Date().toISOString(),
          version: 'unknown',
          deploymentTarget: 'unknown',
          isLive: false,
          configuration: {} as any,
          security: {} as any,
          capabilities: []
        },
        lastCheck: new Date().toISOString(),
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        uptime: 0,
        alerts: [],
        metrics: this.getDefaultMetrics(),
        trends: this.getDefaultTrends()
      };

      this.environmentStatuses.set(environmentName, errorStatus);
      
      this.generateAlert({
        severity: 'critical',
        category: 'health',
        environment: environmentName,
        message: `Environment check failed: ${(error as Error).message}`,
        details: { error: (error as Error).message, duration: Date.now() - startTime }
      });
    }
  }

  /**
   * Update environment status from verification result
   */
  private async updateEnvironmentStatus(
    environmentName: string,
    verificationResult: DeploymentVerificationResult
  ): Promise<void> {
    const existing = this.environmentStatuses.get(environmentName);
    
    // Calculate status based on verification result
    const status = this.determineEnvironmentStatus(verificationResult);
    
    // Calculate metrics
    const metrics = this.calculateMetrics(environmentName, verificationResult, existing);
    
    // Calculate trends
    const trends = this.calculateTrends(environmentName, metrics, existing);

    const environmentStatus: EnvironmentStatus = {
      environment: verificationResult.targetEnvironment,
      lastCheck: verificationResult.timestamp,
      status,
      responseTime: verificationResult.duration,
      uptime: this.calculateUptime(environmentName, status),
      alerts: this.getActiveAlertsForEnvironment(environmentName),
      metrics,
      trends
    };

    this.environmentStatuses.set(environmentName, environmentStatus);

    // Emit status update event
    this.emit('environment:status:updated', {
      environment: environmentName,
      status: environmentStatus,
      previousStatus: existing
    });
  }

  /**
   * Determine environment status from verification result
   */
  private determineEnvironmentStatus(
    verificationResult: DeploymentVerificationResult
  ): EnvironmentStatus['status'] {
    switch (verificationResult.overallStatus) {
      case 'success':
        return verificationResult.successRate >= 95 ? 'healthy' : 'degraded';
      case 'partial':
        return 'degraded';
      case 'failed':
        return 'unhealthy';
      default:
        return 'unknown';
    }
  }

  /**
   * Calculate environment metrics
   */
  private calculateMetrics(
    environmentName: string,
    verificationResult: DeploymentVerificationResult,
    existing?: EnvironmentStatus
  ): EnvironmentMetrics {
    const existingMetrics = existing?.metrics || this.getDefaultMetrics();

    // Calculate rolling averages and totals
    const checksPerformed = existingMetrics.checksPerformed + 1;
    const averageResponseTime = Math.round(
      (existingMetrics.averageResponseTime * (checksPerformed - 1) + verificationResult.duration) / checksPerformed
    );

    // Update success rate (weighted average)
    const successRate = Math.round(
      (existingMetrics.successRate * (checksPerformed - 1) + verificationResult.successRate) / checksPerformed
    );

    // Calculate uptime percentage
    const currentStatus = this.determineEnvironmentStatus(verificationResult);
    const wasHealthy = existing?.status === 'healthy';
    const isHealthy = currentStatus === 'healthy';
    const uptimePercentage = this.calculateUptimePercentage(
      existingMetrics.uptimePercentage,
      checksPerformed,
      wasHealthy,
      isHealthy
    );

    return {
      checksPerformed,
      averageResponseTime,
      successRate,
      uptimePercentage,
      alertCount: this.getAlertCountsForEnvironment(environmentName)
    };
  }

  /**
   * Calculate uptime percentage
   */
  private calculateUptimePercentage(
    currentUptime: number,
    totalChecks: number,
    wasHealthy: boolean,
    isHealthy: boolean
  ): number {
    if (totalChecks === 1) {
      return isHealthy ? 100 : 0;
    }

    const previousHealthyChecks = Math.round((currentUptime / 100) * (totalChecks - 1));
    const newHealthyChecks = isHealthy ? previousHealthyChecks + 1 : previousHealthyChecks;
    
    return Math.round((newHealthyChecks / totalChecks) * 100);
  }

  /**
   * Calculate environment trends
   */
  private calculateTrends(
    environmentName: string,
    metrics: EnvironmentMetrics,
    existing?: EnvironmentStatus
  ): EnvironmentTrends {
    if (!existing || metrics.checksPerformed < 3) {
      return this.getDefaultTrends();
    }

    const prevMetrics = existing.metrics;

    return {
      responseTimeTrend: this.calculateTrend(metrics.averageResponseTime, prevMetrics.averageResponseTime),
      successRateTrend: this.calculateTrend(metrics.successRate, prevMetrics.successRate),
      uptimeTrend: this.calculateTrend(metrics.uptimePercentage, prevMetrics.uptimePercentage),
      alertTrend: this.calculateTrend(
        this.getTotalAlertCount(metrics.alertCount),
        this.getTotalAlertCount(prevMetrics.alertCount),
        true // Inverse for alerts (fewer is better)
      )
    };
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(
    current: number, 
    previous: number, 
    inverse: boolean = false
  ): 'improving' | 'stable' | 'degrading' {
    const threshold = 0.05; // 5% change threshold
    const change = (current - previous) / previous;
    
    if (Math.abs(change) < threshold) {
      return 'stable';
    }
    
    const improving = inverse ? change < 0 : change > 0;
    return improving ? 'improving' : 'degrading';
  }

  /**
   * Get total alert count
   */
  private getTotalAlertCount(alertCount: EnvironmentMetrics['alertCount']): number {
    return alertCount.info + alertCount.warning + alertCount.error + alertCount.critical;
  }

  /**
   * Calculate uptime for environment
   */
  private calculateUptime(environmentName: string, currentStatus: string): number {
    const existing = this.environmentStatuses.get(environmentName);
    if (!existing) return currentStatus === 'healthy' ? 100 : 0;
    
    return existing.metrics.uptimePercentage;
  }

  /**
   * Check for alerts based on verification result
   */
  private async checkForAlerts(
    environmentName: string,
    verificationResult: DeploymentVerificationResult
  ): Promise<void> {
    if (!this.config.enableAlerts) return;

    // Check response time alerts
    if (verificationResult.duration > this.config.alertThresholds.responseTimeCritical) {
      this.generateAlert({
        severity: 'critical',
        category: 'performance',
        environment: environmentName,
        message: `Critical response time: ${verificationResult.duration}ms`,
        details: { 
          responseTime: verificationResult.duration,
          threshold: this.config.alertThresholds.responseTimeCritical 
        }
      });
    } else if (verificationResult.duration > this.config.alertThresholds.responseTimeWarning) {
      this.generateAlert({
        severity: 'warning',
        category: 'performance',
        environment: environmentName,
        message: `High response time: ${verificationResult.duration}ms`,
        details: { 
          responseTime: verificationResult.duration,
          threshold: this.config.alertThresholds.responseTimeWarning 
        }
      });
    }

    // Check success rate alerts
    if (verificationResult.successRate < this.config.alertThresholds.successRateCritical) {
      this.generateAlert({
        severity: 'critical',
        category: 'deployment',
        environment: environmentName,
        message: `Critical deployment success rate: ${verificationResult.successRate}%`,
        details: { 
          successRate: verificationResult.successRate,
          threshold: this.config.alertThresholds.successRateCritical 
        }
      });
    } else if (verificationResult.successRate < this.config.alertThresholds.successRateWarning) {
      this.generateAlert({
        severity: 'warning',
        category: 'deployment',
        environment: environmentName,
        message: `Low deployment success rate: ${verificationResult.successRate}%`,
        details: { 
          successRate: verificationResult.successRate,
          threshold: this.config.alertThresholds.successRateWarning 
        }
      });
    }

    // Check for failed critical checks
    const criticalFailures = verificationResult.verificationChecks.filter(check => 
      check.status === 'failed' && 
      (check.category === 'connectivity' || check.category === 'health')
    );

    if (criticalFailures.length > 0) {
      this.generateAlert({
        severity: 'critical',
        category: 'health',
        environment: environmentName,
        message: `Critical system checks failed: ${criticalFailures.map(c => c.name).join(', ')}`,
        details: { failedChecks: criticalFailures.map(c => ({ name: c.name, error: c.error })) }
      });
    }
  }

  /**
   * Generate and store alert
   */
  private generateAlert(alertData: Omit<EnvironmentAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: EnvironmentAlert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.unshift(alert);

    // Update session alert count
    if (this.currentSession) {
      this.currentSession.alertsGenerated++;
    }

    logger.warn(`Environment alert generated`, {
      alertId: alert.id,
      environment: alert.environment,
      severity: alert.severity,
      category: alert.category,
      message: alert.message
    });

    // Emit alert event
    this.emit('environment:alert', alert);

    // Clean up old alerts
    this.cleanupOldAlerts();
  }

  /**
   * Record metrics
   */
  private recordMetrics(
    environmentName: string,
    verificationResult: DeploymentVerificationResult
  ): void {
    const metricPrefix = `environment.${environmentName}`;

    metricsService.gauge(`${metricPrefix}.response_time`, verificationResult.duration);
    metricsService.gauge(`${metricPrefix}.success_rate`, verificationResult.successRate);
    metricsService.increment(`${metricPrefix}.checks_performed`);

    if (verificationResult.overallStatus === 'success') {
      metricsService.increment(`${metricPrefix}.successful_checks`);
    } else {
      metricsService.increment(`${metricPrefix}.failed_checks`);
    }
  }

  /**
   * Start cleanup task
   */
  private startCleanupTask(): void {
    // Clean up old alerts and history every hour
    setInterval(() => {
      this.cleanupOldAlerts();
      this.cleanupOldHistory();
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Clean up old alerts
   */
  private cleanupOldAlerts(): void {
    const cutoffTime = Date.now() - (this.config.retainHistoryHours * 60 * 60 * 1000);
    const initialLength = this.alerts.length;

    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > cutoffTime || !alert.resolved
    );

    const cleaned = initialLength - this.alerts.length;
    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} old alerts`);
    }
  }

  /**
   * Clean up old history
   */
  private cleanupOldHistory(): void {
    // For now, we keep all environment statuses as they're relatively small
    // In a production environment, you might want to archive old data
    logger.debug('History cleanup completed');
  }

  /**
   * Get active alerts for environment
   */
  private getActiveAlertsForEnvironment(environmentName: string): EnvironmentAlert[] {
    return this.alerts.filter(alert => 
      alert.environment === environmentName && !alert.resolved
    );
  }

  /**
   * Get alert counts for environment
   */
  private getAlertCountsForEnvironment(environmentName: string): EnvironmentMetrics['alertCount'] {
    const envAlerts = this.alerts.filter(alert => alert.environment === environmentName);
    
    return {
      info: envAlerts.filter(a => a.severity === 'info').length,
      warning: envAlerts.filter(a => a.severity === 'warning').length,
      error: envAlerts.filter(a => a.severity === 'error').length,
      critical: envAlerts.filter(a => a.severity === 'critical').length
    };
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): EnvironmentMetrics {
    return {
      checksPerformed: 0,
      averageResponseTime: 0,
      successRate: 0,
      uptimePercentage: 0,
      alertCount: { info: 0, warning: 0, error: 0, critical: 0 }
    };
  }

  /**
   * Get default trends
   */
  private getDefaultTrends(): EnvironmentTrends {
    return {
      responseTimeTrend: 'stable',
      successRateTrend: 'stable',
      uptimeTrend: 'stable',
      alertTrend: 'stable'
    };
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Get current monitoring status
   */
  public getMonitoringStatus(): {
    isActive: boolean;
    session: MonitoringSession | null;
    environments: string[];
    totalAlerts: number;
    activeAlerts: number;
  } {
    return {
      isActive: this.isMonitoring,
      session: this.currentSession,
      environments: Array.from(this.environmentStatuses.keys()),
      totalAlerts: this.alerts.length,
      activeAlerts: this.alerts.filter(a => !a.resolved).length
    };
  }

  /**
   * Get environment statuses
   */
  public getEnvironmentStatuses(): Map<string, EnvironmentStatus> {
    return new Map(this.environmentStatuses);
  }

  /**
   * Get environment status
   */
  public getEnvironmentStatus(environmentName: string): EnvironmentStatus | null {
    return this.environmentStatuses.get(environmentName) || null;
  }

  /**
   * Get all alerts
   */
  public getAlerts(): EnvironmentAlert[] {
    return [...this.alerts];
  }

  /**
   * Get alerts for environment
   */
  public getAlertsForEnvironment(environmentName: string): EnvironmentAlert[] {
    return this.alerts.filter(alert => alert.environment === environmentName);
  }

  /**
   * Resolve alert
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.resolved) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();

    logger.info(`Alert resolved`, { alertId, environment: alert.environment });
    this.emit('environment:alert:resolved', alert);

    return true;
  }

  /**
   * Update monitoring configuration
   */
  public updateConfig(newConfig: Partial<EnvironmentMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Environment monitoring configuration updated', newConfig);
    this.emit('monitoring:config:updated', this.config);
  }

  /**
   * Get current configuration
   */
  public getConfig(): EnvironmentMonitorConfig {
    return { ...this.config };
  }
}

export const environmentMonitorService = EnvironmentMonitorService.getInstance();