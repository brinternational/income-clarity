import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Deployment Status API Endpoint
 * 
 * Provides deployment information for verification pipeline
 * Returns version, build time, commit, and deployment status
 */

interface DeploymentStatus {
  version: string;
  deployed: string;
  commit: string;
  healthy: boolean;
  build_time?: string;
  environment: string;
  uptime: number;
  node_version: string;
}

// Track server start time for uptime calculation
const SERVER_START_TIME = Date.now();

export async function GET(request: NextRequest) {
  try {
    // Get deployment information
    const deploymentStatus: DeploymentStatus = {
      version: getAppVersion(),
      deployed: getDeploymentTime(),
      commit: getGitCommit(),
      healthy: true,
      build_time: getBuildTime(),
      environment: process.env.NODE_ENV || 'unknown',
      uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      node_version: process.version
    };

    // Add additional deployment metadata if available
    const deploymentMetadata = getDeploymentMetadata();
    
    return NextResponse.json({
      ...deploymentStatus,
      ...deploymentMetadata,
      timestamp: new Date().toISOString(),
      status: 'operational'
    });

  } catch (error) {
    console.error('Deployment status error:', error);
    
    return NextResponse.json({
      version: 'unknown',
      deployed: 'unknown',
      commit: 'unknown',
      healthy: false,
      environment: process.env.NODE_ENV || 'unknown',
      uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      node_version: process.version,
      error: 'Failed to retrieve deployment status',
      timestamp: new Date().toISOString(),
      status: 'error'
    }, { status: 500 });
  }
}

/**
 * Get application version from package.json
 */
function getAppVersion(): string {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version || 'unknown';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error reading package.json:', error);
    return 'unknown';
  }
}

/**
 * Get deployment time from environment or file system
 */
function getDeploymentTime(): string {
  try {
    // Try environment variable first
    if (process.env.DEPLOY_TIME) {
      return process.env.DEPLOY_TIME;
    }
    
    // Try build time from Next.js build info
    const buildInfoPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    if (fs.existsSync(buildInfoPath)) {
      const stats = fs.statSync(buildInfoPath);
      return stats.mtime.toISOString();
    }
    
    // Try deployment manifest
    const manifestPath = path.join(process.cwd(), 'DEPLOYMENT-MANIFEST.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return manifest.deployment?.timestamp || 'unknown';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error getting deployment time:', error);
    return 'unknown';
  }
}

/**
 * Get Git commit hash
 */
function getGitCommit(): string {
  try {
    // Try environment variable first
    if (process.env.GIT_COMMIT) {
      return process.env.GIT_COMMIT;
    }
    
    // Try reading from deployment manifest
    const manifestPath = path.join(process.cwd(), 'DEPLOYMENT-MANIFEST.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return manifest.git?.commit || 'unknown';
    }
    
    // Try reading from .git directory (development)
    const gitHeadPath = path.join(process.cwd(), '.git', 'HEAD');
    if (fs.existsSync(gitHeadPath)) {
      const headContent = fs.readFileSync(gitHeadPath, 'utf8').trim();
      
      if (headContent.startsWith('ref: ')) {
        // It's a reference to a branch
        const refPath = headContent.substring(5);
        const refFilePath = path.join(process.cwd(), '.git', refPath);
        
        if (fs.existsSync(refFilePath)) {
          return fs.readFileSync(refFilePath, 'utf8').trim();
        }
      } else {
        // It's a direct commit hash
        return headContent;
      }
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error getting git commit:', error);
    return 'unknown';
  }
}

/**
 * Get build time
 */
function getBuildTime(): string {
  try {
    // Try Next.js build info
    const buildInfoPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    if (fs.existsSync(buildInfoPath)) {
      const stats = fs.statSync(buildInfoPath);
      return stats.mtime.toISOString();
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error getting build time:', error);
    return 'unknown';
  }
}

/**
 * Get additional deployment metadata
 */
function getDeploymentMetadata() {
  try {
    const manifestPath = path.join(process.cwd(), 'DEPLOYMENT-MANIFEST.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      return {
        deployment_metadata: {
          deployer: manifest.deployment?.deployer,
          target_url: manifest.deployment?.target_url,
          git_branch: manifest.git?.branch,
          git_message: manifest.git?.commit_message,
          files_count: manifest.files?.total_count,
          app_name: manifest.application?.name
        }
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error getting deployment metadata:', error);
    return {};
  }
}

/**
 * Handle unsupported methods
 */
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}