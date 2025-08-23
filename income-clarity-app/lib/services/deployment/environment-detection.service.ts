/**
 * Enhanced Environment Detection Service
 * 
 * Provides comprehensive environment identification and fingerprinting
 * to prevent deployment confusion and ensure proper targeting.
 */

import { logger } from '../logging/logger.service';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface EnvironmentFingerprint {
  id: string;
  name: string;
  type: 'local' | 'production' | 'staging' | 'development';
  hostname: string;
  domain?: string;
  port?: number;
  timestamp: string;
  gitCommit?: string;
  gitBranch?: string;
  version: string;
  deploymentTarget: string;
  isLive: boolean;
  configuration: EnvironmentConfiguration;
  security: SecurityProfile;
  capabilities: string[];
}

export interface EnvironmentConfiguration {
  nodeEnv: string;
  localMode: boolean;
  liteProduction: boolean;
  databaseType: string;
  redisEnabled: boolean;
  yodleeEnabled: boolean;
  emailEnabled: boolean;
  queueEnabled: boolean;
  metricsEnabled: boolean;
  httpsEnabled: boolean;
}

export interface SecurityProfile {
  secretsConfigured: boolean;
  corsEnabled: boolean;
  rateLimitingEnabled: boolean;
  httpsEnforced: boolean;
  authenticationRequired: boolean;
  encryptionEnabled: boolean;
}

export interface EnvironmentComparison {
  local: EnvironmentFingerprint;
  production: EnvironmentFingerprint;
  differences: EnvironmentDifference[];
  syncStatus: 'synchronized' | 'drift' | 'outdated' | 'ahead';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface EnvironmentDifference {
  category: string;
  field: string;
  localValue: any;
  productionValue: any;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

class EnvironmentDetectionService {
  private static instance: EnvironmentDetectionService;
  private currentFingerprint: EnvironmentFingerprint | null = null;
  private productionFingerprint: EnvironmentFingerprint | null = null;
  private lastCheck: Date | null = null;
  private readonly CACHE_TTL = 60000; // 1 minute

  private constructor() {}

  public static getInstance(): EnvironmentDetectionService {
    if (!EnvironmentDetectionService.instance) {
      EnvironmentDetectionService.instance = new EnvironmentDetectionService();
    }
    return EnvironmentDetectionService.instance;
  }

  /**
   * Get comprehensive environment fingerprint
   */
  public async getCurrentEnvironment(): Promise<EnvironmentFingerprint> {
    // Return cached fingerprint if still valid
    if (this.currentFingerprint && this.lastCheck && 
        (Date.now() - this.lastCheck.getTime()) < this.CACHE_TTL) {
      return this.currentFingerprint;
    }

    try {
      const fingerprint = await this.generateEnvironmentFingerprint();
      this.currentFingerprint = fingerprint;
      this.lastCheck = new Date();

      logger.info('Environment fingerprint generated', {
        environment: fingerprint.name,
        type: fingerprint.type,
        version: fingerprint.version,
        isLive: fingerprint.isLive
      });

      return fingerprint;
    } catch (error) {
      logger.error('Failed to generate environment fingerprint', error as Error);
      throw error;
    }
  }

  /**
   * Generate comprehensive environment fingerprint
   */
  private async generateEnvironmentFingerprint(): Promise<EnvironmentFingerprint> {
    const hostname = this.getHostname();
    const gitInfo = this.getGitInformation();
    const version = this.getApplicationVersion();
    const configuration = this.getEnvironmentConfiguration();
    const security = this.getSecurityProfile();
    const capabilities = this.getEnvironmentCapabilities();

    // Determine environment type and deployment target
    const { type, deploymentTarget, isLive, domain, port } = this.determineEnvironmentType();

    const id = this.generateEnvironmentId(hostname, type, gitInfo.commit);

    return {
      id,
      name: this.getEnvironmentName(type, hostname),
      type,
      hostname,
      domain,
      port,
      timestamp: new Date().toISOString(),
      gitCommit: gitInfo.commit,
      gitBranch: gitInfo.branch,
      version,
      deploymentTarget,
      isLive,
      configuration,
      security,
      capabilities
    };
  }

  /**
   * Determine environment type and deployment characteristics
   */
  private determineEnvironmentType(): {
    type: EnvironmentFingerprint['type'];
    deploymentTarget: string;
    isLive: boolean;
    domain?: string;
    port?: number;
  } {
    const hostname = this.getHostname();
    const nodeEnv = process.env.NODE_ENV;
    const localMode = process.env.LOCAL_MODE === 'true';
    
    // Check if we're running on the production domain
    if (hostname.includes('incomeclarity.ddns.net') || 
        process.env.DEPLOYMENT_DOMAIN === 'incomeclarity.ddns.net') {
      return {
        type: 'production',
        deploymentTarget: 'https://incomeclarity.ddns.net',
        isLive: true,
        domain: 'incomeclarity.ddns.net',
        port: 443
      };
    }

    // Check for localhost development
    if (hostname === 'localhost' || hostname.startsWith('127.0.0.1') || localMode) {
      return {
        type: 'local',
        deploymentTarget: 'http://localhost:3000',
        isLive: false,
        domain: 'localhost',
        port: 3000
      };
    }

    // Check for staging environment
    if (hostname.includes('staging') || nodeEnv === 'staging') {
      return {
        type: 'staging',
        deploymentTarget: `https://${hostname}`,
        isLive: false,
        domain: hostname
      };
    }

    // Default to development if not clearly identified
    return {
      type: 'development',
      deploymentTarget: `http://${hostname}`,
      isLive: false,
      domain: hostname
    };
  }

  /**
   * Generate unique environment ID
   */
  private generateEnvironmentId(hostname: string, type: string, commit?: string): string {
    const base = `${type}-${hostname}`;
    const suffix = commit ? commit.substring(0, 8) : Date.now().toString(36);
    return `${base}-${suffix}`;
  }

  /**
   * Get environment name
   */
  private getEnvironmentName(type: string, hostname: string): string {
    switch (type) {
      case 'production':
        return 'Income Clarity Production';
      case 'staging':
        return 'Income Clarity Staging';
      case 'local':
        return `Income Clarity Local (${hostname})`;
      default:
        return `Income Clarity ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }
  }

  /**
   * Get hostname with fallbacks
   */
  private getHostname(): string {
    try {
      return require('os').hostname();
    } catch (error) {
      return process.env.HOSTNAME || 'unknown';
    }
  }

  /**
   * Get Git information
   */
  private getGitInformation(): { commit?: string; branch?: string } {
    try {
      const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      return { commit, branch };
    } catch (error) {
      logger.warn('Unable to retrieve Git information', error as Error);
      return {};
    }
  }

  /**
   * Get application version
   */
  private getApplicationVersion(): string {
    try {
      const packagePath = join(process.cwd(), 'package.json');
      if (existsSync(packagePath)) {
        const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
        return pkg.version || '1.0.0';
      }
    } catch (error) {
      logger.warn('Unable to retrieve application version', error as Error);
    }
    return process.env.APP_VERSION || '1.0.0';
  }

  /**
   * Get environment configuration
   */
  private getEnvironmentConfiguration(): EnvironmentConfiguration {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      localMode: process.env.LOCAL_MODE === 'true',
      liteProduction: process.env.LITE_PRODUCTION_MODE === 'true',
      databaseType: this.detectDatabaseType(),
      redisEnabled: !!(process.env.REDIS_HOST || process.env.REDIS_URL),
      yodleeEnabled: !!(process.env.YODLEE_CLIENT_ID && process.env.YODLEE_API_URL),
      emailEnabled: !!(process.env.SMTP_HOST || process.env.SENDGRID_API_KEY),
      queueEnabled: process.env.ENABLE_BULLMQ === 'true',
      metricsEnabled: process.env.ENABLE_METRICS !== 'false',
      httpsEnabled: process.env.NODE_ENV === 'production'
    };
  }

  /**
   * Detect database type
   */
  private detectDatabaseType(): string {
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.includes('postgresql://')) return 'postgresql';
    if (dbUrl.includes('mysql://')) return 'mysql';
    if (dbUrl.includes('sqlite://') || dbUrl.includes('.db')) return 'sqlite';
    return 'unknown';
  }

  /**
   * Get security profile
   */
  private getSecurityProfile(): SecurityProfile {
    return {
      secretsConfigured: !!(process.env.NEXTAUTH_SECRET),
      corsEnabled: true, // Assumed configured
      rateLimitingEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      httpsEnforced: process.env.NODE_ENV === 'production',
      authenticationRequired: !process.env.DISABLE_AUTH,
      encryptionEnabled: !!(process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET)
    };
  }

  /**
   * Get environment capabilities
   */
  private getEnvironmentCapabilities(): string[] {
    const capabilities: string[] = ['basic'];

    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      capabilities.push('redis', 'caching', 'sessions');
    }

    if (process.env.ENABLE_BULLMQ === 'true') {
      capabilities.push('queues', 'background-jobs');
    }

    if (process.env.YODLEE_CLIENT_ID) {
      capabilities.push('yodlee-integration', 'bank-sync');
    }

    if (process.env.SMTP_HOST || process.env.SENDGRID_API_KEY) {
      capabilities.push('email-notifications');
    }

    if (process.env.NODE_ENV === 'production') {
      capabilities.push('production-ready', 'metrics', 'monitoring');
    }

    if (process.env.LOCAL_MODE === 'true') {
      capabilities.push('offline-mode', 'mock-data');
    }

    return capabilities;
  }

  /**
   * Compare current environment with production
   */
  public async compareWithProduction(): Promise<EnvironmentComparison> {
    const local = await this.getCurrentEnvironment();
    const production = await this.getProductionEnvironment();

    const differences = this.findEnvironmentDifferences(local, production);
    const syncStatus = this.determineSyncStatus(local, production, differences);
    const riskLevel = this.assessRiskLevel(differences);

    return {
      local,
      production,
      differences,
      syncStatus,
      riskLevel
    };
  }

  /**
   * Get production environment fingerprint
   */
  private async getProductionEnvironment(): Promise<EnvironmentFingerprint> {
    if (this.productionFingerprint && this.lastCheck && 
        (Date.now() - this.lastCheck.getTime()) < this.CACHE_TTL * 5) {
      return this.productionFingerprint;
    }

    try {
      // For local calls, check if we're connecting to ourselves
      const hostname = this.getHostname();
      if (hostname === 'localhost' || process.env.NODE_ENV !== 'production') {
        // When running locally, generate a mock production fingerprint
        this.productionFingerprint = this.getMockProductionFingerprint();
        return this.productionFingerprint;
      }

      // Fetch production environment info via health check endpoint
      const response = await fetch('https://incomeclarity.ddns.net/api/health?details=true', {
        headers: { 'Accept': 'application/json' },
        timeout: 10000
      });

      if (response.ok) {
        const healthData = await response.json();
        this.productionFingerprint = this.parseProductionHealthData(healthData);
        return this.productionFingerprint;
      }
    } catch (error) {
      logger.warn('Unable to fetch production environment info', error as Error);
    }

    // Return fallback production fingerprint
    return this.getFallbackProductionFingerprint();
  }

  /**
   * Get mock production fingerprint for local development
   */
  private getMockProductionFingerprint(): EnvironmentFingerprint {
    return {
      id: 'production-mock-incomeclarity-ddns-net',
      name: 'Income Clarity Production (Mock)',
      type: 'production',
      hostname: 'incomeclarity.ddns.net',
      domain: 'incomeclarity.ddns.net',
      port: 443,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      deploymentTarget: 'https://incomeclarity.ddns.net',
      isLive: true,
      configuration: {
        nodeEnv: 'production',
        localMode: false,
        liteProduction: true,
        databaseType: 'sqlite',
        redisEnabled: false,
        yodleeEnabled: true,
        emailEnabled: false,
        queueEnabled: false,
        metricsEnabled: true,
        httpsEnabled: true
      },
      security: {
        secretsConfigured: true,
        corsEnabled: true,
        rateLimitingEnabled: true,
        httpsEnforced: true,
        authenticationRequired: true,
        encryptionEnabled: true
      },
      capabilities: ['production-ready', 'https', 'metrics', 'monitoring', 'authentication', 'yodlee-integration']
    };
  }

  /**
   * Parse production health data into environment fingerprint
   */
  private parseProductionHealthData(healthData: any): EnvironmentFingerprint {
    return {
      id: 'production-incomeclarity-ddns-net',
      name: 'Income Clarity Production',
      type: 'production',
      hostname: 'incomeclarity.ddns.net',
      domain: 'incomeclarity.ddns.net',
      port: 443,
      timestamp: healthData.timestamp,
      version: healthData.version || '1.0.0',
      deploymentTarget: 'https://incomeclarity.ddns.net',
      isLive: true,
      configuration: {
        nodeEnv: 'production',
        localMode: false,
        liteProduction: true,
        databaseType: 'sqlite',
        redisEnabled: !!healthData.checks?.find((c: any) => c.name === 'redis')?.status === 'healthy',
        yodleeEnabled: !!healthData.checks?.find((c: any) => c.name === 'yodlee_api')?.status !== 'unhealthy',
        emailEnabled: !!healthData.checks?.find((c: any) => c.name === 'email_service')?.status === 'healthy',
        queueEnabled: !!healthData.checks?.find((c: any) => c.name === 'queue_system')?.status === 'healthy',
        metricsEnabled: !!healthData.checks?.find((c: any) => c.name === 'metrics_system')?.status === 'healthy',
        httpsEnabled: true
      },
      security: {
        secretsConfigured: true,
        corsEnabled: true,
        rateLimitingEnabled: true,
        httpsEnforced: true,
        authenticationRequired: true,
        encryptionEnabled: true
      },
      capabilities: ['production-ready', 'https', 'metrics', 'monitoring', 'authentication']
    };
  }

  /**
   * Get fallback production fingerprint when health check fails
   */
  private getFallbackProductionFingerprint(): EnvironmentFingerprint {
    return {
      id: 'production-fallback',
      name: 'Income Clarity Production (Unreachable)',
      type: 'production',
      hostname: 'incomeclarity.ddns.net',
      domain: 'incomeclarity.ddns.net',
      timestamp: new Date().toISOString(),
      version: 'unknown',
      deploymentTarget: 'https://incomeclarity.ddns.net',
      isLive: false, // Mark as not live if unreachable
      configuration: {
        nodeEnv: 'production',
        localMode: false,
        liteProduction: true,
        databaseType: 'sqlite',
        redisEnabled: false,
        yodleeEnabled: false,
        emailEnabled: false,
        queueEnabled: false,
        metricsEnabled: false,
        httpsEnabled: true
      },
      security: {
        secretsConfigured: true,
        corsEnabled: true,
        rateLimitingEnabled: true,
        httpsEnforced: true,
        authenticationRequired: true,
        encryptionEnabled: true
      },
      capabilities: ['unreachable']
    };
  }

  /**
   * Find differences between environments
   */
  private findEnvironmentDifferences(
    local: EnvironmentFingerprint, 
    production: EnvironmentFingerprint
  ): EnvironmentDifference[] {
    const differences: EnvironmentDifference[] = [];

    // Compare versions
    if (local.version !== production.version) {
      differences.push({
        category: 'version',
        field: 'version',
        localValue: local.version,
        productionValue: production.version,
        impact: 'high',
        recommendation: 'Synchronize application versions between environments'
      });
    }

    // Compare Git commits
    if (local.gitCommit && production.gitCommit && local.gitCommit !== production.gitCommit) {
      differences.push({
        category: 'git',
        field: 'commit',
        localValue: local.gitCommit?.substring(0, 8),
        productionValue: production.gitCommit?.substring(0, 8),
        impact: 'high',
        recommendation: 'Deploy latest changes to production'
      });
    }

    // Compare configurations
    Object.keys(local.configuration).forEach(key => {
      const localVal = (local.configuration as any)[key];
      const prodVal = (production.configuration as any)[key];
      
      if (localVal !== prodVal) {
        differences.push({
          category: 'configuration',
          field: key,
          localValue: localVal,
          productionValue: prodVal,
          impact: this.getConfigurationImpact(key),
          recommendation: `Verify ${key} configuration consistency`
        });
      }
    });

    return differences;
  }

  /**
   * Get impact level for configuration differences
   */
  private getConfigurationImpact(field: string): 'low' | 'medium' | 'high' | 'critical' {
    const highImpactFields = ['databaseType', 'httpsEnabled', 'nodeEnv'];
    const mediumImpactFields = ['redisEnabled', 'yodleeEnabled', 'emailEnabled'];
    
    if (highImpactFields.includes(field)) return 'high';
    if (mediumImpactFields.includes(field)) return 'medium';
    return 'low';
  }

  /**
   * Determine synchronization status
   */
  private determineSyncStatus(
    local: EnvironmentFingerprint,
    production: EnvironmentFingerprint,
    differences: EnvironmentDifference[]
  ): EnvironmentComparison['syncStatus'] {
    const criticalDifferences = differences.filter(d => d.impact === 'critical').length;
    const highDifferences = differences.filter(d => d.impact === 'high').length;
    
    if (criticalDifferences > 0) return 'outdated';
    if (highDifferences > 2) return 'drift';
    if (differences.length === 0) return 'synchronized';
    return 'drift';
  }

  /**
   * Assess overall risk level
   */
  private assessRiskLevel(differences: EnvironmentDifference[]): EnvironmentComparison['riskLevel'] {
    const criticalCount = differences.filter(d => d.impact === 'critical').length;
    const highCount = differences.filter(d => d.impact === 'high').length;
    const mediumCount = differences.filter(d => d.impact === 'medium').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0 || mediumCount > 3) return 'medium';
    return 'low';
  }

  /**
   * Validate deployment target
   */
  public async validateDeploymentTarget(targetUrl: string): Promise<{
    isValid: boolean;
    isReachable: boolean;
    responseTime: number;
    environment?: EnvironmentFingerprint;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${targetUrl}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;
      const isReachable = response.ok;

      if (!isReachable) {
        return {
          isValid: false,
          isReachable: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const healthData = await response.json();
      const environment = this.parseProductionHealthData(healthData);

      return {
        isValid: true,
        isReachable: true,
        responseTime,
        environment
      };

    } catch (error) {
      return {
        isValid: false,
        isReachable: false,
        responseTime: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }

  /**
   * Clear environment cache
   */
  public clearCache(): void {
    this.currentFingerprint = null;
    this.productionFingerprint = null;
    this.lastCheck = null;
    logger.info('Environment detection cache cleared');
  }
}

export const environmentDetectionService = EnvironmentDetectionService.getInstance();