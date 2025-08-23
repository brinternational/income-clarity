/**
 * 🚨 Real-time Deployment Monitoring Utilities
 * TypeScript utilities for deployment monitoring and real-time updates
 */

export interface DeploymentStatus {
  timestamp: string;
  event_type: 'monitor_started' | 'file_change' | 'git_commit' | 'build_change' | 
             'server_healthy' | 'server_unhealthy' | 'verification_success' | 
             'verification_failed' | 'slow_response';
  message: string;
  uptime: number;
  monitor_pid: number;
  server_status: 'healthy' | 'unhealthy';
  last_deployment: string;
}

export interface DeploymentEvent {
  id: string;
  timestamp: string;
  type: 'deployment' | 'build' | 'health' | 'performance' | 'file_change' | 'git' | 'alert';
  level: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface MonitoringMetrics {
  uptime: number;
  events_count: number;
  last_deployment: string | null;
  server_health: 'healthy' | 'unhealthy' | 'unknown';
  response_time: number;
  build_id: string | null;
  git_commit: string | null;
  file_changes_24h: number;
  alerts_sent: number;
}

export class DeploymentMonitor {
  private events: DeploymentEvent[] = [];
  private subscribers: Set<(event: DeploymentEvent) => void> = new Set();
  private maxEvents = 1000; // Keep last 1000 events

  /**
   * Add a new deployment event
   */
  addEvent(event: Omit<DeploymentEvent, 'id' | 'timestamp'>): DeploymentEvent {
    const newEvent: DeploymentEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      ...event
    };

    // Add to events array
    this.events.unshift(newEvent);

    // Trim to max events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Notify subscribers
    this.notifySubscribers(newEvent);

    return newEvent;
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(callback: (event: DeploymentEvent) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get recent events
   */
  getEvents(limit = 50): DeploymentEvent[] {
    return this.events.slice(0, limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: DeploymentEvent['type'], limit = 50): DeploymentEvent[] {
    return this.events.filter(event => event.type === type).slice(0, limit);
  }

  /**
   * Get events by level
   */
  getEventsByLevel(level: DeploymentEvent['level'], limit = 50): DeploymentEvent[] {
    return this.events.filter(event => event.level === level).slice(0, limit);
  }

  /**
   * Get monitoring metrics
   */
  getMetrics(): MonitoringMetrics {
    const now = Date.now();
    const day24h = 24 * 60 * 60 * 1000;
    const recent24h = this.events.filter(event => 
      now - new Date(event.timestamp).getTime() < day24h
    );

    // Get latest deployment event
    const lastDeployment = this.events.find(event => 
      event.type === 'deployment' || event.type === 'build'
    );

    // Get latest server health event
    const lastHealthEvent = this.events.find(event => 
      event.type === 'health'
    );

    // Get latest performance event for response time
    const lastPerfEvent = this.events.find(event => 
      event.type === 'performance' && event.metadata?.response_time
    );

    return {
      uptime: this.getUptime(),
      events_count: this.events.length,
      last_deployment: lastDeployment?.timestamp || null,
      server_health: this.getServerHealth(),
      response_time: lastPerfEvent?.metadata?.response_time || 0,
      build_id: this.getBuildId(),
      git_commit: this.getGitCommit(),
      file_changes_24h: recent24h.filter(e => e.type === 'file_change').length,
      alerts_sent: recent24h.filter(e => e.type === 'alert').length
    };
  }

  /**
   * Clear old events
   */
  clearEvents(olderThanHours = 24): number {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const originalLength = this.events.length;
    
    this.events = this.events.filter(event => 
      new Date(event.timestamp).getTime() > cutoff
    );

    return originalLength - this.events.length;
  }

  /**
   * Export events for analysis
   */
  exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'timestamp,type,level,title,message';
      const rows = this.events.map(event => 
        `${event.timestamp},${event.type},${event.level},"${event.title}","${event.message}"`
      );
      return [headers, ...rows].join('\n');
    }
    
    return JSON.stringify(this.events, null, 2);
  }

  // Private methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifySubscribers(event: DeploymentEvent): void {
    this.subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  private getUptime(): number {
    // Calculate uptime based on first event timestamp
    if (this.events.length === 0) return 0;
    
    const firstEvent = this.events[this.events.length - 1];
    return Date.now() - new Date(firstEvent.timestamp).getTime();
  }

  private getServerHealth(): 'healthy' | 'unhealthy' | 'unknown' {
    const healthEvent = this.events.find(event => 
      event.type === 'health' && (event.title.includes('healthy') || event.title.includes('unhealthy'))
    );
    
    if (!healthEvent) return 'unknown';
    
    return healthEvent.title.toLowerCase().includes('unhealthy') ? 'unhealthy' : 'healthy';
  }

  private getBuildId(): string | null {
    const buildEvent = this.events.find(event => 
      event.type === 'build' && event.metadata?.build_id
    );
    
    return buildEvent?.metadata?.build_id || null;
  }

  private getGitCommit(): string | null {
    const gitEvent = this.events.find(event => 
      event.type === 'git' && event.metadata?.commit
    );
    
    return gitEvent?.metadata?.commit || null;
  }
}

// Singleton instance for global use
export const deploymentMonitor = new DeploymentMonitor();

/**
 * Utility functions for creating deployment events
 */
export const DeploymentEventCreators = {
  fileChange: (filePath: string, changeType: string): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'file_change',
    level: 'info',
    title: 'File Changed',
    message: `${filePath} (${changeType})`,
    metadata: { filePath, changeType }
  }),

  buildComplete: (buildId: string): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'build',
    level: 'success',
    title: 'Build Completed',
    message: `Build ${buildId} completed successfully`,
    metadata: { build_id: buildId }
  }),

  deploymentStarted: (version?: string): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'deployment',
    level: 'info',
    title: 'Deployment Started',
    message: version ? `Deploying version ${version}` : 'Deployment process initiated',
    metadata: { version }
  }),

  deploymentSuccess: (version?: string): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'deployment',
    level: 'success',
    title: 'Deployment Successful',
    message: version ? `Version ${version} deployed successfully` : 'Deployment completed successfully',
    metadata: { version }
  }),

  deploymentFailed: (error: string): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'deployment',
    level: 'error',
    title: 'Deployment Failed',
    message: error,
    metadata: { error }
  }),

  serverHealthy: (): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'health',
    level: 'success',
    title: 'Server Healthy',
    message: 'Server is responding normally'
  }),

  serverUnhealthy: (error?: string): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'health',
    level: 'error',
    title: 'Server Unhealthy',
    message: error || 'Server is not responding',
    metadata: { error }
  }),

  performanceWarning: (responseTime: number): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'performance',
    level: 'warning',
    title: 'Performance Warning',
    message: `Slow response time: ${responseTime}ms`,
    metadata: { response_time: responseTime }
  }),

  gitCommit: (commit: string, message: string): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'git',
    level: 'info',
    title: 'Git Commit',
    message: message,
    metadata: { commit }
  }),

  alertSent: (channel: string, alertType: string): Omit<DeploymentEvent, 'id' | 'timestamp'> => ({
    type: 'alert',
    level: 'info',
    title: 'Alert Sent',
    message: `${alertType} alert sent via ${channel}`,
    metadata: { channel, alert_type: alertType }
  })
};

/**
 * React Hook for monitoring events
 */
export const useDeploymentMonitor = () => {
  const [events, setEvents] = React.useState<DeploymentEvent[]>([]);
  const [metrics, setMetrics] = React.useState<MonitoringMetrics | null>(null);

  React.useEffect(() => {
    // Initial load
    setEvents(deploymentMonitor.getEvents(50));
    setMetrics(deploymentMonitor.getMetrics());

    // Subscribe to new events
    const unsubscribe = deploymentMonitor.subscribe((event) => {
      setEvents(current => [event, ...current.slice(0, 49)]);
      setMetrics(deploymentMonitor.getMetrics());
    });

    return unsubscribe;
  }, []);

  return {
    events,
    metrics,
    getEventsByType: (type: DeploymentEvent['type']) => deploymentMonitor.getEventsByType(type),
    getEventsByLevel: (level: DeploymentEvent['level']) => deploymentMonitor.getEventsByLevel(level),
    addEvent: (event: Omit<DeploymentEvent, 'id' | 'timestamp'>) => deploymentMonitor.addEvent(event)
  };
};

// Re-export React import for the hook
import * as React from 'react';