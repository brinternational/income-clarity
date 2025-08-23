/**
 * Deployment Verification Framework
 * 
 * Validates that changes reach the intended deployment environments
 * and function correctly after deployment.
 */

import { logger } from '../logging/logger.service';
import { environmentDetectionService, EnvironmentFingerprint } from './environment-detection.service';

export interface DeploymentVerificationResult {
  deploymentId: string;
  timestamp: string;
  sourceEnvironment: EnvironmentFingerprint;
  targetEnvironment: EnvironmentFingerprint;
  verificationChecks: DeploymentCheck[];
  overallStatus: 'success' | 'partial' | 'failed';
  successRate: number;
  duration: number;
  recommendations: string[];
}

export interface DeploymentCheck {
  name: string;
  category: 'connectivity' | 'version' | 'functionality' | 'configuration' | 'health';
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  duration: number;
  details: any;
  error?: string;
  recommendation?: string;
}

export interface DeploymentTarget {
  name: string;
  url: string;
  type: 'production' | 'staging' | 'development';
  healthEndpoint: string;
  authRequired: boolean;
  critical: boolean;
}

class DeploymentVerificationService {
  private static instance: DeploymentVerificationService;
  private deploymentTargets: Map<string, DeploymentTarget> = new Map();
  private verificationHistory: DeploymentVerificationResult[] = [];
  private readonly MAX_HISTORY = 50;

  private constructor() {
    this.initializeDeploymentTargets();
  }

  public static getInstance(): DeploymentVerificationService {
    if (!DeploymentVerificationService.instance) {
      DeploymentVerificationService.instance = new DeploymentVerificationService();
    }
    return DeploymentVerificationService.instance;
  }

  /**
   * Initialize standard deployment targets
   */
  private initializeDeploymentTargets(): void {
    this.deploymentTargets.set('production', {
      name: 'Production',
      url: 'https://incomeclarity.ddns.net',
      type: 'production',
      healthEndpoint: '/api/health?level=detailed&details=true',
      authRequired: false,
      critical: true
    });

    this.deploymentTargets.set('local', {
      name: 'Local Development',
      url: 'http://localhost:3000',
      type: 'development',
      healthEndpoint: '/api/health?level=detailed&details=true',
      authRequired: false,
      critical: false
    });
  }

  /**
   * Verify deployment to target environment
   */
  public async verifyDeployment(
    targetName: string,
    expectedVersion?: string,
    expectedCommit?: string
  ): Promise<DeploymentVerificationResult> {
    const deploymentId = this.generateDeploymentId();
    const startTime = Date.now();

    logger.info('Starting deployment verification', {
      deploymentId,
      target: targetName,
      expectedVersion,
      expectedCommit
    });

    try {
      const sourceEnv = await environmentDetectionService.getCurrentEnvironment();
      const target = this.deploymentTargets.get(targetName);

      if (!target) {
        throw new Error(`Unknown deployment target: ${targetName}`);
      }

      // Perform verification checks
      const checks = await this.performVerificationChecks(target, expectedVersion, expectedCommit);
      
      // Get target environment fingerprint
      const targetEnv = await this.getTargetEnvironment(target);

      // Calculate results
      const successRate = this.calculateSuccessRate(checks);
      const overallStatus = this.determineOverallStatus(checks, successRate);
      const recommendations = this.generateRecommendations(checks, sourceEnv, targetEnv);

      const result: DeploymentVerificationResult = {
        deploymentId,
        timestamp: new Date().toISOString(),
        sourceEnvironment: sourceEnv,
        targetEnvironment: targetEnv,
        verificationChecks: checks,
        overallStatus,
        successRate,
        duration: Date.now() - startTime,
        recommendations
      };

      // Store in history
      this.addToHistory(result);

      logger.info('Deployment verification completed', {
        deploymentId,
        status: overallStatus,
        successRate,
        duration: result.duration,
        checksCount: checks.length
      });

      return result;

    } catch (error) {
      logger.error('Deployment verification failed', error as Error, {
        deploymentId,
        target: targetName
      });

      throw error;
    }
  }

  /**
   * Perform comprehensive verification checks
   */
  private async performVerificationChecks(
    target: DeploymentTarget,
    expectedVersion?: string,
    expectedCommit?: string
  ): Promise<DeploymentCheck[]> {
    const checks: Promise<DeploymentCheck>[] = [
      this.checkConnectivity(target),
      this.checkHealth(target),
      this.checkVersion(target, expectedVersion),
      this.checkConfiguration(target),
      this.checkFunctionality(target)
    ];

    if (expectedCommit) {
      checks.push(this.checkGitCommit(target, expectedCommit));
    }

    return Promise.all(checks);
  }

  /**
   * Check connectivity to target environment
   */
  private async checkConnectivity(target: DeploymentTarget): Promise<DeploymentCheck> {
    const startTime = Date.now();

    try {
      const response = await fetch(target.url, {
        method: 'HEAD',
        timeout: 10000
      });

      const duration = Date.now() - startTime;
      const status = response.ok ? 'passed' : 'failed';

      return {
        name: 'Connectivity Check',
        category: 'connectivity',
        status,
        duration,
        details: {
          url: target.url,
          statusCode: response.status,
          responseTime: duration,
          headers: Object.fromEntries(response.headers.entries())
        },
        error: !response.ok ? `HTTP ${response.status}: ${response.statusText}` : undefined
      };
    } catch (error) {
      return {
        name: 'Connectivity Check',
        category: 'connectivity',
        status: 'failed',
        duration: Date.now() - startTime,
        details: { url: target.url },
        error: (error as Error).message,
        recommendation: 'Verify network connectivity and server availability'
      };
    }
  }

  /**
   * Check health endpoint
   */
  private async checkHealth(target: DeploymentTarget): Promise<DeploymentCheck> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${target.url}${target.healthEndpoint}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 15000
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          name: 'Health Check',
          category: 'health',
          status: 'failed',
          duration,
          details: { statusCode: response.status },
          error: `Health endpoint returned ${response.status}`,
          recommendation: 'Check application health and error logs'
        };
      }

      const healthData = await response.json();
      const isHealthy = healthData.status === 'healthy';

      return {
        name: 'Health Check',
        category: 'health',
        status: isHealthy ? 'passed' : 'warning',
        duration,
        details: {
          overallStatus: healthData.status,
          uptime: healthData.uptime,
          checksPerformed: healthData.checks?.length || 0,
          healthyChecks: healthData.summary?.healthy || 0,
          unhealthyChecks: healthData.summary?.unhealthy || 0,
          version: healthData.version
        },
        error: !isHealthy ? `Application health status: ${healthData.status}` : undefined,
        recommendation: !isHealthy ? 'Review failed health checks and system status' : undefined
      };
    } catch (error) {
      return {
        name: 'Health Check',
        category: 'health',
        status: 'failed',
        duration: Date.now() - startTime,
        details: {},
        error: (error as Error).message,
        recommendation: 'Verify health endpoint availability and response format'
      };
    }
  }

  /**
   * Check application version
   */
  private async checkVersion(target: DeploymentTarget, expectedVersion?: string): Promise<DeploymentCheck> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${target.url}${target.healthEndpoint}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 10000
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          name: 'Version Check',
          category: 'version',
          status: 'failed',
          duration,
          details: {},
          error: `Unable to retrieve version information (HTTP ${response.status})`,
          recommendation: 'Verify health endpoint provides version information'
        };
      }

      const healthData = await response.json();
      const actualVersion = healthData.version;

      if (!actualVersion) {
        return {
          name: 'Version Check',
          category: 'version',
          status: 'warning',
          duration,
          details: { expectedVersion, actualVersion: 'unknown' },
          recommendation: 'Add version information to health endpoint response'
        };
      }

      const status = (!expectedVersion || actualVersion === expectedVersion) ? 'passed' : 'failed';

      return {
        name: 'Version Check',
        category: 'version',
        status,
        duration,
        details: {
          expectedVersion: expectedVersion || 'any',
          actualVersion,
          matches: actualVersion === expectedVersion
        },
        error: status === 'failed' ? `Version mismatch: expected ${expectedVersion}, got ${actualVersion}` : undefined,
        recommendation: status === 'failed' ? 'Deploy the correct version to target environment' : undefined
      };
    } catch (error) {
      return {
        name: 'Version Check',
        category: 'version',
        status: 'failed',
        duration: Date.now() - startTime,
        details: { expectedVersion },
        error: (error as Error).message
      };
    }
  }

  /**
   * Check Git commit synchronization
   */
  private async checkGitCommit(target: DeploymentTarget, expectedCommit: string): Promise<DeploymentCheck> {
    const startTime = Date.now();

    try {
      // For now, we'll rely on version checking since Git commit info
      // isn't directly exposed in the health endpoint
      // This could be enhanced to include commit hash in health responses

      return {
        name: 'Git Commit Check',
        category: 'version',
        status: 'skipped',
        duration: Date.now() - startTime,
        details: {
          expectedCommit: expectedCommit.substring(0, 8),
          reason: 'Commit information not available in health endpoint'
        },
        recommendation: 'Add Git commit hash to health endpoint for deployment verification'
      };
    } catch (error) {
      return {
        name: 'Git Commit Check',
        category: 'version',
        status: 'failed',
        duration: Date.now() - startTime,
        details: { expectedCommit: expectedCommit.substring(0, 8) },
        error: (error as Error).message
      };
    }
  }

  /**
   * Check configuration consistency
   */
  private async checkConfiguration(target: DeploymentTarget): Promise<DeploymentCheck> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${target.url}${target.healthEndpoint}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 10000
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          name: 'Configuration Check',
          category: 'configuration',
          status: 'failed',
          duration,
          details: {},
          error: `Unable to retrieve configuration (HTTP ${response.status})`
        };
      }

      const healthData = await response.json();
      const envCheck = healthData.checks?.find((check: any) => check.name === 'environment');

      if (!envCheck) {
        return {
          name: 'Configuration Check',
          category: 'configuration',
          status: 'warning',
          duration,
          details: {},
          recommendation: 'Add environment configuration to health checks'
        };
      }

      const configOk = envCheck.status === 'healthy';
      const missingVars = envCheck.details?.missingVars || [];

      return {
        name: 'Configuration Check',
        category: 'configuration',
        status: configOk ? 'passed' : 'failed',
        duration,
        details: {
          environmentStatus: envCheck.status,
          configuredVars: envCheck.details?.configuredVars || 0,
          totalRequired: envCheck.details?.totalRequired || 0,
          missingVars
        },
        error: !configOk ? `Missing environment variables: ${missingVars.join(', ')}` : undefined,
        recommendation: !configOk ? 'Configure missing environment variables' : undefined
      };
    } catch (error) {
      return {
        name: 'Configuration Check',
        category: 'configuration',
        status: 'failed',
        duration: Date.now() - startTime,
        details: {},
        error: (error as Error).message
      };
    }
  }

  /**
   * Check basic functionality
   */
  private async checkFunctionality(target: DeploymentTarget): Promise<DeploymentCheck> {
    const startTime = Date.now();

    try {
      // Test basic API functionality
      const apiTests = await Promise.allSettled([
        this.testEndpoint(`${target.url}/api/health`, 'GET'),
        this.testEndpoint(`${target.url}/api/auth/me`, 'GET'), // May return 401, which is fine
      ]);

      const duration = Date.now() - startTime;
      const successfulTests = apiTests.filter(result => result.status === 'fulfilled').length;
      const totalTests = apiTests.length;

      const functionalityScore = successfulTests / totalTests;
      const status = functionalityScore >= 0.8 ? 'passed' : 
                   functionalityScore >= 0.5 ? 'warning' : 'failed';

      return {
        name: 'Functionality Check',
        category: 'functionality',
        status,
        duration,
        details: {
          testsRun: totalTests,
          testsPassed: successfulTests,
          functionalityScore: Math.round(functionalityScore * 100),
          apiEndpointsResponding: successfulTests
        },
        error: status === 'failed' ? `Only ${successfulTests}/${totalTests} API endpoints responding correctly` : undefined,
        recommendation: status !== 'passed' ? 'Investigate non-responsive API endpoints' : undefined
      };
    } catch (error) {
      return {
        name: 'Functionality Check',
        category: 'functionality',
        status: 'failed',
        duration: Date.now() - startTime,
        details: {},
        error: (error as Error).message,
        recommendation: 'Verify application is running and API endpoints are accessible'
      };
    }
  }

  /**
   * Test individual endpoint
   */
  private async testEndpoint(url: string, method: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method,
        timeout: 5000
      });
      // Consider 2xx, 401, and 404 as "working" responses
      return response.status < 500;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get target environment fingerprint
   */
  private async getTargetEnvironment(target: DeploymentTarget): Promise<EnvironmentFingerprint> {
    try {
      if (target.type === 'production') {
        return await environmentDetectionService.getProductionEnvironment();
      } else {
        // For non-production targets, return a basic fingerprint
        return {
          id: `${target.type}-${target.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: target.name,
          type: target.type as any,
          hostname: new URL(target.url).hostname,
          timestamp: new Date().toISOString(),
          version: 'unknown',
          deploymentTarget: target.url,
          isLive: target.critical,
          configuration: {
            nodeEnv: target.type === 'production' ? 'production' : 'development',
            localMode: target.type === 'development',
            liteProduction: target.type === 'production',
            databaseType: 'unknown',
            redisEnabled: false,
            yodleeEnabled: false,
            emailEnabled: false,
            queueEnabled: false,
            metricsEnabled: false,
            httpsEnabled: target.url.startsWith('https')
          },
          security: {
            secretsConfigured: target.type === 'production',
            corsEnabled: true,
            rateLimitingEnabled: target.type === 'production',
            httpsEnforced: target.url.startsWith('https'),
            authenticationRequired: target.authRequired,
            encryptionEnabled: target.url.startsWith('https')
          },
          capabilities: []
        };
      }
    } catch (error) {
      throw new Error(`Unable to get target environment fingerprint: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate success rate from checks
   */
  private calculateSuccessRate(checks: DeploymentCheck[]): number {
    if (checks.length === 0) return 0;
    
    const passedChecks = checks.filter(check => check.status === 'passed').length;
    return Math.round((passedChecks / checks.length) * 100);
  }

  /**
   * Determine overall deployment status
   */
  private determineOverallStatus(
    checks: DeploymentCheck[], 
    successRate: number
  ): DeploymentVerificationResult['overallStatus'] {
    const failedCritical = checks.some(check => 
      check.status === 'failed' && 
      (check.category === 'connectivity' || check.category === 'health')
    );

    if (failedCritical) return 'failed';
    if (successRate >= 90) return 'success';
    if (successRate >= 70) return 'partial';
    return 'failed';
  }

  /**
   * Generate recommendations based on results
   */
  private generateRecommendations(
    checks: DeploymentCheck[], 
    source: EnvironmentFingerprint, 
    target: EnvironmentFingerprint
  ): string[] {
    const recommendations: string[] = [];

    // Add check-specific recommendations
    checks.forEach(check => {
      if (check.recommendation && check.status !== 'passed') {
        recommendations.push(check.recommendation);
      }
    });

    // Add environment-specific recommendations
    if (source.version !== target.version) {
      recommendations.push('Consider updating target environment to match source version');
    }

    if (target.isLive === false) {
      recommendations.push('Target environment appears to be unreachable or offline');
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Generate unique deployment ID
   */
  private generateDeploymentId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `deploy-${timestamp}-${random}`;
  }

  /**
   * Add result to history
   */
  private addToHistory(result: DeploymentVerificationResult): void {
    this.verificationHistory.unshift(result);
    
    // Limit history size
    if (this.verificationHistory.length > this.MAX_HISTORY) {
      this.verificationHistory = this.verificationHistory.slice(0, this.MAX_HISTORY);
    }
  }

  /**
   * Get verification history
   */
  public getVerificationHistory(): DeploymentVerificationResult[] {
    return [...this.verificationHistory];
  }

  /**
   * Get latest verification result for target
   */
  public getLatestVerification(targetName: string): DeploymentVerificationResult | null {
    return this.verificationHistory.find(result => 
      result.targetEnvironment.name.toLowerCase().includes(targetName.toLowerCase())
    ) || null;
  }

  /**
   * Add custom deployment target
   */
  public addDeploymentTarget(name: string, target: DeploymentTarget): void {
    this.deploymentTargets.set(name, target);
    logger.info('Deployment target added', { name, url: target.url, type: target.type });
  }

  /**
   * Get deployment targets
   */
  public getDeploymentTargets(): Map<string, DeploymentTarget> {
    return new Map(this.deploymentTargets);
  }
}

export const deploymentVerificationService = DeploymentVerificationService.getInstance();