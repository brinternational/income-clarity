/**
 * Real-Time Monitoring and Alerting Service
 * 
 * Comprehensive real-time monitoring system for deployment verification pipeline.
 * Provides continuous health monitoring, change detection, smart alerting, and
 * performance drift detection with event-driven architecture.
 */

import { EventEmitter } from 'events';
import { logger } from '../logging/logger.service';
import { environmentDetectionService, EnvironmentFingerprint } from './environment-detection.service';
import { deploymentVerificationService, DeploymentCheck } from './deployment-verification.service';
import { uiVerificationService, UIVerificationResult } from './ui-verification.service';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { chromium, Browser, Page } from 'playwright';

export interface MonitoringConfig {
  enabled: boolean;
  intervals: {
    health: number;          // Health check interval (ms)
    performance: number;     // Performance monitoring interval (ms)
    environment: number;     // Environment drift check interval (ms)
    session: number;         // Session health check interval (ms)
    database: number;        // Database monitoring interval (ms)
    integration: number;     // External API monitoring interval (ms)
  };
  thresholds: MonitoringThresholds;
  alerts: AlertConfig;
  retention: RetentionConfig;
  circuitBreaker: CircuitBreakerConfig;
}

export interface MonitoringThresholds {
  apiResponseTime: number;        // Max API response time (ms)
  errorRate: number;             // Max error rate (0-1)
  memoryUsage: number;           // Max memory usage (MB)
  cpuUsage: number;              // Max CPU usage (0-1)
  databaseQueryTime: number;     // Max DB query time (ms)
  sessionInvalidRate: number;    // Max session invalid rate (0-1)
  progressiveFailureRate: number; // Max progressive disclosure failure rate (0-1)
  uiRegressionTolerance: number; // Max UI regression tolerance (0-1)
}

export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  rateLimiting: {
    enabled: boolean;
    windowMs: number;      // Rate limit window
    maxAlerts: number;     // Max alerts per window
  };
  escalation: {
    enabled: boolean;
    levels: EscalationLevel[];
  };
  suppression: {
    enabled: boolean;
    quietHours: { start: string; end: string }[];
  };
}

export interface AlertChannel {
  type: 'console' | 'file' | 'webhook' | 'websocket';
  enabled: boolean;
  config: any;
  severityFilter: AlertSeverity[];
}

export interface EscalationLevel {
  severity: AlertSeverity;
  delay: number;         // Delay before escalation (ms)
  channels: string[];    // Channel types to escalate to
}

export interface RetentionConfig {
  metrics: number;       // Days to retain metrics
  alerts: number;        // Days to retain alert history
  screenshots: number;   // Days to retain screenshots
  logs: number;          // Days to retain detailed logs
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;  // Number of failures to open circuit
  resetTimeout: number;      // Time to wait before retry (ms)
  monitorWindow: number;     // Window to track failures (ms)
}

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  category: string;
  title: string;
  message: string;
  source: string;
  target?: string;
  metadata: any;
  resolved: boolean;
  resolvedAt?: string;
  escalated: boolean;
  escalatedAt?: string;
  suppressUntil?: string;
}

export interface MonitoringMetrics {
  timestamp: string;
  environment: string;
  system: SystemMetrics;
  api: APIMetrics;
  database: DatabaseMetrics;
  integration: IntegrationMetrics;
  ui: UIMetrics;
  session: SessionMetrics;
  progressive: ProgressiveDisclosureMetrics;
}

export interface SystemMetrics {
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  networkConnections: number;
}

export interface APIMetrics {
  endpoints: EndpointMetric[];
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestEndpoint: string;
  errorRate: number;
}

export interface EndpointMetric {
  path: string;
  method: string;
  requests: number;
  averageResponseTime: number;
  errorCount: number;
  lastError?: string;
  lastErrorTime?: string;
}

export interface DatabaseMetrics {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queryPerformance: {
    averageTime: number;
    slowestQuery: number;
    totalQueries: number;
  };
  transactionStats: {
    successful: number;
    failed: number;
    rollbacks: number;
  };
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

export interface IntegrationMetrics {
  yodlee: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    errorRate: number;
    lastSync?: string;
  };
  polygon: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    rateLimitUsage: number;
    errorRate: number;
  };
  external: ExternalServiceMetric[];
}

export interface ExternalServiceMetric {
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

export interface UIMetrics {
  coreWebVitals: {
    lcp: number;  // Largest Contentful Paint
    fid: number;  // First Input Delay
    cls: number;  // Cumulative Layout Shift
    fcp: number;  // First Contentful Paint
    tbt: number;  // Total Blocking Time
    si: number;   // Speed Index
  };
  regressionDetected: boolean;
  accessibilityScore: number;
  performanceScore: number;
  lastUIVerification?: string;
}

export interface SessionMetrics {
  activeSessions: number;
  invalidSessions: number;
  sessionCreateRate: number;
  sessionExpireRate: number;
  authenticationFailures: number;
  averageSessionDuration: number;
}

export interface ProgressiveDisclosureMetrics {
  level1Success: number;
  level2Success: number;
  level3Success: number;
  urlParameterFailures: number;
  routingErrors: number;
  fallbackActivations: number;
}

export interface HealthScore {
  overall: number;
  breakdown: {
    system: number;
    api: number;
    database: number;
    integration: number;
    ui: number;
    session: number;
    progressive: number;
  };
  trend: 'improving' | 'stable' | 'degrading';
  lastCalculated: string;
}

export interface ChangeDetectionResult {
  detected: boolean;
  category: string;
  changes: DetectedChange[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface DetectedChange {
  type: 'environment' | 'configuration' | 'performance' | 'ui' | 'api';
  field: string;
  previousValue: any;
  currentValue: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface MonitoringDashboardData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  healthScore: HealthScore;
  activeAlerts: Alert[];
  recentMetrics: MonitoringMetrics[];
  systemOverview: SystemOverview;
  performanceTrends: PerformanceTrend[];
  changeHistory: ChangeDetectionResult[];
}

export interface SystemOverview {
  uptime: string;
  version: string;
  environment: string;
  totalRequests: number;
  currentUsers: number;
  errorRate: number;
  averageResponseTime: number;
}

export interface PerformanceTrend {
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}

class RealTimeMonitorService extends EventEmitter {
  private static instance: RealTimeMonitorService;
  private config: MonitoringConfig;
  private isRunning: boolean = false;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private alertHistory: Alert[] = [];
  private metricsHistory: MonitoringMetrics[] = [];
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private alertRateLimiter: Map<string, AlertRateLimit> = new Map();
  private browser: Browser | null = null;
  private readonly MAX_METRICS_HISTORY = 1000;
  private readonly MAX_ALERT_HISTORY = 500;
  private readonly DATA_DIR = join(process.cwd(), 'monitoring');

  private constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.ensureDataDirectory();
    this.loadPersistedData();
  }

  public static getInstance(): RealTimeMonitorService {
    if (!RealTimeMonitorService.instance) {
      RealTimeMonitorService.instance = new RealTimeMonitorService();
    }
    return RealTimeMonitorService.instance;
  }

  /**
   * Start real-time monitoring
   */
  public async startMonitoring(config?: Partial<MonitoringConfig>): Promise<void> {
    if (this.isRunning) {
      logger.warn('Real-time monitoring is already running');
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (!this.config.enabled) {
      logger.info('Real-time monitoring is disabled in configuration');
      return;
    }

    try {
      logger.info('Starting real-time monitoring system', {
        intervals: this.config.intervals,
        alertsEnabled: this.config.alerts.enabled
      });

      // Initialize browser for UI monitoring
      await this.initializeBrowser();

      // Start monitoring intervals
      this.startHealthMonitoring();
      this.startPerformanceMonitoring();
      this.startEnvironmentMonitoring();
      this.startSessionMonitoring();
      this.startDatabaseMonitoring();
      this.startIntegrationMonitoring();

      this.isRunning = true;
      this.emit('monitoring:started', { timestamp: new Date().toISOString() });

      // Send startup alert
      await this.sendAlert({
        severity: 'info',
        category: 'system',
        title: 'Real-Time Monitoring Started',
        message: 'Real-time monitoring system has been initialized and is now active',
        source: 'monitor-service',
        metadata: {
          config: this.config,
          intervals: Object.keys(this.config.intervals).length
        }
      });

      logger.info('Real-time monitoring system started successfully');

    } catch (error) {
      logger.error('Failed to start real-time monitoring', error as Error);
      await this.sendAlert({
        severity: 'critical',
        category: 'system',
        title: 'Monitoring System Startup Failed',
        message: `Failed to initialize real-time monitoring: ${(error as Error).message}`,
        source: 'monitor-service',
        metadata: { error: (error as Error).stack }
      });
      throw error;
    }
  }

  /**
   * Stop real-time monitoring
   */
  public async stopMonitoring(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Real-time monitoring is not running');
      return;
    }

    try {
      logger.info('Stopping real-time monitoring system');

      // Clear all intervals
      this.monitoringIntervals.forEach((interval, name) => {
        clearInterval(interval);
        logger.debug(`Stopped monitoring interval: ${name}`);
      });
      this.monitoringIntervals.clear();

      // Close browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      // Persist data
      this.persistData();

      this.isRunning = false;
      this.emit('monitoring:stopped', { timestamp: new Date().toISOString() });

      // Send shutdown alert
      await this.sendAlert({
        severity: 'info',
        category: 'system',
        title: 'Real-Time Monitoring Stopped',
        message: 'Real-time monitoring system has been gracefully shut down',
        source: 'monitor-service',
        metadata: {
          totalMetrics: this.metricsHistory.length,
          totalAlerts: this.alertHistory.length
        }
      });

      logger.info('Real-time monitoring system stopped successfully');

    } catch (error) {
      logger.error('Error stopping real-time monitoring', error as Error);
      throw error;
    }
  }

  /**
   * Get current monitoring status
   */
  public getMonitoringStatus(): {
    isRunning: boolean;
    uptime: number;
    activeIntervals: string[];
    totalAlerts: number;
    totalMetrics: number;
    healthScore: HealthScore | null;
  } {
    return {
      isRunning: this.isRunning,
      uptime: this.isRunning ? Date.now() - this.getStartTime() : 0,
      activeIntervals: Array.from(this.monitoringIntervals.keys()),
      totalAlerts: this.alertHistory.length,
      totalMetrics: this.metricsHistory.length,
      healthScore: this.calculateHealthScore()
    };
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    const interval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Health monitoring check failed', error as Error);
        await this.sendAlert({
          severity: 'error',
          category: 'monitoring',
          title: 'Health Check Failed',
          message: `Health monitoring check encountered an error: ${(error as Error).message}`,
          source: 'health-monitor',
          metadata: { error: (error as Error).stack }
        });
      }
    }, this.config.intervals.health);

    this.monitoringIntervals.set('health', interval);
    logger.debug('Health monitoring started', { interval: this.config.intervals.health });
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();

    try {
      // Check API endpoints
      const apiMetrics = await this.collectAPIMetrics();
      
      // Check system resources
      const systemMetrics = await this.collectSystemMetrics();
      
      // Check database health
      const databaseMetrics = await this.collectDatabaseMetrics();
      
      // Check external integrations
      const integrationMetrics = await this.collectIntegrationMetrics();
      
      // Check UI performance
      const uiMetrics = await this.collectUIMetrics();
      
      // Check session health
      const sessionMetrics = await this.collectSessionMetrics();
      
      // Check Progressive Disclosure
      const progressiveMetrics = await this.collectProgressiveDisclosureMetrics();

      // Compile metrics
      const metrics: MonitoringMetrics = {
        timestamp: new Date().toISOString(),
        environment: (await environmentDetectionService.getCurrentEnvironment()).name,
        system: systemMetrics,
        api: apiMetrics,
        database: databaseMetrics,
        integration: integrationMetrics,
        ui: uiMetrics,
        session: sessionMetrics,
        progressive: progressiveMetrics
      };

      // Store metrics
      this.addMetrics(metrics);

      // Analyze for threshold violations
      await this.analyzeThresholds(metrics);

      // Check for changes
      await this.detectChanges(metrics);

      this.emit('health:checked', {
        metrics,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Health check failed', error as Error);
      throw error;
    }
  }

  /**
   * Collect API metrics
   */
  private async collectAPIMetrics(): Promise<APIMetrics> {
    const endpoints = [
      { path: '/api/health', method: 'GET' },
      { path: '/api/auth/me', method: 'GET' },
      { path: '/api/super-cards/performance-hub', method: 'GET' },
      { path: '/api/super-cards/income-intelligence', method: 'GET' },
      { path: '/api/super-cards/portfolio-strategy', method: 'GET' },
      { path: '/api/super-cards/tax-strategy', method: 'GET' },
      { path: '/api/super-cards/financial-planning', method: 'GET' },
    ];

    const endpointMetrics: EndpointMetric[] = [];
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalResponseTime = 0;
    let slowestEndpoint = '';
    let slowestTime = 0;

    for (const endpoint of endpoints) {
      const metric = await this.testAPIEndpoint(endpoint.path, endpoint.method);
      endpointMetrics.push(metric);
      
      totalRequests += metric.requests;
      if (metric.errorCount === 0) {
        successfulRequests += metric.requests;
      } else {
        failedRequests += metric.errorCount;
      }
      
      totalResponseTime += metric.averageResponseTime;
      
      if (metric.averageResponseTime > slowestTime) {
        slowestTime = metric.averageResponseTime;
        slowestEndpoint = `${endpoint.method} ${endpoint.path}`;
      }
    }

    const averageResponseTime = totalResponseTime / endpoints.length;
    const errorRate = totalRequests > 0 ? failedRequests / totalRequests : 0;

    return {
      endpoints: endpointMetrics,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      slowestEndpoint,
      errorRate
    };
  }

  /**
   * Test individual API endpoint
   */
  private async testAPIEndpoint(path: string, method: string): Promise<EndpointMetric> {
    const environment = await environmentDetectionService.getCurrentEnvironment();
    const url = `${environment.deploymentTarget}${path}`;
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RealTimeMonitor/1.0'
        },
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;
      const isSuccess = response.status < 400;

      return {
        path,
        method,
        requests: 1,
        averageResponseTime: responseTime,
        errorCount: isSuccess ? 0 : 1,
        lastError: !isSuccess ? `HTTP ${response.status}: ${response.statusText}` : undefined,
        lastErrorTime: !isSuccess ? new Date().toISOString() : undefined
      };

    } catch (error) {
      return {
        path,
        method,
        requests: 1,
        averageResponseTime: Date.now() - startTime,
        errorCount: 1,
        lastError: (error as Error).message,
        lastErrorTime: new Date().toISOString()
      };
    }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const process = await import('process');
    const os = await import('os');
    
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      uptime: process.uptime() * 1000, // Convert to milliseconds
      memoryUsage: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        percentage: Math.round((usedMem / totalMem) * 100)
      },
      cpuUsage: await this.getCPUUsage(),
      diskUsage: await this.getDiskUsage(),
      networkConnections: 0 // Placeholder - would need additional monitoring
    };
  }

  /**
   * Get CPU usage percentage
   */
  private async getCPUUsage(): Promise<number> {
    try {
      const os = await import('os');
      const cpus = os.cpus();
      
      // Calculate CPU usage (simplified approach)
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach(cpu => {
        Object.values(cpu.times).forEach(time => totalTick += time);
        totalIdle += cpu.times.idle;
      });
      
      const idle = totalIdle / cpus.length;
      const total = totalTick / cpus.length;
      
      return Math.round((1 - idle / total) * 100);
    } catch (error) {
      logger.warn('Unable to calculate CPU usage', error as Error);
      return 0;
    }
  }

  /**
   * Get disk usage information
   */
  private async getDiskUsage(): Promise<{ used: number; total: number; percentage: number }> {
    try {
      const { execSync } = await import('child_process');
      const output = execSync('df -h /', { encoding: 'utf8' });
      const lines = output.split('\n');
      
      if (lines.length >= 2) {
        const parts = lines[1].split(/\s+/);
        const total = this.parseSize(parts[1]);
        const used = this.parseSize(parts[2]);
        const percentage = parseInt(parts[4].replace('%', ''));
        
        return { used, total, percentage };
      }
    } catch (error) {
      logger.warn('Unable to get disk usage', error as Error);
    }
    
    return { used: 0, total: 0, percentage: 0 };
  }

  /**
   * Parse disk size from df output
   */
  private parseSize(sizeStr: string): number {
    const size = parseFloat(sizeStr);
    const unit = sizeStr.slice(-1).toUpperCase();
    
    switch (unit) {
      case 'K': return Math.round(size / 1024);
      case 'M': return Math.round(size);
      case 'G': return Math.round(size * 1024);
      case 'T': return Math.round(size * 1024 * 1024);
      default: return Math.round(size / 1024 / 1024); // Assume bytes
    }
  }

  /**
   * Collect database metrics
   */
  private async collectDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      // Test database connectivity
      const startTime = Date.now();
      
      // Simple query to test database
      const response = await fetch(
        `${(await environmentDetectionService.getCurrentEnvironment()).deploymentTarget}/api/health`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          timeout: 5000
        }
      );

      const queryTime = Date.now() - startTime;
      const isHealthy = response.ok;

      let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (!isHealthy) {
        healthStatus = 'unhealthy';
      } else if (queryTime > this.config.thresholds.databaseQueryTime) {
        healthStatus = 'degraded';
      }

      return {
        connectionPool: {
          active: 1, // Simplified - would need actual pool monitoring
          idle: 0,
          total: 1
        },
        queryPerformance: {
          averageTime: queryTime,
          slowestQuery: queryTime,
          totalQueries: 1
        },
        transactionStats: {
          successful: isHealthy ? 1 : 0,
          failed: isHealthy ? 0 : 1,
          rollbacks: 0
        },
        healthStatus
      };

    } catch (error) {
      logger.warn('Database metrics collection failed', error as Error);
      return {
        connectionPool: { active: 0, idle: 0, total: 0 },
        queryPerformance: { averageTime: 0, slowestQuery: 0, totalQueries: 0 },
        transactionStats: { successful: 0, failed: 1, rollbacks: 0 },
        healthStatus: 'unhealthy'
      };
    }
  }

  /**
   * Collect integration metrics
   */
  private async collectIntegrationMetrics(): Promise<IntegrationMetrics> {
    const yodlee = await this.testExternalService('Yodlee', 'https://sandbox.api.yodlee.com/ysl');
    const polygon = await this.testExternalService('Polygon', 'https://api.polygon.io/v1/marketstatus/now');

    return {
      yodlee: {
        status: yodlee.status,
        responseTime: yodlee.responseTime,
        errorRate: yodlee.errorRate,
        lastSync: undefined // Would need actual sync tracking
      },
      polygon: {
        status: polygon.status,
        responseTime: polygon.responseTime,
        rateLimitUsage: 0, // Would need actual rate limit tracking
        errorRate: polygon.errorRate
      },
      external: [yodlee, polygon]
    };
  }

  /**
   * Test external service health
   */
  private async testExternalService(
    name: string, 
    url: string
  ): Promise<ExternalServiceMetric> {
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;
      const status = response.ok ? 'healthy' : 
                    response.status < 500 ? 'degraded' : 'unhealthy';

      return {
        name,
        url,
        status,
        responseTime,
        errorRate: response.ok ? 0 : 1,
        lastCheck: new Date().toISOString()
      };

    } catch (error) {
      return {
        name,
        url,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        errorRate: 1,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Collect UI metrics using Playwright
   */
  private async collectUIMetrics(): Promise<UIMetrics> {
    if (!this.browser) {
      return {
        coreWebVitals: {
          lcp: 0, fid: 0, cls: 0, fcp: 0, tbt: 0, si: 0
        },
        regressionDetected: false,
        accessibilityScore: 0,
        performanceScore: 0
      };
    }

    try {
      const environment = await environmentDetectionService.getCurrentEnvironment();
      const context = await this.browser.newContext();
      const page = await context.newPage();

      // Navigate to dashboard
      await page.goto(`${environment.deploymentTarget}/dashboard/super-cards`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Collect Core Web Vitals
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Simplified Core Web Vitals collection
          // In production, would use web-vitals library
          const timing = performance.timing;
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          resolve({
            lcp: navigation.loadEventEnd - navigation.loadEventStart,
            fid: 0, // Would need interaction measurement
            cls: 0, // Would need layout shift measurement
            fcp: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            tbt: 0, // Would need blocking time measurement
            si: navigation.loadEventEnd - navigation.fetchStart
          });
        });
      });

      await context.close();

      return {
        coreWebVitals: vitals as any,
        regressionDetected: false,
        accessibilityScore: 95, // Would use actual axe-core testing
        performanceScore: this.calculatePerformanceScore(vitals as any)
      };

    } catch (error) {
      logger.warn('UI metrics collection failed', error as Error);
      return {
        coreWebVitals: {
          lcp: 0, fid: 0, cls: 0, fcp: 0, tbt: 0, si: 0
        },
        regressionDetected: false,
        accessibilityScore: 0,
        performanceScore: 0
      };
    }
  }

  /**
   * Calculate performance score from Core Web Vitals
   */
  private calculatePerformanceScore(vitals: any): number {
    // Simplified scoring based on Core Web Vitals
    let score = 100;
    
    if (vitals.lcp > 2500) score -= 20;
    if (vitals.fcp > 1800) score -= 15;
    if (vitals.cls > 0.1) score -= 15;
    if (vitals.si > 3400) score -= 15;
    
    return Math.max(0, score);
  }

  /**
   * Collect session metrics
   */
  private async collectSessionMetrics(): Promise<SessionMetrics> {
    try {
      // Test session endpoint
      const environment = await environmentDetectionService.getCurrentEnvironment();
      const response = await fetch(`${environment.deploymentTarget}/api/auth/me`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      });

      const sessionValid = response.status !== 401;

      return {
        activeSessions: sessionValid ? 1 : 0,
        invalidSessions: sessionValid ? 0 : 1,
        sessionCreateRate: 0, // Would need actual tracking
        sessionExpireRate: 0, // Would need actual tracking
        authenticationFailures: sessionValid ? 0 : 1,
        averageSessionDuration: 0 // Would need actual tracking
      };

    } catch (error) {
      return {
        activeSessions: 0,
        invalidSessions: 1,
        sessionCreateRate: 0,
        sessionExpireRate: 0,
        authenticationFailures: 1,
        averageSessionDuration: 0
      };
    }
  }

  /**
   * Collect Progressive Disclosure metrics
   */
  private async collectProgressiveDisclosureMetrics(): Promise<ProgressiveDisclosureMetrics> {
    const environment = await environmentDetectionService.getCurrentEnvironment();
    const baseUrl = environment.deploymentTarget;

    const tests = [
      `${baseUrl}/dashboard/super-cards?level=momentum`,
      `${baseUrl}/dashboard/super-cards?level=hero-view&hub=performance`,
      `${baseUrl}/dashboard/super-cards?level=detailed&hub=performance&view=holdings`
    ];

    let level1Success = 0;
    let level2Success = 0;
    let level3Success = 0;
    let urlParameterFailures = 0;

    for (let i = 0; i < tests.length; i++) {
      try {
        const response = await fetch(tests[i], {
          method: 'HEAD',
          timeout: 5000
        });

        if (response.ok) {
          if (i === 0) level1Success = 1;
          else if (i === 1) level2Success = 1;
          else level3Success = 1;
        } else {
          urlParameterFailures++;
        }
      } catch (error) {
        urlParameterFailures++;
      }
    }

    return {
      level1Success,
      level2Success,
      level3Success,
      urlParameterFailures,
      routingErrors: 0, // Would need detailed routing monitoring
      fallbackActivations: 0 // Would need fallback detection
    };
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    const interval = setInterval(async () => {
      try {
        await this.performPerformanceCheck();
      } catch (error) {
        logger.error('Performance monitoring check failed', error as Error);
      }
    }, this.config.intervals.performance);

    this.monitoringIntervals.set('performance', interval);
    logger.debug('Performance monitoring started', { interval: this.config.intervals.performance });
  }

  /**
   * Perform performance monitoring check
   */
  private async performPerformanceCheck(): Promise<void> {
    // Performance monitoring is integrated into health checks
    // This could be expanded for dedicated performance analysis
    this.emit('performance:checked', {
      timestamp: new Date().toISOString(),
      message: 'Performance check completed'
    });
  }

  /**
   * Start environment monitoring
   */
  private startEnvironmentMonitoring(): void {
    const interval = setInterval(async () => {
      try {
        await this.performEnvironmentDriftCheck();
      } catch (error) {
        logger.error('Environment monitoring check failed', error as Error);
      }
    }, this.config.intervals.environment);

    this.monitoringIntervals.set('environment', interval);
    logger.debug('Environment monitoring started', { interval: this.config.intervals.environment });
  }

  /**
   * Perform environment drift detection
   */
  private async performEnvironmentDriftCheck(): Promise<void> {
    try {
      const comparison = await environmentDetectionService.compareWithProduction();
      
      if (comparison.syncStatus !== 'synchronized') {
        await this.sendAlert({
          severity: comparison.riskLevel === 'critical' ? 'critical' : 
                   comparison.riskLevel === 'high' ? 'error' : 'warning',
          category: 'environment',
          title: 'Environment Drift Detected',
          message: `Environment synchronization status: ${comparison.syncStatus}`,
          source: 'environment-monitor',
          metadata: {
            syncStatus: comparison.syncStatus,
            riskLevel: comparison.riskLevel,
            differences: comparison.differences.length,
            highImpactDifferences: comparison.differences.filter(d => d.impact === 'high').length
          }
        });
      }

      this.emit('environment:checked', {
        comparison,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Environment drift check failed', error as Error);
      throw error;
    }
  }

  /**
   * Start session monitoring
   */
  private startSessionMonitoring(): void {
    const interval = setInterval(async () => {
      try {
        await this.performSessionHealthCheck();
      } catch (error) {
        logger.error('Session monitoring check failed', error as Error);
      }
    }, this.config.intervals.session);

    this.monitoringIntervals.set('session', interval);
    logger.debug('Session monitoring started', { interval: this.config.intervals.session });
  }

  /**
   * Perform session health check
   */
  private async performSessionHealthCheck(): Promise<void> {
    // Session health checking is integrated into main health checks
    this.emit('session:checked', {
      timestamp: new Date().toISOString(),
      message: 'Session health check completed'
    });
  }

  /**
   * Start database monitoring
   */
  private startDatabaseMonitoring(): void {
    const interval = setInterval(async () => {
      try {
        await this.performDatabaseHealthCheck();
      } catch (error) {
        logger.error('Database monitoring check failed', error as Error);
      }
    }, this.config.intervals.database);

    this.monitoringIntervals.set('database', interval);
    logger.debug('Database monitoring started', { interval: this.config.intervals.database });
  }

  /**
   * Perform database health check
   */
  private async performDatabaseHealthCheck(): Promise<void> {
    // Database health checking is integrated into main health checks
    this.emit('database:checked', {
      timestamp: new Date().toISOString(),
      message: 'Database health check completed'
    });
  }

  /**
   * Start integration monitoring
   */
  private startIntegrationMonitoring(): void {
    const interval = setInterval(async () => {
      try {
        await this.performIntegrationHealthCheck();
      } catch (error) {
        logger.error('Integration monitoring check failed', error as Error);
      }
    }, this.config.intervals.integration);

    this.monitoringIntervals.set('integration', interval);
    logger.debug('Integration monitoring started', { interval: this.config.intervals.integration });
  }

  /**
   * Perform integration health check
   */
  private async performIntegrationHealthCheck(): Promise<void> {
    // Integration health checking is integrated into main health checks
    this.emit('integration:checked', {
      timestamp: new Date().toISOString(),
      message: 'Integration health check completed'
    });
  }

  /**
   * Analyze metrics against thresholds
   */
  private async analyzeThresholds(metrics: MonitoringMetrics): Promise<void> {
    const violations: Array<{ metric: string; current: number; threshold: number; severity: AlertSeverity }> = [];

    // Check API response time
    if (metrics.api.averageResponseTime > this.config.thresholds.apiResponseTime) {
      violations.push({
        metric: 'API Response Time',
        current: metrics.api.averageResponseTime,
        threshold: this.config.thresholds.apiResponseTime,
        severity: metrics.api.averageResponseTime > this.config.thresholds.apiResponseTime * 2 ? 'critical' : 'warning'
      });
    }

    // Check error rate
    if (metrics.api.errorRate > this.config.thresholds.errorRate) {
      violations.push({
        metric: 'API Error Rate',
        current: metrics.api.errorRate,
        threshold: this.config.thresholds.errorRate,
        severity: metrics.api.errorRate > this.config.thresholds.errorRate * 2 ? 'critical' : 'error'
      });
    }

    // Check memory usage
    if (metrics.system.memoryUsage.percentage > this.config.thresholds.memoryUsage) {
      violations.push({
        metric: 'Memory Usage',
        current: metrics.system.memoryUsage.percentage,
        threshold: this.config.thresholds.memoryUsage,
        severity: metrics.system.memoryUsage.percentage > 90 ? 'critical' : 'warning'
      });
    }

    // Check database query time
    if (metrics.database.queryPerformance.averageTime > this.config.thresholds.databaseQueryTime) {
      violations.push({
        metric: 'Database Query Time',
        current: metrics.database.queryPerformance.averageTime,
        threshold: this.config.thresholds.databaseQueryTime,
        severity: 'warning'
      });
    }

    // Send alerts for violations
    for (const violation of violations) {
      await this.sendAlert({
        severity: violation.severity,
        category: 'threshold',
        title: `${violation.metric} Threshold Exceeded`,
        message: `${violation.metric} is ${violation.current} (threshold: ${violation.threshold})`,
        source: 'threshold-monitor',
        metadata: {
          metric: violation.metric,
          currentValue: violation.current,
          thresholdValue: violation.threshold,
          exceedsBy: violation.current - violation.threshold
        }
      });
    }
  }

  /**
   * Detect significant changes
   */
  private async detectChanges(currentMetrics: MonitoringMetrics): Promise<void> {
    if (this.metricsHistory.length === 0) {
      return; // No previous metrics to compare
    }

    const previousMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    const changes: DetectedChange[] = [];

    // Compare API performance
    const responseTimeDiff = currentMetrics.api.averageResponseTime - previousMetrics.api.averageResponseTime;
    if (Math.abs(responseTimeDiff) > this.config.thresholds.apiResponseTime * 0.2) {
      changes.push({
        type: 'performance',
        field: 'api.averageResponseTime',
        previousValue: previousMetrics.api.averageResponseTime,
        currentValue: currentMetrics.api.averageResponseTime,
        impact: Math.abs(responseTimeDiff) > this.config.thresholds.apiResponseTime ? 'high' : 'medium',
        recommendation: responseTimeDiff > 0 ? 'Investigate performance degradation' : 'Performance improvement detected'
      });
    }

    // Compare error rates
    const errorRateDiff = currentMetrics.api.errorRate - previousMetrics.api.errorRate;
    if (Math.abs(errorRateDiff) > 0.05) { // 5% change
      changes.push({
        type: 'api',
        field: 'api.errorRate',
        previousValue: previousMetrics.api.errorRate,
        currentValue: currentMetrics.api.errorRate,
        impact: errorRateDiff > 0 ? 'high' : 'low',
        recommendation: errorRateDiff > 0 ? 'Investigate increased error rate' : 'Error rate improvement detected'
      });
    }

    // Compare memory usage
    const memoryDiff = currentMetrics.system.memoryUsage.percentage - previousMetrics.system.memoryUsage.percentage;
    if (Math.abs(memoryDiff) > 10) { // 10% change
      changes.push({
        type: 'performance',
        field: 'system.memoryUsage.percentage',
        previousValue: previousMetrics.system.memoryUsage.percentage,
        currentValue: currentMetrics.system.memoryUsage.percentage,
        impact: memoryDiff > 0 ? 'medium' : 'low',
        recommendation: memoryDiff > 0 ? 'Monitor memory usage trend' : 'Memory usage improvement detected'
      });
    }

    // Send change detection alerts
    if (changes.length > 0) {
      const highImpactChanges = changes.filter(c => c.impact === 'high' || c.impact === 'critical');
      
      if (highImpactChanges.length > 0) {
        await this.sendAlert({
          severity: 'warning',
          category: 'change-detection',
          title: 'Significant Changes Detected',
          message: `${highImpactChanges.length} high-impact changes detected in system metrics`,
          source: 'change-detector',
          metadata: {
            totalChanges: changes.length,
            highImpactChanges: highImpactChanges.length,
            changes: changes.map(c => ({
              field: c.field,
              impact: c.impact,
              change: `${c.previousValue} → ${c.currentValue}`
            }))
          }
        });
      }

      this.emit('changes:detected', {
        changes,
        timestamp: new Date().toISOString(),
        highImpactCount: highImpactChanges.length
      });
    }
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved' | 'escalated'>): Promise<void> {
    if (!this.config.alerts.enabled) {
      return;
    }

    // Check rate limiting
    if (this.config.alerts.rateLimiting.enabled) {
      const rateLimitKey = `${alertData.category}:${alertData.severity}`;
      if (this.isRateLimited(rateLimitKey)) {
        logger.debug('Alert rate limited', { category: alertData.category, severity: alertData.severity });
        return;
      }
    }

    // Check quiet hours
    if (this.config.alerts.suppression.enabled && this.isInQuietHours()) {
      // Store alert but don't send immediately
      const alert: Alert = {
        ...alertData,
        id: this.generateAlertId(),
        timestamp: new Date().toISOString(),
        resolved: false,
        escalated: false,
        suppressUntil: this.getQuietHoursEndTime()
      };
      
      this.addAlert(alert);
      return;
    }

    const alert: Alert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      resolved: false,
      escalated: false
    };

    // Send through configured channels
    for (const channel of this.config.alerts.channels) {
      if (!channel.enabled || !channel.severityFilter.includes(alertData.severity)) {
        continue;
      }

      try {
        await this.sendAlertToChannel(alert, channel);
      } catch (error) {
        logger.error(`Failed to send alert through ${channel.type}`, error as Error, {
          alertId: alert.id,
          channel: channel.type
        });
      }
    }

    // Store alert
    this.addAlert(alert);

    // Emit alert event
    this.emit('alert:sent', alert);

    logger.info('Alert sent', {
      id: alert.id,
      severity: alert.severity,
      category: alert.category,
      title: alert.title
    });
  }

  /**
   * Send alert to specific channel
   */
  private async sendAlertToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case 'console':
        this.sendConsoleAlert(alert);
        break;
        
      case 'file':
        await this.sendFileAlert(alert, channel.config);
        break;
        
      case 'webhook':
        await this.sendWebhookAlert(alert, channel.config);
        break;
        
      case 'websocket':
        await this.sendWebSocketAlert(alert, channel.config);
        break;
        
      default:
        logger.warn('Unknown alert channel type', { type: channel.type });
    }
  }

  /**
   * Send console alert
   */
  private sendConsoleAlert(alert: Alert): void {
    const timestamp = new Date(alert.timestamp).toLocaleString();
    const emoji = this.getAlertEmoji(alert.severity);
    
    console.log(`\n${emoji} [${alert.severity.toUpperCase()}] ${alert.title}`);
    console.log(`📅 ${timestamp}`);
    console.log(`📂 Category: ${alert.category}`);
    console.log(`📍 Source: ${alert.source}`);
    console.log(`💬 ${alert.message}`);
    
    if (alert.metadata && Object.keys(alert.metadata).length > 0) {
      console.log(`📊 Metadata:`, JSON.stringify(alert.metadata, null, 2));
    }
    
    console.log('─'.repeat(80));
  }

  /**
   * Send file alert
   */
  private async sendFileAlert(alert: Alert, config: any): Promise<void> {
    const logFile = config.file || join(this.DATA_DIR, 'alerts.log');
    const logEntry = {
      timestamp: alert.timestamp,
      id: alert.id,
      severity: alert.severity,
      category: alert.category,
      title: alert.title,
      message: alert.message,
      source: alert.source,
      target: alert.target,
      metadata: alert.metadata
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    try {
      const fs = await import('fs/promises');
      await fs.appendFile(logFile, logLine);
    } catch (error) {
      logger.error('Failed to write alert to file', error as Error, { file: logFile });
    }
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: Alert, config: any): Promise<void> {
    if (!config.url) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      alert,
      timestamp: new Date().toISOString(),
      source: 'income-clarity-monitor'
    };

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IncomeClarity-Monitor/1.0',
        ...(config.headers || {})
      },
      body: JSON.stringify(payload),
      timeout: config.timeout || 10000
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Send WebSocket alert
   */
  private async sendWebSocketAlert(alert: Alert, config: any): Promise<void> {
    // WebSocket implementation would depend on the specific WebSocket server setup
    // This is a placeholder for the implementation
    logger.debug('WebSocket alert sending not implemented', { alertId: alert.id });
  }

  /**
   * Get alert emoji for severity
   */
  private getAlertEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return '📢';
    }
  }

  /**
   * Check if alert is rate limited
   */
  private isRateLimited(rateLimitKey: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.alerts.rateLimiting.windowMs;
    
    if (!this.alertRateLimiter.has(rateLimitKey)) {
      this.alertRateLimiter.set(rateLimitKey, {
        count: 1,
        windowStart: now,
        lastAlert: now
      });
      return false;
    }

    const rateLimit = this.alertRateLimiter.get(rateLimitKey)!;
    
    // Reset window if expired
    if (rateLimit.windowStart < windowStart) {
      rateLimit.count = 1;
      rateLimit.windowStart = now;
      rateLimit.lastAlert = now;
      return false;
    }

    // Check if within rate limit
    if (rateLimit.count >= this.config.alerts.rateLimiting.maxAlerts) {
      return true;
    }

    rateLimit.count++;
    rateLimit.lastAlert = now;
    return false;
  }

  /**
   * Check if currently in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.config.alerts.suppression.quietHours.length) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    for (const quietPeriod of this.config.alerts.suppression.quietHours) {
      const start = this.parseTimeString(quietPeriod.start);
      const end = this.parseTimeString(quietPeriod.end);
      
      if (start <= end) {
        // Same day period
        if (currentTime >= start && currentTime <= end) {
          return true;
        }
      } else {
        // Overnight period
        if (currentTime >= start || currentTime <= end) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Parse time string (HH:MM) to numeric format (HHMM)
   */
  private parseTimeString(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 100 + minutes;
  }

  /**
   * Get quiet hours end time
   */
  private getQuietHoursEndTime(): string {
    // Find the earliest end time of current quiet periods
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    let earliestEnd: Date | null = null;
    
    for (const quietPeriod of this.config.alerts.suppression.quietHours) {
      const start = this.parseTimeString(quietPeriod.start);
      const end = this.parseTimeString(quietPeriod.end);
      
      let endTime: Date;
      
      if (start <= end) {
        // Same day period
        if (currentTime >= start && currentTime <= end) {
          endTime = new Date(now);
          endTime.setHours(Math.floor(end / 100), end % 100, 0, 0);
        } else {
          continue;
        }
      } else {
        // Overnight period
        if (currentTime >= start) {
          // End is tomorrow
          endTime = new Date(now);
          endTime.setDate(endTime.getDate() + 1);
          endTime.setHours(Math.floor(end / 100), end % 100, 0, 0);
        } else if (currentTime <= end) {
          // End is today
          endTime = new Date(now);
          endTime.setHours(Math.floor(end / 100), end % 100, 0, 0);
        } else {
          continue;
        }
      }
      
      if (!earliestEnd || endTime < earliestEnd) {
        earliestEnd = endTime;
      }
    }
    
    return earliestEnd ? earliestEnd.toISOString() : new Date(Date.now() + 3600000).toISOString(); // Default to 1 hour
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `alert-${timestamp}-${random}`;
  }

  /**
   * Add alert to history
   */
  private addAlert(alert: Alert): void {
    this.alertHistory.unshift(alert);
    
    // Limit history size
    if (this.alertHistory.length > this.MAX_ALERT_HISTORY) {
      this.alertHistory = this.alertHistory.slice(0, this.MAX_ALERT_HISTORY);
    }
  }

  /**
   * Add metrics to history
   */
  private addMetrics(metrics: MonitoringMetrics): void {
    this.metricsHistory.push(metrics);
    
    // Limit history size
    if (this.metricsHistory.length > this.MAX_METRICS_HISTORY) {
      this.metricsHistory = this.metricsHistory.slice(-this.MAX_METRICS_HISTORY);
    }
  }

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(): HealthScore | null {
    if (this.metricsHistory.length === 0) {
      return null;
    }

    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    
    // Calculate individual scores (0-100)
    const systemScore = this.calculateSystemScore(latestMetrics.system);
    const apiScore = this.calculateAPIScore(latestMetrics.api);
    const databaseScore = this.calculateDatabaseScore(latestMetrics.database);
    const integrationScore = this.calculateIntegrationScore(latestMetrics.integration);
    const uiScore = this.calculateUIScore(latestMetrics.ui);
    const sessionScore = this.calculateSessionScore(latestMetrics.session);
    const progressiveScore = this.calculateProgressiveScore(latestMetrics.progressive);

    // Calculate weighted overall score
    const weights = {
      system: 0.15,
      api: 0.25,
      database: 0.20,
      integration: 0.15,
      ui: 0.10,
      session: 0.10,
      progressive: 0.05
    };

    const overall = Math.round(
      systemScore * weights.system +
      apiScore * weights.api +
      databaseScore * weights.database +
      integrationScore * weights.integration +
      uiScore * weights.ui +
      sessionScore * weights.session +
      progressiveScore * weights.progressive
    );

    // Calculate trend
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (this.metricsHistory.length >= 3) {
      const previousMetrics = this.metricsHistory[this.metricsHistory.length - 3];
      const previousScore = this.calculateHealthScoreFromMetrics(previousMetrics);
      
      if (overall > previousScore + 5) {
        trend = 'improving';
      } else if (overall < previousScore - 5) {
        trend = 'degrading';
      }
    }

    return {
      overall,
      breakdown: {
        system: systemScore,
        api: apiScore,
        database: databaseScore,
        integration: integrationScore,
        ui: uiScore,
        session: sessionScore,
        progressive: progressiveScore
      },
      trend,
      lastCalculated: new Date().toISOString()
    };
  }

  /**
   * Calculate health score from specific metrics
   */
  private calculateHealthScoreFromMetrics(metrics: MonitoringMetrics): number {
    const systemScore = this.calculateSystemScore(metrics.system);
    const apiScore = this.calculateAPIScore(metrics.api);
    const databaseScore = this.calculateDatabaseScore(metrics.database);
    const integrationScore = this.calculateIntegrationScore(metrics.integration);
    const uiScore = this.calculateUIScore(metrics.ui);
    const sessionScore = this.calculateSessionScore(metrics.session);
    const progressiveScore = this.calculateProgressiveScore(metrics.progressive);

    return Math.round(
      (systemScore + apiScore + databaseScore + integrationScore + uiScore + sessionScore + progressiveScore) / 7
    );
  }

  /**
   * Calculate system health score
   */
  private calculateSystemScore(system: SystemMetrics): number {
    let score = 100;
    
    // Memory usage penalty
    if (system.memoryUsage.percentage > 80) score -= 30;
    else if (system.memoryUsage.percentage > 60) score -= 15;
    
    // CPU usage penalty
    if (system.cpuUsage > 80) score -= 25;
    else if (system.cpuUsage > 60) score -= 10;
    
    // Disk usage penalty
    if (system.diskUsage.percentage > 90) score -= 25;
    else if (system.diskUsage.percentage > 75) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Calculate API health score
   */
  private calculateAPIScore(api: APIMetrics): number {
    let score = 100;
    
    // Error rate penalty
    if (api.errorRate > 0.1) score -= 40;
    else if (api.errorRate > 0.05) score -= 20;
    else if (api.errorRate > 0.01) score -= 10;
    
    // Response time penalty
    if (api.averageResponseTime > 1000) score -= 30;
    else if (api.averageResponseTime > 500) score -= 15;
    else if (api.averageResponseTime > 200) score -= 5;
    
    return Math.max(0, score);
  }

  /**
   * Calculate database health score
   */
  private calculateDatabaseScore(database: DatabaseMetrics): number {
    let score = 100;
    
    // Health status penalty
    if (database.healthStatus === 'unhealthy') score -= 50;
    else if (database.healthStatus === 'degraded') score -= 25;
    
    // Query performance penalty
    if (database.queryPerformance.averageTime > 1000) score -= 30;
    else if (database.queryPerformance.averageTime > 500) score -= 15;
    
    // Transaction failure penalty
    const totalTransactions = database.transactionStats.successful + database.transactionStats.failed;
    if (totalTransactions > 0) {
      const failureRate = database.transactionStats.failed / totalTransactions;
      if (failureRate > 0.1) score -= 20;
      else if (failureRate > 0.05) score -= 10;
    }
    
    return Math.max(0, score);
  }

  /**
   * Calculate integration health score
   */
  private calculateIntegrationScore(integration: IntegrationMetrics): number {
    let score = 100;
    
    // Yodlee status penalty
    if (integration.yodlee.status === 'unhealthy') score -= 25;
    else if (integration.yodlee.status === 'degraded') score -= 15;
    
    // Polygon status penalty
    if (integration.polygon.status === 'unhealthy') score -= 25;
    else if (integration.polygon.status === 'degraded') score -= 15;
    
    // External services penalty
    const unhealthyServices = integration.external.filter(s => s.status === 'unhealthy').length;
    const degradedServices = integration.external.filter(s => s.status === 'degraded').length;
    
    score -= unhealthyServices * 15;
    score -= degradedServices * 5;
    
    return Math.max(0, score);
  }

  /**
   * Calculate UI health score
   */
  private calculateUIScore(ui: UIMetrics): number {
    let score = 100;
    
    // Performance score penalty
    if (ui.performanceScore < 50) score -= 30;
    else if (ui.performanceScore < 70) score -= 15;
    else if (ui.performanceScore < 90) score -= 5;
    
    // Accessibility score penalty
    if (ui.accessibilityScore < 70) score -= 20;
    else if (ui.accessibilityScore < 90) score -= 10;
    
    // Regression penalty
    if (ui.regressionDetected) score -= 25;
    
    return Math.max(0, score);
  }

  /**
   * Calculate session health score
   */
  private calculateSessionScore(session: SessionMetrics): number {
    let score = 100;
    
    // Authentication failure penalty
    if (session.authenticationFailures > 0) score -= 20;
    
    // Invalid session penalty
    const totalSessions = session.activeSessions + session.invalidSessions;
    if (totalSessions > 0) {
      const invalidRate = session.invalidSessions / totalSessions;
      if (invalidRate > 0.2) score -= 30;
      else if (invalidRate > 0.1) score -= 15;
    }
    
    return Math.max(0, score);
  }

  /**
   * Calculate Progressive Disclosure health score
   */
  private calculateProgressiveScore(progressive: ProgressiveDisclosureMetrics): number {
    let score = 100;
    
    // Level success penalties
    if (progressive.level1Success === 0) score -= 40;
    if (progressive.level2Success === 0) score -= 30;
    if (progressive.level3Success === 0) score -= 20;
    
    // URL parameter failure penalty
    if (progressive.urlParameterFailures > 0) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Initialize browser for UI monitoring
   */
  private async initializeBrowser(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
      
      logger.info('Browser initialized for UI monitoring');
    } catch (error) {
      logger.warn('Failed to initialize browser for UI monitoring', error as Error);
      // Continue without browser-based monitoring
    }
  }

  /**
   * Get start time for uptime calculation
   */
  private getStartTime(): number {
    // This would be stored when monitoring starts
    // For now, use process start time as approximation
    return Date.now() - (process.uptime() * 1000);
  }

  /**
   * Get default monitoring configuration
   */
  private getDefaultConfig(): MonitoringConfig {
    return {
      enabled: true,
      intervals: {
        health: 30000,        // 30 seconds
        performance: 60000,   // 1 minute
        environment: 300000,  // 5 minutes
        session: 120000,      // 2 minutes
        database: 60000,      // 1 minute
        integration: 180000   // 3 minutes
      },
      thresholds: {
        apiResponseTime: 500,          // 500ms
        errorRate: 0.05,               // 5%
        memoryUsage: 80,               // 80%
        cpuUsage: 0.8,                 // 80%
        databaseQueryTime: 1000,       // 1000ms
        sessionInvalidRate: 0.1,       // 10%
        progressiveFailureRate: 0.1,   // 10%
        uiRegressionTolerance: 0.02    // 2%
      },
      alerts: {
        enabled: true,
        channels: [
          {
            type: 'console',
            enabled: true,
            config: {},
            severityFilter: ['info', 'warning', 'error', 'critical']
          },
          {
            type: 'file',
            enabled: true,
            config: {
              file: join(this.DATA_DIR, 'alerts.log')
            },
            severityFilter: ['warning', 'error', 'critical']
          }
        ],
        rateLimiting: {
          enabled: true,
          windowMs: 300000,    // 5 minutes
          maxAlerts: 5         // Max 5 alerts per 5 minutes per category/severity
        },
        escalation: {
          enabled: false,
          levels: []
        },
        suppression: {
          enabled: false,
          quietHours: []
        }
      },
      retention: {
        metrics: 7,      // 7 days
        alerts: 30,      // 30 days
        screenshots: 3,  // 3 days
        logs: 14         // 14 days
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        resetTimeout: 60000,     // 1 minute
        monitorWindow: 300000    // 5 minutes
      }
    };
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    if (!existsSync(this.DATA_DIR)) {
      mkdirSync(this.DATA_DIR, { recursive: true });
    }
  }

  /**
   * Load persisted monitoring data
   */
  private loadPersistedData(): void {
    try {
      // Load alert history
      const alertsFile = join(this.DATA_DIR, 'alert-history.json');
      if (existsSync(alertsFile)) {
        const alertsData = JSON.parse(readFileSync(alertsFile, 'utf8'));
        this.alertHistory = alertsData.slice(0, this.MAX_ALERT_HISTORY);
      }

      // Load metrics history
      const metricsFile = join(this.DATA_DIR, 'metrics-history.json');
      if (existsSync(metricsFile)) {
        const metricsData = JSON.parse(readFileSync(metricsFile, 'utf8'));
        this.metricsHistory = metricsData.slice(-this.MAX_METRICS_HISTORY);
      }

      logger.info('Monitoring data loaded', {
        alerts: this.alertHistory.length,
        metrics: this.metricsHistory.length
      });

    } catch (error) {
      logger.warn('Failed to load persisted monitoring data', error as Error);
    }
  }

  /**
   * Persist monitoring data
   */
  private persistData(): void {
    try {
      // Save alert history
      const alertsFile = join(this.DATA_DIR, 'alert-history.json');
      writeFileSync(alertsFile, JSON.stringify(this.alertHistory, null, 2));

      // Save metrics history
      const metricsFile = join(this.DATA_DIR, 'metrics-history.json');
      writeFileSync(metricsFile, JSON.stringify(this.metricsHistory, null, 2));

      logger.debug('Monitoring data persisted', {
        alerts: this.alertHistory.length,
        metrics: this.metricsHistory.length
      });

    } catch (error) {
      logger.error('Failed to persist monitoring data', error as Error);
    }
  }

  /**
   * Get monitoring dashboard data
   */
  public getMonitoringDashboard(): MonitoringDashboardData {
    const healthScore = this.calculateHealthScore();
    const activeAlerts = this.alertHistory.filter(alert => !alert.resolved).slice(0, 10);
    const recentMetrics = this.metricsHistory.slice(-20);
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (healthScore) {
      if (healthScore.overall < 50) status = 'unhealthy';
      else if (healthScore.overall < 80) status = 'degraded';
    }

    const systemOverview: SystemOverview = {
      uptime: this.formatUptime(this.getStartTime()),
      version: '1.0.0', // Would come from package.json
      environment: this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1].environment : 'Unknown',
      totalRequests: this.metricsHistory.reduce((sum, m) => sum + m.api.totalRequests, 0),
      currentUsers: this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1].session.activeSessions : 0,
      errorRate: this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1].api.errorRate : 0,
      averageResponseTime: this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1].api.averageResponseTime : 0
    };

    const performanceTrends: PerformanceTrend[] = recentMetrics.map(metrics => ({
      timestamp: metrics.timestamp,
      metric: 'responseTime',
      value: metrics.api.averageResponseTime,
      threshold: this.config.thresholds.apiResponseTime,
      status: metrics.api.averageResponseTime > this.config.thresholds.apiResponseTime ? 'critical' : 'normal'
    }));

    return {
      status,
      healthScore: healthScore || {
        overall: 0,
        breakdown: { system: 0, api: 0, database: 0, integration: 0, ui: 0, session: 0, progressive: 0 },
        trend: 'stable',
        lastCalculated: new Date().toISOString()
      },
      activeAlerts,
      recentMetrics,
      systemOverview,
      performanceTrends,
      changeHistory: [] // Would need change detection history
    };
  }

  /**
   * Format uptime duration
   */
  private formatUptime(startTime: number): string {
    const uptimeMs = Date.now() - startTime;
    const seconds = Math.floor(uptimeMs / 1000) % 60;
    const minutes = Math.floor(uptimeMs / (1000 * 60)) % 60;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Get alert history
   */
  public getAlertHistory(limit?: number): Alert[] {
    return this.alertHistory.slice(0, limit || 50);
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(limit?: number): MonitoringMetrics[] {
    return this.metricsHistory.slice(-(limit || 100));
  }

  /**
   * Resolve alert
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      
      this.emit('alert:resolved', alert);
      logger.info('Alert resolved', { id: alertId, title: alert.title });
      
      return true;
    }
    return false;
  }

  /**
   * Update monitoring configuration
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new config if already running
    if (this.isRunning) {
      logger.info('Updating monitoring configuration and restarting');
      this.stopMonitoring().then(() => {
        this.startMonitoring();
      });
    }
    
    logger.info('Monitoring configuration updated', { config: newConfig });
  }

  /**
   * Test alert system
   */
  public async testAlerts(): Promise<void> {
    const testSeverities: AlertSeverity[] = ['info', 'warning', 'error', 'critical'];
    
    for (const severity of testSeverities) {
      await this.sendAlert({
        severity,
        category: 'test',
        title: `Test Alert - ${severity.toUpperCase()}`,
        message: `This is a test alert with severity level: ${severity}`,
        source: 'alert-tester',
        metadata: {
          testMode: true,
          timestamp: new Date().toISOString()
        }
      });
      
      // Small delay between test alerts
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.info('Alert system test completed');
  }

  /**
   * Get circuit breaker status
   */
  public getCircuitBreakerStatus(): Map<string, CircuitBreakerState> {
    return new Map(this.circuitBreakers);
  }

  /**
   * Force trigger health check
   */
  public async triggerHealthCheck(): Promise<MonitoringMetrics> {
    logger.info('Manual health check triggered');
    await this.performHealthCheck();
    return this.metricsHistory[this.metricsHistory.length - 1];
  }
}

// Additional interfaces for internal use
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextRetryTime: number;
}

interface AlertRateLimit {
  count: number;
  windowStart: number;
  lastAlert: number;
}

export const realTimeMonitorService = RealTimeMonitorService.getInstance();
export default realTimeMonitorService;