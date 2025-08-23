/**
 * 📊 Real-time Deployment Monitoring Status API
 * Provides current monitoring status and metrics
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DeploymentStatus {
  timestamp: string;
  event_type: string;
  message: string;
  uptime: number;
  monitor_pid: number;
  server_status: 'healthy' | 'unhealthy';
  last_deployment: string;
}

interface HealthMetrics {
  status: 'healthy' | 'unhealthy' | 'unknown';
  response_time?: number;
  last_check: string;
}

interface MonitoringStatus {
  monitor: {
    running: boolean;
    pid?: number;
    uptime?: number;
    last_event?: string;
  };
  server: HealthMetrics;
  deployment: {
    last_deployment: string | null;
    build_id: string | null;
    git_commit: string | null;
  };
  performance: {
    avg_response_time: number;
    slow_requests_24h: number;
  };
  alerts: {
    total_24h: number;
    last_alert?: string;
  };
  files: {
    changes_24h: number;
    monitored_paths: string[];
  };
}

async function getMonitorStatus(): Promise<DeploymentStatus | null> {
  try {
    const statusPath = path.join(process.cwd(), '.deployment-status.json');
    const statusContent = await fs.readFile(statusPath, 'utf8');
    return JSON.parse(statusContent);
  } catch (error) {
    return null;
  }
}

async function getMonitorPid(): Promise<number | null> {
  try {
    const pidPath = path.join(process.cwd(), '.deployment-monitor.pid');
    const pidContent = await fs.readFile(pidPath, 'utf8');
    return parseInt(pidContent.trim());
  } catch (error) {
    return null;
  }
}

async function getBuildId(): Promise<string | null> {
  try {
    const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    const buildId = await fs.readFile(buildIdPath, 'utf8');
    return buildId.trim();
  } catch (error) {
    return null;
  }
}

async function getGitCommit(): Promise<string | null> {
  try {
    const gitHeadPath = path.join(process.cwd(), '.git', 'HEAD');
    const headContent = await fs.readFile(gitHeadPath, 'utf8');
    
    if (headContent.startsWith('ref: ')) {
      // Branch reference
      const refPath = headContent.replace('ref: ', '').trim();
      const refFilePath = path.join(process.cwd(), '.git', refPath);
      const commit = await fs.readFile(refFilePath, 'utf8');
      return commit.trim().substring(0, 8);
    } else {
      // Direct commit hash
      return headContent.trim().substring(0, 8);
    }
  } catch (error) {
    return null;
  }
}

async function getRecentAlerts(): Promise<{ total: number; last?: string }> {
  try {
    const alertsPath = path.join(process.cwd(), 'alerts.log');
    const alertsContent = await fs.readFile(alertsPath, 'utf8');
    const lines = alertsContent.split('\n').filter(line => line.trim());
    
    // Filter last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentAlerts = lines.filter(line => {
      const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      if (match) {
        const alertDate = new Date(match[1]);
        return alertDate > yesterday;
      }
      return false;
    });

    return {
      total: recentAlerts.length,
      last: recentAlerts[recentAlerts.length - 1] || undefined
    };
  } catch (error) {
    return { total: 0 };
  }
}

async function getFileChanges(): Promise<{ changes: number; paths: string[] }> {
  const monitoredPaths = [
    'app',
    'components', 
    'lib',
    'styles',
    'public',
    '.env',
    'package.json'
  ];

  try {
    // Check monitor log for recent file changes
    const monitorLogPath = path.join(process.cwd(), 'monitor.log');
    const logContent = await fs.readFile(monitorLogPath, 'utf8');
    const lines = logContent.split('\n');
    
    // Count file changes in last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentChanges = lines.filter(line => {
      if (!line.includes('CHANGE') || !line.includes('File changed:')) return false;
      
      const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      if (match) {
        const changeDate = new Date(match[1]);
        return changeDate > yesterday;
      }
      return false;
    });

    return {
      changes: recentChanges.length,
      paths: monitoredPaths
    };
  } catch (error) {
    return {
      changes: 0,
      paths: monitoredPaths
    };
  }
}

async function getServerHealth(): Promise<HealthMetrics> {
  const startTime = Date.now();
  
  try {
    // Check internal health endpoint
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
      headers: { 'User-Agent': 'deployment-monitor' }
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      response_time: responseTime,
      last_check: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      response_time: Date.now() - startTime,
      last_check: new Date().toISOString()
    };
  }
}

export async function GET() {
  try {
    const [
      monitorStatus,
      monitorPid,
      buildId,
      gitCommit,
      recentAlerts,
      fileChanges,
      serverHealth
    ] = await Promise.all([
      getMonitorStatus(),
      getMonitorPid(),
      getBuildId(), 
      getGitCommit(),
      getRecentAlerts(),
      getFileChanges(),
      getServerHealth()
    ]);

    const isMonitorRunning = monitorPid !== null && monitorStatus !== null;

    const status: MonitoringStatus = {
      monitor: {
        running: isMonitorRunning,
        pid: monitorPid || undefined,
        uptime: monitorStatus?.uptime,
        last_event: monitorStatus?.message
      },
      server: serverHealth,
      deployment: {
        last_deployment: monitorStatus?.last_deployment || null,
        build_id: buildId,
        git_commit: gitCommit
      },
      performance: {
        avg_response_time: serverHealth.response_time || 0,
        slow_requests_24h: 0 // TODO: Track this in monitor
      },
      alerts: {
        total_24h: recentAlerts.total,
        last_alert: recentAlerts.last
      },
      files: {
        changes_24h: fileChanges.changes,
        monitored_paths: fileChanges.paths
      }
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status
    });

  } catch (error) {
    console.error('Error getting monitoring status:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve monitoring status',
      timestamp: new Date().toISOString(),
      status: {
        monitor: { running: false },
        server: { status: 'unknown', last_check: new Date().toISOString() },
        deployment: { last_deployment: null, build_id: null, git_commit: null },
        performance: { avg_response_time: 0, slow_requests_24h: 0 },
        alerts: { total_24h: 0 },
        files: { changes_24h: 0, monitored_paths: [] }
      }
    }, { status: 500 });
  }
}