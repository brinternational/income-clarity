/**
 * Deployment Tracking Utilities
 * 
 * Provides utilities for tracking deployments, creating manifests,
 * and verifying deployment success across environments.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DeploymentManifest {
  deployment: {
    timestamp: string;
    deployer: string;
    environment: string;
    target_url: string;
  };
  application: {
    name: string;
    version: string;
    build_time: string;
  };
  git: {
    commit: string;
    branch: string;
    uncommitted_changes: number;
    commit_message: string;
  };
  files: {
    total_count: number;
    checksums: Record<string, string>;
  };
  verification: {
    expected_features: string[];
    critical_endpoints: string[];
  };
}

export interface DeploymentStatus {
  version: string;
  deployed: string;
  commit: string;
  healthy: boolean;
  build_time?: string;
  environment: string;
  uptime: number;
  node_version: string;
}

export interface VerificationResult {
  success: boolean;
  timestamp: string;
  checks: {
    endpoints: { [key: string]: { status: number; success: boolean } };
    features: { [key: string]: boolean };
    version_match: boolean;
    commit_match: boolean;
  };
  errors: string[];
  warnings: string[];
}

export class DeploymentTracker {
  private manifestPath: string;
  private baselineDir: string;

  constructor(workingDir: string = process.cwd()) {
    this.manifestPath = path.join(workingDir, 'DEPLOYMENT-MANIFEST.json');
    this.baselineDir = path.join('/tmp', 'deployment-verification');
  }

  /**
   * Create a comprehensive deployment manifest
   */
  async createManifest(targetUrl: string): Promise<DeploymentManifest> {
    const manifest: DeploymentManifest = {
      deployment: {
        timestamp: new Date().toISOString(),
        deployer: await this.getDeployer(),
        environment: process.env.NODE_ENV || 'unknown',
        target_url: targetUrl
      },
      application: {
        name: await this.getAppName(),
        version: await this.getAppVersion(),
        build_time: new Date().toISOString()
      },
      git: {
        commit: await this.getGitCommit(),
        branch: await this.getGitBranch(),
        uncommitted_changes: await this.getUncommittedChanges(),
        commit_message: await this.getCommitMessage()
      },
      files: {
        total_count: await this.getFileCount(),
        checksums: await this.getFileChecksums()
      },
      verification: {
        expected_features: [
          'authentication',
          'dashboard',
          'super-cards',
          'performance-hub',
          'progressive-disclosure'
        ],
        critical_endpoints: [
          '/api/health',
          '/api/auth/me',
          '/api/super-cards/performance-hub',
          '/api/deployment/status',
          '/dashboard',
          '/'
        ]
      }
    };

    // Save manifest to file
    await this.saveManifest(manifest);
    return manifest;
  }

  /**
   * Save manifest to file
   */
  async saveManifest(manifest: DeploymentManifest): Promise<void> {
    try {
      const manifestData = JSON.stringify(manifest, null, 2);
      await fs.promises.writeFile(this.manifestPath, manifestData, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save manifest: ${error}`);
    }
  }

  /**
   * Load existing manifest
   */
  async loadManifest(): Promise<DeploymentManifest | null> {
    try {
      if (!fs.existsSync(this.manifestPath)) {
        return null;
      }

      const manifestData = await fs.promises.readFile(this.manifestPath, 'utf8');
      return JSON.parse(manifestData) as DeploymentManifest;
    } catch (error) {
      console.error('Failed to load manifest:', error);
      return null;
    }
  }

  /**
   * Verify deployment against manifest
   */
  async verifyDeployment(targetUrl: string): Promise<VerificationResult> {
    const result: VerificationResult = {
      success: false,
      timestamp: new Date().toISOString(),
      checks: {
        endpoints: {},
        features: {},
        version_match: false,
        commit_match: false
      },
      errors: [],
      warnings: []
    };

    try {
      const manifest = await this.loadManifest();
      if (!manifest) {
        result.errors.push('No deployment manifest found');
        return result;
      }

      // Test endpoints
      result.checks.endpoints = await this.testEndpoints(targetUrl, manifest.verification.critical_endpoints);

      // Get deployment status from target
      const deploymentStatus = await this.getDeploymentStatus(targetUrl);
      
      if (deploymentStatus) {
        // Check version match
        result.checks.version_match = deploymentStatus.version === manifest.application.version;
        if (!result.checks.version_match) {
          result.warnings.push(`Version mismatch: expected ${manifest.application.version}, got ${deploymentStatus.version}`);
        }

        // Check commit match
        result.checks.commit_match = deploymentStatus.commit === manifest.git.commit;
        if (!result.checks.commit_match) {
          result.warnings.push(`Commit mismatch: expected ${manifest.git.commit}, got ${deploymentStatus.commit}`);
        }
      } else {
        result.errors.push('Could not retrieve deployment status from target');
      }

      // Test features
      result.checks.features = await this.testFeatures(targetUrl, manifest.verification.expected_features);

      // Determine overall success
      const endpointSuccess = Object.values(result.checks.endpoints).every(check => check.success);
      const featureSuccess = Object.values(result.checks.features).every(success => success);
      
      result.success = endpointSuccess && featureSuccess && result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Verification failed: ${error}`);
    }

    return result;
  }

  /**
   * Test critical endpoints
   */
  private async testEndpoints(baseUrl: string, endpoints: string[]): Promise<{ [key: string]: { status: number; success: boolean } }> {
    const results: { [key: string]: { status: number; success: boolean } } = {};

    for (const endpoint of endpoints) {
      try {
        const url = baseUrl + endpoint;
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 'User-Agent': 'DeploymentVerifier/1.0' }
        });
        
        results[endpoint] = {
          status: response.status,
          success: response.status >= 200 && response.status < 400
        };
      } catch (error) {
        results[endpoint] = {
          status: 0,
          success: false
        };
      }
    }

    return results;
  }

  /**
   * Test expected features
   */
  private async testFeatures(baseUrl: string, features: string[]): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    for (const feature of features) {
      try {
        switch (feature) {
          case 'authentication':
            // Test that auth endpoint exists (401 expected for unauthenticated)
            const authResponse = await fetch(`${baseUrl}/api/auth/me`);
            results[feature] = authResponse.status === 401 || authResponse.status === 200;
            break;

          case 'dashboard':
            // Test that dashboard exists (redirect to login expected)
            const dashResponse = await fetch(`${baseUrl}/dashboard`);
            results[feature] = dashResponse.status >= 200 && dashResponse.status < 400;
            break;

          case 'super-cards':
            // Test super cards API
            const cardsResponse = await fetch(`${baseUrl}/api/super-cards/performance-hub`);
            results[feature] = cardsResponse.status === 401 || cardsResponse.status === 200;
            break;

          case 'performance-hub':
            // Test performance hub endpoint
            const perfResponse = await fetch(`${baseUrl}/api/super-cards/performance-hub`);
            results[feature] = perfResponse.status === 401 || perfResponse.status === 200;
            break;

          case 'progressive-disclosure':
            // Test dashboard with progressive disclosure parameters
            const progResponse = await fetch(`${baseUrl}/dashboard?view=hero-view&card=performance`);
            results[feature] = progResponse.status >= 200 && progResponse.status < 400;
            break;

          default:
            results[feature] = false;
        }
      } catch (error) {
        results[feature] = false;
      }
    }

    return results;
  }

  /**
   * Get deployment status from target URL
   */
  private async getDeploymentStatus(baseUrl: string): Promise<DeploymentStatus | null> {
    try {
      const response = await fetch(`${baseUrl}/api/deployment/status`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Utility methods for gathering deployment information
   */
  private async getDeployer(): Promise<string> {
    try {
      const { stdout: username } = await execAsync('whoami');
      const { stdout: hostname } = await execAsync('hostname');
      return `${username.trim()}@${hostname.trim()}`;
    } catch {
      return 'unknown';
    }
  }

  private async getAppName(): Promise<string> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
      return packageJson.name || 'income-clarity-app';
    } catch {
      return 'income-clarity-app';
    }
  }

  private async getAppVersion(): Promise<string> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'));
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  private async getGitCommit(): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD');
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  private async getGitBranch(): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  private async getUncommittedChanges(): Promise<number> {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      return stdout.trim().split('\n').filter(line => line.trim()).length;
    } catch {
      return 0;
    }
  }

  private async getCommitMessage(): Promise<string> {
    try {
      const { stdout } = await execAsync('git log -1 --pretty=format:"%s"');
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  private async getFileCount(): Promise<number> {
    try {
      const { stdout } = await execAsync('find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) | wc -l');
      return parseInt(stdout.trim()) || 0;
    } catch {
      return 0;
    }
  }

  private async getFileChecksums(): Promise<Record<string, string>> {
    try {
      const checksums: Record<string, string> = {};
      const { stdout } = await execAsync('find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) | head -20');
      const files = stdout.trim().split('\n').filter(line => line.trim());

      for (const file of files) {
        try {
          const { stdout: checksum } = await execAsync(`md5sum "${file}"`);
          const hash = checksum.split(' ')[0];
          checksums[file] = hash;
        } catch {
          // Skip files that can't be checksummed
        }
      }

      return checksums;
    } catch {
      return {};
    }
  }
}